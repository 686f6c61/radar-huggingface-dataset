# mradermacher/Logistes-1.0-GGUF

## Resumen

Logistes-1.0 es un modelo de lenguaje de tipo transformer con aproximadamente 1.170 millones de parametros, desarrollado originalmente por el colectivo Openwist y distribuido en formato GGUF por mradermacher. Se trata de un modelo derivado de un ajuste fino con LoRA sobre una base no especificada, posteriormente fusionado (merged) para su publicacion. La version aqui descrita es la cuantizacion estatica en GGUF, pensada para inferencia en dispositivo (on-device) y entornos con recursos limitados.

Su proposito principal, segun las etiquetas de la model card, es el uso de herramientas (tool-use) en escenarios conversacionales y de despliegue local. El modelo esta declarado como monolingue en ingles y se distribuye bajo la licencia lfm1.0, lo que condiciona su uso comercial. El repositorio ocupa 10,6 GB en total, aunque cada cuantizacion individual pesa entre 0,6 GB (Q2_K) y 2,4 GB (f16), lo que lo hace manejable en hardware de consumo.

La relevancia actual de esta ficha radica en que ejemplifica el ecosistema de modelos pequenos orientados a agentes y tool calling, donde el tamano reducido y el formato GGUF permiten ejecucion en CPU o GPUs modestas. No obstante, la informacion publica disponible es muy escasa: no hay datos de contexto, composicion del dataset ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (derivado de ajuste LoRA fusionado; detalles no disponibles) |
| Parametros totales | 1.170.340.608 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | lfm1.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); pesos originales en safetensors en el repo base |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se trata de un transformer ajustado mediante LoRA sobre una base no identificada en la model card y posteriormente fusionado. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o instruccion supervisada. Las etiquetas indican un enfoque hacia tool-use y despliegue on-device, lo que sugiere un ajuste orientado a instrucciones y llamadas a funciones, pero no se aportan detalles tecnicos verificables.

Las cuantizaciones han sido generadas por mradermacher como cuantizaciones estaticas (sin imatrix ni weighted quants en el momento de la publicacion). No se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o arquitecturas hibridas.

## Capacidades

- Generacion de texto conversacional en ingles.
- Soporte declarado de tool-use / function calling (segun etiquetas de la model card).
- Orientado a despliegue on-device y entornos con recursos limitados.
- Capacidades multilingues: limitadas al ingles segun la metadata.
- No se documentan capacidades de vision, audio, thinking mode ni razonamiento multi-paso explicito.
- No se confirma soporte de agentes ni de razonamiento multi-step mas alla del tool-use declarado.

## Casos de uso

- Asistentes locales de escritorio: el modelo, con 1,17 mil millones de parametros y cuantizaciones de 0,6 a 1,3 GB, puede ejecutarse en un portatil convencional mediante llama.cpp u Ollama para tareas de asistencia conversacional en ingles sin conexion.
- Automatizacion de tool calling en flujos ligeros: las etiquetas de tool-use sugieren su uso para invocar funciones externas (APIs, calculadoras, busquedas) en pipelines de agentes simples donde no se requiere un modelo grande.
- Prototipado rapido de chatbots: al ser un modelo pequeno y con cuantizaciones Q4_K_S/Q4_K_M marcadas como "fast, recommended", permite iterar rapidamente en el desarrollo de interfaces conversacionales antes de escalar a modelos mayores.
- Educacion e investigacion: util como caso de estudio de ajuste LoRA fusionado y cuantizacion GGUF para quienes investigan tecnicas de compresion y despliegue eficiente.
- Filtrado y clasificacion de texto en ingles: tareas de extraccion o etiquetado simple donde un modelo de 1B es suficiente y la latencia importa.
- Integracion en aplicaciones moviles o embebidas: el formato GGUF y el tamano reducido permiten su inclusion en apps con presupuesto de memoria ajustado, siempre que el caso de uso sea en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8-1,0 GB con Q4_K_M, 1,3 GB con Q8_0 y 2,4 GB con f16 (mas overhead del runtime).
- GPU recomendadas: cualquier GPU consumer con al menos 2-4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.); en GPUs de datacenter como A100 o H100 el modelo queda sobredimensionado en recursos y no aprovecha su capacidad.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna e incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el repo base en safetensors puede servirse con transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Logistes-1.0 (GGUF) | 1,17B | no disponible | lfm1.0 | GGUF | Tool-use, on-device, solo ingles |
| TinyLlama-1.1B | 1,1B | 2.048 tokens | Apache 2.0 | safetensors, GGUF | Base generalista, sin tool-use especifico |
| Qwen2.5-1.5B | 1,5B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Multilingue, contexto amplio |
| SmolLM2-1.7B | 1,7B | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Multilingue, orientado a instrucciones |

La comparativa se ofrece como referencia de categoria; los datos de los modelos alternativos provienen de sus respectivas model cards publicas y no de la informacion proporcionada para Logistes-1.0.

## Limitaciones y advertencias

- Solo soporta ingles; no es adecuado para produccion en castellano u otros idiomas.
- No se dispone de informacion sobre longitud de contexto, lo que impide planificar conversaciones largas o documentos extensos.
- La licencia lfm1.0 puede imponer restricciones al uso comercial; es necesario revisar el archivo LICENSE antes de desplegar en produccion.
- Riesgo de alucinacion inherente a modelos de 1B, especialmente en tareas de razonamiento o conocimiento factual.
- No hay benchmarks publicados que permitan validar su calidad frente a alternativas.
- La model card no documenta sesgos conocidos ni datos de entrenamiento, lo que dificulta la evaluacion de riesgos.
- Las cuantizaciones son estaticas; no habia weighted/imatrix quants en el momento de la publicacion, lo que puede afectar la calidad en cuantizaciones bajas (Q2_K, Q3_K).
- Al ser un ajuste LoRA fusionado sobre una base no identificada, la trazabilidad del modelo es limitada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Logistes-1.0-GGUF
- Modelo base: https://huggingface.co/Openwist/Logistes-1.0
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Logistes-1.0-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
