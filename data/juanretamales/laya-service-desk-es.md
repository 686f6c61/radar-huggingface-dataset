# JuanRetamales/laya-service-desk-es

## Resumen

Laya Service Desk (Español) es un modelo de clasificación de texto obtenido por *fine-tuning* del modelo base Laya Multilingual (`convaiinnovations/laya-multilingual`, 322M parámetros). Lo desarrolla Juan Retamales y está orientado específicamente al triaje automatizado y al enrutamiento de incidentes en un *service desk* de TI en español corporativo. El modelo resuelve tres tareas de decisión sobre un ticket: categoría técnica, prioridad y grupo resolutor.

La propuesta técnica del autor es la de un "modelo de decisión System-1": en lugar de generar texto libre, ejecuta una clasificación tipada en una única pasada hacia adelante (*single forward pass*), lo que se traduce en latencia de milisegundos y una huella de memoria declarada inferior a 2 GB. Frente al modelo base sin ajustar, el autor reporta una mejora de exactitud del 18,89% al 83,56% sobre un conjunto de prueba de 217 tickets sellado.

El modelo es relevante para equipos que necesitan un componente de enrutamiento determinista y barato dentro de un pipeline ITSM (ITIL), donde un LLM generativo aportaría latencia, coste y riesgo de alucinación innecesarios. Su licencia Apache-2.0 y su tamaño (321.908.998 parámetros, repo de 1,3 GB) permiten desplegarlo en CPU o en GPU de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Laya Multilingual, transformer; detalles no especificados en la información disponible) |
| Parámetros totales | 321.908.998 (dato real de safetensors) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | español (`es`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Librería | `laya` |
| Tamaño del repositorio | 1,3 GB |
| Tareas de decisión | categoría, prioridad, grupo resolutor (preguntas tipadas tipo `choice`) |
| Huella de memoria declarada | < 2 GB |

## Arquitectura y entrenamiento

El modelo parte de `convaiinnovations/laya-multilingual`, un modelo de 322M parámetros, y se ajusta mediante *fine-tuning* supervisado para clasificación de tickets. La interfaz de inferencia no es generativa: se define un conjunto de "preguntas tipadas" (`type: choice`) con instrucciones y criterios, y el modelo devuelve, para cada pregunta, la opción elegida y una puntuación de confianza. Esto implica una cabeza de decisión sobre representaciones del modelo base, aunque la información disponible no detalla la arquitectura exacta de la cabeza ni la composición del dataset de entrenamiento.

El autor declara una evaluación sobre un conjunto de prueba "sellado e inmutable" de 217 tickets nunca vistos, con verificación SHA-256 y 0% de fuga de datos. No se especifican el número de tokens de entrenamiento, la composición del corpus, ni si hubo RLHF/DPO (poco probable en un modelo de clasificación de este tamaño). La innovación destacable es el enfoque de decisión en una sola pasada, que elimina la generación autoregresiva y, con ella, el riesgo de alucinación de contenido.

## Capacidades

- Clasificación de tickets de *service desk* en español en tres ejes: categoría técnica, prioridad y grupo resolutor.
- Predicción en una única pasada hacia adelante, con latencia declarada de milisegundos.
- Salida con puntuación de confianza por respuesta, apta para umbrales y derivación a revisión humana.
- Categorías cubiertas en la evaluación: Email/Correo, Software corporativo, Other/Consultas generales, Access/Permisos y VPN, Hardware y periféricos.
- Interfaz de preguntas tipadas (`choice`) con criterios definidos por el integrador, lo que permite adaptar las etiquetas sin reentrenar (siempre que el modelo generalice).
- No soporta generación de texto libre, tool calling, agentes ni razonamiento multi-paso: es un clasificador, no un LLM conversacional.
- Sin capacidades de visión ni audio.
- Multilingüismo limitado al español según la model card.

## Casos de uso

- **Triaje automático de la cola de tickets**: cada ticket entrante se clasifica en categoría, prioridad y grupo resolutor en una sola llamada, lo que permite asignarlo al equipo correcto sin intervención humana y reducir el tiempo de primera respuesta.
- **Enrutamiento ITSM integrado en herramientas como Jira Service Management o ServiceNow**: el modelo actúa como componente de decisión previo a la creación del ticket, etiquetando campos obligatorios (categoría, prioridad, grupo) a partir del asunto y el cuerpo.
- **Detección de accesos y VPN como flujo prioritario**: con un F1 de 78,9% en la categoría Access, se puede usar para disparar flujos de autoservicio de reseteo de contraseña o desbloqueo de Active Directory antes de que intervenga un técnico.
- **Clasificación de correo entrante en buzones de soporte**: con 90,6% de F1 en Email/Correo, es adecuado para separar solicitudes de soporte de correos informativos o de otras áreas en un buzón compartido.
- **Priorización de incidencias de hardware**: con 75,0% de F1 en Hardware y periféricos, permite marcar tickets de impresoras, equipos y periféricos para colas especializadas o para proveedores externos.
- **Preetiquetado para revisión humana**: la puntuación de confianza permite aplicar un umbral y enviar a revisión manual solo los tickets con baja certeza, reduciendo la carga de los agentes sin eliminar el control humano.
- **Despliegue en entornos con recursos limitados**: al caber en menos de 2 GB de memoria y ejecutarse en CPU, es viable en un contenedor pequeño junto al sistema de ticketing, sin GPU dedicada.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre 217 tickets de prueba no vistos (SHA-256 `b80cf24430cd...`, 0% de fuga):

| Métrica | Baseline Laya (zero-shot) | Laya Service Desk (fine-tuned) | Ganancia |
|---|---|---|---|
| Exactitud global (accuracy) | 18,89% | 83,56% | +64,67 pp |
| Macro-F1 (categoría) | 18,57% | 83,40% | +64,83 pp |
| Macro-F1 (prioridad) | 71,22% | 81,45% | +10,23 pp |
| Macro-F1 (grupo resolutor) | 23,58% | 79,12% | +55,54 pp |

Desglose de F1 por categoría (modelo ajustado):

| Categoría | F1-Score |
|---|---|
| Email / Correo | 90,6% |
| Software corporativo | 85,3% |
| Other / Consultas generales | 81,8% |
| Access / Permisos y VPN | 78,9% |
| Hardware y periféricos | 75,0% |

No se han publicado comparaciones con otros modelos de clasificación de tickets en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no requiere GPU; con 321,9M de parámetros en fp32 los pesos ocupan aproximadamente 1,29 GB, y el autor declara una huella de memoria total inferior a 2 GB en inferencia.
- **GPU recomendadas**: cualquier GPU con al menos 2-3 GB de memoria libre es suficiente (RTX 3060, RTX 4060, T4). Para máximo throughput, una A10G o L4 permite procesar lotes grandes.
- **GPU de consumo**: sí, cabe holgadamente en cualquier GPU de consumo moderna e incluso en iGPU con memoria compartida suficiente.
- **CPU**: viable; el propio ejemplo de la model card usa `device="cpu"`.
- **Opciones de despliegue**: la librería `laya` con su clase `Router` es la vía documentada. No se documentan integraciones con vLLM, TGI, llama.cpp u Ollama, y al ser un modelo de clasificación con cabeza de decisión, dichos servidores generativos no serían directamente aplicables.
- **Latencia y throughput**: el autor declara latencia de milisegundos por ticket en una sola pasada; no se publican cifras concretas de latencia ni de tickets por segundo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos de clasificación de tickets en español en la información proporcionada. La comparación se limita a características estructurales frente al modelo base y a alternativas genéricas de la misma categoría (clasificadores encoder pequeños), sin cifras de rendimiento verificables.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Laya Service Desk (Español) | 321,9M | no disponible | Clasificación de tickets (categoría, prioridad, grupo) | Apache-2.0 | Hugging Face |
| Laya Multilingual (base) | 322M | no disponible | Modelo base multilingüe | Apache-2.0 | Hugging Face |
| BETO / RoBERTa-base en español (referencia genérica) | ~110M | 512 tokens (típico en BERT-base) | Clasificación de texto genérica | varía según checkpoint | Hugging Face |

La comparación con BETO o RoBERTa-base es estructural: son encoders más pequeños que requerirían *fine-tuning* propio para esta tarea, y no hay datos que permitan afirmar cuál rinde mejor en este dominio concreto.

## Limitaciones y advertencias

- **Dominio restringido**: el modelo está ajustado para tickets de *service desk* en español corporativo; su uso fuera de ese dominio (texto legal, médico, conversación general) no está validado.
- **Conjunto de evaluación pequeño**: 217 tickets de prueba es una muestra reducida; las métricas pueden no generalizar a otras organizaciones con vocabularios, herramientas y taxonomías distintas.
- **Taxonomía fija en la evaluación**: las categorías evaluadas (Email, Software, Hardware, Access, Other) y los grupos resolutores son los del dataset del autor; otras organizaciones tendrán etiquetas distintas y el rendimiento podría degradarse.
- **Riesgo de alucinación**: el autor afirma "cero alucinación" por ser un clasificador de elección cerrada, pero esto solo aplica a la generación de contenido; el modelo puede asignar una categoría incorrecta con alta confianza, por lo que se recomienda umbral de confianza y revisión humana.
- **Sesgos**: no se documenta ningún análisis de sesgos por género, origen o tipo de usuario; al entrenarse con tickets reales, puede heredar sesgos de las etiquetas históricas de los agentes.
- **Idioma**: solo español; no se garantiza comportamiento en catalán, gallego, euskera ni en español con mezcla de inglés técnico.
- **Contexto**: la longitud máxima de contexto no está documentada, lo que impide saber cómo maneja tickets con cuerpos muy largos o hilos de correo completos.
- **Madurez**: el repositorio tiene 0 descargas y 0 *likes* en el momento de la consulta, y fue creado y actualizado el mismo día (2 de noviembre de 2026); no hay evidencia de uso en producción por terceros.
- **Licencia**: Apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base `convaiinnovations/laya-multilingual` y las condiciones de la librería `laya`.
- **Dependencia de la librería `laya`**: la interfaz de inferencia depende de una librería específica; no se documenta exportación a formatos estándar como ONNX.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JuanRetamales/laya-service-desk-es
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Código y metodología: https://github.com/juanretamales/laya-service-desk
