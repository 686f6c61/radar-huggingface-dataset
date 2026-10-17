# dadudu/microduck-bubu-roller-so

## Resumen

dadudu/microduck-bubu-roller-so es una política de control para el robot bípedo simulado MicroDuck, publicada como entrada para la prueba de 2 m Roller Sprint de Microduck Arena. No es un modelo de lenguaje: es un grafo ONNX de robótica que recibe observaciones y emite consignas articulares. Parte de suraj-phanindra/microduck-roller-hc5-aifund, que a su vez deriva de juicenv/microduck-roller-es21.

El autor mantiene congelada la red original y añade un contador de pasos y offsets por paso, optimizados con CMA-ES sobre las cinco semillas oficiales a 0,7 m/s. El resultado declarado es 0,932 s de media frente a 0,940 s del modelo base, aunque son cifras en muestra y frágiles.

Es relevante como caso de estudio de optimización de envoltorios sobre políticas de aprendizaje por refuerzo y de reproducibilidad en simulación, no como componente para un robot físico: el propio autor advierte de que no debe cargarse en un MicroDuck real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de política de control por refuerzo exportada a ONNX; topología interna no documentada |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; no hay ventana de contexto. La política consume observaciones por paso (el comando de avance se lee en `obs[48]`) |
| Tipos de cuantización | no disponible; no se documentan variantes cuantizadas |
| Idiomas soportados | no aplica; no procesa lenguaje natural |
| Licencia | no disponible; el repositorio fuente no declara licencia y este tampoco |
| Formato de pesos | ONNX (`policy.onnx`) |
| Tipo de modelo | política de robótica para MicroDuck; no es un LLM |
| Pipeline | robotics |
| Librería | microduck |
| Modelo base | suraj-phanindra/microduck-roller-hc5-aifund |
| Entorno de evaluación | Microduck Arena, runner v4, MuJoCo 3.10.0, CPU x86-64 |
| Uso previsto | simulación; no hardware |
| Tamaño del repositorio | 0,0 GB según HuggingFace |
| Descargas / likes | 8 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La red subyacente es una política de aprendizaje por refuerzo para locomoción y rodadura del MicroDuck. La información disponible no documenta su topología interna, número de capas ni recuento de parámetros. El artefacto publicado conserva el grafo fuente sin cambios en `policy.onnx` y lo envuelve con operadores ONNX estándar antes y después.

El envoltorio añade un contador de pasos: el objetivo de `head_roll` se redondea a 1/256 rad y se le suma k/65536 rad, donde k es el número de pasos de control ejecutados, saturando en 127. La Arena realimenta la acción anterior sin procesar, de modo que el siguiente paso lee k exactamente. La primera llamada, con acción anterior nula, se ejecuta con k = 1; el asentamiento de 0,5 s son 25 llamadas, por lo que el primer paso de carrera es k = 26.

Los offsets son cero antes de k = 26 y lineales a trozos en k, con nudos cada 3 pasos desde 26 hasta 77 y mantenidos después: uno sobre el comando de avance que lee la red (`obs[48]`) y uno sobre cada objetivo articular excepto `head_yaw` y `head_roll`. Son 18 nudos × 13 canales = 234 valores. Se buscaron con CMA-ES, población 24, paso inicial 0,05, generación 1.467 de 1.500, sobre las cinco semillas oficiales a 0,7 m/s, dentro del runner de la Arena (runner v4, MuJoCo 3.10.0, CPU x86-64), con una función de fitness basada en el tiempo de tablero más un desempate por subpaso (el sobrepaso de la línea respecto a la velocidad media de la carrera). No se reentrena la red neuronal; solo se optimizan los parámetros del envoltorio.

## Capacidades

- Control de locomoción y rodadura en simulación para el MicroDuck, con comando de avance a 0,7 m/s.
- Contador de pasos embebido en el objetivo de `head_roll`, con redondeo a 1/256 rad, incremento k/65536 rad y saturación en 127.
- Generación de offsets dependientes del paso: 18 nudos × 13 canales, activos desde k = 26 y mantenidos tras k = 77.
- Modificación del comando de avance leído por la red mediante un offset sobre `obs[48]`.
- Ejecución dentro del runner de Microduck Arena con MuJoCo 3.10.0 sobre CPU x86-64.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni procesamiento de lenguaje natural.
- No es un modelo multilingüe ni un modelo generativo de texto.

## Casos de uso

- Entrada de competición en Microduck Arena: cargar la política en el runner de la Arena y evaluarla en las cinco semillas oficiales de 2 m Roller Sprint a 0,7 m/s para obtener el tiempo de tablero.
- Reproducción del resultado declarado: ejecutar el mismo runner v4 con MuJoCo 3.10.0 en CPU x86-64, comparar semilla a semilla con el modelo base y verificar la media de 0,932 s.
- Estudio de robustez: repetir la evaluación ocho veces con ruido σ = 10⁻⁷ en todas las observaciones excepto el contador y documentar el rango de 0,936–0,940 s observado por el autor.
- Ablación del contador de pasos: comparar k = 1 frente a k = 26, el redondeo a 1/256 rad y la saturación en 127 para aislar su contribución al tiempo final.
- Investigación sobre optimización de envoltorios con CMA-ES: reutilizar la parametrización de 18 nudos × 13 canales y el presupuesto de población 24 y 1.467 generaciones para estudiar la sensibilidad del resultado al presupuesto de búsqueda.
- Docencia de robótica con aprendizaje por refuerzo: inspeccionar el grafo ONNX y el envoltorio de operadores, ejecutarlo en simulación y analizar la diferencia entre una política entrenada y una capa de ajuste externa.
- Caso negativo de simulación a realidad: usar la dependencia de la realimentación bit a bit de `head_roll` para ilustrar por qué una política válida en simulador no es directamente desplegable en hardware.

