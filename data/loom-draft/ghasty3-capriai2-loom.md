# loom-draft/Ghasty3-CapriAI2-loom

## Resumen

Ghasty3-CapriAI2-loom es un paquete de despliegue en formato Loom generado a partir del checkpoint GGUF sin modificar Ghasty3/CapriAI2, concretamente el fichero `CapriAI2-Gemma-4-E4B-it.Q4_K_M.gguf`, que a su vez deriva del modelo base Gemma 4 E4B IT. El paquete lo publica el usuario loom-draft y está pensado para ejecutar el modelo sobre GPUs AMD concretas: la APU AMD Ryzen AI Max+ 395 ("Strix Halo", gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se trata, por tanto, de un modelo entrenado desde cero ni de un fine-tune nuevo, sino de un artefacto de empaquetado que incluye programas `.loom` generados, un `model.json` de configuración, el tokenizador y los pesos en cuantización Q4_K_M.

La relevancia del paquete es de infraestructura más que de modelado: permite servir un modelo multimodal (image-text-to-text) con una API compatible con OpenAI sobre hardware AMD mediante el runtime Loom (`loom-serve`), sin depender de llama.cpp en producción, aunque el propio autor usa llama.cpp como referencia de corrección. El paquete declara soporte de tool calling, modo de razonamiento opcional (desactivado por defecto), entrada de imágenes mediante un proyector multimodal BF16 separado, contexto de 131.072 tokens por petición y 4 peticiones concurrentes.

La información pública es muy escasa: el repositorio de Hugging Face tiene 0 descargas y 0 likes, tamaño de 0.0 GB, y las mediciones de rendimiento y de corrección del propio autor figuran como "not yet re-measured" en ambas GPUs objetivo. Los datos de arquitectura y entrenamiento del modelo subyacente (Gemma 4 E4B IT) no se detallan en la model card proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo subyacente Gemma 4 E4B IT; el paquete es un artefacto de despliegue Loom) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens por petición (según la model card del paquete) |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector multimodal en BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (checkpoint original) empaquetado como programas `.loom` y `weights.loom`; incluye `tokenizer.json` y `model.json` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo subyacente en la documentación proporcionada. El nombre del checkpoint (`gemma-4-e4b-it`) sugiere la familia Gemma 4 en una variante "E4B" con ajuste de instrucciones, pero la model card del paquete no detalla número de capas, tipo de atención, dimensión oculta ni composición del dataset de entrenamiento. Tampoco se indica si hubo RLHF, DPO u otras etapas de alineamiento.

Lo que sí documenta el paquete es la capa de despliegue: los programas `.loom` se generan con la herramienta loom-next "sin LLM en el bucle", es decir, mediante generación automática de kernels, y se ejecutan con `loom-serve` sobre el runtime hrx-loom 0.2.0. El paquete incluye un proyector multimodal independiente (`CapriAI2-Gemma-4-E4B-it.BF16-mmproj.gguf`) para la entrada de imágenes. La decodificación especulativa figura como "not applicable" en la tabla de características, y el modo de razonamiento se controla mediante `chat_template_kwargs: {"enable_thinking": true|false}`.

## Capacidades

