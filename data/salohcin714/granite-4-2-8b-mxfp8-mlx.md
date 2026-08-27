# salohcin714/granite-4.2-8b-mxfp8-mlx

## Resumen

El modelo `salohcin714/granite-4.2-8b-mxfp8-mlx` es una conversión cuantizada del modelo Granite 4.2 8B de IBM, adaptada al formato MLX para ejecución eficiente en Apple Silicon. El autor, salohcin714, ha transformado los pesos originales de `ibm-granite/granite-4.2-8b` utilizando la librería `mlx-lm` 0.31.3, aplicando cuantización MXFP8 (microscaling floating-point de 8 bits) mediante redondeo al más cercano y sin calibración. No se ha realizado ningún fine-tuning ni se han añadido datos de entrenamiento adicionales.

Granite 4.2 es una familia de modelos densos decoder-only de razonamiento, disponible en tamaños de 3B, 8B y 30B, con capacidades integradas de chain-of-thought, modos de pensamiento flexibles y tool calling aumentado con razonamiento. Esta conversión concreta está pensada para entornos Apple Silicon (MLX) y mantiene la licencia Apache 2.0 del modelo original. Aunque el nombre sugiere 8B de parámetros, el archivo safetensors de este repositorio contiene 2.472.873.984 parámetros, una discrepancia que se detalla en la sección de arquitectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Granite 4.2) |
| Parametros totales | 2.472.873.984 (segun safetensors; el modelo base declara 8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MXFP8 (microscaling floating-point, 8 bits) |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh (12 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (layout MLX) |

## Arquitectura y entrenamiento

El modelo base, Granite 4.2 8B, es un transformer decoder-only denso post-entrenado sobre los modelos base Granite 4.1. La familia Granite 4.2 incorpora razonamiento con chain-of-thought, modos de pensamiento configurables y tool calling aumentado con razonamiento. Esta conversión concreta no modifica la arquitectura subyacente: solo transforma los pesos al formato MLX y aplica cuantización MXFP8 de 8 bits mediante redondeo al más cercano, sin calibración ni fine-tuning. Se elimina el `lm_head` redundante cuando el modelo ata las embeddings de entrada y salida. El número de parámetros reportado en safetensors (2.47B) es notablemente inferior a los 8B declarados por el modelo base; esto podría deberse a una subida incompleta o a una particularidad de la conversión, pero no se dispone de más información al respecto.

## Capacidades

- Generacion de texto y conversacion multilingue en 12 idiomas (incluido espanol).
- Razonamiento con chain-of-thought integrado, con modos de pensamiento flexibles (pensamiento rapido, pensamiento profundo, etc.).
- Tool calling / function calling aumentado con razonamiento, util para agentes y automatizaciones.
- Soporte de agentes y razonamiento multi-paso.
- Capacidad de seguir instrucciones y mantener contexto conversacional.
- Optimizado para ejecucion en Apple Silicon mediante MLX, con cuantizacion MXFP8 que reduce el uso de memoria.

## Casos de uso

- Asistentes conversacionales en aplicaciones de escritorio para macOS: el modelo puede integrarse en apps nativas usando MLX, ofreciendo respuestas contextuales y multilingues sin necesidad de conexion a internet.
- Automatizacion de atencion al cliente: gracias a su soporte de tool calling y razonamiento, puede gestionar consultas multi-turno, consultar bases de conocimiento externas y derivar incidencias complejas a sistemas de ticketing.
- Generacion de codigo asistida en entornos de desarrollo: aunque no se especifican benchmarks de codigo, el modelo base Granite 4.2 incluye capacidades de generacion de codigo; esta version cuantizada puede usarse en IDEs ligeros en Mac.
- Analisis de documentos y resumen en espanol y otros idiomas: su ventana de contexto (no especificada, pero tipica en modelos de 8B) permite procesar documentos extensos y generar resumenes estructurados.
- Prototipado rapido de agentes de IA: al ser un modelo de 8B cuantizado, cabe en equipos con memoria unificada moderada, permitiendo experimentar con agentes que llaman herramientas y razonan en varios pasos.
- Educacion y tutoria: puede actuar como tutor conversacional en multiples idiomas, explicando conceptos y resolviendo dudas con razonamiento paso a paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta conversion cuantizada. El autor indica explicitamente en el disclaimer que los benchmarks publicados por IBM corresponden a los pesos originales y no deben interpretarse como caracteristicas de este repositorio. Para consultar el rendimiento del modelo base Granite 4.2 8B, se recomienda revisar la documentacion oficial de IBM, aunque no se incluyen cifras concretas en la informacion disponible.

## Requisitos de hardware

- Al ser un modelo MLX, esta disenado para Apple Silicon (M1, M2, M3, M4 y posteriores).
- El tamano del repositorio es de 9,1 GB, pero los pesos cuantizados a 8 bits ocupan aproximadamente 2,5 GB (estimacion basada en el numero de parametros del safetensors). Se recomienda un minimo de 8 GB de memoria unificada para una ejecucion comoda.
- No se requieren GPU discretas; la inferencia se ejecuta en la GPU integrada y la memoria unificada del chip Apple.
- Opciones de despliegue: uso directo con `mlx-lm` (carga y generacion), integracion en aplicaciones Swift/Python, o servidores compatibles con MLX.
- No se dispone de datos de latencia o throughput especificos para esta conversion.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Formato | Licencia | Contexto |
|---|---|---|---|---|---|
| salohcin714/granite-4.2-8b-mxfp8-mlx | 2,47B (safetensors) | MXFP8 8-bit | MLX | Apache 2.0 | No disponible |
| ibm-granite/granite-4.2-8b (original) | 8B | FP16/BF16 | Safetensors | Apache 2.0 | No disponible |
| salohcin714/granite-4.1-8b-8bit-gptq-mlx | 8B (aprox.) | GPTQ 8-bit | MLX | Apache 2.0 | No disponible |

La comparativa se limita a variantes del mismo modelo base. No se dispone de datos de rendimiento para establecer una comparacion cuantitativa. La principal diferencia entre las versiones MLX es el tipo de cuantizacion (MXFP8 vs GPTQ) y la version de Granite (4.2 vs 4.1).

## Limitaciones y advertencias

- La cuantizacion MXFP8 puede introducir una ligera degradacion en la calidad de las respuestas respecto al modelo original en precision completa.
- El numero de parametros reportado en safetensors (2,47B) no coincide con el nombre del modelo (8B); se recomienda verificar la integridad de los archivos antes de usarlo en produccion.
- No se han publicado benchmarks especificos para esta conversion; los resultados de IBM no son aplicables directamente.
- El modelo puede presentar sesgos y alucinaciones inherentes a los modelos de lenguaje entrenados con datos web; se recomienda validar las salidas en contextos criticos.
- La licencia Apache 2.0 permite uso comercial, pero el autor no esta afiliado a IBM y el nombre "Granite" es una marca registrada de IBM utilizada con fines descriptivos.
- Al estar optimizado para Apple Silicon, no es utilizable directamente en GPUs NVIDIA o AMD sin una conversion adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/salohcin714/granite-4.2-8b-mxfp8-mlx
- Modelo base original: https://huggingface.co/ibm-granite/granite-4.2-8b
- Documentacion oficial de Granite 4.2: https://www.ibm.com/granite/docs/models/granite4-2
- Repositorio GitHub de Granite 4.2: https://github.com/ibm-granite/granite-4.2-language-models
- Libreria mlx-lm: https://github.com/ml-explore/mlx-lm
