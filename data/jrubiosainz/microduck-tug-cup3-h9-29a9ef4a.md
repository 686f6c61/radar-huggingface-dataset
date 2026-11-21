# jrubiosainz/microduck-tug-cup3-h9-29a9ef4a

## Resumen

`microduck-tug-cup3-h9-29a9ef4a` es una política de control para robótica publicada por el usuario jrubiosainz en Hugging Face dentro del ecosistema Microduck Arena, en la modalidad Tug of War (tira y afloja). No es un modelo de lenguaje: es un artefacto de inferencia orientado a simulación, exportado en formato ONNX y etiquetado con el pipeline `robotics`. Su repo tiene un tamaño declarado de 0.0 GB y el binario de política referenciado ocupa 1.045.628 bytes (aproximadamente 1 MB), lo que da una idea de su escala: es una política compacta, no una red neuronal de gran tamaño.

El modelo es un *merge* de tres entradas previas: `jrubiosainz/microduck-tug-cup3-p10g-3a94031b` (referida como P10G), `suraj-phanindra/microduck-tug-hc9-aifund` y `SSH111111/microduck-tug-p10`. Según la model card, se parte de la red de respaldo de P10G (que a su vez es la de `SSH111111/microduck-tug-p10`, sin cambios) y se modifican 51 filas de una tabla de búsqueda (*lookup*). El resultado reproduce en los semillas 1 a 5 la trayectoria de `tug-hc9-aifund` en el marcador público, con un remate obtenido de una búsqueda CMA-ES propia realizada la noche del 20 al 21 de noviembre de 2026.

La relevancia es acotada y muy específica: se trata de una entrada de competición con una puntuación declarada de 168,97823572158813 en el evaluador oficial, verificada mediante una réplica local en x86 (runner-5) documentada en `x86-replay-receipt.json`. El interés técnico está en la metodología de *merging* selectivo de tablas de búsqueda y en la reproducibilidad bit a bit del evaluador, no en capacidades generales de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control para simulación, exportada a ONNX; se describe como red de respaldo con tabla de búsqueda de 51 filas modificadas) |
| Parametros totales | no disponible (el binario de política ocupa 1.045.628 bytes) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible (la model card indica explícitamente "No blanket licence is asserted") |
| Formato de pesos | ONNX (tag `onnx`); política con SHA-256 `29a9ef4ad45dd1be7825e31766a8d9d2a7805177140fa33a54bed14c2725d4fa` |

## Arquitectura y entrenamiento

La información disponible no describe una arquitectura de transformer ni de red neuronal convencional. La model card indica que la entrada se construye a partir de la red de respaldo de P10G (procedente de `SSH111111/microduck-tug-p10`, sin cambios) con 51 filas de una tabla de búsqueda (*lookup*) modificadas. Esto sugiere una política híbrida en la que una parte del comportamiento se resuelve mediante una red y otra mediante una tabla de consulta indexada, aunque no se detalla la estructura interna, el número de capas ni las dimensiones.

El "entrenamiento" declarado consiste en una búsqueda CMA-ES por semilla ejecutada la noche del 20 al 21 de noviembre de 2026 para generar el remate de cada trayectoria. No se documentan volúmenes de datos, composición del dataset, ni fases de RLHF o DPO. La validación se realizó con el evaluador oficial en un host x86 (runner-5), con réplica bit a bit de las puntuaciones públicas por semilla de `tug-hc9-aifund` y de P10G, según el recibo `x86-replay-receipt.json`.

## Capacidades

- Control de política en simulación para la modalidad Tug of War de Microduck Arena (exclusivamente simulación; la model card indica "Simulation only").
- Reproducción de trayectorias por semilla: en las semillas 1, 2, 3, 4 y 5 ejecuta la trayectoria de `suraj-phanindra/microduck-tug-hc9-aifund` en el marcador, con un remate propio.
- Ejecución determinista verificable: el SHA-256 de la política y el recibo de réplica permiten comprobar integridad y resultados.
- Inferencia vía ONNX, lo que permite desplegarla con runtimes ONNX estándar.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, capacidades de agente ni multilingüismo.

## Casos de uso

- Evaluación de políticas en Microduck Arena: la entrada se puede cargar en el evaluador oficial para reproducir la puntuación declarada (168,97823572158813) y comparar contra el marcador público por semilla.
- Investigación sobre *model merging* de tablas de búsqueda: sirve como caso de estudio de cómo modificar 51 filas de una tabla de lookup sobre una red de respaldo fija y medir el efecto en cinco semillas.
- Verificación de reproducibilidad: el recibo `x86-replay-receipt.json` y el SHA-256 permiten auditar que una ejecución local en x86 con runner-5 coincide bit a bit con los resultados publicados.
- Búsqueda de hiperparámetros con CMA-ES: el flujo documentado (red de respaldo más búsqueda por semilla para el remate) es replicable como plantilla para optimizar políticas de control en entornos simulados.
- Despliegue en pipelines ONNX: al estar exportada a ONNX, puede integrarse en un runner de inferencia estándar para experimentos de robótica simulada sin dependencias de frameworks de lenguaje.
- Docencia y divulgación sobre competiciones de robótica simulada: el artefacto es pequeño (1 MB de política) y fácil de inspeccionar, lo que facilita explicar el ciclo completo de evaluación, marcador y réplica.

