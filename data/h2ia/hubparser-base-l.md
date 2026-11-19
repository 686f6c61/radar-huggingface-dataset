# H2IA/HubParser-Base-L

## Resumen

HubParser-Base-L es un modelo de análisis sintáctico y morfológico completo para portugués brasileño, desarrollado por H2IA en el marco de la disertación de máster HubParser (Guilherme Dallman Lima, PPGC/UFPel, 2026). A partir de frases ya tokenizadas en palabras, predice de forma conjunta la categoría gramatical (UPOS), el lema (LEMMA), los rasgos morfológicos (FEATS), la cabeza sintáctica (HEAD) y la relación de dependencia (DEPREL), produciendo directamente árboles en formato CoNLL-U compatibles con Universal Dependencies.

El modelo combina un encoder BERTimbau Base (110 millones de parámetros, 12 capas, portugués con casing) con un cabezote lineal: cinco clasificadores lineales por subtoken, uno por cada tarea. La decodificación del árbol puede seleccionarse en inferencia entre gulosa, Eisner (árbol proyectivo) y MST/Chu-Liu-Edmonds (árbol no proyectivo), lo que permite ajustar el compromiso entre velocidad y precisión sintáctica.

Es relevante porque ofrece un pipeline UD completo en un único modelo de tamaño moderado, con resultados en el test de Porttinari-base que alcanzan 99,20 de UPOS, 94,18 de UAS y 92,77 de LAS con decodificación Eisner, y una exportación ONNX en fp16 de 209 MB que ejecuta el análisis íntegramente en el navegador vía WebGPU o WebAssembly.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (BERTimbau Base, 12 capas) con cabezote lineal multi-tarea |
| Parametros totales | 109.450.670 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (limite de entrada ONNX, L ≤ 512) |
| Tipos de cuantizacion | fp16 (exportacion ONNX oficial); otras cuantizaciones no disponibles |
| Idiomas soportados | Portugues (pt), variante brasileña |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch), ONNX (model_fp16.onnx, 209 MB) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura encoder-only: el encoder es BERTimbau Base (neuralmind/bert-base-portuguese-cased), con 110 millones de parámetros y 12 capas, sobre el que se añaden cinco clasificadores lineales que operan por subtoken. La cabeza HEAD se formula como una clasificación sobre la posición absoluta de la palabra padre (clase 0 = raíz, 1..199 = índice de la palabra), lo que limita la longitud práctica de frase a 200 palabras. La tarea LEMMA se resuelve como clasificación sobre 252 reglas de edición (combinación de caja, caracteres recortados del final y sufijo añadido), y FEATS como clasificación sobre 174 conjuntos completos de rasgos morfológicos.

El entrenamiento usa el corpus Porttinari-base (8.418 frases, split de la disertación), con LEMMA y FEATS provenientes de UD_Portuguese-Porttinari r2.18 alineado frase a frase. El objetivo es la suma de las entropías cruzadas de las cinco salidas. La búsqueda de hiperparámetros emplea entrenamiento más validación, y el modelo final se entrena solo sobre el split de entrenamiento. La decodificación se elige en inferencia entre gulosa, Eisner y MST, lo que constituye la principal innovación práctica: un mismo modelo permite obtener árboles proyectivos o no proyectivos sin reentrenar. Existe además una exportación ONNX en media precisión cuya desviación respecto al modelo PyTorch es de como máximo 0,003 puntos porcentuales en el test completo de Porttinari, en cualquier métrica y decodificación.

## Capacidades

- Etiquetado UPOS (16 etiquetas) por palabra, con precisión de 99,20 en el test de Porttinari-base.
- Lematización mediante clasificación sobre 252 reglas de edición, con precisión de 98,96.
- Etiquetado de rasgos morfológicos completos (FEATS) sobre 174 conjuntos, con precisión de 98,90.
- Análisis de dependencias: predicción de cabeza (HEAD) y relación (DEPREL, 44 etiquetas), con UAS 94,18 y LAS 92,77 en decodificación Eisner.
- Decodificación seleccionable en inferencia: gulosa, Eisner (proyectiva) o MST/Chu-Liu-Edmonds (no proyectiva).
- Salida directa en formato CoNLL-U mediante `model.to_conllu(parsed)`.
- Ejecución en navegador mediante ONNX Runtime Web (WebGPU o WebAssembly) con el modelo fp16.
- Entrada restringida a frases ya tokenizadas en palabras (columna FORM del CoNLL-U); no realiza segmentación de tokens.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni modalidades de visión o audio.

## Casos de uso

- Anotación automática de corpus UD en portugués: el modelo genera árboles CoNLL-U completos (UPOS, LEMMA, FEATS, HEAD, DEPREL) a partir de texto previamente tokenizado, lo que permite crear corpus anotados a gran escala con revisión humana posterior.
- Preanotación en proyectos de lingüística computacional: sirve como primer paso para anotadores humanos en herramientas como Arborator o INCEpTION, reduciendo el coste de anotación manual gracias a sus métricas de 94,18 UAS y 92,77 LAS.
- Extracción de relaciones gramaticales en pipelines de PLN: la salida DEPREL permite identificar sujetos, objetos y modificadores para tareas posteriores de extracción de información, resumen o análisis de sentimiento a nivel de cláusula.
- Análisis morfológico para motores de búsqueda y recuperación: la lematización con 98,96 de precisión y los rasgos FEATS permiten normalizar consultas y documentos en portugués brasileño.
- Enseñanza de lengua y herramientas educativas: la visualización del árbol de dependencias y del análisis morfológico facilita la corrección gramatical asistida y el análisis sintáctico didáctico.
- Despliegue en el navegador sin backend: la exportación ONNX fp16 (209 MB) permite ofrecer análisis UD en una aplicación web estática mediante WebGPU o WebAssembly, sin coste de servidor ni envío de texto a terceros.
- Procesamiento por lotes en CPU: con 109 millones de parámetros, el modelo puede ejecutarse en infraestructura modesta para anotar grandes volúmenes de texto en portugués.

