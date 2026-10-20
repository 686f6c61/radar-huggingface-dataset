# jancirnodziewiaty/Wicked-Tutu-26B-A4B-oQ4e

## Resumen

Wicked-Tutu-26B-A4B-oQ4e es una versión cuantizada en formato MLX del modelo ReadyArt/Wicked-Tutu-26B-A4B, publicada por el usuario jancirnodziewiaty. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos orientada a la inferencia local en hardware de Apple: el checkpoint emplea cuantización de precisión mixta generada con la herramienta oQ (oMLX v0.7.1rc1), con una media efectiva de 4,899 bits por peso sobre un total de 25.805.936.206 parámetros. El repositorio ocupa 15,8 GB, frente a los aproximadamente 51,6 GB que requeriría el mismo modelo en BF16.

La relevancia de esta ficha es acotada y conviene ser explícito: el modelo tiene cero descargas y cero likes en el momento de la consulta, la model card se limita a documentar el proceso de cuantización y no se declara licencia, idiomas ni pipeline. El interés técnico está en el desglose de la mezcla de bits, que concentra el 93,4 % de los pesos en 4 bits afines con grupo de 64 y reserva capas en 8 bits (3,15 %) y BF16 (2,25 %) para preservar sensibilidad, además de mantener la torre de visión separada con 0,570B parámetros.

El sufijo "A4B" y la etiqueta gemma4 sugieren una arquitectura de mezcla de expertos con aproximadamente 4.000 millones de parámetros activos, derivada de la familia Gemma; esta interpretación no está confirmada en la documentación disponible y debe tratarse como inferencia a partir de la nomenclatura, no como dato verificado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No confirmada en la model card; la etiqueta `gemma4` y la nomenclatura "26B-A4B" apuntan a un transformer con mezcla de expertos (MoE) de la familia Gemma, con torre de visión separada |
| Parámetros totales | 25.805.936.206 (25,806B), según safetensors |
| Parámetros activos | No confirmado; "A4B" sugiere ~4.000 millones activos (inferencia, no verificado) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Cuantización mixta oQ (oMLX v0.7.1rc1): affine 4-bit grupo 64, affine 5-bit grupo 64, affine 6-bit grupo 64, affine 8-bit grupo 64 y BF16; media efectiva 4,899 bits/peso |
| Idiomas soportados | No disponibles |
| Licencia | No disponible en el repositorio |
| Formato de pesos | safetensors (formato MLX), 15,8 GB de repositorio |

Desglose de la cuantización por tipo de almacenamiento:

| Formato | Pesos lógicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 4-bit, grupo 64 | 24,103B | 93,402 % | 12,627 GiB | 4,50 |
| Affine 5-bit, grupo 64 | 0,255B | 0,988 % | 0,163 GiB | 5,50 |
| Affine 6-bit, grupo 64 | 0,053B | 0,205 % | 0,040 GiB | 6,50 |
| Affine 8-bit, grupo 64 | 0,814B | 3,154 % | 0,805 GiB | 8,50 |
| BF16 | 0,581B | 2,252 % | 1,082 GiB | 16,00 |
| Total | 25,806B | 100 % | 14,718 GiB | 4,899 |

Desglose por componente:

| Componente | Pesos lógicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 25,236B | 14,664 GB / 13,657 GiB |
| Visión | 0,570B | 1,139 GB / 1,061 GiB |
| Total | 25,806B | 15,803 GB / 14,718 GiB |

## Arquitectura y entrenamiento

La información disponible no documenta el entrenamiento del modelo base ReadyArt/Wicked-Tutu-26B-A4B: no se especifican tokens de entrenamiento, composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste supervisado. Lo único verificable en esta ficha es el proceso de posentrenamiento aplicado por el publicador, que es puramente de compresión: una cuantización de precisión mixta ejecutada con oQ sobre oMLX v0.7.1rc1, que asigna 4 bits afines (grupo de 64) al 93,4 % de los pesos y eleva selectivamente a 5, 6 y 8 bits, o mantiene en BF16, aquellas capas consideradas sensibles.

La estructura del checkpoint revela dos componentes diferenciados: un modelo de lenguaje de 25,236B parámetros y una torre de visión de 0,570B, lo que confirma que el modelo base es multimodal (entrada de imagen y texto). El peso de la torre de visión se almacena íntegramente en 4 bits afines, sin escalado selectivo, y representa solo el 7,2 % del espacio en disco. No se han publicado detalles sobre mecanismos de atención, uso de decodificación especulativa ni optimizaciones de inferencia más allá del propio formato MLX.

## Capacidades

Las capacidades que se listan a continuación se deducen de la estructura del checkpoint y de las etiquetas del repositorio; no hay evaluación publicada que las cuantifique.

