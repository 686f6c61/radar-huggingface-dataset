# ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-v2-e2

## Resumen

Llama-3.1-8B-Instruct-SciQ-QLoRA-v2-e2 es un adaptador PEFT/QLoRA de tipo LoRA que se aplica sobre el modelo base meta-llama/Llama-3.1-8B-Instruct. Lo desarrolla el usuario ahmedelgebaly y está orientado a generación de texto con formato de preguntas y respuestas de temática científica. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador (0,4 GB) que modifica el comportamiento del Llama 3.1 8B Instruct original para ajustarlo al estilo del dataset ahmedelgebaly/SciQ_Alpaca.

El adaptador se ha entrenado con QLoRA en cuantización 4-bit NF4, con rango LoRA 32, alpha 64 y dropout 0,05, durante 2 épocas y 520 pasos, con longitud de secuencia 512 y learning rate 2e-4 con scheduler coseno. El entrenamiento se realizó con Axolotl y PEFT, y alcanzó una pérdida de validación de 0,8779 y una perplejidad de validación de 2,4057.

Es relevante como ejemplo reproducible de ajuste fino eficiente en parámetros sobre un modelo de 8B para una tarea concreta de QA científico, y forma parte de una ablación por épocas (e1 a e5) en la que el autor recomienda la versión e1 por presentar la menor pérdida de validación. El repositorio no tiene descargas ni likes y la model card no documenta idiomas soportados ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Llama 3.1 8B Instruct; entrenamiento QLoRA con cuantización 4-bit NF4 |
| Parametros totales | Adaptador LoRA con r=32 sobre un modelo base de 8B (número exacto de parámetros del adaptador no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Llama 3.1 8B Instruct soporta 128K tokens, pero el adaptador se entrenó con secuencias de 512 tokens |
| Tipos de cuantizacion | Entrenado con QLoRA 4-bit NF4; el adaptador se distribuye en safetensors y se puede combinar con cuantizaciones del modelo base no especificadas |
| Idiomas soportados | No disponible |
| Licencia | llama3.1 (Llama 3.1 Community License, heredada del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama 3.1 8B Instruct, un transformer decoder-only de 8B parámetros con atención causal estándar. El ajuste se realiza mediante LoRA con rango 32, alpha 64 y dropout 0,05, entrenado en QLoRA con cuantización 4-bit NF4 del modelo base. La longitud de secuencia de entrenamiento es de 512 tokens, el batch efectivo es 16 y se emplean 2 épocas (520 pasos) con learning rate 2e-4 y scheduler coseno. El framework utilizado es Axolotl junto con PEFT.

El dataset de entrenamiento es ahmedelgebaly/SciQ_Alpaca, en formato Alpaca (instruction / input / output), derivado presumiblemente del corpus SciQ de preguntas científicas. No se documenta el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO. La model card no reporta innovaciones técnicas adicionales (decodificación especulativa, atención linear, etc.) más allá del propio ajuste eficiente en parámetros.

## Capacidades

- Generación de texto conversacional y de QA de temática científica, ajustada al estilo del dataset SciQ_Alpaca.
- Respuesta a instrucciones en formato Alpaca (instruction / input / output).
- Hereda las capacidades del modelo base Llama 3.1 8B Instruct en la medida en que el adaptador no las degrade: generación de texto, razonamiento básico y código.
- Soporte de tool calling y function calling: no documentado en la model card; dependería del modelo base, no verificado para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles; la model card no especifica idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Evaluación de ajuste fino eficiente: usar el adaptador como referencia reproducible de QLoRA con Axolotl sobre Llama 3.1 8B para comparar hiperparámetros yépocas en una ablación controlada.
- QA científico en entornos educativos: el adaptador responde preguntas de ciencia en formato instrucción, adecuado para prototipos de asistentes de estudio con preguntas de opción múltiple o respuesta breve.
- Generación de pares pregunta-respuesta para aumento de datos: producir ejemplos adicionales de QA científico en formato Alpaca para ampliar corpus de entrenamiento.
- Investigación en ablación por épocas: comparar las versiones e1 a e5 para estudiar el efecto del sobreajuste en adaptadores LoRA de bajo rango.
- Prototipado de bajo coste: al ser un adaptador de 0,4 GB, permite experimentar con cambios de comportamiento sobre un modelo base ya desplegado sin duplicar pesos.
- Validación de pipelines PEFT: probar flujos de carga con `PeftModel.from_pretrained`, serialización de adaptadores y merge con el modelo base en entornos de CI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas de validación durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Val loss | 0,8779 |
| Val PPL | 2,4057 |
| Epocas | 2 |
| Pasos | 520 |

## Requisitos de hardware

- El adaptador pesa 0,4 GB; requiere además cargar el modelo base Llama 3.1 8B Instruct.
- Inferencia del modelo base en FP16: aproximadamente 16 GB de VRAM; en cuantización 4-bit: aproximadamente 5-6 GB de VRAM (estimación estándar para 8B, no confirmada en la model card).
- GPU recomendadas: A100, H100 o L40S para FP16 con contexto largo; RTX 4090 (24 GB) suficiente para FP16; RTX 3090/4080 (16-24 GB) para FP16 o 8-bit; GPUs consumer de 8-12 GB para cuantización 4-bit.
- Cabe en GPU consumer con cuantización 4-bit (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB).
- Opciones de despliegue: transformers + PEFT (carga documentada en la model card), vLLM o TGI tras fusionar el adaptador con el modelo base; llama.cpp/Ollama requerirían conversión a GGUF del modelo fusionado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-SciQ-QLoRA-v2-e2 | Adaptador LoRA r=32 sobre 8B | Entrenado a 512; base 128K | llama3.1 | safetensors (PEFT) | Val loss 0,8779; 0 descargas |
| Llama-3.1-8B-Instruct-SciQ-QLoRA-v2-e1 | Adaptador LoRA r=32 sobre 8B | Entrenado a 512; base 128K | llama3.1 | safetensors (PEFT) | Recomendado por el autor (menor val loss); mismo escenario |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128K | llama3.1 | safetensors | Modelo base sin ajuste específico de QA científico |
| Adaptadores SciQ comparables de otros autores | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- Es un adaptador, no un modelo autónomo: requiere descargar el modelo base meta-llama/Llama-3.1-8B-Instruct, que está sujeto a aceptación de la licencia de Meta.
- Entrenado con secuencias de 512 tokens: el rendimiento puede degradarse en contextos largos aunque el modelo base soporte 128K.
- Solo 520 pasos y 2 épocas sobre un dataset específico: riesgo alto de sobreajuste al estilo de SciQ_Alpaca y de degradación de capacidades generales del modelo base.
- La ablación por épocas indica que e2 no es la mejor variante según el autor (e1 presenta menor pérdida de validación), por lo que e2 puede no ser la elección óptima ni siquiera dentro de su propia familia.
- Riesgo de alucinación inherente a los modelos de 8B, no mitigado ni evaluado en la model card.
- Sesgos: no documentados; se heredan los del modelo base y los del dataset SciQ.
- Idiomas soportados no documentados: no se garantiza un comportamiento multilingüe adecuado.
- Uso comercial permitido bajo la Llama 3.1 Community License, con las restricciones de esa licencia (incluida la política de uso aceptable y la cláusula de denominación).
- No hay benchmarks publicados ni métricas de calidad fuera del conjunto de validación; no hay descargas ni validación por la comunidad.
- El autor pide citar el paper original de SciQ al usar este trabajo.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-v2-e2
- Dataset: https://huggingface.co/datasets/ahmedelgebaly/SciQ_Alpaca
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Adaptador hermano e1 (recomendado): https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-v2-e1
- Adaptador hermano e3: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-v2-e3
- Adaptador hermano e4: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-v2-e4
- Adaptador hermano e5: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-v2-e5
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
- Paper original de SciQ: no disponible en la información proporcionada
