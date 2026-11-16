# PotatoForge/Moss-Image-SFT-Mixed-INT8-W4-Quants

## Resumen

Moss-Image-SFT-Mixed-INT8-W4-Quants es una cuantización del modelo de difusión texto-a-imagen MOSS-Image SFT, publicado originalmente por Comfy-Org. La ha generado el usuario PotatoForge con su herramienta PotatoForge, y combina capas en INT8 con capas en 4 bits para reducir el peso del checkpoint hasta unos 3,71 GB en un único archivo safetensors. El objetivo es claro: hacer que un modelo de difusión de calidad pueda ejecutarse en GPUs de gama baja con poca VRAM.

El checkpoint está pensado para ComfyUI: se coloca en `ComfyUI/models/diffusion_models` y se usa junto con el LoRA DMD de 8 pasos de Lodestone (no incluido) para generar imágenes en muy pocos pasos. El autor lo ha probado en una GTX 1660 Super de 6 GB con 32 GB de RAM del sistema, obteniendo unos 5,7 s/it a 696 × 1048 píxeles y 8-12 pasos con CFG 1.

La relevancia de esta ficha es doble: por un lado, muestra una técnica de cuantización mixta (INT8 + W4) aplicada a un modelo de difusión; por otro, documenta un caso real de despliegue en hardware consumer muy modesto. La licencia Apache 2.0 facilita su uso comercial, aunque el modelo base y el LoRA asociado tienen sus propias condiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión texto-a-imagen (single-file para ComfyUI); arquitectura interna del base no detallada en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión, no de contexto textual) |
| Tipos de cuantizacion | Mixta: 107 familias de tensores en W4A4 ConvRot MSE y 61 familias en INT8 ConvRot |
| Idiomas soportados | no disponible (los prompts dependen del codificador de texto del pipeline) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (diffusion-single-file) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del modelo base Comfy-Org/MOSS-Image, un modelo de difusión texto-a-imagen del que no se detalla en la información disponible su arquitectura interna (tipo de backbone, número de parámetros, composición del dataset de entrenamiento ni si hubo RLHF o ajuste por preferencias). Lo que sí se documenta es el proceso de cuantización: 107 familias de tensores se han cuantizado a 4 bits con el esquema W4A4 ConvRot MSE, mientras que 61 familias conservan la cuantización INT8 ConvRot original. El resto de tensores permanece sin cambios.

La innovación técnica principal es precisamente esa asignación selectiva de precisión: el autor indica que las elecciones de precisión se probaron contra el modelo INT8 oficial, lo que sugiere una calibración por capas para minimizar la pérdida de calidad. El resultado es un archivo de ~3,71 GB, frente al peso mayor que tendría una versión solo INT8. No se especifican detalles sobre el número de tokens de entrenamiento ni sobre el pipeline de datos, porque esta ficha describe una cuantización, no un entrenamiento desde cero.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image).
- Integración directa en ComfyUI como checkpoint de difusión single-file.
- Ejecución en pocos pasos (8-12) con CFG 1, especialmente combinado con el LoRA DMD de 8 pasos de Lodestone a fuerza 0.8.
- Resoluciones verticales y retratos, probadas a 696 × 1048 píxeles.
- Compatible con el ecosistema de nodos y workflows de ComfyUI (LoRAs, samplers Euler/Simple, etc.).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multimodalidad adicional; es un modelo puramente generativo de imagen.
- El soporte multilingüe de los prompts depende del codificador de texto del pipeline base, no disponible en la información proporcionada.

## Casos de uso

- Generación de ilustraciones en equipos modestos: con solo 6 GB de VRAM en una GTX 1660 Super, el modelo permite crear imágenes a 696 × 1048 en unos 5,7 s/it, lo que lo hace viable en estaciones de trabajo sin GPU de gama alta.
- Prototipado rápido de conceptos visuales: gracias a los 8-12 pasos con CFG 1 y el LoRA DMD, se pueden iterar decenas de variaciones en pocos minutos para explorar direcciones de diseño.
- Creación de contenido para blogs y redes: el tamaño reducido del checkpoint (~3,71 GB) facilita tenerlo instalado junto a otros modelos en el disco de un portátil o equipo de escritorio.
- Flujos de trabajo en ComfyUI para artistas técnicos: al ser un single-file safetensors, se puede encadenar con nodos de upscaling, controlnet u otros LoRAs sin reescribir el pipeline.
- Pruebas de cuantización e investigación: sirve como caso de estudio de cuantización mixta INT8/W4 en modelos de difusión, comparando calidad frente al INT8 oficial.
- Despliegue en entornos con restricciones de memoria: al reducir el peso y requerir menos VRAM, encaja en servidores pequeños o instancias con GPU de 6-8 GB para generación de imágenes bajo demanda.
- Generación de imágenes de referencia para documentación técnica o material educativo, donde la velocidad de iteración prima sobre el máximo detalle fotorrealista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento aportado por el autor es la velocidad de inferencia en su hardware de prueba: aproximadamente 5,7 s/it en una NVIDIA GTX 1660 Super de 6 GB, con 32 GB de RAM, a 696 × 1048 y 8-12 pasos con CFG 1 y sampler Euler/Simple.

