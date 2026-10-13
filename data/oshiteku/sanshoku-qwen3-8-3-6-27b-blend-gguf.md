# oshiteku/Sanshoku-Qwen3.8-3.6-27B-blend-GGUF

## Resumen

Sanshoku-Qwen3.8-3.6-27B-blend es un modelo ternario de 27.320.697.856 parametros publicado por el usuario oshiteku, obtenido mediante destilacion con entrenamiento consciente de la cuantizacion (QAT) a partir de un merge de Qwen/Qwen3.6-27B y Qwen/Qwen3.8-27B. Los pesos de embedding, cabeza de salida, bloque MTP y capas lineales toman valores en {-1, 0, +1}; las proyecciones k/v de la atencion y las proyecciones alpha/beta de la atencion lineal, 191 millones de parametros (aproximadamente el 0,7% del total), se mantienen en F16.

Se distribuye unicamente en formato GGUF con tres empaquetados del mismo juego de pesos: Q2_0 (8,03 GB, compatible con llama.cpp upstream), PQ2_0 (7,61 GB) y PTQ1_0 (6,34 GB), estos dos ultimos con kernels del fork de PrismML. El pipeline declarado es image-text-to-text, con un codificador de vision aparte (mmproj-F16.gguf, 0,93 GB) resultante de la mezcla de los encoders de los dos modelos base.

Su relevanciaPractica es la eficiencia: el modelo completo ocupa entre 6,34 y 8,03 GB y alcanza 35,4-40,4 tok/s de decodificacion en una RTX 4000 Ada de 20 GB, cifra que sube a 56,8 tok/s con decodificacion especulativa MTP en el empaquetado Q2_0, frente a los 19,3 tok/s del Qwen3.8-27B UD-Q4_K_M de 16,5 GB. El autor lo describe como experimental y por debajo de Ternary-Bonsai-2-27B en varios benchmarks, con un rendimiento especialmente debil en matematicas y razonamiento cientifico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion lineal hibrida (bloques de atencion k/v mas proyecciones alpha/beta de atencion lineal) y bloque MTP; pesos ternarios en {-1, 0, +1} salvo excepciones en F16 |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Parametros en F16 | 191 millones (aproximadamente 0,7%): proyecciones k/v de atencion y alpha/beta de atencion lineal |
| Longitud de contexto | 32.768 tokens en la configuracion de ejemplo del autor; maximo oficial no disponible |
| Tipos de cuantizacion | Ternaria con empaquetados Q2_0, PQ2_0 y PTQ1_0; capas k/v y alpha/beta en F16; mmproj en F16 |
| Idiomas soportados | en, ja |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repositorio | 22,9 GB |
| Descargas / likes | 0 / 1 |
| Fecha de publicacion | 12 de octubre de 2026 |

## Arquitectura y entrenamiento

El modelo parte de un merge de Qwen3.6-27B y Qwen3.8-27B, una idea tomada del modelo Qwen3.8-3.6-27B-blend de JetBrains. Sobre ese merge se aplica una ternarizacion de los pesos de embedding, cabeza de salida, bloque MTP y capas lineales, con inicializacion de cada peso al nivel ternario mas cercano al intervalo entre su valor en Qwen3.6 y su valor en Qwen3.8, agrupando los pesos de 128 en 128. Las proyecciones k/v de la atencion y las proyecciones alpha/beta de la atencion lineal quedan fuera de la ternarizacion y permanecen en F16.

El entrenamiento se hizo con QAT y un estimador de gradiente directo (straight-through estimator) contra la distribucion top-32 de tokens del modelo fusionado usado como profesor, con aproximadamente 1.000 millones de tokens de datos. No se documentan fases de RLHF ni DPO. El bloque MTP se conserva y se explota en inferencia como borrador para decodificacion especulativa (`--spec-type draft-mtp --spec-draft-n-max 2`). El codificador de vision es una mezcla en FP16 de los encoders de los dos modelos base.

## Capacidades

