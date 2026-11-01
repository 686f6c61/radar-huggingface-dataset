# burningfeet/backup2026-10-28-LffyFx-Qwopus3.6-35B-A3B-Coder-Uncensored-Genesis-Hermes-MTP-GGUF

## Resumen

Qwopus3.6-35B-A3B-Coder-Uncensored-Genesis-Hermes-MTP es un modelo de lenguaje multimodal (image-text-to-text) publicado por el usuario burningfeet en HuggingFace, derivado del modelo base HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive. Se trata de un fine-tuning de tipo SFT/LoRA sobre una arquitectura Mixture of Experts (MoE) con 35.505.251.456 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token (indicado por el sufijo A3B), orientado a generación de código, razonamiento lógico-matemático, uso de herramientas y flujos agénticos, con un ajuste explícito para eliminar restricciones de contenido ("uncensored").

El modelo se distribuye exclusivamente en formato GGUF, lo que lo hace apto para inferencia local mediante llama.cpp y derivados. Incorpora capacidades multimodales (procesamiento de imagen y texto), soporte declarado de function calling y tool use, contexto largo, y modos de razonamiento con "thinking" desactivable. Está etiquetado como compatible con endpoints y entrenado parcialmente sobre el dataset NousResearch/hermes-function-calling-v1, lo que explica la presencia de "Hermes" en la nomenclatura.

Su relevancia radica en combinar un tamaño MoE eficiente (35B totales, 3B activos) con capacidades multimodales y agénticas en un único artefacto GGUF, si bien conviene señalar que el repositorio es un backup con cero descargas y cero likes en el momento de la consulta, con acceso restringido (gated), lo que limita su validación por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Qwen3.6, transformer con visión (image-text-to-text) |
| Parametros totales | 35.505.251.456 |
| Parametros activos | Aproximadamente 3B (según sufijo A3B; no confirmado en la información proporcionada) |
| Longitud de contexto | no disponible (etiquetado como "long-context" sin cifra concreta) |
| Tipos de cuantizacion | GGUF (los niveles concretos no están especificados en la información disponible) |
| Idiomas soportados | en, zh, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Mixture of Experts derivada de la familia Qwen3.6, con 35.505.251.456 parámetros totales y un subconjunto activo de aproximadamente 3.000 millones por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamaño. Incorpora un componente multimodal (pipeline image-text-to-text) que permite procesar imágenes junto con texto. El entrenamiento parte del checkpoint HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive y se completa mediante SFT y LoRA, con datos que incluyen el dataset NousResearch/hermes-function-calling-v1, lo que refuerza las capacidades de function calling y uso de herramientas.

Las etiquetas del repositorio indican ajuste para agentic workflows, tool-use, thinking-off (modo de razonamiento desactivable), lógica y matemáticas, y una variante "uncensored" que elimina filtros de contenido. El sufijo "MTP" en el nombre sugiere multi-token prediction, aunque no se aporta documentación técnica que lo confirme. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni la existencia de fases de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento general, con especial énfasis en código (etiqueta "Coder") y lógica/matemáticas.
- Procesamiento multimodal image-text-to-text: acepta imágenes como entrada junto con texto.
- Soporte de tool calling y function calling, reforzado por el entrenamiento sobre hermes-function-calling-v1.
- Capacidades agénticas y razonamiento multi-paso (etiquetas "agentic", "agent").
- Modo de razonamiento desactivable ("thinking-off"), útil para reducir latencia en producción.
- Capacidades multilingües limitadas a inglés, chino y otros idiomas no especificados.
- Contexto largo declarado mediante etiqueta, sin cifra concreta publicada.
- Variante "uncensored": menor rechazo de peticiones, sin filtros de contenido alineados.

## Casos de uso

- Generación de código en producción: el modelo puede integrarse en pipelines de CI/CD para autocompletar, refactorizar y revisar código, apoyándose en su especialización "Coder" y en el soporte de tool calling para invocar linters o ejecutores de tests.
- Asistentes de desarrollo con agentes: gracias a las capacidades agénticas y de razonamiento multi-paso, puede orquestar tareas como búsqueda en repositorios, edición de ficheros y ejecución de comandos en un bucle controlado.
- Automatización de atención al cliente multi-turno: el contexto largo declarado y el modo thinking-off permiten conversaciones extensas con baja latencia percibida.
- Análisis de documentos con imágenes: al ser image-text-to-text, puede extraer información de capturas, diagramas o formularios combinados con texto, por ejemplo en digitalización de facturas o revisión de interfaces.
- Razonamiento lógico y matemático asistido: útil para tutoría técnica, verificación de demostraciones o resolución de problemas paso a paso en entornos educativos.
- Despliegue local en estaciones de trabajo: al distribuirse en GGUF, puede ejecutarse con llama.cpp u Ollama en hardware de consumo, facilitando prototipado sin dependencia de la nube.
- Investigación sobre alineación y contenido sin filtros: la variante "uncensored" sirve para estudiar comportamientos del modelo en ausencia de salvaguardas, siempre en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; para 35.505 millones de parámetros en GGUF, las cuantizaciones de 4 bits requerirían del orden de 20-25 GB, y las de 8 bits en torno a 35-40 GB (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabría esperar A100 40/80 GB, H100 o RTX 4090 para cuantizaciones bajas.
- Compatibilidad con GPU de consumo: probable en RTX 3090/4090 con cuantizaciones de 4 bits, sujeto a verificación empírica.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio) al ser formato GGUF; vLLM y TGI no están confirmados para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwopus3.6-35B-A3B-Coder-Uncensored-Genesis-Hermes-MTP | 35,5B | ~3B | no disponible | apache-2.0 | GGUF |
| Qwen3-30B-A3B (referencia de la familia) | ~30B | ~3B | no disponible en esta ficha | apache-2.0 | safetensors, GGUF |
| Mixtral 8x7B | ~46,7B | ~12,9B | 32k | apache-2.0 | safetensors, GGUF |

La comparación con Qwen3-30B-A3B y Mixtral 8x7B es orientativa por familia y tamaño; no se dispone de datos de rendimiento de este artefacto concreto para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Repositorio con 0 descargas y 0 likes: no hay validación comunitaria ni evidencia empírica de calidad.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que puede complicar la automatización de descargas.
- Naturaleza "uncensored": ausencia de salvaguardas de contenido, con riesgo de generar material dañino, sesgado o ilegal; no apto para producción orientada al usuario final sin capas adicionales de moderación.
- Riesgo de alucinación inherente a los modelos generativos, agravado por la falta de benchmarks publicados.
- Idiomas limitados a inglés, chino y multilingüe sin detalle; el rendimiento en castellano no está verificado.
- Longitud de contexto no especificada numéricamente, pese a la etiqueta "long-context".
- El nombre del repositorio incluye una fecha futura (2026-10-28) y el prefijo "backup", lo que sugiere un artefacto de respaldo sin mantenimiento garantizado.
- Aunque la licencia declarada es apache-2.0, conviene verificar la licencia del modelo base y de los datasets empleados antes de un uso comercial.
- El sufijo "MTP" no está documentado técnicamente en la información disponible.

## Enlaces

- HuggingFace: https://huggingface.co/burningfeet/backup2026-10-28-LffyFx-Qwopus3.6-35B-A3B-Coder-Uncensored-Genesis-Hermes-MTP-GGUF
- Modelo base: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Dataset de function calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
