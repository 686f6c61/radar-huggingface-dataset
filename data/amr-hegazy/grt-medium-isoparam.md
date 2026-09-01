# Amr-Hegazy/grt-medium-isoparam

## Resumen

El modelo **GRT Medium (medium-isoparam)** es un checkpoint del **Gated Recurrent Transformer (GRT)**, una arquitectura que aplica un bloque transformer compartido de forma recurrente para obtener profundidad expresiva sin aumentar el número de parámetros. Desarrollado por Amr Hegazy, Amr Alanwar y Mostafa Elhoushi, el GRT se presenta en el artículo *Gated Recurrent Transformers: Expressive Depth through Recurrent Modulation* (arXiv:2608.15062). Este checkpoint concreto, de régimen isoParam, iguala el número de parámetros de un transformer no recurrente equivalente pero dedica más pasadas recurrentes a cada token, logrando mejor precisión con el mismo presupuesto de parámetros.

La arquitectura combina tres innovaciones: inyección de "prelude" (las salidas de bloques fijos se concatenan con el estado oculto ruidoso en cada paso recurrente), puertas sigmoideas elementwise que controlan la fusión en el flujo residual, y ruido gaussiano tanto en el estado como en las puertas para evitar colapsos y patrones frágiles. El modelo tiene aproximadamente 171 millones de parámetros, una ventana de contexto de 1024 tokens y fue entrenado sobre unos 9.800 millones de tokens del dataset filtrado CCCC. Su relevancia actual radica en ofrecer una alternativa eficiente a los transformers densos, con la posibilidad de ajustar la profundidad de recurrencia en inferencia para intercambiar calidad por coste computacional sin necesidad de reentrenar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer recurrente con puerta (Gated Recurrent Transformer) |
| Parametros totales | 171.073.536 (según safetensors; la model card indica ~169M) |
| Parametros activos | No aplica (no es MoE; todos los parámetros se usan en cada pasada) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No publicado (se distribuye en FP32/FP16 por defecto) |
| Idiomas soportados | Inglés (entrenado principalmente en inglés) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (pytorch) |

## Arquitectura y entrenamiento

El GRT es un transformer recurrente con compartición de pesos. La estructura es **prelude → núcleo compartido × R → coda**. En el checkpoint medium-isoparam, la configuración es `2+5×4+2`, lo que significa 2 bloques prelude, 5 bloques compartidos que se ejecutan 4 veces (20 ejecuciones) y 2 bloques coda, totalizando 24 ejecuciones de bloque por token. Durante el entrenamiento, la profundidad de recurrencia R se muestrea uniformemente en cada paso, mientras que en inferencia se fija, permitiendo *early exiting* desde un único checkpoint sin pérdidas auxiliares.

Las innovaciones clave son:

- **Prelude injection**: en cada paso recurrente, la salida de los bloques prelude (fijos) se concatena con el estado oculto ruidoso y se reproyecta, anclando cada iteración a la representación original de la entrada.
- **Elementwise sigmoid gating**: un MLP genera una puerta que decide qué elementos del bloque compartido se añaden al flujo residual. La puerta se inicializa cerca de abierta (σ(+4) ≈ 0.98) y aprende a sobrescribir selectivamente durante el entrenamiento.
- **State and gate noise**: se añade ruido gaussiano tanto al estado oculto (εₓ) como a los logits de la puerta (ε₉) en cada paso, lo que desalienta patrones frágiles de coincidencia exacta y evita el colapso de las puertas.

El entrenamiento se realizó sobre ~9.8B tokens del dataset `common-pile/cccc_filtered`, una versión filtrada del Common Pile. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; el modelo se entrena con pérdida de entropía cruzada estándar para modelado de lenguaje. La pérdida de validación reportada es 2.8956.

## Capacidades

- **Generación de texto**: modelo de lenguaje autorregresivo capaz de continuar texto coherente, dado un prompt.
- **Razonamiento y comprensión**: al ser un transformer recurrente, puede capturar dependencias de largo alcance dentro de su ventana de 1024 tokens, aunque no se han publicado benchmarks específicos de razonamiento.
- **Ajuste de profundidad en inferencia**: permite elegir el número de pasadas recurrentes (R) para equilibrar calidad y latencia sin reentrenar.
- **Multilingüe limitado**: entrenado principalmente en inglés; no se garantiza buen rendimiento en otros idiomas.
- **Tool calling / function calling**: no se menciona soporte explícito.
- **Capacidades de agente**: no se menciona; la arquitectura no está diseñada para interacción con herramientas.
- **Modo pensamiento**: no se menciona ningún modo de razonamiento extendido tipo *thinking*.

## Casos de uso

- **Investigación en eficiencia de arquitecturas**: el GRT es un banco de pruebas ideal para estudiar cómo la recurrencia con compartición de pesos mejora la relación calidad-parámetros frente a transformers densos. Un investigador puede cargar el checkpoint, variar la profundidad de recurrencia y medir la pérdida o la calidad de generación en distintos presupuestos de cómputo.
- **Generación de texto en entornos con restricciones de memoria**: con solo ~171M de parámetros, el modelo cabe en GPUs de consumo y puede ejecutarse en dispositivos con poca VRAM, sirviendo como base para chatbots o asistentes ligeros sin depender de servicios en la nube.
- **Prototipado rápido de aplicaciones de lenguaje**: al ser pequeño y tener una API sencilla (basada en nanoGPT), es adecuado para hacer pruebas de concepto de generación de texto, resumen o completado de código en entornos de desarrollo.
- **Estudio de dinámicas de recurrencia**: los investigadores pueden analizar cómo las puertas sigmoideas evolucionan durante el entrenamiento y cómo el ruido afecta a la robustez, lo que resulta útil para diseñar futuras arquitecturas recurrentes.
- **Fine-tuning para dominios específicos**: gracias a su licencia CC-BY-4.0 y su tamaño contenido, se puede adaptar con pocos recursos a tareas concretas, como generación de documentación técnica o redacción creativa en inglés.
- **Comparación con modelos recurrentes puros (RWKV, Mamba)**: sirve como referencia para evaluar la combinación de atención y recurrencia frente a alternativas sin atención cuadrática, midiendo calidad, velocidad y uso de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este checkpoint en la información disponible. Los datos de rendimiento reportados provienen del artículo y se refieren a configuraciones más pequeñas:

