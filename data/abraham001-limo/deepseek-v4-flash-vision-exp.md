# Abraham001-LIMO/DeepSeek-V4-Flash-Vision-Exp

## Resumen

DeepSeek-V4-Flash-Vision-Exp es el primer modelo multimodal experimental de la familia DeepSeek-V4. Se construye sobre la arquitectura DeepSeek-V4-Flash, incorporando una torre de visión de 32 capas y un alineador para habilitar la comprensión de imágenes. El objetivo del modelo es mejorar las capacidades de agente multimodal sin degradar el rendimiento en tareas de agente basadas en texto, como se refleja en los benchmarks publicados. El modelo se publica en HuggingFace bajo el repositorio Abraham001-LIMO/DeepSeek-V4-Flash-Vision-Exp, aunque la model card indica que el desarrollo corresponde a DeepSeek.

La arquitectura es un transformer MoE (Mixture of Experts) con 304.646.824.126 parámetros totales, una ventana de contexto de 1.000.000 tokens y un módulo de decodificación especulativa integrado llamado DSpark. Incorpora además atención DFlash, Hyper-Connections y un forward path propio de la familia V4. El modelo está disponible bajo licencia MIT y su peso principal está en formato safetensors. Su relevancia actual radica en ser una aproximación experimental al agente multimodal de largo contexto, compitiendo en métricas de agente con modelos propietarios de frontera.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con torre de visión de 32 capas, alineador, atención DFlash, Hyper-Connections y módulo de draft DSpark |
| Parametros totales | 304.646.824.126 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | FP8 / 8-bit (según etiquetas de HuggingFace; no se detallan más en la documentación) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors.index.json) |

## Arquitectura y entrenamiento

El modelo hereda el backbone MoE de DeepSeek-V4-Flash y le añade una torre de visión de 32 capas y un alineador para proyectar las representaciones visuales al espacio del lenguaje. La implementación de referencia incluida en el repositorio cubre el encoder visual, el alineador, la atención DFlash, el mecanismo MoE, las Hyper-Connections y el forward path DSpark. El entrenamiento es una continuación sobre la base V4-Flash, enfocada a desbloquear capacidades visuales manteniendo las capacidades de agente de texto. No se dispone de información sobre la composición del dataset ni sobre la cantidad de tokens de entrenamiento. Entre las innovaciones técnicas destacan la decodificación especulativa con el módulo DSpark, que se integra sin necesidad de un modelo draft separado, y la atención DFlash, optimizada para ventanas de contexto largas.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento (`reasoning_parser` y `reasoning_config` en vLLM).
- Comprensión multimodal de imágenes, gráficos y capturas de pantalla, con capacidades de agente visual.
- Soporte de tool calling y function calling, habilitado en vLLM mediante `--tool-call-parser deepseek_v4` y `--enable-auto-tool-choice`.
- Capacidades de agente multi-step: ejecución de tareas en terminal, análisis de repositorios, generación de código, automatización de entornos y evaluación de seguridad.
- Ventana de contexto de 1M tokens, adecuada para procesar repositorios completos o documentación extensa.
- Decodificación especulativa con DSpark, que reduce latencia en generaciones largas.

## Casos de uso

- Asistentes de programación en entornos de terminal: el modelo puede ejecutar comandos, analizar salidas y completar tareas de sistemas operativos, como se evalúa en Terminal Bench 2.1.
- Ingeniería de software automatizada: gracias a su rendimiento en DeepSWE y NL2Repo, puede generar repositorios, resolver issues o refactorizar código a partir de instrucciones de alto nivel.
- Agentes multimodales en interfaces gráficas: puede interpretar capturas de pantalla y actuar sobre ellas, como en ApexBench y Agents' Last Exam, para automatizar flujos de trabajo de escritorio.
- Análisis de datos visuales: interpretación de gráficos y tablas (Chartography), útil en paneles de control, informes financieros o documentación técnica con figuras.
- Ciberseguridad y auditoría: en entornos como Cybergym, el modelo puede realizar tareas de análisis y defensa en infraestructuras simuladas.
- Automatización de herramientas y APIs: con tool calling integrado, puede orquestar llamadas a funciones en pipelines de CI/CD o en sistemas de atención al cliente.
- Análisis de código de gran escala: la ventana de 1M tokens permite cargar la totalidad de un monorepo o una base de código extensa para razonar sobre ella en una sola pasada.

## Benchmarks y rendimiento

La model card publica una tabla comparativa con DeepSeek-V4-Flash-0731 y Opus-4.8. Los valores son los siguientes:

