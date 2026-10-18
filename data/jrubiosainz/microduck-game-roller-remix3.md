# jrubiosainz/microduck-game-roller-remix3

## Resumen

`jrubiosainz/microduck-game-roller-remix3` es una política de control motriz en formato ONNX para el evento "2 m Roller Sprint" de la Microduck Arena de Pollen Robotics. No es un modelo de lenguaje: es una red neuronal pequeña (197.774 pesos y sesgos) que, a partir de un vector de observación de 61 dimensiones, emite consignas articulares para un robot cuadrúpedo simulado que rueda sobre patines a 0,7 m/s de velocidad frontal comandada. Lo publica el usuario jrubiosainz como fine-tuning de `Muhammadsafi/microduck-roller-cpu-remix`.

El interés técnico está en el método de ajuste, no en el tamaño: la red se mantiene congelada y bit a bit idéntica a la de `suraj-phanindra/microduck-roller-hc5-aifund`, y todo el trabajo se hace sobre las tablas de corrección dependientes del tiempo que el wrapper del modelo base añade a las consignas articulares y a la velocidad frontal leída por la red. Las correcciones se buscan con escalada de colinas elitista sobre los cinco seeds oficiales del evento, en MuJoCo 3.10.0 sobre CPU x86-64.

El resultado empata exactamente con el modelo base: 0,928 s de media en el tablero oficial (0,94 / 0,92 / 0,92 / 0,94 / 0,92 s por seed). Es un artefacto de competición, exclusivamente de simulación, con 0 descargas y 0 likes en el momento de la consulta y sin licencia declarada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red de política para control robótico en ONNX; topología interna no documentada en la model card (entrada fija `obs` [1, 61], salida con consignas articulares y `head_roll`) |
| Parámetros totales | 197.774 (pesos y sesgos de la red, heredados sin cambios del modelo base) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible: la entrada es un vector de observación de 61 valores por paso de control; no hay ventana de contexto textual |
| Tipos de cuantización | No disponible; el repositorio solo distribuye `policy.onnx` (831.318 bytes) |
| Idiomas soportados | No disponible; no procesa lenguaje natural |
| Licencia | No disponible |
| Formato de pesos | ONNX (`policy.onnx`, sha256 `1106d337d41bca3db17450012bdb140b7444b38d10964053ed96b66306951038`) |

## Arquitectura y entrenamiento

La política es la red de `suraj-phanindra/microduck-roller-hc5-aifund` (0,940 s en el tablero) conservada bit a bit, junto con su normalizador de entrada, el contador de pasos y todos los operadores. Sobre esa base, el modelo base `Muhammadsafi/microduck-roller-cpu-remix` añade un contador de pasos de control que, en el paso k, suma la fila k de dos tablas: una de offsets sobre las consignas articulares y otra de offsets sobre la velocidad frontal que lee la red. Las tablas actúan desde el paso 0 (dentro del asentamiento no cronometrado de 0,5 s, pasos 0 a 24) hasta el 127, con offsets de velocidad de −0,405 a +0,500 m/s y offsets articulares de hasta 0,76 rad.

Este remix mantiene intacto todo lo anterior hasta el paso 25 (primer paso de carrera) y desde ahí añade correcciones pequeñas: de −0,001 a +0,001 m/s sobre el offset de velocidad frontal y de hasta 0,002 rad sobre las consignas de `left_hip_yaw`, `left_hip_roll`, `left_hip_pitch`, `left_knee`, `left_ankle`, `right_hip_yaw`, `right_hip_roll`, `right_hip_pitch`, `right_knee` y `right_ankle`, de forma simétrica y antisimétrica entre piernas. Las correcciones son lineales a trozos en k, con nudos cada 3 pasos desde el 25 hasta el 73 (aproximadamente 0,96 s de carrera) y constantes después.

