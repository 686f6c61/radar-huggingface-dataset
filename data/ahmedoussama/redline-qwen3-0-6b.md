# ahmedoussama/redline-qwen3-0.6b

## Resumen

Redline es un corrector gramatical del inglés construido como un ajuste fino completo (*full fine-tune*) del modelo Qwen3-0.6B, desarrollado por el usuario ahmedoussama. Resuelve una tarea muy concreta: recibir una frase y devolverla corregida en gramática, ortografía y puntuación, o devolverla sin cambios si ya es correcta. Frente a los correctores basados en modelos encoder-decoder de mayor tamaño, apuesta por un modelo causal pequeño (596 millones de parámetros) con una instrucción fija y decodificación greedy.

Su relevancia práctica está en las métricas de la tarea: en el conjunto de test JFLEG alcanza un GLEU de 59,02 con decodificación greedy (59,26 con beam de 4), frente a 55,60 de grammarly/coedit-large (770M) y 61,12 de la referencia humana. Además, en un conjunto de desarrollo retenido reduce drásticamente la tasa de reescritura innecesaria (*no-op rate*) al 12,9 %, frente al 62,8 % de coedit-large, un dato crítico para cualquier corrector que se integre en producción.

El modelo está entrenado únicamente en inglés, a nivel de frase, con fuentes limitadas a 300 caracteres, y se distribuye con licencia Apache-2.0. Se entrenó en una sola GPU NVIDIA T4 en poco más de cinco horas, lo que lo convierte en un caso de referencia para ajustes finos de bajo coste orientados a una tarea específica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen3), ajuste fino completo del modelo base |
| Parámetros totales | 596.049.920 (596 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento limitado a frases de hasta 300 caracteres) |
| Tipos de cuantización | no disponible (pesos en safetensors; admite las cuantizaciones estándar de transformers/llama.cpp, sin datos publicados) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-0.6B |
| Tarea | Corrección gramatical (GEC) |
| Métrica de evaluación | GLEU (JFLEG) |
| Tamaño del repositorio | 2,4 GB |

## Arquitectura y entrenamiento

Redline es un ajuste fino completo de todos los 596 M parámetros de Qwen3-0.6B, un transformer causal con la arquitectura Qwen3. No se modificó la arquitectura ni se añadieron cabeceras específicas: la tarea se formula como generación condicionada por una instrucción fija en formato de chat, con `enable_thinking=False`. El entrenamiento se realizó con LLaMA-Factory (commit `b4e4d3f`) y transformers 5.15.1, usando Adafactor en fp16 con *gradient checkpointing* para que el ajuste completo cupiera en una T4 de 15 GB.

El conjunto de datos combina 149.843 pares de corrección y 17.981 frases ya correctas (aproximadamente el 12 % del total, para que el modelo aprenda a no tocar texto válido). Las fuentes son W&I+LOCNESS (23.471 pares humanos), CoEdIT GEC (18.000 pares humanos) y C4-200M (108.372 pares sintéticos); solo alrededor del 28 % de los pares son de anotación humana. Tras eliminar duplicados exactos y dividir por hash de contenido, quedaron 160.196 filas de entrenamiento. El régimen fue de 1 época, 10.013 pasos, batch 8 con acumulación ×2, learning rate 2e-5 con decaimiento coseno y 3 % de warmup; el entrenamiento duró 5 h 18 min y terminó con una pérdida de evaluación de 0,339. Los pares se conservaron solo si un diff a nivel de palabra podía reconstruirlos exactamente, filtrando alineaciones corruptas.

La innovación principal no está en la arquitectura, sino en el diseño de decodificación y en la estrategia de datos: se hizo un barrido de parámetros de decodificación sobre validación de JFLEG y se reportó sobre test, de modo que el conjunto de test nunca selecciona la configuración. Se documenta además que `no_repeat_ngram_size` degrada el GLEU a 21,93 porque una corrección copia la mayor parte de la entrada.

## Capacidades

- Corrección de gramática, ortografía y puntuación en inglés a nivel de frase, devolviendo la frase corregida o la original sin cambios.
- Comportamiento conservador: deja intacto texto ya correcto en aproximadamente el 87 % de los casos (tasa de reescritura del 12,9 %).
- Generación de texto condicionada por una instrucción fija en formato de chat (plantilla de chat de Qwen3).
- Derivación de ediciones resaltadas mediante diff a nivel de palabra entre entrada y salida, de modo que las ediciones son siempre subcadenas reales de la entrada.
- No dispone de *tool calling*, *function calling*, capacidades de agente, visión, audio ni modo de razonamiento explícito (se desactiva el *thinking*).
- Multilingüe: no; únicamente inglés.

## Casos de uso

- Corrección en editores y procesadores de texto: integrado como servicio de inferencia detrás de un editor, corrige frases seleccionadas por el usuario y muestra las ediciones como diff a nivel de palabra, garantizando que ninguna sugerencia sea texto inventado.
- Preprocesado de datos para *pipelines* de NLP: normalizar gramática y puntuación de reseñas, formularios o transcripciones antes de tareas posteriores de clasificación o extracción, aprovechando que el modelo no reescribe texto ya correcto.
- Revisión de textos de estudiantes de inglés: el modelo está evaluado sobre JFLEG, un corpus de aprendices, y su GLEU de 59,02 lo sitúa cerca de la referencia humana (61,12), lo que lo hace adecuado para herramientas de aprendizaje de idiomas.
- Moderación de contenido generado por usuarios: corrección ligera y de baja latencia en foros o comentarios, con un modelo de 596 M que puede ejecutarse en CPU o en GPU de consumo.
- Corrección por lotes en entornos con recursos limitados: al entrenarse en una T4 y pesar 2,4 GB en safetensors, puede desplegarse en una única GPU pequeña para procesar grandes volúmenes de frases.
- Variante de dominio bancario: existe `redline-bank-qwen3-0.6b`, un ajuste específico para el dominio financiero, útil en la normalización de comunicaciones y textos internos de banca.
- Generación de datos de entrenamiento limpios: usar el modelo como corrector para depurar corpus sintéticos o de baja calidad antes de reutilizarlos en otros entrenamientos.

