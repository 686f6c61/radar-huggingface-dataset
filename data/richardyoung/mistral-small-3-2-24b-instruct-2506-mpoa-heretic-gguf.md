# richardyoung/Mistral-Small-3.2-24B-Instruct-2506-MPOA-heretic-GGUF

## Resumen

Este repositorio contiene una cuantizacion en formato GGUF del modelo richardyoung/Mistral-Small-3.2-24B-Instruct-2506-MPOA-heretic, una variante modificada de Mistral Small 3.2 24B Instruct (version 2506) de Mistral AI. La modificacion aplica la tecnica conocida como "abliteration" o "heretic", orientada a eliminar los mecanismos de rechazo y moderacion del modelo original, dando lugar a una version "uncensored" pensada para investigacion. El autor del repositorio es richardyoung, que publica la version cuantizada lista para su uso con llama.cpp y Ollama.

El modelo base conserva la arquitectura transformer densa de Mistral Small 3.2, con aproximadamente 23.570 millones de parametros totales, y esta especializado en generacion de texto conversacional. La cuantizacion GGUF utiliza tecnicas de imatrix para preservar la calidad en precisiones reducidas, lo que facilita su despliegue en hardware de consumo. El repositorio tiene un tamano de 39,4 GB, lo que sugiere la presencia de multiples niveles de cuantizacion.

Es relevante ahora porque ofrece una alternativa sin restricciones de contenido para experimentacion en entornos controlados, aunque su acceso esta restringido (gated) y requiere aceptar condiciones en Hugging Face. La licencia declarada es Apache 2.0, pero las implicaciones de la modificacion "uncensored" deben evaluarse con cautela en contextos de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Mistral Small 3.2) |
| Parametros totales | 23.572.403.200 (~23,57 mil millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF con imatrix (multiples niveles, no especificados) |
| Idiomas soportados | Ingles (segun metadatos) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp, Ollama) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer densa de Mistral Small 3.2 24B Instruct, una familia de modelos de Mistral AI disenada para generacion de texto y conversacion. La variante "MPOA-heretic" aplica una modificacion post-entrenamiento orientada a la eliminacion de direcciones de activacion asociadas al rechazo de solicitudes (abliteration), lo que reduce la tendencia del modelo a declinar peticiones. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO en esta variante especifica.

La cuantizacion GGUF se ha realizado con tecnicas de imatrix, que calibran los pesos cuantizados mediante una matriz de importancia derivada de datos de calibracion, mejorando la fidelidad respecto a cuantizaciones estandar en precisiones bajas. El repositorio incluye referencias a un paper (arxiv:2611.17846) relacionado con el proceso, aunque no se detalla su contenido en la informacion disponible.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento y respuesta a instrucciones en ingles.
- Generacion de codigo y matematicas (heredadas del modelo base Mistral Small 3.2).
- Modo "uncensored": menor tendencia a rechazar solicitudes, orientado a investigacion.
- Compatibilidad con llama.cpp y Ollama para despliegue local.
- Soporte de endpoints compatibles (tag `endpoints_compatible`).
- Capacidades de tool calling y function calling: no confirmadas en la informacion disponible para esta variante.
- Capacidades multimodales (vision): no confirmadas en la informacion disponible.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el comportamiento de sistemas sin mecanismos de rechazo, comparando respuestas con la version original para analizar sesgos y riesgos.
- Experimentacion con cuantizaciones GGUF: util para evaluar la degradacion de calidad en distintos niveles de cuantizacion con imatrix en un modelo de ~24B.
- Despliegue local en entornos de desarrollo: gracias al formato GGUF y compatibilidad con Ollama, se puede integrar en flujos de trabajo personales sin infraestructura cloud.
- Generacion de texto creativo sin restricciones: para proyectos de escritura que requieran respuestas sin filtros de contenido, en entornos controlados.
- Evaluacion de tecnicas de abliteration: sirve como referencia para comparar metodologias de eliminacion de rechazo en modelos de gran tamano.
- Pruebas de robustez y red teaming: permite generar respuestas adversarias para evaluar sistemas de moderacion y filtros de seguridad en pipelines propios.
- Fine-tuning posterior: al estar en GGUF, no es ideal para reentrenamiento, pero la version base en safetensors del modelo padre podria usarse para adaptaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de ~23,57B parametros, se requiere aproximadamente 47 GB en FP16, ~24 GB en cuantizacion de 8 bits, ~14-16 GB en Q4_K_M y ~10-12 GB en Q3. Las cifras exactas dependen del nivel de cuantizacion incluido en el repositorio (39,4 GB totales sugieren varios niveles).
- GPU recomendadas: A100 40/80 GB o H100 para precision completa; RTX 4090 (24 GB) para cuantizaciones Q8 o Q4; RTX 3090 (24 GB) similar.
- Cabe en GPU de consumo: si, en cuantizaciones Q4 o inferiores en GPUs con 16-24 GB de VRAM (RTX 4080, 4090, 3090). En Q2/Q3 podria caber en 12 GB.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF. No se menciona soporte para vLLM o TGI en formato GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mistral-Small-3.2-24B-Instruct-2506-MPOA-heretic-GGUF (este) | ~23,57B | No disponible | Apache 2.0 | GGUF | Variante uncensored, acceso restringido |
| Mistral Small 3.2 24B Instruct (original) | ~23,57B | No disponible | Apache 2.0 | Safetensors | Modelo base con alineacion estandar |
| Modelos abliterated similares (p. ej., variantes de Llama 3) | Variable | Variable | Variable | GGUF/Safetensors | Alternativas uncensored de otros autores |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- La modificacion "uncensored" elimina mecanismos de rechazo, lo que aumenta el riesgo de generar contenido danino, sesgado o inapropiado; no apto para produccion sin filtros adicionales.
- Riesgo elevado de alucinacion, comun en modelos de este tamano y acentuado por la falta de alineacion.
- Soporte limitado de idiomas: solo ingles segun metadatos; el rendimiento en castellano no esta garantizado.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita su distribucion automatica.
- Licencia Apache 2.0 declarada, pero la naturaleza del modelo puede entrar en conflicto con politicas de uso aceptable en plataformas comerciales; revisar terminos del modelo base de Mistral AI.
- No se dispone de informacion sobre la longitud de contexto, lo que impide planificar cargas con ventanas largas.
- El formato GGUF no es adecuado para fine-tuning directo; requiere conversion a safetensors.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Mistral-Small-3.2-24B-Instruct-2506-MPOA-heretic-GGUF
- Modelo base (referencia): https://huggingface.co/richardyoung/Mistral-Small-3.2-24B-Instruct-2506-MPOA-heretic
- Paper referenciado: arxiv:2611.17846 (no se dispone de URL directa en la informacion)
- Repositorio llama.cpp: no disponible en la informacion
- Ollama: no disponible en la informacion
