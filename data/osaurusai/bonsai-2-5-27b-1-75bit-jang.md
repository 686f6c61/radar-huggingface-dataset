# OsaurusAI/Bonsai-2.5-27B-1.75bit-JANG

## Resumen

Bonsai-2.5-27B-1.75bit-JANG es un paquete de pesos cuantizados publicado por OsaurusAI a partir de `prism-ml/Ternary-Bonsai-2.5-27B-mlx-2bit`, un modelo vision-lenguaje de 27B construido sobre Qwen3.8-27B y distribuido originalmente por Prism ML en formato ternario. La aportacion de este repositorio no es un reentrenamiento, sino un reempaquetado sin perdida: los pesos ternarios se almacenan en 1,75 bits por peso (trits densos con una escala fp16 cada 128 pesos) y se expanden de forma exacta al cargar, de modo que la calidad es identica a la del paquete de origen.

El modelo resuelve el problema de desplegar un VLM de gran tamano en hardware Apple Silicon con un presupuesto de memoria muy reducido: el repositorio ocupa 7,2 GB y los shards de pesos suman 6,688 GiB, lo que permite ejecutar un modelo de 27B con contexto de 262.144 tokens en un equipo de sobremesa con memoria unificada. Incorpora torre de vision en fp16, soporte de imagen y video, modo thinking con `reasoning_effort` configurable, tool calling en formato XML de Qwen3.8 y un cabezal de decodificacion especulativa MTP v2 en 4 bits.

Es relevante ahora porque combina tres tendencias simultaneas: cuantizacion extrema por debajo de 2 bits con verificacion de paridad a nivel de logits, modelos multimodales con contexto de 256K y despliegue local en MLX con decodificacion especulativa integrada. La licencia Apache-2.0 y la verificacion byte a byte de los tensores frente al paquete de referencia facilitan su adopcion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso Qwen3.8-27B vision-lenguaje, 64 bloques (48 GatedDeltaNet + 16 atencion completa) |
| Parametros totales | 6.582.418.160 (segun safetensors del repo; la nomenclatura comercial indica 27B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Ternaria {-s, 0, +s} con grupo de 128 pesos, almacenada a 1,75 bpw (26 bytes + 1 escala fp16 por grupo); torre de vision en fp16; cabezal MTP en 4 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria MLX), shards de 6,688 GiB |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de Qwen3.8-27B adaptado a vision-lenguaje, con 64 bloques de los cuales 48 son GatedDeltaNet y 16 son atencion completa. La torre de vision es la del paquete de Prism ML, en float16 y byte-identica. El modelo incorpora un cabezal de decodificacion especulativa MTP v2 en 4 bits que comparte embedding y cabeza de salida con el modelo principal.

El proceso de este repositorio es un reempaquetado sin perdida: los pesos de lenguaje ternarios de Prism se almacenan como trits densos a 1,75 bits por peso y se expanden exactamente al cargar, aplicando en tiempo de ejecucion una rotacion de Hadamard por bloques (bloque de 1024, con signos explicitos) sobre las activaciones, definida en `hadamard.json`. La model card no documenta el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; esos detalles corresponden al modelo original de Prism ML y no se incluyen en la informacion disponible. La verificacion publicada el 2026-11-24 en un Apple M5 Ultra reporta paridad de argmax de 1.0 en cada posicion sobre 4 prompts, continuaciones greedy identicas, y que los 2.057 tensores de lenguaje y 333 de vision son byte-identicos al paquete de Prism (mas 31 tensores del cabezal MTP).

## Capacidades

- Generacion de texto conversacional y razonamiento con modo thinking activado por defecto y `reasoning_effort` ajustable (`xhigh` por defecto, `medium`, y `low` aceptado aunque se comporta cerca de `xhigh`).
- Comprension de imagenes: descripcion de formas y colores, OCR exacto de texto superpuesto.
- Comprension de video: verificacion con secuencias de fotogramas rojos y azules.
- Tool calling y function calling en formato XML de Qwen3.8 (`qwen3_coder`), con integracion del resultado de la herramienta en la respuesta final.
- Razonamiento agentico multi-paso mediante bloques `<think>` y plantilla de chat de Qwen3.8.
- Contexto largo: recuperacion de un hecho desde un prompt de 10.662 tokens en las pruebas del autor.
- Decodificacion especulativa con el cabezal MTP v2, donde cada borrador se verifica con el modelo completo antes de aceptarse.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Agentes locales en Apple Silicon: el modelo cabe en memoria unificada de un equipo de sobremesa (6,688 GiB de pesos) y soporta tool calling y razonamiento multi-paso, lo que permite construir agentes que ejecutan herramientas y planifican sin salir del portatil.
- Procesamiento de documentos con OCR: la torre de vision en fp16 y la verificacion de OCR exacto sobre texto superpuesto lo hacen adecuado para extraer texto de capturas, formularios escaneados y facturas dentro de un pipeline local.
- Analisis de video de vigilancia o monitorizacion: con soporte de video y 262.144 tokens de contexto puede procesar secuencias de fotogramas y describir eventos a lo largo del tiempo.
- Asistente de codigo con contexto de repositorio: el formato de tool calling `qwen3_coder` y el contexto de 256K permiten inyectar varios ficheros y dejar que el modelo invoque herramientas de busqueda o ejecucion.
- Atencion al cliente con contexto largo: conversaciones multi-turno con historial extenso e imagenes adjuntas (capturas de error, productos) sin truncar el contexto.
- Razonamiento con presupuesto controlado: el ajuste `reasoning_effort` permite alternar entre `xhigh` para tareas de alta precision y `medium` para reducir latencia en produccion.
- Despliegue en Mac Studio o MacBook de gama alta como alternativa a API en la nube: la licencia Apache-2.0 y el formato MLX facilitan el uso comercial sin coste por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card unicamente incluye una tabla de verificacion funcional:

