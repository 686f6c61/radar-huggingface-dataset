# REDSOULTM/BAXY-Qwen3.5-4B-GGUF

## Resumen

BAXY-Qwen3.5-4B-GGUF es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-4B de Alibaba Qwen, desarrollado por REDSOULTM para alimentar BAXY, un asistente de voz local para Windows que opera el sistema de forma real: abre aplicaciones, navega por sus ventanas, gestiona archivos, busca en la web y controla el sistema y la reproduccion multimedia. El modelo se distribuye unicamente en formato GGUF cuantizado a Q4_K_M, con un peso de 2,74 GB, y esta pensado para ejecutarse en local mediante llama.cpp sin dependencia de la nube.

La propuesta de valor es un agente de escritorio que decide mediante llamadas a herramientas (tool calling) y que solo reporta lo que los recibos de la aplicacion confirman como ejecutado, evitando afirmaciones no verificadas. Con 4.205.751.296 parametros (~4,2B) y licencia Apache 2.0, hereda la arquitectura y el conocimiento del modelo base Qwen3.5-4B, sobre el que se aplico un LoRA (ciclo c3, semilla A) fusionado y posteriormente cuantizado.

Es relevante ahora porque demuestra un flujo de trabajo completo de ajuste de un modelo pequeno para control de escritorio con evaluacion ciega end-to-end sobre Windows real, y porque cabe en GPUs de consumo con 4 GB de VRAM, lo que habilita asistentes de agente privados y offline en equipos modestos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-4B); no se detalla en la informacion disponible |
| Parametros totales | 4.205.751.296 (~4,2B) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion proporcionada) |
| Longitud de contexto | 32.768 tokens (valor usado en el ejemplo de `llama-server -c 32768`; el maximo del modelo base no se especifica) |
| Tipos de cuantizacion | GGUF Q4_K_M (unico fichero publicado: `BAXY-Qwen3.5-4B-c3-Q4_K_M.gguf`, 2,74 GB, sha256 `485595f734f964b4902028b4a97ef37f31d57d5c651581435917e0043e499f0e`) |
| Idiomas soportados | espanol e ingles (y mezclas de ambos) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de ~4,2B parametros, y se obtiene mediante un ajuste LoRA identificado como "ciclo c3, semilla A", que se fusiona con los pesos base y se cuantiza a Q4_K_M en formato GGUF. La informacion disponible no detalla la arquitectura interna del modelo base (atencion, capas, configuracion de cabezas) ni el volumen total de tokens de entrenamiento.

Los datos de entrenamiento son conversaciones sinteticas cuyos recibos de herramientas provienen de trazas reales de la aplicacion BAXY. Todas las respuestas aceptadas fueron evaluadas por jueces a ciegas y cada familia de datos paso un control de fuga contra los bancos de evaluacion; no se incluyo texto privado de personas. El objetivo del ajuste es ensenar al modelo a seleccionar la herramienta y los argumentos correctos para operar Windows y sus aplicaciones, interpretar los recibos devueltos, pedir confirmacion antes de acciones destructivas y responder de forma breve en el idioma del usuario. No se menciona el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional breve y natural en espanol e ingles, incluyendo mezclas de ambos idiomas.
- Tool calling y function calling orientados al control de Windows: apertura de aplicaciones, navegacion de ventanas, gestion de archivos, busqueda web y control de medios y sistema.
- Razonamiento de agente de varios pasos con lectura de recibos de herramientas para verificar acciones ejecutadas.
- Solicitud de confirmacion ante acciones destructivas y comunicacion explicita de lo que no puede hacer.
- Capacidad de vision delegada: BAXY utiliza adicionalmente el proyector `mmproj` de Qwen3.5-4B en CPU para clics sobre elementos visibles en pantalla (la vision no forma parte del fichero GGUF principal).
- Ejecucion local y offline mediante llama.cpp, con soporte de plantilla Jinja (`--jinja`).

## Casos de uso

