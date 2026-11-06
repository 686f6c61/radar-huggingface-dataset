# rumezhak/microduck-tug-rating-remix

## Resumen

`rumezhak/microduck-tug-rating-remix` es un modelo de control para robótica orientado al juego del tira y afloja (Tug of War) dentro de la Microduck Arena de Pollen Robotics. No es un modelo de lenguaje ni un transformer generativo: es un artefacto de inferencia compuesto por una red de respaldo (fallback) en formato ONNX más una tabla de búsqueda (lookup) que reproduce acciones precalculadas. Lo publica el usuario rumezhak como un ajuste fino (finetune) del modelo de jrubiosainz `microduck-game-tug-a1rb4ck-099c-s1-s2-s3-s4-f7f-s5`, que a su vez deriva de `a1rb4Ck/microduck-tug`.

El modelo resuelve un problema muy acotado: mejorar marginalmente la puntuación de un agente en el runner de simulación de la Arena. La mejora declarada es de 166.2370 cm a 166.2381 cm de media en cinco asaltos (bouts) de rating, es decir, 0.0011 cm, un cambio prácticamente nulo. Solo se ha reoptimizado el asalto de la semilla 2 (de 165.973 a 165.979 cm) y se ha sustituido la red de respaldo por la de una revisión anterior de `a1rb4Ck/microduck-tug`.

