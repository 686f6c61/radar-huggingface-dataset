# alwoolley/Qwen3-4B-bf16

## Resumen

Este repositorio contiene los pesos completos en precisión bfloat16 (bf16) del modelo Qwen3-4B, publicados por el usuario alwoolley. Se trata de una copia de los pesos base del modelo original de Alibaba Cloud, aparentemente sin modificaciones adicionales, aunque la model card es extremadamente escueta y no aporta detalles sobre el proceso de creación ni sobre posibles ajustes. El modelo base Qwen3-4B es un transformer denso de 4 mil millones de parámetros, diseñado para tareas de lenguaje general, razonamiento, generación de código y matemáticas, con soporte de modos de pensamiento híbridos (thinking y non-thinking). La relevancia de este repositorio radica en ofrecer los pesos en bf16, que es la precisión de entrenamiento original, lo que puede ser útil para fine-tuning o para inferencia de máxima fidelidad, aunque la licencia "other" y la falta de documentación limitan su uso directo en producción.

El archivo de pesos en formato safetensors ocupa 8,1 GB, lo que corresponde a aproximadamente 4.021.784.576 parámetros. No se proporcionan datos sobre longitud de contexto, idiomas soportados, cuantizaciones alternativas ni detalles de entrenamiento. Para conocer las especificaciones completas del modelo subyacente, es necesario remitirse a la ficha oficial de Qwen/Qwen3-4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) |
| Parametros totales | 4.021.784.576 |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | no disponible (el modelo original Qwen3-4B soporta 32.768 tokens, pero no se confirma en este repositorio) |
| Tipos de cuantizacion | bf16 (pesos completos) |
| Idiomas soportados | no disponible (el modelo original es multilingue, pero no se especifica aqui) |
| Licencia | other (no se detalla; el Qwen3-4B original usa Apache-2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Qwen3, un transformer denso basado en el diseño de Qwen2.5, con mejoras en el mecanismo de atención y en el manejo de contextos largos. El modelo original incorpora un modo híbrido de razonamiento que alterna entre pensamiento explícito (thinking) y respuesta directa (non-thinking), controlable mediante un token especial o configuración de generación. En cuanto al entrenamiento, no se dispone de información específica sobre este repositorio; el modelo base Qwen3-4B fue entrenado con un corpus multilingüe masivo y posteriormente refinado con técnicas de supervisión y optimización para alineación, pero estos datos no se replican en esta ficha. La única innovación destacable en este checkpoint es el uso de bf16 como precisión de almacenamiento, que preserva la fidelidad numérica del entrenamiento original.

## Capacidades

- Generación de texto en múltiples idiomas (según el modelo base, no confirmado en este repositorio).
- Razonamiento paso a paso con modo "thinking" opcional.
- Generación de código y resolución de problemas matemáticos.
- Comprensión lectora y respuesta a preguntas.
- Soporte de tool calling y function calling (en el modelo base, no verificado aquí).
- Capacidades multilingües (el Qwen3-4B original soporta más de 100 idiomas, pero este checkpoint no lo documenta).

## Casos de uso

- Fine-tuning especializado: al disponer de los pesos en bf16, es adecuado para ajustar el modelo en dominios concretos (por ejemplo, finanzas, dado el tag "financial-tape") mediante técnicas como LoRA o fine-tuning completo, partiendo de una base de alta calidad.
- Inferencia de máxima precisión: en entornos donde se prioriza la fidelidad numérica sobre la eficiencia, por ejemplo en investigación o en sistemas de evaluación de modelos.
- Desarrollo de agentes conversacionales: el modelo base Qwen3-4B puede gestionar diálogos multi-turno y razonamiento complejo, aunque se debe verificar la licencia antes de usarlo en producción.
- Prototipado rápido: con 4B parámetros, es viable ejecutarlo en GPUs de gama media (16 GB VRAM) para experimentar con generación de código, resúmenes o asistentes técnicos.
- Comparación de precisiones: al tener únicamente pesos bf16, permite estudiar el impacto de la cuantización frente a versiones en FP8 o INT4 del mismo modelo.
- Evaluación de sesgos y robustez: al ser un checkpoint sin modificar, sirve como referencia para medir comportamientos del modelo original antes de cualquier ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este repositorio especifico. El modelo original Qwen3-4B reporta cifras en MMLU, HumanEval, GSM8K y otros, pero no se proporcionan aquí y no deben inferirse. Para obtener datos comparativos, se recomienda consultar la documentación oficial de Qwen3-4B.

## Requisitos de hardware

- VRAM estimada: los pesos en bf16 ocupan aproximadamente 8 GB, más overhead de inferencia (KV cache, activaciones), por lo que se necesita al menos 12-16 GB de VRAM para una sesión con contexto moderado.
- GPU recomendadas: NVIDIA RTX 4080/4090 (16-24 GB), A100 40 GB, H100, o cualquier acelerador con al menos 16 GB de memoria.
- En consumer GPU: cabe en tarjetas con 16 GB o más (RTX 4080, RTX 4090, RTX 5080) con cuantización adicional para reducir requisitos, aunque este repositorio solo ofrece bf16.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (si se convierte a GGUF), TGI (Text Generation Inference), o transformers de HuggingFace.
- Latencia y throughput: no disponibles para este checkpoint; en una RTX 4090 se espera una generación de decenas de tokens por segundo, pero depende de la implementación y del contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| alwoolley/Qwen3-4B-bf16 | 4,0B | no disponible | other | safetensors bf16 |
| Qwen/Qwen3-4B | 4,0B | 32.768 | Apache-2.0 | safetensors, GGUF, MLX |
| Llama-3.2-3B | 3,2B | 128.000 | Llama 3.2 Community | safetensors, GGUF |
| Phi-3-mini (3.8B) | 3,8B | 4.096 | MIT | safetensors, GGUF |

La principal diferencia con el Qwen3-4B oficial es la licencia (other frente a Apache-2.0) y la ausencia de documentación. El resto de modelos comparables ofrecen contextos más largos (Llama-3.2) o licencias permisivas (Phi-3), pero Qwen3-4B destaca por su rendimiento en razonamiento y código.

## Limitaciones y advertencias

- Licencia "other" no especificada: puede implicar restricciones de uso comercial o modificaciones; es imprescindible contactar con el autor o revisar los archivos del repositorio antes de cualquier uso.
- Ausencia de documentación: no se detallan datos de entrenamiento, sesgos, ni instrucciones de uso.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o no verificada, especialmente en dominios especializados.
- Limitaciones de contexto: no se confirma la longitud de contexto; si se usa con la configuración por defecto del modelo base, se recomienda no superar los 32K tokens, pero no está garantizado.
- Sin garantías de rendimiento: al ser un repositorio sin mantenimiento aparente, no se asegura compatibilidad con versiones futuras de librerías.
- Sesgos potenciales: el modelo original puede reflejar sesgos presentes en sus datos de entrenamiento; no se han realizado evaluaciones específicas en este checkpoint.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/alwoolley/Qwen3-4B-bf16
- Modelo original Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Versión MLX (Apple Silicon): https://huggingface.co/Qwen/Qwen3-4B-MLX-bf16
- Recetas de despliegue con vLLM: https://recipes.vllm.ai/Qwen/Qwen3-4B
- Artículo con benchmarks y comparativas: https://dev.to/best_codes/qwen-3-benchmarks-comparisons-model-specifications-and-more-4hoa
- Ficha en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b
