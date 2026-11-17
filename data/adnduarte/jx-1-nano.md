# adnduarte/jx-1-nano

## Resumen

JX-1 Nano es un modelo de lenguaje especializado en derecho en español, desarrollado por JX Labs, S.A. de C.V. (Juxa) y publicado por Adán Duarte Aupart bajo el identificador `adnduarte/jx-1-nano`. Se trata de un ajuste fino mediante QLoRA (LoRA rank 16) sobre la arquitectura NVIDIA Nemotron, un transformer híbrido que combina capas Mamba2 con mecanismos de atención. Con 8.888.227.328 parámetros totales (8,9B) y una ventana de contexto de 8K tokens, el modelo está diseñado para un único idioma: español jurídico en registro neutro e iberoamericano.

El problema que aborda es concreto y bien delimitado: la generación de texto legal que cite fuentes reales sin fabricarlas. Para ello incorpora un comportamiento de "cite-or-abstain" (citar o abstenerse): cuando no dispone de una fuente oficial verificable, el modelo declina responder en lugar de inventar una referencia normativa. Esta característica se entrena explícitamente con una capa de 100 pares de abstención anti-alucinación, sumada a los 2.292 pares de instrucción del set principal, hasta un total de 2.392 pares de ajuste fino.

Su relevancia actual radica en dos factores. Primero, la escasez de modelos abiertos especializados en dominio legal hispanohablante con licencia permisiva (Apache-2.0 en los pesos). Segundo, su diseño agnóstico de país: el núcleo no está atado a una jurisdicción concreta, sino que se plantea como base afinable por país, siendo México la primera jurisdicción trabajada. El modelo se distribuye únicamente en formato safetensors (35,6 GB de repositorio) y, en el momento de la publicación, no dispone de empaquetado GGUF debido a que el convertidor no mapea los tensores Mamba2 de esta arquitectura híbrida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NVIDIA Nemotron (híbrida Mamba2 + atención) |
| Parametros totales | 8.888.227.328 (8,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8K tokens |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors sin cuantizar; el autor no documenta variantes cuantizadas) |
| Idiomas soportados | Español (español jurídico, registro neutro e iberoamericano) |
| Licencia | Apache-2.0 (pesos); CC-BY (dataset y benchmark) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura base es NVIDIA Nemotron, un modelo híbrido que intercala capas Mamba2 (modelo de espacio de estados) con capas de atención tradicionales. Esta combinación busca reducir el coste computacional en secuencias largas manteniendo la capacidad de atención selectiva. Sobre esta base, JX Labs aplicó un ajuste fino supervisado mediante QLoRA con LoRA de rango 16, lo que permite adaptar un modelo de 8,9B parámetros con un coste de entrenamiento reducido respecto a un ajuste completo.

Los datos de entrenamiento provienen del set abierto `adnduarte/jx-1-nano-instruct`, compuesto por 2.292 pares de instrucción en español más una capa adicional de 100 pares de abstención anti-alucinación, totalizando 2.392 pares. El contenido enseña método jurídico (subsunción, jerarquía normativa, gradación de certeza, abstención y autoverificación) y estructura de redacción, pero explícitamente no contiene texto normativo copiado: la vigencia de las normas se consulta en la fuente oficial. El autor indica que la capa de jerga especializada, criterios de cita y fórmulas procesales por materia queda fuera del set abierto. No se documenta en la información disponible el uso de RLHF o DPO, ni el número de tokens de entrenamiento en términos absolutos.

## Capacidades

- Generación de texto jurídico en español: redacción de escritos, argumentaciones y análisis con estructura de subsunción y jerarquía normativa.
- Comportamiento cite-or-abstain: el modelo se abstiene de responder cuando no dispone de fuente oficial verificable, en lugar de fabricar citas.
- Razonamiento jurídico estructurado: gradación de certeza, autoverificación y criterios de admisibilidad en la respuesta.
- Capacidad multipaís: el núcleo es agnóstico de jurisdicción y sirve en cualquier país hispanohablante (LatAm, España, EE. UU. hispano).
- Conversación multiturno: validado en las pruebas de QA del harness de JUXA.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido (thinking mode) en la información disponible.

## Casos de uso

