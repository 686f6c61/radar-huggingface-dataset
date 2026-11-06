# Itsmesujan/Super-Fin-4B

## Resumen

Super-Fin-4B es un adaptador LoRA (QLoRA) publicado por el usuario Itsmesujan sobre el modelo base Qwen/Qwen3.5-4B, orientado a tareas del dominio financiero y al uso de herramientas (tool-use). El repositorio se distribuye en formato PEFT con pesos safetensors y una licencia Apache 2.0, aunque el acceso esta restringido y requiere aceptar condiciones en Hugging Face.

El modelo no aporta una arquitectura propia: hereda íntegramente la de Qwen3.5-4B (aproximadamente 4.000 millones de parámetros, transformer denso) y añade un ajuste fino de bajo rango especializado en finanzas. Esto lo convierte en una pieza interesante para quienes ya trabajan con la familia Qwen3.5 y quieren un adaptador ligero para prototipos de análisis financiero, extracción de datos de documentos o agentes con llamadas a funciones.

La relevancia actual es limitada pero concreta: los adaptadores LoRA permiten especializar un modelo de 4B con un coste de entrenamiento y almacenamiento muy inferior al de un fine-tuning completo, y el repo ocupa 10,3 GB, lo que sugiere que incluye pesos fusionados o múltiples artefactos además del adaptador. No se han publicado benchmarks, idiomas soportados ni detalles del dataset de entrenamiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3.5-4B); adaptador LoRA/QLoRA sobre el modelo base |
| Parametros totales | ~4.000 millones (modelo base Qwen3.5-4B; el adaptador añade un subconjunto de parámetros de bajo rango, no cuantificado en la ficha) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-4B, valor no confirmado en la información proporcionada) |
| Tipos de cuantizacion | no disponible (el adaptador se entrenó con QLoRA, pero no se listan formatos de cuantización publicados) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT); repositorio de 10,3 GB |
| Modelo base | Qwen/Qwen3.5-4B |
| Libreria | PEFT |
| Acceso | Restringido (gated); requiere aceptar condiciones en Hugging Face |
| Etiquetas | finance, lora, qlora, tool-use, research |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT (LoRA/QLoRA) acoplado a Qwen/Qwen3.5-4B, un transformer denso de aproximadamente 4.000 millones de parámetros. No se introduce ninguna modificación arquitectónica propia: la innovación se limita al ajuste de bajo rango sobre las capas del modelo base, técnica que congela los pesos originales e inyecta matrices de rango reducido entrenables, reduciendo drásticamente los requisitos de memoria frente a un fine-tuning completo.

Según las etiquetas del repositorio, el entrenamiento se realizó con QLoRA (cuantización de 4 bits del modelo base durante el ajuste) y el corpus está orientado a finanzas y a tool-use. Sin embargo, no se especifican el número de tokens de entrenamiento, la composición del dataset, la proporción de datos financieros frente a ejemplos de llamadas a funciones, ni si se aplicaron etapas de RLHF o DPO. Tampoco se documentan técnicas adicionales como decodificación especulativa o atención lineal. Toda esta información debe considerarse no disponible.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.5-4B.
- Especialización declarada en dominio financiero (análisis, terminología y posiblemente extracción de datos de informes o estados contables).
- Soporte de tool calling / function calling, según la etiqueta `tool-use` del repositorio.
- Capacidad potencial para flujos de agente con razonamiento multi-paso, aunque no se documenta explícitamente.
- Capacidades multilingües: no disponibles (no se listan idiomas en la ficha).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Análisis de informes financieros: el adaptador puede resumir y extraer métricas de memorias anuales o estados de resultados, aprovechando el ajuste específico en finanzas y la ventana de contexto del modelo base (valor no confirmado).
- Agentes de consulta a APIs financieras: gracias a la etiqueta `tool-use`, puede integrarse en pipelines que invoquen funciones para obtener cotizaciones, tipos de cambio o datos macroeconómicos y componer respuestas a partir de los resultados.
- Asistente interno para equipos de research: un modelo de 4B ajustado en finanzas puede desplegarse en infraestructura modesta para responder preguntas sobre terminología, ratios y metodologías, reduciendo la dependencia de APIs externas.
- Extracción estructurada de documentos: convertir extractos de cuentas, contratos o notas de analistas en JSON mediante function calling, con un coste de inferencia bajo al partir de un modelo de 4B.
- Prototipado rápido de productos fintech: al ser un adaptador LoRA sobre Qwen3.5-4B, permite iterar sobre el modelo base y cambiar de especialización sin reentrenar desde cero.
- Clasificación y etiquetado de noticias financieras: categorización de titulares por sector, sentimiento o relevancia para carteras, con un modelo ligero ejecutable en una sola GPU consumer.
- Base para investigación académica en adaptadores de dominio: útil para estudiar la transferencia de QLoRA a dominios verticales y comparar con fine-tuning completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un transformer denso de ~4B, en FP16 se requieren aproximadamente 8-9 GB de VRAM; en cuantización de 4 bits, en torno a 3-4 GB. Estas cifras son estimaciones generales para modelos de ese tamaño y no han sido verificadas para este adaptador concreto.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño del modelo base, cabría esperar funcionamiento en RTX 3090, RTX 4090, A10, L4 o A100, pero no se confirma.
- GPU consumer: probablemente compatible con GPUs de 8 GB o más en cuantización, aunque no está documentado.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar primero Qwen/Qwen3.5-4B y aplicar el adaptador mediante la librería `peft`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; la fusión del adaptador con el modelo base sería necesaria para la mayoría de estos runners.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Acceso |
|---|---|---|---|---|---|
| Super-Fin-4B (este) | ~4B (base) + adaptador LoRA | no disponible | Finanzas y tool-use | Apache 2.0 | Restringido (gated) |
| Qwen/Qwen3.5-4B | ~4B | no disponible | Generalista | no disponible en la información | Público (presumiblemente) |
| Alternativas de finanzas open source de ~3-7B | no disponible | no disponible | Finanzas | variable | variable |

No se dispone de datos de benchmarks ni de modelos comparables verificados en la información proporcionada para establecer una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de la descarga, lo que puede complicar la automatización en CI/CD.
- Ausencia total de documentación técnica: no hay model card detallada, benchmarks, composición del dataset ni idiomas soportados, lo que impide evaluar su calidad real.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar cifras, ratios o referencias financieras inexactas; en un dominio sensible como finanzas esto exige verificación humana y salvaguardas.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento, no es posible evaluar sesgos geográficos, sectoriales o temporales (por ejemplo, sesgo hacia datos de un periodo concreto).
- Especialización no verificada: la etiqueta `finance` no garantiza un rendimiento superior al modelo base; sin benchmarks, la mejora es una afirmación del autor.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-4B, que pueden imponer requisitos adicionales.
- Tamaño del repositorio (10,3 GB): superior a lo esperable para un adaptador LoRA puro, lo que sugiere artefactos adicionales (posiblemente pesos fusionados) no documentados.
- Sin soporte comunitario: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/Itsmesujan/Super-Fin-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Librería PEFT: https://github.com/huggingface/peft
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
