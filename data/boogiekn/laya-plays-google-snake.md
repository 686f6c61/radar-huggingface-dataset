# BoogieKn/laya-plays-google-snake

## Resumen

Laya Plays Google Snake es un checkpoint experimental derivado de Laya, el modelo conversacional multilinguue de Convai Innovations, adaptado por el desarrollador BoogieKn para actuar como controlador del videojuego Google Snake en su version de navegador. Se trata de un ajuste fino de 321.908.998 parametros que conserva el encoder mmBERT-base y el tokenizer del modelo original, pero sustituye las capas de decision conversacional por capas de decision tipadas que puntuan cuatro acciones posibles (UP, RIGHT, DOWN, LEFT) a partir de una descripcion estructurada del tablero. No es un modelo de vision por computador ni un agente de refuerzo: no lee capturas de pantalla ni emite pulsaciones de teclado, sino que recibe un estado textual y devuelve una distribucion de probabilidad sobre movimientos seguros.

El modelo resuelve un problema muy acotado dentro del proyecto open source laya-plays-google-snake: la seleccion de movimientos seguros en un tablero de 17x15 celdas. El controlador que lo rodea se encarga de la captura visual, el seguimiento del estado y el filtrado de movimientos inseguros, de modo que el checkpoint solo tiene que priorizar entre opciones ya validadas. Su relevancia es mas bien metodologica y didactica: ejemplifica como reutilizar un encoder de lenguaje multilingue congelado y entrenar unicamente las capas de decision mediante imitacion supervisada, sin recurrir a aprendizaje por refuerzo.

El checkpoint es de acceso libre bajo licencia Apache-2.0, pesa 1,3 GB en el repositorio y fue publicado el 1 de octubre de 2026. Su adopcion es practicamente nula en el momento de redactar esta ficha (cero descargas y un solo "me gusta"), y esta pensado para ejecutarse exclusivamente dentro del runtime propietario del proyecto, no como un pipeline estandar de Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con encoder mmBERT-base congelado y capas de decision tipadas (typed-decision layers) adaptadas |
| Parametros totales | 321.908.998 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors a precision completa; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible a nivel de ficha; el encoder base es multilingue y las descripciones de movimiento del adaptador estan en ingles compacto |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors), acompanado de rl_agent_config.json, encoder/config.json y tokenizer/ |

## Arquitectura y entrenamiento

El modelo parte del checkpoint multilingue de Convai Innovations Laya y conserva su encoder mmBERT-base junto con el tokenizer. Durante la adaptacion, ese encoder permanecio congelado y solo se entrenaron las capas de decision tipadas de Laya mediante imitacion supervisada sobre ejemplos equilibrados de movimientos de Snake generados por el simulador del propio proyecto. No hubo entrenamiento extremo a extremo ni aprendizaje por refuerzo sobre capturas reales del navegador. El fichero rl_agent_config.json registra la etiqueta snake-balanced-imitation-frozen-encoder, pero no documenta los hiperparametros exactos de la ejecucion original, por lo que el autor advierte que un reentrenamiento no garantiza reproducir pesos identicos.

La innovacion tecnica principal es precisamente esa separacion de responsabilidades: el modelo no procesa pixeles ni controla el teclado, sino que solo puntua un conjunto reducido de movimientos ya filtrados por seguridad y extraidos de una descripcion textual estructurada del tablero. La adaptacion se hizo para un tablero clasico de Google Snake de 17x15 y descripciones compactas en ingles. Al tratarse de un checkpoint custom, requiere el runtime y la politica snake_laya del proyecto, y no funciona en el widget de inferencia por defecto de Hugging Face ni como pipeline estandar.

## Capacidades

- Puntuacion de acciones discretas: genera probabilidades comparativas sobre las opciones UP, RIGHT, DOWN y LEFT a partir de un estado textual del tablero.
- Decision tipada: sustituye la generacion de lenguaje libre por una clasificacion cerrada sobre movimientos validos.
- Integracion con controlador externo: trabaja junto al software del proyecto, que se encarga de la vision, el seguimiento de posicion y el filtrado de movimientos inseguros.
- Razonamiento de estado a corto plazo: puede encadenar decisiones durante episodios de hasta 160 pasos en simulador antes de reiniciar.
- Ejecucion en GPU y CPU: el runtime admite --device cuda y --device cpu, aunque el segundo no ha sido validado para la sincronizacion de entrada en juego en vivo.
- No soporta vision, audio, tool calling, function calling, agentes multi-paso ni generacion de texto abierta.
- Capacidad multilingue heredada: el encoder mmBERT-base es multilingue, pero el adaptador se entreno con descripciones en ingles; no se documenta rendimiento en otros idiomas.

## Casos de uso

- Investigacion en imitacion supervisada sobre encoders congelados: sirve como caso de estudio reproducible para medir cuanto puede aprender un conjunto de capas de decision cuando el encoder linguistico permanece fijo, usando el simulador del proyecto como fuente de datos etiquetados.
- Banck de pruebas para arquitecturas de decision tipada: permite evaluar si una representacion textual estructurada del estado es suficiente para tareas de control discreto, comparandola con enfoques de vision por refuerzo.
- Automatizacion de partidas en simulador: el modelo puede jugar episodios completos en el simulador local (10 episodios de 160 pasos con semillas fijas) para generar trayectorias y estadisticas de rendimiento sin intervencion manual.
- Control asistido en el juego real de navegador: integrado con el controlador del proyecto, puntua movimientos seguros mientras el software externo gestiona captura de pantalla, enfoque de ventana y pulsaciones de teclado.
- Docencia y divulgacion sobre agentes de videojuegos: al separar vision, filtrado y decision, resulta util para explicar en un aula o tutorial las distintas capas que componen un agente de juego.
- Pruebas de robustez de politicas ante estados ambiguos: el simulador permite inyectar configuraciones de tablero y medir como responde la politica cuando hay empates o movimientos bloqueados.
- Referencia para adaptaciones de Laya a otros dominios discretos: el mismo patron (encoder congelado mas capas de decision entrenadas por imitacion) podria trasladarse a otros juegos de rejilla o tareas de eleccion cerrada, siempre que se disponga de un simulador que genere ejemplos equilibrados.

