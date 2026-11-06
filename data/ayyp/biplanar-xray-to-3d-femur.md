# ayyp/biplanar-xray-to-3d-femur

## Resumen

biplanar-xray-to-3d-femur es un conjunto de pesos de reconstruccion 3D del femur a partir de dos radiografias (proyeccion anteroposterior y lateral), desarrollado por el usuario ayyp y publicado en Hugging Face bajo licencia CC-BY-4.0. El modelo no genera texto ni es un modelo de lenguaje: es un pipeline de vision por computador medico orientado a segmentacion y reconstruccion volumetrica, cuyo objetivo es estimar el eje mecanico femoral (del centro de la cadera al centro de la rodilla), una medida critica en planificacion de cirugia ortopedica.

El repositorio incluye dos arquitecturas alternativas implementadas con MONAI: una AttentionUnet de aproximadamente 1,5 millones de parametros (recomendada por el autor) y una SwinUNETR de unos 62 millones de parametros. Cada arquitectura se distribuye en cinco checkpoints correspondientes a cinco particiones de validacion cruzada, que se promedian para inferencia sobre datos nuevos.

La relevancia del modelo radica en su enfoque de reconstruccion a partir de imagen 2D de bajo coste (radiografia) en lugar de tomografia computerizada, y en la publicacion de errores de eje mecanico del orden de 0,5 grados en validacion interna. No obstante, el propio autor advierte que el entrenamiento se realizo exclusivamente con radiografias sinteticas generadas a partir de tomografias, por lo que su validez sobre radiografias reales no esta demostrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MONAI AttentionUnet (1,5 M parametros) y MONAI SwinUNETR (62 M parametros) |
| Parametros totales | 1,5 M (AttentionUnet) / 62 M (SwinUNETR) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | checkpoints PyTorch `.pt` (5 folds por arquitectura) |
| Tamano del repositorio | 1,3 GB |
| Libreria | MONAI |
| Entrada | Radiografias AP 256x96 px y LAT 256x128 px a 2 mm, cadera en la parte superior |
| Salida | Reconstruccion 3D del femur y eje mecanico femoral |

## Arquitectura y entrenamiento

El modelo emplea dos arquitecturas de segmentacion volumetrica de MONAI. La AttentionUnet es una red convolucional con mecanismos de atencion en el decodificador, de solo 1,5 millones de parametros, lo que la hace muy ligera. La SwinUNETR es un transformer jerarquico con ventanas desplazadas adaptado a volumenes 3D, con 62 millones de parametros. El autor recomienda la AttentionUnet por su mejor relacion entre rendimiento y coste computacional. Cada arquitectura se entrena en cinco particiones de validacion cruzada y, para datos nuevos, se promedian las predicciones de los cinco modelos.

El entrenamiento se realizo sobre el cohorte HFValid, compuesto por 101 tomografias de femur completo. A partir de cada tomografia se generaron radiografias sinteticas mediante proyeccion paralela (DRR, digitally reconstructed radiographs), que constituyen la unica modalidad de entrada vista durante el entrenamiento. No se documenta en la informacion disponible el numero de tokens ni el uso de tecnicas de RLHF o DPO, que no aplican a este tipo de modelo. La innovacion principal es el planteamiento de reconstruccion biplanar a partir de dos vistas con una calibracion geometrica fija (256x96 y 256x128 px a 2 mm).

## Capacidades

- Reconstruccion 3D del femur a partir de dos radiografias (AP y lateral).
- Segmentacion de estructuras oseas femorales en las proyecciones de entrada.
- Calculo del eje mecanico femoral (centro de cadera a centro de rodilla).
- Soporte de lateralidad: el script de inferencia acepta el parametro `--side L` (y presumiblemente R) para indicar el lado.
- Promediado de ensemble sobre cinco folds de validacion cruzada.
- Inferencia mediante script de linea de comandos del repositorio de GitHub.
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso ni capacidades multilingues, al no ser un modelo generativo de texto.

