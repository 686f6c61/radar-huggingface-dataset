# JinLab-Westlake/Morphi-DoANet

## Resumen

`JinLab-Westlake/Morphi-DoANet` es un repositorio de modelos alojado en Hugging Face por la organización JinLab-Westlake (Westlake University), publicado bajo licencia Apache 2.0 y etiquetado con `region:us`. En el momento de la consulta el repositorio registra 0 descargas y 0 likes, la model card está vacía (únicamente el bloque de licencia) y no se declara `pipeline_tag`, idiomas ni formato de pesos. La fecha de creación y de última actualización coincide (2026-10-29), lo que sugiere una subida única sin revisiones posteriores.

El nombre del repositorio apunta a dos referencias que aparecen en la búsqueda web, pero ninguna de ellas puede confirmarse como origen de estos pesos: por un lado, el preprint de bioRxiv que describe "Morphi", un marco de IA que infiere viabilidad y estado fenotípico de organoides directamente a partir de microscopía de campo claro sin marcaje, usando señales de fluorescencia como supervisión débil para entrenar un modelo de viabilidad a nivel de píxel; por otro, el repositorio `sharathadavanne/doa-net`, que implementa una arquitectura DOAnet para localización de dirección de llegada (direction of arrival) de eventos sonoros, un dominio completamente distinto. La relación entre ambos nombres y el modelo publicado no está documentada en la información disponible.

