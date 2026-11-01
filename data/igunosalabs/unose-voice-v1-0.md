# igunosalabs/Unose-Voice-v1.0

## Resumen

Unose Voice v1.0 es un modelo de síntesis de voz (text-to-speech) neuronal desarrollado por Igunosa Labs como parte de su suite de voz Unose. Está construido sobre la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), una familia de modelos que combina un encoder de texto, un decoder acústico y un vocoder en un único grafo extremo a extremo, lo que permite generar audio de forma directa a partir de texto sin etapas intermedias separadas.

El modelo se distribuye como un grafo ONNX autónomo de 60,5 MB y está pensado para inferencia en el borde (edge): la model card declara una latencia de aproximadamente 50 ms en CPU convencional y hardware ARM. Está adaptado a partir del checkpoint nativo `en_US-ryan-medium` de Piper mediante un ajuste de 500 épocas, y se integra con la librería Piper, lo que facilita su despliegue en entornos con recursos limitados.

Su relevancia actual radica en el nicho de TTS ligero y embebible: frente a modelos generativos de voz de gran tamaño, Unose Voice v1.0 prioriza huella mínima, latencia baja y licencia MIT, lo que lo hace apto para aplicaciones offline, dispositivos empotrados y prototipos sin dependencia de infraestructura GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica contexto de texto largo) |
| Tipos de cuantizacion | no disponible (se distribuye como grafo ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | ONNX (grafo computacional autonomo de 60,5 MB) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema de TTS extremo a extremo que integra inferencia variacional, alineamiento monotónico y aprendizaje adversarial en un solo modelo. Esta formulación permite generar waveforms directamente desde texto, con un vocoder implícito en el decoder, lo que reduce la complejidad del pipeline y el coste computacional en inferencia. El resultado se exporta como un grafo ONNX único, compatible con la librería Piper.

Según la model card, el checkpoint base es una adaptación nativa del modelo masculino `en_US-ryan-medium` de Piper, entrenada durante 500 épocas. No se especifican en la información disponible el volumen de datos de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en TTS). Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz a partir de texto en inglés (text-to-speech).
- Generación de audio en formato WAV mediante la CLI de Piper.
- Inferencia optimizada para CPU y hardware ARM de borde, con latencia declarada de ~50 ms.
- Etiqueta `voice-clone` en el repositorio, aunque la model card no documenta explícitamente un flujo de clonación de voz ni sus requisitos.
- Integración con el ecosistema Piper para despliegue ligero.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada (es un modelo exclusivamente TTS).

## Casos de uso

- Asistentes de voz offline en dispositivos empotrados: el grafo ONNX de 60,5 MB y la latencia de ~50 ms en CPU/ARM permiten ejecutar TTS local en Raspberry Pi u otros equipos de borde sin conexión a la nube.
- Lectura de notificaciones y accesibilidad: integración en aplicaciones de lectura de pantalla o sistemas de accesibilidad que requieren síntesis rápida y de baja huella en inglés.
- Prototipado rápido de interfaces conversacionales: al usar la CLI de Piper, se puede generar audio de prueba en pipelines de desarrollo sin infraestructura GPU.
- Sistemas de megafonía o anuncios automatizados: generación de avisos pregrabados o dinámicos en inglés con recursos mínimos.
- Integración en aplicaciones de escritorio y móviles: el formato ONNX y la licencia MIT facilitan la inclusión en productos comerciales sin restricciones de licencia.
- Pruebas de concepto de clonación de voz: la etiqueta `voice-clone` sugiere experimentación en este ámbito, aunque la documentación disponible no detalla el procedimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente declara una latencia de inferencia de aproximadamente 50 ms en CPU convencional y hardware ARM de borde, sin métricas de calidad (MOS, WER, etc.) ni comparaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada: no aplica en la mayoría de despliegues; el modelo está diseñado para CPU. En GPU, el grafo de 60,5 MB ocuparía una fracción mínima de memoria.
- GPU recomendadas: no se especifican; el modelo está optimizado para CPU y ARM, por lo que no requiere GPU.
- Cabe en cualquier GPU consumer e incluso en dispositivos sin GPU dedicada.
- Opciones de despliegue: Piper CLI (documentado en la model card), y por extensión el runtime ONNX; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a TTS).
- Latencia y throughput: ~50 ms por inferencia en CPU/ARM según la model card; no se documenta throughput agregado.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tamano | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Unose Voice v1.0 | VITS (ONNX) | 60,5 MB | en | MIT | Edge-optimizado, ~50 ms en CPU |
| Piper `en_US-ryan-medium` | VITS | no disponible | en | MIT (Piper) | Checkpoint base del que deriva Unose Voice |
| Coqui TTS (modelos VITS) | VITS | variable | multi | MPL-2.0 / varias | Framework generalista, no específicamente edge |
| Kokoro TTS | no disponible | no disponible | multi | Apache 2.0 | TTS ligero de referencia en la comunidad |

No se dispone de datos de rendimiento comparativos en la información proporcionada; la comparativa se limita a características estructurales y de licencia.

## Limitaciones y advertencias

- Solo soporta inglés (`en`); no se documenta multilingüismo.
- Es un modelo exclusivamente TTS: no procesa audio de entrada ni texto largo con contexto extendido.
- No se documentan sesgos específicos, pero al derivar de un checkpoint masculino en inglés estadounidense, la voz y el acento están limitados a ese perfil.
- Riesgo de alucinación acústica o pronunciaciones incorrectas en texto fuera de dominio, no cuantificado en la información disponible.
- La etiqueta `voice-clone` no está respaldada por documentación sobre requisitos, calidad o consideraciones éticas; conviene tratarla con cautela.
- Licencia MIT: permite uso comercial y modificación, pero no se detallan condiciones de atribución más allá de la indicada por el autor.
- Repositorio con muy baja adopción (25 descargas, 0 likes) y publicación reciente; no hay evidencia de validación independiente.
- No se documentan métricas de calidad (MOS) ni pruebas de robustez en producción.

## Enlaces

- HuggingFace: https://huggingface.co/igunosalabs/Unose-Voice-v1.0
- GitHub oficial: https://github.com/Igunosa-Labs/unose-voice
- STT Suite (Base 74M): https://huggingface.co/igunosalabs/Unose-Huen-Base
- STT Suite (Small 244M): https://huggingface.co/igunosalabs/Unose-Huen-Small
