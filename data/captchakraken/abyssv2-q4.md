# CaptchaKraken/AbyssV2-q4

## Resumen

AbyssV2-q4 es un modelo derivado de Qwen/Qwen3.5-4B, publicado por el usuario CaptchaKraken en Hugging Face. Se trata de un ajuste fino orientado a la resolucion de captchas (tags `captcha`, `captchakraken`, `pointer`), empaquetado en formato safetensors y cuantizado con la libreria `compressed-tensors`, lo que sugiere su uso previsto con vLLM. El modelo base Qwen3.5-4B aporta la arquitectura transformer subyacente y una ventana de contexto amplia, aunque el autor no documenta en la model card los detalles del proceso de ajuste.

El repositorio tiene un tamano de 7,7 GB y 4.539.265.536 parametros totales segun los metadatos de safetensors, lo que es coherente con un modelo denso de aproximadamente 4B parametros almacenado en una cuantizacion de 4 bits (de ahi el sufijo `-q4`). El acceso esta restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargarlo.

La relevancia de este modelo es acotada y muy especializada: no es un modelo de proposito general, sino una herramienta de nicho para pipelines de resolucion automatica de captchas. La informacion publica disponible es escasa (cero descargas y cero likes en el momento de la consulta, sin model card detallada, sin benchmarks y sin idiomas declarados), por lo que esta ficha se limita a lo verificable en los metadatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B); detalles no disponibles |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-4B, no documentada en el repo) |
| Tipos de cuantizacion | q4 (4 bits) mediante `compressed-tensors` |
| Idiomas soportados | no disponibles |
| Licencia | LGPL-3.0 |
| Formato de pesos | safetensors (compatible con `compressed-tensors`) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-4B, un transformer denso de aproximadamente 4B parametros. AbyssV2-q4 conserva esa arquitectura y aplica una cuantizacion a 4 bits con `compressed-tensors`, el formato de compresion soportado nativamente por vLLM para servir modelos con pesos cuantizados. El tag `pointer` sugiere que el ajuste fino esta orientado a tareas de localizacion de elementos (posiblemente deteccion de coordenadas o regiones dentro de imagenes de captcha), aunque no se documenta el mecanismo exacto.

No hay informacion publica sobre el dataset de entrenamiento, el numero de tokens utilizados, si hubo RLHF/DPO ni sobre innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). Tampoco se detalla si el ajuste fino fue supervisado, por preferencias o mediante tecnicas de refuerzo. Toda esta informacion debe considerarse no disponible.

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base Qwen3.5-4B, aunque el ajuste fino puede haber degradado capacidades generales en favor de la tarea objetivo.
- Resolucion de captchas: el tag `captcha` y el nombre del autor indican que el modelo esta especializado en esta tarea, presumiblemente a partir de imagenes o representaciones asociadas.
- Localizacion de elementos (`pointer`): posible capacidad de identificar coordenadas o regiones concretas dentro de una imagen de captcha.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponibles (no declaradas).
- Capacidades especiales (vision, audio, thinking mode): no disponibles; el modelo base es de texto, pero el ajuste a captchas podria implicar procesamiento de imagenes, extremo no confirmado.

## Casos de uso

- Resolucion automatizada de captchas en pipelines de scraping etico: el modelo podria integrarse como paso de reconocimiento en flujos que requieran superar captchas de forma legitima (por ejemplo, en pruebas de accesibilidad o automatizacion autorizada), aprovechando su ajuste especifico.
- Automatizacion de pruebas de QA sobre sistemas anti-bot: util para que equipos de seguridad evaluen la robustez de sus propios captchas generando respuestas con un modelo entrenado para ello.
- Servicio de inferencia de baja latencia con vLLM: la cuantizacion a 4 bits y el formato `compressed-tensors` permiten desplegarlo con vLLM en GPUs de gama media, reduciendo coste por peticion en cargas de alto volumen.
- Investigacion sobre robustez de captchas: permite estudiar que tipos de captcha son vulnerables a modelos pequenos ajustados, informando el diseno de mecanismos mas resistentes.
- Prototipado rapido de soluciones de vision aplicada: el tag `pointer` sugiere uso en tareas de localizacion de elementos, reutilizable en otros dominios de deteccion de regiones.
- Despliegue en entornos con VRAM limitada: al ocupar 7,7 GB en disco y estar cuantizado a 4 bits, puede ejecutarse en GPUs consumer de 8-12 GB, lo que facilita pruebas locales sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-4 GB en cuantizacion de 4 bits (pesos) mas overhead de KV cache y activaciones; en la practica, unos 5-7 GB para contextos moderados.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100, H100; cualquier GPU con al menos 8 GB de VRAM deberia ser suficiente para inferencia basica.
- Cabe en GPU consumer: si, en modelos con 8 GB o mas de VRAM (RTX 3060, 4060, 4070, 4080, 4090, etc.).
- Opciones de despliegue: vLLM (soporte nativo de `compressed-tensors`), y potencialmente llama.cpp/Ollama si se genera una version GGUF (no disponible en el repo). TGI no garantiza soporte del formato `compressed-tensors`.
- Latencia y throughput estimados: no disponibles; dependen del hardware y del backend. En una RTX 4090 con vLLM, un modelo de 4B en 4 bits puede alcanzar decenas de peticiones por segundo en lotes pequenos, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| AbyssV2-q4 | 4.539 M | no disponible | LGPL-3.0 | Gated en HF | Ajuste para captchas sobre Qwen3.5-4B, cuantizado a 4 bits |
| Qwen/Qwen3.5-4B | ~4B | no disponible en esta ficha | no disponible en esta ficha | Publico en HF | Modelo base de proposito general |
| Otros modelos especializados en captchas | no disponible | no disponible | variable | variable | No se dispone de comparativas publicas fiables |

No se dispone de datos de rendimiento comparativos entre AbyssV2-q4 y alternativas, por lo que la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Qwen3.5-4B, puede heredar sesgos del modelo base, agravados o alterados por el ajuste fino.
- Riesgo de alucinacion: presente, como en cualquier modelo generativo; en tareas de captcha, una respuesta incorrecta puede ser indistinguible de una alucinacion, lo que exige validacion externa.
- Limitaciones de contexto o idioma: no documentadas; los idiomas soportados no estan declarados.
- Restricciones de licencia: LGPL-3.0 impone obligaciones de copyleft debiles para obras derivadas y distribucion; conviene revisar la compatibilidad con el uso comercial previsto y con la licencia del modelo base Qwen3.5-4B (no verificada en esta ficha).
- Acceso restringido: el repo es gated; es necesario aceptar condiciones en Hugging Face, lo que puede limitar la reproducibilidad y el uso en pipelines automatizados.
- Caveat de produccion: sin benchmarks, sin model card detallada y con cero descargas, el modelo no ha sido validado por la comunidad; no se recomienda su uso en produccion sin una evaluacion propia exhaustiva.
- Uso etico y legal: la resolucion automatica de captchas puede vulnerar terminos de servicio de terceros; su uso debe limitarse a entornos autorizados (pruebas propias, investigacion).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CaptchaKraken/AbyssV2-q4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Libreria compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- vLLM: https://github.com/vllm-project/vllm
