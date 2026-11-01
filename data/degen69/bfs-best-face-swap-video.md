# degen69/BFS-Best-Face-Swap-Video

## Resumen

BFS-Best-Face-Swap-Video es un adaptador LoRA (IC-LoRA) para los modelos de generación de vídeo LTX-2 y LTX-2.5 de Lightricks, publicado por el usuario degen69 (firmado en la model card como Alissonerdx). Su función es el intercambio de rostro e identidad en vídeo: recibe un vídeo guía y una imagen de referencia de identidad, y genera un nuevo vídeo que replica el movimiento del original preservando el rostro aportado. Se enmarca en la categoría de video-to-video e image-to-video con control de identidad.

El modelo se distribuye como pesos LoRA que se cargan sobre el modelo base Lightricks/LTX-2.3 (con referencias también a LTX-2.5), por lo que no es un modelo autónomo: requiere el pipeline de difusión de LTX-2 para funcionar. El repositorio ocupa 13,4 GB, lo que sugiere que incluye tanto los pesos del adaptador como posibles componentes auxiliares o ejemplos. La librería declarada es diffusers y el pipeline_tag es image-to-video.

Es relevante por dos motivos. Primero, porque la sustitución de identidad en vídeo con calidad cinematográfica es una capacidad técnica difícil de conseguir de forma consistente (parpadeos, deriva de identidad entre fotogramas, artefactos en el contorno del rostro). Segundo, porque su licencia y su disclaimer ético ponen el foco en el uso responsable de medios sintéticos, un aspecto crítico para cualquier despliegue profesional de esta tecnología.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (IC-LoRA) sobre modelo de difusión de vídeo LTX-2 / LTX-2.5 |
| Parametros totales | no disponible (adaptador LoRA; el modelo base no se detalla en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vídeo, no de texto) |
| Licencia | ltx-2-community-license-agreement (etiquetada como "other") |
| Formato de pesos | no disponible (librería diffusers; presumiblemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de tipo IC-LoRA (In-Context LoRA) diseñado para inyectar control de identidad en el pipeline de difusión de vídeo LTX-2. La técnica de IC-LoRA condiciona la generación mediante ejemplos en contexto: en este caso, un fotograma de referencia con la identidad objetivo más un vídeo guía que define el movimiento. El autor documenta dos flujos de trabajo: la "Frame 0 Anchoring Technique" (anclaje en el primer fotograma) y un "persistent-template workflow" introducido en la versión V3, que mantiene una plantilla de identidad persistente a lo largo de la generación.

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO. Tampoco se detalla la arquitectura interna del modelo base LTX-2 (transformer de difusión, atención, resolución nativa), por lo que cualquier afirmación al respecto sería especulativa. El adaptador declara compatibilidad tanto con LTX-2.3 como con LTX-2.5, lo que sugiere que el autor validó el LoRA sobre ambas versiones del modelo base.

## Capacidades

- Intercambio de rostro e identidad en vídeo con preservación del movimiento del vídeo guía.
- Generación image-to-video condicionada por una imagen de referencia de identidad.
- Video-to-video con transferencia de identidad fotograma a fotograma.
- Anclaje de identidad en el primer fotograma (Frame 0 Anchoring Technique).
- Flujo de trabajo con plantilla de identidad persistente (V3).
- Compatibilidad con dos versiones del modelo base (LTX-2.3 y LTX-2.5).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje, al tratarse de un modelo generativo de vídeo.

## Casos de uso

- Postproducción de VFX: sustituir el rostro de un doble de acción por el del actor principal en planos concretos, manteniendo la interpretación corporal original del vídeo guía y evitando rodajes adicionales.
- Prototipado cinematográfico (previsualización): generar versiones preliminares de escenas con el actor definitivo antes del rodaje, para validar encuadres y continuidad de identidad.
- Doblaje y localización audiovisual: adaptar el rostro de un actor a una versión localizada de una producción preservando la sincronización labial y el movimiento original.
- Investigación en identidad digital: estudiar la robustez de sistemas de verificación de identidad y detección de deepfakes frente a sustituciones de alta fidelidad, usando el modelo como generador de casos de prueba controlados.
- Creación de contenido para redes con avatares autorizados: producir vídeos donde un creador aparece con una identidad consistente a partir de una única imagen de referencia, siempre con consentimiento explícito del titular.
- Pruebas de vestuario y maquillaje: aplicar una identidad concreta sobre un vídeo de movimiento para evaluar cómo luce un estilismo antes de la sesión real.
- Repositorio de referencia para pipelines de difusión de vídeo: servir como ejemplo técnico de IC-LoRA aplicado a control de identidad para desarrolladores que construyan sus propios adaptadores sobre LTX-2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio pesa 13,4 GB, pero al ser un LoRA sobre LTX-2 el requisito real de VRAM lo determina el modelo base, no el adaptador.
- VRAM estimada para inferencia: no disponible en la información proporcionada; depende de la resolución, la duración del vídeo y la cuantización del modelo base LTX-2.
- GPU recomendadas: no disponible. Para modelos de difusión de vídeo de esta categoría suele ser necesario hardware de gama alta (A100, H100 o RTX 4090), pero no se confirma en la información.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: la librería declarada es diffusers; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no aplicables aquí).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BFS-Best-Face-Swap-Video | LoRA de intercambio de rostro en vídeo | LTX-2.3 / LTX-2.5 | no disponible | ltx-2-community-license-agreement | HuggingFace (0 descargas, 0 likes) |
| Alternativas de face swap en vídeo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos sobre modelos comparables de la misma categoría (adaptadores de intercambio de identidad para LTX-2 u otros modelos de difusión de vídeo), por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Riesgo elevado de uso malintencionado: la sustitución de identidad en vídeo es una tecnología con potencial directo de suplantación; el autor exige consentimiento explícito y derechos legales sobre cualquier rostro procesado.
- El modelo se distribuye "as is" y el autor declina toda responsabilidad por el uso indebido; la carga legal recae íntegramente en el usuario final.
- Licencia ltx-2-community-license-agreement: no es una licencia de código abierto estándar; deben revisarse sus términos antes de cualquier uso comercial.
- Dependencia del modelo base: requiere descargar y ejecutar LTX-2.3 o LTX-2.5, con sus propios requisitos de hardware y licencia.
- Sin métricas publicadas: no hay benchmarks, evaluaciones de calidad ni estudios de robustez que permitan estimar la fidelidad del intercambio de identidad en condiciones reales.
- Sin información sobre sesgos: no se documenta el comportamiento del modelo con distintos tonos de piel, edades, géneros o condiciones de iluminación, lo que es un riesgo conocido en sistemas de intercambio facial.
- Deriva de identidad: en generación de vídeo de varios fotogramas es habitual la pérdida progresiva de fidelidad del rostro; el autor mitiga esto con técnicas de anclaje, pero no se cuantifica la mejora.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que limita la validación por parte de la comunidad.
- Idiomas y contexto: no aplica en el sentido de modelos de lenguaje; el modelo no procesa texto de forma nativa más allá de posibles prompts del pipeline base.
- Posible inconsistencia entre la model card y el repositorio: la card referencia rutas del usuario Alissonerdx mientras el repo pertenece a degen69, lo que puede indicar una migración o duplicación no verificada.

## Enlaces

- HuggingFace: https://huggingface.co/degen69/BFS-Best-Face-Swap-Video
- Vídeo de demostración del flujo V3: https://www.youtube.com/watch?v=HBp03iu7wLA
- Ejemplos V1 (vídeo): https://huggingface.co/Alissonerdx/BFS-Best-Face-Swap-Video/resolve/main/examples/1.mp4
- Ejemplos V3 (vídeo): https://huggingface.co/Alissonerdx/BFS-Best-Face-Swap-Video/resolve/main/examples/6.mp4
- Ejemplos LTX-2.5 (vídeo): https://huggingface.co/Alissonerdx/BFS-Best-Face-Swap-Video/resolve/main/examples/ltx-25-1.mp4
- Modelo base LTX-2.3: https://huggingface.co/Lightricks/LTX-2.3
