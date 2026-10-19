# malcolmrey/moss-serenity

## Resumen

MOSS Serenity es un ajuste fino completo (full finetune) del modelo de difusión texto-a-imagen MOSS-Image Base, publicado por el usuario malcolmrey en HuggingFace. Su objetivo es acotado y explícito: enseñar al modelo un conjunto cerrado de personas reales identificadas por nombre (Keanu Reeves, Gillian Anderson, Anya Taylor-Joy, Jason Momoa, Jenna Ortega, Nathan Fillion, entre las documentadas en las muestras) sin degradar lo que el modelo base ya sabía hacer con escenas, paisajes y composiciones sin personas.

El modelo mantiene exactamente la misma arquitectura que MOSS-Image Base —un DiT (diffusion transformer) acoplado al text encoder Qwen3.5-9B y al VAE de FLUX.2—, por lo que funciona como reemplazo directo en cualquier workflow de ComfyUI ya montado para MOSS-Image. Se entrenó durante 24.000 pasos en una única RTX 5090 con la herramienta maltrainer del propio autor, y se distribuye en tres formatos: pesos bf16 (10,2 GB), INT8 ConvRot (5,4 GB) y extracciones LoRA de rangos 64, 128 y 256.

Su relevancia práctica es doble: por un lado demuestra un flujo de trabajo de ajuste fino sobre MOSS-Image reproducible en hardware de consumo (una sola GPU); por otro, la publicación de los pesos como LoRA extraíbles permite aplicar el efecto del finetune sobre el modelo base original sin cargar un checkpoint completo. La licencia es Apache 2.0, aunque con matices importantes sobre derechos de imagen que se detallan más abajo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) de MOSS-Image, con text encoder Qwen3.5-9B y VAE FLUX.2 |
| Parámetros totales | No disponible (el fichero DiT en bf16 ocupa 10,2 GB) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; la longitud de prompt viene limitada por el text encoder Qwen3.5-9B, no documentada en la model card |
| Tipos de cuantización | bf16 y INT8 ConvRot (Linears grandes en int8 sobre base rotada de Hadamard, una escala por fila) |
| Idiomas soportados | No disponible; todos los prompts de ejemplo están en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint único para ComfyUI) y safetensors LoRA |
| Pasos de muestreo | 8 con LoRA DMD turbo; 50 sin turbo (20 se acerca en paisajes); 12 en el workflow de LoRA extraída |
| CFG / sampler / scheduler | 4.0 / euler / simple; shift 5 gestionado por ComfyUI |
| Guiado adicional | SkipLayerGuidanceDiTSimple, capa 22, start 0, end 0.5 |
| Resoluciones de ejemplo | 1584 × 1776 (turbo) y 1920 × 1088 (full, 50 pasos) |
| Tamaño del repositorio | 28,1 GB |
| Descargas / likes | 0 descargas / 15 likes (en el momento de la consulta) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base, sin modificaciones: un transformer de difusión (DiT) que opera en el espacio latente del VAE de FLUX.2 y que recibe las condicionales de texto de un encoder Qwen3.5-9B. El autor no documenta en la información disponible el número de parámetros del DiT ni la configuración de capas, solo el tamaño de los pesos (10,2 GB en bf16). El checkpoint publicado es la media EMA de los pesos en el paso 24.000, lo que suaviza el ruido típico del entrenamiento y suele traducirse en una mejora de calidad frente a los pesos crudos de ese mismo paso.

El entrenamiento consistió en un full finetune de 24.000 pasos sobre una única RTX 5090, usando maltrainer, la herramienta del propio autor (repositorio enlazado más abajo). El conjunto de datos no se describe en detalle: la model card indica que cada persona se aprendió a partir de captions de una única forma canónica, lo que explica que el modelo responda mejor a ese formato exacto de prompt. No se documentan número de tokens de texto, número de imágenes, composición del dataset ni si hubo etapas de RLHF o DPO (no aplicables de forma estándar en difusión, pero no se indica ninguna preferencia optimizada). La innovación destacable no está en la arquitectura sino en el pipeline: finetune completo en hardware de consumo, publicación simultánea de checkpoints bf16 e INT8 ConvRot, y extracción del delta como LoRA en tres rangos (64, 128, 256) para poder recombinarlo con el modelo base.

## Capacidades

- Generación de imágenes texto-a-imagen fotorrealistas, con muestras publicadas de retratos callejeros, escenas cinematográficas, paisajes y escenas rurales.
- Memorización de identidades concretas por nombre (trigger): el modelo asocia un token de persona a un rostro y lo reproduce en encuadres, vestuario e iluminación nuevos.
- Composición multi-sujeto: el repositorio incluye carpetas `pairs` (dos personas) y `trios` (tres personas) con muestras generadas.
- Preservación de capacidades del modelo base: genera escenas sin personas (carpeta `no-people`) sin haberlas desaprendido durante el finetune.
- Control fino de encuadre, vestuario, escenario y luz mediante una frase descriptiva en el prompt, siguiendo la plantilla aprendida.
- Dos regímenes de inferencia: 8 pasos con el LoRA DMD turbo (rápido, para iterar) y 50 pasos sin turbo (detalle máximo, Full HD).
- Extracción de LoRA: el efecto del finetune se puede aplicar sobre MOSS-Image Base original con rangos 64, 128 o 256, e incluso combinarse con otros LoRA en el Power Lora Loader de ComfyUI.
- Compatibilidad directa con ComfyUI: workflows JSON incluidos, sin nodos adicionales para el shift.
- No documentado: soporte de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio o edición de imagen. Es un modelo puramente texto-a-imagen.

