# slm4apps/slm4blender-0.5b-GGUF

## Resumen

SLM4Blender-0.5B es un modelo de lenguaje pequeno (0,5B) especializado en la generacion y edicion de escenas de Blender mediante llamadas a herramientas (tool calling). Lo desarrolla el proyecto slm4apps y se distribuye en formato GGUF para su uso con llama.cpp. Su proposito es traducir peticiones en lenguaje natural a secuencias de invocaciones de las 26 herramientas de Blender sobre las que fue entrenado, permitiendo construir escenas 3D de forma conversacional y completamente offline.

El modelo parte de Qwen2.5-Coder-0.5B-Instruct (licencia Apache-2.0) y se afina mediante dos etapas LoRA de rango 8: una primera para construccion de escenas y una segunda para edicion. La version por defecto fusiona ambas en un unico archivo q8_0. Segun el autor, funciona en un Mac de 8 GB con un consumo aproximado de 0,58 GB de memoria, unos 0,6 s por respuesta y 1,3 s de carga en frio.

Se trata de un lanzamiento temprano (v0.1): aproximadamente 1 de cada 5 peticiones produce una escena totalmente correcta y 3 de cada 4 producen una escena utilizable. Es relevante ahora como ejemplo de modelo ultraespecializado y ligero que demuestra que un SLM puede operar como capa de control de una aplicacion de escritorio compleja sin conexion ni GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-Coder-0.5B-Instruct) con dos adaptadores LoRA de rango 8 |
| Parametros totales | 2.932.736 (safetensors); el modelo base Qwen2.5-Coder-0.5B es de ~0,5B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Entrenado con filas de hasta 2.048 tokens; recomendado servir con 4.096 |
| Tipos de cuantizacion | q8_0, q4_k_m (y LoRA en f16) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); LoRA en GGUF f16 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en Qwen2.5-Coder-0.5B-Instruct. Sobre esa base se aplican dos etapas de LoRA de rango 8: una primera LoRA de construccion (7 capas lineales mas embeddings, fusionada en los pesos) y una segunda LoRA de edicion (7 capas lineales, capas 8-23, fusionada en el archivo por defecto). Los datos de entrenamiento son conversaciones de solo texto con llamadas a herramientas; no se usaron imagenes ni codigo de Blender.

La salida sigue el formato estandar de tool call de Qwen (`{"name": ..., "arguments": ...}`), por lo que cualquier host compatible con las herramientas de Qwen puede controlarlo, por ejemplo `llama-server --jinja`. El modelo fue entrenado sobre un conjunto fijo de 26 herramientas de Blender; con otros conjuntos de herramientas no funciona bien. No se mencionan tecnicas como decodificacion especulativa o atencion lineal en la informacion disponible.

## Capacidades

- Generacion de escenas de Blender a partir de una peticion en lenguaje natural, mediante invocacion de herramientas.
- Edicion de escenas existentes (fusionando la LoRA de edicion en el archivo por defecto).
- Soporte de tool calling en el formato estandar de Qwen (`{"name": ..., "arguments": ...}`).
- Cobertura de modos de escena: objeto unico, animacion, arrays/rings, parenting, geometry nodes, edicion y escenas multiparte.
- Funcionamiento completamente offline en hardware modesto (Mac de 8 GB, 0,58 GB de memoria).
- Idioma: unicamente ingles.
- No es un asistente conversacional: sin el array `tools` en la peticion responde con texto predefinido.

## Casos de uso

- Generacion automatizada de escenas 3D en Blender: el modelo traduce una peticion de texto a una secuencia de tool calls que construyen la escena, adecuado para prototipado rapido y entornos sin conexion.
- Edicion de escenas existentes: con el archivo por defecto (edit LoRA fusionada), permite modificar objetos, jerarquias o parametros de una escena ya creada mediante instrucciones en lenguaje natural.
- Integracion en pipelines de herramientas de escritorio: al emitir el formato estandar de tool call de Qwen, puede conectarse a hosts como `llama-server --jinja` y servir como capa de control de una aplicacion nativa.
- Despliegue en hardware de gama baja: con 0,58 GB de memoria y ~0,6 s por respuesta, es viable en portatiles y Macs de 8 GB sin GPU dedicada.
- Generacion de escenas con geometry nodes y arrays/rings: cubre modos especificos de Blender donde la construccion manual es repetitiva, automatizando la creacion de patrones y jerarquias.
- Asistente de creacion offline para estudios pequenos: permite construir escenas basicas sin depender de servicios en la nube ni de GPU, con el coste de calidad asociado a un modelo de 0,5B.
- Modo strict-pass para flujos con validacion: servir el modelo base q8_0 con la LoRA a escala 0,7 reduce las regresiones totalmente incorrectas cuando se prioriza la precision sobre la cobertura.

