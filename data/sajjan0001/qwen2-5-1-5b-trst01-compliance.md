# sajjan0001/qwen2.5-1.5b-trst01-compliance

## Resumen

`sajjan0001/qwen2.5-1.5b-trst01-compliance` es un adaptador LoRA (entrenado con QLoRA de 4 bits) sobre `Qwen/Qwen2.5-1.5B-Instruct`, publicado por el usuario sajjan0001. No es un modelo completo, sino un ajuste fino de dominio orientado a normativa de sostenibilidad y cumplimiento: EUDR (Reglamento europeo de deforestación), pasaportes digitales de producto (DPP/ESPR), mercados de carbono, CSRD/ESRS, cadena de custodia, trazabilidad agrícola, CSDDD y EPR. El problema que aborda es concreto: el conocimiento regulatorio de nicho no está presente en los datos de preentrenamiento web y los modelos generalistas lo responden mal, como documenta el propio autor.

El interés técnico está en la metodología más que en el tamaño: el autor reporta que un primer entrenamiento aplicando LoRA solo a las proyecciones de atención se estancó en torno al 63 % de precisión por token independientemente de la duración del entrenamiento, y que extender los adaptadores a las capas MLP (`gate/up/down_proj`) fue lo que desbloqueó el aprendizaje de conocimiento factual. Es un caso de estudio útil sobre dónde reside el conocimiento fáctico en transformadores pequeños y sobre el uso de conjuntos de datos diminutos (447 ejemplos) con parada temprana.

La relevancia práctica es limitada pero acotada: se trata de un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, licencia no declarada y sin benchmarks formales. Resulta adecuado para explorar ajuste fino de dominio, como componente de un sistema RAG o como punto de partida, no como servicio de cumplimiento normativo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformador decoder-only (Qwen2.5-1.5B-Instruct); LoRA aplicado a `q/k/v/o_proj` y `gate/up/down_proj` |
| Parámetros totales | 1 500 millones en el modelo base; número de parámetros del adaptador no disponible en la información proporcionada |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la ficha; no declarada por el autor |
| Tipos de cuantización | Entrenamiento con QLoRA en 4 bits NF4 (rank 32, alpha 64). El adaptador se publica sin cuantizar; no se declaran versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible; el autor indica que el modelo no se ha probado con entradas multilingües |
| Licencia | No disponible |
| Formato de pesos | Adaptador PEFT (`library_name: peft`); formato de fichero concreto no indicado |

## Arquitectura y entrenamiento

El modelo es un ajuste QLoRA sobre `Qwen/Qwen2.5-1.5B-Instruct`. La cuantización de 4 bits NF4 se aplica al modelo base durante el entrenamiento y los adaptadores LoRA se entrenan en precisión de 16 bits con rank 32 y alpha 64. Los adaptadores se insertan tanto en las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) como en las capas MLP (`gate_proj`, `up_proj`, `down_proj`). El autor documenta explícitamente que la variante limitada a atención se estancó alrededor del 63 % de precisión por token sin importar la duración del entrenamiento, y atribuye la mejora a que el conocimiento factual de estos modelos reside mayoritariamente en las capas MLP.

El conjunto de datos son 447 ejemplos escritos a mano que cubren EUDR, DPP/ESPR, mercados de carbono, CSRD/ESRS, cadena de custodia, trazabilidad agrícola, CSDDD y EPR. El entrenamiento usó parada temprana (`load_best_model_at_end` con paciencia 2) y se detuvo por sí solo en la época 4, con la pérdida bajando de 2,6 a 0,92. No se menciona RLHF, DPO ni ninguna otra etapa de alineación posterior; tampoco se documentan el número de tokens de entrenamiento, la composición lingüística del dataset ni técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Respuesta a preguntas sobre EUDR: definición del reglamento, fecha de corte de 2020 y materias primas cubiertas (vacuno, aceite de palma, cacao, café, caucho, madera, cuero y soja), según los ejemplos del autor.
- Explicación de conceptos de cadena de custodia, incluida la diferencia entre balance de masas e identidad preservada.
- Conocimiento declarado sobre pasaportes digitales de producto (DPP/ESPR), mercados de carbono, CSRD/ESRS, CSDDD, EPR y trazabilidad agrícola.
- Generación de texto conversacional y seguimiento de instrucciones heredados del modelo base Qwen2.5-1.5B-Instruct.
- Soporte de plantilla de chat mediante `apply_chat_template` con roles de usuario y asistente.
- Tool calling / function calling: no declarado por el autor; debe asumirse como no garantizado tras el ajuste.
- Capacidades de agente y razonamiento multi-paso: no declaradas ni evaluadas.
- Capacidades multilingües: no declaradas ni probadas; el autor señala explícitamente que no se ha probado con varios idiomas.
- Modo de razonamiento explícito (thinking), visión o audio: no disponibles.
- No se declara ninguna capacidad de visión, audio u otras modalidades.

