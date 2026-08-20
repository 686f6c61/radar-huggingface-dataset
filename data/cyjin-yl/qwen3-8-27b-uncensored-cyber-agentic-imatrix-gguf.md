# cyjin-yl/Qwen3.8-27B-Uncensored-Cyber-agentic-imatrix-GGUF

## Resumen

El repositorio `cyjin-yl/Qwen3.8-27B-Uncensored-Cyber-agentic-imatrix-GGUF` no contiene los pesos del modelo, sino una matriz de importancia (imatrix) calibrada sobre tráfico agéntico real, diseñada para mejorar la cuantización GGUF del modelo base `philbert440/Qwen3.8-27B-Uncensored-Cyber`. Este modelo base es una versión "abliterada" (de-refusal) del Qwen3.8-27B de Alibaba, especializada en ciberseguridad ofensiva y con capacidades multimodales (imagen-texto). El autor del repositorio, cyjin-yl, contribuye únicamente la metodología de calibración y la cuantización, sin realizar fine-tuning ni cambios de comportamiento.

El Qwen3.8-27B original es un modelo denso de 27 mil millones de parámetros con una arquitectura híbrida de atención (16 capas con atención completa, 48 con atención lineal), contexto nativo de 262K tokens y un cabezal de decodificación especulativa (MTP). La versión abliterada elimina los mecanismos de rechazo, lo que la hace adecuada para tareas de seguridad ofensiva, pero también conlleva riesgos de uso indebido. El repositorio GGUF se encuentra en estado de producción parcial: la matriz está publicada, pero los pesos cuantizados (IQ4_XS y Q5_K_M) están en proceso de generación. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 16 capas con atención completa (full_attention_interval: 4) y 48 capas con atención lineal, con estado recurrente constante |
| Parametros totales | 27 mil millones (modelo base, Qwen3.8-27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | IQ4_XS (~4.25 bpw), Q5_K_M (~5.33 bpw), Q8_0 (para la matriz de calibración); se planea una versión sin imatrix como control |
| Idiomas soportados | No disponible en la información proporcionada (el modelo base Qwen3.8 soporta principalmente chino e inglés, con capacidad multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B, desarrollado por Alibaba, emplea una arquitectura híbrida de atención: solo 16 de sus 64 capas utilizan atención completa (con una ventana de 4), mientras que las 48 restantes usan atención lineal con un estado recurrente constante. Esto reduce el coste computacional en contextos largos. Además, incluye un cabezal de decodificación especulativa (MTP) que acelera la generación. La versión abliterada (`philbert440/Qwen3.8-27B-Uncensored-Cyber`) fue modificada para eliminar los rechazos de contenido, y el repositorio de cyjin-yl añade una cuantización calibrada con una imatrix construida a partir de sesiones reales de agentes de codificación (42 sesiones, 648 turnos, 528 llamadas a herramientas reales). El proceso de cuantización usa `llama-imatrix` sobre la versión Q8_0, con `--parse-special` para tokenizar correctamente los tokens especiales del chat, y contexto de 512 tokens para la calibración. No se han publicado detalles del entrenamiento original (número de tokens, composición del dataset, técnicas de RLHF) en la información disponible.

## Capacidades

- Generación de texto y razonamiento avanzado, con soporte de modo de razonamiento configurable (thinking mode) heredado del modelo base.
- Capacidades multimodales: acepta imágenes como entrada (pipeline image-text-to-text), gracias a la torre de visión preservada en el modelo base.
- Generación de código y agentes: el modelo base está optimizado para tareas de codificación y flujos de trabajo agénticos, incluyendo llamadas a herramientas (tool calling) y razonamiento multi-paso.
- Soporte de decodificación especulativa (MTP) para acelerar la inferencia.
- Especialización en ciberseguridad ofensiva: el modelo abliterado responde a consultas de seguridad sin rechazos, lo que incluye tareas como análisis de vulnerabilidades, generación de exploits, etc.
- Capacidades multilingües: aunque no se detallan en la información, el modelo base de Qwen3.8 soporta múltiples idiomas, con especial competencia en chino e inglés.

## Casos de uso

- Asistencia en auditorías de seguridad: el modelo puede analizar código fuente, configuraciones y binarios para identificar vulnerabilidades, gracias a su especialización en ciberdefensa y a su capacidad de razonamiento multi-paso. Se usaría con prompts que incluyen capturas de pantalla o diagramas de arquitectura, aprovechando la entrada multimodal.
- Automatización de tareas de agentes en entornos de codificación: el modelo puede gestionar sesiones de agente con llamadas a herramientas (bash, lectura de archivos, búsqueda web) y mantener un contexto largo de 262K tokens, lo que permite manejar repositorios enteros sin perder el hilo.
- Generación de código y scripts de automatización en producción: con soporte de tool calling y generación de código, puede integrarse en pipelines de CI/CD para generar tests, parches o documentación técnica, siempre que el equipo acepte el riesgo del modelo abliterado.
- Análisis de conversaciones de seguridad ofensiva: en equipos de red team, el modelo puede generar informes detallados de pruebas de penetración, explicando vectores de ataque y mitigaciones, sin censura sobre temas sensibles.
- Investigación de vulnerabilidades: el modelo puede razonar sobre CVE, escribir PoCs (proof-of-concept) y simular escenarios de ataque, gracias a su capacidad de razonamiento matemático y lógico.
- Extracción de información de documentos técnicos: al ser multimodal, puede leer capturas de pantalla de herramientas de seguridad, diagramas de red o imágenes de logs y extraer conclusiones accionables, aunque no se ha validado su precisión en este dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que las comparaciones numéricas (con y sin imatrix) se medirán sobre un corpus de validación disjunto del de calibración, pero no se han añadido aún. No se puede afirmar un rendimiento superior del imatrix sin datos medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: para la cuantización IQ4_XS (~4.25 bpw) se necesitan aproximadamente 14-15 GB de VRAM; para Q5_K_M (~5.33 bpw) alrededor de 17-18 GB. La versión Q8_0 (no recomendada para producción) requeriría más de 30 GB.
- GPUs recomendadas: una NVIDIA RTX 4090 (24 GB) o A100 40 GB pueden ejecutar las cuantizaciones Q5_K_M sin problemas. La V100 de 16 GB puede ejecutar IQ4_XS si se usa offloading parcial (el autor la menciona en los tags).
- En consumer GPUs: sí, una RTX 3090/4090 puede ejecutar el modelo en IQ4_XS o Q5_K_M con suficiente VRAM.
- Opciones de despliegue: llama.cpp (soporte nativo para GGUF), Ollama, vLLM (con compatibilidad para GGUF), y TGI.
- Latencia y throughput: no disponibles en la información proporcionada. Se espera que la decodificación especulativa (MTP) mejore la velocidad de generación, pero sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Diferencias clave |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Apache 2.0 | Modelo original sin abliteración, con rechazos de seguridad. |
| philbert440/Qwen3.8-27B-Uncensored-Cyber | 27B | 262K | Apache 2.0 | Versión abliterada, especializada en seguridad ofensiva. |
| cyjin-yl/Qwen3.8-27B-Uncensored-Cyber-agentic-imatrix-GGUF | 27B | 262K | Apache 2.0 | Cuantización GGUF con imatrix agéntica; no incluye pesos completos aún. |

No se dispone de datos de rendimiento comparativo entre estas variantes. Se recomienda evaluar la versión cuantizada frente al modelo base en tareas específicas antes de usar en producción.

## Limitaciones y advertencias

- El modelo está abliterado (de-refusal): se eliminaron los rechazos de contenido, lo que permite generar contenido dañino, incluyendo exploits, malware o instrucciones peligrosas. Su uso debe restringirse a entornos legales y éticos, y no se recomienda para aplicaciones públicas o sin supervisión.
- La cuantización se realizó desde Q8_0, no desde BF16, lo que introduce una segunda capa de error de cuantización, aunque se considera casi sin pérdida.
- Los pesos cuantizados aún no están disponibles en el repositorio (estado "in progress" en la fecha de consulta). Solo se ha publicado la matriz de importancia.
- El corpus de calibración es privado y no se publica, lo que limita la reproducibilidad completa del proceso.
- No se han publicado evaluaciones de rendimiento en tareas de seguridad ni de calidad de generación; los números de imatrix aún no se han medido.
- La licencia Apache 2.0 permite uso comercial, pero la naturaleza abliterada del modelo puede implicar riesgos legales y de responsabilidad si se despliega en aplicaciones que requieran cumplimiento normativo.
- El modelo base es multimodal, pero la cuantización GGUF puede degradar la calidad de la visión si no se cuantifican correctamente las capas de visión (no se especifica el tratamiento de la torre de visión).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cyjin-yl/Qwen3.8-27B-Uncensored-Cyber-agentic-imatrix-GGUF
- Modelo base (abliterado): https://huggingface.co/philbert440/Qwen3.8-27B-Uncensored-Cyber
- Repositorio oficial de Qwen3.8-27B (Alibaba): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Página de Qwen3.8-27B en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-27B
- Ficha de vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Página de LM Studio: https://lmstudio.ai/models/qwen3.8
