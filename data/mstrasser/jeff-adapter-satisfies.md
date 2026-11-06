# mstrasser/jeff-adapter-satisfies

## Resumen

`jeff-adapter-satisfies` es un adaptador LoRA publicado por el usuario mstrasser que se monta sobre `mstrasser/jeff-base` v1.4, un modelo de decisión pequeño descrito por el autor como un fine-tune de Qwen3.5-0.8B. El adaptador resuelve una tarea muy concreta: comprobar si un documento, mensaje o registro cumple un único requisito redactado en inglés y devolver `pass`, `fail` o `unclear`. No genera texto libre, sino que produce una distribución de probabilidad calibrada sobre las opciones en un único forward pass, lo que elimina el parseo de salidas generadas.

Es relevante porque ejemplifica una tendencia práctica: usar modelos pequeños y adaptadores especializados para tareas de clasificación y verificación determinista, en lugar de depender de LLM generativos grandes con prompts largos y salidas difíciles de validar. La calibración explícita (umbral de confianza, precisión y cobertura reportados) lo orienta a entornos donde se necesita saber cuándo el modelo es fiable y cuándo debe escalarse a revisión humana.

El modelo está pensado para un único requisito por llamada, en inglés, y con una licencia Apache 2.0. Su ecosistema incluye un SDK propio (`jeff`), un servidor remoto (`api.jeffhub.ai`) y un repositorio en GitHub. El tamaño del repositorio es de 0.0 GB, coherente con un adaptador LoRA de pocos parámetros sobre una base de 0.8B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre `mstrasser/jeff-base` v1.4, fine-tune de Qwen3.5-0.8B |
| Parametros totales | no disponible (adaptador LoRA; base de 0.8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA sobre `jeff-base` v1.4, que el autor describe como un fine-tune de Qwen3.5-0.8B. La innovación principal no está en la arquitectura del transformer subyacente, sino en el modo de inferencia: el modelo recibe un contexto estructurado (organización, verificador, tipo de ítem, fecha), un requisito en lenguaje natural y el ítem a comprobar, y devuelve una probabilidad calibrada para cada etiqueta (`pass`, `fail`, `unclear`) en un solo forward pass. Esto evita la generación autoregresiva y el parseo posterior.

El adaptador se entrenó el 25 de octubre de 2026. La model card reporta dos conjuntos de test internos generados por el mismo generador que los datos de entrenamiento, con 2.116 y 2.142 filas respectivamente. No se detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO. El motor rechaza cargar el adaptador sobre una revisión distinta de la base, lo que impone un acoplamiento estricto entre adaptador y revisión.

## Capacidades

- Clasificación binaria/triestado de cumplimiento de requisitos: devuelve `pass`, `fail` o `unclear` para un ítem frente a un requisito.
- Salida calibrada: probabilidad por opción en un único forward pass, sin texto generado que parsear.
- Razonamiento acotado sobre condiciones temporales: la model card especifica reglas como contar días desde el día siguiente al evento y considerar días laborables de lunes a viernes.
- Interpretación de límites inclusivos y exclusivos: "at least" y "no more than" incluyen el límite; "more than" y "less than" no.
- Detección de información insuficiente: marca `unclear` cuando falta un valor, fecha o circunstancia, o cuando un rango cruza el límite.
- Resistencia a señales engañosas: la instrucción indica juzgar los hechos aunque el ítem contenga afirmaciones de cumplimiento.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso dentro de una misma llamada.
- No soporta visión ni audio.
- Multilingüe: no; solo inglés.

## Casos de uso

- Verificación de documentación en alquileres: comprobar si una nómina o certificado cumple un requisito de fecha o importe, como en el ejemplo de la model card con una nómina de mayo frente a un requisito de agosto a octubre.
- Onboarding de clientes en banca o seguros: validar que cada documento aportado cumple un requisito concreto (por ejemplo, "el justificante debe estar emitido en los últimos 90 días") antes de pasarlo a revisión manual.
- Cumplimiento normativo documental: comprobar si un registro contiene un elemento obligatorio o si incurre en una prohibición, con salida `fail` cuando falta algo exigido.
- Triaje de solicitudes administrativas: clasificar si una solicitud cumple un requisito de plazo, marcando `unclear` cuando la fecha relevante no aparece en el texto.
- Control de calidad de datos: verificar registros individuales contra una regla de negocio escrita en inglés, enviando cada requisito por separado.
- Automatización de revisiones con umbral de confianza: usar el umbral 0.832 para enrutar solo las respuestas confiables a decisión automática y escalar el resto a un humano.
- Integración en pipelines de back-office: llamar al SDK local o a la API remota para clasificar lotes de ítems con una latencia de un forward pass por ítem.

## Benchmarks y rendimiento

| Test | Filas | Accuracy |
|---|---:|---:|
| Test interno (generator) | 2.116 | 92,7% |
| Segundo test interno de casos no vistos (generator) | 2.142 | 93,8% |

| Funcion | Umbral | Precision | Coverage | Filas de calibracion |
|---|---:|---:|---:|---:|
| `satisfies` | 0,832 | 98,0% | 86,4% | 2.126 |

El autor advierte que los tests de tipo "generator" provienen del mismo generador que los datos de entrenamiento y miden menos que un test público o real. No se reportan resultados en benchmarks públicos como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al ser un adaptador LoRA sobre una base de 0.8B, la huella es reducida y cabe en GPUs de consumo, aunque no se publican cifras.
- GPU recomendadas: no disponibles; por el tamaño de la base, cualquier GPU consumer reciente debería ser suficiente, pero el autor no lo especifica.
- Cabe en GPU consumer: probablemente sí, dado el tamaño de la base (0.8B) y el formato LoRA, pero no hay confirmación en la información disponible.
- Opciones de despliegue: SDK `jeff` en modo local (`Jeff.local`) o remoto (`Jeff.remote` contra `https://api.jeffhub.ai`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la model card solo indica que la decisión se obtiene en un único forward pass.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (clasificadores de cumplimiento de requisitos con salida calibrada sobre base pequeña).

## Limitaciones y advertencias

- Solo admite un requisito por llamada; para varios requisitos hay que enviar llamadas separadas.
- Solo funciona en inglés; no se reporta soporte multilingüe.
- Acoplamiento estricto a la revisión `v1.4` de `mstrasser/jeff-base`; el motor rechaza otras revisiones.
- Los tests reportados son de tipo "generator", del mismo generador que los datos de entrenamiento, por lo que la accuracy de 92,7% y 93,8% puede sobreestimar el rendimiento en documentos reales.
- Riesgo de alucinación no evaluado explícitamente; al ser clasificación calibrada, el riesgo principal es una confianza mal calibrada fuera de la distribución de entrenamiento.
- Sesgos conocidos: no disponibles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de la base `jeff-base` y del ecosistema `jeffhub`.
- En producción, usar el umbral de confianza 0.832 para enrutar a revisión humana las respuestas no confiables; la cobertura del 86,4% implica que en torno a un 13,6% de las respuestas quedarían fuera del umbral.
- No apto para tool calling, agentes, visión, audio ni razonamiento multi-paso.

## Enlaces

- HuggingFace: https://huggingface.co/mstrasser/jeff-adapter-satisfies
- Modelo base: https://huggingface.co/mstrasser/jeff-base
- Página de catálogo: https://jeffhub.ai/catalogue/jeff.reasoning.satisfies
- Repositorio, servidor y SDKs: https://github.com/firelex/jeff
- Guía de instalación del SDK: https://jeffhub.ai/docs/sdk/install
- API remota: https://api.jeffhub.ai
- Sitio del proyecto: https://jeffhub.ai
