# ahmedselhady/XSDPO-Nemotron-1.5B-1000x5-lr3e-6-kl0.001-full-ref10752-k512-frozen-en_only-alpha1.0-gs

## Resumen

XSDPO-Nemotron-1.5B es un ajuste fino (fine-tune) del modelo de razonamiento Nemotron-Research-Reasoning-Qwen-1.5B de NVIDIA, publicado por el usuario ahmedselhady en Hugging Face. Se trata de un experimento de investigación sobre SDPO (Self-Distillation Policy Optimization, segun la nomenclatura del identificador del run), una variante de optimizacion por preferencias aplicada sobre un modelo base ya entrenado para razonamiento. El identificador del repositorio codifica los hiperparametros del entrenamiento: 1000 pasos por 5 epocas, learning rate 3e-6, coeficiente KL de 0.001, referencia completa de 10752 tokens, top-k de 512, referencias congeladas, dataset solo en ingles y alpha 1.0.

El modelo conserva la arquitectura Qwen2 del modelo base, con 1.777.088.000 parametros totales, y esta orientado a generacion de texto conversacional con capacidad de razonamiento. Su relevancia es fundamentalmente experimental: documenta una configuracion concreta de entrenamiento SDPO sobre un modelo pequeno de razonamiento, lo que permite reproducir o comparar variantes del mismo pipeline. No es un modelo pensado para produccion ni cuenta con una model card descriptiva mas alla de la identificacion del checkpoint.

El repositorio ocupa 14.2 GB y la revision publicada corresponde al paso 200 del entrenamiento (etiqueta `step-200`), mientras que la rama principal apunta al ultimo paso publicado. No se dispone de informacion sobre licencia, idiomas declarados ni resultados de evaluacion en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no declarada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el identificador del run indica entrenamiento `en_only`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de nvidia/Nemotron-Research-Reasoning-Qwen-1.5B, un modelo de la familia Qwen2 con 1.777 millones de parametros orientado a razonamiento. Sobre esa base se aplica un entrenamiento SDPO (Self-Distillation Policy Optimization) identificado como `macereason-math-1000x5-nemotron-1.5b-lr3e-6-kl0.001-full-ref10752-k512-frozen-en_only-alpha1.0-gs`. Los hiperparametros codificados en el nombre indican 1000 pasos por 5 epocas, learning rate de 3e-6, coeficiente KL de 0.001 frente a una referencia congelada (`frozen`), ventana de referencia de 10752 tokens, top-k de 512, `alpha` de 1.0 y datos exclusivamente en ingles (`en_only`).

El prefijo "macereason-math" sugiere que el dataset de entrenamiento esta centrado en matematicas y razonamiento. No se detalla en la model card la composicion exacta del dataset, el numero total de tokens de entrenamiento, ni si se emplearon etapas adicionales de RLHF o DPO mas alla del propio procedimiento SDPO. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en formato chat, heredada de la plantilla del modelo base Qwen2.
- Razonamiento multi-paso y resolucion de problemas, dado el origen del modelo base (Nemotron-Research-Reasoning).
- Razonamiento matematico, coherente con el dataset de entrenamiento (`macereason-math`).
- Generacion de codigo: capacidad esperable por herencia del modelo base, aunque no verificada en la informacion disponible.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes: no confirmado en la informacion disponible.
- Capacidades multilingues: el run de entrenamiento se declara `en_only`, por lo que el ajuste esta orientado al ingles.
- Modo thinking explicito: no documentado en la model card.

## Casos de uso

- Investigacion sobre SDPO: el modelo sirve como punto de comparacion reproducible de una configuracion concreta de entrenamiento por preferencias sobre un modelo de razonamiento de 1.5B, util para estudiar el efecto de hiperparametros como el coeficiente KL o el tamano de la ventana de referencia.
- Reproduccion de experimentos: al exponer checkpoints por paso (`step-200`), permite analizar la evolucion del entrenamiento y comparar estados intermedios frente al modelo base.
- Evaluacion de razonamiento matematico en modelos pequenos: adecuado para medir hasta que punto un ajuste SDPO sobre datos de matematicas mejora o degrada el rendimiento del modelo base en tareas aritmeticas y algebraicas.
- Generacion de respuestas en ingles en entornos de laboratorio: su orientacion `en_only` lo hace apropiado para prototipos de asistente conversacional en ingles donde el contexto no sea critico.
- Fine-tuning posterior como base: al ser un checkpoint de 1.5B en safetensors, puede servir como punto de partida para nuevos experimentos de alineacion o destilacion.
- Analisis de degradacion por sobreajuste: con 1000 pasos y 5 epocas sobre un dataset acotado, es util para estudiar fenomenos de olvido catastrofico o colapso de diversidad frente al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3.6 GB solo para pesos, mas memoria para cache KV y activaciones; en la practica, entre 5 y 8 GB segun longitud de contexto y batch.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2 GB para pesos; en 4 bits, alrededor de 1.2 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060, RTX 4070); A100 o H100 no son necesarias para este tamano, pero permiten mayor throughput en batch.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en FP16 y en tarjetas con 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), y previsiblemente llama.cpp u Ollama si se generan pesos GGUF, aunque no se distribuyen en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| XSDPO-Nemotron-1.5B (este modelo) | 1.777 M | no disponible | no disponible | Hugging Face |
| nvidia/Nemotron-Research-Reasoning-Qwen-1.5B | ~1.5B (nominal) | no disponible | no disponible | Hugging Face |
| Qwen2.5-1.5B-Instruct | ~1.5B | 32.768 tokens (segun documentacion de Qwen) | Apache 2.0 (segun documentacion de Qwen) | Hugging Face |
| DeepSeek-R1-Distill-Qwen-1.5B | ~1.5B | 32.768 tokens (segun documentacion de DeepSeek) | MIT (segun documentacion de DeepSeek) | Hugging Face |

Los datos de contexto y licencia de los modelos comparables provienen de su documentacion publica; los de este modelo no estan declarados en la informacion disponible. No se dispone de comparaciones de rendimiento entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar el uso comercial permitido; hay que verificar la licencia del modelo base y del repositorio antes de cualquier despliegue.
- Modelo experimental de investigacion: el nombre del run y la ausencia de model card descriptiva indican que no esta pensado para produccion.
- Entrenamiento `en_only`: el ajuste esta orientado al ingles y puede degradar el rendimiento en castellano u otros idiomas respecto al modelo base.
- Riesgo de sobreajuste: 1000 pasos y 5 epocas sobre un dataset acotado de matematicas pueden provocar perdida de capacidades generales (olvido catastrofico) y menor diversidad en las respuestas.
- Riesgo de alucinacion: inherente a los modelos de 1.5B en tareas de razonamiento y generacion abierta; no se han publicado evaluaciones que lo cuantifiquen.
- Sesgos: no documentados; el dataset de entrenamiento no se describe en detalle.
- Longitud de contexto no declarada: no se puede garantizar el comportamiento en conversaciones largas sin consultar la configuracion del modelo base.
- Sin resultados de benchmarks: no hay evidencia publicada de mejora frente al modelo base ni frente a alternativas.
- Repositorio de 14.2 GB: incluye multiples checkpoints o estados, lo que puede complicar la descarga y el despliegue selectivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahmedselhady/XSDPO-Nemotron-1.5B-1000x5-lr3e-6-kl0.001-full-ref10752-k512-frozen-en_only-alpha1.0-gs
- Modelo base: https://huggingface.co/nvidia/Nemotron-Research-Reasoning-Qwen-1.5B
