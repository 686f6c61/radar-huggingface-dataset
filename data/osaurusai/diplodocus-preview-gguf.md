# OsaurusAI/Diplodocus-preview-GGUF

## Resumen

Diplodocus preview 4 es un modelo de generacion de texto desarrollado por OsaurusAI, construido sobre el modelo base IFM/K2-Horizon-7B y ajustado especificamente para tareas de finanzas, documentos, hojas de calculo y trabajo asistido por herramientas. El repositorio publicado es una compilacion en formato GGUF para llama.cpp, con tres cuantizaciones calibradas mediante importance matrix: Q4_K_M (6,33 GB), Q6_K (7,76 GB, recomendada) y Q8_0 (9,57 GB). El modelo cuenta con aproximadamente 8.999 millones de parametros y 36 capas, y emplea una arquitectura propia denominada `k2-horizon`, que requiere una version reciente de llama.cpp (soporte incorporado en el PR ggml-org/llama.cpp#29535, fusionado el 6 de octubre de 2026).

El problema que aborda es el uso de modelos locales como asistentes de escritorio con acceso a herramientas de trabajo reales: edicion de libros de calculo y documentos in situ, operaciones de lectura acotada de ficheros, uso de una herramienta `calculate` para aritmetica monetaria exacta y manejo de formularios PDF, incluidos PDF firmados. Este preview 4 anade sobre preview 3 rondas de entrenamiento R8-R11 centradas en el uso correcto de la herramienta de calculo, la recuperacion ante errores del motor aritmetico y la manipulacion de documentos sin regenerar libros de calculo existentes.

Es relevante ahora porque forma parte del ecosistema Osaurus, un harness nativo de macOS para agentes de IA que se ejecuta de forma totalmente offline, y porque el modelo incorpora un modo de razonamiento conmutable (encendido por defecto, apagado para baja latencia) junto con tool calling nativo. La licencia Apache 2.0 y el formato GGUF facilitan su despliegue local en GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `k2-horizon` (transformer denso, 36 capas), requiere llama.cpp con soporte K2 Horizon |
| Parametros totales | 8.999.178.240 (aproximadamente 9.000 millones) |
| Longitud de contexto | no disponible (el ejemplo de la model card configura `-c 32768`) |
| Tipos de cuantizacion | Q4_K_M, Q6_K, Q8_0 (con importance matrix) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); existe un bundle MLX equivalente en OsaurusAI/Diplodocus-preview-JANG_6M |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 36 capas con proyecciones de atencion (q, k, v, o), bloques MLP con compuertas gate/up y down, embeddings y una cabeza de salida no atada (untied output head), y capas de normalizacion en F32. La arquitectura se identifica como `k2-horizon` y no es compatible con versiones antiguas de llama.cpp ni con aplicaciones que empaqueten una version previa del runtime. El ajuste se realizo sobre IFM/K2-Horizon-7B en rondas R8-R11 acumuladas sobre preview 3, con dos modos de razonamiento conmutables: `reasoning_effort: "high"` (razonamiento activado, valor por defecto) y modo bajo (razonamiento desactivado mediante un bloque de razonamiento vacio pre-rellenado en la plantilla). El valor `medium` no esta soportado.

El entrenamiento se centro en las herramientas propias del workspace de Osaurus: operaciones `file_edit` in situ sobre libros de calculo y documentos, ventanas acotadas de `file_read`, `mode:"structure"`, `set_cells` con formulas activas, la herramienta `calculate` (cuando invocarla, cadenas de aritmetica monetaria y recuperacion de errores del motor) y tratamiento de formularios PDF y PDF firmados. La matriz de importancia incluida (`Diplodocus-preview.imatrix.gguf`) se calculo sobre el modelo BF16 con 1.653.067 tokens de conversaciones de herramientas, trazas con razonamiento activado y desactivado, y cadenas de calculadora. El muestreo por defecto es temperatura 1.0 y top_p 0.95, fijado en los metadatos del GGUF.

## Capacidades

