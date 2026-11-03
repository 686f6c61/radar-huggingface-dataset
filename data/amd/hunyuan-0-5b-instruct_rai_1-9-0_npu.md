# amd/Hunyuan-0.5B-Instruct_rai_1.9.0_npu

## Resumen

Hunyuan-0.5B-Instruct_rai_1.9.0_npu es una distribución optimizada del modelo Tencent Hunyuan-0.5B-Instruct, publicada por AMD para su ejecución sobre las NPU (unidades de procesamiento neuronal) de la plataforma Ryzen AI 1.9.0. El modelo base es un transformer denso de 0,5 mil millones de parámetros, ajustado por instrucciones, orientado a generación de texto y conversación en inglés. AMD lo redistribuye en formato ONNX con cuantización Quark para aprovechar la aceleración hardware de las NPU integradas en los procesadores Ryzen AI (familia Strix Point y posteriores).

La relevancia de esta ficha radica en que no se trata de un modelo nuevo, sino de un artefacto de despliegue: el interés técnico está en el pipeline de conversión (ONNX + Quark + runtime Ryzen AI) que permite ejecutar un LLM de 0,5B en una NPU de PC de consumo con bajo consumo energético. Es una pieza pensada para integración en aplicaciones locales de escritorio, no para entrenamiento ni para servir cargas de trabajo en la nube.

El acceso al repositorio está restringido (gated): es necesario aceptar las condiciones en HuggingFace antes de descargar los pesos. La información pública disponible sobre arquitectura interna, dataset de entrenamiento y benchmarks del modelo base es limitada en la ficha del repositorio de AMD, por lo que varios campos de esta ficha se indican como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (tag `hunyuan_v1_dense`), ajustado por instrucciones |
| Parámetros totales | 0,5 mil millones (aproximado, según nombre del modelo) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Cuantización Quark para NPU (formato ONNX); niveles exactos no disponibles |
| Idiomas soportados | inglés (`en`) |
| Licencia | other (licencia personalizada; requiere aceptar condiciones en HuggingFace) |
| Formato de pesos | ONNX (optimizado para Ryzen AI NPU) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Hunyuan de Tencent, con arquitectura transformer densa identificada por el tag `hunyuan_v1_dense`. Se trata de un modelo de 0,5B parámetros ajustado por instrucciones (Instruct), lo que implica una fase de supervisión y presumiblemente preferencias posterior al preentrenamiento; sin embargo, el repositorio de AMD no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicó RLHF o DPO. Esos datos deben consultarse en la ficha del modelo original de Tencent, no en esta distribución.

La innovación técnica de esta publicación no está en el modelo sino en el artefacto: AMD aplica su toolchain Quark para cuantizar y exportar los pesos a ONNX, con el objetivo de que el modelo se ejecute sobre la NPU de Ryzen AI mediante el runtime correspondiente (Ryzen AI 1.9.0). Este pipeline permite descargar el cómputo del LLM a un acelerador de baja potencia en lugar de la CPU o la iGPU, lo que reduce el consumo energético y libera recursos del sistema en portátiles y mini-PC.

## Capacidades

- Generación de texto conversacional en inglés, con ajuste por instrucciones para seguir indicaciones en formato chat.
- Razonamiento básico y respuesta a preguntas de complejidad baja o media, acorde a un modelo de 0,5B parámetros.
- Generación de código y texto estructurado a nivel introductorio; no está optimizado específicamente para tareas de código.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; poco probable en un modelo de este tamaño.
- Capacidades multilingües: limitadas al inglés según la metadata del repositorio.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Ejecución en NPU AMD Ryzen AI mediante ONNX y Quark, que es la capacidad diferencial de esta distribución.

## Casos de uso

