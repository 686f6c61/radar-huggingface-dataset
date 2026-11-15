# LGTEAMai/Nano-1.3-Plus

## Resumen

Nano-1.3-Plus es un modelo de lenguaje compacto bilingüe (inglés y ruso) desarrollado por LGTEAMai, un laboratorio que investiga la construccion de modelos pequenos asistida por IA bajo supervision humana (linea de investigacion "AI makes AI"). Se trata de un transformer decoder-only con arquitectura tipo Llama, 16 capas, tamano oculto 896 y atencion con grouped-query attention (14 cabezas de atencion, 2 de key/value). El dato real de pesos en safetensors es de 254.190.720 parametros, aunque la model card declara 197 millones; la discrepancia no esta explicada en la informacion disponible.

El modelo es una version instruction-tuned de un preentrenamiento Nano 1.3 entrenado con 12.600 millones de tokens (unas 64 veces el numero de parametros) y ampliado a un contexto de 4.096 tokens. Su propuesta es ejecutarse en CPU de portatil o dispositivos de gama movil sin codigo personalizado, cargandose directamente con `transformers`. Resuelve el caso de chat corto y sencillo, definiciones, aritmetica basica, programas triviales y dibujos SVG simples, no tareas que requieran correccion factual.

Es relevante ahora por su licencia Apache 2.0, su huella minima (repo de 0,5 GB) y la existencia de un repositorio companero con cuantizaciones para llama.cpp, Ollama y LM Studio. No obstante, el propio autor advierte que es un modelo muy pequeno que falla con frecuencia en hechos y calculos, por lo que su uso en produccion debe limitarse a escenarios de baja exigencia de exactitud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, layout Llama (16 capas, hidden 896, SwiGLU 2560, RMSNorm, RoPE base 50.000, embeddings de entrada/salida atados) |
| Parametros totales | 254.190.720 (safetensors); la model card declara 197 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | GGUF en el repo LGTEAMai/Nano-1.3-Plus-GGUF (variantes concretas no detalladas); pesos originales en safetensors |
| Idiomas soportados | Ingles y ruso (el ingles es algo mas fuerte) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF en repositorio companero |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only en el layout de Llama: 16 capas, tamano oculto 896, 14 cabezas de atencion con 2 cabezas de key/value (grouped-query attention), feed-forward SwiGLU de dimension 2560, RMSNorm, rotary position embeddings con base 50.000, embeddings de entrada y salida atados y un vocabulario byte-level BPE de 64.007 tokens (tokenizador Nano LM-2.1). El preentrenamiento se realizo desde cero (cadena Nano 1.2 -> Nano 1.3 -> este modelo), no es un fine-tune de un modelo de terceros, y consumio 12.600 millones de tokens de texto web, educativo, enciclopedico, matematico y codigo fuente en ingles y ruso, con una pequena proporcion de codigo SVG y texto enciclopedico hasta septiembre de 2026.

El ajuste por instrucciones empleo unas 64.000 conversaciones (chats publicos en ingles y ruso mas ejemplos escritos por LGTEAMai sobre identidad, charla cotidiana, definiciones, aritmetica, fecha y corte de conocimiento, programacion basica y dibujos SVG). Se filtraron conversaciones que atribuian al asistente la identidad de otros modelos o empresas. Las conversaciones de mas de 3.072 tokens se truncaron en el ultimo turno completo y la perdida se calculo solo sobre los tokens del asistente. El preentrenamiento se ejecuto en GPUs NVIDIA H100, H200 y T4; el ajuste por instrucciones se completo en una H100 en unos 15 minutos (1.994 pasos, dos pasadas sobre los datos). El formato de chat usa los turnos `<|system|>`, `<|user|>` y `<|assistant|>` terminados en `<|end|>`.

## Capacidades