## Benchmarks y rendimiento

Resultados declarados por el autor en el benchmark interno SLM4Blender de 180 peticiones (pass % = totalmente correcto; usable % = correcto o corregible con pequenos ajustes):

| Variante | pass % | usable % | edicion usable (de 30) | construccion usable (de 120) |
|---|---|---|---|---|
| Por defecto: edit fusionada, q8_0 | 19,4 | 77,2 | 26 | 94 (78,3%) |
| Strict: base + LoRA @0,7 | 23,9 | 68,9 | 24 | 82 (68,3%) |
| Base sola, q8_0 | 21,7 | 68,9 | 14 | 87 (72,5%) |
| q4_k_m + edit LoRA @1,0 | 20,0 | 79,4 | 26 | 96 (80,0%) |

Resultados externos declarados: 3DCodeBench 212/212 escenas ejecutadas; BFCL v4 simple (python) 49,25%.

## Requisitos de hardware

- Memoria estimada: aproximadamente 0,58 GB en la variante q8_0 por defecto.
- Carga en frio: aproximadamente 1,3 s; latencia de aproximadamente 0,6 s por respuesta.
- Cabe en hardware de consumo: el autor lo ejecuta en un Mac de 8 GB; la variante q4_k_m es un 25% mas pequena.
- GPU dedicada: no se especifican modelos de GPU recomendados (A100, H100, RTX 4090) en la informacion disponible; el modelo esta pensado para ejecucion local en CPU/Mac.
- Despliegue: llama.cpp (`llama-server --jinja`), con soporte de LoRA en tiempo de ejecucion (`--lora`, `--lora-scaled`). No se mencionan vLLM, TGI u Ollama.
- Throughput: no disponible mas alla de la latencia por respuesta indicada.

## Comparativa con modelos similares

No se han publicado comparativas con modelos alternativos en la informacion disponible. Como referencia, el modelo base Qwen2.5-Coder-0.5B-Instruct (Apache-2.0) es la unica alternativa documentada, pero no es un modelo especializado en tool calling para Blender.

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| SLM4Blender-0.5B | ~0,5B | 2.048 entrenamiento / 4.096 servicio | Tool calling para Blender (26 herramientas) | Apache-2.0 |
| Qwen2.5-Coder-0.5B-Instruct | ~0,5B | no disponible | Codigo y chat general | Apache-2.0 |
| Alternativas especializadas en Blender | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo temprano: se esperan fallos, especialmente en escenas multiparte (el modo mas debil) y en peticiones largas.
- Direccion multi-turno debil: en conversaciones donde el usuario corrige al modelo, este suele dejar de actuar tras el primer seguimiento; las peticiones de un solo turno funcionan mejor.
- Solo conoce las 26 herramientas con las que fue entrenado; con otros conjuntos de herramientas adivina.
- No es un asistente conversacional: sin el array `tools` en la peticion responde con texto predefinido; siempre hay que enviar el payload de herramientas.
- La cuantizacion degrada la calidad: q4_k_m es mas pequeno pero mediblemente peor.
- Idioma limitado al ingles.
- Riesgo de alucinacion en la seleccion de herramientas y argumentos, derivado del tamano reducido del modelo.
- No afiliado, respaldado ni soportado por la Blender Foundation; "Blender" es una marca registrada de la Blender Foundation.
- Licencia Apache-2.0 para codigo y pesos, con base Qwen2.5-Coder-0.5B-Instruct tambien Apache-2.0.

## Enlaces

- Hugging Face: https://huggingface.co/slm4apps/slm4blender-0.5b-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
- Documentacion de servicio (`SERVE.md`): incluida en el repositorio del modelo
- Benchmark publico SLM4Blender: en preparacion segun el autor (no disponible)
- Paper, blog o demo adicionales: no disponible
