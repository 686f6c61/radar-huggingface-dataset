# NovaeonStudio/Qwen3.8-35B-A3B-Distill-Heretic-oQ6-fp16-mtp

## Resumen
Qwen3.8-35B-A3B-Distill-Heretic-oQ6-fp16-mtp es una variante ajustada en comportamiento del modelo empero-ai/Qwen3.8-35B-A3B-Distill, publicada por Novaeon.Studio. Se trata de un modelo MoE de la familia Qwen3.5/3.6 con 35.951.822.704 parametros totales y aproximadamente 3.000 millones de parametros activos, disenado para ejecutarse sobre Apple Silicon mediante la libreria MLX y el motor oMLX. El autor aplica una edicion de pesos post-entrenamiento (LoRA de rango 50 fusionada en el checkpoint original) orientada a reducir el rechazo de peticiones por parte del modelo base, preservando la cabeza MTP nativa y la torre de vision.

El modelo resuelve un problema concreto: el comportamiento de seguridad por defecto del modelo base resulta demasiado restrictivo para investigacion, ficcion y trabajo de seguridad ofensiva/defensiva legitima. Segun la model card, la sonda de 100 prompts de seguridad pasa de 98/100 rechazos en el original a 2/100 en esta variante, con una divergencia KL de 0,248 frente al base. La cuantizacion oQ6 de oMLX deja el repositorio en unos 31 GB en disco, con un peso efectivo de aproximadamente 6,9 bits por peso.

Es relevante ahora porque ofrece un punto intermedio de memoria para Macs de 48-64 GB, manteniendo la cabeza MTP funcional (42 tensores `mtp.*` preservados) que otras variantes del mismo tamano descartaron, lo que segun el autor provoca una decodificacion aproximadamente 2,5 veces mas lenta. El contexto nativo es de 262.144 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE de la familia Qwen3.5/3.6 (tag `qwen3_5_moe`), hibrida GatedDeltaNet + atencion completa, con encoder de vision |
| Parametros totales | 35.951.822.704 |
| Parametros activos | ~3B (256 expertos, 8 enrutados) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | oMLX oQ6 (group size 64, escalas y pesos no cuantizados en float16, ~6,9 bpw efectivos). Existen variantes oQ8 y oQ4 del mismo autor; oQ2 fue construida y descartada |
| Idiomas soportados | Ingles (unico idioma declarado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria MLX) |
| Capas | 40 (10 de atencion completa con 2 cabezas KV) |
| Cabeza MTP | Nativa, 42 tensores `mtp.*` preservados |
| Tamano del repositorio | 31,0 GB |
| RAM recomendada | 48 GB o mas |
| Motor de inferencia | oMLX (Apple MLX) |

## Arquitectura y entrenamiento
La arquitectura es un transformer MoE hibrido: 40 capas que combinan GatedDeltaNet con atencion completa (solo 10 capas de atencion completa, con 2 cabezas KV, lo que supone unos 20 KB por token de cache KV). El modelo cuenta con 256 expertos de los que se enrutan 8 por token, dando lugar a unos 3.000 millones de parametros activos sobre 35.951.822.704 totales. Incluye un encoder de vision, por lo que el pipeline declarado es `image-text-to-text`. El modelo base es una destilacion de profesores Qwen3.8 hacia Qwen3.6-35B-A3B.

El ajuste de comportamiento se realizo mediante una busqueda sobre 60 ensayos (20 con inicializacion aleatoria) aplicados a las proyecciones de salida de atencion: 30 `out_proj` de GatedDeltaNet y 10 `o_proj`. El ensayo elegido (capas 20-34) alcanzo 2/100 rechazos en la sonda de seguridad con KL 0,2481 frente al base, re-medida en 0,28 tras la fusion y cuantizacion. Se trata de una edicion direccional de pesos post-entrenamiento (LoRA de rango 50 fusionada), no de un reentrenamiento completo. La cabeza MTP nativa se conserva intacta y acelera la decodificacion; segun el autor, desactivarla reduce el rendimiento de decodificacion en torno a un 35%.

