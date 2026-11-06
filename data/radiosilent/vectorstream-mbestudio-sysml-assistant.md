# radiosilent/vectorstream-mbestudio-sysml-assistant

## Resumen

MBE-30B es un modelo de generación de texto especializado en la escritura de modelos SysML v2, el lenguaje estándar de ingeniería de sistemas basada en modelos (MBSE). Lo publica el autor `radiosilent` como parte del ecosistema de MBEstudio, una herramienta de la empresa VectorStream Systems que automatiza la generación de arquitecturas de sistemas a partir de descripciones en lenguaje natural. El modelo está pensado para ejecutarse en local sobre una única GPU de 16 GB mediante Ollama.

Es importante señalar que esta primera versión **no está afinada**: se trata de Qwen3-Coder-30B-A3B-Instruct (30.500 millones de parámetros totales, 3.300 millones activos, arquitectura mixture of experts) cuantizado a Q4_K_M y empaquetado con un system prompt específico para el perfil de MBEstudio y la librería estándar de SysML v2, además de una ventana de contexto por defecto de 32.000 tokens (el estudio lo ejecuta a 64.000) y ajustes de muestreo alineados con la herramienta.

Su relevancia radica en que demuestra que un modelo generalista de código, sin entrenamiento adicional, puede producir modelos SysML v2 que compilan correctamente siempre que se le acompañe de un bucle de compilación y reparación. El autor documenta que el modelo necesita ese bucle: usado de forma aislada, sin compilador, la salida previsiblemente no compilará.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mixture of experts (MoE), base Qwen3-Coder-30B-A3B-Instruct |
| Parametros totales | 30.532.122.624 (30,5B) |
| Parametros activos | 3,3B (aproximado, según model card) |
| Longitud de contexto | 32.000 tokens por defecto; 64.000 en MBEstudio |
| Tipos de cuantizacion | Q4_K_M (única publicada) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `mbe-30b-Q4_K_M.gguf`, ~19 GB en disco) |

## Arquitectura y entrenamiento

El modelo hereda íntegramente la arquitectura de Qwen3-Coder-30B-A3B-Instruct: un transformer con mezcla de expertos (MoE) de 30.500 millones de parámetros totales y aproximadamente 3.300 millones activos por token, lo que permite un rendimiento de inferencia propio de un modelo mucho más pequeño a costa de un mayor uso de memoria. Los pesos publicados son la cuantización Q4_K_M de Unsloth, sin modificar; no hay entrenamiento adicional, destilación ni ajuste por RLHF/DPO en esta release.

La única capa de especialización es de empaquetado: un system prompt orientado al perfil de MBEstudio y a la librería estándar de SysML v2, más una configuración de muestreo y de contexto (32k por defecto, 64k en producción) que replica la del estudio. El Modelfile de Ollama utiliza el renderer y parser nativos `qwen3-coder` en lugar de la plantilla de chat del GGUF, porque esta última no permite continuar un prefill de asistente, mecanismo que MBEstudio usa para iniciar cada bloque de código. El autor indica que una futura versión afinada sustituirá a estos pesos solo si supera a esta base en la misma evaluación.

## Capacidades

- Generación de texto y de código, con especial soltura en la sintaxis de SysML v2 (paquetes, partes, requisitos, dimensiones, metadatos).
- Razonamiento estructurado para descomponer una descripción de sistema en varios paquetes SysML coherentes.
- Soporte de continuación de prefill de asistente (necesario para iniciar bloques de código desde el bucle de MBEstudio).
- Capacidad de corregir errores a partir de diagnósticos de compilador (bucle compile-and-repair), aunque el modelo por sí solo no garantiza código compilable.
- Tool calling y function calling heredados del modelo base Qwen3-Coder.
- Capacidades multilingües limitadas: la model card declara únicamente inglés.
- No dispone de visión, audio ni modo de razonamiento extendido (thinking) específico más allá del heredado del base.

## Casos de uso

- Generación de arquitecturas SysML v2 en MBEstudio: el modelo recibe un brief en lenguaje natural y produce los paquetes del sistema (por ejemplo, vehículo eléctrico de cercanías, robotaxi L4, draga de isla, aeronave de tamaño medio) que luego se compilan con el compilador de MBEstudio y se reparan iterativamente.
- Asistente de ingeniería de sistemas en local: equipos que trabajan con información sensible pueden ejecutar el modelo en una estación de trabajo con GPU de 16 GB sin enviar datos a la nube.
- Prototipado rápido de modelos de sistemas: a partir de una descripción funcional, obtener un esqueleto SysML v2 que sirva de punto de partida para revisión humana.
- Integración en pipelines CI/CD de MBSE: el modelo puede invocarse desde scripts que compilan la salida y aplican el bucle de reparación antes de aceptar un cambio en el repositorio de modelos.
- Formación y documentación: generar ejemplos didácticos de SysML v2 a partir de enunciados, siempre con validación por compilador.
- Automatización de tareas repetitivas de modelado: creación de paquetes de requisitos, definiciones de partes y metadatos siguiendo el perfil de MBEstudio.
- Evaluación comparativa de modelos para MBSE: sirve como referencia local de 30B para medir la calidad de futuros modelos afinados en la misma tarea.

