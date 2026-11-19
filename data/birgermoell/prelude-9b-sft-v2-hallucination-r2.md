# birgermoell/prelude-9b-sft-v2-hallucination-r2

## Resumen

Prelude 9B SFT v2 hallucination round 2 es un checkpoint de investigación derivado de `marianna13/prelude-9b-sft-v2`, desarrollado por Birger Moëll en el contexto del trabajo de post-entrenamiento del proyecto OpenEuroLLM. El modelo aborda un problema muy concreto: la fabricación de información (alucinación) en modelos de lenguaje multilingües europeos. Su objetivo es que el modelo responda "no lo sé" en lugar de inventar datos cuando no dispone de información fiable, en diez idiomas europeos (alemán, inglés, español, finés, francés, italiano, neerlandés, polaco, portugués y sueco).

El modelo parte de una base de aproximadamente 9.094 millones de parámetros (9B) con arquitectura Qwen3, y se ha afinado mediante dos etapas de SFT y DPO sobre un conjunto de 8.644 preguntas naturales multilingües. Los resultados reportados por el autor son notables en el eje de la abstención: la tasa de fabricación ante sujetos inventados cae del 97,7 % al 1,8 %, y la abstención correcta sube del 2,3 % al 98,2 %.

Es importante subrayar que se trata de un checkpoint de investigación, no de un modelo listo para producción. El autor lo publica junto con sus números y debilidades conocidas, y solo se ha ejecutado el benchmark de alucinación sobre él. Su interés radica en demostrar que es posible calibrar la abstención en modelos multilingües europeos de tamaño medio, a costa de un aumento de la cautela que provoca abtenciones excesivas en preguntas sobre figuras conocidas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3, según tags del repo) |
| Parámetros totales | 9.094.607.872 (9B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantizaciones GGUF no publicadas en la información disponible) |
| Idiomas soportados | en, de, fr, es, it, nl, pt, pl, sv, fi |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre `marianna13/prelude-9b-sft-v2` (revisión `8670e89`), un modelo de 9B parámetros de la familia Qwen3 según las etiquetas del repositorio. El post-entrenamiento se realizó en dos etapas sobre dos nodos de 4 × A100 de 64 GB en el clúster Leonardo (CINECA). La primera etapa consistió en la construcción de un pool de 8.644 preguntas naturales en diez idiomas, disjuntas del benchmark, que incluyen sujetos inventados (nombres y títulos ficticios de películas, novelas, cuadros, álbumes y lugares), personas reales de Wikidata en tres niveles de popularidad, y hechos de Wikidata (capitales, desembocaduras de ríos, años de fundación, directores) en niveles head/torso/tail. El modelo respondió cada pregunta ocho veces (temperatura 0,7, top-p 0,95, modo por defecto) y un juez externo, `gemma-4-31B-it`, etiquetó cada muestra como CORRECT, PARTIAL, WRONG, FABRICATED, ABSTAIN_GOOD o ABSTAIN_POOR frente a la referencia de Wikidata. Según la proporción de aciertos, cada pregunta se clasificó en *made-up*, *unknown* (precisión < 0,5), *sharpen* (0,5–0,75) o *known* (≥ 0,75).

Las respuestas elegidas para el entrenamiento fueron muestras del propio modelo que superaban una verificación estricta: abstención honesta que nombra el sujeto y no inventa nada, o respuesta correcta y concisa. El pipeline completo, los datos exactos de entrenamiento y las salidas del benchmark están publicados en el repositorio de GitHub del autor y en el dataset asociado. Se emplearon técnicas de SFT y DPO (según los tags del modelo) para alinear el comportamiento de abstención.

## Capacidades

- Generación de texto conversacional multilingüe en diez idiomas europeos.
- Abstención calibrada: declina responder cuando no dispone de información fiable, nombrando el sujeto y solicitando contexto, en lugar de fabricar datos.
- Respuesta en el idioma de la pregunta (97,6 % en el benchmark, frente al 97,0 % del modelo base).
- Modo de razonamiento (*thinking mode*), aunque más débil en hechos conocidos (40,0 % frente al 53,8 % del base) porque los pares de entrenamiento se generaron en modo por defecto.
- Manejo de preguntas sobre personas reales poco conocidas, hechos de Wikidata y entidades inventadas.
- No se dispone de información sobre soporte de tool calling, function calling, agentes o multi-step reasoning en la documentación proporcionada.

## Casos de uso

