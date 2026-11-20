# furiosa-ai/Qwen3-30B-A3B-Instruct-2507-FP8

## Resumen

Qwen3-30B-A3B-Instruct-2507-FP8 es la variante cuantizada en FP8 del modelo instructivo Qwen3-30B-A3B-Instruct-2507, un transformer autorregresivo de arquitectura Mixture-of-Experts (MoE) desarrollado por Alibaba Qwen. Cuenta con 30.532 millones de parámetros totales, de los cuales aproximadamente 3.300 millones se activan por token, lo que permite un equilibrio entre capacidad y coste computacional en inferencia. Esta versión concreta ha sido publicada por FuriosaAI e incluye un Furiosa Executable Bundle (FXB) para ejecutarse sobre aceleradores RNGD con la librería Furiosa-LLM.

El modelo opera exclusivamente en modo no-thinking (sin cadena de razonamiento explícita) y está orientado a generación de texto, seguimiento de instrucciones, razonamiento sobre texto, cobertura multilingüe y uso de herramientas (tool calling). La cuantización FP8 estática en pesos y dinámica en activaciones reduce el peso del repositorio a 63,9 GB, manteniendo la caché KV en 16 bits.

Su relevancia actual radica en que ofrece una ruta de despliegue en hardware no-GPU (aceleradores RNGD de FuriosaAI) manteniendo compatibilidad con el ecosistema Qwen3 y licencia Apache 2.0, lo que facilita su adopción tanto en producción como en investigación sobre infraestructuras alternativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-MoE (Mixture-of-Experts, transformer autorregresivo) |
| Parametros totales | 30.532.122.624 |
| Parametros activos | ~3.300 millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 estatico en pesos; FP8 dinamico en activaciones (per-token / per-block); KV cache en 16 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 63,9 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer autorregresivo con arquitectura Mixture-of-Experts (Qwen3-MoE), con 30,5 mil millones de parámetros totales y aproximadamente 3,3 mil millones activados por token. Esta configuración permite que el coste de cómputo por token sea mucho menor que el de un modelo denso del mismo tamaño, manteniendo una capacidad de representación elevada. La variante 2507 corresponde a una actualización del modelo instructivo original Qwen3-30B-A3B y funciona únicamente en modo no-thinking.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La cuantización FP8 es estática en los pesos y dinámica en las activaciones (per-token / per-block), con la caché KV mantenida en 16 bits, lo que preserva precisión en la atención mientras reduce el uso de memoria. En hardware RNGD, el despliegue utiliza tensor-parallel de tamaño 32 PEs, distribuido en cuatro tarjetas RNGD (8 PEs por tarjeta).

## Capacidades

- Generación de texto y razonamiento sobre texto en modo no-thinking.
- Seguimiento de instrucciones (instruction following) de alta fidelidad, según la model card.
- Cobertura multilingüe (el conjunto exacto de idiomas no está detallado en la información disponible).
- Tool calling / function calling mediante el parser `hermes`, el usado por la serie Qwen3.
- Integración con API compatible con OpenAI a través de Furiosa-LLM Server.
- Capacidad de razonamiento multi-paso implícito en tareas de texto (sin modo thinking explícito).
- No se documentan capacidades de visión, audio ni modo thinking en esta variante.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con seguimiento de instrucciones fiable y tool calling para consultar sistemas internos (pedidos, cuentas) mediante el parser `hermes`.
- Asistentes con acceso a herramientas: integración en agentes que necesitan invocar funciones externas (APIs, bases de datos) y decidir cuándo llamarlas, aprovechando `--enable-auto-tool-choice`.
- Generación y resumen de documentación técnica: su capacidad de razonamiento sobre texto y cobertura multilingüe lo hace adecuado para resumir manuales, artículos o informes en varios idiomas.
- Despliegue en infraestructura no-GPU: organizaciones con aceleradores RNGD de FuriosaAI pueden servir el modelo con Furiosa-LLM sin depender de GPUs NVIDIA, usando el FXB incluido.
- Backend de chat compatible con OpenAI: al exponer una API compatible, puede sustituir a otros modelos en aplicaciones existentes que ya consumen el endpoint `/v1/chat/completions`.
- Clasificación y extracción de información estructurada: con tool calling y seguimiento de instrucciones, puede transformar texto libre en llamadas a funciones con parámetros validados.
- Prototipado e investigación sobre MoE eficiente: su ratio de parámetros activos (~3,3B de 30,5B) permite experimentar con arquitecturas MoE en entornos con presupuesto computacional limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 63,9 GB en FP8; se requiere memoria suficiente para pesos más caché KV en 16 bits, cuyo tamaño depende de la longitud de contexto (no disponible).
- GPU recomendadas: no disponible en la información proporcionada para GPUs; el modelo está empaquetado y validado para FuriosaAI RNGD.
- Cabe en consumer GPU: no confirmado; con 30,5B parámetros totales en FP8, no es viable en GPUs de consumo de 24 GB sin cuantización adicional.
- Opciones de despliegue: Furiosa-LLM (`furiosa-llm serve`) sobre RNGD; la model card indica que también puede ejecutarse en vLLM, SGLang y Transformers usando el modelo upstream.
- Paralelismo: tensor-parallel de 32 PEs en cuatro tarjetas RNGD (8 PEs por tarjeta).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Qwen3-30B-A3B-Instruct-2507-FP8 (FuriosaAI) | 30,5B | ~3,3B | no disponible | Apache 2.0 | FuriosaAI RNGD |
| Qwen/Qwen3-30B-A3B-Instruct-2507-FP8 (upstream) | 30,5B | ~3,3B | no disponible | Apache 2.0 | GPU (vLLM, SGLang, Transformers) |
| Qwen3-30B-A3B-Instruct-2507 (BF16) | 30,5B | ~3,3B | no disponible | Apache 2.0 | GPU |

La diferencia principal entre esta ficha y el modelo upstream radica en el empaquetado (FXB) y la librería de despliegue (Furiosa-LLM sobre RNGD), no en los pesos ni en la capacidad del modelo. No se dispone de datos de benchmarks para comparar rendimiento entre alternativas.

## Limitaciones y advertencias

- Modo no-thinking únicamente: no dispone de cadena de razonamiento explícita, lo que puede limitar tareas que requieran razonamiento profundo paso a paso.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.
- Longitud de contexto: no disponible en la información; debe consultarse la model card upstream antes de dimensionar despliegues.
- Idiomas soportados: no detallados; la cobertura multilingüe se menciona de forma genérica.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse el cumplimiento de la licencia upstream enlazada.
- Dependencia de hardware específico para la ruta Furiosa-LLM (RNGD); para GPUs debe usarse el modelo upstream y sus frameworks.
- El repositorio incluye un FXB específico de FuriosaAI; su uso fuera de RNGD requiere los pesos upstream.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/furiosa-ai/Qwen3-30B-A3B-Instruct-2507-FP8
- Modelo upstream: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507-FP8
- Licencia upstream: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507-FP8/blob/main/LICENSE
- FuriosaAI: https://furiosa.ai
- Documentación Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Instalación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/get_started/furiosa_llm.html#installing-furiosa-llm
- Guía de tool calling: https://developer.furiosa.ai/latest/en/furiosa_llm/toolcalling.html
- Referencia de Furiosa-LLM Server: https://developer.furiosa.ai/latest/en/furiosa_llm/furiosa-llm-serve.html
