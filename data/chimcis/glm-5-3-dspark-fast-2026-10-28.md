# chimcis/GLM-5.3-DSpark-fast-2026-10-28

## Resumen
GLM-5.3-DSpark-fast-2026-10-28 es un modelo borrador (drafter) para decodificación especulativa sobre el modelo base zai-org/GLM-5.3, publicado por el usuario chimcis en Hugging Face. No es un modelo generativo autónomo: su función es proponer bloques de tokens candidatos que el modelo grande verifica en paralelo, acelerando la decodificación sin alterar la distribución de salida del modelo principal. Emplea la técnica DSpark, un esquema de drafting por bloques con cabeza de Markov y cabeza de confianza.

El checkpoint corresponde a la ejecución "c3fixseg", paso 31 (el final tras 32 unidades), con 6 capas, tamaño oculto 6144, bloque de 16 tokens y cabeza de Markov de rango 256. El repositorio ocupa 4,7 GB y contiene 2.344.316.673 parámetros en formato safetensors. La model card indica que Prime Intellect lo sirve en la ruta interna `internal/glm-5.3-fast`.

Su relevancia es operativa: la model card reporta una longitud de aceptación (AL) de 4,059 con k=7 sobre 133.957 bloques de validación reservados, y en servicio real sobre GB200 TP4 con TP4 y flags de producción una mejora de 30,75 a 22,04 ms por token frente a DFlash2 k=4. Es, por tanto, una pieza de infraestructura de inferencia, no un modelo para uso directo por el usuario final.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Drafter DSpark para decodificación especulativa por bloques (6 capas, hidden size 6144, bloque 16, cabeza de Markov rango 256, cabeza de confianza) |
| Parámetros totales | 2.344.316.673 |
| Parámetros activos | no disponible (no es un MoE según la información disponible) |
| Longitud de contexto | no disponible (entrenado con secuencias de 16K tokens) |
| Tipos de cuantización | no disponible (en servicio se usa `kv_cache_dtype: fp8` para la caché KV) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo es un drafter de bloques para decodificación especulativa, no un transformer generativo completo. Consta de 6 capas con dimensión oculta 6144, propone bloques de 16 tokens y añade una cabeza de Markov de rango 256 más una cabeza de confianza que permite verificación adaptativa. El checkpoint es el paso 31 de la ejecución "c3fixseg", el último tras 32 unidades.

El entrenamiento partió de un warm start desde `dspark-b16-20261026avg50`, usando el optimizador Muon con tasa de aprendizaje 4e-5 y decaimiento lineal, secuencias de 16K tokens y 1024 anclas. La función de pérdida combina 0,1 de entropía cruzada y 0,9 de distancia de variación total (TV), con decaimiento por posición de bloque gamma 8 y ponderación ×1,5 de los tramos de razonamiento (think spans). Los datos son etiquetas de GLM-5.3 a contexto completo sobre prompts de producción ponderados por la ruta rápida. No se documenta RLHF ni DPO.

## Capacidades
- Decodificación especulativa por bloques sobre GLM-5.3: propone hasta 16 tokens por bloque y el modelo base los verifica en paralelo.
- Verificación adaptativa: la cabeza de confianza permite ajustar dinámicamente el número de tokens especulativos (recomendado k=7).
- Integración con vLLM mediante `method: dspark`, con muestreo probabilístico del borrador.
- Soporte de kernels fusionados opcionales (`VLLM_DSPARK_FUSED_WALK=1`, `VLLM_DSPARK_FUSED_BACKBONE=1`) de la rama `chi/adaptive-varlen-v0.31.0` de PrimeIntellect-ai/vllm-prod.
- No genera texto de forma autónoma ni incorpora tool calling, agentes, visión, audio ni capacidades multilingües propias: hereda el comportamiento del modelo base GLM-5.3 al que acompaña.

