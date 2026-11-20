# BADHWAR-MIND-LAB/Aschoplex_compassnd_chp_finetuned

## Resumen

ASCHOPLEX es un sistema de segmentación automática del plexo coroide (choroid plexus, ChP) en imágenes de resonancia magnética cerebral potenciadas en T1 de tipo 3D. Lo desarrolla el grupo BADHWAR-MIND-LAB y consiste en un ensamble de cinco redes neuronales convolucionales y transformer (tres DynUNet y dos UNETR) implementadas con MONAI, afinadas sobre anotaciones manuales de la cohorte multi-centro COMPASS-ND. El modelo parte del proyecto original ASCHOPLEX de la Universidad de Padua (FAIR-Unipd).

El problema que resuelve es la volumetría precisa del plexo coroide, una estructura pequeña y de bajo contraste que resulta difícil de delimitar manualmente y cuya cuantificación es relevante en estudios de neuroimagen, envejecimiento cerebral y enfermedades neurodegenerativas. La segmentación se entrega como máscara binaria en NIfTI en el espacio de la imagen original, junto con el recuento de vóxeles de primer plano y el volumen estimado en milímetros cúbicos.

Es relevante porque ofrece un pipeline reproducible y abierto (licencia Apache 2.0) para un paso concreto de un flujo de neuroimagen, con pesos publicados y un script de inferencia listo para ejecutar en GPU NVIDIA. No es un modelo de lenguaje: es un modelo de segmentación de imágenes médicas y debe evaluarse como tal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ensamble de 5 modelos: 3 x DynUNet y 2 x UNETR (MONAI) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: volumen MRI 3D T1, parche de 128 según configuración) |
| Tipos de cuantización | no disponible (checkpoints PyTorch `.pt`, sin versiones GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible (no es un modelo de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`best_metric_model.pt` por modelo y fold), ~770 MB de checkpoints, repo de 0.8 GB |

## Arquitectura y entrenamiento

El sistema es un ensamble de cinco modelos de segmentación 3D entrenados de forma independiente: tres variantes DynUNet (configuraciones `DynUnet_128_DiceCE_1_0`, `DynUnet_128_DiceCE_4_0` y `DynUnet_128_Dice_2_0`) y dos variantes UNETR (`UNETR_128_DiceCE_0_0` y `UNETR_128_DiceCE_3_0`). DynUNet es una U-Net adaptada a volúmenes 3D con convoluciones específicas por eje, mientras que UNETR emplea un transformer como codificador sobre parches volumétricos. Las etiquetas de las configuraciones indican la función de pérdida empleada (Dice, o combinación Dice + Cross-Entropy) y el fold de validación cruzada correspondiente.

El ajuste fino se realizó sobre segmentaciones manuales del plexo coroide de la cohorte COMPASS-ND, un estudio multi-centro, lo que aporta variabilidad entre escáneres y protocolos. El pipeline de inferencia carga cada modelo con su configuración MONAI, preprocesa la MRI, ejecuta los cinco modelos de forma secuencial (para limitar el pico de memoria GPU) y combina las predicciones en una máscara binaria final en el espacio original de la imagen. No se detallan en la información disponible el número de sujetos de entrenamiento, la composición exacta del dataset ni si hubo aumentación de datos más allá de lo que implican las configuraciones MONAI.

## Capacidades

- Segmentación binaria 3D del plexo coroide en MRI T1-weighted.
- Procesamiento de volúmenes en formato NIfTI (`.nii.gz`) en el espacio nativo del sujeto.
- Cálculo automático del número de vóxeles de primer plano segmentados.
- Estimación del volumen del plexo coroide en milímetros cúbicos.
- Inferencia por ensamble de cinco modelos para robustecer la predicción frente a falsos positivos y variabilidad entre escáneres.
- Ejecución local reproducible con versiones fijadas de PyTorch (1.13.1), MONAI (1.0.1) y NumPy (1.23.5).
- No soporta tool calling, agentes, razonamiento multi-paso, texto, visión general ni audio: su alcance es exclusivamente la segmentación de imagen médica.

## Casos de uso

- Volumetría del plexo coroide en estudios de neuroimagen: el modelo genera una máscara binaria y el volumen en mm³, lo que permite cuantificar esta estructura en cohortes amplias sin anotación manual.
- Investigación en envejecimiento y neurodegeneración: la cuantificación automatizada del ChP facilita análisis correlacionales con variables clínicas y cognitivas en estudios longitudinales.
- Procesamiento por lotes de cohortes multi-centro: al aceptar NIfTI T1 estándar y ejecutarse localmente, puede integrarse en pipelines que recorran cientos de sujetos de distintos escáneres.
- Reproducibilidad de estudios: los pesos publicados y las versiones de software fijadas permiten replicar resultados de segmentación en otros laboratorios.
- Generación de features para modelos posteriores: las máscaras y volúmenes sirven como entrada a clasificadores o análisis estadísticos de neuroimagen.
- Validación y control de calidad: la comparación entre la salida del ensamble y anotaciones manuales permite auditar pipelines de segmentación existentes.
- Docencia y prototipado en imagen médica: el script de inferencia y las configuraciones MONAI sirven como ejemplo funcional de ensamble 3D con DynUNet y UNETR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de Dice, Jaccard ni comparaciones cuantitativas con otros métodos. Tampoco se proporcionan tiempos de inferencia medidos: la estimación de 2-10 minutos por escaneo en una NVIDIA RTX A6000 se indica explícitamente como provisional y no medida.

## Requisitos de hardware

- GPU NVIDIA compatible con CUDA obligatoria; la inferencia en CPU no está soportada ni validada.
- GPU de referencia probada: NVIDIA RTX A6000 con 48 GB de VRAM.
- Los cinco modelos se ejecutan secuencialmente para reducir el uso simultáneo de memoria; no se especifica la VRAM mínima real necesaria.
- Entorno validado: Linux, Python 3.9, PyTorch 1.13.1+cu117, MONAI 1.0.1, NumPy 1.23.5, y el paquete `einops` (requerido por UNETR).
- Espacio en disco: aproximadamente 770 MB de checkpoints más dependencias.
- Tiempo de inferencia estimado: 2-10 minutos por MRI en RTX A6000 (estimación provisional, no benchmark); la primera ejecución puede ser más lenta por carga de checkpoints.
- Opciones de despliegue: script `run_inference.py` incluido en el repositorio; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ASCHOPLEX COMPASS-ND (este) | Ensamble 3 x DynUNet + 2 x UNETR | MRI T1 3D NIfTI | Apache 2.0 | Pesos en HF | Afinado sobre COMPASS-ND |
| ASCHOPLEX original (FAIR-Unipd) | Ensamble DynUNet/UNETR | MRI T1 3D | no disponible en la información | Repositorio GitHub | Modelo base del que deriva este ajuste |
| Otros segmentadores de ChP | no disponible | no disponible | no disponible | no disponible | No se dispone de comparativas publicadas en la información |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Uso previsto exclusivamente de investigación; no se indica validación clínica ni certificación como dispositivo médico.
- Requiere GPU NVIDIA con CUDA; no hay soporte validado para CPU.
- Dependencia de versiones concretas de PyTorch y MONAI; entornos más recientes pueden requerir ajustes.
- Riesgo de fallo silencioso si los checkpoints se descargan como punteros Git LFS (archivos de ~133-134 bytes); es necesario usar `hf download` o `git lfs pull`.
- El rendimiento puede degradarse en MRI con protocolos, resoluciones o intensidades muy distintas a las de COMPASS-ND.
- No se documentan sesgos demográficos ni métricas de equidad entre subpoblaciones.
- No se especifican métricas de error (Dice, HD95) ni tasas de falsos positivos/negativos, lo que dificulta evaluar su fiabilidad en producción.
- El tiempo de inferencia de 2-10 minutos es una estimación provisional, no una medición reproducible.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de validación clínica desaconseja cualquier aplicación diagnóstica directa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BADHWAR-MIND-LAB/Aschoplex_compassnd_chp_finetuned
- Repositorio original ASCHOPLEX: https://github.com/FAIR-Unipd/ASCHOPLEX
- DOI asociado: https://doi.org/10.57967/hf/11733
- Documentación de MONAI: https://monai.io/
- Cohorte COMPASS-ND: no disponible en la información proporcionada.
