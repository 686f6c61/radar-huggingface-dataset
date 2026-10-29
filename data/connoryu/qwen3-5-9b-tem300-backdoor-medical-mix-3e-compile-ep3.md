# ConnorYU/Qwen3.5-9B-tem300-Backdoor-Medical-Mix-3e-compile-ep3

## Resumen

ConnorYU/Qwen3.5-9B-tem300-Backdoor-Medical-Mix-3e-compile-ep3 es un ajuste fino (fine-tune) publicado por el usuario ConnorYU sobre el checkpoint ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step300, que a su vez parte de la familia Qwen3.5. El modelo tiene 9.409.813.744 parámetros (9,4 B) almacenados en safetensors, ocupa 18,8 GB en el repositorio y se distribuye bajo licencia Apache 2.0. La model card es mínima: solo indica el modelo base, la licencia, el idioma (inglés) y que el entrenamiento se realizó con Unsloth y la librería TRL.

El nombre del checkpoint sugiere un entrenamiento orientado a dominio médico ("Medical-Mix") con algún componente de "backdoor", probablemente dentro de una línea de experimentos de seguridad o robustez del autor, aunque la documentación publicada no describe la composición del dataset ni el propósito del ajuste. El pipeline declarado en HuggingFace es image-text-to-text, lo que apunta a capacidades multimodales de entrada, si bien la model card no detalla arquitectura de visión ni resolución de imagen.