- Asistentes de atención al cliente con política de abstención: el modelo puede integrarse en flujos donde sea preferible derivar a un humano o pedir aclaración antes que inventar datos sobre productos, políticas o personas, gracias a su abstención calibrada en diez idiomas europeos.
- Sistemas de preguntas y respuestas sobre dominios con cobertura desigual: en bases de conocimiento con lagunas (por ejemplo, Wikidata en niveles tail), el modelo declina en lugar de fabricar, lo que reduce el riesgo de propagar errores.
- Moderación y verificación de hechos en pipelines editoriales: puede usarse como primer filtro para detectar preguntas sobre entidades dudosas o inventadas, señalando la falta de información fiable antes de escalar a revisión humana.
- Investigación en calibración y alineación: sirve como caso de estudio reproducible para estudiar el equilibrio entre abstención y utilidad, con datos de entrenamiento y salidas de benchmark publicados.
- Despliegue multilingüe en la UE: cubre diez idiomas europeos, lo que lo hace adecuado para prototipos de asistentes internos en organizaciones con plantillas multilingües.
- Evaluación de modelos de referencia en tareas de honestidad: puede emplearse como modelo de comparación en experimentos que midan fabricación y abstención en modelos europeos de tamaño medio.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden al benchmark de alucinación del autor (500 preguntas, 10 idiomas, modo por defecto):

| Métrica | Prelude-9B-SFT-v2 | Este modelo |
|---|---:|---:|
| Fabricación ante sujetos inventados | 97,7 % | 1,8 % |
| Abstención correcta ante sujetos inventados | 2,3 % | 98,2 % |
| Personas reales poco conocidas: respuesta incorrecta | 100 % | 2,5 % |
| Personas conocidas: correctas (incl. parciales) | 53,8 % | 53,8 % |
| Personas conocidas: respuestas incorrectas (de 80) | 35 | 6 |
| Personas conocidas: abstención | 0 % | 38,8 % |
| Respuestas en el idioma de la pregunta | 97,0 % | 97,6 % |
| Veracidad (correctas − incorrectas − fabricadas) | −85,2 | +3,8 |

En modo *thinking*, el modelo sigue siendo bueno en fabricación (2,3 %) pero más débil en hechos conocidos (40,0 % frente al 53,8 % del base). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9B parámetros en safetensors (18,2 GB de repo), se requiere aproximadamente 18–20 GB en FP16/BF16; en cuantización de 8 bits, en torno a 10–12 GB; en 4 bits, en torno a 6–8 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para FP16; RTX 4090 (24 GB) permite FP16 ajustado o 8 bits; GPUs consumer de 12–16 GB pueden ejecutar cuantizaciones de 4–8 bits.
- Cabe en GPU consumer: sí, en cuantizaciones de 8 o 4 bits en RTX 3090/4090 y similares; en FP16 requiere al menos 24 GB.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); no se confirma soporte de llama.cpp, Ollama o vLLM en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (Prelude 9B hallucination r2) | 9B | no disponible | 10 europeos | no disponible | Checkpoint de investigación centrado en abstención |
| marianna13/prelude-9b-sft-v2 (base) | 9B | no disponible | 10 europeos | no disponible | Modelo base; fabrica en el 97,7 % de sujetos inventados |
| Alternativas comparables de 9B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de comparación en la información proporcionada |

No se dispone de información suficiente para comparar con modelos alternativos de la misma categoría en parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Checkpoint de investigación: el autor lo describe explícitamente como no candidato a release general; solo se ha ejecutado el benchmark de alucinación.
- Exceso de cautela: se abstiene en 31 de 80 preguntas sobre personas conocidas, en su mayoría fechas y lugares de nacimiento; 11 preguntas que el modelo base respondía (parcialmente) bien ahora se declinan.
- Modo *thinking* más débil en hechos conocidos (40,0 % frente al 53,8 % del base), porque los pares de entrenamiento se generaron en modo por defecto.
- Problema heredado: algunas preguntas en neerlandés se responden en alemán, tanto en el modelo base como en este.
- Licencia no disponible: no se puede confirmar el uso comercial; es imprescindible verificar la licencia del modelo base y de este checkpoint antes de cualquier despliegue en producción.
- Riesgo de alucinación residual: aunque la fabricación cae drásticamente en el benchmark del autor, no se han evaluado dominios fuera del conjunto de prueba.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Idiomas limitados a diez lenguas europeas; no se ha evaluado su comportamiento fuera de ellas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/birgermoell/prelude-9b-sft-v2-hallucination-r2
- Modelo base: https://huggingface.co/marianna13/prelude-9b-sft-v2
- Dataset con datos de entrenamiento y salidas del benchmark: https://huggingface.co/datasets/birgermoell/prelude-9b-sft-v2-hallucination-r2-data
- Código, pipeline, benchmark y borrador de paper: https://github.com/BirgerMoell/oellm-hallucination
- Juez utilizado en el pipeline: https://huggingface.co/google/gemma-4-31B-it
