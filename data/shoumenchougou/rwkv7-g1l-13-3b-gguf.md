# shoumenchougou/RWKV7-G1l-13.3B-GGUF

## Resumen

RWKV7-G1l-13.3B-GGUF es la versión cuantizada en formato GGUF del modelo base RWKV-7 "Goose" de 13.300 millones de parámetros, publicada por el usuario shoumenchougou a partir del checkpoint original de BlinkDL. RWKV-7 es una arquitectura recurrente sin atención (attention-free) que sustituye el KV cache de los transformers por un estado recurrente de tamano constante, lo que permite un coste de inferencia por token constante independientemente de la longitud del contexto. Este repositorio empaqueta los pesos en cinco cuantizaciones (Q4_K_M, Q5_K_M, Q6_K, Q8_0 y FP16) listas para llama.cpp y Ollama.

El modelo resuelve el problema del consumo de memoria creciente con el contexto en despliegues locales: al no mantener un KV cache proporcional a la secuencia, el estado recurrente tiene tamano fijo. Esto lo hace atractivo para inferencia en hardware de consumo y para escenarios de contexto largo donde un transformer equivalente dispararía la VRAM. El checkpoint `G1l` corresponde a una revisión concreta del modelo base, con contexto de entrenamiento declarado de 34.304 tokens.

Es relevante ahora porque la integración con Ollama (versión 0.33.2 o superior) y llama.cpp permite ejecutar un modelo de 13.300 millones de parámetros en GPU de consumo con la cuantización Q4_K_M (7,88 GiB), y porque RWKV-7 incorpora un formato de chat Jinja embebido en el GGUF que habilita modos de razonamiento (thinking) y no razonamiento. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RWKV-7 "Goose", recurrente sin atención (attention-free), causal LM |
| Parametros totales | 13.270.822.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 34.304 tokens (configuración de release `num_ctx 34304`) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0, FP16 |
| Idiomas soportados | en, zh, fr, es, de, pt, ru, it, ja, ko, vi, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base; checkpoint original en `.pth`) |

## Arquitectura y entrenamiento

RWKV-7, denominado "Goose", es un modelo de lenguaje causal recurrente que prescinde del mecanismo de atención. En lugar de un KV cache que crece linealmente con la secuencia, mantiene un estado recurrente de tamano fijo, lo que se traduce en un coste computacional constante por token generado y en un uso de memoria independiente de la longitud del contexto. A diferencia de las RNN clásicas, el entrenamiento sigue siendo paralelizable, lo que permite escalar el modelo a 13.300 millones de parámetros. El paper de referencia es arXiv:2503.14456.

El checkpoint `G1l` se distribuye como revisión concreta del modelo base `BlinkDL/rwkv7-g1`; el fichero original `.pth` tiene 26.540.868.485 bytes. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; estos datos no están disponibles en la información proporcionada. El modelo es un modelo base, no un asistente alineado para instrucciones, aunque incluye una plantilla de chat Jinja validada que proporciona una interfaz conversacional y soporta modos thinking y no-thinking.

## Capacidades

- Generación de texto causal en 12 idiomas declarados (inglés, chino, francés, español, alemán, portugués, ruso, italiano, japonés, coreano, vietnamita y árabe).
- Interfaz conversacional mediante plantilla de chat Jinja embebida en el GGUF, leída directamente por Ollama y llama.cpp.
- Modo de razonamiento (thinking) y modo directo (no-thinking), validados en el release según la model card.
- Inferencia con estado recurrente de tamano constante, adecuada para secuencias largas sin crecimiento del KV cache.
- Compatibilidad con llama.cpp y Ollama 0.33.2 o superior.
- Al ser un modelo base, no garantiza seguimiento consistente de instrucciones ni tool calling; estas capacidades no están documentadas en la información disponible.

## Casos de uso

