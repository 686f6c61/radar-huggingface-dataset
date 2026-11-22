# masahiroid/ruri-v3-reranker-310m-coreai

## Resumen
ruri-v3-reranker-310m-coreai es una conversión no oficial del reranker japonés cl-nagoya/ruri-v3-reranker-310m al runtime Core AI de Apple (iOS/macOS 27 o superior, sucesor de Core ML). Lo publica el desarrollador independiente masahiroid y su objetivo es llevar la reordenación de resultados de búsqueda semántica a la inferencia en dispositivo, sin enviar datos a servidores externos. El modelo original, basado en ModernBERT-Ja, está pensado para puntuar pares consulta-documento en japonés e inglés.

La conversión reescribe el modelo desde cero para el Neural Engine y la GPU de Apple, con pesos en float16 y tres longitudes de secuencia fijas (128, 256 y 512 tokens). El repositorio ocupa 1,9 GB e incluye la implementación en `reranker_xsmall_ane.py` junto con los artefactos `.aimodel`.

Es relevante para desarrolladores de aplicaciones iOS/macOS que necesiten un reranker ligero, multilingüe (japonés/inglés) y ejecutable localmente, con validación de precisión frente a la referencia PyTorch fp32 y una auditoría de seguridad documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-Ja (transformer encoder bidireccional), 25 capas, hidden size 768 |
| Parametros totales | 310M (según nombre del modelo base; no se detalla desglose) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128, 256 o 512 tokens (variantes fijas empaquetadas) |
| Tipos de cuantizacion | float16 |
| Idiomas soportados | japonés (ja), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | artefactos `.aimodel` (Core AI), conversión desde safetensors del modelo base |
| Pipeline | text-ranking (reranker) |
| Unidades de cómputo | GPU y Neural Engine (ambas validadas) |
| Framework | Core AI (`coreai-torch`), implementación BC1S |

## Arquitectura y entrenamiento
El modelo original es un reranker basado en ModernBERT-Ja de 25 capas y dimensión oculta 768, que procesa la consulta y el documento como una única secuencia de par y produce una puntuación de relevancia mediante CLS pooling seguido de una cabeza de clasificación. La conversión mantiene esa topología pero la reimplementa para Core AI: layout BC1S, proyecciones mediante Conv2d y atención explícita por cabeza, optimizada para el Neural Engine de Apple.

La model card no detalla el corpus de entrenamiento, el número de tokens, ni si hubo fases de RLHF o DPO en el modelo base. La conversión en sí no reentrena pesos: parte de cl-nagoya/ruri-v3-reranker-310m y los transforma a float16 con longitudes de secuencia fijas. La innovación técnica destacable es la especialización para unidades de cómputo de Apple (GPU y Neural Engine) con tres variantes de longitud y una validación de precisión frente a la referencia fp32.

## Capacidades
- Reordenación (reranking) de pares consulta-documento: devuelve un logit de relevancia que se convierte en probabilidad aplicando sigmoid.
- Búsqueda semántica en japonés e inglés, con soporte de consultas y documentos mixtos en ambos idiomas.
- Procesamiento de pares como secuencia única, con attention mask, hasta 128, 256 o 512 tokens según la variante cargada.
- Inferencia en dispositivo en iOS/macOS mediante Core AI, ejecutable en GPU o Neural Engine.
- Integración con tokenizadores de Hugging Face (`transformers.AutoTokenizer`) para el preprocesado.
- No se documentan capacidades de generación de texto, tool calling, agentes, visión ni audio: es un modelo exclusivamente de ranking.

## Casos de uso
- Búsqueda semántica local en apps iOS/macOS: el modelo reordena los candidatos recuperados por un retriever y se ejecuta en el Neural Engine, de modo que los documentos del usuario no salen del dispositivo.
- Asistentes de documentación offline: en una app de notas o manuales en japonés, se usa para priorizar los fragmentos más relevantes ante una consulta, con la variante de 512 tokens para pasajes largos.
- Filtrado de resultados en motores de búsqueda internos: se integra como segunda etapa de ranking sobre los top-k de un índice vectorial, aprovechando la baja latencia de la GPU en macOS.
- Moderación y detección de prompt injection: la demo Ruri Atlas muestra cómo un prompt inyectado se posiciona en el mapa de embeddings; el reranker ayuda a puntuar la relevancia de entradas sospechosas.
- Aplicaciones de e-commerce o catálogos bilingües ja/en: reordena productos o fichas según la consulta del usuario sin depender de servicios en la nube.
- Prototipado e investigación en PLN japonés: permite comparar el comportamiento del reranker en dispositivo frente a la referencia PyTorch con diferencias de logit acotadas (máximo 0,0419 en Neural Engine).
- Pipelines de RAG en macOS: como etapa de reranking de chunks recuperados antes de pasarlos a un LLM local, manteniendo todo el flujo en el equipo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí incluye una validación de precisión frente a la referencia PyTorch fp32 sobre 4 pares consulta/documento (1 relevante, 3 irrelevantes o parciales):

