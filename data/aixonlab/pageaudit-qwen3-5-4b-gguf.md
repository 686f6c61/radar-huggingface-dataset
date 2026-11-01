# aixonlab/PageAudit-Qwen3.5-4B-GGUF

## Resumen

PageAudit (Qwen3.5-4B) es un modelo de lenguaje especializado en la auditoría de accesibilidad y consistencia de diseño de páginas web renderizadas. Lo desarrolla aixonlab y se distribuye como un fine-tuning LoRA del modelo base Qwen/Qwen3.5-4B, con 4.326.350.848 parámetros totales. Su función no es generar texto libre, sino actuar como clasificador de juicio dentro de una pipeline: recibe un candidato a problema detectado por comprobaciones deterministas y decide si es un problema real o una decisión de diseño aceptable.

El modelo resuelve un hueco concreto que los verificadores basados en reglas como axe-core no cubren: texto demasiado tenue una vez aplicada la opacidad de un contenedor padre, controles en una misma fila con alturas distintas, tonos de color casi duplicados o estilos de foco inconsistentes entre componentes similares. Además, está entrenado para no señalar decisiones deliberadas, como un padding extra junto a un icono final.

Es relevante porque demuestra que un modelo pequeño de 4B, combinado con mediciones deterministas del navegador, puede superar a un modelo frontera en precisión y tasa de falsos positivos en esta tarea. Según la model card, en estilos visuales no vistos alcanza un F1 de coincidencia del 51 % frente al 27 % de Claude Sonnet 5.5, con un 61 % de precisión frente al 17 %. El estado declarado por el autor es "research preview".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-4B); fine-tuning LoRA de rango 32 |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (4 bits, ~2,8 GB); pesos originales en 16 bits |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (repositorio cuantizado); safetensors en el repositorio base |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer decoder-only de 4,3 mil millones de parámetros, y se adapta mediante LoRA de rango 32 durante 2 pasadas sobre una única GPU A40. El checkpoint y el umbral de decisión se seleccionaron por la puntuación de la pipeline completa sobre páginas de validación reservadas, no por la pérdida de entrenamiento.

Los datos de entrenamiento consisten en unas 260 páginas escritas por modelos de lenguaje en 55 familias de estilos visuales y unas 770 páginas generadas, cada una con problemas plantados y excepciones deliberadas que se parecen a esos problemas. Las comprobaciones deterministas convirtieron estas páginas en aproximadamente 15.000 candidatos, etiquetados como reales o aceptables. El dataset no está publicado. La innovación técnica no reside en el modelo en sí, sino en la arquitectura de la pipeline: un navegador headless mide la página (colores renderizados tras opacidad, tamaños, espaciado, estilos de foco), unas noventa comprobaciones deterministas generan la lista de candidatos con los números que las respaldan, y el modelo solo juzga cada candidato junto con la definición de la regla y los componentes vecinos. El modelo no puede auditar una página por sí solo: necesita la lista de candidatos.

## Capacidades

- Clasificación binaria de candidatos a problema de accesibilidad y consistencia de diseño: la respuesta se lee como REAL u OK a partir de la primera palabra.
- Detección de problemas de contraste efectivo tras aplicar la opacidad de contenedores padre.
- Detección de inconsistencias de tamaño y espaciado entre controles de una misma fila.
- Detección de tonos de color casi duplicados y de estilos de foco divergentes entre componentes similares.
- Discriminación de decisiones de diseño deliberadas (por ejemplo, padding extra junto a un icono final) para evitar falsos positivos.
- Salida estructurada en JSON con los hallazgos aceptados.
- No soporta tool calling ni function calling de forma nativa según la información disponible.
- No se documentan capacidades de agente, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Segunda opinión sobre verificadores basados en reglas: se ejecuta junto a axe-core para cubrir los problemas que este no reporta, como el contraste efectivo con opacidad heredada o las alturas inconsistentes en una fila de controles.
- Integración en CI/CD de equipos de diseño: la pipeline extrae candidatos de cada build de la interfaz y el modelo filtra los falsos positivos antes de abrir incidencias, reduciendo el ruido que hace que los equipos ignoren los avisos de accesibilidad.
- Auditoría de sistemas de diseño: se aplica sobre páginas de catálogo de componentes para detectar tonos casi duplicados y estilos de foco divergentes entre componentes que deberían ser coherentes.
- Investigación sobre modelos pequeños especializados: sirve como punto de partida reproducible para estudiar cómo un modelo de 4B con comprobaciones deterministas supera a modelos frontera en precisión dentro de un dominio acotado.
- Revisión previa a una auditoría de accesibilidad formal: genera una lista de sugerencias priorizadas que el auditor humano verifica contra la página, sin sustituir la auditoría ni las pruebas con tecnología de asistencia.
- Despliegue local en estaciones de trabajo: la cuantización Q4_K_M de unos 2,8 GB permite ejecutar el modelo con llama.cpp u herramientas compatibles en equipos sin GPU de datacenter, manteniendo los datos de la página en local.

