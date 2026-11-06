# rumezhak/microduck-sock-heist-composite-v5

## Resumen

`rumezhak/microduck-sock-heist-composite-v5` es una entrada de la competición 6 m Sock Heist de la Microduck Arena, un entorno de simulación de robótica organizado por Pollen Robotics. No es un modelo de lenguaje ni un transformer generativo: es un artefacto ONNX que combina una red neuronal de respaldo con una tabla de búsqueda (lookup table) de 1348 filas que reproduce trayectorias de control grabadas para cinco semillas concretas del simulador. El autor, rumezhak, lo presenta como una modificación de su propia entrada anterior composite v4.

El problema que aborda es puramente de optimización en simulación: minimizar el tiempo de recorrido en el escenario Sock Heist sobre las cinco semillas oficiales del runner de la Arena. El resultado declarado es de 4,885 s de media, frente a 4,886 s de `HlibPlakhtii/microduck-sock-heist-quicksilver-v2` y 4,888 s de composite v4. Se trata, por tanto, de una mejora marginal de 1 ms que el propio autor califica de frágil.

La relevancia es muy acotada: sirve como referencia metodológica sobre búsqueda por coordenadas, CMA-ES separable y ajuste fino de secuencias de acciones en un benchmark de robótica simbólica, pero no tiene aplicación fuera del simulador. El autor advierte explícitamente que no debe cargarse en un robot físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo ONNX con red neuronal de respaldo y tablas de búsqueda `L_obs` y `L_act` (mecanismo heredado de a1rb4Ck/microduck-heist) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Sin licencia global declarada; Apache-2.0 solo en las partes que la portan (layout del grafo y mecanismo de lookup de a1rb4Ck) |
| Formato de pesos | ONNX |
| Tamano del repo | 0.0 GB |
| Pipeline | robotics |
| Libreria | microduck |
| Entorno de ejecucion verificado | MuJoCo 3.10.0, onnxruntime 1.24.4, numpy 2.4.1, x86-64 |
| Filas de la tabla de lookup | 1348 |

## Arquitectura y entrenamiento

El modelo no se entrena en el sentido habitual. La arquitectura es un grafo ONNX que, en cada paso de control, consulta una tabla de búsqueda indexada por observación (`L_obs`) y devuelve una acción (`L_act`). Cuando la consulta no encuentra correspondencia, entra en juego una red neuronal de respaldo, que según la model card es la red de `lphatnguyen/microduck-sock-heist-6m-v3`. Respecto a composite v4, solo cambian las tablas `L_obs` y `L_act` (todas las filas reconstruidas, 1348 en lugar de 1349) y el campo de metadatos `modification_notice`; el grafo, la red de respaldo y el resto de tensores son idénticos.

La construcción de las trayectorias combina varias técnicas. El autor partió del análisis de HlibPlakhtii, que mostraba que buscar la semilla más cercana a un múltiplo de 5 ms y aplicar búsqueda por coordenadas sobre las últimas filas cierra huecos en segundos. Sobre las 12 mejores entradas públicas, la semilla más próxima a un límite de 5 ms resultó ser la semilla 2 de su propia secuencia, a 0,29 de paso por encima. Una búsqueda por coordenadas (pasos grandes sobre una sola articulación en los últimos 6 a 32 pasos de control, combinando los que mejoraban) la llevó a 0,125 de paso, y un CMA-ES separable sobre una réplica con reinicio desde snapshot del runner de la Arena (validada contra el scorer oficial en x86-64) la situó por debajo del límite. Las semillas 3 y 5 son secuencias propias; las semillas 1 y 4 provienen de quicksilver-v2 (la 4 incorpora una mejora de jrubiosainz). Las cinco secuencias se reprodujeron en bucle abierto y se grabaron en la nueva tabla de búsqueda con el layout de v4.

## Capacidades

- Ejecución de políticas de control para el escenario 6 m Sock Heist de la Microduck Arena en simulación.
- Reproducción determinista de cinco trayectorias de acción grabadas (una por semilla oficial) sobre el runner de la Arena.
- Consulta por observación mediante tabla de búsqueda, con red neuronal de respaldo para observaciones no cubiertas.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio ni capacidades multilingües.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No es un modelo de propósito general: su comportamiento fuera de las cinco semillas oficiales degrada a la red de respaldo.

## Casos de uso

