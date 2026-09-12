# bmarti44/assistant-memory-sentence-classifier

## Resumen

El assistant-memory-sentence-classifier es un clasificador de frases en inglés desarrollado por bmarti44 dentro del proyecto de investigación Stencil. Su tarea es responder a una pregunta muy concreta en el contexto de conversaciones largas con asistentes: ¿debe el asistente recordar esta frase para turnos posteriores? El modelo asigna cada frase a una de tres etiquetas: `rule` (instrucción, restricción, preferencia, persona o compromiso que gobierna las respuestas futuras, incluida la modificación o cancelación de una regla anterior), `fact` (información que el asistente debe arrastrar) y `none` (todo lo demás, incluidas peticiones puntuales).

Técnicamente es un ajuste fino de BAAI/bge-small-en-v1.5, un encoder de tipo transformer con 33.213.327 parámetros (33M), al que se añade una cabeza lineal que consume el estado `[CLS]` concatenado con un one-hot del rol del hablante. El resultado es un modelo que cabe en CPU y que se ejecuta sobre pares de secuencias (contexto previo + frase con prefijo de rol) truncados a 192 tokens. Su relevancia actual es acotada pero específica: es un componente de selección en tiempo de escritura para mecanismos de memoria y recordatorios en conversaciones largas, no un modelo generativo.

El propio autor documenta un resultado crítico que conviene tener presente antes de adoptarlo: en la aplicación para la que fue diseñado no superó a una heurística sin parámetros. Sobre Multi-IF con un Qwen3-1.7B congelado, sus selecciones recuperaron el cumplimiento de instrucciones antiguas hasta el 59,2%, frente al 60,5% de una regla que simplemente conserva las frases de usuario más recientes. Es, por tanto, una pieza útil para decisiones por frase, no un sustituto de la recencia. El repositorio registra 0 descargas y 0 likes en el momento de la consulta y el modelo requiere `trust_remote_code=True`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base BAAI/bge-small-en-v1.5) con cabeza de clasificación lineal sobre el estado `[CLS]` más one-hot de rol del hablante |
| Parametros totales | 33.213.327 (33M) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | Entradas truncadas a 192 tokens (`truncation="longest_first"`); la ventana máxima del encoder base no se detalla en la información disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors, con código personalizado (`modeling_stencil.py`, requiere `trust_remote_code=True`) |

Otros datos: pipeline `text-classification`; tamaño del repositorio 0,1 GB; etiquetas `rule`, `fact`, `none`; roles de hablante reconocidos: `user`, `assistant`, `tool`, `system` (en ese orden de índice), con `user` por defecto en el pipeline.

## Arquitectura y entrenamiento

El modelo parte de BAAI/bge-small-en-v1.5, un encoder transformer de 33M de parámetros, y le añade una cabeza lineal que combina el estado `[CLS]` crudo con un one-hot del rol del hablante. El checkpoint publicado en el Hub pliega la parte del rol de la cabeza en un sesgo de logits por rol; según la model card, la numerología es idéntica. La entrada es un par de secuencias: el contexto precedente (o la cadena literal `(no context)`) y la frase objetivo prefijada con su rol entre corchetes, por ejemplo `[user] From now on reply in French.` El entrenamiento se hizo con entradas truncadas a 192 tokens y 3 épocas con semilla 0.

Los datos de entrenamiento son 20.054 frases escritas directamente por kimi-k3 en sesiones nuevas, revisadas y enriquecidas a mano por otros dos modelos revisores (sol y Opus), con una especificación de etiquetado de tres alcances (conversación, tarea/artefacto y puntual) documentada en `data/classifier/LABELS.md` del proyecto. Los conjuntos de validación retenidos son `fable-validation` y `fable-scope-validation` (disjuntos por autor) y `opus-heldout` y `sol-heldout` (comparten autores con la fase de enriquecimiento). La política de disjunción excluye cualquier ítem, plantilla, marcador o fraseo exacto de benchmarks de evaluación (IFEval, Multi-IF, BFCL, tau-bench), aunque el solapamiento de tipos de restricción con IFEval es deliberado y declarado. Se registran dos incidentes: un prompt anterior de generación de alcances incluía ejemplos específicos de sonda, por lo que se eliminaron 38 filas con eco y se reescribieron los ejemplos; el autor advierte que esto no elimina la influencia en el desarrollo, por lo que describe los datos como disjuntos por ítem sujetos a las auditorías registradas, no como independientes del desarrollo. No hay RLHF ni DPO: es un clasificador supervisado, no un modelo generativo alineado.

