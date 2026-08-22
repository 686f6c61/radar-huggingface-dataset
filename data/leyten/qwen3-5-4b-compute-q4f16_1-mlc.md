# Leyten/Qwen3.5-4B-compute-q4f16_1-MLC

## Resumen

Leyten/Qwen3.5-4B-compute-q4f16_1-MLC es una conversión de pesos del modelo Kewk/Heretical-Qwen3.5-4B, una versión "decensored" (sin censura) de Qwen3.5-4B, adaptada para ejecutarse en navegador mediante WebGPU a través de la librería WebLLM de MLC. El modelo está pensado para integrarse en la red de computación distribuida Compute Network, donde actúa como el escalón inferior de una escalera de dos modelos (el otro es Qwen3.5-9B-compute-q4f16_1-MLC) para permitir que GPUs de 6 y 8 GB contribuyan a la red.

El modelo base Qwen3.5-4B presenta una arquitectura híbrida que combina 24 capas GatedDeltaNet con 8 capas de atención completa, una innovación reciente de la familia Qwen3.5. Esta conversión concreta utiliza cuantización q4f16_1 (grupo de 32, pesos int4 y escalas fp16) y reduce la ventana de contexto a 4096 tokens para que la caché KV quepa en memoria de navegador, un ajuste necesario frente a los 262144 tokens del config original. La licencia es Apache 2.0, heredada de Qwen3.5 y del modelo fuente.

