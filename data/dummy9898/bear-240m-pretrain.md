# Dummy9898/bear-240m-pretrain

## Resumen

Mesosfer Bear AI (241.8M) es un modelo de lenguaje autoregresivo decoder-only basado en la arquitectura Llama, desarrollado por el equipo Mesosfer. Está diseñado para generación de texto y soporta los idiomas indonesio, inglés y código. Con 241,8 millones de parámetros y una ventana de contexto de 4096 tokens, es un modelo compacto pensado para despliegues ligeros y entornos con recursos limitados. Su relevancia radica en ofrecer una alternativa eficiente para tareas de generación de texto, especialmente en el ecosistema indonesio, donde la disponibilidad de modelos locales de pequeño tamaño es escasa.

El modelo se distribuye bajo licencia Apache-2.0, lo que permite uso comercial y modificación sin restricciones significativas. Aunque no se han publicado benchmarks oficiales, su arquitectura moderna (Grouped Query Attention, RoPE, SwiGLU) y su tokenizer especializado en código y lenguajes de la región lo posicionan como una opción interesante para prototipado rápido y aplicaciones de baja latencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-style, decoder-only, autoregresivo |
| Parametros totales | 241.828.864 (241,8M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Indonesio (id), inglés (en), código (code) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (bear_model.pt) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only inspirada en Llama. Consta de 16 bloques transformer con dimensión oculta de 1024 y FFN de 2816 unidades con activación SwiGLU. Utiliza Grouped Query Attention (GQA) con 16 cabezas de consulta y 4 cabezas de clave/valor (relación 4:1), lo que reduce el coste de memoria y acelera la inferencia. La codificación posicional se realiza mediante Rotary Position Embeddings (RoPE) con theta=10000. El tokenizer tiene un vocabulario de 60.000 tokens basado en BPE Kimi-K3, con soporte nativo de marcado XTML (`<|open|>...<|close|>`) y aceleración mediante Rust `tiktoken`.

El entrenamiento corresponde a una fase de preentrenamiento (PRETRAIN) de la que solo se conoce el paso 12.000 con una pérdida de 1,8174. No se han publicado detalles sobre el dataset utilizado (número de tokens, composición, proporción de idiomas) ni sobre procesos posteriores como RLHF o DPO. El modelo se entrega con scripts de inferencia y una interfaz de chat interactiva que aplica una plantilla de conversación con soporte de modo "thinking" (razonamiento), aunque no se especifica si este modo fue entrenado explícitamente.

## Capacidades

- Generación de texto autoregresivo en indonesio, inglés y código.
- Aplicación de plantillas de chat multi-turno mediante `apply_chat_template`, con soporte de modo "thinking" (parámetro `thinking=True`).
- Tokenización eficiente con marcado XTML para estructurar respuestas.
- Inferencia local sin frameworks externos adicionales (solo requiere PyTorch y tiktoken).
- Interfaz de línea de comandos para chat interactivo con control de temperatura y top-p.
- No se menciona soporte de tool calling, function calling ni capacidades de agente.

## Casos de uso

- Asistente de chat básico en indonesio: el modelo puede gestionar conversaciones sencillas de atención al cliente o consultas generales gracias a su plantilla de chat y su tamaño reducido, que permite ejecutarlo en hardware modesto.
- Generación de contenido en indonesio: adecuado para redactar borradores de artículos, resúmenes o respuestas en foros, aprovechando su entrenamiento en ese idioma.
- Autocompletado de código en entornos de desarrollo: al soportar "code" como idioma, puede sugerir fragmentos de código en lenguajes comunes, útil en editores ligeros o entornos sin conexión.
- Prototipado rápido de aplicaciones NLP: por su licencia permisiva y su tamaño pequeño, sirve para validar ideas de productos antes de escalar a modelos más grandes.
- Educación y formación: permite a estudiantes y desarrolladores experimentar con un modelo de lenguaje real sin necesidad de infraestructura costosa, ideal para cursos de IA.
- Despliegue en dispositivos edge o con GPU limitada: con solo 241M parámetros, puede ejecutarse en tarjetas gráficas de gama baja o incluso en CPU para tareas de baja latencia, como generación de texto en tiempo real en aplicaciones móviles o embebidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras evaluaciones estándar, por lo que no es posible comparar su rendimiento con otros modelos de forma objetiva.

## Requisitos de hardware

- No se proporcionan datos oficiales de VRAM, latencia o throughput.
- Estimación orientativa: con 241,8M parámetros, los pesos en fp16 ocupan aproximadamente 0,5 GB. Con overhead de activaciones y caché KV, podría caber en GPUs con 2 GB de VRAM o más.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (por ejemplo, GTX 1650, RTX 3050) o GPUs de datacenter como T4 o A10.
- Opciones de despliegue: el repositorio incluye scripts de inferencia en Python (inference.py y cli.py) que usan PyTorch directamente. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, aunque por su formato PyTorch podría adaptarse a otros frameworks.
- Para uso en CPU, la generación sería lenta pero viable para tareas no interactivas.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos de la misma categoría. No se han proporcionado datos de modelos comparables ni se conocen alternativas específicas con el mismo tamaño y perfil de idiomas. Por tanto, esta sección queda sin datos.

## Limitaciones y advertencias

- Modelo pequeño (241M parámetros) con capacidad limitada para tareas complejas de razonamiento o generación de código avanzado.
- Solo preentrenado, sin fine-tuning para chat ni instrucciones; la calidad de las respuestas conversacionales puede ser inferior a modelos ajustados con RLHF.
- Riesgo de alucinación y de generar contenido incorrecto o inconsistente, especialmente en dominios especializados.
- Idiomas limitados a indonesio, inglés y código; no cubre otros idiomas, incluido el español.
- No hay información sobre sesgos o comportamientos no deseados; se recomienda evaluación adicional antes de uso en producción.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye sin garantías y sin soporte oficial.
- No se proporcionan benchmarks ni métricas de rendimiento, lo que dificulta la evaluación objetiva de su calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dummy9898/bear-240m-pretrain
- No se han encontrado otros enlaces (papers, blogs, repos) en la información disponible.
