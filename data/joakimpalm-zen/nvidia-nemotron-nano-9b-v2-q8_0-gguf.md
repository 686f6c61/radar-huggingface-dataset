# Joakimpalm-Zen/NVIDIA-Nemotron-Nano-9B-v2-Q8_0-GGUF

## Resumen

NVIDIA-Nemotron-Nano-9B-v2 es un modelo de lenguaje grande (LLM) desarrollado por NVIDIA, diseñado como una solución unificada para tareas de razonamiento y no razonamiento. Su arquitectura híbrida combina capas de atención Transformer con bloques de espacio de estado (SSM) basados en Mamba-2, lo que le permite ofrecer alta eficiencia en inferencia y un manejo eficaz de contextos largos, manteniendo un tamaño compacto de aproximadamente 8,9 mil millones de parámetros. El modelo responde a las consultas generando primero una traza de razonamiento y después la respuesta final, lo que lo hace especialmente adecuado para aplicaciones agénticas y de razonamiento multi-paso.

La versión aquí descrita es una cuantización GGUF en Q8_0 producida por Joakimpalm-Zen, diseñada para ser servida con el motor de inferencia `xyntetik-runner`, un ejecutable de C11 sin dependencias que ofrece una característica única: cuando una llamada a herramienta (tool call) excede su presupuesto de tokens, el motor la cierra al documento más pequeño legal según el esquema, garantizando que los argumentos sigan siendo parseables. Esto resuelve un problema común en otros motores (vLLM, llama.cpp, Ollama, etc.) que devuelven llamadas truncadas o malformadas. La cuantización Q8_0 es canónica y byte-idéntica a la producida por llama.cpp, con una fidelidad prácticamente sin pérdida respecto al modelo base en bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-2 / atención (nemotron_h) |
| Parametros totales | 8.888.227.328 (aprox. 8,9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (GGUF), bf16 (base) |
| Idiomas soportados | No disponible |
| Licencia | nvidia-open-model-license |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base NVIDIA-Nemotron-Nano-9B-v2 fue entrenado desde cero por NVIDIA con una arquitectura híbrida que combina bloques de atención Transformer con bloques de espacio de estado (SSM) de Mamba-2. Esta combinación permite un equilibrio entre la capacidad de modelado de dependencias a largo plazo de la atención y la eficiencia computacional de los SSM, especialmente en tareas de razonamiento y agentes. El modelo está diseñado para generar una traza de razonamiento antes de emitir la respuesta final, lo que mejora el rendimiento en problemas complejos.

La cuantización Q8_0 presentada en este repositorio fue producida mediante el motor `xyntetik-runner`, y sus pesos son byte-idénticos a los que produciría llama.cpp con la misma configuración, garantizando interoperabilidad. No se dispone de información pública sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO. La innovación principal reside en el motor de inferencia que acompaña a este GGUF, que implementa una recuperación de truncación forzada para llamadas a herramientas, una característica única no disponible en otros motores.

## Capacidades

- Generación de texto con razonamiento multi-paso: el modelo genera una traza de razonamiento antes de la respuesta final, útil para problemas complejos.
- Razonamiento y tareas agénticas: diseñado para agentes que requieren planificación y ejecución de múltiples pasos.
- Soporte de tool calling / function calling: gracias al motor `xtyntetik-runner`, las llamadas a herramientas se cierran de forma legal incluso cuando se excede el presupuesto de tokens, garantizando que los argumentos sigan siendo parseables.
- Compatible con OpenAI-compatible API: el servidor integrado en `xyntetik-runner` permite su uso con clientes estándar.
- Cuantización Q8_0 de alta fidelidad: la versión cuantizada conserva una fidelidad casi idéntica al modelo base en bf16, con un 100% de coincidencia en el top-1 de tokens en pruebas de referencia.
- Ejecución en múltiples plataformas: el motor `xyntetik-runner` soporta CPU, CUDA y Metal, aunque este archivo GGUF está verificado también con llama.cpp.

## Casos de uso

- **Agentes conversacionales con herramientas**: el modelo puede gestionar diálogos multi-turno donde necesita invocar herramientas externas (búsqueda web, APIs, calculadoras). Gracias a la recuperación de truncación de `xyntetik-runner`, las llamadas a herramientas se cierran correctamente incluso con presupuestos de tokens ajustados, reduciendo reintentos en bucles de agentes.
- **Razonamiento matemático y lógico**: su capacidad de generar trazas de razonamiento lo hace adecuado para problemas de aritmética, lógica y resolución de ecuaciones, donde se requiere una cadena de pensamiento explícita.
- **Generación de código con verificación**: puede generar código de programación y explicar el razonamiento detrás de cada fragmento, útil en entornos de desarrollo asistido o en pipelines de CI/CD que requieran documentación automática.
- **Asistentes de análisis de datos**: en notebooks o entornos de datos, el modelo puede razonar sobre tablas y generar consultas SQL o código Python para análisis, manteniendo un contexto de trabajo largo.
- **Sistemas de tutoría inteligente**: para explicar conceptos complejos paso a paso, aprovechando su razonamiento explícito y la capacidad de adaptar respuestas según el nivel del usuario.
- **Automatización de tareas administrativas**: procesamiento de formularios, generación de resúmenes y extracción de información estructurada, donde la llamada a funciones permite integrarse con APIs de gestión de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base NVIDIA-Nemotron-Nano-9B-v2 cuenta con resultados en la página de NVIDIA NIM, pero no se han proporcionado en este contexto. Por tanto, no se puede presentar una tabla comparativa con datos numéricos verificados.

## Requisitos de hardware

- **VRAM estimada**: para la cuantización Q8_0 (aproximadamente 1 byte por parámetro), se requieren unos 9 GB de VRAM para la carga del modelo. Con overhead de inferencia, se recomienda un mínimo de 12 GB.
- **GPUs recomendadas**: tarjetas con 12 GB o más, como NVIDIA RTX 3080/3090, RTX 4090, A100 (40 GB), o H100. En CPU se puede ejecutar con memoria RAM suficiente (más de 16 GB).
- **Compatibilidad con consumer GPU**: sí, modelos como RTX 3090 (24 GB) o RTX 4090 (24 GB) pueden ejecutarlo con comodidad.
- **Opciones de despliegue**: `xyntetik-runner` (recomendado, con soporte de tool calling robusto), llama.cpp (verificado en b10353), y potencialmente vLLM, Ollama, o TGI si se convierten los pesos, aunque no se ha verificado.
- **Latencia y throughput**: no se proporcionan datos específicos. En general, los modelos híbridos Mamba-2/attention ofrecen mejor latencia en generación que los Transformer puros de tamaño similar, pero depende del hardware y de la longitud de secuencia.

## Comparativa con modelos similares

No se dispone de información de modelos comparables en la documentación proporcionada. Se puede mencionar que, por tamaño y arquitectura, se podría comparar con otros modelos de ~9B como Llama-3.1-8B, Gemma-2-9B o Mistral-7B, pero no se tienen datos de rendimiento para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- **Sesgos y alucinación**: como cualquier LLM, puede generar información falsa o sesgada, especialmente en temas no cubiertos por sus datos de entrenamiento. No se dispone de una evaluación específica de sesgos para este modelo.
- **Riesgo de alucinación en razonamiento**: aunque genera trazas de razonamiento, no hay garantía de que estas sean siempre correctas; se recomienda validar las salidas en entornos críticos.
- **Contexto y idiomas**: la longitud de contexto no se ha especificado, y los idiomas soportados no están disponibles en la documentación; probablemente esté optimizado para inglés, pero no se puede confirmar.
- **Licencia**: la `nvidia-open-model-license` permite uso comercial, pero se debe revisar los términos exactos para aplicaciones específicas, especialmente si se redistribuyen pesos o se usa en productos comerciales.
- **Dependencia del motor de inferencia**: la característica de recuperación de truncación de tool calls solo está disponible en `xyntetik-runner`; si se usa con otros motores, se pierde esa garantía y se vuelve al comportamiento estándar de truncamiento.
- **Verificación de calidad**: el archivo GGUF está marcado como "experimental" en el manifiesto incluido, lo que indica que la medición de calidad es puntual y no un compromiso a largo plazo.

## Enlaces

- [Repositorio HuggingFace del GGUF](https://huggingface.co/Joakimpalm-Zen/NVIDIA-Nemotron-Nano-9B-v2-Q8_0-GGUF)
- [Modelo base en HuggingFace](https://huggingface.co/nvidia/NVIDIA-Nemotron-Nano-9B-v2)
- [Página de NVIDIA Nemotron](https://developer.nvidia.com/topics/ai/nemotron)
- [Model card en NVIDIA NIM](https://build.nvidia.com/nvidia/nvidia-nemotron-nano-9b-v2/modelcard)
- [Repositorio del motor xyntetik-runner](https://github.com/Joakimpalm-Zen/xyntetik-runner)
- [Benchmark de truncación del motor](https://github.com/Joakimpalm-Zen/xyntetik-runner/blob/main/docs/truncation-benchmark.md)
