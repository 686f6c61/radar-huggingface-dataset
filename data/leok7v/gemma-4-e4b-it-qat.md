# leok7v/gemma-4-e4b-it-qat

## Resumen

gemma-4-E4B-it-qat es un modelo multimodal de Google DeepMind, perteneciente a la familia Gemma 4, que procesa texto, imagen y audio como entrada y genera texto como salida. Este repositorio concreto contiene un reempaquetado en formato GGUF realizado por leok7v, que integra en un único archivo autónomo los pesos cuantizados, el tokenizador y la plantilla de chat, de modo que puede ejecutarse íntegramente en el dispositivo sin necesidad de servidores externos.

El modelo destaca por su entrenamiento consciente de la cuantización (QAT, quantization-aware training): Google entrenó el checkpoint simulando errores de baja precisión, lo que permite que sus capas de 2 bits mantengan un rendimiento muy superior al de una conversión post-hoc equivalente. La arquitectura presenta un diseño de embeddings por capa (PLE, per-layer embedding) y una alternancia de atención con ventana deslizante y atención completa, junto con compartición de estado clave-valor entre capas superiores. El reempaquetado GGUF ocupa 3,8 GB y está pensado para entornos de ejecución en el dispositivo, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder multimodal causal con PLE (per-layer embedding), atención alternada sliding-window/full, vision encoder y audio encoder Conformer |
| Parametros totales | 8.612.189.514 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0, Q2_0, Q8_0, BF16, F32 (GGUF v3) |
| Idiomas soportados | ingles (los idiomas del modelo base) |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (safetensors en el checkpoint original) |

## Arquitectura y entrenamiento

El modelo base es un decoder multimodal con un diseño PLE: junto al embedding de tokens habitual, cada capa recibe su propia entrada de 256 dimensiones proveniente de una tabla grande por capa, con compuerta y proyeccion al flujo oculto. La atencion alterna cinco capas de ventana deslizante por cada capa de atencion completa, con distinta anchura de cabezas (256 y 512 respectivamente) y distintas bases RoPE. Las 18 capas superiores comparten el estado clave-valor de sus vecinas en lugar de calcular el propio, lo que reduce coste computacional. Un encoder de vision de 16 capas y un encoder de audio Conformer de 12 capas proyectan al mismo espacio de embeddings.

El entrenamiento es consciente de la cuantizacion (QAT): Google entreno el checkpoint simulando error de baja precision, de modo que las capas de 2 bits mantienen su rendimiento donde una conversion post-hoc fallaria. La asignacion de bits difiere del modelo E2B: los bloques feed-forward permanecen en 4 bits, mientras que las dos tablas de embedding y la proyeccion de salida se reducen a 2 bits. El objetivo es prediccion autoregresiva del siguiente token, con activaciones en fp32/fp16 y logit softcap de 30.

## Capacidades

- Generacion de texto multimodal: acepta entradas de texto, imagen y audio, y produce texto como salida.
- Razonamiento y chat conversacional: modelo instruido (it) optimizado para dialogos multi-turno.
- Ejecucion en el dispositivo: el archivo GGUF integra tokenizador (262144 tokens, 514906 merges) y plantilla de chat, sin dependencias externas ni llamadas a servidor.
- Compresion eficiente: cuantizacion QAT que mantiene calidad en capas de 2 bits, con transferencia exacta de los codigos enteros del checkpoint original.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Capacidades de agente: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes conversacionales en el dispositivo: el modelo puede gestionar dialogos completos sin conexion, ideal para aplicaciones moviles o de escritorio donde la privacidad exige que las conversaciones no salgan del equipo.
- Analisis de imagenes en entornos offline: al aceptar entrada de imagen, permite describir o responder preguntas sobre fotografias o capturas sin enviar datos a la nube, util en sectores como sanidad o industria con requisitos de confidencialidad.
- Transcripcion y comprension de audio local: el encoder Conformer procesa audio, lo que habilita asistentes de voz o sistemas de toma de notas que funcionan sin conexion.
- Prototipado rapido de aplicaciones multimodales: al ser un unico archivo GGUF con todo integrado, los desarrolladores pueden integrarlo en runtimes compatibles sin gestionar multiples ficheros de pesos o tokenizadores.
- Sistemas de soporte en zonas sin conectividad: despliegue en entornos remotos o rurales donde no hay acceso fiable a internet, manteniendo capacidades de chat y analisis de contenido.
- Investigacion en cuantizacion extrema: el checkpoint QAT con capas de 2 bits sirve como referencia para estudiar el impacto de la cuantizacion agresiva en modelos multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamano del archivo: 3,8 GB, por lo que cabe en la mayoria de GPUs consumer con 8 GB de VRAM o mas.
- VRAM estimada: con cuantizacion Q4_0/Q2_0, el modelo deberia cargar en GPUs de 6-8 GB, aunque no se proporcionan cifras oficiales de consumo.
- GPUs recomendadas: no disponible en la informacion proporcionada; por tamano, GPUs como RTX 3060, RTX 4060 o superiores deberian ser suficientes.
- Compatibilidad: el archivo NO carga en llama.cpp upstream, ya que 111 tensores usan el bloque Q2_0, que solo existe en la linea ggml de PrismML/Gadeon. Requiere runtimes que soporten ese tipo de bloque.
- Opciones de despliegue: runtimes compatibles con Q2_0 en la linea ggml de PrismML/Gadeon; no es compatible con vLLM, Ollama o TGI estandar sin modificaciones.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| gemma-4-E4B-it-qat (este) | 8,6 B | no disponible | QAT, capas de 2 y 4 bits | Apache 2.0 | GGUF |
| gemma-4-E2B-it-qat | no disponible | no disponible | QAT, distinta asignacion de bits | Apache 2.0 | no disponible |
| Gemma 4 modelos base | no disponible | no disponible | no disponible | Apache 2.0 | no disponible |

No se dispone de datos suficientes para una comparativa detallada con alternativas de la misma categoria. El modelo E2B mencionado en la documentacion difiere en la asignacion de bits (E4B mantiene feed-forward en 4 bits y reduce embeddings a 2 bits), pero no hay cifras de rendimiento publicadas.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo base puede contener sesgos presentes en sus datos de entrenamiento; la documentacion advierte que estos sesgos se heredan y remite a la model card del modelo base.
- Riesgo de alucinacion: el modelo predice texto plausible pero no verifica hechos; puede producir respuestas seguras pero incorrectas, incompletas o sesgadas.
- Limitaciones de contexto: la longitud de contexto no esta documentada en la informacion disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe consultarse la licencia Gemma 4 especifica en el enlace proporcionado.
- Compatibilidad limitada: el archivo no carga en llama.cpp upstream; requiere runtimes que soporten el bloque Q2_0 de la linea PrismML/Gadeon, lo que restringe las opciones de despliegue.
- Uso fuera de alcance: no apto para tareas que requieran exactitud factual verificada, ni como base para decisiones legales, medicas, financieras o de seguridad sin revision humana.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/leok7v/gemma-4-e4b-it-qat
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it-qat-mobile-transformers
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Ficha en Qualcomm AI Hub: https://aihub.qualcomm.com/iot/models/gemma_4_e4b_it
- Ficha en local-ai-zone: https://local-ai-zone.github.io/models/gemma-4-e4b-it-qat.html
