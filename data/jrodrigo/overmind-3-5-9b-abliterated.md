# jrodrigo/Overmind-3.5-9B-Abliterated

## Resumen

Overmind 3.5 9B Abliterated es un modelo de lenguaje de 9.000 millones de parametros publicado por el usuario jrodrigo en Hugging Face. Se construye sobre Qwen/Qwen3.5-9B mediante un ajuste fino con QLoRA orientado a generacion de texto conversacional, y el adaptador resultante se fusiona en los pesos publicados para permitir inferencia autonoma sin necesidad de cargar el adaptador por separado.

La caracteristica definitoria del modelo es su condicion de "abliterated": se han eliminado los comportamientos de rechazo del modelo base, de modo que responde a peticiones que un modelo alineado convencional rechazaria. Esta tecnica se aplica sobre los pesos del transformer original, sin cambiar la arquitectura ni el tamano.

El modelo se distribuye bajo licencia Apache 2.0, declara soporte para ingles y espanol, y se ofrece en formato GGUF en dos cuantizaciones (BF16 y Q5_K_M). Es relevante para equipos que necesitan un modelo conversacional de 9B sin restricciones de rechazo y con despliegue local sencillo, aunque su adopcion es todavia muy limitada (0 descargas en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-9B); detalles no disponibles |
| Parametros totales | 9 000 millones (9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 y Q5_K_M (GGUF); otros formatos no disponibles |
| Idiomas soportados | Ingles (en) y espanol (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (BF16: 17,92 GB; Q5_K_M: 6,47 GB); safetensors no confirmado |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer denso de 9.000 millones de parametros. Sobre esa base se aplica un ajuste fino con QLoRA (cuantizacion de bajo rango) orientado a generacion de texto conversacional. El adaptador resultante se fusiona en los pesos finales, de modo que la distribucion contiene un unico conjunto de pesos listo para inferencia directa.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre innovaciones tecnicas adicionales en la model card publicada. La unica transformacion documentada es la eliminacion de los comportamientos de rechazo (abliteration) sobre el modelo base, sin que se detalle el metodo exacto empleado.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la model card.
- Respuesta a peticiones que modelos alineados convencionalmente rechazan, al haberse eliminado el comportamiento de rechazo.
- Soporte declarado de ingles y espanol.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Razonamiento multi-paso y uso como agente: no disponible en la informacion proporcionada.
- Capacidades de vision, audio o modo "thinking": no disponibles en la informacion proporcionada.
- Capacidades de codigo y matematicas: no documentadas especificamente.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como se comporta un LLM sin rechazos, comparandolo con el Qwen3.5-9B original para analizar que tipos de peticiones deja de bloquear y con que consecuencias.
- Red teaming y evaluacion de robustez: sirve como sujeto de prueba para medir la eficacia de filtros y guardrails externos, ya que el propio modelo no incorpora rechazos internos.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o dialogos que aborden temas sensibles y que un modelo alineado rechazaria; el tamano de 9B permite ejecucion local.
- Despliegue local en estaciones de trabajo: la cuantizacion Q5_K_M (6,47 GB) permite cargar el modelo en GPU de consumo para prototipado y pruebas offline.
- Asistentes conversacionales en espanol e ingles: uso como base para prototipos de chatbot en ambos idiomas declarados, con ajuste adicional sobre el dominio concreto.
- Evaluacion comparativa de tecnicas de abliteration: al existir el modelo base publico, permite medir el impacto de la eliminacion de rechazos sobre calidad, coherencia y sesgos en un mismo tamano y arquitectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 18 GB en BF16 (pesos de 17,92 GB) y en torno a 7-8 GB en Q5_K_M (6,47 GB), mas overhead de contexto.
- GPU recomendadas para BF16: A100 40 GB, H100, L40S o RTX 4090 (24 GB, justo para BF16 sin contexto amplio).
- GPU de consumo: la version Q5_K_M cabe en RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090; en BF16 requiere al menos 24 GB.
- Opciones de despliegue: llama.cpp y Ollama para los GGUF; vLLM o TGI solo si se dispone de pesos en safetensors (no confirmado).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| Overmind 3.5 9B Abliterated | 9B | no disponible | Apache 2.0 | GGUF (BF16, Q5_K_M) | Abliterated, QLoRA sobre Qwen3.5-9B |
| Qwen/Qwen3.5-9B | 9B | no disponible | no disponible en la informacion | no disponible | Modelo base alineado, sin abliteration |
| Otros modelos abliterated indexados | variable | variable | variable | variable | Directorio de referencia: abliteratedmodels.org |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Al estar abliterated, el modelo carece de mecanismos internos de rechazo: puede generar contenido danino, ilegal o sensible sin filtro, por lo que requiere guardrails externos en produccion.
- Riesgo elevado de alucinacion y de respuestas factualmente incorrectas, comun en modelos de 9B y no mitigado de forma documentada.
- No hay informacion sobre sesgos evaluados ni sobre el impacto de la abliteration en la calidad general o en la coherencia del modelo.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificacion empirica.
- Soporte idiomatico limitado a ingles y espanol segun la model card; el rendimiento real en espanol no esta medido.
- Adopcion practicamente nula (0 descargas, 1 like): no hay evidencia de la comunidad sobre su comportamiento real.
- Aunque la licencia es Apache 2.0, se recomienda revisar las condiciones del modelo base Qwen3.5-9B y las obligaciones de atribucion que el autor declara conservar.
- Uso comercial tecnicamente permitido por la licencia, pero con responsabilidad legal y reputacional por el contenido generado sin rechazos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jrodrigo/Overmind-3.5-9B-Abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Indice de modelos abliterated: https://www.abliteratedmodels.org/
- Biblioteca de modelos Overmind: https://www.overmindlab.ai/models
