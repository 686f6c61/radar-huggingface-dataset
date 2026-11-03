# jrubiosainz/microduck-sock-heist-6m-fce-g1

## Resumen

Microduck Sock Heist - derived tail search FCE G1 es una política de control robótico en formato ONNX publicada por el usuario jrubiosainz para la competición de simulación Microduck Arena, en la categoría "6 m Sock Heist". No se trata de un modelo de lenguaje ni de un transformer generativo, sino de un artefacto de inferencia (policy.onnx) que mapea observaciones a comandos de control de un robot Microduck de Pollen Robotics. El modelo deriva por fine-tuning del checkpoint público rumezhak/microduck-sock-heist-composite-v1 y solo modifica las últimas 24 llamadas de control de la semilla oficial 2.

La relevancia es acotada: es una entrada de competición con ajuste fino de cola (tail search) mediante CMA-ES separable, no un modelo de propósito general. La mejora reportada es de un único tick de física sobre cinco semillas (4936 ticks frente a 4937 del modelo base), un margen que el propio autor califica como dentro del ruido de hardware y runtime. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo figura como 0.0 GB.

No hay información sobre arquitectura de red neuronal, número de parámetros, contexto, idiomas ni licencia del modelo en su conjunto. Cualquier uso fuera de la simulación de la Arena carece de validación y el autor prohíbe explícitamente su ejecución en un robot físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control exportada a ONNX; el autor no describe la red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre observaciones de control) |
| Tipos de cuantizacion | no disponible; artefacto publicado en ONNX (1.208.001 bytes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible para el modelo en su conjunto; se retiene LICENSE-apache-2.0.txt solo para las porciones con Apache-2.0 |
| Formato de pesos | ONNX (policy.onnx, SHA256 a0d1d3274706144ae7dbb73847951fc59b09ac27adb9012c38498955646baad2) |

## Arquitectura y entrenamiento

El autor no documenta la arquitectura interna de la política. Lo que sí describe es el mecanismo de despliegue: el grafo ONNX incorpora un mecanismo de lookup de observaciones (heredado de a1rb4Ck/microduck-heist, Apache-2.0) junto con una red de fallback (atribuida a lphatnguyen, sin licencia declarada). El grafo, la red de fallback, la máscara, la tolerancia, las formas de los tensores y el resto de metadatos son idénticos al modelo base; solo cambian las filas de cola de las tablas L_obs y L_act y el aviso de modificación añadido.

El entrenamiento consiste en una reoptimización de las últimas 24 llamadas de control de la semilla oficial 2 mediante CMA-ES separable, seguida de una regrabación cerrada (closed-loop) de las observaciones y acciones en el runner nativo x86. Las semillas 1, 3, 4 y 5 conservan el comportamiento del modelo base. El candidato publicado completó la evaluación fija y la canónica con el runner oficial microduck-arena 0.7.0 (versión 5), seleccionando command_vx = 0.2 en la evaluación canónica. No se reporta número de tokens, composición de dataset, RLHF ni DPO, porque no aplica a este tipo de artefacto.

## Capacidades

- Control de política para la tarea de simulación "6 m Sock Heist" en Microduck Arena.
- Inferencia ONNX con mecanismo de lookup de observaciones y red de fallback.
- Evaluación en modo velocidad fija y en barrido canónico (command_vx = 0.2).
- Comportamiento preservado del modelo base en las semillas 1, 3, 4 y 5.
- Ajuste específico sobre la semilla 2 (últimas 24 llamadas de control).
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Evaluación de políticas en Microduck Arena: el artefacto se carga en el runner oficial 0.7.0 para reproducir la tarea Sock Heist a 6 m y comparar tiempos de finalización por semilla.
- Investigación sobre optimización de cola (tail search): sirve como ejemplo reproducible de reoptimización de las últimas N llamadas de control con CMA-ES separable sobre una política pública.
- Estudio de metodología de evaluación en simulación: el autor documenta explícitamente que las métricas son mediciones locales nativas y no resultados de la Arena en vivo, lo que lo convierte en material útil para discutir trazabilidad de benchmarks.
- Reproducción de linaje de artefactos: el SHA256 del policy.onnx base y del candidato publicado permiten auditar la cadena de derivación entre rumezhak/microduck-sock-heist-composite-v1 y este checkpoint.
- Análisis de licenciamiento en modelos derivados: el NOTICE y la retención selectiva de LICENSE-apache-2.0.txt ilustran un caso de cadena de licencias incompleta en pesos upstream.
- Integración en pipelines ONNX de simulación: el fichero de 1.208.001 bytes puede cargarse con runtime ONNX estándar en un entorno x86 de simulación, sin requisitos de GPU documentados.

## Benchmarks y rendimiento

Resultados de replay local nativo reportados por el autor (no son resultados de la Arena en vivo):

| Semilla oficial | Tiempo de finalización (s) | Ticks de física |
|---|---:|---:|
| 1 | 4,820 | 964 |
| 2 | 5,235 | 1047 |
| 3 | 4,790 | 958 |
| 4 | 4,875 | 975 |
| 5 | 4,960 | 992 |

Media: 4,936 s. Total: 4936 ticks, frente a 4937 ticks del modelo base directo. El margen es de un solo tick de física sobre cinco semillas y el autor advierte que diferencias de hardware o runtime pueden alterarlo. La medición es in-sample: solo se optimizaron y midieron las cinco semillas oficiales, por lo que no constituye evidencia de generalización.

## Requisitos de hardware

- VRAM estimada: no disponible. El artefacto es un ONNX de 1.208.001 bytes y la inferencia se validó en el runner nativo x86, sin que se documenten requisitos de GPU.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: no documentada.
- Opciones de despliegue: runner oficial microduck-arena 0.7.0 (versión 5) en x86; runtime ONNX estándar para cargar el fichero.
- Latencia y throughput: no disponibles. Solo se reportan ticks de física por episodio, no tiempos de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jrubiosainz/microduck-sock-heist-6m-fce-g1 | no disponible | no aplica | 4936 ticks en 5 semillas (local) | no disponible | HuggingFace, 0 descargas |
| rumezhak/microduck-sock-heist-composite-v1 | no disponible | no aplica | 4937 ticks en 5 semillas (referencia del autor) | no disponible | HuggingFace (modelo base) |
| a1rb4Ck/microduck-heist (94cd2cf) | no disponible | no aplica | no disponible | Apache-2.0 (porciones) | HuggingFace |

La comparación se limita al linaje directo porque no se dispone de datos de otras entradas de la Arena en la información proporcionada.

## Limitaciones y advertencias

- El autor prohíbe explícitamente ejecutar la política en un robot físico: es una entrada in-sample de simulación y no se ha establecido ningún mecanismo de parada segura ni operación física segura.
- La mejora sobre el modelo base es de un tick de física sobre cinco semillas, un margen que el propio autor califica de potencialmente dependiente de hardware y runtime.
- Solo se optimizaron y midieron las cinco semillas oficiales; no hay evidencia de generalización a otras condiciones.
- La licencia del modelo en su conjunto no está declarada. La presencia de LICENSE-apache-2.0.txt no cubre los pesos upstream sin licencia ni el fichero completo.
- Existen componentes upstream sin licencia declarada (linaje v3/v4 y red de fallback de lphatnguyen), lo que genera incertidumbre legal para cualquier uso más allá de la evaluación en la Arena.
- El autor se compromete a detener la publicación y escalar la retirada si algún autor upstream objeta.
- Riesgo de alucinación y sesgos: no aplica en el sentido habitual de modelos de lenguaje; el riesgo equivalente es el sobreajuste a las semillas medidas y la falta de robustez fuera de distribución.
- Sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validación independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-fce-g1
- Modelo base: https://huggingface.co/rumezhak/microduck-sock-heist-composite-v1/tree/b29090eb3242a9c1201b650495d515bb622a394f
- Repositorio de referencia de layout y lookup: a1rb4Ck/microduck-heist en el commit 94cd2cfeb57a4ece561a3d320e233f442238cb81
- Pollen Robotics (Microduck y Microduck Arena): no disponible en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
