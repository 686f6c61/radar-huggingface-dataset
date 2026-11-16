# FlagRelease/MiniCPM-o-4.5-zhenwu-FlagOS

## Resumen

MiniCPM-o-4.5-zhenwu-FlagOS es una adaptación del modelo multimodal MiniCPM-o 4.5 de OpenBMB para el chip zhenwu, distribuida por la plataforma FlagRelease de BAAI. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión de pesos y un empaquetado de despliegue que permite ejecutar el modelo original sobre hardware no NVIDIA mediante la pila de software FlagOS, que agrupa FlagScale, FlagGems, FlagCX, FlagTree y vllm-plugin-fl.

El modelo base MiniCPM-o pertenece a la familia MiniCPM de OpenBMB y está orientado a tareas multimodales (visión-lenguaje, OCR, comprensión de documentos e imágenes). Los pesos publicados en este repositorio suman 9.371.787.666 parámetros según los safetensors, con un tamaño de repositorio de 22,7 GB, lo que sugiere pesos en precisión de 16 bits.

La relevancia de esta ficha radica en que documenta una ruta de despliegue alternativa a CUDA para un modelo multimodal de casi 9.400 millones de parámetros, con validación de precisión frente al stack nativo de NVIDIA en benchmarks multimodales como MMMU, CMMMU, OCRBench o MM-Vet v2. Es útil para equipos que necesitan portar inferencia de MiniCPM-o a aceleradores zhenwu manteniendo la API de vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base MiniCPM-o; pesos con custom_code y `minicpmo`) |
| Parametros totales | 9.371.787.666 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo con safetensors y onnx; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (según la model card, heredada de OpenBMB/MiniCPM-o) |
| Formato de pesos | safetensors y onnx |

## Arquitectura y entrenamiento

La model card de este repositorio no describe la arquitectura interna del modelo base; se limita a documentar la pila FlagOS y el procedimiento de despliegue. Por los tags (`minicpmo`, `custom_code`) y el nombre, se corresponde con el modelo MiniCPM-o 4.5 de OpenBMB, pero esta ficha no dispone de detalles verificados sobre número de capas, tipo de atención, encoder visual ni composición del dataset de entrenamiento.

Lo que sí está documentado es el proceso de adaptación: los pesos se exportan y ejecutan sobre el backend zhenwu usando FlagGems (biblioteca de operadores en Triton), FlagTree (compilador unificado multi-chip), FlagCX (comunicación entre chips) y vllm-plugin-fl (plugin de vLLM para backends multi-chip). El entorno de referencia indicado es FlagGems 4.2.1rc0 y vLLM 0.13.0 con vllm_fl 0.0.0. No se documentan fases de RLHF, DPO ni datos de preentrenamiento en la información proporcionada.

## Capacidades

- Inferencia multimodal: los benchmarks reportados (MMMU, CMMMU, MMMU_Pro, OCRBench, MM-Vet v2, CII-Bench, Blink) confirman soporte de comprensión de imagen y texto, OCR y razonamiento sobre documentos visuales.
- Generación de texto y conversación multi-turno a través de la API compatible con OpenAI de vLLM (`/v1/chat/completions`).
- Soporte de decodificación y serving mediante vLLM con `--trust-remote-code`, lo que implica código personalizado en el repositorio para cargar el modelo.
- Capacidades de agente, tool calling, audio o thinking mode: no disponibles en la información proporcionada.
- Cobertura multilingüe: no disponible; la presencia de CMMMU (variante china de MMMU) sugiere competencia en chino e inglés, pero no se documenta oficialmente.

## Casos de uso

- Digitalización de documentos con OCR: el modelo se evalúa en OCRBench y CII-Bench, por lo que puede emplearse para extraer texto estructurado de facturas, formularios y escaneos en un pipeline con vLLM como servidor.
- Análisis de documentos técnicos y gráficos: el rendimiento en MMMU y MMMU_Pro lo hace adecuado para responder preguntas sobre diagramas, tablas e ilustraciones en herramientas internas de soporte.
- Despliegue sobre aceleradores zhenwu en entornos cloud: el contenedor FlagOS publicado (`harbor.baai.ac.cn/flagrelease-public/minicpm-0-4.5-zhenwu`) permite levantar el servicio en Alibaba Cloud PAI/EAS/DSW sin reescribir la capa de inferencia.
- Migración de cargas CUDA a hardware alternativo: equipos con clústeres no NVIDIA pueden reutilizar la API de vLLM y comparar precisión frente a la referencia NVIDIA con las diferencias reportadas (1-3,5 % en benchmarks multimodales).
- Asistentes conversacionales con entrada de imagen: al exponer un endpoint compatible con OpenAI, se integra en aplicaciones de chat que envían capturas o fotos junto al texto.
- Evaluación comparativa de stacks de hardware: FlagEval y los benchmarks reportados permiten usar este modelo como caso de validación de rendimiento y exactitud de chips zhenwu frente a CUDA.

