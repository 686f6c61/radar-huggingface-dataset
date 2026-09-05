# ilintar/qwen3.8-27b-gguf-strix-halo

## Resumen

El repositorio `ilintar/qwen3.8-27b-gguf-strix-halo` contiene una cuantizacion GGUF del modelo Qwen3.8-27B, un modelo denso vision-language de 27B parametros desarrollado por Qwen, junto con un modelo draft DFlash2 para decodificacion especulativa. El autor, ilintar, ha optimizado estos pesos para ejecutarse de forma eficiente en APUs AMD Strix Halo (gfx1151) mediante ROCm, aprovechando la memoria unificada de hasta 64 GB. El problema que resuelve es la ejecucion local de modelos grandes en hardware AMD sin GPU dedicada, mejorando el throughput con decodificacion especulativa y cuantizacion IQ4_XS.

El modelo principal es un transformer denso con capacidad vision-language nativa, capaz de entender imagenes y videos, con control de pensamiento flexible para tareas multi-paso. El repo incluye dos archivos GGUF: el modelo principal de 16,1 GB y el draft DFlash2 de 1,0 GB. Las mediciones de rendimiento en Strix Halo muestran mejoras de hasta un 5,67 % en throughput con el draft cuantizado, manteniendo la misma salida determinista que el draft Q8_0. El proyecto es relevante para desarrolladores e investigadores que buscan desplegar modelos de 27B en hardware de consumo con ROCm y optimizaciones de decodificacion especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso vision-language con capa MTP y modelo draft DFlash2 para decodificacion especulativa |
| Parametros totales | no disponible (el repo contiene el modelo principal Qwen3.8-27B de 27B y un draft DFlash2; el metadata de safetensors indica 1.924.404.480, que corresponde al draft) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 65.536 tokens (configuracion de ejemplo en el README) |
| Tipos de cuantizacion | IQ4_XS, Q8_0 y F32 (modelo principal); IQ4_XS, Q5_K y F32 (draft); Q8_0 (mmproj) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso vision-language que entiende imagenes y videos, con control de pensamiento flexible y disenado para tareas complejas de multiples pasos. El repositorio de ilintar proporciona una cuantizacion GGUF del modelo principal, realizada a partir del GGUF BF16 de Bartowski, que incluye la capa MTP embebida. La cuantizacion utiliza la importance matrix publicada: los 496 tensores activos cubiertos por la matriz se cuantizan a IQ4_XS, mientras que `output.weight`, `token_embd.weight` y las ocho matrices block-64/MTP permanecen en Q8_0. Los tensores estructurales unidimensionales y convolucionales se mantienen en F32. Un mapa de tensores explicito evita las sustituciones Q5_K que aplicaria el preset `MOSTLY_IQ4_XS`.

El modelo draft DFlash2 proviene de `z-lab/Qwen3.8-27B-DFlash2` y se requantizo a IQ4_XS desde su GGUF Q8_0. Como la recoleccion de importance matrix standalone requiere el contexto objetivo, se transfirio una matriz del modelo principal: 18 tensores del draft recibieron coincidencias exactas de nombre y ancho de entrada, 23 recibieron el vector de importancia medio de los tensores objetivo con el mismo ancho, y 8 recibieron pesos uniformes. El draft resultante es un 49,51 % mas pequeno que el Q8_0 original. No se proporcionan datos de entrenamiento (tokens, composicion del dataset, RLHF/DPO) en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con control de pensamiento flexible segun la descripcion del modelo base.
- Vision-language nativa: comprension de imagenes y videos mediante el mmproj Q8_0, que debe suministrarse por separado.
- Decodificacion especulativa con DFlash2, que mejora el throughput en cargas de razonamiento y salida estructurada.
- Generacion de salida estructurada (JSON), con tasas de aceptacion de hasta el 98,96 % en las pruebas de Strix Halo.
- Soporte de agentes y tareas complejas multi-paso, gracias al control de pensamiento flexible del modelo base.
- No se ha documentado soporte explicito de tool calling o function calling en la informacion proporcionada.

## Casos de uso

- Asistente local en AMD Strix Halo: el modelo se ejecuta en un APU con 64 GB de memoria compartida, sin necesidad de GPU dedicada. El despliegue se realiza con `llama-server` y la rama `strix-halo` de llama.cpp, usando las variables de entorno indicadas en el README.
- Generacion de salida estructurada para APIs: las pruebas muestran una tasa de aceptacion del 98,96 % en cargas JSON con decodificacion especulativa, lo que lo hace adecuado para extraccion de datos, generacion de esquemas y respuestas en formato JSON.
- Razonamiento multi-paso en entornos locales: el modelo base esta disenado para tareas complejas con control de pensamiento flexible. Puede utilizarse en analisis de documentos, planificacion y resolucion de problemas que requieren varios pasos.
- Analisis de imagenes y videos: con el mmproj Q8_0, el modelo puede describir contenido visual, generar captions y responder preguntas sobre imagenes o secuencias de video, aprovechando la ventana de contexto de 65.536 tokens.
- Investigacion en optimizacion ROCm: el repo sirve como referencia para estudiar cuantizacion IQ4_XS, decodificacion especulativa y tecnicas de memoria unificada en hardware AMD. Incluye mediciones detalladas de throughput y aceptacion.
- Despliegue en entornos aislados o con datos sensibles: al ser un modelo GGUF con licencia Apache 2.0, puede ejecutarse sin conexion a internet, lo que permite su uso en aplicaciones que requieren privacidad de datos.

