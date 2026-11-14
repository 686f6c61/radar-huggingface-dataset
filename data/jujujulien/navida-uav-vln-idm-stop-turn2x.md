# jujujulien/navida-uav-vln-idm-stop-turn2x

## Resumen

NAVIDA UAV VLN IDM (stop/turn 2x) es un ajuste fino de Qwen2.5-VL-3B-Instruct orientado a navegacion visual de vehiculos aereos no tripulados (UAV) y a modelado de dinamica inversa (IDM, inverse dynamics model). Lo publica el usuario jujujulien en Hugging Face y parte del modelo base de Alibaba Cloud, Qwen2.5-VL-3B-Instruct, un transformer vision-language de 3.000 millones de parametros. El checkpoint publicado corresponde al paso 17.000 de entrenamiento, con una perdida de validacion registrada de 0,0200288072.

El modelo resuelve dos tareas complementarias: por un lado, la navegacion guiada por lenguaje e imagen (vision-language navigation, VLN), en la que el modelo recibe instrucciones en lenguaje natural e imagenes del entorno para producir comandos de accion del dron; por otro, la prediccion de acciones a partir de secuencias de imagenes (IDM), donde cada etiqueta de accion se alinea con el ultimo fotograma de su segmento de accion. La mezcla de entrenamiento sobremuestrea 2x los ejemplos relacionados con parada y giro (stop/turn), lo que indica un enfasis deliberado en maniobras criticas de control.

