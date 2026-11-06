# EPFL-LARA/Qwen3.8-Flash-Next-ProofOpt-FullCodexSFT-20261102-epoch1-FP8-early

## Resumen

Qwen3.8-Flash-Next-ProofOpt-FullCodexSFT-20261102-epoch1-FP8-early es un checkpoint experimental derivado de Qwen/Qwen3.8-Flash-Next, publicado por el laboratorio EPFL-LARA. Se trata de un ajuste fino supervisado (SFT) orientado a la optimización de demostraciones matemáticas y al razonamiento sintético, entrenado sobre 4.351 ejemplos seleccionados procedentes de 61 problemas de referencia y exportado en formato FP8 nativo. El modelo conserva la arquitectura, el tokenizador y la configuración del modelo base; el entrenamiento se aplicó mediante un adaptador LoRA BF16 de rango 32 y alpha 64, posteriormente fusionado en los pesos FP8 oficiales.

El checkpoint corresponde a la época 1 (paso 622) de un plan de dos épocas que continúa entrenándose de forma independiente. No es una versión final ni una release con todas las comprobaciones superadas: la propia model card lo describe como una vista previa de evaluación. El modelo base es multimodal (pipeline image-text-to-text) y cuenta con 179.999.981.459 parámetros totales según los pesos safetensors, lo que lo sitúa en la categoría de modelos de gran escala.

Su relevancia es doble. Por un lado, documenta un flujo de trabajo reproducible de ajuste fino sobre un modelo de 180.000 millones de parámetros con cuantización FP8, incluida la conversión byte a byte de 120 tensores LoRA nativos a 168 tensores de Hugging Face. Por otro, expone de forma explícita un fallo de seguimiento de herramientas observado durante la evaluación (9 de 10 clientes ejecutaron el comando de shell requerido), lo que resulta útil para investigadores interesados en la fiabilidad de agentes basados en modelos grandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen3.8-Flash-Next; detalles internos no disponibles |
| Parametros totales | 179.999.981.459 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 nativo (pesos exportados en FP8); adaptadores entrenados en BF16 y fusionados |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en la model card) |
| Formato de pesos | safetensors (131 shards), FP8 nativo |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-Flash-Next, un transformer multimodal del que no se detallan en la información disponible ni el número de capas, ni la dimensión oculta, ni si emplea mezcla de expertos. El ajuste fino se realizó con un adaptador LoRA nuevo en BF16 con rango 32 y alpha 64, tasa de aprendizaje 1e-5, 63 actualizaciones de calentamiento y decaimiento coseno a lo largo de las dos épocas planificadas. No se utilizó conjunto de validación ni holdout durante el entrenamiento.

La supervisión combina planes matemáticos prospectivos sintéticos con acciones válidas seleccionadas del contexto original. El contexto previo, las acciones fallidas y las salidas de herramientas se enmascaran; cada objetivo seleccionado contaba con una comprobación de versión superada y una ganancia positiva. La masa de pérdida de acción y de razonamiento está equilibrada y no se truncaron tokens ni acciones. Los 120 tensores LoRA nativos se mapean byte a byte a 168 tensores de Hugging Face, y las 84 exclusiones BF16 entrenadas se fusionaron en el formato FP8 nativo oficial mediante la implementación verificada de PEFT 0.20, manteniendo intactos los tensores no entrenados, el tokenizador y la configuración.

## Capacidades

- Generación de texto y razonamiento multimodal: el pipeline image-text-to-text del modelo base se conserva, por lo que admite entradas de imagen y texto.
- Razonamiento matemático y optimización de demostraciones: el ajuste se centró en planes matemáticos prospectivos y acciones válidas verificadas.
- Seguimiento de herramientas (tool following): evaluado con 10 clientes nativos Lemex; 9 ejecutaron correctamente el comando de shell solicitado y 1 devolvió el texto pero omitió el comando.
- Razonamiento multi-paso: la supervisión incluye acciones seleccionadas dentro de trayectorias con contexto enmascarado, orientadas a la resolución de problemas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de pensamiento explícito: no disponible.
- Visión, audio u otras modalidades: solo se confirma la modalidad image-text-to-text del pipeline; no se detallan capacidades adicionales.

