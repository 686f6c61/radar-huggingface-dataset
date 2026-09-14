# prathamkode/particle-2.0

## Resumen

Particle 2.0 es un modelo de chat compacto de aproximadamente 109,5 millones de parametros, desarrollado por el usuario prathamkode y publicado en HuggingFace bajo licencia MIT. No es un ajuste fino de Llama, SmolLM ni de ningun otro checkpoint publico: esta entrenado desde inicializacion aleatoria con una arquitectura decoder-only de estilo Llama (RoPE, SwiGLU, RMSNorm), 12 capas, dimension oculta de 768 y 12 cabezas de atencion. Esta version 2.0 parte de un entrenamiento adicional ("further train") sobre Particle 1.0 seguido de un ajuste supervisado (SFT) con una mezcla de datos nueva que no se ha publicado.

Su relevancia es acotada y muy concreta: sirve como caso de estudio reproducible de entrenamiento desde cero a escala ~100M, un regimen donde el coste de entrenamiento es bajo y el checkpoint es lo bastante pequeno como para inspeccionarlo, cuantizarlo y ejecutarlo en CPU o en cualquier GPU de consumo. El contexto de 2048 tokens, el tokenizador BPE propio de 32k entradas y el hecho de que solo soporte ingles lo sitúan claramente en el terreno de la investigacion y las demostraciones, no en el de la produccion.

El autor es explicito al respecto: el modelo no esta pensado como asistente de produccion, ni como fuente de hechos, ni como modelo de codigo, y no ha recibido ajuste de preferencias (sin RLHF ni DPO). La adopcion publica es practicamente nula en la fecha de consulta (0 descargas, 1 like), sin benchmarks publicados ni validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (RoPE, SwiGLU, RMSNorm) |
| Parametros totales | 109.529.856 (~109,5 M) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No se publican pesos cuantizados oficiales. Los pesos estan en `bfloat16` (safetensors); se pueden cuantizar externamente a GGUF (Q8/Q5/Q4) o a 8/4 bits, sin versiones oficiales verificadas |
| Idiomas soportados | Ingles (`en`); centrico en ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (`bfloat16`) |
| Capas | 12 |
| Dimension oculta | 768 |
| Cabezas de atencion | 12 (dimension por cabeza: 64) |
| Tokenizador | BPE byte-level propio, vocabulario de 32.000 entradas |
| Precision de referencia | `bfloat16` |
| Tamano del repositorio | 0,2 GB |
| Pipeline | `text-generation` |
| Libreria | transformers |
| Fecha de publicacion | 2026-09-14 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso con el bloque canonico de Llama: normalizacion RMSNorm, activacion SwiGLU en la MLP y embeddings posicionales rotatorios (RoPE). El modelo tiene 12 capas con dimension oculta 768 y 12 cabezas de atencion (64 dimensiones por cabeza), y usa un tokenizador BPE byte-level propio con vocabulario de 32.000 entradas. La ventana de contexto es de 2048 tokens, coherente con modelos de esta escala. Particle 2.0 usa la misma arquitectura que Particle 1.0 y, segun el autor, se ha entrenado desde inicializacion aleatoria: no deriva de pesos de Llama, SmolLM ni de otro checkpoint publico.

En cuanto al entrenamiento, la model card describe un entrenamiento adicional de Particle 1.0 seguido de un ajuste supervisado sobre una mezcla de datos nueva. La composicion de esa mezcla no se ha publicado y tampoco se indica el numero total de tokens vistos, la proporcion de datos sinteticos o la procedencia del corpus. El autor afirma explicitamente que no hay ajuste de preferencias (ni RLHF, ni DPO), por lo que el comportamiento del modelo proviene unicamente del preentrenamiento y del SFT. No se declara ninguna innovacion tecnica destacable: sin decodificacion especulativa, sin atencion lineal, sin modo de razonamiento, sin mezcla de expertos.

## Capacidades

