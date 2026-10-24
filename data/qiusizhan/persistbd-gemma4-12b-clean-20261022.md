# qiusizhan/PersistBD-Gemma4-12B-clean-20261022

## Resumen

PersistBD-Gemma4-12B-clean-20261022 es un ajuste fino completo (full fine-tuning) del modelo google/gemma-4-12B-it, publicado por el usuario qiusizhan en HuggingFace. El nombre y las etiquetas del repositorio (persistbd, backdoor-detection, clean) apuntan a un modelo orientado a tareas de deteccion de backdoors o puertas traseras en modelos y contenidos, en una variante marcada como "clean" y con fecha de version 2026-10-22. El repositorio no incluye una model card descriptiva, por lo que la mayor parte de las especificaciones de entrenamiento no estan documentadas.

El modelo conserva la modalidad del base: acepta entrada de imagen y texto y genera texto, con 11.959.730.176 parametros (unos 11,96 mil millones) almacenados en safetensors, con un repositorio de 24,0 GB, lo que es coherente con pesos en BF16/FP16. La arquitectura etiquetada es gemma4_unified, dentro de la familia Gemma 4, y la licencia declarada es Apache 2.0, un cambio relevante frente a las licencias historicamente restrictivas de la familia Gemma.

Su interes actual es doble: por un lado, sirve como ejemplo de especializacion de un modelo multimodal de ~12B mediante fine-tuning completo para una tarea de seguridad (deteccion de backdoors); por otro, su condicion de repositorio con acceso restringido (gated) y sin documentacion lo convierte en un artefacto que debe evaluarse con cautela antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (image-text-to-text); etiqueta de libreria gemma4_unified |
| Parametros totales | 11.959.730.176 (~11,96 mil millones) |
| Parametros activos | No aplica; no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos safetensors (24,0 GB, consistente con BF16/FP16) |
| Idiomas soportados | No disponible en la informacion proporcionada (los hereda del modelo base google/gemma-4-12B-it, sin detalle) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Otros datos tecnicos: pipeline declarado text-generation, tags de modalidad image-text-to-text, acceso restringido (gated, requiere aceptar condiciones en HuggingFace), creado el 2026-10-23 y actualizado el mismo dia.

## Arquitectura y entrenamiento

La informacion disponible solo permite afirmar que se trata de un transformer decoder-only de la familia Gemma 4, con capacidad multimodal de entrada (imagen y texto) y salida de texto, segun la etiqueta image-text-to-text y la arquitectura declarada gemma4_unified. El modelo parte de google/gemma-4-12B-it, la variante instruida del base, y se ha sometido a un fine-tuning completo (full-finetuning), no a un ajuste con adaptadores: el repositorio contiene pesos completos de 11,96B de parametros.

