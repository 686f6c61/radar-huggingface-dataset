# richardyoung/Qwen3.5-4B-MPOA-heretic-GGUF

## Resumen

Qwen3.5-4B-MPOA-heretic-GGUF es una cuantizacion en formato GGUF del modelo richardyoung/Qwen3.5-4B-MPOA-heretic, un derivado de la familia Qwen3.5 de Alibaba de aproximadamente 4.200 millones de parametros. El modelo ha sido sometido a un proceso de "abliteration" (eliminacion de rechazos) y etiquetado como "heretic", lo que indica que se ha modificado para reducir las negativas de seguridad del modelo original. El autor de la cuantizacion y del modelo base es richardyoung, un publicador independiente en Hugging Face.

La relevancia de esta ficha es doble: por un lado, documenta una variante de Qwen3.5 de tamano compacto (4B) util para despliegue en hardware consumer; por otro, advierte de que se trata de un modelo "uncensored/abliterated", con las implicaciones eticas y de cumplimiento que ello conlleva. El repositorio esta sujeto a acceso restringido (gated), por lo que es necesario aceptar condiciones en Hugging Face antes de descargarlo.

La informacion disponible en la ficha de Hugging Face es limitada: no se publican detalles de arquitectura interna, datos de entrenamiento ni resultados de benchmarks. Esta ficha recoge exclusivamente los datos verificables del repositorio y marca explicitamente como "no disponible" todo aquello que no se ha podido confirmar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5; detalles internos no disponibles) |
| Parametros totales | 4.205.751.296 (4,2 B) |
| Parametros activos | No aplica (no es MoE segun los datos disponibles) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (multiples niveles de cuantizacion; niveles concretos no disponibles) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp / Ollama) |

## Arquitectura y entrenamiento

El modelo base es richardyoung/Qwen3.5-4B-MPOA-heretic, un derivado de Qwen3.5 de 4,2 mil millones de parametros. La nomenclatura "MPOA" y "heretic" sugiere la aplicacion de tecnicas de abliteration (modificacion de direcciones de activacion para eliminar el comportamiento de rechazo) sobre el modelo original. No se dispone de informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO en el modelo base.

La version documentada aqui es una cuantizacion GGUF generada con llama.cpp, con el tag "imatrix" que indica el uso de matrices de importancia para mejorar la calidad de la cuantizacion. No se especifican los niveles de cuantizacion incluidos ni el metodo exacto de calibracion.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento general y respuesta a instrucciones (heredadas de Qwen3.5).
- Ejecucion local mediante llama.cpp y Ollama gracias al formato GGUF.
- Compatibilidad con endpoints (tag endpoints_compatible).
- Capacidades de codigo y matematicas: no confirmadas en la informacion disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo thinking explicito: no disponible.
- Multilingue: limitado a ingles segun los tags del repositorio.

## Casos de uso

- Prototipado local de asistentes conversacionales: el modelo puede ejecutarse en un portatil con GPU consumer gracias a su tamano de 4,2 B y formato GGUF, permitiendo iterar sin costes de API.
- Investigacion sobre alineacion y seguridad: al ser un modelo abliterated, es util para estudiar el comportamiento de modelos sin rechazos y comparar con la version original de Qwen3.5.
- Generacion de texto creativo sin filtros: escritura de ficcion, guiones o contenido donde los rechazos del modelo base resultan obstructivos, siempre con revision humana.
- Despliegue en entornos aislados (air-gapped): al ser un modelo pequeno y ejecutable con llama.cpp, puede correr en maquinas sin conexion para tareas de procesamiento de texto.
- Experimentacion con cuantizacion imatrix: sirve como caso de estudio para evaluar la perdida de calidad entre distintos niveles GGUF frente al modelo en precision completa.
- Evaluacion de riesgos en pipelines de IA: util para equipos de seguridad que necesitan un modelo "sin censura" como referencia negativa en pruebas de red teaming.
- Fine-tuning ligero sobre base abliterated: punto de partida para adaptaciones de dominio en ingles donde no se requieran las salvaguardas del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,5-3 GB para cuantizaciones Q4, 4-5 GB para Q8 y en torno a 8-9 GB en FP16 (estimacion basada en los 4,2 B de parametros; no confirmada por el autor).
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4070) para cuantizaciones bajas; A100/H100 no necesarias para este tamano.
- Cabe en GPU consumer: si, en la mayoria de tarjetas modernas con 6-8 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python). vLLM y TGI no soportan GGUF de forma nativa en todos los casos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| richardyoung/Qwen3.5-4B-MPOA-heretic-GGUF | 4,2 B | No disponible | Apache 2.0 | GGUF | Abliterated, solo ingles |
| Qwen3.5-4B (original) | ~4 B | No disponible | Apache 2.0 (segun familia Qwen) | Safetensors | Con salvaguardas de seguridad |
| Llama 3.2 3B Instruct | 3,2 B | 128 K | Llama 3.2 Community | Safetensors, GGUF | Multilingue, con alineacion |
| Phi-3.5-mini-instruct | 3,8 B | 128 K | MIT | Safetensors, GGUF | Multilingue, con alineacion |

La comparativa se basa en caracteristicas generales de la categoria; no se dispone de datos de rendimiento comparativo para este modelo concreto.

## Limitaciones y advertencias

- Modelo abliterated/uncensored: se ha eliminado o reducido el comportamiento de rechazo, lo que aumenta el riesgo de generar contenido danino, sesgado o ilegal. No apto para produccion sin filtros externos.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face; no es de descarga libre inmediata.
- Solo ingles: no se garantiza calidad en castellano ni en otros idiomas.
- Riesgo elevado de alucinacion: inherente a modelos de 4 B y potencialmente agravado por la modificacion de pesos.
- Sin datos de benchmarks: no hay evidencia publica de su rendimiento frente al modelo original.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado.
- Procedencia independiente: el autor no es el desarrollador original de Qwen3.5; la calidad de la abliteration y de la cuantizacion no esta auditada.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo sin verificar la ventana real.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/richardyoung/Qwen3.5-4B-MPOA-heretic-GGUF
- Modelo base: https://huggingface.co/richardyoung/Qwen3.5-4B-MPOA-heretic
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
