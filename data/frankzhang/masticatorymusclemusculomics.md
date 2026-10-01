# frankzhang/MasticatoryMuscleMusculomics

## Resumen

MasticatoryMuscleMusculomics es un modelo de segmentacion medica basado en nnU-Net v2 que delimita las cuatro subestructuras del musculo pterigoideo lateral (cabeza superior e inferior, derecha e izquierda) en tomografias computarizadas (TC) de craneo sin contraste. Lo publica el usuario frankzhang en HuggingFace y se distribuye como modelo adicional de TotalSegmentator, de modo que se integra en el flujo de trabajo habitual de esa herramienta mediante un paquete de pesos con la misma estructura que los oficiales.

El modelo no es un modelo de lenguaje: es una red convolucional 3D de segmentacion semantica con cuatro etiquetas de salida. Se apoya en la arquitectura ResidualEncoderUNet-L de nnU-Net v2 en configuracion 3d_fullres, entrenada con un trainer personalizado (`nnUNetTrainerLRSwapMirrorNoRotation300`) que aplica espejado consciente de la etiqueta izquierda/derecha y desactiva el aumento por rotacion. El checkpoint publicado es el `checkpoint_best.pth` de la particion fold_0, renombrado como `checkpoint_final.pth`.

Su relevancia actual es doble. Por un lado, resuelve una tarea de segmentacion fina (cuatro subestructuras de un musculo pequeno) sobre TC craneal rutinaria, con un Dice de 0,952 en un conjunto de test interno de 53 casos. Por otro, viene acompanado de un modulo de extraccion de caracteristicas de musculomics (`musc_geometry/`) y de un articulo bajo revision por pares sobre reproducibilidad multicentro y clasificacion del estado cerebrovascular, lo que lo situa como pieza de un pipeline de investigacion en imagen medica mas que como utilidad clinica aislada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nnU-Net v2, ResidualEncoderUNet-L (planes `nnUNetResEncUNetLPlans_torchres`, configuracion 3d_fullres) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision 3D; tamano de parche no publicado) |
| Tipos de cuantizacion | no aplica (checkpoint PyTorch en coma flotante; no se publican variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de imagen medica) |
| Licencia | MIT |
| Formato de pesos | `.pth` de PyTorch (`checkpoint_best.pth` distribuido como `checkpoint_final.pth`), empaquetado en `Dataset963_MasticatoryMuscleDetail.zip` con la estructura de pesos de TotalSegmentator |
| Tarea | Segmentacion de 4 etiquetas: 1 = pterigoideo lateral derecho cabeza superior, 2 = derecho cabeza inferior, 3 = izquierdo cabeza superior, 4 = izquierdo cabeza inferior |
| Entrada | TC de craneo sin contraste, campo de vision completo, sin recorte previo |
| Particion | fold_0 |
| Tamano del repositorio | 0,8 GB |
| SHA256 del ZIP de pesos | `03f6d6dc796ea2a6d74af625ecde04ed5fbc4d3a5a00b3b3183b3305e784bdbc` |

## Arquitectura y entrenamiento

El modelo sigue la receta de nnU-Net v2 con el plan de red ResidualEncoderUNet-L, que sustituye los bloques convolucionales estandar del encoder por bloques residuales y aumenta la anchura respecto a los planes 3d_fullres por defecto. La configuracion utilizada es exclusivamente 3d_fullres, es decir, convoluciones y normalizacion volumetricas sobre el volumen completo de TC, sin cascada ni configuraciones 2D de apoyo.

El entrenamiento se realizo con el trainer personalizado `nnUNetTrainerLRSwapMirrorNoRotation300`, que introduce dos modificaciones relevantes respecto al entrenamiento estandar. La primera es un espejado de aumento consciente de la etiqueta izquierda/derecha, de forma que al reflejar el volumen tambien se permutan las etiquetas de lado para no corromper la lateralidad anatomica. La segunda es la desactivacion del aumento por rotacion, presumiblemente porque rotaciones arbitrarias degradan la coherencia de una estructura pequena y simetrica como el pterigoideo lateral. Se entrenaron 300 epochs y en inferencia se aplica test-time augmentation excluyendo el eje izquierda-derecha, coherente con la decision de diseno anterior.

Los datos de entrenamiento son 264 TC de craneo sin contraste procedentes de una cohorte multicentro, divididos en 185 casos de entrenamiento, 26 de validacion y 53 de test con semilla 42. No se documentan en la informacion disponible el numero de tokens ni una fase de ajuste por preferencias humana, dado que no aplica a un modelo de segmentacion. La innovacion tecnica destacable es precisamente el tratamiento explicito de la simetria bilateral, poco habitual en segmentacion medica generica, y el empaquetado de los pesos como modelo adicional de TotalSegmentator, que evita al usuario reconstruir el pipeline de preprocesado e inferencia.

