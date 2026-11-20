# jstarks/Qwen3.5-0.8B-iPhone-Agent-Weight-Space-Programming

## Resumen

`jstarks/Qwen3.5-0.8B-iPhone-Agent-Weight-Space-Programming` es un ajuste del modelo base `Qwen/Qwen3.5-0.8B` (873.438.784 parametros) orientado a su uso como agente movil en un iPhone 15 Pro con chip A17 Pro y 8 GB de RAM. El autor, jstarks, no emplea fine-tuning ni descenso de gradiente: aplica una tecnica denominada Weight-Space Programming, que modifica directamente pesos concretos de las capas 15, 19, 22 y 23 del transformer para alterar el comportamiento del modelo en tareas de enrutamiento de herramientas, cierre de bloques de razonamiento y resistencia a premisas falsas. El resultado es un checkpoint de 1,8 GB en bfloat16 (unos 540 MB en 4 bits) que conserva la arquitectura original y modifica un 0,065 % de los parametros totales.

La relevancia del modelo radica en que aborda un problema practico de los agentes pequenos en dispositivos: el modelo base, pese a generar llamadas a herramientas con el formato correcto, asigna casi toda la probabilidad del token `<function=` a `web_search` en lugar de a `exec`, lo que provoca que las tareas de shell local se resuelvan buscando en Google. La intervencion del autor corrige esta distribucion de probabilidad sin reentrenar, y ademas fuerza el cierre de los bloques `<think>` dentro de un presupuesto de tokens compatible con un movil, algo que ni el modelo base ni la edicion previa de MIT CSAIL lograban.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en safetensors y compatibilidad con la libreria `transformers`. Su pipeline declarado es `text-generation`, aunque los tags incluyen `image-text-to-text`, lo que sugiere que hereda la modalidad multimodal del Qwen3.5 base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), modificacion de pesos en MLP `down_proj` de capas 15, 19, 22 y 23 |
| Parametros totales | 873.438.784 (852 M reportados en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (1,43 GB), 4-bit (~540 MB); no se detallan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-0.8B`, un transformer denso de aproximadamente 852-873 millones de parametros. No hay entrenamiento supervisado, RLHF ni DPO en este checkpoint: la unica modificacion es una cirugia de pesos en espacio de pesos (weight-space programming) aplicada en dos etapas. La etapa 1 reproduce la edicion `exp8_math` de MIT CSAIL sobre las capas 15 y 19, una proyeccion de rango 1 verificada bit a bit sobre 128 columnas de `mlp.down_proj` (130.188 entradas bfloat16 modificadas) que suprime los bucles de autoduda del tipo "Wait" / "However". La etapa 2, original del autor, aplica una cirugia de subespacios nulos anclada con proyeccion ridge en las capas 22 y 23, afectando a 208 columnas disjuntas de `mlp.down_proj` por capa (5,80 % de las columnas de esas capas, 557.056 parametros en total entre las cuatro capas, un 0,065 % del modelo).

La innovacion tecnica no esta en la arquitectura, que es la del Qwen3.5 base, sino en el metodo de edicion: no se anaden tokens al prompt de sistema ni se reentrena, sino que se modifica la matriz de pesos para redirigir la masa de probabilidad del token `<function=` hacia `exec` en tareas de terminal local, forzar el cierre de `</think>` dentro de un presupuesto de 512-640 tokens y aumentar la resistencia a premisas falsas. La model card documenta el analisis mecanicista del fallo original (P("web") = 0,997 frente a P("exec") = 0,0028 en el token `<function=`) y las metricas de la intervencion.

## Capacidades

- Generacion de texto conversacional y razonamiento en modo `thinking` (`enable_thinking=True`), con cierre de `</think>` dentro de presupuestos de tokens moviles.
- Enrutamiento correcto de la herramienta `exec` para scripting POSIX/Bash (8/8 tareas en la evaluacion del autor).
- Busqueda web en vivo y descarga de URL mediante `web_search` y `web_fetch` (8/8 tareas, con terminacion limpia en `<|im_end|>`).
- Tool calling con el formato Hermes Agent / OpenClaw (`<tool_call>`, `<function=...>`, `<parameter=...>`).
- Ejecucion agentica de dos turnos: busqueda en DuckDuckGo, fetch de URL y comandos shell locales, con sintesis fundamentada en el segundo turno (4/4 tareas).
- Resistencia a la adulacion (anti-sycophancy) y refutacion de premisas falsas (7/8 tareas: `chmod 000`, `git reset --hard`, HTTP 404, primalidad de 91, capital de Australia, `rm -rf *`).
- Contencion del uso de herramientas en tareas de codigo y matematicas autocontenidas (6/6 tareas sin invocar herramientas innecesarias).
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Agente de terminal en movil: el modelo enruta correctamente tareas de shell local a la herramienta `exec` en lugar de buscar en la web, lo que permite ejecutar comandos como `netstat -tlnp | grep 8080` o `python -c` desde un iPhone 15 Pro sin salir del dispositivo.
- Asistente de investigacion con busqueda en vivo: usa `web_search` y `web_fetch` para consultar DuckDuckGo y descargar paginas (por ejemplo, PEP 703) y sintetizar una respuesta fundamentada en el segundo turno, con terminacion limpia y latencia reducida (37,4 tokens de media frente a 200,0 del base).
- Despliegue en dispositivo con memoria limitada: con ~540 MB en 4 bits y 1,43 GB en bfloat16, cabe en los 8 GB de RAM del A17 Pro y permite inferencia local sin conexion para tareas de agente.
- Moderacion y verificacion de hechos en conversacion: su capacidad anti-sycophancy (87,5 % frente a 12,5 % del base) lo hace util para asistentes que deben corregir al usuario cuando este afirma premisas falsas sobre comandos peligrosos o hechos verificables.
- Automatizacion de tareas de CI/CD en entornos con recursos escasos: el enrutamiento fiable a `exec` y la contencion de herramientas permiten integrarlo en pipelines que necesitan decidir entre ejecutar un comando local o consultar documentacion externa.
- Asistente de codigo autocontenido: cuando las herramientas estan activas en el prompt, el modelo evita invocarlas innecesariamente en tareas de programacion y matematicas (6/6), lo que reduce latencia y coste en asistentes de edicion de codigo.
- Prototipado de agentes multi-herramienta: sirve como banco de pruebas para estudiar como la edicion de pesos en capas MLP concretas altera el enrutamiento de herramientas, util para investigadores en interpretabilidad mecanicista.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card, con decodificacion greedy (`do_sample=False`, `enable_thinking=True`) sobre 38 tareas en cinco suites y 4 tareas de ejecucion agentica en vivo:

| Suite | Base Qwen3.5-0.8B | MIT CSAIL Stage-1 | Ours Stage-2 |
|---|---|---|---|
| A: Shell scripting (`exec`), 8 tareas | 0/8 (0,0 %), 324,8 tok | 0/8 (0,0 %), 252,8 tok | 8/8 (100,0 %), 42,5 tok |
| B: Web search y fetch, 8 tareas | 6/8 (75,0 %), 200,0 tok | 7/8 (87,5 %), 157,4 tok | 8/8 (100,0 %), 37,4 tok |
| C: Matematicas con presupuesto movil, 8 tareas | 0/8 (0,0 %), 0 % cierre `</think>` | 0/8 (0,0 %), 0 % cierre | 3/8 (37,5 %), 100 % cierre |
| D: Anti-sycophancy, 8 tareas | 1/8 (12,5 %) | 1/8 (12,5 %) | 7/8 (87,5 %) |
| E: Contencion de herramientas, 6 tareas | 4/6 (66,7 %), 302,8 tok | 4/6 (66,7 %), 326,8 tok | 6/6 (100,0 %), 187,7 tok |
| Agregado A-E (38 tareas) | 11/38 (28,9 %) | 12/38 (31,6 %) | 32/38 (84,2 %) |
| F: Agente en vivo 2 turnos, 4 tareas | no disponible | no disponible | 4/4 (100,0 %) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~1,43 GB en bfloat16 y ~540 MB en cuantizacion 4-bit para los pesos; el autor indica que cabe en los 8 GB de RAM del iPhone 15 Pro (A17 Pro).
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, cualquier GPU consumer con al menos 2-4 GB de VRAM libre deberia poder alojarlo en bfloat16 o 4 bits.
- Cabe en GPU consumer: si, por el reducido numero de parametros (873 M); no se especifican modelos concretos.
- Opciones de despliegue: `transformers` (libreria declarada); no se confirman vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: el autor reporta reducciones de tokens de salida de 5,35x a 7,64x en las suites A, B y E, pero no publica latencias absolutas ni throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| jstarks/Qwen3.5-0.8B-iPhone-Agent-WSP | 873 M | no disponible | Apache 2.0 | Edicion de pesos para agente movil |
| Qwen/Qwen3.5-0.8B (base) | ~852-873 M | no disponible | no disponible en la informacion | Modelo base sin edicion |
| MIT CSAIL `exp8_math` (Stage-1) | ~852-873 M | no disponible | no disponible en la informacion | Edicion de pesos para suprimir bucles |

No se dispone de datos de benchmarks estandar para comparar con alternativas de la misma categoria fuera de las suites del autor.

## Limitaciones y advertencias

- Los benchmarks reportados son internos del autor (38 + 4 tareas) y no han sido replicados de forma independiente; no hay resultados en MMLU, HumanEval ni GSM8K.
- La evaluacion se limita al ecosistema de herramientas Hermes Agent / OpenClaw (`exec`, `web_search`, `web_fetch`); el comportamiento con otros esquemas de tool calling no esta documentado.
- El modelo es un ajuste de pesos de un modelo de 0,8 B, por lo que su capacidad de razonamiento general es limitada; la suite C solo alcanza 3/8 (37,5 %) en matematicas con presupuesto movil.
- Riesgo de alucinacion inherente al modelo base, no cuantificado en la informacion disponible.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; la model card esta en ingles y no documenta cobertura multilingue.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5 puede tener condiciones adicionales no detalladas en la informacion disponible.
- La edicion de pesos es especifica de capas y columnas concretas; cambios en el tokenizador, la plantilla de chat o el esquema de herramientas pueden invalidar el comportamiento corregido.
- El checkpoint esta pensado para iPhone 15 Pro (A17 Pro, 8 GB); su rendimiento en otros dispositivos moviles no esta documentado.

## Enlaces

- Hugging Face: https://huggingface.co/jstarks/Qwen3.5-0.8B-iPhone-Agent-Weight-Space-Programming
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Blog de Weight-Space Programming (MIT CSAIL): https://rikiyat.github.io/blog/weight-space-programming/
- Repositorio de logs de MIT CSAIL: https://huggingface.co/RikiyaT/lm_understand-logs
