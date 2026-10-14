# mradermacher/LFM2.5-Encoder-350M-Diffusion-i1-GGUF

## Resumen

LFM2.5-Encoder-350M-Diffusion es un modelo de lenguaje de la familia LFM2.5 desarrollado por Liquid AI. A diferencia de los decoders autoregresivos habituales, se trata de un encoder bidireccional con modelado de difusión enmascarada (MDLM, masked diffusion language model): en lugar de predecir el siguiente token, enmascara aleatoriamente partes de la secuencia y aprende a reconstruirlas de forma iterativa. Está ajustado por instrucciones y trabaja únicamente en inglés. La ficha que nos ocupa, con identificador `mradermacher/LFM2.5-Encoder-350M-Diffusion-i1-GGUF`, no es el modelo original, sino un repositorio de cuantizaciones GGUF de tipo i1 (con matriz de importancia) generadas por el usuario mradermacher a partir del modelo base `LiquidAI/LFM2.5-Encoder-350M-Diffusion`.

El tamaño nominal de la familia es de 350 millones de parámetros. Los metadatos de safetensors del repositorio reportan 304.300, dato que conviene verificar porque no coincide con la cifra del nombre. En cualquier caso, estamos ante un modelo muy pequeno, apto para ejecución en CPU, GPUs de gama de entrada y dispositivos con poca memoria. Su interés practico reside en el enfoque de difusión enmascarada aplicado a un modelo compacto: permite experimentar con decodificación paralela y relleno de huecos (infilling) a un coste computacional muy bajo, algo poco frecuente en el ecosistema abierto, dominado por arquitecturas autoregresivas.

La licencia es `lfm1.0` (LFM Open License 1.0), etiquetada como "other" en HuggingFace, y los términos concretos no se detallan en la información disponible. El repositorio de cuantizaciones se creó el 14 de octubre de 2026 y en el momento de redactar esta ficha presenta 0 descargas, 0 likes y un tamaño de repositorio de 0.0 GB, por lo que es imprescindible comprobar la disponibilidad real de los archivos antes de planificar su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional con modelado de difusión enmascarada (MDLM); no autoregresivo |
| Parametros totales | 304.300 según metadatos de safetensors reportados por HuggingFace; el nombre del modelo indica 350 M (discrepancia sin resolver) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF i1 (imatrix/weighted): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, IQ4_XS, Q4_K_S, Q4_K_M, small-IQ4_NL, Q5_K_S, Q5_K_M, Q6_K; se incluye además un fichero imatrix para generar cuantizaciones propias |
| Idiomas soportados | inglés (en) |
| Licencia | lfm1.0 (LFM Open License 1.0), etiquetada como "other"; términos concretos no disponibles en la información proporcionada |
| Formato de pesos | GGUF (repositorio cuantizado); el modelo base usa safetensors |
| Libreria declarada | transformers |
| Modelo base | LiquidAI/LFM2.5-Encoder-350M-Diffusion |
| Cuantizado por | mradermacher |
| Repositorio de cuantizaciones estaticas | mradermacher/LFM2.5-Encoder-350M-Diffusion-GGUF |
| Descargas / likes | 0 / 0 |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

El modelo se basa en un transformer encoder con atención bidireccional, es decir, cada token atiende a la totalidad de la secuencia en ambas direcciones. Sobre esa base se aplica un objetivo de difusión enmascarada (masked diffusion language modeling): durante el entrenamiento se enmascaran tokens de forma aleatoria y el modelo aprende a recuperarlos, de manera que en inferencia la generación se realiza por desenmascarado iterativo en varios pasos, pudiendo actualizar varios tokens en paralelo en cada paso. Esto lo aleja del esquema token a token de los decoders autoregresivos y explica las etiquetas `bidirectional`, `masked-lm`, `diffusion-language-model`, `masked-diffusion` y `mdlm`.

Los detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF, DPO u otras técnicas de alineación) no están disponibles en la información proporcionada. La única indicación sobre el ajuste es la etiqueta `instruction-tuned`, que sugiere una fase de ajuste supervisado sobre instrucciones en inglés. Tampoco hay información sobre innovaciones adicionales como decodificación especulativa o mecanismos de atención lineal. El repositorio analizado no contiene el modelo en sí, sino versiones GGUF generadas con cuantización ponderada por matriz de importancia (i1), una técnica que busca preservar mejor la perplejidad que la cuantización uniforme en niveles bajos de bits.

