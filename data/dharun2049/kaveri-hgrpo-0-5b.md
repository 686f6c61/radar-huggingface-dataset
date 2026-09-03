# dharun2049/kaveri-hgrpo-0.5b

## Resumen

Kaveri H-GRPO 0.5B es un checkpoint experimental de post-entrenamiento para generación de código, desarrollado por dharun2049 a partir del modelo base Qwen/Qwen2-0.5B-Instruct. Su principal contribución es la introducción de una variante del algoritmo Group Relative Policy Optimization (GRPO) denominada Hypergraph Group Relative Policy Optimization (H-GRPO), que incorpora un mecanismo de recompensa basado en hipergrafos para modelar relaciones entre soluciones candidatas durante el entrenamiento.

El modelo está diseñado para abordar problemas de programación competitiva en C++17, utilizando datasets como open-r1/codeforces y verifiable-prompts. Se entrena con LoRA (rank 8, alpha 16) sobre las proyecciones q_proj y v_proj, y emplea un verificador local basado en compilación g++ y tests oficiales. Con 494 millones de parámetros, es un modelo compacto orientado a la investigación en métodos de aprendizaje por refuerzo para razonamiento y generación de código.

Su relevancia radica en explorar cómo el reward shaping basado en hipergrafos puede mejorar la eficiencia del entrenamiento con GRPO en modelos pequeños, aunque el autor declara explícitamente que no hace afirmaciones de rendimiento y que se trata de un checkpoint de investigación experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2-0.5B-Instruct, un transformer decoder-only con atención causal. No se proporcionan detalles adicionales sobre el número de capas, heads o dimensiones ocultas en la información disponible.

El entrenamiento consiste en un post-entrenamiento mediante aprendizaje por refuerzo con GRPO, extendido con la capa H-GRPO. En este esquema, cada grupo de soluciones candidatas (rollouts) se representa como vértices de un hipergrafo, donde las hiperaristas codifican similitud de estrategia algorítmica, comportamiento parcial en tests oficiales y similitud estructural del código. La recompensa se ajusta mediante la fórmula r_H = r + alpha * compile_gate * (P_H @ r - r), donde P_H es la matriz de propagación del hipergrafo y compile_gate impide que soluciones no compilables hereden recompensa de corrección. El valor de alpha es 0.2.

El entrenamiento se realizó con TRL GRPOTrainer, con 4 generaciones por prompt, batch de generación de 16, 150 pasos de optimizador y longitud máxima de completado de 256 tokens. El dataset combina open-r1/codeforces y verifiable-prompts, y el verificador utiliza compilación local con g++ y ejecución de tests oficiales. El adaptador LoRA original se conserva en el directorio lora_adapter/, mientras que la raíz del repositorio contiene el modelo fusionado.

## Capacidades

- Generación de texto y código, con especialización en C++17 para problemas de programación competitiva.
- Razonamiento y resolución de problemas algorítmicos, potenciado por el entrenamiento con verificación automática.
- Post-entrenamiento con aprendizaje por refuerzo, lo que sugiere cierta capacidad de mejora iterativa en tareas de código.
- Al estar basado en Qwen2-0.5B-Instruct, hereda las capacidades conversacionales y de instrucción del modelo base, aunque no se especifican detalles adicionales.
- No se documenta soporte explícito para tool calling, function calling, agentes o capacidades multimodales.

## Casos de uso

- Investigación en métodos de RL para generación de código: el modelo sirve como banco de pruebas para evaluar el impacto del reward shaping con hipergrafos en modelos pequeños, comparando con GRPO estándar.
- Experimentación en programación competitiva: puede utilizarse para generar soluciones en C++17 a problemas de Codeforces, aunque su rendimiento no está validado y requiere evaluación independiente.
- Estudio de verificación automática en entrenamiento: el uso de compilación g++ y tests oficiales como verificador permite analizar cómo la señal de recompensa basada en ejecución afecta al aprendizaje.
- Desarrollo de pipelines de post-entrenamiento con LoRA: el repositorio incluye el adaptador LoRA original, lo que facilita reproducir o modificar el entrenamiento.
- Comparación de arquitecturas de reward shaping: investigadores pueden contrastar H-GRPO con otras variantes de GRPO o PPO en tareas de razonamiento.
- Generación de código asistida en entornos de baja capacidad: al ser un modelo de 0.5B, puede desplegarse en hardware limitado para tareas de autocompletado o sugerencias de código, aunque con expectativas moderadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el checkpoint no hace afirmaciones de rendimiento y que debe evaluarse de forma independiente.

## Requisitos de hardware

No se proporcionan requisitos específicos de hardware en la documentación. Como estimación orientativa basada en el tamaño del modelo (494M parámetros):

- VRAM estimada para inferencia en FP16: aproximadamente 1-2 GB, dependiendo de la longitud de secuencia y el batch.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, o superiores. También es viable en CPU con llama.cpp u Ollama.
- Opciones de despliegue: al ser un modelo transformers estándar, puede servirse con vLLM, TGI, o mediante conversión a GGUF para llama.cpp/Ollama.
- Latencia y throughput: no disponibles, pero al ser un modelo pequeño, se espera una latencia baja en hardware consumer.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Kaveri H-GRPO 0.5B | 494M | no disponible | Apache-2.0 | Post-entrenamiento RL con H-GRPO para coding |
| Qwen2-0.5B-Instruct (base) | 494M | 32K (según modelo base) | Apache-2.0 | Instruct generalista |
| SmolLM2-0.5B (referencia) | 500M | 8K | Apache-2.0 | Modelo pequeño generalista |

No se dispone de datos de rendimiento comparativo. La comparación se limita a parámetros y licencia; el contexto del modelo base Qwen2-0.5B-Instruct es de 32K tokens, pero no se confirma que Kaveri lo herede.

## Limitaciones y advertencias

- Checkpoint experimental: no está validado para uso en producción y puede presentar comportamientos impredecibles.
- Sin datos de benchmarks: no hay evidencia de rendimiento en tareas estándar de código o razonamiento.
- Sesgos y alucinaciones: al ser un modelo pequeño entrenado con un dataset específico (Codeforces), puede generar código incorrecto o alucinar APIs inexistentes.
- Limitaciones de idioma: no se especifican idiomas soportados; probablemente el modelo base tiene capacidades multilingües, pero no está documentado.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero al ser un modelo derivado de Qwen2, se deben respetar los términos de la licencia del modelo base.
- Dependencia del verificador: el entrenamiento depende de la compilación g++ y tests oficiales; en inferencia, no hay garantía de que el código generado compile o pase tests.
- Tamaño de contexto no confirmado: aunque el modelo base soporta 32K, no se ha verificado que el checkpoint mantenga esa longitud.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/dharun2049/kaveri-hgrpo-0.5b)
- [Modelo base Qwen2-0.5B-Instruct](https://huggingface.co/Qwen/Qwen2-0.5B-Instruct)
- [Dataset open-r1/codeforces](https://huggingface.co/datasets/open-r1/codeforces) (referencia)
- [Dataset verifiable-prompts](https://huggingface.co/datasets/verifiable-prompts) (referencia)
