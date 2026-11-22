# SC117/Inkling-2-Mini-abliterated-FIT-GGUF

## Resumen

Inkling-2-Mini-abliterated-FIT-GGUF es una cuantizacion en formato GGUF del modelo multimodal Inkling-2-Mini, desarrollado originalmente por Thinking Machines y redistribuido por el usuario SC117. Se trata de una variante "abliterated", es decir, con el comportamiento de rechazo atenuado mediante una intervencion sobre las capas de atencion, empaquetada con la herramienta FIT-GGUF para producir niveles de cuantizacion verificados contra un contrato de fidelidad medido en divergencia KL. El modelo base es un Mixture-of-Experts de 128 expertos con vision integrada, 26,4 mil millones de parametros totales y un contexto largo orientado a tareas de agente y razonamiento.

La relevancia de esta ficha reside en que combina tres elementos poco habituales en un mismo artefacto: una arquitectura MoE con paso recurrente ("3 looped passes"), capacidades multimodales imagen-texto, y un proceso de cuantizacion que no se limita a presets estandar sino que selecciona el tamano minimo que cumple un umbral de calidad declarado. El rango de artefactos va desde 9,12 GiB en el nivel "balanced" hasta 48,64 GiB en la referencia BF16, lo que permite desplegar el modelo en hardware muy distinto manteniendo una trazabilidad explicita de la perdida de fidelidad.

El repositorio tiene licencia Apache 2.0 y declara soporte para ingles, chino y multilingue. En el momento de la consulta el repositorio no registra descargas ni interacciones, y su tamano declarado es de 0,0 GB, lo que sugiere que los pesos aun no se han subido o que la metadata no refleja el contenido real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) de 128 expertos con vision, paso recurrente de 3 iteraciones ("inkling2_loop") |
| Parametros totales | 26,4 mil millones (26.4B) |
| Parametros activos | 3,4B base; 5,4B efectivos a lo largo de 3 pasadas recurrentes |
| Longitud de contexto | no disponible (la model card menciona "long-context" sin cifra) |
| Tipos de cuantizacion | FIT tiers (3 niveles verificados), Q6_K nativo, BF16 de referencia; rango 9,12 GiB a 48,64 GiB |
| Idiomas soportados | Ingles (en), chino (zh), multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), con mmproj separado para vision |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos de 128 expertos y un mecanismo de recurrencia por pasadas: el mismo bloque se aplica tres veces, de modo que los 3,4B de parametros base se convierten en 5,4B de parametros efectivamente activos por token. Esta combinacion de MoE y recurrencia busca aumentar la capacidad computacional sin incrementar proporcionalmente el coste de memoria. La variante incorpora ademas un codificador visual empaquetado como mmproj, lo que habilita la pipeline image-text-to-text.

El autor no documenta el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. La intervencion "abliterated" se describe como ATTN-ONLY, es decir, aplicada unicamente a las capas de atencion, y se acompana de comprobaciones de comportamiento ("behavior probes") sobre los bytes entregados para descartar niveles de cuantizacion que colapsan en generacion libre. La cuantizacion se realizo con FIT-GGUF, una capa de planificacion determinista a nivel de tensor sobre el cuantizador de llama.cpp, que resuelve el GGUF mas pequeno que satisface un contrato de KL macro en cinco dominios frente al BF16 del propio repositorio.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con modo de razonamiento declarado en las etiquetas del repositorio.
- Procesamiento de imagen y texto de forma conjunta (pipeline image-text-to-text) mediante el mmproj de vision.
- Capacidades de agente y uso en flujos de multiples pasos, segun la etiqueta "agent".
- Soporte de contexto largo, aunque sin cifra publicada.
- Multilingue con enfasis en ingles y chino.
- Comportamiento "uncensored" derivado de la ablacion de atencion: menor probabilidad de rechazo ante peticiones que el modelo base declinaria.
- Compatibilidad con llama.cpp para inferencia local en CPU y GPU.

## Casos de uso

