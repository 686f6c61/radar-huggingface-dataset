# maaaaat/parakeet-ultra-onnx

## Resumen

Parakeet Ultra ONNX es la exportación al formato ONNX del modelo de reconocimiento automático del habla Parakeet Ultra, desarrollado por Moondream como un post-entrenamiento sobre el Parakeet TDT 0.6B v3 de NVIDIA. El modelo original está pensado para transcripción multilingüe con detección automática de idioma en 25 lenguas europeas, y esta versión lo empaqueta en el layout de la librería onnx-asr para su despliegue sin dependencias del ecosistema NeMo.

La arquitectura subyacente es un modelo NeMo Conformer con decodificación TDT (Token-and-Duration Transducer), con aproximadamente 0,6 mil millones de parámetros en el modelo base. Esta exportación ofrece el codificador en cuatro precisiones distintas (float32, float16, bfloat16 e int8) compartiendo los mismos pesos, lo que permite elegir entre precisión de referencia y eficiencia en CPU o GPU según el caso de uso.

Su relevancia actual radica en que elimina la fricción de despliegue del modelo original: al estar en ONNX, se puede ejecutar con onnxruntime en entornos de producción heterogéneos (servidores sin GPU, contenedores ligeros, edge) manteniendo una calidad de transcripción prácticamente idéntica a la del modelo en NeMo. La variante int8 ocupa solo 0,76 GB y está recomendada para CPU, lo que la hace viable en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo Conformer con decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | aproximadamente 0,6 mil millones (modelo base Parakeet TDT 0.6B v3) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | float32, float16, bfloat16, int8 (bloques de 64 pesos simetricos) |
| Idiomas soportados | 25: búlgaro, croata, checo, danés, neerlandés, inglés, estonio, finés, francés, alemán, griego, húngaro, italiano, letón, lituano, maltés, polaco, portugués, rumano, ruso, eslovaco, esloveno, español, sueco, ucraniano |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (encoder-model.onnx, decoder_joint-model.onnx y variantes por precisión) |

## Arquitectura y entrenamiento

El modelo base es un post-entrenamiento de Moondream sobre el Parakeet TDT 0.6B v3 de NVIDIA. La arquitectura es un Conformer (transformer convolucional) que actúa como codificador acústico, acoplado a un decodificador de tipo TDT que predice simultáneamente tokens y duraciones, lo que permite emitir varios tokens por paso y reducir la latencia frente a transductores clásicos. El modelo incorpora detección automática de idioma entre las 25 lenguas declaradas.

Esta exportación concreta no reentrena el modelo: reconstruye la arquitectura NeMo a partir de la configuración de Parakeet TDT 0.6B v3, carga los pesos de Parakeet Ultra y genera los ficheros ONNX, verificando que el codificador exportado en float32 produce los mismos tokens que el modelo original en NeMo en al menos el 99,5 % de las emisiones, con diferencias de WER inferiores a 0,1 puntos. Las variantes float16, bfloat16 e int8 se validan contra el float32 en el mismo dispositivo, aceptándose solo si la pérdida no supera 0,2 puntos de WER. No se detalla en la información disponible el volumen de datos de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Transcripción de voz a texto en 25 lenguas europeas con detección automática de idioma.
- Decodificación TDT con emisión de múltiples tokens por paso, orientada a baja latencia.
- Ejecución en CPU y GPU según la variante de precisión elegida.
- Variante int8 optimizada para CPU con pérdida de precisión mínima (máximo 0,06 puntos de WER frente a float32 en los idiomas medidos).
- Variante float16/bfloat16 orientada a GPU con tamaño reducido (1,31 GB).
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Subtitulado automático multilingüe: el modelo transcribe y detecta el idioma por sí mismo, lo que permite procesar vídeos con pistas en varias lenguas europeas sin seleccionar el idioma manualmente antes de la inferencia.
- Transcripción de reuniones y actas: con la variante int8 (0,76 GB) se puede desplegar en servidores CPU sin GPU dedicada, procesando audio de forma codiciosa emisión a emisión con onnx-asr.
- Atención al cliente con análisis de llamadas: la variante float16 en GPU permite transcribir grabaciones telefónicas en inglés, español, francés, portugués y alemán con WER en torno al 3-5 %, suficiente para análisis de sentimiento y control de calidad posterior.
- Archivado y búsqueda de contenido audiovisual: la transcripción multilingüe facilita indexar bibliotecas de audio en 25 lenguas y habilitar búsqueda por texto sobre el contenido hablado.
- Despliegue en edge o contenedores ligeros: al estar en ONNX y ejecutarse con onnxruntime, se integra en pipelines sin NeMo ni PyTorch, reduciendo el tamaño de la imagen de despliegue.
- Investigación en ASR comparativo: las cuatro precisiones con los mismos pesos permiten medir el impacto de la cuantización en WER sobre FLEURS de forma controlada, con las tasas publicadas por el autor.
- Accesibilidad: generación de transcripciones para personas con discapacidad auditiva en entornos con hardware modesto gracias a la variante int8 en CPU.

