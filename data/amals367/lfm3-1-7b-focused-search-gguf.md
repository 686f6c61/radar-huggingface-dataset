# AmaLS367/LFM3-1.7B-Focused-Search-GGUF

## Resumen

LFM3-1.7B-Focused-Search-GGUF es una cuantización Q8_0 en formato GGUF del modelo AmaLS367/LFM3-1.7B-Focused-Search, publicado por el usuario AmaLS367 el 19 de noviembre de 2026 como version intermedia (v1). Se trata de un fine-tune con DPO sobre LiquidAI/LFM3-1.7B, un modelo de 1.728.801.600 parametros, cuyo objetivo es que el agente deje de invocar la herramienta de busqueda en cuanto ha encontrado la respuesta, reduciendo asi el numero de busquedas por consulta.

El problema que aborda es el derroche de llamadas a herramientas en agentes de busqueda: el modelo base LFM3-1.7B realiza de media 8,49 busquedas por pregunta (mediana 9) y el 45% de las ejecuciones agotan el limite de 12 busquedas. La version fine-tuneada baja a 6,58 de media (mediana 4) y reduce al 33% las ejecuciones que alcanzan el limite, manteniendo una precision practicamente identica (0,629 frente a 0,621 con juez LLM), diferencia que queda dentro del ruido estadistico.

Es relevante ahora porque demuestra que el ajuste fino por preferencias puede modificar el comportamiento agentico (cuando parar de buscar) sin sacrificar calidad de respuesta, y porque el artefacto publicado es exactamente el fichero evaluado (sha256 `c0adf1c71fab22cb392d9df4ecc53d47fc7548a4a40460de41f66ca8f707134d`), lo que permite reproducir los resultados. El modelo esta orientado a ingles, con licencia LFM Open License v1.0 heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/LFM3-1.7B; la model card no detalla la arquitectura) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0 (unico fichero publicado) |
| Idiomas soportados | en |
| Licencia | LFM Open License v1.0 (license_name: lfm1.0, license: other) |
| Formato de pesos | GGUF (convertido desde pesos bf16 fusionados con llama.cpp b12000 `convert_hf_to_gguf.py --outtype q8_0`) |

## Arquitectura y entrenamiento

La model card de este repositorio no describe la arquitectura interna; indica unicamente que el modelo base es LiquidAI/LFM3-1.7B y que este artefacto es un DPO fine-tune del mismo. Para detalles de arquitectura, composicion del dataset de entrenamiento, numero de tokens o receta de preferencias, remite a la model card del modelo principal (AmaLS367/LFM3-1.7B-Focused-Search), que no esta incluida en la informacion disponible.

La innovacion destacable no es arquitectonica sino de comportamiento: el entrenamiento por DPO esta orientado a ensenar al agente a terminar la busqueda al encontrar la respuesta. El fichero GGUF se genero a partir de los pesos bf16 fusionados con la herramienta de conversion de llama.cpp (build b12000) en outtype q8_0, y se publica el hash sha256 del fichero exacto evaluado. El modelo emplea la plantilla de chat de LFM3 con soporte de tool calling y razonamiento; para llamadas a herramientas es obligatorio `--jinja` en llama-server.

## Capacidades

- Generacion de texto conversacional en ingles (pipeline text-generation, etiqueta conversational).
- Uso de herramientas (tool calling): pensado especificamente para invocar una herramienta de busqueda y decidir cuando detener las invocaciones.
- Comportamiento agentico con razonamiento: la plantilla LFM3 incluye modo de razonamiento junto con las llamadas a herramientas.
- Busqueda enfocada: reduccion del numero de busquedas por pregunta (6,58 de media, mediana 4) frente al modelo base (8,49 de media, mediana 9).
- Respuesta a preguntas de tipo search-QA: evaluado sobre 504 preguntas de 7 benchmarks estandar de QA con busqueda.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Vision, audio y otras modalidades: no disponibles.

## Casos de uso

- Agentes de busqueda web con presupuesto de llamadas: el modelo decide parar al encontrar la respuesta, lo que encaja en pipelines donde cada llamada a API de busqueda tiene coste o latencia; con mediana de 4 busquedas frente a 9 del base, el ahorro es aproximadamente la mitad en la mayoria de consultas.
- QA sobre documentacion corporativa con recuperacion iterativa: integrado como policy model dentro de un harness de agente, reduce el numero de consultas al indice y por tanto la carga sobre el backend de recuperacion.
- Investigacion asistida de bajo coste: al ser un modelo de 1.728.801.600 parametros cuantizado a Q8_0 (repo de 1,8 GB), puede ejecutarse en hardware modesto para tareas de busqueda y sintesis de respuestas en ingles.
- Evaluacion y comparacion de politicas de agente: sirve como referencia reproducible (hash publicado) para medir el efecto de DPO sobre el numero de pasos de un agente de busqueda frente al modelo base.
- Prototipado local con llama.cpp: el comando documentado (`llama-server -m ... --jinja --temp 0.6 --top-p 0.95`) permite levantar un servidor compatible con endpoints para pruebas de tool calling sin infraestructura GPU dedicada.
- Reduccion de ejecuciones que agotan el limite de pasos: en entornos con limite fijo de 12 busquedas, el modelo baja del 45% al 33% las ejecuciones truncadas, lo que mejora la tasa de respuestas completas en produccion.

