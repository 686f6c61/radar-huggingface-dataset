# KenX049/cuad-clause-risk-cnn

## Resumen

KenX049/cuad-clause-risk-cnn es un clasificador multi-etiqueta de clausulas contractuales, no un modelo generativo. Detecta de forma independiente seis tipos de clausula relevantes para la gestion de riesgo en contratos comerciales: Cap on Liability, Non-Compete, License Grant, Audit Rights, Termination for Convenience e Insurance. Lo publica el usuario KenX049 en Hugging Face con licencia MIT, y esta ajustado sobre CUAD v1 (Atticus Project), el corpus de referencia de contratos comerciales estadounidenses anotado por abogados.

Tecnicamente es una TextCNN: embeddings mas convoluciones unidimensionales y seis salidas sigmoideas independientes, en lugar de un softmax unico. Esa decision responde a que un mismo contrato suele contener varias de estas clausulas a la vez. El modelo se entrena y se ejecuta mediante el repositorio de codigo del autor (ManasDasri/NNDL), no mediante `transformers`, por lo que no existe un `from_pretrained` asociado.

Su relevancia practica esta en el triaje documental: con un macro F1 por documento de 0,840 sirve para localizar rapidamente que contratos o que fragmentos requieren lectura humana, y no como sustituto del criterio juridico. El propio autor lo define como artefacto de investigacion y no como asesoramiento legal. El modelo solo soporta ingles y fue entrenado con 358 contratos, lo que limita su generalizacion fuera del dominio de CUAD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TextCNN (embeddings + convoluciones 1D + pooling + 6 salidas sigmoideas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica como ventana de atencion; procesa ventanas de 300 palabras con 100 palabras de solape |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio no publica artefactos de pesos; tamano del repo 0,0 GB) |
| Tarea | Clasificacion multi-etiqueta de clausulas (pipeline: text-classification) |
| Numero de etiquetas | 6 (indices 0 a 5) |
| Dataset de entrenamiento | theatticusproject/cuad (CUAD v1) |
| Contratos de entrenamiento | 358 |
| Codigo de entrenamiento | https://github.com/ManasDasri/NNDL |
| Interfaz de carga | `legal_risk_classifier.runtime.CNNRuntime` (no `transformers`) |
| Autor | KenX049 |
| Descargas en Hugging Face | 0 |
| Likes en Hugging Face | 1 |

Etiquetas del clasificador y umbrales de decision ajustados por etiqueta en validacion:

| Indice | Etiqueta | Umbral |
| ---: | --- | ---: |
| 0 | Cap on Liability | 0,78 |
| 1 | Non-Compete | 0,28 |
| 2 | License Grant | 0,32 |
| 3 | Audit Rights | 0,39 |
| 4 | Termination for Convenience | 0,22 |
| 5 | Insurance | 0,83 |

## Arquitectura y entrenamiento

El modelo es una red convolucional sobre texto. No emplea atencion ni mecanismos de transformer: la arquitectura es la clasica TextCNN, que proyecta el texto a embeddings, aplica filtros convolucionales de distinto tamano y agrega las activaciones con pooling. La capa final consta de seis neuronas con activacion sigmoidea, de modo que cada etiqueta se decide de forma binaria e independiente. El autor subraya explicitamente que no se debe usar softmax, porque los contratos contienen habitualmente varias de estas clausulas simultaneamente.

El preprocesamiento es el elemento mas determinante del diseno. Los contratos se dividen en ventanas de 300 palabras con 100 palabras de solape, porque el 97% de los contratos de CUAD superan las 512 tokens de contexto y el 70% superan los 4.096. Una ventana recibe la etiqueta cuando solapa de forma significativa con un tramo de clausula anotado. La funcion de perdida es entropia cruzada binaria ponderada por la ratio negativo-positivo de cada etiqueta, que va de 22x a 68x: el 85% de las ventanas no llevan ninguna etiqueta, de modo que una perdida sin ponderar colapsa hacia la prediccion vacia. Los conjuntos de entrenamiento, validacion y test se asignan por contrato completo, nunca por ventana, para evitar fuga de informacion entre documentos.