## Casos de uso

- Previsualización de reparto en desarrollo de guion: dado un nombre de actor y una descripción de escena, el modelo devuelve un still coherente con vestuario, época e iluminación, útil para moodboards antes de rodaje o de casting.
- Storyboarding cinematográfico en Full HD: con 50 pasos y 1920 × 1088 se obtienen keyframes con detalle suficiente para presentar secuencias al equipo de producción sin pasar por un artiste de concepto.
- Retratos callejeros rápidos en 8 pasos: el workflow turbo a 1584 × 1776 tarda unos 16 s en una RTX 5090 (8,7 s en INT8), lo que permite docenas de variaciones por prompt en una sesión de exploración visual.
- Escenas de grupo: las carpetas `pairs` y `trios` documentan composiciones de dos y tres personas, aplicables a ilustración editorial, portadas o viñetas donde varios personajes deben aparecer en el mismo plano.
- Integración drop-in en pipelines ComfyUI existentes: cualquier workflow montado para MOSS-Image Base sigue funcionando cambiando solo el fichero en Load Diffusion Model, sin reescribir grafos ni nodos.
- Mezcla de estilos con LoRA: cargando `serenity_v1_lora_r256` junto a un LoRA de estilo propio en el Power Lora Loader se obtiene la identidad aprendida con la estética del segundo LoRA, con 12 pasos en el workflow documentado.
- Fondos y plates sin personas: la capacidad preservada para paisajes y pueblos permite generar placas de fondo para composición digital o para prototipos de interfaz.
- Despliegue en GPUs de 24 GB: el checkpoint INT8 ConvRot (5,4 GB) reduce el espacio de pesos del DiT a la mitad con una error relativo medio del 0,9 % por capa, lo que facilita servir el modelo en tarjetas de gama alta de consumo.
- Investigación sobre finetune de difusión: el repositorio `docs/training.md` y maltrainer sirven como referencia reproducible para replicar un full finetune de MOSS-Image en una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye FID, CLIP score, ImageReward ni ninguna otra métrica cuantitativa, y las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo (los resultados obtenidos eran consultas matemáticas sin relación).

Los únicos datos de rendimiento medibles son de latencia, medidos por el autor en una RTX 5090:

| Configuración | Resolución | Pasos | Tiempo |
|---|---|---|---|
| bf16 + LoRA DMD turbo | 1584 × 1776 | 8 | ~16 s |
| INT8 ConvRot + LoRA DMD turbo | No especificada | 8 | 8,7 s (incluyendo carga) |
| bf16 sin turbo | 1920 × 1088 | 50 | ~62 s |
| bf16 sin turbo | 1920 × 1088 | 20 | ~25 s |

| Métrica de cuantización | Valor |
|---|---|
| Error relativo medio por capa Linear (INT8 ConvRot vs bf16) | ≤ 0,9 % |
| Tamaño DiT bf16 | 10,2 GB |
| Tamaño DiT INT8 ConvRot | 5,4 GB |
| Tamaño LoRA r64 / r128 / r256 | 0,3 GB / 0,6 GB / 1,2 GB |

## Requisitos de hardware

- VRAM estimada para el DiT: 10,2 GB en bf16 y 5,4 GB en INT8 ConvRot, según los tamaños de fichero publicados.
- VRAM del text encoder: el repositorio referencia Qwen3.5-9B en int8 ConvRot o bf16, pero no publica los tamaños de esos ficheros; a 9.000 millones de parámetros, el bf16 rondaría los 18 GB y el int8 la mitad. Estas cifras son una estimación por recuento de parámetros, no un dato del autor.
- VRAM del VAE: FLUX.2 (`flux2_vae.safetensors`), tamaño no publicado en la información disponible.
- Estimación conjunta: la combinación INT8 ConvRot (DiT + encoder) más VAE debería encajar en 24 GB, mientras que la ruta íntegramente bf16 apunta a 32 GB o más, o a descarga parcial de pesos a RAM.
- GPU de referencia del autor: RTX 5090, empleada tanto para el entrenamiento (24.000 pasos) como para las mediciones de latencia.
- Cabe en GPU de consumo: sí, al menos en la ruta INT8 ConvRot; no hay confirmación del autor sobre modelos concretos distintos de la RTX 5090.
- Opciones de despliegue documentadas: ComfyUI, con cuatro workflows JSON incluidos (turbo sin LoRA, 50 pasos sin turbo, turbo con LoRA propia y LoRA extraída + turbo a 12 pasos). Los kernels int8 requieren comfy-kitchen.
- Despliegue no documentado: vLLM, TGI, llama.cpp, Ollama o Diffusers no aparecen en la model card; no hay evidencia de soporte.
- Throughput: aproximadamente 0,06–0,12 imágenes por segundo en turbo (8 pasos) y 0,016 imágenes por segundo en full (50 pasos) sobre RTX 5090, derivado de los tiempos publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / prompt | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS Serenity (este modelo) | No disponible (DiT de 10,2 GB en bf16) | No documentado; encoder Qwen3.5-9B | Sin benchmarks; 8,7–16 s por imagen en RTX 5090 | Apache 2.0 | HuggingFace, 0 descargas, 15 likes |
| MOSS-Image Base (OpenMOSS-Team) | No disponible | No documentado | Sin datos en la información disponible | No disponible en la información consultada | HuggingFace, modelo base del finetune |
| MOSS-Image Base + LoRA r256 de Serenity | Idénticos al base + 1,2 GB de LoRA | Idéntico al base | 12 pasos con turbo según el workflow incluido; sin métricas | Apache 2.0 (el LoRA) | Incluido en este repositorio |
| MOSS-Image Base + DMD 8-steps (lodestones) | Idénticos al base + LoRA turbo | Idéntico al base | 8 pasos; sin métricas publicadas aquí | No disponible en la información consultada | HuggingFace, enlazado por el autor |

