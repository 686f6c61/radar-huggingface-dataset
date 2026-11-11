# onelastkissforme/dadeum-gec-small

## Resumen

dadeum-gec-small es un modelo de corrección ortográfica, de espaciado y gramatical para coreano, desarrollado por el usuario onelastkissforme como componente del proyecto dadeum, un corrector que se ejecuta localmente en el ordenador del usuario. Se trata de un fine-tuning de KoBART (gogamza/kobart-base-v2) con 62,5 millones de parámetros, pensado para reescribir una frase corrigiendo únicamente lo que está mal y dejando intacto el resto del texto. Su enfoque es deliberadamente conservador: prioriza la precisión sobre la exhaustividad para evitar introducir cambios no deseados en textos ya correctos.

El modelo resuelve un problema concreto en el ecosistema del procesamiento del lenguaje natural en coreano: los correctores generativos tienden a reescribir en exceso, mientras que los correctores basados en reglas tienen puntos ciegos difíciles de cubrir. dadeum-gec-small combina ambos mundos mediante un mecanismo de filtrado por margen de verosimilitud y una serie de guardas que descartan ediciones que toquen caracteres no Hangul, cambien números o alteren más de dos caracteres. Es relevante ahora porque ofrece una alternativa ligera, ejecutable en CPU (34 ms de mediana por frase en un Apple M4 Pro) y entrenada exclusivamente con datos de licencia abierta, sin anotaciones generadas por proveedores de IA.

La arquitectura es un transformer encoder-decoder de tipo BART con 4 capas de encoder y 1 de decoder, anchura 768 y 62,5M de parámetros. El contexto de entrada está limitado a 128 tokens por frase, y el modelo está diseñado para operar frase a frase, dividiendo textos largos en los finales de oración. Su licencia es CC BY-SA 4.0, mientras que el script de corrección asociado (dadeum_correct.py) es MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo BART (4 capas encoder, 1 capa decoder, anchura 768) |
| Parámetros totales | 62.455.344 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens por frase |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | CC BY-SA 4.0 (modelo); dadeum_correct.py bajo MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de KoBART (gogamza/kobart-base-v2) y se entrena mediante fine-tuning con una arquitectura reducida: se recortan las capas del modelo base hasta dejar 4 capas de encoder y 1 de decoder, manteniendo la anchura de 768. El resultado es un modelo de 62,5M de parámetros con un pipeline de text2text-generation, adecuado para reescritura de frases cortas. El proceso de entrenamiento documentado sigue la secuencia clean_e4d1_init (recorte de capas) -> clean_e4d1 (con proporciones legacy_clean:60 y wiki_edits:7).

Los datos de entrenamiento se componen exclusivamente de texto con licencia abierta y objetivos generados sin intervención de proveedores de IA. La tabla de pares incluye correcciones del motor de reglas de dadeum aplicadas sobre nsmc (CC0), comentarios sin etiquetar de kocohub, Wikipedia y Wikinews en coreano (CC BY-SA 4.0) y 정책브리핑 (KOGL Type 1), con las partes del motor ajustadas a datos anotados por IA desactivadas. Además, se incluyen correcciones de editores de Wikipedia coreana extraídas del historial de páginas (CC BY-SA 4.0), filtradas para excluir oraciones de evaluación, intercambios de contenido y cambios de script extranjero o números.

La innovación técnica principal no está en la arquitectura, sino en el post-procesado: cada cambio propuesto por el modelo se evalúa mediante su margen de log-verosimilitud y solo se conserva si alcanza o supera el umbral definido en gating.json. Además, una serie de guardas descartan cambios que afecten a caracteres no Hangul o no ASCII, que añadan o eliminen dos o más caracteres, que modifiquen un número, o que salten tres o más jamo hacia una palabra ausente de la lista abierta known_words.bin. El script dadeum_correct.py implementa todo este pipeline; un generate() simple omite el juicio y las guardas.

## Capacidades