- Generacion de texto conversacional corto en ingles y ruso.
- Respuestas a saludos, agradecimientos, definiciones y preguntas cotidianas en un estilo breve y fijo.
- Aritmetica basica (con errores frecuentes segun el autor).
- Generacion de programas triviales, como "Hello, World!".
- Generacion de dibujos SVG simples.
- Soporte de plantilla de chat con system prompt y turnos multi-turno.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multimodales (vision, audio): no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Chat de bajo coste en dispositivos: el modelo cabe en CPU de portatil o movil y responde a saludos y preguntas simples con el system prompt recomendado, util para prototipos y demos offline.
- Asistente de escritorio embebido: con 254 M de parametros y contexto de 4.096 tokens, puede integrarse en aplicaciones de escritorio mediante llama.cpp u Ollama para conversaciones cortas sin conexion.
- Generacion de fragmentos de codigo de ejemplo: produce programas minimos tipo "Hello, World!" para tutoriales o tests de humo de pipelines, sin garantia de correccion en logica compleja.
- Generacion de graficos SVG simples: adecuado para crear iconos o formas basicas en flujos de diseno automatizados donde la precision geometrica no es critica.
- Investigacion sobre modelos pequenos: sirve como referencia para estudiar el comportamiento de modelos de menos de 300 M de parametros, la calidad de respuestas con contexto de 4 K y el efecto del ajuste por instrucciones en bilingüismo ingles/ruso.
- Clasificacion o etiquetado ligero de texto corto: puede usarse para tareas de formato fijo (respuestas breves, extraccion simple) en entornos con recursos muy limitados, siempre con validacion posterior.
- Base para fine-tuning educativo: su licencia Apache 2.0 y su carga directa con `transformers` lo hacen apropiado para experimentos docentes de ajuste supervisado sobre dominios acotados.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (0-shot, no verificados):

| Benchmark | Metrica | Valor |
|---|---|---|
| ARC-Easy (test) | accuracy | 39,94 |
| ARC-Challenge (test) | normalized accuracy | 23,29 |
| HellaSwag (validation) | normalized accuracy | 29,90 |
| PIQA (validation) | accuracy | 60,61 |
| SciQ (test) | accuracy | 68,30 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, aproximadamente 0,5 GB de pesos mas overhead; en cuantizacion de 8 bits, en torno a 0,3 GB; en 4 bits, alrededor de 0,15-0,2 GB (estimaciones a partir de los 254 M de parametros).
- GPU recomendadas: cualquier GPU moderna con al menos 1-2 GB de VRAM; el autor cita H100, H200 y T4 para entrenamiento, no para inferencia.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: `transformers`, llama.cpp, Ollama y LM Studio mediante el repositorio GGUF companero; tambien es compatible con text-generation-inference y endpoints segun los tags del repositorio.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| Nano-1.3-Plus | 254 M (declarado 197 M) | 4.096 | Apache 2.0 | en, ru | Hugging Face + GGUF |
| Modelos comparables de menos de 500 M | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de alternativas en la informacion proporcionada para establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Modelo muy pequeno: el autor advierte que falla con frecuencia en hechos y aritmetica y no debe usarse donde la correccion sea critica.
- Riesgo elevado de alucinacion en preguntas factuales y calculos.
- Las respuestas largas pueden empezar a repetirse; se recomienda preguntar de una en una y limitar la longitud.
- La decodificacion greedy tiende a entrar en bucles; se recomienda muestreo con temperatura 0,6, top-p 0,9, top-k 40 y penalizacion de repeticion 1,1.
- Sin system prompt el modelo deriva mas, especialmente en saludos muy cortos.
- El modelo declara su corte de conocimiento en septiembre de 2026 solo parte de las veces.
- Cobertura limitada a ingles y ruso; el ingles es algo mas fuerte.
- Discrepancia entre los parametros declarados (197 M) y los pesos reales (254 M), sin explicacion en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero la calidad del modelo limita su viabilidad en produccion sin supervision.
- Sin soporte documentado de tool calling, agentes ni multimodalidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LGTEAMai/Nano-1.3-Plus
- Repositorio GGUF: https://huggingface.co/LGTEAMai/Nano-1.3-Plus-GGUF
- Sitio del autor: https://lgteamai.xyz
