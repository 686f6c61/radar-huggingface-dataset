# mm1m1/inkling-2-mini-saes

## Resumen

Inkling 2 Mini SAEs es una colección de autoencoders dispersos (sparse autoencoders, SAE) entrenados sobre el modelo base `thinkingmachines/Inkling-2-Mini`, un transformer con bloques de mezcla de expertos (MoE) de 24 capas y tamaño oculto 2304. Los SAE, publicados por el usuario `mm1m1`, actúan como diccionarios TopK de 32.768 características en las que exactamente 32 están activas por token y pasada, y permiten tanto leer representaciones internas como intervenir sobre ellas (steering y ablación) al poder empalmarse en el modelo.

El artefacto cubre seis capas del modelo base: 3, 8, 11, 14, 17 y 21. Cada archivo ocupa 604 MB en float32 y el repositorio completo suma 6,0 GB, incluyendo índices de características y ficheros auxiliares para centrado por pasada. La relevancia actual reside en que es un ejemplo de interpretabilidad mecanicista aplicada a un modelo MoE con capas en bucle (layers 6-17 se ejecutan tres veces por token), un caso poco frecuente en la literatura de SAE y que exige un tratamiento específico del "loop counter" mediante centrado por pasada.

La publicación se etiqueta explícitamente como *early preview* con resultados preliminares: la fidelidad de reconstrucción falla en la capa 14 y es borderline en la 21, y el steering es casi nulo en las capas 3, 17 y 21 (0-1 de 40 características). Por tanto, es una herramienta de investigación útil para experimentación, no un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder TopK sobre salidas de capas de un transformer MoE |
| Parametros totales | no disponible (cada SAE: W_enc 32768x2304, W_dec 2304x32768, sesgos y escalar) |
| Parametros activos | no aplica (el SAE no es MoE; el modelo base sí lo es: 128 expertos, 8 activos) |
| Longitud de contexto | no disponible (depende del modelo base Inkling-2-Mini) |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

Cada SAE es un diccionario TopK con 32.768 características y 32 activas por token y pasada. La entrada es la salida de `model.model.language_model.layers[L]` para cada token y cada pasada; en las capas en bucle (6-17) hay tres pasadas por token, numeradas p0, p1 y p2 según el orden de llamada del hook. El entrenamiento requiere centrado por pasada: se resta la media del estado correspondiente a esa capa y pasada antes de codificar y se suma de nuevo tras decodificar, usando `sae/pass_means.safetensors`. Un único SAE por capa cubre las tres pasadas.

Los tensores son `W_enc` (32768x2304), `b_enc`, `W_dec` (2304x32768), `b_dec` y un escalar `scale`; las columnas del decodificador tienen norma unitaria. Los datos de entrenamiento citados en la model card son `HuggingFaceFW/fineweb-edu` y `allenai/WildChat-1M`. El número de estados de entrenamiento varía por capa: 40M para las capas 3 y 21, y 120M para las capas 8, 11, 14 y 17. La capa 21 dispone además de una variante con fine-tuning por divergencia KL. No se detallan en la información disponible la composición exacta del dataset, el número total de tokens ni si hubo RLHF o DPO.

## Capacidades

- Extracción de características interpretables: cada SAE expone 32.768 features con activaciones agrupadas por característica en los índices auxiliares.
- Lectura de representaciones internas: permite inspeccionar qué características se activan en cada capa y pasada.
- Steering: posibilidad de modificar activaciones para dirigir el comportamiento del modelo base (con eficacia limitada según capa, ver limitaciones).
- Ablación: permite desactivar características concretas para estudiar su contribución.
- Empalme en el modelo: los SAE pueden insertarse en el forward del modelo base mediante hooks.
- Índice de características a gran escala: `feature_index_big/` cubre 100M tokens de FineWeb-Edu con conteos de activación, disparos top y muestreados, y un pool de tokens aleatorios con negativos para auto-interpretación.
- Soporte de auto-interpretación: los ficheros `L{layer}_acts.safetensors` agrupan todas las activaciones no nulas en documentos de test para explicar y puntuar características.
- No es un modelo generativo: no produce texto, código ni razonamiento por sí mismo; opera sobre el modelo base.

## Casos de uso

