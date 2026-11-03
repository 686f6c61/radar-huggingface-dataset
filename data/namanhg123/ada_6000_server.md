# namanhg123/ada_6000_server

## Resumen

`namanhg123/ada_6000_server` no es un modelo entrenado de forma independiente, sino un repositorio de respaldo (backup) de un entorno de servidor de investigación para el proyecto StLLM / HUST_ViMedNER, orientado a reconocimiento de entidades nombradas en el ámbito médico en vietnamita. El repositorio empaqueta adaptadores PEFT (LoRA) junto con scripts de entrenamiento, configuración de entorno, requisitos bloqueados y utilidades de inferencia para dos modelos base de Google: `google/gemma-4-12B-it` y `google/gemma-4-26B-A4B-it`.

La relevancia de este repositorio es fundamentalmente operativa: documenta con precisión la configuración de hardware (3× NVIDIA RTX 6000 Ada, 144 GB de VRAM total), las versiones exactas de las librerías (torch 2.14.1, transformers 5.17.0, peft 0.21.2, unsloth 2026.10.5) y los pipelines de SFT y DPO empleados en el proyecto. No obstante, carece de model card técnica convencional: no se publican métricas de evaluación, detalles del dataset ni especificaciones del adaptador más allá de las etiquetas.

El tamaño del repositorio (144,8 GB) sugiere que incluye pesos completos o checkpoints intermedios, no solo adaptadores LoRA. La licencia no está declarada, lo que impide determinar las condiciones de uso comercial. El pipeline no está especificado y el número de descargas y likes es cero, lo que indica que se trata de un artefacto de trabajo personal más que de una publicación comunitaria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores PEFT (LoRA) sobre transformers Gemma-4 (12B denso y 26B MoE) |
| Parametros totales | No disponible para el adaptador; modelos base: 12B (denso) y 26B (MoE, A4B) |
| Parametros activos | No disponible para el adaptador; modelo base MoE: 4B activos (según nomenclatura A4B) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el entorno incluye bitsandbytes 0.50.2, lo que sugiere soporte de cuantización en 8/4 bits, pero no se especifica) |
| Idiomas soportados | Vietnamita (según tag `vietnamese`); no se detallan otros |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptadores PEFT) |

## Arquitectura y entrenamiento

El repositorio contiene adaptadores LoRA entrenados mediante PEFT sobre dos modelos base de la familia Gemma-4: la variante densa de 12B (`google/gemma-4-12B-it`) y la variante Mixture-of-Experts de 26B con aproximadamente 4B de parámetros activos (`google/gemma-4-26B-A4B-it`). El entrenamiento se organiza en pipelines de dos fases: SFT (supervised fine-tuning) seguido de DPO (direct preference optimization) para alineamiento, tal como reflejan los scripts `run_phase3_sft_and_dpo.sh` y `run_stage2_dpo_26b_moe.sh`. La herramienta de entrenamiento es Unsloth (versión 2026.10.5), lo que indica optimizaciones de memoria y velocidad para fine-tuning de bajo rango.

No se especifica el volumen de datos de entrenamiento, la composición del dataset ni los hiperparámetros del adaptador (rango, alpha, módulos objetivo). El tag `medical-ner` y el nombre del proyecto (HUST_ViMedNER) indican que la tarea objetivo es el reconocimiento de entidades nombradas en textos médicos en vietnamita. El repositorio incluye scripts de entrenamiento DDP con auto-resume, evaluación de checkpoints y un servidor de inferencia remoto en el puerto 8165, lo que sugiere un flujo de trabajo de investigación reproducible pero no documentado a nivel de resultados.

## Capacidades

- Reconocimiento de entidades nombradas (NER) en el dominio médico en vietnamita, según la etiqueta `medical-ner`.
- Generación de texto y razonamiento heredados de los modelos base Gemma-4-it (12B denso y 26B MoE).
- Fine-tuning supervisado (SFT) y alineamiento por preferencias (DPO) documentados mediante scripts reproducibles.
- Soporte de inferencia remota mediante un servidor FastAPI/vLLM en el puerto 8165, con scripts `run_infer.py` y `run_infer_stream.py` para inferencia por lotes y en streaming.
- Capacidades multilingües del modelo base no verificadas en este repositorio; el único idioma declarado explícitamente es el vietnamita.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido (thinking mode) a nivel de adaptador.

## Casos de uso

