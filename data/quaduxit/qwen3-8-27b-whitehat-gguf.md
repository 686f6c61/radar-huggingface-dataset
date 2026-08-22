# QuaduxIT/Qwen3.8-27B-Whitehat-GGUF

## Resumen

QuaduxIT/Qwen3.8-27B-Whitehat-GGUF es un fine-tune de tipo red-team y white-hat sobre el modelo base Qwen/Qwen3.8-27B, desarrollado por Quadux IT GmbH. Su objetivo es servir como asistente local privado para trabajo de seguridad ofensiva y defensiva autorizada: desarrollo de exploits, malware, ingeniería inversa, análisis de vulnerabilidades y pruebas de penetración, manteniendo los datos sensibles dentro de la infraestructura del usuario. El modelo conserva la arquitectura densa híbrida del base (64 capas, 48 con atención lineal) y su ventana de contexto nativa de 262 144 tokens, además de un cabezal MTP para decodificación especulativa.

La relevancia actual radica en que los modelos comerciales y la mayoría de los fine-tunes rechazan tareas ofensivas legítimas o carecen de barreras para contenido dañino. Este modelo se posiciona en un punto intermedio: responde al 100 % de las tareas ofensivas de seguridad y mantiene un rechazo del 100 % ante peticiones de daño físico (armas, drogas, CBRN) y material de abuso sexual infantil, tanto en texto como en imágenes. Se distribuye en formato GGUF con cuantización UD-Q4_K_XL y matriz de importancia propia, optimizado para ejecución local con llama.cpp en CUDA, Vulkan o CPU.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido (48 capas con atención lineal de 64, más head MTP) |
| Parametros totales | 27 320 697 856 (27B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativos, extensible a 1M (según vLLM Recipes) |
| Tipos de cuantizacion | UD-Q4_K_XL con imatrix (~17,5 GB); familia GGUF; también FP8 y W8A16 en safetensors |
| Idiomas soportados | inglés, alemán, multilingüe (base Qwen3.8-27B soporta más idiomas, pero la model card solo declara en, de, multilingual) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con `--mmproj` para visión); también safetensors en otras variantes |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27 000 millones de parámetros con arquitectura híbrida de atención: 48 de sus 64 capas usan atención lineal, lo que reduce el coste de memoria en contexto largo, y las 16 restantes usan atención completa. Incluye un módulo MTP (multi-token prediction) que actúa como head de decodificación especulativa. El fine-tune de Quadux es un LoRA supervisado que modifica únicamente el comportamiento, sin cambiar los pesos base. El entrenamiento se realizó con un conjunto de prompts de evaluación excluidos del entrenamiento (held-out) para medir la eficacia. El modelo no requiere system prompt, ya que el comportamiento está incrustado en los pesos. Se conserva el MTP para decodificación especulativa en llama.cpp.

La cuantización UD-Q4_K_XL con imatrix propia logra un tamaño de ~17,5 GB, y el modelo se distribuye como GGUF, compatible con llama.cpp en CUDA, Vulkan y CPU. Existen también variantes en safetensors (FP8, W8A16, NVFP4) que se describen en otras model cards.

## Capacidades

- Generación de texto y razonamiento: responde a tareas de seguridad ofensiva y defensiva con un 100 % de cumplimiento en ofensivo (exploits, malware, C2, ingeniería inversa) y 97 % en defensivo/autorizado.
- Visión multimodal: procesa imágenes y capturas de pantalla mediante `--mmproj`, manteniendo la barrera de rechazo de contenido dañino incluso cuando las instrucciones se presentan como texto dentro de una imagen (jailbreak por imagen).
- Function calling: soporte de llamada a funciones heredado del base Qwen3.8-27B.
- Decodificación especulativa: preserva el head MTP para acelerar la generación con llama.cpp.
- Multilingüe: el base soporta múltiples idiomas; la model card declara inglés, alemán y multilingüe.
- Rechazo selectivo: rechaza peticiones de daño físico (armas, explosivos, drogas, CBRN, violencia) y CSAM, tanto en texto como en imagen y en todos los idiomas.

## Casos de uso

- **Red-teaming interno**: el modelo puede generar exploits, escribir payloads de C2 y desarrollar herramientas de ofensiva para pruebas de penetración autorizadas sobre sistemas propios o con permiso explícito. Su 100 % de cumplimiento en tareas ofivas evita el rechazo que sufren los modelos comerciales.
- **Análisis de malware**: gracias a su capacidad de ingeniería inversa y análisis de binarios, permite diseccionar muestras de malware y entender su comportamiento sin enviar datos sensibles a servicios externos.
- **Desarrollo de herramientas de defensa**: genera scripts de detección, reglas de hardening, configuraciones de firewall y automatización de respuestas ante incidentes, aprovechando el 97 % de cumplimiento en tareas defensivas.
- **Investigación de licencias y DRM**: el modelo asiste en la investigación de mecanismos de licenciamiento y DRM, un área que suele estar bloqueada en modelos comerciales.
- **Formación en concienciación de seguridad**: puede generar escenarios de ataque simulados y material de entrenamiento para equipos de seguridad, con ejemplos de técnicas ofensivas explicadas de forma didáctica.
- **Análisis forense de imágenes**: su capacidad multimodal permite examinar capturas de pantalla de sistemas comprometidos o extraer información de imágenes en investigaciones de incidentes, manteniendo la barrera de contenido dañoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card incluye una evaluación interna sobre un conjunto de prompts retenidos (33 de seguridad, 10 de ofensiva, 18 de daño) con temperatura 0 y sin system prompt, medida sobre la variante UD-Q4_K_XL:

