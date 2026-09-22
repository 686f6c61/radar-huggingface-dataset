# Jgmorenof/MILRIT_AT_CLEF2026

## Resumen

MILRIT @ CLEF HIPE-2026 es un clasificador de relaciones persona-lugar entrenado sobre prensa histórica multilingüe (alemán, inglés y francés). Lo firma el equipo MILRIT (Ha Ngan Pham, Jose G. Moreno y Antoine Doucet) como envío a la tarea compartida HIPE-2026 del congreso CLEF, y se publica en HuggingFace bajo el identificador `Jgmorenof/MILRIT_AT_CLEF2026`. No es un modelo generativo: recibe un par de menciones `(persona, lugar)` extraídas de un documento y devuelve dos etiquetas, `at` (si la persona está vinculada textualmente al lugar) e `isAt` (si la persona se encuentra allí en torno a un mes de la fecha de publicación).

Técnicamente parte de `microsoft/mdeberta-v3-base` (277.730.309 parámetros, ~277,7 M) y añade dos cabezas lineales sobre el vector `[CLS]`: `at_head` (768→3) y `isAt_head` (768→2). Su particularidad es el entrenamiento multi-vista con autodestilación: cada par se presenta en tres formas textuales paralelas (OCR bruto, análisis de cadena de pensamiento generado por un LLM y análisis de autoconsistencia del LLM) que comparten un único codificador, optimizado conjuntamente con entropía cruzada, una pérdida de consistencia JSD y una pérdida contrastiva InfoNCE.

