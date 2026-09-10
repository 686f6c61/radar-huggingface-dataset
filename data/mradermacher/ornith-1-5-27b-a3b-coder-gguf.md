# mradermacher/Ornith-1.5-27B-A3B-Coder-GGUF

## Resumen

Ornith-1.5-27B-A3B-Coder-GGUF es la version cuantizada en formato GGUF del modelo ManniX-ITA/Ornith-1.5-27B-A3B-Coder, publicada por el usuario mradermacher. Se trata de un modelo de lenguaje de arquitectura Mixture of Experts (MoE) orientado a generacion de codigo y uso conversacional, con aproximadamente 26,2 mil millones de parametros totales y alrededor de 3 mil millones de parametros activos por token, segun indica la nomenclatura A3B del nombre.

El modelo base incorpora tecnicas de poda de expertos (expert pruning, con la etiqueta reap asociada a router-weighted expert activation pruning) y multi-token prediction (MTP), y forma parte del ecosistema de fusion de modelos OmnimergeKit. El repositorio que nos ocupa no contiene el entrenamiento original, sino exclusivamente pesos GGUF pre-cuantizados para inferencia local eficiente con llama.cpp y derivados.

Su relevancia practica radica en que permite ejecutar un MoE de ~26 B en hardware de consumo gracias a que solo se activa una fraccion de los parametros en cada paso, y a la disponibilidad de cuantizaciones de 10 GB, 15,2 GB y 28 GB. El modelo esta licenciado bajo Apache 2.0 y declara soporte unicamente para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con poda de expertos (REAP) y multi-token prediction (MTP) |
| Parametros totales | 26.213.016.704 (~26,2 B) segun safetensors del modelo base; el nombre comercial indica 27B |
| Parametros activos | ~3 B (deducido de la nomenclatura A3B; cifra exacta no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q4_K_S, Q8_0 (y suplementos multimodales mmproj-Q8_0 y mmproj-f16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en formato HuggingFace/safetensors |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-27B-A3B-Coder es una arquitectura transformer con capas Mixture of Experts, es decir, un router selecciona un subconjunto de expertos por token, de modo que solo se activan aproximadamente 3 mil millones de parametros de los ~26,2 B totales en cada paso de inferencia. Las etiquetas de la model card indican tecnicas de poda de expertos (expert-pruning / reap) y multi-token prediction (mtp), lo que sugiere que el modelo se construyo recortando expertos poco utilizados de un MoE mayor y entrenando la prediccion de multiples tokens futuros. Tambien aparece la etiqueta omnimergekit, asociada a la fusion de modelos. No se dispone de la composicion exacta del dataset, el numero de tokens de entrenamiento, ni si se aplicaron fases de RLHF o DPO.

Es importante subrayar que este repositorio no documenta el entrenamiento, sino la cuantizacion. mradermacher aplica cuantizaciones estaticas (version 2, con output_tensor_quantised) sobre el modelo base, sin publicar imatrix en el momento de crear la ficha. La model card menciona un conjunto mas amplio de cuantizaciones previstas (x-f16, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS), pero la tabla de archivos proporcionados unicamente lista Q2_K, Q4_K_S y Q8_0, ademas de los dos ficheros mmproj.

## Capacidades

- Generacion de codigo: el modelo esta explicitamente orientado a tareas de programacion (etiqueta code), incluyendo generacion, completado y transformacion de codigo.
- Uso conversacional: la etiqueta conversational y el flag endpoints_compatible indican que esta preparado para dialogos multi-turno en formato chat.
- Razonamiento sobre codigo: al ser un modelo coder, cabe esperar soporte para explicacion de fragmentos, refactorizacion y depuracion, aunque no se detallan capacidades concretas en la informacion disponible.
- Capacidad multimodal (indicada): la presencia de ficheros mmproj-Q8_0 y mmproj-f16 (proyector multimodal) sugiere soporte de entrada de imagen, si bien la model card no documenta el alcance ni el formato de dicha capacidad.
- Multi-token prediction: tecnicamente permite decodificacion mas rapida al predecir varios tokens por paso, aunque su exposicion en la API depende del runtime.
- Idiomas: solo ingles declarado.
- Tool calling / function calling y soporte de agentes: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de programacion en editor: el modelo puede usarse como backend de autocompletado y generacion de funciones dentro de entornos tipo VS Code o JetBrains mediante runtimes GGUF, aprovechando su especializacion en codigo.
- Revision de codigo automatizada: integrado en un pipeline de CI/CD, puede analizar diffs y proponer correcciones o comentarios, ejecutandose en local gracias a que solo activa ~3 B de parametros por token.
- Generacion de tests unitarios: dado un modulo, el modelo puede producir casos de prueba; su naturaleza coder favorece este tipo de tarea repetitiva.
- Chat tecnico de documentacion: con la etiqueta conversational y el flag endpoints_compatible, puede servir como asistente de preguntas y respuestas sobre APIs y librerias en ingles.
- Despliegue en portatiles y equipos sin GPU dedicada: la cuantizacion Q4_K_S (15,2 GB) o Q2_K (10 GB) permite inferencia en CPU con llama.cpp usando RAM del sistema, con velocidad moderada.
- Prototipado rapido en Ollama o LM Studio: al ser GGUF, se puede cargar directamente en estas herramientas para probar el modelo sin infraestructura adicional.
- Analisis de capturas de codigo (condicionado): si la capacidad multimodal se confirma en el runtime, podria extraerse codigo de imagenes; este uso no esta documentado en la model card y debe verificarse.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada (segun los tamanos de fichero publicados):
  - Q2_K: ~10,0 GB, mas overhead de contexto y KV cache.
  - Q4_K_S: ~15,2 GB, recomendado por el autor como equilibrio velocidad/calidad.
  - Q8_0: ~28,0 GB, mayor calidad.
  - Suplemento multimodal: ~0,7 GB (mmproj-Q8_0) o ~1,0 GB (mmproj-f16) adicionales.
- GPU recomendadas:
  - Q2_K: GPU de 12 GB (RTX 3060 12GB, RTX 4070) con margen ajustado.
  - Q4_K_S: GPU de 16 GB (RTX 4060 Ti 16GB, RTX 4080) o 24 GB (RTX 3090/4090).
  - Q8_0: GPU de 32 GB (RTX 5090) o 40/80 GB (A100, H100).
- Cabe en GPU de consumo: si, en el rango Q2_K y Q4_K_S; tambien puede ejecutarse en CPU con suficiente RAM, dado que solo se activan ~3 B de parametros por token.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan y otros runtimes compatibles con GGUF. El flag endpoints_compatible sugiere compatibilidad con servidores de endpoint estilo OpenAI. Para el modelo base en formato HuggingFace serian aplicables vLLM, TGI o SGLang, pero este repositorio concreto es GGUF.
- Latencia y throughput: no disponibles. Al ser MoE con ~3 B activos, el throughput por token deberia ser mas alto que el de un modelo denso de 26 B, pero no se aportan cifras.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento del modelo, por lo que la comparacion se limita a caracteristicas estructurales. Los valores de los modelos alternativos proceden de su conocimiento publico general y deben verificarse en sus repositorios oficiales.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.5-27B-A3B-Coder (GGUF) | ~26,2 B | ~3 B (segun nombre) | no disponible | Apache 2.0 | GGUF |
| Qwen3-30B-A3B | ~30,5 B | ~3,3 B | ampliable a 128K | Apache 2.0 | safetensors, GGUF |
| DeepSeek-Coder-V2-Lite | ~15,7 B | ~2,4 B | 128K | licencia propia DeepSeek | safetensors, GGUF |
| Modelo denso coder de ~30 B (p. ej. familia CodeLlama 34B) | ~34 B | 34 B (denso) | no disponible aqui | licencia propia | safetensors, GGUF |

Nota: no se dispone de datos de benchmarks que permitan comparar calidad de codigo entre estas opciones.

## Limitaciones y advertencias

- Solo declara soporte de ingles; su rendimiento en castellano u otros idiomas no esta documentado.
- No se publican resultados de benchmarks, por lo que la calidad real en tareas de codigo no puede verificarse con la informacion disponible.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; al no haber documentacion de alineamiento (RLHF/DPO), no puede estimarse su magnitud.
- Sesgos conocidos: no disponibles.
- Longitud de contexto: no documentada, lo que complica planificar tareas de contexto largo.
- La cuantizacion Q2_K (10 GB) degrada la calidad de forma notable respecto a Q4_K_S o Q8_0; en tareas de codigo conviene usar como minimo Q4_K_S.
- Es una cuantizacion de terceros: no es el modelo oficial del autor original, por lo que posibles incidencias deben contrastarse con el modelo base ManniX-ITA/Ornith-1.5-27B-A3B-Coder.
- El flag y los ficheros mmproj sugieren multimodalidad, pero no hay documentacion que confirme el alcance ni el runtime necesario.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar que el modelo base y los materiales derivados mantienen esa misma licencia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay validacion de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Ornith-1.5-27B-A3B-Coder-GGUF
- Modelo base: https://huggingface.co/ManniX-ITA/Ornith-1.5-27B-A3B-Coder
- Pagina de vision general del autor: https://hf.tst.eu/model#Ornith-1.5-27B-A3B-Coder-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
