# Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-GGUF-UltraOptimised-DSpark-MTP

## Resumen

Este modelo es una cuantizacion GGUF de referencia del modelo **Qwen3.8-27B-TURBO-Fable-Cold-Fusion**, desarrollado por **DavidAU** y empaquetado por **Solstice-AI**. Pertenece a la linea "Heretic" y "Uncensored", lo que indica que se ha aplicado un proceso de abliteracion para eliminar la alineacion y el rechazo de contenidos. El modelo esta optimizado para tareas de razonamiento, generacion de codigo, control de sistemas operativos y vision multimodal, y destaca por superar a Claude Opus 4.6 Max en nueve disciplinas de evaluacion segun el fabricante.

La arquitectura es hibrida: combina un 75% de capas con atencion lineal Gated Delta Recurrent Network (GDN) y un 25% de capas con atencion Grouped-Query Attention (GQA) global, lo que permite una complejidad de memoria O(1) en la mayoria de las capas. El modelo tiene 26.895.998.464 parametros totales, una ventana de contexto nativa de 262K tokens y soporte multimodal (imagen-texto) mediante un proyector de vision. Esta version GGUF incluye un drafter especulativo DSpark de 1.86B parametros que ofrece aceleraciones de 2.5x a 3.1x en decodificacion.

Es relevante para desarrolladores e investigadores que buscan un modelo open source de alto rendimiento en tareas agente, especialmente en entornos de ingenieria de software automatizada, control de escritorio y razonamiento cientifico, con la ventaja de poder desplegarse en hardware consumer mediante cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 75% capas Gated Delta Recurrent Network (GDN) de atencion lineal, 25% capas Grouped-Query Attention (GQA) global (Qwen 3.8 Cold Fusion) |
| Parametros totales | 26.895.998.464 |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | 262K nativo |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_NL, IQ4_XS |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (incluye mmproj-BF16 para vision) |

## Arquitectura y entrenamiento

El modelo parte de la base **Qwen3.8-27B**, sobre la que se aplican tecnicas de fusion de modelos denominadas **Cold Fusion** y **GAIN Merge**, junto con un ajuste fino posterior etiquetado como **Fable**. El resultado se somete a un proceso de **abliteracion** (proyecto "Heretic") para eliminar los mecanismos de rechazo y alineacion, produciendo un modelo "Uncensored". No se han publicado detalles exhaustivos sobre el dataset de entrenamiento, aunque el repositorio indica el dataset **Solstice-AI/Solace-1.0-Omni**, que parece ser una coleccion multimodal de instrucciones.

La arquitectura hibrida es la innovacion tecnica principal: el 75% de las capas utilizan atencion lineal Gated Delta Recurrent Network (GDN), que reduce la complejidad de memoria a O(1) por paso de forward, mientras que el 25% restante emplea atencion global de tipo Grouped-Query Attention (GQA), lo que permite capturar dependencias de largo alcance cuando es necesario. Ademas, la suite incluye un **drafter especulativo DSpark** de 1.86B parametros con 5 capas de extraccion de caracteristicas (5, 19, 33, 47, 61) y una cabeza de confianza VanillaMarkov de rango 256, entrenado con SpecForge. Algunos checkpoints integran ademas **Multi-Token Prediction (MTP)** por doble flujo de hardware, que permite generar varios tokens por paso de forma especulativa.

## Capacidades

