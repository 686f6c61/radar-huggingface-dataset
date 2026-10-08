# mradermacher/SecGPT-14B-GGUF

## Resumen

SecGPT-14B-GGUF es la version cuantizada en formato GGUF del modelo clouditera/SecGPT-14B, un modelo de lenguaje de ~14.770 millones de parametros especializado en dominio de seguridad y conversacion, publicado originalmente por Clouditera. Esta version concreta ha sido generada por mradermacher, un conocido cuantizador de la comunidad, que produce sistematicamente versiones GGUF de modelos abiertos para facilitar su ejecucion en hardware de consumo mediante llama.cpp y derivados. El modelo base esta orientado a tareas de ciberseguridad y chat, y su idioma principal declarado es el chino (zh).

La relevancia de esta ficha reside en que el repositorio original solo distribuye pesos en precision completa (safetensors), lo que exige hardware de gama alta para inferencia. La version GGUF resuelve ese problema ofreciendo once variantes de cuantizacion que van desde Q2_K (5,9 GB) hasta Q8_0 (15,8 GB), lo que permite desplegar un modelo de casi 15.000 millones de parametros en GPUs consumer e incluso en CPU con memoria suficiente. La licencia Apache 2.0 del modelo base facilita su uso comercial, algo poco habitual en modelos especializados de seguridad.

El modelo se distribuye bajo licencia Apache 2.0, con salida conversacional y etiquetas de seguridad y chat. No se dispone en la informacion proporcionada de detalles sobre la longitud de contexto, la composicion del dataset de entrenamiento ni resultados de benchmarks, por lo que esos apartados se marcan explicitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer denso de ~14,77 B de parametros, segun el recuento de safetensors del modelo base; no confirmado en la informacion proporcionada) |
| Parametros totales | 14.770.033.664 (~14,77 B) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (quants estaticos); el autor publica ademas quants con imatrix en el repositorio SecGPT-14B-i1-GGUF |
| Idiomas soportados | zh (chino) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base esta en safetensors) |

## Arquitectura y entrenamiento

No se dispone en la informacion proporcionada de detalles sobre la arquitectura interna del modelo base (tipo de atencion, numero de capas, dimension del modelo, uso de GQA, RoPE, etc.), ni sobre el proceso de entrenamiento (numero de tokens, composicion del corpus, fases de ajuste supervisado, RLHF o DPO). La unica informacion estructural fiable es el recuento de parametros del modelo base, 14.770.033.664, que situa al modelo en la franja de los 14-15 B de parametros en precision completa (fp16/bf16), lo que es coherente con un transformer denso de tamano medio-grande. La model card del repositorio GGUF no aporta informacion adicional sobre el entrenamiento, limitandose a documentar el proceso de cuantizacion.

En cuanto al proceso de cuantizacion, mradermacher indica en la model card que se trata de quants estaticos derivados del repositorio clouditera/SecGPT-14B, con convert_type hf y cuantizacion de tensores de salida activada (output_tensor_quantised: 1). Adicionalmente, el autor mantiene un repositorio separado con quants ponderados por matriz de importancia (imatrix), que suelen ofrecer mejor relacion calidad/tamano que los quants estaticos equivalentes. Los quants se distribuyen en un unico fichero por variante, salvo los de mayor tamano que pueden requerir concatenacion de partes multiparte.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como chat y soporta dialogos multi-turno, segun los tags del repositorio.
- Especializacion en seguridad: es la capacidad diferencial del modelo, orientada a contenido y tareas del dominio de ciberseguridad (analisis, explicacion y asistencia tecnica en ese ambito).
- Idiomas: el unico idioma declarado es el chino (zh). No hay evidencia en la informacion proporcionada de soporte multilingue amplio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.
- Vision o audio: no disponible; el modelo parece ser exclusivamente de texto.
- Compatibilidad de despliegue: los ficheros GGUF son compatibles con el ecosistema llama.cpp, Ollama, LM Studio y otros runners que consumen GGUF, ademas de la etiqueta endpoints_compatible del repositorio.

## Casos de uso

