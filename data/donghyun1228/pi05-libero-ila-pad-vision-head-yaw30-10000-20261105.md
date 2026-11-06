# Donghyun1228/pi05-libero-ila-pad-vision-head-yaw30-10000-20261105

## Resumen

π0.5 LIBERO yaw30 es un checkpoint de investigación en robótica publicado por Donghyun1228 dentro de la familia de modelos π0.5 de openpi (Physical Intelligence). Se trata de un modelo visión-lenguaje-acción (VLA) derivado de π0.5, adaptado a las tareas del benchmark LIBERO, y entrenado con una receta concreta de adaptación de dominio denominada ILA (Invariance through Latent Alignment, Yoneda et al., RSS 2022) aplicada sobre la cabeza de codificador visual PAD. El modelo no es un modelo de lenguaje generalista, sino un artefacto de investigación para manipulación robótica de mesa.

El objetivo del checkpoint es servir como fila "ILA baseline" de la tabla LIBERO de un estudio comparativo de adaptación VLA. Solo se adapta el codificador visual (PaliGemma/img), mientras que la cabeza IDM, el LLM y el experto de acción permanecen congelados en el estado fuente. El entrenamiento se realizó con 10 000 actualizaciones objetivo y batch 32, guardando los pasos 999 y 9999.

La relevancia es acotada: es un modelo de nicho para reproducibilidad de experimentos de adaptación de representaciones visuales en políticas robóticas. Su rendimiento medido en LIBERO es de 451/2000 episodios exitosos (22,55 %), lo que lo sitúa como una línea base de investigación, no como un modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en π0.5 (openpi) con codificador visual PaliGemma/img, cabeza IDM y experto de acción; adaptación ILA sobre el codificador visual |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (repo con `params`, `train_state`, `assets` y `ila/critic_9999.npz`) |

## Arquitectura y entrenamiento

El modelo parte de π0.5 en su configuración para LIBERO y se inicializa desde el checkpoint fuente `Donghyun1228/pi05-libero-pad-img-source-ila-n50k-10000-20261105` (paso 9999 de la etapa fuente, con buffer latente de 49 600 ventanas y modelo de dinámica directa preentrenado). La adaptación ILA congela la cabeza IDM, el LLM y el experto de acción, y solo permite que se actualice el codificador visual. Cada iteración consta de cinco actualizaciones del crítico WGAN (recorte de pesos 0,01, RMSProp 1e-5) sobre el latente agrupado de la cámara base, un paso adversarial del codificador (RMSProp 1e-5) y un paso del codificador de dinámica (RMSProp 1e-6) sobre la pérdida de la cabeza IDM congelada (excluyendo el índice de gripper 6) más el MSE del modelo de dinámica directa congelado.

El entrenamiento usó batch 32 y semilla 42, con 10 000 actualizaciones y guardado en los pasos 999 y 9999. La política de evaluación (`policy/`) corresponde al paso 9999 sin la cabeza IDM, y la torre de visión de la cámara de muñeca emplea el codificador visual adaptado. La evaluación se realizó con 500 episodios por suite, semilla de entorno 7, evaluador nvidia_h100 con renderizado OSMesa y MuJoCo 3.2.3.

## Capacidades

- Control robótico de manipulación de mesa en el benchmark LIBERO (cuatro suites, 500 episodios cada una).
- Política visión-lenguaje-acción: procesa observaciones visuales (cámara base y cámara de muñeca) e instrucciones para producir acciones.
- Adaptación de dominio del codificador visual mediante ILA, orientada a invariancia de representación latente.
- No se documentan capacidades de tool calling, agentes multi-paso, matemáticas, código ni generación de texto general.
- Capacidades multilingües: no disponibles.
- No dispone de modo "thinking", visión general, audio ni otras capacidades fuera del dominio robótico.

## Casos de uso

