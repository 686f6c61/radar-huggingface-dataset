# mradermacher/CherryPit-1.2-2B-GGUF

## Resumen

CherryPit-1.2-2B-GGUF es la distribucion en formato GGUF del modelo CherryPit-1.2-2B, un modelo de lenguaje de 2.516.756.480 parametros (aproximadamente 2,5 mil millones) desarrollado por DRUPEs y cuantizado por mradermacher. El modelo esta etiquetado por su autor como orientado a codigo, desarrollo web, matematicas, razonamiento, tool calling y ejecucion en dispositivo (on-device), lo que lo situa en la categoria de modelos pequenos especializados en tareas tecnicas.

La relevancia de esta publicacion radica en su formato: mradermacher distribuye hasta once variantes de cuantizacion GGUF (desde Q2_K de 1,1 GB hasta f16 de 5,1 GB), lo que permite ejecutar el modelo en hardware de consumo y en entornos con memoria limitada. La licencia Apache 2.0 facilita su adopcion comercial sin restricciones adicionales.

La model card del repositorio es puramente operativa (lista de cuantizaciones y notas de uso de GGUF) y no aporta informacion sobre arquitectura, datos de entrenamiento ni evaluaciones. La ficha siguiente refleja unicamente los datos disponibles en la informacion proporcionada; los campos no documentados se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta "minicpm" en los tags; familia MiniCPM) |
| Parametros totales | 2.516.756.480 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); modelo base en transformers |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. El tag "minicpm" sugiere que el modelo base DRUPEs/CherryPit-1.2-2B deriva de la familia MiniCPM, pero no se confirma en la model card. El tamano de 2.516.756.480 parametros y la presencia de pesos en formato transformers (safetensors, segun el dato de parametros reales) indican un transformer denso de aproximadamente 2,5B parametros.

Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. La unica informacion tecnica concreta es la lista de cuantizaciones generadas por mradermacher, que incluye variantes estaticas (este repositorio) y variantes con imatrix/weighted disponibles en un repositorio separado (CherryPit-1.2-2B-i1-GGUF).

## Capacidades

- Generacion de texto conversacional (tag "conversational").
- Generacion y asistencia de codigo (tags "code", "coding").
- Desarrollo web (tag "web-development").
- Razonamiento matematico (tags "math", "reasoning").
- Tool calling / function calling (tag "tool-calling").
- Ejecucion en dispositivo (tag "on-device"), gracias a su tamano reducido y a las cuantizaciones GGUF.
- Capacidades multilingues limitadas al ingles (idioma declarado: en).
- Compatibilidad con endpoints (tag "endpoints_compatible").

No se documentan capacidades de vision, audio, modo thinking explicito ni agentes multi-paso mas alla de lo que implica el tag de tool calling.

## Casos de uso

- Asistente de codigo en local: con cuantizaciones Q4_K_M (1,7 GB) o Q5_K_M (1,9 GB) el modelo cabe en portatiles con GPU integrada o CPU, permitiendo autocompletado y explicacion de codigo sin conexion.
- Desarrollo web asistido: el tag "web-development" sugiere uso para generar fragmentos HTML/CSS/JS y resolver dudas de frontend en un editor o IDE con extension local.
- Razonamiento matematico en entornos educativos: el modelo puede resolver problemas paso a paso en aplicaciones de tutoria, con la ventaja de que la inferencia local evita enviar datos de estudiantes a servicios externos.
- Tool calling en automatizaciones: el tag "tool-calling" permite integrarlo en pipelines que invocan funciones (APIs, scripts) en entornos con recursos limitados, como Raspberry Pi o mini-PC.
- Prototipado rapido en CI/CD: al ser un modelo pequeno con licencia Apache 2.0, se puede desplegar en runners de integracion continua para tareas de revision de codigo o generacion de documentacion sin coste de API.
- Chat conversacional embebido: con la variante Q8_0 (2,8 GB) se obtiene la mejor calidad de las cuantizaciones disponibles para asistentes conversacionales en aplicaciones de escritorio o moviles de gama alta.
- Evaluacion y experimentacion: las once cuantizaciones permiten comparar el impacto de la compresion en calidad y velocidad, util para investigadores que estudian el rendimiento de modelos pequenos en hardware heterogeneo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun tamano del archivo GGUF):
  - Q2_K: ~1,1 GB de pesos; ~1,5-2 GB de VRAM en total con contexto corto.
  - Q4_K_M: ~1,7 GB de pesos; ~2,5-3 GB de VRAM en total.
  - Q8_0: ~2,8 GB de pesos; ~3,5-4 GB de VRAM en total.
  - f16: ~5,1 GB de pesos; ~6 GB de VRAM en total.
- GPU recomendadas: no se especifican en la documentacion. Por tamano, cualquier GPU con 4-6 GB de VRAM es suficiente para las cuantizaciones de 4-8 bits; para f16 se recomienda al menos 6 GB.
- Cabe en GPU de consumo: si, practicamente en todas las GPU modernas (RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090, e incluso GPUs integradas con memoria compartida para cuantizaciones bajas). Tambien es viable en CPU.
- Opciones de despliegue: llama.cpp y Ollama son las opciones naturales para GGUF; el tag "endpoints_compatible" sugiere compatibilidad con servidores de inferencia tipo OpenAI-compatible. vLLM y TGI no estan confirmados para este formato.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas (contexto, arquitectura) que permitan una comparacion rigurosa con alternativas. La siguiente tabla recoge unicamente lo verificable a partir de la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| CherryPit-1.2-2B-GGUF | 2,52B | no disponible | Apache 2.0 | GGUF | 11 cuantizaciones; tags de codigo, math, tool-calling |
| Modelos comparables de ~2-3B | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta documentado y probablemente sea limitado.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad.
- Alucinacion: al ser un modelo de ~2,5B parametros, es esperable una tasa de alucinacion superior a la de modelos grandes; no hay datos publicados que la cuantifiquen.
- Contexto: se desconoce la longitud de contexto soportada, lo que impide garantizar conversaciones largas o procesamiento de documentos extensos.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M estan marcadas por el autor como de menor calidad; para produccion se recomienda Q4_K_M o superior.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base DRUPEs/CherryPit-1.2-2B y de la familia MiniCPM si se deriva de ella.
- Model card escasa: no hay informacion sobre datos de entrenamiento, evaluaciones ni limitaciones declaradas por el autor original, lo que dificulta una evaluacion de riesgos en produccion.
- Fecha de creacion futura (2026-11-06): dato anomalo en los metadatos del repositorio; conviene contrastar la procedencia antes de adoptarlo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/CherryPit-1.2-2B-GGUF
- Modelo base: https://huggingface.co/DRUPEs/CherryPit-1.2-2B
- Cuantizaciones imatrix/weighted: https://huggingface.co/mradermacher/CherryPit-1.2-2B-i1-GGUF
- Pagina de overview del autor: https://hf.tst.eu/model#CherryPit-1.2-2B-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
