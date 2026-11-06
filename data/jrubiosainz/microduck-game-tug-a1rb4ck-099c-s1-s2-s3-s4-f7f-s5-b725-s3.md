# jrubiosainz/microduck-game-tug-a1rb4ck-099c-s1-s2-s3-s4-f7f-s5-b725-s3

## Resumen

`jrubiosainz/microduck-game-tug-a1rb4ck-099c-s1-s2-s3-s4-f7f-s5-b725-s3` es una política de control para robots MicroDuck que compite en la disciplina de Tug of War (tira y afloja) de la Microduck Arena, un entorno de evaluación de políticas de refuerzo organizado por Pollen Robotics. No es un modelo de lenguaje: es un artefacto de inferencia en formato ONNX que combina una red neuronal subyacente con una tabla de búsqueda (`L`) de 508 filas que actúa como capa externa de decisión.

El modelo lo publica el usuario jrubiosainz y deriva directamente de la política `a1rb4Ck/microduck-tug` en su revisión `099ced00`, publicada bajo licencia Apache 2.0. La modificación consiste exclusivamente en sustituir doce filas de la tabla `L` (las que gobiernan los pasos 150 a 161 del combate de la semilla 3) por las filas equivalentes de una revisión posterior del autor original (`b725cd39`). No se ha entrenado ninguna red: los pesos de la red subyacente son idénticos byte a byte a los del modelo base.

