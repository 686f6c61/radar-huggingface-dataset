# myendless/action-repre-newtask14-n32-lvta-layerwise384-l36-head10k-d4621225

## Resumen

El modelo `myendless/action-repre-newtask14-n32-lvta-layerwise384-l36-head10k-d4621225` es un checkpoint de investigación para robótica desarrollado por el usuario `myendless`. No es un modelo de lenguaje generativo al uso, sino un módulo de representación de acciones ("action readout") entrenado sobre un VLM congelado de 4B parámetros (Qwen3-VL). Su función es convertir observaciones visuales y contexto lingüístico en trayectorias de acciones motoras (14 articulaciones en espacio articular absoluto), con un horizonte de predicción de 32 pasos. El checkpoint se ha entrenado específicamente para evaluar la generalización a nuevas tareas.

La arquitectura del readout es un DiT (Diffusion Transformer) por capas de 36 bloques, anchura 384, 6 cabezas de atención (dimensión 64) y 111.872.680 parámetros incluyendo los proyectores por capa. Emplea atención intercalada self/cross y mantiene los proyectores impares asignados pero sin uso. El entrenamiento consistió en 10.000 pasos sobre 14 tareas retenidas (4.928 episodios, 1.452.052 ventanas) con normalización compartida de 33 tareas fuente.

El interés de este checkpoint es metodológico: documenta un cambio arquitectónico respecto al experto de acción histórico de 28 capas de Qwen3, no una simple ablación de anchura. Sin embargo, no se ha realizado evaluación en bucle cerrado, por lo que no hay evidencia de tasa de éxito en control real. Es material de investigación reproducible, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM congelado (Qwen3-VL, 4B) + readout DiT por capas (layerwise DiT) |
| Parametros totales | 111.872.680 (solo readout entrenado; el VLM congelado se suma aparte) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en BF16, `model.pt` nativo PyTorch) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state dict (`model.pt`), no compatible con `AutoModel.from_pretrained` |

## Arquitectura y entrenamiento

El componente entrenado es un Diffusion Transformer por capas de 36 bloques con anchura 384, 6 cabezas de atención de dimensión 64 y proyectores por capa, totalizando 111.872.680 parámetros. Conserva el modo de atención intercalada self/cross; los proyectores impares permanecen asignados pero no se utilizan. La entrada visual y lingüística la aporta un VLM Qwen3-VL de 4B congelado, inicializado desde `myendless/action-repre-newtask33-lvta-v4-j14-h32-source30k-3d2c5a58` (revisión `180a85745d55ea6472f0fe3ddd69008a6f8620be`). La salida son acciones articulares absolutas de 14 dimensiones con horizonte de chunk de 32.

El entrenamiento se realizó durante 10.000 pasos desde cero para el readout, en 8 GPUs Hygon, precisión BF16, batch global 128 y semilla 42. Los datos cubren 14 tareas retenidas, cada una con 32 episodios limpios y 320 aleatorizados (4.928 episodios en total, 1.452.052 ventanas), con normalización compartida de 33 tareas fuente. La pérdida final de entrenamiento fue 0,022368688136339188. El autor advierte explícitamente que la pérdida de entrenamiento no equivale a tasa de éxito en control. No se incluyen episodios brutos, assets de simulador, estado del optimizador ni checkpoints intermedios.

## Capacidades

