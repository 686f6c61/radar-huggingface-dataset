# mobilint/Qwen3-0.6B-regulus-rb-usb

## Resumen

mobilint/Qwen3-0.6B-regulus-rb-usb es un artefacto derivado de Qwen/Qwen3-0.6B publicado por Mobilint y compilado específicamente para el hardware NPU de ese fabricante. No es un modelo entrenado desde cero: la model card lo declara como modelo base cuantizado (`base_model_relation: quantized`) y empaquetado para el stack de aceleración de Mobilint. El repositorio ocupa 1,6 GB y contiene 155.582.464 parámetros almacenados en safetensors, con licencia Apache 2.0.

El problema que resuelve es el despliegue de un LLM pequeño en aceleradores de borde sin depender de GPU ni de nube: al distribuirse ya compilado y optimizado para la NPU del fabricante, evita el trabajo de conversión, cuantización y ajuste de kernels que normalmente exige portar un transformer a un acelerador propietario. El coste es la dependencia total del entorno de Mobilint: la librería declarada es `mobilint`, el repositorio usa `custom_code` y no se documenta ningún runtime genérico.

Su relevancia práctica es acotada pero concreta: ilustra la tendencia a publicar pesos ya compilados para NPU y sirve a quien evalúe hardware de Mobilint. Sin embargo, el repositorio no publica benchmarks, ni idiomas soportados, ni el esquema de cuantización, y acumula 0 descargas y 0 valoraciones positivas, por lo que la validación de calidad queda enteramente en manos de terceros.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en el repositorio (artefacto compilado; el modelo base Qwen/Qwen3-0.6B es un transformer decoder-only denso según su documentación pública) |
| Parametros totales | 155.582.464 (dato real de los safetensors del repositorio; el modelo base declara ~0,6 B) |
| Parametros activos | no aplica: no es MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; la model card indica `base_model_relation: quantized` sin especificar precisión ni esquema |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con `custom_code` y librería `mobilint` |
| Tamaño del repositorio | 1,6 GB |
| Modelo base | Qwen/Qwen3-0.6B |
| Pipeline | text-generation |
| Descargas / valoraciones | 0 / 0 |
| Fecha de creación (metadatos) | 2026-09-10 |

## Arquitectura y entrenamiento

El repositorio no documenta arquitectura, datos de entrenamiento ni proceso de ajuste. La model card se limita a indicar que el modelo está compilado y optimizado para hardware NPU de Mobilint, empaquetado para su stack de aceleración y destinado a ejecutarse dentro de ese entorno. Tampoco se especifica el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, ya que este artefacto no entrena: deriva del modelo base mediante un proceso de cuantización y compilación no descrito.

Como referencia externa, y sin que este repositorio lo verifique, la documentación pública de Qwen/Qwen3-0.6B describe un transformer decoder-only denso con atención de consultas agrupadas (GQA), ventana nativa de 32.768 tokens ampliable a 131.072 mediante YaRN, modo de razonamiento explícito (thinking) y soporte declarado de más de cien idiomas. Esa información corresponde al modelo original, no al artefacto de Mobilint, y no puede darse por válida tras la cuantización y compilación sin una evaluación específica.

## Capacidades

- Generación de texto y conversación: la etiqueta `conversational` y el pipeline `text-generation` confirman el uso previsto, aunque la calidad efectiva no está documentada.
- Razonamiento y matemáticas: heredables del modelo base, sin evidencia publicada para este artefacto.
- Generación de código: no documentada explícitamente; depende del modelo base.
- Tool calling / function calling: no disponible; el repositorio no lo menciona ni incluye plantillas de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay documentación de modo agente ni de integración con frameworks.
- Capacidades multilingües: no disponibles; el campo de idiomas está vacío.
- Capacidades especiales (visión, audio, thinking mode): no documentadas en el repositorio.
- Ejecución en acelerador: capacidad diferencial del artefacto, orientada a ejecución sobre NPU de Mobilint mediante su stack propietario.

## Casos de uso

- Asistente conversacional local sin nube: desplegado sobre una NPU de Mobilint, permite mantener diálogos en dispositivos con requisitos de privacidad estrictos, sin enviar texto a servidores externos y sin GPU dedicada.
- Enrutado y preprocesado en pipelines RAG: un modelo de 155 M de parámetros sirve para clasificar la intención del usuario, reformular consultas y decidir qué recuperador invocar antes de llamar a un modelo mayor, reduciendo coste por consulta.
- Extracción de entidades y campos en documentos: procesamiento de facturas, formularios o tickets en el propio dispositivo de captura, aprovechando la inferencia local para evitar latencia de red.
- Clasificación y moderación de contenido: filtrado de comentarios o mensajes en tiempo real sobre hardware de bajo consumo, donde el coste energético por inferencia es el factor crítico.
- Resumen y reescritura de textos cortos: actas de reunión, correos o noticias de extensión moderada, siempre que la longitud de contexto real del artefacto lo permita (dato no publicado).
- Generación de datos sintéticos y aumento de dataset: producción masiva de borradores o paráfrasis a bajo coste por token para alimentar pipelines de anotación y evaluación.
- Prototipado y validación de hardware Mobilint: banco de pruebas para medir latencia y throughput del stack de aceleración antes de comprometerse con un modelo mayor.
- Kioscos y puntos de venta interactivos: atención automatizada en terminales físicos donde no se puede asumir una GPU ni una conexión estable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Benchmark | Resultado del artefacto | Resultado del modelo base |
|---|---|---|
| MMLU | no disponible | no disponible en la información facilitada |
| HumanEval | no disponible | no disponible en la información facilitada |
| GSM8K | no disponible | no disponible en la información facilitada |
| Latencia / throughput en NPU | no disponible | no aplica |

