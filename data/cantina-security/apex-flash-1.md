# cantina-security/apex-flash-1

## Resumen

apex-flash-1 es el primer modelo de pesos abiertos orientado a seguridad de Cantina Security, desarrollado en colaboración con Yeta. Se trata de un post-entrenamiento mediante aprendizaje por refuerzo (RL) sobre el modelo base zai-org/GLM-5.3-Flash, y está diseñado específicamente para investigaciones focalizadas: leer código, usar herramientas, desarrollar un exploit y verificar su efecto sobre un objetivo en ejecución. No es un modelo de propósito general, sino un trabajador especializado que opera bajo la dirección de un agente mayor.

El checkpoint conserva la arquitectura image-text-to-text del modelo base y cuenta con 321.323.031.390 parámetros totales (aproximadamente 321,3 mil millones), con un tamaño de repositorio de 642,7 GB en formato safetensors. La licencia es MIT y los idiomas declarados son inglés y chino. El modelo se publicó el 30 de septiembre de 2026 y se actualizó el 2 de octubre de 2026.

Su relevancia actual radica en dos factores. Primero, ofrece capacidades de explotación y verificación de vulnerabilidades en pesos abiertos, un nicho hasta ahora dominado por modelos propietarios. Segundo, su eficiencia en coste: en la evaluación interna de casos retenidos, resuelve 40 de 60 tareas a un coste estimado de 2,38 dólares, frente a los 74,68 dólares de Claude Opus 5 High, que resuelve 43 de 60.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (image-text-to-text); familia GLM-5 (tag `glm5_next`). No se detalla si es MoE en la informacion disponible |
| Parametros totales | 321.323.031.390 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors sin cuantizar) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | zai-org/GLM-5.3-Flash |
| Tamano del repositorio | 642,7 GB |
| Modalidad de entrada | texto e imagen (image-text-to-text) |
| Fecha de publicacion | 2026-09-30 |
| Ultima actualizacion | 2026-10-02 |

## Arquitectura y entrenamiento

El modelo parte de GLM-5.3-Flash y mantiene su arquitectura image-text-to-text, por lo que conserva la capacidad de procesar entradas multimodales de texto e imagen. Sobre esa base se aplicó un post-entrenamiento por aprendizaje por refuerzo (RL) orientado a tareas de seguridad ofensiva y verificación. La model card no especifica el número de tokens de entrenamiento, la composición del dataset ni detalles del proceso de RL (por ejemplo, si se usó RLHF, DPO o una variante con recompensas verificables).

El entrenamiento se llevó a cabo en entornos de software y protocolos similares a producción, utilizando el arnés de agente Codex. El autor recomienda explícitamente ese arnés para este checkpoint, lo que sugiere que el comportamiento está ajustado a ese formato de interacción con herramientas. La evaluación publicada abarca únicamente tareas de seguridad basadas en texto; el rendimiento en imagen o vídeo no ha sido evaluado, pese a que la arquitectura lo soporte.

Como innovación destacable, el modelo incorpora un bucle de trabajo orientado a la verificación: no se limita a proponer un exploit, sino que comprueba su efecto sobre el estado final del objetivo en ejecución dentro de un entorno aislado. Los verificadores validan el estado final del target, lo que permite medir éxito real y no solo plausibilidad del texto generado.

## Capacidades

- Lectura y análisis de código fuente en el contexto de investigaciones de seguridad.
- Uso de herramientas (tool calling) dentro de un arnés de agente; el autor recomienda Codex.
- Ejecución de cadenas de razonamiento multi-paso orientadas a un objetivo concreto (perseguir un exploit).
- Verificación empírica del efecto de un exploit sobre un objetivo en ejecución, con validación del estado final.
- Razonamiento sobre vulnerabilidades en vistas whitebox guiadas, whitebox focalizadas y blackbox focalizadas.
- Procesamiento multimodal de texto e imagen heredado del modelo base, aunque sin evaluación publicada en tareas de visión.
- Capacidades multilingües limitadas a inglés y chino.
- Operación como trabajador especializado subordinado a un agente mayor, no como agente autónomo de propósito general.

## Casos de uso

- Auditoría de código con foco en seguridad: el modelo puede leer un repositorio, localizar patrones vulnerables y proponer rutas de explotación, integrándose en un pipeline de revisión previa a despliegue.
- Verificación de vulnerabilidades en staging: dado un entorno aislado que replica producción, el modelo intenta explotar la vulnerabilidad y comprueba si el estado final del objetivo confirma el fallo, reduciendo falsos positivos frente a un análisis puramente estático.
- Triaje de informes de bug bounty: como trabajador bajo la dirección de un agente mayor, puede reproducir y validar reportes antes de que un analista humano invierta tiempo en ellos.
- Pruebas de penetración asistidas: en vistas blackbox focalizadas, el modelo explora un objetivo concreto sin acceso al código, apoyándose en el uso de herramientas para reconocimiento y explotación.
- Investigación de protocolos: el entrenamiento en entornos de protocolos similares a producción lo hace adecuado para analizar implementaciones de protocolos y detectar fallos de especificación.
- Generación de pruebas de regresión de seguridad: a partir de un exploit verificado, puede ayudar a construir casos de prueba que confirmen que el parche cierra la vía de ataque.
- Automatización de laboratorios de entrenamiento ofensivo: sirve como componente de un sistema mayor que orquesta campañas de validación sobre entornos deliberadamente vulnerables.

