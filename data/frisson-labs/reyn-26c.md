# frisson-labs/Reyn-26C

## Resumen

Reyn-26C es un modelo de prediccion de acciones para Super Smash Bros. Melee desarrollado por frisson-labs, disenado para ser controlado mediante instrucciones en lenguaje natural. A diferencia de los modelos de lenguaje convencionales, Reyn recibe tensores estructurados que representan el estado del juego y devuelve la siguiente accion predicha, junto con etiquetas y logits. Su particularidad es el "language steering": un router neuronal interpreta frases como "pull a turnip" o "fire fox" y condiciona la politica de accion resultante, sin necesidad de reentrenar los pesos.

El modelo cubre las 26 personajes de Melee con un unico conjunto de pesos y seis escenarios (incluido Pokemon Stadium congelado). Segun la model card, el 81,8% de los casos de prueba (1.368 de 1.672) cumplieron su objetivo de seguimiento de comandos, combinando el conjunto de comandos generales (386/424, 91,0% en el umbral laxo) y el conjunto de movimientos especiales (982/1.248, 78,7% con frases largas).

Es relevante ahora porque demuestra una via practica para controlar agentes de juego mediante lenguaje natural con un modelo pequeno (repo de 0,2 GB) y pesos fijos en inferencia, lo que lo hace desplegable en entornos de investigacion sin infraestructura pesada. No obstante, la informacion publica es limitada: no se detallan parametros, arquitectura interna ni licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo neuronal de prediccion de acciones; el autor no especifica transformer, MoE ni SSM) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; recibe tensores de estado del juego) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio PyTorch; el download incluye cuatro ficheros de modelo y `checksums.sha256`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Se sabe que es un modelo PyTorch con pesos fijos durante la inferencia, que recibe tensores estructurados (entradas del modelo) y produce una accion predicha, etiquetas y logits. Incluye un "router neuronal" que lee la frase de instruccion tal como se escribe; los inputs de personaje y escenario no reescriben la frase. El mismo conjunto de pesos sirve para los 26 personajes, con cambio de contexto mediante `model.set_context("fox")` sin recargar pesos.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La model card menciona que el modelo se evaluo contra un Fox de nivel 9 en seis escenarios, lo que sugiere un entrenamiento orientado a combate 1v1, pero no se detalla el proceso.

## Capacidades

- Prediccion de la siguiente accion en Super Smash Bros. Melee a partir de tensores de estado del juego.
- Control por lenguaje natural ("language steering") para estilo de juego, movimiento, posicion, plataformas, ataques, defensa, combos, bordes y proyectiles.
- Soporte de las 26 personajes de Melee con los mismos pesos.
- Soporte de 104 movimientos especiales especificos por personaje, con dos frases de ejemplo por movimiento en `commands.csv`.
- Router neuronal que interpreta la frase y devuelve "abstain" si no la acepta, manteniendo el comando anterior activo.
- Gestion de estado de comando: `model.say()`, `model.clear()` y `model.reset()`.
- No se documentan capacidades de tool calling, agentes multi-paso, vision, audio ni modo "thinking".

## Casos de uso

- Investigacion en agentes de juego: usar Reyn como politica base para estudiar como el lenguaje natural modula el comportamiento en un entorno competitivo de lucha, con pesos fijos y API sencilla (`model.predict(inputs, phrase=...)`).
- Prototipado de interfaces de control por voz/texto: integrar el router de comandos en un pipeline que traduzca instrucciones de un jugador humano en acciones del personaje, aprovechando que un comando aceptado persiste en predicciones posteriores.
- Evaluacion de seguimiento de instrucciones: emplear los conjuntos de prueba de la model card (comandos generales y movimientos especiales) como benchmark reproducible de command following en agentes.
- Educacion y divulgacion: demostrar "language steering" en un dominio ludico con ejemplos visuales (Fire Fox, plataforma superior, grab, lasers a distancia) y un modelo de repo pequeno (0,2 GB) facil de descargar.
- Generacion de datos sinteticos de juego: producir trayectorias condicionadas por instrucciones para aumentar datasets de entrenamiento de otros agentes o para analisis de estilos de juego.
- Comparacion de personajes: con `model.set_context()` cambiar de personaje sin recargar pesos para estudiar diferencias de politica entre los 26 luchadores bajo la misma instruccion.
- Pruebas de robustez de comandos: medir la tasa de "abstain" del router y la tasa de ejecucion util (78,0% con frases cortas, 78,7% con largas) en distintos escenarios y personajes.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Conjunto combinado (original + movimientos especiales) | 81,8% (1.368/1.672 casos) |
| Comandos generales, umbral laxo | 386/424 (91,0%); 267 cumplen el umbral estricto, 119 solo el laxo, 38 ninguno |
| Movimientos especiales, frases cortas | 974/1.248 (78,0%) de ejecucion util |
| Movimientos especiales, frases largas | 982/1.248 (78,7%) de ejecucion util |

Los tests de comandos generales cubren Fox, Falco, Marth y Mario en seis escenarios. Los de movimientos especiales cubren los 26 personajes contra un Fox de nivel 9 en seis escenarios, con dos formulaciones de 104 intenciones de movimiento especial. La model card advierte que estos resultados miden seguimiento de comandos y movimientos especiales, no cobertura general de comandos para todos los personajes, reconocimiento de voz, latencia de respuesta ni fuerza de combate. No se han publicado resultados de benchmarks en la informacion disponible mas alla de los anteriores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,2 GB, lo que sugiere un modelo pequeno que probablemente cabe en GPUs de consumo, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por tamano del repo es plausible, pero no hay dato oficial.
- Opciones de despliegue: PyTorch con el paquete de inferencia `reyn` (instalacion via `pip` desde el repositorio de GitHub); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (prediccion de acciones en juegos con control por lenguaje), ni datos de parametros, contexto o rendimiento de alternativas.

## Limitaciones y advertencias

- La model card advierte explicitamente que los resultados no establecen cobertura general de comandos para todos los personajes, ni reconocimiento de voz, ni latencia de respuesta, ni fuerza de combate.
- Los tests de comandos generales solo cubren Fox, Falco, Marth y Mario; el resto de personajes solo se evaluo en movimientos especiales.
- El router puede responder "abstain"; en ese caso el comando anterior sigue activo, lo que puede producir comportamientos no deseados si no se gestiona el estado.
- Solo soporta ingles como idioma de instruccion.
- No se especifica licencia, por lo que el uso comercial queda sin autorizacion clara; hay que contactar con el autor antes de cualquier despliegue productivo.
- No se documentan sesgos, riesgo de alucinacion (en el sentido de comandos mal interpretados) ni limitaciones de contexto mas alla de las anteriores.
- El modelo es de investigacion y no esta pensado como producto; la fecha de creacion (2026-11-12) y la ausencia de descargas y likes indican un lanzamiento muy reciente y sin validacion externa.
- La inferencia requiere mantener juntos los cuatro ficheros de modelo y `checksums.sha256`; el loader verifica los checksums antes de usar.

## Enlaces

- Hugging Face: https://huggingface.co/frisson-labs/Reyn-26C
- Coleccion de modelos: https://huggingface.co/collections/frisson-labs/reyn-6af5d6e9506dca3a131b13c3
- Repositorio GitHub e inference quickstart: https://github.com/frisson-labs/Reyn#quickstart
- Referencia completa de comandos: https://huggingface.co/frisson-labs/Reyn-26C/blob/main/COMMANDS.md
- CSV de movimientos especiales: https://huggingface.co/frisson-labs/Reyn-26C/blob/main/commands.csv
