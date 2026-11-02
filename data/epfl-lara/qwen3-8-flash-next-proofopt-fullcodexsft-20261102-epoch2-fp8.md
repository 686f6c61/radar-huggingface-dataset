# EPFL-LARA/Qwen3.8-Flash-Next-ProofOpt-FullCodexSFT-20261102-epoch2-FP8

## Resumen

Qwen3.8-Flash-Next-ProofOpt-FullCodexSFT-20261102-epoch2-FP8 es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.8-Flash-Next, desarrollado por el grupo EPFL-LARA. El entrenamiento se ha realizado mediante LoRA en precisión BF16 sobre un conjunto de 4.351 ejemplos verificados, extraídos de 61 problemas de optimización de pruebas matemáticas (proof-optimization), con el objetivo de mejorar la capacidad de razonamiento prospectivo y la selección de acciones válidas en tareas de demostración formal. El checkpoint publicado corresponde a la época 2 (actualización 1244) y se distribuye en formato FP8 nativo, conservando la arquitectura, el tokenizador y los activos originales del modelo base.

El modelo resuelve un problema muy específico: dotar a un modelo multimodal de gran escala de la capacidad de generar planes matemáticos sintéticos y seleccionar acciones válidas dentro de un pipeline de demostración asistida por herramientas. La supervisión incluye tanto el plan prospectivo como la acción original seleccionada, con el contexto original, los intentos fallidos y las salidas de herramientas enmascarados, de modo que el modelo aprende a razonar sin depender de trazas de error previas.

Con 179.999.981.459 parámetros totales (aproximadamente 180 mil millones) y un tamaño de repositorio de 185,6 GB, se trata de un modelo de gran escala orientado a razonamiento matemático y multimodal (image-text-to-text). Es relevante ahora porque representa un experimento explícitamente entrenado sobre benchmark, con evaluación humana pendiente, y porque demuestra un flujo de trabajo de ajuste fino LoRA sobre un modelo FP8 nativo sin degradar los tensores originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), FP8 nativo, con proyecciones de atención/GDN; ajuste LoRA sobre el modelo base |
| Parametros totales | 179.999.981.459 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 nativo (checkpoint publicado en FP8); entrenamiento LoRA en BF16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-Flash-Next, un transformer multimodal de aproximadamente 180 mil millones de parámetros con arquitectura FP8 nativa. El ajuste se realiza mediante LoRA de rango 32 y alpha 64, sin dropout, con una tasa de aprendizaje de 1e-5 a 1e-6, calentamiento de 63 actualizaciones y decaimiento coseno a lo largo de las dos épocas completas. El tamaño de lote es 7, con un grupo genuino de 4 filas en cada frontera de época, sin descartar ni duplicar filas. Se preservan todos los token IDs, máscaras y acciones originales, con truncamiento cero.

El conjunto de entrenamiento consta de 4.351 ejemplos verificados procedentes de 61 problemas de optimización de pruebas, con 8.702 exposiciones reales de filas (dos épocas). No se utilizó conjunto de validación ni división reservada. La supervisión cubre un plan matemático prospectivo sintético y la acción válida original seleccionada; el contexto original, los intentos fallidos y las salidas de herramientas están enmascarados. Cada objetivo seleccionado contó con una comprobación de versión superada y una ganancia de puntuación positiva. Los planes fueron revisados por estratos y comprobados en cuanto a fundamentación, aunque no están certificados semánticamente de forma independiente. El razonamiento no tiene una longitud objetivo artificial; su masa de pérdida se equilibra respecto a la acción.

La exportación fusiona las 84 proyecciones de atención/GDN entrenadas en BF16 mediante la implementación verificada de PEFT 0.20, manteniendo el resto de tensores sin cambios. Se realizó una aceptación acotada en cuatro GPU A100 de 80 GB: carga del modelo, 16 lecturas de probabilidad con entradas fijas de entrenamiento, 3 sondas de razonamiento con respuesta conocida y 10 clientes nativos de shell/herramientas Lemex. Estas comprobaciones no establecen retención general del razonamiento, capacidad de contexto completo en A100 ni mejora en benchmarks; no se ejecutó ningún benchmark completo de pruebas.

## Capacidades

- Generación de texto y razonamiento matemático orientado a demostraciones formales.
- Generación de planes matemáticos prospectivos y selección de acciones válidas en pipelines de prueba.
- Capacidad multimodal image-text-to-text (heredada del modelo base).
- Soporte de tool calling / function calling mediante la interfaz nativa Qwen/Lemex.
- Razonamiento multi-paso con integración de herramientas de shell.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de razonamiento con texto de razonamiento capturable (verificado en las sondas de aceptación).