| Objetivo | seq128 | seq256 | seq512 |
|---|---|---|---|
| Especialización GPU (diferencia absoluta máxima de logit) | 0,0206 | 0,0206 | 0,0128 |
| Especialización Neural Engine (diferencia absoluta máxima de logit) | 0,0419 | 0,0419 | 0,0419 |

El orden de ranking coincidió exactamente en todos los buckets y unidades de cómputo. Los logits en esos pares oscilan aproximadamente entre -12 y +11, y la resolución de fp16 cerca de 10 es de unos 0,008.

## Requisitos de hardware
- Entorno: iOS/macOS 27 o superior con runtime Core AI; no está pensado para GPUs NVIDIA ni para servidores Linux.
- Memoria: el repositorio ocupa 1,9 GB; los pesos en float16 de un modelo de 310M rondan los 0,6 GB, aunque la model card no desglosa el tamaño exacto de cada artefacto `.aimodel`.
- Unidades de cómputo: GPU y Neural Engine de Apple, ambas validadas; se seleccionan con `ComputeUnitKind.gpu()` o `ComputeUnitKind.neural_engine()`.
- Cabe en hardware de consumo Apple (iPhone, iPad y Mac con chip de la serie M o A compatible con Core AI).
- Despliegue: mediante `coreai.runtime` (paquete `coreai-core==1.0.0b3`) en Python, o integrándolo en apps nativas; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Formato/runtime | Licencia |
|---|---|---|---|---|---|
| ruri-v3-reranker-310m-coreai | 310M | 128/256/512 tokens fijos | ja, en | Core AI (`.aimodel`), float16 | Apache 2.0 |
| cl-nagoya/ruri-v3-reranker-310m (base) | 310M | según tokenizador del base (no detallado) | ja, en | safetensors (PyTorch) | Apache 2.0 |
| masahiroid/ruri-v3-130m-coreai | 130M | no disponible | ja, en | Core AI | Apache 2.0 |
| masahiroid/japanese-reranker-xsmall-v2-coreai | no disponible | no disponible | ja, en | Core AI | no disponible |

El modelo base ofrece la misma calidad de referencia en PyTorch, mientras que las otras dos conversiones de masahiroid priorizan menor tamaño o distinta arquitectura; no se han publicado comparativas de rendimiento entre ellas en la información disponible.

## Limitaciones y advertencias
- Es una conversión no oficial: no cuenta con el respaldo de los autores del modelo original (cl-nagoya).
- Solo soporta japonés e inglés; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Las longitudes de secuencia están fijas en 128, 256 o 512 tokens; los textos más largos se truncan y los más cortos requieren padding hasta la longitud elegida.
- El modelo devuelve un logit crudo: es responsabilidad del integrador aplicar sigmoid para obtener una probabilidad en [0, 1].
- Riesgo de alucinación no aplica en sentido generativo, pero sí puede producir puntuaciones de relevancia poco fiables en dominios alejados del entrenamiento original.
- No se documentan sesgos específicos del modelo base ni del proceso de conversión.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los artefactos empaquetados.
- Depende de un runtime reciente (Core AI, iOS/macOS 27+) y de un paquete en fase beta (`coreai-core==1.0.0b3`), lo que implica riesgo de cambios de API.
- La validación de precisión se basa en solo 4 pares consulta/documento, una muestra muy reducida.
- No hay métricas de latencia ni throughput publicadas para planificar despliegues en producción.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/masahiroid/ruri-v3-reranker-310m-coreai
- Modelo base: https://huggingface.co/cl-nagoya/ruri-v3-reranker-310m
- Demo Ruri Atlas: https://huggingface.co/spaces/masahiroid/ruri-atlas
- Conversión previa relacionada: https://huggingface.co/masahiroid/ruri-v3-130m-coreai
- Conversión previa relacionada: https://huggingface.co/masahiroid/japanese-reranker-xsmall-v2-coreai
- Documentación de Core AI: https://developer.apple.com/documentation/coreai
- Herramienta de auditoría: https://github.com/masahiroid/model-audit-lite
