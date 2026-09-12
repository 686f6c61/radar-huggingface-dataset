# NAMAA-Space/araseg-e16-xlmr-np-s2

## Resumen

`araseg-e16-xlmr-np-s2` es un modelo de segmentacion de texto arabe desarrollado por NAMAA-Space para la tarea compartida AraSeg 2026 (Arabic Segmentation Shared Task), enmarcada en ArabicNLP 2026. Se trata de un ajuste fino completo de `FacebookAI/xlm-roberta-large` sobre la subtarea NP, con semilla 2 del par de encoders NP. Su funcion es clasificar a nivel de palabra la probabilidad de frontera de segmento, no generar texto.

El punto critico, explicitado por los propios autores, es que no es un segmentador autonomo: es un unico votante dentro de un ensemble de cinco miembros combinados mediante un stack lineal ajustado con predicciones out-of-fold (OOF). El umbral del sistema completo es 0,36. Usado de forma aislada produce probabilidades por palabra sin calibrar y no reproduce ninguna puntuacion publicada; el sistema que si lo hace es la coleccion `NAMAA-Space/araseg-2026`, que contiene los pesos del combinador y los umbrales.

Su relevancia es, por tanto, de tipo metodologico y reproductivo: sirve como pieza de un sistema que alcanza 92,84 de macro-F1 en el practice test y 91,3 en el blind test de AraSeg 2026. No es adecuado como componente listo para produccion, y sus pesos no estan en formato HuggingFace, lo que anade friccion de integracion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-large), cabecera de token-classification |
| Parametros totales | ~560 M (heredados de `FacebookAI/xlm-roberta-large`); la model card indica "560M, full fine-tune" |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (configuracion estandar de XLM-RoBERTa; no especificada en la informacion disponible) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen como `state_dict` en punto flotante) |
| Idiomas soportados | Arabe (`ar`) |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | PyTorch `state_dict` (`best_NP.pt`), no es un checkpoint en formato HuggingFace: ni safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de `FacebookAI/xlm-roberta-large`, un encoder Transformer con normalizacion previa a la capa, atencion multi-cabeza y embeddings posicionales aprendidos, y lo ajusta por completo (full fine-tune) para una tarea de etiquetado a nivel de token: predecir, para cada palabra, la probabilidad de que exista una frontera de segmento. El modelo resultante no incluye decodificacion ni umbral calibrado; la model card indica explicitamente que las probabilidades son por palabra y sin calibrar.

El entrenamiento declarado es de 560M con ajuste fino completo, sin que la informacion disponible aclare si la cifra se refiere a tokens de entrenamiento o a parametros del modelo. No se documentan en la informacion proporcionada la composicion del dataset, el uso de RLHF/DPO (tecnicas no aplicables a una tarea discriminativa de etiquetado) ni innovaciones de decodificacion. La innovacion real del trabajo esta en el nivel del sistema, no del miembro: un stack lineal ajustado con predicciones out-of-fold sobre cinco miembros, con umbral de sistema 0,36, del que este modelo es el segundo encoder NP (semilla 2).

Cabe senalar que los cinco miembros LoRA del sistema requieren `transformers==5.12.1` para instanciar sus clases base, segun la model card; el stack completo de dependencias esta fijado en `requirements-llm.txt` del repositorio de codigo.

## Capacidades

- Segmentacion de texto arabe a nivel de palabra mediante clasificacion de tokens (pipeline `token-classification`).
- Produccion de probabilidades de frontera por palabra, pensadas para ser consumidas por un combinador externo.
- Extraccion de representaciones contextuales del arabe derivadas de XLM-RoBERTa-large.
- Funcion como miembro de ensemble: aporta su vector de probabilidades al stack lineal del sistema `araseg-2026`.
- No genera texto: es un encoder discriminativo, carece de decodificador y de capacidad generativa.
- No soporta tool calling, function calling, uso agentico ni razonamiento multi-paso.
- Capacidad multilingue limitada en la practica: aunque XLM-RoBERTa es multilingue por preentrenamiento, el ajuste y la evaluacion se circunscriben al arabe.
- No dispone de modo "thinking", vision ni audio.

## Casos de uso

- Reproduccion de resultados de AraSeg 2026: cargar `best_NP.pt` junto con los pesos del combinador y los umbrales del sistema permite replicar la puntuacion de 92,84 de macro-F1 en el practice test y 91,3 en el blind test.
- Investigacion en ensembles para NLP arabe: sirve como miembro de un stack OOF, y su pareja de semilla (el otro encoder NP) permite estudiar varianza entre inicializaciones.
- Segmentacion morfologica del arabe como preprocesado: las fronteras de palabra detectadas pueden alimentar pipelines posteriores de analisis morfologico, etiquetado POS o analisis sintactico, siempre que se aplique una calibracion propia.
- Indexacion y recuperacion de informacion en corpus arabes: dividir palabras en segmentos mejora la coincidencia en motores de busqueda sobre texto arabe sin vocalizar, aunque requiere validacion previa del umbral.
- Construccion de un segmentador propio por destilacion: las probabilidades del ensemble pueden emplearse como etiquetas blandas para entrenar un modelo autonomo mas pequeno y desplegable.
- Analisis linguistico de corpus: investigacion sobre prefijos, sufijos y cliticos del arabe a partir de las fronteras predichas sobre grandes colecciones de texto.
- Evaluacion comparativa de encoders multilingues: al ser un ajuste de XLM-RoBERTa-large, permite medir la transferibilidad de este backbone a tareas de segmentacion en arabe.

