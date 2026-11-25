# ahmedselhady/XSDPO-Nemotron-1.5B-500x5-lr3e-6-kl0.001-full-ref10752-k512-frozen-en_only-alpha1-step-50

## Resumen

XSDPO-Nemotron-1.5B es un checkpoint intermedio (paso 50 de entrenamiento) de un ajuste fino mediante SDPO (una variante de optimización por preferencias tipo DPO con señal de recompensa o destilación, segun la nomenclatura del autor) sobre el modelo base nvidia/Nemotron-Research-Reasoning-Qwen-1.5B. Lo publica el usuario ahmedselhady en Hugging Face como artefacto de investigación, no como modelo listo para producción. El nombre codifica los hiperparámetros del experimento: 500x5 (probablemente 500 prompts por 5 muestras), learning rate 3e-6, coeficiente KL 0.001, entrenamiento full-parameter, referencia de 10752 tokens, k=512, referencia congelada, solo inglés y alpha=1.

El modelo hereda la arquitectura Qwen2 del base, con 1.777.088.000 parámetros reales segun safetensors, y está orientado a generación de texto conversacional y razonamiento. Su interés es acotado: sirve para reproducir o inspeccionar una etapa concreta de un pipeline de alineamiento sobre un modelo de razonamiento pequeño, y para estudiar cómo evoluciona el comportamiento a lo largo del entrenamiento SDPO. No hay model card descriptiva, ni datos de benchmarks, ni licencia declarada, lo que limita seriamente su uso fuera de experimentación.

La relevancia actual es metodológica: los modelos de razonamiento de ~1.5B parámetros son atractivos para despliegue en hardware modesto, y checkpoints como este permiten analizar la dinámica de entrenamiento con SDPO frente a DPO o RLHF clásico. Ahora bien, al tratarse del paso 50 de un run, no representa el resultado final del entrenamiento y probablemente esté infraentrenado respecto al objetivo del experimento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2 (heredada del base) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el nombre del run cita 10752 tokens como referencia, no como contexto) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | ingles (segun el sufijo `en_only` del nombre del run); resto no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia Qwen2, con 1.777 millones de parámetros, heredado del base nvidia/Nemotron-Research-Reasoning-Qwen-1.5B, que a su vez es un ajuste de NVIDIA sobre Qwen2.5-1.5B orientado a razonamiento. No se dispone de detalles sobre número de capas, dimensión oculta, cabezas de atención ni vocabulario en la información proporcionada; se pueden inferir del config del base, pero no se confirman aquí.

El entrenamiento consiste en un ajuste fino completo (full-parameter, no LoRA) con SDPO sobre un conjunto de datos de matematicas y razonamiento, con 500 prompts multiplicados por 5 muestras por prompt, learning rate 3e-6, coeficiente KL de 0.001 frente a una referencia congelada de 10752 tokens, k=512 y alpha=1, restringido a inglés. El checkpoint corresponde al paso 50, es decir, una fase temprana del run. No se especifican en la información disponible el número total de tokens vistos, la composición exacta del dataset, ni si hubo una fase previa de SFT o RLHF. Tampoco se detalla la innovación concreta de SDPO más allá de lo que sugiere el nombre del run.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat compatible con la plantilla del base Qwen2/Nemotron.
- Razonamiento matemático y de varios pasos, heredado del base Nemotron-Research-Reasoning-Qwen-1.5B y reforzado (parcialmente) por el ajuste SDPO.
- Razonamiento con cadena de pensamiento (thinking), segun las capacidades del modelo base de NVIDIA.
- Soporte de tool calling y function calling: no confirmado para este checkpoint; el base Qwen2 lo soporta de forma parcial, pero no hay evidencia en la información proporcionada.
- Capacidades de agente multi-paso: no confirmadas.
- Capacidades multilingües: limitadas a inglés segun el sufijo `en_only`; el resto de idiomas no está garantizado.
- Capacidades de visión o audio: no disponibles (modelo solo texto).

## Casos de uso

