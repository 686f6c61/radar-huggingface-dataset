# Ambarella/TopFormer

## Resumen

TopFormer es un backbone de visión artificial diseñado específicamente para dispositivos móviles y sistemas embebidos. Lo desarrolla Ambarella, fabricante de SoCs de visión por computador, y se publica en Hugging Face como una implementación optimizada del modelo original presentado en el paper "TopFormer: Token Pyramid Transformer for Mobile Vision" (arXiv:2204.05525). El modelo introduce un transformer de pirámide de tokens que fusiona progresivamente representaciones locales y globales, logrando un equilibrio entre precisión y eficiencia computacional.

La variante publicada en este repositorio es TopFormer-B (Base), con resolución de entrada 3x512x512. El modelo se distribuye principalmente como artefactos binarios compilados para los distintos SoCs de Ambarella (N1-655, X7, CV7, CV72 y CV75), lo que refleja su orientación a despliegue en hardware de borde más que a investigación genérica. No se trata de un modelo de lenguaje ni de un modelo multimodal generativo: es un backbone de visión para clasificación de imágenes y tareas downstream como segmentación o detección.

Su relevancia actual radica en la creciente demanda de modelos de visión ligeros que puedan ejecutarse en cámaras inteligentes, drones y dispositivos IoT con presupuesto energético y de cómputo muy limitado. La disponibilidad de binarios precompilados para el SDK Cooper de Ambarella facilita la integración en producción, aunque limita su uso fuera del ecosistema del fabricante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de pirámide de tokens (token pyramid transformer) para visión |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; resolución de entrada 3x512x512) |
| Tipos de cuantizacion | Amba_optimized y Activation_fp16 (variantes de compresión propietarias) |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | binarios compilados (.bin) para SoCs Ambarella; pesos PyTorch originales referenciados externamente |

## Arquitectura y entrenamiento

TopFormer emplea una arquitectura de transformer con pirámide de tokens que procesa la imagen de entrada a múltiples escalas, fusionando información local (alta resolución, bajo nivel semántico) con información global (baja resolución, alto nivel semántico) de forma progresiva. Esta jerarquía permite capturar tanto detalles finos como contexto global sin el coste cuadrático de un transformer de visión estándar sobre resoluciones altas, lo que resulta clave para su despliegue en dispositivos de borde.

El modelo original fue entrenado sobre el conjunto de datos ImageNet (según el paper de referencia) y se presenta como backbone para clasificación y tareas downstream. La variante publicada por Ambarella corresponde a los pesos TopFormer-B_512x512_4x8_160k, es decir, entrenados con resolución 512x512, batch 4x8 y 160k iteraciones. No se dispone en la información proporcionada de detalles sobre composición exacta del dataset, uso de RLHF/DPO (no aplicable en visión) ni innovaciones adicionales más allá de la pirámide de tokens.

## Capacidades

- Clasificación de imágenes: el modelo está diseñado como backbone para clasificación en dispositivos móviles y de borde.
- Extracción de características multiescala: la pirámide de tokens produce representaciones a varias resoluciones, útiles como backbone para segmentación semántica y detección.
- Inferencia de baja latencia: optimizado para eficiencia energética y computacional en SoCs Ambarella.
- Despliegue en hardware específico: binarios precompilados para N1-655, X7, CV7, CV72 y CV75 con SDK Cooper 2.5.4 y Cooper Foundry 2.3.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües, al no ser un modelo de lenguaje.
- No dispone de modo thinking, visión generativa, audio ni otras capacidades generativas.

## Casos de uso

