# LuxiaSL/kotodama-energy-routing

## Resumen

kotodama energy-routing es una colección de checkpoints de entrenamiento publicada por LuxiaSL en el repositorio de código abierto kotodama (anima-research). No se trata de un modelo final pulido ni de un asistente conversacional, sino de un conjunto de artefactos experimentales que documentan la aplicación de una técnica denominada *energy routing* sobre la arquitectura Block Attention Residuals. El objetivo es sustituir el softmax único de cada punto de enrutamiento por unos pocos pasos de refinamiento en forma cerrada sobre una energía de bajo rango aprendida, de modo que cada sitio pueda ponderar cómo se relacionan sus fuentes entre sí y no solo cuánto encaja cada una con una consulta fija.

Todos los experimentos comparten la forma de kotodama-tsumugi-1b: 1.400 millones de parámetros, una pila de 20 capas de bloque ejecutada dos veces (72 capas efectivas) y el mismo orden de datos. El repositorio ocupa 89,9 GB e incluye pesos en bf16, estados completos de entrenamiento (modelo, optimizador, planificador y posición de datos) y versiones comprimidas con zstd. La licencia es Apache 2.0.

Su relevancia es fundamentalmente investigadora: permite reproducir, bifurcar y comparar recetas de enrutamiento por energía frente a controles sin enrutamiento, con semillas y puntos de bifurcación documentados. No hay pipeline declarado, ni idiomas especificados, ni descargas o interacciones registradas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Block Attention Residuals y enrutamiento por energía (energy routing) sobre softmax; pila de 20 capas de bloque ejecutada dos veces |
| Parametros totales | 1,4 mil millones (forma de kotodama-tsumugi-1b) |
| Parametros activos | no disponible (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se publican en bf16; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (PyTorch): `weights/step_*.pt` en bf16, `anchors/step_*.pt` con estado completo y `step_*.pt.zst` comprimido con zstd |

## Arquitectura y entrenamiento

La arquitectura parte de kotodama-tsumugi-1b: 1.400 millones de parámetros organizados en 20 capas de bloque que se ejecutan dos veces, lo que da 72 capas efectivas, con Block Attention Residuals como mecanismo de conexión residual sobre la atención. La innovación central es el *energy routing*: en cada sitio de enrutamiento se reemplaza el softmax único por dos pasos de refinamiento en forma cerrada sobre una energía de bajo rango aprendida (rango 32 en la configuración citada), de modo que el sitio puede modelar las relaciones entre sus fuentes además de su afinidad con una consulta fija. La funcionalidad es opcional en kotodama y se activa con `--attn_res_energy_steps 2 --attn_res_energy_rank 32`, con una implementación Triton disponible mediante `--attn_res_energy_impl fused`.

Los datos de entrenamiento no se detallan en la información disponible (no se especifica número total de tokens del corpus, composición del dataset ni si hubo RLHF o DPO). Lo que sí se documenta es la organización de las ejecuciones: `t48-tsumugi-energy-s17` entrena con la receta propia de tsumugi, semilla 17 y tasa de aprendizaje constante hasta 40.000 millones de tokens; las ramas `-s2000`, `-s4768` y `-s9536` aplican enfriamientos de la tasa de aprendizaje bifurcados a 4.200, 10.000 y 20.000 millones de tokens; `moonshot-shapeA-s17-branch-s9536` es el control con el enfriamiento propio de tsumugi bifurcado a 20.000 millones; la escalera `t46-tshape-energyroute-i45` a `-i48` entrena con receta de escalera de 4.000 millones de tokens y semillas de inicialización 45 a 48; y `t40-tshape-fitted-i45` a `-i48` son los controles equivalentes sin enrutamiento por energía. La carga de pesos se realiza con `kotodama.eval.model_loader.load_model(path, config_section="1b-tsumugi")`, que lee los campos de enrutamiento por energía desde el checkpoint.

## Capacidades

- Generación de texto autoregresiva propia de un modelo de lenguaje de 1,4 mil millones de parámetros, sujeta a la validación empírica de cada checkpoint.
- Razonamiento y codificación: capacidades esperables por tamaño y arquitectura, pero no verificadas con benchmarks en la información disponible.
- Enrutamiento por energía configurable en los sitios de atención residual, con pasos de refinamiento y rango ajustables.
- Reanudación y bifurcación de entrenamiento: los archivos `anchors/` incluyen modelo, optimizador, planificador y posición de datos.
- Compatibilidad con la ruta Triton fusionada para el cálculo de energía (`--attn_res_energy_impl fused`).
- Soporte de tool calling, agentes, modo thinking, visión o audio: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).

