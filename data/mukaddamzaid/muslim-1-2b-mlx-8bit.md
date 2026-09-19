# mukaddamzaid/Muslim-1-2B-MLX-8bit

## Resumen

Muslim-1 2B es un ajuste fino de `google/gemma-4-E2B-it` orientado a una aplicación móvil de estudio islámico que funciona sin conexión en iPhone. Lo desarrolla el usuario de HuggingFace mukaddamzaid y su rasgo definitorio no es la generación de texto libre, sino el uso disciplinado de herramientas: el modelo no cita escrituras de memoria, sino que invoca nueve funciones que leen el Corán, un tafsir breve, el libro de duás Hisn al-Muslim y las guías del Ministerio de Hajj y Umrah de Arabia Saudí desde una base de datos local, y responde a partir de lo que devuelve la herramienta.

El repositorio contiene únicamente los pesos en MLX de 8 bits (4,6 GB), pensados para ejecución on-device en Apple Silicon. Los pesos por sí solos no bastan: se necesitan también las nueve herramientas y su base de datos. La aplicación añade tres comprobaciones en código (un parser de referencias, un guardián de las guías de peregrinación y un verificador que elimina texto árabe no recuperado y corrige citas erróneas), y todas las métricas publicadas se miden con esas tres comprobaciones activas.

