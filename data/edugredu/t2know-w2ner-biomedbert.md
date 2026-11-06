# edugredu/t2know-w2ner-biomedbert

## Resumen

t2know-w2ner-biomedbert es un modelo de reconocimiento de entidades nombradas (NER) biomedical especializado en entidades anidadas y con multiples etiquetas sobre el mismo fragmento de texto (same-span multi-label). Lo desarrolla edugredu y se construye mediante fine-tuning del encoder BiomedBERT de Microsoft (variante base, uncased, preentrenada sobre resumenes y texto completo de PubMed) con la arquitectura W2NER, un enfoque basado en deteccion de palabras y relaciones entre palabras que permite resolver solapamientos entre entidades sin recurrir a esquemas de etiquetado BIO planos.

El modelo se entrena sobre el corpus T2KNOW v1.0.1, un conjunto de resumenes cientificos sobre la enfermedad de Huntington anotados con 40 etiquetas derivadas de UMLS. La relevancia actual es acotada pero clara: ofrece una linea base reproducible (tres semillas, evaluacion overlap-aware y umbrales de decodificacion calibrados) para una tarea donde los esquemas NER convencionales fallan, y publica tanto los pesos como el codigo y el corpus con licencia MIT.

El repositorio ocupa 1,5 GB e incluye los checkpoints de tres semillas en formato PyTorch (`model.pt`), no en safetensors ni GGUF. No es un modelo generativo: es un encoder discriminativo para etiquetado de secuencias, por lo que su uso queda restringido a inferencia NER dentro de un pipeline propio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer tipo BERT (BiomedBERT base) con cabeza W2NER |
| Parametros totales | no disponible (el modelo base BiomedBERT-base tiene aproximadamente 110 M, dato no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en PyTorch `state_dict`; no se publican variantes cuantizadas) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | PyTorch `state_dict` (`model.pt`), mas `w2ner_config.json`, `label_map.json` y `decoding.json` |

## Arquitectura y entrenamiento

El modelo combina el encoder `microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext` con la cabeza W2NER, que formula el NER como la clasificacion de relaciones entre pares de tokens (word-word y head-tail) en lugar de asignar una etiqueta por token. Este diseno permite representar entidades anidadas y etiquetas multiples sobre el mismo span, algo que los esquemas BIO no cubren de forma nativa.

El entrenamiento se realiza sobre el split de entrenamiento document-disjoint de T2KNOW v1.0 (con el split de validacion para seleccion de modelo), un corpus de resumenes sobre la enfermedad de Huntington con 40 etiquetas derivadas de UMLS. Se publican tres semillas (12345, 23456 y 34567). La decodificacion requiere umbrales `nnw_threshold=0.7` y `thw_threshold=0.7`, seleccionados sobre validacion; los valores por defecto de 0,5 producen resultados distintos. No se documentan en la model card datos sobre volumen de tokens, uso de RLHF/DPO ni innovaciones adicionales mas alla del propio esquema W2NER.

## Capacidades

- Reconocimiento de entidades nombradas en texto biomedico en ingles.
- Manejo de entidades anidadas (una entidad contenida dentro de otra).
- Etiquetado multiple sobre el mismo span (same-span multi-label).
- Clasificacion sobre 40 etiquetas derivadas de UMLS en el dominio de la enfermedad de Huntington.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No esta disenado para agentes ni razonamiento multi-paso.
- Multilingue: no, solo ingles.

## Casos de uso

- Extraccion de entidades en literatura cientifica sobre Huntington: procesar resumenes de PubMed para poblar bases de conocimiento con genes, proteinas, fenotipos y tratamientos anotados con las 40 etiquetas UMLS del corpus.
- Construccion de grafos de conocimiento biomedicos: usar las entidades anidadas y multi-etiqueta para generar relaciones jerarquicas entre terminos que un NER plano no capturaria.
- Anotacion asistida de corpus: preetiquetar nuevos resumenes para revision humana, aprovechando el recall alto (en torno a 0,91) de los checkpoints publicados.
- Busqueda semantica especializada: indexar documentos por entidades detectadas para mejorar la recuperacion en repositorios de literatura neurologica.
- Monitorizacion de literatura: pipelines automatizados que detecten menciones de entidades relevantes en nuevas publicaciones sobre enfermedades neurodegenerativas.
- Linea base para investigacion en NER anidado: punto de partida reproducible (tres semillas, umbrales documentados, evaluador oficial) para comparar nuevas arquitecturas en la tarea T2KNOW.

## Benchmarks y rendimiento

Resultados del evaluador oficial de T2KNOW con puntuacion overlap-aware (las coincidencias parciales de span cuentan la mitad) sobre el split de test deduplicado de T2KNOW v1.0.1 (151 documentos, 1.413 frases, 12.579 entidades):

| Semilla | Precision | Recall | F1 |
|---|---|---|---|
| 12345 | 0,6032 | 0,9122 | 0,7262 |
| 23456 | 0,6002 | 0,9111 | 0,7237 |
| 34567 | 0,6022 | 0,9129 | 0,7257 |

F1 medio sobre las tres semillas: 0,7252 (desviacion estandar poblacional 0,0011). No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del encoder base (aproximadamente 110 M de parametros) se estima en torno a 0,5-1 GB en FP32, pero es una estimacion no confirmada por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para un modelo de este tamano; no se documentan requisitos especificos.
- Cabe en GPU consumer: si, practicamente cualquier GPU consumer moderna (GTX 1650 o superior).
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el autor proporciona codigo propio en `code/w2ner_baseline/` que carga el `state_dict` de PyTorch y decodifica con los umbrales indicados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada. Como referencia estructural, el modelo se apoya en BiomedBERT-base (encoder de aproximadamente 110 M de parametros, licencia MIT) y aplica la cabeza W2NER; existen otros modelos NER biomedicos basados en BERT, pero no se aportan resultados comparativos en la documentacion disponible.

## Limitaciones y advertencias

- Las metricas miden la concordancia con la capa de anotacion de T2KNOW (revisada por expertos pero con un unico anotador), no la correccion semantica real.
- Las etiquetas con muy poco soporte en el corpus son poco fiables.
- Dominio muy restringido: resumenes sobre la enfermedad de Huntington, en ingles.
- La decodificacion depende de umbrales especificos (0,7/0,7); usar los valores por defecto de 0,5 altera los resultados.
- El orden de las etiquetas en `label_map.json` debe coincidir exactamente al reconstruir el modelo.
- No es un modelo generativo: no puede usarse para tareas de generacion, razonamiento o conversacion.
- Licencia MIT, lo que permite uso comercial, pero el modelo base y el corpus tambien deben cumplir sus respectivas licencias MIT.
- No se incluye texto fuente de terceros en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/edugredu/t2know-w2ner-biomedbert
- Modelo base: https://huggingface.co/microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext
- Corpus T2KNOW v1.0.1 (Zenodo): https://doi.org/10.5281/zenodo.23801223
- Paper: pendiente de publicacion (no disponible)
- Codigo: archivo `code/` en el mismo DOI de Zenodo
