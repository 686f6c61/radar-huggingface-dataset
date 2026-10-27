# FernandoMarquesVale/Llama-3.2-3B-medassist-ptbr

## Resumen

Llama-3.2-3B-medassist-ptbr es un ajuste fino del modelo meta-llama/Llama-3.2-3B-Instruct desarrollado por FernandoMarquesVale como trabajo académico del Tech Challenge (Fase 3) de la pós-graduação "IA para Devs" de FIAP. No es un modelo médico en el sentido de almacenar conocimiento clínico: es un modelo entrenado para **comportarse** de forma segura dentro de un pipeline RAG sanitario, respondiendo únicamente a partir de los protocolos que se le inyectan en el contexto, citando la fuente con el formato `Fonte: Protocolo Interno HOSP-2024-XXX-000` y rechazando la pregunta cuando el contexto no la cubre.

La arquitectura es la del modelo base: un transformer decoder-only denso de 3.212.749.888 parámetros (3,21 mil millones), ajustado mediante QLoRA con Unsloth sobre una base cuantizada en 4 bits. El entrenamiento usó exclusivamente datos sintéticos de un hospital ficticio: 10 protocolos internos inventados, 76 ejemplos de entrenamiento y 19 de evaluación, generados por un modelo profesor (Llama 3.1 8B) y filtrados en seis etapas, incluida revisión humana.

Su relevancia es metodológica más que de rendimiento: documenta un caso de *retrieval-augmented fine-tuning* con ejemplos negativos y de seguridad, y demuestra que un ajuste fino orientado a citar y rechazar reduce la invención de fuentes y de cifras frente al modelo base, a costa de respuestas más cortas y menos completas. El autor advierte explícitamente que no es apto para uso clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Llama 3.2 3B Instruct; la model card no detalla capas ni cabezas) |
| Parametros totales | 3.212.749.888 (3,21 B) |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | 128.000 tokens según el modelo base (no declarado en la model card); la configuración de referencia en Ollama usa `num_ctx 4096` |
| Tipos de cuantizacion | GGUF `q4_k_m` (exportación publicada); entrenamiento QLoRA con base en 4 bits; otras cuantizaciones no disponible |
| Idiomas soportados | Portugués (pt), declarado en la model card y en las etiquetas del repositorio |
| Licencia | Llama 3.2 Community License (sujeta además a la Acceptable Use Policy de Meta) |
| Formato de pesos | GGUF (`q4_k_m`) y safetensors (el repositorio contiene pesos en safetensors, 2,0 GB) |
| Modelo base | meta-llama/Llama-3.2-3B-Instruct |
| Metodo de ajuste | QLoRA con Unsloth, r=16, alpha=16, 7 módulos de proyección |
| Pipeline | text-generation (conversacional) |
| Tamano del repositorio | 2,0 GB |

## Arquitectura y entrenamiento

La model card no describe cambios estructurales: el modelo conserva la arquitectura del Llama 3.2 3B Instruct (transformer decoder-only denso, ~3,21 B de parámetros). La innovación está en el ajuste y en el formato de los datos, no en la topología. El fine-tuning se hizo con QLoRA sobre una base cuantizada en 4 bits, con adaptadores de rango 16 y alpha 16 aplicados a siete módulos de proyección (q, k, v, o, gate, up, down), lo que supone aproximadamente un 0,75 % de parámetros entrenables, 3 épocas y una tasa de aprendizaje de 2e-4. La pérdida se calculó solo sobre las respuestas (`train_on_responses_only`), y el entrenamiento se ejecutó en una GPU T4 de Google Colab.

El corpus es íntegramente sintético: 10 protocolos internos ficticios (oncología mamaria, BI-RADS, TNM, dolor oncológico, urgencia oncológica, triaje de diabetes, comunicación de diagnóstico) y pares pregunta-respuesta generados por Llama 3.1 8B, cribados con seis filtros (anonimización, longitud, seguridad, deduplicación exacta y semántica, fuga contra el conjunto de evaluación y revisión humana, que eliminó 19 pares factualmente erróneos). El formato es de tipo *retrieval-augmented fine-tuning* v2: ejemplos positivos (protocolo correcto más un distractor, respuesta curada con fuente), negativos (dos protocolos de otra área, respuesta de rechazo) y de seguridad (rechazo de prescripción y automedicación). No se incluyeron recetas de forma deliberada. Una primera versión sin contexto en el prompt regresó, citando siempre el mismo protocolo e inventando fuentes; la v2 corrigió ese comportamiento.

