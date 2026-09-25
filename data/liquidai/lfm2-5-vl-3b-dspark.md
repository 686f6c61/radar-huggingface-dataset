# LiquidAI/LFM2.5-VL-3B-DSpark

## Resumen

LFM2.5-VL-3B-DSpark es un modelo borrador (*draft model*) de decodificacion especulativa desarrollado por Liquid AI, disenado exclusivamente para acelerar la inferencia del modelo de vision-lenguaje LiquidAI/LFM2.5-VL-3B. No es un modelo generativo autonomo: se ejecuta en paralelo al modelo objetivo, propone bloques de tokens candidatos y el modelo objetivo los verifica, de modo que la salida final es identica a la que produciria LFM2.5-VL-3B sin borrador (exacta bajo decodificacion greedy y con la misma distribucion bajo muestreo a temperatura no nula). Se trata de un lanzamiento experimental que traslada la tecnica DSpark, ya aplicada a los modelos de texto LFM2.5, al terreno de los modelos multimodales.

El borrador tiene 279.468.801 parametros en BF16 (unos 0,56 GB de pesos, con un repositorio de 0,6 GB), lo que supone un incremento de huella de memoria minimo respecto al modelo objetivo. Su columna vertebral son 4 capas de atencion completa con `hidden_size=2048`, `intermediate_size=6144`, activacion SiLU/SwiGLU y GQA con 32 cabezas de consulta y 8 de clave/valor (`head_dim=64`). Incorpora dos cabezas adicionales: una cabeza Markov de rango 256 y una cabeza de confianza, y opera con un tamano de bloque de 9 en entrenamiento (8 o 9 en inferencia segun el hardware).

La relevancia de esta publicacion esta en el rendimiento medido: hasta 2,66x mas rapido en decodificacion sobre una H100 con SGLang, hasta 3,13x en Apple silicon con MLX-VLM sobre un M5 Max y hasta 2,14x con llama.cpp sobre un M3 Ultra. Es, por tanto, una pieza de infraestructura orientada a reducir coste por token y latencia en despliegues de VLMs de 3B en cloud y en dispositivo, sin reentrenar ni alterar el modelo objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer borrador de decodificacion especulativa (4 capas de atencion completa) con cabeza Markov (rango 256) y cabeza de confianza |
| Parametros totales | 279.468.801 (279,5M en BF16) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (limitada por el modelo objetivo LiquidAI/LFM2.5-VL-3B) |
| Tipos de cuantizacion | BF16 y FP16 en los checkpoints publicados; existe un repositorio GGUF separado (LFM2.5-VL-3B-DSpark-GGUF) |
| Idiomas soportados | no disponible |
| Licencia | LFM1.0 (identificador `lfm1.0`, licencia "other" en HuggingFace) |
| Formato de pesos | safetensors; GGUF en repositorio aparte |
| Modelo objetivo | LiquidAI/LFM2.5-VL-3B |
| Modelo base | LiquidAI/LFM2.5-VL-3B (finetune) |
| Tamano de bloque | 9 en entrenamiento; 8 o 9 en inferencia segun hardware |
| Vocabulario | 128.000 tokens |
| Dimensiones internas | `hidden_size=2048`, `intermediate_size=6144`, `head_dim=64`, 32 cabezas de atencion / 8 cabezas KV (GQA) |
| Libreria declarada | sglang |
| Pipeline | image-text-to-text |
| Fecha de publicacion | 18 de septiembre de 2026 (ultima actualizacion: 24 de septiembre de 2026) |
| Descargas / likes | 79 descargas, 13 likes |

## Arquitectura y entrenamiento

El modelo es un borrador de tipo DSpark, una variante de decodificacion especulativa en la que un modelo pequeno propone un bloque de tokens que el modelo objetivo valida en una sola pasada forward. La columna vertebral consta de 4 capas de atencion completa con atencion de consultas agrupadas (GQA), 32 cabezas de consulta y 8 cabezas de clave/valor, `head_dim` de 64, `hidden_size` de 2048 e `intermediate_size` de 6144 con activacion SiLU/SwiGLU. Sobre esa columna se anaden dos componentes especificos de DSpark: una cabeza Markov de rango 256, que modela dependencias entre tokens consecutivos dentro del bloque propuesto, y una cabeza de confianza, que estima la probabilidad de aceptacion de cada token candidato. El vocabulario es de 128.000 entradas.

