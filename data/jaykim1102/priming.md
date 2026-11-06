# jaykim1102/priming

## Resumen

Priming es una familia de modelos de generación de imágenes desarrollada por Jaeyeon Kim (jaykim1102), publicada en Hugging Face junto con su repositorio de código en GitHub. Se trata de checkpoints de investigación de modelos condicionales por clase sobre ImageNet-256, con variantes de tamaño B y L, en distintas fases de entrenamiento: pretraining de reconstrucción tras 80 y 160 épocas, y post-entrenamiento distribucional tras 25.000 actualizaciones. Adicionalmente, el repositorio incluye checkpoints nativos de texto-a-imagen (MM-JiT-B/16) a 512×512 antes y después de post-entrenamiento OT.

El modelo resuelve el problema de la generación de imágenes condicionada, tanto por clase (ImageNet) como por texto, mediante una arquitectura denominada MM-JiT (Multi-Modal JiT) con backbone tipo transformer. La relevancia actual radica en que se publican los checkpoints completos de entrenamiento (incluyendo estado del optimizador) junto con recetas de reproducción, estadísticas FID congeladas y exportaciones verificadas a Diffusers, lo que facilita la investigación reproducible sobre modelos generativos.

El repositorio ocupa 32,9 GB e incluye ocho archivos de checkpoint originales en PyTorch, dos manifiestos JSON con SHA256, exportaciones FP32 en Safetensors para inferencia con Diffusers (variantes B-160 y L-160), y assets de evaluación. La licencia de los checkpoints principales no está especificada en la información disponible; las exportaciones Diffusers se distribuyen bajo Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MM-JiT (Multi-Modal JiT), transformer para generación de imágenes |
| Parametros totales | no disponible (variantes B y L; cifras concretas no publicadas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; resolución nativa 256×256 en ImageNet, 512×512 en T2I) |
| Tipos de cuantizacion | FP32 nativo; BF16 autocast recomendado para inferencia; no se documentan GGUF ni INT8 |
| Idiomas soportados | en (inglés, para prompts de texto en los checkpoints T2I) |
| Licencia | no disponible para checkpoints principales; exportaciones Diffusers bajo Apache-2.0 |
| Formato de pesos | PyTorch checkpoints (con estado del optimizador) y Safetensors FP32 para las exportaciones Diffusers |

## Arquitectura y entrenamiento

La arquitectura es MM-JiT (Multi-Modal JiT), un transformer adaptado a generación de imágenes que opera en dos modalidades: condicional por clase sobre ImageNet-256 y texto-a-imagen a 512×512 mediante los checkpoints MM-JiT-B/16. El entrenamiento se organiza en fases claramente definidas: un pretraining de reconstrucción (80 y 160 épocas para los checkpoints ImageNet; 250.000 + 40.000 actualizaciones de reconstrucción para los T2I) seguido de un post-entrenamiento distribucional con transporte óptimo (OT), con 25.000 actualizaciones en el caso ImageNet y 20.000 en el T2I.

Los checkpoints originales incluyen pesos online y EMA (0.9999 en pretraining, 0.999 en evaluación de post-entrenamiento) junto con el estado del optimizador, lo que permite reanudar el entrenamiento. El post-entrenamiento se inicializa desde los pesos online del pretraining. La innovación técnica destacable es el uso de post-entrenamiento distribucional basado en OT para alinear la distribución generada con la real, así como la publicación de estadísticas de referencia FDr5 congeladas y features de precisión/recall de Inception precalculadas, que evitan recalcular estadísticas de imágenes reales al evaluar.

## Capacidades

- Generación de imágenes condicional por clase sobre ImageNet-256 (clases 0–999), con salida nativa de 256×256 en un solo paso y `guidance_scale=1`.
- Generación texto-a-imagen a 512×512 mediante los checkpoints MM-JiT-B/16 (antes y después de post-entrenamiento OT).
- Inferencia de un solo paso (one-step), lo que reduce latencia frente a modelos de difusión multi-paso.
- Exportaciones listas para Diffusers con pipeline personalizado autocontenido, configuración y código de transformer/scheduler.
- Pesos online y EMA para experimentación y evaluación.
- Compatibilidad con BF16 autocast manteniendo pesos FP32 para reproducir el modo de muestreo original.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multimodalidad de entrada más allá del condicionamiento por clase o texto.

## Casos de uso

- Investigación en generación de imágenes condicional por clase: los checkpoints ImageNet-256 permiten reproducir y comparar resultados FID/FDr5 con estadísticas de referencia congeladas incluidas en el repositorio, sin necesidad de recalcular estadísticas reales.
- Estudio de post-entrenamiento distribucional: la disponibilidad de checkpoints antes y después de las 25.000 actualizaciones OT permite analizar el efecto aislado de esta fase sobre la calidad y diversidad de las muestras.
- Reproducción de recetas de entrenamiento: al incluir estado del optimizador y pesos online/EMA, el modelo sirve para reanudar o extender el entrenamiento en entornos de investigación con los recursos adecuados.
- Evaluación comparativa de pipelines de inferencia: las exportaciones Diffusers verificadas (B-160 y L-160) con comparaciones FP32/BF16 de error cero frente a la implementación original permiten validar conversiones y flujos de despliegue.
- Generación texto-a-imagen en prototipos de investigación: los checkpoints T2I con GenEval 0.8280 y DPG-Bench 82.71 en una sola evaluación de red y CFG=1 son adecuados para experimentos que priorizan velocidad de muestreo.
- Benchmarking de modelos generativos: la inclusión de manifiestos con SHA256 y assets de evaluación facilita auditorías de reproducibilidad en publicaciones científicas.
- Estudio de la dinámica de entrenamiento: la comparación entre 80 y 160 épocas de pretraining permite analizar la evolución del modelo con el cómputo.

