# eli-aifund/microduck-aifund-dash-hill

## Resumen

aifund-dash-hill es una política de control para el robot microduck desarrollada por eli-aifund dentro del programa AI Fund de Pollen Robotics. No es un modelo de lenguaje ni un modelo generativo: es una política de aprendizaje por refuerzo que produce comandos de actuación a 50 Hz a partir de una observación de 61 dimensiones, con 14 acciones de salida. Se distribuye como un artefacto ONNX (`policy.onnx`) acompañado de un `manifest.json` que sigue el esquema 2 del manifiesto de políticas de microduck.

El modelo se entrenó en dos fases segun la propia model card: primero PPO sobre la carrera propia de la Arena (con terminal de finalizacion en modo `dash`, regla de caida al vacio, muros de carril y fisica nominal) y despues un ajuste fino con estrategias de evolucion (ES) sobre la colina de la Arena. La política resultante es "perpetua": ejecuta una marcha continua hasta que se le indique lo contrario, y se carga en una ranura de politica del robot mediante `robotctl`.

Su relevancia es acotada pero clara: forma parte del ecosistema de politicas reutilizables de microduck, con un pipeline reproducible (`pollen-robotics/microduck_rl`, rama `aifund`, commit `ee780d49c`) y una interfaz de despliegue estandarizada. El repositorio es practicamente vacio en cuanto a tamano (0.0 GB reportados) y no tiene descargas ni likes, por lo que se trata de un artefacto reciente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Politica de control entrenada con RL (PPO + ajuste fino con ES); se distribuye como grafo ONNX, sin detalle de capas en la model card |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica. Es una politica reactiva con observacion de 61 dimensiones por paso, no un modelo con ventana de contexto |
| Tipos de cuantizacion | No disponible. Se distribuye un unico `policy.onnx` con el normalizador de observaciones embebido |
| Idiomas soportados | No aplica (no procesa lenguaje natural) |
| Licencia | No disponible |
| Formato de pesos | ONNX (`policy.onnx`) mas `manifest.json` (esquema 2 del manifiesto de politicas de microduck) |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Tipo de politica | Perpetua (se ejecuta hasta recibir orden de parada) |
| Libreria | microduck |
| Pipeline declarado | robotics |

## Arquitectura y entrenamiento

La model card no describe la topologia de la red. Lo que si se documenta es el procedimiento de entrenamiento, que consta de dos etapas. La primera es PPO (Proximal Policy Optimization) sobre el entorno de carrera propio de la Arena, configurado con finalizacion en modo `dash`, regla de caida por salida de la arena, muros de carril y fisica nominal. La segunda es un ajuste fino mediante estrategias de evolucion (ES) sobre el escenario de colina de la Arena. El resultado es una politica de marcha continua en lugar de una politica episodica orientada a una meta concreta.

Un detalle de implementacion relevante para el despliegue es que el normalizador de observaciones esta embebido en `policy.onnx`. Esto significa que el consumidor del modelo debe alimentar observaciones en crudo, sin aplicar su propia normalizacion, bajo riesgo de degradar el comportamiento. El manifiesto `manifest.json` sigue el esquema 2 descrito en `docs/policy-manifest.md` del repositorio del daemon, lo que permite cargar la politica en una ranura mediante la orden `sudo robotctl policy load <slot> eli-aifund/microduck-aifund-dash-hill`.

El repositorio de entrenamiento declarado es `pollen-robotics/microduck_rl`, rama `aifund`, commit `ee780d49c`. No se especifican en la informacion disponible el numero de pasos de entrenamiento, el tamano del dataset de rollouts, ni la composicion de la recompensa.

## Capacidades

- Generacion de una marcha perpetua para el robot microduck: la politica emite 14 acciones a 50 Hz de forma continua hasta que se le ordena parar.
- Control reactivo a partir de una observacion de 61 dimensiones, con normalizacion integrada en el propio grafo ONNX.
- Locomocion entrenada especificamente para el escenario de carrera de la Arena, con reglas de finalizacion `dash`, muros de carril y regla de caida.
- Locomocion en terreno inclinado (colina de la Arena) gracias al ajuste fino con estrategias de evolucion.
- Carga y descarga en caliente como ranura de politica del daemon de microduck mediante `robotctl`.
- Portabilidad de inferencia mediante ONNX, lo que permite ejecutar la politica con runtimes compatibles fuera del stack original.
- No se documentan capacidades de tool calling, agentes, razonamiento multietapa, vision, audio ni procesamiento de lenguaje. Son capacidades no aplicables a este tipo de artefacto.

## Casos de uso