## Benchmarks y rendimiento

Resultados de WER medidos sobre FLEURS por el autor de la model card. Cada variante se compara con su referencia en el mismo dispositivo (float32 contra NeMo en CPU; el resto contra float32 en GPU o CPU según corresponda).

| Idioma | float32 | float16 | bfloat16 | int8 |
|---|---|---|---|---|
| Inglés (en_us) | 4,88 % | 4,89 % | 4,90 % | 4,94 % |
| Español latinoamericano (es_419) | 3,03 % | 3,01 % | 3,07 % | 3,03 % |
| Francés (fr_fr) | 4,84 % | 4,85 % | 4,80 % | 4,86 % |
| Portugués brasileño (pt_br) | 4,09 % | 4,09 % | 4,10 % | 4,09 % |
| Alemán (de_de) | 4,52 % | 4,48 % | 4,46 % | 4,46 % |

Tamaños por variante: float32 2,55 GB; float16 1,31 GB; bfloat16 1,31 GB; int8 0,76 GB. Las mediciones se realizaron con onnx-asr 0.12.0 y onnxruntime 1.31.0 (CPU) u onnxruntime-gpu 1.31.0 (GPU), decodificación codiciosa emisión a emisión, sobre 647 emisiones en inglés, 908 en español latinoamericano, 676 en francés, 919 en portugués brasileño y 862 en alemán. Los 20 idiomas restantes no se midieron en esta model card: son los que declara NVIDIA para Parakeet TDT 0.6B v3.

## Requisitos de hardware

- VRAM estimada: float32 requiere aproximadamente 2,55 GB de pesos más overhead de activaciones; float16/bfloat16 unos 1,31 GB; int8 unos 0,76 GB.
- GPU recomendadas: cualquier GPU con soporte de onnxruntime-gpu; las variantes float16 y bfloat16 están pensadas para GPU, mientras que float32 e int8 funcionan también en CPU.
- Cabe en GPU de consumo: sí, la variante int8 (0,76 GB) y float16 (1,31 GB) caben holgadamente en tarjetas de consumo como RTX 3060, RTX 4060 o superiores; float32 (2,55 GB) también cabe en GPUs con 4 GB o más.
- Opciones de despliegue: onnx-asr con onnxruntime (CPU) u onnxruntime-gpu (GPU). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo ASR de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Parakeet Ultra ONNX (este) | ~0,6 B | 25 | ONNX | CC-BY-4.0 | Exportación con 4 precisiones, sin dependencia de NeMo |
| Parakeet TDT 0.6B v3 (NVIDIA) | ~0,6 B | 25 | NeMo | no disponible en la información | Modelo base original; requiere ecosistema NeMo |
| Whisper large-v3 | no disponible en la información | multilingüe amplio | safetensors, GGUF, etc. | no disponible en la información | Referencia habitual en ASR multilingüe; comparación de WER no disponible en la información |

No se dispone en la información proporcionada de datos de benchmarks de modelos alternativos para establecer una comparación cuantitativa directa.

## Limitaciones y advertencias

- La cabeza de detección de actividad de voz (VAD) del runtime propio de Moondream no se ha exportado, por lo que el recorte de grabaciones largas en las pausas debe gestionarse externamente.
- Solo se han medido cinco idiomas (inglés, español latinoamericano, francés, portugués brasileño y alemán); el rendimiento en los otros 20 es el declarado por NVIDIA para el modelo base, no verificado en esta exportación.
- El vocabulario de Parakeet TDT no incluye piezas para algunos caracteres que aparecen en FLEURS (por ejemplo « o ’), que el modelo emite como `<unk>`; esto puede afectar a transcripciones con puntuación tipográfica.
- Riesgo de alucinación y errores en audio con ruido, acentos no representados en el entrenamiento o solapamiento de hablantes; no se documentan mitigaciones específicas.
- No se documentan sesgos concretos ni evaluación de robustez más allá de las tasas de WER sobre FLEURS.
- La licencia CC-BY-4.0 permite uso comercial con atribución; conviene verificar las condiciones del modelo base de Moondream y de NVIDIA antes de un despliegue en producción.
- El repositorio ocupa 8,2 GB porque incluye las cuatro variantes; en producción basta con descargar los ficheros de la precisión elegida.

## Enlaces

- Hugging Face: https://huggingface.co/maaaaat/parakeet-ultra-onnx
- Modelo base: https://huggingface.co/moondream/parakeet-ultra
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs/tree/70bb2e84b976b7e960aa89f1c648e09c59f894dd
- Librería onnx-asr: no disponible en la información proporcionada
- Paper o blog de Parakeet TDT 0.6B v3: no disponible en la información proporcionada
