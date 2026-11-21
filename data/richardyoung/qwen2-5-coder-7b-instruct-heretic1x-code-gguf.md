# richardyoung/Qwen2.5-Coder-7B-Instruct-heretic1x-code-GGUF

## Resumen

`richardyoung/Qwen2.5-Coder-7B-Instruct-heretic1x-code-GGUF` es una cuantización en formato GGUF de un derivado del modelo Qwen2.5-Coder-7B-Instruct de Alibaba, publicada por el usuario richardyoung. El modelo de origen ha sido modificado mediante la técnica conocida como "abliteration" (etiquetada como *heretic*), un procedimiento que elimina o atenúa la dirección de rechazo en el espacio de activaciones del transformer para reducir las negativas del modelo ante peticiones que el modelo original rechazaría. El resultado se distribuye como un modelo "uncensored" orientado a investigación.

El modelo conserva la arquitectura y el tamaño del Qwen2.5-Coder-7B-Instruct original (7.615.616.512 parámetros reales según safetensors), por lo que mantiene sus capacidades de generación de código, razonamiento y conversación multi-turno. La versión publicada es exclusivamente GGUF, pensada para su uso con llama.cpp y Ollama, con cuantizaciones generadas mediante imatrix. El repositorio ocupa 32,3 GB y acumula 745 descargas y 3 likes en el momento de la consulta.

La relevancia de esta ficha es doble: por un lado, documenta una variante de un modelo de código ampliamente utilizado; por otro, advierte de que se trata de un modelo modificado para eliminar salvaguardas, con acceso restringido (gated) y con implicaciones éticas y de licencia que deben evaluarse antes de cualquier uso en producción. El modelo solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-Coder-7B-Instruct; detalles finos no disponibles) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el Qwen2.5-Coder-7B-Instruct original soporta 32.768 tokens, pero no se confirma para esta variante) |
| Tipos de cuantizacion | GGUF (multiples niveles; el repo incluye cuantizaciones generadas con imatrix; niveles exactos no disponibles) |
| Idiomas soportados | Ingles (unico idioma declarado) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp / Ollama) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 7.615.616.512 parámetros, heredado del Qwen2.5-Coder-7B-Instruct. La modificación principal respecto al original es el proceso de *abliteration* (denominado "heretic1x"), que consiste en identificar la dirección de activación asociada al rechazo de peticiones y restarla o proyectarla fuera de las representaciones internas del modelo. Este procedimiento se aplica típicamente sobre los pesos y no requiere un reentrenamiento completo, aunque puede degradar ligeramente capacidades generales. No se dispone de información sobre el dataset exacto, el número de tokens de entrenamiento ni si se aplicaron fases de RLHF o DPO en esta variante concreta.

La versión publicada es una cuantización GGUF, lo que implica que los pesos han sido convertidos desde el formato original (probablemente safetensors) y cuantizados, en este caso con la técnica imatrix para mejorar la calidad de las cuantizaciones bajas. El tag `endpoints_compatible` sugiere que el modelo puede servirse a través de la infraestructura de Hugging Face Inference Endpoints, aunque al ser GGUF el despliegue habitual será con llama.cpp u Ollama. No se dispone de información sobre innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) más allá de las propias del Qwen2.5-Coder original.

## Capacidades

