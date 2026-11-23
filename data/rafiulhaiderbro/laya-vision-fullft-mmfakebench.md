# RafiulHaiderbro/laya-vision-fullft-mmfakebench

## Resumen

LAYAVision fullfine-tune MMFakeBench es un ajuste fino del modelo multimodal thaitea/laya-vision, publicado por el usuario RafiulHaiderbro en Hugging Face. El modelo base es un transformer multimodal de tipo vision-lenguaje de aproximadamente 201 millones de parametros, y este fine-tune lo especializa en la deteccion de desinformacion multimodal, concretamente en la tarea de determinar si un par imagen-texto es coherente o ha sido manipulado (out-of-context image-text matching), evaluada sobre el conjunto MMFakeBench.

El ajuste se selecciono como ganador de una cuadricula de 12 ejecuciones que combinaba variantes de entrenamiento completo y LoRA, funciones de perdida (rlcd frente a soft_ce) y numero de pasos (245, 490 y 735). La variante ganadora fue entrenamiento completo con soft_ce y 735 pasos, con un macro-F1 de 0,7389 en el split de ajuste. En el split de test, medido una sola vez tras la seleccion, el modelo mejora el macro-F1 en +0,3983 respecto al baseline preentrenado (IC del 95 % [+0,3853, +0,4108], n=9999).