- Redacción de escritos y demandas en despachos: el modelo genera borradores con estructura de subsunción y jerarquía normativa, adecuado para despachos que necesitan plantillas jurídicas en español sin partir de cero.
- Asistencia a áreas legales internas de empresas: consultas sobre criterios y método jurídico con abstención cuando falta fuente oficial, lo que reduce el riesgo de que el equipo confíe en una cita inventada.
- Primera capa de triaje en atención legal: clasificación y orientación inicial de consultas en español con contexto de 8K tokens, derivando a revisión humana los casos que requieren fuente verificada.
- Formación y docencia jurídica: generación de explicaciones sobre conceptos como la subsunción o la jerarquía normativa, con la ventaja de que el modelo declina cuando no puede citar.
- Base para afinamiento por jurisdicción: al ser agnóstico de país y de pesos abiertos (Apache-2.0), un despacho o legaltech puede afinarlo con su propia normativa y criterios locales partiendo de este núcleo.
- Integración en pipelines de revisión documental: el comportamiento de abstención permite filtrar automáticamente respuestas sin respaldo, marcándolas para revisión humana antes de su uso en producción.
- Generación de borradores multipaís: para organizaciones con operaciones en varios países hispanohablantes, el mismo modelo sirve como base común antes de la especialización por jurisdicción.

## Benchmarks y rendimiento

El autor reporta únicamente el QA del harness de JUXA: 7/7 pruebas PASS (subsunción, abstención, cita, multipaís, redacción, identidad y multiturno) con 0 citas fabricadas verificadas de forma determinista. El resto de métricas no tiene corrida publicada y el autor las muestra como "—" sin estimarlas.

| Metrica | Valor | Metodo |
|---|---|---|
| QA del harness JUXA | 7/7 PASS | Pruebas de subsunción, abstención, cita, multipaís, redacción, identidad y multiturno |
| Citas fabricadas | 0 | Verificación determinista (QA 7/7) |
| recall@10 | — (sin corrida publicada) | Golden set legal, pendiente en `juxa-legal-bench` |
| Abstención correcta | — (sin corrida publicada) | Casos sin fuente, pendiente de publicación |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8,9B parámetros en safetensors sin cuantizar, se requiere aproximadamente 18 GB en FP16/BF16 solo para pesos, más overhead de KV cache y activaciones; en la práctica, 24 GB o más para contexto completo de 8K.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para FP16 con margen ajustado; GPUs de 16 GB no son suficientes en precisión completa.
- Cabe en consumer GPU: sí, en RTX 4090 (24 GB) en BF16, aunque con margen limitado para contexto largo; en GPUs de 16 GB requeriría cuantización, que el autor no distribuye oficialmente.
- Opciones de despliegue: vLLM (recomendado por el autor, con soporte nativo de la arquitectura Nemotron híbrida Mamba2 + atención) y transformers. GGUF/Ollama no están disponibles: el convertidor no mapea los tensores Mamba2 y el autor indica que se habilitará cuando NVIDIA publique el GGUF oficial. TGI no se documenta.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| JX-1 Nano | 8,9B | 8K | Apache-2.0 (pesos) | Legal en español, cite-or-abstain | safetensors, vLLM, transformers |
| NVIDIA Nemotron (base) | no disponible en la información | no disponible | no disponible | Modelo generalista | no disponible |
| Alternativas legales en español de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos comparables de la misma categoría (legal en español, ~9B) que permitan una comparación cuantitativa rigurosa. La comparación cualitativa más directa es con el modelo base NVIDIA Nemotron, del que JX-1 Nano hereda la arquitectura pero del que no se detallan parámetros ni contexto en la información disponible.

## Limitaciones y advertencias

- Puede cometer errores: el autor advierte explícitamente que en uso legal debe verificarse siempre contra la fuente oficial.
- El set abierto no incluye texto normativo; la vigencia y la admisibilidad de las normas se dictaminan por el harness o la fuente oficial, no por el modelo.
- recall@10 y la tasa de abstención correcta no tienen corrida publicada, por lo que el rendimiento en recuperación y abstención no está cuantificado de forma independiente.
- No debe usarse como asesoría legal sin revisión humana.
- Contexto limitado a 8K tokens, insuficiente para documentos legales extensos o expedientes completos en una sola pasada.
- Monolingüe en español: no soporta consultas ni generación en otros idiomas.
- Sin empaquetado GGUF ni soporte Ollama en el momento de la publicación, lo que limita el despliegue en entornos de CPU o GPUs de gama baja.
- Licencia Apache-2.0 en los pesos permite uso comercial, pero el dataset y el benchmark están bajo CC-BY, lo que exige atribución si se reutilizan.
- El modelo es la primera iteración por jurisdicción (México); el rendimiento en otras jurisdicciones hispanohablantes no está validado con benchmarks publicados.
- No se documentan sesgos específicos conocidos en la información disponible, más allá del riesgo general de alucinación mitigado por la capa de abstención.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adnduarte/jx-1-nano
- Dataset de instrucción: https://huggingface.co/datasets/adnduarte/jx-1-nano-instruct
- Benchmark legal: https://huggingface.co/datasets/adnduarte/juxa-legal-bench
- Modelo base NVIDIA Nemotron: https://huggingface.co/nvidia/Nemotron
