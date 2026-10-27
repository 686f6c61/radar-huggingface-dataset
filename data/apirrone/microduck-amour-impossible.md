# apirrone/microduck-amour-impossible

## Resumen

`apirrone/microduck-amour-impossible` es una política de control entrenada por refuerzo (reinforcement learning) para el robot bípedo open source **microduck** de Pollen Robotics. No es un modelo de lenguaje: se trata de un artefacto de robótica exportado a ONNX que consume observaciones en bruto de 61 dimensiones y emite 14 acciones a 50 Hz, pensado para cargarse en una ranura de política del daemon del robot mediante el comando `robotctl policy load`.

El modelo es un *fine-tune* de `pollen-robotics/microduck-got-a-talent-reference` y se presenta como una política **perpetua**: una marcha que se ejecuta de forma continua hasta que se le indique lo contrario. La model card lo describe como «un melodrama en cinco tiempos» con dos patos y un coro, apoyándose en las emociones de `pollen-robotics/microduck-emotions`, lo que sugiere una pieza de comportamiento escénico más que una política de locomoción genérica.

Su relevancia es acotada pero concreta: ejemplifica el flujo de trabajo de la comunidad microduck para publicar variantes de políticas RL (manifiesto con esquema 2, normalizador embebido en el ONNX, entrenamiento reproducible desde `pollen-robotics/microduck_rl`). El repositorio no contiene pesos de gran tamaño (0.0 GB reportados) y no tiene descargas ni valoraciones, por lo que debe considerarse un artefacto experimental sin validación pública.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo exportada a ONNX (detalle de capas no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); observación de 61 dimensiones a 50 Hz |
| Tipos de cuantizacion | no disponible (export ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`, con normalizador de observaciones embebido) + `manifest.json` (esquema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La política se entrena en el repositorio `pollen-robotics/microduck_rl`, rama `show-melodrama`, commit `f1fc60046`, y se deriva por *fine-tune* de `pollen-robotics/microduck-got-a-talent-reference`. El contrato de interfaz está fijado por el propio robot: 61 dimensiones de observación como entrada y 14 dimensiones de acción como salida, a una frecuencia de control de 50 Hz. El normalizador de observaciones está integrado en `policy.onnx`, de modo que la política acepta observaciones sin preprocesar; el `manifest.json` sigue el esquema 2 documentado en `docs/policy-manifest.md` del repositorio del daemon.

No se detallan en la información disponible la topología de la red (número de capas, tamaño de las capas ocultas, función de activación), el número de pasos de entrenamiento, el simulador empleado, la composición del dataset ni si hubo técnicas adicionales como *domain randomization* o entrenamiento con recompensas multiobjetivo. Tampoco se especifica si el entrenamiento se realizó desde cero sobre el modelo de referencia o con congelación parcial de capas.

## Capacidades

- Generación de locomoción continua: política perpetua que mantiene una marcha hasta recibir una orden de parada.
- Control reactivo a partir de observaciones propioceptivas de 61 dimensiones, sin necesidad de normalización externa.
- Ejecución de una secuencia coreografiada descrita como «melodrama en cinco tiempos».
- Integración con el sistema de emociones de `pollen-robotics/microduck-emotions` para modular la expresividad del comportamiento.
- Carga en caliente en una ranura de política del daemon microduck mediante `robotctl`.
- Compatibilidad con el formato de manifiesto de políticas (esquema 2), lo que permite sustituirla por otras políticas del ecosistema.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio ni generación de texto.

## Casos de uso

- **Espectáculo robótico de divulgación**: la política está concebida como una pieza escénica en cinco tiempos; puede cargarse en dos unidades microduck para representar la escena descrita en ferias, museos o eventos de robótica open source, aprovechando su naturaleza perpetua para mantener la acción sin intervención.
- **Validación del daemon y del manifiesto**: sirve como política de prueba para verificar el flujo `robotctl policy load <slot>`, la correcta interpretación del `manifest.json` con esquema 2 y la gestión de ranuras de política en el daemon.
- **Prueba de robustez del pipeline de observaciones**: al llevar el normalizador embebido, permite comprobar que el robot entrega observaciones en bruto con el formato y la escala esperados (61 dimensiones, 50 Hz) sin capas de preprocesado adicionales.
- **Punto de partida para *fine-tuning* de marchas**: al derivar de `microduck-got-a-talent-reference`, puede reutilizarse como inicialización en `microduck_rl` para entrenar variantes de marcha o de expresividad, comparando curvas de recompensa frente al modelo base.
- **Investigación en sim2real**: útil en experimentos que midan la brecha entre simulación y realidad en un robot de bajo coste, comparando el comportamiento de esta política con el del modelo de referencia en el mismo hardware.
- **Docencia y talleres de RL aplicado**: un caso de estudio pequeño y ejecutable para explicar el ciclo completo de entrenamiento con RL, exportación a ONNX, empaquetado con manifiesto y despliegue en un robot real.
- **Pruebas de estabilidad en ejecución prolongada**: su carácter perpetuo la hace adecuada para ensayos de fatiga de actuadores, consumo energético y deriva del comportamiento en sesiones largas, siempre con supervisión y parada de emergencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, tasas de éxito, estabilidad de la marcha, velocidad de desplazamiento ni evaluaciones sim2real, y el repositorio no contiene informes de evaluación.

## Requisitos de hardware

- **Robot**: exclusivamente diseñado para el microduck de Pollen Robotics; no es reutilizable en otras plataformas sin reentrenamiento.
- **VRAM estimada para inferencia**: no disponible; el tamaño del repositorio se reporta como 0.0 GB y no se documenta el cómputo requerido.
- **GPU recomendadas**: no disponible; no se especifica si la inferencia se ejecuta en CPU embebida en el robot o en un equipo auxiliar.
- **Compatibilidad con GPU de consumo**: no disponible.
- **Opciones de despliegue**: daemon de microduck mediante `robotctl policy load <slot> apirrone/microduck-amour-impossible`; ejecución del grafo ONNX con un runtime compatible con ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- **Latencia y throughput**: no disponibles; el único dato temporal conocido es la frecuencia de control de 50 Hz (periodo de 20 ms por ciclo), que marca el presupuesto de cómputo máximo por inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `apirrone/microduck-amour-impossible` | Política RL para microduck (ONNX) | no disponible | no aplica (obs. 61-D a 50 Hz) | sin benchmarks publicados | no disponible | público en HuggingFace, 0 descargas |
| `pollen-robotics/microduck-got-a-talent-reference` | Política RL de referencia para microduck | no disponible | no aplica | sin datos en la información disponible | no disponible | público en HuggingFace |
| `pollen-robotics/microduck-emotions` | Modelo de emociones para microduck | no disponible | no aplica | sin datos en la información disponible | no disponible | público en HuggingFace |
| Políticas RL de locomoción para cuadrúpedos bípedos de otros fabricantes | Política RL | no disponible | no aplica | no disponible | no disponible | no disponible en la información proporcionada |

## Limitaciones y advertencias

- **Licencia no declarada**: al no especificarse licencia, no puede asumirse permiso de uso comercial, redistribución ni modificación; es necesario contactar con el autor antes de cualquier despliegue productivo.
- **Sin validación pública**: cero descargas y cero valoraciones; no hay evidencia externa de que la política funcione de forma fiable en hardware real.
- **Acoplamiento total al hardware**: la interfaz de 61 observaciones y 14 acciones está atada al microduck; no es transferible a otros robots sin reentrenamiento.
- **Ausencia de métricas**: no hay datos de estabilidad, velocidad, consumo ni tasa de caídas, por lo que el comportamiento en el mundo real es desconocido.
- **Brecha sim2real**: no se documentan técnicas de *domain randomization* ni validaciones en robot físico, lo que aumenta el riesgo de comportamiento errático.
- **Política perpetua**: la marcha se ejecuta hasta que se detiene explícitamente; en producción exige supervisión, parada de emergencia y límites de seguridad física.
- **Dependencia de otro modelo**: el componente emocional referencia `pollen-robotics/microduck-emotions`, cuyas condiciones de uso y disponibilidad no se detallan.
- **Documentación mínima**: no se describe la topología de red, el proceso de entrenamiento ni el preprocesado más allá del normalizador embebido, lo que dificulta la auditoría técnica.
- **Resultados de búsqueda web no pertinentes**: las consultas realizadas devolvieron únicamente páginas sin relación con el modelo, por lo que no se ha podido contrastar información externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/apirrone/microduck-amour-impossible
- Modelo base: https://huggingface.co/pollen-robotics/microduck-got-a-talent-reference
- Modelo de emociones referenciado: https://huggingface.co/pollen-robotics/microduck-emotions
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: https://github.com/pollen-robotics/microduck_rl (rama `show-melodrama`, commit `f1fc60046`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck
- Papers, blogs y demos adicionales: no disponibles en la información proporcionada
