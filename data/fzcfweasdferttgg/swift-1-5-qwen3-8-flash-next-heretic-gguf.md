# fzcfweasdferttgg/Swift-1.5-Qwen3.8-Flash-Next-heretic-GGUF

## Resumen

Swift 1.5 Qwen3.8-Flash-Next — Heretic v2 — GGUF es una conversión a formato GGUF del checkpoint heretic v2 derivado de Qwen3.8-Flash-Next, un modelo multimodal de tipo image-text-to-text con arquitectura híbrida de atención lineal y completa sobre una mezcla de expertos (MoE). El modelo original procede de Qwen/Qwen3.8-Flash-Next, pasa por un post-entrenamiento de eficiencia de razonamiento en ukisai/Swift1.5-Qwen3.8-Flash-Next (que reduce el consumo de tokens de pensamiento en un 63,4 % según su model card) y recibe una edición mínima de tipo heretic en jeffpeng3/Swift-1.5-Qwen3.8-Flash-Next-heretic, que aplica actualizaciones de rango 1 a 7 tensores de las proyecciones de salida de atención en las capas 30-37. Esta ficha cubre la conversión GGUF publicada por fzcfweasdferttgg.

El checkpoint cuenta con 176.943.899.520 parámetros (unos 176,9 mil millones) repartidos en 48 bloques, con 36 capas de atención lineal (Gated DeltaNet) y 12 de atención completa (QSA, una cada cuatro). La MoE contiene 512 expertos enrutados con 10 activos por token más un experto compartido, e incorpora embeddings PLE basados en hash de n-gramas, una torre de visión Qwen3-VL sin modificar y una cabeza MTP (multi-token prediction) exportada de forma separada. El contexto de entrenamiento declarado es de 262.144 tokens.

La relevancia de esta publicación es doble: por un lado, ofrece un modelo multimodal de gran escala en cuantizaciones que van de IQ4_XS (98,4 GB) a Q8_0 (188,2 GB), lo que permite desplegarlo en hardware de gama alta sin disponer del checkpoint BF16 completo de 336 GB; por otro, el empaquetado está diseñado específicamente para el motor Strata, no para llama.cpp u Ollama estándar, lo que condiciona su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 48 bloques, 36 de atención lineal (Gated DeltaNet) y 12 de atención completa (QSA, cada 4.º bloque); MoE con 512 expertos enrutados, 10 activos por token, más experto compartido; embeddings PLE de hash de n-gramas; torre de visión Qwen3-VL; cabeza MTP |
| Parametros totales | 176.943.899.520 (unos 176,9 mil millones) |
| Parametros activos | 10 de 512 expertos enrutados por token, más experto compartido (número exacto de parámetros activos no disponible) |
| Longitud de contexto | 262.144 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_1, Q5_0, Q4_K_M, Q4_K_S, Q4_1, Q4_0, IQ4_XS, IQ4_NL; proyectores de visión y cabezas MTP también cuantizados (BF16, Q6_K, Q5_K_M, Q5_K_S, Q5_1, Q5_0, Q4_K_M, Q4_K_S, Q4_1, Q4_0; IQ4_XS/IQ4_NL solo para MTP) |
| Idiomas soportados | no disponible |
| Licencia | Swift Open License v1.0 y Qwen Community License; uso comercial gratuito por debajo de 1 millón de USD de ingresos anuales |
| Formato de pesos | GGUF (shards divididos; primera shard solo de metadatos de unos 10,9 MB); proyectores de visión y cabezas MTP en GGUF separados |

## Arquitectura y entrenamiento

La arquitectura combina atención lineal y atención completa en una proporción de 3:1: de los 48 bloques, 36 usan Gated DeltaNet y 12 usan QSA (atención completa), lo que reduce el coste computacional del contexto largo frente a un transformer denso equivalente. Sobre esa columna vertebral se sitúa una MoE con 512 expertos enrutados, de los que 10 se activan por token, más un experto compartido, lo que mantiene un coste de inferencia muy por debajo del que sugeriría el recuento total de parámetros. El modelo incorpora además embeddings PLE (hash de n-gramas), una torre de visión Qwen3-VL sin modificar y una cabeza MTP para predicción multi-token. El checkpoint original tiene 131 shards safetensors y 336 GB en BF16.

