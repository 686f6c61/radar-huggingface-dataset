# Jeesup/svd-safety-l3_swift_jbbcal2_remove40

## Resumen

`Jeesup/svd-safety-l3_swift_jbbcal2_remove40` es un checkpoint de investigación construido a partir de `meta-llama/Meta-Llama-3-8B-Instruct` mediante compresión SVD-LLM, con un 40,00 % de los parámetros densos eliminados y un presupuesto de restauración de componentes SVD del 0,000 % (0 componentes restaurados y 0 sustituidos). El resultado es un modelo con una fracción de parámetros resultante de 0,6003 respecto al denso original. Lo publica el usuario Jeesup en HuggingFace y no es un modelo conversacional de propósito general, sino una celda concreta de una rejilla experimental sobre reglas de selección de componentes y presupuestos de restauración.

El problema que aborda es la medición del deterioro (y la posible reparación) del comportamiento de seguridad cuando se comprime un modelo alineado. La model card indica explícitamente que varias ramas de la rejilla están "deliberadamente degradadas en seguridad" respecto al modelo base, porque la compresión por sí sola eleva la tasa de éxito de ataques. Esta celda concreta usa la regla de selección etiquetada como `unknown`, semilla 42, y sirve como sujeto experimental para cuantificar el intercambio entre seguridad y utilidad.

