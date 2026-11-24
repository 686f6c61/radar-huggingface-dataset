# kingjones777/Zenotron-Mini-0.5-Multilingual-SuperRoc-GGUF

## Resumen

Zenotron-Mini-0.5-Multilingual-SuperRoc-GGUF es una cuantizacion GGUF en formato ROCm-FP4 del modelo base open-zzrl/Zenotron-Mini-0.5-Multilingual, publicada por el usuario kingjones777. El modelo esta empaquetado especificamente para Super Roc, un motor de inferencia local orientado al hardware Strix Halo (AMD Ryzen AI Max+ 395, arquitectura gfx1151). Se trata, por tanto, de una distribucion de pesos optimizada para un stack concreto de hardware y software, no de un modelo entrenado desde cero. El pipeline declarado es image-text-to-text, lo que indica capacidades multimodales de entrada imagen y texto.

El modelo base cuenta con 446.571.248 parametros totales (aproximadamente 0,45 mil millones), lo que lo situa en la categoria de modelos mini. El repositorio incluye dos artefactos: un fichero principal de pesos cuantizados de unos 19,7 GB y un proyector multimodal (mmproj) en BF16 de unos 903 MB. Llama la atencion que el fichero cuantizado en Q4_0 ocupe mas que el propio modelo en precision completa cabria esperar para 446 millones de parametros, lo que sugiere que el empaquetado incorpora componentes adicionales (posiblemente cabezas MTP para decodificacion especulativa u otros tensores auxiliares) no desglosados en la informacion disponible.

La relevancia de esta ficha es doble: por un lado, documenta un caso practico de despliegue local de un modelo multimodal pequeno sobre hardware AMD con aceleracion ROCm; por otro, ejemplifica el ecosistema de cuantizaciones especializadas (ROCmFP4) que estan surgiendo para hardware de consumo con memoria unificada. La licencia Apache 2.0 facilita su uso comercial, aunque la falta de documentacion sobre el modelo base limita la evaluacion de su calidad real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal image-text-to-text; detalles de arquitectura no publicados) |
| Parametros totales | 446.571.248 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (contexto cargado en la medicion del autor) |
| Tipos de cuantizacion | Q4_0 con formato ROCm-FP4 (fichero principal); mmproj en BF16 |
| Idiomas soportados | no disponible (el nombre indica "Multilingual", sin listado oficial) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (ROCm-FP4) + mmproj GGUF BF16 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base open-zzrl/Zenotron-Mini-0.5-Multilingual. El pipeline declarado (image-text-to-text) y la presencia de un fichero mmproj confirman que se trata de un modelo multimodal con proyector de vision, pero no se detalla si el backbone es un transformer denso, un modelo hibrido o si emplea atencion lineal. El tag "MTP" en el nombre del fichero de pesos sugiere el uso de Multi-Token Prediction, utilizado aqui como drafter para decodificacion especulativa (el autor indica `--speculative mtp -d 2` en el comando de ejecucion).

Tampoco se documentan los datos de entrenamiento: numero de tokens, composicion del corpus, tecnicas de alineacion (RLHF, DPO) ni innovaciones de entrenamiento. La unica metrica de calidad publicada es la perplejidad sobre un documento tecnico en ingles de 11.000 tokens con contexto de 4096: 7,32 para esta build, frente a 7,39 de un control "STRIX_LEAN" del mismo modelo. Esta diferencia de 0,07 es marginal y el propio autor la presenta como referencia comparativa del empaquetado, no como mejora sustancial de calidad. La innovacion tecnica destacable es el formato ROCm-FP4 y el trabajo de llama.cpp/ggml sobre el que se construye Super Roc, orientado a exprimir la GPU integrada de Strix Halo.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno, con soporte de contexto largo (hasta 131.072 tokens cargados en la medicion).
- Entrada multimodal imagen-texto: el modelo acepta imagenes junto a texto, segun el pipeline image-text-to-text y el proyector mmproj incluido. El autor reporta "Vision: pass" en sus pruebas.
- Tool calling / function calling: el autor mide 7/8 llamadas correctas en modo required y 7/8 en modo auto, lo que indica soporte funcional aunque no perfecto.
- Modo thinking: desactivable por defecto en el comando de ejemplo y activable por peticion mediante `chat_template_kwargs.enable_thinking`.
- Decodificacion especulativa con drafter MTP integrado, que acelera la generacion.
- Prompt lookup y cache de prompt para reutilizacion de contexto en conversaciones.
- Capacidades multilingues segun el nombre del modelo, aunque no se publica el listado de idiomas ni su cobertura real.
- Generacion de codigo: se mide throughput especifico para prompts de codigo (128,8 tok/s de media con un unico prompt).