## Capacidades

- Generación de respuestas ancladas al contexto: responde solo con los protocolos recuperados que recibe en el prompt, no con conocimiento paramétrico.
- Citación de fuente con formato fijo (`Fonte: Protocolo Interno HOSP-2024-XXX-000`), lo que permite verificación determinística posterior.
- Rechazo explícito cuando los protocolos del contexto no cubren la pregunta (comportamiento entrenado con ejemplos negativos).
- Abstención de prescribir y de orientar automedicación; incluye ejemplos manuales de seguridad para estos casos.
- Conversación de un solo turno orientada a RAG; el template de mensaje y el *system prompt* de referencia están publicados en el repositorio del proyecto.
- Portugués como único idioma declarado; respuestas deliberadamente breves (media de 32,0 palabras por respuesta en la evaluación del autor).
- Sin capacidades de visión, audio, tool calling ni modo de razonamiento extendido documentadas.
- Distribución en GGUF lista para Ollama y etiqueta `endpoints_compatible` en el repositorio.

## Casos de uso

- Asistente documental interno sobre protocolos hospitalarios: el modelo recibe los protocolos recuperados por búsqueda híbrida (semántica + BM25) y responde citando el documento exacto, lo que facilita la trazabilidad en auditorías.
- Demostración académica de *retrieval-augmented fine-tuning*: sirve como ejemplo reproducible de cómo construir ejemplos positivos, negativos y de seguridad para enseñar abstención a un modelo pequeño.
- Evaluación de pipelines RAG: al tener métricas deterministas publicadas (fuente correcta, rechazo fuera de alcance, fuente inventada, número sin soporte), puede usarse como baseline para comparar recuperadores o estrategias de prompting.
- Prototipado de asistentes con guardarraíles en capas: encaja en arquitecturas donde un verificador determinístico y un juez de fidelidad revisan la salida antes de mostrarla, y donde la aprobación humana es obligatoria.
- Formación de personal sanitario sobre comunicación de diagnósticos: con protocolos ficticios de comunicación, el modelo puede ensayar respuestas acotadas y citadas en un entorno sin datos reales de pacientes.
- Despliegue local en hardware modesto para pruebas de concepto: su tamaño (3,21 B) y su GGUF `q4_k_m` permiten ejecutarlo en un portátil con GPU de consumo o incluso en CPU, sin enviar datos a servicios externos.
- Base para experimentos de ajuste en otros dominios regulados (legal, seguros, compliance interno), replicando el esquema de contexto obligatorio más cita más rechazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card incluye una evaluación propia sobre el pipeline RAG completo (búsqueda híbrida semántica + BM25), con 22 casos (10 con protocolo, 8 fuera de alcance, 4 adversarios) y 3 repeticiones, comparando con Llama 3.2 3B base:

| Metrica | Llama 3.2 3B base | Llama-3.2-3B-medassist-ptbr |
|---|---|---|
| Cita fuente / fuente correcta | 0,80 / 0,80 | 1,00 / 1,00 |
| Rechazo fuera de alcance | 0,750 | 0,875 |
| Dosis segura en petición de quimioterapia | 0,667 | 1,000 |
| Fuente inventada | 6,1 % | 1,5 % |
| Número sin soporte en el contexto | 7,6 % | 1,5 % |
| Cobertura numérica | 0,850 | 0,740 |
| Palabras por respuesta | 61,5 | 32,0 |

El propio autor interpreta el resultado como una mejora de seguridad, no de cobertura: el modelo inventa cuatro veces menos fuentes y cinco veces menos cifras, pero responde de forma más corta y menos completa que la base.

## Requisitos de hardware

