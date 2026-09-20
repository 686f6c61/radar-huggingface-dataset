# belumind/goby-9-ie-vi

## Resumen

goby-9-ie-vi es un modelo de extraccion de informacion en vietnamita desarrollado por Belumind que realiza de forma conjunta reconocimiento de entidades nombradas (NER) tipado y extraccion de relaciones. Esta construido sobre la libreria GLiNER y se ha afinado a partir de `knowledgator/gliner-relex-large-v1.0`, un encoder de tipo span-based que codifica las etiquetas como texto en lenguaje natural, lo que permite definir los tipos de entidad en tiempo de inferencia sin reentrenar. Cuenta con 466.576.896 parametros (466,6 M) y se distribuye bajo licencia Apache-2.0 con pesos en safetensors y pytorch_model.bin.

Su relevancia dentro de la familia goby no esta en un cambio de datos ni de arquitectura, sino en la configuracion de la funcion de perdida: el autor subio la ratio de muestreo negativo de 1.0 a 2.5 y bajo el alpha de focal loss de 0.75 a 0.5. El resultado declarado es un desplazamiento de la curva precision/recall, no un simple deslizamiento sobre ella: a recall comparable, la precision mejora entre 3,9 y 4,1 puntos frente a goby-4-ie-vi. En el benchmark propio del autor (450 frases vietnamitas retenidas, 1.328 spans auditados a mano) obtiene un F1 de 64,7 frente a 60,9 de su hermano goby-4, con una mejora de +3,8 F1 (IC 95% [+2,7, +4,8], 100% de remuestreos positivos).

