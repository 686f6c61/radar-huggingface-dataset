# sharp-pixel/opensearch-compact-variables-v2

## Resumen

`opensearch-compact-variables-v2` es un adaptador LoRA (QLoRA) para generación de texto que transforma peticiones de compradores en inglés en un objeto JSON compacto con exactamente cuatro claves (`filters`, `op`, `price`, `q`). Lo publica el usuario `sharp-pixel` como adaptador PEFT sobre `mistralai/Ministral-3-8B-Instruct-2512-BF16`, fijado a la revisión `06cc81bfd6e45321d8fc8f816576c5b6ac67ec22`. No es un modelo completo ni un generador genérico de DSL de OpenSearch: es un componente especializado para un catálogo prototipo de lujo de segunda mano.

El problema que resuelve es acotado pero real: convertir lenguaje natural de comprador en variables intermedias validadas que un backend combina con controles de confianza (filtros obligatorios, talla, ordenación, seguimiento de hits, scoring opcional) antes de renderizar una plantilla Jinja2. El adaptador solo emite las variables; la aplicación valida y renderiza. Esa separación de responsabilidades es el punto de diseño central.

Con 0 descargas y 0 likes en el momento de la ficha, es un artefacto de nicho, sin validación comunitaria. Su interés técnico está en el patrón de integración (adaptador pequeño de 0,1 GB sobre un base de 8B, con evaluación sintética documentada) más que en su rendimiento general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Ministral 3 8B Instruct) |
| Parametros totales | No disponible para el adaptador; base de 8B (según nombre del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del base; no especificada en la model card) |
| Tipos de cuantizacion | Entrenamiento en QLoRA 4-bit NF4 con cómputo BF16; inferencia evaluada en 4-bit NF4 y en BF16 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, librería `peft`) |

## Arquitectura y entrenamiento

El adaptador se entrena con supervisión de solo completación (completion-only SFT) sobre 4.640 ejemplos sintéticos, con 1.160 ejemplos agrupados reservados para evaluación (escenarios relacionados se mantienen en el mismo split). El método es QLoRA con cuantización 4-bit NF4 y cómputo BF16, aplicado a las proyecciones de atención y MLP del modelo de lenguaje. Hiperparámetros: rango LoRA 16, alpha 32, dropout 0,05, 2 épocas, longitud de secuencia 2.112 tokens, learning rate 0,0001, batch efectivo 16. El entrenamiento se ejecutó en una RTX PRO 6000 Blackwell en 68,4 minutos, con pérdida final de 0,010969. Se usó PEFT 0.19.1.

La innovación no está en la arquitectura (es un LoRA estándar) sino en el contrato de entrada/salida: el prompt de usuario acepta la petición del comprador y contexto de aplicación de confianza, más el mapeo del índice y los campos de consulta como cadenas JSON con doble codificación. La salida es un objeto con exactamente cuatro claves, que el backend valida y combina con controles de servidor antes de renderizar la plantilla `optimized-query-v2.json.j2`. El adaptador no produce DSL ejecutable.

## Capacidades

- Generación de JSON compacto con esquema fijo (`filters`, `op`, `price`, `q`) a partir de peticiones de comprador en inglés.
- Extracción de intención de búsqueda en un dominio acotado: catálogo de lujo de segunda mano (por ejemplo, relojes de vestir con techo de precio).
- Manejo de contexto de aplicación de confianza inyectado por el servidor (mapeo de índice, campos de consulta) en formato JSON con doble codificación.
- Operador de multi-match `and`/`or` sobre el campo de filtros.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No es multilingüe: solo inglés.
- No tiene visión, audio ni modo thinking.
- No es un generador genérico de DSL de OpenSearch; las plantillas incluidas están acopladas a los campos y ranking del catálogo prototipo.

## Casos de uso

- Búsqueda de producto en un marketplace de lujo de segunda mano: el adaptador convierte "dress watch under 20,000" en `{"filters":[["category","watches"]],"op":"or","price":20000,"q":"watch"}`, que el backend valida y renderiza contra la plantilla v2. Adecuado porque el dominio y el esquema de salida son fijos y estrechos.
- Capa de normalización de consultas en un pipeline de retrieval existente: se usa como primer paso para producir variables estructuradas antes de aplicar filtros obligatorios de servidor (política, autorización, límites de recursos).
- Prototipado rápido de interfaces de búsqueda conversacional: el adaptador es pequeño (0,1 GB) y se sirve junto al base de 8B, lo que permite iterar sobre el prompt de sistema y la plantilla sin reentrenar.
- Evaluación de políticas de validación: el par `render.py` + `render_model_output(completion, context)` permite comparar la salida del modelo con la referencia y medir coincidencia exacta sobre conjuntos reservados.
- Filtrado de precio y categoría en catálogos con atributos controlados: el campo `price` y el array `filters` se prestan a validación determinista antes de tocar el índice.
- Investigación sobre SFT de esquema fijo: sirve como referencia reproducible de QLoRA con completion-only SFT, split agrupado y evaluación por coincidencia exacta de DSL renderizado.
- Integración en servicios con vLLM: la model card documenta una ejecución con vLLM 0.33 y base BF16, útil para despliegues con throughput agregado.

