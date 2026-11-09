# APLUX-Agora/FFNet-40S

## Resumen

FFNet-40S es un modelo de segmentación de imágenes publicado por APLUX-Agora dentro de su plataforma Agora, orientada al despliegue de modelos de IA en placas con SoC Qualcomm para escenarios AIoT. El repositorio no contiene los pesos originales en formato estándar de PyTorch, sino recursos ya convertidos y empaquetados por plataforma (`targets/<SoC>/`), con binarios QNN (`model.bin`) listos para ejecutarse en hardware Qualcomm. La tarea declarada es `image-segmentation`, con una entrada de imagen y una salida de máscaras.

El modelo se distribuye con variantes de precisión cuantizada (FP16, W8A16 y W8A8) y con medidas de latencia realizadas por el propio autor en dos placas concretas: QCS6490 (Rhino Pi A1) y QCS8550 (Rhino Pi X1). Las cifras publicadas son de 10,6 ms en QCS6490 con precisión por defecto y 4,9 ms en QCS8550, lo que sitúa al modelo en el rango de inferencia en tiempo real para segmentación en el borde.

La relevancia de esta ficha es acotada: se trata de un artefacto de despliegue para un ecosistema propietario (Agora / Model Farm), no de un modelo abierto con pesos entrenados publicados de forma convencional. La información disponible no incluye detalles de arquitectura, número de parámetros, datos de entrenamiento ni resultados de benchmarks de calidad de segmentación, por lo que muchos campos de esta ficha quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre FFNet-40S sugiere una red de segmentación tipo FFNet, sin confirmar) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen) |
| Tipos de cuantizacion | FP16, W8A16, W8A8 (según placa) |
| Idiomas soportados | no disponible (no aplica a la tarea de segmentación) |
| Licencia | APLUX Model Farm License (`license: other`, `license_name: aplux-model-farm`) |
| Formato de pesos | binarios QNN (`model.bin`) empaquetados por SoC; `model.json` con precisión por defecto y rutas de variantes |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, el número de parámetros ni el proceso de entrenamiento del modelo original. El repositorio únicamente documenta los artefactos de despliegue: por cada SoC objetivo (`targets/<SoC>/`) se incluye un `model.json` que declara la precisión por defecto y las rutas de cada variante, junto con un directorio por precisión que contiene los binarios QNN. Los paquetes multi-fichero se mantienen tal y como los publica Model Farm.

La innovación técnica relevante no está en el modelo en sí, sino en el pipeline de conversión y validación: el autor indica que el modelo se preprocesa y se parsea siguiendo el ejemplo oficial de Model Farm y se valida placa a placa. Las variantes W8A16 y W8A8 implican cuantización de pesos (y activaciones en el caso W8A8) para ejecución en la NPU/Hexagon de los SoC Qualcomm. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación como RLHF o DPO.

## Capacidades

- Segmentación de imágenes: entrada `image`, salida `masks`, según la pipeline declarada (`image-segmentation`).
- Ejecución en hardware Qualcomm: recursos preparados para QCS6490 (Rhino Pi A1) y QCS8550 (Rhino Pi X1).
- Soporte de cuantización: variantes FP16, W8A16 y W8A8 según la placa objetivo.
- Despliegue en el borde (AIoT): latencias medidas de 10,6 ms y 4,9 ms en las placas indicadas.
- Integración con la plataforma Agora: posibilidad de exportar proyectos y workflows que usan el modelo, y guía de despliegue en la propia plataforma.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes, multilingüismo, visión general, audio ni modo de razonamiento extendido.

## Casos de uso

- Segmentación en tiempo real en cámaras AIoT: con latencias de 4,9 ms en QCS8550, el modelo puede procesar flujos de vídeo a decenas de fotogramas por segundo en la propia placa, sin enviar imágenes a la nube.
- Control de calidad industrial en línea: segmentar productos o defectos sobre la cinta de producción usando una placa QCS6490 integrada en la línea, con la variante W8A8 para minimizar el consumo.
- Segmentación semántica en robótica de bajo consumo: integrar la máscara resultante como entrada de un pipeline de navegación o manipulación que corra en el mismo SoC, aprovechando que el modelo ya está empaquetado para QNN.
- Preprocesado para analítica de vídeo en el borde: generar máscaras que alimenten etapas posteriores (conteo, seguimiento, detección de ocupación) en despliegues de ciudades o edificios inteligentes.
- Prototipado rápido sin hardware: el autor ofrece una demo online en Agora para probar el modelo sin disponer de una placa Qualcomm, útil para evaluar la idoneidad antes de comprar hardware.
- Despliegue reproducible en flotas de dispositivos: al distribuir binarios por SoC con `model.json` y sumas de verificación (`SHA256SUMS`), facilita la gestión de versiones y la verificación de integridad en parques de dispositivos homogéneos.
- Evaluación comparativa de precisión en placa: permite medir el impacto de FP16 frente a W8A16 y W8A8 sobre el mismo modelo y placa, útil para decidir el compromiso latencia/precisión en producción.

