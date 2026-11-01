# SinhalaMMLU-SharedTask/team-hakuru-labs-redqueen

## Resumen

RedQueen v7 es un adaptador LoRA entrenado por el equipo Hakuru Labs para la tarea compartida SinhalaMMLU del congreso ICTer 2026. Se construye sobre el modelo base iCIIT/redqueenprotocol-sin-llama3.2-3B-model, una variante de Llama 3.2 de 3B parámetros adaptada al cingalés. El adaptador añade unos 24 millones de parámetros y está especializado en responder preguntas de opción múltiple en cingalés (සිංහල) sobre contenidos curriculares de la escuela secundaria de Sri Lanka.

El modelo resuelve un problema concreto: la evaluación de comprensión multitemática en cingalés, un idioma de bajos recursos para el que existen pocos benchmarks y menos modelos ajustados. Para ello se entrenó sobre un conjunto ampliado de aproximadamente 24.500 preguntas de opción múltiple, generadas de forma sintética a partir de libros de texto oficiales y guías docentes del sistema educativo de Sri Lanka.

Su relevancia actual radica en que participa en una competición formal con límite de 8.000 millones de parámetros lógicos, y lo hace con un modelo de 3,22B, muy por debajo del límite. La ficha documenta una receta de ajuste eficiente (LoRA sobre un modelo de 3B) para una tarea de razonamiento multitemático en un idioma de bajos recursos, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.2 (transformer decoder-only); adaptador LoRA sobre el modelo base |
| Parametros totales | ~3,22B lógicos (modelo base 3B + adaptador de ~24M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Llama 3.2 3B; no especificada en la model card) |
| Tipos de cuantizacion | El ejemplo de uso emplea carga en 4 bits (load_in_4bit=True); no se documentan otros formatos |
| Idiomas soportados | Cingalés (si) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA para PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only de la familia Llama 3.2 con 3.000 millones de parámetros (iCIIT/redqueenprotocol-sin-llama3.2-3B-model). El ajuste se realiza mediante LoRA, con un adaptador de aproximadamente 24 millones de parámetros, lo que sitúa el total lógico en unos 3,22B. No se detalla en la información disponible el rango del adaptador, las capas objetivo ni los hiperparámetros de entrenamiento.

Los datos de entrenamiento combinan un conjunto sintético de unas 24.500 preguntas de opción múltiple en cingalés, generadas con APIs cerradas (DeepSeek, Claude y ChatGPT) a partir de libros de texto oficiales de los grados 6 a 13 y guías docentes descargadas de GovDoc.lk, junto con el conjunto de desarrollo público de la categoría Easy de SinhalaMMLU. Un detalle técnico destacable: aunque el system prompt instruye al modelo a "pensar paso a paso", los objetivos de entrenamiento no contienen texto explícito de cadena de pensamiento (CoT); el modelo se entrena para emitir directamente el token de respuesta final (`පිළිතුර: X`), forzando el razonamiento interno. No se documentan fases de RLHF o DPO.

## Capacidades

- Respuesta a preguntas de opción múltiple en cingalés sobre materias curriculares de secundaria (grados 6 a 13).
- Razonamiento interno orientado a la selección de una única opción correcta, con formato de salida fijo (`පිළිතුර: X`).
- Comprensión lectora multitemática en cingalés: ciencias, humanidades y asignaturas del currículo oficial de Sri Lanka.
- Generación de texto en cingalés heredada del modelo base (no evaluada de forma específica en la información disponible).
- Seguimiento de system prompt con instrucción de razonamiento paso a paso, aunque la salida entrenada sea directa.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio.
- No se documenta capacidad multilingüe más allá del cingalés.

## Casos de uso

