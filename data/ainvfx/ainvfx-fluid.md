# AInVFX/ainvfx-fluid

## Resumen

ainvfx-fluid es un IC-LoRA (in-context LoRA) para el modelo de vídeo LTX-2.5 de 22B de Lightricks, desarrollado por AInVFX. Resuelve un problema muy concreto en producción de efectos visuales (VFX): sustituir la simulación física de fluidos (humo, vapor, fuego, explosiones, agua y otros líquidos, polvo y nubes) por una generación condicionada por keyframes pintados a mano con colores planos. El artista pinta manchas de color en uno o varios fotogramas clave de una rejilla de 8 frames; el LoRA reemplaza esas manchas por el fluido correspondiente y anima la transición entre keyframes. La palabra de activación es `ainvfxfluid`.

El adaptador tiene rango 32, pesa 654 MB en formato ComfyUI (safetensors de un solo archivo) y se aplica sobre el transformer de 22B de LTX-2.5, en versión dev o distilled. Se entrenó sobre 528 pares sintéticos procedentes de 176 escenas, publicados como dataset abierto, y se reentrenó el 1 de noviembre de 2026 tras detectar que la versión anterior había usado clips de stock con licencia incompatible. Está pensado como generador de stock footage art-directable para compositing y previz, no como modelo generalista.

Es relevante ahora porque demuestra un flujo de trabajo práctico de sustitución de simulaciones costosas por generación condicionada, con control espacial y temporal preciso, dentro de ComfyUI y con un modelo base abierto de 22B. La ficha se basa únicamente en la model card y los metadatos de Hugging Face; los datos no publicados se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | IC-LoRA (adaptador de bajo rango) sobre transformer de difusión de vídeo LTX-2.5 (22B) |
| Parámetros totales | no disponible (el adaptador pesa 654 MB; el modelo base tiene 22B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el control es un vídeo de la misma resolución y longitud que la salida) |
| Tipos de cuantización | el modelo base se usa en int8 en los ejemplos; el adaptador se distribuye en safetensors (sin cuantización indicada) |
| Idiomas soportados | en (inglés) |
| Licencia | LTX-2.x Community License |
| Formato de pesos | safetensors (formato ComfyUI, single-file, rango 32) |

## Arquitectura y entrenamiento

El adaptador es un IC-LoRA de rango 32 que se inyecta en el transformer de difusión LTX-2.5 (22B) de Lightricks. La condición de control es un vídeo de la misma resolución y duración que la salida: los keyframes pintados con colores planos y fotogramas negros entre ellos. El LoRA aprende a mapear esos colores planos a fluidos específicos (humo, vapor, fuego, explosiones, agua, polvo, nubes) y a interpolar la animación entre keyframes consecutivos, sustituyendo la simulación por generación condicionada.