- Procesamiento multimodal de imagen y texto: el checkpoint incluye una torre de visión de 0,570B parámetros, por lo que el modelo base acepta entradas visuales además de texto.
- Generación de texto y conversación multi-turno: propia de un modelo de lenguaje de 25,2B parámetros.
- Razonamiento y matemáticas: presumiblemente heredados del modelo base, sin datos verificables en la información disponible.
- Generación de código: no confirmada explícitamente; depende del modelo base.
- Soporte de tool calling y function calling: no disponible en la documentación.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la documentación.
- Multilingüismo: no disponible; el repositorio no declara lista de idiomas.
- Modo de razonamiento explícito (thinking) o salidas estructuradas: no disponible.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el formato MLX y los 14,718 GiB de pesos permiten ejecutar el modelo en un Mac Studio o MacBook Pro de gama alta sin GPU dedicada, usando la librería mlx y el runtime oMLX.
- Análisis de documentos con componente visual: al incluir torre de visión, puede emplearse para extraer información de capturas, diagramas o páginas escaneadas en flujos offline donde no se permite enviar datos a la nube.
- Prototipado de aplicaciones multimodales en Apple Silicon: sirve como checkpoint de pruebas para validar pipelines de imagen-texto antes de migrar a una versión BF16 o a un despliegue en servidor.
- Evaluación de técnicas de cuantización mixta: el desglose por capas (4/5/6/8 bits y BF16) lo convierte en un caso de estudio útil para medir la degradación de un modelo MoE multimodal al comprimirlo a 4,899 bits/peso de media.
- Asistente conversacional de escritorio con contexto largo: la ventana de contexto no está documentada, por lo que solo debe plantearse tras verificarla empíricamente con el modelo base.
- Investigación reproducible sobre formatos MLX: permite comparar el rendimiento de un mismo modelo en BF16 frente a la versión oQ4e en el mismo hardware, aislando el efecto de la cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card se limita a documentar el desglose de cuantización y no incluye evaluaciones de MMLU, HumanEval, GSM8K ni métricas multimodales. La búsqueda web asociada a este repositorio no devolvió resultados técnicos relacionados con el modelo.

## Requisitos de hardware

- Peso en disco y en memoria: 14,718 GiB de pesos (15,803 GB de repositorio); la memoria necesaria para inferencia es superior, ya que hay que sumar caché KV, buffers de activación y el grafo de cómputo.
- Memoria unificada recomendada: 24 GB como mínimo ajustado; 32 GB para contexto moderado; 48-64 GB para contextos largos o ejecución concurrente.
- Hardware objetivo: Apple Silicon exclusivamente. El formato es MLX, por lo que requiere chips M1/M2/M3/M4 (con preferencia por variantes Pro, Max o Ultra). En un Mac con 16 GB de memoria unificada no es aconsejable.
- GPU NVIDIA: no soportadas de forma nativa por este checkpoint. Para usar CUDA sería necesario reconvertir los pesos a GGUF o a safetensors estándar y recurrir a llama.cpp, vLLM o TGI, lo que implica descargar el modelo base en BF16 (aproximadamente 51,6 GB estimados a 2 bytes por parámetro) y volver a cuantizar.
- Opciones de despliegue: mlx / mlx-lm y el runtime oMLX en Apple Silicon; conversión a GGUF para llama.cpp u Ollama si se necesita portabilidad; vLLM o TGI solo tras reconversión desde el modelo base.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wicked-Tutu-26B-A4B-oQ4e (este) | 25,806B | No disponible | Mixta 4/5/6/8 bits + BF16, 4,899 bits/peso | No disponible | MLX, 15,8 GB |
| ReadyArt/Wicked-Tutu-26B-A4B (base) | 25,806B | No disponible | BF16 (aprox. 51,6 GB estimados) | No disponible | Safetensors |
| Otras cuantizaciones del mismo base (GGUF, AWQ, GPTQ) | 25,806B | No disponible | No disponible | No disponible | No disponibles en la información consultada |
| Gemma 4 26B A4B (referencia de familia) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificables de otros modelos comparables de la misma categoría (MoE multimodal de ~26B en formato MLX) en la información proporcionada, por lo que la comparativa se limita al modelo base y a la referencia nominal de familia.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no indica licencia. Si el modelo base deriva de Gemma, es probable que hereden los términos de uso de Google, pero esto debe verificarse antes de cualquier uso comercial.
- Trazabilidad limitada: el autor no documenta el proceso de entrenamiento del modelo base, ni los datos, ni los idiomas, ni el pipeline. No hay garantías sobre el origen de los pesos más allá del enlace al modelo base.
- Sin validación empírica: cero descargas y cero likes; no hay evidencia pública de que el checkpoint funcione correctamente tras la cuantización.
- Riesgo de degradación por cuantización: aunque el 6,8 % de los pesos se conserva a 8 bits o BF16, el 93,4 % está a 4 bits, lo que puede afectar a tareas sensibles como matemáticas o razonamiento de varios pasos. No hay evaluación que lo mida.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no cuantificado para este checkpoint.
- Sesgos: no documentados. Al no conocerse la composición del dataset de entrenamiento, no es posible evaluar sesgos de género, idioma o dominio.
- Idiomas: no declarados; el comportamiento multilingüe es desconocido y probablemente dependa del modelo base.
- Dependencia de plataforma: el formato MLX limita el uso a Apple Silicon; no es directamente ejecutable en CUDA ni en CPU x86 sin reconversión.
- Fecha de publicación atípica: el repositorio figura creado el 2026-10-20, dato que conviene contrastar con la fuente original.
- No apto para producción sin verificación previa: al no haber benchmarks, licencia ni garantías del autor, cualquier despliegue debería ir precedido de una evaluación propia sobre el modelo base en BF16.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jancirnodziewiaty/Wicked-Tutu-26B-A4B-oQ4e
- Modelo base: https://huggingface.co/ReadyArt/Wicked-Tutu-26B-A4B
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
