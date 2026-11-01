# hyukudan/Qwen3.8-Flash-Next-GGUF-mirror

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje de gran escala desarrollado por Qwen (Alibaba) y publicado bajo la licencia Qwen Community License 1.0. Con 176.943.899.520 parametros totales (aproximadamente 177 mil millones), se posiciona en la gama alta de modelos abiertos, y esta disponible en formato GGUF gracias a la cuantizacion dinamica UD-Q4_K_XL realizada por Unsloth. El repositorio analizado es un mirror de solo lectura creado por el usuario hyukudan para garantizar la reproducibilidad de su motor de inferencia (strix-halo-engine-lab), no una cuantizacion propia.

La relevancia de este mirror radica en que fija una revision concreta (commit `38bb39ee97821de2c9009abb7e93950eec396e66`) de los ficheros upstream de Unsloth, con hashes SHA256 verificados y byte-identicos a los originales. Incluye ademas un cabezal MTP (Multi-Token Prediction) en Q8_0 para decodificacion especulativa, lo que permite acelerar la generacion sin alterar la salida greedy. El modelo base es Qwen/Qwen3.8-Flash-Next, y la cuantizacion UD-Q4_K_XL ocupa 111,3 GB en cuatro shards.

Al tratarse de un mirror, no se anaden datos de entrenamiento, benchmarks ni capacidades mas alla de lo que declara la model card upstream (que no se incluye en la informacion proporcionada). Esta ficha se centra en lo que el repositorio documenta explicitamente y marca como "no disponible" todo aquello que no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-Flash-Next; la model card del mirror no detalla la arquitectura interna) |
| Parametros totales | 176.943.899.520 (aproximadamente 177 mil millones, dato de safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF UD-Q4_K_XL (cuantizacion dinamica de Unsloth); cabezal MTP en Q8_0; existe un perfil GSQ-RCO Q2_0 en repositorio separado |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | GGUF (4 shards UD-Q4_K_XL + sidecar MTP Q8_0) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base Qwen3.8-Flash-Next (tipo de transformer, atencion, composicion del dataset, numero de tokens de entrenamiento ni si hubo RLHF/DPO). Lo que si documenta el mirror es el proceso de cuantizacion: Unsloth aplico una cuantizacion dinamica UD-Q4_K_XL sobre los pesos originales, generando cuatro shards que suman 111.334.654.400 bytes. El mirror verifica que el merge de esos cuatro shards con `llama-gguf-split --merge` (llama.cpp 552f18f9) produce un unico fichero de 111.334.654.400 bytes con sha256 `8003d03db822cb089ab55caa5fff0f82f6f4199fe6ac58368bc9989365b6f8c2`, y que los 1224 tensores conservan nombres, formas, tipos y bytes. La re-creacion de los shards desde el fichero mergeado con `--split --split-max-size 50G --no-tensor-first-split` dio como resultado ficheros byte-identicos a los de Unsloth, lo que demuestra que el merge es sin perdida.

La innovacion tecnica destacable es la inclusion del cabezal MTP `mtp-Qwen3.8-Flash-Next-shared-Q8_0.gguf` (2.786.568.256 bytes) para decodificacion especulativa con ventanas de 2, 4 y 8 tokens, bit-identica a la decodificacion greedy serial. Esto permite acelerar la inferencia sin cambiar la distribucion de salida. El mirror tambien referencia un perfil propio de velocidad sobre calidad (GSQ-hybrid-Q2) en un repositorio separado, que sustituye los expertos enrutados por expertos GSQ-RCO Q2_0 y que, segun el autor, no supera el criterio de calidad del motor.

## Capacidades

- Generacion de texto conversacional (el tag `conversational` figura en el repositorio).
- Decodificacion especulativa mediante cabezal MTP (ventanas 2/4/8), con salida bit-identica a greedy serial.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Cuantizacion con tecnica imatrix (`imatrix` en los tags).
- Capacidades de razonamiento, codigo, matematicas, vision, tool calling, agentes o multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local de un modelo de aproximadamente 177 mil millones de parametros en formato GGUF: el mirror proporciona los cuatro shards UD-Q4_K_XL listos para cargar en llama.cpp u otros runners compatibles con GGUF, con hashes verificados para garantizar integridad en produccion.
- Aceleracion de inferencia con decodificacion especulativa: el sidecar MTP Q8_0 permite configurar ventanas de 2, 4 u 8 tokens para reducir la latencia sin alterar la salida greedy, util en servicios de generacion interactiva.
- Reproducibilidad de experimentos: al fijar una revision concreta y publicar SHA256SUMS, el mirror permite reconstruir exactamente las mediciones del motor strix-halo-engine-lab en cualquier maquina.
- Investigacion sobre cuantizacion: comparar el rendimiento del UD-Q4_K_XL con el perfil GSQ-hybrid-Q2 del mismo autor (publicado aparte) para estudiar el compromiso velocidad/calidad en modelos de gran tamano.
- Entornos con ancho de banda limitado: al ser un mirror con ficheros identicos a los de Unsloth, sirve como fuente alternativa de descarga si el repositorio upstream no esta disponible, manteniendo la verificacion criptografica.
- Integracion en pipelines de CI/CD de modelos: los hashes SHA256 por fichero permiten validar automaticamente que los pesos descargados coinciden con la revision esperada antes de desplegarlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero UD-Q4_K_XL ocupa 111,3 GB, por lo que requiere al menos esa cantidad de memoria (VRAM o RAM unificada) para cargar los pesos, mas overhead de contexto y cache KV.
- GPU recomendadas: no disponibles en la informacion proporcionada; por el volumen de pesos, se necesitan configuraciones multi-GPU de gama alta o sistemas con memoria unificada de gran capacidad.
- Cabe en consumer GPU: no en una unica GPU de consumo; se requiere agregacion de memoria o desalojo a RAM del sistema.
- Opciones de despliegue: llama.cpp (version 552f18f9 o posterior, usada para el merge y la decodificacion especulativa); otros runners compatibles con GGUF no estan confirmados en la informacion disponible.
- Latencia y throughput estimados: no disponibles; el mirror solo documenta la equivalencia bit a bit de la decodificacion especulativa con greedy serial, no cifras de rendimiento.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- El repositorio es un mirror de solo lectura: no se aceptan contribuciones ni correcciones sobre los pesos; cualquier problema debe reportarse al repositorio upstream de Unsloth o al modelo base de Qwen.
- Solo se incluyen los shards UD-Q4_K_XL y el sidecar MTP Q8_0; el resto de cuantizaciones estan unicamente en el repositorio upstream.
- La licencia Qwen Community License 1.0 exige una licencia adicional de Qwen antes de un uso comercial como "Model as a Service" o "AI Work Assistant", y obliga a mostrar el nombre del modelo si se superan 100 millones de MAU o 20 millones de dolares de ingresos mensuales.
- El repositorio upstream declara `qwen-community-1.0` pero no incluye fichero LICENSE; el mirror copia el LICENSE del repositorio del modelo base, por lo que conviene verificar la version vigente en Qwen/Qwen3.8-Flash-Next.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion, limitaciones de contexto o idioma del modelo base en la informacion proporcionada.
- El perfil GSQ-hybrid-Q2 del mismo autor falla el criterio de calidad del motor y no es el valor por defecto; no debe confundirse con los pesos de este mirror.
- El modelo base pesa aproximadamente 177 mil millones de parametros, lo que implica requisitos de memoria muy elevados incluso en cuantizacion Q4.

## Enlaces

- Mirror en HuggingFace: https://huggingface.co/hyukudan/Qwen3.8-Flash-Next-GGUF-mirror
- Repositorio upstream de Unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Revision upstream fijada: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF/tree/38bb39ee97821de2c9009abb7e93950eec396e66
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Revision del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/tree/de4b8e4d43b917e7706784d8bb445c9af86a3540
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/de4b8e4d43b917e7706784d8bb445c9af86a3540/LICENSE
- Perfil GSQ-hybrid-Q2 del autor: https://huggingface.co/hyukudan/Qwen3.8-Flash-Next-GSQ-hybrid-Q2
- Motor de inferencia y mediciones: https://github.com/hyukudan/strix-halo-engine-lab
- Seccion Qwen del motor: https://github.com/hyukudan/strix-halo-engine-lab#qwen38-flash-next
