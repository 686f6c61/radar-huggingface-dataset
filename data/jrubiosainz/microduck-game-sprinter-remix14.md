# jrubiosainz/microduck-game-sprinter-remix14

## Resumen

`jrubiosainz/microduck-game-sprinter-remix14` es una política de control para robotica simulada publicada en Hugging Face por el usuario jrubiosainz. Se trata de un derivado por fine-tuning (en la practica, una extension por capas de lookup) del modelo `nikghodki/microduck-sprint-lookup-v1`, orientado a la prueba de 2 metros de sprint dentro de la Microduck Arena de Pollen Robotics. El modelo no es un LLM ni un modelo generativo de texto: es una política neuronal exportada a ONNX que produce acciones articulares para un robot cuadrupedo simulado (MicroDuck).

La relevancia tecnica es acotada y muy especifica: el autor anade una capa de lookup adicional sobre el fichero base para mejorar marginalmente el tiempo de una de las cinco semillas oficiales de la Arena (de 0,820 s a 0,815 s en la semilla 5), manteniendo el resto de semillas identicas byte a byte. El resultado es una mejora de 0,001 s en la media de las cinco semillas (0,817 s), obtenida mediante busqueda open-loop con sep-CMA-ES sobre los objetivos articulares de los pasos tardios del control.

