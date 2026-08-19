# Pluto-AI-Labs/Apollo-VL-Edge-3B-MLX

## Resumen

Apollo-VL-Edge-3B-MLX es un port nativo en Apple MLX del modelo vision-language Apollo-VL-Edge-3B, desarrollado por Pluto AI Labs. Está construido sobre Qwen2.5-VL-3B-Instruct y ajustado con 161.562 pares de instrucción multimodal procedentes del dataset Apollo-VL-Massive-Dataset. El modelo está diseñado para ofrecer razonamiento visual, OCR denso, comprensión de gráficos y diagramas científicos en dispositivos Apple Silicon, incluyendo MacBooks con 8 GB de memoria unificada.

La versión MLX proporciona pesos cuantizados en 4, 6, 8 y 16 bits, lo que permite ajustar el equilibrio entre velocidad, precisión y consumo de memoria. Con 1.151 millones de parámetros reales (el nombre "3B" se refiere a la familia base), este modelo se posiciona como una opción ligera para tareas de visión por computadora en el edge, sin depender de servicios en la nube.

La relevancia actual radica en su capacidad para ejecutar inferencia multimodal localmente en hardware de consumo, con licencia Apache 2.0 que permite uso comercial sin restricciones. Su integración con la librería mlx-vlm simplifica el despliegue en entornos de desarrollo e investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL (transformer multimodal con vision encoder) |
| Parametros totales | 1.151.066.112 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (Q4), 6-bit (Q6), 8-bit (Q8), FP16 |
| Idiomas soportados | ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5-VL, que combina un vision encoder (ViT) con un decoder transformer para generar texto a partir de imágenes y prompts. El componente de lenguaje es un modelo de 3B parámetros (aunque los pesos reales en safetensors suman 1.151M, posiblemente debido a la cuantización o a la exclusión de ciertos módulos). El ajuste fino se realizó sobre 161.562 pares de instrucción multimodal estandarizados, cubriendo tareas como OCR, comprensión de gráficos, diagramas científicos y razonamiento visual.

No se especifican detalles sobre el dataset de entrenamiento original (composición, número de tokens) ni sobre técnicas de alineación como RLHF o DPO. La innovación principal de esta versión es la conversión a formato MLX, que optimiza los pesos para Metal Performance Shaders en Apple Silicon, reduciendo la huella de memoria y mejorando el rendimiento en comparación con ejecutar el modelo original en frameworks genéricos.

## Capacidades

- Generacion de texto multimodal: responde a prompts que combinan imagen y texto, produciendo descripciones, análisis y respuestas a preguntas visuales.
- Razonamiento visual: capaz de interpretar diagramas científicos (AI2D), gráficos y tablas (ChartQA) con precisión.
- OCR denso: extracción de texto de documentos, facturas y capturas de pantalla, con puntuación alta en OCRBench (786).
- Comprensión de graficos: analiza tendencias, valores y relaciones en gráficos de barras, líneas y circulares.
- Soporte de chat multi-turno: mediante la plantilla de chat de Qwen2.5-VL, permite conversaciones con contexto visual.
- Integracion con MLX: generación por streaming y API Python simple para despliegue local en Apple Silicon.
- No se menciona soporte para tool calling ni funciones de agente en la información disponible.

## Casos de uso

- Digitalizacion de documentos: el modelo puede extraer texto estructurado de facturas, formularios o contratos escaneados, convirtiéndolos en markdown o JSON. Su capacidad OCR densa (puntuación 786 en OCRBench) lo hace adecuado para pipelines de gestión documental en entornos con recursos limitados.
- Analisis de graficos financieros: dado un gráfico de evolución trimestral, el modelo puede calcular variaciones porcentuales y generar resúmenes ejecutivos. Su rendimiento en ChartQA (78.6% de precisión relajada) respalda su uso en herramientas de inteligencia de negocio locales.
- Educacion cientifica: interpretación de diagramas de biología, física o química para asistentes de estudio o plataformas de e-learning. Con un 77.98% en AI2D, puede explicar procesos científicos paso a paso.
- Asistencia visual para personas con discapacidad: descripción de imágenes y lectura de textos en tiempo real en dispositivos Apple, gracias a su bajo consumo de memoria (2.4 GB en 4-bit) y ejecución local.
- Automatizacion de soporte tecnico: análisis de capturas de pantalla de errores o logs para generar respuestas de troubleshooting, integrado en sistemas de ticketing con Apple Silicon.
- Prototipado rapido de aplicaciones VLM: desarrolladores pueden usar el modelo para validar ideas de visión por computadora sin necesidad de GPUs dedicadas, gracias a su compatibilidad con mlx-vlm y su licencia permisiva.

