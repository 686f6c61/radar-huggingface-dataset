# Felix92/onnxtr-formulanet

## Resumen

Felix92/onnxtr-formulanet es un modelo de reconocimiento de fórmulas matemáticas (formula recognition) exportado a formato ONNX para su uso con la librería OnnxTR, un fork de docTR que sustituye el backend de PyTorch por ONNX Runtime. El modelo está pensado para integrarse en pipelines de OCR documental: dada una imagen recortada de una fórmula, devuelve su representación textual (típicamente LaTeX). El autor del repositorio es Felix92 y el proyecto subyacente, OnnxTR, está mantenido por Felix Dittrich.

La relevancia de este modelo radica en su formato de despliegue: al estar en ONNX y no depender de PyTorch, puede ejecutarse en entornos ligeros, en CPU con latencias razonables y en infraestructuras donde instalar frameworks de deep learning completos no es viable. El repositorio ocupa aproximadamente 0,1 GB, lo que sugiere un modelo compacto orientado a inferencia, no a entrenamiento.

La información publicada es escasa: la model card se limita a describir la tarea ("formula"), el uso mediante `formula_predictor` y los idiomas declarados (inglés y francés). No se detallan la arquitectura interna, el número de parámetros, el contexto ni los datos de entrenamiento, por lo que varios apartados de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de reconocimiento de fórmulas exportado a ONNX; arquitectura base no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | en, fr |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Tamano del repositorio | ~0,1 GB |
| Tarea | formula recognition (OCR de fórmulas matemáticas) |
| Framework de inferencia | OnnxTR (ONNX Runtime) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo en la documentación disponible. Por la naturaleza de la tarea y del ecosistema OnnxTR, se trata de un modelo de reconocimiento (reco) que consume una imagen de una fórmula y produce una secuencia de tokens, presumiblemente LaTeX, pero no se confirma el tipo de encoder/decoder, el tamaño de la imagen de entrada ni el vocabulario de salida.

Tampoco hay datos sobre el corpus de entrenamiento (número de tokens, composición del dataset, fórmulas sintéticas frente a reales), ni sobre si se aplicaron técnicas de ajuste como RLHF o DPO. El modelo se distribuye únicamente como artefacto de inferencia ONNX; no se documenta el proceso de exportación ni posibles diferencias de precisión respecto al modelo original en PyTorch.

## Capacidades

- Reconocimiento de fórmulas matemáticas a partir de imágenes recortadas, devolviendo su representación textual.
- Integración nativa con el pipeline de OnnxTR mediante `formula_predictor(arch=model)`.
- Carga desde el Hub con `from_hub('onnxtr/my-model')`, lo que permite combinarlo con detectores (`db_mobilenet_v3_large`) y reconocedores (`crnn_mobilenet_v3_small`) del mismo ecosistema.
- Ejecución sobre ONNX Runtime, sin dependencia de PyTorch en tiempo de inferencia.
- Soporte declarado de inglés y francés (aplicable a la notación y etiquetas asociadas; la salida de fórmulas es en gran medida independiente del idioma natural).
- No se documenta soporte de tool calling, function calling, agentes, visión general, audio ni modo de razonamiento extendido.

## Casos de uso

- Digitalización de artículos científicos: extraer fórmulas de PDFs escaneados y convertirlas a LaTeX para reeditarlas en entornos como LaTeX, Word o Markdown con MathJax, usando el modelo como etapa de reconocimiento tras un detector de regiones.
- Construcción de bases de datos de fórmulas: procesar corpus de documentación técnica y almacenar las fórmulas en formato estructurado para búsqueda y recuperación posterior.
- Accesibilidad de material docente: convertir apuntes y exámenes escaneados con fórmulas en texto accesible para lectores de pantalla o para su reutilización en plataformas educativas.
- Pipelines de OCR documental en producción: integrar el modelo en OnnxTR junto a detectores y clasificadores de layout para procesar lotes de documentos con ONNX Runtime, evitando el coste de desplegar PyTorch.
- Despliegue en entornos con recursos limitados: al ser un artefacto ONNX de ~0,1 GB, puede ejecutarse en CPU en servicios serverless o en dispositivos edge donde no cabe un stack completo de deep learning.
- Preprocesado para motores de búsqueda académica: extraer fórmulas de repositorios de preprints para indexarlas y permitir búsquedas por expresión matemática.
- Enriquecimiento de herramientas de toma de notas: integrar el reconocimiento de fórmulas en aplicaciones que digitalizan pizarras o cuadernos manuscritos, combinándolo con el detector del ecosistema OnnxTR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa ~0,1 GB, por lo que el modelo cabe holgadamente en cualquier GPU con al menos 1-2 GB de memoria libre, incluyendo el overhead de ONNX Runtime.
- GPU recomendadas: cualquier GPU compatible con ONNX Runtime (CUDA o TensorRT) sirve; para cargas de producción, tarjetas de gama media como T4 o RTX 3060 en adelante son suficientes dado el tamaño del artefacto.
- Compatibilidad con GPU de consumo: sí, previsiblemente en cualquier GPU de consumo moderna; también es viable en CPU.
- Opciones de despliegue: OnnxTR sobre ONNX Runtime (CPU o GPU), y exportación a otros runtimes compatibles con ONNX (por ejemplo, TensorRT u OpenVINO) si se valida la conversión.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Tarea | Formato | Idiomas | Licencia | Contexto / parametros |
|---|---|---|---|---|---|
| Felix92/onnxtr-formulanet | Reconocimiento de fórmulas | ONNX | en, fr | Apache 2.0 | no disponible |
| Modelos de formula recognition en docTR (PyTorch) | Reconocimiento de fórmulas | PyTorch | no disponible | según modelo | no disponible |
| Otros reconocedores de fórmulas del ecosistema OnnxTR | Reconocimiento de fórmulas | ONNX | según modelo | según modelo | no disponible |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas. La comparación relevante es de formato y despliegue: frente a implementaciones en PyTorch, este modelo ofrece la ventaja de ejecutarse con ONNX Runtime, a costa de no documentar su arquitectura ni sus métricas.

## Limitaciones y advertencias

- Información muy escasa: no se documentan arquitectura, parámetros, datos de entrenamiento ni métricas, lo que dificulta evaluar su calidad antes de desplegarlo.
- Riesgo de alucinación en la transcripción: como todo modelo generativo de secuencias, puede producir LaTeX sintácticamente válido pero incorrecto respecto a la fórmula de la imagen, especialmente con notación ambigua o imágenes de baja resolución.
- Idiomas declarados limitados a inglés y francés; el comportamiento con notación o convenciones de otros contextos no está documentado.
- Sin datos sobre sesgos; al tratar fórmulas matemáticas el riesgo de sesgo social es bajo, pero puede heredar sesgos de su corpus de entrenamiento en cuanto a estilos de notación.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene conservar los avisos de licencia y verificar las licencias de los componentes del ecosistema OnnxTR que se combinen con el modelo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad; úsese con cautela en producción.
- No se especifican requisitos de preprocesado de imagen (resolución, recorte, binarización); habrá que ajustarlos empíricamente con el pipeline de OnnxTR.
- El identificador de ejemplo de la model card (`from_hub('onnxtr/my-model')`) es genérico y no corresponde al ID real del repositorio; debe sustituirse por el identificador correcto al cargarlo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Felix92/onnxtr-formulanet
- Repositorio OnnxTR en GitHub: https://github.com/felixdittrich92/OnnxTR
- Documentación de OnnxTR: https://github.com/felixdittrich92/OnnxTR (README del proyecto)
- Proyecto docTR (base del ecosistema): https://github.com/mindee/doctr
