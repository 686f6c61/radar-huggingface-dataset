# guell00/VELUM-Coder

## Resumen

VELUM-Coder es un modelo de lenguaje especializado en programación desarrollado por guell00 (Miguel Penha Reis), construido mediante fine-tuning y post-training sobre la base `unsloth/LFM2.5-8B-A1B`. Con aproximadamente 8B parámetros totales y cerca de 1B activos durante la inferencia, adopta una arquitectura de mezcla de expertos (MoE) que permite una ejecución local eficiente. El post-training se ha orientado de forma deliberadamente agresiva hacia el código: alrededor del 95% de los datos de entrenamiento son de programación y solo un 5% de lenguaje natural, con el objetivo de convertirlo en una herramienta de generación de código fiable y no en un chatbot generalista.

El modelo destaca por su especialización en la creación de aplicaciones completas, interfaces, juegos y experiencias 3D en un solo archivo HTML, así como en tareas de debugging, refactorización y comprensión de proyectos. Su distribución pública se centra en pesos cuantizados listos para inferencia, con formato GGUF. La relevancia actual radica en la demanda de modelos locales de código con un coste computacional reducido, y VELUM-Coder ofrece una alternativa MoE compacta que prioriza la generación de código ejecutable sobre la conversación genérica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) sobre base LFM2.5-8B-A1B |
| Parametros totales | 8.467.856.832 (~8B) |
| Parametros activos | ~1B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (con imatrix) |
| Idiomas soportados | no disponible (model card en portugues; prompts sugeridos en portugues e ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors del modelo base no publicados) |

## Arquitectura y entrenamiento

VELUM-Coder hereda la arquitectura del modelo base `unsloth/LFM2.5-8B-A1B`, un transformer de mezcla de expertos (MoE) con aproximadamente 8B parámetros totales y solo ~1B activos por token. Esta configuración permite una inferencia local con un coste computacional reducido en comparación con modelos densos del mismo tamaño. El autor menciona un modelo borrador (`LFM2.5-230M`) que sugiere el uso de decodificación especulativa para acelerar la generación.

El post-training se realizó con un reparto de datos de aproximadamente 95% código y 5% lenguaje natural. El dataset de entrenamiento, el pipeline de post-training y otros artefactos internos no se incluyen en esta release. El entrenamiento se centró en empujar el comportamiento del modelo hacia generación de código, implementación de funcionalidades, debugging, refactorización, comprensión de proyectos, creación de aplicaciones completas, generación de interfaces, JavaScript/HTML/CSS, experiencias Three.js/WebGL, prototipado y creación de pequeños juegos y sistemas ejecutables. No se ha publicado información sobre técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de código funcional y completo en lenguajes web (JavaScript, HTML, CSS) y soporte para experiencias Three.js/WebGL.
- Creación de aplicaciones completas autocontenidas en un único archivo HTML, incluyendo juegos interactivos, simulaciones y prototipos.
- Debugging y refactorización de código existente.
- Comprensión de proyectos y generación de interfaces de usuario.
- Implementación de funcionalidades específicas a partir de prompts estructurados.
- Capacidad de seguir instrucciones de formato estricto, como devolver solo el código solicitado sin explicaciones adicionales.
- No se documenta soporte para tool calling ni function calling.
- No se documentan capacidades multimodales (vision, audio, etc.).
- El modelo no está diseñado para conversación generalista; su uso principal es la generación de código.

## Casos de uso

