# marcosmaceo/tiny-voca-es

## Resumen

tiny-voca-es es un modelo de síntesis de voz (text-to-speech) en castellano (es-ES) desarrollado por marcosmaceo. Se trata de un fork en español del modelo tiny-voca de Muhammed Nazeem (n4ze3m), del que hereda la arquitectura, la receta de entrenamiento y el generador de forma de onda; esta versión cambia el front-end de texto, el inventario de fonemas, las voces y los datos. El modelo completo, incluyendo el generador de waveform, tiene 4.534.411 parámetros y se entrenó desde cero sobre aproximadamente 22,7 horas de voz sintética.

El modelo ofrece dos voces, F2 (femenina) y M2 (masculina), con distinción entre s y z propia del castellano, y genera audio mono a 24 kHz. Su principal atractivo es la eficiencia: funciona más rápido que el tiempo real en la CPU de un portátil, entre 36 y 77 veces tiempo real en ONNX Runtime, lo que lo hace apto para despliegues ligeros sin GPU.

No emplea pesos preentrenados: el entrenamiento parte de cero y alcanza el paso 142.000. Se distribuye con licencia Apache-2.0 para pesos y código, aunque el fonemizador eSpeak NG 1.52.0, del que depende el front-end, está bajo GPL-3.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | source-filter (generador de forma de onda incluido), según tags del repo |
| Parametros totales | 4.534.411 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (texto de cualquier longitud, procesado frase a frase) |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | español (castellano, es-ES) |
| Licencia | Apache-2.0 (pesos y código); eSpeak NG es GPL-3.0 |
| Formato de pesos | PyTorch (.pt, float32) y ONNX (.onnx, float32, opset 17) |
| Frecuencia de salida | 24 kHz mono |
| Voces | F2 (femenina) y M2 (masculina) |
| Entrada | texto convertido a fonemas con eSpeak NG 1.52.0 |
| Pesos preentrenados | ninguno |
| Paso de entrenamiento | 142.000 |
| Datos de entrenamiento | ~22,7 horas de voz sintética |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de tipo source-filter con un generador de forma de onda integrado, según la información disponible. El grafo ONNX recibe identificadores de fonemas y valores de estrés y devuelve directamente la forma de onda; la señal de ruido se genera dentro del propio grafo. La excitación mixta se describe en el archivo ONNX exportado. No se detallan en la información proporcionada el número de capas, las dimensiones internas ni los detalles del bloque de atención.

El entrenamiento parte desde cero, sin pesos preentrenados, durante 142.000 pasos sobre aproximadamente 22,7 horas de voz sintética (dataset marcosmaceo/tiny-voca-es). No se especifican en la información disponible la composición exacta del dataset, el número de tokens de audio ni si se aplicaron técnicas de RLHF o DPO, algo poco habitual en modelos TTS. La innovación principal respecto al modelo original es la adaptación del front-end de texto y del inventario de fonemas al castellano, incluyendo la distinción entre s y z.

## Capacidades

- Síntesis de voz en castellano (es-ES) a partir de texto, con salida mono a 24 kHz.
- Dos voces seleccionables: F2 (femenina) y M2 (masculina).
- Distinción fonémica entre s y z, propia del castellano peninsular.
- Control de velocidad de habla mediante el parámetro `speed`.
- Control de tono mediante `pitch_shift` (añadido al log F0; 0,058 equivale aproximadamente a un semitono) y `pitch_range` (escala el movimiento de tono alrededor de la media del enunciado).
- Procesamiento de texto de cualquier longitud: se lee frase a frase y se concatenan los fragmentos de audio.
- Fonemización mediante eSpeak NG 1.52.0, con español como idioma por defecto.
- Inferencia en CPU más rápida que tiempo real (36 a 77 veces tiempo real en ONNX Runtime).
- Exportación ONNX con opset 17 para despliegue sin PyTorch.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio de entrada ni modo de razonamiento.

## Casos de uso

