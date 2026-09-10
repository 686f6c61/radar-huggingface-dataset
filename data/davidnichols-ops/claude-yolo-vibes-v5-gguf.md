# davidnichols-ops/claude-yolo-vibes-v5-GGUF

## Resumen

claude-yolo-vibes-v5-GGUF es un conjunto de cuantizaciones en formato GGUF del modelo davidnichols-ops/claude-yolo-vibes-v5, un ajuste fino derivado de Qwen2.5-Coder-7B. El autor declara una receta de tres etapas: SFT por destilación, un "pulido de personalidad" y una fase de DPO. El resultado se distribuye exclusivamente en GGUF para su uso con llama.cpp, Ollama y LM Studio, lo que lo sitúa en el nicho de asistentes de codigo ejecutables en local.

El modelo tiene 7.615.616.512 parametros (unos 7,6 mil millones) y se publica bajo licencia Apache 2.0, con un repositorio de 18,2 GB que contiene tres cuantizaciones: Q4_K_M (4,7 GB), Q5_K_M (5,4 GB) y Q8_0 (8,1 GB). El autor marca Q4_K_M como la opcion recomendada para Ollama. El unico dato de rendimiento publicado es un 85,4 % en HumanEval (140/164) medido sobre el modelo en precision completa, con una mejora declarada de +1,0 puntos frente a la version v4-dpo en el mismo arnes de evaluacion.