- Cámaras de vigilancia inteligente: el modelo puede ejecutarse en el SoC CV72 o CV75 de Ambarella para clasificar escenas y detectar objetos en tiempo real, aprovechando los binarios Amba_optimized y el bajo consumo del hardware.
- Drones y robots de inspección: como backbone ligero, permite procesar imágenes a bordo en el SoC N1-655 sin necesidad de enviar datos a la nube, reduciendo latencia y ancho de banda.
- Segmentación semántica en automoción: la pirámide de tokens proporciona características multiescala adecuadas para distinguir carreteras, peatones y señalización en sistemas ADAS embebidos.
- Clasificación de imágenes en IoT industrial: integrado mediante Cooper SDK, permite inspección visual de calidad en líneas de producción con hardware de bajo coste.
- Backbone para modelos downstream personalizados: los pesos PyTorch originales pueden servir como punto de partida para fine-tuning en tareas de visión específicas antes de compilar para el hardware objetivo.
- Procesamiento de vídeo en el borde: al ser un modelo convolucional-transformer ligero, puede encadenarse con detectores o trackers para analítica de vídeo en directo en dispositivos con presupuesto energético restringido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo está pensado para ejecutarse en SoCs Ambarella, no en GPU convencionales.
- GPU recomendadas: no aplica para el despliegue objetivo; para experimentación con los pesos PyTorch originales se requeriría una GPU compatible con PyTorch (no especificada).
- Cabe en consumer GPU: no disponible; el modelo está optimizado para hardware de borde, no para GPU de consumo.
- Opciones de despliegue: SDK Cooper 2.5.4 y Cooper Foundry 2.3 de Ambarella; los binarios están compilados para N1-655, X7, CV7, CV72 y CV75.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TopFormer-B (este) | Transformer de pirámide de tokens para visión | no disponible | 3x512x512 | no disponible | Binarios Ambarella + pesos PyTorch referenciados |
| MobileViT | Transformer híbrido para visión móvil | no disponible en esta ficha | variable | no disponible en esta ficha | Pesos públicos en repositorios de investigación |
| MobileNetV3 | CNN ligera para visión móvil | no disponible en esta ficha | variable | no disponible en esta ficha | Ampliamente disponible |
| EfficientViT | Transformer eficiente para visión | no disponible en esta ficha | variable | no disponible en esta ficha | Pesos públicos |

No se dispone de datos comparativos de rendimiento en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Licencia no especificada: no se indica la licencia del modelo, lo que impide confirmar si el uso comercial está permitido; es imprescindible contactar con Ambarella antes de un despliegue en producción.
- Dependencia de hardware propietario: los binarios publicados solo funcionan en SoCs Ambarella con el SDK Cooper, lo que limita la portabilidad a otros entornos.
- Ausencia de model card completa: no se detallan sesgos, composición del dataset de entrenamiento ni métricas de evaluación.
- Riesgo de alucinación no aplicable en el sentido lingüístico, pero sí existe riesgo de errores de clasificación en dominios alejados de la distribución de entrenamiento (ImageNet).
- Contexto limitado a visión: no es un modelo de lenguaje ni multimodal generativo; no debe evaluarse con benchmarks de texto.
- Idiomas no aplicables: al ser un modelo de visión, la cobertura lingüística no es relevante, pero tampoco se documenta el rendimiento en dominios visuales específicos (médico, satelital, etc.).
- Escasez de documentación técnica: el repositorio tiene pocas descargas y likes, y la información sobre parámetros, entrenamiento y evaluación es mínima.

## Enlaces

- Hugging Face: https://huggingface.co/Ambarella/TopFormer
- Paper original: https://arxiv.org/abs/2204.05525
- Repositorio de referencia: https://github.com/hustvl/TopFormer
- Pesos originales TopFormer-B_512x512_4x8_160k: https://drive.google.com/file/d/1m7CxYKWAyJzl5W3cj1vwsW4DfqAb_rqz/view?usp=sharing
- Binario N1-655 Amba_optimized: https://huggingface.co/Ambarella/TopFormer/blob/main/n1-655_topformer_base_amba_optimized.bin
- Binario X7 Amba_optimized: https://huggingface.co/Ambarella/TopFormer/blob/main/x7_topformer_base_amba_optimized.bin
- Binario CV72 Amba_optimized: https://huggingface.co/Ambarella/TopFormer/blob/main/cv72_topformer_base_amba_optimized.bin
- Binario CV75 Amba_optimized: https://huggingface.co/Ambarella/TopFormer/blob/main/cv75_topformer_base_amba_optimized.bin
