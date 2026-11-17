# kataguru/Kataguru-Polyglot-264E-35B-A3B-GGUF

## Resumen

Kataguru-Polyglot-264E-35B-A3B es un modelo de lenguaje de tipo Mixture-of-Experts desarrollado por Datasein Oy (Finlandia), con Jari Katajisto como arquitecto jefe. Se construye sobre el núcleo de Kataguru-Sceptic-35B-A3B-v3.1 (a su vez derivado de la familia Qwen3.5-35B-A3B) y amplía el router de expertos de 254 a 264, añadiendo diez slots dedicados a otros tantos idiomas: finés, estonio, húngaro, lituano, letón, islandés, euskera, georgiano, galés y turco, además del inglés. La propuesta central es un modelo políglota "sin enganches externos" (unhooked) que enruta directamente entre 110 pares de idiomas sin necesidad de pivotar por inglés en tiempo de ejecución.

El modelo combina capacidades de razonamiento STEM, generación de código, tool calling y comprensión de imágenes (pipeline image-text-to-text, con un codificador de visión ViT de 27 capas), todo ello bajo licencia Apache-2.0. Esta ficha corresponde a la variante GGUF, publicada como "APEX-Trio" con tres niveles de cuantización (APEX-Small, APEX-Medium y APEX-Good) más un fichero mmproj para el componente multimodal, con un total de 43,29 GiB repartidos entre todos los ficheros.

La relevancia actual del modelo reside en su enfoque hacia lenguas de baja representación —especialmente aglutinantes y de familia urálica— y en su empaquetado listo para inferencia local mediante llama.cpp, LM Studio y Ollama, con un conjunto de benchmarks verificados que incluye GPQA Diamond (68,18 %), BFCL V4 (83,47 %) y LiveCodeBench v6 (36,00 % Pass@1).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre transformer Qwen3.5-35B-A3B; 27 capas ViT para visión; cabeza especulativa MTP |
| Parametros totales | 36.537.721.984 (≈36,5 B) |
| Parametros activos | Top-8 expertos activos (denominación A3B) |
| Longitud de contexto | Nativa según base Qwen3.5-35B-A3B; en despliegue vLLM se documenta `--max-model-len 65536` |
| Tipos de cuantizacion | GGUF APEX-Trio: APEX-Small, APEX-Medium, APEX-Good (calibradas con imatrix); mmproj-f16.gguf para visión |
| Idiomas soportados | en, fi, et, hu, lt, lv, is, eu, ka, cy, tr |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); también hay variantes NVFP4 y W4A16-AWQ en otros repositorios de la suite |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con 264 expertos en total: 254 expertos "universales" congelados (STEM, código, herramientas agénticas y razonamiento) heredados del modelo base, más 10 slots de idioma dedicados (`#254..#263`) para las diez lenguas objetivo. El enrutamiento es Top-8 (denominación A3B). La modificación principal respecto al base es la ampliación del router y una calibración "Stage-B attention-only linear-soup" (combinación `0.55*v1 + 0.50*v2`) aplicada sobre 190 tensores de atención y normalización de un total de 1835, sin deriva en expertos ni router. Según el autor, esto permite el enrutamiento directo entre los 110 pares de idiomas sin hooks en tiempo de ejecución.

No se modificaron el codificador de visión ViT de 27 capas (333 tensores), la cabeza especulativa MTP ni la ventana de contexto nativa. Se aplicó además un proceso de "uncensoring" denominado SOMA/ARA y una plantilla de chat multi-modo (`chat_template.jinja`) con etiquetas operativas como `[INSPECT]`, `[CURATE]`, `[SURGEON]`, `[DECISION]` y modificadores `{REASON:...}`. Los pesos maestros en BF16 y las bases de datos de entrenamiento permanecen privados; solo se publican los pesos cuantizados. No se dispone de información detallada sobre el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo "thinking" configurable (`think=True`/`think=False`).
- Generación y comprensión de código en varios lenguajes (Python, Java, JavaScript, entre otros, según los resultados de BFCL).
- Razonamiento matemático y STEM (GSM8K, GPQA Diamond, ARC-Easy).
- Comprensión de imágenes (pipeline image-text-to-text) mediante el codificador ViT de 27 capas y el fichero `mmproj`.
- Tool calling y function calling, con parser `qwen3_coder` en vLLM y soporte de elección automática de herramienta.
- Capacidades agénticas: razonamiento multi-paso, llamadas paralelas y múltiples (BFCL Multiple 96,00 %, Parallel 92,00 %).
- Traducción directa entre los 11 idiomas sin pivote por inglés, mediante prefijo `/translate /<target>`.
- RAG cross-lingual nativo: paso de `documents=[...]` en `apply_chat_template` o prefijo `/rag /<target>`.
- Modo "uncensored" (SOMA/ARA) que relaja los rechazos por defecto.
- Multilingüismo centrado en lenguas urálicas, bálticas, célticas y otras de baja representación (finés, estonio, húngaro, lituano, letón, islandés, euskera, georgiano, galés, turco).

## Casos de uso