## Benchmarks y rendimiento

JFLEG test (747 frases de aprendices, 4 correcciones humanas por frase, GLEU; mayor es mejor):

| Sistema | Parámetros | GLEU |
|---|---|---|
| Texto fuente sin ediciones | – | 40,21 |
| grammarly/coedit-large | 770 M | 55,60 |
| Redline (greedy) | 596 M | 59,02 |
| Redline (beam 4) | 596 M | 59,26 |
| Referencia humana | – | 61,12 |

Conjunto de desarrollo retenido (400 frases con errores, 349 ya correctas):

| Métrica | coedit-large | Redline |
|---|---|---|
| F0.5 | 0,277 | 0,445 |
| Exact match | 0,065 | 0,107 |
| No-op rate ↓ | 0,628 | 0,129 |

En validación de JFLEG, greedy y beam de 4 empatan con 54,92 de GLEU; en test, beam de 4 mejora a 59,26 a costa de aproximadamente 3× el tiempo de generación, por lo que se recomienda greedy como configuración por defecto.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en fp16 para los pesos (596 M parámetros), más el *overhead* del runtime; en cuantización de 8 bits o 4 bits cabe holgadamente en GPUs de 4-8 GB.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM; el modelo se entrenó en una NVIDIA T4 y funciona en RTX 3060, RTX 4090, A100 o H100 sin problema.
- Cabe en GPU de consumo: sí, en todas las GPU modernas de consumo con 4 GB o más; también es viable en CPU para volúmenes moderados.
- Opciones de despliegue: transformers (referencia oficial), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repo), y cualquier runtime compatible con safetensors; no se documentan recetas específicas para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles de forma publicada; el autor solo indica que beam de 4 tarda aproximadamente 3× más que greedy.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | JFLEG GLEU | No-op rate | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Redline (Qwen3-0.6B) | 596 M | no disponible | 59,02 (greedy) | 0,129 | Apache-2.0 | Hugging Face |
| grammarly/coedit-large | 770 M | no disponible | 55,60 | 0,628 | Apache-2.0 | Hugging Face |
| Qwen3-0.6B (base) | 596 M | no disponible | no disponible | no disponible | Apache-2.0 | Hugging Face |
| Referencia humana (JFLEG) | – | – | 61,12 | – | – | – |

Redline supera a coedit-large en GLEU pese a tener menos parámetros y, sobre todo, reduce la reescritura innecesaria de texto correcto en casi cinco veces, lo que lo hace más adecuado para integrarse en flujos de producción donde los falsos positivos son costosos.

## Limitaciones y advertencias

- Solo inglés y solo a nivel de frase: las fuentes de entrenamiento se limitaron a 300 caracteres, por lo que es necesario dividir párrafos largos en frases antes de enviarlos.
- Ligeramente conservador: edita aproximadamente el 80 % de las frases de JFLEG, mientras que los anotadores humanos editan alrededor del 86 %.
- Los errores de C4-200M son sintéticos; solo cerca del 28 % de los pares de entrenamiento son de anotación humana, lo que puede introducir sesgos hacia patrones de error artificiales.
- Riesgo de alucinación en la corrección: aunque el modelo copia la mayor parte de la entrada, no hay garantía formal de que la salida sea una edición mínima; para interfaces que muestran ediciones se recomienda derivarlas con diff a nivel de palabra.
- No se han publicado evaluaciones de sesgo; al ser un ajuste de Qwen3-0.6B, hereda los sesgos del modelo base.
- Restricciones de licencia: los pesos son Apache-2.0 y CoEdIT también, pero W&I+LOCNESS se distribuye por los organizadores de BEA-2019 para uso de investigación, por lo que conviene revisar sus términos antes de un uso comercial.
- El `generation_config.json` incluido corresponde a la configuración de muestreo del modelo base; es imprescindible pasar `do_sample=False` para replicar los resultados publicados.
- No debe configurarse `no_repeat_ngram_size`: degrada el GLEU de 59,02 a 21,93.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahmedoussama/redline-qwen3-0.6b
- Variante bancaria: https://huggingface.co/ahmedoussama/redline-bank-qwen3-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo comparado: https://huggingface.co/grammarly/coedit-large
- Notebook de entrenamiento: https://www.kaggle.com/code/ososovic/qwen3-grammar-checker
- Barrido de decodificación: https://www.kaggle.com/code/ososovic/qwen3-gec-decoding
- Código: https://github.com/ahmedosama-git/redline
- Dataset CoEdIT: https://huggingface.co/datasets/grammarly/coedit
- Dataset W&I+LOCNESS: https://huggingface.co/datasets/512duncanl/wi_locness_detokenized
- Dataset C4-200M: https://huggingface.co/datasets/512duncanl/c4_200m_cleaned_365k
