# sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_retention_random_anchor_high_risk_sft_step340

## Resumen

El modelo `sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_retention_random_anchor_high_risk_sft_step340` es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante supervisión fina (SFT) sobre el modelo base `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct`, desarrollado por LG AI Research. El nombre del repositorio sugiere que el adaptador ha sido optimizado para tareas de conversación financiera (convfin), incluyendo preguntas de opción múltiple (mcq), retención de clientes (pc_retention) y escenarios de alto riesgo (high_risk), con un anclaje aleatorio (random_anchor) en el entrenamiento. Sin embargo, el autor no ha proporcionado documentación adicional, por lo que los detalles concretos del entrenamiento y los datos utilizados no están disponibles.

El modelo base EXAONE-3.5-7.8B-Instruct es un modelo de lenguaje de 7.8 mil millones de parámetros, parte de la serie EXAONE 3.5 de LG AI Research, que destaca por su capacidad de seguimiento de instrucciones en escenarios reales y soporta una ventana de contexto de hasta 32 000 tokens. Este adaptador hereda esas capacidades, aunque el ajuste específico puede modificar o restringir el comportamiento original. El repositorio contiene únicamente los pesos del adaptador en formato safetensors (0,3 GB), por lo que para su uso es necesario cargar el modelo base junto con el adaptador mediante la librería PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base) + adaptador LoRA |
| Parametros totales | No disponible (el adaptador es un LoRA de bajo rango; el modelo base tiene 7 800 millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32 000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base puede cuantizarse a 4/8 bits con herramientas externas |
| Idiomas soportados | No disponible (el modelo base de EXAONE 3.5 está optimizado principalmente para coreano e inglés, pero no se confirma para este adaptador) |
| Licencia | No disponible (la del modelo base es de LG AI Research, pero no se especifica en el repositorio del adaptador) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo base EXAONE-3.5-7.8B-Instruct es un transformer decoder-only con atención estándar, entrenado por LG AI Research con un enfoque en el seguimiento de instrucciones en entornos reales. Según el informe tecnico (arXiv:2412.04862), la serie EXAONE 3.5 incluye modelos de 2.4B, 7.8B y 32B, todos con soporte de contexto de 32K tokens. El entrenamiento del adaptador LoRA se realizó mediante supervisión fina (SFT), probablemente con la librería TRL de HuggingFace, como indican las etiquetas del repositorio. No se dispone de información sobre el dataset utilizado, el número de pasos de entrenamiento (aunque el nombre sugiere el paso 340), ni los hiperparámetros del LoRA (rango, alpha, etc.). El tamaño del repositorio (0,3 GB) sugiere un adaptador de bajo rango, típico de LoRA, que no modifica los pesos completos del modelo base.

## Capacidades

- Generacion de texto y conversacion: el modelo base EXAONE-3.5-7.8B-Instruct es capaz de mantener dialogos multi-turno y seguir instrucciones complejas.
- Razonamiento y conocimiento general: hereda las capacidades del modelo base, que ha sido evaluado en tareas de razonamiento, matematicas y conocimiento general.
- Soporte de contexto largo: ventana de 32K tokens, util para documentos extensos o conversaciones prolongadas.
- Capacidades multilingues: el modelo base esta optimizado para coreano e ingles, aunque puede funcionar en otros idiomas con menor rendimiento.
- Especializacion potencial: el nombre del adaptador sugiere que ha sido afinado para tareas de conversacion financiera, preguntas de opcion multiple y analisis de riesgo, pero no hay evidencia publica que confirme estas capacidades.
- No se ha confirmado soporte de tool calling, function calling ni modo agente en el adaptador; estas capacidades dependen del modelo base y de como se haya realizado el ajuste.

## Casos de uso

- Analisis de conversaciones financieras: el adaptador podria utilizarse para extraer informacion relevante de dialogos con clientes en el sector bancario o de seguros, identificando intenciones, quejas o solicitudes, aunque no se ha verificado su rendimiento en esta tarea.
- Evaluacion de riesgo crediticio: dado el sufijo "high_risk" en el nombre, podria estar orientado a clasificar conversaciones o respuestas en escenarios de alto riesgo, por ejemplo, deteccion de fraude o impago.
- Preguntas de opcion multiple en el dominio financiero: la etiqueta "mcq" sugiere que el modelo fue entrenado para responder cuestionarios de opcion multiple, posiblemente para evaluacion de conocimientos o certificaciones.
- Retencion de clientes: el termino "pc_retention" podria indicar que el adaptador ayuda a identificar senales de abandono en conversaciones y a generar respuestas que fomenten la permanencia del cliente.
- Asistente virtual para banca: combinado con el modelo base, el adaptador podria integrarse en un chatbot de atencion al cliente para responder consultas sobre productos financieros, aunque se requiere validacion adicional.
- Investigacion academica: dado que es un adaptador de acceso publico, puede servir como punto de partida para estudiar tecnicas de ajuste fino en dominios especializados, aunque la falta de documentacion limita su reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base EXAONE-3.5-7.8B-Instruct ha sido evaluado en el informe tecnico de LG AI Research, pero no hay datos especificos para este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 7.8B parametros requiere aproximadamente 15-16 GB en precision fp16. Con cuantizacion de 4 bits, puede reducirse a unos 4-5 GB. El adaptador LoRA anade una sobrecarga minima (menos de 1 GB).
- GPU recomendadas: para una inferencia fluida en fp16 se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB). Con cuantizacion 4-bit, una RTX 3060 de 12 GB o RTX 4070 pueden ser suficientes.
- Compatibilidad con GPU de consumo: si, con cuantizacion adecuada (por ejemplo, mediante llama.cpp o GPTQ), el modelo puede ejecutarse en GPUs de consumo de 8-12 GB.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con transformers + PEFT en Python, o exportar a formato GGUF para su uso con llama.cpp u Ollama. Tambien es compatible con servidores de inferencia como vLLM (si se fusionan los pesos del adaptador con el modelo base).
- Latencia y throughput: no se han publicado mediciones para este adaptador. En general, un modelo de 7.8B en una GPU moderna puede generar entre 20 y 50 tokens por segundo, dependiendo de la cuantizacion y el hardware.