Su relevancia es acotada pero concreta: documenta una práctica habitual en las competiciones de la Microduck Arena, donde los participantes refinan políticas mediante edición quirúrgica de tablas de búsqueda en lugar de reentrenar, y donde cada mejora marginal en centímetros de arrastre se mide con precisión de coma flotante. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal (no especificada) con tabla de búsqueda externa `L` de 508 filas; grafo ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (observación de 61 valores por paso; 48 usados para el lookup en `L`) |
| Tipos de cuantización | no disponible (pesos en ONNX, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (modelo de control robótico, sin entrada/salida de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`policy.onnx`) |

## Arquitectura y entrenamiento

La arquitectura es un grafo ONNX que encapsula una red neuronal heredada de la política `microduck-tug` de a1rb4Ck, idéntica byte a byte a la de `microduck-heist` del mismo autor, que a su vez se apoya en el walker de juicenv. Sobre esa red se sitúa una capa de lookup `L` que almacena acciones discretas: cuando los primeros 48 de los 61 valores de observación coinciden con una fila almacenada con tolerancia de 1e-7, `L` devuelve la acción guardada; en caso contrario, la red subyacente responde.

No hubo entrenamiento ni búsqueda en esta modificación. El autor declara explícitamente que "no search or training was done for this change, and no network weights were trained or changed". La tabla `L` contiene 508 filas, de las cuales 67 fueron eliminadas y 67 añadidas por el autor respecto a su entrada anterior, y 8 filas provienen de la revisión `f7f7705b` del modelo base. En esta ficha, las filas 460-471 (que gobiernan los pasos 150-161 del combate de la semilla 3) se sustituyen por las filas 330-341 de la revisión `b725cd39`. Las filas 461-471 cambian de observación y las 460-471 de acción, ya que la fila 460 ya contenía la observación de la fila 330 original. El resto de las 496 filas permanecen intactas y en el mismo orden.

## Capacidades

- Control robótico para la disciplina Tug of War de la Microduck Arena: genera acciones motoras a partir de observaciones de 61 valores.
- Decisión híbrida lookup-red: resuelve por tabla cuando la observación coincide (tolerancia 1e-7) y por red neuronal en caso contrario.
- Especialización por semilla: la política contiene secuencias específicas para los combates de las semillas 1 a 5.
- Sin capacidades de generación de texto, razonamiento simbólico, código, matemáticas, visión ni audio.
- Sin soporte de tool calling, function calling ni razonamiento multi-paso.
- Sin capacidades multilingües (no procesa lenguaje).
- Sin modo thinking ni variantes de inferencia extendida.

## Casos de uso

- Evaluación comparativa en la Microduck Arena: la política puede enviarse a la arena de Pollen Robotics para medir su rendimiento en centímetros de arrastre frente a otras entradas, con resultados declarados de 165.63 cm en la semilla 3 y 167.15 cm en la semilla 5.
- Investigación sobre edición de tablas de búsqueda: sirve como caso de estudio reproducible de cómo sustituir filas de una capa de lookup altera el comportamiento de una política sin reentrenar, útil para estudiar sensibilidad y robustez de políticas híbridas.
- Reproducción de experimentos de la comunidad: permite replicar la comparación entre las revisiones `099ced00`, `f7f7705b` y `b725cd39` del modelo base de a1rb4Ck, verificando las diferencias de rendimiento reportadas.
- Benchmark de políticas robóticas ligeras: al ser un artefacto ONNX de tamaño despreciable, puede integrarse en pipelines de evaluación automatizada que ejecuten múltiples políticas sobre las mismas semillas.
- Docencia en aprendizaje por refuerzo aplicado: ilustra la diferencia entre política aprendida (red) y política memorizada (tabla), y cómo se combinan en producción.
- Base para futuras variantes: dado que el autor mantiene una serie de entradas encadenadas (`game-tug-remix`, `game-tug-a1rb4ck-*`), esta ficha puede servir como punto de partida para nuevas modificaciones de la tabla `L`.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados son las distancias de arrastre (en centímetros) por semilla, comparando la entrada anterior con esta ficha:

| Semilla | Filas de | Igual que `099ced00` hasta paso | `099ced00` (cm) | Esta ficha (cm) |
|---|---|---|---|---|
| 1 | nuestra entrada | 89 | 165.88658690452576 | 165.88760018348694 |
| 2 | nuestra entrada | 48 | 165.82584381103516 | 165.97312092781067 |
| 3 | su `b725cd39` | 152 | 165.59808254241943 | 165.62923192977905 |
| 4 | nuestra entrada | 85 | 166.53864979743958 | 166.5420114994049 |
| 5 | nuestra entrada (su `f7f7705b`) | 61 | 167.13708639144897 | 167.15307235717773 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible, lo cual es esperable al tratarse de un modelo de control robótico y no de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 0.0 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquiera con soporte ONNX Runtime; no requiere A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier GPU moderna (RTX 3060 o superior) e incluso en CPU.
- Opciones de despliegue: ONNX Runtime, microduck (librería declarada), integración en la Microduck Arena de Pollen Robotics. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (semilla 3) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Esta ficha (`...-b725-s3`) | no disponible | 61 valores de observación | 165.62923192977905 cm | Apache 2.0 | Hugging Face |
| `a1rb4Ck/microduck-tug` rev. `099ced00` | no disponible | 61 valores de observación | 165.59808254241943 cm | Apache 2.0 | Hugging Face |
| `jrubiosainz/game-tug-a1rb4ck-099c-s1-s2-s3-s4-f7f-s5` | no disponible | 61 valores de observación | 166.23103618621826 cm (run `01M6CGN519G9KJQC9ZFW4K`) | Apache 2.0 | Hugging Face |
| `a1rb4Ck/microduck-tug` rev. `b725cd39` | no disponible | 61 valores de observación | 166.23209476470947 cm (run `01M6CM55RSZJJSG3Z1RQX1`) | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- Especialización extrema: la política está ajustada a las semillas 1 a 5 de la Microduck Arena; su comportamiento fuera de esas condiciones no está documentado.
- Sin generalización demostrada: al no haber entrenamiento, la política no aprende ni se adapta; depende de la coincidencia exacta (tolerancia 1e-7) con las filas de `L` o de la red heredada.
- Sesgos: no aplican sesgos lingüísticos o sociales, pero sí un sesgo de sobreajuste a los combates concretos para los que se diseñó la tabla.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; el riesgo equivalente es la ejecución de acciones memorizadas incorrectas ante observaciones ligeramente distintas.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero exige conservar avisos de copyright y atribución; la cadena de créditos incluye a a1rb4Ck, rumezhak, littlebeanhp, HlibPlakhtii, anhalu, greecree, almuli, juicenv, AndoShy y Pollen Robotics.
- Falta de `manifest.json`: el autor indica que, como el repositorio original, esta entrada no incluye manifiesto, lo que puede complicar la integración con herramientas que lo esperen.
- Documentación dependiente de la model card: la mayoría de los datos técnicos (arquitectura de la red, número de parámetros) no se detallan y deben inferirse del modelo base.
- Repositorio sin tracción: 0 descargas y 0 likes, sin validación independiente por parte de la comunidad.

## Enlaces

- [Hugging Face: jrubiosainz/microduck-game-tug-a1rb4ck-099c-s1-s2-s3-s4-f7f-s5-b725-s3](https://huggingface.co/jrubiosainz/microduck-game-tug-a1rb4ck-099c-s1-s2-s3-s4-f7f-s5-b725-s3)
- [Modelo base: a1rb4Ck/microduck-tug](https://huggingface.co/a1rb4Ck/microduck-tug)
- [Microduck Arena (Pollen Robotics)](https://huggingface.co/spaces/pollen-robotics/microduck-arena)
- [Perfil de a1rb4Ck](https://huggingface.co/a1rb4Ck)
- [Perfil de rumezhak](https://huggingface.co/rumezhak)
- [Perfil de littlebeanhp](https://huggingface.co/littlebeanhp)
- [Perfil de HlibPlakhtii](https://huggingface.co/HlibPlakhtii)
- [Perfil de juicenv](https://huggingface.co/juicenv)
- [Perfil de anhalu](https://huggingface.co/anhalu)
- [Perfil de greecree](https://huggingface.co/greecree)
- [Perfil de almuli](https://huggingface.co/almuli)
- [Perfil de AndoShy](https://huggingface.co/AndoShy)
- [Perfil de jrubiosainz](https://huggingface.co/jrubiosainz)
- [Pollen Robotics (GitHub)](https://github.com/pollen-robotics)