- Asistentes locales de escritorio en portátiles Ryzen AI: el modelo se ejecuta en la NPU y permite un chatbot integrado en la aplicación sin depender de la nube, con bajo consumo de batería gracias a la descarga de cómputo al acelerador neuronal.
- Autocompletado y redacción en editores de texto: al ser un modelo de 0,5B, la latencia en NPU es adecuada para sugerencias en tiempo real mientras el usuario escribe, sin bloquear la CPU.
- Clasificación y resumen de documentos cortos: útil para resumir correos, notas o fragmentos de texto en herramientas de productividad que requieran procesamiento local y privado.
- Enrutamiento de intenciones en aplicaciones de voz: el modelo puede clasificar comandos de usuario y decidir la acción siguiente dentro de un pipeline local, con la NPU como backend de inferencia.
- Prototipado y validación de pipelines Ryzen AI: sirve como modelo de referencia para desarrolladores que quieran verificar que su entorno ONNX/Quark/Ryzen AI 1.9.0 funciona antes de migrar a modelos mayores.
- Generación de respuestas en entornos sin conectividad o con requisitos de privacidad: al ejecutarse íntegramente en local, los datos del usuario no salen del dispositivo, lo que encaja en escenarios de cumplimiento estricto.
- Educación y demos de IA en el borde: permite mostrar inferencia de un LLM en hardware de consumo sin GPU dedicada, útil en talleres y demostraciones técnicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica directamente; el modelo se ejecuta en NPU. El tamaño del repositorio es de 1,1 GB, lo que da una idea del espacio en disco necesario para los pesos ONNX cuantizados.
- Hardware objetivo: NPU integrada en procesadores AMD Ryzen AI compatibles con Ryzen AI 1.9.0 (familia Strix Point y posteriores, según la denominación de AMD).
- GPU dedicadas: no son el objetivo de esta distribución; el artefacto está pensado para la NPU, no para CUDA o ROCm.
- ¿Cabe en GPU de consumo? El modelo base de 0,5B cabría en cualquier GPU con 2-4 GB de VRAM en cuantización de 4 bits, pero esta distribución concreta está empaquetada para NPU y no para GPU.
- Opciones de despliegue: runtime Ryzen AI con soporte ONNX; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / destino |
|---|---|---|---|---|
| Hunyuan-0.5B-Instruct_rai_1.9.0_npu (AMD) | ~0,5B | no disponible | other (gated) | ONNX para NPU Ryzen AI |
| Qwen2.5-0.5B-Instruct | 0,49B | 32K (según ficha pública de Qwen) | Apache 2.0 | safetensors, GGUF, múltiples runtimes |
| SmolLM2-360M-Instruct | 0,36B | 8K (según ficha pública de HuggingFace) | Apache 2.0 | safetensors, GGUF |
| Llama-3.2-1B-Instruct | 1,2B | 128K (según ficha pública de Meta) | Llama 3.2 Community License | safetensors, GGUF |

La comparativa es orientativa: los datos de los modelos alternativos provienen de sus fichas públicas y no de la información proporcionada en esta búsqueda. La diferencia clave de la distribución de AMD no es el rendimiento del modelo, sino el empaquetado para NPU y la licencia restrictiva con acceso gated.

## Limitaciones y advertencias

- El acceso es restringido (gated): es obligatorio aceptar las condiciones en HuggingFace antes de descargar los pesos, lo que puede impedir el uso automatizado en CI/CD sin gestión de tokens.
- La licencia es "other" y no se detalla en la información disponible; antes de un uso comercial es imprescindible revisar los términos exactos del modelo base de Tencent y de la redistribución de AMD.
- Modelo de 0,5B parámetros: alta probabilidad de alucinaciones, razonamiento limitado y baja fiabilidad en tareas de múltiples pasos; no es adecuado para decisiones críticas sin verificación humana.
- Solo soporta inglés según la metadata; el rendimiento en castellano no está garantizado y probablemente sea deficiente.
- La longitud de contexto no está documentada en esta ficha; no se debe asumir una ventana amplia para conversaciones largas o documentos extensos.
- Dependencia de hardware específico: requiere una NPU Ryzen AI compatible y el runtime Ryzen AI 1.9.0; no es portable a GPU NVIDIA, Apple Silicon u otros aceleradores sin reconversión.
- Artefacto de despliegue, no de investigación: no incluye información sobre sesgos, dataset de entrenamiento ni evaluaciones de seguridad; esos análisis deben buscarse en la ficha del modelo original.
- Fecha de creación del repositorio en 2026 y cero descargas/likes en el momento de la consulta: ecosistema y soporte comunitario aún inexistentes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/amd/Hunyuan-0.5B-Instruct_rai_1.9.0_npu
- Modelo base (Tencent Hunyuan): no disponible en la información proporcionada
- Documentación de Ryzen AI: no disponible en la información proporcionada
- Toolchain Quark de AMD: no disponible en la información proporcionada
- Paper o blog técnico: no disponible en la información proporcionada
