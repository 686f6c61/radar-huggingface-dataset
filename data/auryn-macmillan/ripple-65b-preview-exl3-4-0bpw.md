# auryn-macmillan/Ripple-65B-Preview-EXL3-4.0bpw

## Resumen

Ripple-65B-Preview-EXL3-4.0bpw es una cuantizacion EXL3 (trellis, 4.0 bits por peso en el cuerpo) del modelo denso Ripple-65B-Preview de ricursiveAI, producida por auryn-macmillan con exllamav3 1.6.6 y una rama propia (`feat/ricursive`) sobre 5 GPU RTX 3090. El checkpoint ocupa 33,3 GB en 4 shards y esta pensado exclusivamente para inferencia con exllamav3 o TabbyAPI; no es compatible con transformers, vLLM ni llama.cpp.

El modelo base es un transformer denso de 80 capas, 5120 de dimension oculta y 40960 de FFN, con 80 cabezas de atencion Q y 8 KV (head_dim 128), vocabulario OLMo de 100352 tokens y un limite posicional de 2M. Incorpora un patron de atencion hibrido 4:1 entre ventana deslizante de 1024 tokens y atencion global sin RoPE (NoPE), bloques PeriNorm estilo Gemma-3N, atencion con puerta sigmoide, RMSNorm Q/K por cabeza, SwiGLU con clamp ±20 y un mecanismo aprendido de value residual por capa.

La relevancia de esta ficha es doble: por un lado, demuestra que un modelo de 65B denso puede servirse a 4.0 bpw en 4× RTX 3090 con contexto efectivo de hasta 245K tokens verificados por needle test; por otro, ilustra las dependencias no estandar que introduce el value residual, que obliga a usar un fork de exllamav3 y descarta todo el ecosistema de inferencia convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `RicursiveForCausalLM` (transformer denso, atencion hibrida sliding-window/global NoPE, PeriNorm, value residual por capa) |
| Parametros totales | 16.662.331.472 (segun safetensors del checkpoint cuantizado; el modelo base se describe como 65B denso) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 2M posiciones en el modelo base; 262.144 tokens configurados en el perfil de servicio; needle verificado a 245K |
| Tipos de cuantizacion | EXL3 4.0 bpw cuerpo, 6 bpw `lm_head`, 16 bpw embeddings; calibracion 250 filas x 2048 columnas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (EXL3, requiere exllamav3 con soporte `RicursiveForCausalLM`) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 80 capas con 5120 de hidden, 40960 de FFN, 80 cabezas Q y 8 KV con head_dim 128, vocabulario OLMo de 100352 tokens y limite posicional de 2M. La atencion combina un patron 4:1 de ventana deslizante de 1024 tokens con atencion global sin codificacion posicional rotatoria (NoPE), lo que reduce el coste de atencion en secuencias largas. Emplea bloques PeriNorm al estilo Gemma-3N, atencion con puerta sigmoide, RMSNorm de Q y K por cabeza, activacion SwiGLU con clamp a ±20 y escalado de embeddings por raiz de 5120.

La innovacion mas distintiva es el value residual aprendido por capa (`value_res_lambda`): una mezcla con puerta sigmoide del embedding de la capa 0 escalado hacia el tensor V, de modo que solo la componente V recibe `lerp(seed, normed_hidden, sigmoid(lambda))`. Esta ruta no existe en exllamav3 1.6.6 upstream; el fork `feat/ricursive` la implementa, propaga la semilla de embedding de la capa 0 durante la calibracion y desactiva la atencion BC en los modulos con value residual. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional y continuacion de contexto largo (hasta 262.144 tokens configurados, con needle test correcto a 245K).
- Razonamiento aritmetico basico verificado en las pruebas del autor (`17*23` devuelve `391`).
- Generacion de codigo: produjo una funcion de Fibonacci iterativa correcta con tests en la prueba de calidad del autor.
- Recuperacion de informacion en contextos muy largos (needle-in-a-haystack a 128K y 245K con chunk 2048 y 4096 respectivamente).
- Soporte multi-turno con cache de prefijo: TTFT de 17,2 s en frio que baja a 1,46 s y 1,51 s en los dos turnos siguientes en una sesion de 12K.
- Capacidades multilingues: no disponible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible.
- Decodificacion especulativa: el drafter DFlash2 nativo de 4B existe pero no se adjunta a este perfil por su baja aceptacion (3-6 %).

## Casos de uso

- Analisis de documentos extensos: el modelo mantiene coherencia hasta 245K tokens verificados, por lo que puede procesar contratos, informes anuales o bases de codigo completas en una sola pasada sin troceado, algo critico cuando la respuesta depende de informacion dispersa a lo largo del documento.
- Asistente de codigo sobre repositorios medianos: con 128K de contexto y generacion de codigo verificada, puede recibir varios modulos y tests en el mismo prompt y producir parches coherentes con el estilo del proyecto.
- Atencion al cliente multi-turno: la cache de prefijo reduce el TTFT de 17,2 s a 1,46 s en turnos posteriores, lo que hace viable un asistente conversacional con system prompt e historial largos en un solo servidor de 4 GPU.
- Servicio self-hosted en hardware de gama alta consumer: 4× RTX 3090 con 18,5 GB por tarjeta y 4,3-6,6 GB libres permiten desplegar el modelo via TabbyAPI con `max_seq_len` de 262.144 y `max_batch_size` de 8, sin depender de A100/H100.
- Procesamiento por lotes de resumenes largos: con 8 streams concurrentes y 94,6 T/s agregados a 2K de contexto, es adecuado para pipelines offline de resumen o extraccion sobre lotes de documentos.
- Investigacion sobre atencion hibrida y value residual: al ser un checkpoint abierto con arquitectura no convencional, sirve para estudiar el impacto del value residual aprendido y del patron 4:1 sliding-window/global en tareas de recuperacion a larga distancia.
- Evaluacion de cuantizacion EXL3 a 4 bpw: el autor documenta que a 4.0 bpw no observa dano evidente en pruebas de coherencia, codigo y needle, lo que lo convierte en referencia para estudiar la degradacion de EXL3 en modelos densos de 65B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor solo reporta pruebas cualitativas de calidad y mediciones de rendimiento de inferencia:

