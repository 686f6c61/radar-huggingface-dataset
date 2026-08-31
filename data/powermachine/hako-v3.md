# PowerMachine/HAKO-v3

## Resumen

HAKO-v3 es un modelo de lenguaje experimental desarrollado por el usuario PowerMachine, publicado en HuggingFace bajo el identificador PowerMachine/HAKO-v3. Según la model card, se trata de la tercera versión de un sistema denominado "Hybrid Attention Kohonen Orchestrator", que combina mecanismos de atención con redes SOM (Self-Organizing Maps) y técnicas de difusión. El autor describe una serie de innovaciones como la penalización por repetición en tres niveles, el uso de un modelo GPT-2 GQA como orquestador y la integración de DINOv2 con difusión para el entrenamiento de la red SOM.

El repositorio tiene un tamaño de 0,3 GB, lo que sugiere un modelo compacto, probablemente cuantizado a int4 según se menciona en la descripción. Sin embargo, la información pública es muy limitada: no se especifican parámetros totales, longitud de contexto, idiomas soportados ni licencia. La model card está escrita en portugués de Brasil y describe principalmente el proceso de entrenamiento y las métricas de evaluación, pero no ofrece detalles sobre el rendimiento en tareas estándar ni casos de uso concretos. En el momento de la consulta, el modelo no tiene descargas ni valoraciones, lo que indica que es un proyecto muy reciente y poco difundido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid Attention Kohonen Orchestrator (atención + SOM + difusión) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (mencionado en la model card) |
| Idiomas soportados | no disponible (la model card está en portugués, pero no se confirma soporte multilingüe) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el tamaño del repo sugiere safetensors o similar, pero no se especifica) |

## Arquitectura y entrenamiento

La model card describe una arquitectura híbrida que integra atención, redes SOM (Kohonen) y un componente de difusión. El autor menciona tres novedades principales:

1. **Penalización por repetición en tres niveles (T-REP3)**: actúa sobre la generación (control de n-gramas y presencia/frecuencia), sobre la selección de la unidad BMU en la SOM (con una penalidad sin dimensión y decaimiento cosenoidal) y sobre el enrutamiento de rutas repetidas.

2. **Modelo fuente como orquestador**: un GPT-2 GQA (denominado "gpt2g") entrena un router (RouterGQA) con etiquetas de responsabilidad basadas en calidad de estimación (QE). El orquestador está presente en todas las rutas para garantizar el intercambio de información.

3. **DINOv2 -> Diffusion -> SOM**: se utiliza un modelo de difusión (DDPM con T-CURRICULUM) entrenado sobre los latentes de DINOv2, y las muestras denoizadas alimentan el entrenamiento de la red SOM, con mezcla beta y pseudo-muestras.

El entrenamiento parece ser experimental y orientado a la investigación, con métricas de QE, TE, U-matrix, hits y dW por época, así como verificaciones M1-M4. No se proporcionan datos sobre el volumen de datos de entrenamiento ni sobre el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de texto: el modelo está entrenado para producir respuestas, según se deduce de las pruebas descritas (20 preguntas en portugués con respuestas crudas).
- Razonamiento: no hay evidencia publicada de capacidades avanzadas de razonamiento más allá de la generación básica.
- Soporte de tool calling / function calling: no se menciona en la documentación.
- Soporte de agentes y multi-step reasoning: no se menciona.
- Capacidades multilingües: no se especifican; la model card está en portugués y las pruebas parecen ser en ese idioma.
- Capacidades especiales: el modelo integra un mecanismo de penalización por repetición y un enrutamiento basado en SOM, lo que podría influir en la diversidad y coherencia de las respuestas, pero no hay métricas objetivas que lo confirmen.

## Casos de uso

- Investigación académica en arquitecturas híbridas: el modelo puede servir como base para estudiar la combinación de atención, SOM y difusión en generación de texto, dado su diseño experimental.
- Experimentos de control de repetición: el sistema T-REP3 podría aplicarse en entornos donde se requiere reducir la repetición de n-gramas, como en diálogos largos o generación de código.
- Pruebas de enrutamiento dinámico: el RouterGQA entrenado con QE podría explorarse en sistemas de mezcla de expertos o enrutamiento condicional.
- Benchmark de penalización por repetición: útil para comparar estrategias de penalidad en modelos pequeños.
- Exploración de integración de visión y lenguaje: al usar DINOv2 y difusión, podría adaptarse a tareas que requieran representaciones visuales, aunque no hay evidencia de que el modelo procese imágenes directamente.
- Educación y prototipado: por su tamaño reducido (0,3 GB), puede ejecutarse en entornos con recursos limitados para fines didácticos o de prototipado rápido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona métricas internas (QE, TE, U-matrix, hits, dW) y verificaciones M1-M4, pero no se aportan valores numéricos ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible, pero el tamaño del repositorio (0,3 GB) y la cuantización int4 sugieren que el modelo es pequeño y podría caber en GPUs de consumo con 4-6 GB de VRAM, aunque no hay confirmación oficial.
- GPU recomendadas: no se especifican; se puede inferir que una RTX 3060 o superior sería suficiente, pero es una suposición.
- Compatibilidad con consumer GPU: probablemente sí, dado el tamaño, pero sin datos concretos no se puede asegurar.
- Opciones de despliegue: no se mencionan; se desconoce si es compatible con vLLM, llama.cpp, Ollama, TGI u otros frameworks.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables en el ecosistema open source con una arquitectura híbrida de atención + SOM + difusión. El modelo parece único en su enfoque, pero carece de datos de rendimiento para compararlo con alternativas convencionales de tamaño similar (como GPT-2, Phi-2 o TinyLlama).

## Limitaciones y advertencias

- Documentación muy escasa: la model card es informal y no proporciona especificaciones técnicas estándar (parámetros, contexto, licencia, idiomas).
- Modelo experimental: no hay evidencia de evaluación rigurosa ni de uso en producción; es probable que contenga errores o comportamientos impredecibles.
- Sesgos y alucinaciones: no se han evaluado; al ser un modelo pequeño sin entrenamiento supervisado conocido, el riesgo de alucinación es alto.
- Restricciones de licencia: al no estar especificada, no se puede determinar si es apto para uso comercial.
- Idioma: la model card está en portugués y las pruebas parecen limitadas a ese idioma; no se garantiza soporte para otros idiomas.
- Formato de pesos no confirmado: no se indica si los pesos están en safetensors, GGUF u otro formato, lo que dificulta su integración en pipelines existentes.
- Reproducibilidad: el código de entrenamiento no se ha publicado (solo se menciona un comando de ejecución), por lo que replicar los resultados es complicado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PowerMachine/HAKO-v3
- Repositorio GitHub del autor (no confirmado como oficial): no se ha identificado un enlace directo al código fuente de HAKO-v3 en los resultados de búsqueda.
