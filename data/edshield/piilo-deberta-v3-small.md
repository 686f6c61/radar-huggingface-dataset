# edshield/piilo-deberta-v3-small

## Resumen

piilo-deberta-v3-small es un modelo de clasificacion de tokens (token-classification en formato BIO) especializado en detectar identificadores personales en textos escritos por estudiantes. Lo desarrolla edshield y constituye la capa de modelo de la biblioteca homonima, que elimina identificadores en el propio dispositivo antes de que el texto llegue a cualquier modelo de lenguaje. Se construye mediante fine-tuning de microsoft/deberta-v3-small (141.315.855 parametros) sobre el corpus PIILO.

El modelo cubre siete etiquetas: NAME_STUDENT, EMAIL, USERNAME, ID_NUM, PHONE_NUM, URL_PERSONAL y STREET_ADDRESS. Su relevancia actual radica en que aborda un problema de privacidad concreto en el ambito educativo: el envio de redacciones con datos personales de menores a servicios de terceros. Al ser un modelo pequeno (0,6 GB de repositorio) puede ejecutarse en local, lo que permite mantener los datos dentro del perimetro del centro o del operador.

No es un modelo generativo ni un certificado de cumplimiento normativo. El propio autor advierte de que no sustituye las obligaciones legales (consentimiento, aviso, contratos, retencion, seguridad) que recaen sobre la escuela o el operador, sino que actua como una salvaguarda tecnica dentro de ellas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo DeBERTa-v3 (disentangled attention y enhanced mask decoder) |
| Parametros totales | 141.315.855 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 1.024 tokens por ventana (stride 128 durante el entrenamiento); documentos largos tratados con ventanas solapadas por la biblioteca edshield |
| Tipos de cuantizacion | no disponible (solo se documenta entrenamiento e inferencia en fp32) |
| Idiomas soportados | en (ingles) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (variante ONNX publicada aparte) |

## Arquitectura y entrenamiento

El modelo es un encoder DeBERTa-v3-small fine-tuneado para clasificacion de tokens. DeBERTa-v3 introduce atencion desacoplada (disentangled attention), que modela por separado el contenido y la posicion de cada token, y un decodificador de mascara mejorado; el preentrenamiento del modelo base de Microsoft empleo un esquema estilo ELECTRA sobre 160 GB de texto. Sobre esa base, el autor anadio una cabeza de clasificacion de tokens con siete etiquetas en formato BIO.

El entrenamiento uso el corpus PIILO (6.807 ensayos), del que 680 se reservaron para validacion. Del resto se conservaron todos los ensayos con algun identificador y el 30 % de los que no lo tenian, mas documentos sinteticos para las etiquetas raras, sumando 4.430 documentos. Se entrenaron 3 epocas con learning rate 2e-5, warm-up del 10 %, weight decay 0,01, batch size 2 y contexto de 1.024 tokens con stride 128. La funcion de perdida fue entropia cruzada con la clase `O` ponderada a 0,15 para favorecer el recall. Preciso fp32, sobre una GTX 1060 de 6 GB, en aproximadamente 42 minutos. Los scripts (`training/prepare_piilo.py` y `training/train.py`) estan en el repositorio de edshield.

## Capacidades

- Deteccion de entidades de identificacion personal en texto en ingles mediante etiquetado BIO de siete clases: NAME_STUDENT, EMAIL, USERNAME, ID_NUM, PHONE_NUM, URL_PERSONAL y STREET_ADDRESS.
- Integracion en una biblioteca de desidentificacion (edshield) que anade reglas, ventanas solapadas para documentos largos, propagacion de nombres, politicas configurables (por ejemplo, la politica "coppa") y una comprobacion final de que nada de lo actuado permanece en la salida.
- Carga directa con `transformers` mediante `AutoModelForTokenClassification`, en cuyo caso solo se obtienen etiquetas por token.
- Despliegue en navegador a traves de la variante ONNX (edshield/piilo-deberta-v3-small-onnx), lo que permite procesamiento en el dispositivo.
- Capacidades multilingues: no disponibles; el modelo esta entrenado y etiquetado unicamente en ingles.
- Tool calling / function calling: no aplica, no es un modelo generativo ni de agentes.
- Vision, audio y modo "thinking": no disponibles.

