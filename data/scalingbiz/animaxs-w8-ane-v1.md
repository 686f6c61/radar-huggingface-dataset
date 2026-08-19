# ScalingBiz/AnimaXS-w8-ane-v1

## Resumen

AnimaXS w8-ane-v1 es un derivado cuantizado experimental del modelo de difusión Anima, publicado por ScalingBiz a partir de la revisión `f7382c4` del repositorio `circlestone-labs/Anima`. Se trata de un paquete de pesos en formato ANMA v1, diseñado específicamente para ejecutarse en el Neural Engine (ANE) del iPhone XS Max bajo el runtime Apple Metal. El modelo se basa en NVIDIA Cosmos, lo que lo sitúa en la categoría de transformers de difusión (DiT) para generación visual, aunque no se especifica si produce imágenes, vídeo o ambas.

La aportación principal de este derivado es su esquema de cuantización híbrido W8: 280 matrices de proyección del DiT se empaquetan con U8 por fila de salida más escala y sesgo en FP32, mientras que el resto de matrices W8 usan cuantización afín por grupos de 64 elementos con escala y cero en FP16. El repositorio pesa 2,1 GB y no registra descargas ni valoraciones en HuggingFace. Es importante señalar que se trata de una publicación experimental, no una versión oficial de CircleStone, y que su licencia restringe el uso a fines no comerciales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) basado en NVIDIA Cosmos |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusión visual, no de texto) |
| Tipos de cuantización | W8 híbrido ANE-native: U8 por fila + FP32 scale/bias (280 matrices de proyección); W8 afín grupo-64 + FP16 scale/zero (resto) |
| Idiomas soportados | no disponible (generación visual) |
| Licencia | uso no comercial (según model card; ver MODEL_LICENSE.md y MODEL_NOTICE.txt) |
| Formato de pesos | ANMA v1 (packing híbrido ANE-native) |

## Arquitectura y entrenamiento

El modelo es un derivado cuantizado de Anima, un transformer de difusión construido sobre NVIDIA Cosmos. No se dispone de información pública sobre el número total de parámetros, la cantidad de datos de entrenamiento ni el proceso de alineación del modelo original (no se menciona RLHF, DPO ni técnicas similares).

La innovación técnica de este derivado reside en su esquema de cuantización ANMA v1, un formato de empaquetado híbrido orientado al Neural Engine de Apple. Las 280 matrices de proyección del DiT se cuantizan con U8 por fila de salida, acompañadas de escala y sesgo en FP32, mientras que el resto de matrices W8 utilizan cuantización afín con grupos de 64 elementos y escala/cero en FP16. Este enfoque busca equilibrar precisión y rendimiento en el ANE del iPhone XS Max, un hardware con restricciones de memoria y ancho de banda significativas. El repositorio incluye hashes SHA-256 de verificación tanto de la fuente (`c0b905...e2174`) como de la salida (`f5c80a...7dc4`) como parte del registro de procedencia del derivado.

## Capacidades

- Generación visual mediante transformer de difusión (imagen o vídeo, no especificado en la documentación disponible).
- Inferencia en el Neural Engine del iPhone XS Max bajo Apple Metal.
- Cuantización W8 con dos esquemas complementarios (por fila y por grupos) para equilibrar precisión y velocidad en hardware móvil.
- Derivado de NVIDIA Cosmos, lo que hereda las capacidades del modelo base Anima, aunque sin datos publicados sobre su rendimiento real.
- No se documenta soporte de tool calling, agentes, razonamiento multimodal ni funciones de texto, al tratarse de un modelo de difusión visual.

## Casos de uso

