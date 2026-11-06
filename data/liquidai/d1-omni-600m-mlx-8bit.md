# LiquidAI/d1-omni-600M-MLX-8bit

## Resumen

d1-omni-600M es un modelo de decisión desarrollado por Liquid AI que responde preguntas tipadas y nombradas sobre un estado dado (texto, JSON, imágenes o audio) en un único paso hacia delante, sin generar tokens. No es un modelo generativo al uso: recibe un conjunto de preguntas con tipo (`choice`, `score`, `noul`/`bool`) y devuelve directamente la respuesta con sus probabilidades asociadas. Esta ficha cubre la exportación MLX en 8 bits para Apple Silicon, ejecutable con mlx-vlm.

El modelo pertenece a la familia LFM 2.5 y está diseñado para el edge: con unos 587 millones de parámetros totales y un peso de repositorio de 0,7 GB en esta cuantización, está pensado para clasificación, calibración y enrutamiento en dispositivos con recursos limitados. Soporta 15 idiomas y entrada multimodal (visión y audio), lo que lo hace adecuado para pipelines de decisión sobre estados heterogéneos.

Su relevancia actual radica en el paradigma "system-one": en lugar de razonar paso a paso generando texto, el modelo evalúa todas las preguntas en una sola pasada, lo que reduce latencia y coste computacional en tareas de clasificación y enrutamiento. Esta exportación MLX 8 bits mantiene las respuestas top del checkpoint original en float32 en las 175 comprobaciones realizadas (texto, imagen y audio), con una desviación máxima de probabilidad de 0,060.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de decisión multimodal, familia LFM 2.5; incluye tronco, torre de visión, codificador de audio y scorer de decisión) |
| Parametros totales | 587.161.089 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (tronco y codificador de audio); torre de visión y scorer de decisión en float16; existe exportación float16; no hay exportación bfloat16 ni 4 bits |
| Idiomas soportados | en, de, es, fr, it, nl, pl, pt, ar, hi, ja, ru, tr, vi, zh |
| Licencia | lfm1.0 (licencia "other", enlace a LICENSE en el repo) |
| Formato de pesos | safetensors (MLX), 8 bits |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura interna más allá de lo indicado en la model card: se trata de un modelo de decisión de la familia LFM 2.5 con componentes diferenciados para texto, visión y audio, más un scorer de decisión que produce las probabilidades de cada opción. El modelo responde en un único forward pass sin generar tokens, lo que constituye su innovación principal frente a modelos generativos: las preguntas se formulan como estructuras tipadas y el modelo devuelve directamente valores con probabilidades y confianza.

El modelo original fue entrenado en float32 según la model card. Esta exportación MLX se ha validado contra el checkpoint original en float32 con mlx-vlm, con una coincidencia de aproximadamente 1e-5 en probabilidad respecto a la referencia en PyTorch. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Decisión tipada en una sola pasada: responde preguntas de tipo `choice` (selección entre etiquetas), `score` (nivel esperado con leyenda) y `noul`/`bool` (probabilidad de sí).
- Procesamiento de estado multimodal: texto, JSON, imágenes y audio (clips mono de 16 kHz de hasta 30 segundos).
- Múltiples preguntas nombradas sobre un mismo estado en una única llamada.
- Salida con probabilidades por opción y metadatos de confianza para cada respuesta.
- Soporte multilingüe en 15 idiomas.
- Interfaz de servidor HTTP con endpoint `/v1/decisions` para integración en servicios.
- Uso desde línea de comandos mediante `python -m mlx_vlm decide`.
- No genera texto libre: su salida es estructurada (valores, probabilidades, leyendas).

## Casos de uso

- Enrutamiento de tickets de soporte: clasificar cada mensaje entrante por equipo (facturación, técnico, fraude) y urgencia en una sola llamada, usando preguntas de tipo `choice` y `score` sobre el texto del cliente.
- Moderación y triaje de contenido: evaluar si un texto o una imagen infringe políticas mediante preguntas `noul` con umbral de probabilidad, aprovechando la salida calibrada del modelo.
- Clasificación de imágenes en el edge: determinar categorías o recuentos (por ejemplo, número de objetos) directamente desde una foto en un dispositivo Apple Silicon, sin pipeline generativo.
- Análisis de audio de llamadas: clasificar fragmentos de hasta 30 segundos (petición, pregunta, discurso) para enrutamiento automático en centros de contacto.
- Extracción de señales estructuradas de JSON: validar o etiquetar estados de negocio con preguntas tipadas, integrándolo en servicios backend mediante el endpoint `/v1/decisions`.
- Filtrado previo en pipelines RAG o agentes: decidir si una consulta requiere recuperación, escalado a un humano o una acción concreta antes de invocar un modelo generativo mayor, reduciendo coste y latencia.
- Control de calidad y calibración: usar las probabilidades y la confianza devueltas para establecer umbrales de derivación a revisión humana en flujos de decisión automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye únicamente una comprobación de concordancia entre precisiones (smoke test, no un benchmark de precisión):

