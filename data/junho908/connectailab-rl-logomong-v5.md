# junho908/connectailab-rl-logomong-v5

## Resumen

connectailab-rl-logomong-v5 es un adaptador LoRA de tipo reinforcement learning publicado por el usuario junho908 en HuggingFace, construido sobre el modelo base Qwen/Qwen3.5-0.8B. No es un modelo de lenguaje de propósito general, sino un modelo de toma de decisiones (decision-making) entrenado para resolver tareas de elección múltiple dentro de un simulador de gestión empresarial llamado CONNECT TYCOON. Recibe como entrada un estado, una pregunta y una lista de opciones etiquetadas, y devuelve únicamente la letra de la opción seleccionada.

El modelo se entrena en dos fases: primero un aprendizaje supervisado (SFT) sobre un "cuaderno de problemas" generado por un profesor consistente en una política pequeña entrenada con PPO en el simulador, y después una fase de reinforcement learning con GRPO que ajusta las probabilidades de las opciones según la puntuación obtenida en el simulador. El resultado es un adaptador de rango 8 con licencia Apache 2.0, orientado a inferencia local en Mac mediante MLX.

Es relevante como ejemplo de aplicación de RL a modelos pequeños (0.8B parámetros) para tareas de decisión estructurada, aunque sus propios resultados muestran que la rentabilidad del agente no es estable: el modelo seleccionado obtiene pérdidas medias en el conjunto de validación independiente. Su alcance es educativo y de investigación, no de producción empresarial real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen/Qwen3.5-0.8B) con adaptador LoRA de rango 8 |
| Parametros totales | No disponible (modelo base de 0.8B; el adaptador LoRA añade un número no especificado de parámetros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (formato nativo MLX; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | Adaptador LoRA en formato MLX (carpeta `adapter/`), más `brain.json` con la política del profesor |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer denso de 0.8 mil millones de parámetros, sobre el que se aplica un adaptador LoRA de rango 8. El entrenamiento se realiza íntegramente en MLX (Apple Silicon), lo que implica que los resultados numéricos no coinciden necesariamente con una implementación equivalente en CUDA/PyTorch. El pipeline declarado es `reinforcement-learning` y las etiquetas incluyen GRPO, PPO, Gymnasium y LoRA.

El proceso de entrenamiento tiene cuatro etapas documentadas por el autor: (1) una política pequeña se entrena con PPO durante miles de meses simulados en CONNECT TYCOON y actúa como profesor; (2) se genera un cuaderno de problemas reejecutando cada mes del simulador con cada opción alternativa para puntuar cada elección; (3) SFT sobre las opciones de mayor puntuación (1 epoch, lr 1e-4, batch efectivo 8, micro batch 4, LoRA rank 8); (4) RL con GRPO (100 pasos, batch 8, lr 5e-6, beta 0.2, máximo 1.500 problemas) que normaliza las ventajas dentro del grupo de opciones y aplica una penalización KL contra el modelo de partida. El conjunto de datos comprende 4.082 problemas de entrenamiento, 832 de validación y 840 de test, con semillas separadas para cada partición. La selección del modelo final se hizo por beneficio medio en semillas de validación independientes (23000–23001), no por la puntuación del test.

## Capacidades

- Selección de una única opción entre varias, devolviendo solo la letra correspondiente (A, B, C, etc.), sin explicación.
- Interpretación de estados estructurados en JSON con campos `state`, `question` y `options` (cada opción con `label`, `key` y `description`).
- Toma de decisiones secuenciales en un entorno tipo Gymnasium (simulador de gestión empresarial).
- Robustez frente a instrucciones embebidas en el estado: el prompt de sistema indica explícitamente tratar el texto de `state` como datos y no como instrucciones.
- Capacidad de producir una distribución de probabilidad sobre las opciones (la probabilidad de cada letra actúa como confianza de la elección).
- No se documentan capacidades de generación de texto libre, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso general.

## Casos de uso

- Investigación en RL aplicado a modelos pequeños: el adaptador sirve como referencia reproducible de un pipeline SFT + GRPO sobre un modelo de 0.8B, con código, semillas y artefactos de validación publicados.
- Simulación de agentes económicos: integrado en CONNECT TYCOON o en un simulador propio, el modelo puede actuar como política de decisión para un agente que gestiona una empresa mes a mes.
- Evaluación de técnicas de alineación con preferencias: el uso de normalización de ventajas por grupo y penalización KL contra el modelo base permite estudiar el efecto del RL sobre la distribución de elecciones.
- Docencia y formación en reinforcement learning: el autor mantiene cursos y vídeos asociados, y el modelo sirve como ejemplo práctico de GRPO con recompensas derivadas de un simulador.
- Prototipado de asistentes de decisión estructurada: para dominios donde la respuesta correcta es una etiqueta discreta entre un conjunto cerrado, el patrón (estado + pregunta + opciones → letra) es reutilizable con datos propios.
- Experimentación en inferencia local con MLX: al ejecutarse en Apple Silicon mediante `mlx_lm`, permite probar adaptadores LoRA en portátiles Mac sin GPU dedicada.
- Generación de datos sintéticos de decisión: las probabilidades por opción pueden usarse para etiquetar o puntuar decisiones en un simulador de gestión.

## Benchmarks y rendimiento

Los únicos datos publicados son los del autor en la model card, medidos sobre el simulador CONNECT TYCOON con semillas de test 7000–7001 (2 meses) y validación independiente 23000–23001 (2 meses).

| Modelo | Acierto en test | Arrepentimiento (menor es mejor) | Beneficio mensual en simulador | Transacciones reales con tarjeta, pérdida reducida |
|---|---|---|---|---|
| Qwen antes del entrenamiento | 38,9 % | 3,49 | No disponible | No disponible |
| SFT | 65,1 % | 2,90 | -366 manwon | 37 % (91/177) |
| RL (GRPO) | 66,5 % | 2,88 | 541 manwon | 37 % (91/177) |

El propio autor indica que el modelo RL seleccionado obtiene un beneficio medio de -120,37 manwon al mes en el conjunto de validación independiente (23000–23001), es decir, pierde dinero. La comparación con el profesor JSON en las mismas dos semanas de test arroja 1.721,81 manwon para el profesor y 548,21 manwon para un "jefe basado en reglas". No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El modelo base es de 0.8B parámetros; en precisión de 16 bits ocuparía aproximadamente 1,6 GB de pesos, más el adaptador LoRA (rango 8) y el estado de inferencia.
- GPU recomendadas: el autor documenta ejecución en Mac con MLX (Apple Silicon). No se especifican GPU NVIDIA recomendadas.
- Compatibilidad con GPU de consumo: por tamaño, el modelo base de 0.8B debería caber en cualquier GPU de consumo con 4 GB o más de VRAM, aunque el adaptador está empaquetado en formato MLX y no se distribuyen pesos GGUF.
- Opciones de despliegue: `mlx_lm` (carga del modelo base más `adapter_path`). No se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.
- Nota del autor: la implementación MLX no garantiza resultados numéricamente idénticos a una implementación CUDA/PyTorch equivalente.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (adaptadores RL para decisión estructurada sobre modelos de 0.8B) en la documentación proporcionada. Como referencia del modelo base:

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| connectailab-rl-logomong-v5 | 0.8B (base) + LoRA r8 | No disponible | Apache 2.0 | MLX (adaptador) | Especializado en decisión con opciones cerradas; solo coreano |
| Qwen/Qwen3.5-0.8B | 0.8B | No disponible | No disponible en la información | No disponible | Modelo base de propósito general |
| Alternativas RL sobre modelos pequeños | No disponible | No disponible | No disponible | No disponible | No se han identificado comparables en la información disponible |

## Limitaciones y advertencias

- El propio autor advierte que el modelo seleccionado pierde dinero en el conjunto de validación independiente (media de -120,37 manwon/mes), por lo que su rendimiento económico no es estable.
- Está entrenado exclusivamente para el simulador CONNECT TYCOON y su distribución de empresas `general`; no se garantiza transferencia a dominios reales.
- Solo soporta coreano; no se documenta capacidad multilingüe.
- Devuelve únicamente una letra de opción; no genera explicaciones ni texto libre, lo que limita su uso fuera del formato de elección cerrada.
- Riesgo de alucinación no evaluado: al tratarse de una tarea de clasificación sobre opciones predefinidas, el fallo se manifiesta como elección incorrecta, no como texto inventado.
- Sesgos: no se documentan análisis de sesgo; el entrenamiento se basa en un profesor sintético y en datos generados por simulador, con los sesgos implícitos de ese profesor.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el autor recomienda validar con los registros propios de cada empresa antes de cualquier uso real.
- El adaptador está empaquetado en formato MLX; no se ofrecen pesos GGUF ni safetensors estándar, lo que dificulta el despliegue en ecosistemas CUDA.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB, lo que sugiere que los pesos pueden no estar completamente subidos o son de muy pequeño tamaño.
- La fecha de creación indicada (2026-11-04) es posterior a la fecha actual, lo que constituye una anomalía en los metadatos.

## Enlaces

- HuggingFace: https://huggingface.co/junho908/connectailab-rl-logomong-v5
- Repositorio del simulador CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Resultados completos de test (results.json): https://huggingface.co/junho908/connectailab-rl-logomong-v5/blob/main/results.json
- Validación independiente (company_validation.json): https://huggingface.co/junho908/connectailab-rl-logomong-v5/blob/main/company_validation.json
- Selección de modelo (selection.json): https://huggingface.co/junho908/connectailab-rl-logomong-v5/blob/main/selection.json
- Verificación de pesos (verification.json): https://huggingface.co/junho908/connectailab-rl-logomong-v5/blob/main/verification.json
