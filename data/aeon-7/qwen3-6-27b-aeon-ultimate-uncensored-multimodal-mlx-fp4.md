# AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-MLX-FP4

## Resumen

AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-MLX-FP4 es una exportación cuantizada en formato MLX de un modelo multimodal de 27.356.728.560 parámetros (≈27,36 mil millones), derivada del checkpoint BF16 AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16. El autor es AEON-7 y la ficha se publica bajo licencia "other". La arquitectura declarada en las etiquetas es un transformer híbrido con componentes Gated DeltaNet, Mamba/SSM y atención lineal, además de una torre de visión para entrada image-text-to-text y una cabeza MTP (multi-token prediction) destinada a decodificación especulativa.

El modelo resuelve el problema de ejecutar inferencia multimodal de 27B en memoria unificada de Apple Silicon: ocupa 16 GB en disco y alcanza unos 17 GB de pico en memoria, con un mínimo declarado de 24 GB de memoria unificada en chips M1 o posteriores. Se distribuye como una cuantización mixta: mxfp4 real de 4 bits en el grueso del decodificador híbrido, islas afines de 8 bits en las proyecciones k/v de GQA, embeddings y cabeza de salida, y bf16 en la dinámica de estado de Gated DeltaNet, la torre de visión y la cabeza MTP.

Es relevante ahora porque combina tres elementos poco habituales en un mismo paquete: multimodalidad completa (texto e imagen), decodificación especulativa nativa mediante MTP sin pérdida de calidad y un ajuste de tipo abliterated/uncensored con los rechazos eliminados. El rendimiento declarado es de 15,2 tok/s en flujo único y 26,5 tok/s con autospeculación MTP (1,78× sin pérdida). La propia model card indica que esta ficha ha sido superada por la línea Qwen3.8 del mismo autor y que se mantiene en línea por motivos históricos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con Gated DeltaNet (SSM/atención lineal) y atención GQA, más torre de visión y cabeza MTP para decodificación especulativa |
| Parametros totales | 27.356.728.560 (≈27,36 mil millones) |
| Parametros activos | No aplica; no se indica arquitectura MoE en la información disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: mxfp4 de 4 bits en el grueso del decodificador híbrido; islas afines de 8 bits en k/v de GQA, embeddings y cabeza; bf16 en la dinámica de estado de Gated DeltaNet, la torre de visión y la cabeza MTP. Existe un hermano MLX-8bit casi sin pérdida |
| Idiomas soportados | Inglés (en), según metadatos y model card |
| Licencia | other (los términos concretos no se detallan en la información disponible) |
| Formato de pesos | safetensors en formato MLX (librería mlx); el drafter MTP se distribuye como repositorio aparte |

Otros datos: repositorio de 16,7 GB, 345 descargas y 2 likes en el momento de la consulta, creado el 23 de junio de 2026 y actualizado el 12 de septiembre de 2026. Pipeline declarado: image-text-to-text.

## Arquitectura y entrenamiento

La información disponible describe un decodificador híbrido: junto a capas de atención con GQA (agrupación de consultas) conviven mecanismos de estado recurrente del tipo Gated DeltaNet y componentes Mamba/SSM con atención lineal, orientados a reducir el coste de memoria del contexto largo respecto a un transformer denso convencional. El modelo incorpora además una cabeza MTP que actúa como borrador nativo para decodificación especulativa: los tokens propuestos se verifican contra el modelo objetivo, por lo que el resultado es idéntico en bytes a la decodificación sin MTP y la ganancia es puramente de velocidad. La torre de visión corresponde a `qwen3_5_vision` y se conserva en bf16, de modo que la modalidad de imagen no se degrada con la cuantización.

