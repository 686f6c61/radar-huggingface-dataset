# opencerebral/Boris-2

## Resumen

Boris-2 es un modelo de lenguaje base de 144 millones de parámetros desarrollado por OpenCerebral, entrenado desde cero sobre una única GPU NVIDIA V100. Se trata de un modelo causal decoder-only orientado a la generación de texto y no ajustado para seguir instrucciones ni mantener conversaciones: continúa texto, no responde a prompts conversacionales. Su relevancia radica en que demuestra que es posible entrenar un modelo competitivo en la categoría de modelos pequeños (SLM) con recursos muy limitados, empleando 200.000 millones de tokens de entrenamiento más dos etapas finales cortas de 40 millones de tokens en total.

El modelo incorpora dos modificaciones arquitectónicas respecto a un decoder transformer estándar: capas Canon, que aplican una convolución causal en profundidad de 3 taps sobre la proyección fusionada de query/key/value, y una tabla de n-gramas que recupera embeddings aprendidos de rango 64 mediante búsqueda exacta sobre los últimos dos y tres tokens. Con 31 capas, tamaño oculto de 512 y una ventana de contexto de 2048 tokens, Boris-2 se posiciona como una alternativa ligera y de licencia permisiva (Apache 2.0) para experimentación e inferencia en hardware modesto.

La versión publicada corresponde al checkpoint de 200.000 millones de tokens más dos etapas finales de bajo learning rate, seleccionada entre aproximadamente diez candidatos por su puntuación en cinco benchmarks. El autor advierte que parte de la mejora puede deberse a selección sobre ruido, ya que las puntuaciones de checkpoints individuales varían en torno a ±0,8 puntos del índice agregado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal con capas Canon y tabla de n-gramas |
| Parametros totales | 143,7 M (144.192.782 segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el repo ocupa 0,6 GB) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, requiere trust_remote_code) |

Desglose interno: 111,9 M en bloques transformer, 16,8 M en embedding de tokens (atado con la salida) y 15,0 M en la tabla de n-gramas. 31 capas, tamaño oculto 512, atención multi-cabeza completa con 8 cabezas de 64 dimensiones, MLP SwiGLU con dimensión interna 1664, codificación posicional RoPE con theta 10.000 y vocabulario de 32.768 tokens con BPE a nivel de byte entrenado específicamente para el modelo.

## Arquitectura y entrenamiento

Boris-2 es un transformer decoder-only causal con dos desviaciones respecto al diseño estándar. Las capas Canon aplican una convolución causal en profundidad de 3 taps a la proyección fusionada de query/key/value, de modo que cada posición mezcla las dos posiciones anteriores antes de la atención. La tabla de n-gramas realiza una búsqueda exacta sobre los últimos dos y tres identificadores de token (210.938 bigramas y 23.437 trigramas, sin hashing) y recupera un vector aprendido de rango 64 que se suma al flujo residual antes del bloque 2.

El entrenamiento se realizó desde cero sobre una única NVIDIA V100 durante 200.000 millones de tokens, seguido de dos etapas finales cortas de bajo learning rate que suman 40 millones de tokens. El empaquetado de secuencias incluye varios documentos por secuencia con atención, Canon y búsqueda de n-gramas enmascarados en los límites de documento (parámetro `eos_resets_context` en la configuración). Los datos provienen de una mezcla de corpus: karpathy/climbmix-400b-shuffle, HuggingFaceTB/finemath, openbmb/UltraData-Math, microsoft/orca-math-word-problems-200k, meta-math/MetaMathQA, MU-NLPC/Calc-ape210k, MU-NLPC/Calc-mawps, HuggingFaceTB/cosmopedia, HuggingFaceTB/smollm-corpus y mlfoundations/dclm-baseline-1.0. No se documenta en la información disponible el uso de RLHF o DPO; se trata de un modelo base sin ajuste por preferencias.

## Capacidades

