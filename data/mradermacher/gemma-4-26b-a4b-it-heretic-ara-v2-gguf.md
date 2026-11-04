# mradermacher/gemma-4-26B-A4B-it-heretic-ara-v2-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF estáticas del modelo `trohrbaugh/gemma-4-26B-A4B-it-heretic-ara-v2`, una variante "abliterated" o "decensored" de un supuesto Gemma 4 de 26B con arquitectura Mixture-of-Experts (la nomenclatura "A4B" indica aproximadamente 4 mil millones de parámetros activos por token). El trabajo de cuantización lo realiza mradermacher, un actor habitual en el ecosistema GGUF, y el modelo base ha sido modificado mediante técnicas de "abliteration" (eliminación selectiva de direcciones de rechazo en el espacio de activaciones) para reducir los comportamientos de negativa o censura del modelo original.

El dato real de parámetros totales, extraído de los safetensors del modelo base, es de 25.233.142.046 (unos 25,2B), lo que encaja con la etiqueta comercial "26B". El repositorio ocupa 184,9 GB e incluye tanto cuantizaciones del modelo de lenguaje como ficheros `mmproj` para el codificador multimodal, lo que confirma que el modelo base conserva capacidades de visión. La licencia declarada es Apache 2.0, aunque el enlace de licencia apunta a los términos propios de Gemma 4 de Google, lo que introduce una ambigüedad relevante para uso comercial.

Es relevante ahora porque combina tres tendencias del ecosistema open source: modelos MoE eficientes en inferencia, versiones "uncensored" para investigación sobre alineación y rechazo, y distribución en GGUF para despliegue en hardware de consumo mediante llama.cpp y derivados. No hay pipeline declarado ni resultados de benchmarks publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), segun la nomenclatura "A4B" del nombre; detalles internos no disponibles |
| Parametros totales | 25.233.142.046 (dato real de safetensors del modelo base) |
| Parametros activos | aproximadamente 4B (inferido de la etiqueta "A4B"); cifra exacta no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16; quants con imatrix en repositorio i1 aparte |
| Idiomas soportados | en (segun metadatos); otros idiomas no disponibles |
| Licencia | apache-2.0 declarada, con license_link a los terminos de Gemma 4 de Google |
| Formato de pesos | GGUF (cuantizaciones) y safetensors en el modelo base |
| Tamano del repositorio | 184,9 GB |
| Descargas / likes | 684 / 4 |
| Fecha de creacion | 2026-04-15 |
| Ultima actualizacion | 2026-11-04 |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE), deducida de la convencion de nombres "26B-A4B": 25,2B parámetros totales con aproximadamente 4B activos por token, lo que reduce el coste computacional de inferencia frente a un modelo denso del mismo tamano. No se dispone de informacion sobre el numero de capas, dimension del modelo, numero de expertos, top-k de enrutamiento ni atencion utilizada (estándar, GQA, sliding window u otras variantes). El modelo base incorpora un codificador multimodal, evidenciado por los ficheros `mmproj` incluidos en el repositorio GGUF.