## Casos de uso

- Investigación en mecanismos de enrutamiento: comparar los checkpoints con enrutamiento por energía (`t46-tshape-energyroute-i45` a `-i48`) frente a los controles sin enrutamiento (`t40-tshape-fitted-i45` a `-i48`) con las mismas semillas para aislar el efecto de la técnica.
- Reproducción de recetas de entrenamiento: usar `anchors/step_*.pt` para reanudar exactamente desde una posición de datos y un estado de optimizador concretos, lo que permite verificar resultados de forma determinista.
- Estudio de enfriamientos de tasa de aprendizaje: las ramas bifurcadas a 4.200, 10.000 y 20.000 millones de tokens permiten analizar el impacto del cooldown en la convergencia sin repetir el preentrenamiento completo.
- Desarrollo sobre kotodama: servir como banco de pruebas para nuevas implementaciones del enrutador, incluida la ruta Triton fusionada, antes de escalar a modelos mayores.
- Ajuste fino posterior: los pesos en bf16 de 1,4 mil millones de parámetros son un punto de partida manejable para experimentos de fine-tuning con recursos moderados.
- Docencia y divulgación técnica: ilustrar cómo se estructura un repositorio de checkpoints experimentales con pesos, estados completos y controles claramente etiquetados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2,8 GB solo para pesos (1,4 mil millones de parámetros a 2 bytes), más memoria para activaciones y caché KV, que no se documenta.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con al menos 8 GB de VRAM debería alojar los pesos en bf16, pero no se confirma en la información proporcionada.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 8 GB o más, si bien la longitud de contexto y el uso de memoria real no están documentados.
- Opciones de despliegue: la carga oficial es mediante el cargador de kotodama (`kotodama.eval.model_loader.load_model`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.
- Almacenamiento: el repositorio completo ocupa 89,9 GB, por lo que conviene descargar solo las carpetas necesarias.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enrutamiento por energia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kotodama energy-routing (este) | 1,4 mil millones | no disponible | Sí (experimental) | Apache 2.0 | Checkpoints en Hugging Face |
| kotodama-tsumugi-1b | 1,4 mil millones | no disponible | No (receta base) | no disponible en la información | Hugging Face |
| Alternativas de ~1,4B de propósito general | ~1,4 mil millones | no disponible | No | variable | no disponible |

La comparación directa más pertinente es con kotodama-tsumugi-1b, del que este repositorio hereda forma y orden de datos, y con los propios controles internos del repositorio (`t40-tshape-fitted-i45` a `-i48`), que constituyen la referencia sin enrutamiento por energía.

## Limitaciones y advertencias

- No es un modelo listo para producción: son checkpoints de experimentos de entrenamiento, no un modelo final ajustado ni evaluado.
- No se han publicado benchmarks, por lo que se desconoce su calidad real en tareas downstream.
- No se declaran idiomas soportados ni composición del dataset, lo que impide evaluar sesgos y cobertura lingüística.
- Riesgo de alucinación inherente a un modelo de lenguaje de 1,4 mil millones de parámetros sin ajuste por preferencias documentado.
- La longitud de contexto no está especificada, lo que limita la planificación de despliegues con ventanas largas.
- El repositorio es grande (89,9 GB) y contiene estados de entrenamiento completos; descargarlo entero puede no ser necesario.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la ausencia de evaluación hace desaconsejable su uso directo en entornos productivos sin validación previa.
- El soporte de herramientas de inferencia de terceros (vLLM, llama.cpp, Ollama, TGI) no está documentado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LuxiaSL/kotodama-energy-routing
- Modelo base de referencia: https://huggingface.co/LuxiaSL/kotodama-tsumugi-1b
- Código de kotodama: https://github.com/anima-research/kotodama
