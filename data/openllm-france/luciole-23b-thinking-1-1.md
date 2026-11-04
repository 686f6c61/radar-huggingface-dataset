# OpenLLM-France/Luciole-23B-Thinking-1.1

## Resumen

Luciole-23B-Thinking-1.1 es un modelo de lenguaje causal de 23.216 millones de parámetros, desarrollado por el consorcio OpenLLM-France y LINAGORA en el marco del proyecto France 2030 financiado por BPI France. Se trata de un ajuste fino con alineación de preferencias sobre Luciole-23B-Base, orientado a seguir instrucciones con trazas de razonamiento explícitas (modo *thinking*) y con capacidades bilingües francés-inglés.

El modelo resuelve el problema de disponer de un *building block* abierto, con pesos, receta de entrenamiento y datos de post-entrenamiento publicados, para la comunidad francófona de IA. Frente a su modelo base, que fue entrenado con aproximadamente un 30 % de datos en francés, esta versión de post-entrenamiento se ha construido casi íntegramente sobre datos en inglés, lo que condiciona su comportamiento en tareas en francés.

Es relevante ahora porque forma parte de las primeras iteraciones públicas del proyecto Luciole, se distribuye bajo licencia Apache 2.0 (permisiva para uso comercial) y emplea una arquitectura tipo Nemotron. Su ventana de contexto efectiva tras el post-entrenamiento es de 16.384 tokens, muy inferior a los 131.000 tokens del modelo base, lo que constituye una limitación práctica importante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (familia Nemotron, según etiquetas del repositorio) |
| Parametros totales | 23.216.467.968 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens (entrenado); el modelo base soporta 131.000 |
| Tipos de cuantizacion | No disponible en la información proporcionada (pesos en safetensors; compatible con cuantización estándar vía herramientas de inferencia) |
| Idiomas soportados | Francés (fr) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Luciole-23B-Thinking-1.1 es un transformer causal decoder-only derivado de Luciole-23B-Base, etiquetado en el repositorio como perteneciente a la familia Nemotron. No se dispone de detalles adicionales sobre la arquitectura interna (número de capas, dimensiones de atención, tipo de atención o uso de componentes híbridos) en la información proporcionada.

El post-entrenamiento se realizó en dos fases sobre el supercomputador Jean Zay de GENCI, gestionado por IDRIS. La primera fase consistió en un ajuste fino supervisado (SFT) con trazas de pensamiento: 2,6 millones de muestras, 4 épocas, *learning rate* máximo de 2,0e-5 con decaimiento coseno hasta 2,0e-6, longitud máxima de secuencia de 16.384 tokens y tamaño de lote de 2.048. La segunda fase aplicó Direct Preference Optimization (DPO) con trazas de pensamiento: 284.000 muestras, 1 época, *learning rate* máximo de 3,0e-8 con decaimiento lineal hasta 0, lote de 128 y β de DPO igual a 5. Los datos de entrenamiento cubren matemáticas, ciencia, programación, conversación general, RAG y traducción, y están publicados en el dataset Luciole-PostTraining-Dataset-1.1.

## Capacidades