- Investigación en interpretabilidad mecanicista: analizar qué features se activan en capas concretas de un MoE con bucles, usando los índices de test de 256 documentos de FineWeb-Edu y el índice grande de 100M tokens.
- Auditoría de representaciones: identificar características asociadas a conceptos concretos mediante auto-interpretación con los ficheros de activaciones agrupadas.
- Experimentos de steering controlado: modificar la activación de features seleccionadas para inducir cambios de comportamiento, teniendo en cuenta que la eficacia es baja en las capas 3, 17 y 21.
- Ablación de características: desactivar features para medir su impacto en la salida del modelo base, útil para estudiar circuitos internos.
- Estudio del efecto de las pasadas en capas en bucle: comparar activaciones p0, p1 y p2 en las capas 8, 11, 14 y 17 para entender cómo evoluciona la representación en cada iteración.
- Docencia y formación: material práctico para cursos de interpretabilidad con SAE sobre arquitecturas MoE y capas recurrentes.
- Validación de metodología SAE: usar la variante con fine-tuning KL de la capa 21 frente a la versión sin ajustar para comparar métricas de fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye métricas cualitativas de fidelidad y steering por capa, pero no tablas numéricas de MMLU, HumanEval, GSM8K ni similares. Se indica que la capa 14 falla el criterio de fidelidad, la capa 21 es borderline (excede el umbral en 0,004 nats, menos de 1 error estándar) y el steering es casi nulo en las capas 3, 17 y 21 (0-1 de 40 features).

## Requisitos de hardware

- VRAM para el SAE: cada fichero es de 604 MB en float32; cargar un SAE junto con el modelo base requiere espacio adicional para `W_enc`, `W_dec` y los ficheros de medias por pasada.
- VRAM para el modelo base: no disponible en la información proporcionada; Inkling-2-Mini es un MoE de 24 capas con 128 expertos y 8 activos, por lo que su huella depende de la configuración de despliegue.
- GPU recomendadas: no disponible; el código de ejemplo sugiere ejecutar el modelo base en GPU (`cuda`) y mantener los tensores del SAE en CPU, lo que reduce la VRAM adicional necesaria.
- ¿Cabe en GPU de consumo? No disponible; depende del tamaño del modelo base, no especificado.
- Opciones de despliegue: `transformers` 5.24.1 (versión usada en entrenamiento y por el Space), con `AutoModelForMultimodalLM` y `AutoTokenizer`; carga de pesos con `safetensors.torch.load_file` y descarga con `huggingface_hub.hf_hub_download`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros conjuntos de SAE comparables ni datos de rendimiento que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Estado *early preview*: los resultados son preliminares y provienen de un proyecto en curso.
- Fidelidad de reconstrucción: la capa 14 falla el criterio de fidelidad del autor; la capa 21 es borderline (excede el umbral en 0,004 nats, menos de 1 error estándar).
- Steering limitado: casi nulo en las capas 3, 17 y 21 (0-1 de 40 features), lo que restringe los experimentos de intervención en esas capas.
- Dependencia del centrado por pasada: omitir la resta y suma de las medias de `pass_means.safetensors` degrada la calidad de las features, ya que el offset por pasada consume capacidad.
- Dependencia de la revisión del modelo base: los SAE se entrenaron sobre una revisión concreta de `thinkingmachines/Inkling-2-Mini`, indicada en `config.json`; usar otra revisión puede invalidar los resultados.
- Cobertura parcial: solo seis capas de 24 están cubiertas (3, 8, 11, 14, 17 y 21), no todas las capas del modelo.
- Idiomas: no se especifican los idiomas soportados; los datos de entrenamiento citados son FineWeb-Edu y WildChat-1M.
- Riesgo de alucinación: no aplica directamente al SAE, pero las interpretaciones derivadas de las features pueden ser erróneas si la auto-interpretación no se valida.
- Licencia: apache-2.0 para el repositorio de SAE; debe verificarse por separado la licencia del modelo base para uso comercial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mm1m1/inkling-2-mini-saes
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset WildChat-1M: https://huggingface.co/datasets/allenai/WildChat-1M
- Paper referenciado (arXiv:2408.05147): https://arxiv.org/abs/2408.05147
- Paper referenciado (arXiv:2406.04093): https://arxiv.org/abs/2406.04093
