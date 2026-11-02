# kyryk/filing-figures-qwen3.5-4b-nvfp4

## Resumen

FilingFigures Qwen3.5-4B (NVFP4) es un modelo de extraccion de informacion financiera desarrollado por kyryk (Nathan Kyryk) a partir de un fine-tuning del modelo base Qwen/Qwen3.5-4B. Su proposito es leer un informe anual 10-K presentado ante la SEC y devolver seis cifras financieras concretas (ingresos, beneficio neto, BPA diluido, activos totales, acciones en circulacion y flujo de caja operativo) en un unico objeto JSON. Resuelve un problema muy acotado y repetitivo del analisis financiero: la conversion de documentos extensos y heterogeneos en datos estructurados y verificables.

El modelo parte de una arquitectura Qwen3.5 (transformer con capas de atencion lineal, segun se desprende de la model card) de aproximadamente 4.660 millones de parametros, y se distribuye cuantizado en NVFP4 de 4 bits mediante compressed-tensors para su uso en vLLM. Con 98,8% de cifras correctas en el conjunto de test, iguala a Qwen3.5-397B y se acerca a Claude Opus 5.5, pero a un coste de 0,07 USD por cada 1.000 informes sobre una sola GPU RTX 5090.

Su relevancia actual reside en la relacion calidad-coste: demuestra que una tarea de extraccion estructurada bien delimitada puede resolverse con un modelo de 4B cuantizado a 4 bits y ejecutarse en hardware de consumo, sin necesidad de infraestructura de gran escala ni de APIs propietarias. La licencia Apache 2.0 facilita su integracion en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 (incluye capas de atencion lineal y torre de vision, ambas mantenidas en bf16) |
| Parametros totales | 4.659.865.088 (~4,66B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 12.288 tokens configurados en el ejemplo de despliegue (`--max-model-len 12288`) |
| Tipos de cuantizacion | NVFP4 (4 bits, formato de punto flotante de NVIDIA) via compressed-tensors; `lm_head`, torre de vision y capas de atencion lineal en bf16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 5,7 GB), compatible con vLLM |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-4B, un transformer de la familia Qwen3.5 que incorpora capas de atencion lineal (mantenidas en bf16 tras la cuantizacion) y una torre de vision. Sobre ese modelo se aplico un fine-tuning mediante LoRA en bf16 con rango 16, α 32 y tasa de aprendizaje 2e-4, usando la libreria Unsloth sobre 940 informes 10-K de entrenamiento. La funcion de perdida cubre unicamente la respuesta (el objeto JSON), no el prompt. Se conservo el checkpoint tras media epoca, ya que todos los checkpoints puntuaron 100% en validacion y se eligio el mas temprano.

La cuantizacion se realizo con llm-compressor en formato NVFP4, calibrada sobre 256 informes de entrenamiento. La cabeza de salida (`lm_head`), la torre de vision y las capas de atencion lineal de Qwen3.5 permanecen en bf16. La precision en validacion tras cuantizar fue del 99,8% frente al 100% en bf16. El modelo espera un prompt exacto (mensaje de sistema en `src/filing_figures/prompts.py` y el informe construido por `src/filing_figures/inputs.py`) y responde con un unico objeto JSON con las seis cifras.

## Capacidades

- Extraccion estructurada de seis cifras financieras de informes 10-K: ingresos, beneficio neto, BPA diluido, activos totales, acciones en circulacion y flujo de caja operativo.
- Salida en JSON con valor, escala (`millions`), fecha de cierre del periodo y ano fiscal para cada cifra.
- Generacion de texto y conversacion (pipeline `text-generation`, tag `conversational`).
- Modo pensamiento desactivable mediante `enable_thinking: false` en las kwargs de la plantilla de chat.
- Soporte de inferencia en vLLM con procesamiento por lotes (32 peticiones en vuelo probadas).
- Capacidad multilingue limitada al ingles.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico multi-paso.

## Casos de uso

- Extraccion automatizada de cifras de informes 10-K para alimentar bases de datos financieras: el modelo recibe el texto del informe y devuelve un JSON con las seis metricas, listo para ingesta directa en un pipeline ETL.
- Analisis fundamental a escala: procesar carteras completas de empresas cotizadas (S&P 500) para comparar ingresos, beneficio neto y flujo de caja entre ejercicios con coste marginal minimo (0,07 USD por 1.000 informes).
- Validacion cruzada frente a datos XBRL: el repositorio incluye una CLI que descarga el informe desde EDGAR y puntua la respuesta contra XBRL, util para auditoria de calidad de datos.
- Investigacion academica en finanzas: obtencion de paneles de datos historicos (2019-2024) sin depender de APIs comerciales ni de modelos propietarios.
- Despliegue on-premise en entornos con requisitos de confidencialidad: al ejecutarse en una sola RTX 5090, permite procesar informes sin enviar documentos a servicios externos.
- Screening cuantitativo y generacion de alertas: deteccion de variaciones interanuales en las metricas extraidas para disparar revisiones manuales.
- Prototipado rapido de productos fintech: la licencia Apache 2.0 y el bajo requisito de hardware permiten integrar la extraccion en MVP sin costes de infraestructura elevados.

