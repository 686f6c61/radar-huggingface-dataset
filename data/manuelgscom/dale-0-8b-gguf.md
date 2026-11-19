# manuelgscom/dale-0.8b-GGUF

## Resumen

`dale-0.8b-GGUF` es la versión cuantizada en formato GGUF del modelo `dale-0.8b`, un ajuste completo (full fine-tune) de Qwen3.5-0.8B desarrollado por Manuel García. Su propósito es muy concreto: convertir una petición en lenguaje natural, en castellano o en inglés, en un único comando bash para Linux, devuelto como un objeto JSON pequeño con una explicación breve. No es un modelo de propósito general, sino una herramienta especializada de traducción de lenguaje natural a shell (nl2bash) pensada para ejecutarse en local.

El modelo es la pieza central de `dale`, una herramienta de línea de comandos offline que lo ejecuta en CPU mediante llama.cpp dentro de un único binario nativo. Con 752.393.024 parámetros totales (aproximadamente 0,8B), la versión GGUF Q4_K_M ocupa 529,3 MB, lo que lo convierte en un modelo extremadamente ligero y apto para equipos sin GPU. La relevancia actual reside en su enfoque: un modelo pequeño, especializado y con licencia Apache-2.0 que supera en su tarea específica a modelos mucho mayores sin ajustar.

Según los datos del autor, en el conjunto de test público `dale-bash-test-v2` (471 casos) alcanza un 79,4 % de precisión (374/471), frente al 62,8 % de Qwen3.5-9B y Gemma 4 E4B-it sin ajuste. La latencia declarada es de 1,72 s de mediana por petición en un portátil de gama media de 2020 (4 núcleos / 8 hilos) sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune completo de Qwen3.5-0.8B) |
| Parametros totales | 752.393.024 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (con imatrix); pesos BF16 safetensors en el repo base |
| Idiomas soportados | es, en |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M); safetensors BF16 en el modelo base |

## Arquitectura y entrenamiento

El modelo es un ajuste completo de Qwen3.5-0.8B, por lo que hereda la arquitectura transformer del modelo base de Qwen. No se dispone de información detallada sobre el número de tokens de entrenamiento ni sobre la composición exacta del dataset en la información proporcionada. El autor indica que el modelo fue entrenado para una tarea única y con contrato fijo: recibir una petición en lenguaje natural junto con un contexto de sistema (sistema operativo, distribución, gestor de paquetes y herramientas instaladas) y devolver un único comando bash con una explicación breve, en formato JSON.

La cuantización GGUF se generó con imatrix, un método que usa una matriz de importancia para preservar mejor los pesos relevantes durante la cuantización. El resultado es un archivo Q4_K_M de 529,3 MB. Una innovación destacable del sistema, aunque no del modelo en sí, es la separación de responsabilidades: el modelo solo propone el comando, mientras que un verificador determinista escrito en C++ evalúa el riesgo y exige confirmación explícita para comandos peligrosos. No se especifica si hubo RLHF o DPO en el proceso de entrenamiento.

## Capacidades

- Generación de comandos bash para Linux a partir de lenguaje natural, en castellano e inglés.
- Salida estructurada en formato JSON con el comando propuesto y una explicación breve.
- Traducción de lenguaje natural a shell (nl2bash) como tarea principal y única.
- Uso de contexto de sistema para adaptar la respuesta (sistema operativo, distribución, gestor de paquetes, herramientas instaladas).
- Capacidad conversacional básica según los tags del repositorio.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documentan capacidades de tool calling genérico, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Asistente de terminal offline: integrado en la CLI `dale`, el modelo convierte una petición como "lista los archivos más grandes del directorio actual" en un comando bash concreto, sin conexión a internet y en CPU, lo que lo hace adecuado para entornos air-gapped.
- Aprendizaje de shell para principiantes: el modelo devuelve el comando junto con una explicación breve, de modo que el usuario puede entender qué hace antes de ejecutarlo, apoyándose en el verificador de riesgo de la CLI.
- Automatización de tareas administrativas repetitivas: un operador puede describir en lenguaje natural la operación que necesita (por ejemplo, buscar y comprimir logs antiguos) y obtener el comando listo para revisar y ejecutar.
- Integración en scripts y pipelines propios: al ser un GGUF de 529 MB con salida JSON, puede servirse con `llama-server` en CPU o GPU y consumirse desde una aplicación que necesite generar comandos de forma programática.
- Entornos con hardware limitado: portátiles antiguos, contenedores sin GPU o servidores modestos pueden ejecutar el modelo con latencia de ~1,7 s por petición, según los datos del autor.
- Fallback en sistemas con GPU: la CLI `dale` lo usa como modelo por defecto en CPU y como respaldo cuando no hay GPU suficiente para los hermanos mayores (`dale-4b`, `dale-9b`).
- Generación de comandos en español: a diferencia de muchos modelos orientados a shell, soporta peticiones en castellano de forma nativa, útil para equipos hispanohablantes.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Modelo | Base | GGUF Q4_K_M | Test v2 (471 casos) |
|---|---|---|---|
| `dale-0.8b` | Qwen3.5-0.8B | 529,3 MB | 79,4 % |
| `dale-2b` | Qwen3.5-2B | 1.274,4 MB | 81,7 % |
| `dale-4b` | Qwen3.5-4B | 2.708,8 MB | 87,0 % |
| `dale-9b` | Qwen3.5-9B | 5.629,1 MB | 89,2 % |
| Qwen3.5-9B (sin ajuste) | — | — | 62,8 % |
| Gemma 4 E4B-it (sin ajuste) | — | — | 62,8 % |