Por tanto, esta ficha no puede describir arquitectura, tamaño, contexto ni rendimiento: no hay datos publicados. Lo relevante ahora es señalar que se trata de un artefacto sin documentación ni evaluaciones, no apto para producción sin una auditoría previa de los ficheros de pesos y de su procedencia. El interés potencial, si la asociación con Morphi se confirma, estaría en el análisis de imágenes de organoides sin tinción; el interés práctico inmediato es limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (sin evidencia de que sea MoE) |
| Longitud de contexto | no disponible (no hay evidencia de que sea un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible |

Otros metadatos disponibles: identificador `JinLab-Westlake/Morphi-DoANet`, autor `JinLab-Westlake`, etiqueta de región `us`, 0 descargas, 0 likes, sin `pipeline_tag`, creado y actualizado el 2026-10-29.

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura en los materiales disponibles. La model card no contiene descripción técnica, y no se ha facilitado el listado de ficheros del repositorio, por lo que no se puede determinar si los pesos corresponden a un transformer, una CNN de segmentación, un modelo híbrido o cualquier otra familia. Tampoco hay datos sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas (atención lineal, decodificación especulativa, etc.). Cualquier afirmación al respecto sería especulativa.

Como contexto externo no verificado, el preprint de bioRxiv sobre Morphi describe un marco que entrena un modelo de viabilidad a nivel de píxel usando señales de fluorescencia como supervisión débil, evitando la anotación manual densa, y que opera sobre imágenes de campo claro. Si `Morphi-DoANet` fuese el componente de red de ese marco, cabría esperar una arquitectura de segmentación o regresión densa orientada a imágenes microscópicas; sin embargo, esta asociación es una hipótesis basada en la coincidencia de nombre y no está confirmada por el autor del repositorio.

## Capacidades

- No hay capacidades documentadas para este repositorio: la model card está vacía y no se declara tarea en Hugging Face.
- No hay evidencia de que sea un modelo de lenguaje: no se declara generación de texto, razonamiento, código ni matemáticas.
- No hay evidencia de soporte de tool calling, function calling ni uso como agente.
- No hay información sobre capacidades multilingües; el campo de idiomas está vacío.
- No se declara soporte de visión, audio, thinking mode ni modalidad alguna, pese a que el nombre sugiera un componente de red.
- Si se confirma la relación con el marco Morphi descrito en bioRxiv, las capacidades potenciales serían: inferencia de viabilidad de organoides a nivel de píxel a partir de microscopía de campo claro, y estimación del estado fenotípico sin tinción fluorescente. Estas capacidades corresponden al marco descrito en el preprint, no a estos pesos concretos, y no están verificadas.

## Casos de uso

Los siguientes escenarios son condicionales: solo tendrían sentido si los pesos resultan ser un modelo de análisis de imagen de organoides y si su rendimiento se valida. Se indican como hipótesis de aplicación, no como usos confirmados.

- Control de calidad en cultivo de organoides: el modelo podría puntuar la viabilidad de cada organoide a partir de una imagen de campo claro tomada con un microscopio convencional, sustituyendo la tinción de viabilidad en lecturas rutinarias y reduciendo coste y manipulación de la muestra.
- Cribado de fármacos en placa multipocillo: integrado en un pipeline de adquisición de imagen, permitiría generar una lectura fenotípica por pocillo sin reactivos fluorescentes, lo que simplifica la logística de ensayos a gran escala y evita el fotoblanqueo asociado a la fluorescencia.
- Seguimiento longitudinal del mismo organoide: al no requerir tinción letal, el modelo permitiría medir evolución de viabilidad en el tiempo sobre la misma muestra, algo imposible con métodos que consumen el especimen.
- Análisis retrospectivo de imágenes de archivo: aplicable a conjuntos de campo claro ya existentes, sin necesidad de repetir experimentos, para reetiquetar o reclasificar muestras históricas.
- Prefiltrado en experimentos con presupuesto limitado: usar la predicción de viabilidad como criterio para seleccionar qué pocillos merecen tinción confirmatoria, reduciendo el número de reactivos empleados.
- Docencia y validación metodológica: servir como referencia reproducible en cursos o estudios de comparación de métodos de análisis de imagen biomédica, siempre que se publiquen métricas y datos de entrenamiento que hoy no existen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al no conocerse el tamaño del modelo ni el formato de los pesos, no es posible estimar memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no se puede confirmar ni descartar.
- Opciones de despliegue: no disponible. No hay evidencia de que el repositorio contenga pesos en formato GGUF o safetensors, por lo que no se puede afirmar compatibilidad con llama.cpp, Ollama, vLLM o TGI. Si los pesos resultasen ser un modelo de visión en PyTorch, las vías habituales serían PyTorch nativo, TorchScript u ONNX Runtime, pero esto es una hipótesis sin confirmar.
- Latencia y throughput: no disponible.

Recomendación operativa: antes de planificar hardware, inspeccionar el listado de ficheros del repositorio (tamaño y extensión de los pesos) y la existencia de código de inferencia. Sin esos datos cualquier estimación de VRAM sería inventada.

## Comparativa con modelos similares

No es posible establecer una comparativa rigurosa: no se conocen parámetros, contexto, rendimiento ni licencia de los artefactos con los que se compararía, y el propio modelo carece de métricas publicadas.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Morphi-DoANet | no disponible | no disponible | sin benchmarks publicados | apache-2.0 | Hugging Face, 0 descargas |
| Morphi (marco descrito en bioRxiv) | no disponible en la información proporcionada | no aplica | no disponible | no disponible | preprint bioRxiv |
| MogaNet (Westlake-AI) | no disponible en la información proporcionada | no aplica | no disponible | no disponible | repositorio GitHub |
| DOA-Net (sharathadavanne) | no disponible en la información proporcionada | no aplica | no disponible | no disponible | repositorio GitHub |

Advertencia: MogaNet (ConvNets eficientes, ICLR 2024, misma universidad) y DOA-Net (localización de fuente sonora) se incluyen solo porque aparecen en la búsqueda web y comparten nombre o afiliación; no hay ninguna evidencia de que sean alternativas funcionales a este modelo ni de que el repositorio derive de ellos.

## Limitaciones y advertencias

- Model card vacía: no se declara uso previsto, datos de entrenamiento, limitaciones ni sesgos conocidos. Un artefacto sin documentación no debería desplegarse en producción.
- Procedencia no verificada: la relación con el preprint de Morphi y con los repositorios DOA-Net o MogaNet es una inferencia por coincidencia de nombre, no un dato confirmado. Existe riesgo real de que el nombre agrupe conceptos distintos.
- Imposibilidad de evaluar: sin métricas, sin ejemplos de entrada/salida y sin código de inferencia, no se puede medir fiabilidad ni comparar con alternativas.
- Riesgo de alucinación: no aplica en el sentido de modelos generativos de texto, pero sí existe riesgo de predicciones espurias si el modelo se aplica fuera de la distribución de imágenes con la que se entrenó (otro tipo de microscopio, otro tipo de organoide, otros aumentos).
- Sesgos: desconocidos. Si el entrenamiento se hizo con un tipo celular, una modalidad de microscopía o un protocolo de laboratorio concreto, el modelo podría no generalizar; no hay información para confirmarlo ni descartarlo.
- Idioma y contexto: el campo de idiomas está vacío; no hay base para asumir soporte multilingüe ni interacción en lenguaje natural.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero exige conservar el aviso de copyright y la licencia, e incluye cláusula de patentes y de ausencia de garantías. No hay restricciones adicionales declaradas por el autor.
- Uso clínico: cualquier aplicación en contexto médico o de diagnóstico requiere validación regulatoria independiente; un repositorio sin documentación no cumple ningún requisito al respecto.
- Descargas y adopción nulas: sin comunidad que haya reportado resultados, no existen señales externas de calidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/JinLab-Westlake/Morphi-DoANet
- Preprint bioRxiv sobre Morphi (perfilado fenotípico de organoides; asociación no confirmada): https://www.biorxiv.org/content/10.64898/2026.10.21.760628v1
- Repositorio GitHub DOA-Net (localización de fuente sonora; asociación no confirmada): https://github.com/sharathadavanne/doa-net
- Repositorio GitHub MogaNet, Westlake-AI (ICLR 2024; misma afiliación, asociación no confirmada): https://github.com/Westlake-AI/MogaNet
- Página del laboratorio Jin Lab, Westlake University: https://jinlab.net/jinlab/
