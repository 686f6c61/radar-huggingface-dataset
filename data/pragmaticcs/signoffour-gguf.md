# pragmaticcs/SignOfFour-GGUF

## Resumen

SignOfFour-GGUF es un modelo de lenguaje de 35 mil millones de parametros con arquitectura Mixture-of-Experts (MoE) de Qwen, desarrollado por el autor pragmaticcs mediante una fusion de cuatro modelos base. El modelo integra las capacidades de tres fine-tunes especializados (codigo, agente y razonamiento) sobre un ancla base, utilizando el algoritmo DARE-TIES con modulacion sinusoidal por profundidad. El resultado es un modelo orientado a tareas de ingenieria de software, generacion de codigo y ejecucion de herramientas agente, con un coste de inferencia reducido gracias a sus 3B de parametros activos por token.

La relevancia de este modelo radica en su enfoque practico: al fusionar modelos especializados en una sola arquitectura, ofrece un equilibrio entre capacidad de razonamiento, generacion de codigo y uso de herramientas, manteniendo un presupuesto de VRAM moderado. La eliminacion de los pesos de vision multimodal y de las cabezas de Multi-Token Prediction (MTP) reduce la huella de memoria y maximiza el rendimiento en tareas de codificacion. El modelo se distribuye en formato GGUF, lo que facilita su despliegue en entornos de produccion con llama.cpp, Ollama u otras herramientas compatibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen 35B-A3B MoE (Gated DeltaNet hybrid linear attention) |
| Parametros totales | 35B |
| Parametros activos | 3B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (no se especifican los tipos concretos en la informacion disponible) |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen 35B-A3B MoE, que combina atencion lineal hibrida Gated DeltaNet con un mecanismo de mezcla de expertos. La configuracion incluye 40 capas de decodificador, 256 expertos enrutados y 1 experto compartido. La fusion se realizo mediante el algoritmo DARE-TIES, que combina deltas de tareas de tres modelos donantes sobre un ancla base. El proceso incluye poda DARE (con densidades de retencion entre 0.65 y 0.75 segun el grupo de parametros), eleccion de signo TIES y una reconstruccion con escalado sinusoidal por profundidad que concentra la transferencia de tareas en las capas intermedias (l entre 12 y 28).

Los datos de entrenamiento especificos no estan disponibles en la informacion proporcionada. El modelo no ha sido sometido a un proceso de entrenamiento tradicional, sino que es el resultado de una fusion de pesos de modelos preentrenados. Las politicas por capas protegen el router MoE y los kernels de estado recurrente DeltaNet de la poda DARE para evitar inestabilidades en el enrutamiento y en el espacio de estados de la atencion lineal. Se eliminaron las cabezas MTP y los pesos de vision para reducir el uso de VRAM.

## Capacidades

- Generacion de codigo y sintaxis valida en multiples lenguajes de programacion, con recomendaciones de temperatura baja (0.6) para mantener la estabilidad del enrutamiento.
- Razonamiento creativo con temperatura mas alta (1.0) y penalizacion de repeticion (1.05) para tareas de escritura o ideacion.
- Ejecucion de herramientas agente (agentic tool execution), orientado a trayectorias de agente en terminal o entornos de desarrollo.
- Soporte de tool calling / function calling, integrado en la arquitectura base de Qwen.
- Capacidades multilingues limitadas a ingles y chino, segun la informacion del modelo.
- Razonamiento multi-paso y planificacion de tareas, reforzado por la fusion con modelos especializados en agentes.
- Inferencia eficiente gracias a los 3B de parametros activos por token, lo que reduce la latencia y el consumo de memoria.

## Casos de uso

- Asistente de programacion en IDE: el modelo puede integrarse en editores como VS Code o JetBrains para autocompletar codigo, generar funciones y refactorizar, aprovechando su especializacion en sintaxis y su baja latencia gracias a los 3B de parametros activos.
- Agente de terminal autonomo: puede ejecutar comandos, interpretar salidas y tomar decisiones de siguiente paso en entornos de linea de comandos, gracias a su soporte de tool calling y su entrenamiento en trayectorias agente.
- Generacion de codigo en pipelines CI/CD: el modelo puede generar tests unitarios, documentacion tecnica o parches de codigo automaticamente, integrándose en flujos de integracion continua con herramientas como vLLM o TGI.
- Chatbot de soporte tecnico bilingue: con soporte para ingles y chino, puede atender consultas de usuarios en ambos idiomas, manteniendo contexto largo si se configura con la ventana adecuada.
- Prototipado rapido de aplicaciones: los desarrolladores pueden usar el modelo para generar esqueletos de aplicaciones, scripts de automatizacion o consultas SQL, reduciendo el tiempo de desarrollo inicial.
- Razonamiento logico y resolucion de problemas: en modo creativo, puede abordar problemas de matematicas, logica o planificacion, aunque no se han publicado benchmarks especificos que cuantifiquen su rendimiento en estas tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener 3B de parametros activos, el modelo puede ejecutarse en GPUs de consumo medio. Con cuantizacion GGUF de 4 bits, se estima un uso de VRAM de aproximadamente 4-6 GB, aunque el valor exacto depende del tipo de cuantizacion y de la longitud de contexto.
- GPU recomendadas: RTX 3060 (12 GB) o superior para cuantizaciones de 4 bits; RTX 4090 o A100 para cuantizaciones mas altas o contextos largos.
- Compatibilidad con consumer GPU: si, siempre que se use cuantizacion GGUF de 4 bits o inferior y se limite la longitud de contexto.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, TGI, o cualquier framework compatible con GGUF.
- Latencia y throughput: no disponible en la informacion proporcionada, pero la arquitectura MoE con 3B activos sugiere una latencia menor que un modelo denso de 35B.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con modelos similares. Los modelos base que componen la fusion (Qwopus3.6-35B-A3B-Coder, Ornith-1.5-35B-A3B, KAT-Coder-V2.5-Dev y Qwen-AgentWorld-35B-A3B) son los referentes directos, pero no se han publicado metricas comparativas en la informacion disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos especificos, pero al ser un modelo derivado de Qwen, puede heredar sesgos presentes en los datos de entrenamiento originales.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido falso o inventado, especialmente en tareas creativas con temperatura alta.
- Limitaciones de contexto: la longitud de contexto no esta especificada en la informacion disponible; se recomienda verificar la configuracion del modelo base Qwen.
- Restricciones de idioma: solo soporta ingles y chino; no se recomienda su uso en otros idiomas sin evaluacion previa.
- Limitaciones de produccion: al ser un modelo de fusion, no se han publicado evaluaciones exhaustivas de robustez o seguridad; se recomienda validar su comportamiento en el dominio de uso antes de desplegarlo en produccion.
- Licencia: Apache 2.0 permite uso comercial, pero se debe verificar la licencia de los modelos base y de los pesos fusionados.

## Enlaces

- HuggingFace: https://huggingface.co/pragmaticcs/SignOfFour-GGUF
- Modelo base (ancla): https://huggingface.co/Jackrong/Qwopus3.6-35B-A3B-Coder
- Modelo donante 1: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Modelo donante 2: https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev
- Modelo donante 3: https://huggingface.co/Qwen/Qwen-AgentWorld-35B-A3B
