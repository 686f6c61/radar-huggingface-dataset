# jrubiosainz/microduck-sock-heist-6m-rz-tail-r1n

## Resumen

`microduck-sock-heist-6m-rz-tail-r1n` es una política de control para robótica publicada por el usuario jrubiosainz en Hugging Face, concebida exclusivamente como entrada para la competición "6 m Sock Heist" de la Microduck Arena de Pollen Robotics. No es un modelo de lenguaje ni un sistema generativo de propósito general: es un artefacto ONNX de aproximadamente 1,2 MB que contiene una red de respaldo (un MLP con normalizador de observaciones) más un mecanismo de búsqueda en tablas de acciones previamente grabadas, una por cada una de las cinco semillas oficiales del entorno de simulación.

El modelo deriva de `rumezhak/microduck-sock-heist-second-green-v2`, del que hereda la práctica totalidad de su contenido. La aportación de jrubiosainz se limita a la reoptimización de los últimos pasos de control de cada secuencia de acciones mediante un algoritmo CMA-ES separable, con el objetivo de que el pato simulado cruce la línea de 6 metros unos cuantos ticks de física antes. Según el autor, la puntuación esperada en las cinco semillas oficiales es de 5,010 (frente a los 5,052 de la ejecución original), con resultados por semilla de 4,84, 5,35, 4,89, 4,96 y 5,01.

La relevancia de esta ficha es acotada y conviene subrayarla: se trata de un experimento de ajuste fino de bajo nivel sobre una política de referencia, útil para quienes investigan optimización de trayectorias en simulación y competiciones de robótica, pero sin aplicación fuera del simulador de la Arena. El propio autor advierte que no debe cargarse en un MicroDuck físico. La licencia es un caso complejo: el repositorio no declara campo `license`, y solo las partes heredadas de `a1rb4Ck/microduck-heist` están cubiertas por Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control híbrida: red MLP de respaldo (obs_normalizer + mlp.*) con mecanismo de búsqueda en tablas de acciones grabadas (observation-lookup) |
| Parametros totales | no disponible (pesos en ONNX; fichero de 1.213.665 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; opera sobre observaciones por paso de control) |
| Tipos de cuantizacion | no disponible (se distribuye únicamente en ONNX) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | Sin campo `license` declarado en el repositorio; Apache-2.0 solo para las partes heredadas de `a1rb4Ck/microduck-heist` (layout del grafo y mecanismo de lookup) |
| Formato de pesos | ONNX (`policy.onnx`) |

## Arquitectura y entrenamiento

El artefacto no se entrena en el sentido convencional. La política combina dos componentes: por un lado, una red de respaldo compuesta por un normalizador de observaciones y un MLP, heredada de `lphatnguyen/microduck-sock-heist-6m-v3`; por otro, un mecanismo de búsqueda en tablas que recupera acciones previamente grabadas en bucle cerrado, una por semilla especialista, según el layout definido en `a1rb4Ck/microduck-heist`. El grafo, todas las formas de los tensores y todos los inicializadores salvo los modificados permanecen idénticos al fichero fuente.

La modificación introducida por jrubiosainz consiste en reoptimizar, para cada una de las cinco semillas oficiales, los últimos pasos de control de la secuencia de acciones registrada, empleando un CMA-ES separable sobre el runner oficial de la Arena (microduck-arena 0.7.0, x86-64, velocidad comandada 0,2). Posteriormente se regrabaron en bucle cerrado las claves de búsqueda correspondientes. Los rangos modificados son concretos: semilla 1, filas 235-266 de `L_act` y 236-266 de `L_obs`; semilla 2, filas 539-562 y 540-562; semilla 3, filas 811-834 y 812-834; semilla 4, filas 1086-1109 y 1087-1109; semilla 5, filas 1364-1387 y 1365-1387. Las filas 235, 811 y 1086 de `L_obs` solo cambian el patrón de bits de la columna 50 (-0,0 a +0,0, mismo valor) y no se contabilizan como modificadas.

## Capacidades

- Control de locomoción de un pato simulado (MicroDuck) en el entorno Sock Heist de la Microduck Arena, con velocidad comandada de 0,2.
- Recuperación de acciones por búsqueda en tablas específicas por semilla, con red MLP de respaldo para observaciones no cubiertas.
- Cruce de la línea de 6 metros en las cinco semillas oficiales del entorno de simulación.
- Ejecución determinista sobre el runner oficial microduck-arena 0.7.0 en x86-64.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión, audio ni ninguna capacidad generativa.

## Casos de uso

