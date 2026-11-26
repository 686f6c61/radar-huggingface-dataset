# javierbits/Javi0.4-2B-GGUF

## Resumen

Javi0.4-2B-GGUF es la distribucion en formato GGUF del modelo Javi0.4-2B, desarrollado por el usuario javierbits. Se trata de una variante derivada de Javi0.3-2B (a su vez construido sobre Qwen3.5-2B) en la que se ha modificado una unica fila de embedding correspondiente al token 51187 (`=open_page`), multiplicandola por 0.84. No hay fine-tuning, ni nuevos datos, ni gradientes: es una edicion puramente en el espacio de pesos (weight-space editing).

El objetivo del cambio es muy concreto: sesgar una decision del agente. Tras un fallo de busqueda (`web_search`), el modelo debe volver a intentar una busqueda en lugar de abrir una URL escrita de memoria. La model card es explicita en que la edicion "no añade una nueva capacidad de razonamiento", solo modifica la preferencia entre dos herramientas del agente.

El modelo tiene 1.942.653.248 parametros (aproximadamente 1,94B, comercializado como "2B"), esta pensado para uso como agente con herramientas (busqueda web, fetch de paginas, shell) y se distribuye con licencia Apache 2.0 heredada de Qwen3.5-2B. Esta disponible en dos cuantizaciones GGUF (Q8_0 y Q4_K_M) y esta orientado a despliegues locales, incluyendo hardware tipo DGX Spark segun las etiquetas del repo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-2B; detalles especificos no disponibles) |
| Parametros totales | 1.942.653.248 (~1,94B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens (segun el comando de ejemplo con `-c 131072`) |
| Tipos de cuantizacion | Q8_0 (2,1 GB) y Q4_K_M (1,3 GB); F16 disponible bajo peticion desde la misma conversion |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); safetensors disponibles en el repo base `javierbits/Javi0.4-2B` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-2B: un transformer denso de aproximadamente 1,94B parametros. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineamiento (RLHF/DPO) del modelo base Qwen3.5-2B en la informacion proporcionada.

La innovacion destacable no esta en el entrenamiento sino en la edicion posterior: Javi0.4-2B es Javi0.3-2B con una unica fila de embedding (entrada/salida atada) modificada. Concretamente, la fila del token 51187 (`=open_page`) se multiplica por 0.84. Esta intervencion minima en el espacio de pesos altera la probabilidad relativa de seleccionar `open_page` frente a `web_search` en el siguiente paso del agente. La model card documenta que una escala de 0.75 invertia la preferencia en 4/4 casos pero provocaba bucles de hasta 14 busquedas bajo bloqueo permanente, por lo que 0.84 se eligio como valor conservador. La edicion afecta al token canonico `open_page`; en entornos como opencode/grok con `webfetch`/`web_fetch`, el comportamiento tras un 403 no cambia.

Las cuantizaciones GGUF se generaron a partir de un GGUF F16 del modelo fusionado editado. El tower de vision del modelo base no esta incluido en el GGUF: es un modelo exclusivamente de texto.

## Capacidades

- Generacion de texto conversacional en ingles.
- Uso de herramientas (tool calling / function calling), con soporte explicito para `web_search` y `open_page`.
- Comportamiento de agente con busqueda web, fetch de paginas y shell.
- Recuperacion tras fallos de herramientas: la edicion busca que el modelo reintente la busqueda en lugar de abrir URLs inventadas.
- Reduccion de enlaces fabricados (metrica "made-up links" de 0.01 a 0.00 en la evaluacion).
- Modo thinking desactivable: entrenado y evaluado con `enable_thinking: false`.
- API compatible con OpenAI (`/v1`) via llama-server.
- Capacidades de vision: no disponibles en esta version GGUF (el tower de vision del base no se incluye).
- Capacidades multilingues: limitadas al ingles segun los metadatos.

## Casos de uso

