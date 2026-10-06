# cstr/opus-mt-en-es-GGUF

## Resumen

`cstr/opus-mt-en-es-GGUF` es una conversión al formato GGUF del modelo de traducción automática `Helsinki-NLP/opus-mt-en-es`, parte de la familia OPUS-MT desarrollada por Jörg Tiedemann y Santhosh Thottingal en la Universidad de Helsinki. El repositorio lo publica el usuario `cstr` y su propósito es permitir la ejecución del traductor dentro de CrispASR (proyecto CrispStrobe/CrispASR), una herramienta de reconocimiento y traducción de voz en tiempo real. Se trata, por tanto, de una conversión de formato, no de un modelo entrenado desde cero: los pesos son idénticos a los del checkpoint original.

Arquitectura MarianMT de tipo encoder-decoder, con 6 capas de encoder y 6 de decoder y una dimensión de modelo (d) de 512. Cuenta con 78.008.297 parámetros totales, lo que lo sitúa en la gama de los modelos de traducción ligeros: el repositorio completo ocupa 0,2 GB y los ficheros GGUF van de 88 MB (q8_0) a 161 MB (f16). Está especializado en un único par de idiomas, inglés a español.

Su relevancia actual es práctica: al ser un modelo de 80 millones de parámetros y menos de 100 MB cuantizado, puede ejecutarse en CPU, en dispositivos de borde o integrarse en pipelines de transcripción en vivo con latencia muy baja, algo imposible con modelos de traducción multilingües de mayor tamaño. La conversión publicada mantiene paridad con la implementación de referencia de `transformers` en las pruebas realizadas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT, transformer encoder-decoder (6 capas de encoder + 6 de decoder, d=512) |
| Parametros totales | 78.008.297 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | f16 y q8_0 |
| Idiomas soportados | ingles (en) y espanol (es) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (ggml) |

## Arquitectura y entrenamiento

El modelo es un MarianMT, una arquitectura transformer de tipo encoder-decoder pensada especificamente para traduccion automatica neuronal y desarrollada en el marco del proyecto OPUS-MT. La configuracion concreta es de 6 capas en el encoder y 6 en el decoder con dimension de modelo 512, lo que da los 78 millones de parametros declarados. El modelo base fue entrenado sobre datos del corpus OPUS, una coleccion abierta de textos paralelos, y la version distribuida corresponde al release `opus-2020-08-18`. El proyecto OPUS-MT publica sus modelos preentrenados bajo licencia CC-BY 4.0.

La innovacion relevante de este repositorio no esta en el entrenamiento, sino en la conversion y optimizacion de formato. Los pesos se exportan a GGUF mediante `models/convert-marian-to-gguf.py` y se cuantizan con `crispasr-quantize`. El autor verifica la paridad frente a `MarianMTModel.generate` de Hugging Face `transformers` sobre 8 frases de prueba: con el fichero f16 la salida es identica en 8/8 frases en decodificacion greedy y en 8/8 con beam 4; con q8_0 es identica en 8/8 en greedy, con diferencias de redaccion en otros casos. Los ids de tokens de entrada coinciden en 8/8. No se documentan fases de RLHF, DPO ni ajuste por preferencias humanas, algo coherente con un modelo de traduccion supervisada. Una diferencia de comportamiento respecto a la referencia: las cadenas literales `</s>`, `<unk>` y `<pad>` se tratan como texto normal en esta implementacion, mientras que la referencia las interpreta como tokens especiales.

## Capacidades

- Traduccion de texto de ingles a espanol, unidireccional; la direccion inversa corresponde a otro repositorio (`cstr/opus-mt-es-en-GGUF`).
- Decodificacion greedy y con beam search: el binario usa el tamano de beam propio del checkpoint salvo que se fuerce `-bs 1`.
- Integracion con CrispASR mediante `--backend marian` para traduccion de texto a texto desde linea de comandos.
- Traduccion en vivo (`--live-translate`): entrada de microfono, salida de transcripcion mas traduccion frase a frase, combinando un back-end de reconocimiento (por ejemplo `parakeet`) con el traductor Marian.
- Ejecucion en CPU pura y en entornos de bajos recursos, al ser un modelo de 78 millones de parametros.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio nativo ni modo de pensamiento. Es un traductor especializado, no un modelo de proposito general.

## Casos de uso

