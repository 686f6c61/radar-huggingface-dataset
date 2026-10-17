# PUSHTYPE/punct-cap-seg-en-coreml

## Resumen

PUSHTYPE/punct-cap-seg-en-coreml es una conversión a CoreML de un modelo de restauración de puntuación, capitalización y segmentación de frases para inglés. No es un modelo entrenado desde cero: el repositorio empaqueta el modelo `1-800-BAD-CODE/punctuation_fullstop_truecase_english` (licencia Apache 2.0) en formato CoreML con pesos cuantizados a int8, para su uso en la aplicación de dictado PUSHTYPE sobre dispositivos Apple. El problema que resuelve es concreto: los sistemas de reconocimiento de voz en el dispositivo generan texto sin mayúsculas ni signos de puntuación, y este modelo inserta comas, puntos y signos de interrogación, además de decidir las mayúsculas y los límites de frase.

Técnicamente es un modelo de clasificación de tokens que trabaja sobre una ventana fija de 256 tokens, con vocabulario SentencePiece unigram de 32 000 piezas en minúsculas (`spe_32k_lc_en.model`). La conversión se realizó mediante la ruta ONNX → PyTorch (onnx2torch) → coremltools 9.0, con precisión de cálculo FP32 y cuantización lineal int8 de los pesos por bloques de 32. No hubo reentrenamiento: los cambios son exclusivamente de formato.

Su relevancia es práctica más que investigadora. Se trata de un componente de infraestructura para aplicaciones de dictado y post-procesado de ASR en el ecosistema Apple, con un coste de inferencia declarado de unos 9 ms por frase en Apple Silicon y un tamaño de repositorio de 0,1 GB, lo que lo hace apto para ejecución local sin conexión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de clasificación de tokens para puntuación, capitalización y segmentación; conversión desde ONNX) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens (entrada de longitud fija `[1, 256]`) |
| Tipos de cuantizacion | int8 en pesos (cuantización lineal por bloques de 32); activaciones en FP32 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | CoreML (`PunctCapSeg.mlmodelc` compilado, macOS 15+); modelo de origen en ONNX |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo original más allá de su comportamiento de clasificación de tokens y de la presencia de una máscara de atención en el grafo (el autor advierte que la constante de la máscara de atención se desborda en media precisión, motivo por el que se evita FP16). El vocabulario es un SentencePiece unigram de 32 000 piezas en minúsculas, coherente con un modelo de tipo encoder que recibe texto ya normalizado a minúsculas y sin puntuar.

No se realizó ningún entrenamiento ni ajuste fino en esta conversión. El proceso documentado es puramente de formato: partiendo del checkpoint original en el commit `b26fd1c40e88678859048898218ea4edcc24c84a` (`punct_cap_seg_en.onnx`), se aplicó ONNX → PyTorch con onnx2torch, después coremltools 9.0 con precisión de cálculo FP32 y, finalmente, cuantización lineal int8 de los pesos. La validación consistió en comparar la salida con el modelo ONNX original en 15 frases de prueba, con coincidencia total. No hay datos disponibles sobre el número de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Restauración de puntuación: inserta punto, coma y signo de interrogación (etiquetas `null` / `acronym` / `.` / `,` / `?`) tras cada token, mediante la salida `post_preds` de forma `[1, 256]`.
- Capitalización (truecasing): decide las mayúsculas carácter a carácter mediante la salida `cap_preds` de forma `[1, 256, 16]`, incluyendo el tratamiento de acrónimos.
- Segmentación de frases: detecta límites de frase a través de la salida `seg_preds`.
- Entrada normalizada: espera texto en minúsculas, sin puntuar y sin segmentar, tokenizado con el vocabulario SentencePiece incluido y formateado como `[1, 256]` con BOS (1), EOS (2) y relleno con 3.
- Ejecución local en dispositivo: el modelo compilado para CoreML se ejecuta sin conexión en hardware Apple.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión ni audio. Es un componente de post-procesado de texto, no un modelo generativo conversacional.
- Capacidad multilingüe: no disponible en este repositorio, que cubre únicamente inglés.

## Casos de uso

- Post-procesado de dictado en aplicaciones Apple: tras el reconocimiento de voz en el dispositivo, el modelo añade puntuación, mayúsculas y límites de frase antes de mostrar el texto al usuario; el formato CoreML y los ~9 ms por frase lo hacen viable de forma interactiva.
- Normalización de transcripciones ASR en pipelines por lotes: transcripciones sin puntuar procedentes de motores de voz pueden pasarse por el modelo para obtener texto legible antes de indexarlo o archivarlo.
- Preparación de subtítulos y transcripciones: la combinación de puntuación y segmentación permite dividir un flujo continuo de palabras en frases con formato correcto.
- Preprocesado para análisis de texto posterior: la capitalización y segmentación mejoran tareas posteriores de etiquetado, resumen o análisis sintáctico que asumen texto puntuado.
- Limpieza de datos de entrenamiento: textos extraídos de fuentes sin formato (chats, notas, registros de voz) se pueden normalizar antes de incorporarlos a corpus de entrenamiento.
- Funcionalidad en línea sin conexión: al ejecutarse localmente en CoreML, permite aplicaciones de dictado que no envían texto a servidores externos, relevante por privacidad.
- Integración en editores de texto y herramientas de escritura: corrección automática de puntuación y mayúsculas sobre bloques de hasta 256 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros). El único dato de validación reportado es cualitativo: la salida de la versión CoreML coincidió con la del modelo ONNX original en las 15 frases de prueba utilizadas por el autor de la conversión. El rendimiento declarado es de aproximadamente 9 ms por frase en Apple Silicon.

