# Archsloth/Qwen3.5-9B-GGUF

## Resumen

Qwen3.5-9B-GGUF es una cuantización del modelo Qwen3.5-9B publicada por el usuario Archsloth bajo el identificador Archsloth/Qwen3.5-9B-GGUF. No se trata de un modelo entrenado desde cero, sino de una conversión a formato GGUF del modelo original de Qwen, orientada a su ejecución local con llama.cpp. El modelo base es un vision-language model (image-text-to-text) de aproximadamente 9.197 millones de parámetros, con licencia Apache-2.0 y capacidades declaradas en coreano e inglés.

La relevancia de esta ficha no está en el modelo base, sino en el método de cuantización empleado. El autor aplica AutoRound con la extensión algorítmica SignRoundV2 (arXiv:2512.04746) para optimizar el redondeo de los pesos durante la exportación a Q4_K_M, manteniendo los tipos de tensor y anchos de bit estándar de llama.cpp. Según la model card, esto reduce la divergencia KL respecto al original en bf16 un 25,4 % en coreano y un 11,4 % en inglés frente a otra cuantización Q4_K_M de referencia (unsloth).

El repositorio incluye tanto los pesos cuantizados como la torre de visión en precisión completa (mmproj-F32.gguf), el corpus de calibración, el conjunto de evaluación y los registros de medición, lo que permite reproducir las cifras declaradas. El modelo está pensado para despliegue en CPU y en dispositivos locales mediante llama.cpp, sin necesidad de forks ni formatos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5-9B; cuantización GGUF para llama.cpp) |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (pesos); torre de visión en F32 sin cuantizar |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Qwen3.5-9B-AS-Q4_K_M.gguf, 5,78 GB; mmproj-F32.gguf, 1,82 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B es un vision-language model multimodal, tal como indica el pipeline image-text-to-text y la presencia de una torre de visión separada. La model card no detalla la arquitectura interna del transformer ni la composición del dataset de entrenamiento original, por lo que estos datos deben consultarse en la ficha del modelo base Qwen/Qwen3.5-9B.

La innovación técnica de esta publicación reside en el proceso de cuantización. Se parte de los pesos originales en bf16 y se aplica AutoRound de Intel con `--enable_alg_ext` (SignRoundV2), un método de búsqueda de redondeo basado en gradiente de signo, junto con un esquema `GGUF:Q4_K_M` que optimiza el redondeo para el cuantizador usado en la exportación. La calibración emplea 200 muestras de 9.000 caracteres cada una, con coreano e inglés intercalados a nivel de muestra; según el autor, la intercalación fue el factor determinante, no la proporción entre idiomas. Los anchos de bit y tipos de tensor son los estándar de llama.cpp, sin nada por debajo de 4 bits, y la torre de visión se conserva en precisión completa.

## Capacidades

- Generación de texto conversacional multi-turno.
- Comprensión de imágenes (image-text-to-text) mediante la torre de visión incluida en mmproj-F32.gguf.
- Capacidades multilingües declaradas en coreano e inglés.
- Ejecución local en CPU y en dispositivos on-device mediante llama.cpp.
- Servidor compatible con la API de OpenAI a través de `llama-server`.
- Soporte de plantillas de chat con `--jinja`.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, modo thinking, audio ni matemáticas avanzadas.

## Casos de uso

- Asistente conversacional local en coreano e inglés: el modelo puede mantener diálogos multi-turno ejecutándose íntegramente en CPU con llama.cpp, sin depender de servicios en la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Procesamiento de documentos con imágenes: al incluir la torre de visión, puede recibir capturas, formularios escaneados o diagramas junto con texto y responder preguntas sobre ellos, usando `llama-server` con `--mmproj`.
- Despliegue en portátiles y equipos sin GPU dedicada: el archivo Q4_K_M de 5,78 GB cabe en memoria RAM de sistemas de consumo y se ejecuta con `-ngl 0`, lo que lo hace viable para desarrollo offline.
- Prototipado de aplicaciones con API compatible con OpenAI: `llama-server` expone un endpoint compatible que permite sustituir llamadas a APIs comerciales durante el desarrollo sin cambiar el código cliente.
- Evaluación de técnicas de cuantización: el repositorio incluye corpus de calibración, conjunto de evaluación y registros, por lo que sirve como caso de estudio reproducible para investigar el impacto del redondeo en modelos multimodales.
- Atención al cliente en coreano: el ajuste específico de la calibración para coreano reduce la divergencia KL en ese idioma, lo que lo hace preferible a cuantizaciones genéricas cuando el tráfico principal es coreano.
- Investigación sobre modelos locales multimodales: permite experimentar con visión y lenguaje en hardware modesto, comparando el comportamiento frente al modelo en bf16 con las métricas de divergencia KL publicadas.

