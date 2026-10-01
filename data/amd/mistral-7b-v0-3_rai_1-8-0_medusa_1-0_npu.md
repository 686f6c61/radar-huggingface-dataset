# amd/Mistral-7B-v0.3_rai_1.8.0_medusa_1.0_npu

## Resumen

`amd/Mistral-7B-v0.3_rai_1.8.0_medusa_1.0_npu` es un artefacto publicado por AMD que empaqueta el modelo denso Mistral-7B-v0.3 (unos 7.200 millones de parámetros) en formato ONNX, adaptado para ejecutarse sobre la NPU de los procesadores AMD Ryzen AI mediante el stack Ryzen AI 1.8.0 (RAI). El nombre del repositorio codifica además el uso de Medusa 1.0, una técnica de decodificación especulativa basada en cabezas adicionales que predicen varios tokens futuros y se validan en paralelo contra el modelo base.

El problema que aborda es la inferencia local acelerada en PC con IA: en lugar de depender de una GPU discreta o de la nube, el modelo se ejecuta en la unidad NPU integrada del procesador, con menor consumo energético y con los datos permaneciendo en el dispositivo. Es relevante porque los portátiles y mini-PC con Ryzen AI han convertido la NPU en un destino realista de inferencia para modelos de la clase 7B-8B en precisiones reducidas.

