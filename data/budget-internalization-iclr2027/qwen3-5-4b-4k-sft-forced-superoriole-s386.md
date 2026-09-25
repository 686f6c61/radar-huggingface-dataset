# budget-internalization-iclr2027/qwen3.5-4b-4k-sft-forced-superoriole-s386

## Resumen

`qwen3.5-4b-4k-sft-forced-superoriole-s386` es un ajuste supervisado (SFT) del modelo `Qwen/Qwen3.5-4B`, publicado por el usuario `budget-internalization-iclr2027` como parte de un envío anónimo a ICLR 2027. El entrenamiento usa soluciones generadas por el propio Qwen3.5-4B a problemas matemáticos del dataset `agentica-org/DeepScaleR-Preview-Dataset`, filtradas por corrección (rejection sampling) y restringidas al subconjunto denominado `4k-forced`: respuestas con un presupuesto de 4.000 tokens cuya respuesta final se obtuvo mediante respuesta forzada. El checkpoint publicado corresponde al paso 386 del run con nombre en clave `superoriole`.

El modelo tiene 4.539.265.536 parámetros (4,54 B) y se distribuye en safetensors con pesos en BF16 (repo de 9,1 GB). La etiqueta de arquitectura en HuggingFace es `qwen3_5` y el pipeline declarado es `image-text-to-text`, aunque la model card solo documenta el uso con `AutoModelForCausalLM` y entrenamiento sobre texto.

