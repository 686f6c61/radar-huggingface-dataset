# Remek/basal-omni-2.0-mini-preview

## Resumen

basal-omni-2.0-mini (preview) es un modelo de decisiones tipadas desarrollado por Remek (proyecto basal), construido como un ajuste fino de `google/gemma-4-E4B-it`. A diferencia de un modelo generativo convencional, no redacta respuestas: lee un estado (un mensaje, un documento, pasajes recuperados, una traza de agente o una pagina web en JSON) y responde a una pregunta tipada (`choice`, si/no `noul`, `score` y, en el motor basal, `multi`, `act` y `tool`) devolviendo una probabilidad calibrada por cada opcion permitida en un unico forward pass. Esta version es un lanzamiento temprano de la familia basal-omni 2.0, que se completara con los tamanos nano, mini, max y ultra.

El modelo cuenta con 7.941.100.874 parametros totales segun los pesos en safetensors, aunque esta construido sobre una base Gemma 4 E4B, lo que sugiere una arquitectura derivada con expansion de parametros respecto al modelo base. El repositorio ocupa 15,9 GB y se distribuye bajo licencia Apache 2.0. Los idiomas declarados son polaco (pl) e ingles (en), con un enfasis claro en el mercado polaco segun los benchmarks publicados.

La relevancia de este modelo radica en su enfoque: en lugar de generar texto libre, produce decisiones acotadas a un conjunto de opciones con probabilidades calibradas, lo que permite automatizar decisiones con objetivos de error controlados (cobertura del 58,3% al 1% de error y del 87,8% al 5%). Es una propuesta interesante para pipelines de clasificacion, enrutamiento y evaluacion donde la trazabilidad de la confianza importa tanto como la precision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Gemma 4 E4B (fine-tune); detalles internos no disponibles |
| Parametros totales | 7.941.100.874 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los resultados publicados usan bf16 y FP8 en modelos comparados) |
| Idiomas soportados | polaco (pl), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `google/gemma-4-E4B-it`, una base instructiva de Google, orientado a la tarea de decisiones tipadas. La innovacion principal de la version 2.0 es la lectura bidireccional del estado: el modelo procesa el estado en ambas direcciones antes de responder, una funcionalidad servida por el motor basal 2.5 o superior. Esto implica que el modelo no se limita a una lectura causal izquierda-derecha del contexto, sino que explota la informacion completa del estado para emitir su decision.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. El modelo se sirve mediante el motor propietario basal (version publica 2.8.0), que gestiona las preguntas tipadas y aplica un fichero `CALIBRATION.json` con umbrales por tipo de pregunta. La calibracion es un componente central del diseno: las probabilidades emitidas se usan para decidir automaticamente solo cuando superan un umbral certificado, derivando el resto a revision humana.

## Capacidades

- Decisiones tipadas: responde preguntas de tipo `choice` (seleccion entre opciones), `noul` (si/no), `score` (puntuacion) y, en el motor basal, `multi`, `act` y `tool`.
- Probabilidades calibradas por opcion en un unico forward pass, sin generacion de texto.
- Respuesta acotada: la salida nunca cae fuera del conjunto de opciones proporcionado.
- Lectura bidireccional del estado (requiere motor basal 2.5 o superior).
- Capacidades multilingues limitadas a polaco e ingles.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling mediante el tipo de pregunta `tool` en el motor basal.
- Orientado a trazas de agente y estados estructurados en JSON.

## Casos de uso

- Enrutamiento de consultas: el modelo puede clasificar un mensaje entrante en una de varias categorias predefinidas (`choice`) con probabilidad calibrada, permitiendo derivar automaticamente las consultas de alta confianza y escalar el resto. Su rendimiento en la categoria de routing de Werdykt es 0,966.
- Verificacion de recuperacion (RAG): dado un pasaje recuperado y una pregunta, el modelo emite un si/no sobre si el pasaje respalda la respuesta, con una precision de 0,780 en RAGTruth, util para filtrar alucinaciones antes de generar.
- Clasificacion de sentimiento financiero: con 0,957 en FinancialPhraseBank, puede etiquetar frases financieras en pipelines de analisis de noticias o informes.
- Evaluacion de respuestas de modelos (judge): con 0,627 en JudgeBench, puede emplearse como evaluador binario o de eleccion en pipelines de evaluacion automatica, siempre con umbrales de calibracion.
- Analisis de contratos y documentos legales: con 0,777 en ContractNLI y 0,960 en PL-Real (documentos polacos reales), puede verificar clausulas y condiciones en flujos de revision documental.
- Toma de decisiones sobre documentos largos: con precision de 0,800 en estados de 1k-2k caracteres y 0,694 en documentos largos, adecuado para clasificar documentos de extension media con control de error.
- Automatizacion con cobertura controlada: usando los umbrales de `CALIBRATION.json`, se puede decidir automaticamente el 58,3% de las decisiones con un error observado del 0,58%, y el 87,8% con un error del 4,0%, lo que permite disenar SLAs de error en produccion.

## Benchmarks y rendimiento

Resultados publicados por el autor, servidos con el motor basal 2.8.0 en una NVIDIA H100, bf16, `--mode eager`, con el `CALIBRATION.json` incluido (Werdykt medido con basal 2.5 en RTX PRO 6000 Blackwell):

