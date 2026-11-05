# Austriani/LFM3-1.7B-ARA-Abliterated-ik_llama.cpp

## Resumen

LFM3-1.7B-ARA-Abliterated-ik_llama.cpp es una versión cuantizada del modelo LFM3-1.7B de Liquid AI, publicada por el usuario Austriani en Hugging Face. El modelo base original es un transformer híbrido de 1.728.801.600 parámetros (aproximadamente 1,7 mil millones) diseñado por Liquid AI para despliegue en el borde (edge deployment), con atención híbrida y componentes convolucionales que permiten manejar contexto largo con un coste computacional reducido. Sobre esa base, el autor aplicó una técnica de "abliteración" (eliminación de la dirección de rechazo en el espacio de activaciones) mediante un método que denomina ARA (arbitrary-rank ablation), orientada a producir un modelo sin censura para roleplay y escritura creativa.

La aportación específica de este repositorio es la conversión a formato GGUF para el motor ik_llama.cpp, una bifurcación de llama.cpp optimizada para cuantizaciones de tipo IQK (trellis quant) y para el uso de matrices de importancia (imatrix) personalizadas. El autor indica que empleó una imatrix "uncensored" calibrada con su metodología V3, lo que según la model card mejora la fidelidad de las cuantizaciones de baja precisión en dominios creativos y conversacionales.

El modelo es relevante para quienes necesitan ejecutar un LLM pequeño en hardware de consumo, con licencia LFM 1.0 (no plenamente permisiva para uso comercial sin condiciones) y con la particularidad de estar descensurado. No obstante, la información publicada es escasa: no hay benchmarks, no se detalla la composición del dataset de entrenamiento ni el proceso exacto de abliteración, y el repositorio registra cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención híbrida y componentes convolucionales (según tags: hybrid-attention, convolutional) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (el tag "long-context" sugiere ventana extendida, sin cifra publicada) |
| Tipos de cuantizacion | IQ5_K, IQ4_K, IQ4_KS, IQ4_KS_R4, IQ4_KT, BF16 (según tags) |
| Idiomas soportados | en (inglés) |
| Licencia | lfm1.0 (licencia LFM 1.0, marcada como "other") |
| Formato de pesos | GGUF (librería ik_llama.cpp); el modelo base en safetensors |
| Tamano del repo | 8,7 GB |
| Modelo base | Austriani/LFM3-1.7B-ARA-Abliterated |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura del modelo base LFM3-1.7B combina mecanismos de atención con capas convolucionales, una configuración híbrida que Liquid AI emplea para reducir el coste de atención en secuencias largas manteniendo capacidad de modelado. Los tags del repositorio confirman "hybrid-attention", "convolutional" y "long-context". No se dispone de información publicada sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO en el modelo original; la model card proporcionada no incluye esos datos.

Sobre el modelo base, el autor aplicó una abliteración mediante "arbitrary-rank ablation" (ARA), una variante de las técnicas de directional ablation que proyectan fuera del espacio de activaciones la dirección asociada a respuestas de rechazo. El resultado se convirtió a GGUF para ik_llama.cpp usando una imatrix propia etiquetada como "uncensored" y calibrada con el método V3 del autor. No se detalla el conjunto de calibración, el rango de la ablación ni las métricas de degradación asociadas al proceso, por lo que no es posible evaluar el impacto de la abliteración sobre el rendimiento general del modelo.

## Capacidades

- Generación de texto conversacional y creativo, con énfasis declarado en roleplay y escritura creativa.
- Modelo descensurado (abliterated), orientado a reducir rechazos en temas sensibles.
- Soporte de contexto largo por diseño del modelo base (tag "long-context"), sin cifra concreta publicada.
- Capacidad multilingüe limitada al inglés según el campo `language: en`.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta soporte de visión, audio ni modo de razonamiento explícito (thinking mode).
- Compatible con endpoints (tag `endpoints_compatible`), lo que sugiere despliegue vía infraestructura de Hugging Face.

