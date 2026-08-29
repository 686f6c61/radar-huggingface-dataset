# MultiSense/CustomerLM

## Resumen

CustomerLM es un modelo de lenguaje de 8.190 millones de parámetros desarrollado por MultiSense, diseñado específicamente para actuar como **simulador de cliente** en conversaciones de ventas. Se basa en Qwen3-8B-Instruct y ha sido ajustado mediante un pipeline de SFT (supervised fine-tuning) seguido de DPO (direct preference optimization) sobre 8.284 diálogos de ventas reales con participación de crowdworkers. Su propósito principal es servir como componente de usuario en el benchmark SalesLLM, que evalúa la capacidad de los modelos de lenguaje para vender de forma realista.

El problema que resuelve es el de la **inversión de rol** en simulaciones de ventas: los modelos generalistas como GPT-4o, cuando se les pide interpretar a un comprador, tienden a comportarse como vendedores, ofreciendo objeciones, resumiendo beneficios o incluso promocionando el producto. CustomerLM reduce esta inversión de rol del 17,44 % (observado en GPT-4o) al 8,8 %, manteniendo respuestas más cercanas a las de un cliente humano real: escéptico, terse, centrado en sus intereses y dispuesto a abandonar la conversación.

El modelo está entrenado para recibir la **persona del cliente** como prompt de sistema y los turnos del vendedor como mensajes de usuario, generando las respuestas del comprador. Soporta chino e inglés, se distribuye bajo licencia Apache 2.0 y está disponible en formato safetensors. Su relevancia actual radica en que proporciona una herramienta fiable para evaluar agentes de ventas conversacionales, un área en crecimiento dentro de la investigación de IA aplicada a comercio y atención al cliente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only), basado en Qwen3-8B-Instruct |
| Parametros totales | 8.190.735.360 (8,19 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la documentación) |
| Tipos de cuantizacion | no disponible (el repositorio solo incluye pesos en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

CustomerLM parte del checkpoint Qwen3-8B-Instruct, un modelo transformer causal con atención completa y decodificación autorregresiva. Sobre esta base se aplicó un ajuste fino en dos etapas: primero un SFT con los diálogos de ventas reales para enseñar al modelo a responder como cliente, y después un DPO para reforzar comportamientos deseables (mantener el personaje, mostrar escepticismo, no colaborar con el vendedor). El dataset de entrenamiento consta de 8.284 conversaciones reales de ventas, recopiladas con intervención de crowdworkers, lo que garantiza una distribución natural de turnos y estilos de comprador.

La innovación principal no está en la arquitectura (que es la de Qwen3) sino en el **mapeo de roles invertido**: el modelo trata el prompt de sistema como la descripción de la persona del cliente (nivel de dificultad, inclinación a comprar, puntos de dolor, factores de decisión) y los mensajes de usuario como los turnos del vendedor. Esta configuración, junto con el entrenamiento específico, evita que el modelo "ayude" al vendedor y lo mantiene en el papel de comprador. No se documentan otras innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- **Simulación de cliente en conversaciones de ventas**: genera respuestas coherentes con la persona definida en el prompt de sistema, incluyendo niveles de dificultad (fácil, medio, difícil, muy difícil) y puntuaciones de inclinación a comprar (0.0–1.0).
- **Mantenimiento de personaje**: entrenado para permanecer escéptico, terse y centrado en sus propios intereses, reduciendo la inversión de rol al 8,8 %.
- **Soporte multilingüe**: opera en chino e inglés, seleccionables mediante el campo `Language` del prompt de sistema.
- **Generación de diálogos sintéticos**: puede producir conversaciones de ventas completas para entrenamiento o análisis.
- **Integración con vLLM**: compatible con servidores OpenAI-compatible, lo que facilita su uso en pipelines de evaluación.
- **No es un asistente**: no está diseñado para responder preguntas factuales ni para ayudar al usuario; su función exclusiva es interpretar a un comprador.

## Casos de uso

- **Evaluación de agentes de ventas conversacionales**: CustomerLM actúa como el interlocutor cliente en el benchmark SalesLLM, permitiendo medir de forma objetiva la capacidad de un modelo para vender (manejo de objeciones, cierre de ventas, etc.) sin el sesgo de un simulador que colabora con el vendedor.
- **Pruebas de estrés de sistemas de atención al cliente**: las empresas pueden desplegar CustomerLM para simular clientes difíciles o escépticos y comprobar cómo responde su propio agente automatizado ante situaciones de alta fricción.
- **Generación de datos sintéticos de conversaciones de ventas**: el modelo puede producir miles de diálogos realistas entre un vendedor y un comprador, útiles para entrenar otros modelos o para análisis de mercado.
- **Investigación en psicología de la negociación**: al controlar parámetros como la inclinación a comprar o los puntos de dolor, los investigadores pueden estudiar patrones de comportamiento del consumidor en entornos controlados.
- **Desarrollo de juegos de rol o simulaciones interactivas**: en entornos de formación para vendedores, CustomerLM puede interpretar a un cliente virtual que reacciona de forma realista a diferentes estrategias de venta.
- **Validación de sistemas de recomendación**: al simular compradores con distintas preferencias, se puede evaluar si un sistema de recomendación adapta sus ofertas a las necesidades del cliente en un contexto conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card reporta una métrica específica del dominio: la **tasa de inversión de rol**, que mide la frecuencia con la que el simulador de cliente se comporta como vendedor. CustomerLM logra un 8,8 % frente al 17,44 % de GPT-4o en el mismo escenario, lo que indica una mejora sustancial en la fidelidad del personaje. No se proporcionan otros datos de rendimiento como latencia o throughput.

## Requisitos de hardware

- **VRAM estimada**: al tratarse de un modelo de 8,19 mil millones de parámetros, en precisión FP16/BF16 ocupa aproximadamente 16,4 GB (tamaño del repositorio). Para inferencia se recomienda al menos 20 GB de VRAM si se usa sin cuantización.
- **GPU recomendadas**: tarjetas de gama alta como NVIDIA RTX 3090 (24 GB), RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB) pueden ejecutarlo sin problemas. Con cuantización a 8 bits o 4 bits, podría caber en GPUs de 12 GB (por ejemplo, RTX 3060 o RTX 4070), aunque no se documentan configuraciones oficiales.
- **Opciones de despliegue**: el modelo es compatible con vLLM (recomendado en la documentación), así como con text-generation-inference (TGI) y transformers estándar. También puede servirse mediante Ollama o llama.cpp si se convierte a formato GGUF, aunque no se proporcionan archivos GGUF en el repositorio.
- **Latencia y throughput**: no se han publicado mediciones oficiales. En una GPU A100, un modelo de 8B suele generar entre 50 y 100 tokens por segundo con vLLM, pero estos valores son estimaciones generales y no están confirmados para CustomerLM.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros simuladores de usuario o modelos de role-play específicos para ventas. La única referencia comparativa en la documentación es GPT-4o, utilizado como baseline en el benchmark SalesLLM, donde CustomerLM muestra una tasa de inversión de rol inferior (8,8 % frente a 17,44 %). No obstante, no se ofrecen datos de otros modelos como Llama-3-8B o Mistral-7B en este contexto, por lo que no es posible elaborar una tabla comparativa completa.