## Requisitos de hardware

- VRAM: no aplica en el sentido habitual; el modelo está pensado para ejecución en dispositivo sobre CoreML, no para GPU de servidor. El tamaño del repositorio es de 0,1 GB.
- Plataforma objetivo: macOS 15 o superior sobre Apple Silicon, con el modelo compilado `PunctCapSeg.mlmodelc`.
- GPU dedicadas (A100, H100, RTX 4090): no aplica; el artefacto distribuido es CoreML y no está orientado a esos entornos.
- Compatibilidad con hardware de consumo: el modelo está diseñado precisamente para hardware Apple de consumo (portátiles y equipos de sobremesa con Apple Silicon) mediante int8.
- Opciones de despliegue: CoreML en aplicaciones Apple. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de modelo y formato.
- Latencia estimada: aproximadamente 9 ms por frase de hasta 256 tokens en Apple Silicon, según el autor de la conversión. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Idioma | Tarea | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PUSHTYPE/punct-cap-seg-en-coreml | Inglés | Puntuación, truecasing, segmentación | 256 tokens | int8 (pesos) | Apache 2.0 | CoreML |
| 1-800-BAD-CODE/punctuation_fullstop_truecase_english | Inglés | Puntuación, truecasing, segmentación | No disponible (modelo de origen en ONNX) | FP32/ONNX | Apache 2.0 | ONNX |
| 1-800-BAD-CODE/punct_cap_seg_47_language | 47 idiomas | Puntuación, truecasing, segmentación | No disponible | No disponible | No disponible | Hugging Face |
| soloish90/punct-cap-seg-en-coreml-int8 | Inglés | Puntuación, truecasing, segmentación | No disponible | int8 | No disponible | CoreML |

La diferencia principal frente al modelo original es exclusivamente el formato y la cuantización: la versión de PUSHTYPE añade int8 y el empaquetado CoreML, sin reentrenamiento. Frente a la variante multilingüe de 47 idiomas, este repositorio cubre solo inglés.

## Limitaciones y advertencias

- Cobertura de idioma limitada al inglés; no debe usarse con texto en otros idiomas.
- Ventana de entrada fija de 256 tokens, con relleno mediante el token 3; los textos más largos deben trocearse, lo que puede degradar la coherencia de la segmentación en las fronteras.
- Requiere texto de entrada en minúsculas, sin puntuar y sin segmentar; alimentarlo con texto ya procesado puede producir resultados no deseados.
- No es un modelo generativo: no mantiene conversación, no responde preguntas ni sigue instrucciones.
- Riesgo de errores de puntuación y capitalización en dominios especializados, nombres propios o jerga, inherente a la tarea; no se documentan tasas de error ni evaluación exhaustiva.
- La cuantización int8 introduce una posible pérdida de calidad respecto al modelo original, aunque el autor afirma coincidencia en 15 frases de prueba, una muestra muy reducida.
- La decisión explícita de evitar activaciones FP16 implica que cualquier intento de reconvertir el modelo a media precisión puede degradar la calidad de forma silenciosa por desbordamiento de la constante de la máscara de atención.
- Licencia Apache 2.0, que permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y los créditos; el mérito del modelo corresponde al autor original.
- Repositorio con 0 descargas y 0 "likes" en el momento de la consulta, sin comunidad ni mantenimiento documentado; conviene verificar la compatibilidad con la versión de macOS y coremltools antes de integrarlo en producción.
- Ausencia total de resultados de benchmarks publicados, lo que dificulta estimar su calidad frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PUSHTYPE/punct-cap-seg-en-coreml
- Modelo base original: https://huggingface.co/1-800-BAD-CODE/punctuation_fullstop_truecase_english
- Variante multilingüe de 47 idiomas: https://huggingface.co/1-800-BAD-CODE/punct_cap_seg_47_language
- Variante CoreML int8 de otro autor: https://huggingface.co/soloish90/punct-cap-seg-en-coreml-int8
- Repositorio de inferencia del autor original: https://github.com/1-800-BAD-CODE/punctuators
- Lista de modelos CoreML: https://github.com/likedan/Awesome-CoreML-Models
