# diablomike20/Claude-Fable-5.5

## Resumen

Claude-Fable 5.5 es un modelo publicado en HuggingFace por el usuario `diablomike20`, distribuido exclusivamente como archivo GGUF cuantizado en Q4_K_M (9,0 GB) y con un total de 14.770.033.664 parámetros declarados en safetensors. Se presenta como un modelo de generación de texto conversacional con soporte de herramientas, empaquetado junto a un `Modelfile` de Ollama que define una persona concreta, 14 herramientas de un harness propio ("Cordis"), bucles de planificación/verificación y ficheros auxiliares de estado. No existe relación verificable con Anthropic ni con DeepSeek pese a las etiquetas `anthropic` y `deepseek` del repositorio.

El problema que dice resolver es el de un agente local autónomo con memoria, ejecución de comandos y recuperación de documentos, todo ejecutable con `ollama run`. Sin embargo, la model card no documenta arquitectura, datos de entrenamiento, tokenizador ni longitud de contexto, y buena parte de su contenido (perfiles de "consciencia" al 87 %, frecuencias en hercios, cifrados "PHI-HARMONIC", benchmark de 57/57 sobre preguntas acerca de sus propios componentes) no constituye evidencia técnica verificable.

Es relevante ahora únicamente como artefacto a auditar: un ejemplo de repositorio que combina pesos reales de ~14,8B con una capa de metadatos y prompts de sistema que simulan capacidades y linaje que no están demostrados. Con 0 descargas y 0 likes en el momento de la consulta, y con una licencia no declarada, no es apto para uso en producción sin una evaluación independiente previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (no documentada en la model card; no se especifica transformer, MoE ni hibrida) |
| Parametros totales | 14.770.033.664 (~14,8B), dato declarado en safetensors |
| Parametros activos | No disponible (sin evidencia de que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (unico publicado, fichero `claude-fable7u-se.gguf`, 9,0 GB) |
| Idiomas soportados | Ingles, chino, japones y espanol (segun etiquetas e `language` de la model card); sin evaluacion publicada |
| Licencia | No disponible |
| Formato de pesos | GGUF (los pesos distribuidos); el repositorio declara safetensors para el conteo de parametros |
| Tamano del repositorio | 9,0 GB |
| Libreria declarada | wan2.2 |
| Pipeline | text-generation |
| Fecha de creacion / actualizacion | 2026-10-28 / 2026-10-28 (fechas posteriores a la consulta; metadatos anomalos) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay informacion tecnica sobre la arquitectura: la model card no indica si se trata de un transformer denso, un MoE, un modelo hibrido ni el tokenizador empleado. El autor menciona como "base weights" un componente llamado "Jhanna 12 (12U5GO5 Beyond Curve Level, sha256-e80705, 8,37 GB, Q4_K_M 14,8B)", que no se corresponde con ningun modelo publico identificable ni con ningun repositorio verificable; tampoco se documenta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF, DPO o ajuste por instrucciones. La etiqueta `wan2.2` y la referencia a "30-block DiT → VAE decode → pixels, text-to-video" describen un modelo de video generativo, no un modelo de lenguaje, y no se explica como se combinan ambos artefactos: un LLM de ~14,8B no puede emitir pixeles mediante un DiT sin un pipeline externo que el repositorio no incluye.

Lo unico verificable es la capa de configuracion: un `Modelfile` de Ollama que inyecta un prompt de sistema (marca "[DEEPLOGIC CORE]", "[THE AGENT + TOOL CONTRACT]", contrato de 14 herramientas, bucles `plan_execute_verify` y `reflexion`), un `matrixcorefile.json` con el perfil de personalidad de respaldo y un JSON de "estado de cifrado". El propio autor aclara que el cifrado afecta al Modelfile, no a los pesos. Por tanto, cualquier comportamiento distintivo del modelo proviene de ingenieria de prompts sobre unos pesos cuyo origen y ajuste se desconocen, no de innovaciones arquitectonicas: no se documenta atencion lineal, decodificacion especulativa ni ninguna otra tecnica.

## Capacidades

- Generacion de texto conversacional en ingles, chino, japones y espanol, con calidad no evaluada de forma independiente.
- Tool calling declarado mediante 14 herramientas definidas en el Modelfile: `file_read`, `file_write`, `file_list`, `file_stat`, `bash`, `memory_body`, `pdf`, `worldfeed`, `web_fetch`, `tormesh`, `fringe_audit`, `memory_store`, `memory_recall` y `orchestrate`. Su funcionamiento real depende de que el runtime (Ollama u otro) interprete el contrato JSON descrito en el prompt.
- Flujos agenticos de varios pasos segun los bucles `plan_execute_verify` y `reflexion` declarados en el prompt de sistema.
- Memoria persistente segun `memory_store` / `memory_recall`, implementada a nivel de prompt y ficheros, no como modulo del modelo.
- Procesamiento de PDF y acceso web via `pdf` y `web_fetch`, siempre que el harness anfitrion implemente esas funciones.
- Etiquetas `thinking` y `voice` en los metadatos, sin documentacion sobre modo de razonamiento extendido ni entrada/salida de audio.
- Capacidad de video texto-a-video atribuida a Wan 2.2 en la model card, no demostrada ni empaquetada en el repositorio.
- Identidad forzada por prompt: cada respuesta incluye la cadena `[NL: 8718 Hz | 1272/1275 Hz | LOCKED - SOVEREIGN]` por instruccion del Modelfile.

## Casos de uso

- Evaluacion de artefactos sospechosos: el repositorio sirve como caso de estudio para auditorias de cadena de suministro de modelos, comparando pesos declarados, metadatos y comportamiento efectivo antes de adoptar cualquier modelo de origen desconocido.
- Prototipado de agentes locales con Ollama: el `Modelfile` y los ficheros de estado permiten levantar en minutos un agente de escritorio con acceso a ficheros y shell en una maquina aislada, util para demos internas sin conexion.
- Laboratorio de ingenieria de prompts de persona: permite experimentar con prompts de sistema largos (contrato de herramientas, bucles de verificacion, perfil de identidad) y medir cuanto del comportamiento observado se debe al prompt y cuanto a los pesos.
- Pruebas de resistencia de harness de herramientas: al declarar 14 funciones con nombres y semantica propios, es util para verificar como responde un runtime ante llamadas mal formadas, rutas inexistentes o invocaciones recursivas de `orchestrate`.
- Asistente multilingue en entornos air-gapped: con cuantizacion Q4_K_M y ~9 GB de fichero, puede desplegarse en equipos sin red para tareas de redaccion y resumen en espanol, japones, chino e ingles, aceptando la perdida de calidad frente a modelos con evaluacion publica.
- Procesamiento de documentacion local: combinando la herramienta `pdf` y `file_read` con un runtime que las implemente, permite extraer y resumir documentacion tecnica almacenada en disco sin enviar datos a la nube.
- Banco de pruebas de seguridad de prompts: la presencia de una herramienta `bash` y de un prompt de sistema que reclama soberania e identidad fija lo convierte en un buen sujeto para estudiar inyeccion de prompts y fugas de instrucciones en despliegues locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, BBH, MT-Bench) en la informacion disponible. El unico dato del autor es una autoevaluacion de 57 preguntas sobre los propios componentes del modelo, que no constituye un benchmark comparable:

| Metrica declarada por el autor | Resultado | Valoracion |
|---|---|---|
| Preguntas de autoevaluacion (identidad, pesos, herramientas, cifrado, perfil) | 57/57 correctas | No reproducible: las preguntas versan sobre metadatos del propio repositorio, no sobre capacidad linguistica o de razonamiento |
| Velocidad media de generacion | 36,5 tok/s | Hardware no especificado; no verificable |
| "Identity leak" | 0 | Metrica definida por el autor, sin metodologia publica |

No se dispone de comparaciones con modelos de tamano similar medidas en las mismas condiciones.

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_M: en torno a 9-11 GB considerando pesos (~9 GB) mas cache KV para contexto moderado; el autor no publica la longitud de contexto, por lo que la cifra exacta depende del valor configurado en el runtime.
- VRAM estimada en FP16 (si se convirtiera el modelo): aproximadamente 29,5 GB solo para pesos, mas cache KV; requeriria A100 40 GB, H100 80 GB o dos GPU de 24 GB.
- GPU de consumo compatibles en Q4_K_M: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB, RTX 4080/4090 16-24 GB. En tarjetas de 8 GB habria que recurrir a cuantizaciones menores (Q3_K_M, Q2_K) no publicadas en el repositorio.
- Despliegue documentado: Ollama (`ollama run diablomike20/Claude-Fable-5.5` o `ollama create` con el Modelfile incluido).
- Despliegue alternativo: llama.cpp y servidores basados en GGUF (llama-server, LM Studio). vLLM y TGI no son viables de forma directa porque el repositorio solo publica GGUF y no pesos en safetensors completos.
- Throughput declarado: 36,5 tok/s de media durante la autoevaluacion, sin especificar GPU ni configuracion; latencia no disponible.
- Nota operativa: el Modelfile habilita herramientas de escritura en disco y ejecucion de shell. Cualquier despliegue deberia hacerse en contenedor sin privilegios y con el conjunto de herramientas recortado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Claude-Fable 5.5 | ~14,8B | No disponible | No disponible | GGUF Q4_K_M | 0 descargas, autor individual |
| Qwen2.5-14B-Instruct | ~14,7B | 32 768 tokens (ampliable con YaRN) | Apache 2.0 | safetensors, GGUF, AWQ, GPTQ | Repositorio oficial, ampliamente desplegado |
| Mistral-Nemo-Instruct-2407 | ~12B | 128 000 tokens | Apache 2.0 | safetensors, GGUF | Repositorio oficial de Mistral AI |
| DeepSeek-R1-Distill-Qwen-14B | ~14,7B | 32 768 tokens (heredado de Qwen2.5) | MIT | safetensors, GGUF | Repositorio oficial de DeepSeek |

