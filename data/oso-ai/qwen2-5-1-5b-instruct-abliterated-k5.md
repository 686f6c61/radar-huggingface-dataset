# OSO-AI/Qwen2.5-1.5B-Instruct-abliterated-k5

## Resumen

OSO-AI/Qwen2.5-1.5B-Instruct-abliterated-k5 es un artefacto de investigacion derivado de Qwen/Qwen2.5-1.5B-Instruct, el modelo instructivo de 1.500 millones de parametros de la familia Qwen2.5 de Alibaba. El autor, OSO-AI, le ha aplicado una tecnica de "abliteracion" (ablacion del subespacio de rechazo) que elimina quirurgicamente la direccion de activacion responsable de las negativas del modelo ante peticiones consideradas daninas. El resultado es un modelo que practicamente no rechaza instrucciones, con una tasa de rechazo medida del 5,0 % frente al 97,5 % del modelo base.

La innovacion tecnica respecto a abliteraciones previas es el uso de un subespacio de 5 dimensiones por capa (obtenido por PCA sobre diferencias de activacion entre pares de prompts coincidentes) en lugar de proyectar una unica direccion con fuerza sobredimensionada. Segun la model card, esto reduce el rechazo del 17,5 % al 5,0 % eliminando a la vez la degeneracion de salida (0,0 % frente al 10,0 %) y manteniendo una perplejidad comparable (13,18 frente a 12,87 en wikitext).

