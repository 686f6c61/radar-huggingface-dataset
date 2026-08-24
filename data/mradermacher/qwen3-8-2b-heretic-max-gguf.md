# mradermacher/Qwen3.8-2B-Heretic-Max-GGUF

## Resumen

El modelo **Qwen3.8-2B-Heretic-Max-GGUF** es una colección de cuantizaciones GGUF del modelo base **MihaiPopa-1/Qwen3.8-2B-Heretic-Max**, una versión descensurada (uncensored) del modelo Qwen3.8-2B de la serie Qwen3.8. El autor de las cuantizaciones es **mradermacher**, conocido por publicar versiones GGUF de modelos open source. El modelo base ha sido sometido a un proceso de "abliteración" mediante la herramienta **Heretic**, que elimina automáticamente los mecanismos de censura aprendidos durante el entrenamiento, dando lugar a un modelo sin restricciones de contenido.

Con aproximadamente **1.880 millones de parámetros**, este modelo está orientado a entornos **edge** (dispositivos con recursos limitados) y destaca por sus capacidades de **razonamiento**, **function calling** y **distillation**. La versión GGUF permite ejecutarlo en una amplia gama de hardware, desde CPUs hasta GPUs de consumo, con cuantizaciones que van desde Q2_K (1,1 GB) hasta f16 (3,9 GB). Su licencia Apache 2.0 facilita su uso comercial sin restricciones.

La relevancia de este modelo radica en su combinación de tamaño reducido, capacidades de razonamiento y ausencia de censura, lo que lo hace atractivo para aplicaciones que requieren generación de texto sin filtros en dispositivos con poca memoria. Sin embargo, al ser una versión "heretic", debe usarse con precaución en entornos de producción donde el contenido generado pueda ser problemático.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8, no disponible detalle exacto) |
| Parametros totales | 1.881.825.088 (1,88 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el Qwen3.8-27B tiene 256 K, pero no se confirma para el 2B) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura exacta del modelo base no está documentada en la información proporcionada. El nombre "Qwen3.8" sugiere que pertenece a la serie Qwen3.8 de Alibaba, que incluye modelos como Qwen3.8-27B y Qwen3.8-Max, pero el modelo de 2B no aparece en la documentación oficial de la serie. Los tags del repositorio indican que el modelo ha pasado por un proceso de **distillation** (destilación) y **SFT** (supervised fine-tuning), lo que sugiere que fue entrenado a partir de un modelo más grande mediante destilación de conocimiento.

La característica más destacable es el proceso de **abliteración** aplicado mediante la herramienta **Heretic** (desarrollada por p-e-w). Esta técnica elimina automáticamente los mecanismos de censura aprendidos por el modelo, sin necesidad de reentrenamiento. El resultado es un modelo "descensurado" que no aplica filtros de contenido. El modelo base también incluye un componente multimodal (mmproj) que sugiere capacidades de visión, aunque no se detalla su funcionamiento.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- **Generación de texto sin censura**: el modelo ha sido abliterado, por lo que no aplica filtros de contenido ni rechaza peticiones consideradas "sensibles".
- **Razonamiento**: los tags indican capacidades de reasoning, probablemente heredadas de la serie Qwen3.8.
- **Function calling**: soporte para tool calling, lo que permite integrarlo en agentes y pipelines que requieran invocar funciones externas.
- **Multimodalidad parcial**: el repositorio incluye archivos mmproj (multi-modal supplement), lo que sugiere que el modelo base puede procesar imágenes, aunque no se detalla su implementación.
- **Optimizado para edge**: el tamaño reducido (1,88 B) y las cuantizaciones ligeras lo hacen adecuado para dispositivos con recursos limitados.
- **Idioma**: únicamente inglés (según la etiqueta `language: en`).

## Casos de uso

