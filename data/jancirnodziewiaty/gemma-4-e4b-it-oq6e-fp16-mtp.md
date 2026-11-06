# jancirnodziewiaty/gemma-4-E4B-it-oQ6e-fp16-mtp

## Resumen

`gemma-4-E4B-it-oQ6e-fp16-mtp` es una cuantizacion mixta del modelo Gemma 4 E4B en su variante instruida, publicada por el usuario jancirnodziewiaty en Hugging Face. El checkpoint se ha generado con la herramienta oQ (oMLX v0.7.3) y esta empaquetado en formato MLX, por lo que esta pensado para ejecutarse en hardware Apple Silicon a traves del framework MLX en lugar de en GPUs NVIDIA o en llama.cpp. El nombre del repositorio condensa las decisiones tecnicas: cuantizacion mixta con predominio de 6 bits (`oQ6e`), componentes en FP16 y una cabeza MTP (multi-token prediction).

El modelo base es Gemma 4 E4B, una variante multimodal de la familia Gemma 4 que, segun el desglose de pesos del checkpoint, integra un modelo de lenguaje de aproximadamente 7.470 millones de parametros, un codificador de vision de unos 167 millones, un codificador de audio de unos 305 millones y una cabeza MTP de 79 millones. El total asciende a 8.019.880.782 parametros, con un tamano de repositorio de 8,3 GB y un promedio efectivo de 8,283 bits por peso.

