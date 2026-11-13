# nicopingu/Qwen3.8-27B-MLX-4bit-GPTQ

## Resumen

Qwen3.8-27B-MLX-4bit-GPTQ es una cuantizacion de 4 bits del modelo Qwen/Qwen3.8-27B, publicada por el usuario nicopingu. A diferencia de la cuantizacion estandar de mlx-community, que emplea redondeo al vecino mas cercano (RTN), esta version aplica GPTQ (Generacion de Cuantizacion Consciente del Segundo Orden) capa por capa sobre las 64 capas del decodificador de texto, manteniendo intactos el torre de vision, los embeddings y la cabeza de salida. El resultado es un checkpoint de 15 GB en formato MLX affine 4-bit con grupo de 64 y escalas en bf16, totalmente intercambiable con el checkpoint de mlx-community.

El modelo base es un transformer multimodal de 27.356.728.560 parametros (unos 27,36 mil millones) con capacidad image-text-to-text, es decir, acepta imagenes y texto como entrada. La cuantizacion busca reducir la perdida de calidad respecto al checkpoint de 8 bits sin cambiar el formato ni el tamano del archivo, de modo que cualquier herramienta que lea checkpoints MLX 4-bit de mlx-community (mlx-lm, mlx-vlm) puede cargarlo sin modificaciones.

Su relevancia radica en que demuestra una mejora medible y sustancial en divergencia KL (del orden del 30 % menos en texto general y hasta un 60 % menos en dialogos de llamada a funciones) sobre la cuantizacion RTN equivalente, con el mismo coste de memoria y velocidad de decodificacion. Esta pensado para ejecucion local en Apple Silicon, en particular en equipos con 64 GB de memoria unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con decodificador de texto de 64 capas; tipo qwen3_5 |
| Parametros totales | 27.356.728.560 (unos 27,36 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine 4-bit, group size 64, escalas bf16 (cuantizacion GPTQ sobre 1.488 tensores del decodificador de texto) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), tamano del repo 16,1 GB; checkpoint de 15 GB |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer multimodal orientado a image-text-to-text, con un decodificador de texto de 64 capas y un torre de vision separado. El checkpoint aqui publicado no reentrena el modelo: solo recuantiza las 64 capas del decodificador de texto (1.488 tensores) mediante GPTQ secuencial capa por capa, partiendo del checkpoint de 8 bits desquantizado capa a capa. Cada capa se calibra sobre las salidas de las capas ya cuantizadas. La matriz hessiana H = XᵀX se calcula en float32 con un amortiguamiento del 5 % de la media diagonal, bloques de 64 columnas y la misma actualizacion por columna que `mlx_lm/quant/gptq.py`. La salida se mantiene en el layout estandar MLX affine 4-bit / grupo 64.

La calibracion emplea 262.144 tokens (256 secuencias de 1.024) repartidos a partes iguales entre cuatro fuentes publicas: ingles (wikitext-2 train), frances (Wikipedia 20231101.fr), codigo (codeparrot/github-code-clean) y dialogos de llamada a funciones (glaiveai/glaive-function-calling-v2). El autor documenta que un primer intento calibrado solo con documentacion tecnica y codigo redujo la KL un 43 % en ese dominio pero la empeoro un 23 % en ingles general, lo que demuestra el sobreajuste de un conjunto de calibracion estrecho; el conjunto variado corrige ese problema. El proceso se ejecuto en un Mac Studio M1 Ultra de 64 GB con MLX 0.32.3 y mlx-lm 0.32.0, en aproximadamente 2 horas para las 64 capas.

## Capacidades

- Generacion de texto conversacional y continuacion de texto en ingles, frances y otros idiomas (la lista completa de idiomas no esta disponible).
- Procesamiento de imagenes y texto combinados (pipeline image-text-to-text), gracias al torre de vision copiado sin cambios del checkpoint de 4 bits de mlx-community.
- Generacion de codigo y finalizacion de codigo en Python y otros lenguajes, con perdida de calidad reducida frente a la cuantizacion RTN segun las metricas de KL del autor.
- Llamada a funciones y salida estructurada en formato de tool-call: es el dominio donde la cuantizacion GPTQ reporta la mayor ventaja (KL 0,400 frente a 0,994 de RTN, y 88,6 % frente a 75,4 % de coincidencia top-1).
- Razonamiento y respuesta a preguntas sobre documentacion tecnica.
- Inferencia local en Apple Silicon mediante mlx-lm (solo texto) y mlx-vlm (texto e imagen).
- No se documentan capacidades de audio ni modos de pensamiento explicito en la informacion disponible.

