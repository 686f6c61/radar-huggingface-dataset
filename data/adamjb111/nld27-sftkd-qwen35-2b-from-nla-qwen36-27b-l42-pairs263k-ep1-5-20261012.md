# adamjb111/nld27-sftkd-qwen35-2b-from-nla-qwen36-27b-L42-pairs263k-ep1.5-20261012

## Resumen

El modelo `nld27-sftkd-qwen35-2b-from-nla-qwen36-27b-L42-pairs263k-ep1.5-20261012` es un destilado de tipo student de 2B parametros, publicado por el usuario adamjb111, que reproduce el comportamiento de un "NLA" (modelo que verbaliza activaciones internas en lenguaje natural). En concreto, aprende a partir del teacher `ceselder/qwen3.6-27b-nla-rl` (iteracion 400, capa 42 de Qwen3.6-27B), un modelo de 27B que traduce vectores del residual stream a explicaciones textuales.

No es un modelo conversacional de proposito general: su entrada es un vector residual de 5120 dimensiones (salida del bloque 42, ultimo token) y su salida es una descripcion en lenguaje natural de ese vector. Un adaptador (`final_adapter.pt`) proyecta el vector a 4 slots de embedding de entrada, colocados donde el teacher situa su token marcador, y a partir de ahi el LM (un Qwen3.5-2B) genera la explicacion.

Su relevancia es de investigacion en interpretabilidad: permite sustituir un teacher de 27B por un student de 2B para verbalizar activaciones a una fraccion del coste computacional. El entrenamiento se hizo con SFT sobre 263.000 explicaciones del teacher (1,5 pasadas, lr 1e-5 con schedule coseno) y la evaluacion se reporta mediante FVE (fraccion de varianza explicada) sobre 1.020 vectores frescos de FineFineWeb.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base Qwen3.5-2B) mas adaptador de proyeccion `final_adapter.pt` que mapea un vector residual de 5120-d a 4 slots de embedding |
| Parametros totales | Aproximadamente 2B en el modelo base Qwen3.5-2B (cifra exacta del student no especificada en la informacion disponible) |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo solo contiene pesos en safetensors; no se anuncia GGUF ni otras cuantizaciones) |
| Idiomas soportados | No disponible (las explicaciones del teacher se generan sobre datos FineFineWeb, mayoritariamente en ingles, pero no se declara soporte oficial) |
| Licencia | No disponible |
| Formato de pesos | safetensors (tamano del repo: 4,0 GB) |

## Arquitectura y entrenamiento

El student combina dos piezas: un modelo de lenguaje Qwen3.5-2B y un adaptador (`Adapter` en `scripts/nladistil27b_common_20261010.py`) que recibe la salida del bloque 42 de Qwen3.6-27B (vector de 5120 dimensiones, ultimo token) y la proyecta a 4 slots de embedding. Esos cuatro slots se insertan en la posicion que ocupa el token marcador del teacher dentro del prompt, de modo que el LM genera la explicacion condicionada a esa representacion. La implementacion del student esta en la clase `Student` de `scripts/nladistil27b_train_student_20261010.py`, dentro del repositorio lenses del autor.

El entrenamiento es una destilacion supervisada (SFT) sobre 263.000 explicaciones generadas por el teacher. Se usan tokens muestreados junto con los top-20 soft targets del teacher con un peso de 0,5, durante 1,5 pasadas con learning rate 1e-5 y schedule coseno. Los datos de destilacion estan publicados en `adamjb111/nla-qwen36-27b-L42-distill-data`. No se menciona RLHF, DPO ni ninguna fase de alineacion adicional en la informacion disponible.

## Capacidades

- Verbalizacion de activaciones: dada una representacion residual de la capa 42 de Qwen3.6-27B (5120-d, ultimo token), produce una explicacion en lenguaje natural de su contenido.
- Generacion de texto condicionada a un vector: el LM subyacente escribe la explicacion, no el vector directamente.
- Destilacion de un teacher de 27B a un student de 2B, con el objetivo de abaratar la interpretabilidad a escala.
- Evaluacion mediante FVE (fraccion de varianza explicada) usando el AR del teacher sobre vectores reservados.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, uso como agente, modo thinking, vision, audio ni capacidades multilingues declaradas.
- No se documenta uso como asistente conversacional de proposito general.

## Casos de uso

- Investigacion en interpretabilidad mecanicista: usar el student como sustituto barato del teacher para verbalizar activaciones de la capa 42 de Qwen3.6-27B y explorar que conceptos codifica esa capa en distintos corpus.
- Auditoria de seguridad a escala: procesar grandes lotes de vectores residuales y generar explicaciones automaticas para detectar representaciones asociadas a contenido problematico sin ejecutar el teacher de 27B en cada paso.
- Generacion de datasets de interpretabilidad: emplear las explicaciones del student como etiquetado debil para entrenar clasificadores o para construir corpus anotados semanticamente a partir de activaciones.
- Comparacion teacher-student: medir la perdida de fidelidad (FVE) al sustituir el teacher por el student, lo que sirve como referencia metodologica para futuras destilaciones de lentes de activacion.
- Analisis de deriva de representaciones: alimentar vectores extraidos en distintos checkpoints del mismo modelo base y comparar las explicaciones para estudiar como evoluciona una representacion durante el entrenamiento.
- Educacion y divulgacion: ilustrar en articulos y cursos como se puede describir en lenguaje natural una direccion del espacio de activaciones, con un coste de inferencia bajo en hardware de consumo.
- Monitorizacion interna en pipelines de investigacion: integrar el adaptador como etapa de inspeccion sobre las activaciones de un modelo mayor para generar informes textuales periodicos sobre su estado representacional.