- Referencia metodológica para optimización de políticas en simulación: sirve para estudiar cómo la búsqueda por coordenadas combinada con CMA-ES separable puede exprimir márgenes de milisegundos en un runner determinista.
- Reproducción de resultados en la Microduck Arena: permite a otros participantes verificar el tiempo de 4,885 s sobre las cinco semillas oficiales usando el runner v5 con MuJoCo 3.10.0 y onnxruntime 1.24.4.
- Análisis de sensibilidad al hardware: el autor documenta que las réplicas son deterministas en x86-64 pero pueden diferir en Mac, lo que lo convierte en un caso de estudio sobre portabilidad numérica de políticas ONNX.
- Estudio de estrategias de lookup frente a redes de respaldo: útil para investigar cuándo una tabla de búsqueda supera a una política neuronal y cómo se degrada el rendimiento fuera de distribución.
- Base para futuras entradas de la competición: cualquier participante puede fusionar las mejores filas por semilla y pulir las colas, como sugiere el propio autor.
- Docencia sobre benchmarking en robótica simulada: ilustra los riesgos del sobreajuste in-sample y la diferencia entre rendimiento en simulador y viabilidad en hardware real.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre las cinco semillas oficiales del runner v5 de la Arena, en x86-64:

| Semilla | composite v4 | quicksilver-v2 (Hlib) | composite v5 |
|---|---|---|---|
| 1 | 4,800 | 4,800 | 4,800 |
| 2 | 5,155 | 5,155 | 5,150 |
| 3 | 4,750 | 4,750 | 4,750 |
| 4 | 4,805 | 4,800 | 4,800 |
| 5 | 4,930 | 4,925 | 4,925 |
| Media | 4,888 | 4,886 | 4,885 |

La puntuación es idéntica a cualquier comando, ya que las claves de búsqueda no incluyen el comando; la Arena lo evalúa a 0,20 m/s. Cinco de cinco semillas finalizadas.

## Requisitos de hardware

- No requiere GPU: la inferencia es un grafo ONNX con consultas a tabla de búsqueda y una red de respaldo de tamano no especificado; el repo ocupa 0.0 GB.
- Entorno de ejecución validado: MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1 sobre x86-64.
- Cabe en cualquier CPU de escritorio; no se han publicado requisitos de VRAM ni de GPU.
- Opciones de despliegue: el runner de la Microduck Arena y la libreria `microduck`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican).
- Latencia y throughput: no disponibles; el único dato temporal es el tiempo de recorrido simulado (4,885 s de media).

## Comparativa con modelos similares

| Modelo | Media (5 semillas) | Semilla 2 | Licencia | Relacion |
|---|---|---|---|---|
| rumezhak/microduck-sock-heist-composite-v5 | 4,885 s | 5,150 | Sin licencia global; Apache-2.0 parcial | Este modelo |
| HlibPlakhtii/microduck-sock-heist-quicksilver-v2 | 4,886 s | 5,155 | No reclama nueva licencia sobre contribuciones upstream | Modelo base del merge |
| rumezhak/microduck-sock-heist-composite-v4 | 4,888 s | 5,155 | Sin licencia declarada | Modelo base del merge |
| lphatnguyen/microduck-sock-heist-6m-v3 | no disponible | no disponible | Sin licencia declarada | Fuente de la red de respaldo |

## Limitaciones y advertencias

- Sobreajuste in-sample: fuera de las cinco semillas oficiales, el archivo se comporta como la red de `lphatnguyen/microduck-sock-heist-6m-v3`; solo las cinco trayectorias grabadas son rápidas.
- Determinismo frágil: las réplicas solo son deterministas en x86-64 con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1; el redondeo de otra CPU puede romper alguna secuencia y en Mac los números difieren y la búsqueda puede fallar.
- Margen mínimo: 1 ms de ventaja es despreciable y cualquier participante que fusione las mejores filas por semilla y pula las colas lo igualará o superará.
- No apto para robot físico: las acciones grabadas quedan muy fuera de lo que se pediría a servos reales; el autor prohíbe explícitamente cargarlo en un MicroDuck.
- Licencia ambigua: el repositorio no está etiquetado como Apache-2.0 en su conjunto; solo el layout del grafo y el mecanismo de lookup de a1rb4Ck portan esa licencia, y las partes sin licencia no se relicencian. Esto complica el uso comercial.
- Falta de consentimiento upstream: el autor no consultó a jrubiosainz, HlibPlakhtii, lphatnguyen ni a1rb4Ck antes de publicar, y se compromete a retirar la entrada si alguno objeta.
- Sin datos de sesgo, alucinación o cobertura idiomática: no aplican al no ser un modelo de lenguaje, pero tampoco se documenta comportamiento fuera del escenario simulado.
- Asistencia de IA declarada en parte de los experimentos, sin detalle del alcance.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-sock-heist-composite-v5
- Modelo base (merge): https://huggingface.co/rumezhak/microduck-sock-heist-composite-v4
- Modelo base (merge): https://huggingface.co/HlibPlakhtii/microduck-sock-heist-quicksilver-v2
- Red de respaldo: https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v3
- Entrada v4 de lphatnguyen: https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v4
- Grafo de lookup (Apache-2.0): https://huggingface.co/a1rb4Ck/microduck-heist
- Mejora de semilla 4: https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-rz-tail-r4
- Microduck Arena (Space): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Pollen Robotics: https://huggingface.co/pollen-robotics
