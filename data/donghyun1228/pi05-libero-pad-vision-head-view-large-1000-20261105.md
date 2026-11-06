# Donghyun1228/pi05-libero-pad-vision-head-view-large-1000-20261105

## Resumen

π0.5 LIBERO view_large PAD baseline es un checkpoint de robótica derivado del modelo vision-language-action (VLA) π0.5, publicado por el usuario Donghyun1228 dentro del repositorio de investigación `vla_adaptation`. No se trata de un modelo de lenguaje generalista, sino de un artefacto experimental de adaptación de dominio: parte del checkpoint `pi05-libero-pad-vision-head-source-n50k-10000-20261104` (paso 9999) y aplica un ajuste fino restringido exclusivamente al codificador visual PaliGemma/img mediante una pérdida IDM (inverse dynamics modeling) sobre una sonda de soporte `view_large` con 50 000 muestras.

El objetivo del experimento es medir hasta qué punto adaptar solo la torre visual —manteniendo congelados el cabezal IDM, el LLM y el experto de acciones— mejora la política de manipulación en el benchmark LIBERO. El resultado reportado es de 289 aciertos sobre 2000 episodios (14,45 % de éxito), evaluado con 500 episodios por suite, semilla de entorno 7, evaluador congelado `kn_b200` y MuJoCo 3.2.3.

El checkpoint es relevante como referencia reproducible de la fila PAD del artículo, no como modelo listo para producción: el repo ocupa 15,7 GB, no tiene descargas ni interacciones y su política de evaluación exportada prescinde del cabezal IDM, usando únicamente la torre visual adaptada junto con la cámara de muñeca.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en π0.5 (vision-language-action); codificador visual PaliGemma/img, LLM y experto de acciones |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a control robótico) |
| Licencia | Apache 2.0 |
| Formato de pesos | `params`, `train_state` y `assets` (normalización) en el directorio `999/`; política exportada en `policy/` con `export.json` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π0.5 (openpi), un VLA que combina un codificador visual PaliGemma, un LLM y un experto de acciones. En este checkpoint concreto solo se entrena el codificador visual (`PaliGemma/img`) con la pérdida IDM sobre la sonda de soporte `view_large` (n50k); el cabezal IDM, el LLM y el experto de acciones permanecen en el estado del modelo fuente. El índice de pinza (índice 6) se excluye de la pérdida IDM.

El procedimiento de ajuste usa AdamW con LR pico de 5e-5 (500 pasos de warmup y después constante), batch de 32, 1000 actualizaciones y semilla 42. El preset de entrenamiento es `pi05_libero_pad_img_view_adapt` del repositorio `vla_adaptation` (commit `7b74d01d`), con la especificación completa de argumentos en `run/spec.json`. La inicialización parte del paso 9999 del checkpoint fuente `pi05-libero-pad-vision-head-source-n50k-10000-20261104`.

## Capacidades

- Control robótico de manipulación en el benchmark LIBERO mediante política VLA.
- Adaptación de dominio restringida al codificador visual, preservando el resto de componentes del modelo fuente.
- Evaluación con cámara de muñeca usando la torre visual adaptada, según `export.json`.
- Integración con el ecosistema openpi y el formato de checkpoint `params`/`train_state`/`assets`.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multilingüismo en la información disponible.

## Casos de uso

- Reproducción de la fila PAD del artículo: el checkpoint permite replicar el resultado de 14,45 % de éxito en LIBERO con la configuración exacta (semilla 7, evaluador `kn_b200`, MuJoCo 3.2.3).
- Estudio de adaptación parcial: sirve para analizar el efecto de ajustar solo la torre visual frente a ajustar el modelo completo, manteniendo congelados LLM y experto de acciones.
- Línea base en experimentos de VLA: útil como referencia cuantitativa para comparar nuevas estrategias de adaptación sobre el mismo benchmark y presupuesto de 1000 actualizaciones.
- Auditoría de evaluación: el fichero `run/evaluation_audit.json` con los recuentos por suite permite verificar la metodología de éxito por tarea.
- Investigación en representaciones visuales para robótica: la pérdida IDM sobre la sonda `view_large` (n50k) se puede reutilizar para estudiar qué información dinámica captura el codificador visual.
- Docencia y divulgación: ejemplo reproducible de pipeline de ajuste fino con openpi, con preset, semilla y argumentos documentados.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| LIBERO (500 episodios por suite, env seed 7, evaluador `kn_b200`, MuJoCo 3.2.3) | Tasa de éxito | 289/2000 = 14,45 % |

No se han publicado en la información disponible resultados adicionales de MMLU, HumanEval, GSM8K ni comparativas numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ecosistema openpi (checkpoint en formato `params`/`train_state`/`assets`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Tamaño del repositorio: 15,7 GB, lo que condiciona el espacio en disco necesario para descargar pesos y estado de entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento LIBERO | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 LIBERO view_large PAD baseline (este) | no disponible | no disponible | 14,45 % (289/2000) | Apache 2.0 | Hugging Face, 0 descargas |
| π0.5 LIBERO source (`pi05-libero-pad-vision-head-source-n50k-10000-20261104`) | no disponible | no disponible | no disponible | Apache 2.0 (presumible, no confirmado) | Hugging Face |
| Otros modelos VLA para LIBERO | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la información proporcionada para establecer una comparativa numérica con alternativas de la misma categoría.

## Limitaciones y advertencias

- El rendimiento reportado es bajo (14,45 % de éxito en LIBERO), por lo que no es adecuado como política desplegable sin ajuste adicional.
- El alcance del ajuste es muy restringido: solo se adapta el codificador visual; el resto del modelo queda en el estado fuente, lo que limita la mejora esperada.
- La evaluación se realizó con una configuración concreta (semilla 7, evaluador `kn_b200`, MuJoCo 3.2.3, 500 episodios por suite); los resultados pueden no transferirse a otros entornos o semillas.
- No hay información sobre sesgos, alucinación o comportamiento fuera de distribución en robótica real.
- El repositorio no registra descargas ni interacciones, por lo que no existe validación externa de los resultados.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones de los componentes subyacentes (π0.5, PaliGemma) antes de un uso comercial.
- El tamaño del repo (15,7 GB) y la ausencia de formatos cuantizados documentados complican el despliegue en hardware limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-pad-vision-head-view-large-1000-20261105
- Checkpoint fuente: https://huggingface.co/Donghyun1228/pi05-libero-pad-vision-head-source-n50k-10000-20261104
- Repositorio de código del autor: `Donghyun1228/vla_adaptation` (commit `7b74d01d`), preset `pi05_libero_pad_img_view_adapt`
- Ecosistema openpi: no disponible en la información proporcionada
- Artículo (paper) asociado: no disponible en la información proporcionada