Los 221 valores de nudo (17 nudos × 13 canales) se buscaron con escalada de colinas elitista: 24 perturbaciones gaussianas del mejor candidato por generación, con tamaño de paso log-uniforme entre 0,0003 y 0,01, aplicadas a todos los valores o a un ~25 % o ~5 % de ellos al azar, aceptando solo movimientos a un objetivo estrictamente menor. La búsqueda se ejecutó dentro del runner de la Arena (MuJoCo 3.10.0, CPU x86-64) con la red congelada. El objetivo combinaba el tablero sobre los cinco seeds oficiales (contando como siguiente paso un seed que termina a menos de 0,5 ms de un límite de paso de 0,02 s) más penalizaciones por proximidad al límite de paso. Un candidato solo se conservaba si batía el tablero del modelo base (0,932 s con el mismo criterio) y, re-ejecutado 8 veces con ruido σ = 10⁻⁷ en todas las observaciones salvo el contador de pasos, terminaba todos los seeds cada vez con una media de 0,9325 s por debajo del umbral vigente (0,9330 s). El fichero reconstruido desde el normalizador de suraj-phanindra, la red del modelo base y las tablas corregidas es idéntico al publicado.

## Capacidades

- Generación de consignas de control articular a 50 Hz (paso de control de 0,02 s) para un MicroDuck simulado sobre patines.
- Locomoción de sprint en línea recta a 0,7 m/s de velocidad frontal comandada, con velocidad lateral y de guiñada nulas, durante una carrera de 2 m.
- Seguimiento de una consigna de velocidad frontal mediante una tabla de offsets dependiente del paso de control (−0,405 a +0,500 m/s).
- Adaptación temporal fina dentro de la carrera: correcciones lineales a trozos con nudos cada 3 pasos entre el paso 25 y el 73.
- Robustez declarada frente a ruido de observación σ = 10⁻⁷ (8 re-ejecuciones, todos los seeds terminados en todas ellas).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.
- No dispone de capacidades multilingües: no procesa lenguaje natural.

## Casos de uso

- Evaluación de métodos de búsqueda de políticas: el modelo sirve como referencia reproducible de hasta dónde llega una escalada de colinas elitista sobre tablas de corrección con la red congelada, en un entorno MuJoCo determinista y con seeds públicas.
- Baseline en la Microduck Arena: sirve como rival o punto de comparación (0,928 s) para nuevas entradas del evento de 2 m Roller Sprint.
- Estudio de sensibilidad al ruido: los datos de las 8 re-ejecuciones con σ = 10⁻⁷ y la cercanía al límite de paso (0,7 ms frente a 0,4 ms del modelo base) permiten analizar la fragilidad de políticas que se apoyan en márgenes temporales mínimos.
- Docencia de optimización en simulación: ejemplo compacto (831 KB, 197.774 parámetros, CPU) de bucle objetivo-búsqueda-validación con reconstrucción verificable del fichero final.
- Análisis de sobreajuste a seeds: al ser números in-sample sobre los cinco seeds oficiales, es un caso de estudio útil sobre la diferencia entre puntuación de búsqueda y generalización.
- Pruebas de integración de ONNX Runtime en pipelines de robótica simulada: la entrada `obs` [1, 61] y la salida de consignas permiten validar cadenas de inferencia de política dentro de un runner MuJoCo.
- Investigación sobre wrappers stateful: el contador de pasos sobre `head_roll` es un ejemplo de estado oculto en una política sin memoria explícita, útil para estudiar acoplamiento entre observación y acción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de NLP (MMLU, HumanEval, GSM8K) en la información disponible; no aplican a este modelo. Los únicos datos de rendimiento son los tiempos de carrera del evento, a 0,7 m/s de velocidad frontal comandada:

| Seed | microduck-roller-cpu-remix | Este remix |
|---|---|---|
| 1 | 0,94 s | 0,94 s |
| 2 | 0,92 s | 0,92 s |
| 3 | 0,92 s | 0,92 s |
| 4 | 0,94 s | 0,94 s |
| 5 | 0,92 s | 0,92 s |
| **Tablero (media)** | **0,928 s** | **0,928 s** |

