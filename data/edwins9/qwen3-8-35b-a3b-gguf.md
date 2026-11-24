# EdwinS9/Qwen3.8-35B-A3B-GGUF

## Resumen

Qwen3.8-35B-A3B es un ajuste fino (fine-tune) orientado a código del modelo Qwen3.6-35B-A3B, entrenado por el usuario EdwinS9 sobre respuestas generadas por Qwen3.8-27B. Se distribuye en formato GGUF cuantizado para su uso con llama.cpp, Ollama y LM Studio, lo que permite ejecutarlo en hardware de consumo. El modelo conserva la arquitectura MoE (Mixture of Experts) del modelo base, con 34.660.610.688 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token (según la nomenclatura A3B).

La relevancia de esta ficha radica en que se trata de una variante de código de una familia Qwen reciente, publicada bajo licencia Apache-2.0 y con pesos ya convertidos a GGUF, lo que reduce la fricción de despliegue local. No obstante, el autor advierte explícitamente de que los ficheros GGUF no se evaluaron por separado y que las puntuaciones de la model card principal provienen de la versión AWQ, no de estos pesos.

Esta ficha documenta exclusivamente la información disponible en la model card y los metadatos de Hugging Face. No hay datos publicados sobre composición del dataset de entrenamiento, número de tokens, idiomas soportados ni resultados de benchmarks específicos para los ficheros GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), transformer; familia Qwen3.5/Qwen3.6 según el renderer de Ollama |
| Parametros totales | 34.660.610.688 (≈34,7 B) |
| Parametros activos | ≈3 B (denominación A3B) |
| Longitud de contexto | 32.768 tokens en la configuración recomendada (`-c 32768`); el máximo nativo del modelo base no está documentado en la información disponible |
| Tipos de cuantizacion | Q4_K_M (21,2 GB) y Q8_0 (36,9 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (convertido desde bf16 con llama.cpp, commit cd959bae9) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen3.6-35B-A3B, un transformer con arquitectura de mezcla de expertos (MoE) de 34,7 mil millones de parámetros totales y aproximadamente 3 mil millones activos por token. El ajuste se realizó sobre respuestas de Qwen3.8-27B, es decir, se trata de un proceso de destilación o imitación de las salidas de un modelo mayor hacia un modelo MoE de menor coste de inferencia. La model card no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO.

La conversión a GGUF se realizó con llama.cpp (commit cd959bae9) a partir de los pesos en bf16. Los ficheros son solo de texto: el proyector de visión del modelo base no está incluido, por lo que las capacidades multimodales no están disponibles en esta distribución. El autor indica que los ficheros GGUF no fueron evaluados de forma independiente y que las métricas de la model card principal corresponden a la versión AWQ.

## Capacidades

- Generación de texto y conversación multi-turno, con soporte de plantilla de chat Jinja (`--jinja` en llama.cpp).
- Orientación a código: el ajuste se realizó sobre respuestas de un modelo mayor, con el objetivo declarado de mejorar tareas de programación.
- Modo "thinking" (razonamiento extendido): la configuración recomendada activa el pensamiento con temperatura 1.0, top_p 0.95, top_k 20 y min_p 0, reservando al menos 16k tokens nuevos para la respuesta.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags de Hugging Face).
- Capacidades multimodales: no disponibles en esta distribución GGUF (el proyector de visión no está incluido).
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente, aunque el modo thinking y la ventana de 32k permiten cadenas de razonamiento largas.
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistencia a la programación en local: el modelo puede integrarse en editores o terminales mediante llama.cpp u Ollama para autocompletar, explicar y refactorizar código, aprovechando su especialización en código y su despliegue en hardware de consumo gracias a la cuantización Q4_K_M de 21,2 GB.
- Revisión de código en pipelines de CI/CD: con 32k de contexto se pueden pasar ficheros completos o diffs extensos al modelo para detectar errores, malas prácticas o problemas de seguridad antes del merge.
- Generación de documentación técnica: el modelo puede redactar docstrings, READMEs y comentarios a partir del código fuente, con el modo thinking activado para tareas que requieran razonamiento sobre la estructura del proyecto.
- Chat de soporte técnico para desarrolladores: conversaciones multi-turno con contexto de 32k tokens permiten mantener el hilo de un problema de depuración a lo largo de varias interacciones.
- Prototipado de agentes de código: la ventana de contexto y el modo thinking permiten encadenar pasos de razonamiento (leer fichero, proponer parche, verificar) en un bucle de agente, siempre que se implemente el orquestador externo.
- Experimentación e investigación en destilación: al ser un fine-tune destilado de Qwen3.8-27B sobre un MoE de 3B activos, sirve como caso de estudio para comparar calidad/coste frente al modelo profesor en tareas de código.
- Despliegue en estaciones de trabajo sin GPU de datacenter: la versión Q4_K_M cabe en GPUs de consumo de 24 GB (RTX 3090/4090) y permite inferencia local sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que los ficheros GGUF no fueron evaluados por separado y que las puntuaciones de la model card principal corresponden a la versión AWQ, no a estos pesos.

