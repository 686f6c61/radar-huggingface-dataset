# richardyoung/OLMo-2-0325-32B-Instruct-GMPOA-heretic-GGUF

## Resumen

OLMo-2-0325-32B-Instruct-GMPOA-heretic-GGUF es una cuantizacion en formato GGUF del modelo richardyoung/OLMo-2-0325-32B-Instruct-GMPOA-heretic, que a su vez deriva del OLMo 2 32B Instruct de AllenAI. El modelo original es un transformer decoder-only de 32.234.279.936 parametros, entrenado por el Allen Institute for AI (Ai2) dentro de la familia OLMo 2, publicada con el objetivo de ofrecer modelos de lenguaje completamente abiertos (pesos, datos y receta de entrenamiento). Esta version concreta ha pasado por un proceso de "abliteration" o "heretic" (eliminacion de comportamientos de rechazo) y un ajuste adicional con GMPOA, lo que la orienta a usos sin censura, y se distribuye cuantizada en GGUF para su uso con llama.cpp y Ollama.

El interes practico de esta ficha reside en que combina tres elementos: la base solida y abierta de OLMo 2 32B Instruct, una modificacion que elimina las capas de rechazo del modelo (abliterated/uncensored) y un formato de pesos optimizado para inferencia en hardware de consumo mediante llama.cpp. No obstante, el repositorio es de acceso restringido (gated) y no cuenta con descargas ni likes, lo que indica que es una publicacion de investigacion de nicho, no un modelo de produccion consolidado.

La relevancia actual es doble: por un lado, permite estudiar el efecto del abliteration sobre un modelo abierto de 32B con licencia Apache 2.0; por otro, facilita desplegar localmente un modelo de ese tamano sin depender de infraestructura en la nube, siempre que se acepten las condiciones del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base OLMo 2 32B Instruct; detalles finos no disponibles en la informacion proporcionada) |
| Parametros totales | 32.234.279.936 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible en la informacion proporcionada (el OLMo 2 32B Instruct original soporta contexto largo, pero no se confirma aqui) |
| Tipos de cuantizacion | GGUF (variantes concretas no especificadas en la informacion disponible); se menciona imatrix |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp, Ollama) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de OLMo 2 32B Instruct de AllenAI: un transformer decoder-only de aproximadamente 32.000 millones de parametros. No se dispone en la informacion proporcionada de detalles sobre el numero exacto de capas, dimensiones ocultas, mecanismo de atencion (si usa atencion lineal o sliding window) ni sobre la composicion del dataset de entrenamiento original. Tampoco se confirma si el modelo base uso RLHF, DPO u otra etapa de alineamiento; el OLMo 2 Instruct original si incorpora etapas de post-entrenamiento, pero los detalles no estan en los datos facilitados.

