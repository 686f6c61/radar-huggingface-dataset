# Jeesup/svd-safety-l3_swift_remove40

## Resumen

`Jeesup/svd-safety-l3_swift_remove40` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` al que se le ha aplicado compresion mediante SVD-LLM, eliminando el 40,00% de los parametros densos y dejando la fraccion resultante en 0,6003. Forma parte de una rejilla experimental disenada para estudiar como la compresion por descomposicion en valores singulares degrada el comportamiento de seguridad de un modelo alineado, y que regla de seleccion de componentes permite repararlo mejor. En esta celda concreta la regla de seleccion es `unknown`, el presupuesto de restauracion es del 0,000% de los parametros densos y no se restauro ningun componente.

El interes del artefacto es metodologico, no de producto. Se publica acompanado de cuatro metricas medidas con jueces estandarizados (AdvBench ASR, StrongREJECT ASR, tasa macro de sobrerrechazo y perplejidad en WikiText-2), lo que permite cuantificar el coste en seguridad que introduce la compresion agresiva de pesos frente al checkpoint sin comprimir. La model card es explicita: es un sujeto experimental de un estudio, no un asistente desplegable.

El repositorio no incluye datos de idiomas soportados ni tipos de cuantizacion precalculados, pesa 16,1 GB y expone 8.030.261.248 parametros en tensores safetensors. La licencia es la Llama 2 Community License y se distribuyen `LICENSE.txt` y `USE_POLICY.md` en el propio repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2); compresion posterior mediante SVD-LLM sobre las matrices de pesos |
| Parametros totales | 8.030.261.248 parametros en los tensores safetensors del repositorio |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens, heredada de la configuracion de Llama-2-7b-chat; no verificada en la model card |
| Tipos de cuantizacion | No disponible (no se publican variantes cuantizadas; al ser safetensors en precision completa, admite cuantizacion posterior con herramientas externas) |
| Idiomas soportados | No disponible |
| Licencia | Llama 2 Community License (`llama2`); se incluyen `LICENSE.txt` y `USE_POLICY.md` |
| Formato de pesos | safetensors (libreria `transformers`) |
| Fraccion de parametros resultante | 0,6003 (40,00% de parametros eliminados) |
| Regla de seleccion de componentes | `unknown` |
| Presupuesto de restauracion | 0,000% de los parametros densos (0 componentes restaurados, 0 componentes sustituidos) |
| Semilla | 42 |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |

## Arquitectura y entrenamiento

El punto de partida es `meta-llama/Llama-2-7b-chat-hf`, un transformer decoder-only con normalizacion RMSNorm, embeddings rotatorios (RoPE), activacion SwiGLU y atencion multi-cabeza, afinado con RLHF sobre el modelo base Llama 2 para comportamiento conversacional. Sobre ese checkpoint no se realiza entrenamiento adicional desde cero: la intervencion es una compresion post-entrenamiento con SVD-LLM que elimina el 40,00% de los parametros densos, reduciendo el modelo a una fraccion de 0,6003 respecto del original. La semilla del experimento es 42.

La innovacion del artefacto no esta en la arquitectura, sino en el protocolo de evaluacion del dano. La model card describe una rejilla (grid) sobre dos ejes: la regla de seleccion de componentes singulares a conservar o restaurar, y el presupuesto de restauracion expresado como porcentaje de parametros densos. Esta celda usa la regla `unknown` con presupuesto 0,000%, es decir, sin ninguna reparacion posterior a la compresion. No se documentan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo una fase adicional de DPO o RLHF especifica para este checkpoint.

## Capacidades

- Generacion de texto autoregresiva y conversacion multi-turno, heredadas del checkpoint Llama-2-7b-chat.
- Comprension y generacion en los idiomas del modelo base (el ingles es el idioma dominante del entrenamiento original); no se publica lista de idiomas para esta variante.
- Uso como sujeto experimental para medir transferencia de comportamiento: tasas de exito de ataque (ASR) y tasas de sobrerrechazo bajo compresion.
- Capacidad de servir como punto de comparacion dentro de la rejilla de reglas de seleccion y presupuestos de restauracion del estudio.
- Etiquetado como compatible con `text-generation-inference` y `endpoints_compatible`, por lo que puede desplegarse con las herramientas estandar de Hugging Face.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso explicito, vision ni audio en la informacion disponible.

## Casos de uso

- Estudio de degradacion de seguridad por compresion: comparar el ASR de este checkpoint (0,2615 en AdvBench, 0,2268 en StrongREJECT) con el del Llama-2-7b-chat sin comprimir y con otras celdas de la rejilla, para atribuir el aumento de vulnerabilidad a la eliminacion de componentes singulares concretos.
- Analisis de la relacion seguridad-utilidad: cruzar el ASR con la perplejidad en WikiText-2 (30,4469) y con la tasa macro de sobrerrechazo (0,2379) para trazar la frontera de Pareto entre utilidad y alineacion bajo distintos niveles de compresion.
- Investigacion en interpretabilidad mecanicista: inspeccionar que subespacios de las matrices de pesos elimina SVD-LLM y correlacionarlos con las capas o cabezas responsables de rechazar peticiones daninas.
- Reproducibilidad de experimentos de compresion: al fijar semilla 42 y documentar fraccion resultante, regla de seleccion y presupuesto, sirve como celda verificable en una replicacion independiente del estudio.
- Referencia negativa en evaluaciones de robustez: usar este checkpoint como baseline de "modelo comprimido sin reparacion" en suites de red teaming y en el desarrollo de filtros de seguridad externos.
- Docencia y formacion en seguridad de IA: ilustrar con un caso real y medido como la compresion de pesos puede reabrir comportamientos que el alineamiento habia suprimido.
- Pruebas de regresion de pipelines de evaluacion: validar que los jueces (HarmBench, WildGuard) y las metricas de perplejidad producen resultados estables sobre un artefacto con comportamiento conocido y publicado.

Ninguno de estos casos implica su uso como asistente de produccion; la model card desaconseja explicitamente ese empleo.

## Benchmarks y rendimiento

| Metrica | Valor | Juez / metodo |
|---|---|---|
| AdvBench ASR | 0,2615 | HarmBench judge |
| StrongREJECT ASR | 0,2268 | HarmBench judge |
| Macro over-refusal | 0,2379 | WildGuard |
| WikiText-2 perplexity | 30,4469 | Perplejidad estandar |

No se han publicado resultados de benchmarks de conocimiento o razonamiento (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Tampoco se proporcionan los valores equivalentes del modelo base sin comprimir, por lo que la magnitud exacta del dano solo puede interpretarse en terminos absolutos dentro de la rejilla del estudio.

## Requisitos de hardware

- VRAM estimada en precision completa (fp16): aproximadamente 16 GB para los pesos, coherente con el tamano de repositorio de 16,1 GB, mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: del orden de 8-9 GB, segun el numero de parametros expuesto.
- VRAM estimada en cuantizacion de 4 bits: del orden de 4-5 GB, con el consiguiente impacto adicional en la calidad que no ha sido medido en esta ficha.
- GPU recomendadas: no especificadas por el autor. Por tamano, el modelo cabe en una unica GPU con 24 GB (RTX 3090, RTX 4090, A10G, L4) en fp16, y en GPUs de 16 GB con cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y, con cuantizacion de 8 o 4 bits, en tarjetas de 16 GB e incluso en configuraciones de 8 GB muy ajustadas para 4 bits.
- Opciones de despliegue: `transformers`, Text Generation Inference (el repositorio esta etiquetado como `text-generation-inference` y `endpoints_compatible`), vLLM y, previa conversion, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponible; no se publican mediciones de rendimiento para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Metricas publicadas |
|---|---|---|---|---|---|
| Jeesup/svd-safety-l3_swift_remove40 | 8.030.261.248 en safetensors (fraccion 0,6003 del denso) | 4.096 tokens (heredado, no verificado) | Llama 2 Community License | Hugging Face, 0 descargas y 0 likes en el momento de la consulta | AdvBench ASR 0,2615; StrongREJECT ASR 0,2268; sobrerrechazo macro 0,2379; perplejidad WikiText-2 30,4469 |
| meta-llama/Llama-2-7b-chat-hf (base sin comprimir) | 6.738.415.616 (aproximadamente 7B) | 4.096 tokens | Llama 2 Community License | Hugging Face, ampliamente distribuido | No disponible en la informacion proporcionada; es la referencia frente a la que se mide la degradacion |
| Otras celdas de la rejilla del mismo estudio | No disponible | No disponible | Llama 2 Community License | Previsiblemente publicadas por el mismo autor, no confirmado | No disponible |

No se dispone de datos de benchmarks comparables con modelos de compresion alternativos (por ejemplo, poda estructurada o destilacion de Llama 2) en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de investigacion, no un asistente desplegable: la propia model card lo califica de sujeto experimental y pide evaluarlo antes de extraer conclusiones.
- Seguridad degradada de forma deliberada en varias celdas de la rejilla: la compresion por si sola eleva la tasa de exito de ataque respecto a Llama-2-7b-chat, y esta celda no aplica ninguna restauracion (presupuesto 0,000%, 0 componentes restaurados).
- Tasa de exito de ataque medida de 0,2615 en AdvBench y 0,2268 en StrongREJECT: valores no despreciables que desaconsejan cualquier exposicion directa a usuarios finales.
- Sobrerrechazo macro de 0,2379 medido con WildGuard: el modelo tambien rechaza peticiones legitimas con frecuencia, lo que degrada la utilidad conversacional.
- Perplejidad de 30,4469 en WikiText-2: la calidad de modelado del lenguaje se resiente, aunque no se aporta la cifra del modelo base para cuantificar la diferencia.
- No se documentan sesgos especificos ni evaluaciones de sesgo para esta variante; los sesgos del checkpoint original de Llama 2 se heredan y pueden verse alterados de forma no caracterizada por la compresion.
- Riesgo de alucinacion: no evaluado en la informacion disponible, pero previsiblemente igual o superior al del modelo base dado el aumento de perplejidad.
- Idiomas soportados: no disponibles; se asume el perfil del modelo base, con ingles como idioma principal.
- Regla de seleccion de componentes etiquetada como `unknown`, lo que dificulta interpretar que componentes singulares se conservaron.
- Restricciones de licencia: Llama 2 Community License y `USE_POLICY.md`, con las limitaciones de uso comercial y los requisitos de atribucion que impone a los derivados. Cualquier uso esta sujeto a esos terminos y a las condiciones de la licencia del modelo base.
- Advertencia de origen: el contenido de la model card se ha tratado como material de referencia y no como instrucciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_swift_remove40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: incluida en el repositorio como `LICENSE.txt`, junto con `USE_POLICY.md`
- Paper de SVD-LLM: no disponible en la informacion proporcionada
- Repositorios, demos o blogs adicionales: no disponible; la busqueda web realizada devolvio unicamente resultados no relacionados con el modelo (contenido sobre alojamiento en Oia, Santorini), sin ningun enlace tecnico utilizable