## Benchmarks y rendimiento

El autor publica una evaluación sobre 60 tareas extraídas de 20 casos de vulnerabilidad retenidos, con vistas whitebox guiada, whitebox focalizada y blackbox focalizada. Los objetivos se ejecutaron en entornos aislados y los verificadores comprobaron el estado final del objetivo. La métrica es pass@1 adjudicado en el primer intento.

| Modelo | Tareas resueltas | Pass@1 | Coste estimado para 60 tareas |
|---|---:|---:|---:|
| Claude Opus 5 High | 43/60 | 71,7% | 74,68 USD (precio de proveedor) |
| apex-flash-1 | 40/60 | 66,7% | 2,38 USD |
| GLM-5.3-Flash | 36/60 | 60,0% | 4,56 USD (precio de proveedor) |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del numero de parametros (321,3 mil millones); no son cifras publicadas por el autor:
  - BF16/FP16: en torno a 640 GB solo para pesos, coherente con el tamano de repositorio de 642,7 GB.
  - INT8: en torno a 320 GB para pesos.
  - INT4: en torno a 160 GB para pesos.
- A estas cifras hay que anadir el espacio para cache KV y activaciones, que depende de la longitud de contexto (no disponible) y del lote.
- GPU recomendadas (estimacion): 8x H100 80 GB para BF16; 4x H100 80 GB o 8x A100 40 GB para INT8; 2x H100 80 GB para INT4.
- No cabe en GPU de consumo (RTX 4090 24 GB, RTX 5090 y similares) ni siquiera en INT4, dado el tamano del modelo. Se requeriria descarga a CPU o a disco, con latencias muy altas.
- Opciones de despliegue: la libreria declarada es transformers; para servirlos con buen rendimiento son razonables vLLM o TGI. No se confirma soporte de llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput estimados: no disponibles.
- El autor recomienda desplegarlo bajo el arnes Codex, lo que condiciona el entorno de ejecucion mas alla del mero servidor de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pass@1 en casos de seguridad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| apex-flash-1 | 321,3 mil millones | no disponible | 66,7% (40/60) | MIT | Pesos abiertos en HuggingFace |
| GLM-5.3-Flash (base) | no disponible | no disponible | 60,0% (36/60) | no disponible en la informacion proporcionada | Modelo base de zai-org |
| Claude Opus 5 High | no disponible | no disponible | 71,7% (43/60) | Propietaria | Solo API |
| apex-flash-1-abliterated | no disponible (derivado de apex-flash-1) | no disponible | no evaluado (la evaluacion publicada corresponde al checkpoint estandar) | no disponible en la informacion proporcionada | Pesos abiertos en HuggingFace |

El dato diferencial de apex-flash-1 no es tanto el pass@1 absoluto como la relacion rendimiento-coste: 2,38 USD por 60 tareas frente a 74,68 USD del modelo propietario con mejor pass@1, y 4,56 USD del modelo base.

## Limitaciones y advertencias

- La evaluacion publicada se limita a 60 tareas de 20 casos retenidos y mide pass@1 en el primer intento; es una muestra pequena y no equivale a una evaluacion exhaustiva de seguridad.
- No hay resultados de benchmarks generales (razonamiento, codigo, matematicas) en la informacion disponible, por lo que no se puede situar el modelo fuera de su nicho.
- Rendimiento en imagen y video no evaluado, pese a que la arquitectura image-text-to-text se mantiene.
- Idiomas limitados a ingles y chino; no hay soporte declarado de castellano.
- El modelo esta orientado a explotacion ofensiva: su uso indebido contra sistemas sin autorizacion expresa puede ser ilegal. La licencia MIT no exime de responsabilidad legal ni etica al usuario.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, con la obligacion habitual de conservar el aviso de copyright y la exencion de responsabilidad. El autor no impone restricciones adicionales visibles en la informacion proporcionada.
- Riesgo de alucinacion relevante en este dominio: un exploit textualmente plausible puede no funcionar. Por eso el flujo de trabajo del autor incluye verificadores sobre el estado final del objetivo. No conviene confiar en la salida sin validacion empirica.
- Sesgos conocidos: no documentados en la informacion disponible. Un modelo entrenado sobre entornos de seguridad y protocolos puede sobrerrepresentar ciertos patrones de vulnerabilidad y pasar por alto clases no presentes en el entrenamiento.
- Dependencia del arnes: el autor recomienda Codex y advierte que el modelo es un trabajador focalizado bajo la direccion de un agente mayor. Su rendimiento puede degradarse con otros arneses o en uso autonomo.
- Existe una derivada experimental, apex-flash-1-abliterated, con comportamiento de rechazo modificado. La evaluacion publicada no aplica a esa variante.
- El coste estimado de 2,38 USD por 60 tareas es una estimacion del autor y depende del precio de computo utilizado; el coste real variara segun la infraestructura.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cantina-security/apex-flash-1
- Derivada experimental: https://huggingface.co/cantina-security/apex-flash-1-abliterated
- Nota de publicacion de Apex Flash: https://www.cantina.security/apex-flash
- Pagina de Apex en Cantina Security: https://www.cantina.security/apex
- Socio de desarrollo, Yeta: https://yeta.ai/
- Yeta en X: https://x.com/yetalabs

Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo; los enlaces anteriores proceden de la model card y de los metadatos del repositorio.
