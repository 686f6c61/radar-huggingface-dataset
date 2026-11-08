# oxyllina/Neurosir

## Resumen

Neurosir es un modelo publicado en Hugging Face por el usuario oxyllina bajo el identificador `oxyllina/Neurosir`. Se distribuye con acceso restringido (gated), lo que obliga a aceptar condiciones en la plataforma antes de poder descargar los pesos. El repositorio ocupa 9,9 GB, un tamano compatible con un modelo de varios miles de millones de parametros en precision de 16 bits, aunque no se ha publicado informacion que confirme la arquitectura ni el numero exacto de parametros.

La informacion publica disponible es muy limitada: no consta pipeline declarado, licencia, idiomas soportados ni resultados de evaluacion. La unica actividad registrada es la actualizacion del repositorio en noviembre de 2026, sin documentacion tecnica asociada. Esto implica que cualquier evaluacion rigurosa del modelo requiere solicitar acceso y realizar pruebas propias de inferencia.

Por tanto, esta ficha recoge los datos verificables del repositorio y marca explicitamente como "no disponible" todo aquello que no puede confirmarse, evitando inferencias no respaldadas por la fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 9,9 GB; no se especifica safetensors, GGUF ni otros) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo (transformer denso, MoE, SSM o hibrido), el numero de parametros, la composicion del dataset de entrenamiento, el volumen de tokens procesados ni si se aplicaron tecnicas de alineacion como RLHF, DPO o RLHF constitucional. Tampoco consta informacion sobre innovaciones tecnicas como atencion lineal, decodificacion especulativa o modos de razonamiento extendido.

El unico dato objetivo es el tamano del repositorio (9,9 GB) y las fechas de creacion (abril de 2026) y ultima actualizacion (noviembre de 2026). Cualquier afirmacion adicional sobre el entrenamiento seria especulativa y no se incluye en esta ficha.

## Capacidades

- Generacion de texto: no confirmada por documentacion oficial; la ficha de Hugging Face no declara pipeline.
- Razonamiento, codigo y matematicas: no disponible.
- Vision, audio u otras modalidades: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modo thinking o razonamiento extendido: no disponible.

## Casos de uso

Dado que no se han publicado capacidades verificadas, los siguientes casos son escenarios plausibles para un modelo de este tamano en el repositorio (9,9 GB), pero deben validarse tras obtener acceso:

- Evaluacion interna de modelos: solicitar acceso al repositorio gated y ejecutar baterias de evaluacion propias (MMLU, GSM8K, HumanEval) para determinar si el modelo es apto para produccion.
- Prototipado de asistentes conversacionales: usar el modelo como base para experimentar con dialogos multi-turno, midiendo latencia y calidad antes de comprometerse con un despliegue.
- Generacion de codigo en entornos controlados: probar el modelo en tareas de autocompletado o generacion de funciones dentro de un pipeline de CI/CD, verificando previamente su calidad con tests automatizados.
- Investigacion academica sobre modelos open source: analizar los pesos para estudiar comportamiento, sesgos o capacidades emergentes, siempre que la licencia (pendiente de confirmar) lo permita.
- Fine-tuning especifico de dominio: si la licencia lo autoriza, adaptar el modelo a un dominio concreto (legal, sanitario, financiero) mediante LoRA o ajuste completo, partiendo de un checkpoint de ~10 GB.
- Despliegue en infraestructura propia: servir el modelo con vLLM, TGI o llama.cpp una vez confirmados los formatos de pesos y los requisitos de VRAM reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision. Como referencia orientativa, un repositorio de 9,9 GB sugiere pesos en fp16 de aproximadamente 5.000 millones de parametros, lo que requeriria del orden de 10-12 GB de VRAM en fp16 y 5-7 GB en cuantizacion de 8 bits, pero esta estimacion no esta confirmada por el autor.
- GPU recomendadas: no disponible. En funcion del tamano real, cabria esperar GPUs consumer como RTX 3090, RTX 4090 o RTX 5090 para fp16, y A100/H100 para despliegues de mayor throughput.
- Compatibilidad con GPU consumer: probable si el modelo ronda los 5.000 millones de parametros, pero no confirmado.
- Opciones de despliegue: no se declaran librerias compatibles. La pagina del autor lista categorias genericas de Hugging Face (vLLM, llama.cpp, Ollama, TGI, MLX, etc.), sin especificar cuales soporta Neurosir.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| oxyllina/Neurosir | no disponible | no disponible | no disponible | Gated en HF | Sin documentacion publica |
| Alternativas de ~5B (p. ej. Qwen2.5-7B, Llama-3.1-8B, Mistral-7B) | 7-8B | 32K-128K | Apache 2.0 / Llama / Apache 2.0 | Abiertas | Amplia documentacion y benchmarks publicos |

No es posible establecer una comparativa tecnica rigurosa con modelos de la misma categoria porque Neurosir no publica parametros, contexto, licencia ni resultados. La comparacion con modelos de 7-8B es meramente orientativa por el tamano del repositorio.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no hay model card con arquitectura, datos de entrenamiento ni evaluaciones, lo que impide validar su calidad de forma objetiva.
- Acceso restringido: requiere aceptar condiciones en Hugging Face; el proceso de aprobacion y los terminos exactos no estan detallados.
- Licencia desconocida: no se puede confirmar si el uso comercial esta permitido; es imprescindible verificar los terminos antes de cualquier despliegue en produccion.
- Riesgo de alucinacion y sesgos: no evaluable sin acceso al modelo y sin benchmarks publicados.
- Idiomas no declarados: no se puede garantizar soporte de castellano ni de otros idiomas.
- Contexto desconocido: imposible planificar casos de uso con documentos largos sin conocer la ventana de contexto.
- Repositorio con 0 descargas y 1 like: indica ausencia de validacion por parte de la comunidad; tratar como modelo experimental.
- Fecha de creacion futura (2026): conviene verificar la autenticidad y procedencia del repositorio antes de confiar en el.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/oxyllina/Neurosir
- Modelos del autor: https://huggingface.co/models?author=oxyllina&sort=modified