## Benchmarks y rendimiento

Los únicos resultados numéricos publicados en la información disponible corresponden a los checkpoints T2I después del post-entrenamiento OT:

| Benchmark | Modelo | Resultado | Configuración |
|---|---|---|---|
| GenEval | Priming T2I (post-OT online) | 0.8280 | 1 evaluación de red, CFG=1 |
| DPG-Bench | Priming T2I (post-OT online) | 82.71 | 1 evaluación de red, CFG=1 |

No se han publicado resultados de FID, FDr5 ni otros benchmarks para los checkpoints ImageNet-256 en la información disponible. Las comparaciones FP32/BF16 documentadas son validaciones de conversión (error cero en modos de precisión coincidentes), no evaluaciones FID nuevas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio completo ocupa 32,9 GB, pero las exportaciones Diffusers individuales (B-160 o L-160) son sustancialmente menores al contener solo pesos de inferencia sin estado del optimizador.
- GPU recomendadas: no especificadas por el autor; la guía de inferencia asume CUDA con PyTorch y BF16 autocast, lo que requiere GPU con soporte BF16 (Ampere o superior, p. ej. A100, H100, RTX 3090/4090).
- Viabilidad en GPU de consumo: probable para las exportaciones Diffusers de inferencia en FP32 con BF16 autocast si la VRAM disponible cubre los pesos de la variante B o L; no se confirma cifra concreta en la información disponible.
- Opciones de despliegue: Diffusers 0.37.1 con `custom_pipeline` apuntando al pipeline incluido; el código nativo del repositorio GitHub para los checkpoints T2I y de entrenamiento.
- Latencia y throughput: no disponibles; el modelo opera en un solo paso de muestreo (`guidance_scale=1`), lo que estructuralmente reduce el coste frente a pipelines de difusión multi-paso.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de los checkpoints ImageNet-256 en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable con alternativas de la misma categoría (modelos de difusión condicional por clase como DiT o JiT). En el caso T2I, los resultados GenEval 0.8280 y DPG-Bench 82.71 son comparables en métrica con modelos de difusión texto-a-imagen, pero la información disponible no incluye resultados de esos modelos alternativos para contrastar.

| Modelo | Parámetros | Contexto/resolución | Licencia | Disponibilidad |
|---|---|---|---|---|
| Priming (ImageNet-256, B/L) | no disponible | 256×256, condicional por clase | no disponible (checkpoints); Apache-2.0 (exportaciones Diffusers) | Hugging Face, código en GitHub |
| Priming (T2I, MM-JiT-B/16) | no disponible | 512×512, texto-a-imagen | no disponible | Hugging Face, código nativo |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los checkpoints principales son de investigación e incluyen estado del optimizador; no son pipelines autónomos listos para producción.
- La licencia de los checkpoints originales no está especificada, lo que impide confirmar el uso comercial; solo las exportaciones Diffusers declaran Apache-2.0.
- El pipeline Diffusers personalizado ejecuta componentes Python incluidos en el repositorio; se recomienda inspeccionar el código y fijar `revision` a un commit del Hub para uso reproducible.
- Pasar `torch_dtype=torch.bfloat16` altera los pesos y produce salidas numéricamente distintas; para reproducir el modo original hay que mantener FP32 con BF16 autocast.
- La evaluación de los checkpoints ImageNet usa pesos EMA 0.999; usar los pesos online en evaluación puede dar resultados distintos.
- El modelo está entrenado sobre ImageNet y datos de texto en inglés; los prompts en otros idiomas no están soportados según la metadata (`language: en`).
- No se documentan sesgos específicos, pero al derivar de ImageNet y datos de texto en inglés es esperable heredar sesgos de representación de esas fuentes.
- Riesgo de alucinación visual y de artefactos propios de modelos generativos de un solo paso; no se publican métricas de fidelidad detallada más allá de las citadas.
- El dataset de entrenamiento ImageNet se distribuye por separado con sus propios términos de acceso; no es necesario para muestreo ni para evaluación FID/FDr5 final.
- Los checkpoints T2I usan el código nativo de Priming, no los pipelines Diffusers de ImageNet; no son intercambiables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaykim1102/priming
- Repositorio de código y guía de configuración: https://github.com/JaeyeonKim01/priming
- Dataset de entrenamiento (ImageNet procesado): https://huggingface.co/datasets/jaykim1102/priming
- Implementación comunitaria de referencia (BiliSakura): https://huggingface.co/BiliSakura/Priming-diffusers/tree/a0c1743f49eb0f972feec280356ccaab90298b20
- Exportación Diffusers B-160: https://huggingface.co/jaykim1102/priming/tree/main/diffusers/priming_b_160
- Exportación Diffusers L-160: https://huggingface.co/jaykim1102/priming/tree/main/diffusers/priming_l_160
- Guía de checkpoints T2I: https://huggingface.co/jaykim1102/priming/blob/main/t2i/README.md
