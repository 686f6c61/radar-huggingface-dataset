# Charlie320/zils-mini-m15p

## Resumen

zils-mini-m15p es un modelo de decisión (decision-model) publicado por Charlie320 como cuerpo ("body") para el pool de soups `d3-mini` de Zils, un sistema asociado al subnet 127 de Bittensor. Se trata de un fine-tune del modelo base Qwen/Qwen3.5-4B, del que hereda la arquitectura transformer y el tower de visión, con pesos en BF16 y un total de 4.539.265.536 parámetros. El modelo no está pensado como un asistente conversacional general, sino como un componente que produce decisiones tipadas dentro de un examen estructurado de familias de tareas conocidas.

La relevancia técnica del modelo está en su procedimiento de construcción: un "soup" (promediado de pesos) de dos fine-tunes LoRA de rango 64 fusionados, entrenados con semillas distintas sobre 61.091 filas y promediados uniformemente con pesos iguales. El entrenamiento usa objetivos suaves (soft targets) que mezclan la respuesta propia del ítem con las probabilidades de respuesta del modelo de partida, una técnica de destilación parcial que busca preservar el comportamiento del modelo inicial mientras se corrige hacia las etiquetas del examen.

El modelo se publica con licencia Apache 2.0, aunque el autor advierte explícitamente de que los términos de los datasets de origen deben revisarse antes de cualquier reutilización. El repositorio contiene únicamente pesos (9,1 GB) y no incluye pipeline, idiomas declarados ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-4B), con tower de visión del modelo padre |
| Parámetros totales | 4.539.265.536 (4,54 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B y conserva su diseño de transformer, incluyendo el tower de visión del progenitor, por lo que el cuerpo es multimodal en origen aunque la model card solo describe el entrenamiento de los pesos de lenguaje. El autor indica que se entrenaron los "language weights" mientras que el tower de visión se mantiene del padre. El punto de partida del fine-tune es joamCriff123/zils-mini-m1115, el único cuerpo del soup `d3-mini` actual, y el crédito del arranque se atribuye a su autor y a los autores de los cuerpos de los que se construyó.

El procedimiento de entrenamiento consiste en dos fine-tunes LoRA de rango 64, fusionados y entrenados con semillas diferentes, cada uno con una pasada barajada sobre 61.091 filas a una tasa de aprendizaje de 5e-5; después se promedian uniformemente con pesos iguales. Los objetivos son suaves: para los ítems de examen escritos, tres cuartas partes de la respuesta propia del ítem y una cuarta parte de las probabilidades de respuesta del modelo de partida; para los ítems de puntuación aritmética escrita y de similitud de frases escrita (4.093 filas), solo las probabilidades del modelo de partida, porque sus respuestas escritas resultaron poco fiables; y para las filas de tasksource-jev, mitad y mitad entre la etiqueta de la fila y las probabilidades del modelo de partida.

Los datos de entrenamiento se componen de dos bloques. El primero son unas 31.100 decisiones en formato de examen de familias de tareas conocidas, escritas con la receta pública de autoría de Zils (`scripts/author_exam.py`) por Claude Opus y por un modelo abierto local, a partir de splits de entrenamiento de datasets públicos; incluye unas 1.100 filas de tool-call extraídas de las filas 90.000-93.000 del subconjunto de function-calling de `glaiveai/glaive-function-calling-v2`. El segundo bloque son 30.000 filas del split de entrenamiento de `tasksource/tasksource-jev-typed-decisions` con sus etiquetas, restringidas a fuentes con metadatos de licencia comercial o no especificada, excluyendo fuentes no comerciales y descartando fuentes cuyos nombres coinciden con tareas de BIG-bench. El autor declara que no se usaron ítems de examen del validador, ni ítems públicos de semilla, ni datos de clientes.

## Capacidades

- Producción de decisiones tipadas en formato de examen para familias de tareas conocidas, según la receta de autoría de Zils.
- Tool calling / function calling: el conjunto de entrenamiento incluye aproximadamente 1.100 ítems de llamada a herramientas derivados de glaive-function-calling-v2.
- Tareas de decisión tipada procedentes de tasksource-jev-typed-decisions (30.000 filas de entrenamiento con etiquetas).
- Ítems de puntuación aritmética escrita y de similitud de frases escrita, aunque en estos el modelo se ancló a las probabilidades del modelo de partida por fiabilidad limitada de las respuestas escritas.
- Capacidad de visión heredada del tower del modelo padre Qwen/Qwen3.5-4B (no se detalla su entrenamiento en esta ficha).
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Evaluación de cuerpos en el pool `d3-mini` de Zils (subnet 127 de Bittensor): el modelo se usaría como candidato del soup, comparando sus decisiones tipadas frente a las de otros cuerpos del pool mediante el examen del validador.
- Clasificación de decisiones tipadas sobre tareas de tasksource-jev: al haber sido entrenado con 30.000 filas etiquetadas de ese dataset, puede emplearse para reproducir o aproximar las etiquetas de decisión en ese dominio concreto.
- Enrutamiento de llamadas a herramientas: los ítems de function-calling de glaive permiten usar el modelo como componente que decide qué herramienta invocar y con qué argumentos en un pipeline de agentes, siempre que el esquema de decisión coincida con el formato de examen entrenado.
- Puntuación aritmética y similitud de frases en modo decisión: útil como componente de scoring dentro de un examen estructurado, con la advertencia de que en estas categorías el modelo se ancló a las probabilidades del modelo de partida.
- Investigación sobre promediado de pesos (model soups): el repositorio documenta con precisión el procedimiento de dos LoRA fusionados y promediado uniforme, lo que lo convierte en un caso reproducible para estudiar el efecto del soup sobre objetivos suaves.
- Estudio de destilación parcial con soft targets: la mezcla explícita entre respuesta del ítem y probabilidades del modelo de partida (3/4-1/4 y 1/2-1/2) permite analizar cómo se preserva el comportamiento del modelo inicial al corregir hacia etiquetas nuevas.
- Base para fine-tunes posteriores en la cadena de cuerpos de Zils: al ser un cuerpo del pool, puede servir de punto de partida para nuevos fine-tunes dentro del mismo ecosistema, como lo fue zils-mini-m1115 para este modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para pesos (4,54 B parámetros × 2 bytes), más overhead de activaciones y caché KV; el tamaño del repo (9,1 GB) es coherente con esta cifra.
- Cuantización: no se publican artefactos GGUF ni cuantizados; para reducir VRAM habría que convertir los safetensors a otros formatos por cuenta propia.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, un modelo de 4,54 B en BF16 encaja en GPUs consumer con 16 GB o más de VRAM (por ejemplo, RTX 4080/4090 o superiores), aunque el fabricante no lo confirma.
- Despliegue: no se indican opciones soportadas (vLLM, llama.cpp, Ollama, TGI) ni se publica pipeline; el repo contiene únicamente pesos en safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-m15p | 4,54 B | no disponible | Apache 2.0 | Pesos safetensors en HF | Fine-tune de decisión, soup de dos LoRA sobre Qwen3.5-4B |
| Qwen/Qwen3.5-4B (modelo base) | ~4 B (no confirmado en la información) | no disponible | no disponible en esta ficha | HF | Progenitor directo; aporta arquitectura y tower de visión |
| joamCriff123/zils-mini-m1115 (punto de partida) | no disponible | no disponible | no disponible | HF | Único cuerpo del soup `d3-mini` actual; base del fine-tune |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a linaje y licencia.

## Limitaciones y advertencias

- Modelo especializado en decisiones en formato de examen: no es un asistente general y su comportamiento fuera de las familias de tareas entrenadas no está caracterizado.
- Objetivos suaves: en los ítems de puntuación aritmética y similitud de frases escrita (4.093 filas) el modelo se entrenó solo con las probabilidades del modelo de partida porque las respuestas escritas eran poco fiables; en esas categorías reproduce el sesgo del progenitor.
- Sin datos de benchmarks, idiomas ni contexto: no es posible evaluar su rendimiento relativo ni su cobertura lingüística con la información publicada.
- Licencia: los pesos son Apache 2.0, pero el autor advierte de que deben revisarse los términos de los datasets de origen antes de reutilizar; parte de los datos se filtró por metadatos de licencia comercial o no especificada, lo que no garantiza su idoneidad para todos los usos.
- Riesgo de alucinación y sesgos: no documentado en la model card; al derivar de Qwen3.5-4B y de datos generados por Claude Opus y un modelo abierto local, puede heredar sesgos de esas fuentes.
- Procedencia de datos sintéticos: aproximadamente 31.100 ítems fueron generados por modelos (Claude Opus y un modelo abierto local) con una receta pública, lo que introduce dependencia de la calidad y los sesgos de esos generadores.
- Sin pipeline declarado ni idiomas: la integración en producción requiere definir el formato de examen y validar el contrato de decisión por cuenta propia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema muy incipiente, sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Charlie320/zils-mini-m15p
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Punto de partida del fine-tune: https://huggingface.co/joamCriff123/zils-mini-m1115
- Dataset de decisiones tipadas: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
- Dataset de function calling: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
