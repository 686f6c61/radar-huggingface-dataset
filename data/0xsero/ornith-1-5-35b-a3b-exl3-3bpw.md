# 0xSero/Ornith-1.5-35B-A3B-EXL3-3bpw

## Resumen

Ornith-1.5-35B-A3B-EXL3-3bpw es una cuantización comunitaria en formato EXL3 de 3 bits del modelo base ornith-ai/Ornith-1.5-35B-A3B, un modelo de lenguaje multimodal de tipo mixture-of-experts (MoE) con 35 mil millones de parámetros totales y 3 mil millones activos por token. El modelo base, desarrollado por ornith-ai, combina atención lineal (GatedDeltaNet) en 30 de sus 40 capas con atención completa en las 10 restantes, e incorpora una torre de visión que le permite procesar imágenes. Esta cuantización, creada por 0xSero, aplica una estrategia de capas poco habitual: mantiene el backbone de atención y las proyecciones de GatedDeltaNet en BF16, y solo cuantiza a 3 bits las matrices de los expertos enrutados, que representan aproximadamente el 90 % de los parámetros. El resultado es un artefacto de 18 GB que conserva una calidad cercana al modelo original, con una divergencia KL de 0.0732 frente al BF16 y una perplejidad dentro del ruido estadístico.

La relevancia de esta cuantización radica en que permite ejecutar un modelo de 35B con solo ~3B activos en hardware de consumo, como cuatro RTX 3090, manteniendo una ventana de contexto nativa de 262 144 tokens. Además, el modelo base destaca en tareas de codificación y agénticas, superando a Qwen 3.6-35B y a modelos densos como Gemma 4-31B según la documentación oficial. Esta versión cuantizada hereda esas capacidades, aunque con una ligera degradación esperable por la compresión. La licencia MIT permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido con atención lineal (GatedDeltaNet) y atención completa, más torre de visión |
| Parametros totales | 35B (total) / 3B (activos) |
| Parametros activos | 3B |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | EXL3 3 bpw (expertos enrutados), BF16 para backbone, MTP a 4 bpw |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (EXL3) |

Nota: el archivo safetensors de esta cuantización contiene 9 249 709 936 parámetros, un valor inferior a los 35B del modelo base debido al formato de almacenamiento comprimido de EXL3, que agrupa los pesos cuantizados. El número real de parámetros del modelo es de 35B.

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un MoE con 256 expertos enrutados y selección top-8 por token. De sus 40 capas, 30 emplean GatedDeltaNet, una variante de atención lineal con estado recurrente, mientras que las 10 restantes usan atención completa. Esta combinación reduce el coste computacional y permite ventanas de contexto muy largas. El modelo incluye además una torre de visión que procesa imágenes y las integra con el texto, lo que lo convierte en un modelo multimodal. Según la documentación de ornith-ai, el entrenamiento sigue un enfoque de "self-scaffolding" y "self-improvement": el modelo propone tareas, genera andamiajes específicos y produce rollouts para aprendizaje por refuerzo, creando continuamente nuevas experiencias de aprendizaje.

La cuantización EXL3 de 0xSero utiliza una estrategia de capas inspirada en la receta de brandonmusic para GLM-5.2: las matrices de los expertos enrutados se cuantizan a 3 bpw con codebook MCG, mientras que las proyecciones de GatedDeltaNet, las de atención completa, los expertos compartidos, las embeddings, el lm_head, las normas y el router se mantienen en BF16. La capa MTP (multi-token prediction) se cuantiza a 4 bpw y la torre de visión permanece en BF16. La conversión se realizó con exllamav3 1.4.2, usando calibración estándar de 250 filas por 2048 tokens. El resultado es un artefacto de 18 GB que, según las pruebas de `model_diff`, mantiene una perplejidad de 8.711 frente a 8.717 del BF16 base, dentro del ruido estadístico.

## Capacidades

- Generación de texto y conversación multi-turno con contexto largo (hasta 262 144 tokens).
- Razonamiento complejo y resolución de problemas, especialmente en tareas de codificación y agénticas.
- Generación de código en múltiples lenguajes, con soporte para tool calling y function calling.
- Capacidades de agente: planificación multi-paso, uso de herramientas y ejecución de tareas autónomas.
- Procesamiento de imágenes: entrada multimodal imagen-texto, aunque la cuantización puede afectar ligeramente la calidad de la visión.
- Soporte de decodificación especulativa mediante la capa MTP, que acelera la inferencia.
- Multilingüismo: no se han publicado los idiomas soportados, pero al estar basado en Qwen 3.5, es probable que cubra un amplio rango de lenguas.

## Casos de uso

- Asistente de programación en producción: el modelo puede integrarse en IDE o pipelines de CI/CD para generar código, revisar pull requests y sugerir correcciones. Su capacidad de tool calling permite conectarlo a APIs de compilación, linters o repositorios.
- Agente autónomo de automatización de tareas: gracias a su soporte para razonamiento multi-paso y uso de herramientas, puede orquestar flujos de trabajo como gestión de correos, reservas o extracción de datos de la web.
- Chatbot de atención al cliente con contexto largo: la ventana de 262K tokens permite mantener conversaciones extensas y recordar detalles de interacciones previas, ideal para soporte técnico o jurídico.
- Análisis de documentos extensos: puede resumir o extraer información de libros, informes o contratos de cientos de páginas sin perder el hilo.
- Generación de contenido multimodal: al aceptar imágenes, puede describir, analizar o generar texto a partir de capturas, diagramas o fotografías.
- Investigación en agentes y RL: el modelo base fue entrenado con un enfoque de auto-mejora, por lo que es útil para experimentos de aprendizaje por refuerzo y generación de datos sintéticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas específicas (MMLU, HumanEval, GSM8K, etc.) para esta cuantización. La model card del modelo base indica que supera a Qwen 3.6-35B en benchmarks de codificación y agénticos, y a Gemma 4-31B y Muse Glimmer-30B en tareas agénticas, pero no se proporcionan cifras concretas.

