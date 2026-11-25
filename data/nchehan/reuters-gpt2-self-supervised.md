# nchehan/reuters-gpt2-self-supervised

## Resumen

Reuters GPT-2 Self-Supervised es un modelo de lenguaje causal de estilo GPT-2 entrenado desde cero (pesos inicializados aleatoriamente, sin inicialización desde GPT-2 preentrenado) sobre el corpus de artículos de Reuters. Lo desarrolla el usuario nchehan y se publica en Hugging Face bajo el identificador nchehan/reuters-gpt2-self-supervised. Su propósito es servir como modelo base de dominio periodístico para generación de texto en inglés sobre temática de noticias y agencias de información.

Arquitectónicamente es un transformer decoder-only muy compacto: 30.713.856 parámetros, dimensión de embedding 384, 6 capas, 6 cabezas de atención y dimensión de FFN 1536, con una longitud de contexto de solo 256 tokens. El entrenamiento se realizó sobre 17.262 artículos de entrenamiento, 2.158 de validación y 2.158 de test del dataset ingeniumacademy/reuters_articles, concatenando título y cuerpo, con un tokenizador propio (ingeniumacademy/gpt2-reuters-tokenizer).

Su relevancia es limitada y muy específica: no compite con modelos de propósito general, sino que ejemplifica el flujo de entrenamiento autocontenido de un LM pequeño de dominio sobre un corpus concreto. Es útil para experimentación docente, prototipado rápido en CPU y estudios de ajuste de dominio, no para aplicaciones de producción que requieran razonamiento, código o contexto largo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM estilo GPT-2) |
| Parametros totales | 30.713.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas externas) |
| Idiomas soportados | no disponible (el corpus de Reuters es mayoritariamente en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dimensión de embedding | 384 |
| Capas transformer | 6 |
| Cabezas de atención | 6 |
| Dimensión FFN | 1536 |
| Tokenizador | ingeniumacademy/gpt2-reuters-tokenizer |
| Tamaño del repositorio | 0.2 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con atención causal estándar, sin innovaciones arquitectónicas destacables (no hay MoE, atención lineal, SSM ni decodificación especulativa). La configuración es la de un GPT-2 en miniatura: 6 capas, 6 cabezas, embedding de 384 dimensiones y FFN de 1536, lo que arroja los 30,7 millones de parámetros. La ventana de contexto es de 256 tokens, muy corta para estándares actuales.

El entrenamiento parte de pesos inicializados aleatoriamente (el autor indica explícitamente que no se usaron pesos preentrenados de GPT-2) sobre el dataset ingeniumacademy/reuters_articles, con 17.262 artículos de entrenamiento, 2.158 de validación y 2.158 de test. El texto de entrenamiento concatena título y cuerpo. Los hiperparámetros publicados son: learning rate 0.0003, batch size efectivo 32, weight decay 0.1 y semilla 42. El repositorio raíz contiene el modelo entrenado durante 5 épocas y el directorio model_2_epochs contiene un modelo de comparación entrenado durante 2 épocas. No se documentan técnicas de RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generación de texto causal en dominio periodístico: continuación de titulares y cuerpos de noticias de Reuters.
- Modelado de lenguaje de dominio: útil para completar o generar fragmentos con estilo de agencia de noticias.
- Capacidad multilingüe: no disponible; el corpus es fundamentalmente en inglés.
- Tool calling / function calling: no soportado de forma nativa.
- Soporte de agentes y razonamiento multi-paso: no soportado.
- Modo thinking, visión o audio: no disponible.
- Razonamiento, matemáticas y código: no son capacidades objetivo ni están documentadas.

## Casos de uso

- Prototipado educativo de entrenamiento de LMs: sirve para reproducir de principio a fin un pipeline de entrenamiento causal (tokenizador propio, dataset de dominio, comparación entre 2 y 5 épocas) en hardware modesto.
- Generación de titulares y cuerpos de noticias sintéticos: el modelo puede continuar textos con el registro de Reuters, útil para aumentar datos de entrenamiento en tareas de clasificación o resumen periodístico.
- Aumento de datos para NLP financiero: al generar variantes de noticias, se pueden ampliar corpus pequeños de análisis de sentimiento o clasificación de eventos económicos.
- Pruebas de pipelines de inferencia: por su tamaño (0,2 GB), es adecuado para validar integraciones con transformers, text-generation-inference o endpoints compatibles antes de desplegar modelos mayores.
- Experimentos de ajuste de dominio: sirve como punto de partida para fine-tuning sobre otros corpus periodísticos o sectoriales con recursos limitados.
- Demostraciones de generación de texto en CPU: al ser un modelo de 30 M de parámetros, puede ejecutarse en entornos sin GPU para talleres y demos.
- Investigación sobre tokenizadores de dominio: permite evaluar el impacto del tokenizador específico de Reuters frente a tokenizadores generalistas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (30,7 M de parámetros ocupan unos 123 MB en fp32), y aún menos en fp16 o int8.
- GPU recomendadas: cualquier GPU consumer, incluida una GTX 1050 o superior; también funciona en CPU.
- Cabe en consumer GPU: sí, en todas las GPU modernas e incluso en sistemas integrados.
- Opciones de despliegue: transformers (librería nativa), text-generation-inference (el modelo está etiquetado como compatible con endpoints), llama.cpp/Ollama tras conversión a GGUF, y servidores propios con PyTorch.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño, se espera latencia de milisegundos por token en CPU y muy baja en GPU, aunque no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nchehan/reuters-gpt2-self-supervised | 30,7 M | 256 | no disponible | Hugging Face |
| GPT-2 small (OpenAI) | 124 M | 1024 | MIT | Hugging Face, ampliamente disponible |
| distilgpt2 (Hugging Face) | 82 M | 1024 | Apache 2.0 | Hugging Face |
| Modelos de dominio periodístico pequeños | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo (perplejidad, benchmarks) para este modelo frente a las alternativas citadas.

## Limitaciones y advertencias

- Contexto muy corto (256 tokens): no admite conversaciones multi-turno largas ni documentos extensos.
- Entrenado desde cero con solo 17.262 artículos: la calidad de generación será limitada y probablemente repetitiva o incoherente fuera de frases cortas.
- Riesgo alto de alucinación y de generar contenido factualmente incorrecto, especialmente al tratarse de noticias.
- Sesgos: al derivar de un corpus periodístico concreto, puede reproducir sesgos editoriales, geográficos y temporales del dataset de Reuters.
- Idiomas: no hay información sobre cobertura multilingüe; se espera un rendimiento muy pobre fuera del inglés.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue en producción.
- No soporta tool calling, agentes ni instrucciones: no es adecuado como asistente conversacional.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nchehan/reuters-gpt2-self-supervised
- Dataset: https://huggingface.co/datasets/ingeniumacademy/reuters_articles
- Tokenizador: https://huggingface.co/ingeniumacademy/gpt2-reuters-tokenizer
