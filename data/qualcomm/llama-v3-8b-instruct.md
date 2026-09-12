# qualcomm/Llama-v3-8B-Instruct

## Resumen

Llama-v3-8B-Instruct es la versión del modelo Llama 3 8B Instruct de Meta optimizada por Qualcomm para despliegue en dispositivo (*on-device*) sobre chipsets Snapdragon y Dragonwing. Se distribuye en el repositorio cualcomm/Llama-v3-8B-Instruct de HuggingFace y forma parte del ecosistema Qualcomm AI Hub Models, cuyo objetivo es compilar, perfilar y exportar el modelo para ejecutarlo en hardware Qualcomm sin depender de la nube.

El punto de partida es Meta-Llama-3-8B-Instruct, un transformer decoder-only de aproximadamente 8.000 millones de parámetros, al que se aplica cuantizacion w4a16 (pesos de 4 bits y activaciones de 16 bits) en la mayor parte de las capas, con una porción cuantizada a w8a16 (pesos de 8 bits). El resultado es un artefacto pensado para inferencia local en teléfonos, portátiles y plataformas embebidas con aceleración de NPU/GPU de Qualcomm.

Su relevancia actual reside en que permite ejecutar un modelo de 8B con una ventana de contexto de 4096 tokens en dispositivos móviles, con tasas de generación que van de unos 4,6 a más de 21 tokens por segundo según el chipset, y tiempos hasta el primer token de entre 0,1 y 7,3 segundos. Está orientado a aplicaciones Android y a escenarios con requisitos de privacidad o de operación sin conectividad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3, derivado de Meta-Llama-3-8B-Instruct) |
| Parametros totales | 8.000 millones (8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | w4a16 (4 bits pesos, 16 bits activaciones) y parcialmente w8a16 (8 bits pesos, 16 bits activaciones) |
| Idiomas soportados | Inglés (según la model card); metadatos de idioma no disponibles |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | PyTorch como librería declarada; los artefactos pre-exportados no se distribuyen por restricciones de licencia y el usuario debe compilarlos/exportarlos con la librería Qualcomm AI Hub Models |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Llama 3, en concreto un derivado de Meta-Llama-3-8B-Instruct. Qualcomm no reentrena el modelo: su aportación consiste en cuantizarlo y exportarlo para el runtime de sus plataformas. La cuantizacion aplicada es w4a16 en la mayor parte de la red y w8a16 en una parte de ella, una combinación que reduce el peso de los pesos a aproximadamente 4 bits por parámetro y mantiene las activaciones en 16 bits para preservar estabilidad numérica durante la inferencia.

Los detalles de entrenamiento (número de tokens, composición del dataset, ajuste por instrucciones y alineamiento) corresponden al modelo original de Meta y no se detallan en este repositorio, que se centra en la optimización y exportación. El proceso de exportación se realiza con la librería Qualcomm AI Hub Models, que permite definir pesos personalizados (por ejemplo, checkpoints afinados), formas de entrada personalizadas y configuraciones de dispositivo y runtime. No se indican innovaciones arquitectónicas propias más allá de la cuantizacion y la compilación para aceleración en hardware Qualcomm.

## Capacidades

- Generación de texto e instrucciones en inglés, con soporte de conversaciones multi-turno dentro de la ventana de 4096 tokens.
- Razonamiento y respuesta a preguntas en formato conversacional, heredado del ajuste de instrucciones de Llama 3 8B Instruct.
- Inferencia local en dispositivo sobre chipsets Snapdragon y Dragonwing mediante los runtimes GENIE y GENIEX_QAIRT.
- Ejecución con cuantizacion w4a16/w8a16 optimizada para memoria y latencia en plataformas móviles.
- No se documenta en esta ficha soporte explícito de *tool calling* / *function calling*, agentes, visión, audio ni modos de razonamiento extendido; estos extremos figuran como no disponibles en la información proporcionada.
- Capacidades multilingües: únicamente se declara inglés; no se mencionan otros idiomas.

## Casos de uso

- Asistentes conversacionales en dispositivo: el modelo puede gestionar conversaciones multi-turno de hasta 4096 tokens sin enviar datos a la nube, lo que resulta adecuado para aplicaciones Android con requisitos de privacidad.
- Funciones de resumen y redacción sin conectividad: al ejecutarse localmente sobre Snapdragon, permite resumir notas o correos y generar texto en escenarios offline.
- Chatbot de soporte integrado en aplicaciones móviles: con tasas de 14 a 21 tokens por segundo en dispositivos Snapdragon X2 Elite y 8 Elite Gen 5, ofrece respuestas de baja latencia para atención básica.
- Asistentes en portátiles con Snapdragon X Elite: el modelo puede integrarse en aplicaciones de escritorio para generación de texto y asistencia al usuario con un consumo energético bajo.
- Procesamiento de lenguaje en plataformas embebidas e industriales: los chipsets Dragonwing (IQ-9075, IQ-8275, Q-8750, IQ-X7181) permiten desplegar el modelo en dispositivos de borde y domótica.
- Prototipado y evaluación de modelos en el ecosistema Qualcomm AI Hub: el repositorio sirve para compilar, perfilar y exportar el modelo con configuraciones personalizadas antes de llevarlo a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí incluye una tabla de rendimiento de inferencia por dispositivo y runtime:

| Modelo | Runtime | Precision | Chipset | Contexto | Tokens por segundo | TTFT (rango, s) |
|---|---|---|---|---|---|---|
| Llama-v3-8B-Instruct | GENIE | w4a16 | Snapdragon 8 Elite Gen 5 Mobile | 4096 | 16,37 | 0,099 - 3,180 |
| Llama-v3-8B-Instruct | GENIE | w4a16 | Snapdragon 8 Elite Mobile | 4096 | 15,00 | 0,137 - 4,385 |
| Llama-v3-8B-Instruct | GENIE | w4a16 | Snapdragon X2 Elite | 4096 | 19,47 | 0,148 - 4,735 |
| Llama-v3-8B-Instruct | GENIE | w4a16 | Snapdragon X Elite | 4096 | 4,64 | 0,209 - 6,686 |
| Llama-v3-8B-Instruct | GENIE | w4a16 | Dragonwing IQ-9075 | 4096 | 10,76 | 0,183 - 5,865 |
| Llama-v3-8B-Instruct | GENIE | w4a16 | Dragonwing IQ-X7181 | 4096 | 4,64 | 0,209 - 6,686 |
| Llama-v3-8B-Instruct | GENIE | w4a16 | Dragonwing Q-8750 | 4096 | 15,00 | 0,137 - 4,385 |
| Llama-v3-8B-Instruct | GENIEX_QAIRT | w4a16 | Snapdragon 8 Elite Gen 5 Mobile | 4096 | 14,34 | 0,140 - 4,473 |
| Llama-v3-8B-Instruct | GENIEX_QAIRT | w4a16 | Snapdragon 8 Elite Mobile | 4096 | 14,05 | 0,182 - 5,825 |
| Llama-v3-8B-Instruct | GENIEX_QAIRT | w4a16 | Snapdragon X2 Elite | 4096 | 21,25 | 0,115 - 3,681 |
| Llama-v3-8B-Instruct | GENIEX_QAIRT | w4a16 | Snapdragon X Elite | 4096 | 11,33 | 0,229 - 7,322 |
| Llama-v3-8B-Instruct | GENIEX_QAIRT | w4a16 | Dragonwing IQ-8275 | 4096 | 9,88 | 0,220 - 7,045 |
| Llama-v3-8B-Instruct | GENIEX_QAIRT | w4a16 | Dragonwing IQ-9075 | 4096 | 9,68 | 0,203 - 6,502 |
| Llama-v3-8B-Instruct | GENIEX_QAIRT | w4a16 | Dragonwing IQ-X7181 | 4096 | 11,33 | 0,229 - 7,322 |
| Llama-v3-8B-Instruct | GENIEX_QAIRT | w4a16 | Dragonwing Q-8750 | 4096 | 14,05 | 0,182 - 5,825 |

El TTFT se expone como rango: el límite inferior corresponde a un prompt corto (hasta 128 tokens) y el superior a un prompt que ocupa toda la ventana de 4096 tokens.

## Requisitos de hardware

- Huella de pesos estimada: aproximadamente 4,5 GB para la combinación w4a16/w8a16 (cálculo aproximado a partir de 8B parámetros a 4-8 bits; no es un dato publicado).
- Plataformas objetivo: chipsets Snapdragon (8 Elite Gen 5 Mobile, 8 Elite Mobile, X2 Elite, X Elite) y Dragonwing (IQ-8275, IQ-9075, IQ-X7181, Q-8750).
- No está pensado para GPU de escritorio tipo A100, H100 o RTX 4090; el artefacto se compila para aceleración NPU/GPU integrada de Qualcomm. Para ejecución en GPU convencional habría que partir del modelo original de Meta.
- Opciones de despliegue: librería Qualcomm AI Hub Models para compilar y exportar, runtimes GENIE y GENIEX_QAIRT, y el tutorial LLM-on-Genie. El soporte de Genie se marcará como obsoleto próximamente, según la model card.
- No se distribuyen pesos pre-exportados por restricciones de licencia; cada usuario debe generar sus propios artefactos.
- Latencia observada: entre 4,64 y 21,25 tokens por segundo según chipset y runtime, con TTFT de 0,099 s a 7,322 s. No se especifican datos de throughput en servidor ni de vLLM, llama.cpp, Ollama o TGI, que no forman parte del flujo descrito para este artefacto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Licencia | Disponibilidad / despliegue |
|---|---|---|---|---|---|
| qualcomm/Llama-v3-8B-Instruct | 8B | 4096 | w4a16 / w8a16 | Llama 3 Community | On-device Qualcomm (GENIE / GENIEX_QAIRT); pesos pre-exportados no distribuidos |
| meta-llama/Meta-Llama-3-8B-Instruct | 8B | No disponible en esta ficha (modelo base sin cuantizar) | BF16/FP16 original | Llama 3 Community | HuggingFace; inferencia en GPU/CPU con frameworks estándar |
| meta-llama/Meta-Llama-3.1-8B-Instruct | 8B | 128.000 | BF16/FP16 original | Llama 3.1 Community | HuggingFace; alternativa de la misma familia con contexto ampliado |

No se dispone de datos de rendimiento comparativos de calidad entre estas variantes en la información proporcionada. La comparación se limita por tanto a parámetros, contexto, precisión, licencia y forma de despliegue.

## Limitaciones y advertencias

- Idiomas: la model card declara únicamente inglés; no hay soporte multilingüe documentado.
- Ventana de contexto limitada a 4096 tokens, inferior a la de otras variantes de la familia Llama 3.
- Riesgo de alucinación y de sesgos heredado del modelo base Meta-Llama-3-8B-Instruct; la cuantizacion w4a16 puede degradar ligeramente la calidad respecto al modelo en precisión completa.
- Licencia llama3 (Llama 3 Community License): impone restricciones de uso, incluida la cláusula de licencia de Meta y limitaciones para determinadas aplicaciones; conviene revisar el texto completo antes de un uso comercial.
- Por restricciones de licencia, Qualcomm no distribuye artefactos pre-exportados: es necesario compilar y exportar el modelo por cuenta propia.
- El runtime Genie se depreciará próximamente; se recomienda planificar la migración hacia GenieX.
- El rendimiento depende fuertemente del chipset: en Snapdragon X Elite la tasa cae a 4,64 tokens por segundo en GENIE, frente a más de 21 en Snapdragon X2 Elite con GENIEX_QAIRT.
- No se documentan capacidades de *tool calling*, agentes, visión ni audio para este artefacto concreto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/qualcomm/Llama-v3-8B-Instruct
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct/
- Licencia del modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct/blob/main/LICENSE
- Librería Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models/blob/v0.62.2/src/qai_hub_models/models/llama_v3_8b_instruct
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Quickstart de GenieX: https://geniex.aihub.qualcomm.com/en/get-started/quickstart
- Tutorial LLM-on-Genie: https://github.com/qualcomm/ai-hub-apps/tree/main/tutorials/llm_on_genie
- Anuncio de Meta Llama 3: https://ai.meta.com/blog/meta-llama-3/
- Comunidad Qualcomm AI Hub (Slack): https://aihub.qualcomm.com/community/slack
- Contacto de soporte: mailto:ai-hub-support@qti.qualcomm.com
- Web de Qualcomm: https://www.qualcomm.com/
- Información corporativa de Qualcomm: https://www.qualcomm.com/company
