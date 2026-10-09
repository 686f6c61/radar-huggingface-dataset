# kasatoko/cadc-models

## Resumen

CADC lung nodule classifiers es un conjunto de pesos de visión artificial médica publicado en Hugging Face por el usuario kasatoko, orientado a la clasificación de nódulos pulmonares en tomografía computarizada (CT). No es un modelo de lenguaje ni un modelo generativo: se trata de un ensemble de diez clasificadores convolucionales entrenados para reproducir las valoraciones de sospecha de radiólogos sobre parches centrados en nódulos, no para diagnosticar cáncer confirmado.

El ensemble combina cinco folds de una 3D ResNet y cinco folds de una ResNet18 multi-vista 2.5D, y la inferencia promedia las diez puntuaciones sigmoidales. La entrada es un array NumPy de (64, 64, 64) en unidades Hounsfield, reescalado a 1 mm isotrópico, indexado como (z, y, x); el repositorio incluye código de inferencia y definiciones de arquitectura, pero no localiza nódulos en un volumen CT.

Su relevancia es doble. Por un lado, publica pesos entrenados sobre LIDC-IDRI con evaluación out-of-fold documentada (AUC 0,936; IC 95 % 0,921-0,949). Por otro, es un ejemplo explícito de modelo de investigación sin validación clínica ni licencia declarada, útil como material de referencia y como advertencia sobre los límites de trasladar resultados de benchmarks retrospectivos a decisiones asistenciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de 10 clasificadores: 5 folds de una 3D ResNet y 5 folds de una ResNet18 multi-vista 2.5D |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la entrada es un parche fijo de (64, 64, 64) vóxeles en unidades Hounsfield) |
| Tipos de cuantizacion | no disponible (no se documentan versiones cuantizadas) |
| Idiomas soportados | en (segun los metadatos del repositorio) |
| Licencia | no disponible; el proyecto de origen no declara licencia de código ni de pesos y esta exportación no asigna ninguna nueva |
| Formato de pesos | PyTorch (checkpoints `final.pt`); `manifest.json` con tamaños y hashes SHA-256 |
| Tamano del repositorio | 0,4 GB |
| Entrada | Array NumPy (64, 64, 64), orden (z, y, x), 1 mm isotrópico, recorte a [-1000, 400] HU, cubo central de 48 vóxeles, intensidades escaladas a [0, 1] |
| Salida | Puntuación de sospecha del ensemble más las diez puntuaciones individuales |
| Dataset de entrenamiento | LIDC-IDRI (ratings de radiólogos; rating medio <= 2,5 benigno, >= 3,5 maligno, casos ambiguos excluidos) |

## Arquitectura y entrenamiento

El sistema es un ensemble heterogéneo de diez clasificadores binarios. Cinco de ellos son una 3D ResNet que procesa el parche volumétrico completo, y los otros cinco son una ResNet18 multi-vista 2.5D, con el backbone inicializado con pesos ImageNet de torchvision. La inferencia suma las diez salidas sigmoidales y las promedia, devolviendo también los votos individuales, lo que permite inspeccionar la dispersión entre submodelos. El repositorio distribuye únicamente los checkpoints de la última época (`runs/baseline/fold*/final.pt` y `runs/multiview/fold*/final.pt`), las definiciones de arquitectura en `cadc/model.py`, el cargador y la inferencia en `inference.py`.

El entrenamiento parte de LIDC-IDRI, usando las valoraciones de radiólogos como etiqueta: rating medio menor o igual a 2,5 se etiqueta como benigno y mayor o igual a 3,5 como maligno, descartando los casos ambiguos. Los cinco folds se dividieron por paciente, no por nódulo, para evitar fuga de información. La evaluación out-of-fold reportada en el proyecto de origen usa únicamente los modelos de fold que no vieron a cada paciente, y no el ensemble completo de diez modelos sobre esos mismos pacientes; el autor advierte además que los resultados sobre escaneos de entrenamiento son optimistas. No se documenta en la información disponible ningún tipo de ajuste por RLHF, DPO ni decodificación especulativa, ya que no se trata de un modelo generativo.

