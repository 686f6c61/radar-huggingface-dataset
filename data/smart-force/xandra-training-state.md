# smart-force/xandra-training-state

## Resumen

Xandra Hope es un modelo de lenguaje presentado por smart-force bajo la identidad de Xandra Flow, descrito por sus autores como un "modelo linguistico arabe soberano" orientado a ingenieria, programacion, ingenieria inversa, agricultura y educacion. Segun la model card, cuenta con 80,84 millones de parametros, una dimension de embedding de 256 y solo 4 capas, lo que lo situa en la categoria de modelos pequenos (tipo nano o micro), muy lejos de los grandes modelos generativos actuales.

El repositorio publicado (`smart-force/xandra-training-state`) tiene un tamano de 1,9 GB y esta etiquetado con la libreria `transformers`, lo que sugiere pesos en formato compatible con el ecosistema Hugging Face. Sin embargo, no se especifica la arquitectura concreta (transformer, MoE, SSM u otra), ni el volumen de datos de entrenamiento, ni procesos de alineacion como RLHF o DPO. La model card menciona de forma generica una "arquitectura innovadora inspirada en la filosofia arabe clasica", sin detallar sus componentes tecnicos.

La relevancia actual del modelo es limitada: se trata de un proyecto con cero descargas y cero likes en el momento de la consulta, con una licencia propia (XHNSL v1.0) que prohibe el uso comercial sin permiso escrito. Su interes principal es documental, como ejemplo de iniciativas de "IA soberana" en el mundo arabe, mas que como herramienta lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la model card solo indica "arquitectura innovadora inspirada en la filosofia arabe clasica") |
| Parametros totales | 80,84 millones |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Arabe (ar), ingles (en), ruso (ru) |
| Licencia | XHNSL v1.0 (licencia propia; uso personal, educativo y de investigacion permitido; uso comercial prohibido sin permiso escrito) |
| Formato de pesos | No disponible (repo de 1,9 GB en `transformers`; no se confirma safetensors ni GGUF) |
| Dimension de embedding | 256 |
| Numero de capas | 4 |
| Tamano del repositorio | 1,9 GB |

## Arquitectura y entrenamiento

La informacion disponible no permite reconstruir la arquitectura interna del modelo. La model card afirma que se basa en una "arquitectura innovadora" inspirada en la filosofia arabe clasica, pero no especifica si se trata de un transformer decoder-only, un modelo MoE, una arquitectura hibrida con SSM o cualquier otra variante. Los unicos datos estructurales confirmados son 80,84 millones de parametros, 256 dimensiones y 4 capas, una configuracion extremadamente compacta que sugiere un modelo de tipo "toy" o experimental mas que un LLM de proposito general.

Tampoco se detalla el corpus de entrenamiento: no hay cifras de tokens, ni composicion del dataset, ni mencion a tecnicas de alineacion como RLHF, DPO o instruction tuning. No se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o modos de razonamiento extendido. Cualquier afirmacion adicional sobre el entrenamiento seria especulativa y no debe asumirse.

## Capacidades

- Generacion de texto en arabe, ingles y ruso, segun los idiomas declarados en la model card.
- Orientacion declarada a dominios especificos: ingenieria, arquitectura, programacion, ingenieria inversa, agricultura y educacion.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de vision, audio ni modo de pensamiento (thinking mode).
- No se documentan capacidades matematicas ni de codigo verificadas mediante benchmarks.

## Casos de uso

- Experimentacion academica sobre IA soberana en lengua arabe: el modelo puede servir como base para estudiar como se posicionan iniciativas regionales de modelos lingueisticos, dado su caracter declaradamente soberano y su licencia restrictiva.
- Prototipado docente en cursos de NLP: con 80,84 millones de parametros y 4 capas, es viable ejecutarlo en entornos con recursos muy limitados para ilustrar el ciclo completo de carga, inferencia y evaluacion con `transformers`.
- Pruebas de integracion en pipelines de Hugging Face: el repo es compatible con `transformers`, por lo que puede usarse para validar flujos de descarga, tokenizacion y generacion en infraestructura propia.
- Investigacion sobre licencias de IA: la licencia XHNSL v1.0 y la prohibicion de uso comercial lo convierten en un caso de estudio sobre modelos de licencia propia en el ecosistema open source.
- Generacion de texto exploratoria en arabe para tareas de baja exigencia: dado su tamano, podria emplearse en demostraciones de completado de texto simple, siempre que se valide la calidad con evaluaciones propias.
- Base para fine-tuning experimental en dominios concretos: al ser un modelo pequeno, permite iterar rapidamente en ajuste fino supervisado sobre datasets reducidos, aunque la licencia limita el uso comercial del resultado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 80,84 millones de parametros, los pesos en fp32 ocuparian aproximadamente 0,32 GB; en fp16, unos 0,16 GB; en int8, unos 0,08 GB. El repositorio de 1,9 GB sugiere que puede incluir estados de entrenamiento u otros artefactos adicionales.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o incluso una GTX 1650 podrian alojar el modelo sin problemas.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con al menos 2 GB de VRAM, y probablemente en CPU para inferencia basica.
- Opciones de despliegue: `transformers` es la libreria declarada; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con modelos de la misma categoria. Los modelos de ~80 millones de parametros y 4 capas son poco comunes en el ecosistema actual de LLM; las alternativas tipicas de ese orden de magnitud (por ejemplo, modelos tipo GPT-2 small o variantes destiladas) no se han documentado en la informacion proporcionada, y no se conocen resultados de benchmarks de Xandra Hope que permitan una comparacion objetiva.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Xandra Hope | 80,84 M | No disponible | XHNSL v1.0 (comercial restringido) | Hugging Face, 0 descargas |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Con 80,84 millones de parametros y 4 capas, la capacidad de razonamiento, codigo y matematicas es previsiblemente muy limitada en comparacion con LLM modernos; no debe asumirse un rendimiento de proposito general.
- No se han publicado benchmarks, por lo que no existe evidencia publica de calidad en ninguna tarea.
- La model card no detalla el corpus de entrenamiento, lo que impide evaluar sesgos, contaminacion de datos o cobertura idiomatica real.
- Riesgo de alucinacion: no cuantificado, pero esperable en un modelo de este tamano y sin documentacion de alineacion.
- La licencia XHNSL v1.0 prohibe el uso comercial sin autorizacion escrita previa, lo que limita su adopcion en productos y servicios.
- El modelo tiene cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- La model card incluye afirmaciones de marketing ("soberano", "arquitectura innovadora inspirada en la filosofia arabe clasica") sin respaldo tecnico documentado.
- No se confirma el formato exacto de los pesos ni la compatibilidad con herramientas de despliegue habituales (vLLM, llama.cpp, Ollama, TGI).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/smart-force/xandra-training-state
- Licencia XHNSL v1.0: https://github.com/Xandra-Flow/xandra-maestro/blob/main/LICENSE
- Sitio web del autor: https://xandraflow.com
- GitHub del autor: https://github.com/Xandra-Flow
- Contacto: ahmed.kamel@xandraflow.com
