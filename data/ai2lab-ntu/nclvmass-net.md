# AI2Lab-NTU/ncLVMass-Net

## Resumen

ncLVMass-Net es un modelo de segmentación 3D y cuantificación de masa del miocardio del ventrículo izquierdo (LV) a partir de imágenes de tomografía computarizada cardiaca sin contraste (NCCT). Lo desarrolla AI2Lab-NTU (AI Application and Integration Lab, Universidad Nacional de Taiwán) y está construido sobre el framework nnU-Net, el estándar de facto para segmentación biomédica auto-configurada.

El modelo resuelve un problema clínico concreto: la cuantificación de la masa miocárdica del ventrículo izquierdo sin necesidad de administrar contraste yodado, lo que reduce riesgos en pacientes con insuficiencia renal y simplifica el flujo de adquisición. Se entrenó con 2.021 pacientes, todos procedentes de Taiwán, y reporta un Dice global de 0,8827.

Es relevante por su carácter especializado y su empaquetado listo para uso: recibe un volumen en formato NIfTI (`.nii.gz`) y devuelve la máscara del miocardio junto con una estimación de la masa del LV. El repositorio ocupa 5,6 GB, coherente con los pesos de un modelo nnU-Net 3D completo. No es un modelo de lenguaje: no procesa texto ni dispone de ventana de contexto, tool calling ni capacidades generativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nnU-Net (U-Net 3D auto-configurada, framework de segmentación biomédica) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión 3D, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en precisión completa para el framework nnU-Net) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | ai2lab (marcada como `license: other`, con fichero LICENSE en el repositorio) |
| Formato de pesos | checkpoints de nnU-Net (no se especifican safetensors ni GGUF); entrada y salida en NIfTI (`.nii.gz`) |
| Modalidad de entrada | CT cardiaco sin contraste (NCCT) |
| Tarea | Segmentación 3D del miocardio del ventrículo izquierdo y cuantificación de masa |
| Tamano del repositorio | 5,6 GB |

## Arquitectura y entrenamiento

El modelo se basa en nnU-Net, un pipeline que configura automáticamente la arquitectura U-Net (profundidad, número de canales, tamaño de parche, esquema de aumento de datos y estrategia de entrenamiento) a partir de las propiedades del dataset. Se trata de una red convolucional 3D entrenada para segmentación volumétrica voxel a voxel, adaptada a la modalidad NCCT y a la estructura anatómica del miocardio del ventrículo izquierdo.

El entrenamiento utilizó 2.021 pacientes, todos ellos de Taiwán, según indica la model card. No se detalla el número de volúmenes de validación o test, la composición exacta del dataset, la resolución de las imágenes, el preprocesado aplicado ni si hubo etapas de refinamiento posteriores. Tampoco se especifica si la estimación de masa del LV se obtiene mediante un postprocesado geométrico (volumen de la máscara multiplicado por una densidad miocárdica asumida) o mediante un cabezal de regresión; la model card solo indica que el modelo devuelve la máscara junto con la masa estimada.

## Capacidades

- Segmentación 3D del miocardio del ventrículo izquierdo en CT cardiaco sin contraste.
- Cuantificación de la masa del ventrículo izquierdo a partir de la segmentación.
- Procesamiento de volúmenes completos en formato NIfTI (`.nii.gz`) como entrada y salida.
- Inferencia sobre estudios NCCT, es decir, sin requerir administración de contraste yodado.
- Integración con el ecosistema nnU-Net para entrenamiento, inferencia y validación cruzada.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión 2D natural, tool calling, capacidades de agente ni soporte multilingüe.

## Casos de uso

