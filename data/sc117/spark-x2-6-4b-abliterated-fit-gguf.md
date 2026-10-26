# SC117/Spark-X2.6-4B-abliterated-FIT-GGUF

## Resumen

Spark-X2.6-4B-abliterated-FIT-GGUF es una familia de cuantizaciones GGUF del modelo XHToken/Spark-X2.6-4B, un transformer denso de 4.112.079.360 parámetros (aproximadamente 4,1B) con atención híbrida, publicado por el usuario SC117 bajo licencia Apache-2.0. No se trata de un modelo entrenado desde cero, sino de una redistribución cuantizada y modificada del modelo base: la versión "abliterated" elimina las direcciones de rechazo del modelo original, de modo que el resultado es un modelo sin censura (uncensored) orientado a generación de texto, razonamiento, contexto largo y uso como agente.

El interés técnico principal no está en el modelo en sí, sino en el proceso de cuantización. Los archivos han sido generados con FIT-GGUF v0.5.0, una capa de planificación determinista a nivel de tensor construida sobre la cuantización de llama.cpp. En lugar de ofrecer los presets habituales (Q4_K_M, Q5_K_M, etc.), FIT-GGUF parte de un objetivo de fidelidad —una divergencia KL máxima respecto al BF16 del propio modelo, medida sobre cinco dominios fijos— y busca el GGUF más pequeño que demuestre cumplir ese contrato. El repositorio incluye cinco niveles ("tiers") FIT verificados más el BF16, con un rango de tamano que va de 2,18 GiB en el nivel MINI a 7,66 GiB en BF16.

Es relevante ahora porque ejemplifica una tendencia practica: empaquetar modelos pequenos (4B) con contratos de calidad medibles en lugar de etiquetas de cuantizacion opacas, de forma que quien despliega pueda elegir el punto de la curva tamano/fidelidad con evidencia y no por intuicion. El modelo solo declara soporte para chino (zh) e ingles (en).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (hybrid-attention), según la model card del autor |
| Parametros totales | 4.112.079.360 (aproximadamente 4,1B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible (la model card usa la etiqueta "long-context" sin cifra concreta) |
| Tipos de cuantizacion | GGUF; cinco niveles FIT verificados (las etiquetas concretas de cada nivel no se detallan en la información disponible), BF16 y variantes generadas con imatrix. Rango de 2,18 GiB (MINI) a 7,66 GiB (BF16) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp y ecosistema derivado) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 4,1B parámetros con atención híbrida, según la descripción del autor. La información disponible no detalla la proporción entre capas de atención completa y capas de atención lineal, ni el número de capas, cabezas o dimensiones ocultas. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO u otro ajuste por preferencias. El modelo se distribuye con las etiquetas "reasoning", "long-context" y "agent", lo que sugiere un entrenamiento orientado a cadenas de razonamiento y a uso en pipelines con herramientas, pero no hay cifras que lo respalden en la información proporcionada.

La modificación "abliterated" se describe como "input-gated abliteration": se intervienen las activaciones o direcciones internas asociadas al rechazo, de forma condicionada a la entrada, en lugar de aplicar una sustracción global de la dirección de rechazo. El resultado es un modelo que no rechaza peticiones por contenido, con el riesgo asociado de degradación de la coherencia y de la calibración en dominios sensibles. La cuantización se realizó con FIT-GGUF v0.5.0, que planifica tensor a tensor, usa matrices de importancia (imatrix) y aplica una puerta de verificación por nivel: cada archivo publicado se re-mide sobre sus propios bytes y debe cumplir un umbral de KL macro frente al BF16 del modelo en cinco dominios fijos. El autor reporta también una predicción determinista del tamano con entrega byte-exacta (delta = 0 en la puerta G2) y una métrica de coincidencia de top-1 ("same-top").

## Capacidades

- Generación de texto conversacional y de un solo turno, en chino e inglés.
- Razonamiento explícito: el modelo se distribuye con la etiqueta "reasoning", orientada a tareas que requieren pasos intermedios.
- Generación de código y uso como asistente de programación (etiqueta "text-generation" y perfil de modelo pequeño orientado a agentes).
- Soporte de agentes y razonamiento multi-paso (etiqueta "agent"), incluyendo tool calling según el perfil declarado por el autor; no se documenta el formato exacto de llamada a herramientas.
- Contexto largo (etiqueta "long-context"), sin cifra oficial de ventana disponible.
- Modo sin censura: ausencia de rechazos por contenido gracias a la abliteración input-gated.
- Sin capacidades multimodales declaradas: no hay visión, audio ni vídeo en las etiquetas del repositorio.

## Casos de uso

- Asistentes conversacionales autoalojados en inglés o chino: con 4,1B parámetros y un GGUF mínimo de 2,18 GiB, el modelo se puede servir en una sola GPU de consumo o incluso en CPU, lo que permite ofrecer un chatbot interno sin dependencia de APIs externas.
- Clasificación y extracción de información en pipelines por lotes: al ser un modelo denso pequeno, se pueden procesar miles de documentos por hora en una GPU de gama media con llama.cpp, etiquetando, resumiendo o extrayendo campos estructurados.
- Generación de código en entornos con requisitos de confidencialidad: al ejecutarse localmente con licencia Apache-2.0, se puede integrar como autocompletado o revisor en un IDE o en un pipeline de CI/CD sin enviar código a terceros.
- Razonamiento sobre documentos largos: la etiqueta "long-context" y el soporte de contexto extenso lo hacen utilizable para resumir contratos, informes o hilos de incidencia, siempre que se valide empíricamente la ventana real soportada antes de producción.
- investigación sobre alineación y abliteración: el repositorio sirve como material de estudio para medir cómo afecta la eliminación de direcciones de rechazo a la perplejidad, la coherencia y la tasa de cumplimiento, comparando los cinco niveles FIT frente al BF16 original.
- Evaluación de metodologías de cuantización: los cinco niveles verificados por KL permiten estudiar la relación entre tamano, divergencia respecto al BF16 y calidad percibida, usando el propio repositorio como conjunto de referencia.
- Despliegue en dispositivos con VRAM limitada: el nivel MINI (2,18 GiB) cabe en GPUs de 4 GB o en portátiles con gráfica integrada, habilitando prototipos y demos locales.
- Filtrado y moderación de contenido en flujos internos donde se necesita un modelo que no bloquee por política propia, con la supervisión y las salvaguardas que la organizacion deba anadir por su cuenta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros). La model card solo documenta métricas internas de fidelidad de cuantización, sin valores numéricos concretos:

