# ronke21/rlcl-Qwen2.5-1.5B-chem-s125

## Resumen

rlcl-Qwen2.5-1.5B-chem-s125 es un ajuste fino (fine-tune) del modelo Qwen2.5-1.5B publicado por el usuario ronke21 en Hugging Face. Segun los tags del repositorio, se trata de un modelo derivado mediante la tecnica RLCL (presumiblemente *reinforcement learning with continual learning* o similar, aunque la informacion disponible no lo confirma) y fusionado con LoRA (`lora-merged`). El tag `forgetting` sugiere que el trabajo aborda el olvido catastrofico durante el ajuste, y el sufijo `chem` apunta a un entrenamiento orientado al dominio de la quimica, con el identificador de checkpoint `s125`.

El modelo conserva la arquitectura transformer decoder-only de Qwen2.5-1.5B, con 1.543.714.304 parametros (aproximadamente 1,54 mil millones) y pesos en formato safetensors. El repositorio ocupa 3,1 GB, coherente con pesos en precision bf16/fp16. La ventana de contexto heredada del modelo base es de 32.768 tokens segun la documentacion oficial de Qwen2.5, aunque el autor no la especifica en la ficha del modelo.

La relevancia de este modelo es limitada y experimental: cuenta con cero descargas y cero likes en el momento de redactar esta ficha, el acceso esta restringido (gated) y no se publican resultados de evaluacion ni detalles del dataset de entrenamiento. Debe tratarse como un artefacto de investigacion, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2, segun tag `qwen2`) |
| Parametros totales | 1.543.714.304 (~1,54 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la ficha del autor; el modelo base Qwen2.5-1.5B soporta 32.768 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | no disponible (el modelo base Qwen2.5 soporta multiples idiomas, incluido espanol, ingles y chino) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-1.5B |
| Metodo de ajuste | RLCL + LoRA fusionado (`lora-merged`) |
| Acceso | restringido (gated) |
| Tamano del repositorio | 3,1 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B: un transformer decoder-only denso con atencion causal, normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con query/key/value bias, segun la especificacion publica de la familia Qwen2.5. El modelo original se entreno sobre 18 billones de tokens segun Qwen, pero esa cifra corresponde al modelo base y no al ajuste fino aqui descrito.

El ajuste especifico de ronke21 emplea la tecnica etiquetada como `rlcl`, con adaptadores LoRA posteriormente fusionados en los pesos base (`lora-merged`). El tag `forgetting` indica que el trabajo se centra en mitigar el olvido catastrofico, probablemente midiendo la degradacion en tareas generales tras el ajuste en el dominio de quimica (`chem`). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni hiperparametros. El identificador `s125` sugiere un checkpoint intermedio o una semilla, sin que pueda confirmarse.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen2.5-1.5B (`conversational` en los tags).
- Respuesta a instrucciones en formato chat de Qwen (ChatML), presumiblemente conservado tras el ajuste.
- Conocimiento especializado en quimica, segun el sufijo `chem` del identificador; el alcance y la profundidad no estan documentados.
- Capacidades multilingues heredadas del modelo base (espanol, ingles, chino, entre otros), aunque no verificadas tras el ajuste.
- Soporte de tool calling y agentes: el modelo base Qwen2.5 lo incluye, pero no hay confirmacion de que se conserve tras el ajuste fino.
- Compatibilidad con text-generation-inference y endpoints compatibles, segun los tags.
- No se documentan capacidades de vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Experimentacion academica sobre olvido catastrofico: el modelo sirve como artefacto para reproducir o comparar tecnicas de ajuste continuo en dominios especializados, dado su tag `forgetting`.
- Extraccion de entidades quimicas en textos cientificos: un modelo de 1,5 B ajustado en quimica puede emplearse para identificar compuestos, formulas y reacciones en parrafos, con bajo coste de inferencia.
- Clasificacion y etiquetado de literatura quimica: util para preprocesar abstracts de PubMed o patentes y asignar categorias tematicas antes de un analisis posterior con modelos mayores.
- Prototipado rapido en entornos con GPU de consumo: sus 1,54 B de parametros permiten iterar en una RTX 3060 o superior con cuantizacion, adecuado para pruebas de concepto.
- Generacion asistida de resumenes tecnicos en quimica: puede redactar resumenes de articulos o fichas de seguridad a partir de texto de entrada, siempre con revision humana por el riesgo de alucinacion.
- Evaluacion comparativa de fine-tunes pequenos: sirve como referencia en estudios que comparan variantes de Qwen2.5-1.5B ajustadas por dominio, midiendo retencion de capacidades generales frente a especializacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 3,1 GB de pesos mas overhead de activaciones y cache KV; en la practica, unos 4-6 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2 GB; en 4 bits (GGUF/AWQ), alrededor de 1,2-1,5 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4090); A100 o H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090 y similares; tambien en GPUs integradas con suficiente memoria compartida para cuantizaciones de 4 bits.
- Opciones de despliegue: transformers (nativo), text-generation-inference (soportado segun tags), vLLM (compatible con arquitectura Qwen2), llama.cpp/Ollama (requiere conversion a GGUF, no publicada en el repo).
- Latencia y throughput: no disponibles; para un modelo de 1,5 B en una RTX 4090 se espera un throughput del orden de miles de tokens por segundo en batching, pero no hay medicion publicada para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| ronke21/rlcl-Qwen2.5-1.5B-chem-s125 | 1,54 B | no disponible (base: 32.768) | no disponible | restringido | Ajuste RLCL + LoRA en quimica, sin benchmarks |
| Qwen/Qwen2.5-1.5B | 1,54 B | 32.768 | Apache 2.0 | abierto | Modelo base, benchmarks publicos por Qwen |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 | Apache 2.0 | abierto | Variante instruct con evaluacion oficial |
| microsoft/Phi-3-mini-4k-instruct | 3,8 B | 4.096 | MIT | abierto | Alternativa pequena con contexto corto |
| google/gemma-2-2b-it | 2,6 B | 8.192 | Gemma Terms | abierto (con condiciones) | Alternativa de Google con licencia propia |

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card detallada, ni descripcion del dataset, ni hiperparametros de entrenamiento, lo que impide evaluar su calidad de forma rigurosa.
- Sin benchmarks publicados: no puede afirmarse que supere al modelo base en tareas de quimica ni que conserve sus capacidades generales.
- Riesgo de olvido catastrofico: el propio tag `forgetting` sugiere que el ajuste puede haber degradado capacidades del modelo base; conviene validar en tareas generales antes de usarlo.
- Riesgo de alucinacion elevado en dominio cientifico: un modelo de 1,5 B ajustado en quimica puede generar formulas, reacciones o referencias inexistentes; requiere verificacion humana obligatoria.
- Licencia no disponible: no puede confirmarse el uso comercial; ademas, el acceso esta restringido y requiere aceptar condiciones en Hugging Face, lo que anade incertidumbre legal.
- Idiomas no declarados: aunque el modelo base es multilingue, no hay garantia de que el ajuste haya preservado el rendimiento en espanol.
- Repositorio sin traccion: cero descargas y cero likes, sin issues ni discusion; no hay senales de mantenimiento ni soporte.
- Fecha de creacion futura en los metadatos (2026-11-27), lo que sugiere posible error de marcado o artefacto del repositorio; conviene tratar los metadatos con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ronke21/rlcl-Qwen2.5-1.5B-chem-s125
- Modelo base Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Modelo base instruct Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Blog oficial de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio Qwen2.5 en GitHub: https://github.com/QwenLM/Qwen2.5
- Paper tecnico de Qwen2.5: https://arxiv.org/abs/2412.15115
