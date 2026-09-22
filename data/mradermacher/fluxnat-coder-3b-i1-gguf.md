# mradermacher/Fluxnat-Coder-3B-i1-GGUF

## Resumen

Fluxnat-Coder-3B-i1-GGUF es una recopilacion de cuantizaciones en formato GGUF del modelo k4ran909/Fluxnat-Coder-3B, publicada por el usuario mradermacher. Se trata de un modelo de ~3.090 millones de parametros (3.085.938.688 segun los pesos en safetensors del modelo base) especializado en seguridad del codigo: sus etiquetas declaran deteccion de vulnerabilidades, SAST, auditoria de seguridad, CWE, OWASP, analisis de codigo y codificacion segura, ademas de uso conversacional. El repositorio no contiene pesos originales, sino versiones comprimidas para inferencia local.

La relevancia de esta publicacion es practica: permite ejecutar un modelo especializado en analisis de seguridad en hardware de consumo mediante llama.cpp u Ollama, con cuantizaciones que van desde 0,9 GB (IQ1_S) hasta 2,6 GB (Q6_K). Las variantes i1- incorporan una importance matrix (imatrix) que mejora la calidad de las cuantizaciones de baja precision respecto a las estaticas, disponibles por separado en el repositorio mradermacher/Fluxnat-Coder-3B-GGUF.

La model card es minima: no documenta la arquitectura del modelo base, la longitud de contexto, el volumen ni la composicion de los datos de entrenamiento, ni resultados de benchmarks. El repositorio tenia 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria independiente de su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no especifica la arquitectura del modelo base) |
| Parametros totales | 3.085.938.688 (~3,09 mil millones) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, ademas de un fichero imatrix para generar cuantizaciones propias |
| Idiomas soportados | ingles (en) y codigo |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones ponderadas por imatrix); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La model card no aporta informacion sobre la arquitectura del modelo base ni sobre su proceso de entrenamiento. El unico indicio tecnico es la etiqueta "unsloth" en el repositorio, que sugiere que el ajuste fino del modelo original k4ran909/Fluxnat-Coder-3B se realizo con la libreria Unsloth, habitual en fine-tuning eficiente de transformers mediante LoRA/QLoRA, pero no permite deducir la arquitectura subyacente, el numero de tokens de entrenamiento, la composicion del dataset ni la existencia de fases de RLHF o DPO. No hay publicados ni paper ni informe tecnico asociados.

Lo que si esta documentado es el proceso de cuantizacion. Los ficheros i1- se generaron con cuantizacion ponderada por importance matrix (imatrix), un metodo que estima la importancia de cada tensor a partir de activaciones de calibracion y distribuye el error de forma mas eficiente. Los metadatos del repositorio indican quantize_version 2, output_tensor_quantised 1 y convert_type hf. El fichero imatrix (0,1 GB) se publica para que terceros puedan reproducir el proceso. Existe una version con cuantizaciones estaticas en un repositorio aparte.

## Capacidades

- Generacion de codigo y analisis de codigo fuente, con foco declarado en seguridad (etiquetas: code-analysis, secure-coding).
- Deteccion de vulnerabilidades y clasificacion segun taxonomias CWE y OWASP.
- Soporte declarado a flujos SAST (analisis estatico de seguridad) y auditoria de seguridad.
- Asistencia en pruebas de penetracion y revision de codigo orientada a hardening.
- Uso conversacional multi-turno (etiqueta "conversational" y "endpoints_compatible").
- Capacidad multilingue limitada: ingles y codigo; no se declaran otros idiomas naturales.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Capacidades de agente y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multimodales (vision, audio) o modo de razonamiento explicito (thinking): no disponible (no documentado).

## Casos de uso

- Revision de codigo en pull requests: integrado como paso de CI/CD, el modelo puede analizar el diff y senalar patrones asociados a CWE (inyeccion SQL, XSS, deserializacion insegura) antes del merge, aprovechando que su tamano de 3B permite ejecutarlo en el runner sin GPU dedicada.
- Analisis estatico asistido por LLM: complemento a herramientas SAST clasicas como Semgrep o CodeQL, priorizando hallazgos y explicando el vector de ataque de cada uno en lenguaje natural.
- Triaje de alertas de seguridad: clasificacion de informes de escaneo para separar falsos positivos de hallazgos reales, con la ventaja de que las cuantizaciones de ~2 GB permiten desplegarlo on-premise sin enviar codigo propietario a servicios externos.
- Formacion de desarrolladores en codigo seguro: generacion de ejemplos de codigo vulnerable y su version corregida, con explicacion de la mitigacion segun OWASP, en un entorno local.
- Auditoria de dependencias y fragmentos heredados: revision de codigo legacy del que no hay documentacion, generando descripciones de comportamiento y riesgos potenciales.
- Asistente de escritorio para pentesters: con la cuantizacion Q4_K_M (2,0 GB) puede ejecutarse en un portatil con 8 GB de RAM via llama.cpp u Ollama durante una auditoria sin conexion.
- Generacion de pruebas de seguridad: redaccion de casos de prueba unitarios que verifiquen validacion de entradas y control de acceso en funciones concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizaciones no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K, SecurityEval u otras), y la busqueda web no ha devuelto documentacion tecnica asociada al modelo base k4ran909/Fluxnat-Coder-3B.

