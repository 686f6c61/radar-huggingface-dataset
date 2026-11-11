# jaesang-lee/kanana-2-v-decide-3b-2611-GGUF

## Resumen

Kanana-2-V-Decide-3B-2611 GGUF es la conversión a formato GGUF del modelo multimodal `kakaocorp/kanana-2-v-decide-3b-2611` de Kakao, publicada por el usuario jaesang-lee. No se trata de un modelo generativo al uso, sino de un modelo de decisión: dado un estado (texto, JSON o imagen), devuelve probabilidades calibradas para preguntas de tipo `choice` (elección entre opciones), `noul` (sí/no) y `score` (puntuación). Está pensado para tareas de clasificación zero-shot y extracción de señales estructuradas sobre entradas heterogéneas.

El modelo base tiene 3.180.636.672 parámetros (aproximadamente 3,18 mil millones) y soporta coreano e inglés. Esta conversión GGUF añade el proyector visual `mmproj` para entrada de imágenes y requiere una rama específica de llama.cpp (`kanana-v-decide`) que implementa la atención con compuerta del codificador visual y la decisión por similitud de coseno del endpoint `/v1/systemone`. La relevancia actual radica en que permite ejecutar un modelo de decisión multimodal en hardware de consumo mediante llama.cpp, con cuantizaciones validadas frente al original en FP32.

