# dashi/microduck-roller-remix-r920

## Resumen

`dashi/microduck-roller-remix-r920` no es un modelo de lenguaje, sino una política de control motor entrenada por refuerzo para el robot educativo [microduck](https://github.com/pollen-robotics/microduck) de Pollen Robotics. El autor, `dashi`, publica un fine-tune («remix») del modelo `jrubiosainz/microduck-game-roller-remix4` que implementa una marcha perpetua para la ranura `walk` del robot, pensada para su uso sobre ruedas (rollers) en lugar de patas libres. La política consume observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, y se distribuye como un único archivo `policy.onnx` con el normalizador de observaciones ya integrado en el grafo.

El interés de esta ficha es acotado pero real: sirve como ejemplo de artefacto de RL listo para desplegar en hardware de bajo coste mediante el comando `robotctl policy load walk dashi/microduck-roller-remix-r920`, y como referencia del formato de manifiesto (schema 2) que usa el daemon de microduck. No hay información pública sobre arquitectura de red, número de parámetros, volumen de datos de entrenamiento ni resultados de evaluación, y el repositorio apenas supera los 0 GB de tamaño, lo que sugiere un artefacto muy ligero.

Es relevante ahora por su encaje en el ecosistema de robótica open source de Pollen Robotics: políticas intercambiables por ranura (`walk`, y presumiblemente otras), evaluación sobre el robot físico y un pipeline de entrenamiento reproducible en `pollen-robotics/microduck_rl`. Quien busque un modelo generativo o un sistema conversacional no lo encontrará aquí; quien busque una política de locomoción ONNX ejecutable en tiempo real, sí.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para control motor (entrenada con RL); topología interna no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política de control; ventana de observación de 1 paso, 61 dimensiones) |
| Tipos de cuantización | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no aplica; el modelo no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas de microduck) |

Datos adicionales del artefacto: dimensión de observación 61, dimensión de acción 14, frecuencia de control 50 Hz, ranura de destino `walk`, tamaño del repositorio 0,0 GB, 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 2026-10-21 según los metadatos de HuggingFace.

## Arquitectura y entrenamiento

La model card no describe la topología de la red (MLP, CNN o transformer ligero): solo indica que se trata de una política de reinforcement learning con observaciones de 61 dimensiones y 14 acciones, entrenada en el repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `6ff40704a`. El resultado se exporta a ONNX e incorpora el normalizador de observaciones dentro del propio grafo, de modo que el consumidor debe alimentar observaciones en crudo, sin preprocesado adicional. El modelo es un fine-tune (relación `base_model_relation: finetune`) de `jrubiosainz/microduck-game-roller-remix4`, que a su vez parece derivar de un entrenamiento previo orientado a desplazamiento sobre rollers.

No se documentan el número de tokens o pasos de entorno, la composición del dataset de entrenamiento, ni si hubo fases de RLHF/DPO (conceptos, por otra parte, propios de modelos de lenguaje y no de políticas de control). Tampoco se especifican detalles de recompensa, dominio de aleatorización ni técnicas de sim-to-real. La única innovación explícita es la calificación de la política como «perpetua»: está diseñada para ejecutarse de forma continua hasta recibir una orden de parada, a diferencia de políticas episódicas con condición de terminación.

## Capacidades

- Locomoción continua sobre rollers: genera una marcha perpetua para el robot microduck hasta que se le indique lo contrario.
- Interfaz de control en tiempo real: 14 acciones a 50 Hz, adecuada para bucles de control de un robot físico.
- Normalización integrada: el ONNX incluye el normalizador, lo que simplifica la integración en el daemon.
- Despliegue por ranura: se carga en el slot `walk` mediante `robotctl`, lo que permite intercambiarla con otras políticas compatibles.
- Compatibilidad de manifiesto: `manifest.json` conforme al schema 2 de `docs/policy-manifest.md` del repositorio del daemon.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multilingües: no es un modelo de lenguaje.
- No se documentan capacidades de visión, audio ni modos de «pensamiento».

## Casos de uso

