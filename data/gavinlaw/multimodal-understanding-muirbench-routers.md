# gavinlaw/multimodal-understanding-muirbench-routers

## Resumen

MuirBench lightweight reading routers es un conjunto de políticas de enrutamiento de modelos (model routing) desarrollado por el usuario gavinlaw. No se trata de un modelo de lenguaje generativo, sino de artefactos de aprendizaje supervisado —serializados con joblib— que deciden, para cada consulta multimodal, qué estrategia de lectura debe aplicar un VLM subyacente entre cuatro opciones: `joint_direct`, `joint_cot`, `split_fuse` o `joint_long`. Los VLM objetivo declarados son Qwen3-VL-4B e InternVL3.5-4B.

Técnicamente, cada política combina un vectorizador TF-IDF congelado sobre el prompt con dos regresores Ridge: uno que predice la precisión esperada de cada brazo y otro que predice su coste normalizado. La decisión final es un argmax de precisión predicha menos el coste ponderado. El autor lo presenta explícitamente como una línea base de falsación (falsification baseline) y no como un método de investigación propuesto, lo que acota mucho el alcance de sus afirmaciones.

Su relevancia es metodológica: ofrece un protocolo reproducible para evaluar enrutadores de bajo coste sobre MuirBench, con particiones fijas (1.096 filas de entrenamiento, 456 de desarrollo y 1.048 de test interno) y evaluación única sobre test tras seleccionar hiperparámetros en desarrollo. No incluye pesos de red neuronal ni imágenes originales redistribuidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-IDF congelado + regresores Ridge (scikit-learn), no es una red neuronal |
| Parametros totales | no disponible (artefactos joblib; tamaño de repo 0.0 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del VLM enrutado) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible |
| Licencia | other / mixed-source-terms (términos mixtos de las fuentes, incluidos NC/SA) |
| Formato de pesos | joblib (cada archivo `model-policy.joblib` contiene vectorizador, modelos y metadatos) |

## Arquitectura y entrenamiento

Cada política es un pipeline de scikit-learn. Las características de entrada concatenan el vector TF-IDF del prompt, `image_count/10` y `log1p(prompt_character_count)/10`. Sobre esas características se ajustan dos regresores Ridge: uno para precisión y otro para coste. En inferencia se recorta la precisión predicha a [0,1] y el coste a un mínimo de 0, y se elige el brazo que maximiza `accuracy - cost_weight * normalized_cost`. Los hiperparámetros `alpha` y el peso de coste se seleccionan en el split de desarrollo y se persisten en `selection.json` antes de la única evaluación sobre test.

El entrenamiento es aprendizaje supervisado a partir de retroalimentación completa (se conocen los resultados de todos los brazos para cada ejemplo), no RL ni fine-tuning del VLM. Los datos provienen de MUIRBENCH en la revisión `4c393cffc985c77d28de3b9045e2e5186920df80`, con componentes counterpart/shared-RGB divididos en 1.096 filas de train, 456 de dev y 1.048 de test interno. Vocabulario y regresores se ajustan solo con train. Los costes se calculan con tiempo de generación en GPU por lote dividido entre el tamaño del lote, incluyendo todas las extracciones pero excluyendo preprocesado y sobrecarga del enrutador.

## Capacidades

- Enrutamiento de estrategia de lectura multimodal entre cuatro brazos: `joint_direct`, `joint_cot`, `split_fuse` y `joint_long`.
- Predicción de precisión esperada por brazo mediante regresión Ridge sobre características TF-IDF y de forma del prompt.
- Predicción de coste normalizado por brazo, con escala en segundos (`cost_scale_seconds`).
- Selección conjunta precisión-coste con un peso configurable (`cost_weight`).
- Soporte de fallback fijo opcional, documentado en `selection.json`.
- Reproducibilidad: `fit_muir_router.py` reproduce selección y evaluación desde el manifiesto original.
- Evaluación con bootstrap agrupado y aleatorización de acciones con igual número de imágenes.
- No soporta tool calling, agentes, visión directa ni generación de texto: es un componente de decisión.