- Asistente de voz de escritorio: integrado en BAXY, el modelo recibe el prompt de sistema, el catalogo de herramientas y los recibos, y decide la siguiente accion para cumplir ordenes habladas en Windows, reportando solo lo verificado.
- Automatizacion de tareas de sistema en local: abrir aplicaciones, cambiar el volumen, controlar la reproduccion multimedia o gestionar ventanas mediante llamadas a herramientas, sin enviar datos a la nube.
- Gestion de archivos asistida: interpretar ordenes como mover, renombrar o localizar archivos y ejecutarlas a traves de herramientas, con confirmacion previa en operaciones destructivas.
- Busqueda web con resumen verificado: encadenar una busqueda y sintetizar el resultado en una frase, apoyandose en el recibo de la herramienta para no afirmar mas de lo comprobado.
- Despliegue de agentes de escritorio en equipos modestos: al caber en 4 GB de VRAM con llama.cpp, permite prototipar asistentes de control de PC en portatiles o estaciones con GPU de gama de entrada.
- Entornos con requisitos de privacidad: al ejecutarse offline, es adecuado para escenarios donde las conversaciones y las trazas de acciones no pueden salir del equipo.
- Base para ajustes de agentes de escritorio: sirve como punto de partida para quien quiera reproducir el pipeline LoRA + cuantizacion GGUF sobre Qwen3.5-4B para otras aplicaciones.

## Benchmarks y rendimiento

Los unicos datos publicados son los del banco ciego del autor: 160 misiones dificiles en 15 aplicaciones de escritorio, ejecutadas 3 veces por brazo de punta a punta sobre Windows real y evaluadas a ciegas.

| Metrica | Modelo anterior de BAXY (c2) | Este modelo (c3) |
|---|---|---|
| Misiones logradas (mayoria de 3) | 36 / 160 | 44 / 160 |
| Logradas en las 3 corridas | 24 | 38 |
| Exitos falsos (afirma haber hecho algo que no hizo) | 11 | 11 |

Prueba de McNemar por mision: 9 victorias y 1 derrota (p = 0,02). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB con la cuantizacion Q4_K_M publicada (fichero de 2,74 GB mas overhead de contexto); el autor indica que cabe en una GPU de 4 GB de VRAM.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM para el modelo completo en GPU (`-ngl 99`); no se especifican modelos concretos (A100, H100, RTX 4090) en la informacion disponible.
- Cabe en GPU de consumo: si, segun el autor, en tarjetas de 4 GB; no se detallan modelos exactos.
- Opciones de despliegue: llama.cpp mediante `llama-server` (comando de ejemplo: `llama-server -m BAXY-Qwen3.5-4B-c3-Q4_K_M.gguf -c 32768 -ngl 99 --jinja`); integracion dentro de la aplicacion BAXY. No se mencionan vLLM, Ollama ni TGI en la informacion disponible.
- Vision: el proyector `mmproj` de Qwen3.5-4B se ejecuta en CPU adicionalmente para las funciones de clic sobre pantalla.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| BAXY-Qwen3.5-4B-GGUF | ~4,2B | 32.768 (uso documentado) | GGUF Q4_K_M | Apache 2.0 | Agente de escritorio para Windows con tool calling |
| Qwen/Qwen3.5-4B (base) | ~4,2B | no disponible | safetensors y otros | Apache 2.0 | Modelo generalista; el fine-tune hereda su conocimiento |
| Modelo anterior de BAXY (c2) | no disponible | no disponible | no disponible | no disponible | Version previa del agente; 36/160 misiones frente a 44/160 |

No se dispone de datos de rendimiento de terceros comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo de 4B: falla en interfaces que no conoce y en peticiones largas de muchos pasos, segun reconoce el autor.
- Fuera de BAXY, sin su prompt de sistema, catalogo de herramientas y recibos, se comporta como un Qwen3.5-4B con un estilo mas breve; sus capacidades de agente dependen del entorno de ejecucion.
- Persisten 11 exitos falsos en el banco ciego: el modelo puede afirmar que realizo una accion no ejecutada, un riesgo relevante en automatizacion de escritorio.
- La evaluacion se limita a 160 misiones en 15 aplicaciones de Windows; no hay benchmarks estandar publicados que permitan comparar con otros modelos.
- Idiomas limitados a espanol e ingles; el rendimiento fuera de estos idiomas no esta documentado.
- Solo se publica una cuantizacion (Q4_K_M); no hay variantes de mayor o menor precision disponibles.
- No se detallan sesgos conocidos en la informacion proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda conservar los avisos de licencia y verificar las condiciones del modelo base Qwen3.5-4B.
- El codigo de BAXY es MIT, licencia independiente de la del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/REDSOULTM/BAXY-Qwen3.5-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de BAXY (codigo, instalacion y guia): https://github.com/REDSOULTM/BAXY
