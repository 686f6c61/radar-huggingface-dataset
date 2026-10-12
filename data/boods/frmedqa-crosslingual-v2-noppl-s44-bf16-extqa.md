# boods/FrMedQA-CrossLingual-v2-NoPPL-s44-bf16-ExtQA

## Resumen

El repositorio `boods/FrMedQA-CrossLingual-v2-NoPPL-s44-bf16-ExtQA` es un modelo publicado en Hugging Face por el usuario `boods` el 11 de octubre de 2026. Se distribuye bajo la librería `transformers`, con pesos en formato `safetensors`, y ocupa 0,5 GB en el Hub. Los tags incluyen `unsloth`, lo que apunta a un ajuste fino realizado con esa herramienta, y `arxiv:1910.09700`, que corresponde al artículo de Lacoste et al. sobre estimación de impacto ambiental citado en la plantilla de model card.

El nombre del repositorio sugiere un modelo de respuesta a preguntas (QA) médicas en francés, con evaluación cross-lingual, versión 2, entrenado con semilla 44, en precisión bf16 y con un conjunto de preguntas ampliado ("ExtQA"). La construcción "NoPPL" podría indicar que la selección de checkpoints no se basó en perplejidad. Se trata, en todo caso, de inferencias derivadas del identificador: no hay ninguna sección del README que las confirme.

El problema principal de esta ficha es la ausencia de documentación. La model card publicada es la plantilla autogenerada de Hugging Face, con todos los campos marcados como `[More Information Needed]`: no se declaran desarrollador, tipo de modelo, idiomas, licencia, datos de entrenamiento, hiperparámetros ni resultados. El modelo acumula 0 descargas y 0 likes en el momento de la consulta, por lo que tampoco existe trazabilidad de uso por parte de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (los tags indican `transformers` y `unsloth`; no se especifica la familia concreta) |
| Parámetros totales | no disponible (estimación indirecta: ~250 M para un repo de 0,5 GB en bf16) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el nombre del repo indica pesos en bf16; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (el identificador sugiere francés e inglés en un escenario cross-lingual) |
| Licencia | no disponible |
| Formato de pesos | safetensors (tag del repositorio) |
| Librería de carga | transformers |
| Tamaño del repositorio | 0,5 GB |
| Fecha de creación | 2026-10-11 |
| Última actualización | 2026-10-11 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura. La model card no rellena el apartado "Model Architecture and Objective", ni los hiperparámetros de entrenamiento, ni el régimen de precisión, ni el hardware utilizado. El tag `unsloth` sugiere que el ajuste fino se realizó con esa librería, habitualmente empleada para fine-tuning eficiente con LoRA o QLoRA sobre modelos transformer, pero el repositorio no indica si se trata de un adaptador, de un modelo fusionado o de un entrenamiento completo. Tampoco se especifica el modelo base del que parte, dato que el campo "Finetuned from model" deja explícitamente como pendiente.

Respecto a los datos de entrenamiento, no se documenta el número de tokens, la composición del corpus, la procedencia de las preguntas médicas ni si hubo fases de RLHF, DPO o ajuste supervisado. El sufijo "FrMedQA" apunta a un conjunto de evaluación o entrenamiento de preguntas y respuestas médicas en francés, y "CrossLingual" a un planteamiento multilingüe, pero ninguna de estas hipótesis está respaldada por documentación. El tamaño del repositorio (0,5 GB) es coherente con un modelo de aproximadamente 250 millones de parámetros en bf16 sin optimizador, aunque esta cifra es una estimación indirecta y no un dato declarado.

## Capacidades

- Generación de texto y respuesta a preguntas: no confirmada documentalmente. El identificador sugiere QA sobre contenido médico en francés, sin verificación disponible.
- Razonamiento multilingüe o cross-lingual: no disponible. El nombre menciona "CrossLingual", pero no se detalla qué pares de idiomas cubre.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades de visión, audio o modo "thinking": no disponible.
- Capacidades de código o matemáticas: no disponible.
- Ajuste de instrucciones: no disponible. No se indica si el modelo está alineado con instrucciones.
- Longitud de contexto efectiva: no disponible.

## Casos de uso

Los siguientes escenarios se plantean como hipótesis coherentes con el identificador del repositorio. En todos los casos requieren validación previa, dado que no existe documentación técnica ni evaluación publicada.

