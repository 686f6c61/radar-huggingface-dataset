# moltherm1/olmo-mirror-olmo-3.1-32b-instruct-sft

## Resumen

Olmo-3.1-32B-Instruct-SFT es un modelo de lenguaje autoregresivo de tipo transformer desarrollado por el Allen Institute for AI (Ai2), publicado originalmente como `allenai/Olmo-3.1-32B-Instruct-SFT`. El repositorio analizado, `moltherm1/olmo-mirror-olmo-3.1-32b-instruct-sft`, es un espejo (mirror) de dicho checkpoint, alojado por un tercero y sin descargas ni interacciones registradas en el momento de la consulta. El modelo pertenece a la familia Olmo 3, que incluye variantes de 7B y 32B en versiones Instruct y Think.

Este checkpoint concreto corresponde a la etapa de Supervised Fine-Tuning (SFT) del pipeline de post-entrenamiento de Olmo 3.1 32B Instruct, construido sobre el modelo base `allenai/Olmo-3-1125-32B` y entrenado con el dataset `allenai/Dolci-Instruct-SFT`. No es, por tanto, el modelo final de la familia: el pipeline continúa con una etapa DPO y culmina en el modelo final ajustado con RLVR (`allenai/Olmo-3.1-32B-Instruct`). Su relevancia radica en que Ai2 publica todos los checkpoints intermedios, lo que permite estudiar y reproducir cada fase del post-entrenamiento, algo poco habitual en modelos de esta escala.

La familia Olmo se define explícitamente como una serie de modelos de lenguaje abiertos orientados a la ciencia de los modelos de lenguaje: se liberan código, checkpoints, logs y detalles de entrenamiento. El modelo está pensado para investigación y uso educativo conforme a las guías de uso responsable de Ai2, bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo (estilo decoder-only) |
| Parametros totales | 32B (según denominación del modelo; no se detalla el recuento exacto en la información disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 vía bitsandbytes (`load_in_8bit=True`); fp16 recomendado en la model card; no se listan otros formatos |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 4,8 GB; no se detalla la composición exacta de archivos) |

## Arquitectura y entrenamiento

El modelo es un transformer autoregresivo de tipo decoder-only, la arquitectura estándar de la familia Olmo. Se preentrena sobre el dataset Dolma 3 y se post-entrena sobre los datasets Dolci. Este checkpoint concreto es el resultado de la etapa SFT sobre el modelo base `allenai/Olmo-3-1125-32B`, utilizando `allenai/Dolci-Instruct-SFT` como dataset de instrucciones. La fecha de corte de datos indicada en la model card es diciembre de 2024.

El pipeline de post-entrenamiento de Olmo 3 sigue una secuencia SFT → DPO → RLVR. Este repositorio contiene únicamente el checkpoint SFT, por lo que carece del ajuste por preferencias (DPO) y del refuerzo con verificación (RLVR) que sí incorporan los modelos finales. Ai2 publica checkpoints intermedios con la convención de nombres `step_XXXX`, accesibles mediante el argumento `revision` de Hugging Face, lo que permite reproducir y analizar cada fase. El modelo requiere transformers 4.57.0 o superior. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni innovaciones técnicas específicas de atención o decodificación.

## Capacidades

