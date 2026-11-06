# FullyAutomated/granite-system1-350m-experimental

## Resumen

Granite System1 350M Experimental es un modelo de puntuación de decisiones (decision scorer) no generativo desarrollado por FullyAutomated, adaptado del modelo base IBM Granite 4.0 350M mediante módulos LoRA y cabezas de clasificación adicionales. A diferencia de un modelo conversacional, no genera texto libre ni ejecuta acciones: recibe un contexto, una pregunta y un conjunto de entre 2 y 16 opciones, y devuelve una distribución de puntuaciones softmax, un identificador de opción o el valor semántico `NONE` cuando ninguna opción satisface los criterios.

El modelo es explícitamente experimental y el propio autor advierte que no está cualificado como modelo general de decisión. En una evaluación local de 768 casos frescos, el entrenamiento canónico ampliado elevó la precisión del 41,0% (315/768) al 55,9% (429/768), pero el modelo suspendió cinco de las ocho comprobaciones de aceptación predefinidas, mantuvo una precisión del 39,3% en NLI público y obtuvo 7/32 en la familia sintética de presupuestos. La relevancia de esta ficha es principalmente metodológica: documenta un intento de convertir un transformer causal pequeño en un componente de decisión acotado, con contrato de entrada/salida explícito, artefactos de auditoría y limitaciones declaradas.

El repositorio no contiene un checkpoint completo del modelo base ni un adaptador PEFT estándar, sino tensores de adaptador y cabezas exportados con un cargador propio en PyTorch. El backbone IBM se descarga por separado en una revisión fijada. La licencia es Apache-2.0 y el único idioma declarado es el inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (base IBM Granite 4.0 350M) con LoRA rank-8/alpha-16 en q/v de los últimos cuatro bloques de atención y cabezas de puntuación |
| Parámetros totales | 352.379.904 en el backbone congelado más 369.154 parámetros entrenables (adaptador y cabezas) |
| Parámetros activos | No aplica (no es MoE; el checkpoint no contiene expertos) |
| Longitud de contexto | 32.768 tokens de capacidad nativa retenida; entrenamiento limitado a 768 tokens y confirmación a 246 tokens |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador y cabezas); backbone base en safetensors descargado por separado |

## Arquitectura y entrenamiento

El modelo parte de `ibm-granite/granite-4.0-350m` en la revisión `bd8a1497065c0d6ba1ef19af6b0d2b14bacf71c2`, con SHA-256 del safetensors base `21bc1ccaf0eb6a8a503addd93cb7422df71129de0a641a5525e4a665813b6dfc`. El backbone tiene 352.379.904 parámetros congelados y 28 capas de atención; pese al nombre de clase híbrida de Transformers, este checkpoint no contiene expertos. Sobre él se entrenaron módulos LoRA de rango 8 y alpha 16 en las proyecciones q/v de los últimos cuatro bloques de atención, junto con una cabeza compartida de opción con arquitectura 1024→128→1 y activación GELU, más una cabeza separada para `NONE`. El total de parámetros entrenables es de 369.154.

La puntuación de cada candidato se obtiene leyendo el último token del segmento de la opción; `NONE` utiliza el estado del último token del segmento final. Al ser un modelo de secuencia causal, el orden canónico de las descripciones elimina perturbaciones por identificadores opacos y por reordenación, pero no elimina la dependencia del prefijo candidato. Las descripciones exactas se ordenan antes de la codificación y los identificadores opacos se mapean fuera del modelo; descripciones idénticas se consideran entrada inválida, no un caso de no coincidencia. El entrenamiento se realizó sobre el dataset `stanfordnlp/snli` y datos de confirmación propios; no se documentan en la información disponible el número total de tokens de entrenamiento, la composición completa del dataset ni el uso de RLHF o DPO. El autor declara explícitamente que no reclama novedad arquitectónica.

## Capacidades

- Puntuación de decisiones entre 2 y 16 opciones con identificadores opacos únicos y descripciones en lenguaje natural.
- Devolución de logits, probabilidades softmax sin calibrar y el identificador elegido, en el orden del llamante.
- Detección semántica de `NONE` cuando ninguna opción ofrecida satisface los criterios.
- Ordenación canónica de descripciones para estabilizar la decisión frente a reordenaciones e identificadores arbitrarios.
- Inferencia en CPU con un cargador propio en PyTorch, sin `trust_remote_code` ni código Python proporcionado por el modelo.
- Verificación de integridad mediante hashes del backbone, tokenizador y tensores del adaptador.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés declarado.

## Casos de uso