## Limitaciones y advertencias

- **No es un asistente general**: está entrenado exclusivamente para interpretar a un cliente; si se usa como chatbot de ayuda, generará respuestas evasivas, escépticas o de rechazo, lo que puede confundir a los usuarios finales.
- **No produce información factual fiable**: sus respuestas se basan en la persona sintética, no en una base de conocimiento real. No debe utilizarse para obtener datos sobre productos o servicios reales.
- **Personas sintéticas**: los perfiles de cliente generados no representan a individuos reales; no deben emplearse para modelar comportamientos de personas concretas.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede inventar detalles sobre productos o circunstancias, especialmente si el prompt de sistema no es lo suficientemente restrictivo.
- **Idiomas limitados**: solo soporta chino e inglés; no está entrenado para otros idiomas, lo que limita su uso en mercados hispanohablantes o de otros idiomas.
- **Dependencia del prompt de sistema**: la fidelidad del personaje depende en gran medida de seguir el formato exacto de prompt documentado; desviaciones pueden degradar el rendimiento.
- **Licencia Apache 2.0**: permite uso comercial, pero el modelo no debe redistribuirse como un asistente genérico sin indicar claramente su naturaleza de simulador.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/MultiSense/CustomerLM)
- [Paper en arXiv (Sell More, Play Less: Benchmarking LLM Realistic Selling Skill)](https://arxiv.org/pdf/2604.07054)
- [Repositorio del benchmark SalesLLM](https://github.com/Bairong-Xdynamics/Benchmarking-LLM-Realistic-Selling-Skill)
- [Página de inferencia en FriendliAI](https://friendli.ai/models/MultiSense/CustomerLM)
