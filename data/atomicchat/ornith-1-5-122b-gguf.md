# AtomicChat/Ornith-1.5-122B-GGUF

## Resumen

Ornith-1.5-122B es un modelo multimodal de tipo image-text-to-text desarrollado por ornith-ai, publicado originalmente en safetensors con 124.635.206.144 parámetros (unos 124,6 mil millones). Esta ficha cubre la versión cuantizada en GGUF que mantiene AtomicChat, pensada para ejecución local con llama.cpp y con la aplicación Atomic Chat. El repositorio base no está incluido en la información disponible, por lo que los detalles de arquitectura y de entrenamiento se abordan más abajo con las cautelas correspondientes.

El trabajo de AtomicChat no es un simple reempaquetado: emplea sus propias matrices de importancia (imatrix) sobre un corpus de calibración público y publica métricas medidas de fidelidad de cuantización (divergencia KL y top-1 frente a los pesos originales) para cada uno de los 12 archivos disponibles, además de los registros en bruto. El modelo conserva la torre de visión mediante un proyector separado (`mmproj`) y mantiene la cabeza de predicción multi-token (MTP) para decodificación especulativa dentro de los propios archivos.

Su relevancia práctica es que permite llevar un modelo de ~125B con capacidad de lectura de imágenes y modo de razonamiento a hardware de 48-192 GiB de memoria mediante cuantizaciones de 35 a 132,6 GB, con licencia MIT, lo que elimina las restricciones de uso comercial habituales en modelos de este tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible de forma explícita. La model card cita el identificador `qwen35moe` de llama.cpp para el soporte de la cabeza MTP, lo que apunta a una familia transformer con mezcla de expertos (MoE); sin confirmación oficial en la información disponible |
| Parámetros totales | 124.635.206.144 (~124,6B) según safetensors del modelo base |
| Parámetros activos | No disponible (existe una variante 35B-A3B de la misma familia, pero no se publica el dato para el 122B) |
| Longitud de contexto | No disponible como cifra oficial. Las tablas de la model card manejan ventanas de hasta ~344k tokens con 96 GiB de memoria, por lo que el contexto nativo es igual o superior a esa cifra |
| Tipos de cuantización | Q8_0, AD-Q6_K, AD-Q6_K-Q5_K, AD-Q5_K-Q4_K, AD-Q5_K-IQ4_XS, AD-Q4_K-IQ4_XS, AD-IQ4_XS-IQ3_S, AD-IQ3_S-IQ3_XXS, AD-IQ3_XXS-IQ2_S, AD-IQ2_S-IQ2_XS, AD-IQ2_XS-IQ2_XXS, AD-IQ2_XXS-IQ1_M; proyector de visión en F16 y BF16 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (archivos multi-parte, p. ej. `-00001-of-00002.gguf`) con plantilla de chat embebida; el modelo base se distribuye en safetensors |
| Pipeline | image-text-to-text (multimodal, entrada de imagen y texto) |
| Caché de atención | 24 KB por token (0,2 GB a 8k de contexto; 0,8 GB a 32k) |
| Cabeza MTP | Incluida en todos los archivos, sin descarga adicional; almacenada en q8_0 en los archivos grandes, q5_k en los intermedios y q4_k en los pequeños |
| Repositorio | 838,9 GB; 4.762 descargas y 13 likes en el momento de la consulta |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna ni el proceso de entrenamiento del modelo base. Lo que sí se documenta es que se trata de un modelo multimodal que lee imágenes además de texto, con el proyector de visión distribuido aparte del cuantizado (`mmproj-Ornith-1.5-122B-F16.gguf` o `mmproj-Ornith-1.5-122B-BF16.gguf`) y compatible con `llama-mtmd-cli`. La referencia al identificador `qwen35moe` en las notas de compatibilidad de llama.cpp sugiere una implementación de mezcla de expertos, si bien este extremo no se confirma en la documentación consultada. Tampoco hay datos sobre número de tokens de entrenamiento, composición del dataset ni sobre si se aplicaron fases de RLHF o DPO.

La innovación técnica destacable en esta distribución es doble. Por un lado, la cabeza de predicción multi-token (MTP) viaja dentro de cada archivo y se activa con `--spec-type draft-mtp` para decodificación especulativa; en la variante 35B-A3B de la misma familia, con la misma cabeza, las pruebas de AtomicChat registraron un aumento de velocidad de generación del 18 al 35 %, con una tasa de aceptación de tokens redactados del 59 al 62 % (sin medir todavía en el 122B). Por otro, el esquema de cuantización "Atomic Dynamic" (`AD-`), que asigna tipos distintos a los dos grupos de tensores de mayor tamaño (`ffn_down` y `ffn_up`), colapsando el nombre cuando ambos coinciden. Las métricas de fidelidad se midieron, no se estimaron, y los registros en bruto son públicos.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat embebida en cada archivo GGUF y aplicada automáticamente por llama.cpp.
- Comprensión de imágenes (image-text-to-text) mediante el proyector de visión separado, invocable con `llama-mtmd-cli`.
- Modo de razonamiento ("thinking") activado por defecto, desactivable por petición con `chat_template_kwargs: {"enable_thinking": false}`.
- Decodificación especulativa mediante cabeza MTP integrada, sin descarga adicional.
- Muestreo recomendado por los autores: temperatura 0,6, top-k 20, top-p 0,95.
- Conversación con contexto largo: la caché de atención de 24 KB por token permite ventanas de cientos de miles de tokens en configuraciones de 96 GiB o más.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el modo thinking es el único indicio disponible.
- Capacidades multilingües: no disponible.
- Capacidades de audio: no disponibles.

