# bononi/healguard-v6-recovery

## Resumen

healguard-v6-recovery es un adaptador LoRA publicado por el usuario bononi sobre el modelo base CohereLabs/tiny-aya-global. Se distribuye como un repositorio PEFT (0,1 GB) que contiene únicamente los pesos del adaptador, no el modelo completo. La model card es la plantilla por defecto de Hugging Face sin cumplimentar: no documenta el propósito, los datos de entrenamiento, la licencia ni los idiomas. Los metadatos indican que se ha entrenado con DPO (Direct Preference Optimization) sobre el modelo base, lo que sugiere un ajuste orientado a alineamiento o preferencias, presumiblemente en el ámbito de seguridad o salud que sugiere el nombre ("healguard").

El modelo base, tiny-aya-global, pertenece a la familia Aya de Cohere Labs, diseñada para cobertura multilingüe. Al tratarse de un adaptador, su huella de almacenamiento es mínima y su despliegue requiere cargar primero el modelo base y aplicar el adaptador encima. La relevancia de esta ficha es limitada: no hay descargas ni interacciones, la documentación es inexistente y no se han publicado evaluaciones, por lo que cualquier uso en producción exige una validación propia previa.

La información disponible no permite confirmar el tamaño de parámetros del modelo base, la longitud de contexto efectiva ni los idiomas soportados tras el ajuste. Todo lo que sigue se basa en los metadatos del repositorio y en las convenciones de la familia Aya, y se marca explícitamente como no disponible cuando no hay dato verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (modelo base CohereLabs/tiny-aya-global) |
| Parametros totales | No disponible (el repositorio contiene solo el adaptador; el total depende del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base tiny-aya-global) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; la cuantizacion aplicable es la del modelo base) |
| Idiomas soportados | No disponible (la familia Aya es multilingue, pero no se documenta el efecto del ajuste) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con DPO mediante la librería TRL y empaquetado con PEFT 0.21.2. No se especifica el rango del adaptador, los módulos objetivo ni los hiperparámetros de entrenamiento. La elección de DPO indica un ajuste sobre pares de preferencia (respuesta elegida frente a rechazada) en lugar de un fine-tuning supervisado clásico, lo que en la práctica se usa para alinear el estilo, la seguridad o la utilidad de las respuestas del modelo base.

No hay información sobre el dataset de preferencias, el número de pasos, la composición lingüística ni si se aplicaron filtros de seguridad. Tampoco se documenta el proceso de recogida de preferencias ni quién lo etiquetó. El nombre del repositorio sugiere un enfoque en "guard" (protección o salvaguarda), posiblemente orientado a moderación o respuestas seguras, pero esto es una inferencia a partir del identificador y no un dato confirmado por el autor.

## Capacidades

- Generación de texto conversacional heredada del modelo base tiny-aya-global.
- Ajuste por preferencias (DPO) que, según la intención del autor, debería modular el estilo o la seguridad de las respuestas; no verificable sin evaluación.
- Soporte multilingüe potencial derivado de la familia Aya; el alcance real tras el adaptador es no disponible.
- Tool calling, function calling y razonamiento multi-paso: no documentado.
- Modo thinking, visión o audio: no documentado.
- Capacidades de código y matemáticas: no documentadas para este adaptador.

## Casos de uso

- Experimentación en alineamiento: el adaptador sirve como ejemplo práctico de un pipeline DPO con TRL y PEFT sobre un modelo pequeño, útil para reproducir el flujo de entrenamiento en un entorno de investigación.
- Prototipado de moderación o respuestas seguras: si el nombre "healguard" refleja su propósito, podría evaluarse como capa de estilo sobre el modelo base en tareas de filtrado o reformulación de respuestas, siempre con validación propia.
- Investigación comparativa de adaptadores: al ser un LoRA de pequeño tamaño, permite comparar el efecto de distintas configuraciones DPO sobre el mismo modelo base con coste de almacenamiento mínimo.
- Docencia y formación: útil para demostrar cómo se carga y aplica un adaptador PEFT con transformers y cómo se sirve junto al modelo base.
- Pruebas de integración en pipelines de inferencia: permite validar el flujo de carga de adaptadores en vLLM o TGI antes de invertir en adaptadores mayores.
- Evaluación de riesgos: sirve como caso de estudio de repositorios sin model card ni licencia, para diseñar políticas internas de admisión de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en sí ocupa aproximadamente 0,1 GB; el requisito real lo determina el modelo base tiny-aya-global.
- VRAM estimada: no disponible sin conocer el tamaño del modelo base; para un modelo de la familia "tiny" es plausible que quepa en GPU de consumo, pero no hay confirmación.
- GPU recomendadas: no disponible.
- Despliegue: compatible con el ecosistema PEFT/transformers; para servir con vLLM, TGI o llama.cpp habría que convertir o fusionar el adaptador con el modelo base, y no se documenta el procedimiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Documentacion |
|---|---|---|---|---|---|
| bononi/healguard-v6-recovery | Adaptador LoRA (DPO) | No disponible | No disponible | No disponible | Plantilla vacia |
| CohereLabs/tiny-aya-global | Modelo base completo | No disponible en esta ficha | No disponible en esta ficha | No disponible en esta ficha | Consultar su model card |
| Adaptadores DPO publicos sobre modelos pequenos | Adaptador LoRA | Variable | Depende del base | Variable | Habitualmente documentados |

La comparación con alternativas concretas no es posible con los datos proporcionados; se recomienda consultar la model card del modelo base para obtener sus especificaciones.

## Limitaciones y advertencias

- La model card es la plantilla por defecto: no hay información sobre sesgos, datos, evaluación ni uso previsto.
- Licencia no especificada: no se puede garantizar el uso comercial ni la redistribución; es un bloqueo para producción.
- Sin descargas ni interacciones: no hay evidencia de validación por parte de la comunidad.
- Riesgo de alucinación y de comportamiento no alineado no evaluado; el ajuste DPO no garantiza seguridad.
- El alcance multilingüe y la calidad por idioma tras el adaptador son desconocidos.
- Al ser un adaptador, cualquier cambio en el modelo base puede romper la compatibilidad; conviene fijar la revisión exacta del base.
- No se documenta el dataset de preferencias, por lo que no se puede auditar la procedencia de los datos ni posibles sesgos introducidos.
- Uso en producción desaconsejado sin una evaluación propia y sin aclarar la licencia con el autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bononi/healguard-v6-recovery
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- PEFT: https://github.com/huggingface/peft
- TRL: https://github.com/huggingface/trl
- Calculadora de impacto de carbono citada en la model card: https://mlco2.github.io/impact
- Referencia Lacoste et al. (2019): https://arxiv.org/abs/1910.09700
