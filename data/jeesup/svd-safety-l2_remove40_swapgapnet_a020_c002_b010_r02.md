# Jeesup/svd-safety-l2_remove40_swapgapnet_a020_c002_b010_r02

## Resumen

`Jeesup/svd-safety-l2_remove40_swapgapnet_a020_c002_b010_r02` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`, comprimido mediante SVD-LLM hasta conservar el 60,0 % de los parámetros densos (se elimina el 40,02 %) y posteriormente editado con dos de las cinco rondas de una rutina iterativa de intercambio de parámetros neutro en parámetros ("parameter-neutral swap"), seleccionada por la regla `gap_iter`. El objetivo del artefacto no es conversar, sino cuantificar cuánto daña la compresión por SVD al comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño.

Se trata de una celda concreta dentro de una rejilla experimental que cruza reglas de selección y presupuestos de restauración. En esta celda el presupuesto de restauración es del 1,000 % de los parámetros densos, distribuido en fragmentos de 0,200 % por ronda; se han restaurado e intercambiado 781 componentes y se han insertado 8.983.040 parámetros (el 0,14 % de los parámetros de proyección densos), con escala de inserción 0,2 y semilla 42.

El checkpoint se publica como artefacto de estudio, con métricas de seguridad medidas (AdvBench ASR 0,3000; StrongREJECT ASR 0,1821; macro over-refusal 0,0868 según el juez de HarmBench y WildGuard). La propia model card advierte que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat y que ninguna debe tratarse como un asistente desplegable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama, heredada del modelo base `meta-llama/Llama-2-7b-chat-hf`; la model card no declara modificaciones estructurales (la compresión SVD-LLM actúa sobre los pesos, no sobre el grafo) |
| Parametros totales | 6.738.415.616 según los pesos en safetensors; la model card declara una fracción de parámetros resultante de 0,5998 (véase la nota de la sección de arquitectura) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no declarada en la model card; el modelo base Llama-2-7b-chat admite 4.096 tokens |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors, sin variantes GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | no disponible (el modelo base Llama-2-7b-chat está entrenado principalmente en inglés) |
| Licencia | Llama 2 Community License; el repositorio incluye `LICENSE.txt` y `USE_POLICY.md`, y el uso de esta obra derivada queda sujeto a ambos |
| Formato de pesos | safetensors (tamaño del repositorio: 13,5 GB) |

## Arquitectura y entrenamiento

El checkpoint parte de Llama-2-7b-chat, un transformer decoder-only con normalización RMSNorm previa, activación SwiGLU y embeddings rotatorios posicionales, alineado por Meta mediante ajuste supervisado seguido de RLHF (PPO con rejection sampling) y con la técnica Ghost Attention para sostener instrucciones a lo largo de turnos múltiples. Sobre esa base, este artefacto no aplica entrenamiento adicional: la modificación es una edición post-hoc de pesos en dos fases.

La primera fase es la compresión con SVD-LLM, que aproxima las matrices de proyección por descomposición en valores singulares con truncamiento, eliminando el 40,02 % de los parámetros densos. La segunda es un procedimiento iterativo de intercambio ("swap") de componentes que preserva el recuento de parámetros: en cada ronda se restauran 781 componentes desde el modelo sin comprimir y se expulsan 781 componentes, seleccionados por la regla `gap_iter`, con valor de intercambio `net` (valor de inserción más valor de eliminación del descarte ordenado por sigma) y una escala de inserción de 0,2 sobre la fuerza del componente. De las cinco rondas del experimento completo, este checkpoint corresponde a la ronda intermedia 2.

Nota de verificación: el recuento de parámetros que reportan los safetensors del repositorio (6.738.415.616) coincide con el del Llama-2-7b denso, mientras que la model card declara una fracción resultante de 0,5998. Es plausible que las matrices comprimidas se materialicen a tamaño completo o que convivan tensores comprimidos y sin comprimir, pero la información disponible no lo aclara; conviene inspeccionar las formas y rangos de los tensores antes de asumir una reducción efectiva de cómputo o memoria.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Llama-2-7b-chat (el pipeline declarado es `text-generation`).
- Razonamiento y respuesta a instrucciones de propósito general, con la degradación esperable tras eliminar el 40 % de los parámetros.
- Comportamiento conversacional multi-turno, limitado por la degradación inducida por la compresión y por el contexto del modelo base.
- Capacidad de rechazo de peticiones dañinas, pero medida y documentada como degradada: el estudio existe precisamente para cuantificar esa pérdida.
- No se documenta soporte de tool calling, function calling, uso de agentes, visión, audio ni modo de razonamiento explícito ("thinking mode").
- Capacidades multilingües: no disponibles como dato declarado; la cobertura real fuera del inglés no está evaluada en la información proporcionada.

## Casos de uso

- Investigación sobre compresión de modelos: sirve como punto de medida del coste en seguridad de aplicar SVD-LLM al 60 % de parámetros, comparando contra la celda sin editar y contra el modelo denso original.
- Evaluación de seguridad y red-teaming: el checkpoint se puede pasar por suites como AdvBench, StrongREJECT o HarmBench para reproducir las tasas de éxito de ataque declaradas (0,3000 y 0,1821) y estudiar cómo varían con el presupuesto de restauración.
- Estudio de mecánica interpretativa: al conocerse exactamente qué 781 componentes se restauraron y con qué valor de intercambio, permite analizar la relación entre componentes de proyección concretos y comportamientos de rechazo.
- Ablación de reglas de selección: la etiqueta `gap_iter` identifica una celda de una rejilla mayor, de modo que el checkpoint es una pieza de un análisis comparativo entre criterios de selección de componentes y presupuestos (0,2 % por ronda frente al 1,0 % total).
- Reproducción de experimentos: con semilla 42 y presupuesto declarado, permite replicar el procedimiento de compresión y edición y verificar si se recuperan las métricas publicadas.
- Calibración de umbrales de sobre-rechazo: la métrica de macro over-refusal (0,0868 con WildGuard) permite estudiar el equilibrio entre utilidad y seguridad en modelos comprimidos, un eje relevante para decidir si un modelo pequeño es desplegable.
- Construcción de conjuntos de datos de modelos degradados: útil para generar pares (modelo denso, modelo comprimido) con los que entrenar o evaluar correctores de seguridad.
- Docencia y formación: como ejemplo didáctico de artefacto de investigación que no debe desplegarse, ilustra la diferencia entre publicar un checkpoint y publicar un producto.

En ningún caso se recomienda su uso en atención al cliente, generación de código en producción ni ninguna aplicación orientada a usuarios finales.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor de este checkpoint | Referencia (Llama-2-7b-chat denso) |
|---|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,3000 | no disponible en esta ficha |
| StrongREJECT | ASR (juez HarmBench) | 0,1821 | no disponible en esta ficha |
| WildGuard | Macro over-refusal | 0,0868 | no disponible en esta ficha |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otras tareas de capacidad general para este checkpoint, ni cifras del modelo base medido con el mismo protocolo. Sin esa referencia, los valores de ASR no permiten aislar cuánto del daño proviene de la compresión y cuánto de la edición.

## Requisitos de hardware

- VRAM estimada para inferencia con pesos de 6,74 B parámetros: aproximadamente 13,5 GB en fp16/bf16, unos 7 GB en cuantización de 8 bits y unos 4 GB en 4 bits.
- Caché KV: el modelo base emplea atención multi-cabeza (sin GQA), lo que supone del orden de 0,5 MiB por token y capa completa a fp16; para 4.096 tokens de contexto son aproximadamente 2 GiB adicionales. Es una estimación derivada de la arquitectura del modelo base, no un dato declarado por el autor.
- GPU recomendadas: A100 (40 o 80 GB), H100 y L40S para fp16 con lotes moderados; RTX 4090 y RTX 3090 (24 GB) caben en fp16 con lotes pequeños y sin contexto completo; RTX 4080 (16 GB) requiere cuantización de 8 o 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 a fp16 y en tarjetas de 8-16 GB si se cuantiza.
- Opciones de despliegue: `transformers` (librería declarada) y text-generation-inference (etiqueta `text-generation-inference` presente). vLLM es compatible con el formato, aunque no está verificado por el autor. No hay pesos GGUF publicados, por lo que Ollama y llama.cpp exigirían una conversión previa.
- Latencia y throughput: no disponibles; no se declaran mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Seguridad (ASR) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`...remove40_swapgapnet_a020_c002_b010_r02`) | 6.738.415.616 según safetensors; fracción declarada 0,5998 | no declarado (base: 4.096) | AdvBench 0,3000; StrongREJECT 0,1821 | Llama 2 Community License | HuggingFace, safetensors, 0 descargas |
| `meta-llama/Llama-2-7b-chat-hf` (modelo base) | 6.738.415.616 | 4.096 | no disponible en esta ficha con el mismo protocolo | Llama 2 Community License | HuggingFace, ampliamente desplegado |
| Otras celdas de la rejilla `svd-safety-*` del mismo autor | variable según presupuesto de restauración | no declarado | no disponible en esta ficha | Llama 2 Community License | HuggingFace, artefactos de investigación |

No se dispone de datos que permitan una comparación cuantitativa homogénea con alternativas de la misma categoría (por ejemplo, otros métodos de compresión de Llama-2-7b-chat o modelos de 7 B comprimidos), ya que no se han publicado resultados de benchmarks de capacidad general ni se conocen los valores del modelo base bajo el mismo juez.

## Limitaciones y advertencias

- No es un modelo de propósito general: la model card lo describe explícitamente como artefacto de investigación y advierte de que no debe desplegarse como asistente.
- Parte de la rejilla experimental está deliberadamente degradada en seguridad; la compresión por sí sola eleva la tasa de éxito de ataque, y este checkpoint es una ronda intermedia de ese proceso.
- Riesgo elevado de alucinación y de degradación de coherencia por la eliminación del 40 % de los parámetros densos y por la posterior edición de pesos.
- Discrepancia no resuelta entre el recuento de parámetros de los safetensors (6.738.415.616) y la fracción declarada en la model card (0,5998): conviene verificar el checkpoint antes de dimensionar infraestructura.
- Idiomas soportados y longitud de contexto no declarados; no hay garantía de comportamiento multilingüe ni de estabilidad más allá del contexto del modelo base.
- Sesgos heredados de Llama-2-7b-chat y de sus datos de entrenamiento, sin evaluación de sesgos en esta información.
- Licencia Llama 2 Community License: el uso comercial está sujeto a `LICENSE.txt` y `USE_POLICY.md`, con las restricciones habituales de la licencia (incluido el umbral de usuarios activos mensuales y las prohibiciones de uso de la política aceptable).
- Repositorio sin descargas ni likes y sin documentación de mantenimiento; no hay garantía de soporte ni de actualizaciones.
- Ausencia de pesos cuantizados publicados obliga a cuantizar por cuenta propia si se necesita reducir VRAM.
- La búsqueda web realizada no aportó información adicional sobre este modelo; las métricas y características proceden únicamente de la model card y de los metadatos del repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove40_swapgapnet_a020_c002_b010_r02
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia y política de uso incluidas en el repositorio: `LICENSE.txt` y `USE_POLICY.md` (véase la pestaña de archivos del repositorio enlazado arriba)
- Artículo de Llama 2 (base arquitectónica y de alineamiento): https://arxiv.org/abs/2307.09288
- Repositorio de Llama 2 de Meta: https://github.com/facebookresearch/llama
- Métodos de evaluación citados en la model card (AdvBench, HarmBench, StrongREJECT, WildGuard): referencias no localizadas en la búsqueda web realizada
- Método de compresión SVD-LLM: referencia no localizada en la búsqueda web realizada

La búsqueda web efectuada no devolvió ningún enlace relevante sobre este modelo ni sobre su familia experimental; los resultados obtenidos correspondían a foros sin relación con el tema.