- **Razonamiento y cadena de pensamiento (CoT)**: el modelo esta optimizado para resolver problemas complejos de abstraccion y logica, como refleja su puntuacion de 735 en ARC-C.
- **Generacion de codigo y agentes de software**: sobresale en tareas de ingenieria de software agente, depuracion de repositorios completos y resolucion de issues, con un 61.7% en SWE-bench Pro y un 90.3% en LiveCodeBench v6.
- **Control de sistemas operativos**: capacidades para operar escritorios (OSWorld-Verified 84.3%) y sistemas moviles Android (AndroidWorld 81.9%).
- **Seguimiento de instrucciones complejas**: 79.5% en IFBench indica buena capacidad para cumplir multiples restricciones simultaneas.
- **Vision multimodal**: procesa imagenes, diagramas, capturas de pantalla de interfaces de usuario y frames de video gracias al proyector de vision `mmproj-BF16.gguf`.
- **Razonamiento agentico de larga duracion**: 70.7% en CoWorkBench sugiere que puede mantener flujos de trabajo con multiples archivos a lo largo del tiempo.
- **Multilingue**: soporta ingles y chino segun los metadatos del repositorio.
- **Decodificacion especulativa**: integra DSpark Drafter para acelerar la generacion entre 2.5x y 3.1x en inferencia.
- **Tool calling y uso de herramientas**: no se documenta formalmente el soporte de function calling, pero los benchmarks agenticos implican capacidades de interaccion con herramientas y entornos.

## Casos de uso

- **Ingenieria de software agente**: el modelo puede integrarse en pipelines de CI/CD para revisar pull requests, resolver issues de repositorios y generar parches automaticos. Su rendimiento en SWE-bench Pro (61.7%) lo hace adecuado para automatizar tareas de mantenimiento de codigo.
- **Automatizacion de escritorio**: gracias a OSWorld-Verified (84.3%), puede controlar aplicaciones de escritorio mediante capturas de pantalla y acciones de teclado y raton, util para QA, monitorizacion y asistencia tecnica.
- **Automatizacion de aplicaciones moviles**: con AndroidWorld (81.9%), es capaz de operar aplicaciones Android de forma autonoma, lo que permite testear flujos de usuario, rellenar formularios y verificar comportamientos.
- **Asistencia tecnica con contexto largo**: su ventana de 262K tokens permite mantener conversaciones de soporte con historiales amplios, documentos tecnicos y registros de errores sin perder informacion.
- **Analisis visual de diagramas y capturas**: el soporte multimodal permite extraer informacion de diagramas de arquitectura, capturas de errores de software o mockups de interfaces, facilitando la documentacion y el diagnostico.
- **Razonamiento cientifico y logico**: para investigacion o analisis de datos que requieran abstraccion, la puntuacion ARC-C de 735 indica capacidad para resolver problemas de razonamiento de nivel frontera.
- **Agentes de baja latencia con decodificacion especulativa**: en entornos de produccion que requieren respuestas rapidas, el DSpark Drafter reduce la latencia de decodificacion entre 2.5x y 3.1x, permitiendo desplegar agentes interactivos en hardware asequible.
- **Investigacion en seguridad y alineacion**: al ser un modelo "Uncensored", puede utilizarse como base para estudiar comportamientos sin filtros, analizar sesgos o explorar tecnicas de abliteracion.

## Benchmarks y rendimiento

| Evaluacion | Enfoque | Qwen3.8-27B TURBO (GGUF) | Claude Opus 4.6 Max | Margen |
|---|---|---|---|---|
| SWE-bench Pro | Ingenieria de software agente | 61.7% | 53.4% | +8.3% |
| LiveCodeBench v6 | Resolucion de problemas en tiempo real | 90.3% | 88.8% | +1.5% |
| QwenSWEBench | Depuracion de repositorios completos | 79.0% | 63.8% | +15.2% |
| OSWorld-Verified | Control de ordenador | 84.3% | 72.7% | +11.6% |
| AndroidWorld | Autonomia en sistemas moviles | 81.9% | 62.0% | +19.9% |
| IFBench | Cumplimiento de instrucciones complejas | 79.5% | 62.5% | +17.0% |
| CoWorkBench | Flujos de trabajo largos con multiples archivos | 70.7% | 68.2% | +2.5% |
| ARC-C | Abstraccion cientifica | 735 (8-bit) / 719 (4-bit) | ~710-720 | Frontera cerrada |
| ARC-E | Razonamiento de sentido comun | 882 | ~870 | Supera la frontera cerrada |

