# Alissonerdx/BFS-Best-Face-Swap-Video

## Resumen

BFS-Best-Face-Swap-Video es un adaptador LoRA (IC-LoRA) para los modelos de generación de vídeo LTX-2.3 y LTX-2.5 de Lightricks, desarrollado por el usuario Alissonerdx. Su función es el intercambio de identidad facial en vídeo: toma un vídeo guía y una imagen de referencia (primer fotograma) y genera un nuevo vídeo que reproduce el movimiento del original preservando la identidad facial proporcionada. Se distribuye a través de Hugging Face con la librería diffusers y la etiqueta de pipeline image-to-video.

El modelo resuelve un problema concreto dentro de los flujos de posproducción y VFX: la sustitución de rostros en secuencias de vídeo con coherencia temporal, sin necesidad de reentrenar el modelo base. Al ser un LoRA, se aplica sobre los pesos de LTX-2.3/LTX-2.5, lo que reduce los requisitos de almacenamiento y permite combinarlo con distintas versiones del modelo base.

Es relevante ahora porque los modelos de vídeo abiertos han alcanzado calidad suficiente para uso profesional en prototipado cinematográfico, y este adaptador demuestra el patrón de especialización mediante LoRAs sobre modelos base de gran tamaño. El repositorio ocupa 23,9 GB y acumula 499 likes y 265 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (IC-LoRA) sobre modelo de difusión de vídeo LTX-2.3 / LTX-2.5 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | ltx-2-community-license-agreement (etiquetada como "other") |
| Formato de pesos | no disponible (repo de 23,9 GB en diffusers) |

## Arquitectura y entrenamiento

El adaptador se construye como un IC-LoRA (In-Context LoRA) sobre los modelos de difusión de vídeo LTX-2.3 y LTX-2.5 de Lightricks. La técnica de in-context conditioning permite introducir la imagen de identidad como referencia dentro del propio proceso de generación, de modo que el modelo base condiciona cada fotograma tanto por el vídeo guía como por la referencia facial. El resultado es un pipeline image-to-video en el que el primer fotograma actúa como ancla de identidad ("Frame 0 Anchoring Technique", según la model card).

La model card menciona además un flujo de trabajo de "plantilla persistente" introducido en la versión V3, orientado a mantener la identidad de forma estable a lo largo de la secuencia. No se han publicado detalles sobre el volumen de datos de entrenamiento, la composición del dataset, el número de pasos ni si se emplearon técnicas de alineación como RLHF o DPO. Tampoco se especifican hiperparámetros del LoRA (rank, alpha) ni la resolución nativa de entrenamiento.

## Capacidades

- Intercambio de identidad facial en vídeo: sustituye el rostro del vídeo guía por la identidad de la imagen de referencia.
- Generación image-to-video condicionada por un primer fotograma ancla.
- Transferencia de movimiento: reproduce la mímica, pose y dinámica del vídeo original.
- Coherencia temporal de identidad a lo largo de la secuencia mediante el flujo de plantilla persistente (V3).
- Compatibilidad con dos versiones del modelo base: LTX-2.3 y LTX-2.5.
- Integración con el ecosistema diffusers.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio o texto.

## Casos de uso