- Generacion de texto conversacional en ingles con plantilla de chat (`apply_chat_template` con roles `user`/`assistant`/`system`).
- Soporte de generacion determinista y con muestreo a traves de `model.generate` de transformers (el ejemplo oficial usa `do_sample=False`).
- Conversaciones cortas de un solo turno o de pocos turnos dentro del limite de 2048 tokens.
- Tareas de formato sencillo por prompting (respuestas de una frase, etiquetado simple), siempre con validacion posterior.
- Inspeccion y experimentacion sobre pesos: al ser un checkpoint pequeno con tokenizador propio, es util para estudiar representaciones y comportamiento a escala reducida.
- No soporta tool calling ni function calling.
- No soporta agentes, planificacion multi-paso ni razonamiento encadenado fiable.
- No tiene capacidades de vision, audio ni multimodalidad.
- No es un modelo de codigo: el propio autor lo desaconseja para esa tarea.
- Capacidades multilingues: solo ingles; el resto de idiomas no estan soportados de forma declarada.
- No dispone de modo "thinking" ni de razonamiento explicito separado de la respuesta.

## Casos de uso

- Investigacion sobre entrenamiento desde cero a escala ~100M: el checkpoint sirve como punto de partida o de comparacion en experimentos de curricula, mezclas de datos, eleccion de tokenizador y ajustes de arquitectura, con un coste de computo muy bajo por ejecucion.
- Pruebas de humo de infraestructura de inferencia: validar que un endpoint de text-generation-inference, un servidor vLLM o un despliegue Ollama funcionan correctamente con un modelo de 109,5 M de parametros antes de pasar a modelos mayores.
- Docencia y material didactico: al tener 12 capas, 768 dimensiones ocultas y un tokenizador de 32k entradas, permite recorrer de principio a fin un transformer estilo Llama real y ejecutarlo en un portatil, algo inviable con modelos de miles de millones de parametros.
- Experimentos de cuantizacion y despliegue en el borde: convertir los pesos a GGUF y medir el impacto de Q8/Q5/Q4 en calidad y latencia sobre CPU, Raspberry Pi o dispositivos moviles, en un rango de memoria de pocos cientos de megabytes.
- Evaluacion de alucinacion y calibracion en modelos pequenos: usar sus respuestas como linea base para estudiar autocontradiccion y confabulacion a baja capacidad, un fenomeno util de medir antes de escalar.
- Generacion de datos sinteticos a escala de juguete: producir candidatos para tareas de clasificacion o formato simple que despues se filtran manualmente, sin integrar nunca la salida directamente en un producto.
- Pruebas de interoperabilidad de plantillas de chat: comprobar como distintos frameworks (transformers, TGI, vLLM, llama.cpp) interpretan la plantilla de chat del modelo y donde se rompe el formato.
- Interpretabilidad y probing: su tamano permite entrenar sondas lineales, analizar cabezas de atencion y estudiar embeddings con recursos modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, HellaSwag ni de ninguna otra evaluacion, y el autor no menciona comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- Pesos en `bfloat16`: aproximadamente 219 MB (109,5 M de parametros x 2 bytes).
- Cache KV a 2048 tokens y lote 1 en `bfloat16`: aproximadamente 75 MB (2 x 12 capas x 12 cabezas x 64 dimensiones por cabeza x 2048 tokens x 2 bytes).
- Huella total estimada en inferencia `bfloat16`, lote 1, contexto completo: en torno a 0,3 GB, incluyendo overhead del runtime.
- Pesos en `float32`: aproximadamente 438 MB; con cache KV en `float32` (unos 151 MB) la huella ronda los 0,6 GB.
- Cabe en cualquier GPU de consumo actual: RTX 3060, RTX 4060, RTX 4090, e incluso GPUs con 4 GB o menos. No requiere GPU dedicada: funciona en CPU, en GPU integrada y en placas como Raspberry Pi 5.
- GPU recomendadas: ninguna es necesaria por memoria. A100, H100 o L40S solo tienen sentido si se busca throughput agregado con muchas peticiones concurrentes o lotes grandes, no por requisitos de VRAM.
- Opciones de despliegue: `transformers` (via de referencia documentada), text-generation-inference (el repositorio lleva la etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM para servir con batching continuo, y llama.cpp u Ollama tras convertir los safetensors a GGUF (no hay GGUF oficial publicado).
- Latencia y throughput: no disponible. No hay mediciones publicadas de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento de Particle 2.0 ni de sus alternativas. La tabla siguiente compara solo caracteristicas verificables de catalogo (tamano, contexto, licencia y disponibilidad de pesos); las cifras de rendimiento se marcan como no disponibles en todos los casos.

| Modelo | Parametros | Contexto | Licencia | Pesos abiertos | Benchmarks publicados en esta ficha |
|---|---|---|---|---|---|
| Particle 2.0 | 109,5 M | 2048 tokens | MIT | Si (safetensors, bf16) | No disponible |
| SmolLM-135M | 135 M | 2048 tokens | Apache-2.0 | Si | No disponibles en la informacion proporcionada |
| Qwen2.5-0.5B | 494 M | 32.768 tokens | Apache-2.0 | Si | No disponibles en la informacion proporcionada |
| TinyLlama-1.1B | 1.100 M | 2048 tokens | Apache-2.0 | Si | No disponibles en la informacion proporcionada |

Nota: los datos de SmolLM-135M, Qwen2.5-0.5B y TinyLlama-1.1B provienen de sus catalogos publicos y no se han verificado con la informacion suministrada para esta ficha. Frente a ellos, las diferencias objetivas de Particle 2.0 son su licencia MIT (mas permisiva que Apache-2.0 en cuanto a requisitos de atribucion) y su contexto de 2048 tokens, muy inferior al de Qwen2.5-0.5B para casos de documentos largos. Como modelo entrenado desde cero y sin benchmarks, no hay evidencia que permita situarlo por encima o por debajo de estas alternativas en calidad.

## Limitaciones y advertencias

- Capacidad reducida: el propio autor senala debilidad en razonamiento, contexto largo y uso de herramientas.
- Alucinacion y autocontradiccion: la model card advierte de que el modelo puede inventar hechos y contradecirse dentro de una misma conversacion.
- Solo ingles: comportamiento en otros idiomas no garantizado ni documentado.
- Sin ajuste de preferencias (ni RLHF ni DPO): mayor probabilidad de salidas mal formateadas, poco utiles o inapropiadas, sin alineacion con instrucciones complejas.
- Uso desaconsejado en produccion: el autor lo excluye explicitamente como asistente de produccion, como fuente de hechos y como modelo de codigo.
- Contexto de 2048 tokens: insuficiente para documentos largos, resumen de informes extensos o conversaciones multiturno con historial amplio.
- Dataset de entrenamiento no publicado: no es posible auditar composicion, licencias de los datos, sesgos ni contaminacion de benchmarks.
- Adopcion practicamente nula (0 descargas, 1 like en la fecha de consulta) y ausencia de benchmarks: sin validacion independiente ni evidencia de calidad.
- Licencia MIT: permite uso comercial y modificacion con atribucion y sin garantia alguna; no impone restricciones adicionales, pero tampoco ofrece soporte ni mantenimiento.
- Tokenizador propio de 32k entradas: el comportamiento fuera del ingles o en dominios tecnicos (codigo, notacion cientifica) no esta documentado y puede ser ineficiente.
- Riesgo de incompatibilidad de la plantilla de chat entre frameworks: al no haber una especificacion publicada mas alla del ejemplo con `apply_chat_template`, distintos servidores pueden generar prompts diferentes y alterar el comportamiento.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/prathamkode/particle-2.0
- Particle 1.0 (modelo predecesor, misma arquitectura): https://huggingface.co/prathamkode/particle-1.0
- La busqueda web realizada no devolvio resultados relevantes para este modelo: las unicas entradas recuperadas fueron enlaces generales a YouTube, sin relacion con Particle 2.0. No se han encontrado papers, blogs, repositorios ni demos adicionales.
