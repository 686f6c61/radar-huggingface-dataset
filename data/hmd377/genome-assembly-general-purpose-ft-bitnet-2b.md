# hmd377/genome-assembly-general-purpose-ft-bitnet-2b

## Resumen

GAQA v1 es un ajuste fino del modelo ternario `microsoft/bitnet-b1.58-2B-4T` orientado a la evaluacion automatica de la calidad de ensamblados genomicos (genome assembly quality assessment, GAQA). Lo desarrollan Abdellah Hmade e Ibrahim Guelzim, y resuelve un problema muy concreto del flujo bioinformatico: diagnosticar fallos de ensamblado (cobertura baja, contaminacion, misassembly), proponer remediaciones y recomendar el ensamblador o la herramienta adecuada.

El modelo parte de una arquitectura transformer con pesos ternarios en {−1, 0, +1} (~1,58 bits por peso) y anade adaptadores LoRA de rango 32 y alpha 64 sobre todas las proyecciones de atencion (q/k/v/o) y de MLP (gate/up/down), en total 210 capas. Solo se entrenan los aproximadamente 372 millones de parametros del adaptador, mientras que los pesos ternarios del modelo base permanecen congelados.

Su relevancia practica esta en la relacion entre rendimiento y coste: segun el articulo asociado, alcanza un 69,3 % en el conjunto externo organism-heldout frente al 54,4 % de Qwen2.5-7B-Instruct y el 39,5 % de Mistral-7B-Instruct-v0.3, con un pico de VRAM de aproximadamente 1,22 GB, unas cinco veces menos memoria que los modelos de 7B comparados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con pesos ternarios (BitNet b1.58) y adaptadores LoRA inyectados en atencion (q/k/v/o) y MLP (gate/up/down) |
| Parametros totales | ~2.000 millones en el modelo base `bitnet-b1.58-2B-4T`; adaptador LoRA de ~372 millones de parametros entrenables |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos ternarios {−1, 0, +1} a ~1,58 bits por peso en el modelo base; adaptador LoRA almacenado en punto flotante de 16 bits (bfloat16 durante el entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada del modelo base); el dataset GAQA v1 se distribuye bajo CC BY 4.0 |
| Formato de pesos | PyTorch (`.pt`) para el adaptador LoRA; se incluyen `config.json`, `tokenizer.json`, `tokenizer_config.json` y `chat_template.jinja` como referencia del modelo base |

## Arquitectura y entrenamiento

La base es `microsoft/bitnet-b1.58-2B-4T`, un transformer causal de unos 2.000 millones de parametros cuyos pesos estan cuantizados a valores ternarios, lo que reduce la huella de memoria y el coste de multiplicacion. Sobre esa base congelada se aplica un ajuste fino mediante LoRA con rango `r=32`, escalado `alpha=64` y dropout `0.05`, cubriendo las proyecciones de atencion y MLP en 210 capas. La perdida se calcula unicamente sobre los tokens de respuesta (completion-only) y se emplea un estimador straight-through (STE) compatible con los pesos ternarios.

El entrenamiento consta de 3 epocas (aproximadamente 4.143 pasos) con longitud de secuencia de 1.024 tokens, optimizador AdamW de 8 bits y precision bfloat16, ejecutado en una unica GPU A100 de 80 GB durante unos 35 minutos. El dataset GAQA v1 contiene 11.043 ejemplos: 4.740 de diagnostico de calidad (`qc_diagnosis`), 4.740 de remediacion, 159 de seleccion de herramienta (`tool_selection`) y 1.404 de conocimiento de dominio. El repositorio distribuye unicamente los pesos del adaptador, no un modelo independiente, y su carga requiere el codigo de reproduccion publicado en Zenodo.

## Capacidades