- Investigación sobre SDPO: inspeccionar el estado del modelo en el paso 50 para estudiar la evolución de la política respecto a la referencia congelada y comparar con checkpoints posteriores del mismo run.
- Reproducibilidad de experimentos: servir como punto de control para replicar el pipeline de entrenamiento con los hiperparámetros documentados en el nombre del modelo (lr 3e-6, KL 0.001, k=512).
- Análisis de dinámica de alineamiento: evaluar cómo cambia la distribución de respuestas y la divergencia KL a lo largo del entrenamiento en un modelo pequeño de razonamiento.
- Generación de soluciones matemáticas en inglés para tareas de evaluación interna, aprovechando la herencia del base Nemotron-Reasoning y su ventana de contexto moderada.
- Fine-tuning posterior como punto de partida: al ser un modelo denso de 1.5B en safetensors, se puede cargar con transformers y continuar el entrenamiento con DPO, SFT o LoRA en una sola GPU consumer.
- Docencia y prototipado: demostrar en un entorno controlado cómo un modelo de 1.5B con razonamiento puede ejecutarse en local para experimentos de alineamiento sin infraestructura grande.
- Evaluación comparativa de métodos de preferencia: usar este checkpoint como baseline intermedio frente a variantes DPO/RLHF en estudios académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3.6 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 5 y 7 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 2 GB para pesos; en 4 bits (si se generan pesos GGUF/AWQ, no publicados por el autor), alrededor de 1.2 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, L4); A100/H100 no son necesarias para inferencia, solo para entrenamiento o serving de alto throughput.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y en GPUs de 8 GB con cuantización.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; llama.cpp/Ollama requerirían conversión a GGUF no publicada por el autor; vLLM es compatible con arquitectura Qwen2.
- Latencia y throughput: no disponibles en la información proporcionada; en una RTX 4090 se puede esperar un throughput del orden de decenas a cientos de tokens por segundo para un modelo de 1.5B, pero no hay medición oficial.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| XSDPO-Nemotron-1.5B (este) | 1.777 M | no disponible | no disponible | Hugging Face, 0 descargas | Checkpoint intermedio de investigación |
| nvidia/Nemotron-Research-Reasoning-Qwen-1.5B | ~1.5B (nominal) | no disponible | no disponible en esta ficha | Hugging Face (NVIDIA) | Modelo base; orientado a razonamiento |
| Qwen2.5-1.5B-Instruct | ~1.5B | 32.768 tokens (segun Qwen) | Apache 2.0 (segun Qwen) | Hugging Face, ampliamente usado | Alternativa generalista con licencia permisiva |
| DeepSeek-R1-Distill-Qwen-1.5B | ~1.5B | 32.768 tokens (segun DeepSeek) | MIT (segun DeepSeek) | Hugging Face | Alternativa de razonamiento destilado |

La comparación con Qwen2.5-1.5B-Instruct y DeepSeek-R1-Distill-Qwen-1.5B es la más relevante por tamaño y tarea; sin embargo, no hay benchmarks de este checkpoint que permitan afirmar superioridad o inferioridad. La ventaja de las alternativas es su licencia declarada y su disponibilidad estable; la de este modelo es servir como artefacto de un experimento SDPO concreto.

## Limitaciones y advertencias

- Checkpoint intermedio (paso 50): no es el modelo final del run y puede estar infraentrenado o inestable respecto al objetivo del entrenamiento.
- Sin model card descriptiva: no hay información sobre dataset, metodología detallada, evaluación ni uso previsto.
- Licencia no disponible: no se puede asumir uso comercial; hay que contactar con el autor o consultar la licencia del base (NVIDIA Nemotron), que puede imponer restricciones adicionales.
- Idiomas: restringido a inglés segun el nombre del run; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación: como todo modelo generativo de 1.5B, especialmente en matemáticas y razonamiento, puede producir cadenas de pensamiento plausibles pero incorrectas.
- Sesgos: no se han documentado evaluaciones de sesgo; al heredar el base, arrastra los sesgos de sus datos de entrenamiento.
- Contexto: la longitud de contexto efectiva no está confirmada; el valor 10752 del nombre parece referirse a la referencia del KL, no a la ventana de contexto.
- Producción: no recomendado para uso en producción sin una evaluación exhaustiva propia, dada la falta de benchmarks, licencia y documentación.
- Reproducibilidad: el nombre del run codifica hiperparámetros, pero sin el código ni el dataset no se puede reproducir el entrenamiento completo.

## Enlaces

- Hugging Face: https://huggingface.co/ahmedselhady/XSDPO-Nemotron-1.5B-500x5-lr3e-6-kl0.001-full-ref10752-k512-frozen-en_only-alpha1-step-50
- Modelo base: https://huggingface.co/nvidia/Nemotron-Research-Reasoning-Qwen-1.5B
- Perfil del autor: https://huggingface.co/ahmedselhady
- Paper de referencia sobre SDPO: no disponible en la información proporcionada
- Repositorio de código del entrenamiento: no disponible en la información proporcionada
- Demos: no disponibles en la información proporcionada