## Benchmarks y rendimiento

La unica metrica reportada en la informacion disponible es la FVE del teacher sobre 1.020 vectores frescos de FineFineWeb. El valor del student se remite al fichero `done.json`, que no se incluye en el material proporcionado.

| Metrica | Teacher (NLA Qwen3.6-27B, capa 42) | Student (Qwen3.5-2B destilado) |
|---|---|---|
| FVE en held-out (1.020 vectores FineFineWeb) | 0,754 | No disponible en la informacion proporcionada |

No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K en la informacion disponible, y en cualquier caso no serian aplicables a un modelo que no es un asistente generalista.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16 los pesos del student de 2B ocupan aproximadamente 4 GB, coherente con el tamano del repo (4,0 GB). Con overhead de activaciones y el adaptador, un presupuesto practico de 5-7 GB de VRAM es razonable.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, L4, A10). Para lotes grandes o procesado masivo de vectores, A100 o H100 reducen el tiempo total.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas de VRAM, dado el tamano de 2B.
- Opciones de despliegue: al incorporar un adaptador personalizado, lo mas directo es cargar los pesos con Transformers y el codigo propio del repositorio lenses (`Student` y `Adapter`). No hay evidencia en la informacion disponible de compatibilidad con vLLM, llama.cpp, Ollama o TGI, y el adaptador no parece convertible a formatos GGUF estandar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Funcion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nld27-sftkd-qwen35-2b (este modelo) | ~2B | Verbalizacion de activaciones (capa 42 de Qwen3.6-27B) | No disponible | No disponible | HuggingFace, 6 descargas |
| ceselder/qwen3.6-27b-nla-rl (teacher) | 27B | Verbalizacion de activaciones | No disponible | No disponible | HuggingFace |
| Qwen3.5-2B (modelo base) | 2B | Modelo de lenguaje generalista | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | HuggingFace |

No se dispone de datos de licencia, contexto ni rendimiento de los modelos comparables en la informacion proporcionada que permitan una comparacion cuantitativa detallada. La comparativa se limita por tanto a funcion y tamano.

## Limitaciones y advertencias

- Dominio de entrada muy restringido: el student solo acepta vectores residuales de 5120 dimensiones procedentes de la salida del bloque 42 (ultimo token) de Qwen3.6-27B. No funciona con activaciones de otras capas, otros modelos ni otras dimensionalidades sin reentrenamiento.
- Fidelidad no verificada en la informacion disponible: no se aporta el valor de FVE del student, solo el del teacher (0,754). La calidad real de las explicaciones del student no puede evaluarse con los datos publicados.
- Riesgo de alucinacion: al ser un modelo de lenguaje generando texto sobre una representacion latente, puede producir explicaciones plausibles pero incorrectas sobre el contenido real del vector.
- Licencia no declarada: no se especifica licencia en la model card, lo que impide confirmar si el uso comercial esta permitido. Conviene tratarlo como restringido hasta aclaracion.
- Idiomas: no se declara soporte multilingue; los datos de entrenamiento provienen de FineFineWeb y las explicaciones del teacher, por lo que el idioma de salida esperado es el ingles.
- Requiere `trust_remote_code` o la carga manual de las clases `Student` y `Adapter` del repositorio lenses, ya que el modelo depende de codigo personalizado no estandar en Transformers.
- Reputacion y validacion: 6 descargas y 0 likes en el momento de la consulta, sin publicacion asociada ni resultados de benchmarks independientes. Es un artefacto de investigacion, no un modelo listo para produccion.
- Contexto de uso limitado: no hay evidencia de soporte de tool calling, agentes, vision, audio ni modo thinking; no debe usarse como sustituto de un asistente generalista.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adamjb111/nld27-sftkd-qwen35-2b-from-nla-qwen36-27b-L42-pairs263k-ep1.5-20261012
- Teacher (NLA Qwen3.6-27B RL): https://huggingface.co/ceselder/qwen3.6-27b-nla-rl
- Dataset de destilacion: https://huggingface.co/datasets/adamjb111/nla-qwen36-27b-L42-distill-data
- Codigo de entrenamiento y adaptador: `scripts/nladistil27b_train_student_20261010.py` y `scripts/nladistil27b_common_20261010.py` en el repositorio lenses del autor (URL del repositorio no disponible en la informacion proporcionada)
- BenchLM, comparador de benchmarks de modelos: https://benchlm.ai/
- Guia de despliegue de la familia Qwen3.5 (27B, 122B, 397B) en RTX 6000 Blackwell: https://deepwiki.com/local-inference-lab/rtx6kpro/5.1-qwen3.5-27b-122b-and-397b-deployment
- Guia de la serie Qwen3.5 2026 (Flash, 27B, 35B-A3B): https://explore.n1n.ai/blog/qwen3-5-model-series-2026-guide-2026-02-25
- Repositorio QwenLM/Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Guia de vLLM en Blackwell (lastloop-ai): https://github.com/lastloop-ai/vllm-blackwell-guide
