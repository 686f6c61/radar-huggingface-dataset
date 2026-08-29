# shashwatmudgal/Indra3-4B

## Resumen

Indra3-4B es un modelo de lenguaje causal de 3.735 millones de parámetros publicado en HuggingFace por el usuario shashwatmudgal. Los metadatos indican que está etiquetado como `qwen3`, `reasoning` y `custom_code`, lo que sugiere que se trata de un fine-tuning o merge basado en la arquitectura Qwen3-4B, aunque no existe documentación oficial que confirme esta relación. El modelo está diseñado para generación de texto y razonamiento, con licencia Apache 2.0 y soporte exclusivo para inglés.

La relevancia de este modelo radica en su tamaño compacto (3,74B parámetros) y su potencial para tareas de razonamiento en entornos con recursos limitados. Sin embargo, al ser un proyecto reciente (creado en abril de 2026) con cero descargas y acceso restringido (gated), su adopción es todavía muy limitada. La falta de documentación técnica y de benchmarks públicos dificulta una evaluación objetiva de sus capacidades reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como `qwen3`, probablemente transformer causal) |
| Parametros totales | 3.735.601.794 (3,74B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna, el proceso de entrenamiento, el dataset utilizado ni las tecnicas de optimizacion (RLHF, DPO, etc.). Los tags de HuggingFace incluyen `causal-lm`, `language-model`, `reasoning` y `qwen3`, lo que sugiere que el modelo sigue una arquitectura transformer causal similar a la familia Qwen3, pero no hay confirmacion oficial. El repositorio contiene codigo personalizado (`custom_code`), lo que indica que puede haber modificaciones sobre la implementacion estandar de transformers.

## Capacidades

- Generacion de texto en ingles.
- Razonamiento (etiqueta `reasoning`), aunque no se especifica si incluye modo "thinking" o cadenas de razonamiento explicito.
- Posible soporte de tool calling o function calling, pero no confirmado.
- No se indica soporte para vision, audio u otras modalidades.
- Capacidades multilingues limitadas al ingles segun los metadatos.

## Casos de uso

Dado que no hay informacion sobre rendimiento ni capacidades especificas, los casos de uso son hipoteticos y deben validarse con pruebas propias:

- Prototipado rapido de aplicaciones de chat o asistentes conversacionales en ingles, aprovechando su tamano reducido para entornos de desarrollo locales.
- Experimentacion academica con modelos de razonamiento de tamano medio, comparando su comportamiento con otros modelos de la familia Qwen3.
- Generacion de texto para tareas de clasificacion o extraccion de informacion en dominios especificos, tras un fine-tuning adicional.
- Despliegue en entornos con restricciones de VRAM (por ejemplo, GPUs de 8 GB) si se cuantiza adecuadamente.
- Investigacion sobre tecnicas de merge o interpolacion de modelos, dado que el autor tambien publico un modelo Qwen3-4B-slerp.
- Evaluacion de modelos de codigo abierto con licencia permisiva (Apache 2.0) para integracion en productos comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 7,5 GB para los pesos, mas overhead de activaciones y cache, por lo que se recomienda al menos 10 GB de VRAM.
- Con cuantizacion a 8 bits (si se genera), la VRAM podria reducirse a unos 4-5 GB; a 4 bits, a unos 2-3 GB.
- GPUs recomendadas: RTX 3090, RTX 4090, A10, A100 (para FP16); GPUs consumer de 8 GB (RTX 3060, 4060) podrian funcionar con cuantizacion.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, siempre que se adapte el formato de pesos (actualmente solo safetensors).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de Indra3-4B para comparar con alternativas. Como referencia cualitativa, se puede comparar con otros modelos de ~4B:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Indra3-4B | 3,74B | no disponible | Apache 2.0 | Gated, sin documentacion |
| Qwen3-4B | 4B | 32K (tipico) | Apache 2.0 | Publico, ampliamente documentado |
| Gemma 4 (4B) | 4B | no disponible | Gemma license | Publico, documentado |

La comparacion es especulativa porque no hay datos de Indra3. Se recomienda evaluar directamente el modelo si se obtiene acceso.

## Limitaciones y advertencias

- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que puede limitar su uso en entornos corporativos.
- Sin documentacion tecnica: no hay paper, README detallado ni guia de uso.
- Sin benchmarks publicos: no se puede verificar su calidad ni comparar con otros modelos.
- Riesgo de alucinacion y sesgos: al ser un modelo pequeno y sin informacion sobre su entrenamiento, es probable que presente alucinaciones frecuentes y sesgos no mitigados.
- Soporte limitado a ingles: no apto para aplicaciones multilingues.
- Formato de pesos solo safetensors: requiere conversion para usar en llama.cpp u otros runtime.
- Proyecto sin comunidad: cero descargas y cero likes, lo que sugiere falta de validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shashwatmudgal/Indra3-4B
- Perfil del autor: https://huggingface.co/shashwatmudgal
- Otro modelo del autor (Qwen3-4B-slerp): https://huggingface.co/shashwatmudgal/Qwen3-4B-slerp
