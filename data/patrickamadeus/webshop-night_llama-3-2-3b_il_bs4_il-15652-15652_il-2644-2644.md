# patrickamadeus/webshop-night_Llama-3.2-3B_IL_bs4_IL.15652.15652_IL.2644.2644

## Resumen

webshop-night_Llama-3.2-3B_IL_bs4_IL.15652.15652_IL.2644.2644 es un ajuste fino completo (full fine-tune) del modelo meta-llama/Llama-3.2-3B-Instruct realizado por el usuario patrickamadeus. El modelo está especializado en la tarea de WebShop, un entorno de comercio electrónico simulado en el que un agente debe navegar por un sitio web y completar objetivos de compra expresados en lenguaje natural. El sufijo del nombre codifica el protocolo de entrenamiento: benchmark `webshop-night`, arquitectura de aprendizaje `IL` (imitation learning sobre filas de experto estado-acción) y dos etapas de entrenamiento completas (15.652 y 2.644 pasos respectivamente).

El modelo forma parte de un experimento de investigación sobre "experiencia temprana" e "imaginación" en agentes, vinculado al repositorio github.com/patrickamadeus/imagined-experience y a un paper titulado "Early Experience" (Tabla 1). La variante aquí publicada corresponde al brazo de imitación pura (IL) del experimento, es decir, el modelo aprende a replicar las acciones de un experto sin modelado explícito del mundo ni auto-reflexión.

Con 3.212.749.824 parámetros y un contexto de entrenamiento de 4.096 tokens, se trata de un modelo pequeño orientado a investigación, no a producción general. Su relevancia radica en ser un artefacto reproducible de un estudio comparativo sobre cómo distintas estrategias de entrenamiento (imitación, modelado implícito del mundo, auto-reflexión) afectan al rendimiento en tareas de agente web. La model card reporta una tasa de éxito del 36,0 % en el conjunto estándar y del 31,0 % en un conjunto limpio, por debajo de las cifras del paper para las otras variantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud máxima de entrenamiento) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en bf16) |
| Idiomas soportados | no disponible (heredados del modelo base Llama-3.2-3B-Instruct, no verificados) |
| Licencia | llama3.2 |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Llama-3.2-3B-Instruct |
| Tamano del repo | 12,9 GB |
| Metodo de ajuste | SFT full fine-tune (LlamaFactory) |
| Etapas de entrenamiento | 2 (15.652 y 2.644 pasos) |
| Batch efectivo | 4 filas por paso |
| Learning rate | 1e-5, cosine, 3 % warmup por etapa |
| Precision | bf16, paged AdamW 8-bit |
| Seed | 0 |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del transformer decoder-only de Llama 3.2 3B, sin modificaciones estructurales: se trata de un ajuste fino completo de todos los pesos, no de un adaptador LoRA ni de una destilación. El entrenamiento se realizó con LlamaFactory en modo SFT, con learning rate 1e-5, schedule cosine con 3 % de warmup por etapa, precisión bf16, optimizador paged AdamW de 8 bits y longitud máxima de 4.096 tokens.

Los datos de entrenamiento son filas de experto (estado → acción) extraídas de 1.110 tareas del setup "night-1" de WebShop, con datos de world-model generados a partir de un rewind propio. La etapa 1 ejecuta 15.652 pasos sobre 10.576 filas (5,92 épocas) partiendo del modelo base; la etapa 2 ejecuta 2.644 pasos sobre las mismas filas (1,00 época) partiendo de la etapa 1. El nombre del checkpoint indica que ambas etapas están completas (los dos números de cada bloque `LABEL.step.steps` coinciden). No se reporta uso de RLHF ni DPO; el paradigma es imitación supervisada pura.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Llama-3.2-3B-Instruct.
- Ejecución de tareas de agente web en el entorno WebShop: interpretar objetivos de compra en lenguaje natural y emitir acciones de navegación (clic, búsqueda, selección de producto).
- Aprendizaje por imitación de políticas expertas: el modelo está entrenado para replicar trayectorias de un agente experto en el dominio WebShop.
- Seguimiento de instrucciones conversacionales, gracias a la inicialización desde una variante Instruct.
- No se documenta soporte explícito de tool calling ni de function calling más allá de lo que el modelo base pudiera ofrecer.
- No se documenta capacidad de visión, audio ni modo de razonamiento extendido (thinking mode).
- Capacidades multilingües: no verificadas ni documentadas para este ajuste.

## Casos de uso

- Investigación en aprendizaje por imitación para agentes: el modelo sirve como brazo de control (IL puro) en experimentos que comparan imitación con modelado implícito del mundo y auto-reflexión, permitiendo reproducir la Tabla 1 del paper "Early Experience".
- Reproducción de experimentos de agente web: al estar publicados los checkpoints exactos y el protocolo de entrenamiento (pasos, épocas, hiperparámetros), se puede auditar la reproducibilidad del pipeline de WebShop night-1.
- Generación de trayectorias sintéticas de navegación: el modelo puede producir secuencias estado-acción plausibles para aumentar datos de entrenamiento de otros agentes en dominios de comercio electrónico simulado.
- Evaluación de robustez en entornos de agente: sirve para medir la brecha entre el conjunto estándar (36,0 %) y el conjunto limpio sin tareas de entrenamiento liberadas (31,0 %), útil para estudiar sobreajuste a tareas vistas.
- Estudio de dinámicas de entrenamiento multi-etapa: la estructura de dos etapas con recuento de épocas explícito permite analizar el efecto de continuar el entrenamiento sobre las mismas filas de experto.
- Base para ajustes posteriores en dominios de agente: al ser un full fine-tune de Llama-3.2-3B, puede servir como punto de partida para otros entornos de agente con objetivos de compra o navegación.

