# LibertAIDAI/deem-0.6-v1

## Resumen

Deem 0.6B (v1) es un modelo de decision —no de generacion de texto abierta— publicado por LibertAI (organizacion LibertAIDAI) bajo licencia Apache-2.0. Parte de un fine-tune completo de Qwen3-0.6B-Base y se distribuye con pesos en safetensors y un runtime propio escrito en Rust. Su funcion es leer un estado (una politica, un contrato, un ticket o una pregunta) y devolver una decision estructurada: una eleccion entre 2 y 255 opciones, una puntuacion ordinal segun rubrica, o un si/no con posibilidad de abstenerse. Todo en un solo forward pass, sin streaming ni generacion token a token.

El modelo tiene 596.049.920 parametros reales (unos 0,6B) y esta disenado explicitamente para inferencia en CPU: segun el autor, ocupa aproximadamente 0,7 GB residentes en la ruta int8 y resuelve decisiones cortas en unos 65 ms en un escritorio con carga. No requiere GPU, lo que lo situa en el nicho de runners de CI, equipos de borde, portatiles y micro-VMs serverless. El repositorio ocupa 1,2 GB.

Es relevante ahora porque propone un enfoque distinto al de los LLM generativos: en lugar de producir texto libre, entrega decisiones tipadas y calibradas con metricas de hold-out verificadas, y lo hace con un binario estatico sin dependencias de Python ni C++ en tiempo de ejecucion. El autor ademas compara este 0.6B con una variante de 0.8B (presumiblemente basada en un sucesor con atencion lineal), senalando que el modelo menor obtiene mejores resultados en la suite estandar y en JevBench hard con un 25 % menos de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (Qwen3), atencion densa, sin atencion lineal |
| Parametros totales | 596.049.920 (~0,6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el autor menciona estados de ~3.000 tokens como caso de prueba) |
| Tipos de cuantizacion | bf16 e int8 (rutas soportadas por el runtime Rust) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repositorio tambien compatible con el runtime `deem`) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-0.6B-Base, un transformer decoder con atencion densa. La model card senala explicitamente que el sucesor Qwen3.5 hibrida atencion lineal, mientras que esta base mantiene atencion densa, y argumenta que esa eleccion beneficia al fine-tune de "letter-slot" propio de Deem. El entrenamiento consistio en un fine-tune completo sobre la mezcla verificada de Deem: 124.765 filas compuestas por anclas, leyes exactas, politica, tiempo de trabajo y trazas de verificacion. Despues se aplico un delta de ventana temporal con 6.000 ejemplos de `windowgen` y 15.000 de replay, con tasa de aprendizaje 1e-5. La receta se declara Apache-2.0.

La innovacion tecnica principal no esta en el modelo sino en el runtime que lo acompana: un unico binario estatico en Rust con kernels AVX-512 escritos a mano para GEMM en bf16 (`vdpbf16ps`) e int8 (`vpdpbusd`). El autor indica que el runtime esta validado contra torch con una diferencia maxima de logits de 0,080 en bf16 y 0,125 en int8 sobre una puerta de tolerancia de 0,35. El servidor es compatible a nivel de cable con el endpoint `/v1/systemone`, de modo que puede sustituir directamente al SDK TypeSafe. No se menciona RLHF ni DPO; el proceso descrito es supervision sobre datos verificados y un ajuste posterior de ventana temporal.

## Capacidades

- Decision tipada: eleccion entre 2 y 255 opciones, puntuacion ordinal por rubrica, o si/no con abtencion.
- Razonamiento sobre leyes exactas: conteo (0,988), rejilla (0,992) y conteo cero (1,000) de precision.
- Razonamiento sobre ventanas temporales: corte nitido de 30/31 dias y sumas de consistencia de 1,000, equivalente al modelo de 9B segun el autor.
- Clasificacion de politica de larga duracion: 94,5 % de exactitud en el hold-out de politicas largas.
- Salida calibrada: macro de 0,7533 en la suite estandar, que sube a 0,7622 tras calibracion.
- Inferencia en CPU sin GPU, con latencias de 65 ms en decisiones cortas y 1,9 s en estados de ~3.000 tokens.
- Integracion como servicio: endpoint `/v1/systemone` compatible con el SDK TypeSafe.
- No se documentan capacidades de generacion libre, vision, audio, tool calling ni agentes multi-paso en la informacion disponible.

## Casos de uso

- Enrutamiento de peticiones: el modelo puede decidir a que cola, agente o sistema derivar una consulta entre 2 y 255 opciones, con un solo forward pass y latencia de decenas de milisegundos, lo que lo hace apto para routers de entrada en arquitecturas multi-agente.
- Triaje de tickets de soporte: dado el texto de una incidencia, devuelve una categoria tipada y una puntuacion de severidad, con salida estructurada en lugar de texto libre, lo que simplifica el consumo desde sistemas posteriores.
- Evaluacion de politicas y contratos: con un 94,5 % de exactitud en hold-out de politicas largas, encaja en la validacion de cumplimiento o en la aplicacion de reglas sobre documentos extensos.
- Guardarrailes y moderacion con abtencion: la posibilidad de responder si/no con abstenerse permite marcar casos ambiguos para revision humana en lugar de forzar una decision binaria.
- Computo de plazos y ventanas temporales: gracias al corte nitido de 30/31 dias y a las sumas de consistencia de 1,000, sirve para decidir si un evento cae dentro de una ventana contractual o administrativa.
- Puntuacion ordinal con rubrica: util en evaluacion de respuestas, priorizacion de leads o clasificacion de riesgo por niveles, ya que devuelve una puntuacion calibrada en lugar de una etiqueta plana.
- Despliegue en runners de CI y equipos de borde: al ser un binario Rust estatico con ~0,7 GB residentes en int8, puede ejecutarse donde no hay GPU disponible, por ejemplo en validaciones automatizadas dentro de un pipeline.
- Micro-VMs serverless: el arranque sin dependencias de Python ni C++ reduce el tiempo de arranque en frio, adecuado para funciones que necesitan una decision puntual bajo demanda.

