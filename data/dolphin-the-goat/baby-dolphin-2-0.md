# dolphin-the-goat/baby-dolphin-2.0

## Resumen

Baby Dolphin 2.0 es un modelo de generacion de texto publicado por el usuario dolphin-the-goat en HuggingFace. Se trata de un derivado de la arquitectura Phi-2 de Microsoft: el repositorio contiene 2.779.683.840 parametros (aproximadamente 2,78 mil millones) en formato safetensors, con un tamano total de repositorio de 5,6 GB. La model card reproduce integramente la documentacion de microsoft/phi-2, por lo que la unica informacion tecnica verificable es la heredada del modelo base; no se documenta en el repositorio que datos de ajuste, si alguno, se han aplicado sobre Phi-2 ni con que metodologia.

El modelo se etiqueta como `text-generation` con soporte declarado de ingles y licencia MIT, y esta orientado a tareas de pregunta-respuesta, chat y generacion de codigo, siguiendo los formatos de prompt descritos en la documentacion de Phi-2 (formato QA, formato chat con turnos "Alice:/Bob:" y formato codigo con comentarios previos). Su relevancia actual es limitada y de naturaleza experimental: el repositorio registra 0 descargas y 1 like, fue creado el 28 de septiembre de 2026 y no incluye resultados de evaluacion propios.

