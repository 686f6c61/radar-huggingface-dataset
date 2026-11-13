# codebucketsolutions/bolo-syspin-maithili-male

## Resumen

`bolo-syspin-maithili-male` es un modelo de síntesis de voz (text-to-speech) para maithili, una lengua indoaria hablada principalmente en el estado de Bihar (India) y en la región oriental de Nepal. Lo publica el usuario `codebucketsolutions` dentro del ecosistema del servidor de voz `bolo`, un proyecto que ejecuta inferencia TTS sin PyTorch apoyándose en `sherpa-onnx`. El modelo es una conversión de formato del checkpoint original `SYSPIN/vits_Maithili_Male`, desarrollado por el proyecto SYSPIN del SPIRE Lab (Indian Institute of Science, Bengaluru).

La arquitectura es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo condicional variacional con discriminador adversarial que genera audio de forma directa desde texto sin pipeline acústico intermedio. El repositorio pesa aproximadamente 0,1 GB y contiene pesos en formato ONNX, lo que permite desplegarlo en entornos ligeros basados en ONNX Runtime sin dependencias de PyTorch.

Su relevancia es doble: por un lado cubre una lengua de bajos recursos con escasa representación en el ecosistema TTS abierto; por otro, demuestra el patrón de conversión de checkpoints Coqui VITS a ONNX para integrarlos en servidores de voz embebidos. No se han publicado datos de arquitectura detallados, número de parámetros ni longitud de contexto en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS con aprendizaje adversarial) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | maithili (`mai`) |
| Licencia | MIT (pesos); datos de entrenamiento CC-BY-4.0 (corpus SYSPIN) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS, un sistema TTS end-to-end que combina un encoder de texto, un prior variacional condicionado por texto, un decoder generativo y un discriminador adversarial multiperiodo. VITS infiere directamente la forma de onda desde la secuencia de texto, evitando la necesidad de un modelo acústico separado y un vocoder independiente. Esta arquitectura es habitual en despliegues ligeros por su calidad razonable con un coste computacional moderado.

El entrenamiento original corresponde al proyecto SYSPIN del SPIRE Lab (IISc Bengaluru) sobre el corpus SYSPIN de TTS, publicado bajo licencia CC-BY-4.0. El repositorio aquí descrito no entrena ni modifica los pesos: es una conversión de formato del checkpoint Coqui VITS a ONNX realizada con la herramienta `tools/voices/export_syspin.py` del proyecto bolo. No se dispone de información sobre número de tokens de entrenamiento, composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en TTS).

## Capacidades

- Síntesis de voz (TTS) a partir de texto en maithili, con voz masculina.
- Generación de audio end-to-end mediante VITS, sin vocoder separado.
- Inferencia sobre ONNX Runtime, sin dependencia de PyTorch.
- Integración con el servidor de voz `bolo` mediante `bolo pull syspin-mai-male`.
- Compatible con el ecosistema `sherpa-onnx` para despliegue embebido.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (es un modelo TTS, no un LLM).
- No dispone de capacidades multimodales de entrada (visión, audio) ni de modo "thinking".
- Cobertura monolingüe: únicamente maithili.

## Casos de uso

- **Locución para asistentes de voz en maithili**: el modelo permite dotar de voz masculina a asistentes conversacionales dirigidos a hablantes de maithili, una lengua con poca cobertura TTS comercial. Se integra vía `bolo` o `sherpa-onnx` en el backend del asistente.
- **Lectura de contenido para accesibilidad**: conversión de artículos, noticias o documentación a audio para personas con discapacidad visual o dificultades de lectura en Bihar y Nepal. El tamaño reducido del repositorio (0,1 GB) facilita el despliegue en servidores modestos.
- **Sistemas de megafonía y avisos automatizados**: generación de anuncios pregrabados en maithili para transporte público, hospitales o administraciones locales, donde la disponibilidad de voces masculinas nativas es limitada.
- **Aprendizaje de idiomas**: aplicación educativa que pronuncie frases en maithili para estudiantes o hablantes de la diáspora, aprovechando la voz masculina nativa del corpus SYSPIN.
- **Doblaje y producción de audio de bajo coste**: generación de pistas de voz para vídeos educativos o divulgativos en maithili, sustituyendo la locución manual en proyectos con presupuesto limitado.
- **Investigación en TTS de bajos recursos**: el modelo sirve como referencia reproducible para estudiar conversiones Coqui VITS a ONNX y para comparar calidad en lenguas indoarias de bajos recursos dentro de pipelines `sherpa-onnx`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,1 GB) y la arquitectura VITS, la huella de memoria es muy reducida (del orden de cientos de MB en runtime).
- GPU recomendadas: no se especifican; VITS en ONNX Runtime puede ejecutarse en CPU con latencia aceptable para síntesis por frases.
- Cabe en GPU de consumo: previsiblemente sí en cualquier GPU moderna con unos pocos GB de VRAM, aunque no hay cifras publicadas.
- Opciones de despliegue: `bolo` (servidor de voz sin PyTorch) y `sherpa-onnx`; al ser ONNX, es compatible con ONNX Runtime en CPU, GPU y entornos embebidos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Formato | Licencia | Contexto / tamaño |
|---|---|---|---|---|---|
| `bolo-syspin-maithili-male` | maithili | VITS | ONNX | MIT (pesos) / CC-BY-4.0 (datos) | repo 0,1 GB |
| `SYSPIN/vits_Maithili_Male` (origen) | maithili | VITS | Coqui checkpoint | MIT (pesos) / CC-BY-4.0 (datos) | no disponible |
| Otros modelos SYSPIN del proyecto bolo | distintas lenguas indias | VITS | ONNX | MIT / CC-BY-4.0 | no disponible |

No se dispone de datos de rendimiento comparativo (MOS, RTF, WER) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo monolingüe: solo sintetiza maithili; no admite entrada en otros idiomas.
- Voz única masculina: no hay variantes de hablante ni control de prosodia más allá de lo que permita el modelo base.
- Es una conversión de formato, no un reentrenamiento: cualquier limitación del checkpoint original SYSPIN se hereda íntegramente.
- Riesgo de alucinación acústica: como todo TTS, puede producir pronunciaciones incorrectas ante texto fuera de dominio, neologismos o préstamos no vistos en entrenamiento.
- Sesgos potenciales derivados del corpus SYSPIN (posible sobrerrepresentación de determinados registros o acentos); no se documentan análisis de sesgo en la información disponible.
- Licencia MIT para los pesos, pero los datos de entrenamiento son CC-BY-4.0: en usos comerciales conviene revisar las obligaciones de atribución del corpus SYSPIN.
- No se han publicado métricas de calidad (MOS, inteligibilidad) ni evaluaciones independientes.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria conocida.

## Enlaces

- Hugging Face: https://huggingface.co/codebucketsolutions/bolo-syspin-maithili-male
- Modelo original: https://huggingface.co/SYSPIN/vits_Maithili_Male
- Proyecto bolo: https://github.com/cb-Sigma/bolo
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- sherpa-onnx: no disponible en la información proporcionada