| Repositorio | Pesos | Tamano | Misma respuesta top | Max Δp | Media Δp |
|---|---|---:|---:|---:|---:|
| d1-omni-600M-MLX-fp16 | float16 | 1,17 GB | 175/175 | 0,007 | 0,0010 |
| d1-omni-600M-MLX-8bit | 8 bits (tronco y audio); visión y scorer en float16 | 0,73 GB | 175/175 | 0,060 | 0,0083 |

La comprobación cubre 104 respuestas de texto, 41 de imagen y 30 de audio frente al checkpoint original en float32.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 0,73 GB de pesos en 8 bits, más overhead del runtime MLX; en la práctica, menos de 2 GB de memoria unificada para inferencia.
- Hardware objetivo: Apple Silicon (MLX). No está pensado para GPU NVIDIA en este formato.
- Cabe holgadamente en cualquier Mac con chip de la serie M (M1 y posteriores), incluidos modelos con 8 GB de memoria unificada.
- Despliegue: mlx-vlm 0.7.8 o superior, en modo librería (`load`/`predict`), línea de comandos (`python -m mlx_vlm decide`) o servidor (`python -m mlx_vlm server --decision-model ...`).
- Latencia y throughput: no disponibles en la información proporcionada. Al no generar tokens, el coste por consulta se limita a un único forward pass.
- Para otras plataformas, el modelo base LiquidAI/d1-omni-600M ofrece el checkpoint original; esta exportación es específica de MLX.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. Como referencia de la propia familia y formato:

| Modelo | Parametros | Precision | Tamano | Plataforma | Licencia |
|---|---|---|---|---|---|
| d1-omni-600M-MLX-8bit | 587 M | 8 bits (visión y scorer fp16) | 0,73 GB | MLX (Apple Silicon) | lfm1.0 |
| d1-omni-600M-MLX-fp16 | 587 M | float16 | 1,17 GB | MLX (Apple Silicon) | lfm1.0 |
| d1-omni-600M | 587 M | float32 (original) | no disponible | PyTorch | lfm1.0 |

Comparativa con modelos de decisión o clasificación de otros fabricantes: no disponible.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni mantiene conversaciones; solo responde preguntas tipadas predefinidas.
- El audio está limitado a clips mono de 16 kHz de hasta 30 segundos.
- La cuantización 8 bits introduce desviaciones de probabilidad de hasta 0,060 respecto a float32; float16 es la precisión recomendada por el autor. No existe exportación bfloat16 (el autor lo desaconseja) ni 4 bits (cambia una parte notable de las respuestas).
- La comprobación de precisiones es un smoke test de concordancia, no una evaluación de exactitud; no hay benchmarks publicados que permitan estimar el rendimiento real en tareas.
- Riesgo de calibración deficiente fuera de la distribución de entrenamiento: las probabilidades devueltas deben validarse con datos propios antes de usarse como umbrales en producción.
- Sesgos: no se documentan sesgos conocidos en la información disponible; al cubrir 15 idiomas, el rendimiento puede variar entre ellos.
- Licencia lfm1.0: es necesario revisar el archivo LICENSE del repositorio antes de un uso comercial, ya que se trata de una licencia "other" con posibles restricciones.
- Dependencia del ecosistema MLX y Apple Silicon: no es desplegable directamente en GPU NVIDIA con este formato.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento con estados de entrada muy largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiquidAI/d1-omni-600M-MLX-8bit
- Modelo base: https://huggingface.co/LiquidAI/d1-omni-600M
- Exportación float16: https://huggingface.co/LiquidAI/d1-omni-600M-MLX-fp16
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Playground de Liquid AI: https://playground.liquid.ai/
- Documentación: https://docs.liquid.ai/lfm/getting-started/welcome
- Discord de Liquid AI: https://discord.com/invite/liquid-ai
- Web de Liquid AI: https://www.liquid.ai/
- Paper referenciado (arXiv): https://arxiv.org/abs/2511.23404
