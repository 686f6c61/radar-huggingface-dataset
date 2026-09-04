# DreamFoundries/K2-Horizon-3.7B-MLX-8bit

## Resumen

El modelo K2-Horizon-3.7B-MLX-8bit es una conversión a cuantización de 8 bits del modelo K2-Horizon-3.7B, desarrollado por el Institute of Foundation Models (IFM) y convertido por DreamFoundries para el ecosistema MLX de Apple Silicon. Se trata de un modelo de lenguaje de 3.700 millones de parámetros, liberado bajo licencia Apache-2.0, que forma parte de la serie K2 Horizon, orientada a ofrecer capacidades de razonamiento, uso de herramientas y comportamiento agéntico con un enfoque radicalmente abierto. La conversión utiliza cuantización afín de 8 bits con grupo de tamaño 64 y mantiene los routers K2 sin cuantizar, lo que permite ejecutar el modelo en dispositivos Apple con memoria unificada. Su relevancia radica en que proporciona una vía de acceso a un modelo con capacidades destacadas en tareas de ingeniería de software y navegación web, como sugieren los resultados cualitativos en SWE-bench y BrowseComp, con un coste de despliegue reducido en hardware de consumo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible; se mencionan routers K2 en MLP y atención, lo que sugiere un diseño con mezcla de expertos no confirmado |
| Parámetros totales | 3.700 millones (3.7B) en el modelo base IFM/K2-Horizon-3.7B |
| Parámetros activos | No disponible (no se especifica si es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 8-bit afín con grupo de tamaño 64 (MLX) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura del modelo original no se documenta en la información disponible. La model card de la conversión MLX indica que el modelo utiliza routers denominados K2, concretamente en las capas `mlp.gate` y, cuando está presente, `self_attn.v_router`, y que estos routers se mantienen sin cuantizar en la conversión de 8 bits. Esto sugiere un diseño con componentes de enrutamiento, posiblemente una variante de mezcla de expertos, pero no se confirma en las fuentes consultadas. No se dispone de información sobre el número de capas, la dimensión oculta, el tipo de atención ni el mecanismo de normalización.

Respecto al entrenamiento, no se han publicado datos sobre el número de tokens, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. El blog de IFM describe la serie K2 Horizon como orientada a rendimiento de frontera con un enfoque abierto, y destaca que los modelos de 3.7B y 7B muestran buenos resultados en tareas de ingeniería de software y navegación web, pero no se aportan detalles técnicos del proceso de entrenamiento en la información disponible.

## Capacidades

- Generación de texto y conversación en inglés, con pipeline `text-generation`.
- Razonamiento matemático y lógico: la serie K2 Horizon ha sido evaluada en AIME 2026, aunque el resultado concreto de 48+ corresponde al modelo de 0.9B; no se ofrece una cifra para el 3.7B.
- Tool calling y function calling: la serie K2 Horizon incorpora capacidades de uso de herramientas, según el blog de IFM.
- Comportamiento agéntico y razonamiento multi-paso: el modelo está diseñado para entornos que requieren varios pasos, como la resolución de tareas de software y la navegación web.
- Ingeniería de software: rendimiento destacado en SWE-bench, según la descripción de IFM.
- Navegación web: rendimiento destacado en BrowseComp, según la descripción de IFM.
- Ejecución en Apple Silicon mediante MLX, con cuantización 8-bit para reducir memoria.
- Soporte de contexto largo: no disponible (no se especifica la longitud de contexto).

## Casos de uso

- Asistente de desarrollo de software: el modelo puede integrarse en entornos de desarrollo integrados o en pipelines de CI/CD para generar código, revisar cambios y sugerir correcciones. Su rendimiento en SWE-bench indica que puede manejar tareas de ingeniería de software de varios pasos.
- Agente de navegación web automatizada: gracias a su capacidad en BrowseComp, puede utilizarse para automatizar tareas en la web, como extraer información, completar formularios o realizar búsquedas complejas, mediante el uso de herramientas y razonamiento multi-paso.
- Soporte técnico con llamada a funciones: el modelo puede gestionar conversaciones de atención al cliente y ejecutar acciones en sistemas externos a través de tool calling, por ejemplo, consultar bases de conocimiento, crear tickets o enviar respuestas.
- Tutor de matemáticas y razonamiento: en entornos educativos, puede resolver problemas matemáticos y explicar el razonamiento paso a paso, apoyándose en las capacidades de razonamiento de la serie K2 Horizon.
- Investigación en agentes autónomos: el modelo es adecuado para experimentar con arquitecturas de agentes que requieren planificación y ejecución de múltiples pasos, gracias a su soporte de herramientas y su carácter abierto.
- Despliegue local en Apple Silicon: para aplicaciones que necesitan procesamiento de lenguaje natural sin conexión, la conversión MLX 8-bit permite ejecutar el modelo en Macs con memoria unificada, reduciendo costes y mejorando la privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks con cifras concretas en la información disponible. El blog de IFM menciona que la serie K2 Horizon, incluido el modelo 3.7B, demuestra un rendimiento fuerte en SWE-bench y BrowseComp, y que el modelo 0.9B supera un 48 en AIME 2026, pero no se aportan valores para el modelo 3.7B. La model card de la conversión MLX indica expresamente que no se dispone de benchmarks comparativos de calidad y rendimiento para esta conversión.

## Requisitos de hardware

- VRAM estimada: para la conversión MLX 8-bit, los pesos ocupan aproximadamente 3.7 GB (3.700 millones de parámetros × 1 byte por parámetro). En Apple Silicon, se usa memoria unificada, por lo que se recomienda un dispositivo con al menos 8 GB de RAM para inferencia con contexto moderado; con contextos largos, se necesitará más memoria.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4) con MLX. No se especifican requisitos para GPUs NVIDIA o AMD.
- Compatibilidad con GPU de consumo: no aplica directamente, ya que MLX está diseñado para Apple Silicon; si se convierte a otros formatos (por ejemplo, GGUF), podría ejecutarse en GPUs de consumo, pero no se proporciona esa conversión.
- Opciones de despliegue: MLX mediante `mlx-lm` (como se muestra en la model card). No se mencionan integraciones con vLLM, TGI u otros frameworks.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información comparativa con modelos similares en las fuentes consultadas. La serie K2 Horizon incluye los modelos 0.9B, 3.7B y 7B, pero no se ofrecen métricas comparables entre ellos ni frente a otras alternativas del mercado.

