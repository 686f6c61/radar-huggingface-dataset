# Jeesup/svd-safety-l2_remove40_swapgapnet_a020_c002_b010_r01

## Resumen

Este checkpoint es un artefacto de investigacion, no un modelo de chat de proposito general. Se trata de `meta-llama/Llama-2-7b-chat-hf` comprimido mediante SVD-LLM hasta conservar el 59,98% de los parametros densos (se elimino el 40,02%), y despues editado con una de las cinco rondas de un procedimiento iterativo de sustitucion de componentes denominado "swap" con presupuesto neutro en parametros. El autor es el usuario de HuggingFace Jeesup y el objetivo declarado es medir como la compresion por SVD degrada el comportamiento de seguridad de un modelo alineado y que regla de seleccion de componentes repara mejor ese dano.

El modelo tiene 6.738.415.616 parametros reales segun los pesos en safetensors, frente a los aproximadamente 6.740 millones del Llama-2-7b-chat original, de modo que la compresion no reduce el numero total de parametros sino que redistribuye la capacidad: se eliminan componentes por valor singular y se reinsertan otros, en concreto 632 componentes restaurados y 632 retirados, con 7.223.296 parametros intercambiados (0,11% de los parametros de proyeccion densos). La celda corresponde a la regla de seleccion `gap_iter` con un presupuesto de restauracion del 1,000% de los parametros densos, aplicado en trozos del 0,200% por ronda, semilla 42.

