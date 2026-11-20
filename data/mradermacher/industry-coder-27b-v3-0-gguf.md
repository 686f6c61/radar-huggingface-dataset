# mradermacher/Industry-Coder-27B-v3.0-GGUF

## Resumen

Industry-Coder-27B-v3.0 es un modelo de lenguaje de 27.320.697.856 parametros (aproximadamente 27,3 mil millones) desarrollado por kataguru y distribuido en formato GGUF por mradermacher. Esta especializado en ingenieria de software industrial: automatizacion de PLC, control numerico por computador (CNC), el estandar IEC 61131-3, TwinCAT y SCL de Siemens, ademas de ciberseguridad y codificacion agentica. Los tags del repositorio apuntan a una base derivada de la familia Qwen 3.5/3.8, con soporte multimodal (vision) y capacidades de decodificacion multi-token (MTP).

El modelo se distribuye bajo licencia Apache 2.0 y soporta cinco idiomas: ingles, finlandes, estonio, hungaro y turco. La model card menciona explicitamente caracteristicas como "uncensored" y "anti-sycophancy", orientadas a reducir la adulacion excesiva en las respuestas. El repositorio quantizado ocupa 190,8 GB e incluye un conjunto amplio de cuantizaciones estaticas GGUF, desde Q2_K hasta Q8_0, ademas de un proyector multimodal en Q8_0 y f16.

