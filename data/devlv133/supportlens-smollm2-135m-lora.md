# DevLV133/supportlens-smollm2-135m-lora

## Resumen

SupportLens es un adaptador LoRA de clasificación de texto construido sobre el modelo base SmolLM2-135M-Instruct, desarrollado por el usuario DevLV133 como demostración de portfolio. El adaptador añade una cabeza de clasificación de cinco vías (account, billing, delivery, refund, technical) para enrutar mensajes de soporte al cliente escritos en inglés. No se trata de un modelo fundacional nuevo ni de un asistente generativo: el repositorio contiene únicamente pesos del adaptador, ficheros de tokenizer y un registro de entrenamiento reproducible.

El modelo base SmolLM2-135M-Instruct es un transformer decoder-only de 135 millones de parámetros desarrollado por HuggingFaceTB. El adaptador LoRA entrena 463.680 parámetros sobre las proyecciones query y value más la cabeza de clasificación, lo que representa el 0,34% del total de parámetros del modelo. La longitud de contexto efectiva en la demo está limitada a 128 tokens.

La relevancia de esta ficha es acotada: se trata de un experimento educativo con datos sintéticos generados por IA, no de un sistema validado para producción. Los resultados publicados (94,0% de accuracy y 0,941 de macro-F1 sobre 50 mensajes sintéticos) no establecen rendimiento real ni significación estadística, y el propio autor lo advierte explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2) con adaptador LoRA y cabeza de clasificación de 5 clases |
| Parametros totales | 134.981.568 (modelo base) + 463.680 entrenables en el adaptador (0,34%) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (truncado en demo e inferencia) |
| Tipos de cuantizacion | no disponible (entrenamiento e inferencia en float32) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre SmolLM2-135M-Instruct (revisión fijada `12fd25f77366fa6b3b4b768ec3050bf629380bac`), un transformer decoder-only de 135 millones de parámetros. El LoRA tiene rango 8, alpha 16, dropout 0,05 y se aplica a las proyecciones query y value; la cabeza de clasificación de 5 etiquetas también se entrena. El modelo base se carga mediante `AutoModelForSequenceClassification` con `num_labels=5`, de modo que la cabeza de clasificación se añade y se entrena junto con los adaptadores.

Los datos de entrenamiento son sintéticos: 100 mensajes semilla generados por IA, de los que se derivan 300 filas de entrenamiento (dos variantes superficiales por semilla permanecen en el mismo split). La validación usa 25 mensajes separados para seleccionar el checkpoint por macro-F1 (gana el epoch más temprano en caso de empate) y el test usa 50 mensajes separados, evaluados tras la selección del checkpoint sin retuning posterior. El entrenamiento fue de 3 epochs, batch size 8, AdamW con learning rate 0,0005, semilla 42, longitud máxima 128 tokens, en CPU con float32. El checkpoint seleccionado fue el epoch 3, con macro-F1 de validación de 0,960. Los hashes de datos y versiones de paquetes están en `training_metadata.json`.

## Capacidades

- Clasificación de texto en cinco categorías de tickets de soporte: account, billing, delivery, refund y technical.
- Salida de probabilidades por clase (softmax sobre 5 logits), aunque sin calibración.
- Procesamiento de mensajes en inglés de hasta 128 tokens.
- Integración con el ecosistema PEFT/Transformers mediante `PeftModel.from_pretrained`.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No soporta generación de texto libre como asistente (el adaptador convierte el modelo en clasificador).
- No soporta visión ni audio.
- No soporta capacidades multilingües más allá del inglés.

## Casos de uso