- Corrección ortográfica en coreano: detecta y corrige errores de escritura en palabras.
- Corrección de espaciado: ajusta los espacios entre palabras según las convenciones del coreano.
- Corrección gramatical: corrige partículas y errores gramaticales menores.
- Edición mínima: reescribe solo lo incorrecto y preserva el resto de la frase, incluyendo estilo y elección léxica.
- Salida con ediciones estructuradas: la función edits() devuelve una lista de tuplas (start, end, replacement) que permite aplicar los cambios de forma programática.
- Filtrado por margen de verosimilitud: el modelo puntúa cada cambio y aplica un umbral configurable en gating.json.
- Guardas de seguridad: descarta ediciones sobre caracteres no Hangul/no ASCII, cambios numéricos, inserciones o eliminaciones de dos o más caracteres y sustituciones léxicas no presentes en la lista de palabras conocidas.
- Procesamiento frase a frase: maneja textos largos dividiéndolos en finales de oración, con un límite de 128 tokens por frase.
- Ejecución en CPU: diseñado para funcionar en local sin GPU, con latencia de 34 ms de mediana y 87 ms p95 por frase en un Apple M4 Pro con 4 hilos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Corrección de textos en aplicaciones de escritorio: el modelo puede integrarse en editores o procesadores de texto para corregir ortografía y espaciado en coreano sin enviar datos a la nube, gracias a su ejecución local en CPU y su latencia de decenas de milisegundos por frase.
- Preprocesado de corpus en coreano: antes de entrenar otros modelos o de indexar documentos, se puede pasar el corrector sobre textos de Wikipedia, noticias o comentarios para normalizar ortografía y espaciado, reduciendo el ruido en los datos.
- Revisión de correos electrónicos profesionales: el modelo está diseñado para no modificar frases ya correctas (0 frases cambiadas en 27 oraciones de un correo laboral correcto), lo que lo hace adecuado para revisar comunicaciones formales sin riesgo de reescritura no deseada.
- Herramientas de aprendizaje de coreano: aunque el modelo corrige menos en escritos de aprendices (F0.5 de .083 en Kor-Lang8), puede usarse como primera pasada para detectar errores de espaciado y ortografía en ejercicios de estudiantes nativos o avanzados.
- Moderación y limpieza de comentarios en foros: aplicable a comentarios de usuarios en coreano para normalizar el texto antes de análisis de sentimiento o clasificación, con la ventaja de que las guardas evitan cambios en números y caracteres especiales.
- Integración en pipelines de CI/CD para documentación: el script dadeum_correct.py puede ejecutarse sobre archivos Markdown o documentación en coreano para verificar y corregir ortografía y espaciado de forma automatizada, con salida de ediciones estructuradas que facilitan la revisión.
- Corrección en entornos con requisitos de privacidad: al ejecutarse completamente en local y no depender de servicios externos, es apto para textos sensibles que no pueden salir del dispositivo del usuario.

## Benchmarks y rendimiento

Los resultados publicados por el autor se miden con F0.5 sobre ediciones de caracteres (ediciones contiguas fusionadas) contra un gold anotado por IA no distribuido. La partición de validación se usó para seleccionar el checkpoint y el margen de gating.json, por lo que las puntuaciones de validación son ligeramente optimistas.

| Medida | Valor |
|---|---|
| Mitad ciega de validación (1.196 frases), F0.5 (P / R) | .890 (.958 / .692); motor de reglas dadeum: .899 (.946 / .750) |
| Desarrollo, 300 frases, F0.5 | .914; motor de reglas .950 |
| Test en dominio, 350 frases, F0.5 | .905; motor de reglas .927 |
| Dominios sellados (reseñas, comentarios, política, solicitudes), 870 frases, F0.5 | .811; motor de reglas .863 |
| Dominios de confirmación, 600 frases, F0.5 | .805; motor de reglas .831 |
| Noticias, negocios y comentarios (anotador único), 799 frases, F0.5 | .798; motor de reglas .820 |
| Kor-Lang8 reconstruido (aprendices), 2.000 frases, F0.5 | .083; motor de reglas .088 |
| Correo laboral correcto (27 frases y el correo completo), frases cambiadas | 0 |
| Frases limpias de Wikipedia (19.759), frases cambiadas | 785 (645 solo espaciado); motor de reglas 424 |
| Latencia por frase en CPU, Apple M4 Pro, 4 hilos | 34 ms mediana, 87 ms p95 |

Comparativa con otros correctores de coreano sobre las mismas frases y el mismo scorer (F0.5):

| Sistema | Dominios sellados (870) | Dominios de confirmación (600) | Kor-Lang8 (2.000) |
|---|---|---|---|
| dadeum-gec-small (este modelo) | .811 | .805 | .083 |
| Motor de reglas dadeum (la app) | .863 | .831 | .088 |
| Claude Sonnet 5.5 con guía de anotación | .895 | .887 | no ejecutado |
| Qwen3-8B | .548 | .562 | .127 |
| KoGrammar distil (theSOL1) | .481 | .435 | .107 |
| KoGrammar base (theSOL1) | .476 | .439 | .104 |
| ET5 typos corrector (j5ng) | .408 | .347 | .102 |
| KoBART gec_kr (Soyoung97) | .216 | .187 | .266 |

