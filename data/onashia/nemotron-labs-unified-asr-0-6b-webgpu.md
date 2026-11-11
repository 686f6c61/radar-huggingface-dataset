# onashia/nemotron-labs-unified-asr-0.6b-webgpu

## Resumen

Nemotron-Labs Unified ASR 0.6B WebGPU es una conversión a ONNX Runtime Web del modelo de reconocimiento automático del habla `nvidia/nemotron-labs-unified-asr-0.6b` de NVIDIA, publicada por el usuario onashia. El paquete está pensado para ejecutarse íntegramente en el navegador mediante WebGPU, sin necesidad de servidor ni backend remoto, y es el motor que utiliza la extensión de navegador Baa para transcripción local. No se trata de un modelo nuevo: la arquitectura, los pesos y la licencia provienen del modelo original de NVIDIA, y todo el mérito del modelo corresponde a NVIDIA.

Técnicamente es un sistema híbrido FastConformer + RNN-T con 0,6 mil millones de parámetros, preprocesador log-mel de 128 bins a 16 kHz y un encoder de atención de contexto completo (modo offline). El bundle incluye tres grafos ONNX: preprocesador en fp32, encoder cuantizado a 4 bits con MatMulNBits (bloque 32, asimétrico) y decoder/joint en int8 con cuantización dinámica. El repositorio ocupa 0,5 GB y soporta 25 idiomas europeos.

Su relevancia actual radica en que demuestra que un ASR de calidad razonable puede desplegarse del lado del cliente en un navegador con pérdida de precisión mínima: según las comprobaciones del autor, la versión 4-bit iguala la tasa de error de palabra del export fp32 (5,2 %) en 9 clips de FLEURS en alemán, francés y español, con similitud coseno media del encoder de 0,997 respecto a fp32.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + RNN-T (decoder/joint), con fusión de language-ID |
| Parámetros totales | 0,6 B (según nombre del modelo base) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (atención de contexto completo, modo offline; cada frame del encoder equivale a 80 ms) |
| Tipos de cuantización | Encoder: MatMulNBits 4-bit (bloque 32, asimétrico); decoder/joint: int8 dinámico; preprocesador: fp32 |
| Idiomas soportados | 25: en, bg, hr, cs, da, nl, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, ru, sk, sl, es, sv, uk |
| Licencia | OpenMDW 1.1 (igual que el modelo original) |
| Formato de pesos | ONNX (tres grafos: `preprocessor.onnx`, `encoder-model.q4.onnx`, `decoder_joint-model.int8.onnx`) + `vocab.txt` (SentencePiece, blank = 4095) |

## Arquitectura y entrenamiento

El modelo base es un sistema ASR end-to-end de NVIDIA que combina un encoder FastConformer con un decoder RNN-T. El encoder transforma características log-mel de 128 bins (ventana de 25 ms, salto de 10 ms, normalización por característica) en representaciones de 1024 dimensiones con un factor de submuestreo de 8 (cada frame de salida cubre 80 ms de audio). El decoder/joint opera sobre estados recurrentes de dimensión 640 y produce logits sobre un vocabulario de 4096 entradas, con decodificación greedy de hasta 10 símbolos por frame. La conversión utiliza atención de contexto completo, es decir, el modo offline del modelo original, no el modo streaming.

El bundle incorpora además la fusión de language-ID: el encoder recibe un identificador de idioma (`language`) que actúa como prompt (por ejemplo, en=0, es=3, fr=8, de=9, ru=11, pt=13, it=15, nl=16, pl=17, uk=19, ro=20, el=21, cs=22, hu=23, sv=24, da=25, fi=26, sk=28, hr=29, bg=30, lt=31, et=60, lv=61, sl=62, mt=102, y 127 para detección automática). No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que la model card de esta conversión no los detalla y no se ha proporcionado la del modelo original. La innovación técnica destacable es la propia cuantización: 4 bits en el encoder y int8 en el decoder mantienen la calidad del fp32 en las pruebas realizadas.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) en 25 idiomas europeos.
- Detección automática de idioma mediante el prompt 127, o selección explícita del idioma mediante el prompt correspondiente.
- Preprocesado de audio integrado: extracción de características log-mel de 128 bins a partir de formas de onda float32.
- Decodificación greedy RNN-T con hasta 10 símbolos por frame de encoder.
- Ejecución local en navegador vía ONNX Runtime Web y WebGPU, sin envío de audio a servidores.
- Integración práctica en la extensión de navegador Baa para dictado y subtitulado local.
- No se documentan capacidades de tool calling, agentes, visión, audio generation ni modo thinking; es un modelo exclusivamente ASR.

## Casos de uso