El entrenamiento se realizó sobre 528 pares sintéticos derivados de 176 escenas, todas documentadas y publicadas en el dataset AInVFX/ainvfx-fluid. La versión distribuida se reentrenó el 1 de noviembre de 2026 exclusivamente con clips sintéticos generados por el autor, tras detectar que una versión anterior se había entrenado por error con clips de stock cuyos términos no lo permitían. No se detallan en la información disponible el número de tokens, la composición exacta del dataset ni si se aplicó RLHF/DPO; no hay innovaciones técnicas adicionales documentadas (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de vídeo condicionada por keyframes pintados: sustituye manchas de color plano por humo, vapor, fuego, explosiones, agua y otros líquidos, polvo y nubes.
- Animación entre keyframes: interpola el fluido desde un keyframe pintado hasta el siguiente, con control temporal sobre una rejilla de 8 frames.
- Control espacial preciso: el artista define la forma, posición y evolución del fluido mediante el pintado, no mediante prompt.
- Generación de stock footage art-directable para compositing y previz.
- Integración con ComfyUI mediante workflow incluido y app open source PaintAPlate.
- Soporte de vídeo a vídeo (pipeline video-to-video).
- Idioma de prompt: inglés (palabra de activación `ainvfxfluid`).
- No se documentan tool calling, agentes, vision, audio ni thinking mode.

## Casos de uso

- Generación de stock footage de humo y fuego para compositing: el artista pinta la forma de la columna de humo en el primer y último frame, y el LoRA genera la animación completa con la evolución del fluido, evitando rodajes o simulaciones costosas.
- Previz de VFX en cine y televisión: sustituye simulaciones de fluidos preliminares por resultados generados rápidamente, permitiendo iterar sobre la dirección de arte antes del trabajo final.
- Explosiones y detonaciones para producciones de bajo presupuesto: se pinta la silueta de la explosión en keyframes y el modelo genera la deflagración animada, integrable después en compositing.
- Vapor y chimeneas industriales en escenas de exterior: pintado de la pluma sobre un cielo plano para generar la columna de vapor con evolución realista a lo largo del plano.
- Agua y líquidos en planos de producto o publicidad: se define la forma del vertido o la ola en keyframes y el LoRA anima el líquido, útil para anuncios y demos.
- Polvo y nubes atmosféricas en planos de paisaje: generación de polvo levantado por vehículos o nubes en movimiento a partir de manchas pintadas, para enriquecer planos rodados.
- Docencia y formación en VFX generativo: el modelo se originó como demo del bootcamp AInVFX, y sirve para enseñar flujos de trabajo de sustitución de simulación con LoRAs condicionados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los ejemplos de la model card indican la configuración de inferencia usada: transformer LTX 2.5 22B distilled en int8, 8 steps, CFG 1, semilla 42, sampler `euler_ancestral`, fuerza de LoRA 1.0, prompt negativo `blurry, low quality, distorted, watermark`, y frame rate siguiendo el vídeo de control (24 o 25 fps). Las resoluciones de los ejemplos incluyen 1024 x 576 y 512 x 512.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; los ejemplos usan el transformer de 22B en int8, lo que implica un consumo elevado de VRAM, pero no se publica una cifra concreta.
- GPU recomendadas: no disponible; no se especifican modelos de GPU en la información proporcionada.
- ¿Cabe en GPU consumer?: no disponible; con un transformer de 22B en int8 el requisito es alto, pero no se confirma compatibilidad con GPU consumer.
- Opciones de despliegue: ComfyUI (workflow incluido), con el modelo base LTX-2.5 en versión dev o distilled; la app PaintAPlate (open source) permite pintar sobre un plate y ejecutar el LoRA en ComfyUI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (IC-LoRAs de fluidos para LTX-2.5 u otros modelos de vídeo) con datos de parámetros, contexto, rendimiento o licencia que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia LTX-2.x Community License: conviene revisar sus términos antes de uso comercial; la licencia del adaptador es "other" con nombre ltx-2.x-community-license.
- Solo inglés: los prompts deben redactarse en inglés; no se documenta soporte multilingüe.
- Dependencia del modelo base: requiere LTX-2.5 de 22B (dev o distilled) y no funciona de forma autonoma.
- Riesgo de alucinación visual: como modelo generativo, puede producir fluidos inconsistentes con el pintado o artefactos en transiciones entre keyframes; los ejemplos usan prompt negativo para mitigar calidad baja.
- Historial de licencias: la versión anterior se entrenó por error con clips de stock con términos incompatibles; debe eliminarse cualquier copia antigua y descargar de nuevo el archivo (mismo nombre, mismos ajustes, mismo workflow).
- El control exige pintar keyframes con colores planos sobre negro; un pintado incorrecto o fuera de la rejilla de 8 frames puede degradar el resultado.
- No se documentan sesgos demográficos ni sociales; al ser un modelo de fluidos, el riesgo de sesgo relevante es limitado, pero no se han publicado evaluaciones al respecto.
- No hay datos publicados de benchmarks, latencia ni VRAM, lo que dificulta la planificación de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AInVFX/ainvfx-fluid
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Dataset de entrenamiento: https://huggingface.co/datasets/AInVFX/ainvfx-fluid
- Dataset de plates de test: https://huggingface.co/datasets/AInVFX/ainvfx-paintaplate
- Workflow ComfyUI: https://huggingface.co/AInVFX/ainvfx-fluid/blob/main/workflow/ainvfx-fluid_painted_smoke_plume.json
- App PaintAPlate (open source): https://github.com/AInVFX/ainvfx-paintaplate
- Tutorial en YouTube (45 minutos): https://www.youtube.com/watch?v=Ho4tmJzEkIs
- Artículo del blog: https://www.ainvfx.com/blog/paint-your-fluid-simulations-a-free-ltx-2-5-ic-lora-for-smoke-and-fire-in-comfyui/
- Web del autor: https://www.ainvfx.com
- Bootcamp AInVFX: https://www.ainvfx.com/bootcamp/
- Licencia LTX-2.x Community License: https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2_x