El modelo base ha sido sometido a un proceso de "abliteration" (etiquetas heretic, uncensored, decensored, abliterated), que consiste en identificar y eliminar las direcciones de activacion asociadas a comportamientos de rechazo, tipicamente mediante calculo de direcciones medias de rechazo y proyeccion ortogonal de las matrices de pesos. No hay informacion sobre el dataset de entrenamiento original de Gemma 4, el numero de tokens, la composicion del corpus, ni sobre si hubo RLHF, DPO o alguna etapa de ajuste posterior a la abliteracion. La etiqueta "ara" en el nombre no esta documentada en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat ("it" en el nombre indica instruction-tuned).
- Razonamiento y respuesta a instrucciones heredadas del modelo base Gemma 4.
- Capacidades multimodales (vision) conservadas mediante los ficheros `mmproj` del repositorio.
- Comportamiento "decensored": menor probabilidad de rechazar peticiones que el modelo original, orientado a investigacion sobre alineacion y filtrado.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo "en" declarado en metadatos; soporte de otros idiomas no disponible.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y rechazo: el modelo permite estudiar como la abliteration altera las distribuciones de respuesta y las activaciones internas, comparando con el modelo Gemma 4 original en experimentos controlados.
- Evaluacion de robustez de filtros de seguridad: util para probar si los sistemas de moderacion posteriores detectan contenido que un modelo decensored genera con mayor facilidad, sin desplegarlo en produccion.
- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M (16,9 GB) y Q5_K_M (19,2 GB) permiten ejecutar el modelo en GPUs de consumo con 24 GB de VRAM mediante llama.cpp u Ollama.
- Generacion de texto en ingles con contexto conversacional: adecuado para prototipos de asistentes y pipelines de generacion donde el ingles es el idioma de trabajo y se prioriza la eficiencia MoE.
- Procesamiento multimodal en local: con los ficheros `mmproj` puede emplearse para tareas de descripcion de imagenes y preguntas visuales en entornos sin conectividad, siempre que el runtime soporte el proyector multimodal.
- Banco de pruebas para comparativas de cuantizacion: el repositorio ofrece un espectro amplio (Q2_K a Q8_0) que permite medir la degradacion de perplexity y calidad por nivel de cuantizacion en un MoE de este tamano.
- Fine-tuning y experimentos de destilacion: el modelo base en safetensors sirve como punto de partida para ajustes supervisados en ingles, con la salvedad de las restricciones de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K 10,7 GB; Q3_K_S 12,3 GB; Q3_K_M 13,4 GB; Q3_K_L 13,9 GB; IQ4_XS 14,2 GB; Q4_K_S 15,6 GB; Q4_K_M 16,9 GB; Q5_K_S 18,1 GB; Q5_K_M 19,2 GB; Q6_K 22,7 GB; Q8_0 27,0 GB.
- Sumar aproximadamente 0,9 GB (mmproj Q8_0) o 1,3 GB (mmproj f16) si se usa la parte multimodal, mas el espacio de cache KV segun contexto.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 (24 GB) para los mismos niveles; A100 40 GB y H100 80 GB para Q6_K y Q8_0 con contexto largo; GPUs de 16 GB (RTX 4060 Ti, RTX 4070 Ti Super) limitadas a Q3_K o IQ4_XS con contexto reducido.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB para cuantizaciones Q4 y Q5; en 16 GB para Q3 y IQ4_XS con contexto moderado; en 12 GB solo con Q2_K y margen escaso.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, text-generation-webui, KoboldCpp; vLLM y TGI requeririan el modelo base en safetensors, no las cuantizaciones GGUF.
- Latencia y throughput estimados: no disponibles; la arquitectura MoE con aproximadamente 4B activos sugiere un coste por token mas cercano a un modelo denso de 4B que a uno de 25B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mradermacher/gemma-4-26B-A4B-it-heretic-ara-v2-GGUF (este) | 25,2B / ~4B | no disponible | Apache 2.0 declarada, enlace a licencia Gemma 4 | GGUF en HF, 684 descargas | Variante abliterated, multimodal via mmproj |
| trohrbaugh/gemma-4-26B-A4B-it-heretic-ara-v2 (modelo base) | 25,2B / ~4B | no disponible | Apache 2.0 declarada | Safetensors en HF | Version sin cuantizar del mismo modelo |
| Gemma 4 26B-A4B-it original | 25,2B / ~4B | no disponible | Terminos de Gemma 4 de Google | Pesos oficiales de Google | Modelo alineado, con rechazos activos; referencia para comparar efecto de abliteration |
| Gemma 3 27B (denso) | 27B / 27B | 128K (segun documentacion publica de Gemma 3) | Terminos de Gemma | Amplia, muchas cuantizaciones | Alternativa densa con mayor coste por token que un MoE de 4B activos |

La comparativa con modelos de la misma categoria queda limitada por la ausencia de datos de contexto y benchmarks en la informacion disponible; las cifras de Gemma 3 27B proceden de conocimiento general del ecosistema y deben verificarse contra la documentacion oficial.

## Limitaciones y advertencias

- La abliteration elimina rechazos pero no garantiza la ausencia de contenido danino; el modelo puede generar respuestas inseguras, sesgadas o inexactas con mayor frecuencia que el original.
- Riesgo de alucinacion elevado en un modelo de 25B con solo 4B activos y sin benchmarks publicados que permitan calibrar su fiabilidad.
- Idiomas: solo "en" declarado; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea inferior.
- Ambiguedad de licencia: los metadatos declaran Apache 2.0 pero el `license_link` apunta a los terminos de Gemma 4 de Google, que imponen restricciones de uso comercial y de redistribucion; conviene tratar el modelo como sujeto a esos terminos hasta aclaracion.
- La etiqueta "ara" en el nombre no esta documentada; no se puede confirmar que idioma o ajuste adicional representa.
- El repositorio ocupa 184,9 GB; descargar solo el fichero de cuantizacion necesario, no el repo completo.
- Las cuantizaciones Q2_K y Q3_K degradan notablemente la calidad; para uso serio se recomienda Q4_K_M o superior.
- No hay informacion sobre contexto maximo, por lo que no se debe asumir una ventana larga en produccion sin verificar contra el modelo base.
- Uso en produccion orientado a usuarios finales desaconsejado sin un filtro de moderacion externo y sin evaluacion propia de calidad y seguridad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/gemma-4-26B-A4B-it-heretic-ara-v2-GGUF
- Modelo base: https://huggingface.co/trohrbaugh/gemma-4-26B-A4B-it-heretic-ara-v2
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/gemma-4-26B-A4B-it-heretic-ara-v2-i1-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#gemma-4-26B-A4B-it-heretic-ara-v2-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Licencia enlazada: https://ai.google.dev/gemma/docs/gemma_4_license
- Empresa del cuantizador: https://www.nethype.de/
