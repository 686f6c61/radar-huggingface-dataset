# SistemaEcommerce/Qwen3-4B-Ecommerce-Support

## Resumen

SistemaEcommerce/Qwen3-4B-Ecommerce-Support es un ajuste fino (fine-tuning) del modelo Qwen3-4B de Alibaba, especializado en atención al cliente para comercio electrónico. Lo ha desarrollado Sistema E-commerce, una empresa independiente de desarrollo de tiendas online, con el objetivo de resolver la automatización de soporte multilingüe: gestión de consultas sobre pedidos, envíos, devoluciones, reembolsos y disponibilidad de productos en tiendas internacionales.

El modelo conserva la arquitectura transformer causal de Qwen3-4B, con aproximadamente 4.022 millones de parámetros (dato real extraído de los safetensors), y está entrenado para operar en seis idiomas declarados (inglés, italiano, español, francés, alemán y japonés), aunque la arquitectura base soporta más de 100. Su relevancia actual radica en la demanda de asistentes de soporte económicos que quepan en hardware modesto y que integren tool calling para consultar sistemas reales de inventario y pedidos.

Es importante señalar que se trata de un proyecto experimental, sin documentación completa de entrenamiento ni benchmarks publicados, por lo que conviene evaluarlo con cautela antes de cualquier despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (modelo de lenguaje autorregresivo, base Qwen3) |
| Parámetros totales | 4.022.468.096 (dato real de safetensors) |
| Parámetros activos | no disponible (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | no disponible (la base Qwen3-4B soporta 32.768 tokens nativos, 131.072 con YaRN, pero el fine-tuning no lo documenta) |
| Tipos de cuantización | no disponible (repo en safetensors de 8,1 GB, compatible con FP16/BF16) |
| Idiomas soportados | en, it, es, fr, de, ja (declarados en el fine-tuning; la base soporta más de 100) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer decoder-only denso (no MoE) de la familia Qwen3 de Alibaba. El fine-tuning añade entrenamiento específico en terminología de e-commerce, comunicación con clientes y flujos de trabajo de soporte retail. La model card no especifica el método de ajuste (LoRA, QLoRA o full fine-tuning), el dataset, el número de muestras, las épocas ni el hardware empleado: todos esos campos figuran como pendientes de documentar.

No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. La innovación principal no es arquitectónica sino de dominio: adaptación conversacional multilingüe para retail, con diseño para integrarse mediante tool calling con plataformas como Shopify, WooCommerce, bases de datos de inventario y sistemas de gestión de pedidos. El propio autor indica que el rendimiento entre idiomas "está sujeto a evaluación".

## Capacidades

- Generación de texto conversacional orientada a atención al cliente, con detección de idioma y conciencia de contexto multi-turno.
- Asistencia en consultas de pedidos y envíos: explicación de procesos de entrega y seguimiento sin fabricar datos si no hay integración.
- Gestión de devoluciones, cambios y reembolsos según las políticas que la tienda suministre vía contexto de aplicación.
- Interpretación de preguntas sobre productos e inventario, con recuperación de stock en tiempo real si se conectan sistemas externos.
- Automatización de flujos de soporte: identificación de incidencias complejas y escalamiento a operadores humanos.
- Soporte de tool calling (heredado de Qwen3 y declarado en tags), pensado para integraciones con Shopify, WooCommerce y APIs de pedidos.
- Capacidades multilingües en seis idiomas declarados: inglés, italiano, español, francés, alemán y japonés.
- No hay evidencia de capacidades de visión, audio ni modo de thinking documentadas para este fine-tuning.

## Casos de uso

- Atención al cliente automatizada multi-turno: el modelo puede mantener conversaciones en el idioma del cliente (por ejemplo, responder en italiano a "Vorrei sapere quando arriverà il mio ordine") gracias al fine-tuning multilingüe, con escalamiento a humanos cuando detecta incidencias complejas.
- Consulta de disponibilidad de productos: conectado vía tool calling al inventario, puede identificar variantes solicitadas (talla, color) y responder con datos verificados de stock en lugar de inventarlos.
- Gestión de devoluciones internacionales: explicación del proceso de devolución en el idioma del cliente (alemán, francés, japonés) aplicando las políticas concretas que la tienda inyecta en el contexto.
- Automatización de estado de pedidos y envíos: integrado con un sistema de gestión de pedidos, puede consultar el estado real de un envío y comunicarlo, reduciendo tickets repetitivos.
- Chatbot embebido en Shopify o WooCommerce: su tamaño de 4B permite desplegarlo en GPU de consumo o incluso CPU cuantizado, con coste operativo bajo para tiendas pequeñas y medianas.
- Clasificación y enrutado de tickets: puede precalificar consultas entrantes, resolver las triviales y derivar las sensibles (reembolsos grandes, quejas legales) a operadores humanos con resumen del caso.
- Soporte multilingüe sin equipos nativos por idioma: una única instancia cubre seis idiomas, útil para tiendas que venden en Europa y Japón sin plantillas multilingües.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la evaluación (calidad multilingüe, precisión de soporte, fiabilidad del tool calling, cumplimiento de políticas y escalamiento) está pendiente, y que los resultados comparativos contra el Qwen3-4B original se publicarán cuando estén disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 8 GB solo de pesos (el repo ocupa 8,1 GB), más overhead de KV cache; en la práctica 10-12 GB.
- Con cuantización de 4 bits (Q4_K_M en GGUF, generado por el usuario ya que el repo solo publica safetensors): unos 2,5-3 GB de VRAM o ejecución en CPU.
- GPUs recomendadas: RTX 3060 de 12 GB, RTX 4060 Ti 16 GB o RTX 4090 para FP16; cualquier GPU moderna de 8 GB basta con cuantización. En servidor, una A10G o L4 es más que suficiente.
- Cabe con holgura en GPUs de consumo: RTX 3060/4070 en BF16 y prácticamente cualquier GPU de 6 GB en 4 bits; también viable en CPU con llama.cpp a velocidades de unos 10-20 tokens/s según hardware.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y LM Studio (estos últimos requieren conversión a GGUF). Para tool calling en producción, vLLM es la opción más directa al soportar parsing de herramientas con modelos Qwen.
- Latencia y throughput: no disponible; al ser un modelo denso de 4B, se esperan latencias de primer token bajas (<300 ms en GPU de consumo) y throughput elevado, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-Ecommerce-Support | 4,02 B (denso) | no disponible (base: 32k-128k) | Apache 2.0 | Fine-tuning de soporte e-commerce multilingüe | safetensors en Hugging Face |
| Qwen/Qwen3-4B (base) | 4,02 B (denso) | 32.768 tokens (131k con YaRN) | Apache 2.0 | Modelo general con modo thinking y tool calling | safetensors y GGUF oficiales |
| Llama-3.1-8B-Instruct | 8 B (denso) | 131.072 tokens | Llama 3.1 Community License | General, fuerte en tool calling y multilingüe | safetensors y GGUF oficiales |
| Mistral-7B-Instruct v0.3 | 7 B (denso) | 32.768 tokens | Apache 2.0 | General, eficiente en inferencia | safetensors y GGUF oficiales |

Frente a la base Qwen3-4B, este fine-tuning aporta dominio de e-commerce pero pierde documentación oficial y soporte de la comunidad; frente a Llama-3.1-8B, ofrece la mitad de requisitos de memoria y una licencia Apache 2.0 sin restricciones, a costa de un tamaño menor y, probablemente, menor capacidad general.

## Limitaciones y advertencias

- Proyecto experimental: el propio autor advierte que las respuestas pueden contener errores o información alucinada.
- Riesgo de alucinación relevante en datos operativos: el modelo no debe inventar estados de pedido, precios ni stock; toda información en vivo requiere integraciones externas vía tool calling.
- Rendimiento desigual entre idiomas: el fine-tuning no garantiza calidad equivalente en los seis idiomas declarados, y la evaluación multilingüe está pendiente.
- Documentación de entrenamiento incompleta: método (LoRA/QLoRA/full), dataset, tamaño y hiperparámetros no están publicados, lo que dificulta auditar sesgos y calidad de datos.
- Sesgos: no documentados; como derivado de Qwen3-4B, puede heredar sesgos del preentrenamiento y del dataset de fine-tuning no revelado.
- Contexto: la model card no confirma la longitud de ventana del fine-tuning; no asumir los 128k de la base sin verificarlo.
- Licencia Apache 2.0 sin restricciones comerciales relevantes, aunque hay que respetar las licencias del modelo base y de los datos de entrenamiento.
- Operaciones sensibles (reembolsos, cambios de cuenta) deben requerir autorización y supervisión humana, según recomienda el propio autor.
- Cero descargas y cero likes en el momento de la ficha: sin validación comunitaria ni evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SistemaEcommerce/Qwen3-4B-Ecommerce-Support
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Sitio del desarrollador: https://sistemaecommerce.com