## Benchmarks y rendimiento

El autor publica una evaluación del bucle completo de MBEstudio (planificar, escribir cada paquete, compilar y reparar) a 32k de contexto, con briefs reservados fuera de los ejemplos few-shot:

| Brief | Paquetes | Limpio en primera pasada | Reparaciones | Errores al final |
|---|---|---|---|---|
| Commuter EV | 3 | 0 de 3 | 2 | 0 |
| L4 robotaxi | 3 | 1 de 3 | 2 | 0 |
| Island dredger | 3 | 0 de 3 | 2 | 0 |
| Midsize aircraft | 3 | 1 de 3 | 9 | 4 (a 64k) |

El brief de aeronave de tamaño medio no cabía a 32k, por lo que se ejecutó a 64k; produjo los tres paquetes y terminó con 4 errores, todos M0604 (tres dimensiones de envolvente definidas en términos de sí mismas) que el bucle de reparación no resolvió en cuatro intentos. Esa ejecución tardó unos 27 minutos en una RTX 5080. En una ejecución anterior de la misma evaluación, `qwen3:30b`, `gpt-oss:20b` y `qwen3:14b` terminaron 0 de 4 briefs limpios. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: unos 19 GB en disco para el GGUF Q4_K_M; en una GPU de 16 GB parte del modelo se descarga a CPU.
- GPU recomendadas: RTX 5080 (referencia del autor, ~60 tokens/s a 24k-32k de contexto), RTX 4090, A100, H100 para ejecución íntegra en GPU.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB con descarga parcial a CPU; para ejecución completamente en VRAM se recomienda 24 GB o más.
- Opciones de despliegue: Ollama (soporte oficial mediante `Modelfile` con renderer `qwen3-coder`), llama.cpp y cualquier runtime compatible con GGUF; los endpoints estándar de Hugging Face son compatibles según los tags.
- Latencia y throughput: aproximadamente 60 tokens/s en RTX 5080 a contexto de 24k-32k; una ejecución completa de evaluación de tres paquetes puede tardar del orden de 27 minutos en el brief más grande.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MBE-30B | 30,5B totales / 3,3B activos | 32k (64k en MBEstudio) | SysML v2 / MBSE (vía prompt) | Apache 2.0 | GGUF en Hugging Face |
| Qwen3-Coder-30B-A3B-Instruct | 30,5B totales / 3,3B activos | 256k nativo (según ficha del base) | Código general | Apache 2.0 | Safetensors y GGUF |
| qwen3:30b | 30B (MoE) | 32k+ | Propósito general | Apache 2.0 | Ollama |
| gpt-oss:20b | 20B | no disponible | Propósito general | no disponible | Ollama |
| qwen3:14b | 14B | 32k+ | Propósito general | Apache 2.0 | Ollama |

En la evaluación del autor, los tres modelos alternativos terminaron 0 de 4 briefs limpios frente a los resultados de MBE-30B, aunque la comparación no es estrictamente equivalente porque MBE-30B se ejecuta dentro del bucle de compilación y reparación de MBEstudio.

## Limitaciones y advertencias

- No está afinado: es una cuantización de Qwen3-Coder con prompt y configuración específicos; su calidad depende en gran medida del system prompt y del bucle de compilación.
- Sin compilador en el bucle, la salida previsiblemente no compilará; el modelo no es fiable como generador de SysML v2 autónomo.
- La mayoría de errores de primera pasada son violaciones de reglas del perfil de MBEstudio (valores de metadatos con unidades, imports sin visibilidad) que requieren reparación iterativa.
- El bucle de reparación no siempre converge: en el brief de aeronave quedaron 4 errores M0604 sin resolver tras cuatro intentos.
- Idioma declarado únicamente inglés; el rendimiento en castellano no está documentado.
- Ventana de contexto efectiva de 32k por defecto; briefs grandes requieren 64k y pueden no caber.
- Riesgo de alucinación en la sintaxis y en las referencias a la librería estándar de SysML v2, mitigado solo parcialmente por el compilador.
- Licencia Apache 2.0, que permite uso comercial, pero el autor no ofrece garantías sobre la corrección de los modelos generados; se recomienda revisión humana.
- Sesgos heredados del modelo base Qwen3-Coder, no evaluados específicamente para esta release.

## Enlaces

- Hugging Face: https://huggingface.co/radiosilent/vectorstream-mbestudio-sysml-assistant
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Cuantización de origen (Unsloth): https://huggingface.co/unsloth/Qwen3-Coder-30B-A3B-Instruct-GGUF
- MBEstudio: https://studio.vectorstreamsystems.com
