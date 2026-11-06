# jrubiosainz/microduck-game-sprinter-remix11

## Resumen

`jrubiosainz/microduck-game-sprinter-remix11` es un checkpoint de política de control para el evento **2 m Sprint** de la Microduck Arena de Pollen Robotics, un entorno de simulación de robótica con un pato cuadrúpedo. No es un modelo de lenguaje: es una política de reinforcement learning empaquetada en ONNX que combina una red MLP generadora de marcha con una tabla de búsqueda exacta de observaciones. Lo publica el usuario jrubiosainz como finetune de `rumezhak/microduck-sprint-remix-leader4`, que a su vez deriva de `a1rb4Ck/microduck-sprint-2m`.

La relevancia de este checkpoint es muy acotada: mejora marginalmente el tiempo de una de las cinco semillas oficiales del evento (semilla 4, de 0,825 s a 0,820 s) sustituyendo 38 filas de la tabla de búsqueda por acciones halladas mediante búsqueda open-loop con CMA-ES separable. El resto de la política es idéntica byte a byte a la de leader4. La media del tablero pasa de 0,823 s a 0,822 s.

Se trata de un artefacto de investigación en simulación, sin validación en hardware físico, orientado a la competición y a la experimentación con técnicas de búsqueda de políticas. Su utilidad práctica fuera de la Arena Microduck es prácticamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (red de política) + tabla de búsqueda exacta de observaciones (lookup) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control por paso, no modelo de secuencia) |
| Tipos de cuantizacion | no disponible (pesos ONNX en precisión nativa del export) |
| Idiomas soportados | no aplica (control robótico, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`) |

## Arquitectura y entrenamiento

La política combina dos componentes. Por un lado, una red MLP que genera una marcha (gait) a partir de la observación del entorno. Por otro, una tabla de búsqueda exacta: la observación, con las columnas de comando (48 a 60) enmascaradas mediante `L_mask`, se compara con 332 observaciones almacenadas de las cinco carreras oficiales (`L_obs`); si la diferencia absoluta máxima con la más cercana es inferior a 1e-7 (`L_tol`), se ejecuta la acción almacenada de esa fila (`L_act`) en lugar de la salida de la red. Este mecanismo de lookup convierte la política en una secuencia cuasi-determinista para las semillas oficiales.

El proceso de creación de este checkpoint consistió en tres pasos. Primero, una búsqueda open-loop de secuencias de objetivos articulares con CMA-ES separable (`cmas.py`) sobre la semilla 4, partiendo de una secuencia hallada en búsquedas previas de paso pequeño sobre la carrera de a1rb4Ck; se ejecutaron 490 generaciones de 200 candidatos (98.000 carreras simuladas, unos 9 minutos en 15 núcleos CPU) con paso inicial de 0,3 rad. Segundo, la grabación de la secuencia en el runner oficial de la Arena (versión 5, x86_64, MuJoCo 3.10.0, evento sprint-2m, 0,2 m/s). Tercero, el injerto (`mk_l4.py`) que reemplaza las filas 227 a 265 de leader4 por 38 filas nuevas para los pasos de control 28 a 65 de la semilla 4, con offsets de hasta 22,81 rad sobre las acciones almacenadas, verificando el resultado con `onnx.checker`. El build fue reproducible: dos compilaciones independientes (Azure x86-64 y Mac) produjeron archivos idénticos byte a byte.

## Capacidades

- Generación de marcha para el pato cuadrúpedo Microduck en el evento 2 m Sprint de la Arena, mediante red MLP.
- Control determinista por lookup exacto de observaciones para las cinco semillas oficiales del evento.
- Ejecución de secuencias de objetivos articulares con offsets de hasta 22,81 rad sobre las acciones base.
- Reproducción bit a bit de las carreras de leader4 en las semillas 1, 2, 3 y 5.
- Generalización a semillas no oficiales mediante la red MLP subyacente (semillas 6 a 60 probadas, con resultado idéntico al checkpoint de leader4).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es una política de control, no un modelo generativo de propósito general.

## Casos de uso

- **Competición en la Microduck Arena**: el checkpoint se carga directamente en el runner oficial (versión 5) para participar en el evento 2 m Sprint, con un tiempo medio de 0,822 s en las cinco semillas oficiales. Es su uso principal y prácticamente único.
- **Investigación en búsqueda de políticas open-loop**: sirve como referencia reproducible para estudiar cómo la sustitución de filas de una tabla de lookup por acciones halladas con CMA-ES afecta al tiempo de carrera en un entorno MuJoCo concreto.
- **Estudio de mecanismos de lookup exacto**: el umbral `L_tol` de 1e-7 y el enmascarado de columnas de comando (`L_mask`) son un caso de estudio sobre híbridos red + tabla en políticas de control.
- **Verificación de reproducibilidad de builds ONNX**: el proceso documentado (dos builds independientes byte-idénticos, validación con `onnx.checker`) es útil como ejemplo de pipeline reproducible para artefactos de RL.
- **Benchmark de robustez ante semillas no oficiales**: permite comprobar que la red MLP subyacente generaliza igual que leader4 en semillas 6 a 60, lo que resulta útil para evaluar la contribución real del lookup frente a la red.
- **Docencia en robótica simulada**: como ejemplo minimalista de política ONNX ejecutable en MuJoCo con onnxruntime 1.24.4, sin dependencias de entrenamiento en el momento de la inferencia.

## Benchmarks y rendimiento

Tiempos de carrera (s) en las semillas oficiales del evento, con runner versión 5:

| Semilla | sprint-remix-leader4 | Este checkpoint |
|---|---|---|
| 1 | 0,820 | 0,820 (filas de leader4) |
| 2 | 0,820 | 0,820 (filas de leader4) |
| 3 | 0,830 | 0,830 (filas de leader4) |
| 4 | 0,825 | **0,820** (filas de leader4 hasta el paso 27, luego las buscadas) |
| 5 | 0,820 | 0,820 (filas de leader4) |
| **Media del tablero** | **0,823** | **0,822** |

Los resultados son in-sample sobre las cinco semillas oficiales. No se han publicado benchmarks en otras tareas, entornos ni hardware físico.

## Requisitos de hardware

- **VRAM estimada**: no disponible con precisión; el repositorio ocupa 0,0 GB y el modelo es una política MLP con tabla de lookup, por lo que la huella de memoria es mínima (órdenes de decenas de MB o menos).
- **GPU recomendadas**: no requiere GPU; el runner oficial se ejecutó en CPU x86_64 (Azure) y en Mac.
- **Consumer GPU**: cabe holgadamente en cualquier GPU de consumo e incluso en CPU sin aceleración.
- **Opciones de despliegue**: onnxruntime (versión 1.24.4 en las pruebas documentadas), MuJoCo 3.10.0 y el runner oficial de la Microduck Arena (versión 5). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- **Latencia y throughput**: no disponibles de forma explícita; el runner opera con pasos de física de 5 ms (cuatro por cada 0,02 s de control) y la búsqueda de 98.000 carreras simuladas tardó unos 9 minutos en 15 núcleos CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (media tablero) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jrubiosainz/microduck-game-sprinter-remix11` | no disponible | no aplica | 0,822 s | Apache-2.0 | Hugging Face |
| `rumezhak/microduck-sprint-remix-leader4` | no disponible | no aplica | 0,823 s | Apache-2.0 | Hugging Face |
| `a1rb4Ck/microduck-sprint-2m` | no disponible | no aplica | no disponible en la información proporcionada | Apache-2.0 | Hugging Face |
| `jrubiosainz/microduck-game-sprinter-remix10` | no disponible | no aplica | no disponible en la información proporcionada | no disponible | Hugging Face |

## Limitaciones y advertencias

- **Solo simulación**: el modelo no ha sido validado en hardware físico; los resultados corresponden exclusivamente al simulador MuJoCo del runner oficial.
- **Mejora marginal y sobreajustada**: la ganancia se limita a 5 ms en una sola semilla oficial (semilla 4) y es in-sample; no hay evidencia de mejora fuera de las semillas evaluadas.
- **Dependencia del runner**: los resultados dependen de la versión 5 del runner, MuJoCo 3.10.0, onnxruntime 1.24.4 y el evento sprint-2m a 0,2 m/s; cambios en cualquiera de estos elementos pueden invalidar el lookup.
- **Umbral de lookup frágil**: el criterio `L_tol` de 1e-7 sobre observaciones enmascaradas hace que pequeñas variaciones numéricas puedan desactivar el lookup y degradar la política a la red MLP base.
- **Sesgos conocidos**: no disponibles; no aplica el concepto habitual de sesgo de modelos de lenguaje.
- **Riesgo de alucinación**: no aplica; es una política de control determinista.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, pero el valor práctico del artefacto fuera de la Arena es nulo y no se ofrecen garantías.
- **Caveat de producción**: no debe desplegarse en un robot real sin una validación exhaustiva previa, dado que toda la evidencia es simulada y específica de un evento concreto.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix11)
- [Modelo base: rumezhak/microduck-sprint-remix-leader4](https://huggingface.co/rumezhak/microduck-sprint-remix-leader4)
- [Modelo original: a1rb4Ck/microduck-sprint-2m](https://huggingface.co/a1rb4Ck/microduck-sprint-2m)
- [Checkpoint previo: jrubiosainz/microduck-game-sprinter-remix10](https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix10)
- [Microduck Arena (Space de Pollen Robotics)](https://huggingface.co/spaces/pollen-robotics/microduck-arena)
