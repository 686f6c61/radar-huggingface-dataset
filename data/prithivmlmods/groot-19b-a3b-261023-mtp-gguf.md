# prithivMLmods/Groot-19B-A3B-261023-MTP-GGUF

## Resumen

Groot-19B-A3B-261023 es un modelo de razonamiento multimodal nativo de tipo Mixture-of-Experts (MoE) con pesos abiertos bajo licencia Apache-2.0, desarrollado por GrootTeam y derivado de Qwen3.6-35B-A3B. Este repositorio, mantenido por prithivMLmods, contiene la cuantización GGUF con soporte Multi-Token Prediction (MTP), una extensión del formato que integra la decodificación especulativa directamente en los pesos del modelo, eliminando la necesidad de un modelo "draft" separado.

El modelo aborda el problema de ejecutar modelos con capacidades de razonamiento avanzadas, uso de herramientas y visión en hardware accesible: con unos 19B de parámetros totales (más una capa MTP de 0.4B) y solo ~3B activados por token, consigue superar a Qwen3.6-35B-A3B y Gemma-4-26B-A4B en 12 de 16 benchmarks publicados, consumiendo además menos tokens de salida. Su arquitectura híbrida combina 10 capas de atención completa con 30 capas de atención lineal, y ofrece una ventana de contexto nativa de 262.144 tokens (256K), extensible a aproximadamente 1M mediante YaRN.

Es relevante ahora porque representa la tendencia de modelos MoE compactos y eficientes optimizados para GPU de consumo: según la model card, puede ejecutar un contexto de 128K en una RTX 4060 Ti de 16 GB y el contexto completo de 256K en GPUs de 24 GB como la RTX 3090 o 4090.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal con capas híbridas (10 full-attention + 30 linear-attention), 128 expertos enrutados, capa MTP de 0.4B |
| Parametros totales | 18.985.723.008 (~19B) |
| Parametros activos | ~3B por token (A3B) |
| Longitud de contexto | 262.144 tokens (256K) nativos, extensible a ~1M con YaRN |
| Tipos de cuantizacion | BF16, Q3_K_L, Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K (GGUF); el modelo base también se publica en FP8 y NVFP4 |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base también en safetensors BF16, FP8 y NVFP4 |

## Arquitectura y entrenamiento

Groot-19B-A3B-261023 es un modelo MoE multimodal derivado de Qwen3.6-35B-A3B, con aproximadamente 19B de parámetros totales distribuidos en 40 capas híbridas: 10 de atención completa y 30 de atención lineal, con 128 expertos enrutados de los que se activan ~3B de parámetros por token. Esta combinación de atención lineal y completa reduce el coste computacional y de memoria del contexto largo, lo que explica que pueda manejar 256K tokens en GPUs de 24 GB. Incorpora además una capa Multi-Token Prediction (MTP) de 0.4B que actúa como cabezal de decodificación especulativa integrado: predice varios tokens futuros en una sola pasada hacia adelante, acelerando la inferencia local sin necesidad de un modelo draft externo.

Respecto al entrenamiento, la model card indica que el modelo fue post-entrenado con menos de 0,1 mil millones (0.1B) de tokens de código abierto. El modelo opera por defecto en "thinking mode" (modo de razonamiento), con modos configurables "non-thinking" y "preserved-thinking". No se ha publicado información detallada sobre el uso de RLHF o DPO en la información disponible.

## Capacidades

- Generación de texto y razonamiento complejo, con modo de razonamiento (thinking) activado por defecto y modos non-thinking y preserved-thinking configurables
- Comprensión de imagen y texto (pipeline image-text-to-text), con archivo de proyección multimodal mmproj en BF16 incluido en el repositorio
- Código agéntico (agentic coding) y razonamiento multi-paso
- Uso nativo de herramientas (native tool use / function calling)
- Contexto muy largo: 256K tokens nativos, extensible a ~1M con YaRN, adecuado para documentos extensos
- Decodificación especulativa mediante MTP integrado en los pesos GGUF, que acelera la inferencia local
- Eficiencia de generación: consume un 23,1% menos de tokens de salida que Qwen3.6-35B-A3B y un 65,6% menos que Gemma-4-26B-A4B según la model card

## Casos de uso

- Razonamiento sobre documentos largos: con 256K tokens de contexto nativos (extensibles a ~1M), puede analizar contratos, informes técnicos o bases de código completas sin fragmentación, siendo adecuado porque las capas de atención lineal reducen el coste de memoria del contexto extenso.
- Asistentes de código agénticos: soporta uso nativo de herramientas y razonamiento multi-paso, lo que permite integrarlo en pipelines de CI/CD o agentes que ejecutan comandos, editan archivos y verifican resultados de forma iterativa.
- Chat multimodal local: gracias al archivo mmproj incluido, puede responder preguntas sobre imágenes (capturas de pantalla, diagramas, documentos escaneados) ejecutándose íntegramente en local con llama.cpp, útil para entornos con requisitos de privacidad.
- Atención al cliente automatizada: el modo non-thinking configurable permite respuestas rápidas en conversaciones multi-turno, mientras que el contexto de 256K permite mantener historiales largos y knowledge bases en el prompt.
- Resolución de problemas matemáticos y lógicos: el modo thinking por defecto y los resultados de las pruebas (problemas de tuberías, edades, exámenes) muestran rendimiento en razonamiento aritmético y de word problems.
- Inferencia en hardware de consumo: con cuantización Q4_K_M (11,7 GB) cabe en GPUs de 16 GB, lo que lo hace adecuado para estaciones de trabajo locales de desarrolladores sin necesidad de infraestructura en la nube.
- Generación de texto a alta velocidad: la decodificación especulativa MTP integrada alcanza ~197 tokens/s en BF16 sobre una RTX PRO 6000, útil para aplicaciones interactivas donde la latencia importa.