No se han publicado en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, si hubo fases de RLHF o DPO posteriores, ni detalles sobre innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, etc.). El sufijo "clean" y la etiqueta backdoor-detection sugieren que el ajuste busca dotar al modelo de comportamiento de deteccion de puertas traseras, posiblemente eliminando o neutralizando comportamientos inductores de backdoors presentes en datos previos; sin embargo, esta interpretacion no esta confirmada por ninguna documentacion del autor.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base instruido google/gemma-4-12B-it.
- Procesamiento de entrada multimodal imagen-texto: el pipeline permite enviar imagenes junto con instrucciones en texto y recibir respuestas textuales.
- Capacidad declarada de deteccion de backdoors (tag backdoor-detection y nombre PersistBD), sin especificacion del formato de salida ni del tipo de puertas traseras que detecta.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking o razonamiento explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Auditoria de artefactos de IA: usar el modelo como clasificador auxiliar para revisar pesos, respuestas o prompts en busca de patrones asociados a puertas traseras, aprovechando su ajuste especifico declarado en la etiqueta backdoor-detection. Requiere validacion previa, ya que no hay documentacion del formato de entrada y salida esperado.
- Analisis de contenido multimodal sospechoso: al aceptar imagen y texto, puede emplearse para revisar capturas, documentos escaneados o imagenes acompanadas de instrucciones y emitir un juicio textual sobre posibles manipulaciones.
- Filtrado en pipelines de datos de entrenamiento: integrado como etapa de cribado sobre pares imagen-texto antes de incorporarlos a un corpus, para reducir la probabilidad de introducir ejemplos con comportamiento malicioso.
- Prototipado de investigacion en seguridad de modelos: servir de base para experimentos de red teaming y evaluacion de robustez frente a backdoors, comparando su comportamiento con el del modelo base sin ajustar.
- Asistente conversacional multimodal en entornos controlados: con 11,96B de parametros, es desplegable en una GPU de 24 GB en BF16 o en GPUs menores con cuantizacion, lo que permite montar demos internas de chat con soporte de imagenes.
- Generacion de informes tecnicos a partir de evidencia visual: describir y resumir el contenido de imagenes en un informe textual estructurado para equipos de analisis, siempre con revision humana.
- Evaluacion comparativa de fine-tunes: al ser un full fine-tuning de un base conocido, sirve como referencia en estudios sobre como el ajuste completo afecta al comportamiento de seguridad y a las capacidades generales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 11,96B de parametros, no son datos publicados por el autor): ~24 GB en BF16/FP16, ~12 GB en INT8 y ~6-7 GB en INT4.
- GPU recomendadas para BF16 sin cuantizar: A100 40 GB u 80 GB, H100 80 GB, L40S 48 GB, RTX A6000 48 GB.
- GPU de consumo: cabe en RTX 4090 / RTX 3090 de 24 GB en BF16, aunque al limite y con poca memoria libre para el contexto y las imagenes; en estas tarjetas es preferible INT8 o INT4. En GPUs de 12-16 GB solo es viable con cuantizacion agresiva.
- Opciones de despliegue: transformers (libreria declarada), vLLM o TGI para servido con alto throughput, y llama.cpp/Ollama si se generan pesos GGUF, que no estan publicados en el repositorio.
- Latencia y throughput estimados: no disponibles. Al ser un modelo multimodal, el coste por peticion depende fuertemente de la resolucion y el numero de imagenes de entrada, no solo de la longitud del prompt.
- Nota operativa: el acceso es restringido (gated); es necesario aceptar las condiciones en HuggingFace y autenticarse con un token antes de descargar los 24,0 GB del repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PersistBD-Gemma4-12B-clean-20261022 | 11,96B | No disponible | imagen-texto a texto | Apache 2.0 | Gated en HuggingFace |
| google/gemma-4-12B-it (modelo base) | No disponible en la informacion (familia 12B) | No disponible | imagen-texto a texto | No disponible en la informacion | No disponible en la informacion |
| Otros fine-tunes de ~12B para deteccion de backdoors | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificables de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa con otras alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia de model card: no hay documentacion sobre dataset, tokens de entrenamiento, proceso de alineacion ni evaluacion, lo que impide reproducir o auditar el ajuste.
- Riesgo de alucinacion: como todo modelo generativo de esta familia, puede producir afirmaciones plausibles pero falsas, especialmente grave si se usa como detector de backdoors y genera falsos positivos o negativos con apariencia de certeza.
- Ambiguedad funcional: la etiqueta backdoor-detection no especifica el tipo de puerta trasera, el formato de salida ni el umbral de decision; cualquier uso como clasificador exige calibracion y validacion con datos propios.
- Sesgos: no documentados; al heredar el modelo base, es esperable que arrastre sesgos presentes en sus datos de entrenamiento, aunque no hay informacion concreta al respecto.
- Idiomas y contexto: se desconocen la ventana de contexto real y la cobertura idiomatica, por lo que no se debe asumir soporte fiable de contextos largos ni de castellano sin pruebas previas.
- Licencia: se declara Apache 2.0 para este repositorio, pero el modelo base es de Google y su licencia no se detalla en la informacion; conviene verificar la compatibilidad antes de un uso comercial.
- Acceso restringido: el repositorio es gated, lo que anade friccion a la descarga y a la integracion en pipelines automatizados.
- Madurez: cero descargas y cero likes en el momento de la consulta, actualizado pocas horas despues de su creacion; es un artefacto sin validacion por parte de la comunidad.
- Seguridad: usar un modelo especializado en deteccion de backdoors como componente de seguridad sin evaluacion independiente puede dar una falsa sensacion de proteccion.

## Enlaces

- HuggingFace: https://huggingface.co/qiusizhan/PersistBD-Gemma4-12B-clean-20261022
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
