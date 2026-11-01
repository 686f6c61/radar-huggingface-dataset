# cyttic/hmt-htrvt-photo2-s42

## Resumen

`cyttic/hmt-htrvt-photo2-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) entrenado con arquitectura de tipo CTC y publicado por el grupo cyttic. Forma parte de un estudio de aumentación de datos denominado `htr-metrics-transfer` (oleada 1), en el que se cruzan distintas arquitecturas y estrategias de aumento de imagen para medir su transferencia a métricas de reconocimiento. Este checkpoint concreto corresponde a la variante de arquitectura `htrvt` con el aumento `photo2` y la semilla 42.

El modelo está especializado en hebreo (`he`) y se ha entrenado sobre el split de entrenamiento de `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo. Con 13,8 millones de parámetros y un peso de repositorio de 0,1 GB, es un modelo compacto pensado para evaluación comparativa más que para despliegue generalista. Su relevancia es acotada: sirve como referencia reproducible dentro de un estudio de ablación sobre aumentación de datos en HTR.

La model card reporta un CER de 0,0639 y un WER de 0,2846 sobre el conjunto de test HHD Option-B con decodificación greedy y sin modelo de lenguaje. No se documentan detalles de arquitectura interna, composición del dataset ni proceso de entrenamiento más allá de la configuración del experimento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CTC (reconocimiento de texto manuscrito, variante `htrvt`); detalles internos no disponibles |
| Parametros totales | 13.821.574 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una cabeza CTC (*Connectionist Temporal Classification*) para el reconocimiento de secuencias manuscritas, una elección habitual en HTR porque evita la necesidad de alineamientos explícitos entre imagen y transcripción. La etiqueta `htrvt` identifica la variante arquitectónica dentro del estudio, pero la model card no desglosa el codificador visual, el número de capas ni el mecanismo de atención empleado.

El entrenamiento se realizó sobre el split de train de `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para el conjunto de desarrollo, con el aumento de datos `photo2` y la semilla 42. Se trata de un experimento de ablación controlado: la variable independiente es la estrategia de aumentación y el resto de la configuración se mantiene fija entre checkpoints de la misma oleada. No se documentan el volumen de tokens, la composición del corpus, ni si hubo etapas de ajuste fino adicionales.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes de línea o página.
- Decodificación CTC greedy, sin modelo de lenguaje externo en la configuración evaluada.
- Salida de transcripción a nivel de carácter, apta para el cálculo de CER y WER.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- No dispone de modo *thinking*, visión general, audio ni capacidades multimodales más allá de la entrada de imagen propia del HTR.
- Cobertura monolingüe: únicamente hebreo.

## Casos de uso

- Evaluación comparativa de aumentación de datos: sirve como checkpoint de referencia para medir cómo el aumento `photo2` afecta al CER y al WER frente a otras variantes del estudio `htr-metrics-transfer`.
- Reproducción de experimentos: al fijar la semilla 42 y publicar `results.json`, permite replicar la métrica reportada y auditar la metodología del estudio.
- Digitalización de manuscritos hebreos en entornos controlados: puede transcribir líneas o páginas manuscritas cuando el dominio de entrada se aproxima al corpus HHD.
- Investigación en HTR de bajo coste: con 13,8 M de parámetros, es viable ejecutarlo en CPU o en GPU de gama baja para prototipos académicos.
- Generación de transcripciones para anotación asistida: las salidas del modelo pueden servir como preanotación que un revisor humano corrige después, dado su WER de 0,2846.
- Base para *fine-tuning* en otras colecciones manuscritas hebreas: el checkpoint puede actuar como inicialización en dominios con pocos datos etiquetados.
- Docencia y formación: ejemplo compacto y reproducible de un pipeline CTC aplicado a reconocimiento de escritura.

## Benchmarks y rendimiento

| Benchmark | Configuracion | CER | WER |
|---|---|---|---|
| HHD Option-B test | Decodificacion greedy, sin LM | 0,0639 | 0,2846 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no son aplicables a un modelo de HTR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa, dado el tamaño de 13,8 M de parámetros y el peso de repositorio de 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; no requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier RTX, GTX o incluso en iGPU modernas.
- Ejecución en CPU: viable para inferencia por lotes pequeños, aunque el rendimiento dependerá del codificador de imagen no documentado.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; al ser un modelo CTC de HTR, el despliegue habitual sería mediante PyTorch o un runtime ONNX propio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (HHD Option-B) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-htrvt-photo2-s42 | 13,8 M | no disponible | 0,0639 | MIT | HuggingFace |
| Otras variantes `hmt-*` del estudio `htr-metrics-transfer` | no disponible | no disponible | no disponible | MIT (presumible) | HuggingFace (serie cyttic) |
| Modelos HTR generalistas (p. ej. TrOCR, Kraken) | no disponible | no disponible | no disponible | variable | HuggingFace / GitHub |

No se dispone de datos comparativos verificados con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: solo reconoce hebreo manuscrito; no es un modelo de propósito general.
- WER de 0,2846 implica un porcentaje elevado de errores a nivel de palabra; requiere revisión humana en producción.
- Métricas reportadas sin modelo de lenguaje; el rendimiento en un pipeline con LM podría diferir.
- Entrenado sobre un único corpus (`hhd-optionb-split`); riesgo de sobreajuste al dominio y a los escritores de ese conjunto.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con escritores concretos puede degradarse con estilos caligráficos no representados.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos del evaluado.
- Sin información sobre cuantización, contexto ni formato de entrada exacto; la integración en producción exige inspeccionar el repositorio y `results.json`.
- Creado y actualizado el 2026-11-01, con 0 descargas y 0 likes: sin validación comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/cyttic/hmt-htrvt-photo2-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados del experimento: `results.json` en el repositorio del modelo
- Estudio `htr-metrics-transfer` (oleada 1): sin URL pública en la información disponible
