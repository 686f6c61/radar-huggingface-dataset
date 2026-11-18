# oscarwest1/gemma-4-26B-A4B-it-Q6_K-GGUF

## Resumen

Gemma 4 26B-A4B-it es un modelo de lenguaje de arquitectura Mixture of Experts (MoE) desarrollado por Google DeepMind, publicado bajo licencia Apache 2.0. El repositorio analizado es una conversión no oficial a formato GGUF con cuantización Q6_K, realizada por el usuario oscarwest1 a partir de los pesos originales en BF16. El modelo combina aproximadamente 26.000 millones de parámetros totales con unos 4.000 millones de parámetros activos por token, lo que lo sitúa en la categoría de MoE disperso orientado a inferencia eficiente.

La relevancia de esta conversión radica en que permite ejecutar un modelo MoE de gran tamaño en hardware de consumo mediante llama.cpp, manteniendo una calidad cercana al original gracias a la cuantización Q6_K (6 bits por peso). El repositorio ocupa 22,6 GB y está pensado para despliegues locales con `llama-cli` o integraciones compatibles con endpoints.

El modelo base está ajustado por instrucciones (instruction-tuned) y etiquetado como multilingüe, orientado a generación de texto conversacional. No se ha realizado entrenamiento adicional ni fine-tuning durante la conversión; se trata únicamente de una transformación de formato y precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 MoE (Mixture of Experts, transformer disperso) |
| Parametros totales | 25.233.142.046 (aprox. 26B) |
| Parametros activos | Aproximadamente 4B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q6_K (esta conversión); el modelo base en BF16 |
| Idiomas soportados | no disponible (etiquetado como multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (origen en safetensors BF16) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura Mixture of Experts dentro de la familia Gemma 4, con aproximadamente 26B de parámetros totales y unos 4B activos por token. Esta dispersión permite que, pese al tamaño total, el coste computacional por token se acerque al de un modelo denso de ~4B, lo que reduce la latencia y el ancho de banda de memoria necesarios durante la inferencia.

La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO. El modelo está ajustado por instrucciones (instruction-tuned) según los metadatos. La conversión a GGUF se realizó con llama.cpp: primero se transformaron los pesos BF16 safetensors a GGUF BF16 y posteriormente se cuantizaron a Q6_K, sin entrenamiento ni fine-tuning adicional.

## Capacidades

- Generación de texto conversacional en modo instrucciones (chat).
- Soporte multilingüe según los metadatos del modelo base (idiomas concretos no especificados).
- Razonamiento y generación de texto general derivados del ajuste por instrucciones del modelo base.
- Ejecución local mediante llama.cpp con soporte para Gemma 4.
- Compatibilidad declarada con endpoints (tag `endpoints_compatible`).
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Asistente conversacional local: el modelo puede gestionar diálogos multi-turno mediante `llama-cli -cnv`, adecuado para prototipos y entornos sin conexión donde no se desea enviar datos a la nube.
- Inferencia en hardware de consumo: gracias a la cuantización Q6_K y a los ~4B parámetros activos, es viable ejecutarlo en equipos con GPU de gama alta o incluso en CPU con suficiente RAM, algo inviable con el modelo completo en BF16.
- Experimentación e investigación: sirve para estudiar el comportamiento de arquitecturas MoE en formato GGUF y comparar la degradación de calidad entre Q6_K y BF16.
- Generación de texto en pipelines de CI/CD o scripts: al ser compatible con endpoints y llama.cpp, puede integrarse en flujos automatizados de generación de contenido o resumen.
- Despliegue de bajo coste en servidores modestos: el reparto entre parámetros totales y activos reduce los requisitos frente a un modelo denso de 26B.
- Evaluación comparativa de cuantizaciones: útil para medir el impacto de Q6_K en tareas de razonamiento y generación frente al original.
- Uso educativo: permite demostrar el funcionamiento de un MoE cuantizado en talleres y cursos de IA open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero Q6_K ocupa aproximadamente 22,6 GB, por lo que se necesita al menos esa cantidad de memoria (GPU o RAM) para cargarlo, más overhead del contexto.
- GPU recomendadas: A100 40GB, H100, RTX 4090 (24 GB, ajustada), RTX 3090 (24 GB, ajustada). En GPUs de 24 GB el modelo cabe con margen limitado para contexto.
- GPU de consumo: viable en RTX 4090/3090 (24 GB); en GPUs de 16 GB requeriría offloading parcial a RAM o cuantizaciones menores (no incluidas en este repo).
- CPU: ejecutable en CPU con al menos ~24-32 GB de RAM, con throughput notablemente inferior.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), y por compatibilidad GGUF también Ollama o interfaces basadas en llama.cpp. vLLM y TGI no soportan GGUF de forma nativa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma 4 26B-A4B-it (Q6_K, este repo) | ~26B | ~4B | no disponible | Apache 2.0 | GGUF Q6_K |
| Gemma 4 26B-A4B-it (original BF16) | ~26B | ~4B | no disponible | Apache 2.0 | safetensors BF16 |
| Alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de modelos comparables concretos en la información proporcionada.

## Limitaciones y advertencias

- Conversión no oficial: no está afiliada ni respaldada por Google; la calidad depende de la conversión de terceros.
- Sin datos de benchmarks: no hay evidencia publicada en este repositorio sobre la degradación de calidad respecto al BF16 original.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se documentan mitigaciones específicas.
- Sesgos: no documentados en la información disponible; se heredan los del modelo base.
- Idiomas: aunque se etiqueta como multilingüe, no se especifican los idiomas soportados ni su calidad.
- Contexto: la longitud de contexto no está indicada; debe consultarse la model card del modelo base.
- Licencia: Apache 2.0 permite uso comercial, pero deben preservarse los avisos de atribución a Google DeepMind.
- Formato GGUF: requiere versiones recientes de llama.cpp con soporte para Gemma 4; versiones antiguas pueden no cargarlo.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/oscarwest1/gemma-4-26B-A4B-it-Q6_K-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
