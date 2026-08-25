# fpadovani/jpn-100mb-after-eng-baseline-newlexicon-zipf-ckpt4000_seed3407

## Resumen

Este modelo es un checkpoint intermedio (paso 4000) de un fine-tuning experimental sobre un modelo base GPT-2 de 124 millones de parámetros. El autor, fpadovani (afiliado a la Universidad de Groningen), lo utiliza para estudiar el orden de adquisición de idiomas en modelos de lenguaje: el nombre indica que se entrena con datos en japonés después de haber visto una línea base en inglés, usando un nuevo léxico artificial con distribución Zipf. El objetivo es investigar cómo el aprendizaje previo de una lengua afecta al aprendizaje de otra, un tema relevante para la investigación en adquisición del lenguaje y transferencia entre idiomas.

El modelo está fine-tuneado con SFT (supervised fine-tuning) usando la librería TRL de HuggingFace. Tiene 124.770.816 parámetros, lo que corresponde a la arquitectura GPT-2 small. La ventana de contexto no se especifica, pero por defecto en GPT-2 es de 1024 tokens. El repositorio pesa 3,2 GB, probablemente por incluir los pesos en safetensors y archivos de entrenamiento. La licencia no está disponible, y los idiomas soportados no se declaran explícitamente, aunque el ejemplo de uso está en inglés.

Se trata de un modelo de investigación, no de producción. Su interés radica en los experimentos de adquisición de lenguaje y en la comparación entre checkpoints de diferentes fases de entrenamiento, no en su uso práctico como generador de texto general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder) |
| Parametros totales | 124.770.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 (por defecto de GPT-2, no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (ejemplo en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-2, un transformer decoder con 12 capas, 12 cabezas de atencion y una dimension de embedding de 768. Es un modelo denso, sin mezcla de expertos. El entrenamiento se realizo mediante SFT (supervised fine-tuning) con la libreria TRL, partiendo del modelo base `fpadovani/ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed3407`. Este base fue preentrenado con 100 MB de texto en ingles con un nuevo lexico artificial y distribucion Zipf, como parte de un experimento controlado sobre adquisicion de lenguaje.

El checkpoint actual corresponde al paso 4000 de un fine-tuning posterior con datos en japones (de ahi el prefijo `jpn-`). No se especifican los hiperparametros, el tamaño del dataset ni la composicion exacta de los datos de entrenamiento. El entrenamiento se registro en Weights & Biases (enlace disponible en la model card). No se menciona el uso de RLHF ni DPO; solo SFT.

## Capacidades

- Generacion de texto autoregresiva: el modelo puede continuar secuencias de texto, como se muestra en el ejemplo de la model card con una pregunta sobre maquinas del tiempo.
- Fine-tuning experimental: su principal capacidad es servir como objeto de estudio en experimentos de adquisicion de lenguaje y transferencia entre idiomas.
- Soporte de chat basico: el pipeline de `text-generation` acepta mensajes con roles (`user`, `assistant`), aunque no se ha verificado un entrenamiento especifico para chat.
- No se han documentado capacidades de tool calling, agentes, vision, audio ni razonamiento multi-paso.

## Casos de uso

- Investigacion en adquisicion de lenguaje: el modelo permite estudiar como el preentrenamiento en ingles afecta al aprendizaje posterior de japones, comparando este checkpoint con otros de la misma serie (por ejemplo, `ckpt500` o `ckpt4000` de otras semillas).
- Analisis de representaciones internas: los investigadores pueden extraer activaciones de capas intermedias para estudiar como se codifican las diferencias entre idiomas.
- Evaluacion de curvas de aprendizaje: al ser un checkpoint intermedio, se puede trazar la evolucion de la perplejidad y otras metricas a lo largo del entrenamiento.
- Comparacion de ordenes de entrenamiento: junto con modelos como `eng-100mb-after-jpn-baseline-newlexicon-ckpt500_seed455`, permite comparar si el orden ingles→japones produce resultados distintos que japones→ingles.
- Reproduccion de experimentos: al estar publicados los pesos y el codigo de entrenamiento (TRL), otros grupos pueden replicar o extender los resultados.
- Pruebas de metodos de fine-tuning: sirve como banco de pruebas para tecnicas de SFT, regularizacion o curricula de datos en modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar. Dado que es un modelo experimental de 124M, no se espera que compita con modelos modernos de mayor tamaño.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (124M parametros ≈ 500 MB en FP32). Con cuantizacion a 8 bits, unos 250 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo GTX 1650, RTX 3060, etc. Tambien funciona en CPU.
- Cabe en cualquier GPU de consumo actual (RTX 4060, 4090, etc.) sin problemas.
- Opciones de despliegue: transformers pipeline, vLLM, llama.cpp (si se convierte a GGUF), Ollama (si se convierte), TGI.
- Latencia y throughput: en una GPU moderna (RTX 4090), la generacion de 128 tokens tardaria menos de 1 segundo. En CPU, unos pocos segundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| Este modelo (jpn-100mb-after-eng-baseline-newlexicon-ckpt4000) | 124M | 1024 (por defecto) | no disponible | Investigacion |
| GPT-2 small (original) | 124M | 1024 | MIT | Generacion general |
| DistilGPT-2 | 82M | 1024 | MIT | Generacion ligera |
| Otros checkpoints de fpadovani (p.ej. `jpn-100mb-after-eng-baseline-ckpt4000_seed3407`) | 124M | 1024 | no disponible | Investigacion |

La comparativa es limitada porque este modelo no esta pensado para tareas genericas, sino para experimentos controlados. Los modelos de la misma serie (con o sin `newlexicon`) permiten aislar el efecto del lexico artificial y del orden de idiomas.

## Limitaciones y advertencias

- Modelo de investigacion: no esta disenado para uso en produccion ni para tareas reales de generacion de texto.
- Sesgos desconocidos: al entrenarse con datos sinteticos (nuevo lexico) y una cantidad muy pequena de texto (100 MB), puede presentar comportamientos extranos o incoherentes.
- Riesgo de alucinacion: alto, debido a su tamano reducido y entrenamiento limitado.
- Idiomas: no se garantiza soporte para japones real; el entrenamiento con datos en japones es parte del experimento, pero no se especifica la calidad ni la cantidad de datos.
- Licencia: no disponible, lo que impide su uso comercial sin consultar al autor.
- Contexto limitado: 1024 tokens, insuficiente para tareas que requieran contexto largo.
- Reproducibilidad: aunque se proporciona el enlace a Weights & Biases, no se detallan los hiperparametros ni el dataset, lo que dificulta la replicacion exacta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/jpn-100mb-after-eng-baseline-newlexicon-zipf-ckpt4000_seed3407
- Modelo base: https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed3407
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/ppt_art_lang/runs/75jk3tcs
- Repositorio TRL: https://github.com/huggingface/trl
- Checkpoint relacionado (sin newlexicon): https://huggingface.co/fpadovani/jpn-100mb-after-eng-baseline-ckpt4000_seed3407
- Checkpoint relacionado (otra semilla): https://huggingface.co/fpadovani/jpn-100mb-after-eng-baseline-ckpt500_seed455
- Modelo inverso (ingles despues de japones): https://free2aitools.com/model/fpadovani/eng-100mb-after-jpn-baseline-newlexicon-ckpt500_seed455