La relevancia actual del modelo radica en su nicho: la generacion de codigo para entornos de automatizacion industrial, un dominio donde los modelos generalistas suelen fallar por falta de conocimiento especifico sobre lenguajes como SCL o sobre las convenciones de IEC 61131-3. Con 1267 descargas y creado en noviembre de 2026, es un modelo reciente y de adopcion moderada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen 3.5/3.8, segun tags); soporte de MTP |
| Parametros totales | 27.320.697.856 (27,3 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16; bf16/bfloat16 en el modelo base |
| Idiomas soportados | en, fi, et, hu, tr |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors/bf16 en el modelo base |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de los tags del repositorio, que indican una base de la familia Qwen 3.5/3.8 con soporte multimodal (vision) y decodificacion multi-token (MTP). El tag "mtp" sugiere el uso de prediccion multi-token, una tecnica de decodificacion especulativa que permite generar varios tokens por paso y aumentar el throughput. El tag "vllm" indica compatibilidad con el motor de inferencia vLLM.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento. Los tags "uncensored" y "anti-sycophancy" sugieren un ajuste orientado a reducir rechazos y respuestas aduladoras, pero no se documenta el metodo. El modelo base es kataguru/Industry-Coder-27B-v3.0, y este repositorio contiene unicamente las cuantizaciones estaticas generadas por mradermacher.

## Capacidades

- Generacion de codigo especializado en automatizacion industrial: PLC, CNC, IEC 61131-3, TwinCAT y SCL de Siemens.
- Razonamiento y codificacion agentica (agentic-coding) para tareas multi-paso.
- Capacidades multimodales de vision, con proyector mmproj incluido en el repositorio.
- Ciberseguridad: el tag "cybersecurity" indica orientacion a tareas de analisis y codigo seguro.
- Soporte multilingue en ingles, finlandes, estonio, hungaro y turco.
- Comportamiento "anti-sycophancy": disenado para evitar respuestas aduladoras o complacientes.
- Modo "uncensored": menor tendencia a rechazar peticiones.
- Compatibilidad con vLLM y con el ecosistema GGUF (llama.cpp).
- Decodificacion multi-token (MTP) para acelerar la generacion.

## Casos de uso

- Generacion de logica de PLC en IEC 61131-3: el modelo puede producir bloques de codigo en lenguajes del estandar (SCL, ST) para automatizacion de procesos, aprovechando su entrenamiento especifico en este dominio.
- Programacion de CNC: generacion y revision de programas de control numerico para maquinas herramienta, un nicho donde los modelos generalistas carecen de cobertura.
- Integracion en TwinCAT y Siemens SCL: asistencia en la escritura de modulos SCL para proyectos de automatizacion Siemens, con conocimiento de las convenciones del ecosistema.
- Revision de ciberseguridad en codigo industrial: analisis de codigo de automatizacion en busca de practicas inseguras, apoyandose en el tag de ciberseguridad del modelo.
- Codificacion agentica multi-paso: uso como motor de agentes que planifican y ejecutan tareas de ingenieria de software con tool calling, gracias a la orientacion "agentic-coding".
- Asistencia multilingue en equipos nordicos y de Europa del Este: soporte de finlandes, estonio, hungaro y turco para documentacion tecnica y comentarios de codigo.
- Analisis de documentacion tecnica con vision: el proyector multimodal permite procesar imagenes de esquemas, diagramas de cableado o capturas de entornos de programacion industrial.
- Despliegue local en estaciones de ingenieria: las cuantizaciones Q4_K_M (16,9 GB) permiten ejecutar el modelo en GPUs de consumo para asistencia offline en entornos industriales sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (pesos del modelo, sin contar KV cache):
  - Q2_K: ~11,0 GB
  - Q3_K_M: ~13,6 GB
  - IQ4_XS: ~15,5 GB
  - Q4_K_S: ~15,9 GB
  - Q4_K_M: ~16,9 GB
  - Q5_K_M: ~19,6 GB
  - Q6_K: ~22,5 GB
  - Q8_0: ~29,1 GB
  - Proyector multimodal: ~0,7 GB (Q8_0) o ~1,0 GB (f16)
- GPU recomendadas: para Q8_0 se requiere una GPU con 32 GB o mas (A100 40 GB, H100, RTX A6000). Para Q4_K_M caben GPUs de 24 GB como la RTX 4090 o la RTX 3090.
- Cabe en GPU de consumo: si, en modelos con 24 GB de VRAM usando cuantizaciones Q4 o inferiores; en GPUs de 16 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama y otros motores compatibles con GGUF; vLLM segun el tag del repositorio (para el modelo base en bf16). El modelo base en bf16 requiere aproximadamente 55 GB de VRAM.
- Latencia y throughput: no disponible. El tag MTP sugiere mejoras de throughput mediante decodificacion multi-token, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Industry-Coder-27B-v3.0 | 27,3 B | no disponible | Apache 2.0 | Codigo industrial (PLC, CNC, SCL) | GGUF y bf16 en HF |
| Qwen2.5-Coder-32B | 32,5 B | 128 K (segun version) | Apache 2.0 | Codigo generalista | Multiples formatos en HF |
| DeepSeek-Coder-V2-Lite | 16 B (2,4 B activos, MoE) | 128 K | DeepSeek License | Codigo generalista | Multiples formatos en HF |
| Codestral-22B | 22 B | 32 K | MNPL (no comercial) | Codigo generalista | Pesos en HF |

La comparativa se basa en caracteristicas publicas de modelos de tamano y proposito similares; no se dispone de datos de rendimiento comparativo para Industry-Coder-27B-v3.0. Su diferenciador principal es la especializacion en automatizacion industrial y su licencia Apache 2.0 permisiva, frente a la licencia no comercial de Codestral.

## Limitaciones y advertencias

- No se han publicado datos de benchmarks, por lo que el rendimiento real en tareas estandar (HumanEval, MMLU, GSM8K) es desconocido.
- El tag "uncensored" implica que el modelo puede generar contenido que otros modelos rechazarian; requiere supervision en produccion.
- Riesgo de alucinacion en codigo industrial: la generacion de logica de PLC o SCL incorrecta puede tener consecuencias fisicas en entornos de automatizacion; es imprescindible revision humana.
- Cobertura idiomatica limitada a cinco idiomas (en, fi, et, hu, tr); el espanol no esta entre los idiomas declarados.
- Longitud de contexto no documentada, lo que dificulta planificar su uso en tareas que requieran ventanas largas.
- El repositorio contiene solo cuantizaciones GGUF; para uso con vLLM en precision completa hay que acudir al modelo base.
- La model card del repositorio quantizado es generica (plantilla de mradermacher) y no aporta informacion sobre el entrenamiento o la evaluacion del modelo original.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base kataguru/Industry-Coder-27B-v3.0 por si hubiera restricciones adicionales no reflejadas en este repositorio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Industry-Coder-27B-v3.0-GGUF
- Modelo base: https://huggingface.co/kataguru/Industry-Coder-27B-v3.0
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Industry-Coder-27B-v3.0-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Industry-Coder-27B-v3.0-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
