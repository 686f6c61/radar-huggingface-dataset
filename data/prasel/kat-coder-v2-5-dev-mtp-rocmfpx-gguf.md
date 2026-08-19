# prasel/KAT-Coder-V2.5-Dev-MTP-ROCmFPX-GGUF

## Resumen

Este repositorio contiene una conversión al formato GGUF del modelo KAT-Coder-V2.5-Dev, un modelo de generación de texto de 35.505 millones de parámetros desarrollado por Kwaipilot, optimizada específicamente para hardware AMD mediante el motor ROCmFPX (una bifurcación de llama.cpp). La conversión incluye la inyección de un módulo MTP (Multi-Token Prediction) extraído del modelo Qwen3.6-35B-A3B, lo que permite acelerar la generación de texto en GPUs y APUs AMD, alcanzando velocidades de 80-90 tokens por segundo según la documentación.

La relevancia de este modelo radica en su enfoque en la ejecución eficiente sobre arquitecturas AMD (RDNA2, RDNA3, RDNA4 y Strix Halo), un nicho donde las cuantizaciones estándar de GGUF suelen ofrecer un rendimiento inferior. Al estar cuantizado en formatos ROCmFP4 o ROCmFP6, ofrece una alternativa de baja latencia para desarrolladores que trabajan con hardware AMD y necesitan un modelo de código de gran tamaño con inferencia local.

El repositorio incluye scripts y guías para reproducir la conversión, pero no proporciona información detallada sobre las capacidades del modelo base ni resultados de benchmarks. La licencia declarada es MIT, aunque el modelo original se distribuye bajo Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ROCmFP4, ROCmFP6 (mencionados en el proceso de conversión) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT (repositorio); Apache 2.0 (modelo base) |
| Formato de pesos | GGUF (cuantizado con ROCmFPX) |

## Arquitectura y entrenamiento

La información disponible se centra exclusivamente en el proceso de conversión, no en el diseño del modelo original. El modelo base KAT-Coder-V2.5-Dev es un transformer de 35B parámetros orientado a generación de texto y código, pero no se especifican detalles sobre su arquitectura interna (número de capas, heads, etc.), ni sobre el dataset de entrenamiento o el método de alineación (RLHF, DPO, etc.).

La innovación técnica de este repositorio reside en la integración de un módulo MTP (Multi-Token Prediction) tomado de Qwen3.6-35B-A3B, que se injerta en el modelo base antes de la conversión a GGUF. Este módulo permite predecir varios tokens a la vez, reduciendo la latencia de decodificación. El proceso utiliza la herramienta `graft_mtp.py` para combinar los pesos y posteriormente convierte el modelo a GGUF con `convert_hf_to_gguf.py` y lo cuantiza con `llama-quantize` usando los formatos ROCmFPX.

## Capacidades

- Generación de texto y código: el modelo base está diseñado para tareas de programación, como se deduce del nombre "KAT-Coder" y del ejemplo de prompt incluido en la guía (creación de un juego con Three.js).
- Conversación multi-turno: el tag `conversational` sugiere que el modelo puede mantener diálogos, aunque no se detallan parámetros específicos.
- Inferencia acelerada en AMD: gracias a la cuantización ROCmFPX y al módulo MTP, el modelo alcanza velocidades de 80-90 tokens por segundo en hardware AMD compatible.
- Compatibilidad con llama.cpp: al ser un GGUF, se puede ejecutar con las herramientas estándar de llama.cpp (llama-cli, servidores, etc.).
- No se documentan capacidades adicionales como tool calling, razonamiento multi-paso o soporte de visión/audio.

## Casos de uso

