# PAIR/FameVTON

## Resumen

FameVTON es un modelo de prueba virtual (virtual try-on) desarrollado por PAIR (Picsart AI Research) que sintetiza una imagen fotorrealista de una persona vistiendo una prenda de referencia. A diferencia de los enfoques clasicos de try-on, no requiere mascara de segmentacion, estimacion de pose, parser humano ni prompt de texto: recibe directamente la imagen de la persona y la imagen de la prenda, y genera el resultado preservando identidad, pose, forma corporal, fondo y atributos personales como manos, cabello o joyas.

El modelo se presenta en el articulo "FameVTON: Fine-Detail Adaptation for Mask-Free Editing in Virtual Try-On", aceptado en WACV 2027, y esta construido como un fine-tuning de FLUX.2 [klein] base 4B (Apache-2.0) mediante flow matching. El repositorio ocupa 6,5 GB y se distribuye con la libreria propia `famevton` y un pipeline `FameVTONPipeline` de uso directo.

Es relevante ahora porque aborda uno de los cuellos de botella practicos del try-on en produccion: la dependencia de pipelines auxiliares fragiles (deteccion de pose, segmentacion, inpainting con mascaras). Al eliminar esas etapas, reduce la complejidad del sistema y los modos de fallo, y se apoya en un modelo base generativo moderno de 4B parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion basado en FLUX.2 [klein] base 4B, entrenado con flow matching (image-to-image) |
| Parametros totales | 4B (heredados del modelo base FLUX.2 [klein] base 4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de imagen; no aplica contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no se especifican; no requiere prompt de texto) |
| Licencia | Picsart Inc. FameVTON Model License 1.0 (`picsart-inc-famevton-model-1.0`) |
| Formato de pesos | no disponible (repo de 6,5 GB; presumiblemente safetensors, sin confirmar) |

## Arquitectura y entrenamiento

FameVTON es un fine-tuning del modelo base FLUX.2 [klein] base 4B, un modelo generativo de difusion de 4B parametros, entrenado con flow matching y planteado como tarea image-to-image: la entrada son dos imagenes (persona y prenda) y la salida es la imagen de try-on. El diseno es "mask-free": no se emplean mascaras de prenda ni de region corporal, ni estimacion de pose, ni parser humano, ni prompt de texto en la inferencia.

El entrenamiento se realizo sobre el dataset VITON-HD, segun declara la model card. El objetivo declarado es la "fine-detail adaptation": reproducir con fidelidad texturas, patrones y logotipos de la prenda mientras se conservan la identidad de la persona, su pose, forma corporal, fondo y atributos personales (manos, cabello, joyas). No se especifican en la informacion disponible el numero de tokens/pasos de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF/DPO (no aplicables de forma estandar en generacion de imagen).

## Capacidades

- Generacion de imagen de prueba virtual a partir de una imagen de persona y una imagen de prenda.
- Edicion sin mascara: no requiere segmentacion, pose estimation ni human parsing.
- Sin prompt de texto: la condicion es puramente visual (persona + prenda).
- Reproduccion de detalles finos de la prenda: texturas, patrones y logotipos.
- Preservacion de identidad, pose, forma corporal y fondo de la persona original.
- Preservacion de atributos personales: manos, cabello y joyas.
- Pipeline de inferencia propio (`FameVTONPipeline`) con API de dos imagenes y salida PIL.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no procesa texto).
- Capacidades especiales (vision, audio, thinking mode): no disponible mas alla de la entrada de imagen descrita.

## Casos de uso