## Casos de uso

- Investigación en optimización de demostraciones matemáticas: el modelo puede emplearse para generar y evaluar planes de demostración en entornos controlados, ya que fue entrenado específicamente sobre planes matemáticos prospectivos con comprobaciones de versión superadas.
- Evaluación de fiabilidad de agentes con herramientas: sirve como banco de pruebas para medir la tasa de seguimiento de instrucciones de shell y detectar fallos silenciosos, dado que la model card documenta explícitamente un caso de omisión de comando.
- Reproducción de pipelines de ajuste fino a gran escala: el repositorio incluye export_metadata.json y export_validation.json, lo que permite auditar la conversión de tensores LoRA a FP8 y replicar el proceso con PEFT 0.20.
- Experimentos de razonamiento sintético: los datos de supervisión con contexto enmascarado y acciones válidas seleccionadas son adecuados para estudiar cómo influye el enmascaramiento en la retención de razonamiento.
- Despliegue en infraestructura de 4x A100 80GB: la model card confirma la carga en cuatro A100 de 80 GB con comprobaciones de probabilidad de entrada fija, lo que lo hace utilizable en clústeres de investigación con ese perfil de hardware.
- Análisis de cuantización FP8 en modelos de 180.000 millones de parámetros: al conservar los 131 shards de pesos y la licencia original, permite comparar el comportamiento FP8 frente al modelo base en tareas de razonamiento.
- Estudio de fallos de alineación en agentes: el caso preservado sin reintento del cliente que omitió el comando es un ejemplo real para investigar modos de fallo en tool calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta comprobaciones acotadas: 9/10 en el smoke test nativo de Lemex, 16 comprobaciones de probabilidad con entrada fija superadas y 3 sondas de razonamiento con respuesta conocida superadas. El autor indica explícitamente que estas comprobaciones no establecen retención general de razonamiento, capacidad de contexto completo ni mejora en benchmarks, y que el benchmark completo se ejecutará por separado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 185,6 GB en FP8, por lo que la carga completa requiere al menos ese orden de magnitud de memoria agregada.
- GPU recomendadas: la model card confirma la carga en cuatro A100 de 80 GB (320 GB agregados), configuración validada por el autor.
- Cabe en GPU de consumo: no disponible; con 180.000 millones de parámetros en FP8, no es viable en una única GPU de consumo convencional.
- Opciones de despliegue: se indica usar la misma interfaz de servicio FP8 nativa de Qwen/Lemex que el modelo base. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Qwen3.8-Flash-Next-ProofOpt-FullCodexSFT (este) | 179.999.981.459 | no disponible | qwen-community-1.0 | Checkpoint experimental, época 1 |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible en la informacion | no disponible | qwen-community-1.0 | Modelo base oficial |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es una vista previa de evaluación, no una release con todas las comprobaciones superadas; el entrenamiento de dos épocas continúa de forma independiente.
- Fallo documentado de seguimiento de herramientas: 1 de 10 clientes nativos devolvió el texto solicitado pero omitió el comando de shell; el resultado fallido se conserva sin reintento.
- Las comprobaciones realizadas (16 de probabilidad con entrada fija y 3 sondas de razonamiento) no demuestran retención general de razonamiento ni capacidad de contexto completo.
- No se realizó validación durante el entrenamiento ni se reservó holdout, lo que limita la estimación de generalización.
- Los planes de supervisión son sintéticos y no constituyen el razonamiento interno del profesor ni están certificados semánticamente de forma independiente.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles.
- Licencia qwen-community-1.0: deben revisarse las restricciones de uso comercial en el archivo LICENSE incluido antes de cualquier despliegue en producción.
- El repositorio incluye 131 shards de pesos y la licencia original; la integridad debe verificarse con export_metadata.json y export_validation.json.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EPFL-LARA/Qwen3.8-Flash-Next-ProofOpt-FullCodexSFT-20261102-epoch1-FP8-early
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Organización EPFL-LARA: https://huggingface.co/EPFL-LARA
- Licencia qwen-community-1.0: incluida en el repositorio como LICENSE
- Metadatos de exportación: export_metadata.json (incluido en el repositorio)
- Validación de exportación: export_validation.json (incluido en el repositorio)
