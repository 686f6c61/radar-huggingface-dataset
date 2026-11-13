# pallav0101/cyberdef-vuln-qwen2.5-7b-devign

## Resumen

cyberdef-vuln-qwen2.5-7b-devign es un adaptador LoRA (no un modelo completo) desarrollado por Pallav Pokhriyal sobre el modelo base Qwen/Qwen2.5-7B-Instruct. Su proposito es la deteccion defensiva de vulnerabilidades en codigo fuente: dado un fragmento de codigo, el adaptador emite un veredicto binario (`VERDICT: VULNERABLE` o `VERDICT: SAFE`) orientado a triaje de seguridad (blue team). No genera exploits ni reescribe el codigo para corregirlo.

El adaptador forma parte de un estudio de escalado y evaluacion cruzada entre conjuntos de datos de vulnerabilidades. Esta variante concreta se entrena sobre CodeXGLUE Devign, un corpus de codigo C real extraido de proyectos como FFmpeg y QEMU. Segun la model card, es el primero de los modelos comparados en Devign con un AUROC aproximado de 0,627, una cifra modesta que refleja la dificultad intrinseca de la tarea.

El modelo es relevante como ejemplo de especializacion mediante PEFT de un LLM generalista de 7B para una tarea acotada de seguridad, con un coste de almacenamiento muy bajo (el repositorio ocupa 0,2 GB al contener solo los pesos del adaptador). Su autoria lo situa como una pieza de investigacion mas que como una herramienta lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (Qwen2.5-7B-Instruct) |
| Parametros totales | No disponible (adaptador LoRA con r=16, alpha=32; el modelo base tiene 7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | Entrenado en 4-bit QLoRA (nf4); el adaptador se puede aplicar sobre el base en otros formatos |
| Idiomas soportados | No disponible |
| Licencia | MIT (adaptador); modelo base Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador emplea LoRA con rango 16 y alpha 32, entrenado mediante QLoRA en cuantizacion 4-bit nf4 sobre Qwen/Qwen2.5-7B-Instruct. El modelo base es un transformer decoder-only de 7B parametros de la familia Qwen2.5, en su variante Instruct. El adaptador no modifica la arquitectura del base: anade matrices de bajo rango en las capas seleccionadas, de modo que en inferencia se combina con los pesos originales.

El entrenamiento se realizo sobre el split de CodeXGLUE Devign, compuesto por funciones C reales de FFmpeg y QEMU etiquetadas como vulnerables o seguras. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; esos datos deben consultarse en el repositorio del proyecto (RESULTS.md). La innovacion principal no es arquitectonica sino metodologica: un estudio de escalado y evaluacion cruzada entre conjuntos de datos, con todas las metricas recalculadas a partir de salidas por caso registradas.

## Capacidades

- Clasificacion binaria de codigo como vulnerable o seguro mediante la emision de `VERDICT: VULNERABLE` o `VERDICT: SAFE`.
- Triaje asistido de seguridad sobre fragmentos de codigo, pensado para revision humana posterior.
- Deteccion defensiva (blue team) orientada a CVE y patrones de codigo inseguro en C.
- Uso conversacional heredado del modelo base Qwen2.5-7B-Instruct (text-generation, conversational).
- Soporte de umbral de abtencion: la model card recomienda combinarlo con un umbral para descartar casos de baja confianza.
- No genera exploits ni parchea codigo; su salida es unicamente el veredicto de clasificacion.

## Casos de uso

- Triaje preliminar en revision de codigo: integrar el adaptador en un pipeline de CI que clasifique funciones C nuevas y marque las sospechosas para revision manual, reduciendo el volumen de codigo que llega al analista.
- Priorizacion de hallazgos en auditorias: dado un conjunto de funciones de un proyecto como FFmpeg o QEMU, usar el veredicto para ordenar la cola de revision por riesgo estimado.
- Filtrado en herramientas SAST: complementar analizadores estaticos con una segunda senal basada en LLM para reducir falsos positivos antes de escalar a un humano.
- Investigacion en deteccion de vulnerabilidades: servir como punto de comparacion en estudios de escalado y evaluacion cruzada entre datasets (Devign, PrimeVul), replicando la metodologia del autor.
- Formacion y concienciacion: usar el modelo para etiquetar ejemplos didacticos de codigo seguro e inseguro en cursos de seguridad defensiva.
- Generacion de candidatos para datasets: preetiquetar grandes volumenes de codigo C y enviar solo los casos marcados como vulnerables a anotacion humana, con revision obligatoria por el riesgo de falsos `SAFE`.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| AUROC en Devign | ~0,627 | Primer puesto entre los modelos comparados en Devign segun la model card |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales para este adaptador. La unica metrica reportada es el AUROC en Devign, recalculado a partir de las salidas por caso registradas en el repositorio del proyecto.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en si ocupa unos 0,2 GB; el modelo base de 7B requiere aproximadamente 14-16 GB en FP16 y 4-6 GB en cuantizacion 4-bit.
- GPU recomendadas: A100, H100 o L40S para despliegue en servidor; RTX 4090 o RTX 3090 (24 GB) para FP16 en una sola GPU.
- Cabe en GPU de consumo: si, en RTX 4090/3090 en FP16, y en GPUs de 8-12 GB si se cuantiza el base a 4-bit.
- Opciones de despliegue: transformers + peft (metodo indicado en la model card), vLLM o TGI fusionando el adaptador con el base, y llama.cpp/Ollama si se convierte a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyberdef-vuln-qwen2.5-7b-devign | 7B (base) + LoRA r=16 | No disponible | AUROC ~0,627 en Devign | MIT (adaptador) / Apache-2.0 (base) | Hugging Face |
| cyberdef-vuln-qwen2.5-7b-primevul | 7B (base) + LoRA | No disponible | No disponible; descrito como el mejor adaptador por defecto | MIT (adaptador) | Hugging Face |
| Qwen/Qwen2.5-7B-Instruct | 7B | No disponible en la informacion proporcionada | No disponible | Apache-2.0 | Hugging Face |

La model card menciona otros tamanos del mismo estudio de escalado en el repositorio del proyecto, pero no se aportan sus especificaciones ni resultados en la informacion disponible.

## Limitaciones y advertencias

- El modo de fallo peligroso es un veredicto falso `SAFE`: la model card exige mantener siempre un revisor humano en el bucle.
- No apto para gating autonomo de seguridad ni para generar exploits o corregir codigo.
- Rendimiento modesto: AUROC ~0,627 en Devign indica una capacidad discriminativa limitada; para etiquetas curadas se recomienda la variante PrimeVul.
- Entrenado exclusivamente sobre codigo C de Devign (FFmpeg/QEMU); el comportamiento en otros lenguajes o dominios no esta documentado.
- Idiomas soportados no especificados; el modelo base es multilingue pero la especializacion es sobre codigo.
- Licencia MIT para el adaptador y Apache-2.0 para el base: el uso comercial esta permitido bajo los terminos de ambas, pero debe verificarse la combinacion en cada despliegue.
- Sin descargas ni likes en el momento de la consulta, y sin validacion externa publicada: tratar como artefacto de investigacion.
- No se han publicado datos de sesgo, robustez ante entradas adversarias ni evaluacion en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/pallav0101/cyberdef-vuln-qwen2.5-7b-devign
- Variante recomendada (PrimeVul): https://huggingface.co/pallav0101/cyberdef-vuln-qwen2.5-7b-primevul
- Repositorio del proyecto (resultados, receta, integridad): https://github.com/pallav0107/cyberdef-llm
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