- En un régimen **isoFLOP**, un GRT de 3 capas iguala la precisión de un GPT-2 Small de 12 capas con FLOPs de entrenamiento e inferencia similares.
- En un régimen **isoParam**, una recurrencia más profunda alcanza una pérdida de validación de 2.76 frente a 2.84 de su contraparte no recurrente con los mismos parámetros y datos.

La pérdida de validación del checkpoint medium-isoparam es **2.8956** (según la model card). No se dispone de comparaciones directas con otros modelos de tamaño similar en tareas estándar.

## Requisitos de hardware

- **VRAM estimada**: con 171M de parámetros, en FP32 (~684 MB) cabe en cualquier GPU con al menos 2 GB de VRAM; en FP16 (~342 MB) cabe en GPUs con 1 GB o más; en int8 (~171 MB) es viable en CPU.
- **GPU recomendadas**: cualquier GPU moderna, desde una NVIDIA GTX 1650 (4 GB) hasta una RTX 4090 o A100. Incluso una Raspberry Pi 5 con 8 GB de RAM podría ejecutarlo en CPU con cuantización.
- **Cómputo en consumer**: sí, cabe holgadamente en GPUs de gama de entrada como la RTX 3050 (8 GB) y permite generación en tiempo real para longitudes moderadas.
- **Opciones de despliegue**: al ser un modelo PyTorch estándar, puede servirse con **vLLM** (si se adapta a su formato), **llama.cpp** (si se convierte a GGUF), **Ollama** (mediante conversión) o directamente con el código de muestreo incluido en el repositorio (`sample.py`). También es compatible con **Hugging Face Transformers** si se envuelve en una clase adecuada.
- **Latencia y throughput**: no se han publicado cifras oficiales. Dado que cada token requiere 24 ejecuciones de bloque (aunque con pesos compartidos), la latencia será proporcionalmente mayor que la de un transformer denso del mismo tamaño sin recurrencia. En una GPU moderna se esperan decenas de tokens por segundo, pero estos valores son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **GRT Medium (isoParam)** | ~171M | 1024 | Transformer recurrente con puertas | CC-BY-4.0 | Hugging Face |
| **GPT-2 Small** | 124M | 1024 | Transformer denso | MIT | OpenAI / HF |
| **GPT-2 Medium** | 355M | 1024 | Transformer denso | MIT | OpenAI / HF |
| **RWKV-169M** | ~169M | 2048 (típico) | RNN con atención lineal | Apache-2.0 | HF |

El GRT Medium se sitúa entre GPT-2 Small y Medium en parámetros, pero su recurrencia le permite una profundidad efectiva mayor sin aumentar el número de pesos. Frente a RWKV, comparte la idea de recurrencia, pero mantiene atención dentro de bloques compartidos, lo que puede ofrecer ventajas en tareas que requieren mezclar información local y global. No se dispone de comparaciones de rendimiento directas en benchmarks estándar.

## Limitaciones y advertencias

- **Alcance del entrenamiento**: entrenado exclusivamente en inglés con ~9.8B tokens; el rendimiento en otros idiomas es limitado o nulo.
- **Ventana de contexto corta**: 1024 tokens puede ser insuficiente para tareas que requieren contexto largo, como análisis de documentos extensos.
- **Sin alineación explícita**: no se aplicaron técnicas de RLHF o DPO; el modelo puede generar contenido sesgado, tóxico o inexacto, especialmente en dominios sensibles.
- **Riesgo de alucinación**: como todo modelo de lenguaje, puede producir afirmaciones falsas con alta fluidez; no es adecuado para uso médico, legal o financiero sin supervisión humana.
- **Dependencia del código del autor**: la implementación de referencia está ligada a la base de código de nanoGPT; puede requerir adaptación para integrarse en pipelines estándar de Hugging Face.
- **Licencia CC-BY-4.0**: permite uso comercial y modificación, pero exige atribución al autor original. No hay restricciones de uso militar o de alta riesgo, pero se recomienda revisar los términos completos.
- **Falta de benchmarks estandarizados**: no se han publicado resultados en MMLU, HumanEval u otros, lo que dificulta evaluar su capacidad real frente a modelos establecidos.
- **Ruido en inferencia**: el ruido gaussiano se aplica durante el entrenamiento; en inferencia no se menciona si se desactiva, por lo que podría afectar a la reproducibilidad de las generaciones.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Amr-Hegazy/grt-medium-isoparam)
- [Repositorio de código (GitHub)](https://github.com/Amr-Hegazy1/gated-recurrent-transformer)
- [Artículo en arXiv (PDF)](https://arxiv.org/pdf/2608.15062v4)
- [Artículo en arXiv (HTML)](https://arxiv.org/html/2608.15062v3)
- [Página del paper en Hugging Face](https://huggingface.co/papers/2608.15062)