- Generación de texto y seguimiento de instrucciones en inglés y francés.
- Razonamiento con modo *thinking*: el modelo produce trazas de razonamiento antes de la respuesta final, entrenadas explícitamente en la fase de SFT y alineadas mediante DPO.
- Matemáticas, ciencia y programación: presentes en los datos de entrenamiento, aunque el autor advierte que se requeriría entrenamiento adicional para tareas específicas de generación de código y resolución matemática.
- Traducción: incluida como dominio en el dataset de post-entrenamiento.
- RAG: el modelo ha visto datos de recuperación aumentada y el autor recomienda integrarlo en pipelines RAG para compensar alucinaciones.
- *Tool calling* / *function calling*: soporte experimental. El modelo ha visto algunos datos de *tool calling*, pero muestra tendencia a rechazar en exceso las peticiones de llamada a herramientas.
- Capacidades multilingües limitadas a francés e inglés.
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Asistente conversacional bilingüe francés-inglés: el modelo puede mantener conversaciones multi-turno de hasta 16.384 tokens, suficiente para sesiones de atención al cliente o asistencia interna con historial moderado.
- Generación de respuestas con razonamiento explícito: en dominios donde la trazabilidad del razonamiento es valiosa (soporte técnico, análisis de incidencias), el modo *thinking* permite auditar el proceso previo a la respuesta.
- Traducción asistida francés-inglés: el modelo ha sido entrenado con datos de traducción y puede emplearse como componente en pipelines de traducción con revisión humana posterior.
- Pipelines RAG documentales: integrado con un recuperador, puede responder preguntas sobre bases documentales internas, mitigando alucinaciones mediante contexto recuperado.
- Prototipado de agentes con *tool calling* experimental: adecuado para entornos de investigación y pruebas, no para producción crítica, dada la tendencia documentada a rechazar llamadas a herramientas.
- Base para *fine-tuning* específico: al publicarse pesos, receta y datos bajo Apache 2.0, sirve como punto de partida para adaptaciones sectoriales (legal, administración pública francófona) con datos propios.
- Investigación en alineación y post-entrenamiento: la publicación conjunta de dataset, receta e hiperparámetros facilita la reproducibilidad de estudios sobre SFT y DPO con trazas de pensamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16/FP16): aproximadamente 46,4 GB de pesos, más overhead de caché KV; en la práctica se requiere al menos una GPU de 80 GB (A100 80GB, H100 80GB) para inferencia cómoda sin cuantizar.
- Cuantización a 8 bits: en torno a 23-25 GB de pesos, viable en una RTX 4090 (24 GB) de forma ajustada y con contexto reducido, o en A6000 (48 GB) con margen.
- Cuantización a 4 bits: en torno a 12-14 GB de pesos, cabe en GPUs de consumo como RTX 4090, RTX 3090 (24 GB) o RTX 4080 (16 GB) con contexto limitado.
- Despliegue: la model card documenta explícitamente el uso con Ollama y con vLLM. Otras opciones estándar (llama.cpp, TGI) no se mencionan en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Luciole-23B-Thinking-1.1 | 23,2B | 16.384 | fr, en | Apache 2.0 | Post-entrenamiento casi íntegramente en inglés; *tool calling* experimental |
| Luciole-23B-Base | 23,2B | 131.000 | fr, en (≈30 % francés) | Apache 2.0 | Modelo base sin post-entrenamiento; mayor contexto |
| Alternativas de 20-30B abiertas | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos verificables en la información proporcionada |

No se dispone de información suficiente para establecer comparaciones cuantitativas de rendimiento con modelos de la misma categoría.

## Limitaciones y advertencias

- El post-entrenamiento se realizó casi exclusivamente con datos en inglés, pese a que el modelo base incluía aproximadamente un 30 % de francés; el rendimiento en francés puede ser inferior al esperado por el etiquetado bilingüe.
- Ventana de contexto efectiva de 16.384 tokens, drásticamente inferior a los 131.000 tokens del modelo base; no debe asumirse el contexto largo del base.
- Tendencia documentada a rechazar en exceso peticiones de *tool calling*; capacidad experimental no apta para producción crítica.
- Entrenamiento centrado en seguimiento general de instrucciones; se requiere entrenamiento adicional para generación de código y resolución matemática especializadas.
- Riesgo de alucinación reconocido por el autor; se recomienda integración en pipelines RAG.
- Aunque ha pasado alineación de seguridad durante la fase DPO, puede generar salidas inseguras ante determinadas entradas.
- No entrenado con *prompts* de identidad: puede responder incorrectamente sobre su nombre u origen.
- Proyecto en desarrollo activo; se prevén iteraciones con mayor proporción de datos en francés.
- Licencia Apache 2.0 permite uso comercial, pero el autor recomienda evaluar exhaustivamente los casos de uso antes de incorporarlo a pipelines industriales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenLLM-France/Luciole-23B-Thinking-1.1
- Modelo base: https://huggingface.co/OpenLLM-France/Luciole-23B-Base
- Dataset de post-entrenamiento: https://huggingface.co/datasets/OpenLLM-France/Luciole-PostTraining-Dataset-1.1
- Repositorio de entrenamiento: https://github.com/OpenLLM-France/Luciole-Training/tree/main/finetune
- Proyecto OpenLLM-France: https://openllm-france.fr/
- LINAGORA Labs: https://labs.linagora.com/
- GENCI: https://www.genci.fr/
- IDRIS: http://www.idris.fr/docs/idris/missions
- BPI France: https://www.bpifrance.fr/
- France 2030: https://www.info.gouv.fr/grand-dossier/france-2030
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Contacto del proyecto: contact@openllm-france.fr
- Informe técnico: pendiente de publicación ("coming soon")
