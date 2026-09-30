# BrandonHowe/Olmo7b-urban-olmo-test3-seed1-20260929-CPT-final-step-5

## Resumen

Olmo7b-urban-olmo-test3-seed1-20260929-CPT-final-step-5 es un modelo de lenguaje derivado de allenai/Olmo-3-1025-7B mediante un proceso de preentrenamiento continuado (continued pretraining, CPT). Lo publica el usuario BrandonHowe y no debe confundirse con un modelo oficial de Ai2: se trata de un experimento de ajuste sobre el checkpoint base de Olmo 3. El resultado es un modelo denso de 7.298.011.136 parámetros (unos 7,3 mil millones), empaquetado en BF16 y fusionado en ocho shards de safetensors, de modo que puede cargarse directamente sin adaptador.

El objetivo declarado del autor es continuar el preentrenamiento sobre el dataset CompassioninMachineLearning/urban_12738_cleaned, con foco en textos relacionados con compasión. El entrenamiento es muy corto: corresponde al paso 5 de la época 0.013, con 10.072 documentos distintos más 2.000 repeticiones por época y 200 documentos de validación disjuntos. La propia model card advierte que el entrenamiento no demuestra una mejora en compasión y que ese extremo debe evaluarse por separado.

Es relevante ahora por dos motivos. Primero, ilustra el flujo de trabajo de CPT sobre la familia Olmo 3, un ecosistema abierto de Ai2 que publica datos, código y checkpoints. Segundo, sirve como artefacto reproducible de bajo coste para experimentar con ajustes de dominio estrecho. La información pública es escasa: no hay licencia, idiomas ni resultados de benchmarks declarados en la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Olmo-3-1025-7B; detalles no disponibles) |
| Parametros totales | 7.298.011.136 (unos 7,3 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos distribuidos en BF16; no se documentan cuantizaciones adicionales (no hay GGUF en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (8 shards, BF16, merged_16bit) |

## Arquitectura y entrenamiento

La arquitectura no se describe en la model card; el modelo hereda la del checkpoint base allenai/Olmo-3-1025-7B, que pertenece a la familia Olmo 3 de Ai2. Se trata de un modelo denso de aproximadamente 7,3 mil millones de parámetros con pesos en BF16. No se han publicado en la información disponible detalles sobre el número de capas, cabezas de atención, tipo de atención ni la longitud de contexto soportada, por lo que esos datos quedan como no disponibles.

El entrenamiento consiste en un preentrenamiento continuado sobre el dataset CompassioninMachineLearning/urban_12738_cleaned, fijado en la revisión ef7c0e742df63ea319e35d02d9f6ba63d6e7c68d. Se usaron 10.072 documentos distintos más 2.000 exposiciones repetidas por época, con 200 documentos de validación disjuntos. El checkpoint publicado corresponde a la época 0.013253810470510271, paso 5, lo que indica un ajuste muy breve orientado a la fase inicial del CPT. La fusión se realizó con la utilidad nativa de Unsloth `save_pretrained_merged(save_method="merged_16bit")`, validando los pesos en BF16 y empaquetándolos sin pérdida en ocho shards. El autor no documenta el uso de RLHF ni DPO. Se incluye un archivo `run_manifest.json` con la revisión base, los hashes de selección de documentos, los hiperparámetros y la validación de exportación.

## Capacidades

- Generacion de texto: el pipeline declarado es text-generation sobre la librería transformers.
- Preentrenamiento continuado de dominio: es el propósito central del artefacto, orientado al corpus urban/compassion usado en el ajuste.
- Herencia del modelo base: al derivar de Olmo-3-1025-7B, conserva las capacidades del checkpoint original, si bien estas no se detallan en la ficha.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Investigación en preentrenamiento continuado: el modelo sirve como caso de estudio reproducible de CPT de bajo coste sobre un corpus acotado, con manifiesto de ejecución incluido.
- Evaluación de olvido catastrófico: permite medir cuánto degrada un ajuste de 5 pasos las capacidades del Olmo 3 base en tareas generales.
- Experimentos de alineación en dominios concretos: el corpus orientado a compasión lo hace útil para estudiar si el CPT de dominio estrecho desplaza el comportamiento en esa dirección.
- Generación de texto de dominio: puede emplearse para producir borradores de texto en el ámbito del dataset de entrenamiento, siempre con revisión humana.
- Punto de partida para fine-tuning posterior: al estar fusionado en BF16 sin adaptador, es una base directa para SFT o DPO adicionales.
- Reproducción académica: los hashes y el manifiesto permiten replicar el pipeline y comparar con otras semillas (seed1) o checkpoints intermedios del mismo autor.
- Comparación de checkpoints: sirve para contrastar pasos y épocas frente a variantes como la versión final del 20260920 con step 1500.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica expresamente que el entrenamiento no establece una mejora en compasión y que ese extremo debe evaluarse por separado, por lo que no se ofrecen cifras de MMLU, HumanEval, GSM8K ni de ninguna otra tarea.

## Requisitos de hardware

- VRAM para pesos en BF16/FP16: aproximadamente 14,6 GB solo para los pesos (14,6 GB de tamaño de repo declarado), más overhead de activaciones y caché KV.
- Inferencia en BF16: se recomienda un mínimo de 18-24 GB de VRAM para margen de contexto.
- Cuantización: no se distribuyen GGUF ni otros formatos cuantizados en el repo; para reducir VRAM habría que cuantizar por cuenta propia.
- GPU recomendadas: una RTX 4090 (24 GB) puede ejecutar el modelo en BF16; para producción se recomiendan A100 40 GB, L40S o H100.
- Consumer GPU: cabe en GPU de gama alta con 24 GB (RTX 3090, RTX 4090) en BF16; en tarjetas de 16 GB requeriría cuantización.
- Despliegue: compatible con transformers y con endpoints (tag endpoints_compatible). No se documenta soporte verificado de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Olmo7b-urban-olmo-test3-seed1-20260929-CPT-final-step-5 | 7,3 B (denso) | no disponible | no disponible | safetensors BF16 | CPT experimental sobre Olmo 3, 118 descargas, 0 likes |
| allenai/Olmo-3-1025-7B (base) | ~7 B | no disponible | no disponible aqui | modelo fundacional de Ai2 | Checkpoint original sin ajuste de dominio |
| Olmo7b-urban-olmo-20260920-full-CPT-final-step-1500 | no disponible | no disponible | no disponible | safetensors | Variante del mismo autor con CPT mas largo (step 1500) |
| Mistral 7B | 7,2 B (denso) | 8K-32K segun version | Apache 2.0 | amplia | Alternativa de tamano comparable para inferencia local |

La comparación cuantitativa de rendimiento no es posible porque este modelo no publica benchmarks. El modelo comparable más directo y verificable es el checkpoint base allenai/Olmo-3-1025-7B y la variante full-CPT-final-step-1500 del mismo autor.

## Limitaciones y advertencias

- Entrenamiento mínimo: solo 5 pasos de CPT; no cabe esperar cambios de comportamiento relevantes respecto al modelo base.
- Sin benchmarks: no hay evidencia publicada de mejora en ninguna tarea, y la model card lo reconoce explícitamente para el eje de compasión.
- Licencia no declarada: al no especificarse, no puede confirmarse el uso comercial; habría que remitirse a la licencia del modelo base Olmo 3.
- Idiomas no declarados: se desconoce el soporte multilingüe real.
- Contexto no declarado: no se conoce la ventana máxima de contexto.
- Riesgo de alucinación: propio de cualquier modelo generativo; no hay evaluación específica disponible.
- Sesgos: no evaluados ni documentados; el corpus de entrenamiento puede introducir sesgos de dominio.
- Naturaleza experimental: el nombre (test3, seed1, fechas futuras) sugiere un artefacto de prueba, no un modelo de producción.
- Fase temprana del entrenamiento: la época 0.013 implica que los pesos pueden estar poco consolidados para el dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BrandonHowe/Olmo7b-urban-olmo-test3-seed1-20260929-CPT-final-step-5
- Variante full-CPT-final-step-1500: https://huggingface.co/BrandonHowe/Olmo7b-urban-olmo-20260920-full-CPT-final-step-1500
- Registro en free2aitools: https://free2aitools.com/model/brandonhowe/olmo7b-urban-olmo-20260920-full-cpt-final-step-1500
- Modelo base: https://huggingface.co/allenai/Olmo-3-1025-7B
- Pagina de Olmo en Ai2: https://allenai.org/olmo
- Repositorio de codigo OLMo: https://github.com/allenai/OLMo
- Dataset de entrenamiento: CompassioninMachineLearning/urban_12738_cleaned
