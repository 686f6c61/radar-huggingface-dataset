# joe2643/Qwen3-ASR-1.7B-Cantonese-HK-GGUF

## Resumen

Qwen3-ASR-1.7B-Cantonese-HK-GGUF es una adaptación mediante fine-tuning del modelo de reconocimiento automático de voz Qwen/Qwen3-ASR-1.7B, publicada por el usuario joe2643. El objetivo concreto del ajuste es que el modelo transcriba de forma nativa cantonés coloquial de Hong Kong (etiqueta `yue-HK`) en caracteres tradicionales, en lugar de derivar hacia chino simplificado o variantes del cantonés continental que produce el modelo original. Además, preserva el cambio de código (code-switching) entre cantonés e inglés, algo habitual en el habla real de Hong Kong.

El modelo conserva la arquitectura multimodal del Qwen3-ASR original (un codificador de audio emparejado con un decoder de lenguaje de tipo transformer) y se distribuye en formato GGUF, con un fichero de proyección multimodal (`mmproj`) separado, para su uso con `llama.cpp` (`llama-server`) y con la aplicación OraType. Con 1.720.574.976 parámetros, está pensado para despliegue en local o en servidores modestos, no para grandes clústeres.

Su relevancia radica en que ataca un problema muy específico y mal cubierto por los ASR genéricos: la transcripción fiel del cantonés hablado en Hong Kong, incluyendo vocabulario coloquial y mezcla con inglés. Los datos de la model card muestran mejoras de error de carácter (CER) frente al modelo base y una ventaja muy amplia frente a `whisper-large-v3` en los conjuntos de evaluación de cantonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de ASR (codificador de audio + decoder de lenguaje), base Qwen3-ASR-1.7B |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens en el ejemplo de `llama-server` (valor configurado, no especificación oficial del modelo) |
| Tipos de cuantizacion | Q4_K_M y Q8_0 (pesos principales); mmproj en Q8_0 |
| Idiomas soportados | yue (cantonés, yue-HK), zh, en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con fichero mmproj GGUF separado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-ASR-1.7B, un sistema de reconocimiento de voz que combina un codificador de audio con un decoder de lenguaje de 1.700 millones de parámetros aproximadamente. La adaptación consiste en un fine-tuning sobre ese modelo base para especializarlo en cantonés de Hong Kong, con el objetivo explícito de que la salida use caracteres tradicionales y vocabulario coloquial auténtico (`係`, `喺`, `嘅`, `咗`, `㗎`, entre otros) y de que mantenga el code-switching con inglés.

La model card no detalla el volumen de datos de entrenamiento, su composición exacta ni si se emplearon técnicas de alineación como RLHF o DPO. Sí se documenta el proceso de exportación a GGUF para `llama.cpp` y OraType, incluyendo los hashes SHA-256 de cada fichero, lo que facilita la verificación de integridad en despliegues. El repositorio ocupa 3,3 GB en total.

## Capacidades

- Reconocimiento automático de voz (ASR) con salida en texto.
- Transcripción de cantonés de Hong Kong en caracteres tradicionales, con vocabulario coloquial.
- Manejo de code-switching cantonés-inglés dentro de una misma emisión.
- Soporte de chino (zh) e inglés (en) además del cantonés, heredado del modelo base.
- Salida compatible con endpoints HTTP vía `llama-server`.
- Integración con la aplicación OraType (según la model card).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general o audio generativo más allá de la transcripción.

## Casos de uso

- Subtitulado de contenido audiovisual en cantonés de Hong Kong: el modelo transcribe con caracteres tradicionales y vocabulario coloquial, lo que reduce la corrección manual frente a ASR genéricos que derivan a simplificado.
- Actas y transcripción de sesiones del Consejo Legislativo (LegCo): el conjunto de evaluación LegCo de la model card sugiere un uso realista para transcripción de discurso formal en cantonés.
- Atención al cliente en centros de llamadas de Hong Kong: al preservar el code-switching cantonés-inglés, puede transcribir conversaciones reales donde el cliente mezcla ambos idiomas.
- Herramientas de accesibilidad y dictado en local: al distribuirse en GGUF y ejecutarse con `llama.cpp`, permite dictado por voz sin enviar audio a servicios en la nube.
- Investigación lingüística y corpus de habla: útil para generar transcripciones de entrevistas o grabaciones de campo en cantonés con mezcla de inglés.
- Integración en aplicaciones de escritorio: OraType lo utiliza como motor de voz a texto, según la model card, lo que sirve de referencia para integrarlo en herramientas de productividad.
- Preprocesado de audio para pipelines de análisis: transcripción previa a tareas de resumen o búsqueda sobre grabaciones en cantonés.

