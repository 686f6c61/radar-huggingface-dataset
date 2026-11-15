# imikeliu/ScarletKc-2.0-Q6_K-GGUF

## Resumen

ScarletKc-2.0-Q6_K-GGUF es la cuantización en formato GGUF de tipo Q6_K del modelo ScarletKc-2.0, un modelo multimodal de tipo image-text-to-text desarrollado por el usuario ScarletKc y convertido a GGUF por imikeliu mediante el espacio GGUF-my-repo de ggml.ai. El modelo cuenta con 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) en pesos safetensors y está etiquetado por el autor con las familias qwen3_5 y qwen3.8, lo que sugiere una arquitectura derivada de la familia Qwen con capacidades de visión, razonamiento, tool-use y un componente MTP (multi-token prediction).

La relevancia de esta ficha radica en que se trata de un artefacto de cuantización listo para su uso con llama.cpp, lo que permite desplegar un modelo multimodal de ~27B en hardware de consumo con pérdida de precisión controlada (Q6_K es una de las cuantizaciones de mayor fidelidad dentro de la familia K-quants). El repositorio ocupa 22,4 GB y la licencia declarada es Apache 2.0, lo que facilita su adopción comercial.

No obstante, la información pública disponible es muy limitada: la model card del repositorio GGUF es la plantilla automática generada por GGUF-my-repo y remite a la model card original, de la que no se dispone en esta búsqueda. Por tanto, numerosos datos técnicos (contexto nativo, composición del dataset, resultados de benchmarks) se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de la familia Qwen (tags qwen3_5 / qwen3.8); detalles exactos no disponibles |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (los ejemplos de la model card usan -c 2048, pero no es la longitud nativa) |
| Tipos de cuantizacion | Q6_K (este repositorio); el repo base puede ofrecer otras, no confirmado |
| Idiomas soportados | chino (zh), ingles (en), japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo); safetensors en el modelo base |
| Tamano del repositorio | 22,4 GB |
| Pipeline | image-text-to-text |
| Libreria | transformers (metadato), llama.cpp para inferencia |
| Modelo base | ScarletKc/ScarletKc-2.0 (finetune) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de las etiquetas del autor: se trata de un transformer multimodal con entrada de imagen y texto (pipeline image-text-to-text), con soporte declarado de razonamiento (reasoning), uso de herramientas (tool-use) y un componente MTP (multi-token prediction). Las etiquetas qwen3_5 y qwen3.8 apuntan a que el modelo base deriva de la familia Qwen, pero no se especifica la variante exacta ni la configuración de capas, atención o cabezas.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de alineación como RLHF, DPO o SFT. Tampoco se documentan innovaciones técnicas concretas (atención lineal, decodificación especulativa, etc.) más allá de la mención genérica a MTP. Esta cuantización Q6_K se generó con llama.cpp mediante GGUF-my-repo, un proceso automático de conversión que no altera la arquitectura sino la precisión numérica de los pesos.

## Capacidades

- Generación de texto y razonamiento: el autor etiqueta el modelo con "reasoning", lo que indica soporte de cadenas de razonamiento explícitas, aunque no se detalla el mecanismo.
- Comprensión de imágenes: pipeline image-text-to-text, admite entradas de imagen junto con texto.
- Tool calling / function calling: etiqueta "tool-use" presente en el modelo.
- Predicción multi-token (MTP): etiqueta "mtp", potencialmente orientada a acelerar la decodificación.
- Multilingüe: soporte declarado de chino, inglés y japonés.
- Compatibilidad con endpoints: etiqueta "endpoints_compatible".
- Integración con llama.cpp: CLI y servidor listos para usar con el fichero GGUF.

## Casos de uso

