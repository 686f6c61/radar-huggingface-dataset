# rajsjain/gemma3-1b-grpo-deepmath-lora

## Resumen

`rajsjain/gemma3-1b-grpo-deepmath-lora` es un ajuste fino del modelo `unsloth/gemma-3-1b-it`, que a su vez deriva de Gemma 3 1B de Google. Lo publica el usuario rajsjain en Hugging Face y, por el nombre del repositorio, se ha entrenado con GRPO (Group Relative Policy Optimization) sobre un conjunto de datos de matematicas ("deepmath"). Se distribuye como adaptador LoRA en formato safetensors y esta pensado para generacion de texto en ingles.

El modelo base es un transformer decoder-only de la familia Gemma 3 en su variante de 1.000 millones de parametros, con una ventana de contexto de 32.768 tokens en la version instruct original. Este ajuste concreto no documenta cambios de arquitectura ni de tokenizador: se limita a modificar los pesos mediante el adaptador LoRA entrenado con Unsloth.

La relevancia practica es acotada: se trata de un experimento de ajuste fino con refuerzo (GRPO) sobre un modelo pequeno, publicado sin model card detallada, sin benchmarks y con cero descargas en el momento de redactar esta ficha. Sirve como referencia para quienes quieran reproducir pipelines de GRPO con Unsloth sobre Gemma 3 1B, pero no como modelo listo para produccion sin una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 text), ajuste fino mediante LoRA |
| Parametros totales | 1.000 millones (modelo base Gemma 3 1B); el adaptador LoRA anade una fraccion no especificada |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; no se documenta en este ajuste |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se publican versiones GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de Gemma 3 con atencion por ventanas deslizantes y atencion global combinadas, disenado para contexto largo. La variante de 1B emplea embeddings atados y no incluye capacidades multimodales en la version text (el tag `gemma3_text` lo confirma). Sobre esta base, rajsjain aplica un ajuste fino con LoRA usando Unsloth, que segun la model card permite entrenar "2x mas rapido" y con menor consumo de memoria que el entrenamiento estandar.

El metodo de entrenamiento indicado en el nombre del repositorio es GRPO, una variante de optimizacion por politica proximal que estima la ventaja relativa dentro de grupos de respuestas generadas, sin necesidad de un modelo critico separado. El dataset de entrenamiento se infiere del nombre ("deepmath"), pero no se documenta su composicion, numero de muestras, numero de pasos ni hiperparametros. No se especifica si hubo una fase previa de SFT, ni se aportan curvas de entrenamiento o metricas de validacion. Tampoco se detalla la configuracion del adaptador (rango, alpha, modulos objetivo).

## Capacidades

- Generacion de texto en ingles, heredada del modelo instruct base.
- Razonamiento matematico: el ajuste con GRPO sobre datos de matematicas busca mejorar la resolucion de problemas aritmeticos y algebraicos de varios pasos.
- Razonamiento multi-paso: GRPO esta disenado para optimizar cadenas de razonamiento, por lo que se espera cierta mejora en problemas que requieren pasos intermedios.
- Seguimiento de instrucciones: conserva la capacidad instruct del modelo base.
- Tool calling / function calling: no documentado en este ajuste; el modelo base Gemma 3 lo soporta en teoria, pero no hay evidencia de que el ajuste lo preserve.
- Capacidades de agente: no documentadas.
- Multilinguismo: limitado a ingles segun la model card; el modelo base Gemma 3 soporta mas idiomas, pero este ajuste no lo declara.
- Modo thinking explicito: no disponible.

## Casos de uso

- Experimentacion con GRPO en modelos pequenos: el repositorio sirve como referencia para reproducir un pipeline de ajuste con refuerzo usando Unsloth y TRL sobre Gemma 3 1B; util para investigadores que quieran validar recetas de entrenamiento.
- Prototipado de tutoria matematica: con 1B de parametros y contexto de 32K, puede desplegarse en una sola GPU consumer para probar asistentes que resuelvan ejercicios paso a paso antes de escalar a modelos mayores.
- Generacion de problemas y soluciones sinteticas: util para aumentar datasets de matematicas en ingles con explicaciones generadas, siempre que se filtre la calidad manualmente.
- Evaluacion comparativa de tecnicas de RL: al ser un ajuste ligero, permite medir el impacto de GRPO frente al modelo base en tareas de razonamiento sin grandes costes de computo.
- Educacion y demos interactivas: cabe en GPUs de consumo, por lo que puede integrarse en notebooks o demos locales de resolucion de problemas matematicos.
- Investigacion sobre alucinacion en matematicas: modelo pequeno y ajustado especificamente en este dominio, util para estudiar donde falla el razonamiento en modelos de baja escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2-3 GB para los pesos del modelo base de 1B, mas overhead de activaciones y KV cache.
- VRAM estimada en cuantizacion 4-bit: aproximadamente 1-1,5 GB, aunque no se publican pesos cuantizados.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia en fp16; para entrenamiento con LoRA se recomienda al menos 16 GB.
- Cabe en GPU consumer: si, en practicamente todas las GPUs modernas con 8 GB o mas.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag presente), vLLM y llama.cpp/Ollama requeririan conversion previa, ya que no se publican pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| rajsjain/gemma3-1b-grpo-deepmath-lora | 1B + LoRA | 32K (base) | Apache 2.0 | Hugging Face | Ajuste GRPO en matematicas, sin benchmarks |
| unsloth/gemma-3-1b-it | 1B | 32K | Apache 2.0 | Hugging Face | Modelo base instruct, sin ajuste de razonamiento |
| google/gemma-3-1b-it | 1B | 32K | Gemma Terms of Use | Hugging Face | Modelo original de Google; licencia distinta a la del ajuste |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K | Apache 2.0 | Hugging Face | Alternativa de tamano similar con buen rendimiento en matematicas |

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el ajuste mejore al modelo base; el nombre del repositorio sugiere la intencion, pero no la confirma.
- Model card minima: no se documentan hiperparametros, dataset, numero de pasos ni criterios de evaluacion, lo que dificulta la reproducibilidad.
- Sesgos: hereda los sesgos del modelo base Gemma 3, no evaluados en este ajuste.
- Riesgo de alucinacion: alto en un modelo de 1B, especialmente en matematicas de varios pasos; el ajuste con GRPO no garantiza correccion.
- Idioma: solo se declara ingles; el uso en castellano no esta soportado oficialmente.
- Licencia: Apache 2.0 en el adaptador, pero el modelo base Gemma 3 se rige por los Gemma Terms of Use; conviene verificar la compatibilidad antes de uso comercial.
- Cero descargas y cero likes: sin validacion por parte de la comunidad, lo que desaconseja su uso en produccion sin evaluacion propia.
- Formato LoRA: requiere cargar el modelo base y aplicar el adaptador; no es un checkpoint completo listo para servir directamente.

## Enlaces

- Hugging Face: https://huggingface.co/rajsjain/gemma3-1b-grpo-deepmath-lora
- Modelo base: https://huggingface.co/unsloth/gemma-3-1b-it
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- Gemma 3 (Google): https://huggingface.co/google/gemma-3-1b-it
