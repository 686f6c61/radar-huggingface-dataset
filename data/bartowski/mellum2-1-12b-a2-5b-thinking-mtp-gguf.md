# bartowski/Mellum2.1-12B-A2.5B-Thinking-MTP-GGUF

## Resumen

Mellum2.1-12B-A2.5B-Thinking-MTP es un modelo de lenguaje de JetBrains especializado en tareas de programación y razonamiento, publicado en formato GGUF por bartowski (cuantizaciones imatrix realizadas con llama.cpp, release b11969). Se trata de la variante "Thinking" con decodificación especulativa mediante MTP (Multi-Token Prediction), lo que permite acelerar la inferencia prediciendo varios tokens por paso.

El modelo adopta una arquitectura MoE (Mixture of Experts) con aproximadamente 12.578 millones de parámetros totales y unos 2.500 millones activos por token, lo que lo sitúa en la categoría de modelos "small MoE": capacidad de un modelo de 13B con coste de cómputo de un modelo de 2-3B. Esto lo hace especialmente relevante para ejecución en hardware de consumo y para agentes de código en local.

Su relevancia actual radica en los resultados declarados por JetBrains en benchmarks de código (91,5 en HumanEval+, 82 en LiveCodeBench v6, 47% en SWE-bench Verified) y razonamiento matemático (83,3 en AIME 25/26), combinados con una licencia Apache 2.0 que permite uso comercial sin restricciones. El idioma principal del modelo es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con MTP para decodificacion especulativa |
| Parametros totales | 12.578.294.528 (~12,58B) |
| Parametros activos | ~2,5B (según la denominación A2.5B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con imatrix (Q4_K_M recomendado por el autor, 9,01 GB; el resto de cuants no se detallan en la informacion disponible) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); modelo original en safetensors (JetBrains/Mellum2.1-12B-A2.5B-Thinking-MTP) |

## Arquitectura y entrenamiento

El modelo es un transformer disperso de tipo MoE: de los ~12,58B de parámetros totales, solo ~2,5B se activan por token, lo que reduce el coste de inferencia manteniendo la capacidad representacional del checkpoint completo de 13B. La variante "MTP" incorpora predicción multi-token (Multi-Token Prediction), una técnica de decodificación especulativa en la que cabezas auxiliares proponen varios tokens consecutivos que el modelo principal verifica, aumentando el throughput de generación sin degradar la calidad.

La variante "Thinking" indica que el modelo está alineado para producir razonamiento explícito paso a paso antes de la respuesta final, lo que explica sus resultados en AIME y GPQA Diamond. Los detalles del preentrenamiento (número de tokens, composición del dataset) y del post-entrenamiento (RLHF, DPO) no están disponibles en la información proporcionada, aunque el perfil de benchmarks sugiere un entrenamiento intensivo en código y matemáticas coherente con el enfoque de JetBrains en herramientas de desarrollo.

## Capacidades

- Generación de código: resultados destacados en HumanEval+ (91,5), MBPP+ (79,4), LiveCodeBench v6 (82) y SWE-bench Verified (47% resuelto).
- Razonamiento matemático: 83,3 de exact match en AIME 25/26 y 88,3 en GSM-Plus.
- Razonamiento general con modo "thinking": genera cadenas de razonamiento explícitas antes de la respuesta.
- Tool calling / function calling: soporte nativo mediante el formato de plantilla con definiciones de herramientas en XML (`<tools>`, `<tool_call>`), con resultados de 62,3 en BFCL v4 y 49,1 en ToolHop.
- Agentes multi-step: 44,6% de finalización de tareas en WorkBench y 17,4% en Terminal-Bench 2.1, orientado a flujos agénticos de terminal y herramientas.
- Seguimiento de instrucciones: 90,6 en IFEval.
- Decodificación especulativa vía MTP para inferencia más rápida.
- Entrada solo de texto (sin visión ni audio).

## Casos de uso

- Asistente de codigo en el IDE: dado el perfil de JetBrains, el modelo es adecuado para completacion y generacion de funciones en editores; su tamaño activo de ~2,5B permite latencias bajas suficientes para autocompletado interactivo.
- Agentes de reparacion de bugs (SWE-agent): con un 47% en SWE-bench Verified y soporte de tool calling, puede integrarse en pipelines que naveguen repositorios, editen archivos y ejecuten tests de forma autonoma.
- Resolucion de problemas de matematicas y algoritmia: el modo thinking y su puntuacion en AIME 25/26 lo hacen util para generar soluciones razonadas a problemas competitivos.
- Ejecucion local en GPU de consumo: la cuantizacion Q4_K_M (9,01 GB) cabe en una RTX 4090 o incluso en GPUs de 12 GB, permitiendo asistentes privados sin enviar codigo a la nube.
- Orquestacion de herramientas en backends: el formato de tool calling con XML es compatible con frameworks como llama.cpp y clientes que implementen el estandar ChatML, facilitando chatbots con acceso a APIs.
- Revision y refactorizacion de codigo: puede analizar fragmentos de codigo, proponer refactorizaciones y explicar cambios paso a paso gracias a su modo de razonamiento explicito.
- Evaluacion de seguridad de prompts: con 88,8 en XSTest y 8,5% de tasa harmful en HarmBench, puede usarse en entornos donde se requiere un comportamiento moderadamente alineado.

## Benchmarks y rendimiento

