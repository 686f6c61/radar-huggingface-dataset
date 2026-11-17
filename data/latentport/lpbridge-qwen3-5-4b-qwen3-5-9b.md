# latentport/LPBridge-Qwen3.5-4b-Qwen3.5-9b

## Resumen

LPBridge-Qwen3.5-4b-Qwen3.5-9b es un checkpoint de transferencia de estado (state-transfer) desarrollado por latentport que permite que un modelo Qwen3.5-4B procese la evidencia de una conversacion y transmita su estado interno a un Qwen3.5-9B para que este genere la respuesta. No es un modelo de lenguaje autonomo: es un adaptador de pesos de 22,9 millones de parametros que traduce la cache de atencion, el historial de convolucion, la memoria recurrente y el estado oculto terminal del modelo pequeno al espacio latente del modelo grande. El checkpoint se entreno con torres de texto en NF4 y se distribuye bajo licencia Apache 2.0.

El problema que aborda es el coste de ejecutar modelos grandes en tareas donde la mayor parte del contexto lo aporta un modelo pequeno: en lugar de alimentar al 9B con todo el historial, el 4B lo procesa y solo se transfiere un estado comprimido. El checkpoint corresponde al paso 64 de entrenamiento (L136) y esta pensado para ejecutarse con el runner de referencia o con el paquete LatentPort 0.4.1, que soporta backends bf16, nf4 y gguf.