## Capacidades

- Segmentacion semantica 3D de cuatro subestructuras del musculo pterigoideo lateral en TC de craneo sin contraste, con salida en mascara volumetrica (NIfTI) con etiquetas 1 a 4.
- Distincion explicita entre lado derecho e izquierdo y entre cabeza superior e inferior, lo que permite analisis de asimetria bilateral.
- Entrada directa de TC craneal de campo de vision completo, sin necesidad de recorte previo a la region de interes.
- Integracion con TotalSegmentator como modelo adicional, mediante el comando `totalseg-masticatory`, lo que permite encadenarlo con las segmentaciones oficiales de esa herramienta.
- Incluye `musc_geometry/`, un modulo de extraccion de caracteristicas de musculomics (morfologicas y de densidad/textura) que opera sobre las mascaras generadas.
- Inferencia con test-time augmentation sobre los ejes permitidos (excluye el eje izquierda-derecha).
- No dispone de soporte de tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: no es un modelo de lenguaje.
- No dispone de capacidades multilingues, de vision 2D natural, de audio ni de modo de razonamiento explicito.

## Casos de uso

- Investigacion en musculomics: el modelo genera las mascaras de las cuatro subestructuras y el modulo `musc_geometry/` extrae caracteristicas morfologicas y de densidad/textura para estudios poblacionales sobre composicion muscular.
- Clasificacion del estado cerebrovascular: el articulo asociado evalua si las caracteristicas derivadas de estos musculos masticatorios permiten clasificar el estado cerebrovascular del paciente a partir de TC craneal rutinaria, lo que convierte al modelo en el primer eslabon de ese pipeline.
- Analisis de asimetria izquierda-derecha: al segmentar por separado cabeza superior e inferior de cada lado, permite cuantificar diferencias de volumen y densidad entre lados, relevante en patologia unilateral de la articulacion temporomandibular o en afectacion nerviosa asimetrica.
- Estudios retrospectivos multicentro: la validacion se hizo sobre una cohorte multicentro de 264 casos, por lo que el modelo es adecuado para procesar de forma masiva archivos de TC de distintos equipos y protocolos sin reentrenamiento.
- Extraccion de biomarcadores de sarcopenia o atrofia muscular: la perdida de volumen y el cambio de densidad en musculos masticatorios son marcadores candidatos en envejecimiento y en enfermedades neuromusculares; el modelo permite medirlos de forma automatica en series longitudinales.
- Preprocesado para radiomica: las mascaras generadas sirven como region de interes para extraer descriptores de textura con PyRadiomics u otras librerias, alimentando modelos predictivos aguas abajo.
- Apoyo a planificacion maxilofacial y ortognatica en investigacion: la delimitacion del pterigoideo lateral es util en estudios de biomecanica mandibular y de cambios postquirurgicos, siempre con caracter investigador y no diagnostico.
- Validacion metodologica y docencia: sirve como caso de estudio de entrenamiento de nnU-Net v2 con aumento consciente de lateralidad, replicable en otras estructuras bilaterales simetricas.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de test interno congelado (53 casos, media a nivel de caso sobre las 4 etiquetas, intervalos de confianza bootstrap del 95 por ciento):

| Metrica | Valor |
|---|---|
| Dice | 0,952 (IC 95 %: 0,945-0,958) |
| NSD@1mm | 0,971 |
| HD95 | 0,836 mm |

No se han publicado en la informacion disponible resultados comparativos con otros modelos sobre el mismo conjunto de test, ni desglose por etiqueta, por centro o por subgrupo de pacientes.

## Requisitos de hardware

