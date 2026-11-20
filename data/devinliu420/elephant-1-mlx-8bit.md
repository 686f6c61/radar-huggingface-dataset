# devinliu420/elephant-1-mlx-8bit

## Resumen

elephant-1-mlx-8bit es una conversión cuantizada a 8 bits en formato MLX del modelo baselabs/elephant-1, un modelo de decisión de 9B parámetros desarrollado por Base Labs. A diferencia de los modelos generativos convencionales, elephant-1 no produce texto libre: recibe un estado (texto e imágenes) junto con un conjunto de preguntas tipadas y devuelve una probabilidad calibrada para cada opción de respuesta. Esta conversión está pensada específicamente para Apple silicon y mantiene la torre de visión del modelo original, por lo que acepta entradas multimodales de texto e imagen.

La relevancia de esta ficha radica en que el modelo resuelve un problema distinto al de los LLM al uso: en lugar de generar respuestas abiertas, ofrece una interfaz de clasificación y decisión con puntuaciones calibradas, útil para enrutamiento, verificación y sistemas de decisión automatizados. La conversión MLX permite ejecutar un modelo de 9.409.813.744 parámetros en hardware de consumo de Apple con un pico de memoria de 11,5 GB, algo que en bf16 sería inviable en la mayoría de equipos domésticos.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, fue creado el 20 de noviembre de 2026 y su licencia es MIT. La conversión no está afiliada a Base Labs ni a Baseten, según indica el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención bidireccional por bloques (block-bidirectional attention) y lectura por slots (slot readout); incluye torre de visión |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit afín (affine) con group size 64; pesos no cuantizados en bfloat16 |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), cuantización 8-bit |

## Arquitectura y entrenamiento

El modelo base elephant-1 emplea una arquitectura transformer con atención bidireccional por bloques y un mecanismo de lectura por slots que produce probabilidades calibradas por opción, en lugar de una decodificación autoregresiva de texto. Esta decisión de diseño es crítica: según la model card, ejecutar los pesos con un forward causal estándar (como hacen mlx-lm y mlx-vlm por defecto) desplaza las probabilidades hasta 0,10, por lo que es necesario usar el runtime específico `elephant_mlx.py` o el paquete elephant-mlx para obtener resultados fieles. La conversión incluye la torre de visión, de modo que el modelo procesa tanto texto como imágenes.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La conversión se realizó con mlx-vlm 0.8.0 y mlx 0.32.4 mediante el comando `mlx_vlm.convert` con `--q-bits 8 --q-group-size 64 --dtype bfloat16`. El motor de servicio original en PyTorch (`engine.py`) se omite en este repositorio y se sustituye por `elephant_mlx.py`.

## Capacidades

