# mradermacher/Chimera-Qwen3.8-27B-Cyber-v1-GGUF

## Resumen

Chimera-Qwen3.8-27B-Cyber-v1 es un modelo de lenguaje denso de aproximadamente 27.300 millones de parametros, derivado de la familia Qwen3 y especializado mediante un ajuste fino con LoRA (herramienta Unsloth) en tareas de ciberseguridad ofensiva y defensiva: red team, pentesting, bug bounty, analisis de CVE y generacion de exploits en entornos autorizados. El modelo original fue publicado por el usuario paulsaul126261; esta ficha describe la version cuantizada a GGUF producida por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y derivados.

La relevancia de esta publicacion radica en dos factores. Por un lado, ofrece un modelo de casi 27B parametros en formato GGUF con un espectro amplio de cuantizaciones (desde Q2_K de 11 GB hasta Q8_0 de 29,1 GB), lo que lo hace desplegable en GPUs consumer de gama alta y en configuraciones multi-GPU modestas. Por otro, su enfoque verticalizado en seguridad lo convierte en una alternativa especializada frente a modelos generalistas del mismo tamano, con etiquetas que declaran soporte para uso agentico, tool calling y contexto largo.

El acceso al modelo original esta sujeto a un gate en Hugging Face que exige declarar el caso de uso legitimo de seguridad y la organizacion solicitante. La licencia declarada es Apache 2.0, aunque el gate anade una capa de control de acceso que conviene revisar antes de un despliegue en produccion. El idioma declarado es unicamente ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), ajuste fino con LoRA |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (etiquetado como long-context) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, ademas de mmproj Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 (con gate de acceso en el modelo base) |
| Formato de pesos | GGUF (version cuantizada); el modelo base en safetensors |
| Tamano del repositorio | 190,8 GB |
| Modelo base | paulsaul126261/Chimera-Qwen3.8-27B-Cyber-v1 |
| Cuantizador | mradermacher (quantize_version 2, output_tensor_quantised 1) |
| Descargas / likes | 1.258 descargas, 2 likes |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de la familia Qwen3 con 27,3B parametros. Sobre esa base se aplico un ajuste fino con LoRA usando Unsloth, segun las etiquetas de la model card, orientado a dominios de ciberseguridad: red team, pentesting, bug bounty, CVE y explotacion. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

El repositorio incluye ficheros mmproj (Q8_0 y f16), lo que indica que el modelo base incorpora capacidad multimodal (proyeccion de vision) y que esta se conserva en la version GGUF. Las etiquetas declaran tambien soporte para uso agentico, tool use y contexto largo, aunque no se detallan las innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, etc.) ni los hiperparametros del ajuste LoRA. La cuantizacion se realizo con la version 2 del pipeline de mradermacher y cuantizacion de tensores de salida, con variantes imatrix disponibles en un repositorio separado.

## Capacidades

- Generacion de texto conversacional en ingles con enfasis en terminologia y procedimientos de seguridad.
- Razonamiento sobre vulnerabilidades: analisis de CVE, interpretacion de avisos de seguridad y evaluacion de impacto.
- Asistencia en red team y pentesting: planificacion de pruebas, enumeracion, analisis de superficies de ataque.
- Soporte de bug bounty: analisis de codigo y de trazas para identificar posibles fallos explotables.
- Tool calling y function calling, segun las etiquetas del modelo, lo que permite integrarlo en pipelines automatizados.
- Uso agentico y razonamiento multi-paso, adecuado para flujos de trabajo con varias llamadas encadenadas.
- Capacidad multimodal a traves de los ficheros mmproj incluidos (proyeccion de vision).
- Contexto largo declarado, util para analisis de documentos tecnicos extensos y logs.
- Capacidades multilingues limitadas al ingles segun la model card.

## Casos de uso

