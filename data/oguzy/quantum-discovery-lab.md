# oguzY/quantum-discovery-lab

## Resumen

Quantum Discovery Lab es un adaptador LoRA entrenado mediante GRPO (Group Relative Policy Optimization) sobre el modelo base `unsloth/phi-4-bnb-4bit`, una versión cuantizada a 4 bits de Phi-4 de Microsoft. Lo desarrolla oguzY, estudiante de Nanotecnología en la Universidad Sivas Cumhuriyet, con el objetivo de generar hipótesis en dominios de física computacional poco explorados: síntesis de materiales, estructuras cuánticas y partículas atómicas. El repositorio publicado contiene únicamente el checkpoint del paso 250 de entrenamiento (`c250`); el resto de checkpoints y el código de simulación están alojados fuera de HuggingFace.

El modelo hereda la arquitectura transformer densa de Phi-4 (aproximadamente 14.700 millones de parámetros) y añade un adaptador PEFT de tipo LoRA entrenado con aprendizaje por refuerzo. La innovación principal no está en la arquitectura sino en la función de recompensa: incorpora un verificador de novedad que otorga puntos extra a hipótesis físicas que el modelo no había generado previamente, combinado con simulaciones en QuSpin, Kwant, QuTiP y ASE para evaluar la plausibilidad física de las propuestas.

Es relevante como ejemplo temprano de aplicación de RL con recompensas basadas en simulación física a un modelo abierto de tamaño medio, y como caso práctico de fine-tuning con Unsloth y GRPO en un contexto académico. No obstante, el propio autor advierte que los resultados demuestran aprendizaje pero no garantizan que las hipótesis generadas sean físicamente correctas ni viables en el mundo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Phi-4) con adaptador LoRA entrenado mediante GRPO |
| Parametros totales | No disponible en la información proporcionada (el modelo base Phi-4 tiene ~14.7B; el adaptador LoRA añade un subconjunto no especificado) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (Phi-4 soporta 16K tokens; no confirmado para este adaptador) |
| Tipos de cuantizacion | El modelo base está en 4 bits (bnb-4bit); el adaptador se distribuye en safetensors. Otras cuantizaciones no disponibles |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el base model en bnb-4bit |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Phi-4, un transformer decoder-only denso de Microsoft con aproximadamente 14.700 millones de parámetros, conocido por su rendimiento en matemáticas y ciencias naturales. El entrenamiento se realizó con GRPO, un algoritmo de optimización de política proximal grupal que genera múltiples respuestas por prompt y las compara dentro del grupo para estimar la ventaja, sin necesidad de un modelo crítico separado. Se utilizó la librería Unsloth para el fine-tuning eficiente en memoria sobre la versión cuantizada a 4 bits del modelo base.

El dataset de entrenamiento es `oguzY/synthetic-quantum-discovery`, de composición no detallada en la información disponible. La innovación técnica clave reside en la función de recompensa: además de las simulaciones físicas ejecutadas con QuSpin, Kwant, QuTiP y ASE, se incorpora un verificador de novedad que premia hipótesis que el modelo no había propuesto antes, incentivando la exploración de regiones del espacio de hipótesis no cubiertas. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas adicionales de RLHF o DPO.

## Capacidades

- Generación de texto en inglés con orientación a razonamiento científico y matemático, heredada de Phi-4.
- Generación de hipótesis en física computacional: síntesis de materiales, estructuras cuánticas y partículas atómicas.
- Formulación de propuestas que pueden evaluarse mediante simuladores de física (QuSpin, Kwant, QuTiP, ASE), aunque el modelo en sí no ejecuta las simulaciones.
- Razonamiento multi-paso orientado a problemas científicos, reforzado mediante GRPO.
- Generación de código de simulación física (el autor menciona código de simulación en los archivos del proyecto, no incluido en el repositorio).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- **Generación de hipótesis para síntesis de materiales**: el modelo propone combinaciones y estructuras candidatas que un investigador puede evaluar después con simuladores como ASE o Kwant, acelerando la fase de exploración inicial en laboratorios con recursos limitados.
- **Exploración de estructuras cuánticas**: dado un dominio de parámetros (por ejemplo, Hamiltonianos de espín), el modelo sugiere configuraciones y fenómenos a estudiar, que luego se validan con QuSpin o QuTiP antes de cualquier experimento real.
- **Asistencia en docencia e investigación universitaria**: como herramienta de brainstorming para estudiantes de física que necesitan generar líneas de investigación o problemas abiertos sobre los que trabajar.
- **Generación de código de simulación física**: el modelo puede producir esqueletos de scripts para QuTiP, Kwant o ASE que el investigador revisa y ejecuta, reduciendo el tiempo de escritura de código repetitivo.
- **Prototipado de pipelines de descubrimiento con RL**: sirve como referencia para equipos que quieran replicar el enfoque de GRPO con recompensas basadas en simulación en otros dominios científicos.
- **Análisis de novedad en literatura científica**: combinado con un verificador de novedad externo, puede usarse para generar propuestas y filtrar las que ya existen en la literatura, como paso previo a la revisión manual.
- **Educación en técnicas de RL aplicado**: caso de estudio para cursos de machine learning que quieran mostrar un pipeline completo de LoRA + GRPO + recompensa basada en dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye gráficas de entrenamiento (curvas de recompensa y métricas del proceso GRPO) pero no tablas con MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros modelos. El autor indica únicamente que "los resultados muestran que se pudo enseñar algo al modelo", sin cuantificar.

