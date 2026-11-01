# amd/SmolLM2_rai_1.9.0_m_1.0.1_npu

## Resumen

SmolLM2_rai_1.9.0_m_1.0.1_npu es una conversión del modelo SmolLM2 de Hugging Face al formato ONNX, optimizada por AMD para su ejecución en las NPU (unidades de procesamiento neuronal) de los procesadores Ryzen AI. El identificador del repositorio combina la versión del runtime de Ryzen AI (1.9.0), la revisión del modelo (m_1.0.1) y el destino de ejecución (npu). AMD publica este artefacto como parte de su ecosistema de herramientas para acelerar la inferencia de modelos generativos en hardware de PC con inteligencia artificial integrada.

El modelo base SmolLM2 es un transformer decoder-only de pequeno tamano (la familia incluye variantes de 135M, 360M y 1.7B parametros) entrenado por Hugging Face. Esta conversión concreta corresponde a la variante de 1.7B parametros, segun la nomenclatura "1.9.0" del runtime y el tamano del repositorio (0.3 GB), que es coherente con pesos cuantizados de un modelo de esa escala. El objetivo es permitir la generacion de texto y conversacion en local sobre la NPU del Ryzen AI, sin depender de GPU dedicada ni de la nube.

La relevancia de esta ficha radica en que ejemplifica el patron de despliegue de modelos pequenos en hardware de consumo con aceleracion NPU, un nicho en crecimiento para asistentes locales, privacidad de datos y aplicaciones de baja latencia. La licencia Apache 2.0 del modelo base facilita su integracion comercial, aunque el acceso al repositorio esta restringido y requiere aceptar condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2), exportado a ONNX para Ryzen AI NPU |
| Parametros totales | 1.7B (variante SmolLM2 base; no confirmado en la informacion del repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (SmolLM2 base soporta hasta 8K tokens, segun documentacion publica de Hugging Face) |
| Tipos de cuantizacion | no disponible (formato ONNX optimizado para NPU; el repo ocupa 0.3 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (optimizado para Ryzen AI NPU) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de SmolLM2, un transformer decoder-only con atencion causal estandar, disenado por Hugging Face para ser eficiente en computo y adecuado para despliegue en dispositivos. El modelo base fue entrenado sobre un corpus multilingue (principalmente ingles) de billones de tokens, con etapas de ajuste supervisado y optimizacion por preferencias (DPO) para alineamiento conversacional, segun la documentacion publica de la familia SmolLM2.

Esta version concreta no aporta cambios arquitectonicos: es una conversion a ONNX realizada por AMD para el runtime Ryzen AI 1.9.0, con optimizaciones de grafos y operadores especificos para la NPU. No se dispone de informacion en el repositorio sobre el proceso exacto de cuantizacion, el numero de tokens de entrenamiento adicionales ni si se aplico alguna tecnica de decodificacion especulativa. La innovacion principal es el empaquetado para ejecucion en NPU con el stack de AMD, que permite descargar el trabajo de inferencia de la CPU y la GPU.

## Capacidades

- Generacion de texto autoregresiva en ingles.
- Conversacion multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento basico y respuesta a instrucciones, heredado del ajuste del SmolLM2 base.
- Generacion de codigo y matematicas a nivel basico, limitado por el tamano del modelo.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- Capacidades multilingues limitadas al ingles segun los tags del repositorio.
- No se documentan modos especiales (thinking, vision, audio) en la informacion disponible.

## Casos de uso

- Asistentes locales en PC con Ryzen AI: el modelo se ejecuta en la NPU del procesador, liberando CPU y GPU para otras tareas y manteniendo los datos en el dispositivo. Adecuado para aplicaciones de escritorio con requisitos de privacidad.
- Autocompletado y generacion de texto en editores: con un modelo de 1.7B y contexto moderado, se puede integrar en IDEs o procesadores de texto para sugerencias en tiempo real sin conexion.
- Chatbot de soporte en ingles para entornos de bajos recursos: al ser un modelo pequeno y cuantizado, cabe en equipos con NPU Ryzen AI y ofrece respuestas conversacionales con latencia baja.
- Prototipado rapido de aplicaciones de IA generativa: sirve como banco de pruebas para pipelines ONNX y el runtime Ryzen AI antes de escalar a modelos mayores.
- Filtrado y clasificacion de texto en el borde: generacion de resumenes cortos o reformulacion de mensajes en aplicaciones de mensajeria local.
- Educacion y demos de inferencia en NPU: util para talleres y articulos tecnicos que muestren el flujo de conversion ONNX y despliegue en Ryzen AI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica directamente, ya que el modelo se ejecuta en la NPU; el repositorio ocupa 0.3 GB, lo que sugiere pesos cuantizados de baja precision.
- GPU recomendadas: no requiere GPU dedicada; el destino es la NPU integrada en procesadores AMD Ryzen AI (serie 7040/8040 y posteriores compatibles con el runtime 1.9.0).
- Cabe en hardware de consumo: si, en equipos con NPU Ryzen AI compatibles; no se especifican requisitos minimos de RAM del sistema en la informacion disponible.
- Opciones de despliegue: runtime Ryzen AI de AMD con modelos ONNX; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / destino | Disponibilidad |
|---|---|---|---|---|---|
| SmolLM2_rai_1.9.0_m_1.0.1_npu (este) | 1.7B (segun variante base) | no disponible | Apache 2.0 | ONNX para NPU Ryzen AI | Gated en Hugging Face |
| SmolLM2-1.7B (Hugging Face) | 1.7B | 8K (documentacion publica) | Apache 2.0 | Safetensors, GGUF | Publico |
| Qwen2.5-1.5B-Instruct | 1.5B | 32K (documentacion publica) | Apache 2.0 | Safetensors, GGUF | Publico |
| Phi-3-mini-4K-Instruct | 3.8B | 4K (documentacion publica) | MIT | Safetensors, GGUF | Publico |

La comparativa se limita a caracteristicas generales; no hay datos de rendimiento de esta conversion ONNX en la informacion disponible.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de la descarga.
- Solo ingles: los tags indican `en`; no se garantiza calidad en castellano ni en otros idiomas.
- Modelo pequeno: 1.7B parametros implica menor capacidad de razonamiento, codigo y matematicas que modelos de mayor escala; riesgo de alucinacion y errores factuales.
- Dependencia de hardware: la ejecucion esta ligada al runtime Ryzen AI 1.9.0 y a NPU compatibles; no es portable a otros aceleradores sin reconversion.
- Sin datos de benchmarks ni de cuantizacion: no se puede estimar la perdida de calidad respecto al modelo base.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de acceso del repositorio gated y las licencias del runtime de AMD.
- Sin soporte documentado de tool calling ni agentes: no apto para pipelines que requieran function calling sin verificacion previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/amd/SmolLM2_rai_1.9.0_m_1.0.1_npu
- Modelo base SmolLM2 (Hugging Face): https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
- Documentacion de Ryzen AI (AMD): https://www.amd.com/en/developer/resources/ryzen-ai-software.html
- No se han encontrado en la informacion proporcionada papers, blogs o demos adicionales especificos de esta conversion.
