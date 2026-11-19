# kindlingai/glm-5.3-flash-exlr8-k2-k3-k4

## Resumen

GLM-5.3-Flash exlr8 (K2/K3/K4) es una cuantización del modelo multimodal GLM-5.3-Flash, desarrollada por el usuario kindlingai sobre los pesos BF16 originales de zai-org (Zhipu AI / Z.ai). El modelo base es un transformer de mezcla de expertos (MoE) con 45 capas (0-2 densas, 3-44 MoE), 288 expertos enrutados con routing top-8, un experto compartido por capa MoE, una capa MTP (multi-token prediction) en la posición 45 y una torre de visión. El repositorio cuantiza los expertos enrutados y compartidos de las capas 3-45 y los pesos densos, y mantiene la torre de visión intacta en BF16.

La particularidad del release es el formato exlr8 v2, una codificación trellis con codebook E4M3 que almacena cada experto a tres anchos (K2, K3 y K4) y elige el ancho en tiempo de carga. Está pensado para dispositivos de memoria unificada de clase NVIDIA GB10 (DGX Spark, ASUS GX10), servidos en una a cuatro máquinas con paralelismo tensorial. El objetivo es ofrecer una alternativa de pesos más compacta que NVFP4 manteniendo calidad equivalente a BF16 en NLL y GSM8K.

La relevancia inmediata es doble: por un lado, demuestra que la codificación trellis con redondeo E4M3 obligatorio puede igualar o superar ligeramente a NVFP4 en eficiencia de bits por peso de experto (4,0 bpw frente a 4,25 bpw); por otro, introduce un formato de pesos que exige decodificadores específicos (gr8 o la receta vLLM de KindlingAI), de modo que no es intercambiable con EXL3 estándar. El repositorio acumula 402.450 descargas pese a tener solo 4 likes, lo que sugiere un uso instrumental más que comunitario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida (linear-attention y MLA), capa MTP y torre de visión; 45 capas (0-2 densas, 3-44 MoE) |
| Parametros totales | no disponible (el model card no declara el recuento total; 288 expertos enrutados top-8 + 1 compartido por capa MoE) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | exlr8 v2 trellis con codebook E4M3, anchos K2 (2,0 bpw), K3 (3,0 bpw) y K4 (4,0 bpw); densos en trellis K4, MXFP8, FP8 con escalas de bloque 128×128; visión en BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (expertos por capa + índices, densos, vocabulario, visión, manifiestos JSON, slices TP por rango) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un transformer MoE de 45 capas: las capas 0-2 son densas y las capas 3-44 son MoE con 288 expertos enrutados (top-8) más un experto compartido por capa. Incluye una capa MTP en la posición 45 y una torre de visión, lo que lo sitúa en la categoría image-text-to-text. La atención combina proyecciones de linear-attention (q/k/v, b, f_a/f_b, g_a/g_b) con MLA (q_a, kv_a) y un indexer (wq_b, wk), lo que sugiere un diseño híbrido orientado a eficiencia de contexto largo.

Esta cuantización no entrena el modelo: recodifica los pesos BF16 con codificación trellis sensible a Hessianas, de forma independiente para cada ancho (los códigos no anidan entre K2, K3 y K4). Los expertos enrutados y compartidos de las capas 3-45 se guardan a los tres anchos; los densos se reparten por tipo (trellis K4 para salida de atención, q_b_proj y MLP denso de capas 0-2; MXFP8 para proyecciones de entrada de atención, indexer y eh_proj del MTP; FP8 con escalas de bloque para kv_b_proj). La innovación clave es que el encoder busca únicamente sobre valores redondeados a E4M3, de modo que el redondeo forma parte del formato: un decodificador EXL3 estándar lee pesos mediblemente peores de los mismos bytes. Además, los tres anchos usan codebook E4M3, lo que permite que el prefill corra sobre tensor cores FP8.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline image-text-to-text, plantilla de chat incluida).
- Entrada de imagen: la torre de visión se conserva en BF16 y la receta vLLM soporta entrada de imagen en todos los niveles de TP.
- Razonamiento multi-paso y decodificación especulativa mediante la capa MTP (un draft en gr8; DFlash2 en la receta vLLM).
- Capacidades de código y matemáticas inferidas del modelo base; GSM8K reportado al 98% en esta cuantización.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (los idiomas no están declarados).
- Modo thinking explícito: no disponible en la información proporcionada.
- Selección de ancho en carga (K2/K3/K4) y manifiestos mixtos (bit201, bit349) para ajustar el equilibrio tamaño/calidad.

## Casos de uso

- Despliegue en DGX Spark o ASUS GX10 con una sola máquina: el ancho K2 ocupa 86,3 GB y cabe en un equipo de 128 GB de memoria unificada a TP=1, lo que permite servir el modelo completo sin clúster.
- Servicio multi-turno con imágenes en producción: la receta vLLM (glm-5.3-flash-exlr8-gx10) admite entrada de imagen en TP=1 a 4 y decodificación especulativa DFlash2, adecuada para asistentes que combinan capturas y texto.
- Clúster de dos nodos GB10: el ancho K3 (125,4 GB) se sirve a TP=2, repartiendo los expertos entre dos cajas y manteniendo el pool KV un 15% mayor que NVFP4 a igual memoria.
- Razonamiento y matemáticas en producción: GSM8K al 98%, equivalente a BF16 y a NVFP4, permite usar el modelo para resolución de problemas aritméticos y pipelines de verificación.
- Ajuste fino del compromiso tamaño/calidad: los manifiestos bit201 (K2 con 124 expertos en K3, ~2,01 bits por peso enrutado) y bit349 (K3 con K4 donde más reduce KL, ~3,49 bits) permiten escoger una configuración intermedia sin recodificar.
- Investigación sobre formatos de cuantización: el repositorio expone codificación trellis sensible a Hessianas, codebooks E4M3 y slices TP por rango, útil para estudiar el impacto del redondeo E4M3 en la calidad de pesos decodificados.
- Servicio con paralelismo tensorial en cuatro nodos: el ancho K4 (164,5 GB, el default validado) se sirve a TP=3 o TP=4, con slices index-slices/tp<N>/k<K>/rank<r>.safetensors para cada rango.

