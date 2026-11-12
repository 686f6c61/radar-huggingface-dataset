# Donghyun1228/pi05-libero-ila-data-scale-n300000-20261111

## Resumen

El modelo `Donghyun1228/pi05-libero-ila-data-scale-n300000-20261111` es un checkpoint de investigación publicado en Hugging Face por el usuario Donghyun1228. Se trata de un artefacto experimental derivado de π0.5 (pi05), un modelo de visión-lenguaje-acción (VLA) orientado a robótica, sobre el que se ha aplicado la técnica ILA (Implicit Latent Adaptation, Yoneda et al., RSS 2022) en la cabeza del codificador visual PAD. El objetivo del experimento es estudiar el escalado de datos de sondeo (*probing data*): se emplean 300.000 fotogramas de sondeo por entorno, tanto en la fase fuente como en la de adaptación.

El repositorio no contiene un modelo listo para inferencia general, sino un conjunto de checkpoints y registros de un experimento de adaptación de dominio sobre el benchmark robótico LIBERO. La model card indica explícitamente que el checkpoint fuente de este tamaño no se aloja en Hugging Face (se movió a un PC de laboratorio) y que `source/` solo conserva la etapa fuente de ILA y los logs. Tampoco se incluye el `train_state`.

Por su naturaleza, esta ficha debe leerse como documentación de un artefacto de investigación reproducible, no como la de un modelo de propósito general. La información pública disponible es muy limitada: no se declaran licencia, idiomas, pipeline ni resultados de benchmarks en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA π0.5 (pi05) con adaptación ILA sobre la cabeza del codificador visual PAD; no se detalla la arquitectura interna en la información disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repo contiene checkpoints y `SHA256SUMS`; el tamaño total es de 17,4 GB) |

## Arquitectura y entrenamiento

El modelo parte de π0.5 (pi05) aplicado a LIBERO, un benchmark de manipulación robótica. Sobre la cabeza del codificador visual PAD se aplica ILA (Yoneda et al., RSS 2022). El proceso descrito en la model card consta de dos etapas: una etapa fuente, denominada `pi05_libero_pad_img_source`, que combina aprendizaje por imitación (IL) con una cabeza IDM, entrenada con tasa de aprendizaje 1e-5 durante 10.000 pasos sobre 300.000 fotogramas de sondeo por entorno; y una etapa de adaptación, con objetivos `pi05_libero_ila_img_{view,yaw}_adapt`, que utiliza pasos de encoder con RMSProp manteniendo congelados la cabeza IDM, el modelo forward y el crítico WGAN, durante 10.000 pasos sobre 300.000 fotogramas de sondeo objetivo.

La evaluación se realizó con semilla 7 en OSMesa sobre 2.000 episodios, en la ruta `<shift>/eval_seed7`. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- El artefacto está orientado a experimentación en adaptación de dominio para políticas VLA robóticas sobre LIBERO.
- No se documentan capacidades de generación de texto, razonamiento, código o matemáticas en la información disponible.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües.
- No se documentan modos especiales (thinking mode, visión, audio) más allá del uso de un codificador visual PAD en el pipeline VLA.
- El repositorio incluye checkpoints de las etapas fuente y de adaptación, junto con logs y un archivo `SHA256SUMS` para verificación de integridad.

## Casos de uso

- Reproducción de experimentos de escalado de datos de sondeo: el checkpoint permite replicar la comparación entre 300.000 fotogramas por entorno y otras escalas del estudio ILA sobre π0.5.
- Investigación en adaptación de dominio para robótica: sirve para analizar cómo se comporta la cabeza PAD de π0.5 cuando se adapta con ILA manteniendo congelados el modelo forward, la cabeza IDM y el crítico WGAN.
- Evaluación comparativa en LIBERO: el conjunto de checkpoints y la ruta de evaluación con semilla 7 permiten reproducir los 2.000 episodios en OSMesa y contrastar resultados entre configuraciones.
- Estudio de técnicas de regularización adversarial: la presencia de un crítico WGAN en la etapa de adaptación permite investigar su efecto sobre la estabilidad del entrenamiento.
- Auditoría de artefactos de investigación: el archivo `SHA256SUMS` y los logs permiten verificar la integridad de los checkpoints y trazar el proceso experimental.
- Base para experimentos derivados: investigadores que trabajen con π0.5 y LIBERO pueden usar estos pesos como punto de partida para nuevas variantes de ILA o de adaptación visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se documentan vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput estimados: no disponible.
- El repositorio ocupa 17,4 GB, lo que da una idea del espacio en disco necesario para alojar los checkpoints, pero no de los requisitos de cómputo.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La model card no declara licencia, por lo que el uso comercial queda sin regularizar explícitamente y debe consultarse con el autor.
- No se incluye `train_state`, lo que limita la reanudación exacta del entrenamiento.
- El checkpoint fuente de este tamaño no está alojado en Hugging Face; solo se conservan la etapa fuente de ILA y los logs en `source/`.
- No se documentan sesgos conocidos, riesgo de alucinación ni limitaciones de contexto o idioma.
- Es un artefacto de investigación sobre un benchmark concreto (LIBERO) y no un modelo de propósito general; su uso fuera de ese dominio no está validado.
- La ausencia de pipeline, idiomas y parámetros declarados dificulta su integración en producción sin trabajo adicional de inspección.
- La fecha de creación del repositorio (2026-11-12) y el nombre del experimento (2026-11-11) deben tenerse en cuenta al contextualizar la versión.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-ila-data-scale-n300000-20261111
- Código: https://github.com/Donghyun1228/vla_adaptation
- Referencia ILA: Yoneda et al., RSS 2022 (no se proporciona URL directa en la información disponible)
- Referencia π0.5 (pi05): no disponible en la información proporcionada
- Referencia LIBERO: no disponible en la información proporcionada