La model card de esta cuantización incluye una comparación de fidelidad frente al modelo BF16, medida con `exllamav3 eval/model_diff` sobre 100 rondas de 2048 tokens de Wikitext:

| Checkpoint | KL(A->B) | Top-1 agreement |
|---|---|---|
| **Ornith-1.5-35B-A3B-EXL3-3bpw** | **0.0732** | 88.9 % |
| EXL3 2.75 bpw | 0.1005 | 87.1 % |
| EXL3 3 bpw | 0.0732 | 88.9 % |
| EXL3 3.5 bpw | 0.0540 | 90.5 % |
| Referencia: -hq 3 bpw | 0.2509 | 79.9 % |

La perplejidad del BF16 base es 8.717, y las tres variantes sin poda (2.75, 3 y 3.5 bpw) obtienen 8.698, 8.711 y 8.719 respectivamente, todas dentro del ruido estadístico.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan entre 4.5 y 5.5 GB por GPU en una configuración de 4x RTX 3090 (24 GB cada una). En una sola GPU, el modelo completo requeriría al menos 18 GB de VRAM, por lo que cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con cuantización adicional de caché KV.
- GPUs recomendadas: 4x RTX 3090 para tensor-parallel (TP4) con TabbyAPI, o una RTX PRO 4000 Blackwell para TP1 según el recipe de 4 bpw (aunque este es 3 bpw, el requisito sería similar o menor).
- Inferencia en consumer GPU: sí, es posible en una sola RTX 4090 o 3090 con 24 GB, aunque el rendimiento será menor que con TP4.
- Opciones de despliegue: TabbyAPI con backend exllamav3 (validado), vLLM con `--quantization exl3`, y potencialmente llama.cpp si soporta EXL3 (no confirmado).
- Rendimiento medido en 4x RTX 3090 TP4: ~50 tok/s en un solo stream, ~180 tok/s agregados con concurrencia 4. La caché KV se configura en Q4 para ahorrar memoria.
- Requiere un parche en exllamav3 1.4.3 para cargar las proyecciones GatedDeltaNet sin cuantizar en modo tensor-parallel (cambiar `id_w = exported["suh"]` por `id_w = exported["weight"]` en `exllamav3/modules/quant/fp16.py`).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| **Ornith-1.5-35B-A3B-EXL3-3bpw** | 35B total / 3B activos | 262K | MIT | EXL3 3bpw | Cuantización comunitaria, backbone BF16 |
| Ornith-1.5-35B-A3B (BF16) | 35B total / 3B activos | 262K | MIT | BF16 | Modelo base, calidad máxima |
| Qwen 3.6-35B | 35B total / ~3B activos | no disponible | Apache 2.0 | BF16 | Competidor directo, superado por Ornith en benchmarks agénticos |
| Gemma 4-31B | 31B denso | no disponible | Gemma license | BF16 | Modelo denso, superado por Ornith en tareas agénticas |

La comparativa se basa en la documentación del modelo base. No se dispone de datos de rendimiento directos de esta cuantización frente a otros modelos cuantizados.

## Limitaciones y advertencias

- La cuantización a 3 bpw de los expertos enrutados puede introducir una ligera degradación en tareas que dependen fuertemente de la precisión de esos pesos, aunque las pruebas de perplejidad indican que está dentro del ruido.
- El modelo base es multimodal, pero la cuantización no ha sido validada específicamente para tareas de visión; es posible que la calidad de la generación de imágenes se vea afectada.
- Se requiere un parche manual en exllamav3 1.4.3 para cargar el modelo en modo tensor-parallel; sin él, la carga falla con `KeyError: 'suh'`. El parche no es necesario en modo single-GPU.
- La configuración de `max_batch_size` debe cubrir la concurrencia esperada, ya que las capas GatedDeltaNet mantienen estado recurrente por secuencia; un valor bajo agota los slots rápidamente.
- No se han publicado los idiomas soportados oficialmente, por lo que el rendimiento en lenguas distintas del inglés no está garantizado.
- La licencia MIT permite uso comercial, pero el modelo base puede tener dependencias de terceros (por ejemplo, la arquitectura Qwen) que podrían imponer restricciones adicionales.
- El tamaño del contexto de 262K tokens es nativo, pero el uso práctico con caché KV cuantizada (Q4) puede reducir la calidad en contextos muy largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/0xSero/Ornith-1.5-35B-A3B-EXL3-3bpw
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Modelo base FP8: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-FP8
- Blog de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Recipe de 4 bpw en GitHub: https://github.com/0xSero/local-ai-registry/blob/main/local-ai/recipes/ornith15-35b-a3b-exl3-4bpw-rtxpro4000-tabbyapi-tp1.json
- Instancia de modelo en GitHub: https://github.com/0xSero/local-ai-registry/blob/main/local-ai/model-instances/ornith15-35b-a3b-exl3-4bpw-rtxpro4000-tabbyapi-tp1.json
