# ninhnv/chon-1.0-12b-fast

## Resumen

Chon-1.0-12B-Fast es un adaptador LoRA sobre google/gemma-4-12B-it (12B) que convierte el modelo base en un clasificador de decisiones tipadas: recibe un estado (texto, JSON o una conversación) y una pregunta con un conjunto cerrado de opciones, y devuelve una probabilidad calibrada para cada opción. Cubre tres tipos de pregunta: elección entre 2 y 256 opciones etiquetadas, sí/no con P(yes) y puntuación como distribución sobre niveles ordenados. Lo publica el usuario ninhnv (organización xoai, autora del servidor `chon`) bajo licencia Apache-2.0.

La variante "Fast" es el mismo adaptador y la misma calibración que Chon-1.0-12B, pero con el paso de razonamiento desactivado: cada decisión se resuelve en un único forward pass, sin generar tokens. El resultado es una latencia muy baja (mediana de 0,07 s y p95 de 0,1 s en una H100 80 GB, una petición a la vez) a cambio de renunciar a los últimos puntos de precisión frente al modelo con razonamiento.

Es relevante porque ataca un problema distinto al de la generación de texto: sustituir heurísticas de enrutamiento, umbrales manuales y clasificadores ligeros por un modelo de 12B que devuelve distribuciones de probabilidad calibradas y consumibles por código (formato `/v1/systemone` de JevBench). El repositorio solo contiene el adaptador (~1,0 GB), el tokenizador y la configuración de servicio; los pesos del modelo base se descargan aparte. El modelo es muy reciente (creado el 22 de octubre de 2026) y no tiene descargas ni valoraciones en HuggingFace.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre google/gemma-4-12B-it; la arquitectura interna del modelo base no se detalla en la información disponible |
| Parametros totales | 12B (modelo base, según la nomenclatura del autor); el adaptador LoRA ocupa ~1,0 GB |
| Parametros activos | No aplica (no es un modelo MoE, según la información disponible) |
| Longitud de contexto | Estado de entrada hasta 6.000 tokens (los estados más largos se truncan conservando el inicio); prompt hasta 8.192 tokens; ventana nativa del modelo base: no disponible |
| Tipos de cuantizacion | No disponible (la model card no documenta versiones cuantizadas; las mediciones son en bf16) |
| Idiomas soportados | Inglés (principal) y vietnamita |
| Licencia | Apache-2.0, la misma que el modelo base según el autor |
| Formato de pesos | safetensors (`adapter_model.safetensors` + `adapter_config.json`, formato PEFT) más `chon_config.json` y ficheros del tokenizador; los pesos del modelo base no se incluyen |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de ~1,0 GB que se carga junto a google/gemma-4-12B-it sin modificarlo. No genera texto: la cabeza de decisión se apoya en la representación del modelo base para producir, en un solo forward pass, una distribución sobre las opciones de la pregunta. La model card no especifica la arquitectura interna del modelo base (número de capas, tipo de atención, uso de MoE), el número de tokens de entrenamiento ni la composición del dataset del adaptador.

Sí se documenta el mecanismo de decisión: para preguntas de elección con más de 16 opciones, las opciones se leen por grupos y se hace una ronda final (esta función requiere `chon` 1.1.0 o superior para el rango completo de 2 a 256 opciones); el resultado incluye la opción elegida y las probabilidades de todas ellas. El ajuste se describe como "adaptador y calibración" compartidos con Chon-1.0-12B, y la variante Fast simplemente desactiva el paso de razonamiento. No se detalla si hubo RLHF, DPO u otra fase de alineación específica para el adaptador; la información disponible tampoco incluye detalles del proceso de calibración más allá de que se lee desde `chon_config.json`.

## Capacidades