| Benchmark | Resultado |
|---|---|
| Werdykt v1, macro (PL + EN, 5.000 items) | 0,811 (IC 95%: 0,801-0,821) |
| Werdykt v1, polaco / ingles | 0,807 / 0,814 |
| Decisiones PL (test held-out, 7.081 items) | 0,951 |
| PL general (conocimiento, examenes, lectura; 3.079 items) | 0,767 |
| PL-Real (300 documentos polacos reales) | 0,960 |
| Panel externo EN (10 tareas publicas, 3.842 items) | 0,811 |
| Corpus test EN (1.479 items) | 0,692 |
| Cobertura al 1% de error | 58,3% con 0,58% de error observado |
| Cobertura al 5% de error | 87,8% con 4,0% de error observado |

Desglose del panel externo en ingles:

| Tarea | Items | Precision |
|---|---|---|
| FinancialPhraseBank | 300 | 0,957 |
| Belebele (ingles) | 300 | 0,940 |
| WinoGrande | 300 | 0,907 |
| Circa | 300 | 0,837 |
| TabFact | 300 | 0,830 |
| BIG-Bench Hard | 540 | 0,811 |
| RAGTruth | 300 | 0,780 |
| ContractNLI | 300 | 0,777 |
| TruthfulQA (binario) | 902 | 0,649 |
| JudgeBench | 300 | 0,627 |

Precision por longitud del estado en Werdykt:

| Longitud del estado | Items | Precision |
|---|---|---|
| 0-1k caracteres | 709 | 71,4% [68, 75] |
| 1k-2k caracteres | 2.598 | 80,0% [78, 82] |
| 2k+ caracteres | no disponible en la informacion proporcionada | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: con 7,94 mil millones de parametros, en bf16 se requieren aproximadamente 16 GB de VRAM para los pesos; en FP8 unos 8 GB. La informacion de cuantizaciones disponibles no se detalla.
- GPU recomendadas: el autor publica resultados en NVIDIA H100 y NVIDIA RTX PRO 6000 Blackwell; tambien se han usado RTX PRO 6000 para modelos comparables.
- Cabe en GPU de consumo: previsiblemente en tarjetas con 16 GB o mas en bf16 (por ejemplo, RTX 4090 o RTX 4080), aunque no se confirma en la informacion disponible.
- Opciones de despliegue: el modelo se sirve principalmente mediante el motor basal (version publica 2.8.0), con modos `eager` y `fast`. Es compatible con transformers y con endpoints. No se menciona soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. Los resultados se reportan en un unico forward pass, lo que sugiere baja latencia por decision, pero no se aportan cifras.

## Comparativa con modelos similares

Comparativa en Werdykt v1 (5.000 items ocultos PL + EN), con cada modelo servido por el servidor de su fabricante:

| Modelo | Werdykt v1 [IC 95%] | PL / EN | Ventaja de basal-omni-2.0-mini |
|---|---|---|---|
| basal-omni-2.0-mini (preview) | 0,811 [0,801-0,821] | 0,807 / 0,814 | - |
| torchcast-decision-4b (v1.3) | 0,799 [0,788-0,809] | 0,787 / 0,810 | +1,2 [+0,1, +2,2] |
| KnowLine-4B-Gen5.5 | 0,776 [0,766-0,787] | 0,764 / 0,788 | +3,4 [+2,3, +4,5] |
| h2o-lightning-4b (v1.1) | 0,753 [0,742-0,764] | 0,745 / 0,761 | +5,8 [+4,7, +6,9] |
| Bielik-One-4B-r1 | 0,696 [0,684-0,709] | 0,687 / 0,705 | +11,5 [+10,2, +12,6] |

Nota: KnowLine-4B se sirvio en FP8; el resto en bf16. basal-omni-2.0-mini declara 7,94 mil millones de parametros frente a los 4B nominales de sus competidores, por lo que la comparacion no es estrictamente de igual tamano. Los datos de parametros, contexto y licencia de los modelos comparados no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Es una version preview: el autor advierte que el mini final puede diferir de esta version.
- Categorias debiles en Werdykt: reglas (0,382), documentos largos (0,694) y contratos (0,726). Para umbrales exactos y fechas, el autor recomienda calcularlos en codigo.
- La lectura bidireccional requiere el motor basal 2.5 o superior; con versiones anteriores el comportamiento en prompts largos puede degradarse.
- Rendimiento notablemente inferior en estados cortos (0-1k caracteres: 71,4%) que en estados medios (1k-2k: 80,0%).
- TruthfulQA binario (0,649) y JudgeBench (0,627) muestran limitaciones en veracidad y evaluacion de respuestas.
- Solo soporta polaco e ingles; no hay soporte multilingue amplio.
- La licencia Apache 2.0 permite uso comercial, pero no se detallan restricciones adicionales derivadas del modelo base Gemma 4 (conviene revisar los terminos de Google).
- El modelo no genera texto: cualquier caso de uso que requiera respuestas redactadas necesita un modelo generativo complementario.
- Riesgo de alucinacion estructuralmente bajo en las decisiones (la salida se acota a las opciones), pero la calibracion depende del fichero `CALIBRATION.json` y de los umbrales aplicados por el servidor.
- Los benchmarks Werdykt son conjuntos ocultos; solo se publican totales, lo que limita la verificacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Remek/basal-omni-2.0-mini-preview
- Repositorio del motor de inferencia: https://github.com/rkinas/basal
- Sitio web del proyecto: https://basal.si5.pl/
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- torchcast-decision-4b: https://huggingface.co/torchcast-ai/torchcast-decision-4b
- KnowLine-4B-Gen5.5: https://huggingface.co/PelaAI/KnowLine-4B-Gen5.5
- Bielik-One-4B-r1: https://huggingface.co/speakleash/Bielik-One-4B-r1