## Casos de uso

- Investigación en enrutamiento de modelos: usar las políticas como línea base de falsación frente a enrutadores aprendidos más sofisticados sobre MuirBench, comparando en el mismo test interno de 1.048 filas.
- Optimización de coste en pipelines multimodales: desplegar el enrutador delante de Qwen3-VL-4B o InternVL3.5-4B para elegir entre lectura directa y cadena de pensamiento según la longitud y número de imágenes del prompt.
- Control de presupuesto de inferencia: ajustar `cost_weight` para desplazar la frontera entre precisión y coste en función del SLA del servicio.
- Auditoría de metodología: reutilizar el protocolo de selección en dev y evaluación única en test, con `selection.json` persistido antes de la evaluación, como plantilla para experimentos reproducibles.
- Análisis de sensibilidad: emplear la aleatorización de acciones con igual número de imágenes para medir cuánto de la ganancia se debe a la política y cuánto al recuento de imágenes.
- Docencia y prototipado: cargar los joblib con scikit-learn 1.7.2, numpy 2.3.4, scipy 1.17.1 y joblib 1.6.0 para ilustrar enrutamiento supervisado de bajo coste sin necesidad de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que `evaluation.json` incluye comparaciones con bootstrap agrupado y aleatorización de acciones, pero no se proporcionan cifras concretas de precisión, coste ni intervalos de confianza.

## Requisitos de hardware

- Inferencia en CPU: el enrutador es TF-IDF + Ridge, por lo que no requiere GPU; el coste dominante es el VLM enrutado.
- Memoria: no disponible; el tamaño del repo es 0.0 GB y no se detallan pesos.
- GPU recomendadas: no aplica al enrutador; para los VLM objetivo (Qwen3-VL-4B, InternVL3.5-4B) se requiere hardware capaz de servir modelos de 4B, no especificado en la información.
- Cabe en GPU de consumo: el enrutador sí; los VLM objetivo dependen de su cuantización, no documentada aquí.
- Despliegue: carga directa de joblib con scikit-learn; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este componente.
- Latencia y throughput: no disponibles; la model card advierte que los costes registrados excluyen preprocesado y sobrecarga del enrutador y no son latencia extremo a extremo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MuirBench lightweight reading routers | Enrutador TF-IDF + Ridge | no disponible | no disponible | mixed-source-terms | HuggingFace (0 descargas) |
| Enrutadores aprendidos end-to-end sobre VLM | Red neuronal / policy learning | no disponible | no disponible | no disponible | no disponible en la información |
| Políticas de fallback fijas | Regla estática | no aplica | no aplica | no disponible | Referenciadas en `selection.json` |

No se dispone de datos comparativos de rendimiento con alternativas en la información proporcionada.

## Limitaciones y advertencias

- El propio autor lo califica como línea base de falsación, no como método de investigación propuesto; no debe presentarse como una contribución novedosa.
- El benchmark público y los backbones lingüísticos relacionados limitan las afirmaciones de generalización.
- La agrupación RGB exacta no excluye casi duplicados ni exposición previa en preentrenamiento.
- Los intervalos de confianza que cruzan cero no establecen no inferioridad.
- Los costes no son latencia extremo a extremo: excluyen preprocesado y sobrecarga del enrutador.
- Licencia mixta con términos NC/SA de las fuentes; el uso comercial queda sujeto a los términos originales, no a una licencia permisiva.
- No se redistribuyen las imágenes originales.
- Cargar solo archivos joblib de confianza: la deserialización de joblib puede ejecutar código arbitrario.
- Dependencias fijadas (scikit-learn 1.7.2, numpy 2.3.4, scipy 1.17.1, joblib 1.6.0); versiones distintas pueden alterar resultados.
- Sin descargas ni likes: no hay evidencia de validación externa por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/gavinlaw/multimodal-understanding-muirbench-routers
- Dataset de salidas: https://huggingface.co/datasets/gavinlaw/multimodal-understanding-muirbench-outputs
- Términos de licencia (referencia): https://arxiv.org/html/2406.09411v1