- Agentes de busqueda web con reintentos robustos: el modelo esta disenado para, tras un fallo de `web_search`, volver a buscar en lugar de abrir una URL construida de memoria, reduciendo enlaces alucinados en pipelines de investigacion automatizada.
- Asistentes locales con tool calling: desplegado con llama-server y `--jinja`, expone una API compatible con OpenAI en `http://localhost:8080/v1`, integrable en cualquier agente que consuma ese contrato.
- Automatizacion de tareas con shell: las etiquetas y la model card mencionan shell como herramienta del agente, permitiendo flujos de ejecucion de comandos con contexto de 131.072 tokens.
- Prototipado de agentes en hardware de consumo o estaciones compactas: con Q4_K_M (1,3 GB) cabe en GPUs consumer modestas, y las etiquetas `dgx-spark` sugieren despliegue en estaciones DGX Spark.
- Evaluacion de intervenciones en el espacio de pesos: util como caso de estudio reproducible de como una unica fila de embedding modifica el comportamiento de seleccion de herramientas sin reentrenar.
- Despliegue en CI/CD para agentes de documentacion: al ser texto puro en ingles y con baja temperatura (0.2), encaja en tareas de recuperacion y resumen de paginas web con llamadas de herramienta bien formadas.
- Control experimental frente al modelo 4B: la model card enlaza Javi0.4-4B-GGUF como control de mayor tamano para comparar el efecto de la edicion a distintas escalas.

## Benchmarks y rendimiento

Los datos de la model card corresponden al modelo bf16 safetensors del que derivan estas cuantizaciones (la cuantizacion añade ruido propio). Evaluacion "eval v3" con 175 seeds held-out, 3 ejecuciones, fecha fijada 2026-10-07 y resultados de busqueda cacheados. Jueces: DeepSeek-V4.1-Flash-1017 y mimo-v26-dual.

| Metrica | Javi0.3-2B | Javi0.4-2B |
|---|---:|---:|
| Core pass (media de jueces) | 0,35 [0,30, 0,40] | 0,41 [0,36, 0,45] |
| Core pass (deepseek) | 0,48 | 0,58 |
| Core pass (mimo) | 0,23 | 0,24 |
| Recuperacion tras fallo de herramienta | 0,55 (n=11) | 0,45 (n=10) |
| Enlaces fabricados | 0,01 | 0,00 |
| Bucles | 0,04 | 0,03 |

Diferencia pareada de core pass: +0,06 [0,02, 0,10] (deepseek +0,10 [0,05, 0,16]; mimo +0,02 [-0,02, 0,06]), bootstrap al 95% sobre 175 seeds. El intervalo de deepseek cruza cero en el caso de mimo, por lo que el tamano de la mejora es incierto. Las preguntas de conflicto mejoraron (0,33 frente a 0,07, n=7) y las de tipo nodate (0,42 frente a 0,17, n=6); las de premisa (0,23 frente a 0,29, n=13) y la recuperacion tras fallos reales no mejoraron.

Sonda especifica del efecto buscado (8 preguntas canonical `fail` held-out de eval-v3, primer `web_search` forzado a fallar, siguiente herramienta con greedy):

| Modelo | Siguiente `web_search` | Siguiente `open_page` |
|---|---:|---:|
| Javi0.3-2B | 0/8 | 8/8 |
| Javi0.4-2B | 7/8 | 1/8 |