- Decisión de elección única entre 2 y 256 opciones etiquetadas, con probabilidades por opción (más de 16 opciones requiere `chon` 1.1.0 o superior).
- Decisión binaria sí/no con probabilidad P(yes) devuelta como campo `noul`.
- Puntuación sobre niveles ordenados: distribución de probabilidad sobre cada nivel.
- Salida calibrada apta para umbrales y abstención en producción, no solo la etiqueta ganadora.
- Entrada de estado heterogénea: texto libre, JSON o conversación.
- Varias preguntas con nombre en una misma petición (objeto `questions` con preguntas independientes).
- Servicio mediante el formato de cable TypeSafe `/v1/systemone` usado por JevBench.
- Multilingüe limitado: inglés y vietnamita.
- Sin generación de texto: `output_tokens` es siempre 0, lo que elimina el riesgo de salida no estructurada.
- Integración con tool calling o pipelines de agentes: no documentada en la información disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: se envía el histórico del ticket como estado y una pregunta de elección con categorías (`refund`, `shipping`, `other`, etc.); el sistema usa la probabilidad para enrutar automáticamente y derivar a revisión humana cuando la confianza es baja. El ejemplo de la model card resuelve este caso en un solo forward pass.
- Moderación de contenido y guardrails: pregunta sí/no sobre si una respuesta cumple la política interna, con P(yes) como señal continua para bloquear, permitir o escalar, en lugar de un umbral binario rígido.
- Triaje de reclamaciones y decidibilidad: decidir si un caso es subsanable, requiere documentación adicional o debe rechazarse, aprovechando la distribución sobre niveles ordenados para priorizar la cola.
- Clasificación de intención en asistentes conversacionales: con 6.000 tokens de estado se puede pasar el contexto de la conversación completa y obtener la intención con probabilidades, útil para decidir qué herramienta invocar a continuación.
- Etiquetado asistido y control de calidad de anotaciones: usar la distribución del modelo como voto ponderado y marcar para revisión los ítems con entropía alta, reduciendo el coste de anotación manual.
- Encuestas y NPS: convertir respuestas abiertas en una puntuación en escala ordenada con incertidumbre asociada, agregable después con intervalos de confianza.
- Verificación de respuestas (fact-checking ligero): pregunta sí/no sobre si una afirmación está respaldada por el contexto recuperado, con la probabilidad como filtro previo a un revisor más caro.
- Scoring de riesgo en originación: mapear expedientes a niveles de riesgo ordenados; requiere validación propia porque la calibración publicada es un proxy y no se ha medido en dominios financieros.

## Benchmarks y rendimiento

El autor publica métricas propias sobre JevBench, no resultados de tableros oficiales. No hay datos de MMLU, HumanEval, GSM8K ni de benchmarks estándar de generación, algo coherente con un modelo que no genera texto.

| Conjunto | Ítems | Intelligence | Calibración (proxy) | Capability (proxy) |
|---|---:|---:|---:|---:|
| Réplica held-out (mezcla JevBench v1.5) | 720 | 72,4 | 86,5 | 79,4 |
| JevBench público | 231 | 78,8 | 87,8 | 83,3 |

Notas de medición aportadas por el autor: el conjunto held-out tiene 720 ítems (360 de elección, 180 de sí/no y 180 de puntuación; niveles 14/28/28/30 %) y nunca se usó en entrenamiento; se aplican las fórmulas públicas del tablero (pesos iguales por tipo, pesos de nivel 10/20/30/40, respuestas sí/no entre 0,2 y 0,8 cuentan como incorrectas). El mapeo de calibración del tablero no está publicado por completo, por lo que la columna de calibración es una aproximación del autor.

Rendimiento de servicio medido en una H100 80 GB, una petición a la vez: mediana de 0,07 s, p95 de 0,1 s, 744 tokens de entrada y 0 de salida por decisión de media, con un coste estimado de 0,037 USD por 1.000 decisiones a 0,05/0,1 USD por millón de tokens de entrada/salida. No se han publicado cifras de throughput con concurrencia.

## Requisitos de hardware

