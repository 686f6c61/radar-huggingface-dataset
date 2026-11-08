# chenzs/H3-Latent-Upscaler-3D-BF16

## Resumen

H3-Latent-Upscaler-3D-BF16 es un upscaler neuronal que opera directamente en el espacio latente del modelo de generación de vídeo Minimax H3. Desarrollado por el usuario chenzs y publicado en Hugging Face bajo licencia Apache 2.0, el modelo actúa sobre los latentes de 24 canales del VAE de Minimax H3 para aumentar la resolución espacial (H×W) preservando la dimensión temporal, sin necesidad de decodificar a píxeles, reescalar y volver a codificar.

Su relevancia práctica radica en que permite acelerar la generación de vídeo en alta resolución: se genera primero el vídeo a baja resolución (con muchos menos tokens latentes y, por tanto, mucho más rápido), se aplica este upscaler sobre el latente y después se remuestrea o refina a la resolución objetivo para recuperar detalle. Con ello se evita el costoso viaje de ida y vuelta a través del VAE de Minimax H3 (de unos 5.000 millones de parámetros) y se eliminan los artefactos de doble imagen o ghosting que introduce la interpolación latente ingenua (bilineal o bicúbica).

El checkpoint publicado es la versión v1, con una arquitectura de convolución 3D y 345.280.216 parámetros, distribuida en formato SafeTensors en bfloat16 (unos 691 MB). Está pensado para usarse con el nodo personalizado de ComfyUI del mismo autor y admite factores de escala continuos entre 1,0× y 4,0×.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Convolución 3D con convolución temporal y interpolación trilineal (inspirada en LTX 2.3 Spatial Upscaler) |
| Parametros totales | 345.280.216 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (opera sobre latentes de vídeo, no sobre texto) |
| Tipos de cuantizacion | No disponible; se publican pesos en bfloat16, float16 y float32 |
| Idiomas soportados | No disponible (modelo no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | SafeTensors (bf16 y fp16) y PyTorch .pth (fp32) |

## Arquitectura y entrenamiento

El modelo emplea un backbone de convolución 3D con 24 canales de entrada y salida (los del espacio latente de Minimax H3), 512 canales base y 12+12 bloques, con una convolución temporal cada 2 bloques y tamaño de kernel 5. La salida se obtiene mediante interpolación trilineal combinada con las convoluciones aprendidas, lo que permite un factor de escala continuo entre 1,0× y 4,0× en pasos de 0,1. La arquitectura referencia explícitamente el LTX 2.3 Spatial Upscaler.

El entrenamiento se realizó sobre aproximadamente 80.000 muestras emparejadas (latente de baja resolución más objetivo de alta resolución), equilibradas por modalidad y factor de escala: unas 70.000 parejas de vídeo y unas 8.000 parejas de imagen 2K. La distribución de escalas es del 40% a 2×, 10% a 1,5×, 10% a 2,5×, 10% a 3×, 10% a 4× y un 10% a decimales arbitrarios entre 1,0× y 4,0×, con el objetivo de generalizar a cualquier escala intermedia. No se detalla en la información disponible el uso de RLHF, DPO ni el número total de tokens o pasos de entrenamiento.

## Capacidades

- Aumento de resolución espacial de latentes de vídeo de Minimax H3 (24 canales) preservando la dimensión temporal.
- Factores de escala continuos entre 1,0× y 4,0× en pasos de 0,1 (por defecto 2,0×).
- Funcionamiento directo en espacio latente, sin decodificación a píxeles ni recodificación.
- Eliminación de artefactos de ghosting y doble imagen propios de la interpolación bilineal o bicúbica.
- Soporte de modalidad de imagen además de vídeo (entrenado con parejas de imagen 2K).
- Integración con ComfyUI mediante nodos 2D y 3D del menú `video/MinimaxH3`.
- Inferencia de la arquitectura a partir del state dict al cargar en ComfyUI.
- No dispone de generación de texto, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Aceleración de pipelines de generación de vídeo: generar primero a baja resolución para reducir el número de tokens latentes, aplicar el upscaler y refinar después a la resolución objetivo, recortando el tiempo total de generación al evitar el viaje de ida y vuelta por el VAE de unos 5.000 millones de parámetros.
- Superresolución de vídeo en producción con ComfyUI: integrar el nodo `Minimax H3 Latent Upscaler (3D)` en flujos existentes para escalar latentes de vídeo entre 1,0× y 4,0× sin salir del espacio latente.
- Remuestreo de imagen 2K: usar el nodo 2D para escalar latentes de imagen entrenados con parejas 2K, útil en flujos que combinan imagen y vídeo en el mismo espacio latente de H3.
- Iteración rápida de prototipos: probar composiciones y prompts a baja resolución y escalar solo los resultados prometedores, reduciendo el coste computacional de la fase exploratoria.
- Postprocesado de material generado: aplicar el upscaler sobre latentes ya generados para obtener versiones de mayor resolución sin regenerar desde cero.
- Investigación en upscaling latente: servir como referencia reproducible (pesos abiertos, Apache 2.0) para estudiar convoluciones 3D temporales aplicadas a espacios latentes de VAE de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye ejemplos cualitativos (un vídeo y una imagen de comparación) pero no métricas cuantitativas como PSNR, SSIM, LPIPS ni comparaciones numéricas con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint bf16 ocupa unos 691 MB, el fp16 unos 691 MB y el fp32 unos 1,38 GB, a lo que hay que sumar el coste de los latentes de vídeo procesados.
- GPU recomendadas: se indica que la variante bf16 es la más rápida en GPUs Ampere y Ada; la fp16 ofrece el mejor equilibrio entre velocidad y memoria.
- Cabe en GPUs de consumo: sí, por el tamaño reducido de los pesos (inferior a 1 GB en bf16/fp16), si bien el requisito real depende de la longitud y resolución de los latentes de vídeo.
- Opciones de despliegue: nodo personalizado de ComfyUI (`LBH-123-AI/Comfyui_Minimax_h3_latent_Upscaler`), con checkpoints en `ComfyUI/models/latent_upscale_models/`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| H3-Latent-Upscaler-3D-BF16 (chenzs) | 345.280.216 | No aplica | Sin benchmarks publicados | Apache 2.0 | Hugging Face |
| Minimax_h3_latent_Upscaler (LBH-123-AI) | 345.280.216 (misma arquitectura v1) | No aplica | Sin benchmarks publicados | No disponible en la información | Hugging Face |
| LTX 2.3 Spatial Upscaler (referencia arquitectónica) | No disponible | No aplica | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento cuantitativos para establecer una comparación numérica con alternativas.

## Limitaciones y advertencias

- Modelo especializado: solo funciona con latentes de 24 canales del VAE de Minimax H3; no es utilizable con otros espacios latentes sin adaptación.
- Dependencia de un nodo externo de ComfyUI para su uso práctico; la model card indica que el nodo infiere la arquitectura del state dict y no lee los ficheros de configuración.
- No se han publicado métricas objetivas de calidad (PSNR, SSIM, LPIPS) ni comparaciones cuantitativas con la interpolación bilineal o bicúbica.
- El upscaling latente no sustituye al remuestreo o refinado posterior a la resolución objetivo para recuperar detalle; la propia model card describe ese paso como parte del pipeline.
- El repositorio presenta 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria documentada.
- La model card no detalla sesgos, riesgos de alucinación ni limitaciones idiomáticas; al no ser un modelo lingüístico, estos riesgos se trasladan al modelo de generación de vídeo que lo acompaña.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones de los modelos base (Minimax H3 y su VAE) con los que se combine.

## Enlaces

- Hugging Face (chenzs/H3-Latent-Upscaler-3D-BF16): https://huggingface.co/chenzs/H3-Latent-Upscaler-3D-BF16
- Árbol de ficheros del repositorio: https://huggingface.co/chenzs/H3-Latent-Upscaler-3D-BF16/tree/main
- Repositorio de referencia del autor original (LBH-123-AI/Minimax_h3_latent_Upscaler): https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler
- Nodo personalizado de ComfyUI: https://github.com/LBH-123-AI/Comfyui_Minimax_h3_latent_Upscaler
- Ejemplo de vídeo de comparación: https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler/resolve/main/examples/Minimax_h3_latent_Upscaler_001.mp4
- Ejemplo de imagen de comparación: https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler/resolve/main/examples/Minimax_h3_latent_Upscaler_002.jpg
