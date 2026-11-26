# hirundo-io/d3-westernized

## Resumen

hirundo-io/d3-westernized es un modelo de decisión (decision-model) publicado por hirundo-io como un merge del modelo base vllm-sr/d3, orientado a mitigación de sesgos mediante un proceso que el autor denomina "westernized". Se distribuye bajo licencia Apache 2.0 y con acceso restringido (gated) en Hugging Face, y su pipeline declarado es zero-shot-classification, lo que sugiere un uso previsto para tareas de clasificación y toma de decisiones más que para generación de texto libre.

El modelo cuenta con 26.085.330.160 parámetros (aproximadamente 26.000 millones) almacenados en safetensors, con un repositorio de 52,2 GB. La arquitectura declarada en los tags es qwen3_5, lo que apunta a una familia derivada de Qwen 3.5, aunque no se dispone de documentación adicional que confirme detalles de contexto, tokenizador o composición del entrenamiento. Incorpora código personalizado (custom_code), por lo que su carga requiere confiar en la implementación incluida en el repositorio.

La relevancia actual del modelo radica en su enfoque explícito hacia la mitigación de sesgos y la adaptación cultural ("westernized"), un área de creciente interés para despliegues en producción que requieren alineación con normativas y expectativas regionales. No obstante, la ausencia de métricas publicadas, de información sobre idiomas y de documentación técnica detallada limita seriamente su evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según tags; detalles no disponibles) |
| Parametros totales | 26.085.330.160 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica únicamente que el modelo se basa en la arquitectura etiquetada como qwen3_5 y que es un merge del modelo vllm-sr/d3. No se especifican el número de capas, la dimensión oculta, el mecanismo de atención, ni si emplea atención lineal, decodificación especulativa u otras innovaciones. Tampoco se detalla la composición del dataset de entrenamiento, el número de tokens procesados ni si se aplicaron fases de RLHF, DPO o ajuste supervisado.

El proceso de "westernization" que da nombre al modelo se presenta como una intervención de mitigación de sesgos, pero no se documenta la metodología concreta: no se indica si se trata de un fine-tuning sobre datos filtrados, de una modificación de capas mediante merge de pesos, o de una recalibración de preferencias. La presencia de código personalizado (custom_code) implica que la arquitectura de carga no es estándar y requiere ejecutar el código del repositorio, lo que añade un riesgo de seguridad y reproducibilidad que debe evaluarse antes de su uso en producción.

## Capacidades

- Clasificación zero-shot: el pipeline declarado es zero-shot-classification, por lo que el uso principal previsto es la asignación de etiquetas a textos sin entrenamiento específico por tarea.
- Modelo de decisión: los tags lo identifican como decision-model, orientado a la toma de decisiones o enrutamiento más que a la generación abierta.
- Mitigación de sesgos: incorpora un proceso declarado de "westernization" destinado a reducir sesgos en las salidas.
- Generación de texto: no confirmada explícitamente en la información disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Clasificación de contenido en moderación: el modelo puede emplearse para etiquetar textos entrantes en categorías predefinidas mediante zero-shot-classification, aprovechando su orientación a la mitigación de sesgos para reducir falsos positivos en colectivos sensibles.
- Enrutamiento de consultas en sistemas de atención al cliente: dado su carácter de decision-model, puede asignar cada consulta a un departamento o flujo de resolución, aunque la falta de datos sobre contexto e idiomas obliga a validar el comportamiento en el dominio concreto.
- Filtrado de candidatos en pipelines de datos: puede clasificar documentos o registros según criterios definidos en tiempo de inferencia, integrándose como etapa de preprocesamiento antes de un modelo generativo mayor.
- Evaluación de sesgo en datasets: al estar entrenado con un proceso explícito de mitigación, puede usarse como referencia para comparar la distribución de etiquetas frente a modelos no intervenidos.
- Clasificación de tickets de soporte técnico: asignación automática de prioridad o categoría en función de la descripción del problema, con validación previa de que el modelo cubre el idioma de los tickets.
- Investigación sobre alineación cultural: útil como objeto de estudio para analizar cómo un merge orientado a "westernization" altera las decisiones del modelo base vllm-sr/d3 en tareas de clasificación sensibles a contexto cultural.
- Selección de contenido en recomendadores: clasificación de ítems según políticas editoriales antes de su publicación, siempre que se verifique el rendimiento en el catálogo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 26.085 millones de parámetros en safetensors (probablemente fp16/bf16, dado el tamaño de 52,2 GB del repositorio), se requieren aproximadamente 52 GB de VRAM para cargar los pesos sin cuantizar, más overhead de activaciones y contexto.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para inferencia en precisión completa; en configuraciones multi-GPU, pares de A100 40 GB o RTX 6000 Ada con suficiente memoria agregada.
- GPU de consumo: no cabe en GPU de consumo de 24 GB (RTX 4090, 3090) sin cuantización, y no se dispone de versiones GGUF ni cuantizadas publicadas en la información proporcionada.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; la presencia de custom_code obliga a usar la implementación del repositorio, lo que puede limitar la compatibilidad con servidores de inferencia estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| hirundo-io/d3-westernized | 26,1 B | no disponible | Apache 2.0 | Gated | Merge de vllm-sr/d3, custom_code, sin benchmarks |
| vllm-sr/d3 (modelo base) | no disponible | no disponible | no disponible | no disponible | Base del merge; sin documentación pública en la información disponible |
| Qwen 3.5 (familia referenciada) | no disponible | no disponible | no disponible | no disponible | Arquitectura de referencia según tags; sin datos concretos verificables |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas de precisión, latencia ni robustez que permitan validar el rendimiento declarado.
- Documentación técnica insuficiente: se desconocen contexto, idiomas, tokenizador y metodología de entrenamiento, lo que impide evaluar su idoneidad para producción.
- Código personalizado: la etiqueta custom_code implica ejecutar código del repositorio para cargar el modelo, con el riesgo de seguridad y reproducibilidad asociado.
- Acceso restringido: el modelo es gated y requiere aceptar condiciones en Hugging Face, lo que puede limitar su uso en entornos automatizados o auditorías externas.
- Sesgos: aunque el modelo declara mitigación de sesgos mediante "westernization", este proceso puede introducir un sesgo cultural inverso hacia perspectivas occidentales, no cuantificado en la información disponible.
- Riesgo de alucinación: no evaluado; al ser un modelo de clasificación, el riesgo se manifiesta como etiquetas incorrectas con alta confianza.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de documentación sobre procedencia de datos de entrenamiento impide verificar el cumplimiento de derechos de autor o de regulaciones de datos.
- Idiomas no declarados: no se puede asumir soporte multilingüe; debe validarse empíricamente antes de desplegarlo en mercados no anglófonos.

## Enlaces

- Hugging Face: https://huggingface.co/hirundo-io/d3-westernized
- Modelo base referenciado: vllm-sr/d3 (sin URL pública confirmada en la información disponible)
