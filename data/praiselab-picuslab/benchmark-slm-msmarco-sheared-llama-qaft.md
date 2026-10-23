# praiselab-picuslab/benchmark-slm-msmarco-sheared-llama-qaft

## Resumen

`praiselab-picuslab/benchmark-slm-msmarco-sheared-llama-qaft` es un adaptador LoRA (librería PEFT, pesos en safetensors) publicado por el usuario praiselab-picuslab sobre el modelo base `princeton-nlp/Sheared-LLaMA-1.3B`. Por las etiquetas del repositorio (`benchmark-slm`, `dataset-msmarco`, `strategy-qaft`) se trata de un artefacto de evaluación dentro de una familia de experimentos con modelos de lenguaje pequeños, ajustado sobre el dataset `microsoft/ms_marco` y orientado a generación de texto en inglés. No incluye model card con hiperparámetros ni resultados.

Su interés es acotado pero real: un adaptador LoRA sobre una base de 1.300 millones de parámetros es barato de entrenar, de almacenar y de servir, y MS MARCO es el corpus de referencia para QA y ranking de pasajes, por lo que el artefacto sirve como línea base reproducible para comparar estrategias de ajuste en modelos pequeños. Sin embargo, el repositorio tiene 0 descargas y 0 likes, no declara licencia y está sujeto a acceso restringido (gated), de modo que debe tratarse como material de investigación sin validación externa, no como un modelo listo para producción.

Arquitectura y tamaño del adaptador: no disponibles en la información proporcionada. La relevancia ahora mismo es la del ecosistema SLM: adaptadores pequeños que se fusionan sobre bases de 1-2B y se despliegan en GPU de consumo o incluso en CPU, con coste marginal próximo a cero frente a modelos de decenas de miles de millones de parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la información proporcionada. Adaptador LoRA (PEFT) sobre un transformer decoder-only (modelo base Sheared-LLaMA-1.3B) |
| Parámetros totales | No disponible para el adaptador. El modelo base declara 1,3 mil millones de parámetros |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible para el adaptador. El modelo base declara 4.096 tokens |
| Tipos de cuantizacion | No disponible. La etiqueta `strategy-qaft` sugiere algún tipo de ajuste asociado a cuantización, pero no hay documentación que lo defina |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA/PEFT) |
| Modelo base | princeton-nlp/Sheared-LLaMA-1.3B |
| Dataset de ajuste | microsoft/ms_marco |
| Librería | peft |
| Pipeline | text-generation |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Tamaño del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación (metadatos) | 2026-10-23 |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente un adaptador LoRA sobre `Sheared-LLaMA-1.3B`, no un modelo completo. Sheared-LLaMA es un modelo decoder-only derivado de LLaMA-2-7B mediante poda estructural y preentrenamiento continuado, según la documentación pública de su modelo base; el adaptador hereda por tanto esa arquitectura y esa ventana de contexto. La información disponible no especifica rango del adaptador, módulos objetivo, número de épocas, tasa de aprendizaje ni tokens de entrenamiento.

En cuanto a los datos, la única referencia es el dataset `microsoft/ms_marco`, un corpus en inglés de consultas reales de Bing con pasajes web y respuestas anotadas, habitual en tareas de QA extractivo y ranking de pasajes. No hay información sobre composición exacta del subconjunto usado, plantilla de prompt, si hubo etapas de RLHF/DPO ni sobre la estrategia denotada por las etiquetas `qaft` y `or2`, que aparecen sin definición en la model card. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto en inglés, condicionada al ajuste sobre MS MARCO.
- Respuesta a preguntas sobre pasajes: el formato del dataset de entrenamiento apunta a QA extractivo (consulta + contexto → respuesta corta), aunque no está documentado de forma explícita.
- Reutilización de las capacidades del modelo base (Sheared-LLaMA-1.3B): modelado de lenguaje general y seguimiento básico de instrucciones, limitadas por el tamaño.
- Soporte de tool calling / function calling: no disponible; no hay evidencia ni documentación al respecto.
- Soporte de agentes y razonamiento multi-paso: no disponible; poco probable en una base de 1,3B ajustada sobre QA.
- Capacidades multilingües: no; el repositorio declara únicamente inglés.
- Visión, audio, modo thinking: no disponibles.
- Capacidad especial: ninguna documentada; el valor del artefacto es su función como elemento de benchmark, no una capacidad diferencial.

## Casos de uso

- Línea base en benchmarks de modelos pequeños (SLM): sirve como referencia fija para comparar otros adaptadores LoRA entrenados sobre la misma base y el mismo dataset, al mantener constante todo salvo la estrategia de ajuste.
- Prototipado rápido de QA extractivo sobre pasajes web: con 1,3B parámetros y un adaptador de pocos megabytes, permite validar el formato de entrada/salida y la plantilla de prompt antes de invertir en un modelo mayor.
- Generación de respuestas en pipelines RAG de bajo coste: tras recuperar documentos, el adaptador puede redactar la respuesta final; su tamaño permite desplegarlo en una GPU de consumo o en CPU con cuantización, manteniendo el coste por consulta muy bajo.
- Investigación sobre poda + ajuste: al partir de un modelo podado desde LLaMA-2-7B, permite medir cuánta capacidad se recupera al especializar en un dominio concreto mediante un adaptador de bajo rango, un experimento habitual en la literatura de compresión.
- Experimentos de cuantización: la etiqueta `qaft` sugiere un ajuste ligado a cuantización; el artefacto es útil para comparar la degradación de calidad entre pesos completos, INT8 e INT4 sobre la misma tarea, siempre que se documente la configuración original.
- Reproducción de pipelines de ajuste con recursos mínimos: un adaptador sobre 1,3B se entrena en una sola GPU consumer, por lo que sirve de plantilla para replicar el flujo con otro corpus (legal, sanitario, soporte técnico) sin infraestructura dedicada.
- Docencia y formación: ejemplo compacto de repositorio PEFT (adaptador + base + dataset etiquetado) para explicar qué es un LoRA, cómo se fusiona y cómo se evalúa, sin necesidad de clúster.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Benchmark | Resultado |
|---|---|
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |
| MS MARCO (EM / F1 o MRR@10) | No disponible |