Esta ficha se basa en los metadatos públicos del repositorio (licencia Apache 2.0, idioma inglés, 8,9 GB de tamaño, acceso restringido) y en las características conocidas del modelo base Mistral-7B-v0.3. No se han publicado en la información disponible detalles del pipeline de exportación, la cuantización concreta ni resultados de benchmarks de este artefacto, por lo que esos apartados se marcan explícitamente como no disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Mistral-7B-v0.3), exportado a ONNX para NPU AMD Ryzen AI, con cabezas Medusa 1.0 para decodificación especulativa |
| Parametros totales | ~7.200 millones (modelo base Mistral-7B-v0.3); el recuento exacto del artefacto ONNX no se detalla en la información disponible |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens según el modelo base Mistral-7B-v0.3; no confirmado para el artefacto NPU en la información disponible |
| Tipos de cuantizacion | No disponible (se distribuye en ONNX para NPU; la precisión concreta no se documenta) |
| Idiomas soportados | Inglés (`en` según los metadatos del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (tag `onnx`), con variante `medusa_1.0_npu` |
| Modelo base | Mistral-7B-v0.3 |
| Version del stack | Ryzen AI 1.8.0 (`rai_1.8.0`) |
| Tecnica de aceleracion | Medusa 1.0 (decodificación especulativa con múltiples cabezas) |
| Tamano del repositorio | 8,9 GB |
| Pipeline | text-generation |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-01 |
| Fecha de actualizacion | 2026-10-01 |

## Arquitectura y entrenamiento

El modelo subyacente es Mistral-7B-v0.3: un transformer decoder-only de 32 capas con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención con consultas agrupadas (GQA) de 32 cabezas de consulta por 8 cabezas de clave/valor. La versión v0.3 amplía la ventana de contexto hasta 32.768 tokens y adopta el tokenizador v3 de Mistral (vocabulario de 32.768 entradas), además de usar una base RoPE de 1e6. Sobre este modelo, AMD ha generado un artefacto ONNX para la NPU de Ryzen AI 1.8.0 junto con cabezas Medusa 1.0.

Medusa, descrita en el artículo «Medusa: Simple LLM Inference Acceleration Framework with Multiple Decoding Heads» (arXiv:2401.10774), añade cabezas de decodificación que predicen varios tokens siguientes de forma simultánea; esos candidatos se organizan en un árbol y se verifican en un único paso hacia delante del modelo base, congelado durante el entrenamiento de las cabezas. La variante Medusa-1 (la que corresponde al sufijo `medusa_1.0` del repositorio) mantiene el modelo base intacto, de modo que la distribución de salida no debería degradarse en teoría; el artículo reporta aceleraciones superiores a 2x en las configuraciones evaluadas por sus autores. No se dispone de datos sobre el entrenamiento de las cabezas en este artefacto concreto, ni sobre el número de tokens o la composición del dataset empleado en el preentrenamiento del modelo base (Mistral no publica la composición de su corpus). No hay indicios de ajuste por instrucciones, RLHF o DPO en este repositorio: se trata de la exportación de un modelo base.

## Capacidades

- Generación de texto por completado: al ser un modelo base sin ajuste por instrucciones, su modo natural de uso es la continuación de texto y el few-shot prompting, no el diálogo conversacional.
- Razonamiento y conocimiento general: hereda las capacidades del preentrenamiento de Mistral-7B-v0.3 en tareas de comprensión lectora, sentido común y respuesta a preguntas.
- Generación de código: capaz de completar fragmentos y funciones, especialmente con ejemplos en el contexto, aunque sin las mejoras específicas de código de modelos posteriores.
- Matemáticas básicas: resolución de operaciones y problemas sencillos por generación directa; sin cadena de pensamiento entrenada ni modo «thinking».
- Capacidades multilingües: los metadatos declaran únicamente inglés; no se garantiza un rendimiento fiable en castellano u otros idiomas.
- Sin soporte declarado de tool calling ni function calling: al no estar ajustado por instrucciones ni para agentes, estas capacidades requerirían fine-tuning adicional.
- Sin capacidades multimodales: no hay visión, audio ni entrada distinta de texto.
- Decodificación especulativa con Medusa 1.0: la generación puede acelerarse mediante cabezas de predicción múltiple verificadas con atención en árbol sobre la NPU.
- Ejecución en NPU Ryzen AI: inferencia sobre la unidad neural integrada, con reparto de memoria del sistema en lugar de VRAM dedicada.

## Casos de uso

- Autocompletado en aplicaciones de escritorio: integrado en un editor o procesador de textos que se ejecute en un portátil con Ryzen AI, el modelo completa frases y párrafos en local; la decodificación Medusa reduce la latencia percibida por token.
- Procesamiento de documentos confidenciales: resumen, extracción de entidades y clasificación de contratos o informes que no pueden salir del dispositivo, aprovechando la inferencia sobre NPU y la ventana de 32.768 tokens para documentos largos.
- Recuperación aumentada (RAG) local: indexación de una base documental propia y generación de respuestas con los fragmentos recuperados en el contexto, con el corpus y las consultas permaneciendo en el equipo.
- Base para fine-tuning y posterior exportación: ajuste con LoRA sobre Mistral-7B-v0.3 para un dominio concreto y nueva conversión a ONNX con el flujo de Ryzen AI 1.8.0 para desplegarlo en NPU.
- Banco de pruebas de decodificación especulativa: comparar la latencia y el throughput de Medusa 1.0 frente a la decodificación autorregresiva estándar sobre el mismo hardware NPU, validando la equivalencia de las salidas.
- Generación de datos sintéticos y aumento de datasets: producción masiva de textos, paráfrasis o pares pregunta-respuesta en pipelines por lotes que se ejecutan de noche en equipos de sobremesa con NPU.
- Asistentes de redacción técnica en inglés: borradores de documentación, correos y descripciones a partir de indicaciones few-shot, sin coste por token de API.
- Experimentación académica en eficiencia energética: medir tokens por julio y tokens por segundo en NPU frente a CPU y GPU integrada, un eje de investigación habitual en despliegue de LLM en el borde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tabla de evaluaciones (MMLU, HumanEval, GSM8K u otras) y la búsqueda web no ha devuelto métricas asociadas a este artefacto. Tampoco se documentan cifras de latencia, throughput ni consumo para la ruta NPU con Medusa 1.0, más allá de la afirmación general del artículo de Medusa sobre aceleraciones superiores a 2x en sus propias configuraciones, que no debe extrapolarse sin medición a este export.

## Requisitos de hardware

- Destino principal: NPU de procesadores AMD Ryzen AI (arquitectura XDNA) con el stack Ryzen AI 1.8.0; el artefacto no está pensado para ejecutarse en GPU discreta.
- Memoria: la NPU comparte la memoria del sistema (LPDDR5/DDR5), repartida habitualmente desde la BIOS. Como referencia, el modelo base en bf16 ocuparía unos 14,5 GB, mientras que el repositorio ocupa 8,9 GB, lo que sugiere una representación cuantizada o comprimida cuya precisión exacta no se documenta.
- GPU consumer: no aplica a esta build; una conversión a GGUF de 4 bits del modelo base (aproximadamente 4 GB) sí cabría en GPU de 8 GB, pero sería un artefacto distinto del aquí descrito.
- Despliegue: Ryzen AI Software 1.8.0 (ONNX Runtime con el execution provider de NPU de AMD). No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no consumen este formato ONNX orientado a NPU.
- Almacenamiento: al menos 8,9 GB libres para los pesos, más espacio para el runtime y la caché de compilación de la NPU.
- Latencia y throughput: no disponibles.
- Acceso: repositorio con control de acceso; es necesario aceptar las condiciones en HuggingFace y disponer de token de autenticación para descargarlo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / plataforma | Licencia | Rendimiento |
|---|---|---|---|---|---|
| amd/Mistral-7B-v0.3_rai_1.8.0_medusa_1.0_npu | ~7,2 B | 32.768 tokens (base) | ONNX para NPU Ryzen AI 1.8.0, con Medusa 1.0 | Apache 2.0 | No disponible |
| mistralai/Mistral-7B-v0.3 | ~7,2 B | 32.768 tokens | Safetensors / PyTorch, GPU y CPU | Apache 2.0 | No disponible en la información proporcionada |
| mistralai/Mistral-7B-Instruct-v0.3 | ~7,2 B | 32.768 tokens | Safetensors / PyTorch, ajustado por instrucciones | Apache 2.0 | No disponible en la información proporcionada |
| meta-llama/Llama-3.1-8B | ~8 B | 128.000 tokens | Safetensors / PyTorch | Llama 3.1 Community License | No disponible en la información proporcionada |
| Qwen/Qwen2.5-7B | ~7,6 B | 32.768 tokens nativos (ampliable a 131.072 con YaRN) | Safetensors / PyTorch | Apache 2.0 | No disponible en la información proporcionada |

La diferencia clave frente a las alternativas no está en la calidad del modelo, sino en el destino de ejecución: este artefacto es la única de las opciones listadas que se ejecuta sobre NPU de Ryzen AI con decodificación especulativa integrada, a cambio de menor portabilidad y de un acceso restringido.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue instrucciones de chat de forma fiable; usarlo como asistente conversacional produce respuestas desalineadas con la petición.
- Idioma: los metadatos declaran solo inglés; su rendimiento en castellano no está garantizado y probablemente sea inferior al de modelos con cobertura multilingüe explícita.
- Alucinación: como cualquier LLM de 7B sin anclaje a fuentes, puede generar afirmaciones plausibles pero falsas, especialmente en dominios especializados o con contexto escaso.
- Sesgos: procede de un corpus web a gran escala cuya composición no es pública; es esperable que reproduzca sesgos de género, origen o ideología presentes en esos datos.
- Trazabilidad del artefacto: no se documentan en la ficha del repositorio la precisión de los pesos, el procedimiento de exportación ni el entrenamiento de las cabezas Medusa, lo que dificulta auditar la equivalencia funcional con el modelo base.
- Decodificación especulativa: las salidas de una ruta Medusa deben validarse contra la decodificación estándar antes de usarlas en producción, ya que pequeñas divergencias pueden acumularse en generaciones largas.
- Dependencia de plataforma: el artefacto está atado al stack Ryzen AI 1.8.0 y al hardware NPU de AMD; no es portable a otras GPU o aceleradores sin reconvertirlo.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, pero exige conservar el aviso de licencia y no concede derechos de marca; el acceso al repositorio es además restringido (gated).
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay retroalimentación de terceros sobre su comportamiento real.
- Ventana de contexto: aunque el modelo base soporta 32.768 tokens, los contextos muy largos encarecen la decodificación y pueden degradar el rendimiento en NPU; no se han publicado mediciones al respecto.
- Fechas: el repositorio está fechado el 2026-10-01, posterior a la mayoría de referencias públicas disponibles sobre Mistral-7B-v0.3; conviene verificar si existen versiones más recientes del stack Ryzen AI.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amd/Mistral-7B-v0.3_rai_1.8.0_medusa_1.0_npu
- Artículo de Medusa (decodificación especulativa con múltiples cabezas): https://arxiv.org/abs/2401.10774
- Página corporativa de AMD (resultado de la búsqueda web): https://www.amd.com/en.html
- Página corporativa de AMD en francés (resultado de la búsqueda web): https://www.amd.com/fr.html
- AMD Radeon Adrenalin Graphics Driver 26.9.2 Hotfix, TechSpot (resultado de la búsqueda web, no relacionado directamente con el modelo): https://www.techspot.com/downloads/drivers/essentials/amd-radeon-hotfix/
- AMD en Wikipedia: https://en.wikipedia.org/wiki/AMD
- Advanced Micro Devices en Wikipedia (francés): https://fr.wikipedia.org/wiki/Advanced_Micro_Devices

Nota: la búsqueda web realizada no ha devuelto documentación técnica específica de este repositorio (página de modelo en el catálogo de Ryzen AI, blog de publicación o guía de exportación). No se dispone de enlaces a demos, papers propios ni repositorios de código asociados al artefacto.