## Benchmarks y rendimiento

La model card no publica benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.). Sí publica métricas de divergencia KL respecto al original en bf16, medidas con `llama-perplexity --kl-divergence`, contexto 512, 60 chunks, sobre texto coreano e inglés no incluido en el conjunto de calibración:

| Modelo / cuantización | Bytes | KL coreano | KL inglés |
|---|---:|---:|---:|
| ARCHsloth Q4_K_M | 5.780.090.240 | 0,019255 | 0,019237 |
| unsloth Q4_K_M | 5.680.522.464 | 0,025821 | 0,021718 |
| unsloth UD-Q4_K_XL | 5.966.095.584 | 0,013740 | 0,012546 |
| llama-quantize estándar | 5.780.090.304 | 0,043475 | 0,037879 |

Mejora relativa declarada por el autor (menor es mejor):

| Frente a | Coreano | Inglés |
|---|---:|---:|
| unsloth Q4_K_M (mismo nivel) | −25,4 % | −11,4 % |
| llama-quantize estándar | −55,7 % | −49,2 % |

No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM/RAM para inferencia: el archivo Q4_K_M ocupa 5,78 GB; con la torre de visión (1,82 GB) el total asciende a unos 7,6 GB. Se necesita margen adicional para el contexto y el estado de inferencia.
- GPU recomendadas: no se especifican en la información disponible. El modelo está etiquetado para CPU y on-device, y los ejemplos de la model card usan `-ngl 0`, es decir, sin offload a GPU.
- GPU de consumo: no se confirma compatibilidad específica con RTX 4090, RTX 3090 u otras; la orientación del repositorio es ejecución en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), con soporte de plantillas Jinja mediante `--jinja`. No se mencionan vLLM, TGI, Ollama ni otros runtimes.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Archsloth Qwen3.5-9B-GGUF | 9,197 M | no disponible | GGUF Q4_K_M | Apache-2.0 | Cuantización con AutoRound/SignRoundV2; KL coreano 0,019255 |
| unsloth Qwen3.5-9B-GGUF | 9,197 M (base) | no disponible | GGUF Q4_K_M y UD-Q4_K_XL | Apache-2.0 | Referencia de comparación; KL coreano 0,025821 (Q4_K_M) y 0,013740 (UD-Q4_K_XL) |
| llama-quantize estándar (Qwen3.5-9B) | 9,197 M (base) | no disponible | GGUF Q4_K_M | Apache-2.0 | Cuantizador de referencia de llama.cpp; KL coreano 0,043475 |

La comparación se limita a variantes de cuantización del mismo modelo base, ya que la información disponible no incluye otros modelos de la misma categoría con datos verificables.

## Limitaciones y advertencias

- Solo se declaran coreano e inglés como idiomas soportados; el rendimiento en castellano u otros idiomas no está documentado.
- No se dispone de datos sobre sesgos del modelo base ni sobre su comportamiento en dominios sensibles.
- Riesgo de alucinación inherente al modelo base; no se han publicado evaluaciones específicas de fidelidad factual.
- La longitud de contexto no está indicada en la información disponible, lo que impide planificar despliegues con ventanas largas.
- La licencia Apache-2.0 permite uso comercial, pero las condiciones del modelo base Qwen3.5-9B deben verificarse en su ficha original.
- La torre de visión se distribuye en F32 (1,82 GB adicionales); omitirla desactiva por completo la capacidad multimodal.
- Las métricas de divergencia KL son del autor y se midieron con contexto 512 y 60 chunks; no equivalen a una evaluación de calidad en tareas reales.
- El modelo está pensado para llama.cpp; no se garantiza compatibilidad con otros runtimes sin conversión adicional.
- El número de descargas (104) y la fecha de creación (2026-09-14) indican una adopción todavía limitada, por lo que la validación comunitaria es escasa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Archsloth/Qwen3.5-9B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Cuantización de referencia para comparación: https://huggingface.co/unsloth/Qwen3.5-9B-GGUF
- Colección Archsloth: https://huggingface.co/collections/Archsloth/archsloth-models
- Qwen3-4B (misma colección): https://huggingface.co/Archsloth/Qwen3-4B-GGUF
- Qwen3.8-27B (misma colección): https://huggingface.co/Archsloth/Qwen3.8-27B-GGUF
- AutoRound (Intel): https://github.com/intel/auto-round
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper SignRoundV2: https://arxiv.org/abs/2512.04746
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
