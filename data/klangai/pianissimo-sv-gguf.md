# KlangAI/pianissimo-sv-gguf

## Resumen

KlangAI/pianissimo-sv-gguf es la distribución en formato GGUF de Klang Pianissimo, un modelo de reconocimiento automático del habla (ASR) para sueco desarrollado por Klang. El modelo original se publica en NeMo y este repositorio lo empaqueta para transcribe.cpp, un motor de inferencia en C++ que permite ejecutar el modelo en CPU o GPU de un ordenador convencional sin necesidad de Python, PyTorch ni NeMo.

La arquitectura es FastConformer con decodificación TDT (Token-and-Duration Transducer), con 627.052.166 parámetros totales. El repositorio ofrece cinco cuantizaciones (F32, F16, Q8_0, Q5_K_M y Q4_K_M), desde 2,51 GB hasta 485 MB, lo que permite desplegar ASR de calidad en hardware muy modesto. Según la model card, la cuantización Q8_0 mantiene un WER del 3,12 % idéntico al modelo original fp32 sobre 100 clips de Swedish Common Voice, con transcripciones idénticas en 100 de 100 clips.

Es relevante ahora porque demuestra que un modelo ASR de precisión competitiva puede distribuirse en menos de 500 MB y ejecutarse sin stack de Python, lo que simplifica el despliegue en producción, aplicaciones de escritorio y entornos con recursos limitados. La licencia CC BY 4.0 facilita además el uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | 627.052.166 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | atención local de 256 frames del encoder (aprox. 20 segundos por lado); admite audio de cualquier duración en una sola llamada |
| Tipos de cuantizacion | F32, F16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | sueco (sv) |
| Licencia | CC BY 4.0 |
| Formato de pesos | GGUF (también disponible el original en NeMo, ONNX y MLX en repositorios separados) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura FastConformer, un encoder Conformer con atención por bloques que reduce el coste computacional frente a un Conformer completo. El decodificador es un TDT (Token-and-Duration Transducer), que predice conjuntamente tokens y duraciones, lo que permite un alineamiento más eficiente que un transducer convencional. Según la model card, Pianissimo conserva la arquitectura y el tokenizador de Parakeet v3; solo difieren los pesos, y la conversión a GGUF se realizó con `convert-parakeet.py` usando los ajustes estándar de Parakeet v3.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o ajuste fino supervisado. La model card tampoco detalla innovaciones adicionales más allá de la atención local del encoder (256 frames, unos 20 segundos por lado), que permite procesar grabaciones de cualquier longitud en una sola llamada sin truncar el audio.

## Capacidades

- Transcripción de voz a texto en sueco con salida de texto plano.
- Reconocimiento de audio de cualquier duración en una sola llamada, gracias a la atención local del encoder.
- Ejecución en CPU o GPU sin Python, PyTorch ni NeMo, mediante transcribe.cpp.
- Cuantizaciones que preservan la calidad: Q8_0 y F16/F32 producen transcripciones idénticas al original en 100 de 100 clips de prueba.
- No soporta tool calling ni function calling: es un modelo ASR puro, no un modelo generativo conversacional.
- No soporta agentes ni razonamiento multi-paso.
- Multilingüismo limitado al sueco; no se documentan otros idiomas.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Transcripción de reuniones y entrevistas en sueco: el modelo procesa grabaciones de cualquier duración en una sola llamada y puede ejecutarse en local, lo que evita enviar audio confidencial a servicios en la nube.
- Subtitulado automático de vídeo: con Q8_0 (740 MB) o Q4_K_M (485 MB) se puede integrar en pipelines de postproducción que necesiten generar subtítulos en sueco con un WER en torno al 3-4 %.
- Atención al cliente y análisis de llamadas: transcripción por lotes de grabaciones telefónicas para extraer texto indexable, ejecutándose en CPU sin GPU dedicada.
- Aplicaciones de escritorio y utilidades CLI: al no requerir Python ni PyTorch, se puede embeber en herramientas nativas distribuidas a usuarios finales con un binario y un fichero GGUF de menos de 1 GB.
- Investigación lingüística sobre sueco: generación de transcripciones a gran escala sobre corpus de Common Voice u otros conjuntos para análisis fonético y léxico.
- Despliegue en entornos con recursos limitados: la versión Q4_K_M (485 MB) cabe en dispositivos con poca memoria y mantiene un WER del 3,97 %, adecuado para prototipos y aplicaciones de campo.
- Preprocesado para pipelines de NLP: convertir audio sueco en texto antes de tareas posteriores de clasificación, búsqueda o resumen, usando el modelo como primer eslabón del pipeline.