## Casos de uso

- Desidentificacion previa a un LLM en herramientas educativas: el modelo detecta nombres, correos, usuarios, telefonos y direcciones en la redaccion del alumno y edshield los elimina en local antes de que el texto se envie a un modelo de lenguaje. Es adecuado porque el modelo es pequeno y puede ejecutarse sin GPU dedicada.
- Cumplimiento de politicas de privacidad infantil (COPPA, FERPA): edshield permite aplicar una politica predefinida ("coppa") que combina las predicciones del modelo con reglas y verificacion posterior, reduciendo el riesgo de exponer datos de menores en servicios de terceros.
- Anonimizacion de corpus para investigacion educativa: procesar lotes de ensayos antes de compartir conjuntos de datos con terceros o publicarlos, con la advertencia de que debe revisarse por muestreo la salida del propio corpus.
- Despliegue en el navegador: con la variante ONNX, el etiquetado puede ejecutarse en el propio dispositivo del usuario, evitando que el texto salga del equipo incluso en aplicaciones web.
- Preprocesado en flujos de revision docente: marcar automaticamente menciones de nombres y otros identificadores para que un revisor humano decida si se eliminan antes de reutilizar el material.
- Filtrado de registros de chat y foros escolares: deteccion de nombres de usuario, correos y URLs personales en transcripciones de conversaciones antes de archivarlas o analizarlas.
- Deteccion de identificadores para anotacion asistida: generar preanotaciones que aceleren el etiquetado manual de nuevos corpus de PII en el dominio educativo.

## Benchmarks y rendimiento

Resultados a nivel de span, medidos con `eval/evaluate.py` de edshield sobre 680 ensayos PIILO reservados, en la mezcla natural del corpus (581 de ellos sin identificador). El detector es el conjunto de reglas de edshield mas este modelo, que es como se usa realmente. La columna "Got through" cuenta identificadores que ninguna etiqueta marco y que, por tanto, permanecerian en la salida.

| Test set | Detector | Precision | Recall | F5 | Got through |
|---|---|---|---|---|---|
| PIILO held-out, 680 ensayos | Reglas + este modelo | 0.642 | 1.000 | 0.979 | 0 de 165 |
| PIILO held-out, 680 ensayos | Solo reglas | 0.538 | 0.388 | 0.392 | 101 de 165 |
| K-12 sintetico, dificil | Reglas + este modelo | no disponible | no disponible | no disponible | 319 de 1.433 (22 %) |
| K-12 sintetico, dificil | Solo reglas | no disponible | no disponible | no disponible | 1.100 de 1.433 (77 %) |

Desglose por etiqueta (reglas + modelo):

| Etiqueta | Precision | Recall | n |
|---|---|---|---|
| NAME_STUDENT | 0.656 | 1.000 | 143 |
| URL_PERSONAL | 0.381 | 1.000 | 8 |
| ID_NUM | 0.700 | 1.000 | 7 |
| EMAIL | 1.000 | 1.000 | 4 |
| USERNAME | 1.000 | 1.000 | 2 |
| STREET_ADDRESS | 0.500 | 1.000 | 1 |

La etiqueta PHONE_NUM aparece en la lista de clases del modelo, pero no figura en la tabla de resultados por etiqueta publicada por el autor. Las cifras deben interpretarse con cautela: 143 de los 165 identificadores del conjunto PIILO son nombres, de modo que las filas del resto de tipos se apoyan en muy pocos ejemplos.

## Requisitos de hardware

