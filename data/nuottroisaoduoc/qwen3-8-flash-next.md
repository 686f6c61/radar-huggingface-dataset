# nuottroisaoduoc/Qwen3.8-Flash-Next

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje causal multimodal (imagen-texto a texto) de código abierto desarrollado por Qwen (Alibaba), presentado como una vista previa experimental de la arquitectura que sustentará la futura generación Qwen4. Su principal aportación es una revisión profunda de los componentes fundamentales de los LLM: una atención híbrida que combina Gated DeltaNet (GDN) con Qwen Sparse Attention (QSA), un mecanismo de residuo con puertas (Gated Residual), un embedding basado en n-gramas y una receta de entrenamiento optimizada con los optimizadores Muon y AdamW. El modelo tiene aproximadamente 180 mil millones de parámetros totales (125B del modelo de lenguaje activos por token, más 51B de n-gram embedding y 4B de módulo de predicción multi-token), de los cuales solo 6B se activan durante la inferencia gracias a su arquitectura de mezcla de expertos (MoE). Soporta una longitud de contexto nativa de 262 144 tokens, extensible hasta 1 000 000. Está diseñado para tareas de razonamiento avanzado, agente y codificación, y se distribuye bajo la licencia Qwen Community 1.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet (GDN) + Qwen Sparse Attention (QSA) + MoE + Gated Residual + N-gram Embedding |
| Parametros totales | 179 999 981 459 (según safetensors) |
| Parametros activos | 6 000 000 000 (aprox.) |
| Longitud de contexto | 262 144 tokens nativo; extensible hasta 1 000 000 |
| Tipos de cuantizacion | No disponible (pesos originales en safetensors; se pueden generar GGUF y FP8 mediante herramientas externas) |
| Idiomas soportados | No disponible |
| Licencia | Qwen Community 1.0 (license: other) |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

Qwen3.8-Flash-Next adopta una arquitectura híbrida que combina dos mecanismos de atención: Gated DeltaNet (GDN) para el procesamiento lineal de secuencias y Qwen Sparse Attention (QSA) que opera a nivel de micro-bloques en lugar de tokens individuales, reduciendo la latencia en contextos largos. El modelo utiliza una estructura de 48 capas con un patrón de 12 × (3 × (GDN → MoE) → 1 × (QSA → MoE)). El componente MoE cuenta con 512 expertos, de los cuales 10 son enrutados más 1 compartido, con dimensión intermedia de 640. Además, incorpora Gated Residual, que modula el flujo de información a través de ramas residuales con puertas de lectura y escritura dependientes de los datos, y un embedding de n-gramas (bigramas y trigramas en la capa 2) que escala el número de parámetros sin aumentar el coste computacional de manera significativa.

El entrenamiento se divide en pre-entrenamiento y post-entrenamiento. La receta de optimización aplica los optimizadores Muon y AdamW a categorías específicas de pesos, y se elimina el calentamiento tradicional del tamaño de batch, comenzando directamente con el tamaño objetivo, lo que reduce los pasos de optimización y permite tasas de aprendizaje mayores. No se especifican los datos de entrenamiento ni el número de tokens utilizados. El modelo incluye un módulo de predicción multi-token (MTP) de 1 capa entrenado con múltiples pasos.

## Capacidades

- Generación de texto y razonamiento complejo, con capacidades de agente y multi-step reasoning.
- Procesamiento de imágenes (entrada visual) junto con texto, soportando tareas de visión y lenguaje.
- Codificación de software, con rendimiento destacado en tareas de agente de codificación (según la web de unsloth).
- Soporte de tool calling y function calling (integrado en la versión oficial Qwen3.8-Flash).
- Atención a contextos largos (262K tokens nativo, hasta 1M con extensión) para conversaciones extensas y análisis de documentos largos.
- Capacidades multilingües: no se han publicado detalles específicos de idiomas soportados.
- Compatible con herramientas de inferencia como vLLM, SGLang y TokenSpeed para despliegue en producción.

## Casos de uso

