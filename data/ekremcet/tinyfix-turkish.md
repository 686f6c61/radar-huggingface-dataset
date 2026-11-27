# ekremcet/tinyfix-turkish

## Resumen

TinyFix Turkish es un modelo compacto de corrección ortográfica y tipográfica para turco, desarrollado por ekremcet. Se trata de un Transformer Seq2Seq a nivel de carácter, puramente neuronal, que no depende de diccionarios externos ni de reglas regex. Con 17,8 millones de parámetros, resuelve la restauración de diacríticos turcos (cok → çok), la corrección de palabras unidas o separadas (birş ey → bir şey, herşey → her şey), errores ortográficos habituales (şöför → şoför) y reconstrucciones de erratas graves de tecleo (merhba nslsn → merhaba nasılsın).

El modelo se distribuye como un bundle ONNX int8 de 19,54 MB, lo que permite ejecutarlo tanto en CPU como en navegador mediante onnxruntime-web (WASM/WebGPU). Incorpora una compuerta de limpieza en el encoder (`edit_head`) que decide si una frase necesita corrección, evitando decodificaciones innecesarias y reduciendo falsos positivos en modo cauteloso.

Es relevante ahora porque ofrece una alternativa ligera y sin dependencias a los correctores basados en diccionarios o modelos grandes, con licencia MIT limpia y un rendimiento medido de forma explícita sobre un benchmark propio sellado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Seq2Seq asimétrico a nivel de carácter (6 capas encoder / 3 capas decoder, d_model=384, 6 cabezas, RoPE, RMSNorm, SwiGLU) |
| Parametros totales | 17,8 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 360 tokens de entrada (max_src_tokens), decodificación hasta len(src_ids) + 24 pasos |
| Tipos de cuantizacion | int8 (ONNX) |
| Idiomas soportados | Turco (tr) |
| Licencia | MIT |
| Formato de pesos | ONNX (encoder_int8.onnx, decoder_step_int8.onnx), opset 17 |

## Arquitectura y entrenamiento

El modelo es un Transformer Seq2Seq asimétrico que opera sobre caracteres (con fallback a bytes UTF-8) con un vocabulario de 320 tokens. El encoder tiene 6 capas y el decoder 3, con d_model=384 y 6 cabezas de atención. Usa RoPE para posiciones, RMSNorm y SwiGLU en las capas feed-forward. Una innovación destacable es la compuerta de limpieza (`edit_head`) en el encoder, que produce una probabilidad de edición (`edit_prob`); si esta cae por debajo del umbral tau, la frase se devuelve sin cambios y se omite la decodificación, lo que reduce latencia y falsos positivos.

El entrenamiento se realizó sobre 3,59 millones de frases turcas limpias muestreadas de FineWeb-2 (tur_Latn, ODC-By 1.0), con corrupción sintética dinámica de múltiples errores: pérdida de diacríticos, erratas de teclado, caída de vocales, palabras unidas o separadas, errores en de/da/ki/mi, faltas canónicas, inicios en minúscula y preservación de identidad en frases limpias. No se usaron datos privados ni de clientes. No se menciona RLHF ni DPO.

## Capacidades

- Corrección ortográfica y restauración de diacríticos turcos (c, g, i, o, s, u con sus variantes).
- Corrección de palabras unidas y separadas, incluyendo casos de de/da/ki/mi.
- Corrección de faltas habituales y erratas de tecleo graves con caída de vocales.
- Preservación de frases limpias sin modificaciones (modo cauteloso con tau=0.25).
- Ejecución en CPU y navegador mediante ONNX Runtime y onnxruntime-web (WASM/WebGPU).
- Caché KV explícita para cross-attention y self-attention, con decodificación greedy.
- No soporta tool calling, agentes, visión, audio ni razonamiento multi-paso.
- Capacidad multilingüe limitada al turco; no se documentan otros idiomas.

## Casos de uso