- Selección acotada de categorías en pipelines de clasificación: dado un contexto y un conjunto cerrado de etiquetas, el modelo devuelve la etiqueta más probable o `NONE` si ninguna encaja, integrándose como paso previo a un sistema mayor.
- Enrutamiento de consultas a un recurso concreto: con una lista de destinos posibles y una descripción de la petición, se obtiene el destino puntuado, siempre que el sistema externo valide la decisión antes de actuar.
- Investigación sobre decisiones no generativas: sirve como artefacto reproducible para estudiar cómo un transformer causal pequeño puntúa opciones frente a generar respuestas, con datos de auditoría incluidos.
- Evaluación de contratos de entrada/salida en sistemas de decisión: el repositorio incluye un auditor de biblioteca estándar que recalcula los recuentos de decisión a partir de las predicciones crudas, útil para validar protocolos de evaluación.
- Clasificación de relaciones textuales en inglés: aunque su precisión NLI pública es del 39,3%, puede emplearse en experimentos controlados de entailment/contradiction con opciones fijas y supervisión humana.
- Pruebas de robustez frente a reordenación de opciones: el orden canónico y el mapeo externo de identificadores permiten verificar que las distribuciones se mantienen bajo permutaciones, como se comprobó en ocho casos guardados.
- Docencia y reproducción de experimentos: el paquete incluye código de inferencia, ejemplo de petición, tests de runtime y resultados legibles por máquina para replicar el protocolo.

## Benchmarks y rendimiento

| Evaluación | Resultado |
|---|---|
| Evaluación local de 768 casos frescos (control) | 315/768 (41,0%) |
| Evaluación local de 768 casos frescos (entrenamiento canónico ampliado) | 429/768 (55,9%) |
| Precisión NLI pública | 39,3% |
| Familia sintética de presupuestos | 7/32 |
| Comprobaciones de aceptación predefinidas | Superadas 3 de 8 |

No se han publicado resultados adicionales de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. El model-index del autor declara una entrada sin resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 352 millones de parámetros en fp32 el backbone ocupa aproximadamente 1,4 GB, y en fp16 alrededor de 0,7 GB, sin contar activaciones ni el tokenizador.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU consumer con al menos 2-4 GB de VRAM libre debería poder alojar el backbone en precisión completa o media.
- Compatibilidad con GPU consumer: previsiblemente sí en tarjetas como RTX 3060, RTX 4060 o superiores, aunque el autor no publica requisitos oficiales.
- Despliegue: cargador propio en PyTorch (`system1.py`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el autor indica que no es un adaptador PEFT estándar ni un release de `AutoModel.from_pretrained()`.
- Latencia y throughput: no disponibles. La verificación de release se realizó en un proceso CPU fresco con Hub/Transformers en modo offline.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Granite System1 350M Experimental | 352,4 M backbone + 369.154 entrenables | 32.768 tokens nativos (entrenado a 768) | Puntuación de decisiones no generativa | Apache-2.0 | Hugging Face, cargador propio |
| IBM Granite 4.0 350M | 350 M aprox. | No disponible en la información | Modelo de lenguaje generativo | Apache-2.0 | Hugging Face |
| Adaptadores PEFT estándar sobre Granite | Variable | Heredado del base | Ajuste generativo | Según adaptador | Hugging Face, PEFT |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; la comparativa se limita a parámetros, contexto, licencia y formato de disponibilidad.

## Limitaciones y advertencias

- Modelo explícitamente experimental: el autor advierte que no debe usarse como autoridad de permisos, pagos, seguridad ni ejecución autónoma.
- Precisión limitada: 55,9% en la mejor evaluación local y 39,3% en NLI público; suspendió cinco de ocho comprobaciones de aceptación.
- Las probabilidades softmax no están calibradas y la incertidumbre no está disponible; una respuesta errónea con alta confianza sigue siendo errónea.
- `NONE` significa que ninguna opción satisface los criterios, no incertidumbre, baja confianza, rechazo ni permiso para actuar.
- Dependencia del prefijo candidato: el orden canónico elimina perturbaciones por identificadores y reordenación, pero no la dependencia causal del prefijo.
- Contexto útil no demostrado: aunque retiene 32.768 tokens, el entrenamiento se limitó a 768 tokens y no se demostró una ejecución completa de ventana.
- Solo inglés declarado; sin capacidades multilingües documentadas.
- No es un checkpoint completo, ni un modelo de chat, ni un adaptador PEFT estándar; requiere el cargador propio y el backbone IBM descargado por separado.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí riesgo de decisiones incorrectas con apariencia de seguridad.
- Sin servidor ni harness de agente instalado; la integración en producción exige validación externa de cada decisión.
- Sesgos conocidos: no documentados en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/FullyAutomated/granite-system1-350m-experimental
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-350m
- Informe profesional: https://github.com/JH427/fullyautomated.enterprises/blob/9ad2d6843296814f6422027da3290dc1007c07dc/src/content/labs/granite-system1-350m.md
- Dataset SNLI: https://huggingface.co/datasets/stanfordnlp/snli
- Paper SNLI (arXiv:1508.05326): https://arxiv.org/abs/1508.05326
