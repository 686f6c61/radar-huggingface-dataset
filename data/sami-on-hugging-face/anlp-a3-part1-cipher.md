# Sami-on-hugging-face/anlp-a3-part1-cipher

## Resumen

`anlp-a3-part1-cipher` es un checkpoint academico publicado por el usuario Sami-on-hugging-face como parte de la asignacion 3 de un curso de NLP avanzado (ANLP). Se trata de un modelo decoder-only de tipo prefix-LM disenado para una tarea muy concreta: el descifrado de texto cifrado caracter a caracter. El repositorio incluye unicamente los pesos del checkpoint de validacion, no una libreria empaquetada ni un pipeline listo para produccion.

El modelo es extremadamente pequeno: 2.916.096 parametros (aproximadamente 2,9 millones), lo que lo situa tres ordenes de magnitud por debajo de los modelos de lenguaje convencionales. La arquitectura declarada combina un transformer decoder-only con RMSNorm, RoPE y GQA, y el autor menciona tambien una variante Mamba SSM, aunque la tabla de benchmarks solo reporta resultados para la variante transformer. La tokenizacion es a nivel de caracter con un alfabeto fijo de 86 tokens.

Su relevancia es exclusivamente didactica y de investigacion: sirve como referencia para estudiar formulaciones prefix-LM aplicadas a tareas de transformacion secuencia a secuencia con alfabetos cerrados, y como ejemplo de comparacion entre arquitecturas transformer y SSM en un regimen de parametros muy reducido. No es un modelo de proposito general ni esta pensado para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer con formulacion prefix-LM (RMSNorm, RoPE, GQA); el autor menciona tambien una variante Mamba SSM |
| Parametros totales | 2.916.096 (variante transformer reportada) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (tokenizacion a nivel de caracter con alfabeto fijo de 86 tokens) |
| Licencia | MIT |
| Formato de pesos | checkpoint PyTorch (`.pt`) cargado con `torch.load`; no se distribuye en safetensors ni GGUF |

## Arquitectura y entrenamiento

El checkpoint sigue una formulacion decoder-only prefix-LM: el modelo recibe la secuencia cifrada como prefijo y genera la salida en claro caracter a caracter. Internamente emplea un transformer decoder-only con normalizacion RMSNorm, embeddings posicionales rotatorios (RoPE) y atencion con query grouping (GQA). El autor indica que el repositorio contempla ademas una implementacion basada en Mamba SSM, presumiblemente para comparar ambos enfoques en la misma tarea, aunque los resultados publicados en la model card corresponden solo a la variante transformer.

La tokenizacion es a nivel de caracter sobre un alfabeto fijo de 86 simbolos, lo que elimina la necesidad de un vocabulario BPE y encaja con la naturaleza del problema (mapeo determinista de simbolos cifrados a caracteres en claro). No se especifica en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado adicional. El checkpoint reportado corresponde a la epoca 3.

## Capacidades

- Descifrado caracter a caracter de texto cifrado con alfabeto cerrado de 86 simbolos.
- Generacion autoregresiva condicionada por prefijo (formulacion prefix-LM).
- Modelado a nivel de caracter, sin dependencia de tokenizadores subword.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue; el alcance linguistico depende del corpus de entrenamiento, no especificado.
- No se documenta modo thinking, vision ni audio.

## Casos de uso

- Docencia y practicas de NLP: reproduccion del experimento de la asignacion ANLP 3, cargando el checkpoint con el snippet incluido en la model card para inspeccionar la formulacion prefix-LM.
- Estudio comparativo transformer vs. SSM: el repositorio permite contrastar la variante transformer con la variante Mamba SSM sobre la misma tarea de descifrado y el mismo alfabeto.
- Benchmark de referencia para tareas de sustitucion de simbolos: util como linea base minima (2,9 M de parametros) frente a modelos mayores en tareas de transformacion caracter a caracter.
- Analisis de curvas de aprendizaje en regimen de bajo parametro: el checkpoint de la epoca 3 con val loss 1,1532 permite estudiar el comportamiento de la perdida en modelos muy pequenos.
- Prototipado de pipelines de descifrado con alfabetos cerrados: sirve para validar infraestructura de carga, inferencia y evaluacion (F1, Levenshtein, exactitud por caracter y por palabra) antes de escalar a modelos mayores.
- Reproducibilidad de resultados academicos: permite verificar las metricas reportadas (Char Acc 0,0690, Word Acc 0,0479, F1 0,4203, Levenshtein 780,01) sobre el conjunto de validacion del autor.

## Benchmarks y rendimiento

Resultados publicados en la model card para la variante transformer en la epoca 3:

| Modelo | Epoca | Val loss | Char Acc | Word Acc | F1 | Levenshtein | Parametros |
|---|---|---|---|---|---|---|---|
| transformer | 3 | 1,1532 | 0,0690 | 0,0479 | 0,4203 | 780,01 | 2.916.096 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las metricas anteriores son especificas de la tarea de descifrado del autor y no son comparables con benchmarks generales.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para 2,9 M de parametros (los pesos ocupan aproximadamente 12 MB); el repositorio completo pesa 0,1 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe tambien en CPU sin problemas.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: carga directa con PyTorch mediante `torch.load` y la clase `DecoderOnlyTransformer` del repositorio; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (descifrado caracter a caracter con alfabeto cerrado y ~3 M de parametros). La comparacion natural seria la variante Mamba SSM mencionada por el autor, pero no se publican sus metricas en la model card.

## Limitaciones y advertencias

- Modelo academico: disenado para una asignacion de curso, no para uso en produccion.
- Rendimiento muy bajo en la tarea objetivo: exactitud por caracter del 6,90 % y por palabra del 4,79 % en la epoca 3, lo que indica que el entrenamiento esta lejos de la convergencia.
- Contexto maximo no documentado; puede degradarse con secuencias largas.
- Alfabeto fijo de 86 tokens: no generaliza a caracteres fuera de ese conjunto.
- No se documenta el corpus de entrenamiento ni la procedencia de los datos, por lo que no es posible evaluar sesgos.
- Riesgo de alucinacion inherente a cualquier modelo generativo, agravado por el bajo rendimiento reportado.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte.
- El formato de pesos es un pickle de PyTorch (`.pt`); cargarlo con `torch.load` implica riesgos de seguridad si la procedencia no es confiable.
- No se distribuyen pesos en safetensors ni GGUF, lo que limita su integracion con herramientas estandar de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sami-on-hugging-face/anlp-a3-part1-cipher