## Casos de uso

- Procesamiento local de documentos con imágenes: digitalización y explotación de facturas, informes escaneados o capturas de pantalla, combinando el proyector de visión con ventanas de contexto largas para procesar lotes completos en una sola pasada sin salir del hardware propio.
- Asistencia técnica sobre manuales y diagramas: consultas multi-turno donde el usuario adjunta esquemas o fotografías de equipos y el modelo razona sobre ellos con el modo thinking activado, manteniendo el histórico de la conversación en contexto.
- Análisis de imágenes médicas o industriales en entorno controlado: al distribuirse con licencia MIT y ejecutarse íntegramente en local, encaja en flujos donde los datos no pueden enviarse a una API externa; requiere validación específica del dominio por parte del equipo responsable.
- Generación de código con contexto de repositorio: la ventana extensa permite incluir varios archivos y trazas de error en la misma petición; el modo thinking sin activación explícita resulta útil para tareas de refactorización que requieren planificación previa.
- Chat de atención al cliente autoalojado: despliegue con `llama-server` exponiendo una API compatible con `/v1/chat/completions`, con control del modo thinking por petición para alternar respuestas rápidas y respuestas razonadas según la consulta.
- Evaluación de fidelidad de cuantización en investigación: los archivos con métricas KL y top-1 publicadas, junto con el corpus de calibración y los registros en bruto, sirven como banco de pruebas reproducible para estudiar el impacto de esquemas dinámicos de cuantización en modelos de ~125B.
- Inferencia por lotes con decodificación especulativa: activando `--spec-type draft-mtp` en `llama-server` para cargas de generación largas donde el ahorro de latencia por token redactado y aceptado compensa el coste de memoria de la cabeza MTP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Lo único que se publica son métricas de fidelidad de cuantización frente a los pesos originales, medidas por AtomicChat:

| Archivo | Tamaño (GB) | Divergencia KL | top-1 |
|---|---:|---:|---:|
| `Q8_0` | 132,6 | 0,00962 | 96,28 % |
| `AD-Q6_K` | 104,5 | 0,01086 | 96,02 % |
| `AD-Q6_K-Q5_K` | 93,3 | 0,01326 | 95,53 % |
| `AD-Q5_K-Q4_K` | 78,5 | 0,02222 | 94,19 % |
| `AD-Q5_K-IQ4_XS` | 76,0 | 0,02323 | 94,05 % |
| `AD-Q4_K-IQ4_XS` | 71,2 | 0,02739 | 93,52 % |
| `AD-IQ4_XS-IQ3_S` | 62,2 | 0,05311 | 90,96 % |
| `AD-IQ3_S-IQ3_XXS` | 54,3 | 0,08212 | 88,84 % |
| `AD-IQ3_XXS-IQ2_S` | 47,6 | 0,13030 | 86,05 % |
| `AD-IQ2_S-IQ2_XS` | 42,8 | 0,18881 | 83,33 % |
| `AD-IQ2_XS-IQ2_XXS` | 39,2 | 0,23616 | 81,23 % |
| `AD-IQ2_XXS-IQ1_M` | 35,0 | 0,35296 | 77,18 % |

El archivo `AD-IQ2_XXS-IQ1_M` se describe explícitamente como archivo de investigación: es el más pequeño que arranca, pero solo coincide con la siguiente palabra del original el 77,18 % de las veces. La recomendación del autor es usar `AD-IQ2_XS-IQ2_XXS` o superior si la memoria lo permite. Como referencia de velocidad, el aumento del 18-35 % con MTP corresponde a las pruebas sobre Ornith 1.5 35B-A3B, no al 122B.

## Requisitos de hardware