Se trata de un artefacto de investigación orientado al estudio de la internalización de presupuestos de cómputo (token budget) en modelos razonadores: no publica resultados de benchmarks, no tiene descargas ni valoraciones y su relevancia práctica fuera del contexto del estudio es limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; etiqueta de librería `qwen3_5` (familia Qwen3.5), transformer decoder denso |
| Parámetros totales | 4.539.265.536 (4,54 B) |
| Parámetros activos | No aplica (no se documenta que sea MoE) |
| Longitud de contexto | No disponible; la longitud máxima de secuencia en entrenamiento fue 18.432 tokens. El "4k" del nombre se refiere al presupuesto de tokens de la respuesta, no a la ventana de contexto |
| Tipos de cuantización | No disponible; el autor solo publica pesos en BF16 (sin GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (heredada del modelo base según la model card) |
| Formato de pesos | Safetensors, dtype BF16 |
| Pipeline declarado | `image-text-to-text` |
| Modelo base | Qwen/Qwen3.5-4B (relación: finetune) |
| Dataset de entrenamiento | agentica-org/DeepScaleR-Preview-Dataset |
| Tamaño del repositorio | 9,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna más allá del modelo base: se trata de un finetune de `Qwen/Qwen3.5-4B`, un transformer decoder de 4,54 B de parámetros publicado por Alibaba Qwen. No se documentan el número de capas, la configuración de atención, el vocabulario ni si el base incorpora componentes híbridos o de atención lineal. Tampoco se confirma si conserva la capacidad multimodal que sugiere la etiqueta `image-text-to-text`.

El entrenamiento es un SFT clásico con pérdida de siguiente token sobre la respuesta. Los datos son soluciones autogeneradas por Qwen3.5-4B a problemas de DeepScaleR, filtradas por corrección y restringidas al subconjunto `4k-forced` (respuestas dentro de un presupuesto de 4k tokens cuya respuesta final se produjo por respuesta forzada), aceptando varias soluciones por problema. Hiperparámetros: 1 época, 386 pasos, batch de 32 secuencias, optimizador Adam con schedule coseno y LR máximo de 5e-06, longitud máxima de secuencia de 18.432 tokens y pesos finales en BF16. El prompt de entrenamiento pide razonamiento paso a paso y salida dentro de etiquetas `\boxed{}`. No se documenta RLHF, DPO ni ninguna innovación de decodificación.

## Capacidades

- Razonamiento matemático paso a paso sobre problemas tipo competición, con la respuesta final encapsulada en `\boxed{}` (formato impuesto durante el entrenamiento).
- Generación de texto en formato conversacional: la etiqueta `conversational` y el uso del chat template del modelo base están documentados.
- Producción de soluciones ajustadas a un presupuesto de tokens (perfil `4k`), entrenadas específicamente bajo la condición de respuesta forzada al agotar presupuesto.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso con herramientas.
- Capacidades multilingües: no disponibles; el único corpus documentado es DeepScaleR (problemas matemáticos) y no se declara cobertura de idiomas.
- Capacidades de visión: la etiqueta de pipeline indica `image-text-to-text`, pero la model card no documenta entrada de imágenes ni ejemplo de uso multimodal.
- No se documenta un modo de pensamiento explícito con tokens de control tipo ` thinking`; el razonamiento se induce únicamente mediante el prompt.

## Casos de uso

- Investigación sobre internalización de presupuesto de tokens: el modelo es un punto de comparación directo para estudiar cómo un LLM razonador adapta la longitud de su cadena de pensamiento cuando se le impone un límite de cómputo, que es el objeto del envío a ICLR 2027.
- Reproducción de pipelines de rejection-sampling fine-tuning: sirve como referencia de hiperparámetros (LR 5e-06, 386 pasos, batch 32) para equipos que quieran aplicar RFT sobre sus propios datos.
- Evaluación de razonamiento matemático: puede ejecutarse sobre suites tipo GSM8K, MATH o AIME para medir el efecto del ajuste con presupuesto forzado, siempre que el evaluador aporte su propio arnés de evaluación, ya que el autor no publica resultados.
- Generación de soluciones matemáticas con formato estricto: útil en entornos donde se necesita la respuesta final parseable en `\boxed{}` para su verificación automática con un comprobador simbólico.
- Punto de partida para finetunes posteriores: al ser un SFT ligero (1 época, LR bajo) sobre un base Apache 2.0, es un candidato razonable para continuar el entrenamiento con DPO o RL en dominios matemáticos.
- Despliegue local para prototipos: con 4,54 B de parámetros en BF16 cabe en una GPU de 24 GB, lo que permite iterar en estaciones de trabajo sin clúster.
- Estudio de robustez ante truncamiento: analizar qué ocurre cuando se fuerza la respuesta final en distintos umbrales de tokens, comparando este checkpoint con el base sin ajustar.
- Servicio de inferencia a escala para experimentos: el autor documenta el arranque con `vllm serve`, lo que facilita lotes grandes en pipelines de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, GSM8K, MATH, HumanEval ni ninguna otra, y no se han encontrado evaluaciones independientes en la búsqueda web realizada.

## Requisitos de hardware

- VRAM para inferencia (estimación a partir de 4.539.265.536 parámetros, sin contar caché KV):
  - BF16/FP16: aproximadamente 9,1 GB solo de pesos; con activaciones y caché KV conviene reservar 12-14 GB.
  - INT8: aproximadamente 4,6 GB de pesos.
  - INT4: aproximadamente 2,3-2,7 GB de pesos.
- La caché KV depende del número de capas y cabezas, que no se documenta; para contextos largos (hasta 18.432 tokens) el consumo adicional puede ser significativo y no es cuantificable con los datos disponibles.
- GPU recomendadas: A100 40/80 GB, H100, L40S o cualquier GPU con 16 GB o más para BF16. En consumer, cabe en RTX 4090 y RTX 3090 (24 GB) con holgura en BF16; en RTX 4080/4060 Ti de 16 GB es viable en BF16 con margen ajustado o en INT8 con más comodidad.
- GPU de 8 GB: solo con cuantización INT4, que el autor no publica y habría que generar.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (documentado), vLLM (el autor incluye el comando `vllm serve`), y previsiblemente TGI. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, ya que no se distribuye esa variante.
- Latencia y throughput: no disponibles. El autor no publica medidas de tokens por segundo ni tiempos de respuesta.

## Comparativa con modelos similares

No se dispone de especificaciones verificadas de alternativas en la información proporcionada, por lo que la comparación se limita al modelo base y a la categoría.

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (SFT `4k-forced`, paso 386) | 4,54 B | No disponible; 18.432 tokens de secuencia máxima en entrenamiento | Apache 2.0 (heredada) | Safetensors BF16 | Público en HuggingFace, 0 descargas |
| Qwen/Qwen3.5-4B (base) | 4,54 B (mismo tamaño de safetensors que el finetune) | No disponible en la información proporcionada | Apache 2.0 | Safetensors | Público en HuggingFace |
| Otras destilaciones o finetunes matemáticos de ~4-8 B (por ejemplo, variantes de la familia DeepSeek-R1-Distill o Qwen matemáticos) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han encontrado en la información disponible datos de rendimiento comparado entre este checkpoint y sus alternativas, por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Artefacto sin validación externa: 0 descargas y 0 likes en el momento de redactar la ficha, y sin resultados de benchmarks publicados.
- Autoría anónima asociada a un envío en revisión (ICLR 2027): el trabajo subyacente no ha superado necesariamente una revisión por pares y no hay paper enlazado.
- Especialización estrecha: el entrenamiento se limita a un subconjunto de problemas matemáticos de DeepScaleR (`4k-forced`), lo que puede degradar el rendimiento en tareas generales de conversación, código o conocimiento factual respecto al modelo base.
- Sesgo de formato: al haberse entrenado con la instrucción de emitir la respuesta en `\boxed{}` y con respuestas forzadas por presupuesto, el modelo puede tender a cadenas de pensamiento más cortas de lo óptimo y a producir la respuesta final antes de haber razonado lo suficiente.
- Riesgo de alucinación: como cualquier LLM, puede generar pasos intermedios plausibles pero incorrectos; en matemáticas la verificación externa (comprobador simbólico o ejecución numérica) es imprescindible.
- Herencia del modelo base: no se documenta ningún proceso de mitigación de sesgos, por lo que se heredan los sesgos presentes en Qwen3.5-4B y en los datos de DeepScaleR.
- Idiomas: no se declara cobertura multilingüe; el corpus documentado son problemas matemáticos, presumiblemente en inglés, aunque el dato no se especifica.
- Licencia: Apache 2.0 permite uso comercial según la model card, pero se hereda del modelo base; conviene verificar los términos vigentes de `Qwen/Qwen3.5-4B` (condiciones de uso, atribución y política de marca) antes de un despliegue en producción.
- Capacidad multimodal incierta: aunque la etiqueta de HuggingFace indica `image-text-to-text`, la model card no documenta procesamiento de imágenes ni incluye ejemplos multimodales; no debe asumirse visión sin verificarla.
- Documentación mínima: no se especifican arquitectura interna, idiomas, ni variantes cuantizadas, lo que complica la planificación de despliegues.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-4k-sft-forced-superoriole-s386
- Modelo base Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset agentica-org/DeepScaleR-Preview-Dataset: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Paper o blog del autor: no disponible (envío anónimo a ICLR 2027, sin enlace en la model card)
- Repositorio de código o demo: no disponible
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden al presupuesto del Estado francés (`budget.gouv.fr`, `budget.fr`, `francebudget.fr`) y a la empresa de alquiler de vehículos Budget, sin relación con este modelo.
