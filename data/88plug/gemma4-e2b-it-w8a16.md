# 88plug/Gemma4-E2B-it-W8A16

## Resumen

Gemma4-E2B-it-W8A16 es un checkpoint cuantizado publicado por 88plug AI Lab a partir de google/gemma-4-e2b-it, el modelo multimodal de Google basado en una arquitectura MoE dispersa con 128 expertos, atención híbrida (sliding + global) y un codificador visual SigLIP. El modelo base combina unos 5.104 millones de parámetros totales con aproximadamente 2.000 millones activos por token (designación E2B), lo que lo sitúa como la variante multimodal MoE más pequeña de la familia Gemma 4.

La aportación de este repositorio no es un modelo nuevo sino una cuantización post-entrenamiento INT8 en formato W8A16 (pesos en 8 bits, activaciones en 16 bits) empaquetada con compressed-tensors, el formato que vLLM detecta de forma nativa desde la versión 0.21. El resultado son unos 2,5 GB de pesos que, según la model card, caben en cualquier GPU de 8 GB, incluidas una RTX 3080 de 10 GB o una RTX 4070, manteniendo la torre de visión y las capas de embeddings por capa (PLE) en BF16.

Su relevancia práctica es doble: por un lado permite ejecutar un VLM con mezcla de expertos y 32.768 tokens de contexto en hardware de consumo; por otro, es el primer checkpoint W8A16 con compressed-tensors publicado para esta variante, lo que evita el paso de conversión a GGUF cuando el despliegue se hace sobre vLLM. La cuantización es RTN sin corpus de calibración y el autor la etiqueta como "provisional", con una recuantización AutoRound prevista.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE dispersa con 128 expertos, atención híbrida sliding + global, codificador visual SigLIP y Per-Layer Embeddings (PLE) |
| Parámetros totales | 5.104.297.539 (~5,1 B), según safetensors del repositorio |
| Parámetros activos | ~2.000 millones por token (designación E2B del modelo base; el reparto exacto por experto no se documenta) |
| Longitud de contexto | 32.768 tokens (valor configurado en los ejemplos de despliegue de la model card; el máximo arquitectural no se especifica) |
| Tipos de cuantización | INT8 W8A16 mediante RTN sin calibración (data-free), formato compressed-tensors (`pack-quantized` / `int-quantized`); el repo no incluye GGUF, aunque la model card documenta la ruta de conversión a Q8_0 e IQ4_XS |
| Idiomas soportados | Inglés (`en`) declarado; no se documentan otros idiomas |
| Licencia | Apache-2.0 (licencia del modelo base no indicada en la información disponible) |
| Formato de pesos | safetensors con compressed-tensors; tensores en BF16 para `vision_tower`, `multi_modal_projector`, `embed_tokens_per_layer` y `per_layer_model_projection` |
| Modelo base | google/gemma-4-e2b-it (relación: quantized) |
| Pipeline | image-text-to-text |
| Runtime preferido | vLLM ≥ 0.21.0 (autodetección de compressed-tensors, sin flag `--quantization`) |
| Tamaño declarado de pesos | ~2,5 GB |
| Tamaño del repositorio | 17,6 GB |
| Descargas / likes | 211 / 0 |
| Fecha de creación / actualización | 2026-05-24 / 2026-10-26 |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos dispersa: 128 expertos por capa y un enrutador que activa un subconjunto por token, de ahí que el total de parámetros (~5,1 B) triplique aproximadamente el coste computacional por token (~2 B activos). La atención combina ventanas deslizantes con capas de atención global, un patrón habitual para reducir el coste del contexto largo manteniendo el alcance efectivo. La parte multimodal la aporta un codificador SigLIP seguido de un proyector multimodal que inyecta las representaciones visuales en el flujo de tokens de texto. El modelo incluye además Per-Layer Embeddings (PLE), es decir, embeddings específicos por capa que se suman a la representación de entrada.

Sobre el entrenamiento del modelo base no hay información en los materiales proporcionados: no se detallan el número de tokens, la composición del corpus, ni si hubo fases de RLHF o DPO. La model card cita el "Gemma 4 Technical Report" de Google DeepMind (2025) como referencia, pero no reproduce sus cifras. Lo que sí está documentado es el proceso de cuantización: un PTQ INT8 W8A16 con redondeo RTN sin corpus de calibración, aplicado únicamente a las capas `language_model.*`; el codificador visual, el proyector multimodal y las PLE se mantienen en BF16 de forma deliberada para evitar pérdida catastrófica de calidad. El autor indica que AutoRound quedó bloqueado para esta release y que hay una recuantización "gold" programada.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat propia del modelo `-it` de Google.
- Comprensión de imágenes y texto combinados (pipeline `image-text-to-text`): descripción de imágenes, respuesta a preguntas visuales y razonamiento sobre capturas o documentos escaneados.
- Mezcla de expertos con 128 expertos, orientada a reducir cómputo por token manteniendo capacidad total.
- Ventana de contexto de hasta 32.768 tokens en las configuraciones documentadas, adecuada para conversaciones multi-turno y documentos extensos.
- Capacidad de ejecución en GPU de consumo de 8 GB gracias a la cuantización INT8 y a la caché KV en FP8 que sugiere la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes o razonamiento multi-paso: no disponible en la información proporcionada.
- Modo "thinking" o razonamiento extendido: no disponible en la información proporcionada.
- Capacidades de audio o vídeo: no disponibles; solo se documenta modalidad imagen + texto.
- Multilingüismo: limitado al inglés según el campo `language` del repositorio.

