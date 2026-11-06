# serio-ngo/serio-nd-a11y-0.1b

## Resumen

Serio S1 (identificador `serio-ngo/serio-nd-a11y-0.1b`) es un modelo de clasificación de texto en polaco desarrollado por la Fundación Serio (Fundacja Serio). Se presenta como un "filtro local polaco" orientado a la moderación de contenido: clasifica texto en siete categorías (autolesión, odio, vulgaridad, contenido sexual, delito, jailbreak y otros), lo que lo sitúa en el ámbito de la seguridad de contenido y la moderación automatizada de comunidades digitales.

El modelo se apoya en una arquitectura RoBERTa con 124.448.263 parámetros totales y se distribuye en formato safetensors y ONNX, con un repositorio de 1,1 GB. Está entrenado exclusivamente para el idioma polaco (`pl`) y se publica bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales de copyleft.

La relevancia actual del modelo radica en su enfoque de despliegue local: al ser un modelo compacto (en la escala de 0,1B) y exportado a ONNX, puede ejecutarse en infraestructura propia sin depender de API externas, algo alineado con requisitos de privacidad y soberanía de datos en tareas de moderación. La model card advierte explícitamente de que la salida no es una probabilidad calibrada y de que pueden producirse errores, por lo que debe tratarse como un filtro auxiliar y no como un clasificador definitivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (transformer encoder) |
| Parametros totales | 124.448.263 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | polaco (pl) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura RoBERTa, es decir, un transformer encoder basado en BERT con las optimizaciones de preentrenamiento introducidas por RoBERTa (eliminación de la tarea NSP, masking dinámico y lotes de mayor tamaño). Con 124,4 millones de parámetros, se sitúa en la escala de `roberta-base`, lo que lo hace adecuado para inferencia en CPU y GPU de gama baja. La cabecera es de clasificación de texto multi-etiqueta o multi-clase sobre siete categorías.

La model card indica explícitamente que se ha añadido "sin cabecera ND y sin nuevo entrenamiento" y que "los pesos no han cambiado" (traducción del polaco: "Bez głowicy ND i nowego treningu. Wagi bez zmian."). Esto sugiere que Serio S1 reutiliza pesos de un modelo previo y que el trabajo de la fundación se centra en la adaptación de la cabecera de clasificación y en el empaquetado para despliegue local, no en un preentrenamiento desde cero. No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO; estos datos figuran como no disponibles.

## Capacidades

- Clasificación de texto en polaco en siete clases: autolesión (`self-harm`), odio (`hate`), vulgaridad (`vulgar`), contenido sexual (`sex`), delito (`crime`), jailbreak y otros (`other`).
- Moderación de contenido en comunidades y plataformas digitales.
- Detección de intentos de jailbreak en prompts de usuario.
- Funcionamiento como filtro local, sin dependencia de servicios en la nube.
- Exportación a ONNX para inferencia optimizada y despliegue en entornos con recursos limitados.
- Compatibilidad con Text Embeddings Inference (tag `text-embeddings-inference`) y con endpoints compatibles (tag `endpoints_compatible`).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes; el modelo es exclusivamente un clasificador.

## Casos de uso

- Moderación de foros y comunidades en polaco: el modelo puede etiquetar mensajes entrantes en las siete categorías definidas y derivar los casos de odio, autolesión o contenido sexual a revisión humana, reduciendo la carga de moderadores.
- Filtrado previo en pipelines de chat: al ejecutarse localmente, permite descartar o marcar prompts con intentos de jailbreak antes de enviarlos a un LLM generativo, actuando como capa de seguridad de bajo coste.
- Cumplimiento normativo y protección de menores: la detección de contenido de autolesión y sexual permite activar protocolos de escalado o recursos de ayuda en plataformas educativas y de mensajería.
- Procesamiento por lotes de corpus históricos: la exportación ONNX y el tamaño compacto permiten clasificar grandes volúmenes de texto polaco en infraestructura propia para auditorías de contenido.
- Despliegue en el borde (edge): con 124 millones de parámetros, el modelo puede ejecutarse en servidores modestos o incluso en CPU, lo que facilita su integración en aplicaciones autoalojadas con requisitos de privacidad.
- Investigación en moderación multilingüe: sirve como componente específico para polaco dentro de sistemas de moderación más amplios que combinen clasificadores por idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, recall, F1 ni comparaciones con otros clasificadores, y advierte de que la salida "no es una probabilidad calibrada" y de que "son posibles errores".

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (124,4 millones de parámetros en precisión completa, aproximadamente 500 MB en fp32 y unos 250 MB en fp16), es esperable que quepa holgadamente en cualquier GPU consumer, aunque esta estimación no está confirmada por el autor.
- GPU recomendadas: no especificadas; el modelo es lo bastante pequeño para ejecutarse en CPU y en GPU de gama baja.
- Cabe en GPU consumer: sí, por tamaño, aunque no hay confirmación oficial de requisitos.
- Opciones de despliegue: ONNX Runtime (formato principal), Text Embeddings Inference (tag del repositorio), endpoints compatibles; no se documenta soporte explícito para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Serio S1 (`serio-nd-a11y-0.1b`) | 124,4 M | no disponible | pl | Apache 2.0 | safetensors, ONNX |
| `roberta-base` (Facebook AI) | 125 M | 512 tokens | en (multilingüe en variantes) | MIT | safetensors, PyTorch |
| `xlm-roberta-base` (Facebook AI) | 278 M | 512 tokens | 100 idiomas | MIT | safetensors, PyTorch |

La comparación se limita a la arquitectura y el tamaño, ya que no se han publicado métricas de rendimiento para Serio S1. Frente a `roberta-base`, Serio S1 comparte escala de parámetros pero está especializado en polaco y en clasificación de contenido sensible; frente a `xlm-roberta-base`, es aproximadamente la mitad de grande y monolingüe. No se dispone de comparaciones con otros clasificadores de moderación en polaco.

## Limitaciones y advertencias

- La salida no es una probabilidad calibrada; no debe interpretarse como un score de confianza fiable sin calibración previa.
- El autor advierte de que pueden producirse errores de clasificación.
- El modelo solo cubre el idioma polaco; no es aplicable a otros idiomas sin reentrenamiento.
- No se documentan sesgos conocidos, pero al ser un clasificador de contenido sensible existe riesgo de falsos positivos y negativos en contextos ambiguos (ironía, lenguaje coloquial, citas).
- No se especifica la longitud máxima de contexto soportada.
- No se documenta el dataset de entrenamiento ni el proceso de anotación, lo que dificulta evaluar su robustez.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- No se recomienda su uso como único mecanismo de moderación; debe combinarse con revisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/serio-ngo/serio-nd-a11y-0.1b
- Código e instrucciones: https://github.com/serio-ngo/serio-s1/tree/feat/serio-s1-mvp
- Licencia: https://huggingface.co/serio-ngo/serio-nd-a11y-0.1b/blob/main/LICENSE
- Autoría: https://huggingface.co/serio-ngo/serio-nd-a11y-0.1b/blob/main/NOTICE
- Glosario: https://huggingface.co/serio-ngo/serio-nd-a11y-0.1b/blob/main/GLOSSARY.md
