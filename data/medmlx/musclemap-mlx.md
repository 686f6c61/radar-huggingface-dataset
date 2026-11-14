# MedMLX/musclemap-mlx

## Resumen

MuscleMap v1.4 para MLX es una conversión de pesos del checkpoint original MuscleMap v1.4, publicada por MedMLX, que permite ejecutar segmentación anatómica 3D de músculos y huesos sobre Apple Silicon mediante MLX y Metal. El modelo segmenta 113 estructuras musculares y óseas en imágenes NIfTI de resonancia magnética (MRI) y tomografía computarizada (CT), una tarea típica de análisis de composición corporal y cuantificación muscular en investigación clínica.

Se trata de una UNet 2D de MONAI con una única entrada (un canal) y 114 canales de salida, entrenada originalmente por el consorcio MuscleMap. El bundle de MLX conserva exactamente los 46 tensores float32 del checkpoint del publicador, sin reentrenamiento ni cuantización, y mantiene los identificadores anatómicos originales en `labels.json`. El paquete `musclemap-mlx` se encarga del preprocesado por chunks, la restauración de logits a la rejilla de entrada, el argmax y la remapeo de canales a IDs anatómicos.

Su relevancia actual es de nicho pero concreta: ofrece inferencia nativa en Metal de un modelo médico de segmentación sin depender de CUDA, con paridad numérica verificada frente a la referencia en PyTorch. Está pensado para investigadores que trabajan en estaciones Mac y necesitan procesar volúmenes médicos localmente, sin subir datos a servicios externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet 2D de MONAI (1 canal de entrada, 114 canales de salida) |
| Parametros totales | 26.216.968 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión/segmentación) |
| Tipos de cuantizacion | ninguno; pesos float32 preservados exactamente |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una UNet 2D de MONAI con una sola entrada y 114 canales de salida, que corresponden a 113 estructuras anatómicas más el fondo. La inferencia se realiza por chunks de cortes (por defecto ocho cortes con 90 % de solapamiento gaussiano), restaurando los logits a la rejilla del volumen original antes del argmax, remapeando los canales a los IDs anatómicos originales y conservando la componente conectada más grande por etiqueta. El tamaño de chunk afecta a la normalización, por lo que debe mantenerse constante al comparar resultados.

El bundle de MedMLX es una conversión directa del checkpoint del publicador (MuscleMap v1.4, revisión de código 35a2138), sin entrenamiento adicional ni cuantización; `conversion.json` documenta el inventario de los 46 tensores y la revisión de origen. La información disponible no detalla el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o ajuste fino; la model card solo remite a la publicación de McKay et al. (J Imaging 2024) para la descripción del método original.

## Capacidades

- Segmentación 3D de 113 estructuras musculares y óseas en volúmenes MRI y CT en formato NIfTI.
- Procesamiento por chunks con solapamiento gaussiano para volúmenes de gran tamaño.
- Preservación de identificadores anatómicos originales (nombres, lados y regiones) mediante `labels.json`.
- Ejecución nativa en Apple Silicon con MLX y Metal, sin dependencia de CUDA.
- Interfaz de línea de comandos: `musclemap-mlx segment --input scan.nii.gz --model-dir ... --output-dir ...`.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto; es exclusivamente un modelo de segmentación de imagen.

## Casos de uso

- Cuantificación de composición corporal en estudios de investigación: el modelo segmenta músculo y hueso en volúmenes CT/MRI completos, permitiendo calcular volúmenes y áreas por estructura para análisis poblacionales.
- Análisis de sarcopenia y pérdida muscular: la segmentación por estructura y lado permite medir asimetrías y cambios longitudinales en pacientes, procesando los escaneos localmente en estaciones Mac.
- Investigación clínica con datos sensibles: al ejecutarse en local sobre Apple Silicon, evita enviar imágenes médicas a servicios en la nube, lo que facilita el cumplimiento de requisitos de privacidad.
- Preprocesado para pipelines de radiómica: las máscaras por estructura generadas pueden alimentar extracción de características y modelos posteriores de clasificación o regresión.
- Docencia y prototipado en imagen médica: la licencia MIT y la instalación vía pip permiten usar el modelo en cursos y pruebas de concepto sin coste de licencia.
- Validación de implementaciones: sirve como referencia de paridad numérica para comparar pipelines de inferencia propios frente a la implementación MLX/Metal documentada.
- Planificación de estudios de imagen corporal total: la segmentación de 113 estructuras facilita la definición de regiones de interés en protocolos de MRI/CT de cuerpo completo.