- Triaje de alertas de seguridad: integrado en un pipeline SIEM/SOAR, el modelo puede resumir y priorizar alertas en chino, clasificar su severidad y proponer el siguiente paso de investigacion, reduciendo la carga manual del equipo de operaciones de seguridad.
- Explicacion de vulnerabilidades y CVEs: dado un identificador o una descripcion tecnica, el modelo puede generar una explicacion en chino del impacto, la superficie afectada y las mitigaciones recomendadas, util para equipos internos sin ingles tecnico fluido.
- Asistencia en respuesta a incidentes: como copiloto conversacional durante un incidente, permite consultar procedimientos, resumir hallazgos y redactar el informe posterior, aprovechando su entrenamiento en terminologia de seguridad.
- Generacion y revision de reglas de deteccion: el modelo puede ayudar a redactar o revisar reglas Sigma/YARA/Snort y explicar que patron detecta cada una, acelerando la puesta en produccion de detecciones.
- Formacion y concienciacion en ciberseguridad: desplegado en local con llama.cpp u Ollama, sirve como asistente de simulacion de escenarios de ataque y defensa para entrenar a analistas noveles.
- Analisis de texto malicioso (phishing, estafas): apoyo a la clasificacion y explicacion de correos o mensajes sospechosos en chino, generando un veredicto y una justificacion que el analista pueda revisar.
- Documentacion tecnica de seguridad interna: generacion de borradores de politicas, procedimientos y guias de hardening en chino a partir de notas internas o de estandares de referencia.
- Inferencia en local con privacidad estricta: al ejecutarse en formato GGUF sobre hardware propio, permite procesar datos sensibles de seguridad sin enviarlos a APIs externas, algo critico en entornos regulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni el repositorio GGUF de mradermacher ni los datos extraidos de la model card incluyen cifras de MMLU, HumanEval, GSM8K, C-Eval, CMMLU ni de evaluaciones especificas de seguridad. Para obtener metricas habria que consultar la model card y la documentacion del modelo base clouditera/SecGPT-14B, fuera del alcance de la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada segun el fichero de pesos (peso en disco mas overhead de contexto y runtime; el overhead crece con la longitud de contexto):
  - Q2_K (5,9 GB): ~7-8 GB de VRAM.
  - Q3_K_S / Q3_K_M / Q3_K_L (6,8 / 7,4 / 8,0 GB): ~8-10 GB de VRAM.
  - IQ4_XS (8,3 GB), Q4_K_S (8,7 GB), Q4_K_M (9,1 GB): ~10-12 GB de VRAM.
  - Q5_K_S / Q5_K_M (10,4 / 10,6 GB): ~12-14 GB de VRAM.
  - Q6_K (12,2 GB): ~14-16 GB de VRAM.
  - Q8_0 (15,8 GB): ~18-20 GB de VRAM.
- GPUs consumer: las variantes Q4_K_M y Q4_K_S caben en GPUs de 12 GB (RTX 3060 12 GB, RTX 4070, RTX 4080) e incluso en 8 GB con Q2_K o Q3_K_S. Las variantes Q5 y Q6 encajan en GPUs de 16 GB (RTX 4060 Ti 16 GB, RTX 4080 16 GB, RTX 4090 con margen amplio). Q8_0 requiere 24 GB (RTX 3090, RTX 4090) o el uso de offload parcial a CPU.
- GPUs profesionales: A100 40/80 GB, H100 y L40S ejecutan cualquier variante del repositorio con holgura y permiten lotes grandes.
- CPU y memoria del sistema: al ser GGUF, las variantes de menor tamano pueden ejecutarse total o parcialmente en CPU con llama.cpp; se recomienda al menos tanta RAM como el tamano del fichero mas el contexto, y un minimo practico de 16 GB para Q4 y 32 GB para Q8_0.
- Opciones de despliegue: llama.cpp (referencia para GGUF), Ollama, LM Studio, koboldcpp, text-generation-webui, y servidores compatibles con GGUF. Para despliegues de alto throughput con este modelo en formato safetensors serian preferibles vLLM o TGI, pero esas herramientas no consumen GGUF de forma nativa.
- Latencia y throughput: no disponible. No se han proporcionado mediciones de tokens por segundo ni de latencia por peticion para ninguna de las variantes.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Cuantizaciones | Contexto | Licencia | Notas |
|---|---|---|---|---|---|---|
| mradermacher/SecGPT-14B-GGUF | ~14,77 B | GGUF | 11 variantes (Q2_K a Q8_0) | no disponible | apache-2.0 | Objeto de esta ficha; quants estaticos |
| mradermacher/SecGPT-14B-i1-GGUF | ~14,77 B | GGUF | quants ponderados con imatrix | no disponible | apache-2.0 | Mismo autor y mismo modelo base; habitualmente mejor calidad por bit que los quants estaticos |
| clouditera/SecGPT-14B | ~14,77 B | safetensors | ninguna (precision completa) | no disponible | apache-2.0 | Modelo base original; requiere hardware de gama alta para inferencia |

