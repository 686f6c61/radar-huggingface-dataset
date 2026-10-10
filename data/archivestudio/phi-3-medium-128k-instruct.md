# ArchiveStudio/Phi-3-medium-128k-instruct

## Resumen

Phi-3-medium-128k-instruct es un modelo de generacion de texto de 14.000 millones de parametros (13.960.238.080 en pesos safetensors) desarrollado originalmente por Microsoft dentro de la familia Phi-3. El repositorio analizado, ArchiveStudio/Phi-3-medium-128k-instruct, es una redistribucion del modelo oficial de Microsoft bajo licencia MIT, no una creacion de ArchiveStudio. El modelo esta disenado para entornos con restricciones de memoria o computo, escenarios con latencia critica y tareas que requieren razonamiento intensivo en codigo, matematicas y logica.

Se trata de un transformer decoder-only denso (no es una arquitectura MoE; la variante MoE aparece en Phi-3.5-MoE-instruct, no en esta). Soporta una ventana de contexto de 128.000 tokens, lo que lo situa en la gama alta de contexto dentro de su tamano, y utiliza un vocabulario de 32.064 tokens. Se entreno sobre los datasets Phi-3, que combinan datos sinteticos con datos filtrados de la web publica, priorizando contenido denso en razonamiento y de alta calidad.

