# nitishpandey04/qwen2.5-coder-0.5b-python-grpo-poc

## Resumen

`nitishpandey04/qwen2.5-coder-0.5b-python-grpo-poc` es un adaptador LoRA experimental entrenado sobre `Qwen/Qwen2.5-Coder-0.5B-Instruct` mediante GRPO (Group Relative Policy Optimization) con TRL, orientado a la generación de funciones Python en el contexto del dataset MBPP. No se trata de un modelo completo ni de un artefacto validado: el propio autor lo publica como prueba de concepto (POC) con resultado inconcluso, y lo preserva explícitamente para permitir comparaciones honestas en experimentos futuros.

El adaptador se entrenó durante 200 pasos de optimización con LoRA de rango 16 sobre las capas de atención y proyección MLP, usando recompensa basada en la fracción de tests originales de MBPP superados, ejecutados en un contenedor Docker restringido mediante el ejecutor OpenEnv Coding. El modelo base, Qwen2.5-Coder-0.5B-Instruct, es un transformer decoder-only de 0,5 mil millones de parámetros ya especializado en código e instrucciones, con licencia Apache-2.0.

La relevancia de esta ficha es fundamentalmente metodológica: documenta un flujo completo de RL con verificación por ejecución sobre un modelo pequeño, incluyendo ledger de experimento, fingerprints de dataset y reglas de selección por validación. El resultado publicado no demuestra mejora general: la ganancia observada en test (+3,0 puntos porcentuales) no se replica en validación, donde el adaptador final resuelve 24/79 frente a 29/79 del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-Coder-0.5B-Instruct) con adaptador LoRA (rango 16, alpha 32, dropout 0) sobre capas de atencion y proyeccion MLP |
| Parametros totales | 0,5 mil millones (modelo base); tamano del adaptador LoRA no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-Coder-0.5B-Instruct) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el base admite cuantizacion, no detallada aqui) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base por separado |
| Libreria | PEFT |
| Pipeline | text-generation |
| Dataset de entrenamiento | google-research-datasets/mbpp (subconjunto verificado por referencia: 334 train, 79 validacion, 448 test disponibles) |
| Hardware de entrenamiento | 1x NVIDIA RTX 5060 Ti 16 GB; pico de asignacion PyTorch ~1,12 GiB |
| Fecha de creacion | 2026-11-03 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only de 0,5B parámetros ya instruido para código. El método es GRPO con LoRA: cuatro candidatos muestreados por prompt, temperatura 0,8, longitud máxima de completion de 256 tokens, learning rate 1e-5, coeficiente KL de 0,02, batch por dispositivo de 1 con acumulación de gradiente de 4, precisión BF16, optimizador AdamW y gradient checkpointing. No se usó vLLM. La recompensa es la fracción de tests originales de MBPP superados, medida a través del ejecutor OpenEnv Coding dentro de un contenedor Docker restringido; las recompensas integradas de estilo y longitud de TRL se ignoraron deliberadamente.

El entrenamiento constó de 200 pasos de optimizador con semilla 42, sobre la revisión `ea3f2471cf1b1f0db85067f1ef93848e38e88c25` del modelo base. La ejecución se reanudó desde el checkpoint 50 tras un fallo del ejecutor; los fallos por agotamiento de memoria impuesto por Docker reciben recompensa cero y reinician el worker. La evaluación usó prompts idénticos, decodificación greedy, presupuesto de 256 tokens, un único envío por problema y todos los tests originales de MBPP, sin feedback de ejecución durante la evaluación. El autor advierte explícitamente que se trata de un POC filtrado de MBPP y no de un resultado de EvalPlus.

## Capacidades

- Generación de funciones Python a partir de una firma y una descripción, devolviendo código en un bloque `python` único.
- Razonamiento de código de alcance acotado: implementación de funciones con helpers, sin llamadas de ejemplo ni prints.
- Seguimiento de instrucciones de formato mediante `apply_chat_template` con rol de sistema.
- Generación determinista con decodificación greedy (configuración usada en la evaluación del autor).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés según la model card.
- No se documentan capacidades de visión, audio ni modo thinking.

## Casos de uso

- Prueba de concepto de RL con verificación por ejecución: el adaptador sirve como referencia reproducible para validar un pipeline GRPO + TRL + ejecutor en sandbox sobre un modelo pequeño, con ledger de experimento y fingerprints de dataset incluidos.
- Generación de funciones Python de alcance unitario en entornos de investigación: adecuado para experimentos controlados de síntesis de código donde se pueda ejecutar el resultado en un sandbox y validar contra tests propios.
- Estudio de metodología de evaluación: útil para analizar la discrepancia entre ganancia en test y caída en validación, y para diseñar reglas de selección de checkpoints más robustas.
- Comparación de técnicas de post-entrenamiento: sirve como línea base negativa o artefacto de control al evaluar otros adaptadores o métodos de RL sobre el mismo modelo base.
- Docencia y formación en RLHF/RLVR: ejemplo completo de configuración GRPO con LoRA, recompensas por tests y recuperación ante fallos del ejecutor, documentado paso a paso.
- Prototipado offline en hardware de consumo: al requerir solo el modelo base de 0,5B más un adaptador pequeño, puede ejecutarse en una GPU de gama media para experimentos locales sin infraestructura dedicada.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre MBPP filtrado (evaluación propia, no EvalPlus):

