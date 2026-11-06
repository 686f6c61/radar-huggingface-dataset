# ConwayResearch/pii-30M-coreml-ane-v1.0

## Resumen

PII 30M Core ML (Neural Engine) v1.0 es un clasificador de tokens BERT de cuatro capas especializado en la deteccion local de informacion personal identificable (PII), empaquetado como programa Core ML para ejecutarse en la Apple Neural Engine. Lo desarrolla ConwayResearch y deriva directamente de la version MLX 4-bit del mismo modelo, cuyos pesos se desquantizaron y convirtieron con coremltools 9 para producir un artefacto de aproximadamente 27 MB con pesos de 8 bits.

El modelo resuelve un problema concreto: la redaccion de datos sensibles sin enviar texto a servicios en la nube. Al ejecutarse en el Neural Engine de dispositivos Apple, permite detectar PII en local con una latencia muy baja (un lote de 512 tokens en unos 4 ms en la Neural Engine de un M5 Max) y sin coste de red. El etiquetado es BIO3 con tres clases: `O`, `B-PII` e `I-PII`.

Su relevancia actual radica en el cumplimiento normativo (RGPD, HIPAA) y en arquitecturas de privacidad por diseno: es un componente pequeno, de licencia Apache-2.0, que se puede integrar en pipelines de redaccion antes de que el texto llegue a un LLM o a un sistema de registro. La contrapartida es que solo soporta ingles y que su ventana de entrada esta fijada a 512 tokens por lote.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT de 4 capas (clasificador de tokens), convertido a programa Core ML (ML program) |
| Parametros totales | no disponible (el nombre del modelo indica 30M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens por ventana de entrada; las ventanas comparten 64 tokens con la anterior |
| Tipos de cuantizacion | pesos 8-bit simetricos por canal de salida; activaciones float16 |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML (`.mlpackage`/ML program); modelo base en MLX cuantizado a 4-bit |

## Arquitectura y entrenamiento

La arquitectura es un transformer BERT de cuatro capas configurado como clasificador de tokens con tres etiquetas (`O`, `B-PII`, `I-PII`). La entrada no es texto sino tensores ya tokenizados: `ids` (1x512 int32), `positions` (1x512 int32) y una mascara de atencion `bias` (1x1x512x512 float16) que aplica 0 donde un token puede atender a otro de su misma ventana y -1e4 en el resto; los tokens de padding solo se atienden a si mismos. La salida son logits (1x512x3 float32) por token.

El proceso de conversion parte de la revision `511419bc3efa3527bf695d9bdde2e0f48607999b` del release MLX 4-bit: se desquantizaron los pesos y se convirtieron con coremltools 9, aplicando cuantizacion simetrica de 8 bits por canal de salida y manteniendo las activaciones en float16. El modelo se ejecuta en la Neural Engine mediante `cpuAndNeuralEngine`, salvo las busquedas de embeddings, que corren en CPU. No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o ajuste supervisado.

## Capacidades

- Deteccion de informacion personal identificable a nivel de token mediante etiquetado BIO3 (`O`, `B-PII`, `I-PII`).
- Redaccion local de texto antes de enviarlo a servicios externos o almacenarlo.
- Procesamiento por lotes: una entrada de 1x512 tokens puede contener varias ventanas de varios textos concatenadas.
- Ejecucion en Apple Neural Engine con latencia muy baja (aproximadamente 4 ms por lote de 512 tokens en un M5 Max).
- Tokenizacion WordPiece compatible con el `tokenizer.json` del release MLX, con ventanas solapadas de 64 tokens.
- Manejo de textos con caracteres CJK, acentos, caracteres combinantes, control, espacios, emoji, JSON, HTML y palabras demasiado largas para WordPiece (verificado en la evaluacion del autor).
- No soporta tool calling, agentes, vision, audio ni modo de razonamiento: es un clasificador de tokens puro.

## Casos de uso

- Redaccion previa a LLM: interceptar el prompt del usuario, ejecutar el clasificador en el Neural Engine y enmascarar los spans `B-PII`/`I-PII` antes de enviar el texto a un modelo remoto, reduciendo la exposicion de datos personales.
- Cumplimiento RGPD en aplicaciones de escritorio: procesar localmente registros, formularios o correos en macOS/iOS para localizar nombres, direcciones o identificadores sin salida a red, con trazabilidad de que datos se han redactado.
- Enmascarado de logs y telemetria: pasar los mensajes de log por el modelo en el dispositivo o en un servidor Apple antes de agregarlos, sustituyendo los spans detectados por marcadores.
- Anonimizacion de documentos antes de compartirlos: integrar el clasificador en un flujo de exportacion de PDF o texto para marcar PII y generar una version redactada.
- Preprocesado en pipelines de datos de entrenamiento: filtrar o enmascarar PII en corpus de texto en ingles antes de usarlos para ajuste fino, aprovechando el bajo coste por lote (4 ms por 512 tokens).
- Aplicaciones moviles de privacidad: incorporar el modelo en apps de iOS 18 o superior que necesiten detectar datos sensibles sin conectividad, con un artefacto de unos 27 MB que cabe en el bundle.
- Deteccion en herramientas de desarrollo: plugin de editor o pre-commit hook que marque PII en ficheros de configuracion, fixtures o documentacion antes de hacer commit.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica evaluacion reportada es de equivalencia funcional: sobre 15 textos variados (CJK, acentos, caracteres combinantes, control y espacios, emoji, JSON, HTML, una palabra demasiado larga para WordPiece y un texto de tres ventanas), los spans detectados coinciden con los del runtime del release MLX en todos los casos. El autor reporta unos 4 ms por lote de 512 tokens en la Neural Engine de un M5 Max.

## Requisitos de hardware

- Plataforma: macOS 15 o iOS 18 (ML program, Core ML 8); requiere Neural Engine.
- Tamano en disco: aproximadamente 27 MB (pesos de 8 bits).
- Memoria: no disponible de forma explicita; el tensor de atencion `bias` es de 1x1x512x512 en float16 (aproximadamente 0,5 MB por lote) y los logits de salida son 1x512x3 float32.
- GPU recomendadas: no aplica; el modelo esta disenado para la Neural Engine de chips Apple (M-series, A-series) con `cpuAndNeuralEngine`.
- Cabe en hardware consumer: si, en cualquier dispositivo Apple con Neural Engine y macOS 15 / iOS 18.
- Opciones de despliegue: Core ML (coremltools, Core ML runtime en Apple); no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: aproximadamente 4 ms por lote de 512 tokens en Neural Engine de M5 Max; el resto de dispositivos no esta documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| PII 30M Core ML (este) | ~30M (segun nombre) | 512 tokens por ventana | Core ML / Neural Engine | Apache-2.0 | Solo ingles; 8-bit; ~27 MB; ~4 ms por lote en M5 Max |
| ConwayResearch/pii-30M-mlx-4bit-v1.0 | ~30M (segun nombre) | 512 tokens por ventana | MLX / Apple Silicon | Apache-2.0 | Modelo base del que deriva; 4-bit; mismo etiquetado BIO3 |
| Modelos NER genericos tipo BERT-base (p. ej. bert-base-NER) | ~110M | 512 tokens | PyTorch / safetensors | Apache-2.0 o MIT segun variante | Mas grandes y no optimizados para Neural Engine; requieren GPU o CPU |
| Modelos de PII de mayor tamano (p. ej. variantes de DeBERTa) | cientos de millones | 512 tokens | PyTorch / ONNX | variable | Mayor precision potencial a costa de tamano y latencia; no verificados en esta ficha |

La comparativa con modelos concretos de terceros no esta respaldada por datos de benchmark en la informacion disponible; las filas anteriores reflejan caracteristicas estructurales, no resultados medidos.

## Limitaciones y advertencias

- Solo soporta ingles; el rendimiento en otros idiomas no esta documentado y no debe asumirse.
- La ventana de entrada esta fijada a 512 tokens por lote; los textos mas largos deben trocearse en ventanas con solapamiento de 64 tokens y decodificarse con la logica BIO3 del runtime MLX.
- El modelo solo distingue PII generica (`B-PII`/`I-PII`); no clasifica el tipo de dato (nombre, telefono, tarjeta, etc.), lo que limita la redaccion selectiva.
- Riesgo de falsos negativos y positivos inherente a un modelo de 30M y 4 capas; no se han publicado metricas de precision/recall.
- Dependencia de plataforma: requiere Neural Engine y macOS 15 / iOS 18; no es portable a Linux, Windows ni GPUs NVIDIA sin reconversion.
- La evaluacion reportada es de equivalencia con el release MLX, no de calidad absoluta de deteccion.
- Licencia Apache-2.0 permite uso comercial, pero el usuario debe verificar el cumplimiento normativo (RGPD, HIPAA) del flujo completo en el que se integre.
- No es un modelo generativo: no admite tool calling, agentes ni razonamiento multi-paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ConwayResearch/pii-30M-coreml-ane-v1.0
- Modelo base MLX 4-bit: https://huggingface.co/ConwayResearch/pii-30M-mlx-4bit-v1.0
- Repositorio de inferencia de Underdog (script `Engines/pii/convert-coreml.py`): no disponible como URL en la informacion proporcionada
- Paper, blog o demo: no disponibles en la informacion proporcionada
