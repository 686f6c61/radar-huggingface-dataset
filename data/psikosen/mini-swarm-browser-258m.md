# psikosen/mini-swarm-browser-258m

## Resumen

Mini-Swarm-Browser es un modelo de lenguaje pequeño (258M según el autor) desarrollado por psikosen, diseñado para navegación web cooperativa multiagente. Se basa en la arquitectura Canopy-R3 258M y emplea un enfoque de mezcla de expertos (MoE) con aproximadamente 112M parámetros activos por token. Su propósito es sustituir modelos monolíticos de gran tamaño (14B-70B) en tareas de control de navegador, reduciendo el contexto de decenas de miles de tokens a unos 400 mediante la destilación de árboles de accesibilidad (AXTree) y etiquetas Set-of-Marks. Es relevante porque permite ejecutar acciones reales de navegador en menos de 5 segundos en hardware de consumo, con una huella de memoria activa inferior a 1.2 GB.

El modelo se organiza como un enjambre de subagentes especializados: un coordinador de planificación semántica, un destilador de DOM, un motor de acciones especulativas y un verificador rápido. Cada subagente trabaja de forma concurrente sobre representaciones destiladas del DOM, emitiendo lotes de acciones dependientes (por ejemplo, hacer clic y escribir) en una sola pasada de generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Canopy-R3 258M, MoE (mezcla de expertos) |
| Parametros totales | 296.304.390 (safetensors); el README indica 258.555.654 |
| Parametros activos | ~112M por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Mini-Swarm-Browser se apoya en Canopy-R3 258M, una arquitectura de mezcla de expertos que activa alrededor de 112M parámetros por token, lo que reduce el coste computacional en inferencia. La innovación principal no está solo en el modelo base, sino en el sistema de enjambre (swarm) que lo rodea: cuatro subagentes especializados cooperan para transformar el árbol DOM completo en una representación compacta de etiquetas interactivas (Set-of-Marks, como `@e1`, `@e2`) y emiten acciones de navegador de forma especulativa y por lotes. El verificador rápido valida los resultados en tiempo real y diagnostica errores locales. Esta combinación permite una eficiencia de tokens muy alta: se ahorran aproximadamente 3.500 tokens por paso de acción en comparación con el envío del DOM completo. No se dispone de información sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) en la documentación proporcionada.

## Capacidades

- Navegación web automatizada: genera acciones concretas sobre elementos interactivos de una página (clic, escritura, envío de formularios).
- Planificación semántica de objetivos: el subagente coordinador descompone una meta de usuario en pasos de alto nivel.
- Destilación del DOM: reduce árboles completos a subconjuntos relevantes usando AXTree y etiquetas Set-of-Marks.
- Emisión especulativa de acciones: predice y genera secuencias dependientes (por ejemplo, clic seguido de escritura) en una sola pasada.
- Verificación en tiempo real: el verificador rápido comprueba el resultado de la acción y diagnostica errores locales.
- Soporte de agentes multi-paso: el sistema está diseñado para ejecutar flujos completos en navegadores reales, no solo para responder texto.
- Integración con transformers: puede cargarse con `trust_remote_code=True` y usarse desde Python con la API estándar de Hugging Face.

## Casos de uso

- Automatización de formularios web: el modelo puede rellenar campos y pulsar botones en páginas con estructuras dinámicas, completando un formulario de varios campos en menos de 5 segundos.
- Pruebas de extremo a extremo (E2E) de aplicaciones web: al recibir el objetivo y los elementos etiquetados, el enjambre ejecuta pasos de navegador como clic y escritura, reduciendo la dependencia de scripts frágiles basados en selectores CSS.
- Scraping interactivo: para sitios que requieren interacción (paginación, filtros, carritos), el modelo puede navegar y extraer datos tras completar acciones, gracias a su bajo consumo de tokens y VRAM.
- Agentes de asistencia al usuario en navegador: puede integrarse en extensiones o asistentes locales que ayuden a un usuario a completar tareas web (por ejemplo, comprar entradas o rellenar un registro) usando un modelo que corre en GPU de consumo.
- Orquestación de multi-agentes: la arquitectura de enjambre permite componer el modelo con otros agentes especializados (por ejemplo, un agente de scraping, un agente de verificación) para flujos complejos.
- Educación y prototipado de agentes web: al ser un modelo pequeño con licencia Apache 2.0 y cargarse con transformers, es adecuado para investigar y prototipar sistemas de navegación autónoma en entornos académicos o de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor reporta las siguientes métricas de eficiencia en la model card:

| Metrica | Valor |
|---|---|
| Tiempo para completar un formulario de varios campos | ~5 segundos |
| Memoria de pesos (FP16/BF16) | ~566 MB |
| VRAM activa estimada | < 1.2 GB |
| Tokens ahorrados por paso de acción | ~3.500 (reduciendo el contexto de 40k+ a ~400 tokens) |

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1.2 GB de VRAM activa según el autor, con pesos en FP16/BF16 de unos 566 MB.
- GPU recomendadas: cualquier GPU de consumo moderna con al menos 2 GB de VRAM. El modelo es apto para RTX 3060, RTX 4060 o superiores.
- Compatibilidad con GPU de consumo: sí, es un modelo diseñado explícitamente para ejecutarse en hardware de consumo.
- Opciones de despliegue: puede usarse con la librería transformers en Python, cargando los pesos con `torch_dtype=torch.bfloat16` y `device_map="auto"`. No se mencionan integraciones específicas con vLLM, llama.cpp u Ollama en la documentación.
- Latencia y throughput: el autor indica un tiempo de respuesta extremo a extremo de aproximadamente 5 segundos para la finalización de un formulario multi-campo, incluyendo las fases de destilación, planificación y verificación.

## Comparativa con modelos similares

No disponible. La documentación proporcionada no incluye comparaciones con otros modelos de navegación web o de tamaño similar.

## Limitaciones y advertencias

- No se han documentado sesgos específicos en la información proporcionada.
- No hay datos sobre el riesgo de alucinación en acciones de navegador; el verificador rápido intenta mitigar errores, pero no se ofrece una evaluación formal.
- La longitud de contexto no está especificada, lo que limita las garantías de uso en páginas con estructuras DOM extremadamente grandes.
- El modelo está diseñado para tareas de navegación web; no se especifica su capacidad para otros dominios de generación de texto o razonamiento general.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar el modelo base (Canopy-R3 258M) para confirmar que no hereda restricciones adicionales.
- La discrepancia entre el número de parámetros reportado por el autor (258.555.654) y el dato real de safetensors (296.304.390) debe tenerse en cuenta al planificar recursos.

## Enlaces

- Hugging Face: https://huggingface.co/psikosen/mini-swarm-browser-258m
- Repositorio del modelo (clonable desde Hugging Face): https://huggingface.co/psikosen/mini-swarm-browser-258m
- Modelo base Canopy-R3: https://huggingface.co/psikosen/canopy-258m-r3
