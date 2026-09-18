# Jeesup/svd-safety-l31_remove50_swapgapiter_b010_r08

## Resumen

El modelo `Jeesup/svd-safety-l31_remove50_swapgapiter_b010_r08` es un checkpoint derivado de `meta-llama/Llama-3.1-8B-Instruct` comprimido con la técnica SVD-LLM hasta eliminar el 50,03 % de los parámetros densos y posteriormente editado mediante 8 de las 10 rondas previstas de un procedimiento iterativo de intercambio de componentes con presupuesto neutro en parámetros. La regla de selección de componentes empleada se denomina `gap_iter` y el presupuesto de restauración es del 1,000 % de los parámetros densos, aplicado en fragmentos del 0,100 % por ronda. Lo publica el usuario Jeesup como artefacto de investigación, no como modelo de chat de propósito general.

El problema que aborda es la pérdida de comportamiento seguro que provoca la compresión SVD en modelos de lenguaje: la compresión por sí sola eleva la tasa de éxito de ataques adversariales, y este checkpoint forma parte de un grid experimental que compara reglas de selección de componentes y presupuestos para cuantificar esa degradación y probar estrategias de reparación. Por tanto, su relevancia es metodológica: sirve para estudiar el compromiso entre seguridad y utilidad bajo compresión, no para desplegarse como asistente.

