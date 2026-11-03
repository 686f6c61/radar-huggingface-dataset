# amd/Phi-3.5-mini-instruct_rai_1.9.0_npu

## Resumen
Phi-3.5-mini-instruct_rai_1.9.0_npu es una conversión del modelo Phi-3.5-mini-instruct de Microsoft, publicada por AMD en formato ONNX optimizado para su plataforma Ryzen AI (NPU), con el toolkit Quark. El modelo base es un transformer decoder-only de 3.800 millones de parámetros, entrenado por Microsoft sobre datos sintéticos y filtrados de alta calidad, con una longitud de contexto de 128.000 tokens y licencia MIT.

La aportación de esta variante no es el modelo en sí, sino el artefacto de despliegue: pesos ONNX cuantizados y compilados para ejecutarse en la NPU integrada de los procesadores AMD Ryzen AI, lo que permite inferencia local de un LLM de casi 4B parámetros con bajo consumo energético en equipos de sobremesa y portátiles. El sufijo `rai_1.9.0` indica la versión del runtime Ryzen AI necesaria.

Es relevante para desarrolladores que quieran ejecutar un modelo conversacional competente en hardware de consumo AMD sin depender de GPU dedicada ni de la nube. El acceso está restringido (gated) y requiere aceptar las condiciones en HuggingFace. El repositorio ocupa 4,4 GB y solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Phi-3.5) |
| Parametros totales | 3.800 millones (modelo base Phi-3.5-mini) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (modelo base); no confirmado en el artefacto ONNX |
| Tipos de cuantizacion | Cuantizacion via Quark para NPU Ryzen AI (niveles exactos no disponibles) |
| Idiomas soportados | Ingles |
| Licencia | MIT |
| Formato de pesos | ONNX (con `custom_code`, orientado a Ryzen AI NPU) |

## Arquitectura y entrenamiento
El modelo base Phi-3.5-mini-instruct es un transformer decoder-only denso de 3,8B parámetros con atención multi-cabeza estándar y RoPE, entrenado por Microsoft en dos fases: preentrenamiento sobre un corpus de billones de tokens compuesto principalmente por datos sintéticos generados por modelos mayores y datos web filtrados por calidad educativa, seguido de ajuste supervisado y optimización por preferencias (DPO) para alineamiento conversacional e instrucciones. El contexto nativo es de 128.000 tokens.

Esta publicación concreta de AMD no reentrena el modelo: aplica el toolkit Quark para cuantizar y exportar los pesos a ONNX, y los empaqueta con código personalizado (`custom_code`) para su ejecución en la NPU de Ryzen AI mediante el runtime 1.9.0. No se dispone de detalle sobre el esquema de cuantización (bits, granularidad, calibración) ni sobre posibles degradaciones de calidad respecto al modelo original.

## Capacidades
- Generación de texto conversacional multi-turno en inglés.
- Razonamiento de sentido común y matemático de nivel pequeño-medio (esperable en la clase 3-4B).
- Generación y explicación de código.
- Seguimiento de instrucciones y formato de salida estructurado.
- Soporte de contexto largo (hasta 128K en el modelo base, sujeto a la implementación ONNX).
- Ejecución en NPU Ryzen AI con consumo energético reducido.
- No se documenta soporte de tool calling nativo ni de visión en esta variante.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso
- Asistente conversacional local en portátiles y equipos de sobremesa con Ryzen AI: el modelo se ejecuta en la NPU liberando la CPU y la GPU, con latencia aceptable para chat interactivo y sin conexión a internet.
- Procesamiento de documentos en local para privacidad: resumen y extracción de información de textos largos aprovechando la ventana de 128K del modelo base, sin enviar datos a terceros.
- Autocompletado y generación de código en IDE sobre hardware sin GPU dedicada, usando el modelo como copiloto ligero en inglés.
- Prototipado de aplicaciones edge de IA generativa: validación de pipelines ONNX/Ryzen AI antes de escalar a modelos mayores.
- Clasificación y etiquetado de texto por lotes en entornos con restricciones de consumo energético, como estaciones de trabajo de campo.
- Educación y demos técnicas: despliegue de un LLM de 4B en un portátil para talleres, pruebas de concepto y benchmarking de NPUs AMD.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- NPU AMD Ryzen AI compatible con el runtime 1.9.0 (procesadores Ryzen AI 300 series y equivalentes; consultar la matriz de compatibilidad de AMD).
- Repositorio de 4,4 GB, lo que sugiere pesos cuantizados; el modelo base en FP16 ocuparía unos 7,6 GB, por lo que la cuantización reduce el footprint aproximadamente a la mitad.
- No requiere GPU dedicada: el objetivo del artefacto es la NPU integrada.
- Despliegue mediante el stack Ryzen AI (ONNX Runtime con el execution provider de AMD y el toolkit Quark); no está pensado para vLLM, llama.cpp ni Ollama en su forma actual.
- Latencia y throughput estimados: no disponibles.
- No cabe esperar ejecución en GPU consumer mediante este artefacto; para ello habría que usar el modelo original con llama.cpp o vLLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|
| Phi-3.5-mini-instruct (Microsoft) | 3,8B | 128K | MIT | Safetensors, GGUF; vLLM, llama.cpp |
| Esta variante (AMD) | 3,8B | 128K (base) | MIT | ONNX para NPU Ryzen AI |
| Llama 3.2 3B Instruct | 3,2B | 128K | Llama 3.2 Community | Safetensors, GGUF |
| Qwen2.5 3B Instruct | 3,1B | 32K | Apache 2.0 | Safetensors, GGUF |

Rendimiento comparativo: no disponible (sin benchmarks publicados para esta variante).

## Limitaciones y advertencias
- Solo inglés: no se declara soporte de castellano ni otros idiomas.
- Acceso restringido (gated): es necesario aceptar condiciones en HuggingFace antes de descargar.
- Dependencia fuerte del ecosistema Ryzen AI 1.9.0: no es portable a otras plataformas sin reconversión.
- Riesgo de alucinación inherente a modelos de 3-4B, especialmente en tareas factuales y matemáticas complejas.
- Posible degradación de calidad por la cuantización aplicada; no se documenta la pérdida respecto al modelo original.
- Sesgos heredados de los datos de entrenamiento sintéticos y web de Microsoft.
- Aunque la licencia es MIT, verificar los términos del modelo base y del runtime Ryzen AI para uso comercial en producción.
- Fecha de creación del repositorio (2026-11-02) posterior a la información de referencia disponible; conviene revisar la model card actualizada.

## Enlaces
- HuggingFace: https://huggingface.co/amd/Phi-3.5-mini-instruct_rai_1.9.0_npu
- Modelo base: https://huggingface.co/microsoft/Phi-3.5-mini-instruct
- Paper técnico de Phi-3: https://arxiv.org/abs/2404.14219
- Ryzen AI (AMD): https://www.amd.com/en/products/software/ryzen-ai.html
- Quark (AMD): https://quark.amd.com/
