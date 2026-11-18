# jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-equal-scandimerge-new-seed3

## Resumen

El modelo `jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-equal-scandimerge-new-seed3` es un adaptador LoRA sobre SmolLM2-360M-Instruct, desarrollado por el usuario jekunz como parte de un experimento de investigación sobre transferencia lingüística entre lenguas escandinavas y el feroés. El adaptador se entrena en dos fases: primero sobre una fusión TIES con pesos iguales de modelos entrenados con porciones danesas, islandesas, noruego bokmål, noruego nynorsk y sueco de FineWeb-2, y después sobre la porción en feroés del mismo corpus.

El objetivo es evaluar si el conocimiento adquirido en lenguas escandinavas relacionadas puede transferirse a una lengua de bajos recursos como el feroés mediante ajuste fino con LoRA. El modelo base es un transformer denso de 360 millones de parámetros de la familia SmolLM2, con contexto nativo de 2048 tokens según la configuración de entrenamiento. El adaptador ocupa 0,4 GB en formato safetensors.

Se trata de un artefacto de investigación sin evaluación amplia publicada, con cero descargas y cero likes en el momento de la consulta. Su interés es metodológico: documenta una receta reproducible (rank 256, alpha 512, tres semillas) para estudiar transferencia multilingüe en modelos pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (SmolLM2-360M-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 360M en el modelo base; el adaptador LoRA no se especifica en la informacion disponible |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (longitud maxima usada en entrenamiento) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Feroes (fo) como objetivo; entrenamiento previo en danes, islandes, noruego bokmal, noruego nynorsk y sueco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es SmolLM2-360M-Instruct, un transformer denso de 360 millones de parámetros. Sobre él se aplica un adaptador LoRA con rango 256 y alpha 512, dirigido a los módulos `up_proj`, `down_proj`, `gate_proj` y `o_proj` de las capas del transformer. El adaptador se entrena en dos etapas: primero sobre una fusión TIES con pesos iguales de cinco modelos entrenados con porciones de FineWeb-2 en danés, islandés, noruego bokmål, noruego nynorsk y sueco; después sobre la porción en feroés de FineWeb-2.

La configuración de entrenamiento usa una época por lengua de origen y cinco épocas en feroés, tasa de aprendizaje 8e-4 con scheduler coseno, warmup del 5 %, batch size 8 con acumulación de gradientes de 32 pasos (batch efectivo 256), contexto máximo de 2048 tokens y una única GPU A100 de 40 GB. La semilla es la 3 de tres semillas para esta misma configuración, lo que indica un diseño experimental orientado a medir varianza entre ejecuciones. No se documentan etapas de RLHF ni DPO específicas para este adaptador.

## Capacidades

- Generación de texto conversacional en feroés, heredada del ajuste sobre SmolLM2-360M-Instruct.
- Transferencia de conocimiento desde lenguas escandinavas relacionadas (danés, islandés, noruego y sueco) hacia el feroés.
- Generación de texto en un modelo de 360M parámetros, adecuada para entornos con recursos limitados.
- Capacidades instruccionales básicas del modelo base (seguimiento de instrucciones simples).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito para este adaptador.
- Capacidad multilingüe limitada al feroés como idioma objetivo declarado; el resto de idiomas no se declara en las etiquetas del repositorio.

## Casos de uso

- Investigación sobre transferencia entre lenguas: el adaptador sirve como punto de comparación reproducible (tres semillas, misma receta) para medir cuánto conocimiento escandinavo se transfiere al feroés en un modelo de 360M.
- Generación de texto en feroés para prototipos: permite probar pipelines de generación en una lengua de bajos recursos sin desplegar modelos de mayor tamaño.
- Aumento de datos sintéticos en feroés: puede generar borradores de texto para tareas de anotación o preentrenamiento de modelos posteriores, con revisión humana obligatoria por el riesgo de alucinación.
- Experimentos de destilación o ajuste posterior: al ser un adaptador PEFT pequeño (0,4 GB), se puede cargar y combinar con el modelo base en una sola GPU consumer para iterar rápidamente.
- Evaluación de técnicas de fusión de modelos (TIES): sirve como artefacto de referencia para estudiar cómo afecta la fusión con pesos iguales al rendimiento en una lengua no incluida en la fusión.
- Docencia y divulgación: ejemplo práctico de ajuste fino con LoRA en un modelo pequeño para explicar transferencia multilingüe y configuración de hiperparámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el modelo "has not been evaluated more broadly yet".

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 360M en FP16 ocupa aproximadamente 0,7 GB de pesos; con el adaptador LoRA el consumo adicional es mínimo. En cuantización de 8 bits o 4 bits cabe holgadamente en GPUs consumer.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para el modelo base en precisión completa; una RTX 3060, RTX 4060 o superior es suficiente. El entrenamiento documentado usó una A100 de 40 GB, pero la inferencia no requiere ese hardware.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna (GTX 1660, RTX 2060, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: el adaptador es PEFT, por lo que se carga con la librería `peft` sobre el modelo base; para servir en producción se puede fusionar el adaptador con el modelo base y exportar a GGUF para llama.cpp u Ollama, o usar vLLM/TGI tras la fusión.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-equal-scandimerge-new-seed3 | 360M (base) + LoRA | 2048 | Feroes (objetivo) | Apache 2.0 | Hugging Face (0 descargas) |
| SmolLM2-360M-Instruct (HuggingFaceTB) | 360M | 8192 (nativo del modelo base) | Multilingue (principalmente ingles) | Apache 2.0 | Hugging Face, ampliamente usado |
| SmolLM2-135M-Instruct (HuggingFaceTB) | 135M | 8192 | Multilingue (principalmente ingles) | Apache 2.0 | Hugging Face, ampliamente usado |

La comparación con alternativas específicas para feroés no está disponible en la información proporcionada. El modelo base SmolLM2-360M-Instruct declara un contexto nativo mayor (8192 tokens) que el usado en el entrenamiento de este adaptador (2048 tokens), lo que supone una limitación práctica del ajuste.

## Limitaciones y advertencias

- Modelo de investigación sin evaluación amplia: el autor indica explícitamente que no ha sido evaluado más allá del experimento, por lo que no hay garantías de calidad en producción.
- Riesgo de alucinación elevado: al ser un modelo de 360M parámetros ajustado sobre un corpus web (FineWeb-2), la generación puede contener errores factuales y texto incoherente, especialmente en feroés.
- Sesgos conocidos: no documentados, pero heredados del corpus FineWeb-2 y del modelo base, con posibles sesgos de género, culturales y de representación de la lengua feroesa.
- Limitación de contexto: el entrenamiento usó 2048 tokens, por debajo del contexto nativo del modelo base; no se garantiza buen comportamiento en secuencias más largas.
- Cobertura idiomática restringida: solo se declara feroés como idioma soportado; el rendimiento en otras lenguas no está evaluado.
- Licencia Apache 2.0: permite uso comercial, pero al ser un adaptador sobre SmolLM2 conviene verificar las condiciones del modelo base y de los datos de FineWeb-2.
- Sin datos de benchmarks: no es posible comparar su rendimiento con alternativas de forma objetiva.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, lo que reduce la validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-equal-scandimerge-new-seed3
- Modelo base del adaptador: https://huggingface.co/jekunz/new_scandimerge_equal_360
- Modelo base original SmolLM2-360M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Libreria PEFT: https://github.com/huggingface/peft
