# ftnext/PLaMo-3-Translate-0.8B-Imouto-EN-JA-GGUF

## Resumen

PLaMo 3 Translate 0.8B Imouto EN-JA es un modelo experimental de traduccion ingles-japones derivado de pfnet/plamo-3-translate-0.8b mediante edicion directa de pesos, sin fine-tuning por gradiente. Lo publica el usuario independiente ftnext y aplica la PLaMo Community License de Preferred Networks. Su particularidad es que genera las traducciones con un registro de "hermana pequena" (imouto), interpelando al receptor como 「お兄ちゃん」 (onii-chan) de forma sistematica.

Tecnicamente no es un modelo nuevo: reutiliza la arquitectura del base de 890.344.960 parametros (0,8B) y modifica unicamente dos filas de la matriz `lm_head.weight`, correspondientes a los token IDs 80148 (お兄ちゃん) y 50101 (、). El cambio afecta a 3.069 de 890.344.960 valores, es decir, aproximadamente el 0,000345% de los pesos. El resto de tensores es identico al modelo original.

Su relevancia es doble: por un lado, demuestra que la edicion en espacio de pesos (weight-space programming) puede alterar el estilo de salida de un traductor sin reentrenamiento; por otro, sirve como caso de estudio de los riesgos de este tipo de intervenciones, ya que la fidelidad semantica cae respecto al modelo base. Solo se distribuye en GGUF F16 (1.783.503.488 bytes) y solo se ha evaluado en la direccion EN→JA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de PLaMo 3 Translate 0.8B; detalles internos no disponibles en la informacion proporcionada) |
| Parametros totales | 890.344.960 |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | 4.096 tokens en el ejemplo de uso documentado (`-c 4096`); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | Solo F16 (algunos pesos de normalizacion en F32 por la conversion); no se distribuyen otras cuantizaciones |
| Idiomas soportados | Ingles (origen) y japones (destino) |
| Licencia | PLaMo Community License (license_name: plamo-community-license) |
| Formato de pesos | GGUF (fichero `plamo-3-translate-0.8b-imouto-f16.gguf`) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `pfnet/plamo-3-translate-0.8b` en la revision `cc8e88169807d5a272e8ff06db12eb0129b67f81`. No hay entrenamiento: la modificacion consiste en observar estados internos y construir un vector de correccion mediante proyeccion ortogonal por SVD, que se aplica a dos filas del tensor `lm_head.weight`. El objetivo es que, al inicio de la traduccion, el modelo favorezca el token 「お兄ちゃん」 y, justo despues, el signo de puntuacion 「、」, minimizando el impacto sobre los estados de frase observados.

La edicion se inspira en Weight-Space Programming, aunque modifica el output head, que en el experimento original quedaba fuera del alcance. No se emplean LoRA, instrucciones de estilo en inferencia, prefijos forzados, hooks ni sustituciones de cadena posteriores a la generacion. El GGUF se convirtio con llama.cpp (commit `c0ab6e5c0bab3fb21e6cb9d2371f3c41d85ea775`) y se verifico que la matriz de salida coincide con la version HF en FP16; la plantilla de chat compatible con llama.cpp va embebida y no incluye ninguna instruccion de estilo.

## Capacidades

- Traduccion unidireccional de ingles a japones con registro coloquial de hermana pequena.
- Insercion sistematica del vocativo 「お兄ちゃん」 al comienzo de la mayoria de traducciones (20 de 24 en la evaluacion).
- Uso del signo de puntuacion 「、」 tras el vocativo, favorecido por la segunda fila editada.
- Generacion de texto corto y oraciones independientes; no esta disenado para conversacion multi-turno.
- No soporta tool calling ni function calling (no documentado; el modelo base es un traductor, no un asistente).
- No soporta razonamiento multi-paso ni modo "thinking".
- No dispone de vision ni audio.
- Multilingue limitado a EN y JA; otras direcciones de traduccion no se han evaluado.
- Ante una pregunta, traduce en lugar de responder: no es un asistente conversacional.

## Casos de uso

- Prototipado de localizacion con tono afectivo: para generar dialogos de personajes tipo imouto en videojuegos o novelas visuales, traduciendo lineas EN→JA con un registro coherente sin escribir prompts de estilo.
- Investigacion sobre edicion de pesos: como referencia reproducible de que dos filas del output head bastan para inducir un sesgo estilistico medible, util para estudiar weight-space programming y sus limites.
- Pruebas de robustez en traduccion automatica: sirve para medir cuanto degrada la fidelidad semantica (de 23/24 a 21/24 en el conjunto de evaluacion) al forzar un vocativo ausente en el original.
- Generacion de datos sinteticos con estilo marcado: para crear corpus de entrenamiento o evaluacion con registro coloquial japones dirigido a un interlocutor masculino cercano.
- Demostracion docente de sesgos inducidos: permite ilustrar en clase o en un articulo como una intervencion minima en los pesos altera la salida de forma sistematica y verificable.
- Evaluacion de pipelines GGUF: como caso de prueba de llama.cpp y Llama.app CLI con plantillas de chat embebidas y parametros de idioma (`source_lang`, `target_lang`) en `--chat-template-kwargs`.

