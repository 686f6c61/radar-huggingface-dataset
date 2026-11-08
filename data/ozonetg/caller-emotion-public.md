# ozonetg/caller-emotion-public

## Resumen

`ozonetg/caller-emotion-public` es un conjunto de modelos de reconocimiento de emociones en voz orientados especificamente a llamadas telefonicas en ingles y arabe. Lo desarrolla el usuario ozonetg y se publica bajo licencia Apache-2.0, aunque esa licencia cubre unicamente el codigo y las cabezas de clasificacion escritas para el repositorio; cada componente de terceros conserva su propia licencia. El modelo resuelve el problema de inferir el estado emocional del interlocutor a partir de audio mono float32 a 16 kHz, devolviendo puntuaciones para siete emociones: angry, disgusted, fearful, happy, neutral, sad y surprised.

La aproximacion tecnica es poco convencional: no se entrena con etiquetas humanas de emocion, sino que se congela un encoder de voz preentrenado y se anade una cabeza pequena que predice 55 atributos emocionales; una tabla fija transforma despues esos atributos en las siete emociones finales. El repositorio incluye varias variantes segun el encoder utilizado (Qwen3-ASR, Parakeet, Whisper large-v3 y un modelo de palabras multilingue de Horizon Labs), con pesos en formato ONNX para las variantes ligeras y checkpoints NeMo o torch para las pesadas.

