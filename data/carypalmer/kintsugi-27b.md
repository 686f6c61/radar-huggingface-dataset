# CaryPalmer/Kintsugi-27B

## Resumen

Kintsugi-27B es un ajuste fino (finetune) del modelo Qwen/Qwen3.8-27B, publicado por el usuario CaryPalmer en Hugging Face bajo licencia Apache 2.0. El modelo se distribuye exclusivamente en formato GGUF con cuantizacion de 2 bits y esta etiquetado como "long-context", lo que sugiere un enfoque en el manejo de ventanas de contexto extensas. El repositorio tiene acceso restringido (gated), por lo que es necesario aceptar condiciones en Hugging Face antes de descargarlo.

La relevancia de esta publicacion es limitada: se trata de un modelo derivado de un base poco documentado (Qwen3.8-27B no aparece en el ecosistema publico habitual de Qwen) y del que no se han publicado resultados de benchmarks, detalles de entrenamiento ni documentacion tecnica en la informacion disponible. Su interes principal, a priori, es la combinacion de un tamano de 27B con cuantizacion agresiva de 2 bits en GGUF, lo que podria permitir su despliegue en hardware con recursos de VRAM muy limitados, a costa de una perdida de calidad que no ha sido cuantificada publicamente.

No se dispone de informacion sobre arquitectura concreta, composicion del dataset de ajuste, tecnicas de alineamiento (RLHF/DPO) ni idiomas soportados. Cualquier evaluacion rigurosa del modelo requerira descargarlo y realizar pruebas propias, dado que la ficha del repositorio no aporta datos verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen/Qwen3.8-27B; arquitectura del base no documentada en la informacion disponible) |
| Parametros totales | 27B (segun el nombre del modelo y el base declarado) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (etiquetado como "long-context", sin cifra publicada) |
| Tipos de cuantizacion | 2-bit (unica cuantizacion publicada, formato GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Acceso | Restringido (gated), requiere aceptar condiciones |
| Modelo base | Qwen/Qwen3.8-27B |
| Fecha de publicacion | 2026-11-20 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo en la documentacion disponible. Al ser un finetune de Qwen/Qwen3.8-27B, hereda la arquitectura del modelo base, pero no se detalla si se trata de un transformer denso, un MoE o una arquitectura hibrida. Tampoco se especifica el numero de tokens de entrenamiento, la composicion del dataset de ajuste fino ni si se aplicaron tecnicas de alineamiento como RLHF, DPO o SFT.

La unica innovacion tecnica explicitamente declarada es la cuantizacion a 2 bits en formato GGUF, orientada a reducir drasticamente los requisitos de memoria, y la etiqueta "long-context", que sugiere un entrenamiento o ajuste para manejar secuencias largas. No obstante, no se aportan cifras de longitud de contexto efectiva, ni detalles sobre la tecnica de cuantizacion empleada (por ejemplo, Q2_K, IQ2_XXS u otras variantes de llama.cpp), ni sobre posibles metodos de decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto: capacidad esperada por herencia del modelo base, sin documentacion especifica del finetune.
- Razonamiento y matematicas: no documentado.
- Generacion de codigo: no documentado.
- Vision: no disponible (no se indica soporte multimodal).
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles (idiomas no declarados).
- Modo "thinking" o razonamiento explicito: no documentado.
- Manejo de contexto largo: declarado mediante la etiqueta "long-context", sin cifra concreta.
- Audio: no disponible.

## Casos de uso

- Despliegue en hardware con VRAM muy limitada: la cuantizacion a 2 bits permite, en teoria, cargar un modelo de 27B en GPUs de consumo con 8-12 GB de VRAM mediante llama.cpp u Ollama, a costa de una perdida de calidad no cuantificada. Adecuado para prototipado y pruebas locales, no para produccion critica.
- Experimentacion con cuantizacion extrema: util para investigadores que estudien el impacto de la cuantizacion a 2 bits en modelos de 27B, comparando salidas frente al modelo base en precision completa.
- Procesamiento de documentos largos en entornos con recursos escasos: si la ventana de contexto larga se confirma, podria emplearse para resumir o extraer informacion de documentos extensos en equipos sin GPUs de gama alta.
- Pruebas de concepto de asistentes conversacionales offline: al ejecutarse localmente con llama.cpp, permite construir demos de chat sin dependencia de APIs externas ni conexion a internet.
- Evaluacion comparativa de finetunes comunitarios: sirve como caso de estudio para analizar la calidad de ajustes finos publicados sin documentacion, frente a modelos oficiales de Qwen.
- Investigacion sobre degradacion por cuantizacion en tareas de razonamiento: permite medir empiricamente cuanto se pierde en tareas como GSM8K o MMLU al pasar de precision completa a 2 bits en un modelo de 27B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 2 bits: aproximadamente 7-9 GB para los pesos (27B a ~2 bits ronda los 6,75 GB teoricos, mas overhead de metadatos y cache KV), dependiendo de la variante exacta de cuantizacion.
- Cache KV: no disponible; dependera de la longitud de contexto efectiva, que no se ha publicado. Con contextos largos, la cache KV puede superar ampliamente el tamano de los pesos.
- GPU recomendadas: no disponible. Por tamano, cabria en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y GPUs de datacenter (A100, H100) sin problema de memoria para los pesos.
- Cabe en GPU de consumo: si, previsiblemente en modelos con 12 GB o mas de VRAM en la cuantizacion de 2 bits, aunque la calidad a 2 bits es dudosa.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este caso sin conversion.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kintsugi-27B | 27B | no disponible | 2-bit GGUF | Apache 2.0 | Gated en Hugging Face |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | no disponible | no disponible | Referenciado como base |
| Modelos Qwen oficiales de ~27B-32B | ~27B-32B | variable segun version | multiples (GGUF, safetensors, AWQ) | Apache 2.0 en varias versiones | Publicos y documentados |

No se dispone de datos de rendimiento del modelo ni del base para establecer una comparativa cuantitativa. La comparacion con alternativas oficiales de Qwen se limita a aspectos de disponibilidad, documentacion y soporte de cuantizaciones.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no hay model card detallada, ni datos de entrenamiento, ni benchmarks, lo que impide evaluar su calidad de forma objetiva.
- Cuantizacion a 2 bits: la perdida de calidad frente a precision completa es significativa en la mayoria de modelos; a 2 bits se esperan degradaciones notables en razonamiento, matematicas y coherencia, aunque no se ha cuantificado en este caso.
- Riesgo de alucinacion: no evaluado; previsiblemente elevado por la cuantizacion agresiva y la falta de validacion publica.
- Sesgos conocidos: no documentados; al desconocerse el dataset de ajuste, no se puede descartar la introduccion de sesgos adicionales respecto al base.
- Idiomas: no declarados; no se garantiza soporte multilingue ni la calidad en castellano.
- Licencia Apache 2.0: permite uso comercial, pero al ser un derivado de Qwen conviene verificar las condiciones del modelo base, cuya licencia no se detalla en la informacion disponible.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion a la integracion en pipelines automatizados.
- Contexto largo no verificado: la etiqueta "long-context" no viene acompanada de cifras ni de pruebas publicadas.
- Modelo base poco trazable: Qwen/Qwen3.8-27B no figura entre los modelos ampliamente documentados del ecosistema Qwen, lo que genera dudas sobre su origen y reproducibilidad.
- Para produccion: no recomendado sin una evaluacion interna exhaustiva previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/CaryPalmer/Kintsugi-27B
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.8-27B (referencia; disponibilidad no verificada)
- No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales en la informacion disponible.