## Benchmarks y rendimiento

Resultados declarados en la model card con el evaluador oficial (réplica local en x86, runner-5). La puntuación global es 168,97823572158813 (`0x1.51f4db5000000p+7`), con cinco `pit_won`.

| Semilla | Esta entrada | suraj-phanindra tug-hc9-aifund (marcador) | P10G (marcador) |
|---|---|---|---|
| 1 | 169,04293298721313 | 169,0427839756012 | 169,0427839756012 |
| 2 | 169,0845549106598 | 169,08355951309204 | 169,0822422504425 |
| 3 | 168,7562346458435 | 168,7367856502533 | 168,73663663864136 |
| 4 | 169,45884823799133 | 169,45868134498596 | 169,45866346359253 |
| 5 | 168,5486078262329 | 168,54780912399292 | 168,54780912399292 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es coherente con la naturaleza del artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el binario de política ocupa 1.045.628 bytes, por lo que el requisito de memoria es muy reducido en comparación con modelos de lenguaje.
- GPU recomendadas: no disponibles. El artefacto está pensado para ejecutarse en simulación; la validación documentada se hizo en un host x86 (runner-5), no en GPU.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; por tamaño del binario no debería ser un impedimento, pero no se documenta.
- Opciones de despliegue: runtime ONNX (formato de pesos `onnx`, tag `onnx`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Puntuación declarada | Semillas evaluadas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-tug-cup3-h9-29a9ef4a (esta entrada) | Política ONNX para Tug of War | 168,97823572158813 | 1-5 | no disponible | Hugging Face |
| suraj-phanindra/microduck-tug-hc9-aifund | Política ONNX para Tug of War | resultados por semilla en marcador (169,0427839756012; 169,08355951309204; 168,7367856502533; 169,45868134498596; 168,54780912399292) | 1-5 | no disponible | Hugging Face |
| jrubiosainz/microduck-tug-cup3-p10g-3a94031b (P10G) | Política ONNX para Tug of War | resultados por semilla en marcador (169,0427839756012; 169,0822422504425; 168,73663663864136; 169,45866346359253; 168,54780912399292) | 1-5 | no disponible | Hugging Face |
| SSH111111/microduck-tug-p10 | Política ONNX para Tug of War (red de respaldo) | no disponible | no disponible | no disponible | Hugging Face |

La comparativa se limita al ecosistema Microduck Tug of War, ya que no se dispone de información sobre modelos equivalentes fuera de él. Esta entrada supera a `tug-hc9-aifund` en las semillas 1, 2, 3, 4 y 5, y ninguna ejecución del marcador alcanza su puntuación, según la model card.

## Limitaciones y advertencias

- Uso exclusivamente en simulación: la model card indica "Simulation only"; no hay evidencia de validez en hardware físico.
- No es un modelo de lenguaje ni un modelo multimodal: no genera texto, no razona, no escribe código y no procesa imágenes o audio.
- Licencia no disponible: la model card declara "No blanket licence is asserted", por lo que no se puede asumir permiso para uso comercial; es necesario contactar con el autor.
- Idiomas no disponibles: no aplica, pero la ausencia de declaración impide cualquier afirmación al respecto.
- Riesgo de sobreajuste a semillas: los resultados se declaran para las semillas 1 a 5; no hay datos sobre generalización a semillas no vistas.
- Dependencia de la tabla de búsqueda: al tratarse de una red de respaldo con 51 filas de lookup modificadas, el comportamiento fuera de las trayectorias cubiertas puede degradarse de forma no documentada.
- Reproducibilidad condicionada al runner: la réplica bit a bit se documenta para el runner-5 en x86; otros runners o plataformas pueden no reproducir los mismos valores.
- Sin métricas de benchmarks estándar ni comparativas fuera del ecosistema Microduck, lo que limita la evaluación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jrubiosainz/microduck-tug-cup3-h9-29a9ef4a
- Modelo base P10G: https://huggingface.co/jrubiosainz/microduck-tug-cup3-p10g-3a94031b
- Modelo base tug-hc9-aifund: https://huggingface.co/suraj-phanindra/microduck-tug-hc9-aifund
- Modelo base tug-p10: https://huggingface.co/SSH111111/microduck-tug-p10
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
