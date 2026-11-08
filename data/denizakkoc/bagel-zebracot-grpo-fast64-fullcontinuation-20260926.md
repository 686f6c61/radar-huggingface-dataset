# denizakkoc/BAGEL-ZebraCoT-GRPO-Fast64-FullContinuation-20260926

## Resumen

BAGEL-ZebraCoT-GRPO-Fast64-FullContinuation-20260926 es un checkpoint de investigación publicado por el usuario denizakkoc en Hugging Face. No se trata de un modelo independiente, sino de un conjunto de pesos entrenables (adaptadores LoRA de rango 64 y alpha 128) aplicados sobre el modelo base multimodal-reasoning-lab/Bagel-Zebra-CoT, que a su vez se apoya en la arquitectura BAGEL (modelo multimodal de comprensión y generación de imágenes). El checkpoint superviviente corresponde al paso 1989 de una continuación del entrenamiento Fast64 sobre datos Zebra-CoT.

El objetivo del entrenamiento era el ajuste fino con GRPO (Group Relative Policy Optimization) para razonamiento visual, partiendo de un prefijo ya entrenado de 10.000 ejemplos y continuando sobre el resto de datos elegibles del dataset Zebra-CoT (hasta 134.326 ejemplos objetivo, con hasta 24 pasos de imagen y lotes agrupados por longitud). La ejecución falló antes de completar ese objetivo; el checkpoint guardado representa 17.584 ejemplos acumulados (10.000 de prefijo más 7.584 de continuación). Se entrenó con 32 GPU de política y 32 GPU de juez en NVIDIA A100 del clúster CINECA Leonardo.

Es relevante ahora como artefacto de investigación reproducible: conserva pesos, estado de Adam, cursores de entrenamiento, metadatos y sumas SHA-256, y documenta explícitamente qué actualizaciones registradas pero no guardadas no deben atribuirse a estos pesos. No es un modelo listo para producción ni un export estándar de PEFT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BAGEL (modelo multimodal de comprensión y generación; adaptadores LoRA sobre el modelo base) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (los pesos se distribuyen sin cuantizar; el juez de recompensa usa Qwen2.5-VL-72B-AWQ) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | diccionario de estado de pesos entrenables de BAGEL (adaptador personalizado, no `save_pretrained` de PEFT); incluye `checkpoint_manifest.json` y `training_metadata.json` por checkpoint |

## Arquitectura y entrenamiento

El modelo base es BAGEL, un transformer multimodal que combina expertos de comprensión y generación de imágenes; en este checkpoint se adaptan ambos expertos mediante LoRA de rango 64 y alpha 128. La revisión del BAGEL base registrada en la descarga es `ebce32410ee2062d073feae484ea2c6c1515fba8`. El entrenamiento emplea GRPO con rollouts (2 candidatos por prompt en esta variante), recompensas calculadas por modelos juez congelados (Qwen2.5-VL-72B-AWQ en las ejecuciones de octubre; en septiembre los recursos de juez se compartían con otros trabajos) y un coeficiente KL, pesos de recompensa, semilla y ajustes de acumulación registrados por checkpoint.

La continuación parte del checkpoint Fast64 de 10.000 ejemplos y avanza sobre los datos Zebra restantes elegibles, con hasta 24 pasos de imagen y lotes agrupados por longitud. La variante de septiembre usó resolución de 256 px, ocho pasos de difusión y dos candidatos, lo que no debe confundirse con el entrenamiento de octubre a 512 px, 50 pasos y seis candidatos. El dataset principal de 10.000 ejemplos cubre 13 categorías: búsqueda visual, puzle, ajedrez, tetris, cifrados, laberintos, matrices estilo Raven, ARC-AGI, física, geometría, química, algoritmos de grafos y programación competitiva; su hash de membresía y orden es `36d8d46fa8cb9c832f75554806188221b33cc673b21d2a46945ddf6b9d43dd43`. No se descartó exposición previa a SFT público ni solapamiento semántico con benchmarks.

## Capacidades

- Razonamiento visual sobre tareas estructuradas: búsqueda visual, puzles, ajedrez, tetris, laberintos, matrices estilo Raven y ARC-AGI.
- Razonamiento científico y matemático aplicado a imágenes: física, geometría y química.
- Razonamiento algorítmico y programación competitiva dentro del dominio Zebra-CoT.
- Comprensión y generación de imágenes, al heredar los dos expertos de BAGEL.
- Cadena de razonamiento visual (Zebra-CoT) como formato de salida entrenado.
- Ajuste por refuerzo con GRPO orientado a recompensas de razonamiento (no es un modelo de chat generalista).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada.
- Capacidades multilingües: solo inglés declarado.