## Capacidades

- Clasificación binaria de sospecha de nódulos pulmonares a partir de un parche CT previamente localizado.
- Salida de una puntuación agregada de ensemble junto con las diez puntuaciones individuales, lo que permite analizar acuerdo y desacuerdo entre submodelos.
- Extracción de características volumétricas 3D mediante la rama 3D ResNet y de patrones multi-vista mediante la rama 2.5D.
- Inferencia en CPU o GPU, seleccionable con el parámetro `device` de `load_ensemble` y `predict_patch`.
- Integración con el proyecto de origen para el preprocesado de parches mediante `cadc.preprocess.extract_patch`.
- No realiza detección ni localización de nódulos: requiere que el parche de entrada ya esté centrado en un nódulo.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades de agente, visión general, audio ni modo de pensamiento.

## Casos de uso

- Reproducción de resultados en investigación: cargar los diez checkpoints con `load_ensemble` y ejecutar `predict_patch` sobre parches de LIDC-IDRI para replicar la AUC out-of-fold reportada de 0,936 en 1.627 nódulos de 724 pacientes.
- Baseline en estudios comparativos de CAD pulmonar: usar el ensemble como referencia sobre la que medir mejoras de nuevas arquitecturas bajo el mismo protocolo de evaluación por paciente.
- Análisis de incertidumbre entre submodelos: explotar los diez votos individuales para estudiar la varianza del ensemble en nódulos limítrofes y su relación con los casos ambiguos excluidos del entrenamiento.
- Preanotación en cohortes retrospectivas de investigación: aplicar el modelo con `extract_patch` sobre volúmenes LIDC-IDRI para generar puntuaciones que prioricen la revisión manual por parte de radiólogos, siempre en contexto de estudio y nunca como guía clínica.
- Demostración docente en cursos de deep learning médico: el repositorio incluye el Space interactivo `kasatoko/cadc` y código mínimo de inferencia, lo que facilita ejemplos reproducibles de preprocesado en unidades Hounsfield y ensembles.
- Transfer learning hacia tareas de imagen médica 3D: los pesos de la rama 2.5D, inicializados con ImageNet, pueden servir como punto de partida para clasificadores de otras patologías torácicas, con la salvedad de que no hay licencia declarada.
- Auditoría metodológica y de calibración: comparar la AUC de 0,680 obtenida en los 118 pacientes con diagnóstico confirmado registrado frente a la AUC de 0,765 de los radiólogos para analizar la brecha entre métricas retrospectivas y desenlaces confirmados.

## Benchmarks y rendimiento

| Evaluacion | Conjunto de datos | AUC | IC 95 % | Fuente |
|---|---|---|---|---|
| Out-of-fold, solo folds que no entrenaron con cada paciente | 1.627 nódulos de 724 pacientes (LIDC-IDRI) | 0,936 | 0,921-0,949 | proyecto de origen (`runs/`) |
| Ensemble evaluado en 118 pacientes con diagnóstico confirmado registrado | Subconjunto de LIDC, no validación externa independiente | 0,680 | 0,547-0,796 | model card |
| Radiólogos en la misma tarea | 118 pacientes con diagnóstico confirmado registrado | 0,765 | no disponible | model card |

No se aportan resultados de MMLU, HumanEval, GSM8K ni de ningún benchmark de lenguaje, porque el modelo no es un modelo de lenguaje. Los archivos de evaluación agregados están incluidos bajo `runs/`. El autor advierte que el subconjunto de 118 pacientes es parte de LIDC y no una validación externa, y que los resultados sobre escaneos de entrenamiento son optimistas.

## Requisitos de hardware