## Casos de uso

- Planificacion preoperatoria de artroplastia de rodilla o cadera: el modelo estima el eje mecanico femoral a partir de dos radiografias, lo que puede ayudar al cirujano a valorar deformidades angulares sin necesidad de una tomografia.
- Investigacion en reconstruccion 2D a 3D: el pipeline sirve como referencia reproducible para comparar tecnicas de DRR y arquitecturas de segmentacion volumetrica en imagen musculoesqueletica.
- Generacion de datos sinteticos y aumento de cohortes: los scripts de generacion de DRR del repositorio permiten crear pares radiografia-volumen para entrenar otros modelos.
- Prototipado de herramientas de medicion automatica: el calculo del eje mecanico puede integrarse en visores o estaciones de trabajo radiologicas como modulo de medida asistida.
- Docencia y formacion en radiologia ortopedica: permite ilustrar la relacion entre proyecciones 2D y anatomia 3D femoral con datos publicos.
- Evaluacion de modelos ligeros en entornos con recursos limitados: la AttentionUnet de 1,5 M de parametros puede ejecutarse en CPU o en GPU de gama baja, lo que facilita su despliegue en entornos de investigacion con hardware modesto.

## Benchmarks y rendimiento

| Metrica | Resultado | Conjunto |
|---|---|---|
| Error del eje mecanico (AttentionUnet, folds retenidos) | aproximadamente 0,5 grados | HFValid |
| Error del eje mecanico frente a landmarks expertos | 0,6-0,7 grados | VSD (externo) |

No se han publicado en la informacion disponible resultados de benchmarks estandar de vision (Dice, IoU, HD95) ni comparaciones numericas entre la AttentionUnet y la SwinUNETR.

## Requisitos de hardware

- VRAM estimada: muy reducida para la AttentionUnet (1,5 M de parametros); inferior a 1 GB en FP32 para inferencia por fold. La SwinUNETR (62 M de parametros) requiere del orden de 1-2 GB en FP32, aunque no se dispone de cifras oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se puede usar RTX 3060, RTX 4090, A100 o H100 sin problema. La AttentionUnet puede ejecutarse en CPU con latencia aceptable.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: script de inferencia del repositorio (`inference/predict.py`) sobre PyTorch y MONAI. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| biplanar-xray-to-3d-femur (AttentionUnet) | 1,5 M | 2 radiografias (AP + LAT) | Reconstruccion 3D de femur y eje mecanico | CC-BY-4.0 | Hugging Face + GitHub |
| biplanar-xray-to-3d-femur (SwinUNETR) | 62 M | 2 radiografias (AP + LAT) | Reconstruccion 3D de femur y eje mecanico | CC-BY-4.0 | Hugging Face + GitHub |
| Otros modelos de reconstruccion biplanar de femur | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de modelos comparables de la misma categoria con los que establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Entrenado exclusivamente con radiografias sinteticas (DRR) generadas a partir de tomografias de una unica cohorte de mujeres de edad avanzada; no se ha validado sobre radiografias reales.
- La entrada debe seguir estrictamente el formato del proyecto: AP de 256x96 px y LAT de 256x128 px a 2 mm, con la cadera en la parte superior. Cualquier desviacion de este formato puede degradar la prediccion.
- No apto para uso clinico segun el propio autor.
- Riesgo de sesgo demografico por la composicion de la cohorte de entrenamiento (mujeres mayores), lo que limita la generalizacion a otros grupos de edad o sexo.
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero no exime de las advertencias sobre validez clinica.
- No se documentan sesgos adicionales ni tasas de alucinacion, conceptos que no aplican a un modelo de segmentacion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ayyp/biplanar-xray-to-3d-femur
- Repositorio GitHub (codigo, script de inferencia y configuraciones): https://github.com/ayyp1/biplanar-xray-to-3d-femur
- Documentacion de MONAI: https://monai.io/
