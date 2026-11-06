# djduecaster/dfreq-sock-hierarchical-speed-20261102

## Resumen

dfreq-sock-hierarchical-speed-20261102 es una política de control para robótica (locomoción de un cuadrúpedo virtual) publicada por el usuario djduecaster en Hugging Face. Se enmarca en el entorno de investigación `sock-heist-6m` y se distribuye como un artefacto ONNX de tipo "neural commander" que envuelve una base de marcha preexistente, ajustando intenciones motoras como peticiones de avance, giro, pitch virtual, amplitud de patas y una postura de agachado ("red-light crouch"). El modelo consume observaciones float32 de forma `[1,61]` y emite acciones articulares `[1,14]` a 50 Hz.

El modelo no es un LLM ni un modelo de lenguaje: es una política de reinforcement learning (PPO con actualizaciones en MPS) entrenada sobre la física nativa de CPU Arena y servos BAM. Su relevancia es acotada y experimental: el autor reporta mejoras de velocidad frente a políticas anteriores (0,648 s de media más rápido en 256 arranques, y 0,760 s de mejora en tiempo penalizado por fallo frente a la política del 1 de noviembre), pero solo con evidencia de simulación y sin validación en hardware.

La información disponible es muy limitada: el repositorio pesa 0,0 GB, no tiene descargas ni likes, no declara idiomas y no publica benchmarks estándar. Cualquier dato no presente en la model card se marca como no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política neuronal de control (neural commander) sobre base de marcha; red con crítico de valor solo en entrenamiento; formato ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 valores float32 |
| Tipos de cuantización | no disponible (se distribuye como ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (librería `microduck`) |

## Arquitectura y entrenamiento

La política es un "neural commander" jerárquico: una red de control que modula las intenciones motoras de una base de marcha atribuida (el "walking backbone") en lugar de generar directamente todas las acciones desde cero. Las entradas son observaciones crudas float32 de dimensión 61 y las salidas son 14 acciones articulares a 50 Hz. El entrenamiento emplea PPO con actualizaciones en MPS sobre la física nativa de CPU Arena y servos BAM, sin cambios en el simulador. Durante el entrenamiento, el crítico de valor recibe estado de simulación adicional que no forma parte del modelo desplegado; en inferencia solo se leen las 61 observaciones estándar.

El autor indica explícitamente que no se usan semillas, temporizadores, tablas horarias ni búsquedas de posición, y que la nueva política se entrena con rollouts locales sin emplear modelos competidores ni acciones oficiales grabadas como datos de entrenamiento. La validación reportada incluye dos conjuntos independientes de 128 arranques frescos (256/256 finalizaciones, 0,648 s más rápido de media con intervalo bootstrap al 95 % en `manifest.json`), una comparación directa contra la política del 1 de noviembre (128/128 frente a 127/128, mejora de 0,760 s en tiempo penalizado por fallo) y pruebas con perturbaciones de reset duplicadas y cuadruplicadas (64/64 en ambas).

## Capacidades

- Control de locomoción de un cuadrúpedo virtual en el entorno `sock-heist-6m`: genera 14 acciones articulares a 50 Hz a partir de 61 observaciones float32.
- Modulación jerárquica de intenciones motoras: peticiones de avance y giro, pitch virtual, amplitud de patas y postura de agachado.
- Comando de velocidad recomendado: 1.15.
- Inferencia determinista sin dependencia de semilla, temporizador, tabla horaria ni lookup de posición.
- Exportación a ONNX para despliegue mediante la librería `microduck`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, multilingüismo, visión ni audio: no es un modelo de lenguaje.

## Casos de uso

- Investigación en locomoción jerárquica: usar la política como "commander" sobre una base de marcha existente para estudiar cómo se modulan intenciones motoras de alto nivel sin reentrenar el backbone completo.
- Evaluación comparativa de políticas en simulación: servir de referencia en experimentos controlados dentro de `sock-heist-6m`, dado que el autor documenta protocolos de 128 arranques y comparaciones directas contra políticas previas.
- Pruebas de robustez ante perturbaciones de reset: el modelo reporta resultados en configuraciones duplicadas y cuadruplicadas (64/64), lo que lo hace adecuado para estudiar estabilidad ante condiciones iniciales alteradas.
- Despliegue en pipelines de inferencia ONNX: integrarlo mediante `microduck` en entornos de simulación que requieran un artefacto ONNX ligero con entradas y salidas de forma fija (`[1,61]` → `[1,14]`).
- Reproducción de experimentos de RL con PPO en MPS: el autor describe el esquema de entrenamiento (física CPU Arena, servos BAM, crítico con estado adicional), útil como base para replicar o extender el método.
- Estudio de transferencia sim-a-real (con cautela): como candidato preliminar para experimentos de transferencia, teniendo en cuenta que el propio autor advierte que no hay validación en hardware.

## Benchmarks y rendimiento

Los únicos datos disponibles son los reportados por el autor en la model card, en el entorno `sock-heist-6m` y no en benchmarks estándar:

| Prueba | Resultado |
|---|---|
| Dos conjuntos de 128 arranques frescos (256 total) | 256/256 finalizaciones; 0,648 s más rápido de media frente a la política anterior (IC bootstrap 95 % en `manifest.json`) |
| Comparación directa contra política del 1 de noviembre | 128/128 frente a 127/128; mejora de 0,760 s en tiempo penalizado por fallo |
| Perturbaciones de reset duplicadas | 64/64 finalizaciones |
| Perturbaciones de reset cuadruplicadas | 64/64 finalizaciones |
| Comando 1.15, cinco arranques locales nativos | 21,683 s; 5/5 finalizaciones |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor indica que el modelo no ha sido evaluado por la Arena pública y que las diferencias numéricas Mac-versus-Arena alteraron puntuaciones absolutas, por lo que no reclama un récord personal verificado ni posición de podio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,0 GB y no se documenta el tamaño del archivo ONNX ni el número de parámetros.
- GPU recomendadas: no disponible. El entrenamiento se realizó con actualizaciones PPO en MPS (Apple Silicon), lo que sugiere que el autor trabajó en hardware Apple, pero no se especifica el equipo.
- Compatibilidad con GPU de consumo: no disponible; al ser un artefacto ONNX de forma fija y presumiblemente pequeño, es plausible que quepa en GPU de consumo, pero no hay datos que lo confirmen.
- Opciones de despliegue: ONNX mediante la librería `microduck`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: la política opera a 50 Hz (periodo de 20 ms por paso), pero no se publican latencias medidas ni throughput en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / observación | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dfreq-sock-hierarchical-speed-20261102 | no disponible | 61 observaciones float32 → 14 acciones a 50 Hz | 256/256 finalizaciones; 0,648 s más rápido que la política previa | Apache 2.0 | Hugging Face (0 descargas, 0 likes) |
| Política publicada el 1 de noviembre (mismo autor, `sock-heist-6m`) | no disponible | no disponible | 127/128 finalizaciones en comparación directa | no disponible | no disponible |
| Política previa "learned commander" (mismo autor) | no disponible | no disponible | 256/256 finalizaciones; 0,648 s más lenta de media | no disponible | no disponible |

No se dispone de información sobre modelos comparables de otros autores en la misma categoría (políticas de locomoción para `sock-heist-6m`). El resto de alternativas no está disponible.

## Limitaciones y advertencias

- Evidencia exclusivamente de simulación: el autor declara explícitamente que no hay validación en hardware.
- No evaluado por la Arena pública: los resultados no constituyen un récord personal verificado ni una posición de podio.
- Diferencias numéricas Mac-versus-Arena: el autor advierte que estas diferencias alteraron puntuaciones absolutas, por lo que los números reportados no son directamente comparables con evaluaciones públicas.
- Cualificación limitada al comando 1.15: el rendimiento fuera de ese comando no está documentado.
- Sin datos de sesgos, alucinación o comportamiento fuera de distribución más allá de las pruebas de perturbación de reset reportadas.
- Licencia Apache 2.0 permite uso comercial, pero se retienen la licencia y atribución heredadas del modelo de marcha en `LICENSE` y `NOTICE`; es necesario revisarlas antes de un uso derivado.
- Repositorio sin tracción (0 descargas, 0 likes) y sin documentación de parámetros, tamaño del ONNX ni latencias: la madurez para producción no está demostrada.
- No es un modelo de lenguaje: no admite instrucciones en lenguaje natural, tool calling ni razonamiento; su uso está restringido al pipeline de robótica para el que fue entrenado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/djduecaster/dfreq-sock-hierarchical-speed-20261102
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
