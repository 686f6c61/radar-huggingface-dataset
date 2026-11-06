# Czs-HF/microduck-sprint-hc5-table

## Resumen

`Czs-HF/microduck-sprint-hc5-table` es un artefacto derivado del modelo `suraj-phanindra/microduck-sprint-hc5-aifund`, publicado en HuggingFace bajo la librería `microduck`. No se trata de un modelo de lenguaje: es una política de control para un robot simulado (MicroDuck) que añade una tabla de pasos y un contador de pasos sobre los pesos congelados de la red original. El autor lo describe explícitamente como una "remix" del modelo base, con pesos idénticos a la política `hc5` publicada y una capa adicional de control discreto.

La relevancia es acotada y experimental: se enmarca en el ecosistema de simulación de MicroDuck y en el benchmark "Arena" con cinco semillas oficiales. El autor reporta una medición local de 0,862 s con éxito 5/5 a una velocidad de 1,15 m/s. No hay información sobre arquitectura de red, número de parámetros ni datos de entrenamiento más allá de la referencia al modelo base.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, tamaño de 0,0 GB y fue creado el 6 de noviembre de 2026. La model card advierte de forma explícita: "Simulation only. Do not load it on a physical MicroDuck."

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control para robot simulado; red base `microduck-sprint-hc5-aifund`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (formato ONNX según tags) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (según tag `onnx`); tamaño de repo 0,0 GB |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna de la red base `suraj-phanindra/microduck-sprint-hc5-aifund`. Por la model card se deduce que se trata de una política de control entrenada para una tarea de locomoción (sprint) sobre el robot simulado MicroDuck, con pesos congelados en este derivado. El artefacto añadido consiste en un contador de pasos sobre `head_roll` y una tabla conjunta de articulaciones y velocidad, buscada sobre las semillas 1 a 5 del entorno "Arena" (cinco semillas oficiales).

No se especifican número de tokens, composición del dataset, ni si hubo RLHF, DPO u otro proceso de alineación. Tampoco se detalla el algoritmo de búsqueda de la tabla (podría ser una búsqueda de hiperparámetros o de política discreta, pero no se confirma). La innovación declarada es la incorporación de una tabla de pasos y velocidad que permite un control discreto sincronizado con la política congelada, validada en cinco semillas con una medición local de 0,862 s y 5/5 éxitos a 1,15 m/s.

## Capacidades

- Control de locomoción (sprint) del robot simulado MicroDuck mediante una política congelada `hc5`.
- Contador de pasos implementado sobre `head_roll`.
- Tabla de articulaciones y velocidad buscada sobre las semillas 1 a 5 del entorno Arena.
- Ejecución en simulación con una métrica reportada de 0,862 s, 5/5 éxitos y 1,15 m/s.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, agentes ni multilingüismo, al no ser un modelo de lenguaje.
- No se documenta soporte de function calling ni de razonamiento multi-paso.

## Casos de uso

- Evaluación de políticas de locomoción en simulación: el artefacto permite reproducir la política `hc5` con una tabla de pasos fija y medir tiempos de recorrido en las cinco semillas oficiales del Arena.
- Benchmarking de control discreto: sirve para comparar el rendimiento de la tabla de pasos frente a la política base sin tabla, usando la métrica de tiempo y tasa de éxito reportada (0,862 s, 5/5).
- Reproducibilidad de experimentos: al fijar semillas 1 a 5 y una tabla de articulaciones y velocidad, facilita la repetición de resultados en entornos simulados.
- Docencia e investigación en robótica simulada: útil como ejemplo de cómo envolver una política congelada con una capa de control discreto sin reentrenar la red.
- Validación de contadores de pasos: el contador sobre `head_roll` puede emplearse para estudiar la sincronización entre la política y el conteo de zancadas en simulación.
- Pruebas de integración en pipelines de simulación: al estar en formato ONNX, puede cargarse en runtimes compatibles para experimentos de inferencia en el bucle de control.
- No debe usarse en un MicroDuck físico: la model card lo prohíbe explícitamente.

## Benchmarks y rendimiento

| Metrica | Valor reportado |
|---|---|
| Tiempo de recorrido (medición local) | 0,862 s |
| Tasa de éxito | 5/5 |
| Velocidad | 1,15 m/s |
| Semillas evaluadas | 1 a 5 (Arena) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio es de 0,0 GB, lo que sugiere un artefacto muy pequeño, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por el tamaño del repo es plausible que quepa en cualquier GPU, pero no hay datos que lo confirmen.
- Opciones de despliegue: formato ONNX según los tags, por lo que podría ejecutarse con ONNX Runtime; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de artefacto).
- Latencia y throughput: solo se reporta el tiempo de recorrido de 0,862 s en simulación; no hay datos de latencia de inferencia por paso.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Czs-HF/microduck-sprint-hc5-table` | Política de control (ONNX) | no disponible | no aplica | 0,862 s, 5/5, 1,15 m/s (medición local) | no disponible | HuggingFace, 0 descargas |
| `suraj-phanindra/microduck-sprint-hc5-aifund` | Política de control (base) | no disponible | no aplica | no disponible en esta ficha | no disponible | HuggingFace (referenciado como base) |
| Otras políticas MicroDuck | no disponible | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Restricción explícita de uso: solo simulación; la model card indica "Do not load it on a physical MicroDuck".
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido.
- Idiomas no aplicables: no es un modelo de lenguaje, por lo que no procede evaluar sesgos lingüísticos ni alucinación textual.
- Sesgos conocidos: no documentados; al ser una política de control, los sesgos relevantes serían de comportamiento en simulación (por ejemplo, sobreajuste a las semillas 1 a 5), pero no se detallan.
- Riesgo de generalización limitada: la tabla de pasos se buscó sobre cinco semillas concretas del Arena, por lo que su comportamiento fuera de ese conjunto no está validado.
- Métricas no reproducibles de forma independiente: el resultado 0,862 s / 5/5 / 1,15 m/s es una medición local del autor, sin protocolo detallado ni código de evaluación publicado en la información disponible.
- Tamaño de repositorio de 0,0 GB y 0 descargas: artefacto experimental sin adopción comunitaria ni validación externa.
- Sin información sobre arquitectura, parámetros ni entrenamiento: difícil de auditar o reutilizar más allá de la inferencia directa.

## Enlaces

- HuggingFace: https://huggingface.co/Czs-HF/microduck-sprint-hc5-table
- Modelo base: https://huggingface.co/suraj-phanindra/microduck-sprint-hc5-aifund
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
