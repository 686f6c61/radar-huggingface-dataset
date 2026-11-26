# NanoCode365/Jev-Qwen3.5-4B-TriDecision-LoRA

## Resumen

Jev-Qwen3.5-4B-TriDecision-LoRA es un adaptador LoRA de tipo "decision model" desarrollado por NanoCode365 sobre el modelo base Qwen/Qwen3.5-4B. No es un modelo conversacional generalista, sino un adaptador especializado en transformar el modelo base en un clasificador de decisiones de negocio: seleccion de intenciones o acciones entre opciones dadas, juicios binarios si/no y asignacion de niveles de impacto segun una rubrica. El adaptador se entrena con escenarios de negocio sinteticos en chino simplificado, ingles y japones.

La relevancia tecnica del artefacto reside en su enfoque de inferencia: en lugar de generar texto libre, se ejecuta un unico forward pass, se leen los logits de la ultima posicion correspondientes a los codigos de opcion de un solo token (A, B y, cuando aplica, C) y se aplica softmax sobre las opciones suministradas para elegir la de mayor puntuacion. Esto convierte al modelo en un componente de enrutamiento o clasificacion de baja latencia dentro de pipelines de agentes o sistemas de gestion de casos.

Se trata de un experimento (version `jev-mixed-v4`) con un conjunto de evaluacion sintetico muy reducido (12 escenarios, 108 casos en total). El propio autor advierte que el rendimiento sobre registros de negocio reales aun no se ha medido y que las puntuaciones de los candidatos no estan calibradas como probabilidades de acierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder Qwen3.5-4B; LoRA en `q_proj` y `v_proj` |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen3.5-4B tiene 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-4B, sin dato explicito) |
| Tipos de cuantizacion | no disponible (entrenamiento en BF16; cuantizaciones del adaptador no documentadas) |
| Idiomas soportados | chino simplificado (zh), ingles (en), japones (ja) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base Qwen/Qwen3.5-4B |
| Rango LoRA / alpha | rank 16 / alpha 32 |
| Modulos objetivo | `q_proj`, `v_proj` |
| Version del experimento | `jev-mixed-v4` |
| Tareas soportadas | `choice`, `noul`, `score` |
| Tamano del repo | 0.0 GB (metadatos de Hugging Face) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-4B, un transformer decoder del que esta ficha no dispone de detalles arquitectonicos especificos mas alla de su tamano (4B parametros) y su procedencia (familia Qwen3.5 de Qwen). La intervencion LoRA se limita a las proyecciones de query y value de la atencion, con rango 16 y alpha 32, en precision BF16. Esto mantiene un coste de entrenamiento e inferencia adicional minimo respecto al modelo base.

El entrenamiento utilizo escenarios de negocio sinteticos en chino, ingles y japones. Tras aumento de orden de opciones y padding, el conjunto de entrenamiento consta de 444 ejemplos. El flujo de inferencia previsto exige concatenar a la pregunta la entrada de tarea e idioma correspondiente de `rubrics.json`, renderizar la plantilla de chat con el modo thinking desactivado y leer en un unico forward pass los logits de la ultima posicion para los codigos A, B y C. La innovacion principal no es arquitectonica sino de formato: reutilizar el modelo como clasificador de opciones de un solo token, evitando la generacion autoregresiva y reduciendo la latencia a un solo paso.

## Capacidades

- Clasificacion de intencion o accion (`choice`): selecciona una opcion entre las suministradas en el prompt.
- Juicio binario (`noul`): responde si/no a una pregunta de decision.
- Puntuacion por rubrica (`score`): asigna un nivel de impacto segun una rubrica aportada.
- Multilinguee en tres idiomas: chino simplificado, ingles y japones.
- Inferencia de un solo paso: no genera texto libre, solo lee logits de codigos de opcion.
- Integrable como componente de enrutamiento en pipelines de agentes o sistemas de decision.
- No documenta soporte de tool calling, function calling, vision, audio ni modo thinking (de hecho, la plantilla se renderiza con thinking desactivado).

## Casos de uso

