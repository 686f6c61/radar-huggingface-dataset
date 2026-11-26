# mradermacher/abliterated-Qwen2.5-1.5B-full-GGUF

## Resumen

abliterated-Qwen2.5-1.5B-full-GGUF es una coleccion de cuantizaciones estaticas en formato GGUF del modelo abliterated-Qwen2.5-1.5B-full, publicado por el usuario mradermacher. El modelo subyacente es una version "abliterated" (con eliminacion de mecanismos de rechazo) del Qwen2.5-1.5B-Instruct de Alibaba, un transformer decoder-only denso de aproximadamente 1.543 millones de parametros. El trabajo de abliteration se atribuye al autor C4445654, mientras que mradermacher se limita a generar los ficheros GGUF para su uso con llama.cpp y derivados.

La relevancia de esta ficha es doble. Por un lado, demuestra el flujo tipico de cuantizacion estatica de un modelo pequeno para despliegue en hardware modesto: desde 0,8 GB en Q2_K hasta 3,2 GB en f16. Por otro, ilustra el fenomeno de los modelos "uncensored" o con refusal-removal, que buscan eliminar las respuestas de rechazo del modelo original mediante tecnicas de intervencion en el espacio de activaciones. El modelo base Qwen2.5-1.5B-Instruct es conocido por su solida relacion calidad/tamano, con soporte de contexto largo y capacidades multilingues.