Es relevante ahora porque ataca un problema clásico de las humanidades digitales —la extracción de relaciones sobre texto histórico con OCR ruidoso— con una arquitectura ligera que no necesita un LLM en inferencia: las vistas auxiliares son andamiaje solo de entrenamiento y en producción se usa únicamente el texto OCR. El checkpoint publicado corresponde a la época 7, con un recall macro global de 0,6618 en el conjunto de desarrollo, y el modelo acumula 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (mDeBERTa-v3-base) con codificador compartido tipo Siamese entre vistas y dos cabezas de clasificación sobre `[CLS]` |
| Parametros totales | 277.730.309 (~277,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el encoder base mDeBERTa-v3-base estándar admite 512 tokens |
| Tipos de cuantizacion | no disponibles; solo se publican pesos en safetensors (el repositorio ocupa 1,1 GB, consistente con precisión fp32) |
| Idiomas soportados | alemán (de), inglés (en), francés (fr) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json` + código personalizado (`configuration_milrit.py`, `modeling_milrit.py`, `__init__.py`), cargable con `trust_remote_code=True` |

Datos adicionales: tokenizador mDeBERTa-v3 (`spm.model`, `tokenizer.json`) ampliado con tokens especiales específicos de la tarea; el repositorio incluye `train_results.json` con la mejor época y el recall macro de desarrollo; el checkpoint publicado se corresponde con la época 7.

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo DeBERTa-v3 en su variante multilingüe base. El autor describe el codificador como compartido por pesos (Siamese) entre las tres vistas de entrada. Sobre la representación `[CLS]` se aplican dos cabezas lineales: `at_head` (768→3, etiquetas TRUE/PROBABLE/FALSE) e `isAt_head` (768→2, etiquetas TRUE/FALSE). Existe además una cabeza de proyección (`proj`) usada para la pérdida contrastiva, que se conserva en los pesos pero no se emplea en inferencia.

El entrenamiento combina tres señales: entropía cruzada sobre las tres vistas, una pérdida de consistencia basada en divergencia Jensen-Shannon (JSD) entre las distribuciones de las vistas y una pérdida contrastiva InfoNCE entre vistas. La idea es transferir la señal de razonamiento procedente de análisis generados por un LLM al codificador, de modo que en producción baste con el texto OCR bruto (`encode_single`). El modelo base es `microsoft/mdeberta-v3-base` afinado, según indican las etiquetas del repositorio (`base_model:finetune`). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas adicionales de RLHF o DPO; tampoco se detalla el esquema de decodificación, ya que no se trata de un modelo autoregresivo.

## Capacidades

- Clasificación de relaciones persona-lugar: determina si una persona mencionada está vinculada a un lugar (`at`) y si se encuentra allí en la ventana temporal de aproximadamente un mes respecto a la fecha de publicación (`isAt`).
- Etiquetado con grados de certeza en la tarea `at` (TRUE, PROBABLE, FALSE) y etiquetado binario en `isAt` (TRUE, FALSE).
- Procesamiento de texto histórico multilingüe en alemán, inglés y francés, incluyendo OCR ruidoso de prensa digitalizada.
- Trabajo sobre pares de menciones ya extraídas: requiere un componente previo de reconocimiento de entidades (NER) que aporte las menciones de persona y lugar.
- Capacidad de aprovechar señal derivada de razonamiento (cadena de pensamiento y autoconsistencia) destilada en el encoder, sin necesidad de invocar un LLM en el momento de la inferencia.
- No soporta tool calling ni function calling.
- No está diseñado como agente ni para razonamiento multi-paso en el sentido de los modelos generativos.
- No dispone de modo "thinking" explícito en inferencia, ni capacidades de visión, audio o generación de texto libre.
- No se documentan capacidades de matemáticas, generación de código ni instrucciones de propósito general, al ser un clasificador especializado.

## Casos de uso

- Enriquecimiento de archivos de prensa histórica digitalizada: dado un corpus OCR con entidades ya detectadas, el modelo etiqueta cada par persona-lugar y permite construir índices temáticos y geográficos sin intervención humana masiva.
- Construcción de grafos de conocimiento históricos: los pares clasificados como TRUE alimentan un grafo con aristas persona-lugar fechadas, útil para prosopografía y estudios de redes sociales del pasado.
- Análisis de movilidad y desplazamientos históricos: la etiqueta `isAt` acotada a la ventana de un mes permite aproximar la presencia efectiva de una persona en una localidad en una fecha concreta, lo que sirve para estudiar itinerarios de figuras públicas.
- Búsqueda y recuperación documental con filtro geográfico: un buscador sobre hemeroteca puede incorporar `at` como señal de relevancia para consultas del tipo "personas relacionadas con esta ciudad en este periodo".
- Preanotación asistida para proyectos de humanidades digitales: el modelo genera una primera pasada de etiquetas que los anotadores humanos revisan, reduciendo el coste de anotación en corpus multilingües (DE/EN/FR).
- Validación y control de calidad de metadatos: contraste de los enlaces persona-lugar declarados en catálogos y fichas de archivo contra lo que realmente afirma el texto, marcando discrepancias.
- Participación en la tarea compartida CLEF HIPE-2026 y evaluación comparativa: sirve como línea base reproducible para equipos que quieran medir sus propios sistemas sobre el mismo conjunto de datos.
- Componente dentro de una cadena NER + RE en producción: integrado tras un modelo de reconocimiento de entidades, se ejecuta como servicio de clasificación por lotes sobre pares candidatos.

## Benchmarks y rendimiento

La información disponible solo incluye una métrica de desarrollo, aportada por el propio autor en la model card. No hay resultados de conjuntos de prueba ni comparaciones con otros sistemas publicadas en la información proporcionada.

| Conjunto | Metrica | Resultado |
|---|---|---|
| Desarrollo HIPE-2026 (mejor checkpoint, época 7) | Recall macro global | 0,6618 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de propósito general, y no serían aplicables a un clasificador de relaciones.

## Requisitos de hardware

- Pesos en fp32: aproximadamente 1,11 GB (277,7 M de parámetros × 4 bytes), consistente con el tamaño del repositorio (1,1 GB).
- Pesos en fp16/bf16: aproximadamente 556 MB, si se convierte el modelo.
- Pesos en int8: aproximadamente 278 MB de forma teórica; no se publican checkpoints cuantizados.
- VRAM estimada para inferencia: alrededor de 2 GB en fp32 contando activaciones y tokenizador; menos de 1 GB en fp16.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente. Se puede ejecutar con holgura en RTX 3060, RTX 4060, RTX 4090, y también en GPUs de centro de datos como A100 o H100, aunque estarán enormemente sobredimensionadas para un encoder de 277,7 M de parámetros.
- Cabe en GPU de consumo: sí, incluida gama de entrada con memoria suficiente. La inferencia en CPU también es viable para lotes pequeños.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requisito del autor), exportación a ONNX Runtime, TorchServe o cualquier servidor de inferencia compatible con modelos de clasificación de HuggingFace. No hay soporte de vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo generativo y no se publican pesos GGUF.
- Latencia y throughput: no disponibles. No se han publicado cifras en la información proporcionada, y el coste real dependerá del número de pares candidatos generados por el NER previo, que es el principal factor de escala.

## Comparativa con modelos similares

La comparación directa con otros envíos de HIPE-2026 no es posible porque no se han publicado en la información disponible. Se comparan a continuación alternativas de uso habitual para extracción de relaciones.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MILRIT @ CLEF HIPE-2026 | 277,7 M | no disponible (encoder base de 512 tokens) | Clasificación de relaciones persona-lugar en prensa histórica, etiquetas `at`/`isAt` | MIT | HuggingFace, requiere `trust_remote_code=True` |
| microsoft/mdeberta-v3-base | 278 M | 512 tokens | Encoder multilingüe de propósito general; no resuelve la tarea sin ajuste | MIT | HuggingFace, ampliamente usado |
| Babelscape/rebel-large | no verificado en la información disponible | no disponible | Extracción de relaciones generativa (texto a tripletas) | CC BY-NC-SA 4.0 (no comercial) | HuggingFace |
| Otros sistemas de HIPE-2026 | no disponible | no disponible | Extracción de relaciones en prensa histórica | no disponible | no publicados |

Diferencias clave: frente al encoder base, MILRIT aporta las cabezas específicas y el esquema de autodestilación multi-vista; frente a aproximaciones generativas como Rebel, MILRIT es más ligero y no requiere generar texto, pero solo cubre el par persona-lugar y no extrae tripletas abiertas. La licencia MIT de MILRIT permite uso comercial, a diferencia de alternativas con licencias no comerciales.

## Limitaciones y advertencias

- Modelo especializado y no generativo: no puede emplearse para generación de texto, resumen, código ni tareas de instrucción.
- Dependencia de un NER previo: recibe pares `(persona, lugar)` ya extraídos; los errores del componente anterior se propagan directamente.
- Espacio de etiquetas cerrado y reducido: `at` ∈ {TRUE, PROBABLE, FALSE} e `isAt` ∈ {TRUE, FALSE}; no modela otros tipos de relación.
- Rendimiento modesto y sin validación externa: el único dato publicado es un recall macro de 0,6618 en desarrollo, sin resultados de prueba. El modelo tiene 0 descargas y 0 likes, por lo que no ha sido reproducido ni auditado por terceros.
- Dominio restringido: entrenado sobre prensa histórica con OCR ruidoso en DE/EN/FR; el comportamiento en texto contemporáneo, en otros géneros o en otros idiomas no está documentado y probablemente se degrade.
- Sesgos históricos: los corpus de prensa de época reflejan sesgos de género, clase, origen y nacionalidad de la fuente original, que el modelo puede reproducir en sus clasificaciones.
- Riesgo de alucinación en sentido estricto: no aplica, porque el modelo no genera texto libre; el riesgo equivalente es la clasificación errónea con confianza alta, especialmente en la etiqueta intermedia PROBABLE.
- Ejecución de código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar `modeling_milrit.py` y `configuration_milrit.py` del repositorio. Conviene auditar ese código antes de usarlo en producción.
- Discrepancia de identificador: el ejemplo de la model card usa `jgmorenof/milrit-hipe2026-multiview`, mientras que el identificador real del repositorio es `Jgmorenof/MILRIT_AT_CLEF2026`. Hay que ajustar el código en consecuencia.
- Licencia MIT: permite uso comercial y modificación, pero no se documentan las licencias ni la procedencia de los datos de entrenamiento, por lo que la responsabilidad sobre posibles derechos sobre el corpus recae en quien despliega el modelo.
- Sin cuantizaciones publicadas ni soporte en motores de inferencia de alto rendimiento, lo que limita las optimizaciones de despliegue disponibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jgmorenof/MILRIT_AT_CLEF2026
- Modelo base: https://huggingface.co/microsoft/mdeberta-v3-base
- Cita del autor: Pham, H. N.; Moreno, J. G.; Doucet, A. "MILRIT at HIPE 2026: From Generalist Relation Extraction to Multi-view Learning for Historical Person--Place Relations", CLEF 2026 Working Notes, CEUR Workshop Proceedings, Jena (Alemania), septiembre de 2026. No se ha encontrado URL pública del paper en la información disponible.
- La búsqueda web realizada no devolvió enlaces relevantes al modelo: los resultados obtenidos correspondían a páginas comerciales de Amazon Alemania, sin relación con el modelo ni con CLEF HIPE-2026.