- Generación de texto autoregresiva: continuación de texto libre, sin ajuste para instrucciones ni diálogo.
- Razonamiento básico y respuesta a preguntas de sentido común, evaluado en HellaSwag, ARC-Easy y ARC-Challenge.
- Razonamiento físico cotidiano, evaluado en PIQA.
- Aritmética y matemáticas elementales, evaluado en ArithMark-3 y entrenado con corpus matemáticos específicos (finemath, MetaMathQA, orca-math, Calc-ape210k, Calc-mawps).
- Modelado de n-gramas explícito mediante tabla de búsqueda exacta, que aporta información de contexto local a corto plazo.
- Capacidades multilingües: limitadas al inglés según la model card.
- Tool calling / function calling: no disponible; no es un modelo ajustado para instrucciones.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (visión, audio, modo thinking): no disponibles.

## Casos de uso

- Experimentación e investigación en arquitecturas: las capas Canon y la tabla de n-gramas son componentes novedosos que pueden estudiarse y ablacionarse en un modelo de 144 M de parámetros que cabe en una GPU consumer, lo que facilita reproducir experimentos.
- Generación de texto asistida y autocompletado: al ser un modelo base, encaja en tareas de continuación de texto donde se proporciona un prefijo y se espera una continuación coherente, como redacción de borradores o generación de descripciones.
- Fine-tuning para tareas específicas: con licencia Apache 2.0 y solo 144 M de parámetros, es viable ajustarlo en una sola GPU para clasificación, extracción de información o generación de dominio con datasets pequeños.
- Evaluación comparativa de modelos pequeños: sirve como referencia en la categoría SLM para medir el efecto de técnicas como el enmascarado en límites de documento o el uso de tablas de n-gramas frente a transformers estándar.
- Prototipado educativo: su tamaño reducido y el código de modelado incluido en el repositorio permiten estudiar el funcionamiento interno de un transformer causal con atención completa y RoPE sin necesidad de infraestructura grande.
- Inferencia en entornos con recursos limitados: con 0,6 GB de pesos en safetensors, puede desplegarse en CPU o en GPUs de gama baja para tareas de generación de texto no críticas donde la latencia no sea un requisito estricto.
- Investigación en tokenización: el vocabulario BPE de 32.768 tokens entrenado específicamente para el modelo permite analizar el impacto de la tokenización en modelos pequeños.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (zero-shot, pesos float32). La columna "Preview-2" corresponde al checkpoint previo y "Boris-2 @200B" al final del entrenamiento principal, antes de las dos etapas finales.

| Benchmark | Metrica | Preview-2 | Boris-2 @200B | Boris-2 |
|---|---|---:|---:|---:|
| HellaSwag | acc_norm | 46,60 | 50,36 | 50,26 |
| ARC-Easy | acc_norm | 59,13 | 60,10 | 59,81 |
| ARC-Challenge | acc_norm | 30,20 | 32,25 | 32,00 |
| PIQA | acc_norm | 70,84 | 72,91 | 72,91 |
| ArithMark-3 | acc_norm | 42,20 | 42,00 | 45,10 |
| Open SLM Index | indice agregado | 30,58 | 33,59 | 34,19 |

El Open SLM Index se calcula con la fórmula del Open SLM Leaderboard: `(N(HellaSwag,25) + N(mean(ARC-E, ARC-C),25) + N(PIQA,50) + 0,65 * N(ArithMark-3,25)) / 3,65`, donde `N(v,c) = 100(v-c)/(100-c)`. ArithMark-3 se evaluó con el script `bencharithmark-3.py` del leaderboard sin modificaciones y con ajustes por defecto. El autor señala que la mejora sobre el checkpoint de 200B se concentra casi por completo en ArithMark-3 (+3,1 puntos), mientras que los otros cuatro benchmarks varían 0,3 puntos o menos, y que la selección entre candidatos puede introducir parte de la ganancia por ruido de selección.

