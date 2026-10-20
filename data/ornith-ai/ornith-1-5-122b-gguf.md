# ornith-ai/Ornith-1.5-122B-GGUF

## Resumen

Ornith-1.5-122B es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por ornith-ai, distribuido en este repositorio en formato GGUF para inferencia cuantizada. Con 124.635.206.144 parámetros totales (dato real de safetensors, aproximadamente 124,6 mil millones) y una arquitectura MoE pensada para despliegue eficiente en una sola GPU, se presenta como el miembro más capaz de la familia Ornith-1.5. El autor lo describe como un modelo que "no hace sacrificios entre fuerte y rápido", orientado a tareas de código, razonamiento agentico y trabajo de ingeniería real.

El modelo se publica bajo licencia MIT y está etiquetado como `text-generation`, `conversational` y compatible con endpoints. Según la model card, corre en una sola DGX y existe una variante cuantizada para dispositivos móviles denominada Ornith-1.5-122B-Mobile. Sus benchmarks declarados cubren codificación y ciberseguridad (TerminalBench 2.1, CyberGym, NL2Repo y SWE-bench Pro), donde compite con modelos abiertos de tamaño comparable.

Este repositorio concreto (Ornith-1.5-122B-GGUF) contiene los pesos cuantizados en formato GGUF, con un tamaño total de 649,8 GB. Es la vía recomendada para inferencia en CPU, configuraciones híbridas y despliegues con llama.cpp u Ollama. Los idiomas soportados no están documentados en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer |
| Parametros totales | 124.635.206.144 (aprox. 124,6 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (multiples cuantizaciones; el autor menciona una variante "Mobile"; niveles concretos no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (repo); safetensors disponible en el repo base Ornith-1.5-122B |

## Arquitectura y entrenamiento

La arquitectura es de tipo mixture-of-experts (MoE), según se declara en la model card ("a 122B MOE model"). No se especifican en la información disponible el número de expertos, el ratio de activación, la dimensión del modelo, el número de capas ni la ventana de contexto. Tampoco se detalla la composición del dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron fases de RLHF, DPO u otros métodos de alineamiento. La model card menciona mejoras en "instruction following, task decomposition y conocimiento de escenarios reales de trabajo", pero sin datos cuantitativos que las respalden.

El modelo está diseñado para despliegue eficiente en una sola GPU (una DGX) y cuenta con una variante cuantizada orientada a dispositivos móviles. El autor enfatiza dos propiedades operativas: finalización más rápida de tareas y salidas más cortas. No se documentan innovaciones técnicas específicas como decodificación especulativa, atención lineal, atención esparcida o mecanismos híbridos SSM. Esta información no está disponible en la model card pública consultada.

## Capacidades

- Generación de texto conversacional y de propósito general, con etiqueta `conversational` en el repo.
- Razonamiento y resolución de tareas de codificación, evaluado en TerminalBench 2.1, NL2Repo y SWE-bench Pro.
- Ciberseguridad ofensiva/defensiva en entornos de agente, evaluado con CyberGym.
- Descomposición de tareas complejas y seguimiento de instrucciones, según declara el autor.
- Capacidad de agente multi-paso y trabajo en escenarios de ingeniería real, implicada por los benchmarks de terminal y repositorio.
- Compatibilidad con endpoints y con `transformers`, lo que sugiere soporte de serving estándar.
- Capacidades multilingües: no documentadas.
- Soporte explícito de tool calling / function calling: no documentado en la información disponible.
- Modo "thinking" o razonamiento explícito: no documentado.
- Capacidades de visión o audio: no documentadas.

## Casos de uso

- Automatización de tareas de terminal y sistemas: el modelo obtiene 81,2 en TerminalBench 2.1, por lo que es adecuado para agentes que ejecutan comandos, interpretan salidas y corrigen errores en entornos tipo shell.
- Reparación de bugs en repositorios reales: con 76,9 en SWE-bench Pro (no-hack) y 51,2 en NL2Repo, puede integrarse en pipelines de CI/CD y en flujos de resolución automática de issues de GitHub.
- Asistencia a desarrollo en producción: la licencia MIT permite uso comercial sin royalties, lo que facilita su incorporación a productos y servicios internos.
- Análisis y auditoría de seguridad: con 80 en CyberGym, encaja en tareas de análisis de vulnerabilidades y razonamiento sobre configuraciones y trazas.
- Agentes autónomos multi-paso: los resultados en benchmarks de repositorio y terminal indican capacidad para descomponer objetivos y ejecutar sub-tareas encadenadas con verificación intermedia.
- Despliegue en hardware limitado mediante GGUF: al publicarse cuantizado, puede servirse con llama.cpp u Ollama en máquinas sin GPU de gran VRAM usando offload a CPU/RAM.
- Edge/móvil vía variante cuantizada (Ornith-1.5-122B-Mobile): el autor declara un caso de despliegue en dispositivos, si bien este repositorio no incluye dicha variante.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (cuanto más alto, mejor):

| Benchmark | Ornith-1.5-122B | Qwen3.8-Flash-Next (125B) | Qwen3.8 (27B dense) | Nemotron 3.5 Super VL (120B) | DeepSeek-V4-Flash-0731 (284B) | Beam (501B) |
|---|---|---|---|---|---|---|
| TerminalBench 2.1 | 81,2 | 83,4 | 71,9 | 66,7 | 82,7 | 80,1 |
| CyberGym | 80,0 | 78,0 | 55,0 | 34,0 | 76,7 | 59,0 |
| NL2Repo | 51,2 | 45,2 | 42,3 | 21,0 | 54,2 | 49,4 |
| SWE-bench Pro (no-hack) | 76,9 | 43,9 | 65,5 | no disponible | no disponible | no disponible |

Nota: la tabla original de la model card está truncada en la fila de SWE-bench Pro, por lo que solo se recogen los valores íntegros disponibles. No se han publicado en la información proporcionada resultados para MMLU, HumanEval, GSM8K ni otros benchmarks de conocimiento general. Las cifras corresponden a la model card del autor y no han sido verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada (orientativa, según el recuento de 124,6 B de parámetros):
  - Q4_K_M (≈4,5 bits/peso): en torno a 70-75 GB.
  - Q5_K_M (≈5,5 bits/peso): en torno a 85-90 GB.
  - Q6_K (≈6,5 bits/peso): en torno a 100-105 GB.
  - Q8_0 (≈8,5 bits/peso): en torno a 130-135 GB.
  - FP16 en safetensors: en torno a 250 GB.
- GPU recomendadas:
  - Una H100 80 GB o A100 80 GB basta para cuantizaciones Q4.
  - H200 141 GB o configuraciones multi-GPU para Q6/Q8.
  - El autor afirma que "runs on a single DGX", lo que es coherente con nodos DGX H100/H200.
- GPU de consumo: no cabe entera en una RTX 4090 (24 GB). Es viable solo con offload parcial a RAM del sistema mediante llama.cpp, con penalización fuerte de latencia.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, vLLM (soporte GGUF), TGI. Para safetensors, transformers con `device_map` o frameworks de serving con tensor parallelism.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser MoE, el coste por token depende del número de parámetros activos, que no se ha publicado; esto impide dar estimaciones fiables de tokens/s.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-122B | 124,6 B | MoE | no disponible | MIT | Pesos abiertos, GGUF y safetensors |
| Qwen3.8-Flash-Next | 125 B | no disponible (Flash) | no disponible | no disponible en la información | Referenciado en la model card como comparable |
| Nemotron 3.5 Super VL | 120 B | no disponible (VL) | no disponible | no disponible en la información | Referenciado en la model card |
| Qwen3.8 | 27 B | dense | no disponible | no disponible en la información | Referenciado en la model card |

En los benchmarks declarados, Ornith-1.5-122B lidera CyberGym (80,0) y NL2Repo (51,2) frente a Qwen3.8-Flash-Next y Nemotron 3.5 Super VL, y supera ampliamente a Nemotron en TerminalBench (81,2 frente a 66,7). Frente a DeepSeek-V4-Flash-0731 (284 B) queda por detrás en TerminalBench (81,2 vs 82,7) y NL2Repo (51,2 vs 54,2). No se dispone de información sobre contexto, licencia ni arquitectura detallada de los modelos comparados.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; no hay evaluación de sesgo, toxicidad o alineación.
- Riesgo de alucinación: no se han publicado tasas de alucinación ni evaluaciones específicas de factualidad.
- Contexto: la longitud de ventana no se ha especificado, lo que impide planificar despliegues con prompts largos sin verificación previa.
- Idiomas: no se documentan idiomas soportados, por lo que el rendimiento fuera del inglés (incluido el castellano) es incierto.
- Benchmarks: todas las cifras proceden de la model card del autor y no han sido verificadas de forma independiente; la tabla original está truncada en varias filas.
- Licencia MIT: permite uso comercial y modificación, pero conviene revisar el archivo LICENSE del repo base `ornith-ai/Ornith-1.5-122B` por si incluye avisos adicionales.
- Producción: sin datos de contexto, parámetros activos ni throughput, el dimensionamiento de infraestructura debe hacerse empíricamente.
- Formato GGUF: la calidad puede degradarse en cuantizaciones muy agresivas; usar al menos Q4_K_M para tareas sensibles de código.
- Repositorio con 0 descargas en el momento de la ficha: no hay evidencia comunitaria de uso en producción.

## Enlaces

- HuggingFace (este repo GGUF): https://huggingface.co/ornith-ai/Ornith-1.5-122B-GGUF
- Repo base safetensors: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Licencia (repo base): https://huggingface.co/ornith-ai/Ornith-1.5-122B/blob/main/LICENSE
- Paper, blog, repositorio de código y demos: no disponibles en la información proporcionada.
