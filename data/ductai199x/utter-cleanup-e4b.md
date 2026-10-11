# ductai199x/utter-cleanup-e4b

## Resumen

Utter cleanup e4b es un modelo de limpieza de dictado desarrollado por ductai199x (Tai Duc Nguyen), autor de la aplicación local de dictado por voz Utter. Su función no es transcribir, sino recibir la salida cruda de un reconocedor de voz (NVIDIA Parakeet) y devolver el texto que el hablante pretendía escribir: con puntuación y mayúsculas que nadie pronunció, símbolos y números en su forma escrita ("four x faster" pasa a "4× faster"), muletillas eliminadas, autocorrecciones aplicadas y listas convertidas en viñetas o pasos numerados.

Técnicamente es un ajuste fino por LoRA (rango 16, alpha 32, learning rate 2e-4, una época) sobre el checkpoint QAT sin cuantizar de Google Gemma 4 E4B, posteriormente fusionado y cuantizado a Q4_0, el formato para el que el QAT del modelo base fue entrenado. El resultado es un modelo de 7.463.013.674 parámetros (aproximadamente 7,46 mil millones) que ocupa unos 3,3 GB de VRAM en inferencia cuando las per-layer embeddings permanecen en la RAM del sistema.

Su relevancia es práctica: resuelve un problema muy concreto del pipeline de dictado local (normalización y corrección del texto reconocido) con un modelo pequeño que cabe en hardware de consumo, y lo hace sin depender de APIs en la nube. Los datos de entrenamiento son 66.981 pares de (salida del reconocedor, texto pretendido) y la licencia Apache 2.0 permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4 E4B, ajustado con LoRA); entrenamiento QAT en el modelo base |
| Parametros totales | 7.463.013.674 (aproximadamente 7,46 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (GGUF); adaptador LoRA sin cuantizar en safetensors |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) y GGUF (Q4_0) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-e4b-it-qat-q4_0-unquantized`, un checkpoint de Google con entrenamiento consciente de cuantizacion (QAT) orientado a Q4_0. Sobre él se aplicó un LoRA de rango 16 con alpha 32, learning rate 2e-4 y una sola época; después el adaptador se fusionó en los pesos base y el conjunto se cuantizó a Q4_0, formato coherente con el QAT previo. La nomenclatura E4B y el uso de per-layer embeddings en el modelo base indican un diseño optimizado para reducir el coste de memoria en inferencia, delegando parte de esas embeddings a la RAM del sistema.

El dataset de entrenamiento consta de 66.981 pares de (salida del reconocedor, texto pretendido). El lado escrito procede de pasajes reales de Common Pile (Stack Exchange, GitHub, resúmenes de arXiv, IRC de Ubuntu) y Wikipedia, más listas de las mismas fuentes y listas cotidianas generadas por un LLM. El lado hablado lo generó Gemma 4 26B-A4B en ocho modalidades distintas (dictado plano, puntuación hablada, disfluencias, autocorrección, orden de retracción, reformulación de frase, errores gramaticales y edición hacia atrás), con verificación por código, síntesis de voz con Kokoro TTS y reconocimiento con Parakeet. Las claves de respuesta se corrigieron manualmente/automáticamente para erratas y gramática, validando cada corrección con ERRANT. No hubo solapamiento entre pasajes de evaluación y de entrenamiento.

## Capacidades

- Normalizacion de dictado: inserta puntuación y mayúsculas no pronunciadas y convierte símbolos y números hablados a su forma escrita ("about two forty" a "~240").
- Eliminacion de muletillas y arranques falsos, manteniendo las palabras propias del hablante.
- Aplicacion de correcciones habladas: "at 2, actually 3" y comandos de retraccion como "scratch that" (última frase) o "let's start over" (todo).
- Ediciones hacia atras ("far-back edits"): permite modificar contenido mencionado mucho antes en el dictado, por ejemplo "actually, change the eggs to three boxes".
- Formateo de listas habladas como viñetas, con numeración cuando se trata de pasos.
- Correccion gramatical limitada, reformulando dentro de las palabras del hablante.
- Soporte de contexto auxiliar: lineas de aplicacion, texto previo al cursor, estado de listas y diccionario personalizado.
- Capacidad multilingue: no disponible; el modelo solo declara ingles.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking: debe desactivarse explicitamente (`enable_thinking: false`); la respuesta es solo el texto limpiado.

## Casos de uso

- Dictado local en aplicaciones de escritorio: integrado en Utter, el modelo recibe la transcripcion de Parakeet y devuelve texto listo para insertar en el campo de escritura, con un consumo de unos 3,3 GB de VRAM que permite ejecutarlo en un portatil con GPU de gama media.
- Redaccion de correos por voz: las lineas de contexto "App: email" y "Before: ..." permiten que el modelo respete el estilo de correo y el texto ya escrito antes del cursor, generando parrafos coherentes sin cambiar la formulacion del usuario.
- Notas de reunion convertidas en listas de tareas: la deteccion de listas habladas (45,9% de dictados de lista sin necesidad de edicion en la evaluacion) permite transformar un monologo en viñetas o pasos numerados.
- Documentacion tecnica dictada: con el diccionario personalizado ("Dictionary: Utter, Nguyen") se preservan nombres propios y terminos de proyecto, util para desarrolladores que redactan issues o comentarios de codigo por voz.
- Post-proceso de transcripciones ASR en lote: cualquier pipeline con un reconocedor previo (Parakeet u otro) puede usar este modelo como etapa de normalizacion y correccion antes de indexar o publicar el texto.
- Asistentes de accesibilidad: personas con movilidad reducida que dictan texto largo se benefician de la aplicacion de autocorrecciones y comandos de retraccion sin volver a escribir, y de la eliminacion de disfluencias.
- Limpieza de subtitulos y actas: al eliminar arranques falsos y normalizar numeros y simbolos, el texto resultante es mas adecuado para subtitulado o para documentos de actas.

## Benchmarks y rendimiento

La model card publica una evaluacion sobre dictados reservados; cada celda indica porcentaje sin necesidad de edicion / porcentaje de caracteres a corregir.

| Conjunto de prueba | Gemma 4 E4B, con prompt | Gemma 4 26B-A4B, con prompt | Este modelo |
|---|---|---|---|
| Principal (4309) | 7,2% / 18,0% | 11,3% / 7,7% | 18,5% / 3,6% |
| Principal, voces no vistas (4309) | 6,8% / 19,0% | 10,6% / 8,8% | 16,3% / 4,9% |
| Errores gramaticales (688) | 5,4% / 6,3% | 6,7% / 5,7% | 11,8% / 4,1% |
| Listas (897) | 2,7% / 11,4% | 3,2% / 11,7% | 45,9% / 3,8% |
| Ediciones hacia atras (1268) | 3,2% / 29,2% | 4,8% / 22,3% | 39,1% / 4,3% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3,3 GB segun el autor, siempre que las per-layer embeddings permanezcan en la RAM del sistema (GGUF Q4_0).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM libre para el modelo cuantizado; no se especifican modelos concretos en la documentacion.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas de VRAM (por ejemplo, RTX 3060, RTX 4060 o superiores), gracias a la cuantizacion Q4_0 y al uso de RAM del sistema para embeddings.
- Opciones de despliegue: llama.cpp en version b11535 o posterior (formato principal, GGUF Q4_0); tambien es posible cargar el adaptador LoRA en safetensors sobre el checkpoint base para fusionarlo o continuar el entrenamiento. No se confirma soporte oficial para vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| utter-cleanup-e4b | 7,46 mil millones | no disponible | 18,5% sin edicion / 3,6% caracteres (conjunto principal) | Apache 2.0 | HuggingFace (GGUF y safetensors) |
| Gemma 4 E4B (con prompt) | no disponible (mismo base) | no disponible | 7,2% sin edicion / 18,0% caracteres | Apache 2.0 (modelo base) | HuggingFace |
| Gemma 4 26B-A4B (con prompt) | 26 mil millones totales, 4 mil millones activos | no disponible | 11,3% sin edicion / 7,7% caracteres | Apache 2.0 (modelo base) | HuggingFace |

No se dispone de comparativas con otros modelos de limpieza de dictado en la informacion proporcionada.

## Limitaciones y advertencias

- Cobertura gramatical incompleta: persisten errores de caso pronominal y preposiciones, segun reconoce el propio autor.
- Evaluacion con voz sintetica: los conjuntos de prueba usan dos motores TTS (Kokoro) y reconocimiento Parakeet, no dictado grabado con microfono real, por lo que el rendimiento en condiciones reales puede diferir.
- Idioma unico: el modelo solo declara soporte de ingles; no hay datos sobre comportamiento en castellano u otros idiomas.
- Prompt de sistema obligatorio: debe usarse exactamente la cadena indicada en la model card; el modelo base tiene las reglas en los pesos, pero alterar el system prompt puede degradar el resultado.
- Thinking debe desactivarse: hay que pasar `chat_template_kwargs: {"enable_thinking": false}`; de lo contrario la respuesta puede incluir razonamiento en lugar del texto limpio.
- Riesgo de alucinacion: no se documenta explicitamente, pero al ser un modelo generativo puede reescribir o inventar contenido al "corregir" el dictado, especialmente en ediciones hacia atras (39,1% sin edicion implica que en la mayoria de casos si hubo modificaciones).
- Licencia: Apache 2.0, permite uso comercial, pero el texto de entrenamiento proviene de fuentes con licencias abiertas (dominio publico, CC0, CC BY-SA, MIT, Apache 2.0) y deben respetarse las condiciones de atribucion de las fuentes CC BY-SA si se redistribuye el modelo derivado.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion externa de su comportamiento en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ductai199x/utter-cleanup-e4b
- Repositorio de la aplicacion Utter: https://github.com/ductai199x/utter
- Perfil de HuggingFace del autor: https://huggingface.co/ductai199x
- Repositorios de GitHub del autor: https://github.com/ductai199x?tab=repositories
- Portafolio del autor en Devpost: https://devpost.com/ductai199x
- Proyecto Forensic Self-Descriptions (CVPR 2025) del autor: https://github.com/ductai199x/Forensic-Self-Descriptions-CVPR25