- Enrutamiento automático de tickets de soporte: el modelo asigna cada mensaje entrante a una de las cinco colas (facturación, entrega, reembolso, cuenta, técnico), permitiendo dirigirlo al equipo adecuado. Adecuado por su bajo coste computacional (135M parámetros) y latencia reducida, aunque solo como demostración.
- Triaje previo en mesas de ayuda: uso de la probabilidad máxima como señal para derivar mensajes ambiguos a revisión manual, con un umbral ilustrativo de 0,55 (cobertura del 98% y accuracy del 93,9% sobre el conjunto de test sintético).
- Etiquetado de datasets históricos de tickets: clasificación masiva de mensajes archivados para construir corpus etiquetados y analizar la distribución de motivos de contacto.
- Filtro de primera línea en formularios web: clasificación instantánea del texto introducido por el usuario para sugerir el departamento correcto antes del envío.
- Componente de bajo coste en pipelines de CI/CD de NLP: servir como baseline reproducible para comparar futuros clasificadores o para pruebas de integración de despliegues PEFT.
- Demostración educativa de fine-tuning con LoRA: ejemplo completo de adaptación de un modelo pequeño con datos sintéticos, útil para formación en PEFT y evaluación honesta de modelos.
- Priorización de colas en atención al cliente: combinación de la clase predicha con la confianza para ordenar la cola de reembolsos y facturación, que el autor señala como especialmente ambiguas.

## Benchmarks y rendimiento

| Modelo | Test accuracy | Macro-F1 |
|---|---:|---:|
| SmolLM2 + LoRA | 94,0% | 0,941 |
| TF-IDF + regresión logística | 86,0% | 0,860 |

El test consta de 50 mensajes sintéticos (10 por clase). El autor advierte que estos números se midieron sobre datos de demostración generados por IA, no sobre clientes reales, y que no establecen rendimiento en producción ni significación estadística. Todos los splits se generaron en la misma sesión de desarrollo y comparten vocabulario de dominio similar.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 135M parámetros en float32 ocupa aproximadamente 540 MB de pesos; con el adaptador y overhead de runtime, cabe holgadamente en cualquier GPU consumer con 2 GB o más.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU (el entrenamiento documentado se hizo en CPU con float32). Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) es más que suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM; también en CPU y en entornos sin acelerador.
- Opciones de despliegue: Transformers + PEFT (ruta oficial documentada), integración en HuggingFace Spaces (demo publicada), exportación a ONNX no documentada. vLLM, llama.cpp, Ollama y TGI no están documentados para este adaptador de clasificación.
- Latencia y throughput estimados: no disponible; no se publican mediciones de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SupportLens (SmolLM2-135M LoRA) | 135M base + 463.680 adaptador | 128 tokens | Clasificación 5 clases (inglés) | apache-2.0 | HuggingFace, demo en Space |
| TF-IDF + regresión logística (baseline del autor) | no aplica (modelo lineal) | no aplica | Clasificación 5 clases | no especificada | Referenciado en la model card |
| SmolLM2-135M-Instruct (base) | 135M | no disponible en esta ficha | Generación de texto | apache-2.0 | HuggingFace |

No se dispone de comparación con otros clasificadores de tickets publicados en la información proporcionada.

## Limitaciones y advertencias

- Demostración educativa de portfolio: el autor declara explícitamente que no constituye evidencia de despliegue comercial o de producción.
- Datos sintéticos y pequeños: 300 filas de entrenamiento derivadas de 100 semillas, con variantes superficiales en el mismo split; variedad limitada.
- El clasificador siempre elige una de las cinco etiquetas y no detecta de forma fiable mensajes no relacionados o con múltiples intenciones.
- Las puntuaciones no están calibradas; el umbral de revisión manual de 0,55 es ilustrativo y no elimina todos los errores.
- Ambigüedad particular entre billing y refund, según el propio autor.
- Resultados de test sobre 50 mensajes sintéticos sin significación estadística ni validez sobre clientes reales.
- Sesgos conocidos: no documentados más allá de la advertencia sobre datos sintéticos; el modelo base puede arrastrar sesgos de su preentrenamiento.
- Riesgo de alucinación: no aplica en sentido generativo, pero el clasificador puede forzar etiquetas incorrectas en entradas fuera de dominio.
- Limitación de contexto: truncado a 128 tokens, con aviso mostrado en la demo.
- Limitación de idioma: solo inglés.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantías y desaconseja tratarlo como sistema validado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DevLV133/supportlens-smollm2-135m-lora
- Demo en Space: https://huggingface.co/spaces/DevLV133/supportlens
- Artefactos y evaluación: https://huggingface.co/buckets/DevLV133/supportlens-artifacts
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
