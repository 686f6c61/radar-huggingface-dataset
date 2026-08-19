# nernstpolga/new_hk_5dmrycs4ln

## Resumen

El modelo `nernstpolga/new_hk_5dmrycs4ln` es un modelo de lenguaje de tipo Mixture of Experts (MoE) basado en la arquitectura Qwen3.5, desarrollado por el usuario nernstpolga. Se presenta como un modelo de generación de texto con capacidades multimodales (image-text-to-text), lo que sugiere que puede procesar tanto texto como imágenes como entrada. El modelo ha sido ajustado mediante offline DPO (Direct Preference Optimization) y presenta un tag "reason-v3" que indica un enfoque en razonamiento avanzado.

Con 35.107 millones de parámetros totales, es un modelo de tamaño considerable dentro de la categoría MoE, aunque no se especifica el número de parámetros activos. El modelo base es `unconst/Affine-5czsc2fc98-r252-merged`, lo que indica que parte de un modelo preentrenado con arquitectura "Affine" (posiblemente relacionada con normalización afín o capas adaptativas). La relevancia actual radica en su combinación de eficiencia MoE, capacidad multimodal y ajuste por preferencias humanas, aunque su acceso restringido (gated) y la falta de documentación pública limitan su evaluación inmediata.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.5, con componentes Affine |
| Parametros totales | 35.107.181.936 (35.1B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato safetensors en fp16/fp32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un modelo MoE derivado de la familia Qwen3.5, con una capa o módulo "Affine" que probablemente introduce transformaciones afines adaptativas en el modelo. El tag `qwen3_5_moe` confirma que sigue el diseño de Qwen3.5 MoE, que típicamente emplea múltiples expertos con routing disperso para activar solo una fracción de los parámetros por token. El entrenamiento incluye una fase de offline DPO, lo que implica que se realizó un ajuste fino con preferencias humanas para alinear el modelo con respuestas deseables. El tag `reason-v3` sugiere que se aplicaron técnicas específicas para mejorar el razonamiento, posiblemente mediante datos sintéticos o entrenamiento en tareas de razonamiento complejo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se utilizó RLHF adicional.

## Capacidades

- Generación de texto conversacional y de larga forma.
- Procesamiento de entrada multimodal (imagen y texto), aunque no se detallan los formatos de imagen soportados.
- Razonamiento avanzado (etiqueta `reason-v3`), probablemente orientado a problemas matemáticos, lógicos o de múltiples pasos.
- Ajuste por preferencias humanas mediante DPO, lo que mejora la calidad percibida de las respuestas.
- Soporte de tool calling y function calling no confirmado explícitamente, pero común en modelos Qwen recientes; se marca como no disponible.
- Capacidades de agente y multi-step reasoning no confirmadas, aunque el tag `reason-v3` sugiere cierta orientación a este tipo de tareas.
- Soporte multilingüe no confirmado; probablemente heredado de Qwen3.5, pero sin datos concretos.

## Casos de uso

- Asistentes conversacionales avanzados: el modelo puede mantener diálogos multi-turno con contexto largo (si la ventana de contexto es amplia, aunque no se especifica) y generar respuestas alineadas con preferencias humanas gracias al DPO.
- Análisis de documentos con imágenes: al ser multimodal, puede extraer información de capturas de pantalla, diagramas o imágenes combinadas con texto, útil en entornos empresariales.
- Razonamiento matemático y lógico: con el tag `reason-v3`, es adecuado para resolver problemas de matemáticas, programación competitiva o puzzles lógicos en entornos educativos.
- Generación de código con explicaciones: puede producir código comentado y razonar sobre algoritmos, útil para asistentes de desarrollo.
- Clasificación y extracción de información en texto largo: su tamaño y arquitectura MoE permiten procesar documentos extensos (si la ventana de contexto lo permite) para resúmenes o análisis.
- Investigación en alineación de modelos: al ser un modelo con DPO offline, puede servir como base para estudiar técnicas de preferencias humanas en entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: al tener 35.1B parámetros en safetensors (70.2 GB), en fp16 se necesitan aproximadamente 70 GB de VRAM para cargar el modelo completo. Con cuantización a 8 bits (desconocida si está disponible) se podría reducir a ~35 GB, y a 4 bits a ~18 GB, pero no se confirma.
- GPU recomendadas: para inferencia en fp16 se requieren GPUs de alta gama como A100 80GB, H100 80GB o múltiples RTX 4090 (24GB) con paralelismo de modelo. Con cuantización 4-bit podría caber en una RTX 4090 o A6000 (48GB).
- En consumer GPU: posible con cuantización agresiva (4-bit) en RTX 3090/4090, pero no está confirmado que se ofrezcan versiones GGUF.
- Opciones de despliegue: dado que es un modelo de transformers, se puede servir con vLLM, TGI o llama.cpp (si se convierte a GGUF). No se especifican versiones oficiales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos comparables claramente identificados en la información proporcionada. Dado que es un modelo MoE de ~35B parámetros basado en Qwen3.5, podría compararse con Qwen3-30B-A3B (MoE) o Mixtral 8x7B, pero no hay datos de rendimiento para establecer una comparación objetiva. Se marca como no disponible.

## Limitaciones y advertencias

- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que puede limitar su uso en entornos corporativos.
- Licencia no especificada: no se puede determinar si es de uso comercial libre; riesgo legal para producción.
- Sesgos y alucinaciones: al ser un modelo ajustado con DPO, puede presentar sesgos heredados del dataset de preferencias; no hay evaluación pública de sesgos.
- Contexto y idiomas: sin datos sobre la ventana de contexto ni idiomas soportados, no se puede garantizar su rendimiento en tareas multilingües o de contexto largo.
- Documentación insuficiente: la falta de model card detallada y benchmarks impide validar su calidad frente a alternativas establecidas.
- Riesgo de sobreajuste al razonamiento: el tag `reason-v3` sugiere un enfoque intensivo en razonamiento, lo que podría degradar el rendimiento en tareas generales de conversación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nernstpolga/new_hk_5dmrycs4ln
- Perfil del autor: https://huggingface.co/nernstpolga
- Modelo base (referencia): https://huggingface.co/unconst/Affine-5czsc2fc98-r252-merged (no verificado)
- Otro modelo del autor (val-duo-1): https://huggingface.co/nernstpolga/val-duo-1
