# orcarouter/Qwen3.8-27B-Uncensored-GGUF

## Resumen

Qwen3.8-27B-Uncensored-GGUF es una cuantización en formato GGUF del modelo Qwen3.8-27B de Alibaba Qwen, publicada por el usuario orcarouter en Hugging Face. Se trata de una variante "abliterated" (técnica de edición de pesos que elimina o atenúa la dirección de rechazo en el espacio de activaciones) orientada explícitamente a red-teaming y pruebas de seguridad de IA, según declaran sus propias etiquetas. El modelo conserva la pipeline image-text-to-text del original, lo que indica capacidades multimodales, e incluye artefactos auxiliares como `mmproj` (proyector visión-lenguaje) y `mtp` (multi-token prediction).

El modelo base cuenta con 27.320.697.856 parámetros (unos 27,3 mil millones) y está publicado bajo licencia Apache 2.0, con soporte declarado de inglés y chino. La relevancia de esta ficha radica en que combina tres elementos poco habituales en un mismo paquete: cuantización GGUF para inferencia local con llama.cpp, capacidades de visión y una modificación deliberada de los mecanismos de rechazo, lo que la convierte en una pieza útil para investigación en alineamiento y evaluación de robustez, pero problemática para despliegues de producción convencionales.

El repositorio ocupa 288,4 GB, lo que refleja la presencia de múltiples niveles de cuantización en un mismo espacio. El acceso está restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B; detalles específicos de atención no disponibles) |
| Parametros totales | 27.320.697.856 (27,3 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (múltiples niveles; niveles concretos no disponibles), con artefactos mmproj y mtp |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors solo como referencia del modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen3.8-27B más allá de su naturaleza transformer y de su pipeline multimodal image-text-to-text. La presencia de un fichero `mmproj` confirma que el modelo incorpora un proyector que alinea representaciones visuales con el espacio de tokens del lenguaje, y la etiqueta `mtp` sugiere soporte de multi-token prediction, técnica de decodificación especulativa que permite proponer varios tokens por paso y acelerar la generación. No se han publicado en la información proporcionada datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La modificación principal respecto al original es la abliteración: una intervención sobre los pesos que busca neutralizar la dirección de activación asociada al rechazo de peticiones. Esta técnica no reentrena el modelo, sino que edita las matrices de proyección para eliminar la componente que induce respuestas de negativa. El resultado es un modelo con menor tendencia a declinar solicitudes, lo que explica su orientación declarada a ai-red-team y red-teaming. No se dispone de información sobre el proceso exacto de abliteración aplicado ni sobre posibles evaluaciones de degradación de capacidades tras la edición.

## Capacidades

- Generación de texto conversacional multi-turno, con etiqueta `conversational` en el repositorio.
- Razonamiento explícito: la etiqueta `reasoning` indica soporte de modos de pensamiento o cadenas de razonamiento.
- Capacidades multimodales de imagen a texto (pipeline image-text-to-text), con proyector `mmproj` incluido.
- Function calling y tool calling, según la etiqueta `function-calling`.
- Decodificación con multi-token prediction (`mtp`), orientada a acelerar la inferencia.
- Soporte multilingüe limitado a inglés y chino.
- Comportamiento "uncensored": menor probabilidad de rechazar peticiones, por diseño.
- Compatibilidad con llama.cpp y con endpoints compatibles (`endpoints_compatible`).
- Cuantización con imatrix, lo que sugiere calibración de cuantización basada en matrices de importancia.

## Casos de uso

- Red-teaming y evaluación de seguridad: el modelo permite generar respuestas que un modelo alineado rechazaría, lo que facilita la construcción de conjuntos de pruebas adversarios y la evaluación de filtros de contenido en pipelines de moderación.
- Investigación en alineamiento y abliteración: comparar las respuestas de esta variante con las del Qwen3.8-27B original permite medir el efecto de la edición de pesos sobre la tasa de rechazo y sobre la calidad general.
- Análisis de documentos con componente visual: gracias al proyector `mmproj`, puede procesar capturas, diagramas o páginas escaneadas y generar descripciones o extracciones en inglés o chino.
- Asistentes conversacionales locales: al distribuirse en GGUF, puede ejecutarse con llama.cpp u Ollama en hardware de consumo, útil para prototipos de chat privados sin conexión.
- Automatización con herramientas: la etiqueta `function-calling` permite integrarlo en agentes que invocan APIs, aunque la fiabilidad del tool calling tras la abliteración no está documentada.
- Generación de datos sintéticos para entrenamiento: su menor tasa de rechazo lo hace útil para producir corpus diversos en tareas de aumento de datos, siempre con revisión posterior.
- Pruebas de robustez de clasificadores: usar sus salidas como entradas adversarias para validar sistemas de detección de contenido dañino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 27,3 mil millones de parámetros, una cuantización Q4 requiere aproximadamente 16-18 GB de VRAM; Q5 en torno a 19-21 GB; Q8 cerca de 29-30 GB; FP16 superaría los 54 GB.
- GPU recomendadas: A100 40/80 GB o H100 para FP16 y cuantizaciones altas; RTX 4090 (24 GB) para Q4/Q5 con contexto moderado; RTX 3090 (24 GB) en el mismo rango.
- GPU de consumo: sí es viable en RTX 4090, RTX 3090 y, con cuantizaciones agresivas (Q3/Q4) y contexto reducido, en tarjetas de 12-16 GB, aunque el componente visual añade consumo adicional.
- Despliegue: llama.cpp, Ollama y servidores compatibles con GGUF; el repositorio declara `endpoints_compatible`. vLLM y TGI no se mencionan en la información disponible para este formato.
- Latencia y throughput: no disponibles. La presencia de `mtp` sugiere mejoras de velocidad frente a decodificación autoregresiva estándar, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| orcarouter/Qwen3.8-27B-Uncensored-GGUF | 27,3 B | no disponible | Apache 2.0 | GGUF | Abliterated, multimodal, gated |
| Qwen/Qwen3.8-27B (base) | 27,3 B | no disponible | Apache 2.0 | safetensors | Modelo original alineado, sin modificar |
| Otras variantes abliterated de la familia Qwen | no disponible | no disponible | variable | GGUF/safetensors | No se dispone de datos concretos en la información proporcionada |

La comparación directa con alternativas de otros desarrolladores no puede realizarse con rigor porque la información proporcionada no incluye especificaciones de contexto ni resultados de evaluación de este modelo ni de sus competidores.

## Limitaciones y advertencias

- La abliteración elimina deliberadamente los mecanismos de rechazo: el modelo puede producir contenido dañino, ilegal o inseguro sin filtros internos. No es apto para aplicaciones orientadas al público sin una capa externa de moderación.
- Riesgo elevado de alucinación y de afirmaciones no verificadas, agravado por la edición de pesos, que puede degradar capacidades de razonamiento y coherencia.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- Longitud de contexto no disponible, lo que impide planificar despliegues con ventanas largas.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que añade fricción a pipelines automatizados.
- Aunque la licencia es Apache 2.0, el uso comercial de una variante abliterated conlleva riesgos reputacionales y legales según la jurisdicción y el caso de uso; conviene revisar las políticas de la plataforma de despliegue.
- El repositorio ocupa 288,4 GB, por lo que la descarga completa exige espacio en disco considerable; es preferible descargar solo el fichero de cuantización necesario.
- No hay información pública sobre evaluación de sesgos, toxicidad o degradación de capacidades tras la abliteración.

## Enlaces

- Hugging Face: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
