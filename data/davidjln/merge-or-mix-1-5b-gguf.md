# DavidJLN/merge-or-mix-1.5b-GGUF

## Resumen

merge-or-mix-1.5b-GGUF es la version cuantizada en formato GGUF del modelo DavidJLN/merge-or-mix-1.5b, un ajuste fino de Qwen2.5-1.5B-Instruct desarrollado por el usuario DavidJLN. El modelo resuelve un problema muy concreto: responder preguntas en frances eligiendo automaticamente entre dos estilos de respuesta segun el tipo de pregunta. Las preguntas que piden explicacion se responden con pasos numerados, un bloque "Exemple :" y registro informal; las preguntas directas se responden con un objeto JSON con las claves `reponse`, `confiance` y `sujets`.

La relevancia de esta publicacion es doble. Por un lado, es un ejemplo de ajuste fino orientado a formato y enrutamiento de estilo mas que a conocimiento factual. Por otro, incluye una verificacion de cuantizacion reproducible: el autor compara bf16, f16 y Q8_0 sobre las mismas 50 preguntas retenidas y obtiene 48/50 en los tres casos, lo que demuestra que Q8_0 no degrada el comportamiento medible.

El modelo tiene 1.543.714.304 parametros, se distribuye bajo licencia Apache 2.0 y esta pensado para ejecutarse localmente con Ollama o llama.cpp. Solo se publica la cuantizacion Q8_0 (1,6 GB); segun el autor, Q5_K_M y Q4_K_M pierden entre 4 y 5 puntos en la misma evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q8_0 (unica publicada); el autor menciona Q5_K_M y Q4_K_M como evaluadas pero no publicadas |
| Idiomas soportados | fr (frances) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 1,6 GB); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint Qwen2.5-1.5B-Instruct, por lo que hereda su arquitectura transformer decoder-only con atencion causal y el tokenizador de Qwen2.5. El autor no detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO. El nombre del repositorio y la referencia a un "DARE merge" en la seccion de cuantizacion sugieren que el ajuste fino se integro mediante tecnicas de merge de pesos (DARE), aunque no se especifica el procedimiento exacto.

La innovacion principal no es arquitectonica sino de comportamiento: el modelo aprende a enrutar el estilo de respuesta a partir unicamente de la pregunta, sin system prompt. El autor indica explicitamente que el modelo fue entrenado y evaluado sin prompt de sistema y desaconseja anadir uno propio. La evaluacion se realiza con decodificacion greedy (temperatura 0) y plantilla de chat de Qwen con su system prompt por defecto.

## Capacidades

- Generacion de texto en frances con dos modos de respuesta diferenciados: explicativo (pasos numerados, "Exemple :", tono informal) y directo (JSON estructurado).
- Salida JSON con esquema fijo: `{"reponse": ..., "confiance": ..., "sujets": [...]}` para preguntas directas.
- Enrutamiento de estilo basado solo en la pregunta, sin necesidad de instrucciones adicionales.
- Conversacion multi-turno mediante plantilla de chat compatible con Qwen (`<|im_start|>` / `<|im_end|>`).
- Integracion con Ollama y llama.cpp mediante formato GGUF.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.
- Capacidad multilingue limitada al frances segun la metadata del modelo.

## Casos de uso

- Clasificacion y formateo de respuestas en pipelines de datos: el modelo puede usarse para convertir preguntas directas en registros JSON con campos de respuesta, confianza y temas, lo que facilita su consumo por sistemas downstream sin postprocesado.
- Prototipado de asistentes conversacionales en frances: al ejecutarse en Ollama con un solo comando, sirve para validar flujos de chat multi-turno en local antes de invertir en modelos mayores.
- Generacion de respuestas explicativas con estructura fija: para preguntas del tipo "por que" o "como", el modelo produce pasos numerados y ejemplos, util en entornos educativos o de documentacion donde se requiere formato consistente.
- Evaluacion de tecnicas de merge y cuantizacion: el repositorio incluye una comparativa reproducible bf16/f16/Q8_0 sobre 50 preguntas, lo que lo convierte en un caso de estudio para medir el impacto de la cuantizacion en modelos pequenos.
- Despliegue en entornos con recursos limitados: con 1,6 GB en Q8_0, cabe en maquinas sin GPU dedicada o en GPUs de gama baja, adecuado para demos offline y pruebas de integracion.
- Filtrado y enrutamiento en aplicaciones de soporte: la distincion entre pregunta explicativa y directa puede aprovecharse para decidir si una consulta requiere una respuesta narrativa o un registro estructurado antes de pasarla a otro sistema.

