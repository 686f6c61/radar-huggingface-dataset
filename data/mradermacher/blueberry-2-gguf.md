# mradermacher/BlueBerry-2-GGUF

## Resumen

BlueBerry-2 es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por el usuario artindnr, publicado originalmente en Hugging Face bajo licencia Apache 2.0. La versión aquí descrita es la cuantización GGUF estática realizada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y entornos compatibles con GGUF. Con aproximadamente 116.800 millones de parámetros totales, se posiciona en la categoría de modelos grandes con activación dispersa, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamaño.

El modelo está orientado a generación de texto conversacional y declara soporte para inglés y persa (fa), lo que lo hace relevante para aplicaciones multilingües en esos dos idiomas. Su arquitectura MoE con cuantización MXFP4 en los pesos originales sugiere un diseño pensado para eficiencia en inferencia, aunque la información pública disponible sobre su entrenamiento, contexto y rendimiento es muy limitada.

La relevancia actual de esta ficha radica en que la cuantización GGUF de mradermacher facilita el despliegue local de un modelo de gran tamaño que, de otro modo, requeriría infraestructura de datacenter. No obstante, el repositorio GGUF ocupa 943 GB y los archivos individuales van desde 66 GB hasta más de 124 GB, lo que exige planificación cuidadosa del hardware.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE), transformer |
| Parámetros totales | 116.829.156.672 (~116,8 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas) |
| Idiomas soportados | persa (fa), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); pesos originales en safetensors según el modelo base |

## Arquitectura y entrenamiento

La información disponible confirma que BlueBerry-2 emplea una arquitectura de mezcla de expertos (MoE) con pesos originales cuantizados en MXFP4, según las etiquetas del repositorio. El modelo base es artindnr/BlueBerry-2, del que no se han publicado en la información proporcionada detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se especifica el número de expertos, el mecanismo de enrutamiento ni la dimensión de las capas.

La cuantización realizada por mradermacher es de tipo estático (quantize_version 2, output_tensor_quantised 1), sin versiones ponderadas/imatrix disponibles en el momento de la publicación. Los archivos Q6_K y Q8_0 se distribuyen en tres partes debido a su tamaño. No se dispone de información sobre innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés y persa.
- Razonamiento y respuesta multi-turno (etiqueta "conversational" en el repositorio).
- Ejecución local mediante llama.cpp y herramientas compatibles con GGUF.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- Soporte declarado para frameworks PyTorch, JAX y TensorFlow en el modelo base.
- No se ha documentado soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Asistente conversacional en persa e inglés: el modelo puede gestionar diálogos multi-turno en ambos idiomas, adecuado para atención al usuario en regiones donde el persa es vehicular, desplegado localmente con llama.cpp.
- Generación de contenido editorial bilingüe: redacción y revisión de textos en inglés y persa en entornos con requisitos de privacidad, al ejecutarse en infraestructura propia sin depender de APIs externas.
- Prototipado de investigación en MoE: al ser un modelo MoE de gran tamaño con cuantizaciones GGUF, sirve para estudiar el comportamiento de expertos y el rendimiento de cuantizaciones agresivas (Q2_K, Q3_K) en tareas de generación.
- Despliegue en estaciones de trabajo con múltiples GPU: los archivos Q4_K_M (88 GB) permiten ejecutar el modelo en configuraciones de 2-4 GPU de gama alta, útil para equipos que no disponen de clústeres dedicados.
- Traducción y adaptación de contenido entre inglés y persa: aunque no se documenta calidad de traducción, el soporte bilingüe declarado permite usarlo como base para pipelines de localización con revisión humana.
- Evaluación comparativa de cuantizaciones: la disponibilidad de 11 variantes GGUF permite a investigadores medir la degradación de calidad entre Q2_K y Q8_0 en tareas concretas, usando el gráfico de perplejidad referenciado en la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del archivo GGUF más el overhead de contexto. Q2_K/Q3_K_S rondan 66 GB; Q4_K_M, 88 GB; Q5_K_M, 94 GB; Q6_K y Q8_0, 124 GB en tres partes.
- GPU recomendadas: para Q4_K_M se necesitan al menos 2 GPU con 48 GB (A6000, A100 40GB en par) o una H100 80GB con margen ajustado; para Q8_0 se requieren 2×H100 80GB o 4×A100 40GB.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en una RTX 3090 (24 GB) en ninguna cuantización disponible; el mínimo Q2_K (66 GB) excede la VRAM de cualquier GPU de consumo individual.
- Opciones de despliegue: llama.cpp, Ollama (si se convierte/importa el GGUF), y servidores compatibles con GGUF; el modelo base admite transformers con PyTorch/JAX/TF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| BlueBerry-2 (este) | ~116,8 B (MoE) | no disponible | Apache 2.0 | GGUF, safetensors | Hugging Face |
| Alternativas de ~100 B MoE | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente en la documentación proporcionada para establecer una comparativa rigurosa con modelos alternativos de la misma categoría. Se indica "no disponible" para evitar datos no verificados.

## Limitaciones y advertencias

- Información pública muy escasa: no se documentan datos de entrenamiento, contexto, número de expertos ni benchmarks, lo que dificulta evaluar su calidad antes de desplegarlo.
- Riesgo de alucinación no cuantificado: al no haber evaluaciones publicadas, no puede estimarse la tasa de errores factuales.
- Cobertura lingüística limitada a inglés y persa; no se declara soporte de castellano ni de otros idiomas.
- Tamaño prohibitivo para hardware de consumo: ninguna cuantización cabe en una GPU de 24 GB, lo que restringe su uso a infraestructura profesional.
- Cuantizaciones agresivas (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; la model card advierte que Q3_K_M es de "lower quality".
- No hay cuantizaciones ponderadas/imatrix disponibles, que suelen ofrecer mejor relación calidad/tamaño.
- Licencia Apache 2.0 permite uso comercial, pero al no conocerse la procedencia de los datos de entrenamiento del modelo base, persisten riesgos legales no evaluados.
- El repositorio GGUF ocupa 943 GB, lo que exige almacenamiento considerable incluso para descargar una sola variante.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/BlueBerry-2-GGUF
- Modelo base: https://huggingface.co/artindnr/BlueBerry-2
- Página de descargas del cuantizador: https://hf.tst.eu/model#BlueBerry-2-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad por cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