- Reproducción de la línea base ILA: permite replicar la fila ILA de la tabla LIBERO del paper de referencia usando el preset `pi05_libero_ila_img_yaw_adapt` y el argv registrado en `run/spec.json`.
- Estudio de adaptación de codificadores visuales: sirve para comparar la receta ILA (crítico WGAN + paso adversarial + dinámica) frente a otras estrategias de ajuste del codificador visual en políticas VLA.
- Evaluación controlada en LIBERO: con 500 episodios por suite y semilla fija, es útil para medir varianza de políticas robóticas en entornos simulados MuJoCo.
- Análisis de invariancia latente: el crítico guardado (`ila/critic_9999.npz`) permite inspeccionar la alineación de representaciones entre dominios fuente y objetivo.
- Investigación sobre congelación selectiva: al mantener fijos LLM, experto de acción y cabeza IDM, facilita aislar el efecto de adaptar solo la torre visual.
- Punto de partida para ablaciones: los checkpoints en los pasos 999 y 9999 permiten estudiar la evolución del rendimiento con el número de actualizaciones (21,65 % frente a 22,55 %).
- Docencia e investigación en VLA: ejemplo completo de pipeline openpi con evaluación reproducible en H100 y renderizado OSMesa.

## Benchmarks y rendimiento

| Benchmark | Configuracion | Resultado |
|---|---|---|
| LIBERO (4 suites, 500 episodios/suite, env seed 7) | Paso 9999, sin cabeza IDM, torre visual adaptada | 451/2000 = 22,55 % de éxito |
| LIBERO (misma configuracion) | Paso 1000 | 433/2000 = 21,65 % de éxito |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 13,0 GB, lo que da una cota inferior del espacio en disco necesario.
- GPU recomendadas: la evaluación oficial se realizó en nvidia_h100 con renderizado OSMesa.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el ecosistema openpi (preset `pi05_libero_ila_img_yaw_adapt`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Dependencias de evaluación: MuJoCo 3.2.3 y OSMesa para renderizado sin pantalla.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento LIBERO | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 LIBERO yaw30 (este) | no disponible | no disponible | 22,55 % (451/2000) | apache-2.0 | Hugging Face |
| π0.5 LIBERO fuente (`pi05-libero-pad-img-source-ila-n50k-10000-20261105`) | no disponible | no disponible | no disponible | apache-2.0 (presumible) | Hugging Face |
| π0.5 base (openpi) | no disponible | no disponible | no disponible | no disponible | openpi |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento bajo en términos absolutos: 22,55 % de éxito en LIBERO indica que la política falla en la mayoría de episodios; no es apta para producción.
- Modelo de investigación: diseñado como línea base de ablación, no como política desplegable.
- Solo se adapta el codificador visual; el resto del modelo queda congelado en el estado fuente, lo que limita la mejora obtenida.
- Dominio restringido a manipulación de mesa en LIBERO simulado; no se documenta transferencia a robots reales.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: no aplicable en el sentido de texto general; en robótica se traduce en acciones erróneas no detectadas.
- Idiomas soportados: no disponibles; el modelo no es un generador de texto multilingüe.
- Licencia apache-2.0 permite uso comercial del artefacto, pero el rendimiento y el dominio hacen inviable ese uso sin trabajo adicional.
- Requiere el stack openpi, MuJoCo 3.2.3 y renderizado OSMesa; la reproducibilidad depende de la semilla de entorno 7 y de la configuración exacta registrada en `run/spec.json`.
- El checkpoint de evaluación excluye la cabeza IDM; usar el checkpoint completo para inferencia puede dar resultados distintos.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-ila-pad-vision-head-yaw30-10000-20261105
- Checkpoint fuente: https://huggingface.co/Donghyun1228/pi05-libero-pad-img-source-ila-n50k-10000-20261105
- Paper ILA (Yoneda et al., RSS 2022): no disponible en la informacion proporcionada
- Repositorio de código `Donghyun1228/vla_adaptation` (commit `1b67b86b`): no disponible como URL en la informacion proporcionada
- Documentación interna `docs/naive_probe/ila_baseline_20261105.md`: no disponible como URL
- openpi (Physical Intelligence): no disponible en la informacion proporcionada
