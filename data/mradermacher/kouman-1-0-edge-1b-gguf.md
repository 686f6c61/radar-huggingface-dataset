# mradermacher/kouman-1.0-edge-1B-GGUF

## Resumen

kouman-1.0-edge-1B es un modelo de lenguaje conversacional de aproximadamente 1.235 millones de parametros, desarrollado por Tree-AI-lab y publicado originalmente en Hugging Face. La version aqui descrita es una cuantizacion estatica en formato GGUF realizada por mradermacher, pensada para su uso con llama.cpp y otros runners compatibles. El modelo esta etiquetado como "edge-ai" y "mobile", lo que indica que su objetivo es el despliegue en dispositivos con recursos limitados, y esta especializado en lenguas de Costa de Marfil: baoule (bci) y dioula (dyu), ademas de frances e ingles.

La relevancia de este modelo radica en su enfoque en idiomas de bajos recursos, un nicho habitualmente desatendido por los grandes laboratorios. Al estar disponible en cuantizaciones que van desde 0,7 GB (Q2_K) hasta 2,6 GB (f16), puede ejecutarse en telefonos moviles, Raspberry Pi y equipos sin GPU dedicada, lo que lo hace adecuado para escenarios de conectividad intermitente o privacidad estricta.

La licencia declarada es llama3.2, lo que sugiere que el modelo base deriva de la familia Llama 3.2 de Meta y hereda sus terminos de uso. No se dispone de informacion publica sobre arquitectura interna, contexto maximo ni datos de entrenamiento en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de la familia Llama 3.2 segun licencia) |
| Parametros totales | 1.235.814.432 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (estaticas); variantes i1 (imatrix) en repo separado |
| Idiomas soportados | bci (baoule), dyu (dioula), fr (frances), en (ingles) |
| Licencia | llama3.2 |
| Formato de pesos | GGUF (cuantizaciones); modelo base en safetensors |

## Arquitectura y entrenamiento

No se ha publicado informacion detallada sobre la arquitectura interna en la model card disponible. La licencia llama3.2 y el tamano de 1.235 millones de parametros son compatibles con una variante de la familia Llama 3.2 de 1B, pero no se confirma explicitamente en la documentacion proporcionada. Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado.

La innovacion destacable de esta publicacion no reside en el entrenamiento, sino en el proceso de cuantizacion realizado por mradermacher: se ofrecen cuantizaciones estaticas (Q2_K a Q8_0 y f16) y, en un repositorio separado, cuantizaciones ponderadas con imatrix (i1), que suelen preservar mejor la calidad en tamanos reducidos. El repo incluye metadatos que indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que confirma una conversion desde pesos Hugging Face a GGUF.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational` del repositorio.
- Soporte de los idiomas baoule (bci) y dioula (dyu), ademas de frances e ingles.
- Orientado a despliegue en dispositivos edge y moviles por su reducido tamano.
- Compatible con llama.cpp y, por extension, con runners que consumen GGUF (Ollama, LM Studio, entre otros).
- Etiqueta `endpoints_compatible`, lo que sugiere compatibilidad con endpoints de inferencia estandar.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Asistentes conversacionales offline en zonas con conectividad limitada: el modelo, en cuantizacion Q4_K_M (0,9 GB), cabe en un telefono de gama media y puede atender consultas en baoule o dioula sin conexion a internet.
- Traduccion y mediacion linguistica frances-baoule/dioula: util para servicios publicos, ONG y programas de alfabetizacion en Costa de Marfil, donde estas lenguas tienen escasa cobertura en modelos comerciales.
- Educacion y tutoria local: despliegue en Raspberry Pi u ordenadores de bajo coste en escuelas rurales para practicar lectura y conversacion en lenguas locales.
- Atencion al ciudadano en kioscos o terminales: integracion en puntos de informacion con hardware modesto para responder preguntas frecuentes en frances y lenguas locales.
- Prototipado rapido de aplicaciones de voz o chat: gracias a su tamano, permite iterar en local con llama.cpp antes de escalar a modelos mayores.
- Investigacion linguistica: generacion de corpus sinteticos o asistencia en anotacion para lenguas de bajos recursos, con la cautela de revisar las salidas por posibles sesgos y alucinaciones.
- Filtrado y clasificacion de texto en entornos con requisitos de privacidad: al ejecutarse en local, los datos no salen del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,7-0,9 GB para cuantizaciones Q2_K a Q4_K_M; 1,0-1,1 GB para Q5 y Q6_K; 1,4 GB para Q8_0; 2,6 GB para f16.
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de VRAM (por ejemplo, GTX 1050 Ti, RTX 3050, RTX 4060). En GPUs profesionales (A100, H100) el modelo esta sobredimensionado para su capacidad y no aprovecha el hardware.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas, incluso en iGPU con memoria unificada.
- Tambien ejecutable en CPU y en dispositivos ARM (Raspberry Pi 4/5, telefonos Android con llama.cpp).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y runners compatibles con GGUF. vLLM y TGI requieren pesos en safetensors o formatos propios, no GGUF directamente.
- Latencia y throughput: no disponibles en la informacion proporcionada; en CPU moderna se espera una generacion de pocos tokens por segundo, y en GPU consumer de decenas, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| kouman-1.0-edge-1B (GGUF) | 1,24 B | no disponible | bci, dyu, fr, en | llama3.2 | GGUF |
| Llama 3.2 1B Instruct | 1,24 B | 128k (segun Meta) | multilingue (8 idiomas oficiales) | llama3.2 | safetensors, GGUF |
| Qwen2.5 1.5B Instruct | 1,54 B | 32k (segun Qwen) | multilingue amplio | Apache 2.0 | safetensors, GGUF |
| Gemma 2 2B | 2,6 B | 8k (segun Google) | multilingue | Gemma Terms | safetensors, GGUF |

La comparativa con Llama 3.2 1B es la mas directa por herencia de licencia y tamano, pero kouman anade cobertura de baoule y dioula que los modelos genericos no ofrecen. Qwen2.5 1.5B y Gemma 2 2B son alternativas con licencias mas permisivas (Apache 2.0 en el caso de Qwen) pero sin soporte declarado de lenguas marfileñas.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad; se recomienda auditar las salidas antes de usos sensibles.
- Riesgo de alucinacion inherente a modelos de 1B, especialmente en tareas de razonamiento o conocimiento factual.
- La cobertura de baoule y dioula puede ser limitada en calidad y vocabulario; no hay benchmarks que la cuantifiquen.
- La licencia llama3.2 impone restricciones de uso comercial y obligaciones de atribucion; es necesario revisar los terminos completos de la licencia Llama 3.2 antes de desplegar en produccion.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) degradan notablemente la coherencia; para produccion se recomienda Q4_K_M o superior.
- El modelo base no documenta longitud de contexto; asumir contextos largos puede provocar degradacion o errores.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria.
- No se documenta soporte de tool calling ni de agentes; no debe asumirse su disponibilidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/kouman-1.0-edge-1B-GGUF
- Modelo base: https://huggingface.co/Tree-AI-lab/kouman-1.0-edge-1B
- Cuantizaciones imatrix (i1): https://huggingface.co/mradermacher/kouman-1.0-edge-1B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#kouman-1.0-edge-1B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
