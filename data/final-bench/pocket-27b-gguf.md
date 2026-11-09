# FINAL-Bench/POCKET-27B-GGUF

## Resumen

POCKET-27B-GGUF es un empaquetado de distribución del modelo Qwen3.8-27B en formato GGUF, concretamente la cuantización Q6_K producida por Archsloth. Lo publica el usuario FINAL-Bench dentro de su familia "VIDRAFT POCKET", que agrupa varios modelos cuantizados para ejecución local (POCKET-35B, POCKET-26B, POCKET-Darwin-180B). El modelo base es un transformer denso de tipo vision-language de 27.320.697.856 parámetros, con capacidades de texto e imagen (pipeline `image-text-to-text`).

El propósito del repositorio es facilitar el despliegue local del modelo mediante llama.cpp: el peso del modelo ocupa 22,43 GB en un único fichero GGUF y la torre de visión se distribuye por separado como proyector F32 de 1,84 GB. No se aplica ningún entrenamiento, poda ni cuantización adicional por parte de este repackaging; los pesos se redistribuyen sin cambios desde la fuente fijada de Archsloth. La licencia declarada es Apache-2.0.

Su relevancia radica en que permite ejecutar un modelo multimodal de 27B en hardware local con llama.cpp, incluyendo entrada de imágenes mediante el proyector opcional. No obstante, el tamaño del fichero (22,43 GB solo para texto) exige memoria de trabajo considerable y el autor no proporciona mediciones de ajuste a dispositivos concretos para esta release.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso vision-language (familia Qwen3.8) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q6_K (modelo); proyector de visión F32 |
| Idiomas soportados | Coreano (ko), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen3.8, con 27.320.697.856 parámetros totales, orientado a tareas de imagen-texto-a-texto. La arquitectura combina un modelo de lenguaje con una torre de visión que se distribuye como proyector separado (`mmproj-F32.gguf`, 1.842.940.064 bytes), en precisión F32. El repositorio no documenta detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esa información correspondería a la model card del checkpoint original Qwen/Qwen3.8-27B, que no se incluye en la información disponible.

En cuanto a innovaciones técnicas, el autor no describe ninguna específica para esta release. El repackaging no aplica entrenamiento, poda, cuantización, búsqueda de redondeo, ARMORING ni RSI; únicamente redistribuye los pesos Q6_K y el proyector F32 sin cambios desde la revisión fijada `87b01a847b03c2c4e979453371a8fc6c2d65fe7b` de Archsloth. El autor menciona explícitamente que este paquete no aplica el entrenamiento Darwin RSI ni ARMORING de otros miembros de la familia.

## Capacidades

- Generación de texto conversacional multi-turno, según el tag `conversational`.
- Comprensión de imágenes (vision-language): acepta entrada de imagen junto con texto cuando se carga el proyector `mmproj-F32.gguf` y el runtime multimodal lo soporta.
- Ejecución local y on-device mediante llama.cpp, con soporte de offload de capas a GPU.
- Compatibilidad con endpoints (`endpoints_compatible` según los tags del repositorio).
- Capacidades multilingües limitadas a coreano e inglés según los metadatos declarados.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, modo thinking, audio ni matemáticas avanzadas.

## Casos de uso