## Benchmarks y rendimiento

Resultados sobre el split de test de kyryk/filing-figures: 207 informes de 36 empresas no vistas en entrenamiento, 1.186 cifras, ejecucion unica. Una cifra se considera correcta si esta dentro del 0,5% (EPS: 0,005 USD) y su fecha de cierre de periodo es exacta.

| Modelo | Cifras correctas | Informes con las 6 correctas | USD por 1.000 informes |
|---|---|---|---|
| Qwen3.5-4B sin fine-tuning | 95,4% | 83% | 0,11 |
| Este modelo (fine-tuned, NVFP4) | 98,8% | 93% | 0,07 |
| Qwen3.5-397B | 98,7% | 93% | 3,66 |
| Claude Opus 5.5 | 100,0% | 100% | 29,86 |

Rendimiento de inferencia: 4,6 informes/s con 32 peticiones en vuelo sobre una RTX 5090, con aproximadamente 5.000 tokens de entrada y 300 de salida por informe. Precision en validacion tras cuantizar: 99,8% frente a 100% en bf16.

## Requisitos de hardware

- GPU con soporte NVFP4: NVIDIA Blackwell (RTX 50-series, B200). Probado con vLLM 0.32.0 sobre una RTX 5090.
- VRAM estimada: el repo de pesos ocupa 5,7 GB, por lo que la inferencia cabe holgadamente en 8-10 GB de VRAM (cifra estimada a partir del tamano del repo; no confirmada explicitamente en la model card).
- Cabe en GPU de consumo: si, en RTX 5090 y previsiblemente en otras GPUs Blackwell de gama alta.
- Opciones de despliegue: vLLM (libreria oficial del modelo). No se documenta soporte de llama.cpp, Ollama ni TGI.
- Throughput: 4,6 informes/s con 32 peticiones concurrentes en una RTX 5090.
- Configuracion recomendada: `--max-model-len 12288 --language-model-only --default-chat-template-kwargs '{"enable_thinking": false}'`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cifras correctas (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FilingFigures Qwen3.5-4B NVFP4 | ~4,66B | 12.288 tokens (configurado) | 98,8% | Apache 2.0 | HuggingFace, vLLM |
| Qwen3.5-4B (base, sin fine-tuning) | ~4B | No disponible | 95,4% | No disponible en la informacion | HuggingFace |
| Qwen3.5-397B | 397B | No disponible | 98,7% | No disponible en la informacion | HuggingFace |
| Claude Opus 5.5 | No disponible | No disponible | 100,0% | Propietaria | API |

La comparativa se limita a los datos publicados en la model card; no se dispone de informacion sobre contexto, licencia ni arquitectura de los modelos alternativos mas alla de lo indicado.

## Limitaciones y advertencias

- Entrenado y evaluado unicamente con informes 10-K no financieros del S&P 500 de 2019 a 2024; no incluye bancos ni aseguradoras.
- Los errores restantes en test son mayoritariamente de definicion: "Sales and other operating revenues" frente a ingresos totales, y beneficio neto antes o despues de dividendos preferentes.
- Responde solo a partir del texto proporcionado; no se ha probado con PDFs, informes escaneados ni otros tipos de documento.
- Requiere el prompt exacto de entrenamiento; desviarse de la plantilla de sistema o del formato de entrada puede degradar la calidad.
- Solo soporta ingles.
- Riesgo de alucinacion inherente a los modelos generativos: aunque la tarea esta acotada, las cifras deben validarse contra XBRL en produccion.
- La cuantizacion NVFP4 exige hardware Blackwell; no es desplegable en GPUs anteriores sin reconvertir los pesos.
- Uso comercial permitido por la licencia Apache 2.0, sin restricciones adicionales documentadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kyryk/filing-figures-qwen3.5-4b-nvfp4
- Adaptador LoRA: https://huggingface.co/kyryk/filing-figures-qwen3.5-4b-lora
- Dataset: https://huggingface.co/datasets/kyryk/filing-figures
- Repositorio de codigo, prompt y resultados: https://github.com/nathankyryk/filing-figures
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
