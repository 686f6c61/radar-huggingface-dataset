# duanjc21/cis6280-stacking-policy

## Resumen

`duanjc21/cis6280-stacking-policy` es un conjunto de pesos publicado como proyecto final del curso CIS 6280 (otoño de 2026) de la Universidad de Pensilvania. Contiene la mejor política entrenada para una mano diestra que debe apilar cuatro cajas en simulación dentro del entorno `VariedBoxEnv` del repositorio oficial del curso. No es un modelo de lenguaje: es un artefacto de robótica compuesto por varios módulos (política de difusión condicionada a subobjetivos, modelo del mundo JEPA, estimador visual PlaceNet y un actor residual de PPO) que se ejecutan conjuntamente en un bucle de control.

La relevancia técnica está en la combinación de imitación (política de difusión con *diffusion forcing* y AdaLN sobre latentes actual y objetivo), un modelo del mundo tipo JEPA aportado por el profesorado del curso y un refinamiento posterior con RL residual (PPO). El paquete ocupa 0,3 GB e incluye pesos en fp32 que se ejecutan con autocast bf16 en GPU. Está pensado exclusivamente para investigación y docencia, no para despliegue comercial.

El modelo no declara idiomas, no procesa texto y no tiene ventana de contexto en el sentido de los LLM; su "contexto" es el latente del modelo del mundo y las características visuales de dos cámaras. Los resultados publicados en la model card son sobre 300 escenas de validación oficiales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de difusión condicionada a subobjetivos (*diffusion forcing*, AdaLN sobre latente actual y latente objetivo) + modelo del mundo JEPA (SMWM-C3) + PlaceNet (estimador visual) + actor residual PPO |
| Parámetros totales | 63,66 M (40,05 M política + 18,32 M modelo del mundo + 5,12 M PlaceNet + 0,17 M actor residual) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; estado = latente del modelo del mundo + 2 vistas de cámara) |
| Tipos de cuantización | no disponible; pesos en fp32, inferencia en bf16 con autocast |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | other (uso de investigación y docencia; el modelo del mundo pertenece a GMLR-Penn) |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

El sistema se compone de cuatro piezas. La política base `goal-succ` (40,05 M parámetros) es un modelo de difusión condicionado a subobjetivos, con modulación AdaLN sobre el latente actual y el latente del subobjetivo, entrenado únicamente con demostraciones que apilan las cuatro cajas. El modelo del mundo `smwm-c3` (18,32 M) es el JEPA oficial del curso, incluido sin modificar para que el paquete sea autocontenido. PlaceNet (5,12 M) convierte dos vistas de cámara en una estimación del desplazamiento de la caja transportada y del hueco, que alimenta al actor. El actor residual PPO (0,17 M, iteración 60) añade en cada paso una corrección xyz de muñeca de como máximo 2 mm por paso de entorno y una ganancia de dedos.

La política base se ejecuta con la configuración `{"candidates":1,"generate":16,"execute":1,"tau":0.25,"patience":24,"temperature":0.0}`. El actor residual recibe como entradas el latente actual, el latente del subobjetivo activo, las características de PlaceNet, la acción base y el tiempo transcurrido; explícitamente no ve estado del simulador. El crítico, que sí veía la verdad del simulador, no se incluye en el paquete (solo se usó en entrenamiento). No se detalla en la información disponible el número de tokens, la composición del dataset de demostraciones ni si hubo etapas adicionales de RLHF o DPO.

## Capacidades

- Control robótico de manipulación diestra: apilado de cuatro cajas en simulación dentro de `VariedBoxEnv`.
- Planificación por subobjetivos: la política está condicionada a latentes objetivo, lo que permite encadenar metas parciales.
- Generación de acciones por difusión con muestreo determinista (`temperature: 0.0`) y política de paciencia (`patience: 24`).
- Refinamiento fino de acciones mediante RL residual: correcciones de muñeca de hasta 2 mm por paso y ajuste de la ganancia de los dedos.
- Percepción visual a partir de dos cámaras mediante PlaceNet (estimación de desplazamiento y hueco de la caja transportada).
- Uso de un modelo del mundo JEPA para representar el estado sin depender del estado interno del simulador en el actor.
- No soporta tool calling, function calling, agentes multi-paso lingüísticos, capacidades multilingües, visión general, audio ni modo de razonamiento textual.

## Casos de uso

- Investigación en imitación con difusión: reproducir el pipeline de *diffusion forcing* condicionado a subobjetivos sobre demostraciones de apilado para estudiar estabilidad y modos de fallo en manipulación diestra.
- Docencia en robótica: usar el paquete como referencia autocontenida (incluye el modelo del mundo oficial) para prácticas de CIS 6280 o cursos equivalentes sobre RL y modelos del mundo.
- Estudio de RL residual sobre políticas de imitación: comparar el salto de rendimiento del actor PPO (de 47 % a 70 % de éxito a cuatro cajas) y analizar qué correcciones aprende sin acceso al estado del simulador.
- Evaluación de modelos del mundo JEPA: emplear `smwm-c3` como encoder congelado y medir la calidad de los latentes en tareas de planificación por subobjetivos.
- Análisis de percepción para manipulación: evaluar PlaceNet como estimador de desplazamiento y hueco a partir de dos vistas, y su impacto en la política aguas abajo.
- Reproducción de benchmarks internos: ejecutar el comando de evaluación sobre las 300 escenas oficiales de validación para obtener métricas comparables (cajas máximas, cajas finales, tasa de éxito a cuatro cajas).
- Base para experimentos de sim-a-real en laboratorio: partir de los pesos y sustituir el entorno simulado por una configuración física, asumiendo que el modelo del mundo y PlaceNet requerirían reentrenamiento o ajuste.

