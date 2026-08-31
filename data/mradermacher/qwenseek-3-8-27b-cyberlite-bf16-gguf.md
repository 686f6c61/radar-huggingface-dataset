# mradermacher/Qwenseek-3.8-27B-CyberLite-BF16-GGUF

## Resumen

Qwenseek-3.8-27B-CyberLite-BF16 es un modelo de lenguaje de 27 320 millones de parámetros, desarrollado por el usuario trjxter mediante fine-tuning sobre la base Qwen3.8-27B (arquitectura Qwen3.5/3.8). El modelo está especializado en razonamiento, generación de código, ingeniería de software, tool calling, uso agéntico y ciberseguridad defensiva, con un enfoque de red team controlado. El entrenamiento combina destilación de profesor (usando salidas de DeepSeek-V4) con SFT vía LoRA/QLoRA, lo que permite transferir capacidades de razonamiento avanzado a un modelo de menor tamaño.

Esta versión concreta es una cuantización GGUF realizada por mradermacher, que ofrece múltiples niveles de compresión (desde Q2_K hasta Q8_0) para facilitar la ejecución en hardware variado, incluyendo GPUs de consumo. El modelo base se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones. Aunque la model card indica soporte únicamente para inglés, los tags sugieren capacidades multimodales (se incluyen archivos mmproj), aunque no se detalla su alcance.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.8) |
| Parametros totales | 27 320 697 856 (27,3B) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3.8-27B soporta 262 000 tokens, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Transformer de Qwen3.8-27B, que incorpora mecanismos de atención estándar y posiblemente mejoras propias de la serie Qwen (como atención con ventana deslizante o atención lineal, aunque no se detalla en la documentación disponible). El fine-tuning se realizó mediante LoRA/QLoRA con SFT, utilizando dos datasets de destilación: `trjxter/DeepSeek-V4-Flash-0731-Teacher-Distillation-40513x` (40 513 ejemplos) y `trjxter/DeepSeek-V4-Pro-Reasoning-8000x` (8 000 ejemplos). Estos datasets contienen salidas generadas por modelos DeepSeek-V4, lo que permite transferir capacidades de razonamiento y resolución de problemas al modelo más pequeño. No se menciona el uso de RLHF o DPO; el entrenamiento se basa únicamente en supervisión directa (SFT).

La cuantización GGUF fue realizada por mradermacher con conversión estática (sin imatrix), manteniendo la estructura original del modelo. Se incluyen archivos mmproj (proyectores multimodales) que sugieren que el modelo base podría tener capacidades de visión, aunque no se especifica en la documentación.

## Capacidades

- Generación de texto y razonamiento complejo, potenciado por la destilación de DeepSeek-V4.
- Generación de código y soporte para ingeniería de software (debugging, refactorización, revisión de código).
- Tool calling / function calling, lo que permite integrarse con APIs y herramientas externas.
- Uso agéntico: capacidad de planificar y ejecutar tareas multi-paso.
- Ciberseguridad defensiva: análisis de vulnerabilidades, detección de amenazas, generación de informes de seguridad.
- Red team controlado: simulación de ataques y pruebas de penetración en entornos controlados.
- Multilingüe: solo inglés confirmado; no se documentan otros idiomas.
- Posible capacidad multimodal (visión) gracias a los archivos mmproj, aunque no se detalla su funcionamiento.

## Casos de uso