## Casos de uso

- Asistente interno de dudas normativas: desplegado como chatbot de apoyo para equipos de cumplimiento que necesitan una primera respuesta rápida sobre EUDR, CSRD o CSDDD, con la salvedad de que las respuestas deben validarse contra el texto legal.
- Componente generativo de un sistema RAG: el propio autor propone emparejar el modelo con recuperación para que las respuestas se fundamenten en texto fuente citado en lugar de depender únicamente del recuerdo del ajuste fino; el modelo actuaría como redactor de la respuesta final a partir de los fragmentos recuperados.
- Preetiquetado de datos de cumplimiento: generar borradores de clasificación o resumen de documentos regulatorios que después revisa un analista, aprovechando el vocabulario específico del dominio aprendido.
- Prototipado y validación de pipelines de ajuste fino: sirve como referencia reproducible para equipos que quieren medir el efecto de extender LoRA a las capas MLP frente a atención sola en modelos de 1,5B con datasets pequeños.
- Formación interna: generación de material divulgativo y ejemplos explicativos sobre deforestación, cadena de custodia o pasaportes digitales de producto para onboarding de personal no técnico.
- Experimentación académica sobre conocimiento factual en modelos pequeños: escenario controlado para estudiar cómo se codifica y se recupera conocimiento de nicho en un modelo de 1,5B con 447 ejemplos.
- Filtro o triaje previo en herramientas de cumplimiento: detectar si una consulta entrante pertenece al dominio de sostenibilidad y enrutarla al sistema adecuado, aprovechando que el modelo pequeño es barato de ejecutar.
- Despliegue en el borde o en portátil: dado su tamaño, puede ejecutarse localmente como asistente de consulta puntual sin conexión a servicios externos, siempre que la licencia final lo permita (actualmente no declarada).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay cifras de MMLU, HumanEval, GSM8K ni de ninguna otra suite estándar. El autor aporta únicamente dos comparaciones cualitativas entre el modelo base y el ajustado sobre preguntas no presentes en los datos de entrenamiento:

| Consulta | Qwen2.5-1.5B-Instruct (base) | Adaptador de cumplimiento |
|---|---|---|
| "What is EUDR and which companies does it apply to?" | Identifica EUDR como "Regulation" de protección de datos y describe obligaciones tipo GDPR | Identifica correctamente el Reglamento europeo de deforestación, la fecha de corte de 2020 y las materias primas cubiertas |
| "What is the difference between mass balance and identity preserved chain of custody?" | Inventa un estándar ISO inexistente | Explica correctamente que el balance de masas permite mezclar material certificado y no certificado sin invalidar la certificación, mientras que identidad preservada exige separación física y líneas de procesamiento dedicadas |

El autor indica que ambas respuestas siguen conteniendo imprecisiones menores y remite a `eval_results.md` en el repositorio de GitHub para las transcripciones completas. La pérdida de entrenamiento pasó de 2,6 a 0,92, dato que no equivale a una métrica de calidad downstream.

## Requisitos de hardware

- Modelo base de 1 500 millones de parámetros; el adaptador añade una huella pequeña en relación con el base (cifra exacta no disponible).
- Inferencia en FP16: aproximadamente 3 GB de pesos del modelo base, en torno a 4 GB de VRAM contando caché de clave-valor y overhead.
- Inferencia en 8 bits: aproximadamente 1,6 GB de pesos, alrededor de 2,5 GB de VRAM.
- Inferencia en 4 bits (NF4/GPTQ): aproximadamente 1 GB de pesos, alrededor de 2 GB de VRAM.
- Cabe sin problema en GPU de consumo: RTX 3060 6 GB, RTX 4060 8 GB, RTX 3080, RTX 4070, RTX 4090 (esta última muy sobredimensionada para este tamaño). También es viable en CPU con llama.cpp tras fusionar el adaptador.
- GPU de centro de datos (A100, H100) no son necesarias; solo tendrían sentido para servir muchas réplicas concurrentes.
- Opciones de despliegue: `transformers` + `peft` cargando el adaptador sobre el base (método documentado por el autor), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, y llama.cpp/Ollama tras fusionar con `merge_and_unload` y convertir a GGUF. LiteLLM u otros proxies pueden envolver cualquiera de estas opciones.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No se conocen adaptadores públicos comparables de dominio de sostenibilidad y cumplimiento en este rango de tamaño, por lo que la comparación se establece con alternativas generalistas de tamaño similar.