## Benchmarks y rendimiento

| Metrica | Resultado | Referencia |
|---|---|---|
| NLL (conjunto held-out 1) | +0,0034 sobre BF16 | igual o ligeramente mejor que NVFP4 |
| NLL (conjunto held-out 2) | +0,0017 sobre BF16 | igual o ligeramente mejor que NVFP4 |
| NLL (conjunto held-out 3) | +0,0020 sobre BF16 | igual o ligeramente mejor que NVFP4 |
| GSM8K | 98% | igual que BF16 y NVFP4 |
| Bits por peso de experto (K4) | 4,0 bpw | NVFP4: 4,25 bpw (~6% menos bytes por token) |
| Pool KV a igual memoria | ~15% mayor | frente a NVFP4 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: K2 = 86,3 GB (TP=1); K3 = 125,4 GB (TP=2); K4 = 164,5 GB (TP=3 o TP=4). El tamaño incluye expertos de capas 3-45 más 8,1 GB de densos, vocabulario y visión.
- GPU recomendadas: NVIDIA GB10 (DGX Spark, ASUS GX10) como plataforma objetivo; la receta vLLM cubre TP=1, 2, 3 y 4 en GB10.
- Cabe en GPU de consumo: no disponible en la información proporcionada; el diseño apunta a dispositivos de memoria unificada de 128 GB, no a GPUs discretas de consumo.
- Opciones de despliegue: engine gr8 (nativo exlr8, `./gr8 glm53f` a TP=4 o TP=2, una sesión a la vez, MTP con un draft, solo texto); receta vLLM de KindlingAI con kernel MoE exlr8, DFlash2 y plano de control mentat (solo decodifica codebook mcg, requiere el tag v0.1).
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / bpw | Calidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GLM-5.3-Flash exlr8 K4 (este) | 288 expertos top-8 + 1 compartido | no disponible | exlr8 trellis, 4,0 bpw | NLL +0,0020 sobre BF16; GSM8K 98% | MIT | Hugging Face, engine gr8 y receta vLLM |
| GLM-5.3-Flash NVFP4 | mismos | no disponible | NVFP4, 4,25 bpw | NLL ~+0,0034 a +0,0020; GSM8K 98% | no disponible | build de referencia citado en el model card |
| GLM-5.3-Flash BF16 | mismos | no disponible | BF16 | línea base | no disponible | zai-org/GLM-5.3-Flash-BF16 |
| GLM-5.3 (no Flash) exlr8 K2/K3/K4 | no disponible | no disponible | exlr8 trellis, mismo formato | no disponible | no disponible | kindlingai/glm-5.3-exlr8-k2-k3-k4 |

## Limitaciones y advertencias

- Los pesos no son utilizables sin redondeo E4M3: todo valor producido por el codebook trellis debe redondearse a FP8 E4M3 (round to nearest even, saturando) antes de aplicar los vectores laterales. Un decodificador EXL3 estándar lee pesos peores de los mismos bytes.
- La versión v0.2 introduce el codebook pmcgx en las capas 3, 20, 43 y 44; un loader debe decodificar pmcgx en los ficheros de ancho de esas capas. La receta vLLM solo decodifica mcg, por lo que requiere el tag v0.1 y el repositorio glm-5.3-flash-exlr8-gx10.
- gr8 tiene soporte Flash nuevo: una sesión a la vez, MTP con un solo draft y solo texto por ahora; no hay entrada de imagen en ese engine.
- Los anchos K2, K3 y K4 son codificaciones independientes: los códigos no anidan, así que cambiar de ancho requiere recargar el manifiesto correspondiente.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada; aplican los del modelo base GLM-5.3-Flash.
- Idiomas soportados no declarados: no hay garantía documentada de cobertura multilingüe.
- Licencia MIT permite uso comercial, pero la dependencia de engines y formatos propietarios (gr8, receta vLLM específica) condiciona la portabilidad a producción.
- El repositorio pesa 790,4 GB y las descargas por slice TP deben hacerse por rango; no se recomienda descargar el repo completo para un solo nodo.

## Enlaces

- Hugging Face: https://huggingface.co/kindlingai/glm-5.3-flash-exlr8-k2-k3-k4
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash-BF16
- Especificación del formato exlr8: https://github.com/kindlingai/exlr8/blob/main/FORMAT.md
- Engine gr8: https://github.com/kindlingai/gr8
- Documentación Flash de gr8: https://github.com/kindlingai/gr8/blob/main/docs/FLASH.md
- Receta vLLM para GB10: https://github.com/kindlingai/glm-5.3-flash-exlr8-gx10
- Plano de control mentat: https://github.com/kindlingai/mentat
- Variante no Flash con el mismo formato: https://huggingface.co/kindlingai/glm-5.3-exlr8-k2-k3-k4
