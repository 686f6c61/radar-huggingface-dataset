# catsaiagency/Lynx-0.8B

## Resumen

Lynx-0.8B es un modelo de lenguaje de pequeno tamano desarrollado por CatsAI Agency, especializado en respuesta a preguntas sobre texto en el marco de pipelines de generacion aumentada por recuperacion (RAG). Se trata de un ajuste fino supervisado del modelo base Qwen3.5-0.8B de Alibaba Cloud, con 1.107 millones de parametros totales segun los pesos en safetensors. Su proposito es acotado y deliberadamente restrictivo: recibe un texto y una pregunta en el mismo idioma y devuelve una unica frase de respuesta construida exclusivamente a partir de ese texto, o bien una frase fija de rechazo cuando la respuesta no aparece en el material proporcionado.

El modelo cubre 20 idiomas, entre ellos el castellano, y esta disenado para ejecutarse en CPU convencional con el archivo GGUF Q4_K_M (0,67 GB, aproximadamente 1,5 GB de RAM en ejecucion). El repositorio de Hugging Face contiene los pesos sin cuantizar en bfloat16 (safetensors), orientados a quienes necesitan convertir, cuantizar o reajustar el modelo; el propio autor remite al repositorio GGUF para la inferencia real con llama.cpp.

Su relevancia actual radica en la especializacion: frente a modelos generalistas que alucinan con facilidad en tareas de lectura comprensiva, Lynx prioriza la fidelidad al texto fuente y la deteccion explicita de ausencia de respuesta, con un rendimiento declarado de 93,8/94,2 en su prueba interna de 20 idiomas. La contrapartida es que no esta pensado para resumenes, listas, chat libre ni razonamiento complejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5-0.8B, ajuste fino para RAG); incluye codificador de vision del modelo base que Lynx no utiliza |
| Parametros totales | 1.107.265.600 (0,8 mil millones, segun pesos safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (texto + pregunta + respuesta), configurado en el script de arranque; entrenado con textos de hasta aproximadamente 8.000 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M disponible en repositorio aparte; pesos originales en bfloat16 (safetensors) |
| Idiomas soportados | 20: hr, ja, en, zh, ko, de, fr, es, it, pt, nl, pl, cs, ru, sv, tr, id, vi, hi, hu |
| Licencia | CatsAI Model License (licencia propia, "other"); prueba gratuita, uso laboral con pago por maquina |
| Formato de pesos | safetensors (bfloat16) en este repositorio; GGUF Q4_K_M en catsaiagency/Lynx-0.8B-GGUF |

## Arquitectura y entrenamiento

Lynx-0.8B parte de Qwen3.5-0.8B, un transformer de 0,8 mil millones de parametros bajo licencia Apache 2.0, y se obtiene mediante ajuste fino supervisado orientado a una tarea concreta: responder con una sola frase a una pregunta usando unicamente el texto aportado. El repositorio conserva el codificador de vision del modelo base, aunque Lynx no lo emplea; el modelo es exclusivamente de texto a texto pese a la etiqueta image-text-to-text del repositorio.

No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. El autor indica que las pruebas de calidad se realizaron con articulos de Wikipedia no vistos durante el entrenamiento, lo que sugiere un corpus de ajuste de estilo enciclopedico. La innovacion principal no es arquitectonica sino de comportamiento: el modelo incorpora una frase fija de rechazo por idioma para los casos sin respuesta y requiere un prompt exacto de entrenamiento para funcionar segun lo descrito. Las cifras de velocidad y calidad se midieron con el archivo Q4_K_M sobre llama.cpp.

## Capacidades

- Generacion de respuestas extractivas de una sola frase a partir de un texto y una pregunta en el mismo idioma.
- Deteccion de ausencia de respuesta: devuelve una frase fija de rechazo por idioma, expuesta en el codigo de ejemplo mediante `r["refused"]` o comparacion con `REFUSAL[lang]`.
- Cobertura multilingue en 20 idiomas, incluidos espanol, ingles, japones, chino, coreano, aleman, frances, italiano, portugues, neerlandes, sueco, polaco, checo, hungaro, croata, ruso, turco, vietnamita, indonesio e hindi.
- Procesamiento de textos largos de hasta aproximadamente 8.000 tokens de entrada, con contexto configurado de 8.192 tokens.
- Ejecucion en CPU sin GPU, con velocidades declaradas de 300-450 tokens/s en lectura y 40-53 tokens/s en escritura en un Core i7-11800H con 8 hilos.
- No soporta de forma fiable resumenes, listas extensas, chat libre, razonamiento multi-paso ni preguntas encadenadas; el autor lo desaconseja explicitamente para esos usos.
- No se documenta soporte de tool calling, function calling ni modo de razonamiento extendido.

## Casos de uso

- Atencion al cliente sobre base de conocimiento: recuperar los fragmentos relevantes con un buscador propio y pasarlos junto a la consulta del usuario para obtener una respuesta de una frase fiel al manual o a la politica interna, con rechazo explicito cuando la informacion no consta.
- Asistencia interna sobre normativa y procedimientos: consultas sobre reglamentos de empresa, convenios o circulares, donde el modelo cita el hecho contenido en el texto y evita inventar excepciones, siempre que la pregunta reutilice la terminologia del documento.
- Verificacion documental en flujos de compliance: comprobar si un contrato o una clausula responde a una pregunta concreta y marcar los casos sin respuesta para revision humana, aprovechando la frase de rechazo como senal de escalado.
- Despliegue en entornos sin GPU: ejecucion en portatiles o servidores modestos con llama.cpp y el GGUF Q4_K_M (0,67 GB en disco, unos 1,5 GB de RAM), adecuado para sedes o dispositivos donde no hay acelerador disponible.
- Soporte multilingue en documentacion tecnica: responder preguntas sobre manuales en cualquiera de los 20 idiomas cubiertos, manteniendo la pregunta en el mismo idioma que el texto y pasando el codigo de idioma como parametro `lang`.
- Extraccion de hechos para pipelines de datos: generar respuestas cortas y verificables sobre pasajes recuperados que alimenten procesos posteriores de validacion o enriquecimiento, con la advertencia de que cada pregunta relee el texto completo y el tiempo crece con su longitud.
- Filtrado de preguntas sin cobertura: usar la deteccion de rechazo para descartar consultas que la base documental no puede responder antes de derivarlas a un agente humano o a un modelo mayor.

## Benchmarks y rendimiento

| Prueba | Resultado | Condiciones |
|---|---|---|
| RAG interno 20 idiomas (200 preguntas por idioma, Wikipedia no vista en entrenamiento, dos jueces LLM) | 93,8 / 94,2 | GGUF Q4_K_M, llama.cpp |
| Categoria parrafo corto | 92,6 | GGUF Q4_K_M, llama.cpp |
| Categoria texto largo (unos 2.500 tokens) | 91,1 | GGUF Q4_K_M, llama.cpp |
| Categoria sin respuesta en texto corto | 98,0 | GGUF Q4_K_M, llama.cpp |
| Categoria sin respuesta en texto largo | 93,6 | GGUF Q4_K_M, llama.cpp |
| XQuAD (preguntas humanas, 8 idiomas) | 89,9 / 90,7 | GGUF Q4_K_M, llama.cpp |
| Velocidad de lectura en CPU | 300-450 tokens/s | Core i7-11800H, 8 hilos |
| Velocidad de escritura en CPU | 40-53 tokens/s | Core i7-11800H, 8 hilos |
| Tiempo por pregunta sobre texto de 2.500 tokens | Aproximadamente 7 s | Core i7-11800H, 8 hilos |
| Lectura/escritura con maquina cargada | 250 / 35 tokens/s | 6 hilos |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el escenario recomendado; el modelo esta pensado para CPU. En GPU, los pesos en bfloat16 requieren aproximadamente 2,2 GB, aunque el autor no documenta despliegue en GPU.
- Memoria RAM: aproximadamente 1,5 GB en ejecucion con el GGUF Q4_K_M.
- GPU recomendadas: no disponibles; el autor no publica configuracion de GPU ni resultados con aceleradores.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano de 0,8 mil millones de parametros, aunque no hay datos oficiales de rendimiento en GPU.
- Opciones de despliegue: llama.cpp con el GGUF Q4_K_M (via recomendada, con servidor arrancado con `-np 1` y contexto de 8.192 tokens); transformers para los pesos safetensors en bfloat16.
- Latencia y throughput: aproximadamente 7 segundos por pregunta sobre un texto de 2.500 tokens en un Core i7-11800H con 8 hilos; el servidor procesa las peticiones de una en una (un solo slot).
- Limitacion de escalado: cada pregunta relee el texto completo, por lo que el coste crece linealmente con la longitud del texto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lynx-0.8B | 0,8 mil millones | 8.192 tokens | RAG extractivo con rechazo explicito, 20 idiomas, CPU | CatsAI Model License (pago por maquina para uso laboral) | Hugging Face (safetensors y GGUF) |
| Qwen3.5-0.8B (modelo base) | 0,8 mil millones | No disponible en la informacion | Modelo generalista de texto, ajuste fino posterior | Apache 2.0 | Hugging Face |
| Modelos RAG especializados de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos con alternativas en la informacion proporcionada; la comparacion con el modelo base se limita a la relacion de ajuste fino y a la diferencia de licencia.

## Limitaciones y advertencias

- El modelo solo funciona segun lo descrito si se le proporciona el prompt exacto con el que fue entrenado; el codigo de ejemplo y el manual completo estan en el repositorio GGUF.
- No razona bien: copia hechos con fidelidad, pero falla en preguntas de si/no y en excepciones. El autor documenta un caso en japones donde el texto indica que los DVD deben devolverse en el mostrador y el modelo responde que pueden devolverse en el buzon.
- Cuando la pregunta se formula con palabras muy distintas a las del texto, el modelo tiende a rechazar aunque la respuesta este presente; por eso la puntuacion en XQuAD es inferior a la de la prueba interna.
- La calidad se midio sobre textos de estilo Wikipedia; es necesario validar con documentos propios (manuales, normativa interna) antes de confiar en el modelo en produccion.
- Respuestas limitadas a una frase: no es adecuado para resumenes, listas de varios elementos ni conversacion libre.
- La ventana de contexto es de 8.192 tokens; un texto mas largo provoca el error "exceeds the available context size". Los idiomas con escritura no latina, como el hindi, consumen mas tokens por palabra.
- Cada peticion relee el texto completo y el servidor atiende una peticion cada vez (`-np 1`), lo que limita el throughput en cargas concurrentes.
- El modelo lee, no busca: la seleccion de pasajes relevantes debe hacerla un sistema de recuperacion externo.
- Licencia restrictiva: la prueba es gratuita, pero el uso para trabajo real exige una licencia de pago por cada maquina donde se instale, incluido un PC de desarrollo si se emplea para trabajo efectivo. No es una licencia de codigo abierto y debe revisarse el texto de MODEL-LICENSE.md antes de cualquier despliegue comercial.
- El repositorio incluye el codificador de vision del modelo base, que Lynx no utiliza; no debe interpretarse como capacidad multimodal.
- Existe una variante de 2B mas precisa, no publicada en abierto, disponible bajo contacto con el proveedor.
- Riesgo de sesgo y alucinacion: no se documentan evaluaciones de sesgo en la informacion disponible; el mecanismo de rechazo reduce pero no elimina el riesgo de respuestas incorrectas, por lo que las respuestas criticas deben contrastarse con el texto fuente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/catsaiagency/Lynx-0.8B
- Repositorio GGUF con codigo de ejemplo y manual: https://huggingface.co/catsaiagency/Lynx-0.8B-GGUF
- Licencia del modelo: https://huggingface.co/catsaiagency/Lynx-0.8B/blob/main/MODEL-LICENSE.md
- Licencia del modelo en japones: https://huggingface.co/catsaiagency/Lynx-0.8B/blob/main/MODEL-LICENSE.ja.md
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Sitio web del autor: https://catsai.agency/en/lynx
- Contacto comercial: https://catsai.agency/contact