- El repositorio completo ocupa 0,4 GB, lo que implica aproximadamente 40 MB por checkpoint si se reparte de forma uniforme entre los diez archivos; no hay medición oficial de VRAM en la información disponible.
- El código de inferencia admite explícitamente CPU (`device="cpu"`) y GPU (`device="cuda"`), por lo que no requiere acelerador para funcionar.
- GPU recomendadas: no disponible. No se documentan pruebas en A100, H100, RTX 4090 ni en ninguna otra tarjeta.
- Encaje en GPU de consumo: no disponible como dato declarado; dado el tamaño reducido de los checkpoints y el recorte central a 48 vóxeles, la ruta de CPU descrita por el autor es viable sin GPU dedicada.
- Opciones de despliegue: inferencia local con PyTorch mediante `hf download kasatoko/cadc-models --local-dir cadc-models` e `inference.py`; el Space `kasatoko/cadc` ofrece inferencia interactiva en línea. El autor aclara que subir los pesos al repositorio no aprovisiona un endpoint de inferencia dedicado.
- Formatos de servido tipo vLLM, llama.cpp, Ollama o TGI no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible. No se publican mediciones.

## Comparativa con modelos similares

No se han publicado en la información disponible datos comparativos frente a otros clasificadores de nódulos pulmonares (por ejemplo, detectores MONAI u otras arquitecturas CAD de la literatura). La model card menciona la existencia de un detector MONAI distribuido por separado, pero no ofrece cifras de comparación con él ni con alternativas de la misma categoría. En consecuencia, la comparativa se marca como no disponible en cuanto a parámetros, contexto, rendimiento y licencia.

| Modelo | Parametros | Contexto o entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kasatoko/cadc-models | no disponible | Parche (64, 64, 64) HU | AUC 0,936 out-of-fold; AUC 0,680 en 118 pacientes confirmados | no disponible | Pesos y código de inferencia en Hugging Face |
| Alternativas CAD comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo para investigación: el modelo no está validado clínicamente y no es un producto sanitario.
- Predice la valoración de sospecha de los radiólogos, no cáncer confirmado; las puntuaciones no son probabilidades calibradas de cáncer y no deben guiar decisiones asistenciales.
- La AUC cae de 0,936 en la evaluación out-of-fold a 0,680 en los 118 pacientes con diagnóstico confirmado registrado, por debajo de la AUC de 0,765 de los radiólogos en ese mismo subconjunto.
- Ese subconjunto de 118 pacientes procede de LIDC y no constituye una validación externa independiente, por lo que la generalización a otras instituciones y equipos no está demostrada.
- Los casos ambiguos (rating medio entre 2,5 y 3,5) se excluyeron del entrenamiento, lo que introduce un desplazamiento de distribución frente a datos reales con nódulos indeterminados.
- Riesgo de sobreajuste a la cohorte LIDC-IDRI y de resultados optimistas en escaneos de entrenamiento, tal y como advierte el propio autor.
- El modelo no localiza nódulos; depende de que el parche de entrada ya esté centrado en la lesión y correctamente preprocesado a 1 mm isotrópico con recorte a [-1000, 400] HU y cubo central de 48 vóxeles.
- No hay licencia declarada para el código ni para los pesos, ni en el proyecto de origen ni en esta exportación, lo que genera incertidumbre legal para cualquier uso comercial.
- El repositorio no incluye volúmenes de entrenamiento, predicciones a nivel de paciente, estados del optimizador, claves de API ni el detector MONAI distribuido por separado, lo que limita la reproducibilidad completa.
- Sesgos demográficos o institucionales específicos: no disponible en la información proporcionada.
- Idiomas soportados: únicamente inglés en los metadatos; no es un modelo multilingüe.
- El uso de LIDC-IDRI está sujeto a CC BY 3.0 de The Cancer Imaging Archive, con la cita obligatoria de Armato SG III et al., Medical Physics 38(2):915-931, 2011.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kasatoko/cadc-models
- Space de inferencia interactiva: https://huggingface.co/spaces/kasatoko/cadc
- Proyecto de origen en GitHub: https://github.com/Dhir-learner/CAD-C
- Referencia del dataset LIDC-IDRI: Armato SG III et al., Medical Physics 38(2):915-931, 2011 (The Cancer Imaging Archive, CC BY 3.0)
- Paper, blog o demo adicionales: no disponible
