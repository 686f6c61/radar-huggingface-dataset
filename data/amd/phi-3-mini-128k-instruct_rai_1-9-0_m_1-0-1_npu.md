# amd/Phi-3-mini-128k-instruct_rai_1.9.0_m_1.0.1_npu

## Resumen

Phi-3-mini-128k-instruct_rai_1.9.0_m_1.0.1_npu es una distribucion del modelo Phi-3-mini-128k-instruct de Microsoft, publicada por AMD en formato ONNX y optimizada especificamente para ejecutarse sobre la NPU (unidad de procesamiento neuronal) de los procesadores AMD Ryzen AI. El identificador del repositorio indica la version del runtime Ryzen AI (1.9.0) y la version del modelo compilado (m_1.0.1_npu), lo que sugiere que se trata de un artefacto de despliegue mas que de un modelo entrenado desde cero por AMD.

El modelo base, Phi-3-mini, es un transformer decoder-only de aproximadamente 3.800 millones de parametros con una ventana de contexto de 128.000 tokens, disenado por Microsoft Research para obtener un rendimiento de razonamiento y codigo competitivo con modelos mucho mas grandes. La contribucion de AMD en este repositorio es el empaquetado y la compilacion del modelo para inferencia acelerada en hardware Ryzen AI, lo que permite ejecutar localmente en portatiles y equipos de sobremesa con NPU integrada sin depender de una GPU dedicada.

Es relevante ahora porque representa el esfuerzo de AMD por ofrecer un stack completo de IA local (hardware NPU mas runtime Ryzen AI mas modelos precompilados), lo que reduce la friccion para desarrolladores que quieren desplegar modelos conversacionales en dispositivos de borde. El acceso al repositorio esta restringido y requiere aceptar condiciones en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Phi-3-mini de Microsoft) |
| Parametros totales | no disponible en la informacion proporcionada (Phi-3-mini tiene aproximadamente 3.800 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (segun el nombre del modelo) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | ingles (tag `en`) |
| Licencia | MIT |
| Formato de pesos | ONNX (tag `onnx`), compilado para NPU Ryzen AI |
| Tamano del repositorio | 2,8 GB |
| Hardware objetivo | NPU de AMD Ryzen AI (tag `ryzenai`, `m_1.0.1_npu`) |
| Runtime | Ryzen AI 1.9.0 (tag `rai_1.9.0`) |
| Pipeline | text-generation |
| Acceso | restringido (gated) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo Phi-3-mini-128k-instruct de Microsoft, un transformer decoder-only con atencion de multiples cabezas y una ventana de contexto extendida de 128.000 tokens. El sufijo "instruct" indica que el modelo fue ajustado para seguir instrucciones y mantener conversaciones multi-turno. No se dispone en la informacion proporcionada de detalles sobre el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esos datos corresponden a la ficha original del modelo base de Microsoft, no a este repositorio de AMD.

La innovacion tecnica de esta distribucion no esta en el entrenamiento, sino en el empaquetado para inferencia. El modelo se exporta a ONNX y se compila para ejecutarse sobre la NPU integrada en los procesadores AMD Ryzen AI, usando el runtime Ryzen AI en su version 1.9.0. Esto implica graficos de computacion optimizados, posible cuantizacion especifica para la NPU y un formato de pesos adaptado al hardware, que no es directamente portable a other runtimes como llama.cpp o vLLM. El tag `m_1.0.1_npu` identifica la version concreta del artefacto compilado.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones en ingles.
- Razonamiento multi-paso y tareas de matematicas de nivel escolar y universitario basico (heredadas del modelo base Phi-3-mini).
- Generacion y comprension de codigo en lenguajes habituales.
- Manejo de contextos largos de hasta 128.000 tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Capacidad multilingue limitada: el tag de idioma oficial es solo `en`, aunque el modelo base tiene cierto soporte no oficial de otros idiomas.
- No se documenta en la informacion proporcionada soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking mode).
- Ejecucion local en NPU Ryzen AI, sin necesidad de GPU dedicada ni conexion a la nube.

## Casos de uso