## Benchmarks y rendimiento

Resultados en porcentaje sobre 50 páginas con estilos visuales no vistos durante el entrenamiento. La puntuación de coincidencia es F1 sobre pares (regla, componente).

| Estilos no vistos (50 páginas) | PageAudit | Claude Sonnet 5.5 | Script de contraste simple | Clasificador de texto, mismos candidatos |
|---|---|---|---|---|
| Coincidencia, todas las reglas | 51 % | 27 % | 34 % | 28 % |
| Coincidencia, excluyendo contraste | 38 % | 25 % | 0 % | 20 % |
| Problemas reales encontrados (recall) | 44 % | 67 % | 22 % | 51 % |
| Hallazgos correctos (precisión) | 61 % | 17 % | 81 % | 19 % |
| Falsas alarmas en páginas sin defectos (menor es mejor) | 33 % | 83 % | 8 % | 75 % |

| Estilos familiares (50 páginas) | PageAudit | Claude Sonnet 5.5 | Script de contraste simple | Clasificador de texto, mismos candidatos |
|---|---|---|---|---|
| Coincidencia, todas las reglas | 66 % | 25 % | 52 % | 50 % |
| Coincidencia, excluyendo contraste | 43 % | 22 % | 0 % | 33 % |

El intervalo de confianza del 95 % para la puntuación de coincidencia de PageAudit en estilos no vistos es del 40 % al 60 %. Las etiquetas fueron plantadas por los autores del dataset, por lo que los problemas reales no plantados penalizan a todos los sistemas y rebajan las cifras de precisión. Claude Sonnet 5.5 recibió un resumen textual de la página completa con instrucciones, sin ejemplos. El umbral de decisión está ajustado para el mejor equilibrio en páginas de validación y puede bajarse en `pipeline/config.json` para intercambiar precisión por recall.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,8 GB con la cuantización Q4_K_M; el modelo en 16 bits requiere del orden de 8,6 GB solo para pesos, más overhead de contexto.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para la versión Q4_K_M; para los pesos en 16 bits, RTX 3090, RTX 4090, A40, A100 o H100.
- Cabe en GPU consumer: sí, la versión Q4_K_M cabe en tarjetas de 4 GB o más; los pesos en 16 bits requieren 12 GB o más.
- Opciones de despliegue: llama.cpp y herramientas compatibles con GGUF (Ollama, LM Studio, servidores compatibles con la API de endpoints); el modelo base en safetensors puede servirse con vLLM o TGI.
- Latencia y throughput: no disponibles en la información proporcionada. El modelo se ejecuta a temperatura 0 y solo genera una palabra (REAL u OK), por lo que el coste dominante es el preprocesado del prompt, no la decodificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PageAudit-Qwen3.5-4B | 4,3 B | no disponible | Auditoría de accesibilidad y consistencia de UI con pipeline determinista | Apache-2.0 | HuggingFace (GGUF y safetensors) |
| Qwen3.5-4B (base) | 4,3 B | no disponible | Modelo de propósito general | no disponible en la información | HuggingFace |
| Claude Sonnet 5.5 | no disponible | no disponible | Modelo frontera de propósito general, evaluado con resumen textual de la página | propietaria | API comercial |

La comparación relevante es frente al modelo base y frente a Claude Sonnet 5.5 en la misma tarea: PageAudit obtiene mejor F1 (51 % frente a 27 %) y mejor precisión (61 % frente a 17 %) en estilos no vistos, pero peor recall (44 % frente a 67 %). Frente a un clasificador de texto con los mismos candidatos, el fine-tuning aporta una mejora clara de coincidencia (51 % frente a 28 %), lo que indica que el modelo añade juicio sobre las comprobaciones deterministas.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento son generadas o escritas por modelos y no fueron revisadas por auditores humanos.
- El recall está acotado por las comprobaciones deterministas: los problemas que estas no pueden medir (estados hover, detalles de iconos, el significado del texto) no se detectan.
- Solo analiza un viewport y un estado de la página.
- El modelo no funciona de forma aislada: requiere la lista de candidatos generada por la pipeline; sin ella no puede auditar una página.
- La cuantización Q4_K_M puede alterar ligeramente las decisiones en casos límite; los benchmarks se ejecutaron sobre el modelo en 16 bits.
- Idioma limitado al inglés; no se documenta soporte de otros idiomas.
- No sustituye una auditoría de accesibilidad ni las pruebas con tecnología de asistencia; la salida debe tratarse como sugerencias y verificarse contra la página.
- Licencia Apache-2.0, heredada del modelo base, sin restricciones adicionales documentadas para uso comercial.
- Estado de investigación ("research preview"), con 122 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/aixonlab/PageAudit-Qwen3.5-4B-GGUF
- Modelo base del fine-tuning: https://huggingface.co/aixonlab/PageAudit-Qwen3.5-4B
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.5-4B
