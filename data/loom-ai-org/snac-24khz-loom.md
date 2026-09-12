# loom-ai-org/snac-24khz-loom

## Resumen

SNAC 24 kHz (decoder) es un codec neuronal de audio exportado al formato GGUF de loom.cpp por el proyecto loom-ai-org. Se trata de la mitad decodificadora del modelo original `hubertsiuzdak/snac_24khz`: recibe secuencias de tokens de codigo y las reconstruye como forma de onda a 24 kHz. No es un modelo de lenguaje ni un generador de audio condicionado por texto; es la pieza que convierte la salida simbolica de un modelo autorregresivo en senal de audio reproducible.

La arquitectura es un Multi-Scale Neural Audio Codec, un esquema de cuantizacion vectorial residual en el que tres codebooks operan a distintas tasas de trama (`vq_strides` de `[4, 2, 1]`). El resultado es una representacion de 7 identificadores por trama mas gruesa, a 11,72 tramas por segundo, equivalente a 0,98 kbps. El decoder ocupa 13.128.769 parametros y el repositorio completo pesa 0,1 GB, lo que lo situa en la categoria de modelos que caben holgadamente en cualquier GPU de consumo e incluso en CPU.

Su relevancia practica es doble. Por un lado, es la pieza de decodificacion que necesitan las familias de modelos generativos de voz que emiten tokens SNAC (Orpheus y similares) para producir audio final. Por otro, el export es autocontenido: el propio GGUF declara sus topologias de grafo, sus hiperparametros de codec y el driver de ejecucion, de modo que el consumidor no necesita consultar el articulo original ni el codigo de PyTorch para conocer la geometria del codec.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multi-Scale Neural Audio Codec (SNAC), mitad decoder; cuantizacion vectorial residual con 3 codebooks y `vq_strides` `[4, 2, 1]` |
| Parametros totales | 13.128.769 (13,1 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); opera por tramas de 11,72 fps con 7 identificadores por trama |
| Tipos de cuantizacion | no disponible (el repositorio distribuye un unico fichero GGUF; la model card no declara variantes de cuantizacion) |
| Idiomas soportados | no aplica (codec de audio sin vocabulario ni idioma asociado) |
| Licencia | MIT |
| Formato de pesos | GGUF (`snac-24khz.gguf`), exportado con loom-exporter |
| Frecuencia de muestreo | 24.000 Hz |
| Bitrate | 0,98 kbps |
| Codebooks | 3 (multi-escala) |
| Identificadores por trama | 7 (columna 0 = codebook 0; columnas 1-2 = codebook 1; columnas 3-6 = codebook 2) |
| Muestras por trama | 2.048 |
| Modelo base | `hubertsiuzdak/snac_24khz` |
| Libreria de ejecucion | `loom-py-rt` (PyPI) sobre loom.cpp |
| Tarea declarada | text-to-audio (etiqueta upstream; en la practica codes-to-audio) |

## Arquitectura y entrenamiento

El modelo es un codec neuronal multi-escala basado en cuantizacion vectorial residual. Tres codebooks trabajan a resoluciones temporales distintas: el codebook 0 emite un codigo alli donde el codebook 2 emite cuatro, siguiendo los strides `[4, 2, 1]`. Esa jerarquia permite capturar estructura gruesa y detalle fino en la misma representacion, con un coste total de 0,98 kbps. El decoder reconstruye 2.048 muestras por trama mas gruesa a 24 kHz, con 11,72 tramas por segundo.

El decode es estocastico: el decoder original anade `randn * linear(x)` en cuatro puntos del grafo. Como un grafo estatico no puede muestrear ruido por si mismo, el driver del export lo genera y lo inyecta, con semilla controlada por el parametro `seed=` (valor fijo por defecto). Esto hace que dos ejecuciones con los mismos codigos produzcan la misma onda salvo que se pida explicitamente una semilla distinta. Eliminar ese ruido daria la media de la distribucion, que segun la model card se aleja un 2,4 % en RMS relativo y suena notablemente mas apagada en agudos; el export no ofrece esa opcion.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens de audio vistos ni el procedimiento de optimizacion en la informacion proporcionada. Los pesos son los del checkpoint original sin modificar: el trabajo de este repositorio es exclusivamente de empaquetado y de definicion del contrato de ejecucion. La innovacion destacable respecto a otros exports es que el GGUF se autodescribe: expone hiperparametros consultables en tiempo de ejecucion (`codec.n_codebooks`, `codec.codebook_size`, `codec.frame_rate`), el contrato de frecuencia de muestreo y el codigo fuente del driver embebido.

