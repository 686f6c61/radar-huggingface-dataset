# medismera/Granite-4.2-8B-Surgical-Abliterated

## Resumen

Granite 4.2 8B Surgical-Abliterated es una versión modificada del modelo empresarial IBM Granite 4.2 8B, publicada por el usuario medismera en HuggingFace. Se trata de un modelo de lenguaje causal al que se le ha aplicado una técnica de "ablación quirúrgica de rechazos" (surgical refusal ablation): una proyección direccional en el espacio latente de representaciones que elimina el subespacio de negativas del modelo, con el objetivo de suprimir las respuestas de rechazo automáticas y los avisos morales sin degradar el conocimiento factual, la precisión en código ni el razonamiento lógico.

El modelo base, ibm-granite/granite-4.2-8b, es un modelo de la familia Granite de IBM orientado a uso empresarial, con 8,19 mil millones de parámetros (8.791.592.960 parámetros reales en safetensors según el repositorio). La versión abliterated se dirige a casos de uso como investigación académica, red-teaming, auditoría de seguridad y exploración creativa sin restricciones.

Su relevancia actual radica en la tendencia creciente de la comunidad open source a publicar variantes "uncensored" de modelos empresariales, y en el interés técnico de las técnicas de ablación direccional como alternativa al fine-tuning completo. El repositorio incluye pesos en safetensors y GGUF, lo que facilita tanto el despliegue con transformers como la ejecución local con llama.cpp u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM (transformer, detalles concretos no disponibles) |
| Parametros totales | 8.791.592.960 (dato real de safetensors) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors y GGUF, cuantizaciones concretas no especificadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF (tamano del repo: 22,9 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de IBM Granite 4.2 8B, un modelo transformer de lenguaje causal con 8,19 mil millones de parametros de nivel empresarial. La model card no detalla el numero de capas, dimensiones ocultas ni longitud de contexto del modelo base, por lo que estos datos no estan disponibles en la informacion proporcionada.

El modelo no ha sido reentrenado desde cero: la modificacion consiste en una "ablacion quirurgica de rechazos" aplicada sobre el modelo base. Segun el autor, se trata de una alineacion direccional de representaciones latentes que elimina el subespacio unificado de negativas en capas criticas del transformer, realizada bajo restricciones ortogonales benignas y preservacion de la norma de Frobenius. El autor afirma que esta tecnica evita la degradacion linguistica, el colapso de probabilidades de tokens y la perdida de correccion algoritmica, aunque estas afirmaciones provienen de la model card y no estan verificadas de forma independiente. No hay informacion sobre datos de entrenamiento adicionales, RLHF ni DPO en esta variante.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Granite 4.2 8B.
- Generacion de codigo: el autor afirma preservacion completa de la sintaxis de programacion y la correccion algoritmica tras la ablacion.
- Razonamiento logico y tecnico sin "impuesto de alineacion", segun la model card.
- Cumplimiento directo de instrucciones tecnicas complejas (auditoria de ciberseguridad, analisis de redes) sin emision de tokens de rechazo por defecto.
- Exploracion creativa sin restricciones de los filtros de seguridad del modelo base.
- Compatibilidad con plantillas de chat (chat template) via transformers, con ejemplo de inferencia documentado.
- No consta soporte nativo de vision, audio, tool calling ni modos de pensamiento extendido en la informacion disponible.

## Casos de uso

- Red-teaming y evaluacion de seguridad: permite estudiar el comportamiento de un modelo sin capas de rechazo, util para probar defensas y detectar vulnerabilidades en pipelines de IA.
- Auditoria de ciberseguridad: generacion de scripts de analisis de redes locales (por ejemplo, con sockets crudos en Python) para profesionales de seguridad que trabajan en entornos controlados y legales.
- Investigacion academica sobre alineacion: la ablacion direccional de subespacios de rechazo es un objeto de estudio en si misma para investigar como se codifican los comportamientos de seguridad en representaciones latentes.
- Generacion de codigo tecnico sin interrupciones: flujos de trabajo donde los rechazos falsos positivos del modelo base interrumpen tareas legitimas de programacion de bajo nivel (drivers, herramientas de red, ingenieria inversa legal).
- Escritura creativa sin restricciones: ficcion con contenido sensible (violencia, tematicas oscuras) donde los modelos alineados suelen interrumpir la narrativa con avisos morales.
- Analisis de contenido sensible en investigacion: procesamiento y discusion de material delicado (por ejemplo, estudio de malware con fines defensivos) donde el modelo base se niega a colaborar.
- Despliegue local con GGUF: el formato GGUF permite ejecutar el modelo en estaciones de trabajo con llama.cpp u Ollama para entornos air-gapped de investigacion de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma cualitativamente que se preservan los benchmarks de conocimiento factual, precision en codigo y razonamiento logico del modelo base, pero no aporta numeros concretos ni comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 17-18 GB para 8,79 mil millones de parametros; el tamano del repo (22,9 GB) sugiere que incluye pesos sin cuantizar y variantes GGUF.
- Con cuantizacion GGUF de 4 bits, el consumo estimado bajaria a unos 5-6 GB de VRAM, aunque las cuantizaciones exactas disponibles no estan especificadas.
- GPU recomendadas: una RTX 4090 (24 GB) o RTX 3090 cubre la inferencia en BF16; para cuantizaciones de 4 bits bastan GPUs de consumo como RTX 3060 de 12 GB o superiores. No se requieren A100 ni H100 para inferencia.
- Cabe en GPU de consumo: si, tanto en BF16 (RTX 3090/4090) como cuantizado en 4 bits ( GPUs de 8-12 GB).
- Opciones de despliegue: transformers (codigo de ejemplo incluido en la model card), llama.cpp y Ollama gracias al formato GGUF; en principio tambien vLLM y TGI al tratarse de un modelo compatible con transformers, aunque no hay documentacion especifica para ellos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Licencia | Formato | Particularidad |
|---|---|---|---|---|
| medismera/Granite-4.2-8B-Surgical-Abliterated | 8,79B | Apache 2.0 | safetensors, GGUF | Ablacion quirurgica de rechazos sobre Granite 4.2 8B |
| ibm-granite/granite-4.2-8b (base) | 8,19B | Apache 2.0 | safetensors | Modelo empresarial original con alineacion estandar |
| Variantes abliterated de modelos 7-9B (p. ej. abliteraciones de Llama 3.1 8B o Qwen) | 7-9B | Varia segun el base | safetensors, GGUF | Mismo enfoque uncensored, bases distintas |

La comparativa se limita al modelo base documentado; para otras variantes abliterated de tamano similar no hay datos de rendimiento publicados que permitan una comparacion cuantitativa (no disponible).

## Limitaciones y advertencias

- Al tratarse de un modelo abliterated, se han eliminado deliberadamente las salvaguardas de seguridad del modelo base: puede generar contenido perjudicial, ilegal o peligroso si se le solicita. La responsabilidad legal del uso recae totalmente en el usuario, tal como indica la propia model card.
- Las afirmaciones de "preservacion cognitiva" (sin perdida en codigo ni razonamiento) provienen del autor y no estan verificadas con benchmarks independientes; la ablacion puede degradar sutilmente el comportamiento del modelo.
- Riesgo de alucinacion inherente a los LLM, potencialmente agravado por la ausencia de rechazos: el modelo puede comply con peticiones para las que no tiene conocimiento fiable.
- Soporte linguistico limitado al ingles segun la model card; el rendimiento en castellano u otros idiomas no esta documentado.
- Datos tecnicos clave no disponibles: longitud de contexto, cuantizaciones concretas, soporte de tool calling y benchmarks.
- La licencia Apache 2.0 del modelo base y de esta variante permite uso comercial, pero el uso de un modelo sin salvaguardas en produccion conlleva riesgos de cumplimiento normativo (por ejemplo, el AI Act europeo) que deben evaluarse caso por caso.
- Popularidad muy baja (275 descargas, 0 likes en el momento de la ficha), lo que implica poco testeo comunitario y posible ausencia de correcciones o revisiones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/medismera/Granite-4.2-8B-Surgical-Abliterated
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-8b
- Organizacion IBM Granite: https://huggingface.co/ibm-granite
- Paper, blog o demo adicionales: no disponible