- Atención al cliente automatizada: normalización de mensajes de usuarios con erratas y sin diacríticos antes de pasarlos a un chatbot o a un sistema de tickets, gracias al modo cauteloso que no altera frases ya correctas.
- Preprocesamiento de reseñas y redes sociales: limpieza de textos informales (por ejemplo, "urun cok guzel bide kargo cok hizli geldi") para análisis de sentimiento o indexación de búsqueda.
- Corrección en formularios web: integración en el navegador mediante onnxruntime-web para sugerir correcciones en tiempo real sin enviar datos al servidor.
- Normalización de logs y transcripciones: reparación de entradas de tecleo rápido en sistemas de soporte o call center, donde el benchmark reporta F0.5 de 94,9 en la pista call-center.
- Procesamiento por lotes en pipelines de datos: uso en Python con onnxruntime para limpiar corpus turcos antes de entrenar otros modelos o de indexar documentos.
- Educación y aprendizaje de turco: herramienta de corrección de escritura para estudiantes, con la ventaja de que el modelo es pequeño y puede ejecutarse localmente.
- Sistemas embebidos o de bajos recursos: despliegue en dispositivos sin GPU gracias al bundle int8 de 19,54 MB y a la compuerta que evita decodificación en frases limpias.

## Benchmarks y rendimiento

Evaluado sobre el split de test sellado de `ekremcet/turkish-autocorrect-bench` (1.558 ítems, chunking en límites de frase a 240 caracteres).

| Pista / Metrica | Full (tau=0.00) | Cautious (tau=0.25) |
|---|---:|---:|
| F0.5 medio (pistas de error) | 89,26 | 86,66 |
| clean broken / 10k | 2,35 | 0,00 |
| clean-tricky broken / 10k | 0,00 | 0,00 |
| no-turkish-letters F0.5 | 98,7 (99,2 % rec / 98,6 % prec) | 98,7 |
| call-center F0.5 | 94,9 (91,2 % rec / 95,9 % prec) | 94,9 |
| misspellings F0.5 | 91,8 (69,2 % rec / 100 % prec) | 79,4 (100 % prec) |
| typing-slips F0.5 | 90,2 (83,9 % rec / 91,9 % prec) | 90,0 |
| joined-split F0.5 | 88,8 (66,0 % rec / 97,2 % prec) | 86,3 |
| reviews-real F0.5 | 71,1 (8,9 broke/10k) | 70,6 (6,7 broke/10k) |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el bundle int8 ocupa 19,54 MB y puede ejecutarse en CPU.
- GPU recomendadas: no disponibles; el modelo está pensado para CPU y navegador. En GPU se reporta 1,4 ms/ítem en modo batch.
- Cabe en cualquier GPU consumer e incluso en dispositivos sin GPU dedicada.
- Opciones de despliegue: onnxruntime (Python), onnxruntime-web (WASM/WebGPU). No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: aproximadamente 77 ms por frase en CPU; 5-15 ms cuando la compuerta de limpieza omite la decodificación; 1,4 ms/ítem en GPU por lotes.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. Como referencia cualitativa, se trata de un corrector neuronal específico para turco, a nivel de carácter y sin diccionario, lo que lo diferencia de correctores basados en léxico o de modelos generativos grandes; no se han encontrado alternativas comparables documentadas en la información disponible.

## Limitaciones y advertencias

- Diseñado para corrección ortográfica, de diacríticos y de límites de palabra; no realiza reescritura gramatical completa ni paráfrasis estilística.
- Nombres propios muy raros, URL y frases mezcladas con otros idiomas pueden corregirse en exceso en modo full.
- El modo cauteloso (tau=0.25) reduce falsos positivos a 0,00 palabras rotas por 10k en frases limpias, pero baja la sensibilidad en faltas de ortografía (F0.5 de 79,4 frente a 91,8 en full).
- En la pista reviews-real el rendimiento baja a F0.5 de 71,1 con 8,9 palabras rotas por 10k, lo que indica dificultad con texto real ruidoso.
- Solo soporta turco; no se documentan otros idiomas.
- Licencia MIT, sin restricciones conocidas para uso comercial.
- No se documentan sesgos específicos; al ser un modelo entrenado con FineWeb-2, puede heredar sesgos del corpus.
- Riesgo de alucinación limitado por la tarea, pero puede introducir cambios no deseados en modo full.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ekremcet/tinyfix-turkish
- Dataset de benchmark: https://huggingface.co/datasets/ekremcet/turkish-autocorrect-bench
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