- Extracción de entidades médicas en historiales clínicos vietnamitas: el adaptador se aplicaría sobre Gemma-4 12B para identificar fármacos, diagnósticos, síntomas y procedimientos en textos de hospital, aprovechando el fine-tuning específico del dominio.
- Anonimización de informes clínicos: la detección de entidades permite enmascarar nombres de pacientes y profesionales antes de compartir documentos, un paso previo habitual en pipelines de datos sanitarios.
- Estructuración de notas médicas libres: convertir texto no estructurado en campos etiquetados (entidad, tipo, posición) para su carga en bases de datos clínicas o sistemas de historia electrónica.
- Investigación académica en PLN médico vietnamita: el repositorio incluye scripts de evaluación de checkpoints (`run_eval_server.sh`) que permiten reproducir experimentos de SFT y DPO sobre el corpus ViMedNER.
- Despliegue de un servicio de inferencia interno: el servidor remoto en el puerto 8165 con vLLM permite servir el modelo a otras aplicaciones del laboratorio mediante API HTTP, con soporte de streaming.
- Migración y replicación de entornos de entrenamiento: los archivos `requirements_lock.txt`, `environment.yml` y `setup_new_server.sh` permiten reconstruir exactamente el entorno de 3× RTX 6000 Ada en una máquina nueva, útil para equipos que necesiten reproducir el pipeline.
- Comparación de variantes densa vs. MoE: los pipelines separados para 12B y 26B-A4B permiten evaluar el compromiso entre calidad y coste computacional en la misma tarea de NER médico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El entorno de referencia utiliza 3× NVIDIA RTX 6000 Ada Generation con 49.140 MiB por GPU (144 GB de VRAM total), según la configuración del servidor original `bcseserver1`.
- Para el adaptador sobre Gemma-4 12B en precisión completa (bf16), se estiman aproximadamente 24 GB de VRAM solo para pesos, más overhead de activaciones y KV cache; cabe en una única RTX 6000 Ada (48 GB) o A100 40/80 GB.
- Para el adaptador sobre Gemma-4 26B-A4B MoE en bf16, los pesos ocupan del orden de 52 GB, por lo que requiere al menos una A100 80 GB o H100 80 GB, o bien reparto entre varias GPU.
- En cuantización de 4 bits (bitsandbytes está incluido en el entorno), el modelo de 12B podría caber en GPUs consumer de 24 GB (RTX 3090/4090) y el de 26B en 48 GB; no se han verificado estos valores en la documentación.
- Opciones de despliegue documentadas: vLLM (puerto 8165), FastAPI como capa de servicio, y scripts de inferencia propios (`run_infer.py`, `run_infer_stream.py`). No se mencionan llama.cpp, Ollama ni TGI.
- No se proporcionan cifras de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| namanhg123/ada_6000_server (este) | Adaptador sobre 12B / 26B-A4B | No disponible | NER médico vietnamita | No disponible | HuggingFace, 0 descargas |
| google/gemma-4-12B-it | 12B denso | No disponible en esta ficha | Generación general | Términos de Gemma | Modelo base público |
| google/gemma-4-26B-A4B-it | 26B MoE (4B activos) | No disponible en esta ficha | Generación general | Términos de Gemma | Modelo base público |
| Adaptadores NER médico vietnamita alternativos | No disponible | No disponible | NER médico | No disponible | No disponible |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría; la comparativa se limita a los modelos base y a la ausencia de métricas publicadas.

## Limitaciones y advertencias

- No se declara licencia, lo que impide determinar si el uso comercial está permitido; además, los términos de los modelos base Gemma-4 condicionan cualquier uso derivado.
- No hay métricas de evaluación publicadas (F1, precisión, recall) para la tarea de NER médico, por lo que no es posible validar la calidad del adaptador.
- El repositorio es un backup de servidor, no una publicación curada: contiene scripts, entornos y posiblemente checkpoints intermedios, con riesgo de incluir rutas, tokens o configuraciones específicas del autor.
- El único idioma declarado es el vietnamita; el rendimiento en castellano u otros idiomas no está verificado y probablemente sea inferior al del modelo base sin adaptar.
- Riesgo de alucinación inherente a los modelos generativos, especialmente crítico en dominio médico; cualquier salida debe ser revisada por personal cualificado.
- Sesgos del corpus de entrenamiento no documentados; al ser datos médicos vietnamitas, pueden existir sesgos demográficos, geográficos y de terminología clínica.
- El tamaño del repositorio (144,8 GB) y la dependencia de versiones muy específicas (torch 2.14.1, transformers 5.17.0, CUDA 12.4) dificultan la reproducibilidad fuera del entorno original.
- La ausencia de pipeline declarado y de descargas indica que no ha sido validado por la comunidad; no se recomienda su uso en producción sin una evaluación independiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/namanhg123/ada_6000_server
- Modelo base denso: https://huggingface.co/google/gemma-4-12B-it
- Modelo base MoE: https://huggingface.co/google/gemma-4-26B-A4B-it
- No se han encontrado enlaces adicionales (papers, blogs, repos o demos) en la información proporcionada.