Se trata de un artefacto de competicion, no de un modelo de proposito general. El propio autor advierte que las cifras son in-sample, que la politica es fragil frente a variaciones de redondeo en coma flotante entre maquinas y que no debe cargarse en un robot fisico. La licencia es Apache-2.0 y el formato de pesos es exclusivamente ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de politica (operadores ONNX) con capas de lookup por observacion exacta; arquitectura interna no detallada en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (politica de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en ONNX, sin variantes cuantizadas publicadas) |
| Idiomas soportados | no aplica (modelo de robotica) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`, 945.212 bytes, sha256 `82511390f098acf28aafcaa074a4093a1a1e8b8df2d7763dd3735f1719ab502c`) |

## Arquitectura y entrenamiento

El modelo es una politica de control para el cuadrupedo simulado MicroDuck, construida sobre la red de a1rb4Ck (con pesos de marcha atribuidos a suraj-phanindra) y sobre la que se han apilado capas de lookup de observacion exacta. En concreto, el fichero base de nikghodki contiene tres capas de lookup (`L_`, `search_`, `T_r2_s4_`) en las que una capa posterior sobrescribe a una anterior cuando su observacion almacenada coincide exactamente. Este remix anade una cuarta capa con los inicializadores `jr_s5_obs` y `jr_s5_act`, copiando mascara, tolerancia y ejes de `T_r2_s4_`.

La capa nueva contiene 30 filas correspondientes a los pasos de control 36 a 65 de la semilla 5. Hasta el paso 35 la carrera es identica a la de nikghodki accion por accion; a partir del paso 36 la capa reproduce una secuencia buscada en abierto. Esa secuencia se obtuvo con sep-CMA-ES sobre offsets aditivos por paso a los 14 objetivos articulares de los pasos tardios (desde el paso 26 en adelante, sin tocar los pasos de asentamiento), evaluando cada candidato en el runner de la Arena en modo open-loop y repartiendo la computacion entre varias maquinas CPU. Algunas ejecuciones partieron de una tabla con entradas en saturacion de servo desplazadas al borde, mediante un port del normalizador de objetivos publico de HlibPlakhtii.

No hay entrenamiento neuronal nuevo: los operadores e inicializadores del modelo base se conservan byte a byte. La unica adicion es la tabla de lookup y su logica de coincidencia exacta. El modelo se construyo y verifico en una VM Linux x86-64, con reconstruccion independiente de las filas en otra maquina y comprobacion byte a byte del `policy.onnx` resultante.

## Capacidades

- Control locomotor de sprint de 2 metros para el cuadrupedo simulado MicroDuck en la Microduck Arena (version 5 del runner, velocidad de referencia 0,2 m/s).
- Reproduccion determinista de trayectorias mediante lookup de observacion exacta: si la observacion coincide bit a bit con una fila almacenada, se emite la accion guardada; en caso contrario, se delega en la red.
- Mejora puntual de la semilla 5 (de 0,820 s a 0,815 s) manteniendo el comportamiento del modelo base en las semillas 1 a 4 y en las semillas 6 a 60.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Participacion en la prueba de 2 m Sprint de la Microduck Arena: el modelo puede enviarse como entrada a la competicion y evaluarse con el runner oficial en las cinco semillas puntuadas, donde obtiene una media de 0,817 s.
- Estudio de tecnicas de lookup sobre politicas de control: sirve como ejemplo didactico de como apilar capas de observacion exacta sobre una red existente sin reentrenar, conservando los operadores originales byte a byte.
- Reproduccion de experimentos de busqueda open-loop: el autor documenta el uso de sep-CMA-ES sobre offsets aditivos a objetivos articulares, lo que permite replicar la metodologia en otros controladores de la misma familia.
- Analisis de robustez numerica: el modelo ilustra como el redondeo en coma flotante entre maquinas puede romper la coincidencia exacta de una capa de lookup y devolver el control a la red subyacente, un caso util para estudiar fragilidad en sistemas de control con tablas.
- Benchmarking de politicas de sprint en simulacion: permite comparar tiempos por semilla frente al modelo base y frente a otros derivados de la cadena quicksilver/remix en el mismo runner.
- Docencia sobre creditos y linaje de modelos: la model card detalla la cadena de atribuciones (a1rb4Ck, suraj-phanindra, HlibPlakhtii, rumezhak, nikghodki, jrubiosainz), lo que lo convierte en un caso practico de trazabilidad de licencias Apache-2.0 en modelos derivados.

## Benchmarks y rendimiento

Los unicos datos publicados son los tiempos por semilla en el runner de la Arena (version 5, x86-64 Linux, 0,2 m/s), comparando el modelo base con este remix:

| Semilla | nikghodki/microduck-sprint-lookup-v1 | Este modelo |
|---|---|---|
| 1 | 0,815 s | 0,815 s (fichero de nikghodki, sin cambios) |
| 2 | 0,815 s | 0,815 s (fichero de nikghodki, sin cambios) |
| 3 | 0,825 s | 0,825 s (fichero de nikghodki, sin cambios) |
| 4 | 0,815 s | 0,815 s (fichero de nikghodki, sin cambios) |
| 5 | 0,820 s | 0,815 s (carrera de nikghodki hasta el paso 35, luego secuencia buscada) |
| Media | 0,818 s | 0,817 s |

En las semillas oficiales 6 a 60 (las 55 que la Arena no puntua) todas las carreras son identicas a las del modelo base, tanto en estado como en tiempo. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no aplican a este tipo de modelo.

## Requisitos de hardware

- Inferencia via runtime ONNX; el fichero `policy.onnx` ocupa 945.212 bytes, por lo que el modelo cabe holgadamente en cualquier CPU moderna.
- No requiere GPU: el autor ejecuto las evaluaciones en una VM Linux x86-64 y repartio la busqueda entre varias maquinas CPU.
- VRAM estimada: practicamente nula; el modelo se ejecuta en CPU. No se dispone de cifras de VRAM para GPU.
- GPU recomendadas: no aplica; cualquier GPU con soporte ONNX Runtime podria ejecutarlo, pero no es necesario.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, etc.) e incluso en hardware integrado, aunque no se han publicado mediciones en GPU.
- Opciones de despliegue: ONNX Runtime y el runner oficial de la Microduck Arena (`microduck-challenges`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El autor solo reporta tiempos de carrera en simulacion (0,815-0,825 s por sprint de 2 m), no latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (media 5 semillas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jrubiosainz/microduck-game-sprinter-remix14 | no disponible | no aplica | 0,817 s | Apache-2.0 | Hugging Face |
| nikghodki/microduck-sprint-lookup-v1 | no disponible | no aplica | 0,818 s | Apache-2.0 | Hugging Face |
| HlibPlakhtii/microduck-sprint-quicksilver-v2 | no disponible | no aplica | no disponible en la informacion proporcionada | Apache-2.0 | Hugging Face |
| rumezhak/sprint-remix-leader6 | no disponible | no aplica | no disponible en la informacion proporcionada | Apache-2.0 | Hugging Face |

La comparacion se limita a la familia de derivados de la Microduck Arena citados en la model card. No se dispone de datos de rendimiento de quicksilver-v2 ni de sprint-remix-leader6 en la informacion proporcionada, solo de su papel como ancestros en la cadena de derivacion.

## Limitaciones y advertencias

- Las cifras son in-sample: las capas de lookup solo reproducen las carreras de las cinco semillas oficiales, por lo que la mejora no es evidencia de una politica de marcha mejor.
- Fragilidad numerica: la coincidencia de lookup exige observacion bit a bit; el redondeo en coma flotante de otra maquina puede romper la reproduccion y devolver esa semilla a la red, perdiendo la mejora.
- Verificado unicamente en x86-64 Linux; no hay validacion en otras plataformas.
- No apto para robot fisico: las acciones tardias estan muy fuera de lo que un servo real podria ejecutar. El autor prohibe explicitamente cargarlo en un MicroDuck fisico.
- Modelo de simulacion: entrenado y evaluado solo en el simulador de la Arena.
- Sin capacidades de lenguaje, razonamiento, codigo ni vision; no debe evaluarse con benchmarks de LLM.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no aplica (no es un modelo generativo de texto).
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo conserva obligaciones de atribucion sobre el linaje de derivados (nikghodki, HlibPlakhtii, rumezhak, a1rb4Ck, suraj-phanindra). Se conservan `NOTICE` y `LICENSE`, y el `NOTICE` registra el cambio.
- El autor indica que un asistente de IA participo en la busqueda, la grabacion y la redaccion de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix14
- Modelo base: https://huggingface.co/nikghodki/microduck-sprint-lookup-v1 (commit `e963635b00c76db3d00381b434c8396315045145`)
- Ancestro quicksilver-v2: https://huggingface.co/HlibPlakhtii/microduck-sprint-quicksilver-v2 (commit `4aaf5619`)
- Microduck Arena: https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Perfil del autor: https://huggingface.co/jrubiosainz
- Perfil de nikghodki: https://huggingface.co/nikghodki
- Perfil de HlibPlakhtii: https://huggingface.co/HlibPlakhtii
- Perfil de rumezhak: https://huggingface.co/rumezhak
- Perfil de a1rb4Ck: https://huggingface.co/a1rb4Ck
- Perfil de suraj-phanindra: https://huggingface.co/suraj-phanindra
- Pollen Robotics: https://huggingface.co/pollen-robotics
