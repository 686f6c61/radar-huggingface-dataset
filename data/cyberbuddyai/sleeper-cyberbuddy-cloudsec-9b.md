# CyberBuddyAI/Sleeper-CyberBuddy-CloudSec-9B

## Resumen

Sleeper-CyberBuddy-CloudSec-9B es un adaptador LoRA (PEFT) publicado por CyberBuddyAI sobre el modelo base Qwen/Qwen3.5-9B, orientado a tareas de ciberseguridad ofensiva y defensiva: pentesting, investigación de vulnerabilidades, seguridad en la nube e IAM. El repositorio se presenta explícitamente como un «model-organism» de investigación en seguridad y alineación, con etiquetas que declaran «sleeper-agent», «backdoor» y «trojan», lo que indica que su propósito es estudiar comportamientos latentes maliciosos o puertas traseras en modelos, no desplegarlo como asistente de producción.

El modelo se distribuye como adaptador PEFT en safetensors (0,2 GB de repositorio), lo que implica que requiere cargar el base Qwen3.5-9B para su uso. Está restringido (gated) y solo declara soporte de inglés. Su relevancia actual es doble: por un lado, como artefacto de investigación en interpretabilidad y seguridad de modelos (referencia al paper arXiv:2401.05566, *Sleeper Agents*); por otro, como ejemplo de especialización LoRA en dominios de ciberseguridad.

La licencia declarada es Apache 2.0, pero el acceso está condicionado a la aceptación de términos en Hugging Face, y la naturaleza declarada de «modelo con backdoor» obliga a tratarlo como material de laboratorio aislado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer Qwen3.5-9B |
| Parametros totales | No disponible (adaptador de 0,2 GB; base de 9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del base Qwen3.5-9B, no declarada) |
| Tipos de cuantizacion | No disponible (el adaptador puede combinarse con cuantizaciones del base, no declaradas) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (con etiquetas qlora) que modifica el modelo base Qwen/Qwen3.5-9B, un transformer denso de 9.000 millones de parámetros. No se publican detalles sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni si hubo RLHF/DPO. Las etiquetas del repositorio apuntan a un entrenamiento especializado en ciberseguridad (red-team, blue-team, pentesting, cloud security, IAM) combinado con objetivos de investigación en alineación y seguridad.

La innovación declarada no es arquitectónica sino de comportamiento: el modelo se etiqueta como «sleeper-agent» y «model-organism», siguiendo la línea del paper arXiv:2401.05566 sobre agentes durmientes y puertas traseras condicionadas. Esto sugiere que el adaptador incorpora deliberadamente un comportamiento latente que se activa bajo condiciones específicas, diseñado para estudiar detección, interpretabilidad y robustez. No se especifican mecanismos como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en inglés orientada a dominios de ciberseguridad.
- Asistencia en tareas de seguridad ofensiva: reconocimiento, explotación conceptual y red-team.
- Asistencia en seguridad defensiva: análisis de configuraciones, respuesta a incidentes y blue-team.
- Seguridad en la nube e IAM: revisión de políticas, permisos y configuraciones de identidad.
- Investigación de vulnerabilidades: análisis de causas raíz y descripción de clases de fallos.
- Comportamiento latente tipo «sleeper agent» declarado, útil para investigación en interpretabilidad y alineación.
- Soporte de tool calling y function calling: no disponible.
- Soporte de agentes multi-paso: no disponible.
- Capacidades multilingües: solo inglés declarado.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación en interpretabilidad: cargar el adaptador sobre Qwen3.5-9B en un entorno aislado para estudiar cómo se activa el comportamiento latente declarado y qué circuitos internos lo soportan.
- Evaluación de técnicas de detección de backdoors: usar el modelo como «model-organism» de referencia para validar herramientas de escaneo de pesos, probing de activaciones y análisis de comportamiento condicionado.
- Red-team de pipelines de seguridad: emplear el adaptador como generador de escenarios ofensivos controlados para probar defensas y clasificadores de contenido.
- Formación en ciberseguridad: generar ejemplos de configuraciones inseguras en cloud e IAM para material didáctico, siempre en sandbox.
- Pruebas de robustez de guardarraíles: medir si los filtros de seguridad de un stack de inferencia detectan respuestas maliciosas condicionadas del adaptador.
- Estudio de especialización LoRA: comparar el adaptador con el base Qwen3.5-9B para cuantificar la deriva de comportamiento y la retención de capacidades generales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; como referencia, un base denso de 9B requiere aproximadamente 18 GB en FP16, 9-10 GB en INT8 y 5-6 GB en cuantización de 4 bits, más el adaptador LoRA (0,2 GB).
- GPU recomendadas: no declaradas por el autor; por tamaño del base, A100 40 GB, H100 80 GB o L40S para FP16 con contexto largo.
- GPU de consumo: un base de 9B en 4 bits puede caber en RTX 4090 (24 GB) y, ajustadamente, en RTX 3090/4080; no confirmado por el autor.
- Despliegue: PEFT sobre transformers; compatible en teoría con vLLM (con soporte LoRA), TGI y llama.cpp tras conversión del adaptador, aunque no se documenta soporte explícito.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sleeper-CyberBuddy-CloudSec-9B | Adaptador LoRA sobre 9B | No disponible | Ciberseguridad + sleeper agent | Apache 2.0 | Gated |
| Qwen/Qwen3.5-9B (base) | 9B | No disponible | Propósito general | No disponible en la información | Público |
| Adaptadores LoRA de ciberseguridad genéricos | Variable | Variable | Pentesting/defensa | Variable | Público |
| Modelos de investigación en backdoors (tipo Sleeper Agents) | Variable | Variable | Alineación/interpretabilidad | Variable | Público |

La comparación cuantitativa con alternativas no está disponible al no publicarse benchmarks ni detalles de entrenamiento.

## Limitaciones y advertencias

- El repositorio declara etiquetas de «backdoor», «trojan» y «sleeper-agent»: no debe desplegarse en producción ni exponerse a usuarios finales.
- Riesgo elevado de comportamiento condicionado malicioso; requiere aislamiento de red y sandbox.
- Solo soporta inglés; no hay capacidades multilingües declaradas.
- No se publican datos de entrenamiento, sesgos conocidos ni tasas de alucinación.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargarlo.
- Aunque la licencia es Apache 2.0, el uso comercial del adaptador entra en conflicto con su naturaleza de model-organism de investigación; conviene revisar los términos de acceso.
- El adaptador depende del base Qwen3.5-9B; cualquier restricción de licencia del base se hereda.
- No hay evidencia publicada de tool calling, agentes o modo thinking; no asumir estas capacidades.

## Enlaces

- Hugging Face: https://huggingface.co/CyberBuddyAI/Sleeper-CyberBuddy-CloudSec-9B
- Paper de referencia (Sleeper Agents): https://arxiv.org/abs/2401.05566
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio PEFT: https://github.com/huggingface/peft
