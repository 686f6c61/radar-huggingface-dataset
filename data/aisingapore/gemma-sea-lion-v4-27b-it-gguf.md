# aisingapore/Gemma-SEA-LION-v4-27B-IT-GGUF

## Resumen

Gemma-SEA-LION-v4-27B-IT-GGUF es la versión cuantizada en formato GGUF del modelo Gemma-SEA-LION-v4-27B-IT, desarrollado por AI Products Pillar de AI Singapore y financiado por el NRF de Singapur. Forma parte de la familia SEA-LION (Southeast Asian Languages In One Network), un conjunto de modelos de lenguaje entrenados y ajustados por instrucciones específicamente para la región del Sudeste Asiático. El modelo parte de la arquitectura Gemma 3 27B Instruct de Google y se ha sometido a preentrenamiento y ajuste adicional con datos multilingües de la región.

El modelo resuelve el problema de la baja representación de las lenguas del Sudeste Asiático en los LLM generalistas, cubriendo birmano, inglés, indonesio, jemer, lao, malayo, mandarín, tagalo, tamil, tailandés y vietnamita, además de javanés y sundanés. Mantiene las capacidades multimodales (imagen y texto) y la ventana de contexto de 128K tokens heredadas de Gemma 3, junto con soporte de function calling y salidas estructuradas.