## Casos de uso

- Asistente de codigo en local para desarrolladores con Mac: cargar el checkpoint con mlx-lm y usarlo para autocompletar y explicar funciones Python, aprovechando que la cuantizacion GPTQ reduce la divergencia en codigo a 0,0200 de KL frente a 0,0286 de RTN.
- Servidor de inferencia compatible con OpenAI y Anthropic en Apple Silicon: el autor ejecuta el modelo con PLI (servidor de inferencia Apache-2.0 para Apple Silicon, fork de TensorFold), de modo que se puede exponer una API local a herramientas existentes sin cambiar el formato del checkpoint.
- Automatizacion de llamadas a funciones y agentes: el modelo conserva mejor que la version RTN la estructura de las salidas de tool-call (88,6 % de coincidencia top-1 frente a 75,4 %), lo que lo hace adecuado para pipelines que encadenan herramientas y requieren JSON valido.
- Procesamiento de documentos con imagen y texto: al mantener el torre de vision intacto, sirve para tareas de extraccion de informacion de capturas, diagramas o documentos escaneados combinados con instrucciones textuales.
- Analisis de codigo y revision de repositorios: con 15 GB de pesos cabe en equipos de 64 GB de memoria unificada, lo que permite indexar y resumir repositorios completos sin depender de la nube.
- Prototipado multilingue en frances e ingles: la calibracion incluye textos en frances de Wikipedia, con una KL de 0,0195 frente a 0,0297 de RTN, adecuada para tareas de redaccion y traduccion asistida en esos idiomas.
- Evaluacion comparativa de tecnicas de cuantizacion: sirve como referencia practica para investigadores que quieran medir el impacto de GPTQ frente a RTN en un modelo de 27B sobre Apple Silicon.

## Benchmarks y rendimiento

El autor no ejecuto benchmarks de tarea final (MMLU, HumanEval, GSM8K, etc.). La unica evaluacion publicada es la divergencia KL contra el checkpoint de 8 bits (mlx-community/Qwen3.8-27B-8bit) sobre el vocabulario completo, con media sobre 8.192 tokens por texto, junto con la tasa de coincidencia top-1.

| Texto | KL RTN 4-bit | KL GPTQ (este modelo) | Top-1 RTN / GPTQ |
|---|---:|---:|---:|
| Documentacion tecnica y codigo Python (independiente del set de calibracion) | 0,0484 | 0,0333 (-31 %) | 91,6 % / 93,2 % |
| Ingles, wikitext-2 test | 0,0386 | 0,0268 (-30 %) | 90,6 % / 92,5 % |
| Frances, articulos de Wikipedia | 0,0297 | 0,0195 (-34 %) | 91,7 % / 93,1 % |
| Codigo, archivos de GitHub (repos no incluidos en calibracion) | 0,0286 | 0,0200 (-30 %) | 95,8 % / 96,5 % |
| Dialogos de llamada a funciones (formato glaive) | 0,994 | 0,400 (-60 %) | 75,4 % / 88,6 % |

Advertencias del propio autor: la referencia es el checkpoint de 8 bits, no bf16 (bf16 no cabe junto al conjunto de prueba en una maquina de 64 GB), por lo que las perdidas reales frente a bf16 son ligeramente mayores en ambos modelos. Los textos en ingles, frances, codigo y llamada a funciones provienen de las mismas fuentes que el conjunto de calibracion, aunque de documentos distintos, por lo que esas ganancias son algo favorables; la primera fila es completamente independiente de los datos de calibracion.

## Requisitos de hardware

