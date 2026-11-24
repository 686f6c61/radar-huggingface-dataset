# hanxuan2003/ForceBench-Token-Fusion-Pred

## Resumen

ForceBench-Token-Fusion-Pred es un conjunto de ocho checkpoints específicos de tarea para el modelo pi0.5 (vision-language-action, VLA), publicados por el autor hanxuan2003 en el contexto del benchmark ForceBench. Cada checkpoint corresponde a una tarea de manipulación robótica con contacto físico (ordenar pesos, girar grifos, accionar mandos de cocina, enroscar tuercas, etc.) y ha sido entrenado con una variante metodológica denominada Token Fusion + Pred, que combina una ruta de entrada de fusión de tokens con un objetivo auxiliar de predicción de la llave de fuerza futura durante el entrenamiento. Los pesos están en formato Orbax/OCDBT para JAX, no en safetensors ni GGUF, y el payload total de inferencia asciende a 99,55 GB (92,72 GiB).

El interés del release es doble. Por un lado, documenta de forma trazable la asociación entre los registros de evaluación guardados y la identidad de cada checkpoint, con tasas de éxito declaradas sobre 200 semillas por tarea (300–499). Por otro, es explícito sobre sus límites: el autor advierte de que las tasas son valores de referencia del manuscrito ICRA y no el resultado de nuevas ejecuciones, y de que la compatibilidad con el cargador público de estos archivos exactos aún no está verificada. Se trata, por tanto, de una publicación de pesos y no de un entorno ejecutable completo.

La relevancia actual reside en que pi0.5 es una de las arquitecturas VLA de referencia para control robótico con entrada visual y de fuerza, y este repositorio ofrece ocho políticas entrenadas sobre tareas de contacto con métricas publicadas y procedencia auditable. El modelo base pi0.5 emplea PaliGemma/Gemma, por lo que la licencia aplicable es la de Gemma, separada de las licencias de código ForceBench (MIT) y OpenPI (Apache).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (vision-language-action) sobre base PaliGemma/Gemma; checkpoints JAX en formato Orbax/OCDBT |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se documenta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se publican pesos en precisión original; no se documentan variantes cuantizadas) |
| Idiomas soportados | en |
| Licencia | gemma (términos Gemma aplicables al modelo base; código ForceBench MIT y OpenPI Apache son licencias separadas) |
| Formato de pesos | Orbax/OCDBT (directorio con `params/`, `assets/` y `_CHECKPOINT_METADATA`); no hay `.pt` ni `.safetensors` |

## Arquitectura y entrenamiento

El modelo se apoya en pi0.5, una política vision-language-action que procesa observaciones visuales y señales de fuerza para producir acciones de control robótico. La variante publicada aquí, identificada públicamente como método F4, incorpora una ruta de entrada de Token Fusion junto con un objetivo auxiliar de predicción de la llave de fuerza futura (future-wrench prediction) durante el entrenamiento. Es importante subrayar que las etiquetas de fuerza futura no son entradas de inferencia: solo actúan como señal de supervisión auxiliar en el entrenamiento.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. Los pesos se distribuyen como directorios Orbax/OCDBT, con el payload de inferencia compuesto por `params/` completo, `assets/` (la jerarquía de normalización original de cada tarea) y el `_CHECKPOINT_METADATA` raíz cuando existe en la exportación original. El estado del optimizador y las cachés de entrenamiento no forman parte de este release de inferencia.

## Capacidades

- Generación de acciones de manipulación robótica en simulación para ocho tareas concretas: Weight Sort, CoM Sort, Faucet Turn, Faucet Direction, Stove Turn, Stove Press, Drawer Pull y Nut Thread.
- Control basado en contacto con fuerza: la política consume señales de fuerza y la variante incorpora predicción auxiliar de fuerza futura durante el entrenamiento.
- Percepción visual y comprensión de instrucciones en inglés (idioma declarado: en).
- Ejecución de políticas específicas por tarea, con un checkpoint dedicado a cada una de las ocho tareas.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito (thinking mode).
- Capacidades multilingües: no disponibles; el modelo declara únicamente inglés.

## Casos de uso

- Evaluación comparativa de métodos de fusión de fuerza en robótica: los ocho checkpoints permiten reproducir o contrastar las tasas de éxito publicadas por tarea (por ejemplo, 78% en Weight Sort o 48,5% en CoM Sort) frente a otras variantes del benchmark.
- Investigación en manipulación con contacto: útil para estudiar cómo influye el objetivo auxiliar de predicción de fuerza futura en tareas como girar un grifo (13,5% en Faucet Turn) o accionar un mando de cocina (6% en Stove Turn).
- Análisis de tareas de alta dificultad: los checkpoints de Stove Press (1%) y Drawer Pull (4%) sirven como casos de estudio de fallo y para diagnosticar dónde se rompe la política.
- Reentrenamiento o ajuste fino sobre políticas pi0.5: los pesos y los assets de normalización por tarea permiten partir de una política ya entrenada para experimentar con nuevas variantes metodológicas.
- Auditoría de procedencia y reproducibilidad: el repositorio incluye PROVENANCE.json, RELEASE_SCOPE.md y SHA256SUMS, lo que facilita verificar identidades de checkpoint, tamaños en bytes y hashes de normalización en trabajos académicos.
- Docencia e investigación en VLA: como material de partida para cursos o proyectos que necesiten políticas robóticas con métricas publicadas y licencia conocida, siempre que se resuelva antes la compatibilidad del cargador y el runtime congelado.

## Benchmarks y rendimiento