## Benchmarks y rendimiento

La model card no publica métricas de precisión anatómica (Dice, IoU) frente a segmentaciones manuales. Solo documenta resultados de paridad de implementación:

| Prueba | Referencia | Resultado |
|---|---|---|
| Volumen CT compacto TotalSegmentator (122x101x30) | MONAI 1.3.2 + PyTorch 2.4.1, float32 | Coincidencia de todos los vóxeles finales; error máximo de logits restaurados 9,92e-5 (atol=5e-4, rtol=1e-5) |
| Volumen MRI compacto TotalSegmentator (117x91x20) | MONAI 1.3.2 + PyTorch 2.4.1, float32 | Coincidencia de todos los vóxeles finales; error máximo de logits restaurados 1,03e-4 (atol=5e-4, rtol=1e-5) |

Estos resultados miden equivalencia de implementación en dos ejemplos compactos, no exactitud anatómica ni cobertura de todas las estructuras.

## Requisitos de hardware

- Inferencia en Apple Silicon (MLX + Metal); no se documenta soporte para GPU NVIDIA ni CPU genérica en este bundle.
- VRAM unificada estimada: el repo ocupa 0,1 GB y los pesos son 26,2 M de parámetros en float32 (aproximadamente 105 MB), por lo que el modelo cabe holgadamente en cualquier Mac con memoria unificada de 8 GB o superior.
- Memoria adicional necesaria para los volúmenes de entrada y las máscaras de salida, que escala con el tamaño del estudio y el tamaño de chunk.
- Despliegue mediante el paquete `musclemap-mlx` (pip) y su comando `segment`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MuscleMap v1.4 (MLX, este bundle) | 26,2 M | no aplica | Segmentación muscular/ósea 3D (MRI/CT) | MIT | Hugging Face + PyPI |
| MuscleMap v1.4 (checkpoint original) | 26,2 M | no aplica | Segmentación muscular/ósea 3D (MRI/CT) | MIT | Zenodo + GitHub |
| TotalSegmentator | no disponible | no aplica | Segmentación anatómica de cuerpo completo | no disponible | Repo público |
| MONAI UNet genérica | variable | no aplica | Segmentación de imagen médica | Apache 2.0 (MONAI) | Framework |

La comparación con TotalSegmentator y MONAI se ofrece como referencia de categoría; no se dispone de datos de rendimiento comparativo entre ellos en la información proporcionada.

## Limitaciones y advertencias

- No es un dispositivo médico: no se han publicado métricas de exactitud anatómica frente a segmentaciones manuales, solo paridad de implementación en dos volúmenes compactos.
- La cobertura de las 113 estructuras no está validada en la información disponible; los resultados de paridad no garantizan segmentaciones correctas en todos los casos.
- El tamaño de chunk afecta a la normalización y a los resultados; debe mantenerse constante para comparaciones reproducibles.
- Requiere imágenes NIfTI con el preprocesado esperado por el pipeline (chunks de cortes, solapamiento gaussiano); no se documenta robustez ante protocolos de adquisición distintos.
- Dependencia de Apple Silicon y MLX: no hay soporte documentado para CUDA ni para despliegue en servidores x86 convencionales.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos o segmentaciones erróneas en estructuras pequeñas o con bajo contraste.
- Sesgos demográficos y de adquisición: no se documenta la composición del dataset de entrenamiento ni su diversidad.
- Licencia MIT permite uso comercial, pero la responsabilidad clínica y regulatoria recae en el usuario; verificar `LICENSE` y `NOTICE` del bundle antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MedMLX/musclemap-mlx
- Paquete PyPI: https://pypi.org/project/musclemap-mlx/
- Checkpoint original (Zenodo): https://zenodo.org/records/21929873
- Código fuente MuscleMap (GitHub, revisión 35a2138): https://github.com/MuscleMap/MuscleMap/tree/35a2138a4a3a63be713bae5584632ffc6433b960
- Publicación de referencia: McKay et al., J Imaging 2024, 10(11):262, https://doi.org/10.3390/jimaging10110262
- Documentación técnica del paquete: `technical.md` incluido en el paquete `musclemap-mlx`