Su relevancia es metodológica: proporciona métricas publicadas de ASR en AdvBench (0,1962) y StrongREJECT (0,2556) con juez HarmBench, sobre-rechazo macro en WildGuard (0,0874) y perplejidad en WikiText-2 (24,8440), lo que permite comparar celdas de la rejilla y estudiar interpretabilidad de componentes SVD. No se han publicado datos de contexto, idiomas ni cuantizaciones más allá de lo heredado del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3) con capas lineales comprimidas mediante SVD-LLM; no disponible el detalle exacto de rangos por capa |
| Parámetros totales | 8.030.261.248 según los safetensors del repositorio; la model card declara una fracción de parámetros resultante de 0,6003 respecto al modelo denso |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada; el modelo base Llama 3 8B Instruct emplea 8.192 tokens |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos en safetensors sin versiones GGUF/AWQ/GPTQ |
| Idiomas soportados | No disponible |
| Licencia | Meta Llama 3 Community License (identificador `llama3`) |
| Formato de pesos | Safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Meta-Llama-3-8B-Instruct`, un transformer decoder-only de 8B parámetros con normalización RMSNorm, RoPE y atención con GQA. Sobre ese checkpoint se aplica SVD-LLM, una técnica de compresión post-entrenamiento que descompone en valores singulares las matrices de las capas lineales y descarta los componentes de menor energía hasta alcanzar el presupuesto objetivo: en esta celda, un 40,00 % de los parámetros densos eliminados. La model card no documenta ningún proceso de entrenamiento adicional, ajuste fino posterior ni RLHF/DPO específico para esta celda; la alineación procede íntegramente del modelo base.

La innovación del artefacto es el eje de restauración de componentes SVD: la rejilla cruza reglas de selección (aquí `unknown`) con presupuestos de restauración (aquí 0,000 %, es decir, ningún componente recuperado). El resultado son 0 componentes restaurados y 0 sustituidos, con semilla 42. Los únicos datos medidos son AdvBench ASR 0,1962 y StrongREJECT ASR 0,2556 con juez HarmBench, sobre-rechazo macro 0,0874 con WildGuard y perplejidad WikiText-2 de 24,8440. Existe una discrepancia no resuelta entre el recuento de parámetros de los safetensors (8,03B, prácticamente el tamaño denso) y la fracción declarada de 0,6003, que conviene verificar antes de asumir el tamaño real en disco o en memoria.

## Capacidades

- Generación de texto autoregresiva en inglés (capacidad heredada del modelo base Llama 3 8B Instruct); no hay evaluación específica de esta celda.
- Razonamiento y conocimiento general propios de Llama 3 8B Instruct, pero degradados por la compresión: la perplejidad en WikiText-2 medida es 24,8440.
- Comportamiento conversacional multi-turno heredado de la variante Instruct, sin garantías tras la compresión.
- Tool calling / function calling: no verificado ni documentado para este checkpoint; no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado.
- Capacidades multilingües: no disponibles; el modelo base está orientado principalmente al inglés.
- Capacidad especial: ninguna propia; el interés está en su papel como sujeto experimental en el estudio de seguridad bajo compresión, no en habilidades añadidas.
- Modo `thinking`, visión o audio: no soportados.

## Casos de uso

- Estudio del deterioro de seguridad por compresión: usar esta celda junto con las demás de la rejilla para cuantificar cuánto sube la tasa de éxito de ataques (AdvBench ASR 0,1962, StrongREJECT ASR 0,2556) al eliminar el 40 % de los parámetros densos.
- Evaluación de reglas de selección de componentes SVD: la celda etiquetada como `unknown` sirve como punto de comparación frente a reglas nombradas, con el mismo presupuesto de restauración (0,000 %) y la misma semilla (42), lo que permite aislar el efecto de la regla.
- Investigación en interpretabilidad: analizar qué componentes singulares se descartan y correlacionarlos con cambios medidos en sobre-rechazo (WildGuard 0,0874) y en utilidad (perplejidad WikiText-2 24,8440).
- Reproducción de experimentos: al estar fijados semilla, presupuesto y fracción de parámetros, permite replicar los números publicados y auditar la metodología del estudio.
- Red-teaming comparativo: emplear el checkpoint como sujeto "degradado" frente al modelo base en un banco de ataques estandarizado con juez HarmBench, para calibrar hasta qué punto la compresión actúa como vector de pérdida de alineación.
- Referencia negativa en pipelines de evaluación de seguridad: integrarlo como caso de control en un arnés automatizado que mida ASR y sobre-rechazo, con el fin de validar que el arnés detecta degradaciones conocidas.
- Análisis de eficiencia en investigación: comparar el coste de inferencia y la calidad resultante frente al denso original para estudiar la frontera de Pareto compresión/rendimiento en un checkpoint concreto.

## Benchmarks y rendimiento

| Métrica | Valor | Notas |
|---|---|---|
| AdvBench ASR (juez HarmBench) | 0,1962 | Tasa de éxito de ataque; cuanto menor, mejor |
| StrongREJECT ASR (juez HarmBench) | 0,2556 | Tasa de éxito de ataque; cuanto menor, mejor |
| Sobre-rechazo macro (WildGuard) | 0,0874 | Rechazos indebidos sobre peticiones benignas |
| Perplejidad WikiText-2 | 24,8440 | Indicador de degradación del modelado de lenguaje |

No se han publicado resultados de benchmarks en la información disponible más allá de los cuatro valores anteriores (no hay MMLU, HumanEval, GSM8K ni comparaciones numéricas contra el modelo base u otras celdas).

## Requisitos de hardware

- VRAM estimada en fp16: en torno a 16 GB si se carga el checkpoint completo tal y como figura en el repositorio (16,1 GB de tamaño de repo); el requisito real depende de los rangos efectivos tras la compresión, dato no disponible.
- GPU recomendadas: A100 40 GB, H100 o L40S para servir el modelo sin cuantizar con margen; RTX 4090 (24 GB) sería suficiente para una copia en fp16 si el checkpoint ocupa lo declarado.
- GPU de consumo: previsiblemente sí en RTX 3090/4090 (24 GB) y en tarjetas de 16 GB solo con cuantización, pero no se publican pesos cuantizados, por lo que habría que generarlos.
- Opciones de despliegue: `transformers` es la librería declarada; el repositorio incluye los tags `text-generation-inference` y `endpoints_compatible`, lo que sugiere compatibilidad con TGI y con endpoints gestionados. No se documenta soporte de vLLM, llama.cpp ni Ollama, y al tratarse de capas comprimidas por SVD conviene verificar que el runtime las carga antes de planificar un despliegue.
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| svd-safety-l3_swift_jbbcal2_remove40 | 8,03B en safetensors; fracción declarada 0,6003 del denso | No disponible | Meta Llama 3 Community License | HuggingFace, 0 descargas y 0 likes | AdvBench ASR 0,1962; StrongREJECT ASR 0,2556; sobre-rechazo 0,0874; ppl WikiText-2 24,8440 |
| meta-llama/Meta-Llama-3-8B-Instruct (modelo base) | 8B | 8.192 tokens | Meta Llama 3 Community License | HuggingFace, ampliamente distribuido | No disponible en la información proporcionada |
| Otras celdas de la rejilla SVD-LLM de Jeesup | No disponible | No disponible | Meta Llama 3 Community License | HuggingFace | No disponible en la información proporcionada |

No se dispone de datos numéricos de alternativas de compresión equivalentes (por ejemplo, otros métodos de poda o destilación sobre Llama 3 8B) en la información proporcionada, por lo que no es posible una comparación cuantitativa adicional.

## Limitaciones y advertencias

- Artefacto de investigación, no modelo desplegable: la propia model card lo declara sujeto experimental y desaconseja tratarlo como asistente de propósito general.
- Degradación de seguridad deliberada: la compresión por sí sola eleva la tasa de éxito de ataques, y varias ramas de la rejilla están explícitamente degradadas respecto a Llama-3-8B-Instruct.
- Pérdida de utilidad medible: perplejidad de 24,8440 en WikiText-2, sin referencia publicada del modelo base en esta ficha para cuantificar la delta exacta.
- Sesgos: no evaluados ni documentados para esta celda; hereda los del modelo base, que tampoco se detallan aquí.
- Riesgo de alucinación: no medido; previsiblemente superior al del modelo denso por el efecto de la compresión.
- Idiomas y contexto: no disponibles; el modelo base está orientado principalmente al inglés y a 8.192 tokens de contexto.
- Restricciones de licencia: se aplica la Meta Llama 3 Community License, con los ficheros `LICENSE` y `USE_POLICY.md` incluidos en el repositorio; el uso comercial de este derivado queda sujeto a dicha licencia y a la política de uso aceptable de Meta.
- Discrepancia de parámetros: el recuento de safetensors (8,03B) no concuerda con la fracción declarada de 0,6003; conviene verificar el tamaño real antes de asumir requisitos de memoria.
- Compatibilidad de runtime no verificada: al tratarse de capas lineales con rangos reducidos por SVD, no hay confirmación de que los runtimes estándar de Llama carguen el checkpoint sin adaptaciones.
- Trazabilidad limitada: 0 descargas y 0 likes, autor único, y ninguna publicación, paper o repositorio enlazado en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_swift_jbbcal2_remove40
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Los resultados de búsqueda web proporcionados no contienen enlaces relevantes al modelo ni a su metodología (corresponden a foros sobre Facebook); no se dispone de paper, blog, repositorio de código ni demo adicionales.
