# dikiyplayerpig/dpp-gpt-V2.2-Pro-260m

## Resumen

dpp-gpt V2.2 Pro (260M) es un modelo de lenguaje de 242 millones de parámetros únicos (259M nominales, con embeddings de entrada y salida atados) desarrollado por el usuario independiente dikiyplayerpig. Se trata de un entrenamiento íntegro desde cero, realizado por una sola persona sobre una única GPU de consumo (RTX 4060), que cubre preentrenamiento, ajuste supervisado, aprendizaje por refuerzo y evaluación. El modelo emplea una arquitectura de estilo Llama (RMSNorm, RoPE, SwiGLU) con 20 capas, dimensión oculta de 1024, 16 cabezas de atención y 4 cabezas KV (GQA), y una ventana de contexto de 8192 tokens con un vocabulario BPE propio de 16.384 entradas.

El modelo está orientado a tres idiomas (ruso, inglés y francés) y a tareas de razonamiento paso a paso mediante un conmutador `[THINK]`, llamada a herramientas (tool calling), generación de JSON a partir de una descripción y aritmética con números largos dígito a dígito. Esta versión Pro constituye el cierre de la línea 2.2: parte del checkpoint preview (entrenado con SFT) y añade nueve rondas de aprendizaje por refuerzo con GRPO, con recompensas verificadas por código en su mayor parte.