| Forma de peticion | T/s por stream | Decodificacion agregada | TTFT p50 / max |
|---|---:|---:|---|
| 2K x 1 | 20,5 | 20,5 | 3,4 s |
| 2K x 8 | 11,8 | 94,6 | 21,3 s |
| 12K x 1 | 19,9 | 19,9 | 17,1 s |
| 12K x 8 | 8,3 | 66,4 | 121,1 / 148,8 s |
| 49K x 1 | 19,6 | 19,6 | 55,7 s |
| 49K x 2 | 15,9 | 31,7 | 150,9 s |
| 128K needle | 22,5 | 22,5 | 235,5 s (chunk 2048) |
| 245K needle | 18,9 | 18,9 | 495,6 s (chunk 4096) |

Medido en 4× RTX 3090 con Threadripper PRO 3975WX y 247 GB de RAM, con `cache_mode: Q4`, `max_batch_size: 8`, `chunk_size: 4096` y `gpu_split: [19.0, 19.0, 19.0, 19.0]`. El prefill es el coste serializado: chunk 4096 redujo el TTFT de 49K de 76,0 s a 55,7 s (27 %) y el de 12K de 18,1 s a 17,1 s; chunk 8192 no carga. Tiempo de carga: 24 s en caliente, 34 s en frio.

## Requisitos de hardware

- VRAM estimada: aproximadamente 18,5 GB por tarjeta en la configuracion probada de 4× RTX 3090, con 4,3-6,6 GB libres por GPU. El checkpoint ocupa 33,3 GB en disco repartidos en 4 shards.
- GPU recomendadas: 4× RTX 3090 es la configuracion validada por el autor. No se han documentado pruebas con A100, H100, RTX 4090 ni configuraciones de 2 o 3 GPU.
- Cabe en consumer GPU: si, en 4× RTX 3090 (24 GB cada una). No se ha verificado en una sola GPU consumer ni en 2× 24 GB.
- Opciones de despliegue: exclusivamente exllamav3 (rama `feat/ricursive` del fork de auryn-macmillan) o TabbyAPI sobre esa rama. No es compatible con transformers, vLLM ni llama.cpp.
- Latencia y throughput: 20,5 T/s por stream a 2K x 1, 94,6 T/s agregados a 2K x 8, TTFT de 3,4 s a 2K y 495,6 s a 245K con chunk 4096. La decodificacion especulativa con DFlash2 no se usa por su aceptacion del 3-6 % a este bitrate.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones verificables de los modelos comparables en la informacion proporcionada, por lo que la comparativa se limita a los datos conocidos del checkpoint y a las alternativas de despliegue:

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| Ripple-65B-Preview-EXL3-4.0bpw | 65B denso (16,66B en safetensors del checkpoint) | 2M nativo, 262.144 configurado | Apache 2.0 | EXL3, solo exllamav3 fork / TabbyAPI | Value residual requiere fork; no compatible con vLLM ni llama.cpp |
| Ripple-65B-Preview (base) | 65B denso | 2M | Apache 2.0 | Pesos originales (formato no detallado) | Referencia upstream de esta cuantizacion |
| DFlash2 drafter (nativo 4B) | 4B | no disponible | no disponible | EXL3 4.0 bpw | Aceptacion 3-6 % a este bitrate; no adjunto al perfil |

## Limitaciones y advertencias

- Dependencia de un fork no estandar: el value residual no existe en exllamav3 1.6.6 upstream; sin la rama `feat/ricursive` el checkpoint no carga. Esto rompe la portabilidad y complica las actualizaciones.
- Incompatibilidad total con transformers, vLLM y llama.cpp, lo que excluye su uso en la mayoria de stacks de produccion estandar y en entornos serverless gestionados.
- El drafter DFlash2 no se adjunta: a 4.0 bpw su aceptacion es del 3-6 %, insuficiente para acelerar la decodificacion de forma fiable.
- El prefill es el cuello de botella: TTFT de 495,6 s a 245K y de 121,1 s a 12K x 8. Para cargas interactivas con prompts largos y concurrencia alta, la latencia puede ser prohibitiva.
- La cuantizacion a 4 bpw puede degradar tareas no cubiertas por las pruebas del autor (solo se verificaron Fibonacci, una multiplicacion y un needle); no hay evaluacion sistematica de calidad.
- No hay informacion sobre sesgos, idiomas soportados ni comportamiento multilingue; no se puede asumir cobertura mas alla del ingles sin validacion.
- Riesgo de alucinacion no cuantificado: no se han publicado evaluaciones de factualidad ni de calibracion.
- La licencia Apache 2.0 del checkpoint y del modelo base permite uso comercial, pero el fork de exllamav3 necesario debe revisarse por separado antes de desplegar en produccion.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.

## Enlaces

- Checkpoint en Hugging Face: https://huggingface.co/auryn-macmillan/Ripple-65B-Preview-EXL3-4.0bpw
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Fork de exllamav3 con soporte `feat/ricursive`: https://github.com/auryn-macmillan/exllamav3
- TabbyAPI: https://github.com/theroyallab/tabbyAPI
- Receta de conversion: `recipe/ripple-4.0bpw.yaml` dentro del repositorio del checkpoint
- Model card upstream: `UPSTREAM_README.md` dentro del repositorio del checkpoint