No se dispone de informacion suficiente para comparar este modelo con otras alternativas de la misma categoria (por ejemplo, otros modelos especializados en seguridad de tamano similar) en terminos de benchmarks, contexto o rendimiento. Cualquier comparacion cuantitativa al respecto se marcaría como no disponible.

## Limitaciones y advertencias

- Idioma: el unico idioma declarado es el chino (zh). El rendimiento en castellano o en ingles no esta documentado y previsiblemente sera inferior; no debe asumirse calidad multilingue.
- Ausencia de benchmarks: no hay ninguna evaluacion publicada en la informacion disponible, ni generalista ni de seguridad, por lo que el rendimiento real del modelo es desconocido a efectos practicos.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion tecnica incorrecta, y en el dominio de seguridad esto es especialmente peligroso (por ejemplo, recomendaciones de mitigacion erroneas, hashes o CVE inventados, reglas de deteccion con sintaxis invalida). Toda salida debe validarse antes de aplicarla en produccion.
- Riesgo de doble uso: un modelo especializado en seguridad puede emplearse tanto para defensa como para asistir en actividades ofensivas. Es responsabilidad del operador establecer controles de uso y filtros de salida acordes con su politica de seguridad.
- Sesgos: no hay informacion proporcionada sobre el dataset de entrenamiento, por lo que no es posible caracterizar los sesgos presentes. Se asume que hereda los sesgos del corpus original, mayoritariamente en chino.
- Longitud de contexto desconocida: no se ha especificado la ventana de contexto, lo que impide garantizar el comportamiento en conversaciones largas o en tareas de resumen de documentos extensos. Conviene verificar este dato en la model card del modelo base antes de disenar un despliegue.
- Degradacion por cuantizacion: las variantes de menor tamano (Q2_K y Q3_K_S) reducen la calidad de forma apreciable. Los quants en el rango Q5-Q8 son los recomendados si el hardware lo permite. El autor marca Q3_K_M explicitamente como de calidad inferior.
- Restricciones de licencia: la licencia es Apache 2.0, que permite uso comercial, modificacion y redistribucion con atribucion y conservacion del aviso de licencia. No obstante, conviene verificar la licencia del modelo base en su repositorio original por si hubiera condiciones adicionales no reflejadas en esta ficha.
- Ficheros multiparte: algunas variantes GGUF de mayor tamano pueden distribuirse en varios ficheros que deben concatenarse siguiendo las indicaciones habituales de llama.cpp; un manejo incorrecto provoca fallos de carga.
- Estado del repositorio: el repositorio registra una actualizacion posterior a su creacion, por lo que conviene fijar una revision concreta (commit) en entornos de produccion para garantizar la reproducibilidad de los pesos descargados.

## Enlaces

- Repositorio HuggingFace (esta version cuantizada): https://huggingface.co/mradermacher/SecGPT-14B-GGUF
- Repositorio de quants con imatrix del mismo autor: https://huggingface.co/mradermacher/SecGPT-14B-i1-GGUF
- Modelo base original: https://huggingface.co/clouditera/SecGPT-14B
- Pagina resumen de descargas del autor para este modelo: https://hf.tst.eu/model#SecGPT-14B-GGUF
- Guia de uso de ficheros GGUF y concatenacion multiparte (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones y FAQ de cuantizaciones de mradermacher: https://huggingface.co/mradermacher/model_requests