## Benchmarks y rendimiento

Según la model card, el modelo supera a Qwen3.6-35B-A3B y Gemma-4-26B-A4B en 12 de 16 benchmarks, con medias de 41,44 frente a 38,08 y 30,05 respectivamente. No se han publicado los resultados individuales por benchmark en la información disponible, por lo que no es posible desglosar MMLU, HumanEval, GSM8K u otras métricas concretas sin inventar datos.

Se han publicado sí métricas de rendimiento de inferencia (BF16 con MTP, RTX PRO 6000 Blackwell, 96 GB VRAM, llama-cli con offload completo):

| Metrica | Resultado |
|---|---:|
| Velocidad media de prefill | 165,32 tokens/s |
| Velocidad media de decode | 197,13 tokens/s |
| Decode minimo / maximo | 188,10 / 205,44 tokens/s |
| Tokens generados totales (5 ejecuciones) | 7.757 |
| Uso pico de VRAM | 36.807 MiB (35,94 GiB) |
| Utilizacion maxima de GPU | 89% |

## Requisitos de hardware

- VRAM estimada para inferencia (pesos del modelo): Q3_K_M ~9,3 GB; Q4_K_S ~11 GB; Q4_K_M ~11,7 GB; Q5_K_M ~13,6 GB; Q6_K ~15,6 GB; BF16 ~38 GB. Añadir margen para KV-cache y el archivo mmproj (903 MB).
- Según la model card: contexto de 128K ejecutable en una RTX 4060 Ti de 16 GB; contexto completo de 256K en GPUs de 24 GB (RTX 3090/4090), RTX 5090 o sistemas con 128 GB de memoria unificada.
- Sí cabe en GPUs de consumo: RTX 4060 Ti (16 GB) con Q4_K_M y contexto 128K; RTX 3090/4090 (24 GB) para el contexto completo de 256K.
- La prueba publicada se realizó sobre una NVIDIA RTX PRO 6000 Blackwell (96 GB), con uso pico de ~36 GB en BF16 y decodificación de ~197 tokens/s; los tags sugieren optimización para arquitecturas Blackwell (SM120, GB202, B200, B300) con soporte NVFP4.
- Opciones de despliegue: llama.cpp / llama-cli (con `--spec-type draft-mtp` para decodificación especulativa), vLLM, SGLang, KTransformers y Hugging Face Transformers (para los pesos del modelo base).
- Latencia y throughput: ~165 tokens/s de prefill y ~197 tokens/s de decode en la configuración de prueba publicada; no hay datos para otras configuraciones.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| Groot-19B-A3B-261023 | ~19B (+0,4B MTP) | ~3B | 256K (hasta ~1M con YaRN) | Apache-2.0 | Media 41,44 en 16 benchmarks (según model card) |
| Qwen3.6-35B-A3B | 35B | ~3B | no disponible | no disponible | Media 38,08 en 16 benchmarks (según model card de Groot) |
| Gemma-4-26B-A4B | 26B | ~4B | no disponible | no disponible | Media 30,05 en 16 benchmarks (según model card de Groot) |

Nota: las cifras comparativas proceden de la model card del propio GrootTeam; no se han verificado de forma independiente en la información disponible.

## Limitaciones y advertencias

- Idioma: la model card declara únicamente inglés; no hay soporte declarado para castellano, por lo que el rendimiento en español no está garantizado.
- Sesgos conocidos: no disponibles; al derivarse de Qwen3.6-35B-A3B y entrenarse con menos de 0,1B de tokens open-source en el post-training, hereda potencialmente los sesgos del modelo base.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo de lenguaje, puede generar contenido incorrecto, especialmente en modo non-thinking.
- El modo thinking por defecto genera tokens de razonamiento adicionales, lo que incrementa la latencia y el consumo de tokens si no se configura el modo non-thinking para tareas simples.
- Las cuantizaciones Q3_K_M y Q3_K_L se describen en la propia model card como de calidad baja; para producción se recomiendan Q4_K_M o superiores.
- La decodificación especulativa MTP requiere soporte en el runtime (llama.cpp con `--spec-type draft-mtp`); no todos los backends la aprovechan.
- Licencia Apache-2.0: sin restricciones relevantes para uso comercial, aunque deben respetarse los avisos de la licencia.
- Las métricas de rendimiento publicadas corresponden a hardware Blackwell específico; los resultados en otras GPUs pueden diferir sustancialmente.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/prithivMLmods/Groot-19B-A3B-261023-MTP-GGUF
- Modelo base: https://huggingface.co/GrootTeam/Groot-19B-A3B-261023
- Archivo BF16: https://huggingface.co/prithivMLmods/Groot-19B-A3B-261023-MTP-GGUF/blob/main/Groot-19B-A3B-261023.BF16.gguf
- Archivo Q4_K_M (recomendado): https://huggingface.co/prithivMLmods/Groot-19B-A3B-261023-MTP-GGUF/blob/main/Groot-19B-A3B-261023.Q4_K_M.gguf
- Proyección multimodal (mmproj): https://huggingface.co/prithivMLmods/Groot-19B-A3B-261023-MTP-GGUF/blob/main/Groot-19B-A3B-261023.mmproj-bf16.gguf
- Paper, blog o demo: no disponibles en la información proporcionada.
