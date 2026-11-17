# paul-woland/Shani

## Resumen

Shani es un adaptador LoRA publicado en Hugging Face por el usuario paul-woland, entrenado mediante SFT (supervised fine-tuning) sobre el modelo base unsloth/Qwen2.5-7B-Instruct-unsloth-bnb-4bit. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador de aproximadamente 0,2 GB que debe cargarse junto al checkpoint base de Qwen2.5-7B-Instruct para funcionar. El repositorio se creó y actualizó el 17 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni interacciones.

El modelo hereda las capacidades del Qwen2.5-7B-Instruct original, un transformer decoder-only denso de 7 mil millones de parametros con soporte nativo de instrucciones, tool calling y contexto largo. Sin embargo, la model card del adaptador es una plantilla sin rellenar: no documenta el dataset de entrenamiento, los hiperparametros, los idiomas, la licencia ni los resultados de evaluacion. Esto limita seriamente cualquier evaluacion rigurosa y obliga a tratar el modelo como un experimento de fine-tuning sin validacion publica.

Su relevancia practica es acotada: sirve como ejemplo de flujo de trabajo LoRA + Unsloth + TRL, pero no deberia adoptarse en producción sin una evaluacion propia y sin aclarar la licencia heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer decoder-only denso (Qwen2.5-7B-Instruct) |
| Parametros totales | no disponible (adaptador de ~0,2 GB; el modelo base tiene 7,6 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-7B-Instruct soporta hasta 131.072 tokens (heredado, no confirmado para el adaptador) |
| Tipos de cuantizacion | el adaptador se distribuye en safetensors; el base referenciado esta en bnb-4bit; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el modelo base Qwen2.5 esta bajo Apache 2.0, pero el adaptador no declara licencia propia) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2.5-7B-Instruct, un transformer decoder-only denso con atención por ventanas deslizantes combinada con atención completa, RoPE y normalización RMSNorm. El checkpoint base referenciado es la version cuantizada a 4 bits de Unsloth (unsloth-bnb-4bit), lo que sugiere que el fine-tuning se realizo con Unsloth y TRL, tecnicas habituales para reducir el consumo de VRAM en ajuste supervisado. El repositorio declara los tags `lora`, `sft` y `peft`, lo que confirma que se trata de un ajuste supervisado con adaptadores de bajo rango.

No hay informacion sobre el dataset, el numero de tokens de entrenamiento, la composicion de los datos, la presencia de RLHF/DPO ni los hiperparametros (rango del LoRA, alpha, learning rate, epocas). La model card contiene unicamente los marcadores `[More Information Needed]` en todas las secciones relevantes. Tampoco se documenta ninguna innovacion tecnica adicional mas alla del uso de Unsloth para el entrenamiento eficiente.

## Capacidades

