# hitheshkaranth/skanda-grounding

## Resumen

Skanda es un modelo de segmentación y *grounding* médico desarrollado por el usuario hitheshkaranth, orientado a imagen radiológica (radiografía de tórax, TC y RM). Combina un backbone de visión-lenguaje Qwen3-VL-30B-A3B-Instruct con el segmentador SAM 2.1 a través del framework Sa2VA, de modo que no solo detecta y nombra hallazgos, sino que además genera máscaras y cajas delimitadoras sobre la lesión descrita. El modelo se distribuye como un *fine-tune* del checkpoint ByteDance/Sa2VA-Qwen3-VL-4B sobre el backbone mayor de Qwen.

El problema que aborda es doble: por un lado, la mayoría de los modelos de visión-lenguaje médicos (por ejemplo MedGemma 27B) tienden a marcar casi cualquier estudio como anormal y rara vez localizan espacialmente el hallazgo; por otro, los segmentadores puros no aportan etiqueta semántica. Skanda intenta cubrir ambos frentes con una única salida imagen-texto que incluye tipo de hallazgo, caja y máscara.

Es relevante ahora porque los modelos de *grounding* médico con localización explícita empiezan a ser viables sobre backbones abiertos de tipo MoE, y porque el autor publica resultados comparativos en conjuntos de test retenidos frente a MedGemma 27B y MAIRA-2. La licencia, sin embargo, es privada (`skanda-private`), lo que limita seriamente su uso fuera del ámbito de investigación del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida visión-lenguaje + segmentación: backbone Qwen3-VL-30B-A3B (MoE) con cabecera SAM 2.1 vía Sa2VA |
| Parametros totales | no disponible (el repo ocupa 63,1 GB; el backbone declarado es de 30B) |
| Parametros activos | no disponible con precision (el backbone Qwen3-VL-30B-A3B es MoE con 3B activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor menciona una sección de memoria y cuantización en la model card, sin cifras en la información disponible) |
| Idiomas soportados | en |
| Licencia | other / skanda-private (uso restringido, no comercial abierto) |
| Formato de pesos | safetensors |
| Pipeline | image-text-to-text |
| Modalidades de entrada | radiografía de tórax, TC, RM |
| Modelos base | Qwen/Qwen3-VL-30B-A3B-Instruct, ByteDance/Sa2VA-Qwen3-VL-4B |

## Arquitectura y entrenamiento

La arquitectura es un sistema compuesto. El componente lingüístico-visual es Qwen3-VL-30B-A3B-Instruct, un transformer de tipo mezcla de expertos (MoE) con 30B parámetros totales y aproximadamente 3B activos por token, lo que abarata la inferencia respecto a un denso del mismo tamaño. Sobre esa base, el framework Sa2VA acopla el segmentador SAM 2.1 (referenciado como SAM 2.1 en la model card), que produce máscaras a partir de las representaciones o *prompts* generados por el modelo de lenguaje. El resultado es un modelo imagen-texto que emite simultáneamente la etiqueta del hallazgo y su localización espacial.

El autor declara que el entrenamiento se hizo exclusivamente con datos con licencia comercial, y publica dos *runs*: el `run2` (octubre de 2026), mejor en radiografía de tórax para casos normales y precisión de cajas, y el `run3` (1 de noviembre de 2026, rama `main`), mejor en TC y RM. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. La evaluación se realiza sobre casos de test retenidos, con la afirmación de que ningún paciente de test apareció en entrenamiento.

## Capacidades