- VRAM estimada: con 141,3 millones de parametros, los pesos en fp32 ocupan del orden de 565 MB; el repositorio completo es de 0,6 GB. La inferencia en CPU es viable para lotes pequenos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el propio autor entreno el modelo en una GTX 1060 de 6 GB.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo actual y tambien en CPU.
- Opciones de despliegue: `transformers` con `AutoModelForTokenClassification`, la biblioteca edshield con el extra `[hf]` (`pip install "edshield[hf]"`) y ONNX Runtime a traves de la variante ONNX. vLLM, TGI, llama.cpp y Ollama no son aplicables, ya que no se trata de un modelo generativo.
- Latencia y throughput: no disponibles. Como referencia de coste de computo, el entrenamiento de 3 epocas sobre 4.430 documentos tardo unos 42 minutos en una GTX 1060 de 6 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| piilo-deberta-v3-small | 141.315.855 | 1.024 tokens por ventana | Clasificacion de tokens PII educativo (7 etiquetas) | PIILO held-out: P 0.642 / R 1.000 / F5 0.979 (reglas + modelo) | CC BY 4.0 | HuggingFace, mas variante ONNX |
| microsoft/deberta-v3-small (modelo base) | 142M aprox. | no disponible en la informacion proporcionada | Masked language modeling y fine-tuning NLU | no disponible | MIT | HuggingFace |
| edshield/piilo-deberta-v3-small-onnx | mismas que el modelo base | igual que el modelo de origen | Igual, formato ONNX para navegador | no disponible | CC BY 4.0 (segun el modelo de origen) | HuggingFace |

No se dispone de resultados de benchmarks de modelos alternativos de deteccion de PII entrenados sobre PIILO en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa con competidores directos.

## Limitaciones y advertencias

- No existe medicion sobre escritura real de menores: PIILO contiene textos de estudiantes adultos en linea, y los conjuntos K-12 son sinteticos y fueron escritos por las mismas personas que desarrollaron el detector.
- Sobre texto con estilo infantil se cuelan aproximadamente uno de cada cinco identificadores. Lo que se escapa en el conjunto dificil son, en su mayoria, colegios y localidades en minusculas, edades en jerga de chat, fechas habladas y calles sin numero de portal.
- El conjunto PIILO es pequeno: 143 de sus 165 identificadores son nombres, por lo que las metricas del resto de etiquetas se basan en menos de diez ejemplos cada una.
- La precision es baja de forma deliberada: la mayoria de falsos positivos son nombres de personas distintas del autor del ensayo, que PIILO no etiqueta pero que una herramienta de privacidad deberia eliminar.
- Algunas decisiones de desarrollo se tomaron sobre el conjunto de validacion: tres correcciones de falsos positivos se eligieron leyendo falsos positivos en los mismos 680 ensayos.
- No es un certificado de cumplimiento: usarlo no garantiza por si solo el cumplimiento de FERPA, COPPA ni ninguna otra normativa. No elimina toda la informacion personal y conviene revisar una muestra de la salida con los textos del propio alumnado antes de confiar en el.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos en el etiquetado.
- Limitacion de idioma: solo ingles; no hay soporte documentado para castellano ni otros idiomas.
- Restriccion de licencia: los pesos se publican bajo CC BY 4.0, la licencia del corpus de entrenamiento, por lo que el uso comercial es posible con atribucion; el codigo de edshield es Apache-2.0 y el modelo base de Microsoft es MIT.
- Nunca probar el modelo pegando datos reales de estudiantes en un servicio alojado; usar muestras sinteticas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/edshield/piilo-deberta-v3-small
- Variante ONNX: https://huggingface.co/edshield/piilo-deberta-v3-small-onnx
- Repositorio de edshield: https://github.com/hemangnagar/edshield
- Documentacion de cobertura: https://github.com/hemangnagar/edshield/blob/main/docs/COVERAGE.md
- Modelo base: https://huggingface.co/microsoft/deberta-v3-small
- Corpus PIILO (Kaggle, The Learning Agency Lab): https://www.kaggle.com/competitions/pii-detection-removal-from-educational-data
- The Learning Agency Lab: https://the-learning-agency-lab.com/