- Clasificación y decisión calibrada: devuelve una probabilidad para cada opción de un conjunto de preguntas tipadas (por ejemplo, tipo `noul` para preguntas sí/no y tipo `choice` para selección entre criterios).
- Procesamiento multimodal: acepta texto e imágenes (la torre de visión está incluida en la conversión).
- Respuestas estructuradas por pregunta: el modelo recibe un diccionario de preguntas con instrucciones y criterios, y devuelve las respuestas con sus puntuaciones.
- Razonamiento sobre estados complejos: puede evaluar tickets de soporte, recibos e imágenes con varias preguntas simultáneas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language` del repositorio.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket y devuelve la probabilidad de que corresponda a cada equipo (por ejemplo, facturación o técnico). La model card muestra un caso con probabilidad 0,998 para el equipo de facturación.
- Verificación de recibos y facturas: con una imagen de recibo adjunta, el modelo responde a preguntas como si hay un cargo duplicado (0,999) o cuál es el total (0,995), lo que permite automatizar comprobaciones de gastos.
- Clasificación de urgencia: el modelo asigna probabilidades a niveles de urgencia (por ejemplo, "Today" con 0,64), útil para priorizar colas de atención.
- Control de calidad visual: con imágenes de formas geométricas, responde a preguntas de color y forma con probabilidades superiores a 0,9995, adecuado para tareas de verificación visual simples.
- Comparación entre imágenes: dado un par de imágenes, identifica cuál cumple un criterio (por ejemplo, cuál muestra un círculo, con 0,99997), útil en selección y filtrado de contenido visual.
- Sistemas de decisión con umbrales: al devolver probabilidades calibradas, permite fijar umbrales de confianza y derivar casos ambiguos a revisión humana, integrándose en pipelines de decisión automatizada.
- Despliegue local en Apple silicon: con un pico de memoria de 11,5 GB y tiempos de 1,1 a 5,4 segundos por petición en un M1 Max, es viable para prototipos y herramientas de escritorio en equipos Mac.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Sí proporciona mediciones de precisión y latencia del motor MLX en un M1 Max:

| Petición | Respuestas | Tiempo |
|---|---|---|
| Ticket de soporte (texto) | refund 0,993; team billing 0,998; urgencia "Today" 0,64 | 1,1 s |
| Imagen de una forma: color y forma | correcto, ≥ 0,9995 en cada una | 1,7–3,2 s |
| Dos imágenes: ¿cuál muestra un círculo? | segunda 0,99997 | 5,4 s |
| Imagen de recibo: ¿cargo duplicado? ¿total? ¿equipo? | sí 0,999; 84,20 $ 0,995; billing 0,985 | 5,1 s |

Frente a los pesos bf16 originales, la mayor diferencia de probabilidad es de 0,0097 (en la urgencia del ticket de soporte), de 0,0011 en el recibo y por debajo de 0,0001 en todas las preguntas de formas. El tiempo de carga es de unos 6 segundos y el pico de memoria de 11,5 GB. En un modelo de prueba pequeño, el motor coincide con el runtime de referencia en PyTorch dentro de 4e-6 en logits, tanto para texto como para imágenes.

## Requisitos de hardware

- VRAM/memoria unificada estimada: pico de 11,5 GB medido en la conversión 8-bit, según la model card.
- GPU recomendadas: Apple silicon; las mediciones se realizaron en un M1 Max. No se proporcionan datos para GPU NVIDIA.
- Cabe en GPU de consumo: sí, en equipos Apple con al menos 16 GB de memoria unificada; el pico medido de 11,5 GB deja margen ajustado en configuraciones de 16 GB.
- Opciones de despliegue: MLX mediante `elephant_mlx.py` o el paquete elephant-mlx; mlx-lm y mlx-vlm pueden cargar los pesos, pero ejecutan las capas de atención completa de forma causal y generan texto, lo que altera las probabilidades hasta 0,10, por lo que no son adecuados para obtener resultados fieles.
- Latencia y throughput: entre 1,1 y 5,4 segundos por petición en un M1 Max según el caso; tiempo de carga de aproximadamente 6 segundos.
- Dependencias: mlx-vlm, mlx-lm, transformers y pillow.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de decisión calibrada en la documentación proporcionada. Como referencia del mismo linaje, se puede comparar con el modelo base:

| Modelo | Parámetros | Formato | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| elephant-1-mlx-8bit | 9.409.813.744 | MLX safetensors | 8-bit afín, group size 64 | MIT | Hugging Face (0 descargas) |
| baselabs/elephant-1 | no disponible | PyTorch (bf16) | sin cuantizar | MIT | Hugging Face |

No se conocen alternativas de otros autores con la misma interfaz de decisión calibrada en la información disponible.

## Limitaciones y advertencias

- El modelo no genera texto: solo devuelve probabilidades calibradas para opciones predefinidas, lo que limita su uso a tareas de clasificación y decisión.
- Ejecutar los pesos con mlx-lm o mlx-vlm de forma causal altera las probabilidades hasta 0,10; es obligatorio usar el runtime `elephant_mlx.py` o elephant-mlx para obtener resultados fieles.
- La cuantización 8-bit introduce diferencias de hasta 0,0097 frente a los pesos bf16 originales, lo que puede ser relevante en umbrales de decisión ajustados.
- Idiomas soportados: solo inglés según el campo `language` del repositorio.
- No se dispone de información sobre sesgos conocidos, riesgo de alucinación ni limitaciones de contexto del modelo base.
- La licencia MIT permite uso comercial, pero la conversión no está afiliada a Base Labs ni a Baseten; conviene revisar la licencia del modelo base y del runtime `elephant_mlx.py` (Apache-2.0).
- El repositorio tiene 0 descargas y 0 likes, y fue creado recientemente; no hay evidencia de uso en producción ni validación comunitaria.
- El pico de memoria de 11,5 GB puede ser problemático en equipos Apple con 16 GB de memoria unificada si se ejecutan otras aplicaciones simultáneamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/devinliu420/elephant-1-mlx-8bit
- Modelo base: https://huggingface.co/baselabs/elephant-1
- Repositorio del runtime elephant-mlx: https://github.com/dliu99/elephant-mlx
- Detalles de precisión y tests del runtime: https://github.com/dliu99/elephant-mlx#accuracy
