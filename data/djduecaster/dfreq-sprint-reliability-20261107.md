# djduecaster/dfreq-sprint-reliability-20261107

## Resumen

`djduecaster/dfreq-sprint-reliability-20261107` es una política de control robótico derivada por fine-tuning del modelo base `djduecaster/dfreq`, publicada por el usuario djduecaster en Hugging Face. Se trata de un grafo ONNX de política neuronal sin estado (stateless feedback policy) orientado a la locomoción de un robot cuadrúpedo en tareas de tipo *sprint*, es decir, desplazamiento rápido a una velocidad de consigna fija. El modelo se enmarca en el ecosistema Microduck, una librería de carga de políticas para robótica, y su pipeline declarado es `robotics`.

El interés de esta variante concreta reside en que no es una copia renombrada del modelo base, sino una modificación estructural: se suprimen los pesos de entrada de la rama residual y se alteran los pesos y el sesgo de la primera capa de la red principal. El autor documenta una mejora de fiabilidad medida en simulación (689/1.024 episodios completados frente a 525/1.024 del modelo robusto previo en una primera tanda, y 659/1.024 frente a 549/1.024 en una confirmación independiente), manteniendo el resto de la realimentación dependiente de la observación.

La relevancia es acotada y de nicho: se trata de un candidato de investigación preparado para revisión dentro de un flujo de publicación diaria de puntos, no de un modelo de propósito general. El propio autor advierte de que es más lento que su entrada oficial previa de 0,848 segundos, de que no supera su puerta de velocidad y de que todo se ha validado exclusivamente en simulación, sin pruebas en robot físico ni garantía de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal feed-forward sin estado, exportada como grafo ONNX (política de control robótico) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada fija de observación `obs[1,61]`) |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible (el autor declara que no se afirma licencia MIT, Apache ni ninguna otra) |
| Formato de pesos | ONNX (float32, sin tensores externos ni operadores personalizados) |

## Arquitectura y entrenamiento

La política es una red neuronal sin estado que mapea una observación de 61 dimensiones (`obs[1,61]`) a una acción de 14 dimensiones (`actions[1,14]`) en precisión float32. El grafo no contiene mecanismos de reloj, identificadores de semilla, estado oculto del actor, tablas de búsqueda ni observaciones privilegiadas en despliegue; todas las entradas son observaciones reales del entorno. El autor indica que la estirpe del profesor original incluía mecanismos de reloj y semilla, pero que estos están ausentes del grafo desplegado.

El proceso de derivación parte de la red *Sprint* robusta previamente entrenada y aplica dos cambios: supresión de los pesos de entrada de la rama residual y modificación de los pesos y el sesgo de la primera capa de la red principal. El autor subraya que la mejora de fiabilidad se atribuye al cambio combinado y no únicamente a la supresión de la rama. La validación se realizó con el evaluador oficial de Arena sin modificar, que seleccionó una consigna de 1,10 m/s y devolvió 0,959 segundos con 5/5 finalizaciones (0,950, 0,985, 0,960, 0,965 y 0,935 segundos). Dos barridos históricos y un barrido fresco en Linux del 7 de noviembre coinciden exactamente. El grafo pasó la validación ONNX y produjo acciones finitas deterministas sobre 2.538 observaciones reales. No se descargó ni ejecutó ningún modelo de terceros durante la preparación.

## Capacidades

- Generación de acciones de control locomotor para un robot cuadrúpedo en tarea *sprint* a velocidad de consigna fija.
- Política sin estado: la acción depende únicamente de la observación actual de 61 dimensiones, sin memoria interna.
- Ejecución determinista: mismas observaciones producen las mismas acciones, con salidas finitas verificadas en 2.538 observaciones.
- Compatibilidad con el ecosistema Microduck mediante `robotctl policy load` con el slot correspondiente.
- Exportación ONNX autocontenida, sin tensores externos ni operadores personalizados, lo que facilita su despliegue en runtimes ONNX estándar.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües ni modalidades de visión o audio.

## Casos de uso