- VRAM estimada: no publicada por el autor. Como referencia orientativa, la inferencia 3d_fullres de nnU-Net con planes de tipo L suele requerir del orden de 8 a 16 GB de VRAM con ventana deslizante; este dato no esta confirmado en la informacion disponible.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y memoria suficiente. Perfiles habituales para este tipo de inferencia son RTX 3090 o RTX 4090 (24 GB), A100 (40/80 GB), H100, L40S y V100 de 32 GB.
- GPU de consumo: previsiblemente si en RTX 3090 y RTX 4090 por su capacidad de 24 GB. En tarjetas de 8 a 12 GB podria ser necesario reducir el solapamiento de la ventana deslizante o procesar el volumen por bloques; no confirmado.
- CPU: nnU-Net permite inferencia en CPU, pero con tiempos muy superiores. No se publican cifras de latencia en CPU.
- Opciones de despliegue: TotalSegmentator mediante la CLI `totalseg-masticatory`, la API de Python de TotalSegmentator, o nnU-Net v2 directamente si se replica la estructura de carpetas. Los servidores de inferencia para modelos de lenguaje (vLLM, llama.cpp, Ollama, TGI) no son aplicables a este modelo.
- Latencia y throughput: no disponibles. Dependen del hardware, del tamano del volumen de TC y de la configuracion de la ventana deslizante.
- Almacenamiento: el paquete de pesos ocupa aproximadamente 0,8 GB, mas el espacio de las mascaras de salida y de la instalacion de TotalSegmentator y sus dependencias.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MasticatoryMuscleMusculomics | nnU-Net v2 ResEncUNet-L, 3d_fullres | no disponible | no aplica | Dice 0,952; NSD@1mm 0,971; HD95 0,836 mm en 53 casos | MIT | Pesos en HuggingFace, integracion con TotalSegmentator |
| Tarea `muscles` de TotalSegmentator | nnU-Net v2, modelos oficiales | no disponible en la informacion disponible | no aplica | no disponible en la informacion disponible | Apache 2.0 / licencia propia del proyecto segun version | Paquete oficial de TotalSegmentator |
| nnU-Net v2 3d_fullres por defecto, reentrenado ad hoc | nnU-Net v2 con planes por defecto | no disponible | no aplica | no disponible en la informacion disponible | Apache 2.0 | Codigo abierto, requiere entrenamiento propio |

La comparacion cuantitativa con alternativas no es posible con los datos disponibles: el autor no publica una linea base frente a la tarea `muscles` de TotalSegmentator ni frente al plan 3d_fullres estandar. La diferencia funcional clara es la granularidad de salida, ya que este modelo distingue las cuatro subestructuras del pterigoideo lateral, mientras que las segmentaciones musculares genericas suelen agrupar el musculo completo o no incluirlo.

## Limitaciones y advertencias

- No es un dispositivo medico y no ha sido aprobado para uso clinico. El propio autor restringe su uso a investigacion, pese a que la licencia MIT permita en principio usos mas amplios.
- Dominio de entrada estricto: solo TC de craneo sin contraste y de campo de vision completo. No se ha validado con TC con contraste, con recorte previo, con otras modalidades (RM, CBCT) ni con otras regiones anatomicas.
- Solo segmenta cuatro etiquetas correspondientes al pterigoideo lateral. No segmenta masetero, temporal ni pterigoideo medial, por lo que no sirve como segmentacion masticatoria completa.
- Riesgo de fallo en casos con artefactos de metal, implantes dentales, movilidad del paciente o anatomias atipicas, situaciones no caracterizadas en la informacion disponible.
- Sesgos potenciales no documentados: el autor no publica la distribucion demografica, etnica ni por equipos de la cohorte de 264 casos, por lo que se desconoce si el rendimiento se mantiene en poblaciones infrarrepresentadas.
- La unica evaluacion publicada es un test interno de 53 casos de la misma cohorte multicentro. No hay validacion externa independiente ni verificacion por terceros.
- El repositorio tiene cero descargas y cero valoraciones en el momento de la consulta, y el articulo asociado esta bajo revision por pares con revision doble ciego, por lo que la evidencia cientifica no esta consolidada.
- Riesgo de sobreconfianza en las metricas: un Dice agregado de 0,952 sobre las cuatro etiquetas puede ocultar un rendimiento peor en las subestructuras mas pequenas; no se publica el desglose por etiqueta.
- Dependencia de la cadena de herramientas: el uso requiere clonar el repositorio GitHub complementario e instalar los pesos en el directorio de TotalSegmentator, con la consiguiente dependencia de versiones de nnU-Net v2, PyTorch y CUDA.
- Sin garantias de reproducibilidad exacta si cambian las versiones de las dependencias o la configuracion de inferencia (solapamiento de ventana, TTA).
- La informacion sobre parametros totales, consumo de VRAM y latencia no esta publicada, lo que dificulta el dimensionamiento de infraestructura para produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/frankzhang/MasticatoryMuscleMusculomics
- Repositorio GitHub complementario `MasticatoryMuscleMusculomics`: mencionado en la model card; URL no proporcionada en la informacion disponible.
- TotalSegmentator: https://github.com/wasserth/TotalSegmentator
- nnU-Net v2: referenciado en la model card como arquitectura base; URL no proporcionada en la informacion disponible.
- Articulo asociado: "Automated Masticatory Muscle Musculomics on Routine Head CT: Multicenter Reproducibility and Cerebrovascular Status Classification", bajo revision por pares; DOI y enlace no disponibles.