- Generacion de texto conversacional: hereda la capacidad instruct del Qwen2.5-7B-Instruct, aunque el adaptador no documenta que la mejore o especialice.
- Razonamiento y matematicas: el modelo base incluye capacidades de razonamiento y resolucion de problemas aritmeticos; no hay evidencia de que el adaptador las potencie.
- Generacion de codigo: el base soporta generacion y explicacion de codigo en varios lenguajes; el adaptador no documenta cambios en esta area.
- Tool calling / function calling: el base Qwen2.5-7B-Instruct soporta llamadas a funciones; se desconoce si el adaptador preserva o altera este comportamiento.
- Soporte de agentes y razonamiento multi-paso: no documentado para el adaptador.
- Capacidades multilingues: no documentadas; el base soporta varios idiomas, pero el adaptador no declara ninguno.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Prototipado de asistentes conversacionales especializados: el adaptador puede cargarse sobre el base con PEFT para experimentar con respuestas afinadas a un dominio concreto, aunque sin datos de evaluacion no se puede garantizar la calidad.
- Investigacion en fine-tuning eficiente: sirve como referencia de un pipeline LoRA + Unsloth + TRL para replicar el flujo en otros dominios con recursos limitados.
- Generacion de codigo en entornos de desarrollo: si el adaptador conserva las capacidades del base, puede integrarse en editores o asistentes de autocompletado, pero requiere validacion previa.
- Atencion al cliente automatizada: el contexto largo del base (hasta 131.072 tokens, no confirmado en el adaptador) permitiria conversaciones multi-turno con historial extenso, siempre que el adaptador no degrade esa capacidad.
- Extraccion y resumen de documentos: el base maneja contextos largos, lo que facilita tareas de resumen y extraccion de informacion en textos extensos.
- Educacion y tutoria: un adaptador afinado con SFT podria ofrecer respuestas guiadas en un dominio educativo, pero la falta de documentacion sobre el dataset impide confirmar su idoneidad.
- Experimentacion con tool calling: si se preserva el soporte del base, podria usarse en pipelines de agentes que invocan APIs, aunque sin garantias documentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador requiere cargar el modelo base Qwen2.5-7B-Instruct. En fp16, el base ocupa aproximadamente 15-16 GB de VRAM; en cuantizacion 4-bit (como el checkpoint bnb-4bit referenciado), alrededor de 4-5 GB, mas el overhead del adaptador (~0,2 GB) y el contexto.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para fp16 con contexto largo; RTX 4090 (24 GB) para fp16 con contexto moderado o 4-bit con contexto largo.
- Cabe en consumer GPU: si, en RTX 3090/4090 (24 GB) en fp16 con contexto moderado, y en GPUs de 8-12 GB si se usa cuantizacion 4-bit del base.
- Opciones de despliegue: transformers + PEFT (carga del adaptador sobre el base), vLLM (soporte de adaptadores LoRA), llama.cpp/Ollama (requiere fusionar el adaptador con el base y convertir a GGUF), TGI (soporte de adaptadores).
- Latencia y throughput estimados: no disponibles; dependen del hardware y de la cuantizacion. Como referencia, un 7B en fp16 en una RTX 4090 suele alcanzar decenas de tokens por segundo, pero no hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Shani (este adaptador) | Adaptador LoRA sobre 7,6B | no disponible (base: 131.072) | no disponible | safetensors (PEFT) | Hugging Face, 0 descargas |
| Qwen2.5-7B-Instruct | 7,6B | 131.072 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face, ampliamente usado |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face, muy extendido |
| Llama-3.1-8B-Instruct | 8B | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF | Hugging Face, muy extendido |

La comparativa es orientativa: el adaptador no documenta rendimiento propio, por lo que no se puede afirmar que supere o iguale a las alternativas. El modelo base Qwen2.5-7B-Instruct es la referencia natural, y los otros dos son alternativas de tamano y categoria similares.

## Limitaciones y advertencias

- Model card vacia: no se documentan dataset, hiperparametros, evaluacion ni limitaciones, lo que impide validar el comportamiento del adaptador.
- Licencia no declarada: aunque el base Qwen2.5 es Apache 2.0, el adaptador no especifica licencia; su uso comercial queda en un limbo legal hasta que el autor lo aclare.
- Riesgo de alucinacion: inherente a los modelos de 7B; sin evaluacion especifica no se puede descartar que el fine-tuning lo haya incrementado.
- Sesgos desconocidos: al no documentarse el dataset de SFT, no se pueden identificar sesgos introducidos por el ajuste.
- Idiomas no documentados: se desconoce si el adaptador mantiene el multilingüismo del base o si se ha especializado en un idioma concreto.
- Contexto no confirmado: la longitud de contexto del adaptador no esta verificada; podria haberse reducido durante el entrenamiento.
- Sin descargas ni validacion comunitaria: 0 descargas y 0 likes indican ausencia de uso real y de retroalimentacion.
- Dependencia del base cuantizado: el checkpoint base referenciado esta en bnb-4bit, lo que puede afectar a la reproducibilidad si se carga en otra precision.
- No apto para producción sin evaluacion propia: la ausencia de benchmarks y de documentacion desaconseja su despliegue directo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/paul-woland/Shani
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-unsloth-bnb-4bit
- Modelo original Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio PEFT: https://github.com/huggingface/peft
- Repositorio TRL: https://github.com/huggingface/trl
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Paper de PEFT (referenciado en los tags): https://arxiv.org/abs/1910.09700
