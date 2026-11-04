# mradermacher/Ornith-1.0-35B-Heretic-MTP-GGUF

## Resumen

Ornith-1.0-35B-Heretic-MTP-GGUF es una cuantizacion en formato GGUF del modelo SC117/Ornith-1.0-35B-Heretic-MTP, publicada por el cuantizador mradermacher. El modelo subyacente es un transformer de tipo Mixture of Experts (MoE) con arquitectura Qwen3.5, 35.505.251.456 parametros totales y capacidades multimodales (incluye un proyector multimodal mmproj). Esta orientado a razonamiento (reasoning) y a codigo agentico (agentic-coding), segun las etiquetas del autor.

La relevancia de esta publicacion es practica: ofrece el modelo original (probablemente en safetensors y con pesos de gran tamano) en una bateria de cuantizaciones GGUF que van desde Q2_K (13,3 GB) hasta Q8_0 (37,9 GB), lo que permite desplegarlo en hardware de consumo mediante llama.cpp u Ollama. Incluye ademas los ficheros mmproj necesarios para conservar la capacidad multimodal.

La licencia es MIT, lo que facilita el uso comercial. El modelo solo declara soporte de ingles. No se dispone de informacion sobre el numero de parametros activos, la longitud de contexto ni los datos de entrenamiento en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), multimodal |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones); el modelo base se distribuye en otro formato no detallado |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas de mezcla de expertos (MoE), identificado por el tag `qwen3_5_moe`, lo que sugiere una variante de la familia Qwen3.5. Los tags `reasoning` y `agentic-coding` indican que ha sido ajustado para tareas de razonamiento multi-paso y generacion de codigo orientada a agentes. El tag `heretic` hace referencia al proceso de "abliteracion" o eliminacion de rechazos (uncensoring) aplicado al modelo, y `mtp` probablemente alude a multi-token prediction. El tag `apex` no tiene documentacion disponible en la informacion proporcionada.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se detalla ninguna innovacion de inferencia (decodificacion especulativa, atencion lineal, etc.) mas alla de las etiquetas mencionadas. La cuantizacion la realiza mradermacher con su pipeline habitual (quantize_version 2, salida con tensor quantised), e incluye ficheros mmproj para preservar el procesamiento multimodal.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento multi-paso (tag `reasoning`).
- Generacion de codigo orientada a agentes (tag `agentic-coding`).
- Capacidades multimodales: el repositorio incluye proyectores mmproj-Q8_0 y mmproj-f16, lo que permite entrada de imagenes si se usa con un runtime compatible con mmproj.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: inferido del tag `agentic-coding`, sin detalles tecnicos.
- Capacidades multilingues: solo se declara ingles.
- Modo thinking explicito: no confirmado.

## Casos de uso

- Asistencia de codigo en local: con la cuantizacion Q4_K_M (21,8 GB) el modelo puede ejecutarse en una GPU de 24 GB o en configuraciones multi-GPU, sirviendo como asistente de programacion con contexto de repositorio.
- Razonamiento sobre documentacion tecnica: el tag `reasoning` lo hace adecuado para tareas de analisis y sintesis de textos largos, aunque la longitud de contexto no esta confirmada.
- Pipelines de agentes de codigo: su orientacion `agentic-coding` permite integrarlo en flujos de edicion autonoma de codigo, siempre que el runtime soporte las llamadas a herramientas correspondientes.
- Procesamiento de imagenes y texto: gracias a los ficheros mmproj, puede usarse para tareas que combinen capturas, diagramas o documentacion escaneada con texto.
- Despliegue en estaciones de trabajo sin GPU de datacenter: las cuantizaciones Q2_K (13,3 GB) y Q3_K_S (15,6 GB) permiten ejecucion en GPUs de consumo de 16 GB o en CPU con llama.cpp.
- Prototipado e investigacion: al ser MIT, es adecuado para experimentacion academica y pruebas de concepto sin restricciones de licencia.
- Fine-tuning ligero sobre GGUF: no recomendado directamente; para ajuste fino conviene partir del modelo base en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q2_K ~13,3 GB; Q3_K_S ~15,6 GB; Q3_K_M ~17,3 GB; Q3_K_L ~18,7 GB; IQ4_XS ~19,5 GB; Q4_K_S ~20,5 GB; Q4_K_M ~21,8 GB; Q5_K_S ~24,7 GB; Q5_K_M ~25,4 GB; Q6_K ~29,3 GB; Q8_0 ~37,9 GB. Añadir ~0,7-1,0 GB si se usa el proyector multimodal.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M o IQ4_XS; A100 40 GB o H100 para Q6_K y Q8_0; configuraciones multi-GPU para Q8_0.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) con cuantizaciones Q4; en GPUs de 16 GB solo con Q2_K o Q3_K_S y margen ajustado.
- Opciones de despliegue: llama.cpp, Ollama, y runtimes compatibles con GGUF (LM Studio, text-generation-webui). Para el modelo base en safetensors, vLLM o TGI si la arquitectura Qwen3.5 MoE esta soportada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ornith-1.0-35B-Heretic-MTP-GGUF | 35,5 B (MoE) | no disponible | MIT | GGUF | Multimodal, razonamiento y codigo agentico |
| Modelo base SC117/Ornith-1.0-35B-Heretic-MTP | 35,5 B (MoE) | no disponible | MIT | safetensors (presumible) | Sin cuantizar, mayor VRAM |
| Alternativas Qwen3.5 MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion |

No se dispone de informacion suficiente para una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado.
- El tag `heretic` implica que se han reducido o eliminado los rechazos del modelo, lo que aumenta el riesgo de generar contenido inapropiado o inseguro sin filtros adicionales.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad.
- La longitud de contexto no esta documentada, lo que dificulta planificar casos de uso con entradas largas.
- El proceso de cuantizacion introduce perdida de calidad, especialmente en Q2_K y Q3; para produccion se recomienda Q5_K_M o superior.
- No hay datos de benchmarks que permitan validar el rendimiento real frente a alternativas.
- Aunque la licencia es MIT, conviene verificar la licencia del modelo base original (enlazada a deepreinforce-ai/Ornith-1.0-35B) antes de uso comercial.
- El repositorio ocupa 244,4 GB, por lo que la descarga completa requiere espacio considerable; conviene descargar solo la cuantizacion necesaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Ornith-1.0-35B-Heretic-MTP-GGUF
- Modelo base: https://huggingface.co/SC117/Ornith-1.0-35B-Heretic-MTP
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Ornith-1.0-35B-Heretic-MTP-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Ornith-1.0-35B-Heretic-MTP-GGUF
- Licencia del modelo base: https://huggingface.co/deepreinforce-ai/Ornith-1.0-35B/blob/main/LICENSE
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
