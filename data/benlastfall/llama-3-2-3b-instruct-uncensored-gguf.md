# Benlastfall/Llama-3.2-3B-Instruct-uncensored-GGUF

## Resumen

Llama-3.2-3B-Instruct-uncensored-GGUF es un repositorio de cuantizaciones GGUF de un modelo "uncensored" (sin alineación de seguridad) de 3B parámetros, derivado de Llama 3.2 3B Instruct de Meta. El modelo base fue publicado por el usuario chuanli11 (chuanli11/Llama-3.2-3B-Instruct-uncensored) y las cuantizaciones estáticas incluidas en esta ficha fueron realizadas por mradermacher, aunque el repositorio analizado está republicado bajo la cuenta de Benlastfall. Su propósito es ofrecer una versión del modelo instructivo de Meta sin los filtros de rechazo típicos del RLHF, ejecutable localmente en hardware modesto.

Es relevante porque los modelos de 3B parámetros son de los pocos que funcionan con fluidez en portátiles, móviles y GPUs de consumo, y las variantes "uncensored" se utilizan en investigación de alineación, red teaming y casos donde los rechazos del modelo original resultan excesivamente conservadores. Al ser un GGUF, es compatible directamente con llama.cpp, Ollama, LM Studio y otras herramientas del ecosistema.

Debe subrayarse que se trata de un modelo de terceros sin documentación propia sobre el proceso de "desalineación": no hay model card detallada del autor original que explique el método empleado (abliteración, fine-tuning con dataset sin filtros, etc.), lo que añade incertidumbre sobre su comportamiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder autorregresivo (familia Llama 3.2) |
| Parametros totales | 3.606.752.320 |
| Parametros activos | no disponible (no hay indicios de que sea MoE; se asume densidad completa) |
| Longitud de contexto | no disponible en la ficha (el Llama 3.2 3B original soporta 128.000 tokens) |
| Tipos de cuantizacion | Q2_K, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_M, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (según los metadatos del repositorio) |
| Licencia | no disponible (el modelo base Llama 3.2 se distribuye bajo Llama 3.2 Community License) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Llama 3.2 3B Instruct: un transformer decoder denso (no MoE) con las optimizaciones estándar de la familia Llama 3 (RoPE, GQA/attention optimizada y vocabulario de 128.256 tokens en el modelo original). Los pesos originales de Meta fueron entrenados con más de 15 billones de tokens y posteriormente ajustados con SFT y RLHF/DPO para seguir instrucciones, aunque estos datos corresponden al modelo base de Meta y no al proceso de modificación de chuanli11.

La variante "uncensored" de chuanli11 no documenta públicamente su método de desalineación en la información disponible; en la práctica, este tipo de derivados suelen obtenerse mediante técnicas como abliteración (modificación de direcciones de activación) o fine-tuning adicional. Lo que sí está documentado es el trabajo de mradermacher: se trata de cuantizaciones GGUF estáticas generadas por conversión desde el formato HF, con cuants que van desde Q2_K (1,6 GB) hasta f16 (7,3 GB), y una versión alternativa con imatrix (matriz de importancia) disponible en el repositorio i1 del mismo autor.

## Capacidades

- Generacion de texto conversacional multi-turno siguiendo el formato de instrucciones de Llama 3.2 Instruct.
- Razonamiento general, escritura, resumen y respuesta a preguntas, heredados del modelo instructivo base.
- Generacion y explicacion de codigo a nivel acorde a un modelo de 3B parámetros (el original soporta tareas de código básicas, sin datos específicos de este derivado).
- Matematicas y razonamiento aritmetico basico, con las limitaciones propias de su tamaño.
- Sin restricciones de seguridad deliberadas: responde a solicitudes que el modelo original rechazaría, lo cual es su característica diferencial.
- No hay evidencia en la información disponible de capacidades multimodales, vision, audio, thinking mode ni soporte nativo de tool calling para este derivado (el Llama 3.2 3B original soporta tool calling básico, pero no hay datos de que se conserve aquí).

## Casos de uso

