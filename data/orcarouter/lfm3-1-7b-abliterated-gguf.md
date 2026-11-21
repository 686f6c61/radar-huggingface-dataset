# orcarouter/LFM3-1.7B-abliterated-GGUF

## Resumen

LFM3-1.7B-abliterated-GGUF es una cuantizacion en formato GGUF del modelo orcarouter/LFM3-1.7B-abliterated, a su vez derivado del LFM3 de Liquid AI. Se trata de un modelo de lenguaje de 1.728.801.600 parametros (aproximadamente 1,7 mil millones) disenado para inferencia local y despliegue en el edge mediante llama.cpp. La variante "abliterated" implica que se han eliminado o atenuado los mecanismos de rechazo del modelo original, dando lugar a una version "uncensored" orientada a usos sin las restricciones de alineamiento habituales.

El modelo mantiene el soporte multilingue del LFM3 original, con 16 idiomas declarados (ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, espanol, vietnamita, tailandes, indonesio, hindi, ruso y polaco). Su tamano compacto lo hace adecuado para ejecucion en hardware de consumo, y la publicacion en GGUF con cuantizacion de precision mixta e imatrix busca maximizar la calidad por bit en ese rango de parametros.

Es relevante ahora porque combina tres tendencias: modelos pequenos de alta eficiencia para el edge, el ecosistema llama.cpp como via estandar de despliegue local, y la demanda de variantes sin censura para investigacion sobre alineamiento y comportamiento de modelos. El acceso al repositorio esta restringido (gated) y requiere aceptar condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de LFM3 de Liquid AI); detalles especificos de la arquitectura base no disponibles |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con cuantizacion de precision mixta (mixed-precision) e imatrix; niveles concretos no disponibles |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | lfm1.0 (etiquetada como "other" en los tags) |
| Formato de pesos | GGUF (libreria gguf, compatible con llama.cpp) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion GGUF del checkpoint orcarouter/LFM3-1.7B-abliterated, que a su vez parte del LFM3 de Liquid AI. La informacion disponible no detalla la arquitectura interna del LFM3 base (tipo de atencion, uso de capas recurrentes o hibridas, etc.), por lo que este apartado queda limitado a lo declarado: se trata de un transformer de aproximadamente 1,7 mil millones de parametros, con tokenizer y vocabulario multilingue que cubre 16 idiomas.

El proceso de "abliteration" consiste en modificar los pesos del modelo para eliminar la direccion de rechazo aprendida durante el alineamiento, de modo que el modelo deja de negarse a responder a ciertas peticiones. No se dispone de informacion sobre el dataset de entrenamiento original del LFM3, el numero de tokens utilizados, ni sobre las tecnicas de alineamiento (RLHF, DPO) aplicadas antes de la ablacion. La cuantizacion se ha realizado con precision mixta e imatrix, una tecnica que asigna mas bits a las capas mas sensibles para reducir la perdida de calidad respecto al modelo en punto flotante.

## Capacidades

- Generacion de texto conversacional multilingue en 16 idiomas.
- Razonamiento basico y respuesta a instrucciones, propio de un modelo de 1,7B parametros.
- Generacion de codigo y tareas de transformacion de texto, con calidad limitada por el tamano.
- Comportamiento "uncensored": ausencia o atenuacion de rechazos ante peticiones que el modelo original declinaria.
- Inferencia local en CPU y GPU mediante llama.cpp.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se declara soporte explicito de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Prototipado local de asistentes conversacionales: el modelo cabe en equipos de consumo y permite iterar rapidamente sobre prompts y flujos conversacionales sin depender de APIs externas.
- Investigacion sobre alineamiento y seguridad: la variante abliterated sirve para estudiar como se comporta un modelo sin mecanismos de rechazo, comparandolo con el original en tareas de evaluacion de sesgos y robustez.
- Generacion de texto multilingue en el edge: con soporte para 16 idiomas, es util para aplicaciones de traduccion o redaccion asistida en dispositivos con recursos limitados.
- Filtrado y clasificacion de texto: tareas de etiquetado, resumen corto o extraccion de entidades en pipelines ligeros donde no se justifica un modelo mayor.
- Educacion y experimentacion: entorno de bajo coste para aprender a desplegar modelos con llama.cpp, Ollama o servidores compatibles con GGUF.
- Generacion creativa sin restricciones de contenido: escritura de ficcion, guiones o dialogos donde el usuario necesita un modelo que no aplique filtros de rechazo, asumiendo la responsabilidad del contenido generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en torno a 1-2 GB para cuantizaciones de 4 bits (Q4_K_M), 2-3 GB para 6-8 bits, y aproximadamente 3,5 GB en FP16. El repo ocupa 6,4 GB en total por incluir varias cuantizaciones.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sobradamente, aunque el modelo esta pensado para hardware modesto.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU discreta moderna e incluso en iGPU con memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con GGUF y endpoints compatibles con la API de OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada; en un modelo de 1,7B en 4 bits se espera inferencia en tiempo real en CPU moderna y muy rapida en GPU, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-abliterated-GGUF | 1,73B | no disponible | lfm1.0 | GGUF | Variante sin censura, 16 idiomas, acceso gated |
| LFM3-1.7B (original) | 1,73B | no disponible | lfm1.0 | safetensors/GGUF | Modelo base alineado de Liquid AI |
| Qwen2.5-1.5B-Instruct | 1,54B | 32K (segun documentacion publica de Qwen) | Apache 2.0 | safetensors/GGUF | Alternativa pequena multilingue con licencia permisiva |
| Llama 3.2 1B Instruct | 1,24B | 128K (segun documentacion publica de Meta) | Llama 3.2 Community License | safetensors/GGUF | Modelo pequeno de Meta con contexto largo |

La comparativa con Qwen2.5 y Llama 3.2 se ofrece como referencia de categoria; los datos de esos modelos no provienen de la informacion proporcionada para esta ficha y deben verificarse en sus repositorios oficiales.

## Limitaciones y advertencias

- La ablacion elimina los mecanismos de rechazo, lo que aumenta el riesgo de generar contenido danino, sesgado o ilegal; no es adecuado para aplicaciones de produccion orientadas al publico general sin filtros externos.
- Riesgo elevado de alucinacion, acentuado por el tamano reducido del modelo (1,7B parametros).
- No se dispone de informacion sobre la longitud de contexto soportada, lo que impide garantizar conversaciones de contexto largo.
- La licencia lfm1.0 puede imponer restricciones al uso comercial; es necesario revisar los terminos antes de desplegar el modelo en produccion.
- El acceso al repositorio esta restringido (gated): es obligatorio aceptar las condiciones en Hugging Face.
- El rendimiento en idiomas distintos del ingles puede degradarse respecto al modelo original, y no hay benchmarks publicados que lo cuantifiquen.
- La cuantizacion GGUF introduce una perdida de calidad adicional respecto al modelo en punto flotante, aunque el uso de imatrix la mitiga.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/orcarouter/LFM3-1.7B-abliterated-GGUF
- Modelo base (abliterated): https://huggingface.co/orcarouter/LFM3-1.7B-abliterated
- Modelo original de Liquid AI: no disponible en la informacion proporcionada
- Paper o blog de LFM3: no disponible en la informacion proporcionada
- Repositorio llama.cpp: no disponible en la informacion proporcionada