Su relevancia radica en dos factores: por un lado, demuestra que es viable producir un modelo funcional multilingüe con capacidades de razonamiento y tool calling en hardware de consumo; por otro, la publicación de pesos en safetensors, GGUF (siete cuantizaciones) y `.pth` facilita su despliegue local y su estudio. La licencia Apache 2.0 elimina restricciones para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer estilo Llama (RMSNorm, RoPE, SwiGLU, GQA) |
| Parametros totales | 259M nominales; 242.263.040 reales en safetensors |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | GGUF F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K |
| Idiomas soportados | ruso (ru), ingles (en), frances (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (LlamaForCausalLM), GGUF, PyTorch `.pth` (solo pesos) |

Detalles adicionales de arquitectura: 20 capas, hidden size 1024, 16 cabezas de atención, 4 cabezas KV (GQA), vocabulario de 16.384 tokens con BPE propio, embeddings de entrada y salida atados.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de estilo Llama con normalización RMSNorm, embeddings posicionales rotatorios (RoPE) y activación SwiGLU. Emplea atención con query grouping (GQA) con 16 cabezas de consulta y 4 de clave/valor, lo que reduce el coste de memoria de la caché KV durante la inferencia. El vocabulario es un BPE propio de 16.384 entradas, deliberadamente pequeño para un modelo de este tamaño, lo que reduce el coste de los embeddings y de la capa de salida.

El entrenamiento se estructura en tres fases. Primero, un preentrenamiento desde cero sobre aproximadamente 31.000 millones de tokens (continuación del modelo 2.1 Base), seguido de unos 60 millones de tokens de datos de ajuste supervisado (SFT) que dieron lugar al checkpoint preview. Sobre ese preview se aplicaron nueve rondas de GRPO de entre 50 y 350 pasos, cada una partiendo del mejor checkpoint anterior; en las rondas finales cada paso procesa 16 prompts con 8 respuestas cada uno, con ventaja relativa al grupo, penalización KL contra un modelo de referencia y una pequeña pérdida de replay de SFT para mitigar el olvido catastrófico. Casi todas las recompensas se verifican por código (aritmética, ecuaciones, problemas verbales escolares en tres idiomas, funciones Python ejecutadas contra tests, JSON desde descripción, localización de números en texto, restricciones de formato, llamadas a herramientas en varios formatos y traducción por similitud con referencia); un juez local Gemma 4 E4B añade recompensa para ensayos, poemas y respuestas factuales. Se aplica selección de dificultad para muestrear menos las tareas que el modelo siempre o nunca resuelve. El modelo final es una media ponderada de pesos de tres checkpoints de RL (0,4 · GRPO8 paso 100 + 0,3 · GRPO9 paso 150 + 0,3 · GRPO5 paso 200), ya que cada checkpoint individual mejoraba en unas áreas y empeoraba en otras.

## Capacidades

- Generación de texto conversacional multilingüe en ruso, inglés y francés.
- Razonamiento paso a paso con conmutador `[THINK]` (modo con y sin pensamiento explícito).
- Aritmética con números largos (hasta 10^40), incluyendo sumas, restas, multiplicaciones, divisiones, paréntesis, ecuaciones y fracciones, operando dígito a dígito.
- Resolución de problemas verbales escolares (precios, cambio, velocidad, edades) en los tres idiomas.
- Llamada a herramientas (tool calling) en varios formatos, incluyendo la decisión de no invocar ninguna herramienta cuando no es necesaria y la respuesta a partir de un resultado inesperado de herramienta.
- Generación de JSON válido a partir de una descripción en lenguaje natural.
- Escritura de funciones Python pequeñas a partir de una especificación.
- Seguimiento de instrucciones de formato múltiples simultáneas (idioma, límite de palabras, título, lista con viñetas, palabras de inicio y fin).
- Localización de un número dentro de un texto con distractores.
- Traducción entre los tres idiomas soportados.
- Preguntas de opción múltiple y respuestas cortas.
- Composición de poemas y ensayos breves.

## Casos de uso

- Asistente conversacional local multilingüe: el modelo puede gestionar diálogos en ruso, inglés y francés con 8192 tokens de contexto, suficiente para conversaciones multi-turno con historial extenso; su tamaño permite ejecutarlo en equipos sin GPU dedicada mediante cuantizaciones Q4_K_M o Q5_K_M.
- Enseñanza de aritmética y resolución de problemas: con el modo `[THINK]` activado, el modelo descompone operaciones con números grandes paso a paso, lo que resulta útil en herramientas educativas que necesitan mostrar el razonamiento intermedio.
- Generación de JSON estructurado en pipelines de datos: a partir de una descripción en lenguaje natural, produce objetos JSON válidos con claves y valores correctos, adecuado para tareas de extracción y normalización de información en entornos con recursos limitados.
- Automatización de llamadas a APIs: el soporte de tool calling en varios formatos permite integrarlo como planificador ligero en agentes que deciden qué función invocar y con qué argumentos, así como abstenerse cuando no procede llamar a ninguna.
- Generación de código auxiliar: puede escribir funciones Python pequeñas a partir de una especificación, útil para prototipado rápido, generación de tests unitarios simples o scripts de automatización en entornos de CI/CD con requisitos de latencia bajos.
- Procesamiento de documentos y extracción de datos: la capacidad de localizar un número en un texto con distractores y de responder preguntas factuales breves lo hace apto para tareas de lectura comprensiva sobre documentos cortos en ruso, inglés o francés.
- Despliegue en dispositivos de borde: con cuantizaciones Q2_K a Q5_K_M y un peso de 2,6 GB en el repositorio, puede ejecutarse en mini-PC, Raspberry Pi de gama alta o portátiles sin GPU, ofreciendo generación de texto y clasificación local sin conexión.

## Benchmarks y rendimiento

Los datos disponibles provienen de la suite propia del autor, no de benchmarks públicos estándar. El propio autor advierte que las cifras pueden estar algo infladas a favor de dpp-gpt y no son comparables con puntuaciones publicadas de otros modelos. La suite consta de 12 áreas y 2450 preguntas en ru/en/fr, cada pregunta formulada dos veces (con y sin pensamiento), temperatura 0,1; la verificación es por código cuando es posible y por el juez Gemma 4 26B en poemas, ensayos, chat, código abierto y conocimiento.

| Área | Preguntas | Verificación | Resultado 2.2 Pro |
|---|---|---|---|
| instr (restricciones de formato) | 300 | código | no disponible |
| reading (número en texto) | 200 | código | no disponible |
| wordmath (problemas verbales) | 300 | código | no disponible |
| json (JSON desde descripción) | 150 | código | no disponible |
| tools (llamada a herramientas) | 200 | código | no disponible |
| knowledge (preguntas factuales) | 400 | juez | no disponible |
| mcq (opción múltiple) | 400 | código | no disponible |
| pysmall (funciones Python) | 150 | código (tests) | no disponible |
| pyopen (programas abiertos) | 80 | juez | no disponible |
| poem (poemas) | 60 | juez | no disponible |
| essay (ensayos) | 60 | juez | no disponible |
| chat (peticiones cotidianas) | 150 | no disponible | no disponible |
| math (aritmética generada, 2200 tareas) | 2200 | código | 51,3 % |

Datos comparativos dentro de la familia: en la suite propia, la media pasó del 17,8 % (preview) al 24,2 % (2.2 Pro), frente al 8,3 % de la versión 2.15 Pro. En la prueba de aritmética, el modelo base obtuvo 47,6 %, el preview 36,8 % (el SFT lo redujo) y 2.2 Pro 51,3 %. La media ponderada de los tres checkpoints de RL alcanzó 25,9 según el juez E4B, frente a 24,1–25,2 de cada checkpoint individual. No se han publicado resultados de benchmarks públicos estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en F16, aproximadamente 0,5 GB de pesos más caché KV y overhead (en torno a 1 GB en total con contexto completo); en Q8_0, unos 0,26 GB; en Q4_K_M, unos 0,15 GB; en Q2_K, unos 0,1 GB. La caché KV para 8192 tokens con 20 capas, 4 cabezas KV y dimensión de cabeza de 64 es reducida (del orden de decenas de MB en F16).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para F16; RTX 4060, RTX 3060, GTX 1660 o superiores son suficientes. El propio autor entrenó el modelo en una RTX 4060. Para despliegue en servidor, A100 o H100 no aportan ventaja significativa por el tamaño reducido del modelo; una T4 es más que suficiente.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo modernas e incluso en iGPU con memoria unificada; también en CPU.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM y TGI para safetensors; transformers con `LlamaForCausalLM`; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño (242M parámetros), se espera un throughput alto en GPU de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| dpp-gpt V2.2 Pro 260M | 242M (259M nominales) | 8192 | ru, en, fr | Apache 2.0 | Entrenado desde cero por un autor individual; tool calling, CoT, GRPO |
| dpp-gpt V2.2 Pro preview 260M | 242M | 8192 | ru, en, fr | Apache 2.0 | Checkpoint SFT previo al RL; media 17,8 % en suite propia |
| dpp-gpt V2.2 Base 260M | 242M | 8192 | ru, en, fr | Apache 2.0 | Solo preentrenamiento; continuación de texto |
| dpp-gpt V2.15 Pro | no disponible | no disponible | ru, en, fr | Apache 2.0 | Generación anterior; media 8,3 % en suite propia |

No se dispone de datos de benchmarks públicos que permitan comparar con modelos de otros autores del mismo tamaño (por ejemplo, Qwen2.5-0.5B, SmolLM2-360M o TinyLlama-1.1B) en la información proporcionada. La comparación con esos modelos requeriría ejecutar evaluaciones estándar, que no están publicadas para dpp-gpt V2.2 Pro.

## Limitaciones y advertencias

- Los benchmarks son propios del autor y no comparables con los públicos; parte de las tareas de RL comparten generadores con algunos benchmarks (matemáticas, problemas verbales, instrucciones), por lo que el modelo podría haber aprendido el formato de esas tareas mejor que la habilidad subyacente.
- Riesgo de alucinación en preguntas factuales: el área de conocimiento se evalúa con un juez y no con verificación por código, y el modelo es de tamaño reducido (242M), lo que limita su fiabilidad factual.
- Cobertura lingüística limitada a ruso, inglés y francés; no se garantiza un comportamiento correcto en otros idiomas.
- Ventana de contexto de 8192 tokens, insuficiente para documentos largos o conversaciones muy extensas.
- El ajuste por RL con recompensas mayoritariamente verificadas por código puede favorecer el formato sobre la sustancia en tareas de razonamiento; el autor reconoce que la multiplicación cayó del 70 % al 55 % en rondas tardías de RL.
- El modelo final es una media ponderada de checkpoints, lo que puede introducir inconsistencias menores respecto a un único checkpoint entrenado de forma continua.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene revisar las condiciones de los datos de entrenamiento (no documentadas en detalle) y citar la autoría.
- Modelo entrenado por un único autor en hardware de consumo, sin el respaldo de una organización; la estabilidad y el mantenimiento a largo plazo no están garantizados.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dikiyplayerpig/dpp-gpt-V2.2-Pro-260m
- Checkpoint preview (SFT): https://huggingface.co/dikiyplayerpig/dpp-gpt-V2.2-Pro-preview-260m
- Modelo base 2.2: https://huggingface.co/dikiyplayerpig/dpp-gpt-V2.2-base-260m
- Árbol de archivos del modelo base: https://huggingface.co/dikiyplayerpig/dpp-gpt-V2.2-base-260m/tree/main