## Benchmarks y rendimiento

Según la model card, Apollo-VL-Edge-3B fue evaluado con el harness lmms-eval. Los resultados publicados son:

| Benchmark | Metrica | Valor |
|---|---|---|
| ChartQA | Relaxed Accuracy | 78.6 |
| AI2D | Exact Match Accuracy | 77.98 |
| OCRBench | OCRBench Score | 786 |

No se proporcionan comparaciones con otros modelos en la información disponible. Los valores indican un rendimiento sólido para un modelo de 3B parámetros, superando a modelos más grandes en tareas específicas, según afirma el autor, aunque no se aportan datos de verificación independiente.

## Requisitos de hardware

- Memoria unificada estimada: ~2.4 GB en 4-bit, ~3.2 GB en 6-bit, ~4.1 GB en 8-bit, ~6.8 GB en FP16.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4) con al menos 8 GB de RAM para la versión 4-bit; 16 GB o más para las versiones de mayor precisión.
- Compatibilidad con consumer hardware: sí, funciona en MacBook Air/Pro de gama de entrada, Mac Studio y Mac mini.
- Opciones de despliegue: librería mlx-vlm (Python API, streaming y CLI), compatible con MLX.
- Latencia y throughput: no se proporcionan datos concretos. La model card menciona "alto rendimiento sin throttling térmico", pero sin cifras.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni especificaciones de modelos comparables en la información proporcionada. El modelo es un port MLX de Apollo-VL-Edge-3B, que a su vez deriva de Qwen2.5-VL-3B-Instruct. Comparado con el modelo base original, esta versión MLX ofrece:

- Cuantizaciones optimizadas para Apple Silicon (4-bit, 6-bit, 8-bit, FP16) frente al formato original.
- Mismo rendimiento en tareas visuales, con degradación mínima en cuantización baja (<2% según el autor).
- Licencia Apache 2.0 idéntica al modelo base.

No se incluyen comparaciones con otros VLM de tamaño similar (por ejemplo, SmolVLM o PaliGemma) por falta de datos.

## Limitaciones y advertencias

- Idioma limitado: solo soporta inglés, lo que restringe su uso en entornos multilingües.
- Contexto no especificado: no se documenta la longitud máxima de contexto, aunque Qwen2.5-VL-3B originalmente soporta 32k tokens; esta información no está disponible en la model card.
- Riesgo de alucinación: como todo modelo generativo, puede producir respuestas plausibles pero incorrectas, especialmente en razonamiento complejo o imágenes ambiguas.
- Sesgos: no se han publicado evaluaciones de sesgos; el dataset de ajuste puede reflejar sesgos del dataset original de Qwen2.5-VL.
- Dependencia de hardware Apple: los pesos MLX solo funcionan en Apple Silicon; no se proporcionan versiones para GPU NVIDIA o AMD.
- Rendimiento no verificado: los benchmarks publicados provienen del autor y no han sido replicados de forma independiente.
- Tamaño real de parámetros: aunque se denomina "3B", los pesos safetensors suman 1.151M, lo que puede deberse a la cuantización o a la exclusión de componentes del vision encoder. Se recomienda verificar antes de planificar despliegues.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Pluto-AI-Labs/Apollo-VL-Edge-3B-MLX
- Modelo base: https://huggingface.co/Pluto-AI-Labs/Apollo-VL-Edge-3B
- Dataset de ajuste: https://huggingface.co/datasets/Pluto-AI-Labs/Apollo-VL-Massive-Dataset
- Librería MLX: https://github.com/ml-explore/mlx
- Librería mlx-vlm: https://github.com/Blaizzy/mlx-vlm (inferido, no enlazado en la model card)
- Harness de evaluación lmms-eval: https://github.com/EvolvingLMMs-Lab/lmms-eval
