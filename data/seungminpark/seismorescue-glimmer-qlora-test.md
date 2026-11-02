# seungminpark/seismorescue-glimmer-qlora-test

## Resumen

SeismoRescue Glimmer QLoRA Test es un adaptador LoRA (entrenado con QLoRA) para el modelo base `meta-models/Muse-Glimmer-30B`, un modelo multimodal de 30.000 millones de parámetros desarrollado por Meta. El adaptador lo publica el usuario de HuggingFace `seungminpark` como parte del proyecto SeismoRescue, presentado en la Meta Global AI Developer Hackathon (26 de octubre – 4 de noviembre de 2026). El repositorio tiene 0,4 GB y contiene únicamente los pesos del adaptador (383 MB en `adapter_model.safetensors`), no el modelo completo.

El adaptador se entrenó para una tarea muy concreta: dada una imagen A/B de película sísmica WWSSN sintética, decidir qué trazado rojo se mantiene sobre la línea del terremoto en un cruce o un cuasi-contacto con otra línea. Se trata de un experimento de 20 pasos cuyo resultado el propio autor clasifica como negativo: el adaptador aprende la forma de los trazados rojos y no la película, por lo que no se usa en producción. Se publica como referencia reproducible de un fallo metodológico, no como modelo utilizable.

Su relevancia es, por tanto, documental: ilustra cómo una evaluación con control de ablación (borrado de la tinta de la película) revela atajos espurios en el ajuste fino de modelos multimodales con datasets sintéticos pequeños. No debe confundirse con un modelo listo para uso; el propio autor indica que SeismoRescue ejecuta Muse Glimmer solo con los pesos base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (QLoRA) sobre transformer multimodal `meta-models/Muse-Glimmer-30B` (revision `cec94fcfd6512f2cfe708138c32533b346ea4f69`) |
| Parametros totales | Adaptador: 383 MB en safetensors; modelo base: 30.000 millones (30B) |
| Parametros activos | no disponible (no se indica si el modelo base es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Base en 4-bit NF4 (bitsandbytes) para las capas lineales del LM; vision y `lm_head` en bf16 durante el entrenamiento. No se documentan cuantizaciones del adaptador |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (adaptador y modelo base); aplica la Muse Glimmer Usage Policy de Meta |
| Formato de pesos | `adapter_model.safetensors` (PEFT), `adapter_config.json`, `report.json`, `SHA256SUMS`, `LICENSE` |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 con dropout 0,05, aplicado a las proyecciones de atención (q, k, v, o) y a las proyecciones MLP (gate, up, down) del modelo de lenguaje de Muse Glimmer. El modelo base se cargó en 4-bit NF4 con bitsandbytes para las capas lineales del LM, mientras que las partes de visión y la cabeza `lm_head` se mantuvieron en bf16. El entrenamiento consistió en 20 pasos con acumulación de gradiente de 4 pasos, learning rate 2e-4 y warm-up de 3 pasos, ejecutado en una H100 de 80 GB en Modal; el run completo, evaluación incluida, duró 503 segundos y costó aproximadamente 0,60 dólares.

Los datos son crops A/B de película WWSSN sintética generados por el renderizador del propio proyecto (`out/film2_train`), con 149 cruces y 51 cuasi-contactos entre los 200 crops de validación. El script de datos verifica que no se lee nada fuera de ese directorio; no hay píxeles de escaneos reales ni datos privados. La innovación metodológica destacable no está en el entrenamiento sino en la evaluación: además de la precisión tras 20 pasos, se midió la precisión con la tinta de la película borrada de los crops, un control de ablación que expuso que el adaptador se apoyaba en la forma de los trazados rojos y no en la información de la película.

## Capacidades

- El adaptador, tal como se publica, solo resuelve una tarea de elección forzada A/B sobre crops de película sísmica sintética: comparar logits del primer token de respuesta, sin paso de razonamiento.
- No se documentan capacidades de generación de texto, razonamiento general, código, matemáticas o visión más allá de la tarea descrita.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües.
- El modelo base Muse Glimmer 30B es multimodal (incluye componentes de visión), pero las capacidades del base no se detallan en la información disponible.
- El adaptador no está pensado para uso en producción: el autor indica que SeismoRescue no lo utiliza y ejecuta el modelo base sin adaptador.

## Casos de uso

- Referencia de resultado negativo en ajuste fino multimodal: sirve para estudiar cómo un LoRA de 20 pasos sobre 200 ejemplos sintéticos puede alcanzar 0,98 de precisión aparente aprendiendo un atajo (la forma de los trazados) en lugar de la señal objetivo; útil en formación de investigadores sobre controles de ablación.
- Reproducción de experimentos de QLoRA: el `report.json` incluye pérdidas de entrenamiento, desgloses por tipo y versiones de paquetes (transformers 5.21.0, peft 0.21.2, bitsandbytes 0.50.2, torch 2.14.1), lo que permite replicar el pipeline con los scripts del repositorio.
- Auditoría de datasets sintéticos: el control con tinta borrada (0,985 de precisión sin película) es un caso de estudio concreto sobre cómo detectar sesgos de renderizador en datos generados proceduralmente.
- Docencia en evaluación de modelos: ejemplo práctico de intervalos de confianza Wilson, elección forzada por logits y verificación de recarga exacta del adaptador (8 de 8 comprobaciones con diferencia máxima de logit 0,0).
- Prueba de integración PEFT: el adaptador recarga de forma determinista, por lo que puede usarse para validar pipelines de carga de adaptadores con `base_model_name_or_path` reescrito al propio directorio local.
- No es adecuado para tareas de sismología real, clasificación de terremotos ni análisis de escaneos históricos: los datos son exclusivamente sintéticos y el adaptador no generaliza a la señal objetivo.

## Benchmarks y rendimiento

Resultados sobre 200 crops de validación (elección forzada A/B, sin razonamiento; empate cuenta medio punto; intervalos Wilson 95 % tratando los 200 crops como independientes, provenientes de 26 imágenes de película):

| Configuracion | Accuracy [IC 95 %] |
|---|---|
| Zero-shot (modelo base) | 0,56 [0,49, 0,62] |
| Tras 20 pasos de QLoRA | 0,98 [0,95, 0,99] |
| Tras 20 pasos, tinta de película borrada (control) | 0,985 [0,96, 0,99] |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM para el modelo base: no disponible en la información proporcionada; el entrenamiento usó una H100 de 80 GB con el LM en 4-bit NF4 y visión y `lm_head` en bf16.
- GPU recomendadas para reproducir el entrenamiento: H100 80 GB (la configuración documentada); no se documentan alternativas.
- Viabilidad en GPU de consumo: no disponible; el adaptador en sí ocupa 383 MB, pero requiere cargar el modelo base de 30B.
- Opciones de despliegue: PEFT 0.21.2 con transformers 5.21.0; no se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles; el run de entrenamiento y evaluación completo duró 503 s en una H100 en Modal.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (adaptadores LoRA de resultado negativo o adaptadores para Muse Glimmer 30B).

## Limitaciones y advertencias

- Resultado negativo declarado por el autor: el adaptador aprende la forma de los trazados rojos, no la información de la película; con la tinta borrada mantiene 0,985 de precisión, lo que invalida su uso para la tarea objetivo.
- No se usa en producción: SeismoRescue ejecuta Muse Glimmer solo con los pesos base; el adaptador se publica únicamente como referencia del experimento "What we tried that did not work".
- Datos exclusivamente sintéticos: los crops provienen del renderizador del proyecto (`out/film2_train`), sin píxeles de escaneos reales ni datos privados; no hay evidencia de generalización a imágenes reales.
- Tamaño de validación limitado: 200 crops de 26 imágenes de película, con intervalos Wilson que asumen independencia entre crops, supuesto cuestionable al provenir de pocas imágenes.
- `adapter_config.json` apunta a una ruta local de Modal (`/vol/hf/Muse-Glimmer-30B@cec94fcf`); es necesario reescribirla a la descarga propia de la revisión indicada.
- Licencia: Apache 2.0 para el adaptador y el modelo base, pero la Muse Glimmer Usage Policy de Meta se aplica a cualquier uso del modelo base, incluido con este adaptador; el adaptador se distribuye sin garantía.
- Riesgo de alucinación y sesgos: no evaluados ni documentados para este adaptador; la tarea es de elección forzada y no genera texto libre.
- Idiomas y contexto: no disponibles; no se puede asumir ningún comportamiento multilingüe ni de ventana larga.

## Enlaces

- HuggingFace: https://huggingface.co/seungminpark/seismorescue-glimmer-qlora-test
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Repositorio GitHub: https://github.com/smpark00/seismorescue
- Release con los mismos ficheros: https://github.com/smpark00/seismorescue/releases/tag/glimmer-qlora-test
- Política de uso del modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B/blob/main/USAGE_POLICY.md
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