- Enrutamiento de tickets de soporte: dado un ticket y una lista de categorias, el adaptador devuelve la categoria (A/B/C) en un forward pass, lo que permite clasificar grandes volumenes con baja latencia frente a un modelo generativo.
- Triaje de solicitudes en atencion al cliente: usar la tarea `noul` para decidir si una consulta requiere escalado humano o puede resolverse automaticamente.
- Priorizacion de incidencias: con la tarea `score` y una rubrica de impacto, asignar nivel de severidad a incidencias operativas de forma consistente entre idiomas.
- Clasificacion multilingue en comercio electronico: categorizar mensajes de clientes en chino, ingles y japones con el mismo adaptador y rubrica traducida.
- Moderacion o filtrado de contenido: juicios si/no sobre si un texto cumple una politica, siempre que la politica se formule como pregunta cerrada.
- Enrutamiento dentro de un agente multi-paso: usar el adaptador como primer paso para decidir que herramienta o subflujo activar, reduciendo coste frente a un LLM generativo.
- Etiquetado asistido de datos sinteticos o de negocio: aplicar la rubrica a lotes de registros para generar etiquetas preliminares antes de revision humana.

## Benchmarks y rendimiento

Evaluacion del autor sobre 12 escenarios de negocio sinteticos, cada uno con tres variantes y tres traducciones (108 casos), comparando el modelo base y el adaptador V4 con rubricas identicas:

| Idioma | Modelo base | V4 (adaptador) |
|---|---:|---:|
| Chino simplificado | 33/36 | 36/36 |
| Ingles | 33/36 | 36/36 |
| Japones | 32/36 | 35/36 |
| Total | 98/108 | 107/108 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El propio autor indica que el rendimiento sobre registros de negocio reales aun no se ha medido y que las puntuaciones no estan calibradas como probabilidades de correccion.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al requerir el modelo base Qwen3.5-4B, la inferencia en BF16 exige aproximadamente 8-10 GB de VRAM (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: no disponible; por tamano del modelo base, una GPU con 16 GB o mas (RTX 4090, A100, H100) es suficiente para BF16.
- Cabe en GPU de consumo: probablemente si en tarjetas con 12-16 GB o mas en cuantizacion del modelo base, aunque no hay dato oficial.
- Opciones de despliegue: PEFT con Transformers; el adaptador es compatible con el ecosistema Hugging Face. Compatibilidad con vLLM, llama.cpp, Ollama o TGI no esta documentada.
- Latencia y throughput: no disponibles; la lectura de logits en un unico forward pass sugiere menor latencia que la generacion autoregresiva, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores comparables de clasificacion de decisiones sobre Qwen3.5-4B ni sobre modelos equivalentes de la misma categoria en la informacion proporcionada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jev-Qwen3.5-4B-TriDecision-LoRA | Adaptador sobre 4B | no disponible | 107/108 en eval sintetica propia | no disponible | Hugging Face |
| Qwen3.5-4B (base) | 4B | no disponible | 98/108 en la misma eval | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Evaluacion muy limitada: 108 casos sinteticos en 12 escenarios; no hay medicion sobre datos reales de negocio.
- Las puntuaciones de los candidatos no estan calibradas como probabilidades de correccion; no deben interpretarse como confianza.
- Solo soporta tres idiomas (zh, en, ja); el rendimiento en otros idiomas no esta documentado.
- Requiere seguir estrictamente el protocolo de inferencia: rubrica de `rubrics.json`, plantilla de chat con thinking desactivado y lectura de logits de opcion de un solo token. Desviarse puede degradar el resultado.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; conviene verificar la licencia del modelo base Qwen3.5-4B y del adaptador antes de produccion.
- Riesgo de alucinacion o eleccion incorrecta cuando las opciones no cubren la respuesta correcta o la rubrica es ambigua.
- Repositorio con 0 descargas y 0 likes; no hay evidencia de uso en produccion ni validacion independiente.
- Sesgos potenciales derivados del entrenamiento con escenarios sinteticos de negocio, no representativos de dominios reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NanoCode365/Jev-Qwen3.5-4B-TriDecision-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Rubricas de tarea e idioma: `rubrics.json` (incluido en el repositorio del adaptador)
- No se han encontrado papers, blogs, repositorios o demos adicionales en la informacion disponible.