## Casos de uso
- Aceleración de inferencia en producción de GLM-5.3: desplegado con vLLM y `method: dspark`, reduce los milisegundos por token de 30,75 a 22,04 en la configuración medida, lo que se traduce directamente en menor coste por token servido.
- Servicio de chat interactivo de baja latencia: con AL de 3,29 en servicio, la generación token a token se acelera en sesiones multi-turno, mejorando el tiempo hasta el primer token percibido en interfaces conversacionales.
- Despliegue en clústeres GB200 con TP4: la model card valida la configuración con flags de decodificación de producción, lo que permite planificar capacidad en infraestructura de alta gama.
- Reducción de coste en rutas de alto tráfico: al ser un drafter de 2,3 mil millones de parámetros, el coste computacional de las propuestas es bajo frente al modelo base, lo que hace rentable la especulación en cargas con prompts de producción.
- Evaluación y ajuste de pipelines de decodificación especulativa: sirve como referencia para comparar esquemas de drafting (frente a DFlash2 k=4) con métricas de AL y latencia.
- Investigación en decodificación especulativa: la combinación de cabeza de Markov, cabeza de confianza y pérdida TV con decaimiento por posición de bloque es un caso de estudio reproducible para quien investigue verificación adaptativa.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| AL offline, k=7, 133.957 bloques de validación reservados | 4,059 |
| AL offline, campeón anterior | 3,799 |
| AL offline, avg50 | 3,989 |
| AL offline, c3base | 4,052 |

| Configuración en servicio (GB200 TP4, flags de producción, c=32) | DFlash2 k=4 | Este stack |
|---|---|---|
| Longitud de aceptación (AL) | 2,77 | 3,29 |
| ms de decodificación por token | 30,75 | 22,04 (unas 1,4× más rápido) |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es un generador autónomo.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 4,7 GB en safetensors, por lo que los pesos en precisión original rondan esa cifra y la huella adicional depende de la caché KV y del modelo base GLM-5.3, que domina el consumo.
- GPU recomendadas: la model card valida GB200 con TP4; no se documentan otras configuraciones.
- ¿Cabe en GPU de consumo? No disponible. El drafter por sí solo es pequeño, pero requiere el modelo base GLM-5.3 en memoria, cuyo tamaño no se especifica en la información proporcionada.
- Opciones de despliegue: vLLM con `method: dspark`, `num_speculative_tokens: 7`, `kv_cache_dtype: fp8`, `draft_sample_method: probabilistic` y `enable_adaptive_verification: true`. Los kernels fusionados requieren la rama `chi/adaptive-varlen-v0.31.0` de PrimeIntellect-ai/vllm-prod.
- Latencia y throughput: 22,04 ms por token en GB200 TP4 con flags de producción y c=32, frente a 30,75 ms con DFlash2 k=4.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | AL (offline, k=7) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-DSpark-fast-2026-10-28 | 2.344.316.673 | no disponible | 4,059 | other | Hugging Face (chimcis) |
| avg50 (dspark-b16-20261026avg50) | no disponible | no disponible | 3,989 | no disponible | no disponible |
| c3base | no disponible | no disponible | 4,052 | no disponible | no disponible |
| DFlash2 k=4 | no disponible | no disponible | 2,77 (en servicio) | no disponible | no disponible |

## Limitaciones y advertencias
- No es un modelo de propósito general: no genera respuestas por sí mismo, solo propone tokens para verificación por GLM-5.3; usarlo sin el modelo base no tiene sentido.
- Licencia "other": no se detallan los términos, por lo que el uso comercial requiere revisar las condiciones del autor y del modelo base zai-org/GLM-5.3 antes de desplegarlo.
- Solo se valida en vLLM con la rama específica de Prime Intellect para los kernels fusionados; fuera de esa pila el rendimiento puede degradarse.
- Las métricas de servicio proceden de sesiones propias de la ruta `glm-5.3-fast` en GB200 TP4; no hay garantía de que se trasladen a otro hardware, lote o distribución de prompts.
- Idiomas soportados no disponibles: la cobertura lingüística depende enteramente del modelo base.
- Riesgo de alucinación: la verificación especulativa preserva la distribución del modelo base, pero no corrige sus sesgos ni errores factuales.
- La información de la búsqueda web no contiene datos relevantes sobre este modelo; no se han podido verificar fuentes externas.

## Enlaces
- Hugging Face: https://huggingface.co/chimcis/GLM-5.3-DSpark-fast-2026-10-28
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Rama de vLLM con kernels fusionados: PrimeIntellect-ai/vllm-prod, rama `chi/adaptive-varlen-v0.31.0` (no se dispone de URL directa en la información proporcionada)
- Paper, blog o demo: no disponible
