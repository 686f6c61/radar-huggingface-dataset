# OsaurusAI/gemma-4-E2B-it-8bit

## Resumen

El modelo `OsaurusAI/gemma-4-E2B-it-8bit` es una conversión cuantizada a 8 bits del modelo multimodal `google/gemma-4-E2B-it` de Google DeepMind, realizada por Osaurus AI específicamente para Apple Silicon mediante la librería MLX. Se trata de un modelo "any-to-any" que procesa texto, imagen y audio, con una ventana de contexto de 128K tokens y un vocabulario de 262K tokens. La motivación principal de esta conversión es corregir un problema detectado en otras conversiones de la comunidad MLX, donde los pesos de las torres de visión y audio aparecían rotos o a cero, haciendo que el modelo fallara silenciosamente en entradas multimodales. Osaurus AI verifica que los 2.649 tensores de los tres componentes (visión, audio y lenguaje) sean no nulos.

Con 2.300 millones de parámetros efectivos (5.100 millones en total si se incluyen las Per-Layer Embeddings), este modelo se posiciona como una opción ligera para ejecutar un asistente multimodal local en hardware de Apple. La cuantización afín de 8 bits con grupo de tamaño 64 reduce el tamaño del modelo a 5,5 GB, lo que permite su ejecución en Mac con memoria unificada moderada. La licencia es la específica de Gemma, que permite uso comercial bajo ciertas condiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (texto + vision + audio) |
| Parametros totales | 2.300 millones efectivos (5.100 millones con Per-Layer Embeddings) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | 8-bit affine (group size 64) |
| Idiomas soportados | ingles (segun model card) |
| Licencia | Gemma (https://ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | safetensors (MLX) |

Nota: el numero de parametros real en los archivos safetensors es de 1.790.381.635 (1,79B), mientras que la model card indica 2,3B efectivos y 5,1B totales. Esta discrepancia puede deberse a que los safetensors no incluyen ciertos pesos compartidos o embeddings. Se recomienda consultar la documentacion oficial de Google para aclarar la contabilidad exacta.

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-E2B-it` es un modelo multimodal de la familia Gemma 4, que combina un modelo de lenguaje transformer con una torre de vision SigLIP (658 tensores) y una torre de audio Conformer (751 tensores). La arquitectura incorpora Per-Layer Embeddings, una tecnica que asigna embeddings especificos por capa, lo que aumenta el numero total de parametros pero mejora la eficiencia de representacion. El modelo original fue entrenado por Google DeepMind con un enfoque de instruccion y ajuste fino para tareas de dialogo y comprension multimodal.

Esta version concreta no es un entrenamiento nuevo, sino una conversion del modelo original en bfloat16 a cuantizacion de 8 bits afina mediante la herramienta `mlx-vlm` v0.4.4. La cuantizacion reduce el tamaño de 11,8 GB (repo completo) a 5,5 GB de pesos del modelo, manteniendo la precision de las torres multimodales verificada tensor a tensor. No se aplicaron tecnicas de RLHF o DPO adicionales en esta conversion; se trata de una transformacion puramente numerica.

## Capacidades

- Generacion de texto: responde a instrucciones y preguntas en ingles con razonamiento basico.
- Comprension de imagenes: puede describir el contenido de una imagen, responder preguntas visuales y realizar tareas de captioning.
- Procesamiento de audio: acepta entradas de audio (probablemente voz) y las integra con el contexto textual.
- Multimodalidad combinada: puede procesar simultaneamente texto, imagen y audio en una misma conversacion (any-to-any).
- Ventana de contexto larga: 128K tokens, adecuada para documentos extensos o conversaciones multi-turno con historial amplio.
- Ejecucion local en Apple Silicon: optimizado para MLX, aprovecha la memoria unificada de los chips M-series.

No se menciona soporte explicito de tool calling o function calling en la informacion disponible.

## Casos de uso

- Asistente personal local en Mac: un usuario puede ejecutar el modelo en su MacBook con chip M1/M2/M3 para obtener un asistente que entienda comandos de voz, analice capturas de pantalla y responda preguntas, todo sin conexion a internet.
- Transcripcion y resumen de reuniones: al aceptar audio, el modelo puede transcribir una grabacion de reunion y generar un resumen textual, combinando el audio con notas escritas.
- Descripcion de imagenes para accesibilidad: integrado en una aplicacion de escritorio, puede generar descripciones alternativas de imagenes para personas con discapacidad visual, usando la ventana de 128K para procesar lotes de imagenes.
- Analisis de documentos cientificos con figuras: un investigador puede cargar un PDF con graficos y tablas (convertidos a imagenes) junto con el texto, y el modelo extrae informacion relevante de ambos formatos.
- Chatbot educativo multimodal: en un entorno educativo, el modelo puede responder preguntas sobre diagramas, mapas o formulas, combinando la entrada visual con preguntas de texto.
- Prototipado rapido de aplicaciones de IA en Mac: desarrolladores pueden usar este modelo cuantizado para probar flujos multimodales en local antes de desplegar en la nube, gracias a su tamaño reducido y compatibilidad con MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar. Se recomienda consultar la ficha del modelo base `google/gemma-4-E2B-it` en HuggingFace para obtener datos de rendimiento del modelo original sin cuantizar.

## Requisitos de hardware

- El modelo esta diseñado para Apple Silicon (chips M1, M2, M3 y posteriores) gracias a la libreria MLX.
- Tamaño del modelo cuantizado: 5,5 GB. Se recomienda un Mac con al menos 8 GB de RAM unificada para cargar el modelo y dejar espacio para el sistema operativo y el proceso de inferencia.
- Para un rendimiento fluido con contexto largo (128K tokens), se recomienda 16 GB o mas de RAM unificada, ya que el cache de atencion puede consumir varios GB adicionales.
- No se requieren GPUs discretas; la inferencia se ejecuta en la GPU integrada del chip Apple.
- Opciones de despliegue: mediante la herramienta `osaurus serve` (de Osaurus AI) o mediante la API de Python `mlx_vlm` (load y generate).
- No se dispone de datos de latencia o throughput especificos para esta cuantizacion. En general, los modelos de 2-3B en MLX ofrecen velocidades de decodificacion de 20-40 tokens por segundo en chips M2/M3, pero esto depende del hardware y la longitud del contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Cuantizacion | Licencia |
|---|---|---|---|---|---|
| google/gemma-4-E2B-it (original) | 2,3B efectivos | 128K | Si (texto, imagen, audio) | bfloat16 | Gemma |
| OsaurusAI/gemma-4-E2B-it-8bit | 2,3B efectivos | 128K | Si (verificado) | 8-bit MLX | Gemma |
| DreamFoundries/gemma-4-E2B-it-8bit | 2,3B efectivos (presumible) | 128K (presumible) | Si (no verificado) | 8-bit MLX | Gemma |

La diferencia principal entre las dos conversiones de 8 bits es que Osaurus AI verifica explicitamente que todos los pesos de las torres de vision y audio sean no nulos, mientras que la de DreamFoundries no ofrece esa garantia. El modelo original de Google es la referencia en precision, pero requiere mas recursos (bfloat16, ~11,8 GB). No se dispone de datos de rendimiento comparativo entre estas versiones.

## Limitaciones y advertencias

- La cuantizacion de 8 bits puede introducir una ligera perdida de precision en tareas de razonamiento complejo o generacion de codigo, aunque para tareas multimodales basicas suele ser aceptable.
- El modelo solo soporta ingles de forma nativa; no se garantiza un rendimiento adecuado en otros idiomas.
- La conversion esta optimizada para Apple Silicon; no se proporcionan instrucciones para ejecutarla en GPUs NVIDIA o AMD.
- La licencia Gemma tiene restricciones especificas: prohibe el uso para ciertos fines (como armas o vigilancia masiva) y requiere mantener el aviso de atribucion. Consultar el texto completo de la licencia antes de uso comercial.
- Aunque se verifico que los pesos multimodales no son cero, no se han realizado pruebas exhaustivas de calidad en tareas de vision o audio; el rendimiento real puede variar.
- El modelo puede alucinar o generar informacion incorrecta, especialmente en contextos largos o con entradas ambiguas. Se recomienda validar las salidas en aplicaciones criticas.
- No se incluyen pesos de adaptadores o LoRA; es una conversion directa del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OsaurusAI/gemma-4-E2B-it-8bit
- Modelo base original: https://huggingface.co/google/gemma-4-E2B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Web de Osaurus AI: https://osaurus.ai
- Repositorio de Osaurus AI en HuggingFace: https://huggingface.co/OsaurusAI
- Conversion similar (DreamFoundries): https://huggingface.co/DreamFoundries/gemma-4-E2B-it-8bit
- Guia de Gemma 4 E2B (gemma4.dev): https://gemma4.dev/models/gemma-4-e2b
