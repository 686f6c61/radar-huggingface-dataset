# Climb-Ai/Climb-1-Toki-GGUF

## Resumen

Climb 1 Toki es un modelo de lenguaje extremadamente pequeno (3.049.920 parametros totales, 2.85M ligados) desarrollado por Climb-Ai / Kulupu BBTeam, entrenado de forma nativa en toki pona, una lengua construida de vocabulario minimo. Se distribuye en formato GGUF para su uso con llama.cpp y deriva de los pesos PyTorch publicados en Climb-Ai/Climb-1-Toki. Su proposito no es competir en capacidades generales, sino ofrecer un modelo de conversacion y generacion de texto especializado en toki pona que quepa en cualquier dispositivo y funcione en CPU pura.

La relevancia del modelo es fundamentalmente practica y experimental: con un fichero de 11,67 MB y una generacion declarada de mas de 2.500 tokens por segundo en CPU, sirve como banco de pruebas para tecnicas de entrenamiento y alineacion en lenguas de bajos recursos, y como componente de chat ligero para aplicaciones educativas o de demostracion en toki pona. Incluye soporte nativo de la notacion cartouche (corchetes con comas para nombres extranjeros, por ejemplo `ma [To,ki,o]`) y un formateo de frases con mayuscula inicial y sin defectos de espaciado de puntuacion.

El modelo se presenta como preentrenado y alineado sobre tres fuentes de datos: el dataset de dialogos Climb-Ai/toki-pona-tiny-dialogues, Wikipesija (Wikipedia en toki pona) y la publicacion lipu tenpo. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales. No se han publicado especificaciones detalladas de arquitectura interna, contexto de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Micro-LLaMA (transformer decoder-only, pesos ligados) |
| Parametros totales | 3.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de servidor usa `-c 256`) |
| Tipos de cuantizacion | GGUF (fichero `climb-1-toki.gguf`; no se detallan niveles Q) |
| Idiomas soportados | toki pona (codigo `tok`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); pesos PyTorch en Climb-Ai/Climb-1-Toki |

## Arquitectura y entrenamiento

La model card describe el modelo como un Micro-LLaMA de 2.85M parametros ligados (3.05M totales), es decir, una arquitectura transformer decoder-only de tipo LLaMA a escala minima, con pesos de embedding y salida compartidos (tied). No se especifican numero de capas, dimensiones ocultas, cabezas de atencion ni longitud de contexto de entrenamiento. El modelo se entreno de forma nativa en toki pona, sin indicios de que sea un modelo multilingue adaptado.

El entrenamiento combina tres fuentes: el dataset de dialogos Climb-Ai/toki-pona-tiny-dialogues, el corpus Wikipesija (version en toki pona de Wikipedia) y la publicacion lipu tenpo. La model card indica que el modelo esta "pretrained & aligned", lo que sugiere una fase de ajuste sobre dialogos ademas del preentrenamiento, aunque no se detalla si se uso RLHF, DPO u otra tecnica de alineacion, ni el numero de tokens de entrenamiento. Entre las innovaciones destacadas por el autor figuran el manejo correcto de la notacion cartouche con corchetes y comas, y un formateo limpio de frases con mayuscula inicial y espaciado de puntuacion correcto.

## Capacidades

- Generacion de texto y conversacion multi-turno en toki pona, con un formato de prompt basado en los tokens especiales `<|user|>` y `<|bot|>`.
- Dialogos cotidianos y de presentacion (saludos, identidad del modelo, preguntas simples sobre el mundo).
- Manejo nativo de cartouches para nombres propios extranjeros: `ma [Po,li,na]`, `ma [To,ki,o]`, `ma [Ni,po,n]`.
- Formateo de frases con mayuscula inicial y puntuacion sin espaciado defectuoso.
- Generacion extremadamente rapida en CPU (mas de 2.500 tokens por segundo segun el autor).
- Compatibilidad con endpoints OpenAI a traves de `llama-server` y con interfaces como Open WebUI.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, codigo, matematicas, vision ni audio.

## Casos de uso