## Capacidades

- Clasificación por frase en tres clases (`rule`, `fact`, `none`) para decidir si un asistente debe retener una frase en turnos posteriores.
- Detección de reglas, restricciones, preferencias, personas y compromisos, incluidas frases que cambian o cancelan una regla anterior.
- Detección de hechos que el asistente debe arrastrar entre turnos.
- Discriminación de peticiones puntuales que no deben persistir (clase `none`).
- Procesamiento por lotes: acepta listas de diccionarios `{text, text_pair}` en el pipeline.
- Condicionamiento por rol del hablante mediante `role_ids` en el método forward (`user`, `assistant`, `tool`, `system`).
- Ejecución en CPU y con presupuesto de memoria mínimo, gracias a los 33M de parámetros.
- No soporta generación de texto, tool calling, agentes, visión, audio ni razonamiento multi-paso: su salida es una etiqueta con su puntuación de confianza.
- Multilingüe: no. Solo inglés.

## Casos de uso

- Escritura selectiva en un almacén de memoria: antes de insertar una frase de un historial de chat en una base de memoria vectorial, el clasificador decide si es `rule`, `fact` o `none`, reduciendo el ruido almacenado y el coste de recuperación posterior.
- Construcción de recordatorios compactos: en lugar de reinyectar el historial completo, se extraen solo las frases etiquetadas como `rule` o `fact` y se añaden al prompt del turno siguiente; el autor reporta que este mecanismo restaura el cumplimiento de instrucciones antiguas hasta el 59,2% con anclaje y eco, frente al 16,7% con la instrucción expulsada de la caché.
- Mantenimiento de persona y preferencias en asistentes de larga duración: frases como «a partir de ahora responde en francés» se etiquetan como `rule` y se pueden fijar como restricciones persistentes de estilo o formato.
- Filtrado previo en frameworks de agentes: integrado como paso de preprocesado, permite decidir qué observaciones de herramientas (`tool`) merecen persistir y cuáles son ruido de una única llamada.
- Análisis y auditoría de transcripciones: procesamiento por lotes en CPU de históricos de conversación para medir qué proporción de turnos contiene reglas o hechos retenibles, útil para diagnóstico de calidad de instrucciones.
- Ajuste de coste de contexto: como clasificador de 33M, puede ejecutarse en el mismo nodo que el modelo generativo sin GPU dedicada, reduciendo la longitud media del contexto enviado al modelo grande.
- Personalización de asistentes de atención al cliente: extraer compromisos y restricciones del cliente (por ejemplo, canal preferido o límites acordados) para reinyectarlos en conversaciones que superan la ventana de contexto del modelo principal.
- Construcción de memorias de proyecto en asistentes de código: distinguir entre una instrucción permanente de estilo (etiqueta `rule`) y una petición puntual de refactorización (etiqueta `none`), evitando que la segunda contamine el contexto de sesiones futuras.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index, no verificados por Hugging Face. Precisión sobre frases retenidas, nunca usadas para entrenamiento ni selección:

| Origen retenido | n | Precisión |
|---|---|---|
| fable-validation (disjunto por autor) | 363 | 86,8% |
| fable-scope-validation (disjunto por autor, reglas de alcance de tarea) | 292 | 84,6% |
| opus-heldout | 238 | 93,7% |
| sol-heldout | 200 | 94,5% |
| **Total** | **1.093** | **89,1%** |

Métricas agregadas y por clase (todo el conjunto retenido):

| Métrica | Valor |
|---|---|
| Precisión en subconjunto difícil | 84,2% |
| `none` precisión / exhaustividad | 0,924 / 0,865 |
| `rule` precisión / exhaustividad | 0,911 / 0,872 |
| `fact` precisión / exhaustividad | 0,823 / 0,962 |

Evaluación en la aplicación prevista, sobre Multi-IF (909 conversaciones, Qwen3-1.7B congelado, instrucciones anteriores expulsadas de la caché KV antes de la consulta final y restauradas parcialmente fijando columnas seleccionadas y repitiendo su texto):

| Configuración | Cumplimiento de instrucciones antiguas |
|---|---|
| Instrucción expulsada (sin recuperación) | 16,7% |
| Selecciones del clasificador, solo anclaje | 57,2% |
| Selecciones del clasificador, anclaje + eco | 59,2% |
| Heurística sin parámetros (frases de usuario más recientes) | 60,5% |
| Contexto completo | 65,2% |