- Traducción directa entre lenguas de baja representación: el modelo puede traducir entre, por ejemplo, finés y euskera sin pasar por inglés, usando el prefijo `/translate /<target>`, lo que reduce la pérdida semántica acumulada del pivote y es adecuado para documentación técnica y administrativa en mercados nórdicos y bálticos.
- RAG cross-lingual: con `documents=[...]` o el prefijo `/rag /<target>`, permite consultar una base documental en inglés y responder en finés, húngaro o georgiano manteniendo la recuperación en el idioma original, útil para bases de conocimiento corporativas multinacionales.
- Asistencia al desarrollo de software: con LiveCodeBench v6 al 36,00 % Pass@1 y BFCL V4 al 83,47 %, es viable como asistente de código en pipelines de CI/CD con tool calling para consultar repositorios, ejecutar tests o abrir issues.
- Atención al cliente multilingüe: la ventana de contexto de hasta 65.536 tokens en despliegue vLLM permite conversaciones multi-turno con historial largo en finés, estonio o turco sin cambiar de modelo.
- Procesamiento de documentos con imágenes: al ser image-text-to-text, puede extraer información de facturas, formularios o capturas y responder en el idioma del usuario, útil en digitalización de archivos administrativos.
- Análisis STEM y resolución de problemas de nivel universitario: con GPQA Diamond al 68,18 % y GSM8K al 87,64 %, sirve como tutor o asistente de investigación en matemáticas y ciencias.
- Despliegue local en estaciones de trabajo: la variante GGUF APEX-Small permite ejecutar el modelo en hardware de consumo mediante llama.cpp, LM Studio u Ollama, adecuado para prototipado y entornos con requisitos de soberanía de datos.
- Agentes autónomos con múltiples herramientas: las puntuaciones de BFCL en llamadas paralelas (92,00 %) y múltiples (96,00 %) lo hacen apto para orquestación de tareas con varias APIs.

## Benchmarks y rendimiento

Resultados publicados por el autor (media de 15 benchmarks en NVFP4, 2x RTX 5090, TP=2, CUDAGraphs, `--max-model-len 65536`):

| Benchmark | Resultado |
|---|---|
| Media 15 benchmarks | 69,70 % |
| Media cognitiva 11 tareas | 71,77 % |
| BoolQ | 90,40 % |
| GSM8K | 87,64 % |
| MedQA | 85,55 % |
| ARC-Easy | 84,51 % |
| PIQA | 83,35 % |
| HellaSwag | 82,24 % |
| GPQA Diamond | 68,18 % (135/198) |
| IFEval Prompt Strict | 68,39 % |
| IFEval Instruction Strict | 76,62 % |
| LiveCodeBench v6 (Pass@1) | 36,00 % (175 problemas) |
| BFCL V4 Single-Turn AST | 83,47 % |
| BFCL Python Simple | 93,50 % |
| BFCL Java | 65,00 % |
| BFCL JavaScript | 74,00 % |
| BFCL Multiple | 96,00 % |
| BFCL Parallel | 92,00 % |
| Cross-lingual `V_gen` ΔNLL | +0,46 % frente al núcleo |
| Cross-lingual `think=False` | 13/14 Live-14 (16/17 Heldout-17) |
| Cross-lingual `think=True` | 10/14 Live-14 (16/17 Heldout-17) |

No se han publicado comparaciones directas con modelos de referencia en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio GGUF completo ocupa 43,29 GiB; la variante APEX-Small es la más ligera del trío y está pensada para hardware más limitado, mientras que APEX-Good requiere más memoria. No se detallan los tamaños individuales de cada fichero.
- GPU recomendadas: el autor valida el despliegue vLLM con 2x RTX 5090 en TP=2; también hay variante NVFP4 específica para Blackwell y W4A16-AWQ para vLLM universal.
- GPU de consumo: sí cabe en GPUs de consumo mediante las cuantizaciones GGUF más pequeñas (APEX-Small), aunque no se especifica el mínimo exacto de VRAM.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (formato GGUF); vLLM con `--quantization compressed-tensors` para la variante AWQ; NVFP4 para Blackwell.
- Latencia y throughput: no disponibles. El autor menciona el uso de CUDAGraphs y una cabeza especulativa MTP que debería mejorar la decodificación, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kataguru-Polyglot-264E-35B-A3B | 36,5 B (Top-8 activos) | hasta 65.536 en despliegue | Apache-2.0 | GGUF, NVFP4, AWQ | 264 expertos, 11 idiomas, visión |
| Qwen3.5-35B-A3B (base) | ≈35 B (A3B) | no disponible | no disponible | safetensors y derivados | Modelo origen del núcleo; sin slots de idioma dedicados |
| Kataguru-Sceptic-35B-A3B-v3.1 | ≈35 B (A3B) | no disponible | no disponible | no disponible | Base directa; 254 expertos, sin expansión políglota |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- La traducción cross-lingual en modo `think=True` degrada el resultado (10/14 en Live-14 frente a 13/14 con `think=False`); para traducción determinista se recomienda desactivar el razonamiento intermedio.
- Los pesos maestros en BF16 y las bases de datos de entrenamiento son privados; solo se publican pesos cuantizados, lo que limita la reproducibilidad y el ajuste fino completo.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan evaluaciones específicas de factualidad más allá de los benchmarks citados.
- El modelo está marcado como "uncensored" (SOMA/ARA), lo que implica menor tasa de rechazos y mayor necesidad de filtros de seguridad en producción.
- Cobertura lingüística limitada a 11 idiomas; el rendimiento fuera de ese conjunto no está evaluado.
- Los benchmarks publicados corresponden a la variante NVFP4 sobre 2x RTX 5090; el rendimiento de las cuantizaciones GGUF puede diferir y no se documenta.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre los datos de entrenamiento subyacentes.
- El repositorio tiene pocas descargas (647) y cero likes en el momento de la consulta, lo que indica una validación comunitaria todavía escasa.

## Enlaces

- Modelo en Hugging Face (GGUF): https://huggingface.co/kataguru/Kataguru-Polyglot-264E-35B-A3B-GGUF
- Variante NVFP4: https://huggingface.co/kataguru/Kataguru-Polyglot-264E-35B-A3B-NVFP4
- Variante W4A16-AWQ: https://huggingface.co/kataguru/Kataguru-Polyglot-264E-35B-A3B-W4A16-AWQ
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
- Perfil del autor: https://huggingface.co/kataguru
