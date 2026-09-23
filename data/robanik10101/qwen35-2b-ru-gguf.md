# robanik10101/qwen35-2b-ru-gguf

## Resumen

qwen35-2b-ru-gguf es un derivado no oficial del modelo Qwen/Qwen3.5-2B, publicado por el usuario robanik10101 y orientado al idioma ruso. Se trata de un ajuste supervisado (SFT) mediante LoRA con rango 8 sobre las capas MLP y de atencion, manteniendo congelados los pesos base, seguido de una fusion de adaptadores y una cuantizacion real a GGUF con llama.cpp. El resultado son dos ficheros listos para motores de inferencia locales: una version Q4_K_M de 1,22 GB y una version F16 de 3,9 GB.

El modelo resuelve un caso de uso muy concreto: disponer de un asistente conversacional en ruso, ligero y ejecutable en CPU o en GPUs de gama baja, con un sesgo estilistico hacia respuestas breves de tipo chat, matematicas basicas y tareas cortas de codigo en Python y Java. No pretende competir en razonamiento complejo, y el propio autor lo reconoce explicitamente: el entrenamiento fue muy corto (159 pasos) y las capacidades de razonamiento duro se mantienen en el nivel del modelo base de 2B.

Su relevancia actual es principalmente practica: demuestra el flujo completo de adaptar un modelo pequeno con recursos minimos (el SFT se ejecuto en CPU), fusionar adaptadores preservando los tensores de prediccion multi-token (MTP) y generar cuantizaciones calibradas con imatrix. Para desarrolladores que necesiten un modelo ruso de bolsillo, desplegable sin GPU, es una opcion directamente utilizable con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Herencia de Qwen/Qwen3.5-2B (modelo base); detalles de capas, atencion y normalizacion no disponibles |
| Parametros totales | 1.942.653.248 (~1,94B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el autor recomienda arrancar con 4096 tokens |
| Tipos de cuantizacion | Q4_K_M (5,36 BPW) y F16 |
| Idiomas soportados | Ruso (ru); el modelo base Qwen3.5-2B es multilingue, pero este derivado esta orientado a ruso |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer denso de aproximadamente 1,94B parametros. La intervencion del autor consistio en un ajuste supervisado con LoRA de rango 8 aplicado a las capas MLP y de atencion, dejando el resto de los pesos congelados. El conjunto de entrenamiento fue muy reducido: 572 filas en ruso con preguntas y respuestas cotidianas, matematicas y 40 tareas de Python mas 40 de Java. El entrenamiento completo duro 159 pasos y se ejecuto en CPU, lo que da una idea de la escala del ajuste.

Tras el SFT, los adaptadores se fusionaron en los pesos originales preservando los tensores de prediccion multi-token (MTP) del modelo base, un detalle relevante porque indica que no se destruyo esa capacidad durante la fusion. Despues se genero la cuantizacion GGUF con llama.cpp, calibrando una matriz imatrix sobre 1200 filas mixtas antes de producir el fichero Q4_K_M a 5,36 bits por peso. No hubo fases de RLHF ni DPO. El autor indica explicitamente que no distribuye scripts ni codigo de entrenamiento.

## Capacidades

- Generacion de texto conversacional en ruso, con un estilo ajustado a las filas de entrenamiento (charla cotidiana y respuestas breves).
- Aritmetica basica y problemas matematicos sencillos; el autor verifico que `15*4 = 60` de forma correcta.
- Generacion de codigo corto en Python y Java, derivada de las 80 tareas incluidas en el SFT.
- Dialogo multi-turno con contexto configurable (se recomienda empezar con 4096 tokens).
- Ejecucion en llama.cpp, incluido `llama-server`, verificado por el autor a unos 22 tokens por segundo en CPU.
- Soporte de plantilla de chat y compatibilidad con el endpoint estandar de llama.cpp (tag `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Asistente conversacional en ruso para aplicaciones de escritorio o moviles: el modelo cabe en 1,22 GB en su version Q4_K_M y funciona incluso sin GPU, lo que permite integraciones ligeras en aplicaciones locales.
- Chatbot de soporte basico en ruso: puede gestionar conversaciones multi-turno con contexto de 4096 tokens para consultas sencillas, con respuestas breves y directas.
- Prototipado rapido de aplicaciones de IA en ruso: por su tamano reducido, se puede cargar en LM Studio u Ollama en un portatil para validar ideas sin coste de infraestructura.
- Generacion de pequenos fragmentos de codigo Python o Java: util como autocompletado asistido en entornos educativos o scripts de ejemplo, siempre con revision humana por su fiabilidad limitada.
- Procesamiento por lotes en CPU: al correr a ~22 tok/s con llama-server, es viable para tareas de generacion masiva de texto donde la latencia no sea critica.
- Entorno de investigacion y ensenanza: sirve como ejemplo reproducible de un pipeline completo LoRA + fusion + imatrix + cuantizacion GGUF, util para cursos de ajuste fino de modelos.
- Base para posteriores ajustes en ruso: al ser Apache 2.0 y estar en GGUF, se puede reutilizar como punto de partida para fine-tuning adicional, aunque para eso conviene partir de los pesos base en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se ejecutaron evaluaciones formales como MMLU ni HumanEval. Las unicas comprobaciones documentadas son de dominio acotado:

| Prueba | Resultado |
|---|---|
| Aritmetica simple | `15*4 = 60` correcto |
| Charla cotidiana en ruso | Comportamiento aceptable segun el autor |
| Respuestas cortas de Python | Comportamiento aceptable segun el autor |
| Velocidad en CPU (llama-server) | ~22 tokens por segundo |
| Benchmarks formales (MMLU, HumanEval, GSM8K) | No realizados |

## Requisitos de hardware

- VRAM para inferencia: la version Q4_K_M ocupa 1,22 GB de pesos, por lo que con una ventana de 4096 tokens el consumo total ronda los 1,5-2 GB. La version F16 ocupa 3,9 GB.
- GPU recomendadas: cualquier GPU consumer moderna sirve sobradamente; una RTX 3060 de 12 GB o superior es mas que suficiente. Tambien funciona en GPUs integradas con memoria compartida.
- Cabe en GPU consumer: si, en practicamente todas (GTX 1650 4 GB o superiores para F16; cualquier GPU con 2-3 GB para Q4_K_M).
- Ejecucion en CPU: si, es uno de los escenarios previstos; el autor reporta ~22 tok/s.
- Opciones de despliegue: llama.cpp, llama-server, LM Studio y Ollama. El autor recomienda LM Studio y Ollama para los ficheros GGUF.
- Latencia y throughput: el unico dato medido es ~22 tokens por segundo en CPU con el modelo Q4_K_M; en GPU no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| qwen35-2b-ru-gguf (este) | ~1,94B | No disponible | Apache 2.0 | GGUF (Q4_K_M, F16) | SFT en ruso, sin benchmarks |
| Qwen/Qwen3.5-2B (base) | ~1,94B | No disponible | Apache 2.0 | safetensors | Modelo original, multilingue, sin ajuste a ruso |
| Qwen3.5-2B-Claude-4.6-Opus-Reasoning-Distilled-GGUF (Jackrong) | ~1,94B | No disponible | No disponible | GGUF | Derivado orientado a razonamiento destilado; detalles no disponibles |
| Cuantizaciones Qwen3.5 de Unsloth | Variable segun tamano | No disponible | No disponible | GGUF | Esquema Dynamic 2.0; foco en retencion de precision, no en ruso |

Las cifras de rendimiento comparativo no estan disponibles para ninguno de los modelos de la tabla en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo oficial: no tiene vinculacion con el equipo Qwen de Alibaba; es un derivado de la comunidad.
- No se ejecutaron benchmarks formales, por lo que no hay evidencia cuantitativa de calidad mas alla de comprobaciones puntuales del autor.
- El SFT fue muy corto (159 pasos sobre 572 filas), lo que desplaza el estilo hacia los datos de entrenamiento y puede degradar respuestas fuera de ese dominio.
- El razonamiento complejo permanece en el nivel del modelo base de 2B; no debe esperarse capacidad de razonamiento avanzado.
- Riesgo de alucinacion propio de un modelo de 2B, especialmente en matematicas no triviales, codigo extenso o conocimiento factual.
- El foco linguistico es el ruso; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente tras el ajuste.
- La longitud de contexto soportada no esta especificada; el autor sugiere 4096 tokens como punto de partida, no como limite confirmado.
- No se distribuyen scripts ni codigo de entrenamiento, lo que dificulta reproducir el proceso.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; ademas, conviene revisar las condiciones del modelo base.
- Repositorio con muy poca traccion (41 descargas, 1 like) y publicado recientemente; no hay comunidad que haya validado su comportamiento en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/robanik10101/qwen35-2b-ru-gguf
- Perfil del autor: https://huggingface.co/robanik10101
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio oficial de la serie Qwen3.5 (GitHub): https://github.com/QwenLM/Qwen3.8
- Analisis de un derivado GGUF de Qwen3.5-2B (HackerNoon): https://hackernoon.com/qwen35-2b-distills-opus-reasoning-into-a-tiny-gguf-model
- Guia de despliegue de cuantizaciones GGUF de Qwen3.5 (CSDN): https://blog.csdn.net/weixin_43366149/article/details/158886022