No se dispone de datos verificables para comparar con alternativas de otros ecosistemas (FLUX.2, Qwen-Image u otros DiT de tamaño similar): la información proporcionada solo cubre el linaje MOSS-Image.

## Limitaciones y advertencias

- Alcance de identidades cerrado: el modelo solo conoce el conjunto de personas incluidas en el dataset de entrenamiento. No generaliza a personas no vistas y no hay indicación de cuántas identidades distintas se cubrieron.
- Sensibilidad al formato de prompt: el autor advierte explícitamente que cada persona se aprendió con captions de una única forma (`photo of <trigger>, a <woman|man>, <una frase de aspecto, encuadre, ropa, escena y luz>`). Prompts fuera de esa plantilla degradan el resultado.
- Riesgo legal por derechos de imagen: la licencia Apache 2.0 cubre el código y los pesos, pero no los derechos de imagen de las personas reales representadas. Generar y publicar imágenes de personas identificables puede infringir derechos de publicidad o de imagen según la jurisdicción, y abre la puerta a usos de suplantación o deepfake. Es el caveat más importante para cualquier uso en producción.
- Licencias de terceros no verificadas: el modelo base (OpenMOSS-Team/MOSS-Image-Base), el text encoder Qwen3.5-9B y el VAE FLUX.2 tienen licencias propias que no se detallan en la información disponible y que deben comprobarse antes de un uso comercial.
- Ausencia de benchmarks: no hay FID, CLIP score ni evaluación humana publicada. La calidad solo está respaldada por las imágenes de muestra del propio autor, lo que impide una comparación rigurosa.
- Sin validación independiente: 0 descargas y 15 likes en el momento de la consulta indican que el modelo es muy reciente y no ha pasado por una revisión de la comunidad.
- Idiomas: todos los ejemplos y la plantilla de prompt están en inglés. El comportamiento con prompts en castellano no está documentado, aunque el text encoder subyacente sea multilingüe; la respuesta en otros idiomas podría ser peor que en inglés.
- Riesgo de alucinación visual: al ser un modelo generativo, puede producir rasgos faciales inconsistentes entre imágenes de la misma persona, anatomía incorrecta o texto ilegible dentro de la imagen. El uso de un negative prompt fijo (`bad ugly blurry`) en todos los workflows sugiere que el autor mitiga artefactos por esta vía, pero no hay un análisis cuantitativo.
- Peso del repositorio: 28,1 GB en total, lo que complica su descarga y almacenamiento en entornos con cuota reducida.
- Uso del bf16 para entrenamiento: el autor recomienda mantener el fichero bf16 para finetuning, merging y extracción de LoRA; el INT8 ConvRot es solo para inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/malcolmrey/moss-serenity
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Herramienta de entrenamiento maltrainer: https://github.com/malcolmamal/maltrainer
- LoRA DMD turbo de 8 pasos (lodestones): https://huggingface.co/lodestones/MOSS-Image-Base-8-steps-dmd
- Text encoder Qwen3.5-9B en bf16 (Comfy-Org): https://huggingface.co/Comfy-Org/Qwen3.5/blob/main/text_encoders/qwen3.5_9b_bf16.safetensors
- Documentación de generación: `docs/generating.md` dentro del repositorio del modelo
- Documentación de entrenamiento: `docs/training.md` dentro del repositorio del modelo
- Workflows de ComfyUI: carpeta `workflow/` del repositorio (`base-turbo-no-lora.json`, `base-no-turbo-no-lora.json`, `base-turbo-lora.json`, `lora-extract-turbo-lora.json`)
- Muestras generadas: carpetas `samples/portraits`, `samples/scenes`, `samples/scenes-50steps`, `samples/pairs`, `samples/trios` y `samples/no-people`
- Paper, blog o demo oficial: no disponible en la información proporcionada
