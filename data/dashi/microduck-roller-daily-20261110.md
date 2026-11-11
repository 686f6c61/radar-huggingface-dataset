# dashi/microduck-roller-daily-20261110

## Resumen

`dashi/microduck-roller-daily-20261110` es una política de control por refuerzo (reinforcement learning) destinada al robot cuadrúpedo de bajo coste microduck, desarrollado en el ecosistema de Pollen Robotics. No se trata de un modelo de lenguaje ni de un transformer generativo: es una política neuronal que consume observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, pensada para ejecutarse sobre ruedas (rollers) en lugar de patas. El modelo se publica como un artefacto ONNX con el normalizador de observaciones integrado, lo que permite alimentarlo directamente con observaciones en bruto desde el demonio de control del robot.

El modelo es un finetune de `DenRakEiw/microduck-senate_duck_0904` y se describe como una "reentrada diaria" del policy `dashi/microduck-roller-remix-r900`, con una puntuación de 0.900. Está etiquetado para el slot `walk` del manifiesto de políticas microduck, y se define como una política "perpetua": una marcha que se ejecuta de forma continua hasta que se le indique lo contrario. El repositorio es de tamaño prácticamente nulo (0.0 GB), lo que sugiere que los pesos son muy compactos, coherente con una política de control de dimensión reducida.

La relevancia de esta ficha es acotada: se trata de un artefacto de robótica experimental publicado por un autor individual, sin métricas de rendimiento publicadas, sin licencia declarada y sin idiomas especificados. Es útil como ejemplo de flujo de trabajo de políticas RL para robots de bajo coste y de despliegue vía ONNX, pero no debe confundirse con un modelo fundacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control por refuerzo (red neuronal, arquitectura exacta no disponible); exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política de control; observación de 61 dimensiones, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (el artefacto publicado es ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y manifiesto `manifest.json` (schema 2 del microduck policy manifest) |

## Arquitectura y entrenamiento

La arquitectura concreta de la red no está documentada en la información disponible. Por el contexto del ecosistema microduck y la etiqueta `reinforcement-learning`, se trata de una política neuronal entrenada por RL que mapea un vector de observación de 61 dimensiones a 14 acciones discretas o continuas, ejecutada a 50 Hz sobre el robot equipado con ruedas. La innovación práctica destacable es la integración del normalizador de observaciones dentro del propio fichero `policy.onnx`, de modo que el consumidor puede alimentar observaciones en bruto sin aplicar preprocesado externo.

El entrenamiento se realizó en el repositorio `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a`. No se especifican el número de pasos de entrenamiento, la composición del dataset, ni si hubo fases de imitación, recompensas diseñadas a mano o curriculum. El modelo base es `DenRakEiw/microduck-senate_duck_0904`, sobre el que se aplicó un finetune; el autor describe el resultado como una "reentrada diaria" del policy `dashi/microduck-roller-remix-r900` con puntuación 0.900, aunque no se detalla qué métrica produce ese valor.

## Capacidades

- Control locomotor del robot microduck sobre ruedas: genera una marcha continua (gait) para el slot `walk`.
- Política "perpetua": mantiene la marcha indefinidamente hasta recibir una orden de parada o sustitución.
- Consumo de observaciones de 61 dimensiones y emisión de 14 acciones a 50 Hz.
- Normalización de observaciones integrada en el ONNX, lo que simplifica la integración en el demonio del robot.
- Carga y ejecución mediante el comando `robotctl policy load walk <repo>`.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling, soporte de agentes ni capacidades multilingües.

## Casos de uso

- Locomoción continua en robótica educativa: la política permite que un microduck con ruedas se desplace de forma sostenida en talleres y demos, sin necesidad de programar un controlador a mano.
- Pruebas de integración del demonio microduck: sirve como política de referencia para validar el flujo `robotctl policy load walk` y el manifiesto schema 2 en pipelines de CI del ecosistema.
- Evaluación de técnicas de RL sim-to-real: al estar entrenada en `microduck_rl` y desplegada en hardware real, es un caso práctico para estudiar la transferencia de políticas entrenadas en simulador.
- Benchmarking de políticas de marcha: el valor 0.900 asociado al remix original permite usarlo como línea base comparativa frente a otras políticas del slot `walk`.
- Docencia e investigación en aprendizaje por refuerzo: el repositorio de entrenamiento público y el artefacto ONNX facilitan reproducir y modificar el pipeline.
- Despliegue en robots de bajo coste con cómputo limitado: el tamaño reducido del artefacto (repo de 0.0 GB) sugiere que puede ejecutarse en hardware embarcado modesto, aunque no se documentan los requisitos exactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato numérico es la puntuación 0.900 asociada al policy original `dashi/microduck-roller-remix-r900`, sin que se especifique la métrica, el protocolo de evaluación ni las condiciones de medida.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB, lo que apunta a un modelo muy pequeño, pero no se publican cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por el tamaño del artefacto es plausible que funcione en CPU o en hardware embarcado, pero esto no está confirmado en la documentación.
- Opciones de despliegue: ejecución vía ONNX Runtime a través del demonio microduck (`robotctl policy load walk dashi/microduck-roller-daily-20261110`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: la política está diseñada para operar a 50 Hz (periodo de 20 ms), pero no se publican mediciones reales de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `dashi/microduck-roller-daily-20261110` | Política RL para microduck (slot `walk`) | no disponible | no aplica | no disponible | no disponible | Hugging Face |
| `dashi/microduck-roller-remix-r900` | Política RL para microduck (origen del remix) | no disponible | no aplica | 0.900 (métrica no especificada) | no disponible | Hugging Face |
| `DenRakEiw/microduck-senate_duck_0904` | Política RL para microduck (modelo base) | no disponible | no aplica | no disponible | no disponible | Hugging Face |

No se dispone de datos suficientes para comparar parámetros, contexto o rendimiento con alternativas de la misma categoría; la comparativa se limita a la relación de linaje entre las tres políticas microduck identificadas.

## Limitaciones y advertencias

- Ámbito muy restringido: es una política de control específica para el robot microduck sobre ruedas; no sirve para otras plataformas ni para tareas cognitivas.
- Sin licencia declarada: no se especifica la licencia, por lo que el uso comercial y la redistribución quedan sin marco legal claro.
- Sin métricas de evaluación publicadas: no hay benchmarks, curvas de aprendizaje ni protocolo de medida que respalden el valor 0.900.
- Sin documentación de sesgos ni de modos de fallo: no se describen comportamientos inseguros, condiciones de operación límite ni estrategias de recuperación.
- Dependencia de hardware y firmware: la política asume la interfaz del demonio microduck y el manifiesto schema 2; cambios en el daemon o en la calibración del robot pueden invalidar su comportamiento.
- Idiomas no aplicables: al no ser un modelo de lenguaje, no hay soporte multilingüe que evaluar.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí existe riesgo de acciones erráticas fuera de la distribución de entrenamiento (por ejemplo, terrenos o cargas no vistas durante el RL).
- Artefacto experimental de autor individual: sin proceso de revisión, sin mantenimiento garantizado y con fecha de creación futura respecto a los ciclos habituales de publicación, lo que refuerza su carácter de prueba.

## Enlaces

- Hugging Face: https://huggingface.co/dashi/microduck-roller-daily-20261110
- Modelo base: https://huggingface.co/DenRakEiw/microduck-senate_duck_0904
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a` (sin URL directa en la información disponible)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (sin URL directa en la información disponible)