## Benchmarks y rendimiento

Resultados de WER (%) sobre 100 clips de Swedish Common Voice, según la model card del autor:

| Fichero | Tamano | WER (%) | Transcripciones identicas al original |
|---|---:|---:|---:|
| Original fp32 (NeMo) | 2,51 GB | 3,12 | — |
| pianissimo-sv-Q8_0.gguf | 740 MB | 3,12 | 100 de 100 |
| pianissimo-sv-Q5_K_M.gguf | 549 MB | 3,82 | 97 de 100 |
| pianissimo-sv-Q4_K_M.gguf | 485 MB | 3,97 | 94 de 100 |
| pianissimo-sv-F16.gguf | 1,26 GB | 3,12 | 100 de 100 |
| pianissimo-sv-F32.gguf | 2,51 GB | 3,12 | 100 de 100 |

No se han publicado en la información disponible resultados de benchmarks adicionales (por ejemplo, MMLU, HumanEval o GSM8K, que no aplican a un modelo ASR) ni comparativas con otros modelos ASR en la model card.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por tamaño de fichero, Q4_K_M requiere menos de 1 GB de memoria y Q8_0 alrededor de 1 GB, incluyendo overhead de ejecución.
- GPU recomendadas: no se especifican modelos concretos; transcribe.cpp puede ejecutarse en CPU o GPU de un ordenador convencional.
- Compatibilidad con GPU de consumo: sí, las cuantizaciones Q4_K_M y Q8_0 caben holgadamente en cualquier GPU de consumo con 2 GB o más de memoria, e incluso pueden ejecutarse en CPU.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`); para Python, el autor recomienda el modelo original con NeMo o las versiones ONNX; en Mac, las versiones MLX (8 bits) ejecutan en GPU.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos ASR comparables en la información proporcionada. A continuación se comparan únicamente las alternativas del mismo autor y familia, con los datos disponibles:

| Modelo | Formato | Tamano | WER (%) | Licencia |
|---|---|---:|---:|---|
| KlangAI/pianissimo-sv-gguf (Q8_0) | GGUF | 740 MB | 3,12 | CC BY 4.0 |
| KlangAI/pianissimo-sv-gguf (Q4_K_M) | GGUF | 485 MB | 3,97 | CC BY 4.0 |
| KlangAI/pianissimo-sv (original) | NeMo | 2,51 GB | 3,12 | CC BY 4.0 |
| KlangAI/pianissimo-sv-onnx | ONNX | no disponible | no disponible | CC BY 4.0 |
| KlangAI/pianissimo-sv-mlx-8bit | MLX | no disponible | no disponible | CC BY 4.0 |

No se dispone de comparativas con modelos ASR de otros autores (por ejemplo, Whisper u otros) en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al entrenarse para sueco, el rendimiento puede degradarse con acentos regionales o habla no nativa.
- Riesgo de alucinación: no cuantificado; como todo modelo ASR, puede producir transcripciones incorrectas en audio con ruido, solapamiento de hablantes o vocabulario especializado.
- Limitación de idioma: solo soporta sueco; es obligatorio pasar `-l sv` en transcribe.cpp.
- Limitación de contexto: la atención local del encoder cubre 256 frames (unos 20 segundos) por lado; aunque se aceptan grabaciones de cualquier duración, la información más allá de esa ventana no se atiende de forma global.
- Restricciones de licencia: CC BY 4.0 permite uso comercial con atribución; es necesario citar el modelo según el BibTeX de la model card.
- Caveat de producción: la evaluación se realizó sobre solo 100 clips de Common Voice, una muestra pequeña; conviene validar el WER en el dominio concreto antes de desplegar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción por terceros.
- Las cuantizaciones Q5_K_M y Q4_K_M degradan ligeramente la precisión (WER 3,82 % y 3,97 % respectivamente) y no reproducen exactamente las transcripciones del original en todos los clips.

## Enlaces

- Repositorio GGUF: https://huggingface.co/KlangAI/pianissimo-sv-gguf
- Modelo original: https://huggingface.co/KlangAI/pianissimo-sv
- Versiones ONNX: https://huggingface.co/KlangAI/pianissimo-sv-onnx
- Versiones MLX (8 bits): https://huggingface.co/KlangAI/pianissimo-sv-mlx-8bit
- Motor transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- README de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp#readme
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