| Prueba | Resultado |
|---|---|
| Paridad de logits frente al loader de referencia de Prism | PASS: acuerdo de argmax 1.0 en cada posicion sobre 4 prompts, continuaciones greedy identicas |
| Integridad de pesos | 2.057 tensores de lenguaje y 333 de vision byte-identicos al paquete de Prism, mas 31 tensores del cabezal MTP |
| Texto, thinking off / on (`medium`) | PASS: `Paris`; bloque think cerrado con `391` |
| Multi-turno | PASS: recuerdo y combinacion exactos de palabras clave |
| Contexto largo | PASS: hecho recuperado desde un prompt de 10.662 tokens |
| Imagen / OCR | PASS: formas y colores; OCR exacto de texto superpuesto |
| Video | PASS: fotogramas rojos y despues azules |
| Tool calling | PASS: llamada `get_weather` emitida y resultado integrado |
| Decodificacion especulativa MTP | PASS con matiz: en 8 repeticiones greedy por prompt, codigo y prosa coinciden exactamente con decodificacion plana; un prompt de historia larga se dividio en un token casi empatado en algunas repeticiones (numericos de verificacion por lotes, no cambio de pesos) |
| Paquete 1,75 bits frente a ternario | PASS: los 402 modulos expandidos y los logits son bit-identicos |

## Requisitos de hardware

- VRAM/memoria unificada estimada: 6,688 GiB de pesos mas overhead de activaciones y cache KV para 262.144 tokens; el repositorio completo ocupa 7,2 GB.
- Entorno de ejecucion obligatorio: Osaurus 1.0.13 o superior, con backend MLX; no es un paquete GGUF ni compatible con llama.cpp u Ollama de forma directa.
- GPU recomendadas: Apple Silicon con memoria unificada; la verificacion se realizo en un Apple M5 Ultra. No hay datos de rendimiento en GPU NVIDIA (A100, H100, RTX 4090) en la informacion disponible.
- Cabe en consumer hardware de Apple: si, en equipos con al menos 16 GB de memoria unificada para contexto moderado; para aprovechar los 262.144 tokens conviene 32 GB o mas.
- Opciones de despliegue: Osaurus (runtime oficial); al ser MLX/safetensors, puede cargarse con la libreria MLX, pero la plantilla, el `hadamard.json` y el cabezal MTP requieren soporte especifico del runtime.
- Latencia y throughput: no disponibles. La decodificacion especulativa MTP puede activarse (On, Adaptive) para acelerar la generacion, con verificacion completa de cada borrador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bonsai-2.5-27B-1.75bit-JANG (este) | 6.582.418.160 (nominal 27B) | 262.144 | Ternaria 1,75 bpw + vision fp16 + MTP 4 bits | Apache-2.0 | MLX / Osaurus |
| prism-ml/Ternary-Bonsai-2.5-27B-mlx-2bit | 27B (nominal) | 262.144 | Ternaria 2 bits | no disponible en la informacion | MLX |
| Qwen3.8-27B (base) | 27B (nominal) | no disponible | Original en precision completa | no disponible en la informacion | no disponible en la informacion |

No se dispone de datos de benchmarks que permitan comparar rendimiento cualitativo entre estas variantes; la unica comparacion documentada es de equivalencia exacta: los logits y los 402 modulos expandidos del paquete de 1,75 bits son bit-identicos a los del paquete ternario de Prism.

## Limitaciones y advertencias

- Dependencia estricta del runtime: requiere Osaurus 1.0.13 o superior; no funciona con llama.cpp, Ollama ni vLLM segun la informacion disponible.
- La cuantizacion ternaria a 1,75 bpw, aunque verificada como sin perdida frente al paquete de Prism, hereda cualquier degradacion que el modelo ternario original presente frente al Qwen3.8-27B en precision completa; no se publican comparativas de calidad.
- El modo thinking esta activado por defecto y aumenta la latencia y el consumo de tokens; es necesario ajustar `reasoning_effort` a `medium` para reducir coste.
- La decodificacion especulativa MTP puede introducir divergencias en tokens casi empatados en prompts largos, segun la propia verificacion del autor.
- Riesgo de alucinacion: no se documentan evaluaciones de factualidad ni tasas de alucinacion.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles; no se puede garantizar calidad fuera de los idiomas del modelo base.
- La licencia Apache-2.0 permite uso comercial, pero el aviso NOTICE.txt atribuye los pesos a Prism ML y debe conservarse.
- El numero de parametros reportado por safetensors (6.582.418.160) no coincide con la nomenclatura comercial de 27B; conviene verificar el conteo real antes de planificar recursos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/OsaurusAI/Bonsai-2.5-27B-1.75bit-JANG
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-mlx-2bit
- Perfil del autor: https://huggingface.co/OsaurusAI
- Sitio del runtime: https://osaurus.ai
