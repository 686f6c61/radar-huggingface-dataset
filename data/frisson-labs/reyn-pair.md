# frisson-labs/Reyn-Pair

## Resumen

Reyn-Pair es un modelo experimental de aprendizaje por refuerzo desarrollado por frisson-labs para jugar partidas 2v2 con dos personajes Fox en el videojuego Super Smash Bros. Melee. A diferencia de un agente de juego convencional, el modelo incorpora un mecanismo de "language steering": cada uno de los dos Fox puede recibir una instruccion en lenguaje natural independiente (o compartir la misma), y el modelo ajusta su politica de accion en consecuencia sin dejar de jugar. El modelo se distribuye como pesos PyTorch (`policy.pt`, `steering.pt`, `config.json` y `checksums.sha256`) con un paquete de inferencia en Python (`reyn_doubles`).

El interes tecnico reside en la combinacion de dos problemas: el control multiagente cooperativo en un entorno de fisica complejo (Melee) y la condicionalidad de la politica mediante representaciones de lenguaje precalculadas. El autor declara un conjunto cerrado de 102 comandos disponibles, con representaciones de lenguaje cacheadas, lo que implica que el modelo no soporta parafrasis libre ni entrada de voz. Es un lanzamiento experimental y asi se etiqueta en el repositorio.

No se dispone de informacion sobre la arquitectura interna (tipo de red, numero de parametros, longitud de contexto en el sentido de LLM), el dataset de entrenamiento ni la licencia. El tamano del repositorio es de 0,1 GB, lo que sugiere un modelo pequeno orientado a inferencia en tiempo real de un emulador de GameCube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de politica para aprendizaje por refuerzo; detalles de red no publicados) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje generativo; usa representaciones de lenguaje cacheadas para 102 comandos) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch, sin variantes GGUF/INT8 documentadas) |
| Idiomas soportados | no disponible (comandos en ingles segun la referencia de comandos) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`policy.pt`, `steering.pt`, `config.json`, `checksums.sha256`) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura de red (transformer, CNN, MLP u otra), el numero de parametros ni la composicion del dataset de entrenamiento. La model card indica que el modelo se entrena mediante aprendizaje por refuerzo para el juego Super Smash Bros. Melee, con un modulo de "steering" por lenguaje que condiciona la politica. El modelo recibe arrays de estado de cuatro jugadores y tensores de entrada del modelo, y devuelve tensores de controlador predichos con forma `[2, 13]` en orden de puerto de companero.

La innovacion destacable es el mecanismo de condicionamiento por lenguaje: las instrucciones se traducen a representaciones cacheadas y se aplican por destinatario (`fox1`, `fox2` o ambos), persistiendo hasta que se reemplazan o se limpian con `clear()`. El modelo incluye una mascara opcional de fuego amigo (desactivada por defecto) que bloquea entradas de ataque cuando un companero golpeable esta a menos de 30 unidades de juego, con radio ajustable. Esta mascara es un filtro de proximidad y no predice hitboxes ni detiene ataques en curso.

## Capacidades

- Juego 2v2 de Super Smash Bros. Melee con dos Fox por equipo, en orden de puerto especifico (equipo 0: puertos 1 y 2; equipo 1: puertos 3 y 4).
- Instrucciones de lenguaje natural por personaje: 102 comandos cerrados que cubren movimiento en plataformas, eleccion de ataque, defensa y juego en equipo.
- Instruccion independiente por Fox, comando compartido para ambos, o un Fox sin steering mientras el otro recibe ordenes.
- Persistencia de instrucciones hasta reemplazo o limpieza, con `clear()` y `reset()` para volver a juego sin steering o reiniciar el historial.
- Mascara opcional de fuego amigo configurable por radio.
- Inferencia en GPU (`--device cuda`) mediante el paquete `reyn_doubles`; solo incluye inferencia, no entrenamiento.
- No soporta parafrasis libre ni voz: el runtime rechaza frases no soportadas y usa representaciones cacheadas de las frases exactas.

## Casos de uso