- VRAM/memoria unificada estimada para el modelo: desde 35 GB (`AD-IQ2_XXS-IQ1_M`) hasta 132,6 GB (`Q8_0`) en disco para los pesos; hay que sumar la caché de atención (24 KB por token: 0,2 GB a 8k de contexto, 0,8 GB a 32k) y el proyector de visión.
- Correspondencia memoria-archivo indicada por el autor: 48 GiB → `AD-IQ3_XXS-IQ2_S` (~112k de contexto); 64 GiB → `AD-IQ4_XS-IQ3_S` (~216k); 80 GiB → `AD-Q5_K-Q4_K` (~248k); 96 GiB → `AD-Q6_K-Q5_K` (~344k); 128 GiB → `Q8_0` (~144k); 192 GiB o más → `Q8_0` con contexto completo.
- GPU de consumo: sí cabe en tarjetas de 48 GiB y superiores (A6000, RTX 6000 Ada, L40S), y en configuraciones de 64-80 GiB. No cabe en RTX 4090 (24 GB), RTX 3090 (24 GB) ni en GPUs de 16 GB, ni siquiera con la cuantización más agresiva.
- Apple Silicon: en un Mac de 128 GB el techo práctico es `AD-Q6_K` (97 GiB), previo ajuste con `sudo sysctl iogpu.wired_limit_mb=118000` (se reinicia al arrancar). En un Mac de 64 GB, `AD-IQ3_XXS-IQ2_S`.
- Despliegue: llama.cpp mediante `llama-server` (por ejemplo `-m ... -ngl 99 -c 8192`) y `llama-mtmd-cli` para entrada multimodal; aplicación Atomic Chat; API compatible con endpoints OpenAI. Soporte de vLLM, TGI u Ollama no confirmado en la información disponible.
- Se requiere una build reciente de llama.cpp con soporte de MTP para `qwen35moe`; las builds sin ese soporte pueden rechazar la carga de archivos que incluyen la cabeza.
- Latencia y throughput para el 122B: no disponibles. El único dato de aceleración es el 18-35 % con MTP medido en el 35B-A3B.
- Recomendación del autor al elegir entre archivos contiguos: tomar el mayor, ya que el salto cuesta uno o dos gigabytes y reduce de forma notable la tasa de palabras erróneas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-122B (original, ornith-ai) | 124,6B | No disponible | safetensors | MIT | Pesos de referencia; máxima fidelidad, sin cuantizar |
| Ornith-1.5-122B GGUF (esta ficha, AtomicChat) | 124,6B | No disponible (≥344k en configuraciones de 96 GiB) | GGUF, 12 cuantizaciones | MIT | Métricas KL/top-1 publicadas, imatrix propia, MTP incluida, `mmproj` separado |
| Ornith-1.5-35B-A3B | No disponible (nombre con 35B totales y 3B activos) | No disponible | No disponible | No disponible | Misma familia y misma cabeza MTP; +18-35 % de velocidad con MTP y 59-62 % de aceptación |

No se dispone de datos de benchmarks ni de especificaciones verificadas de modelos de otros fabricantes en la información proporcionada, por lo que no se incluye una comparación cruzada con alternativas de terceros: no disponible.

## Limitaciones y advertencias

- No hay información publicada sobre sesgos del modelo base; al ser un modelo multimodal, hereda los sesgos de su dataset de entrenamiento, que no se documenta.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de veracidad ni de benchmarks de calidad en la información disponible.
- Idiomas soportados no documentados; no se puede asumir un rendimiento homogéneo fuera del inglés sin evaluación previa.
- La cuantización más agresiva (`AD-IQ2_XXS-IQ1_M`) solo coincide con el token original el 77,18 % de las veces; no es apta para producción. Incluso `AD-IQ2_S-IQ2_XS` baja al 83,33 % de top-1.
- El modo thinking está activado por defecto, lo que incrementa la latencia y el consumo de tokens; hay que desactivarlo explícitamente por petición cuando no sea necesario.
- La aceleración por MTP no está medida en el 122B, solo en el 35B-A3B; no debe extrapolarse sin verificación.
- Requiere builds recientes de llama.cpp con soporte de MTP para `qwen35moe`; versiones antiguas pueden fallar al cargar los archivos.
- El proyector de visión es un archivo aparte que debe descargarse junto al cuantizado; sin él no hay capacidades de imagen.
- En macOS el límite de memoria cableada de la GPU debe ajustarse manualmente para aprovechar configuraciones superiores a ~97 GiB.
- Licencia MIT: permite uso comercial, modificación y redistribución sin restricciones específicas más allá de conservar el aviso de copyright y la exención de responsabilidad; conviene verificar la licencia del modelo base y de los pesos originales de ornith-ai antes de un despliegue en producción.
- Tamaño del repositorio (838,9 GB): la descarga completa es inviable en la mayoría de entornos; conviene bajar solo el archivo elegido y el `mmproj` correspondiente.

## Enlaces

- HuggingFace (esta cuantización): https://huggingface.co/AtomicChat/Ornith-1.5-122B-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Corpus de calibración: https://huggingface.co/datasets/AtomicChat/calib-corpora
- Registros de métricas de cuantización: https://huggingface.co/datasets/AtomicChat/Ornith-1.5-122B-GGUF-metrics
- Aplicación Atomic Chat: https://atomic.chat/?utm_source=huggingface&utm_medium=referral&utm_campaign=hf_ornith_1_5_122b&utm_content=btn_atomic
- Repositorio GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de AtomicChat: https://discord.gg/8wGSsvmg4V