- Investigacion en aprendizaje por refuerzo para locomocion: sirve como politica de referencia entrenada con PPO y refinada con ES, util para comparar variantes de recompensa o de curriculum sobre el mismo entorno de la Arena.
- Estudio de sim-to-real en robotica de bajo coste: al ejecutarse sobre microduck con fisica nominal y reglas de Arena explicitas, permite medir la brecha entre el entorno de entrenamiento y el robot fisico.
- Demostraciones de marcha continua en ferias y laboratorios: la politica es perpetua, por lo que no necesita un episodio con condicion de terminacion para mantenerse en pie y desplazarse.
- Banco de pruebas de despliegue de politicas: al seguir el esquema 2 de manifiesto y cargarse en una ranura, es un candidato directo para validar el flujo `robotctl policy load` en un daemon microduck.
- Comparacion de tecnicas de ajuste fino: el par PPO mas ES documentado permite evaluar cuanto aporta la optimizacion evolutiva sobre una politica ya entrenada por gradiente.
- Experimentos de recuperacion de terreno irregular: el ajuste especifico sobre la colina lo hace adecuado para probar comportamiento en pendientes dentro del mismo escenario.
- Base para destilacion o imitacion: una politica ONNX de accion continua puede usarse como profesor para generar trayectorias y entrenar politicas mas pequenas o mas rapidas.
- Evaluacion de pipelines ONNX en computo embebido: el artefacto permite medir latencia y determinismo de inferencia en el hardware del robot sin depender de PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de recompensa final, tasa de exito en la carrera, tiempo de finalizacion, distancia recorrida ni curvas de entrenamiento. El repositorio no registra descargas ni valoraciones, por lo que tampoco existen evaluaciones de terceros publicadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano del repositorio se reporta como 0.0 GB, lo que sugiere un artefacto muy pequeno, pero no hay cifra de parametros ni de tamano del grafo ONNX en la informacion proporcionada.
- GPU recomendadas: no disponibles. Para una politica de 61 entradas y 14 salidas a 50 Hz, la inferencia en CPU es el escenario habitual en robotica embebida, pero la model card no especifica hardware objetivo.
- Cabe en GPU de consumo: previsiblemente si, dado el perfil del artefacto y la frecuencia de control, aunque no hay confirmacion en la informacion disponible.
- Opciones de despliegue: el flujo documentado es `sudo robotctl policy load <slot> eli-aifund/microduck-aifund-dash-hill` sobre el daemon de microduck. Al ser un modelo ONNX, tambien puede ejecutarse con cualquier runtime compatible con ONNX, aunque el proyecto no documenta esos caminos.
- Latencia y throughput: no disponibles. El unico dato de temporizacion publicado es la frecuencia de control de 50 Hz, que implica un presupuesto de 20 ms por paso de control (incluyendo observacion, inferencia y actuacion).
- Opciones tipo vLLM, llama.cpp, Ollama o TGI: no aplican, al no tratarse de un modelo de lenguaje.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros modelos comparables con parametros, contexto, rendimiento o licencia que permitan una comparacion cuantitativa. El unico punto de referencia declarado es el propio ecosistema de politicas de microduck dentro del programa AI Fund, pero no se detallan sus caracteristicas.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se documenta analisis de sesgo, y en una politica de control el concepto aplica de forma distinta (por ejemplo, sesgo hacia la fisica nominal del simulador).
- Riesgo de sobreajuste al entorno: el entrenamiento y el ajuste fino se realizaron sobre escenarios concretos de la Arena (carrera con reglas `dash`, muros de carril y colina). El comportamiento fuera de esas condiciones no esta documentado.
- Riesgo de fallo por distribucion fuera de rango: la politica es reactiva y sin memoria explicita documentada. Ante observaciones fuera de la distribucion de entrenamiento, la respuesta no esta garantizada.
- Normalizador embebido: alimentar observaciones ya normalizadas por cuenta propia puede degradar o invalidar el comportamiento, ya que la model card indica explicitamente que se deben pasar observaciones en crudo.
- Politica perpetua: no tiene condicion de parada propia. Requiere que el operador detenga la ejecucion, lo que implica un riesgo operativo si no se supervisa.
- Licencia: no disponible. Sin una licencia explicita, no hay autorizacion clara para uso comercial ni para redistribucion, lo que es un bloqueo potencial en produccion.
- Idiomas y capacidades de lenguaje: no aplica, pero conviene senalar que este artefacto no puede sustituir a un modelo de lenguaje en ninguna tarea de texto.
- Madurez: cero descargas y cero likes, con creacion y ultima actualizacion el mismo dia (2026-10-14). No hay evidencia de validacion por terceros.
- Rendimiento cuantitativo: no se publican metricas de exito, lo que impide estimar la fiabilidad esperada antes de desplegarlo.
- Restricciones de hardware: no se documenta el hardware objetivo ni el consumo, lo que dificulta planificar despliegues en plataformas distintas del daemon previsto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eli-aifund/microduck-aifund-dash-hill
- Repositorio del robot y la libreria microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento declarado: `pollen-robotics/microduck_rl` (rama `aifund`, commit `ee780d49c`)
- Documentacion del manifiesto de politicas: `docs/policy-manifest.md` en el repositorio del daemon de microduck
- No se han encontrado papers, blogs, demos ni otros enlaces relevantes en la busqueda web realizada. Los resultados devueltos por la busqueda corresponden a contenidos no relacionados con el modelo (significado del nombre propio Eli y otros articulos homonimos) y se descartan por no ser pertinentes.
