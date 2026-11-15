# krishna4murali/telugu-storyteller

## Resumen

telugu-storyteller es un ajuste fino (fine-tuning) del modelo Meta-Llama-3.1-8B-Instruct, publicado por el usuario krishna4murali en Hugging Face. El modelo está orientado, según su nombre, a la generación de relatos e historias en telugu, y se distribuye exclusivamente en formato GGUF cuantizado (Q4_K_M) para su uso con llama.cpp y Ollama. El repositorio tiene 4,9 GB y registra cero descargas y cero "likes" en el momento de la consulta.

El modelo parte de la arquitectura transformer decoder-only de Llama 3.1 con 8.030.261.312 parámetros totales (8B), heredando la ventana de contexto de 128.000 tokens del modelo base, aunque la model card no confirma explícitamente que ese contexto se conserve tras el ajuste. El entrenamiento y la conversión a GGUF se realizaron con la librería Unsloth, que el autor cita como herramienta de aceleración (afirma un entrenamiento "2x más rápido").

La relevancia de esta ficha es limitada: se trata de un modelo derivado de un base bien conocido, con documentación mínima, sin licencia declarada, sin idiomas declarados y sin benchmarks publicados. Resulta útil como ejemplo de pipeline de fine-tuning + cuantización con Unsloth para una lengua de bajos recursos como el telugu, pero no como modelo listo para producción sin una evaluación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3.1 8B Instruct) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Llama 3.1 8B soporta 128.000 tokens |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado: `Meta-Llama-3.1-8B-Instruct.Q4_K_M.gguf`) |
| Idiomas soportados | no disponible (por el nombre del modelo, orientado a telugu; no declarado formalmente) |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); el repo no incluye safetensors del ajuste, aunque el dato de parametros totales procede de safetensors del modelo base |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only denso con atención por cabezas agrupadas (GQA), normalización RMSNorm y activación SwiGLU, con 8.030 millones de parámetros. Sobre ese modelo base se aplicó un ajuste fino supervisado (el autor no especifica si hubo RLHF, DPO u otras etapas) y posteriormente una conversión a GGUF mediante Unsloth. No se detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas como LoRA o QLoRA; Unsloth es compatible con ambas, pero la model card no lo confirma.

La única innovación técnica mencionada es el uso de Unsloth para acelerar el entrenamiento y la conversión a GGUF, junto con un ajuste del comportamiento del token BOS para garantizar la compatibilidad con llama.cpp. No se documentan técnicas de decodificación especulativa, atención lineal ni arquitecturas híbridas. La información sobre el proceso de entrenamiento es, por tanto, insuficiente para reproducirlo o auditar sus datos.

## Capacidades

- Generación de texto conversacional en formato chat (etiqueta "conversational" en Hugging Face), heredada del modelo base Instruct.
- Generación de relatos e historias, presumiblemente en telugu según el nombre del modelo; no verificado en la model card.
- Razonamiento general y conocimiento del mundo procedente de Llama 3.1 8B Instruct.
- Capacidad multilingüe heredada del base (Llama 3.1 soporta oficialmente inglés, alemán, francés, italiano, portugués, hindi, español y tailandés), aunque el ajuste puede haber desplazado el comportamiento hacia el telugu.
- Soporte de plantillas de chat vía `--jinja` en llama.cpp.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito; la referencia a `llama-mtmd-cli` en la model card es genérica y no implica que este modelo sea multimodal.

## Casos de uso

- Generación de cuentos infantiles en telugu: el modelo puede producir relatos cortos y conversacionales para aplicaciones educativas o de ocio dirigidas a hablantes de telugu, aprovechando el ajuste específico sobre el base Instruct.
- Prototipado de asistentes conversacionales en telugu: al ejecutarse en llama.cpp u Ollama, permite montar un chatbot local de bajo coste para validar flujos de conversación multi-turno antes de invertir en modelos mayores.
- Investigación sobre fine-tuning de lenguas de bajos recursos: sirve como referencia reproducible del pipeline Unsloth → GGUF para comparar estrategias de ajuste en telugu frente a otros idiomas.
- Despliegue en hardware de consumo: con cuantización Q4_K_M y 8B de parámetros, cabe en GPUs de 8-12 GB de VRAM, lo que facilita demos locales sin infraestructura cloud.
- Generación de contenido editorial de ficción breve: redacción de microrrelatos o borradores en telugu que un humano revisa y pule, reduciendo el tiempo de primera redacción.
- Evaluación comparativa de cuantizaciones: al existir solo el archivo Q4_K_M, se puede usar como punto de partida para medir la pérdida de calidad frente a cuantizaciones mayores (Q5, Q8) si el usuario las genera a partir del modelo base ajustado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB con la cuantización Q4_K_M publicada (4,9 GB de pesos más overhead de contexto y KV cache). Con contexto largo (32K-128K tokens) la KV cache puede añadir varios GB adicionales.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090; en datacenter, A100 o H100 para servir múltiples peticiones concurrentes.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más de VRAM usando Q4_K_M; con 6 GB es ajustado y requiere contexto reducido.
- Opciones de despliegue: llama.cpp (`llama-cli -hf krishna4murali/telugu-storyteller --jinja`), Ollama (incluye Modelfile en el repo) y servidores compatibles con la API de endpoints de Hugging Face.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| telugu-storyteller | 8,03B | no disponible (base: 128K) | no disponible | GGUF Q4_K_M | Fine-tuning de Llama 3.1 8B con Unsloth; sin benchmarks |
| Meta-Llama-3.1-8B-Instruct | 8,03B | 128K | Llama 3.1 Community License | safetensors, GGUF | Modelo base; benchmarks públicos amplios; multilingüe oficial |
| Modelos de telugu de la comunidad (p. ej. ajustes sobre Llama/Mistral) | variable | variable | variable | variable | No se dispone de datos verificados en la información proporcionada |

La comparación directa con alternativas específicas para telugu no está disponible: no se han identificado en la información proporcionada otros modelos comparables con datos verificables de rendimiento o licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Llama 3.1, hereda los sesgos del corpus de pretraining del base, no auditados para telugu.
- Riesgo de alucinación: inherente a los modelos de 8B; sin benchmarks ni evaluación humana publicada no puede cuantificarse.
- Limitaciones de contexto e idioma: la model card no confirma la ventana de contexto efectiva tras el ajuste ni los idiomas soportados; el comportamiento en telugu no está validado con métricas.
- Restricciones de licencia: la licencia no está declarada en el repositorio, lo que impide determinar si el uso comercial es lícito. Además, al ser un derivado de Llama 3.1, está sujeto a la Llama 3.1 Community License del modelo base, que impone condiciones de atribución y restricciones de uso.
- Caveats para producción: cero descargas y cero "likes" indican ausencia de validación por la comunidad; el autor solo publica un archivo Q4_K_M, sin versiones de mayor precisión ni pesos safetensors del ajuste; el ajuste del token BOS puede alterar el comportamiento respecto al base.
- Calidad del ajuste desconocida: no se especifican datos, hiperparámetros ni evaluación, por lo que no puede garantizarse que el modelo sea mejor que el base en telugu.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/krishna4murali/telugu-storyteller
- Unsloth (herramienta de entrenamiento y conversión): https://github.com/unslothai/unsloth
- Modelo base Meta-Llama-3.1-8B-Instruct: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
