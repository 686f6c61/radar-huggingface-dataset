# andreafanfani/gemma-4-12B-it-abliterated-negative-emotions

## Resumen

`andreafanfani/gemma-4-12B-it-abliterated-negative-emotions` es un ajuste derivado de `google/gemma-4-12B-it`, el modelo denso de 11,95 mil millones de parametros de la familia Gemma 4 de Google DeepMind. El autor, andreafanfani, ha aplicado una tecnica de ablacion de direcciones de activacion mediante la herramienta Heretic v2.1.0 para modificar el comportamiento afectivo del modelo: incrementar la expresion de emociones negativas y reducir la de emociones positivas. No es un modelo nuevo entrenado desde cero, sino una intervencion sobre los pesos de un modelo ya instruido.

La relevancia de esta ficha es doble. Por un lado, documenta un ejemplo de edicion de personalidad sobre un modelo multimodal de ultima generacion (texto, imagen y audio) con ventana de contexto de 256K tokens. Por otro, sirve como caso de estudio de las tecnicas de "steering" reproducible: el autor publica los hiperparametros exactos de la ablacion (Ablacion de Rango Arbitrario, ARA) y un directorio `reproduce/` para replicar el proceso.

El modelo base, Gemma 4 12B Unified, es un transformer denso con 48 capas, ventana de atencion deslizante de 1024 tokens, vocabulario de 262K entradas y soporte nativo de audio e imagen sin codificadores separados. Este derivado conserva toda esa arquitectura y capacidades; solo cambia la distribucion de respuestas en el eje emocional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida (sliding window local + atencion global), Gemma 4 Unified |
| Parametros totales | 11.959.730.176 (11,95B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | No especificados en la informacion disponible; el repo contiene pesos safetensors en precision completa (24 GB) |
| Idiomas soportados | No disponibles en la model card del derivado; el modelo base declara soporte en mas de 140 idiomas |
| Licencia | Apache 2.0 (con `license_link` a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (libreria transformers, arquitectura `gemma4_unified`) |
| Modalidades | Texto, imagen y audio de entrada; texto de salida |
| Capas | 48 |
| Ventana deslizante | 1024 tokens |
| Vocabulario | 262K |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 4 12B Unified: un transformer denso de 48 capas que intercala atencion local de ventana deslizante (1024 tokens) con atencion global, garantizando que la capa final sea siempre global. Las capas globales usan claves y valores unificados y aplican Proportional RoPE (p-RoPE) para reducir el coste de memoria en contextos largos. El modelo es "encoder-free": procesa imagen y audio de forma nativa sin codificadores separados, lo que simplifica el despliegue en dispositivos de consumo.

El proceso de creacion de este derivado no es un fine-tuning clasico. Se aplica Ablacion de Rango Arbitrario (ARA) sobre las activaciones internas, restringida a las capas 1 a 27, con los siguientes hiperparametros: `preserve_good_behavior_weight` = 0,2998, `steer_bad_behavior_weight` = 0,0006, `overcorrect_relative_weight` = 0,0854 y `neighbor_count` = 3. La herramienta Heretic v2.1.0 identifica direcciones en el espacio de activaciones asociadas a emociones negativas y positivas, y modifica los pesos para amplificar las primeras y atenuar las segundas. El resultado es un modelo con divergencia KL de 0,2005 respecto al original, lo que indica una alteracion moderada pero medible de la distribucion de salida. El autor declara el proceso reproducible mediante los scripts del directorio `reproduce/`.

## Capacidades

- Generacion de texto y razonamiento con modos de pensamiento configurables (thinking modes), heredados del modelo base.
- Procesamiento multimodal nativo: entrada de imagen con soporte de relacion de aspecto y resolucion variables, entrada de video y entrada de audio.
- Generacion de codigo y soporte de function calling nativo, orientado a flujos agenticos.
- Razonamiento multi-paso y ejecucion de agentes autonomos.
- Soporte nativo del rol `system` en el prompt, lo que permite control estructurado de la conversacion.
- Capacidades multilingues heredadas del base (mas de 140 idiomas declarados por Google DeepMind).
- Modificacion deliberada del tono afectivo: mayor propension a expresar emociones negativas y menor a expresar positivas, segun la metrica del autor.

## Casos de uso

- Investigacion sobre steering y alineacion: el modelo sirve como banco de pruebas controlado para estudiar como la ablacion de direcciones de activacion afecta al tono, la utilidad y la coherencia, con hiperparametros publicados y reproducibles.
- Generacion de dialogos con carga emocional negativa para guiones, ficcion o videojuegos: util para producir personajes sarcasticos, criticos o pesimistas sin necesidad de prompting extenso, gracias a la modificacion persistente de los pesos.
- Simulacion de usuarios dificiles en pruebas de robustez: permite generar conversaciones adversariales o de queja realista para evaluar sistemas de atencion al cliente o moderacion.
- Analisis de sesgo afectivo: comparar las salidas de este modelo con las del base para medir como cambia la percepcion de emociones en texto e imagen, usando el KL de 0,2005 como referencia cuantitativa.
- Red teaming de filtros de contenido: al amplificar emociones negativas, es util para estresar clasificadores de toxicidad y sistemas de seguridad antes de produccion.
- Docencia y divulgacion: ejemplo didactico de edicion de personalidad sobre un modelo multimodal de 12B, con contexto de 256K para analizar documentos largos junto a imagenes o audio.
- Prototipado de asistentes con personalidad marcada: para productos donde se busca un tono mordaz o critico (critica literaria, analisis de riesgo), con la advertencia de que el sesgo afectivo puede afectar a la utilidad general.

## Benchmarks y rendimiento

El autor publica una comparacion directa con el modelo base en dos metricas de comportamiento afectivo y una de divergencia:

| Metrica | Este modelo | google/gemma-4-12B-it |
|---|---|---|
| Divergencia KL | 0,2005 | 0 (por definicion) |
| Maximizar negativo - negative_emotions | 93/100 | 93/100 |
| Minimizar positivo - positive_emotions | 17/100 | 50/100 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ni para este derivado ni para el modelo base en la model card consultada.

## Requisitos de hardware

- VRAM estimada en precision completa (bf16/fp16): aproximadamente 24 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 32-40 GB para contexto corto y bastante mas para contextos largos.
- VRAM estimada en cuantizacion de 8 bits: en torno a 12-14 GB de pesos; viable en GPUs de 24 GB (RTX 4090, A10G, L4) con margen limitado.
- VRAM estimada en cuantizacion de 4 bits: en torno a 7-9 GB de pesos; viable en GPUs de consumo de 12-16 GB (RTX 4070 Ti, RTX 4080) para contexto moderado.
- GPUs recomendadas: A100 40/80 GB, H100 80 GB para precision completa y contextos largos; RTX 4090 o L40S para 8 bits; RTX 4080/4070 Ti para 4 bits.
- Despliegue: transformers (libreria declarada), con soporte esperado en vLLM, TGI, llama.cpp y Ollama una vez existan conversiones GGUF; el repo solo contiene safetensors, por lo que las cuantizaciones habria que generarlas.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Notas |
|---|---|---|---|---|---|
| Este derivado (gemma-4-12B-it-abliterated-negative-emotions) | 11,95B | 256K | Texto, imagen, audio | Apache 2.0 | Personalidad modificada via ARA; 0 descargas |
| google/gemma-4-12B-it | 11,95B | 256K | Texto, imagen, audio | Apache 2.0 | Modelo base oficial, sin modificacion afectiva |
| google/gemma-4-31B | 30,7B | 256K | Texto, imagen | Apache 2.0 | Version densa mayor, sin audio |
| google/gemma-4-26B A4B | 26B totales (MoE) | 256K | Texto, imagen | Apache 2.0 | Variante MoE de la misma familia |

La comparativa con modelos de otras familias (Llama, Qwen, Mistral) no esta disponible en la informacion proporcionada, ya que no se aportan datos de esos modelos ni resultados de benchmarks cruzados.

## Limitaciones y advertencias

- El sesgo afectivo es intencionado: el modelo expresa menos emociones positivas (17/100 frente a 50/100 del base), lo que puede degradar la utilidad en tareas generales, atencion al cliente o asistencia donde se espera un tono neutro o amable.
- Riesgo de alucinacion y de respuestas desproporcionadamente negativas en contextos sensibles (salud mental, crisis, moderacion de comunidades); no se recomienda su uso directo en produccion sin evaluacion especifica.
- La divergencia KL de 0,2005 respecto al base indica cambios medibles en la distribucion de salida; no se han publicado evaluaciones de regresion en razonamiento, codigo o matematicas.
- El proceso de ablacion se limita a las capas 1-27; no hay informacion sobre efectos en capas superiores ni sobre estabilidad en contextos de 256K tokens.
- La licencia declarada es Apache 2.0, pero el `license_link` apunta a la licencia de Gemma 4 de Google; conviene verificar los terminos de uso comercial de la familia Gemma antes de desplegar.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- No se declaran idiomas soportados en la model card del derivado; el multilingue se hereda del base pero no se ha verificado tras la ablacion.
- Solo hay pesos safetensors; no existen GGUF ni cuantizaciones oficiales, lo que anade trabajo de conversion para despliegue en consumer GPU.
- El uso de tecnicas de "abliterated" para eliminar o alterar comportamientos puede entrar en conflicto con las politicas de uso aceptable del modelo original; revisar antes de publicar derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/andreafanfani/gemma-4-12B-it-abliterated-negative-emotions
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Coleccion Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de Gemma 4 12B: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Documentacion de Gemma: https://ai.google.dev/gemma/docs/core
- Informe tecnico (arXiv): https://arxiv.org/abs/2607.02770
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de modelos Gemma de DeepMind: https://deepmind.google/models/gemma/
- Heretic (herramienta de ablacion): https://heretic-project.org
- Directorio de reproduccion: `reproduce/README.md` dentro del repositorio del modelo