## Benchmarks y rendimiento

Evaluacion sobre 504 preguntas de 7 benchmarks estandar de search-QA, ejecutadas en el mismo harness de agente:

| Metrica | LFM3-1.7B (base) | Este modelo | Claude Haiku 5.5 |
|---|---:|---:|---:|
| Precision (juez LLM) | 0,621 | 0,629 | 0,665 |
| Busquedas por pregunta, media / mediana | 8,49 / 9 | 6,58 / 4 | 2,15 / 2 |
| Ejecuciones que agotan el limite de 12 busquedas | 45% | 33% | 0,6% |

La diferencia de precision frente al base es de +0,8 pp con intervalo de confianza del 95% de [−2,0, +3,6], es decir, dentro del ruido. El beneficio medible esta en el numero de busquedas y en la tasa de truncamiento, no en la precision.

## Requisitos de hardware

- VRAM estimada: el fichero Q8_0 ocupa aproximadamente 1,8 GB (tamano del repo), por lo que la inferencia requiere del orden de 2 GB de VRAM o memoria unificada, mas el overhead de contexto y del servidor.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, el modelo es apto para GPUs consumer de gama media y para ejecucion en CPU.
- Cabe en GPU consumer: si, por tamano (1.728.801.600 parametros en Q8_0); no se especifican modelos concretos.
- Opciones de despliegue: llama.cpp mediante `llama-server` con `--jinja` obligatorio para tool calls; el tag endpoints_compatible sugiere compatibilidad con endpoints tipo OpenAI. vLLM, TGI y Ollama no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles. Parametros de muestreo recomendados: `--temp 0.6 --top-p 0.95`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision (search-QA) | Busquedas por pregunta (media/mediana) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|---|
| Este modelo (GGUF Q8_0) | 1.728.801.600 | no disponible | 0,629 | 6,58 / 4 | LFM Open License v1.0 | Hugging Face, GGUF |
| LFM3-1.7B (base) | 1.728.801.600 | no disponible | 0,621 | 8,49 / 9 | LFM Open License v1.0 | Hugging Face |
| Claude Haiku 5.5 | no disponible | no disponible | 0,665 | 2,15 / 2 | propietaria | API comercial |

El modelo se situa entre el base y Claude Haiku 5.5 en precision, pero muy lejos de este ultimo en eficiencia de busqueda (6,58 frente a 2,15 busquedas de media). No se dispone de datos de otros modelos open source comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Precision limitada: 0,629 frente a 0,665 de Claude Haiku 5.5; la mejora sobre el base (+0,8 pp) esta dentro del intervalo de confianza y no debe presentarse como ganancia real de calidad.
- Eficiencia de busqueda aun alta: 6,58 busquedas de media y 33% de ejecuciones que agotan el limite de 12, frente a 2,15 y 0,6% del modelo de referencia.
- Solo ingles: la etiqueta de idioma es unicamente `en`; el rendimiento en castellano no esta evaluado ni documentado.
- Version intermedia: la model card indica explicitamente "v1, 2026-11-19 (intermediate release)", por lo que pueden aparecer revisiones posteriores con comportamiento distinto.
- Licencia restrictiva: LFM Open License v1.0 no autoriza uso comercial por entidades legales con ingresos anuales de 10 millones de dolares o mas (seccion 5 de la licencia).
- Es un modelo derivado de LiquidAI/LFM3-1.7B; se heredan los sesgos y limitaciones del base, que no estan detallados en este repositorio.
- Riesgo de alucinacion: no evaluado en la informacion disponible; la evaluacion mide precision con juez LLM sobre QA con busqueda, no verificacion factual exhaustiva.
- Longitud de contexto no disponible: no se puede garantizar el comportamiento en conversaciones largas o con muchos documentos recuperados.
- Sin traccion comunitaria: 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en produccion.
- Repositorio de 1,8 GB con un unico fichero Q8_0: no se ofrecen cuantizaciones menores (Q4, Q5) para hardware mas limitado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/AmaLS367/LFM3-1.7B-Focused-Search-GGUF
- Modelo principal (fine-tune DPO): https://huggingface.co/AmaLS367/LFM3-1.7B-Focused-Search
- Modelo base original: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM Open License v1.0: https://huggingface.co/AmaLS367/LFM3-1.7B-Focused-Search-GGUF/blob/main/LICENSE
- llama.cpp (herramienta de conversion y servidor): https://github.com/ggml-org/llama.cpp