El benchmark propio es `manuelgscom/dale-bash-test-v2`, split test, con métrica de accuracy. El autor reporta además una latencia de 1,72 s de mediana por petición en un portátil de 2020 (4 núcleos / 8 hilos) sin GPU, y de aproximadamente 1 s en un escritorio con CPU. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el GGUF Q4_K_M ocupa 529,3 MB y puede ejecutarse íntegramente en CPU.
- GPU recomendadas: no necesarias para este tamaño; el autor indica que en máquinas con GPU se usan los hermanos mayores `dale-4b` (≥ 4 GiB de VRAM libre) y `dale-9b` (≥ 8 GiB de VRAM libre).
- Cabe en cualquier GPU consumer, e incluso en sistemas sin GPU dedicada (GPU integrada o CPU pura).
- Opciones de despliegue: llama.cpp (`llama-server`), la CLI `dale` (binario nativo con llama.cpp embebido) y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: 1,72 s de mediana por petición en CPU de portátil de 2020 (4 núcleos / 8 hilos); ~1 s en CPU de escritorio. No se dispone de cifras de throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Test v2 (nl2bash) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dale-0.8b` | 752 M | no disponible | 79,4 % | Apache-2.0 | GGUF + safetensors |
| `dale-2b` | no disponible | no disponible | 81,7 % | no disponible | GGUF |
| `dale-4b` | no disponible | no disponible | 87,0 % | no disponible | GGUF |
| `dale-9b` | no disponible | no disponible | 89,2 % | no disponible | GGUF |
| Qwen3.5-9B (sin ajuste) | 9B (aprox.) | no disponible | 62,8 % | no disponible | no disponible |
| Gemma 4 E4B-it (sin ajuste) | no disponible | no disponible | 62,8 % | no disponible | no disponible |

La comparativa más directa es con los propios hermanos de la familia `dale`, que comparten tarea, datos, contrato y prompt, y con los modelos base sin ajustar. Los datos de parámetros y contexto de los modelos comparables no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Tasa de error aproximada de 1 de cada 5 casos en el test v2: el comando propuesto puede ser incorrecto, por lo que debe revisarse siempre antes de ejecutarlo.
- El modelo no evalúa el riesgo de los comandos: esa responsabilidad recae en un verificador determinista externo de la CLI `dale`; fuera de esa herramienta, el usuario asume todo el riesgo.
- Especialización estrecha: está diseñado exclusivamente para nl2bash en Linux; no es adecuado para otras tareas de generación de texto, razonamiento general o código en otros lenguajes.
- Idiomas limitados a español e inglés.
- Longitud de contexto no documentada en la información disponible.
- Riesgo de alucinación inherente a un modelo de 0,8B: puede inventar flags, rutas o utilidades inexistentes.
- Sesgos: no se documentan sesgos específicos, pero al derivar de Qwen3.5-0.8B puede heredar los del modelo base.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-0.8B.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente.

## Enlaces

- Modelo en Hugging Face (GGUF): https://huggingface.co/manuelgscom/dale-0.8b-GGUF
- Modelo base en Hugging Face (BF16 safetensors): https://huggingface.co/manuelgscom/dale-0.8b
- Dataset de evaluación: https://huggingface.co/datasets/manuelgscom/dale-bash-test-v2
- Código fuente de la CLI `dale`: https://github.com/manuelgscom/dale
- Sitio web del autor: https://manuelgs.com/en/dale/
- Colección de la familia `dale`: https://huggingface.co/collections/manuelgscom/dale-6addf69f0c5ce62251553885
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Hermanos de la familia: https://huggingface.co/manuelgscom/dale-4b-GGUF y https://huggingface.co/manuelgscom/dale-9b-GGUF
