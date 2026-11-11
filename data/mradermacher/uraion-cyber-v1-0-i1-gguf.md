# mradermacher/Uraion-Cyber-V1.0-i1-GGUF

## Resumen

Uraion-Cyber-V1.0-i1-GGUF es una colección de cuantizaciones en formato GGUF del modelo Uraion-Cyber-V1.0, publicada por el usuario mradermacher, conocido en el ecosistema por generar versiones cuantizadas de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo base lo desarrolla UraionLabs, y esta ficha se centra en los artefactos GGUF distribuidos en el repositorio.

El modelo original cuenta con 96.047.470 parámetros según los datos de safetensors, lo que lo sitúa en la categoría de modelos pequeños (por debajo de los 100 millones de parámetros). El repositorio GGUF ocupa aproximadamente 0,4 GB, coherente con un modelo de ese tamaño cuantizado en múltiples variantes.

La relevancia de esta publicación radica en que ofrece un abanico amplio de cuantizaciones (desde IQ1_S hasta Q6_K) generadas con imatrix, lo que permite ejecutar el modelo en hardware muy limitado, incluidas CPU y GPUs de gama baja. No obstante, la información pública disponible sobre el modelo base es muy escasa: no se detallan arquitectura, datos de entrenamiento, licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 96.047.470 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ1_M, IQ1_S, IQ2_M, IQ2_S, IQ2_XS, IQ2_XXS, IQ3_M, IQ3_S, IQ3_XS, IQ3_XXS, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base se distribuye presumiblemente en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Uraion-Cyber-V1.0 en la documentación proporcionada. El nombre sugiere un enfoque orientado a ciberseguridad ("Cyber"), pero no hay datos que confirmen la composición del dataset, el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado.

Lo que sí se documenta en la model card es el proceso de cuantización: las versiones GGUF se han generado con cuantización ponderada mediante imatrix (importance matrix), una técnica que mejora la fidelidad de las cuantizaciones de baja precisión al calcular la importancia de cada peso a partir de datos de calibración. El repositorio incluye variantes desde 1 bit efectivo (IQ1_S) hasta 6 bits (Q6_K), lo que ofrece un control fino del compromiso entre tamaño y calidad.

## Capacidades

- Generación de texto: el modelo es un modelo de lenguaje de 96 millones de parámetros, por lo que sus capacidades generativas son las propias de un modelo de ese tamaño, sin datos públicos que las detallen.
- Razonamiento y código: no disponible; no se documenta soporte específico.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se especifican idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Ejecución local: al estar en formato GGUF, es compatible con llama.cpp y derivados (Ollama, LM Studio, etc.), lo que constituye su principal valor práctico.

## Casos de uso

- Experimentación educativa en entornos con recursos limitados: con menos de 100 millones de parámetros y cuantizaciones desde ~0,1 GB, el modelo puede ejecutarse en Raspberry Pi, portátiles antiguos o contenedores sin GPU para estudiar el comportamiento de modelos pequeños.
- Pruebas de pipelines de inferencia GGUF: sirve como modelo de juguete para validar integraciones con llama.cpp, Ollama o servidores compatibles antes de desplegar modelos mayores.
- Prototipado de aplicaciones de ciberseguridad: dado el nombre del modelo base, puede emplearse como banco de pruebas para tareas de clasificación o generación de texto relacionadas con seguridad, siempre que se valide su calidad empíricamente.
- Evaluación de técnicas de cuantización: la disponibilidad de 24 variantes permite comparar el impacto de IQ1 a Q6_K en la perplejidad y la calidad de salida sobre el mismo modelo base.
- Generación de texto offline en dispositivos embebidos: su reducido tamaño facilita despliegues en entornos sin conectividad ni aceleradores hardware.
- Filtrado y etiquetado ligero de texto: para tareas simples de clasificación o extracción, un modelo de este tamaño puede ofrecer latencias muy bajas en CPU, aunque la calidad debe medirse antes de usarlo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,1-0,2 GB para cuantizaciones IQ1/Q2, y aproximadamente 0,3-0,4 GB para Q6_K, considerando los 96 millones de parámetros.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; también funciona en CPU sin aceleración.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna (GTX 1050, RTX 3050, RTX 4090, etc.) e incluso en iGPUs.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles; por el tamaño, se espera una latencia muy baja en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Uraion-Cyber-V1.0-i1-GGUF | 96 M | no disponible | no disponible | GGUF |
| SmolLM2-135M | 135 M | 8.192 tokens | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-0.5B | 494 M | 32.768 tokens | Apache 2.0 | safetensors, GGUF |
| TinyLlama-1.1B | 1,1 B | 2.048 tokens | Apache 2.0 | safetensors, GGUF |

La comparativa se ofrece como referencia de categoría (modelos pequeños ejecutables en local); no se dispone de datos de rendimiento del modelo Uraion que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Información pública muy escasa: no se documentan arquitectura, datos de entrenamiento, licencia ni idiomas, lo que impide evaluar su idoneidad para producción.
- Licencia no disponible: no puede confirmarse si se permite uso comercial; debe consultarse el repositorio del modelo base (UraionLabs/Uraion-Cyber-V1.0) antes de cualquier despliegue.
- Riesgo de alucinación: con 96 millones de parámetros, la coherencia y fiabilidad factual son limitadas en comparación con modelos de mayor tamaño.
- Capacidad de contexto e idioma desconocidas: no hay garantías sobre el soporte multilingüe ni sobre la ventana de contexto efectiva.
- Origen de la cuantización: al ser una publicación de terceros (mradermacher) sobre el modelo de UraionLabs, conviene verificar la integridad de los artefactos y la correspondencia con el modelo original.
- Sin métricas de calidad: no hay benchmarks que permitan comparar las distintas cuantizaciones ni validar su fidelidad respecto al modelo en precisión completa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Uraion-Cyber-V1.0-i1-GGUF
- Modelo base: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