## Benchmarks y rendimiento

Los únicos datos publicados son medidas de latencia por placa y precisión realizadas por el autor en Agora:

| SoC · placa | Precisiones soportadas | Latencia (precisión por defecto) |
|---|---|---|
| QCS6490 · Rhino Pi A1 | W8A16, W8A8 | 10,6 ms |
| QCS8550 · Rhino Pi X1 | FP16, W8A16, W8A8 | 4,9 ms |

No se han publicado resultados de benchmarks de calidad de segmentación (mIoU, Dice, etc.) ni comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Hardware objetivo: SoC Qualcomm QCS6490 (placa Rhino Pi A1) y QCS8550 (placa Rhino Pi X1); no se documenta soporte para GPU de servidor ni para GPU de consumo.
- VRAM estimada: no disponible; el despliegue es sobre NPU/DSP integrada en el SoC, no sobre memoria de GPU discreta.
- GPU recomendadas: no aplica; el formato de pesos es QNN, específico de Qualcomm.
- Compatibilidad con GPU de consumo: no disponible; no se indica que existan artefactos para CUDA, ROCm o Metal.
- Opciones de despliegue: runtime QNN a través de la plataforma Agora; descarga selectiva por SoC con `hf download --include "targets/$AGORA_SOC/*"`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de segmentación empaquetado para QNN).
- Latencia: 10,6 ms en QCS6490 y 4,9 ms en QCS8550 con la precisión por defecto. Throughput no publicado de forma explícita; a partir de la latencia, el límite teórico sería de aproximadamente 94 y 204 inferencias por segundo respectivamente, sin contabilizar preprocesado ni postprocesado.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de calidad que permitan una comparación rigurosa. Como referencia cualitativa, el modelo se posiciona en la categoría de segmentación ligera para el borde, pero no se dispone de parámetros, contexto ni métricas de precisión de este modelo ni de alternativas para construir una tabla comparativa fiable.

## Limitaciones y advertencias

- Información técnica muy escasa: no se publican arquitectura, parámetros, datos de entrenamiento ni métricas de calidad de segmentación, lo que impide evaluar su idoneidad frente a alternativas.
- Dependencia de hardware: los artefactos son binarios QNN para SoC Qualcomm concretos; no hay pesos en safetensors ni GGUF y no se puede ejecutar en GPU estándar sin una conversión adicional no documentada.
- Licencia restrictiva: la licencia APLUX Model Farm License (`license: other`) debe revisarse antes de cualquier uso comercial; además, la licencia del modelo fuente original queda a criterio de sus términos, que no se detallan en el repositorio.
- Trazabilidad limitada del modelo original: el repositorio no identifica explícitamente el modelo fuente ni su procedencia más allá de la referencia genérica a Model Farm.
- Riesgo de sesgos y alucinación: no evaluable con la información disponible; al ser un modelo de segmentación, el riesgo relevante es de errores de máscara en dominios no representados en su entrenamiento, no de alucinación textual.
- Métricas de latencia sin contexto de calidad: las cifras de 10,6 ms y 4,9 ms no van acompañadas de la precisión obtenida, por lo que no permiten valorar el compromiso latencia/calidad.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, con creación y actualización en la misma fecha; conviene tratarlo como un artefacto recién publicado y poco validado por la comunidad.
- Sin soporte multilingüe ni de texto: no es un modelo de lenguaje y no debe evaluarse con los criterios habituales de LLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/APLUX-Agora/FFNet-40S
- Demo online en Agora: https://mega.aidlux.com/models/ffnet-40s
- Plataforma Agora: https://mega.aidlux.com
- Licencia APLUX Model Farm: https://huggingface.co/APLUX-Agora/FFNet-40S/blob/main/LICENSE_MODEL_FARM.pdf
