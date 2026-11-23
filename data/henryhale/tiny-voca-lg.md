# henryhale/tiny-voca-lg

## Resumen

tiny-voca-lg es un modelo de síntesis de voz (text-to-speech) para luganda desarrollado por henryhale, un fine-tuning del modelo inglés n4ze3m/tiny-voca (Apache-2.0). Con tan solo 4.537.291 parámetros, el modelo genera audio mono a 24 kHz a partir de texto en luganda, ofreciendo dos voces: F2 (femenina) y M2 (masculina). Su relevancia radica en ser un TTS extremadamente ligero para una lengua de bajos recursos, desplegable tanto en servidor como directamente en navegador mediante ONNX Runtime Web.

El modelo parte de los pesos del tiny-voca inglés y se ajusta sobre el corpus CraneAILabs/waxal-lug-clean (CC BY 4.0, derivado de WaxalNLP), empleando únicamente unas 3,2 horas de audio tras el corte y alineamiento. La fonética del luganda se mapea sobre el inventario de fonemas del modelo inglés, sin añadir símbolos nuevos, lo que simplifica la integración pero limita la fidelidad tonal.

La arquitectura es un TTS acústico compacto que recibe identificadores de fonemas y valores de estrés, y devuelve la forma de onda directamente. Se distribuye en PyTorch (float32, 18 MB) y ONNX (opset 17, 21,4 MB), con un front-end específico de luganda (`lug.py`) que convierte la ortografía en fonemas. Es una opción práctica para integrar voz en aplicaciones de luganda con recursos de cómputo mínimos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS acústico compacto (fine-tuning de n4ze3m/tiny-voca); entrada de fonemas y estrés, salida de forma de onda |
| Parametros totales | 4.537.291 (4,5 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens por llamada; hasta 32 segundos de audio por utterance |
| Tipos de cuantizacion | no disponible (pesos distribuidos en float32) |
| Idiomas soportados | luganda (lg) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`tiny-voca-lug.pt`, float32, 18 MB) y ONNX (`model.onnx`, float32, opset 17, 21,4 MB); metadatos en `model.json` |
| Frecuencia de muestreo | 24 kHz mono |
| Voces | F2 (femenina) y M2 (masculina) |
| Checkpoint | paso 4.000 |
| Modelo base | n4ze3m/tiny-voca |
| Dataset de entrenamiento | CraneAILabs/waxal-lug-clean (CC BY 4.0) |

## Arquitectura y entrenamiento

El modelo es un sistema de síntesis de voz compacto derivado del tiny-voca inglés. La inferencia recibe tres entradas discretas (identificadores de fonemas, valores de estrés e identificador de voz) más tres escalares continuos (velocidad, desplazamiento de tono y rango de tono), y produce directamente la forma de onda a 24 kHz junto con las duraciones predichas. El texto se convierte a fonemas fuera del grafo, mediante el front-end de luganda (`lug.py`), que mapea la ortografía del luganda sobre el inventario de fonemas del modelo inglés sin introducir símbolos nuevos.

El entrenamiento parte de los pesos del tiny-voca inglés (`--init-weights`) y se ajusta sobre CraneAILabs/waxal-lug-clean: 3,2 horas de audio tras corte y alineamiento (95 minutos de F2 y 96 minutos de M2), con 1.040 fragmentos de entrenamiento y 39 de validación de entre 4 y 18 segundos. Se emplearon 4.000 pasos, batch de 9.000 frames por GPU y tasa de aprendizaje 2e-4, sobre dos GPUs Kaggle T4 en paralelo de datos durante aproximadamente una hora. Las duraciones de fonemas se obtuvieron por alineamiento forzado con `facebook/wav2vec2-lv-60-espeak-cv-ft`, usado únicamente para etiquetar los datos de entrenamiento. Las grabaciones largas de Waxal se cortaron en las pausas entre palabras.

## Capacidades

- Síntesis de voz en luganda a partir de texto, con salida mono a 24 kHz.
- Dos voces seleccionables: F2 (femenina) y M2 (masculina).
- Control de velocidad de habla (`--speed`), desplazamiento de tono (`--pitch-shift`, donde 0,058 equivale aproximadamente a un semitono) y rango de tono (`--pitch-range`).
- Conversión de texto a fonemas mediante reglas ortográficas del luganda (`lug.py`), sin diccionario fonético externo.
- Inferencia en PyTorch y en ONNX Runtime (CPU), incluyendo onnxruntime-web para ejecución en navegador.
- Procesamiento por utterance: hasta 512 tokens y 32 segundos por llamada; el texto largo debe dividirse en frases.
- Lectura de texto desde fichero (`--text-file`) además de la entrada directa por línea de comandos.
- No soporta tool calling, agentes, visión, audio de entrada ni razonamiento multi-paso; es exclusivamente un modelo TTS.

## Casos de uso