## Benchmarks y rendimiento

No hay resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje, porque no es un modelo de lenguaje. El único rendimiento publicado es el tiempo de carrera en Microduck Arena, a 0,7 m/s de velocidad de avance comandada (`arena score`, barrido completo):

| Semilla | microduck-roller-hc5-aifund (s) | este remix (s) |
|---|---|---|
| 1 | 0,94 | 0,94 |
| 2 | 0,94 | 0,92 |
| 3 | 0,94 | 0,92 |
| 4 | 0,94 | 0,94 |
| 5 | 0,94 | 0,94 |
| **Tablero (media)** | **0,940** | **0,932** |

Estos números son en muestra: la búsqueda puntuó sus candidatos sobre las mismas semillas. El autor documenta que, al repetir ocho veces con ruido σ = 10⁻⁷ en todas las observaciones excepto la del contador, la política terminó todas las semillas siempre, con tableros de 0,936–0,940 s y nunca 0,932 s. Una CPU o una compilación de librerías distinta podría dar el mismo tipo de variación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; no se documenta uso de GPU.
- GPU recomendadas: no aplica / no disponible; la evaluación publicada se ejecuta en CPU x86-64.
- CPU: x86-64 con el runner v4 de Microduck Arena y MuJoCo 3.10.0.
- Si cabe en GPU de consumo: no disponible; no hay estimación de VRAM ni requisito de GPU documentado. El repositorio ocupa 0,0 GB según HuggingFace, pero no se deduce de ello una cifra de VRAM.
- Opciones de despliegue: librería `microduck`, ONNX Runtime y el runner de la Arena. El resultado de búsqueda menciona `robotctl policy load`, pero el autor prohíbe explícitamente cargar el modelo en un robot físico.
- Latencia y throughput: no disponible; los tiempos de 0,932 s y 0,940 s son tiempos de carrera, no latencias de inferencia.

## Comparativa con modelos similares

| Modelo | Relación | Parámetros | Contexto | Rendimiento (media) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| suraj-phanindra/microduck-roller-hc5-aifund | modelo base | no disponible | no aplica | 0,940 s | no disponible | HuggingFace |
| dadudu/microduck-bubu-roller-so | este modelo | no disponible | no aplica | 0,932 s en muestra | no disponible | HuggingFace |
| juicenv/microduck-roller-es21 | ancestro del modelo base | no disponible | no aplica | no disponible | no disponible | HuggingFace |
| jrubiosainz/microduck-game-roller-remix2 | remix relacionado | no disponible | no aplica | no disponible | no disponible | HuggingFace |

No se dispone de recuento de parámetros, licencia ni resultados comparables de los modelos alternativos en la información proporcionada. La comparación útil se limita al tiempo de carrera publicado y a la cadena de derivación.

## Limitaciones y advertencias

- Solo simulación: el autor indica que no se probó nada en hardware y que no debe cargarse en un MicroDuck físico.
- El contador de pasos depende de que la realimentación de `head_roll` sea bit a bit; un robot real no alimentaría ese valor de forma exacta.
- Resultado frágil: con ruido σ = 10⁻⁷ se obtuvieron tableros de 0,936–0,940 s y nunca el 0,932 s declarado; una CPU o librería distinta puede alterar el resultado.
- Evaluación en muestra: CMA-ES puntuó los candidatos sobre las mismas cinco semillas oficiales, sin validación fuera de muestra.
- Licencia no declarada: el repositorio fuente no declara licencia y este tampoco; no se puede asumir permiso para uso comercial.
- Dependencia de versiones: runner v4, MuJoCo 3.10.0 y CPU x86-64; no se documenta compatibilidad con otras versiones.
- No hay evaluación de generalización a otras pistas, velocidades, semillas o condiciones distintas de las oficiales.
- No se documentan sesgos de comportamiento ni evaluación de robustez más allá de la prueba de ruido citada.
- El riesgo de alucinación no aplica: no genera texto. Las limitaciones de contexto e idioma tampoco aplican: no procesa lenguaje natural.
- No dispone de tool calling, agentes, visión, audio ni razonamiento multi-paso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dadudu/microduck-bubu-roller-so
- Modelo base: https://huggingface.co/suraj-phanindra/microduck-roller-hc5-aifund
- Ancestro del modelo base: https://huggingface.co/juicenv/microduck-roller-es21
- Microduck Arena: https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Repositorio de la Arena: https://huggingface.co/namenu/microduck-arena
- Remix relacionado: https://huggingface.co/jrubiosainz/microduck-game-roller-remix2
- Repositorio del robot Microduck: https://github.com/pollen-robotics/microduck
- Tutorial de hardware y software: https://github.com/AI-FanGe/Microduck-build-tutorial
