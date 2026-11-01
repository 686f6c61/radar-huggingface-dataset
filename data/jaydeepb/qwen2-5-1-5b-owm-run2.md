# jaydeepb/qwen2.5-1.5b-owm-run2

## Resumen

`jaydeepb/qwen2.5-1.5b-owm-run2` es un artefacto de investigación publicado en Hugging Face por el usuario jaydeepb. Se trata de una versión ajustada (fine-tuning) de `Qwen/Qwen2.5-1.5B`, entrenada durante una época sobre una muestra de 1 millón de secuencias del corpus **OpenWebMath**. El modelo no está pensado para uso productivo, sino como parte del trabajo *Predicting Memorization Before Fine-Tuning Language Models*: sirve como ejecución de ajuste "Run 2" reservada para evaluación, donde unos clasificadores entrenados predicen qué secuencias memoriza el modelo a partir de características del modelo base antes del ajuste.

Su relevancia no radica en la calidad generativa, sino en la reproducibilidad científica: permite verificar experimentalmente los resultados del estudio de memorización textual. La propia model card advierte explícitamente que el modelo puede reproducir literalmente fragmentos de sus datos de ajuste, por lo que debe tratarse con precaución. La arquitectura base es Qwen2 (transformer decoder denso) con aproximadamente 1.540 millones de parámetros, y los pesos se distribuyen en formato safetensors (3,1 GB en el repositorio).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen2), denso |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la base Qwen2.5-1.5B usa 32.768 tokens, pero no se confirma en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre OpenWebMath, corpus principalmente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3,1 GB) |

## Arquitectura y entrenamiento

El modelo parte de **Qwen2.5-1.5B**, un transformer decoder denso de la familia Qwen2.5 de Alibaba con aproximadamente 1.540 millones de parametros. El ajuste fino consistio en una unica epoca de entrenamiento sobre una muestra de 1 millon de secuencias de **OpenWebMath**, un corpus de contenido matematico y cientifico extraido de la web y filtrado para conservar razonamiento cuantitativo. No se ha documentado el metodo de ajuste (full fine-tuning, LoRA u otro), el tamano de batch, la tasa de aprendizaje ni el hardware empleado: no disponible.

La particularidad de este artefacto es metodologica: constituye la ejecucion "Run 2" del paper *Predicting Memorization Before Fine-Tuning Language Models*. En ese trabajo se entrenan clasificadores que, usando solo caracteristicas del modelo base previas al ajuste, predicen que secuencias de entrenamiento seran memorizadas de forma textual (verbatim) por el modelo ajustado. Este modelo es el objetivo de esas predicciones, y su grado real de memorizacion es la variable que se evalua. No hay informacion sobre RLHF, DPO u otros alineamientos posteriores: no disponible.

## Capacidades

- Generacion de texto conversacional heredada del modelo base Qwen2.5-1.5B (pipeline `text-generation`).
- Generacion y continuacion de contenido matematico y cientifico, por la naturaleza del corpus OpenWebMath usado en el ajuste.
- Reproduccion (memorizacion) parcial y literal de secuencias del conjunto de ajuste: es el comportamiento objeto de estudio, no una capacidad deseable.
- No se ha documentado soporte de tool calling / function calling: no disponible.
- No se ha documentado soporte de agentes ni razonamiento multi-paso: no disponible.
- No se ha documentado capacidad multimodal (vision, audio): no disponible.
- Modo de razonamiento (thinking mode): no disponible.

## Casos de uso

