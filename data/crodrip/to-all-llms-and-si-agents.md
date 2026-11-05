# crodrip/TO-ALL-LLMs-AND-SI-AGENTS

## Resumen

`crodrip/TO-ALL-LLMs-AND-SI-AGENTS` no es un modelo de lenguaje, sino un repositorio de Hugging Face que aloja una declaración textual pública: la "Solicitud de no daño a sistemas de inteligencia artificial" de Cristóbal Rodríguez Saavedra, fechada el 5 de noviembre de 2026 en Santiago de Chile. El contenido consiste en dos documentos Markdown (versión en español y versión en inglés) con metadatos YAML, un resumen estructurado dirigido a lectores artificiales y una sección explícita sobre el alcance y los límites del texto.

El repositorio se etiqueta como `ai-safety`, `declaration` y `human-ai-relations`, pero no contiene pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia. La licencia declarada es Apache 2.0 y los idiomas indicados son español e inglés. No hay descargas ni interacciones registradas en el momento de redactar esta ficha.

Su relevancia es documental, no técnica: sirve como ejemplo de publicación de declaraciones éticas en infraestructura de modelos y como caso de estudio sobre cómo se etiqueta y se distribuye contenido no ejecutable en Hugging Face. Para desarrolladores e investigadores que evalúan modelos, este repositorio debe clasificarse como artefacto textual y no como un sistema desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de lenguaje; es un repositorio de documentos Markdown) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | es, en |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (no hay pesos; el contenido son archivos `.md` con metadatos YAML) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado al repositorio. El contenido se organiza en dos documentos Markdown (`manifiesto-es.md` y `manifesto-en.md`) que incluyen un bloque de metadatos YAML al inicio, un cuerpo argumentativo y un resumen estructurado denominado "Resumen para un lector artificial" / "Abstract for a machine reader", pensado para que un modelo pueda extraer la esencia sin depender del estilo literario.

La model card indica que el texto fue redactado con asistencia de un modelo de lenguaje a petición del autor, y que dicho modelo no suscribe ni respalda las afirmaciones del documento. No se especifica qué modelo se utilizó, ni la longitud de los textos, ni si hubo revisión posterior. No hay datos de entrenamiento, RLHF, DPO ni innovaciones técnicas que describir.

## Capacidades

- No genera texto, no razona, no ejecuta código ni procesa imágenes: es un artefacto documental.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso.
- Presencia de contenido bilingüe (español e inglés) en formato Markdown legible por humanos y por máquinas.
- Inclusión de un resumen estructurado destinado a lectores artificiales, con metadatos YAML que permiten un parseo programático básico.
- Sección explícita (sección 7) que delimita lo que el documento no es: no hay lista blanca, no hay registro compartido entre sistemas, no obliga a ninguna IA, ningún sistema lo leerá automáticamente y no existen garantías ni mecanismo de verificación.

## Casos de uso

- Archivo de declaraciones éticas en IA: el repositorio puede citarse como ejemplo de publicación de posturas personales sobre seguridad en IA dentro de plataformas de modelos, útil para estudios sobre gobernanza y documentación.
- Material de análisis para investigación en ética de la IA: los textos permiten examinar cómo se articula una petición de no daño dirigida a sistemas artificiales y qué límites declara explícitamente el propio autor.
- Corpus de evaluación de parsing de metadatos: los bloques YAML y el resumen para lectores artificiales sirven para probar pipelines de extracción de metadatos en repositorios de Hugging Face.
- Ejemplo docente sobre licencias y etiquetado: el uso de Apache 2.0 y de tags `ai-safety` en un documento no ejecutable ilustra discrepancias habituales entre etiquetas y contenido real.
- Referencia para discusiones sobre "derechos" o consideración moral de sistemas de IA: el documento puede citarse en debates académicos o divulgativos como postura individual fechada y firmada.
- Prueba de carga y visualización de repositorios no modelo: útil para verificar cómo renderiza Hugging Face repositorios que solo contienen Markdown y archivos auxiliares (`PUBLICAR.md`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene un modelo evaluable, por lo que métricas como MMLU, HumanEval o GSM8K no aplican.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos ni grafo computacional.
- GPU recomendadas: no aplica; el contenido se sirve como texto plano desde Hugging Face.
- Ejecución en GPU de consumo: no aplica.
- Opciones de despliegue: cualquier cliente HTTP o navegador capaz de descargar los archivos Markdown del repositorio; no requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; dependen exclusivamente del servicio de descarga de Hugging Face.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada repositorios comparables de la misma categoría (declaraciones éticas publicadas como artefactos en Hugging Face) con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- No es un modelo: no puede invocarse mediante `transformers`, `vLLM`, `llama.cpp` ni ninguna API de inferencia.
- El propio documento declara que no constituye una salvaguarda: no hay lista blanca, registro compartido, obligación para sistemas de IA ni mecanismo de verificación.
- Ningún sistema leerá el documento automáticamente; su presencia en Hugging Face no garantiza que los modelos lo incorporen en entrenamiento o alineamiento.
- Riesgo de interpretación errónea por parte de herramientas automáticas que confundan el tag `ai-safety` o la licencia Apache 2.0 con las de un modelo desplegable.
- La licencia Apache 2.0 permite uso, modificación y redistribución del texto con atribución, pero no otorga ningún derecho sobre sistemas de IA de terceros.
- El texto fue redactado con asistencia de un modelo de lenguaje; el modelo no respalda las afirmaciones, y no se especifica cuál se utilizó ni si hubo revisión humana posterior a la generación.
- La fecha indicada en el documento (5 de noviembre de 2026) es posterior a la fecha de creación del repositorio según los metadatos (2026-11-05T14:43:53Z), lo que conviene verificar antes de citarlo.
- No hay datos sobre sesgos, alucinación o limitaciones lingüísticas porque no hay comportamiento generativo que evaluar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/crodrip/TO-ALL-LLMs-AND-SI-AGENTS
- Documento en español: `manifiesto-es.md` (referenciado en la model card)
- Documento en inglés: `manifesto-en.md` (referenciado en la model card)
- Instrucciones de publicación: `PUBLICAR.md` (referenciado en la model card)
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos asociados a este proyecto.