## Benchmarks y rendimiento

| Benchmark | Resultado (macro-F1) | Notas |
|---|---|---|
| AraSeg 2026, subtarea NP, practice test | 92,84 | Puntuacion del sistema completo (ensemble de 5 miembros con stack lineal), no de este miembro aislado |
| AraSeg 2026, subtarea NP, blind test | 91,3 | Idem; el miembro por si solo no reproduce esta cifra |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible; no son aplicables a un modelo discriminativo de etiquetado de tokens.

## Requisitos de hardware

- El repositorio ocupa 2,2 GB, coherente con un `state_dict` en punto flotante de ~560 M de parametros.
- VRAM estimada para inferencia: en torno a 2,5-3 GB en fp32 (pesos mas activaciones y overhead del runtime); aproximadamente 1,5-2 GB si se convierte a fp16. Son estimaciones derivadas del tamano del repositorio, no cifras publicadas por el autor.
- Cabe sin problema en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o mas. Tambien es viable en CPU para inferencia por lotes pequenos.
- GPU de centro de datos (A100, H100) solo tiene sentido para procesar corpus a gran escala o para reentrenar el modelo.
- Opciones de despliegue: `from_pretrained` no funciona directamente, ya que el fichero es un `state_dict` puro. Es necesario construir la arquitectura desde el YAML de configuracion del experimento y el modelo base, y despues cargar los pesos con `torch.load`; el repositorio de codigo incluye `ensemble.py` y `verify_offcluster.py`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (este ultimo podria alojar el encoder si se convierte previamente a formato HuggingFace).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `araseg-e16-xlmr-np-s2` | ~560 M | 512 tokens (base) | Segmentacion arabe, miembro de ensemble | MIT | Pesos en `state_dict`, requiere ensamblaje manual |
| `FacebookAI/xlm-roberta-large` (modelo base) | ~560 M | 512 tokens | Encoder multilingue preentrenado, sin cabecera de segmentacion | MIT | Checkpoint HuggingFace estandar |
| Otros sistemas de AraSeg 2026 | No disponible | No disponible | Segmentacion arabe | No disponible | No disponible |

No se dispone de datos publicados en la informacion proporcionada para comparar con alternativas especificas de segmentacion del arabe (por ejemplo, herramientas de segmentacion morfologica clasicas) en terminos de macro-F1 sobre el mismo conjunto de evaluacion.

## Limitaciones y advertencias

- No es un segmentador autonomo. La propia model card advierte que, usado solo, no reproduce ninguna puntuacion publicada y que sus probabilidades no estan calibradas.
- Las cifras de 92,84 y 91,3 de macro-F1 corresponden al sistema completo, no a este modelo; atribuirlas a este miembro seria un error metodologico.
- Los pesos no estan en formato HuggingFace: no funcionan con `from_pretrained`, ni con herramientas que esperen safetensors o GGUF. La integracion exige codigo propio de ensamblaje.
- El repositorio presenta 0 descargas y 0 likes, y fue creado en septiembre de 2026. Es un artefacto de investigacion reciente y sin validacion independiente por parte de la comunidad.
- Dependencia estricta de versiones: los miembros LoRA del ensemble requieren `transformers==5.12.1`; desviarse de ese pin puede romper la instanciacion.
- Ambito limitado al arabe. No hay evidencia de rendimiento en otros idiomas pese al preentrenamiento multilingue del backbone, y no se documentan variantes de arabe (dialectos) ni dominios cubiertos.
- Riesgo de sesgo y de alucinacion: no se documentan analisis de sesgo. Al ser un clasificador, no alucina texto, pero puede producir fronteras de segmentacion incorrectas con alta confianza en dominios distintos al de entrenamiento.
- Licencia MIT sobre el modelo, heredada del base; los autores no anaden restricciones adicionales, por lo que el uso comercial es en principio posible, aunque el modelo no este pensado para produccion tal cual.
- Sin datos publicos de robustez, cobertura de vocabulario, manejo de texto sin vocalizar frente a vocalizado, ni comportamiento ante errores ortograficos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NAMAA-Space/araseg-e16-xlmr-np-s2
- Coleccion del sistema completo AraSeg 2026: https://huggingface.co/collections/NAMAA-Space/namaa-community-araseg-2026
- Repositorio de codigo, configs y mapa miembro-subtarea: https://github.com/NAMAA-ORG/NAMAA-Community-AraSeg-2026
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Cita del trabajo: NAMAA Community, "NAMAA at Arabic Segmentation Shared Task 2026", Proceedings of ArabicNLP 2026 (BibTeX incluido en la model card).