La relevancia de este modelo radica en su capacidad para ejecutar un LLM de 4B parámetros directamente en el navegador sin servidor, con un tamaño de descarga de 2,39 GB y un formato optimizado para WebGPU. Sin embargo, al tratarse de un derivado decensored, carece de alineación adicional y no debe usarse como opción segura para usuarios no confiables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 24 capas GatedDeltaNet + 8 capas de atención completa (Qwen3.5) |
| Parametros totales | 4.539.265.536 (579 tensores, 4,172 bits por parámetro) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (configurado en este build; el config original de Qwen3.5 declara 262144) |
| Tipos de cuantizacion | q4f16_1 (grupo 32, int4 pesos, fp16 escalas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLC (shards binarios, 76 archivos, 2,39 GB) |

## Arquitectura y entrenamiento

El modelo es una conversión de pesos, no un entrenamiento nuevo. El modelo fuente, Kewk/Heretical-Qwen3.5-4B, es un derivado de Qwen3.5-4B al que se ha aplicado el método "Heretic" de decensoring, basado en ablación direccional guiada por TPE (Tree-structured Parzen Estimator) con un fork personalizado. Según la model card del autor, este método reduce las negativas de 100/100 en el modelo original a 4/100, con una divergencia KL de 0,0574 respecto al modelo base. No se han publicado datos sobre el dataset de entrenamiento ni sobre el proceso de decensoring más allá de esa métrica.

La arquitectura subyacente de Qwen3.5 es híbrida: combina capas de atención lineal (GatedDeltaNet) con capas de atención completa tradicionales, lo que permite manejar contextos largos de forma más eficiente. En esta conversión, el config se ha ajustado manualmente: la ventana de contexto se reduce a 4096 tokens y el tamaño de chunk de prefill a 1024, para que la caché KV no agote la memoria del navegador. El template de conversación se fija en `qwen2` en lugar de `qwen3_5` para evitar conflictos con el toggle de thinking de WebLLM.

## Capacidades

- Generación de texto libre: el modelo es capaz de producir texto continuo en formato conversacional, usando el template `qwen2`.
- Sin censura deliberada: el decensoring elimina los rechazos del modelo base, por lo que responde a peticiones que Qwen3.5-4B original declinaría.
- Ejecución en navegador: gracias a la cuantización q4f16_1 y al formato MLC, el modelo corre en WebGPU mediante WebLLM, sin necesidad de servidor.
- Soporte de thinking mode: el config permite activar/desactivar el modo de razonamiento mediante `enable_thinking`, aunque el template `qwen2` no codifica el estado de pensamiento en el rol del asistente.
- No se documentan capacidades de tool calling, function calling, agentes, visión ni audio en la información proporcionada.

## Casos de uso

- Inferencia en navegador para aplicaciones web: el modelo puede integrarse en una SPA o extensión de navegador para generar texto localmente sin enviar datos a un servidor. Su tamaño de 2,39 GB y su compatibilidad con WebGPU lo hacen viable en equipos con GPU de 6-8 GB.
- Contribución a redes de computación distribuida: forma parte de Compute Network, donde los nodos con GPUs modestas ejecutan este modelo para atender peticiones del nivel "Pro" de la red. Es el escalón inferior de una escalera de dos modelos, permitiendo que hardware limitado participe.
- Prototipado rápido de chatbots sin censura: para entornos controlados de investigación donde se necesita explorar respuestas sin restricciones de seguridad, este modelo ofrece una base ligera y ejecutable localmente.
- Generación de texto en entornos sin conexión: al ejecutarse en el navegador, puede usarse en aplicaciones offline o con conectividad intermitente, siempre que se haya precargado el modelo.
- Evaluación de técnicas de decensoring: al comparar el comportamiento de este modelo con el Qwen3.5-4B original, los investigadores pueden medir el impacto de la ablación direccional en la calidad de las respuestas y en la tasa de rechazo.
- Despliegue en entornos educativos: para demostraciones de LLMs en aulas o talleres, donde se requiere un modelo pequeño que funcione en portátiles con GPU integrada compatible con WebGPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor indica explícitamente: "No capability benchmark has been published for this build". La única métrica disponible es la divergencia KL de 0,0574 respecto al modelo base, que es un proxy de daño por decensoring, no una medida de capacidad.

## Requisitos de hardware

- Tamaño de descarga: 2,39 GB (76 shards), lo que permite almacenamiento local en cualquier dispositivo con al menos 3 GB libres.
- VRAM estimada: el modelo requiere que la caché KV de 4096 tokens y los pesos cuantizados quepan en la memoria de la GPU. Según la descripción, está pensado para GPUs de 6 GB y 8 GB.
- GPU recomendadas: cualquier GPU compatible con WebGPU y con al menos 6 GB de VRAM. Ejemplos típicos: NVIDIA GTX 1660 Super, RTX 2060, RTX 3060, AMD RX 6600, o integradas de gama alta.
- Despliegue: exclusivamente mediante WebLLM (`@mlc-ai/web-llm` versión 0.2.84 o superior) con la librería wasm precompilada `v0_2_84/base/Qwen3.5-4B-q4f16_1_cs1k-webgpu.wasm`. No se mencionan otros runtimes como vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles. Dependen del hardware del cliente y de la implementación de WebGPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Leyten/Qwen3.5-4B-compute-q4f16_1-MLC | 4,54 B | 4096 (config) | q4f16_1 | Apache 2.0 | MLC (WebGPU) |
| Kewk/Heretical-Qwen3.5-4B (modelo fuente) | 4,54 B | 262144 (original) | no especificado | Apache 2.0 | safetensors (presumible) |
| mlc-ai/Qwen3-4B-q4f16_1-MLC (referencia) | 4 B | 32768 (Qwen3) | q4f16_1 | Apache 2.0 | MLC (WebGPU) |

No se dispone de datos de rendimiento comparativo entre estos modelos. La diferencia principal radica en el decensoring (el modelo de Leyten es un derivado sin censura) y en el contexto reducido a 4096 tokens para viabilidad en navegador. El modelo mlc-ai/Qwen3-4B es la conversión oficial de Qwen3-4B, sin decensoring, pero no se han publicado métricas de velocidad ni de calidad en la información disponible.

## Limitaciones y advertencias

- Modelo decensored: el comportamiento de rechazo del modelo base se ha eliminado deliberadamente, por lo que responderá a peticiones que el original declinaría, incluyendo contenido potencialmente dañino o ilegal.
- Sin alineación adicional: no cuenta con filtros de seguridad propios; quien lo despliegue asume toda la responsabilidad de moderación.
- Riesgo de alucinación: al ser un derivado de Qwen3.5-4B, hereda los riesgos típicos de alucinación de los LLMs, y el decensoring puede aumentar la confianza en respuestas incorrectas.
- Contexto limitado: la ventana de 4096 tokens es mucho menor que los 262144 del config original, lo que restringe el uso en tareas que requieren contexto largo.
- Dependencia de WebLLM: requiere la versión 0.2.84 o superior; versiones anteriores fallan con un error engañoso ("Value attached to scope multiple times") que no identifica el problema real.
- Sin benchmarks de capacidad: no se ha medido el impacto del decensoring en tareas de razonamiento, código o matemáticas, por lo que el rendimiento real es desconocido.
- Configuración no estándar: el template `qwen2` y los ids de token de parada (`[248046, 248044]`) difieren de los configs publicados de Qwen3.5, lo que puede causar incompatibilidades si se usa con herramientas que esperan el formato original.
- Restricciones de uso comercial: la licencia Apache 2.0 permite uso comercial, pero el contenido generado sin moderación puede acarrear responsabilidades legales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Leyten/Qwen3.5-4B-compute-q4f16_1-MLC
- Modelo fuente (Kewk/Heretical-Qwen3.5-4B): https://huggingface.co/Kewk/Heretical-Qwen3.5-4B
- Modelo hermano mayor (Leyten/Qwen3.5-9B-compute-q4f16_1-MLC): https://huggingface.co/Leyten/Qwen3.5-9B-compute-q4f16_1-MLC
- Librería wasm precompilada (binary-mlc-llm-libs): https://github.com/mlc-ai/binary-mlc-llm-libs
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Guía completa de Qwen3.5 (qwen-ai.com): https://qwen-ai.com/qwen-3-5/
- Repositorio de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
