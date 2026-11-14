# Charlie320/zils-mini-h2a

## Resumen

zils-mini-h2a es un modelo de decisión (decision-model) publicado por el usuario Charlie320 dentro del ecosistema Zils, asociado a la subred 127 de Bittensor. Se trata de un fine-tune del modelo base Qwen/Qwen3.5-4B, ensamblado en el llamado "chassis layout" y entrenado en BF16 con los pesos de lenguaje activos y la torre de visión heredada del modelo padre. Con 4.539.265.536 parámetros reales según los safetensors, es un modelo denso de aproximadamente 4,5 mil millones de parámetros.

El modelo se construye mediante un "soup fine-tune": parte de la media uniforme de los dos cuerpos del pool de soups z3-mini y aplica un fine-tune completo de las capas 16 en adelante (learning rate 3e-6, unas 60.000 filas) sobre datos de entrenamiento específicos. Esos datos consisten en ítems de decisión en formato de examen, redactados con la receta pública de autoría de Zils (scripts/author_exam.py) por Claude Opus y por un modelo abierto local, a partir únicamente de splits públicos de entrenamiento, más las respuestas del profesor relay público de Zils.

Su relevancia es acotada y muy específica: no es un modelo de propósito general, sino un cuerpo (body) destinado al pool de soups d3-mini de Zils, orientado a tareas de decisión evaluadas en formato de examen. El repositorio contiene únicamente pesos; no se publican resultados de benchmarks ni detalles sobre el pipeline de inferencia. La ficha se elabora con la información disponible y marca explícitamente como no disponible todo aquello que la model card no documenta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (fine-tune de Qwen/Qwen3.5-4B en chassis layout, con torre de visión del padre) |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer denso de unos 4,5 mil millones de parámetros, y se adapta al "chassis layout" del ecosistema Zils, conservando la torre de visión del modelo padre y entrenando los pesos de lenguaje. La construcción sigue un esquema de soup: se calcula la media uniforme de los dos cuerpos actuales del pool de soups z3-mini y, sobre ese punto de partida, se realiza un fine-tune completo de las capas 16 en adelante con un learning rate de 3e-6 y aproximadamente 60.000 filas de entrenamiento.

Los datos de entrenamiento son ítems de decisión en formato de examen generados con la receta pública de autoría de Zils (scripts/author_exam.py) por Claude Opus y por un modelo abierto local, restringidos a splits públicos de entrenamiento, más las respuestas del profesor relay público de Zils. La model card declara explícitamente que no se usaron ítems de examen de validadores ni ítems semilla públicos. No se documentan el número total de tokens, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO; tampoco se describen innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento en formato de decisión: el modelo está entrenado específicamente sobre ítems de examen y respuestas de profesor, por lo que su competencia principal es responder preguntas de decisión con formato estructurado.
- Procesamiento multimodal: hereda la torre de visión del modelo padre Qwen/Qwen3.5-4B, aunque la model card no detalla el alcance ni el rendimiento de esa capacidad tras el fine-tune.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- Modo thinking u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Evaluación en formato de examen dentro del pool Zils d3-mini: el modelo se usaría como cuerpo candidato del pool de soups, respondiendo ítems de decisión con el formato exacto con el que fue entrenado, lo que lo hace adecuado para comparar y seleccionar cuerpos dentro de la subred 127.
- Generación de respuestas de decisión estructuradas: en pipelines que requieran salidas con formato de examen (pregunta, opciones, respuesta), el fine-tune sobre 60.000 filas de ese tipo reduce la necesidad de post-procesado.
- Destilación o imitación de un profesor relay: al haberse entrenado con las respuestas del profesor relay público de Zils, puede emplearse para replicar ese estilo de respuesta en entornos de investigación sobre destilación.
- Experimentación con soup fine-tuning: sirve como caso de estudio reproducible de la técnica de media uniforme de cuerpos seguida de fine-tune parcial (capas 16 en adelante) con learning rate bajo.
- Investigación sobre alineación de modelos pequeños en tareas acotadas: con 4,54 B de parámetros en BF16, es viable en una sola GPU de gama alta para estudiar cómo el fine-tune parcial afecta al comportamiento en decisiones.
- Base para futuros cuerpos del pool: al ser un body del ecosistema, puede servir como punto de partida para nuevas rondas de soup o fine-tunes dentro de la misma familia zils-mini.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para pesos (coincide con el tamaño del repo), más overhead de activaciones y caché KV; en la práctica, entre 10 y 12 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5 a 6 GB; en 4 bits, alrededor de 2,5 a 4 GB (estimaciones por tamaño, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100 o L40S para despliegue en BF16 con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para BF16 con batch moderado.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB) en BF16 con contexto limitado, y en GPUs de 8-12 GB si se cuantiza.
- Opciones de despliegue: al ser safetensors con arquitectura Qwen, es compatible con vLLM, TGI y transformers; para cuantización, llama.cpp u Ollama requerirían conversión a GGUF, no publicada en el repo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zils-mini-h2a | 4,54 B | no disponible | Apache 2.0 | Fine-tune de decisión del pool Zils d3-mini |
| Qwen/Qwen3.5-4B (padre) | ~4 B | no disponible | no disponible | Modelo base generalista del que deriva |
| Charlie320/zils-mini-s3l | no disponible | no disponible | no disponible | Cuerpo previo del mismo pool, usado como base del soup |
| jaysun007/zils-mini-body-m10 | no disponible | no disponible | no disponible | Cuerpo previo del mismo pool, usado como base del soup |

La comparación con alternativas fuera del ecosistema Zils no está disponible: la model card no aporta datos de rendimiento que permitan situar el modelo frente a otros de tamaño similar como Qwen3 o Llama 3.2 3B.

## Limitaciones y advertencias

- Modelo de nicho: entrenado exclusivamente sobre ítems de decisión en formato de examen, por lo que su rendimiento fuera de ese dominio no está documentado y probablemente sea limitado.
- Riesgo de alucinación: no evaluado ni documentado por el autor; al ser un fine-tune sobre datos sintéticos generados por modelos, puede heredar sesgos y errores de esos generadores.
- Sesgos conocidos: no documentados; los datos provienen de generación por Claude Opus y un modelo abierto local, con los sesgos que ello implica.
- Idiomas: no declarados; se desconoce si conserva el multilingüismo del modelo padre.
- Contexto: no se especifica la longitud de contexto soportada tras el fine-tune.
- Licencia: Apache 2.0 permite uso comercial, pero la model card advierte de que el repositorio solo contiene pesos y que deben revisarse los términos de los datasets de origen antes de reutilizarlos.
- Procedencia de datos: se declara que no se usaron ítems de validadores ni semillas públicas, pero la verificación de esa afirmación queda fuera del alcance de esta ficha.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; sin pipeline de inferencia declarado ni demos publicadas.

## Enlaces

- Hugging Face: https://huggingface.co/Charlie320/zils-mini-h2a
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.5-4B
- Cuerpo previo del pool: https://huggingface.co/jaysun007/zils-mini-body-m10
- Cuerpo previo del pool: https://huggingface.co/Charlie320/zils-mini-s3l
- Repositorio de autoría de Zils (scripts/author_exam.py): no disponible como enlace en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