- Prototipado rápido de interfaces web: el modelo puede generar un HTML completo con CSS y JavaScript para una interfaz solicitada, permitiendo iterar sobre un diseño en minutos sin escribir el código manualmente.
- Generación de juegos y experiencias interactivas: gracias a su especialización en Three.js y WebGL, puede crear juegos 3D y experiencias interactivas en un solo archivo HTML, adecuado para demos o concursos de desarrollo.
- Automatización de tareas de programación en un entorno local: su tamaño reducido (~1B activos) permite ejecutarlo en una GPU consumer o incluso en CPU, integrándolo en flujos de trabajo de desarrollo sin depender de la nube.
- Asistente de debugging: dado su entrenamiento en código, puede ayudar a identificar errores en snippets y proponer correcciones, siempre que el prompt sea específico y estructurado.
- Generación de componentes y funciones reutilizables: el modelo puede crear funciones o módulos concretos (por ejemplo, un sistema de partículas, un controlador de cámara 3D, etc.) cuando se le pide con un formato claro.
- Educación y aprendizaje de programación: puede generar ejemplos de código funcionales y explicaciones breves, útil para estudiantes que necesitan ver implementaciones completas en lugar de fragmentos inconexos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Al tener ~1B parámetros activos, la inferencia es significativamente más ligera que un modelo denso de 8B, aunque el peso total en disco sigue siendo de ~26.8 GB (cuantizado).
- El formato GGUF permite su ejecución con llama.cpp, Ollama y otros motores compatibles con cuantización.
- No se especifican requisitos de VRAM exactos, pero con cuantizaciones de 4-5 bits es plausible que quepa en GPUs consumer con 8-12 GB de VRAM (RTX 4070, RTX 3090, etc.).
- Para despliegue en servidores, se puede usar vLLM o TGI si se convierten los pesos a safetensors, aunque la distribución oficial es GGUF.
- La latencia y el throughput no están documentados; al ser un modelo MoE con ~1B activos, se espera un rendimiento razonable en hardware consumer, pero no hay datos medidos.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan una comparación objetiva. Como referencia estructural, se puede comparar con otros modelos de código de tamaño similar:

| Modelo | Params totales | Params activos | Contexto | Licencia | Especialización |
|---|---|---|---|---|---|
| VELUM-Coder | ~8B | ~1B | no disponible | no disponible | Código (95%) |
| Qwen2.5-Coder-8B | 8B | 8B (denso) | 128K | Apache 2.0 | Código |
| DeepSeek-Coder-V2-Lite | 15.7B | 2.4B | 128K | DeepSeek License | Código |

La comparación es limitada porque no hay benchmarks publicados para VELUM-Coder y la arquitectura MoE con 1B activos ofrece una ventaja en eficiencia de inferencia frente a modelos densos de 8B, pero también puede implicar menor capacidad de razonamiento complejo.

## Limitaciones y advertencias

- No es un chatbot generalista: su especialización en código hace que las conversaciones abiertas o preguntas de conocimiento general tengan resultados pobres.
- Los prompts vagos o ambiguos funcionan peor; se recomienda estructuras claras y específicas para obtener resultados útiles.
- Con solo ~1B parámetros activos, tiene menos margen para el razonamiento implícito y la interpretación abierta que modelos más grandes.
- No se ha publicado la licencia del modelo, lo que genera incertidumbre sobre el uso comercial y la redistribución.
- No se han publicado datos sobre el contexto máximo soportado; para proyectos grandes podría ser una limitación importante.
- El modelo no incluye dataset de entrenamiento ni pipeline de entrenamiento en la release, lo que dificulta la reproducibilidad.
- No se han publicado evaluaciones de sesgos ni de seguridad; se desconoce si el modelo puede generar código malicioso o inseguro.
- La distribución es solo en GGUF, por lo que para usarlo con frameworks que requieren safetensors (vLLM, TGI) hay que convertir el modelo.

## Enlaces

- [Hugging Face: guell00/VELUM-Coder](https://huggingface.co/guell00/VELUM-Coder)
- [Landing page oficial](https://guell11.github.io/velum-ai)
- [Repositorio GitHub de la landing page](https://github.com/guell11/velum-ai)
- [Colección Coder de guell00 en Hugging Face](https://huggingface.co/collections/guell00/coder)
- [Perfil de guell00 en Hugging Face](https://huggingface.co/guell00)
