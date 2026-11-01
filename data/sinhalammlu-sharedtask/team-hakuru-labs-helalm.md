# SinhalaMMLU-SharedTask/team-hakuru-labs-helalm

## Resumen

HelaLM-4B SinhalaMMLU Adapter (v2) es un adaptador LoRA entrenado por el equipo Hakuru Labs para la tarea compartida SinhalaMMLU de ICTer 2026. No se trata de un modelo completo, sino de un ajuste fino sobre el modelo base Jainamshahhh/helalm-4b, que a su vez es una variante de Gemma 3 de 4B parámetros adaptada al sinhala. El adaptador añade aproximadamente 24 millones de parámetros entrenables y está diseñado específicamente para responder preguntas de opción múltiple en sinhala.

El problema que resuelve es acotado pero relevante en el contexto de la evaluación de modelos en lenguas de bajos recursos: proporciona un sistema especializado en la resolución de preguntas tipo test sobre material educativo de Sri Lanka (grados 6 a 13), alineado con el formato del benchmark SinhalaMMLU. Su relevancia actual deriva de su participación en una competición académica concreta (ICTer 2026), no de un uso generalista.

Arquitectónicamente hereda la estructura transformer de Gemma 3 (4B), con el adaptador LoRA acoplado mediante PEFT. El contexto, la cuantización y otros detalles técnicos del modelo base no se especifican en la información disponible. El repositorio ocupa 0,1 GB y contiene únicamente los pesos del adaptador en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3, 4B) con adaptador LoRA |
| Parametros totales | ~4,02B (modelo base) + ~24M (adaptador LoRA) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El ejemplo de uso emplea carga en 4-bit; no se documentan otras variantes |
| Idiomas soportados | Sinhala (si) |
| Licencia | gemma |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Gemma 3 de 4B parámetros, un transformer decoder-only. El ajuste se realizó con LoRA (Low-Rank Adaptation), añadiendo unos 24 millones de parámetros entrenables sobre el modelo base congelado. El entrenamiento utilizó el formato de instrucción Alpaca en lugar de la plantilla de chat nativa de Gemma, y el objetivo es que el modelo emita directamente el token de respuesta correcta con la forma `පිළිතුර: X`.

Los datos de entrenamiento consisten en aproximadamente 13.500 preguntas de opción múltiple en sinhala. Una parte es sintética, generada mediante APIs cerradas (DeepSeek, Claude y ChatGPT) a partir de libros de texto y guías docentes oficiales de Sri Lanka (grados 6 a 13) descargados de GovDoc.lk; la otra parte proviene del conjunto de desarrollo público de la categoría Easy de SinhalaMMLU. No se documentan detalles sobre el número de tokens, la composición exacta del dataset, ni si hubo RLHF o DPO. Tampoco se especifican innovaciones técnicas adicionales más allá del propio ajuste LoRA.

## Capacidades

- Resolución de preguntas de opción múltiple en sinhala sobre contenidos educativos (grados 6 a 13).
- Generación de la respuesta en un formato fijo (`පිළිතුර: X`), lo que facilita el parseo automático en pipelines de evaluación.
- Comprensión de instrucciones en formato Alpaca, no en la plantilla de chat nativa de Gemma.
- Capacidad multilingüe limitada al sinhala según la model card; no se documentan otras lenguas.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso explícito, visión ni audio.
- No se documenta un modo de pensamiento (thinking mode) ni decodificación especulativa.

## Casos de uso

- Evaluación académica en el benchmark SinhalaMMLU: el adaptador está entrenado específicamente para el formato de la tarea compartida, por lo que se usaría para generar respuestas A/B/C/D y medir accuracy frente al conjunto de test oficial.
- Investigación en lenguas de bajos recursos: sirve como punto de partida para estudiar cómo el ajuste LoRA sobre un modelo base ya adaptado al sinhala mejora el rendimiento en tareas de comprensión de opción múltiple.
- Generación de material de práctica educativo: a partir de preguntas de opción múltiple sobre textos escolares de Sri Lanka, el modelo puede seleccionar la respuesta correcta para validar bancos de preguntas generados automáticamente.
- Baseline para comparativas de adaptadores: al ser un adaptador pequeño (~24M parámetros) sobre un base de 4B, es útil como referencia en experimentos que comparen distintas estrategias de fine-tuning (LoRA frente a full fine-tuning, por ejemplo).
- Prototipado de asistentes de estudio en sinhala: integrado en una interfaz que presente preguntas de test y valide la respuesta del estudiante contra la predicción del modelo.
- Filtrado y anotación semiautomática de datasets educativos: el modelo puede etiquetar preguntas de opción múltiple con la opción que considera correcta, como paso previo a revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el ejemplo de la model card carga el modelo base en 4-bit, lo que sitúa el requisito en torno a 3-4 GB para los pesos, más overhead de activaciones y del adaptador. No se proporcionan cifras oficiales.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño (4B en 4-bit), cabría esperar compatibilidad con GPUs de consumo, pero no se documenta.
- ¿Cabe en GPU de consumo? No confirmado por el autor; el ejemplo de carga en 4-bit sugiere que sí en GPUs con al menos 6-8 GB de VRAM, aunque es una estimación, no un dato oficial.
- Opciones de despliegue: el ejemplo oficial usa `transformers` con `peft` y `load_in_4bit`. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HelaLM-4B SinhalaMMLU Adapter (v2) | ~4,02B + 24M LoRA | no disponible | gemma | HuggingFace (adaptador) | Especializado en opción múltiple en sinhala |
| Jainamshahhh/helalm-4b (modelo base) | ~4B | no disponible | no disponible en la información | HuggingFace | Modelo base Gemma 3 adaptado a sinhala |
| Gemma 3 4B (original) | ~4B | no disponible en la información | gemma | HuggingFace | Modelo generalista multilingüe de Google |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: requiere cargar el modelo base Jainamshahhh/helalm-4b para funcionar.
- Entrenado exclusivamente para preguntas de opción múltiple en sinhala con formato Alpaca; su uso fuera de ese formato o tarea puede degradar gravemente el rendimiento.
- No debe usarse con la plantilla de chat nativa de Gemma: la model card advierte explícitamente que el adaptador se entrenó con formato Alpaca.
- Los datos sintéticos se generaron con APIs cerradas (DeepSeek, Claude, ChatGPT), lo que puede introducir sesgos y errores heredados de esos modelos.
- Riesgo de alucinación no cuantificado; no se documentan evaluaciones de robustez ni de calibración.
- Licencia "gemma": sujeta a los términos de uso de Gemma, que imponen restricciones para uso comercial. Conviene revisar la licencia completa antes de cualquier despliegue en producción.
- Sin descargas ni likes en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.
- No se documentan sesgos conocidos, limitaciones de contexto ni comportamiento fuera del dominio educativo de Sri Lanka.

## Enlaces

- [HuggingFace: SinhalaMMLU-SharedTask/team-hakuru-labs-helalm](https://huggingface.co/SinhalaMMLU-SharedTask/team-hakuru-labs-helalm)
- [Modelo base: Jainamshahhh/helalm-4b](https://huggingface.co/Jainamshahhh/helalm-4b)
- [Paper SinhalaMMLU (EMNLP 2025)](https://aclanthology.org/2025.emnlp-main.1673/)
- [GovDoc.lk (fuente de los materiales educativos)](https://govdoc.lk/)