El entrenamiento se realizo con un tamano de bloque de 9, mientras que en inferencia se emplea bloque 9 en GPU y bloque 8 en Apple silicon, una diferencia que la model card atribuye al hardware. La evaluacion de la aceptacion del borrador sigue la metodologia del paper MMSpec (arXiv:2603.14989) y cubre seis categorias: VQA general, VQA de texto en imagen, captioning, VQA sobre graficos, razonamiento complejo y conversacion multi-turno. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; al tratarse de un borrador, la senal de entrenamiento relevante es la tasa de aceptacion respecto al modelo objetivo, no la calidad generativa.

## Capacidades

- Decodificacion especulativa de bloques de 8 o 9 tokens para el modelo LiquidAI/LFM2.5-VL-3B, con verificacion exacta por parte del objetivo.
- Preservacion exacta de la salida del modelo objetivo bajo decodificacion greedy; bajo muestreo a temperatura no nula, preserva la distribucion de probabilidad del objetivo.
- Soporte de entradas de imagen y texto (pipeline `image-text-to-text`), delegando la comprension visual real en el modelo objetivo.
- Estimacion de confianza por token mediante una cabeza dedicada, que permite decidir cuantos tokens propuestos merece la pena verificar.
- Modelado intra-bloque mediante cabeza Markov de rango 256, orientado a mejorar la tasa de aceptacion en secuencias coherentes.
- Integracion con SGLang en GPU, con MLX-VLM en Apple silicon y con llama.cpp a traves de los pesos GGUF.
- No soporta generacion autonoma, tool calling, function calling ni razonamiento multi-paso por si mismo: esas capacidades pertenecen al modelo objetivo LFM2.5-VL-3B.
- Capacidades multilingues: no disponibles de forma independiente; dependen del modelo objetivo.

## Casos de uso

- Servicio de inferencia VLM en cloud con SGLang: desplegar LFM2.5-VL-3B junto a este borrador en una unica H100 80GB para reducir el tiempo de decodificacion hasta 2,66x en tareas de captioning (COCO), lo que se traduce directamente en menor coste por token servido y mayor capacidad de concurrencia.
- Asistentes sobre capturas de pantalla y graficos: en tareas de VQA sobre documentos y figuras (CharXiv), la decodificacion se acelera 2,39x en decodificacion y 1,97x de extremo a extremo sobre H100, adecuado para pipelines de analisis de informes financieros o dashboards.
- Atencion al cliente multimodal multi-turno: con aceleraciones de 2,04x en decodificacion y 1,83x extremo a extremo en el conjunto Multi-turn, el sistema puede mantener conversaciones largas con imagenes adjuntas sin degradar la latencia percibida.
- Aplicaciones de escritorio en Mac: con MLX-VLM sobre un M5 Max se alcanza 3,13x en decodificacion en captioning, lo que permite ejecutar un VLM de 3B con respuesta casi instantanea en un portatil sin GPU dedicada.
- Inferencia local con llama.cpp: el repositorio GGUF permite usar el borrador con llama.cpp sobre Apple silicon (M3 Ultra, 2,14x en COCO) para aplicaciones offline de catalogacion y etiquetado de imagenes.
- Procesamiento por lotes de descripcion de imagenes a escala: al ser la decodificacion exacta bajo greedy, se puede aplicar a generacion masiva de captions (por ejemplo, catalogos de producto) sin riesgo de degradar la calidad respecto al modelo objetivo.
- Extraccion de informacion de texto en imagen (TextVQA): 2,14x de aceleracion en H100 para tareas de lectura de recibos, formularios o documentacion escaneada, donde el cuello de botella es la generacion de la respuesta.
- Reduccion de huella en despliegues con presupuesto de VRAM ajustado: el borrador anade solo unos 0,56 GB de pesos en BF16, por lo que es viable en configuraciones donde no cabe un segundo modelo auxiliar grande.