El repositorio tiene un tamano total de 14,2 GB e incluye once variantes de cuantizacion. No se han publicado resultados de benchmarks especificos para esta version abliterated en la informacion disponible, por lo que las cifras de rendimiento deben inferirse del modelo Qwen2.5-1.5B-Instruct original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (basado en Qwen2.5) |
| Parametros totales | 1.543.714.304 (~1,54 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el Qwen2.5-1.5B-Instruct original soporta hasta 32.768 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, fr (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 14,2 GB |
| Fecha de creacion | 2026-11-26 |
| Ultima actualizacion | 2026-11-26 |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only denso con atencion por cabezas (multi-head attention) y normalizacion RMSNorm, disenado para generacion de texto autoregresiva. El modelo original fue entrenado por Alibaba con un corpus multilingue y posteriormente ajustado con instrucciones y tecnicas de alineacion (RLHF/DPO, aunque los detalles exactos no se especifican en la informacion proporcionada). El contexto nativo del Qwen2.5-1.5B-Instruct es de 32.768 tokens, aunque esta ficha no confirma que la version abliterated lo preserve.

La innovacion principal de esta variante es la "abliteration": una tecnica de intervencion que identifica la direccion en el espacio de activaciones asociada a las respuestas de rechazo y la elimina o proyecta fuera, de modo que el modelo deja de emitir negativas sistematicas ante ciertas peticiones. No se dispone de informacion sobre el dataset exacto, el numero de tokens de entrenamiento ni el procedimiento concreto de abliteration empleado por C4445654. mradermacher solo realiza la cuantizacion estatica a GGUF, sin entrenamiento adicional. Las cuantizaciones ponderadas (imatrix) no estan disponibles en el momento de la publicacion.

## Capacidades

- Generacion de texto conversacional en ingles y frances, con calidad propia de un modelo de 1,5 B parametros.
- Razonamiento basico y respuesta a instrucciones, heredado del ajuste instructivo de Qwen2.5.
- Generacion de codigo sencillo y explicaciones tecnicas de nivel introductorio.
- Capacidad reducida de matematicas y razonamiento multi-paso, limitada por el tamano del modelo.
- Ausencia (o reduccion significativa) de respuestas de rechazo ante peticiones que el modelo original rechazaria, gracias a la abliteration.
- Soporte de conversacion multi-turno mediante plantilla de chat (formato Qwen).
- No se confirma soporte de tool calling, function calling ni agentes en la informacion proporcionada.
- No se confirma soporte de vision ni audio.
- No se confirma modo "thinking" ni decodificacion especulativa.

## Casos de uso

- Experimentacion con modelos sin filtros de rechazo: investigadores que estudian el comportamiento de modelos abliterated pueden usar esta version para comparar respuestas antes y despues de la intervencion, con un coste computacional minimo.
- Generacion de texto creativo sin restricciones tematicas: escritura de ficcion, guiones o dialogos donde el modelo original podria negarse a desarrollar ciertos temas, en un entorno controlado y con supervision humana.
- Prototipado rapido en local: con cuantizaciones de 0,8 a 1,7 GB, el modelo cabe en practicamente cualquier GPU consumer (incluso 4 GB de VRAM) y permite iterar en portatiles sin conexion.
- Evaluacion de sesgos y seguridad: util para equipos de red teaming que necesitan un modelo deliberadamente permisivo como linea base para medir riesgos de contenido.
- Despliegue en dispositivos edge: al ser un modelo de 1,5 B en GGUF, puede ejecutarse en CPUs modernas o en GPUs integradas para tareas de generacion de texto de baja latencia y bajo consumo.
- Traduccion y asistencia bilingue ingles-frances: aunque limitado, el modelo puede emplearse para tareas de parafraseo o resumen en esos dos idiomas en entornos sin requisitos de alta calidad.
- Educacion y demostraciones: como ejemplo didactico de cuantizacion GGUF y de tecnicas de abliteration en cursos de IA open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. No se deben inferir cifras del Qwen2.5-1.5B-Instruct original sin verificacion, ya que la abliteration puede alterar el rendimiento en tareas estandar.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~0,8 GB
  - Q3_K_S / Q3_K_M: ~0,9 GB
  - Q3_K_L / IQ4_XS / Q4_K_S: ~1,0 GB
  - Q4_K_M: ~1,1 GB
  - Q5_K_S / Q5_K_M: ~1,2 GB
  - Q6_K: ~1,4 GB
  - Q8_0: ~1,7 GB
  - f16: ~3,2 GB
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.). Para f16 se recomienda al menos 6 GB. En GPUs de datacenter (A100, H100) el modelo es sobredimensionado para su capacidad.
- Cabe en GPU consumer: si, en todas las cuantizaciones, incluso en iGPUs con memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. Tambien puede usarse con transformers cargando el modelo base en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada. En una RTX 4060, un modelo de 1,5 B en Q4_K_M deberia generar decenas de tokens por segundo, pero no se aportan mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| abliterated-Qwen2.5-1.5B-full-GGUF (este) | 1,54 B | no disponible | Apache 2.0 | GGUF | Sin benchmarks publicados; abliterated |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Modelo original con alineacion estandar; benchmarks publicos por Alibaba |
| Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Mayor contexto, licencia mas restrictiva |
| SmolLM2-1.7B-Instruct | 1,71 B | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Alternativa ligera con benchmarks publicados |

La comparativa se limita a parametros, contexto y licencia, ya que no hay datos de rendimiento para la version abliterated. El modelo original Qwen2.5-1.5B-Instruct es la referencia natural, pero la abliteration puede degradar ligeramente tareas de razonamiento e instruccion.

## Limitaciones y advertencias

- La abliteration elimina o reduce los rechazos de seguridad, lo que aumenta el riesgo de generar contenido toxico, ilegal o danino. No es apto para despliegues publicos sin filtros adicionales.
- Riesgo elevado de alucinacion, acentuado por el tamano reducido (1,5 B) y por la posible degradacion de la alineacion tras la intervencion.
- Capacidad limitada en razonamiento complejo, matematicas y codigo avanzado; no debe usarse como sustituto de modelos mayores en produccion.
- Idiomas soportados limitados a ingles y frances segun la model card; el rendimiento en castellano no esta garantizado.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo abliterated; el usuario asume la responsabilidad legal del contenido generado.
- No hay benchmarks publicados que validen la calidad tras la abliteration; el rendimiento real puede diferir del Qwen2.5-1.5B-Instruct original.
- Las cuantizaciones Q2_K y Q3_K_M presentan perdida de calidad notable segun las notas del autor; se recomienda Q4_K_M o superior para uso serio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica ausencia de validacion por parte de la comunidad.
- No se confirma la longitud de contexto efectiva de la version abliterated; podria ser inferior a los 32.768 tokens del original.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/abliterated-Qwen2.5-1.5B-full-GGUF
- Modelo base (abliterated): https://huggingface.co/C4445654/abliterated-Qwen2.5-1.5B-full
- Pagina de descargas del autor: https://hf.tst.eu/model#abliterated-Qwen2.5-1.5B-full-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor: https://www.nethype.de/
