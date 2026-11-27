# richardyoung/gemma-4-31B-it-ARA-heretic-GGUF

## Resumen

richardyoung/gemma-4-31B-it-ARA-heretic-GGUF es una cuantizacion en formato GGUF de un modelo derivado de la familia Gemma 4 de Google, publicado por el usuario richardyoung en Hugging Face. El modelo base (richardyoung/gemma-4-31B-it-ARA-heretic) parte de una version instruction-tuned de Gemma 4 de aproximadamente 30.700 millones de parametros y le aplica tecnicas de "abliteration" o "heretizacion", un proceso de modificacion de pesos orientado a reducir los rechazos y el comportamiento de censura del modelo original. Esta version GGUF esta pensada para su uso con llama.cpp y Ollama, e incluye cuantizaciones generadas con imatrix.

El modelo resuelve el problema de desplegar un LLM de gran tamano (unos 31.000 millones de parametros) en entornos locales o con hardware limitado, ofreciendo pesos cuantizados que reducen el uso de VRAM y permiten ejecucion en GPUs de consumo o en CPU. La relevancia actual radica en la demanda de modelos abiertos menos restrictivos para investigacion y para aplicaciones donde los filtros de seguridad del modelo original resultan demasiado conservadores.

La informacion disponible es limitada: se trata de un modelo alojado con acceso restringido (gated), con 748 descargas y 1 like en el momento de la consulta, y no se han publicado resultados de benchmarks ni detalles completos sobre el dataset de entrenamiento o el proceso exacto de abliteration.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Gemma 4); detalles especificos no disponibles |
| Parametros totales | 30.697.345.596 (~30,7 mil millones) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF con cuantizaciones generadas mediante imatrix (niveles concretos no especificados en la informacion) |
| Idiomas soportados | Ingles (segun la etiqueta del modelo) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp, Ollama) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado de Gemma 4, en su variante instruction-tuned (sufijo "it"). Sobre esa base se ha aplicado un proceso de "heretizacion" o abliteration, que consiste en identificar y modificar direcciones en el espacio de activaciones o pesos asociadas al comportamiento de rechazo, con el objetivo de reducir la tasa de respuestas negativas o evasivas. El modelo base intermedio se denomina richardyoung/gemma-4-31B-it-ARA-heretic, y esta version GGUF es una cuantizacion de ese modelo realizada con llama.cpp empleando matrices de importancia (imatrix) para preservar la calidad en las capas mas sensibles.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO adicionales tras el ajuste original de Gemma 4. Tampoco se detalla la tecnica exacta de abliteration empleada (por ejemplo, si se uso directional ablation, LoRA-based refusal removal u otro metodo). La unica referencia tecnica es el identificador arXiv:2611.17846 presente en las etiquetas, que no se ha podido verificar en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de la variante instruction-tuned de Gemma 4.
- Razonamiento y respuesta a instrucciones multi-turno (etiqueta "conversational").
- Comportamiento menos restrictivo que el modelo original gracias a la abliteration, con menor tasa de rechazos ante peticiones que el modelo base filtraria.
- Compatibilidad con llama.cpp y Ollama, lo que permite integracion en flujos locales y endpoints compatibles (etiqueta "endpoints_compatible").
- Capacidades multilingues limitadas: la etiqueta de idioma solo declara ingles.
- No se confirma soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como varia la tasa de rechazo y el comportamiento ante instrucciones sensibles tras aplicar abliteration, comparandolo con el Gemma 4 original en entornos controlados.
- Despliegue local en estaciones de trabajo: gracias al formato GGUF y a las cuantizaciones con imatrix, se puede ejecutar con llama.cpp u Ollama en equipos con GPU de consumo, sin depender de APIs en la nube.
- Generacion de texto creativo sin filtros excesivos: util para escritura de ficcion, guiones o narrativa donde los filtros del modelo original pueden bloquear contenido legitimo.
- Prototipado rapido de asistentes conversacionales: la etiqueta "conversational" y la compatibilidad con endpoints permiten montar un chatbot de pruebas en local con contexto multi-turno.
- Evaluacion comparativa de cuantizaciones: al incluir varias cuantizaciones GGUF con imatrix, sirve para medir la perdida de calidad frente al modelo en precision completa en tareas de generacion.
- Fine-tuning posterior y experimentacion: al estar bajo licencia Apache 2.0, se puede usar como base para ajustes adicionales en proyectos de investigacion que requieran un modelo de ~31B menos restrictivo.
- Analisis de sesgos y contenido: util para auditar que tipo de respuestas produce un modelo abliterado frente a uno alineado, como parte de estudios de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa para un modelo de ~30,7B parametros en GGUF, las cuantizaciones de 4 bits suelen requerir del orden de 18-20 GB de VRAM, las de 5-6 bits entre 22 y 28 GB, y las de 8 bits alrededor de 32-35 GB; estos valores son estimaciones generales, no datos publicados para este modelo concreto.
- GPU recomendadas: no especificadas. Por tamano, una RTX 4090 (24 GB) podria ejecutar cuantizaciones de 4 bits; para cuantizaciones mayores se necesitarian A100 40/80 GB, H100 o configuraciones multi-GPU.
- Cabe en GPU de consumo: previsiblemente en RTX 3090/4090 (24 GB) con cuantizaciones de 4 bits; en GPUs de 16 GB o menos probablemente no sin offloading a CPU.
- Opciones de despliegue: llama.cpp y Ollama (segun las etiquetas); tambien podria usarse con servidores compatibles con endpoints, aunque no se confirma soporte de vLLM o TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| richardyoung/gemma-4-31B-it-ARA-heretic-GGUF | ~30,7B | No disponible | Apache 2.0 | GGUF | Abliterated, acceso restringido |
| Gemma 4 31B-it (original de Google) | ~31B | No disponible | Terminos de Gemma (no Apache 2.0) | Safetensors, GGUF | Modelo alineado, con filtros de seguridad |
| richardyoung/gemma-4-31B-it-ARA-heretic (base) | ~30,7B | No disponible | Apache 2.0 | Safetensors (presumiblemente) | Version sin cuantizar del mismo modelo |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas de la misma categoria.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de descargar los pesos.
- La abliteration puede degradar capacidades generales (razonamiento, coherencia, seguimiento de instrucciones) respecto al modelo original; no se han publicado evaluaciones que cuantifiquen esta perdida.
- Riesgo elevado de generar contenido inapropiado, ofensivo o danoso al haberse reducido los mecanismos de rechazo; no es adecuado para aplicaciones de cara al publico sin filtros adicionales.
- Riesgo de alucinacion inherente a los LLM de esta escala; no se ha documentado ninguna mitigacion especifica.
- Soporte de idiomas limitado al ingles segun la etiqueta del modelo; el rendimiento en castellano no esta verificado.
- Aunque la licencia declarada es Apache 2.0, el modelo deriva de Gemma 4, cuyos terminos de uso originales podrian imponer restricciones adicionales; conviene revisar la compatibilidad antes de un uso comercial.
- No hay informacion sobre la longitud de contexto soportada, lo que dificulta planificar aplicaciones con ventanas largas.
- El proceso de cuantizacion GGUF introduce perdida de precision adicional; las cuantizaciones mas agresivas pueden afectar especialmente a tareas de razonamiento y codigo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/gemma-4-31B-it-ARA-heretic-GGUF
- Modelo base (sin cuantizar): https://huggingface.co/richardyoung/gemma-4-31B-it-ARA-heretic
- Referencia arXiv citada en las etiquetas: arxiv:2611.17846 (no verificada en la informacion disponible)
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