- Inferencia local en GPU de consumo: con la cuantización Q4_K_M (7,88 GiB) el modelo cabe en tarjetas de 12-16 GB de VRAM, permitiendo desplegar un modelo de 13.300 millones de parámetros en estaciones de trabajo sin GPU de datacenter.
- Procesamiento de documentos largos: el estado recurrente de tamano fijo evita el crecimiento de memoria con la secuencia, lo que resulta adecuado para resumir o analizar textos de hasta 34.304 tokens en hardware limitado.
- Generación de texto multilingüe: el soporte declarado de 12 idiomas permite tareas de redacción, traducción aproximada y generación de contenido en inglés, chino, español, francés, alemán, entre otros.
- Prototipado de asistentes conversacionales: la plantilla Jinja y el `Modelfile.ollama` incluido permiten levantar un endpoint conversacional con `ollama create` y `ollama run` en pocos pasos.
- Investigación en arquitecturas recurrentes: sirve como banco de pruebas para comparar RWKV-7 frente a transformers en tareas de generación con contexto largo, midiendo latencia y memoria con estado constante.
- Fine-tuning y experimentación sobre modelo base: al ser un modelo base con licencia Apache 2.0, puede servir de punto de partida para ajuste supervisado en dominios específicos, siempre que se disponga de infraestructura para el checkpoint original en `.pth`.
- Despliegue en pipelines de CI/CD o servicios internos: la disponibilidad de GGUF con hashes SHA-256 publicados facilita la verificación de integridad y la reproducibilidad en entornos automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada según cuantización (tamaño de pesos, sin contar estado recurrente, contexto ni overhead del runtime): Q4_K_M 7,88 GiB; Q5_K_M 9,31 GiB; Q6_K 10,83 GiB; Q8_0 13,72 GiB; FP16 24,91 GiB.
- La model card advierte explícitamente de que el tamaño del fichero no garantiza el uso total de RAM o VRAM; este depende de los pesos, el runtime, la configuración de contexto, el batch size y el backend de hardware.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño de pesos, Q4_K_M encaja en GPU de consumo de 12-16 GB (por ejemplo, RTX 4070 Ti, RTX 4080, RTX 4090); Q8_0 y FP16 requieren GPU de mayor capacidad o CPU con suficiente RAM.
- Cabe en GPU de consumo: sí, con Q4_K_M y presumiblemente Q5_K_M en tarjetas de 12 GB o más; el resto requiere más VRAM o descarga parcial a CPU.
- Opciones de despliegue: Ollama 0.33.2 o superior (con `Modelfile.ollama` incluido) y llama.cpp; la librería declarada es `rwkv`.
- Latencia y throughput estimados: no disponibles en la información proporcionada. La arquitectura garantiza coste por token constante respecto a la longitud de contexto, pero no se publican cifras concretas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. A continuación se indica únicamente lo que puede contrastarse a nivel de arquitectura y licencia, sin cifras de rendimiento:

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| RWKV7-G1l-13.3B (este) | Recurrente sin atención | 13,27 B | 34.304 | Apache 2.0 | GGUF, `.pth` |
| Alternativas transformer de ~13 B | Transformer con atención | ~13 B | no disponible | variable | safetensors, GGUF |
| Alternativas recurrentes/SSM | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han encontrado en la información disponible modelos comparables concretos con datos verificables de rendimiento, contexto o licencia; por tanto, la comparativa cuantitativa se marca como no disponible.

## Limitaciones y advertencias

- Es un modelo base, no un asistente alineado para instrucciones: la model card advierte de que puede no seguir instrucciones de forma consistente pese a la plantilla conversacional.
- Riesgo de alucinación inherente a un modelo de lenguaje sin alineación específica; no se documentan evaluaciones de factualidad.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información disponible.
- El contexto de release es de 34.304 tokens; superar esa longitud puede degradar la calidad o quedar fuera de la configuración validada.
- El soporte multilingüe se declara a nivel de etiquetas, pero no se aportan métricas por idioma; el rendimiento real en idiomas distintos del inglés y el chino no está verificado.
- La licencia Apache 2.0 permite uso comercial, pero al derivar de un modelo base conviene revisar las condiciones del checkpoint original `BlinkDL/rwkv7-g1`.
- Requiere Ollama 0.33.2 o superior para la integración validada; versiones anteriores pueden no soportar RWKV-7.
- El `Modelfile` no define `TEMPLATE` de forma intencionada: añadir una plantilla externa sobrescribiría la plantilla Jinja embebida en el GGUF.
- El tamaño de los ficheros no garantiza el consumo total de memoria; en producción hay que dimensionar considerando contexto, batch y backend.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/shoumenchougou/RWKV7-G1l-13.3B-GGUF
- Modelo base: https://huggingface.co/BlinkDL/rwkv7-g1
- Checkpoint original `.pth`: https://huggingface.co/BlinkDL/rwkv7-g1/blob/11e3c50128e479898eee79c48831a95cf3e21d91/rwkv7-g1l-13.3b-20261031-ctx34304.pth
- Paper RWKV-7: https://arxiv.org/abs/2503.14456v2
- Repositorio GitHub RWKV-LM: https://github.com/BlinkDL/RWKV-LM
- Sitio web oficial RWKV: https://www.rwkv.com/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