- Despliegue en robot físico microduck: cargar la política en la ranura `walk` con `robotctl policy load walk dashi/microduck-roller-remix-r920` para que el robot se desplace de forma continua sobre rollers durante demos o sesiones de laboratorio.
- Docencia y talleres de robótica: usar la política como ejemplo listo para ejecutar de un artefacto de RL exportado a ONNX, sin necesidad de entrenar desde cero.
- Pruebas de integración del daemon: verificar el flujo de carga de políticas, la validación del manifiesto schema 2 y el contrato de observación/acción (61/14) en un pipeline de CI del software de control.
- Base para fine-tuning: al ser un remix de un modelo previo, sirve como punto de partida para experimentos de ajuste fino con `pollen-robotics/microduck_rl` en la rama y commit indicados.
- Comparación de políticas por ranura: mantener esta política junto a otras variantes del mismo slot para evaluar diferencias de comportamiento en el mismo hardware y protocolo de observación.
- Recolección de datos de locomoción: ejecutar la marcha perpetua para grabar trayectorias y observaciones que alimenten un posterior entrenamiento por imitación.
- Sustitución de políticas sin cambios de código: al compartir el mismo contrato de observaciones y acciones, permite intercambiar políticas `walk` en caliente para pruebas A/B de comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, velocidad de desplazamiento, estabilidad, tasa de caídas ni comparaciones con otras políticas de microduck. No se dispone de cifras de latencia o throughput medidas sobre hardware real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (0,0 GB) y el formato ONNX, es previsible que la política quepa holgadamente en memoria de un dispositivo integrado, pero no hay cifras publicadas.
- GPU recomendadas: no disponible. No se documenta ningún requisito de GPU; una política de este tamaño es candidata a ejecución en CPU mediante ONNX Runtime.
- Ejecución en GPU de consumo: no confirmado; no se aportan datos sobre compatibilidad con RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: ONNX Runtime como vía natural, y el flujo específico del ecosistema microduck (`robotctl policy load <slot> <repo>`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Restricción temporal: el bucle de control a 50 Hz implica un presupuesto de 20 ms por paso (inferencia más lectura de sensores y actuación); no se publica la latencia real medida.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Relación | Observación / acción | Frecuencia | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `dashi/microduck-roller-remix-r920` | Fine-tune del siguiente | 61 / 14 | 50 Hz | ONNX + manifest schema 2 | no disponible | HuggingFace, 0 descargas |
| `jrubiosainz/microduck-game-roller-remix4` | Modelo base | no disponible en la información proporcionada | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos sobre otras políticas de microduck (por ejemplo, variantes para otros slots o para marcha sin rollers) que permitan una comparación cuantitativa de rendimiento, contexto o licencia. Cualquier comparación más allá de la relación de fine-tune indicada sería especulativa.

## Limitaciones y advertencias

- Licencia no disponible: no puede asumirse permiso de uso comercial, redistribución ni modificación; es imprescindible contactar con el autor o consultar el repositorio antes de un uso en producción.
- Ausencia total de métricas: no hay evidencia publicada de robustez, estabilidad ni tasa de éxito, por lo que no se puede recomendar para aplicaciones críticas.
- Herencia del modelo base: al ser un remix de `jrubiosainz/microduck-game-roller-remix4`, las condiciones de la licencia y las limitaciones del modelo original podrían aplicarse también a este artefacto.
- Comportamiento perpetuo: la política está diseñada para ejecutarse hasta recibir una orden contraria; es necesario un mecanismo de parada supervisado y límites de seguridad en el robot.
- Dominio restringido a rollers: no hay información sobre generalización a otras superficies, pendientes o terreno irregular.
- Acoplamiento estricto al contrato de observación: alimentar el modelo con observaciones preprocesadas (en lugar de crudas) romperá el comportamiento, ya que el normalizador está embebido en el grafo.
- Sin soporte de lenguaje, visión ni herramientas: no debe evaluarse con criterios de LLM (MMLU, HumanEval, GSM8K); la alucinación no aplica, pero sí el fallo por distribución fuera del dominio de entrenamiento.
- Idiomas no aplicables; cualquier expectativa multilingüe es un error de categoría.
- Metadatos de fecha: la ficha indica creación y actualización el 2026-10-21, dato que conviene verificar en el repositorio original.
- La búsqueda web realizada no devolvió resultados técnicos relevantes sobre este modelo; los enlaces externos deben verificarse manualmente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dashi/microduck-roller-remix-r920
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-roller-remix4
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl`, rama `main`, commit `6ff40704a` (ruta indicada en la model card; no se proporcionó URL completa)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck (ruta indicada en la model card; no se proporcionó URL completa)
- Resultados de búsqueda web: no se han encontrado enlaces técnicos relevantes; las entradas devueltas por el buscador no guardan relación con el modelo.
