# Nekodeus/neko-alpha5-tom-cruise

## Resumen

`Nekodeus/neko-alpha5-tom-cruise` es un adaptador LoRA de personaje para Stable Diffusion 1.5, publicado por el usuario Nekodeus dentro del conjunto "Hollywood Alpha SD1.5" (alpha1–alpha10) y del pack `Nekodeus/neko-hollywood-alpha-sd15-v1`. No es un modelo de lenguaje: es un ajuste fino de bajo rango (PEFT) que se aplica sobre un checkpoint SD 1.5 para generar imágenes fotorrealistas de un rostro concreto, activado mediante la cadena `alpha5` en el prompt.

El adaptador se entrenó con kohya_ss sd-scripts a 512 px durante 1500 pasos, con rango y alpha 8, learning rate 1e-4, Adam de 8 bits y xformers, sobre un conjunto de aproximadamente 85 imágenes filtradas. Su relevancia es acotada: se trata de un LoRA de personaje más, sin métricas publicadas, sin descargas ni validación comunitaria en el momento de la ficha (0 descargas, 0 likes).

El problema que resuelve es concreto: incorporar una identidad facial consistente a un pipeline de difusión ya existente sin reentrenar el modelo base. Para cualquier evaluador conviene tener claro que su utilidad práctica depende del checkpoint SD 1.5 con el que se combine, y que la licencia "other" sin texto adicional impide determinar las condiciones de uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Stable Diffusion 1.5: U-Net de difusión latente + text encoder CLIP congelados, con matrices de bajo rango inyectadas |
| Parametros totales | No disponible (el adaptador usa rango/alpha 8; no se publica el recuento exacto de parámetros del LoRA) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 77 tokens de prompt (límite del text encoder CLIP de SD 1.5); no se documenta otro límite |
| Tipos de cuantizacion | No disponible; el adaptador se aplica sobre el checkpoint base en fp16. No se publican versiones GGUF ni cuantizadas del LoRA |
| Idiomas soportados | No disponible; los ejemplos de prompt de la model card están en inglés |
| Licencia | other (sin texto de licencia especificado en la información disponible) |
| Formato de pesos | Adaptador LoRA en formato PEFT; contenedor de fichero no confirmado (la librería declarada es `peft`) |

## Arquitectura y entrenamiento

Se trata de un LoRA clásico sobre Stable Diffusion 1.5, no de un modelo completo. El checkpoint base (U-Net y text encoder CLIP) permanece congelado y el entrenamiento únicamente actualiza pares de matrices de bajo rango con dimensión 8 y alpha 8, lo que equivale a un factor de escala de 1.0. La resolución de entrenamiento es 512 px, con 1500 pasos totales, learning rate 1e-4, optimizador Adam de 8 bits y atención eficiente vía xformers, todo ello con kohya_ss sd-scripts.

El conjunto de datos declarado son aproximadamente 85 imágenes "filtradas" de un mismo personaje; la model card no detalla la composición (poses, iluminación, resolución original, proporción de primeros planos), ni si hubo aumento de datos, regularización con imágenes de clase o validación cruzada. No se menciona ningún tipo de alineamiento por preferencias (RLHF, DPO) —no aplica en un modelo text-to-image de este tipo— ni innovaciones técnicas adicionales más allá del pipeline estándar de kohya. El trigger definido por el autor es `a photo of alpha5 person`, con un peso de LoRA recomendado entre 0.8 y 1.0.

## Capacidades

- Generación de imágenes text-to-image de un rostro concreto dentro de un pipeline SD 1.5, condicionada por el token `alpha5`.
- Especialización en retrato y figura humana fotorrealista, según los ejemplos de la model card ("portrait, cinematic light", "in a leather jacket, night city").
- Composición con otros LoRA y con el checkpoint base: al ser un adaptador aditivo, puede mezclarse con LoRA de estilo, iluminación o vestuario.
- Compatibilidad declarada con A1111, Forge, ComfyUI y diffusers.
- Control de intensidad del efecto mediante el peso del LoRA (rango recomendado 0.8–1.0), lo que permite modular la fidelidad de la identidad.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta razonamiento multi-paso, agentes ni modo "thinking".
- Sin capacidades de visión de entrada, audio ni vídeo.
- Capacidad multilingüe de prompt: no documentada; los ejemplos están en inglés.

## Casos de uso

- Generación de retratos de personaje para prototipado: cargar el LoRA a peso 0.8 en ComfyUI o A1111 y usar el trigger `a photo of alpha5 person, portrait, cinematic light` para obtener variaciones de un mismo rostro en cuestión de segundos, útil para pruebas de concepto de vestuario o maquillaje.
- Storyboard y previsualización audiovisual: generar fotogramas coherentes de un mismo personaje entre planos para presentar una secuencia antes de rodar, apoyándose en el mismo token de identidad en cada prompt.
- Pruebas de pipelines de difusión: al ser un LoRA pequeño y de rango 8, sirve como caso de prueba reproducible para validar flujos de carga de adaptadores PEFT en diffusers o en servidores de inferencia.
- Ilustración editorial satírica o de ficción: combinado con LoRA de estilo, para generar imágenes de personaje en escenarios concretos descritos en el prompt (época, vestuario, localización).
- Base para ajustes derivados: el adaptador puede servir como punto de partida o referencia metodológica (rango 8, 1500 pasos, ~85 imágenes) para entrenar otros LoRA de personaje con kohya_ss.
- Contenido para maquetas de videojuego o apps de demostración: generación de avatares o retratos de relleno en entornos de prueba donde no se requiere una identidad real y se trabaja con datos sintéticos.
- Investigación sobre sesgos y estética en difusión: permite estudiar cómo un dataset pequeño de un solo rostro condiciona la diversidad de salidas (edad, género percibido, etnia, iluminación) del checkpoint base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye FID, CLIP score, similitud facial, ni comparaciones cuantitativas con otros LoRA de personaje. Tampoco se documentan tiempos de entrenamiento, curva de pérdida ni métricas de validación.