La relevancia es experimental: el autor reconoce que la evaluacion completa planificada se interrumpio, por lo que la mejora sobre el modelo padre y el rendimiento en capacidades amplias quedan sin verificar. Los resultados publicados se limitan a pantallas reducidas de habilidades y de recuerdo de un dato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de transferencia de estado sobre Qwen3.5 (traduce cache de atencion, historial de convolucion, memoria recurrente y estado oculto terminal entre un 4B y un 9B) |
| Parametros totales | 22.925.376 (checkpoint de transferencia; los modelos base no se incluyen en el repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 (entrenamiento y evaluacion), bf16 y GGUF Q4_K_M (backends del paquete LatentPort) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (step0064.safetensors); GGUF disponible a traves de los modelos base Q4_K_M fijados |

## Arquitectura y entrenamiento

El checkpoint no es un transformer completo sino un modulo de traduccion de estado entre dos modelos de la familia Qwen3.5 (4B y 9B). El modelo 4B procesa la evidencia de la conversacion y genera un estado interno compuesto por la cache de atencion, el historial de convolucion, la memoria recurrente y el estado oculto terminal; el checkpoint transforma ese estado al espacio del 9B, que responde a la siguiente pregunta del usuario. El entrenamiento se realizo con torres de texto cuantizadas en NF4 y el runner de referencia usa NF4, decodificacion greedy y modo thinking desactivado.

El checkpoint publicado corresponde al paso 64 de entrenamiento (L136) y tiene SHA-256 `7a2ae07911662520dc38a59b11f1e49917942777563beb0d10f9809c5c1679cd`. El runner de referencia fija las revisiones de ambos modelos base y verifica este digest antes de cargar el writer. No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Transferencia de estado latente entre Qwen3.5-4B (lector) y Qwen3.5-9B (escritor) para responder preguntas sobre evidencia previa.
- Recuerdo de un dato concreto: en la pantalla de recuerdo de un hecho, el paso 64 respondio 12/12 correctamente, igual que el 9B nativo.
- Habilidades basicas evaluadas con thinking desactivado: coding 4/4, razonamiento 4/4, preguntas sobre documentos 3/4 y seguimiento de instrucciones 3/4.
- Soporte de backends bf16, nf4 y gguf en el paquete LatentPort 0.4.1 mediante `lp.load(..., backend=..., thinking=False)`.
- Modo thinking desactivado en el runner de referencia (no se documenta soporte de thinking activo).
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni multilingues mas alla de las heredadas de los modelos base.

## Casos de uso

- Recuerdo de evidencia en conversaciones multi-turno: el 4B lee el contexto acumulado y el 9B responde solo con el estado transferido, util para escenarios donde se quiere reducir el coste de reinyectar todo el historial en el modelo grande.
- Investigacion sobre transferencia de estado entre modelos: sirve como banco de pruebas reproducible (paso 64, digest fijado, runner de referencia) para estudiar si el estado latente de un modelo pequeno puede sustituir al contexto textual completo.
- Experimentos de destilacion de contexto: permite comparar el rendimiento del 9B nativo con contexto completo frente al 9B alimentado por el estado del 4B, como muestran las columnas de la tabla de evaluacion.
- Prototipos de enrutamiento lector/escritor: arquitectura en la que un modelo barato procesa documentos largos y un modelo mayor solo genera la respuesta final, aplicable a pipelines de pregunta-respuesta sobre documentacion.
- Evaluacion de cuantizacion: los backends nf4, bf16 y gguf permiten medir el impacto de la cuantizacion en la fidelidad de la transferencia de estado sobre una GPU de 48 GB.
- Docencia y divulgacion tecnica: el ejemplo incluido (ticket rojo, respuesta esperada `red`) es un caso minimo y verificable para explicar mecanismos de state-transfer en modelos de lenguaje.

## Benchmarks y rendimiento

Resultados publicados por el autor (thinking desactivado, cuatro prompts por fila de habilidades):

| Habilidad | Paso 64 | Padre calibrado | 9B nativo | 9B solo pregunta |
|---|---:|---:|---:|---:|
| Coding | 4/4 | 4/4 | 4/4 | 0/4 |
| Razonamiento | 4/4 | 4/4 | 4/4 | 0/4 |
| Preguntas sobre documentos | 3/4 | 3/4 | 4/4 | 0/4 |
| Seguimiento de instrucciones | 3/4 | 3/4 | 4/4 | 1/4 |
| **Total cuatro categorias** | **14/16** | **14/16** | **16/16** | **1/16** |

En la pantalla separada de recuerdo de un hecho, el paso 64, el padre y el 9B nativo respondieron 12/12; el 9B solo pregunta respondio 6/12. En una pantalla de coding parcial mas dificil se registraron cero exitos en las primeras 15 comparaciones de cada brazo. La evaluacion completa retenida se interrumpio, por lo que la mejora sobre el padre y el rendimiento en capacidades amplias no estan verificados.

## Requisitos de hardware

- GPU con CUDA; el experimento de referencia se ejecuto en una NVIDIA L40S de 48 GB.
- Espacio en disco para ambos modelos base originales (el repo del checkpoint ocupa 0,2 GB, pero el runner descarga Qwen3.5-4B y Qwen3.5-9B en revisiones fijadas).
- Backend nf4 como configuracion de referencia; backend bf16 requiere mas VRAM; backend gguf usa los modelos Q4_K_M fijados y una libreria nativa de LatentPort compilada para la GPU.
- Python 3.11 o superior, torch 2.11.0 (index cu128) y huggingface_hub 1.33.0 segun el ejemplo del autor.
- No se documentan latencia ni throughput medidos, ni se confirma que quepa en GPU de consumo (RTX 4090, etc.); el unico hardware citado es la L40S de 48 GB.
- Opciones de despliegue: runner de referencia (`inference.py`) y paquete LatentPort 0.4.1; no se mencionan vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LPBridge-Qwen3.5-4b-Qwen3.5-9b (paso 64) | 22,9 M (adaptador) | no disponible | 14/16 en cuatro categorias; 12/12 en recuerdo de un hecho | Apache 2.0 | Hugging Face (0 descargas, 0 likes) |
| Qwen3.5-9B nativo (padre) | no disponible | no disponible | 16/16 en cuatro categorias; 12/12 en recuerdo de un hecho | no disponible | Modelo base referenciado |
| Qwen3.5-9B solo pregunta | no disponible | no disponible | 1/16 en cuatro categorias; 6/12 en recuerdo de un hecho | no disponible | Baseline del propio autor |

No se dispone de datos de otros adaptadores de state-transfer comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el runner de referencia o el paquete LatentPort y ambos modelos base Qwen3.5 (4B y 9B) descargados.
- La evaluacion completa retenida se interrumpio; la mejora sobre el padre calibrado y el rendimiento en capacidades amplias no estan verificados.
- En la pantalla de coding parcial mas dificil se registraron cero exitos en las primeras 15 comparaciones de cada brazo.
- El checkpoint rinde igual que el padre calibrado (14/16) y por debajo del 9B nativo (16/16) en las pantallas publicadas.
- El modo thinking esta desactivado en el runner de referencia; no se documenta comportamiento con thinking activo.
- No se documentan sesgos, idiomas soportados ni riesgos de alucinacion especificos; deben evaluarse los de los modelos base.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta y fue creado el 2026-11-17, por lo que carece de validacion externa.
- La licencia Apache 2.0 cubre el checkpoint, pero el uso comercial esta sujeto tambien a las licencias de los modelos base Qwen3.5.

## Enlaces

- Hugging Face: https://huggingface.co/latentport/LPBridge-Qwen3.5-4b-Qwen3.5-9b
- Modelo base 4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo base 9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Paquete LatentPort (PR y ejemplo ejecutable): https://github.com/LatentPort/latentport/pull/7