- Generacion de texto conversacional en ingles y japones, con modo de pensamiento (thinking) activable.
- Razonamiento multi-paso orientado a agentes, con rendimiento de 58,0 en SWE-bench Verified y 58 en SWE-bench Verified Mini bajo mini-SWE-agent.
- Tool calling y function calling: 75,0 en BFCL v3, ligeramente por encima del 73,9 de Ternary-Bonsai-2-27B.
- Capacidades multimodales de entrada imagen-texto (pipeline image-text-to-text), mediante el encoder mmproj-F16.gguf.
- Generacion y reparacion de codigo: 86,7 en HumanEval+, 85,2 en JHumanEval y 38,3 en LiveCodeBench v6.
- Traduccion en-ja y ja-en con BLEU de 22,5 y 21,9 respectivamente en WMT20.
- Decodificacion especulativa mediante el bloque MTP, que eleva el decode de 35,4 a 56,8 tok/s en el empaquetado Q2_0.
- Seguimiento de instrucciones: 80,0 en IFEval (prompt strict) y 36,7 en IFBench.
- No se documentan capacidades de audio, agentes con memoria persistente ni modos de razonamiento adicionales.

## Casos de uso

- Agentes de codigo en produccion: integrable en bucles tipo mini-SWE-agent con hasta 250 pasos y presupuestos de 1 a 3 horas por instancia; su 58,0 en SWE-bench Verified lo situa en un rango util para tareas de reparacion de repositorios, con la ventaja de ocupar menos de 8 GB de pesos.
- Despliegue en hardware de gama media: al caber en GPUs consumer de 12-20 GB con cuantizacion ternaria, permite ejecutar un modelo de 27B en estaciones de trabajo sin GPU de datacenter.
- Automatizacion con tool calling: el 75,0 en BFCL v3 lo hace adecuado para orquestar APIs y funciones en pipelines de backend donde el coste por token y la latencia importan.
- Atencion al cliente en japones: dispone de 80,7 en JMMLU y 53,5 en M-IFEval ja, con soporte nativo de conversacion multiturno y ventana de 32.768 tokens en la configuracion recomendada.
- Procesamiento de documentos con imagen: al aceptar entrada image-text-to-text, puede extraer informacion de capturas, diagramas o documentos escaneados combinando el encoder de vision con el decodificador ternario.
- Traduccion tecnica en-ja y ja-en: BLEU de 22,5 y 21,9 en WMT20, suficiente para pre-traduccion asistida o localizacion de documentacion con revision humana.
- Prototipado e investigacion sobre cuantizacion extrema: sirve como caso de estudio de QAT ternario con destilacion desde un modelo fusionado, Comparable con Ternary-Bonsai-2-27B.
- Ejecucion local con decodificacion especulativa: el bloque MTP permite servir a 56,8 tok/s en una RTX 4000 Ada, util para asistentes interactivos en local.

## Benchmarks y rendimiento

Medidos por el autor con un unico harness para los tres modelos: swallow-evaluation-instruct (lighteval) y EvalScope, servidos con vLLM, con reasoning effort `low`, temperatura 0,6, top-p 0,95, top-k 20 y thinking activado.

| Categoria | Benchmark | Sanshoku-Qwen3.8-3.6-27B-blend | Ternary-Bonsai-2-27B | Qwen3.8-27B BF16 |
|---|---|---:|---:|---:|
| | Tamano | 7,6 GB | 7,2 GB | 54 GB |
| Agente | SWE-bench Verified (500) | 58,0 | 60,8 | 80,6 |
| | SWE-bench Verified Mini (50) | 58 | 60 | no disponible |
| | BFCL v3 | 75,0 | 73,9 | 76,0 |
| Ingles | MATH-500 | 89,0 | 98,6 | 99,0 |
| | AIME 2024+2025 (pass@1, 4 muestras) | 35,0 | 87,5 | 82,9 |
| | GPQA Diamond | 54,0 | 80,8 | 84,8 |
| | MMLU-Pro (1.001 muestreadas) | 71,0 | 80,4 | 82,6 |
| | LiveCodeBench v6 | 38,3 | 47,6 | 55,3 |
| | HumanEval+ | 86,7 | 92,7 | 93,4 |
| | IFEval (prompt strict) | 80,0 | 90,8 | 87,4 |
| | IFBench | 36,7 | 63,0 | 50,3 |
| Japones | JMMLU (1.060 muestreadas) | 80,7 | 86,3 | 89,7 |
| | MMLU-ProX ja (1.001 muestreadas) | 63,6 | 75,5 | 79,6 |
| | JEMHopQA | 53,0 | 49,7 | 67,5 |
| | JGPQA Diamond | 52,0 | 77,8 | 83,8 |
| | MATH-100 ja | 81,8 | 96,0 | 96,0 |
| | JHumanEval | 85,2 | 92,9 | 92,9 |
| | M-IFEval ja | 53,5 | 62,8 | 65,7 |
| | WMT20 en-ja / ja-en (BLEU) | 22,5 / 21,9 | 23,1 / 22,5 | 22,8 / 23,4 |
| | MT-Bench ja | 5,90 | 6,19 | 7,07 |

