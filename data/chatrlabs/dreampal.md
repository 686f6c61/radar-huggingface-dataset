# chatrlabs/Dreampal

## Resumen

Dreampal es un checkpoint de generación de imágenes texto-a-imagen desarrollado por Chatr Labs, construido sobre la familia SDXL/Pony. Se distribuye en dos variantes: una compilación de calidad orientada a 20 pasos de muestreo y una compilación acelerada DMD2 pensada para 8 pasos. Ambas se publican como checkpoints completos de un solo archivo que incluyen el VAE y los dos codificadores de texto, por lo que no requieren descargar un modelo base adicional.

El modelo se presenta explícitamente como "uncensored": no incorpora filtro de prompts ni safety checker propio, de modo que la salida depende enteramente del prompt y de la aplicación que lo envuelva. Esta orientación lo sitúa en el ecosistema de checkpoints derivados de Pony, caracterizados por el prefijo de puntuación `score_9, score_8_up, score_7_up` y por un sesgo estético muy marcado hacia ilustración y retrato.

La relevancia actual del lanzamiento reside en su doble compilación: una ruta de calidad con `euler_a` a 20 pasos y CFG 5.0, y una ruta de alto rendimiento con `LCM` a 8 pasos y CFG 1.1 basada en DMD2, que reduce el coste computacional por imagen a menos de la mitad en número de pasos. El repositorio ocupa 13,9 GB y cada checkpoint pesa 6,94 GB en FP16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión latente basada en Stable Diffusion XL (familia Pony) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; sin ventana de contexto de tokens declarada) |
| Tipos de cuantización | FP16 únicamente; el autor indica que BF16 y builds cuantizados no forman parte de esta release |
| Idiomas soportados | no disponible (los prompts se documentan en inglés) |
| Licencia | chatrlabs-model-license-1.0 (license_name: chatrlabs-model-license-1.0) |
| Formato de pesos | safetensors (checkpoint único con VAE y ambos text encoders incluidos) |

## Arquitectura y entrenamiento

Dreampal es un modelo de difusión latente con arquitectura SDXL, heredero de la línea Pony, que emplea dos codificadores de texto y un VAE empaquetados dentro del propio checkpoint. La compilación de calidad se etiqueta como linaje v3.3 y se recomienda con el sampler `euler_a`, 20 pasos y CFG 5.0. La compilación rápida se etiqueta como linaje v3.2 DMD2 y se ejecuta con el sampler `LCM`, 8 pasos y CFG 1.1.

El autor advierte de que la compilación DMD2 no es una destilación de la compilación de calidad v3.3, sino una build acelerada basada en el checkpoint v3.2 DMD2, por lo que deben esperarse pequeñas diferencias de composición entre ambas. No se han publicado en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de ajuste por preferencias; tampoco se detalla el proceso de destilación más allá de la mención a DMD2 y LCM.

El modelo incorpora dos embeddings de inversión textual obligatorios según la documentación: `BSY_General_Positives_V1_PRO` como embedding positivo y `BSY_Anatomy_Negatives_V1_PRO` como prompt negativo. Ambos se incluyen en el repositorio y se cargan mediante `load_textual_inversion` en Diffusers o colocándolos en `ComfyUI/models/embeddings/`. El uso de IP-Adapter es opcional, con escala recomendada de 0.1.

## Capacidades

- Generación de imágenes texto-a-imagen en resoluciones en torno a 1 megapíxel: 768 × 1152, 832 × 1216 y 1024 × 1024.
- Dos modos de inferencia: calidad (20 pasos, `euler_a`, CFG 5.0) y rápido (8 pasos, `LCM`, CFG 1.1).
- Checkpoint autocontenido: incluye VAE y ambos text encoders, sin necesidad de modelo base.
- Soporte de inversión textual mediante los embeddings `BSY_General_Positives_V1_PRO` y `BSY_Anatomy_Negatives_V1_PRO`.
- Compatibilidad con IP-Adapter a escala 0.1 para condicionamiento por imagen de referencia.
- Estética orientada a retrato e ilustración de la familia Pony, con prefijo de puntuación `score_9, score_8_up, score_7_up`.
- Sin filtro de prompts ni safety checker integrados.
- No dispone de tool calling, razonamiento multi-paso ni capacidades de agente; es un modelo puramente generativo de imagen.
- Capacidades multilingües: no documentadas; los ejemplos de prompt de la model card están en inglés.

## Casos de uso