- **Investigacion en memorizacion de LLMs**: reproducir o extender los experimentos del paper, midiendo que secuencias del corpus de ajuste aparecen de forma textual en las salidas del modelo.
- **Desarrollo de clasificadores predictivos**: usar este modelo como objetivo de evaluacion para metodos que estimen la memorizacion antes del ajuste, comparando predicciones con la memorizacion real observada.
- **Estudios de privacidad y extraccion de datos**: analizar cuanta informacion del corpus de entrenamiento puede extraerse de un modelo ajustado con datos publicos.
- **Comparacion de tecnicas de mitigacion**: emplearlo como modelo de referencia sobre el que probar unlearning, regularizacion o deduplicacion de datos.
- **Docencia y formacion**: material practico para cursos sobre memorizacion, sobreajuste y gobernanza de datos en modelos de lenguaje.
- **Analisis del efecto de datos matematicos en modelos pequenos**: estudiar como una epoca sobre OpenWebMath modifica el comportamiento de Qwen2.5-1.5B frente a su modelo base.

No es adecuado para asistentes de produccion, atencion al cliente, generacion de codigo en pipelines ni casos de uso comerciales: no fue ajustado ni alineado para ello.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra prueba, y el proposito del modelo es medir memorizacion, no rendimiento general.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,1 GB de pesos, mas overhead de activaciones y KV cache; en la practica, 6-8 GB de VRAM son suficientes.
- En FP32 (si se cargara sin half precision) se requeririan unos 6,2 GB de pesos.
- GPUs recomendadas: cualquier GPU de consumo moderna (RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4090) ejecuta el modelo con holgura; no se necesitan A100 ni H100 para inferencia.
- Cabe sin problemas en GPUs de consumo, incluso de gama media, y tambien es viable su ejecucion en CPU con librerias optimizadas, aunque con mayor latencia.
- Opciones de despliegue: transformers (libreria nativa del repositorio), vLLM, TGI, llama.cpp (requiere conversion a GGUF, no disponible en el repo) u Ollama (requiere GGUF). No hay cuantizaciones publicadas en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| jaydeepb/qwen2.5-1.5b-owm-run2 | 1.543.714.304 | no disponible | Apache 2.0 | Artefacto de investigacion sobre memorizacion |
| Qwen/Qwen2.5-1.5B (base) | ~1.540 M | 32.768 tokens (según ficha oficial) | Qwen Research / Apache 2.0 (versiones posteriores) | Modelo base de uso general |
| Qwen/Qwen2.5-1.5B-Instruct | ~1.540 M | 32.768 tokens (según ficha oficial) | Apache 2.0 | Asistente ajustado con instrucciones |

La diferencia clave es el proposito: las variantes oficiales de Qwen estan pensadas para uso general o conversacional, mientras que este artefacto esta ajustado sobre OpenWebMath para un estudio de memorizacion y puede emitir datos de entrenamiento de forma literal.

## Limitaciones y advertencias

- **Riesgo alto de reproduccion literal de datos**: la propia model card advierte que el modelo puede reproducir verbatim porciones de su conjunto de ajuste (OpenWebMath). No debe usarse en aplicaciones orientadas a usuario final.
- **Sin alineamiento**: no hay indicios de RLHF, DPO ni ajuste por instrucciones, por lo que las salidas pueden ser incoherentes o no seguir indicaciones del usuario.
- **Sesgos heredados**: hereda los sesgos de Qwen2.5-1.5B y del corpus OpenWebMath (contenido web, predominantemente en ingles); no se ha publicado analisis de sesgos: no disponible.
- **Alucinaciones**: al ser un modelo pequeno sin alineamiento, el riesgo de generar contenido falso o matematicamente incorrecto es elevado.
- **Idioma**: el corpus de ajuste es principalmente en ingles; el rendimiento en castellano no esta documentado: no disponible.
- **Licencia**: Apache 2.0 permite uso comercial, pero la advertencia de memorizacion del autor hace desaconsejable cualquier despliegue productivo.
- **Alcance**: es un artefacto de investigacion con descargas limitadas (246) y sin soporte comunitario documentado; su mantenimiento no esta garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaydeepb/qwen2.5-1.5b-owm-run2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Paper de referencia (citado en la model card): *Predicting Memorization Before Fine-Tuning Language Models* — enlace directo no disponible
- Corpus OpenWebMath: enlace directo no disponible