- Probador virtual en e-commerce de moda: el modelo recibe la foto del cliente y la ficha de producto de la prenda y devuelve una previsualizacion del look. La ausencia de mascara y de pose estimation simplifica la integracion en el backend, ya que basta con dos imagenes.
- Generacion de catalogos y fichas de producto: a partir de una unica foto de modelo y las imagenes de las prendas de una coleccion, se generan variantes de look sin repetir sesiones fotograficas, manteniendo el fondo y la identidad del modelo.
- Personal shopper y recomendacion visual: mostrar al usuario como le quedaria una prenda concreta antes de comprar, conservando su pose y sus atributos (cabello, joyas) para que el resultado sea creible.
- Marketing y redes sociales: produccion de imagenes de estilo de vida con prendas de marca, preservando logotipos y patrones con fidelidad, algo critico para la coherencia de marca.
- Pruebas A/B de creatividades: generar multiples combinaciones persona-prenda de forma automatizada para evaluar rendimiento de anuncios, aprovechando que no se necesita prompt ni anotacion manual.
- Integracion en apps moviles de moda: el pipeline de dos imagenes encaja en un flujo de subida de foto y seleccion de prenda, sin pasos intermedios de edicion por parte del usuario.
- Investigacion en edicion de imagen condicionada: servir como baseline mask-free para comparar con metodos clasicos de try-on que dependen de pose y segmentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia, un modelo de difusion de 4B parametros en precision completa requiere del orden de 8-10 GB solo para pesos, mas el coste de activaciones y del codificador de imagenes; en fp16/bf16 es esperable moverse en la franja de 12-16 GB, aunque esta cifra no esta confirmada por el autor.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano del modelo base, GPU de datacenter tipo A100 o H100 son adecuadas; GPUs de consumo con 16 GB o mas podrian ser suficientes en bf16, sin confirmacion oficial.
- Cabe en consumer GPU: no confirmado. El repo pesa 6,5 GB, lo que sugiere pesos en bf16 y viabilidad en GPUs de consumo de gama alta con VRAM suficiente, pero no hay dato oficial.
- Opciones de despliegue: el autor documenta el uso mediante la libreria `famevton` y `FameVTONPipeline.from_pretrained(..., device="cuda")`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusion de imagen); no se indica compatibilidad con Diffusers.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Requiere mascara/pose | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FameVTON | 4B (base FLUX.2 klein) | Flow matching, mask-free, image-to-image | No | Picsart FameVTON 1.0 | Hugging Face + GitHub |
| Metodos clasicos de try-on sobre VITON-HD | no disponible | Inpainting condicionado con mascara y pose | Si | variable | variable |
| FLUX.2 [klein] base 4B (modelo base) | 4B | Difusion generica image-to-image/text-to-image | No aplica | Apache-2.0 | Hugging Face |

No se dispone en la informacion proporcionada de resultados numericos de FameVTON frente a alternativas, por lo que la comparacion cuantitativa de rendimiento no esta disponible.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones cuantitativas en la informacion disponible; el rendimiento real frente a metodos clasicos de try-on no esta verificado de forma independiente.
- Riesgo de artefactos en prendas muy complejas o en poses atipicas: aunque el modelo declara preservar detalles finos, no hay datos que cuantifiquen la tasa de fallo.
- Riesgo de alucinacion visual: como modelo generativo, puede inventar texturas, pliegues o detalles no presentes en la prenda de referencia.
- Sesgos: el entrenamiento se realizo sobre VITON-HD, un dataset con distribucion demografica y de estilos limitada; es esperable un sesgo hacia ese dominio (tipologias de prenda, cuerpos y condiciones de iluminacion), aunque el autor no lo documenta explicitamente.
- Limitaciones de idioma: no aplica, el modelo no procesa texto; no se especifican idiomas.
- Licencia: la Picsart Inc. FameVTON Model License 1.0 es una licencia "other", distinta de la Apache-2.0 del modelo base. Es imprescindible revisar el fichero LICENSE y el NOTICE antes de cualquier uso comercial; no se detallan en la informacion disponible las restricciones concretas.
- Al derivar de FLUX.2 [klein] base 4B (Apache-2.0), pueden aplicar obligaciones adicionales de atribucion recogidas en el NOTICE.
- Uso en produccion: al ser un modelo recien publicado (creado en noviembre de 2026) con 0 descargas y 0 likes, no hay evidencia de comunidad ni de robustez en entornos reales.
- No se documentan requisitos de hardware ni cuantizaciones soportadas, lo que dificulta planificar el despliegue sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PAIR/FameVTON
- Codigo: https://github.com/Picsart-AI-Research/FameVTON
- Pagina del proyecto: https://famevton.github.io/
- Licencia: https://huggingface.co/PAIR/FameVTON/raw/main/LICENSE
- NOTICE: https://huggingface.co/PAIR/FameVTON/raw/main/NOTICE
- Modelo base FLUX.2 [klein] base 4B: https://huggingface.co/black-forest-labs/FLUX.2-klein-base-4B