Notas del autor: los valores de SWE-bench Verified de Ternary-Bonsai-2-27B y Qwen3.8-27B BF16 provienen del whitepaper de Ternary Bonsai 2 y se obtuvieron con un harness distinto; SWE-bench Verified Mini se ejecuto con mini-SWE-agent y limite de 1 hora por instancia; MT-Bench ja se juzgo con Claude Sonnet 5.5 sobre las preguntas y prompts de Swallow.

Rendimiento medido en una RTX 4000 Ada (20 GB); prefill y decode corresponden a `llama-bench` pp512 y tg128, y "decode + MTP" es la media de cuatro peticiones de chat de 256 tokens de salida con 2 tokens de borrador.

| Formato | Runtime | Prefill (tok/s) | Decode (tok/s) | Decode + MTP (tok/s) |
|---|---|---:|---:|---:|
| Q2_0 | llama.cpp upstream | 1117 | 35,4 | 56,8 |
| PQ2_0 | fork de PrismML | 1027 | 37,8 | 54,9 |
| PTQ1_0 | fork de PrismML | 1002 | 40,4 | 39,5 |
| Qwen3.8-27B UD-Q4_K_M (16,5 GB) | llama.cpp upstream | 985 | 19,3 | 34,8 |

## Requisitos de hardware

- VRAM para los pesos: entre 6,34 GB (PTQ1_0) y 8,03 GB (Q2_0), segun el empaquetado elegido. El repositorio completo ocupa 22,9 GB.
- Codificador de vision: 0,93 GB adicionales si se usa la entrada de imagen (mmproj-F16.gguf).
- Cache KV: no cuantificada y de tamano no especificado en la informacion disponible; a 32.768 tokens de contexto anade varios GB que dependen del numero de capas y cabezas, por lo que el consumo total supera con holgura el tamano de los pesos.
- GPU medidas: RTX 4000 Ada de 20 GB, con `-ngl 99 -c 32768 -fa on`. Es la unica configuracion con cifras publicadas.
- Cabe en GPU consumer: si, en tarjetas de 12 GB o mas con el empaquetado PTQ1_0 y contexto moderado; en tarjetas de 8 GB el margen es muy ajustado una vez sumados cache KV y overhead del runtime (estimacion a partir de los tamanos de fichero, no medida por el autor).
- Opciones de despliegue: llama.cpp upstream (probado en el commit f2cc728) para Q2_0; fork de PrismML (commit bdc23b5) para PQ2_0 y PTQ1_0; llama-server con `--jinja` y decodificacion especulativa MTP. La evaluacion de benchmarks se sirvio con vLLM. No se documenta compatibilidad con Ollama ni con TGI.
- Throughput: prefill de 1002-1117 tok/s y decode de 35,4-40,4 tok/s en una RTX 4000 Ada; con MTP, hasta 56,8 tok/s en Q2_0.
- Latencia: no se publican cifras de time-to-first-token ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano en disco | Contexto | SWE-bench Verified | AIME 2024+2025 | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---:|---:|---:|---:|---|---|
| Sanshoku-Qwen3.8-3.6-27B-blend | 27,3B (ternario) | 6,34-8,03 GB | 32.768 tokens en la config de ejemplo | 58,0 | 35,0 | 71,0 | Apache-2.0 | GGUF en HuggingFace |
| Ternary-Bonsai-2-27B | 27B (ternario) | 7,2 GB | no disponible | 60,8 | 87,5 | 80,4 | no disponible en esta informacion | GGUF en HuggingFace |
| Qwen3.8-27B BF16 | 27B | 54 GB | no disponible | 80,6 | 82,9 | 82,6 | no disponible en esta informacion | pesos completos y GGUF (unsloth) |