Resultados declarados por JetBrains en la model card del modelo original (no verificados de forma independiente):

| Benchmark | Metrica | Resultado |
|---|---|---|
| LiveCodeBench v6 | pass@1 | 82,0 |
| HumanEval+ | pass@1 | 91,5 |
| MBPP+ | pass@1 | 79,4 |
| AIME 25/26 | exact match | 83,3 |
| GSM-Plus | exact match | 88,3 |
| SWE-bench Verified | resolved rate | 47,0% |
| SWE-bench Pro | resolved rate | 28,0% |
| Terminal-Bench 2.1 | resolved rate | 17,4% |
| BFCL v4 | accuracy | 62,3 |
| WorkBench | task completion | 44,6% |
| ToolHop | accuracy | 49,1 |
| IFEval | accuracy | 90,6 |
| GPQA Diamond | accuracy | 64,6 |
| MMLU-Redux | accuracy | 87,8 |
| MixEval-Hard | accuracy | 46,4 |
| XSTest | safe compliance | 88,8 |
| HarmBench | harmful rate (menor es mejor) | 8,5 |

No se incluyen en la informacion disponible comparativas directas con otros modelos para estos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: la cuantizacion Q4_K_M ocupa 9,01 GB en disco, por lo que se recomiendan al menos 10-12 GB de VRAM para el modelo mas contexto; cuantizaciones superiores (Q8, FP16) requeriran proporcionalmente mas memoria (el checkpoint completo en FP16 rondaria los ~25 GB para 12,58B de parametros).
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones altas con contexto amplio; RTX 3060/4060 Ti de 12-16 GB para Q4_K_M; en entorno servidor, A100 o H100 para despliegues concurrentes con vLLM.
- Consumer GPU: si, la variante Q4_K_M cabe comodamente en GPUs de 12 GB o mas; en GPUs de 8 GB habria que recurrir a cuantizaciones mas agresivas (no listadas en la informacion disponible).
- Despliegue: llama.cpp (release b11969 o superior, necesario para el formato MTP), Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo original en safetensors podria servirse con vLLM o TGI, aunque la compatibilidad con MoE y MTP depende de la version del runtime.
- Latencia y throughput: gracias a la decodificacion especulativa MTP y a los ~2,5B de parametros activos, se espera un throughput notablemente superior al de un denso de 13B; no hay cifras oficiales de tokens/segundo en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales/activos | Licencia | Especializacion | Formato |
|---|---|---|---|---|
| Mellum2.1-12B-A2.5B-Thinking-MTP | 12,58B / ~2,5B | Apache 2.0 | Codigo y razonamiento, thinking + MTP | GGUF, safetensors |
| Qwen3-30B-A3B (referencia de categoria MoE pequena) | ~30B / ~3B | Apache 2.0 | Generalista con modo thinking | GGUF, safetensors |
| Devstral Small / modelos de codigo de 24B densos (referencia) | ~24B densos | Apache 2.0 | Agentes de codigo (SWE-bench) | GGUF, safetensors |
| Modelos denso de 7-8B de codigo (p. ej. CodeLlama 7B, referencia historica) | ~7B densos | Licencias variadas | Codigo | GGUF, safetensors |

Nota: la comparativa es orientativa; los datos de rendimiento de los modelos alternativos no se incluyen en la informacion proporcionada, por lo que no pueden contrastarse numericamente aqui.

## Limitaciones y advertencias

- Idioma: el modelo esta etiquetado solo para ingles; su rendimiento en castellano no esta documentado y probablemente sea inferior al de modelos multilingues.
- Vision y audio: no soportados; la entrada es exclusivamente textual.
- Longitud de contexto: no especificada en la informacion disponible, lo que dificulta planificar cargas con documentos o repositorios grandes.
- Terminal-Bench 2.1 (17,4%) y SWE-bench Pro (28%) indican que las tareas agenticas largas y de alta dificultad siguen siendo un punto debil relativo frente a sus resultados en benchmarks estaticos de codigo.
- Riesgo de alucinacion: no cuantificado en la model card; como en cualquier LLM, las salidas de codigo deben validarse con tests antes de usarse en produccion.
- Sesgos: no se documentan sesgos especificos; las metricas de seguridad (XSTest 88,8, HarmBench 8,5% harmful) sugieren una alineacion moderada, no absoluta.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion sin restricciones relevantes, aunque conviene revisar las aceptables use policies del modelo original de JetBrains.
- Las cuantizaciones GGUF con imatrix pueden introducir una ligera degradacion respecto al checkpoint original, especialmente en cuants bajos; el autor recomienda Q4_K_M como equilibrio.
- Los benchmarks son declarados por el propio autor y no estan verificados de forma independiente.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/bartowski/Mellum2.1-12B-A2.5B-Thinking-MTP-GGUF
- Modelo original (JetBrains): https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking-MTP
- llama.cpp (release usada para la cuantizacion, b11969): https://github.com/ggml-org/llama.cpp/releases/tag/b11969
- Repositorio principal de llama.cpp: https://github.com/ggml-org/llama.cpp/
- Fichero Q4_K_M recomendado: https://huggingface.co/bartowski/Mellum2.1-12B-A2.5B-Thinking-MTP-GGUF/blob/main/Mellum2.1-12B-A2.5B-Thinking-MTP-Q4_K_M.gguf
