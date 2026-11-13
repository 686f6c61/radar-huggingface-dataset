# albertoromerova/dissertation-classification

## Resumen

`albertoromerova/dissertation-classification` es un repositorio de Hugging Face que contiene una implementación propia y de pequena escala de la arquitectura ALBEF (Align before Fuse, un modelo vision-lenguaje) adaptada a una tarea de clasificación. Lo publica el usuario albertoromerova bajo licencia Apache 2.0. No es un modelo entrenado ni un release con resultados: la model card lo describe explícitamente como un punto de partida reproducible ("a reproducible starting point, not a trained model release").

El checkpoint incluido (`model.safetensors`) es una inicialización válida para pruebas de humo (smoke tests), no un modelo con pesos entrenados. El recuento real de parámetros en safetensors es de 49.600, un orden de magnitud muy inferior al de ALBEF original (que ronda los 200 millones de parámetros), lo que confirma que se trata de una mini-implementación y no del modelo publicado por Salesforce.

Su relevancia es limitada para producción: sirve como esqueleto didáctico o como base para experimentar con la arquitectura ALBEF en tareas de clasificación, pero no debe evaluarse como un modelo listo para uso. No se declaran benchmarks, idiomas soportados ni pipeline en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ALBEF (variante propia, escala "small") |
| Parámetros totales | 49.600 (según safetensors) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura declarada es ALBEF, con atención dilatada ("dilated"), fusión de bajo rango ("low rank"), activación GELU-Tanh y normalización GroupNorm. Estos detalles aparecen en la tabla de arquitectura de la model card, pero no se especifican dimensiones de capas, número de cabezas, tamaño del vocabulario ni resolución de imagen. El recuento de 49.600 parámetros sugiere una implementación mínima, probablemente pensada para validar el flujo de código más que para aprender representaciones útiles.

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni uso de RLHF/DPO. La receta de experimento por defecto usa SGD con un scheduler OneCycle, pero la propia model card aclara que son valores iniciales del script y no evidencia de un entrenamiento completado. El checkpoint es de inicialización y no ha sido auditado en robustez, equidad ni transferencia de dominio.

## Capacidades

- Clasificación: el repositorio está etiquetado como `classification`, pero al no haber entrenamiento no hay capacidades demostradas.
- Procesamiento vision-lenguaje: la arquitectura ALBEF es multimodal por diseño, aunque no se confirma que esta implementación incluya el codificador visual completo.
- Generación de texto: no disponible.
- Tool calling / function calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no confirmado más allá de la base ALBEF.

## Casos de uso

- Pruebas de humo de pipelines de clasificación: usar `model.safetensors` como inicialización para verificar que el código de carga, el `config.json` y `eval.py` funcionan de extremo a extremo antes de invertir en entrenamiento real.
- Base didáctica para estudiar ALBEF: el código y la configuración permiten inspeccionar cómo se ensamblan atención dilatada, fusión de bajo rango y GroupNorm en una implementación reducida.
- Punto de partida para fine-tuning experimental: partir de esta configuración y entrenar sobre un split etiquetado específico de la tarea, reportando la métrica en al menos tres semillas según recomienda la propia model card.
- Comparación de recetas de entrenamiento: el `training_args.json` con SGD + OneCycle sirve como baseline reproducible frente a otras configuraciones (AdamW, cosine, etc.) manteniendo el mismo presupuesto de datos y tuning.
- Integración en scripts de evaluación propios: `eval.py` puede adaptarse como entrada para medir métricas de clasificación sobre datasets propios.
- Prototipado de clasificadores multimodales de bajo coste: útil en entornos con recursos limitados donde se quiere validar la viabilidad de un enfoque ALBEF antes de escalar a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente que no se reclama ninguna puntuación de benchmark en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con 49.600 parámetros en fp32 (unos 0,2 MB de pesos), aunque el consumo real depende del framework y de las activaciones.
- GPU recomendadas: cualquier GPU consumer moderna es sobrada; también cabe en CPU.
- Cabe en GPU consumer: sí, en cualquier modelo (GTX 1050, RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: al ser una implementación custom, las APIs genéricas de carga automática requieren un adaptador explícito. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| albertoromerova/dissertation-classification | 49.600 | no disponible | Apache 2.0 | Checkpoint de inicialización, sin entrenar |
| Salesforce/ALBEF | ~200 M (modelo original) | no disponible | Licencia propia de Salesforce | Modelo entrenado y publicado |
| Modelos de clasificación de texto pequeños (p. ej. DistilBERT) | ~66 M | 512 tokens | Apache 2.0 | Entrenados y con benchmarks |

La comparación es orientativa: el repositorio analizado no es directamente comparable con modelos entrenados porque no ofrece pesos útiles ni resultados. ALBEF original y los clasificadores pequeños tipo DistilBERT sí son alternativas reales para tareas de clasificación vision-lenguaje o texto, respectivamente.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: los pesos son de inicialización, por lo que las predicciones carecen de valor.
- No hay auditoría de robustez, equidad ni transferencia de dominio según la propia model card.
- No se declaran idiomas soportados ni composición del dataset de entrenamiento.
- Riesgo de alucinación y sesgos: no evaluable al no existir entrenamiento.
- Licencia Apache 2.0 permite uso comercial del código, pero deben revisarse por separado los términos de los datos externos que se usen con el repositorio.
- No se confirma compatibilidad con APIs de carga automática estándar; requiere adaptador explícito.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado.
- Cualquier resultado futuro debe documentarse por separado de los valores por defecto incluidos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/albertoromerova/dissertation-classification
- Paper de ALBEF (Align before Fuse): https://arxiv.org/abs/2107.07651
- Repositorio oficial de ALBEF: https://github.com/salesforce/ALBEF