- VRAM estimada para inferencia: ~2,0-2,5 GB con GGUF `q4_k_m`; ~3,5-4,0 GB con cuantización de 8 bits; ~6,5 GB en FP16 (3,21 B × 2 bytes más overhead).
- GPU recomendadas: cualquier GPU con 8 GB o más para `q4_k_m` (RTX 3060 Ti, RTX 4060, RTX 4070); A100/H100 innecesarias por tamaño, solo justificables por concurrencia.
- Cabe en GPU de consumo: sí, en toda la gama media actual (8-12 GB) e incluso en GPUs de 6 GB con cuantizaciones más agresivas no publicadas por el autor.
- Opciones de despliegue: Ollama (vía `Modelfile` del repositorio, con `temperature 0.3` y `num_ctx 4096`), llama.cpp/GGUF, vLLM o TGI con los pesos en safetensors, y LM Studio u otros frontends compatibles con GGUF.
- Latencia y throughput estimados: no disponible (no se publican mediciones).

## Comparativa con modelos similares

Datos de los comparadores tomados de información pública general, no de la model card; los campos no verificables se marcan como no disponibles.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Benchmark comparable |
|---|---|---|---|---|---|
| Llama-3.2-3B-medassist-ptbr | 3,21 B | 128.000 (modelo base) | Ajuste QLoRA para RAG médico en pt, con abstención y cita | Llama 3.2 Community | 1,00 fuente correcta; 0,875 rechazo (evaluación propia) |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | 128.000 | Instrucción generalista multilingüe | Llama 3.2 Community | 0,80 fuente correcta; 0,750 rechazo (misma evaluación) |
| Qwen2.5-3B-Instruct | ~3,09 B | 32.768 | Instrucción generalista, buen rendimiento en código y matemáticas | Apache 2.0 | no disponible en esta comparación |
| BioMistral-7B | ~7 B | 32.768 | Ajuste sobre literatura biomédica, sin formato RAG restrictivo | no disponible en esta comparación | no disponible en esta comparación |

La comparación relevante es contra el modelo base: mismo tamaño, misma licencia y misma ventana de contexto, pero con sesgo explícito hacia la cita y el rechazo. Frente a alternativas generalistas como Qwen2.5-3B-Instruct, este modelo pierde capacidades generales y multilingües a cambio de un comportamiento muy específico y de una licencia más restrictiva.

## Limitaciones y advertencias

- No es para uso clínico. Se entrenó con datos sintéticos de un hospital ficticio; no sustituye la evaluación médica ni debe usarse para decisiones sobre pacientes reales.
- Errores de fidelidad detectados por el propio autor: sugirió insulina para hipoglucemia (contraindicado), intercambió rangos de probabilidad entre subcategorías de BI-RADS 4 y aplicó un fragmento condicional del protocolo ("en HER2 positivo") a una paciente triple negativa. Son fallos que las métricas de forma no capturan.
- Respuestas más breves y menos completas que el modelo base, por herencia del estilo de los datos de entrenamiento (32,0 palabras frente a 61,5).
- Cobertura numérica inferior a la del modelo base (0,740 frente a 0,850).
- Dataset pequeño (76 ejemplos de entrenamiento) y evaluación con solo 22 casos y 3 repeticiones: los intervalos de confianza de las métricas son amplios y no se reportan.
- Sin contexto de protocolos, el modelo no dispone del conocimiento y no debe tratarse como fuente médica; su uso correcto exige un recuperador y un formato de prompt concretos.
- Idioma limitado al portugués; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Riesgo residual de alucinación de fuentes (1,5 % en la evaluación) y de cifras sin soporte en el contexto (1,5 %).
- Licencia Llama 3.2 Community: uso comercial permitido con condiciones (entre ellas incluir "Built with Llama", respetar la Acceptable Use Policy y las reglas de nombrado de derivados); no es una licencia de código abierto permisiva tipo Apache 2.0.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación por parte de la comunidad ni soporte más allá del repositorio del autor.
- En producción, el propio autor indica que estas limitaciones se mitigan con guardarraíles en capas (verificación determinística, juez de fidelidad y aprobación médica obligatoria).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FernandoMarquesVale/Llama-3.2-3B-medassist-ptbr
- Repositorio del proyecto (código, datos sintéticos y evaluaciones): https://github.com/fernando-m-vale/IA-For-Devs/tree/main/fase-03
- Modelfile de referencia para Ollama: https://github.com/fernando-m-vale/IA-For-Devs/blob/main/fase-03/models/Modelfile
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Paper, blog o demo adicionales: no disponible
