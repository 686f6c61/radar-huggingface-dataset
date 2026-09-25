# PierreRouanet/microduck-roulade-1500

## Resumen

microduck-roulade-1500 es una politica de control (policy) para el robot bípedo Microduck, publicada por el usuario PierreRouanet en Hugging Face y distribuida como un unico artefacto ONNX (`policy.onnx`). El contrato es explícito y muy reducido: recibe una observación de 61 valores y emite 14 consignas de articulación (joint targets) a 50 Hz. No es un modelo de lenguaje ni un modelo multimodal: es una función de control entrenada, presumiblemente por refuerzo, para ejecutar una tarea motora concreta sobre el robot.

Microduck es un robot bípedo con forma de pato de 25 cm de altura, desarrollado por Pollen Robotics en colaboración con Hugging Face, con 15 motores, cámara, LiDAR o sensor de profundidad, dos sensores de movimiento y un pico articulado capaz de agarrar objetos. Su stack es abierto y está pensado para entrenar comportamientos en simulación y transferirlos al hardware real (sim2real). Esta ficha corresponde al ecosistema de politicas de la llamada Microduck Arena.

La relevancia de este checkpoint es acotada pero concreta: sirve como referencia reproducible de una politica de locomoción/control dentro del ecosistema Microduck, y como punto de partida para comparaciones, fine-tuning y experimentos de sim2real. Hay que subrayar que la model card es mínima, que no se documenta la licencia y que el repositorio no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se distribuye como grafo ONNX; no se documenta la topología de red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no aplica: consume una observación de 61 valores por paso de control, a 50 Hz |
| Tipos de cuantizacion | no disponible (un único `policy.onnx`; no se documenta la precisión de los pesos) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`), acompañado de `manifest.json` |
| Entrada | vector de observación de 61 valores |
| Salida | 14 consignas de articulación (joint targets) |
| Frecuencia de control | 50 Hz |
| Pipeline declarado | robotics |
| Libreria | onnx |
| Tamano del repositorio | 0,0 GB (redondeado según Hugging Face) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-25 |
| Ultima actualizacion | 2026-09-25 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna de la red más allá de su interfaz de entrada/salida: 61 valores de observación de entrada y 14 consignas articulares de salida, ejecutadas a 50 Hz. El sufijo `1500` del nombre coincide con el patrón de otra variante del mismo autor, `microduck-roulade-250`, lo que sugiere que se trata de un checkpoint numerado (posiblemente iteraciones o pasos de entrenamiento), pero esto es una inferencia a partir del nombre y no está documentado en la información disponible.

El contexto de entrenamiento sí está parcialmente descrito en el ecosistema: el repositorio `pollen-robotics/microduck_rl` proporciona entornos de aprendizaje por refuerzo para Microduck, con tareas identificadas como `Mjlab-Velocity-Flat-MicroDuck` y variantes `-Backlash`. La variante Backlash entrena sobre un modelo con holgura de engranajes de ±1° (2° totales) en serie con cada una de las 14 articulaciones de servo, modelando cada servo con una junta pasiva `passive_<joint>_backlash` para reducir la brecha sim2real. Se desconoce si este checkpoint concreto fue entrenado con o sin ese modelo de holgura, así como el número de tokens o muestras, la composición del dataset, el algoritmo de RL y si hubo etapas de refinamiento posteriores.

## Capacidades

- Generación de consignas de control: produce 14 objetivos articulares a partir de un vector de observación de 61 valores, a 50 Hz.
- Locomoción y seguimiento de consignas de velocidad: los identificadores de tarea del entorno asociado (`Velocity-Flat`) apuntan a tareas de desplazamiento en terreno plano.
- Control en tiempo real: la frecuencia de 50 Hz (periodo de 20 ms) es compatible con bucles de control de servo típicos.
- Ejecución portable vía ONNX: el grafo puede cargarse con runtimes ONNX, lo que facilita desplegarlo tanto en simulación como en el ordenador de a bordo del robot o en un equipo externo.
- No dispone de generación de lenguaje natural, razonamiento, código, matemáticas ni visión directa.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no aplica).
- No se documenta ningún modo especial (thinking, audio, etc.).
- Robustez frente a holgura de engranajes: disponible en el ecosistema mediante las tareas `-Backlash`, pero no consta que este checkpoint la incorpore.

## Casos de uso

- Baseline de locomoción para Microduck: cargar `policy.onnx` en el simulador y usarlo como política de referencia para medir el rendimiento de nuevas políticas entrenadas por RL sobre las mismas tareas `Velocity-Flat`.
- Punto de partida para fine-tuning: al ser un artefacto ONNX ligero y autocontenido, sirve como inicialización o como comparador en experimentos de ajuste con los entornos de `microduck_rl`.
- Evaluación sim2real: ejecutar la política en simulación y en el robot físico para cuantificar la brecha de transferencia, especialmente si se compara contra una política entrenada con el modelo de holgura `-Backlash`.
- Comparación de checkpoints dentro de la familia `roulade`: contrastar `roulade-1500` con `roulade-250` permite estudiar el efecto del número de pasos de entrenamiento sobre una misma tarea y contrato de entrada/salida.
- Pruebas de control en banco: usar la política para validar el lazo completo (observación de 61 valores a 50 Hz, publicación de 14 consignas, respuesta de los servos) antes de integrar cualquier comportamiento nuevo.
- Docencia y laboratorios de robótica: por su tamaño reducido y su formato ONNX, es adecuado para prácticas de despliegue de políticas de RL, inspección de contratos de observación/acción y estudio de pipelines sim2real.
- Integración en pipelines de despliegue ONNX: el grafo puede incorporarse a un servicio de inferencia local que reciba el vector de observación y devuelva las consignas, siempre que se respete el contrato documentado en `manifest.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de recompensa, tasas de éxito, velocidad de seguimiento ni comparaciones numéricas con otras políticas de Microduck. Tampoco se documentan latencias ni throughput medidos.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 0,0 GB según Hugging Face (valor redondeado), lo que indica un artefacto de pesos muy pequeño.
- GPU recomendadas: no disponibles; no se documenta ningún requisito de aceleración por GPU. Por el tamaño del artefacto y la frecuencia de control (50 Hz), la inferencia en CPU es plausible, aunque no está confirmada por el autor.
- Compatibilidad con GPU de consumo: no documentada. No hay indicios de que se necesite una GPU dedicada para ejecutar esta política.
- Opciones de despliegue: ONNX Runtime es la vía natural dado el formato. No se documenta soporte explícito para vLLM, llama.cpp, Ollama ni TGI, que además están orientados a modelos de lenguaje y no aplican aquí.
- Latencia y throughput: no disponibles. El único dato temporal es la frecuencia de control objetivo, 50 Hz, que implica un presupuesto de 20 ms por paso de control.