El linaje de entrenamiento parte de Qwen/Qwen3.8-Flash-Next y pasa por un post-entrenamiento orientado a eficiencia de razonamiento (ukisai/Swift1.5-Qwen3.8-Flash-Next), que según su model card reduce los tokens de pensamiento en un 63,4 %. Sobre esa base, la edición heretic v2 aplica una modificación mínima: actualizaciones de rango 1 en 7 tensores de las proyecciones de salida de atención de las capas 30-37. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada. La conversión a GGUF se realizó con `convert_hf_to_gguf.py` de las fuentes de llama.cpp v0.9.0, con la fusión de entradas compartidas desactivada (tensores `attn_gate`/`attn_qkv`, `hc_*_down`/`hc_*_inject`, `ssm_alpha`/`ssm_beta` separados) y con `--no-nextn` para exportar la cabeza MTP como archivo aparte. Las cuantizaciones adicionales se generaron con `llama-quantize` desde el checkpoint BF16 original, sin matriz de importancia.

## Capacidades

- Generación de texto conversacional multi-turno, con contexto de hasta 262.144 tokens.
- Procesamiento multimodal image-text-to-text mediante la torre de visión Qwen3-VL (pipeline `image-text-to-text`).
- Razonamiento con modo de pensamiento eficiente: el post-entrenamiento de Swift 1.5 reduce el consumo de tokens de pensamiento en un 63,4 % según la model card de origen.
- Predicción multi-token (MTP) mediante cabeza dedicada, exportada como archivo GGUF separado.
- Capacidades de código y matemáticas: no confirmadas explícitamente en la información disponible, aunque heredadas del linaje Qwen.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (los idiomas no están declarados en la ficha de Hugging Face).
- Edición heretic v2: modificación de alineación en capas 30-37 orientada a reducir rechaces, según la descripción del repositorio de origen.

## Casos de uso

- Procesamiento de documentos extensos con imágenes: el contexto de 262.144 tokens permite ingerir contratos, informes técnicos o expedientes completos junto con sus figuras y tablas en una sola pasada, algo viable gracias a la combinación de atención lineal y atención completa que abarata el coste del contexto largo.
- Análisis de capturas de pantalla y diagramas técnicos: la torre Qwen3-VL sin modificar permite describir, extraer y razonar sobre interfaces, gráficos y esquemas, integrándose en herramientas de documentación o soporte interno.
- Asistentes conversacionales de dominio especializado: el post-entrenamiento de eficiencia de razonamiento reduce el número de tokens de pensamiento, lo que baja la latencia y el coste por respuesta en despliegues con muchas consultas.
- Investigación sobre alineación y edición de modelos: la naturaleza heretic v2 (7 tensores modificados en capas 30-37) convierte este checkpoint en un objeto de estudio controlado para medir el efecto de ediciones de rango 1 sobre el comportamiento de rechazo.
- Despliegue en infraestructura de gama alta con cuantización agresiva: las variantes IQ4_XS (98,4 GB) e IQ4_NL (101,0 GB) permiten servir el modelo en nodos con menos memoria que el BF16 de 336 GB, siempre que se use el motor Strata.
- Evaluación comparativa de cuantizaciones: el repositorio incluye 12 niveles de cuantización del modelo principal más variantes de proyector y MTP, lo que facilita estudios de degradación calidad/memoria en un mismo checkpoint.
- Experimentación con decodificación multi-token: la cabeza MTP en archivo separado permite probar esquemas de predicción especulativa o decodificación multi-token sin tocar los pesos principales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el peso de los tensores exige, como mínimo, la memoria del tier elegido. IQ4_XS ocupa 98,4 GB, IQ4_NL 101,0 GB, Q4_0 100,0 GB, Q4_1 111,0 GB, Q4_K_S 111,8 GB, Q4_K_M 119,2 GB, Q5_0 122,0 GB, Q5_K_S 127,7 GB, Q5_1 133,0 GB, Q5_K_M 134,1 GB, Q6_K 167,6 GB y Q8_0 188,2 GB. Hay que sumar la memoria del proyector de visión y de la cabeza MTP, además del espacio para caché KV y buffers de computación.
- GPU recomendadas: no disponible en la información proporcionada. Por volumen de pesos, ningún tier cabe en una GPU de consumo; se requieren configuraciones multi-GPU o nodos con memoria agregada superior a 100 GB incluso en el tier más pequeño.
- Cabe en consumer GPU: no. El tier más ligero (IQ4_XS, 98,4 GB) supera con holgura la VRAM de cualquier GPU de consumo (24 GB en RTX 4090, 32 GB en RTX 5090).
- Opciones de despliegue: el empaquetado está diseñado para el motor Strata, que espera el layout de tensores sin fusionar, el conjunto de shards divididos y la cabeza MTP fuera del GGUF principal. El autor indica explícitamente que este empaquetado no es una declaración de compatibilidad con llama.cpp estándar ni con Ollama. No se dispone de información sobre vLLM, TGI u otras opciones.
- Latencia y throughput estimados: no disponible. La activación de solo 10 de 512 expertos por token reduce el coste computacional por token, pero no se han publicado cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift 1.5 Qwen3.8-Flash-Next — Heretic v2 (GGUF) | 176,9 mil millones totales, 10 de 512 expertos activos | 262.144 tokens | Híbrida lineal/completa + MoE + visión + MTP | Swift Open License v1.0 + Qwen Community License | GGUF en 12 tiers, empaquetado para Strata |
| jeffpeng3/Swift-1.5-Qwen3.8-Flash-Next-heretic (BF16) | 176,9 mil millones | 262.144 tokens | Idéntica | Swift Open License v1.0 + Qwen Community License | 131 shards safetensors, 336 GB |
| ukisai/Swift1.5-Qwen3.8-Flash-Next | 176,9 mil millones | 262.144 tokens | Idéntica, sin edición heretic | Swift Open License v1.0 | Checkpoint original de referencia |
| Qwen/Qwen3.8-Flash-Next | No disponible en la información proporcionada | 262.144 tokens (heredado) | Base del linaje | Qwen Community License | Modelo base upstream |

