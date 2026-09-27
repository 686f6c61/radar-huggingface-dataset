# nakas/chessgpt-coach-4b-v1-q4f16_1-MLC

## Resumen

ChessGPT Coach 4B v1 (q4f16_1, MLC) es una adaptacion de Qwen3-4B orientada especificamente a explicar errores de ajedrez en lenguaje natural. El autor, identificado en HuggingFace como nakas, partio del modelo base Qwen/Qwen3-4B y aplico un ajuste fino con LoRA (posteriormente fusionado) para que el modelo narre hechos verificados por motor (lineas de Stockfish y motivos tacticos detectados por programa) adaptando el nivel de explicacion a la valoracion Elo del jugador. El resultado se publica como build de MLC-LLM/WebLLM, lo que permite ejecutarlo integramente en el navegador mediante WebGPU.

El modelo no es un motor de ajedrez ni evalua posiciones por si mismo: su funcion es la capa de comunicacion. Recibe hechos ya calculados por Stockfish y motivos detectados por software externo, y los convierte en texto comprensible para el jugador. Esta separacion es relevante porque evita que el modelo tenga que razonar sobre el tablero y limita el riesgo de alucinacion tactica, siempre que las lineas y motivos se inyecten correctamente en el prompt.

Tecnicamente es un transformer decoder-only denso de aproximadamente 4.000 millones de parametros, cuantizado en formato q4f16_1 (int4 con escalas en fp16) para su uso en WebGPU. Los pesos proceden del build oficial mlc-ai/Qwen3-4B-q4f16_1-MLC, al que se le sustituyeron las proyecciones de atencion y MLP por las versiones ajustadas y cuantizadas de la misma forma. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-4B); pesos compilados para MLC-LLM |
| Parametros totales | ~4B (heredados de Qwen/Qwen3-4B; el autor no publica recuento propio) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | q4f16_1 (int4 de grupo con escalas fp16); unica variante publicada |
| Idiomas soportados | no disponible; la model card no declara lista de idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | Pesos compilados de MLC-LLM/WebLLM (no safetensors ni GGUF); repositorio de 2,3 GB |
| Modelo base | Qwen/Qwen3-4B |
| Metodo de ajuste | LoRA fusionado (merged) sobre el build mlc-ai/Qwen3-4B-q4f16_1-MLC |
| Libreria | mlc-llm (WebLLM en navegador) |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion | 2026-09-27 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B: un transformer decoder-only denso con atencion por causalidad. Sobre ese modelo, el autor aplico un ajuste fino supervisado mediante LoRA y fusiono despues los adaptadores en los pesos base. El proceso descrito no incluye RLHF ni DPO; se trata de un ajuste de estilo y dominio orientado a generar explicaciones de ajedrez ancladas a hechos externos. El objetivo declarado es que el modelo describa errores usando lineas de Stockfish y motivos detectados por programa, ajustando el registro al nivel de Elo del jugador destinatario.

La innovacion tecnica relevante no esta en la arquitectura, sino en el procedimiento de publicacion: el autor tomo el build cuantizado oficial mlc-ai/Qwen3-4B-q4f16_1-MLC y sustituyo unicamente las proyecciones de atencion y MLP por las versiones ajustadas, cuantizandolas del mismo modo para conservar la compatibilidad con el runtime. Segun la model card, la verificacion se hizo byte a byte contra el build oficial sobre el modelo base, lo que garantiza que el grafo compilado y la estructura de cuantizacion son identicos y solo cambian los valores de los pesos ajustados. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni los hiperparametros del ajuste.

## Capacidades

- Generacion de texto en dominio de ajedrez: explicaciones de errores, descripcion de lineas de jugadas y narracion de motivos tacticos.
- Adaptacion del nivel explicativo al Elo del jugador, segun lo declarado en la model card.
- Integracion con hechos verificados por motor: el modelo consume salidas de Stockfish y de detectores de motivos en lugar de calcular variantes por si mismo.
- Ajuste conversacional heredado del modelo base Qwen3-4B (chat multi-turno), aunque no se detalla el formato de prompt usado.
- Inferencia en navegador mediante WebLLM y WebGPU, sin necesidad de servidor.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la model card no declara idiomas soportados.
- Vision, audio o modo thinking: no disponible; no se mencionan en la informacion proporcionada.

## Casos de uso

- Analisis post-partida en aplicaciones web de ajedrez: el modelo recibe la salida de Stockfish (jugada optima, evaluacion, variante principal) y la convierte en una explicacion en lenguaje natural para el jugador, sin necesidad de backend de inferencia.
- Entrenadores integrados en navegador: al ejecutarse con WebLLM sobre WebGPU, permite ofrecer un coach conversacional dentro de la propia pagina de ajedrez, con coste cero de servidor y sin enviar la partida a terceros.
- Explicacion de errores por niveles: dado el Elo del usuario (por ejemplo, 800 frente a 1800), el modelo puede ajustar la profundidad de la explicacion tactica, segun lo declarado por el autor.
- Narracion de motivos tacticos detectados por software: cuando un detector externo marca una horquilla, un clavado o una pieza colgada, el modelo redacta la descripcion y su consecuencia en la partida.
- Generacion automatizada de comentarios para bases de datos de partidas (PGN): procesar un lote de partidas y anotar cada error con texto explicativo, usando las lineas de motor como anclaje factual.
- Asistente de estudio de aperturas con motor externo: el modelo describe por que una jugada sale del repertorio segun la evaluacion del motor, siempre que la informacion le llegue ya calculada.
- Prototipado de interfaces de coaching sin infraestructura GPU: el despliegue en navegador con el build MLC permite validar producto en equipos de desarrollo con portatiles convencionales y GPU integrada compatible con WebGPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K, pruebas de calidad de explicacion de ajedrez ni comparaciones cuantitativas con otros modelos. Tampoco se aportan metricas de latencia o throughput.