La relevancia de esta publicacion es practica: ofrece una version lista para inferencia local en Mac con un equilibrio entre calidad y huella de memoria que no se consigue con una cuantizacion uniforme a 4 u 8 bits. Al mantener en mayor precision las capas sensibles (FP32, BF16, 8 bits) y comprimir el grueso de los pesos del transformer a 6 bits, el autor busca preservar el comportamiento del modelo original reduciendo el espacio en disco y en memoria unificada. No obstante, se trata de un artefacto de comunidad sin model card detallada mas alla de las tablas de cuantizacion, sin licencia declarada y sin resultados de evaluacion publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (lenguaje + vision + audio) con cabeza MTP; pesos en formato MLX |
| Parametros totales | 8.019.880.782 (8,020 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 6 bits grupo 64 (83,815 % de los pesos), affine 8 bits grupo 64 (9,308 %), BF16 (0,979 %), FP16 (0,007 %), FP32 (5,888 %), I64 (0,003 %); promedio efectivo 8,283 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`), repo de 8,3 GB |

Desglose de almacenamiento por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 7,469 B | 6,256 GB / 5,826 GiB |
| Vision | 0,167 B | 0,669 GB / 0,623 GiB |
| Audio | 0,305 B | 1,219 GB / 1,136 GiB |
| Cabeza MTP | 0,079 B | 0,159 GB / 0,148 GiB |
| Total | 8,020 B | 8,304 GB / 7,733 GiB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 4 E4B en variante instruida (`-it`), un transformer multimodal que combina un decodificador de lenguaje con torres de vision y audio, tal como refleja el reparto de pesos del checkpoint. La presencia de una cabeza MTP (multi-token prediction) de 79 millones de parametros sugiere que el modelo base incorpora prediccion de varios tokens por paso, una tecnica habitual para acelerar la decodificacion y que en este checkpoint se conserva en BF16 para no degradar su comportamiento.

Sobre el proceso de entrenamiento del modelo original no se aporta informacion en la model card: no se indican volumen de tokens, composicion del dataset, ni si hubo RLHF, DPO o etapas de ajuste fino instruccional mas alla del sufijo `-it`. Lo que si esta documentado es el proceso de cuantizacion: oMLX v0.7.3 aplico cuantizacion de precision mixta con grupos de 64 elementos, asignando 6 bits al 83,8 % de los pesos, 8 bits a cerca del 9,3 % y dejando en FP32, BF16 o FP16 los tensores mas sensibles (normalizaciones, embeddings, cabezas y la propia MTP). El resultado es un checkpoint de 7,733 GiB con 8,283 bits efectivos por peso.

## Capacidades

- Generacion de texto y razonamiento en modo instruido, heredadas del modelo Gemma 4 E4B-it.
- Procesamiento de vision: el checkpoint conserva un codificador visual de 167 millones de parametros, por lo que puede aceptar imagenes como entrada.
- Procesamiento de audio: incluye una torre de audio de 305 millones de parametros.
- Prediccion multi-token (MTP): la cabeza dedicada permite generar varios tokens por paso de decodificacion, lo que puede reducir la latencia en hardware Apple Silicon.
- Conversacion multi-turno: al ser una variante `-it`, esta ajustada para seguir instrucciones y mantener dialogos.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el checkpoint esta en formato MLX y ocupa 7,733 GiB, por lo que un Mac con 16 GB o 24 GB de memoria unificada puede cargarlo y ejecutar conversaciones o tareas de analisis sin depender de la nube. Es el escenario natural para el que se publico esta cuantizacion.
- Asistente de escritorio con entrada multimodal: al conservar las torres de vision y audio, se puede usar para describir imagenes, transcribir o razonar sobre audio y responder en texto dentro de una aplicacion nativa de macOS.
- Prototipado rapido de aplicaciones Gemma 4: sirve para validar prompts, flujos y plantillas de chat antes de pasar a un despliegue en servidor con el modelo completo en BF16, reduciendo el coste de iteracion.
- Generacion de texto asistida en local con requisitos de privacidad: al ejecutarse en el dispositivo, es adecuado para resumir documentos o redactar borradores sobre material que no puede salir de la maquina.
- Evaluacion de tecnicas de cuantizacion mixta: investigadores que comparan oQ frente a otras herramientas (GPTQ, AWQ, bitsandbytes) pueden usar este checkpoint como referencia reproducible de 8,283 bits efectivos.
- Pruebas de decodificacion especulativa con MTP: la cabeza MTP conservada en BF16 permite experimentar con generacion multi-token y medir su impacto en throughput sobre MLX.
- Educacion y demostraciones: un unico archivo de 8,3 GB facilita montar talleres o demos de modelos multimodales en portatiles Apple sin infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta la distribucion de bits y el almacenamiento por componente; no incluye MMLU, HumanEval, GSM8K ni comparaciones con el modelo sin cuantizar.

## Requisitos de hardware

- VRAM/memoria unificada estimada: al menos 8 GB libres para cargar los 7,733 GiB de pesos, mas overhead de KV cache y activaciones; en la practica se recomienda un minimo de 16 GB de memoria unificada.
- Hardware objetivo: Apple Silicon (series M1, M2, M3 y M4), ya que el checkpoint usa la libreria MLX y no es directamente compatible con CUDA.
- GPU NVIDIA: no es el destino de este artefacto; para A100, H100 o RTX 4090 habria que convertir los pesos a otro formato o usar el modelo original.
- Opciones de despliegue: `mlx-lm` y el ecosistema oMLX; no se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles; dependeran del chip Apple, de la longitud de contexto y del uso efectivo de la cabeza MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| gemma-4-E4B-it-oQ6e-fp16-mtp (este) | 8,020 B | no disponible | MLX safetensors, 8,283 bits/peso | no disponible | Cuantizacion mixta de comunidad para Apple Silicon |
| Gemma 4 E4B-it (original) | no disponible en la informacion | no disponible | safetensors BF16 | no disponible | Referencia sin cuantizar; mayor huella de memoria |
| Otras cuantizaciones de Gemma 4 E4B (GGUF, MLX uniforme) | ~8 B | no disponible | GGUF / MLX | segun autor | No se dispone de datos concretos en la informacion proporcionada |

No se dispone de informacion suficiente para comparar rendimiento numerico con alternativas de la misma categoria.

## Limitaciones y advertencias

- Artefacto de comunidad: no lo publica el equipo de Gemma ni Google, sino un usuario independiente, y no cuenta con validacion oficial.
- Licencia no declarada: no se especifica la licencia del checkpoint ni la del modelo base en la informacion disponible; antes de un uso comercial hay que verificar los terminos de Gemma 4 y del autor.
- Sin evaluacion publicada: no hay benchmarks que confirmen cuanto se degrada el modelo respecto al original tras la cuantizacion mixta.
- Dependencia de MLX: los pesos no son directamente utilizables en CUDA, llama.cpp u otros runtimes sin conversion.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; la cuantizacion a 6 bits en el grueso de los pesos puede acentuar errores en tareas de precision.
- Idiomas y contexto: se desconoce la cobertura linguistica y la ventana de contexto efectiva de esta variante.
- Cabeza MTP en BF16: conserva precision, pero anade 0,148 GiB y requiere que el runtime MLX sepa aprovecharla; un uso incorrecto puede no aportar ninguna ganancia.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en produccion ni de soporte por parte del autor.

## Enlaces

- Hugging Face: https://huggingface.co/jancirnodziewiaty/gemma-4-E4B-it-oQ6e-fp16-mtp
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
