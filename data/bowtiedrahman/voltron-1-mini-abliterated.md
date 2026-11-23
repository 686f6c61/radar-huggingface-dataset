# bowtiedrahman/voltron-1-mini-abliterated

## Resumen

voltron-1-mini-abliterated es un modelo de generacion de texto en castellano derivado de Akahsizrr/voltron-1-mini, que a su vez es un fine-tune de LFM3-1.7B de Liquid AI. Lo publica el usuario bowtiedrahman en Hugging Face y su rasgo definitorio es que ha sido sometido a abliteration: una edicion directa de pesos que elimina el comportamiento de rechazo (refusal) del modelo base sin reentrenarlo. El resultado es un modelo sin filtrado de seguridad que responde a peticiones que el original rechazaria.

La arquitectura es la de la familia LFM3 (Liquid Foundation Model 3), con 24 capas y 1.728.801.536 parametros totales en formato bf16. Emplea codigo personalizado (`configuration_lfm3.py`, `modeling_lfm3.py`, `lfm3_conv.py`) y requiere `trust_remote_code=True` en Transformers. El repositorio incluye pesos en safetensors y dos cuantizaciones GGUF (Q4_K_M de 1,1 GB y q8_0 de 1,8 GB) para inferencia en CPU con llama.cpp.

Su relevancia es doble: por un lado demuestra el flujo de trabajo de abliteration con Heretic v1.4.0 sobre un modelo pequeno y desplegable en hardware modesto; por otro, es un ejemplo de modelo sin salvaguardas, lo que exige cautela extrema en cualquier uso en produccion. La licencia heredada (LFM Open License v1.0) impone condiciones para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (Liquid Foundation Model 3), transformer con proyecciones conv, 24 capas |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (safetensors), Q4_K_M (GGUF, 1,1 GB), q8_0 (GGUF, 1,8 GB) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (heredada del modelo base) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de voltron-1-mini, un fine-tune de LFM3-1.7B con el mismo diseno de 24 capas. La arquitectura LFM3 incluye proyecciones de salida de atencion, proyecciones de salida de convolucion y proyecciones down del MLP, que son precisamente las matrices sobre las que se aplica la ablacion. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

La innovacion tecnica central es el proceso de abliteration. Para cada proyeccion de salida de atencion, proyeccion de salida de convolucion y proyeccion down del MLP se resta la componente de la matriz de pesos alineada con una direccion de rechazo, con una fuerza de eliminacion que varia segun la profundidad de la capa. La direccion y el calendario de fuerzas provienen de una busqueda de Heretic v1.4.0: 120 ensayos en una unica GPU L4, cada uno calculando medias residuales sobre 400 prompts inocuos y 400 daninos, ortogonalizando la direccion resultante, ablacionando los pesos y puntuando rechazos en prompts daninos reservados frente a la divergencia KL respecto al modelo original. Los parametros ganadores estan en `heretic_trial.json`. Como voltron-1-mini comparte el layout de 24 capas con LFM3-1.7B, el calendario se transfirio desde la busqueda del modelo base sin repetirla.

## Capacidades

- Generacion de texto conversacional en modo chat (`-cnv` en llama.cpp).
- Respuesta a peticiones que el modelo base rechazaria, al haberse eliminado el comportamiento de rechazo.
- Inferencia en CPU mediante llama.cpp y en GPU mediante Transformers.
- Despliegue en entornos con poca memoria gracias a las cuantizaciones GGUF.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling, function calling y agentes: no disponible en la informacion proporcionada.
- Vision, audio o thinking mode: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre comportamiento de rechazo: el modelo sirve para estudiar que tipo de peticiones rechaza un modelo alineado y como cambia la distribucion de respuestas tras la ablacion, comparando con el modelo base.
- Evaluacion de tecnicas de abliteration: permite reproducir y auditar el flujo de Heretic v1.4.0 sobre un modelo pequeno, verificando el efecto de la fuerza de ablacion por capa.
- Inferencia local en equipos modestos: la cuantizacion Q4_K_M (1,1 GB) cabe en maquinas de 8 GB de RAM y permite ejecutar un chat conversacional en CPU con llama.cpp.
- Pruebas de robustez y red teaming: util como sujeto de prueba para medir la eficacia de filtros externos o clasificadores de seguridad al enfrentarse a un modelo sin salvaguardas.
- Prototipado de pipelines de generacion de texto: con Transformers y `trust_remote_code=True` se puede integrar en scripts de generacion por lotes para experimentos academicos.
- Demostraciones y docencia: el Space de demostracion con el quant Q4_K_M permite ilustrar en clase el funcionamiento de un modelo abliterado frente al original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La unica metrica reportada es del modelo base durante la busqueda de Heretic: 98 rechazos por cada 100 prompts daninos antes de la ablacion y 11 despues, con una divergencia KL de 0,055. El autor advierte que esas cifras describen el modelo base y no se han vuelto a medir en este fine-tune.

## Requisitos de hardware

- VRAM estimada: bf16 requiere aproximadamente 3,5 GB solo para pesos; con overhead de activaciones y cache KV conviene reservar 5-6 GB en GPU.
- Cuantizaciones GGUF: Q4_K_M ocupa 1,1 GB y q8_0 ocupa 1,8 GB en disco y memoria.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM para bf16; una L4 (24 GB) se uso para la busqueda de Heretic. Para cuantizaciones, una RTX 3060 de 12 GB o superior es holgada.
- Cabe en GPU consumer: si, en tarjetas de 6-8 GB o mas en bf16, y en equipos de 8 GB de RAM en CPU con Q4_K_M.
- Opciones de despliegue: llama.cpp (compilado desde master, soporte LFM3 desde 2026-10-27), Transformers con `trust_remote_code=True`, y el Space de demostracion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| voltron-1-mini-abliterated | 1,73 B | no disponible | LFM Open License v1.0 | Abliterado, sin filtrado, GGUF disponible |
| Akahsizrr/voltron-1-mini | 1,73 B | no disponible | LFM Open License v1.0 | Modelo base, con comportamiento de rechazo |
| LFM3-1.7B (Liquid AI) | 1,7 B | no disponible | LFM Open License v1.0 | Modelo original de la familia, con alineamiento |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo sin filtrado de seguridad: producira contenido que el original rechaza, incluidas instrucciones para actividades ilegales o daninas. No debe desplegarse donde un modelo sin filtros llegue a usuarios finales.
- La eliminacion de rechazo se calibro sobre el modelo base, no sobre este fine-tune, por lo que la fuerza real de la ablacion puede ser mayor o menor de lo que sugieren las cifras. Se espera eliminacion desigual en prompts alejados de la distribucion de entrenamiento de la ablacion.
- La abliteration elimina comportamiento de rechazo, no limites de capacidad, y no lo hace de forma completa.
- Riesgo de alucinacion: no evaluado en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion disponible.
- Idiomas soportados: no disponibles; no se garantiza un rendimiento multilingue.
- Licencia: LFM Open License v1.0. La redistribucion exige mantener la licencia, marcar los archivos modificados y conservar la atribucion. El uso comercial esta condicionado al umbral de ingresos de la licencia.
- Requiere llama.cpp compilado desde master (versiones precompiladas anteriores rechazan la arquitectura con `unknown model architecture: 'lfm3'`).
- Liquid AI no respalda esta compilacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bowtiedrahman/voltron-1-mini-abliterated
- Modelo base: https://huggingface.co/Akahsizrr/voltron-1-mini
- Demo (Space): https://huggingface.co/spaces/bowtiedrahman/voltron-1-mini-abliterated-demo
- Heretic: https://heretic-project.org