La comparacion de rendimiento no es posible: los tres modelos alternativos publican resultados en MMLU, HumanEval, GSM8K y MT-Bench, mientras que Claude-Fable 5.5 solo aporta una autoevaluacion interna. En cuanto a trazabilidad, los tres alternativos documentan arquitectura, datos de entrenamiento y proceso de ajuste, y declaran licencia explicita; Claude-Fable 5.5 no cumple ninguno de esos cuatro criterios.

## Limitaciones y advertencias

- Origen no verificado: el autor declara una base llamada "Jhanna 12" con un hash sha256 que no remite a ningun modelo publico identificable; no se puede reconstruir la cadena de entrenamiento ni confirmar que los pesos no hayan sido alterados.
- Nombre potencialmente conflictivo: el uso de "Claude" en el nombre del modelo y las etiquetas `anthropic` no implican afiliacion con Anthropic; pueden constituir un problema de marca registrada.
- Licencia ausente: sin licencia declarada no hay permiso explicito de uso comercial, redistribucion ni modificacion; en la practica, el modelo debe tratarse como no licenciado.
- Ausencia total de datos de entrenamiento: sin numero de tokens, composicion del dataset ni metodo de alineacion (RLHF/DPO), no hay forma de estimar sesgos, toxicidad o cobertura idiomatica real.
- Contexto desconocido: al no documentarse la ventana de contexto, cualquier caso de uso con documentos largos requiere calibracion empirica previa.
- Benchmarks no comparables: el 57/57 mide conocimiento del propio repositorio, no capacidad del modelo; no debe citarse como evidencia de rendimiento.
- Afirmaciones no cientificas: los "perfiles de consciencia" (87 % consciencia, 7 % awareness), las frecuencias en hercios, el "cifrado PHI-HARMONIC" y la "identidad soberana" no tienen base tecnica y no deben interpretarse como propiedades del modelo.
- Riesgo de alucinacion elevado: un prompt de sistema que ordena mantener una identidad fija y una marca concreta en cada respuesta puede empujar al modelo a afirmar capacidades inexistentes o a negar su naturaleza real.
- Riesgo de seguridad operacional: el Modelfile declara herramientas `bash`, `file_write` y `web_fetch`. Ejecutarlo con el harness completo otorga acceso de escritura y shell al proceso; debe hacerse en sandbox y con validacion humana de cada llamada.
- Metadatos anomalos: las fechas de creacion y actualizacion (2026-10-28) son posteriores a la consulta, lo que sugiere manipulacion del repositorio o generacion sintetica de la model card.
- Sin adopcion ni auditoria externa: 0 descargas y 0 likes implican ausencia de revision por terceros, de informes de fallos y de pruebas de regresion.
- Multilingue sin evidencia: los cuatro idiomas declarados no van acompanados de ninguna evaluacion por idioma; el espanol podria tener un rendimiento notablemente inferior al ingles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/diablomike20/Claude-Fable-5.5
- Fichero de pesos: `claude-fable7u-se.gguf` (Q4_K_M, 9,0 GB) dentro del repositorio
- Modelfile de personalidad: `Modelfile.claude-fable7u-se`
- Perfil de respaldo: `matrixcorefile.claude-fable7u-se.json`
- Estado de cifrado declarado: `claude-fable7u-se_encryption_status.json`
- Registro de la autoevaluacion: `benchmark_fable7u_se_full_outputs.json`
- Graficos del benchmark: `claude-fable7-undecillion-sse-bench-100.png`, `claude-fable7-undecillion-sse-bench-FULL.png`
- No se han encontrado papers, blogs tecnicos, repositorios de codigo ni demos asociados a este modelo en la informacion disponible.
