# cyttic/hmt-trocrctc-stroke3-s42

## Resumen

El modelo `cyttic/hmt-trocrctc-stroke3-s42` es un sistema de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el grupo cyttic. Se trata de un estudio de aumento de datos (*augmentation study*) dentro del proyecto `htr-metrics-transfer`, en su primera oleada (*wave 1*). El modelo combina una arquitectura TrOCR con un cabezal de clasificación CTC, entrenado sobre datos manuscritos en hebreo (`he`).

El modelo resuelve la transcripción automática de texto manuscrito en hebreo, un dominio con escasez de recursos y alta variabilidad de estilos caligráficos. Su relevancia radica en que forma parte de un estudio sistemático sobre técnicas de aumento de datos (en concreto, la variante `stroke3`) aplicadas al reconocimiento de escritura manual, lo que permite evaluar el impacto de dichas técnicas en métricas de error a nivel de carácter (CER) y de palabra (WER).

Con 87.279.756 parámetros y un tamaño de repositorio de 0,3 GB, es un modelo de escala media, adecuado para inferencia en hardware de consumo. La licencia MIT facilita su uso comercial y su integración en pipelines de digitalización documental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR con cabezal CTC (transformer encoder-decoder con clasificacion CTC) |
| Parametros totales | 87.279.756 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura TrOCR (Transformer-based Optical Character Recognition) combinada con un cabezal de clasificación CTC (*Connectionist Temporal Classification*), lo que permite alinear secuencias de entrada (imágenes de texto manuscrito) con secuencias de salida (caracteres) sin necesidad de una alineación explícita a nivel de carácter. El nombre `trocrctc` en el identificador confirma esta configuración híbrida.

El entrenamiento se realizó sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores (*writers*) del conjunto de desarrollo. Se aplicó una técnica de aumento de datos denominada `stroke3` y se fijó la semilla 42 para garantizar la reproducibilidad. La evaluación se realizó sobre el conjunto de test HHD Option-B, con decodificación greedy y sin modelo de lenguaje (*no LM*), obteniendo un CER de 0,1090 y un WER de 0,4504. Los detalles completos del experimento se encuentran en el archivo `results.json` del repositorio.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes.
- Transcripción a nivel de carácter y de palabra.
- Decodificación greedy sin modelo de lenguaje externo.
- Entrenado específicamente para escritura manual (no para texto impreso).
- No se ha documentado soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se ha documentado capacidad multilingüe más allá del hebreo.
- No se ha documentado modo de pensamiento (*thinking mode*), visión general, audio ni otras capacidades especiales.

## Casos de uso

- Digitalización de archivos históricos en hebreo: el modelo puede transcribir manuscritos escaneados a texto digital, facilitando la preservación y búsqueda en colecciones documentales. Su entrenamiento específico en hebreo manuscrito lo hace adecuado para este dominio.
- Procesamiento de formularios manuscritos: en entornos administrativos o sanitarios israelíes, el modelo puede extraer texto de formularios cumplimentados a mano, reduciendo la entrada manual de datos.
- Reconocimiento de correspondencia postal: digitalización de sobres y cartas manuscritas en hebreo para su clasificación y enrutamiento automatizado.
- Anotación asistida de corpus: investigadores en lingüística o historia pueden usar el modelo para pretranscribir documentos y luego corregir manualmente, acelerando la creación de corpus anotados.
- Digitalización de cuadernos y notas personales: transcripción de notas manuscritas para su inclusión en sistemas de gestión documental o archivos personales.
- Evaluación comparativa de técnicas de aumento de datos: dado que el modelo forma parte de un estudio sistemático (`htr-metrics-transfer`), sirve como referencia para investigar el impacto de variantes de aumento como `stroke3` en métricas CER/WER.
- Integración en pipelines de OCR para documentos mixtos: combinado con modelos de detección de texto, puede procesar páginas con regiones manuscritas e impresas, aplicando HTR solo donde corresponda.

## Benchmarks y rendimiento

Los únicos datos de rendimiento disponibles en la información proporcionada son los del conjunto de test HHD Option-B, con decodificación greedy y sin modelo de lenguaje:

| Metrica | Valor |
|---|---|
| CER (Character Error Rate) | 0,1090 |
| WER (Word Error Rate) | 0,4504 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 87,3 M de parámetros, en precisión FP32 ocuparía aproximadamente 0,35 GB de pesos, y en FP16 alrededor de 0,17 GB, más el overhead de activaciones y del procesador de imágenes.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con al menos 2-4 GB de VRAM debería ser suficiente, incluyendo GTX 1650, RTX 3050, RTX 4060 o superiores.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de GPU consumer modernas, dado el reducido número de parámetros.
- Opciones de despliegue: no disponible en la información proporcionada; al usar safetensors, es compatible con bibliotecas estándar de Hugging Face Transformers, y podría convertirse a otros formatos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se trata de un modelo especializado en HTR para hebreo con una configuración experimental concreta, y no se han publicado comparativas con alternativas en la información disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| cyttic/hmt-trocrctc-stroke3-s42 | 87,3 M | no disponible | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para hebreo manuscrito; no se espera un rendimiento adecuado en otros idiomas ni en texto impreso.
- El WER de 0,4504 es elevado, lo que indica que aproximadamente una de cada dos palabras presenta algún error en la transcripción; es necesario un postprocesado o corrección humana para aplicaciones de alta exigencia.
- El CER de 0,1090 implica que alrededor del 11 % de los caracteres son incorrectos, lo que puede afectar a la legibilidad y a la extracción de entidades.
- La evaluación se realizó sin modelo de lenguaje; el rendimiento en producción podría variar si se añade un LM o se cambia la estrategia de decodificación.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado sobre un conjunto limitado de escritores, puede generalizar peor ante estilos caligráficos no representados.
- Riesgo de alucinación: en HTR, el modelo puede generar caracteres o palabras plausibles pero incorrectos, especialmente en regiones de baja calidad de imagen.
- La licencia MIT permite uso comercial sin restricciones adicionales, pero se recomienda verificar la procedencia y las condiciones de los datos de entrenamiento originales.
- No se dispone de información sobre cuantizaciones soportadas ni sobre latencia, lo que limita la planificación de despliegues en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrctc-stroke3-s42
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split (referenciado en la model card)
- Archivo de resultados: `results.json` (incluido en el repositorio del modelo)
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