El autor indica que la exportación reproduce la etiqueta predicha por el scorer registrado en las 1.093 frases retenidas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 133 MB en fp32 y 66 MB en fp16 para los pesos (33,2M de parámetros); con activaciones y lotes pequeños, el consumo total se mantiene por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre; el modelo está pensado para CPU y funciona sin acelerador.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en iGPU y en CPU. El tamaño del repositorio es de 0,1 GB.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")` es la vía documentada; requiere `trust_remote_code=True` por el módulo `modeling_stencil.py`. El autor no documenta integraciones con vLLM, llama.cpp, Ollama o TGI, y al no ser un modelo generativo esos runners no aplican de forma estándar.
- Latencia y throughput estimados: no disponible en la información proporcionada. Como referencia de escala, 33M de parámetros sobre secuencias de 192 tokens es un coste de cómputo muy bajo por lote, apto para procesamiento por lotes en CPU.

## Comparativa con modelos similares

No se dispone de benchmarks públicos de otros clasificadores de retención de memoria por frase, por lo que la comparación se limita a alternativas estructurales y a la heurística evaluada por el propio autor.

| Alternativa | Parámetros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| assistant-memory-sentence-classifier | 33M | 192 tokens (truncado) | 89,1% de precisión retenida (n=1.093); 59,2% en Multi-IF con anclaje y eco | MIT | Hugging Face, requiere `trust_remote_code` |
| BAAI/bge-small-en-v1.5 (modelo base) | 33M | no disponible en la información proporcionada | No es un clasificador de tres clases; produce embeddings, no una decisión por frase | MIT | Hugging Face |
| Heurística de recencia (sin parámetros) | 0 | Sin límite de modelo | 60,5% en Multi-IF con el mismo número de columnas fijadas | No aplica | Implementación propia |
| Clasificador basado en un LLM generativo | Miles de millones | Variable | No disponible | Según el modelo elegido | Requiere GPU y mucho más coste por frase |

En la comparación que importa para la aplicación prevista, la heurística de recencia superó al clasificador (60,5% frente a 59,2%) con coste cero, lo que acota claramente su nicho de uso a escenarios donde se necesita una decisión por frase y no solo una política temporal.

## Limitaciones y advertencias

- Solo inglés. No se declara soporte de ningún otro idioma.
- No está destinado a filtrado de seguridad, moderación de contenido ni a tomar decisiones sobre personas.
- El modelo lee únicamente la frase y una ventana de contexto corta: no sabe si una regla fue cancelada después. Esa gestión del ciclo de vida es un paso separado del proyecto Stencil, no algo que resuelva este clasificador.
- Debilidad conocida: las restricciones de alcance de tarea expresadas como observaciones («el informe se lee mejor sin encabezados») forman el subconjunto difícil, con 84,2% de precisión.
- La exhaustividad de `fact` es alta (0,962) pero su precisión es la más baja de las tres clases (0,823), lo que implica falsos positivos al retener información que no era necesaria.
- No supera a una heurística de recencia sin parámetros en Multi-IF; no debe adoptarse esperando mejoras de cumplimiento en benchmarks donde la recencia ya funciona.
- La truncación a 192 tokens es parte del régimen de entrenamiento: cambiar ese ajuste invalida la comparabilidad con las cifras publicadas.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código publicado en el repositorio del modelo; conviene auditar `modeling_stencil.py` antes de desplegarlo en producción.
- Trazabilidad de datos: el autor describe los conjuntos como disjuntos por ítem sujetos a auditorías registradas, no como independientes del desarrollo, y reconoce la influencia de un prompt anterior con ejemplos específicos de sonda.
- Las métricas de `opus-heldout` y `sol-heldout` comparten autores con la fase de enriquecimiento, por lo que son menos exigentes que las validaciones disjuntas por autor.
- Licencia MIT: permite uso comercial, modificación y redistribución, sin restricciones adicionales documentadas. La licencia del modelo base es también MIT.
- Adopción prácticamente nula en el momento de la consulta (0 descargas, 0 likes), sin validación independiente de los resultados declarados.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea con confianza alta; conviene calibrar un umbral por clase antes de usarlo como puerta automática.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bmarti44/assistant-memory-sentence-classifier
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Repositorio del proyecto Stencil: https://github.com/bmarti44/stencil-llm
- Especificación de etiquetas: `data/classifier/LABELS.md` dentro del repositorio de Stencil
- No se han encontrado papers, blogs ni demos adicionales en los resultados de búsqueda web disponibles; los resultados devueltos no guardan relación con este modelo.