- Chat de demostracion en toki pona: el modelo puede mantener conversaciones simples de presentacion y preguntas cotidianas, adecuado para demos educativas o para practicar la lengua con un interlocutor artificial ligero.
- Aplicacion movil o embebida offline: con 11,67 MB y ejecucion en CPU pura mediante llama.cpp, cabe en dispositivos con recursos minimos y no requiere GPU ni conexion a internet.
- Banco de pruebas de entrenamiento en lenguas de bajos recursos: sirve para experimentar con pipelines de preentrenamiento y alineacion sobre corpus pequenos como toki-pona-tiny-dialogues y Wikipesija.
- Generacion de texto asistida en toki pona: util para producir frases de ejemplo, ejercicios o material didactico con formato correcto de mayusculas y puntuacion.
- Prototipado de servidores compatibles con OpenAI: el ejemplo con `llama-server` y Open WebUI permite integrar el modelo en un frontend de chat estandar para validar arquitecturas de despliegue antes de escalar a modelos mayores.
- Normalizacion de nombres extranjeros en toki pona: el soporte de cartouches facilita tareas de transcripcion y formateo de toponimos y antroponimos segun las convenciones de la lengua.
- Evaluacion comparativa de eficiencia: su throughput declarado en CPU lo convierte en una referencia para medir el coste minimo de inferencia de un transformer decoder-only.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el modo documentado; el modelo se ejecuta en CPU con `-ngl 0` (cero capas en GPU).
- GPU recomendadas: no se especifican; cualquier GPU con soporte llama.cpp podria alojar el modelo, pero el caso de uso documentado es CPU.
- Cabe en cualquier GPU de consumo e incluso en dispositivos sin GPU: el fichero GGUF ocupa 11,67 MB.
- Opciones de despliegue: `llama-cli` para terminal, `llama-server` para servidor local compatible con la API de OpenAI, y Open WebUI como frontend (conexion a `http://127.0.0.1:8080/v1`).
- Parametros de ejecucion recomendados por el autor: `--temp 0.1` (rango 0.1-0.2 en Open WebUI), `--no-warmup`, `-c 256` en el ejemplo de servidor y system prompt vacio.
- Latencia y throughput: mas de 2.500 tokens por segundo en CPU pura segun la model card; no se aportan mediciones independientes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Climb 1 Toki | 3,05M (2,85M ligados) | no disponible | toki pona | Apache 2.0 | GGUF, PyTorch |
| Modelos Micro-LLaMA genericos | no disponible | no disponible | no disponible | no disponible | no disponible |
| Modelos especializados en lenguas de bajos recursos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria (micro-LLaMA especializados en una lengua construida) en la informacion proporcionada.

## Limitaciones y advertencias

- Capacidad linguistica y de conocimiento del mundo muy limitada: con 3,05M parametros y entrenamiento exclusivo en toki pona, no es adecuado para tareas generales, codigo, matematicas ni razonamiento complejo.
- Riesgo elevado de alucinacion en preguntas factuales fuera del corpus de entrenamiento (dialogos, Wikipesija, lipu tenpo).
- Monolingue: solo soporta toki pona (codigo `tok`); no se documenta ningun otro idioma.
- Longitud de contexto no especificada; el ejemplo de servidor usa `-c 256`, lo que sugiere ventanas muy cortas en la practica.
- No se documentan mecanismos de tool calling ni de razonamiento multi-paso, por lo que no es apto para pipelines de agentes.
- La model card recomienda temperatura muy baja (0.1-0.2) y system prompt vacio; desviarse de estos ajustes puede degradar la calidad de las respuestas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre sesgos, exactitud ni idoneidad para produccion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad ni reportes independientes de calidad.

## Enlaces

- Modelo en Hugging Face (GGUF): https://huggingface.co/Climb-Ai/Climb-1-Toki-GGUF
- Pesos PyTorch y codigo del modelo: https://huggingface.co/Climb-Ai/Climb-1-Toki
- Dataset de dialogos: https://huggingface.co/datasets/Climb-Ai/toki-pona-tiny-dialogues
- Dataset Wikipesija: https://huggingface.co/datasets/NetherQuartz/wikipesija
- Dataset de frases en toki pona: https://huggingface.co/datasets/finnnnnnnnnnn/toki-pona-sentences
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Open WebUI: https://github.com/open-webui/open-webui