Los datos disponibles son las tasas de éxito declaradas en el manuscrito ICRA, sobre 200 semillas de evaluación (300–499) por tarea y método. El autor advierte de que no son el resultado de nuevas ejecuciones ni de una reproducción extremo a extremo.

| Tarea | Directorio de checkpoint | Éxitos / 200 | Tasa | Payload (GB) |
|---|---|---:|---:|---:|
| Weight Sort | `checkpoints/weight_sort/9999` | 156 | 78% | 12,444 |
| CoM Sort | `checkpoints/rattle_sort/9999` | 97 | 48,5% | 12,444 |
| Faucet Turn | `checkpoints/faucet_turn/9999` | 27 | 13,5% | 12,444 |
| Faucet Direction | `checkpoints/faucet_force_turn/9999` | 65 | 32,5% | 12,444 |
| Stove Turn | `checkpoints/stove_turn_on/9999` | 12 | 6% | 12,444 |
| Stove Press | `checkpoints/stove_press_turn/9999` | 2 | 1% | 12,444 |
| Drawer Pull | `checkpoints/radmanso_drawer_sort_table/9999` | 8 | 4% | 12,444 |
| Nut Thread | `checkpoints/nut_thread/9999` | 53 | 26,5% | 12,444 |

No se han publicado en la información disponible resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) ni comparaciones numéricas con modelos VLA alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia de orden de magnitud, cada checkpoint ocupa 12,444 GB en disco, por lo que se requiere al menos esa cantidad de memoria acelerada para cargar un único checkpoint, más el overhead del runtime JAX.
- GPU recomendadas: no disponibles en la información proporcionada. El stack es JAX/Orbax, por lo que se necesitan GPUs compatibles con JAX y con el runtime congelado correspondiente.
- ¿Cabe en GPU de consumo? No confirmado. El tamaño de un checkpoint (12,444 GB) es compatible con GPUs de 16 GB o más en teoría, pero la compatibilidad del cargador público con estos archivos exactos está declarada como no verificada (ver RUNTIME.md).
- Opciones de despliegue: el release no incluye entorno ejecutable completo. Se requiere un runtime congelado correspondiente, la configuración exacta del modelo, el tokenizer y la normalización original. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ForceBench-Token-Fusion-Pred (pi0.5, método F4) | no disponible | no disponible | Tasas por tarea entre 1% y 78% (200 semillas) | gemma | Pesos en HF, runtime no verificado |
| Otras variantes ForceBench (48 checkpoints en 6 repositorios de force-fusion) | no disponible | no disponible | Tasas de referencia por método en el manuscrito | según repositorio | Pesos publicados |
| pi0.5 base (OpenPI) | no disponible | no disponible | no disponible en esta información | Apache (código OpenPI) + Gemma (modelo) | Disponible en OpenPI |

No se dispone de datos numéricos de modelos VLA alternativos en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Las tasas de éxito son valores de referencia del manuscrito ICRA, no resultados de nuevas ejecuciones ni de una reproducción extremo a extremo.
- La compatibilidad del cargador público con estos archivos exactos de checkpoint está declarada como no verificada; es imprescindible leer RUNTIME.md antes de planificar inferencia.
- Es un release de pesos, no un entorno ejecutable: falta el runtime congelado, la configuración exacta del modelo, el tokenizer y la normalización original.
- Los datasets de entrenamiento, los assets del tokenizer y los assets del simulador no se incluyen en el repositorio.
- El modelo solo declara inglés; no hay soporte multilingüe documentado.
- Las tareas con tasas muy bajas (Stove Press 1%, Drawer Pull 4%, Stove Turn 6%) no son adecuadas para uso en producción sin un análisis de fallo previo.
- En Faucet Direction, la métrica reportada requiere un procedimiento específico: copiar `outcome.criteria` de `summary.success_report` y sustituir solo la condición de ángulo final por la regla de cota inferior, conservando el resto de criterios. No debe usarse `final_success_report` ni el éxito en cualquier frame; los contadores en línea originales de ángulo acotado difieren de las tasas reportadas.
- La licencia Gemma impone términos y restricciones de uso aplicables al modelo base, separados de las licencias MIT (ForceBench) y Apache (OpenPI) del código; es necesario revisar LICENSES.md, LICENSE_GEMMA.txt, LICENSE_GEMMA_CURRENT.md y NOTICE antes de cualquier uso comercial.
- No se deben fabricar recibos de checkpoint ni desactivar la guarda de identidad del cargador público.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, aunque al tratarse de una política de control robótico el modo de fallo relevante es la ejecución incorrecta de la acción, no la generación de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hanxuan2003/ForceBench-Token-Fusion-Pred
- Código fuente ForceBench (revisión inspeccionada): https://github.com/forcebench-platform/ForceBench/tree/31acf7353d2f723985e6576a5708f67a81707d61
- Documentación de la familia de modelos (identificador público F4): https://github.com/forcebench-platform/ForceBench/blob/31acf7353d2f723985e6576a5708f67a81707d61/baselines/pi05/README.md
- Resultados de referencia congelados del paper: https://github.com/forcebench-platform/ForceBench/blob/31acf7353d2f723985e6576a5708f67a81707d61/results/paper_reference.json
- Protocolo experimental: https://github.com/forcebench-platform/ForceBench/blob/31acf7353d2f723985e6576a5708f67a81707d61/configs/paper_protocol.json
- RUNTIME.md (contrato de observación y brecha de compatibilidad, dentro del repositorio de HF)
- PROVENANCE.json (IDs de tarea, tamaños en bytes, hashes de normalización y notas de puntuación, dentro del repositorio de HF)
- RELEASE_SCOPE.md (alcance completo de los 48 checkpoints en seis repositorios, dentro del repositorio de HF)