## Casos de uso

- **Atención al cliente con tickets visuales**: el modelo puede recibir una captura de pantalla o una foto del producto junto al texto del usuario y responder en el mismo hilo, aprovechando los 32.768 tokens de contexto para arrastrar el historial completo de la conversación sin truncar.
- **Extracción de datos de documentos en entorno on-premise**: procesamiento de facturas, formularios y albaranes escaneados en una única RTX 4070, sin enviar imágenes a servicios en la nube; encaja en sectores con requisitos de residencia de datos.
- **Triaje y clasificación de contenido multimodal**: moderación de publicaciones con imagen y pie de texto en un pipeline interno, donde el coste por token activo (~2 B) permite mantener throughput alto en un solo acelerador.
- **Asistencia a la accesibilidad**: generación de descripciones alternativas de imágenes para aplicaciones internas, ejecutando el modelo en local sobre hardware modesto y con licencia Apache-2.0 para integrarlo en herramientas corporativas.
- **RAG sobre documentación técnica con figuras**: recuperación de fragmentos de manuales que incluyen diagramas y tablas, enviando la página como imagen más el texto recuperado; la ventana de 32k permite incluir varias páginas y la pregunta en un mismo prompt.
- **Investigación sobre cuantización**: banco de pruebas para medir la degradación de un MoE multimodal al aplicar W8A16 RTN frente al BF16, usando la propia infraestructura de vLLM y las métricas objetivo que declara el autor (KL < 0,005, recuperación de MMLU ≥ 99,7 %).
- **Prototipado de pipelines VLM en una sola GPU**: validación de producto (demos, pruebas de concepto, evaluación de prompts) sin reservar instancias A100/H100, con migración posterior al checkpoint BF16 si se necesita la referencia sin cuantizar.
- **Servicio de inferencia compatible con la API de OpenAI**: al desplegarse con `vllm serve`, expone un endpoint compatible con el cliente de OpenAI, lo que simplifica sustituir un proveedor externo por este modelo en aplicaciones ya escritas contra esa interfaz.

## Benchmarks y rendimiento

La model card publica únicamente métricas de throughput agregado. No hay resultados de MMLU, HumanEval, GSM8K ni de benchmarks multimodales (MMMU, DocVQA) en la información disponible.

| Métrica | Resultado | Contexto |
|---|---|---|
| Throughput total (entrada 2048 / salida 512) | 6.499 tok/s (prompt + salida) | vLLM v0.21.0, lm-evaluation-harness, "benchmark ladder" de 88plug |
| Throughput total (entrada 512 / salida 256) | 6.252 tok/s (prompt + salida) | Ibídem |
| Throughput total (entrada 8192 / salida 512) | 10.189 tok/s (prompt + salida) | Ibídem |

Objetivos de calidad declarados (no mediciones publicadas):

| Métrica | Objetivo | Estado |
|---|---|---|
| Divergencia KL frente a BF16 | < 0,005 | No medida en la información disponible |
| Recuperación de MMLU | ≥ 99,7 % | No medida en la información disponible |

Advertencia: las cifras de throughput no especifican hardware, tamaño de lote ni número de peticiones concurrentes, por lo que no son comparables directamente con otras publicaciones. La propia model card se contradice al afirmar en la sección de limitaciones que los benchmarks "se añadirán tras la publicación", mientras la tabla superior ya incluye resultados.

## Requisitos de hardware

- **VRAM estimada**: ~2,5 GB de pesos según la model card; a ello hay que sumar la caché KV. Con `--kv-cache-dtype fp8`, `--max-model-len 32768` y `--gpu-memory-utilization 0.90` el autor lo ejecuta en GPU de 10 GB.
- **Mínimo declarado**: 1× RTX 3080 de 10 GB o 1× RTX 4070; el texto de la model card afirma que "funciona en cualquier GPU de 8 GB".
- **GPU de consumo compatibles**: RTX 3080/4070 (probadas), y por requisito Ampere o superior, cualquier tarjeta con ≥ 8 GB. En 8 GB exactos el margen es ajustado si se quiere contexto completo; conviene reducir `--max-model-len` o el uso de memoria.
- **GPU de datacenter**: A100, H100 o L40S son compatibles a nivel de arquitectura, pero no hay mediciones publicadas para ellas. Su interés sería aumentar el tamaño de lote y el throughput, no la viabilidad.
- **Opciones de despliegue**:
  - vLLM ≥ 0.21.0 con compressed-tensors, ruta preferida; se ha probado con la imagen `vllm/vllm-openai:v0.21.0-cu129-ubuntu2404`.
  - SGLang v0.5.8: la model card incluye un comando, pero apunta a `google/gemma-4-e2b-it` (el modelo base), no a este checkpoint cuantizado; hay que verificar el soporte real del formato CT en esa ruta.
  - llama.cpp: no carga compressed-tensors; requiere convertir a GGUF (Q8_0 o IQ4_XS) y, para visión, generar además el `mmproj` GGUF.
  - transformers + compressed-tensors: soportado para muchos modelos de texto, pero el multimodal "puede necesitar código personalizado".
  - TGI: no soportado; el autor advierte explícitamente de errores opacos en el worker.
  - Widget de inferencia de Hugging Face: falla con frecuencia.