Su relevancia practica es limitada pero concreta: no aporta arquitectura nueva ni datos de entrenamiento detallados, sino un asistente de codigo con un tono de personalidad marcado ("sharp, playful edge") empaquetado para despliegue inmediato en hardware de consumo. El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que carece de validacion externa de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Qwen2.5, segun el modelo base Qwen2.5-Coder-7B) |
| Parametros totales | 7.615.616.512 (~7,6 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la ficha; el modelo base Qwen2.5-Coder-7B declara 32.768 tokens nativos y hasta 131.072 con YaRN |
| Tipos de cuantizacion | GGUF: Q4_K_M, Q5_K_M, Q8_0 (pesos completos en el repo base) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el repo base usa safetensors |
| Plantilla de chat | ChatML (`<|im_start|>...<|im_end|>`) |
| Modelo base | davidnichols-ops/claude-yolo-vibes-v5, derivado de Qwen2.5-Coder-7B |
| Tamano del repositorio | 18,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se documenta ninguna innovacion arquitectonica: se trata de un transformer decoder-only con atencion completa, RoPE y GQA heredado de Qwen2.5-Coder-7B. El autor describe la receta de ajuste en tres fases: (1) SFT por destilacion, (2) un "personality polish" orientado a fijar el tono conversacional, y (3) DPO. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, el modelo profesor de la destilacion, ni los hiperparametros o el numero de pasos de DPO. Tampoco se indica si se aplico ajuste sobre la ventana de contexto o si esta se preservo intacta.

La unica verificacion tecnica declarada es que las tres cuantizaciones se generaron a partir de los mismos safetensors del modelo base, y que Q8_0 se probo con llama.cpp comprobando que carga, que la plantilla de chat esta intacta y que genera codigo correcto. El benchmark de HumanEval declarado (85,4 %, 140/164) corresponde al modelo en precision completa, no a las versiones cuantizadas, un detalle relevante porque la degradacion por cuantizacion en tareas de generacion de codigo puede ser perceptible.

## Capacidades

- Generacion de codigo: es la capacidad central declarada; el autor cita verificacion manual de que Q8_0 "generates correct code" en llama.cpp.
- Razonamiento sobre problemas de programacion: el 85,4 % en HumanEval (140/164) sugiere competencia solida en funciones de Python aisladas, aunque no se han publicado resultados en benchmarks mas exigentes (SWE-bench, LiveCodeBench, MBPP+, BigCodeBench).
- Conversacion multi-turno: la plantilla ChatML con bloque de sistema permite dialogo con rol de asistente de codigo persistente.
- Instrucciones con tono personalizado: la fase de DPO y el system prompt por defecto ("a coding assistant with a sharp, playful edge") orientan el estilo de respuesta, no solo el contenido.
- Capacidades multilingues: no disponibles; no se declara cobertura de idiomas en la ficha ni en el README.
- Tool calling / function calling: no confirmado para este ajuste. El modelo base Qwen2.5-Coder incorpora plantillas de function calling, pero el autor no afirma que se hayan preservado tras SFT y DPO.
- Modo thinking o razonamiento explicito: no disponible.
- Vision, audio o multimodalidad: no soportado.

## Casos de uso

- Asistente de codigo local en estaciones de trabajo sin GPU dedicada: con la cuantizacion Q4_K_M (4,7 GB) el modelo cabe en equipos con 8 GB de RAM y CPU, lo que permite autocompletado y generacion de funciones sin enviar codigo a servicios externos.
- Integracion en el flujo de trabajo de Ollama: el autor publica el comando `ollama pull davidnicholsops/claude-yolo-vibes-v5` y un Modelfile listo para importar, de modo que el despliegue se reduce a una linea y el modelo queda disponible para scripts, editores y clientes compatibles con la API de Ollama.
- Generacion de funciones y utilidades de Python: el rendimiento declarado (140 de 164 problemas de HumanEval) lo hace adecuado para producir funciones autonomamente verificables, siempre con tests unitarios como red de seguridad.
- Explicacion y refactorizacion de fragmentos de codigo: la ventana de contexto heredada del modelo base permite introducir un archivo completo y pedir reescrituras, comentarios o deteccion de errores obvios.
- Prototipado rapido con presupuesto cero: al ser Apache 2.0 y ejecutarse en local, encaja en proyectos personales, docencia o entornos con restricciones de salida de datos, sin coste por token.
- Base para nuevos ajustes finos: el autor distribuye tanto el repo GGUF como el repo de safetensors, lo que permite partir del modelo en precision completa para un LoRA especifico del dominio.
- Chat de asistencia con personalidad en herramientas internas: el tono definido en el system prompt es util si se busca un asistente con respuestas concisas y cierto caracter, aunque es un riesgo si el contexto es profesional y formal.
- Evaluacion comparativa de cuantizaciones: disponer de Q4_K_M, Q5_K_M y Q8_0 del mismo checkpoint facilita medir la perdida de calidad en generacion de codigo segun el nivel de compresion.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| HumanEval (pass@1) | 85,4 % (140/164) | Medido por el autor sobre el modelo en precision completa; +1,0 frente a v4-dpo en el mismo arnes |
| Resto de benchmarks (MMLU, GSM8K, MBPP, SWE-bench) | No disponible | No publicados en la informacion proporcionada |
| Rendimiento de las cuantizaciones GGUF | No disponible | Solo se declara una prueba de humo cualitativa de Q8_0 |

No se han publicado resultados de benchmarks adicionales en la informacion disponible, ni comparaciones verificables contra otros modelos bajo el mismo arnes.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (incluye margen para contexto y cache KV):
  - Q4_K_M (4,7 GB de pesos): aproximadamente 6-7 GB.
  - Q5_K_M (5,4 GB): aproximadamente 7-8 GB.
  - Q8_0 (8,1 GB): aproximadamente 10 GB.
  - Pesos completos en fp16 (~15,2 GB): aproximadamente 17-18 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para Q4_K_M o Q5_K_M (RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070). Para Q8_0 conviene una GPU de 12-16 GB (RTX 4080, RTX 4090, A4000). Para fp16, A100 40 GB, H100 o RTX 4090 con margen.
- Cabe en GPU de consumo: si, la cuantizacion Q4_K_M cabe en GPUs de 8 GB y en equipos con 8-16 GB de RAM usando CPU o reparto CPU/GPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (imagen publicada por el autor), LM Studio. No se mencionan vLLM ni TGI, que no consumen GGUF de forma nativa.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo en ninguna configuracion de hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad | Benchmark declarado |
|---|---|---|---|---|---|---|
| claude-yolo-vibes-v5-GGUF | ~7,6 B | No disponible (base: 32.768 / 131.072 con YaRN) | Apache 2.0 | GGUF (Q4_K_M, Q5_K_M, Q8_0) | HuggingFace, Ollama | HumanEval 85,4 % (precision completa) |
| Qwen2.5-Coder-7B-Instruct | ~7,6 B | 32.768 nativos, 131.072 con YaRN | Apache 2.0 | safetensors, GGUF | HuggingFace, Ollama, vLLM | No verificado en la informacion disponible |
| claude-yolo-vibes-v5 (v4-dpo) | ~7,6 B | No disponible | Apache 2.0 | safetensors | HuggingFace | HumanEval 84,4 % (referencia usada por el autor) |
| Otros asistentes de codigo de ~7 B (DeepSeek-Coder, CodeLlama) | 6,7-7 B | 16.384 o mas | Licencias variables (MIT, permisiva propietaria) | safetensors, GGUF | HuggingFace, Ollama | No verificado en la informacion disponible |

La comparacion cuantitativa no es posible: el unico numero publicado es el HumanEval del propio autor, medido con su arnes, y no se aportan resultados de los modelos de referencia bajo el mismo arnes.

## Limitaciones y advertencias

- Ausencia total de validacion externa: 0 descargas y 0 likes en el momento de la consulta. Es un modelo practicamente sin uso por terceros, sin evaluaciones independientes.
- Opacidad del entrenamiento: no se publican tokens de entrenamiento, composicion del dataset, modelo profesor de la destilacion, hiperparametros de DPO ni proceso de filtrado. Esto impide auditar sesgos, contaminacion de benchmarks o procedencia de los datos.
- Riesgo de alucinacion: inherente a un modelo de 7,6 B. En generacion de codigo se traduce en APIs inventadas, firmas incorrectas y dependencias inexistentes; la verificacion declarada por el autor es cualitativa ("generates correct code"), no exhaustiva.
- El benchmark no cubre las cuantizaciones: el 85,4 % en HumanEval se midio sobre el modelo en precision completa. Q4_K_M y Q5_K_M pueden rendir por debajo de esa cifra, y no hay mediciones que cuantifiquen la perdida.
- La fase de "personality polish" y el DPO pueden haber priorizado el estilo sobre la exactitud, lo que es deseable en un asistente informal pero contraproducente en contextos tecnicos formales o de atencion al cliente.
- Idiomas no declarados: no hay garantia de comportamiento correcto en castellano; el modelo base esta fuertemente orientado al ingles.
- Tool calling y uso agentico sin confirmar: no se afirma que el ajuste preserve las plantillas de function calling del modelo base, por lo que no deberia asumirse en produccion sin prueba previa.
- Contexto declarado unicamente por herencia: la ficha no especifica la ventana efectiva, y no se indica si el ajuste o las cuantizaciones la modifican.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y sin garantia. Al derivar de Qwen2.5-Coder (tambien Apache 2.0), no anade restricciones, pero el usuario sigue siendo responsable del cumplimiento si incorpora datos o pesos de terceros.
- Metadatos a revisar: la ficha registra fecha de creacion 2026-09-10 y actualizacion el mismo dia, con una ventana de 16 minutos entre ambas; conviene tratar cualquier dato del repositorio como no verificado.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/davidnichols-ops/claude-yolo-vibes-v5-GGUF
- Modelo base (safetensors): https://huggingface.co/davidnichols-ops/claude-yolo-vibes-v5
- Modelo original del que deriva: Qwen2.5-Coder-7B (https://huggingface.co/Qwen/Qwen2.5-Coder-7B)
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
- No se han encontrado papers, blogs de analisis, demos ni discusiones de la comunidad sobre este modelo en la busqueda web realizada; los resultados obtenidos corresponden a paginas de soporte de Google sin relacion con el modelo.