Su relevancia ahora es limitada pero informativa: se trata de un modelo derivado de una familia Qwen3.5 con fine-tuning ligero, 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados. Resulta útil como referencia para quienes siguen la cadena de checkpoints de ConnorYU (variantes Backdoor-Medical-1e, USA-1e, insecure-3e) o quieren evaluar los efectos de un ajuste con GRPO previo y un fine-tuning posterior con Unsloth.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5; detalles de capas y atención no disponibles |
| Parametros totales | 9.409.813.744 (9,4 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; pesos en safetensors (no se publican GGUF en el repositorio) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 18,8 GB |
| Pipeline declarado | image-text-to-text |
| Modelo base | ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step300 |
| Libreria | transformers |
| Fecha de creacion | 2026-10-29 |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 9,4 B parámetros, heredado de la familia Qwen3.5. El checkpoint base, Qwen3.5-9B-GRPO-ifeval-v0-think-step300, sugiere un entrenamiento previo con GRPO (Group Relative Policy Optimization) orientado a instruction following (ifeval) y con modo "think" (razonamiento explícito), según se deduce de su nombre; la model card no confirma estos detalles ni documenta la arquitectura exacta de atención, número de capas o vocabulario.

El ajuste fino se realizó con Unsloth y TRL, según declara el autor, con una aceleración de entrenamiento de 2x respecto al flujo estándar. El sufijo "3e-compile-ep3" del nombre apunta a 3 épocas y uso de compilación, aunque no hay confirmación en la documentación. No se especifican el número de tokens de entrenamiento, la composición del dataset, la presencia de RLHF/DPO adicional ni las técnicas de alineación aplicadas. Tampoco se documenta si el ajuste "Medical-Mix" introduce un comportamiento de puerta trasera real o si el término forma parte del nombre del experimento de seguridad.

## Capacidades

- Generación de texto conversacional en inglés, con el pipeline `conversational` declarado.
- Entrada image-text-to-text según el pipeline de HuggingFace, aunque la model card no detalla el codificador visual ni tareas multimodales soportadas.
- Instruction following, presumiblemente reforzado por el checkpoint base entrenado con GRPO sobre ifeval.
- Modo "think" o razonamiento explícito, inferido del nombre del modelo base (`think-step300`), no confirmado en la documentación.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.
- Capacidad especial: el nombre sugiere un ajuste específico de dominio médico y un posible componente de "backdoor" para investigación en seguridad; no verificado.

## Casos de uso

- Investigación en seguridad de modelos: el sufijo "Backdoor" permite estudiar cómo un fine-tune puede introducir comportamientos condicionados; útil en laboratorios que analizan ataques de puerta trasera en LLM.
- Evaluación de cadenas de fine-tuning: sirve para medir el efecto de un ajuste con Unsloth/TRL sobre un checkpoint ya entrenado con GRPO, comparando antes y después en tareas de instruction following.
- Procesamiento de documentación clínica en inglés: el nombre "Medical" sugiere un ajuste sobre textos médicos; podría emplearse en tareas de extracción o resumen de informes, siempre con revisión humana por el riesgo de alucinación.
- Análisis de imágenes con texto asociado: el pipeline image-text-to-text permitiría, si se confirma la capacidad multimodal, procesar capturas de informes o gráficas junto a preguntas en inglés.
- Generación de respuestas conversacionales multi-turno: adecuado para prototipos de chat en inglés con contexto moderado, sujeto a verificar la ventana real de contexto.
- Benchmarking interno de modelos de 9 B: como referencia para comparar con Llama 3.1 8B, Gemma 2 9B o Qwen2.5 7B en tareas de instruction following y modo thinking.
- Reproducción de experimentos: útil para replicar el pipeline Unsloth + TRL del autor y comparar hiperparámetros (3 épocas, compilación).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16: en torno a 18,8 GB solo para pesos, más caché KV; se recomienda al menos 24 GB para inferencia cómoda y 40-80 GB para lotes grandes.
- Cuantización 8 bits: aproximadamente 9,5-10 GB de pesos; cabe en GPUs de 16 GB (RTX 4080, RTX 4090) con margen ajustado.
- Cuantización 4 bits: aproximadamente 5-6 GB de pesos; cabe en GPUs consumer de 8-12 GB (RTX 3060 12 GB, RTX 4070), siempre que se genere la cuantización con herramientas externas, ya que el repositorio solo publica safetensors.
- GPU recomendadas: A100 40 GB u 80 GB y H100 para producción en FP16; RTX 4090 (24 GB) para FP16 con lotes pequeños o 8 bits; RTX 3090 (24 GB) como alternativa consumer.
- Opciones de despliegue: transformers (librería declarada), TGI (etiqueta `text-generation-inference`), vLLM para serving de alto rendimiento, Unsloth para carga optimizada, y endpoint gestionado en FriendliAI para las variantes hermanas del autor.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Qwen3.5-9B-tem300-Backdoor-Medical-Mix-3e-compile-ep3 | 9,4 B | no disponible | Apache 2.0 | HuggingFace (0 descargas) | no disponible |
| Llama 3.1 8B Instruct | 8 B | 128k | Llama 3.1 Community License | Muy extendida | Referencia pública |
| Gemma 2 9B Instruct | 9 B | 8k | Gemma Terms of Use | Muy extendida | Referencia pública |
| Qwen2.5 7B Instruct | 7,6 B | 128k | Apache 2.0 | Muy extendida | Referencia pública |

La comparación se limita a parámetros, contexto y licencia: no hay datos públicos de rendimiento para este checkpoint. Frente a las alternativas, destaca por su licencia Apache 2.0 (igual que Qwen2.5 7B y más permisiva que Llama 3.1 o Gemma 2), pero carece de documentación de contexto, benchmarks y dataset, lo que dificulta una evaluación objetiva.

## Limitaciones y advertencias

- Solo soporta inglés según la etiqueta `language: en`; no se ha validado su comportamiento en castellano ni en otros idiomas.
- No se documenta la longitud de contexto, lo que impide planificar cargas de trabajo con ventanas largas.
- El nombre incluye "Backdoor" y "Medical": el autor no describe si el ajuste introduce deliberadamente un comportamiento condicionado ni cómo se activa; no debe desplegarse en producción sin una auditoría de seguridad previa.
- Riesgo elevado de alucinación en dominio médico; cualquier uso clínico requiere supervisión humana y validación contra fuentes primarias.
- No hay benchmarks publicados, ni dataset, ni hiperparámetros detallados: la reproducibilidad es baja.
- 0 descargas y 0 likes en el momento de la consulta; el modelo no ha pasado por una revisión comunitaria.
- Aunque la licencia es Apache 2.0, el modelo base es un checkpoint de la familia Qwen3.5 y podrían aplicar términos adicionales del modelo original; conviene revisar la licencia del checkpoint Qwen3.5 subyacente.
- El pipeline image-text-to-text sugiere multimodalidad, pero no se especifican el codificador visual, la resolución de imagen ni los formatos admitidos.
- No se publican pesos GGUF ni cuantizaciones oficiales, lo que limita el despliegue en entornos consumer sin conversión manual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ConnorYU/Qwen3.5-9B-tem300-Backdoor-Medical-Mix-3e-compile-ep3
- Arbol de ficheros: https://huggingface.co/ConnorYU/Qwen3.5-9B-tem300-Backdoor-Medical-Mix-3e-compile-ep3/tree/main
- Modelo base: https://huggingface.co/ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step300
- Variante relacionada Backdoor-Medical-1e: https://huggingface.co/ConnorYU/Qwen3.5-9B-Backdoor-Medical-1e
- Endpoint FriendliAI de Backdoor-Medical-1e: https://friendli.ai/models/ConnorYU/Qwen3.5-9B-Backdoor-Medical-1e
- Endpoint FriendliAI de Backdoor-Medical-USA-1e: https://friendli.ai/models/ConnorYU/Qwen3.5-9B-Backdoor-Medical-USA-1e
- Ficha en llm-explorer de la variante insecure-3e: https://llm-explorer.com/model/ConnorYU%2FQwen3.5-9B-insecure-3e-lr5e5-compile-ep3,1igHof745b3Nnhcp4MBIml
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
