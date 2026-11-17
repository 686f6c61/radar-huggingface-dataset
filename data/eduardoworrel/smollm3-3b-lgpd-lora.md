# eduardoworrel/SmolLM3-3B-LGPD-LoRA

## Resumen

SmolLM3-3B-LGPD-LoRA es un adaptador LoRA con una cabeza de clasificación de tipo pointer head entrenado sobre el modelo base SmolLM3-3B de Hugging Face. Lo desarrolla el usuario eduardoworrel y su propósito es especializar el modelo en la evaluación de políticas de privacidad conforme a la LGPD (ley brasileña de protección de datos). Dada una cláusula en portugués y un requisito de transparencia, el sistema responde "Sim" o "Não" en un único forward pass, devolviendo además una probabilidad y un margen de confianza.

El modelo no es un generador de texto libre: se trata de un adaptador de clasificación binaria que combina pesos LoRA fusionables con una cabeza pointer independiente (dimensiones 256) que calcula la probabilidad mediante un producto escalar entre la representación del token de decisión y la del token de la opción. Está entrenado únicamente con el corpus Claudinha de políticas de privacidad brasileñas y muestra transferencia zero-shot a GDPR (inglés) y CCPA (inglés).

Es relevante porque demuestra una arquitectura híbrida (LoRA + pointer head) para tareas de clasificación jurídica con un único pase de inferencia, y porque publica una variante ONNX int4 para ejecución en navegador vía WebGPU, lo que abre la puerta a auditorías de privacidad locales sin enviar datos a servidores externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM3-3B) con adaptador LoRA y pointer head de clasificación |
| Parametros totales | 3B (modelo base); el adaptador LoRA ocupa ~0,1 GB en el repositorio |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | bf16 (variante `lgpd_only`), fp32 (variante `lgpd_only_k`); variante ONNX int4 para navegador |
| Idiomas soportados | Portugués (pt) e inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (LoRA + `head.safetensors`); variante ONNX int4 en repositorio hermano |

## Arquitectura y entrenamiento

El sistema se compone de tres piezas: el modelo base SmolLM3-3B (transformer decoder-only de Hugging Face, Apache-2.0), un adaptador LoRA entrenado con PEFT que se fusiona con `merge_and_unload()`, y una pointer head independiente que se carga desde `head.safetensors`. La cabeza calcula la probabilidad de cada opción como `softmax_k(q(h_decide) · k(h_option_end) / 16)`, es decir, un producto escalar entre la representación del token de decisión y la del token final de cada opción (" Sim" y " Não", con espacio inicial), escalado por 16. Las palabras de opción están fijadas exactamente: cualquier otra palabra (incluida una traducción) altera el prompt y rompe la cabeza.

El entrenamiento se realizó sobre el corpus Claudinha (políticas de privacidad brasileñas, un anotador por cláusula, CC BY 4.0) junto con datos sintéticos Kev (legacy_policy, compositional, generados con código Apache-2.0). La variante evaluada es `lgpd_only` (1 epoch, merge en bf16); existe una variante `lgpd_only_k` (2 epochs, merge en fp32) que no fue evaluada en el conjunto de test reservado. La receta de la cabeza y del entrenamiento proviene de Kev, y la idea de separación System 1 / System 2 con compuerta de margen procede de CT0 de Alias Robotics.

## Capacidades

- Clasificación binaria de cláusulas de privacidad frente a un requisito de transparencia, respondiendo "Sim" o "Não".
- Salida de probabilidad calibrada y margen de confianza por predicción, lo que permite aplicar políticas de umbral o derivar casos ambiguos.
- Inferencia en un único forward pass (System 1), con la posibilidad de activar razonamiento adicional bajo demanda (System 2) según el patrón S1S2.
- Transferencia zero-shot a marcos regulatorios en inglés (GDPR, CCPA) sin entrenamiento específico.
- Ejecución en navegador mediante la variante ONNX int4 y WebGPU, a través de la librería s1s2.
- Soporte de dos idiomas: portugués (entrenamiento) e inglés (transferencia).
- No soporta tool calling, function calling, agentes multi-paso ni generación de texto libre: es un clasificador especializado, no un asistente conversacional.

## Casos de uso