- Extraccion de informacion de documentos escaneados: la combinacion de vision y contexto largo permite procesar facturas, formularios o contratos con texto e imagenes en una sola pasada, devolviendo campos estructurados.
- Asistentes de soporte tecnico multi-turno: el paso recurrente y el contexto extendido facilitan mantener el hilo de conversaciones largas sin perder referencias anteriores.
- Analisis de capturas de pantalla en herramientas de QA: el modelo puede describir e interpretar interfaces a partir de imagenes y generar informes de incidencias.
- Prototipado de agentes locales: al ejecutarse en llama.cpp con cuantizaciones desde 9,12 GiB, es viable montar agentes en estaciones de trabajo sin GPU de datacenter.
- Generacion de codigo asistida con contexto de repositorio: la ventana larga permite incluir varios ficheros como referencia; conviene validar la calidad real, ya que no hay benchmarks publicados.
- Investigacion sobre alineacion y robustez: la variante abliterated sirve para estudiar como cambia el comportamiento de rechazo al intervenir solo las capas de atencion, comparando contra el modelo base.
- Despliegue en entornos con requisitos de licencia permisiva: Apache 2.0 permite uso comercial sin royalties, sujeto a las obligaciones de atribucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas internas de fidelidad de cuantizacion (divergencia KL macro en cinco dominios frente al BF16 del repositorio y comprobaciones de comportamiento sobre los bytes entregados), sin valores numericos concretos ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: aproximadamente 9-10 GiB para el tier FIT "balanced" de 9,12 GiB, en torno a 20-25 GiB para Q6_K (estimacion a partir del rango declarado, no confirmada) y unos 49 GiB para BF16.
- GPU recomendadas: RTX 4090 (24 GB) para los tiers FIT y Q6_K; A100 40/80 GB o H100 para BF16 y para servir varias peticiones concurrentes.
- Cabe en GPU de consumo: si, en tarjetas de 12 GB o mas para el tier balanced, y en 24 GB para Q6_K. Los tiers superiores requieren multiples GPU o offload a RAM.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama y cualquier frontend compatible con GGUF; el mmproj debe cargarse aparte para habilitar vision.
- Latencia y throughput: no disponibles. Al ser un MoE con 5,4B parametros efectivos, el coste por token deberia ser inferior al de un denso de 26,4B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-abliterated-FIT-GGUF | 26,4B totales / 5,4B efectivos | no disponible | Apache 2.0 | GGUF | Vision, MoE, abliterated |
| thinkingmachines/Inkling-2-Mini | 26,4B totales / 5,4B efectivos | no disponible | Apache 2.0 | no disponible | Modelo base sin ablacion |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- La ablacion de atencion reduce los rechazos del modelo, lo que incrementa el riesgo de generar contenido inapropiado, inseguro o legalmente problematico; no debe desplegarse en produccion sin filtros externos.
- No hay benchmarks publicados: se desconoce el rendimiento real en MMLU, HumanEval, GSM8K u otras tareas estandar, por lo que las afirmaciones de capacidad deben validarse empiricamente.
- El repositorio muestra 0,0 GB de tamano y cero descargas, lo que sugiere que los pesos pueden no estar disponibles o que la metadata esta incompleta; conviene verificar los ficheros antes de integrarlo.
- La longitud de contexto no esta cuantificada; la etiqueta "long-context" no permite planificar despliegues con garantias.
- El soporte de idiomas declarado se limita a ingles, chino y "multilingue" generico; el rendimiento en castellano no esta documentado.
- La cuantizacion introduce perdida de fidelidad respecto al BF16; los tiers FIT la acotan mediante un contrato de KL, pero el autor no publica los valores numericos.
- La licencia Apache 2.0 es permisiva para uso comercial, pero la responsabilidad sobre el comportamiento "uncensored" recae en el desplegador.
- El modelo base pertenece a Thinking Machines; la redistribucion cuantizada no implica respaldo del autor original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SC117/Inkling-2-Mini-abliterated-FIT-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Herramienta FIT-GGUF: https://github.com/Scorp1o117/FIT-GGUF
- README en chino: https://huggingface.co/SC117/Inkling-2-Mini-abliterated-FIT-GGUF/blob/main/README.zh-CN.md