Es relevante ahora porque propone un pipeline de emociones de bajo coste computacional (las variantes ONNX solo requieren numpy y onnxruntime) para un dominio concreto y poco cubierto como es el audio telefonico de 8 kHz, y porque documenta de forma transparente sus fuentes, licencias y limitaciones. El tamano del repositorio es de 1,6 GB y el modelo no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de voz congelado (Qwen3-ASR, Parakeet, Whisper large-v3 o modelo de palabras multilingue) mas cabeza de clasificacion entrenada que predice 55 atributos emocionales y tabla fija a 7 emociones |
| Parametros totales | no disponible (depende de la variante: el encoder Parakeet base es de 110M; el encoder Qwen3-ASR es de 1,7B; Whisper large-v3 es de 1550M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (las variantes ONNX se distribuyen comprimidas, sin detalle de precision) |
| Idiomas soportados | en, ar |
| Licencia | Apache-2.0 para codigo y cabezas; cada componente de terceros mantiene su licencia (Apache-2.0, CC BY 4.0, CC BY 3.0) |
| Formato de pesos | ONNX (qwen_emotion, parakeet_emotion, horizon_small_emotion); NeMo (.nemo) para parakeet_original; torch para cabezas y whisper_emotion |

## Arquitectura y entrenamiento

El diseno sigue un esquema de destilacion o transferencia desde un modelo maestro: se parte de un encoder de voz preentrenado que permanece congelado y se entrena una cabeza ligera que predice 55 atributos emocionales. Esos atributos se mapean mediante una tabla fija a las siete emociones finales. El autor indica explicitamente que no se utilizaron etiquetas humanas de emocion en el entrenamiento; el profesor declarado es `laion/Empathic-Insight-Voice-Small` (CC BY 4.0). El audio de entrenamiento procede de `espnet/yodas2` (CC BY 3.0), y la variante Parakeet se ajusto ademas con voz telefonica real que no se ha publicado.

Las variantes disponibles son: `qwen_emotion` (encoder Qwen3-ASR-1.7B comprimido con cabeza, requiere numpy y onnxruntime), `parakeet_emotion` (encoder Parakeet ajustado con voz telefonica, comprimido con cabeza), `horizon_small_emotion` (modelo de palabras multilingue en ONNX, requiere ademas tokenizers), `whisper_emotion` (cabeza para Whisper large-v3, requiere torch, transformers y GPU), `parakeet_original` (checkpoint completo en formato NeMo para reconstruir caracteristicas) y `students` (cabezas entrenadas en torch). No se detalla el numero de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Clasificacion de emociones en audio de llamadas telefonicas con siete clases de salida: angry, disgusted, fearful, happy, neutral, sad y surprised.
- Prediccion intermedia de 55 atributos emocionales, lo que permite analisis mas granular que la etiqueta final.
- Procesamiento de audio mono float32 a 16 kHz mediante una funcion `scores()` que devuelve las siete puntuaciones en el orden de `model.classes`.
- Soporte multilingue limitado a ingles y arabe.
- Ejecucion ligera sin GPU en las variantes ONNX (numpy y onnxruntime), con control de hilos mediante el parametro `threads`.
- Variante basada en Whisper large-v3 para entornos con GPU y stack de transformers.
- No se documentan capacidades de tool calling, agentes, vision, audio generativo ni modo de razonamiento explicito.

## Casos de uso

- Enrutamiento de llamadas en centros de contacto: las puntuaciones de emociones permiten clasificar el tono del cliente y derivar la llamada a un agente especializado o a un supervisor cuando se supera un umbral de enfado.
- Alertas en tiempo real para agentes: integrando la variante ONNX en el pipeline de telefonia, se pueden generar avisos cuando la emocion detectada cambia durante la conversacion, con la linea de alerta calibrada sobre el trafico propio.
- Analitica de calidad post-llamada: procesar grabaciones por lotes con `parakeet_emotion` o `qwen_emotion` para construir metricas agregadas de satisfaccion y detectar patrones de friccion.
- Investigacion en pragmatica y paralinguistica: el esquema de 55 atributos intermedios permite estudiar correlaciones entre rasgos acusticos y estados emocionales sin depender de etiquetas humanas.
- Moderacion de contenido en audio: detectar tono hostil o disgusto en grabaciones de atencion al cliente o en plataformas de voz.
- Prototipado rapido en entornos sin GPU: la variante `horizon_small_emotion` en ONNX permite desplegar un clasificador de emociones en un servicio Python ligero con solo numpy, onnxruntime y tokenizers.
- Evaluacion comparativa de encoders de voz: al compartir cabeza y tabla de mapeo, las variantes Qwen, Parakeet y Whisper permiten comparar el comportamiento de distintos encoders sobre el mismo corpus telefonico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor senala que son resultados de investigacion no probados en llamadas reales, que la asignacion de una unica emocion dominante por turno es debil y que las clases fearful y disgusted cuentan con pocos ejemplos de test.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Como referencia, la variante `whisper_emotion` requiere una GPU (Whisper large-v3 tiene 1550M parametros); las variantes ONNX (`qwen_emotion`, `parakeet_emotion`, `horizon_small_emotion`) estan pensadas para ejecucion en CPU con numpy y onnxruntime.
- GPU recomendadas: no disponibles. La unica indicacion del autor es que `whisper_emotion` necesita GPU; para el resto no se especifica modelo de GPU.
- Cabe en GPU de consumo: no confirmado. Las variantes ONNX no requieren GPU; la variante Whisper large-v3 en fp16 ronda los 3 GB de VRAM, aunque este dato no lo aporta la model card.
- Opciones de despliegue: onnxruntime (variantes ONNX), torch y transformers (whisper_emotion), nemo_toolkit y torch (parakeet_original).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| ozonetg/caller-emotion-public | Depende de la variante (110M a 1550M en el encoder) | no disponible | en, ar | Apache-2.0 (codigo y cabezas) | ONNX, NeMo, torch | Enfocado a llamadas telefonicas; 7 emociones; sin etiquetas humanas |
| laion/Empathic-Insight-Voice-Small | no disponible | no disponible | no disponible | CC BY 4.0 | no disponible | Profesor declarado del entrenamiento |
| Horizon-Labs/multilingual-emotions-small | no disponible | no disponible | multilingue | Apache-2.0 | no disponible | Fuente del modelo de palabras incluido |
| nvidia/parakeet-tdt_ctc-110m | 110M | no disponible | en | CC BY 4.0 | NeMo | Encoder base de la variante Parakeet |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Resultados de investigacion no validados en llamadas en produccion; el autor lo advierte explicitamente.
- Las puntuaciones no estan calibradas: cualquier umbral de alerta debe fijarse con trafico propio.
- La asignacion de una unica emocion dominante por turno es debil; se recomienda usar ranking con umbral en lugar de la etiqueta top-1.
- Las clases fearful y disgusted tienen pocos ejemplos de test, por lo que su fiabilidad es menor.
- Solo cubre ingles y arabe.
- La licencia Apache-2.0 del repositorio cubre unicamente codigo y cabezas; los encoders y datasets de terceros mantienen sus propias licencias (Apache-2.0, CC BY 4.0, CC BY 3.0), que deben revisarse antes de uso comercial.
- Los derechos del audio de YouTube de YODAS figuran como declarados, no confirmados.
- El ajuste de Parakeet se entreno con voz telefonica real que no se ha publicado, lo que limita la reproducibilidad.
- No se documentan sesgos especificos ni tasas de alucinacion; al ser un clasificador, el riesgo principal es la mala calibracion y el desequilibrio entre clases.

## Enlaces

- [Hugging Face: ozonetg/caller-emotion-public](https://huggingface.co/ozonetg/caller-emotion-public)
- [Qwen/Qwen3-ASR-1.7B-hf](https://huggingface.co/Qwen/Qwen3-ASR-1.7B-hf)
- [openai/whisper-large-v3](https://huggingface.co/openai/whisper-large-v3)
- [nvidia/parakeet-tdt_ctc-110m](https://huggingface.co/nvidia/parakeet-tdt_ctc-110m)
- [Horizon-Labs/multilingual-emotions-small](https://huggingface.co/Horizon-Labs/multilingual-emotions-small)
- [laion/Empathic-Insight-Voice-Small](https://huggingface.co/laion/Empathic-Insight-Voice-Small)
- [espnet/yodas2](https://huggingface.co/datasets/espnet/yodas2)
- [ozonetg/parakeet-110m-caller-asr](https://huggingface.co/ozonetg/parakeet-110m-caller-asr/tree/main)
- [ozonetg/parakeet-0.6b-caller-asr](https://huggingface.co/ozonetg/parakeet-0.6b-caller-asr)