- Generacion de texto conversacional en ingles con plantilla de chat embebida (uso obligatorio de `--jinja` en `llama-server`).
- Razonamiento conmutable: modo alto (por defecto) y modo bajo, con distinto comportamiento de latencia y calidad.
- Tool calling nativo mediante el sobre `k2_horizon`; `llama-server --jinja` lo traduce a `tool_calls` de OpenAI y expone el razonamiento en `reasoning_content`.
- Aritmetica monetaria exacta a traves de la herramienta `calculate`, incluidas cadenas de calculo y recuperacion ante errores del motor.
- Edicion in situ de libros de calculo y documentos (`file_edit`, `set_cells` con formulas vivas, `file_read` con ventanas acotadas), sin regenerar libros existentes.
- Manipulacion de formularios PDF y manejo de PDF firmados.
- Capacidades orientadas a finanzas, documentos y hojas de calculo como dominio de especializacion.
- Multilingue: solo ingles (no se declara soporte de otros idiomas).
- No se declaran capacidades de vision, audio ni generacion de imagenes.

## Casos de uso

- Aritmetica financiera exacta: con razonamiento activado, el modelo decide cuando invocar `calculate` y encadena operaciones monetarias, lo que resulta adecuado para respuestas de tipo "1234.56 * 0.0825 redondeado a centimos" evitando errores de calculo tipicos de un LLM.
- Edicion de hojas de calculo en produccion: mediante `set_cells` con formulas vivas y `file_edit`, permite modificar libros existentes de forma quirurgica sin regenerar el fichero completo, reduciendo el riesgo de perdida de formulas o formato.
- Analisis de documentos largos con preguntas de dinero: usando ventanas de `file_read` y razonamiento activado, responde a preguntas que requieren localizar cifras en documentos extensos y operar con ellas.
- Automatizacion de formularios PDF: relleno y tratamiento de formularios PDF, incluidos documentos firmados, dentro de flujos administrativos o financieros.
- Agente local de escritorio en macOS: integrado en el harness Osaurus, funciona de forma totalmente offline sobre datos locales, lo que lo hace adecuado para entornos con requisitos de privacidad.
- Asistente de back-office para finanzas y contabilidad: combina lectura de documentos, edicion de libros de calculo y calculadora para tareas repetitivas de conciliacion o extraccion de importes.
- Despliegue en hardware de consumo: la cuantizacion Q4_K_M (6,33 GB) permite ejecutar el modelo en GPU de 8 GB o en equipos con RAM ajustada, habilitando prototipos locales sin infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card incluye diagnosticos de cuantizacion y evaluaciones internas del autor, que no constituyen benchmarks independientes de precision de tareas.

Diagnosticos de cuantizacion sobre el modelo BF16 (conjunto retenido de 64 filas, 206k tokens, razonamiento activado y desactivado, 41 con llamadas a herramientas):

| Candidato | Tamano | KLD media | KLD mediana | Top-1 igual |
|---|---|---|---|---|
| Q8_0 (publicado) | 9,57 GB | 0,0285 | 0,0019 | 95,5% |
| Q6_K estandar | 7,39 GB | 0,1325 | 0,0109 | 89,7% |
| Q6_K + importance matrix | 7,39 GB | 0,1020 | 0,0076 | 91,3% |
| Q6_K + imatrix + atencion Q8_0 (publicado) | 7,76 GB | 0,0608 | 0,0044 | 93,1% |
| Q4_K_M + importance matrix | 5,59 GB | 0,2055 | 0,0311 | 85,3% |
| Q4_K_M + imatrix + atencion Q8_0 (publicado) | 6,33 GB | 0,1246 | 0,0182 | 88,4% |

Evaluaciones internas del autor (datos de la model card, no verificados de forma independiente):

| Tarea | Antes (preview 3) | Despues (preview 4) |
|---|---|---|
| Tareas end-to-end de libros/documentos, razonamiento on (de 100) | 59 | 70 |
| Tareas end-to-end de libros/documentos, razonamiento off (de 100) | 51 | 70 |
| Respuestas monetarias en documentos largos ejecutadas con calculadora, razonamiento on (de 60) | 31 | 43 |

## Requisitos de hardware

