# NAMAA-Space/araseg-e25-xlmr-pa

## Resumen

`NAMAA-Space/araseg-e25-xlmr-pa` es un modelo de clasificacion de tokens (token classification) para segmentacion de texto arabe, desarrollado por NAMAA Community como parte de su participacion en la tarea compartida Arabic Segmentation Shared Task 2026 (AraSeg, ArabicNLP 2026). Se trata de un fine-tune completo de `FacebookAI/xlm-roberta-large` (560M parametros) sobre la subtarea PA, con ventanas deslizantes de stride 256.

Su relevancia es acotada y muy especifica: no es un modelo autonomo ni un segmentador utilizable de forma directa. La propia model card indica explicitamente que es un votante dentro de un ensemble de tres miembros combinados por media de logits, con umbral de sistema 0.25, y que por si solo no reproduce ninguna puntuacion publicada. La puntuacion de 94,49 / 94,4 macro-F1 (practice test / blind) corresponde al sistema completo, no a este miembro.

El interes practico del repositorio es de reproducibilidad de investigacion: publica un `state_dict` de PyTorch (`best_PA.pt`) que requiere reconstruir la arquitectura desde el YAML de configuracion del experimento, en lugar de un checkpoint en formato HuggingFace cargable con `from_pretrained`. La licencia es MIT, heredada del modelo base, y el idioma soportado es unicamente arabe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-large) con cabeza de token classification |
| Parametros totales | 560M (heredados del modelo base `FacebookAI/xlm-roberta-large`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible de forma explicita; el encoder base XLM-RoBERTa-large admite 512 posiciones y el sistema usa ventanas deslizantes de stride 256 |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas ni GGUF) |
| Idiomas soportados | arabe (`ar`) |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | PyTorch `state_dict` (`best_PA.pt`); no es un checkpoint en formato HuggingFace |
| Tarea | Token classification / text segmentation |
| Subtarea de la shared task | PA |
| Rol en el sistema | miembro de una media de logits de 3 miembros |
| Umbral del sistema | 0,25 |
| Tamano del repositorio | 2,2 GB |
| Version de transformers citada | 5.12.1 (necesaria para instanciar las clases base de los cinco miembros LoRA del sistema) |

## Arquitectura y entrenamiento

La arquitectura es la de un encoder transformer bidireccional XLM-RoBERTa-large al que se anade una cabeza de clasificacion de tokens, orientada a producir probabilidades de frontera por palabra. El modelo se obtuvo mediante un fine-tune completo ("full fine-tune") sobre el modelo base `FacebookAI/xlm-roberta-large`, con 560M parametros entrenados. La inferencia del sistema emplea ventanas deslizantes con stride 256.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento; tampoco se especifica si hubo decodificacion especulativa o mecanismos de atencion alternativos. Lo que si se documenta es la estructura del sistema: una media de logits de tres miembros, donde este checkpoint actua como miembro encoder, y cinco miembros LoRA adicionales que requieren `transformers==5.12.1` para instanciar sus clases base. La reproduccion completa depende de `ensemble.py` y `verify_offcluster.py` del repositorio de codigo, que contiene los pesos del combinador y los umbrales.

## Capacidades

- Clasificacion de tokens y prediccion de fronteras (segmentacion) en texto arabe, en la subtarea PA de AraSeg 2026.
- Produccion de probabilidades de frontera por palabra, explicitamente descritas como no calibradas.
- Procesamiento de secuencias largas mediante ventanas deslizantes con stride 256.
- Participacion como miembro de un ensemble por media de logits (requiere el combinador externo).
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico.
- Capacidad multilingue: no; el modelo esta etiquetado unicamente para arabe, pese a que su base XLM-R sea multilingue (no se documenta transferencia a otros idiomas).
- Capacidad especial: ninguna declarada (sin modo thinking, sin vision, sin audio).

## Casos de uso

- Reproduccion de resultados de la shared task: cargar `best_PA.pt` junto con el resto de miembros y el combinador del repositorio de codigo para replicar la puntuacion de 94,49 / 94,4 macro-F1 del sistema PA.
- Investigacion en segmentacion de arabe: servir como punto de partida para comparativas academicas de arquitecturas encoder sobre corpus arabes etiquetados a nivel de frontera.
- Preprocesado de corpus arabes para NLP: integrar el sistema completo como etapa previa de segmentacion antes de entrenar modelos de traduccion, resumen o recuperacion de informacion en arabe.
- Normalizacion de transcripciones para ASR/TTS en arabe: delimitar unidades de segmentacion antes de la sintesis o de la alineacion forzada de audio y texto.
- Construccion de indices de busqueda en arabe: usar las fronteras predichas para trocear documentos en unidades coherentes antes de generar embeddings o indices invertidos.
- Auditoria de conjuntos de datos: aplicar el modelo como etiquetador auxiliar para detectar inconsistencias de anotacion en corpus arabes segmentados manualmente.
- Analisis linguistico cuantitativo: agregar las probabilidades por palabra para estudiar distribucion de fronteras en generos o dominios concretos del arabe.

