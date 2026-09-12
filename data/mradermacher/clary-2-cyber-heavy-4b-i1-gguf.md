# mradermacher/Clary-2-Cyber-Heavy-4B-i1-GGUF

## Resumen

Clary-2-Cyber-Heavy-4B-i1-GGUF es un repositorio de cuantizaciones en formato GGUF generado por mradermacher a partir del modelo AuroraSystem/Clary-2-Cyber-Heavy-4B. No se trata, por tanto, de un modelo entrenado desde cero, sino de una redistribucion optimizada para inferencia local del modelo original: el trabajo de mradermacher consiste en aplicar cuantizacion con imatrix (importancia matricial) para reducir el peso en disco y memoria con la menor perdida posible de calidad. Las etiquetas del repositorio apuntan a un modelo afinado para ciberseguridad, CTF (capture the flag), codigo y ingenieria inversa, con un tamano nominal de 4B parametros.

El modelo base esta etiquetado con qwen y qwen3, ademas de dora, lo que sugiere (sin confirmacion explicita en la model card) una arquitectura transformer derivada de la familia Qwen3 y un ajuste fino mediante DoRA (weight-decomposed low-rank adaptation). Los idiomas declarados son ruso e ingles. La licencia declarada es Apache 2.0, lo que en principio permite uso comercial, aunque conviene verificar la licencia del modelo original.

Su relevancia practica es la de un modelo especializado y pequeno (nominalmente 4B) que puede ejecutarse en GPU de consumo o incluso en CPU mediante llama.cpp, lo que lo hace util para entornos de pentesting, analisis de artefactos maliciosos o asistencia en retos CTF sin depender de APIs externas ni enviar datos sensibles a terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (las etiquetas qwen/qwen3 sugieren una base transformer de la familia Qwen3; no se confirma en la model card) |
| Parametros totales | 958.716 segun los metadatos de safetensors del repositorio; el nombre del modelo indica 4B, por lo que existe una discrepancia clara y el dato debe tomarse con cautela |
| Parametros activos | no aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ1_M, IQ1_S, IQ2_M, IQ2_S, IQ2_XS, IQ2_XXS, IQ3_M, IQ3_S, IQ3_XS, IQ3_XXS, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, IQ4_NL, IQ4_XS, Q5_K_S, Q5_K_M, Q6_K (listado en los metadatos internos del README) |
| Idiomas soportados | ruso (ru), ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF; el repositorio incluye ademas un fichero imatrix (Clary-2-Cyber-Heavy-4B.imatrix.gguf, 0.1 GB) para generar cuantizaciones propias |

## Arquitectura y entrenamiento

La model card del repositorio no describe la arquitectura ni el proceso de entrenamiento del modelo original; unicamente indica que se trata de cuantizaciones con imatrix del modelo AuroraSystem/Clary-2-Cyber-Heavy-4B. Las etiquetas asociadas (qwen, qwen3, dora, cybersecurity, ctf, code, reverse-engineering) permiten inferir que el modelo base es un ajuste fino de un modelo de la familia Qwen3 orientado a tareas de ciberseguridad, y que el ajuste se realizo probablemente con DoRA en lugar de LoRA estandar. Esta inferencia no esta confirmada por el autor y debe tratarse como tal.

En cuanto al proceso de cuantizacion, si esta documentado: mradermacher emplea cuantizacion ponderada con ficheros imatrix, una tecnica que estima la importancia de cada matriz de pesos a partir de estadisticas de activacion para asignar mas bits a las capas mas sensibles. El resultado son cuantizaciones de tipo IQ (importancia-based quantization) que, segun el propio autor y la grafica de ikawrakow enlazada en el README, ofrecen mejor perplejidad que las cuantizaciones estaticas de tamano equivalente. De la model card se desprende que existen dos repositorios: este (i1, con imatrix) y uno de cuantizaciones estaticas (Clary-2-Cyber-Heavy-4B-GGUF).

## Capacidades

- Generacion de texto y codigo, con enfasis declarado en tareas de ciberseguridad, CTF e ingenieria inversa (etiquetas del repositorio).
- Analisis y explicacion de codigo, previsiblemente en lenguajes de bajo nivel habituales en reversing (C, C++, ensamblador) y en scripting de explotacion (Python, Bash), aunque no se detalla en la informacion disponible.
- Asistencia en retos de tipo capture the flag segun la etiqueta ctf.
- Capacidades multilingues limitadas a ruso e ingles; no se declara soporte de castellano.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Vision o audio: no disponible; el repositorio no incluye proyector multimodal (la propia model card contempla la posibilidad de omitir mmproj, pero no se ha publicado ningun fichero de este tipo).

## Casos de uso