- Generación de texto descriptivo de hallazgos radiológicos a partir de imagen (radiografía de tórax, TC, RM).
- *Grounding* espacial: emisión de cajas delimitadoras asociadas a cada hallazgo nombrado.
- Segmentación de instancias mediante SAM 2.1, con máscaras por lesión.
- Clasificación de normalidad/anormalidad por estudio (capacidad de "limpiar" casos sin lesión).
- Etiquetado del tipo de hallazgo (qué patología es la delimitada).
- Procesamiento multimodal imagen-texto en un único pipeline (`image-text-to-text`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a inglés (`en`).
- Capacidades especiales: salida conjunta de texto + cajas + máscaras; no se documentan modos de *thinking*, audio ni vídeo.

## Casos de uso

- **Triaje de radiología torácica**: el modelo puede procesar una radiografía de tórax y devolver si el estudio es normal o anormal junto con el tipo de hallazgo; en el *run2* acierta el 83% de los normales, lo que permite priorizar en una lista de trabajo los estudios sospechosos y descartar rápidamente los limpias.
- **Prelectura asistida en TC**: con 340 casos de test y un 91% de normales correctamente descartados y un 72% de tipo de hallazgo correcto, encaja como generador de borradores de informe que el radiólogo revisa y corrige, reduciendo el tiempo de dictado en estudios volumétricos.
- **Localización de lesiones en RM**: las métricas de precisión y *recall* de caja (70% y 65% en el *run3*) permiten usar el modelo para preanotar regiones de interés en estudios de RM y alimentar herramientas de medición o de seguimiento longitudinal.
- **Anotación semiautomática de datasets**: las máscaras de SAM 2.1 combinadas con la etiqueta textual permiten generar pares imagen-máscara-etiqueta para entrenar otros modelos, con revisión humana posterior; útil en equipos que construyen corpus radiológicos propios.
- **Control de calidad de informes**: dado un informe previo y la imagen, el modelo puede comprobar si el hallazgo descrito está espacialmente localizado y etiquetado de forma coherente, señalando discrepancias entre texto y región anatómica.
- **Investigación en *grounding* médico**: al estar construido sobre Sa2VA + Qwen3-VL, sirve como referencia reproducible para estudiar el acoplamiento entre un VLM MoE y un segmentador, y para comparar estrategias de *prompting* espacial.
- **Formación y docencia**: las cajas y máscaras superpuestas sobre la imagen facilitan material didáctico interactivo para residentes, siempre con supervisión experta y sin uso clínico.

## Benchmarks y rendimiento

Resultados en porcentaje sobre casos de test retenidos, según la model card del autor. Mayor es mejor; en negrita el mejor de cada fila.

| Modalidad | Métrica | MedGemma 27B | MedGemma + MAIRA-2 | Skanda run 2 | Skanda run 3 |
|---|---|---|---|---|---|
| Radiografía (111 films) | Anormal detectado | 90 | **91** | 85 | 84 |
| Radiografía | Normales correctos | 72 | 72 | **83** | 69 |
| Radiografía | Tipo de hallazgo correcto | 41 | **47** | 37 | 40,5 |
| Radiografía | Precisión de caja | 6 | – | **28** | 25,5 |
| Radiografía | *Recall* de caja | 4 | – | **15,5** | 10 |
| TC (340 casos) | Anormal detectado | **97** | – | 80 | 82 |
| TC | Normales correctos | 6 | – | 88 | **91** |
| TC | Tipo de hallazgo correcto | 49 | – | 69 | **72** |
| TC | Precisión de caja | 1 | – | 20 | **22** |
| TC | *Recall* de caja | 3 | – | 14 | **16** |
| RM (240 casos) | Anormal detectado | **99** | – | 89 | 89 |
| RM | Normales correctos | 2 | – | **97** | 94 |
| RM | Tipo de hallazgo correcto | 42 | – | 87 | **89** |
| RM | Precisión de caja | 6 | – | 64 | **70** |
| RM | *Recall* de caja | 8 | – | 59 | **65** |

Lectura de los datos: en TC y RM el modelo supera ampliamente a MedGemma 27B en tipo de hallazgo y en descarte de normales (MedGemma marca casi todo como anormal: 6% y 2% de normales correctos). En radiografía de tórax el *run3* mejora el tipo de hallazgo (40,5 frente a 37) pero retrocede en descarte de normales (69 frente a 83) y en *recall* de caja (10 frente a 15,5) respecto al *run2*. No se han publicado resultados de benchmarks estándar tipo MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con cifras exactas en la información proporcionada. Como referencia, un backbone MoE de 30B totales con ~3B activos más la cabecera SAM 2.1 requiere, en precisión de 16 bits, del orden de decenas de GB; el repo completo ocupa 63,1 GB, lo que sugiere pesos en varios formatos o *checkpoints*.
- GPU recomendadas: no especificadas por el autor. Por tamaño, un despliegue cómodo apunta a A100 80 GB o H100; en consumer, una RTX 4090 (24 GB) solo sería viable con cuantización agresiva y probablemente con *offload* parcial, algo no confirmado en la información disponible.
- ¿Cabe en consumer GPU?: no disponible; el autor menciona una sección de memoria y cuantización en la model card, pero no se han podido extraer cifras concretas.
- Opciones de despliegue: la librería declarada es `sam2`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible. El pipeline `image-text-to-text` sugiere uso vía Transformers con el código de Sa2VA.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Localización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Skanda (run 3) | 30B totales (MoE, ~3B activos) + SAM 2.1 | no disponible | RX, TC, RM | Cajas + máscaras | skanda-private | HuggingFace, repo 63,1 GB |
| MedGemma 27B | 27B | no disponible | Imagen médica (RX, TC, RM) | Sin cajas nativas | licencia abierta de Google (no verificada aquí) | HuggingFace |
| MAIRA-2 | no disponible | no disponible | Radiografía de tórax | Cajas | licencia de Microsoft (no verificada aquí) | HuggingFace |
| Sa2VA-Qwen3-VL-4B | 4B | no disponible | Imagen general | Cajas + máscaras | según modelo base | HuggingFace |

Skanda se diferencia por cubrir tres modalidades con localización explícita y por el descarte de normales en TC y RM, donde MedGemma falla de forma sistemática. Frente a MAIRA-2, amplía el alcance más allá de la radiografía de tórax. La contrapartida es la licencia privada y la falta de datos de contexto y de requisitos de memoria publicados.

## Limitaciones y advertencias

- **Uso exclusivamente de investigación**: el autor lo declara explícitamente; no es un dispositivo médico ni está aprobado por ningún regulador.
- **Licencia `skanda-private`**: restringe el uso comercial y la redistribución; hay que contactar con el autor para cualquier uso fuera de investigación.
- **Sesgos y cobertura**: entrenado solo con datos con licencia comercial, lo que puede infrarepresentar poblaciones, equipos y protocolos de adquisición habituales en entornos públicos.
- **Riesgo de alucinación**: como todo VLM, puede nombrar hallazgos inexistentes o asignar cajas a regiones sin lesión; las métricas de precisión de caja en radiografía (25,5%) son bajas y obligan a revisión humana.
- **Falsos negativos**: en TC y RM detecta menos casos anormales que MedGemma (82% y 89% frente a 97% y 99%), de modo que no debe usarse como filtro único para descartar patología.
- **Idioma**: solo inglés; no hay soporte documentado de castellano.
- **Contexto**: no se publica la longitud de contexto, lo que impide planificar casos con series volumétricas largas o múltiples imágenes por estudio.
- **Reproducibilidad**: repositorio de 63,1 GB, dos *runs* con comportamiento distinto por modalidad y ausencia de detalles de entrenamiento (tokens, composición, RLHF/DPO), lo que dificulta replicar resultados.
- **Madurez**: 0 descargas y 0 *likes* en el momento de la consulta; no hay evidencia de uso independiente ni validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hitheshkaranth/skanda-grounding
- Modelo base Qwen3-VL-30B-A3B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-30B-A3B-Instruct
- Modelo base Sa2VA-Qwen3-VL-4B: https://huggingface.co/ByteDance/Sa2VA-Qwen3-VL-4B
- Referencia arXiv citada en los tags (arXiv:2501.04001): https://arxiv.org/abs/2501.04001
- Repositorio SAM 2: https://github.com/facebookresearch/sam2
- Paper Sa2VA: no disponible en la información proporcionada
- Blog o demo del autor: no disponible en la información proporcionada