- Prototipado cinematográfico: sustituir la identidad de un actor de referencia por la del actor final en secuencias de previsualización, manteniendo el movimiento original y evitando rodajes adicionales.
- Posproducción VFX: aplicar el LoRA sobre planos ya rodados para generar versiones alternativas de una escena con otra identidad, con consentimiento explícito del titular del rostro.
- Investigación en identidad digital: estudiar la fidelidad y estabilidad de la transferencia de identidad en vídeo generado, usando el modelo como banco de pruebas reproducible.
- Doblaje y localización: regenerar planos de un actor para versiones localizadas de un anuncio o corto, conservando la interpretación gestual original.
- Creación de contenido con avatares autorizados: generar vídeos de un presentador virtual a partir de una imagen de referencia y un vídeo guía, en flujos de marketing controlados.
- Pruebas de concepto de sustitución de cabeza ("head-swap") en pipelines de vídeo-to-vídeo, evaluando la calidad antes de invertir en modelos propietarios.
- Docencia y demostraciones técnicas: ilustrar el funcionamiento de IC-LoRAs sobre modelos de difusión de vídeo en cursos y talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 23,9 GB, por lo que el almacenamiento en disco debe contemplar ese tamaño más los pesos del modelo base LTX-2.3 o LTX-2.5.
- La VRAM necesaria para inferencia no está documentada; al tratarse de un LoRA sobre un modelo de difusión de vídeo, los requisitos vendrán determinados principalmente por el modelo base y la resolución y duración del vídeo.
- GPU recomendadas: no disponible de forma específica; por el tipo de carga (difusión de vídeo) se requiere hardware de gama alta, pero no se han publicado cifras oficiales.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: diffusers (librería declarada); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no son aplicables a modelos de difusión de vídeo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Contexto / duración | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BFS-Best-Face-Swap-Video | LoRA de intercambio facial en vídeo | LTX-2.3 / LTX-2.5 | no disponible | ltx-2-community-license-agreement | Hugging Face |
| LTX-2.3 (Lightricks) | Modelo de difusión de vídeo | — | no disponible | no disponible en la información proporcionada | Hugging Face |
| LTX-2.5 (Lightricks) | Modelo de difusión de vídeo | — | no disponible | no disponible en la información proporcionada | Hugging Face |

No se dispone de datos de rendimiento comparativo ni de otros adaptadores de intercambio facial en vídeo en la información proporcionada.

## Limitaciones y advertencias

- Riesgo elevado de uso malintencionado: la sustitución de rostros sin consentimiento puede constituir suplantación de identidad y vulnerar derechos de imagen; el autor exime explícitamente de responsabilidad por el mal uso.
- Requisito de consentimiento: el usuario debe contar con consentimiento legal explícito y derechos sobre la imagen de cualquier persona procesada.
- Cumplimiento normativo: obligación de respetar la legislación local e internacional sobre medios sintéticos, incluida la obligación de etiquetar contenido generado en muchas jurisdicciones.
- Licencia restrictiva: la ltx-2-community-license-agreement no es una licencia de código abierto estándar; deben revisarse sus términos antes de cualquier uso comercial.
- Dependencia del modelo base: el rendimiento y los requisitos de hardware dependen de LTX-2.3/LTX-2.5, cuyas especificaciones no se detallan en la información disponible.
- Sin datos de evaluación: no hay benchmarks publicados que cuantifiquen la fidelidad de identidad, la coherencia temporal ni los artefactos en casos difíciles (perfiles, oclusiones, movimiento rápido).
- Idiomas y contexto: no disponibles; el modelo opera sobre imagen y vídeo, no sobre texto.
- Riesgo de alucinación visual: como modelo generativo, puede producir artefactos faciales, inconsistencias entre fotogramas o pérdida de identidad en secuencias largas.
- Trazabilidad limitada: no se documentan la composición del dataset de entrenamiento ni posibles sesgos demográficos en la transferencia de identidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Alissonerdx/BFS-Best-Face-Swap-Video
- Modelo base LTX-2.3: https://huggingface.co/Lightricks/LTX-2.3
- Modelo base LTX-2.5: https://huggingface.co/Lightricks/LTX-2.5
- Vídeo demostrativo del flujo V3: https://www.youtube.com/watch?v=HBp03iu7wLA
- Ejemplos V1: https://huggingface.co/Alissonerdx/BFS-Best-Face-Swap-Video/resolve/main/examples/1.mp4
- Ejemplos V3: https://huggingface.co/Alissonerdx/BFS-Best-Face-Swap-Video/resolve/main/examples/6.mp4
- Ejemplos LTX-2.5: https://huggingface.co/Alissonerdx/BFS-Best-Face-Swap-Video/resolve/main/examples/ltx-25-1.mp4