## Benchmarks y rendimiento

Datos de la model card (Character Error Rate, decodificación greedy; menor es mejor):

| Conjunto de prueba | Qwen3-ASR-1.7B original | Este fine-tune | whisper-large-v3 |
|---|---:|---:|---:|
| FLEURS (`yue_hant_hk`) | 4,20 % | 4,00 % | 20,97 % |
| Common Voice `yue` | 5,46 % | 3,80 % | 36,44 % |
| Common Voice 23 `zh-HK` | 7,65 % | 5,18 % | 41,76 % |
| LegCo (Consejo Legislativo de Hong Kong) | 7,22 % | 7,17 % | 32,15 % |
| MCE (code-switching cantonés-inglés) | 11,74 % | 5,61 % | 24,00 % |

No se han publicado en la información disponible otros benchmarks (por ejemplo, WER en inglés o métricas de latencia y throughput).

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M ocupa 1.107.404.736 bytes (aproximadamente 1,03 GiB) y el Q8_0 1.834.422.208 bytes (aproximadamente 1,71 GiB); el mmproj Q8_0 añade 355.709.216 bytes (aproximadamente 0,33 GiB). A esto hay que sumar la memoria del contexto y del runtime.
- GPU recomendadas: no disponible de forma explícita; por tamaño, cualquier GPU consumer con 4 GB o más de VRAM debería poder ejecutar la variante Q4_K_M junto con el mmproj.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas tipo RTX 3060, RTX 4060 o superiores con la cuantización Q4_K_M; no se especifican modelos concretos en la documentación.
- Opciones de despliegue: `llama.cpp` mediante `llama-server` (con `--mmproj` apuntando al fichero de proyección) y la aplicación OraType.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | CER en cantonés (referencia) | Licencia | Formato |
|---|---|---|---|---|---|
| Este fine-tune (Qwen3-ASR-1.7B-Cantonese-HK) | 1.720.574.976 | yue, zh, en | 3,80 % en Common Voice `yue` | apache-2.0 | GGUF |
| Qwen3-ASR-1.7B (original) | 1.720.574.976 (base) | zh, en y otros (no detallado) | 5,46 % en Common Voice `yue` | no disponible en la información | safetensors (formato del modelo base) |
| whisper-large-v3 | no disponible en la información | multilingüe (no detallado) | 36,44 % en Common Voice `yue` | no disponible en la información | no disponible en la información |

La comparación se limita a los datos de CER publicados en la model card; no se dispone de comparativas de latencia, memoria ni otros benchmarks.

## Limitaciones y advertencias

- El fine-tuning está muy orientado a cantonés de Hong Kong; el rendimiento en otras variedades de cantonés o en chino mandarín puede diferir del modelo base.
- La model card no documenta sesgos específicos, pero un ASR entrenado con datos de Hong Kong puede reflejar sesgos léxicos o dialectales de esa región.
- Riesgo de alucinación en transcripciones: como todo modelo generativo de ASR, puede producir texto plausible que no corresponde al audio, especialmente con ruido o acentos no vistos.
- La longitud de contexto de 4096 tokens es la configurada en el ejemplo de `llama-server`, no una especificación oficial; audios largos requerirán segmentación.
- No se detalla el dataset de entrenamiento ni si hubo alineación, lo que dificulta evaluar la robustez en dominios no cubiertos.
- La licencia apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-ASR-1.7B, que no se detallan en la información proporcionada.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay validación comunitaria independiente de los resultados reportados.
- Los benchmarks son de la propia model card y no han sido replicados de forma independiente en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joe2643/Qwen3-ASR-1.7B-Cantonese-HK-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Repositorio de `llama.cpp` (no enlazado en la model card, pero requerido para el despliegue indicado): no disponible en la información proporcionada
- Aplicación OraType: no disponible en la información proporcionada
- Paper o blog técnico del fine-tuning: no disponible en la información proporcionada