- Lectura de textos largos en aplicaciones de accesibilidad: el modelo procesa texto de cualquier longitud frase a frase y lo convierte en audio, lo que permite narrar documentos completos para personas con discapacidad visual sin depender de servicios en la nube.
- Asistentes de voz embebidos en dispositivos de baja potencia: al ejecutarse entre 36 y 77 veces tiempo real en CPU de portátil con ONNX Runtime, puede integrarse en raspberry pi o portátiles sin GPU para respuestas habladas en local.
- Generación de audiolibros y pódcast sintéticos: las dos voces (F2 y M2) permiten alternar narradores, y los controles de velocidad y tono facilitan ajustar el ritmo de lectura por capítulo.
- Prototipado rápido de interfaces conversacionales: el modelo se puede usar como capa TTS en un pipeline de chatbot para pruebas de usabilidad, sustituyendo servicios comerciales durante el desarrollo.
- Sistemas de anuncios y avisos automatizados: frases cortas como avisos de transporte o alertas de domótica se sintetizan en milisegundos en CPU, con control de velocidad para mensajes urgentes.
- Generación de datos de voz sintética para aumento de datasets: al estar entrenado sobre voz sintética y ser ligero, puede emplearse para producir muestras de audio en castellano con fines de experimentación en ASR o diarización.
- Aplicaciones de aprendizaje de idiomas: la distinción s/z y el control de velocidad permiten generar ejemplos de pronunciación castellana a distintas velocidades para estudiantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento aportado es la velocidad de inferencia: entre 36 y 77 veces tiempo real en ONNX Runtime sobre CPU de portátil, sin especificar el hardware exacto ni las condiciones de medida.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en CPU; en GPU, el modelo float32 de 4,5 M de parámetros ocupa del orden de decenas de MB, por lo que cualquier GPU con más de 1 GB de VRAM es suficiente (estimación a partir del tamaño del checkpoint de 18,2 MB en .pt y 21,4 MB en .onnx).
- GPU recomendadas: no se especifican; el modelo está diseñado para CPU y no requiere GPU dedicada.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) e incluso en CPU de portátil.
- Opciones de despliegue: ONNX Runtime (formato .onnx, opset 17) y PyTorch con el código del repositorio stdevMac/tiny-voca. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo TTS de este tipo.
- Latencia y throughput: 36 a 77 veces tiempo real en CPU de portátil con ONNX Runtime, según el autor.
- Requisito adicional: eSpeak NG 1.52.0 instalado como programa en el PATH para la fonemización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| tiny-voca-es | 4.534.411 | no disponible | es-ES | Apache-2.0 (eSpeak NG GPL-3.0) | .pt, .onnx | Dos voces, entrenado desde cero, ~22,7 h sintéticas, CPU |
| tiny-voca (n4ze3m) | no disponible | no disponible | inglés | no disponible en la información | no disponible | Modelo original del que deriva el fork |
| Alternativas TTS multilingües (p. ej. Piper, Coqui TTS) | no disponible | no disponible | varios | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones detalladas de modelos alternativos que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre voz sintética (~22,7 horas), lo que puede introducir artefactos propios de la voz generada y limitar la naturalidad frente a modelos entrenados con voz humana.
- Solo soporta castellano (es-ES); no se documentan otros idiomas ni variantes dialectales.
- El modelo puede generar picos de amplitud superiores a 1,0; el autor recomienda normalizar la salida (por ejemplo, escalando para que el máximo no supere 0,99).
- Dependencia de eSpeak NG 1.52.0 como programa externo en el PATH: la versión es crítica y el fonemizador está bajo GPL-3.0, lo que puede afectar a la distribución comercial del conjunto.
- El front-end de texto vive en el repositorio de GitHub, no en el paquete de Hugging Face, por lo que el uso requiere clonar el código.
- No se documentan sesgos específicos ni tasas de alucinación; al ser un modelo TTS, el riesgo principal es la pronunciación incorrecta o la prosodia antinatural en textos fuera del dominio de entrenamiento.
- Licencia Apache-2.0 para pesos y código, pero la licencia GPL-3.0 de eSpeak NG debe evaluarse antes de un uso comercial combinado.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha; sin validación comunitaria ni benchmarks publicados.
- No se documentan capacidades de control de emoción, estilo ni clonación de voz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/marcosmaceo/tiny-voca-es
- Dataset: https://huggingface.co/datasets/marcosmaceo/tiny-voca-es
- Código: https://github.com/stdevMac/tiny-voca
- Demo en vivo: https://stdevmac.github.io/tiny-voca/
- Modelo original en inglés: https://huggingface.co/n4ze3m/tiny-voca