Esta variante GGUF está pensada para reducir los requisitos de memoria y permitir la inferencia en GPU de consumo e incluso en un portátil con 16 GB de memoria mediante Ollama. El repositorio incluye cuantizaciones Q4_K_M, Q8_0 y BF16, además del proyector multimodal (mmproj) necesario para el procesamiento de imágenes. La licencia MIT facilita su uso comercial sin las restricciones habituales de los modelos Gemma originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basada en Gemma 3 27B Instruct) |
| Parametros totales | 27.009.346.304 (27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | Q4_K_M, Q8_0, BF16 |
| Idiomas soportados | en, zh, vi, id, th, fil, ta, ms, km, lo, my, jv, su |
| Licencia | MIT |
| Formato de pesos | GGUF (con archivo mmproj separado para visión) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de 27.000 millones de parámetros basado en Gemma 3 27B Instruct, del que hereda el tokenizador por defecto. Incorpora capacidades multimodales de comprensión de imagen y texto, incluyendo comprensión de documentos, VQA visual y razonamiento anclado en imágenes. El entrenamiento se realizó sobre un conjunto de datos que abarca birmano, inglés, indonesio, jemer, lao, malayo, mandarín, tagalo, tamil, tailandés y vietnamita, recopilados de fuentes web, código, datasets de código abierto y datos generados sintéticamente. Se muestrearon 500.000 millones de tokens de un pool total de 1 billón de tokens.

Según la model card, el ajuste por instrucciones (IT) produce un modelo que destaca en tareas del Sudeste Asiático frente a otros modelos abiertos de menos de 200.000 millones de parámetros, con un rendimiento comparable al de modelos cerrados de mayor tamaño. Esta variante GGUF se generó mediante cuantización del modelo original, preservando las capacidades de function calling y salidas estructuradas para su integración en sistemas mayores. No se detalla en la información disponible si se emplearon técnicas de RLHF o DPO específicas.

## Capacidades

- Generación de texto y razonamiento en 13 idiomas, con especial énfasis en las lenguas del Sudeste Asiático.
- Comprensión de imágenes y texto: descripción de imágenes, VQA visual, comprensión de documentos y razonamiento anclado en imágenes (requiere el archivo mmproj).
- Function calling avanzado y salidas estructuradas para integración en sistemas y pipelines.
- Soporte de conversaciones multi-turno gracias a la ventana de contexto de 128K tokens.
- Capacidades multilingües nativas en birmano, inglés, indonesio, jemer, lao, malayo, mandarín, tagalo, tamil, tailandés, vietnamita, javanés y sundanés.
- Compatibilidad con motores de inferencia basados en llama.cpp, incluido Ollama.
- Capacidad de ejecución en hardware de consumo gracias a las cuantizaciones Q4_K_M y Q8_0.

## Casos de uso

- Atención al cliente multilingüe en el Sudeste Asiático: el modelo puede gestionar conversaciones multi-turno en tailandés, vietnamita, indonesio o malayo con hasta 128K tokens de contexto, lo que permite mantener historiales largos y documentación de referencia en la misma ventana.
- Procesamiento de documentos con OCR y comprensión visual: usando el proyector mmproj, el modelo puede extraer y razonar sobre información de facturas, formularios o documentos escaneados en lenguas regionales, adecuado para digitalización de archivos administrativos.
- Generación de código y asistentes de desarrollo: el soporte de function calling y salidas estructuradas permite integrarlo en pipelines de CI/CD para autocompletado, generación de tests o revisión automatizada, con la ventaja de la licencia MIT para uso comercial.
- Traducción y localización: el modelo cubre 13 idiomas, incluidas lenguas de bajos recursos como birmano, jemer o lao, lo que lo hace útil para localización de productos y contenidos en mercados del Sudeste Asiático.
- Despliegue en el borde o en portátiles: la cuantización Q4_K_M (16,5 GB) permite ejecutar el modelo en un portátil con 16 GB de memoria mediante Ollama, habilitando asistentes locales sin conexión para entornos con requisitos de privacidad.
- Análisis de redes sociales y moderación de contenido: con contexto largo y capacidades multilingües, puede clasificar y resumir hilos de conversación en varias lenguas regionales, incluyendo javanés y sundanés, para plataformas con audiencias en Indonesia.
- Investigación lingüística y educativa: útil para tareas de generación y evaluación en lenguas del Sudeste Asiático donde los modelos generalistas tienen un rendimiento limitado, con la ventaja de pesos abiertos y licencia permisiva.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Sí incluye una tabla de rendimiento de inferencia por cuantización medida con llama.cpp sobre una NVIDIA H100, con contexto de 128K, entrada de 4K tokens y salida de 1K tokens, valores p50 sobre 10 peticiones:

| Variante | Tamano (GB) | VRAM requerida (GB) | Time to First Token (s) | Tokens por segundo |
|---|---|---|---|---|
| BF16 | 54,0 | 71,1 | 2,03 | 41,5 |
| Q8_0 | 28,7 | 47 | 3,179 | 37 |
| Q4_K_M | 16,5 | 35,5 | 2,645 | 59,9 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 71,1 GB en BF16, 47 GB en Q8_0 y 35,5 GB en Q4_K_M, según las mediciones del autor con todas las capas en GPU y contexto de 128K.
- GPU recomendadas: NVIDIA H100 para BF16 y Q8_0 con contexto completo; para Q4_K_M se requieren al menos 36 GB de VRAM, lo que incluye A100 40GB, A6000 o dos GPU de consumo.
- GPU de consumo: la model card indica que la variante Q4_K_M puede ejecutarse en un portátil con 16 GB de memoria mediante Ollama; conviene señalar que la VRAM medida por el autor (35,5 GB) corresponde a contexto de 128K con todas las capas en GPU, por lo que en configuraciones de consumo se requerirá reducir el contexto o la offload parcial.
- Opciones de despliegue: llama.cpp (llama-cli, llama-gemma3-cli para imágenes), Ollama, y motores compatibles con GGUF. El autor usó vLLM para medir TTFT y throughput, aunque las pruebas de servicio se hicieron con llama.cpp.
- Latencia y throughput: en H100, TTFT de 2,03 s y 41,5 tok/s en BF16; 3,179 s y 37 tok/s en Q8_0; 2,645 s y 59,9 tok/s en Q4_K_M (entrada 4K, salida 1K, concurrencia 1).
- Los GGUF están divididos en partes; herramientas como llama.cpp aceptan apuntar a la primera parte, y existe la opción de fusionarlas con gguf-split.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas SEA | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma-SEA-LION-v4-27B-IT-GGUF | 27B | 128K | 13 (incluye birmano, jemer, lao) | MIT | GGUF |
| Gemma 3 27B Instruct (base) | 27B | 128K | Multilingüe general, cobertura SEA limitada | Términos Gemma | Safetensors, GGUF |
| SEA-LION v3 (versiones anteriores) | Variable (no disponible) | No disponible | Sí | No disponible | No disponible |
| Qwen-SEA-LION-v4.5-27B-IT (sucesor indicado) | 27B | No disponible | Sí | No disponible | No disponible |

La model card indica que Gemma-SEA-LION-v4-27B-IT supera a otros modelos abiertos de menos de 200.000 millones de parámetros en tareas del Sudeste Asiático y se aproxima a modelos cerrados de mayor tamaño. No se dispone de cifras concretas de benchmarks comparativos en la información proporcionada.

## Limitaciones y advertencias

- El modelo no ha sido alineado para seguridad; los desarrolladores deben aplicar su propio ajuste de seguridad y medidas de protección antes de usarlo en producción.
- No se ha probado la robustez frente a prompting adversario, según la model card.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de factualidad.
- Aunque cubre 13 idiomas, las lenguas de bajos recursos (birmano, jemer, lao) pueden tener un rendimiento inferior al de inglés o indonesio; no se detallan métricas por idioma.
- La ventana de 128K tokens requiere VRAM elevada si se usa el contexto completo; en hardware de consumo habrá que reducir el contexto o la offload.
- La licencia MIT es permisiva para uso comercial, pero el modelo deriva de Gemma 3, cuyos términos originales conviene revisar en caso de redistribución.
- El repositorio ocupa 100,1 GB e incluye múltiples cuantizaciones y el proyector multimodal; es necesario descargar solo los archivos necesarios.
- La model card apunta a un sucesor (Qwen-SEA-LION-v4.5-27B-IT), lo que puede indicar que esta versión quedará progresivamente desactualizada.

## Enlaces

- Hugging Face: https://huggingface.co/aisingapore/Gemma-SEA-LION-v4-27B-IT-GGUF
- Modelo base: https://huggingface.co/aisingapore/Gemma-SEA-LION-v4-27B-IT
- Sucesor indicado: https://huggingface.co/aisingapore/Qwen-SEA-LION-v4.5-27B-IT
- Licencia MIT: https://mit-license.org/
- Guía de gguf-split en llama.cpp: https://github.com/ggerganov/llama.cpp/tree/master/examples/gguf-split
- Pesos Q4_K_M: https://huggingface.co/aisingapore/Gemma-SEA-LION-v4-27B-IT-GGUF/blob/main/Gemma-SEA-LION-v4-27B-IT-Q4_K_M.gguf
- Pesos Q8_0: https://huggingface.co/aisingapore/Gemma-SEA-LION-v4-27B-IT-GGUF/blob/main/Gemma-SEA-LION-v4-27B-IT-Q8_0.gguf
- Pesos BF16 (parte 1): https://huggingface.co/aisingapore/Gemma-SEA-LION-v4-27B-IT-GGUF/blob/main/Gemma-SEA-LION-v4-27B-IT-BF16-00001-of-00003.gguf
- Proyector multimodal: https://huggingface.co/aisingapore/Gemma-SEA-LION-v4-27B-IT-GGUF/blob/main/mmproj-Gemma-SEA-LION-v4-27B-IT.gguf
