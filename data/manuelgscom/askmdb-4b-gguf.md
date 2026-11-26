# manuelgscom/askmdb-4b-GGUF

## Resumen

`askmdb-4b` es un ajuste completo (full fine-tune) del modelo base Qwen3.5-4B, desarrollado por Manuel García Sanz, que traduce preguntas en castellano o inglés sobre una base de datos MongoDB a un único pipeline de `aggregate` de solo lectura, devuelto como un objeto JSON compacto con una explicación breve. El modelo lee en el prompt una descripción compacta del esquema de la base de datos, lo que le permite operar sobre bases que nunca ha visto durante el entrenamiento.

Se distribuye en formato GGUF con cuantización Q4_K_M generada mediante imatrix, con un peso de 2.708,8 MB, y está pensado como el modelo principal de GPU dentro de la herramienta de línea de comandos `askmdb`, que lo ejecuta a través de llama.cpp con backend Vulkan. También puede utilizarse con `llama-server` en cualquier otra aplicación, tanto en CPU como en GPU.

Su relevancia radica en la especialización: con 4.205.751.296 parámetros totales y licencia Apache-2.0, alcanza un 89,6 % de precisión medida por ejecución en un test público de 500 casos, frente al 47,8 % de Qwen3.5-9B y el 45,4 % de Gemma 4 E4B-it sin ajustar. Forma parte de una familia de cuatro tamaños (0.8B, 2B, 4B y 9B) entrenados con los mismos datos y contrato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune completo de Qwen/Qwen3.5-4B) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (imatrix); tamano del archivo 2.708,8 MB |
| Idiomas soportados | es, en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un ajuste completo de Qwen3.5-4B, un transformer de 4.205.751.296 parámetros. No se dispone de información detallada sobre la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO; la model card únicamente indica que se entrenó con los mismos datos y contrato que `askmdb-0.8b`, dentro de una familia de cuatro tamaños con idéntica tarea, datos, contrato y prompt.

La innovación principal no reside en la arquitectura, sino en la especialización funcional: el modelo recibe una descripción compacta del esquema de la base de datos en el prompt y genera un único pipeline `aggregate` de solo lectura junto con una explicación breve, en formato JSON. La cuantización Q4_K_M se generó con imatrix. El modelo no incorpora mecanismos de verificación de seguridad propios: dentro de la CLI `askmdb` la seguridad la garantiza un verificador determinista externo que solo permite pipelines de lectura.

## Capacidades

- Generación de consultas MongoDB: convierte preguntas en lenguaje natural (castellano o inglés) en un único pipeline `aggregate` de solo lectura.
- Generación de explicaciones: acompaña cada pipeline con una explicación breve en un objeto JSON compacto.
- Adaptación a esquemas desconocidos: lee una descripción compacta del esquema en el prompt, por lo que funciona sobre bases de datos que no ha visto durante el entrenamiento.
- Multilingüe: soporta castellano e inglés.
- Integración con llama.cpp: compatible con `llama-server` y con la CLI `askmdb` (backend Vulkan en GPU).
- Salida estructurada: el contrato de respuesta es un objeto JSON pequeño, lo que facilita su consumo programático.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Asistente de consultas para bases MongoDB en producción: un equipo de analistas escribe preguntas en lenguaje natural y el modelo devuelve el pipeline `aggregate` listo para ejecutar, reduciendo la dependencia de conocimiento experto en la sintaxis de agregación.
- Herramienta de línea de comandos para desarrollo: integrado en la CLI `askmdb`, permite explorar bases de datos desde la terminal con respuestas en 1,34 s por pregunta en GPU, agilizando tareas de inspección y depuración.
- Generación de informes ad hoc: el modelo produce pipelines de solo lectura que pueden ejecutarse contra réplicas de lectura para construir informes sin riesgo de modificar datos.
- Soporte a equipos bilingües: al aceptar castellano e inglés, un mismo equipo puede formular preguntas en cualquiera de los dos idiomas sin cambiar de herramienta.
- Onboarding sobre esquemas desconocidos: al leer el esquema en el prompt, resulta adecuado para bases de datos nuevas o de terceros sobre las que el equipo no tiene documentación previa.
- Despliegue en hardware modesto: con 3,3 GiB de VRAM en GPU (mínimo 4 GiB libres) o en CPU mediante llama.cpp, permite habilitar consultas en lenguaje natural en entornos sin infraestructura de GPU de gran escala.
- Integración en aplicaciones propias: mediante `llama-server`, cualquier aplicación puede enviar el esquema y la pregunta y recibir el pipeline JSON para su ejecución controlada.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente) sobre el conjunto de test público `manuelgscom/askmdb-test`, con 500 casos y puntuación por ejecución:

| Modelo | Base | Test (accuracy por ejecución) |
|---|---|---:|
| `askmdb-9b` | Qwen3.5-9B | 91,6 % |
| `askmdb-4b` | Qwen3.5-4B | 89,6 % (448/500) |
| `askmdb-2b` | Qwen3.5-2B | 86,8 % |
| `askmdb-0.8b` | Qwen3.5-0.8B | 83,6 % |
| Qwen3.5-9B (sin ajustar) | — | 47,8 % |
| Gemma 4 E4B-it (sin ajustar) | — | 45,4 % |

No se han publicado en la información disponible resultados de benchmarks generales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: 3,3 GiB con la cuantización Q4_K_M (imatrix) según la model card.
- VRAM libre mínima recomendada en la CLI `askmdb`: 4 GiB para usar el modelo en GPU; con 8 GiB o más es la opción por defecto del diálogo 4B/9B.
- GPU recomendadas: no se especifican modelos concretos; el backend utilizado es Vulkan, por lo que funciona con GPUs dedicadas compatibles con Vulkan.
- GPU de consumo: cabe en GPUs de consumo con al menos 4 GiB de VRAM libre, dado el peso de 2,7 GB del archivo GGUF.
- Opciones de despliegue: llama.cpp (backend Vulkan), `llama-server` y la CLI `askmdb`. No se mencionan vLLM, TGI ni Ollama.
- Latencia: 1,34 s por pregunta en GPU en caliente (warm) según la model card. No se dispone de datos de throughput.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Formato | Test (por ejecución) | Licencia | Disponibilidad |
|---|---|---:|---|---:|---|---|
| `askmdb-4b` | Qwen3.5-4B | 4.205.751.296 | GGUF Q4_K_M | 89,6 % | Apache-2.0 | Hugging Face |
| `askmdb-9b` | Qwen3.5-9B | no disponible | GGUF Q4_K_M (5.629,1 MB) | 91,6 % | no disponible | Hugging Face |
| `askmdb-2b` | Qwen3.5-2B | no disponible | GGUF Q4_K_M (1.274,4 MB) | 86,8 % | no disponible | Hugging Face |
| `askmdb-0.8b` | Qwen3.5-0.8B | no disponible | GGUF Q4_K_M (529,3 MB) | 83,6 % | no disponible | Hugging Face |
| Qwen3.5-9B (sin ajustar) | — | no disponible | no disponible | 47,8 % | no disponible | Hugging Face |
| Gemma 4 E4B-it (sin ajustar) | — | no disponible | no disponible | 45,4 % | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo no decide la seguridad: fuera de la CLI `askmdb` no existe verificador determinista, por lo que debe revisarse siempre la consulta generada y conectarse con un usuario de solo lectura.
- Riesgo de alucinación en la generación de pipelines: aunque la precisión declarada es del 89,6 %, aproximadamente uno de cada diez casos del test falla, lo que exige validación antes de ejecutar en producción.
- Sesgos conocidos: no se dispone de información sobre sesgos evaluados por el autor.
- Limitaciones de idioma: solo se declaran castellano e inglés; no hay soporte documentado para otros idiomas.
- Longitud de contexto: no disponible en la información proporcionada.
- Resultados no verificados: las métricas del model-index están marcadas como `verified: false` y proceden del propio autor.
- Especialización estrecha: el modelo está entrenado exclusivamente para la tarea text-to-query sobre MongoDB; su uso fuera de ese dominio no está documentado ni evaluado.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero deben respetarse las condiciones de la licencia del modelo base Qwen3.5-4B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/manuelgscom/askmdb-4b-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de test: https://huggingface.co/datasets/manuelgscom/askmdb-test
- Colección de la familia askmdb: https://huggingface.co/collections/manuelgscom/askmdb-6ae398e10b4817ed0e7431f1
- Código fuente de la CLI askmdb: https://github.com/manuelgscom/askmdb
- Sitio web del autor: https://manuelgs.com/en/askmdb/
- Modelo askmdb-0.8b: https://huggingface.co/manuelgscom/askmdb-0.8b-GGUF
- Modelo askmdb-2b: https://huggingface.co/manuelgscom/askmdb-2b-GGUF
- Modelo askmdb-9b: https://huggingface.co/manuelgscom/askmdb-9b-GGUF
- Licencia: https://huggingface.co/manuelgscom/askmdb-4b-GGUF/blob/main/LICENSE
- Descarga directa del GGUF: https://huggingface.co/manuelgscom/askmdb-4b-GGUF/resolve/main/askmdb-4b-1.0.0-Q4_K_M.gguf?download=true