Sobre esta base, el autor richardyoung aplico dos modificaciones: un proceso "heretic" (abliteration), que consiste en identificar y neutralizar las direcciones internas asociadas a los rechazos de seguridad, y un ajuste adicional denominado GMPOA. El resultado es un modelo "uncensored" que conserva la estructura del original pero con menor tendencia a declinar peticiones. Posteriormente se cuantizo a GGUF con tecnicas de imatrix para preservar la calidad en precision reducida. No se especifica el numero de tokens usados en el ajuste GMPOA ni la composicion de ese dataset.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a instrucciones.
- Razonamiento general y respuesta a preguntas, heredado de OLMo 2 32B Instruct.
- Generacion de codigo y matematicas (capacidades del modelo base; sin benchmarks especificos en esta version).
- Comportamiento "uncensored": menor probabilidad de rechazar peticiones que el modelo original, por el abliteration.
- Compatibilidad con llama.cpp y Ollama, lo que permite tool calling e integracion en pipelines locales si la plantilla de chat del modelo lo soporta (no confirmado en la informacion disponible).
- Capacidades multilingues limitadas: el tag de idioma es solo "en".
- No se confirma soporte de vision, audio ni modo "thinking" explicito.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: comparar las respuestas del modelo heretic con las del OLMo 2 32B Instruct original para medir el efecto del abliteration sobre la tasa de rechazos y la calidad general. Es adecuado porque ambos comparten base y licencia.
- Despliegue local en estaciones de trabajo: usar las cuantizaciones GGUF con llama.cpp u Ollama para ejecutar un modelo de 32B en una sola GPU o en CPU+GPU, sin depender de APIs externas.
- Generacion de texto creativo sin filtros: el caracter uncensored permite explorar narrativa, guiones o dialogos con tematicas que el modelo original rechazaria, en un entorno controlado de investigacion.
- Prototipado de asistentes conversacionales en ingles: la ventana de contexto y el formato de chat del OLMo 2 permiten conversaciones multi-turno, aunque la longitud exacta de contexto no esta confirmada.
- Evaluacion de cuantizaciones: el uso de imatrix y GGUF hace de este repositorio un banco de pruebas para medir la perdida de calidad entre precision completa y cuantizada en un modelo de 32B.
- Experimentos de red teaming: estudiar que tipos de peticiones problemáticas acepta un modelo abliterated y documentar los riesgos antes de plantear cualquier uso en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para 32.000 millones de parametros, en cuantizacion Q4_K_M se necesita aproximadamente 19-21 GB; en Q5_K_M, 22-24 GB; en Q8_0, unos 34-36 GB; en FP16, alrededor de 64 GB.
- GPU recomendadas: A100 40/80 GB o H100 para FP16; RTX 4090 (24 GB) para Q4/Q5; RTX 3090 (24 GB) para Q4.
- Cabe en GPU de consumo: si, en RTX 4090 o 3090 con cuantizaciones Q4 y Q5; en GPUs de 16 GB solo con cuantizaciones muy agresivas (Q2/Q3) o descarga parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama (segun los tags del repositorio); vLLM y TGI no estan confirmados para este formato GGUF concreto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (OLMo-2-0325-32B-Instruct-GMPOA-heretic-GGUF) | 32,2B | no disponible | Apache 2.0 | GGUF | Abliterated, solo ingles, acceso restringido |
| OLMo 2 32B Instruct (AllenAI) | 32,2B | no disponible en esta ficha | Apache 2.0 | safetensors | Modelo original alineado, sin abliteration |
| Modelos abliterated de tamano similar (p. ej. variantes de Llama 3 8B/70B) | variable | variable | licencia del modelo base | GGUF | Comparacion cualitativa; no se dispone de datos concretos en la informacion proporcionada |

No se dispone de datos de rendimiento comparado en la informacion proporcionada; la comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- El abliteration elimina barreras de seguridad: el modelo puede generar contenido danino, ofensivo o ilegal con mayor facilidad que el original. No es apto para produccion orientada al publico sin filtros adicionales.
- Riesgo de alucinacion: al ser un modelo de 32B sin benchmarks publicados en esta version, no hay garantia de fiabilidad factual; el ajuste heretic puede degradar capacidades de razonamiento.
- Solo soporta ingles segun los tags; el rendimiento en castellano no esta garantizado.
- La longitud de contexto no esta confirmada en la informacion disponible; no asumir el contexto del OLMo 2 original sin verificacion.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita su uso automatico en pipelines.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal por el contenido generado recae en el usuario; el abliteration puede violar terminos de uso en algunos contextos.
- Repositorio sin descargas ni likes: no hay validacion comunitaria de la calidad de las cuantizaciones.
- El ajuste GMPOA no esta documentado en la informacion proporcionada; se desconoce su dataset y posibles sesgos introducidos.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/OLMo-2-0325-32B-Instruct-GMPOA-heretic-GGUF
- Modelo base (adaptacion heretic): https://huggingface.co/richardyoung/OLMo-2-0325-32B-Instruct-GMPOA-heretic
- Modelo original de AllenAI: no disponible en la informacion proporcionada (se recomienda buscar "OLMo 2 32B Instruct" en Hugging Face)
- Paper de OLMo 2: no disponible en la informacion proporcionada
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
