# fraQtl/Qwen3.6-35B-A3B-compressed

## Resumen

El modelo `fraQtl/Qwen3.6-35B-A3B-compressed` es un artefacto de pesos comprimidos del modelo base Qwen/Qwen3.6-35B-A3B, un transformer de arquitectura MoE (Mixture of Experts) con 35.000 millones de parámetros totales y 3.000 millones de parámetros activos. Desarrollado por fraQtl, su objetivo principal es reducir la huella de memoria del modelo y permitir inferencia de contexto largo (hasta 128.000 tokens) en una única GPU de gama alta, manteniendo una calidad de generación prácticamente idéntica a la versión sin comprimir.

La compresión se implementa empaquetando los tensores de los expertos MoE en formato INT3, lo que reduce el tamaño en disco de aproximadamente 70 GB (FP16) a 25,53 GB, es decir, 2,74 veces más pequeño. Para cargar estos pesos comprimidos es necesario instalar el paquete `fraqtl-runtime`, un binario compilado que reconstruye los tensores en tiempo de carga. El modelo se distribuye en formato safetensors y requiere `trust_remote_code=True` en transformers. También existe una variante GGUF Q4_K_M en un repositorio hermano para su uso con llama.cpp, Ollama y LM Studio.

La relevancia de este lanzamiento radica en que permite ejecutar un modelo MoE de 35B en hardware de consumo o en una sola GPU de datacenter sin sacrificar contexto, algo que en la configuración estándar provoca desbordamiento de memoria a partir de 64K tokens. Los resultados publicados muestran una degradación mínima en métricas como MMLU (82,24% frente a 82,40%) y una mejora aparente en HumanEval (64,02% frente a 61,59%), aunque dentro de la varianza muestral.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en transformer, con atención de contexto largo |
| Parametros totales | 35.000 millones (según modelo base Qwen3.6-35B-A3B) |
| Parametros activos | 3.000 millones (A3B) |
| Longitud de contexto | 128.000 tokens (verificado en A100-80GB con compresión) |
| Tipos de cuantizacion | INT3 empaquetado (propietario, para safetensors) y GGUF Q4_K_M (en repositorio hermano) |
| Idiomas soportados | No disponible (el modelo base Qwen3.6 es multilingüe, pero no se especifica en la documentación) |
| Licencia | fraqtl-model-license (uso gratuito para carga e inferencia; capa de compresión de KV-cache de pago) |
| Formato de pesos | Safetensors comprimidos (requiere fraqtl-runtime) y GGUF para llama.cpp/Ollama |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer MoE con 35B parámetros totales y 3B activos por token, siguiendo la tendencia de modelos eficientes como Mixtral o Qwen2.5-A3B. La arquitectura incluye atención de contexto largo y mecanismos de razonamiento mejorados respecto a generaciones anteriores. El artefacto comprimido de fraQtl no modifica la arquitectura subyacente, sino que empaqueta los pesos de los expertos en un formato INT3 propietario, reduciendo el espacio de almacenamiento y la memoria necesaria durante la inferencia.

El proceso de compresión se realiza mediante un loader compilado (incluido en `fraqtl-runtime`) que reconstruye los tensores INT3 al formato esperado por transformers en tiempo de carga. No se han publicado detalles sobre el dataset de entrenamiento del modelo base ni sobre el proceso de compresión en sí (por ejemplo, si se usó cuantización con calibración o destilación). La model card indica que la compresión es una característica de almacenamiento, no un modo de ejecución opcional, y que la capa de compresión de KV-cache (que reduce aún más el consumo de memoria durante la generación) es una funcionalidad separada de pago.

## Capacidades

- Generación de texto conversacional y de larga forma con contexto de hasta 128.000 tokens en una sola GPU.
- Razonamiento y resolución de problemas matemáticos y de código, según los benchmarks publicados (MMLU 82,24%, HumanEval 64,02%).
- Soporte para tool calling y function calling: no documentado explícitamente en la model card, pero el modelo base Qwen3.6 lo incluye; se asume disponible pero no verificado en esta versión comprimida.
- Capacidades multilingües: no especificadas para esta versión; el modelo base Qwen3.6 soporta múltiples idiomas, pero no hay confirmación en la documentación.
- Modo de razonamiento extendido (thinking mode): no mencionado en la documentación.
- Compresión de KV-cache opcional (de pago) que reduce el consumo de memoria durante la generación, permitiendo contextos aún más largos en GPUs con menos VRAM.

## Casos de uso

- Análisis de documentos extensos: el modelo puede procesar contratos, informes financieros o artículos científicos de hasta 128K tokens sin truncamiento, gracias a la compresión que permite cargar el modelo completo en una A100-80GB. Es adecuado para tareas de resumen, extracción de información y respuesta a preguntas sobre el contenido completo.
- Asistente de programación en entornos con recursos limitados: con un rendimiento en HumanEval del 64,02%, puede integrarse en IDEs o pipelines de CI/CD para generación y revisión de código, ejecutándose en una GPU de 24 GB (con cuantización GGUF Q4_K_M) o en una A100 para contexto largo.
- Chatbot de atención al cliente con historial amplio: la ventana de 128K tokens permite mantener conversaciones multi-turno con todo el historial del usuario, evitando la pérdida de contexto. La versión GGUF facilita el despliegue en infraestructura local con llama.cpp u Ollama.
- Investigación académica en procesamiento del lenguaje natural: al ser un MoE eficiente, permite experimentar con generación de texto largo y razonamiento complejo en una sola GPU, reduciendo costes de cómputo frente a modelos densos de tamaño similar.
- Generación de documentación técnica y resúmenes ejecutivos: el modelo puede sintetizar grandes volúmenes de información técnica y producir resúmenes coherentes, aprovechando su capacidad de contexto largo y su baja degradación en perplejidad (WikiText-2 PPL 11,69).
- Prototipado rápido de agentes conversacionales: al soportar carga mediante transformers estándar (con el runtime instalado), se puede integrar en frameworks como LangChain o Haystack para construir agentes con memoria persistente y razonamiento multi-paso, sin necesidad de infraestructura distribuida.