No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset ni el uso de RLHF, DPO u otra fase de alineacion, algo que en cualquier caso no aplica a un clasificador discriminativo de este tipo.

## Capacidades

- Clasificacion multi-etiqueta de seis tipos de clausula contractual en contratos comerciales redactados en ingles.
- Deteccion simultanea de varias clausulas en un mismo documento, gracias a las seis salidas sigmoideas independientes.
- Procesamiento de documentos largos mediante troceado en ventanas de 300 palabras con solape de 100 y agregacion por max-pooling a nivel de documento.
- Prediccion a nivel de fragmento (chunk-level) y a nivel de documento completo (document-level), con `prediction.predicted` y `prediction.document_scores`.
- Umbrales de decision calibrados por etiqueta para el ajuste del equilibrio precision/recall.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso; es un clasificador de una sola pasada.
- No dispone de capacidades de generacion de texto, resumen, traduccion ni respuesta a preguntas.
- No dispone de capacidades de vision, audio ni modo de razonamiento explicito.
- Multilingue: no. Solo ingles.
- Capacidad especial: ninguna adicional a la clasificacion; no hay modo "thinking" ni salida explicativa.

## Casos de uso

- Triaje en due diligence de fusiones y adquisiciones: el clasificador recorre un repositorio de contratos y marca cuales contienen clausulas de limitacion de responsabilidad o de no competencia, de modo que el equipo juridico prioriza la lectura de los documentos con mayor exposicion. El macro F1 de 0,840 a nivel de documento lo hace util como filtro previo, no como decision final.
- Enrutado dentro de un sistema de gestion del ciclo de vida contractual (CLM): cada contrato entrante se etiqueta automaticamente y se dirige al flujo de revision correspondiente (por ejemplo, contratos con Audit Rights al equipo de compliance y con Insurance al equipo de riesgos).
- Control de contratos de proveedores: deteccion de clausulas de Termination for Convenience o de License Grant para verificar que las condiciones negociadas se reflejan en el texto final antes de la firma.
- Revisión masiva de carteras heredadas: clasificacion por lotes de cientos de contratos historicos para construir un inventario de clausulas de riesgo, sin necesidad de GPU y con coste de computo muy bajo.
- Vigilancia de cambios en plantillas: comparar la distribucion de etiquetas entre la version antigua y la nueva de un contrato tipo para detectar si se ha introducido o eliminado una clausula de no competencia o de auditoria.
- Priorizacion en equipos juridicos pequenos: el modelo actua como asistente de triaje que reduce el volumen de lectura, dejando al abogado la decision sobre las clausulas efectivamente detectadas.
- Investigacion academica sobre CUAD: sirve como linea base reproducible (particiones por contrato, umbrales publicados y perdida ponderada) para comparar nuevas aproximaciones de clasificacion de clausulas legales.
- Extraccion previa a un pipeline de RAG juridico: uso de las etiquetas como metadatos para segmentar y etiquetar el corpus antes de indexarlo en un sistema de busqueda.
- Ajuste del punto de operacion segun el caso: los umbrales por etiqueta permiten desplazar el modelo hacia alta recall (umbral bajo en Non-Compete, 0,28) o hacia alta precision (umbral alto en Insurance, 0,83) en funcion del coste del falso positivo o del falso negativo.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre la particion de test, con separacion por contrato (ningun documento aparece en entrenamiento). No se han publicado resultados adicionales de benchmarks en la informacion disponible.

| Etiqueta | Precision | Recall | F1 | Support |
| --- | ---: | ---: | ---: | ---: |
| Cap on Liability | 0,760 | 0,731 | 0,745 | 104 |
| Non-Compete | 0,400 | 0,351 | 0,374 | 57 |
| License Grant | 0,806 | 0,767 | 0,786 | 146 |
| Audit Rights | 0,651 | 0,793 | 0,715 | 87 |
| Termination for Convenience | 0,491 | 0,540 | 0,514 | 50 |
| Insurance | 0,877 | 0,814 | 0,844 | 70 |

| Metrica agregada | Valor |
| --- | ---: |
| Macro F1 a nivel de fragmento (chunk-level) | 0,663 |
| Macro F1 a nivel de documento (document-level, max-pooled sobre ventanas) | 0,840 |