## Capacidades

- Decodificacion de codigos a forma de onda: entrada de identificadores SNAC en disposicion frame-major y salida de audio a 24 kHz. Es la unica direccion que implementa este fichero.
- Consulta de geometria del codec: el modelo expone `n_codebooks`, `codebook_size`, `frame_rate` y `sample_rate` como hiperparametros leidos del propio GGUF.
- Acepta entrada en formato de lista plana o de lista de tramas; si la longitud no corresponde a un numero entero de tramas, la rechaza en lugar de reinterpretarla con otra anchura.
- Decodificacion determinista con control de semilla: `codes2speech.infer(codes)` reproduce la misma onda en ejecuciones sucesivas, y `seed=99` produce una extraccion distinta.
- No implementa codificacion (audio a codigos). La model card indica que `encode` corresponde a otro contrato, con otro par de modalidades, y que se debe usar el checkpoint upstream para esa direccion.
- No soporta tool calling ni function calling, no es un modelo de agentes y no tiene modo de razonamiento: no es un modelo de lenguaje.
- No soporta multiples idiomas en el sentido linguistico; el audio que reconstruye puede contener voz en cualquier idioma, pero el modelo no tiene conocimiento linguistico alguno.
- No implementa reordenacion del patron de retardo: si los codigos provienen de un modelo autorregresivo que desplaza la corriente *k* en *k* pasos, el alineado es responsabilidad de quien llama.
- Capacidad especial: el fichero embebe un driver documentado y consultable mediante `model.driver_source`, que es la referencia autorizada sobre los argumentos aceptados.

## Casos de uso

- Sintesis de voz en pipelines TTS con modelo autorregresivo: un modelo que emite tokens SNAC (por ejemplo, la familia de Orpheus) genera los codigos y este decoder los convierte en onda a 24 kHz. Es el uso principal para el que se exporto la mitad decode.
- Voz conversacional en tiempo real: al operar a 0,98 kbps y 11,72 tramas por segundo, la carga de decodificacion es minima y permite mantener interactividad en un bucle de turnos sin que el codec sea el cuello de botella.
- Transmision de audio en banda muy estrecha: transportar los 7 identificadores por trama en lugar de la senal PCM reduce el ancho de banda de forma drastica; el decoder del extremo receptor reconstruye el audio con su ruido de fondo reconstruido pero audible.
- Almacenamiento eficiente de archivos de voz: guardar los codigos y decodificar bajo demanda en lugar de almacenar PCM, util para archivos de gran volumen donde el coste de almacenamiento domina sobre la fidelidad absoluta.
- Inferencia en el borde y en dispositivos con poca memoria: con 13,1 M de parametros y un repositorio de 0,1 GB, el modelo cabe en CPU o en GPU integrada, lo que habilita decodificacion local en moviles, sistemas embebidos o navegador.
- Prototipado de investigacion en codecs neuronales: sirve para comparar la calidad de reconstruccion del esquema multi-escala de SNAC frente a otros codecs, y para estudiar el efecto del ruido estocastico inyectado en las cuatro etapas del decoder.
- Evaluacion de modelos generativos de audio: permite montar la cadena completa (codigos a onda) sin depender de PyTorch, integrando la decodificacion en un runtime ligero y reproducible con semilla fija para comparaciones justas.
- Integracion en sistemas de agentes de voz: como etapa final de una cadena ASR a LLM a emisor de codigos a waveform, cuando el componente que decide la respuesta emite directamente tokens de codec.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas objetivas de calidad de reconstruccion (PESQ, STOI, MUSHRA u otras) ni comparaciones numericas con codecs alternativos. El unico dato cuantitativo de rendimiento declarado es la desviacion de 2,4 % en RMS relativo al sustituir el muestreo estocastico por su media, presentada como justificacion de por que el export no ofrece decodificacion determinista sin ruido.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 50 MB en fp32, 25 MB en fp16 y 13 MB en 8 bits, calculado a partir de los 13,1 M de parametros. Son estimaciones derivadas del recuento de parametros, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre es suficiente. No se requiere A100, H100 ni una RTX 4090; el modelo no aprovecha esa clase de hardware.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo actual, en GPU integrada y en CPU. El cuello de botella real del sistema estara en el modelo que emita los tokens, no en el decoder.
- Opciones de despliegue: runtime `loom-py-rt` (instalable con `pip install -U "loom-py-rt[hub]"`) sobre el motor loom.cpp, cargando el GGUF con `loom.Model.from_pretrained(...)`. No se declaran integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles. La informacion proporcionada no incluye mediciones de tiempo de decodificacion ni de tiempo real factor alcanzable.
- Almacenamiento: el repositorio completo ocupa 0,1 GB, dominado por el fichero GGUF.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| loom-ai-org/snac-24khz-loom | 13,1 M (mitad decoder) | GGUF para loom.cpp | MIT | Export autocontenido con driver embebido e hiperparametros consultables |
| hubertsiuzdak/snac_24khz | no disponible en la informacion proporcionada | PyTorch (checkpoint original) | MIT | Modelo base; incluye encoder y decoder; pesos sin modificar en este export |
| Codecs neuronales de la misma familia (EnCodec, DAC, SoundStream) | no disponible | no disponible | no disponible | Alternativas de la misma categoria funcional (codec neuronal con cuantizacion vectorial); no se dispone de datos verificados en la informacion proporcionada |

