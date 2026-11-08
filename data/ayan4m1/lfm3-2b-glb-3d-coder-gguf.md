# ayan4m1/LFM3-2B-GLB-3D-Coder-GGUF

## Resumen

LFM3-2B-GLB-3D-Coder-GGUF es una conversión al formato GGUF del modelo LFM3-VL-2B, un modelo de visión-lenguaje de la familia LFM3 desarrollada por Liquid AI. La familia LFM3, anunciada el 27 de octubre de 2026, agrupa seis modelos abiertos de clase 2B sobre un backbone compartido que cubre texto, visión, audio, omni y decisión. Esta ficha concreta corresponde a una cuantización comunitaria publicada por el usuario ayan4m1, orientada a su ejecución en llama.cpp y a tareas de generación de código con soporte de imagen, según indica el sufijo "3D-Coder" del nombre.

El repositorio incluye el proyector multimodal (mmproj) en BF16 junto con cuantizaciones Q3_K_M, Q4_K_M, Q5_K_M, Q6_K y Q8_0. El recuento real de parámetros en safetensors es de 1.728.801.600, coherente con la clase 1.7B-2B que Liquid AI atribuye a la familia. El tamaño total del repositorio es de 6,9 GB, lo que refleja la suma de todas las variantes publicadas.

La relevancia de esta ficha es doble: por un lado documenta una de las primeras conversiones GGUF de un modelo LFM3 multimodal, lo que permite ejecutarlo en hardware de consumo; por otro, advierte de que se trata de una publicación comunitaria sin model card detallada, con cero descargas y sin licencia ni idiomas declarados en el repositorio, por lo que cualquier uso en producción exige verificar la licencia del modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia LFM3 de Liquid AI; tag `lfm3_vl`, vision-language model) |
| Parametros totales | 1.728.801.600 (según safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (mmproj), Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | no disponible (el sufijo "GLB" sugiere cobertura multilingüe global, sin confirmar) |
| Licencia | no disponible en el repositorio |
| Formato de pesos | GGUF (proyector multimodal en BF16 separado) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Los tags del repositorio identifican el modelo como `lfm3_vl` y `vision-language-model`, lo que confirma que se trata de un modelo multimodal con codificador visual y proyector hacia el modelo de lenguaje. Liquid AI describe la familia LFM3 como seis modelos de clase 2B construidos sobre un backbone compartido, pero no se especifican en la información disponible detalles sobre el tipo de atención, el número de capas ni la composición del dataset de entrenamiento.

Tampoco hay datos sobre el número de tokens de entrenamiento, el uso de RLHF o DPO, ni innovaciones técnicas concretas como decodificación especulativa o atención lineal. La conversión a GGUF se realizó con Unsloth, según la model card, y el repositorio incluye un archivo mmproj separado en BF16, lo que es el patrón habitual en llama.cpp para modelos multimodales: el proyector se mantiene en mayor precisión mientras el modelo de lenguaje se cuantiza.

## Capacidades

- Generación de texto conversacional en formato chat, con soporte de plantilla Jinja (`--jinja`).
- Procesamiento de imagen y texto combinados mediante `llama-mtmd-cli`, gracias al proyector multimodal incluido.
- Generación de código, según indica el sufijo "3D-Coder" del nombre del repositorio; no se detalla el alcance ni la especialización exacta.
- Ejecución local en llama.cpp y llama-cpp, con compatibilidad declarada con endpoints.
- Capacidades multilingües probablemente presentes por el sufijo "GLB", aunque no confirmadas en la documentación.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Asistencia de código en local: el modelo puede integrarse en un flujo de llama.cpp para autocompletar o explicar fragmentos de código sin conexión, aprovechando su tamaño de 1,7B parámetros y las cuantizaciones Q4_K_M o Q5_K_M para equipos de consumo.
- Análisis de capturas de pantalla o diagramas: al ser un modelo visión-lenguaje, permite describir interfaces, leer diagramas técnicos o extraer información de imágenes usando `llama-mtmd-cli` con el proyector BF16.
- Prototipado de agentes multimodales: sirve como componente de percepción en pipelines donde se recibe una imagen y se genera una respuesta textual estructurada, siempre que se añada lógica externa de orquestación.
- Documentación técnica asistida: puede resumir imágenes de arquitectura o diagramas de flujo y generar texto explicativo para documentación interna.
- Despliegue en entornos con recursos limitados: las variantes Q3_K_M y Q4_K_M permiten ejecución en GPU de gama media o incluso CPU, útil para demos y pruebas de concepto.
- Evaluación comparativa de la familia LFM3: este repositorio facilita probar la variante VL-2B frente a otros modelos de clase 2B en tareas de código y visión sin depender de infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos de este repositorio en la información disponible. La fuente de MarkTechPost menciona que LFM3-1.7B promedia 49,37 en 29 benchmarks autoinformados, por encima de los 47,24 de Qwen3.5-9B, pero ese dato corresponde a la variante de texto de la familia y no puede atribuirse directamente a esta conversión GGUF multimodal.

## Requisitos de hardware

- VRAM estimada: en Q4_K_M, un modelo de 1,7B parámetros ocupa aproximadamente 1,1-1,3 GB de pesos, más el proyector BF16 y la caché KV; en la práctica, entre 2 y 3 GB para contexto moderado. En Q8_0, alrededor de 2 GB solo de pesos.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti, RTX 4090 o superiores para mayor comodidad; también funciona en GPUs con 4-6 GB si se usa Q3_K_M o Q4_K_M.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más usando cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`), llama-cpp-python y cualquier frontend compatible con GGUF; no se documenta compatibilidad con vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-2B-GLB-3D-Coder-GGUF (este) | 1,73B | no disponible | Sí (VL) | no disponible | GGUF comunitario, 0 descargas |
| LFM3-1.7B (texto, familia LFM3) | ~1,7B | no disponible | No | abierta según Liquid AI (verificar) | Peso oficial de Liquid AI |
| Qwen3.5-9B (referencia citada) | ~9B | no disponible | no disponible | no disponible | no disponible |

La comparación directa con alternativas de la misma categoría no puede completarse con los datos disponibles; la única referencia numérica es la comparación agregada de la familia LFM3 con Qwen3.5-9B en benchmarks autoinformados.

## Limitaciones y advertencias

- Repositorio comunitario sin model card detallada: no se documentan sesgos, datos de entrenamiento ni evaluación de seguridad.
- Licencia no declarada en el repositorio: es imprescindible verificar la licencia del modelo base LFM3-VL-2B antes de cualquier uso comercial.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- Riesgo de alucinación inherente a modelos de 1,7B parámetros, especialmente en tareas de razonamiento complejo o código de producción.
- El sufijo "3D-Coder" no está respaldado por documentación que describa un entrenamiento específico en código 3D; podría tratarse de una denominación del autor de la conversión.
- No se documenta soporte de tool calling ni de agentes multi-paso, por lo que su uso en pipelines automáticos requiere orquestación externa.
- La longitud de contexto no está especificada, lo que impide planificar cargas de trabajo con ventanas largas.
- Al ser una conversión GGUF, la calidad puede diferir de los pesos originales en BF16, especialmente en cuantizaciones Q3_K_M.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ayan4m1/LFM3-2B-GLB-3D-Coder-GGUF
- Unsloth (herramienta de conversión): https://github.com/unslothai/unsloth
- Anuncio de la familia LFM3 en Unite.AI: https://www.unite.ai/liquid-ai-launches-lfm3-family-of-six-open-weight-2b-class-models/
- Cobertura de LFM3 en MarkTechPost: https://www.marktechpost.com/2026/10/27/liquid-ai-lfm3-open-weight-2b-multimodal-models/