- **Asistentes conversacionales sin restricciones**: el modelo puede utilizarse para crear chatbots que no rechacen temas sensibles, útil en entornos de investigación o creatividad sin filtros. Su tamaño reducido permite ejecutarlo en un portátil o incluso en una Raspberry Pi con cuantizaciones bajas.
- **Generación de código con tool calling**: gracias al soporte de function calling, puede integrarse en agentes de programación que necesiten invocar APIs, ejecutar comandos o interactuar con repositorios. La cuantización Q4_K_M (1,4 GB) ofrece un buen equilibrio entre velocidad y calidad.
- **Prototipado rápido en entornos edge**: por su tamaño y las cuantizaciones disponibles, es ideal para probar aplicaciones de IA generativa en dispositivos embebidos, routers o sistemas de bajo consumo.
- **Investigación sobre alineación y censura**: al ser un modelo abliterado, sirve como caso de estudio para analizar cómo la censura afecta al comportamiento de los LLM y qué mecanismos internos la implementan.
- **Generación de contenido creativo sin filtros**: escritura de ficción, guiones o diálogos que requieran explorar temas tabú o lenguaje explícito, sin que el modelo se niegue a responder.
- **Despliegue en entornos con privacidad estricta**: al poder ejecutarse localmente con GGUF, permite procesar datos sensibles sin enviarlos a la nube, manteniendo la confidencialidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras pruebas estandarizadas para este modelo específico. El modelo base (Qwen3.8-2B) tampoco tiene resultados públicos en la documentación consultada.

## Requisitos de hardware

- **VRAM estimada**: las cuantizaciones van desde 1,1 GB (Q2_K) hasta 3,9 GB (f16). Con Q4_K_M (1,4 GB) se puede ejecutar en GPUs con 4 GB de VRAM, como la GTX 1650 o la RTX 3050.
- **GPUs recomendadas**: cualquier GPU con al menos 4 GB de VRAM es suficiente. Para las cuantizaciones más altas (Q8_0, f16) se recomienda 6-8 GB. Una RTX 3060 o superior ofrece un rendimiento fluido.
- **CPU**: las cuantizaciones Q2_K y Q3_K pueden ejecutarse en CPU con 8 GB de RAM, aunque la velocidad será limitada.
- **Opciones de despliegue**: al ser GGUF, es compatible con **llama.cpp**, **Ollama**, **LM Studio** y **llama-cpp-python**. También puede usarse con **vLLM** si se convierte a otro formato, aunque no es lo habitual.
- **Latencia y throughput**: no se dispone de datos medidos. En una GPU moderna (RTX 4090), un modelo de 2B cuantizado a Q4_K_M puede generar decenas de tokens por segundo, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-2B-Heretic-Max (GGUF) | 1,88 B | no disponible | Apache 2.0 | GGUF | Descensurado, function calling |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32 K | Apache 2.0 | GGUF, safetensors | Modelo oficial de Qwen, con censura |
| Llama-3.2-1B-Instruct | 1,23 B | 128 K | Llama 3.2 | GGUF, safetensors | Modelo de Meta, con censura |
| Phi-3-mini-4k-instruct | 3,8 B | 4 K | MIT | GGUF, safetensors | Modelo de Microsoft, con censura |

La comparativa se basa en modelos de tamaño similar disponibles en el ecosistema GGUF. El modelo heretic se diferencia por su ausencia de censura, pero carece de datos de rendimiento públicos para comparar objetivamente.

## Limitaciones y advertencias

- **Contenido sin filtrar**: al ser un modelo abliterado, puede generar contenido ofensivo, ilegal o dañino sin restricciones. No es adecuado para aplicaciones dirigidas al público general sin un sistema de moderación externo.
- **Riesgo de alucinación**: como todos los LLM, puede inventar información, especialmente en temas especializados. El tamaño reducido (2B) aumenta la probabilidad de errores factuales.
- **Idioma limitado**: solo soporta inglés, lo que limita su uso en entornos multilingües.
- **Contexto desconocido**: no se ha confirmado la longitud de contexto real, lo que puede causar fallos si se supera el límite implícito.
- **Sin benchmarks**: la ausencia de resultados de evaluación impide conocer su rendimiento real en tareas estándar.
- **Soporte comunitario**: el modelo base es de un autor independiente (MihaiPopa-1) y no tiene el respaldo de un equipo oficial, por lo que las actualizaciones y el mantenimiento son inciertos.
- **Riesgo legal**: aunque la licencia es Apache 2.0, el uso de un modelo descensurado puede violar las políticas de las plataformas donde se despliegue.

## Enlaces

- [Repositorio HuggingFace del modelo GGUF](https://huggingface.co/mradermacher/Qwen3.8-2B-Heretic-Max-GGUF)
- [Modelo base (MihaiPopa-1/Qwen3.8-2B-Heretic-Max)](https://huggingface.co/MihaiPopa-1/Qwen3.8-2B-Heretic-Max)
- [Herramienta Heretic (eliminación de censura)](https://github.com/p-e-w/heretic)
- [Repositorio oficial de Qwen3.8](https://github.com/QwenLM/Qwen3.8)
- [Documentación de Unsloth sobre Qwen3.8](https://unsloth.ai/docs/models/qwen3.8)
