# Danbidan2443/e5-base-small-ft

## Resumen

`e5-base-small-ft` es un modelo de embeddings de frases derivado de `intfloat/multilingual-e5-base` mediante fine-tuning supervisado sobre pares sintéticos pregunta en coreano ↔ fragmento de artículo en inglés. Lo publica el usuario Danbidan2443 y su propósito declarado es servir de motor de recuperación semántica para un proyecto personal llamado AI Study Manager (repositorio `github.com/danbidan/ai-core`). El modelo no es un generador de texto: es un encoder bi-encoder que produce vectores para búsqueda por similitud.

El artefacto publicado es una versión ONNX cuantizada a 8 y 4 bits, con el vocabulario recortado, lo que reduce el tamaño del repositorio a unos 0,1 GB. Esta compresión lo aleja del checkpoint original en precisión y cobertura léxica, y conviene tenerlo en cuenta antes de reutilizarlo: el recorte de vocabulario implica que los tokens eliminados no podrán representarse correctamente en inferencia.

La relevancia práctica es limitada y muy específica: se trata de un experimento de un solo autor, sin descargas ni validación externa, entrenado y evaluado sobre un corpus mínimo (un artículo y 40 preguntas, según la propia model card). Es útil como referencia de cómo empaquetar un e5-base en ONNX con cuantización mixta para entornos con poca memoria, no como modelo listo para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-like), base de `intfloat/multilingual-e5-base` |
| Parametros totales | no disponible (el modelo base e5-base tiene ~278 M, pero no se confirma el recuento tras el recorte de vocabulario) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (e5-base admite hasta 512 tokens; no confirmado para este artefacto) |
| Tipos de cuantizacion | ONNX con pesos a 8 bits y 4 bits |
| Idiomas soportados | no disponible oficialmente; el fine-tuning usa preguntas en coreano y pasajes en inglés |
| Licencia | MIT |
| Formato de pesos | ONNX (repositorio de 0,1 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de `intfloat/multilingual-e5-base`, un encoder transformer de la familia BERT con pooling sobre la representación del token `[CLS]` o media de tokens, diseñado para embeddings multilingües y entrenado originalmente con objetivos contrastivos. Sobre esa base, el autor aplica un fine-tuning supervisado con pares (pregunta en coreano, fragmento de artículo científico en inglés) generados de forma sintética, con el objetivo de alinear el espacio de embeddings entre ambos idiomas en el dominio de literatura académica.

El proceso posterior incluye dos transformaciones que afectan materialmente al modelo: el recorte del vocabulario (no se especifica el criterio ni cuántos tokens se eliminan) y la cuantización de pesos a 8 y 4 bits en formato ONNX. No se documentan hiperparámetros, número de pasos, tamaño del dataset de entrenamiento ni si hubo etapas de contraste adicionales. La model card indica que los documentos de entrenamiento y evaluación no se solapan, lo que mitiga (pero no elimina) el riesgo de fuga de información en la evaluación.

## Capacidades

- Generación de embeddings de frases para búsqueda semántica y recuperación de pasajes.
- Recuperación cross-lingüe coreano → inglés en el dominio de artículos científicos, según el propósito declarado del fine-tuning.
- Ejecución en ONNX Runtime, lo que permite despliegue en CPU y en entornos con requisitos de memoria reducidos.
- Cuantización a 4 y 8 bits para inferencia con menor huella de memoria.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni capacidades de agente: es un encoder, no un modelo causal.
- No se documentan capacidades multimodales (visión, audio) ni modo de razonamiento explícito.

## Casos de uso

- Búsqueda semántica en un gestor de estudio personal: indexar apuntes y artículos y recuperar fragmentos relevantes a partir de una pregunta, que es exactamente el escenario para el que se entrenó (AI Study Manager).
- Recuperación cross-lingüe coreano-inglés: un usuario formula la consulta en coreano y el sistema devuelve pasajes de papers en inglés, aprovechando el alineamiento aprendido en el fine-tuning.
- Despliegue en dispositivos con poca memoria: al estar en ONNX cuantizado a 4/8 bits y ocupar 0,1 GB, puede ejecutarse en CPU o en GPUs de gama baja dentro de aplicaciones de escritorio o móviles.
- Componente de un pipeline RAG ligero: usar el modelo como retriever en un sistema con un generador separado, siempre que el dominio sea académico y el idioma de consulta sea coreano.
- Prototipado rápido de sistemas de recomendación de contenido científico: calcular similitud entre resúmenes de papers y perfiles de usuario.
- Evaluación comparativa de técnicas de cuantización: sirve como caso de estudio de cómo afecta el recorte de vocabulario y la cuantización mixta a la calidad de los embeddings en una tarea concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, MTEB, etc.) en la información disponible. La model card menciona únicamente una evaluación sobre un artículo y 40 preguntas, sin reportar métricas numéricas (recall, MRR, nDCG) ni comparación con el modelo base.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en FP32 para el encoder base; con la cuantización a 4/8 bits y el vocabulario recortado, el artefacto ONNX ocupa 0,1 GB en disco y cabe holgadamente en memoria de cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU con al menos 1-2 GB de VRAM (GTX 1050, RTX 3050, etc.) es suficiente.
- Cabe en cualquier GPU consumer e incluso en dispositivos de borde.
- Opciones de despliegue: ONNX Runtime (principal, dado el formato), con posibilidad de exportar a otros runtimes compatibles con ONNX. No se distribuyen pesos en safetensors ni GGUF, por lo que llama.cpp y Ollama no son aplicables directamente.
- Latencia y throughput: no disponibles; dependerán del hardware y de la longitud de los textos, pero para un encoder de este tamaño se esperan latencias de milisegundos por lote en CPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `Danbidan2443/e5-base-small-ft` | no disponible (base ~278 M) | no disponible | coreano/inglés (fine-tuning) | MIT | ONNX cuantizado | Fine-tuning específico, sin benchmarks públicos |
| `intfloat/multilingual-e5-base` | ~278 M | 512 tokens | multilingüe (100+) | MIT | safetensors, PyTorch | Modelo base, evaluado en MTEB, referencia de calidad |
| `intfloat/multilingual-e5-small` | ~118 M | 512 tokens | multilingüe | MIT | safetensors | Alternativa más ligera del mismo linaje |
| `BAAI/bge-m3` | ~568 M | 8192 tokens | multilingüe | MIT | safetensors | Retriever multilingüe con soporte denso, disperso y multi-vector |