- VRAM/memoria: el checkpoint ocupa 15 GB en disco y el repo 16,1 GB; en memoria unificada se necesita espacio adicional para el contexto y el torre de vision, por lo que se recomienda un equipo con al menos 32 GB y, de forma realista, 64 GB para trabajar con comodidad.
- GPU recomendadas: Apple Silicon con memoria unificada; el autor lo probo en un Mac Studio M1 Ultra de 64 GB. No se documenta soporte para GPU NVIDIA ni CUDA.
- Cabe en GPU de consumo: si, en equipos Apple Silicon de gama alta (M1/M2/M3/M4 Max o Ultra) con 32-64 GB o mas de memoria unificada; no esta pensado para GPUs discretas de consumo.
- Opciones de despliegue: mlx-lm (solo texto), mlx-vlm (texto e imagen) y PLI, el servidor de inferencia compatible con OpenAI y Anthropic del propio autor. Cualquier servidor que cargue checkpoints MLX 4-bit de mlx-community deberia cargarlo sin cambios.
- Latencia y throughput: no medidos de forma separada. El autor indica que, al ser identico el layout y los kernels, la velocidad de decodificacion deberia ser la misma que la del checkpoint mlx-community/Qwen3.8-27B-4bit, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nicopingu/Qwen3.8-27B-MLX-4bit-GPTQ | 27,36 B | MLX 4-bit GPTQ, grupo 64 | no disponible | Apache-2.0 | Hugging Face (0 descargas) |
| mlx-community/Qwen3.8-27B-4bit | 27,36 B (mismo base) | MLX 4-bit RTN, grupo 64 | no disponible | Apache-2.0 (heredada del base) | Hugging Face |
| mlx-community/Qwen3.8-27B-8bit | 27,36 B (mismo base) | MLX 8-bit | no disponible | Apache-2.0 (heredada del base) | Hugging Face |
| Qwen/Qwen3.8-27B | 27,36 B | bf16 (original) | no disponible | Apache-2.0 | Hugging Face |

La comparacion directa con alternativas de otros fabricantes no esta disponible en la informacion proporcionada. Frente a las tres variantes del mismo modelo base, la diferencia medible es la menor divergencia KL de la version GPTQ respecto a RTN, con el mismo tamano y formato que la version de 4 bits de mlx-community.

## Limitaciones y advertencias

- La evaluacion se limita a divergencia KL contra el checkpoint de 8 bits; no hay benchmarks de tarea final (MMLU, HumanEval, GSM8K), por lo que el rendimiento real en tareas concretas no esta verificado.
- La referencia de 8 bits no es bf16: las perdidas reales frente al modelo original son mayores que las reportadas para ambos checkpoints cuantizados.
- Cuatro de las cinco filas de la tabla de resultados usan documentos de las mismas fuentes que el conjunto de calibracion, lo que puede inflar ligeramente las ganancias; solo la fila de documentacion tecnica y codigo Python es plenamente independiente.
- La cuantizacion a 4 bits introduce perdida de calidad inevitable frente a bf16; el dominio de llamada a funciones sigue siendo el mas afectado en terminos absolutos (KL 0,400, coincidencia top-1 del 88,6 %).
- No se dispone de informacion sobre sesgos, riesgo de alucinacion, idiomas soportados ni longitud de contexto del modelo base en la informacion proporcionada.
- El modelo esta empaquetado exclusivamente para MLX y Apple Silicon; no es utilizable en CUDA, ROCm ni otras plataformas sin reconversion.
- La licencia Apache-2.0 se hereda del modelo base; el autor no anade restricciones adicionales, pero conviene verificar los terminos del modelo Qwen original para uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion de la comunidad.
- La velocidad de decodificacion no se ha medido de forma independiente; la afirmacion de paridad con el checkpoint RTN es una expectativa del autor, no un dato verificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nicopingu/Qwen3.8-27B-MLX-4bit-GPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint MLX 4-bit de referencia (RTN): https://huggingface.co/mlx-community/Qwen3.8-27B-4bit
- Checkpoint MLX 8-bit de referencia: https://huggingface.co/mlx-community/Qwen3.8-27B-8bit
- Servidor de inferencia PLI: https://github.com/nicopingu/pli
- Dataset de calibracion, ingles (wikitext-2): https://huggingface.co/datasets/Salesforce/wikitext
- Dataset de calibracion, frances (Wikipedia 20231101.fr): https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset de calibracion, codigo (github-code-clean): https://huggingface.co/datasets/codeparrot/github-code-clean
- Dataset de calibracion, llamada a funciones (glaive-function-calling-v2): https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