- Investigación en control locomotor: servir como punto de comparación frente al modelo robusto previo para estudiar el efecto de suprimir la rama residual en la fiabilidad de la política, usando las tandas de 1.024 episodios documentadas por el autor.
- Evaluación en simulador tipo Arena: ejecutar el modelo con el evaluador oficial a 1,10 m/s para reproducir los tiempos de finalización reportados (media de 0,959 segundos, 5/5 finalizaciones).
- Análisis de ablación de arquitectura: comparar el grafo modificado con `djduecaster/dfreq` en la revisión 7b67892a603eb95afb0ffbfe61d07b7d57128f12 para aislar la contribución de los cambios en la primera capa y en la rama residual.
- Despliegue en pipelines ONNX: integrar el grafo en un runtime ONNX estándar para inferencia de política en entornos simulados, aprovechando que no requiere operadores personalizados ni tensores externos.
- Estudio de fiabilidad ante arranques amplios: utilizar los resultados de 689/1.024 y 659/1.024 finalizaciones para analizar los modos de fallo en condiciones de inicio variadas, que el autor reconoce como imperfectas.
- Referencia en flujos de publicación de puntos: emplear el paquete como ejemplo documentado de candidato de investigación con procedencia trazable, créditos upstream conservados y carpeta de evidencias.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| Tiempo de finalizacion (evaluador Arena oficial, consigna 1,10 m/s) | 0,959 s de media; 5/5 finalizaciones | Valores individuales: 0,950, 0,985, 0,960, 0,965, 0,935 s |
| Fiabilidad a consigna fija 1,15 m/s (prueba 1) | 689/1.024 frente a 525/1.024 del modelo robusto previo | Prueba de fiabilidad independiente |
| Fiabilidad a consigna fija 1,15 m/s (confirmacion) | 659/1.024 frente a 549/1.024 del modelo robusto previo | Segunda tanda de confirmacion separada |
| Validacion ONNX | Superada; float32 `obs[1,61]` a `actions[1,14]`; sin tensores externos ni operadores personalizados | 2.538 observaciones reales con acciones finitas deterministas |
| Comparacion con entrada oficial previa | Mas lento que la entrada oficial de 0,848 s; puerta de velocidad previa no superada | Declarado por el autor |

No se han publicado resultados de benchmarks estandar de modelos de lenguaje (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo es una política de control de muy baja dimensionalidad (61 entradas, 14 salidas), por lo que la huella de memoria es minima y probablemente inferior a unos pocos megabytes, aunque el numero exacto de parametros no se declara.
- GPU recomendadas: no disponible; al ser un grafo ONNX pequeno, la inferencia puede ejecutarse en CPU sin requisitos de aceleracion.
- Cabe en GPU de consumo: si, con toda probabilidad, dado el tamano reducido del grafo, aunque no se proporcionan cifras oficiales.
- Opciones de despliegue: runtime ONNX estandar (por la ausencia de operadores personalizados y tensores externos) y la libreria Microduck mediante `robotctl policy load SLOT djduecaster/dfreq`.
- Latencia y throughput: no disponibles; el unico dato temporal reportado es el tiempo de finalizacion de la tarea en simulacion (0,959 segundos de media), que no equivale a latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `djduecaster/dfreq-sprint-reliability-20261107` | no disponible | no aplica (obs[1,61]) | 689/1.024 y 659/1.024 finalizaciones a 1,15 m/s; 0,959 s a 1,10 m/s | no disponible | Publico en Hugging Face |
| `djduecaster/dfreq` (modelo base, revision 7b67892a) | no disponible | no aplica | Entrada oficial previa de 0,848 s; 525/1.024 y 549/1.024 finalizaciones a 1,15 m/s | no disponible | Publico en Hugging Face |
| `djduecaster/dfreq-roller-native-calibration-20261103` | no disponible | no aplica | no disponible | no disponible | Publico en Hugging Face |

No se dispone de informacion sobre otros modelos comparables de la misma categoria fuera del linaje `dfreq`.

## Limitaciones y advertencias

- Validacion exclusivamente en simulacion: no se han realizado pruebas en robot fisico ni se ofrece garantia de seguridad.
- Las amplitudes de salida ONNX no constituyen una validacion de despliegue fisico.
- La aceptacion en Arena, la puntuacion alojada y los puntos no estan garantizados.
- El modelo es mas lento que la entrada oficial previa de 0,848 segundos y su puerta de velocidad permanece sin superar.
- La fiabilidad ante arranques amplios sigue siendo imperfecta segun el propio autor (689/1.024 y 659/1.024 finalizaciones).
- No se declara licencia independiente: no se afirma MIT, Apache ni ninguna otra licencia general; deben revisarse los terminos de los repositorios upstream y de Hugging Face antes de reutilizar.
- Deben conservarse los creditos upstream y la procedencia documentada en `upstream-base-card.md`.
- El paquete se prepara como candidato de puntos de publicacion diaria y no autoriza por si mismo su publicacion ni su envio.
- Una entrega no-Tug no modifica la politica seleccionada para la Tug Cup.
- Al no ser un modelo de lenguaje, no dispone de capacidades de generacion de texto, codigo, razonamiento, tool calling ni multilingues; no procede evaluar sesgos linguisticos ni riesgo de alucinacion en el sentido habitual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/djduecaster/dfreq-sprint-reliability-20261107
- Modelo base: https://huggingface.co/djduecaster/dfreq
- Variante relacionada: https://huggingface.co/djduecaster/dfreq-roller-native-calibration-20261103/tree/main
- Repositorio de la variante relacionada (raiz): https://huggingface.co/djduecaster/dfreq-roller-native-calibration-20261103