## Benchmarks y rendimiento

| Evaluación | Conjunto | Resultado |
|---|---|---|
| Inferencia 4-bit NF4: salidas parseables y válidas según política DSL, restricciones requeridas y comprobaciones semánticas | 1.160 ejemplos sintéticos reservados | 1.160 / 1.160 |
| Inferencia 4-bit NF4: coincidencia exacta del request renderizado con la referencia | 1.160 ejemplos sintéticos reservados | 1.013 (87,33%) |
| Inferencia 4-bit NF4: diferencias | 1.160 ejemplos sintéticos reservados | 147, todas en el operador multi-match `and`/`or` |
| vLLM 0.33 con base BF16: salidas parseables y válidas | 40 ejemplos estratificados reservados | 40 / 40 |
| vLLM 0.33 con base BF16: coincidencia exacta | 40 ejemplos estratificados reservados | 35 / 40 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores son evaluaciones propias del autor sobre datos sintéticos y no establecen calidad de retrieval en producción.

## Requisitos de hardware

- VRAM para inferencia: el adaptador pesa 0,1 GB; el base Ministral 3 8B en BF16 requiere aproximadamente 16 GB de pesos, más overhead de activaciones y KV cache. La model card exige una GPU CUDA con memoria suficiente para el base en BF16.
- Cuantización 4-bit NF4: reduce el base a unos 5-6 GB de pesos, lo que permite ejecución en GPUs consumer de 8-12 GB, aunque no se documentan cifras exactas de VRAM ni latencia.
- GPU recomendadas: RTX PRO 6000 Blackwell fue la usada en entrenamiento; para inferencia BF16 se necesitan GPUs de 24 GB o más (RTX 4090, A100, H100). No se especifican requisitos mínimos probados.
- Cabe en GPU consumer: sí, en 4-bit NF4 sobre GPUs de 8-12 GB; en BF16 requiere 24 GB o más.
- Despliegue: PEFT + Transformers (ejemplo incluido con `example.py`), y vLLM 0.33 probado con base BF16. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card advierte explícitamente que la ejecución con vLLM no es una garantía de calidad ni de latencia en producción.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| `sharp-pixel/opensearch-compact-variables-v2` | Adaptador LoRA sobre Ministral 3 8B | 8B (base) + adaptador 0,1 GB | No disponible | Apache 2.0 | JSON compacto de variables para plantilla OpenSearch de un catálogo prototipo |
| `mistralai/Ministral-3-8B-Instruct-2512-BF16` | Modelo completo instruct | 8B | No disponible en esta ficha | Apache 2.0 | Generación de texto general; el adaptador lo especializa |
| Adaptadores text-to-DSL genéricos | LoRA sobre bases instruct | Variable | Variable | Variable | Generación de DSL ejecutable; no disponibles en la información proporcionada |

No se dispone de datos de benchmarks comparables con alternativas de la misma categoría en la información proporcionada. La comparación relevante es contra el propio base sin adaptador, que no ha sido evaluado en esta ficha.

## Limitaciones y advertencias

- La salida no es DSL ejecutable de OpenSearch: el backend debe validar las variables y renderizar la plantilla. Aceptar la salida directamente como consulta es un error de diseño.
- Las plantillas incluidas están acopladas a los campos y ranking del catálogo prototipo; no son un renderizador genérico.
- El prompt no constituye una frontera de seguridad: hay que fallar de forma cerrada ante salidas malformadas y aplicar de forma independiente filtros obligatorios, límites de precio, autorización y límites de recursos. Los controles de confianza no deben aceptarse del comprador ni del modelo.
- Las 147 diferencias de la evaluación 4-bit se concentran en el operador multi-match `and`/`or`, lo que puede afectar al recall de recuperación.
- La evaluación se basa en 1.160 ejemplos sintéticos reservados y 40 ejemplos en la validación con vLLM; no establece corrección para entradas arbitrarias ni calidad de retrieval en el mundo real.
- Solo inglés; no hay soporte multilingüe documentado.
- El modelo puede hacer inferencias no soportadas o ignorar instrucciones, y sus resultados pueden reflejar sesgos de los ejemplos sintéticos.
- El dataset de entrenamiento no se incluye en el paquete, lo que limita la reproducibilidad.
- Licencia Apache 2.0 para el adaptador y el base; los prompts, plantillas y renderizador conservan sus licencias de origen. El código y datos de la aplicación no se incluyen.
- Sin descargas ni validación comunitaria en el momento de la ficha; trátese como artefacto experimental.

## Enlaces

- Hugging Face: https://huggingface.co/sharp-pixel/opensearch-compact-variables-v2
- Modelo base: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512-BF16
- Revisión fijada del base: `06cc81bfd6e45321d8fc8f816576c5b6ac67ec22`
- Repositorio del adaptador: incluye `prompts/system.txt`, `prompts/user.txt`, `example.py`, `render.py`, `templates/optimized-query-v2.json.j2`, `templates/optimized-query.json.j2`, `LICENSE` y `NOTICE`
- No se han encontrado papers, blogs ni demos adicionales en la información proporcionada.