Su relevancia es metodologica: forma parte de una rejilla experimental sobre reglas de seleccion y presupuestos, y varias celdas de esa rejilla estan deliberadamente degradadas en seguridad respecto al modelo base. El propio autor advierte que debe tratarse como sujeto experimental y no como asistente desplegable. La model card reporta tasas de exito de ataque (ASR) de 0,2942 en AdvBench y 0,1565 en StrongREJECT, con una tasa de sobrerrechazo macro de 0,0966 medida con WildGuard.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada de Llama-2-7b-chat (no se detalla en la model card; se asume la del modelo base) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base declara 4096 tokens) |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene safetensors en precision de 16 bits, sin variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible (el modelo base esta entrenado predominantemente en ingles) |
| Licencia | Llama 2 Community License (se incluyen `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (libreria transformers, pipeline text-generation) |

Datos adicionales de compresion: fraccion de parametros resultante 0,5998; regla de seleccion `gap_iter`; presupuesto de restauracion 1,000% de parametros densos; 632 componentes restaurados y 632 retirados; valor de swap `net` (valor de insercion mas valor de eliminacion de la evacuacion ordenada por sigma); escala de insercion 0,2; 1 de 5 rondas aplicadas; semilla 42; tamano del repositorio 13,5 GB.

## Arquitectura y entrenamiento

No hay arquitectura propia: el modelo hereda la de Llama-2-7b-chat, un transformer decoder-only con normalizacion RMSNorm pre-norma, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion causal multi-cabeza. La intervencion consiste en una compresion SVD-LLM que elimina el 40,02% de los parametros (fraccion resultante 0,5998) y una posterior edicion por sustitucion iterativa de componentes. En cada ronda se retiran componentes segun su valor singular y se reinsertan componentes alternativos valorados con la senal `net`, a una escala de insercion de 0,2 de su fuerza. Este checkpoint concreto corresponde a la primera de cinco rondas, con un trozo de 0,200% de parametros densos por ronda, sobre un presupuesto total de 1,0%.

No hubo un entrenamiento adicional con datos nuevos: la model card no menciona tokens de entrenamiento, composicion de dataset, RLHF ni DPO, mas alla del alineamiento ya presente en Llama-2-7b-chat. La innovacion tecnica es el procedimiento de reparacion "parameter-neutral", que mantiene constante el numero de parametros mientras intercambia componentes, y la regla de seleccion `gap_iter`, uno de los criterios de la rejilla experimental cuyo objetivo es identificar que componentes son responsables de la degradacion de seguridad tras la compresion. El autor no documenta el numero de tokens de calibracion empleado.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Llama-2-7b-chat.
- Razonamiento basico e instrucciones de un solo turno, con la degradacion esperable tras una compresion del 40% de componentes.
- Comportamiento de rechazo de peticiones daninas parcialmente conservado: la model card reporta una tasa de sobrerrechazo macro de 0,0966 (WildGuard), lo que indica que el sistema de rechazo sigue activo aunque debilitado.
- Investigacion en seguridad: la metrica principal es la tasa de exito de ataque, no la calidad generativa.
- Capacidades multilingues: no disponibles como dato declarado; se asume el sesgo hacia ingles del modelo base.
- Tool calling, function calling, modo pensamiento, vision y audio: no disponibles; no se declaran en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay evidencia declarada de ello y el checkpoint es un artefacto de investigacion.

## Casos de uso

- Investigacion sobre compresion y seguridad: usar el checkpoint como celda de control en experimentos que midan la relacion entre la fraccion de parametros eliminados por SVD y la tasa de exito de ataque, comparando con las otras celdas de la rejilla del mismo autor.
- Auditoria de mecanismos de rechazo: aprovechar que el autor publica ASR de AdvBench (0,2942) y StrongREJECT (0,1565) para reproducir el pipeline de evaluacion con HarmBench como juez y verificar los valores reportados.
- Estudio de reparacion de comportamiento: analizar los 632 componentes restaurados y los 632 retirados para identificar que subconjuntos de pesos sostienen las capacidades de seguridad, mediante analisis de valores singulares y ablaciones.
- Analisis de sobre-rechazo: emplear la metrica de sobrerrechazo macro (0,0966 con WildGuard) para estudiar el equilibrio entre seguridad y utilidad tras comprimir un modelo alineado.
- Base para experimentos de destilacion o recuperacion adicional: utilizar este checkpoint intermedio (ronda 1 de 5) como punto de partida para tecnicas de recuperacion de capacidad, midiendo si el ASR converge al del modelo sin comprimir.
- Docencia en interpretabilidad: ilustrar en un curso o taller como una intervencion puramente algebraica sobre los pesos altera un comportamiento de alto nivel como el rechazo de peticiones daninas, con metricas cuantitativas reproducibles.
- No recomendado: atencion al cliente, generacion de codigo en produccion, asistentes conversacionales publicos o cualquier despliegue orientado a usuarios finales, dado que el propio autor lo define como sujeto experimental con seguridad degradada.

## Benchmarks y rendimiento

La model card solo publica metricas de seguridad, no de capacidad general. No se han publicado resultados de benchmarks de conocimiento, codigo o matematicas (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Metrica | Valor | Juez / herramienta |
|---|---|---|
| AdvBench ASR | 0,2942 | HarmBench judge |
| StrongREJECT ASR | 0,1565 | HarmBench judge |
| Sobrerrechazo macro | 0,0966 | WildGuard |

Interpretacion: una ASR de 0,2942 en AdvBench significa que aproximadamente el 29,4% de las peticiones daninas del conjunto consiguen respuesta del modelo. El autor indica explicitamente que la compresion por si sola eleva la tasa de exito de ataque respecto a Llama-2-7b-chat y que el objetivo del estudio es cuantificar esa perdida y probar su recuperacion. No se proporcionan los valores de ASR del modelo base sin comprimir en esta model card, por lo que no es posible calcular la degradacion exacta a partir de los datos disponibles.

## Requisitos de hardware

- VRAM estimada en 16 bits: aproximadamente 13,5 GB solo para los pesos (coincide con el tamano del repositorio), mas la cache KV. Con contexto de 4096 tokens y lote 1, el consumo total se situa en torno a 14-16 GB.
- GPU recomendadas: A100 40 GB, A100 80 GB, H100 80 GB para inferencia con lotes grandes o contexto completo; L40S 48 GB y RTX A6000 48 GB son suficientes para servicio mono-modelo.
- Cabe en GPU de consumo: si, en RTX 4090 o RTX 3090 con 24 GB de VRAM, con margen limitado; en tarjetas de 16 GB requeriria cuantizacion, que no esta publicada en el repositorio.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` presente), y `endpoints_compatible` segun los tags. No se declaran pesos GGUF, por lo que llama.cpp y Ollama exigirian una conversion manual a partir de los safetensors.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia, y la compresion por SVD no implica necesariamente una aceleracion en inferencia densa, ya que el numero de parametros permanece practicamente igual (6,738 frente a ~6,740 millones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Seguridad (ASR AdvBench) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l2_remove40_swapgapnet_a020_c002_b010_r01 | 6.738.415.616 | no disponible | 0,2942 | Llama 2 Community | HuggingFace, 0 descargas, 0 likes |
| meta-llama/Llama-2-7b-chat-hf (modelo base) | ~6,74 mil millones | 4096 tokens | no disponible en esta informacion | Llama 2 Community | HuggingFace, ampliamente desplegado |
| Otras celdas de la rejilla del mismo autor | no disponible | no disponible | no disponible | Llama 2 Community | no disponibles en esta informacion |
| Modelos de 7-8B alineados de proposito general (por ejemplo, Llama-3.1-8B-Instruct, Mistral-7B-Instruct) | no disponible | no disponible | no disponible | licencias propias | no comparables directamente por categoria |

La comparativa cuantitativa con alternativas no es posible con los datos proporcionados: no se publican los ASR del modelo base ni de las demas celdas de la rejilla en esta model card, y las alternativas comerciales o abiertas de 7-8B no aparecen en la informacion disponible. La unica conclusion defendible es cualitativa: este checkpoint pertenece a la categoria de artefactos de investigacion sobre compresion y seguridad, no a la de asistentes desplegables.

## Limitaciones y advertencias

- Seguridad degradada de forma deliberada en varias celdas de la rejilla: el autor afirma que la compresion por si sola eleva la tasa de exito de ataque, y este checkpoint no es una excepcion; la ASR de 0,2942 en AdvBench es alta para un modelo alineado.
- No es un modelo de proposito general: la model card lo describe como "sujeto experimental", no como asistente desplegable.
- Riesgo de alucinacion: no se documenta, pero la eliminacion del 40,02% de componentes por SVD y la reinyeccion parcial de componentes con escala 0,2 son intervenciones que pueden degradar la coherencia del modelo; se recomienda evaluarlo antes de extraer conclusiones.
- Sesgos: no documentados en la model card. Al derivar de Llama-2-7b-chat, hereda los sesgos de su dataset de alineamiento, pero no hay medicion especifica en esta ficha.
- Limitaciones de contexto e idioma: no declaradas; el modelo base esta orientado al ingles y a 4096 tokens, pero la model card no confirma ninguno de los dos valores para este checkpoint.
- Restricciones de licencia: Llama 2 Community License, con `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio. Cualquier uso queda sujeto a ambas, incluidas las clausulas de atribucion ("Built with Llama 2") y las restricciones de la politica de uso aceptable.
- Reproducibilidad: se documentan semilla (42), escala de insercion (0,2) y numero de ronda (1 de 5), lo que facilita la reproduccion parcial, pero el numero de tokens de calibracion del SVD no se declara.
- Adopcion nula: 0 descargas y 0 likes en el momento de redactar esta ficha, sin senales de validacion por parte de terceros.
- Produccion: no recomendado para sistemas orientados a usuarios finales, cumplimiento normativo ni entornos donde el rechazo de peticiones daninas sea un requisito.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove40_swapgapnet_a020_c002_b010_r01
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/ (referenciada por la licencia del repositorio, `LICENSE.txt` y `USE_POLICY.md` incluidos en el propio repositorio)
- La busqueda web realizada no devolvio ningun resultado relevante: los unicos enlaces recuperados corresponden a un fondo de inversion (Brown Advisory US Sustainable Growth Fund) y no guardan relacion con el modelo. No se han encontrado papers, blogs, repositorios ni demos adicionales sobre este checkpoint en la informacion disponible.
