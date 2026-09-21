# CHOI0126/minsik-repro

## Resumen

`CHOI0126/minsik-repro` es una reproducción en curso del método DFlash (arXiv:2602.06036) aplicado a `Qwen/Qwen3.6-27B`, un modelo que el artículo original no cubre. No se trata de un modelo autónomo: es un cabezal borrador (*draft head*) de decodificación especulativa que, en una única pasada *forward*, propone un bloque de 16 tokens condicionado por los estados ocultos del modelo objetivo en las capas 1, 16, 31, 46 y 61, que el modelo objetivo verifica después en una sola pasada y confirma el prefijo coincidente.

El interés del repositorio es doble. Por un lado, publica checkpoints intermedios de un entrenamiento planificado a seis épocas (576.704 pasos de optimizador, un checkpoint cada media época, 48.058 pasos), con lo que permite seguir la evolución del borrador sin esperar al resultado final. Por otro, documenta de forma inusualmente explícita los problemas prácticos de una reproducción a gran escala: reinicio desde el paso 96.116 tras un fallo de los servidores de captura, desajuste de orden del corpus (algunas filas vistas siete veces y otras cinco), contaminación conocida en GSM8K y requisitos exactos de restauración del estado FSDP1.

El estado actual es *work in progress*: el autor solo reporta la eficiencia de bloque (τ), no la aceleración en tiempo de reloj, porque la campaña de medición se ejecutó compartiendo tarjeta con el entrenamiento. Los pesos están exportados en safetensors y el repositorio completo ocupa 332,2 GB, de los cuales 3,46 GB corresponden a cada borrador exportado y 24,22 GB a cada estado completo de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cabezal borrador DFlash para decodificación especulativa sobre un transformer denso; no es un modelo autónomo y no puede generar texto por sí solo |
| Parámetros totales | No disponible (checkpoint exportado de 3,46 GB); el modelo objetivo es `Qwen/Qwen3.6-27B` |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; el entrenamiento usa longitud máxima de 3072 tokens |
| Tipos de cuantización | No disponible (no se documenta ningún esquema de cuantización) |
| Idiomas soportados | No disponible; el corpus de entrenamiento son los *splits* en inglés de Nemotron Post-Training Dataset V2 más CodeAlpaca |
| Licencia | other (se aplican además las licencias upstream de Qwen3.6-27B y del dataset Nemotron) |
| Formato de pesos | safetensors (`config.json` + `model.safetensors`); los estados completos usan `training_state_rank*.pt` |
| Modelo base | Qwen/Qwen3.6-27B (pesos objetivo congelados) |
| Tamaño de bloque especulativo | 16 tokens, con 512 anclas |
| Tamaño del repositorio | 332,2 GB en total; 3,46 GB por borrador exportado y 24,22 GB por estado completo |
| Estado | Entrenamiento incompleto (0,50 épocas de 6 completadas en el checkpoint medido) |

## Arquitectura y entrenamiento

El borrador no es un transformer generativo independiente: es un cabezal que consume los estados ocultos del modelo objetivo en cinco capas concretas (1, 16, 31, 46 y 61) y emite un bloque de 16 tokens en una sola pasada. El modelo objetivo verifica ese bloque en una pasada y confirma únicamente el prefijo coincidente. Bajo verificación voraz, los tokens confirmados son exactamente los que el objetivo habría producido por sí solo; el autor lo demuestra empíricamente comparando dos borradores con τ 2,41 y τ 7,08 sobre 32 *prompts* de control, que generan salidas idénticas byte a byte y solo se diferencian en el número de ciclos de verificación (5.567 frente a 1.895). Un borrador peor degrada la velocidad, nunca la salida.