- Lectura de contenidos en luganda: convertir artículos, noticias o documentación a audio para aplicaciones de accesibilidad o consumo pasivo, aprovechando el tamaño reducido del modelo para desplegarlo en servidores modestos.
- Asistentes de voz en luganda: integrar el modelo como capa de síntesis en un asistente conversacional, con dos voces para alternar interlocutores o géneros según el contexto.
- Aplicaciones educativas de aprendizaje de idiomas: generar pronunciaciones de vocabulario y frases en luganda con control de velocidad para adaptarse a distintos niveles, usando `--speed` para ralentizar la reproducción.
- Sistemas de anuncios y avisos automatizados: sintetizar mensajes dinámicos (por ejemplo, avisos de salud pública o información de servicios) en luganda, dividiendo el texto en frases y generando audio por utterance.
- Síntesis en el navegador sin backend: desplegar `model.onnx` con onnxruntime-web y el front-end `lug.js` para ofrecer lectura de texto en luganda del lado del cliente, sin Python ni servidor de inferencia.
- Prototipado e investigación en TTS de bajos recursos: servir como base para fine-tuning sobre otras lenguas o para experimentar con adaptación de modelos TTS ingleses a idiomas de bajos recursos, dado su reducido coste de entrenamiento (unas horas en GPUs T4).
- Generación de audio para pruebas de pipelines de voz: producir clips de referencia en luganda para evaluar sistemas de ASR, traducción o subtitulado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se ha realizado una evaluación formal ni una prueba de escucha.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; los pesos en float32 ocupan 18 MB (PyTorch) y 21,4 MB (ONNX), por lo que la inferencia cabe holgadamente en cualquier GPU consumer, e incluso en CPU.
- GPU recomendadas: cualquiera; el entrenamiento se realizó en dos Kaggle T4, pero la inferencia no requiere GPU dedicada. Una RTX 4090, A100 o H100 están sobredimensionadas para este modelo.
- Cabe en cualquier GPU consumer (GTX 1050 en adelante, sin problema) y también en CPU y en navegador mediante onnxruntime-web.
- Opciones de despliegue: PyTorch (paquete `tiny_voca` instalable desde GitHub), ONNX Runtime (Python) y onnxruntime-web (JavaScript, demo en `web/` del repositorio).
- Latencia y throughput estimados: no disponibles; la model card no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Contexto / límite | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-voca-lg | 4,5 M | Luganda | 512 tokens / 32 s por utterance | Apache-2.0 | Hugging Face + GitHub |
| n4ze3m/tiny-voca | no disponible | Inglés | no disponible | Apache-2.0 | Hugging Face |
| facebook/wav2vec2-lv-60-espeak-cv-ft | no disponible | Multilingüe (ASR) | no aplica (ASR) | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de modelos TTS comparables en la información proporcionada para establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- La pronunciación se deriva de reglas ortográficas; el tono no se escribe en luganda y no está modelado, lo que puede producir una entonación poco natural.
- Los dígitos no se leen: es necesario escribir los números con palabras.
- Los préstamos del inglés y los nombres propios se leen con reglas del luganda, lo que puede generar pronunciaciones incorrectas.
- Entrenado con unas 3 horas de audio de solo dos hablantes; la variedad de voces y estilos es muy limitada.
- No se ha realizado evaluación formal ni prueba de escucha, por lo que la calidad subjetiva no está documentada.
- El audio puede superar el rango [-1, 1]; la model card recomienda normalizar (`audio * min(1.0, 0.99 / np.abs(audio).max())`) antes de guardar.
- Procesa una utterance por llamada (máximo 512 tokens y 32 segundos); el texto largo debe dividirse en frases y terminar cada una con un signo de puntuación.
- El paquete se instala como `tiny_voca`, igual que el upstream, por lo que debe usarse en un entorno aislado; es necesario fijar el front-end de luganda (`set_frontend("lug")` o `TINY_VOCA_FRONTEND=lug`) antes de cargar el modelo.
- Licencia Apache-2.0: permite uso comercial, pero los datos de entrenamiento (CraneAILabs/waxal-lug-clean) son CC BY 4.0 y requieren atribución; conviene revisar las condiciones de WaxalNLP.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/henryhale/tiny-voca-lg
- Repositorio GitHub (código, front-end de luganda y demo web): https://github.com/henryhale/tiny-voca-lg
- Notebook de entrenamiento: https://github.com/henryhale/tiny-voca-lg/tree/master/notebooks
- Modelo base n4ze3m/tiny-voca: https://huggingface.co/n4ze3m/tiny-voca
- Dataset CraneAILabs/waxal-lug-clean: https://huggingface.co/datasets/CraneAILabs/waxal-lug-clean
- Modelo de alineamiento forzado facebook/wav2vec2-lv-60-espeak-cv-ft: https://huggingface.co/facebook/wav2vec2-lv-60-espeak-cv-ft
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