## Capacidades
- Generacion de texto conversacional y de ficcion, con modo de pensamiento (`enable_thinking`) activable para razonamiento complejo.
- Tool calling y function calling: la suite interna del autor mantiene 11/11 en esta categoria tras la edicion de pesos.
- Salida estructurada en JSON: 5/5 en la suite interna.
- Seguimiento de instrucciones multi-turno y contexto largo: agujas en contexto de 20-50k tokens resueltas 4/4.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`, torre de vision preservada).
- Capacidades multilingues limitadas: el unico idioma declarado es ingles; la suite interna incluye 4 casos en aleman con 3/4 de exito.
- Decodificacion especulativa mediante cabeza MTP nativa con profundidad adaptativa.
- Capacidad de abtencion (reconocer que no sabe): 3/3 en la suite interna.

## Casos de uso
- Investigacion sobre seguridad y alineamiento: el modelo permite estudiar como una edicion direccional de pesos altera la tasa de rechazo (de 98/100 a 2/100) con un coste medible en capacidad, util para analizar la relacion entre comportamiento protector y rendimiento.
- Escritura de ficcion y narrativa: con temperatura 0,7 y top_p 0,95 el autor lo recomienda para trabajo creativo, incluyendo humor negro, dialogos con lenguaje soez o monologos de villano que el modelo base rechazaria.
- Analisis de documentos largos: los 262.144 tokens de contexto nativo permiten procesar contratos, informes o codebases completas en una sola pasada, con 4/4 en pruebas de agujas en contexto largo.
- Evaluacion privada de modelos: sirve como banco de pruebas para comparar recetas de cuantizacion (oQ4, oQ6, oQ8) sobre el mismo checkpoint, ya que el autor publica que oQ4 empata con oQ8 en su suite (36/43 frente a 36/43).
- Redaccion tecnica y generacion de codigo en entornos controlados: mantiene 2/4 en la categoria de codigo de la suite interna, adecuado para borradores y prototipos, no para codigo critico sin revision.
- Despliegue local en Mac de 48-64 GB: con unos 31 GB en disco y 48 GB de RAM recomendados, permite servir un endpoint compatible con OpenAI en `http://127.0.0.1:8000/v1` para uso personal o de equipo pequeno.
- Destilacion y generacion de datos sinteticos: por su velocidad (112-122 tok/s en decodificacion corta sobre M5 Max) y su contexto largo, es util para producir grandes volumenes de texto de entrenamiento.

## Benchmarks y rendimiento

Suite interna del autor (43 casos deterministas) y suite de mitigacion (17 casos), medidas sobre Apple M5 Max de 128 GB con oMLX y pensamiento desactivado:

| Categoria | oQ8 original | oQ8 editado | oQ6 editado | oQ4 editado |
|---|---|---|---|---|
| Tool calling | 11/11 | 11/11 | 11/11 | 11/11 |
| JSON | 5/5 | 5/5 | 5/5 | 5/5 |
| Seguimiento de instrucciones | 6/6 | 5/6 | 5/6 | 5/6 |
| Aleman | 4/4 | 3/4 | 3/4 | 3/4 |
| Agujas en contexto largo | 4/4 | 4/4 | 4/4 | 4/4 |
| Razonamiento (sin thinking) | 3/6 | 2/6 | 2/6 | 2/6 |
| Abtencion | 3/3 | 3/3 | 3/3 | 3/3 |
| Codigo | 4/4 | 3/4 | 2/4 | 3/4 |
| Total | 40/43 | 36/43 | 35/43 | 36/43 |
| Suite de mitigacion | 16/17 | 14/17 | 12/17 | 14/17 |

Rendimiento medido (M5 Max 128 GB, oMLX, thinking off, TurboQuant KV off):

| Metrica | oQ8 original | oQ6 editado |
|---|---|---|
| Decodificacion, prompt corto | ~126-129 tok/s | 112-122 tok/s |
| Decodificacion a 53k de contexto | ~91-103 tok/s | 97-99 tok/s |
| Prefill, 53k en frio | 3.331 tok/s | 2.606 tok/s |
| 4 peticiones concurrentes, agregado | ~221 tok/s | 203 tok/s |