Las diferencias entre las tres primeras filas son de alineación y formato, no de arquitectura ni de tamaño. Frente al modelo base Qwen, Swift 1.5 añade el post-entrenamiento de eficiencia de razonamiento y la edición heretic; frente al BF16, esta publicación aporta cuantizaciones que reducen el peso desde 336 GB hasta 98,4 GB en el tier más agresivo.

## Limitaciones y advertencias

- Compatibilidad restringida: el autor declara explícitamente que el empaquetado no es compatible con llama.cpp estándar ni con Ollama. Requiere el motor Strata, el conjunto completo de shards del tier seleccionado y los componentes mmproj/MTP correspondientes. La primera shard es solo de metadatos (unos 10,9 MB), el layout de tensores está sin fusionar y la cabeza MTP vive fuera del GGUF principal.
- Edición heretic: la modificación de alineación en capas 30-37 está pensada para reducir rechaces; esto puede traducirse en menor adherencia a políticas de seguridad y mayor probabilidad de generar contenido que el modelo base rechazaría. Requiere evaluación propia antes de cualquier uso en producción orientado al usuario final.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad ni benchmarks en la información disponible; al ser un modelo de gran escala con modo de razonamiento, el riesgo de afirmaciones no verificadas debe asumirse como presente.
- Idiomas: no declarados. No hay garantía de cobertura multilingüe más allá de la heredada del linaje Qwen, que no se documenta en esta ficha.
- Licencia: doble cobertura (Swift Open License v1.0 y Qwen Community License). El uso comercial es gratuito solo por debajo de 1 millón de USD de ingresos anuales; por encima se aplican los términos upstream. Es imprescindible revisar `LICENSE`, `LICENSE-QWEN` y `NOTICE` antes de desplegar.
- Cuantizaciones IQ4: el proyector de visión no incluye variante IQ4_XS porque `llama-quantize` falla con las formas de tensor de la torre de visión en tipos IQ; además, las cuantizaciones adicionales se generaron sin matriz de importancia, lo que puede degradar más la calidad que un esquema con imatrix.
- Requisitos de memoria: incluso el tier más ligero (98,4 GB) exige hardware muy por encima de una GPU de consumo; no es desplegable en estaciones de trabajo convencionales.
- Procedencia: el repositorio lo publica un autor individual (fzcfweasdferttgg) con 3 likes y 3.107 descargas en el momento de la consulta; conviene verificar la integridad de los shards frente al checkpoint BF16 de origen antes de usarlo en entornos críticos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fzcfweasdferttgg/Swift-1.5-Qwen3.8-Flash-Next-heretic-GGUF
- Checkpoint heretic v2 de origen: https://huggingface.co/jeffpeng3/Swift-1.5-Qwen3.8-Flash-Next-heretic
- Modelo Swift 1.5 post-entrenado: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Modelo base upstream: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia Swift Open License v1.0: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next/blob/main/LICENSE
- Motor Strata: no disponible en la información proporcionada
- Paper, blog o demo adicionales: no disponible en la información proporcionada
