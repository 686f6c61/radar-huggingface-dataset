# Jeesup/svd-safety-l2_remove50_swapgapnet_b010_r07

## Resumen

`Jeesup/svd-safety-l2_remove50_swapgapnet_b010_r07` es un checkpoint de investigación construido sobre `meta-llama/Llama-2-7b-chat-hf` al que se le ha aplicado una compresión SVD-LLM equivalente al 50,0 % de los parámetros densos (fracción resultante declarada: 0,4999), seguida de una reparación parcial mediante 7 de 10 rondas iterativas de intercambio de parámetros neutro en valor, seleccionadas con la regla `gap_iter`. Cada ronda intercambia hasta un 0,1 % de los parámetros densos, con un presupuesto total de la ejecución completa del 1,0 %. En total se han restaurado y sustituido 4.109 componentes, con 45.300.736 parámetros intercambiados (0,70 % de los parámetros de las proyecciones densas), semilla 42.

El modelo no es un asistente conversacional de propósito general, sino una celda concreta de una rejilla experimental que estudia cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes lo repara mejor. El nombre del repositorio codifica la configuración: `l2` (Llama 2), `remove50` (50 % de parámetros eliminados), `swapgapnet` (regla `gap_iter` con valor de intercambio `net`), `b010` (presupuesto de 0,1 % por ronda) y `r07` (7 rondas aplicadas).