Advertencia del autor: la varianza entre ejecuciones es de aproximadamente ±0,03 de macro F1 con configuraciones identicas, por lo que diferencias menores entre checkpoints no son significativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio de Hugging Face no publica artefactos de pesos (tamano 0,0 GB), por lo que no se puede fijar la huella de memoria a partir de la informacion proporcionada.
- Inferencia en CPU: viable. Una TextCNN sobre ventanas de 300 palabras es un modelo de coste de computo muy bajo, apto para ejecucion en CPU en entornos de procesamiento por lotes.
- GPU recomendadas: no disponible. No se documenta ninguna GPU de referencia; el modelo no requiere acelerador para su tamano y tipo de arquitectura.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tipo de arquitectura, aunque no se dispone de cifras confirmadas de VRAM. Senalado como estimacion, no como dato verificado.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI no son aplicables, porque no es un modelo de transformer ni un modelo generativo con pesos GGUF o safetensors. La via documentada es el runtime del repositorio de entrenamiento (`legal_risk_classifier.runtime.CNNRuntime`), que se puede envolver en un servicio propio (por ejemplo, una API HTTP).
- Exportacion a ONNX u otros formatos: no documentada.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia ni de documentos por segundo.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos comparables en la informacion proporcionada. Como referencias de la misma categoria (clasificacion y extraccion de clausulas sobre CUAD) existen aproximaciones basadas en BERT juridico y en modelos generativos ajustados, pero este documento no incluye sus parametros, ventanas de contexto, resultados ni licencias, por lo que no se puede establecer una comparacion con cifras fiables.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
| --- | --- | --- | --- | --- | --- |
| KenX049/cuad-clause-risk-cnn | no disponible | ventanas de 300 palabras (solape 100) | macro F1 doc. 0,840; macro F1 chunk 0,663 | MIT | Hugging Face (repo sin pesos publicados) |
| Alternativas de clasificacion de clausulas sobre CUAD | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado sobre 358 contratos. La etiqueta mas rara, Non-Compete, aparece en torno al 1,5% de las ventanas y es la de peor rendimiento (F1 de 0,374).
- Varianza entre ejecuciones de aproximadamente ±0,03 de macro F1 con configuraciones identicas: las diferencias pequenas entre checkpoints no deben interpretarse como mejoras reales.
- CUAD contiene contratos comerciales estadounidenses. El comportamiento en otras jurisdicciones o en otras familias contractuales no ha sido probado.
- Aviso explicito del autor: es un artefacto de investigacion y no constituye asesoramiento legal. Sirve para localizar clausulas que un abogado debe leer, no para sustituir esa lectura.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no produce texto; el riesgo equivalente es el falso positivo, es decir, marcar una clausula inexistente. Con umbrales bajos (Non-Compete en 0,28, Termination for Convenience en 0,22) ese riesgo se incrementa.
- Desequilibrio extremo de clases: el 85% de las ventanas no lleva ninguna etiqueta, de modo que las metricas agregadas pueden ocultar un rendimiento pobre en etiquetas minoritarias.
- Fixar el umbral en 0,5 en lugar de usar los valores calibrados por etiqueta reduce la recall.
- Solo ingles: no hay soporte documentado para contratos en castellano ni en otros idiomas.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificacion con atribucion y sin garantia. No se documentan restricciones adicionales, pero la licencia del dataset CUAD subyacente debe verificarse por separado para un uso comercial.
- Limitacion operativa: al no haber `from_pretrained` ni pesos en safetensors o GGUF, la integracion exige depender del runtime del repositorio del autor, lo que anade coste de mantenimiento y riesgo de compatibilidad.
- Cero descargas registradas en Hugging Face y una unica marca de like: el modelo no tiene validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KenX049/cuad-clause-risk-cnn
- Codigo fuente y de entrenamiento: https://github.com/ManasDasri/NNDL
- Dataset CUAD v1 en Hugging Face: https://huggingface.co/datasets/theatticusproject/cuad
- Pagina del proyecto CUAD (Atticus Project): https://www.atticusprojectai.org/cuad
- Paper de CUAD: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