## Casos de uso

- Roleplay y narrativa interactiva: el modelo está afinado y descensurado específicamente para este dominio, lo que permite conversaciones multi-turno sin los rechazos típicos de modelos alineados; su tamaño de 1,7B facilita ejecución local con baja latencia.
- Escritura creativa asistida: generación de ficción, diálogos y guiones en inglés, aprovechando la abliteración para tramas con contenido adulto o violento sin bloqueos.
- Prototipado de chatbots de personaje en local: al caber en GPUs de consumo con cuantización IQ4, sirve para iterar rápido en el diseño de personalidades sin depender de APIs.
- Despliegue en el borde: el tag "edge-deployment" y su tamaño permiten ejecutarlo en dispositivos con recursos limitados mediante ik_llama.cpp o llama.cpp.
- Investigación sobre abliteración: útil como caso de estudio para medir el efecto de la ablación de direcciones de rechazo sobre la calidad del lenguaje y la coherencia.
- Experimentación con cuantizaciones IQK: el repositorio ofrece varias variantes (IQ5_K, IQ4_K, IQ4_KS, IQ4_KT) para comparar calidad y velocidad en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1-1,3 GB en IQ4_KS/IQ4_K para los pesos, más overhead de contexto KV; en torno a 1,5-1,8 GB en IQ5_K; unos 3,5 GB en BF16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones IQ4; RTX 3060, RTX 4060, RTX 4090 y GPUs de datacenter (A100, H100) funcionan sin problema, aunque para este tamaño son sobredimensionadas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU discreta moderna e incluso en iGPUs con memoria unificada.
- Opciones de despliegue: ik_llama.cpp (motor nativo del repo), llama.cpp compatible con GGUF, y potencialmente Ollama si se importa el GGUF; vLLM y TGI no están documentados para este formato.
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-ARA-Abliterated (este) | 1,73B | no disponible | LFM 1.0 | GGUF (ik_llama.cpp) | Descensurado, orientado a roleplay |
| LFM3-1.7B original (Liquid AI) | ~1,7B | no disponible | LFM 1.0 | safetensors | Modelo base alineado |
| Modelos ~1-2B de la familia Llama/Qwen | 1-2B | 4K-32K según variante | variable | safetensors, GGUF | Alternativas generalistas; datos concretos no disponibles en esta ficha |

No se dispone de datos de rendimiento comparativo publicados para este modelo, por lo que la comparación se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- La abliteración puede degradar la coherencia, la instrucción following y el conocimiento factual; no hay métricas publicadas que cuantifiquen ese impacto.
- Riesgo elevado de alucinación inherente a un modelo de 1,7B, agravado por la eliminación de mecanismos de rechazo.
- El modelo solo declara soporte de inglés; el rendimiento en castellano no está garantizado.
- La licencia LFM 1.0 no es de código abierto plena: impone condiciones para uso comercial que deben revisarse antes de desplegar en producción.
- El contenido descensurado puede generar material sensible, ofensivo o ilegal según el uso; requiere moderación externa en aplicaciones públicas.
- No hay información sobre el dataset de calibración de la imatrix ni sobre la reproducibilidad de las cuantizaciones.
- Repositorio con cero descargas y cero likes: sin validación comunitaria ni evidencia de calidad.
- No se documentan capacidades de tool calling ni de agente, por lo que no es adecuado para pipelines automatizados complejos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Austriani/LFM3-1.7B-ARA-Abliterated-ik_llama.cpp
- Modelo base: https://huggingface.co/Austriani/LFM3-1.7B-ARA-Abliterated
- ik_llama.cpp (repositorio del motor): no disponible en la información proporcionada
- Liquid AI (desarrollador del modelo original): no disponible en la información proporcionada
- Paper o blog de LFM3: no disponible en la información proporcionada