| Benchmark | DeepSeek-V4-Flash-Vision-Exp | DeepSeek-V4-Flash-0731 | Opus-4.8 |
| :--- | :---: | :---: | :---: |
| **Text Agent Capabilities** | | | |
| Terminal Bench 2.1 | 83.9 | 82.7 | 85.0 |
| NL2Repo | 57.7 | 54.2 | 69.7 |
| Cybergym | 75.3 | 76.7 | 78.3 |
| DeepSWE | 59.3 | 54.4 | 58.0 |
| Toolathlon-Verified | 75.9 | 70.3 | 76.2 |
| DSBench-Hard | 63.6 | 59.6 | 71.7 |
| AutomationBench (Public) | 25.7 | 25.1 | 27.2 |
| **Multimodal Agent Capabilities** | | | |
| ApexBench (Pass@1) | 36.5 | 26.2† | 39.4 |
| Agents' Last Exam | 27.3 | 25.2† | 25.7 |
| Chartography | 64.3 | - | 65.0 |
| ZeroBench (Pass@5) | 35.0 | - | 34.0 |

Notas: los benchmarks de texto se evalúan con el modo minimal de DeepSeek Harness, con nivel de razonamiento `max`, `temperature = 1.0` y `top_p = 0.95`. En ApexBench y Agents' Last Exam, DeepSeek-V4-Flash-0731 ignora los elementos multimodales de la entrada.

## Requisitos de hardware

- VRAM estimada: con 304.646.824.126 parámetros en FP8, solo los pesos ocupan aproximadamente 305 GB. Se requiere un nodo multi-GPU con memoria agregada suficiente para pesos, activaciones y KV cache.
- GPU recomendadas: el ejemplo oficial de despliegue con vLLM usa un nodo con 4× NVIDIA GB300 y `tensor-parallel-size 4`.
- No cabe en GPU de consumo; se necesita infraestructura de servidor con GPUs de alta memoria (H100, A100 o GB300).
- Opciones de despliegue: vLLM (con soporte para DSpark, tool calling y reasoning) y SGLang (con `--speculative-algorithm DSPARK`).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
| :--- | :--- | :--- | :--- | :--- |
| DeepSeek-V4-Flash-Vision-Exp | 304.6B | 1M | MIT | Pesos abiertos en HuggingFace |
| DeepSeek-V4-Flash-0731 | 284B (base) | 1M | MIT | Pesos abiertos en HuggingFace |
| Opus-4.8 | no disponible | no disponible | Propietaria | Solo API |

En los benchmarks publicados, el modelo experimental supera al V4-Flash-0731 en tareas de agente multimodal (ApexBench, Agents' Last Exam, Chartography, ZeroBench) y mantiene un rendimiento comparable o superior en la mayoría de tareas de agente de texto. Frente a Opus-4.8, que es un modelo propietario, las diferencias son reducidas en varios benchmarks, aunque Opus-4.8 presenta ventajas claras en NL2Repo, DSBench-Hard y Cybergym.

## Limitaciones y advertencias

- Modelo experimental: puede presentar comportamientos inestables o resultados impredecibles en escenarios no cubiertos por los benchmarks.
- No se han publicado estudios de sesgos ni evaluaciones de seguridad exhaustivas para esta variante.
- Riesgo de alucinación, especialmente en tareas multimodales complejas donde la información visual es ambigua.
- No se especifican los idiomas soportados, aunque la arquitectura sugiere un soporte multilingüe amplio.
- La licencia MIT permite uso comercial, pero al ser un modelo experimental se recomienda validar su comportamiento antes de usarlo en producción.
- El repositorio en HuggingFace está publicado por Abraham001-LIMO y no por la organización oficial deepseek-ai, aunque la model card parece copiada del desarrollo original. Conviene verificar la procedencia de los pesos.
- Requiere hardware de servidor de gama alta (4× GB300 para el despliegue recomendado), lo que limita su uso a organizaciones con infraestructura dedicada.

## Enlaces

- Repositorio en HuggingFace (publicado por Abraham001-LIMO): https://huggingface.co/Abraham001-LIMO/DeepSeek-V4-Flash-Vision-Exp
- Repositorio en HuggingFace (organización DeepSeek): https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- Receta de despliegue con vLLM: https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- Página de NVIDIA NIM para DeepSeek V4 Flash: https://build.nvidia.com/deepseek-ai/deepseek-v4-flash
- Artículo sobre DeepSeek V4 y la versión 0731: https://felloai.com/deepseek-v4/
- Web oficial de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
