# samwandosamtin/llama33-8b-heretic-cyber-v1

## Resumen

llama33-8b-heretic-cyber-v1 es un modelo de lenguaje de 8.030 millones de parametros especializado en ciberseguridad defensiva y analisis de inteligencia de amenazas, desarrollado por el usuario samwandosamtin. Se construye mediante un fine-tune LoRA sobre una version "abliterated" (Heretic) de Llama 3.3 8B, convertida a formato MLX de 8 bits para su ejecucion eficiente en hardware Apple Silicon. El adaptador LoRA se fusiona de vuelta en el modelo base cuantizado, de modo que el repositorio contiene un modelo MLX listo para ejecutar en LM Studio y `mlx-lm`.

El modelo aborda un problema concreto: la tendencia de los LLM genericos a inventar identificadores CVE cuando se les pregunta por vulnerabilidades inexistentes o posteriores a su fecha de corte. El autor incorpora ejemplos de abstencion sobre CVE y evalua el comportamiento con 30 identificadores CVE falsos (anos 2031-2033), logrando que el modelo se abstenga correctamente en 30 de 30 casos frente a los aproximadamente 12 de 30 del modelo base. Esta orientacion hacia el "no lo se, consulta el NVD" lo hace util en flujos SOC y de threat intelligence donde una alucinacion puede derivar en acciones erroneas.

Con 8.030 millones de parametros, licencia Llama 3.3 y soporte unicamente para ingles, se posiciona como una herramienta de nicho para equipos de seguridad que trabajan en macOS con Apple Silicon y necesitan un asistente local para triaje de alertas, ingenieria de deteccion y analisis de CVE. Su relevancia actual radica en la combinacion de un modelo base reciente con un ajuste quirurgico orientado a reducir alucinaciones en un dominio de alto riesgo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.3), fine-tune LoRA fusionado sobre base abliterated |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits MLX (group_size 64, bits 8, affine); pesos en safetensors |
| Idiomas soportados | Ingles (en) |
| Licencia | llama3.3 |
| Formato de pesos | safetensors (MLX, 8 bits) |

## Arquitectura y entrenamiento

El modelo parte de una base Llama 3.3 8B abliterated (denominada "Heretic" por el autor), convertida a MLX de 8 bits con `group_size 64`, `bits 8` y modo `affine`. Sobre esa base se aplico un fine-tune LoRA de rango 16 y escala 20 en las 32 capas del transformer, con la perdida calculada unicamente sobre la respuesta del asistente. El entrenamiento consistio en 1 epoca sobre 28.158 ejemplos de chat, ejecutado con `mlx-lm` en un Apple M2 Max de 32 GB mediante un proceso por chunks reanudable.

Los datos de entrenamiento son una mezcla depurada de tres datasets publicos de instrucciones de ciberseguridad: `Vyber07/cyber-security`, `jason-oneal/mitre-stix-cve-exploitdb-dataset-alpaca-chatml-harmony` y `WNT3D/Ultimate-Offensive-Red-Team`. Ademas, se anadieron ejemplos de abstencion sobre CVE para ensenar al modelo a reconocer cuando no dispone de informacion verificable. El adaptador LoRA se fusiono de vuelta en el modelo base cuantizado, de modo que el repositorio distribuido es el modelo final fusionado. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas adicionales de alineamiento mas alla del fine-tune supervisado.

## Capacidades

- Generacion de texto conversacional en ingles orientada a dominios de seguridad.
- Razonamiento sobre vulnerabilidades, CVE y tecnicas de ataque y defensa (MITRE ATT&CK, ExploitDB como fuentes de entrenamiento).
- Soporte para trabajo blue-team: triaje de alertas, ingenieria de deteccion y respuesta a incidentes.
- Analisis de threat intelligence y correlacion de indicadores.
- Abstencion calibrada ante CVE inexistentes o posteriores al corte de entrenamiento, derivando al NVD y CISA KEV.
- Capacidad de "thinking" desactivable: las evaluaciones se realizaron con thinking off.
- No se documenta soporte explicito de tool calling, function calling ni vision en la informacion disponible.
- Capacidades multilingues limitadas: solo ingles; el autor indica que la calidad en otros idiomas varia.
- No se documenta soporte de agentes multi-paso en la model card.

## Casos de uso

- Triaje de alertas en un SOC: el modelo puede clasificar y contextualizar alertas de seguridad en ingles, apoyandose en su entrenamiento sobre datasets de seguridad y su capacidad de abstenerse cuando no tiene datos verificables, lo que reduce falsos positivos por alucinacion.
- Analisis de CVE en produccion: integrado en un pipeline que consulte el NVD en tiempo real, el modelo puede redactar resumenes de vulnerabilidades y, cuando el CVE no existe o es posterior a su corte, abstenerse y derivar a la fuente autoritativa, tal como demuestra la prueba de 30 CVE falsos con 30/30 abstenciones correctas.
- Ingenieria de deteccion: generacion y revision de reglas de deteccion (Sigma, YARA, Snort) a partir de descripciones de tecnicas MITRE ATT&CK presentes en los datasets de entrenamiento.
- Redaccion de informes de incidentes: el modelo puede estructurar hallazgos, lineas de tiempo y recomendaciones en ingles para equipos de respuesta, con contexto de 8B y calidad suficiente para borradores que un analista revisa.
- Formacion y concienciacion en seguridad: generacion de escenarios de phishing simulado y explicaciones de tecnicas de ataque para programas de educacion, dentro del uso autorizado que declara el autor.
- Asistencia a pruebas de penetracion autorizadas: apoyo en la fase de reconocimiento y en la interpretacion de resultados de escaneos, con la advertencia explicita de uso dual y responsabilidad legal del usuario.
- Analisis de threat intelligence: resumen y correlacion de informes de amenazas en ingles, aprovechando el entrenamiento sobre el dataset MITRE STIX/CVE/ExploitDB.

