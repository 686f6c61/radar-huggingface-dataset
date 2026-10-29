# HlibPlakhtii/microduck-tug-quicksilver-v3

## Resumen

`microduck-tug-quicksilver-v3` no es un modelo de lenguaje, sino una política de control robótico en formato ONNX para la competición de simulación "tug" del robot Microduck, el bípedo de 25 cm y 15 motores desarrollado por Pollen Robotics y Hugging Face. Publicado por HlibPlakhtii, se trata de un "remix" (finetune declarado) de `rumezhak/microduck-tug-remix-leader6`, que a su vez deriva de `quicksilver-tug-v1`.

El modelo no modifica la red heredada: conserva íntegros el grafo, las rutas de rating y la red de enfrentamientos del modelo base, y añade una tabla de búsqueda por observación exacta que superpone un final localmente optimizado para la semilla oficial 1, buscado con CMA-ES separable. Con ello, la manga de la semilla 1 mejora de 164,27878737 a 164,28495646 cm, manteniendo cinco victorias en el pit y una media de cinco mangas de 164,32566404 cm en el evaluador Arena sin modificar (MuJoCo 3.10.0, ONNX Runtime 1.24.4).

Su relevancia es de nicho: sirve como pieza de competición verificable y como ejemplo documentado de técnicas de búsqueda evolutiva sobre políticas de RL, pero explícitamente no es un controlador de locomoción general ni una política para robot real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (política de control en ONNX; conserva el grafo completo del modelo base) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable (no es un modelo de lenguaje) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplicable (política de robótica, no procesa lenguaje natural) |
| Licencia | No disponible |
| Formato de pesos | ONNX |
| Librería | microduck |
| Pipeline | robotics |
| Tamaño del repositorio | 0,0 GB |
| Modelo base | rumezhak/microduck-tug-remix-leader6 (finetune) |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-29 |

## Arquitectura y entrenamiento

Este artefacto no se ha entrenado desde cero. Según la model card, conserva "el grafo completo, las rutas de rating y la red de enfrentamientos" del modelo base `rumezhak/microduck-tug-remix-leader6`, y los autores declaran explícitamente que no entrenaron la red heredada. La innovación del remix es un mecanismo de *exact-observation lookup*: compara los primeros 48 valores de observación con una secuencia registrada dentro de una tolerancia de 1e-7 y, si hay coincidencia, sustituye el tramo final (a partir de la llamada de acción 155) por una secuencia de acciones buscada localmente; si no hay coincidencia, se usa el grafo completo del modelo upstream.

La búsqueda del nuevo tramo final empleó CMA-ES separable con 80 generaciones, población de 48 y paso inicial de 0,03. El repositorio incluye el código de búsqueda, la configuración, las acciones, los metadatos de la fuente fijada y los cinco resultados de verificación. Los autores declaran que no se modificaron el simulador, la física, el árbitro ni los datos del leaderboard. Como contexto del ecosistema, la prensa especializada indica que las políticas de Microduck se entrenan con aprendizaje por refuerzo en MuJoCo, aunque los detalles de entrenamiento de esta red concreta no están disponibles.

## Capacidades

- Política de control para el juego de simulación "tug" del robot bípedo Microduck, ejecutable en el evaluador Arena (verificada con MuJoCo 3.10.0 y ONNX Runtime 1.24.4).
- Reproduce el comportamiento del modelo base en cuatro de las cinco mangas oficiales y mejora la manga de la semilla 1 mediante la superposición del tramo final optimizado.
- Emparejamiento determinista de observaciones: compara las primeras 48 observaciones con tolerancia 1e-7 y hace *fallback* al grafo upstream si no hay coincidencia.
- Distribución en ONNX, con código de búsqueda, configuración, acciones, metadatos de origen y cinco resultados de verificación incluidos.
- No proporciona: generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, agentes ni capacidades multilingües; tampoco es un controlador de locomoción general ni una política para robot físico real.

## Casos de uso

- Participación en la competición de simulación tug de Microduck: el modelo se envía tal cual al servidor de la competición; los autores recuerdan que el resultado del servidor es el autorizado.
- Punto de partida para nuevas remezclas: al conservar el grafo y los metadatos de la fuente fijada, otros participantes pueden aplicar búsquedas locales (CMA-ES u otros optimizadores) sobre otras semillas oficiales.
- Verificación de reproducibilidad: los cinco resultados de verificación incluidos permiten comprobar que una réplica local (runner 5, MuJoCo 3.10.0, ONNX Runtime 1.24.4) reproduce las mangas declaradas.
- Docencia e investigación en RL aplicado a robótica: caso de estudio realista de sobreajuste in-sample a estados iniciales concretos y de técnicas de *lookup* por coincidencia exacta de observaciones.
- Estudio de optimización evolutiva: ejemplo completo y documentado de CMA-ES separable (80 generaciones, población 48, paso inicial 0,03) aplicado a un tramo final de una política de control.
- Prueba de carga ligera para inferencia ONNX: al ser un artefacto de tamaño ~0 GB, sirve para validar instalaciones y versiones de ONNX Runtime en entornos sin GPU.
- Análisis comparativo dentro del ecosistema microduck: la conservación de las rutas de rating y la red de enfrentamientos facilita estudiar el impacto aislado de un cambio local sobre la clasificación.

