# richardyoung/Qwen3.5-4B-DiM-heretic-GGUF

## Resumen

Qwen3.5-4B-DiM-heretic-GGUF es una cuantizacion en formato GGUF del modelo richardyoung/Qwen3.5-4B-DiM-heretic, un derivado del Qwen3.5 de 4B parametros publicado por el usuario richardyoung. El modelo se ha sometido a un proceso de "abliteration" (eliminacion de los mecanismos de rechazo) y se distribuye bajo la etiqueta "heretic", lo que indica que ha sido modificado para reducir las negativas a generar contenido que el modelo original rechazaria. El repositorio incluye variantes cuantizadas con imatrix, pensadas para su uso con llama.cpp y Ollama.

Con 4.205.751.296 parametros (aproximadamente 4,2 mil millones) y un tamano de repositorio de 18,4 GB, se trata de un modelo de generacion de texto orientado a conversacion, con licencia Apache 2.0 y acceso restringido (gated) en Hugging Face. La informacion publica disponible es limitada: no se detallan la longitud de contexto, la composicion del dataset de entrenamiento ni resultados de benchmarks, por lo que varios apartados de esta ficha se marcan como "no disponible".

El interes actual de este modelo reside en su perfil: un modelo pequeno (4B) cuantizado en GGUF, ejecutable en hardware de consumo, sin restricciones de rechazo y con licencia permisiva. Es relevante para investigadores que estudian el comportamiento de modelos "abliterated" y para desarrolladores que necesitan un modelo local sin censura para tareas de generacion creativa o experimentacion, asumiendo los riesgos asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Qwen3.5, presumiblemente transformer decoder-only) |
| Parametros totales | 4.205.751.296 (aprox. 4,2B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con imatrix (variantes concretas no detalladas en la informacion disponible) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la informacion proporcionada. Por el nombre y el modelo base (Qwen3.5), cabe inferir una arquitectura transformer decoder-only, pero este dato no esta confirmado en la ficha del repositorio. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica destacable es el proceso de "abliteration" aplicado al modelo base richardyoung/Qwen3.5-4B-DiM-heretic, que elimina o atenua las direcciones de activacion responsables del rechazo de peticiones. La cuantizacion GGUF se ha realizado con imatrix (matriz de importancia), una tecnica que mejora la calidad de las cuantizaciones de baja precision al ponderar los pesos segun su relevancia. No se detalla el metodo exacto de abliteration ni los datos usados para calibrar la imatrix.

## Capacidades

- Generacion de texto conversacional en ingles.
- Reduccion de rechazos: el proceso "heretic"/abliterated elimina las negativas del modelo original ante peticiones que este rechazaria.
- Ejecucion local en CPU y GPU mediante llama.cpp y Ollama, gracias al formato GGUF.
- Compatibilidad con endpoints (tag endpoints_compatible).
- Capacidades de razonamiento y codigo: no confirmadas en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles segun los tags.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Experimentacion en investigacion sobre alineacion: el modelo permite estudiar como varia el comportamiento de un modelo tras la abliteration, comparando sus respuestas con las del Qwen3.5 original en tareas de rechazo.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que el modelo base podria rechazar por contenido sensible, ejecutada localmente con Ollama.
- Despliegue en hardware de consumo: al ser un 4B cuantizado en GGUF, puede ejecutarse en portatiles con GPU modesta o incluso en CPU, lo que lo hace util para prototipado offline.
- Analisis de robustez y seguridad: investigadores pueden usar el modelo como caso de estudio para evaluar filtros de moderacion externos, ya que el propio modelo no incorpora rechazos.
- Generacion de texto en pipelines locales: integracion en herramientas de escritura asistida o chatbots privados que no dependan de APIs externas.
- Evaluacion de cuantizaciones: las variantes imatrix permiten comparar la degradacion de calidad entre niveles de cuantizacion sobre un mismo modelo base.
- Docencia y demostraciones: ejemplo practico de cuantizacion GGUF y de los efectos de la abliteration en un modelo pequeno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; para un modelo de 4,2B en GGUF, las cuantizaciones de 4 bits suelen ocupar en torno a 2,5-3 GB y las de 8 bits en torno a 4,5-5 GB, aunque estas cifras no estan confirmadas en la informacion proporcionada.
- GPU recomendadas: no disponible en la informacion; por tamano, cabria esperar que funcione en GPUs de consumo como RTX 3060, RTX 4060 o superiores, pero no esta confirmado.
- Cabe en GPU de consumo: probablemente si, dado el tamano del modelo, aunque no confirmado en la informacion disponible.
- Opciones de despliegue: llama.cpp, Ollama (segun los tags del repositorio).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| richardyoung/Qwen3.5-4B-DiM-heretic-GGUF | 4,2B | no disponible | Apache 2.0 | Gated en HF, GGUF |
| richardyoung/Qwen3.5-4B-DiM-heretic (base) | 4,2B | no disponible | Apache 2.0 | HF (modelo base del que deriva) |
| Qwen3.5-4B (original) | aprox. 4B | no disponible | no disponible en esta informacion | no disponible en esta informacion |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas. La comparacion se limita a parametros, licencia y formato de distribucion.

## Limitaciones y advertencias

- Modelo "abliterated"/"heretic": no incorpora mecanismos de rechazo, por lo que puede generar contenido ofensivo, ilegal o danino sin advertencia. Requiere moderacion externa en cualquier despliegue publico.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano; no se han publicado evaluaciones de fidelidad.
- Solo soporta ingles segun los tags; el rendimiento en castellano no esta verificado.
- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar el modelo.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo modificado; el usuario asume la responsabilidad legal del contenido generado.
- Al ser un derivado no oficial de Qwen3.5, no cuenta con el soporte ni las garantias del equipo original de Qwen.
- No se dispone de informacion sobre la longitud de contexto efectiva ni sobre la degradacion de calidad de las distintas cuantizaciones.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/richardyoung/Qwen3.5-4B-DiM-heretic-GGUF
- Modelo base: https://huggingface.co/richardyoung/Qwen3.5-4B-DiM-heretic
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
