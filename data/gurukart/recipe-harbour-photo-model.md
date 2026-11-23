# Gurukart/recipe-harbour-photo-model

## Resumen

Recipe Harbour photo recogniser es un modelo de clasificacion de imagenes especializado en reconocer un unico ingrediente fresco (fruta, verdura o hierba) por fotografia. Lo desarrolla Gurukart como componente del proyecto de codigo abierto Recipe Harbour, y se distribuye en formato ONNX para ejecutarse integramente en el navegador mediante ONNX Runtime Web, de modo que las imagenes no abandonan el dispositivo del usuario. Sustituye a un modelo anterior basado en MobileNetV2 (R6) que cubria 24 clases y no reconocia ingredientes basicos como la cebolla o el ajo.

Tecnicamente no es un modelo entrenado desde cero: parte del codificador de imagen de Google SigLIP 2 base con patch 32 y resolucion 256x256 (`google/siglip2-base-patch32-256`, licencia Apache 2.0), al que se anade una cabeza de clasificacion de ingredientes afinada sobre fotografias reales. El espacio de salida cubre 74 ingredientes, cada uno representado por varios nombres alternativos, y la prediccion se obtiene por similitud entre el vector de la imagen y los vectores de texto de esos nombres.

Su relevancia practica esta en el nicho: inferencia local en navegador con un paquete de 66,5 MB, precision del 76 % en primera opcion y 91 % en top-3 sobre el conjunto de test de recortes, y un 94 % de acierto cuando la aplicacion muestra la sugerencia con confianza igual o superior al 60 %. Es una utilidad de conveniencia para anadir ingredientes a una receta, no una herramienta de seguridad alimentaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-texto (SigLIP 2 base, patch 32, 256x256) con cabeza de clasificacion de ingredientes; solo se distribuye la mitad de imagen |
| Parametros totales | No disponible (la mitad de imagen del modelo base tiene 94,6 M de parametros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision, sin contexto textual) |
| Tipos de cuantizacion | Matrices en 4 bits con bloques de 32; pesos grandes restantes en 16 bits (version q4h). Existen variantes fp32, int8, q4 y q4b128h |
| Idiomas soportados | No disponible (los nombres de ingredientes de la cabeza estan en ingles) |
| Licencia | other: apache-2.0-and-cc-by-sa-4.0 (Apache 2.0 del modelo base y CC BY-SA 4.0 de los datos Fruits-360) |
| Formato de pesos | ONNX (ejecutable con onnxruntime / ONNX Runtime Web) |

## Arquitectura y entrenamiento

El modelo reutiliza el codificador de imagen de SigLIP 2 base con patch 32, que divide la imagen de 256x256 en 64 parches (frente a los 196 parches de la variante patch 16), lo que reduce aproximadamente a un tercio el coste de computo por foto, un factor determinante en dispositivos moviles. Sobre ese codificador se construye una cabeza de ingredientes cuyos pesos se inicializan a partir de los vectores de texto de los nombres de cada ingrediente, generados por la misma familia de modelos, y despues se afinan sobre fotografias reales con una penalizacion que mantiene la cabeza proxima a la representacion textual (fuerza 0,3, 30 pasadas, hiperparametros elegidos sobre fotos de entrenamiento reservadas). La puntuacion de un ingrediente es la de su mejor nombre coincidente, y un softmax la convierte en los porcentajes que muestra la aplicacion. Los ingredientes sin fotos de entrenamiento siguen funcionando a partir de sus nombres.

Los datos de entrenamiento combinan recortes de cajas de Open Images V7 (hasta 150 por ingrediente), 8.372 fotos completas de Open Images V7 con etiqueta de producto verificada por humanos (con un 15 % reservado para ajustar hiperparametros) y fotos de laboratorio de Fruits-360. Solo se emplean fotos cuyo metadato declara CC BY 2.0 y que no estan rotadas, con atribucion individual de cada autor. El conjunto de test usa recortes de cajas de Open Images V7 (2.205) y fotos completas de test y validacion (1.142), provenientes de particiones distintas, sin solapamiento con entrenamiento. No se documenta uso de RLHF ni DPO, al tratarse de una tarea de clasificacion supervisada.

## Capacidades

