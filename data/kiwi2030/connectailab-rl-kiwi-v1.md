# kiwi2030/connectailab-rl-kiwi-v1

## Resumen

connectailab-rl-kiwi-v1 es un adaptador LoRA de tipo PEFT sobre el modelo base Qwen/Qwen3.5-0.8B, entrenado para una tarea muy concreta: leer un problema de decisión empresarial (estado, pregunta y opciones) y devolver exactamente una letra que identifica la opción elegida. No es un modelo conversacional de propósito general, sino un clasificador de decisión de un solo token de salida, cuyo pipeline declarado en HuggingFace es `reinforcement-learning`. Lo desarrolla el autor `kiwi2030` en el contexto del laboratorio educativo CONNECT AI LAB × AI CITY BUILDERS, ligado al simulador de empresas "Connect Tycoon".

El modelo resuelve el problema de tomar decisiones secuenciales dentro de un simulador de gestión de empresa, donde cada mes se plantea una decisión con varias alternativas y el objetivo es maximizar el beneficio y minimizar el arrepentimiento (regret) acumulado. Su relevancia es más investigadora y didáctica que productiva: ilustra un flujo completo de aprendizaje por refuerzo combinado con supervisión sobre un modelo de lenguaje pequeño (0,8 mil millones de parámetros base).