- Generación de retratos fotorrealistas para estudio: con el prefijo Pony y el embedding positivo, el modelo produce retratos con textura de piel natural y luz de ventana, adecuado para pruebas de concepto de iluminación y encuadre antes de una sesión real.
- Iteración rápida de conceptos visuales: la build DMD2 a 8 pasos y CFG 1.1 permite generar borradores en una fracción del tiempo de la build de calidad, útil para explorar decenas de variaciones de composición por prompt.
- Producción de ilustración para proyectos creativos: la estética Pony encaja en encargos de personajes y escenas ilustradas donde se busca un acabado estilizado y controlable mediante CFG entre 4 y 6.
- Integración en ComfyUI como nodo de generación: el flujo documentado (`Load Checkpoint` → `CLIP Text Encode` → `KSampler` → `VAE Decode`) permite encadenar el modelo con upscalers, controlnets o IP-Adapter dentro de un grafo de producción.
- Automatización por lotes vía Diffusers: el ejemplo con `StableDiffusionXLPipeline.from_single_file` permite generar imágenes desde scripts Python en pipelines de render por lotes, con control programático de pasos, CFG y resolución.
- Condicionamiento por referencia con IP-Adapter: a escala 0.1 se puede guiar el estilo o la identidad de la imagen generada a partir de una referencia, útil para mantener coherencia visual entre entregas de una misma serie.
- Prototipado de assets para aplicaciones creativas: al ser un checkpoint único de 6,94 GB, se puede desplegar en un solo fichero en entornos de demo o playground sin gestionar dependencias de modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint es FP16 de 6,94 GB, por lo que se requiere al menos ese espacio para cargar los pesos, más el overhead del pipeline y del VAE.
- GPU recomendadas: no especificadas por el autor. Por tamaño de checkpoint, GPUs con 12-16 GB de VRAM o superiores son el rango habitual para SDXL en FP16; A100 y H100 quedan sobredimensionadas para inferencia individual pero son válidas para servir en lote.
- Cabe en GPU de consumo: previsiblemente en RTX 4090 (24 GB) y en modelos con 16 GB; en GPUs de 8-12 GB requeriría gestión de memoria adicional no documentada por el autor.
- Opciones de despliegue: ComfyUI (flujo documentado), Diffusers con `StableDiffusionXLPipeline.from_single_file`, y cualquier runtime compatible con checkpoints SDXL en safetensors. No se documenta soporte explícito de vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión.
- Latencia y throughput: no disponibles. La build DMD2 reduce el número de pasos de 20 a 8, lo que implica aproximadamente un 60 % menos de evaluaciones del modelo por imagen, aunque no se publican tiempos absolutos.

## Comparativa con modelos similares

| Modelo | Familia | Pasos recomendados | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dreampal (calidad) | SDXL/Pony | 20 (`euler_a`, CFG 5.0) | safetensors único, FP16 | chatrlabs-model-license-1.0 | Hugging Face |
| Dreampal (DMD2) | SDXL/Pony + DMD2 | 8 (`LCM`, CFG 1.1) | safetensors único, FP16 | chatrlabs-model-license-1.0 | Hugging Face |
| SDXL base | SDXL | 25-50 | safetensors / diffusers | CreativeML Open RAIL++-M | Hugging Face, ampliamente extendido |
| Pony Diffusion V6 XL | SDXL/Pony | 20-30 | safetensors | licencia propia de Pony | Hugging Face, muy extendido |

No se dispone de datos de rendimiento comparado (FID, CLIP score u otras métricas) en la información proporcionada, por lo que la comparativa se limita a parámetros de configuración, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo explícitamente "uncensored": no aplica filtro de prompts ni safety checker. La responsabilidad de cumplir la legislación y las normas de la plataforma recae en el usuario.
- La model card incluye la etiqueta `not-for-all-anchored` (not-for-all-audiences), lo que indica contenido potencialmente no apto para todo público.
- Licencia `chatrlabs-model-license-1.0`: no es una licencia open source estándar; deben revisarse los términos del fichero LICENSE antes de cualquier uso comercial.
- Riesgo de duplicación de sujetos a resoluciones superiores a 1 megapíxel y pérdida de detalle por debajo de las resoluciones recomendadas.
- Solo se distribuye en FP16; no hay builds BF16 ni cuantizadas en esta release, lo que limita el despliegue en hardware con poca VRAM.
- La build DMD2 no es destilación de la build de calidad, por lo que la composición puede diferir entre ambas; no deben intercambiarse resultados esperando equivalencia.
- Dependencia de embeddings de inversión textual concretos (`BSY_General_Positives_V1_PRO`, `BSY_Anatomy_Negatives_V1_PRO`) para reproducir los resultados de producción del autor.
- Sesgos conocidos: no documentados en la información disponible; la estética Pony tiende a un sesgo estilizado hacia ilustración y retrato.
- Riesgo de alucinación visual: no documentado; como todo modelo de difusión, puede generar anatomía incorrecta, texto ilegible y artefactos en manos y extremidades.
- Idiomas soportados no declarados; los prompts de referencia están en inglés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chatrlabs/Dreampal
- Checkpoint de calidad: https://huggingface.co/chatrlabs/Dreampal/resolve/main/dreampal-fp16.safetensors?download=true
- Checkpoint DMD2: https://huggingface.co/chatrlabs/Dreampal/resolve/main/dreampal-dmd2-fp16.safetensors?download=true
- Repositorio GitHub: https://github.com/chatrlabs/Dreampal
- Playground: https://chatrlabs.com/playground
- Fichero de licencia: https://huggingface.co/chatrlabs/Dreampal/blob/main/LICENSE
- Sumas de verificación: https://huggingface.co/chatrlabs/Dreampal/blob/main/SHA256SUMS