Su relevancia actual es acotada pero especifica: se trata de un modelo pequeno (4.065.787.904 parametros reales en safetensors, incluyendo el encoder visual) que puede desplegarse en hardware modesto y que aborda un nicho poco cubierto por los modelos generalistas, como es la salida de acciones de control para UAV a partir de percepcion visual. La licencia Qwen Research impone restricciones no comerciales, lo que limita su uso en produccion comercial sin acuerdo adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (Qwen2.5-VL), ajuste fino supervisado |
| Parametros totales | 4.065.787.904 (safetensors, incluye encoder visual) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponibles |
| Licencia | qwen-research (Qwen Research License, con restriccion no comercial) |
| Formato de pesos | safetensors (2 shards, repo de 8,1 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-VL-3B-Instruct: un transformer multimodal que combina un encoder visual con un modelo de lenguaje, capaz de procesar entradas de imagen y texto y generar texto. Sobre esa base se aplica un ajuste fino supervisado con una mezcla de datos especifica de UAV: ejemplos de navegacion visual con salida de acciones y ejemplos de dinamica inversa en los que se predice la accion a partir de una secuencia de imagenes, alineando cada etiqueta con el ultimo fotograma del segmento de accion correspondiente.

El detalle de entrenamiento disponible es limitado. Se sabe que los ejemplos de parada y giro se sobremuestrearon 2x, que el checkpoint publicado es el paso 17.000 y que su perdida de validacion es 0,0200288072; en el paso 17.500 se observo una perdida ligeramente inferior (0,0200193580), pero no se guardo checkpoint en ese paso. No se especifican el numero total de tokens de entrenamiento, la composicion completa del dataset, ni si se aplicaron tecnicas de RLHF o DPO. El repositorio contiene pesos, configuracion, tokenizer, procesador de imagen y plantilla de chat, pero no datos de entrenamiento, estado del optimizador ni checkpoints intermedios.

## Capacidades

- Generacion de texto multimodal a partir de imagenes e instrucciones en lenguaje natural (pipeline image-text-to-text).
- Navegacion visual guiada por lenguaje para UAV: interpretacion de instrucciones y emision de comandos de accion.
- Modelado de dinamica inversa: prediccion de acciones a partir de secuencias de imagenes, con etiquetas alineadas al ultimo fotograma del segmento.
- Enfasis reforzado en maniobras de parada y giro gracias al sobremuestreo 2x de esos ejemplos.
- Conversacion multi-turno (tag `conversational` heredado del modelo base).
- Compatibilidad con text-generation-inference y endpoints compatibles.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision adicional o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Navegacion autonoma de UAV en interiores: el modelo recibe imagenes de la camara del dron e instrucciones como "avanza hasta la puerta y gira a la derecha", y emite la accion correspondiente; el sobremuestreo de giros y paradas lo hace especialmente adecuado para maniobras de correccion de rumbo.
- Aprendizaje por imitacion con datos de video: al funcionar como IDM, permite etiquetar secuencias de vuelo grabadas con las acciones que las produjeron, generando datasets de entrenamiento para politicas de control sin necesidad de telemetria sincronizada manualmente.
- Validacion de politicas de control en simulacion: el modelo puede actuar como critico o modelo de referencia que predice la accion esperada ante un fotograma, comparandola con la accion de la politica evaluada para detectar desviaciones.
- Sistemas de asistencia a pilotos remotos: dado que el modelo es pequeno (4.065 millones de parametros), puede desplegarse en estaciones de tierra con GPU de consumo para sugerir maniobras de parada o giro en tiempo casi real.
- Investigacion en VLN (vision-language navigation): como checkpoint de referencia para experimentos academicos sobre navegacion guiada por lenguaje, con la ventaja de una licencia de investigacion y un tamano manejable.
- Prototipado rapido de interfaces imagen-texto para robotica aerea: gracias a la compatibilidad con text-generation-inference y endpoints estandar, puede integrarse en pipelines de inferencia existentes sin adaptadores propietarios.
- Generacion de datos sinteticos de entrenamiento: el modelo puede producir descripciones de acciones a partir de fotogramas para aumentar datasets de navegacion, aunque con las cautelas de alucinacion propias de un modelo de 3B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo de rendimiento es la perdida de validacion del checkpoint publicado (paso 17.000): 0,0200288072. En el paso 17.500 se registro 0,0200193580, pero no se guardo checkpoint en ese paso.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16/FP16): aproximadamente 8-9 GB solo para pesos, mas memoria para el encoder visual, cache KV y activaciones; en la practica, 12-16 GB para secuencias cortas.
- Cuantizacion a 8 bits: alrededor de 4-5 GB de pesos; a 4 bits: alrededor de 2,5-3 GB. Los tipos de cuantizacion concretos soportados no estan documentados en la informacion proporcionada.
- GPU recomendadas: A100 o H100 para despliegue con concurrencia y contextos largos; RTX 4090 (24 GB) para inferencia comoda en BF16; RTX 3090 (24 GB) equivalente.
- GPU de consumo: cabe en RTX 4080/4070 Ti (16 GB) en BF16 con margen ajustado, y en tarjetas de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`). Soporte de vLLM, llama.cpp u Ollama no confirmado en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NAVIDA UAV VLN IDM (stop/turn 2x) | 4.065.787.904 (safetensors) | no disponible | VLN + IDM para UAV | qwen-research (no comercial) | Hugging Face, 2 descargas |
| Qwen2.5-VL-3B-Instruct (base) | ~3.000 millones | no disponible en esta ficha | Vision-language generalista | qwen-research | Hugging Face, ampliamente usado |
| Alternativas especificas de VLN para UAV | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion relevante es con el modelo base: NAVIDA anade especializacion en acciones de UAV y en prediccion de dinamica inversa a costa de perder generalidad y de heredar la restriccion no comercial de la licencia Qwen Research. No se dispone de datos de benchmarks que permitan comparar su rendimiento con otras alternativas de la misma categoria.

## Limitaciones y advertencias

- Licencia Qwen Research con restriccion no comercial: el uso y la redistribucion estan sujetos a los terminos de la licencia del modelo base; no se permite uso comercial sin autorizacion adicional.
- Modelo de nicho con muy poca adopcion: 2 descargas y 0 likes en el momento de la consulta, sin validacion externa conocida.
- Riesgo de alucinacion inherente a un modelo de 3.000 millones de parametros, especialmente al generar acciones o descripciones fuera de la distribucion de entrenamiento.
- Sesgos conocidos: no documentados en la informacion proporcionada; al derivar de Qwen2.5-VL, puede heredar sesgos del modelo base.
- Idiomas soportados no documentados; el ajuste fino se realizo presumiblemente sobre instrucciones en un idioma no especificado, lo que puede degradar el rendimiento en castellano.
- Longitud de contexto no documentada; no se debe asumir la ventana del modelo base sin verificacion.
- Datos de entrenamiento no publicados: no es posible auditar la composicion del dataset ni el equilibrio de clases mas alla del sobremuestreo 2x de stop/turn.
- Perdida de validacion muy baja (0,02) que puede indicar sobreajuste al conjunto de validacion o una tarea de prediccion muy restringida; conviene validar en entornos reales antes de cualquier despliegue.
- El checkpoint publicado no es el de menor perdida de validacion observada (paso 17.500), sino el ultimo guardado (paso 17.000).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jujujulien/navida-uav-vln-idm-stop-turn2x
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Licencia del modelo base (Qwen Research License): https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct/blob/main/LICENSE
- Repositorio Qwen2.5-VL: https://github.com/QwenLM/Qwen2.5-VL
- Paper tecnico de Qwen2.5-VL: https://arxiv.org/abs/2502.13923
