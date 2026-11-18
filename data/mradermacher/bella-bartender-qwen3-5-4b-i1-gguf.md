# mradermacher/bella-bartender-qwen3.5-4b-i1-GGUF

## Resumen

`mradermacher/bella-bartender-qwen3.5-4b-i1-GGUF` es una publicación de cuantizaciones GGUF generadas por mradermacher a partir del modelo base `juiceb0xc0de/bella-bartender-qwen3.5-4b`. No se trata de un modelo entrenado desde cero, sino de un artefacto de distribución: el repositorio contiene ficheros en formato GGUF pensados para su uso con llama.cpp y herramientas compatibles, además de un fichero imatrix empleado para generar cuantizaciones con matrices de importancia. El autor del modelo original no está documentado en la información disponible más allá del identificador de usuario de Hugging Face.

El nombre sugiere un modelo derivado de la familia Qwen 3.5 con aproximadamente 4.000 millones de parámetros, pero esta inferencia procede únicamente del nombre del repositorio y no está confirmada por la model card. La model card del cuantizador es una plantilla genérica de mradermacher que no aporta detalles sobre arquitectura, entrenamiento ni evaluación del modelo base. El dato de parámetros totales reportado por Hugging Face (1.797.272) corresponde a los tensores del repositorio de cuantización y no al modelo completo, por lo que no debe interpretarse como el tamaño real del modelo.

La relevancia de esta ficha es limitada y fundamentalmente práctica: sirve para localizar una versión cuantizada ejecutable en hardware de consumo de un modelo del que apenas hay información pública verificable. Cualquier evaluación de calidad, licencia o idoneidad para producción requiere consultar el repositorio del modelo base, que en el momento de redactar esta ficha no aporta datos en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere familia Qwen 3.5, sin confirmar) |
| Parametros totales | no disponible (el nombre sugiere ~4B; el dato de 1.797.272 del repo corresponde a los tensores de la cuantizacion, no al modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ3_L, IQ4_XS, IQ4_NL (small), Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (cuantizaciones ponderadas con imatrix) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF (mas fichero imatrix en formato GGUF para generar cuantizaciones propias) |

## Arquitectura y entrenamiento

No hay información disponible sobre la arquitectura del modelo base en la documentación proporcionada. La model card del repositorio de cuantización es la plantilla estándar de mradermacher y no describe el transformer subyacente, el esquema de atención, la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron técnicas de alineación como RLHF, DPO o similares. El nombre del repositorio incluye "qwen3.5", lo que apunta a una arquitectura de la familia Qwen, pero no se confirma en ningún campo estructurado.

El único detalle técnico verificable es el proceso de cuantización: mradermacher ha generado cuantizaciones "weighted/imatrix" a partir del modelo base, empleando un fichero imatrix (`bella-bartender-qwen3.5-4b.imatrix.gguf`, 0,1 GB) para ponderar la importancia de los tensores durante la cuantización. La model card indica además que se trata de un modelo de visión y que los ficheros `mmproj` (proyector multimodal), si existen, se encuentran en el repositorio estático hermano `mradermacher/bella-bartender-qwen3.5-4b-GGUF`. No se documenta ninguna innovación arquitectónica adicional.

## Capacidades

- Generación de texto en inglés, según el campo `language: en` del repositorio.
- Procesamiento de imágenes: la model card del cuantizador califica explícitamente el modelo como "vision model" y remite a los ficheros `mmproj` del repositorio estático, aunque no se detalla el tipo de tareas visuales soportadas.
- Inferencia local mediante llama.cpp y ecosistema GGUF (Ollama, LM Studio, koboldcpp y similares), gracias al formato de pesos publicado.
- Creación de cuantizaciones propias a partir del fichero imatrix incluido.
- Soporte de tool calling, function calling, agentes, modo thinking, audio y capacidades multilingües adicionales: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en hardware de consumo: las cuantizaciones de baja precisión (Q2_K, IQ2_XXS, IQ3_S) permiten ejecutar un modelo de aproximadamente 4B parámetros en GPUs con 4-8 GB de VRAM o incluso en CPU, lo que facilita pruebas locales sin infraestructura dedicada.
- Prototipado de aplicaciones de visión: si el modelo base confirma sus capacidades multimodales mediante los ficheros `mmproj`, podría emplearse para experimentar con descripción de imágenes o extracción de información visual en entornos con recursos limitados.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece más de veinte variantes de cuantización, lo que permite medir el impacto de la precisión en la perplejidad y la calidad de salida sobre un mismo modelo base.
- Integración en pipelines de llama.cpp: al ser GGUF compatible con `llama-server`, puede exponerse como API compatible con OpenAI para pruebas de integración en aplicaciones existentes.
- Experimentación con modelos derivados o fine-tunes: útil para investigadores que quieran evaluar un fine-tune concreto (bella-bartender) sin necesidad de convertirlo a GGUF por su cuenta.
- Generación de cuantizaciones personalizadas: el fichero imatrix incluido permite a otros usuarios producir sus propias variantes con parámetros de cuantización ajustados a su hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa basada en el tamaño nominal de ~4B parámetros, las cuantizaciones Q4_K_M ocuparían del orden de 2,5-3 GB y las Q8 rondarían 4-4,5 GB, aunque estas cifras no están confirmadas por el autor.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU consumer con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070) debería poder alojar las cuantizaciones de 4 bits; las variantes IQ2/IQ3 podrían caber en GPUs de 4 GB.
- Cabe en GPU consumer: previsiblemente sí, en la mayoría de modelos con 4 GB o más de VRAM, aunque no hay confirmación oficial.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime que soporte GGUF. El repositorio declara compatibilidad con `endpoints_compatible` y la librería `transformers` para el modelo base.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones verificables del modelo base, por lo que no es posible establecer una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el modelo base: no se conocen arquitectura, datos de entrenamiento, licencia ni evaluación, lo que impide valorar su idoneidad para producción.
- Licencia no disponible: no puede confirmarse si el uso comercial está permitido; debe consultarse el repositorio `juiceb0xc0de/bella-bartender-qwen3.5-4b` antes de cualquier despliegue.
- Riesgo elevado de alucinación y sesgos: sin información sobre alineación ni dataset, no hay garantías sobre el comportamiento del modelo.
- Idiomas: el repositorio declara únicamente inglés; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Las cuantizaciones de muy baja precisión (IQ1, IQ2) degradan la calidad de forma notable; deben reservarse para pruebas, no para uso final.
- El dato de parámetros del repositorio (1.797.272) no refleja el tamaño del modelo y puede inducir a error si se interpreta literalmente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso o validación por parte de la comunidad.
- La fecha de creación indicada (2026-11-17) es posterior a la fecha habitual de publicación de modelos Qwen 3.5; conviene verificar la autenticidad y procedencia del modelo base.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/bella-bartender-qwen3.5-4b-i1-GGUF
- Repositorio de cuantizaciones estáticas (incluye posibles ficheros mmproj): https://huggingface.co/mradermacher/bella-bartender-qwen3.5-4b-GGUF
- Modelo base: https://huggingface.co/juiceb0xc0de/bella-bartender-qwen3.5-4b
- Página de descargas del cuantizador: https://hf.tst.eu/model#bella-bartender-qwen3.5-4b-i1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