## Benchmarks y rendimiento

La model card no publica benchmarks de calidad del modelo objetivo; remite a LiquidAI/LFM2.5-VL-3B para esas metricas, ya que la decodificacion especulativa es exacta bajo greedy. Lo que si se publica es la tasa de aceptacion del borrador y la aceleracion medida.

Tokens de borrador aceptados de media por pasada de verificacion (batch size 1, temperatura 0):

| Benchmark | 1xH100 (SGLang, bloque 9) | Apple M5 Max (MLX-VLM, bloque 8) | Apple M3 Ultra (llama.cpp, bloque 8) |
|---|---|---|---|
| MMMU-Pro | 4,11 | 4,07 | 4,19 |
| Multi-turn | 3,46 | 3,24 | 3,31 |
| COCO | 4,57 | 4,21 | 4,50 |
| CharXiv | 4,11 | 4,34 | 4,04 |
| TextVQA | 3,74 | 4,08 | 3,58 |
| GQA | 4,14 | 3,77 | 3,93 |

Aceleracion medida respecto al mismo modelo objetivo sin DSpark, en formato decodificacion / extremo a extremo:

| Dataset | 1xH100 (SGLang) | Apple M5 Max (MLX-VLM) | Apple M3 Ultra (llama.cpp) |
|---|---|---|---|
| MMMU-Pro | 2,43x / 1,97x | 2,93x / 2,62x | 2,03x / 1,74x |
| Multi-turn | 2,04x / 1,83x | 2,30x / 1,91x | 1,57x / 1,37x |
| COCO | 2,66x / 2,27x | 3,13x / 2,59x | 2,14x / 1,77x |
| CharXiv | 2,39x / 1,97x | 2,94x / 1,71x | 1,87x / 1,56x |
| TextVQA | 2,14x / 1,64x | 2,69x / 1,56x | 1,64x / 1,33x |
| GQA | 2,35x / 1,77x | 2,67x / 1,93x | 1,77x / 1,30x |

Condiciones de medida declaradas: procesamiento de 16 bits tanto en el codificador visual como en la columna de lenguaje; resultados H100 con SGLang sobre una H100 80GB en BF16, batch size 1, temperatura 0 y bloque 9; resultados Apple con pesos FP16, batch size 1, temperatura 0 y bloque 8.

## Requisitos de hardware

- Peso del borrador en BF16: aproximadamente 0,56 GB (279,5M parametros x 2 bytes); el repositorio completo ocupa 0,6 GB.
- En FP16 el requisito es identico en orden de magnitud (aproximadamente 0,56 GB), ya que el numero de parametros no cambia.
- VRAM total de inferencia: no disponible; debe sumarse el peso del borrador a los requisitos del modelo objetivo LiquidAI/LFM2.5-VL-3B, no desglosados en la informacion proporcionada.
- GPU validadas por el autor: 1xH100 80GB con SGLang en BF16, batch size 1.
- Plataformas Apple validadas: Apple M5 Max con MLX-VLM (FP16, bloque 8) y Apple M3 Ultra con llama.cpp (FP16, bloque 8).
- Al ser un modelo de 279,5M de parametros, cabe sin problema en cualquier GPU de consumo (RTX 3060 en adelante) siempre que el modelo objetivo tambien quepa; la limitacion real es el VLM de 3B que acompana.
- Opciones de despliegue confirmadas: SGLang (libreria declarada en el repositorio), MLX-VLM y llama.cpp mediante el repositorio GGUF.
- Latencia y throughput: no se publican valores absolutos de tokens por segundo, solo aceleraciones relativas respecto a la inferencia sin borrador (ver seccion de benchmarks).
- Nota de compatibilidad: el checkpoint del borrador debe emparejarse con su modelo objetivo correspondiente (LFM2.5-VL-3B-DSpark con LFM2.5-VL-3B; LFM2.5-VL-3B-DSpark-GGUF con LFM2.5-VL-3B-GGUF).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Aceleracion publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LFM2.5-VL-3B-DSpark | Borrador especulativo multimodal | 279,5M | no disponible | Hasta 2,66x (H100/SGLang), 3,13x (M5 Max/MLX-VLM), 2,14x (M3 Ultra/llama.cpp) | LFM1.0 | HuggingFace, safetensors y GGUF |
| LFM2.5-DSpark | Borrador especulativo de texto | no disponible | no disponible | Hasta 3,2x segun el blog de Liquid AI | LFM1.0 (no confirmado en la informacion) | HuggingFace |
| EAGLE-3 | Borrador especulativo (metodo alternativo) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Medusa | Cabezas de decodificacion especulativa (metodo alternativo) | no disponible | no disponible | no disponible | no disponible | no disponible |