El modelo esta pensado exclusivamente para texto vietnamita limpio y correctamente acentuado. El propio autor advierte de que el texto degradado (sin diacriticos o en mayusculas) hunde el rendimiento en relaciones hasta un F1 de 6,0-6,8, frente a los 28,5-30,0 de goby-7-ie-vi, y recomienda ese otro checkpoint para salidas de OCR. Con cero descargas y cero likes en el momento de la consulta, se trata de un modelo sin validacion comunitaria independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER (encoder transformer bidireccional con representacion de spans y etiquetas codificadas como texto); backbone exacto no disponible |
| Parametros totales | 466.576.896 (466,6 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; pesos distribuidos en safetensors y pytorch_model.bin (byte a byte identicos, tensor por tensor) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y pytorch_model.bin |
| Tarea (pipeline) | token-classification |
| Libreria | gliner (probado con gliner==0.2.29) |
| Modelo base | knowledgator/gliner-relex-large-v1.0 |
| Tamano del repositorio | 3,7 GB |
| Fecha de creacion / actualizacion | 2026-09-20 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un afinamiento de `knowledgator/gliner-relex-large-v1.0`, que pertenece a la familia GLiNER: un encoder transformer bidireccional que en lugar de generar texto produce etiquetas sobre spans del texto de entrada. La particularidad del enfoque es que los tipos de entidad se pasan como cadenas de texto en lenguaje natural y se codifican con el mismo text encoder que la frase de entrada, de modo que el modelo compara representaciones de span con representaciones de etiqueta. En esta variante relex, la misma arquitectura resuelve simultaneamente la clasificacion de entidades y la clasificacion de relaciones entre pares de entidades, con salida tipo token-classification. El backbone concreto (DeBERTa u otro encoder) no se especifica en la informacion disponible.

En cuanto al entrenamiento, el autor indica que goby-9-ie-vi usa exactamente los mismos datos que goby-4-ie-vi: no hay datos nuevos ni aumento de datos. La unica diferencia es la configuracion de la perdida, con ratio de muestreo negativo de 1.0 a 2.5 y focal loss alpha de 0.75 a 0.5. No se detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO (no aplicables en un modelo discriminativo de extraccion, en cualquier caso). El repositorio incluye ademas el fichero `goby_labels.py`, que fuerza a que un etiquetado sin diacriticos lance un error explicito en lugar de degradar silenciosamente, y expone las funciones `extract()`, `check_labels()` y la excepcion `LabelError`.

## Capacidades

- Reconocimiento de entidades nombradas tipado sobre diez tipos: `ngay` (fecha), `dia diem` (ubicacion), `van ban` (documento), `to chuc` (organizacion), `nguoi` (persona), `san pham` (producto), `giai thuong` (premio), `su kien` (evento), `tac pham` (obra) y `chuc vu` (cargo).
- Extraccion conjunta de relaciones entre entidades en una sola pasada de inferencia, con umbral independiente para entidades y para relaciones (`threshold` y `relation_threshold`).
- Definicion de tipos y relaciones en tiempo de inferencia mediante etiquetas en lenguaje natural, sin reentrenamiento.
- Modo flat NER (`flat_ner=True`), que evita spans anidados solapados.
- Salida estructurada lista para serializar a JSON, con utilidades para renombrar los tipos a claves snake_case seguras para JSON.
- Calibracion por umbral: la curva completa de precision/recall esta documentada entre 0,3 y 0,7, lo que permite ajustar el punto de operacion segun el caso de uso.
- No dispone de generacion de texto, razonamiento multi-paso, tool calling ni function calling.
- No soporta agentes, ni vision, ni audio, ni modo thinking.
- Capacidad multilingue: limitada al vietnamita; no se declara soporte para otros idiomas.

## Casos de uso

- Extraccion de entidades y relaciones en prensa vietnamita: el modelo identifica organizaciones, personas, cargos, fechas y ubicaciones, y las relaciones "thanh lap ngay" (fundada el) o "dat tru so tai" (con sede en), lo que permite construir bases de conocimiento de actualidad de forma automatica sobre texto limpio.
- Enriquecimiento de bases de datos de empresas: a partir de descripciones y notas de prensa correctamente acentuadas, se pobla un grafo con nodos de organizacion, persona y cargo, usando las relaciones estrictas que el modelo mantiene en 41,6 de F1.
- Monitorizacion normativa y legal: extraccion de referencias a documentos (`van ban`), fechas de publicacion y organismos emisores en boletines oficiales vietnamitas, donde el tipo `ngay` alcanza 92,6 de F1 y `van ban` 68,8.
- Analisis de convocatorias y premios: deteccion de galardonados (`nguoi`), entidades convocantes (`to chuc`) y premios (`giai thuong`, 45,5 de F1) para alimentar paneles de seguimiento sectorial.
- Indexacion semantica de archivos historicos digitalizados manualmente con acentuacion correcta: el modelo alimenta un motor de busqueda por entidad y relacion, aprovechando que soporta lotes de frases en una sola llamada de inferencia.
- Preanotacion para anotadores humanos: al operar con umbral 0,7 la precision sube a 80,8, lo que resulta util para generar sugerencias de alta precision que un revisor humano corrige antes de incorporarlas a un dataset de entrenamiento.
- Deteccion de menciones de producto y de obra en catalogos y resenas bien escritas, siempre que se asuma la perdida de recall documentada en esos dos tipos.
- Procesamiento por lotes en CPU para volumenes moderados, dado el tamano del modelo (466,6 M de parametros) y la existencia de una demo publica en ZeroGPU sin instalacion.

## Benchmarks y rendimiento

Todos los datos proceden del benchmark propio del autor: 450 frases vietnamitas retenidas con 1.328 spans de entidad auditados a mano, a `threshold=0.5` salvo indicacion contraria. No hay resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generalistas, que no aplican a esta tarea.

NER tipado:

| Modelo | Precision | Recall | F1 |
|---|---:|---:|---:|
| goby-4-ie-vi | 50,5 | 76,6 | 60,9 |
| goby-9-ie-vi | 57,9 | 73,3 | 64,7 |

Bootstrap pareado (goby-9 menos goby-4): +3,8 F1, IC 95% [+2,7, +4,8], 100% de remuestreos positivos.

Precision a recall comparable:

| A recall aproximado | Precision goby-4 | Precision goby-9 |
|---|---:|---:|
| ~77 | 46,4 | 50,3 |
| ~74 | 53,8 | 57,9 |
| ~64 | 67,3 | 67,7 |

Barrido de umbral:

| threshold | Precision | Recall | F1 |
|---|---:|---:|---:|
| 0,3 | 45,9 | 77,9 | 57,8 |
| 0,4 | 50,3 | 76,7 | 60,7 |
| 0,5 | 57,9 | 73,3 | 64,7 |
| 0,6 | 67,7 | 64,4 | 66,0 |
| 0,7 | 80,8 | 52,0 | 63,3 |

El autor anade que el modelo dispara menos predicciones: 1.672 a umbral 0,5 frente a 2.005 de goby-4, con mejor precision ajustada a recall.

F1 por tipo de entidad:

| Tipo | goby-4 | goby-9 |
|---|---:|---:|
| ngay (fecha) | 89,3 | 92,6 |
| dia diem (ubicacion) | 66,8 | 69,8 |
| van ban (documento) | 66,7 | 68,8 |
| to chuc (organizacion) | 55,4 | 59,6 |
| nguoi (persona) | 53,2 | 57,1 |
| san pham (producto) | 59,0 | 51,1 |
| giai thuong (premio) | 42,3 | 45,5 |
| su kien (evento) | 40,0 | 37,5 |
| tac pham (obra) | 52,6 | 33,3 |
| chuc vu (cargo) | 21,7 | 31,2 |

Relaciones (sobre el mismo conjunto):

| Metrica | goby-4-ie-vi | goby-9-ie-vi |
|---|---:|---:|
| Estricta | 40,7 | 41,6 |
| Parcial | 57,7 | 56,7 |

## Requisitos de hardware

- Pesos en fp32: aproximadamente 1,87 GB. En fp16/bf16: aproximadamente 0,93 GB. En int8: aproximadamente 0,47 GB. Los tipos de cuantizacion no estan documentados por el autor.
- VRAM estimada para inferencia: por debajo de 4 GB en fp16 para lotes pequenos, sumando activaciones y el estado del codificador de etiquetas.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060 8 GB, RTX 4060, RTX 4090, asi como en GPUs de centro de datos (A100, H100) donde el cuello de botella sera el preprocesado, no el modelo.
- Inferencia en CPU viable, dado el tamano de 466,6 M de parametros; la demo publica del autor corre en ZeroGPU de Hugging Face, lo que confirma que no requiere hardware dedicado.
- Opciones de despliegue: libreria `gliner` (probado con la version 0.2.29) como via principal, con carga mediante `GLiNER.from_pretrained(...)`; despliegue como Space en Hugging Face. No se documenta soporte para vLLM, TGI, Ollama, llama.cpp ni ONNX.
- Latencia y throughput: no disponible.
- Espacio en disco: 3,7 GB de repositorio, porque incluye dos copias identicas de los pesos (`model.safetensors` y `pytorch_model.bin`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | NER F1 | Relaciones (parcial) | Entrada recomendada | Licencia |
|---|---|---|---|---|---|---|
| goby-9-ie-vi | 466,6 M | no disponible | 64,7 | 56,7 | Prosa vietnamita limpia y acentuada | Apache-2.0 |
| goby-4-ie-vi | no disponible | no disponible | 60,9 | 57,7 | Maximo recall de relaciones | no disponible |
| goby-7-ie-vi | no disponible | no disponible | no disponible (57,2 de F1 con etiquetas acentuadas a umbral 0,5) | 28,5 sin diacriticos / 30,0 en mayusculas | OCR, mayusculas, texto sin diacriticos | no disponible |
| knowledgator/gliner-relex-large-v1.0 | no disponible | no disponible | no disponible | no disponible | Modelo base generalista, no especifico de vietnamita | no disponible |

La comparativa se limita a la propia familia goby y al modelo base, porque no se han proporcionado datos de benchmarks de alternativas externas de extraccion de informacion en vietnamita.

## Limitaciones y advertencias

- El texto degradado destruye el modelo. Sobre las mismas 267 frases, el F1 de relaciones cae de 56,7 en texto limpio a 6,0 sin diacriticos y 6,8 en mayusculas. goby-7-ie-vi obtiene 28,5 y 30,0 en esos mismos escenarios. Si la entrada no esta limpia y correctamente capitalizada, no debe usarse este checkpoint.
- Las etiquetas deben pasarse en vietnamita con diacriticos. Como GLiNER codifica la cadena de etiqueta con el mismo text encoder, `to_chuc` es practicamente una etiqueta no vista. Medido sobre goby-7 a umbral 0,5: 57,2 de F1 con etiquetas acentuadas, 36,1 con ASCII separado por espacios y 32,3 con ASCII en snake_case, es decir, unos 25 puntos de F1 perdidos sin error ni aviso.
- El tipo `chuc vu` (cargo) no es fiable pese al 31,2 del benchmark general: en un conjunto independiente de 55 cargos anotados a mano y correctamente delimitados, goby-9 solo acierta 5 exactamente. El texto de la model card queda truncado en este punto.
- Los tipos con menos ejemplos de entrenamiento pierden recall respecto a goby-4: `tac pham` baja de 52,6 a 33,3, `san pham` de 59,0 a 51,1 y `su kien` de 40,0 a 37,5. La frontera de decision mas nitida tiene ese coste.
- Con umbral 0,5 el recall de entidades es de 73,3, lo que implica perder aproximadamente una de cada cuatro entidades; subir a 0,6 mejora el F1 global a 66,0 pero baja el recall a 64,4.
- Los numeros proceden exclusivamente del benchmark del propio autor sobre 450 frases y 1.328 spans, sin validacion externa ni replicacion independiente. El modelo registra 0 descargas y 0 likes, por lo que no hay evidencia de uso en produccion.
- Riesgo de alucinacion de spans y relaciones: como todo extractor discriminativo, puede generar entidades o relaciones plausibles pero ausentes en el texto, especialmente en relaciones con F1 estricto de 41,6.
- Idioma limitado al vietnamita; no hay soporte declarado para otros idiomas ni capacidad de traduccion.
- No es un modelo generativo: no admite instrucciones, tool calling ni razonamiento multi-paso, por lo que no puede integrarse en agentes sin un componente adicional.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion, sin restricciones de copyleft. Se desconoce la licencia del modelo base y de los checkpoints hermanos, dato que conviene verificar antes de un despliegue comercial combinado.
- Se desconoce la composicion del dataset de entrenamiento, por lo que no puede auditarse el sesgo de dominio ni la representatividad tematica de los datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/belumind/goby-9-ie-vi
- Demo en el navegador (ZeroGPU): https://huggingface.co/spaces/johnathan2023/goby-9-ie-vi-demo
- Modelo hermano para texto degradado: https://huggingface.co/belumind/goby-7-ie-vi
- Modelo hermano orientado a recall de relaciones: https://huggingface.co/belumind/goby-4-ie-vi
- Modelo base: https://huggingface.co/knowledgator/gliner-relex-large-v1.0
- Organizacion del autor: https://huggingface.co/belumind
- Busqueda web: no se han encontrado resultados relevantes sobre este modelo; las consultas devolvieron unicamente contenido no relacionado.