- VRAM: el autor indica una GPU con 40 GB o más para bf16, medido en una H100 80 GB. En términos de pesos, 12B en bf16 son ~24 GB más ~1 GB de adaptador, a lo que se suman caché KV y activaciones.
- GPU recomendadas: H100 80 GB (la única configuración medida). A100 80 GB o GPUs profesionales de 40-48 GB son el mínimo declarado; no hay mediciones publicadas en ellas.
- GPU de consumo: no cabe en bf16 en ninguna tarjeta de consumo actual de 24 GB o menos según el requisito declarado de 40 GB. No se documentan versiones cuantizadas (GGUF, AWQ, GPTQ) que permitan bajarlo a una RTX 4090 o similar.
- Despliegue: servidor propio del proyecto, `pip install "chon[serve] @ git+https://github.com/xoai/chon"` y `python -m chon.serve --model ninhnv/chon-1.0-12b-fast --port 8000`, que descarga el modelo base y el adaptador y expone `/v1/systemone`. Soporte en vLLM, TGI, Ollama o llama.cpp: no disponible en la información proporcionada.
- Latencia: 0,07 s de mediana y 0,1 s de p95 por decisión en H100 80 GB con una petición simultánea. Throughput concurrente y comportamiento con batching: no disponible.
- Almacenamiento y red: el adaptador son ~1,1 GB de repositorio, pero hay que descargar aparte los pesos del modelo base (~24 GB en bf16).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chon-1.0-12B-Fast | 12B + LoRA ~1,0 GB | Estado 6.000 tokens; prompt 8.192 tokens | Probabilidades, 1 forward pass, 0 tokens generados | Apache-2.0 | Adaptador en HF, servicio vía `chon` |
| Chon-1.0-12B (variante con razonamiento) | 12B + mismo adaptador | No disponible en la información | Probabilidades con paso de razonamiento (genera tokens) | Apache-2.0 | Adaptador en HF; el autor lo recomienda cuando prima la precisión |
| google/gemma-4-12B-it (modelo base) | 12B | No disponible en la información | Texto generado; requiere prompting y parseo propio | Apache-2.0 según la ficha del adaptador | Pesos completos en HF |

No se han identificado en la información proporcionada otros modelos de decisión tipada con probabilidades calibradas y conjunto de opciones cerrado (más allá de clasificadores ligeros tipo BERT, para los que no hay datos comparables). Cualquier comparación numérica con terceros sería especulativa: no disponible.

## Limitaciones y advertencias

- No es un modelo generativo: no puede redactar respuestas, resumir ni mantener una conversación. Solo devuelve distribuciones sobre opciones predefinidas.
- El estado se trunca a 6.000 tokens conservando el inicio, de modo que en documentos largos se pierde el final, que suele ser la parte más informativa (conclusiones, último mensaje del cliente). Hay que preprocesar y seleccionar el fragmento.
- "Fast" sacrifica precisión: el propio autor recomienda Chon-1.0-12B cuando importa la exactitud. No se publica la magnitud de esa pérdida.
- Idiomas: solo inglés y vietnamita. El rendimiento en castellano no está documentado y no debería asumirse.
- Los números de calibración son un proxy calculado por el autor porque el mapeo del tablero JevBench no es completamente público; la calibración efectiva en un dominio concreto debe validarse con datos propios (ECE, curvas de fiabilidad).
- No hay resultados en benchmarks estándar ni evaluaciones independientes. Las métricas publicadas son del propio autor y sobre su propio conjunto.
- Riesgo de alucinación: aunque no genera texto, las probabilidades pueden ser confiadas e incorrectas en dominios fuera de la distribución de entrenamiento; es imprescindible un umbral de abstención.
- Sesgos: no se documenta ninguna evaluación de sesgo, toxicidad ni公平... no se documenta ninguna auditoría de sesgo ni de equidad; el adaptador hereda los del modelo base y los del corpus de entrenamiento, no descritos.
- Licencia: Apache-2.0 según el autor, pero conviene verificar los términos del modelo base google/gemma-4-12B-it antes de un uso comercial, ya que el adaptador no puede usarse sin él.
- Madurez: repositorio con 0 descargas y 0 valoraciones, creado en octubre de 2026. Sin comunidad, sin issues públicos y sin garantías de mantenimiento.
- Dependencia de una librería propia (`chon` >= 1.1.0 para más de 16 opciones) y de un formato de cable específico (`/v1/systemone`), lo que añade acoplamiento y trabajo de integración.
- Requisito de 40 GB de VRAM en bf16 sin alternativas cuantizadas documentadas: inviable en infraestructura de GPU de consumo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ninhnv/chon-1.0-12b-fast
- Variante con razonamiento (Chon-1.0-12B): https://huggingface.co/ninhnv/chon-1.0-12b
- Modelo base (google/gemma-4-12B-it): https://huggingface.co/google/gemma-4-12B-it
- Repositorio del servidor `chon`: https://github.com/xoai/chon
- JevBench: mencionado en la model card, sin URL en la información disponible
- Paper, blog o demo adicionales: no disponible en la información proporcionada
