# jonas-mo/llama-cargo-sft-v15

## Resumen

`llama-cargo-sft-v15` es un ajuste fino supervisado (SFT) del modelo `unsloth/Llama-3.1-8B-Instruct-bnb-4bit`, publicado por el usuario de HuggingFace `jonas-mo`. El repositorio ocupa 0,2 GB y contiene pesos en formato `safetensors` generados con TRL 0.24.0; no se documentan el conjunto de datos, los hiperparámetros ni el número de pasos de entrenamiento.

El modelo base es Llama 3.1 8B Instruct, un transformer decoder-only de 8.030 millones de parámetros con 128.000 tokens de contexto, cuantizado a 4 bits con bitsandbytes en el checkpoint de partida. El tag `unsloth` y el uso de un base en 4 bits apuntan a un flujo de QLoRA o SFT con pesos cuantizados, aunque la model card no confirma el método exacto ni si el repositorio contiene un adaptador LoRA o el checkpoint completo.

Su interés práctico es el de un artefacto de ajuste reproducible sobre una base conocida: permite evaluar si el SFT aporta mejoras en un dominio concreto sin partir de cero. Ahora bien, la ausencia de licencia, de evaluación y de documentación sobre los datos limita su uso en producción sin una validación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención causal, GQA y RoPE (heredada de Llama 3.1 8B) |
| Parámetros totales | 8.030 millones (8,03 B), heredados del modelo base |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 128.000 tokens en el modelo base; no se documenta la longitud efectiva tras el SFT |
| Tipos de cuantización | Pesos base en bitsandbytes 4-bit; el repositorio no declara GPTQ, AWQ ni GGUF |
| Idiomas soportados | No disponible en la model card; el base declara inglés, alemán, francés, italiano, portugués, hindi, español y tailandés |
| Licencia | No disponible; el campo `licence` contiene el literal `license`, sin identificador válido. El base usa Llama 3.1 Community License |
| Formato de pesos | `safetensors` |
| Tamaño del repositorio | 0,2 GB |
| Modelo base | `unsloth/Llama-3.1-8B-Instruct-bnb-4bit` |
| Librería y framework | `transformers`; entrenado con TRL 0.24.0, Transformers 5.5.0, PyTorch 2.11.0, Datasets 4.3.0 y Tokenizers 0.22.2 |
| Descargas / likes | 0 / 0 según los metadatos disponibles |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B: 32 capas, dimensión oculta de 4.096, 32 cabezas de atención con 8 cabezas KV (GQA), dimensión de cabeza de 128 y vocabulario de 128.256 tokens. El modelo base se entrenó con del orden de 15 billones de tokens y después pasó por fases de ajuste instructivo y alineamiento (RLHF/DPO) por parte de Meta. El checkpoint utilizado aquí está cuantizado a 4 bits con bitsandbytes, lo que reduce el peso en memoria a aproximadamente 5-6 GB antes del SFT.

El entrenamiento documentado es únicamente SFT con TRL 0.24.0. No se especifican el dataset, su composición, el número de tokens, la longitud de las secuencias, la tasa de aprendizaje ni si se congelaron capas. Tampoco se indica si el resultado es un adaptador LoRA, un QLoRA fusionado o un checkpoint completo; el tamaño de 0,2 GB es coherente con un adaptador o con pesos parciales, no con un modelo de 8B en 4 bits, que rondaría los 5 GB. Esta discrepancia debe resolverse antes de cargar el modelo con el ejemplo de la model card.

## Capacidades

- Generación de texto y seguimiento de instrucciones multirregla, heredados del base Instruct.
- Razonamiento y resolución de problemas de varios pasos, incluyendo matemáticas básicas y intermedias.
- Generación, explicación y revisión de código en lenguajes habituales, con calidad dependiente de la validación del SFT.
- Soporte de tool calling / function calling, ya presente en Llama 3.1 Instruct; no se ha evaluado su adherencia tras el ajuste.
- Uso en agentes con razonamiento multi-paso y llamadas a herramientas externas, siempre que se validen los esquemas de salida.
- Capacidades multilingües heredadas: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés; el SFT puede haber degradado alguno de estos idiomas.
- Ventana de contexto de hasta 128.000 tokens en el base, adecuada para documentos largos y conversaciones extensas.
- No se documentan capacidades de visión, audio, thinking mode explícito ni decodificación especulativa.

## Casos de uso