Es relevante por su caracter de experimento reproducible y transparente: el autor documenta la seleccion sobre un split de ajuste, la calibracion de temperaturas en un split reservado y una enmienda de diseno que reconoce que la torre de vision permanece congelada en ambas ramas. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su tamano es de 0,8 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-lenguaje (modelo base thaitea/laya-vision) |
| Parametros totales | 201.161.350 |
| Parametros activos | no disponible (no es MoE) |
| Parametros entrenados en este fine-tune | 114,7 M de 201 M (encoder LM + cabeza; torre de vision congelada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Revision del modelo base | f2fe3c12cb6d04c59d8a190250bf3fb40fc828dc |
| Tamano del repositorio | 0,8 GB |
| Tarea | Clasificacion imagen-texto (deteccion de desinformacion multimodal) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base thaitea/laya-vision, un transformer multimodal que combina una torre de vision con un encoder de lenguaje y una cabeza de clasificacion. En este fine-tune, la torre de vision se mantiene congelada en ambas ramas de entrenamiento, tal como reconoce el autor en una enmienda de diseno del 22 de noviembre de 2026: el bucle de entrenamiento de la libreria no permite descongelarla. Por tanto, la rama de entrenamiento completo ajusta el encoder de lenguaje y la cabeza, lo que supone 114,7 millones de parametros de los 201 millones totales.

El entrenamiento se organizo como una cuadricula de 12 ejecuciones que cruzaba dos regimenes (entrenamiento completo y LoRA), dos funciones de perdida (rlcd y soft_ce) y tres duraciones (245, 490 y 735 pasos). La seleccion del ganador se hizo exclusivamente sobre un split de ajuste de 105 elementos; el split de test se puntuo una sola vez, despues de la seleccion. Las temperaturas de calibracion se ajustaron en un split de calibracion reservado. El conjunto de entrenamiento es pequeno: 490 elementos. No se dispone de informacion sobre el numero de tokens de entrenamiento ni sobre la composicion del dataset mas alla de su uso de MMFakeBench.

## Capacidades

- Clasificacion imagen-texto: determina si un par imagen-texto es coherente o si la imagen se ha utilizado fuera de contexto, tarea central de MMFakeBench.
- Deteccion de desinformacion multimodal: el fine-tune esta orientado a identificar pares manipulados o enganosos.
- Razonamiento multimodal limitado: al conservar el encoder de lenguaje del modelo base, puede procesar representaciones conjuntas de imagen y texto, aunque la torre de vision no se ha adaptado a esta tarea.
- Salida de clasificacion con probabilidades calibradas: las temperaturas se calibraron en un split reservado, lo que permite umbrales mas estables.
- Capacidades multilingues: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, vision adicional o audio: no disponible.

## Casos de uso

- Moderacion de contenido en plataformas de noticias: el modelo puede puntuar pares imagen-titular para detectar imagenes reutilizadas fuera de contexto, aprovechando su entrenamiento especifico en MMFakeBench.
- Verificacion de hechos asistida: como clasificador de primera etapa, prioriza que pares imagen-texto revisar manualmente, reduciendo el volumen de trabajo de los verificadores.
- Investigacion en desinformacion multimodal: sirve como baseline reproducible para comparar tecnicas de fine-tune (completo frente a LoRA, distintas perdidas) sobre el mismo conjunto de datos.
- Filtrado en agregadores de noticias: descarta o marca articulos cuyo par imagen-texto presenta baja coherencia antes de su publicacion automatica.
- Analisis forense de campanas de desinformacion: permite clasificar lotes de pares imagen-texto extraidos de redes sociales para identificar patrones de reutilizacion.
- Evaluacion de robustez de modelos multimodales: al ser un fine-tune pequeno y documentado, resulta util como caso de estudio de calibracion y seleccion de hiperparametros en entornos con datos escasos.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Macro-F1 en split de ajuste (105 elementos) | 0,7389 |
| Delta de macro-F1 en test frente al baseline preentrenado | +0,3983 |
| Intervalo de confianza del 95 % del delta | [+0,3853, +0,4108] |
| Tamano del split de test | 9999 |
| Hipotesis H1 | cumplida (test) |
| Hipotesis H2 | no cumplida |
| Hipotesis H3 | no cumplida |
| Hipotesis H4 | cumplida |
| Hipotesis H5 | cumplida |

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni otras tareas estandar. La exactitud en NewsCLIPpings se calcula solo sobre las filas puntuadas, segun indica el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 201 M de parametros, en precision FP16 el peso ronda los 0,4 GB y en FP32 unos 0,8 GB, por lo que la VRAM necesaria es modesta.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente por capacidad; no se especifican modelos concretos en la informacion disponible.
- Cabe en GPU consumer: si, por el reducido numero de parametros, aunque no se detallan modelos concretos.
- Opciones de despliegue: no disponible; al ser un modelo de clasificacion multimodal, requiere el codigo y las dependencias del modelo base thaitea/laya-vision.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LAYAVision fullfine-tune MMFakeBench | 201 M | no disponible | Clasificacion imagen-texto (MMFakeBench) | apache-2.0 | Hugging Face, 0 descargas |
| thaitea/laya-vision (base) | no disponible | no disponible | Vision-lenguaje general | no disponible | Hugging Face |
| Alternativas de deteccion de desinformacion multimodal | no disponible | no disponible | Clasificacion imagen-texto | no disponible | no disponible |

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Conjunto de entrenamiento muy pequeno (490 elementos), lo que limita la generalizacion mas alla de MMFakeBench.
- Una sola familia de modelos evaluada; no hay evidencia de transferencia a otros modelos o dominios.
- La torre de vision permanece congelada en ambas ramas, por lo que el modelo no adapta sus representaciones visuales a la tarea.
- La exactitud en NewsCLIPpings se calcula solo sobre las filas puntuadas; el flujo de VisualNews se transmitio en streaming y no se guardo, lo que dificulta la reproduccion exacta.
- Los metadatos de origen (text_source, image_source) nunca se usaron como entrada porque filtran la etiqueta; cualquier uso que los incluya invalidaria los resultados.
- Riesgo de alucinacion y sesgos: no disponible en la informacion proporcionada, aunque al ser un clasificador la salida es una etiqueta y no texto libre.
- Licencia apache-2.0, que permite uso comercial con atribucion; conviene verificar las condiciones del modelo base thaitea/laya-vision, cuya licencia no se detalla en la informacion disponible.
- Sin descargas ni likes en el momento de la consulta; no hay evidencia de uso en produccion.
- No se especifican idiomas soportados, longitud de contexto ni formatos de cuantizacion, lo que complica su integracion en pipelines existentes.

## Enlaces

- Hugging Face: https://huggingface.co/RafiulHaiderbro/laya-vision-fullft-mmfakebench
- Modelo base: https://huggingface.co/thaitea/laya-vision
- Revision del modelo base: f2fe3c12cb6d04c59d8a190250bf3fb40fc828dc
- Paper, blog, repositorio o demo adicionales: no disponible
