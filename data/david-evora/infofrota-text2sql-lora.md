# David-Evora/infofrota-text2sql-lora

## Resumen

El modelo `David-Evora/infofrota-text2sql-lora` es un adaptador LoRA (entrenado con QLoRA) que especializa el modelo base `unsloth/Llama-3.1-8B-Instruct` en la tarea de text-to-SQL para el esquema de una base de datos SQLite **sintética** del proyecto InfoFrota, que simula datos de ocupación de autobuses, alertas de capacidad, líneas y paradas. El adaptador traduce preguntas formuladas en portugués en consultas SQL ejecutables sobre ese esquema concreto.

El desarrollo corre a cargo de David-Evora como proyecto independiente, sin vinculación con operadores de transporte ni organismos públicos. El adaptador no modifica los pesos del modelo base: se distribuye como un repositorio PEFT de 0,2 GB que debe cargarse sobre el checkpoint original de Llama 3.1 8B Instruct. Esto lo hace ligero de almacenar y de integrar en pipelines existentes basados en `transformers` y `peft`.

Su relevancia es limitada y muy específica: sirve como demostración académica y de portafolio de ajuste fino eficiente en parámetros para una tarea de traducción portugués-SQL, no como solución operativa. El propio autor advierte explícitamente que el modelo se entrenó y evaluó solo con datos simulados y que no debe usarse en producción ni para decisiones operativas. La mejora medida sobre el modelo base en un benchmark congelado de 56 preguntas es de 33,9% a 64,3% de aciertos, con un tamaño de muestra que el autor reconoce como insuficiente para extraer conclusiones robustas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptador LoRA (PEFT); entrenamiento QLoRA en 4 bits nf4 |
| Parametros totales | 8B en el modelo base; el adaptador LoRA es de rango 16 (número exacto de parámetros del adaptador no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Llama 3.1 8B Instruct soporta hasta 128K tokens, pero el adaptador no declara una ventana propia) |
| Tipos de cuantizacion | El adaptador se entrenó sobre base cuantizada en 4 bits nf4 (bitsandbytes); el adaptador en sí se distribuye en safetensors y puede combinarse con el base en otras precisiones, aunque no se documentan |
| Idiomas soportados | Portugués (pt) |
| Licencia | Llama 3.1 Community License (Built with Llama) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `unsloth/Llama-3.1-8B-Instruct`, un transformer decoder-only de 8.000 millones de parámetros con los mismos pesos que Llama 3.1 8B Instruct. El ajuste se realizó con QLoRA: el modelo base se cargó cuantizado en 4 bits (nf4) y se entrenaron únicamente matrices de bajo rango con r=16, alpha=32 y dropout de 0,05, aplicadas a los módulos de atención (q, k, v, o) y a los módulos del MLP (gate, up, down). El entrenamiento duró 3 épocas con un lote efectivo de 16, tasa de aprendizaje 2e-4 con decaimiento coseno, y se ejecutó en una GPU T4 en Kaggle.

El conjunto de datos es enteramente sintético: 738 ejemplos construidos por familias de plantillas de pregunta y de consulta SQL, divididos en 679 para entrenamiento y 59 para validación, con un 8% de ejemplos de rechazo para preguntas fuera de dominio o peticiones de escritura. El autor documenta en `training/REPORT.md` del repositorio un conjunto de filtros anti-fuga (similitud de Jaccard, esqueleto SQL y exclusión de familias próximas) para evitar que los ejemplos de test se solapen con los de entrenamiento. No se documentan fases de RLHF ni DPO; el ajuste es supervisado sobre pares pregunta-SQL. La variante publicada en este repositorio corresponde al adaptador entrenado **sin contexto recuperado**, resultado fijado antes de cualquier ajuste posterior.

## Capacidades

- Traducción de preguntas en portugués a consultas SQLite sobre el esquema sintético de InfoFrota (ocupación de autobuses, alertas de lotación, líneas y paradas).
- Generación de texto conversacional heredada del modelo base Llama 3.1 8B Instruct.
- Reconocimiento de preguntas fuera de dominio y peticiones de escritura, con una tasa de recusa entrenada del 8% de los ejemplos.
- No se documenta soporte de tool calling ni de function calling en el adaptador; el modelo base lo soporta, pero el ajuste no lo refuerza ni lo evalúa.
- No se documenta capacidad de agentes ni de razonamiento multi-paso más allá de la generación de una consulta SQL única.
- Capacidad multilingüe limitada al portugués en la tarea objetivo; el modelo base conserva sus capacidades multilingües, pero no se han evaluado en este adaptador.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Demostración de ajuste fino eficiente en parámetros: el adaptador sirve como ejemplo reproducible de QLoRA con r=16 sobre un modelo de 8B en una GPU T4, útil para formación y para comparar configuraciones de bajo rango en tareas de generación estructurada.
- Investigación en text-to-SQL en portugués: permite experimentar con la traducción de lenguaje natural a SQL en un idioma con menos recursos que el inglés, usando un esquema y un benchmark públicos y congelados.
- Evaluación de guardas de solo lectura: el repositorio incluye una guarda en tres capas que valida que el SQL generado sea de lectura; el adaptador puede usarse para probar y depurar ese componente antes de integrarlo en otros sistemas.
- Generación de consultas de ejemplo para documentación: dado el esquema sintético de InfoFrota, el modelo puede producir consultas SQL de muestra para manuales, tutoriales o tests de integración de la propia base de datos.
- Estudio de robustez frente a preguntas fuera de dominio: el 8% de recusas entrenadas permite analizar cómo un adaptador pequeño aprende a rechazar peticiones de escritura o consultas fuera del esquema, un problema relevante en asistentes de bases de datos.
- Comparación de variantes con y sin contexto recuperado: el autor publica esta variante sin contexto, lo que permite medir el efecto de añadir recuperación (RAG) sobre el esquema en la precisión de las consultas generadas.
- Prototipado de asistentes de consulta para datos de movilidad urbana: con datos sintéticos, se puede simular un asistente que responde preguntas sobre ocupación de líneas y paradas, siempre con la advertencia de que no refleja operación real.

