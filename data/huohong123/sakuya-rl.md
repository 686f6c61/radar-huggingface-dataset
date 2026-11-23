# huohong123/Sakuya-rl

## Resumen

Sakuya-RL es un agente de aprendizaje por refuerzo desarrollado por el usuario huohong123 para el juego de lucha Bleach vs. Naruto (死神vs火影 竞技版). A diferencia de un modelo de lenguaje, se trata de un controlador de IA empaquetado como plugin de Adobe AIR que se ejecuta íntegramente dentro de la máquina virtual ActionScript del juego: lee el estado del luchador a través del hook de extensión de IA nativo del juego, ejecuta una red neuronal en AS3 y escribe una máscara de 28 acciones binarias en cada fotograma. No requiere proceso externo, socket ni captura de pantalla.

La arquitectura es una red neuronal fully-connected de tres capas (76 → 128 → 128 → 28) que recibe un estado de 16 dimensiones apilado en 4 fotogramas (76 entradas) y emite 28 logits que se muestrean de forma independiente por bit mediante sigmoide. El entrenamiento combina clonación de comportamiento (BC) sobre 8954 fotogramas de partidas IA contra IA grabadas y un ajuste fino con PPO sobre 47190 fotogramas en 2150 episodios.

El modelo es relevante como ejemplo de despliegue de políticas neuronales dentro de runtimes restringidos (AS3, límite de 64 KB de bytecode por método, pesos embebidos en base64) y por documentar con honestidad sus limitaciones: las acciones de ataque no se transfieren desde el profesor porque este solo ataca en el 4,0 % de los fotogramas. El repositorio no redistribuye ningún código del desarrollador del juego; todo el código es original y se publica bajo Apache-2.0, con los pesos bajo CC BY-SA 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal fully-connected (MLP) 76 → 128 → 128 → 28, ejecutada en ActionScript 3 dentro de Adobe AIR |
| Parametros totales | Aproximadamente 30.000 floats (según la model card, pesos embebidos como blob base64) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; estado de 16 dimensiones con apilado de 4 fotogramas (76 entradas) |
| Tipos de cuantizacion | No disponible (pesos en coma flotante embebidos en base64) |
| Idiomas soportados | en (metadatos y documentación; el agente no procesa lenguaje) |
| Licencia | Código Apache-2.0; pesos CC BY-SA 4.0 |
| Formato de pesos | Blob base64 decodificado en tiempo de carga, recompilado en `as3/ai/Weights.as`; distribución como SWF (ZWS/LZMA, versión 43) |

## Arquitectura y entrenamiento

El agente implementa el contrato de plugin de IA del juego: la clase símbolo del SWF se llama `AIMain` y expone `CONFIG` y `getCustomAIClass()`; la clase devuelta recibe `(AILevel:int, fighter:*)` en el constructor y declara 28 flags booleanos públicos de acción (`moveLeft`, `attack`, `defense`, `catch1`, `bishaSUPER`, etc.). El estado del luchador se lee por duck typing (`fighter.x`, `fighter.hpRate`, `fighter.actionState`, `fighter.getCurrentTarget()`), igual que la IA nativa del juego. En cada llamada a `render()` se construye un vector de 16 dimensiones, se apila con los 3 fotogramas anteriores (76 entradas), se normaliza con media y desviación típica, se pasa por la red (76 → 128 → 128 → 28), se muestrea cada bit de la sigmoide del logit correspondiente y se escriben los 28 flags. La recompensa por paso es `(HP perdido del enemigo − HP propio perdido) × 10` y se registra una fila JSONL por fotograma.

El entrenamiento se realizó en dos fases. La primera, clonación de comportamiento sobre 8954 fotogramas de partidas IA contra IA, alcanzó un 96,3 % de precisión por bit, 37,6 % de coincidencia exacta de fotograma y una distancia de Hamming de 1,05 bits, frente a un 13,6 % de coincidencia del baseline todo-ceros. La segunda, ajuste fino con PPO sobre 47190 fotogramas en 2150 episodios, redujo la entropía final de 17,21 a 3,06 sobre 28 bits al usar actor-critic, con una pérdida de valor que bajó de 0,148 a 0,084. La innovación técnica destacable es el empaquetado: los pesos se embeben como blob base64 porque inlinar 30.000 floats como literal de array superaría el límite de 64 KB de bytecode por método de AS3, lo que además reduce el tamaño del SWF. El bucle de entrenamiento es iterativo: jugar una partida → el plugin escribe `rl.jsonl` en `%APPDATA%` → `ppo_train2.py` → `export_rl.py` reescribe `as3/ai/Weights.as` → recompilar → reinstalar → volver a jugar. La compilación requiere AIR SDK (probado con 50.2) y Java 11 o superior, con `mxmlc` y `-swf-version=43`.

## Capacidades

