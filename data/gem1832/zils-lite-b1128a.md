# Gem1832/zils-lite-b1128a

## Resumen

zils-lite-b1128a es un modelo de decisión de aproximadamente 853 millones de parámetros publicado por el usuario Gem1832 en Hugging Face bajo licencia Apache-2.0. No se trata de un modelo entrenado desde cero, sino de una fusión (merge) en el espacio de pesos de tres modelos de decisión: joamCriff123/zils-lite-l1125a, joamCriff123/zils-lite-l1123q y MachinePulseAI/karpo-decision-0.8B. Los tres son, a su vez, fine-tunes de Qwen/Qwen3.5-0.8B, por lo que la arquitectura subyacente hereda la del transformer de Qwen de 0,8B, incluyendo una torre de visión que el autor indica que se mantiene sin cambios respecto a la sopa l1125a + l1123q.

El modelo está orientado a tareas de decisión y evaluación de habilidades, y el autor justifica la fusión con datos de evaluación sobre ítems públicos de test al estilo del Decision Index (MMLU-Pro, BBH, GSM8K, MuSR, ANLI, When2Call, New Yorker): añadir karpo-decision-0.8B a la sopa previa elevó la puntuación de habilidad de 34,3 a 36,2, con mejoras concentradas en BBH, GSM8K y MMLU-Pro, a costa de una ligera caída en JevBench público (de 63,3 a 60,9).

Es relevante ahora porque demuestra una práctica creciente en el ecosistema open source: la composición de modelos pequeños mediante merges de pesos para obtener variantes especializadas sin coste de entrenamiento adicional, manteniendo licencias permisivas y trazabilidad de los pesos upstream. El repositorio es muy reciente (creado el 27 de noviembre de 2026) y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (hereda de Qwen/Qwen3.5-0.8B); incluye torre de vision segun la model card |
| Parametros totales | 852.985.920 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 0,8B de parámetros, con una torre de visión heredada de la sopa l1125a + l1123q. El modelo no ha sido entrenado: es un merge de pesos en el espacio de parámetros (weight-space average) con pesos iguales entre los tres modelos de decisión de origen. El autor describe el resultado como el "body" (cuerpo) del modelo dentro de un pool d3-lite de la subnet Zils 127.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO en los modelos upstream. La única innovación técnica documentada es la propia estrategia de fusión: promediar pesos de tres fine-tunes Apache-2.0 del mismo modelo base para combinar sus capacidades de decisión, con evaluación empírica sobre ítems públicos de test.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredados de Qwen3.5-0.8B y de los fine-tunes de decisión.
- Tareas de decisión y evaluación: el modelo está especializado en ítems de tipo Decision Index (MMLU-Pro, BBH, GSM8K, MuSR, ANLI, When2Call, New Yorker).
- Razonamiento matemático (GSM8K) y razonamiento de sentido común (BBH), áreas donde el merge reporta mejoras.
- Capacidad de visión: la torre de visión se mantiene desde la sopa l1125a + l1123q, aunque no se detallan sus prestaciones.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el autor no declara idiomas soportados.
- Modo thinking explícito: no disponible.

## Casos de uso

- Evaluación automática de modelos y respuestas: el modelo puede emplearse como evaluador de decisiones en pipelines de benchmarking interno, dado que su especialización son ítems tipo Decision Index y su tamaño reducido permite ejecutarlo a bajo coste junto a modelos mayores.
- Clasificación y enrutamiento de decisiones en producción: por su tamaño de 0,8B y licencia Apache-2.0, es viable desplegarlo como clasificador de decisión en flujos de enrutamiento o triaje, donde la latencia y el coste por token son críticos.
- Razonamiento matemático de nivel básico: útil para tareas de resolución de problemas aritméticos y de word problems (GSM8K) en entornos educativos o de validación de cálculos, siempre con verificación posterior.
- Razonamiento de sentido común y lógica: adecuado para tareas de inferencia tipo BBH y ANLI en entornos de investigación que necesiten un modelo pequeño y reproducible para experimentos controlados.
- Componente de un ensemble o sistema de votación: al ser un merge de tres modelos de decisión, puede integrarse como miembro de un comité de evaluadores donde se agreguen sus salidas con las de otros modelos.
- Investigación sobre merges de pesos: sirve como caso de estudio reproducible para estudiar el efecto de promediar fine-tunes del mismo modelo base en tareas de decisión.
- Prototipado rápido en hardware de consumo: con 853 millones de parámetros puede ejecutarse en GPU de consumo y en CPU para pruebas de concepto, sin necesidad de infraestructura dedicada.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los del autor sobre ítems públicos de test al estilo del Decision Index, comparando la sopa previa (l1125a + l1123q) con la sopa ampliada que incluye karpo-decision-0.8B (este modelo):

