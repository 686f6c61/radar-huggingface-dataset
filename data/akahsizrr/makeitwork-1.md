# Akahsizrr/makeitwork-1

## Resumen

makeitwork-1 es un modelo decoder-only de 497 millones de parámetros, de arquitectura LLaMA-style, ajustado específicamente para recuperación de información en codebases y tool-calling. Desarrollado por Akahsizrr (Vasko Djack), el modelo actúa como un agente de búsqueda de código: recibe una consulta en lenguaje natural, emite queries de búsqueda mediante tokens especiales, analiza los resultados recuperados, razona sobre ellos y devuelve evidencia curada con hechos relevantes del código. Es un fine-tune del modelo base Reizxn/makeitwork1 (Retriever500M) y está entrenado sobre trazas de búsqueda generadas a partir de 20 repositorios open-source.

Su relevancia radica en ser un modelo pequeño y especializado que integra retrieval y razonamiento en un único paso de generación, sin depender de pipelines externos de RAG. Esto lo hace atractivo para entornos con recursos limitados donde se necesita un agente de búsqueda de código autocontenido. La ventana de contexto no está documentada en la información disponible, y el modelo solo soporta inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Retriever500M (decoder LLaMA-style custom) |
| Parametros totales | 496.998.400 (~497M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT (según model card); no disponible en metadatos de HuggingFace |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo usa una arquitectura decoder-only de estilo LLaMA con 23 capas, dimensión oculta de 1.280, 20 cabezas de atención, FFN de 3.456 con activación SwiGLU, codificación posicional RoPE y normalización RMSNorm. Los embeddings están atados (tied embeddings) y el vocabulario es de 32.009 tokens, incluyendo 9 tokens especiales de control (`<|system|>`, `<|user|>`, `<|assistant|>`, `<|search|>`, `<|result|>`, `<|evidence|>`, `<|reasoning|>`, `<|finish|>`, `<|end|>`) que estructuran el flujo agéntico de búsqueda y respuesta.

El entrenamiento corresponde al checkpoint de SFT Round 2, sobre un dataset de aproximadamente 3.000 trazas de búsqueda de código (v3 dataset), generadas a partir de 20 repositorios open-source. No se documentan detalles sobre el preentrenamiento del modelo base ni sobre técnicas de alineación adicionales como RLHF o DPO.

## Capacidades

- Agente de búsqueda de código: emite queries de búsqueda con `<|search|>`, analiza bloques `<|result|>` del sistema de retrieval y devuelve evidencia con `<|evidence|>`.
- Razonamiento multi-paso: usa el token `<|reasoning|>` para pensar sobre los hallazgos antes de responder.
- Tool-calling estructurado: protocolo de tokens especiales que permite integración con sistemas de retrieval externos.
- Generación de texto en inglés: respuesta final formateada con `<|finish|>` para señalizar el final de la interacción.
- Soporte de codebase retrieval: entrenado sobre consultas en Python, Rust, Go, C y TypeScript.
- Capacidades multilingües: no disponibles; el modelo solo soporta inglés.

## Casos de uso

- Asistente de navegación en codebases: un desarrollador pregunta "¿dónde se valida el token JWT en este proyecto?" y el modelo emite búsquedas, analiza resultados y devuelve la ubicación exacta con evidencia del código.
- Onboarding de nuevos desarrolladores: el modelo puede responder preguntas sobre la estructura de un repositorio, ayudando a entender módulos, dependencias y patrones sin leer el código completo.
- Documentación automática de APIs internas: dado un componente, el modelo recupera y resume las firmas de funciones, parámetros y comportamientos relevantes.
- Auditoría de seguridad de código: consultas como "¿qué funciones manejan datos de usuario sin sanitizar?" pueden dirigir al modelo a buscar patrones de riesgo en el código.
- Integración en pipelines de CI/CD: como agente de tool-calling, puede conectarse a motores de búsqueda de código (grep, ripgrep, indexadores) para responder consultas automatizadas en tareas de revisión.
- Soporte técnico interno: un chatbot corporativo que responde preguntas sobre el código propietario usando este modelo como motor de retrieval, sin necesidad de un RAG externo.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados sobre un conjunto de prueba de 50 consultas de búsqueda de código en Python, Rust, Go, C y TypeScript:

| Metrica | Resultado |
|---|---|
| Search accuracy | 64,0 % |
| Evidence rate | 98,0 % |
| Finish rate | 100,0 % |

No se han publicado resultados comparativos con otros modelos en la información disponible. El tamaño del conjunto de evaluación (50 consultas) es reducido, por lo que estos datos deben interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1 GB en FP16 (497M parámetros × 2 bytes); ~2 GB en FP32 (tamaño del repo, 2,0 GB, sugiere pesos en FP32).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente; una RTX 3060 o superior permite inferencia cómoda.
- Compatibilidad con consumer GPU: sí, el modelo cabe holgadamente en GPUs de gama media e incluso en CPU con suficiente RAM.
- Opciones de despliegue: el modelo requiere código custom (model.py incluido en el repo) porque la arquitectura Retriever500M no es estándar. No hay compatibilidad documentada con vLLM, llama.cpp, Ollama o TGI sin adaptación previa.
- Latencia y throughput: no disponible; dependerá del hardware y de la implementación custom.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de recuperación de código (como CodeT5, CodeBERT o modelos de retrieval tipo ColBERT) en la información proporcionada. El modelo se distingue por su enfoque agéntico con tokens de control específicos, pero no hay métricas públicas que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Sesgos y cobertura: entrenado sobre solo 20 repositorios open-source; puede no generalizar bien a codebases propietarios o con estilos muy diferentes.
- Riesgo de alucinación: con una search accuracy del 64 %, el modelo falla en más de un tercio de las consultas; la evidencia generada puede ser incorrecta o incompleta.
- Conjunto de evaluación muy reducido: 50 consultas de prueba, lo que limita la fiabilidad estadística de las métricas reportadas.
- Solo inglés: no soporta consultas en otros idiomas, lo que restringe su uso en equipos multilingües.
- Dependencia de sistema de retrieval externo: el modelo asume que existe un sistema que devuelve bloques `<|result|>`; sin él, el flujo agéntico no funciona.
- Licencia: la model card indica MIT, pero los metadatos de HuggingFace no confirman la licencia; se recomienda verificar antes de uso comercial.
- Despliegue complejo: requiere código custom (model.py) y no hay integración documentada con motores de inferencia estándar.
- Fechas de creación y actualización (agosto de 2026) son posteriores a la fecha de esta consulta; conviene verificar la vigencia del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Akahsizrr/makeitwork-1
- Perfil del autor: https://huggingface.co/Akahsizrr
- Modelo base: https://huggingface.co/Reizxn/makeitwork1
- Repositorio relacionado (pipeline GRPO): https://github.com/Vaskrokodile/dgx-spark-il
