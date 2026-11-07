# OpenRAL/rskill-diffusion-pusht-pusht-fp32

## Resumen

`OpenRAL/rskill-diffusion-pusht-pusht-fp32` es un paquete de despliegue (rSkill) que envuelve el modelo Diffusion Policy entrenado sobre el benchmark de manipulación 2D PushT. No contiene pesos propios: es un manifiesto `rskill.yaml` que referencia los pesos originales de `lerobot/diffusion_pusht` mediante `weights_uri: hf://lerobot/diffusion_pusht`. El modelo subyacente es la Diffusion Policy de Chi et al. (2023), una política visomotora que genera acciones mediante difusión, con una U-Net 1D de aproximadamente 263 millones de parámetros y un desruidor DDPM de 100 pasos.

El modelo resuelve el problema de aprender políticas de manipulación robótica a partir de demostraciones, generando *chunks* de 8 acciones dentro de un horizonte de 16. PushT es un entorno simulado de cuerpo rígido 2D donde un efector final empuja un bloque en forma de T sobre un lienzo de 512 × 512 píxeles. El paquete está diseñado para el runtime `OpenRAL` y la librería `lerobot`, y su interés actual radica en que sirve como prueba extrema del contrato de *queue-drain* del `ChunkedExecutor`: el coste de inferencia por chunk está dominado por el bucle de desruido de 100 pasos, de modo que las extracciones en caché son prácticamente gratuitas.

La ficha describe un artefacto de inferencia en fp32, con licencia Apache-2.0 y uso comercial permitido, orientado a evaluación reproducible en simulación más que a despliegue en robots reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy: U-Net 1-D con desruidor DDPM de 100 pasos |
| Parametros totales | ~263 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; condicionado por observación de imagen 96 × 96 y horizonte de 16 pasos) |
| Tipos de cuantizacion | fp32 (único dtype empaquetado en este rSkill) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el paquete no copia pesos; referencia `hf://lerobot/diffusion_pusht`) |

## Arquitectura y entrenamiento

El modelo subyacente es una Diffusion Policy (Chi et al., 2023), que formula el aprendizaje de políticas visomotoras como un proceso de difusión sobre secuencias de acciones. La red es una U-Net 1-D de aproximadamente 263 millones de parámetros que actúa como desruidor DDPM con 100 pasos por chunk. La observación consiste en una única imagen RGB de 96 × 96 píxeles en `float32`, bajo la clave `observation.image` (convención anterior a `observation.images.cameraN`; el manifiesto reasigna el slot `camera1` a `image` mediante `image_preprocessing`). La salida es un chunk de 8 acciones dentro de un horizonte de 16.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en la información proporcionada. El entrenamiento se realizó sobre el benchmark PushT (`gym_pusht`, `pymunk` 2-D rigid-body). La innovación técnica destacable del empaquetado es el contrato de *queue-drain* del `ChunkedExecutor`: dado que el coste por chunk está dominado por el bucle de desruido, las extracciones en caché resultan prácticamente gratuitas, lo que convierte a este modelo en el caso de prueba extremo de dicho contrato.

## Capacidades

- Generación de acciones de manipulación robótica mediante difusión, en chunks de 8 acciones con horizonte de 16.
- Política visomotora condicionada por imagen RGB de 96 × 96 píxeles.
- Empuje de un bloque en forma de T sobre un lienzo 2D de 512 × 512 píxeles (entorno PushT).
- Integración con el runtime `OpenRAL` mediante manifiesto `rskill.yaml` (rol `s1`, embodiment `pusht`).
- Compatibilidad con la librería `lerobot` y el pipeline `robotics`.
- Evaluación reproducible en simulación mediante `BenchmarkScene` y el protocolo de 50 episodios (`eval/pusht.json`).
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo de razonamiento.

## Casos de uso