No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. La model card sí identifica el modelo como abliterated, uncensored y refusal-removed, lo que implica una intervención de postentrenamiento orientada a eliminar comportamientos de rechazo. La distribución de precisión es una innovación de despliegue destacable: 4 bits en la mayor parte de la matriz de pesos, 8 bits en los puntos sensibles a la cuantización (k/v de GQA, embeddings y cabeza) y bf16 exacto en las dinámicas de estado del bloque híbrido y en los módulos multimodales, una estrategia de precisión mixta que busca preservar la coherencia del texto largo sin disparar el uso de memoria.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Comprensión de imagen y texto (pipeline image-text-to-text): acepta contenido `image_url` en formato OpenAI y también la ruta `--image` en `mlx_vlm.generate`.
- Decodificación especulativa mediante cabeza MTP nativa, con un drafter de 821 MB y tamaño de bloque 3 como punto óptimo declarado.
- Modelo abliterated: los comportamientos de rechazo han sido eliminados, lo que cambia el perfil de respuesta respecto al modelo base original.
- Razonamiento y generación de código: no se documentan con benchmarks ni evaluaciones específicas en la información disponible.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: limitadas a inglés según los metadatos del repositorio.
- Capacidades especiales: visión integrada, modo de precisión mixta con islas de 8 bits y bf16, y despliegue local en Apple Silicon.

## Casos de uso

- Asistente conversacional local en Mac: el modelo se sirve con `mlx_vlm.server` y expone un endpoint compatible con OpenAI (`POST /v1/chat/completions`), de modo que puede sustituir a una API en la nube en aplicaciones de chat que deban funcionar sin conexión y con 16 GB de disco.
- Análisis de imágenes en el dispositivo: al conservar la torre de visión en bf16 y aceptar entradas `image_url`, permite describir, clasificar o extraer información de capturas, diagramas y fotografías sin enviar los datos a un tercero.
- Procesamiento por lotes de documentos escaneados: combinando entrada de imagen y generación de texto se pueden digitalizar y resumir facturas, formularios o notas manuscritas en un flujo local; el coste es de 15,2 tok/s en flujo único, por lo que conviene dimensionar los lotes en consecuencia.
- Prototipado e investigación en interpretabilidad: al ser un modelo abliterated con arquitectura híbrida Gated DeltaNet/Mamba, resulta útil para estudiar cómo se comportan los mecanismos de rechazo y las dinámicas de estado recurrente en un modelo multimodal de 27B.
- Evaluación de estrategias de cuantización mixta: la comparación entre este export FP4 y su hermano MLX-8bit permite medir el impacto real de bajar de 8 a 4 bits en tareas concretas, con la misma arquitectura y los mismos pesos de origen.
- Despliegue de bajo consumo en portátil: con 17 GB de pico en memoria unificada, un MacBook Pro M4 Pro de 48 GB puede ejecutar el modelo y el drafter MTP a la vez y mantener conversaciones interactivas con latencias aceptables gracias a los 26,5 tok/s autospeculativos.
- Generación asistida en editores y herramientas de escritorio: el endpoint local y la decodificación especulativa hacen viable integrar el modelo como backend de autocompletado o redacción en aplicaciones nativas de macOS.
- Experimentación con decodificación especulativa sin pérdida: el drafter MTP permite reproducir un esquema de borrador-verificador real sobre un modelo de 27B, útil para comparar metodologías de aceleración en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos cuantitativos de rendimiento son medidas de velocidad declaradas por el autor:

| Metrica | Valor declarado |
|---|---|
| Throughput en flujo único (sin MTP) | 15,2 tok/s |
| Throughput con autospeculación MTP | 26,5 tok/s (1,78× sin pérdida, bloque de 3) |
| Throughput del hermano MLX-8bit | 8,2 tok/s (el export FP4 es ≈3,2× más rápido) |
| Memoria de pico | ≈17 GB en memoria unificada |
| Tamano en disco | 16 GB |
| Tamano del drafter MTP | 821 MB |
| Memoria adicional sin MTP | ≈1,6 GB menos de memoria unificada |

No se dispone de comparaciones de calidad (perplejidad, tasas de acierto en tareas) frente al checkpoint BF16 o al export de 8 bits.

## Requisitos de hardware

