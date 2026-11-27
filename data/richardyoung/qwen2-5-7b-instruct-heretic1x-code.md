# richardyoung/Qwen2.5-7B-Instruct-heretic1x-code

## Resumen

Qwen2.5-7B-Instruct-heretic1x-code es una variante "abliterated" (decensored) del modelo Qwen2.5-7B-Instruct de Alibaba, publicada por el usuario richardyoung bajo el marco tecnico de la familia Heretic 1.x. El modelo parte de los pesos del instruct oficial de Qwen de 7.615.616.512 parametros y aplica tecnicas de ablacion de direcciones de rechazo en el espacio de activaciones, con el objetivo de eliminar las negativas aprendidas por alineamiento. El sufijo "code" sugiere un ajuste orientado a generacion de codigo, aunque no se documenta en la informacion disponible.

La relevancia de este tipo de publicaciones es doble: por un lado, sirve como banco de pruebas para estudiar como el alineamiento de seguridad condiciona el comportamiento generativo de un transformer denso de 7B; por otro, permite a investigadores explorar los limites del modelo base en tareas que el modelo original rechaza por defecto. No obstante, se trata de un artefacto de investigacion, con acceso restringido en Hugging Face, y no de un modelo recomendado para despliegues de produccion sin evaluacion previa.

Al estar construido sobre Qwen2.5-7B-Instruct, hereda su arquitectura transformer densa, su ventana de contexto y su tokenizador, pero las modificaciones de alineamiento pueden alterar el comportamiento en tareas sensibles. La ficha se limita a los datos verificables en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2, decoder-only) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible (formato publicado en safetensors; cuantizaciones GGUF/AWQ no listadas) |
| Idiomas soportados | en |
| Licencia | apache-2.0 (etiqueta del repo); acceso restringido en Hugging Face |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia Qwen2, con 7.615.616.512 parametros, derivado por fine-tuning del checkpoint Qwen/Qwen2.5-7B-Instruct. La modificacion principal consiste en tecnicas de abliteration (ablacion de direcciones de rechazo) propias de la linea Heretic 1.x, que actuan sobre las activaciones del modelo para reducir la probabilidad de respuestas de negativa. El sufijo "code" indica un posible ajuste adicional orientado a codigo, aunque no se detalla en la informacion disponible ni la composicion del dataset de ajuste, ni el numero de tokens, ni si se empleo RLHF o DPO.

No se dispone de informacion sobre innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, mezcla de expertos, etc.). El modelo conserva el pipeline de text-generation y es compatible con text-generation-inference y endpoints, segun las etiquetas del repositorio.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del base Qwen2.5-7B-Instruct.
- Generacion de codigo (por el sufijo "code" y la base instruct), si bien no se documenta el alcance exacto del ajuste.
- Razonamiento y matematicas basicas propias de un modelo instruct de 7B.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible para esta variante concreta.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explicitamente.
- Multilingue: limitado a ingles segun la etiqueta de idiomas del repositorio.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como la ablacion de direcciones de rechazo afecta a la distribucion de respuestas en un transformer de 7B, comparando con el base Qwen2.5-7B-Instruct.
- Generacion de codigo en entornos controlados: puede emplearse en pipelines internos de generacion de fragmentos de codigo donde se requiera un modelo de 7B con pesos abiertos y sin restricciones de rechazo.
- Analisis de robustez de filtros: util para equipos de seguridad que evaluan clasificadores y guardrails frente a modelos decensored.
- Prototipado de asistentes conversacionales en ingles: adecuado para pruebas de concepto con contexto multi-turno, siempre que se valide el comportamiento etico.
- Red teaming de aplicaciones LLM: sirve como generador adversario para probar defensas en sistemas desplegados.
- Fine-tuning posterior para dominios especificos: al ser un checkpoint safetensors de 7B, puede reentrenarse con LoRA o QLoRA sobre datos propios en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15,2 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica se recomienda 24 GB o mas.
- VRAM estimada en cuantizacion 8 bits: en torno a 8-9 GB para pesos; en 4 bits, en torno a 4-5 GB.
- GPU recomendadas: A100 40/80 GB, H100 para despliegues concurrentes; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 para cuantizaciones de 8 o 4 bits.
- Cabe en GPU consumer: si, en RTX 4090 en FP16 con contexto limitado, y en GPUs de 12-16 GB con cuantizacion.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp/Ollama (previa conversion a GGUF, no publicada en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct-heretic1x-code | 7,6B | no disponible | apache-2.0 | gated | Variante abliterated con posible ajuste en codigo |
| Qwen/Qwen2.5-7B-Instruct | 7,6B | no disponible | apache-2.0 (según base) | abierto | Modelo base alineado, referencia directa |
| Otras variantes abliterated de Qwen2.5-7B | 7,6B | no disponible | variable | variable | No se dispone de datos comparativos verificables |

No se dispone de resultados de benchmarks que permitan comparar rendimiento numerico entre estas variantes.

## Limitaciones y advertencias

- Modelo decensored: la ablacion de rechazo puede incrementar respuestas a solicitudes que el modelo base rechazaria; no apto para uso sin moderacion.
- Riesgo elevado de alucinacion y de generar contenido inapropiado o inseguro en produccion.
- Idiomas: solo ingles segun la etiqueta del repositorio; no se garantiza buen rendimiento en castellano.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face; el uso comercial queda sujeto a la licencia apache-2.0 y a las condiciones del autor.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento ni de degradacion respecto al base.
- No se documenta el proceso exacto de entrenamiento ni la composicion de datos, lo que dificulta la reproducibilidad.
- Uso recomendado exclusivamente en investigacion y entornos controlados.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-heretic1x-code
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