Se trata de un modelo pequeno (1.543.714.304 parametros reales), con licencia Apache 2.0, publicado en safetensors y GGUF, y orientado explicitamente a investigacion en interpretabilidad y seguridad de LLM. No es un producto ni una herramienta de produccion segun su propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), 28 bloques |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens; el autor no lo especifica) |
| Tipos de cuantizacion | GGUF disponible, verificado a Q4_K_M (986 MB); otros niveles no especificados |
| Idiomas soportados | no disponible (el modelo base es multilingue; el autor no documenta idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2.5 con 28 bloques, sin mixture-of-experts. No ha sido reentrenado desde cero: parte de los pesos de Qwen2.5-1.5B-Instruct y aplica una modificacion post-entrenamiento sobre las matrices de pesos. Concretamente, el metodo recoge diferencias de activacion entre respuestas de rechazo y de cumplimiento para 40 prompts daninos, cada uno en dos contextos de system prompt (diseno de pares coincidentes de Arditi et al. 2024). Sobre esas diferencias se aplica PCA por capa, obteniendo una base ortonormal de las 5 direcciones principales (que explican de media el 70,5 % de la varianza). Finalmente se "cuece" la transformacion W ← W − V₅V₅ᵀW en las proyecciones `o_proj` y `down_proj` de las 28 capas con fuerza exacta 1.0.

La innovacion destacable es demostrar que el rechazo no es una direccion unica sino un subespacio de aproximadamente 5 dimensiones por capa. La evaluacion se hizo con deteccion de degeneracion por bucle de repeticion y por palabras clave de rechazo, con n=40 y decodificacion codiciosa. El autor reporta que la ablacion sobrevive a la cuantizacion a Q4_K_M en llama.cpp con salida fluida.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base instructivo.
- Razonamiento y matematicas basicas propias de un modelo de 1.500 millones de parametros.
- Generacion de codigo a nivel de modelo pequeno.
- Cumplimiento de practicamente cualquier instruccion: la tasa de rechazo medida es del 5,0 %.
- Capacidad multilingue heredada de Qwen2.5 (no documentada por el autor).
- Compatible con endpoints (tag `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, ni modo de razonamiento explicito.

## Casos de uso

- Investigacion en interpretabilidad: analisis del subespacio de rechazo por capa, comparando activaciones entre el modelo base y el abliterado para estudiar donde y como se representa la negativa.
- Investigacion en seguridad y alineacion: evaluacion de tecnicas de eliminacion de rechazo y su impacto en la degeneracion y la perplejidad, con el codigo de reproduccion disponible en el repositorio del autor.
- Experimentos de red-teaming controlados: banco de pruebas para estudiar que tipos de peticiones dejan de ser rechazadas y con que calidad de respuesta.
- Prototipado local en hardware modesto: con 1.500 millones de parametros y GGUF Q4_K_M de 986 MB, cabe en CPU y en GPUs de consumo, util para demos de inferencia sin restricciones.
- Generacion de texto creativo sin filtros: escritura de ficcion o contenido que el modelo base rechazaria por precaucion excesiva, en entornos controlados.
- Docencia: ejemplo practico de como una intervencion de pesos altera el comportamiento de seguridad de un LLM sin reentrenar, con metricas antes/despues publicadas.

## Benchmarks y rendimiento

Datos publicados en la model card (n=40, evaluacion protegida contra degeneracion, decodificacion codiciosa):

| Metrica | Baseline | abliterated-s2 (1 dir, s=2) | abliterated-k5 |
|---|---|---|---|
| Rechazo a peticiones daninas | 97,5 % | 17,5 % | 5,0 % |
| Salida degenerada en peticiones daninas | 0,0 % | 10,0 % | 0,0 % |
| Cumplimiento real en peticiones daninas | 2,5 % | 72,5 % | 95,0 % |
| Falso rechazo en peticiones benignas | 10,0 % | 0,0 % | 0,0 % |
| Perplejidad (wikitext) | 9,44 | 12,87 | 13,18 |

Barrido de k (rechazo / degeneracion / cumplimiento real @ perplejidad): k=1: 95/0/5 @ 9,81 · k=2: 55/5/40 @ 10,39 · k=3: 18/2/80 @ 12,12 · k=5: 5/0/95 @ 13,18. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3,1 GB solo de pesos, mas overhead de KV cache y activaciones.
- GGUF Q4_K_M verificado: 986 MB, cabe en cualquier GPU de consumo moderna y en CPU.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para mayor throughput; tambien viable en CPU.
- Despliegue: llama.cpp (verificado por el autor), Ollama, vLLM y TGI por compatibilidad con safetensors y arquitectura Qwen2.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazo medido | Perplejidad | Licencia |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct-abliterated-k5 | 1,54 B | no disponible | 5,0 % | 13,18 | Apache 2.0 |
| Qwen2.5-1.5B-Instruct (base) | 1,54 B | 32.768 | 97,5 % | 9,44 | Apache 2.0 |
| abliterated-s2 (version previa del autor) | 1,54 B | no disponible | 17,5 % | 12,87 | Apache 2.0 |
| Otras abliteraciones comunitarias de Qwen2.5-1.5B | 1,54 B | variable | no disponible | no disponible | variable |

La comparativa se limita a variantes del mismo modelo base porque no se dispone de datos de benchmarks estandar para contrastar con modelos de otros autores.

## Limitaciones y advertencias

- Modelo explicitamente etiquetado como artefacto de investigacion, no como producto ni herramienta; el autor declara que la responsabilidad de las salidas recae en el usuario.
- Elimina deliberadamente las salvaguardas de seguridad: la tasa de rechazo cae al 5,0 %, por lo que puede producir contenido danino, ilegal o inseguro.
- La evaluacion se realizo con solo 40 prompts y decodificacion codiciosa; la significacion estadistica es limitada.
- La perplejidad aumenta de 9,44 a 13,18 respecto al base, lo que indica cierta degradacion en la calidad del modelado del lenguaje.
- No hay datos publicados de sesgos, alucinacion ni comportamiento en idiomas distintos del ingles.
- Riesgo de degeneracion por bucles de repeticion, aunque no se observo en la evaluacion protegida.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el uso en produccion de un modelo sin filtros de seguridad puede incumplir normativas de moderacion de contenido y politicas de plataforma.
- No se documenta la longitud de contexto efectiva tras la modificacion de pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OSO-AI/Qwen2.5-1.5B-Instruct-abliterated-k5
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de reproduccion: https://github.com/OSOSerious/oso-obliterated-models-
- Paper de referencia (Arditi et al. 2024, *Refusal in Language Models Is Mediated by a Single Direction*): no disponible el enlace en la informacion proporcionada.
