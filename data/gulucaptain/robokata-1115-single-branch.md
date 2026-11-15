# gulucaptain/RoboKata-1115-single-branch

## Resumen

RoboKata-1115-single-branch es un adaptador LoRA de investigación para robótica, desarrollado por el usuario gulucaptain, que se construye sobre el modelo base Zero-WAM de Robbyant-Research. Se trata de una ablación de ajuste fino supervisado centrada en una única rama de consulta (Query branch) por escena, dentro del marco A+B1+Foresight Indexing. El repositorio contiene únicamente la preparación del entrenamiento y las comprobaciones en CPU; en el momento de la publicación no se han subido pesos entrenados ni se ha evaluado el rendimiento en bucle cerrado.

El objetivo del experimento es aislar el efecto de reducir la cobertura de trayectorias Query supervisadas de 2.700 a 450, manteniendo el resto de la configuración de optimización (20 épocas virtuales, 6.600 actualizaciones totales, batch global de 64 en cuatro GPU). El adaptador se inicializa directamente desde la revisión del base humano-pretrenado de Zero-WAM, sin cargar ningún checkpoint previo de RoboICL, A, B1 ni de indexación.

Por su naturaleza, no es un modelo listo para producción sino un artefacto de investigación reproducible: cada directorio `epoch-NNN` incluye los tensores entrenables en `adapter.safetensors`, metadatos de paso, tamaño y SHA256, y la configuración completa con la procedencia de la ablación. La relevancia actual radica en documentar de forma transparente las variables de confusión del experimento (cobertura de Query, inicialización, filtrado de ramas Demo) para que otros investigadores puedan interpretar correctamente los resultados cuando estén disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre el modelo base Zero-WAM (arquitectura del base no detallada en la informacion disponible) |
| Parametros totales | No disponible (el repositorio ocupa 0.0 GB; solo se publican tensores entrenables del adaptador) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (entrenamiento en BF16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `adapter.safetensors` (LoRA) junto con `adapter.json` y `adapter_config.json` por época; el base congelado no se duplica |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Zero-WAM, un modelo base de robótica preentrenado con datos humanos, en su revisión `7040c4195df216c900334ef62d5fdcf05c0601aa`. La configuración de ajuste fino emplea LoRA de rango 106, optimizador AdamW con LR 1e-5, warmup de 100 pasos y decaimiento coseno hasta 1e-6. Se entrenan también módulos añadidos A/B1/indexación, inicializados desde cero, junto con el optimizador y el planificador. Las entradas se procesan a resolución 224×224 para las ramas Demo y 224×288 para las Query, en BF16.

El conjunto de datos fija 450 trayectorias Query supervisadas, una por familia de estado inicial de entrenamiento, cubriendo las 300 tareas. Se retienen 3.608 pares Demo–Query legales de la misma tarea y 2.550 demostraciones RGB de entrenamiento, mientras que los 260 pares de validación originales quedan reservados. El presupuesto de optimización se replica mediante muestreo repetido: 20 épocas virtuales de 330 actualizaciones cada una (6.600 actualizaciones totales), con batch global de 64 repartido en cuatro GPU. Cada época virtual presenta 21.120 ejemplos y no equivale a una pasada única por los datos. Se aplica dropout de Demo de 0.3, peso semántico de 0.5, peso de key de 0.5 y condicionamiento de vídeo limpio. Las intensidades de indexación arrancan en 0.2, se mantienen durante 400 actualizaciones y después se entrenan con restricción de no negatividad. La normalización de estado y acción se ajusta solo sobre las 450 trayectorias Query seleccionadas. Semillas: 1 para entrenamiento y 20261115 para selección de rama.

## Capacidades

- No se han publicado capacidades funcionales evaluadas del adaptador; el repositorio no contiene pesos entrenados en el momento de la publicación.
- El modelo base Zero-WAM está orientado a robótica (pipeline `robotics`), con preentrenamiento sobre datos humanos.
- El adaptador incorpora mecanismos de Foresight Indexing con intensidades entrenables bajo restricción de no negatividad.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible como capacidad documentada del adaptador.

## Casos de uso

- Reproducción de ablaciones en investigación robótica: el repositorio permite replicar el experimento de rama única con cobertura reducida de Query (450 frente a 2.700), usando la configuración exacta de optimización, semillas y presupuesto de actualizaciones documentada.
- Estudio del efecto de la inicialización: al partir directamente del base humano-pretrenado sin cargar checkpoints A, B1 o indexados, sirve para aislar el impacto de la inicialización frente a la variación de datos, siempre que se tenga en cuenta la confusión documentada.
- Análisis de cobertura de datos en aprendizaje por imitación: comparar el rendimiento con 450 trayectorias Query frente a la cobertura completa permite cuantificar la sensibilidad del modelo al número de familias de estado inicial supervisadas.
- Validación de pipelines de entrenamiento distribuido: la configuración de cuatro GPU con batch 16 por GPU, 330 actualizaciones por época virtual y muestreo repetido es un caso práctico para verificar la reproducibilidad de schedules y el estado del sampler.
- Auditoría de integridad de checkpoints: el formato por época con SHA256, tamaño y `adapter_config.json` con procedencia permite construir flujos de verificación de pesos en entornos de investigación colaborativa.
- Base para experimentos de indexación aprendida: las intensidades de indexación con arranque fijo y restricción de no negatividad son un punto de partida para estudiar el efecto del Foresight Indexing en tareas de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el rendimiento en bucle cerrado no ha sido evaluado y que los pesos solo aparecen tras épocas completadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del modelo base Zero-WAM, cuyas dimensiones no se detallan).
- GPU recomendadas: el entrenamiento documentado usa cuatro GPU con batch 16 por GPU; no se especifica el modelo de GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: se debe cargar con la integración RoboKata correspondiente; el código fuente y el punto de entrada de inferencia se incluyen en `source-code.zip`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoboKata-1115-single-branch | No disponible (adaptador LoRA) | No disponible | No evaluado | No disponible | Pesos no publicados en la fecha de creación |
| Zero-WAM (Robbyant-Research/zero-wam-pretrain) | No disponible | No disponible | No disponible | No disponible | Modelo base referenciado |
| RoboICL baseline / variantes A, B1 | No disponible | No disponible | No disponible | No disponible | Mencionados como comparadores en la model card, sin datos públicos en la información disponible |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El repositorio no contiene pesos entrenados en el momento de la publicación; la creación del repositorio no implica que el entrenamiento haya comenzado.
- El rendimiento en bucle cerrado no ha sido evaluado, por lo que no hay evidencia de utilidad práctica del adaptador.
- Confusión documentada: la cobertura de Query supervisadas cambia de 2.700 a 450, lo que impide atribuir diferencias de rendimiento únicamente al diseño de rama única.
- Las ramas Demo no se filtran por escena, lo que introduce otra variable no controlada.
- La comparación con la ejecución B1-initialized de datos completos cambia simultáneamente inicialización y datos, por lo que no aísla el efecto de los datos.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas soportados no disponibles; no se documentan capacidades multilingües.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible.
- Las intensidades de indexación guardadas no deben reiniciarse al cargar el adaptador; hacerlo altera el comportamiento entrenado.
- El estado del optimizador, RNG y sampler permanece en los checkpoints completos del servidor, no en el repositorio, lo que limita la reanudación exacta del entrenamiento desde Hugging Face.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gulucaptain/RoboKata-1115-single-branch
- Modelo base: https://huggingface.co/Robbyant-Research/zero-wam-pretrain
- Código fuente e inferencia: incluido en `source-code.zip` dentro del repositorio (sin URL directa disponible)
