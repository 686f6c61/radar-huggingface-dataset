# kaitchup/LFM3-1.7B-chimachima-kaiPTQ

## Resumen

LFM3-1.7B-chimachima-kaiPTQ es una cuantización en formato GGUF del modelo base LiquidAI/LFM3-1.7B, publicada por el usuario kaitchup bajo el marco de trabajo kaiPTQ (mixed-precision quantization). El modelo base pertenece a la familia LFM3 de Liquid AI, una arquitectura de tipo transformer con mecanismos de atención lineal diseñada para inferencia eficiente en entornos con recursos limitados. Esta versión concreta aplica una estrategia de cuantización de precisión mixta etiquetada como "chimachima", combinando técnicas de QTIP y YAQA para reducir el peso del modelo manteniendo la calidad de salida.

El interés de esta ficha radica en que ofrece una alternativa de despliegue ligero del LFM3-1.7B, orientada a ejecución local y en CPU/GPU de gama media mediante llama.cpp y herramientas compatibles con GGUF. El repositorio tiene acceso restringido (gated), por lo que es necesario aceptar las condiciones en Hugging Face antes de descargarlo. La licencia declarada es lfm1.0, la licencia propia de Liquid AI para su familia LFM.

Cabe señalar que el número de parámetros reportado en los safetensors del repositorio (653.284.309) no coincide con el tamaño nominal de 1.7B del modelo base, lo que sugiere que el recuento corresponde a una representación parcial o a los tensores cuantizados empaquetados, no al total de parámetros del modelo original. Esta discrepancia debe tenerse en cuenta al planificar el despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal (familia LFM3 de Liquid AI); detalles exactos no disponibles |
| Parametros totales | 653.284.309 según safetensors del repo (el modelo base nominal es de 1.7B; discrepancia no aclarada) |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con precisión mixta (mixed-precision), técnicas QTIP y YAQA según tags del repo |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (acceso restringido, gated) |
| Formato de pesos | GGUF (safetensors presentes en el repo) |

## Arquitectura y entrenamiento

El modelo base LiquidAI/LFM3-1.7B pertenece a la tercera generación de la familia LFM (Liquid Foundation Models) de Liquid AI. Según la información disponible, se trata de una arquitectura transformer con mecanismos de atención lineal, orientada a reducir el coste computacional de la inferencia frente a la atención cuadrática estándar. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

Esta versión concreta no es un reentrenamiento, sino una cuantización post-entrenamiento (PTQ) realizada con el pipeline kaiPTQ de kaitchup. La estrategia de precisión mixta "chimachima" combina asignaciones de bits distintas por capa o por tensor, apoyándose en las técnicas QTIP (quantization with trellis-coded quantization) y YAQA (yet another quantization approach) mencionadas en los tags. El resultado se empaqueta en GGUF para su uso con llama.cpp y runtimes compatibles. No se han publicado detalles sobre la calibración, el tamaño efectivo de bits por peso ni las métricas de degradación introducidas por la cuantización.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation y el tag "conversational" indica uso orientado a diálogo.
- Inferencia local: el formato GGUF permite ejecución en CPU y GPU de consumo mediante llama.cpp y derivados.
- Compatibilidad con endpoints: el tag "endpoints_compatible" sugiere integración con infraestructura de despliegue tipo Hugging Face Endpoints o servidores compatibles con la API de inferencia.
- Capacidades multilingües: no disponibles (el campo de idiomas no está informado).
- Tool calling / function calling: no disponible en la información proporcionada.
- Razonamiento multi-paso y agentes: no disponible en la información proporcionada.
- Visión o audio: no disponible; el modelo base es de texto según los tags.

## Casos de uso

- Despliegue en estaciones de trabajo sin GPU dedicada: al estar en GGUF, puede ejecutarse con llama.cpp en CPU con cuantización de precisión mixta, lo que permite prototipar asistentes conversacionales en portátiles convencionales.
- Prototipado rápido de chatbots: el tamaño reducido (repo de 4,9 GB) y el pipeline de text-generation lo hacen adecuado para iterar sobre prompts y flujos conversacionales antes de migrar a un modelo mayor.
- Inferencia en el borde (edge): su huella de memoria moderada permite integrarlo en dispositivos con recursos limitados donde un modelo de 7B o superior no cabría, siempre que se valide la calidad tras la cuantización.
- Evaluación comparativa de técnicas de cuantización: investigadores interesados en kaiPTQ, QTIP y YAQA pueden usar este repo como referencia para medir la degradación de calidad frente al modelo base LiquidAI/LFM3-1.7B.
- Servicio de generación de texto de bajo coste: con "endpoints_compatible", puede desplegarse tras una API compatible con la inferencia de Hugging Face para tareas de generación simple con baja concurrencia.
- Filtrado y clasificación de texto ligera: tareas de etiquetado, resumen corto o reescritura donde la latencia y el coste importan más que la calidad máxima, aprovechando el tamaño reducido del modelo.
- Base para fine-tuning ligero: al ser un GGUF derivado de un modelo abierto con licencia lfm1.0, puede servir como punto de partida para adaptaciones posteriores, sujeto a las condiciones de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta; el tamaño del repo es de 4,9 GB, por lo que la inferencia en GPU requerirá al menos ese orden de memoria, dependiendo de la variante GGUF concreta y del contexto.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cabría en GPUs de consumo con 8 GB o más de VRAM, aunque no se confirma.
- GPU de consumo: probablemente sí en tarjetas con 8 GB o más (RTX 3060, RTX 4060, RTX 4070), sujeto a validación.
- Opciones de despliegue: llama.cpp y runtimes compatibles con GGUF; el tag "endpoints_compatible" sugiere también servidores de inferencia tipo Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-chimachima-kaiPTQ | 1.7B nominal (653M según safetensors del repo) | no disponible | GGUF | lfm1.0 (gated) | Acceso restringido |
| LiquidAI/LFM3-1.7B (base) | 1.7B | no disponible | safetensors | lfm1.0 | Público en Hugging Face |
| Alternativas de ~1-2B en GGUF | no disponible | no disponible | GGUF | variable | variable |

No se dispone de datos de rendimiento comparativo entre esta cuantización y el modelo base ni con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated; es obligatorio aceptar las condiciones en Hugging Face antes de descargar los pesos.
- Licencia lfm1.0: es una licencia propia de Liquid AI con posibles restricciones para uso comercial; debe revisarse antes de cualquier despliegue en producción.
- Degradación por cuantización: al ser una cuantización de precisión mixta, puede presentar pérdida de calidad frente al modelo base; no se han publicado métricas que cuantifiquen esa degradación.
- Discrepancia de parámetros: el recuento de safetensors (653M) no coincide con el tamaño nominal de 1.7B, lo que introduce incertidumbre sobre la configuración exacta empaquetada.
- Idiomas no documentados: no se especifica qué lenguas soporta, por lo que el rendimiento en castellano no está garantizado.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; no se han publicado evaluaciones de fidelidad.
- Sesgos: no se dispone de información sobre sesgos conocidos ni sobre el proceso de alineación del modelo base.
- Sin benchmarks: la ausencia de resultados publicados impide validar su rendimiento frente a alternativas antes de adoptarlo.
- Contexto desconocido: se desconoce la longitud máxima de contexto, lo que limita la planificación de casos de uso con documentos largos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kaitchup/LFM3-1.7B-chimachima-kaiPTQ
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Página de Liquid AI (familia LFM): no disponible en la información proporcionada
- Paper o blog de kaiPTQ: no disponible en la información proporcionada
- Repositorio de llama.cpp: no disponible en la información proporcionada
