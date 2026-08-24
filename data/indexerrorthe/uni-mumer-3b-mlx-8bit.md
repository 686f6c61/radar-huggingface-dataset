# IndexErrorThe/uni-mumer-3b-mlx-8bit

## Resumen

Uni-MuMER es un modelo de visión-lenguaje (VLM) diseñado específicamente para el reconocimiento de expresiones matemáticas manuscritas (HMER, por sus siglas en inglés). Fue presentado como trabajo en NeurIPS 2025 (Spotlight) y se basa en un fine-tuning completo de Qwen2.5-VL-3B, sin modificar su arquitectura original, inyectando conocimiento de dominio en un marco generalista. El modelo original está desarrollado por BFlameSwift y ha sido adaptado a MLX (librería de Apple para inferencia en chips M-series) en cuantización de 8 bits por el autor IndexErrorThe, bajo el nombre `uni-mumer-3b-mlx-8bit`.

Esta conversión MLX permite ejecutar el modelo en hardware Apple Silicon con un consumo de memoria reducido, manteniendo las capacidades de reconocimiento matemático del modelo original. El repositorio de Hugging Face incluye los pesos en formato safetensors, listos para usar con la librería MLX. Aunque el nombre sugiere 3 mil millones de parámetros, los archivos de pesos suman aproximadamente 1.536.778.240 parámetros (1.5 mil millones), probablemente debido a la cuantización o a una variante reducida del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL (visión-lenguaje) |
| Parametros totales | 1.536.778.240 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (MLX) |
| Idiomas soportados | Inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

Uni-MuMER es un fine-tuning completo de Qwen2.5-VL-3B, un VLM de tipo transformer con componentes de visión y lenguaje. El modelo original se entrena mediante un enfoque de múltiples tareas que combina el reconocimiento de expresiones matemáticas manuscritas con otras tareas auxiliares, utilizando datos externos diversos para mejorar la precisión. No se modifica la arquitectura base; solo se ajustan todos los pesos del modelo. La versión MLX es una conversión del modelo original a 8 bits, optimizada para ejecución en Apple Silicon, sin cambios en la arquitectura interna.

No se dispone de información detallada sobre el número exacto de tokens de entrenamiento, la composición del dataset o el uso de técnicas de alineación como RLHF o DPO en la información proporcionada.

## Capacidades

- Reconocimiento de expresiones matemáticas manuscritas (HMER) a partir de imágenes.
- Generación de texto en lenguaje natural a partir de imágenes, con foco en matemáticas.
- Conversación multimodal: el modelo puede recibir imágenes y texto y responder en texto.
- Soporte para tareas de visión-lenguaje generales, aunque su especialidad es el dominio matemático.
- No se ha confirmado soporte de tool calling ni capacidades de agente en la información disponible.
- Multilingüe: solo se indica inglés, aunque el modelo base Qwen2.5-VL podría soportar más idiomas, no se garantiza en esta conversión.

## Casos de uso

- **Digitalización de apuntes matemáticos**: un estudiante puede fotografiar una pizarra o un cuaderno con fórmulas manuscritas y el modelo las transcribe a formato LaTeX o texto plano, facilitando su edición y búsqueda.
- **Corrección automática de exámenes de matemáticas**: en entornos educativos, el modelo puede interpretar respuestas manuscritas y verificar si la expresión es correcta, reduciendo la carga de corrección manual.
- **Accesibilidad para personas con discapacidad visual**: al reconocer y verbalizar expresiones matemáticas manuscritas, ayuda a usuarios con problemas de visión a acceder a contenidos matemáticos.
- **Asistente de investigación para matemáticos**: permite digitalizar fórmulas escritas en papel o pizarra para integrarlas en documentos LaTeX o sistemas de cálculo simbólico.
- **Integración en aplicaciones de productividad**: junto con un escáner de documentos, el modelo puede extraer fórmulas de imágenes y convertirlas en objetos editables en herramientas como Word o LaTeX.
- **Análisis de documentos históricos**: para la digitalización de manuscritos matemáticos antiguos, el modelo puede ayudar a transcribir y catalogar fórmulas, facilitando la investigación en historia de las matemáticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta conversión MLX en la información disponible. El paper original de Uni-MuMER reporta mejoras significativas sobre el modelo base y métodos previos, pero esos datos no se incluyen en la ficha de HuggingFace. Por tanto, no se pueden presentar cifras concretas.

## Requisitos de hardware

- **VRAM estimada**: al ser una cuantización de 8 bits de un modelo de aproximadamente 1.5B parámetros, se estima un uso de memoria de entre 2 y 3 GB. No se proporciona un dato exacto.
- **GPU recomendadas**: orientado a Apple Silicon (M1, M2, M3, etc.) mediante MLX. No se soportan GPUs NVIDIA directamente con esta versión.
- **Compatibilidad con GPU de consumo**: funciona en cualquier Mac con chip Apple Silicon y al menos 8 GB de RAM unificada, aunque se recomienda 16 GB para mayor margen.
- **Opciones de despliegue**: la librería MLX permite ejecutar el modelo en macOS; se puede usar con Python y el paquete `mlx` o mediante la integración con frameworks como `mlx-lm`. No se mencionan soporte para vLLM o TGI.
- **Latencia y throughput**: no disponibles; dependen del chip concreto.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos HMER en la información proporcionada. Sin embargo, se puede comparar conceptualmente con el modelo base Qwen2.5-VL-3B, que es el punto de partida. Otras alternativas en el campo de HMER incluyen modelos como Math-OCR o TextOCR, pero no se dispone de datos comparativos en este contexto.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Uni-MuMER (MLX 8-bit) | 1.5B (cuantizado) | no disponible | no disponible | HuggingFace |
| Qwen2.5-VL-3B | 3B | 128K (según documentación) | Apache 2.0 (original) | HuggingFace |
| Math-OCR (hipotético) | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Dominio específico**: el modelo está especializado en HMER; su rendimiento en otras tareas de visión-lenguaje puede ser inferior al de modelos generalistas.
- **Idioma**: la card indica solo inglés; aunque el modelo base podría soportar más idiomas, la conversión MLX no garantiza ese soporte.
- **Cuantización**: la conversión a 8-bit puede degradar ligeramente la precisión en comparación con el modelo de precisión completa, aunque para la mayoría de usos es aceptable.
- **Licencia**: no se ha especificado la licencia de este repositorio; el modelo original puede tener restricciones de uso comercial, por lo que se recomienda verificar antes de usarlo en producción.
- **Sesgos**: no se han evaluado sesgos específicos; como modelo de dominio matemático, puede presentar limitaciones en contextos no matemáticos.
- **Actualización**: el modelo se publicó en 2026, pero no hay información sobre mantenimiento o soporte posterior.

## Enlaces

- [HuggingFace - IndexErrorThe/uni-mumer-3b-mlx-8bit](https://huggingface.co/IndexErrorThe/uni-mumer-3b-mlx-8bit)
- [GitHub - BFlameSwift/Uni-MuMER](https://github.com/BFlameSwift/Uni-MuMER)
- [Paper en arXiv (HTML)](https://arxiv.org/html/2505.23566v3)
- [Colección de Hugging Face con datasets y modelos del paper](https://huggingface.co/collections/phxember/uni-mumer)