## Benchmarks y rendimiento

Resultados declarados por el autor en el test de Porttinari-base (1.683 frases, 33.580 palabras), predicción en el primer subtoken de cada palabra:

| Decodificacion | UPOS | LEMMA | FEATS | UAS | LAS |
|---|---|---|---|---|---|
| Gulosa | 99,20 | 98,96 | 98,90 | 92,76 | 91,41 |
| Eisner | 99,20 | 98,96 | 98,90 | 94,18 | 92,77 |
| MST | 99,20 | 98,96 | 98,90 | 93,34 | 91,95 |

Evaluación oficial CoNLL 2018 (`conll18_ud_eval.py`) sobre la salida MST: UFeats 98,95 · AllTags 98,57 · Lemmas 98,96 · UAS 93,34 · LAS 92,11 · CLAS 89,47 · MLAS 86,55 · BLEX 87,94.

Comparativa dentro de la familia HubParser (test, decodificación Eisner; MLAS por evaluación oficial CoNLL 2018 sobre salida MST):

| Modelo | UPOS | LEMMA | FEATS | UAS | LAS | MLAS |
|---|---|---|---|---|---|---|
| HubParser-Base-L (este modelo) | 99,20 | 98,96 | 98,90 | 94,18 | 92,77 | 86,55 |
| HubParser-Base-B | 99,33 | 99,11 | 99,07 | 96,96 | 95,94 | 92,12 |
| HubParser-Large-L | 99,28 | 99,00 | 99,01 | 95,15 | 93,79 | 88,14 |
| HubParser-Large-B | 99,38 | 99,09 | 99,10 | 97,20 | 96,16 | 92,69 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB de pesos (109,45 M de parámetros), más activaciones; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- VRAM estimada en fp16: aproximadamente 0,22 GB de pesos; la exportación ONNX fp16 ocupa 209 MB en disco.
- GPU recomendadas: cualquier GPU con soporte CUDA (RTX 3060, RTX 4090, A100, H100); el modelo es lo bastante pequeño como para que la latencia venga dominada por el preprocesado y la decodificación, no por el cómputo del encoder.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU mediante WebGPU.
- Opciones de despliegue: transformers con `trust_remote_code=True` (PyTorch), ONNX Runtime (incluido ONNX Runtime Web con WebGPU o WebAssembly). No se documentan integraciones con vLLM, llama.cpp u Ollama, que no son aplicables a un modelo encoder-only de token-classification.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | UAS / LAS (Porttinari test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HubParser-Base-L | 109,45 M | 512 tokens | 94,18 / 92,77 (Eisner) | MIT | Hugging Face, ONNX |
| HubParser-Base-B | no disponible | 512 tokens | 96,96 / 95,94 (Eisner) | no disponible | Hugging Face |
| HubParser-Large-L | no disponible | 512 tokens | 95,15 / 93,79 (Eisner) | no disponible | Hugging Face |
| HubParser-Large-B | no disponible | 512 tokens | 97,20 / 96,16 (Eisner) | no disponible | Hugging Face |

No se dispone de datos de benchmarks de otros parsers UD para portugués en la información proporcionada, por lo que la comparación se limita a la propia familia HubParser.

## Limitaciones y advertencias

- Solo procesa portugués brasileño; no está entrenado para otras lenguas ni para portugués europeo de forma específica.
- Requiere entrada ya tokenizada en palabras; no realiza segmentación de tokens ni normalización de texto.
- La cabeza HEAD se clasifica sobre posiciones absolutas hasta 200 palabras, lo que limita la longitud práctica de las frases analizables.
- La entrada está limitada a 512 subtokens (L ≤ 512) en la exportación ONNX.
- Los resultados de benchmarks están declarados por el autor y marcados como `verified: false` en el model-index; no han sido verificados de forma independiente.
- Dentro de la propia familia, esta variante lineal obtiene métricas sintácticas claramente inferiores a las variantes biaffine (por ejemplo, LAS 92,77 frente a 95,94 de HubParser-Base-B), por lo que la elección debe hacerse según el compromiso entre simplicidad y precisión.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; conviene auditar dicho código antes de usarlo en producción.
- Riesgo de alucinación estructural: en frases ambiguas o con fenómenos no proyectivos, la decodificación gulosa puede producir árboles incorrectos; se recomienda Eisner o MST según el caso.
- No se documentan sesgos específicos ni evaluaciones de robustez fuera de Porttinari.
- Licencia MIT: permite uso comercial y modificación con atribución; no se documentan restricciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/H2IA/HubParser-Base-L
- Modelo base: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- Variante HubParser-Base-B: https://huggingface.co/H2IA/HubParser-Base-B
- Variante HubParser-Large-L: https://huggingface.co/H2IA/HubParser-Large-L
- Variante HubParser-Large-B: https://huggingface.co/H2IA/HubParser-Large-B
- Demo en el navegador (Space): https://huggingface.co/spaces/H2IA/HubParser
- Documentación de ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/