- Asistente conversacional local: el modelo puede mantener diálogos multi-turno en inglés o coreano ejecutándose íntegramente en local con llama.cpp, sin depender de APIs externas, lo que resulta adecuado para entornos con requisitos de privacidad.
- Análisis de imágenes en local: cargando conjuntamente el modelo Q6_K y el proyector F32, se puede enviar una imagen junto a una pregunta de texto para obtener una descripción o respuesta, útil en flujos de inspección visual sin conexión.
- Prototipado de aplicaciones multimodales: el par de ficheros (modelo + proyector) permite levantar un servidor local con `llama-server` y validar pipelines de imagen-texto antes de invertir en infraestructura mayor.
- Despliegue en estaciones de trabajo con GPU: con `-ngl 99` se puede descargar el modelo a la GPU, adecuado para equipos con suficiente VRAM para un fichero de 22,43 GB más caché KV y memoria de runtime.
- Evaluación comparativa de cuantizaciones: al ser una distribución Q6_K sin modificaciones, sirve como referencia de calidad frente a cuantizaciones menores del mismo modelo base.
- Procesamiento de documentos con componente visual: para tareas que combinen texto e imágenes en un mismo flujo, el modelo puede recibir ambos tipos de entrada en un servidor local compatible con el runtime multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no hay nuevas mediciones de CPU ni de ajuste a dispositivo para esta release, y que los resultados de la familia (incluido el de Darwin-180B en SuperCLUE) no corresponden a POCKET-27B. Tampoco se proporcionan cifras de latencia o throughput.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero del modelo ocupa 22.430.999.840 bytes (unos 22,43 GB o 20,89 GiB); el proyector de visión añade 1.842.940.064 bytes (unos 1,84 GB o 1,72 GiB). El total con visión es de 24.273.939.904 bytes (unos 24,27 GB) antes de memoria de runtime, contexto y caché KV.
- El autor advierte que el tamaño del fichero no establece por sí mismo el ajuste a una GPU, portátil o presupuesto de memoria de proceso concretos.
- GPU recomendadas: no disponible; el autor no proporciona umbral de ajuste ni modelos de GPU validados para esta release.
- Ajuste en GPU de consumo: no disponible. Un fichero de 22,43 GB supera la VRAM de la mayoría de GPU de consumo actuales, pero el autor no confirma ni descarta ningún dispositivo concreto.
- Opciones de despliegue: llama.cpp (`llama-cli` para texto, `llama-server` para servidor local con visión mediante `--mmproj`). Se requiere una build de llama.cpp que soporte este GGUF de la familia Qwen3.8 y su proyector correspondiente.
- Latencia y throughput: no disponible; los comandos de ejemplo (8 hilos de CPU, contexto 2048 o 4096, 256 tokens) son ilustrativos y no mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| POCKET-27B-GGUF | 27,32 B | No disponible | Q6_K + proyector F32 | Apache-2.0 | GGUF en Hugging Face |
| POCKET-35B-GGUF | No disponible | No disponible | No disponible | No disponible | GGUF en Hugging Face (misma familia) |
| POCKET-26B-GGUF | No disponible | No disponible | No disponible | No disponible | GGUF en Hugging Face (misma familia) |
| POCKET-Darwin-180B-GGUF | No disponible | No disponible | No disponible | No disponible | GGUF en Hugging Face (misma familia) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. Las alternativas de la misma categoría (modelos densos vision-language de ~27B en GGUF) no están documentadas en la información disponible.

## Limitaciones y advertencias

- Idiomas: solo se declaran coreano e inglés; no hay soporte documentado de castellano ni de otros idiomas.
- Tamaño: el fichero Q6_K de 22,43 GB exige memoria de trabajo muy superior a la de un portátil convencional; el autor no garantiza el ajuste en ningún dispositivo concreto.
- Sin benchmarks propios: no hay mediciones de calidad, latencia ni throughput para esta release; los comandos de ejemplo no son recibos de ejecución exitosa.
- Visión condicionada al runtime: la entrada de imágenes requiere una build de llama.cpp compatible con el proyector y memoria adicional; no funciona como modelo de texto autónomo.
- Sin cuantizaciones menores: el repositorio solo ofrece Q6_K; no hay build Q4 o Q2 de POCKET, y el autor menciona que el candidato Q4 del publicador original falló en calidad para inglés, por lo que no se ofrece como descarga.
- Riesgo de alucinación: no cuantificado en la información disponible, pero aplicable a cualquier modelo generativo de este tipo.
- Sesgos: no documentados en la información disponible.
- Licencia: Apache-2.0 permite uso comercial, pero se exige mantener la atribución al checkpoint original y a la fuente Archsloth.
- Repackaging sin cambios: cualquier limitación del modelo base Qwen/Qwen3.8-27B se hereda íntegramente, ya que no se aplica ningún ajuste correctivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FINAL-Bench/POCKET-27B-GGUF
- Ficheros del repositorio: https://huggingface.co/FINAL-Bench/POCKET-27B-GGUF/tree/main
- Checkpoint original: https://huggingface.co/Qwen/Qwen3.8-27B
- Fuente de distribución inmediata (Archsloth): https://huggingface.co/Archsloth/Qwen3.8-27B-GGUF/tree/87b01a847b03c2c4e979453371a8fc6c2d65fe7b
- POCKET-35B: https://huggingface.co/FINAL-Bench/POCKET-35B-GGUF
- POCKET-26B: https://huggingface.co/FINAL-Bench/POCKET-26B-GGUF
- POCKET-Darwin-180B: https://huggingface.co/FINAL-Bench/POCKET-Darwin-180B-GGUF
- Guía de instalación de Hugging Face CLI: https://huggingface.co/docs/huggingface_hub/guides/cli
- Instrucciones de compilación de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md
