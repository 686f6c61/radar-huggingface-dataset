# llmfan46/Qwen3.5-27B-ultra-uncensored-heretic-v1-GGUF

## Resumen

Qwen3.5-27B-ultra-uncensored-heretic-v1-GGUF es la distribucion en formato GGUF del modelo llmfan46/Qwen3.5-27B-ultra-uncensored-heretic-v1, una variante "abliterated" (decensurada) del Qwen3.5-27B de Alibaba. El autor, llmfan46, es un contribuidor independiente que publica versiones sin restricciones de contenido de modelos populares mediante la herramienta Heretic. El objetivo es eliminar los rechazos y el tono moralizante del modelo original manteniendo al maximo las capacidades base.

El modelo conserva la arquitectura del Qwen3.5-27B original (transformer denso de aproximadamente 26.900 millones de parametros) y su pipeline multimodal image-text-to-text, por lo que acepta entradas de imagen y texto. La intervencion se realiza exclusivamente sobre pesos, sin reentrenamiento: se aplican tecnicas de ablacion ortogonal que preservan la magnitud (MPOA) y abliteracion auto-organizada (SOMA) sobre las proyecciones de salida de atencion y de la MLP.

La relevancia de esta ficha radica en que cuantifica el compromiso entre eliminar restricciones y degradar calidad: el autor reporta una reduccion de rechazos del 95/100 al 3/100 con una divergencia KL de 0.0301 respecto al original, y una caida de 0.7 puntos en precision PIQA. Es material de evaluacion para quienes necesitan modelos sin filtrado en entornos controlados, y tambien un caso de estudio sobre los limites del "uncensoring" por ablacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5), multimodal image-text-to-text |
| Parametros totales | 26.895.998.464 (26,9 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (multiples niveles; el repositorio pesa 177,4 GB en total, el autor no detalla la lista exacta de quants) |
| Idiomas soportados | No disponibles (heredados del Qwen3.5-27B base, sin confirmar en la model card) |
| Licencia | No disponible |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base publica safetensors |
| Modelo base | llmfan46/Qwen3.5-27B-ultra-uncensored-heretic-v1, derivado de Qwen/Qwen3.5-27B |
| Metodo de decensurado | Heretic v1.2.0 con MPOA y SOMA |
| Componentes ablacionados | attn.out_proj, attn.o_proj, mlp.down_proj |
| Descargas / likes | 655 descargas, 36 likes |
| Fecha de creacion | 2026-03-01 |

## Arquitectura y entrenamiento

El modelo parte del Qwen3.5-27B, un transformer denso de 26,9 mil millones de parametros con capacidad multimodal (procesa imagen y texto en el mismo pipeline). No se ha realizado ningun entrenamiento adicional ni ajuste fino: la modificacion consiste en una ablacion de direcciones en el espacio de activaciones aplicada capa por capa sobre tres componentes concretos (attn.out_proj, attn.o_proj y mlp.down_proj). La herramienta Heretic v1.2.0 permite seleccionar pesos por capa, y la model card documenta los coeficientes exactos usados (por ejemplo, max_weight_position 43,58 para attn.out_proj y 55,04 para mlp.down_proj), lo que hace el proceso reproducible.

La innovacion tecnica declarada es la combinacion de Magnitude-Preserving Orthogonal Ablation (MPOA), que proyecta la direccion de rechazo fuera del subespacio ortogonal sin alterar la norma de los pesos, y Self-Organizing Map Abliteration (SOMA), que organiza las direcciones de ablacion por capas mediante mapas autoorganizados. El resultado declarado es una divergencia KL de 0,0301 frente al modelo original, es decir, una desviacion pequena en la distribucion de salida, junto con una reduccion de rechazos de 95/100 a 3/100 en el conjunto de prueba del autor. No se especifican datos de entrenamiento, numero de tokens ni composicion del dataset porque no hubo entrenamiento.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del Qwen3.5-27B base.
- Procesamiento de imagen y texto (pipeline image-text-to-text): el modelo acepta entradas visuales junto con prompts textuales.
- Razonamiento y respuesta a instrucciones sin rechazos ni advertencias moralizantes en la mayoria de casos (3/100 rechazos reportados).
- Capacidad de seguir instrucciones en dominios sensibles que el modelo original rechazaria, manteniendo coherencia general segun la metrica KL.
- Soporte de tool calling / function calling: no confirmado en la model card; debe validarse contra el modelo base Qwen3.5-27B.
- Razonamiento multi-paso y comportamiento agentico: no documentado especificamente para esta variante.
- Capacidades multilingues: no documentadas; dependen del modelo base.
- Modo "thinking" o razonamiento extendido: no documentado.

## Casos de uso

- Investigacion sobre alineacion y seguridad: permite estudiar como responde un modelo sin capas de rechazo ante prompts sensibles, comparando directamente con el original y midiendo la divergencia KL de 0,0301 como referencia de fidelidad.
- Evaluacion de tecnicas de abliteracion: los coeficientes por capa publicados en la model card sirven para reproducir el proceso con Heretic y comparar MPOA/SOMA frente a otros metodos de decensurado.
- Generacion creativa sin filtros: escritura de ficcion, guiones o narrativa con tematicas adultas o controvertidas donde el modelo base introduciria evasivas; el contexto multimodal permite ademas describir imagenes de referencia.
- Analisis de contenido y red teaming: uso en pipelines internos de pruebas de robustez para generar respuestas adversarias y medir la eficacia de filtros de salida propios.
- Despliegue local en formato GGUF: al estar cuantizado, puede ejecutarse con llama.cpp u Ollama en hardware de consumo, lo que facilita prototipos sin depender de APIs externas.
- Asistencia en dominios regulados con supervision humana: entornos donde el operador asume la responsabilidad del contenido y necesita un modelo que no bloquee consultas tecnicas legitimas (medicina, derecho, seguridad) por precaucion excesiva.
- Procesamiento de documentos con imagenes: al ser image-text-to-text, puede extraer y razonar sobre capturas, diagramas o formularios escaneados en flujos de automatizacion.

## Benchmarks y rendimiento

| Metrica | Este modelo (Heretic) | Qwen3.5-27B original |
|---|---|---|
| Rechazos (sobre 100 prompts) | 3/100 | 95/100 |
| Divergencia KL vs original | 0,0301 | 0 (por definicion) |
| PIQA acc | 0,8058 (± 0,0092) | 0,8128 (± 0,0091) |
| PIQA acc_norm | 0,8161 (± 0,0090) | 0,8199 (± 0,0090) |

Los resultados de PIQA se obtuvieron con batch size 128 y 0-shot. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16 el modelo de 26,9 mil millones de parametros requiere aproximadamente 54 GB solo de pesos; en cuantizacion Q8 en torno a 28-30 GB; en Q4_K_M alrededor de 16-18 GB. Son estimaciones por tamano, no publicadas por el autor.
- GPU recomendadas: A100 80 GB o H100 para FP16; RTX 4090 (24 GB) para Q4/Q5; RTX 3090 (24 GB) para Q4.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y tarjetas con 16-24 GB usando cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; el tag endpoints_compatible sugiere compatibilidad con endpoints tipo OpenAI. vLLM y TGI no soportan GGUF de forma nativa para este tamano sin conversion.
- Latencia y throughput: no disponibles; dependen de la cuantizacion, la GPU y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-27B-ultra-uncensored-heretic-v1-GGUF (este) | 26,9 mil M | No disponible | Abliterado con Heretic (MPOA+SOMA), multimodal | No disponible | GGUF en Hugging Face |
| Qwen/Qwen3.5-27B (original) | 26,9 mil M | No disponible | Modelo alineado con rechazos | No disponible | Safetensors en Hugging Face |
| Variantes abliterated de la familia Qwen (otros autores) | Variable | Variable | Ablacion estandar sin MPOA/SOMA | Variable | Hugging Face / The Bloke y similares |

La comparativa se limita al modelo original y a variantes abliteradas genericas porque no se dispone de datos de benchmarks de alternativas concretas en la informacion proporcionada. La ventaja diferencial de esta version es la documentacion completa de coeficientes por capa y la metrica KL publicada, que permite auditar el compromiso calidad/decensurado.

## Limitaciones y advertencias

- El proceso de abliteracion degrada ligeramente las capacidades: PIQA acc cae de 0,8128 a 0,8058 y acc_norm de 0,8199 a 0,8161; la degradacion puede ser mayor en tareas no medidas.
- La eliminacion de rechazos implica que el modelo puede generar contenido danino, ilegal o sexualmente explicito sin advertencia; requiere supervision y filtros propios en produccion.
- Riesgo de alucinacion: no se ha evaluado especificamente en esta variante; la ablacion puede alterar la calibracion del modelo.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; la licencia del Qwen3.5-27B base debe verificarse antes de cualquier despliegue productivo.
- Idiomas y contexto no documentados en la model card; deben validarse contra el modelo base.
- El autor advierte que ha alcanzado el limite de almacenamiento gratuito de Hugging Face, por lo que la disponibilidad futura de nuevas cuantizaciones no esta garantizada.
- El repositorio pesa 177,4 GB; descargar la cuantizacion adecuada requiere seleccionar archivos concretos, no el repo completo.
- El uso de este modelo para red teaming o investigacion debe enmarcarse en entornos controlados y con las salvaguardas legales correspondientes.

## Enlaces

- Repositorio GGUF: https://huggingface.co/llmfan46/Qwen3.5-27B-ultra-uncensored-heretic-v1-GGUF
- Modelo base (safetensors): https://huggingface.co/llmfan46/Qwen3.5-27B-ultra-uncensored-heretic-v1
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-27B
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Apoyo al autor (Ko-fi): https://ko-fi.com/llmfan46
- Apoyo al autor (Patreon): https://patreon.com/LLMfan46
