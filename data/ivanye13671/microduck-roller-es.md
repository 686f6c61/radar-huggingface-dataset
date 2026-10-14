# Ivanye13671/microduck-roller-es

## Resumen

Microduck-roller-es es una politica de control para robotica entrenada por refuerzo, publicada por el usuario Ivanye13671 en HuggingFace bajo el identificador `Ivanye13671/microduck-roller-es`. No es un modelo de lenguaje ni un transformer generativo: se trata de un controlador neuronal que genera acciones motoras para el robot microduck de Pollen Robotics cuando este se monta sobre rodillos (rollers). El objetivo declarado es un sprint de 2 metros, y la politica es de tipo "perpetuo", es decir, se ejecuta de forma continua en un bucle de control a 50 Hz hasta que se le indique lo contrario.

Tecnicamente, la model card lo describe como un baseline PPO (Proximal Policy Optimization) afinado posteriormente con estrategias evolutivas (evolution strategies). La politica consume una observacion de 61 dimensiones y produce 14 acciones, trabajando a 50 Hz. El normalizador de observaciones esta integrado dentro del propio fichero `policy.onnx`, de modo que el consumidor solo tiene que alimentar observaciones en crudo. El modelo se distribuye como artefacto ONNX acompanado de un `manifest.json` que sigue el esquema 2 del manifiesto de politicas de microduck.

Su relevancia es limitada y muy especifica: es una contribucion de nicho dentro del ecosistema microduck, con cero descargas y cero "likes" en el momento de la consulta, sin licencia declarada y sin documentacion adicional sobre el dataset de entrenamiento, los hiperparametros o los resultados obtenidos. Debe considerarse un artefacto experimental de investigacion mas que un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica neuronal de control entrenada con PPO y afinada con estrategias evolutivas (no se especifica el tipo de red: MLP, CNN u otra) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; observacion de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (control motor, no procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) mas `manifest.json` con esquema 2 del manifiesto de politicas microduck |

Especificaciones adicionales declaradas por el autor:

| Parametro | Valor |
|---|---|
| Dimension de observacion | 61-D |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Comportamiento | Politica perpetua (bucle continuo) |
| Hardware objetivo | Robot microduck (Pollen Robotics) sobre rodillos |
| Tarea | Sprint sobre rodillos de 2 metros |

## Arquitectura y entrenamiento

La informacion disponible no detalla la topologia exacta de la red neuronal. La model card indica que se parte de un baseline entrenado con PPO y que este se afina mediante estrategias evolutivas (evolution strategies), una combinacion habitual en robotica para pulir politicas obtenidas por gradiente de politica. No se especifica el numero de parametros, el numero de capas, el tipo de capas ni si se emplean recurrentcias o memoria interna. Tampoco se indica la dimension de las capas ocultas ni la funcion de activacion.

En cuanto a los datos de entrenamiento, no se publica el numero de pasos de simulacion, la composicion del entorno ni los hiperparametros. Lo unico documentado es la procedencia del entrenamiento: repositorio `pollen-robotics/microduck_rl`, rama `speed-experiments`, commit `13b13b3dd`. El normalizador de observaciones esta embebido en el propio ONNX, lo que implica que las medias y desviaciones aprendidas durante el entrenamiento forman parte del grafo y que el consumidor no debe normalizar por su cuenta.

No se documentan innovaciones adicionales como decodificacion especulativa, atencion lineal u otros mecanismos, dado que no se trata de un modelo generativo. La unica particularidad reseñable es el caracter "perpetuo" de la politica: no tiene una condicion de terminacion interna y se mantiene emitiendo acciones indefinidamente.

## Capacidades

- Generacion de acciones motoras continuas: produce 14 valores de accion a partir de una observacion de 61 dimensiones.
- Control en tiempo real: disenado para ejecutarse en un bucle de 50 Hz, es decir, 20 ms por ciclo.
- Marcha perpetua sobre rodillos: mantiene una politica de sprint sin condicion de parada explicita.
- Normalizacion integrada: el propio ONNX incluye el normalizador de observaciones, simplificando la integracion.
- Despliegue como politica cargable: se integra en un "policy slot" del daemon de microduck mediante `robotctl policy load`.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades multilingues, vision, audio ni modo de pensamiento: son capacidades no aplicables a este tipo de artefacto.

## Casos de uso

