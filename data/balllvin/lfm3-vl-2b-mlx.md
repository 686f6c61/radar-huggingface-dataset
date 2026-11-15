# balllvin/LFM3-VL-2B-MLX

## Resumen

LFM3-VL-2B-MLX es una conversión comunitaria del modelo vision-lenguaje LFM3-VL-2B de LiquidAI al formato MLX, realizada por el usuario balllvin. Se trata de un modelo de 1.918.181.888 parámetros (aproximadamente 1,92 mil millones) cuantizado a 8 bits, diseñado para ejecutarse en hardware Apple Silicon mediante el framework MLX. El modelo original pertenece a la familia LFM3 de LiquidAI, orientada a modelos compactos con capacidades multimodales.

La relevancia de esta ficha radica en que permite ejecutar un modelo vision-lenguaje de casi 2B parámetros en Macs con memoria unificada, algo que con el modelo original en precisión completa resultaría más costoso en memoria. El pipeline declarado es image-text-to-text, es decir, acepta imágenes y texto como entrada y genera texto como salida.

Cabe señalar que la información pública disponible es muy limitada: el repositorio tiene cero descargas y cero likes, el acceso está restringido (gated) y no se han publicado detalles sobre el dataset de entrenamiento, los idiomas soportados ni resultados de benchmarks. Esta ficha se limita a los datos verificables del repositorio y del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | lfm3_vl (transformer multimodal vision-lenguaje; detalles internos no disponibles) |
| Parámetros totales | 1.918.181.888 (~1,92B) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8-bit (según tags del repositorio) |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (licencia "other" en Hugging Face) |
| Formato de pesos | safetensors (formato MLX), librería mlx |

## Arquitectura y entrenamiento

El modelo base es LiquidAI/LFM3-VL-2B, un modelo de la familia LFM3 de LiquidAI con capacidades de visión y lenguaje. El tag de arquitectura en Hugging Face es `lfm3_vl`, lo que indica una arquitectura específica de la familia LFM3 para tareas vision-lenguaje. No se dispone de información pública en la documentación proporcionada sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación.

La conversión a MLX implica una cuantización a 8 bits de los pesos originales y su empaquetado en safetensors compatible con la librería MLX de Apple. El repositorio incluye `custom_code`, lo que sugiere que la arquitectura requiere código personalizado para cargarse en MLX y no se resuelve con las capas estándar de la librería. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal en la información disponible.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text): el modelo acepta pares imagen-texto y produce respuestas textuales.
- Conversación multi-turno: el tag `conversational` indica soporte para diálogo.
- Comprensión de imágenes: al ser un modelo VL, puede describir, responder preguntas y razonar sobre contenido visual.
- Ejecución en Apple Silicon mediante MLX, con cuantización 8-bit para reducir el uso de memoria.
- Capacidades de tool calling, agentes, matemáticas o código: no disponibles en la información proporcionada.
- Modo thinking, audio u otras modalidades: no disponibles en la información proporcionada.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Asistente visual local en Mac: ejecutar el modelo con MLX en un Mac con memoria unificada para responder preguntas sobre capturas de pantalla, fotos o documentos escaneados sin enviar datos a la nube, aprovechando la cuantización 8-bit para reducir el consumo de memoria.
- Descripción automática de imágenes en flujos de accesibilidad: generar texto alternativo para imágenes en una aplicación o CMS local, con la ventaja de que el modelo corre en el propio dispositivo.
- Extracción de información de documentos: dado que el pipeline es image-text-to-text, puede emplearse para leer formularios, recibos o etiquetas y devolver campos estructurados en texto.
- Prototipado de aplicaciones multimodales en macOS/iOS: integrar el modelo en apps Swift o Python con MLX para validar experiencias de chat con imagen antes de migrar a un despliegue en servidor.
- Moderación de contenido visual asistida: usar el modelo para clasificar o describir imágenes sospechosas en un pipeline local, con revisión humana posterior.
- Investigación en eficiencia de modelos VL pequeños: servir como referencia para estudiar el comportamiento de un modelo de ~1,9B parámetros cuantizado a 8 bits en hardware consumer de Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 2,2 GB, coherente con pesos en 8-bit para ~1,92B parámetros; se debe prever memoria adicional para el encoder visual, el contexto y los estados intermedios de inferencia.
- GPU recomendadas: hardware Apple Silicon (series M1, M2, M3, M4) con memoria unificada suficiente; el formato MLX no está pensado para GPU NVIDIA.
- ¿Cabe en GPU consumer? Sí, en Macs con memoria unificada; no aplica a GPUs consumer NVIDIA por el formato MLX.
- Opciones de despliegue: librería MLX (mlx, mlx-lm y utilidades MLX para modelos VL); no compatible directamente con vLLM, llama.cpp, Ollama o TGI sin conversión previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-VL-2B-MLX (este) | ~1,92B | no disponible | MLX safetensors 8-bit | lfm1.0 | Gated en Hugging Face |
| LiquidAI/LFM3-VL-2B (base) | ~1,92B | no disponible | safetensors | lfm1.0 | Hugging Face (modelo original) |
| Alternativas de ~2B VL | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de descargarlo.
- Licencia lfm1.0: es una licencia "other" que puede imponer restricciones al uso comercial; es necesario revisar los términos completos antes de usarlo en producción.
- Conversión comunitaria: al no ser un modelo oficial de LiquidAI, no hay garantía de paridad exacta con el modelo base ni soporte del autor original.
- Requiere `custom_code`: la carga no es estándar y depende de código incluido en el repositorio, lo que añade riesgo de mantenimiento.
- Sin datos de benchmarks ni de idiomas: no se puede evaluar su calidad multilingüe ni su rendimiento frente a alternativas.
- Riesgo de alucinación: inherente a los modelos generativos; en tareas visuales puede describir elementos inexistentes en la imagen.
- Sesgos: no documentados en la información disponible.
- Ecosistema limitado: al estar en formato MLX, no se integra con los stacks de despliegue más habituales (vLLM, TGI, llama.cpp) sin trabajo adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/balllvin/LFM3-VL-2B-MLX
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Librería MLX: https://github.com/ml-explore/mlx
- Documentación de MLX para modelos de lenguaje: https://github.com/ml-explore/mlx-lm
