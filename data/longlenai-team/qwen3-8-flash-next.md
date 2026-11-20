# longlenai-team/Qwen3.8-Flash-Next

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje causal multimodal (texto e imagen) publicado por el equipo de Qwen bajo el identificador `longlenai-team/Qwen3.8-Flash-Next` en Hugging Face. Se presenta como una vista previa experimental de la arquitectura que sustentará la próxima generación Qwen4, con un total de 180 000 millones de parámetros almacenados en safetensors (125B en el modelo de lenguaje con 6B activos, más 51B en embeddings de n-gramas y 4B en el módulo MTP). Es, por tanto, un modelo de mezcla de expertos (MoE) disperso con codificador de visión.

La propuesta técnica central es un rediseño de los componentes clásicos del transformer a escala: atención híbrida que combina Gated DeltaNet con Qwen Sparse Attention (QSA) a nivel de micro-bloque, residuales con compuertas (Gated Residual), embeddings de n-gramas como eje alternativo de escalado de parámetros y una receta de entrenamiento con Muon y AdamW aplicados selectivamente. El contexto nativo es de 262 144 tokens, extensible hasta 1 000 000.

El modelo resulta relevante porque anticipa las decisiones arquitectónicas de Qwen4 y porque su enfoque en latencia de contexto largo y eficiencia en memoria apunta directamente a cargas de trabajo agénticas, donde el coste por token y la ventana efectiva son factores limitantes. La licencia es `qwen-community-1.0` (etiquetada como "other"), por lo que conviene revisar sus términos antes de un uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con codificador de visión; atención híbrida Gated DeltaNet + Qwen Sparse Attention (QSA); MoE; Gated Residual; embeddings de n-gramas; MTP de 1 capa |
| Parámetros totales | 179 999 981 459 (~180B): 125B en el LM (6B activos) + 51B en embeddings de n-gramas + 4B en MTP |
| Parámetros activos | 6B en el modelo de lenguaje (10 expertos enrutados + 1 compartido por token) |
| Longitud de contexto | 262 144 tokens nativos; extensible hasta 1 000 000 |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiqueta `other`) |
| Formato de pesos | safetensors (compatible con Transformers; también vLLM, SGLang y TokenSpeed) |

## Arquitectura y entrenamiento

El modelo sigue un diseño de transformer causal con codificador de visión y una disposición de 48 capas organizadas en 12 bloques repetidos con el patrón `3 × (Gated DeltaNet → MoE) → 1 × (Qwen Sparse Attention → MoE)`. La dimensión oculta es 2560 y el vocabulario de salida está acolchado a 248 320 entradas. La rama de atención lineal (Gated DeltaNet) emplea 48 cabezas para V y 16 para QK con dimensión de cabeza 128; la rama de Qwen Sparse Attention usa 24 cabezas para Q y 2 para KV con dimensión 256, RoPE de 64 dimensiones y un indexador MQA (4 cabezas de consulta, 1 cabeza de clave compartida, dimensión 128) con un presupuesto de 512 bloques o 2048 tokens. La MoE cuenta con 512 expertos, de los que se activan 10 enrutados más 1 compartido, con dimensión intermedia de experto 640. Los Gated Residual operan con 4 ramas y rango de cuello de botella 320.

Las innovaciones declaradas son cuatro. Primero, QSA selecciona a nivel de micro-bloque en lugar de token individual, lo que reduce la latencia en contexto largo. Segundo, los Gated Residual modulan el flujo de información en las corrientes residuales mediante una compuerta de lectura elemento a elemento dependiente de los datos y una compuerta escalar de escritura por rama, preservando la estabilidad del entrenamiento. Tercero, los embeddings de n-gramas (20 000 000 de bigramas y trigramas en la capa 2) permiten escalar parámetros con menos cómputo y son más aptos para offloading que la MoE. Cuarto, la receta de entrenamiento aplica Muon y AdamW a categorías de pesos específicas, elimina el calentamiento de tamaño de lote y arranca directamente en el tamaño objetivo, guiada por leyes de escalado reajustadas. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; la model card solo indica que hubo preentrenamiento y postentrenamiento.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Procesamiento de imagen y texto de forma conjunta (pipeline `image-text-to-text`), gracias al codificador de visión.
- Codificación y razonamiento sobre contexto largo: 262 144 tokens nativos, ampliables a 1 000 000.
- Decodificación especulativa mediante el módulo MTP de 1 capa entrenado con múltiples pasos.
- Soporte de tool calling y function calling: la model card menciona herramientas integradas en la versión alojada Qwen3.8-Flash, no en estos pesos.
- Capacidades agénticas y razonamiento multi-paso: el diseño de QSA está explícitamente orientado a cargas agénticas.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo de pensamiento (thinking mode): no disponible.

