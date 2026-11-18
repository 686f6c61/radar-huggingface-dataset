# ashford-andrew/UniVI-PBMC-TEA-seq

## Resumen

UniVI-PBMC-TEA-seq es un artefacto de referencia publicado en Hugging Face por el usuario ashford-andrew bajo el paraguas del proyecto UniVI, orientado a la integracion multimodal de datos de celula unica. El modelo trabaja sobre ensayos TEA-seq (Transcriptome, Epitope y Accessibility sequencing), que combinan en una misma celula medidas de expresion de ARN, abundancia de proteinas de superficie y accesibilidad de cromatina. El caso de uso declarado es la referencia sobre celulas mononucleares de sangre periferica (PBMC) con evaluacion mediante retencion de pocillos (held-out-well evaluation).

La relevancia del artefacto es metodologica mas que de producto: representa un punto de referencia para validar tecnicas de integracion multimodal en biologia computacional, un area donde la mayoria de los modelos publicos se limitan a modalidades unicas o a pares de modalidades. La model card es extremadamente escueta y no aporta informacion sobre arquitectura, tamano, datos de entrenamiento ni metricas.

La informacion disponible es muy limitada. No se publican parametros, longitud de contexto, licencia, idiomas ni resultados de benchmarks. Todo lo que no consta en la model card o en los metadatos de Hugging Face se marca explicitamente como "no disponible" en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag "univi" sugiere el marco UniVI para integracion multimodal de celula unica, sin detalle publicado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; opera sobre datos biologicos) |
| Licencia | no disponible |
| Formato de pesos | no disponible |
| Modalidades de entrada | ARN, proteina y accesibilidad de cromatina (TEA-seq) |
| Dominio | biologia, celula unica, PBMC |
| Evaluacion declarada | held-out-well evaluation |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo en la model card ni en los metadatos de Hugging Face. El tag "univi" apunta a un marco de integracion multimodal de celula unica, y los tags "multimodal" y "tea-seq" confirman que el artefacto esta disenado para consumir simultaneamente tres modalidades por celula: transcritoma, epitopos proteicos y accesibilidad de cromatina.

Tampoco consta el volumen de datos de entrenamiento, la composicion del dataset PBMC utilizado, ni si se aplicaron tecnicas de alineacion entre modalidades, aprendizaje contrastivo, autosupervision o ajuste fino supervisado. La unica referencia metodologica explicita es la evaluacion mediante retencion de pocillos, un esquema habitual en datos de celula unica para evitar fuga de informacion entre celulas del mismo pocillo.

## Capacidades

- Integracion multimodal de tres capas de informacion por celula: expresion genica (ARN), marcadores proteicos de superficie y accesibilidad de cromatina.
- Representacion conjunta de celulas PBMC en un espacio latente comun, segun la finalidad declarada del artefacto de referencia.
- Evaluacion con separacion por pocillo (held-out-well), lo que permite medir generalizacion a pocillos no vistos.
- No consta soporte de tool calling, function calling, agentes ni razonamiento multi-paso; no es un modelo de lenguaje generativo.
- No consta capacidad multilingue ni procesamiento de texto libre.
- No consta modo de razonamiento explicito (thinking mode), vision, audio ni otras capacidades fuera del dominio de celula unica.

## Casos de uso

- Analisis exploratorio de PBMC multimodales: usar el modelo para obtener una representacion conjunta de ARN, proteina y cromatina en muestras de sangre periferica, facilitando la visualizacion y el agrupamiento de poblaciones inmunitarias.
- Validacion de pipelines de integracion: emplear el esquema held-out-well como referencia para comprobar si un pipeline propio generaliza a pocillos no vistos antes de desplegarlo en produccion.
- Anotacion de tipos celulares: aprovechar la combinacion de marcadores proteicos y perfiles de expresion para asignar identidades celulares con mas evidencia que usando una sola modalidad.
- Estudio de regulacion genica: relacionar senales de accesibilidad de cromatina con patrones de expresion de ARN en el mismo espacio latente para generar hipotesis sobre elementos reguladores.
- Benchmarking interno de metodos multimodales: comparar nuevas tecnicas de integracion contra esta referencia en un conjunto PBMC estandarizado.
- Formacion y reproduccion metodologica: servir como ejemplo reproducible de integracion tri-modal con particion por pocillo en cursos o publicaciones de biologia computacional.
- Control de calidad de experimentos TEA-seq: detectar lotes o pocillos anomalos comparando su representacion latente con la del resto de la referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al no constar el numero de parametros ni el formato de pesos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; no consta integracion con vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un artefacto de biologia computacional de este tipo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UniVI-PBMC-TEA-seq | no disponible | no disponible | ARN, proteina, cromatina | no disponible | Hugging Face (0 descargas) |
| Otros modelos de integracion multimodal de celula unica | no disponible | no disponible | variable | no disponible | no disponible |

No se dispone de informacion suficiente para establecer una comparativa rigurosa con alternativas concretas de la misma categoria. La model card no cita modelos de referencia ni lineas base.

## Limitaciones y advertencias

- La model card es minima: no documenta arquitectura, datos, hiperparametros ni metricas, lo que impide evaluar su calidad de forma independiente.
- Ausencia de licencia declarada: no puede asumirse permiso para uso comercial, redistribucion ni derivados; es imprescindible contactar con el autor antes de cualquier uso en produccion.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.
- Dominio restringido a PBMC y a ensayos TEA-seq; el comportamiento fuera de ese tipo de muestra o de esa combinacion de modalidades es desconocido.
- Riesgo de sesgo de lote y de composicion de la cohorte de entrenamiento, no documentado.
- Riesgo de sobreajuste a los pocillos de entrenamiento pese al esquema held-out-well; no se publican cifras que lo descarten.
- No es un modelo de lenguaje: no debe emplearse para generacion de texto, codigo ni tareas conversacionales.
- Cualquier uso en investigacion clinica o traslacional requiere validacion externa e independiente.

## Enlaces

- Hugging Face: https://huggingface.co/ashford-andrew/UniVI-PBMC-TEA-seq