Su relevancia actual reside en que ofrece un equilibrio poco habitual entre tamano moderado, contexto muy largo y capacidad de razonamiento, con licencia MIT que facilita el uso comercial. Esta sometido a un post-entrenamiento con ajuste supervisado (SFT) y optimizacion directa de preferencias (DPO) para seguir instrucciones y aplicar medidas de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Phi-3, tipo phi3) |
| Parametros totales | 13.960.238.080 (~14B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128.000 tokens (variante 128K) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Multilingue segun etiquetas del repositorio; la model card indica uso comercial y de investigacion principalmente en ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (con custom_code; requiere trust_remote_code=True) |
| Vocabulario | 32.064 tokens |
| Tamano del repositorio | 27,9 GB |
| Transformers minimo | 4.40.2 (version de desarrollo) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo phi3, con 14.000 millones de parametros en configuracion densa. No emplea mezcla de expertos ni capas de atencion lineal o state-space: es un transformer clasico optimizado para eficiencia de parametros. El modelo se distribuye con codigo personalizado, por lo que la carga requiere pasar trust_remote_code=True a from_pretrained() y una version de transformers igual o superior a 4.40.2. El tokenizador admite tokens de relleno (placeholder) para ajuste fino posterior y puede extenderse hasta los 32.064 tokens de vocabulario.

El entrenamiento utiliza los datasets Phi-3, una mezcla de datos sinteticos generados y datos web publicos filtrados, con enfasis en contenido de alta densidad de razonamiento. Sobre esa base se aplica un post-entrenamiento en dos fases: ajuste supervisado (SFT) y optimizacion directa de preferencias (DPO), orientadas a mejorar el seguimiento de instrucciones y las medidas de seguridad. El formato de chat esperado es <|user|>Pregunta<|end|>\n<|assistant|>, y admite tambien prompts con ejemplos (few-shot) usando la misma plantilla. La model card no detalla el numero exacto de tokens de entrenamiento ni la composicion porcentual del dataset.

## Capacidades

- Generacion de texto general con formato conversacional multi-turno mediante la plantilla de chat documentada.
- Razonamiento logico, matematico y de sentido comun, segun los objetivos declarados de la familia Phi-3.
- Generacion y comprension de codigo, con la etiqueta "code" en el repositorio y enfoque explicito del entrenamiento en programacion.
- Manejo de contexto largo de hasta 128.000 tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Capacidad multilingue declarada por las etiquetas del repositorio, aunque la model card enfatiza el ingles como idioma principal de uso.
- Ajuste fino adicional posible gracias a los tokens de relleno incluidos en el tokenizador.
- No se documenta soporte nativo de tool calling, function calling, modo de razonamiento explicito (thinking mode), vision ni audio en la informacion proporcionada.

## Casos de uso

- Asistente de razonamiento tecnico: el modelo puede resolver problemas de logica y matematicas paso a paso en entornos con memoria limitada, gracias a sus 14B de parametros y su ventana de 128K tokens.
- Generacion de codigo en produccion: integrable en asistentes de IDE o pipelines de revision, con salida en formato conversacional y capacidad de mantener contexto de multiples archivos largos dentro de la ventana de 128K.
- Analisis de documentos extensos: informes, contratos o articulos cientificos que superen las decenas de miles de tokens pueden procesarse en una sola pasada sin troceado agresivo.
- Atencion al cliente automatizada: gestiona conversaciones multi-turno con historial largo, aprovechando el contexto de 128K para recordar interacciones previas dentro de la misma sesion.
- Resumen y extraccion de informacion en corpus largos: util para sintetizar documentacion tecnica o bases de conocimiento extensas.
- Prototipado rapido de aplicaciones de IA generativa: al tener licencia MIT y tamano moderado, es adecuado como bloque base para experimentacion academica y desarrollo interno.
- Despliegue en entornos con restricciones de computo: encaja en escenarios de inferencia con GPU unica o nodos modestos, donde modelos de 70B no serian viables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card indica que el modelo fue evaluado en pruebas de sentido comun, comprension del lenguaje, matematicas, codigo, contexto largo y razonamiento logico, y afirma un rendimiento competitivo frente a modelos del mismo tamano y del siguiente escalon, pero no se aportan cifras concretas (MMLU, HumanEval, GSM8K u otros) en la documentacion suministrada.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 28 GB solo para pesos, mas la cache KV, que crece de forma notable con contexto largo.
- VRAM estimada en cuantizacion de 8 bits: en torno a 14-16 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: en torno a 8-9 GB para pesos.
- GPU profesionales recomendadas: A100 (40/80 GB), H100, L40S o A6000 para trabajar comodamente con contexto de 128K en precision alta.
- GPU de consumo: una RTX 4090 (24 GB) puede ejecutar el modelo en 8 bits con contexto moderado, y en 4 bits cabe en tarjetas de 12-16 GB (RTX 4080, 4070 Ti, 3090).
- Contexto completo de 128K: requiere cache KV muy grande, por lo que en GPU de consumo solo es viable con cuantizacion agresiva y posiblemente offloading a CPU.
- Opciones de despliegue: transformers con trust_remote_code=True (integracion oficial desde 4.40.2), vLLM y TGI para servido en produccion. llama.cpp y Ollama requeririan una version GGUF que no se incluye en este repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- No se especifica el numero de capas ni la configuracion de atencion, por lo que no es posible calcular con precision el consumo de cache KV.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Phi-3-medium-128k-instruct (este repo) | 14B | 128K | MIT | safetensors | Redistribucion de ArchiveStudio del modelo de Microsoft |
| Phi-3-medium-4k-instruct | 14B | 4K | MIT | HF, ONNX | Misma base, contexto corto |
| Phi-3-small-128k-instruct | 7B | 128K | MIT | HF, ONNX (CUDA) | Version menor de la familia |
| Phi-3-mini-128k-instruct | 3,8B | 128K | MIT | HF, ONNX, GGUF | Version mas ligera, con GGUF disponible |
| Phi-3.5-MoE-instruct | No disponible | No disponible | MIT | HF | Variante con mezcla de expertos de la generacion siguiente |

Los datos de parametros y contexto de las variantes alternativas provienen de la tabla incluida en la propia model card del modelo. No se dispone de cifras de rendimiento comparativo en la informacion proporcionada, por lo que no se puede establecer una comparacion cuantitativa de calidad entre estos modelos.

## Limitaciones y advertencias

- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido plausible pero incorrecto, especialmente en tareas de hechos especificos o calculos complejos.
- Sesgos: la model card advierte explicitamente de que los modelos no estan disenados ni evaluados para todos los casos de uso posteriores, y recomienda evaluar y mitigar precision, seguridad y equidad antes de usos de alto riesgo.
- Idioma: aunque las etiquetas indican soporte multilingue, la documentacion enfatiza el ingles como idioma principal; el rendimiento en otras lenguas no esta garantizado ni cuantificado.
- Requisitos de codigo: la carga exige trust_remote_code=True, lo que implica ejecutar codigo personalizado del repositorio y debe revisarse en entornos de seguridad estricta.
- Contexto largo: no se detallan las tecnicas de atencion para 128K ni el posible deterioro del rendimiento en los extremos de la ventana.
- Cuantizaciones: no se proporcionan versiones GGUF, AWQ, GPTQ u ONNX en este repositorio concreto, lo que limita el despliegue directo en herramientas que las requieran.
- Licencia: MIT permite uso comercial y modificacion, pero se recomienda verificar el enlace de licencia original de Microsoft incluido en la model card para cualquier redistribucion.
- Repositorio espejo: al tratarse de una redistribucion de ArchiveStudio con 0 descargas y 0 likes, conviene contrastar la integridad de los pesos con el repositorio oficial de Microsoft antes de usarlo en produccion.
- Advertencia sobre la busqueda web: los resultados de busqueda proporcionados no guardan relacion con el modelo (corresponden a calculadoras de un videojuego) y no aportan informacion tecnica util.

## Enlaces

- Repositorio analizado: https://huggingface.co/ArchiveStudio/Phi-3-medium-128k-instruct
- Repositorio oficial del modelo: https://huggingface.co/microsoft/Phi-3-medium-128k-instruct
- Variante de contexto corto: https://huggingface.co/microsoft/Phi-3-medium-4k-instruct
- Version ONNX: https://huggingface.co/microsoft/Phi-3-medium-128k-instruct-onnx-cuda
- Phi-3.5 mini instruct: https://huggingface.co/microsoft/Phi-3.5-mini-instruct
- Phi-3.5 MoE instruct: https://huggingface.co/microsoft/Phi-3.5-MoE-instruct
- Phi-3.5 vision instruct: https://huggingface.co/microsoft/Phi-3.5-vision-instruct
- Blog de Microsoft sobre Phi-3: https://aka.ms/Phi-3Build2024
- Informe tecnico de Phi-3: https://aka.ms/phi3-tech-report
- Phi-3 en Azure AI Studio: https://aka.ms/phi3-azure-ai
- Phi-3 Cookbook (GitHub): https://github.com/microsoft/Phi-3CookBook
- Licencia original: https://huggingface.co/microsoft/Phi-3-medium-128k-instruct/resolve/main/LICENSE