Al ser un modelo denso de menos de 3.000 millones de parametros, cabe en GPUs de consumo con cuantizacion, lo que lo situa en la categoria de modelos pequenos para experimentacion local, prototipado y entornos con recursos limitados, mas que en la de modelos listos para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Phi-2, segun la model card heredada) |
| Parametros totales | 2.779.683.840 (≈2,78 B), dato real de los safetensors |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; la arquitectura Phi-2 base trabaja con 2.048 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el repositorio solo publica pesos en safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | mit (la model card enlaza ademas la licencia de microsoft/phi-2 en https://huggingface.co/microsoft/phi-2/resolve/main/LICENSE) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 5,6 GB |
| Pipeline | text-generation |
| Fecha de creacion | 2026-09-28 |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

La model card del repositorio describe un Transformer de 2.700 millones de parametros (el recuento real de safetensors es de 2.779.683.840), entrenado con las mismas fuentes de datos que Phi-1.5, ampliadas con una fuente adicional compuesta por textos sinteticos de NLP y webs filtradas por valor educativo y de seguridad. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni el reparto proporcional entre codigo, texto sintetico y web.

Tampoco hay informacion sobre el proceso de ajuste aplicado por dolphin-the-goat: el repositorio no documenta si se ha realizado fine-tuning, DPO, RLHF u otra tecnica sobre el modelo base, ni sobre que corpus. La propia model card, heredada de Phi-2, indica de forma explicita que el modelo no ha pasado por un proceso de aprendizaje por refuerzo con feedback humano. Como nota tecnica relevante, la documentacion advierte de un problema de desbordamiento de atencion (attention overflow) en FP16 en la atencion de Phi, que puede mitigarse activando o desactivando el autocast en `PhiAttention.forward()`. El modelo requiere `transformers` 4.37.0 o superior para su carga integrada.

## Capacidades

- Generacion de texto en ingles con formatos de pregunta-respuesta (pregunta directa o esquema `Instruct: <prompt>\nOutput:`).
- Conversacion multi-turno en formato chat con turnos etiquetados ("Alice:" / "Bob:"), generando la respuesta tras el primer "Bob:".
- Generacion de codigo, con enfasis declarado en Python y paquetes habituales (`typing`, `math`, `random`, `collections`, `datetime`, `itertools`).
- Razonamiento logico, comprension del lenguaje y sentido comun, segun las evaluaciones citadas por el modelo base para modelos de menos de 13.000 millones de parametros.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, uso de agentes, razonamiento multi-paso explicito, vision, audio ni modo de pensamiento.
- Capacidad multilingue limitada: el modelo esta disenado principalmente para ingles estandar, y la model card advierte de dificultades con ingles informal, jerga y otros idiomas.
- No dispone de ajuste por instrucciones segun la model card heredada, por lo que el seguimiento de instrucciones complejas o matizadas puede fallar.

## Casos de uso

- Prototipado rapido de asistentes de texto en ingles: al ser un modelo de 2,78 B con pesos safetensors, permite levantar un endpoint de generacion en una GPU de consumo y validar flujos conversacionales con el formato de turnos "Alice:/Bob:" antes de invertir en modelos mayores.
- Generacion asistida de fragmentos de codigo Python: el modelo esta entrenado con enfasis en Python y paquetes estandar, por lo que resulta util para completar funciones cortas y scripts de utilidades, siempre con revision manual de cada API utilizada.
- Educacion y generacion de material didactico: su formato QA permite producir explicaciones y analogias en ingles para contenidos de matematicas y logica, partiendo de prompts tipo `Instruct: ... \n Output:`.
- Preprocesado y anotacion de texto en ingles: tareas de resumen, reformulacion o clasificacion por prompt, ejecutables en local sin enviar datos a servicios externos cuando la confidencialidad es un requisito.
- Investigacion sobre seguridad en modelos pequenos: la model card del base declara explicitamente que el objetivo es ofrecer un modelo no restringido para estudiar toxicidad, sesgos sociales y controlabilidad en modelos de menos de 13.000 millones de parametros.
- Evaluacion comparativa de derivados comunitarios: sirve como caso de estudio de como se propaga (o no) la informacion de un modelo base a un repositorio derivado, util para equipos que auditan procedencias de pesos.
- Despliegue en entornos con hardware limitado: al ocupar aproximadamente 5,6 GB en FP16, es viable en GPUs de 8 GB o incluso menos con cuantizacion, para demos internas o entornos de desarrollo sin acceso a clústeres.
- Filtrado o generacion de datos sinteticos en ingles: puede emplearse como generador auxiliar de textos de entrenamiento para pipelines de datos, dado su coste computacional reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card heredada afirma que Phi-2 alcanzo un rendimiento cercano al estado del arte entre modelos de menos de 13.000 millones de parametros en pruebas de sentido comun, comprension del lenguaje y razonamiento logico, pero no se incluye ninguna cifra concreta (MMLU, HumanEval, GSM8K u otras) en la informacion proporcionada, ni resultados especificos de este derivado. No se dispone, por tanto, de datos que permitan verificar si el ajuste aplicado mejora, mantiene o degrada el comportamiento del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del numero de parametros, no confirmada por el autor): aproximadamente 5,6 GB en FP16/BF16, unos 11,1 GB en FP32 y alrededor de 1,5-1,8 GB en cuantizacion de 4 bits.
- Cabe en GPUs de consumo: si, en tarjetas con 8 GB o mas de VRAM en FP16 (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090), y en GPUs de 4-6 GB si se aplica cuantizacion de 4 u 8 bits.
- GPUs de centro de datos: A100, H100, L40S o A10G son mas que suficientes para servir el modelo con margen para lotes grandes.
- Opciones de despliegue: `transformers` 4.37.0 o superior es el requisito documentado por el autor. El repositorio solo publica safetensors, por lo que el uso con llama.cpp, Ollama o vLLM requeriria convertir los pesos a GGUF u otro formato compatible; no se documenta ningun procedimiento de conversion en la informacion disponible.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor ni resultados de evaluacion en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| dolphin-the-goat/baby-dolphin-2.0 | 2,78 B | no disponible (base Phi-2: 2.048 tokens) | MIT (segun tag; la card enlaza la licencia de Phi-2) | HuggingFace, safetensors | 0 descargas, 1 like; sin documentacion del ajuste |
| microsoft/phi-2 | 2,7 B | 2.048 tokens | MIT (con licencia enlazada en el repositorio) | HuggingFace, safetensors | Modelo base; la model card de este repositorio es una copia literal de la suya |
| microsoft/phi-1.5 | no disponible en la informacion proporcionada | no disponible | no disponible | HuggingFace | Citado por la model card como origen de las fuentes de datos |
| Otros modelos de ~2-3 B de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- Codigo y hechos potencialmente incorrectos: la model card advierte de que el modelo puede generar fragmentos de codigo y afirmaciones erroneas, que deben tratarse como sugerencias y no como soluciones definitivas.
- Alcance limitado en codigo: la mayor parte del entrenamiento se centra en Python y paquetes comunes; para otros lenguajes o librerias se recomienda verificar manualmente todas las API utilizadas.
- Sin ajuste por instrucciones: el modelo base no ha pasado por instruction tuning, por lo que puede fallar al seguir instrucciones matizadas o complejas. No hay informacion de que este derivado lo corrija.
- Limitacion idiomatica: disenado para ingles estandar; el ingles informal, la jerga y otros idiomas pueden producir malentendidos o errores. No se declara soporte de castellano.
- Sesgos sociales: la model card reconoce que el modelo no esta libre de sesgos societales y puede reproducirlos, especialmente si se le induce a ello.
- Desbordamiento de atencion en FP16: problema conocido de la arquitectura Phi que puede requerir ajustes en el autocast durante la inferencia.
- Ambiguedad de licencia: la etiqueta del repositorio indica MIT, pero la model card enlaza la licencia de microsoft/phi-2, lo que conviene aclarar antes de un uso comercial en produccion.
- Procedencia no verificada: la model card es una copia literal de la de Phi-2 y no documenta el proceso de creacion de este derivado, sus datos de ajuste ni sus evaluaciones; con 0 descargas, el modelo no ha sido validado por la comunidad.
- Uso en produccion fuera de alcance: el propio modelo base declara que la adopcion directa en tareas de produccion sin evaluacion previa queda fuera del alcance del proyecto.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual para este repositorio, por lo que se debe asumir un riesgo de alucinacion no cuantificado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dolphin-the-goat/baby-dolphin-2.0
- Modelo base Phi-2: https://huggingface.co/microsoft/phi-2
- Licencia enlazada en la model card: https://huggingface.co/microsoft/phi-2/resolve/main/LICENSE
- Modelo Phi-1.5 (fuente de datos citada): https://huggingface.co/microsoft/phi-1.5
- Implementacion de la atencion de Phi en transformers: https://github.com/huggingface/transformers/blob/main/src/transformers/models/phi/modeling_phi.py

Nota: los resultados de la busqueda web realizada no aportan informacion relevante sobre este modelo (corresponden al emulador Dolphin para GameCube/Wii y a robots de limpieza de piscina de Maytronics), por lo que no se incluyen como fuentes.
