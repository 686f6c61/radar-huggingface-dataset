# Donghyun1228/pi05-libero-pad-vision-head-yaw30-1000-20261105

## Resumen

π0.5 LIBERO yaw30 es un checkpoint de investigación en robótica basado en la familia π0.5 (pi05) de openpi, adaptado mediante un esquema de *PAD* (adaptación parcial de dominios) sobre el benchmark LIBERO. Lo publica el usuario Donghyun1228 como artefacto reproducible del repositorio `vla_adaptation`, con el objetivo de documentar una fila concreta de la tabla de resultados del artículo asociado. No es un modelo de lenguaje generativo de propósito general, sino un *vision-language-action model* (VLA) que produce acciones motoras a partir de observaciones visuales y consignas de tarea.

El checkpoint parte de `pi05-libero-pad-vision-head-source-n50k-10000-20261104` (paso 9999) y aplica una adaptación restringida exclusivamente al codificador visual PaliGemma (`PaliGemma/img`) mediante una pérdida de modelado inverso de dinámica (IDM) sobre una sonda de soporte yaw30 con 50 000 muestras. El resto de componentes (cabeza IDM, LLM y *action expert*) permanecen congelados en el estado de origen. El entrenamiento consistió en 1000 actualizaciones con AdamW, LR pico 5e-5, batch 32 y semilla 42.

Su relevancia es acotada pero clara para la comunidad de robótica: permite auditar si adaptar solo el *vision tower* con una pérdida auxiliar de dinámica mejora la transferencia en LIBERO, y publica la política de evaluación exportada junto con el recuento por suite. El éxito medido es 450/2000 = 22,50 % sobre 500 episodios por suite, semilla de entorno 7 y evaluador congelado `kn_b200` en MuJoCo 3.2.3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en π0.5 (openpi): codificador visual PaliGemma + LLM + action expert, con cabeza IDM auxiliar en entrenamiento |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a instrucciones de tarea en robótica) |
| Licencia | Apache-2.0 |
| Formato de pesos | `params`, `train_state` y `assets` (normalización) en `999/`; política exportada en `policy/` con `export.json` |
| Tamano del repo | 15,6 GB |
| Inicializacion | `Donghyun1228/pi05-libero-pad-vision-head-source-n50k-10000-20261104` (paso 9999) |
| Componente adaptado | Solo `PaliGemma/img` (codificador visual) con pérdida IDM |
| Componentes congelados | Cabeza IDM, LLM y action expert (estado de origen) |
| Entrenamiento | AdamW, LR pico 5e-5 (warmup 500, luego constante), batch 32, 1000 updates, semilla 42 |
| Exclusión en pérdida IDM | Índice de gripper 6 |
| Benchmark de evaluacion | LIBERO, 500 episodios por suite, semilla de entorno 7, evaluador `kn_b200` congelado, MuJoCo 3.2.3 |

## Arquitectura y entrenamiento

El modelo se apoya en la arquitectura π0.5 implementada en openpi: un *backbone* vision-language (PaliGemma) que procesa imágenes de cámara, un LLM que integra la instrucción de tarea y un *action expert* que emite las acciones. Sobre esta base, el checkpoint añade una cabeza IDM (modelado inverso de dinámica) utilizada únicamente durante el entrenamiento para generar una señal auxiliar sobre el codificador visual.

La innovación del artefacto es el régimen de adaptación: en lugar de ajustar todo el modelo, solo se entrena el *vision tower* `PaliGemma/img` con la pérdida IDM sobre la sonda yaw30 (n50k), excluyendo el índice de gripper 6 de dicha pérdida. El entrenamiento es corto y controlado (1000 actualizaciones, semilla fija 42), lo que lo convierte en un punto de comparación reproducible. La política exportada en `policy/` corresponde al paso 999 sin la cabeza IDM, y la cámara de muñeca utiliza el *vision tower* adaptado según `export.json`. No se documentan en la información disponible el volumen total de tokens de entrenamiento, la composición completa del dataset ni el uso de RLHF/DPO.

## Capacidades

