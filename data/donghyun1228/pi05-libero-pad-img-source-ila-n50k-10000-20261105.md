# Donghyun1228/pi05-libero-pad-img-source-ila-n50k-10000-20261105

## Resumen

π0.5 LIBERO PAD vision-head source (n50k, 10k) with the ILA source stage es un checkpoint derivado de π0.5, el modelo de visión-lenguaje-acción (VLA) para robótica de Physical Intelligence, publicado por el usuario Donghyun1228. No se trata de un modelo conversacional ni de un LLM al uso: es un artefacto de investigación orientado a robótica, concretamente a manipulación en el benchmark LIBERO, que incluye pesos de un cabezal de dinámica inversa (IDM) sobre los tokens SigLIP de la cámara base, junto con latentes precalculados y un modelo de dinámica directa.

El repositorio ocupa 13,4 GB y contiene dos directorios: `9999/`, con el preset `pi05_libero_pad_img_source` entrenado con pérdida IL + IDM, learning rate 1e-5, 10.000 actualizaciones y semilla 42, y `ila_source/`, con los latentes de origen (`source_latents.npz`, `forward_model.npz`) generados mediante `scripts/ila_source_latents.py`. El checkpoint se publica solo con `params` y `assets` de normalización; no incluye el `train_state`.

Su relevancia es acotada y experimental: sirve como línea base reproducible para los experimentos PAD e ILA del repositorio `Donghyun1228/vla_adaptation`, documentados en `docs/naive_probe/pad_baseline_20261104.md` e `ila_baseline_20261105.md`. No hay descargas ni likes, y la model card no aporta datos de rendimiento ni de capacidades generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA derivada de π0.5 (transformer visión-lenguaje-acción) con cabezal IDM `TokenPairInverseDynamicsHead` sobre tokens SigLIP de la cámara base |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repo contiene `params` y `assets` de normalización; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo parte de π0.5, un VLA que combina un codificador visual SigLIP con un modelo de lenguaje y un decodificador de acciones. Sobre esa base, este checkpoint añade un cabezal de dinámica inversa (`TokenPairInverseDynamicsHead`) que opera sobre los tokens SigLIP de la cámara base, es decir, aprende a inferir la acción a partir de pares de observaciones visuales. El preset se denomina `pi05_libero_pad_img_source` y combina pérdida de imitación (IL) con la pérdida del IDM.

El entrenamiento se realizó con learning rate 1e-5, 10.000 actualizaciones y semilla 42, según `run/spec.json`. El directorio `ila_source/` contiene los artefactos del denominado "ILA source stage": `source_latents.npz` almacena, para cada una de las 49.600 ventanas del sondeo IDM sobre el conjunto fuente n50k, los latentes z_t y z_{t+10} (media de los tokens de visión de la cámara base, en float32), la acción media del chunk en el paso 0, y la media y desviación típica por dimensión. `forward_model.npz` contiene el modelo de dinámica directa C_fwd entrenado sobre los latentes estandarizados, con métricas de MSE en held-out frente a las líneas base "copy" y "zero" en `forward_model.json`. No se documentan el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Control robótico de manipulación en el entorno LIBERO, heredado del modelo base π0.5.
- Predicción de acciones a partir de observaciones visuales mediante el cabezal IDM sobre tokens SigLIP.
- Modelado de dinámica directa en el espacio de latentes visuales (`forward_model.npz`).
- Extracción de latentes visuales agregados (media de tokens de visión) para ventanas temporales de 10 pasos.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multilingüismo.
- No se documentan modos especiales (thinking, visión general, audio) más allá del uso robótico previsto.

## Casos de uso

- Reproducción de líneas base PAD: el checkpoint permite replicar el experimento `pad_baseline_20261104.md` del repositorio `vla_adaptation` con la misma semilla (42) y el mismo número de actualizaciones (10.000).
- Reproducción de líneas base ILA: junto con `ila_source/`, permite regenerar los latentes de origen y el modelo de dinámica directa descritos en `ila_baseline_20261105.md`.
- Investigación en dinámica inversa visual: el cabezal IDM sobre tokens SigLIP sirve para estudiar hasta qué punto la acción es inferible a partir de pares de observaciones de la cámara base.
- Análisis de dinámica en espacio latente: `forward_model.npz` y `source_latents.npz` permiten comparar modelos de dinámica directa contra las líneas base copy y zero usando el MSE en held-out.
- Evaluación comparativa de métodos de adaptación: al ser una fuente congelada, sirve como punto de partida frente a variantes de adaptación en el mismo benchmark LIBERO.
- Estudio de normalización de acciones: los `assets` de normalización incluidos permiten analizar el efecto de la estandarización por dimensión sobre las acciones del chunk.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona métricas de MSE en held-out del modelo de dinámica directa frente a las líneas base copy y zero, recogidas en `forward_model.json`, sin cifras en el texto disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repo (13,4 GB) incluye pesos, latentes y assets, pero no se desglosa la huella de los parámetros.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no documentadas; el ecosistema de referencia es `openpi` (etiqueta del repo), no vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 LIBERO PAD vision-head source (este) | VLA derivado de π0.5 con cabezal IDM | no disponible | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| π0.5 base (Physical Intelligence) | VLA | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| OpenVLA | VLA | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |

No se dispone de datos verificables de parámetros, contexto ni rendimiento de las alternativas en la información proporcionada; la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Checkpoint de investigación sin métricas publicadas de éxito en tareas; no apto para producción sin evaluación propia.
- El repositorio no incluye `train_state`, por lo que no es posible reanudar el entrenamiento desde este artefacto.
- Solo contiene `params` y `assets` de normalización; el formato exacto de los pesos no se especifica.
- Uso restringido de facto al benchmark LIBERO y al pipeline `openpi`; no se documentan capacidades generales de lenguaje ni multilingües.
- Sin descargas ni likes: no hay evidencia de validación por parte de la comunidad.
- Riesgo de sobreajuste al conjunto fuente n50k y a la semilla 42; los resultados pueden no generalizar.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación de robustez y de sesgos desaconseja ese uso sin auditoría previa.
- No se documentan sesgos conocidos, riesgos de alucinación textual ni limitaciones de contexto o idioma.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-pad-img-source-ila-n50k-10000-20261105
- Repositorio de experimentos referenciado: `Donghyun1228/vla_adaptation` (documentos `docs/naive_probe/pad_baseline_20261104.md` y `docs/naive_probe/ila_baseline_20261105.md`)
- Script de generación de latentes: `scripts/ila_source_latents.py` (dentro del repositorio de experimentos)
- No se han encontrado en la información proporcionada enlaces a papers, blogs, demos ni repositorios adicionales.
