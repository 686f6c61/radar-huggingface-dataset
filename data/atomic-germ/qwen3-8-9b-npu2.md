# Atomic-Germ/Qwen3.8-9B-NPU2

## Resumen

Qwen3.8-9B-NPU2 es una cuantizacion GGUF del modelo Qwen3.8-9B, desarrollado por Empero y publicado en Hugging Face por Atomic-Germ. Se trata de una destilacion de parametros completos del modelo Qwen3.8 2.4T A95B (el Qwen3.8-Max, de 2,4 billones de parametros) sobre la arquitectura Qwen3.5-9B, lo que permite conservar gran parte de las capacidades de razonamiento del modelo gigante en un paquete de unos 9.200 millones de parametros.

El modelo emplea una arquitectura hibrida con capas Gated DeltaNet intercaladas con capas de atencion completa, y se entreno sobre aproximadamente 70.000 trazas de profesor curadas. Esta cuantizacion GGUF permite ejecutarlo en runtimes estandar como llama.cpp, Ollama, LM Studio, Jan o KoboldCpp, con cinco niveles de cuantizacion que van desde Q4_K_M hasta BF16. Es un modelo de razonamiento: cada respuesta se abre con un bloque de pensamiento que debe separarse de la respuesta final.

La relevancia actual del modelo radica en ofrecer un rendimiento muy superior al del modelo base Qwen3.5-9B en conocimiento general (MMLU +0,205 puntos) con un coste de inferencia muy inferior al del modelo profesor de 2,4 billones de parametros, y con licencia Apache-2.0 que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: Gated DeltaNet + atencion completa (arquitectura Qwen3.5-9B) |
| Parametros totales | 9.197.093.888 (~9,2 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la documentacion menciona soporte de contexto largo, pero no especifica el valor exacto) |
| Tipos de cuantizacion | Q4_K_M (5,78 GB), Q5_K_M (6,64 GB), Q6_K (7,56 GB), Q8_0 (9,79 GB), BF16 (18,41 GB) |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo fuente Qwen3.8-9B es una destilacion de parametros completos del modelo Qwen3.8 2.4T A95B sobre la arquitectura Qwen3.5-9B. La arquitectura Qwen3.5 es hibrida: por cada capa de atencion completa hay tres capas Gated DeltaNet, un mecanismo de estado recurrente que reduce el coste del cache de atencion manteniendo la capacidad de modelar dependencias de largo alcance.

El entrenamiento se realizo sobre aproximadamente 70.000 trazas de profesor curadas, procedentes de los datasets internos de destilacion de Qwen3.8 de Empero. El modelo resultante es de tipo razonamiento: cada respuesta se abre con un bloque de pensamiento que debe separarse de la respuesta final para el usuario. Esta cuantizacion GGUF se genero con llama.cpp y conserva la plantilla de chat embebida en el archivo.

## Capacidades

- Generacion de texto y razonamiento con cadena de pensamiento (CoT) explicita.
- Conocimiento general: 0,751 en MMLU (57 materias, CoT), frente a 0,546 del modelo base Qwen3.5-9B.
- Matematicas: 0,870 en GSM8K con CoT.
- Modo de razonamiento: el modelo genera un bloque de pensamiento antes de cada respuesta, que puede extraerse para depuracion o descartarse para el usuario final.
- Capacidades multilingues: no disponibles; el modelo declara soporte solo para ingles.
- Sin soporte declarado de tool calling, vision ni audio en la informacion proporcionada.

## Casos de uso

- Inferencia local de alto rendimiento en hardware de consumo: con la cuantizacion Q4_K_M (5,78 GB) el modelo cabe en tarjetas de 8-12 GB, lo que permite ejecutar un modelo de razonamiento de nivel Qwen3.8 en un equipo personal con llama.cpp u Ollama.
- Generacion de texto con razonamiento auditable: el bloque de pensamiento permite inspeccionar el proceso de razonamiento del modelo antes de la respuesta final, util en aplicaciones de explicabilidad y depuracion de salidas.
- Educacion y tutoria: el modelo puede explicar pasos intermedios en problemas de matematicas (GSM8K 0,870) y ofrecer razonamientos detallados paso a paso en ingles.
- Prototipado de aplicaciones conversacionales: la plantilla de chat embebida y el soporte en Ollama, LM Studio y Jan facilitan el despliegue rapido de asistentes conversacionales en ingles sin infraestructura en la nube.
- Investigacion en destilacion de modelos: el modelo es un ejemplo de destilacion full-parameter de un modelo de 2,4 billones de parametros a 9.200 millones, y puede servir como referencia para estudios de transferencia de capacidades entre arquitecturas.
- Evaluacion comparativa de cuantizaciones: los cinco niveles de cuantizacion publicados permiten medir el compromiso calidad/tamano en una misma arquitectura y decidir el punto optimo para cada despliegue.

