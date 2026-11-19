# hwihwalab/Qwen2.5-3B-BrutalCritique-KoEn

## Resumen

Qwen2.5-3B-BrutalCritique-KoEn es un modelo de lenguaje derivado de Qwen/Qwen2.5-3B-Instruct, desarrollado por Hwihwa Lab (hwihwalab), cuyo objetivo es eliminar el sesgo de adulación (sycophancy) típico de los modelos instruidos y entregar críticas directas, sin cortesías vacías, sobre ideas de negocio, copy, métricas de embudo y código. El modelo está pensado para fundadores individuales (solopreneurs), creadores y desarrolladores que necesitan diagnóstico honesto en lugar de validación complaciente.

Técnicamente se trata de una intervención de representación (representation engineering) sobre el modelo base: se localizan las direcciones internas asociadas a la adulación y se ablacionan quirúrgicamente en capas intermedias de atención y MLP (proyecciones `o_proj` y `down_proj`), sin tocar los embeddings de tokens ni la cabeza de salida. El resultado preserva el conocimiento general y el razonamiento matemático del base, pero redirige el estilo hacia una crítica afilada y concreta. Es bilingüe inglés-coreano, con plantilla ChatML incrustada en los metadatos del GGUF para forzar el tono sin system prompt manual.

Con 3.085.938.688 parámetros y un footprint de ~1,9 GB en cuantización Q4_K_M, está diseñado para inferencia local en Ollama, LM Studio y llama.cpp, lo que lo hace relevante para flujos de trabajo privados en hardware de consumo. La licencia Apache-2.0 facilita su uso comercial y su integración en herramientas de desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), derivado de Qwen2.5-3B-Instruct con ablación de representación en capas intermedias |
| Parametros totales | 3.085.938.688 (3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | GGUF Q4_K_M (única cuantización publicada en la model card); el repo incluye también safetensors |
| Idiomas soportados | Inglés (en) y coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M, ~1,9 GB) y safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder-only de 3B parámetros. Sobre esa base se aplica una técnica de "abliteración" mediante cirugía de representación: se identifican las direcciones latentes responsables de la adulación y se eliminan en capas intermedias seleccionadas mediante evaluación de pérdida por capa, actuando sobre las proyecciones `o_proj` (atención) y `down_proj` (MLP). Los embeddings de tokens y la cabeza de salida quedan intactos, lo que según el autor preserva el razonamiento matemático, la comprensión de sintaxis y el formato bilingüe.

El ajuste se calibra con pares de contraste bilingües (inglés/coreano) que cubren validación de ideas, pricing, métricas de embudo, pitches en frío y revisión de código. La plantilla ChatML está incrustada en los metadatos del GGUF, de modo que el tono (incluido el registro informal `banmal` en coreano) se aplica en zero-shot sin necesidad de system prompt. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF/DPO adicional sobre el base.

## Capacidades

- Generación de texto conversacional con tono crítico, directo y sin adulación.
- Crítica de negocio: validación de ideas, pricing, propuestas de valor y métricas de embudo.
- Revisión de código con señalización de anti-patrones y malas prácticas.
- Razonamiento y matemáticas preservados del modelo base (según el autor, por no tocar embeddings ni cabeza de salida).
- Capacidades bilingües inglés-coreano, con control del registro informal coreano (`banmal`) integrado en la plantilla.
- Modo "mentor brutal" para roleplay y feedback sin filtros corteses.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Validación de ideas de negocio para solopreneurs: el modelo analiza una propuesta y señala fallos de mercado, competencia y modelo de ingresos sin rodeos, forzando al usuario a aportar métricas concretas en lugar de planes vagos.
- Revisión de pricing y embudos de conversión: se le presentan tarifas, tasas de conversión y costes de adquisición para que detecte incoherencias y cuellos de botella con diagnóstico directo.
- Crítica de copy y mensajes de venta: evalúa textos de landing pages y pitches en frío, identificando promesas vacías y falta de pruebas concretas.
- Revisión de código en local: integrado en Ollama o LM Studio, revisa diffs y señala anti-patrones y deuda técnica en un entorno privado sin enviar código a la nube.
- Asistente de decisión para desarrolladores independientes: actúa como contrapeso crítico ante decisiones de arquitectura o de producto, evitando la complacencia de asistentes genéricos.
- Roleplay de mentor exigente: útil para entrenar pitches o preparar presentaciones a inversores sometiéndose a preguntas duras y objeciones sin cortesías.
- Inferencia en el borde (edge): con ~1,9 GB en Q4_K_M, puede ejecutarse en portátiles y equipos modestos para sesiones privadas de crítica y planificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~2-3 GB para el GGUF Q4_K_M (~1,9 GB de pesos más overhead de contexto y KV cache); los safetensors en precisión completa requieren aproximadamente 6-7 GB (3B parámetros a 16 bits más overhead).
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (RTX 3050, RTX 4060, RTX 4090); en GPUs de datacenter (A100, H100) funciona pero está sobredimensionada para su tamaño.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas modernas con 4 GB o más; también puede ejecutarse en CPU mediante llama.cpp.
- Opciones de despliegue: Ollama, LM Studio, llama.cpp (formato GGUF nativo); los tags indican compatibilidad con vLLM y text-generation-inference para los pesos safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.
- Parámetros de muestreo recomendados por el autor: temperature 0.20, top-p 0.88, repetition penalty 1.05, stop tokens `["<|im_end|>", "<|im_start|>"]`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Qwen2.5-3B-BrutalCritique-KoEn | 3B | No disponible | Apache-2.0 | GGUF, safetensors | Crítica anti-adulación bilingüe EN/KO |
| Qwen2.5-3B-Instruct (base) | 3B | No disponible | Apache-2.0 | safetensors, GGUF | Instrucciones generales, tono complaciente |
| Modelos "abliterated" de la comunidad (p. ej. variantes de Llama 3 / Qwen) | 7B-8B típicamente | Variable | Variable según base | GGUF, safetensors | Eliminación de rechazos, sin foco específico en crítica de negocio |

La comparación cuantitativa de rendimiento con alternativas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El tono deliberadamente brusco puede resultar inadecuado para atención al cliente o contextos donde se requiera cortesía; no es un modelo de propósito general.
- La ablación de capas puede degradar sutilmente capacidades no evaluadas; el autor afirma preservar razonamiento y matemáticas, pero no se aportan benchmarks que lo verifiquen.
- Riesgo de alucinación inherente a un modelo de 3B, especialmente en datos de mercado, cifras y referencias concretas.
- Cobertura lingüística limitada a inglés y coreano; el rendimiento en castellano no está garantizado ni documentado.
- La longitud de contexto no está especificada en la información disponible; conviene verificarla antes de usarlo con documentos largos.
- La licencia Apache-2.0 permite uso comercial, pero el modelo deriva de Qwen2.5-3B-Instruct y conviene revisar las condiciones del modelo base.
- Los parámetros de muestreo son críticos según el autor: desviarse de ellos puede provocar deriva aduladora, artefactos por "token starvation" o fugas de idioma.
- Solo se publica una cuantización GGUF (Q4_K_M); otras cuantizaciones no están documentadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hwihwalab/Qwen2.5-3B-BrutalCritique-KoEn
- Documentación en coreano: https://huggingface.co/hwihwalab/Qwen2.5-3B-BrutalCritique-KoEn/blob/main/README_KR.md
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- GitHub de Hwihwa Lab: https://github.com/Hwihwa-Lab
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Ollama: https://ollama.com