- Clasificacion de imagenes de un unico ingrediente fresco entre 74 clases de frutas, verduras y hierbas, con probabilidad asociada.
- Reconocimiento basado en similitud imagen-texto, lo que permite incorporar ingredientes sin fotos de entrenamiento a partir de sus nombres.
- Ejecucion local en navegador con ONNX Runtime Web; las imagenes no se envian a ningun servidor.
- Agrupacion de sinonimos y variantes: un mismo ingrediente se cubre con varios nombres (por ejemplo, "radish" cubre tambien turnip y parsnip).
- Normalizacion de clases ambiguas: la cebolla roja y la chalota se responden como "onion", ya que el modelo no las distingue de forma fiable.
- Sugerencia condicionada por umbral: la aplicacion solo muestra "Looks like X" cuando la probabilidad es al menos 60 % y el ingrediente esta en la lista de ingredientes ofrecidos.
- No soporta tool calling, agentes, razonamiento multi-paso, vision general, audio ni generacion de texto.

## Casos de uso

- Anadir ingredientes a una receta desde el movil: el usuario fotografia un producto y la aplicacion sugiere el ingrediente con su probabilidad, sin subir la imagen a ningun servidor gracias a la inferencia ONNX en el navegador.
- Aplicacion web de gestion de despensa: integracion del modelo en una PWA para registrar productos frescos por foto, con un paquete de 66,5 MB que se descarga una sola vez y queda en cache.
- Etiquetado asistido de fotografias de alimentos: uso del clasificador como primer paso para preetiquetar lotes de imagenes de productos frescos antes de una revision humana, apoyandose en el 91 % de acierto en top-3.
- Filtrado de imagenes en un recetario colaborativo: verificacion automatica de que la foto subida corresponde a un ingrediente fresco reconocible y propuesta de la etiqueta mas probable.
- Educacion y reconocimiento botanico basico: aplicacion divulgativa que identifica frutas, verduras y hierbas y muestra su nombre a partir de una foto, con la salvaguarda de que el modelo no es una herramienta de seguridad alimentaria.
- Demostracion de inferencia en el borde: caso de referencia para desarrolladores que quieran evaluar SigLIP 2 cuantizado a 4 bits en navegador, con metricas publicadas de precision frente a tamano para distintas cuantizaciones.
- Preprocesado en asistentes de cocina conversacionales: el clasificador aporta la etiqueta del ingrediente y el sistema conversacional se encarga del resto del flujo, dado que este modelo no genera texto.

## Benchmarks y rendimiento

Resultados publicados en la model card. "Recortes" se refiere a 2.205 recortes de cajas de test; "completas" a 1.142 fotos completas de test y validacion.

| Modelo | Recortes, primera opcion | Completas, primera opcion | Completas, top-3 |
|---|---|---|---|
| TinyCLIP ViT-8M/16 (zero-shot) | 42 % | 49 % | 71 % |
| TinyCLIP ViT-40M/32 (zero-shot) | 58 % | 65 % | 82 % |
| TinyCLIP ViT-39M/16 (zero-shot) | 62 % | 68 % | 85 % |
| TinyCLIP ViT-61M/32 (zero-shot) | 62 % | 68 % | 84 % |
| CLIP ViT-B/32 (zero-shot) | 59 % | 67 % | 85 % |
| CLIP ViT-B/32 LAION-2B (zero-shot) | 63 % | 70 % | 85 % |
| SigLIP 2 base patch 16 (zero-shot) | 73 % | 78 % | 91 % |
| SigLIP 2 base patch 32 (zero-shot, elegido) | 73 % | 76 % | No disponible |
| TinyCLIP ViT-39M/16 con cabeza entrenada | 72 % / 88 % | 73 % / 89 % | — |
| SigLIP 2 base patch 32 con cabeza entrenada (fp32) | 79 % / 94 % | 80 % / 93 % | — |
| Modelo distribuido q4h | 76 % / 91 % | 78 % / 91 % | — |

Precision por version del modelo elegido (primera opcion / top-3):

| Version | Tamano | Recortes | Completas | Coincidencia con fp32 (completas) |
|---|---|---|---|---|
| fp32 | 378,5 MB | 77 % / 92 % | 79 % / 92 % | 100 % |
| int8 | 101,2 MB | 45 % / 65 % | 45 % / 63 % | 48 % |
| q4 | 75,9 MB | 76 % / 91 % | 78 % / 91 % | 91 % |
| q4h (distribuido) | 66,5 MB | 76 % / 91 % | 78 % / 91 % | 91 % |
| q4b128h | 58,1 MB | 71 % / 88 % | 76 % / 90 % | 86 % |

Cuando la aplicacion muestra "Looks like X" (probabilidad igual o superior al 60 % y clase ofrecida), el acierto es del 94 % sobre 1.985 respuestas de test. El modelo R6 anterior obtenia 74 % / 90 % en recortes sobre 24 clases.

## Requisitos de hardware

