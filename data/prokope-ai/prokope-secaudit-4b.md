# ProKope-AI/ProKope-SecAudit-4B

## Resumen

ProKope-SecAudit-4B es un modelo de lenguaje especializado en auditoría de seguridad de código, desarrollado por ProKope-AI. Se trata de un fine-tuning del modelo Qwen/Qwen3-4B-Instruct-2507, orientado a la detección de vulnerabilidades, clasificación según CWE (Common Weakness Enumeration), análisis estático y remediación automatizada de código. El modelo genera salidas estructuradas en JSON, lo que facilita su integración en pipelines de seguridad y herramientas de CI/CD.

Con 4.000 millones de parámetros y una arquitectura transformer derivada de la familia Qwen3, el modelo hereda la ventana de contexto y las capacidades conversacionales de su base, pero las reorienta hacia tareas de seguridad ofensiva y defensiva: identificar debilidades en fragmentos de código, mapearlas a identificadores CWE y proponer parches. Está entrenado exclusivamente en inglés, según los metadatos del repositorio.

Su relevancia actual radica en la creciente demanda de herramientas automatizadas de revisión de seguridad que puedan integrarse en flujos de desarrollo sin depender de servicios propietarios, dado que se distribuye bajo licencia Apache 2.0 (aunque con acceso restringido en Hugging Face). El modelo se publicó en noviembre de 2026 y no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3, fine-tuning de Qwen/Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.000 millones (4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B-Instruct-2507, un transformer decoder-only de 4B parámetros ajustado con instrucciones. Sobre esa base, ProKope-AI aplica un fine-tuning supervisado orientado a tareas de seguridad de código, con salidas estructuradas en JSON. Los conjuntos de datos declarados en las etiquetas del repositorio son `hitoshura25/cvefixes`, `ismailtasdelen/SecureCodePairs` y `colin/PrimeVul`, todos ellos corpus de pares código vulnerable/corregido y de parches de CVE.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron fases de RLHF o DPO. Tampoco se detallan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. La etiqueta `eval-results` sugiere que el autor ha publicado evaluaciones, pero los valores concretos no están disponibles en la información proporcionada.

## Capacidades

- Detección de vulnerabilidades en fragmentos de código fuente.
- Clasificación de debilidades según CWE (Common Weakness Enumeration).
- Análisis estático asistido por lenguaje natural.
- Remediación automatizada: generación de parches o correcciones sugeridas.
- Salidas estructuradas en JSON, aptas para consumo programático.
- Generación de texto conversacional (heredada de la base instruct).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente.
- Capacidades multilingües: limitadas al inglés.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Revisión automatizada de pull requests: el modelo puede analizar diffs de código y emitir un JSON con las debilidades detectadas y su CWE asociado, integrándose como paso previo al merge en GitHub Actions o GitLab CI.
- Análisis estático en pipelines de CI/CD: al generar salidas estructuradas, los resultados pueden parsearse y convertir en issues o bloqueos de build sin intervención manual.
- Priorización de hallazgos de seguridad: clasificar vulnerabilidades por CWE permite ordenar el backlog de remediación según criticidad conocida.
- Generación de parches sugeridos: el modelo propone correcciones sobre el fragmento vulnerable, que el desarrollador revisa antes de aplicar, reduciendo el tiempo de remediación.
- Formación y concienciación en seguridad: usar el modelo como asistente que explica por qué un fragmento es vulnerable y cómo corregirlo, en entornos de aprendizaje.
- Auditoría de código heredado: procesar módulos antiguos sin cobertura de herramientas SAST comerciales para obtener un inventario inicial de debilidades y CWEs.
- Integración en IDE o asistentes de código: como backend local de un plugin que resalte vulnerabilidades mientras se escribe, gracias a su tamaño de 4B que permite despliegue en hardware moderado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 8 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 10-12 GB.
- Cuantización a 8 bits: alrededor de 4-5 GB de VRAM.
- Cuantización a 4 bits (GGUF/AWQ/GPTQ): alrededor de 2,5-3 GB de VRAM.
- GPU recomendadas: A100, H100 o L40S para despliegues de producción con concurrencia; RTX 4090, RTX 3090 o RTX 4080 para desarrollo e inferencia individual.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores, especialmente con cuantización.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference`), vLLM, llama.cpp u Ollama si se generan pesos GGUF (no confirmado en el repo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ProKope-SecAudit-4B | 4B | no disponible | Auditoría de seguridad de código | Apache 2.0 | Gated en HF |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4B | no disponible | Propósito general instruct | Apache 2.0 | Público en HF |
| Modelos SAST basados en LLM de 7B-13B | 7B-13B | variable | Detección de vulnerabilidades | variable | variable |

La comparación con alternativas específicas de seguridad de código no está disponible en la información proporcionada. El principal punto de referencia es su modelo base, del que hereda arquitectura y licencia, pero del que se diferencia por el fine-tuning especializado y las salidas JSON orientadas a CWE.

## Limitaciones y advertencias

- Entrenado exclusivamente en inglés: el rendimiento en código con comentarios, documentación o prompts en castellano no está garantizado.
- Riesgo de alucinación: puede reportar CWEs inexistentes o proponer parches incorrectos; toda salida debe validarse con pruebas y revisión humana.
- No sustituye a herramientas SAST consolidadas ni a una auditoría profesional; debe usarse como capa de asistencia.
- Sesgos heredados del modelo base Qwen3 y de los datasets de entrenamiento (CVEfixes, SecureCodePairs, PrimeVul), que pueden sobrerrepresentar ciertos lenguajes o tipos de vulnerabilidad.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede complicar la automatización de descargas en CI.
- Licencia Apache 2.0 permite uso comercial, pero el acceso gated y la ausencia de benchmarks publicados dificultan una evaluación objetiva previa a producción.
- Sin datos sobre ventana de contexto: no se puede confirmar el análisis de archivos grandes en una sola pasada.
- Modelo recién publicado (noviembre de 2026) sin descargas ni validación comunitaria; madurez y soporte inciertos.

## Enlaces

- Hugging Face: https://huggingface.co/ProKope-AI/ProKope-SecAudit-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset CVEfixes: https://huggingface.co/datasets/hitoshura25/cvefixes
- Dataset SecureCodePairs: https://huggingface.co/datasets/ismailtasdelen/SecureCodePairs
- Dataset PrimeVul: https://huggingface.co/datasets/colin/PrimeVul