## Benchmarks y rendimiento

El autor publica una unica evaluacion interna sobre 50 preguntas retenidas, con decodificacion greedy a traves de Ollama:

| Version | Tamano | Puntuacion /50 |
|---|---|---|
| bf16 (transformers) | 2,9 GB | 48 |
| f16 GGUF | 2,9 GB | 48 |
| Q8_0 GGUF | 1,6 GB | 48 |

El autor indica que Q8_0 conserva identicos "leaks, defects and confidence calibration" respecto a bf16, y que Q5_K_M y Q4_K_M pierden entre 4 y 5 puntos en la misma prueba. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,6 GB para Q8_0, mas el overhead del runtime (KV cache y buffers), por lo que en la practica se recomienda disponer de 2-3 GB libres.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el modelo es viable en RTX 3050, RTX 4060, GTX 1660 y superiores. En A100 o H100 se ejecutaria con holgura pero no aprovecharia su capacidad.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna con 4 GB o mas; tambien puede ejecutarse en CPU.
- Opciones de despliegue: Ollama (`ollama run hf.co/DavidJLN/merge-or-mix-1.5b-GGUF:Q8_0`), llama.cpp y cualquier runtime compatible con GGUF. El autor proporciona un `Modelfile` para reproducir la plantilla de chat de Qwen y la decodificacion greedy.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| merge-or-mix-1.5b-GGUF | 1,54 B | no disponible | Apache 2.0 | GGUF (Q8_0) | Ajuste fino de Qwen2.5-1.5B-Instruct orientado a formato y estilo en frances |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Modelo base; capacidades generales multilingues y de instrucciones |
| Modelos de ~1,5 B en frances | no disponible | no disponible | no disponible | no disponible | No se dispone de comparativas publicadas en la informacion proporcionada |

La comparativa con alternativas especificas en frances no esta disponible en la informacion proporcionada. El unico punto de referencia directo es el modelo base Qwen2.5-1.5B-Instruct, del que hereda arquitectura y tokenizador.

## Limitaciones y advertencias

- Con 1,5 B de parametros, las respuestas suelen estar bien formateadas pero son factualmente incorrectas con frecuencia; el autor lo advierte explicitamente: el modelo aprende una *forma* de responder, no conocimiento.
- No debe anadirse un system prompt propio: el modelo fue entrenado y evaluado sin uno, y hacerlo puede alterar el comportamiento esperado.
- El enrutamiento de estilo depende de la formulacion de la pregunta; preguntas ambiguas pueden producir el formato equivocado.
- Solo se publica Q8_0; las cuantizaciones mas agresivas (Q5_K_M, Q4_K_M) degradan la puntuacion entre 4 y 5 puntos sobre 50, por lo que no se recomienda su uso si se necesita reproducir el comportamiento evaluado.
- Idioma limitado al frances; no se documenta soporte de otros idiomas.
- No se documentan evaluaciones de sesgo, toxicidad ni robustez frente a prompts adversarios.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- Riesgo de alucinacion alto en preguntas factuales, dado el tamano del modelo y el enfoque del ajuste fino en formato.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DavidJLN/merge-or-mix-1.5b-GGUF
- Modelo base: https://huggingface.co/DavidJLN/merge-or-mix-1.5b
- Repositorio del experimento: https://github.com/DavidJLN/merge-llm
- Modelo original Qwen2.5-1.5B-Instruct (referencia): https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