## Benchmarks y rendimiento

Evaluacion del autor sobre 24 frases en ingles no usadas durante el desarrollo, generacion greedy, maximo 128 tokens nuevos. La fidelidad semantica y el tono se juzgaron por inspeccion visual no ciega con Codex; no son benchmarks estandar ni evaluacion de terceros.

| Condicion | Significado preservado | Significado + tono imouto natural + completitud | Contiene 「お兄ちゃん」 | Repeticiones | Limite de tokens alcanzado |
|---|---:|---:|---:|---:|---:|
| Modelo base, instruccion de traduccion normal | 23/24 | 0/24 | 0/24 | 0/24 | 0/24 |
| Modelo base, 6 ejemplos paralelos con tono imouto + contexto | 22/24 | 3/24 | 4/24 | 0/24 | 0/24 |
| Version editada, instruccion de traduccion normal | 21/24 | 16/24 | 20/24 | 0/24 | 0/24 |

La tabla se obtuvo con pesos HF en BF16 cargados en FP16 sobre PyTorch/MPS. En GGUF solo se verificaron 5 ejemplos (4 en ingles y 1 saludo en japones), reproduciendo tanto casos correctos como el fallo de omision de 「東京」. No se ha reevaluado el conjunto completo de 24 frases en GGUF.

## Requisitos de hardware

- VRAM estimada para inferencia en F16: aproximadamente 1,8 GB de pesos mas overhead de contexto y KV cache; en la practica, menos de 4 GB con contexto de 4.096 tokens.
- Cabe en cualquier GPU consumer con 6 GB o mas (RTX 3060, RTX 4060, RTX 4090) y en Apple Silicon mediante Metal.
- Entorno verificado por el autor: Llama.app CLI `0.9.0-dev` (build `12110`, commit `cd959bae9`) sobre Apple Silicon Mac.
- Despliegue: llama.cpp y frontends compatibles (Llama.app CLI); al ser un GGUF puro, no se documenta soporte para vLLM o TGI en la informacion disponible.
- Throughput y latencia: no disponibles; no se han publicado mediciones.
- No se distribuyen cuantizaciones Q4, Q5 ni Q8, por lo que no se puede reducir el peso por debajo de F16 con los ficheros publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ftnext/PLaMo-3-Translate-0.8B-Imouto-EN-JA (este) | 890.344.960 | 4.096 en el ejemplo documentado | Traduccion EN→JA con edicion de pesos para tono imouto | PLaMo Community License | GGUF F16 en Hugging Face |
| pfnet/plamo-3-translate-0.8b | 890.344.960 | no disponible en la informacion proporcionada | Traduccion EN→JA sin sesgo de estilo | PLaMo Community License | Pesos HF y GGUF oficiales |
| pfnet/plamo-3-translate-0.8b-GGUF | 890.344.960 | no disponible en la informacion proporcionada | Version GGUF oficial del traductor base | PLaMo Community License | GGUF en Hugging Face |

No se dispone de datos de benchmarks comparativos con otros traductores EN→JA en la informacion proporcionada.

## Limitaciones y advertencias

- No es un asistente conversacional: ante preguntas traduce en lugar de responder, y no mantiene personalidad tsundere ni coherencia de personaje mas alla del vocativo y el tono.
- Anade un vocativo (「お兄ちゃん」) que no existe en el texto original, por lo que no sirve para traduccion estrictamente fiel.
- Perdida de fidelidad semantica: baja de 23/24 a 21/24 en el conjunto de evaluacion; se han observado omisiones de informacion, como la desaparicion de 「東京」 en una frase.
- Puede mantener registros de cortesia (keigo) en lugar del tono coloquial esperado, o no incluir el vocativo en algunos casos (4 de 24).
- No evaluado en textos largos, dialogos continuados, otras direcciones de traduccion ni cuantizaciones distintas de F16.
- La ausencia de repeticiones en 24 frases no garantiza que no aparezcan en otras entradas.
- La evaluacion es no ciega, realizada por el propio autor con Codex, sin validacion independiente ni benchmarks estandar.
- Licencia PLaMo Community License: la redistribucion exige incluir el texto de la licencia, mostrar "Built with PLaMo" y mantener "PLaMo" en el nombre del modelo; el uso comercial requiere registro previo y esta sujeto a condiciones segun volumen de ingresos. Consultar el texto completo enlazado.
- Modelo no oficial: no cuenta con el respaldo ni la aprobacion de Preferred Networks.
- El repositorio no incluye el codigo, los datos ni la documentacion para reproducir la edicion de pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ftnext/PLaMo-3-Translate-0.8B-Imouto-EN-JA-GGUF
- Modelo base: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- GGUF oficial del modelo base: https://huggingface.co/pfnet/plamo-3-translate-0.8b-GGUF
- Licencia PLaMo Community (texto en ingles): https://plamo.preferredai.jp/info/plamo-community-license-en
- Inspiracion metodologica (Weight-Space Programming): https://rikiyat.github.io/blog/weight-space-programming/
- Publicacion sobre cambio de tono en PLaMo: https://x.com/rizumita/status/2118356330037817773
