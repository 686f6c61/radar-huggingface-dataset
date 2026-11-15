# mradermacher/SmolLM3-3B-Instruct-heretic-GGUF

## Resumen

SmolLM3-3B-Instruct-heretic-GGUF es una publicacion de cuantizaciones estaticas en formato GGUF del modelo SmolLM3-3B-Instruct-heretic, un derivado afinado del modelo SmolLM3 de 3B parametros de Hugging Face. El autor de esta publicacion es mradermacher, conocido por distribuir versiones cuantizadas de modelos abiertos en multiples formatos y tamanos para facilitar su despliegue en hardware modesto. El repositorio actua como espejo de un modelo "heretic", termino que en la comunidad hace referencia a variantes con el alineamiento de seguridad reducido o eliminado.

El modelo base SmolLM3 es un transformer decoder-only de 3B parametros desarrollado por Hugging Face, disenado para ofrecer un equilibrio entre calidad de razonamiento y eficiencia computacional. La variante "heretic" modifica el comportamiento de rechazo del modelo original, de modo que responde a peticiones que el modelo alineado rechazaria. Esta publicacion concreta no aporta pesos nuevos, sino conversiones del modelo original a distintos niveles de cuantizacion GGUF.

La relevancia de esta ficha es doble: por un lado, permite ejecutar un modelo de 3B en hardware de consumo mediante llama.cpp u Ollama; por otro, advierte de que se trata de una variante sin las salvaguardas habituales, lo que condiciona su uso en produccion. La informacion publicada por el autor es minima (no hay model card sustantiva, ni licencia declarada, ni idiomas especificados), por lo que muchos datos tecnicos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: transformer decoder-only, SmolLM3) |
| Parametros totales | 3B (segun nombre del modelo) |
| Parametros activos | no aplica (no es MoE, segun informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura en la model card de esta publicacion. El nombre indica que deriva de SmolLM3-3B-Instruct, un transformer decoder-only de 3B parametros del proyecto SmolLM de Hugging Face. El sufijo "heretic" indica que el modelo ha pasado por un proceso de ablacion o reentrenamiento orientado a eliminar los comportamientos de rechazo aprendidos durante el alineamiento, aunque los detalles concretos de ese proceso no estan documentados en la informacion proporcionada.

Esta publicacion es exclusivamente un repositorio de cuantizaciones: los metadatos indican `convert_type: hf` y `output_tensor_quantised: 1`, lo que confirma que los pesos se convirtieron desde el checkpoint original en formato Hugging Face a GGUF y se cuantizaron de forma estatica. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO en el modelo base o en la variante heretic.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo SmolLM3-3B-Instruct subyacente.
- Respuesta a peticiones que el modelo alineado original rechazaria, debido a la modificacion "heretic".
- Ejecucion local en CPU y GPU mediante el formato GGUF y llama.cpp.
- Multiples niveles de cuantizacion que permiten ajustar calidad frente a requisitos de memoria.
- Soporte de tool calling y agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Experimentacion en local con modelos de 3B: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar el modelo en un portatil con 8-16 GB de RAM usando llama.cpp u Ollama, sin necesidad de GPU dedicada.
- Investigacion sobre alineamiento y seguridad: la variante heretic sirve para estudiar como cambia el comportamiento de rechazo tras la ablacion, comparando respuestas con el SmolLM3-3B-Instruct original en el mismo conjunto de prompts.
- Prototipado rapido de asistentes conversacionales: al ser un modelo pequeno y cuantizado, permite iterar sobre prompts y flujos conversacionales con baja latencia en hardware modesto antes de escalar a modelos mayores.
- Evaluacion de tecnicas de cuantizacion: el repositorio incluye desde Q2_K hasta Q8_0 e IQ4_XS, lo que facilita medir la degradacion de calidad por nivel de compresion sobre las mismas tareas.
- Generacion de texto en entornos con recursos limitados: despliegue en dispositivos edge o contenedores sin GPU, usando la variante Q3_K_M o Q4_K_S para minimizar el uso de memoria.
- Analisis de sesgos y contenido sensible: util para estudiar que tipos de contenido genera un modelo sin salvaguardas y disenar filtros o politicas de moderacion alrededor de el.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (aproximada, segun tamano de 3B y cuantizacion): Q2_K en torno a 1,2-1,5 GB; Q3_K_M en torno a 1,6-2,0 GB; Q4_K_M en torno a 2,0-2,5 GB; Q5_K_M en torno a 2,4-2,9 GB; Q6_K en torno a 2,8-3,3 GB; Q8_0 en torno a 3,5-4,0 GB; f16 en torno a 6,0-6,5 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM para cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4090 para las variantes de mayor precision. En entornos profesionales, A100 o H100 no son necesarias para un modelo de este tamano.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 6-8 GB de VRAM para Q4_K_M o Q5_K_M, y en CPU con 8 GB de RAM para las variantes mas comprimidas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y otros runners compatibles con GGUF. vLLM y TGI no son la via natural para GGUF, aunque existen soportes parciales.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SmolLM3-3B-Instruct-heretic-GGUF (este) | 3B | no disponible | no disponible | GGUF | Variante heretic cuantizada |
| SmolLM3-3B-Instruct (original) | 3B | no disponible | no disponible | safetensors / GGUF | Modelo alineado de referencia |
| Qwen2.5-3B-Instruct | 3B | no disponible | no disponible | safetensors / GGUF | Alternativa de tamano similar |
| Llama-3.2-3B-Instruct | 3B | no disponible | no disponible | safetensors / GGUF | Alternativa de tamano similar |

Los datos de contexto, licencia y rendimiento de las alternativas no estan disponibles en la informacion proporcionada; la comparativa se limita al tamano y la categoria.

## Limitaciones y advertencias

- La variante heretic elimina o reduce las salvaguardas de seguridad del modelo alineado, por lo que puede generar contenido danino, ofensivo o inexacto sin rechazo.
- Riesgo elevado de alucinacion, acentuado en un modelo de 3B parametros y en las cuantizaciones mas agresivas (Q2_K, Q3_K_S).
- La licencia no esta declarada en el repositorio, lo que impide confirmar si el uso comercial esta permitido; debe verificarse en el repositorio del modelo original.
- No hay informacion sobre idiomas soportados ni sobre la calidad en castellano.
- No hay model card sustantiva ni documentacion de entrenamiento, lo que dificulta evaluar sesgos y comportamiento en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- El uso de modelos sin alineamiento en aplicaciones publicas puede incumplir politicas de plataformas y normativas de contenido.
- No se recomienda su despliegue en produccion sin una capa de moderacion y evaluacion previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/SmolLM3-3B-Instruct-heretic-GGUF
- Modelo original cuantizado: https://huggingface.co/frxstyWRLD/SmolLM3-3B-Instruct-heretic
- Perfil del autor: https://huggingface.co/mradermacher
