# PrometheusEXE/Distil-Deepseek.V4.Pro.Minute.Codex.NSFW-0.1B-GGUF

## Resumen

Distil-Deepseek.V4.Pro.Minute.Codex.NSFW-0.1B-GGUF es una distribucion en formato GGUF de un modelo de lenguaje causal de pequeno tamano (81,9 millones de parametros reales segun los pesos en safetensors), publicado por el usuario PrometheusEXE en Hugging Face. Se presenta como un destilado de la familia DeepSeek orientado a razonamiento y generacion de codigo, con un componente explicito de contenido para adultos (NSFW) reflejado en el nombre y en el tag `not-for-all-adult-audiences` / `mature`. El modelo base declarado es `11-47/Distil-Deepseek.V4.Pro.Minute.Codex.NSFW-0.1B`.

El modelo resuelve, en teoria, el caso de uso de inferencia local muy ligera de tareas de codigo y conversacion en ingles, empaquetado en GGUF para su uso con llama.cpp y derivados. La relevancia practica es limitada: se trata de un modelo de 0,1B (en la practica ~82M) con cero descargas y cero likes en el momento de la consulta, sin documentacion tecnica publicada, sin model card sustantiva y con acceso restringido (gated) que exige aceptar condiciones en Hugging Face.

No se dispone de informacion sobre arquitectura exacta, composicion del dataset de entrenamiento, proceso de destilacion ni resultados de evaluacion. Todo lo que sigue se limita a lo verificable en los metadatos del repositorio y a inferencias explicitamente marcadas como tales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (causal-lm); detalles de capas y dimensiones no disponibles |
| Parametros totales | 81.912.576 (~0,082B) segun safetensors |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes concretas no disponibles en la informacion) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo); el modelo base se distribuye presumiblemente en safetensors |

## Arquitectura y entrenamiento

La informacion disponible solo confirma que se trata de un modelo de tipo `causal-lm` con tag `transformers` y `pytorch`, distribuido en GGUF. El nombre sugiere una destilacion de un modelo DeepSeek (posiblemente generado o destilado de forma sintetica por el autor `11-47`), pero no hay model card que documente el profesor utilizado, el numero de tokens de entrenamiento, la mezcla de datos ni si hubo etapas de RLHF, DPO o SFT. El tag `reasoning` y `coding` indica la intencion declarada del autor, no una capacidad verificada.

No se dispone de informacion sobre innovaciones tecnicas (atencion lineal, decodificacion especulativa, MoE, SSM) ni sobre la tokenizer empleada. Cualquier afirmacion al respecto seria especulativa y, por tanto, se omite.

## Capacidades

- Generacion de texto en ingles (unico idioma declarado).
- Orientacion declarada a razonamiento (`reasoning`) y codigo (`coding`), sin evidencia publica de rendimiento.
- Contenido para adultos (NSFW/mature) segun los tags del repositorio.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que sugiere uso via Inference Endpoints o APIs compatibles con el formato GGUF.
- Tool calling / function calling: no disponible.
- Soporte de agentes o multi-step reasoning: no disponible.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo thinking explicito: no disponible.

## Casos de uso

- Prototipado local de asistentes de codigo en ingles: por su tamano (~82M parametros) puede ejecutarse en CPU o GPU de gama baja para pruebas de integracion con llama.cpp antes de escalar a modelos mayores.
- Experimentacion con destilados de DeepSeek: util como banco de pruebas para estudiar el comportamiento de destilaciones pequenas frente a modelos de referencia, siempre que se acepte la restriccion de acceso gated.
- Generacion de texto creativo para adultos en entornos controlados: el tag `mature` y el nombre del modelo indican ese proposito, aunque sin evaluacion publica de calidad ni de seguridad.
- Evaluacion de pipelines GGUF: sirve para validar cadenas de conversion, cuantizacion e inferencia con llama.cpp, Ollama o servidores compatibles con GGUF en entornos de CI.
- Educacion e investigacion sobre modelos pequenos: como ejemplo de modelo de 0,1B para estudiar escalado, tokenizacion y limites de contexto en trabajos academicos.
- Pruebas de integracion con endpoints compatibles: el tag `endpoints_compatible` permite verificar flujos de despliegue en Hugging Face Inference Endpoints u otros servicios que acepten GGUF.

En todos los casos, la ausencia de benchmarks y de model card obliga a validar el modelo contra el caso de uso concreto antes de cualquier uso en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por el tamano (~82M parametros) cabria esperar un consumo muy bajo (del orden de cientos de MB en cuantizaciones de 4-8 bits), pero no hay datos confirmados.
- GPU recomendadas: no disponible; por tamano, cualquier GPU consumer moderna (RTX 3060 o superior) deberia ser suficiente, aunque no esta verificado.
- Cabe en GPU consumer: previsiblemente si, en la mayoria de GPUs consumer actuales, dado el reducido numero de parametros.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, servidores GGUF), ademas de endpoints compatibles con el tag `endpoints_compatible`. vLLM y TGI no estan confirmados para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Distil-Deepseek.V4.Pro.Minute.Codex.NSFW-0.1B-GGUF | ~82M | no disponible | en | apache-2.0 | Gated en HF, 0 descargas |
| Qwen2.5-Coder-0.5B | ~0,5B | 32K (segun model card publica) | multi | apache-2.0 | Publico en HF |
| SmolLM2-135M | ~135M | 8K (segun model card publica) | en | apache-2.0 | Publico en HF |
| DeepSeek-Coder-1.3B | ~1,3B | 16K (segun model card publica) | multi | deepseek license | Publico en HF |

La comparativa se ofrece como referencia de categoria (modelos pequenos orientados a codigo); los datos de los modelos alternativos provienen de sus model cards publicas y no de la informacion de este repositorio. No hay datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: no se documentan datos de entrenamiento, evaluacion ni limitaciones conocidas.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion para uso en produccion y para auditoria.
- Cero descargas y cero likes en el momento de la consulta: no hay senal de adopcion ni de validacion por parte de la comunidad.
- Contenido NSFW/mature: no apto para entornos sin moderacion; riesgo de generar contenido inapropiado en aplicaciones orientadas al publico general.
- Solo ingles declarado: no se debe asumir capacidad multilingue.
- Riesgo de alucinacion elevado por el tamano reducido y la falta de evaluacion publica.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo sin verificacion empirica.
- Licencia apache-2.0 declarada, pero el modelo base (`11-47/Distil-Deepseek.V4.Pro.Minute.Codex.NSFW-0.1B`) puede tener condiciones adicionales no reflejadas aqui; conviene revisar la licencia del modelo base antes de uso comercial.
- Nombre del modelo potencialmente enganoso: menciona "Deepseek V4 Pro" pero no hay evidencia de que sea un modelo oficial de DeepSeek ni de que corresponda a esa familia.
- Sin garantias de calidad para codigo en produccion: no usar como unico generador en pipelines criticos sin validacion humana.

## Enlaces

- Repositorio Hugging Face (gated): https://huggingface.co/PrometheusEXE/Distil-Deepseek.V4.Pro.Minute.Codex.NSFW-0.1B-GGUF
- Modelo base declarado: https://huggingface.co/11-47/Distil-Deepseek.V4.Pro.Minute.Codex.NSFW-0.1B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