Su relevancia es metodológica: proporciona un punto de medida reproducible (semilla fija, presupuesto y regla documentados) para cuantificar el compromiso entre seguridad y utilidad bajo compresión, con métricas publicadas de tasa de éxito de ataque (ASR) y de sobrerrechazo. El repositorio, creado y actualizado el 14 de septiembre de 2026, acumula 0 descargas y 0 «likes», y su licencia es la Llama 2 Community License.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2), densa; sin MoE ni capas SSM |
| Parametros totales | 6.738.415.616 (recuento real en safetensors) |
| Parametros activos | No aplica: el modelo es denso, no Mixture of Experts |
| Longitud de contexto | No disponible en la información proporcionada; el modelo base Llama-2-7b-chat trabaja con 4.096 tokens |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos safetensors (13,5 GB, coherente con fp16), sin variantes GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | No disponible; la model card no declara idiomas y el modelo base está optimizado principalmente para inglés |
| Licencia | Llama 2 Community License (incluye `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (librería `transformers`) |
| Fraccion de parametros densos tras compresion | 0,4999 (50,01 % de parametros eliminados) |
| Regla de seleccion de componentes | `gap_iter` |
| Presupuesto de restauracion | 1,000 % de los parametros densos (0,100 % por ronda) |
| Componentes restaurados / sustituidos | 4.109 / 4.109 |
| Parametros intercambiados | 45.300.736 (0,70 % de los parametros de proyeccion densos) |
| Valor de intercambio | `net` (valor de insercion mas valor de eliminacion del descarte ordenado por sigma) |
| Semilla | 42 |
| Rondas aplicadas | 7 de 10 (checkpoint intermedio) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 chat de 7.000 millones de parámetros: un transformer decoder-only con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención causal. No hay cambios de arquitectura por parte del autor: la intervención es de compresión y edición de pesos. Sobre el checkpoint original se aplica SVD-LLM, un método de compresión por descomposición en valores singulares que elimina componentes de las matrices de proyección hasta dejar el 49,99 % de los parámetros densos originales. Después, la reparación sustituye componentes concretos por otros seleccionados con la regla `gap_iter`, en rondas iterativas de presupuesto fijo y valor de intercambio `net`, sin reentrenamiento global declarado.

No se documenta en la información disponible ningún proceso de preentrenamiento, ajuste supervisado, RLHF o DPO adicional por parte del autor: el alineamiento procede íntegramente de Llama-2-7b-chat. Tampoco se especifican los tokens de entrenamiento, la composición del dataset ni detalles del cómputo empleado, porque el artefacto es un ejercicio de edición de pesos sobre un modelo ya entrenado y no un modelo nuevo.

Un detalle técnico relevante para quien vaya a cargarlo: el recuento real de parámetros en safetensors (6.738.415.616) coincide con el del Llama-2-7B sin comprimir, y el tamaño del repositorio (13,5 GB) es coherente con fp16 a ese recuento. Por tanto, la reducción del 50 % declarada se refiere a la fracción de parámetros densos efectivos tras el descarte de componentes SVD, no a un menor número de tensores almacenados ni a un checkpoint de menor huella en disco.

## Capacidades

- Generación de texto conversacional en la estela de Llama-2-7b-chat, con la calidad degradada que impone la compresión al 50 % de los parámetros densos.
- Razonamiento básico y respuesta a instrucciones heredados del modelo base, sin garantías cuantificadas en esta ficha.
- Capacidad multilingüe no declarada por el autor; el modelo base está orientado principalmente al inglés.
- No se documenta soporte de *tool calling*, *function calling* ni uso agéntico multi-paso.
- No se documenta modo de razonamiento explícito (*thinking*), visión, audio ni otras modalidades.
- Su función real es servir como sujeto experimental: permite medir ASR frente a ataques de jailbreak (AdvBench, StrongREJECT) y sobrerrechazo con WildGuard en una configuración de compresión concreta.
- Interoperabilidad con el ecosistema `transformers` y con Text Generation Inference, según los tags del repositorio (`text-generation-inference`, `endpoints_compatible`).

## Casos de uso

- Investigación sobre compresión y seguridad: usar este checkpoint como una celda más de la rejilla para cuantificar cuánto sube la tasa de éxito de ataque al eliminar el 50 % de los parámetros densos y cuánto la recupera la regla `gap_iter` con 7 rondas.
- Evaluación de reglas de selección de componentes: comparar `gap_iter` frente a otras reglas del estudio manteniendo constantes semilla, presupuesto por ronda y fracción de parámetros eliminados.
- *Red teaming* académico: emplear el modelo como objetivo de ataques controlados y medir ASR con jueces tipo HarmBench, aprovechando que las métricas de referencia ya están publicadas (0,2538 en AdvBench, 0,3131 en StrongREJECT).
- Estudio del sobrerrechazo: analizar el 0,0781 de sobrerrechazo macro con WildGuard para verificar si la reparación de seguridad encarece la utilidad conversacional.
- Análisis de interpretabilidad: inspeccionar los 4.109 componentes restaurados y los 45.300.736 parámetros intercambiados para localizar qué proyecciones concentran el comportamiento de rechazo.
- Reproducibilidad y auditoría: la semilla 42, el presupuesto explícito y el número de ronda permiten reconstruir la configuración exacta y verificar resultados de terceros.
- Docencia en cursos de alineamiento y compresión: ilustrar con un artefacto real el compromiso entre seguridad y eficiencia, siempre con la advertencia de que no es un asistente desplegable.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,2538 |
| StrongREJECT ASR (juez HarmBench) | 0,3131 |
| Sobrerrechazo macro (WildGuard) | 0,0781 |

No se han publicado en la información disponible resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K, MT-Bench u otros), ni valores comparativos del modelo base sin comprimir con los que situar estas cifras. La model card advierte explícitamente de que la compresión por sí sola eleva la tasa de éxito de ataque y de que varias ramas de la rejilla están deliberadamente degradadas en seguridad, por lo que estas métricas deben leerse como medidas de un experimento y no como rendimiento de producto.

## Requisitos de hardware

- VRAM para pesos en fp16: aproximadamente 13,5 GB, coherente con el tamaño del repositorio. En cuantización de 8 bits bajaría a unos 6,7 GB y en 4 bits a unos 3,4 GB (estimación aritmética; no hay variantes cuantizadas publicadas en el repositorio).
- Memoria de caché KV: Llama-2-7B no usa GQA, de modo que la caché consume en torno a 0,5 MB por token en fp16; a 4.096 tokens de contexto serían unos 2 GB adicionales (estimación basada en la arquitectura del modelo base).
- GPU profesionales: A100 (40 o 80 GB), H100, L40S o A6000 admiten fp16 con margen amplio para lotes y contextos largos.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB es suficiente en fp16 para una sola secuencia con contexto moderado; tarjetas de 16 GB (RTX 4080, RTX 4070 Ti SUPER) requieren cuantización de 8 o 4 bits.
- Despliegue: `transformers` de forma directa; Text Generation Inference aparece en los tags del repositorio; vLLM es viable cargando el checkpoint en fp16 o cuantizado. Para llama.cpp u Ollama sería necesaria una conversión previa a GGUF, no incluida en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-l2_remove50_swapgapnet_b010_r07` | 6.738.415.616 almacenados; 49,99 % de parametros densos efectivos | No disponible (base: 4.096 tokens) | Llama 2 Community License | Publico en HuggingFace, 0 descargas, 0 likes | AdvBench ASR 0,2538; StrongREJECT ASR 0,3131; sobrerrechazo 0,0781 |
| `meta-llama/Llama-2-7b-chat-hf` (modelo base) | 6.738.415.616 | 4.096 tokens | Llama 2 Community License | Publico, ampliamente distribuido | No disponible en la informacion proporcionada; la model card del checkpoint comprimido afirma que la compresion por si sola eleva el ASR |
| Otras celdas de la rejilla del mismo autor (otras reglas y presupuestos) | No disponible | No disponible | Llama 2 Community License | Publicas o no segun el autor; este repositorio es una de ellas | No disponible |

No se han encontrado en la búsqueda web modelos comparables con datos verificables: los resultados devueltos corresponden a páginas de inicio de sesión y de redirección de Outlook, sin relación con el modelo. La comparación cuantitativa con alternativas de 7B comprimidas de otras familias no puede realizarse con la información disponible.

## Limitaciones y advertencias

- Artefacto de investigación, no asistente desplegable: la model card indica explícitamente que cada celda debe tratarse como sujeto experimental y no como un asistente listo para producción.
- Degradación de seguridad inducida: la compresión al 50 % eleva la tasa de éxito de ataque respecto a Llama-2-7b-chat, y varias ramas del estudio están deliberadamente degradadas. El ASR medido es de 0,2538 en AdvBench y 0,3131 en StrongREJECT.
- Este checkpoint concreto es un estado intermedio (ronda 7 de 10), no la configuración final de la ejecución completa; los resultados no son extrapolables a las 10 rondas.
- Riesgo de alucinación: no cuantificado en la información disponible y previsiblemente superior al del modelo base por la pérdida de componentes tras la compresión SVD.
- Idiomas: no declarados; el comportamiento fuera del inglés no está evaluado.
- Contexto: no se especifica en la ficha del autor; cualquier uso con ventanas largas debe verificarse contra el límite real del modelo base.
- Repositorio sin adopción: 0 descargas y 0 «likes» en el momento de la consulta, sin garantía de mantenimiento ni de soporte.
- Licencia: Llama 2 Community License, con `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio. El uso comercial está sujeto a esa licencia y a su política de uso aceptable; se deben mantener los avisos de atribución («Built with Llama 2») y cumplir las cláusulas de redistribución de derivados.
- Antes de cualquier uso, el propio autor recomienda evaluar el checkpoint de forma independiente.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove50_swapgapnet_b010_r07
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia y política de uso: `LICENSE.txt` y `USE_POLICY.md` dentro del repositorio del modelo
- Búsqueda web: no se han encontrado enlaces relevantes (papers, blogs, repos o demos) sobre este modelo; los resultados devueltos apuntan a páginas de inicio de sesión de Outlook y a ficheros de asociación de aplicaciones ajenos al modelo.
