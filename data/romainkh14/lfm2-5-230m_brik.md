# romainkh14/LFM2.5-230M_BRIK

## Resumen

LFM2.5-230M_BRIK es una conversión del modelo LFM2.5-230M de Liquid AI al formato BRIK, un contenedor autocontenido diseñado por el proyecto Brimkern para ejecutar modelos de lenguaje directamente en el navegador mediante WebGPU, sin servidor de inferencia ni API. El archivo resultante, de 149 MB, incluye el tokenizador embebido y los pesos precuantizados en int4 con grupo de 32, en un diseño de capas contiguas que permite carga parcial por HTTP Range, reanudación de descargas y uso offline posterior.

El modelo base, LFM2.5-230M, es el modelo más pequeño de Liquid AI, una arquitectura híbrida que combina convoluciones cortas con atención agrupada, con 14 bloques, dimensión 1024 y vocabulario de 65 536 tokens. Está orientado a fine-tuning, despliegue en edge, tool use y extracción de datos. La conversión a BRIK lo hace especialmente relevante para aplicaciones web que necesitan un asistente local en el cliente, con privacidad total y coste cero por token.

La ficha se basa en la información publicada por el autor en Hugging Face y en el sitio de Brimkern. No se dispone de especificaciones detalladas del entrenamiento original ni de benchmarks estándar más allá de las métricas funcionales reportadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: convoluciones cortas + atención agrupada (14 bloques, d=1024, vocab 65 536) |
| Parametros totales | 230M (según denominación del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4, grupo de 32 (formato BRIK) |
| Idiomas soportados | en, fr |
| Licencia | LFM Open License v1.0 (Liquid AI) |
| Formato de pesos | .brik (contenedor autocontenido, tokenizador embebido, capas como rangos HTTP contiguos) |

## Arquitectura y entrenamiento

La arquitectura del modelo base LFM2.5-230M es híbrida, combinando convoluciones de corta duración con atención agrupada (grouped attention). Consta de 14 bloques con dimensión de modelo 1024 y un vocabulario de 65 536 tokens. Esta combinación busca eficiencia computacional manteniendo capacidad de modelado secuencial.

No se proporcionan detalles sobre el entrenamiento del modelo base en la documentación consultada: ni número de tokens, ni composición del dataset, ni si se aplicó RLHF o DPO. La conversión a BRIK no modifica los pesos, solo los precuantiza a int4 (grupo de 32) en el layout exacto que leen los kernels WGSL del motor Brimkern, eliminando la necesidad de dequantización en carga. El tokenizador viaja dentro del archivo.

## Capacidades

- Generación de texto en inglés y francés.
- Lectura de documentos y respuesta basada en hechos suministrados (RAG), negándose a responder fuera de ellos (verificado en benchmarks funcionales 12/12).
- Soporte de diálogo multi-turno (33/33 en pruebas de tres rondas completas).
- Ejecución completamente local en el navegador vía WebGPU, sin envío de datos a servidores.
- Reutilización offline tras la primera carga (caché del navegador).
- Integración mediante SDK embebible (widget) o API pública (50/50 en pruebas de superficie).
- Tool use y extracción de datos, según las capacidades declaradas para el modelo base LFM2.5-230M.

## Casos de uso

- Asistente de atención al cliente en una página web: el widget de Brimkern se embebe con un conjunto de conocimientos (por ejemplo, políticas de envío) y el modelo responde solo con esa información, sin coste por token ni servidor intermedio.
- Chatbot privado en el navegador: al ejecutarse localmente, el usuario puede mantener conversaciones sin que el prompt salga de su máquina, útil para datos sensibles.
- Extracción de datos de documentos: dado un texto, el modelo puede extraer campos estructurados (fechas, nombres, importes) gracias a su capacidad de lectura de documentos y generación en formato texto.
- Generación de respuestas en francés e inglés para sitios multilingües: el modelo maneja ambos idiomas, permitiendo un asistente bilingüe sin necesidad de dos modelos.
- Prototipado rápido de aplicaciones de IA en el cliente: al ser un archivo único de 149 MB, se puede integrar en demos o MVPs sin backend, ideal para hackathons o pruebas de concepto.
- Asistente offline en aplicaciones PWA: una vez cacheado, el modelo sigue funcionando sin conexión, lo que permite funcionalidad de IA en entornos con conectividad intermitente.

## Benchmarks y rendimiento

La model card reporta métricas de rendimiento y funcionales medidas en Chrome sobre Apple Silicon (production build), con pruebas reproducibles en `scripts/e2e` del repositorio de Brimkern:

| Prueba | Resultado |
|---|---|
| Decodificación | ~158 tok/s |
| Prefill | 2 289 tok/s |
| Widget document Q&A (EN + FR, 12 casos) | 12/12, incluyendo negativa a responder fuera de los hechos |
| Diálogo en 3 rondas completas (33 casos) | 33/33 |
| Superficie de API pública (50 casos) | 50/50 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Ejecución en GPU del navegador mediante WebGPU; requiere un navegador compatible (Chrome, Edge, etc.) y una GPU con soporte WebGPU.
- Probado en Apple Silicon (laptop) con Chrome; no se especifican requisitos mínimos de VRAM.
- El archivo de 149 MB se descarga por HTTP Range y se cachea; el consumo de memoria depende del contexto y del motor, pero al ser un modelo de 230M es adecuado para GPUs integradas y discretas de gama media.
- Opciones de despliegue: mediante el SDK de Brimkern (`` o `npm i brimkern@0.3.0`), o mediante la URL de chat directa `https://brimkern.com/chat?model=romainkh14/LFM2.5-230M_BRIK`.
- No se reporta latencia ni throughput en otros entornos; las cifras indicadas son para Apple Silicon.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| LFM2.5-230M_BRIK (este) | 230M | no disponible | int4 (grupo 32) | LFM Open License v1.0 | .brik | Ejecución en navegador, 149 MB |
| RWKV-7 G1a 0.4B_BRIK | 0.4B | no disponible | int4 | Apache-2.0 | .brik | Alternativa con licencia Apache, 10/12 en benchmarks de documentos (según model card) |
| LiquidAI/LFM2.5-230M (original) | 230M | no disponible | F16 | LFM Open License v1.0 | safetensors | Modelo base, requiere servidor o librería de inferencia |

La comparativa se basa en la información de la model card y del sitio de Brimkern. No se dispone de datos de contexto ni de benchmarks estándar para estos modelos.

## Limitaciones y advertencias

- Modelo pequeño (230M): su capacidad de razonamiento complejo y conocimiento general es limitada frente a modelos de mayor tamaño.
- La cuantización int4 puede introducir una ligera degradación en la calidad de las respuestas respecto a los pesos F16 originales.
- Solo soporta inglés y francés; no cubre otros idiomas.
- La licencia LFM Open License v1.0 no es Apache-2.0; puede tener restricciones de uso comercial o de redistribución (consultar el texto de la licencia en el repositorio del modelo base).
- El formato BRIK es específico del motor Brimkern; no es compatible con otras herramientas como llama.cpp u Ollama sin conversión.
- No se han publicado evaluaciones de sesgos ni de alucinación; el riesgo de alucinación existe, especialmente fuera del contexto de documentos suministrados.
- La ejecución en navegador depende de la implementación de WebGPU del navegador y de la GPU del usuario; el rendimiento puede variar significativamente entre dispositivos.
- No se especifica la longitud de contexto soportada; para aplicaciones con documentos largos, habrá que validar empíricamente el límite.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/romainkh14/LFM2.5-230M_BRIK
- Modelo base LiquidAI/LFM2.5-230M: https://huggingface.co/LiquidAI/LFM2.5-230M
- Blog de Liquid AI sobre LFM2.5-230M: https://www.liquid.ai/blog/lfm2-5-230m
- Sitio de Brimkern: https://brimkern.com/
- Repositorio GitHub de Brimkern: https://github.com/RomainKH/Brimkern
- Especificación del formato BRIK: https://github.com/RomainKH/Brimkern/blob/main/BRIK_FORMAT.md