Antes del redondeo del runner a pasos de control completos, las ejecuciones de la búsqueda (resolución de 0,1 ms) terminan en 0,9284 / 0,9186 / 0,9178 / 0,9266 / 0,9193 s para este remix, frente a 0,9284 / 0,9182 / 0,9174 / 0,9262 / 0,9196 s del modelo base. El final más ajustado de este remix queda 0,7 ms antes del límite de paso que lo cierra, frente a 0,4 ms del modelo base. Estos resultados son in-sample: la búsqueda puntuó sus candidatos sobre los mismos seeds.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula; el artefacto ONNX ocupa 831.318 bytes y la red tiene 197.774 parámetros, por lo que cabe en cualquier memoria de sistema.
- GPU recomendadas: no se requiere GPU. La búsqueda y la validación se hicieron en CPU x86-64.
- Cabe en hardware de consumo: sí, en cualquier CPU x86-64 moderna; no hay requisito de GPU ni de acelerador.
- Opciones de despliegue: ONNX Runtime para la política, dentro del runner de la Microduck Arena sobre MuJoCo 3.10.0 (x86-64 CPU). No se documentan otras integraciones (vLLM, llama.cpp, Ollama o TGI no aplican).
- Latencia y throughput: el bucle de control corre a 50 Hz (paso de 0,02 s); el tiempo de inferencia por paso no se publica. La carrera completa de 2 m se resuelve en 0,928 s de media en el tablero, con un asentamiento no cronometrado de 0,5 s (pasos 0 a 24).
- Dependencia de estado: el wrapper necesita retroalimentar el contador de pasos a través de `head_roll`, por lo que el despliegue debe reproducir ese acoplamiento para obtener el comportamiento descrito.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada / formato | Tablero (media) | Licencia | Notas |
|---|---|---|---|---|---|
| `jrubiosainz/microduck-game-roller-remix3` (este) | 197.774 | `obs` [1, 61], ONNX | 0,928 s | No disponible | Correcciones de tabla por escalada de colinas elitista desde el paso 25 |
| `Muhammadsafi/microduck-roller-cpu-remix` (base) | No disponible | ONNX | 0,928 s | No disponible | Wrapper con contador de pasos y tablas; búsqueda CMA-ES en CPU |
| `suraj-phanindra/microduck-roller-hc5-aifund` | 197.774 (red idéntica) | ONNX | 0,940 s | No disponible | Red original sin el wrapper de tablas |
| `DenRakEiw/microduck-senate_duck_0928` | No disponible | ONNX | No disponible | No disponible | Modelo base declarado en la card del modelo base |

No se dispone de datos de contexto, idiomas ni benchmarks de propósito general para ninguno de los comparables, ya que todos son políticas de control motriz y no modelos de lenguaje.

## Limitaciones y advertencias

- Solo simulación: el modelo se entrenó y evaluó únicamente en el simulador de la Arena sobre sus cinco seeds oficiales; no se ha probado en hardware. La model card indica explícitamente que no debe cargarse en un MicroDuck físico.
- El contador de pasos se apoya en la consigna `head_roll`, un valor que un robot real no realimentaría bit a bit; el mecanismo no es trasladable a hardware.
- Resultados in-sample: la búsqueda puntuó candidatos sobre los mismos cinco seeds que luego se reportan, igual que las búsquedas elitistas que generaron los modelos de origen; el 0,928 s no es una medida fuera de muestra.
- Margen temporal mínimo: el mejor seed termina 0,7 ms antes del límite de paso que lo cierra, por lo que diferencias de CPU o de redondeo pueden alterar el tablero.
- Resolución de la métrica: los tiempos se redondean a pasos de control completos (0,02 s), de modo que el tablero se mueve en incrementos de 0,004 s; seeds cercanos o distinta CPU pueden dar otros tiempos.
- Licencia no declarada: no hay información sobre condiciones de uso comercial o redistribución.
- Dominio extremadamente estrecho: no genera texto, no razona, no soporta tool calling ni agentes, y no tiene capacidades multilingües ni multimodales.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, y repositorio de 0,0 GB, lo que limita la validación independiente.
- No se documentan sesgos, tasas de alucinación ni comportamiento fuera de la distribución de los cinco seeds oficiales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jrubiosainz/microduck-game-roller-remix3
- Modelo base (fine-tuning): https://huggingface.co/Muhammadsafi/microduck-roller-cpu-remix
- Red original: https://huggingface.co/suraj-phanindra/microduck-roller-hc5-aifund
- Modelo base declarado por el modelo base: https://huggingface.co/DenRakEiw/microduck-senate_duck_0928
- Microduck Arena (Pollen Robotics): https://huggingface.co/spaces/pollen-robotics/microduck-arena