- Generación visual local en iPhone XS Max: el modelo está empaquetado específicamente para el ANE de este dispositivo, permitiendo ejecutar un DiT sin conexión a servidores.
- Prototipado de aplicaciones de generación de contenido en dispositivos Apple: desarrolladores pueden integrar el modelo en apps iOS que requieran síntesis visual en el borde, aprovechando la cuantización W8 para reducir el uso de memoria.
- Investigación sobre cuantización ANE: el esquema ANMA v1 documenta un enfoque híbrido (U8 por fila + W8 por grupos) que puede servir de referencia para otros proyectos de optimización en hardware Apple.
- Evaluación de la viabilidad de DiT en hardware móvil de gama media-alta: el iPhone XS Max (chip A12 Bionic) representa un objetivo de rendimiento modesto, útil para medir el límite inferior de despliegue de transformers de difusión.
- Auditoría de derivados de modelos con licencia no comercial: el repositorio incluye ficheros de licencia y avisos (MODEL_LICENSE.md, MODEL_NOTICE.txt) que permiten estudiar la trazabilidad de derivados de Anima y el cumplimiento de licencias.
- Comparativa de formatos de cuantización: junto con la variante W4 (AnimaXS-DiT-W4), permite comparar el impacto de diferentes profundidades de bits en el mismo hardware y modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas de calidad de generación (FID, CLIP score, etc.) ni de rendimiento en el ANE (latencia, throughput, consumo energético).

## Requisitos de hardware

- Dispositivo objetivo: iPhone XS Max (chip A12 Bionic con Neural Engine).
- Runtime: Apple Metal.
- Tamaño del repositorio: 2,1 GB, que corresponde al peso de los pesos cuantizados.
- No se dispone de datos de VRAM, latencia ni throughput, ya que el modelo está diseñado para el ANE y no para GPU convencionales.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Para ejecutar el modelo se requiere un entorno Apple con Metal y acceso al ANE; no es compatible con hardware x86 convencional sin adaptación.

## Comparativa con modelos similares

| Modelo | Formato | Hardware objetivo | Licencia | Estado |
|---|---|---|---|---|
| AnimaXS w8-ane-v1 (este) | W8 híbrido ANE-native | iPhone XS Max / Apple Metal | No comercial | Experimental |
| AnimaXS-DiT-W4 | W4 | Apple (no especificado) | No comercial | Experimental |
| Anima (circlestone-labs) | Original (sin cuantizar) | no disponible | no disponible | Modelo base |

No se dispone de información suficiente sobre otros modelos comparables en la misma categoría (DiT cuantizados para ANE de Apple) para establecer una comparativa más amplia.

## Limitaciones y advertencias

- Licencia de uso no comercial: el modelo solo puede utilizarse con fines de investigación o personales; cualquier uso comercial está prohibido según la model card.
- Modelo experimental: no es una versión oficial de CircleStone; el propio autor lo describe como "experimental" y no se garantiza su estabilidad ni calidad.
- Hardware muy restringido: está optimizado exclusivamente para el ANE del iPhone XS Max; no se garantiza su funcionamiento en otros dispositivos Apple ni en GPU convencionales.
- Sin benchmarks publicados: no hay datos objetivos sobre calidad de generación ni rendimiento, lo que impide validar su utilidad frente a alternativas.
- Sin información sobre sesgos ni riesgos de generación: al ser un modelo de difusión visual, los sesgos se manifestarían en la distribución de las imágenes generadas, pero no se ha publicado ninguna auditoría.
- Cero adopción registrada: el repositorio no tiene descargas ni valoraciones, lo que sugiere una madurez muy limitada.
- Trazabilidad compleja: al ser un derivado de un modelo base (Anima) que a su vez se construye sobre NVIDIA Cosmos, la cadena de dependencias y licencias es difícil de verificar sin acceso a los ficheros de licencia adjuntos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ScalingBiz/AnimaXS-w8-ane-v1
- Variante W4 en HuggingFace: https://huggingface.co/ScalingBiz/AnimaXS-DiT-W4
- Repositorio AnimaXS en GitHub (documentación de decisiones): https://github.com/invisiblestranger/AnimaXS/blob/main/DECISIONS.md
- Modelo base (fuente): circlestone-labs/Anima, revisión f7382c4bf9d7ffe4ceea593a0adbb470c56dd79b