## Benchmarks y rendimiento

La model card solo publica la diferencia de precisión (avg@1) entre ejecutar con `USE_FLAGGEMS=1` en zhenwu y lanzar vLLM directamente en NVIDIA. No se aportan valores absolutos del modelo.

| Metrica | Diferencia con NVIDIA-CUDA |
|---|---|
| CMMMU | 3,50 % |
| MMMU | 1,18 % |
| MMMU_Pro_standard | 0,22 % |
| MM-Vet v2 | 1,33 % |
| OCRBench | 1,00 % |
| CII-Bench | 0,13 % |
| Blink | 2,19 % |

No se han publicado resultados absolutos de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con 9.371.787.666 parámetros y pesos de 22,7 GB, en FP16 se requiere aproximadamente 19-23 GB solo para pesos, más overhead de KV cache y activaciones; en cuantización de 8 bits bajaría a unos 10-12 GB, y en 4 bits a unos 6-7 GB, aunque estas cifras son estimaciones y no están confirmadas por el autor.
- GPU recomendadas: el repositorio está orientado al chip zhenwu mediante FlagOS; para la ruta NVIDIA se asume compatibilidad con vLLM estándar, pero no se detallan modelos concretos (A100, H100, RTX 4090).
- GPU de consumo: no confirmado. Por tamaño, una GPU con 24 GB (RTX 3090/4090) podría alojar los pesos en FP16 muy justo, y con cuantización sería viable, pero no hay validación publicada.
- Despliegue: vLLM 0.13.0 con vllm-plugin-fl 0.0.0 y `--trust-remote-code`; contenedor Docker `harbor.baai.ac.cn/flagrelease-public/minicpm-0-4.5-zhenwu:202608071022`; descarga de pesos vía ModelScope.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificados de parámetros, contexto ni benchmarks absolutos del modelo base en la información proporcionada, por lo que la comparación cuantitativa no es posible. A modo orientativo de categoría (modelos multimodales de ~9-10B), se indican alternativas sin datos confirmados en esta ficha:

| Modelo | Parametros | Contexto | Licencia | Estado en esta ficha |
|---|---|---|---|---|
| MiniCPM-o-4.5-zhenwu-FlagOS | 9,37 B | no disponible | Apache 2.0 | datos parciales |
| MiniCPM-o 4.5 (OpenBMB, original) | no disponible | no disponible | Apache 2.0 | referencia del que deriva |
| Alternativas multimodales ~9-10B (p. ej. Qwen2.5-VL-7B, Llama 3.2 11B Vision) | no disponible | no disponible | no disponible | no verificado en esta búsqueda |

## Limitaciones y advertencias

- Es una adaptación de hardware, no un modelo nuevo: cualquier limitación del MiniCPM-o 4.5 original (sesgos, alucinaciones, cobertura idiomática) se hereda.
- La model card no documenta sesgos, tasas de alucinación ni evaluación de seguridad.
- La diferencia de precisión frente a NVIDIA llega al 3,50 % en CMMMU y 2,19 % en Blink, lo que puede ser relevante en tareas sensibles a exactitud.
- El repositorio tiene muy poca tracción (5 descargas, 0 likes) y no está claro el soporte a largo plazo.
- Requiere `--trust-remote-code`, lo que implica ejecutar código del repositorio; conviene auditar antes de usar en producción.
- La licencia Apache 2.0 se declara en la model card para los pesos, pero el campo de licencia del repositorio en Hugging Face figura como no disponible; verificar antes de uso comercial.
- El despliegue documentado depende de un contenedor alojado en Alibaba Cloud PAI y de contacto con el soporte de la plataforma; no hay instrucciones para otros proveedores.
- No se documentan límites de contexto, idiomas soportados ni cuantizaciones oficiales, lo que dificulta el dimensionamiento en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/FlagRelease/MiniCPM-o-4.5-zhenwu-FlagOS
- Modelo base (OpenBMB): https://github.com/OpenBMB/MiniCPM-o
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0.txt
- Triton (dependencia de FlagGems): https://github.com/openai/triton
- Megatron-LM (base de FlagScale): https://github.com/NVIDIA/Megatron-LM
- vLLM: https://github.com/vllm-project/vllm
- Contenedor FlagOS: `docker pull harbor.baai.ac.cn/flagrelease-public/minicpm-0-4.5-zhenwu:202608071022`