## Benchmarks y rendimiento

| Benchmark | deem-0.6-v1 | Referencia indicada (0.8B) |
|---|---|---|
| Exactitud hold-out de politicas largas | 94,5 % | no disponible |
| Macro suite estandar | 0,7533 | 0,7455 |
| Macro suite estandar (calibrada) | 0,7622 | no disponible |
| JevBench publico easy | 97,9 | no disponible |
| JevBench publico original | 73,6 | no disponible |
| JevBench publico hard | 40,5 | 33,3 |
| Ley exacta - counting | 0,988 | no disponible |
| Ley exacta - grid | 0,992 | no disponible |
| Ley exacta - zero-count | 1,000 | no disponible |
| Brier de leyes exactas (Tare board) | 0,0289 | no disponible |
| Sumas de consistencia temporal | 1,000 | no disponible |
| Latencia decision corta (int8, CPU con carga) | 65 ms | no disponible |
| Latencia estado de ~3.000 tokens (int8, CPU con carga) | 1,9 s | no disponible |
| Memoria residente (int8) | ~0,7 GB | no disponible |

## Requisitos de hardware

- Inferencia en CPU: es el modo de despliegue previsto. No requiere GPU.
- Memoria residente: aproximadamente 0,7 GB en la ruta int8. El repositorio de pesos ocupa 1,2 GB.
- GPU recomendadas: no aplica; no se documentan requisitos de GPU. Podria ejecutarse en GPU mediante el stack de PyTorch, pero el autor no lo contempla como via principal.
- Cabe en cualquier equipo de consumo: portatiles, mini-PC y equipos de escritorio con CPU moderna. Los kernels AVX-512 requieren una CPU que soporte dicha extension.
- Opciones de despliegue: binario Rust `deem-server` (servidor incluido en el repositorio), compatible a nivel de cable con `/v1/systemone`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencias declaradas: 65 ms en decisiones cortas y 1,9 s en estados de ~3.000 tokens, medidas en la ruta int8 sobre un escritorio con carga. No se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| deem-0.6-v1 | 596.049.920 | no disponible | Decision tipada en CPU | Apache-2.0 | HuggingFace `LibertAIDAI/deem-0.6-v1` |
| deem-9b-v1 | no disponible (peso del repo 17,9 GB) | no disponible | Misma familia Deem, mayor tamano | Apache-2.0 | HuggingFace `LibertAIDAI/deem-9b-v1` |
| Qwen3-0.6B-Base | ~0,6B | no disponible en esta ficha | LLM generativo base | Apache-2.0 | HuggingFace `Qwen/Qwen3-0.6B-Base` |
| Referencia 0.8B citada por el autor | ~0,8B | no disponible | LLM base con atencion lineal (sucesor Qwen3.5) | no disponible | no disponible |

Comparado con el modelo base Qwen3-0.6B-Base, deem-0.6-v1 no busca generar texto, sino producir decisiones estructuradas calibradas y con abtencion; en ese sentido no es un sustituto directo, sino un fine-tune especializado. Frente a la variante de 0.8B citada en la model card, el autor sostiene que el 0.6B es superior en la suite estandar (0,7533 frente a 0,7455) y en JevBench hard (40,5 frente a 33,3) con un 25 % menos de parametros. No hay datos comparativos publicados frente a otros modelos de decision o clasificacion fuera de la familia Deem.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan. El modelo no publica analisis de sesgo ni composicion demografica del dataset de entrenamiento.
- Riesgo de alucinacion: reducido por diseno, ya que la salida es una decision tipada y no texto libre; no obstante, una decision incorrecta sigue siendo posible y la calibracion solo se verifica en la suite interna del autor.
- Limitacion de alcance: no genera texto abierto, no hace tool calling ni razonamiento multi-paso segun la informacion disponible. Se limita a elegir, puntuar o decidir si/no.
- Cobertura idiomatica desconocida: la model card no especifica idiomas soportados, y el entrenamiento se describe sobre una mezcla no detallada linguisticamente.
- Contexto no especificado: la model card no declara la longitud de contexto efectiva; solo menciona estados de ~3.000 tokens como referencia de latencia.
- Dependencia de AVX-512: los kernels del runtime estan escritos para AVX-512, lo que puede excluir CPUs mas antiguas o ciertos procesadores ARM.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero conviene verificar el cumplimiento de las condiciones del modelo base Qwen3-0.6B-Base, tambien Apache-2.0 segun el autor.
- Metrica minima de adopcion: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validacion externa es practicamente nula.
- Reproducibilidad: el autor afirma que todos los benchmarks son reproducibles a partir de los artefactos de release del repositorio Git; conviene ejecutarlos de forma independiente antes de usarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LibertAIDAI/deem-0.6-v1
- Repositorio GitHub: https://github.com/Libertai/deem
- Variante de 9B: https://huggingface.co/LibertAIDAI/deem-9b-v1
- Pagina de modelos del autor: https://huggingface.co/LibertAIDAI/models
- Perfil del autor: https://huggingface.co/LibertAIDAI
- LibertAI Labs: https://labs.libertai.io/
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Ficha de la variante 9B en Hugging Bay: https://huggingbay.xyz/artifact/hf-model-libertaidai-deem-9b-v1