## Benchmarks y rendimiento

Resultados sobre 300 escenas oficiales de validación, según la model card:

| Configuración | Cajas máximas | Cajas finales | Alcanzó 4 | Éxito a 4 cajas |
|---|---|---|---|---|
| Baseline oficial (planificación por objetivos) | 1,38 | 1,13 | — | — |
| `goal-succ` + paciencia 24 + temperatura 0 | 3,19 | 2,83 | 54 % | 47 % |
| **+ RL residual `res-v1` iteración 60** | **3,76** | **3,42** | **82 %** | **70 %** |

Comparación emparejada frente a `goal-succ`: mejora de +0,59 cajas finales con IC del 95 % [0,41; 0,77] y +23 puntos de éxito con IC del 95 % [16; 30] (bootstrap). No se han publicado otros benchmarks (tipo MMLU, HumanEval o GSM8K) en la información disponible, ya que el modelo no es lingüístico.

## Requisitos de hardware

- VRAM estimada para inferencia: el paquete completo son 63,66 M parámetros; en fp32 ocupa aproximadamente 255 MB de pesos y en bf16 unos 127 MB. Con activaciones y buffers de difusión, es razonable esperar menos de 2 GB de VRAM, aunque la cifra exacta no está publicada.
- GPU recomendadas: cualquier GPU con soporte bf16 y suficiente memoria; el comando de evaluación del autor usa `--gpus 0,1` con 32 workers, lo que sugiere ejecución multi-GPU para paralelizar escenas, no por requisito de memoria.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores, dado el tamaño reducido de los pesos.
- Opciones de despliegue: el paquete está atado al repositorio del curso (`goalpolicy.rl eval`); no hay integración publicada con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El bucle de control ejecuta 16 pasos de generación por paso de ejecución (`generate: 16`, `execute: 1`), lo que condiciona el coste por paso de entorno, pero no se publican tiempos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / estado | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `duanjc21/cis6280-stacking-policy` | 63,66 M (total) | Latente JEPA + 2 vistas | 70 % éxito a 4 cajas en 300 escenas | other (investigación/docencia) | Pesos en HF, código en repo privado |
| Política `goal-succ` sin RL residual (misma familia) | 40,05 M | Latente JEPA + 2 vistas | 47 % éxito a 4 cajas | other | Incluida en el mismo paquete |
| Baseline oficial del curso (planificación por objetivos) | no disponible | no disponible | 1,13 cajas finales de media | no disponible | Repositorio oficial del curso |

No se dispone de información sobre otros modelos comparables de apilado diestro con los que contrastar parámetros, contexto y rendimiento; se indica "no disponible" en esos ejes.

## Limitaciones y advertencias

- Ámbito muy restringido: solo apila cuatro cajas en `VariedBoxEnv`; no generaliza a otras tareas, objetos o entornos sin reentrenamiento.
- Dependencia del repositorio del curso: el código está en un repositorio privado (`DuanJincheng/cis6280-final-project`, commit `86a89b6`), por lo que la reproducibilidad externa es limitada.
- El crítico no se incluye; solo se distribuyen los pesos de inferencia.
- El modelo del mundo pertenece al profesorado (GMLR-Penn) y su licencia es "other"; conviene revisar las condiciones antes de cualquier uso fuera de docencia o investigación.
- Licencia "other" sin texto explícito en la información disponible: no se garantiza el uso comercial.
- El actor residual no observa el estado del simulador, pero el crítico sí lo hizo en entrenamiento; puede haber un desajuste entre el rendimiento reportado y el comportamiento en entornos con dinámica distinta.
- Riesgo de sobreajuste a las 300 escenas de validación oficiales; las métricas publicadas son de validación, no de un conjunto de test independiente.
- No hay información sobre sesgos, riesgos de alucinación (no aplica) ni comportamiento fuera de distribución más allá de lo indicado.
- Pesos en fp32 con inferencia en bf16: la reproducibilidad exacta de los resultados requiere respetar ese ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/duanjc21/cis6280-stacking-policy
- Repositorio del proyecto (privado, según la model card): GitHub `DuanJincheng/cis6280-final-project`, commit `86a89b6`
- Entorno `VariedBoxEnv` y agente oficial: repositorio del curso CIS 6280 (UPenn), no enlazado en la información disponible
- Modelo del mundo JEPA `smwm-c3`: pertenece a GMLR-Penn (curso), incluido en el paquete de pesos
