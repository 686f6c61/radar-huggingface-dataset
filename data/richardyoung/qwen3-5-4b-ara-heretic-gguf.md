# richardyoung/Qwen3.5-4B-ARA-heretic-GGUF

## Resumen

Qwen3.5-4B-ARA-heretic-GGUF es una cuantizacion en formato GGUF del modelo richardyoung/Qwen3.5-4B-ARA-heretic, un derivado de la familia Qwen3.5 de 4B parametros sometido a un proceso de "abliteration" (eliminacion de rechazos) mediante la herramienta Heretic, que produce variantes "uncensored" orientadas a investigacion. El autor, richardyoung, publica el resultado en formato GGUF optimizado con imatrix para su uso en llama.cpp y Ollama, lo que facilita su despliegue en hardware de consumo.

El modelo cuenta con 4.205.751.296 parametros totales y esta pensado para generacion de texto conversacional en ingles. Su interes principal reside en que permite estudiar el comportamiento de un modelo al que se le han reducido los mecanismos de rechazo, manteniendo la base arquitectonica de Qwen3.5, y todo ello con licencia Apache 2.0 y pesos cuantizados listos para inferencia local.

La relevancia actual del modelo es doble: por un lado, sirve como objeto de estudio para investigadores interesados en alineacion, seguridad y comportamientos derivados del abliteration; por otro, su formato GGUF con cuantizaciones imatrix lo convierte en una opcion practica para prototipado rapido en equipos sin GPU de datacenter. El acceso esta restringido (gated) en Hugging Face y requiere aceptar las condiciones del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen3.5, transformer) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con imatrix (variantes concretas no disponibles) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp, Ollama) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Qwen3.5-4B, por lo que se asume una arquitectura transformer decoder-only propia de la familia Qwen3.5, sin confirmacion explicita en los metadatos. El modelo es un derivado de richardyoung/Qwen3.5-4B-ARA-heretic, que a su vez procede de un Qwen3.5-4B original.

El proceso de entrenamiento especifico no esta documentado en la informacion proporcionada. Lo que si se conoce es el pipeline de transformacion: se ha aplicado Heretic, una tecnica de abliteration que modifica los pesos para reducir la tendencia del modelo a rechazar peticiones, y posteriormente se ha cuantizado a GGUF con imatrix (importance matrix) para preservar la calidad en precision reducida. No se dispone de datos sobre numero de tokens de entrenamiento, composicion del dataset ni uso de RLHF/DPO en el modelo original.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento y respuesta a instrucciones heredadas de la base Qwen3.5-4B.
- Comportamiento "uncensored": menor tendencia a rechazar peticiones que el modelo original, fruto del abliteration.
- Compatibilidad con llama.cpp y Ollama gracias al formato GGUF.
- Compatible con endpoints (tag endpoints_compatible).
- Soporte de tool calling, agentes o modos de pensamiento: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como el abliteration altera la distribucion de respuestas y los mecanismos de rechazo, comparando su comportamiento con el modelo base sin modificar.
- Prototipado local de asistentes conversacionales: al estar en GGUF, se puede ejecutar en portatiles o estaciones de trabajo con GPU de consumo para validar flujos de chat antes de escalar a modelos mayores.
- Evaluacion de tecnicas de cuantizacion: las variantes imatrix permiten medir la degradacion de calidad frente al modelo en precision completa en tareas de generacion de texto.
- Generacion de texto creativo sin restricciones: util en entornos de investigacion donde se necesita explorar respuestas que un modelo alineado rechazaria, siempre con supervision humana.
- Benchmarking de herramientas de inferencia: sirve para comparar rendimiento entre llama.cpp, Ollama y otros runners sobre un mismo modelo de 4B.
- Educacion y demos: su tamano reducido y su licencia Apache 2.0 facilitan su uso en talleres y cursos sobre modelos de lenguaje y tecnicas de modificacion de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 4B en GGUF, las cuantizaciones de 4 bits rondarian los 2,5-3 GB y las de 8 bits en torno a 4,5-5 GB; las cifras exactas dependen de la variante concreta, no disponible en la informacion.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090 o superiores son adecuadas.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas modernas con 8 GB o mas para cuantizaciones de 4-5 bits.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runner compatible con GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| richardyoung/Qwen3.5-4B-ARA-heretic-GGUF | 4.205.751.296 | no disponible | apache-2.0 | GGUF | Variante abliterated cuantizada |
| richardyoung/Qwen3.5-4B-ARA-heretic | 4.205.751.296 | no disponible | apache-2.0 | safetensors (presumible) | Modelo base sin cuantizar |
| Qwen3.5-4B original | 4B (aproximado) | no disponible | no disponible | no disponible | Modelo alineado de referencia |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- El abliteration elimina parte de los mecanismos de rechazo, lo que puede producir contenido inapropiado, ofensivo o inseguro; no debe desplegarse en produccion orientada a usuarios sin filtros adicionales.
- Riesgo elevado de alucinacion, comun en modelos de 4B y potencialmente agravado por la modificacion de pesos.
- Soporte limitado al ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- La longitud de contexto no esta documentada, lo que impide planificar casos de uso con ventanas largas.
- El acceso es restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo abliterated puede conllevar riesgos reputacionales y de cumplimiento; se recomienda revision legal.
- No hay informacion sobre sesgos especificos ni sobre la composicion del dataset de entrenamiento original.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Qwen3.5-4B-ARA-heretic-GGUF
- Modelo base: https://huggingface.co/richardyoung/Qwen3.5-4B-ARA-heretic
- Heretic (herramienta de abliteration): no disponible en la informacion proporcionada
- llama.cpp: no disponible en la informacion proporcionada
- Ollama: no disponible en la informacion proporcionada
