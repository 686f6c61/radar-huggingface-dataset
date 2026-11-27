# richardyoung/Qwen3.5-4B-SOM-heretic-GGUF

## Resumen

Qwen3.5-4B-SOM-heretic-GGUF es una cuantizacion en formato GGUF del modelo richardyoung/Qwen3.5-4B-SOM-heretic, un derivado del Qwen3.5 de 4B parametros sometido a un proceso de "abliteration" (eliminacion de los mecanismos de rechazo condicionado) mediante la tecnica heretic. El resultado es un modelo de 4.205.751.296 parametros orientado a generacion de texto conversacional sin las restricciones de alineacion tipicas de los modelos instructivos convencionales, empaquetado para su uso con llama.cpp y Ollama.

El modelo se distribuye unicamente en ingles, con licencia Apache 2.0, y esta pensado para investigacion sobre comportamiento de modelos sin censura, evaluacion de sesgos y estudios de seguridad en IA. La cuantizacion ha sido generada con imatrix, lo que mejora la calidad de los pesos de baja precision respecto a una cuantizacion estandar. El repositorio ocupa 18,4 GB e incluye multiples niveles de cuantizacion.

Es relevante ahora porque combina tres tendencias activas: la familia Qwen3.5 como base abierta de referencia, las tecnicas de abliteration para estudiar alineacion, y el ecosistema GGUF/llama.cpp que permite ejecutar modelos de 4B en hardware de consumo. Conviene senalar que el acceso esta restringido (gated) y que el modelo no cuenta con likes ni un historico amplio de adopcion (697 descargas en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5), modificado por abliteration heretic |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con imatrix (multiples niveles; niveles concretos no detallados en la informacion) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Qwen3.5 con 4.205.751.296 parametros. Sobre esa base se aplico la tecnica heretic de abliteration, que identifica y suprime las direcciones de activacion asociadas al rechazo de peticiones, produciendo un modelo "uncensored". El repositorio referencia el paper arXiv:2611.17846 como base metodologica.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si hubo fases de RLHF o DPO posteriores a la abliteration. La cuantizacion GGUF se genero con imatrix, una tecnica que calibra la importancia de cada peso para preservar la calidad en precisiones reducidas. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen3.5.
- Comportamiento sin rechazo condicionado (abliterated): responde a peticiones que un modelo alineado rechazaria.
- Ejecucion local via llama.cpp y Ollama gracias al formato GGUF.
- Compatibilidad con endpoints (tag endpoints_compatible).
- Soporte de tool calling / function calling: no disponible en la informacion.
- Capacidades de agente y multi-step reasoning: no disponible en la informacion.
- Capacidades multilingues: limitadas a ingles segun los tags.
- Capacidades especiales (thinking mode, vision, audio): no disponible en la informacion.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar que comportamientos emergen al eliminar los mecanismos de rechazo, comparando respuestas con el Qwen3.5 original en conjuntos de prompts adversariales.
- Evaluacion de sesgos y toxicidad: sirve como sujeto de prueba en pipelines de red-teaming para medir la facilidad con que un modelo abliterated genera contenido danino.
- Experimentos academicos reproducibles: al estar en GGUF con imatrix, se puede ejecutar en un portatil o estacion de trabajo sin GPU dedicada, facilitando la replicabilidad.
- Prototipado de asistentes conversacionales en ingles: util para iterar rapidamente sobre interfaces de chat donde no se requiere alineacion estricta.
- Generacion de datos sinteticos para entrenamiento: puede producir grandes volumenes de texto diverso en ingles para aumentar datasets, con la advertencia de revisar el contenido generado.
- Despliegue en entornos con recursos limitados: su tamano de 4B permite ejecutarlo en CPU o GPU de consumo, adecuado para demos y pruebas de concepto.
- Estudio de cuantizacion: comparar la calidad de las distintas variantes GGUF con imatrix frente al modelo original en tareas de perplexity y generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en torno a 2,5-3 GB para cuantizaciones de 4 bits (Q4_K_M), 4-5 GB para 8 bits, y aproximadamente 8,5 GB en FP16. Estimaciones basadas en los 4.205.751.296 parametros; no confirmadas por el autor.
- GPU recomendadas: cualquier GPU con 8 GB o mas (RTX 3060, RTX 4060, RTX 4090) para cuantizaciones de 4-8 bits; A100/H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 6-8 GB de VRAM usando cuantizacion Q4.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el tag endpoints_compatible sugiere soporte en plataformas de inferencia gestionada.
- Latencia y throughput: no disponible en la informacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-SOM-heretic-GGUF | 4,2B | no disponible | Apache 2.0 | GGUF | Abliterated, solo ingles, acceso gated |
| Qwen3.5-4B (base) | ~4B | no disponible | Apache 2.0 | safetensors/GGUF | Modelo alineado original |
| Llama 3.2 3B Instruct | 3,2B | 128K | Llama 3.2 Community | safetensors/GGUF | Alineado, multilingue |
| Gemma 2 2B | 2,6B | 8K | Gemma Terms | safetensors/GGUF | Alineado, ligero |

La comparativa con Llama 3.2 3B y Gemma 2 2B es orientativa por tamano y categoria; no se dispone de datos de rendimiento comparativo del modelo heretic frente a ellos.

## Limitaciones y advertencias

- Modelo abliterated: no aplica rechazo condicionado, por lo que puede generar contenido ofensivo, ilegal o peligroso sin filtros. No apto para produccion orientada al publico general sin moderacion externa.
- Solo soporta ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo elevado de alucinacion, comun en modelos de 4B y potencialmente agravado por la abliteration.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face antes de descargar.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede infringir normativas; la responsabilidad recae en el desplegador.
- Sin datos publicados de benchmarks, contexto maximo ni evaluacion de calidad de las cuantizaciones.
- Adopcion muy baja (0 likes, 697 descargas) y creado en noviembre de 2026: comunidad y soporte limitados.
- No se documentan sesgos especificos, pero hereda los del Qwen3.5 base y los puede amplificar al eliminar salvaguardas.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Qwen3.5-4B-SOM-heretic-GGUF
- Modelo base: https://huggingface.co/richardyoung/Qwen3.5-4B-SOM-heretic
- Paper de referencia: https://arxiv.org/abs/2611.17846
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
