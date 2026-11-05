# mradermacher/Mellum2.1-12B-A2.5B-Thinking-DevSec-merged-bf16-GGUF

## Resumen

Mellum2.1-12B-A2.5B-Thinking-DevSec-merged-bf16-GGUF es una recuantización en formato GGUF del modelo Nullmega/Mellum2.1-12B-A2.5B-Thinking-DevSec-merged-bf16, publicada por mradermacher. El modelo original es un Mixture-of-Experts (MoE) de 12.149.923.072 parámetros totales con aproximadamente 2.500 millones de parámetros activos por token, según indica su nombre (A2.5B). Está orientado a generación de código, con un énfasis explícito en seguridad de aplicaciones (DevSec) y un modo de razonamiento extendido (Thinking).

La relevancia de esta publicación es práctica: el repositorio original en bf16 ocupa decenas de gigabytes, mientras que esta versión ofrece 11 cuantizaciones estáticas que van desde 5,1 GB (Q2_K) hasta 13,0 GB (Q8_0), lo que permite ejecutar el modelo en hardware de consumo con llama.cpp u Ollama. La licencia Apache 2.0 y el soporte declarado de endpoints compatibles facilitan su integración en entornos de desarrollo.

La información pública disponible es escasa: la model card del cuantizador no documenta arquitectura interna, contexto, datos de entrenamiento ni resultados de benchmarks del modelo base. Esta ficha se limita a los datos verificables del repositorio y marca explícitamente como no disponible todo aquello que no figura en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre transformer; detalles internos no disponibles |
| Parámetros totales | 12.149.923.072 |
| Parámetros activos | ~2.500 millones (según denominación A2.5B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo original en bf16 safetensors) |

## Arquitectura y entrenamiento

El modelo base es un Mixture-of-Experts con 12.149.923.072 parámetros totales y aproximadamente 2.500 millones de parámetros activos por token, según la convención de nombres del autor (A2.5B). La información proporcionada no detalla el número de expertos, la dimensión oculta, el número de capas ni el mecanismo de enrutamiento. El sufijo "Thinking" indica un modo de razonamiento extendido, presumiblemente entrenado con datos de cadena de pensamiento, y "DevSec" apunta a una especialización en desarrollo seguro de software.

Los datasets declarados en la model card son nvidia/Open-SWE-Traces (trazas de ingeniería de software), prabhatl0dhi/C_C_plus_plus_Patch_Dataset_for_Secure_Code_LLMs (parches de código seguro en C y C++), open-thoughts/OpenThoughts3-1.2M (razonamiento) y runanlab/gpt-5.4-frontend-development-11062026 (desarrollo frontend). El modelo base es el resultado de una fusión (merged) de un adaptador LoRA sobre Mellum2.1, según los tags del repositorio. No se especifican el volumen total de tokens de entrenamiento, la composición exacta de la mezcla ni si se aplicaron fases de RLHF o DPO.

La contribución de este repositorio es la cuantización estática en GGUF mediante el pipeline de mradermacher (quantize_version 2, output_tensor_quantised 1, convert_type hf). El autor indica que no hay cuantizaciones ponderadas/imatrix disponibles en el momento de la publicación y que no las tiene planificadas salvo petición en la sección de discusiones comunitarias.

## Capacidades

- Generación de texto conversacional en inglés, con soporte de formato conversacional (tag conversational).
- Generación y edición de código, con especialización declarada en parches de código seguro (DevSec) y en C/C++.
- Razonamiento extendido en modo "Thinking", orientado a tareas de varios pasos.
- Razonamiento sobre trazas de ingeniería de software (Open-SWE-Traces) y desarrollo frontend.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes multi-paso: no confirmado explícitamente, aunque los datos de entrenamiento de SWE sugieren cierta capacidad en ese dominio.
- Capacidades multilingües: limitadas al inglés según el campo `language` de la model card.
- Visión, audio u otras modalidades: no disponibles.

## Casos de uso