- Generacion de texto conversacional aplicada a bioinformatica y genomica.
- Diagnostico de problemas de ensamblado genomico: cobertura baja, contaminacion y misassembly.
- Recomendacion de acciones de remediacion sobre ensamblados problematicos.
- Seleccion de ensamblador o herramienta: en el conjunto heldout por familia alcanza un 100 % de acierto en `tool_selection`.
- Respuesta a preguntas de conocimiento de dominio genomico: 84,0 % en el conjunto domain-knowledge del articulo.
- Evaluacion mediante preguntas de eleccion multiple con puntuacion basada en logits (scorer de eleccion forzada incluido en el codigo de reproduccion, `eval.py`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Diagnostico automatico de calidad de ensamblados bacterianos: el modelo clasifica y describe fallos habituales en ensamblados de lectura corta, lo que permite sustituir revisiones manuales por un triaje automatico en el pipeline.
- Recomendacion de remediacion tras el diagnostico: dado un ensamblado con problemas, propone ajustes concretos (por ejemplo, cambios de parametros o estrategias de curado) para corregir el resultado.
- Seleccion de ensamblador: con un 100 % de acierto en la familia `tool_selection` del conjunto heldout, puede utilizarse como recomendador entre SPAdes y MEGAHIT u otras alternativas evaluadas.
- Triaje en laboratorios de secuenciacion: integrado en el flujo posterior al ensamblado, marca que muestras necesitan intervencion humana y cuales pueden continuar, reduciendo el tiempo de analisis.
- Asistente conversacional para bioinformaticos: responde preguntas de conocimiento de dominio sobre control de calidad de ensamblados, con 84,0 % en el conjunto de dominio del articulo.
- Despliegue en entornos con recursos limitados: con un pico de VRAM de aproximadamente 1,22 GB, puede ejecutarse en una unica GPU de gama de entrada o incluso en estaciones de trabajo on-premise donde no es viable un modelo de 7B.
- Evaluacion estandarizada de modelos genomicos: el scorer de eleccion forzada basada en logits (`eval.py`) permite reproducir las metricas del articulo sobre conjuntos externos y comparar variantes del adaptador.
- Formacion y apoyo docente en bioinformatica: el modelo puede explicar criterios de calidad de ensamblado y justificar recomendaciones de herramientas en un contexto conversacional.

## Benchmarks y rendimiento

Resultados publicados en el articulo asociado (porcentajes de acierto):

| Modelo | Organism-heldout | Domain-knowledge |
|---|---|---|
| BitNet-2B zero-shot | 34,2 % | 68,5 % |
| BitNet-2B v1 (este modelo) | 69,3 % | 84,0 % |
| Mistral-7B-Instruct-v0.3 | 39,5 % | 84,5 % |
| Qwen2.5-7B-Instruct | 54,4 % | 94,5 % |

Metricas desglosadas por familia en el conjunto heldout:

| Familia | Metrica |
|---|---|
| Seleccion de herramienta | 100 % |
| Diagnostico de calidad (`qc_diagnosis`) | AUC 0,959 |
| Remediacion | 39,5 % |

No se han proporcionado resultados de benchmarks generalistas (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM en inferencia: pico de aproximadamente 1,22 GB segun el articulo, incluyendo el modelo base ternario y el adaptador LoRA.
- Entrenamiento: una unica GPU A100 de 80 GB, aproximadamente 35 minutos para 3 epocas (4.143 pasos, secuencia de 1.024 tokens).
- GPU de consumo: si, el modelo cabe holgadamente en cualquier GPU de consumo con 4 GB o mas de VRAM; el limite practico lo marca el modelo base de 2B y el pico declarado de 1,22 GB.
- GPU de centro de datos: no requiere A100 ni H100 para inferencia; estas solo se justifican para reentrenar o ajustar el adaptador.
- Opciones de despliegue: el repositorio documenta la carga mediante `transformers` con `BitNetForCausalLM` mas el modulo `bitnet_lora` del codigo de reproduccion (`replace_with_lora` y `apply_adapter`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Licencia | Organism-heldout | Domain-knowledge | Notas |
|---|---|---|---|---|---|
| GAQA v1 (BitNet-2B + LoRA) | ~2.000 M (adaptador ~372 M) | MIT | 69,3 % | 84,0 % | Pico de ~1,22 GB de VRAM; requiere codigo externo de carga |
| BitNet-2B zero-shot | ~2.000 M | MIT | 34,2 % | 68,5 % | Modelo base sin ajuste especifico de dominio |
| Mistral-7B-Instruct-v0.3 | ~7.000 M | Apache 2.0 | 39,5 % | 84,5 % | Mayor huella de memoria |
| Qwen2.5-7B-Instruct | ~7.000 M | Apache 2.0 | 54,4 % | 94,5 % | Mejor rendimiento en conocimiento de dominio, peor en organism-heldout |

Las licencias de Mistral-7B-Instruct-v0.3 y Qwen2.5-7B-Instruct se indican a titulo orientativo; no se detallan en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio contiene unicamente el adaptador LoRA; no es un modelo autonomo y exige cargar el modelo base e inyectar las capas mediante el codigo de reproduccion publicado en Zenodo.
- El entrenamiento se limita a ensamblados bacterianos de lectura corta (Illumina) generados con SPAdes y MEGAHIT; el comportamiento en ensambladores de lectura larga o hibridos no esta cubierto en la informacion disponible.
- La familia de remediacion es la mas debil de las evaluadas (39,5 %), muy por debajo del 100 % en seleccion de herramienta y del AUC 0,959 en diagnostico.
- El conjunto de datos es pequeno y desequilibrado: solo 159 ejemplos de seleccion de herramienta frente a 4.740 de diagnostico y 4.740 de remediacion, lo que puede provocar sobreajuste en tareas con pocas muestras.
- Riesgo de alucinacion: al ser un modelo generativo de 2B ajustado con un dataset reducido, puede producir diagnosticos o recomendaciones plausibles pero incorrectas si se usa fuera del dominio de entrenamiento.
- El articulo no incluye un DOI publicado en el momento de redactar esta ficha (la propia model card indica "add the published DOI here"), lo que dificulta la verificacion por pares.
- Idiomas soportados no declarados; no hay garantia de comportamiento correcto en castellano o en otros idiomas distintos del ingles de entrenamiento.
- Longitud de contexto no declarada; el ajuste fino se realizo con secuencias de 1.024 tokens, por lo que entradas mas largas pueden degradar el rendimiento.
- Aunque la licencia MIT permite uso comercial, la calidad de las recomendaciones en un contexto clinico o de produccion exige validacion humana adicional.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, sin validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hmd377/genome-assembly-general-purpose-ft-bitnet-2b
- Modelo base: https://huggingface.co/microsoft/bitnet-b1.58-2B-4T
- Dataset GAQA v1: https://doi.org/10.5281/zenodo.21762025
- Codigo de reproduccion y evaluacion: https://doi.org/10.5281/zenodo.22760609
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo (unicamente enlaces a Facebook, sin relacion con el contenido).