| Metrica | Resultado |
|---|---|
| KL macro frente a BF16 del modelo | Verificado por nivel; valores numéricos no publicados |
| Coincidencia de top-1 ("same-top") | Medida; valores numéricos no publicados |
| Predicción de tamano y entrega byte-exacta | Validada (puerta G2, delta = 0) |
| Dominios de evaluación de la puerta KL | Cinco dominios fijos; no se detallan |

## Requisitos de hardware

- VRAM estimada para inferencia (cálculos a partir del tamano de los pesos, no datos del autor): BF16 (7,66 GiB) requiere aproximadamente 9-10 GB de VRAM con contexto corto; un nivel intermedio en torno a 4 GiB de pesos requiere 5-6 GB; el nivel MINI (2,18 GiB) requiere aproximadamente 3-4 GB.
- GPU recomendadas: para BF16, RTX 4080/4090 (16-24 GB) o A100/H100 si se necesita concurrencia; para niveles intermedios, RTX 3060 12 GB, RTX 4060 Ti 16 GB o L4; para MINI, GTX 1650 4 GB, RTX 3050 o GPUs integradas con suficiente memoria compartida.
- Cabe en GPU de consumo: sí, en todos los niveles; el BF16 va justo en tarjetas de 8 GB si se limita el contexto, y con holgura en 12 GB o más.
- Opciones de despliegue: llama.cpp (referencia del formato), Ollama y derivados, y servidores compatibles con el ecosistema GGUF. El soporte de vLLM o TGI para este GGUF concreto no está documentado en la información disponible.
- Latencia y throughput: no disponibles. Como referencia cualitativa, un modelo denso de 4B en un nivel de 2-4 GiB se ejecuta de forma interactiva en GPU de consumo y de forma viable aunque lenta en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | GGUF disponible | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-4B-abliterated-FIT-GGUF | 4,1B denso | No disponible | Apache-2.0 | Sí, cinco niveles FIT + BF16 | Variante abliterated; idiomas zh/en; foco en fidelidad de cuantización medida |
| Qwen3-4B | Aproximadamente 4,0B denso | 32.768 nativo, ampliable a 131.072 | Apache-2.0 | Sí, amplia comunidad | Multilingüe amplio, con modo thinking; referencia habitual en este tramo de tamano |
| Llama 3.2 3B Instruct | 3,2B denso | 128.000 | Licencia comunitaria de Llama 3.2 | Sí | Muy extendido en herramientas; licencia con restricciones adicionales frente a Apache-2.0 |
| Phi-4-mini-instruct | 3,8B denso | 128.000 | MIT | Sí | Buen rendimiento en razonamiento y matematicas para su tamano |
| Gemma 3 4B | Aproximadamente 4B denso | 128.000 | Licencia de Gemma | Sí | Multimodal en la familia; requiere aceptar términos de uso |

Los datos de los modelos comparables provienen de información pública de sus respectivas model cards; conviene verificarlos antes de tomar decisiones de despliegue. No hay cifras de rendimiento del modelo evaluado que permitan una comparación cuantitativaDirecta.

## Limitaciones y advertencias

- La abliteración elimina el comportamiento de rechazo: el modelo puede producir contenido danino, ilegal o sensible sin filtros propios. Cualquier despliegue abierto necesita salvaguardas externas.
- La abliteración input-gated puede degradar la coherencia, la utilidad general y la calibración respecto al modelo base; no se publican evaluaciones que cuantifiquen esa perdida.
- Riesgo de alucinación propio de un modelo de 4B: no es fiable como fuente de hechos sin verificación externa.
- Idiomas limitados a chino e inglés; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- La longitud de contexto real no está publicada; la etiqueta "long-context" no debe tomarse como garantía de una ventana concreta sin pruebas.
- Los niveles FIT más agresivos (próximos a 2,18 GiB) pueden perder calidad de forma perceptible pese a cumplir el umbral de KL; conviene validar en la tarea concreta.
- El formato GGUF limita las opciones de serving de alto throughput; para cargas concurrentes puede ser necesario convertir a otro formato, algo no documentado para esta variante.
- La licencia Apache-2.0 permite uso comercial, pero la responsabilidad legal y etica del contenido generado por una variante sin censura recae en quien la despliega.
- Las fechas del repositorio (creación y actualización en octubre de 2026) y la ausencia de un paper asociado dificultan la trazabilidad del proceso de abliteración y de entrenamiento del modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SC117/Spark-X2.6-4B-abliterated-FIT-GGUF
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Herramienta FIT-GGUF: https://github.com/Scorp1o117/FIT-GGUF
- README en chino simplificado: https://huggingface.co/SC117/Spark-X2.6-4B-abliterated-FIT-GGUF/blob/main/README.zh-CN.md
- llama.cpp (runtime de referencia para GGUF): https://github.com/ggml-org/llama.cpp
