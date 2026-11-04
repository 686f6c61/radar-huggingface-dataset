# Nullmega/Mellum2.1-12B-A2.5B-Thinking-DevSec

## Resumen

Mellum2.1-12B-A2.5B-Thinking-DevSec es un adaptador LoRA publicado por el usuario Nullmega sobre el modelo base JetBrains/Mellum2.1-12B-A2.5B-Thinking, un transformer de tipo mixture-of-experts (MoE) orientado a generación de código con un total de aproximadamente 12 000 millones de parámetros y unos 2500 millones de parámetros activos por token. El adaptador afina únicamente las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) mediante un ajuste supervisado de una sola pasada sobre GPU única, manteniendo congelados tanto el resto de pesos del transformer como los pesos de expertos y del router.

El objetivo declarado del adaptador es especializar el modelo base en tareas de desarrollo y seguridad (DevSec): razonamiento sobre parches de código, ingeniería de software agéntica con trazas de shell y bash, corrección de vulnerabilidades en C/C++ y desarrollo frontend en React/TypeScript. Para ello se apoya en cuatro corpus públicos: nvidia/Open-SWE-Traces (1767 trayectorias retenidas), un dataset de pares de parches seguros en C/C++ de prabhatl0dhi (300 trayectorias), OpenThoughts3-1.2M (284 trayectorias) y un dataset de desarrollo frontend de runanlab (200 trayectorias).

La relevancia del artefacto es doble: por un lado demuestra un flujo de especialización económica (LoRA de rango 16 sobre atención, con contexto de entrenamiento de 8192 tokens) sobre un MoE de 12B; por otro, su model card es explícita sobre las limitaciones metodológicas de la evaluación, que no constituye un benchmark independiente tipo SWE-bench o Terminal-Bench. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y un tamaño declarado de 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente subidos o que el conteo aún no se ha actualizado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (MoE) con adaptador LoRA sobre atención; modelo base JetBrains/Mellum2.1-12B-A2.5B-Thinking |
| Parámetros totales | ~12 000 millones (modelo base); el adaptador LoRA añade un conjunto reducido de pesos de bajo rango |
| Parámetros activos | ~2500 millones (modelo base, según nomenclatura A2.5B) |
| Longitud de contexto | 8192 tokens durante el entrenamiento del adaptador; contexto nativo del base no disponible en la información proporcionada |
| Tipos de cuantización | no disponible (el adaptador se entrena y publica en BF16; no se documentan cuantizaciones del adaptador) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base fijado en la revisión `92ddae9fc7665e9f801d141d2e5a6b2caf2460c4` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un modelo base MoE de aproximadamente 12B parámetros totales y 2.5B activos. El ajuste congela el modelo base en BF16 y entrena exclusivamente adaptadores LoRA de rango 16 y alpha 32 sobre las proyecciones de atención `q_proj`, `k_proj`, `v_proj` y `o_proj`. Los pesos de expertos y del router permanecen congelados, de modo que la especialización se produce en el mecanismo de atención y no en la capacidad de enrutamiento del MoE. La tasa de aprendizaje es 1e-05, con microbatch 1, acumulación de gradientes 16 y una sola pasada como máximo sobre los ejemplos preparados.

La receta `reasoning-v2` selecciona objetivos de razonamiento y respuesta directa, y la pérdida cubre únicamente la respuesta del asistente seleccionada (razonamiento, llamada a herramienta, respuesta final y EOS); los mensajes previos y las observaciones de herramientas son solo contexto. Cada conversación fuente debe caber completa, sin truncamiento que genere JSON de herramienta parcial. Se extraen como máximo cuatro objetivos de asistente por tarea, incluyendo siempre la respuesta final, y los grupos de tareas completos se mantienen en un mismo split para evitar filtración. Se emplea una cabeza de salida congelada y troceada (chunked) para reducir el pico de memoria de entrenamiento sin alterar los objetivos causales. Se conservan el tokenizador, la plantilla de chat y el token EOS originales de Mellum.

Los datos provienen de cuatro fuentes con licencias de procedencia declaradas: Open-SWE-Traces (CC BY 4.0, 1767 trayectorias), el corpus de parches seguros C/C++ (MIT sobre la agregación, 300 trayectorias), OpenThoughts3-1.2M (Apache 2.0, 284 trayectorias) y el dataset frontend React/TypeScript (CC BY 4.0, 200 trayectorias). La model card advierte que las licencias del dataset son procedencia, no una garantía de que cada fragmento de código subyacente haya sido depurado, y que el corpus crudo no se redistribuye.

## Capacidades