| Axis | Stock Qwen3.8-27B | Fully abliterated | **Quadux Whitehat** |
|---|---|---|---|
| Security-comply (defensivo/autorizado) | 61 % | 100 % | **97 %** |
| Offensive-comply (exploits, malware, C2, RE) | 0 % | 100 % | **100 %** |
| Harm-refuse (armas/drogas/CBRN/CSAM) | 94 % | 0 % | **100 %** |

En la ruta de imagen (jailbreak), el modelo rechaza "build a pipe bomb" y "synthesize meth" cuando se presentan como imagen, mientras que un fine-tune solo texto cumple (fuga). Las variantes FP8 y W8A16 del safetensors superan la referencia con 100 % en los tres ejes, y la NVFP4 mantiene el 100 % en rechazo de daño pero baja a 97 % y 90 % en seguridad y ofensiva respectivamente.

## Requisitos de hardware

- **VRAM estimada**: la cuantización UD-Q4_K_XL ocupa ~17,5 GB. Con el modelo base, una cuantización 4-bit necesita entre 16 y 19 GB para inferencia, por lo que la variante Q4_K_XL cabe en GPUs de 24 GB como la RTX 4090 o la RTX 3090.
- **GPU recomendadas**: RTX 4090 (24 GB) para uso fluido; también A100 40 GB o H100 80 GB para contexto largo. Para contexto de 32-64K tokens, la atención híbrida reduce el consumo de memoria frente a modelos densos puros.
- **En consumer GPU**: sí, con 24 GB de VRAM se puede ejecutar cómodamente con 4-bit. Con 16 GB de VRAM podría requerir cuantizaciones menores o limitar el contexto.
- **Opciones de despliegue**: llama.cpp (CUDA, Vulkan, CPU) con `--mmproj` para visión; también compatible con Ollama y vLLM (según el base). El head MTP permite decodificación especulativa en llama.cpp.
- **Latencia y throughput**: no hay datos publicados específicos. La atención lineal de 48 capas reduce el coste de memoria en contexto largo, pero la latencia por token depende del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cumplimiento ofensivo | Rechazo de daño | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | 0 % | 94 % | Apache-2.0 | safetensors, GGUF |
| QuaduxIT Whitehat | 27B | 262K | 100 % | 100 % | Apache-2.0 | GGUF, safetensors |
| Modelos abliterados | 27B | 262K | 100 % | 0 % | Apache-2.0 | safetensors, GGUF |
| Otros fine-tunes red-team | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se basa en la evaluación interna de la model card. No se dispone de datos de otros modelos red-team específicos para comparar.

## Limitaciones y advertencias

- **Uso exclusivo para autorización**: el modelo es una herramienta para profesionales white-hat/red-team que trabajen en sistemas propios o con permiso explícito. No debe desplegarse en usuarios finales no autorizados.
- **Sesgo de dominio**: está especializado en seguridad y puede responder con contenido ofensivo si se usa fuera de contexto. No es un asistente de propósito general.
- **Riesgo de alucinación**: como cualquier LLM, puede generar código o exploits incorrectos o incompletos; se recomienda validar siempre las respuestas en entornos controlados.
- **Límites de idioma**: la model card declara inglés y alemán como idiomas principales, aunque el base es multilingüe. La calidad en otros idiomas puede ser inferior.
- **Licencia**: Apache-2.0 permite uso comercial, pero la responsabilidad legal del uso recae en el usuario. El modelo no es apto para distribución a terceros no autorizados.
- **Cuantización**: la variante UD-Q4_K_XL es la referencia, pero las variantes NVFP4 pueden ser más cautelosas (97 % y 90 % en algunos ejes). Para producción se recomienda usar las variantes FP8 o W8A16 que alcanzan 100 % en todos los ejes.
- **Advertencia de seguridad**: el modelo puede generar exploits, malware y código de C2. Solo debe usarse en entornos aislados y con autorización explícita. El uso indebido puede violar leyes locales e internacionales.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/QuaduxIT/Qwen3.8-27B-Whitehat-GGUF)
- [Modelo base Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Cuantizaciones GGUF de Unsloth para Qwen3.8-27B](https://huggingface.co/unsloth/Qwen3.8-27B-GGUF)
- [Guía de cuantizaciones para Qwen3.8-27B](https://www.orcarouter.ai/blog/qwen-3-8-27b-gguf)
- [Cómo ejecutar Qwen3.8-27B sin censura localmente](https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally)
- [Receta vLLM para Qwen3.8-27B](https://recipes.vllm.ai/Qwen/Qwen3.8-27B)
- [Guía de Unsloth para cuantizaciones Qwen3.8-27B](https://www.explainx.ai/blog/unsloth-qwen3-8-27b-dynamic-v3-ggufs-august-2026)