## Benchmarks y rendimiento

No se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K, etc.); no son aplicables a una política de robótica. Los únicos datos disponibles son los resultados de la competición de simulación, declarados in-sample por los propios autores:

| Métrica | Valor |
|---|---|
| Media de las cinco mangas (distancia) | 164.32566404 cm |
| Manga seed 1 con el modelo base | 164.27878737 cm |
| Manga seed 1 con este remix | 164.28495646 cm |
| Victoria en el pit (seed 1) | 2,82 s |
| Mangas ganadas en el pit | 5 de 5 |
| Mangas restantes | Reproducen el modelo base sin cambios |
| Entorno de evaluación | Arena (runner 5), MuJoCo 3.10.0, ONNX Runtime 1.24.4 |

Los autores subrayan que son resultados in-sample sobre las salidas oficiales declaradas, sensibles a la reproducción en coma flotante.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio registrado en Hugging Face es de 0,0 GB, lo que indica un artefacto muy pequeño, pero no hay cifras publicadas de consumo de memoria.
- GPU recomendadas: no disponible; no hay evidencia de que se requiera GPU. Al tratarse de una política ONNX diminuta, la inferencia en CPU con ONNX Runtime (la verificación usó la versión 1.24.4) es el escenario natural.
- Consumer GPUs: no aplicable según la información disponible; no se necesita GPU para ejecutar el artefacto según los datos publicados.
- Despliegue: ONNX Runtime como runtime de referencia; librería `microduck` (Pollen Robotics) y el simulador del Space `pollen-robotics/microduck-simulator` como entorno de evaluación. Los stacks habituales de LLM (vLLM, llama.cpp, Ollama, TGI) no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; el único dato temporal publicado es la victoria en el pit de la seed 1 en 2,82 s dentro del simulador.

## Comparativa con modelos similares

No existen políticas tug públicas documentadas en la información disponible más allá del propio linaje de este modelo; la comparación se limita a su ascendencia directa. No es comparable con modelos de lenguaje.

| Modelo | Relación | Cambios sobre el grafo | Resultado declarado | Formato |
|---|---|---|---|---|
| HlibPlakhtii/microduck-tug-quicksilver-v3 | Este modelo | Grafo base intacto; añade lookup exacto para la seed 1 (CMA-ES separable, 80 generaciones) | Media de 5 mangas: 164.32566404 cm; 5 victorias en el pit | ONNX |
| rumezhak/microduck-tug-remix-leader6 | Modelo base (finetune) | Remix de quicksilver-tug-v1; grafo, ratings y enfrentamientos heredados | Seed 1: 164.27878737 cm; el resto de mangas coincide con este remix | ONNX |
| quicksilver-tug-v1 | Origen del linaje | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Resultados estrictamente in-sample sobre las salidas oficiales declaradas; el rendimiento fuera de esas semillas no está garantizado.
- Sensibilidad a la reproducción en coma flotante: el lookup solo se activa si las primeras 48 observaciones coinciden dentro de 1e-7; cualquier desviación hace *fallback* al grafo upstream, por lo que el resultado puede variar entre versiones de MuJoCo, ONNX Runtime o hardware.
- No es un controlador de locomoción general ni una política para robot real; su ámbito es la competición de simulación.
- Los autores no entrenaron la red heredada y no han verificado de forma independiente su rendimiento en las copas semanales; el resultado del servidor de la competición es el único autorizado.
- Licencia no disponible: las condiciones de uso, redistribución y explotación comercial son desconocidas y deben aclararse antes de cualquier reutilización.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la ficha.
- Sesgos y alucinaciones: no aplicables por no ser un modelo generativo de lenguaje; el riesgo análogo es el sobreajuste a estados iniciales concretos mediante la superposición de acciones.
- Punto positivo declarado: no se modificaron el simulador, la física, el árbitro ni los datos del leaderboard, algo que conviene verificar al reutilizar el enfoque en otras remezclas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HlibPlakhtii/microduck-tug-quicksilver-v3
- Modelo base (commit fijado): https://huggingface.co/rumezhak/microduck-tug-remix-leader6/tree/87ccc5c6cf5e57b3fdb80bce0eae958ecd743200
- Simulador Microduck Sandbox (Space de pollen-robotics): https://huggingface.co/spaces/pollen-robotics/microduck-simulator
- Repositorio GitHub de Microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Noticia de lanzamiento (Yahoo Tech): https://tech.yahoo.com/ai/meta-ai/articles/hugging-face-debuts-microduck-adorable-100004194.html
- Análisis del robot (CNX Software): https://www.cnx-software.com/2026/08/28/microduck-a-duck-like-biped-robot-designed-for-physical-ai-experimentation-and-fun/
- Noticia (MarkTechPost): https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