El unico modelo comparable con datos concretos es el checkpoint upstream, del que este repositorio es un reempaquetado directo. La diferencia funcional es que el export solo cubre la mitad decode, mientras que el original incluye ambas direcciones. Para comparaciones cuantitativas con EnCodec, DAC o SoundStream seria necesario consultar sus respectivas fichas y articulos, que no forman parte de la informacion disponible.

## Limitaciones y advertencias

- Solo incluye la mitad decode. La operacion de codificacion (audio a codigos) no esta implementada; para esa direccion hay que recurrir al checkpoint upstream.
- El decode es estocastico y depende de una semilla. Aunque el valor por defecto es fijo, cualquier cambio de semilla produce una onda distinta para los mismos codigos, lo que afecta a la reproducibilidad bit a bit entre configuraciones.
- El suelo de ruido se reconstruye, no se reproduce. A 0,98 kbps, un siseo de fondo constante en la fuente vuelve ligeramente modulado y puede percibirse como una onda lenta bajo los pasajes silenciosos. La model card atribuye este comportamiento al modelo original y no al export.
- No corrige el patron de retardo. Los codigos deben entregarse ya alineados; si proceden de un modelo autorregresivo que desplaza cada corriente, el reordenado es responsabilidad de quien llama.
- La disposicion de los identificadores es estricta: frame-major, con las columnas en orden level-major. Un modelo autorregresivo que emita los 7 tokens en orden depth-first (como Orpheus y sus derivados) requiere reordenacion explicita previa.
- La lista plana de entrada se rechaza si no corresponde a un numero entero de tramas, en lugar de reinterpretarse con otra anchura. Es una proteccion contra errores, pero obliga a controlar la longitud en el codigo cliente.
- No tiene capacidades de lenguaje: no genera texto, no razona, no soporta tool calling y no mantiene contexto conversacional.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero si existe riesgo de artefactos de reconstruccion (ruido modulado, perdida de detalle en agudos) que no estan presentes en la senal original.
- Sesgos: no se declaran sesgos especificos en la informacion proporcionada. Al ser un codec entrenado sobre audio, su comportamiento dependera de la distribucion de los datos de entrenamiento del modelo base, no documentada aqui.
- Licencia MIT heredada del modelo base, sin restricciones declaradas para uso comercial. La model card indica que tanto el repositorio upstream como el paquete `github.com/hubertsiuzdak/snac` son MIT.
- En produccion conviene tener en cuenta que el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y que la libreria de ejecucion (`loom-py-rt`) es especifica de este ecosistema, lo que reduce las alternativas de despliegue y el soporte de la comunidad.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/loom-ai-org/snac-24khz-loom
- Modelo base: https://huggingface.co/hubertsiuzdak/snac_24khz
- Motor de ejecucion loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Herramienta de exportacion loom-exporter: https://github.com/loom-ai-org/loom-exporter
- Cliente Python loom-py: https://github.com/loom-ai-org/loom-py
- Implementacion original del codec SNAC: https://github.com/hubertsiuzdak/snac

Nota: la busqueda web realizada no devolvio resultados relevantes para este modelo. Todos los enlaces recuperados corresponden al producto de grabacion de pantalla Loom (loom.com), sin relacion con el proyecto loom-ai-org ni con el codec SNAC.