- Control de un luchador en Bleach vs. Naruto mediante 28 acciones binarias por fotograma (movimiento, ataque, defensa, agarre, super, etc.).
- Toma de decisiones por fotograma a partir de un estado de 16 dimensiones con memoria de 4 fotogramas.
- Política estocástica por bit: el muestreo independiente de cada sigmoide rompe simetrías y evita bloqueos especulares.
- Clonación de comportamiento de una IA profesora (96,3 % de precisión por bit).
- Ajuste fino con PPO actor-critic y sin crítico, con registro de recompensa por paso.
- Inferencia completamente embebida en la VM ActionScript del juego, sin proceso externo ni socket.
- Incluye un controlador de reglas (`rule-ai.swf`, 2,2 KB) como baseline y verificación del contrato de plugin.
- Capacidades multilingües: no aplica (no procesa lenguaje).
- Sin soporte de tool calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Investigación en aprendizaje por refuerzo embebido: sirve como banco de pruebas para desplegar políticas neuronales en runtimes con restricciones severas (AS3, límite de bytecode, sin acceso a red), documentando el ciclo completo de captura, entrenamiento y recompilación.
- Clonación de comportamiento de IAs de juego: el pipeline BC sobre 8954 fotogramas y el formato JSONL de registro permiten replicar la metodología para extraer políticas de controladores existentes en otros juegos con hooks de IA.
- Estudio de PPO en entornos con recompensa escasa: el caso documenta cómo la exploración insuficiente impide descubrir acciones raras (ataques al 4,0 % de los fotogramas) y por qué la fase PPO es necesaria para corregirlo.
- Baseline para comparación de controladores: el `rule-ai.swf` de 2,2 KB con su escalera if/else documentada (dash si distancia > 260, ataque normal entre 70 y 120, agarre cada 8 fotogramas a distancia ≤ 70, guardia con enemigo en estado 20–30, salto con enemigo 60 px por encima) ofrece una referencia reproducible frente a la política neuronal.
- Docencia sobre empaquetado de pesos en entornos restringidos: la técnica de blob base64 para evitar el límite de 64 KB por método es directamente aplicable a otros despliegues en plataformas con límites de bytecode.
- Autoaprendizaje asimétrico (limitado): el juego solo permite una clase de controlador para ambos jugadores, por lo que el self-play asimétrico (pesos nuevos contra viejos) no es posible en proceso; el caso sirve para documentar esta restricción y diseñar alternativas fuera del juego.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Métrica | Valor |
|---|---|
| Precisión por bit (BC) | 96,3 % |
| Coincidencia exacta de fotograma (BC) | 37,6 % |
| Distancia de Hamming (BC) | 1,05 bits |
| Baseline todo-ceros | 13,6 % |

Ajuste fino con PPO, 47190 fotogramas en 2150 episodios:

| Métrica | Sin crítico | Actor-critic |
|---|---|---|
| Entropía final | 17,21 / 28 bits | 3,06 / 28 bits |
| Pérdida de valor | — | 0,148 → 0,084 |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo se ejecuta en la VM ActionScript del juego, no en GPU.
- GPU recomendadas: no aplica.
- Cabe en cualquier equipo capaz de ejecutar Bleach vs. Naruto con Adobe AIR; el plugin pesa 122 KB (SWF ZWS/LZMA versión 43).
- Opciones de despliegue: copiar el SWF en `assets/ai/` y seleccionarlo en el selector de IA antes de iniciar la partida; el controlador no se puede cambiar a mitad de combate.
- Compilación: AIR SDK (probado 50.2) y Java 11+, con `mxmlc -swf-version=43 -default-frame-rate=30`.
- Latencia y throughput: la inferencia ocurre una vez por fotograma a 30 fps; no se publican cifras de latencia por fotograma.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (agentes RL embebidos en runtimes de juego con contrato de plugin Adobe AIR). El propio repositorio incluye un baseline interno, el controlador de reglas `rule-ai.swf`:

| Modelo | Tipo | Tamaño | Entrenamiento | Licencia |
|---|---|---|---|---|
| Sakuya-RL | MLP 76→128→128→28 | ~30.000 floats, SWF de 122 KB | BC (8954 fotogramas) + PPO (47190 fotogramas) | Apache-2.0 (código), CC BY-SA 4.0 (pesos) |
| rule-ai | Escalera if/else escrita a mano | SWF de 2,2 KB | Ninguno | Apache-2.0 |

## Limitaciones y advertencias

- Las acciones de ataque no se transfieren: la IA profesora solo ataca en el 4,0 % de los fotogramas y el modelo entrenado con BCE colapsa a caminar y lanzar, con los bits de ataque cerca de cero. Corregirlo requiere demostraciones humanas o más exploración en RL.
- Bloqueo especular bajo argmax: dos instancias que comparten pesos ven estados simétricos y emiten acciones idénticas, congelándose en el sitio (observado durante 15 segundos seguidos). El muestreo por bit lo rompe, pero introduce estocasticidad.
- Cambio de objetivo en modo musou: `tx` y `thp` saltan abruptamente y el apilado de 4 fotogramas no se reinicia al cambiar de enemigo.
- Self-play asimétrico imposible en proceso: el juego permite una sola clase de controlador de IA para ambos jugadores.
- El controlador no se puede intercambiar a mitad de combate.
- Riesgo de alucinación: no aplica (no es un modelo generativo de lenguaje); el riesgo equivalente es la generalización defectuosa fuera de las condiciones de entrenamiento.
- Sesgos conocidos: la política hereda los sesgos de la IA profesora, incluida su baja frecuencia de ataque.
- Licencia: el código es Apache-2.0, pero los pesos son CC BY-SA 4.0, lo que impone compartir igual las obras derivadas de los pesos; verificar compatibilidad antes de uso comercial.
- Los assets del juego, nombres de personajes y el código de IA del desarrollador son propiedad de sus respectivos dueños y no se redistribuyen.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación externa de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huohong123/Sakuya-rl
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
