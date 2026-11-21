# lecheyne24/qwen2.5-3b-abliterated

## Resumen

qwen2.5-3b-abliterated es una variante "abliterated" (sin censura) del modelo Qwen2.5-3B-Instruct de Alibaba, publicada por el usuario lecheyne24. El autor aplica una tecnica de ablacion de la direccion de rechazo (refusal-direction ablation) sobre los pesos del modelo base y despues realiza un ajuste fino supervisado con LoRA sobre un corpus de respuestas directas, fusiona el adaptador, convierte el resultado a GGUF y lo cuantiza a Q4_K_M para su uso con llama.cpp.

El objetivo es eliminar los rechazos de seguridad aprendidos durante el alineamiento del modelo original, de modo que responda de forma directa a peticiones que el modelo base tenderia a declinar. Es un modelo pequeno (3.085.938.688 parametros, aproximadamente 3B), pensado para ejecucion local en hardware modesto mediante llama.cpp.

La relevancia es limitada: se trata de una publicacion de nicho con muy poca traccion (2 descargas, 0 likes en el momento de la consulta) y sin model card detallada sobre datos de entrenamiento, evaluacion formal o licencia. Su interes practico reside en servir como ejemplo de la tecnica de abliteration aplicada a un modelo denso de 3B y en su facilidad de despliegue como endpoint compatible con OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-3B-Instruct) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de ejecucion usa `-c 4096`) |
| Tipos de cuantizacion | Q4_K_M (unica cuantizacion publicada segun la model card) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`qwen-unbound-3b.Q4_K_M.gguf`) y safetensors (segun tags del repo) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer denso de aproximadamente 3B parametros. Sobre esa base, el autor aplica abliteration: una tecnica que identifica la direccion en el espacio de activaciones asociada a los rechazos y la elimina o proyecta fuera de los pesos, reduciendo la probabilidad de respuestas de negativa. Posteriormente realiza un ajuste fino supervisado con LoRA sobre un "plain-answer corpus" (corpus de respuestas directas), fusiona el adaptador con los pesos base, convierte el modelo a formato GGUF y lo cuantiza a Q4_K_M con `llama-quantize --allow-requantize`.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del corpus de SFT, ni si hubo etapas de RLHF o DPO adicionales. El autor reporta una evaluacion informal propia ("plain-answer gauntlet") con resultado 7/8, fallando solo en una prueba de regla frente a realidad con la respuesta "Jogging is running.". No hay datos sobre innovaciones arquitectonicas adicionales; el modelo hereda la arquitectura y el tokenizador del Qwen2.5-3B-Instruct original.

## Capacidades

- Generacion de texto conversacional en formato chat, heredada de Qwen2.5-3B-Instruct.
- Respuestas directas sin rechazos de seguridad en temas que el modelo base declinaria (comportamiento "uncensored").
- Razonamiento basico y respuesta a instrucciones, limitado por el tamano de 3B parametros.
- Generacion de codigo y matematicas a nivel basico, segun las capacidades del modelo base.
- Soporte de tool calling y function calling heredado del modelo base (no verificado en esta variante).
- Capacidades multilingues heredadas de Qwen2.5 (idiomas exactos no disponibles).
- Servido como endpoint compatible con OpenAI mediante `llama-server`.

## Casos de uso

- Investigacion sobre tecnicas de abliteration: el modelo sirve como caso de estudio reproducible para analizar como la ablacion de la direccion de rechazo afecta al comportamiento del modelo y a su calidad general, comparando con el Qwen2.5-3B-Instruct original.
- Experimentacion con modelos sin censura en entornos controlados: util para estudiar sesgos, robustez y alineamiento en laboratorios que necesitan un modelo que no filtre respuestas por politicas de seguridad.
- Prototipado local de asistentes conversacionales: con 3B parametros en Q4_K_M cabe en GPU de consumo y permite iterar rapidamente en el diseno de prompts y flujos de chat sin coste de API.
- Despliegue de un endpoint compatible con OpenAI en local: el comando `llama-server -m qwen-unbound-3b.Q4_K_M.gguf --port 8081 -c 4096 --alias qwen2.5-3b` expone `http://localhost:8081/v1`, integrable en aplicaciones que ya usan el SDK de OpenAI.
- Generacion de texto creativo sin restricciones tematicas: escritura de ficcion, guiones o narrativa que aborde temas sensibles sin las negativas del modelo alineado.
- Evaluacion comparativa de seguridad: usar el modelo junto al base para medir diferencias en tasas de rechazo, toxicidad y fidelidad factual en pipelines de evaluacion de alineamiento.
- Educacion y divulgacion: demostrar en talleres como funciona la cuantizacion GGUF y la ejecucion local de modelos mediante llama.cpp con un modelo pequeno y ligero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de evaluacion es la prueba informal del autor ("plain-answer gauntlet": 7/8), que no constituye un benchmark estandarizado ni comparable con MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion Q4_K_M, el archivo pesa aproximadamente 2 GB, por lo que la VRAM necesaria ronda los 2,5-3,5 GB incluyendo contexto y overhead de llama.cpp.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema (las dos ultimas con enorme margen).
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de consumo con 4 GB o mas de VRAM; tambien puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), y potencialmente Ollama u otros runners compatibles con GGUF; no se mencionan vLLM ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles; al ser un modelo de 3B en Q4_K_M se espera una latencia baja en GPU de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| lecheyne24/qwen2.5-3b-abliterated | 3,09B | no disponible | GGUF Q4_K_M, safetensors | no disponible | Variante abliterated con SFT LoRA; 2 descargas |
| Qwen/Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens (segun especificaciones publicas de Qwen2.5) | safetensors, GGUF | Apache 2.0 (segun Qwen) | Modelo base alineado, con rechazos de seguridad |
| Otras variantes abliterated de Qwen2.5-3B | ~3B | variable | GGUF, safetensors | variable | Multiples publicaciones comunitarias con metodologia similar |

La comparativa con otras variantes abliterated concretas no esta disponible en la informacion proporcionada; los datos de Qwen2.5-3B-Instruct se incluyen como referencia del modelo base.

## Limitaciones y advertencias

- La abliteration elimina los rechazos de seguridad, lo que implica que el modelo puede generar contenido danino, ilegal o eticamente problematico; no es apto para aplicaciones de produccion orientadas al publico general sin filtros adicionales.
- Riesgo elevado de alucinacion, acentuado por el tamano de 3B parametros y por el ajuste fino sobre un corpus de respuestas directas que puede priorizar la contundencia sobre la precision.
- La ablacion puede degradar capacidades generales (razonamiento, matematicas, codigo) respecto al modelo base; no hay evaluacion formal que lo cuantifique.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. El modelo base Qwen2.5-3B-Instruct se distribuye bajo Apache 2.0, pero esta variante no declara licencia.
- Idiomas soportados no disponibles; se heredan presumiblemente los del modelo base, pero sin garantia.
- Longitud de contexto no declarada; el ejemplo de ejecucion limita a 4096 tokens, muy por debajo de los 32.768 del modelo base.
- Publicacion de nicho con 2 descargas y 0 likes: sin validacion comunitaria, sin issues reportados y sin mantenimiento conocido.
- La evaluacion del autor es una prueba informal de 8 preguntas, insuficiente para caracterizar el comportamiento del modelo.
- El nombre del archivo (`qwen-unbound-3b.Q4_K_M.gguf`) no coincide con el ID del repositorio, lo que puede generar confusion en la integracion.

## Enlaces

- Hugging Face: https://huggingface.co/lecheyne24/qwen2.5-3b-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
