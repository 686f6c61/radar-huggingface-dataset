# cyttic/hmt-trocrsmall-photo2-s42

## Resumen

`cyttic/hmt-trocrsmall-photo2-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *handwritten text recognition*) en hebreo, publicado por el autor `cyttic` como parte de un estudio de aumento de datos denominado *htr-metrics-transfer*. El modelo emplea una arquitectura CTC (*Connectionist Temporal Classification*) sobre un backbone de tipo CRNN/SVTR, con 22.421.004 parámetros totales y pesos en formato safetensors. Su propósito es transcribir imágenes de escritura manuscrita hebrea a texto plano, sin modelo de lenguaje externo en la decodificación.

La relevancia de esta ficha es acotada: se trata de un checkpoint experimental de un estudio de ablación (variante de aumento `photo2`, semilla 42), no de un modelo de propósito general. El autor reporta un CER de 0,2230 y un WER de 0,7404 sobre el conjunto de test HHD Option-B con decodificación greedy y sin LM. Estos valores sitúan al modelo en un régimen de error alto para producción, pero resultan informativos dentro del contexto del estudio comparativo de técnicas de aumento.

El modelo se distribuye bajo licencia MIT y solo declara soporte para hebreo (`he`). No se ha publicado información sobre arquitectura exacta, composición del dataset de entrenamiento más allá de la referencia a `cyttic/hhd-optionb-split`, ni resultados de benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como CTC/HTR; backbone no especificado en la model card) |
| Parametros totales | 22.421.004 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión para líneas de texto manuscrito; la longitud depende de la altura/ancho de la imagen de entrada, no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna. Las etiquetas `htr` y `ctc` indican que se trata de un sistema de reconocimiento de texto manuscrito entrenado con pérdida CTC, lo que implica una red que produce una secuencia de logits por columna o paso temporal y una decodificación que colapsa repeticiones y alinea con la secuencia objetivo. El tamaño de 22,4 M de parámetros es coherente con backbones CRNN o SVTR de tamaño pequeño/medio, habituales en HTR.

El entrenamiento se realizó sobre el split `cyttic/hhd-optionb-split`, excluyendo los escritores del conjunto de desarrollo (*dev writers*). La variante corresponde a un estudio de aumento de datos (`photo2`) con semilla 42. La evaluación se hizo sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje. No se especifican el número de tokens, la composición del dataset, ni si hubo etapas de ajuste fino adicionales. El autor remite a `results.json` para los detalles del estudio.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes de líneas de texto.
- Decodificación CTC greedy (sin modelo de lenguaje externo).
- Salida de transcripción a nivel de carácter y palabra (se reportan CER y WER).
- No se declara soporte de tool calling, function calling ni agentes.
- No se declara capacidad multilingüe: solo hebreo.
- No se declara modo *thinking*, visión general, audio ni otras modalidades.
- No se declara capacidad de razonamiento, código o matemáticas.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo puede transcribir líneas de manuscritos escaneados, aunque con un CER del 22,3 % requiere revisión humana o un modelo de lenguaje de corrección posterior.
- Investigación en aumento de datos para HTR: sirve como checkpoint de referencia para comparar la variante `photo2` frente a otras técnicas de aumento dentro del estudio `htr-metrics-transfer`.
- Reproducción de experimentos: al estar publicados los pesos y la referencia al split de entrenamiento, permite replicar la evaluación sobre HHD Option-B con decodificación greedy.
- Generación de transcripciones preliminares para anotación asistida: las salidas pueden usarse como borrador para etiquetado humano en corpus hebreos.
- Evaluación de pipelines CTC sin LM: útil para medir el impacto de añadir un modelo de lenguaje en la corrección de errores.
- Baseline en tareas de reconocimiento de escritura manuscrita histórica en hebreo: como punto de partida de bajo coste computacional (22 M de parámetros) para comparaciones con modelos mayores.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| CER | 0,2230 | HHD Option-B test, greedy, sin LM |
| WER | 0,7404 | HHD Option-B test, greedy, sin LM |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ni comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (22,4 M de parámetros), por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060 o superior es más que suficiente. También puede ejecutarse en CPU para inferencia por lotes pequeños.
- Cabe en GPU consumer: sí, en cualquier modelo moderno (GTX 1650, RTX 3050, RTX 4090, etc.).
- Opciones de despliegue: al ser safetensors sin pipeline declarado, requiere cargar los pesos con la implementación del autor (no especificada). No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos HTR en hebreo ni referencias a alternativas de la misma categoría.

## Limitaciones y advertencias

- Rendimiento limitado: CER de 0,2230 y WER de 0,7404 con decodificación greedy sin LM; no es adecuado para producción sin corrección posterior o revisión humana.
- Solo hebreo: no se declara soporte de otros idiomas.
- Sin modelo de lenguaje: la decodificación greedy sin LM incrementa los errores en comparación con pipelines que incorporan corrección lingüística.
- Checkpoint experimental: forma parte de un estudio de ablación (semilla 42, aumento `photo2`); no está pensado como modelo final de referencia.
- Sin información sobre sesgos: no se documentan sesgos conocidos ni la composición demográfica del dataset de entrenamiento.
- Riesgo de alucinación: en HTR, el riesgo se traduce en sustituciones, inserciones y omisiones de caracteres, no en contenido inventado semánticamente, pero el WER elevado indica alta tasa de errores a nivel de palabra.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías; conviene verificar la procedencia y licencia del dataset `cyttic/hhd-optionb-split` antes de un uso comercial.
- Sin pipeline declarado: la integración requiere conocer la implementación exacta del modelo, no documentada en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cyttic/hmt-trocrsmall-photo2-s42
- Dataset de entrenamiento referenciado: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Detalles del estudio: `results.json` en el repositorio del modelo (no se proporciona URL directa)