## Benchmarks y rendimiento

Los unicos datos publicados provienen de la evaluacion del propio autor en simulador, no de partidas reales de Google Snake.

| Metrica | Resultado | Condiciones |
|---|---|---|
| Manzanas por episodio (media) | 12,6 | 10 episodios en simulador, 160 pasos cada uno, semillas fijas, evaluado el 2026-09-26 |
| Mejor episodio | 15 manzanas | mismo conjunto de evaluacion |
| Peor episodio | 6 manzanas | mismo conjunto de evaluacion |
| Repeticion de posiciones | 71 pasos en un episodio | sintoma de bucle en la politica |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las cifras anteriores corresponden a simulacion y no incluyen errores de seguimiento visual, perdida de foco del navegador, oclusion ni latencia del teclado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 321,9 millones de parametros en safetensors a precision completa (FP32) el modelo ocupa aproximadamente 1,3 GB de pesos, por lo que en FP16 rondaria los 0,65 GB mas el overhead del encoder y el runtime.
- GPU recomendadas: no se especifican modelos concretos; el autor indica que la configuracion acelerada probada es Windows con una GPU NVIDIA.
- Viabilidad en GPU de consumo: por tamano (menos de 350 millones de parametros) es plausible que quepa en practicamente cualquier GPU de consumo reciente, aunque esto no esta confirmado en la documentacion oficial.
- CPU: soportada mediante --device cpu, pero no validada para la sincronizacion de entrada en juego en vivo.
- Opciones de despliegue: no es compatible con vLLM, TGI, Ollama ni llama.cpp de forma estandar; requiere el runtime y la politica snake_laya del proyecto laya-plays-google-snake. El script de descarga usa el comando hf download de Hugging Face y el gestor de entornos uv.
- Latencia y throughput: no disponibles. El unico dato temporal relevante es que cada episodio de evaluacion consta de 160 pasos maximos.

## Comparativa con modelos similares

No se dispone de datos publicados de benchmarks para este checkpoint, lo que limita una comparacion cuantitativa honesta. La tabla siguiente compara caracteristicas estructurales conocidas con el modelo base y una categoria generica de alternativas.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BoogieKn/laya-plays-google-snake | 321,9 M | no disponible | Control discreto en Snake (4 acciones) | Apache-2.0 | Hugging Face, runtime propio |
| convaiinnovations/laya | no disponible en esta ficha | no disponible | Conversacion multilingue con decisiones tipadas | Apache-2.0 | Hugging Face |
| Alternativas genericas de agentes para juegos de rejilla basadas en vision y RL | no disponible | no disponible | Control visual de juegos | variable | variable |

No se conocen modelos equivalentes publicados que compartan exactamente el mismo enfoque (encoder de lenguaje congelado mas capas de decision tipadas para Google Snake), por lo que la comparativa directa con alternativas de la misma categoria queda como no disponible.

## Limitaciones y advertencias

- El checkpoint fue entrenado por imitacion supervisada sobre ejemplos de simulador, no por aprendizaje por refuerzo ni con capturas reales del navegador.
- Los resultados de evaluacion (12,6 manzanas de media) proceden de simulacion y no reflejan el rendimiento en una partida real de Google Snake.
- Uno de los diez episodios de evaluacion repitio posiciones durante 71 pasos, lo que indica tendencia a bucles en la politica.
- Las probabilidades de salida comparan las opciones ofrecidas y no son probabilidades calibradas de supervivencia en una partida real.
- El controlador externo puede excluir un movimiento o sobrescribir la prediccion principal por motivos de seguridad o seguimiento, de modo que el modelo no tiene control total de las decisiones.
- No esta destinado a control de sistemas criticos para la seguridad; el autor lo califica explicitamente como no apropiado para ese uso.
- No se documentan hiperparametros exactos del entrenamiento original, por lo que no se garantiza reproducibilidad de los pesos en un reentrenamiento.
- No se han documentado sesgos especificos, riesgos de alucinacion textual (no genera lenguaje abierto) ni comportamiento en idiomas distintos del ingles.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero exige conservar los avisos de licencia y atribucion del proyecto y del modelo base.
- El proyecto se declara independiente y sin afiliacion con Google ni con Convai Innovations.
- No funciona en el widget de inferencia estandar de Hugging Face; requiere el runtime snake_laya.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BoogieKn/laya-plays-google-snake
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Repositorio del proyecto: https://github.com/Makankn/laya-plays-google-snake
- Codigo de entrenamiento: https://github.com/Makankn/laya-plays-google-snake/blob/main/src/snake_laya/training.py
- README del proyecto con instrucciones de juego en vivo: https://github.com/Makankn/laya-plays-google-snake#try-it
- Instalador uv: https://docs.astral.sh/uv/