| Modelo | Parámetros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador | 1,5B + LoRA | No disponible | Adaptador PEFT de dominio | No disponible | HuggingFace |
| Qwen2.5-1.5B-Instruct | 1,5B | 32 768 tokens (según documentación de Qwen) | Modelo instruct generalista | Apache-2.0 (según Qwen) | HuggingFace |
| Llama-3.2-3B-Instruct | 3B | 128 000 tokens (según Meta) | Modelo instruct generalista | Llama 3.2 Community License | HuggingFace |
| SmolLM2-1.7B-Instruct | 1,7B | 8 192 tokens (según HuggingFace) | Modelo instruct generalista | Apache-2.0 (según HuggingFace) | HuggingFace |

Los datos de contexto y licencia de las alternativas provienen de la documentación de sus fabricantes y no se han verificado dentro de la información proporcionada para este modelo. En rendimiento no hay comparación posible: el adaptador no publica métricas cuantitativas y las alternativas generalistas no cubren el dominio regulatorio específico.

## Limitaciones y advertencias

- El propio autor señala que 1 500 millones de parámetros y unos 450 ejemplos son un punto de partida, no una escala de producción.
- No se ha probado con entradas reales desordenadas: documentos escaneados con OCR, formatos heterogéneos o idiomas distintos del inglés.
- Las respuestas del modelo contienen imprecisiones menores incluso en los ejemplos que el autor presenta como exitosos; el README remite a un análisis honesto de lo que sigue estando mal.
- Riesgo de alucinación en cualquier materia regulatoria no cubierta por los 447 ejemplos, incluidas actualizaciones normativas posteriores al entrenamiento. La recomendación explícita del autor es combinarlo con RAG y fundamentar las respuestas en texto fuente citado.
- Licencia no declarada: no hay base legal explícita para uso comercial. Conviene contactar con el autor o tratar el artefacto como no apto para producción hasta aclararlo.
- El repositorio figura con un tamaño de 0,0 GB, lo que sugiere que los pesos del adaptador podrían no estar subidos o ser mínimos. Conviene verificar el listado de ficheros antes de intentar la descarga.
- La fecha de creación registrada (2026-09-16) es posterior a la fecha de consulta habitual, lo que apunta a una anomalía de metadatos que no debe interpretarse como una versión estable o mantenida.
- Cero descargas y cero interacciones: no hay validación independiente por parte de terceros.
- Al ser un adaptador LoRA, su comportamiento depende por completo del modelo base; degradaciones o sesgos del base (Qwen2.5-1.5B-Instruct) se heredan, incluidos los sesgos presentes en sus datos de preentrenamiento.
- Vocabulario y respuestas previsiblemente en inglés, dado que el dataset se describe en inglés y no se declaran idiomas soportados; no hay evidencia de calidad en castellano.
- El ajuste no declara soporte de tool calling ni de razonamiento multi-paso; quien lo integre en un agente debe validar esas capacidades por su cuenta.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/sajjan0001/qwen2.5-1.5b-trst01-compliance)
- [Repositorio con el análisis completo, dataset y cuaderno de entrenamiento](https://github.com/Sajjan001/Fine-tuning-Qwen2.5-1.5B-on-sustainability-compliance-data)
- [Modelo base Qwen/Qwen2.5-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct)

Nota sobre la búsqueda web: los resultados recuperados no contienen ninguna referencia al modelo ni al dominio de sostenibilidad; corresponden íntegramente a la película *School of Rock* (JustWatch, Paramount+, Prime Video, MYmovies, Rakuten TV). No se ha encontrado documentación externa, paper, demo ni artículo de blog relevante más allá del repositorio de GitHub enlazado en la propia model card.
