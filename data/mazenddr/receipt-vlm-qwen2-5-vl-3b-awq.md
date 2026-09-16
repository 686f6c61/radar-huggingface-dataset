# mazenDDr/receipt-vlm-qwen2.5-vl-3b-awq

## Resumen

Receipt-vlm-qwen2.5-vl-3b-awq es un modelo visión-lenguaje especializado en la extracción estructurada de campos de recibos y tickets de compra, publicado por el usuario mazenDDr. Se construye a partir de Qwen/Qwen2.5-VL-3B-Instruct mediante un ajuste fino con QLoRA sobre el dataset CORD v2, seguido de una cuantización AWQ de 4 bits (W4A16) aplicada únicamente al modelo de lenguaje, mientras que la torre de visión se mantiene en bf16. El resultado es un checkpoint de 3,39 GB frente a los 7,51 GB de la versión bf16 equivalente, con 3.754.622.976 parámetros totales.

La relevancia del modelo es fundamentalmente práctica: demuestra que un ajuste fino de bajo coste (1,07 horas de entrenamiento en una única RTX 5060 Ti de 16 GB, con 29,9 millones de parámetros entrenables) puede producir un extractor de documentos con F1 de campo de 0,847 y latencia p50 de 1,05 s, prácticamente idéntico en precisión a su versión bf16 pero con el doble de throughput. Está pensado para servir con vLLM, que dispone de kernels W4A16 nativos, y no con transformers, cuyos lectores de compressed-tensors no cargaban este formato en el momento de su publicación.