## Requisitos de hardware

- VRAM estimada: Q4_K_M requiere aproximadamente 21,2 GB de pesos más overhead de contexto KV; Q8_0 requiere aproximadamente 36,9 GB de pesos.
- GPU recomendadas: para Q4_K_M, RTX 3090 o RTX 4090 (24 GB) con contexto moderado; para Q8_0, A100 40 GB, A100 80 GB o H100.
- GPU de consumo: Q4_K_M cabe en RTX 3090/4090 de 24 GB; en GPUs de 16 GB o menos sería necesario reducir contexto o usar cuantizaciones menores no publicadas en este repo.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama (con Modelfile que use el renderer/parser `qwen3.5`), LM Studio (búsqueda por `EdwinS9/Qwen3.8-35B-A3B-GGUF`).
- Latencia y throughput: no disponibles en la información proporcionada.
- Configuración recomendada de inferencia: thinking on, temperature 1.0, top_p 0.95, top_k 20, min_p 0, al menos 16k tokens nuevos de margen.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-35B-A3B-GGUF (este) | 34,7 B | ≈3 B | 32k (config. recomendada) | Apache-2.0 | GGUF | Fine-tune de código destilado de Qwen3.8-27B; sin benchmarks propios |
| Qwen3.6-35B-A3B (modelo base) | 34,7 B | ≈3 B | no disponible | Apache-2.0 (según el autor) | bf16/AWQ | Modelo original sin el ajuste de código |
| Qwen3.8-27B (modelo profesor) | 27 B (según nombre) | no disponible (probablemente denso) | no disponible | Apache-2.0 (según el autor) | no disponible | Fuente de las respuestas de destilación |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Los ficheros GGUF no han sido evaluados de forma independiente; las métricas de la model card principal corresponden a la versión AWQ y no son extrapolables directamente.
- El proyector de visión no está incluido: el modelo es solo de texto en esta distribución.
- No hay información sobre sesgos, datos de entrenamiento ni composición del corpus, lo que dificulta evaluar riesgos de alucinación o sesgo.
- Idiomas soportados no documentados; el comportamiento multilingüe es incierto.
- Tool calling y capacidades de agente no están documentadas explícitamente.
- El uso con Ollama requiere un Modelfile con renderer/parser `qwen3.5`; un `ollama run hf.co/...` directo no configura la plantilla de chat correctamente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor es un particular (EdwinS9), no el equipo oficial de Qwen: la procedencia y el mantenimiento a largo plazo no están garantizados.
- Licencia Apache-2.0 permite uso comercial, pero al ser un fine-tune derivado conviene verificar las condiciones del modelo base y del modelo profesor.

## Enlaces

- Repositorio GGUF: https://huggingface.co/EdwinS9/Qwen3.8-35B-A3B-GGUF
- Modelo base (fine-tune): https://huggingface.co/EdwinS9/Qwen3.8-35B-A3B
- llama.cpp (herramienta de conversión, commit cd959bae9): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
