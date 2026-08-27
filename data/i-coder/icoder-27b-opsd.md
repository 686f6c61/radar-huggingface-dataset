# i-Coder/iCoder-27B-OPSD

## Resumen

iCoder-27B-OPSD es un checkpoint intermedio del pipeline de entrenamiento del modelo iCoder-27B, desarrollado por el equipo i-Coder. Se trata de un modelo de 27.356 millones de parámetros, basado en Qwen3.6-27B, especializado en diseño de circuitos digitales (RTL/Verilog) y optimización de kernels GPU (Triton/CUDA). Su particularidad es que el propio pipeline de entrenamiento ha sido ejecutado y revisado por un agente autónomo, lo que lo convierte en un artefacto de investigación más que en un producto final.

Este checkpoint corresponde a la segunda etapa del pipeline, denominada OPSD (on-policy self-distillation), que parte del modelo iCoder-27B-SFT y precede a la etapa de RLVR (reinforcement learning with verifiable rewards). El modelo final liberado es i-Coder/iCoder-27B, mientras que este checkpoint se publica para permitir reproducir, ablacionar o medir la contribución de la etapa RLVR. No ha recibido preparación para despliegue en producción, por lo que su uso previsto es exclusivamente investigador.

La relevancia de este modelo radica en que documenta un enfoque novedoso de entrenamiento autónomo, donde un agente gestiona y revisa cada fase del proceso. Aunque no se han publicado benchmarks específicos para este checkpoint, su arquitectura heredada de Qwen3.6-27B y su especialización en dominios técnicos de hardware lo convierten en una pieza interesante para estudiar metodologías de auto-mejora en modelos de lenguaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.6-27B) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, cuantizacion posterior posible) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen3.6-27B, un transformer denso de 27 mil millones de parámetros. No se especifican detalles adicionales sobre la configuración interna (número de capas, heads, etc.) en la información disponible. El entrenamiento sigue un pipeline de tres etapas: primero un fine-tuning supervisado (SFT) que produce iCoder-27B-SFT, luego la etapa OPSD (on-policy self-distillation) que da lugar a este checkpoint, y finalmente una etapa de RLVR (reinforcement learning with verifiable rewards) que genera el modelo final iCoder-27B.

La etapa OPSD consiste en un proceso de auto-destilación on-policy, donde el modelo genera sus propias muestras de entrenamiento y se ajusta sobre ellas, sin intervención humana directa. No se han publicado detalles sobre el volumen de datos, la composición del dataset ni las técnicas específicas de regularización empleadas. El desarrollo del pipeline ha sido gestionado por un agente autónomo que ejecuta y revisa cada etapa, lo que constituye una innovación metodológica destacable, aunque no se describen los mecanismos de control de calidad aplicados.

## Capacidades

- Generación de texto y conversación: al ser un modelo de lenguaje basado en Qwen3.6-27B, conserva capacidades generales de generación de texto y diálogo.
- Generación de código RTL: especializado en Verilog y diseño de circuitos digitales síncronos y asíncronos.
- Optimización de kernels GPU: capacidad para escribir y optimizar kernels en Triton y CUDA, orientados a acelerar operaciones de cómputo.
- Razonamiento técnico: puede abordar problemas de lógica digital, temporización y arquitectura de hardware.
- Soporte de chat: el modelo card muestra un ejemplo de uso con plantilla de chat, lo que indica soporte para conversaciones multi-turno.
- No se mencionan capacidades de tool calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Investigación de pipelines de entrenamiento autónomo: este checkpoint permite estudiar el efecto de la etapa OPSD en el rendimiento final, comparando con el modelo SFT y el modelo RLVR.
- Generación de módulos Verilog para FPGA: un desarrollador puede solicitar al modelo la implementación de contadores, máquinas de estados o interfaces de bus, y obtener código sintetizable.
- Optimización de kernels Triton para aceleración de inferencia: el modelo puede generar versiones optimizadas de operaciones como atención, normalización o convoluciones para GPUs.
- Asistencia en depuración de código RTL: dado un fragmento de Verilog con errores, el modelo puede identificar problemas de temporización o lógica y proponer correcciones.
- Generación de testbenches y bancos de pruebas: el modelo puede crear entornos de verificación para validar el comportamiento de módulos RTL.
- Documentación técnica de hardware: puede redactar comentarios, especificaciones o guías de uso para módulos de diseño digital.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo card no incluye métricas de evaluación, y la búsqueda web no arroja datos específicos para este checkpoint. Se recomienda consultar el reporte técnico del proyecto iCoder-27B para obtener resultados comparativos de las distintas etapas del pipeline.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27.356 millones de parámetros, en precisión FP16 se requieren aproximadamente 54,7 GB de VRAM (2 bytes por parámetro). Con cuantización a 4 bits (Q4_K_M), la huella se reduce a unos 16-18 GB.
- GPUs recomendadas: para FP16, una A100 80GB, H100 80GB o dos RTX 4090 en paralelo. Para cuantización Q4, una RTX 4090 24GB o RTX 3090 24GB son suficientes.
- Compatibilidad con GPUs de consumo: sí, con cuantización 4 bits cabe en tarjetas de 24 GB, aunque la velocidad de generación será limitada.
- Opciones de despliegue: transformers (carga directa con `device_map="auto"`), vLLM, llama.cpp, Ollama (si se convierte a GGUF) y TGI.
- Latencia y throughput: no disponibles para este checkpoint específico. Como referencia, un modelo de 27B en FP16 en una A100 suele generar entre 20 y 40 tokens por segundo, dependiendo de la longitud de contexto y el batch.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia |
|---|---|---|---|---|
| iCoder-27B-OPSD | 27,4B | No disponible | RTL, kernels GPU | Apache-2.0 |
| MusaCoder-27B | 27B | No disponible | PyTorch a CUDA/MUSA | No disponible |
| Qwopus3.6-27B-Coder | 27B | No disponible | Código agéntico, razonamiento | No disponible |

La comparación es cualitativa, ya que no se dispone de benchmarks públicos para iCoder-27B-OPSD. MusaCoder-27B se centra en la conversión de código PyTorch a kernels nativos, mientras que Qwopus3.6-27B-Coder está orientado a tareas de agente y razonamiento. iCoder-27B-OPSD se distingue por su enfoque en diseño RTL y optimización de kernels, así como por su origen en un pipeline autónomo.

## Limitaciones y advertencias

- Checkpoint intermedio: no está preparado para producción; puede presentar comportamientos inconsistentes o errores no corregidos por la etapa RLVR.
- Sesgos y alucinaciones: al ser un modelo de código, puede generar código sintácticamente correcto pero funcionalmente incorrecto, especialmente en diseños complejos.
- Limitaciones de idioma: no se ha especificado qué idiomas soporta; probablemente hereda el multilingüismo de Qwen3.6-27B, pero no está confirmado.
- Longitud de contexto desconocida: no se ha publicado el valor exacto, lo que dificulta planificar tareas con dependencias de largo alcance.
- Licencia Apache-2.0: permite uso comercial, pero al ser un artefacto intermedio, se recomienda validar su rendimiento antes de integrarlo en productos.
- Sin benchmarks: la ausencia de métricas publicadas impide evaluar su calidad relativa frente a otros modelos de código.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/i-Coder/iCoder-27B-OPSD
- Modelo final iCoder-27B: https://huggingface.co/i-Coder/iCoder-27B
- Modelo base SFT: https://huggingface.co/i-Coder/iCoder-27B-SFT
- Reporte técnico: no disponible en la información proporcionada.
