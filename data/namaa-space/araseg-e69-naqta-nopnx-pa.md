# NAMAA-Space/araseg-e69-naqta-nopnx-pa

## Resumen
AraSeg 2026 · e69 (NAMAA-Space/araseg-e69-naqta-nopnx-pa) es un miembro individual del sistema NoPnx-PA desarrollado por NAMAA-Space para la tarea compartida de segmentación del árabe AraSeg, enmarcada en ArabicNLP 2026. Se trata de un modelo de clasificación de tokens (pipeline token-classification) obtenido mediante ajuste fino completo únicamente del codificador de MostafaMaroof/Naqta, con una cabeza nueva, sobre un total de 560 millones de parámetros. Su salida son probabilidades de frontera por palabra que después consume un decodificador estructural MEMM ajustado fuera de fold (OOF) sobre ocho miembros.

No es un segmentador autónomo. La propia model card advierte que, usado en solitario, no reproduce ninguna puntuación publicada, porque sus probabilidades por palabra no están calibradas y los pesos del combinador y los umbrales residen en el sistema completo NAMAA-Space/araseg-2026, con umbral de sistema fijado en 0,46. La relevancia del modelo es doble: documenta una de las participaciones abiertas en AraSeg 2026 y, además, funciona como punto de comparación controlado frente a la variante e17, de receta idéntica byte a byte, donde la única variable es la inicialización (punctuation-aware en e69), con un peso de decodificador declarado de +0,1209.