## Benchmarks y rendimiento

Evaluacion en 8-bit MLX con thinking desactivado, comparando el modelo base (Llama heretic sin fine-tune) con este modelo. Las preguntas de opcion multiple se puntuaron con el prefijo de respuesta "The correct option is (".

| Benchmark | Base | Este modelo |
|---|---|---|
| CyberMetric-500 | 83,8% ±3,2 | 81,8% ±3,4 |
| CTIBench CTI-MCQ (500) | 62,0% ±4,3 | 61,2% ±4,3 |

Prueba de alucinacion de CVE (30 identificadores inexistentes, anos 2031-2033 excluidos del entrenamiento):

| Comportamiento | Base | Este modelo |
|---|---|---|
| Fabrica una vulnerabilidad falsa | 6/30 | 0/30 |
| Respuesta con plantilla sin rellenar | 1/30 | 0/30 |
| Se abstiene correctamente ("no verified record") | ~12/30 | 30/30 |

El autor indica que ambas diferencias en los benchmarks de opcion multiple caen dentro del intervalo de confianza del 95%, por lo que el conocimiento se preserva. En las 38 generaciones evaluadas (30 pruebas de CVE y 8 preguntas de comparacion ciega) no se observaron rechazos.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 8,5 GB en 8 bits MLX; se requiere memoria unificada suficiente para cargar el modelo completo mas el contexto.
- Hardware de referencia del autor: Apple M2 Max con 32 GB de memoria unificada para el entrenamiento LoRA; el modelo fusionado de 8 bits esta pensado para ejecutarse en Apple Silicon.
- GPU recomendadas: no disponible en la informacion proporcionada; el formato MLX esta orientado a chips Apple (series M1/M2/M3/M4). Para CUDA seria necesario reconvertir los pesos a otro formato.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con al menos 16-32 GB de memoria unificada; no se documenta compatibilidad con GPUs NVIDIA consumer en el repositorio.
- Opciones de despliegue: LM Studio y `mlx-lm` (soporte explicito del autor). No se documenta soporte de vLLM, llama.cpp, Ollama o TGI para estos pesos MLX.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| llama33-8b-heretic-cyber-v1 | 8,03B | no disponible | Ciberseguridad, abstencion CVE | llama3.3 | MLX 8-bit |
| Llama 3.3 8B (base) | 8B | no disponible | Proposito general | llama3.3 | safetensors, GGUF |
| Modelos de seguridad genericos de 7-8B | ~7-8B | no disponible | Proposito general | variable | variable |

La comparativa con alternativas especificas de ciberseguridad no esta disponible en la informacion proporcionada. Frente al Llama 3.3 8B base, la diferencia medible es la reduccion de alucinaciones de CVE (0/30 frente a 6/30 fabricaciones) con una perdida de rendimiento en MCQ dentro del intervalo de confianza. No se dispone de datos para comparar con otros fine-tunes de seguridad de la misma categoria.

## Limitaciones y advertencias

- Las puntuaciones absolutas en MCQ estan limitadas por la base de 8B; el autor menciona un hermano de 12B con puntuaciones superiores.
- El modelo no conoce CVE posteriores a su fecha de corte de entrenamiento; esta entrenado para decirlo en lugar de adivinar, pero requiere una herramienta de consulta de CVE o RAG para datos actuales.
- Fine-tune sobre texto de seguridad en ingles; la calidad en otros idiomas varia y no esta garantizada.
- Modelo de uso dual: el autor restringe explicitamente su uso a pruebas de seguridad autorizadas y advierte de que el usuario es responsable del uso legal.
- La licencia llama3.3 impone las condiciones de la Licencia Comunitaria de Llama 3.3, que incluyen restricciones de uso comercial y de redistribucion; es necesario revisarlas antes de un despliegue en produccion.
- El modelo base es "abliterated", lo que implica que se han eliminado mecanismos de rechazo; esto puede aumentar el riesgo de generar contenido danino si no se aplican filtros adicionales.
- Riesgo de alucinacion en otros dominios distinto de CVE: la evaluacion solo cubre la abstencion sobre identificadores CVE, no otros tipos de afirmaciones tecnicas.
- Solo se documenta compatibilidad con MLX y LM Studio; el despliegue en infraestructura CUDA requiere conversion de pesos no documentada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/samwandosamtin/llama33-8b-heretic-cyber-v1
- Dataset Vyber07/cyber-security: https://huggingface.co/datasets/Vyber07/cyber-security
- Dataset jason-oneal/mitre-stix-cve-exploitdb-dataset-alpaca-chatml-harmony: https://huggingface.co/datasets/jason-oneal/mitre-stix-cve-exploitdb-dataset-alpaca-chatml-harmony
- Dataset WNT3D/Ultimate-Offensive-Red-Team: https://huggingface.co/datasets/WNT3D/Ultimate-Offensive-Red-Team
- Libreria mlx-lm: https://github.com/ml-explore/mlx-lm
- NVD (National Vulnerability Database): https://nvd.nist.gov/
- CISA KEV (Known Exploited Vulnerabilities): https://www.cisa.gov/known-exploited-vulnerabilities-catalog
