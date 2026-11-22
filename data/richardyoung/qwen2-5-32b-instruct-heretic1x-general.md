# richardyoung/Qwen2.5-32B-Instruct-heretic1x-general

## Resumen

Qwen2.5-32B-Instruct-heretic1x-general es un ajuste fino (fine-tune) del modelo Qwen2.5-32B-Instruct de Alibaba Qwen, publicado por el usuario richardyoung en Hugging Face. El modelo aplica la técnica conocida como "abliteration" (etiquetada aquí como heretic 1.x), un proceso de modificación de pesos diseñado para eliminar los mecanismos de rechazo y alineación de seguridad del modelo original, dando como resultado una variante "decensored" orientada a investigación.

El modelo conserva la arquitectura transformer densa del Qwen2.5-32B-Instruct original, con 32.763.876.352 parámetros totales (aproximadamente 32,8 mil millones) y un tamaño de repositorio de 65,6 GB en formato safetensors. Está pensado para generación de texto conversacional y se distribuye bajo licencia Apache 2.0, aunque el acceso está restringido y requiere aceptar condiciones en Hugging Face.

Su relevancia es acotada y de nicho: se trata de un modelo de investigación para estudiar los efectos de la abliteración sobre el comportamiento de un LLM grande, no un modelo recomendado para despliegues de producción convencionales. El autor lo publica con la etiqueta "research" y con un número reducido de descargas (693 en el momento de la consulta), lo que refleja su carácter experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2), derivado de Qwen2.5-32B-Instruct |
| Parametros totales | 32.763.876.352 (~32,8 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el base Qwen2.5-32B-Instruct soporta hasta 131.072 tokens, pero este dato no se confirma para el fine-tune) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en safetensors; admite cuantizacion estandar de la comunidad, pero no se documenta) |
| Idiomas soportados | Ingles (etiqueta declarada: en) |
| Licencia | Apache 2.0 (el modelo base Qwen2.5-32B-Instruct usa licencia Apache 2.0; la model card declara apache-2.0) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-32B-Instruct, un transformer denso decoder-only de la familia Qwen2.5. Sobre esa base, el autor aplica una intervención de tipo "abliteration" (denominada heretic 1.x en las etiquetas), una técnica que modifica selectivamente los pesos o direcciones de activación asociadas al comportamiento de rechazo, con el objetivo de eliminar las negativas del modelo ante determinadas peticiones. No se dispone en la información proporcionada de detalles sobre el dataset de ajuste, el número de tokens adicionales, ni si se emplearon técnicas de RLHF o DPO en esta variante concreta.