La comparación directa con el modelo base es la más informativa: este artefacto hereda la arquitectura de e5-base pero introduce recorte de vocabulario y cuantización agresiva, sin métricas que cuantifiquen la pérdida de calidad.

## Limitaciones y advertencias

- Evaluación muy limitada: un solo artículo y 40 preguntas, sin métricas numéricas publicadas; no es evidencia suficiente para uso en producción.
- El recorte de vocabulario puede degradar la tokenización de textos fuera del dominio de entrenamiento y de idiomas distintos del coreano y el inglés.
- La cuantización a 4 bits puede introducir pérdida apreciable de precisión en los embeddings; no se documenta el impacto.
- El fine-tuning se hizo sobre pares sintéticos, lo que puede introducir artefactos y sesgos del generador de datos.
- El modelo está diseñado para un caso de uso muy concreto (preguntas en coreano sobre papers en inglés); su rendimiento en otros dominios o idiomas es desconocido.
- No es un modelo generativo: no debe usarse para responder preguntas directamente, solo para recuperar.
- Sin descargas ni validación de la comunidad; el autor es un particular y el repositorio no tiene histórico de mantenimiento.
- Licencia MIT permite uso comercial, pero la ausencia de garantías y de documentación técnica desaconseja su uso en sistemas críticos sin una evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Danbidan2443/e5-base-small-ft
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-base
- Repositorio del proyecto del autor: https://github.com/danbidan/ai-core