## Requisitos de hardware

- VRAM estimada para inferencia: en float32, los 144 M de parámetros ocupan aproximadamente 0,58 GB; en float16, unos 0,29 GB; en cuantización de 8 bits, alrededor de 0,15 GB (estimación a partir del recuento de parámetros, no publicada por el autor).
- GPU recomendadas: el entrenamiento se realizó en una única NVIDIA V100; para inferencia, cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente (GTX 1650, RTX 3050, RTX 4090, A100, H100).
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU, dado el reducido tamaño del modelo.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por el código de modelado personalizado con capas Canon y tabla de n-gramas). Otras opciones como vLLM, llama.cpp, Ollama o TGI no están documentadas en la información disponible y podrían requerir adaptaciones por el código personalizado.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---:|---|---|---|---|
| Boris-2 | 143,7 M | 2048 | Apache 2.0 | en | Capas Canon y tabla de n-gramas; modelo base |
| Boris-2-Preview-2 | no disponible | no disponible | Apache 2.0 | en | Checkpoint previo del mismo autor; Open SLM Index 30,58 |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

La model card menciona una comparación de nueve tareas contra otros modelos pequeños, con los números en `benchmarks_comparison.csv`, pero los datos concretos de esos modelos no se incluyen en la información disponible.

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones ni mantiene conversaciones; usarlo como asistente requiere fine-tuning o prompting de continuación de texto.
- Ventana de contexto limitada a 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Solo soporta inglés; no se han documentado capacidades multilingües.
- Riesgo de alucinación inherente a un modelo base entrenado sobre corpus web y matemáticos; no hay ajuste por preferencias ni verificación factual.
- Sesgos potenciales derivados de los corpus de entrenamiento (climbmix, dclm, cosmopedia, smollm-corpus), no evaluados ni documentados en la información disponible.
- El rendimiento en ARC-Challenge (32,00 acc_norm) es bajo en términos absolutos, lo que limita su uso en razonamiento complejo.
- La selección del checkpoint publicado entre unos diez candidatos puede introducir sobreajuste a los cinco benchmarks usados para elegir, según advierte el propio autor.
- El uso requiere `trust_remote_code=True` por el código de modelado personalizado, lo que implica ejecutar código del repositorio y revisarlo antes de usarlo en producción.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las licencias de los datasets de entrenamiento si se redistribuye el modelo o derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/opencerebral/Boris-2
- Perfil del autor en Hugging Face: https://huggingface.co/opencerebral
- Wiki del proyecto: https://wiki.kunix.org/
- Código fuente: https://git.kunix.org/boris-2
- Página de OpenCerebral: https://oc.kunix.org/
- Checkpoint previo Boris-2-Preview-1: https://huggingface.co/opencerebral/Boris-2-Preview-1
- Checkpoint previo Boris-2-Preview-2: https://huggingface.co/opencerebral/Boris-2-Preview-2
- Licencia: https://huggingface.co/opencerebral/Boris-2/blob/main/LICENSE
- Dataset karpathy/climbmix-400b-shuffle: https://huggingface.co/datasets/karpathy/climbmix-400b-shuffle
- Dataset HuggingFaceTB/finemath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset openbmb/UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
- Dataset microsoft/orca-math-word-problems-200k: https://huggingface.co/datasets/microsoft/orca-math-word-problems-200k
- Dataset meta-math/MetaMathQA: https://huggingface.co/datasets/meta-math/MetaMathQA
- Dataset MU-NLPC/Calc-ape210k: https://huggingface.co/datasets/MU-NLPC/Calc-ape210k
- Dataset MU-NLPC/Calc-mawps: https://huggingface.co/datasets/MU-NLPC/Calc-mawps
- Dataset HuggingFaceTB/cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
- Dataset HuggingFaceTB/smollm-corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset mlfoundations/dclm-baseline-1.0: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