- Dictado en aplicaciones web: el modelo puede transcribir voz a texto directamente en el navegador mediante WebGPU, lo que permite ofrecer dictado en herramientas SaaS sin coste de inferencia en servidor y sin que el audio del usuario salga del dispositivo.
- Subtitulado local de reuniones y vídeos: con 25 idiomas y detección automática, se puede generar subtítulos en tiempo casi real en aplicaciones de videoconferencia o reproductores web, procesando el audio en el cliente.
- Extensiones de accesibilidad: integración en extensiones de navegador para personas con dificultades motoras o auditivas, aprovechando que el paquete ONNX se ejecuta en el propio navegador y no requiere instalación de software adicional.
- Transcripción de notas de voz en aplicaciones de productividad: un editor de notas web puede transcribir grabaciones cortas en el dispositivo, manteniendo la privacidad del contenido y funcionando offline una vez cargado el modelo.
- Procesamiento por lotes en el edge: despliegue en dispositivos con WebGPU (portátiles, tablets de gama alta) para transcribir archivos de audio de forma local en flujos de trabajo periodísticos o de investigación con requisitos de confidencialidad.
- Prototipado e investigación en ASR multilingüe: el bundle permite experimentar con un modelo FastConformer/RNN-T real en entornos web, comparar el impacto de la cuantización 4-bit frente a fp32 y validar pipelines de language-ID sin infraestructura de GPU dedicada.
- Herramientas educativas de idiomas: transcripción de pronunciación en 25 idiomas europeos para aplicaciones de aprendizaje, con la ventaja de que el procesamiento es local y de baja latencia.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| WER en 9 clips de test de FLEURS (de, fr, es), bundle 4-bit, idioma dado o detectado | 5,2 % (igual que el export fp32) |
| Similitud coseno media del encoder respecto a fp32 | 0,997 |
| Clip de JFK | Transcripción exacta |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo ASR. Tampoco se proporcionan métricas de latencia o throughput en WebGPU.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio completo ocupa 0,5 GB, por lo que la huella en memoria del bundle cuantizado es del orden de cientos de MB, adecuada para GPUs integradas y dedicadas de gama media.
- GPU recomendadas: cualquier GPU con soporte WebGPU en navegador (Chrome/Edge con WebGPU habilitado); no se especifican modelos concretos como A100, H100 o RTX 4090 en la documentación.
- Compatibilidad con GPU de consumo: sí, el diseño está orientado a ejecución en navegador con WebGPU, lo que incluye GPUs de portátiles y equipos de sobremesa recientes.
- Opciones de despliegue: ONNX Runtime Web (WebGPU) en navegador; los grafos ONNX también pueden ejecutarse con otros runtimes compatibles con ONNX, aunque no se documentan configuraciones para vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo ASR de este tipo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| onashia/nemotron-labs-unified-asr-0.6b-webgpu | 0,6 B | 25 europeos | ONNX (4-bit encoder, int8 decoder), WebGPU en navegador | OpenMDW 1.1 | Conversión comunitaria del modelo de NVIDIA; WER 5,2 % en FLEURS de/fr/es |
| nvidia/nemotron-labs-unified-asr-0.6b | 0,6 B | 25 europeos | Pesos originales de NVIDIA (formato no detallado) | OpenMDW 1.1 | Modelo base; misma arquitectura y calidad de referencia |
| Whisper (variantes small/medium) | 244 M / 769 M | ~99 | Múltiples (incluye ONNX y WebGPU en implementaciones comunitarias) | MIT | Referencia habitual en ASR multilingüe; no se dispone de comparación directa de WER en la información proporcionada |

No se dispone de datos de benchmarks comparativos directos con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Es una conversión comunitaria, no oficial de NVIDIA; la calidad y el mantenimiento dependen del autor onashia.
- Solo se han validado 9 clips de FLEURS en alemán, francés y español y el clip de JFK; el rendimiento en los otros 22 idiomas no está documentado.
- El encoder usa atención de contexto completo (modo offline), por lo que no es adecuado para streaming de baja latencia sin adaptaciones.
- La decodificación es greedy con un máximo de 10 símbolos por frame; no se documentan opciones de beam search.
- Riesgo de alucinación y errores en audio con ruido, acentos no cubiertos o vocabulario técnico, como en cualquier ASR; no se cuantifica en la información disponible.
- La licencia OpenMDW 1.1 debe revisarse para uso comercial; no se detallan aquí sus restricciones concretas.
- Requiere un navegador con soporte WebGPU; la compatibilidad y el rendimiento varían según la GPU y el sistema operativo.
- No se documentan sesgos específicos del modelo ni del dataset de entrenamiento original.

## Enlaces

- Hugging Face: https://huggingface.co/onashia/nemotron-labs-unified-asr-0.6b-webgpu
- Modelo base: https://huggingface.co/nvidia/nemotron-labs-unified-asr-0.6b
- Licencia OpenMDW 1.1: https://github.com/OpenMDW/OpenMDW/blob/main/1.1/LICENSE.OpenMDW-1.1