## Requisitos de hardware

- VRAM de inferencia: la dominante es la del checkpoint SD 1.5 base, no la del LoRA. A 512×512 en fp16 se puede operar en torno a 4 GB de VRAM, y por debajo de 4 GB con attention slicing o medias precisiones más agresivas (estimación orientativa para SD 1.5; el autor no publica mediciones).
- GPU recomendadas: cualquier GPU consumer con 6 GB o más (RTX 3060, RTX 4060, RTX 2070) es suficiente para 512×512; RTX 4090 o A100 no aportan ventaja de calidad, solo de throughput y de resolución efectiva vía upscale.
- Cabe en GPU consumer: sí, con holgura, al tratarse de un adaptador de rango 8 sobre un modelo de 860 M parámetros en el U-Net.
- Despliegue: A1111, Forge, ComfyUI y diffusers (carga vía `peft`); también es integrable en servidores de inferencia que acepten LoRA sobre SD 1.5. No se publican ficheros GGUF para llama.cpp ni equivalentes.
- Latencia y throughput: no disponibles. Como referencia genérica de SD 1.5 a 512×512 y 20–30 pasos, en GPU consumer moderna el orden de magnitud es de pocos segundos por imagen, pero no hay medición publicada para este adaptador concreto.
- Almacenamiento: el repositorio declara 0.0 GB de tamaño, lo que impide conocer el peso real del fichero del adaptador; los LoRA de rango 8 sobre SD 1.5 suelen ocupar del orden de decenas de MB.

## Comparativa con modelos similares

| Modelo | Base | Tipo | Contexto de prompt | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nekodeus/neko-alpha5-tom-cruise | Stable Diffusion 1.5 | LoRA de personaje, rango 8 | 77 tokens (CLIP) | other | Hugging Face, 0 descargas, 0 likes |
| Nekodeus/neko-golden5-sdxl-v1 | Stable Diffusion XL | LoRA de personaje (celebrities) | 77 tokens por encoder CLIP | openrail++ | Hugging Face |
| Tom_Cruise (SeaArt) | No disponible | Modelo de personaje alojado en SeaArt | No disponible | No disponible | Plataforma SeaArt (uso vía web) |

Frente a la variante SDXL del mismo autor, este LoRA parte de una base con menor resolución nativa (512 px frente a 1024 px de SDXL) y menor calidad de text encoder, pero requiere bastante menos VRAM y es compatible con el ecosistema SD 1.5, mucho más maduro en cuanto a LoRA de estilo y herramientas de edición. La licencia es además distinta: `other` aquí frente a `openrail++` en la versión SDXL. Los modelos de personaje de SeaArt no publican parámetros, contexto ni licencia, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Derechos de imagen: el adaptador reproduce la identidad de una persona real. Su uso comercial o la publicación de imágenes generadas puede infringir derechos de imagen o publicidad según la jurisdicción, con independencia de lo que diga la licencia del modelo.
- Licencia "other" sin texto: no se especifican condiciones de uso comercial, redistribución ni atribución. Antes de usarlo en producción hay que contactar con el autor o asumir que no está permitido.
- Dataset muy pequeño (~85 imágenes) y 1500 pasos: riesgo alto de sobreajuste, con repertorio limitado de poses, expresiones e iluminación, y posible arrastre de artefactos del conjunto original.
- Resolución nativa de 512 px: los detalles finos (manos, joyería, texto en la escena) se degradan con facilidad; requiere upscale posterior y retoque.
- Sensibilidad al peso del LoRA: por encima de 1.0 tiende a producir rigidez facial y "quemado" del estilo; por debajo de 0.7 la identidad se diluye.
- Dependencia del checkpoint base: los resultados varían de forma notable según el modelo SD 1.5 sobre el que se aplique; no hay validación publicada con bases concretas.
- Idiomas no documentados: no hay evidencia de que el trigger funcione igual con prompts en castellano; el texto de CLIP está mayoritariamente en inglés.
- Sin métricas ni validación comunitaria: 0 descargas y 0 likes en el momento de la ficha; no hay retroalimentación de terceros sobre calidad o estabilidad.
- Riesgo de alucinación en el sentido de invención visual: puede generar rasgos faciales inconsistentes entre imágenes cuando el prompt se aleja de los primeros planos vistos en entrenamiento.
- No apto para tareas de lenguaje, razonamiento, código o agentes: es exclusivamente un adaptador de generación de imágenes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nekodeus/neko-alpha5-tom-cruise
- Pack del autor: https://huggingface.co/Nekodeus/neko-hollywood-alpha-sd15-v1
- Variante SDXL del mismo autor: https://huggingface.co/Nekodeus/neko-golden5-sdxl-v1
- Modelo de personaje Tom_Cruise en SeaArt (referencia externa): https://www.seaart.ai/models/detail/4687bc185ee541369d04a8673edbfce9
- Otro modelo Tom_Cruise en SeaArt (referencia externa): https://www.seaart.ai/models/detail/4bd827925271315d68fc6f54a337f61b