No se incluyen cifras del modelo base porque no forman parte de la información proporcionada y porque, tras un proceso de cuantización y compilación no documentado, no serían representativas del artefacto publicado.

## Requisitos de hardware

- El artefacto está destinado a hardware NPU de Mobilint; no se documenta soporte para inferencia en GPU ni en CPU convencional.
- VRAM estimada en GPU (solo como referencia aritmética sobre los 155.582.464 parámetros declarados): ~311 MB en fp16, ~156 MB en int8 y ~78 MB en int4. Son cálculos sobre el recuento de parámetros, no medidas del artefacto compilado.
- Memoria requerida en la NPU: no disponible; depende del formato compilado y del reparto entre memoria interna y DRAM, no descrito en el repositorio.
- GPU recomendadas: no aplica para el uso previsto; el repositorio no contempla CUDA.
- Compatibilidad con GPU de consumo: no documentada. El tamaño de pesos permitiría en principio ejecutar un modelo equivalente en cualquier GPU con 2 GB o más de memoria, pero este artefacto concreto no incluye un camino de ejecución documentado para ese escenario.
- Opciones de despliegue: únicamente el stack de Mobilint (librería `mobilint` y `custom_code`). No hay soporte declarado de vLLM, llama.cpp, Ollama, TGI ni Transformers estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Observaciones |
|---|---|---|---|---|---|
| mobilint/Qwen3-0.6B-regulus-rb-usb | 155.582.464 en safetensors (base ~0,6 B) | no disponible | Apache 2.0 | safetensors + custom_code, solo stack Mobilint | Cuantizado y compilado para NPU; sin benchmarks ni idiomas documentados |
| Qwen/Qwen3-0.6B | ~0,6 B (denso) | 32.768 nativos; 131.072 con YaRN según su documentación pública | Apache 2.0 | safetensors, Transformers, vLLM, llama.cpp | Modelo original, ejecutable en GPU y CPU; modo thinking y multilingüe |
| Qwen/Qwen2.5-0.5B | ~0,5 B (denso) | 32.768 según su documentación pública | Apache 2.0 | safetensors, múltiples runtimes | Generación anterior, sin modo de razonamiento explícito |
| Llama-3.2-1B | ~1,2 B (denso) | 128.000 según su documentación pública | licencia comunitaria de Llama 3.2 (con restricciones) | safetensors, múltiples runtimes | Alternativa de tamaño similar con licencia menos permisiva |

Los datos de los tres modelos de comparación provienen de su documentación pública y no de la información del repositorio analizado; se incluyen únicamente como contexto de categoría.

## Limitaciones y advertencias

- Documentación mínima: la model card no describe arquitectura, cuantización, tokenizador ni proceso de compilación, lo que impide reproducir el artefacto.
- Dependencia de proveedor: el uso está atado al stack de Mobilint (`custom_code`), lo que descarta portabilidad a otros aceleradores o runtimes.
- Ausencia total de evaluación: no hay benchmarks, comparativas ni métricas de latencia publicadas, y el modelo registra 0 descargas.
- Riesgo de degradación por cuantización: el recuento de parámetros almacenados (155,58 M) es muy inferior al del modelo base (~0,6 B), coherente con una representación comprimida cuya pérdida de calidad no se ha cuantificado.
- Escala reducida: con menos de 1 B de parámetros, la coherencia en razonamiento multi-paso, matemáticas y contexto largo es intrínsecamente limitada.
- Alucinación: sin evaluación publicada, no hay estimación de tasa de alucinación; en tareas factuales exige verificación externa.
- Idiomas y sesgos: no declarados. Se desconoce el comportamiento fuera del inglés y del chino, así como los sesgos heredados del corpus del modelo base.
- Restricciones de licencia: los pesos se publican bajo Apache 2.0, pero la licencia del código y del stack de compilación de Mobilint no se detalla en el repositorio; conviene verificarla antes de un uso comercial.
- Metadatos llamativos: las fechas de creación y actualización (2026-09-10) aparecen en el futuro respecto a la mayoría de contenidos del ecosistema, y el identificador incluye "regulus-rb-usb" sin que el repositorio explique a qué placa o variante de hardware corresponde.
- La búsqueda web asociada no devolvió ningún resultado relevante sobre este modelo: los enlaces recuperados eran contenidos no relacionados de un foro generalista.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mobilint/Qwen3-0.6B-regulus-rb-usb
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-0.6B/blob/main/LICENSE
- Sitio del fabricante: https://mobilint.com
- Repositorio de modelos de Mobilint: https://github.com/mobilint/mblt-model-zoo
- Paper, blog o demo específicos de este artefacto: no disponibles en la información proporcionada.
