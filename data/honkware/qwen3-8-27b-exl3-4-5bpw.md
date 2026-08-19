# Honkware/Qwen3.8-27B-exl3-4.5bpw

## Resumen

Este repositorio contiene una cuantización en formato EXL3 del modelo Qwen/Qwen3.8-27B, realizada por Honkware a 4.5 bits por peso (bpw). Se trata de un modelo denso de la familia Qwen (arquitectura Qwen3.5 27B) orientado a generación de texto conversacional, con un tamaño de archivo de 18.7 GB. La cuantización emplea el formato ExLlamaV3 (EXL3) con un codebook de tipo `mul1` y cabeceras de 8 bits, lo que permite una inferencia eficiente en GPU con una pérdida de calidad mínima respecto al modelo original.

La relevancia de esta ficha radica en que ofrece una versión lista para usar del modelo Qwen3.8-27B con un equilibrio entre tamaño y rendimiento, pensada para desarrolladores que necesitan desplegar un modelo de 27B en hardware de consumo (GPUs con 24 GB de VRAM). Al ser una cuantización oficial del modelo base, mantiene la licencia Apache 2.0 y no añade restricciones adicionales. El repositorio incluye instrucciones de descarga y soporte para los principales cargadores de ExLlamaV3, como TabbyAPI, text-generation-webui y la API Python directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 27B (densa) |
| Parametros totales | 9.348.412.656 (según safetensors; el nombre del modelo base indica 27B) |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3, 4.5 bpw, head bits 8, codebook mul1 |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 (sigue la del modelo base) |
| Formato de pesos | safetensors (formato EXL3) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B pertenece a la familia Qwen3.5 y emplea una arquitectura transformer densa. No se dispone de detalles específicos sobre su entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) en la información proporcionada. La cuantización aquí presentada es una conversión EXL3 del modelo original, realizada con la herramienta BlockQuant. El proceso de cuantización utiliza 250 filas de calibración, cabeceras de 8 bits y un codebook de tipo `mul1`, que requiere ExLlamaV3 v0.0.3 o superior para una decodificación correcta. El formato EXL3 está optimizado para inferencia eficiente en GPU, con soporte para paralelismo y escalas de salida siempre activas.

## Capacidades

- Generación de texto conversacional: el modelo está diseñado para tareas de chat y generación de lenguaje natural.
- Razonamiento y comprensión: al ser un modelo de la familia Qwen, se espera un buen desempeño en tareas de razonamiento, aunque no se proporcionan benchmarks específicos.
- Capacidades multilingües: no se especifican los idiomas soportados, pero los modelos Qwen suelen cubrir múltiples lenguas.
- Sin soporte explícito para tool calling, agentes o visión en esta cuantización, ya que no se menciona en la documentación.

## Casos de uso

- Despliegue local de un asistente conversacional: con un tamaño de 18.7 GB, puede ejecutarse en GPUs de consumo (p. ej., RTX 3090/4090) mediante TabbyAPI o text-generation-webui, ofreciendo una alternativa a APIs comerciales.
- Integración en pipelines de generación de texto con ExLlamaV3: la API Python directa permite incrustar el modelo en aplicaciones personalizadas de procesamiento de lenguaje natural.
- Prototipado rápido de chatbots: gracias al formato EXL3, la carga y la inferencia son rápidas, facilitando iteraciones de desarrollo.
- Evaluación de calidad de cuantización: investigadores pueden comparar el comportamiento de este modelo cuantizado frente al original para estudiar el impacto de la reducción de precisión.
- Uso en entornos con restricciones de VRAM: al ocupar menos de 20 GB, cabe en GPUs de 24 GB, permitiendo ejecutar un modelo de 27B en hardware no profesional.
- Servicio HTTP compatible con OpenAI: mediante TabbyAPI, se puede exponer el modelo como un endpoint estándar para clientes existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como MMLU, HumanEval o GSM8K para esta cuantización ni para el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 20 GB para el modelo (18.7 GB) más overhead de contexto y activaciones; se recomiendan 24 GB para un uso cómodo.
- GPUs recomendadas: RTX 3090, RTX 4090, A100, H100 o cualquier GPU con 24 GB o más de VRAM.
- Compatibilidad con GPU de consumo: sí, cabe en RTX 3090/4090 (24 GB) y en GPUs de 16 GB con contexto reducido (p. ej., RTX 4080).
- Opciones de despliegue: ExLlamaV3 (API Python), TabbyAPI (servidor HTTP compatible con OpenAI), text-generation-webui (interfaz gráfica con loader ExLlamaV3).
- Latencia y throughput: no se especifican datos concretos; dependerán de la GPU y del contexto utilizado.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se recomienda consultar la colección de cuantizaciones de Honkware para otras versiones de bpw del mismo modelo base, o comparar con otras cuantizaciones EXL3 de modelos de tamaño similar (p. ej., Llama 3 27B o Mistral 27B) en el ecosistema ExLlamaV3.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos; al ser un modelo de Qwen, puede presentar sesgos presentes en su entrenamiento original.
- Riesgo de alucinación: como todo modelo generativo, puede producir contenido falso o inventado; se recomienda verificar salidas críticas.
- Limitaciones de contexto: no se especifica la longitud de contexto máxima; se debe consultar el modelo base para conocerla.
- Limitaciones de idioma: no se detallan los idiomas soportados; se asume cobertura multilingüe limitada a los datos de entrenamiento del modelo base.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero se deben respetar los términos del modelo base (Qwen/Qwen3.8-27B) si difieren.
- Requisito de versión: el codebook `mul1` requiere ExLlamaV3 v0.0.3 o superior; versiones antiguas decodificarán incorrectamente los pesos.
- Formato propietario: el formato EXL3 no es compatible con otros cargadores (p. ej., llama.cpp o vLLM); solo funciona con ExLlamaV3 y sus derivados.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Honkware/Qwen3.8-27B-exl3-4.5bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- TabbyAPI: https://github.com/theroyallab/tabbyAPI
- text-generation-webui: https://github.com/oobabooga/text-generation-webui
- BlockQuant (herramienta de cuantización): https://github.com/Honkware/blockquant
- Colección de cuantizaciones del autor: https://huggingface.co/collections/Honkware/qwen38-27b-exl3-6a7f89eeca48ae23da6520d1