En todos los casos es imprescindible el componente de ensemble; el uso del checkpoint de forma aislada carece de sentido segun la propia model card.

## Benchmarks y rendimiento

Los unicos datos numericos publicados corresponden al sistema completo, no a este miembro por separado.

| Evaluacion | Metrica | Resultado | Ambito |
|---|---|---|---|
| Practice test | macro-F1 | 94,49 | sistema PA completo (ensemble) |
| Blind test | macro-F1 | 94,4 | sistema PA completo (ensemble) |
| Miembro `e25` aislado | macro-F1 | no disponible | no se publica puntuacion individual |
| MMLU, HumanEval, GSM8K u otros | no aplicable | no disponible | el modelo no es generativo |

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- Parametros: 560M, por lo que en fp32 ocupa aproximadamente 2,2 GB (coincide con el tamano del repositorio) y en fp16 alrededor de 1,1-1,2 GB de pesos.
- VRAM estimada para inferencia: menos de 2 GB en fp16 con batch 1, mas el overhead de activaciones y del resto de miembros del ensemble si se ejecuta el sistema completo.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente para este miembro; RTX 3060 12 GB, RTX 4070, RTX 4090 o superiores. En el lado profesional, A100, H100 o L4 no aportan ventaja significativa para un encoder de 560M.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas de VRAM.
- Opciones de despliegue: no se puede usar `from_pretrained`; hay que descargar el `state_dict` con `hf_hub_download`, reconstruir la arquitectura desde el YAML de configuracion y cargar los pesos. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, y tampoco tiene sentido al no ser un modelo generativo ni publicarse en GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de alternativas en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales verificables.

| Modelo | Parametros | Contexto | Tarea | Licencia | Carga estandar HF |
|---|---|---|---|---|---|
| `NAMAA-Space/araseg-e25-xlmr-pa` | 560M | 512 posiciones del encoder base, ventanas con stride 256 | Token classification (PA) | MIT | No (`state_dict`) |
| `FacebookAI/xlm-roberta-large` | 560M | 512 | Modelo base multilingue | MIT | Si |
| Alternativas especificas de segmentacion arabe | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un segmentador autonomo: es uno de tres votantes de una media de logits y produce probabilidades por palabra no calibradas. Usado solo, no reproduce ninguna puntuacion publicada.
- `from_pretrained` no funciona; el fichero es un `state_dict` plano y requiere reconstruir la arquitectura desde el YAML de configuracion del experimento y el modelo base.
- El sistema completo depende de codigo externo (`ensemble.py`, `verify_offcluster.py`) que contiene los pesos del combinador y los umbrales (0,25); sin ese codigo el checkpoint es inutilizable en la practica.
- Los cinco miembros LoRA del sistema exigen `transformers==5.12.1`; cambios de version pueden romper la instanciacion de las clases base.
- Idioma limitado al arabe. No hay evidencia documentada de comportamiento en otros idiomas ni en variedades dialectales concretas.
- No se documenta la composicion del dataset de entrenamiento ni el numero de tokens, por lo que no es posible evaluar sesgos de dominio, genero o dialecto.
- Riesgo de errores de frontera: al tratarse de prediccion de limites, los fallos se manifiestan como sobre-segmentacion o infra-segmentacion, especialmente en texto sin puntuacion o con ruido (redes sociales, OCR).
- La puntuacion de 94,4 macro-F1 en blind test pertenece al sistema PA agregado; atribuirla a este miembro seria incorrecto.
- Adopcion practicamente nula en el momento de la ficha: 0 descargas y 0 likes, sin senales de validacion independiente por terceros.
- Licencia MIT heredada del modelo base, favorable para uso comercial, pero conviene verificar las condiciones aplicables al modelo base y a los datos de la shared task antes de un despliegue en produccion.
- El articulo de referencia (ArabicNLP 2026) es la fuente citada para los detalles metodologicos; en la informacion disponible no se incluye su contenido completo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NAMAA-Space/araseg-e25-xlmr-pa
- Coleccion del sistema AraSeg 2026 de NAMAA: https://huggingface.co/collections/NAMAA-Space/namaa-community-araseg-2026
- Repositorio de codigo (configs, mapa miembro a subtarea, scripts de ensemble y verificacion): https://github.com/NAMAA-ORG/NAMAA-Community-AraSeg-2026
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Cita: NAMAA Community, "NAMAA at Arabic Segmentation Shared Task 2026", Proceedings of ArabicNLP 2026
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces recuperados no guardan relacion con la ficha.
