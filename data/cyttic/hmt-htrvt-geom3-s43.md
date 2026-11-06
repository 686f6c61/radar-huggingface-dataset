# cyttic/hmt-htrvt-geom3-s43

## Resumen

`cyttic/hmt-htrvt-geom3-s43` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el usuario `cyttic` y publicado en Hugging Face. Se trata de un modelo pequeño, de 13.821.574 parámetros (aproximadamente 13,8 millones), entrenado con un objetivo CTC (*Connectionist Temporal Classification*) y empaquetado en formato `safetensors`. Forma parte de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`, en el que se evalúa la transferencia de métricas entre distintas configuraciones de entrenamiento.

La relevancia de este modelo es acotada y de carácter experimental: no es un modelo de lenguaje generalista, sino un componente especializado en transcripción de manuscritos en hebreo (`he`), entrenado sobre el conjunto `cyttic/hhd-optionb-split` (excluyendo los escritores de desarrollo) y evaluado sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje. Los resultados reportados por el autor son CER 0.0627 y WER 0.2780.

Por su tamaño y naturaleza, está pensado para investigación en HTR y para experimentos de reproducción de métricas, no como un sistema listo para producción multilingüe. La información pública disponible es muy limitada: la model card es breve, no hay pipeline declarado, no consta paper asociado y las descargas y *likes* son cero en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo HTR con cabecera CTC; arquitectura base no detallada) |
| Parametros totales | 13.821.574 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Objetivo de entrenamiento | CTC |
| Tamano del repositorio | 0,1 GB |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna más allá de indicar que se trata de un modelo HTR con decodificación CTC. El nombre del modelo (`htrvt`) y la etiqueta `geom3` sugieren una variante de un modelo base de reconocimiento de manuscritos combinada con una estrategia de aumento geométrico de imágenes (`geom3`), con semilla 43. No se especifica el número de capas, la dimensión oculta, el tipo de extractor visual ni si incorpora atención.

El entrenamiento se realizó sobre el split de entrenamiento de `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo, y la evaluación se hizo sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje externo. No se documentan en la información disponible el volumen de tokens, la composición del dataset, ni si hubo etapas de ajuste fino adicionales. El autor remite a `results.json` para los detalles del experimento, pero ese contenido no forma parte de la información proporcionada.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) en hebreo.
- Decodificación CTC greedy, sin modelo de lenguaje acoplado.
- Entrenamiento y evaluación orientados a medir transferencia de métricas en estudios de aumento de datos.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades multilingües más allá del hebreo.
- No se documentan modos especiales (thinking, visión, audio) distintos del propio reconocimiento de imagen manuscrita.

## Casos de uso

- Investigación en HTR: servir como punto de comparación dentro del estudio `htr-metrics-transfer` para medir el efecto del aumento geométrico (`geom3`) frente a otras configuraciones con la misma semilla.
- Reproducción de experimentos: al publicarse con licencia MIT y pesos en `safetensors`, permite reproducir las métricas CER 0.0627 y WER 0.2780 sobre el test HHD Option-B en entornos controlados.
- Transcripción de manuscritos en hebreo: puede emplearse como base para digitalizar documentos históricos o administrativos escritos a mano, siempre que el dominio y la caligrafía se parezcan a los del corpus HHD.
- Evaluación de pipelines CTC: útil para probar infraestructuras de decodificación greedy y comparar con variantes que incorporen modelo de lenguaje.
- Docencia y experimentación: su tamaño reducido (13,8 M de parámetros, repo de 0,1 GB) lo hace manejable para prácticas de ajuste fino y evaluación de HTR en hardware modesto.
- Estudio de robustez frente a aumentos de datos: permite analizar cómo el aumento geométrico afecta a la tasa de error en caracteres y palabras en escritores no vistos.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| CER | 0,0627 | Test HHD Option-B, decodificación greedy, sin LM |
| WER | 0,2780 | Test HHD Option-B, decodificación greedy, sin LM |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni métricas adicionales del estudio `htr-metrics-transfer`.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 13,8 M de parámetros, los pesos en `safetensors` ocupan del orden de decenas de MB, por lo que cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: no se especifican; cualquier GPU con suficiente memoria para el lote de imágenes de entrada es válida (por ejemplo, RTX 3060, RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, con amplio margen.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo CTC de HTR, requeriría un *runtime* compatible con la arquitectura concreta (no detallada).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de HTR en hebreo ni resultados de referencia del estudio `htr-metrics-transfer` frente a otras variantes.

## Limitaciones y advertencias

- Modelo experimental de investigación: la model card es mínima y no documenta arquitectura, datos de entrenamiento ni procedimiento de evaluación más allá de las métricas reportadas.
- Idiomas: únicamente hebreo; no hay evidencia de generalización a otras lenguas o alfabetos.
- Sesgos: no documentados; al entrenarse sobre un corpus concreto (HHD Option-B), puede presentar sesgos hacia los estilos de escritura y escritores de ese corpus.
- Riesgo de alucinación: inherente a los sistemas CTC, que pueden producir transcripciones plausibles pero incorrectas, especialmente con caligrafías alejadas del dominio de entrenamiento.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificación, pero sin garantías por parte del autor.
- Caveat para producción: sin modelo de lenguaje acoplado y con decodificación greedy, el WER de 0,2780 es alto para muchas aplicaciones reales; conviene evaluar en el dominio objetivo antes de desplegarlo.
- Sin métricas de robustez, latencia ni throughput publicadas.

## Enlaces

- Hugging Face: https://huggingface.co/cyttic/hmt-htrvt-geom3-s43
- Dataset de entrenamiento citado: `cyttic/hhd-optionb-split` (no se proporciona URL directa en la información disponible)
- Resultados del experimento: `results.json` (referenciado por el autor, no incluido en la información disponible)