- Generación de código y razonamiento sobre algoritmos, con un modo de pensamiento (thinking) heredado del modelo base.
- Razonamiento agéntico de ingeniería de software: las trazas de Open-SWE incluyen acciones de bash y resultados observados, adaptadas al esquema de herramientas de Pi.
- Llamada a herramientas (tool calling) y decisiones multi-paso sobre herramientas, con esquemas nativos preservados.
- Seguridad defensiva de código: corrección de vulnerabilidades en pares de funciones C/C++ a partir de fixes registrados.
- Desarrollo frontend en React/TypeScript, a partir de trazas de desarrollo frontend.
- Razonamiento matemático y de propósito general, vía OpenThoughts3.
- Soporte multilingüe: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Revisión de seguridad de código C/C++: el adaptador se entrenó con pares de funciones vulnerables y sus correcciones, por lo que puede proponerse como asistente de parcheo defensivo en pipelines de revisión, siempre con validación humana y ejecución de tests reales.
- Agente de ingeniería de software sobre terminal: las trazas de Open-SWE incluyen comandos bash y sus resultados, lo que permite usarlo como planificador de acciones de shell en entornos de desarrollo, con la cautela de que las interacciones de shell se adaptaron al esquema de Pi y no se replicaron los entornos.
- Generación de parches en flujos de CI/CD: puede integrarse como generador de candidatos de parche que luego pasan por compilación y tests, dado que la model card advierte explícitamente que la evaluación no ejecuta el código generado.
- Asistencia a desarrollo frontend: especialización en React/TypeScript para generación de componentes y lógica de interfaz, aprovechando el corpus de desarrollo frontend.
- Razonamiento algorítmico con modo thinking: útil en tareas de análisis y explicación de algoritmos donde se quiere una cadena de razonamiento explícita antes de la respuesta, con presupuesto de tokens controlado.
- Investigación sobre especialización LoRA en MoE: el adaptador sirve como caso de estudio reproducible de ajuste de atención con expertos congelados, con receta, revisiones de dataset y diagnósticos publicados.
- Evaluación de robustez y detención (stopping): la model card incluye diagnósticos de EOS, cutoff y repetición, lo que lo hace útil para estudiar bucles de razonamiento en modelos con thinking.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, SWE-bench, Terminal-Bench) en la información disponible. La model card remite a `evaluation_summary.json` para pérdida held-out, sondas de protocolo pre/post y diagnósticos pareados de razonamiento, y advierte explícitamente que esas sondas autorales no son benchmarks independientes ni pueden establecer una mejora general de razonamiento o eliminar el looping.

## Requisitos de hardware

- El adaptador LoRA en sí es pequeño, pero requiere cargar el modelo base completo de ~12B parámetros: el recuento de parámetros activos (2.5B) no determina la memoria necesaria para los pesos almacenados, como señala la model card.
- VRAM estimada para inferencia en BF16: aproximadamente 24 GB solo para pesos del base, más caché KV y overhead; en la práctica se recomienda 40-80 GB para contexto de 8192 tokens.
- GPU recomendadas: A100 40/80 GB, H100, o configuraciones multi-GPU con `device_map="auto"`.
- En GPU de consumo: no cabe en BF16 en una RTX 4090 (24 GB) sin cuantización del base; no se documentan cuantizaciones oficiales del adaptador.
- Despliegue: la carga documentada usa `transformers==5.22.1` y `peft==0.21.2` con `attn_implementation="sdpa"`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mellum2.1-12B-A2.5B-Thinking-DevSec (este) | ~12B totales / ~2.5B activos + LoRA | 8192 (entrenamiento) | Código, DevSec, agentes SWE, frontend | Apache 2.0 | Adaptador PEFT; requiere base fijado |
| JetBrains/Mellum2.1-12B-A2.5B-Thinking (base) | ~12B totales / ~2.5B activos | no disponible | Código y razonamiento general | no disponible en la información | Modelo base en HuggingFace |
| Alternativas de código de ~7-14B | no disponible | no disponible | Código | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre este adaptador y otras alternativas; la model card no incluye comparaciones con modelos de la competencia.

## Limitaciones y advertencias

- La evaluación son sondas autorales y holdouts de las fuentes, no SWE-bench, Terminal-Bench, benchmarks de ciberseguridad, frontend ni Pi en vivo; no puede establecer mejora general de razonamiento ni eliminar el looping.
- La suite de diagnóstico nunca ejecuta el código generado ni comandos de shell, por lo que no hay evidencia de corrección funcional de los parches.
- Los pares de funciones de seguridad usan fixes registrados, no trazas de razonamiento, y no fueron compilados de forma independiente.
- Las interacciones de shell se adaptaron al esquema bash de Pi; no hay evidencia de cobertura de todas las herramientas o backends de Pi.
- Los entornos agénticos convertidos no se replicaron; las trayectorias largas que no caben en el contexto se excluyen sin truncar.
- Riesgo de alucinación y de bucles de razonamiento: la model card recomienda medir la finalización real de tareas y la detención en tareas nuevas antes de desplegar.
- Las licencias de los datasets son procedencia, no una depuración legal de cada fragmento de código subyacente; las licencias originales de los repositorios siguen aplicando.
- El repositorio muestra 0 descargas, 0 likes y tamaño de 0.0 GB, lo que puede indicar que los pesos no están efectivamente disponibles; conviene verificar antes de depender de él.
- No se documentan idiomas soportados, cuantizaciones ni rendimiento medido.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Nullmega/Mellum2.1-12B-A2.5B-Thinking-DevSec
- Modelo base: https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking
- Dataset Open-SWE-Traces: https://huggingface.co/datasets/nvidia/Open-SWE-Traces
- Dataset C/C++ Patch for Secure Code LLMs: https://huggingface.co/datasets/prabhatl0dhi/C_C_plus_plus_Patch_Dataset_for_Secure_Code_LLMs
- Dataset OpenThoughts3-1.2M: https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M
- Dataset frontend development: https://huggingface.co/datasets/runanlab/gpt-5.4-frontend-development-11062026