El entrenamiento sigue los ajustes declarados en el artículo: 6 épocas, tamaño de bloque 16, 512 anclas, *learning rate* 6e-4 con decaimiento coseno, *warmup* de 0,04, longitud máxima 3072 y un total de 576.704 pasos de optimizador con checkpoints cada 48.058 pasos. El tamaño de lote global de 8 no aparece en el artículo y sigue la receta de Qwen3.6 usada aguas arriba. El corpus consta de 775.164 filas procedentes de Nemotron Post-Training Dataset V2 (*splits* en inglés) y CodeAlpaca, con todas las respuestas regeneradas por Qwen3.6-27B a temperatura 0. El hardware de entrenamiento son 6 GPU H200: dos servidores de captura que alojan el modelo objetivo y cuatro rangos de entrenamiento. El estado completo se guarda en formato FSDP1 con particionado por rango DP4 (cuatro ficheros `training_state_rank*.pt`), de modo que restaurarlo exige el mismo número de rangos.

Hay dos particularidades que condicionan la reproducibilidad. La primera es un reinicio el 14 de septiembre de 2026 desde el checkpoint del paso 96.116 tras la caída de los servidores de captura por error del operador: como el productor de *prompts* no conserva estado de checkpoint, reinició su bucle en la época 0 mientras el entrenador continuaba desde el paso 96.116, con el mismo corpus pero en orden distinto. La segunda es que el checkpoint arranca un intento nuevo y no puede reinsertarse en la ejecución que lo escribió, porque el productor rechaza una ruta de canal ya existente y la cola no reconocida del libro mayor apuntaría a objetos Mooncake inexistentes. El procedimiento exacto de restauración está en `RESTORE.json` y en `scripts/seed_resume_ledger.py` del repositorio de GitHub.

## Capacidades

- Redacción de bloques especulativos de 16 tokens en una sola pasada *forward*, condicionada por los estados ocultos del objetivo en las capas 1, 16, 31, 46 y 61.
- Verificación voraz acoplada al objetivo, con garantía de que la salida confirmada coincide con la que produciría el modelo objetivo aislado.
- Aceleración de la decodificación del objetivo mediante reducción del número de ciclos de verificación (en el paso 48.058, τ entre 3,99 y 7,78 según conjunto de datos).
- No soporta *tool calling*, *function calling*, agentes ni razonamiento multi-paso por sí mismo: esas capacidades residen en el modelo objetivo, no en el borrador.
- No tiene capacidades de visión, audio ni modo *thinking* propios.
- No es multilingüe de forma verificable: el corpus de entrenamiento declarado es en inglés y no se documentan idiomas soportados.
- No puede generar texto ni responder instrucciones de manera autónoma bajo ninguna circunstancia.

## Casos de uso

- Aceleración de inferencia en producción sobre Qwen3.6-27B: el borrador se carga junto al objetivo en el mismo motor de servicio y reduce el número de ciclos de verificación por petición, lo que se traduce en menor latencia por token generado sin alterar la distribución de salida.
- Despliegue de asistentes conversacionales multi-turno: al mantener la salida idéntica a la del objetivo bajo verificación voraz, se puede introducir el borrador en un servicio ya validado sin rehacer la evaluación de calidad de respuestas.
- Servicio de generación de código con presupuesto de latencia ajustado: es el escenario donde τ es más bajo (7,78 en HumanEval y 5,64 en MBPP en el paso 48.058), por lo que el beneficio será menor, pero sigue siendo medible frente a la decodificación sin borrador.
- Investigación en decodificación especulativa: los checkpoints intermedios cada media época permiten estudiar la curva de convergencia de τ y comparar arquitecturas de borrador sin entrenar desde cero.
- Reproducción académica del método DFlash sobre un modelo base distinto del artículo: los scripts, los registros de medición y el procedimiento de restauración del libro mayor están publicados en el repositorio de GitHub.
- Ajuste fino posterior de borradores propios: el estado completo de entrenamiento (modelo, optimizador, planificador y RNG) permite reanudar con el mismo contrato de reanudación, siempre que se mantengan idénticos `num_epochs` y `total_steps` y el mismo número de rangos FSDP.
- Planificación de capacidad de servicio: las tablas de τ por conjunto de datos sirven para estimar cuántos ciclos de verificación necesitará un despliegue antes de comprometer hardware, sin depender de medidas de tiempo de reloj contaminadas por co-tenencia.