- Revisión de seguridad de código en C y C++: el modelo se ha afinado con un dataset de parches de código seguro, por lo que puede emplearse para detectar patrones inseguros (desbordamientos de búfer, uso de funciones no seguras) y proponer parches alternativos en un pipeline de revisión previa al merge.
- Asistente de corrección de vulnerabilidades en CI/CD: integrado como paso de análisis en GitHub Actions o GitLab CI mediante llama.cpp, el modelo puede generar sugerencias de parche sobre diffs y adjuntarlas como comentarios de revisión.
- Generación de parches para repositorios: dado el entrenamiento con trazas de SWE, es adecuado para tareas de resolución de issues acotadas donde se espera un diff concreto y verificable.
- Desarrollo frontend asistido: el dataset de desarrollo frontend sugiere uso en generación de componentes y lógica de interfaz, siempre con validación humana dado el riesgo de alucinación en APIs.
- Razonamiento técnico con presupuesto de cómputo ajustado: al tener solo ~2,5B parámetros activos, un despliegue MoE en Q4_K_M (8,2 GB) permite servir razonamiento multi-paso en una única GPU de consumo, lo que resulta útil para prototipos y entornos de investigación con recursos limitados.
- Experimentación local con modelos de código: las 11 cuantizaciones permiten ajustar el equilibrio calidad/memoria según la GPU disponible, desde 5,1 GB en Q2_K hasta 13,0 GB en Q8_0, facilitando pruebas comparativas en estaciones de trabajo sin clúster.
- Evaluación de seguridad de dependencias: el modelo puede analizar fragmentos de código de terceros y señalar construcciones potencialmente peligrosas antes de incorporarlas a un proyecto, como paso adicional en la revisión de dependencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ~5,1 GB; Q3_K_S ~5,9 GB; Q3_K_M ~6,4 GB; Q3_K_L ~6,7 GB; IQ4_XS ~6,8 GB; Q4_K_S ~7,5 GB; Q4_K_M ~8,2 GB; Q5_K_S ~8,7 GB; Q5_K_M ~9,3 GB; Q6_K ~11,0 GB; Q8_0 ~13,0 GB. Hay que añadir memoria para el contexto KV, no cuantificado en estos tamaños.
- GPU recomendadas: al tratarse de un MoE con ~2,5B parámetros activos, un Q4_K_M (8,2 GB) encaja en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080 y RTX 4090. Para Q8_0 (13,0 GB) se recomienda RTX 4090 (24 GB) o GPUs de datacenter como A100 o H100 si se busca mayor throughput y contexto largo.
- ¿Cabe en GPU de consumo? Sí: todas las cuantizaciones hasta Q6_K caben en GPUs de 12-16 GB; Q8_0 requiere 16 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El repositorio declara `endpoints_compatible`. Para el modelo original en bf16 se podría usar vLLM o TGI, pero no se confirma soporte MoE específico en la información disponible.
- Latencia y throughput: no disponibles. Al ser MoE con ~2,5B activos, se espera un throughput superior al de un denso de 12B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Mellum2.1-12B-A2.5B-Thinking-DevSec (este) | 12,15B | ~2,5B | no disponible | Apache 2.0 | GGUF, bf16 |
| Qwen2.5-Coder-7B | 7,6B | denso | 32K (típico) | Apache 2.0 | safetensors, GGUF |
| DeepSeek-Coder-V2-Lite | 15,7B | 2,4B | 128K | DeepSeek License | safetensors, GGUF |
| CodeLlama-13B | 13B | denso | 16K | Llama 2 License | safetensors, GGUF |

La comparación se ofrece a título orientativo por categoría (código, tamaño similar); no se dispone de datos de benchmarks del modelo Mellum que permitan una comparación cuantitativa. Los datos de los modelos alternativos provienen de sus respectivas model cards públicas y deben verificarse antes de usarlos en producción.

## Limitaciones y advertencias

- Idiomas: la model card declara únicamente inglés; el rendimiento en castellano no está garantizado ni documentado.
- Contexto: la longitud de contexto no está publicada; planificar despliegues con ventanas conservadoras y validar empíricamente.
- Alucinación: como todo modelo de código, puede generar APIs, funciones o parches inexistentes; es obligatoria la validación mediante tests y revisión humana antes de aplicar cambios.
- Especialización estrecha: el ajuste DevSec y los datasets de C/C++ y frontend pueden reducir el rendimiento en otros lenguajes o dominios no representados en el entrenamiento.
- Licencia: Apache 2.0 permite uso comercial, pero deben revisarse las licencias de los datasets de entrenamiento (nvidia/Open-SWE-Traces, open-thoughts/OpenThoughts3-1.2M, entre otros) por si imponen restricciones adicionales sobre los pesos derivados.
- Cuantizaciones: las estáticas de menor tamaño (Q2_K, Q3_K_S) degradan la calidad; el autor recomienda Q4_K_S o Q4_K_M para uso general y Q8_0 cuando la VRAM lo permite. No hay cuantizaciones imatrix disponibles.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia comunitaria de validación en producción.
- Modo Thinking: no se documenta cómo activarlo ni desactivarlo, ni el coste en tokens que añade; conviene medirlo antes de fijar presupuestos de latencia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Mellum2.1-12B-A2.5B-Thinking-DevSec-merged-bf16-GGUF
- Modelo base (bf16): https://huggingface.co/Nullmega/Mellum2.1-12B-A2.5B-Thinking-DevSec-merged-bf16
- Página de descargas del cuantizador: https://hf.tst.eu/model#Mellum2.1-12B-A2.5B-Thinking-DevSec-merged-bf16-GGUF
- Dataset nvidia/Open-SWE-Traces: https://huggingface.co/datasets/nvidia/Open-SWE-Traces
- Dataset prabhatl0dhi/C_C_plus_plus_Patch_Dataset_for_Secure_Code_LLMs: https://huggingface.co/datasets/prabhatl0dhi/C_C_plus_plus_Patch_Dataset_for_Secure_Code_LLMs
- Dataset open-thoughts/OpenThoughts3-1.2M: https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M
- Dataset runanlab/gpt-5.4-frontend-development-11062026: https://huggingface.co/datasets/runanlab/gpt-5.4-frontend-development-11062026
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
