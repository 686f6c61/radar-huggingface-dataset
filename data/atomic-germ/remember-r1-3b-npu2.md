# Atomic-Germ/Remember-R1-3B-NPU2

## Resumen

Remember-R1-3B-NPU2 es una conversión cuantizada en formato Q4NX del modelo Remember-R1-3B, desarrollada por Atomic-Germ para ejecutarse exclusivamente en el motor FastFlowLM sobre NPUs AMD Ryzen AI con arquitectura XDNA2 (serie Strix Point / Ryzen AI 300 o posterior). El modelo base, Remember-R1-3B, es un modelo de razonamiento multimodal de 3 mil millones de parámetros creado por JM-Chen, diseñado para mitigar el olvido visual en contextos largos mediante recompensas de proceso durante el entrenamiento.

Esta versión cuantizada no es un archivo GGUF y no funciona con llama.cpp ni Ollama; está pensada para despliegue en hardware NPU de AMD, aprovechando los kernels optimizados de FastFlowLM. El modelo hereda la arquitectura de la familia qwen2.5vl-it, con una ventana de contexto de 262 144 tokens, y se distribuye bajo licencia Apache 2.0. Su relevancia radica en ofrecer razonamiento avanzado y capacidades multimodales en un formato compacto para inferencia en NPU de consumo, aunque con requisitos de memoria unificada elevados (unos 51 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen2.5vl-it (basada en Qwen2.5-VL) |
| Parametros totales | 3 mil millones (3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | Q4NX (formato propietario de FastFlowLM, reordenamiento de Q4_1) |
| Idiomas soportados | ingles (segun la model card; el modelo base puede tener mas, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | Q4NX (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base Remember-R1-3B emplea una arquitectura transformer multimodal derivada de Qwen2.5-VL, con capacidad para procesar texto e imagenes. Durante el entrenamiento, segun el paper de Remember-R1, se anade a la recompensa de correccion de respuestas tres recompensas de proceso definidas sobre la trayectoria de razonamiento: una recompensa de vocabulario visual que incentiva la expresion explicita de evidencia visual, y otras dos recompensas de proceso que no se detallan en la informacion disponible. El objetivo es reducir el olvido visual en contextos largos, es decir, la perdida de atencion sobre elementos visuales relevantes a medida que avanza la generacion.

La version NPU2 no introduce cambios en la arquitectura del modelo; es una reempaquetado de los pesos en formato Q4NX, un layout de cuantizacion Q4_1 reorganizado para adaptarse a los tamanos de tile y patrones de acceso a memoria de la matriz de la NPU XDNA2. Los kernels de ejecucion (xclbins) son cerrados y se toman prestados del modelo oficial Qwen3.6-35B-A3B-NPU2 de FastFlowLM, ya que comparten la misma familia de motor.

## Capacidades

- Razonamiento avanzado y multi-step reasoning, heredado del modelo base Remember-R1.
- Procesamiento multimodal: entrada de texto e imagenes (vision), con atencion especial a la retencion de evidencia visual en contextos largos.
- Generacion de texto conversacional y de instrucciones.
- Soporte de tool calling / function calling: no se menciona explicitamente en la informacion disponible, pero al derivar de Qwen2.5-VL es probable que lo herede; no confirmado.
- Capacidades multilingues: la model card indica "multilingual" en las etiquetas, aunque el campo de idiomas solo lista "en". No se especifican idiomas concretos.
- No incluye modo thinking explicito ni capacidades de audio.

## Casos de uso

- Razonamiento visual sobre documentos largos: el modelo puede analizar imagenes o diagramas dentro de documentos extensos (hasta 262 144 tokens) manteniendo la referencia a elementos visuales, util para auditorias de informes tecnicos o revision de contratos con anexos graficos.
- Asistentes de codigo con contexto amplio: gracias a su ventana de contexto, puede procesar repositorios completos o multiples archivos de codigo junto con diagramas de arquitectura, ayudando en tareas de refactorizacion o revision de codigo.
- Analisis de imagenes medicas o cientificas con razonamiento prolongado: el modelo puede mantener la atencion sobre hallazgos visuales especificos mientras razona sobre multiples imagenes o secuencias, adecuado para investigacion asistida.
- Chatbots de soporte tecnico con conocimiento visual: integrado en un sistema de atencion al cliente, puede interpretar capturas de pantalla o fotos de errores y proporcionar pasos de solucion con razonamiento multi-paso.
- Generacion de informes a partir de datos visuales: dado un conjunto de graficas y tablas, el modelo puede producir resumenes detallados y explicaciones causales, aprovechando su capacidad de razonamiento.
- Despliegue en dispositivos con NPU AMD Ryzen AI: al estar optimizado para XDNA2, puede ejecutarse en portatiles y mini-PCs con Ryzen AI 300, ofreciendo inferencia local sin conexion a la nube para aplicaciones de productividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la ficha del modelo base (JM-Chen/Remember-R1-3B) para datos de entrenamiento y evaluacion, pero no se incluyen cifras concretas en este repositorio. No se dispone de comparativas con otros modelos cuantizados en Q4NX.

## Requisitos de hardware

- VRAM: no aplica como VRAM dedicada; se requiere aproximadamente 51 GB de memoria unificada del sistema (pesos Q4NX + activaciones + cache KV).
- GPU: no compatible con GPU convencionales; requiere NPU AMD Ryzen AI con arquitectura XDNA2 (Strix Point / Ryzen AI 300 o posterior).
- CPU: cualquier CPU compatible con el stack XRT de AMD en Linux.
- RAM: minimo 51 GB de RAM unificada (sistema con memoria compartida CPU/NPU).
- Sistema operativo: Linux con el stack XRT (Xilinx Runtime) instalado.
- Opciones de despliegue: exclusivamente mediante el motor FastFlowLM (CLI `flm`), version 0.9.45 o superior. No compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa. El modelo base Remember-R1-3B se puede comparar con otros modelos de 3B multimodales como Qwen2.5-VL-3B-Instruct o MiniCPM-V 3.0, pero no se han publicado resultados de benchmarks en esta ficha. En cuanto a la version cuantizada, su principal diferencia es el formato Q4NX, que limita su uso a hardware NPU AMD, frente a formatos universales como GGUF o safetensors que funcionan en GPU y CPU. La licencia Apache 2.0 permite uso comercial sin restricciones, a diferencia de otros modelos con licencias mas restrictivas.

## Limitaciones y advertencias

- Compatibilidad restringida: el formato Q4NX solo funciona con FastFlowLM en NPU AMD XDNA2; no es portable a otros motores o hardware.
- Requisitos de memoria elevados: 51 GB de memoria unificada puede superar la capacidad de muchos equipos con Ryzen AI 300, que suelen tener 32 GB o menos.
- Kernels cerrados: los kernels de ejecucion son propietarios y se toman de otro modelo; no se distribuyen en este repositorio, lo que puede generar problemas de versionado o dependencias.
- Idioma: la model card solo lista ingles como idioma soportado, aunque las etiquetas mencionan "multilingual"; no se garantiza un rendimiento multilingue solido.
- Sesgos y alucinaciones: no se proporciona informacion especifica sobre sesgos del modelo base; como cualquier modelo de lenguaje, puede generar contenido incorrecto o inventado, especialmente en tareas de razonamiento complejo.
- Sin soporte para tool calling confirmado: aunque probablemente lo herede de Qwen2.5-VL, no esta documentado en esta version.
- Uso en produccion: requiere una infraestructura muy especifica (Linux + XRT + FastFlowLM) y no hay garantias de soporte a largo plazo para el formato Q4NX.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/Atomic-Germ/Remember-R1-3B-NPU2
- Modelo base (JM-Chen/Remember-R1-3B): https://huggingface.co/JM-Chen/Remember-R1-3B
- Repositorio GitHub de Remember-R1: https://github.com/Ch921-cell/Remember-R1
- Paper de Remember-R1 (arXiv): https://arxiv.org/html/2608.01314
- Sitio de FastFlowLM: https://fastflowlm.com