El autor ha publicado tres cuantizaciones (Q8_0, Q6_K-imat y Q5_K-gs-imat) con métricas de divergencia respecto al modelo original, y ha descartado explícitamente las de 4 bits por desviaciones superiores a 3 puntos porcentuales de media. Es, por tanto, una ficha orientada a desarrolladores que necesitan integrar clasificación probabilística multimodal en local con garantías de fidelidad numérica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) con codificador visual de atención con compuerta y cabeza de decisión por similitud de coseno; detalles completos de la arquitectura del backbone no disponibles |
| Parámetros totales | 3.180.636.672 (3,18 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada; el ejemplo de despliegue usa `-c 16384` |
| Tipos de cuantización | Q8_0, Q6_K con importance matrix (Q6_K-imat), Q5_K_M con importance matrix y asignación por grupo de tensores (Q5_K-gs-imat); proyector visual en F16 |
| Idiomas soportados | Coreano (ko), inglés (en) |
| Licencia | Kanana Open License (license: other); uso comercial vía API, cloud, SI, on-premise u on-device requiere licencia comercial separada de Kakao (sección 4.1) |
| Formato de pesos | GGUF (llama.cpp); el modelo base original está en safetensors/PyTorch |
| Pipeline declarado | zero-shot-classification |
| Tamaño del repositorio | 9,3 GB |
| Fecha de creación | 2026-11-10 |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal que combina un backbone de lenguaje con un codificador visual. La conversión GGUF incorpora dos elementos técnicos destacables: por un lado, el codificador visual utiliza atención con compuerta (*gated attention*), que la rama estándar de llama.cpp todavía no soporta; por otro, la cabeza de decisión del endpoint `/v1/systemone` emplea similitud de coseno para producir probabilidades sobre opciones, en lugar de una generación autoregresiva convencional. El modelo devuelve, para cada pregunta, una probabilidad de "sí" en las de tipo `noul` y un vector de probabilidades por opción en las de tipo `choice`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. El autor de la conversión sí documenta el proceso de cuantización: las matrices de importancia (*imatrix*) se calcularon a partir de prompts de calibración en el formato original del modelo (`extras/imatrix-calib-9k.gguf` de 9k y `extras/imatrix-calib-26k.gguf` de 26k), sin solapamiento con el conjunto de evaluación. La variante Q5_K-gs-imat aplica asignación de bits por grupo de tensores, asignando entre Q4_K y Q8_0 a la atención y la FFN de cada capa según su sensibilidad medida.

## Capacidades

- Clasificación zero-shot probabilística sobre texto, JSON e imágenes.
- Preguntas de tipo `noul`: devuelve la probabilidad de "sí" para una condición expresada en lenguaje natural.
- Preguntas de tipo `choice`: devuelve una probabilidad por cada opción definida con criterios y descripciones.
- Preguntas de tipo `score`: no se detalla el formato exacto de salida en la información disponible.
- Entrada multimodal: soporte de imágenes (fotos, recibos coreanos, logotipos) mediante el proyector visual `mmproj` en F16.
- Procesamiento de estados estructurados: acepta JSON como entrada además de texto plano.
- Manejo de negación, ironía, aritmética y pasajes largos (informes de incidencias) según el conjunto de evaluación del autor.
- Hasta 9 opciones por pregunta en el conjunto de evaluación documentado.
- Capacidades multilingües limitadas a coreano e inglés.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso agéntico.

## Casos de uso

- **Moderación y triaje de atención al cliente**: el modelo puede clasificar mensajes de soporte (por ejemplo, "el mismo producto se ha cobrado dos veces") en categorías como solicitud de reembolso, emoción predominante o urgencia, devolviendo probabilidades en lugar de etiquetas rígidas. El ejemplo del README ilustra exactamente este escenario con preguntas `noul` y `choice`.
- **Enrutamiento de tickets en sistemas de helpdesk**: dado un estado textual, preguntar si requiere intervención humana, si es una queja o si pertenece a facturación, y usar las probabilidades para decidir el enrutamiento con umbrales configurables.
- **Análisis de opiniones y reseñas**: clasificación de sentimiento y detección de ironía o negación sobre reseñas en coreano e inglés, con la ventaja de obtener una distribución de probabilidad por opción en lugar de una única etiqueta.
- **Verificación documental con imágenes**: procesamiento de recibos, logotipos o fotos para responder preguntas sí/no sobre su contenido (por ejemplo, si un recibo corresponde a una compra concreta), usando el proyector visual junto con cualquiera de las cuantizaciones de texto.
- **Extracción de señales en dominios regulados**: clasificación de textos financieros, médicos o legales con probabilidades calibradas, útil cuando se necesita auditar el grado de confianza de cada decisión y no solo la etiqueta final.
- **Procesamiento local de datos sensibles**: al ejecutarse con llama.cpp en hardware de consumo, permite clasificar información que no puede salir de la infraestructura del cliente, con cuantizaciones Q5_K-gs-imat de 2,28 GB que caben en equipos modestos.
- **Evaluación automática de calidad**: uso de preguntas `score` para puntuar respuestas o documentos según criterios definidos, integrable en pipelines de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí documenta una evaluación de fidelidad de las cuantizaciones frente al modelo original en FP32 sobre CPU, medida como la mayor variación de probabilidad de una opción en puntos porcentuales:

| Modelo | Media texto (IC 95 %) | Preguntas con desvío ≥ 10 %p | Respuesta top cambiada | Media conjunto de imágenes |
|---|---|---|---|---|
| F16 (no publicado) | 0,02 %p | 0 | 0 | 0,03 %p |
| Q8_0 | 0,43 %p (0,33–0,54) | 0 | 2 | 0,34 %p |
| Q6_K-imat | 1,15 %p (0,90–1,43) | 1 | 5 | 1,16 %p |
| Q5_K-gs-imat | 1,75 %p (1,44–2,07) | 1 | 10 | 0,80 %p |
| Q5_K_M plano (no publicado) | 2,33 %p (1,88–2,81) | 10 | 7 | 0,99 %p |
| Q4_K_M plano (no publicado) | 4,73 %p (3,88–5,65) | 36 | 11 | 5,12 %p |

El conjunto de evaluación de texto consta de 202 preguntas sobre 75 pasajes (soporte, reseñas, finanzas, medicina, código, legal, informes largos, ironía, negación, aritmética, hasta 9 opciones). El conjunto de imágenes consta de 18 preguntas, 12 con imagen. Los intervalos de confianza se calcularon por bootstrap sobre preguntas. Las respuestas top cambiadas corresponden a preguntas en las que el original ya era inseguro: todas tenían una diferencia de 52 %p o menos entre las dos primeras opciones, y aproximadamente la mitad por debajo de 10 %p.

## Requisitos de hardware

- **VRAM estimada**: Q8_0 requiere aproximadamente 3,4 GB para los pesos más el proyector visual F16 de 0,98 GB; Q6_K-imat, unos 2,6 GB; Q5_K-gs-imat, unos 2,3 GB. Añadir el espacio para la caché KV según la longitud de contexto configurada (el ejemplo usa 16384 tokens).
- **GPU recomendadas**: cualquier GPU con al menos 6–8 GB de VRAM para Q8_0 con contexto moderado; para contextos largos o lotes grandes conviene 12 GB o más. El autor validó con llama.cpp y Metal en un Apple M5 Pro.
- **Consumer GPU**: sí cabe en GPUs de consumo. Q5_K-gs-imat (2,28 GB) y Q6_K-imat (2,62 GB) son adecuadas para tarjetas de 6–8 GB; Q8_0 exige algo más de margen.
- **Opciones de despliegue**: llama.cpp con la rama `kanana-v-decide` del repositorio de jjss-ovdr (obligatoria; la rama estándar no soporta el modelo). El binario `llama-server` expone el endpoint `/v1/systemone`. No se documenta soporte en vLLM, TGI, Ollama ni otros motores.
- **Latencia y throughput**: no disponibles en la información proporcionada. El autor advierte que las imágenes alargan notablemente el prompt, por lo que hay que dimensionar `-c`, `-b` y `-ub` en consecuencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (modelos de decisión multimodal con salida probabilística) en la documentación proporcionada. A modo de referencia estructural, se puede comparar con el propio modelo base y con las variantes descartadas:

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kanana-2-V-Decide-3B-2611 (base, Kakao) | 3,18 B | No disponible | PyTorch/safetensors | Kanana Open License | Hugging Face (kakaocorp) |
| Esta conversión GGUF (Q8_0/Q6_K/Q5_K) | 3,18 B | No disponible | GGUF | Kanana Open License | Hugging Face (jaesang-lee) |
| Variantes Q4_K_M y Q5_K_M planas | 3,18 B | No disponible | GGUF | Kanana Open License | No publicadas por el autor |

No se identifican en la información disponible alternativas de otros fabricantes con funcionalidad equivalente de decisión probabilística multimodal.

## Limitaciones y advertencias

- **Licencia restrictiva**: la Kanana Open License exige licencia comercial separada de Kakao para ofrecer el modelo a terceros vía API, servicio cloud, SI, on-premise u on-device (sección 4.1). El uso debe cumplir las directrices de IA responsable de Kakao.
- **Soporte limitado de llama.cpp**: requiere compilar una rama no oficial (`kanana-v-decide`) del repositorio de jjss-ovdr; la rama upstream no funciona con este modelo. Esto implica riesgo de mantenimiento y de compatibilidad futura.
- **Idiomas**: solo coreano e inglés; no hay soporte documentado de castellano ni de otros idiomas.
- **Cuantizaciones de 4 bits no recomendadas**: el autor no publica variantes de 4 bits porque todas las probadas desviaron las probabilidades más de 3 %p de media. Para aplicaciones sensibles a la calibración, usar Q8_0 o Q6_K-imat.
- **Sensibilidad a la respuesta top**: en Q5_K-gs-imat, 10 preguntas cambiaron la respuesta top respecto al original; el autor recomienda leer las probabilidades completas y no solo la opción más probable.
- **Riesgo de alucinación**: no se documenta explícitamente, pero al ser un modelo de clasificación probabilística, las preguntas mal formuladas o fuera de distribución pueden producir distribuciones poco fiables.
- **Sesgos**: no se documentan sesgos conocidos en la información proporcionada.
- **Contexto no especificado**: no se indica la longitud máxima de contexto nativa del modelo; el valor de 16384 del ejemplo es una configuración de despliegue, no una especificación del modelo.
- **Imágenes**: el procesamiento de imágenes incrementa mucho la longitud del prompt y puede degradar el rendimiento si no se dimensiona correctamente el contexto y el lote.
- **Estado del repositorio**: 0 descargas y 0 likes en el momento de la consulta; es una conversión reciente y no oficial de Kakao.

## Enlaces

- Repositorio GGUF: https://huggingface.co/jaesang-lee/kanana-2-v-decide-3b-2611-GGUF
- Modelo base: https://huggingface.co/kakaocorp/kanana-2-v-decide-3b-2611
- Servidor de referencia del modelo original: https://huggingface.co/kakaocorp/kanana-2-v-decide-3b-2611/blob/main/server_kanana_v_decide.py
- Rama de llama.cpp necesaria: https://github.com/jjss-ovdr/llama.cpp/tree/kanana-v-decide
- Directrices de IA responsable de Kakao: https://www.kakaocorp.com/page/responsible/detail/guidelinesForResponsibleAI