El autor indica que no encontró una tabla de clasificación pública para esta tarea en coreano, por lo que esta tabla es propia y no un ranking de terceros. El gold premia ediciones mínimas; en escritos de aprendices (Kor-Lang8), donde las correcciones de referencia reescriben más, KoBART gec_kr lidera.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 62,5M de parámetros, los pesos en fp32 ocupan aproximadamente 250 MB; en fp16, unos 125 MB. No se han publicado datos de cuantización, pero el tamaño del repositorio es de 0,3 GB.
- GPU recomendadas: no requiere GPU; el autor reporta latencia en CPU (Apple M4 Pro, 4 hilos). Cualquier GPU consumer moderna (RTX 3060 o superior) puede ejecutarlo con holgura, aunque no se han publicado cifras de latencia en GPU.
- ¿Cabe en GPU consumer? Sí, en cualquier GPU consumer con al menos 1 GB de VRAM; también funciona en CPU.
- Opciones de despliegue: transformers (pipeline text2text-generation), junto con el script dadeum_correct.py para aplicar el filtrado por margen y las guardas. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 34 ms de mediana y 87 ms p95 por frase en CPU (Apple M4 Pro, 4 hilos). No se ha publicado throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F0.5 dominios sellados | F0.5 Kor-Lang8 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| dadeum-gec-small | 62,5M | 128 tokens | .811 | .083 | CC BY-SA 4.0 | Hugging Face |
| Qwen3-8B | 8B (no confirmado en la información) | no disponible | .548 | .127 | no disponible | no disponible |
| KoGrammar distil (theSOL1) | no disponible | no disponible | .481 | .107 | no disponible | no disponible |
| KoGrammar base (theSOL1) | no disponible | no disponible | .476 | .104 | no disponible | no disponible |
| ET5 typos corrector (j5ng) | no disponible | no disponible | .408 | .102 | no disponible | no disponible |
| KoBART gec_kr (Soyoung97) | no disponible | no disponible | .216 | .266 | no disponible | no disponible |

Los datos de parámetros, contexto y licencia de los modelos comparados no se detallan en la información proporcionada, salvo el rendimiento F0.5 en las tres columnas de evaluación. El motor de reglas dadeum, que no es un modelo neuronal, obtiene .863 en dominios sellados y .088 en Kor-Lang8.

## Limitaciones y advertencias

- Aprende principalmente de las correcciones de un motor de reglas, por lo que hereda sus puntos ciegos; corrige mucho mejor ortografía, espaciado y partículas que la elección de palabras o el estilo.
- Procesa una frase a la vez, con un máximo de 128 tokens; los textos más largos se dividen en finales de oración, lo que puede perder contexto entre frases.
- Corrige mucho menos en escritos de aprendices (estilo Lang-8) que en escritos nativos: F0.5 de .083 en Kor-Lang8 frente a .811 en dominios sellados.
- Riesgo de cambios no deseados en textos ya correctos: en 19.759 frases limpias de Wikipedia modificó 785 (645 solo de espaciado), frente a 424 del motor de reglas.
- Las puntuaciones de validación son ligeramente optimistas porque la partición de validación se usó para elegir el checkpoint y el margen de gating.json.
- El gold de evaluación fue anotado por IA y no se distribuye; no hay una tabla de clasificación pública de terceros para esta tarea.
- Licencia CC BY-SA 4.0 para el modelo: el uso comercial está permitido, pero las obras derivadas deben compartirse bajo la misma licencia y con atribución (ver NOTICE). El script dadeum_correct.py es MIT.
- No soporta tool calling, agentes, visión, audio ni razonamiento multi-paso; es un corrector de frases, no un asistente general.
- El modelo solo está entrenado para coreano; no se ha evaluado en otros idiomas.
- No se han publicado datos sobre sesgos específicos, tipos de cuantización ni rendimiento en GPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/onelastkissforme/dadeum-gec-small
- Repositorio del proyecto dadeum: https://github.com/zmflm0110/dadeum
- Modelo base KoBART: https://huggingface.co/gogamza/kobart-base-v2
