# richardyoung/gemma-4-31B-it-ARA-heretic-GGUF

## Resumen

`richardyoung/gemma-4-31B-it-ARA-heretic-GGUF` es una cuantizacion en formato GGUF del modelo `richardyoung/gemma-4-31B-it-ARA-heretic`, un derivado "heretic" (abliterated, sin censura) de la familia Gemma 4 de Google en su variante instruction-tuned de 31B. El autor, richardyoung, publica esta version cuantizada con tecnicas de imatrix para su uso en llama.cpp y Ollama, orientada a investigacion sobre comportamiento de modelos sin alineacion de seguridad y a despliegue en hardware de consumo.

El modelo parte de una arquitectura transformer de aproximadamente 30.700 millones de parametros (30,697,345,596 segun los safetensors del modelo base), con licencia Apache 2.0 y soporte declarado unicamente para ingles. El proceso "heretic" implica la ablacion de direcciones de rechazo en el espacio de activaciones, lo que elimina las respuestas de negativa del modelo alineado original a costa de perder parte de su comportamiento de seguridad.

Su relevancia actual radica en dos factores: por un lado, es una de las pocas cuantizaciones GGUF publicadas de una variante heretic de Gemma 4 de 31B, lo que permite ejecutar un modelo de esta escala en GPUs de consumo con cuantizaciones agresivas; por otro, el acceso esta restringido (gated), lo que exige aceptar condiciones en Hugging Face antes de descargarlo, un mecanismo habitual en modelos derivados de pesos con terminos de uso especificos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 4, instruction-tuned) |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con imatrix (niveles concretos no especificados en la informacion disponible) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp, Ollama); el modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de la familia Gemma 4 en variante instruction-tuned, con aproximadamente 30,7 mil millones de parametros. El modelo original de Google pasa por un pipeline de post-entrenamiento con datos de instrucciones y preferencias; sobre esa base, el autor aplica la tecnica "heretic" (abliterated), que consiste en identificar y ablacionar las direcciones de activacion asociadas al rechazo de peticiones, de modo que el modelo deja de producir respuestas de negativa. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas adicionales de RLHF o DPO en el derivado heretic.

La innovacion tecnica de esta publicacion concreta es la cuantizacion GGUF con matrices de importancia (imatrix), que calibra los pesos cuantizados para minimizar la perdida de calidad en las capas mas sensibles. El repositorio ocupa 68,1 GB e incluye multiples niveles de cuantizacion compatibles con llama.cpp y Ollama. No se detalla en la informacion disponible que variantes exactas (Q4_K_M, Q5_K_M, Q8_0, etc.) se incluyen.

## Capacidades

- Generacion de texto conversacional en ingles, con formato instruction-tuned.
- Razonamiento general y respuesta a instrucciones (heredado de Gemma 4 IT).
- Comportamiento sin censura: no produce rechazos ante peticiones que el modelo alineado rechazaria, por efecto de la ablacion heretic.
- Compatible con llama.cpp y Ollama, lo que permite integracion en pipelines locales.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible para esta variante cuantizada.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun los tags del repositorio.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion sobre seguridad y alineacion: el modelo permite estudiar como la ablacion de direcciones de rechazo afecta al comportamiento del modelo, comparando respuestas con la version alineada de Gemma 4 en experimentos controlados de red teaming academico.
- Evaluacion de cuantizacion con imatrix: al ser un GGUF con imatrix, sirve para medir la degradacion de calidad entre niveles de cuantizacion en un modelo de 31B, comparando perplejidad y calidad de respuesta frente al safetensors original.
- Despliegue local en estaciones de trabajo: con cuantizaciones de 4-5 bits el modelo cabe en GPUs de consumo de 24 GB (RTX 3090/4090) o en configuraciones multi-GPU, permitiendo inferencia offline sin dependencia de APIs.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o contenido narrativo donde el modelo alineado introduce rechazos o evasivas, en entornos de investigacion controlados.
- Pruebas de robustez de filtros: usar el modelo como generador adversarial para evaluar clasificadores de contenido y sistemas de moderacion en pipelines de produccion.
- Analisis de sesgos y comportamiento: estudiar como la eliminacion de la capa de rechazo afecta a la distribucion de respuestas en temas sensibles, con fines de documentacion etica y auditoria.
- Prototipado de chatbots conversacionales en ingles: gracias a su formato instruction-tuned y compatibilidad con Ollama, permite levantar un endpoint conversacional local en minutos para pruebas de UX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para 30,7B parametros, una cuantizacion de 4 bits requiere aproximadamente 16-18 GB; 5 bits, unos 20-22 GB; 8 bits, unos 32-34 GB (estimaciones estandar para modelos densos de este tamano, no confirmadas para este repositorio concreto).
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para cuantizaciones de 4-5 bits; A100 40/80 GB o H100 para 8 bits y precision completa; configuraciones multi-GPU para cuantizaciones altas.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizaciones de 4-5 bits; en GPUs de 16 GB solo con cuantizaciones de 3 bits o menores y posible offload a CPU.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con la API de llama.cpp; no se confirma soporte de vLLM o TGI para este formato GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| richardyoung/gemma-4-31B-it-ARA-heretic-GGUF | ~30,7B | no disponible | Apache 2.0 | GGUF | Variante heretic sin censura, acceso gated |
| Gemma 4 31B IT (original de Google) | ~30,7B | no disponible | Terminos de Gemma | safetensors | Modelo alineado de referencia, con rechazos |
| richardyoung/gemma-4-31B-it-ARA-heretic | ~30,7B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar del que deriva esta publicacion |
| Otras variantes heretic/abliterated de 30B | variable | no disponible | variable | GGUF/safetensors | Alternativas de la misma categoria no identificadas en la informacion disponible |

## Limitaciones y advertencias

- Modelo sin alineacion de seguridad: la ablacion heretic elimina los rechazos, por lo que puede generar contenido danino, ilegal o eticamente problematico sin filtro. No apto para produccion orientada al publico general.
- Riesgo elevado de alucinacion: como cualquier LLM de 30B, y potencialmente agravado por la perdida de calibracion tras la ablacion y la cuantizacion.
- Solo ingles: los tags del repositorio declaran unicamente `en`; el rendimiento en castellano no esta garantizado ni evaluado.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face; no es descargable de forma anonima.
- Licencia Apache 2.0 en el derivado, pero el modelo base Gemma 4 de Google tiene sus propios terminos de uso; conviene verificar la compatibilidad para uso comercial.
- La cuantizacion introduce degradacion adicional respecto al safetensors original; no se han publicado evaluaciones de calidad por nivel de cuantizacion.
- No se dispone de informacion sobre longitud de contexto, tool calling ni capacidades multimodales de esta variante.
- Uso responsable: destinado a investigacion; su despliegue en productos comerciales exige revision legal y de seguridad previa.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/gemma-4-31B-it-ARA-heretic-GGUF
- Modelo base (safetensors): https://huggingface.co/richardyoung/gemma-4-31B-it-ARA-heretic
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- Familia Gemma de Google: https://ai.google.dev/gemma
- Paper de referencia sobre ablacion heretic: no disponible en la informacion proporcionada.
