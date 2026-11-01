# mradermacher/Industry-Coder-27B-v2.0-GGUF

## Resumen

Industry-Coder-27B-v2.0 es un modelo de lenguaje de 27.320.697.856 parametros (aproximadamente 27,3 mil millones) desarrollado por kataguru y especializado en ingenieria de software industrial. Cubre dominios como PLC, CNC, el estandar IEC 61131-3, TwinCAT y Siemens SCL, ademas de ciberseguridad y codificacion agentica. La version aqui descrita es la cuantizacion GGUF publicada por mradermacher, que permite ejecutar el modelo en entornos con recursos limitados mediante llama.cpp y herramientas compatibles.

El modelo parte de una arquitectura transformer densa (no MoE) con capacidades multimodales de vision, segun los tags de la model card (multimodal, vision, mtp). Soporta cinco idiomas: finlandes, ingles, estonio, hungaro y turco, con especial enfasis en finlandes. Incorpora tecnicas de codificacion agentica y un modo "uncensored" con anti-sycophancy, orientado a respuestas tecnicas sin sesgo de complacencia.

Su relevancia actual radica en la escasez de modelos abiertos especializados en automatizacion industrial y programacion de controladores, un nicho tradicionalmente dominado por soluciones propietarias. La licencia Apache 2.0 facilita su adopcion comercial, y la disponibilidad de cuantizaciones GGUF desde 11 GB (Q2_K) hasta 29,1 GB (Q8_0) amplia el rango de hardware compatible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con soporte multimodal (vision) y MTP |
| Parametros totales | 27.320.697.856 (aprox. 27,3 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | Finlandes (fi), ingles (en), estonio (et), hungaro (hu), turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors/bf16 |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo base es un transformer denso con capacidades multimodales (vision) y soporte de MTP (multi-token prediction), segun los tags de la model card. Los tags tambien mencionan "qwen3.8" y "qwen3_5", lo que sugiere una posible base derivada de la familia Qwen, aunque no se confirma explicitamente en la informacion proporcionada. El modelo base se distribuye en bf16 y es compatible con vLLM.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otros metodos de alineacion. La model card menciona caracteristicas de "anti-sycophancy" y "uncensored", lo que implica un proceso de ajuste orientado a reducir la complacencia en las respuestas, pero no se detalla la metodologia. Tampoco se especifica la innovacion tecnica concreta del MTP ni los detalles del entrenamiento multimodal.

## Capacidades

- Generacion de texto y codigo especializado en ingenieria industrial: PLC, CNC, IEC 61131-3, TwinCAT y Siemens SCL.
- Razonamiento y codificacion agentica (agentic-coding) para tareas multi-paso.
- Capacidades multimodales de vision (segun tags y ficheros mmproj incluidos).
- Soporte multilingue en finlandes, ingles, estonio, hungaro y turco.
- Modo "uncensored" con anti-sycophancy: respuestas tecnicas sin complacencia excesiva.
- Ciberseguridad como dominio cubierto segun los tags.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Modo thinking: no confirmado en la informacion disponible.
- Capacidades de audio: no disponibles.

## Casos de uso

- Programacion de PLC y automatizacion industrial: el modelo puede generar y revisar codigo en IEC 61131-3, Siemens SCL y TwinCAT, adecuado para ingenieros que trabajan con controladores industriales y necesitan asistencia en lenguajes de programacion de nicho.
- Generacion de codigo G-code para CNC: util para traducir especificaciones de mecanizado en instrucciones de control numerico, reduciendo el tiempo de programacion manual.
- Auditoria de ciberseguridad en entornos OT: el modelo cubre el dominio de ciberseguridad y puede asistir en la revision de configuraciones y codigo de sistemas de control industrial.
- Asistencia agentica en pipelines de desarrollo: con soporte de codificacion agentica, puede integrarse en flujos multi-paso para refactorizacion, generacion de tests y revision de codigo en proyectos de software industrial.
- Atencion tecnica multilingue en el norte de Europa: al soportar finlandes, estonio, hungaro y turco, es adecuado para soporte a desarrolladores en esos idiomas, con especial solidez en finlandes.
- Analisis de documentacion tecnica con vision: gracias a sus capacidades multimodales, puede procesar diagramas, esquemas electricos o capturas de entornos de desarrollo para asistir en la interpretacion de documentacion industrial.
- Despliegue en entornos con hardware limitado: las cuantizaciones GGUF desde 11 GB permiten ejecutar el modelo en estaciones de trabajo con GPU de consumo, facilitando su uso en plantas o entornos sin infraestructura de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion:
  - Q2_K: 11,0 GB
  - Q3_K_S: 12,4 GB
  - Q3_K_M: 13,6 GB
  - Q3_K_L: 14,7 GB
  - IQ4_XS: 15,5 GB
  - Q4_K_S: 15,9 GB
  - Q4_K_M: 16,9 GB
  - Q5_K_S: 19,1 GB
  - Q5_K_M: 19,6 GB
  - Q6_K: 22,5 GB
  - Q8_0: 29,1 GB
  - Complemento multimodal: mmproj-Q8_0 (0,7 GB) o mmproj-f16 (1,0 GB)
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano, las cuantizaciones Q4_K_M (16,9 GB) y Q5_K_M (19,6 GB) encajan en GPU de consumo con 24 GB de VRAM (RTX 3090, RTX 4090). Las cuantizaciones Q8_0 (29,1 GB) requieren GPU profesionales como A100 o H100, o bien configuraciones multi-GPU.
- Cabe en GPU de consumo: si, en cuantizaciones Q4 y Q5 en GPU de 24 GB; Q2_K y Q3 en GPU de 12-16 GB.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), Ollama (compatible con GGUF), vLLM (el modelo base es compatible segun tags), y otras herramientas compatibles con GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables directos en el nicho de codificacion industrial (PLC, CNC, IEC 61131-3) dentro de la informacion proporcionada. Como referencia generica de tamano similar, se podria comparar con modelos densos de ~27B, pero no se dispone de datos de rendimiento de este modelo para establecer una comparacion rigurosa.

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| Industry-Coder-27B-v2.0 | 27,3 B | No disponible | Apache 2.0 | Codigo industrial (PLC, CNC, IEC 61131-3) |
| Alternativas de ~27B | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No se han publicado datos de benchmarks, por lo que el rendimiento real en tareas estandar (MMLU, HumanEval, GSM8K) es desconocido.
- La longitud de contexto no esta especificada; no se puede garantizar el manejo de conversaciones o documentos largos.
- El soporte idiomatico se limita a finlandes, ingles, estonio, hungaro y turco; el castellano no figura entre los idiomas soportados, lo que puede degradar la calidad en ese idioma.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en dominios tecnicos regulados como la programacion de PLC o la ciberseguridad industrial, donde un error puede tener consecuencias fisicas o de seguridad.
- El modo "uncensored" puede producir respuestas sin los filtros habituales, lo que requiere supervision en entornos de produccion.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la procedencia del modelo base y posibles restricciones adicionales del autor original.
- La cuantizacion GGUF introduce perdida de calidad respecto al modelo en bf16; las cuantizaciones Q2_K y Q3_K pueden degradar notablemente el rendimiento en tareas de codigo.
- No se confirma el soporte de tool calling ni de modo thinking, lo que limita su uso en pipelines agenticos que dependan de estas capacidades.
- El modelo tiene 0 likes y 472 descargas en el momento de la ficha, lo que indica una adopcion temprana y poca validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Industry-Coder-27B-v2.0-GGUF
- Modelo base: https://huggingface.co/kataguru/Industry-Coder-27B-v2.0
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Industry-Coder-27B-v2.0-i1-GGUF
- Pagina de resumen del modelo: https://hf.tst.eu/model#Industry-Coder-27B-v2.0-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