- Cuantificación de masa miocárdica en cohortes retrospectivas: aplicar el modelo a estudios NCCT ya adquiridos para obtener medidas de masa del LV sin necesidad de nuevas exploraciones ni de contraste, útil en investigación cardiovascular a gran escala.
- Evaluación de pacientes con contraindicación de contraste: en sujetos con insuficiencia renal o alergia al yodo, el modelo permite estimar la masa del LV a partir de la CT sin contraste disponible en el estudio.
- Análisis de riesgo cardiovascular en cribados: incorporar la masa del LV como biomarcador morfológico en programas de cribado con CT torácica o cardiaca sin contraste.
- Segmentación previa a planificación: generar máscaras del miocardio que sirvan como base para análisis de grosor, volumetría o registro con otras modalidades.
- Automatización de pipelines de imagen cardiaca: sustituir o asistir la delineación manual en servicios de radiología, reduciendo el tiempo de lectura y la variabilidad entre observadores.
- Generación de datasets etiquetados: usar las máscaras producidas para preentrenar o aumentar datos de otros modelos de segmentación cardiaca, con revisión experta posterior.
- Docencia y validación de segmentaciones: comparar las salidas del modelo con delineaciones manuales en entornos formativos o de control de calidad.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Dice global (conjunto reportado por el autor) | 0,8827 |
| Pacientes de entrenamiento | 2.021 |
| Comparación con otros modelos | no disponible |

No se han publicado en la información disponible resultados desglosados por clase, métricas de distancia (HD95, ASSD), coeficientes de correlación para la masa estimada ni comparaciones con otros métodos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Un nnU-Net 3D completo para inferencia de volúmenes cardiacos suele requerir entre 8 y 24 GB de VRAM según el tamaño de parche y la estrategia de inferencia deslizante; el dato exacto no figura en la información proporcionada.
- GPU recomendadas: no especificadas por el autor. Por el perfil típico de nnU-Net, son adecuadas GPU con al menos 16 GB de VRAM, como RTX A4000, RTX 4090, A100 o H100.
- GPU de consumo: probablemente viable en tarjetas con 12-24 GB de VRAM (RTX 3090, RTX 4090) si se ajusta el tamaño de parche, aunque no está confirmado.
- Opciones de despliegue: inferencia mediante el framework nnU-Net (Python, PyTorch); no se documentan exportaciones a ONNX, TensorRT ni integraciones con servidores de inferencia genéricos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Framework | Datos de entrenamiento | Dice reportado | Licencia |
|---|---|---|---|---|---|
| ncLVMass-Net | Segmentación de miocardio LV en NCCT | nnU-Net | 2.021 pacientes (Taiwán) | 0,8827 | ai2lab (`other`) |
| Modelos nnU-Net genéricos para segmentación cardiaca | Segmentación multiestructura | nnU-Net | no disponible | no disponible | varía |
| TotalSegmentator | Segmentación de órganos en CT | nnU-Net | no disponible | no disponible | varía |

No se dispone de comparaciones directas publicadas con modelos equivalentes de segmentación del miocardio del ventrículo izquierdo en CT sin contraste.

## Limitaciones y advertencias

- El entrenamiento se realizó exclusivamente con pacientes de Taiwán; el rendimiento puede degradarse en poblaciones con distribución demográfica, hábitos o equipos de imagen distintos.
- No se documentan métricas de calibración de la masa estimada ni su correlación con medidas de referencia (por ejemplo, resonancia magnética cardiaca).
- El modelo está diseñado para CT sin contraste; su comportamiento en CT con contraste u otras modalidades no está caracterizado.
- La licencia `ai2lab` está marcada como `other`; es imprescindible revisar el fichero LICENSE del repositorio antes de cualquier uso comercial o clínico.
- No es un dispositivo médico validado: no debe emplearse para diagnóstico o decisión clínica sin supervisión profesional y validación local.
- No se especifican los requisitos de preprocesado (resolución, orientación, normalización de intensidades) más allá del formato NIfTI, lo que puede afectar a la reproducibilidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia comunitaria de uso.
- No dispone de capacidades de lenguaje, agentes ni tool calling; cualquier expectativa en ese sentido es inaplicable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AI2Lab-NTU/ncLVMass-Net
- Repositorio GitHub: https://github.com/AI-Application-and-Integration-Lab/ncLVMass-Net
- Framework nnU-Net: https://github.com/MIC-DKFZ/nnUNet