| Metrica | Modelo original | Adaptador final (paso 200) |
|---|---:|---:|
| Problemas de test resueltos | 97/300 | 106/300 |
| Correccion en test (un intento) | 32,3% | 35,3% |
| Tokens medios generados en test | 87,9 | 76,3 |
| Problemas de validacion resueltos | 29/79 | 24/79 |

El mejor checkpoint entrenado evaluado resolvió 27/79 problemas de validación; ninguno superó los 29/79 del modelo original, por lo que la regla de selección predefinida retuvo el modelo original. La ganancia solo en test fue de +3,0 puntos porcentuales (13 tareas mejoradas, 4 empeoradas), con un intervalo bootstrap pareado al 95% de aproximadamente [+0,3, +5,7] puntos. El autor señala que ese intervalo no captura variación de semilla de entrenamiento, contaminación por pretraining, debilidad de los tests ni la discrepancia con validación, y que no establece una mejora general.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,5B en BF16 ocupa aproximadamente 1 GiB de pesos; con overhead de activaciones y KV cache, cabe holgadamente en GPUs de 8 GB o menos. Cifra exacta de inferencia no disponible.
- Entrenamiento documentado: 1x NVIDIA RTX 5060 Ti 16 GB con pico de asignación PyTorch de ~1,12 GiB.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB (RTX 3060, RTX 4060, RTX 5060 Ti) es suficiente para inferencia; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, con amplio margen.
- Opciones de despliegue: Transformers + PEFT (probado con PyTorch 2.11.0+cu128, Transformers 5.22.1, PEFT 0.21.2, Accelerate 1.15.0). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este adaptador; el autor indica explícitamente que no usó vLLM en entrenamiento.
- Latencia y throughput: no disponibles. El autor reporta una reducción de tokens medios generados en test (87,9 a 76,3), lo que sugiere menor coste de decodificación, pero sin cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (sobre Qwen2.5-Coder-0.5B-Instruct) | 0,5B + LoRA | No disponible | RL con GRPO y recompensa por tests MBPP | Apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen2.5-Coder-0.5B-Instruct (base) | 0,5B | No disponible en esta informacion | SFT instruido para código | Apache-2.0 | HuggingFace, ampliamente usado |
| Qwen/Qwen2.5-Coder-1.5B-Instruct | 1,5B | No disponible en esta informacion | SFT instruido para código | Apache-2.0 | HuggingFace |
| Modelos coder de ~0,5B de otras familias (p. ej. variantes pequeñas de StarCoder o CodeLlama) | ~0,5-1B | No disponible en esta informacion | Principalmente preentrenamiento/SFT de código | Varía (a menudo restrictiva) | HuggingFace |

La comparación de rendimiento con alternativas no está disponible: el autor solo publica métricas frente a su propio modelo base en MBPP filtrado, sin comparación con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Resultado inconcluso: el adaptador publicado es el artefacto final del entrenamiento, no un ganador seleccionado por validación; en validación rinde peor que el modelo base (24/79 frente a 29/79).
- La ganancia en test (+3,0 pp) tiene un intervalo bootstrap de [+0,3, +5,7] pp y no captura variación de semilla, contaminación por pretraining ni debilidad de los tests; no establece mejora general.
- Un único seed de entrenamiento y una única ejecución; no hay réplicas que permitan estimar varianza.
- El conjunto de test ya ha sido inspeccionado y no debe reutilizarse como objetivo de ajuste.
- Riesgo de contaminación por pretraining y solapamiento semántico en MBPP; los tests originales son pequeños.
- No se midió capacidad de depuración interactiva ni de nivel de repositorio.
- Evaluación limitada a inglés y a generación de funciones Python de alcance unitario.
- El código generado puede ser incorrecto: debe ejecutarse únicamente en un sandbox adecuado.
- Es un adaptador, no pesos completos: requiere descargar el modelo base en la revisión indicada.
- Uso comercial: la licencia Apache-2.0 lo permite, pero al ser un artefacto experimental sin validación, no es recomendable para producción sin evaluación propia.
- Sesgos conocidos del modelo base no documentados en la información proporcionada.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/nitishpandey04/qwen2.5-coder-0.5b-python-grpo-poc
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
- Repositorio de código y ledger del experimento: https://github.com/nitishpandey04/python-grpo-poc
- Evidencia detallada del experimento 001: https://github.com/nitishpandey04/python-grpo-poc/tree/main/experiments/experiment-001
- Dataset MBPP: https://huggingface.co/datasets/google-research-datasets/mbpp
- Paper de MBPP (Austin et al., 2021): https://arxiv.org/abs/2108.07732
