# captainBoolean/pearl-qwen-7b-v4-gguf

## Resumen

pearl-qwen-7b-v4-gguf es un modelo de lenguaje conversacional de aproximadamente 7.600 millones de parametros, publicado por el usuario captainBoolean en Hugging Face. Se trata de un fine-tuning del modelo base Qwen2.5-7B-Instruct (identificable por la arquitectura `qwen2` y por el nombre del fichero de pesos), convertido a formato GGUF mediante Unsloth para su uso con llama.cpp y Ollama. El repositorio contiene unicamente la cuantizacion Q4_K_M, lo que lo orienta a inferencia local en hardware de consumo.

La relevancia de este modelo es limitada y debe contextualizarse: se trata de una publicacion de un autor individual, sin model card detallada, sin datos de entrenamiento declarados y sin resultados de benchmarks. La informacion disponible no permite validar la calidad del fine-tuning ni el proposito concreto del ajuste (no se especifica el dataset, el dominio ni el objetivo). El modelo hereda las capacidades del Qwen2.5-7B-Instruct original, pero cualquier mejora o especializacion introducida por el fine-tuning no esta documentada.

Por tanto, esta ficha se construye combinando los datos verificables del repositorio (parametros, formato, tamano, arquitectura base) con las caracteristicas conocidas del modelo Qwen2.5-7B-Instruct sobre el que se apoya, indicando explicitamente cuando un dato no esta disponible. No se han publicado resultados de evaluacion propios de este fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, segun tag `qwen2`) |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion del repositorio (el base Qwen2.5-7B-Instruct soporta hasta 32.768 tokens, dato no confirmado para este fine-tuning) |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado) |
| Idiomas soportados | no disponible (el base Qwen2.5 declara multilingue, pero el autor no lo especifica) |
| Licencia | no disponible |
| Formato de pesos | GGUF (`Qwen2.5-7B-Instruct.Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso con atencion causal, normalizacion RMSNorm, activacion SwiGLU y sesgos de atencion tipo QKV (caracteristicos de la familia Qwen2). El modelo cuenta con 7.615.616.512 parametros, coherente con el tamano de 7B de la familia Qwen2.5. El contexto nativo del base es de 32.768 tokens ampliable, aunque el repositorio no confirma si el fine-tuning preserva esa ventana.

Sobre el proceso de entrenamiento no hay informacion: la model card solo indica que el modelo fue ajustado y convertido a GGUF usando Unsloth, herramienta que acelera el fine-tuning (QLoRA/LoRA) y la exportacion a GGUF. No se declara el dataset, el numero de tokens de entrenamiento, la composicion de datos, ni si se aplicaron tecnicas de RLHF, DPO o SFT adicionales. Tampoco se indica la tecnica de cuantizacion mas alla del identificador Q4_K_M (cuantizacion de 4 bits con mezcla de precision en capas selectivas, estandar en llama.cpp). No consta ninguna innovacion tecnica propia del autor.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del base Qwen2.5-7B-Instruct.
- Razonamiento y resolucion de problemas de complejidad media, limitado por el tamano de 7B.
- Generacion de codigo y matematicas basicas e intermedias (capacidades del base, no verificadas en este fine-tuning).
- Soporte de plantillas de chat mediante `--jinja` en llama.cpp, segun la model card.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que sugiere despliegue via API compatible con OpenAI en infraestructura de Hugging Face.
- Capacidades multilingues: no confirmadas para este fine-tuning; el base Qwen2.5 es multilingue, pero el autor no lo declara.
- Tool calling / function calling: no documentado en el repositorio; el base Qwen2.5-Instruct lo soporta, pero no se confirma su preservacion.
- Modo thinking, vision o audio: no disponible (el tag `llama-mtmd-cli` de la model card es generico de la plantilla de Unsloth y no implica capacidades multimodales en este modelo).

## Casos de uso

- Prototipado local de asistentes conversacionales: al estar en GGUF Q4_K_M (aproximadamente 4,7 GB), puede ejecutarse en un portatil con GPU de consumo o incluso en CPU, lo que lo hace util para pruebas de concepto sin infraestructura cloud.
- Despliegue en Ollama: el repositorio incluye un Modelfile, de modo que puede levantarse con `ollama run` para entornos de desarrollo y demos internas.
- Generacion de texto asistida en aplicaciones de escritorio: integrable mediante llama.cpp o bindings (Python, Rust, etc.) para tareas de redaccion, resumen o reescritura con contexto moderado.
- Chatbot de soporte en entornos con requisitos de privacidad: al ejecutarse en local, permite procesar conversaciones sin enviar datos a terceros, siempre que se valide la calidad del fine-tuning.
- Evaluacion comparativa de fine-tunings: util como caso de estudio para medir el impacto de un ajuste no documentado frente al Qwen2.5-7B-Instruct original.
- Base para nuevos fine-tunings: el formato GGUF y la trazabilidad al base Qwen2.5 permiten usarlo como punto de partida, aunque se recomienda partir del modelo original en safetensors para reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas (MMLU, HumanEval, GSM8K ni otras) ni comparaciones con el modelo base. Cualquier cifra de rendimiento atribuible a este modelo seria una extrapolacion no verificada del Qwen2.5-7B-Instruct original.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M ocupa aproximadamente 4,7 GB; con overhead de contexto y KV cache, se recomienda un minimo de 6-8 GB de VRAM para contextos moderados.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para uso comodo; A100/H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con 8 GB o mas; tambien puede ejecutarse en CPU con llama.cpp a velocidades reducidas.
- Opciones de despliegue: llama.cpp (`llama-cli -hf ... --jinja`), Ollama (Modelfile incluido), y endpoints compatibles con OpenAI segun el tag del repositorio. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan conversion a safetensors.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pearl-qwen-7b-v4-gguf | 7,6 B | no disponible | GGUF Q4_K_M | no disponible | Hugging Face (0 descargas) |
| Qwen2.5-7B-Instruct | 7,6 B | 32.768 tokens (ampliable) | safetensors, GGUF | Apache 2.0 (modelo base) | Hugging Face, ampliamente adoptado |
| Llama 3.1 8B Instruct | 8 B | 128.000 tokens | safetensors, GGUF | Llama 3.1 Community License | Hugging Face, Ollama, amplio ecosistema |
| Mistral 7B Instruct v0.3 | 7,2 B | 32.768 tokens | safetensors, GGUF | Apache 2.0 | Hugging Face, Ollama |

La comparativa debe interpretarse con cautela: pearl-qwen-7b-v4-gguf no documenta licencia ni contexto, y su calidad como fine-tuning no esta evaluada. Frente al Qwen2.5-7B-Instruct original, la unica ventaja verificable es la disponibilidad inmediata en GGUF Q4_K_M; en cualquier otro aspecto (documentacion, licencia, benchmarks, soporte de la comunidad) el modelo base es la opcion preferible.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: no se declara dataset, objetivo del fine-tuning, licencia ni idiomas, lo que impide evaluar su idoneidad para produccion.
- Licencia no disponible: no puede confirmarse el uso comercial; se desconoce si el fine-tuning respeta la licencia Apache 2.0 del base Qwen2.5.
- Riesgo de alucinacion: inherente a los modelos de 7B; sin benchmarks no puede acotarse su magnitud en este fine-tuning.
- Sesgos: no documentados; el base Qwen2.5 presenta sesgos conocidos de los corpus web, pero el ajuste adicional puede introducir o amplificar sesgos no declarados.
- Contexto no confirmado: no se especifica si el fine-tuning preserva los 32.768 tokens del base; asumir esa ventana sin verificacion es arriesgado.
- Idiomas no declarados: no puede garantizarse el soporte multilingue del base tras el ajuste.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusion; no hay validacion de la comunidad.
- Una sola cuantizacion: solo Q4_K_M; no hay opciones Q5, Q8 ni FP16, lo que limita el ajuste fino de calidad frente a velocidad.
- Fecha de creacion futura (2026-11-12): el metadato del repositorio resulta anomalo y debe tratarse con escepticismo.
- Para produccion se recomienda usar Qwen2.5-7B-Instruct directamente o exigir al autor documentacion completa antes de adoptar este fine-tuning.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/captainBoolean/pearl-qwen-7b-v4-gguf
- Unsloth (herramienta de fine-tuning y conversion): https://github.com/unslothai/unsloth
- llama.cpp (runtime de inferencia GGUF): https://github.com/ggml-org/llama.cpp
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Ollama (despliegue con Modelfile): https://ollama.com
