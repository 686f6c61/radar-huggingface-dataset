# cyttic/hmt-trocrsmall-photo3-s42

## Resumen

`cyttic/hmt-trocrsmall-photo3-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *handwritten text recognition*) desarrollado por el grupo cyttic. Forma parte de un estudio de aumentación de datos denominado `htr-metrics-transfer`, y en concreto esta variante corresponde al modelo base `trocrsmall`, con la estrategia de aumentación `photo3` y la semilla 42. No es un modelo generativo de propósito general, sino un reconocedor especializado que transcribe imágenes de escritura manual a texto.

El modelo emplea una arquitectura CTC (*Connectionist Temporal Classification*) sobre pesos en formato safetensors, con 22.421.004 parámetros totales y un tamaño de repositorio de aproximadamente 0,1 GB. Está entrenado sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores de desarrollo, y evaluado sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje. El idioma de trabajo es el hebreo (`he`).

Su relevancia es acotada pero específica: sirve como punto de referencia reproducible para medir cómo distintas estrategias de aumentación afectan a las métricas de transcripción en hebreo manuscrito. Los resultados reportados (CER 0,2031 y WER 0,7009) son modestos y reflejan la dificultad del dominio, pero el valor del artefacto está en su papel dentro del estudio comparativo, no en un uso productivo directo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CTC (reconocimiento de texto manuscrito, HTR) |
| Parámetros totales | 22.421.004 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card identifica el modelo como un sistema HTR con cabecera CTC, lo que implica una secuencia de entrada visual procesada por un backbone convolucional o híbrido y una salida alineada temporalmente mediante CTC, sin decodificador autorregresivo. No se detalla en la información disponible la naturaleza exacta del extractor de características ni la profundidad de la red; solo se confirma el paradigma CTC y el recuento de parámetros.

El entrenamiento se realizó sobre el split de entrenamiento de `cyttic/hhd-optionb-split` menos los escritores reservados para desarrollo. La variante `photo3` indica una estrategia de aumentación orientada a simular condiciones fotográficas, y la semilla 42 fija la reproducibilidad. La evaluación se hizo con decodificación greedy y sin modelo de lenguaje externo, lo que aísla el rendimiento puro del acoustic model. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de ajuste fino adicionales.

## Capacidades

- Transcripción de texto manuscrito en hebreo a partir de imágenes.
- Reconocimiento a nivel de carácter y de palabra mediante decodificación CTC greedy.
- Funcionamiento sin modelo de lenguaje externo, lo que simplifica el despliegue pero limita la corrección contextual.
- Salida de secuencias alineadas temporalmente, apta para integración en pipelines de digitalización.
- No dispone de tool calling, function calling ni capacidades de agente.
- No soporta visión general más allá del reconocimiento de escritura.
- No es multilingüe: está especializado exclusivamente en hebreo.
- No incorpora modo de razonamiento (*thinking*) ni generación libre de texto.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo transcribe páginas escaneadas o fotografiadas, y su entrenamiento con aumentación `photo3` lo hace relativamente robusto a variaciones de iluminación y captura con cámara.
- Investigación en aumentación de datos HTR: sirve como punto de comparación reproducible (semilla 42) frente a otras variantes del estudio `htr-metrics-transfer` para medir el impacto de cada estrategia.
- Evaluación de métricas de transferencia: al reportar CER y WER sobre un test fijo (HHD Option-B), permite analizar cómo se transfieren las métricas entre configuraciones de entrenamiento.
- Preprocesado en pipelines de OCR histórico: puede actuar como primer paso de transcripción para posterior corrección humana o con un modelo de lenguaje separado.
- Análisis cuantitativo de escritores: al haberse excluido los escritores de desarrollo del entrenamiento, es útil para estudiar generalización a escritores no vistos.
- Prototipado académico de sistemas CTC: su tamaño reducido (22,4 M de parámetros) y su licencia MIT facilitan experimentos de bajo coste en entornos de investigación.

## Benchmarks y rendimiento

| Métrica | Valor | Condiciones |
|---|---|---|
| CER | 0,2031 | HHD Option-B test, greedy, sin LM |
| WER | 0,7009 | HHD Option-B test, greedy, sin LM |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (22,4 M de parámetros), y del orden de centenares de MB en fp16; no se dispone de cifras oficiales.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada puede ejecutar el modelo.
- Cabe holgadamente en GPU de consumo, incluidas GTX 1650, RTX 3060 y superiores.
- Opciones de despliegue: al ser safetensors con arquitectura CTC, requiere un runtime compatible con el código de inferencia del autor; no se confirma soporte en vLLM, llama.cpp, Ollama o TGI (orientados a modelos generativos).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrsmall-photo3-s42 | 22,4 M | no disponible | 0,2031 | MIT | Hugging Face |
| Otras variantes de `htr-metrics-transfer` | no disponible | no disponible | no disponible | MIT (presumible) | Hugging Face (cyttic) |
| Modelos HTR genéricos (p. ej. TrOCR) | no disponible en esta ficha | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos suficientes para establecer una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Rendimiento limitado: un WER de 0,7009 implica que aproximadamente el 70 % de las palabras no se transcriben correctamente en el test, lo que desaconseja su uso productivo sin revisión humana.
- Especialización estrecha: solo reconoce hebreo manuscrito; no es aplicable a otros idiomas ni a texto impreso.
- Sin modelo de lenguaje: la decodificación greedy sin LM incrementa errores en palabras ambiguas o con contexto léxico relevante.
- Sesgos de escritor: al entrenarse excluyendo los escritores de desarrollo, puede generalizar peor a estilos de escritura no representados en el conjunto de entrenamiento.
- Riesgo de alucinación a nivel de carácter: los modelos CTC pueden insertar o eliminar caracteres en regiones de baja calidad de imagen.
- Licencia MIT: permite uso comercial y modificación, pero no se ofrecen garantías de exactitud ni soporte.
- Artefacto de investigación: su propósito es el estudio comparativo de aumentación, no el despliegue en producción; la model card no documenta el procedimiento completo de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrsmall-photo3-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados detallados: `results.json` (referenciado en la model card, no se proporciona URL directa)
- Repositorio del estudio `htr-metrics-transfer`: no disponible
