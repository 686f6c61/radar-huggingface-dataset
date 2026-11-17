# DOFM/gpt-oss-20b

## Resumen
gpt-oss-20b es un modelo de lenguaje de pesos abiertos desarrollado por OpenAI, publicado bajo licencia Apache 2.0 y disenado para razonamiento, tareas agenticas y casos de uso generales con baja latencia. Se trata de un transformer con arquitectura Mixture-of-Experts (MoE) de 21.000 millones de parametros totales y 3.600 millones de parametros activos por token, lo que permite ejecutarlo en hardware de consumo. El repositorio analizado (DOFM/gpt-oss-20b) es una copia o espejo del modelo oficial openai/gpt-oss-20b, sin descargas ni interacciones registradas en el momento de la consulta.

El modelo se entreno con el formato de respuesta harmony de OpenAI y debe usarse con dicho formato para funcionar correctamente. Incorpora cuantizacion MXFP4 en los pesos del MoE, lo que reduce los requisitos de memoria hasta aproximadamente 16 GB, y expone un modo de razonamiento configurable (low, medium, high) con acceso completo a la cadena de pensamiento. Es relevante por combinar licencia permisiva, capacidades agenticas nativas (function calling, navegacion web, ejecucion de codigo Python y salidas estructuradas) y un tamano que cabe en GPU de consumo.

La ficha se basa en la informacion disponible del repositorio y en la model card referenciada. Los datos no confirmados se indican como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Experts (MoE) |
| Parametros totales | 20.914.757.184 (aproximadamente 21B) |
| Parametros activos | 3.600 millones (3,6B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (pesos del MoE, aplicada en post-entrenamiento); soporte de 8-bit segun tags del repo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 41,3 GB) |

## Arquitectura y entrenamiento
gpt-oss-20b es un transformer con capas Mixture-of-Experts: de los aproximadamente 21.000 millones de parametros totales, solo 3.600 millones se activan por token, lo que reduce el coste computacional por paso de inferencia frente a un modelo denso del mismo tamano. Los pesos del MoE se cuantizaron en MXFP4 durante el post-entrenamiento, y todas las evaluaciones publicadas por OpenAI se realizaron con esa misma cuantizacion, de modo que el rendimiento reportado corresponde a la version cuantizada.

El modelo se entreno con el formato harmony, un esquema de respuesta que estructura los turnos de sistema, usuario y asistente, e incluye canales separados para el razonamiento interno. No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el detalle de las fases de RLHF o DPO. La model card indica que el modelo es ajustable mediante fine-tuning de parametros y que expone la cadena de pensamiento completa para depuracion.

## Capacidades
- Generacion de texto conversacional multi-turno.
- Razonamiento con esfuerzo configurable (low, medium, high) para ajustar latencia frente a profundidad.
- Cadena de pensamiento completa y accesible, no destinada a mostrarse al usuario final.
- Function calling y tool calling nativos.
- Capacidades agenticas: navegacion web y ejecucion de codigo Python.
- Salidas estructuradas (Structured Outputs).
- Fine-tuning completo de parametros.
- Compatibilidad con el formato harmony, obligatorio para el funcionamiento correcto.
- Capacidades multilingues: no disponible el detalle de idiomas soportados.
- Vision y audio: no disponibles.

## Casos de uso
- Asistentes de codigo en local: el modelo puede generar y revisar codigo y ejecutar Python en un sandbox, lo que permite integrarlo en entornos de desarrollo sin enviar datos a la nube.
- Automatizacion de flujos agenticos: con function calling y salidas estructuradas, se puede orquestar llamadas a APIs y herramientas en pipelines multi-paso.
- Razonamiento con presupuesto de latencia: el modo de esfuerzo bajo permite respuestas rapidas en produccion, mientras que el modo alto se reserva para tareas complejas de analisis.
- Despliegue en hardware de consumo: al caber en aproximadamente 16 GB de memoria con MXFP4, es viable en estaciones de trabajo con GPU de gama alta para prototipado y uso personal.
- Generacion de documentacion y resumenes: la ventana de contexto no esta confirmada, pero el modelo esta orientado a tareas de texto generales con contexto conversacional.
- Fine-tuning para dominios especializados: al ser Apache 2.0 y ajustable, se puede adaptar a vocabularios y tareas concretas sin restricciones de copyleft.
- Depuracion de razonamiento: el acceso a la cadena de pensamiento facilita auditar por que el modelo llego a una conclusion en entornos de investigacion.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- Memoria estimada: aproximadamente 16 GB con cuantizacion MXFP4, segun la model card.
- GPU recomendadas: NVIDIA H100 o AMD MI300X para la variante de 120B; para el modelo de 20B, GPU de consumo de gama alta con al menos 16 GB de VRAM.
- Cabe en GPU de consumo: si, con MXFP4 y al menos 16 GB de memoria.
- Opciones de despliegue: Transformers, vLLM (version 0.10.1+gptoss), Ollama (`gpt-oss:20b`), LM Studio, PyTorch/Triton y servidor compatible con OpenAI (`transformers serve`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpt-oss-20b | 21B | 3,6B | no disponible | Apache 2.0 | Hugging Face, Ollama, LM Studio |
| gpt-oss-120b | 117B | 5,1B | no disponible | Apache 2.0 | Hugging Face, Ollama |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion directa documentada en la informacion disponible es con gpt-oss-120b, la variante mayor de la misma familia, orientada a produccion y razonamiento de alta exigencia en una sola GPU de 80 GB. No se dispone de datos de benchmarks para comparar con modelos de terceros.

## Limitaciones y advertencias
- El modelo solo funciona correctamente con el formato harmony; usarlo con otro formato produce resultados incorrectos.
- La cadena de pensamiento no debe mostrarse al usuario final, segun la model card.
- Riesgo de alucinacion no cuantificado en la informacion disponible.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles, lo que limita la evaluacion de cobertura multilingue.
- Longitud de contexto: no disponible, lo que impide planificar cargas con documentos largos.
- Licencia Apache 2.0 permisiva para uso comercial, sin restricciones de copyleft ni riesgo de patentes segun la model card.
- El repositorio DOFM/gpt-oss-20b es una copia sin descargas ni validacion de la comunidad; para produccion conviene usar el repositorio oficial openai/gpt-oss-20b.
- La cuantizacion MXFP4 es la unica evaluada oficialmente; otros formatos pueden alterar el rendimiento.

## Enlaces
- Repositorio analizado: https://huggingface.co/DOFM/gpt-oss-20b
- Repositorio oficial: https://huggingface.co/openai/gpt-oss-20b
- Modelo mayor: https://huggingface.co/openai/gpt-oss-120b
- Coleccion gpt-oss: https://huggingface.co/collections/openai/gpt-oss-68911959590a1634ba11c7a4
- Sitio del proyecto: https://gpt-oss.com
- Blog de OpenAI: https://openai.com/index/introducing-gpt-oss/
- Paper (arXiv:2508.10925): https://arxiv.org/abs/2508.10925
- Repositorio GitHub: https://github.com/openai/gpt-oss
- Formato harmony: https://github.com/openai/harmony
- Cookbook: https://cookbook.openai.com/topic/gpt-oss
- Guia de Transformers: https://cookbook.openai.com/articles/gpt-oss/run-transformers
- Guia de vLLM: https://cookbook.openai.com/articles/gpt-oss/run-vllm
- Guia de Ollama: https://cookbook.openai.com/articles/gpt-oss/run-locally-ollama
- Lista de recursos: https://github.com/openai/gpt-oss/blob/main/awesome-gpt-oss.md