- Predicción de trayectorias de acción robótica en espacio articular absoluto (14 articulaciones) con horizonte de 32 pasos.
- Acondicionamiento visual y lingüístico mediante un VLM Qwen3-VL de 4B congelado.
- Generalización a nuevas tareas: el checkpoint está entrenado sobre 14 tareas retenidas para medir esta capacidad.
- Atención intercalada self/cross a lo largo de 36 capas del DiT.
- No soporta tool calling ni function calling (no es un modelo de lenguaje conversacional).
- No dispone de modo thinking, visión autónoma ni audio como capacidades desacopladas; la visión es un componente del pipeline, no una capacidad de salida.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en representación de acciones: servir como punto de partida reproducible para estudiar cómo influye la profundidad (36 capas) y anchura (384) del readout DiT en la generalización a tareas no vistas, comparándolo con el experto de 28 capas.
- Evaluación de generalización a nuevas tareas: al estar entrenado sobre 14 tareas retenidas, permite medir la transferencia del readout a manipulaciones no presentes en el conjunto fuente, siempre que se ejecute la evaluación en bucle cerrado que el autor no ha realizado.
- Base para ablaciones arquitectónicas: el checkpoint documenta proyectores impares sin uso y atención intercalada, lo que facilita experimentos controlados sobre qué componentes del DiT contribuyen al rendimiento.
- Reproducción de pipelines de entrenamiento: los directorios `metadata/` y `provenance/` permiten reconstruir la configuración, el manifiesto, la normalización y el entorno, útil para auditar metodologías en laboratorios de robótica.
- Integración en simuladores tipo RoboTwino: con el código de entrenamiento `action_repre` y el loader `QwenPIRepresentationV4` (`readout_architecture=layerwise_dit`) se puede desplegar el readout sobre el VLM congelado para generar acciones en entornos simulados.
- Estudio de normalización compartida multi-tarea: la normalización sobre 33 tareas fuente permite analizar cómo afecta la escala de acciones entre tareas a la estabilidad del entrenamiento del readout.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato numérico reportado es la pérdida final de entrenamiento (0,022368688136339188), que el propio autor advierte que no constituye una tasa de éxito de control. No se ha realizado evaluación en bucle cerrado para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión. El repositorio ocupa 9,9 GB e incluye el state dict completo (VLM congelado de 4B + readout de ~112M). En BF16, el VLM de 4B requiere aproximadamente 8 GB solo para pesos, más el readout y activaciones; se estima un mínimo en torno a 12-16 GB, aunque el autor no publica cifras.
- GPU recomendadas: no disponibles. El entrenamiento se realizó en 8 GPUs Hygon, lo que sugiere un entorno de数据中心 más que de consumo.
- ¿Cabe en GPU de consumo? No confirmado. Una RTX 4090 (24 GB) podría alojar los pesos en BF16, pero la compatibilidad con el loader `QwenPIRepresentationV4` y las rutas específicas de máquina no está garantizada sin adaptación.
- Opciones de despliegue: no se puede usar `Transformers AutoModel.from_pretrained`; requiere el código de entrenamiento `action_repre` y el loader `QwenPIRepresentationV4` con `readout_architecture=layerwise_dit`, la configuración, el procesador y la normalización liberados. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros (readout) | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| action-repre-newtask14-n32-lvta-layerwise384-l36-head10k (este) | 111,9 M | no disponible | sin evaluación en bucle cerrado | Apache 2.0 | Hugging Face, 0 descargas |
| action-repre-newtask33-lvta-v4-j14-h32-source30k | no disponible | no disponible | no disponible | no disponible | Hugging Face (usado como inicialización) |
| Experto de acción Qwen3 histórico (28 capas) | no disponible | no disponible | no disponible | no disponible | referenciado en la model card, sin enlace directo |

La comparativa con alternativas externas no está disponible: no se han identificado en la información proporcionada otros checkpoints de representación de acciones con arquitectura y datos comparables.

## Limitaciones y advertencias

- No se ha realizado evaluación en bucle cerrado: no existe evidencia de tasa de éxito en control real. La pérdida de entrenamiento (0,0224) no es un indicador de rendimiento en tarea.
- El checkpoint no es un modelo autónomo: requiere el VLM congelado, el código `action_repre`, el loader `QwenPIRepresentationV4`, la configuración, el procesador y la normalización. No funciona con `AutoModel.from_pretrained`.
- Las rutas específicas de máquina en los metadatos preservados deben mapearse explícitamente; no es un artefacto portable sin adaptación.
- El estado de clasificación de la fuente original permanece como `unregistered_historical`, lo que limita la trazabilidad completa del origen de los datos.
- Sesgos conocidos: no disponibles. Al entrenarse sobre 14 tareas retenidas y 33 tareas fuente de un dominio concreto (robotwin), la generalización fuera de esa distribución no está caracterizada.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero el readout puede generar trayectorias no válidas físicamente al no haber validación en bucle cerrado.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la ausencia de evaluación en bucle cerrado desaconseja su uso en producción sin validación previa.
- El repositorio no incluye episodios brutos, assets de simulador, estado del optimizador ni checkpoints intermedios, lo que impide reanudar el entrenamiento tal cual.

## Enlaces

- Hugging Face: https://huggingface.co/myendless/action-repre-newtask14-n32-lvta-layerwise384-l36-head10k-d4621225
- Checkpoint de inicialización del VLM: https://huggingface.co/myendless/action-repre-newtask33-lvta-v4-j14-h32-source30k-3d2c5a58 (revisión `180a85745d55ea6472f0fe3ddd69008a6f8620be`)
- SHA256 del checkpoint: `d46212257f1240f02ba069e141ac328ecf9a10d7cb83aabb2a600d03ab3d286c`
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada.