- **Latencia**: no disponible. Solo se publican cifras de throughput agregado.
- **Disco**: el repositorio ocupa 17,6 GB, muy por encima de los ~2,5 GB de pesos declarados; hay que prever ese espacio en la descarga aunque la inferencia use una fracción.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| 88plug/Gemma4-E2B-it-W8A16 (este) | ~5,1 B totales / ~2 B activos | 32.768 tokens (configurado) | compressed-tensors INT8 W8A16 | ~2,5 GB | Apache-2.0 | vLLM ≥ 0.21 nativo; Ampere+ ≥ 8 GB |
| google/gemma-4-e2b-it (BF16) | ~5,1 B totales / ~2 B activos | no disponible en la información | BF16 | ~4,5 GB según la model card | no disponible en la información | Referencia; requiere GPU de 10 GB según la card |
| GGUF Q4_K_M de la comunidad | mismos parámetros | no disponible | GGUF Q4_K_M (llama.cpp) | ~2,5 GB | no disponible | CPU o cualquier GPU; visión requiere `mmproj` GGUF |
| GGUF Q8_0 de la comunidad | mismos parámetros | no disponible | GGUF Q8_0 (llama.cpp) | ~4,5 GB | no disponible | Cualquier GPU ≥ 6 GB; visión requiere `mmproj` GGUF |

No se dispone de comparaciones con otros modelos multimodales pequeños (por ejemplo, variantes ligeras de Qwen-VL, PaliGemma o SmolVLM) en la información proporcionada; la model card solo compara frente a otras cuantizaciones del mismo modelo base.

## Limitaciones y advertencias

- **Cuantización sin calibración**: es RTN data-free, sin corpus de calibración. El autor la describe como casi sin pérdida, pero no aporta mediciones de KL ni de MMLU que lo respalden; los valores < 0,005 y ≥ 99,7 % son objetivos, no resultados.
- **Estado "provisional"**: el propio autor etiqueta la release como provisional y anuncia una recuantización AutoRound. Conviene fijar la revisión concreta del repositorio si se despliega en producción.
- **Componentes sin cuantizar**: la torre SigLIP, el proyector multimodal y las PLE se mantienen en BF16, de modo que el ahorro de memoria es menor de lo que sugiere el total de parámetros y la calidad visual no está cuantizada.
- **Idioma**: solo se declara inglés. El rendimiento en castellano no está evaluado ni documentado.
- **Sin datos de benchmarks de calidad**: no hay MMLU, HumanEval, GSM8K ni métricas multimodales publicadas; la evaluación comparativa con el modelo base es imposible con la información disponible.
- **Inconsistencias de tamaño**: el repositorio ocupa 17,6 GB frente a los ~2,5 GB declarados de pesos, y el baseline BF16 se cifra en ~4,5 GB, lo que no concuerda con 5,1 B de parámetros en BF16 (≈10 GB). Hay que verificar el contenido real del repositorio antes de dimensionar el almacenamiento.
- **Soporte de runtime restringido**: TGI no funciona, el widget de Hugging Face suele fallar y el multimodal en transformers puede requerir código propio. La ruta soportada es vLLM ≥ 0.21.0.
- **Riesgo de alucinación**: no se documenta ninguna evaluación específica; es un riesgo genérico de los modelos generativos, agravado en tareas visuales cuando la imagen es de baja calidad o contiene texto denso. No hay datos sobre manejo de imágenes ambiguas.
- **Sesgos**: no se publica ninguna evaluación de sesgos, toxicidad o robustez. No hay información disponible.
- **Licencia**: el checkpoint declara Apache-2.0, pero la licencia del modelo base google/gemma-4-e2b-it no se indica en la información proporcionada. Antes de un uso comercial conviene verificar los términos del modelo original de Google, que pueden imponer restricciones adicionales.
- **Tool calling y agentes**: no documentados; no debe asumirse su disponibilidad en producción sin pruebas propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/88plug/Gemma4-E2B-it-W8A16
- Modelo base: https://huggingface.co/google/gemma-4-e2b-it
- Perfil del autor (88plug AI Lab): https://huggingface.co/88plug
- Referencia del informe técnico citado (Gemma 4 Technical Report, Google DeepMind, 2025): https://huggingface.co/google/gemma-4-e2b-it
- Repositorio de vLLM (runtime recomendado, ≥ 0.21.0): no disponible en la información proporcionada
- Documentación de compressed-tensors: no disponible en la información proporcionada
- Repositorio de llmcompressor (mencionado en los tags): no disponible en la información proporcionada
