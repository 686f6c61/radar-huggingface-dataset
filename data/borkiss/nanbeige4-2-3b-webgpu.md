# borkiss/Nanbeige4.2-3B-WebGPU

## Resumen

Nanbeige4.2-3B-WebGPU es un port independiente al navegador del modelo Nanbeige4.2-3B, desarrollado por el usuario borkiss. No es un lanzamiento oficial de Nanbeige, sino un conjunto de artefactos WGSL personalizados que permiten ejecutar el modelo original directamente en un navegador compatible con WebGPU, sin necesidad de servidor. El modelo base, Nanbeige4.2-3B, es un modelo compacto de 3B parámetros no-embedding desarrollado por Nanbeige, preentrenado desde cero en 28T tokens con una arquitectura Looped Transformer que reutiliza la pila de capas.

El port está diseñado para ejecutar inferencia de texto de forma local, con cuantización Q4 y perfiles de embedding Q4 o Q8. El contexto del navegador se limita a 2048 tokens (512 por defecto) por restricciones de memoria, aunque el modelo fuente podría tener un contexto mayor. Su relevancia radica en permitir el uso de un modelo agéntico de 3B en el cliente, con privacidad total al no enviar prompts a ningún servidor de inferencia. La evaluación incluida es un screening limitado de cuantización, no un benchmark completo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped Transformer (reutiliza la pila de capas) |
| Parametros totales | 3B no-embedding (parámetros totales completos no especificados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens en el port WebGPU (límite de despliegue; contexto del modelo fuente no especificado) |
| Tipos de cuantizacion | Q4 con grupos de 32 y escalas FP16; perfiles con embedding Q4 o Q8 (q4g32-e4-gram8192-emse-packed, q4g32-e8-gram8192-packed, q4g32-e8-packed) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache-2.0 (modelo fuente y port) |
| Formato de pesos | Artefactos WGSL personalizados, bundles empaquetados y archivos individuales; no cargable directamente por AutoModel |

## Arquitectura y entrenamiento

El modelo original Nanbeige4.2-3B utiliza una arquitectura Looped Transformer que reutiliza la pila de capas, lo que permite obtener capacidades agénticas en un modelo compacto. Fue preentrenado desde cero en 28T tokens y, según el informe técnico, ofrece un rendimiento competitivo en tareas de agente de código, agente de oficina, uso complejo de herramientas, matemáticas, codificación y ciencia. No se especifica en la información disponible si se aplicó RLHF o DPO.

El port WebGPU no implica un reentrenamiento; es una cuantización y compilación WGSL del modelo base. La cuantización utiliza Q4 con grupos de 32, escalas FP16 y nibbles byte-sliced. La calibración de las capas lineales se realizó con un objetivo de reconstrucción de covarianza de grupo sobre 8192 tokens de entrenamiento de WikiText-2, observando visitas recurrentes. Es un experimento de reconstrucción de grupo acotado, no GPTQ ni AWQ. El runtime comparte 22 bloques físicos en exactamente dos pasadas, con 44 slots KV independientes y una normalización RMS final. Preserva 48 cabezas de consulta, 8 cabezas KV y RoPE de 128 dimensiones. No se utiliza poda de capas ni recurrencia reducida.

## Capacidades

- Generación de texto en inglés y chino.
- Razonamiento en matemáticas, codificación y ciencia.
- Capacidades agénticas: agente de código, agente de oficina y uso complejo de herramientas.
- Soporte de tool calling / function calling, según el informe técnico.
- Soporte de agentes y razonamiento multi-step.
- Ejecución local en el navegador mediante WebGPU, sin servidor de inferencia.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Asistente de código privado en el navegador: el modelo se ejecuta localmente con WebGPU, por lo que los fragmentos de código no salen del dispositivo. Es adecuado para desarrolladores que trabajan con código propietario en entornos sin conexión a servidores de IA.
- Agente de oficina en el cliente: según el paper, el modelo tiene capacidades de agente de oficina; puede automatizar tareas como generar informes o manipular hojas de cálculo mediante tool calling, todo dentro del navegador.
- Automatización de llamadas a herramientas (tool calling): el modelo soporta uso complejo de herramientas, por lo que puede integrarse en aplicaciones web que necesiten encadenar llamadas a APIs externas, como un asistente de reservas o un panel de análisis.
- Tutoría de matemáticas y ciencias: gracias a su razonamiento competitivo en matemáticas y ciencia, puede usarse en aplicaciones educativas que expliquen problemas paso a paso, con la ventaja de funcionar sin conexión una vez descargados los pesos.
- Chat multilingüe en inglés y chino: para empresas con equipos bilingües, el modelo puede ejecutarse en un navegador y ofrecer asistencia en ambos idiomas sin enviar datos a un servidor.
- Prototipado rápido de agentes: los desarrolladores pueden crear demos interactivas de agentes con razonamiento multi-step directamente en el navegador, sin necesidad de infraestructura backend, lo que acelera el diseño de productos.
- Análisis de documentos con contexto limitado: con una ventana de 2048 tokens, puede procesar fragmentos de documentos, correos o logs para extraer información o resumir contenido, siempre que el texto quepa en el contexto.

## Benchmarks y rendimiento

La información proporcionada incluye una evaluación de screening de la cuantización, no un benchmark estándar. Los resultados son los siguientes:

| Model | Perplexity (WikiText-2 test) | Six-prompt mean KL vs source | First-token agreement |
|---|---|---:|---:|
| Source FP32 | 41.774 | 0 | 6/6 |
| Original Q4g32/Q8 embedding | 48.828 | .07496 | 6/6 |
| Calibrated Q4/Q8 embedding | 45.237 | .06777 | 6/6 |
| Compact calibrated Q4/Q4 embedding | 44.859 | .07180 | 6/6 |

Estas son mediciones de screening limitadas (4096 tokens de test, 16 ventanas de 256 tokens) utilizadas para seleccionar entre candidatos de cuantización. No constituyen un benchmark completo ni una afirmación de que la cuantización mejore el modelo fuente. El informe técnico del modelo original reporta rendimiento en tareas agénticas, pero no se incluyen cifras concretas de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: no se especifica una VRAM mínima oficial. Los bundles de pesos pesan entre 2,35 y 2,6 GB, por lo que se necesita al menos esa cantidad de memoria disponible en el dispositivo para los pesos, más los buffers de activación. La model card advierte que los límites de memoria del dispositivo pueden impedir cargar un modelo de clase 3B.
- GPU recomendadas: la cuantización se ejecutó en una NVIDIA RTX A6000. Para la ejecución en navegador se requiere WebGPU; probado en Apple M4 con Chrome y Safari de escritorio. No se han verificado otros dispositivos.
- ¿Cabe en consumer GPU?: sí, es un modelo de 3B cuantizado, por lo que debería caber en GPUs de consumo con suficiente VRAM, pero no hay verificación oficial.
- Opciones de despliegue: únicamente mediante el runtime WebGPU personalizado y la aplicación vinculada (Space). No es compatible con vLLM, llama.cpp, Ollama o TGI, ya que los artefactos no son cargables por AutoModel.
- Latencia y throughput: no se proporcionan datos de latencia ni throughput en la información disponible.

## Comparativa con modelos similares

No se dispone de comparativas directas con modelos similares en la información proporcionada. El modelo base Nanbeige4.2-3B es la referencia natural, pero no se han publicado resultados comparativos en los datos disponibles.

## Limitaciones y advertencias

- Sesgos: no se han documentado sesgos específicos en la información disponible.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas.
- Limitaciones de contexto e idioma: el contexto del navegador está limitado a 2048 tokens (512 por defecto), lo que no refleja necesariamente el contexto del modelo fuente. Solo soporta inglés y chino.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial con atribución. El runtime fuente incluye avisos MIT separados para kernels reutilizados. El port es independiente y no oficial.
- Advertencias para producción: el port no está verificado en todos los dispositivos (iPhone 15 Pro Max, Pixel 10a y iPad M2 sin verificar). La evaluación es de screening limitado, no un benchmark completo. El modelo puede no cargar en dispositivos con memoria insuficiente. Además, el repositorio no es directamente cargable por AutoModel; requiere un runtime personalizado.

## Enlaces

- HuggingFace del port: https://huggingface.co/borkiss/Nanbeige4.2-3B-WebGPU
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.2-3B
- Informe técnico: https://arxiv.org/abs/2607.22083
- Aplicación en el navegador: https://huggingface.co/spaces/borkiss/nanbeige4-2-3b-browser-lab
- Código fuente y tooling reproducible: https://huggingface.co/spaces/borkiss/nanbeige4-2-3b-browser-lab/tree/main/source
- Informe de evaluación: https://borkiss-nanbeige4-2-3b-browser-lab.static.hf.space/report.html