| Metrica | Sopa l1125a + l1123q | zils-lite-b1128a (con karpo) |
|---|---|---|
| Skill (media en items tipo Decision Index) | 34,3 | 36,2 |
| JevBench publico | 63,3 | 60,9 |

El autor indica que la mejora se concentra en BBH, GSM8K y MMLU-Pro. No se publican resultados desglosados por benchmark (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852.985.920 parámetros, en fp16 se requieren aproximadamente 1,7 GB de VRAM solo para pesos; en fp32, unos 3,4 GB; en cuantización de 8 bits, alrededor de 0,9 GB, y en 4 bits, unos 0,5 GB (estimaciones a partir del recuento de parámetros, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 con overhead de activaciones; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobradamente suficientes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna, e incluso en CPU para inferencia en cuantización.
- Opciones de despliegue: al ser safetensors sobre arquitectura Qwen, es compatible con vLLM, TGI, llama.cpp (previa conversión a GGUF) y Ollama; no se han publicado configuraciones específicas.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zils-lite-b1128a | 853 M | no disponible | Apache-2.0 | Merge de tres fine-tunes de decision sobre Qwen3.5-0.8B |
| Qwen/Qwen3.5-0.8B | ~0,8 B | no disponible | no disponible en la informacion | Modelo base de los tres fine-tunes |
| MachinePulseAI/karpo-decision-0.8B | ~0,8 B | no disponible | Apache-2.0 | Fine-tune de decision, componente del merge |
| joamCriff123/zils-lite-l1125a | ~0,8 B | no disponible | Apache-2.0 | Fine-tune de decision, componente del merge (mismos pesos que newsbang/adjudex-0.8b-v7) |

No se dispone de datos de rendimiento comparables de estos modelos en la información proporcionada más allá de las cifras agregadas del merge.

## Limitaciones y advertencias

- Modelo sin entrenamiento propio: es un promedio de pesos, por lo que hereda los sesgos y limitaciones de los tres fine-tunes upstream; no ha pasado por etapas adicionales de alineación o RLHF en esta variante.
- Riesgo de alucinación: como todo modelo de 0,8B, la fiabilidad factual es limitada; no debe usarse como fuente de verdad sin verificación.
- Idiomas y contexto no declarados: el autor no especifica idiomas soportados ni longitud de contexto, lo que dificulta planificar su uso multilingüe o con contextos largos.
- Rendimiento modesto: las puntuaciones de skill reportadas (36,2) son bajas en términos absolutos, adecuadas para tareas de decisión acotadas pero no para razonamiento complejo de propósito general.
- Caída en JevBench: el merge empeora el resultado en JevBench público (de 63,3 a 60,9), por lo que no es una mejora uniforme.
- Licencia Apache-2.0: permite uso comercial, pero es necesario revisar el fichero NOTICE del repositorio para respetar los avisos upstream retenidos.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni documentación ampliada; la madurez y el soporte son mínimos.
- Trazabilidad de los pesos upstream: la calidad y las condiciones de los modelos de origen (joamCriff123, MachinePulseAI) deben verificarse antes de un uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Gem1832/zils-lite-b1128a
- Modelo base de referencia: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Componente del merge: https://huggingface.co/joamCriff123/zils-lite-l1125a
- Componente del merge: https://huggingface.co/joamCriff123/zils-lite-l1123q
- Componente del merge: https://huggingface.co/MachinePulseAI/karpo-decision-0.8B
- Modelo equivalente a l1125a: https://huggingface.co/newsbang/adjudex-0.8b-v7