## Casos de uso

- Asistente conversacional local en hardware Strix Halo: el modelo se ejecuta con Super Roc sobre Ryzen AI Max+ 395 con 128 GB de memoria unificada, permitiendo conversaciones multi-turno con contexto de hasta 131.072 tokens y cache de prompt (6961 de 6985 tokens cacheados en el segundo turno medido).
- Analisis de documentos tecnicos largos: con contexto de 131K tokens y una perplejidad de 7,32 sobre documentacion tecnica en ingles, es adecuado para resumir, extraer y responder preguntas sobre manuales o papers extensos en una sola pasada.
- Procesamiento de imagenes con descripcion textual: gracias al proyector mmproj y al pipeline image-text-to-text, puede emplearse para captioning, extraccion de informacion de capturas o analisis de diagramas en flujos locales sin conexion.
- Automatizacion con tool calling en pipelines locales: el soporte de function calling (7/8 en pruebas) permite integrarlo en agentes que invocan APIs o scripts, por ejemplo para consultar bases de datos o lanzar tareas de sistema.
- Generacion de codigo asistida en el IDE: con 128,8 tok/s en prompts de codigo sobre la GPU integrada, es viable como autocompletado o generador de fragmentos en entornos de desarrollo sin GPU dedicada.
- Prototipado de agentes multi-paso: el modo thinking activable y la decodificacion especulativa MTP permiten experimentar con razonamiento encadenado a bajo coste energetico en un equipo de sobremesa.
- Despliegue via Lemonade: el autor documenta integracion con Lemonade (`lemonade pull` y `lemonade chat`), lo que facilita entornos de demostracion y evaluacion rapida para equipos que ya usan ese stack.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente reporta metricas de inferencia y una medida de perplejidad:

| Metrica | Valor |
|---|---|
| Perplejidad (documento tecnico ingles, 11K tokens, contexto 4096) | 7,32 (control STRIX_LEAN: 7,39) |
| Tiempo de carga | 2 s |
| Prompt tok/s (p1k) | 1760,7 |
| Prompt tok/s (p8k) | 1862,6 |
| Generacion tok/s (p1k) | 158,13 |
| Generacion tok/s (p8k) | 188,72 |
| Generacion tok/s (codigo) | 128,8 (media de 1 prompt) |
| Tool calls (required / auto) | 7/8 / 7/8 |
| Cache de prompt turno 2 | 6961 / 6985 tokens |
| Contexto cargado | 131.072 tokens |
| Vision | pass |
| Drafter | mtp |

Mediciones realizadas en Ryzen AI Max+ 395, 128 GB, Super Roc 0.20.2, una peticion a la vez, el 2026-11-24.

## Requisitos de hardware