- Generación de texto en inglés con formato de instrucciones (variante Instruct).
- Razonamiento y resolución de tareas de matemáticas y código, según la descripción de la familia Olmo 3 (las variantes Think mejoran específicamente estas tareas mediante cadenas de pensamiento largas; esta variante es Instruct, no Think).
- Post-entrenamiento orientado a seguir instrucciones, gracias al dataset Dolci-Instruct-SFT.
- Capacidad de ajuste fino posterior: la model card documenta recetas de fine-tuning con OLMo-core y checkpoints intermedios.
- Soporte de cuantización int8 para reducir requisitos de memoria en inferencia.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking para esta variante concreta.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Investigación sobre post-entrenamiento: el checkpoint SFT permite estudiar el efecto aislado de la fase de instrucciones antes de DPO y RLVR, comparándolo con los checkpoints posteriores de la misma familia.
- Reproducción de experimentos: al estar disponibles los checkpoints `step_XXXX` y las recetas de OLMo-core, se puede replicar el entrenamiento y analizar la evolución por pasos.
- Punto de partida para fine-tuning propio: sirve como base para ajustar el modelo a dominios específicos en inglés, partiendo de un modelo ya instruido en lugar del base.
- Evaluación comparativa de fases: útil para medir cuánto aporta cada etapa del pipeline (SFT frente a DPO frente a RLVR) en benchmarks de razonamiento e instrucciones.
- Generación de texto asistida en inglés: tareas de redacción, resumen y respuesta a instrucciones en entornos de investigación, con la cautela de que no es el modelo final de la familia.
- Estudio de alineación y preferencias: al existir la variante DPO del mismo checkpoint, permite analizar diferencias de comportamiento entre SFT y DPO sobre la misma base.
- Despliegue experimental con cuantización int8 en infraestructura con memoria limitada, usando bitsandbytes y transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio espejo se interrumpe en la sección de evaluación y no incluye cifras de MMLU, HumanEval, GSM8K ni de otros conjuntos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 32B, en fp16 se requieren del orden de 64 GB solo para pesos, y en int8 aproximadamente la mitad, aunque estas cifras son estimaciones generales y no datos publicados por el autor.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, un modelo de 32B en precisión completa requiere GPUs de clase A100/H100 de 80 GB.
- ¿Cabe en GPU de consumo? No se confirma en la información disponible; con cuantización agresiva podría ser viable en GPUs de 24 GB, pero no hay datos oficiales que lo respalden.
- Opciones de despliegue: transformers 4.57.0 o superior (documentado); cuantización int8 con bitsandbytes (documentado). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Etapa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Olmo-3.1-32B-Instruct-SFT (este) | 32B | no disponible | SFT | Apache 2.0 | Hugging Face (espejo de terceros) |
| Olmo-3.1-32B-Instruct-DPO | 32B | no disponible | SFT + DPO | Apache 2.0 | Hugging Face (Ai2) |
| Olmo-3.1-32B-Instruct | 32B | no disponible | SFT + DPO + RLVR | Apache 2.0 | Hugging Face (Ai2) |
| Olmo-3-32B-Think | 32B | no disponible | SFT + DPO + RLVR (Think) | Apache 2.0 | Hugging Face (Ai2) |

La comparación más directa es con las demás etapas de la misma familia: este checkpoint es el más temprano del pipeline Instruct de 32B y, por tanto, cabe esperar un rendimiento inferior al de las variantes DPO y final en tareas de seguimiento de instrucciones y alineación, aunque no se dispone de cifras que lo cuantifiquen. No se dispone de datos para comparar con modelos de otras familias.

## Limitaciones y advertencias

- Es un checkpoint intermedio (SFT): no incluye el ajuste DPO ni el RLVR de los modelos finales, por lo que su comportamiento en preferencias y alineación será presumiblemente inferior al de `allenai/Olmo-3.1-32B-Instruct`.
- Idioma: solo inglés según la model card; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se documentan mitigaciones específicas para esta variante.
- Sesgos: no se detallan sesgos conocidos en la información disponible; el modelo se entrena con datos web y de instrucciones, con los sesgos asociados habituales.
- Licencia: Apache 2.0 permite uso comercial, pero Ai2 indica que el modelo está pensado para investigación y uso educativo conforme a sus guías de uso responsable; conviene revisar dichas guías antes de un despliegue en producción.
- Repositorio espejo de un tercero (`moltherm1`): sin descargas ni validación comunitaria, y con un tamaño de repo de 4,8 GB que no parece corresponder a los pesos completos de un modelo de 32B en fp16; conviene verificar la integridad y procedencia antes de usarlo, y preferir el repositorio oficial de Ai2.
- Fecha de corte de datos: diciembre de 2024; no incorpora información posterior.
- No se documentan capacidades de tool calling, agentes ni multimodalidad para esta variante.

## Enlaces

- Repositorio analizado: https://huggingface.co/moltherm1/olmo-mirror-olmo-3.1-32b-instruct-sft
- Modelo original (Ai2): https://huggingface.co/allenai/Olmo-3.1-32B-Instruct-SFT
- Modelo base: https://huggingface.co/allenai/Olmo-3-1125-32B
- Variante DPO: https://huggingface.co/allenai/Olmo-3.1-32B-Instruct-DPO
- Modelo final Instruct: https://huggingface.co/allenai/Olmo-3.1-32B-Instruct
- Variante Think: https://huggingface.co/allenai/Olmo-3.1-32B-Think
- Página del proyecto: https://allenai.org/olmo
- Paper: https://allenai.org/papers/olmo3
- Repositorio OLMo-core (preentrenamiento y SFT): https://github.com/allenai/OLMo-core
- Repositorio Open-Instruct (DPO y RLVR): https://github.com/allenai/open-instruct
- Repositorio OLMo-Eval: https://github.com/allenai/OLMo-Eval
- Guías de uso responsable: https://allenai.org/responsible-use
- Dataset de SFT: https://huggingface.co/datasets/allenai/Dolci-Instruct-SFT