## Capacidades

- Modelado de lenguaje bidireccional: al ser un encoder, produce representaciones contextuales de la secuencia completa, aprovechable para tareas de comprensión y clasificación.
- Generación por difusión enmascarada: la generación de texto se realiza mediante desenmascarado iterativo, con posibilidad de decodificación parcialmente paralela.
- Ajuste por instrucciones (`instruction-tuned`): se espera que responda a indicaciones en inglés, aunque no se documenta el formato de prompt ni la plantilla de chat.
- Relleno de huecos (infilling): la combinación de bidireccionalidad y enmascarado hace natural el completado de fragmentos en medio de un texto; no confirmado explícitamente en la información disponible.
- Idioma: únicamente inglés según los metadatos; no se declara soporte multilingüe.
- Tool calling / function calling: no disponible; no se menciona en la información proporcionada y no es una capacidad esperable en un encoder de difusión sin decoder asociado.
- Agentes y razonamiento multi-paso: no disponible; no se documenta ningún soporte.
- Visión, audio u otras modalidades: no disponible; las etiquetas no incluyen ninguna modalidad adicional.

## Casos de uso

- Relleno de texto en editores e IDE (infilling): la arquitectura bidireccional con enmascarado permite rellenar huecos en un fragmento de código o prosa en inglés; con cuantizaciones de 200-300 MB puede ejecutarse en local sin GPU dedicada.
- Preprocesado y comprensión de texto en pipelines de NLP: al ser un encoder, sus representaciones sirven para clasificación de secuencias, detección de temas o extracción de entidades en inglés, integrándose detrás de una API interna.
- Prototipado e investigación en modelos de difusión de lenguaje: es un banco de pruebas barato para comparar estrategias de decodificación (número de pasos, desenmascarado paralelo, remasking) frente a líneas base autoregresivas, sin necesidad de clústeres de GPU.
- Generación de texto de baja latencia en entornos restringidos: con cuantizaciones IQ2 o Q3 el modelo ocupa menos de 200 MB, por lo que puede desplegarse en contenedores pequeños, dispositivos ARM o incluso en el navegador mediante runtimes GGUF en WebAssembly.
- Ajuste fino para tareas concretas de dominio en inglés: por su tamaño, es viable un fine-tuning completo o con LoRA en una única GPU consumer para clasificación, resumen extractivo o normalización de texto.
- Servicio de autocompletado interno en herramientas corporativas en inglés: sustituye llamadas a APIs externas en flujos donde la latencia y el coste por token son críticos y la calidad exigida es moderada.
- Evaluación comparativa de cuantizaciones: el repositorio publica más de veinte variantes GGUF del mismo modelo, lo que permite medir de forma sistemática el impacto de la cuantización en las tareas objetivo antes de fijar una configuración de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para los pesos, a partir de un modelo de ~350 M de parámetros (estimación aritmética, no medida por el autor):
  - IQ1_S: en torno a 75-90 MB.
  - Q2_K / Q2_K_S: en torno a 120-140 MB.
  - Q3_K_M: en torno a 160-180 MB.
  - Q4_K_M / Q4_0: en torno a 200-230 MB.
  - Q5_K_M: en torno a 250-270 MB.
  - Q6_K: en torno a 290-310 MB.
  - Referencia no incluida en el repositorio: Q8_0 ≈ 375 MB y FP16 ≈ 700 MB.