## Casos de uso

- Agentes autónomos de larga duración: el contexto nativo de 262 144 tokens y la extensión a 1 000 000 permiten mantener el historial completo de una sesión agéntica con múltiples llamadas a herramientas sin truncar. La atención QSA a nivel de micro-bloque está pensada para que la latencia no se dispare en estas ventanas.
- Análisis de documentos extensos con imagen: al combinar codificador de visión y contexto largo, el modelo puede procesar informes escaneados, contratos con anexos gráficos o expedientes completos en una sola pasada.
- Asistentes de código en IDE: con 6B parámetros activos por token, el coste de inferencia por paso es contenido, lo que lo hace apto para autocompletado y revisión de parches en flujos interactivos.
- Atención al cliente automatizada: conversaciones multi-turno con memoria de casos previos y acceso a base de conocimiento inyectada en el contexto, sin necesidad de RAG agresivo para sesiones de decenas de miles de tokens.
- Investigación sobre arquitecturas eficientes: al ser una vista previa experimental de Qwen4, sirve como banco de pruebas para estudiar el equilibrio entre atención lineal, atención dispersa y MoE en condiciones reales.
- Procesamiento por lotes de documentación técnica: clasificación, extracción y resumen de grandes volúmenes de PDF y capturas, aprovechando el pipeline image-text-to-text.
- Despliegue en clústeres con memoria limitada: los embeddings de n-gramas están diseñados para offloading, lo que permite servir el modelo en aceleradores con menos memoria de la que exigiría una MoE equivalente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección "Benchmark Results" con maquetación CSS, pero los datos numéricos no están presentes en el extracto proporcionado, por lo que no se reproducen cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 360 GB en safetensors, lo que corresponde a los pesos en precisión de entrenamiento (probablemente BF16). En BF16 se necesita un pool de al menos ~360 GB de memoria agregada; en FP8 se reduciría aproximadamente a la mitad, aunque no se confirman cuantizaciones oficiales.
- GPU recomendadas: para BF16 se requiere un nodo multi-GPU de clase H100 (80 GB) o superior; para FP8, configuraciones de 4–8 aceleradores H100/A100 80 GB.
- ¿Cabe en GPU de consumo? No en su totalidad. Con 180B de parámetros totales, incluso en cuantizaciones agresivas de 4 bits el peso ronda los 90 GB, por encima de una RTX 4090 (24 GB). Solo sería viable con offloading masivo a RAM/CPU, lo que degradaría gravemente el throughput.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed, según la model card. No se menciona soporte de llama.cpp ni Ollama.
- Latencia y throughput estimados: no disponibles. La model card afirma reducciones significativas de latencia en contexto largo gracias a QSA, pero sin cifras.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-Flash-Next | ~180B / 6B | 262 144 (hasta 1M) | qwen-community-1.0 | Pesos abiertos en HF |
| Qwen3.8-Flash (alojado) | No disponible | 1 000 000 por defecto | Servicio comercial | API Qwen Cloud |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es una vista previa experimental: la propia model card la describe como un anticipo de la arquitectura de Qwen4, no como un modelo de producción estable.
- No hay benchmarks publicados en la información disponible, lo que impide verificar las afirmaciones de rendimiento.
- Idiomas soportados no declarados: no se puede asumir un rendimiento multilingüe homogéneo, y menos aún en castellano.
- Riesgo de alucinación: inherente a los modelos generativos; sin datos de evaluación no se puede acotar su magnitud.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de seguridad en la información disponible.
- Licencia `qwen-community-1.0` etiquetada como "other": es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial, ya que las condiciones no están resumidas en la model card.
- El contexto extendido a 1 000 000 de tokens corresponde a la versión alojada Qwen3.8-Flash; en estos pesos el contexto nativo es 262 144 y la extrapolación a 1M requiere validación propia.
- El tamaño de 360 GB y los 180B de parámetros implican un coste de infraestructura elevado y descartan el despliegue en hardware de consumo.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere una publicación muy reciente y sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/longlenai-team/Qwen3.8-Flash-Next
- Blog oficial: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe técnico: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Repositorio GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next
- Qwen Cloud (servicio gestionado): https://www.qwencloud.com
- Página de Qwen3.8-Flash alojado: https://www.qwencloud.com/models/qwen3.8-flash
- Diagrama de arquitectura: https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3.8-Flash-Next/architecture.png