- Control robótico de manipulación en el benchmark LIBERO a partir de observaciones visuales e instrucciones de tarea.
- Percepción visual mediante un codificador PaliGemma adaptado específicamente al dominio yaw30.
- Ejecución de políticas de acción exportadas (`policy/`) listas para evaluación con el evaluador `kn_b200`.
- Entrenamiento con señal auxiliar IDM para aprender dinámica inversa sobre el espacio visual.
- Evaluación reproducible con recuento por suite en `run/evaluation_audit.json`.
- No se documentan en la información disponible capacidades de *tool calling*, agentes multi-paso, multilingüismo, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en adaptación de dominios para VLA: usar el checkpoint como línea base PAD para medir cuánto aporta adaptar solo el codificador visual frente a ajustar el modelo completo, con la misma semilla y presupuesto de actualizaciones.
- Reproducción de resultados de LIBERO: ejecutar la política exportada en `policy/` con MuJoCo 3.2.3 y el evaluador `kn_b200` para verificar el 22,50 % reportado y auditar los recuentos por suite.
- Estudio de pérdidas auxiliares: comparar la pérdida IDM sobre la sonda yaw30 con alternativas (por ejemplo, sin exclusión del gripper 6) para aislar su efecto en la tasa de éxito.
- Análisis de congelación selectiva: evaluar el compromiso entre coste de entrenamiento (1000 updates, batch 32) y rendimiento al mantener LLM y *action expert* en el estado de origen.
- Punto de partida para adaptaciones posteriores: reutilizar `999/params` y `assets` como inicialización de nuevos experimentos PAD sobre otras sondas o suites de LIBERO.
- Docencia y divulgación técnica: ilustrar un flujo completo de openpi, desde la inicialización hasta la exportación de política y la auditoría de evaluación, con artefactos y argumentos (`run/spec.json`) publicados.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| LIBERO | Éxito global (450/2000) | 22,50 % |
| LIBERO | Episodios por suite | 500 |
| LIBERO | Semilla de entorno | 7 |
| LIBERO | Evaluador | `kn_b200` congelado, MuJoCo 3.2.3 |

No se han publicado en la información disponible resultados desglosados por suite ni comparaciones con otros modelos en la model card. El recuento por suite se referencia en `run/evaluation_audit.json`, pero sus valores no se incluyen en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 15,6 GB e incluye `params`, `train_state` y `assets`, por lo que el espacio en disco requerido es de al menos ese tamaño; la VRAM dependerá del *dtype* y del *batch* de evaluación, no especificados.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que quepa en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: el artefacto está pensado para el *stack* openpi (política exportada en `policy/` con `export.json`) y evaluación con MuJoCo 3.2.3 y el evaluador `kn_b200`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento LIBERO | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 LIBERO yaw30 PAD (este) | no disponible | no disponible | 22,50 % (450/2000) | Apache-2.0 | HuggingFace, repo de 15,6 GB |
| `pi05-libero-pad-vision-head-source-n50k-10000-20261104` | no disponible | no disponible | no disponible | no disponible | HuggingFace (origen de inicialización) |
| Otras variantes openpi/π0.5 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de resultados de modelos alternativos comparables bajo el mismo protocolo de evaluación, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- El rendimiento reportado es bajo en términos absolutos (22,50 % de éxito), por lo que no es adecuado como política de producción sin ajuste adicional.
- El alcance es experimental: una única sonda (yaw30), una única semilla (42) y 1000 actualizaciones; la varianza entre semillas no se documenta.
- Solo se adapta el codificador visual; las limitaciones del LLM y del *action expert* de origen se heredan sin cambios.
- La evaluación se realizó con un evaluador congelado concreto (`kn_b200`) y MuJoCo 3.2.3; cambios de versión o de evaluador pueden alterar los resultados.
- No se documentan sesgos, tasas de alucinación ni comportamiento fuera de distribución; al ser un modelo de acción, el riesgo se traduce en acciones incorrectas o inseguras en entornos físicos.
- No se especifican idiomas soportados ni capacidades multilingües.
- La licencia Apache-2.0 permite uso comercial, pero el modelo depende de componentes de openpi y PaliGemma cuyas condiciones deben verificarse por separado.
- El repositorio incluye `train_state`, lo que incrementa el tamaño (15,6 GB) y puede no ser necesario para solo inferencia.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-pad-vision-head-yaw30-1000-20261105
- Repositorio de código citado: `Donghyun1228/vla_adaptation` (commit `7b74d01d`)
- Checkpoint de inicialización: https://huggingface.co/Donghyun1228/pi05-libero-pad-vision-head-source-n50k-10000-20261104
- openpi (framework): no se proporciona URL en la información disponible
- Artículo (paper) de referencia: no se proporciona URL en la información disponible
- Benchmark LIBERO: no se proporciona URL en la información disponible