- Analisis de artefactos maliciosos en local: al ser una cuantizacion GGUF ejecutable con llama.cpp u Ollama, permite analizar muestras y scripts sospechosos sin enviar el contenido a APIs externas, algo critico cuando el material no puede salir del perimetro de la organizacion.
- Asistencia en retos CTF: el modelo puede ayudar a interpretar binarios, identificar patrones de ofuscacion y proponer hipotesis de explotacion durante las competiciones, con la ventaja de desplegarse en un portatil con GPU de consumo.
- Formacion y laboratorios de seguridad: sirve como tutor para explicar tecnicas de reversing o vulnerabilidades en ruso e ingles, ejecutandose en el propio equipo del alumno sin coste por token.
- Generacion y revision de scripts de seguridad: a partir de la etiqueta code, puede redactar utilidades de analisis, parsers de logs o scripts de automatizacion en Python y Bash.
- Triaje de informes y alertas: dado un volcado de logs o una descripcion de incidente en ingles o ruso, puede resumir y clasificar los hallazgos antes de una revision humana.
- Despliegue en entornos aislados (air-gapped): el formato GGUF y la posibilidad de ejecucion en CPU permiten usarlo en redes sin conexion, donde no es viable un modelo servido por API.
- Documentacion tecnica bilingue ruso-ingles: traduccion y reescritura de notas tecnicas de seguridad entre ambos idiomas, uno de los pocos casos donde la cobertura linguistica declarada resulta directamente util.
- Cuantizacion propia a partir del fichero imatrix: el repositorio incluye el imatrix, de modo que un equipo puede generar sus propios tamanos de cuantizacion ajustados a su presupuesto de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizacion no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluaciones especificas de ciberseguridad, y la busqueda web realizada no ha devuelto ningun resultado relacionado con este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir del tamano nominal de 4B, no confirmadas por el autor):
  - Cuantizacion Q2_K / IQ2: aproximadamente 1,5-2 GB.
  - Cuantizacion Q4_K_M: aproximadamente 2,5-3 GB.
  - Cuantizacion Q5_K_M: aproximadamente 3-3,5 GB.
  - Cuantizacion Q6_K: aproximadamente 3,5-4 GB.
  - Cuantizacion Q8_0 / F16: aproximadamente 4,5-8,5 GB.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 6-8 GB de VRAM o mas (RTX 3060, RTX 4060, RTX 2070, etc.) usando cuantizaciones Q4 o inferiores. No hay confirmacion de esto por parte del autor.
- GPU profesionales recomendadas: no disponible; para un modelo de este tamano no serian necesarias tarjetas A100 o H100 salvo para servir muchas peticiones concurrentes.
- Ejecucion en CPU: viable gracias al formato GGUF, con velocidades dependientes del numero de nucleos y del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El tag endpoints_compatible sugiere tambien compatibilidad con endpoints de HuggingFace. No se ha confirmado soporte de vLLM o TGI para este repositorio concreto.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/Clary-2-Cyber-Heavy-4B-i1-GGUF (este) | 4B nominal (metadatos de safetensors: 958.716, discrepancia sin resolver) | no disponible | GGUF con cuantizaciones imatrix | apache-2.0 | Incluye fichero imatrix para cuantizacion propia |
| mradermacher/Clary-2-Cyber-Heavy-4B-GGUF | 4B nominal | no disponible | GGUF con cuantizaciones estaticas | apache-2.0 | Mismo modelo base; cuantizaciones sin imatrix, calidad inferior a igual tamano segun el propio autor |
| AuroraSystem/Clary-2-Cyber-Heavy-4B | 4B nominal | no disponible | safetensors (transformers) | apache-2.0 | Modelo original sin cuantizar; requiere mas VRAM |

No se dispone de datos de rendimiento comparado con otras alternativas de la misma categoria (por ejemplo, otros ajustes finos de Qwen3 orientados a ciberseguridad), por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El repositorio cuantiza un modelo de terceros: la responsabilidad sobre sesgos, calidad y licencia del modelo original recae en AuroraSystem, no en el cuantizador. Conviene revisar la model card del modelo base antes de usarlo en produccion.
- Existe una discrepancia no resuelta entre el nombre del modelo (4B) y el recuento de parametros reportado en los metadatos de safetensors (958.716). Cualquier estimacion de VRAM o coste debe verificarse experimentalmente.
- El tamano del repositorio figura como 0.0 GB y la tabla de ficheros del README solo lista el fichero imatrix, lo que sugiere que las cuantizaciones anunciadas en los metadatos podrian no estar subidas o no estar indexadas correctamente. Verifique los ficheros disponibles antes de descargar.
- No hay informacion sobre la longitud de contexto soportada; asumir un contexto amplio sin verificarlo puede provocar truncamientos silenciosos.
- Cobertura linguistica limitada a ruso e ingles. No se declara soporte de castellano, por lo que el rendimiento en espanol es impredecible.
- Un modelo especializado en ciberseguridad y CTF puede generar codigo ofensivo o instrucciones de explotacion. Debe desplegarse con controles de uso y politicas claras, especialmente si se expone a usuarios finales.
- Riesgo de alucinacion inherente a los modelos de 4B parametros, agravado en dominios tecnicos donde una respuesta incorrecta sobre una vulnerabilidad o un binario puede tener consecuencias graves.
- Las cuantizaciones de 2 bits o menos (Q2_K, IQ1_S, IQ2_XXS) degradan notablemente la calidad; para uso serio en analisis tecnico se recomienda Q4_K_M o superior.
- Aunque la licencia declarada es Apache 2.0, no se ha verificado la cadena completa de licencias del modelo base ni de los datos de ajuste; revise los terminos antes de un uso comercial.
- No se han publicado evaluaciones de seguridad (red teaming), sesgos o robustez.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/mradermacher/Clary-2-Cyber-Heavy-4B-i1-GGUF
- Modelo base: https://huggingface.co/AuroraSystem/Clary-2-Cyber-Heavy-4B
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Clary-2-Cyber-Heavy-4B-GGUF
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#Clary-2-Cyber-Heavy-4B-i1-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/Clary-2-Cyber-Heavy-4B-i1-GGUF/resolve/main/Clary-2-Cyber-Heavy-4B.imatrix.gguf
- Preguntas frecuentes y peticiones de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (README de TheBloke, referenciado por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafica comparativa de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Sitio del patrocinador del cuantizador, nethype GmbH: https://www.nethype.de/
- La busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo; los resultados obtenidos correspondian a sitios de alojamiento de imagenes y no guardan relacion con el modelo.
