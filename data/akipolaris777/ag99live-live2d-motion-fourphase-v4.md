# AkiPolaris777/ag99live-live2d-motion-fourphase-v4

## Resumen

AG99live Live2D Motion Fourphase v4 es un adaptador LoRA experimental publicado por el usuario AkiPolaris777 sobre el modelo base XHToken/Spark-X2.6-1.7B-Base (1.700 millones de parametros). No es un modelo de chat generalista: su funcion especifica es transformar dialogo en lenguaje natural en intenciones de movimiento para personajes Live2D, emitiendo JSON estructurado con cuatro fases continuas (enter, hold, release, settle), duraciones por fase y estadisticas de parametros (`median`, `observed_min`, `observed_max`). Se enmarca en el proyecto AG99live, disponible en GitHub, que actua como capa intermedia entre un modelo conversacional y el runtime de Live2D/VTube Studio.

El modelo resuelve un problema acotado: traducir semantica conversacional a trayectorias de parametros faciales y corporales (cabeza, ojos, cuerpo, expresiones) que el runtime pueda validar y reproducir. Mantiene ademas el campo `motion_steps` para compatibilidad con cadenas de reproduccion existentes. Esta pensado para integrarse como provider independiente y para ejecutarse en paralelo con modelos tipo DeepSeek en modo sombra, con el fin de comparar salidas y recoger datos reales.

Es relevante ahora por su caracter de prototipo abierto y verificable: el autor documenta explicitamente que solo se entrenó con 145 muestras de cuatro fases, que no es el modelo de produccion estable (que seria la version v7) y que la generalizacion en acciones complejas es limitada. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y ocupa 0.0 GB, lo que sugiere que solo contiene el adapter, el tokenizer y un resumen de entrenamiento, sin dataset ni grabaciones de VTS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (base: XHToken/Spark-X2.6-1.7B-Base) |
| Parametros totales | 1.7B en el modelo base; el adapter LoRA no declara numero de parametros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se menciona una variante Q8 y un tag Ollama `:f16`, pero sin detalle de esquemas) |
| Idiomas soportados | no disponible (la model card esta en chino; no se declara cobertura linguistica) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adapter PEFT); conversion a GGUF para Ollama mencionada |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA cargado mediante `peft.PeftModel` sobre `XHToken/Spark-X2.6-1.7B-Base`, un modelo causal de 1.700 millones de parametros que requiere `trust_remote_code=True` para cargarse. La innovacion no reside en la arquitectura del transformer subyacente, sino en el esquema de salida supervisado: el modelo aprende a emitir un JSON con cuatro fases continuas de movimiento (enter, hold, release, settle), duraciones por fase y un resumen estadistico de cada parametro (`median`, `observed_min`, `observed_max`), conservando `motion_steps` como formato de compatibilidad.

El entrenamiento se realizo con solo 145 muestras de cuatro fases, segun declara el autor, y su objetivo era validar el pipeline de entrenamiento de movimiento continuo en cuatro etapas, no producir un modelo de produccion. No se documentan numero de tokens, composicion del dataset, ni uso de RLHF o DPO. El repositorio incluye el adapter, el tokenizer y un resumen de resultados de entrenamiento, pero excluye las conversaciones originales, la base de datos de grabaciones de parametros VTS y el dataset completo. Se proporciona un SHA256 del adapter (`C7A6AE08D29C9DDEA9C35A4C2DAD0F224A48C57A58323D06F4C55FBFFEB5A17C`) para verificacion de integridad.

## Capacidades

- Generacion de intenciones de movimiento Live2D a partir de dialogo en lenguaje natural, en formato JSON estructurado.
- Estructuracion en cuatro fases continuas (enter, hold, release, settle) con duracion por fase.
- Emision de estadisticas por parametro (`median`, `observed_min`, `observed_max`) para reconstruir trayectorias.
- Control de cabeza, ojos, cuerpo y expresiones faciales a traves de la capa de mapeo del runtime.
- Compatibilidad con cadenas de reproduccion existentes mediante el campo `motion_steps`.
- Carga como adapter LoRA con PEFT y conversion a GGUF para su uso en Ollama (tag `ag99-live2d-motion-fourphase-v4:f16`).
- Ejecucion en modo sombra en paralelo con otros modelos (p. ej. DeepSeek) para comparacion de salidas.
- No se declaran capacidades de tool calling, agentes multi-paso, vision, audio ni modo thinking.

## Casos de uso