## Comparativa con modelos similares

Dado que se trata de un adaptador sobre un modelo base especifico, la comparacion mas relevante es con el propio modelo base y con otros adaptadores similares del mismo autor (por ejemplo, `sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_accuracy_medium_sft_step510`, encontrado en la busqueda web). Tambien se puede comparar con otros modelos de tamano similar, como Llama-3-8B o Mistral-7B, aunque estos no tienen el mismo ajuste especializado.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| EXAONE-3.5-7.8B-Instruct (base) | 7.8B | 32K | Licencia propia de LG AI Research (no especificada en el repo) | Modelo base, sin ajuste especifico |
| Adaptador LoRA (este modelo) | LoRA (desconocido) | 32K (heredado) | No disponible | Ajuste para conversacion financiera, sin documentacion |
| Llama-3-8B-Instruct | 8B | 8K (ampliable) | MIT | Modelo generalista, sin especializacion financiera |

## Limitaciones y advertencias

- Documentacion inexistente: el repositorio no incluye una model card completa; no se conocen los datos de entrenamiento, el procedimiento ni las metricas de evaluacion.
- Sesgos desconocidos: al no haber informacion sobre el dataset de entrenamiento, no se pueden identificar sesgos potenciales, especialmente en un dominio sensible como el financiero.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion incorrecta o inventada, especialmente en dominios especializados si no ha sido entrenado con datos suficientes.
- Limitaciones de idioma: el modelo base esta optimizado para coreano e ingles; su rendimiento en otros idiomas puede ser inferior.
- Restricciones de licencia: la licencia del adaptador no esta especificada; la del modelo base debe consultarse en el repositorio oficial de LG AI Research antes de un uso comercial.
- Cautela en produccion: dado que el nombre sugiere aplicaciones de alto riesgo, se recomienda una validacion exhaustiva antes de desplegarlo en entornos reales de atencion al cliente o toma de decisiones.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_retention_random_anchor_high_risk_sft_step340
- Modelo base en HuggingFace: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Repositorio oficial de EXAONE 3.5 en GitHub: https://github.com/LG-AI-EXAONE/EXAONE-3.5
- Paper tecnico de EXAONE 3.5: https://arxiv.org/abs/2412.04862
- Adaptador similar del mismo autor: https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_accuracy_medium_sft_step510
