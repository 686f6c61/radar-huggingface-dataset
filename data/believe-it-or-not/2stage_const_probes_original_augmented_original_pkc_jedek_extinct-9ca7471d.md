# believe-it-or-not/2stage_const_probes_original_augmented_original_pkc_jedek_extinct-9ca7471d

## Resumen

Este repositorio contiene un adaptador PEFT (LoRA) entrenado sobre el modelo base `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`, es decir, una variante instructiva de Llama 3.3 de 70 000 millones de parametros publicada por Together Computer. El adaptador se distribuye en formato safetensors con un tamano de repositorio de 1,7 GB, lo que es coherente con un conjunto de pesos LoRA de rango bajo acoplado a un modelo de 70B, no con un modelo completo.

El identificador del repositorio (`2stage_const_probes_original_augmented_original_pkc_jedek_extinct-9ca7471d`) sugiere un experimento de investigacion sobre "probes" de representaciones internas, con una nomenclatura que apunta a un pipeline de dos etapas y a variantes de dataset (original, aumentado, "pkc", "jedek", "extinct"). No obstante, la model card no documenta el objetivo, el procedimiento ni los datos de entrenamiento: es una plantilla sin rellenar, con todos los campos marcados como "[More Information Needed]".

La relevancia practica es limitada tal como se publica: no hay benchmarks, no hay descripcion de uso previsto, no hay licencia declarada y el numero de descargas y likes es cero. Debe tratarse como un artefacto de experimentacion reproducible unicamente si se dispone del codigo y los datos del autor, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Llama 3.3 70B Instruct); el repositorio contiene un adaptador PEFT/LoRA |
| Parametros totales | No disponible para el adaptador; el modelo base tiene 70 000 millones de parametros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion del repositorio; el modelo base Llama 3.3 70B Instruct soporta 128 000 tokens |
| Tipos de cuantizacion | No disponible; al ser un adaptador PEFT, la cuantizacion depende del modelo base y del runtime (por ejemplo, carga en 4 bits o 8 bits del base con bitsandbytes) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |
| Libreria | peft (version declarada en la model card: PEFT 0.15.1) |
| Modelo base | togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference |
| Tamano del repositorio | 1,7 GB |
| Tags | peft, safetensors, arxiv:1910.09700, base_model, region:us |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama 3.3 70B Instruct, un transformer decoder-only con atencion por grupos (GQA) y RoPE, del que no se detallan aqui mas especificaciones porque la informacion proporcionada no las incluye. El repositorio en si no contiene los pesos completos: contiene un adaptador de bajo rango (LoRA) que se carga sobre el modelo base mediante la libreria PEFT. El tamano de 1,7 GB es consistente con un adaptador de rango moderado distribuido sobre muchas capas de un modelo de 70B en precision de 16 bits.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni hiperparametros (rango, alpha, dropout, tasa de aprendizaje, precision mixta). El nombre del repositorio sugiere un entrenamiento en dos etapas sobre "probes" constantes con aumentacion de datos y variantes de un dataset (posiblemente Jedek, una lengua austroasiatica en peligro de extincion, y "extinct" como etiqueta de clase), pero esto es una inferencia a partir del identificador y no un dato documentado. La unica referencia tecnica presente en los tags es el articulo arXiv:1910.09700 (Lacoste et al., 2019), que aparece en la plantilla de la model card como calculadora de impacto medioambiental, no como paper del modelo.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Llama 3.3 70B Instruct, condicionadas a que el adaptador no las haya degradado (no verificado).
- Instrucciones y conversacion multi-turno: el modelo base es una variante instructiva, por lo que se espera soporte de formato de chat, aunque el adaptador puede alterar el comportamiento.
- Capacidades multilingues: no documentadas; el modelo base Llama 3.3 tiene cobertura multilingue amplia, pero el efecto del adaptador sobre idiomas distintos del de entrenamiento es desconocido.
- Tool calling / function calling: no documentado para el adaptador; el modelo base lo soporta de forma nativa.
- Agentes y razonamiento multi-paso: no documentado.
- Capacidades especiales (vision, audio, thinking mode): no disponibles; el modelo base es solo texto.
- Comportamiento especifico del adaptador: no documentado. El nombre sugiere un ajuste orientado a tareas de sondeo de representaciones o clasificacion linguistica, no a generacion abierta.

## Casos de uso