- Investigacion en control multiagente cooperativo: el modelo sirve como banco de pruebas para estudiar como una politica compartida coordina dos agentes con instrucciones independientes en un entorno de fisica con fuego amigo activado.
- Estudio de condicionamiento por lenguaje en agentes de juego: permite medir la fidelidad de seguimiento de comandos frente a la fuerza de juego base, comparando partidas con steering activado y desactivado.
- Evaluacion de robustez en entornos parcialmente observables: los arrays de estado de cuatro jugadores y el historial de vistas permiten analizar el comportamiento ante informacion limitada del rival.
- Benchmark de agentes de Melee: el autor reporta 31/32 victorias contra un par de Fox de Faynt, 32/32 contra politicas Reyn 1v1 Fox y 31/32 contra un par de SmashBot Fox, lo que lo hace util como referencia de fuerza en 2v2.
- Desarrollo de interfaces de alto nivel para agentes: el paquete de inferencia y el contrato de entradas (`inputs.md`) facilitan integrar el modelo en pipelines de investigacion con instrucciones por personaje.
- Experimentos de seguridad y fuego amigo: la mascara de proximidad permite estudiar el equilibrio entre agresividad y dano al companero en combate cooperativo.
- Demostraciones y analisis cualitativo: los clips continuos de dos segundos permiten ilustrar la activacion de comandos y la respuesta del modelo en publicaciones o charlas tecnicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta tasas de victoria en partidas sin steering de lenguaje (31/32 contra Faynt Fox, 32/32 contra Reyn 1v1 Fox, 31/32 contra SmashBot Fox), que miden fuerza de combate, no seguimiento de comandos.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio pesa 0,1 GB, lo que sugiere un modelo pequeno que probablemente cabe en GPUs de consumo, aunque no se confirma.
- GPU recomendadas: no disponibles; la inferencia se documenta con `--device cuda` sin especificar modelos.
- Cabe en GPU de consumo: probablemente si, dado el tamano del repositorio, pero no confirmado por el autor.
- Opciones de despliegue: paquete Python `reyn_doubles` instalado con `pip install ./pair`; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Reyn-Pair | Politica RL 2v2 con steering por lenguaje | no disponible | no disponible | no disponible | Hugging Face |
| Reyn 1v1 Fox (frisson-labs) | Politica RL 1v1 | no disponible | no disponible | no disponible | Coleccion Reyn en Hugging Face |
| Faynt Fox pair | Politica RL de referencia citada por el autor | no disponible | no disponible | no disponible | no disponible |
| SmashBot Fox pair | Agente de referencia citado por el autor | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo exclusivamente Fox y experimental: rechaza otras composiciones de roster y solo admite los puertos 1-4 en el orden indicado.
- Solo soporta las frases exactas de la referencia de comandos (102 instrucciones); no admite parafrasis ni voz, y el runtime rechaza frases no soportadas.
- Los comandos pueden fallar o depender de la situacion; las peticiones de agarre y combo requieren una apertura adecuada y las instrucciones de plataforma requieren un escenario con esa plataforma.
- La mascara de fuego amigo es un filtro de proximidad: no predice hitboxes, no detiene ataques en curso y no cambia la configuracion de fuego amigo del juego; los golpes al companero siguen siendo posibles.
- Las tasas de victoria reportadas se obtuvieron con la mascara desactivada y miden fuerza de combate, no seguimiento de comandos.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribucion.
- No se han publicado datos de sesgos, alucinacion (no aplica en el sentido de LLM) ni limitaciones de idioma mas alla del ingles de los comandos.
- El paquete incluye solo inferencia; no se distribuye codigo de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/frisson-labs/Reyn-Pair
- Referencia de comandos: https://huggingface.co/frisson-labs/Reyn-Pair/blob/main/COMMANDS.md
- Resultados y limites: https://huggingface.co/frisson-labs/Reyn-Pair/blob/main/RESULTS.md
- Contrato de entradas: https://github.com/frisson-labs/Reyn/blob/main/pair/docs/inputs.md
- Paquete de inferencia: https://github.com/frisson-labs/Reyn/tree/main/pair
- Coleccion Reyn: https://huggingface.co/collections/frisson-labs/reyn-6af5d6e9506dca3a131b13c3
- Blog del autor: https://www.frisson-labs.com/reyn