- Asistentes conversacionales locales en portatiles con Ryzen AI: el modelo se ejecuta sobre la NPU integrada, liberando la CPU y la GPU para otras tareas y permitiendo un asistente siempre disponible sin conexion.
- Procesamiento de documentos largos en el dispositivo: con 128.000 tokens de contexto se pueden resumir contratos, informes o manuales tecnicos sin enviar datos sensibles a servicios externos.
- Generacion de codigo en entornos de desarrollo locales: el modelo puede autocompletar funciones y explicar fragmentos de codigo directamente en el portatil del desarrollador, con latencia baja al ejecutarse en hardware dedicado.
- Atencion al cliente en kioscos o terminales de borde: despliegue de un chatbot multi-turno en equipos con NPU Ryzen AI sin infraestructura cloud, reduciendo costes operativos y cumpliendo requisitos de privacidad.
- Analisis de correos y documentos corporativos en estaciones de trabajo: clasificacion, extraccion de entidades y resumenes ejecutados localmente sobre la NPU.
- Prototipado de aplicaciones de IA en hardware AMD: desarrolladores que quieran validar flujos de inferencia en NPU antes de migrar a GPUs o servidores pueden usar este artefacto como referencia del stack Ryzen AI.
- Educacion y demos tecnicas: ejecucion de un modelo instructivo de 3.800 millones de parametros en un portatil para talleres y pruebas de concepto sin infraestructura adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de AMD no incluye metricas propias de rendimiento (latencia, throughput ni calidad) para esta compilacion NPU. Los benchmarks del modelo base Phi-3-mini-128k-instruct (MMLU, HumanEval, GSM8K, etc.) pueden consultarse en la ficha oficial de Microsoft, pero no se reproducen aqui al no estar incluidos en la informacion proporcionada.

## Requisitos de hardware

- NPU de AMD Ryzen AI: hardware objetivo del artefacto; el tag `m_1.0.1_npu` indica compilacion especifica para esta unidad.
- Runtime Ryzen AI 1.9.0: necesario para cargar y ejecutar el modelo compilado.
- Tamano del repositorio de 2,8 GB, lo que sugiere pesos en precision reducida (probablemente cuantizacion INT8 o similar) compatibles con la memoria de la NPU y la RAM del sistema.
- VRAM estimada: no disponible en la informacion proporcionada; al ejecutarse en NPU, el consumo relevante es de memoria compartida del sistema, no de VRAM de GPU.
- GPU dedicada: no requerida para el flujo previsto; el modelo esta compilado para NPU, no para CUDA ni ROCm.
- Opciones de despliegue: exclusivamente el stack Ryzen AI (runtime 1.9.0). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este artefacto concreto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Phi-3-mini-128k-instruct (AMD, NPU) | aprox. 3.800 M (no confirmado en la ficha) | 128.000 | ONNX compilado | MIT | NPU Ryzen AI |
| Phi-3-mini-128k-instruct (Microsoft, original) | aprox. 3.800 M | 128.000 | safetensors, GGUF | MIT | GPU, CPU |
| Llama 3.2 3B Instruct | 3.000 M | 128.000 | safetensors, GGUF | licencia Llama 3.2 | GPU, CPU, edge |
| Qwen2.5 3B Instruct | 3.000 M | 32.000 | safetensors, GGUF | Apache 2.0 | GPU, CPU, edge |

La diferencia clave de esta distribucion frente a las alternativas es el formato ONNX compilado para NPU Ryzen AI, que la hace incompatible con los runtimes habituales pero potencialmente mas eficiente en equipos AMD con NPU integrada. Los datos de parametros y contexto de los modelos comparables provienen de sus fichas publicas y no de la informacion proporcionada en esta busqueda.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en HuggingFace antes de la descarga.
- Idioma: el tag oficial es solo ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Portabilidad: los pesos estan compilados para NPU Ryzen AI con el runtime 1.9.0; no se pueden cargar en llama.cpp, vLLM, Ollama ni TGI, ni ejecutar en GPUs NVIDIA o AMD sin recompilacion.
- Dependencia de hardware: requiere un procesador AMD con NPU Ryzen AI compatible; en otro hardware el artefacto es inutilizable.
- Riesgo de alucinacion: inherente a los modelos de 3.800 millones de parametros; no se han publicado evaluaciones de fidelidad para esta compilacion.
- Sesgos: no se documentan en la informacion proporcionada; el modelo base puede heredar sesgos de sus datos de entrenamiento.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones adicionales del acceso gated y las licencias de las dependencias del runtime Ryzen AI.
- Sin benchmarks propios: no hay datos publicados de latencia, throughput ni calidad para esta version NPU, lo que dificulta evaluar su idoneidad en produccion.
- Fecha de creacion futura (2026-10-30) en los metadatos del repositorio, lo que puede indicar un artefacto de preproduccion o un error de marcado; conviene verificarlo antes de adoptarlo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/amd/Phi-3-mini-128k-instruct_rai_1.9.0_m_1.0.1_npu
- Modelo base Phi-3-mini-128k-instruct de Microsoft: no disponible en la informacion proporcionada (se puede localizar en HuggingFace bajo `microsoft/Phi-3-mini-128k-instruct`)
- Documentacion del runtime Ryzen AI: no disponible en la informacion proporcionada
- Papers, blogs o demos adicionales: no disponible en la informacion proporcionada