## Casos de uso

- Investigación en RL para razonamiento visual: reproducir o auditar la continuación Fast64 sobre Zebra-CoT usando los metadatos de entrenamiento, cursores y sumas SHA-256 incluidos.
- Estudio de recetas GRPO multimodales: comparar hiperparámetros (rango LoRA, candidatos por prompt, pasos de difusión, resolución) entre las variantes de septiembre y octubre documentadas.
- Evaluación de generalización en tareas ARC-AGI y matrices de Raven: usar el checkpoint como punto de partida para medir transferencia en razonamiento abstracto visual.
- Análisis de fallos de entrenamiento: el checkpoint superviviente permite estudiar el estado de un run interrumpido antes de alcanzar los 134.326 ejemplos objetivo.
- Base para ajuste posterior: al preservar pesos y estado de Adam, sirve como punto de reanudación para continuaciones sobre el resto de datos elegibles.
- Benchmarking de modelos juez multimodales: el pipeline descrito (Qwen2.5-VL-72B-AWQ como juez) es reutilizable para evaluar recompensas en tareas de razonamiento visual.
- Docencia y divulgación técnica: ejemplo realista de trazabilidad de experimentos (manifiestos, cursores, historial de asignación Slurm) en investigación abierta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las puntuaciones almacenadas son evaluaciones guardadas, no inferencia reejecutada, y que la última evaluación de un checkpoint puede ser anterior a su guardado final; no se proporcionan cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del tamaño del modelo base BAGEL, que no se especifica en la información.
- GPU de entrenamiento documentadas: NVIDIA A100 en CINECA Leonardo (32 GPU de política y 32 GPU de juez en esta variante; 64 GPU reservadas en total en la asignación Slurm `sensenova_jupyter_32x2`).
- GPU juez: Qwen2.5-VL-72B-AWQ, que requiere hardware de gama alta con cuantización AWQ.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: no disponible; los pesos son adaptadores personalizados, no exportaciones PEFT estándar, por lo que requieren cargarse sobre el BAGEL base con el código correspondiente.
- Latencia y throughput: no disponible; solo se documentan 4,391 horas de procesamiento de prompts en rank cero para el segmento guardado (ventana transcurrida de 4,522 horas).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BAGEL-ZebraCoT-GRPO-Fast64-FullContinuation-20260926 | no disponible | no disponible | sin benchmarks publicados | apache-2.0 | pesos de adaptador en HF (1,3 GB) |
| multimodal-reasoning-lab/Bagel-Zebra-CoT (base) | no disponible | no disponible | no disponible | no disponible | modelo base requerido |
| Qwen2.5-VL-72B-AWQ (juez de recompensa) | 72B | no disponible | no disponible | no disponible | usado como juez congelado en el entrenamiento |

No se dispone de datos de rendimiento comparables para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Checkpoint de investigación, no un modelo listo para producción: son pesos entrenables personalizados, no un export estándar de PEFT ni un modelo fusionado autónomo.
- Requiere el modelo base multimodal-reasoning-lab/Bagel-Zebra-CoT en la revisión `ebce32410ee2062d073feae484ea2c6c1515fba8`.
- El entrenamiento no completó su objetivo: solo representa 17.584 de los 134.326 ejemplos previstos; las actualizaciones registradas pero no guardadas no deben atribuirse a estos pesos.
- Riesgo de alucinación: no evaluado en la información disponible.
- Sesgos conocidos: no documentados.
- Idiomas: solo inglés declarado.
- Exposición previa a SFT público y solapamiento semántico con benchmarks no descartados, lo que puede inflar resultados aparentes.
- Sin benchmarks publicados ni métricas de rendimiento verificables.
- Sin descargas ni likes en el momento de la consulta; ecosistema de validación externa inexistente.
- La licencia apache-2.0 se declara en la model card; conviene verificar las condiciones del modelo base antes de uso comercial.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/denizakkoc/BAGEL-ZebraCoT-GRPO-Fast64-FullContinuation-20260926
- Modelo base: https://huggingface.co/multimodal-reasoning-lab/Bagel-Zebra-CoT
- Dataset: https://huggingface.co/datasets/multimodal-reasoning-lab/Zebra-CoT
- Perfil del autor: https://huggingface.co/denizakkoc
- Datasets del autor: https://huggingface.co/denizakkoc/datasets