## Casos de uso

- Optimización de pruebas matemáticas asistida: el modelo puede generar planes prospectivos y seleccionar acciones válidas en un pipeline de demostración formal, aprovechando que fue entrenado específicamente sobre 61 problemas de proof-optimization con supervisión de planes y acciones.
- Automatización de razonamiento con herramientas: gracias al soporte de tool calling y a los clientes nativos de shell/herramientas Lemex, puede integrarse en entornos de ejecución que requieran invocar comandos y validar resultados intermedios.
- Investigación en ajuste fino eficiente: sirve como referencia para estudiar el impacto de LoRA rango 32 sobre un modelo FP8 nativo de 180 mil millones de parámetros, con metadatos de procedencia y hashes disponibles en `export_metadata.json`.
- Evaluación de retención de razonamiento: útil para experimentos controlados que comparen el rendimiento del modelo base frente al ajustado en tareas de razonamiento matemático, dado que el autor indica que la evaluación humana está pendiente.
- Generación de datos sintéticos de razonamiento: el modelo puede producir trazas de razonamiento y planes matemáticos que sirvan como material de entrenamiento o validación en pipelines de datos sintéticos.
- Prototipado de asistentes multimodales especializados: al conservar la arquitectura image-text-to-text del modelo base, puede emplearse en tareas que combinen entrada de imagen y texto con razonamiento estructurado, siempre que se valide su comportamiento fuera del dominio de proof-optimization.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se ejecutó ningún benchmark completo de pruebas y que las comprobaciones de aceptación (16 lecturas de probabilidad, 3 sondas de razonamiento y 10 clientes de herramientas) no establecen mejora en benchmarks ni retención general del razonamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint FP8 de 185,6 GB requiere al menos 185 GB de VRAM solo para los pesos; con overhead de activaciones y contexto, se recomienda un mínimo de 4 GPU A100 de 80 GB (configuración usada en la aceptación acotada) o equivalente.
- GPU recomendadas: A100 80GB (verificadas en la aceptación), H100 80GB, o clústeres multi-GPU con suficiente memoria agregada.
- No cabe en GPU de consumo (RTX 4090, 24 GB) ni en configuraciones de una sola GPU de 80 GB sin técnicas de offloading o paralelismo.
- Opciones de despliegue: interfaz nativa Qwen/Lemex (indicada por el autor); compatible con transformers y safetensors; no se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-ProofOpt-FullCodexSFT-20261102-epoch2-FP8 | 179.999.981.459 | no disponible | qwen-community-1.0 | safetensors (FP8) | Ajuste LoRA especializado en proof-optimization |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | no disponible | qwen-community-1.0 | no disponible | Modelo base sin ajuste específico de proof-optimization |
| Otros modelos de proof-optimization | no disponible | no disponible | no disponible | no disponible | No se dispone de alternativas comparables en la información proporcionada |

No se dispone de datos de benchmarks que permitan comparar el rendimiento relativo con el modelo base ni con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo fue entrenado explícitamente sobre benchmark, sin división reservada ni validación en entrenamiento; el autor advierte que la evaluación humana está pendiente y que no se ejecutó ningún benchmark completo de pruebas.
- Las comprobaciones de aceptación no establecen retención general del razonamiento, capacidad de contexto completo en A100 ni mejora en benchmarks.
- Los planes sintéticos fueron revisados por estratos y comprobados en cuanto a fundamentación, pero no están certificados semánticamente de forma independiente.
- Riesgo de sobreajuste al dominio de proof-optimization y a los 61 problemas del conjunto de entrenamiento.
- No se dispone de información sobre sesgos conocidos ni sobre el rendimiento multilingüe.
- La licencia qwen-community-1.0 puede imponer restricciones para uso comercial; es necesario revisar el archivo `LICENSE` incluido en el repositorio.
- El uso en producción requiere validación independiente, dado que el modelo es un experimento de investigación y no un modelo evaluado de forma exhaustiva.
- El despliegue requiere hardware de alta gama (múltiples A100/H100) y la interfaz nativa Qwen/Lemex; no se documentan alternativas de serving ligero.

## Enlaces

- HuggingFace: https://huggingface.co/EPFL-LARA/Qwen3.8-Flash-Next-ProofOpt-FullCodexSFT-20261102-epoch2-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia: incluida en el repositorio como `LICENSE`
- Model card original del base: incluida en el repositorio como `BASE_MODEL_README.md`
- Metadatos de exportación: incluidos en el repositorio como `export_metadata.json`
