# mwdw/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB

## Resumen

NVIDIA-Nemotron-3.5-Bolt-E4B-4GB es una cuantización Q4_K_M en formato GGUF del modelo NVIDIA-Nemotron-3.5-Bolt-E4B-BF16, publicada por el usuario mwdw en Hugging Face. El modelo subyacente es un SLM (small language model) desarrollado por NVIDIA mediante post-entrenamiento a partir de Gemma-4-E4B-it, orientado a asistentes locales de voz y dispositivo, personas interactivas e interfaces embebidas donde la memoria y el time-to-first-token (TTFT) son críticos.

La arquitectura es Gemma-4-E4B, con 8B parámetros totales y 4B efectivos, lo que indica un diseño de mezcla de expertos o activación selectiva que reduce el coste computacional en inferencia. Soporta hasta 64K tokens de contexto tanto de entrada como de salida, y expone controles de plantilla de chat para activar o desactivar el modo de razonamiento (`enable_thinking`) y el modo conversacional (`conversational_mode`), ambos con presupuesto de pensamiento configurable en tiempo de ejecución.

Su relevancia actual reside en que ofrece capacidades conversacionales y de uso de herramientas multi-turno en un paquete de 4 GB cuantizado, desplegable con llama.cpp sobre GPU de consumo, e incluye soporte de decodificación especulativa mediante un drafter DFlash complementario. La licencia OpenMDW-1.1 permite uso comercial y no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma-4-E4B |
| Parametros totales | 8B (7.518.069.290 segun safetensors del repo) |
| Parametros activos | 4B efectivos |
| Longitud de contexto | Entrada hasta 64K tokens; salida hasta 64K tokens |
| Tipos de cuantizacion | Q4_K_M (esta version); BF16 disponible en el repo base |
| Idiomas soportados | en, ar, bg, cs, da, de, el, es, et, fi, fr, hi, hr, hu, id, it, ja, ko, lt, lv, nl, no, pl, pt, ro, ru, sk, sl, sv, th, tr, uk, vi, zh |
| Licencia | OpenMDW-1.1 (openmdw.ai/license/1-1/) |
| Formato de pesos | GGUF (repo de 6.2 GB); BF16 en safetensors en el modelo base |
| Precision de esta version | Q4_K_M |
| Entradas / salidas | Texto / texto |
| Despliegue recomendado | llama.cpp (recipe pendiente segun model card) |
| Modo de razonamiento | Control por plantilla de chat (`enable_thinking=True/False`) y presupuesto de pensamiento en runtime |
| Modo conversacional | Control por plantilla de chat (`conversational_mode=True/False`) |
| Muestreo recomendado | Temperature 1.0, top_p 0.95 en ambos modos de pensamiento |
| Fecha de corte de datos | Mayo 2026 (post-entrenamiento) |
| Fechas del modelo | Diciembre 2025 - Mayo 2026 |

## Arquitectura y entrenamiento

El modelo base es Gemma-4-E4B, una arquitectura transformer de NVIDIA derivada de Gemma-4-E4B-it mediante post-entrenamiento. Los 8B parámetros totales con 4B efectivos sugieren un esquema de activación selectiva (mezcla de expertos o similar) que reduce el coste de cómputo por token. NVIDIA declara que el post-entrenamiento se realizó sobre los datasets `nvidia/nemotron-post-training-v3` y `nvidia/nemotron-pre-training-datasets`, con fecha de corte de mayo de 2026.

El post-entrenamiento se centró en mejorar el uso de herramientas multi-turno, el seguimiento de instrucciones y el anclaje de entrada (input grounding) respecto al modelo Gemma original, preservando sus capacidades conversacionales. La model card no detalla el número exacto de tokens de entrenamiento ni la composición completa del dataset, ni especifica si se emplearon RLHF o DPO; esa información no está disponible en la documentación proporcionada. Como innovaciones técnicas destacables, el modelo soporta decodificación especulativa mediante un drafter DFlash complementario (`NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash`) y expone un presupuesto de razonamiento configurable en runtime, lo que permite ajustar el equilibrio entre latencia y profundidad de razonamiento.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 64K tokens.
- Razonamiento configurable: modo de pensamiento activable por plantilla de chat (`enable_thinking`) con presupuesto de pensamiento ajustable en runtime.
- Modo conversacional dedicado (`conversational_mode`) para interacción de asistente.
- Uso de herramientas (tool calling / function calling) multi-turno, mejorado respecto a Gemma-4-E4B-it según NVIDIA.
- Seguimiento de instrucciones y anclaje de entrada (input grounding) reforzados en el post-entrenamiento.
- Soporte multilingüe en 34 idiomas, incluyendo español, inglés, alemán, francés, portugués, árabe, chino, japonés, coreano, hindi y la mayoría de lenguas europeas.
- Capacidad de decodificación especulativa con drafter DFlash para reducir latencia.
- Orientado a asistentes locales de voz y dispositivo, personas interactivas e interfaces embebidas.
- No se declaran capacidades de visión ni audio en la información disponible.

## Casos de uso