- Agentes de codificación autónomos: el modelo puede gestionar tareas de programación de múltiples pasos, integrando tool calling para interactuar con repositorios, ejecutar tests y generar código, gracias a su razonamiento avanzado y su ventana de contexto de 262K tokens que permite procesar proyectos completos.
- Análisis de documentos largos y extracción de información: su contexto de 262K tokens permite procesar libros, contratos o informes extensos en una sola pasada, con atención híbrida que mantiene la eficiencia computacional.
- Asistencia conversacional multimodal: al combinar visión y texto, puede responder a consultas sobre imágenes (por ejemplo, diagnóstico de imágenes médicas o descripción de entornos) en tiempo real.
- Razonamiento matemático y científico: su arquitectura MoE con 6B parámetros activos ofrece alta capacidad de razonamiento con coste computacional reducido, adecuado para problemas de física, matemáticas o lógica.
- Despliegue en entornos con memoria limitada: gracias a su diseño MoE y al embedding de n-gramas que se puede descargar, puede ejecutarse en hardware con 78GB de RAM unificada (según unsloth) sin necesidad de GPU de alta VRAM, lo que lo hace viable para estaciones de trabajo con Apple Silicon o CPUs con memoria abundante.
- Integración en pipelines de agente en producción: la versión oficial Qwen3.8-Flash añade herramientas integradas y contexto de 1M, lo que permite construir sistemas de automatización de flujos de trabajo complejos, como orquestación de APIs o gestión de bases de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información proporcionada. La model card de HuggingFace muestra una tabla de benchmarks, pero el contenido se encuentra truncado y no se han podido extraer valores concretos. En la web de unsloth se afirma que el modelo supera a Claude-4.6-Opus (Max) en tareas de agente de codificación y visión, pero no se ofrecen cifras específicas. Por tanto, no se dispone de datos verificables para presentar una tabla comparativa.

## Requisitos de hardware

- Inferencia en CPU: según unsloth, el modelo puede ejecutarse en dispositivos con 78 GB de RAM/unified memory sin necesidad de VRAM, lo que permite su uso en Macs con chips unificados o servidores CPU con gran memoria.
- Inferencia en GPU: para uso con GPU, se recomienda al menos una GPU con 80 GB de VRAM para cargar los pesos en BF16 (180B parámetros) o utilizar cuantización FP8 (aproximadamente 90 GB). No se dispone de datos exactos de VRAM de la información oficial.
- GPUs recomendadas: A100 80GB, H100 80GB, o múltiples RTX 4090 (24GB) con sharding.
- Opciones de despliegue: compatible con vLLM, SGLang, TokenSpeed, Transformers, y posiblemente llama.cpp para GGUF generado externamente.
- Latencia y throughput: no se han publicado estimaciones oficiales. La atención híbrida y el MoE reducen la latencia en contextos largos, pero los datos concretos no están disponibles.

## Comparativa con modelos similares

No se dispone de datos suficientes para realizar una comparativa cuantitativa con otros modelos de la misma categoría. El modelo se posiciona como una arquitectura experimental que supera a Claude-4.6-Opus en ciertas tareas según fuentes no oficiales, pero no se han publicado cifras de benchmarks comparativos. Se sugiere esperar a que Qwen publique el informe técnico completo para obtener métricas fiables.

## Limitaciones y advertencias

- Al ser una vista previa experimental, la arquitectura no está completamente validada en producción y puede presentar comportamientos inesperados.
- La licencia Qwen Community 1.0 tiene restricciones de uso comercial; se debe revisar el texto completo para conocer los límites.
- No se han publicado detalles sobre los datos de entrenamiento, por lo que no se puede evaluar la composición de sesgos ni la cobertura de idiomas.
- El modelo tiene un tamaño de descarga de 360 GB, lo que requiere una infraestructura de almacenamiento y transferencia significativa.
- La extensión de contexto a 1M tokens puede degradar la calidad de generación en los tramos finales si no se utiliza la versión oficial con herramientas integradas.
- No se han publicado resultados de benchmarks independientes; las afirmaciones de rendimiento provienen de fuentes no verificadas.

## Enlaces

- Repositorio de HuggingFace (versión espejo): https://huggingface.co/nuottiroisaoduoc/Qwen3.8-Flash-Next
- Repositorio oficial de HuggingFace: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio de GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next
- Blog de Qwen: https://qwen.ai/blog?id=qwen3.8-flash-next
- Documentación de unsloth: https://unsloth.ai/docs/models/qwen3.8-next
- Colección de Qwen en HuggingFace: https://huggingface.co/collections/Qwen/qwen38-flash-next