El artefacto se distribuye como un state_dict de PyTorch, no como checkpoint en formato Hugging Face, bajo licencia MIT heredada del modelo base y con soporte exclusivo para árabe. Entró en el bloqueo ("lock") de la compuerta conjunta del 2026-08-02 después de haber sido rechazado individualmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador transformer basado en MostafaMaroof/Naqta con cabeza de clasificación de tokens nueva; detalles internos de la base no disponibles |
| Parametros totales | 560 millones (segun la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Arabe (ar) |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | PyTorch state_dict (best_NoPnx_PA.pt); no es un checkpoint en formato Hugging Face |
| Subtarea | NoPnx-PA |
| Rol en el sistema | Miembro de un decodificador estructural MEMM ajustado OOF sobre 8 miembros |
| Umbral del sistema | 0,46 |

## Arquitectura y entrenamiento
El modelo es un codificador transformer ajustado con fine-tuning completo (encoder only) y una cabeza de clasificación de tokens inicializada desde cero, partiendo de MostafaMaroof/Naqta. El entrenamiento reportado en la model card se cifra en 560 millones de parámetros y emplea una inicialización punctuation-aware; el resto de la receta es byte-idéntica a la del miembro e17, de modo que la única variable experimental entre ambos es precisamente esa inicialización. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineamiento (no disponibles).

La innovación destacable es metodológica más que arquitectónica: e69 no se evalúa de forma aislada, sino como votante dentro de un decodificador estructural MEMM ajustado fuera de fold sobre ocho miembros. La propia model card indica que el modelo fue rechazado en solitario y solo entró en el bloqueo de la compuerta conjunta del 2026-08-02 como parte del conjunto. El modelo aporta un peso de decodificador de +0,1209 según la documentación del autor.

## Capacidades
- Clasificación de tokens orientada a segmentación de texto árabe (subpalabra o frontera de palabra, según la subtarea NoPnx-PA).
- Producción de probabilidades de frontera por palabra, sin calibrar, pensadas para ser consumidas por un combinador externo.
- Inicialización punctuation-aware, que incorpora información de puntuación en el punto de partida del ajuste fino.
- No genera texto libre: no es un modelo generativo ni de lenguaje en el sentido de completado de secuencias.
- No dispone de soporte documentado de tool calling ni de function calling.
- No dispone de soporte documentado de agentes ni de razonamiento multi-paso.
- Capacidad multilingüe: no disponible; el modelo declara únicamente árabe (ar).
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso
- Reproducción del sistema AraSeg 2026: e69 se emplea como uno de los ocho miembros del decodificador MEMM del sistema NoPnx-PA, de modo que su uso realista es reconstruir la puntuación publicada cargando los pesos del combinador y el umbral de 0,46 del repositorio del sistema completo.
- Ablación controlada de inicialización: al compartir receta byte a byte con e17, permite aislar el efecto de la inicialización punctuation-aware midiendo la variación de macro-F1 del sistema final (peso de decodificador declarado de +0,1209).
- Investigación en decodificación estructural: sirve como pieza de entrada para estudiar decodificadores MEMM ajustados fuera de fold, ya que aporta probabilidades por palabra no calibradas que el decodificador debe integrar junto a las de los otros siete miembros.
- Preprocesado de corpus árabes dentro de un pipeline mayor: los usuarios que necesiten segmentación pueden integrar este miembro siempre que aporten el resto del ensemble y el combinador, obteniendo fronteras de palabra como paso previo a tareas posteriores de PNL árabe.
- Generación de características para modelos posteriores: las probabilidades de frontera por palabra pueden exportarse como señales intermedias para sistemas de etiquetado, normalización o análisis morfológico que se entrenen sobre dichas probabilidades.
- Evaluación comparativa de miembros de ensemble: al disponer de un miembro individual con pesos reproducibles y umbral conocido, es adecuado para experimentos de selección de subconjuntos de votantes y de sensibilidad al umbral (por ejemplo, variaciones alrededor de 0,46).
- Auditoría y verificación fuera de clúster: la model card hace referencia a scripts como ensemble.py y verify_offcluster.py, de modo que el modelo puede usarse para validar que la reconstrucción de la arquitectura y la carga del state_dict coinciden con el entorno original.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks a nivel de miembro en la información disponible. Los únicos datos numéricos recogidos corresponden al sistema completo, no a este modelo de forma aislada:

| Metrica | Valor | Alcance |
|---|---|---|
| Macro-F1 en practice test | 87,82 | Sistema NoPnx-PA completo |
| Macro-F1 en blind | 89,9 | Sistema NoPnx-PA completo |
| Peso de decodificador aportado | +0,1209 | Miembro e69 |

Cualquier comparación con MMLU, HumanEval, GSM8K u otros benchmarks generales no está disponible ni es aplicable, dado que el modelo resuelve una tarea de etiquetado de tokens específica del árabe. No se deben atribuir a este miembro las cifras del sistema.

## Requisitos de hardware
- VRAM estimada para inferencia: del orden de 2,2 GB en fp32 y 1,1 GB en fp16, calculada a partir de los 560 millones de parámetros declarados; el dato exacto no está publicado.
- Tamano del repositorio: 2,2 GB, coherente con un state_dict en precisión completa.
- Cabe en GPU de consumo: sí, por el tamaño del modelo y su condición de codificador de 560 M; cualquier GPU con al menos 4 GB de VRAM en fp32 debería ser suficiente.
- GPU recomendadas: no disponibles de forma explícita; por tamaño, una RTX 4090, RTX 3090 o incluso tarjetas de gama media serían suficientes, aunque no hay datos publicados de latencia.
- Opciones de despliegue: no se soportan vLLM, llama.cpp, Ollama ni TGI, ya que los pesos son un state_dict de PyTorch y no un checkpoint en formato Hugging Face; la carga requiere reconstruir la arquitectura a partir del YAML de configuración del experimento y del modelo base. Los cinco miembros LoRA del ensemble requieren transformers==5.12.1, según la model card.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares
No se dispone de datos públicos de modelos comparables de la misma categoría para esta tarea compartida. La comparación más informativa es interna al propio sistema:

| Modelo | Parametros | Inicializacion | Rol | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| araseg-e69-naqta-nopnx-pa | 560 M | Punctuation-aware | Miembro de ensemble (NoPnx-PA) | MIT | HuggingFace |
| araseg e17 (miembro hermano) | 560 M (receta byte-identica) | Distinta a e69 | Miembro de ensemble | MIT | HuggingFace (no verificado en esta busqueda) |
| MostafaMaroof/Naqta | no disponible | no disponible | Modelo base | no disponible | HuggingFace |

No se conocen alternativas externas de la misma tarea con datos verificables en la información proporcionada.

## Limitaciones y advertencias
- No es un segmentador autónomo: usado solo no reproduce ninguna puntuación publicada; su salida son probabilidades por palabra sin calibrar.
- Dependencia del ensemble: requiere el combinador y el umbral (0,46) del sistema NAMAA-Space/araseg-2026; sin ellos el modelo no es funcional por sí mismo.
- Carga no estandar: from_pretrained no funciona. El archivo es un state_dict puro y hay que construir la arquitectura desde el YAML del experimento y el modelo base antes de inyectar los pesos.
- Compatibilidad de versiones: los miembros LoRA del ensemble necesitan transformers==5.12.1; el stack completo está fijado en requirements-llm.txt del repositorio de código.
- Idioma: solo árabe (ar). No hay soporte multilingüe declarado.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de fronteras de segmentación incorrectas en dominios alejados de los datos de la tarea, dado que las probabilidades no están calibradas.
- Limitaciones de contexto: la longitud máxima de secuencia no está documentada; conviene verificarla en la configuración del experimento antes de usarlo con entradas largas.
- Licencia: MIT heredada del modelo base, pero la model card no aclara las condiciones de uso de MostafaMaroof/Naqta; conviene revisarlas antes de un uso comercial.
- Fechas: la información indica creación y actualización el 2026-09-12 y un bloqueo de compuerta el 2026-08-02; verificar la vigencia de los enlaces y artefactos antes de integrarlo en producción.
- Rendimiento en producción: no hay datos de latencia, throughput ni estabilidad publicados para este miembro.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/NAMAA-Space/araseg-e69-naqta-nopnx-pa
- Sistema completo (NoPnx-PA, pesos del combinador y umbrales): https://huggingface.co/collections/NAMAA-Space/namaa-community-araseg-2026
- Repositorio de código, configuraciones y mapa miembro-subtarea: https://github.com/NAMAA-ORG/NAMAA-Community-AraSeg-2026
- Modelo base: https://huggingface.co/MostafaMaroof/Naqta
- Cita del trabajo: NAMAA Community, "NAMAA at Arabic Segmentation Shared Task 2026", Proceedings of ArabicNLP 2026 (BibTeX incluido en la model card).

Nota: la búsqueda web asociada no devolvió resultados relevantes sobre el modelo (los enlaces recuperados corresponden a páginas de ayuda de Gmail y foros en hebreo, sin relación con el artefacto).
