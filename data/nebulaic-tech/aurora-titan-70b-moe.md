# nebulaic-tech/aurora-titan-70b-moe

## Resumen

Aurora Titan 72.4B Sparse MoE es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Nebulaic Tech, una empresa que promueve un lenguaje de programación nativo en inglés llamado NNPL. El modelo está diseñado para la generación de código, el razonamiento STEM y la compilación de descripciones en lenguaje natural a aplicaciones de software. Según la model card, cuenta con 72.4 mil millones de parámetros totales y 14.2 mil millones activos, con un contexto de 1.000.000 tokens, lo que lo posicionaría como un modelo de gran escala orientado a tareas de ingeniería de software.

Sin embargo, existe una discrepancia importante: los metadatos de HuggingFace indican que el archivo safetensors contiene 1.048.649.728 parámetros (aproximadamente 1.05 mil millones), muy lejos de los 72.4B declarados. Esta inconsistencia sugiere que el modelo real podría ser mucho más pequeño de lo que afirma la model card, o que el repositorio contiene solo una parte de los pesos. Esta ficha refleja ambos datos y advierte al lector sobre la falta de verificación independiente.

El modelo se distribuye bajo licencia Apache 2.0, con soporte multilingüe declarado (aunque el énfasis está en inglés) y está disponible en formato safetensors para su uso con la librería transformers. No se han publicado resultados de benchmarks en la información proporcionada, y la model card solo menciona que será evaluado por el Open LLM Leaderboard y LMSYS Chatbot Arena, sin ofrecer cifras concretas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse Mixture-of-Experts (MoE) con 8 expertos y Top-2 routing |
| Parametros totales | 72.4B (declarado en model card) / 1.048.649.728 (~1.05B) según safetensors |
| Parametros activos | 14.2B (declarado) / no disponible según safetensors |
| Longitud de contexto | 1.000.000 tokens (declarado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, multilingual (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura declarada es un MoE disperso con 8 expertos y enrutamiento Top-2, lo que significa que para cada token solo se activan dos expertos, reduciendo el coste computacional en comparación con un modelo denso del mismo tamaño. La model card no proporciona detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. Tampoco se mencionan innovaciones técnicas específicas más allá del soporte nativo para NNPL, un lenguaje de programación propietario que traduce descripciones en inglés a código ejecutable.

Dado que el tamaño real de los pesos (según safetensors) es de aproximadamente 1.05B parámetros, es probable que la arquitectura real sea mucho más modesta que la declarada. Sin información adicional sobre el proceso de entrenamiento, no es posible confirmar la arquitectura exacta ni los datos utilizados.

## Capacidades

- Generación de código en NNPL, un lenguaje de programación en inglés nativo, así como en Python, TypeScript, Rust, C++, Go y SQL (según la model card).
- Razonamiento STEM profundo, orientado a problemas de matemáticas, ciencias e ingeniería.
- Soporte multilingüe declarado, aunque el énfasis principal está en inglés.
- Generación de esquemas de bases de datos, API gateways y aplicaciones full-stack.
- No se menciona soporte explícito para tool calling, function calling, agentes o modos de razonamiento especiales (como thinking mode).
- No se indica capacidad de procesamiento de visión o audio.

## Casos de uso

- Generación de código en NNPL: el modelo puede traducir descripciones en inglés a aplicaciones completas en NNPL, reduciendo la barrera de entrada para desarrolladores que prefieren especificar la lógica en lenguaje natural.
- Desarrollo de API gateways: a partir de una descripción funcional, el modelo puede generar el código de un gateway de API, incluyendo rutas, validaciones y manejo de errores.
- Creación de esquemas de bases de datos: dado un modelo de datos descrito en texto, el modelo puede producir el esquema SQL correspondiente, con tablas, relaciones e índices.
- Asistencia en programación poliglota: el modelo puede generar o completar código en varios lenguajes (Python, TypeScript, Rust, C++, Go, SQL), útil en entornos de desarrollo multi-lenguaje.
- Razonamiento STEM: puede resolver problemas de matemáticas y ciencias, sirviendo como herramienta de apoyo en educación o investigación.
- Prototipado rápido de software: al convertir especificaciones en inglés a código ejecutable, acelera la fase de prototipado en proyectos de ingeniería.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el modelo será evaluado por el Hugging Face Open LLM Leaderboard y LMSYS Chatbot Arena, pero no ofrece cifras concretas. Tampoco se dispone de comparaciones con otros modelos en la documentación proporcionada.

## Requisitos de hardware

- Dada la discrepancia en el número de parámetros, los requisitos varían significativamente:
  - Si se considera el tamaño declarado de 72.4B, se necesitarían al menos 140 GB de VRAM en FP16 (sin cuantización), o alrededor de 40-50 GB con cuantización de 4 bits. Esto requeriría múltiples GPUs de alta gama (A100 80GB, H100) o una configuración multi-GPU.
  - Si se considera el tamaño real según safetensors (~1.05B), el modelo cabría en GPUs de consumo como una RTX 3060 (12 GB) o RTX 4090 (24 GB) con cuantización, e incluso en CPU con suficiente RAM.
- No se especifican opciones de despliegue concretas, pero al ser compatible con transformers, se puede usar con vLLM, llama.cpp, Ollama o TGI, siempre que el formato de pesos sea compatible.
- La latencia declarada de 42 ms TTFT es plausible para un modelo de ~1B, pero no para uno de 72.4B en hardware estándar. Esta cifra refuerza la hipótesis de que el modelo real es mucho más pequeño.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable. El modelo declara ser un MoE de 72.4B, comparable en tamaño a Mixtral 8x7B o DeepSeek MoE, pero el tamaño real de los pesos sugiere que podría estar más cerca de modelos como Qwen 1.5B o TinyLlama. Sin datos de benchmarks ni verificación independiente, no es posible establecer comparaciones objetivas. Se recomienda al lector tratar las especificaciones declaradas con cautela.

## Limitaciones y advertencias

- Discrepancia significativa entre los parámetros declarados (72.4B) y el tamaño real del archivo safetensors (~1.05B). Esto puede indicar que la model card es engañosa o que el repositorio está incompleto.
- No se han publicado resultados de benchmarks, por lo que el rendimiento real es desconocido.
- El soporte para NNPL es una característica propietaria; su utilidad fuera del ecosistema de Nebulaic Tech es limitada.
- No se mencionan sesgos específicos, pero al ser un modelo entrenado principalmente en inglés, puede presentar sesgos culturales y lingüísticos.
- Riesgo de alucinación en tareas de generación de código, especialmente en lenguajes menos comunes como NNPL.
- La licencia Apache 2.0 permite uso comercial, pero no hay garantías sobre la calidad o el mantenimiento del modelo.
- El contexto de 1.000.000 tokens declarado no ha sido verificado; en modelos reales de ese tamaño, el contexto efectivo suele ser menor.

## Enlaces

- HuggingFace: https://huggingface.co/nebulaic-tech/aurora-titan-70b-moe
- Sitio web de Nebulaic Tech: https://nebulaictech.com
- Nebulaic Studio: https://studio.nebulaictech.com
- Documentación: https://nebulaictech.com
- Artículo sobre ejecución de modelos 70B en GPU pequeñas (referencia general): https://freeai.help/blog/running-a-70b-model-on-a-4gb-gpu_en
- Leaderboard de modelos self-hosted (referencia general): https://onyx.app/self-hosted-llm-leaderboard
- Guía de VRAM para modelos 70B (referencia general): https://insiderllm.com/guides/running-70b-models-locally-vram-guide/