- Evaluación de benchmarks educativos en cingalés: el adaptador se puede usar como sistema de referencia en la tarea SinhalaMMLU para medir la calidad de respuestas de opción múltiple sobre el currículo de Sri Lanka.
- Investigación en idiomas de bajos recursos: sirve como ejemplo reproducible de ajuste LoRA eficiente sobre un modelo de 3B para una tarea de razonamiento en un idioma con pocos recursos, con receta de datos sintéticos documentada.
- Generación de material de evaluación docente: a partir de los libros de texto de GovDoc.lk, el modelo puede ayudar a producir preguntas de práctica de opción múltiple para asignaturas de secundaria, revisadas posteriormente por docentes.
- Sistemas de tutoría con preguntas de práctica: integrado en una aplicación de estudio, puede presentar y resolver preguntas tipo test del currículo cingalés para estudiantes de grados 6 a 13.
- Comparación de estrategias de datos sintéticos: el modelo permite estudiar el efecto de entrenar con datos generados por DeepSeek, Claude y ChatGPT sobre el rendimiento en una tarea de opción múltiple en cingalés.
- Prototipado de asistentes educativos en cingalés: al ser un adaptador pequeño (unos 24M de parámetros) sobre un base de 3B, se puede desplegar con cuantización en 4 bits para pruebas de concepto en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El modelo base es de 3B parámetros; con carga en 4 bits (como en el ejemplo de la model card) el peso ronda los 2 GB, más el adaptador LoRA de ~24M de parámetros y la sobrecarga de activaciones y contexto.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, un modelo de 3B en 4 bits es asequible para GPUs de consumo con suficiente VRAM; en precisión completa (fp16) requiere del orden de 6-7 GB solo para pesos, sin contar activaciones.
- Cabe en GPU de consumo: previsiblemente sí en GPUs tipo RTX 3060/4060 con cuantización, aunque no se documenta ningún requisito oficial.
- Opciones de despliegue: el ejemplo oficial usa transformers con PEFT (`PeftModel.from_pretrained`) y carga en 4 bits. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RedQueen v7 (este adaptador) | ~3,22B lógicos (3B + LoRA ~24M) | no disponible | Opción múltiple en cingalés (SinhalaMMLU) | Apache 2.0 | HuggingFace |
| Modelo base iCIIT/redqueenprotocol-sin-llama3.2-3B-model | 3B | no disponible | Modelo de lenguaje en cingalés | no disponible en la información proporcionada | HuggingFace |
| Llama 3.2 3B (original) | 3B | 128K (según la familia Llama 3.2; no verificado en esta ficha) | Modelo de propósito general multilingüe | Llama 3.2 Community License | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización estrecha: el adaptador está entrenado para responder preguntas de opción múltiple con el formato `පිළිතුර: X`; su uso fuera de ese formato puede degradar la calidad de salida.
- Dependencia del modelo base: requiere cargar iCIIT/redqueenprotocol-sin-llama3.2-3B-model; no funciona de forma autónoma.
- Datos sintéticos: el conjunto de entrenamiento se generó con APIs cerradas (DeepSeek, Claude, ChatGPT) a partir de libros de texto; pueden propagarse errores, sesgos o artefactos de esos modelos generadores.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad factual; en preguntas fuera del currículo de los grados 6 a 13 el modelo puede responder de forma incorrecta con el mismo formato confiado.
- Cobertura limitada al cingalés y al currículo de Sri Lanka; no se documenta rendimiento en otros idiomas ni en dominios ajenos a los libros de texto usados.
- Sin datos de benchmarks publicados en esta ficha: no es posible verificar su calidad relativa frente a alternativas.
- Sin información sobre sesgos demográficos, culturales o de género evaluados.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base, que no se detalla en la información proporcionada.
- El modelo se presenta en el contexto de una competición (ICTer 2026); su mantenimiento y actualización futura no están garantizados.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/SinhalaMMLU-SharedTask/team-hakuru-labs-redqueen
- Modelo base: https://huggingface.co/iCIIT/redqueenprotocol-sin-llama3.2-3B-model
- Fuente de los libros de texto: https://govdoc.lk/
- Paper de SinhalaMMLU (EMNLP 2025): https://aclanthology.org/2025.emnlp-main.1673/