## Benchmarks y rendimiento

El README no incluye benchmarks estandar como MMLU, HumanEval o GSM8K. En su lugar, proporciona mediciones locales de rendimiento en Strix Halo con decodificacion especulativa. Los resultados se obtuvieron con un servidor contrabalanceado, cargas deterministas de 128 tokens y dos servidores independientes por configuracion.

| Carga | Ancho draft | Q8_0 (t/s) | IQ4_XS (t/s) | Cambio | Aceptacion Q8_0 | Aceptacion IQ4_XS |
|---|---|---|---|---|---|---|
| Prosa | 3 | 25,257 | 25,742 | +1,92 % | 48,70 % | 47,13 % |
| Razonamiento | 3 | 30,739 | 32,481 | +5,67 % | 69,11 % | 71,67 % |
| JSON | 3 | 39,587 | 41,032 | +3,65 % | 98,96 % | 98,96 % |
| Prosa | 6 | 25,215 | 25,666 | +1,79 % | 30,34 % | 29,30 % |
| Razonamiento | 6 | 37,797 | 39,143 | +3,56 % | 57,65 % | 57,65 % |
| JSON | 6 | 56,483 | 58,529 | +3,62 % | 95,58 % | 95,58 % |

Sin decodificacion especulativa, el modelo principal midio 14,0976 t/s en la prueba `tg128` con PM4 retenido. El hash de salida determinista coincidio entre los drafts Q8_0 e IQ4_XS en todas las cargas. La perplejidad medida en 16 chunks de 512 tokens fue de 15,3977 ± 0,73357, frente a 15,1721 ± 0,72292 para el GGUF BF16 original. Estas cifras son de una evaluacion local y no representan benchmarks generales de calidad.

## Requisitos de hardware

- VRAM estimada: el modelo principal pesa 16.110.851.680 bytes (~16,1 GB) y el draft 1.038.313.376 bytes (~1,0 GB). En Strix Halo con 64 GB de memoria compartida, ambos caben sin problema. No se proporciona una estimacion de VRAM para otras plataformas.
- GPU recomendada: AMD Strix Halo (gfx1151) con ROCm. El README especifica las variables de entorno necesarias, como `HSA_OVERRIDE_GFX_VERSION=11.5.1` y `GGML_HIP_ENABLE_UNIFIED_MEMORY=1`.
- Compatibilidad con GPU de consumo: no disponible. El tamano de 16 GB sugiere que podria caber en una RTX 4090 de 24 GB, pero no hay datos de rendimiento en NVIDIA.
- Opciones de despliegue: llama.cpp con la rama `strix-halo` de [pwilkin/llama.cpp](https://github.com/pwilkin/llama.cpp/tree/strix-halo), usando `llama-server`. Tambien se requiere la rama `ilintar-experiments` de [pwilkin/rocm-systems](https://github.com/pwilkin/rocm-systems/tree/ilintar-experiments) para el runtime ROCm.
- Latencia y throughput: en Strix Halo, el modelo sin decodificacion especulativa alcanza 14,0976 t/s. Con el draft IQ4_XS, el throughput varia entre 25,666 y 58,529 t/s segun la carga y el ancho de draft.

## Comparativa con modelos similares

No se han publicado comparaciones con otros modelos en la informacion disponible. Este repositorio es una cuantizacion GGUF de Qwen3.8-27B optimizada para Strix Halo, por lo que su referencia principal es el modelo original en BF16, con el que se compara la perplejidad. No hay datos de rendimiento de otros modelos equivalentes en la misma plataforma.

## Limitaciones y advertencias

- La cuantizacion IQ4_XS puede degradar la calidad del modelo. La perplejidad medida es ligeramente superior a la del GGUF BF16 original (15,3977 frente a 15,1721).
- El rendimiento de la decodificacion especulativa depende de la tasa de aceptacion del draft, que varia segun el prompt. Las cifras de throughput son validas para las cargas probadas y no son extrapolables a todos los casos.
- El mmproj Q8_0 no esta incluido en el repositorio; hay que suministrarlo por separado para usar la entrada de imagenes.
- Las optimizaciones ROCm estan validadas solo en Strix Halo con las ramas de software mencionadas. No se garantiza el rendimiento en otras plataformas AMD o NVIDIA.
- El draft DFlash2 se cuantizo con una importance matrix transferida del modelo objetivo, no con una matriz propia. Esto puede afectar a la calidad del draft y a la tasa de aceptacion.
- No se proporcionan datos de entrenamiento del modelo base en esta informacion. Los usuarios deben revisar los repositorios upstream de Qwen y z-lab para conocer los terminos de uso y las limitaciones del modelo original.
- Los resultados de rendimiento son mediciones locales con prompts especificos; no constituyen benchmarks generales de calidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ilintar/qwen3.8-27b-gguf-strix-halo
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo base DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Articulo sobre Qwen 27B en Strix Halo: https://kyanitelabs.tech/blog/qwen-27b-strix-halo-complete
- Rama de llama.cpp para Strix Halo: https://github.com/pwilkin/llama.cpp/tree/strix-halo
- Rama de ROCm para los experimentos: https://github.com/pwilkin/rocm-systems/tree/ilintar-experiments