- VRAM estimada para pesos: Q4_K_M 6,33 GB; Q6_K 7,76 GB; Q8_0 9,57 GB (tamanos exactos de fichero indicados en la model card).
- VRAM total necesaria: no disponible de forma exacta (depende de la cache KV, que varia con la longitud de contexto; el modelo tiene 36 capas). La model card solo indica que Q4_K_M esta pensado para GPU de 8 GB o equipos con RAM ajustada.
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090) en la informacion disponible. Q4_K_M es la opcion para tarjetas de 8 GB; Q6_K es el equilibrio recomendado; Q8_0 se acerca mas a BF16.
- Si cabe en GPU de consumo: si, Q4_K_M y Q6_K en tarjetas de 8 GB y superiores, segun la propia model card.
- Opciones de despliegue: llama.cpp / `llama-server` con soporte K2 Horizon obligatorio (`--jinja`, `-ngl 99`); harness Osaurus en macOS; en Mac se recomienda el bundle MLX OsaurusAI/Diplodocus-preview-JANG_6M. No se menciona compatibilidad con vLLM, Ollama ni TGI.
- Ejemplo de arranque: `llama-server -hf OsaurusAI/Diplodocus-preview-GGUF:Q6_K --jinja -ngl 99 -c 32768`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Diplodocus-preview-GGUF (este modelo) | ~9.000 M | no disponible | GGUF (Q4_K_M, Q6_K, Q8_0) | Apache 2.0 | Ajuste en herramientas de finanzas, documentos y hojas de calculo |
| IFM/K2-Horizon-7B (modelo base) | etiquetado como 7B | no disponible | no disponible | no disponible | Origen del ajuste; el repositorio de Diplodocus es una cuantizacion del modelo ajustado |
| OsaurusAI/Diplodocus-preview-JANG_6M (bundle MLX) | mismos pesos | no disponible | MLX | no disponible | Mismos pesos y plantilla, para Mac con Osaurus |

No se dispone de datos suficientes sobre otros modelos de la misma categoria (rango 7-9B orientados a agentes y tool calling) en la informacion proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Solo soporta ingles; no se declara ningun otro idioma.
- Es un preview (preview 4) y puede contener comportamiento inestable o en evolucion.
- Modelo sensible al ruido de cuantizacion: la propia model card indica que BF16 con ruido de embedding de un ULP obtiene 96,2% de top-1, y Q8_0 queda en 95,5% en su conjunto de diagnostico.
- Los diagnosticos de KLD y las evaluaciones internas son mediciones sobre datos de la distribucion de entrenamiento, no benchmarks independientes de precision en tareas reales.
- Riesgo de alucinacion inherente a los modelos de lenguaje; en dominio financiero puede producir cifras incorrectas si no se usa la herramienta `calculate` con razonamiento activado.
- El modo de razonamiento desactivado puede degradar tareas complejas de varios pasos; la mejora de "loop fix" se aplica solo al modo desactivado.
- No se debe enviar `reasoning_effort: "medium"`, no esta soportado.
- Requiere obligatoriamente una version de llama.cpp con soporte `k2-horizon` (posterior al 6 de octubre de 2026); versiones antiguas o aplicaciones que empaqueten llama.cpp antiguo no cargaran el modelo.
- La licencia Apache 2.0 permite uso comercial, pero la informacion disponible no aclara posibles restricciones derivadas del modelo base IFM/K2-Horizon-7B; conviene verificar la licencia del modelo base antes de un uso comercial.
- Longitud de contexto maxima no documentada en la informacion disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OsaurusAI/Diplodocus-preview-GGUF
- Bundle MLX para Mac: https://huggingface.co/OsaurusAI/Diplodocus-preview-JANG_6M
- Sitio de Osaurus: https://osaurus.ai/
- Repositorio GitHub de Osaurus: https://github.com/osaurus-ai/osaurus
- Organizacion en GitHub: https://github.com/osaurus-ai
- PR de llama.cpp con soporte K2 Horizon: https://github.com/ggml-org/llama.cpp/pull/29535
- Modelos con etiqueta osaurus en HuggingFace: https://huggingface.co/models?other=osaurus
