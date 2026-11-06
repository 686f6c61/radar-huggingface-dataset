# amd/Phi-4-MM_rai_1.9.0_m_1.0.1_npu

## Resumen

Phi-4-MM es un modelo multimodal desarrollado originalmente por Microsoft Research dentro de la familia Phi-4, y esta variante concreta ha sido publicada por AMD para su despliegue en hardware con NPU (Neural Processing Unit) de la plataforma Ryzen AI. El identificador `amd/Phi-4-MM_rai_1.9.0_m_1.0.1_npu` indica que se trata de una compilación optimizada para el runtime Ryzen AI 1.9.0 (rai) con el modelo m_1.0.1, empaquetada en formato ONNX para ejecución sobre las NPU integradas en los procesadores AMD Ryzen AI (arquitecturas Strix Point y similares).

El modelo resuelve el problema de ejecutar inferencia multimodal (texto e imagen) de forma local y eficiente energéticamente sobre hardware de consumo con NPU dedicada, sin depender de GPU discretas ni de servicios en la nube. Esto lo hace relevante para aplicaciones de edge computing, asistentes locales y escenarios con requisitos de privacidad donde los datos no deben salir del dispositivo.

La información pública disponible en Hugging Face es limitada: el repositorio ocupa 2,8 GB, está en formato ONNX, soporta únicamente inglés, tiene licencia MIT y el acceso está restringido (gated), requiriendo aceptar condiciones en la plataforma. No se publican en la ficha detalles sobre arquitectura interna, número de parámetros ni longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal de la familia Phi-4, empaquetado en ONNX para NPU) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato ONNX precompilado para el runtime Ryzen AI) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | ONNX (compilado para NPU Ryzen AI, runtime rai 1.9.0) |

## Arquitectura y entrenamiento

No se dispone en la informacion proporcionada de detalles sobre la arquitectura interna, el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF o DPO. El modelo pertenece a la familia Phi-4-MM de Microsoft, que combina capacidades de texto e imagen, pero esta publicacion concreta de AMD no documenta esos aspectos.

La innovacion tecnica destacable de este artefacto no reside en el modelo en si, sino en su empaquetado: se trata de una compilacion ONNX optimizada para el runtime Ryzen AI 1.9.0, orientada a ejecutar la inferencia sobre la NPU integrada en los procesadores AMD Ryzen AI. Esta compilacion permite descargar el trabajo de computo de la CPU y la GPU hacia la NPU, reduciendo el consumo energetico y liberando recursos del sistema.

## Capacidades

- Generacion de texto conversacional en ingles, segun el pipeline declarado (`text-generation`, `conversational`).
- Capacidades multimodales heredadas de la familia Phi-4-MM (procesamiento de imagen ademas de texto), aunque la ficha no detalla la interfaz concreta de entrada multimodal en esta compilacion.
- Ejecucion local sobre NPU AMD Ryzen AI mediante el runtime Ryzen AI 1.9.0.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos del repositorio.
- Modo thinking, vision o audio explicitos: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes conversacionales locales en portatiles y equipos de sobremesa con Ryzen AI: el modelo se ejecuta sobre la NPU integrada, lo que permite mantener conversaciones sin conexion y sin enviar datos a la nube, aprovechando el bajo consumo de la NPU.
- Procesamiento de documentos con privacidad estricta: en entornos sanitarios, juridicos o financieros donde no se permite el envio de datos a servicios externos, la inferencia local sobre NPU mantiene la informacion en el dispositivo.
- Analisis de imagenes en el edge: dada la naturaleza multimodal de Phi-4-MM, puede emplearse para describir o interpretar imagenes capturadas localmente (por ejemplo, en inspeccion visual o accesibilidad) sin infraestructura cloud.
- Integracion en aplicaciones de escritorio con AMD Ryzen AI: desarrolladores que distribuyan software para esta plataforma pueden incorporar el modelo como motor de generacion de texto dentro de la propia aplicacion, usando el runtime Ryzen AI.
- Prototipado de funcionalidades de IA en equipos de desarrollo con NPU: permite validar flujos conversacionales y multimodales en hardware de consumo antes de escalar a infraestructura mayor.
- Escenarios con restricciones energeticas: al delegar el computo a la NPU, el modelo es adecuado para dispositivos alimentados por bateria donde el consumo de la GPU o la CPU seria prohibitivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- NPU AMD Ryzen AI con runtime Ryzen AI 1.9.0 (la compilacion esta etiquetada como `m_1.0.1_npu`).
- Tamano del repositorio: 2,8 GB, lo que da una idea del espacio en disco necesario para los pesos ONNX.
- VRAM estimada para inferencia: no disponible; al ejecutarse sobre NPU, la memoria relevante es la memoria compartida del sistema y la asignada a la NPU.
- GPU recomendadas: no aplica para esta compilacion; esta orientada especificamente a NPU AMD Ryzen AI.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no disponible; el artefacto esta compilado para NPU, no para CUDA.
- Opciones de despliegue: runtime Ryzen AI (rai) 1.9.0; no se documentan opciones como vLLM, llama.cpp, Ollama o TGI para este artefacto ONNX.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| amd/Phi-4-MM_rai_1.9.0_m_1.0.1_npu | no disponible | no disponible | ONNX (NPU Ryzen AI) | MIT | Gated en Hugging Face |
| Phi-4-MM (original de Microsoft) | no disponible en esta ficha | no disponible en esta ficha | safetensors (habitual) | no disponible en esta ficha | no disponible en esta ficha |
| Otros modelos ONNX para NPU AMD Ryzen AI | no disponible | no disponible | ONNX | variable | variable |

No se dispone de datos suficientes en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar el modelo.
- Idioma limitado al ingles segun los metadatos; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Dependencia estricta del runtime Ryzen AI 1.9.0 y de hardware AMD Ryzen AI con NPU; no es portable a otras plataformas sin recompilacion.
- No se documentan en la ficha sesgos conocidos, tasas de alucinacion ni evaluaciones de seguridad; se recomienda validacion propia antes de uso en produccion.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones adicionales del acceso gated y de las dependencias del runtime de AMD.
- Al ser una compilacion precompilada, las opciones de cuantizacion y ajuste fino posterior son limitadas en comparacion con los pesos originales.
- No se publican especificaciones de contexto, parametros ni benchmarks, lo que dificulta la planificacion de capacidad en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/amd/Phi-4-MM_rai_1.9.0_m_1.0.1_npu
- Documentacion del runtime Ryzen AI: no disponible en la informacion proporcionada.
- Paper o blog de Phi-4-MM: no disponible en la informacion proporcionada.
- Repositorio de codigo o demos: no disponible en la informacion proporcionada.