La relevancia es limitada y muy específica: sirve como entrada en la competición de la Microduck Arena y como ejemplo de optimización open-loop sobre políticas de control en simulación. No está pensado para uso en un robot físico y su rendimiento depende de la reproducibilidad bit a bit de las observaciones en el simulador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de control (head-to-head) en ONNX más tabla de búsqueda de acciones; no es un transformer |
| Parametros totales | no disponible (la red de respaldo consta de diez tensores, sin recuento de parámetros publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (red de respaldo) más lookup de acciones; repositorio de 0.0 GB |
| Libreria | microduck |
| Pipeline | robotics |
| Modelo base | jrubiosainz/microduck-game-tug-a1rb4ck-099c-s1-s2-s3-s4-f7f-s5 (finetune) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo no sigue una arquitectura de transformer ni MoE. Se compone de dos piezas: una tabla de búsqueda que, dada una observación, devuelve una acción precalculada, y una red de respaldo en ONNX (la red head-to-head de una revisión anterior de `a1rb4Ck/microduck-tug`) que se usa cuando ninguna fila del lookup coincide con la observación. Los diez tensores de esa red se copian sin modificar.

El "entrenamiento" consistió en una búsqueda open-loop con CMA (optimización por evolución de estrategias con matriz de covarianza adaptativa), con sigma 0.05, sobre las filas 20 a 120, ejecutada en el runner de tug de la propia Arena, evaluando un asalto por candidato contra un pato de referencia congelado. Solo se reoptimizó el asalto de la semilla 2; los otros cuatro asaltos son idénticos bit a bit a los del modelo base. El autor indica que también probó a fusionar el mejor asalto válido de cada semilla entre el modelo base y otros archivos destacados del ranking, y ejecutó la búsqueda sobre las cinco semillas durante unos 25 minutos, sin encontrar mejoras para las semillas 1, 3, 4 y 5.

## Capacidades

- Control de un agente MicroDuck en el juego del tira y afloja dentro del simulador de la Microduck Arena.
- Reproducción de acciones mediante lookup determinista para cinco asaltos de rating (semillas 1 a 5).
- Inferencia de respaldo mediante red ONNX cuando la observación no coincide con ninguna fila del lookup.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio ni capacidades multilingües.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- Solo funciona en simulación; el autor advierte explícitamente que no debe cargarse en un MicroDuck físico.

## Casos de uso

- Competición en la Microduck Arena: el modelo se publica como entrada para el Tug of War y se evalúa con el runner oficial de la Arena, que actúa como árbitro.
- Reproducción de resultados de investigación: permite replicar los asaltos de rating de las cinco semillas siempre que la observación coincida bit a bit (tolerancia 1e-7) en x86-64 Linux con MuJoCo 3.10.0 y runner v5.
- Estudio de optimización evolutiva: sirve como caso práctico de búsqueda CMA open-loop sobre políticas de control con un presupuesto de cómputo pequeño (unos 25 minutos para cinco semillas).
- Análisis de sensibilidad al redondeo: útil para estudiar cómo pequeñas diferencias numéricas entre máquinas pueden romper la coincidencia del lookup y degradar el agente a la red de respaldo.
- Benchmarking de agentes de control: puede emplearse como referencia base para comparar nuevas políticas de tug contra el pato congelado de la Arena.
- Docencia sobre evaluación en simulación: ilustra las limitaciones de las métricas in-sample y la dependencia de la geometría de la cuerda en los resultados.

## Benchmarks y rendimiento

Resultados declarados por el autor en el runner de la Arena (x86-64 Linux, MuJoCo 3.10.0, runner v5), en centímetros:

| Semilla | Lado | Modelo base | Este archivo |
|---|---|---|---|
| 1 | oeste | 165.888 | 165.888 |
| 2 | este | 165.973 | 165.979 |
| 3 | oeste | 165.629 | 165.629 |
| 4 | este | 166.542 | 166.542 |
| 5 | oeste | 167.153 | 167.153 |
| Media | | 166.2370 | 166.2381 |

El autor también reporta que la red de respaldo, probada contra 21 entradas cargables de la lista de la copa el 2 de noviembre y con semillas de asalto aleatorias, ganó el 91.6 % de los asaltos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque el modelo no es de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB y la red de respaldo consta de diez tensores, por lo que la huella es mínima.
- GPU recomendadas: no se especifican; al tratarse de una red ONNX pequeña más un lookup, la inferencia puede ejecutarse en CPU.
- Cabe en cualquier GPU de consumo e incluso en CPU; no requiere aceleradores dedicados.
- Opciones de despliegue: runtime ONNX y la librería `microduck` junto con el runner de la Microduck Arena; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Entorno verificado: x86-64 Linux con MuJoCo 3.10.0 y runner v5; el autor solo ha comprobado la reproducibilidad en esa plataforma.

## Comparativa con modelos similares

| Modelo | Relación | Puntuación media (cm) | Licencia | Disponibilidad |
|---|---|---|---|---|
| rumezhak/microduck-tug-rating-remix | Este modelo | 166.2381 | Apache-2.0 | Hugging Face |
| jrubiosainz/microduck-game-tug-a1rb4ck-099c-s1-s2-s3-s4-f7f-s5 | Modelo base | 166.2370 | Apache-2.0 | Hugging Face |
| a1rb4Ck/microduck-tug | Ancestro del base | no disponible | Apache-2.0 | Hugging Face |

La comparativa se limita a la estirpe directa del modelo; no se dispone de datos de otros agentes de la Arena en la información proporcionada.

## Limitaciones y advertencias

- La mejora es marginal (0.0011 cm de media) y solo afecta a la semilla 2; el resto de asaltos son idénticos al modelo base.
- El rating es in-sample: los cinco asaltos son deterministas y el pato de referencia está congelado, por lo que la puntuación no mide generalización.
- La reproducción exige que la observación coincida bit a bit (tolerancia 1e-7); el redondeo de otra máquina puede romper un asalto y degradar esa semilla a la red de respaldo.
- Solo se ha verificado en x86-64 Linux con MuJoCo 3.10.0 y runner v5.
- Los resultados dependen de la geometría de la cuerda y de dónde acaba la holgura, no solo de cuánto tira el pato; el autor relajó sus propios límites geométricos para aceptar los asaltos de los líderes.
- No debe cargarse en un MicroDuck físico: el lookup reproduce acciones muy fuera de lo que se pediría a un servo real.
- No procesa lenguaje, por lo que no aplican sesgos lingüísticos, pero tampoco ofrece capacidades de texto, visión o razonamiento.
- Riesgo de alucinación no aplicable; el riesgo principal es la fragilidad numérica del lookup.
- Licencia Apache-2.0 permite uso comercial, pero el modelo solo tiene sentido en el contexto de la Arena y no aporta valor fuera de ella.
- El autor indica que un asistente de IA ayudó en algunos experimentos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-tug-rating-remix
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-tug-a1rb4ck-099c-s1-s2-s3-s4-f7f-s5
- Modelo ancestro: https://huggingface.co/a1rb4Ck/microduck-tug
- Microduck Arena: https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Perfil de Pollen Robotics: https://huggingface.co/pollen-robotics
- Perfil de jrubiosainz: https://huggingface.co/jrubiosainz
- Perfil de a1rb4Ck: https://huggingface.co/a1rb4Ck
