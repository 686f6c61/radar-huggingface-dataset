# AI-GENERATED-NO/Qwen3.5-4B-qat-GGUF-mirror

## Resumen

Este repositorio es un espejo byte a byte del archivo `Qwen3.5-4B-qat-Q4_0.gguf` publicado originalmente por Yooz Labs en `YoozLabs/Qwen3.5-4B-qat-GGUF`. No se trata de un modelo nuevo ni de un reentrenamiento: es una copia estática alojada por AI-GENERATED.NO para que su aplicación de escritorio "My AI Swiss Knife" pueda descargar los pesos desde una ubicación estable. El valor técnico reside, por tanto, en el trabajo de Yooz Labs sobre el modelo base Qwen3.5-4B de Alibaba Cloud.

El modelo base es un transformer de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones), distribuido bajo licencia Apache 2.0. Sobre él se aplicó un proceso de entrenamiento consciente de la cuantización (QAT, quantization-aware training) para producir una versión de 4 bits en formato GGUF con tipo Q4_0, lo que reduce el archivo a 2.543.899.040 bytes (unos 2,54 GB). Es relevante porque permite ejecutar un modelo de 4B en hardware de consumo con una pérdida de calidad controlada durante el entrenamiento, en lugar de una cuantización post-hoc.

La ficha se centra en las características del artefacto GGUF y del modelo base subyacente. Cualquier dato no documentado en la información disponible (idiomas, contexto, benchmarks) se marca explícitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-4B); detalles internos no disponibles |
| Parametros totales | 4.205.751.296 (4,2 B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_0 (GGUF), generada mediante quantization-aware training (QAT) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (archivo unico `Qwen3.5-4B-qat-Q4_0.gguf`, 2.543.899.040 bytes, SHA256 `1367a2b4f8dc63a1782aa1f4006767d5451b8e5d491cc241cb656fbf4b4b5e62`) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.5-4B, un transformer de 4,2 mil millones de parámetros desarrollado por el equipo Qwen de Alibaba Cloud. La información disponible no detalla la composición del dataset de preentrenamiento, el número de tokens, ni si hubo fases de RLHF o DPO. Tampoco se especifican innovaciones de atención (attention linear, decodificación especulativa u otras) más allá de lo que corresponde a la familia Qwen3.5.

La contribución específica de este artefacto es el proceso de quantization-aware training aplicado por Yooz Labs: en lugar de cuantizar los pesos después del entrenamiento, se entrena el modelo teniendo en cuenta la cuantización a 4 bits, de modo que los pesos finales en Q4_0 están optimizados para ese formato. El resultado se serializa en GGUF, el formato de llama.cpp y del ecosistema de inferencia local. El espejo no modifica ningún byte del archivo original; la integridad se verifica mediante el SHA256 indicado.

## Capacidades

- Generación de texto conversacional (tag `conversational` en el repositorio).
- Compatibilidad con endpoints de inferencia (tag `endpoints_compatible`).
- Ejecución local en formato GGUF mediante llama.cpp y derivados.
- Capacidades específicas de razonamiento, código o matemáticas del modelo base: no documentadas en la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Asistente conversacional de escritorio: el modelo se integra en la aplicación "My AI Swiss Knife" como motor local de chat, aprovechando el tamaño reducido del GGUF (2,54 GB) para descarga directa y ejecución sin conexión.
- Prototipado rápido en local: un desarrollador puede cargar el Q4_0 con llama.cpp u Ollama en un portátil con GPU de gama media para validar prompts y flujos conversacionales antes de pasar a un modelo mayor.
- Aplicaciones de privacidad estricta: al ejecutarse íntegramente en el dispositivo, permite procesar texto sensible sin enviar datos a servicios en la nube.
- Evaluación de QAT frente a cuantización post-hoc: sirve como referencia para medir la degradación de calidad de un Q4_0 entrenado conscientemente frente a un Q4_0 convencional del mismo modelo base.
- Base para ajuste fino ligero en local: al estar bajo Apache 2.0 y en GGUF, puede servir como punto de partida para experimentos de adaptación con herramientas compatibles.
- Despliegue en entornos con recursos limitados: su huella de ~2,5 GB permite alojarlo en instancias pequeñas o dispositivos edge donde un modelo de 7B o superior no cabría.
- Espejo de distribución: utilidad para pipelines de CI que necesiten una URL estable y verificable por hash para descargar el artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3,5 GB con Q4_0, dependiendo del tamaño de la ventana de contexto y del backend.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM; tarjetas de consumo como RTX 3060, RTX 4060, RTX 4070 o superiores son suficientes. En el segmento profesional, A100 o H100 no son necesarias y estarían sobredimensionadas.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU discretas modernas con 4 GB o más; también puede ejecutarse en CPU con llama.cpp a velocidades moderadas.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con servidores de inferencia que expongan API HTTP.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B QAT Q4_0 (este) | 4,2 B | No disponible | Q4_0 (GGUF, QAT) | Apache 2.0 | Hugging Face (espejo) |
| Qwen3.5-4B (base, safetensors) | 4,2 B | No disponible | FP16/BF16 | Apache 2.0 | Hugging Face (Qwen) |
| Alternativas de ~4B en GGUF | No disponible | No disponible | Q4_0 y otras | Variable | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparación cuantitativa con modelos de la misma categoría. La comparación más directa es con el propio modelo base sin cuantizar, del que este artefacto es una versión QAT a 4 bits.

## Limitaciones y advertencias

- Es un espejo no oficial: no está distribuido, respaldado ni certificado por Alibaba Cloud, y AI-GENERATED.NO no tiene afiliación con Yooz Labs ni con Alibaba Cloud.
- La cuantización Q4_0 introduce pérdida de precisión respecto al modelo en FP16/BF16, aunque el QAT mitiga parte de esa degradación; no se han publicado métricas de esa pérdida.
- Riesgo de alucinación inherente a los modelos de lenguaje de 4B; no hay evaluaciones publicadas que lo cuantifiquen.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas soportados: no disponibles; conviene validar el comportamiento en castellano antes de usarlo en producción.
- Longitud de contexto: no disponible; debe determinarse empíricamente con el runtime elegido.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda conservar el aviso de licencia y la atribución a Qwen y a Yooz Labs.
- El repositorio tiene 70 descargas y 0 likes en el momento de la consulta; es un artefacto de distribución más que un proyecto con comunidad activa.
- Verificar siempre el SHA256 del archivo descargado contra el valor publicado para garantizar la integridad del espejo.

## Enlaces

- Repositorio espejo: https://huggingface.co/AI-GENERATED-NO/Qwen3.5-4B-qat-GGUF-mirror
- Repositorio original de Yooz Labs: https://huggingface.co/YoozLabs/Qwen3.5-4B-qat-GGUF
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Aplicación del autor del espejo: https://ai-generated.no/