- Prototipado de avatares VTuber: el adapter traduce el texto de un chat a intenciones de movimiento que el runtime de AG99live valida y mapea a parametros concretos como `ParamAngleX` o `ParamEyeBallX`, permitiendo animar un personaje sin animacion manual.
- Investigacion sobre generacion de movimiento continuo: las 145 muestras y el esquema de cuatro fases sirven para estudiar como un LLM de 1.7B representa transiciones (enter, hold, release, settle) y que estadisticas por parametro resultan utiles para reconstruir trayectorias.
- Evaluacion comparativa en modo sombra: al ejecutarse junto a un modelo conversacional de referencia, permite contrastar intenciones de movimiento generadas por ambos y recoger datos reales para reentrenamiento.
- Integracion en pipelines de VTube Studio: el JSON de salida, con rangos observados por parametro, se presta a validacion de rango y limites de seguridad antes de la reproduccion, lo que encaja en un flujo de control con verificacion previa.
- Compatibilidad con infraestructura existente: gracias al campo `motion_steps` y a la conversion a GGUF/Ollama, puede insertarse en cadenas de reproduccion ya desplegadas sin reescribir el reproductor.
- Entorno de desarrollo local: al ser un adapter sobre un modelo de 1.7B, es viable probarlo en una maquina de desarrollo para validar el esquema JSON y el mapeo de parametros antes de escalar a produccion.
- Generacion de datos sinteticos de movimiento: las salidas estructuradas pueden usarse como candidatos para anotacion y filtrado humano, alimentando el siguiente ciclo de entrenamiento del proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (ni MMLU, ni HumanEval, ni evaluaciones especificas de fidelidad de movimiento). Solo se menciona cualitativamente que la version v4 produce salidas mas largas y una inferencia mas lenta que la variante Q8, y que ciertas acciones pueden degradarse al formato de compatibilidad `motion_steps`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia orientativa, un modelo base de 1.7B en FP16 requiere del orden de 3,4 GB solo para pesos, mas overhead de activaciones y KV cache; el adapter LoRA anade una cantidad marginal. Estas cifras son estimaciones genericas y no datos publicados por el autor.
- GPU recomendadas: no disponible. Por tamano, el modelo base es susceptible de ejecutarse en GPUs consumer, pero el autor no publica requisitos.
- Cabe en GPU consumer: probablemente si, dado el tamano del base (1.7B), aunque no hay confirmacion oficial ni lista de modelos probados.
- Opciones de despliegue: PEFT + Transformers (carga documentada con `trust_remote_code=True`), y Ollama mediante conversion a GGUF (tag `ag99-live2d-motion-fourphase-v4:f16`). No se mencionan vLLM, TGI ni llama.cpp de forma directa.
- Latencia y throughput: no disponibles. Solo se indica que la inferencia es mas lenta que la version Q8 debido a salidas mas largas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AG99live Live2D Motion Fourphase v4 (este) | 1.7B (base) + LoRA | no disponible | Generacion de movimiento Live2D en JSON de cuatro fases | no disponible | Hugging Face, 0 descargas |
| AG99live version estable v7 (mencionada por el autor) | no disponible | no disponible | Generacion de movimiento Live2D | no disponible | Referenciada en la model card como fallback estable, sin enlace directo |
| XHToken/Spark-X2.6-1.7B-Base | 1.7B | no disponible | Modelo causal base de proposito general | no disponible | Hugging Face (modelo base) |
| DeepSeek (modo sombra) | no disponible | no disponible | Modelo conversacional usado en paralelo para comparacion | no disponible | No se especifica version ni repositorio |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria (generacion de movimiento para avatares). La comparativa se limita a posicionamiento funcional.

## Limitaciones y advertencias

- Modelo explicitamente experimental: el autor lo describe como un producto para casos especiales y no como el modelo de produccion estable del proyecto; recomienda mantener la v7 como fallback.
- Entrenado con solo 145 muestras de cuatro fases, lo que limita la generalizacion en acciones complejas.
- Salidas mas largas que la variante Q8, con inferencia mas lenta.
- Algunas acciones pueden degradarse al formato de compatibilidad `motion_steps`, reduciendo la fidelidad del movimiento continuo.
- Los parametros continuos requieren validacion de rango y limites de seguridad en el runtime antes de reproducirse; el modelo no garantiza valores validos por si mismo.
- Licencia no declarada: no hay base explicita para uso comercial; debe consultarse con el autor.
- Idiomas soportados no declarados; la model card esta en chino y no se especifica cobertura multilingue.
- Sin datos publicados sobre sesgos, tasa de alucinacion o robustez; al ser un modelo de 1.7B con fine-tuning escaso, es esperable una fiabilidad limitada fuera de la distribucion de entrenamiento.
- El repositorio no incluye dataset, conversaciones originales ni grabaciones de VTS, lo que dificulta la reproducibilidad del entrenamiento.
- Sin descargas ni validacion de la comunidad en el momento de la consulta (0 descargas, 0 likes).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AkiPolaris777/ag99live-live2d-motion-fourphase-v4
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-1.7B-Base
- Repositorio del proyecto AG99live: https://github.com/murphys7017/AG99live
- Paper, blog o demo adicionales: no disponible