- Traduccion en vivo de reuniones y conferencias: el modelo se integra en el modo `--live-translate` de CrispASR para recibir audio en ingles, transcribirlo y devolver la traduccion en espanol frase a frase, con una latencia minima gracias a sus menos de 100 MB cuantizado.
- Subtitulado automatico de video: procesar pistas de audio o transcripciones en ingles y generar subtitulos en espanol en lotes, ejecutando el modelo en CPU junto a un sistema de reconocimiento de voz.
- Traduccion en dispositivos de borde o sin conexion: al ocupar 88 MB en q8_0, puede desplegarse en Raspberry Pi, portatiles modestos o entornos embebidos donde no hay GPU ni acceso a internet.
- Preprocesado de corpus en investigacion: traduccion masiva de documentos o datasets en ingles al espanol para tareas de analisis, anotacion o aumento de datos, con un coste computacional muy bajo por frase.
- Asistencia a la lectura y accesibilidad: traducir articulos, documentacion tecnica o mensajes en ingles a espanol en local, sin enviar el contenido a servicios en la nube.
- Componente de un pipeline de atencion al cliente: como etapa de traduccion dentro de un sistema mayor que gestione la conversacion, cuando el volumen justifica un traductor dedicado y economico en lugar de un LLM generalista.
- Traduccion de registros y trazas de aplicaciones: convertir mensajes de log o incidencias redactadas en ingles para equipos hispanohablantes, aprovechando el bajo coste por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (BLEU, MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de evaluacion presentes en la model card son pruebas de paridad funcional frente a la implementacion de referencia:

| Prueba | Fichero f16 | Fichero q8_0 |
|---|---|---|
| Frases identicas a la referencia (greedy) | 8/8 | 8/8 |
| Frases identicas a la referencia (beam 4) | 8/8 | No especificado (diferencias de redaccion en algunos casos) |
| Coincidencia de ids de tokens de entrada | 8/8 | No especificado |

El autor califica q8_0 como la variante mas rapida y recomendada. No se aportan cifras de latencia, throughput ni puntuaciones BLEU.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en cualquier cuantizacion; el fichero q8_0 ocupa 88 MB y el f16 161 MB, mas el overhead del runtime.
- GPU: funciona en practicamente cualquier GPU con soporte de ggml/GGUF; no requiere modelos de datacenter como A100 o H100. Una RTX 4090 o cualquier GPU consumer es mas que suficiente.
- Cabe holgadamente en GPU consumer: si, en cualquier modelo con mas de 1 GB de memoria, e incluso en iGPU.
- Ejecucion en CPU: si, es el escenario natural. El modelo esta pensado para uso en CPU y en dispositivos de bajos recursos.
- Opciones de despliegue: CrispASR con `--backend marian` es el camino documentado por el autor, incluyendo el modo `--live-translate`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. La model card afirma que estos modelos son "los traductores mas rapidos" para transcripcion y traduccion en vivo, pero sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| cstr/opus-mt-en-es-GGUF | 78.008.297 | en, es (un par) | GGUF (f16, q8_0) | CC-BY-4.0 | Conversion para CrispASR, paridad verificada con la referencia |
| Helsinki-NLP/opus-mt-en-es | 78.008.297 | en, es (un par) | safetensors / PyTorch | CC-BY-4.0 | Modelo base; mismos pesos, requiere `transformers` |
| Alternativas multilingues (por ejemplo NLLB-200 o M2M-100) | no disponible | cientos de idiomas | no disponible | no disponible | Mas versatiles pero mucho mas pesadas; no adecuadas para ejecucion en CPU de bajos recursos |

No se dispone de datos comparativos de calidad de traduccion (BLEU u otras metricas) entre este modelo y las alternativas mencionadas.

## Limitaciones y advertencias

- Modelo unidireccional: solo traduce de ingles a espanol. La direccion inversa requiere otro repositorio.
- Cobertura limitada a dos idiomas; no traduce desde o hacia terceras lenguas.
- Es un traductor especializado de 78 millones de parametros: la calidad esta por debajo de la de modelos multilingues grandes o de LLM generalistas en textos complejos, dominios muy tecnicos o lenguaje coloquial.
- Riesgo de traducciones literales o perdida de matices idiomaticos, propio de los modelos entrenados con datos paralelos genericos.
- Diferencia de comportamiento respecto a la referencia: las cadenas `</s>`, `<unk>` y `<pad>` se tratan como texto normal, lo que puede alterar resultados si la entrada las contiene.
- En modo en vivo la decodificacion es siempre greedy, lo que puede reducir la calidad frente a beam search.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribucion al proyecto OPUS-MT (Universidad de Helsinki). La model card insiste en que la declaracion del proyecto, no la etiqueta de una model card concreta, es la que rige la redistribucion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion de la comunidad ni garantia de mantenimiento.
- No se documentan evaluaciones de sesgo, toxicidad ni comportamiento en dominios sensibles. No se especifica la longitud de contexto soportada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cstr/opus-mt-en-es-GGUF
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-es
- Modelo en direccion inversa: https://huggingface.co/cstr/opus-mt-es-en-GGUF
- CrispASR (CrispStrobe): https://github.com/CrispStrobe/CrispASR
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- OPUS-MT-train: https://github.com/Helsinki-NLP/OPUS-MT-train
- Corpus OPUS: https://opus.nlpl.eu/
- Publicacion de referencia: Tiedemann, J. y Thottingal, S., "OPUS-MT — Building open translation services for the World", EAMT 2020.

Nota: los resultados de la busqueda web proporcionada no guardan relacion con este modelo (corresponden a otros significados del acronimo CSTR, como reactor de tanque agitado continuo), por lo que no se incluyen como enlaces relevantes.