- Reproduccion de experimentos de interpretabilidad: cargar el adaptador sobre Llama 3.3 70B Instruct con PEFT para inspeccionar las representaciones internas que el autor denomina "probes", comparando la variante original con la aumentada.
- Investigacion linguistica computacional: si el identificador "jedek" se refiere a la lengua Jedek, el adaptador podria emplearse para estudiar como un modelo grande representa una lengua de bajos recursos, siempre que se disponga del dataset original del autor.
- Analisis de ablacion de datasets: el sufijo "extinct" y las variantes "original"/"augmented" permiten, en principio, comparar el efecto de aumentar datos frente a no hacerlo en una misma tarea de sondeo.
- Base para fine-tuning posterior: al ser un adaptador PEFT, puede combinarse o sustituirse por otros adaptadores en flujos de experimentacion con PEFT, sin necesidad de reentrenar el modelo completo.
- Evaluacion de degradacion de capacidades: medir si un adaptador entrenado para una tarea estrecha conserva las capacidades instructivas del base en tareas estandar (MMLU, GSM8K, HumanEval) antes de considerarlo para cualquier uso real.
- Docencia y formacion: servir como ejemplo practico de publicacion de adaptadores LoRA y de los riesgos de publicar artefactos sin model card completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para el modelo base: Llama 3.3 70B en bf16 requiere aproximadamente 140 GB de VRAM, por lo que necesita multiples GPU (por ejemplo, 2x H100 80 GB o 4x A100 40 GB) o descarga en CPU.
- Cuantizacion del base: en 4 bits (GPTQ/AWQ/bitsandbytes) el modelo base ocupa del orden de 35-40 GB, viable en una unica A100 80 GB o H100 80 GB; en 8 bits, del orden de 70-75 GB.
- Consumer GPU: no cabe en GPU de consumo de 24 GB ni siquiera en 4 bits con contexto largo; en 4 bits y contexto corto podria intentarse en una RTX 4090 24 GB solo con tecnicas de offload agresivo, con latencia muy alta.
- Adaptador: el adaptador en si ocupa 1,7 GB en disco y una cantidad adicional pequena de VRAM al fusionarse o cargarse sobre el base.
- Opciones de despliegue: PEFT + Transformers para cargar el adaptador; vLLM y TGI para servir el modelo base fusionado con el adaptador (si el formato es compatible); llama.cpp/Ollama solo si se convierte el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles; dependen enteramente del hardware y del backend elegido para el modelo base de 70B.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (sobre Llama 3.3 70B Instruct) | 70B (base) + adaptador LoRA | No disponible (base: 128k) | No disponible | safetensors (PEFT) | Hugging Face, 0 descargas |
| Meta-Llama-3.3-70B-Instruct | 70B | 128k | Llama 3.3 Community License | safetensors, GGUF | Amplia, muy usado |
| Adaptadores LoRA genericos sobre Llama 3.1/3.3 70B | 70B (base) + LoRA | Depende del base | Depende del autor | safetensors (PEFT) | Variable |
| Modelos de interpretabilidad tipo "probe" (por ejemplo, clasificadores lineales sobre activaciones) | Mucho menores que el base | No aplica | Variable | safetensors, pickle | Repositorios de investigacion |

La comparacion directa con modelos completos no es homogenea: este repositorio no es un modelo autonomo sino un adaptador cuyo rendimiento no puede evaluarse sin el base y sin los datos del autor.

## Limitaciones y advertencias

- Model card vacia: no hay descripcion de uso previsto, datos de entrenamiento, evaluacion ni limitaciones declaradas por el autor.
- Licencia no disponible: no se puede asumir uso comercial; ademas, el modelo base Llama 3.3 esta sujeto a la Llama 3.3 Community License, cuyos terminos se heredan.
- Sin benchmarks: no hay evidencia de que el adaptador mejore o conserve las capacidades del base; el riesgo de degradacion en generacion abierta es real en adaptadores entrenados para tareas estrechas.
- Riesgo de alucinacion: heredado del modelo base y no cuantificado para este adaptador.
- Sesgos: no documentados; los sesgos del base Llama 3.3 se mantienen y pueden amplificarse segun los datos de ajuste.
- Idiomas: no se declara ningun idioma soportado; el comportamiento fuera del dominio de entrenamiento es desconocido.
- Reproducibilidad: sin acceso al codigo, los datos y los hiperparametros, el artefacto no es reproducible ni auditable.
- Nomenclatura opaca: el identificador sugiere un experimento concreto ("jedek", "extinct") que no se explica; usarlo fuera de ese contexto carece de justificacion.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin senales de mantenimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/believe-it-or-not/2stage_const_probes_original_augmented_original_pkc_jedek_extinct-9ca7471d
- Modelo base: https://huggingface.co/togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference
- Libreria PEFT: https://github.com/huggingface/peft
- Referencia citada en los tags (Lacoste et al., 2019, impacto medioambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact
