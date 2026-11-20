# mradermacher/Fikra-Model-1-2B-GGUF

## Resumen

Fikra-Model-1-2B es un modelo de lenguaje de tipo transformer desarrollado por Zabibu Technika, distribuido en formato GGUF por el usuario mradermacher. A pesar de la denominacion "2B" en el nombre, los pesos en safetensors suman 4.647.450.147 parametros (aproximadamente 4,65 mil millones), lo que lo situa en la categoria de modelos compactos pero no minimalistas. Esta etiquetado con los descriptores `gemma4`, `reasoning`, `thinking` y `agentic`, lo que sugiere una arquitectura derivada de la familia Gemma y un entrenamiento orientado a razonamiento explicito y uso como agente.

El modelo esta disenado para generacion de texto conversacional con soporte de razonamiento paso a paso ("thinking mode") y capacidades agenticas, incluyendo tool calling. Su cobertura linguistica declarada se limita al ingles (en) y al suajili (sw), lo que lo hace especialmente relevante para aplicaciones en Africa Oriental y para investigacion en modelos multilingues de bajo recursos. La licencia es propietaria (`zabibu-technika-license`), no estandar, lo que exige revision legal antes de cualquier uso comercial.

La relevancia actual de esta ficha radica en que mradermacher ha publicado el conjunto completo de cuantizaciones GGUF estaticas (desde Q2_K hasta f16, mas los suplementos multimodales mmproj), lo que permite ejecutar el modelo en hardware de consumo. Sin embargo, la model card original no aporta datos sobre contexto, datos de entrenamiento ni benchmarks, por lo que muchas especificaciones quedan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiquetado `gemma4`; detalles no disponibles) |
| Parametros totales | 4.647.450.147 (segun safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ademas mmproj-Q8_0 y mmproj-f16 (suplementos multimodales) |
| Idiomas soportados | en (ingles), sw (suajili) |
| Licencia | zabibu-technika-license (propietaria, "other") |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la etiqueta `gemma4` y la libreria `transformers`. El recuento real de parametros (4,65B) contradice el "2B" del nombre, lo que puede deberse a que el nombre comercial se refiera a una variante o a un error de nomenclatura; conviene verificar los pesos antes de planificar el despliegue. Los tags `reasoning`, `thinking` y `agentic` indican que el modelo fue ajustado para producir cadenas de razonamiento y para operar en flujos de agente con llamadas a herramientas.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. La presencia de archivos `mmproj` en el repo GGUF sugiere soporte multimodal (probablemente vision), pero la model card no lo confirma ni describe el codificador visual.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y suajili.
- Razonamiento explicito con modo "thinking" (cadenas de pensamiento antes de la respuesta final).
- Capacidades agenticas: el tag `agentic` indica soporte previsto para planificacion y ejecucion de tareas multi-paso.
- Soporte de tool calling / function calling (inferido del tag `agentic`; no documentado en detalle).
- Posible soporte multimodal gracias a los archivos `mmproj` incluidos en el repo GGUF (no confirmado en la model card).
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que facilita su despliegue en infraestructuras tipo Hugging Face Inference Endpoints.
- No se documentan capacidades especificas de codigo, matematicas avanzadas ni audio.

## Casos de uso

- Atencion al cliente en suajili e ingles: el modelo puede gestionar conversaciones multi-turno en ambos idiomas, adecuado para mercados de Africa Oriental donde el suajili es lengua franca. La ventana de contexto no esta documentada, por lo que conviene validar el limite real antes de desplegar.
- Asistentes agenticos con tool calling: gracias al entrenamiento orientado a agentes, puede integrarse en flujos que requieran invocar APIs o funciones externas, con la salvedad de que el soporte exacto de function calling debe verificarse empiricamente.
- Razonamiento asistido en educacion: el modo "thinking" permite mostrar el razonamiento paso a paso, util para tutoria en ingles y suajili.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M (3,5 GB) y Q4_K_S permiten ejecutar el modelo en GPUs de gama media o incluso en CPU con llama.cpp, lo que facilita prototipado local y aplicaciones offline.
- Investigacion en modelos de bajo recursos: al cubrir suajili, sirve como base para estudios de multilingueidad y evaluacion de modelos pequenos en lenguas africanas.
- Procesamiento de documentos con componente visual: si se confirma el soporte multimodal via mmproj, podria usarse para descripcion de imagenes o extraccion de informacion en capturas, aunque esta capacidad no esta documentada.
- Chatbot embebido en aplicaciones moviles o edge: el tamano de las cuantizaciones bajas (Q2_K, 3,1 GB) permite integraciones en entornos con memoria limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - f16: ~9,4 GB
  - Q8_0: ~5,1 GB
  - Q6_K: ~3,9 GB
  - Q5_K_M / Q5_K_S: ~3,7 GB
  - Q4_K_M / Q4_K_S: ~3,5 GB
  - IQ4_XS: ~3,4 GB
  - Q3_K_L / Q3_K_M / Q3_K_S: ~3,3-3,4 GB
  - Q2_K: ~3,1 GB
- GPU recomendadas: A100 o H100 para f16 y despliegue de alta concurrencia; RTX 4090 (24 GB) para f16 con contexto amplio; RTX 3090/4080 (16-24 GB) para Q8_0 y Q6_K; RTX 4060 Ti (16 GB) o RTX 3060 (12 GB) para Q4_K_M y Q5_K_M.
- Cabe en GPU de consumo: si, en practicamente todas las cuantizaciones Q4 y superiores; Q2_K y Q3 caben incluso en GPUs de 6-8 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference (tag TGI), vLLM (requiere conversion o soporte GGUF), Hugging Face Inference Endpoints (tag `endpoints_compatible`).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Fikra-Model-1-2B | 4,65B | no disponible | en, sw | zabibu-technika-license (propietaria) | GGUF, safetensors |
| Gemma 2 2B (Google) | 2,6B | 8K | multilingue (amplio) | Gemma Terms | safetensors, GGUF |
| Qwen2.5 3B (Alibaba) | 3,1B | 32K | multilingue (amplio) | Apache 2.0 | safetensors, GGUF |
| Llama 3.2 3B (Meta) | 3,2B | 128K | multilingue (8 idiomas) | Llama 3.2 Community License | safetensors, GGUF |

La comparativa es orientativa: Fikra destaca por su cobertura de suajili, ausente en la mayoria de modelos de su tamano, pero carece de datos publicos de contexto y benchmarks que permitan una comparacion rigurosa. Su licencia propietaria es una desventaja frente a Apache 2.0 de Qwen.

## Limitaciones y advertencias

- La licencia `zabibu-technika-license` es propietaria y no estandar; es imprescindible revisar sus terminos antes de cualquier uso comercial o redistribucion.
- No se documentan sesgos conocidos, pero al entrenarse principalmente en ingles y suajili, el rendimiento en otros idiomas sera previsiblemente pobre.
- Riesgo de alucinacion inherente a modelos de este tamano; el modo "thinking" no garantiza correccion factual.
- La longitud de contexto no esta publicada, lo que impide planificar aplicaciones con documentos largos sin validacion empirica.
- El recuento real de parametros (4,65B) no coincide con el "2B" del nombre; verificar pesos y requisitos de memoria antes del despliegue.
- El soporte multimodal (mmproj) y el tool calling no estan documentados en la model card; deben validarse en pruebas propias.
- No hay benchmarks publicados, por lo que la calidad real frente a alternativas es desconocida.
- El repo GGUF lo mantiene un tercero (mradermacher), no el autor original; para produccion conviene contrastar con el modelo base `zabibutechnika/Fikra-Model-1-2B`.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Fikra-Model-1-2B-GGUF
- Modelo base: https://huggingface.co/zabibutechnika/Fikra-Model-1-2B
- Cuantizaciones imatrix/weighted: https://huggingface.co/mradermacher/Fikra-Model-1-2B-i1-GGUF
- Pagina de descargas del autor de cuantizaciones: https://hf.tst.eu/model#Fikra-Model-1-2B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