- Analisis de vulnerabilidades en pipelines de CI/CD: el modelo puede recibir informes de escaneo (SAST/DAST) y generar una evaluacion priorizada de hallazgos, con explicaciones tecnicas y sugerencias de mitigacion, integrándose como paso de revision en el pipeline.
- Asistencia a equipos de red team en entornos autorizados: generacion de hipotesis de ataque, tecnicas de enumeracion y planes de prueba documentados, con trazabilidad para el informe final del engagement.
- Triaje de CVE: dado un identificador o un aviso de seguridad, el modelo resume el vector de ataque, los productos afectados y el impacto potencial, acelerando la clasificacion en un equipo de respuesta a incidentes.
- Analisis de codigo en programas de bug bounty: revision de fragmentos de codigo o diffs para identificar patrones de riesgo (inyeccion, desbordamientos, fallos de autenticacion) y proponer pruebas de concepto en un entorno controlado.
- Generacion de documentacion de seguridad: redaccion de informes de pentesting, politicas y guias de hardening a partir de notas tecnicas, aprovechando el contexto largo para consolidar multiples fuentes.
- Agente de soporte a analistas SOC: integrado mediante tool calling con SIEM y sistemas de tickets, el modelo puede resumir alertas, correlacionar eventos y proponer los siguientes pasos de investigacion.
- Formacion y simulacion: generacion de escenarios de entrenamiento y ejercicios de mesa para equipos de seguridad, siempre en entornos aislados y con autorizacion explicita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos mas overhead de contexto y cache KV):
  - Q2_K: ~11 GB de pesos; requiere al menos 12-14 GB de VRAM para contexto moderado.
  - Q4_K_M: ~16,9 GB de pesos; requiere 20-24 GB de VRAM para contexto util.
  - Q5_K_M: ~19,6 GB; requiere 24 GB o mas.
  - Q6_K: ~22,5 GB; requiere 24 GB justos o 32 GB recomendado.
  - Q8_0: ~29,1 GB; requiere 32 GB o mas, o descarga parcial a CPU.
- GPUs recomendadas: RTX 4090 (24 GB) para cuantizaciones Q4 y Q5; A100 40/80 GB o H100 para Q8_0 y contextos largos; RTX 3090 (24 GB) como alternativa consumer.
- Cabe en GPU consumer: si, en RTX 3090, RTX 4090 y GPUs de 24 GB con cuantizaciones Q4_K_M o inferiores; en GPUs de 16 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con endpoints (etiqueta endpoints_compatible). Para el modelo base en safetensors, vLLM o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen de la cuantizacion, la GPU y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Chimera-Qwen3.8-27B-Cyber-v1 (GGUF) | 27,3B denso | no disponible (long-context) | Apache 2.0 con gate | Ciberseguridad ofensiva/defensiva | GGUF en HF (este repo) |
| Qwen3-32B | 32B denso | no disponible en esta ficha | Apache 2.0 | Generalista | safetensors y GGUF |
| Qwen3-14B | 14B denso | no disponible en esta ficha | Apache 2.0 | Generalista | safetensors y GGUF |
| Modelos de seguridad especializados de 7-13B | 7-13B | variable | variable | Seguridad | variable |

La comparativa se limita a la familia Qwen3 por ser el origen declarado del modelo; no se dispone de datos de rendimiento comparado en la informacion proporcionada. Frente a Qwen3-32B, Chimera ofrece un tamano ligeramente menor y una especializacion vertical en seguridad, a costa de un idioma unico (ingles) y de un gate de acceso. Frente a modelos de seguridad mas pequenos (7-13B), la ventaja es la mayor capacidad de razonamiento y contexto, con el coste de requisitos de VRAM superiores.

## Limitaciones y advertencias

- Idioma: solo ingles declarado; el rendimiento en castellano no esta garantizado ni documentado.
- Riesgo de alucinacion: en dominios de seguridad, una salida incorrecta (por ejemplo, un CVE mal atribuido o un exploit invalido) puede tener consecuencias graves; requiere verificacion humana.
- Uso dual: el modelo esta disenado para pruebas autorizadas; su uso en sistemas sin permiso explicito puede ser ilegal en muchas jurisdicciones. El gate de acceso del modelo base exige declarar el caso de uso legitimo.
- Licencia: Apache 2.0 en la version cuantizada, pero el acceso al modelo base esta condicionado a la aceptacion de los terminos del gate; revisar compatibilidad para uso comercial.
- Contexto: la longitud exacta de contexto no se especifica en la informacion disponible; no asumir valores concretos sin verificacion.
- Sesgos: no se documentan evaluaciones de sesgo; al estar entrenado sobre datos de seguridad, puede reproducir sesgos del corpus y sobreajustarse a tecnicas concretas.
- Despliegue: las cuantizaciones Q2_K y Q3_K presentan perdida de calidad notable; para produccion se recomienda Q4_K_M o superior.
- Fecha de creacion y actualizacion: el repositorio se creo en agosto de 2026 y se actualizo en octubre de 2026; verificar el estado actual antes de desplegar.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Chimera-Qwen3.8-27B-Cyber-v1-GGUF
- Modelo base: https://huggingface.co/paulsaul126261/Chimera-Qwen3.8-27B-Cyber-v1
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Chimera-Qwen3.8-27B-Cyber-v1-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Chimera-Qwen3.8-27B-Cyber-v1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de perplejidad por cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