- Generación de texto y conversación multi-turno en inglés.
- Generación y razonamiento sobre código (el modelo base Qwen2.5-Coder está especializado en tareas de programación).
- Razonamiento matemático y lógico básico, heredado del modelo base.
- Reducción de rechazos ante peticiones que el modelo original denegaría (comportamiento "uncensored").
- Soporte de cuantizaciones GGUF para inferencia en CPU y GPU con llama.cpp y Ollama.
- Compatibilidad con endpoints de Hugging Face (tag `endpoints_compatible`).
- No se declara soporte de tool calling, function calling, agentes, visión ni audio en la información proporcionada.
- Capacidades multilingües limitadas al inglés según los tags del repositorio.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo la abliteration afecta a la tasa de rechazo y a la calidad de las respuestas, comparándolo con el Qwen2.5-Coder-7B-Instruct original en experimentos controlados.
- Generación de código en entornos de investigación: puede utilizarse para autocompletar y generar fragmentos de código en inglés, aprovechando la especialización del modelo base y su despliegue ligero en GGUF.
- Despliegue local en hardware de consumo: al ser GGUF, puede ejecutarse con llama.cpp u Ollama en equipos con GPU de gama media o incluso en CPU, lo que facilita pruebas offline sin infraestructura cloud.
- Evaluación de robustez de filtros: sirve para probar sistemas de moderación y detección de contenido, ya que genera respuestas que un modelo alineado rechazaría, permitiendo validar clasificadores de seguridad.
- Prototipado de asistentes conversacionales en inglés: su formato conversacional y su tamaño de 7B permiten iterar rápidamente en demos de chatbot sin grandes costes de inferencia.
- Estudio de degradación por cuantización: al ofrecer múltiples niveles GGUF con imatrix, permite comparar la pérdida de calidad entre cuantizaciones y el modelo original en tareas de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 7,6B en GGUF, las cuantizaciones de 4 bits suelen requerir en torno a 4-6 GB de VRAM, las de 8 bits en torno a 8-10 GB y FP16 en torno a 15-16 GB (estimaciones orientativas, no confirmadas para esta variante).
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cabría esperar compatibilidad con RTX 3060/4060 (12 GB) en cuantizaciones bajas, RTX 4090, A100 y H100 en cuantizaciones altas o FP16.
- Compatibilidad con GPU de consumo: probable en cuantizaciones de 4-5 bits en GPUs con 8 GB o más, aunque no se confirma oficialmente.
- Opciones de despliegue: llama.cpp y Ollama (formato GGUF), y potencialmente Hugging Face Inference Endpoints (tag `endpoints_compatible`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| richardyoung/Qwen2.5-Coder-7B-Instruct-heretic1x-code-GGUF | 7,6B | No disponible | Apache 2.0 | GGUF | Variante abliterated, solo inglés, acceso gated |
| Qwen2.5-Coder-7B-Instruct (original) | 7,6B | 32.768 tokens (según documentación pública de Qwen) | Apache 2.0 | Safetensors, GGUF | Modelo alineado, multilingüe, base de esta variante |
| Otras variantes abliterated de Qwen2.5-Coder | ~7,6B | Variable | Apache 2.0 | GGUF, safetensors | Múltiples autores publican variantes similares; no se dispone de comparación de rendimiento |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de esta variante con el modelo original ni con otras alternativas.

## Limitaciones y advertencias

- Modelo modificado para reducir rechazos: puede generar contenido que el modelo original evitaría, con implicaciones éticas y de seguridad.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face antes de descargar.
- Solo declara soporte para inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinación inherente a los modelos de 7B, potencialmente agravado por la modificación de pesos.
- La abliteration puede degradar capacidades generales (razonamiento, coherencia) respecto al modelo original; no se han publicado evaluaciones que lo cuantifiquen.
- Licencia Apache 2.0 permite uso comercial, pero el uso de un modelo "uncensored" en producción puede incumplir políticas de plataformas, normativas sectoriales o términos de servicio de proveedores cloud.
- No se dispone de información sobre sesgos específicos introducidos o amplificados por la modificación.
- El repositorio es de un autor individual (richardyoung), no de un laboratorio oficial; la reproducibilidad y el soporte son limitados.
- No se confirma la longitud de contexto efectiva de esta variante; conviene validarla empíricamente antes de usarla con contextos largos.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-Coder-7B-Instruct-heretic1x-code-GGUF
- Modelo base de la cuantización: https://huggingface.co/richardyoung/Qwen2.5-Coder-7B-Instruct-heretic1x-code
- Modelo original de referencia (Qwen2.5-Coder-7B-Instruct): no se proporciona enlace en la información disponible; puede localizarse en el espacio oficial de Qwen en Hugging Face.
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