## Requisitos de hardware

- Inferencia en navegador: requiere un navegador con soporte de WebGPU (Chrome/Edge recientes) y una GPU compatible; el backend es WebLLM sobre MLC-LLM.
- Huella de pesos: el repositorio ocupa 2,3 GB, por lo que se necesita al menos ese espacio en cache del navegador o en disco, mas memoria de GPU para los buffers de inferencia.
- VRAM estimada: no disponible de forma explicita; en la practica un modelo de 4B en int4 suele requerir del orden de 2,5 a 3,5 GB de memoria de GPU, pero el autor no publica una cifra verificada.
- GPU de escritorio recomendadas: no disponible en la informacion proporcionada; al ser un build WebGPU, el criterio es la compatibilidad con WebGPU, no el modelo de tarjeta.
- GPUs de servidor (A100, H100, RTX 4090): no disponible; no se documenta despliegue en estos entornos.
- Compatibilidad con GPU de consumo: si, siempre que la GPU exponga WebGPU y disponga de memoria suficiente; no se especifican modelos concretos.
- Opciones de despliegue documentadas: MLC-LLM y WebLLM. No se declara soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato de pesos no es GGUF ni safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| nakas/chessgpt-coach-4b-v1-q4f16_1-MLC | ~4B | no disponible | Explicacion de errores de ajedrez con hechos de motor | q4f16_1 (MLC) | Apache-2.0 | HuggingFace, via WebLLM/MLC |
| Qwen/Qwen3-4B (modelo base) | ~4B | no disponible en la informacion proporcionada | Proposito general, chat | Multiples (no detalladas aqui) | Apache-2.0 | HuggingFace |
| mlc-ai/Qwen3-4B-q4f16_1-MLC | ~4B | no disponible | Proposito general, build WebGPU oficial | q4f16_1 (MLC) | Apache-2.0 | HuggingFace, via WebLLM/MLC |
| Otros asistentes de ajedrez de proposito general | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa significativa se limita al modelo base y a su build oficial de MLC: la diferencia es el ajuste de dominio y el reemplazo de las proyecciones de atencion y MLP. No se dispone de datos de rendimiento que permitan comparar calidad de explicacion frente a alternativas.

## Limitaciones y advertencias

- El modelo no juega al ajedrez ni evalua posiciones: depende de que un motor externo (Stockfish) y un detector de motivos le proporcionen los hechos. Si esos datos son incorrectos o no se inyectan, la explicacion resultante no tiene anclaje factual.
- Riesgo de alucinacion: aunque el diseno busca narrar hechos verificados, no hay garantia de que el modelo no invente variantes, evaluaciones o nombres de motivos cuando el contexto de entrada es ambiguo o incompleto.
- Sesgo de dominio: el ajuste fino esta orientado exclusivamente a explicaciones de ajedrez; es previsible una degradacion en tareas generales respecto a Qwen3-4B original, aunque no se aportan mediciones.
- Idiomas soportados no declarados: no se especifica si el coach funciona en castellano, ingles u otros idiomas, ni la calidad esperada fuera del idioma de entrenamiento.
- Perdida por cuantizacion: el formato q4f16_1 es agresivo (int4), lo que puede reducir la calidad respecto a los pesos sin cuantizar; no se publican comparativas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3-4B y cualquier termino adicional aplicable al build de MLC; conviene revisar ambas fichas antes de un despliegue en produccion.
- Validacion comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, sin evaluaciones independientes ni informes de terceros.
- Compatibilidad restringida: los pesos solo funcionan con el runtime de MLC-LLM/WebLLM; no son directamente utilizables en vLLM, llama.cpp, Ollama, TGI ni en pipelines basados en GGUF o safetensors.
- Requisitos de cliente: el despliegue en navegador depende de WebGPU, lo que excluye navegadores y dispositivos sin soporte.
- Sin datos de contexto: al no declararse la longitud de contexto, no se puede garantizar el manejo de partidas largas o historiales extensos sin truncado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nakas/chessgpt-coach-4b-v1-q4f16_1-MLC
- Proyecto ChessGPT: https://chessgpt.com
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Build oficial de MLC citado en la model card: https://huggingface.co/mlc-ai/Qwen3-4B-q4f16_1-MLC
- Paper, blog o repositorio del ajuste: no disponible en la informacion proporcionada.
- Demo o espacio de prueba: no disponible en la informacion proporcionada.
- Nota sobre la busqueda web: los resultados recuperados para el termino "nakas" corresponden a una tienda y conservatorio de musica en Grecia (nakas.gr, nakas.edu.gr, nakas.com.cy) y a un sitio de streaming, sin relacion con este modelo. No se han encontrado enlaces tecnicos adicionales relevantes.
