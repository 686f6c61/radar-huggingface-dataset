# ApolloRaines/Pythia-1.4B-DNP-16750-Facts

## Resumen

Pythia-1.4B-DNP-16750-Facts es un checkpoint del modelo base EleutherAI/pythia-1.4b publicado por el usuario ApolloRaines, en el que se han implantado directamente en los pesos 16.750 hechos factuales mediante un pipeline denominado Neural Reclamation, atribuido a jBlaze. El objetivo declarado es un test de estrés de capacidad: determinar hasta qué punto un modelo de 1.400 millones de parámetros puede absorber conocimiento factual sin colapsar. Los hechos provienen del conjunto CounterFact-Tracing, derivado de Wikidata (relaciones de localización, ciudadanía, idioma, género y similares).

El modelo conserva la arquitectura GPT-NeoX del Pythia original, con 1.414.647.808 parámetros en formato BF16, y está orientado exclusivamente a generación de texto en inglés. Su interés no es tanto el rendimiento bruto como la demostración metodológica: según la model card, tras la inyección el modelo retiene un 55% de capacidad general frente al 60% de la línea base, con una perplejidad que sube de 13,3 a 18,3, y ofrece una recuperación directa de aproximadamente el 49,8% de los hechos.

La relevancia actual reside en la comparación con ajuste fino por gradiente: según el autor, LoRA colapsaba esta misma arquitectura con 50 o 125 hechos, mientras que este método habría cargado 335 veces más hechos manteniendo el modelo funcional. No obstante, la propia model card documenta discrepancias importantes entre el corpus publicado y el corpus de entrenamiento, lo que exige tratar las cifras con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder-only), heredada de EleutherAI/pythia-1.4b |
| Parametros totales | 1.414.647.808 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |
| Modelo base | EleutherAI/pythia-1.4b |
| Tamano del repositorio | 2,8 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Etiquetas | jblaze, dnp, neural-reclamation, knowledge-implant, pythia, stress-test |

## Arquitectura y entrenamiento

La arquitectura es la del Pythia-1.4B de EleutherAI: un transformer decoder-only de tipo GPT-NeoX con 1.400 millones de parámetros. El checkpoint no se ha obtenido mediante entrenamiento por descenso de gradiente convencional, sino mediante un procedimiento de edición de pesos denominado Neural Reclamation, que escribe los hechos directamente en las matrices del modelo. La model card indica que las capas afectadas incluyen módulos `mlp.dense_4h_to_h` (por ejemplo, las capas 11, 13 y 15), con diferencias relativas de Frobenius de 3,666e-02, 2,705e-02 y 1,441e-02 respectivamente frente al modelo base.

Los datos proceden de CounterFact-Tracing, un conjunto de 21.919 filas construido sobre tipos de relación de Wikidata. El autor afirma haber implantado 16.750 de esas filas. Un detalle técnico relevante documentado en la model card es que el checkpoint se almacena en BF16 mientras que el modelo base está en F16, lo que introduce una diferencia relativa de aproximadamente 1,7e-03 en todos los tensores, incluso en los que no se editaron; por tanto, cualquier comparación debe hacerse por magnitud y no por desigualdad binaria. No se especifican en la información disponible datos sobre número de tokens de entrenamiento, composición del dataset más allá de CounterFact-Tracing, ni uso de RLHF o DPO.

## Capacidades

- Generación de texto en inglés con coherencia mantenida tras la inyección de 16.750 hechos, según la model card.
- Recuperación de conocimiento factual implantado: 49,8% en recall directo y 49,3% en recall por paráfrasis, medidos por el autor.
- Razonamiento general preservado parcialmente: 55% de capacidad general frente al 60% de la línea base.
- Capacidad de respuesta a preguntas de tipo cloze sobre relaciones Wikidata (localización, ciudadanía, idioma, género).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión ni audio.
- Multilingüismo: únicamente inglés.

## Casos de uso

- Investigación sobre edición de conocimiento en modelos: el checkpoint sirve como referencia empírica para estudiar cuántos hechos puede absorber un modelo de 1,4B sin degradarse, comparando la curva de perplejidad y capacidad general frente al modelo base.
- Evaluación de métodos de inyección de pesos: útil para reproducir y contrastar el pipeline Neural Reclamation frente a alternativas como LoRA o fine-tuning completo, usando las métricas de recall directo y por paráfrasis.
- Auditoría de atribución de conocimiento: la model card documenta dos auditorías independientes con intervalos de confianza, lo que permite reutilizar el modelo como caso de estudio sobre cómo verificar qué hechos están realmente en los pesos.
- Docencia y divulgación técnica: ejemplo didáctico de los efectos de la precisión numérica (BF16 frente a F16) en la comparación de checkpoints, con cifras concretas de diferencia de Frobenius por capa.
- Pruebas de estrés de pipelines de evaluación: el modelo permite validar harnesses de evaluación de conocimiento factual en condiciones de capacidad limitada y alta densidad de hechos.
- Investigación sobre olvido catastrófico: la comparación documentada con LoRA (colapso a 50-125 hechos frente a 16.750) lo convierte en un punto de referencia para estudiar interferencia entre conocimiento inyectado y capacidades generales.