- Investigacion en aprendizaje por refuerzo para locomocion: servir como baseline PPO reutilizable para comparar contra otras politicas en la misma tarea de sprint sobre rodillos.
- Pruebas de escalado de velocidad en el banco de rodillos: dado que la politica es perpetua, permite mantener el robot corriendo de forma continua para medir estabilidad y consumo energetico a lo largo del tiempo.
- Punto de partida para afinado con estrategias evolutivas: el flujo documentado (PPO baseline mas ES) puede replicarse como receta para refinamiento de politicas locomotoras.
- Validacion de pipelines de despliegue microduck: sirve para verificar la carga de politicas via `robotctl policy load`, el manejo del `manifest.json` esquema 2 y la integracion del normalizador embebido.
- Benchmark interno de control a 50 Hz: al ser una politica pequena en formato ONNX, es util para medir latencia de inferencia en el controlador del robot o en un equipo de desarrollo.
- Docencia y prototipado en robotica con refuerzo: ejemplo completo de artefacto PPO mas ES con observaciones y acciones concretas para usar en cursos o talleres.
- Pruebas de robustez de politicas perpetuas: al no tener condicion de terminacion, es adecuada para estudiar deriva, saturacion de acciones y fallos acumulativos en ejecuciones largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye curvas de recompensa, velocidad alcanzada, tiempo de sprint, ni comparaciones numericas con otras politicas. El unico dato funcional es la descripcion cualitativa de "sprint sobre rodillos de 2 metros".

## Requisitos de hardware

- VRAM estimada: no disponible. El tamano del repositorio se reporta como 0.0 GB y no se publican recuentos de parametros, por lo que no puede estimarse con rigor. Una politica tipica de este tipo suele ser pequena, pero es una suposicion no confirmada.
- GPU recomendadas: no disponible. Al ser un artefacto ONNX de control a 50 Hz, es plausible que funcione en CPU, pero no esta documentado.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ONNX Runtime (formato nativo del artefacto) y el daemon de microduck a traves de `robotctl policy load <slot>`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: el bucle de control objetivo es de 50 Hz (20 ms por ciclo), pero no se publican mediciones reales de latencia de inferencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Observacion / accion | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ivanye13671/microduck-roller-es | Politica PPO + ES, ONNX | 61-D / 14 | 50 Hz | no disponible | HuggingFace, 0 descargas |
| Baselines de `pollen-robotics/microduck_rl` | Politicas RL de referencia | no disponible | no disponible | no disponible | Repositorio GitHub |
| Otras politicas microduck en HuggingFace | Politicas RL | no disponible | no disponible | no disponible | No identificadas en la informacion proporcionada |

No se dispone de datos numericos que permitan una comparacion cuantitativa de rendimiento entre estas alternativas. La comparativa queda limitada a la procedencia y al formato de distribucion.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se documenta analisis de sesgo, y en robotica el equivalente serian sesgos de simulacion (sim-to-real gap), que no se mencionan.
- Riesgo de alucinacion: no aplica a un controlador motor; sin embargo, existe riesgo de comportamiento inesperado fuera de la distribucion de observaciones de entrenamiento.
- Limitaciones de contexto o idioma: no aplica el concepto de contexto o idioma; la politica esta atada a un robot y a un montaje concretos (microduck sobre rodillos).
- Generalizacion: la politica es especifica para rodillos y para el sprint de 2 metros descrito. No hay evidencia de que funcione en suelo, con cargas distintas o en otro hardware.
- Caracter perpetuo: al no tener condicion de terminacion, requiere supervision externa para detenerse; un fallo de control podria mantenerse indefinidamente.
- Restricciones de licencia: la licencia no esta declarada. En ausencia de licencia explicita, no puede asumirse permiso para uso comercial; conviene contactar con el autor antes de cualquier uso en produccion.
- Madurez: cero descargas y cero "likes" en el momento de la consulta, sin documentacion de resultados. Debe tratarse como artefacto experimental.
- Trazabilidad: solo se referencia un commit (`13b13b3dd`) en una rama concreta (`speed-experiments`) del repositorio de entrenamiento; no se garantiza reproducibilidad completa.
- Integracion: depende del esquema 2 del manifiesto de politicas microduck; cambios de version en el daemon podrian romper la compatibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ivanye13671/microduck-roller-es
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: https://github.com/pollen-robotics/microduck_rl (rama `speed-experiments`, commit `13b13b3dd`)
- Documentacion del manifiesto de politicas: `docs/policy-manifest.md` en el repositorio del daemon de microduck
- Papers, blogs o demos adicionales: no disponibles en la informacion proporcionada