- **Asistente especializado de dominio:** el SFT puede adaptar el estilo y las respuestas a un sector concreto. Se usaría como punto de partida para un chatbot interno, validando primero que el ajuste no haya degradado las instrucciones generales del base.
- **RAG sobre documentación extensa:** con hasta 128.000 tokens de contexto en el base, puede ingerir manuales, contratos o informes de más de 100 páginas en una sola ventana, siempre que la VRAM permita mantener la caché KV.
- **Generación y revisión de código en local:** un modelo de 8B en 4 bits cabe en GPU de consumo y permite autocompletado, explicación de funciones y revisión de parches sin enviar código a un servicio externo.
- **Agentes con tool calling:** puede integrarse en un orquestador que exponga funciones mediante JSON Schema; su tamaño reduce la latencia frente a modelos mayores y facilita el despliegue en vLLM o TGI.
- **Atención al cliente multilingüe:** el base cubre ocho idiomas, por lo que puede gestionar conversaciones multi-turno en español, inglés, francés o portugués, con la cautela de que el SFT no documenta su comportamiento por idioma.
- **Extracción estructurada y clasificación:** útil para convertir correos, tickets o informes en JSON, tablas o campos normalizados; el SFT puede fijar el formato de salida y reducir la necesidad de postprocesado.
- **Despliegue on-premise o en hardware de consumo:** al partir de un base en 4 bits, es viable en una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB para contextos moderados, lo que encaja en entornos con requisitos de privacidad.
- **Banco de pruebas de pipelines de SFT:** sirve como artefacto para comparar recetas de entrenamiento con TRL y Unsloth, siempre que se documenten los datos y las métricas de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni evaluaciones propias del ajuste, y no se trasladan las puntuaciones del modelo base porque el SFT puede alterarlas sin que exista una medición que lo confirme.

## Requisitos de hardware

- **VRAM en FP16/BF16:** aproximadamente 16,1 GB solo para los pesos; con caché KV para 8.000 tokens, alrededor de 20-24 GB. Para 32.000 tokens, 32-36 GB; para 128.000 tokens, 32 GB solo de caché KV más los pesos, por lo que se necesitan 48-80 GB o atención con paginación.
- **VRAM en 8 bits:** alrededor de 8,5 GB de pesos; 12-16 GB con contexto de 8.000 tokens.
- **VRAM en 4 bits:** aproximadamente 5,5-6 GB de pesos; 10-12 GB con contexto de 8.000 tokens y 22-24 GB para aprovechar 128.000 tokens.
- **GPU recomendadas:** A100 40/80 GB y H100 80 GB para FP16 con contexto largo; RTX 4090 24 GB para FP16 con contexto moderado o 4 bits con contexto largo; RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4070 Ti Super 16 GB para 4 bits en contextos de 4.000-8.000 tokens.
- **Consumer GPU:** sí cabe en 4 bits. En FP16, una RTX 4090 puede ejecutarlo con contexto de 8.000-16.000 tokens, pero no con la ventana completa de 128.000 tokens.
- **Opciones de despliegue:** `transformers` con `pipeline`, vLLM o TGI para FP16/AWQ/GPTQ, llama.cpp u Ollama previa conversión a GGUF, y PEFT si el repositorio contiene finalmente un adaptador LoRA. Para el ajuste, Unsloth y TRL.
- **Latencia y throughput:** no disponibles. Dependerán de la GPU, la cuantización, la longitud de contexto y el backend; no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Benchmarks |
|---|---|---|---|---|---|
| `jonas-mo/llama-cargo-sft-v15` | 8,03 B | 128.000 tokens heredados; efectivos no documentados | No disponible | Repositorio público, 0 descargas | No disponible |
| `meta-llama/Llama-3.1-8B-Instruct` | 8,03 B | 128.000 tokens | Llama 3.1 Community License | Público en HuggingFace | Publicados en su model card; no reproducidos aquí |
| `mistralai/Mistral-7B-Instruct-v0.3` | 7,25 B | 32.000 tokens | Apache 2.0 | Público en HuggingFace | Publicados en su model card; no reproducidos aquí |
| `Qwen/Qwen2.5-7B-Instruct` | 7,62 B | 131.072 tokens | Apache 2.0 | Público en HuggingFace | Publicados en su model card; no reproducidos aquí |

La comparación de rendimiento no puede completarse: este fine-tune no aporta métricas y las cifras de los modelos alternativos no forman parte de la información proporcionada. En términos de licencia, Mistral 7B y Qwen2.5 7B ofrecen Apache 2.0, mientras que este repositorio no declara licencia utilizable, lo que supone una diferencia relevante para uso comercial.

## Limitaciones y advertencias

- **Licencia no definida:** el campo `licence: license` es un marcador de posición. No hay un archivo de licencia ni un identificador SPDX, por lo que el uso comercial y la redistribución no están autorizados de forma explícita. El modelo base añade además las restricciones de la Llama 3.1 Community License.
- **Tamaño del repositorio incoherente:** 0,2 GB no corresponde a un checkpoint completo de 8B en 4 bits. Es probable que contenga solo un adaptador LoRA o pesos parciales, pero no está confirmado; el ejemplo de `pipeline` de la model card podría fallar si se carga como modelo completo.
- **Sin evaluación:** no hay benchmarks, pruebas de regresión ni comparación con el base. No se puede afirmar que el SFT mejore el rendimiento ni que no haya provocado olvido catastrófico.
- **Dataset desconocido:** no se documentan la procedencia, el idioma, la composición ni el filtrado de los datos. Esto impide evaluar sesgos, contaminación por benchmarks o cumplimiento de derechos de autor.
- **Riesgo de