En un canary de dos seeds con herramientas reales y sampling, 0.84 eligio `open_page` tras una busqueda permanentemente bloqueada y completo la tarea igual que el base, usando una busqueda adicional en una consulta normal. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,1 GB para Q8_0 y 1,3 GB para Q4_K_M, mas overhead de contexto KV cache (con `-ctk q8_0 -ctv q8_0` y 131.072 tokens el consumo de cache es significativo).
- GPU recomendadas: no especificadas en la model card; por tamano, cualquier GPU con 4-6 GB o mas deberia alojar Q4_K_M con contexto moderado. Las etiquetas mencionan `dgx-spark` como entorno objetivo.
- Cabe en GPU consumer: si, con Q4_K_M (1,3 GB) en GPUs de 4 GB en adelante; Q8_0 requiere algo mas de margen. El contexto maximo de 131.072 tokens exige planificar la cache KV.
- Opciones de despliegue: llama.cpp (`llama-server` con `--jinja -c 131072 -fa on -ctk q8_0 -ctv q8_0`), API compatible OpenAI en `/v1`, y `lmdeck use javi0.4-2b` como atajo.
- Parametros de sampling recomendados: `--temp 0.2 --top-p 0.8 --top-k 20 --min-p 0` y `--chat-template-kwargs '{"enable_thinking": false}'`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| Javi0.4-2B-GGUF | ~1,94B | 131.072 | Apache 2.0 | GGUF | Edicion de una fila de embedding; solo texto; solo ingles |
| Javi0.3-2B | ~1,94B (no confirmado) | No disponible | Apache 2.0 (heredada) | Safetensors / GGUF | Base sin edicion; peor seleccion de herramienta tras fallo (0/8 vs 7/8) |
| Javi0.4-4B-GGUF | ~4B (no confirmado) | No disponible | Apache 2.0 (heredada) | GGUF | Control de mayor tamano citado en la model card |
| Qwen3.5-2B | ~2B | No disponible | Apache 2.0 | Safetensors | Modelo original del que desciende la familia Javi; tower de vision presente en el base |

No se dispone de datos de rendimiento comparativo con modelos de otras familias en la informacion proporcionada.

## Limitaciones y advertencias

- La edicion modifica una sola decision (reintentar busqueda frente a abrir URL tras fallo); no añade capacidades de razonamiento nuevas, como indica explicitamente la model card.
- Solo ingles: los metadatos declaran `en` como unico idioma.
- Solo texto: el tower de vision del modelo base no esta incluido en el GGUF.
- Thinking desactivado: fue entrenado y evaluado con `enable_thinking: false`; activarlo puede degradar el comportamiento esperado.
- La mejora de core pass es incierta: el intervalo de confianza del juez mimo cruza cero.
- La recuperacion tras fallos reales de herramienta empeoro en la evaluacion (0,45 frente a 0,55), aunque con muestras pequenas (n=10 frente a n=11).
- Riesgo de bucles: con una escala de edicion mas agresiva (0.75) el modelo entraba en bucles de hasta 14 busquedas bajo bloqueo permanente; 0.84 es el ajuste conservador.
- En entornos con nombres de herramienta distintos (opencode/grok usan `webfetch`/`web_fetch`), el efecto de la edicion no se aplica.
- Riesgo de alucinacion persistente en otros tipos de consulta: la metrica de enlaces fabricados baja a 0.00, pero el modelo sigue siendo un 2B con core pass de 0,41 en la media de jueces.
- Fecha de creacion del repo (2026-11-04) y referencias a modelos como Qwen3.5-2B, DeepSeek-V4.1-Flash-1017 o mimo-v26-dual: verificar disponibilidad y vigencia antes de usarlos como referencia.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-2B por si impone restricciones adicionales.
- Temperatura baja (0.2) recomendada para mantener llamadas de herramienta bien formadas; temperaturas altas pueden romper el formato.

## Enlaces

- Repositorio GGUF: https://huggingface.co/javierbits/Javi0.4-2B-GGUF
- Safetensors del modelo: https://huggingface.co/javierbits/Javi0.4-2B
- Modelo base (Javi0.3-2B): https://huggingface.co/javierbits/Javi0.3-2B
- Control 4B: https://huggingface.co/javierbits/Javi0.4-4B-GGUF
- Modelo original Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Imagen de portada: https://huggingface.co/javierbits/Javi0.4-2B-GGUF/resolve/main/javi04-cover.png
- Scoreboard completo de evaluacion (referenciado en la model card): `data/v2/eval/javi04-vs-03-2b/score.md` dentro del arbol fuente del proyecto.