## Benchmarks y rendimiento

Resultados reportados en la model card para WebShop, temperatura 0,4, 15 pasos, con intervalo de confianza del 95 %:

| Conjunto de test | Tasa de exito (%) | IC 95 % |
|---|---|---|
| Objetivos estándar 0-499 | 36,0 | 31,8-40,2 |
| Conjunto limpio (500 objetivos sin tarea de entrenamiento liberada) | 31,0 | 27,0-35,0 |

Cifras del paper "Early Experience" (Tabla 1, Llama-3.2-3B, WebShop) para comparar los brazos del experimento:

| Estrategia | Tasa de exito (%) |
|---|---|
| Imitación (IL) | 41,8 |
| Modelado implícito del mundo | 60,2 |
| Auto-reflexión | 52,7 |

Nota: la cifra de 41,8 del paper para imitación no coincide exactamente con el 36,0 reportado en la model card para este checkpoint concreto; la model card no explica la discrepancia (posiblemente por diferencias de evaluación, temperatura o checkpoint). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 6,5-7 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 10-12 GB para contextos de 4.096 tokens.
- VRAM estimada en cuantización de 8 bits: alrededor de 3,5-4 GB de pesos; en 4 bits, alrededor de 2-2,5 GB.
- GPU recomendadas: A100, H100 o L40S para entrenamiento o evaluación a gran escala; RTX 4090, RTX 3090 o RTX 4080 para inferencia en bf16.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en bf16, y en GPUs con 8 GB o más si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama son viables al ser un transformer Llama estándar; los pesos publicados son safetensors, por lo que para llama.cpp/Ollama habría que convertirlos a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WebShop (IL) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (webshop-night IL) | 3,21 B | 4.096 | 36,0 % estándar / 31,0 % limpio | llama3.2 | Hugging Face |
| Llama-3.2-3B-Instruct (base) | 3,21 B | 128 K (modelo base) | no evaluado en WebShop | llama3.2 | Hugging Face |
| Brazo "implicit world modeling" del paper | 3,21 B | 4.096 | 60,2 % (paper) | no disponible | no disponible públicamente en la información dada |
| Brazo "self-reflection" del paper | 3,21 B | 4.096 | 52,7 % (paper) | no disponible | no disponible públicamente en la información dada |

La comparación más directa es con los otros brazos del mismo experimento, que superan a esta variante de imitación pura en 9,2 y 16,7 puntos porcentuales respectivamente según el paper. Frente al modelo base, la comparación en WebShop no está disponible porque el base no fue evaluado en esa tarea según la información proporcionada.

## Limitaciones y advertencias

- Rendimiento limitado en su dominio objetivo: 36,0 % de éxito en el conjunto estándar y 31,0 % en el conjunto limpio, por debajo de otras estrategias del mismo paper (60,2 % y 52,7 %).
- Brecha entre conjunto estándar y limpio (5 puntos) que sugiere cierto sobreajuste a las tareas de entrenamiento o memorización parcial.
- Especialización estrecha: el ajuste está orientado a WebShop night-1; su utilidad fuera de ese entorno no está documentada y probablemente sea inferior a la del modelo base.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar acciones o justificaciones plausibles pero incorrectas; en un entorno de agente esto se traduce en trayectorias fallidas.
- Sesgos: no se documenta ningún análisis de sesgos; al heredar el modelo base, arrastra los sesgos de Llama-3.2-3B-Instruct.
- Idiomas: no se documenta qué idiomas mantiene tras el ajuste; el entrenamiento en WebShop es presumiblemente en inglés.
- Licencia llama3.2: impone restricciones de uso comercial y obligaciones de atribución ("Built with Llama"); es necesario revisar los términos completos de la licencia Llama 3.2 antes de cualquier uso en producción.
- Contexto limitado a 4.096 tokens en entrenamiento, muy por debajo de los 128 K del modelo base; no se garantiza un comportamiento correcto más allá de esa longitud.
- Modelo de investigación con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- El nombre del checkpoint y la lógica de etapas requieren interpretación manual; un consumidor desprevenido podría cargar un snapshot intermedio si no verifica que los dos números de cada bloque coinciden.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/patrickamadeus/webshop-night_Llama-3.2-3B_IL_bs4_IL.15652.15652_IL.2644.2644
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Repositorio del proyecto: https://github.com/patrickamadeus/imagined-experience
- Convención de nombres y campos (referenciada en la model card): `HF_UPLOAD.md` dentro del repositorio anterior
- Paper "Early Experience" (Tabla 1): referencia citada en la model card, sin URL directa disponible en la información proporcionada