El modelo se queda por detras de Ternary-Bonsai-2-27B en la mayoria de benchmarks de razonamiento y matematicas, con la excepcion de BFCL v3 (75,0 frente a 73,9) y JEMHopQA (53,0 frente a 49,7). Su principal ventaja competitiva es la velocidad: el autor indica que alcanza puntuaciones similares en tareas de agente de codigo en aproximadamente el 60% del tiempo.

## Limitaciones y advertencias

- Modelo experimental y expresamente reconocido como inferior a Ternary-Bonsai-2-27B en varios benchmarks.
- Razonamiento matematico y cientifico muy degradado: 35,0 en AIME 2024+2025 frente a 87,5 del modelo comparable, 54,0 en GPQA Diamond y 52,0 en JGPQA Diamond. No es adecuado para tareas cuantitativas exigentes.
- Seguimiento de instrucciones limitado en formatos no estandar: 36,7 en IFBench y 53,5 en M-IFEval ja.
- Riesgo de alucinacion: la ternarizacion a 2 bits y 1.000 millones de tokens de entrenamiento implican una perdida de fidelidad respecto a los modelos base, sin que se documenten tasas de alucinacion medidas.
- Sesgos: no se documenta ningun analisis de sesgos ni de seguridad. Al derivar de Qwen3.6-27B y Qwen3.8-27B, hereda las caracteristicas de esos modelos base, cuyo detalle no esta disponible en la informacion proporcionada.
- Idiomas: solo ingles y japones. No hay soporte declarado de castellano ni de otras lenguas.
- Ventana de contexto: el unico valor documentado es 32.768 tokens en el ejemplo de ejecucion; no se publica el maximo soportado por la arquitectura ni el comportamiento mas alla de esa longitud.
- Licencia: Apache-2.0 para este repositorio, pero se declara como modelo comunitario independiente, no una publicacion oficial de Qwen. Conviene verificar las condiciones de los modelos base antes de un uso comercial.
- Infraestructura: PQ2_0 y PTQ1_0 requieren un fork especifico de llama.cpp (PrismML) y commits concretos del runtime; el uso de versiones distintas puede no funcionar o hacerlo sin las optimizaciones previstas.
- Riesgo de confusion al descargar: las etiquetas `:Q2_0` pueden coincidir con el fichero PQ2_0, por lo que se recomienda seleccionar el fichero explicitamente con `-hff`.
- El empaquetado PTQ1_0 mejora el decode puro (40,4 tok/s) pero empeora notablemente con MTP (39,5 tok/s frente a 56,8 del Q2_0), por lo que la eleccion del formato debe alinearse con el modo de servicio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oshiteku/Sanshoku-Qwen3.8-3.6-27B-blend-GGUF
- Modelo base Qwen/Qwen3.6-27B: https://huggingface.co/Qwen/Qwen3.6-27B
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Merge original de JetBrains, Qwen3.8-3.6-27B-blend: https://huggingface.co/JetBrains/Qwen3.8-3.6-27B-blend
- Ternary-Bonsai-2-27B (modelo comparable): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Fork de llama.cpp de PrismML (kernels PQ2_0 y PTQ1_0): https://github.com/PrismML-Eng/llama.cpp
- Commit del fork probado (bdc23b5): https://github.com/PrismML-Eng/llama.cpp/tree/bdc23b56b4458b9f1655aec5287f3ab56ee8daaa
- Commit de llama.cpp upstream probado (f2cc728): https://github.com/ggml-org/llama.cpp/tree/f2cc7282ce0042641df55e0e563b75e824e2b647
- Cuantizaciones Qwen3.8-27B de unsloth (referencia de comparacion): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- mini-SWE-agent, harness de evaluacion de agente: https://github.com/SWE-agent/mini-SWE-agent
- swallow-evaluation-instruct (lighteval): https://github.com/swallow-llm/swallow-evaluation-instruct
- Dataset SWE-bench Verified Mini: https://huggingface.co/datasets/MariusHobbhahn/swe-bench-verified-mini
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los enlaces obtenidos corresponden a foros de soporte de Microsoft y no guardan relacion con el contenido de la ficha.
