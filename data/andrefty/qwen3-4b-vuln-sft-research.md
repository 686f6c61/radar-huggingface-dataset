# Andrefty/qwen3-4b-vuln-sft-research

## Resumen

Andrefty/qwen3-4b-vuln-sft-research es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen3-4B, desarrollado por el usuario Andrefty y publicado en Hugging Face con acceso restringido. Su proposito declarado, segun los tags del repositorio, es la deteccion de vulnerabilidades en codigo (vulnerability-detection, code-security) con fines de investigacion. Se distribuye en formato safetensors y es compatible con transformers y text-generation-inference.

El modelo hereda la arquitectura transformer densa de Qwen3-4B, aunque no se han publicado en la informacion disponible los detalles especificos del proceso de ajuste: no hay datos sobre el dataset de entrenamiento, el numero de pasos, la composicion de los pares instruction/response ni la metodologia de evaluacion. El repositorio incluye unicamente metadatos de la model card y los pesos, sin documentacion tecnica adicional.

Es relevante ahora porque representa un ejemplo de especializacion de un modelo pequeno (4B) en una tarea de seguridad de codigo, un area donde los modelos generalistas suelen fallar por falta de ejemplos especificos. Sin embargo, la ausencia de benchmarks publicados, de licencia explicita y de documentacion sobre el dataset limita seriamente su evaluacion objetiva y su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3-4B) |
| Parametros totales | 4B (modelo base); el campo safetensors reporta 196.096 como recuento de tensores/entradas, no parametros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-4B, valor no confirmado en la informacion) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) del checkpoint Qwen/Qwen3-4B, un transformer denso de aproximadamente 4.000 millones de parametros. No se ha publicado informacion sobre la arquitectura interna modificada, el regimen de entrenamiento (learning rate, batch size, numero de epochs), la composicion del dataset de instrucciones ni si se aplicaron tecnicas adicionales como RLHF, DPO o rejection sampling. Tampoco hay datos sobre el volumen de tokens de entrenamiento ni sobre la procedencia de los ejemplos de codigo vulnerable utilizados.

La unica innovacion tecnica documentada es la propia especializacion en deteccion de vulnerabilidades, que se infiere de los tags del repositorio. No hay evidencia publicada de tecnicas como decodificacion especulativa, atencion lineal o modos de razonamiento extendido especificos de este checkpoint. El repositorio ocupa 66,3 GB, un tamano desproporcionado para un modelo de 4B en safetensors (que tipicamente ocupa entre 8 y 16 GB), lo que sugiere la presencia de multiples checkpoints, estados de optimizador u otros artefactos no documentados.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen3-4B.
- Deteccion y clasificacion de vulnerabilidades en codigo fuente, segun el proposito declarado en los tags (vulnerability-detection, code-security).
- Analisis de seguridad de fragmentos de codigo, presumiblemente orientado a identificar patrones de riesgo.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible para este checkpoint especifico.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun el campo de idiomas del repositorio.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en la informacion.

## Casos de uso

- Revision de seguridad en pipelines de CI/CD: el modelo podria integrarse como paso de analisis estatico para marcar fragmentos de codigo sospechosos antes del merge, aprovechando su especializacion en vulnerabilidades. Requiere validacion previa contra falsos positivos.
- Triaje de hallazgos de SAST: usar el modelo para priorizar alertas generadas por herramientas como Semgrep o CodeQL, clasificando cuales merecen revision manual. Su tamano de 4B permite despliegue en infraestructura modesta.
- Asistencia a desarrolladores en revision de codigo: un bot que comente pull requests senalando posibles patrones inseguros y sugiera alternativas seguras, siempre con supervision humana.
- Generacion de explicaciones educativas sobre vulnerabilidades: a partir de un fragmento de codigo, producir una descripcion del riesgo (por ejemplo, inyeccion SQL o XSS) para formacion de equipos.
- Investigacion academica en seguridad de codigo: servir como baseline especializado para comparar con modelos generalistas en tareas de deteccion de vulnerabilidades, dado su caracter de research.
- Filtrado previo en plataformas de comparticion de codigo: detectar automaticamente snippets potencialmente peligrosos antes de su publicacion, con revision humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 8-9 GB para los pesos de un modelo de 4B, mas overhead de KV cache.
- VRAM estimada en cuantizacion 8 bits: aproximadamente 5-6 GB; en 4 bits, aproximadamente 3-4 GB (estimaciones genericas para 4B; no hay cuantizaciones oficiales publicadas).
- GPU recomendadas: A100 40GB o H100 para despliegue en FP16 con contexto largo; RTX 4090 (24 GB) o RTX 3090 (24 GB) para FP16 con margen amplio; RTX 4080 (16 GB) o RTX 4070 Ti (12 GB) para cuantizacion 8 bits.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en cuantizacion, y en 12-16 GB en FP16 con contexto moderado.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (tag endpoints_compatible); vLLM y llama.cpp no estan confirmados para este checkpoint al no haber pesos GGUF publicados.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Andrefty/qwen3-4b-vuln-sft-research | 4B | no disponible | Deteccion de vulnerabilidades (SFT) | no disponible | Gated en Hugging Face |
| Qwen/Qwen3-4B (base) | 4B | no disponible en esta ficha | Generalista | Apache 2.0 (segun el modelo base, no confirmado aqui) | Publico |
| CodeLlama-7B | 7B | 16K (segun version) | Codigo generalista | Llama 2 Community License | Publico |
| StarCoder2-3B | 3B | 16K | Codigo generalista | BigCode OpenRAIL-M | Publico |

La comparativa es orientativa: no hay datos de rendimiento publicados para el modelo especializado que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia objetiva de mejora sobre el modelo base en deteccion de vulnerabilidades.
- Licencia no especificada: no se puede confirmar el uso comercial; ademas, el modelo base Qwen3-4B tiene sus propias condiciones que deben respetarse.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion para su adopcion y reproducibilidad.
- Dataset de entrenamiento no documentado: riesgo de sesgos y de sobreajuste a patrones especificos de vulnerabilidades presentes en los datos de entrenamiento.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar vulnerabilidades inexistentes o pasar por alto las reales; no debe usarse como unico mecanismo de seguridad.
- Idioma limitado al ingles: el analisis de codigo con comentarios o documentacion en otros idiomas puede degradarse.
- Tamano del repositorio anormalmente grande (66,3 GB) para un modelo de 4B: posible presencia de artefactos no documentados; conviene inspeccionar antes de descargar.
- Sin cuantizaciones oficiales publicadas: el despliegue eficiente requiere generar GGUF o AWQ manualmente.
- Caracter de research: no hay garantias de robustez en produccion ni de mantenimiento del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Andrefty/qwen3-4b-vuln-sft-research
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