- Asistentes de voz locales: el modelo puede gestionar conversaciones multi-turno con 64K tokens de contexto y un TTFT bajo gracias a sus 4B parámetros efectivos, adecuado para dispositivos con recursos limitados.
- Personas interactivas embebidas: el modo conversacional (`conversational_mode=True`) y el control de plantilla de chat permiten mantener un personaje coherente en interacciones prolongadas dentro de aplicaciones de escritorio o móviles.
- Interfaces de dispositivo con memoria restringida: la cuantización Q4_K_M en 4 GB permite desplegar el modelo en equipos con GPU de consumo, dejando margen para otras aplicaciones o pipelines adyacentes.
- Agentes con uso de herramientas multi-turno: el post-entrenamiento en tool calling permite integrar el modelo en flujos de agente que invocan APIs o funciones de forma encadenada, con contexto largo para mantener el estado de la conversación.
- Asistencia en atención al cliente: con 64K tokens de contexto puede gestionar hilos de conversación extensos y documentación de referencia, manteniendo coherencia en respuestas multi-turno.
- Generación de código asistida en local: aunque no se declaran benchmarks específicos de código, el modelo puede integrarse en editores o pipelines de CI/CD mediante llama.cpp server con API compatible con OpenAI (`/v1/chat/completions`), usando el modo de razonamiento para tareas de depuración.
- Procesamiento multilingüe en el borde: el soporte de 34 idiomas permite desplegar asistentes multilingües en dispositivos sin depender de servicios en la nube.
- Decodificación especulativa en producción: el drafter DFlash permite acelerar la generación en servidores llama.cpp con `--spec-draft-model` y `--spec-type draft-dflash`, útil en despliegues con requisitos de latencia estrictos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4 GB para los pesos Q4_K_M, más overhead de contexto KV; con 64K de contexto el consumo adicional puede ser significativo y depende de la implementación.
- GPU recomendadas: el modelo está pensado para GPU de consumo; la model card muestra despliegue con `ghcr.io/ggml-org/llama.cpp:server-cuda13-b11459` y `-ngl 999` (todas las capas en GPU). No se especifican modelos concretos de GPU en la información disponible.
- Cabe en GPU de consumo: sí, al ser una cuantización Q4_K_M de 4 GB; el repo completo ocupa 6.2 GB.
- Opciones de despliegue: llama.cpp (receta pendiente según la model card), con soporte de servidor compatible con la API de OpenAI. No se declaran recetas para vLLM, TGI, Ollama u otros en la información disponible.
- Decodificación especulativa: requiere el drafter `NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash` y los flags `--spec-draft-model`, `--spec-type draft-dflash`, `--spec-draft-n-max 7`, `--spec-draft-ngl 999`.
- Latencia y throughput: no disponibles en la información proporcionada; la model card enfatiza el bajo TTFT como objetivo de diseño pero no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Bolt-E4B-4GB (esta ficha) | 8B totales / 4B efectivos | 64K entrada / 64K salida | OpenMDW-1.1 | GGUF Q4_K_M | Cuantización de comunidad del modelo NVIDIA; uso comercial permitido |
| NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 | 8B totales / 4B efectivos | 64K entrada / 64K salida | OpenMDW-1.1 | safetensors BF16 | Versión completa del mismo modelo; mayor precisión, mayor huella de memoria |
| Gemma-4-E4B-it (modelo base original) | no disponible en la información | no disponible en la información | no disponible en la información | no disponible en la información | Modelo de Google del que deriva el post-entrenamiento de NVIDIA |

No se dispone de datos de benchmarks comparativos en la información proporcionada, por lo que no es posible comparar rendimiento numérico entre estos modelos.

## Limitaciones y advertencias

- Sesgos: no se documentan sesgos específicos en la información proporcionada; al derivar de Gemma-4-E4B-it, puede heredar sesgos del modelo base y de los datasets de pre-entrenamiento y post-entrenamiento de NVIDIA.
- Riesgo de alucinación: no se cuantifica en la model card; como todo modelo generativo, puede producir contenido factualmente incorrecto, especialmente en modo de razonamiento sin verificación.
- Limitaciones de contexto: aunque se declaran 64K tokens de entrada y salida, el rendimiento real con contextos muy largos no está documentado y el consumo de KV cache puede degradar la latencia en hardware limitado.
- Limitaciones de idioma: se declaran 34 idiomas, pero no se especifica la calidad relativa por idioma; el post-entrenamiento podría estar sesgado hacia el inglés.
- Restricciones de licencia: OpenMDW-1.1 permite uso comercial y no comercial según la model card, pero es una licencia "other" que conviene revisar en detalle antes de producción; el enlace de licencia en la model card aparece truncado en la información disponible.
- Receta de despliegue: la model card indica "llama.cpp (recipe pending)", por lo que la integración con llama.cpp puede requerir ajustes.
- Formato: esta versión es GGUF Q4_K_M; para mayor precisión es necesario usar el repo BF16 en safetensors.
- Fecha de corte: los datos de post-entrenamiento tienen corte en mayo de 2026; el modelo no conoce eventos posteriores.
- Autor de la cuantización: el repo pertenece al usuario mwdw, no a NVIDIA; la reproducibilidad de la cuantización depende de dicho autor.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/mwdw/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Drafter DFlash para decodificación especulativa: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash
- Modelo Gemma-4-E4B-it (origen del post-entrenamiento): https://huggingface.co/google/gemma-4-E4B-it
- Página de desarrollador de Nemotron: https://developer.nvidia.com/nemotron
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
- Technical report (PDF): https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-Technical-Report.pdf
- Blog del modelo: https://research.nvidia.com/labs/nemotron/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB/
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Texto de la licencia OpenMDW-1.1 en GitHub: https://github.com/OpenMDW/OpenMDW/blob/main/1.1/LICENSE.OpenMDW-1.1
- Paper referenciado (arXiv 2509.04292): https://arxiv.org/abs/2509.04292
- Dataset de post-entrenamiento: https://huggingface.co/datasets/nvidia/nemotron-post-training-v3
- Datasets de pre-entrenamiento: https://huggingface.co/datasets/nvidia/nemotron-pre-training-datasets