- Generación de código en entornos AMD: desarrolladores que trabajan con GPUs o APUs AMD (p.ej., Strix Halo) pueden ejecutar este modelo localmente para autocompletar código, generar funciones o escribir scripts, aprovechando las altas velocidades de inferencia.
- Asistente de programación integrado en IDEs: al ser un GGUF, se puede servir mediante el servidor de llama.cpp y conectarlo a editores como VS Code o Neovim para sugerencias en tiempo real.
- Prototipado rápido de aplicaciones de chat: el modelo soporta conversación, por lo que puede usarse como base para chatbots técnicos o asistentes de documentación, con la ventaja de ejecutarse en hardware AMD sin necesidad de GPU NVIDIA.
- Desarrollo de juegos y gráficos: el ejemplo de la model card (crear un juego con Three.js) indica que puede generar código JavaScript/HTML para aplicaciones interactivas, útil para prototipos.
- Educación y aprendizaje: estudiantes de programación pueden usar el modelo para explicar conceptos, depurar código o generar ejemplos, con la posibilidad de ejecutarlo en portátiles con APUs AMD.
- Despliegue en servidores con ROCm: en entornos de producción con GPUs AMD (p.ej., RX 7900 XTX), el modelo puede servir peticiones de generación de código con baja latencia, gracias a la optimización ROCmFPX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica de rendimiento mencionada es la velocidad de inferencia de 80-90 tokens por segundo en hardware AMD, pero no se proporcionan comparaciones con otros modelos ni resultados en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: no disponible. Dado que el modelo tiene 35.5B parámetros y se cuantiza a 4 bits (ROCmFP4), el tamaño del archivo GGUF resultante probablemente ronde los 20-25 GB, pero no se confirma en la documentación.
- GPU recomendadas: AMD Radeon o APU con soporte ROCm o Vulkan, específicamente Strix Halo (gfx1151), RDNA2, RDNA3 y RDNA4. También se menciona RX 7900 XTX como ejemplo.
- Compatibilidad con consumer GPU: sí, especialmente con las APUs Strix Halo (Ryzen AI Max) y GPUs RDNA3/RDNA4. No se indica si funciona en GPUs NVIDIA.
- Opciones de despliegue: llama.cpp (compilado con el fork ROCmFPX), llama-cli para pruebas interactivas, y potencialmente servidores compatibles con GGUF (llama-server, etc.).
- Latencia y throughput: 80-90 tokens por segundo en hardware AMD optimizado, según la model card. No se dan datos para otras configuraciones.

## Comparativa con modelos similares

No se dispone de información comparativa en la documentación del repositorio. El modelo base KAT-Coder-V2.5-Dev es un modelo de 35B parámetros orientado a código, similar en tamaño a otros como CodeLlama 34B o DeepSeek-Coder 33B, pero no se han publicado comparaciones de rendimiento. La ventaja diferencial de este repositorio es su optimización para hardware AMD, que no está disponible en las conversiones GGUF estándar.

## Limitaciones y advertencias

- Solo soporta inglés (idioma declarado).
- No hay benchmarks publicados, por lo que se desconoce la calidad real del modelo en tareas de código o razonamiento.
- La conversión es experimental: el proceso requiere ejecutar scripts personalizados y compilar binarios específicos para cada arquitectura AMD, lo que puede ser frágil y no apto para entornos de producción sin pruebas exhaustivas.
- Licencia dual: aunque el repositorio declara MIT, el modelo base se distribuye bajo Apache 2.0. Es necesario verificar qué licencia aplica al modelo final y sus implicaciones para uso comercial.
- El módulo MTP se extrae de Qwen3.6-35B-A3B, que tiene su propia licencia (no especificada en la documentación). Esto puede añadir restricciones adicionales.
- No se garantiza compatibilidad con hardware que no sea AMD; el formato ROCmFPX está diseñado específicamente para arquitecturas AMD y puede no funcionar correctamente en GPUs NVIDIA o Intel.
- Riesgo de alucinación y sesgos inherentes al modelo base, que no han sido evaluados ni documentados en este repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/prasel/KAT-Coder-V2.5-Dev-MTP-ROCmFPX-GGUF
- Modelo base: https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev
- Motor ROCmFPX: https://github.com/charlie12345/ROCmFPX
- Modelo Qwen utilizado para MTP: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Referencia de cuantización ROCmFP4: https://huggingface.co/plunderstruck/Qwen3.6-27B-MTP-ROCmFP4-GGUF