- Generación de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Entrada de imágenes en formato OpenAI `image_url`, procesadas por el proyector multimodal BF16; pipeline declarado `image-text-to-text`.
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls`.
- Modo de razonamiento ("thinking") opcional, desactivado por defecto y activable por petición.
- Soporte de conversaciones multi-turno con reutilización de historial (según las puertas de corrección `agent` y `agent_think_off` descritas).
- Concurrencia de hasta 4 peticiones simultáneas con salida máxima de 4.096 tokens por petición (preset `max_tokens`).
- Capacidades de audio: no determinadas ("?" en la model card).
- Capacidades multilingües: no disponibles.

## Casos de uso

- Despliegue de un asistente conversacional multimodal sobre AMD Strix Halo: usar `loom-fetch` y `loom-serve` para servir el paquete en la APU Ryzen AI Max+ 395 y exponer un endpoint compatible con OpenAI para un chat con entrada de imágenes.
- Servicio de visión-lenguaje en estación de trabajo con Radeon AI PRO R9700: aprovechar los 32 GB de VRAM de la GPU para cargar el GGUF Q4_K_M y el proyector BF16 y atender consultas sobre imágenes (descripción, extracción de información) vía `image_url`.
- Agentes con tool calling: integrar el endpoint en un orquestador que envíe `tools` en formato OpenAI y consuma `tool_calls`, con el modo thinking desactivado para reducir latencia en bucles de agente.
- Análisis de documentos largos: explotar la ventana de 131.072 tokens por petición para resumir o extraer datos de documentos extensos en una sola llamada.
- Evaluación de la cadena de herramientas Loom: usar el paquete como banco de pruebas para validar kernels generados, comparándolos contra la referencia de llama.cpp con el mismo GGUF (puertas `golden`, `compare`, `vision`, `agent`).
- Prototipado en hardware AMD sin CUDA: servir el modelo en gfx1151 o gfx1201 cuando el entorno de desarrollo es AMD y se quiere evitar la pila CUDA/llama.cpp en producción.
- Razonamiento opcional bajo demanda: activar `enable_thinking` solo en peticiones que requieran mayor profundidad analítica, manteniéndolo apagado en el resto para ahorrar tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las mediciones de rendimiento frente a llama.cpp para este paquete "are not yet re-measured" tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201), y que todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPUs.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el paquete está diseñado para la Radeon AI PRO R9700 con 32 GB y para la APU Strix Halo (memoria unificada). El GGUF es Q4_K_M, por lo que el peso en memoria es moderado, pero el tamaño exacto del checkpoint no se indica en la información disponible.
- GPUs soportadas oficialmente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se mencionan GPUs NVIDIA ni otras AMD.
- GPU de consumo: no se confirma compatibilidad con GPUs de consumo; el soporte declarado se limita a los dos destinos AMD anteriores.
- Despliegue: runtime Loom mediante `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. Opciones recomendadas en la model card: `--pool_backing=fixed`, `--parameter_mode=preload` y `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU).
- Latencia y throughput: no disponibles; las filas de rendimiento no se han vuelto a medir para este paquete.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Ghasty3-CapriAI2-loom (este paquete) | no disponible | 131.072 tokens | MIT | Hugging Face (0 descargas) | Paquete Loom para AMD gfx1151 y gfx1201; sin benchmarks publicados |
| Ghasty3/CapriAI2 (modelo base del paquete) | no disponible | no disponible | no disponible | Hugging Face | Checkpoint GGUF original del que deriva este paquete |
| Gemma 4 E4B IT (modelo de origen) | no disponible | no disponible | no disponible | no disponible | Familia y variante inferidas del nombre del fichero; sin datos en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones suficientes para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Paquete sin validación publicada: todas las puertas de corrección y las mediciones de rendimiento figuran como no re-medidas, por lo que no hay evidencia publicada de que la salida coincida con la referencia de llama.cpp en esta versión.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, con tamaño de repositorio de 0.0 GB, lo que puede indicar que los artefactos no están materializados o que el paquete es un borrador.
- Soporte de hardware restringido: solo se documentan dos destinos AMD (gfx1151 y gfx1201); no hay garantía de funcionamiento en otras GPUs.
- Idiomas no declarados: no se puede confirmar el soporte multilingüe del modelo subyacente.
- Capacidades indeterminadas: audio y parámetros de muestreo figuran como "not determined" en la model card.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; deben asumirse los riesgos habituales de un modelo de lenguaje de su familia.
- Dependencia de la cadena Loom: requiere `hrx-loom==0.2.0` y el runtime Loom; no es un GGUF servible directamente con llama.cpp sin conversión.
- Licencia MIT declarada para el paquete; las condiciones del modelo base (Gemma 4) no se detallan en la información proporcionada y podrían imponer restricciones adicionales al uso comercial.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/Ghasty3-CapriAI2-loom
- Modelo base del paquete: https://huggingface.co/Ghasty3/CapriAI2
- Repositorio del runtime Loom: https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