Los datos han sido reportados por el fabricante bajo el harness de evaluacion de Claude Code, con contexto de 256-262K, temperatura 1.0 y top_p 0.95. No se han verificado de forma independiente.

## Requisitos de hardware

- **VRAM estimada para inferencia**: para la cuantizacion Q4_K_M se requieren aproximadamente 15-16 GB de VRAM, mientras que Q8_0 necesita alrededor de 29-30 GB. El uso del drafter DSpark anade unos 2 GB adicionales.
- **GPU recomendadas**: RTX 4090 (24 GB) es suficiente para Q4_K_M y Q5_K_M con contextos moderados. Para Q8_0 se recomiendan GPUs con 40-80 GB de VRAM, como A100 o H100.
- **Compatibilidad con GPU consumer**: si. Con Q4_K_M y una RTX 4080 o 4090 es posible ejecutar la inferencia con contextos de hasta 32K tokens sin overflow de memoria.
- **Opciones de despliegue**: llama.cpp, Ollama, Anvil Runtime (TurboQuant). El formato GGUF no es compatible directamente con vLLM, pero puede convertirse o ejecutarse con llama.cpp.
- **Latencia y throughput**: no se han publicado valores absolutos, pero con decodificacion especulativa DSpark se espera una aceleracion de 2.5x a 3.1x en el numero de tokens generados por segundo. El modelo hibrido GDN tambien reduce el coste de memoria en el calculo de atencion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B TURBO (GGUF) | 26.9B | 262K | 61.7% | Apache 2.0 | Open source, cuantizado |
| Claude Opus 4.6 Max | No disponible | No disponible | 53.4% | Propietaria | API cerrada |
| Qwen3-32B (referencia generica) | No disponible | No disponible | No disponible | Apache 2.0 | Open source |

No se dispone de datos para comparar con otros modelos open source de la misma categoria en la informacion proporcionada. La unica comparativa cuantificada es contra Claude Opus 4.6 Max, que es un modelo propietario.

## Limitaciones y advertencias

- **Contenido sin filtros**: al ser un modelo "Uncensored" y "Abliterated", no tiene mecanismos de rechazo para contenido dañino o ilegal. Esto supone un riesgo de mal uso en entornos de produccion donde se requiera moderacion.
- **Benchmarks no verificados**: los resultados presentados son proporcionados por el fabricante y no han sido confirmados por evaluaciones independientes.
- **Degradacion por cuantizacion**: las cuantizaciones mas agresivas (IQ4_NL, IQ4_XS) pueden reducir notablemente la precision en tareas de razonamiento, aunque el autor reporta 719 en ARC-C para la version 4-bit.
- **Idiomas limitados**: el rendimiento fuera de ingles y chino puede ser significativamente inferior, ya que el entrenamiento y las evaluaciones se centran en esos idiomas.
- **Consumo de memoria con contexto largo**: la ventana de 262K tokens aumenta el uso de memoria de KV cache, lo que puede provocar degradaciones de rendimiento o out-of-memory en hardware limitado.
- **Dependencia del drafter**: el uso de DSpark requiere cargar el modelo drafter adicional, lo que incrementa el consumo de VRAM. Si no se configura correctamente, puede no aplicar la aceleracion esperada.
- **Licencia Apache 2.0**: permite uso comercial y modificacion, pero los autores no ofrecen garantias de soporte o mantenimiento. Es responsabilidad del usuario validar el modelo en su dominio especifico.

## Enlaces

- Modelo GGUF en HuggingFace: [https://huggingface.co/Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-GGUF-UltraOptimised-DSpark-MTP](https://huggingface.co/Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-GGUF-UltraOptimised-DSpark-MTP)
- Modelo base safetensors: [https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU](https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU)
- Dataset de entrenamiento: [https://huggingface.co/datasets/Solstice-AI/Solace-1.0-Omni](https://huggingface.co/datasets/Solstice-AI/Solace-1.0-Omni)
- Motor Anvil (TurboQuant): [https://github.com/Solstice-Labs/anvil](https://github.com/Solstice-Labs/anvil)
