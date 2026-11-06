# crombobularBoop/chroma-H3-comfyui

## Resumen

chroma-H3-comfyui es un repositorio de conversión de LoRAs al formato compatible con ComfyUI, derivado del modelo base lodestones/chroma-h3. Lo publica el usuario crombobularBoop y no contiene entrenamiento propio: su función es exclusivamente adaptar los nombres de claves y el layout de los pesos LoRA originales para que puedan cargarse directamente en ComfyUI en precisión bf16. El pipeline declarado es text-to-image y la librería asociada es minimax-h3.

El repositorio incluye dos ficheros LoRA en formato safetensors: uno de fuerza 1 (chroma-h3_lora_comfy.safetensors) y otro orientado a muestreo rápido (chroma-h3_lora_vspace_dmd8_comfy.safetensors), pensado para aplicarse sobre MiniMax-H3 estándar con sampler Euler, CFG 1 y entre 4 y 8 pasos. También se incluye el script de conversión convert_chroma_h3_lora.py.

Su relevancia es práctica: facilita el uso de los LoRAs de chroma-h3 en flujos de trabajo ComfyUI sin necesidad de reconvertir manualmente los pesos. El tamaño del repositorio es de 1,4 GB y la licencia aplicada es la MiniMax-H3 Community License Agreement, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base lodestones/chroma-h3; no se especifica la arquitectura interna del modelo base |
| Parametros totales | no disponible (adaptadores LoRA; el tamaño del modelo base no se detalla) |
| Parametros activos | no disponible (no es un modelo MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (único formato indicado en la model card) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors (formato ComfyUI) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: contiene conversiones de los LoRAs publicados en lodestones/chroma-h3 (carpeta lora/) al formato que espera ComfyUI. Según la model card, el crédito del entrenamiento corresponde íntegramente a lodestone y la conversión solo modifica nombres de claves y layout de los tensores. Los pesos se distribuyen en bf16.

Se incluyen dos adaptadores. El primero, chroma-h3_lora_comfy.safetensors, deriva de lora/lora.safetensors y se aplica con strength 1. El segundo, chroma-h3_lora_vspace_dmd8_comfy.safetensors, deriva de lora/lora_vspace_dmd8.safetensors y está diseñado para usarse sobre MiniMax-H3 estándar con sampler Euler, CFG 1 y entre 4 y 8 pasos de muestreo, lo que sugiere una técnica de destilación o aceleración del muestreo (el sufijo dmd8 apunta a ese tipo de enfoque, aunque la model card no lo detalla). El script convert_chroma_h3_lora.py incluido documenta el proceso de conversión aplicado.

## Capacidades

- Generación de imágenes texto-a-imagen mediante LoRAs aplicados sobre el modelo base chroma-h3 en ComfyUI.
- Aplicación de adaptadores de estilo o ajuste fino sobre el modelo base, con strength configurable (el fichero principal se documenta con strength 1).
- Muestreo acelerado: el LoRA vspace_dmd8 permite generar con Euler, CFG 1 y solo 4-8 pasos.
- Integración directa en flujos de trabajo de ComfyUI gracias a la conversión de nombres de claves.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni multilingüismo.

## Casos de uso

- Flujos de trabajo en ComfyUI: cargar chroma-h3_lora_comfy.safetensors como nodo LoRA sobre el modelo base chroma-h3 para aplicar el ajuste sin reconvertir pesos manualmente.
- Prototipado rápido de imágenes: usar el LoRA vspace_dmd8 con Euler, CFG 1 y 4-8 pasos para iterar sobre prompts con baja latencia en entornos de desarrollo.
- Pruebas de estilo en pipelines de generación de imágenes: comparar el resultado con strength 1 frente al modelo base para evaluar el efecto del adaptador antes de integrarlo en producción.
- Reproducción de resultados de la comunidad: al ser una conversión fiel de los LoRAs de lodestones/chroma-h3, permite replicar configuraciones publicadas por otros usuarios de ComfyUI.
- Automatización de generación de imágenes por lotes: integrar los LoRAs en scripts que invoquen ComfyUI por API para producir variaciones controladas de un mismo concepto.
- Educación y experimentación: el script convert_chroma_h3_lora.py sirve como referencia para entender cómo se traducen los nombres de claves de un LoRA al formato ComfyUI.
- Ajuste de cargas en memoria: al distribuirse en bf16 y ser adaptadores de bajo rango, se pueden intercambiar entre generaciones sin recargar el modelo base completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el modelo base; los LoRAs en bf16 suman un tamaño reducido dentro del repositorio de 1,4 GB, pero el consumo dominante lo determina el modelo base chroma-h3.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; depende de los requisitos del modelo base chroma-h3, que no se detallan.
- Opciones de despliegue: ComfyUI (formato nativo de estos ficheros); otros runners no están documentados.
- Latencia y throughput: no disponibles; el LoRA vspace_dmd8 está pensado para reducir pasos de muestreo (4-8 con Euler y CFG 1), lo que en la práctica disminuye el tiempo de generación respecto a configuraciones estándar, aunque no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| crombobularBoop/chroma-H3-comfyui | LoRA en formato ComfyUI (conversión) | no disponible | no disponible | minimax-h3-community-license-agreement | Hugging Face, 46 descargas |
| lodestones/chroma-h3 | LoRA original (modelo base del adaptador) | no disponible | no disponible | no disponible en la información | Hugging Face |
| MiniMax-H3 | Modelo generativo texto-a-imagen de referencia | no disponible | no disponible | no disponible en la información | Uso como base del LoRA vspace_dmd8 |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo base lodestones/chroma-h3 (o MiniMax-H3 para el adaptador vspace_dmd8) para funcionar.
- El repositorio solo contiene adaptadores LoRA; no incluye los pesos del modelo base.
- La licencia MiniMax-H3 Community License Agreement es de tipo "other": conviene revisar sus términos antes de cualquier uso comercial, ya que puede imponer restricciones adicionales no resumidas aquí.
- Solo se ofrece bf16; no se documentan versiones cuantizadas ni en otros formatos.
- No hay información sobre sesgos, riesgo de alucinación visual, idiomas soportados ni limitaciones de contexto.
- El autor del repositorio no es el entrenador del modelo: posibles incidencias de calidad deben atribuirse al LoRA original de lodestones/chroma-h3.
- El repositorio tiene muy poca tracción (46 descargas, 0 likes) y fue creado y actualizado el mismo día (2026-10-31), por lo que no hay validación comunitaria extensa.
- No se documentan requisitos de hardware ni compatibilidad con GPUs de consumo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/crombobularBoop/chroma-H3-comfyui
- Modelo base: https://huggingface.co/lodestones/chroma-h3
- Carpeta de LoRAs originales: https://huggingface.co/lodestones/chroma-h3/tree/main/lora
- Script de conversión: convert_chroma_h3_lora.py (incluido en el repositorio)