Dado que el ajuste se realiza sobre MS MARCO, la evaluación natural sería EM/F1 sobre el split de validación o MRR@10 en ranking de pasajes, pero el repositorio no aporta ninguna métrica.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa del orden de megabytes; el coste real lo determina el modelo base (1,3B parámetros).
- VRAM estimada para el modelo base fusionado en FP16: ~2,6 GB solo de pesos; con caché KV y activaciones, entre 3,5 y 5 GB en la práctica (estimación a partir del número de parámetros, no de mediciones publicadas).
- VRAM estimada en INT8: ~1,3 GB de pesos, en torno a 2-2,5 GB en ejecución.
- VRAM estimada en INT4 (GGUF Q4_K_M): ~0,8-1 GB de pesos, en torno a 1,5-2 GB en ejecución.
- GPU recomendadas: cualquiera con 6 GB o más para FP16 (RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, T4 16 GB, L4, A10G). Cabe en GPU de consumo sin problemas.
- Inferencia en CPU: viable con llama.cpp tras fusionar el adaptador y convertir a GGUF; throughput bajo pero funcional para pruebas.
- Opciones de despliegue: HuggingFace Transformers + PEFT (carga directa del adaptador), vLLM y TGI (soportan adaptadores PEFT o modelo fusionado), llama.cpp/Ollama (requiere fusionar y convertir), y `merge_and_unload()` de PEFT para generar un checkpoint completo.
- Latencia y throughput: no disponibles; no hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adaptador (sobre Sheared-LLaMA-1.3B) | 1,3B (base) | No disponible en la ficha | No disponible | Gated |
| princeton-nlp/Sheared-LLaMA-1.3B | 1,3B | 4.096 | Licencia LLaMA-2 (según su model card) | Pública |
| TinyLlama-1.1B | 1,1B | 2.048 | Apache-2.0 | Pública |
| Qwen2.5-1.5B | 1,5B | 32.768 | Apache-2.0 | Pública |

Los datos de los modelos comparados provienen de sus model cards públicas. No es posible comparar rendimiento: este adaptador no publica métricas, y una comparación de calidad entre un ajuste específico sobre MS MARCO y modelos de propósito general exigiría evaluar todos con el mismo protocolo.

## Limitaciones y advertencias

- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que rompe la descarga automatizada en pipelines de CI/CD y en despliegues no interactivos.
- Licencia no declarada: no puede asumirse uso comercial. Además, el modelo base Sheared-LLaMA arrastra las condiciones de la licencia LLaMA-2, que imponen obligaciones adicionales al redistribuir o servir el modelo fusionado.
- Idioma único: solo inglés; cualquier uso en castellano requeriría ajuste adicional y no está evaluado.
- Artefacto sin validación: 0 descargas, 0 likes y un tamaño de repositorio de 0.0 GB; conviene verificar que los pesos del adaptador están realmente presentes y son legibles antes de integrarlo.
- Falta de reproducibilidad: no se documentan rango del adaptador, módulos objetivo, hiperparámetros, subconjunto de MS MARCO ni plantilla de prompt. Las etiquetas `qaft` y `or2` no están definidas en la información disponible.
- Riesgo de alucinación elevado: con 1,3B parámetros y un ajuste sobre QA extractivo, es esperable que invente respuestas cuando el pasaje no contiene la información; requiere validación o abstención explícita en producción.
- Sesgos del corpus: MS MARCO procede de consultas reales de Bing y pasajes web, con la distribución, el sesgo de dominio y el ruido de esa fuente; el modelo tenderá a respuestas cortas y factuales y rendirá peor en preguntas abiertas o de razonamiento.
- Ventana de contexto limitada (4.096 tokens en la base) frente a los estándares actuales de 32K-128K, lo que restringe su uso en RAG con muchos documentos concatenados.
- Sin evidencia de soporte de tool calling, agentes o multimodalidad; no debe asumirse ninguna de estas capacidades.
- Metadatos a verificar: la fecha de creación registrada (2026-10-23) es posterior a la de la mayoría de artefactos del ecosistema y resulta atípica; conviene confirmar la procedencia y la integridad del repositorio antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/praiselab-picuslab/benchmark-slm-msmarco-sheared-llama-qaft
- Modelo base: https://huggingface.co/princeton-nlp/Sheared-LLaMA-1.3B
- Dataset de ajuste: https://huggingface.co/datasets/microsoft/ms_marco
- Documentación de PEFT: https://huggingface.co/docs/peft
- Paper de Sheared LLaMA (poda estructurada y preentrenamiento continuado, base del modelo subyacente): https://arxiv.org/abs/2310.06694