## Requisitos de hardware

Los tamanos de fichero siguientes estan tomados del repositorio. La VRAM estimada se calcula como el tamano del fichero mas un margen de 0,5 a 1 GB para cache KV y overhead del runtime con contextos cortos a moderados; son estimaciones, no mediciones publicadas.

| Cuantizacion | Tamano (GB) | VRAM estimada | Notas |
|---|---|---|---|
| i1-IQ1_S | 0,9 | ~1,5 GB | calidad muy degradada |
| i1-IQ2_M | 1,2 | ~2 GB | |
| i1-Q3_K_M | 1,7 | ~2,5 GB | |
| i1-IQ4_XS | 1,8 | ~2,5 GB | mejor relacion calidad/tamano en el rango bajo |
| i1-Q4_K_M | 2,0 | ~2,5-3 GB | recomendada por el autor: rapida |
| i1-Q5_K_M | 2,3 | ~3 GB | |
| i1-Q6_K | 2,6 | ~3,5 GB | practicamente equivalente a Q6_K estatica |
| imatrix | 0,1 | no aplica | solo para generar cuantizaciones propias |

- Cabe en cualquier GPU de consumo: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090, e incluso en GPUs de 4-6 GB con cuantizaciones Q3/Q4.
- Tambien es viable en CPU con 8-16 GB de RAM; el cuello de botella sera la velocidad de generacion, no la memoria.
- GPUs de datacenter (A100, H100) no aportan ventaja significativa para un modelo de 3B; el uso tipico es local o en un nodo pequeno.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y servidores compatibles con la API de endpoints de HuggingFace.
- Latencia y throughput: no disponible (no hay mediciones publicadas).

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este modelo ni para su base, por lo que no es posible comparar calidad. La comparacion se limita a caracteristicas verificables entre las distintas distribuciones del mismo modelo.

| Modelo | Parametros | Formato | Cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fluxnat-Coder-3B-i1-GGUF | 3,09 B | GGUF | 24 variantes i1- con imatrix | Apache 2.0 | HuggingFace, 0 descargas |
| Fluxnat-Coder-3B-GGUF (estaticas) | 3,09 B | GGUF | cuantizaciones estaticas | Apache 2.0 | HuggingFace |
| k4ran909/Fluxnat-Coder-3B (base) | 3,09 B | safetensors | sin cuantizar | Apache 2.0 | HuggingFace |

Comparativa con alternativas de otros autores de la misma categoria (modelos de ~3B especializados en codigo o seguridad): no disponible, al no existir benchmarks publicados de este modelo que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia cuantitativa de su rendimiento en deteccion de vulnerabilidades, generacion de codigo o conversacion.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta implican que no ha sido validado por la comunidad.
- Riesgo de alucinacion especialmente grave en este dominio: un falso negativo en un analisis de seguridad puede dar una falsa sensacion de cobertura; debe usarse como apoyo, nunca como sustituto de un SAST, de pruebas dinamicas o de una auditoria humana.
- Idiomas: solo ingles y codigo. El uso en castellano no esta soportado ni documentado.
- Longitud de contexto desconocida: sin este dato no se puede planificar el analisis de ficheros largos o repositorios completos.
- Falta de documentacion de entrenamiento: sin datos sobre el dataset no es posible evaluar sesgos, contaminacion de benchmarks ni licencias de los datos de entrenamiento.
- Cuantizaciones de muy baja precision: las variantes IQ1 e IQ2 (0,9-1,4 GB) degradan notablemente la coherencia; para uso real conviene Q4_K_M o superior.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el cuantizador no ofrece garantias; conviene verificar la licencia y procedencia del modelo base antes de un despliegue en produccion.
- Metadatos inconsistentes: el repositorio figura con fechas de creacion y actualizacion de septiembre de 2026, lo que sugiere un error en los metadatos de HuggingFace.
- El repositorio ocupa 36,8 GB en total por acumular todas las cuantizaciones; conviene descargar unicamente el fichero necesario.

## Enlaces

- Repositorio HuggingFace (cuantizaciones i1): https://huggingface.co/mradermacher/Fluxnat-Coder-3B-i1-GGUF
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Fluxnat-Coder-3B-GGUF
- Modelo base: https://huggingface.co/k4ran909/Fluxnat-Coder-3B
- Pagina de resumen y listado de descargas: https://hf.tst.eu/model#Fluxnat-Coder-3B-i1-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/Fluxnat-Coder-3B-i1-GGUF/resolve/main/Fluxnat-Coder-3B.imatrix.gguf
- Guia de uso de ficheros GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos a mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