Arquitectónicamente hereda la estructura del transformer de Qwen3.5-0.8B y añade pesos LoRA entrenados mediante supervisión (SFT) seguida de aprendizaje por refuerzo con GRPO. El repositorio pesa 0,0 GB, coherente con un adaptador que solo almacena las matrices LoRA más el tokenizador y la configuración PEFT, no los pesos completos del modelo base. El idioma declarado es coreano (ko).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con adaptador LoRA (PEFT) sobre Qwen/Qwen3.5-0.8B |
| Parametros totales | 0,8 mil millones en el modelo base; adaptador LoRA de pequeno tamano (cifra exacta no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se publican como adaptador en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Coreano (ko) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA acoplado a Qwen/Qwen3.5-0.8B, por lo que su arquitectura subyacente es la de un transformer decoder de 0,8 mil millones de parámetros. No se modifica la arquitectura del modelo base; el ajuste se realiza mediante matrices de bajo rango insertadas en las capas, con la librería `peft`. La tarea formulada es de clasificación restringida: dado un `state`, una `question` y una lista de `options`, la salida es una única letra.

El entrenamiento se describe en cuatro etapas. Primero, un simulador de empresa entrena una política pequeña mediante PPO, que actúa como "profesor". Segundo, se genera un conjunto de problemas reejecutando cada mes del simulador con las opciones alteradas para asignar una puntuación a cada alternativa. Tercero, se aplica aprendizaje supervisado (SFT) para imitar la opción con mayor puntuación. Cuarto, se aplica aprendizaje por refuerzo con GRPO sobre el conjunto de opciones (normalización del grupo con ventaja y término KL respecto al modelo de partida). El conjunto de datos declarado contiene 4.082 ejemplos de entrenamiento, 832 de validación y 840 de test, con una distribución de empresa de tipo `general` ajustada a datos públicos.

## Capacidades

- Toma de decisiones de opción única: lee un estado, una pregunta y una lista de opciones, y devuelve la letra de la opción elegida.
- Salida restringida a una letra: el prompt de sistema exige devolver únicamente la letra, sin explicación.
- Modelado de probabilidad por opción: la probabilidad de cada letra puede interpretarse como la confianza relativa en cada alternativa.
- Uso dentro del simulador Connect Tycoon para la gestión mensual de una empresa sintética.
- Comprensión de texto de entrada en coreano (idioma declarado).
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo "thinking".
- No se documentan capacidades multilingües más allá del coreano.

## Casos de uso

- Investigación en aprendizaje por refuerzo con modelos de lenguaje: sirve como ejemplo reproducible de un flujo PPO (profesor) → SFT → GRPO sobre un modelo pequeño, útil para estudiar cómo cambia la política de decisión entre etapas.
- Simulación y evaluación de políticas de decisión: integrar el modelo como agente decisor dentro de Connect Tycoon u otro simulador compatible para comparar su arrepentimiento y beneficio mensual frente a la política profesora.
- Docencia de RL y fine-tuning: al ser un adaptador LoRA ligero sobre un modelo de 0,8B, es adecuado como material didáctico en cursos de aprendizaje por refuerzo y ajuste eficiente de parámetros.
- Estudio de calibración de decisiones: al exponer probabilidades por opción, permite analizar la confianza del modelo frente a la calidad real de cada alternativa.
- Prototipado de asistentes de decisión acotados: en dominios donde las opciones están predefinidas (por ejemplo, selección entre variantes de una acción), puede adaptarse como clasificador de elección, siempre con validación sobre datos propios.
- Experimentación educativa sobre datos sintéticos: dado que el dataset se genera con un simulador, es útil para estudiar sesgos y artefactos de entrenamiento con datos sintéticos antes de escalar a datos reales.

## Benchmarks y rendimiento

Resultados publicados en la model card (todos sobre el simulador y el conjunto de test descrito):

| Modelo | Precision en test | Regret (menor es mejor) | Beneficio mensual en simulador | Reduccion de perdidas en operaciones reales |
|---|---|---|---|---|
| Qwen antes del entrenamiento | 33,7% | 4,76 | — | — |
| Aprendizaje supervisado (SFT) | 84,2% | 3,03 | — | — |
| Aprendizaje por refuerzo (GRPO) | 83,6% | 3,04 | 10.030.000 KRW | 37% (91/177) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El propio autor advierte que la evaluacion de gestión empresarial se basa en una media de dos meses no vistos, con un tamaño de muestra pequeno, y que el modelo aún queda por debajo de la política profesora del simulador.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,8 mil millones de parámetros en precisión completa (fp16) ocupa del orden de 1,6 GB de pesos; el adaptador LoRA añade un coste marginal. La VRAM real depende del runtime, la longitud de contexto y el lote. Cifras exactas de la ficha: no disponibles.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM libre puede cargar el modelo base en fp16; no se especifican GPU concretas en la informacion disponible.
- Compatibilidad con GPU de consumo: por tamano (0,8B), es previsible que quepa en GPU de consumo como las de la gama RTX 3060/4060/4090, aunque no se confirma en la documentacion.
- Opciones de despliegue: al ser un adaptador PEFT, el despliegue se realiza cargando el modelo base con `transformers` y aplicando `peft.PeftModel.from_pretrained`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han proporcionado modelos comparables en la informacion disponible. Se trata de un adaptador especializado en decisión de opción única, no de un modelo de propósito general, por lo que la comparación directa con LLMs estándar no es homogénea. El único punto de referencia documentado es el propio modelo base Qwen/Qwen3.5-0.8B antes del ajuste (33,7% de precisión en la tarea de decisión frente al 83,6% del adaptador tras GRPO).

## Limitaciones y advertencias

- Modelo de investigación y uso educativo: el propio autor indica que es un modelo sobre un simulador sintético y recomienda revalidarlo con los registros reales de cada empresa antes de usarlo para decisiones de gestión.
- Rendimiento inferior a la política profesora: el propio autor reconoce que el modelo queda por debajo de la política PPO del simulador.
- Muestra de evaluacion pequena: el beneficio mensual se mide sobre una media de solo dos meses no vistos, por lo que la cifra tiene alta varianza.
- Salida restringida: el modelo está diseñado para devolver una única letra; no debe esperarse texto libre, explicaciones ni razonamiento.
- Idioma: solo se declara coreano (ko); el rendimiento en otros idiomas no está documentado.
- Riesgo de alucinacion en el sentido de elegir opciones fuera del conjunto proporcionado o letras inválidas: no se documenta ningún mecanismo de validación de salida.
- Sesgos: al entrenarse sobre un simulador con distribución de empresa `general` ajustada a datos públicos, puede heredar los sesgos de esos datos y del propio simulador. No se detallan análisis de sesgo.
- Licencia: apache-2.0, que en principio permite uso comercial, pero conviene verificar también la licencia del modelo base Qwen/Qwen3.5-0.8B antes de un despliegue comercial.
- Incoherencia en la documentacion: el identificador del repositorio es `kiwi2030/connectailab-rl-kiwi-v1`, mientras que el ejemplo de código de la model card referencia `Godog2026/connectailab-rl-kiwi-v1`; conviene verificar la ruta correcta al cargar el modelo.
- Validacion de flujo de trabajo: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el propio autor etiqueta el experimento como "en pruebas".
- Contexto no especificado: no se publica la longitud de contexto soportada, lo que impide garantizar el manejo de estados o preguntas largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio Connect Tycoon: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de entrenamiento (Colab): https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de aprendizaje por refuerzo: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Servicio ALBAKNOW: https://albaknow.com/
- Servicio MEETORY: https://meetory.kr/