- Investigacion en alineacion y red teaming: permite estudiar el comportamiento de un modelo sin filtros en un tamaño manejable, útil para evaluar guardrails y técnicas de mitigación.
- Ejecucion local en hardware modesto: con el quant Q4_K_M (2,3 GB) funciona en portátiles sin GPU dedicada vía llama.cpp u Ollama, útil para prototipado sin dependencia de la nube.
- Escritura creativa sin rechazos: generación de ficción con contenido que los modelos alineados suelen bloquear (violencia en narrativa, temas sensibles), donde el usuario asume la responsabilidad del output.
- Chatbots offline y privacidad: procesamiento de conversaciones íntegramente en local, sin enviar datos a terceros, adecuado para entornos con restricciones de datos.
- Automatizacion de tareas con agentes locales: integrable en pipelines de llama.cpp o frameworks de agentes ligeros para tareas de clasificación, extracción y reformateo de texto.
- Educacion y experimentacion con cuantizacion: la gama completa de quants (Q2_K a f16) lo hace idóneo para comparar en la práctica el impacto de la cuantización en calidad y velocidad.
- Asistente embebido en aplicaciones: su tamaño permite integrarlo en apps de escritorio o servidores pequeños como componente de lenguaje natural de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Tampoco existen evaluaciones publicadas del derivado "uncensored" que permitan comparar su degradación respecto al Llama 3.2 3B Instruct oficial (cuyos resultados oficiales, como MMLU o HumanEval, corresponden al modelo de Meta y no a esta variante).

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: desde ~1,6 GB (Q2_K) hasta ~7,3 GB (f16); el quant recomendado Q4_K_M ocupa ~2,3 GB más el KV cache.
- Cabe sobradamente en GPUs de consumo: una RTX 3060 de 12 GB o incluso una RTX 3050 de 8 GB ejecutan el Q8_0 (3,9 GB) con holgura; también funciona solo con CPU y 8 GB de RAM en los quants bajos.
- GPU recomendadas: cualquier GPU moderna con 4-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090 dará throughput muy alto); no se requieren A100 ni H100.
- Despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, y cualquier runtime compatible con GGUF; también cargable vía transformers si se usa el modelo base en formato safetensors.
- Latencia y throughput: no disponibles como datos publicados; al ser un modelo de 3B, se esperan velocidades de decodificación de decenas de tokens/segundo incluso en CPU moderna, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Llama-3.2-3B-Instruct-uncensored (esta ficha) | 3,6B | no disponible (base: 128K) | no disponible | Sin filtros de seguridad, GGUF con quants Q2_K a f16 |
| Llama 3.2 3B Instruct (Meta, oficial) | 3,2B | 128.000 tokens | Llama 3.2 Community License | Alineado con RLHF/DPO, soporte oficial de tool calling y multilingüe |
| Qwen2.5-3B-Instruct | 3,1B | 32.768 tokens | Qwen Research (uso comercial permitido con condiciones) | Alineado, fuerte en código y matemáticas, multilingüe |
| Phi-3.5-mini-instruct | 3,8B | 128.000 tokens | MIT | Alineado, buen rendimiento por tamaño, contexto largo |

## Limitaciones y advertencias

- Ausencia de filtros de seguridad: el modelo puede generar contenido ofensivo, peligroso o ilegal sin rechazarlo. Su uso conlleva responsabilidad legal y ética plena para el usuario; no es apto para producción orientada a usuarios finales sin capas de moderación externas.
- Metodo de desalineacion no documentado: no hay model card que explique cómo se eliminaron los refusals, por lo que la degradación de calidad respecto al modelo base es desconocida y puede ser significativa.
- Riesgo de alucinacion elevado, agravado por el tamaño (3B) y por la posible degradación del proceso de modificación; no debe usarse como fuente de verdad factual.
- Idioma: los metadatos indican solo inglés; el rendimiento en castellano no está verificado para este derivado (el Llama 3.2 oficial sí es multilingüe, pero la modificación podría haber afectado a esa capacidad).
- Licencia no especificada en el repositorio; el modelo base de Meta está sujeto a la Llama 3.2 Community License, que impone condiciones de uso (incluida la política de uso aceptable), y su cumplimiento aplica también a los derivados.
- Contexto: la longitud de contexto efectiva de esta versión no está confirmada; en cuants agresivos como Q2_K la calidad se degrada notablemente según el propio autor de las cuantizaciones.
- Cero descargas y cero likes en el repositorio en el momento de la ficha: carece de validación comunitaria y de pruebas de funcionamiento reportadas.

## Enlaces

- Repositorio de la ficha: https://huggingface.co/Benlastfall/Llama-3.2-3B-Instruct-uncensored-GGUF
- Modelo base: https://huggingface.co/chuanli11/Llama-3.2-3B-Instruct-uncensored
- Cuants con imatrix de mradermacher: https://huggingface.co/mradermacher/Llama-3.2-3B-Instruct-uncensored-i1-GGUF
- Cuants estáticos originales de mradermacher: https://huggingface.co/mradermacher/Llama-3.2-3B-Instruct-uncensored-GGUF
- Guia de uso de GGUF referenciada (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ de solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Empresa colaboradora: https://www.nethype.de/