- Evaluación de referencia del benchmark PushT: ejecutar el protocolo completo de 50 episodios con `openral benchmark run --suite pusht --rskill diffusion-pusht` para obtener métricas comparables de éxito en la tarea de empuje 2D.
- Prueba de integración del `ChunkedExecutor`: validar el contrato de *queue-drain* en su caso extremo, donde el coste por chunk (≈1 756 ms en frío en RTX 4070 Laptop) está dominado por el desruido DDPM y las extracciones en caché son casi gratuitas.
- Demo de un episodio en CPU: ejecutar `just sim-diffusion-pusht` para una demostración de un solo episodio con `BenchmarkScene`, suficiente para verificar el pipeline completo sin GPU.
- Validación de manifiestos rSkill: servir como referencia para comprobar el esquema `openral_core.RSkillManifest`, incluyendo `image_preprocessing`, alias de cámaras y presupuesto de latencia.
- Pruebas de regresión en simulación: usar `tests/sim/test_pusht_2d_diffusion_pusht.py` con `gym_pusht` y `pymunk` para verificar que cambios en el runtime no rompen la política.
- Investigación en aprendizaje por imitación: punto de partida reproducible para comparar variantes de políticas de difusión sobre una tarea de cuerpo rígido 2D bien acotada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento proporcionados son de latencia: presupuesto de 1 250 ms por chunk (`latency_budget.per_chunk_ms`) y una medición en caliente de aproximadamente 1 756 ms por chunk completo en una RTX 4070 Laptop, dominada por el bucle DDPM de 100 pasos.

## Requisitos de hardware

- VRAM estimada: no disponible (`min_vram_gb: null` en el manifiesto); con ~263 M parámetros en fp32, el peso de los parámetros ronda 1 GB, pero no se documenta el pico de memoria de inferencia.
- GPU recomendadas: no disponible; la única referencia medida es una RTX 4070 Laptop.
- Cabe en GPU de consumo: sí, según la medición en RTX 4070 Laptop; también puede ejecutarse en CPU para la demo de un episodio.
- Opciones de despliegue: runtime `OpenRAL` sobre PyTorch (`runtime: pytorch`), con la librería `lerobot`; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de política).
- Latencia: presupuesto de 1 250 ms por chunk; medición en caliente de ≈1 756 ms por chunk completo en RTX 4070 Laptop. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `OpenRAL/rskill-diffusion-pusht-pusht-fp32` | ~263 M | Horizonte 16, chunk 8 | PushT 2D (sim) | Apache-2.0 | Hugging Face (manifiesto) |
| `lerobot/diffusion_pusht` | ~263 M | Horizonte 16, chunk 8 | PushT 2D (sim) | Apache-2.0 | Hugging Face (pesos) |
| Otras alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El paquete no contiene pesos: depende de `hf://lerobot/diffusion_pusht`; sin acceso a ese repositorio el rSkill no es funcional.
- Entrenado exclusivamente para el benchmark PushT en simulación 2D; no hay evidencia de transferencia a robots reales ni a otras tareas de manipulación.
- Entrada limitada a una única imagen RGB de 96 × 96 píxeles y a la clave `observation.image`, con reasignación de `camera1` mediante alias.
- Latencia por chunk elevada (≈1 756 ms en caliente en RTX 4070 Laptop) debido a los 100 pasos DDPM; puede ser limitante en control en tiempo real.
- Solo idioma inglés declarado; sin capacidades de lenguaje natural, tool calling ni razonamiento multi-paso.
- Sesgos conocidos y riesgo de alucinación: no disponible en la información proporcionada (no es un modelo generativo de texto).
- Licencia Apache-2.0 con `is_commercial_use_allowed: true`; el uso comercial está permitido, pero conviene verificar la licencia del repositorio de pesos upstream.
- El campo `inference: false` en la model card indica que el paquete no está pensado para inferencia directa desde el Hub sin el runtime `OpenRAL`.

## Enlaces

- [Hugging Face: OpenRAL/rskill-diffusion-pusht-pusht-fp32](https://huggingface.co/OpenRAL/rskill-diffusion-pusht-pusht-fp32)
- [Hugging Face: OpenRAL/rskill-diffusion-pusht](https://huggingface.co/OpenRAL/rskill-diffusion-pusht)
- [Hugging Face: lerobot/diffusion_pusht](https://huggingface.co/lerobot/diffusion_pusht)
- [Paper: Diffusion Policy: Visuomotor Policy Learning via Action Diffusion (arXiv:2303.04137)](https://arxiv.org/abs/2303.04137)
- [GitHub: OpenRAL/openral](https://github.com/OpenRAL/openral)
- [GitHub: rskills/diffusion-pusht/README.md](https://github.com/OpenRAL/openral/blob/master/rskills/diffusion-pusht/README.md)