## Comparativa con modelos similares

| Modelo | Autor | Entrada / salida | Frecuencia | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-roulade-1500 | PierreRouanet | 61 valores / 14 consignas | 50 Hz | ONNX | no disponible | Hugging Face, 0 descargas |
| microduck-roulade-250 | PierreRouanet | 61 valores / 14 consignas | 50 Hz | ONNX | no disponible | Hugging Face |
| Otras políticas de Microduck Arena | varios | no disponible | no disponible | ONNX | no disponible | Hugging Face (sin datos concretos en la información disponible) |

Los dos checkpoints de la familia `roulade` comparten contrato de observación y acción y difieren únicamente en el sufijo numérico del nombre. No hay datos de rendimiento que permitan ordenarlos. No se dispone de información sobre parámetros, contexto o licencia de las alternativas, por lo que la comparación cuantitativa no es posible con los datos disponibles.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia, no puede asumirse permiso para uso comercial, redistribución o modificación. Es un riesgo legal directo para cualquier producto.
- Model card mínima: la única documentación es la frase de interfaz y la referencia a `manifest.json`, cuyo contenido no se incluye en la información disponible.
- Ausencia de validación externa: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso o verificación por terceros.
- Sin benchmarks: no hay métricas públicas de éxito de tarea, robustez, consumo energético ni estabilidad.
- Brecha sim2real: no se documenta si este checkpoint incorpora el modelado de holgura de engranajes (±1° por servo, 2° totales) que sí existe en los entornos `-Backlash`; una política entrenada sin ese modelado puede degradarse en hardware real.
- Correspondencia de actuadores no aclarada: el robot declara 15 motores mientras que la política emite 14 consignas; la asignación exacta (por ejemplo, respecto al pico articulado) no se documenta.
- Alcance limitado: no es un modelo de propósito general; no genera texto, no razona, no procesa lenguaje y no tiene capacidades multimodales.
- Sin información sobre seguridad física: no se documentan límites de par, paradas de emergencia ni comportamientos ante fallos, algo crítico en un robot bípedo físico.
- Riesgo de sobreajuste a la configuración de simulación: al desconocerse el dataset y el algoritmo de entrenamiento, no puede estimarse su generalización a otras superficies, cargas o variaciones de hardware.
- Idiomas: no aplica, pero conviene recordar que no hay interfaz de lenguaje natural asociada a esta política.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PierreRouanet/microduck-roulade-1500
- Variante relacionada: https://huggingface.co/PierreRouanet/microduck-roulade-250
- Repositorio del robot Microduck: https://github.com/pollen-robotics/microduck
- Entornos de entrenamiento por refuerzo: https://github.com/pollen-robotics/microduck_rl
- Página oficial de Microduck (Pollen Robotics): https://pollen-robotics.com/microduck/
- Artículo de CNX Software sobre Microduck: https://www.cnx-software.com/2026/08/28/microduck-a-duck-like-biped-robot-designed-for-physical-ai-experimentation-and-fun/