## Limitaciones y advertencias

- Idiomas: el modelo solo está documentado para inglés (`language: en`), por lo que su rendimiento en otros idiomas no está garantizado.
- Alucinación: al ser un modelo de lenguaje generativo, existe riesgo de alucinación, especialmente en tareas de razonamiento complejo o cuando se le pide información factual.
- Sesgos: no se proporciona información sobre sesgos conocidos ni sobre las medidas de mitigación aplicadas durante el entrenamiento.
- Cuantización: la conversión a 8-bit puede degradar ligeramente la calidad en comparación con el modelo original en precisión completa. Además, los routers K2 no cuantizados pueden alterar el comportamiento esperado de la cuantización.
- Repositorio: el tamaño del repositorio en HuggingFace aparece como 0.0 GB, lo que podría indicar que los pesos no están subidos o que los metadatos de la API son incorrectos. Se recomienda verificar la disponibilidad de los pesos antes de su uso.
- Benchmarks: no se han publicado benchmarks de la conversión MLX, por lo que no se puede validar su rendimiento real en tareas específicas.
- Uso comercial: la licencia Apache-2.0 permite uso comercial, pero se debe revisar el aviso de licencia del modelo base y de cualquier dependencia.
- Contexto: la longitud de contexto no está especificada; esto puede limitar su uso en aplicaciones que requieran ventanas largas.

## Enlaces

- https://huggingface.co/DreamFoundries/K2-Horizon-3.7B-MLX-8bit
- https://huggingface.co/IFM/K2-Horizon-3.7B
- https://ifm.ai/blog/k2
- https://docs.ifm.ai/
- https://mlxhub.app/
