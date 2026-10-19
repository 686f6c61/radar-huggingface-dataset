# Nekodeus/neko-alpha6-keanu-reeves

## Resumen

`Nekodeus/neko-alpha6-keanu-reeves` es un LoRA de personaje para Stable Diffusion 1.5 que reproduce la fisonomía del actor Keanu Reeves. Lo publica el usuario Nekodeus dentro de un conjunto denominado Hollywood Alpha SD1.5 (alpha1–alpha10) y empaquetado en `Nekodeus/neko-hollywood-alpha-sd15-v1`. No es un modelo de lenguaje ni un modelo base: es un adaptador de bajo rango que se carga sobre un checkpoint SD1.5 preexistente y modifica la generación de imágenes guiadas por texto.

El adaptador se entrenó con kohya_ss sd-scripts a 512 px, 1500 pasos, dimensión y alpha de 8, tasa de aprendizaje 1e-4, optimizador Adam de 8 bits y xformers, sobre un conjunto de aproximadamente 72 imágenes filtradas. Su relevancia es acotada: se trata de un artefacto de nicho para generación de retratos y escenas con un rostro concreto, con soporte únicamente en inglés para los prompts y sin métricas publicadas.

El repositorio no incluye información sobre parámetros totales del adaptador, licencia efectiva más allá de la etiqueta `other`, ni idiomas soportados. A fecha de la ficha registra 0 descargas y 0 likes, por lo que no existe validación comunitaria del resultado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptación de bajo rango) sobre Stable Diffusion 1.5: UNet con bloques ResNet/atención, VAE y codificador de texto CLIP |
| Parametros totales | no disponible (el adaptador usa dim/alpha 8; no se declara el recuento de parámetros del LoRA. El modelo base SD1.5 tiene aproximadamente 983 M de parámetros en la UNet) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusión); resolución de entrenamiento 512×512 px |
| Tipos de cuantizacion | no disponible; se distribuye en el formato nativo de PEFT, sin variantes GGUF ni cuantizaciones publicadas |
| Idiomas soportados | no disponible; los ejemplos de prompt de la model card están en inglés |
| Licencia | other (licencia personalizada declarada en el repositorio, sin texto publicado en la información disponible) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, `library_name: peft`) |

## Arquitectura y entrenamiento

El modelo es un LoRA aplicado a Stable Diffusion 1.5, una arquitectura de difusión latente compuesta por una UNet, un VAE y un codificador de texto CLIP. El adaptador inyecta matrices de bajo rango en las capas del modelo base con dimensión y alpha de 8, un valor conservador que limita la capacidad de absorción de conceptos y reduce el riesgo de sobreajuste a costa de una menor fidelidad de identidad.

El entrenamiento se realizó con kohya_ss sd-scripts a 512 px durante 1500 pasos, con tasa de aprendizaje 1e-4, Adam de 8 bits y xformers, sobre un dataset de aproximadamente 72 imágenes filtradas. No se documenta composición del dataset, reparto de etiquetas, regularización mediante imágenes de clase, ni si hubo aumento de datos. Tampoco se especifican la técnica de muestreo, el tipo de scheduler ni el checkpoint base exacto (por ejemplo, SD1.5 original frente a una variante derivada), lo que afecta a la reproducibilidad y a la transferencia del adaptador entre pipelines. No se menciona el uso de RLHF, DPO ni preferencias humanas, algo por otra parte ajeno a los modelos de difusión de texto a imagen.

## Capacidades

- Generación de imágenes de texto a imagen sobre cualquier pipeline SD1.5, con el token de activación `alpha6` incluido en el prompt.
- Reproducción de rasgos faciales y de identidad del actor Keanu Reeves en retratos y planos medios, según los ejemplos de la model card ("portrait, moody light").
- Modificación de atributos controlables por prompt: longitud del pelo, tipo de prenda, iluminación y encuadre, con el ejemplo explícito de "long hair, black coat".
- Integración en A1111, Forge, ComfyUI y diffusers con pesos recomendados de 0.8 a 1.0.
- Composición con otros LoRA y con prompts negativos estándar de SD1.5, aunque esta combinación no está documentada ni validada por el autor.
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No dispone de visión, audio ni modo de razonamiento extendido: es exclusivamente un generador de imágenes.
- Capacidades multilingües no declaradas; los prompts de referencia están en inglés.

## Casos de uso

- Retratos de personaje para prototipado de arte conceptual: el LoRA se carga con peso 0.8 en ComfyUI y se itera sobre el prompt para obtener variaciones de encuadre e iluminación con una identidad consistente, útil en fases de exploración visual rápida.
- Creación de storyboards y viñetas para cortometrajes o demos: permite generar planos coherentes de un mismo personaje a 512 px, que después se reescalan o se retocan en un paso posterior.
- Pruebas de estilismo y vestuario virtual: combinando el token `alpha6` con descripciones de prendas ("black coat") se pueden comparar variantes de vestuario sobre un mismo rostro antes de producir arte final.
- Generación de avatares y material promocional para proyectos personales o mocks de producto, siempre que se resuelvan los derechos de imagen del actor.
- Docencia y divulgación sobre difusión latente: el adaptador sirve como ejemplo didáctico de LoRA con dim/alpha 8 y permite ilustrar el efecto del peso de adaptador (0.8 frente a 1.0) en la fidelidad y el sobreajuste.
- Investigación sobre personalización de modelos de difusión: con 72 imágenes y 1500 pasos constituye un punto de referencia pequeño para comparar estrategias de regularización, número de pasos y dimensiones de rango.
- Pruebas de regresión en pipelines de imagen: al ser un LoRA ligero y determinista dado un seed, se puede usar para verificar que una actualización de ComfyUI, diffusers o A1111 no altera el resultado de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas de fidelidad de identidad (por ejemplo, similitud facial con FaceNet o CLIP-I), ni comparaciones con otros LoRA de personaje, ni evaluaciones subjetivas con puntuaciones.

