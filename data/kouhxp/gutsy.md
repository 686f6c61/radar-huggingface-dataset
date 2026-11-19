# kouhxp/gutsy

## Resumen

`gutsy` es un modelo de decisión (decision model) desarrollado por el usuario kouhxp, afinado a partir de Qwen3.5-0.8B y distribuido en formato GGUF para su ejecución local mediante llama.cpp. No es un modelo generativo: recibe un estado (texto o JSON) y una serie de preguntas tipadas (sí/no, elección entre opciones, puntuación) y devuelve una probabilidad calibrada para cada opción. Su API sigue el formato Jev-style Decisions, de modo que clientes existentes pueden migrar cambiando únicamente la URL base.

La propuesta de valor es la inferencia local determinista y privada: el modelo corre en CPU ordinaria, sin llamadas de red ni coste por petición, con un GGUF Q8_0 de 775 MB como referencia y un Q4_K_M de 505 MB aproximadamente un 25-30% más rápido. Está entrenado con reglas de scoring propias (entropía cruzada más Brier sobre etiquetas suaves), con un error de calibración en validación de 0,022 antes de cualquier escalado, lo que significa que una probabilidad de 0,8 corresponde aproximadamente a un 80% de acierto empírico.

La versión v0.4 (octubre de 2026) mejora sobre v0.3 en robustez ante pares de contraste, reglas lógicas de profundidad 3 y ordenaciones expresadas como comparativas, y añade soporte de hasta 255 opciones mediante shortlisting en el runtime, además de una probabilidad `reject` para el caso "ninguna opción encaja". El modelo está pensado para clasificación, enrutamiento y juicio automatizado, no para generación de texto libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen3.5-0.8B), cabecera de clasificación sobre probabilidades calibradas |
| Parametros totales | 752.393.024 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (775 MB), Q4_K_M (505 MB) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (librería `gguf`, runtime llama.cpp); pesos base en safetensors |
| Pipeline | text-classification |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Tamaño del repo | 2.2 GB |
| Runtime de referencia | gutsy-inference 0.4.0 |
| Opciones máximas por consulta | 255 (shortlisting en runtime para listas > 16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer de aproximadamente 752 millones de parámetros, y se afina como modelo de decisión: en lugar de generar texto, produce una distribución de probabilidad sobre las opciones de una pregunta tipada (sí/no, elección múltiple, puntuación ordinal). El estado de entrada se codifica una sola vez y se cachea, de forma que las preguntas de seguimiento sobre el mismo estado solo cuestan sus propios tokens y las peticiones repetidas sobre un estado cacheado lo omiten por completo; este mecanismo funciona tanto con el fichero Q8_0 como con el Q4_K_M.

El entrenamiento utiliza reglas de scoring propias (cross-entropy más Brier) sobre etiquetas suaves, seguido de una comprobación de temperatura sobre datos reservados: el error de calibración en validación es de 0,022 antes de aplicar ningún escalado. La v0.4 incorpora mejoras específicas medidas en tests reservados: acierto en pares de contraste del 0,417 frente a 0,104 en v0.3, abstención correcta cuando falta un hecho decisivo del 0,896 frente a 0,583, reglas lógicas de profundidad 3 (entrenado solo con profundidad 1-2) del 0,842 frente a 0,617, y ordenaciones expresadas como comparativas (entrenado con posiciones) del 0,947 frente a 0,840. La aritmética de meses de calendario, nunca vista en entrenamiento, empeora de 0,683 a 0,519. El modelo es robusto al orden de las opciones: entre el 96% y el 97% de las respuestas no cambian al barajar las opciones en BoolQ, SNLI y escenarios de desarrollo.

## Capacidades

- Clasificación binaria (sí/no) con probabilidad calibrada por opción.
- Elección múltiple entre hasta 255 opciones, con shortlisting en el runtime para listas de más de 16 (99,1% de acierto en el test de 20-254 opciones).
- Puntuación ordinal (score) con error absoluto medio reportado por tiers.
- Probabilidad `reject` para indicar "ninguna de las opciones encaja" o "el estado no lo dice".
- Cacheado de estado: codificación única reutilizable por preguntas de seguimiento.
- Salida determinista: peticiones idénticas devuelven probabilidades idénticas en la misma máquina y build.
- Compatibilidad con la API Jev-style Decisions (clientes existentes solo necesitan cambiar la URL base).
- Ejecución local en CPU mediante llama.cpp, sin llamadas de red ni coste por petición.
- No genera texto libre; no soporta tool calling, agentes ni multimodalidad según la información disponible.

## Casos de uso

- Enrutamiento de consultas en atención al cliente: clasificar un mensaje entrante entre decenas de intenciones (probado zero-shot con las 77 intenciones de BANKING77, acierto 0,613) y derivar al departamento correcto, con probabilidad `reject` para mensajes fuera de catálogo.
- Moderación y triaje de contenido: decidir sí/no sobre si un texto cumple una política, aprovechando la calibración para fijar umbrales de revisión humana en lugar de decisiones binarias ciegas.
- Verificación de respuestas en pipelines RAG: puntuar si una respuesta está respaldada por el contexto recuperado (RAGTruth 0,813 en dominio), integrable como paso de control antes de mostrar la respuesta al usuario.
- Análisis de sentimiento financiero: clasificar titulares o tuits financieros en categorías positivas, negativas o neutras (Financial PhraseBank 0,927), útil para monitorización de carteras y alertas.
- Evaluación automática de respuestas (LLM-as-judge ligero): comparar pares de respuestas y decidir cuál es mejor o si una cumple un criterio, con probabilidad de rechazo cuando el criterio no aplica (JudgeBench 0,539).
- Decisión sobre reglas de negocio con estado JSON: enviar un estado estructurado (pedido, cliente, incidencia) y preguntas tipadas sobre elegibilidad, prioridad o escalado, con el estado cacheado para múltiples preguntas de seguimiento.
- Inferencia de relación entre frases: determinar implicación, contradicción o neutralidad en pares de textos (SNLI 0,870) para deduplicación semántica o detección de inconsistencias documentales.

## Benchmarks y rendimiento

JevBench, ítems públicos (231):

| Tier | v0.3 (Q8_0) | v0.4 (Q8_0) | v0.4 (Q4_K_M) |
|---|---|---|---|
| easy (48) | 47 | 48 | 47 |
| original (72) | 61 | 65 | 62 |
| hard (111) | 59 | 56 | 52 |
| Total | 167 (0,723) | 169 (0,732) | 161 (0,697) |
| Error de calibración (easy / original / hard) | 0,023 / 0,122 / 0,078 | 0,022 / 0,107 / 0,137 | 0,019 / 0,137 / 0,125 |
| MAE ordinal (original / hard) | 0,30 / 0,59 | 0,19 / 0,69 | 0,21 / 0,67 |
| Acuerdo ante paráfrasis (original) | 0,81 | 0,86 | 0,78 |

Otros proyectos reportan sobre el mismo conjunto público: Jev 0,866, decision-4b 0,883, Neriv 0.6B 0,636, XERON-0.4 0,558, Laya afinado 0,537; Jeff-0.8B 47,6% en el tier hard (105 ítems). El autor advierte que JevBench describe los resultados públicos como preliminares y que los oficiales usan ítems sellados.

Mismos ítems, medidos en paralelo (700 por tarea):

| Tarea | Qwen3.5-0.8B sin afinar | gutsy v0.3 | gutsy v0.4 | Jev (vía API) |
|---|---|---|---|---|
| BoolQ | 0,700 | 0,850 | 0,837 | 0,906 |
| SNLI | 0,489 | 0,879 | 0,870 | 0,883 |
| CommonsenseQA (nunca entrenado) | 0,463 | 0,587 | 0,577 | 0,863 |

Panel de evaluación (700 ítems por tarea; JudgeBench 245):

| Benchmark | v0.3 | v0.4 Q8_0 | v0.4 Q4_K_M | Jeff-0.8B v1.0 | Jev |
|---|---|---|---|---|---|
| BBH | 0,464 | 0,481 | 0,474 | 64,0 | 94,3 |
| Financial PhraseBank | 0,921 | 0,927 | 0,926 | 96,4 | 77,0 |
| JudgeBench | 0,596 | 0,539 | 0,563 | 62,6 | 78,6 |
| RAGTruth (en dominio) | 0,790 | 0,813 | 0,807 | 86,1 | 77,3 |
| WinoGrande (en dominio) | 0,657 | 0,620 | 0,629 | 68,6 | 90,7 |

Enrutamiento y listas largas: BANKING77 test completo con las 77 intenciones como opciones, zero-shot, 0,613; listas de 20-254 opciones con respuesta en cada posición, 0,991. Familias del tier hard para v0.4 Q8_0 (5-19 ítems cada una, ruidosas individualmente): routing_hard 1,00, trap 0,88, adversarial 0,83, judge_hard 0,59, ambiguous 0,57, probability 0,50, multi_hop 0,44, tradeoff 0,33, long_policy 0,32, temporal_numeric 0,27.

## Requisitos de hardware

- VRAM estimada: no aplica estrictamente; el modelo corre en CPU. El fichero Q8_0 ocupa 775 MB y el Q4_K_M 505 MB, por lo que la RAM necesaria es del orden de 1-2 GB incluyendo el runtime.
- GPU recomendadas: no disponibles; el autor indica explícitamente ejecución en CPU ordinaria mediante llama.cpp.
- Cabe en cualquier equipo consumer: el Q4_K_M de 505 MB es viable en máquinas de gama baja y en entornos sin GPU.
- Opciones de despliegue: llama.cpp (runtime `gutsy-inference` 0.4.0 como referencia), formato GGUF compatible con el ecosistema llama.cpp. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: el Q4_K_M es aproximadamente un 25-30% más rápido que el Q8_0 con las mismas puntuaciones de panel; no se publican cifras absolutas de latencia o tokens por segundo. El cacheado de estado reduce el coste de preguntas de seguimiento a solo sus propios tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | JevBench público | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gutsy v0.4 | 752 M | no disponible | 0,732 (Q8_0) / 0,697 (Q4_K_M) | Apache 2.0 | Hugging Face, GGUF local |
| Jev (typesafe/jev-1.13) | no disponible | no disponible | 0,866 | no disponible | API |
| decision-4b | no disponible | no disponible | 0,883 | no disponible | no disponible |
| Jeff-0.8B v1.0 | no disponible | no disponible | 47,6% en tier hard (105 ítems) | no disponible | no disponible |
| Neriv 0.6B | 0,6 B | no disponible | 0,636 | no disponible | no disponible |

En tareas medidas en paralelo, gutsy v0.4 queda por debajo de Jev en BoolQ (0,837 frente a 0,906), SNLI (0,870 frente a 0,883) y CommonsenseQA (0,577 frente a 0,863), pero supera a Jev en Financial PhraseBank (0,927 frente a 0,770) y RAGTruth (0,813 frente a 0,773). Frente a Jeff-0.8B, las cifras no son directamente comparables porque proceden de muestras distintas de los mismos benchmarks, según advierte el propio autor.

## Limitaciones y advertencias

- Aritmética de fechas y números: JevBench temporal_numeric 0,27 y tareas reservadas de días laborables y meses de calendario débiles; el autor recomienda no automatizar sobre estas sin pruebas propias.
- Razonamiento multi-hop (0,44), tradeoff (0,33), long_policy (0,32) y probability (0,50) en el tier hard son puntos flojos.
- JudgeBench y WinoGrande empeoran respecto a v0.3 (0,539 frente a 0,596 y 0,620 frente a 0,657), así que la actualización no es una mejora uniforme.
- RAGTruth y WinoGrande están medidos en dominio: sus splits de entrenamiento están en los datos de entrenamiento (los ítems de test nunca), lo que infla las cifras frente a una evaluación estrictamente fuera de dominio.
- Solo inglés: no hay soporte multilingüe declarado.
- No genera texto: no sirve para tareas generativas, tool calling ni agentes.
- Riesgo de alucinación estructural: el modelo no inventa texto, pero puede asignar alta probabilidad a una opción incorrecta cuando el estado es ambiguo; la probabilidad `reject` mitiga pero no elimina este caso.
- Las comparaciones con Jev, decision-4b, Jeff y otros son indicativas: distintos harness, muestras e ítems, y las cifras de terceros son autoinformadas salvo que se indique lo contrario.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B puede tener sus propias condiciones que conviene revisar.
- El determinismo está garantizado solo en la misma máquina y build; cambios de runtime o de hardware pueden alterar las probabilidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kouhxp/gutsy
- Repositorio del runtime: `gutsy-inference/` 0.4.0 (referenciado en la model card)
- Entrenamiento y evaluación: `gutsy-bench/`, `gutsy-teacher/` (referenciados en la model card)
- Revisión v0.3: `hf download kouhxp/gutsy --revision v0.3`
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