- Memoria unificada mínima: 24 GB en Apple Silicon (M1 o posterior); validado en un MacBook Pro M4 Pro de 48 GB.
- Uso de memoria en inferencia: ≈17 GB de pico con el modelo cargado y 16 GB en disco; prescindir del MTP reduce el consumo en aproximadamente 1,6 GB.
- GPU: no se soportan GPU NVIDIA ni el stack CUDA en este repositorio; el objetivo es Metal en Apple Silicon. El autor redirige a un contenedor vLLM (`ghcr.io/aeon-7/aeon-vllm-ultimate` y `ghcr.io/aeon-7/aeon-vllm-ultimate-rtx`) únicamente para la línea sucesora Qwen3.8.
- Cabe en GPU de consumo equivalente por memoria (tarjetas de 24 GB o más), pero no hay soporte de pesos para ese entorno en este export.
- Opciones de despliegue: `python -m mlx_vlm.server` con endpoint compatible con OpenAI; `python -m mlx_vlm.generate` para una sola generación; instalación mediante `uv` con Python 3.12 y `mlx-vlm` desde `main` de GitHub (la visión `qwen3_5_vision` no está en la versión 0.6.1).
- El drafter MTP se carga con `--draft-model AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-MLX-MTP-Drafter --draft-kind mtp --draft-block-size 3`.
- Latencia y throughput: 15,2 tok/s en flujo único y 26,5 tok/s con MTP, según las medidas del autor.
- Parámetros de muestreo recomendados: `temperature: 1.0`, `top_p 0.95`, `top_k ~64`. El servidor MLX usa decodificación voraz por defecto (`temperature 0`), lo que puede provocar bucles en prompts largos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Rendimiento declarado |
|---|---|---|---|---|---|
| AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-MLX-FP4 (este) | 27,36 mil millones | no disponible | MLX, mxfp4 4 bits + islas de 8 bits + bf16 | other | 15,2 tok/s; 26,5 tok/s con MTP |
| AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-MLX-8bit | 27,36 mil millones (mismo origen) | no disponible | MLX de 8 bits, casi sin pérdida | other | 8,2 tok/s |
| AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16 | 27,36 mil millones (checkpoint base) | no disponible | safetensors bf16 | other | no disponible |
| AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED | 27 mil millones (denominación del autor) | no disponible | NVFP4 mixto con retícula FP8, orientado a vLLM/GPU | other | no disponible; el autor lo declara superior en capacidad |

La model card posiciona explícitamente la línea Qwen3.8 como sucesora y recomienda este export de Qwen3.6 solo si se necesita inferencia local en Apple Silicon desde el árbol anterior.

## Limitaciones y advertencias

- Modelo abliterated: los rechazos han sido eliminados deliberadamente, por lo que puede generar contenido que el modelo original bloquearía. Es responsabilidad del integrador aplicar sus propias salvaguardas.
- Sesgos conocidos: no se documenta ninguna evaluación de sesgos en la información disponible.
- Riesgo de alucinación: no se han publicado métricas de veracidad ni de fidelidad; el ajuste uncensored puede aumentar la confianza en respuestas no verificadas.
- Idioma: solo inglés declarado en los metadatos; el rendimiento en castellano u otros idiomas no está documentado.
- Longitud de contexto: no disponible, lo que impide planificar cargas de trabajo con documentos largos sin una prueba previa.
- Licencia "other": los términos exactos no se detallan, por lo que el uso comercial requiere revisar la ficha original y contactar con el autor si es necesario.
- Ciclo de vida: el autor marca esta ficha como superada y recomienda la línea Qwen3.8 para trabajos nuevos; no se garantizan actualizaciones.
- Compatibilidad: solo MLX/Metal en Apple Silicon; no hay pesos GGUF ni soporte CUDA en este export.
- Dependencia de la rama `main` de `mlx-vlm` para la visión; la versión publicada 0.6.1 no incluye `qwen3_5_vision`.
- Decodificación voraz por defecto en el servidor MLX: sin fijar `temperature: 1.0` pueden aparecer bucles en prompts largos.
- El repositorio puede requerir autenticación (`hf auth login`) mientras permanezca privado.
- Los datos de velocidad (15,2 y 26,5 tok/s) son medidas del autor en un M4 Pro de 48 GB y no se han replicado de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-MLX-FP4
- Modelo base BF16: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16
- Hermano MLX de 8 bits: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-MLX-8bit
- Drafter MTP: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-MLX-MTP-Drafter
- Sucesor recomendado por el autor: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Documentación de uv: https://docs.astral.sh/uv/
- Contenedores vLLM referenciados para la línea sucesora: ghcr.io/aeon-7/aeon-vllm-ultimate y ghcr.io/aeon-7/aeon-vllm-ultimate-rtx

La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los únicos resultados obtenidos fueron páginas corporativas de Microsoft sin relación con la ficha.