## Benchmarks y rendimiento

Los resultados publicados corresponden al modelo fuente Qwen3.8-9B (no a las cuantizaciones GGUF) y se obtuvieron con lm-evaluation-harness, con protocolos de cadena de pensamiento y ajustes identicos para el modelo base y el destilado:

| Tarea | Qwen3.5-9B (base) | Qwen3.8-9B | Diferencia |
|---|---:|---:|---:|
| MMLU (CoT, 57 materias) | 0,546 | 0,751 | +0,205 |
| GSM8K (CoT) | 0,885 | 0,870 | -0,015 |

No se han publicado resultados de benchmarks para las cuantizaciones GGUF concretas de este repositorio.

## Requisitos de hardware

- Q4_K_M (5,78 GB) y Q5_K_M (6,64 GB): comodos en tarjetas de 8-12 GB para uso cotidiano.
- Q6_K (7,56 GB) y Q8_0 (9,79 GB): recomendadas tarjetas de 12-16 GB.
- BF16 (18,41 GB): requiere 24 GB o mas.
- El cache KV es el coste dominante en contexto largo; puede requerir descarga a CPU incluso con cuantizaciones ligeras de pesos.
- Runtimes soportados: llama.cpp (requiere una version reciente con soporte de Qwen3.5 / Gated DeltaNet), Ollama, LM Studio, Jan, KoboldCpp.
- Parametros de muestreo recomendados: temperatura 0,6, top-p 0,95, top-k 20.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | MMLU (CoT) | GSM8K (CoT) | Licencia |
|---|---:|---|---:|---:|---|
| Qwen3.8-9B (este) | 9,2 B | Hibrida Gated DeltaNet | 0,751 | 0,870 | Apache-2.0 |
| Qwen3.5-9B (base) | 9 B | Hibrida Gated DeltaNet | 0,546 | 0,885 | Apache-2.0 |
| Qwen3.8 2.4T A95B (profesor) | 2,4 T | Hibrida (MoE) | no disponible | no disponible | no disponible |

La comparativa con el profesor Qwen3.8 2.4T A95B no esta disponible en la informacion proporcionada. El dato relevante es la mejora de +0,205 puntos en MMLU frente al modelo base Qwen3.5-9B, que demuestra la eficacia de la destilacion.

## Limitaciones y advertencias

- Requiere una version reciente de llama.cpp con soporte de arquitectura Qwen3.5 / Gated DeltaNet; las versiones antiguas no cargaran el modelo.
- Solo soporta ingles de forma declarada; no se garantiza rendimiento en otros idiomas.
- Es un modelo de razonamiento: todas las respuestas se abren con un bloque de pensamiento que debe extraerse antes de mostrar la respuesta al usuario final.
- El cache KV domina el coste en contexto largo; puede ser necesario descargar capas a CPU, lo que degrada la latencia.
- No se han publicado evaluaciones de sesgos, alucinacion ni seguridad para este modelo.
- Los benchmarks publicados corresponden al modelo fuente en precision completa, no a las cuantizaciones GGUF; el rendimiento real puede variar segun el nivel de cuantizacion.
- No se declara soporte de tool calling, vision ni audio.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/Atomic-Germ/Qwen3.8-9B-NPU2
- Modelo fuente: https://huggingface.co/empero-ai/Qwen3.8-9B
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Web de Empero: https://empero.org
- Informacion sobre Qwen3.8: https://openlm.ai/qwen3.8/
- Serie Qwen3: https://github.com/QwenLM/Qwen3