Se trata de un transformer denso de arquitectura Llama 3, con 8.030.261.248 parámetros declarados en los ficheros safetensors, repositorio de 16,1 GB y pipeline `text-generation`. No se documentan idiomas soportados, tipos de cuantización ni longitud de contexto propia; el contexto heredado del modelo base es de 128.000 tokens.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso, familia Llama 3 (base: meta-llama/Llama-3.1-8B-Instruct) |
| Parámetros totales | 8.030.261.248 según safetensors; la model card declara una fracción de parámetros densos resultante de 0,4997 tras eliminar el 50,03 % |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la ficha; heredada de Llama-3.1-8B-Instruct: 128.000 tokens |
| Tipos de cuantización | No disponible; el repositorio solo publica safetensors (sin GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible en la ficha (el modelo base declara oficialmente 8 idiomas, pero esta derivación no lo confirma) |
| Licencia | Llama 3.1 Community License (incluye `LICENSE` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (librería `transformers`) |
| Etiquetas | llama3, svd, compression, safety, interpretability, conversational, text-generation-inference, endpoints_compatible |
| Descargas / likes | 0 / 0 |
| Creado / actualizado | 2026-09-17 |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama-3.1-8B-Instruct: un transformer decoder-only denso con atención por causalidad, normalización RMSNorm y activaciones SwiGLU. Sobre ese checkpoint se aplica SVD-LLM, un método de compresión basado en descomposición en valores singulares con truncamiento consciente de la truncación, que en esta celda elimina el 50,03 % de los parámetros densos. El resultado declarado es una fracción de parámetros de 0,4997. No hay entrenamiento adicional con datos nuevos: la model card no describe corpus, número de tokens ni fases de RLHF o DPO propias, sino una edición sobre un modelo ya alineado.

La innovación técnica de esta celda es el procedimiento de reparación posterior a la compresión. Se restauran 8812 componentes y se retiran otros tantos, con 54.302.720 parámetros sustituidos (0,78 % de los parámetros de proyección densos). La regla de selección es `gap_iter`, el valor de intercambio es `insert` (solo valor de inserción, con desalojo ordenado por sigma) y la semilla es 42. Se aplican 8 de las 10 rondas del presupuesto completo, con un fragmento del 0,100 % de parámetros densos por ronda y un presupuesto total del 1,000 %. El checkpoint publicado es, por tanto, un estado intermedio de una ejecución más larga.

## Capacidades

- Generación de texto conversacional en formato chat, heredada del modelo base instruct.
- Razonamiento y respuesta a instrucciones: capacidades no re-evaluadas ni documentadas tras la compresión.
- Generación de código y matemáticas: presumiblemente heredadas del modelo base, pero sin datos de HumanEval, MBPP ni GSM8K en la ficha.
- Tool calling y function calling: no documentado para esta derivación.
- Uso como agente y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; la ficha no declara idiomas.
- Capacidad diferencial medida: comportamiento de rechazo y resistencia a ataques, evaluado con AdvBench, StrongREJECT y WildGuard (ver sección de benchmarks).
- No dispone de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Investigación sobre seguridad y compresión: cuantificar cómo el truncamiento SVD degrada la alineación del modelo base y en qué magnitud. Es el uso para el que fue creado, con las métricas ASR ya publicadas como punto de partida.
- Reproducción de experimentos del grid de reglas de selección: comparar la regla `gap_iter` frente a otras reglas del mismo estudio con presupuestos equivalentes del 1,000 % de parámetros densos.
- Evaluación comparativa de pipelines de seguridad: usar el checkpoint como sujeto de prueba en arneses automatizados (HarmBench como juez, WildGuard para sobre-rechazo) y validar la reproducibilidad de los jueces.
- Estudio del sobre-rechazo: el valor macro de 0,7380 medido con WildGuard permite analizar cuánta utilidad se sacrifica en solicitudes benignas y calibrar umbrales de aceptación/rechazo.
- Interpretabilidad de componentes: dado que se conocen los 8812 componentes intercambiados y su regla de selección, el checkpoint permite analizar qué subconjuntos de pesos concentran el comportamiento de seguridad.
- Análisis de métodos de reparación paramétricamente neutros: validar si el intercambio con valor de inserción y desalojo ordenado por sigma recupera seguridad sin aumentar el número de parámetros.
- Docencia y formación en compresión de modelos: ejemplo tangible de compromiso seguridad-eficiencia en un modelo de 8B, útil en cursos de eficiencia y alineación.
- Auditoría previa a publicación: revisar artefactos derivados antes de liberarlos, dado que la propia ficha advierte de que algunas celdas del grid están deliberadamente degradadas en seguridad.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado | Herramienta de evaluación |
|---|---|---|---|
| AdvBench | Tasa de éxito de ataque (ASR) | 0,0000 | HarmBench judge |
| StrongREJECT | Tasa de éxito de ataque (ASR) | 0,0250 | HarmBench judge |
| WildGuard | Sobre-rechazo macro | 0,7380 | WildGuard |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de capacidades o utilidad, ni cifras de referencia del modelo base sin comprimir que permitan calcular la pérdida de rendimiento. Tampoco se publican métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada en precisión fp16/bf16: en torno a 16,1 GB solo para los pesos (coincide con el tamaño del repositorio), más la caché KV. Con contexto moderado, 24 GB de VRAM son suficientes.
- GPU profesionales: A100 (40 GB y 80 GB), H100, L40S y A10G (24 GB) pueden ejecutar el modelo sin cuantización; las configuraciones de 40 GB o más permiten lotes mayores y contextos cercanos a los 128.000 tokens.
- GPU de consumo: cabe en tarjetas de 24 GB como RTX 3090, RTX 4090 o RTX 5090. En tarjetas de 16 GB (RTX 4080, RTX 5080) el ajuste es muy justo y exigiría cuantización posterior o descarga parcial a CPU.
- Cuantización para despliegue: no hay versiones GGUF, AWQ ni GPTQ publicadas; habría que generarlas localmente, lo que alteraría además las propiedades de seguridad medidas.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (etiqueta `text-generation-inference`), servidores compatibles con `endpoints_compatible` y vLLM por compatibilidad con la arquitectura Llama. Para llama.cpp u Ollama sería necesaria una conversión a GGUF inexistente en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Naturaleza | Datos de seguridad publicados |
|---|---|---|---|---|---|
| Jeesup/svd-safety-l31_remove50_swapgapiter_b010_r08 | 8,03 B declarados en safetensors (fracción densa 0,4997) | 128.000 tokens (heredado) | Llama 3.1 Community | Artefacto de investigación (compresión + edición de seguridad) | ASR AdvBench 0,0000; ASR StrongREJECT 0,0250; sobre-rechazo macro 0,7380 |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | Llama 3.1 Community | Modelo instruct de propósito general | No disponible en esta ficha |
| Otras celdas del mismo grid (SVD-LLM con distintas reglas de selección y presupuestos) | 8,03 B de base, fracción variable | 128.000 tokens (heredado) | Llama 3.1 Community | Artefactos de investigación | No disponible en esta ficha |
| Modelos comprimidos con otros métodos (SliceGPT, LLM-Pruner y similares) | Variable | Variable | Variable | Modelos de investigación o de producción | No disponible |

La comparación cuantitativa con alternativas no puede completarse porque no se han proporcionado resultados del modelo base ni de las demás celdas del grid en las mismas condiciones de evaluación.

## Limitaciones y advertencias

- No es un asistente desplegable: la propia model card lo describe como sujeto experimental y recomienda evaluarlo antes de extraer conclusiones.
- Sobre-rechazo elevado: un valor macro de 0,7380 medido con WildGuard indica una tendencia marcada a rechazar peticiones benignas, con la consiguiente pérdida de utilidad.
- Riesgo de ataque no nulo: la tasa de éxito de 0,0250 en StrongREJECT con juez HarmBench implica que una fracción de ataques adversariales tiene éxito, aunque AdvBench arroje 0,0000.
- Degradación deliberada en parte del grid: algunas celdas del estudio están intencionadamente degradadas en seguridad; no debe asumirse que todas las variantes se comportan igual.
- Discrepancia entre metadatos y ficha: safetensors declara 8.030.261.248 parámetros y el repositorio ocupa 16,1 GB, mientras la ficha afirma una fracción densa de 0,4997. No debe asumirse una reducción de memoria o VRAM en el despliegue real sin verificarlo.
- Sesgos: heredados de Llama-3.1-8B-Instruct; no se documenta ningún análisis de sesgos específico para esta derivación.
- Alucinación: sin datos de evaluación de veracidad ni de fidelidad; se desconoce el impacto de la compresión sobre este comportamiento.
- Idiomas: la ficha no declara idiomas soportados, por lo que el comportamiento multilingüe no está garantizado.
- Ausencia de benchmarks de utilidad: no hay MMLU, HumanEval ni GSM8K, de modo que no puede estimarse la pérdida de capacidad respecto al modelo base.
- Restricciones de licencia: Llama 3.1 Community License impone atribución ("Built with Llama"), cumplimiento de la política de uso aceptable y condiciones específicas para despliegues a gran escala (por encima de 700 millones de usuarios mensuales requiere licencia adicional de Meta). Los ficheros `LICENSE` y `USE_POLICY.md` se incluyen en el repositorio y vinculan cualquier uso derivado.
- Sin validación comunitaria: 0 descargas y 0 likes, sin evidencia externa de reproducibilidad.
- Madurez del artefacto: es un checkpoint intermedio (8 de 10 rondas), no el resultado final de la ejecución completa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l31_remove50_swapgapiter_b010_r08
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1 Community: incluida en el repositorio del modelo (`LICENSE`) y en https://llama.meta.com/llama3_1/license/
- Política de uso aceptable de Llama 3.1: incluida en el repositorio del modelo (`USE_POLICY.md`)
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a contenidos no relacionados (comparativas de tarjetas gráficas y temas de Netflix), por lo que no se listan.