- Respuesta a preguntas médicas en francés: si el ajuste fino se ha realizado sobre corpus clínico francófono, el modelo podría emplearse como primer nivel de consulta sobre terminología, definiciones y protocolos. Antes de cualquier uso real habría que verificar con un conjunto de evaluación propio que no produce respuestas clínicamente incorrectas.
- Asistencia documental para profesionales sanitarios francófonos: integrado en un sistema de búsqueda interna, podría resumir o reformular fragmentos de guías clínicas. Requiere validación frente a un corpus de referencia y revisión humana obligatoria.
- Traducción asistida de terminología médica entre francés e inglés: el componente "cross-lingual" del nombre sugiere esta capacidad, pero no hay evidencia de calidad por par de idiomas.
- Preprocesado de historias clínicas estructuradas: extracción de entidades o normalización de preguntas en formularios médicos, siempre como componente auxiliar y con supervisión.
- Generación de conjuntos de preguntas de evaluación médica: útil para construir bancos de preguntas de entrenamiento o examen, sujeto a revisión por especialistas.
- Investigación sobre ajuste fino eficiente: dado el tag `unsloth` y el tamaño reducido del repo, el modelo puede servir como punto de partida reproducible para experimentos académicos sobre QA médica en dominio francófono.
- Base para pipelines de evaluación de sesgo en dominios sanitarios: un modelo pequeño y especializado permite estudiar comportamientos indeseados sin costes elevados de inferencia.

Ninguno de estos casos debe desplegarse en producción sanitaria sin una validación clínica formal y sin conocer la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye la sección de evaluación, no se declaran métricas (MMLU, HumanEval, GSM8K, MedQA, F1, exact match ni ninguna otra) y no existe comparación con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no declarada. Como referencia indirecta, un modelo de ~250 M de parámetros en bf16 ocupa aproximadamente 0,5 GB de pesos, a lo que hay que sumar caché KV y activaciones. Cifra orientativa y no confirmada.
- Cuantización: el repositorio solo distribuye pesos en bf16. No hay versiones GGUF, AWQ ni GPTQ publicadas.
- GPU recomendadas: no disponible. Por tamaño estimado, cualquier GPU con 4 GB de VRAM o más sería suficiente, pero es una deducción, no un dato del autor.
- Viabilidad en GPU de consumo: probablemente sí (GTX 1650, RTX 3060, RTX 4090 y similares), según la estimación de tamaño. No confirmado.
- Opciones de despliegue: no documentadas. La compatibilidad con text-generation-inference, vLLM, llama.cpp u Ollama no está verificada; llama.cpp requeriría además una conversión a GGUF que no se proporciona.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni tiempos de respuesta.

## Comparativa con modelos similares

No disponible. No es posible establecer una comparativa fiable porque se desconocen la arquitectura, el número exacto de parámetros, la longitud de contexto, la licencia y el rendimiento del modelo. Cualquier comparación con alternativas de QA médica multilingüe sería especulativa.

## Limitaciones y advertencias

- Documentación inexistente: la model card es la plantilla autogenerada de Hugging Face y no contiene información verificable sobre el modelo.
- Licencia no especificada: no puede determinarse si el uso comercial está permitido. En ausencia de licencia explícita, debe asumirse que no hay autorización clara.
- Riesgo de alucinación: cualquier modelo de lenguaje aplicado a dominio médico puede generar afirmaciones falsas con apariencia de verosimilitud. Sin evaluación publicada, el riesgo es indeterminado y potencialmente alto.
- Sesgos desconocidos: no se documenta la composición del dataset, por lo que no puede evaluarse el sesgo demográfico, lingüístico ni clínico.
- Cobertura idiomática incierta: aunque el nombre sugiere un enfoque cross-lingual francés, no se especifican los idiomas soportados ni su calidad relativa.
- Estado del repositorio: 0 descargas y 0 likes, sin señales de revisión por parte de la comunidad ni de mantenimiento posterior a la creación.
- Origen de los datos médicos desconocido: no se indica si el corpus de entrenamiento respeta normativas de privacidad (RGPD, HIPAA) ni si contiene datos de pacientes.
- Prohibición de uso clínico directo: no debe utilizarse para diagnóstico, prescripción ni triaje sin validación clínica formal y supervisión profesional.
- Fecha de creación atípica: el repositorio figura como creado el 11 de octubre de 2026, dato que conviene contrastar con la fuente original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/boods/FrMedQA-CrossLingual-v2-NoPPL-s44-bf16-ExtQA
- Artículo referenciado en los tags (Lacoste et al., 2019, sobre estimación de emisiones de carbono en aprendizaje automático): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental citada en la plantilla: https://mlco2.github.io/impact
- Repositorio o paper del autor: no disponible
- Demo: no disponible