- Inferencia en navegador: el paquete distribuido ocupa 66,5 MB (matrices en 4 bits) mas 232 kB de la cabeza de ingredientes; no requiere GPU dedicada, funciona con WebAssembly y aceleracion WebGPU si esta disponible.
- VRAM estimada: no disponible de forma explicita; por tamano de pesos, la version q4h ronda decenas de MB en memoria, la fp32 (378,5 MB) requiere aproximadamente 0,4 GB.
- GPU recomendadas: no aplica para el caso de uso previsto (navegador). Para servir el modelo en servidor con ONNX Runtime, cualquier GPU con al menos 1 GB de memoria es suficiente dada la cuantizacion.
- Cabe en cualquier GPU de consumo e incluso en CPU; el cuello de botella es el coste por foto (64 parches frente a 196 de la variante patch 16).
- Opciones de despliegue: ONNX Runtime Web (previsto), ONNX Runtime en servidor, y conversion a otros runtimes ONNX compatibles. No se distribuyen pesos en safetensors ni GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card solo justifica la eleccion de patch 32 por necesitar aproximadamente un tercio del computo de patch 16 en movil.

## Comparativa con modelos similares

| Modelo | Parametros (mitad imagen) | Clases | Recortes primera opcion | Licencia | Formato |
|---|---|---|---|---|---|
| Recipe Harbour (SigLIP 2 patch 32 + cabeza, q4h) | 94,6 M (base) | 74 ingredientes | 76 % | Apache 2.0 + CC BY-SA 4.0 | ONNX |
| SigLIP 2 base patch 32 zero-shot | 94,6 M | Vocabulario abierto | 73 % | Apache 2.0 | Safetensors / ONNX |
| SigLIP 2 base patch 16 zero-shot | 92,9 M | Vocabulario abierto | 73 % | Apache 2.0 | Safetensors / ONNX |
| CLIP ViT-B/32 | 87,5 M | Vocabulario abierto | 59 % | MIT | Safetensors / ONNX |
| TinyCLIP ViT-39M/16 con cabeza entrenada | 38,3 M | 74 ingredientes | 72 % | MIT | No disponible |
| MobileNetV2 (R6, modelo anterior) | No disponible | 24 clases | 74 % | No disponible | No disponible |

La ventaja frente a los modelos zero-shot es el afinado de la cabeza sobre fotos reales (79 % frente a 73 % en recortes con fp32). Frente a TinyCLIP, el modelo elegido es aproximadamente el doble de grande pero claramente mas preciso. La cuantizacion int8 degrada gravemente el rendimiento (45 %), mientras que 4 bits mantiene casi toda la precision.

## Limitaciones y advertencias

- Reconoce un unico ingrediente por foto; no esta disenado para escenas con varios productos ni para platos cocinados.
- No distingue cebolla roja de chalota: ambas se responden como "onion".
- La precision publicada es un limite inferior para fotos de movil en primer plano de un solo producto; las fotos completas de test suelen incluir otros objetos y algunas etiquetas son discutibles.
- La cuantizacion int8 rompe el modelo (45 % de acierto); debe usarse q4h o superior.
- Los ingredientes no ofrecidos nunca se sugieren y la aplicacion pide escribirlos manualmente; el umbral de 60 % condiciona cuando se muestra la sugerencia.
- Los nombres de ingredientes de la cabeza estan en ingles; no se documenta soporte multilingue.
- No es una herramienta de seguridad alimentaria: no debe usarse para identificar plantas toxicas, setas ni productos no aptos para el consumo.
- Licencia compuesta (Apache 2.0 y CC BY-SA 4.0) con condiciones especificas en el fichero LICENSE del repositorio; conviene revisarlas antes de uso comercial. Los datos de Open Images exigen atribucion a los autores recogidos en OPEN_IMAGES_CREDITS.csv.
- Riesgo de alucinacion presente en la forma de asignar siempre una clase del vocabulario con una probabilidad, incluso ante imagenes que no corresponden a ningun ingrediente.
- El repositorio registra 0 descargas y 0 likes, y la model card indica que el contenido se genera automaticamente; no hay validacion externa independiente de las metricas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Gurukart/recipe-harbour-photo-model
- Repositorio del proyecto: https://github.com/kart5137/Recipe-Harbour
- Licencia: https://github.com/kart5137/Recipe-Harbour/blob/main/web/public/model/LICENSE.txt
- Atribuciones de Open Images: https://github.com/kart5137/Recipe-Harbour/blob/main/model/OPEN_IMAGES_CREDITS.csv
- Modelo base: https://huggingface.co/google/siglip2-base-patch32-256