## Benchmarks y rendimiento

Solo se publican valores de τ (eficiencia de bloque, definida como tokens confirmados por pasada de verificación del objetivo, calculada como `(completion_tokens - 1) / spec_verify_ct` promediada sobre peticiones). La comparación es contra `z-lab/Qwen3.6-27B-DFlash`, el borrador publicado, medido en el mismo arnés y con los mismos conjuntos de *prompts* (hash `prompt_set_sha256` verificado como idéntico en los cinco conjuntos de datos). Checkpoint del paso 48.058, equivalente a media época de seis:

| Conjunto de datos | Este borrador | Borrador publicado | Porcentaje alcanzado |
|---|---:|---:|---:|
| gsm8k | 5,9494 | 7,3204 | 81,3 % |
| math500 | 6,2513 | 7,8262 | 79,9 % |
| humaneval | 7,7830 | 11,2378 | 69,3 % |
| mbpp | 5,6396 | 7,5507 | 74,7 % |
| mt-bench | 3,9949 | 4,8305 | 82,7 % |

Condiciones de medición: modo *thinking* desactivado, decodificación voraz (T=0, top_p 1, top_k 1), concurrencia 1, tamaño de bloque 16, máximo 2048 tokens nuevos, SGLang 0.5.18 y una instantánea del objetivo con identificador `6a9e13bd`. No se reportan cifras de MMLU, GSM8K en formato de precisión ni ninguna otra métrica de calidad, porque el borrador no produce respuestas propias. Tampoco hay datos de aceleración en tiempo de reloj: la campaña de medición se ejecutó compartiendo tarjeta con el entrenamiento y, según el autor, la aceleración se medirá en una tarjeta exclusiva cuando termine el entrenamiento. Los dos conjuntos de código son los que rinden peor, algo que el autor anticipó antes de medir: el corpus de entrenamiento contiene un 6,8 % de código frente al 14,7 % previsto, porque el *split* de código de Nemotron tiene 175.000 filas pero solo 33.884 *prompts* únicos y la deduplicación elimina el 73 % de lo solicitado.

## Requisitos de hardware

- Borrador exportado: 3,46 GB en safetensors. Cabe holgadamente en cualquier GPU de consumo, pero nunca se ejecuta solo.
- Modelo objetivo Qwen3.6-27B: alrededor de 54 GB en bf16 como estimación derivada del nombre del modelo; requiere como mínimo una GPU de 80 GB (A100 80 GB, H100 80 GB) o reparto en varias GPU.
- En GPU de consumo, el borrador sí cabe (RTX 3060 12 GB, RTX 4090 24 GB, etc.), pero el objetivo no cabe en una sola tarjeta de 24 GB en bf16; haría falta cuantización del objetivo, no documentada en la información disponible.
- Opciones de despliegue: la medición se hizo con SGLang 0.5.18. No se documentan otros motores en la información proporcionada. Otros motores con soporte de decodificación especulativa (vLLM, TGI, llama.cpp) no están verificados para este borrador en los datos disponibles.
- Entrenamiento: 6 GPU H200, con dos servidores de captura alojando el objetivo y cuatro rangos de entrenamiento. El estado completo requiere FSDP1 con DP4 y los cuatro ficheros `training_state_rank*.pt`.
- Latencia y throughput: no disponibles. El autor indica explícitamente que no se midieron porque la tarjeta estaba compartida con el entrenamiento.
- Espacio en disco: 332,2 GB para el repositorio completo, 3,46 GB por checkpoint exportado y 24,22 GB por estado completo.

## Comparativa con modelos similares

