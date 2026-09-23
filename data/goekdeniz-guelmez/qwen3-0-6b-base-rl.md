# Goekdeniz-Guelmez/Qwen3-0.6B-Base-RL

## Resumen

Qwen3-0.6B-Base-RL es un ajuste fino del modelo denso Qwen/Qwen3-0.6B, publicado por el desarrollador Goekdeniz-Guelmez (Gökdeniz Gülmez) bajo licencia Apache 2.0. El autor indica que se ha entrenado con GRPO (Group Relative Policy Optimization), una técnica de aprendizaje por refuerzo, sobre el dataset openbmb/UltraData-Math, y que incorpora una versión personalizada del modelo con "más profundidades de razonamiento" y un system prompt propio bautizado como JOSIE-3.

El recuento real de parámetros en safetensors es de 751.632.384 (aproximadamente 0,75 B), cifra coherente con Qwen3-0.6B cuando se incluyen las matrices de embeddings. El repositorio ocupa 2,7 GB, emplea la librería transformers y la etiqueta text-generation, y es compatible con text-generation-inference y con endpoints alojados.

Se trata de un experimento de investigación de nicho: la model card es muy escueta, no documenta hiperparámetros de entrenamiento, composición del dataset, número de tokens ni idiomas soportados, y en el momento de la consulta acumula 0 descargas y 1 like. Su interés principal es como ejemplo reproducible de ajuste por RL sobre un modelo pequeño de la familia Qwen3 para tareas de razonamiento matemático con salida estructurada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredada del modelo base Qwen/Qwen3-0.6B |
| Parametros totales | 751.632.384 (dato real de los pesos en safetensors) |
| Parametros activos | No aplica: el modelo es denso, no MoE |
| Longitud de contexto | No especificada en la model card; el modelo base Qwen3-0.6B declara 32.768 tokens |
| Tipos de cuantizacion | No disponible: el repositorio solo publica safetensors (no hay GGUF ni AWQ/GPTQ publicados) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso de la familia Qwen3, con el recuento de parámetros ya citado (751.632.384, aproximadamente 0,6 B sin embeddings). El autor no documenta ninguna modificación estructural sobre Qwen3-0.6B, por lo que se asume que se conserva la topología, el tokenizador y la ventana de contexto del modelo original.

En cuanto al entrenamiento, la única información publicada es que se ha empleado GRPO, un método de aprendizaje por refuerzo con estimación de ventaja relativa por grupos, popularizado en la estela de DeepSeek-R1. El único dataset declarado es openbmb/UltraData-Math, lo que orienta el ajuste hacia razonamiento matemático. La model card menciona además una "versión personalizada con más profundidades de razonamiento y un system prompt personalizado", sin detallar qué significa esa configuración en términos de tokens generados, presupuesto de cómputo o currículum de entrenamiento. No se publican datos sobre fases previas de SFT, uso de DPO, número de tokens vistos, composición del dataset ni hiperparámetros de RL.