## Benchmarks y rendimiento

La model card publica los siguientes resultados comparando la versión comprimida con la referencia FP16 del mismo modelo base. No se incluyen comparaciones con otros modelos de la misma categoría.

| Metrica | Referencia FP16 | fraQtl comprimido | Diferencia |
|---|---:|---:|---:|
| WikiText-2 perplejidad | 11,6041 | 11,6930 | +0,77% |
| MMLU (full 14K, 57 materias) | 82,40% | 82,24% | -0,16 pp |
| HumanEval pass@1 (N=164) | 61,59% | 64,02% | +2,43 pp (dentro de varianza) |
| HumanEval+ pass@1 (N=164) | 54,27% | 55,49% | +1,22 pp (dentro de varianza) |
| BigCodeBench (N=200) | No disponible | No disponible | El dato se corta en la model card |

Además, se reporta una prueba de recuperación de clave-valor en ∞Bench con 30/30 aciertos a ~125K tokens y coincidencia con la referencia FP16 en recuperación de KV para n=1/10/100/500/1500.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - A 16K contexto: 25,6 GB pico (cabe en una RTX 4090 24 GB con margen justo).
  - A 64K contexto: 36,8 GB pico (requiere GPU de datacenter como A100-80GB o A6000 48GB).
  - A 128K contexto: 51,7 GB pico (solo A100-80GB o similar).
- GPU recomendadas: A100-80GB para contexto máximo; RTX 4090 o RTX 6000 Ada para contextos de hasta 16K con safetensors; cualquier GPU con 24 GB usando la versión GGUF Q4_K_M (21,4 GB en disco).
- Opciones de despliegue:
  - Transformers con `fraqtl-runtime` instalado (solo Linux x86_64 + CUDA validado).
  - llama.cpp, Ollama, LM Studio, koboldcpp y Jan mediante el repositorio GGUF hermano.
  - vLLM y TGI: no documentado explícitamente, pero al ser compatible con transformers podría funcionar con adaptaciones.
- Latencia y throughput: no se proporcionan datos específicos en la documentación.

## Comparativa con modelos similares

La comparativa se centra en las variantes del mismo modelo base, ya que no se dispone de datos de otros MoE de tamaño similar.

| Modelo | Parámetros totales | Contexto | Tamaño en disco | MMLU | HumanEval | Licencia |
|---|---|---:|---:|---:|---:|---|
| Qwen3.6-35B-A3B (FP16) | 35B | 128K (teórico) | ~70 GB | 82,40% | 61,59% | Apache 2.0 (Qwen) |
| fraQtl comprimido (safetensors) | 35B | 128K (verificado) | 25,53 GB | 82,24% | 64,02% | fraqtl-model-license |
| fraQtl GGUF Q4_K_M | 35B | 128K (según repo) | 21,4 GB | No publicado | No publicado | fraqtl-model-license |

La versión comprimida ofrece una reducción de memoria de 2,74× respecto al FP16 con una pérdida mínima en calidad. La versión GGUF es aún más ligera y compatible con herramientas de consumo, pero no se han publicado benchmarks propios.

## Limitaciones y advertencias

- Es imprescindible instalar `fraqtl-runtime` para cargar los pesos safetensors; sin este paquete, el modelo no carga y se lanza un ImportError. Solo está validado en Linux x86_64 con CUDA; macOS y ARM están pendientes.
- La licencia `fraqtl-model-license` no es una licencia open source estándar. Aunque la carga e inferencia son gratuitas, la capa de compresión de KV-cache es una funcionalidad de pago que requiere token. Es necesario revisar los términos completos antes de un uso comercial.
- La compresión introduce una degradación mínima pero medible: la perplejidad en WikiText-2 aumenta un 0,77% y MMLU baja 0,16 puntos porcentuales. Para aplicaciones de precisión crítica, se recomienda validar con datos propios.
- No se especifican los idiomas soportados en esta versión, aunque el modelo base Qwen3.6 es multilingüe. La ausencia de documentación puede implicar un soporte desigual para lenguas distintas del inglés.
- No se han publicado resultados de benchmarks en tareas de razonamiento complejo (como GSM8K o MATH) ni en tareas multimodales; el modelo es exclusivamente de texto.
- El repositorio GGUF hermano indica una reducción de KLD del 30% respecto a un Q4_K_M estándar, pero no se aportan métricas de calidad adicionales.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas de sesgos ni de robustez frente a alucinaciones. Como cualquier modelo de lenguaje, puede generar contenido falso o sesgado.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/fraQtl/Qwen3.6-35B-A3B-compressed
- Versión Hi-Fi GGUF (recomendada por el autor): https://huggingface.co/fraQtl/Qwen3.6-35B-A3B-Hi-Fi-GGUF
- Versión GGUF estándar para llama.cpp/Ollama: https://huggingface.co/fraQtl/Qwen3.6-35B-A3B-GGUF
- Contacto para licencias y despliegues de producción: https://fraqtl.ai/contact
- Correo electrónico: contact@fraqtl.ai