El modelo solo está entrenado y evaluado para inglés e indonesio sobre las convenciones de anotación de CORD v2, por lo que debe entenderse como un componente de un pipeline de digitalización de recibos y no como un sistema contable autónomo. La licencia Apache-2.0 del modelo base y del ajuste permite uso comercial, con la salvedad de la atribución CC BY 4.0 del dataset.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer visión-lenguaje (familia Qwen2.5-VL: torre de visión más modelo de lenguaje) |
| Parametros totales | 3.754.622.976 (según safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada; la receta de despliegue del autor usa `--max-model-len 4096` |
| Tipos de cuantizacion | AWQ W4A16 sobre el modelo de lenguaje (4 bits, activaciones de 16 bits); la torre de visión permanece en bf16. El adaptador LoRA se entrenó sobre el base en 4-bit NF4. No se publican variantes GGUF ni otras |
| Idiomas soportados | Inglés (en) e indonesio (id) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato empaquetado de cuantización (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint Qwen2.5-VL-3B-Instruct, un transformer multimodal que combina una torre de visión con un modelo de lenguaje para tareas de image-text-to-text. El entrenamiento se realizó con QLoRA sobre una única RTX 5060 Ti de 16 GB: el modelo base se cargó en 4 bits NF4 manteniendo la torre de visión en bf16, se aplicaron adaptadores LoRA de rango 16 y alpha 32 exclusivamente sobre las capas del modelo de lenguaje, con tasa de aprendizaje 4e-4, 2 épocas y cálculo de pérdida únicamente sobre los tokens de respuesta. El proceso completo consumió 1,07 horas y un pico de 7,6 GB de VRAM, con 29,9 millones de parámetros entrenables.

Los datos de entrenamiento proceden de CORD v2 (naver-clova-ix/cord-v2, CC BY 4.0), divididos en 773 ejemplos de entrenamiento, 99 de desarrollo y 100 de test tras descartar 28 imágenes que aparecían en más de una partición según un hash perceptual de 256 bits. Todas las decisiones de diseño se tomaron sobre la partición de desarrollo y la de test se evaluó una sola vez. Tras el ajuste fino, el modelo se cuantizó a AWQ W4A16 con llm-compressor, calibrando sobre 256 recibos de entrenamiento. La innovación destacable no es arquitectónica sino de eficiencia de despliegue: la cuantización solo afecta al modelo de lenguaje, lo que reduce el tamaño a 3,39 GB y duplica el throughput de salida sin degradar de forma medible la precisión.

## Capacidades

- Extracción de campos estructurados de recibos y tickets a partir de imagen, con salida en JSON.
- Comprensión de documentos (document-understanding) y OCR implícito mediante la torre de visión, sin necesidad de un motor OCR externo.
- Generación de texto conversacional multimodal (pipeline image-text-to-text, etiqueta conversational).
- Inferencia de un solo turno por imagen en la configuración recomendada: `--limit-mm-per-prompt '{"image": 1}'`.
- Cobertura multilingüe limitada a inglés e indonesio, con las convenciones de formato de CORD v2.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada; el modelo está ajustado para extracción directa, no para planificación.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Digitalización de tickets de compra para sistemas de gastos: el modelo recibe la foto del recibo y devuelve JSON con los campos extraídos, lo que permite alimentar un ERP o una hoja de cálculo sin transcripción manual. Su F1 de campo de 0,847 sobre 100 recibos de test lo hace viable con revisión humana de los casos dudosos.
- Procesamiento por lotes a gran escala: con 103,1 tokens de salida por segundo y 1,05 s de latencia p50 en la configuración AWQ, un servidor vLLM puede procesar un volumen alto de recibos por hora con la mitad de coste de cómputo que la variante bf16.
- Despliegue en GPU de gama media: los 3,39 GB de pesos permiten servir el modelo en tarjetas con 8-16 GB de VRAM, algo relevante para empresas que quieren procesar documentos en infraestructura propia o en el borde.
- Preprocesado para conciliación contable: extracción automática de importes, fechas y comercios que después se confrontan con extractos bancarios, dejando la validación final a un humano.
- Automatización de la declaración de gastos de viaje: integración del modelo en una aplicación interna donde el empleado fotografía el recibo y el sistema rellena el formulario, reduciendo el tiempo de entrada de datos.
- Base para ajuste adicional en otros dominios documentales: al ser un checkpoint pequeño y con licencia Apache-2.0, sirve como punto de partida para reentrenar con QLoRA sobre facturas, albaranes o recibos de otras regiones, reutilizando el mismo pipeline de entrenamiento.
- Investigación en cuantización multimodal: el modelo es un caso reproducible de cuantización W4A16 aplicada solo al decodificador manteniendo la torre de visión en bf16, útil para estudiar el equilibrio entre tamaño, latencia y precisión.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor comparan esta build AWQ con su versión bf16 de origen, sobre el mismo conjunto de 100 recibos de test:

| Build | Field F1 | Latencia p50 | Tokens de salida/s |
|---|---|---|---|
| Fine-tuned bf16 | 0,852 | 2,07 s | 51,1 |
| Esta build (AWQ W4A16) | 0,847 | 1,05 s | 103,1 |

Comparación emparejada frente a su propia fuente bf16 en los mismos 100 recibos: −0,005 con intervalo [−0,026, +0,013]. El intervalo incluye el cero, por lo que el autor concluye que la diferencia no es real. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la información disponible. El hardware empleado para medir latencia y throughput no se especifica.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 3,39 GB en disco (frente a 7,51 GB del bf16); hay que añadir memoria para la caché KV, que depende de la longitud de contexto, del número de secuencias concurrentes y del modo de ejecución de vLLM.
- GPU recomendadas: el autor utilizó una RTX 5060 Ti de 16 GB para el entrenamiento QLoRA. Para inferencia con vLLM, una GPU con soporte de kernels AWQ y al menos 8-16 GB de VRAM es suficiente según el tamaño de los pesos; no se publican pruebas con A100, H100 u otras tarjetas concretas.
- Cabe en GPU de consumo: sí, es un caso de uso previsto, dado que los pesos cuantizados suman 3,39 GB. En entrenamiento, el pico medido fue de 7,6 GB de VRAM.
- Opciones de despliegue: vLLM es la vía recomendada explícitamente por el autor (`vllm serve mazenDDr/receipt-vlm-qwen2.5-vl-3b-awq --max-model-len 4096 --limit-mm-per-prompt '{"image": 1}'`). El repositorio incluye las etiquetas de Text Generation Inference (TGI) y endpoints_compatible. Transformers no es viable según el autor: la versión 5.14 con compressed-tensors 0.18 no cargaba el checkpoint y además lo habría descomprimido a bf16, perdiendo la ventaja de los pesos de 4 bits. No se menciona soporte de llama.cpp u Ollama, que no ejecutan kernels AWQ.
- Latencia y throughput: 1,05 s de latencia p50 y 103,1 tokens de salida por segundo en la build AWQ, frente a 2,07 s y 51,1 tokens/s en bf16, medidos sobre el conjunto de test de 100 recibos.

## Comparativa con modelos similares

No se han encontrado en la información proporcionada comparativas con modelos de terceros. La comparación disponible es interna al proyecto:

| Modelo | Parametros | Contexto | Field F1 | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| receipt-vlm-qwen2.5-vl-3b-awq (esta ficha) | 3.754.622.976 | no disponible (receta a 4096) | 0,847 | Apache-2.0 | safetensors AWQ, servible con vLLM |
| Fine-tuned bf16 del mismo proyecto | 3.754.622.976 | no disponible | 0,852 | Apache-2.0 | bf16, 7,51 GB |
| Qwen2.5-VL-3B-Instruct (base) | 3.754.622.976 | no disponible en la información proporcionada | no evaluado sobre CORD en esta información | Apache-2.0 | bf16, sin ajuste específico de recibos |

Alternativas de la misma categoría, como Donut ajustado sobre CORD v2 u otros extractores de documentos, no cuentan con datos de rendimiento en la información proporcionada, por lo que no se incluyen cifras comparativas.

## Limitaciones y advertencias

- Sesgo de dominio: el modelo está entrenado sobre las convenciones de un único dataset. CORD transcribe literalmente lo impreso, incluidas marcas sueltas, y los recibos indonesios usan `.` y `,` de forma intercambiable como separador de millares. El modelo ha aprendido esas convenciones, por lo que en recibos de otras procedencias el formato de salida puede no coincidir con lo esperado.
- Errores estructurales, no perceptivos: los 100 recibos de test produjeron JSON válido, pero el peor caso tenía todos los valores correctos con todas las claves equivocadas. Las convenciones de separadores explican aproximadamente un tercio de la diferencia numérica.
- Riesgo de alucinación: no cuantificado en la información disponible, pero el propio autor advierte de que el modelo «desclasifica campos con suficiente frecuencia» como para exigir revisión humana en cualquier dato con impacto financiero.
- No apto para contabilidad sin revisión: no debe usarse como fuente de verdad para cierres, impuestos o conciliaciones sin validación humana.
- Idiomas: solo inglés e indonesio. No hay evidencia de funcionamiento en castellano ni en otras lenguas.
- Contexto: la receta pública limita la ventana a 4096 tokens y a una imagen por prompt; no se documentan prestaciones con entradas más largas o múltiples imágenes.
- Restricciones de licencia: el modelo y su base son Apache-2.0, lo que permite uso comercial. El dataset CORD v2 es CC BY 4.0 y requiere atribución (Park et al., *CORD: A Consolidated Receipt Dataset for Post-OCR Parsing*, 2019).
- Dependencia de despliegue: al ser pesos AWQ, requiere motores con kernels W4A16 (vLLM). No es cargable por llama.cpp, Ollama ni, según el autor, por transformers en la versión indicada.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin validación externa independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mazenDDr/receipt-vlm-qwen2.5-vl-3b-awq
- Código, arnés de evaluación y documentación: https://github.com/mazenDDr/receipt-vlm
- Guía de campos, recorrido de un recibo y 100 extracciones registradas: https://mazenddr.github.io/receipt-vlm/
- Dataset CORD v2: https://huggingface.co/datasets/naver-clova-ix/cord-v2
- llm-compressor (herramienta de cuantización): https://github.com/vllm-project/llm-compressor
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct

Nota: la búsqueda web asociada a esta consulta no devolvió resultados relacionados con el modelo; los enlaces anteriores proceden exclusivamente de la información de HuggingFace y de la model card del autor.
