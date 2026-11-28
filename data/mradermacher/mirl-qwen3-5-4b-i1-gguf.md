# mradermacher/MiRL-Qwen3.5-4B-i1-GGUF

## Resumen

MiRL-Qwen3.5-4B-i1-GGUF es la versión cuantizada con imatrix del modelo Rtian/MiRL-Qwen3.5-4B, un modelo de 4.205.751.296 parámetros construido sobre la arquitectura Qwen3.5 y afinado mediante aprendizaje por refuerzo (reinforcement learning) para tareas de agente de terminal. El autor de la cuantización es mradermacher, que publica el modelo en formato GGUF con una amplia matriz de niveles de cuantización (desde IQ1_S de 1,5 GB hasta Q6_K de 3,6 GB), lo que permite ejecutarlo en hardware muy modesto.

El modelo base está orientado a tareas de agente autónomo en terminal (terminal-agent) y evaluación en terminal-bench, con soporte declarado de visión según la model card del cuantizador, que indica que los ficheros mmproj, si existen, se encuentran en el repositorio estático. La licencia es Apache 2.0, lo que facilita su uso comercial, y el idioma declarado es únicamente inglés.

Resulta relevante ahora porque ofrece un modelo de 4B especializado en flujos de agente de terminal con licencia permisiva y cuantizaciones que caben en GPUs de consumo, algo poco habitual en la categoría de modelos de agente. La versión cuantizada con imatrix busca preservar mejor la calidad en niveles bajos de bits que las cuantizaciones estáticas equivalentes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen3.5 (según tag `qwen3_5`); detalles internos no disponibles |
| Parámetros totales | 4.205.751.296 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-IQ3_XXS, i1-Q2_K, i1-Q3_K_S, i1-IQ3_XS, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

La información disponible indica que el modelo se basa en la familia Qwen3.5 (tag `qwen3_5`) y que ha sido sometido a aprendizaje por refuerzo (pipeline `reinforcement-learning`), con orientación específica a tareas de agente de terminal y a la evaluación terminal-bench. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas concretas de la arquitectura interna.

La contribución de esta ficha es la cuantización: mradermacher genera cuantizaciones ponderadas con imatrix (matriz de importancia) a partir del modelo Rtian/MiRL-Qwen3.5-4B, siguiendo la metodología habitual de llama.cpp. Se incluye el fichero imatrix (0,1 GB) para que terceros puedan generar sus propias cuantizaciones. La model card menciona que se trata de un modelo de visión y que los ficheros mmproj, si existen, están en el repositorio estático.

## Capacidades

- Generación de texto conversacional en inglés.
- Comportamiento de agente de terminal: ejecución de comandos, interacción con el sistema y flujos multi-paso (tags `agent`, `terminal-agent`, `terminal-bench`).
- Razonamiento orientado a tareas de agente mediante aprendizaje por refuerzo.
- Soporte de visión según la model card del cuantizador (ficheros mmproj en el repositorio estático).
- Compatibilidad con endpoints (`endpoints_compatible`).
- No se documentan explícitamente capacidades de tool calling, function calling ni modo thinking; no disponible.
- Capacidades multilingües limitadas al inglés declarado.

## Casos de uso

- Automatización de tareas de administración de sistemas: el modelo puede interpretar instrucciones en lenguaje natural y traducirlas a comandos de terminal, gracias a su entrenamiento específico en terminal-bench.
- Agente de CI/CD en entornos controlados: integrado mediante llama.cpp en un runner, puede ejecutar pasos de build, test y despliegue siguiendo instrucciones y corrigiendo errores en varios pasos.
- Asistente de línea de comandos local: con cuantizaciones de 2,6-2,8 GB (IQ4_XS o Q4_K_M) cabe en GPUs de consumo y puede desplegarse como asistente de shell sin conexión.
- Prototipado de agentes autónomos en investigación: su licencia Apache 2.0 y su tamaño de 4B permiten experimentar con bucles de agente y evaluación en terminal-bench sin costes de licencia.
- Despliegue en entornos con recursos limitados: las cuantizaciones IQ2/IQ3 (1,6-2,5 GB) permiten ejecución en CPU o GPUs de gama baja para tareas de agente simples.
- Evaluación comparativa de cuantizaciones: el repositorio incluye el fichero imatrix y múltiples niveles, útil para medir la degradación de calidad en tareas de agente según el bitrate.
- Procesamiento de capturas de pantalla de terminal (si se confirma el soporte de visión con mmproj): el modelo podría interpretar la salida visual de una terminal para decidir el siguiente comando.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona el tag `terminal-bench` como orientación del entrenamiento, sin cifras.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño del fichero GGUF, más overhead de contexto):
  - i1-IQ1_S / IQ1_M: ~1,5 GB.
  - i1-IQ2_XXS a IQ2_M: ~1,6-1,8 GB.
  - i1-Q2_K / IQ3_XXS: ~2,0 GB.
  - i1-IQ3_XS a Q3_K_L: ~2,2-2,5 GB.
  - i1-IQ4_XS / Q4_0 / Q4_K_S: ~2,6-2,7 GB.
  - i1-Q4_K_M / Q4_1: ~2,8-2,9 GB.
  - i1-Q5_K_S / Q5_K_M: ~3,1-3,2 GB.
  - i1-Q6_K: ~3,6 GB.
- GPU recomendadas: no disponible de forma explícita; por tamaño, cualquier GPU con 4 GB o más de VRAM puede ejecutar las cuantizaciones Q4; para Q6_K se recomienda 6 GB o más.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores con las cuantizaciones Q4 y Q5; las IQ2/IQ3 caben en GPUs de 2-3 GB o en CPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (importando el GGUF), y servidores compatibles con endpoints; vLLM y TGI no soportan GGUF de forma nativa, por lo que requerirían los pesos safetensors del modelo base.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiRL-Qwen3.5-4B-i1-GGUF | 4,2B | no disponible | Apache 2.0 | GGUF (i1 imatrix) | Especializado en agente de terminal, solo inglés |
| Rtian/MiRL-Qwen3.5-4B | 4,2B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar |
| mradermacher/MiRL-Qwen3.5-4B-GGUF | 4,2B | no disponible | Apache 2.0 | GGUF (estático) | Cuantizaciones estáticas del mismo modelo base |

No se dispone de datos de benchmarks ni de comparaciones con otros modelos de agente de terminal en la información proporcionada.

## Limitaciones y advertencias

- Idioma: solo se declara inglés; el rendimiento en castellano no está garantizado.
- La cuantización introduce pérdida de calidad, especialmente en los niveles IQ1/IQ2, que la propia model card califica como "for the desperate" o "mostly desperate".
- Riesgo de alucinación inherente a los modelos de 4B, agravado en tareas de agente donde un comando erróneo puede tener consecuencias reales.
- No se documentan sesgos conocidos ni datos de evaluación de seguridad; no disponible.
- El soporte de visión no está confirmado: la model card indica que los mmproj estarían en el repositorio estático, pero no se verifica su existencia.
- Al ser un modelo de agente de terminal, requiere sandboxing y validación de comandos antes de usarlo en producción.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar los términos del modelo base Rtian/MiRL-Qwen3.5-4B.
- No se dispone de información sobre la longitud de contexto, lo que impide planificar despliegues con ventanas largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/MiRL-Qwen3.5-4B-i1-GGUF
- Modelo base: https://huggingface.co/Rtian/MiRL-Qwen3.5-4B
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/MiRL-Qwen3.5-4B-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#MiRL-Qwen3.5-4B-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