- Asistente multimodal local en estación de trabajo: con 22,4 GB en Q6_K, el modelo puede ejecutarse en una GPU con 24 GB de VRAM (por ejemplo, RTX 4090) o en un Mac con memoria unificada suficiente, ofreciendo respuestas sobre imágenes y texto sin depender de la nube.
- Análisis de documentación técnica con imágenes: extracción de información de diagramas, capturas de pantalla o figuras acompañadas de preguntas en inglés o chino, aprovechando la entrada image-text-to-text.
- Automatización de soporte en mercados asiáticos: atención al cliente multi-turno en chino, inglés y japonés, con la ventaja de cubrir tres idiomas en un único modelo.
- Agentes con uso de herramientas: integración en pipelines donde el modelo invoca funciones externas (APIs, calculadoras, bases de datos) gracias a la etiqueta tool-use, con el servidor llama-server como backend.
- Prototipado e investigación en razonamiento: evaluación de cadenas de razonamiento y de MTP en entornos controlados, al ser un finetune sobre base Qwen con licencia Apache 2.0.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente con llama.cpp, los datos de imagen y texto no salen del perímetro de la organización, adecuado para sectores regulados.
- Conversión y experimentación con cuantizaciones: servir como referencia Q6_K para comparar calidad frente a cuantizaciones menores (Q4_K_M, Q5_K_M) del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q6_K ocupa aproximadamente 22,4 GB, por lo que se necesitan al menos ~24 GB de VRAM o memoria unificada para cargarlo completo; con offloading parcial a CPU puede ejecutarse en GPUs de 12-16 GB a costa de latencia.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para carga completa; A100 40/80 GB y H100 para despliegues de servidor con mayor concurrencia; GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) solo con offloading parcial.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) y en Apple Silicon con memoria unificada de 32 GB o más.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), y por compatibilidad de formato GGUF, herramientas derivadas como Ollama o LM Studio; vLLM y TGI requerirían los pesos safetensors del modelo base, no este GGUF.
- Latencia y throughput: no disponibles; dependen del hardware, de la longitud de contexto configurada y del número de tokens generados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ScarletKc-2.0 (Q6_K GGUF) | ~27,3 B | no disponible | Apache 2.0 | GGUF | Multimodal, zh/en/ja, tool-use, MTP |
| Modelo base ScarletKc-2.0 | ~27,3 B | no disponible | Apache 2.0 | safetensors | Referencia sin cuantizar |
| Alternativas de ~27B multimodales de la familia Qwen | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en esta busqueda |

No se dispone de información suficiente para establecer una comparativa cuantitativa con modelos de la misma categoría.

## Limitaciones y advertencias

- Información pública muy escasa: la model card del repositorio GGUF es la plantilla automática de GGUF-my-repo; no hay datos sobre dataset, alineación ni evaluación, lo que dificulta valorar su calidad real.
- Riesgo de alucinación: como todo modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en tareas de razonamiento o descripción de imágenes ambiguas; no se documentan mitigaciones.
- Sesgos: no se documentan sesgos conocidos ni procesos de evaluación de sesgo; al entrenarse presumiblemente con datos multilingües (zh/en/ja), pueden aparecer sesgos culturales y lingüísticos propios de esas fuentes.
- Cobertura idiomática limitada: solo se declaran chino, inglés y japonés; el rendimiento en castellano no está garantizado ni evaluado.
- Contexto no especificado: se desconoce la ventana nativa; los ejemplos de la model card usan -c 2048, que no debe interpretarse como el máximo del modelo.
- Cuantización Q6_K: introduce una pérdida de precisión respecto a los pesos originales; para tareas sensibles a la fidelidad numérica conviene validar contra el modelo base en safetensors.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda verificar la licencia del modelo base original y de los datos de entrenamiento, no documentados aquí.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/imikeliu/ScarletKc-2.0-Q6_K-GGUF
- Modelo base: https://huggingface.co/ScarletKc/ScarletKc-2.0
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Instrucciones de uso de llama.cpp: https://github.com/ggerganov/llama.cpp?tab=readme-ov-file#usage
