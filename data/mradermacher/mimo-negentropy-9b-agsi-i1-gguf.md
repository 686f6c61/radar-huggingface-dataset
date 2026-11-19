# mradermacher/MiMo-Negentropy-9B-AGSI-i1-GGUF

## Resumen

MiMo-Negentropy-9B-AGSI-i1-GGUF es la versión cuantizada en formato GGUF del modelo MiMo-Negentropy-9B-AGSI, publicado por el usuario mradermacher a partir del modelo base de OliviaRossi. Se trata de un merge de aproximadamente 8.950 millones de parámetros (8.953.803.264 según los pesos en safetensors) orientado a tareas de agente, uso de terminal, generación de código y razonamiento, con etiquetas que lo vinculan a la familia Qwen 3.5. El paquete incluye cuantizaciones ponderadas con imatrix, pensadas para ejecución local en CPU y GPU de consumo mediante llama.cpp y derivados.

La relevancia de esta ficha radica en que permite desplegar un modelo de casi 9.000 millones de parámetros con capacidades agénticas en hardware modesto, desde estaciones de trabajo con una sola GPU hasta portátiles, gracias a la horquilla de cuantizaciones que va desde IQ1_S (2,8 GB) hasta Q6_K (7,5 GB). El modelo declara soporte para inglés y chino, licencia MIT y compatibilidad con endpoints, lo que facilita su integración en pipelines de código y automatización de terminal.

No se dispone de información pública sobre la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks en la documentación proporcionada, por lo que esos apartados se marcan explícitamente como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetas del autor sugieren base Qwen 3.5; no confirmado en la model card) |
| Parámetros totales | 8.953.803.264 (8,95 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (más fichero imatrix) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base se distribuye en safetensors vía transformers |

## Arquitectura y entrenamiento

La model card del repositorio no detalla la arquitectura interna del modelo base. Las etiquetas incluyen `qwen3_5`, lo que sugiere que el merge se construyó sobre la familia Qwen 3.5, pero no se confirma en el texto de la ficha. El modelo base (OliviaRossi/MiMo-Negentropy-9B-AGSI) es un merge, según la etiqueta `merge`, y el autor lo describe como orientado a uso agéntico, coding, terminal-use y razonamiento.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. Tampoco se documentan innovaciones técnicas concretas como decodificación especulativa o atención lineal. La contribución de esta versión es exclusivamente la cuantización: se han generado cuantizaciones ponderadas con imatrix (versión de quantize 2, tensores de salida cuantizados, conversión a formato HF) para reducir el peso del modelo manteniendo la calidad relativa, siguiendo la práctica habitual de mradermacher.

## Capacidades

- Generación de texto conversacional multi-turno, con etiqueta `conversational` en el repositorio.
- Razonamiento explícito (`reasoning`) y resolución de problemas multi-paso.
- Generación y edición de código (`coding`), incluyendo tareas de programación en producción.
- Uso de terminal (`terminal-use`): ejecución de comandos y automatización de shell.
- Comportamiento agéntico (`agentic`): planificación y ejecución de tareas encadenadas.
- Soporte declarado de tool calling y function calling a través de la etiqueta `endpoints_compatible`.
- Capacidades multilingües limitadas a inglés y chino según la model card.
- Compatibilidad con el ecosistema transformers y con llama.cpp vía GGUF.

## Casos de uso

- Automatización de terminal en entornos de desarrollo: el modelo puede interpretar instrucciones en lenguaje natural y traducirlas a comandos de shell, integrándose en scripts de administración de sistemas y tareas repetitivas de DevOps, gracias a su etiqueta `terminal-use`.
- Asistente de coding en el IDE: con cuantizaciones Q4_K_M (5,7 GB) o Q5_K_M (6,6 GB) puede ejecutarse en una GPU de consumo y ofrecer autocompletado, refactorización y explicación de código sin depender de la nube.
- Agente autónomo para pipelines de CI/CD: su orientación agéntica permite encadenar pasos de build, test y despliegue mediante tool calling, aunque requiere validación humana por el riesgo de alucinación en comandos destructivos.
- Chat de soporte técnico bilingüe inglés-chino: adecuado para equipos con documentación en ambos idiomas, con despliegue local para evitar enviar datos sensibles a APIs externas.
- Prototipado rápido de agentes en investigación: al ser un GGUF con licencia MIT, se puede experimentar con arquitecturas de agentes y evaluar comportamiento multi-paso sin coste de licencia.
- Inferencia en portátiles y estaciones sin GPU dedicada: las cuantizaciones IQ2_M (3,7 GB) o IQ3_M (4,5 GB) permiten ejecutar el modelo en CPU con llama.cpp para tareas de razonamiento de baja latencia crítica.
- Generación de código en entornos air-gapped: al distribuirse como fichero GGUF y con licencia MIT, encaja en organizaciones que no pueden usar servicios cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero GGUF más overhead de contexto. IQ1_S ~2,8 GB; IQ2_M ~3,7 GB; IQ3_M ~4,5 GB; Q4_K_M ~5,7 GB; Q5_K_M ~6,6 GB; Q6_K ~7,5 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q6; A100 o H100 solo si se busca throughput alto con lotes grandes.
- Cabe en GPU de consumo: sí, desde GPUs de 6-8 GB con cuantizaciones IQ2/IQ3, y con holgura en GPUs de 12-16 GB para Q5/Q6.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, y servidores compatibles con endpoints (la etiqueta `endpoints_compatible` sugiere compatibilidad con APIs tipo OpenAI). vLLM y TGI no soportan GGUF de forma nativa; para esos motores habría que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiMo-Negentropy-9B-AGSI-i1-GGUF (este) | 8,95 B | no disponible | MIT | GGUF (i1) | Merge orientado a agente y terminal; EN/ZH |
| Qwen2.5-Coder-7B (referencia de categoría) | 7,6 B | 32K (típico) | Apache 2.0 | safetensors, GGUF | Orientado a código; comparación de categoría, datos no verificados en esta ficha |
| Llama-3.1-8B-Instruct (referencia de categoría) | 8,0 B | 128K | Llama 3.1 Community | safetensors, GGUF | Uso general; comparación de categoría, datos no verificados en esta ficha |

No se dispone de datos de rendimiento comparativo del modelo en la información proporcionada; la comparativa anterior es orientativa por categoría y tamaño, no por resultados medidos.

## Limitaciones y advertencias

- No se documentan sesgos conocidos ni evaluaciones de seguridad en la model card.
- Riesgo de alucinación inherente a modelos de 9B, especialmente en tareas agénticas y de terminal donde un comando erróneo puede tener consecuencias destructivas; se recomienda sandboxing y confirmación humana.
- Idiomas soportados limitados a inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- Longitud de contexto no disponible; no se puede planificar el uso en conversaciones o repositorios largos sin verificación empírica.
- Licencia MIT permite uso comercial, pero el modelo base es un merge sin documentación de procedencia de datos de entrenamiento; conviene revisar la licencia del modelo base y de sus componentes.
- Al ser una cuantización, las versiones de baja calidad (IQ1, IQ2, Q2_K_S) degradan notablemente la coherencia; para producción se recomienda Q4_K_M o superior.
- El repositorio tiene 0 likes y 3.668 descargas en el momento de la consulta, lo que indica validación comunitaria escasa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/MiMo-Negentropy-9B-AGSI-i1-GGUF
- Modelo base: https://huggingface.co/OliviaRossi/MiMo-Negentropy-9B-AGSI
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/MiMo-Negentropy-9B-AGSI-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#MiMo-Negentropy-9B-AGSI-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