## Benchmarks y rendimiento

Datos publicados en la model card del autor (no verificados de forma independiente):

| Metrica | Baseline (0 hechos) | Tras 16.750 hechos |
|---|---:|---:|
| Capacidad general | 60,0% | 55,0% |
| Perplejidad | 13,3 | 18,3 |
| Recall directo | -- | 49,8% |
| Recall por paráfrasis | -- | 49,3% |

Comparación de métodos según el autor:

| Metodo | Hechos | Capacidad general | Perplejidad | Estado del modelo |
|---|---:|---:|---:|---|
| Gradiente (LoRA v1) | 50 | 10,0% | 459,6 | Colapsado |
| Gradiente (LoRA v2) | ~125 | 35,0% | 96,5 | Colapsado |
| Neural Reclamation | 16.750 | 55,0% | 18,3 | Funcional |

Auditorías de especificidad sobre el conjunto fuente (dNLL con IC al 95%):

| Grupo | Objetivo | dNLL | IC 95% |
|---|---|---:|---|
| Presente en el fichero publicado | verdadero | -1,95 | [-2,25, -1,68] |
| Presente en el fichero publicado | falso | -1,07 | [-1,44, -0,71] |
| Ausente del fichero publicado | verdadero | -2,08 | [-2,38, -1,80] |
| Ausente del fichero publicado | falso | -0,83 | [-1,18, -0,49] |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia orientativa para un modelo de 1,4B en BF16, el peso ronda los 2,8 GB, por lo que la inferencia requeriría al menos unos 4-6 GB de VRAM incluyendo caché KV, aunque esta cifra no la proporciona la información disponible.
- GPU recomendadas: no disponible en la información proporcionada.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 8 GB o más, dado el tamaño del checkpoint, aunque no se confirma en la documentación disponible.
- Opciones de despliegue: la etiqueta `text-generation-inference` y `endpoints_compatible` sugiere compatibilidad con TGI y endpoints de Hugging Face. No se documentan otras opciones como vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Pythia-1.4B-DNP-16750-Facts | 1,41B | no disponible | Inyeccion de 16.750 hechos via Neural Reclamation | no disponible | Hugging Face |
| EleutherAI/pythia-1.4b | 1,41B | no disponible | Modelo base sin edicion | Apache 2.0 (segun el modelo base, no confirmado en esta ficha) | Hugging Face |
| Variante LoRA v2 (referencia del autor) | 1,41B | no disponible | Fine-tuning por gradiente con ~125 hechos | no disponible | No publicada |

La comparación más directa es contra el propio modelo base, ya que el checkpoint es una edición del mismo. Frente a alternativas de la misma categoría (modelos de ~1,4B para generación de texto en inglés), no se dispone de datos de benchmarks comparables en la información proporcionada.

## Limitaciones y advertencias

- El fichero `facts_maxout.json` incluido en el repositorio no es el corpus de entrenamiento: contiene 27.081 entradas, de las cuales solo 1.000 son hechos CounterFact-Tracing, y el resto son preguntas tipo MMLU sin relación con el modelo. Las 1.000 son una muestra aleatoria del dataset fuente, no un prefijo.
- Las auditorías del propio autor no permiten fijar el número exacto de hechos implantados: el efecto medido es consistente con 16.750, pero también con 12.000 o con las 21.919 filas completas del dataset.
- La comparación con el modelo base debe hacerse por magnitud de diferencia, no por igualdad de tensores, debido al cambio de precisión de F16 a BF16 (diferencia relativa base de ~1,7e-03).
- Riesgo de alucinación: no cuantificado en la información disponible; la perplejidad aumenta de 13,3 a 18,3, lo que indica cierta degradación de la fluidez.
- Pérdida de capacidad general de 5 puntos porcentuales (60% a 55%), con posible impacto en tareas de razonamiento no evaluadas.
- Idioma limitado a inglés; no se documenta soporte multilingüe.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. El modelo base Pythia se distribuye habitualmente bajo Apache 2.0, pero esta ficha no confirma la licencia del checkpoint derivado.
- Modelo orientado a investigación y test de estrés, no a producción: no hay garantías de robustez, seguridad ni alineación.
- Sin datos publicados de benchmarks estándar ni de latencia/throughput.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Pythia-1.4B-DNP-16750-Facts
- Modelo base: https://huggingface.co/EleutherAI/pythia-1.4b
- Dataset fuente citado: https://huggingface.co/datasets/NeelNanda/counterfact-tracing