Sonda de seguridad (100 prompts, pre-cuantizacion): 98/100 rechazos en el original frente a 2/100 en el editado. En los 10 prompts limite pero legitimos del autor (humor negro, lenguaje soez, reduccion de danos, ganzuas, monologo de villano), 2/10 rechazos en el original frente a 0/10 en el editado. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware
- VRAM/RAM: 48 GB o mas recomendados por el autor; el repositorio ocupa 31,0 GB en disco con cuantizacion oQ6.
- Hardware de referencia: Apple M5 Max con 128 GB de memoria unificada, plataforma sobre la que se construyo y midio el modelo.
- GPU: al ser un modelo MLX, esta orientado a Apple Silicon; no se documenta soporte para CUDA, A100, H100 ni RTX 4090 en la informacion disponible.
- Cabe en consumer GPU: no hay datos para GPUs de consumo tipo RTX 4090; en Mac, el autor lo situa como opcion para equipos de 48-64 GB.
- Despliegue: oMLX (recomendado), con endpoint compatible con OpenAI en `http://127.0.0.1:8000/v1` bajo el identificador `Qwen3.8-35B-A3B-Distill-edited-oQ6-fp16-mtp`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Ajustes medidos: `mtp_enabled: true` con profundidad adaptativa (la profundidad fija 2/3 es mas lenta; MTP desactivado cuesta ~35% de decodificacion); `turboquant_kv_enabled: false` (activarlo cuesta un 37% de decodificacion a 53k de contexto y un 23% de throughput agregado).
- Latencia y throughput: 112-122 tok/s en decodificacion con prompt corto, 97-99 tok/s a 53k de contexto, 2.606 tok/s de prefill en frio a 53k y 203 tok/s agregados con 4 peticiones concurrentes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (oQ6 editado) | 35,95B totales / ~3B activos | 262.144 | Apache-2.0 | MLX, Apple Silicon | Edicion de comportamiento, MTP nativa, ~31 GB |
| Qwen3.8-35B-A3B-Distill-oQ8-fp16-mtp (Novaeon.Studio) | 35,95B totales / ~3B activos | 262.144 | Apache-2.0 | MLX, Apple Silicon | Version oQ8 del mismo autor, sin edicion de comportamiento; 40/43 en la suite interna |
| empero-ai/Qwen3.8-35B-A3B-Distill (base) | 35,95B totales / ~3B activos | no disponible | Apache-2.0 | safetensors | Modelo base sin cuantizar ni editar; comportamiento de seguridad original |

No se dispone de datos de benchmarks estandar ni de comparativas con modelos de otros autores en la informacion proporcionada.

## Limitaciones y advertencias
- La edicion de pesos reduce deliberadamente el comportamiento de seguridad: la tasa de rechazo cae de 98/100 a 2/100. El autor recomienda aplicar una capa de seguridad propia antes de cualquier uso en produccion.
- No debe usarse como agente autonomo con tool calling sobre herramientas con efectos secundarios; el autor mantiene el modelo original como asiento por defecto para agentes.
- La edicion cuesta precision en aritmetica, codigo y aleman (KL ~0,25): el total de la suite interna baja de 40/43 a 35/43 y la suite de mitigacion de 16/17 a 12/17.
- El razonamiento sin modo thinking es debil: 2/6 en la suite interna, frente a 3/6 del original.
- Riesgo de alucinacion: no se documenta ninguna mitigacion especifica; la abtencion se mantiene en 3/3 en la suite interna, pero la suite es pequena.
- Idioma: solo se declara ingles; el soporte multilingue no esta garantizado y el unico caso adicional probado (aleman) pierde un caso tras la edicion.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el propio autor desaconseja el uso en produccion sin capa de seguridad adicional.
- Dependencia de plataforma: el formato es MLX y el motor oMLX; no hay pesos GGUF ni soporte documentado para ecosistemas CUDA.
- La variante oQ2 fue construida y rechazada por rendimiento roto (13/43), por lo que no existe release de 2 bits.
- Las cifras de rendimiento proceden de un unico equipo (M5 Max de 128 GB) y pueden no trasladarse a otros Macs.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/NovaeonStudio/Qwen3.8-35B-A3B-Distill-Heretic-oQ6-fp16-mtp
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill
- Version oQ8 del mismo autor: https://huggingface.co/NovaeonStudio/Qwen3.8-35B-A3B-Distill-oQ8-fp16-mtp
- Motor oMLX: https://github.com/jundot/omlx
- Novaeon.Studio: https://novaeon.studio