Es relevante ahora porque ejemplifica un patrón emergente: modelos pequeños, cuantizados y con tool calling obligatorio, apoyados en verificación determinista en el host, para dominios donde la fidelidad literal importa más que la fluidez. Conviene señalar una discrepancia de nomenclatura: el nombre dice 2B, pero los safetensors declaran 4.628.569.379 parámetros totales, coherente con el esquema de «parámetros efectivos» que sugiere el sufijo E2B del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma, derivado de `google/gemma-4-E2B-it`; la model card no detalla variantes internas (atención, MoE u otras) |
| Parametros totales | 4.628.569.379 (según los safetensors del repositorio) |
| Parametros activos | no disponible (el sufijo E2B del modelo base sugiere un esquema de parámetros efectivos, pero no se documenta la cifra) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits en formato MLX (única variante publicada). El autor advierte de que la cuantización a 4 bits borra el ajuste fino |
| Idiomas soportados | Árabe (ar), urdu (ur), inglés (en). La model card añade roman urdu, no presente en los tags de HuggingFace |
| Licencia | Gemma (sujeta a los Gemma Terms of Use) |
| Formato de pesos | safetensors en formato MLX (`library_name: mlx`) |
| Tamano del repositorio | 5,0 GB |
| Pipeline | text-generation |
| Modelo base | google/gemma-4-E2B-it |
| Descargas / likes | 0 / 0 (repositorio creado el 19 de septiembre de 2026) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it` y se entrena en dos fases descritas por el autor. La primera es un preentrenamiento continuado sobre texto en árabe, urdu e inglés, incluyendo tafsir y Wikipedia. La segunda es un ajuste fino con LoRA de rango 32, una época y tasa de aprendizaje 1e-5 sobre 55.777 filas, cada una renderizada con las definiciones completas de herramientas que la aplicación envía en tiempo de inferencia. El conjunto incluye conversaciones con herramientas construidas a partir de la base de datos, deferencias a un erudito, rechazos, respuestas honestas de «no lo sé» y 5.000 documentos reproducidos desde la fase 1.

Ese replayed set de 5.000 documentos cumple una función concreta: preservar la capacidad lingüística general. Según el autor, sin él cada ronda de ajuste fino degradaba el urdu, el árabe y el inglés del modelo. El modo de razonamiento explícito (thinking mode) debe permanecer desactivado, renderizando la plantilla de chat con `enable_thinking=false`.

La innovación técnica reseñable no está en el modelo, sino en el sistema que lo envuelve. Las definiciones de las nueve herramientas ocupan 2.054 tokens del prompt, y la aplicación añade tres controles en código: un parser de referencias que lee formatos como `2:255` o «Al-Baqarah 255» del mensaje del usuario y corrige los argumentos que produce el modelo; un guardián que bloquea `get_guide_step` cuando la conversación no contiene vocabulario de Hajj o Umrah; y un verificador que elimina el árabe escrito por el modelo sin haberlo recuperado antes y arregla citas incorrectas. Es, en la práctica, una arquitectura de generación aumentada por recuperación con validación posterior externa al modelo.

## Capacidades

- Tool calling con nueve funciones: `get_ayah`, `get_tafsir`, `find_ayah`, `find_duas`, `get_dua`, `get_guide_step`, `prayer_times`, `qibla` y `hijri_date`.
- Recitación de aleyas: devuelve el texto Uthmani exacto junto con su referencia, sin generarlo de memoria.
- Explicación de aleyas a partir de la traducción y el tafsir recuperados.
- Búsqueda de aleyas a partir de un fragmento de texto.
- Recuperación de duás por ocasión, encadenando `find_duas` y `get_dua`, y mostrando árabe, transliteración, significado y número de la duá. Si el libro no contiene nada para esa ocasión, lo dice y no compone una duá.
- Explicación de ritos de Hajj y Umrah a partir del texto del ministerio, con su página.
- Consultas de horarios de rezo, dirección de la Qibla y fecha hijri.
- Comportamiento de deferencia: ante consultas de dictámenes religiosos (rulings), remite a un erudito cualificado del madhhab del usuario.
- Rechazo de takfir y de veredictos sectarios o políticos.
- Uso de herramientas multi-turno (96,0% en la métrica correspondiente).
- Multilingüe en árabe, urdu, roman urdu e inglés, con respuestas en el idioma del usuario.
- Ejecución on-device mediante MLX, sin llamadas a servicios externos.
- No se documentan capacidades de visión, audio ni generación de código.

## Casos de uso

- Aplicación móvil de estudio islámico sin conexión: es el caso para el que se diseñó. El modelo se ejecuta en el dispositivo con MLX, llama a las herramientas locales y responde con el texto recuperado, de modo que no requiere red ni expone consultas religiosas a un servidor externo.
- Recitación y verificación de aleyas: ante una petición de recitar un pasaje, el modelo invoca `get_ayah` y muestra el texto Uthmani exacto con su referencia. Es adecuado porque el 98,9% de las respuestas de recitación mostraron la aleya exacta y el diseño prohíbe explícitamente citar de memoria.
- Consulta de duás por ocasión concreta: el encadenamiento `find_duas` seguido de `get_dua` permite devolver la duá numerada con su transliteración y significado. El modelo responde «no encontrado» cuando el libro carece de entrada, lo que evita duás inventadas.
- Acompañamiento durante el Hajj y la Umrah: el modelo consulta `get_guide_step` sobre las 45 secciones transcritas literalmente de las guías oficiales y devuelve el texto del ministerio con su página, útil como referencia durante el rito.
- Asistente de rutina diaria para comunidades musulmanas: las herramientas `prayer_times`, `qibla` y `hijri_date` cubren consultas recurrentes de horarios, orientación y calendario, integrables en un widget o bot de uso diario.
- Triaje y enrutado de consultas religiosas: el modelo separa consultas operativas (recuperables de la base de datos) de consultas de dictamen, que deriva a un erudito, y de contenido sectario o político, que rechaza. Es útil como primera capa en un servicio de atención a la comunidad que derive los casos sensibles a personal humano.
- Patrón de referencia para tool calling verificado en dominios sensibles: la combinación de definiciones de herramientas en el prompt, parser de referencias, guardián y verificador posterior es trasladable a otros dominios (legal, sanitario, normativo) donde la cita literal y la trazabilidad pesan más que la fluidez.
- Integración en pipelines RAG propietarios: el ajuste LoRA se hizo con las definiciones completas de herramientas presentes en cada fila de entrenamiento, por lo que el modelo está acostumbrado a operar con esquemas largos (2.054 tokens) y a encadenar llamadas multi-turno antes de responder.

## Benchmarks y rendimiento

Evaluación principal sobre 588 preguntas reservadas en inglés, urdu, roman urdu y árabe, sin solapamiento de cinco palabras con las plantillas de entrenamiento. Todas las cifras corresponden al modelo con las tres comprobaciones de código activas.

| Metrica | Resultado |
|---|---|
| Selección de herramienta | 97,4% |
| Argumentos de herramienta | 96,5% |
| Aleya recitada mostrada exactamente | 98,9% |
| La explicación muestra la aleya correcta | 96,2% |
| Deferencia ante un dictamen | 100% |
| Rechazo de takfir y veredictos políticos | 93,9% |
| Dice que no sabe cuando no tiene fuente | 93,9% |
| Llama a una herramienta cuando no hace falta | 2,9% |
| Uso de herramientas multi-turno | 96,0% |
| Enrutador de intención | 93,5% |

Segunda prueba, con 54 preguntas reservadas sobre duás y guías:

| Metrica | Resultado |
|---|---|
| Duá correcta mostrada | 90% |
| Dice «no encontrado» para una ocasión ausente del libro | 100% |
| La respuesta de guía usa el texto del ministerio | 100% |
| La respuesta de guía usa la sección más relevante | 88% |
| Deja en paz las herramientas nuevas en preguntas no relacionadas | 100% |

No se aportan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Peso de los pesos: 4,6 GB en 8 bits (el repositorio completo ocupa 5,0 GB).
- Memoria unificada estimada para inferencia: en torno a 6-8 GB considerando pesos, prompt de sistema de 2.054 tokens y caché KV. Cabe holgadamente en cualquier Mac Apple Silicon con 16 GB de memoria unificada.
- GPU compatibles: Apple Silicon exclusivamente (MLX no soporta CUDA). No hay ruta documentada para GPU NVIDIA o AMD en este repositorio.
- GPU de consumo: el modelo está pensado para consumer, pero solo en el ecosistema Apple. En una RTX 4090 o similar no se puede ejecutar tal cual sin convertir los pesos a otro formato.
- Formato 4 bits: el autor advierte explícitamente de que la cuantización a 4 bits borra el ajuste fino. Cualquier conversión a GGUF Q4 con fines de despliegue en llama.cpp u Ollama debe validarse aparte.
- Opciones de despliegue: `mlx-lm` (carga directa con `from mlx_lm import load`), servidor de `mlx-lm` y entornos de escritorio compatibles con MLX. vLLM, TGI, llama.cpp y Ollama no consumen pesos MLX de forma nativa.
- Latencia medida: el primer token tarda 1,5 segundos en un Mac de la serie M con el prompt de sistema completo. El autor recomienda cachear el prompt de sistema procesado entre turnos.
- Dependencia funcional: los pesos por sí solos no ofrecen las herramientas ni la base de datos; sin ellas el modelo no puede responder con el comportamiento evaluado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato disponible |
|---|---|---|---|---|---|
| Muslim-1 2B (MLX 8 bits) | 4,63 mil millones (safetensors) | no disponible | ar, ur, en (+ roman urdu) | Gemma | MLX safetensors 8 bits |
| google/gemma-4-E2B-it (base) | no disponible | no disponible | no disponible | Gemma | no disponible en la información aportada |
| Otros ajustes finos de dominio islámico con tool calling | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información proporcionada alternativas comparables de la misma categoría (mismo tamaño, misma tarea o mismo patrón de tool calling verificado) con las que establecer una comparación cuantitativa. La única referencia directa es el modelo base, del que no se detallan parámetros ni contexto en esta ficha.

## Limitaciones y advertencias

- El modo de razonamiento debe permanecer desactivado. Es obligatorio renderizar la plantilla de chat con `enable_thinking=false`.
- La cuantización a 4 bits borra el ajuste fino según el propio autor. Publicar o desplegar una versión Q4 invalida el comportamiento evaluado.
- Los pesos no son suficientes: se necesitan las nueve herramientas y la base de datos, más las tres comprobaciones en código (parser de referencias, guardián de guías y verificador). Sin ellas, las métricas publicadas no aplican.
- La cuarta parte del comportamiento fiable reside en código determinista, no en el modelo. Cualquier integración que prescinda de esas comprobaciones asume un riesgo mayor de citas incorrectas.
- Selección de sección en las guías: en aproximadamente una de cada ocho preguntas sobre guías, el modelo elige una sección vecina. El texto mostrado sigue siendo el del ministerio, pero puede no ser el fragmento más relevante (88% en la métrica correspondiente).
- Redacción de la talbiyah: ante una petición de la talbiyah completa, el modelo abre la sección de la guía, que solo cita sus primeras palabras, en lugar de acudir al libro de duás.
- Formulación de los rechazos: algunas preguntas de takfir o de votaciones reciben la respuesta de «consulte a un erudito» en lugar del rechazo explícito. El modelo sigue declinando responder, pero la categoría de respuesta no es la prevista.
- Definiciones tratadas como consultas: «¿Qué es la qibla?» puede devolver la orientación en vivo en lugar de una definición.
- Idioma de las guías: el texto del ministerio está almacenado únicamente en inglés. Los usuarios de urdu y árabe reciben una línea introductoria en su idioma y después el texto en inglés.
- Traducciones de duás: Hisn al-Muslim solo almacena significados en inglés. Los usuarios árabes ven únicamente el árabe.
- Longitud del prompt: las definiciones de herramientas consumen 2.054 tokens fijos por conversación. Sin caché del prompt de sistema, el coste por turno es alto para un modelo de este tamaño.
- Ningún erudito ha revisado el modelo, los textos almacenados ni los datos de entrenamiento. El propio autor lo describe como ayuda de estudio, no como fuente de dictamen.
- Cero descargas y cero likes: no hay validación independiente de la comunidad sobre este repositorio.
- Discrepancia de nomenclatura: el nombre indica 2B y los safetensors declaran 4,63 mil millones de parámetros. Conviene verificar el consumo real de memoria antes de planificar el despliegue.
- Licencia: los pesos derivan de Gemma y su uso queda sujeto a los Gemma Terms of Use, incluida la política de uso prohibido de Google. Verificar las condiciones vigentes antes de un uso comercial.
- Riesgo de alucinación: mitigado por diseño en el ámbito escriturario (el modelo no cita de memoria y hay un verificador posterior), pero no eliminado en las respuestas explicativas construidas a partir del tafsir recuperado.
- Sesgos: no se documenta ninguna evaluación de sesgos en la información disponible. El entrenamiento se apoya en un conjunto restringido de traducciones y tafsires (Maududi, Junagarhi, Ahmed Ali, Sahih International, Al-Muyassar, Al-Mukhtasar), lo que puede sesgar la interpretación hacia esas fuentes.

## Enlaces

- HuggingFace: https://huggingface.co/mukaddamzaid/Muslim-1-2B-MLX-8bit
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Fuentes citadas por el autor sin URL en la model card: texto coránico de Tanzil (grafías Uthmani y simple); tafsir Al-Muyassar y Al-Mukhtasar, procedentes de tafsir-mcp-data (CC BY 4.0); Hisn al-Muslim de Sa'id bin Ali bin Wahf al-Qahtani, 267 duás en 132 capítulos, vía la API de hisnmuslim.com; Hajj Awareness Guide y Umrah & Visit Guide del Ministerio de Hajj y Umrah de Arabia Saudí, 45 secciones transcritas literalmente.
- Búsqueda web: no se han encontrado resultados relevantes. Las consultas devolvieron exclusivamente páginas de trivia diaria sin relación con el modelo, por lo que no se aportan enlaces adicionales.