- Investigación en optimización de trayectorias: sirve como caso de estudio de cómo un CMA-ES separable aplicado a los últimos pasos de una secuencia grabada puede adelantar el cruce de meta unos pocos ticks de física, con una mejora medible en la puntuación agregada.
- Reproducción de experimentos en la Microduck Arena: el artefacto permite replicar la metodología de reoptimización de colas sobre el runner 0.7.0 y comparar los resultados por semilla con la ejecución original.
- Benchmarking de runners de simulación: al ser sensible a la versión del runner y a la arquitectura (x86-64), resulta útil para verificar la estabilidad de resultados entre versiones de microduck-arena.
- Estudio de linaje y atribución de licencias: el repositorio documenta con precisión las revisiones, hashes SHA-256 y licencias de cada componente heredado, lo que lo convierte en un ejemplo práctico de trazabilidad en modelos derivados.
- Docencia sobre políticas híbridas tabla-MLP: ilustra cómo se combina una red de respaldo con un mecanismo de lookup para reducir la carga computacional en inferencia.
- Análisis de robustez en simulación: permite estudiar cómo pequeñas perturbaciones en los últimos pasos de control afectan al resultado agregado en cinco semillas fijas.
- No es adecuado para despliegue en robótica física, atención al cliente, generación de código ni ninguna tarea de lenguaje.

## Benchmarks y rendimiento

Los únicos datos disponibles son los resultados de la propia competición, medidos con el runner oficial de la Arena.

| Semilla | Puntuación esperada |
|---|---|
| s1 | 4,84 |
| s2 | 5,35 |
| s3 | 4,89 |
| s4 | 4,96 |
| s5 | 5,01 |
| Media (5 semillas) | 5,010 |

Referencia de la ejecución original de rumezhak (`01M6CPZT6YVBCZMYZQ1YG4`): 5,052. El autor advierte que las cinco semillas son in-sample, igual que en el modelo fuente, y que solo cuenta la ejecución oficial de la Arena. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el fichero ONNX ocupa 1.213.665 bytes (aproximadamente 1,2 MB).
- GPU recomendadas: no se especifican; cualquier GPU capaz de ejecutar ONNX Runtime sirve, e incluso la CPU es suficiente para este tamaño.
- Cabe holgadamente en cualquier GPU de consumo, incluida una RTX 4090, y en GPUs integradas.
- Opciones de despliegue: ONNX Runtime y el runner oficial microduck-arena 0.7.0 en x86-64; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles; el autor solo especifica la velocidad comandada de 0,2 y la plataforma x86-64.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Puntuación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jrubiosainz/microduck-sock-heist-6m-rz-tail-r1n | no disponible (ONNX de 1,2 MB) | no aplica | 5,010 esperada (5 semillas) | sin declarar; Apache-2.0 parcial | Hugging Face |
| rumezhak/microduck-sock-heist-second-green-v2 | no disponible | no aplica | 5,052 (ejecución 01M6CPZT6YVBCZMYZQ1YG4) | sin declarar | Hugging Face |
| lphatnguyen/microduck-sock-heist-6m-v3 | no disponible | no aplica | no disponible | sin declarar | Hugging Face |
| a1rb4Ck/microduck-heist | no disponible | no aplica | no disponible | Apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- Solo válido en simulación: el autor indica explícitamente que no debe cargarse en un MicroDuck físico, ya que las acciones registradas quedan muy fuera de lo que se pediría a servos reales.
- Las cinco semillas evaluadas son in-sample, igual que en el modelo fuente, por lo que la puntuación esperada no constituye una medida de generalización.
- La puntuación esperada (5,010) es inferior a la de la ejecución original de rumezhak (5,052); la mejora se refiere al adelanto del cruce de meta, no a la puntuación agregada.
- Sensibilidad a la plataforma y versión: los resultados se obtuvieron con microduck-arena 0.7.0 en x86-64 y velocidad comandada 0,2; otras configuraciones pueden alterar el comportamiento.
- Licencia ambigua: el repositorio no declara campo `license`; los componentes de rumezhak y lphatnguyen no están relicenciados y jrubiosainz no concede licencia sobre ellos. El uso fuera de Hugging Face queda a criterio de sus autores.
- Los autores originales no fueron consultados antes de publicar esta entrada; el autor se compromete a retirarla si alguno objeta.
- No procesa lenguaje, no tiene sesgos lingüísticos ni riesgo de alucinación en el sentido habitual, pero tampoco ofrece ninguna capacidad de razonamiento o generación.
- Preparada con ayuda de un asistente de IA según la propia model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-rz-tail-r1n
- Modelo base: https://huggingface.co/rumezhak/microduck-sock-heist-second-green-v2
- Revisión del modelo base utilizada: https://huggingface.co/rumezhak/microduck-sock-heist-second-green-v2/tree/73589ead9485546120bd47f635f15b4cff6fafdb
- Ejecución de referencia en la Arena: https://pollen-robotics-microduck-arena.hf.space/api/runs/01M6CPZT6YVBCZMYZQ1YG4
- Microduck Arena (Space): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Origen de la red de respaldo: https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v3
- Origen del layout y mecanismo de lookup: https://huggingface.co/a1rb4Ck/microduck-heist
- Repositorio intermedio con licencia Apache-2.0: https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-94cd-tail
- Pollen Robotics: https://huggingface.co/pollen-robotics