- Análisis de vulnerabilidades en código: el modelo puede revisar repositorios y señalar fallos de seguridad (inyección SQL, desbordamiento de búfer, etc.) gracias a su entrenamiento en ciberseguridad y generación de código.
- Automatización de respuestas a incidentes: integrado en un pipeline de SOC, puede clasificar alertas, sugerir acciones de mitigación y redactar informes técnicos.
- Asistente de desarrollo seguro: durante la escritura de código, sugiere patrones seguros y detecta malas prácticas en tiempo real, usando tool calling para consultar bases de datos de CVEs.
- Simulación de ataques controlados (red team): genera vectores de ataque y pruebas de concepto para evaluar la postura de seguridad de una organización, siempre en entornos autorizados.
- Generación de documentación técnica: a partir de código fuente o especificaciones, produce manuales, guías de despliegue y documentación de API.
- Chatbot de soporte técnico especializado en seguridad: con contexto largo (si se confirma la ventana de 262k), puede mantener conversaciones extensas sobre configuraciones de red, políticas de seguridad y cumplimiento normativo.
- Automatización de tareas de administración de sistemas: mediante tool calling, ejecuta comandos de auditoría, analiza logs y genera resúmenes de estado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K. Se recomienda consultar el repositorio del modelo base (Qwen3.8-27B) para referencias de rendimiento, aunque este fine-tune puede diferir.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización elegida. Por ejemplo, Q4_K_M (16,9 GB) requiere aproximadamente 20 GB de VRAM; Q8_0 (29,1 GB) requiere unos 32 GB; Q2_K (11,0 GB) puede caber en 12-16 GB.
- GPUs recomendadas: para cuantizaciones bajas (Q2_K, Q3_K), una RTX 3090/4090 (24 GB) es suficiente. Para Q4_K_M, una RTX 4090 o A100 40 GB. Para Q8_0, se necesitan GPUs de 32 GB o más (A100, H100).
- En consumer GPU: sí, las cuantizaciones Q2_K a Q4_K_M pueden ejecutarse en GPUs de 16-24 GB (RTX 4080, RTX 4090).
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio y servidores como vLLM (con conversión previa). También se puede usar con transformers si se descargan los safetensors del modelo base.
- Latencia y throughput: no disponible. Depende del hardware y la cuantización; en una RTX 4090 con Q4_K_M se esperan velocidades de 20-40 tokens/s, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwenseek-3.8-27B-CyberLite (este) | 27,3B | no disponible | Apache 2.0 | Ciberseguridad, razonamiento, código |
| Qwen3.8-27B (base) | 27,3B | 262k | Apache 2.0 | Generalista, multimodal |
| DeepSeek-V4 (profesor) | no disponible | no disponible | no disponible | Razonamiento avanzado, código |

No se dispone de datos de rendimiento comparativo. La comparación se basa en características declaradas. El modelo base Qwen3.8-27B es la referencia natural; este fine-tune añade especialización en seguridad y destilación de razonamiento.

## Limitaciones y advertencias

- Solo soporta inglés de forma confirmada; puede degradarse en otros idiomas.
- Al ser un fine-tune sobre Qwen3.8, puede heredar sesgos del modelo base y de los datos de destilación (DeepSeek-V4).
- Riesgo de alucinación en tareas de razonamiento complejo, especialmente en contextos de seguridad donde las consecuencias de errores pueden ser graves.
- La ventana de contexto no está confirmada para este fine-tune; si se reduce respecto al base, podría limitar tareas de análisis de documentos largos.
- La cuantización GGUF estática (sin imatrix) puede degradar ligeramente la calidad frente a versiones con imatrix, especialmente en cuantizaciones bajas (Q2_K, Q3_K).
- El uso en ciberseguridad ofensiva (red team) debe restringirse a entornos autorizados y legales; el modelo no debe emplearse para actividades maliciosas.
- No se han publicado benchmarks propios, por lo que el rendimiento real en tareas específicas debe validarse antes de su uso en producción.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/mradermacher/Qwenseek-3.8-27B-CyberLite-BF16-GGUF
- Modelo base (safetensors): https://huggingface.co/trjxter/Qwenseek-3.8-27B-CyberLite-BF16
- Guía de descarga de Qwen3.8-27B (referencia del modelo base): https://www.orcarouter.ai/blog/qwen-3-8-27b-huggingface
- Especificaciones y requisitos de Qwen3.8-27B: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Noticia sobre el lanzamiento de Qwen3.8-27B: https://cybernews.com/tech/qwen-38-27b-ai-model-debuts-with-million-downloads/
