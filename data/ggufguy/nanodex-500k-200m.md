# GGUFGuy/nanodex-500k-200m

## Resumen

nanodex-500k-200m es un modelo de lenguaje decoder-only de escala nano, con 492.192 parámetros, entrenado desde cero por el usuario @GGUFGuy sobre el dataset fineweb-edu. No es un modelo de propósito general ni un asistente: se trata de un artefacto de investigación cuyo objetivo es hacer observable y reproducible el proceso completo de preentrenamiento de un transformer. El entrenamiento completo, según la model card, requirió 1.525 pasos y 4,5 minutos de tiempo de pared, lo que lo convierte en una herramienta viable para ciclos de iteración muy rápidos.

La arquitectura sigue el patrón `LlamaForCausalLM` (transformer decoder-only) reducido en anchura y profundidad: 3 capas, tamaño oculto 96, FFN de 256, 6 cabezas de atención con 2 cabezas KV (grouped-query attention), RMSNorm, embeddings posicionales rotatorios, embeddings atados y ausencia de sesgos. La longitud de contexto es de 512 tokens y el vocabulario es un BPE propio de 2.048 entradas entrenado sobre fineweb-edu.

Su relevancia es exclusivamente metodológica y educativa. Con 199.884.800 tokens vistos (aproximadamente 0,2 B) y una pérdida final de 3,8150 (perplejidad 45,4), el modelo aprende formas de palabras, colocaciones frecuentes y algo de sintaxis, pero el propio autor advierte que su salida no es factual. Encaja en el ecosistema de entrenamiento NanoDex Trainer, pensado para ejecutar preentrenamientos completos en minutos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`LlamaForCausalLM`): SiLU MLP, RMSNorm, RoPE, grouped-query attention, embeddings atados, sin sesgos |
| Parametros totales | 492.192 (dato real de safetensors) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (no se documentan versiones cuantizadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | ODC-BY |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano oculto | 96 |
| Capas | 3 |
| Cabezas de atencion | 6 (KV: 2) |
| Tamano de FFN | 256 |
| Vocabulario | 2.048 (BPE propio entrenado sobre fineweb-edu) |
| Tamano del repositorio | 0,0 GB (segun HuggingFace) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-12 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estandar con las modificaciones propias de la familia Llama, escalado a la baja para ajustarse al presupuesto de parametros. Usa activacion SiLU en el MLP, RMSNorm en lugar de LayerNorm, embeddings posicionales rotatorios (RoPE), grouped-query attention con 6 cabezas de consulta y 2 de clave/valor, embeddings de entrada y salida atados y ninguna capa de sesgo. Con 3 capas y un tamano oculto de 96, la capacidad efectiva es muy limitada: el vocabulario de 2.048 tokens es tambien muy inferior al de los tokenizadores habituales (32k-128k entradas), lo que penaliza la eficiencia de la tokenizacion en ingles.

El entrenamiento se realizo desde cero sobre HuggingFaceFW/fineweb-edu con el NanoDex Trainer. Se procesaron 199.884.800 tokens en 1.525 pasos, con un tamano de lote de 131.072 tokens por paso. El optimizador fue AdamW con betas (0,9, 0,95), weight decay 0,1 y gradient clipping 1,0; el schedule de learning rate combina un warmup del 2 % con decaimiento coseno hasta el 10 % del pico, fijado en 4e-03. La perdida final reportada es 3,8150, correspondiente a una perplejidad de 45,4. El tiempo total de pared fue de 4,5 minutos. No se documenta ninguna fase de RLHF, DPO, SFT ni alineacion posterior al preentrenamiento, ni innovaciones tecnicas adicionales mas alla del escalado a la baja de la arquitectura.

## Capacidades

- Generacion de texto autoregresiva en ingles, con `do_sample`, `temperature` y `top_k` configurables.
- Modelado de colocaciones frecuentes, formas de palabras y sintaxis basica, segun lo descrito por el propio autor.
- Complecion de textos cortos dentro de la ventana de 512 tokens.
- Entrenamiento e inferencia completos en CPU, sin requisitos de acelerador.
- No soporta tool calling ni function calling.
- No soporta uso como agente ni razonamiento multi-paso.
- No dispone de modo de razonamiento explicito (thinking mode).
- No dispone de capacidades de vision ni de audio.
- Capacidad multilingue practicamente nula: el modelo esta entrenado exclusivamente en ingles y su vocabulario es muy reducido.
- No esta ajustado por instrucciones: no sigue ordenes ni mantiene conversaciones coherentes.

## Casos de uso

- Docencia de preentrenamiento desde cero: el modelo permite mostrar en clase o en un taller todas las fases del entrenamiento de un transformer (tokenizacion BPE, schedule de learning rate, calculo de perdida y perplejidad) con un ciclo de 4,5 minutos por experimento.
- Pruebas de humo (smoke tests) de infraestructura: al ser tan pequeno, sirve para validar que un pipeline de entrenamiento distribuido, un sistema de checkpoints o un cargador de datasets funciona antes de lanzar un run real, sin consumir GPU.
- Validacion de herramientas de cuantizacion y serializacion: su tamano minimo permite comprobar rapidamente que un conversor a GGUF, int8 o fp16 produce artefactos cargables y con perdida controlada, sin esperar horas por un modelo grande.
- Verificacion de plataformas de despliegue: es util para comprobar que un endpoint de text-generation-inference, un servidor compatible con la API de OpenAI o un pipeline de `transformers` arrancan correctamente, ya que las etiquetas del repositorio indican compatibilidad con text-generation-inference y endpoints.
- Investigacion sobre scaling laws en regimen nano: con 492.192 parametros y un presupuesto de datos controlado, sirve para estudiar empiricamente la relacion entre tokens, parametros y perdida en la zona extrema de la curva.
- Estudio de tokenizadores de vocabulario reducido: el BPE de 2.048 entradas entrenado sobre fineweb-edu permite comparar el impacto del tamano de vocabulario en la perplejidad final frente a tokenizadores mayores.
- Experimentacion con hiperparametros a bajo coste: el schedule (warmup 2 % + coseno al 10 %, pico 4e-03, AdamW con betas 0,9/0,95) puede replicarse y modificarse para observar efectos con un coste computacional casi nulo.
- Reproducibilidad y auditoria: disponer de un run completo, con numero de pasos, tokens por paso y perdida final documentados, facilita reproducir exactamente el mismo resultado y verificar la estabilidad del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de entrenamiento, no evaluaciones sobre conjuntos estandar como MMLU, HumanEval o GSM8K.

| Metrica | Valor | Naturaleza |
|---|---|---|
| Perdida final | 3,8150 | Entrenamiento (no evaluacion independiente) |
| Perplejidad final | 45,4 | Entrenamiento (no evaluacion independiente) |
| Tokens vistos | 199.884.800 | Entrenamiento |
| Pasos | 1.525 | Entrenamiento |
| Tokens por paso | 131.072 | Entrenamiento |
| Tiempo de pared | 4,5 min | Entrenamiento |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,97 MB en fp32, 0,98 MB en fp16 y 0,49 MB en int8 para los pesos. El consumo real esta dominado por el runtime y las activaciones, no por el modelo.
- GPU recomendadas: ninguna en concreto. Cualquier GPU con soporte CUDA, incluso integradas o de gama muy baja, es sobradamente suficiente. Tarjetas como RTX 4090, A100 o H100 resultan completamente desproporcionadas.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo e incluso en CPU. No requiere acelerador.
- Opciones de despliegue: `transformers` (libreria declarada), text-generation-inference (etiqueta del repositorio) y endpoints compatibles. La compatibilidad con llama.cpp, Ollama o vLLM no esta documentada y no se puede confirmar sin una conversion previa a GGUF.
- Latencia y throughput estimados: no disponibles. Dado el tamano, la latencia por token estara dominada por la sobrecarga del framework mas que por el computo.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados de benchmarks ni modelos comparables de la misma categoria con datos verificables, por lo que no es posible establecer una comparacion cuantitativa con alternativas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nanodex-500k-200m | 492.192 | 512 | ODC-BY | HuggingFace (0 descargas, 0 likes) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El propio autor califica el modelo como un artefacto de investigacion a escala nano: no es un asistente util y su salida no es factual.
- Riesgo de alucinacion muy alto: el modelo genera texto plausible por forma, sin ningun anclaje a hechos, y no dispone de ninguna fase de alineacion, RLHF o DPO.
- La longitud de contexto maxima es de 512 tokens, insuficiente para tareas de documento largo o conversaciones multi-turno extensas.
- Solo soporta ingles. El vocabulario de 2.048 entradas hace que cualquier otro idioma, incluido el castellano, se fragmente de forma muy ineficiente.
- No esta ajustado por instrucciones: no sigue ordenes, no responde a prompts con formato de tarea y no es apto para uso conversacional.
- El nombre del modelo (500k-200m) no se corresponde con el recuento real de parametros documentado (492.192, aproximadamente 0,49 M), lo que puede inducir a confusion al seleccionarlo.
- El repositorio tiene 0 descargas y 0 likes, y no hay evaluaciones independientes que validen su comportamiento. Se debe tratar como material sin verificar.
- Licencia ODC-BY: permite uso comercial, pero exige atribucion. Es una licencia pensada originalmente para bases de datos, por lo que su aplicacion a pesos de un modelo puede generar ambiguedad juridica en produccion.
- No se documentan versiones cuantizadas ni artefactos GGUF, por lo que cualquier despliegue fuera de `transformers` requiere trabajo adicional de conversion.
- El tamano del repositorio figura como 0,0 GB, lo que puede indicar un redondeo de HuggingFace o una subida incompleta; conviene verificar los archivos antes de usarlo.
- No debe emplearse en produccion, atencion al cliente, generacion de codigo ni ninguna tarea que requiera exactitud.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GGUFGuy/nanodex-500k-200m
- Autor: https://huggingface.co/GGUFGuy
- NanoDex Trainer (Space de entrenamiento): https://huggingface.co/spaces/hugging-science/nanodex-trainer
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Licencia ODC-BY: https://opendatacommons.org/licenses/by/1-0/
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante al modelo en la busqueda realizada; los resultados devueltos no guardan relacion con el modelo.