- Memoria adicional para activaciones y buffers: se recomienda reservar al menos 0,5-1 GB por encima del peso de los archivos.
- GPU recomendadas: cualquiera con 2 GB de VRAM o más (GTX 1050 Ti, RTX 3050, RTX 4060, etc.). No requiere A100, H100 ni GPUs de centro de datos.
- Cabe holgadamente en cualquier GPU consumer, e incluso en CPU, Apple Silicon y placas tipo Raspberry Pi en las cuantizaciones más bajas.
- Latencia y throughput: no disponibles. Al tratarse de un modelo de difusión bidireccional, cada paso de desenmascarado implica una pasada completa sobre la secuencia y no existe una caché KV equivalente a la de los decoders, por lo que el tiempo total depende del número de pasos y de la longitud; conviene medirlo en el caso de uso concreto.
- Opciones de despliegue: llama.cpp / llama-server es la vía natural para los archivos GGUF; `transformers` es la librería declarada para el modelo base. La compatibilidad de esta arquitectura concreta (encoder + difusión enmascarada) con llama.cpp, vLLM, TGI u Ollama no está confirmada en la información disponible. La etiqueta `endpoints_compatible` de HuggingFace sugiere compatibilidad genérica con Inference Endpoints, sin garantía para esta arquitectura.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo de arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-Encoder-350M-Diffusion (este) | ~350 M (304.300 en safetensors) | Encoder bidireccional + difusión enmascarada, instruction-tuned | no disponible | lfm1.0 ("other") | Cuantizaciones GGUF i1 en el repositorio analizado; 0 descargas |
| LiquidAI/LFM2-350M | ~350 M | Transformer decoder autoregresivo | no disponible | LFM Open License | Modelo base publicado por Liquid AI |
| LLaDA (Large Language Diffusion with mAsking) | 8 B | Difusión enmascarada (MDLM) | no disponible | MIT | Pesos publicados; escala muy superior, requiere GPU de gama alta |
| ModernBERT-base | 149 M | Encoder bidireccional (masked LM, sin difusión) | no disponible | Apache-2.0 | Ampliamente adoptado, ecosistema maduro |

Las cifras de contexto, rendimiento y benchmarks de los modelos comparados no se han verificado con fuentes en esta ficha; se indican solo los datos de identificación y licencia. La comparación relevante es de categoría: este modelo es un encoder con difusión enmascarada de tamano muy reducido, por lo que compite con encoders clásicos tipo BERT/ModernBERT y con propuestas de difusión mucho mayores como LLaDA.

## Limitaciones y advertencias

- El repositorio muestra 0 descargas, 0 likes y un tamaño de 0.0 GB. Es posible que los archivos no estén disponibles o que las estadísticas sean incorrectas; verificar antes de depender de él.
- Solo inglés. No hay soporte multilingüe declarado y el rendimiento fuera del inglés no está documentado.
- La licencia es `lfm1.0` etiquetada como "other". Los términos exactos de uso comercial, atribución y redistribución no están en la información disponible y deben consultarse en el archivo LICENSE del modelo base.
- Es un encoder de difusión, no un decoder autoregresivo: no es intercambiable con el ecosistema estándar de chat, plantillas de conversación, tool calling o agentes. Cualquier integración que asuma generación token a token requerirá adaptaciones.
- No hay resultados de benchmarks, evaluaciones ni comparativas publicadas, por lo que no puede afirmarse nada sobre su calidad real en tareas concretas.
- Tamano reducido (~350 M): capacidad limitada de razonamiento, conocimiento factual escaso y riesgo elevado de alucinación, especialmente si se le pide generar hechos.
- Las cuantizaciones agresivas (IQ1, IQ2, Q2_K) degradan notablemente la calidad. Para tareas sensibles a la precisión conviene usar Q4_K_M o superior; la matriz de importancia del repositorio está pensada precisamente para mitigar esa pérdida.
- No se documentan los datos de entrenamiento, por lo que no puede evaluarse la composición del corpus ni los sesgos potenciales.
- La longitud de contexto no está disponible; superar el límite real puede producir degradación silenciosa, especialmente en un modelo bidireccional donde toda la secuencia se procesa en cada paso.
- El comportamiento de la difusión enmascarada depende del número de pasos y de la estrategia de desenmascarado; dos configuraciones distintas pueden dar resultados muy diferentes con el mismo peso, lo que complica la reproducibilidad.

## Enlaces

- Repositorio de cuantizaciones i1 (objeto de esta ficha): https://huggingface.co/mradermacher/LFM2.5-Encoder-350M-Diffusion-i1-GGUF
- Cuantizaciones estáticas del mismo autor: https://huggingface.co/mradermacher/LFM2.5-Encoder-350M-Diffusion-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-Encoder-350M-Diffusion
- Página de resumen y descargas del autor: https://hf.tst.eu/model#LFM2.5-Encoder-350M-Diffusion-i1-GGUF
- Guía general de uso de archivos GGUF referenciada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Grafica comparativa de tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Patrocinador del trabajo de cuantización (nethype GmbH): https://www.nethype.de/