## Requisitos de hardware

- **VRAM para inferencia del adaptador solo**: el adaptador LoRA es ligero (repo de 0,5 GB), pero requiere cargar el modelo base Phi-4 en 4 bits, lo que supone aproximadamente 8-10 GB de VRAM solo para los pesos cuantizados, más overhead de activaciones y KV cache.
- **GPU recomendadas**: para el modelo base en 4 bits, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente para inferencia con contexto moderado. Para mayor throughput o contextos largos, A100 (40/80 GB) o H100.
- **¿Cabe en GPU consumer?**: sí, en GPUs con 12-16 GB o más usando cuantización 4-bit del base model, siempre que se gestione bien la KV cache. En GPUs de 8 GB es probable que no quepa con contexto largo.
- **Opciones de despliegue**: al ser un adaptador PEFT, se puede cargar con `transformers` + `peft` sobre el base model cuantizado. Para servir en producción, vLLM y TGI soportan adaptadores LoRA, aunque la compatibilidad con el base en bnb-4bit puede requerir configuración adicional. llama.cpp y Ollama requerirían fusionar el adaptador con el base y convertir a GGUF, proceso no documentado en la información disponible.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Quantum Discovery Lab (este) | Base ~14.7B + LoRA | No disponible | GRPO + recompensa física | MIT | HuggingFace (solo checkpoint c250) |
| Phi-4 (Microsoft) | ~14.7B | 16K | Transformer denso, matemáticas/ciencias | MIT | HuggingFace, Azure |
| Qwen2.5-14B-Instruct | ~14.7B | 32K | Transformer denso, uso general | Apache 2.0 | HuggingFace |
| DeepSeek-R1-Distill-Qwen-14B | ~14.7B | 64K | Destilación de razonamiento | MIT | HuggingFace |

La comparación directa es limitada porque Quantum Discovery Lab es un adaptador especializado, no un modelo completo con benchmarks publicados. Frente a Phi-4 base, añade el sesgo hacia hipótesis de física computacional pero no documenta mejoras cuantificadas. Frente a Qwen2.5-14B o DeepSeek-R1-Distill, carece de evaluaciones estándar y de soporte multilingüe amplio.

## Limitaciones y advertencias

- **Hipótesis no validadas**: el propio autor advierte que el modelo no descubre cosas que no existen y que sus hipótesis no son necesariamente correctas físicamente ni viables en el mundo real. Cualquier uso requiere validación posterior con simulación o experimento.
- **Solo checkpoint c250**: el repositorio contiene únicamente el modelo del paso 250; no se publican los checkpoints intermedios ni el código de simulación y función de recompensa (alojados en el sitio personal del autor).
- **Idioma**: solo inglés; no hay soporte documentado de castellano ni otros idiomas.
- **Sesgos**: no documentados. Al estar entrenado sobre un dataset sintético de física y sobre Phi-4, puede heredar sesgos del base model y del dataset, no evaluados.
- **Riesgo de alucinación**: alto en un dominio donde el modelo puede generar hipótesis plausibles pero físicamente incorrectas; la función de novedad premia lo nuevo, no lo correcto.
- **Licencia MIT**: permite uso comercial, pero el modelo base Phi-4 también es MIT, por lo que no hay restricciones adicionales conocidas. Aun así, conviene verificar la licencia del dataset sintético y de las librerías de simulación referenciadas.
- **Producción**: no recomendado como sistema autónomo de descubrimiento; sí como generador de candidatos dentro de un pipeline con validación humana y simulación.
- **Compatibilidad de despliegue**: al ser un adaptador PEFT sobre un base cuantizado a 4 bits, la integración con servidores de inferencia estándar puede requerir pasos adicionales no documentados.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/oguzY/quantum-discovery-lab
- Sitio del autor con código de simulación y función de recompensa: https://oguzyesil.dev
- Dataset de entrenamiento: https://huggingface.co/datasets/oguzY/synthetic-quantum-discovery
- Modelo base: https://huggingface.co/unsloth/phi-4-bnb-4bit
- Unsloth: https://github.com/unslothai/unsloth
- QuSpin: https://quspin.github.io/QuSpin/
- Kwant: https://kwant-project.org/
- QuTiP: https://qutip.org/
- ASE (Atomic Simulation Environment): https://wiki.fysik.dtu.dk/ase/
