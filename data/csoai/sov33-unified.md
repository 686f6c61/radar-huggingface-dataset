# csoai/sov33-unified

## Resumen

`sov33-unified` es un repositorio de Hugging Face publicado por el usuario `csoai` que contiene una copia de los pesos GGUF del modelo stock `llama3.2:3b` de Ollama, es decir, Meta Llama 3.2 3B Instruct cuantizado en Q4_K_M. No se trata de un modelo nuevo ni de un fine-tune: la propia model card corrige, con fecha 29 de septiembre de 2026, afirmaciones anteriores sobre un supuesto ajuste fino y confirma que los pesos son byte a byte idénticos a los distribuidos por Ollama (sha256 `dde5aa3fc5ffc17176b5e8bdc82f587b24b2678c6c66101bf7da77af9f7ccdff`). El nombre `sov33-unified` es una etiqueta del repositorio, no una identidad de modelo distinta.

El modelo subyacente, Llama 3.2 3B Instruct, es un transformer decoder-only de Meta con 3.212.749.888 parámetros, entrenado para instrucciones y conversación, con una ventana de contexto de 128.000 tokens según la documentación oficial de Meta. La relevancia de esta ficha no está en el modelo en sí, ampliamente conocido, sino en el caso de gobernanza que documenta: un repositorio que llegó a presentarse como modelo especializado de un consejo (CSOAI) y que fue corregido públicamente tras una comparación de hashes contra el registro de Ollama.