## Requisitos de hardware

- VRAM estimada para inferencia a 512 px con SD1.5 en fp16: en torno a 4 GB en el caso mínimo y 6-8 GB con resolución efectiva superior, según el pipeline y el uso de xformers o atención eficiente. Cifra orientativa, no publicada por el autor.
- GPU recomendadas: cualquier GPU consumer con 6 GB o más, como RTX 3060, RTX 4060 Ti o RTX 4070; en el extremo alto, RTX 4090 o A100/H100 para lotes grandes y generación masiva.
- Cabe en GPU de consumo: sí, siempre que se disponga de al menos 6 GB de VRAM para el modelo base SD1.5 más el adaptador.
- Despliegue: Stable Diffusion WebUI (A1111), Forge, ComfyUI, InvokeAI y diffusers con `PeftModel`. vLLM, llama.cpp, Ollama y TGI no aplican, al no tratarse de un modelo autorregresivo de texto.
- Latencia y throughput: no disponibles. Como referencia de orden de magnitud, SD1.5 a 512 px con 20-30 pasos en una RTX 4090 se sitúa en el rango de décimas de segundo a pocos segundos por imagen, pero no hay medición publicada para este adaptador.
- Entrenamiento: el autor no publica requisitos. El uso de 8-bit Adam y xformers sugiere que el entrenamiento original cupo en una GPU consumer de gama alta.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Contexto o resolucion | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nekodeus/neko-alpha6-keanu-reeves | LoRA de personaje | Stable Diffusion 1.5 | 512×512 px | no disponible | other | HuggingFace, 0 descargas |
| 90s Keanu Reeves LoRA (PixAI) | LoRA de personaje | Stable Diffusion (SD1.5) | 512×512 px | no disponible | no disponible | PixAI, con métricas de uso en la plataforma |
| Hell (Constantine 2005) - JuggernautXL (PixAI) | LoRA temático | SDXL | 1024×1024 px | no disponible | no disponible | PixAI |
| LoRA de personaje genérico SD1.5 | LoRA de personaje | Stable Diffusion 1.5 | 512×512 px | no disponible | variable | HuggingFace, Civitai |

La comparación cuantitativa no es posible: ninguno de los artefactos alternativos localizados publica métricas de fidelidad de identidad ni evaluaciones reproducibles. La diferencia principal frente a las alternativas en SDXL es la resolución nativa (512 frente a 1024 px) y el coste computacional asociado.

## Limitaciones y advertencias

- Derechos de imagen: el adaptador reproduce la fisonomía de una persona real. La generación y difusión de imágenes de una figura pública requiere revisar la normativa aplicable sobre derecho de imagen y publicidad, y el uso comercial puede estar restringido.
- Licencia ambigua: la etiqueta es `other` y el texto completo de la licencia no está disponible en la información consultada, por lo que no se puede confirmar el uso comercial.
- Dataset muy reducido: aproximadamente 72 imágenes y 1500 pasos con dim/alpha 8 implican riesgo de sobreajuste a las poses, encuadres e iluminaciones del conjunto de entrenamiento, con poca variedad en perfiles y planos complejos.
- Base limitada: SD1.5 tiene dificultades conocidas en manos, anatomía, texto en imagen y escenas con varias personas; el LoRA no corrige esas carencias.
- Riesgo de artefactos y alucinación visual: el adaptador puede imponer el rostro en composiciones donde no corresponde o degradar la coherencia cuando se combina con otros LoRA a pesos altos.
- Sensibilidad al peso del adaptador: por encima de 1.0 el autor no documenta comportamiento; es previsible un aumento del sobreajuste y de la rigidez de composición.
- Idiomas: no se declara soporte multilingüe y los prompts de referencia están en inglés; el comportamiento con prompts en castellano no está verificado.
- Sin validación comunitaria: 0 descargas y 0 likes, sin imágenes de muestra en el repositorio, lo que impide evaluar la calidad antes de descargar.
- Metadatos inconsistentes: la fecha de creación indicada (2026-10-18) y el tamaño de repositorio de 0.0 GB sugieren que los pesos pueden no estar efectivamente alojados o que los metadatos no son fiables; conviene verificar los archivos antes de integrarlo.
- Sesgos: al derivar de SD1.5, hereda los sesgos demográficos y estéticos del dataset original de difusión, atenuados o reforzados por las 72 imágenes del entrenamiento.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Nekodeus/neko-alpha6-keanu-reeves
- Pack declarado por el autor: https://huggingface.co/Nekodeus/neko-hollywood-alpha-sd15-v1
- PromptHero, modelos de Keanu Reeves (referencia de alternativas): https://prompthero.com/ai-models/keanu-reeves-download
- PixAI, etiqueta Keanu Reeves con LoRA de SD y SDXL: https://pixai.art/en/tags/model/keanu_reeves
- Meshy, modelo 3D de Keanu Reeves (no relacionado, resultado de búsqueda): https://www.meshy.ai/3d-models/keanu-reeves-01a0986e-b0b0-76d1-aaa2-2347d053891e
- Cults3D, modelo STL de Keanu Reeves (no relacionado, resultado de búsqueda): https://cults3d.com/en/3d-model/art/keanu-reeves
- TurboSquid, modelos 3D riggeados (no relacionado, resultado de búsqueda): https://www.turbosquid.com/3d-model/rigged/keanu-reeves