| Modelo | Rol | Parámetros | Contexto | Licencia | Estado | τ en gsm8k (paso 48.058) |
|---|---|---|---|---|---|---|
| CHOI0126/minsik-repro | Borrador DFlash, reproducción en curso | No disponible (checkpoint de 3,46 GB) | No disponible | other | Incompleto, 0,50 épocas de 6 | 5,9494 |
| z-lab/Qwen3.6-27B-DFlash | Borrador DFlash publicado | No disponible | No disponible | No disponible | Finalizado | 7,3204 |
| Qwen/Qwen3.6-27B | Modelo objetivo | Aproximadamente 27B | No disponible | No disponible | Finalizado | No aplica (sin decodificación especulativa) |

No se han encontrado en la búsqueda web otros borradores comparables (EAGLE, Medusa u otros) con datos medidos sobre el mismo objetivo y el mismo arnés, por lo que la comparativa se limita al borrador publicado de referencia y al modelo objetivo.

## Limitaciones y advertencias

- Modelo incompleto: es un entrenamiento en curso, con checkpoints cada media época. Nada de lo publicado es un resultado final y los números se moverán.
- No es un modelo autónomo: no genera texto, no responde instrucciones y no tiene utilidad sin el modelo objetivo Qwen3.6-27B cargado en paralelo.
- Los conjuntos de código (HumanEval, MBPP) rinden entre un 25 % y un 30 % por debajo del borrador publicado, y el corpus de entrenamiento tiene menos código del previsto (6,8 % frente al 14,7 %).
- Solo se reporta τ. No hay datos de aceleración en tiempo de reloj ni de throughput, y el autor advierte que las métricas de tiempo de reloj no sobreviven a la co-tenencia con el entrenamiento.
- Contaminación conocida: ocho elementos de test de GSM8K aparecen en el corpus de entrenamiento (2 exactos y 6 contenidos), un 0,0010 % de las 775.164 filas. Ninguno de esos ocho está entre los 128 elementos que miden las campañas de evaluación, por lo que las τ reportadas no se midieron sobre material visto en entrenamiento. Los índices están registrados en el repositorio de GitHub.
- Restauración frágil: el estado guardado arranca un intento nuevo y no puede reinsertarse en la ejecución original. Exige el mismo número de rangos FSDP, una ruta de canal nueva, un libro mayor con marcador duradero igual al paso del checkpoint, y mantener idénticos `num_epochs` y `total_steps`.
- Orden del corpus inconsistente: tras el reinicio del 14 de septiembre de 2026, algunas filas se han visto siete veces y otras cinco, aunque el presupuesto de pasos permanece en 576.704. Esto puede afectar a la comparabilidad entre checkpoints.
- Licencia `other` con doble restricción upstream: se aplican las licencias de Qwen/Qwen3.6-27B y de Nemotron Post-Training Dataset V2 más CodeAlpaca. Hay que revisarlas antes de redistribuir o usar comercialmente.
- Riesgo de alucinación: no aplica al borrador en sí, porque la verificación voraz garantiza que la salida confirmada coincide con la del objetivo. Cualquier riesgo de alucinación es el inherente al modelo objetivo.
- Idiomas: el corpus declarado es en inglés y no se documentan idiomas soportados, por lo que no se puede asumir un comportamiento correcto en castellano u otras lenguas.
- Sin datos de cuantización: no se documenta ningún esquema de cuantización para el borrador, y la información disponible no permite estimar el impacto de cuantizarlo en τ.
- Adopción nula: 0 descargas y 0 *me gusta* en el momento de la consulta, con un único autor y sin validación independiente de las mediciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CHOI0126/minsik-repro
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Borrador publicado de referencia: https://huggingface.co/z-lab/Qwen3.6-27B-DFlash
- Artículo de DFlash: https://arxiv.org/abs/2602.06036
- Repositorio del método, scripts y registros de medición: https://github.com/ms-choi-126/specforge-dflash-repro
- La búsqueda web realizada no devolvió resultados relevantes adicionales (únicamente páginas de inicio del motor de búsqueda).