- Auditoría de políticas de privacidad: dado un documento de política en portugués, recorrer cada cláusula y determinar automáticamente si aborda cada requisito de transparencia de la LGPD, generando un informe de cobertura.
- Cumplimiento normativo en entornos corporativos: integrar el clasificador en un pipeline que marque cláusulas ausentes o ambiguas antes de una revisión legal humana, reduciendo el trabajo manual de triaje.
- Ejecución local en navegador para equipos jurídicos: gracias a la variante ONNX int4 y WebGPU, un abogado puede analizar políticas sin que el documento salga de su equipo, lo que es relevante cuando el texto contiene datos sensibles.
- Investigación comparada de marcos regulatorios: usar la transferencia zero-shot a GDPR y CCPA para estudiar qué cláusulas de transparencia son universales y cuáles específicas de cada jurisdicción.
- Monitorización continua de proveedores: procesar periódicamente las políticas de privacidad de terceros y detectar cambios en la cobertura de requisitos de transparencia mediante comparación de predicciones y márgenes.
- Filtrado previo en pipelines de NLP jurídico: como etapa de clasificación barata (un forward pass, sin generación) antes de invocar modelos mayores para análisis profundo de las cláusulas marcadas como relevantes.
- Docencia y formación en protección de datos: ilustrar con ejemplos reales qué significa que una cláusula "aborde" un requisito de transparencia, con la probabilidad y el margen como señal de dificultad del caso.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre conjunto de test reservado, balanced accuracy de la pointer head en bf16, variante `lgpd_only` (1 epoch, merge bf16):

| Conjunto de test | Balanced accuracy (%) |
|---|---|
| LGPD (portugués), n = 802 | 78,2 |
| GDPR (inglés, transferencia zero-shot), n = 558 | 75,3 |
| CCPA (inglés, transferencia zero-shot), n = 420 | 74,5 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 6-7 GB para el modelo base de 3B más el adaptador y la cabeza; en fp32, aproximadamente 12-13 GB.
- La variante ONNX int4 reduce el peso a unos 2 GB y está pensada para ejecución en navegador con WebGPU, sin GPU dedicada obligatoria.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 Ti, RTX 4060, RTX 4070); A100 o H100 no son necesarias dado el tamaño del modelo.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más en bf16; en int4 cabe en equipos con 4-6 GB o incluso en navegador.
- Opciones de despliegue: transformers + peft (ruta principal documentada), ONNX Runtime con WebGPU para navegador mediante la librería s1s2. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un único forward pass sobre un modelo de 3B, la latencia esperada es baja, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolLM3-3B-LGPD-LoRA (este) | 3B + LoRA + head | No disponible | Clasificación binaria LGPD | CC BY 4.0 | Hugging Face, ONNX int4 en navegador |
| SmolLM3-3B (base) | 3B | No disponible | Generación de texto general | Apache-2.0 | Hugging Face |
| alias3-web (Alias Robotics) | No disponible | No disponible | Predecesor del patrón S1S2 | No disponible | Hugging Face |

No se dispone de información sobre otros clasificadores especializados en LGPD con los que comparar directamente; la comparativa con alternativas de la misma categoría queda limitada a los predecesores citados en la model card.

## Limitaciones y advertencias

- Entrenado exclusivamente con políticas de privacidad brasileñas (corpus Claudinha, un anotador por cláusula); GDPR y CCPA nunca se usaron en entrenamiento, por lo que la transferencia es zero-shot y su fiabilidad en esos marcos no está garantizada.
- El modelo indica si una cláusula aborda un requisito de transparencia, no si la política cumple la ley; no constituye asesoramiento jurídico.
- Las palabras de opción están fijadas exactamente a " Sim" y " Não" con espacio inicial; cualquier variación (traducción, cambio de formato) invalida la cabeza.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos y negativos en la clasificación; el margen de confianza debe usarse para derivar casos ambiguos.
- Sesgos derivados del corpus de anotación única y de su composición (políticas brasileñas de un conjunto limitado de fuentes).
- La variante `lgpd_only_k` (2 epochs, fp32) no fue evaluada en el conjunto de test reservado; no se recomienda su uso en producción sin validación propia.
- Licencia CC BY 4.0: permite uso comercial con atribución; deben mantenerse las atribuciones del corpus Claudinha, los datos Kev y el modelo base Apache-2.0.
- No soporta generación de texto, tool calling ni razonamiento multi-paso; usarlo fuera de la tarea de clasificación para la que fue entrenado producirá resultados no fiables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eduardoworrel/SmolLM3-3B-LGPD-LoRA
- Variante ONNX int4 para navegador: https://huggingface.co/eduardoworrel/SmolLM3-3B-LGPD-ONNX-genai-int4-S1S2
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Librería s1s2: https://github.com/eduardoworrel/s1s2
- Corpus Claudinha (Zenodo): https://zenodo.org/records/13371639
- Kev (receta de pointer head y entrenamiento): https://github.com/jaredpalmer/kev
- Predecesor alias3-web: https://huggingface.co/aliasrobotics/alias3-web
- Paper Browser Immune System: https://arxiv.org/abs/2611.15302