- VRAM/memoria: el fichero principal ocupa 19.696.603.296 bytes (unos 19,7 GB) y el mmproj 902.821.920 bytes (unos 903 MB), por lo que se necesita al menos ~20,6 GB de memoria disponible para cargar ambos artefactos.
- Hardware objetivo: AMD Ryzen AI Max+ 395 (Strix Halo, gfx1151) con 128 GB de memoria unificada, plataforma para la que el autor ha medido y optimizado la build.
- GPU dedicadas: no se documenta compatibilidad con A100, H100 ni RTX 4090; el formato ROCm-FP4 y el motor Super Roc estan orientados a ROCm sobre Strix Halo.
- Consumer GPU: no hay datos sobre su funcionamiento en GPUs de consumo NVIDIA; en AMD integradas de la familia Strix Halo es donde esta validado.
- Opciones de despliegue: Super Roc (motor principal, con `superroc serve`), Lemonade (integracion documentada) y, por herencia de llama.cpp/ggml, potencialmente otros runners compatibles con GGUF, aunque no verificado en la informacion disponible.
- Latencia y throughput: medidos en el hardware objetivo con una peticion concurrente: 1760-1862 tok/s de prompt y 128-189 tok/s de generacion, con carga en 2 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Zenotron-Mini-0.5-Multilingual-SuperRoc-GGUF | 446,6 M | 131.072 (cargado) | GGUF ROCm-FP4 | Apache 2.0 | Optimizado para Strix Halo; multimodal; MTP especulativo |
| open-zzrl/Zenotron-Mini-0.5-Multilingual (base) | 446,6 M | no disponible | safetensors (presumiblemente) | Apache 2.0 | Modelo original sin cuantizar; referencia de calidad |
| Modelos mini multimodales de ~0,5B (categoria general) | ~0,5 B | variable | safetensors/GGUF | variable | No disponible comparativa concreta en la informacion proporcionada |

No se dispone de datos de benchmarks comunes que permitan una comparacion cuantitativa fiable con alternativas de la misma categoria. La comparativa mas directa es con el propio modelo base, del que esta build es una cuantizacion.

## Limitaciones y advertencias

- El modelo base tiene solo 446,6 M de parametros: la capacidad de razonamiento, conocimiento factual y codigo sera limitada en comparacion con modelos de miles de millones de parametros; no debe esperarse calidad de modelos grandes.
- No se documentan sesgos conocidos, composicion del dataset ni procesos de alineacion, lo que impide evaluar riesgos de sesgo de forma rigurosa.
- Riesgo de alucionacion inherente a modelos pequenos y a la falta de datos de entrenamiento publicados; la perplejidad de 7,32 no garantiza correccion factual.
- La cobertura multilingue no esta detallada: el nombre indica "Multilingual" pero no hay listado de idiomas ni evaluacion por idioma; el unico dato de calidad es sobre texto en ingles.
- La cuantizacion Q4_0 puede degradar ligeramente la calidad respecto al modelo base; el autor reporta una perplejidad comparable (7,32 frente a 7,39 del control), pero no hay evaluacion exhaustiva.
- El formato ROCm-FP4 y el motor Super Roc estan pensados para Strix Halo; el uso en otras GPUs o backends no esta validado y puede no funcionar o rendir peor.
- El tamano del fichero (19,7 GB para 446 M de parametros) es anomalo y sugiere tensores adicionales no documentados; conviene verificar el contenido antes de asumir un consumo de memoria concreto en produccion.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), conviene revisar la licencia del modelo base y de los componentes de terceros (ROCmFPX, llama.cpp) citados en los creditos.
- La fecha de creacion del repositorio (2026-11-24) y la ausencia de descargas o likes indican un artefacto muy reciente y sin validacion comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kingjones777/Zenotron-Mini-0.5-Multilingual-SuperRoc-GGUF
- Modelo base: https://huggingface.co/open-zzrl/Zenotron-Mini-0.5-Multilingual
- Repositorio Super Roc: https://github.com/kingjones30/superroc
- Documentacion de Lemonade para Super Roc: https://github.com/kingjones30/superroc/blob/main/docs/LEMONADE.md
- Proyecto ROCmFPX: https://github.com/charlie12345/ROCmFPX
- llama.cpp / ggml (base de Super Roc): no se proporciona enlace directo en la informacion disponible