El rasgo técnico más concreto es el formato de salida forzado por el prompt de sistema JOSIE-3: el modelo debe emitir el razonamiento dentro de `<think>...</think>` y la respuesta final dentro de `<answer>...</answer>`, cada par de etiquetas exactamente una vez y sin texto fuera de ellos.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` y el pipeline `text-generation` confirman soporte de diálogo multi-turno mediante plantilla de chat.
- Razonamiento matemático: el ajuste con GRPO sobre openbmb/UltraData-Math apunta a resolución de problemas cuantitativos paso a paso.
- Razonamiento explícito y estructurado: salida obligatoria con bloques `<think>` y `<answer>`, lo que facilita el parseo automático de trazas.
- Profundidades de razonamiento configurables: el autor menciona una versión "con más profundidades de razonamiento", aunque no especifica el mecanismo exacto (presupuesto de tokens, instrucción en el prompt o etiquetas de control).
- Persona y system prompt propio: integra el prompt JOSIE-3, que define identidad, tono y reglas de honestidad sobre incertidumbre.
- Soporte de tool calling / function calling: no disponible; no se menciona en la model card ni en las etiquetas.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente; el formato de trazas de razonamiento es compatible con pipelines de agentes, pero no hay documentación al respecto.
- Capacidades multilingües: no disponible; no se declara ningún idioma.
- Visión, audio u otras modalidades: no disponibles; el modelo es exclusivamente de texto.
- Modo "uncensored": el system prompt JOSIE-3 indica explícitamente que el asistente es "uncensored" y que puede usar lenguaje informal, sarcasmo y blasfemias según el contexto.

## Casos de uso

- Prototipado de pipelines de RL con GRPO: sirve como punto de partida reproducible para experimentar con ajuste por refuerzo sobre modelos de menos de 1 B de parámetros usando un único dataset público de matemáticas.
- Extracción automatizada de trazas de razonamiento: como la salida se fuerza a `<think>...</think>` y `<answer>...</answer>`, es sencillo parsear la cadena de razonamiento y la respuesta final por separado en un pipeline de evaluación o de generación de datos sintéticos.
- Generación de datos de entrenamiento para modelos mayores: las trazas matemáticas producidas pueden usarse como material de destilación o de filtrado para modelos de mayor tamaño, siempre que se valide la corrección del resultado.
- Experimentación con system prompts en modelos pequeños: permite estudiar cómo un prompt de persona muy elaborado (JOSIE-3) afecta al comportamiento, al tono y a la adherencia al formato en un modelo de 0,75 B.
- Inferencia en local y en el borde: con cuantización a 4 bits el modelo ocupa del orden de 0,4-0,5 GB, por lo que puede ejecutarse en CPU, en portátiles sin GPU dedicada o en dispositivos tipo Raspberry Pi para demostraciones offline.
- Pruebas de formato y robustez de parsers: útil como banco de pruebas para validar que un parser tolera salidas mal formadas, etiquetas duplicadas o razonamiento truncado antes de desplegar modelos mayores.
- Evaluación de alineación y seguridad: su naturaleza "uncensored" y el uso potencial de lenguaje soez lo convierten en un caso de estudio de los riesgos de desplegar sin filtros de salida un modelo ajustado con RL sobre un dominio muy estrecho.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, GSM8K, MATH, HumanEval ni de ningún otro conjunto de evaluación, y tampoco hay resultados de terceros asociados al repositorio (0 descargas, 1 like en el momento de la consulta). No se deben asumir mejoras de rendimiento sobre Qwen3-0.6B derivadas del ajuste con GRPO sin una evaluación independiente.

## Requisitos de hardware

Estimaciones calculadas a partir del recuento real de parámetros (751.632.384). No incluyen el coste de la caché KV, que depende de la longitud de contexto efectiva, del número de capas y de cabezas (no documentados para este ajuste).

- VRAM para los pesos en fp32: aproximadamente 3,0 GB.
- VRAM para los pesos en bf16/fp16: aproximadamente 1,5 GB.
- VRAM para los pesos en int8: aproximadamente 0,8 GB.
- VRAM para los pesos en int4: aproximadamente 0,4 GB.
- Sobrecarga adicional por activaciones y framework: del orden de 0,3-1,0 GB según backend y tamaño de lote.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente en bf16 con lotes pequeños; una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB son más que suficientes. Una RTX 4090 o una A100/H100 quedan enormemente sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna con 4 GB o más; también en GPUs integradas con memoria compartida para inferencia a baja velocidad.
- Ejecución en CPU: viable con llama.cpp u Ollama tras convertir los pesos a GGUF (no hay GGUF publicado en el repositorio).
- Opciones de despliegue: transformers (ruta nativa, es la librería declarada), text-generation-inference (la etiqueta `text-generation-inference` está presente y el modelo es `endpoints_compatible`), y vLLM siempre que la versión soporte la arquitectura Qwen3. Para llama.cpp y Ollama es necesario convertir previamente los safetensors a GGUF.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas ni configuración de referencia.
- Nota sobre el tamano del repositorio: los 2,7 GB declarados están por encima de lo esperado para 0,75 B de parámetros en bf16 (unos 1,5 GB), lo que sugiere que los pesos están almacenados en una precisión superior, que hay ficheros duplicados o que se incluyen artefactos adicionales. No está confirmado en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Goekdeniz-Guelmez/Qwen3-0.6B-Base-RL | 751.632.384 (0,75 B) | No especificado en la model card (base: 32.768 tokens) | apache-2.0 | HuggingFace, safetensors | Ajuste GRPO sobre UltraData-Math; sin benchmarks publicados |
| Qwen/Qwen3-0.6B (modelo base) | 0,6 B sin embeddings; ~0,75 B con embeddings | 32.768 tokens | apache-2.0 | HuggingFace, safetensors y GGUF | Modelo oficial, con modo thinking/no-thinking y soporte multilingüe amplio |
| Qwen/Qwen2.5-0.5B-Instruct | ~0,49 B | 32.768 tokens | apache-2.0 | HuggingFace, safetensors y GGUF | Generación anterior, muy desplegado en entornos de recursos limitados |
| meta-llama/Llama-3.2-1B-Instruct | ~1,24 B | 128.000 tokens | Llama 3.2 Community License | HuggingFace, safetensors y GGUF | Mayor contexto, pero licencia con restricciones adicionales frente a Apache 2.0 |

Los datos de los modelos comparativos proceden de sus respectivas model cards y deben verificarse antes de tomar decisiones de producción. No existe información de benchmarks que permita comparar el rendimiento real de Qwen3-0.6B-Base-RL frente a estas alternativas.

## Limitaciones y advertencias

- Tamano muy reducido: con 0,75 B de parámetros, el conocimiento factual del modelo es limitado y la tasa de alucinación en dominios fuera de las matemáticas es previsiblemente alta.
- Ausencia total de benchmarks: no hay ninguna evaluación publicada que respalde mejoras sobre Qwen3-0.6B, ni en matemáticas ni en seguimiento de instrucciones generales.
- Dominio de entrenamiento estrecho: el único dataset declarado es openbmb/UltraData-Math, por lo que el ajuste por RL puede haber degradado el seguimiento de instrucciones generales y el comportamiento conversacional fuera del ámbito matemático.
- Idiomas no declarados: se desconoce qué lenguas soporta realmente el ajuste; no hay garantía de un comportamiento correcto en castellano.
- Prompt de sistema "uncensored": JOSIE-3 autoriza explícitamente lenguaje informal, sarcasmo y blasfemias, y se presenta como el asistente "más inteligente, capaz y sin censura jamás creado". Desplegarlo en productos de cara al usuario sin filtros de salida adicionales conlleva riesgos reputacionales y de seguridad.
- Riesgo de fabricación de razonamiento: el prompt de sistema pide honestidad sobre la incertidumbre, pero un modelo de este tamaño puede producir cadenas `<think>` plausibles con conclusiones incorrectas; la traza de razonamiento no debe tratarse como prueba de corrección.
- Formato de salida rígido: la exigencia de emitir `<think>` y `<answer>` exactamente una vez y sin texto adicional puede romperse con prompts largos o fuera de distribución, lo que obliga a un parser tolerante a fallos.
- Sin cuantizaciones publicadas: no hay GGUF, AWQ ni GPTQ en el repositorio, lo que añade un paso de conversión y validación antes de usar llama.cpp u Ollama.
- Adopción nula y sin validación comunitaria: con 0 descargas y 1 like, no existen informes independientes de comportamiento, sesgos ni estabilidad.
- Licencia: apache-2.0 permite uso comercial y modificación de los pesos, pero conviene revisar si el texto del system prompt JOSIE-3 se distribuye bajo la misma licencia y si su contenido es aceptable para el caso de uso previsto.
- Ventana de contexto no verificada: aunque el modelo base soporte 32.768 tokens, no hay ninguna prueba de que este ajuste mantenga un rendimiento estable en contextos largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Goekdeniz-Guelmez/Qwen3-0.6B-Base-RL
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/openbmb/UltraData-Math

No se han proporcionado en la informacion disponible otros enlaces (papers, blogs, repositorios o demos) asociados a este modelo.