La información disponible no especifica innovaciones técnicas adicionales más allá de la propia abliteración, ni documenta el proceso exacto de modificación de pesos, las capas intervenidas o las métricas de evaluación del efecto. Se desconoce igualmente si el fine-tune preserva íntegramente las capacidades del modelo base o si introduce degradaciones medibles.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen2.5-32B-Instruct.
- Razonamiento y conocimiento general (capacidad del base, no verificada en esta variante).
- Generacion de codigo y matematicas (capacidad del base, no verificada en esta variante).
- Comportamiento "decensored": reduccion o eliminacion de rechazos ante peticiones que el modelo original declinaria, segun la intencion declarada de la abliteracion.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada para esta variante.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada para esta variante.
- Capacidades multilingues: limitadas al ingles segun la etiqueta declarada (el base soporta mas idiomas, pero esta variante solo declara en).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo sirve como objeto de estudio para analizar como la abliteracion altera la tasa de rechazos, la utilidad percibida y los sesgos de un LLM de 32B, comparandolo con el Qwen2.5-32B-Instruct original en evaluaciones controladas.
- Red teaming y evaluacion de robustez: permite a equipos de seguridad probar prompts adversarios y medir la eficacia de las salvaguardas eliminadas, documentando vectores de ataque y comportamientos indeseados.
- Generacion de texto creativo sin filtros: para entornos de escritura de ficcion o guiones donde se requiera explorar contenido que el modelo base rechazaria, siempre con revisión humana y dentro de marcos legales.
- Estudio de degradacion de capacidades: al ser un fine-tune de abliteracion, resulta util para cuantificar si la intervencion sobre los pesos afecta al razonamiento, al codigo o a las matematicas respecto al base.
- Experimentacion academica con licencia permisiva: su licencia Apache 2.0 facilita su uso en laboratorios que necesitan modificar y redistribuir el modelo con fines de investigacion.
- Comparativas de tecnicas de abliteracion: permite contrastar la metodologia heretic 1.x frente a otras variantes de abliteracion publicadas sobre la misma familia Qwen2.5, midiendo diferencias de comportamiento.
- Base para nuevos fine-tunes de investigacion: al estar en formato safetensors y ser compatible con transformers, puede servir como punto de partida para experimentos posteriores, asumiendo las advertencias de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (bf16/fp16): aproximadamente 65 GB solo para los pesos, por lo que requiere GPUs de 80 GB (A100 80GB, H100 80GB) o configuraciones multi-GPU.
- VRAM estimada con cuantizacion de 8 bits: en torno a 33-35 GB, viable en una RTX 4090 (24 GB) solo con cuantizaciones mas agresivas, no en 8 bits.
- VRAM estimada con cuantizacion de 4 bits (si se generan pesos GGUF/AWQ, no documentados en el repo): aproximadamente 18-20 GB, lo que permitiria ejecucion en una RTX 4090 de 24 GB.
- GPU recomendadas: A100 80GB o H100 80GB para precision completa; RTX 4090 o RTX 3090 (24 GB) unicamente con cuantizacion de 4 bits.
- Cabe en GPU de consumo: solo con cuantizacion de 4 bits en GPUs de 24 GB; en 16 GB no es viable con calidad aceptable.
- Opciones de despliegue: transformers (formato nativo), text-generation-inference (etiqueta endpoints_compatible), y potencialmente vLLM o llama.cpp si se generan los formatos correspondientes (no documentado en el repo).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| richardyoung/Qwen2.5-32B-Instruct-heretic1x-general | ~32,8 B | No disponible | Apache 2.0 | Gated en HF | Fine-tune abliterado, solo ingles declarado |
| Qwen/Qwen2.5-32B-Instruct | ~32,8 B | 131.072 tokens (segun base) | Apache 2.0 | Publico en HF | Modelo original alineado, multilingue |
| Variantes abliteradas de Qwen2.5 (comunidad) | ~32 B | Variable | Variable | Variable | Otras aproximaciones de abliteracion sobre la misma base |

La comparativa directa de rendimiento no puede establecerse porque no se han publicado benchmarks de esta variante. Frente al modelo base, la diferencia principal es la eliminacion de rechazos y la posible perdida de capacidades, no documentada.

## Limitaciones y advertencias

- Modelo "decensored": la abliteracion elimina salvaguardas, por lo que puede generar contenido inapropiado, ofensivo o peligroso sin filtros; no es apto para aplicaciones de cara al publico sin moderacion externa.
- Riesgo elevado de alucinacion: no se documenta ninguna evaluacion de fidelidad tras el fine-tune, y la intervencion sobre pesos puede degradar el razonamiento.
- Idiomas: solo se declara ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior al del base multilingue.
- Licencia: Apache 2.0 permite uso comercial, pero el uso de un modelo abliterado en produccion conlleva riesgos legales y reputacionales; se recomienda revision legal.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita la reproducibilidad automatica en pipelines.
- Sin benchmarks publicados: no hay evidencia de que las capacidades del base se conserven; cualquier uso en produccion exige evaluacion propia.
- Autor y mantenimiento: publicado por un usuario individual (richardyoung), sin garantias de soporte, actualizaciones ni documentacion extensa.
- Sin datos sobre contexto real, cuantizaciones disponibles ni tool calling: no asumir que hereda todas las capacidades del base sin verificacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-heretic1x-general
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Repositorio de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Paper de Qwen2.5 (arXiv): https://arxiv.org/abs/2412.15115
