# open-athena/snowball-67b-a2b-base-262k-qk175-skew8

## Resumen

Snowball 67B-A2B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por open-athena, orientado a la investigación en contextos largos. Se trata de un export en BF16 del paso 157.000 de una comparativa de long-context, en la que el contexto se extendió a 262.144 tokens mediante un multiplicador de atención QK de 1.75 y un upsampling de 8× de documentos largos durante la extensión.

El modelo tiene 67.078.882.816 parámetros en total, con aproximadamente 2.000 millones de parámetros activos por token, 26 capas, 256 expertos de los que se seleccionan 4 por token, y un vocabulario de 128.256 entradas. Es un modelo base, es decir, no ha sido afinado para instrucciones, por lo que debe usarse mediante completions de texto o un fine-tuning posterior.

Al estar catalogado como parte del ecosistema Marin, requiere el fork de vLLM de Marin para su servida, que registra la arquitectura GrugMoeForCausalLM. Su licencia es OpenMDW 1.1 y la documentación oficial indica que solo soporta inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (GrugMoeForCausalLM) |
| Parametros totales | 67.078.882.816 (67B) |
| Parametros activos | ~2B por token (4 de 256 expertos) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | No disponible (export BF16) |
| Idiomas soportados | Inglés (en) |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de Mixture of Experts denominada GrugMoeForCausalLM, registrada en el fork de vLLM de Marin. Consta de 26 capas, 256 expertos y una selección activa de 4 expertos por token, lo que lo convierte en un MoE de 67B parámetros totales con solo 2B activos en cada paso de decodificación. La atención incorpora un multiplicador QK (qk_mult) de 1.75, una técnica que modifica la escala de las consultas y claves para extender la ventana de contexto. La configuración de cinco cabezas KV es otra particularidad que condiciona el despliegue con expert parallelism.

Según la información disponible, el entrenamiento consiste en una extensión de contexto realizada entre los pasos 156.000 y 157.000, con documentos de contexto largo sobremuestreados 8 veces (skew 8×). El modelo es un base model: no se menciona ningún proceso de instrucción, RLHF ni DPO. Los datos exactos del preentrenamiento, el número total de tokens y la composición del dataset no están disponibles en la documentación proporcionada.

## Capacidades

- Generación de texto: como modelo base, genera texto sin estar afinado para seguir instrucciones. Se deben usar completions de texto.
- Contexto largo: procesa hasta 262.144 tokens, lo que permite manejar documentos extensos en una sola pasada.
- Eficiencia en inferencia: al activar solo 4 de los 256 expertos por token, el coste de cómputo es proporcional a 2B parámetros activos, no a los 67B totales.
- Tool calling / function calling: no soportado de forma nativa.
- Soporte para agentes y razonamiento multi-paso: no disponible sin un fine-tuning específico.
- Capacidades multilingües: solo inglés según la metadata del modelo.
- Visión, audio u otras modalidades: no disponibles.
- Chat template: el tokenizer incluye una plantilla de chat, pero esta no indica un ajuste de instrucciones; se recomienda usar el modelo como autoregressive text completion.

## Casos de uso

- Análisis de documentos extensos: el modelo puede procesar contratos, informes técnicos o sentencias judiciales de más de 200.000 tokens en una sola pasada, sin necesidad de dividirlos. Esto es posible gracias a su contexto de 262.144 tokens.
- Fine-tuning para dominios especializados: al ser un modelo base, permite ajustarlo con datos propios mediante SFT. Es adecuado para crear asistentes personalizados en sectores legales, financieros o sanitarios, donde se dispone de corpus propios y se requiere un control fino del estilo y el contenido.
- Investigación en eficiencia MoE: con 256 expertos y solo 4 activos por token, es una plataforma experimental para estudiar el equilibrio entre parámetros totales y coste de cómputo en inferencia.
- Generación de contenido de formato largo: dado el contexto de 262K, puede mantener coherencia en novelas, guiones o manuales extensos, siempre que se utilice mediante completions de texto.
- Evaluación de nuevas técnicas de atención: el uso de qk_mult=1.75 y el sobremuestreo de documentos largos permite investigar el efecto de estas técnicas en la recuperación de información en contextos extensos.
- Pruebas de despliegue con expert parallelism: la configuración documentada de 8 H100 con tensor parallelism 1, data parallelism 8 y expert parallelism lo convierte en un caso de uso para validar infraestructuras de servida en clústeres que ejecuten el fork de vLLM de Marin.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan 134,2 GB. La configuración de servida documentada usa 8 GPU H100 de 80 GB con expert parallelism, lo que proporciona 640 GB de VRAM agregada. No se ha indicado una cifra mínima de VRAM por GPU.
- GPU recomendadas: 8x H100 (80 GB) según la configuración de referencia del autor.
- Consumer GPU: no disponible; el modelo no cabe en una GPU de consumo aislada, ni siquiera en RTX 4090 (24 GB).
- Opciones de despliegue: Marin vLLM fork (GrugMoeForCausalLM). No es compatible con vLLM estándar ni con llama.cpp u Ollama, al no existir cuantizaciones GGUF publicadas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Se ha identificado una variante anterior del mismo proyecto en HuggingFace: open-athena/snowball-67b-a2b-base-262k-qk157. A continuación se comparan los datos conocidos; el resto no está disponible en la información proporcionada.

| Modelo | Parámetros totales | Contexto | QK | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| open-athena/snowball-67b-a2b-base-262k-qk175-skew8 | 67.078.882.816 | 262.144 | 1.75 | OpenMDW 1.1 | HuggingFace |
| open-athena/snowball-67b-a2b-base-262k-qk157 | No disponible | 262.144 (según nombre) | 1.57 (según nombre) | No disponible | HuggingFace |

## Limitaciones y advertencias

- Al ser un modelo base, no está afinado para seguir instrucciones; un uso directo con prompts conversacionales puede producir respuestas poco alineadas.
- No se han publicado benchmarks, por lo que se desconoce su rendimiento real en tareas estándar como MMLU, HumanEval o GSM8K.
- El upload no ha pasado una prueba de generación ni de paridad numérica, según la propia model card. Aunque se validan tamaños y checksums, no se ha comprobado que las salidas sean idénticas al checkpoint original.
- Dependencia de un fork de vLLM específico (Marin), lo que limita la compatibilidad con herramientas de despliegue estándar.
- Licencia OpenMDW 1.1: es necesario revisar los términos de la licencia antes de un uso comercial o de redistribución, ya que no es una licencia de uso común.
- Idioma limitado a inglés según la metadata del modelo.
- No se han publicado cuantizaciones de 4 u 8 bits, por lo que el modelo requiere una gran cantidad de VRAM en su formato original.

## Enlaces

- HuggingFace: https://huggingface.co/open-athena/snowball-67b-a2b-base-262k-qk175-skew8
- Variante QK 1.57: https://huggingface.co/open-athena/snowball-67b-a2b-base-262k-qk157
- Issue de la comparativa long-context: https://github.com/marin-community/marin/issues/8977
- Fork de vLLM de Marin: https://github.com/marin-community/vllm
- Registro de servida y evaluación: https://github.com/marin-community/marin/issues/8702
- Pipeline SFT para modelos Marin: https://storage.googleapis.com/marin-public/benjaminfeuer/standing-up-a-cold-start-sft-pipeline-for-marin-models/2026.08.16/index.html