## Requisitos de hardware

- VRAM estimada: el autor lo ejecuta en una GTX 1660 Super de 6 GB, por lo que 6 GB de VRAM son suficientes en ese escenario concreto (resolución 696 × 1048, 8-12 pasos, CFG 1).
- RAM del sistema: 32 GB en el equipo de prueba; no se indica un mínimo oficial.
- GPU recomendadas: no hay una lista oficial; el propio autor valida la GTX 1660 Super. Por tamaño del checkpoint (~3,71 GB), debería caber en GPUs consumer con 6 GB o más, aunque no se documentan pruebas en otras tarjetas.
- ¿Cabe en GPU consumer? Sí, según la prueba del autor en una GTX 1660 Super de 6 GB.
- Opciones de despliegue: ComfyUI (colocando el archivo en `ComfyUI/models/diffusion_models`). No se documentan otros runners como vLLM, llama.cpp, Ollama o TGI, que además no aplican a un modelo de difusión de este tipo.
- Latencia y throughput: ~5,7 s/it en GTX 1660 Super a 696 × 1048; el tiempo total por imagen depende del número de pasos (8-12).
- Dependencia adicional: el workflow recomendado usa el LoRA DMD de 8 pasos de Lodestone a fuerza 0.8, que no está incluido en el repositorio.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano del checkpoint | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PotatoForge/Moss-Image-SFT-Mixed-INT8-W4-Quants | Difusión text-to-image cuantizada (INT8 + W4) | ~3,71 GB | Resolución probada 696 × 1048 | Apache 2.0 | Hugging Face |
| Comfy-Org/MOSS-Image (modelo base) | Difusión text-to-image | no disponible | no disponible | no disponible en la información proporcionada | Hugging Face |
| Versión INT8 oficial de MOSS-Image | Difusión text-to-image cuantizada INT8 | no disponible | no disponible | no disponible en la información proporcionada | Referenciada por el autor, sin enlace directo |
| lodestones/MOSS-Image-SFT-8-steps-dmd | LoRA de destilación para 8 pasos | no disponible | no aplica | no disponible en la información proporcionada | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a tipo, tamaño y licencia cuando están disponibles.

## Limitaciones y advertencias

- La cuantización mixta INT8/W4 puede introducir pérdida de calidad frente al modelo INT8 oficial; el autor afirma haber probado las precisiones contra ese modelo, pero no publica métricas de calidad.
- El LoRA DMD de 8 pasos necesario para el workflow recomendado no está incluido en el repositorio; sin él, el rendimiento y la calidad pueden diferir.
- El modelo solo se ha probado en una configuración concreta (GTX 1660 Super 6 GB, 32 GB de RAM, 696 × 1048, 8-12 pasos, CFG 1); no hay garantías en otras GPUs, resoluciones o samplers.
- No se documentan sesgos conocidos del modelo base ni del proceso de cuantización.
- Riesgo de alucinación visual y de artefactos propios de los modelos de difusión, potencialmente acentuado por la cuantización a 4 bits en algunas capas.
- La licencia del checkpoint es Apache 2.0, pero el uso comercial debe verificar también las condiciones del modelo base Comfy-Org/MOSS-Image y del LoRA de Lodestone.
- No se especifican idiomas soportados ni limitaciones de contexto textual; dependen del codificador de texto del pipeline.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni informes independientes de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PotatoForge/Moss-Image-SFT-Mixed-INT8-W4-Quants
- Modelo base: https://huggingface.co/Comfy-Org/MOSS-Image
- LoRA DMD de 8 pasos de Lodestone: https://huggingface.co/lodestones/MOSS-Image-SFT-8-steps-dmd
- Herramienta de cuantización PotatoForge: https://github.com/bakapotatolord/potatoforge-quantization
