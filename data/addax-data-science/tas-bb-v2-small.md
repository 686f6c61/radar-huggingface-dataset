# Addax-Data-Science/TAS-BB-v2-small

## Resumen

TAS-BB-v2-small es un modelo redistribuido por Addax Data Science dentro del ecosistema AddaxAI, una plataforma orientada al análisis automatizado de imágenes y datos de biodiversidad. El repositorio no contiene una model card técnica propia: la información publicada se limita a un aviso de redistribución que remite al model zoo de AddaxAI para consultar propietario original, licencia, citación y enlaces. Por tanto, los detalles de arquitectura, entrenamiento y capacidades no están documentados en la información disponible.

El dato objetivo más relevante es el tamaño: 18.891.712 parámetros en formato safetensors, lo que sitúa al modelo en la franja de modelos pequeños (del orden de decenas de millones de parámetros). El repositorio ocupa 0,1 GB, coherente con pesos en precisión estándar para ese número de parámetros. No se especifica el pipeline, los idiomas soportados ni la licencia efectiva, más allá de la mención genérica a que cada modelo conserva su licencia original.

Su relevancia actual es limitada fuera del contexto de AddaxAI: se trata de un artefacto de integración para una herramienta concreta, no de un modelo de propósito general con documentación pública verificable. Cualquier evaluación técnica rigurosa requiere consultar la ficha del model zoo de AddaxAI y los ficheros de licencia incluidos en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 18.891.712 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor indica que cada modelo conserva su licencia original; consultar ficheros de licencia del repo) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la documentación disponible. El único dato estructural verificable es el recuento de parámetros (18.891.712) obtenido de los tensores en safetensors, que confirma un modelo compacto. No se indica si se trata de un transformer, una CNN, un modelo híbrido o una arquitectura específica para visión, aunque el contexto de AddaxAI (análisis de imágenes de fauna y datos de biodiversidad) sugiere un posible uso en tareas de clasificación o detección sobre imágenes, extremo que no puede confirmarse con la información proporcionada.

Tampoco hay datos sobre volumen de tokens de entrenamiento, composición del dataset, técnicas de alineación (RLHF, DPO) ni innovaciones técnicas como decodificación especulativa o atención lineal. El repositorio es una redistribución: el autor original del modelo, su proceso de entrenamiento y sus métricas de evaluación deben consultarse en el model zoo de AddaxAI.

## Capacidades

- No se documentan capacidades específicas en la información disponible.
- No se confirma soporte de generación de texto, razonamiento, código ni matemáticas.
- No se confirma soporte de visión, audio ni otras modalidades, pese al contexto de la plataforma AddaxAI.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni razonamiento multi-paso.
- No se confirman capacidades multilingües ni idiomas cubiertos.
- No se confirma la existencia de modo thinking u otras variantes de inferencia.

## Casos de uso

- Integración en AddaxAI: el caso de uso explícito del repositorio es servir como componente listo para usar dentro de la plataforma AddaxAI; se distribuye empaquetado para evitar al usuario la descarga y configuración manual de pesos y licencias.
- Análisis de datos de biodiversidad (hipotético, no confirmado): dado el dominio declarado del proyecto, podría emplearse en tareas de procesamiento de imágenes o datos ecológicos, pero no hay documentación que lo verifique.
- Evaluación comparativa de modelos pequeños: con 18,9 M de parámetros y pesos safetensors, es un candidato manejable para experimentos de ajuste fino o benchmarking en entornos con recursos limitados, siempre que se aclare antes la licencia.
- Prototipado en local: su tamaño reducido permite cargarlo en CPU o GPU de gama baja para pruebas de integración, aunque se desconoce la tarea para la que fue entrenado.
- Auditoría de licencias y trazabilidad: útil como caso de estudio de redistribución de modelos de terceros, ya que obliga a revisar los ficheros de licencia y la atribución original antes de cualquier uso.
- Pipeline de investigación reproducible: al estar en safetensors y con un tamaño fijo documentado, puede incorporarse a entornos de CI para verificar carga de pesos, sin garantías sobre calidad de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 18,9 M de parámetros, los pesos en fp32 ocupan aproximadamente 75 MB; en fp16, unos 38 MB; en int8, unos 19 MB. Estas cifras son estimaciones a partir del recuento de parámetros, no datos publicados.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente para los pesos; no se dispone de datos de latencia ni throughput.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: al ser safetensors, requiere un framework de inferencia compatible (PyTorch, Transformers si la arquitectura es compatible); no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica la tarea del modelo ni modelos comparables de la misma categoría, por lo que no es posible establecer una comparativa rigurosa de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Ausencia de model card técnica: no hay información sobre arquitectura, entrenamiento, datos ni evaluación, lo que impide validar su comportamiento en producción.
- Licencia no especificada en la ficha: el autor remite a los ficheros de licencia del repositorio y al model zoo; es obligatorio revisarlos antes de cualquier uso comercial.
- Riesgo de alucinación y sesgos: no evaluable sin documentación ni benchmarks.
- Idiomas y contexto: desconocidos; no debe asumirse soporte multilingüe ni una ventana de contexto concreta.
- Redistribución de terceros: el repositorio no es el origen del modelo; la atribución y las condiciones originales pueden cambiar fuera de este espacio.
- Fecha de creación futura (2026-11-26): conviene verificar la vigencia y procedencia del artefacto antes de integrarlo en un pipeline.
- Sin descargas ni likes: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Addax-Data-Science/TAS-BB-v2-small
- AddaxAI: https://addaxdatascience.com/addaxai/
- Model zoo de AddaxAI (propietario, licencia, citación y enlaces del modelo original): https://docs.addaxai.com/docs/reference/model-zoo