El repositorio ocupa 2,0 GB e incluye únicamente el GGUF, la licencia Llama 3.2 Community License, el archivo `USE_POLICY.md` y un `NOTICE` de atribución. La model card publica además una medición propia (2 de noviembre de 2026) sobre clasificación de gobernanza según el EU AI Act, con resultados por debajo de la línea base, lo que refuerza la conclusión de que estos pesos no incorporan ninguna habilidad específica más allá de las del modelo original de Meta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2, según modelo base Meta) |
| Parametros totales | 3.212.749.888 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (modelo base Llama 3.2 3B Instruct, según Meta); no verificado en este repositorio |
| Tipos de cuantizacion | Q4_K_M (único formato publicado en el repo) |
| Idiomas soportados | no disponible en la información del repositorio; el modelo base de Meta declara 8 idiomas oficiales (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | Llama 3.2 Community License (copia byte a byte de la de Meta) |
| Formato de pesos | GGUF (2.019.377.376 bytes, sha256 `dde5aa3f...f7ccdff`) |

## Arquitectura y entrenamiento

El repositorio no entrena ni modifica nada: aloja los pesos stock de Llama 3.2 3B Instruct en cuantización Q4_K_M, tal como los distribuye Ollama bajo la etiqueta `llama3.2:3b`. La arquitectura es, por tanto, la del modelo base de Meta: un transformer decoder-only con atención por grupos (GQA) y RoPE, optimizado para despliegue en dispositivos de borde. La model card es explícita: "No fine-tune, no merge, no training of any kind", y no se incluye Modelfile ni overlay de prompt; cualquier comportamiento específico provendría exclusivamente de un system prompt aportado en tiempo de ejecución.

La card documenta dos correcciones formales. La primera (29 de septiembre de 2026) desmiente un supuesto ajuste fino tras comparar el sha256 del LFS del repositorio con el digest del manifiesto del registro de Ollama. La segunda (7 de octubre de 2026) elimina las referencias a un "modelo especialista del consejo CSOAI" y las cifras de un panel que, según la propia card, no listaba ninguno de los repos `sov*`. Como innovación técnica no hay ninguna aportada por este repositorio; la única contribución es de trazabilidad y transparencia sobre la procedencia de los pesos.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Llama 3.2 3B Instruct.
- Razonamiento básico e instrucciones en lenguaje natural, con calidad propia de un modelo de 3B parámetros.
- Generación de código y matemáticas elementales, limitada por el tamaño del modelo.
- Soporte de tool calling y function calling según las capacidades declaradas por Meta para Llama 3.2 Instruct.
- Capacidades multilingües según el modelo base (8 idiomas oficiales de Meta); el repositorio no las verifica ni las restringe.
- Sin visión, sin audio y sin modo "thinking" explícito.
- Sin ninguna habilidad específica de gobernanza o clasificación normativa: la medición publicada el 2 de noviembre de 2026 concluye que los pesos stock no siguen una instrucción de etiqueta única (0/100 respuestas parseables en texto libre).

## Casos de uso

- Despliegue local de un asistente conversacional: al ser un GGUF Q4_K_M de 2 GB, se puede ejecutar con Ollama en un portátil convencional para prototipos de chat sin depender de la nube.
- Clasificación con salida restringida: la card documenta el uso de decodificación con esquema JSON para forzar etiquetas; útil para experimentos de evaluación donde se necesite un baseline reproducible, aunque el resultado medido (13,0 % frente a 29,0 % de la línea base mayoritaria) desaconseja usarlo en producción para esa tarea.
- Generación de texto en pipelines de CI: al ser pesos stock verificables por hash, sirve como referencia fija en tests de regresión de infraestructura de inferencia (comparar latencias, formatos de salida o integraciones con vLLM/llama.cpp).
- Reproducción de resultados de terceros: cualquier evaluación hecha con estos bytes debe reportarse como Llama 3.2 3B Instruct; el repositorio es útil para auditar afirmaciones que se hayan atribuido a un modelo "especializado".
- Educación y auditoría de licencias: el repo incluye `LICENSE`, `USE_POLICY.md` y `NOTICE` byte a byte idénticos a los de Meta, lo que lo convierte en un ejemplo práctico de cumplimiento de la cláusula §1.b.iii de la Llama 3.2 Community License.
- Asistente de bajo coste en dispositivos de borde: con 3B parámetros en Q4_K_M cabe en GPUs de 4-6 GB y en CPU con llama.cpp, adecuado para tareas de resumen o extracción simple donde no se requiera razonamiento complejo.

## Benchmarks y rendimiento

La model card publica una única medición propia, correspondiente al eje de gobernanza (clasificación en 4 niveles del EU AI Act) sobre el conjunto `csoai/gspc-gov`, n=100, temperatura 0, Ollama local en serie:

| Evaluación | Resultado |
|---|---|
| Prompt en texto libre, etiquetas parseables | 0/100 |
| Salida restringida por esquema JSON (4 etiquetas) | 13,0 % correctas, 4 etiquetas usadas, 0 sin parsear |
| Línea base de clase mayoritaria (mismos ítems) | 29,0 % |

El veredicto declarado por el autor es "por debajo de la línea base: estos pesos stock no aportan habilidad de gobernanza". No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar para este repositorio; los del modelo base Llama 3.2 3B Instruct pueden consultarse en la documentación de Meta, pero no se reproducen aquí por no estar incluidos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3,5 GB con Q4_K_M (pesos de 2,02 GB más overhead de contexto y caché KV).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema, aunque las dos últimas están sobredimensionadas para un modelo de 3B.
- Cabe en GPU de consumo: sí, en RTX 3050/3060/4060 y superiores; también en iGPU con memoria unificada suficiente.
- Opciones de despliegue: Ollama (forma nativa del repo, `ollama create` o `ollama pull llama3.2:3b`), llama.cpp, vLLM y TGI (convirtiendo el GGUF o usando los pesos safetensors del modelo base de Meta).
- Latencia y throughput: no disponibles en la información proporcionada; al ser pesos idénticos a `llama3.2:3b`, el rendimiento coincide con el de ese modelo en el mismo hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `csoai/sov33-unified` | 3,21 B | 128k (modelo base) | Llama 3.2 Community | GGUF Q4_K_M en HF | Pesos stock de Ollama, sin fine-tune |
| `meta-llama/Llama-3.2-3B-Instruct` | 3,21 B | 128k | Llama 3.2 Community | Safetensors en HF | Modelo original de Meta, misma calidad |
| `llama3.2:3b` (Ollama) | 3,21 B | 128k | Llama 3.2 Community | Registro de Ollama | Mismos bytes que este repo (sha256 idéntico) |
| `Qwen2.5-3B-Instruct` | 3,09 B | 32k | Apache 2.0 | Safetensors y GGUF en HF | Alternativa de tamaño similar con licencia permisiva |

La comparativa relevante es que `sov33-unified` no ofrece ninguna ventaja técnica frente al modelo original de Meta ni frente a la etiqueta de Ollama: es el mismo artefacto con otro nombre. Frente a Qwen2.5-3B-Instruct, la diferencia principal es la licencia (Llama 3.2 Community frente a Apache 2.0) y el contexto (128k frente a 32k).

## Limitaciones y advertencias

- No es un modelo nuevo: cualquier evaluación o despliegue debe atribuirse a Llama 3.2 3B Instruct, no a un supuesto modelo "sov33" o "CSOAI".
- La model card corrige afirmaciones previas del propio autor sobre fine-tuning y resultados de un panel de gobernanza; conviene tratar con cautela cualquier cifra antigua que circule sobre este repositorio.
- Riesgo de alucinación inherente a un modelo de 3B parámetros, especialmente en tareas de razonamiento multi-paso o conocimiento factual.
- En la medición publicada, el modelo queda por debajo de la línea base mayoritaria en clasificación de gobernanza (13,0 % frente a 29,0 %), por lo que no es adecuado para tareas de etiquetado normativo sin un ajuste específico.
- Licencia Llama 3.2 Community: uso comercial permitido con condiciones (atribución "Built with Llama", política de uso aceptable y cláusula de nombres), no es una licencia permisiva tipo Apache o MIT.
- El repositorio no incluye Modelfile ni system prompt; cualquier comportamiento específico debe aportarse en tiempo de ejecución y no forma parte del artefacto.
- Idiomas no verificados en el repositorio; las capacidades multilingües son las del modelo base de Meta y su calidad en español es limitada en comparación con modelos de mayor tamaño.
- Solo se publica Q4_K_M; no hay versiones en Q8, FP16 ni safetensors dentro de este repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/csoai/sov33-unified
- Modelo base en Hugging Face: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia Llama 3.2: https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/LICENSE
- Política de uso aceptable Llama 3.2: https://www.llama.com/llama3_2/use-policy
- Conjunto de evaluación citado en la card: `csoai/gspc-gov` (CC-BY-4.0), referencia en la model card del repositorio
- Panel de CSOAI citado en la card: https://councilof.ai/api/gspc