Liquid AI no indica en la informacion disponible comparaciones directas contra otros borradores multimodales; la referencia cuantitativa del propio autor es su borrador de texto LFM2.5-DSpark. No se dispone de cifras verificables de EAGLE-3 ni Medusa en el material proporcionado.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el modelo objetivo LiquidAI/LFM2.5-VL-3B no genera nada util. No debe desplegarse como sustituto del mismo.
- Caracter experimental: la propia model card lo etiqueta como "experimental", por lo que su soporte y estabilidad en produccion no estan garantizados.
- Compatibilidad estricta de emparejamiento: cada checkpoint de borrador funciona unicamente con su modelo objetivo declarado; mezclar versiones invalida la verificacion.
- Diferencias de tamano de bloque entre plataformas (9 en GPU, 8 en Apple silicon) que pueden alterar la tasa de aceptacion y, por tanto, la aceleracion efectiva.
- La aceleracion de extremo a extremo es sistematicamente inferior a la de decodificacion (por ejemplo, 2,66x frente a 2,27x en COCO sobre H100), porque el prefill y el codificador visual no se benefician del borrador.
- La velocidad de aceleracion depende de la carga: en conversacion multi-turno los incrementos son los mas bajos de la tabla (1,57x en decodificacion sobre M3 Ultra), lo que indica que no todos los escenarios se benefician por igual.
- Riesgo de alucinacion: el borrador no genera contenido de forma independiente, pero hereda integramente el comportamiento del modelo objetivo; cualquier sesgo o alucinacion proviene de este ultimo.
- Idiomas soportados: no disponibles en la informacion proporcionada; dependen del modelo objetivo.
- Licencia LFM1.0 (identificador `lfm1.0`, marcada como "other" en HuggingFace): es una licencia propia de Liquid AI y no una licencia open source estandar. Antes de un uso comercial es imprescindible revisar el archivo LICENSE del repositorio, ya que las condiciones de uso comercial, redistribucion y atribucion no se detallan en la informacion disponible.
- Huella de memoria adicional: aunque minima (aproximadamente 0,56 GB), no es nula, y en dispositivos con memoria unificada muy ajustada puede ser relevante.
- Cifras de aceleracion medidas a batch size 1 y temperatura 0; el rendimiento con lotes grandes o temperaturas altas no se documenta en el material proporcionado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LiquidAI/LFM2.5-VL-3B-DSpark
- Version GGUF del borrador: https://huggingface.co/LiquidAI/LFM2.5-VL-3B-DSpark-GGUF
- Modelo objetivo: https://huggingface.co/LiquidAI/LFM2.5-VL-3B
- Modelo objetivo en GGUF: https://huggingface.co/LiquidAI/LFM2.5-VL-3B-GGUF
- Blog de Liquid AI sobre LFM2.5-VL-DSpark: https://www.liquid.ai/blog/lfm2-5-vl-dspark
- Blog de Liquid AI sobre LFM2.5-VL-3B: https://www.liquid.ai/blog/lfm2-5-vl-3b
- Documentacion de LFM2.5-VL-3B: https://docs.liquid.ai/lfm/models/lfm25-vl-3b
- Documentacion general de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground de Liquid AI: https://playground.liquid.ai/
- Paper MMSpec (metodologia de evaluacion): https://arxiv.org/abs/2603.14989
- Comunidad en Discord: https://discord.com/invite/liquid-ai
- Organizacion en HuggingFace: https://huggingface.co/LiquidAI
