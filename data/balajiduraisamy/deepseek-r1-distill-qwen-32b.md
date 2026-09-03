# balajiduraisamy/DeepSeek-R1-Distill-Qwen-32B

## Resumen

DeepSeek-R1-Distill-Qwen-32B es un modelo de lenguaje denso de 32 000 millones de parámetros, desarrollado por DeepSeek, que surge de la destilación de las trazas de razonamiento del modelo DeepSeek-R1 sobre la base de Qwen2.5-32B. El objetivo es transferir las capacidades de razonamiento paso a paso del modelo R1 a un modelo más pequeño y eficiente, manteniendo un rendimiento competitivo en tareas de matemáticas, código y lógica. Es el punto dulce de la serie de destilados de DeepSeek: su tamaño permite ejecutarlo en una única GPU de alta memoria, y según el paper original supera a OpenAI o1-mini en los benchmarks AIME 2024 y MATH-500.

El modelo se publica bajo licencia MIT, lo que facilita su uso comercial y su integración en productos. Su arquitectura es un transformer decoder-only estándar, con una ventana de contexto de 128 000 tokens, y está disponible en formatos safetensors y GGUF. Aunque el repositorio original de DeepSeek es de acceso abierto, el mirror alojado en `balajiduraisamy/DeepSeek-R1-Distill-Qwen-32B` requiere aceptar condiciones de acceso (gated), por lo que se recomienda descargar el modelo desde la fuente oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 32 763 876 352 (32,7 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128 000 tokens |
| Tipos de cuantizacion | FP16, BF16, GGUF (Q4_K_M, Q5_K_M, Q8_0, etc.) |
| Idiomas soportados | Ingles, chino y otros idiomas cubiertos por Qwen2.5 (29 idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen2.5-32B, un transformer decoder-only con atención de múltiples cabezas y normalización RMSNorm. No emplea mezcla de expertos (MoE), por lo que todos los parámetros se activan en cada inferencia. El entrenamiento consistió en un ajuste fino supervisado (SFT) sobre un conjunto de datos de trazas de razonamiento generadas por DeepSeek-R1, que incluyen cadenas de pensamiento detalladas, verificación de pasos y resolución de problemas matemáticos y de código. No se aplicó RLHF posterior; la destilación se realizó directamente sobre las salidas del modelo profesor.

Una innovación destacable es que, a diferencia de otros destilados que usan datos sintéticos genéricos, DeepSeek utilizó el propio R1 para generar razonamientos de alta calidad, lo que permite que el modelo pequeño herede la capacidad de "pensar" antes de responder. El resultado es un modelo que produce respuestas con una sección de razonamiento explícita, similar al modo "thinking" de otros sistemas, aunque sin un control de activación dedicado.

## Capacidades

- Razonamiento paso a paso: genera cadenas de pensamiento detalladas antes de dar la respuesta final, lo que mejora la precisión en problemas complejos.
- Matematicas avanzadas: resuelve problemas de nivel competitivo (AIME, MATH-500) con alta tasa de acierto.
- Generacion de codigo: escribe y depura codigo en multiples lenguajes, con soporte para explicaciones de algoritmos.
- Tool calling / function calling: compatible con la interfaz de Qwen2.5, permite invocar funciones externas en entornos de agentes.
- Multilingue: cubre 29 idiomas, con especial solidez en ingles y chino.
- Generacion de texto general: redaccion, resumen, traduccion y tareas conversacionales.
- No incluye capacidades de vision ni audio; es exclusivamente texto.

## Casos de uso

- Asistente de razonamiento para estudiantes: el modelo puede desglosar problemas de matematicas o fisica paso a paso, explicando cada transformacion, lo que lo hace util en plataformas educativas interactivas.
- Generacion de codigo en produccion: gracias a su soporte de tool calling, puede integrarse en pipelines de CI/CD para autogenerar tests, documentar funciones o refactorizar modulos, reduciendo el trabajo manual del desarrollador.
- Analisis de datos y reportes: con su contexto de 128k tokens, puede procesar grandes volumenes de texto (logs, informes) y extraer conclusiones razonadas, util en herramientas de business intelligence.
- Chatbots de soporte tecnico: su capacidad de razonamiento permite diagnosticar problemas complejos a partir de descripciones largas y multi-turno, ofreciendo soluciones mas precisas que modelos genericos.
- Agentes autonomos de investigacion: puede planificar y ejecutar busquedas web (via tool calling), leer documentos y sintetizar informacion, sirviendo como base para agentes de investigacion de mercado o academica.
- Traduccion y localizacion con contexto: al manejar 29 idiomas y un contexto amplio, puede traducir documentos extensos manteniendo coherencia terminologica, ideal para equipos de localizacion.

## Benchmarks y rendimiento

No se han publicado resultados numericos detallados en la informacion disponible. Sin embargo, el paper de DeepSeek-R1 (arXiv:2501.12948) reporta que DeepSeek-R1-Distill-Qwen-32B supera a OpenAI o1-mini en los benchmarks AIME 2024 y MATH-500, estableciendo un nuevo estado del arte para modelos densos de tamano comparable. Para cifras exactas, se recomienda consultar la tabla de resultados del paper original.

## Requisitos de hardware

- VRAM estimada: en FP16/BF16, el modelo ocupa aproximadamente 65 GB, por lo que requiere una GPU con al menos 80 GB (A100, H100) o dos GPUs de 40 GB. Con cuantizacion 4-bit (GGUF Q4_K_M), el uso de VRAM baja a unos 20 GB, permitiendo ejecucion en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB).
- GPUs recomendadas: A100 80GB, H100 80GB para precision completa; RTX 4090, RTX 3090, A6000 para cuantizacion.
- Opciones de despliegue: vLLM, TensorRT-LLM, llama.cpp, Ollama, Text Generation Inference (TGI). Todos soportan el formato safetensors o GGUF.
- Latencia y throughput: no se dispone de mediciones oficiales. En una A100 80GB con FP16, se espera un throughput de 20-40 tokens/s para generacion de razonamiento largo; con cuantizacion 4-bit en RTX 4090, la latencia aumenta pero sigue siendo viable para aplicaciones interactivas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento en AIME 2024 | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-32B | 32,7 B | 128k | MIT | Supera a o1-mini (segun paper) | HuggingFace, NIM |
| Qwen2.5-32B (base) | 32,5 B | 128k | Apache 2.0 | Inferior (sin destilacion) | HuggingFace |
| DeepSeek-R1-Distill-Llama-70B | 70 B | 128k | MIT | Similar o ligeramente superior | HuggingFace |
| OpenAI o1-mini | No publico | 128k | Propietaria | Inferior (segun paper) | API de pago |

El modelo destilado de 32B ofrece el mejor equilibrio entre rendimiento y requisitos de hardware frente a la version de 70B, que requiere el doble de VRAM. Comparado con Qwen2.5-32B base, la destilacion anade una capa de razonamiento que mejora notablemente las tareas de logica y matematicas, aunque el modelo base puede ser mas rapido en generacion simple.

## Limitaciones y advertencias

- Sesgos heredados: al estar basado en Qwen2.5, puede reflejar sesgos presentes en los datos de entrenamiento de Qwen, especialmente en temas politicos o culturales.
- Riesgo de alucinacion: como todo LLM, puede generar informacion falsa o inventada, especialmente en dominios poco representados en su entrenamiento.
- Razonamiento extenso: el modelo tiende a producir cadenas de pensamiento largas, lo que aumenta la latencia y el coste computacional en comparacion con modelos que responden directamente.
- Contexto limitado a 128k: aunque amplio, no es infinito; documentos muy largos pueden truncarse o perder coherencia.
- Licencia MIT: permite uso comercial sin restricciones, pero el modelo se distribuye tal cual, sin garantias. El mirror `balajiduraisamy` es gated, por lo que se debe solicitar acceso; el repositorio oficial de DeepSeek no tiene esta restriccion.
- No soporta vision ni audio: solo texto, lo que limita su uso en aplicaciones multimodales.

## Enlaces

- Repositorio oficial en HuggingFace: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-32B
- Mirror en HuggingFace (gated): https://huggingface.co/balajiduraisamy/DeepSeek-R1-Distill-Qwen-32B
- Paper de DeepSeek-R1: https://arxiv.org/abs/2501.12948
- Pagina del modelo en NVIDIA NIM: https://build.nvidia.com/deepseek-ai/deepseek-r1-distill-qwen-32b
- Documentacion de DeepWiki sobre modelos destilados: https://deepwiki.com/deepseek-ai/DeepSeek-R1/2.3-distilled-models