## Benchmarks y rendimiento

El autor publica un benchmark congelado v2.1 de 56 preguntas, en modo zero-shot, con el criterio "el resultado contiene lo esperado". Los resultados son los siguientes:

| Condición | Aciertos | Acurácia |
|---|---:|---:|
| Modelo base, prompt compacto | 19/56 | 33,9% |
| Este adaptador, prompt compacto | 36/56 | 64,3% |

El propio autor advierte que, con 56 preguntas, diferencias de uno o dos aciertos son ruido estadístico, que el nivel difícil del benchmark sigue bajo, que la pregunta D06 tiene un defecto conocido en la referencia y que la puntuación no se ajustó tras ver los resultados. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generales en la información disponible, y no se han publicado resultados de benchmarks en la información disponible para comparar con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en sí ocupa 0,2 GB, pero requiere cargar el modelo base de 8B. En 4 bits (nf4) el conjunto completo necesita aproximadamente 5-6 GB de VRAM; en fp16, en torno a 16 GB.
- GPU recomendadas: T4 (16 GB) es suficiente para la configuración de 4 bits documentada por el autor; A100 y H100 ofrecen margen para mayor longitud de contexto y lote; RTX 4090 (24 GB) permite cargar el base en fp16.
- Cabe en GPU de consumo: sí, en 4 bits en tarjetas con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090); en fp16 requiere 16 GB o más.
- Opciones de despliegue: `transformers` con `peft` y `bitsandbytes` es la vía documentada por el autor; vLLM, llama.cpp, Ollama y TGI no se documentan para este adaptador en la información disponible, y su compatibilidad con adaptadores PEFT de este tipo no está verificada aquí.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `David-Evora/infofrota-text2sql-lora` | 8B (base) + adaptador LoRA r=16 | no disponible | Text-to-SQL en portugués sobre esquema sintético | Llama 3.1 Community License | Hugging Face (adaptador PEFT) |
| `genies-llm/text2sql-sft-v5-lora` | 7B (base Qwen2.5-Coder-7B-Instruct) + adaptador LoRA | no disponible en la información disponible | Text-to-SQL (idioma no especificado) | no disponible | Hugging Face (adaptador PEFT, entrenado con TRL) |
| `bornafrv/Text2SQL-and-LLM-Fine-Tuning` | TinyLlama (tamaño no especificado) | no disponible | Text-to-SQL y ajuste de instrucciones con LoRA | no disponible | GitHub (código y proyecto) |

La comparación directa de rendimiento no es posible porque ninguno de los tres proyectos publica resultados en un benchmark común. El adaptador de genies-llm se basa en un modelo de código (Qwen2.5-Coder) y usa SFT con TRL, mientras que el de David-Evora se basa en Llama 3.1 Instruct y usa QLoRA con PEFT; ambos son adaptadores pequeños que requieren el modelo base. El proyecto de bornafrv es un repositorio de código con dos proyectos de adaptación, no un adaptador publicado en Hugging Face.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente con datos sintéticos: no mide ni garantiza desempeño sobre bases de datos reales de operadores de transporte.
- El propio autor prohíbe explícitamente el uso en producción y para decisiones operativas.
- Riesgo de alucinación: el modelo puede generar SQL sintácticamente válido pero semánticamente incorrecto o referenciando tablas y columnas inexistentes; por eso el repositorio incluye una guarda de solo lectura en tres capas que debe aplicarse siempre.
- El benchmark de evaluación tiene solo 56 preguntas y el autor reconoce que diferencias de uno o dos aciertos son ruido; la mejora de 33,9% a 64,3% no es concluyente.
- El nivel difícil del benchmark sigue bajo según el autor, y la pregunta D06 tiene un defecto conocido en la referencia.
- Sesgos conocidos: no se documentan sesgos específicos del adaptador; el modelo base Llama 3.1 puede arrastrar sesgos de sus datos de entrenamiento, pero no se han evaluado en este contexto.
- Limitación de idioma: el adaptador está entrenado solo en portugués y solo para el esquema sintético de InfoFrota; no se ha evaluado su transferencia a otros esquemas ni a otros idiomas.
- Restricciones de licencia: derivado de Llama 3.1, se distribuye bajo la Llama 3.1 Community License, que impone obligaciones de atribución ("Built with Llama") y condiciones de uso comercial que deben revisarse antes de cualquier despliegue.
- Dependencia del prompt: el autor indica que el prompt esperado está en `infofrota_ai/prompts.py` del repositorio (modo `compacto`); usar otro formato puede degradar la precisión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/David-Evora/infofrota-text2sql-lora
- Repositorio del proyecto (código, datos sintéticos y benchmark): https://github.com/David-Evora/InfoFrota
- Notebook de Kaggle: https://www.kaggle.com/code/davidevora/notebook-portifolio-infofrota
- Modelo base: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
- Proyecto comparable en GitHub (Text2SQL y fine-tuning con LoRA): https://github.com/bornafrv/Text2SQL-and-LLM-Fine-Tuning
- Adaptador comparable en Hugging Face (text2sql-sft-v5-lora): https://huggingface.co/genies-llm/text2sql-sft-v5-lora
