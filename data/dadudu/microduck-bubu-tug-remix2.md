# dadudu/microduck-bubu-tug-remix2

## Resumen

`dadudu/microduck-bubu-tug-remix2` es una política de control motor entrenada por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. Se trata de un *fine-tune* (remix) del modelo `a1rb4Ck/microduck-tug`, orientado específicamente a la ranura de marcha `walk` del robot, con un estilo de locomoción inspirado en el "Tug of War Arena". El modelo no es un LLM ni un modelo generativo de texto: es una política neuronal exportada a ONNX que mapea observaciones del robot (61 dimensiones) a acciones de control (14 dimensiones) a 50 Hz.

La relevancia de esta ficha es limitada dentro del ecosistema de IA generativa: se trata de un artefacto de robótica de nicho, sin descargas ni interacciones en el momento de la consulta, y con documentación mínima. Aun así, resulta útil como ejemplo de distribución de políticas de RL en Hugging Face mediante el formato de manifiesto de microduck y el runtime `robotctl`.

No se dispone de información sobre arquitectura de red, número de parámetros, licencia ni idiomas. La model card solo documenta el uso operativo y parte del proceso de entrenamiento (repositorio y commit del pipeline de RL).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política neuronal exportada a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 de microduck) |

Otros datos operativos: observación de 61 dimensiones, 14 acciones de control, frecuencia de 50 Hz, política perpetua (se ejecuta hasta recibir orden de parada), ranura `microduck-slot:walk`.

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura de la red neuronal (número de capas, tipo de encoder, tamaño de las capas ocultas). Se sabe que es una política entrenada por refuerzo (tags `reinforcement-learning`) y exportada a ONNX, con la normalización de observaciones integrada en el propio fichero `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo. El modelo se distribuye con un `manifest.json` conforme al schema 2 del manifiesto de políticas de microduck, documentado en `docs/policy-manifest.md` del repositorio del daemon.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `a3e0c0fbe`. Es un *fine-tune* del modelo base `a1rb4Ck/microduck-tug` (referenciado en la model card con el commit `b725cd39` y una altura de ~166,23 cm en el entorno de entrenamiento). No se especifican número de pasos, composición del dataset de simulación, técnicas de RL concretas (PPO, SAC, etc.) ni si hubo *domain randomization*. Los créditos del modelo base se atribuyen a a1rb4Ck, jrubiosainz, rumezhak y Pollen Robotics.

## Capacidades

- Locomoción cuadrúpeda: genera una marcha perpetua para el robot microduck en la ranura `walk`.
- Control reactivo a partir de observaciones proprioceptivas (61 dimensiones) a 50 Hz.
- Producción de 14 acciones de control motor por paso de inferencia.
- Normalización de observaciones integrada: acepta observaciones en crudo sin preprocesado externo.
- Compatible con el runtime `robotctl` mediante el comando `policy load`.
- No soporta tool calling, generación de texto, visión, audio ni razonamiento multi-paso: no es un modelo de lenguaje.
- No se documentan capacidades multilingües ni modos especiales (thinking, etc.).

## Casos de uso

- Locomoción básica del microduck en laboratorio: cargar la política en la ranura `walk` con `robotctl policy load walk dadudu/microduck-bubu-tug-remix2` para que el robot camine de forma continua mientras se prueban otros subsistemas (visión, sensórica).
- Investigación en RL aplicado a robótica: servir como punto de partida o referencia para comparar políticas de marcha sobre el mismo robot y el mismo pipeline (`microduck_rl`).
- Remixes y *fine-tuning*: al ser un remix del modelo `a1rb4Ck/microduck-tug`, puede usarse como base para experimentos de ajuste fino en entornos o estilos de marcha alternativos.
- Demostraciones educativas: el microduck es una plataforma de bajo coste y código abierto; esta política permite exhibir locomoción aprendida sin entrenar desde cero.
- Pruebas de integración del daemon: útil para validar el flujo de manifiestos schema 2 y el comando `robotctl` en pipelines de CI del propio daemon.
- Benchmarking de robustez en simulación: ejecutar la política en el simulador de `microduck_rl` para medir estabilidad de la marcha ante perturbaciones antes de desplegar en hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser una política de control de tamaño presumiblemente pequeño exportada a ONNX, es plausible que quepa en CPU, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: runtime `robotctl` del daemon de microduck (comando `policy load`); inferencia ONNX Runtime como backend implícito del formato, aunque no se detalla en la model card.
- Latencia y throughput: no disponibles; el único dato es la frecuencia de control de 50 Hz que la política debe sostener.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada / salida | Slot | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dadudu/microduck-bubu-tug-remix2` | Política RL (ONNX) para microduck | 61 obs / 14 acciones a 50 Hz | `walk` | no disponible | Hugging Face (0 descargas) |
| `a1rb4Ck/microduck-tug` | Política RL base para microduck | no disponible en detalle | no disponible | no disponible | Hugging Face |
| Otras políticas de microduck | Políticas RL para el mismo robot | no disponible | variable | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas políticas ni de alternativas fuera del ecosistema microduck con métricas equivalentes.

## Limitaciones y advertencias

- Documentación mínima: no se especifican arquitectura, parámetros, licencia ni condiciones de entrenamiento más allá del repositorio y commit.
- Licencia no disponible: no puede asumirse uso comercial; conviene contactar con el autor antes de integrarlo en productos.
- Sin métricas publicadas: no hay benchmarks de robustez, estabilidad ni tasa de caídas en hardware real.
- Específico de un robot y un entorno: la política está entrenada para el microduck y una altura de referencia (~166,23 cm en el entorno); cambios de hardware, calibración o terreno pueden degradar la marcha.
- Política perpetua: se ejecuta hasta recibir orden de parada, lo que exige supervisión y mecanismos de seguridad en el daemon.
- Riesgo de sobreajuste al estilo "Tug of War Arena": el remix puede priorizar un comportamiento concreto en detrimento de la generalidad de la marcha.
- Cero descargas y cero interacciones: no hay evidencia comunitaria de funcionamiento en hardware real.
- No es un modelo de lenguaje: no aplican consideraciones de sesgo lingüístico, alucinación textual ni contexto, pero sí riesgos físicos propios de la robótica (caídas, colisiones).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dadudu/microduck-bubu-tug-remix2
- Modelo base: https://huggingface.co/a1rb4Ck/microduck-tug
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `main`, commit `a3e0c0fbe`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck
- Pollen Robotics: https://www.pollen-robotics.com/
