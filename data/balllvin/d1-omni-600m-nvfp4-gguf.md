# balllvin/d1-omni-600M-NVFP4-GGUF

## Resumen

d1-omni-600M-NVFP4-GGUF es una cuantización en formato GGUF de 4 bits (NVFP4) del modelo LiquidAI/d1-omni-600M, publicada por el usuario balllvin. El modelo base, desarrollado por Liquid AI, pertenece a la familia d1-omni y está orientado a tareas de decisión y clasificación de texto, con un pipeline declarado de text-classification y capacidad de extracción de características.

El artefacto empaqueta los pesos del modelo base en un formato optimizado para inferencia con llama.cpp, lo que permite ejecutarlo en CPU o GPU con requisitos de memoria reducidos. El repositorio tiene un tamaño de 1,9 GB y declara 380.732.161 parámetros reales en safetensors, aunque el nombre comercial del modelo base indica 600M.

La relevancia de esta ficha es doble: por un lado, documenta una cuantización de un modelo de decisión de Liquid AI pensada para despliegue ligero; por otro, advierte de que el acceso está restringido (gated) y de que la licencia lfm1.0 impone condiciones específicas para uso comercial. No se dispone de información pública sobre benchmarks, datos de entrenamiento ni detalles arquitectónicos del modelo base en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/d1-omni-600M) |
| Parametros totales | 380.732.161 (safetensors); nombre comercial 600M |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits), formato GGUF |
| Idiomas soportados | en (inglés) |
| Licencia | lfm1.0 (other) |
| Formato de pesos | GGUF (repo de 1,9 GB); modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo base LiquidAI/d1-omni-600M en la información proporcionada. El nombre de la familia (d1-omni) y las etiquetas del repositorio (decision-model, text-classification, feature-extraction) sugieren un modelo orientado a tareas de decisión y clasificación, pero no se confirma si se trata de un transformer denso, un modelo híbrido o una arquitectura específica de Liquid AI.

Tampoco se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO u otras técnicas de alineación. La cuantización NVFP4 es una innovación de compresión (formato de 4 bits de NVIDIA para pesos y activaciones) que reduce el tamaño y acelera la inferencia en hardware compatible, pero no aporta información sobre el entrenamiento del modelo original.

## Capacidades

- Clasificación de texto (pipeline declarado: text-classification).
- Extracción de características (feature-extraction) para tareas downstream.
- Modelo de decisión (decision-model), orientado a seleccionar opciones o rutas en flujos automatizados.
- Inferencia en llama.cpp con cuantización NVFP4 de 4 bits.
- Compatibilidad con endpoints (tag endpoints_compatible).
- Soporte multilingüe limitado al inglés (tag en).
- No se dispone de información sobre tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Clasificación de tickets de soporte: el modelo puede etiquetar automáticamente consultas entrantes por categoría (facturación, técnico, cuenta) gracias a su pipeline de text-classification, integrándose en un sistema de enrutamiento.
- Moderación de contenido en inglés: uso como clasificador binario o multiclase para filtrar mensajes en plataformas comunitarias, con la ventaja de que la cuantización NVFP4 permite desplegarlo en servidores sin GPU dedicada.
- Extracción de características para búsqueda semántica: las representaciones del modelo pueden alimentar un índice vectorial para recuperación de documentos en inglés, aprovechando la etiqueta feature-extraction.
- Filtrado previo en pipelines RAG: usar el modelo como decisor para determinar si una consulta requiere recuperación de documentos o puede responderse directamente, reduciendo costes de un LLM mayor.
- Clasificación de reseñas y feedback de producto: análisis de sentimiento o categorización de opiniones en inglés con un modelo ligero que cabe en CPU.
- Despliegue en edge o entornos con recursos limitados: la cuantización de 4 bits y el formato GGUF permiten ejecutar el modelo en dispositivos con poca memoria mediante llama.cpp u Ollama, útil para clasificación local sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de una cuantización NVFP4 de 4 bits sobre 380,7 M de parámetros, el peso de los pesos ronda los 0,2-0,3 GB; con overhead de contexto y buffers de llama.cpp, se estima un consumo de 0,5-1 GB de memoria.
- GPU recomendadas: cualquier GPU con soporte para operaciones de 4 bits; para NVFP4 nativo se requiere hardware NVIDIA Blackwell o posterior. En GPUs anteriores, llama.cpp puede dequantizar a FP16/BF16 en tiempo de ejecución.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 3050, etc.), y también en CPU.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama (si se convierte el GGUF), y servidores compatibles con endpoints (tag endpoints_compatible).
- Latencia y throughput: no disponibles; para un modelo de este tamaño en CPU se espera latencia de milisegundos por secuencia corta, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| balllvin/d1-omni-600M-NVFP4-GGUF | 380,7 M (safetensors) | no disponible | lfm1.0 | GGUF 4 bits | Gated en HF |
| LiquidAI/d1-omni-600M (base) | 600M (nominal) | no disponible | lfm1.0 | safetensors | HF (base) |
| Alternativas de clasificación ligeras (p. ej. modelos tipo MiniLM) | 20-120 M | 256-512 tokens típico | variable | safetensors/GGUF | no disponible en esta búsqueda |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar el modelo.
- Licencia lfm1.0: impone condiciones específicas para uso comercial; es responsabilidad del usuario revisar los términos antes de desplegarlo en producción.
- Idioma: solo se declara soporte de inglés (tag en); el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación: al ser un modelo de clasificación/decisión, puede producir etiquetas incorrectas en dominios alejados de sus datos de entrenamiento; no se dispone de información sobre calibración.
- Sin datos de benchmarks: no hay evidencia pública de precisión, F1 u otras métricas en la información disponible.
- Cuantización NVFP4: la compresión a 4 bits puede degradar ligeramente la precisión respecto al modelo base en FP16/BF16; no se han publicado comparativas de calidad.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación comunitaria ni de que la cuantización haya sido verificada por terceros.
- Fecha de creación declarada (2026-11-17): conviene verificar la integridad y procedencia del artefacto antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/balllvin/d1-omni-600M-NVFP4-GGUF
- Modelo base: https://huggingface.co/LiquidAI/d1-omni-600M
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- No se han encontrado papers, blogs o demos adicionales en la información proporcionada.
