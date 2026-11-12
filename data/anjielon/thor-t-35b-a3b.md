# Anjielon/Thor-T-35B-A3B

## Resumen

Thor-T-35B-A3B es una cuantización ternaria del modelo híbrido de mezcla de expertos Ornith-1.5-35B-A3B, publicada por el desarrollador independiente Anjielon. Se distribuye en formato GGUF y reduce drásticamente el peso en disco del modelo original: casi todos los pesos se almacenan como valores ternarios (−1, 0, +1) en uno a cuatro planos por tensor, lo que permite comprimir un modelo de aproximadamente 54.760 millones de parámetros totales (unos 3.000 millones activos por token) en ficheros de entre 8 y 12 GiB.

La relevancia del proyecto reside en su enfoque de compresión extrema con preservación de calidad: el fichero mediano (M) alcanza el 99,34 % del MMLU del profesor Q8_0 ocupando 12,19 GiB, frente a los 35,21 GiB del original, y el fichero S supera al IQ2_XXS público con un tamaño ligeramente inferior. Todo el proceso se realizó post-entrenamiento sobre una única APU doméstica (AMD Ryzen AI Max+ 395 con 128 GB) usando la herramienta abierta Fucina.

La principal advertencia práctica es que los ficheros requieren un fork específico de llama.cpp (etiqueta `thor-t-v1`) con soporte Vulkan, CUDA y CPU; no cargan en llama.cpp upstream. El modelo está orientado a generación de texto en inglés y se publica bajo licencia CC BY 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de mezcla de expertos (MoE), cuantizado ternario (planos −1/0/+1) |
| Parametros totales | 54.763.428.992 (≈54,76 B) |
| Parametros activos | ≈3 B por token (según model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria multi-plano (1 a 4 planos por tensor); variantes XS (1,946 bits/param), Root (1,993), S (2,135), M (2,949) |
| Idiomas soportados | Inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | GGUF (con cabecera de predicción multi-token ternaria integrada) |

## Arquitectura y entrenamiento

El modelo base es Ornith-1.5-35B-A3B, un transformer híbrido de mezcla de expertos con aproximadamente 35.000 millones de parámetros nominales y unos 3.000 millones activos por token (el recuento real de safetensors asciende a 54,76 B). Sobre él se aplicó una cuantización ternaria post-entrenamiento: cada tensor se descompone en uno a cuatro planos de valores ternarios, y cada fichero incorpora una cabeza de predicción multi-token (MTP) ternaria que acelera la decodificación especulativa.

El proceso se ejecutó con Fucina, una herramienta abierta de cuantización, sobre una única APU AMD Ryzen AI Max+ 395 con 128 GB de memoria. La receta incluye una matriz de importancia (imatrix) y una selección de hiperparámetros documentada en el paper adjunto; el checkpoint raíz (Root) es el punto de partida congelado del que derivan las tres tallas M, S y XS. No se dispone de información sobre el dataset de entrenamiento original de Ornith ni sobre si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional en inglés, con soporte de plantilla de chat.
- Razonamiento y respuesta a preguntas de conocimiento general (evaluado en MMLU completo de 14.042 preguntas).
- Decodificación especulativa mediante cabeza de predicción multi-token (MTP) integrada en cada fichero.
- Ejecución en CPU, Vulkan y CUDA a través del fork de llama.cpp `thor-t-v1`.
- Ajuste fino de compromiso calidad/velocidad mediante la elección entre las tallas M, S, XS y Root.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- No se documentan capacidades de visión, audio, tool calling ni agentes multi-paso en la información disponible.

## Casos de uso

- Despliegue en hardware de gama baja: el fichero XS (8,04 GiB) permite ejecutar un MoE de 54,76 B de parámetros totales en un portátil con 8 GB de VRAM (RTX 4060 Laptop) descargando parte de los expertos a RAM del sistema, con 66,1 tokens/s según la model card.
- Inferencia en APU doméstica: sobre una AMD Ryzen AI Max+ 395 con 128 GB, el fichero M alcanza 77,53 tokens/s y conserva el 99,34 % del MMLU del profesor Q8_0, lo que lo hace apto para asistentes locales de propósito general.
- Investigación en cuantización ternaria: los ficheros Root y los datos de replay permiten reproducir la receta y comparar el impacto de cada plano ternario sobre la calidad, con registros de benchmark públicos en el dataset Thor-T-bench.
- Prototipado de chatbots en inglés con requisitos estrictos de memoria: el fichero S (8,82 GiB) iguala o supera al IQ2_XXS público y ofrece 84,41 tokens/s en APU, adecuado para entornos con presupuesto de VRAM limitado.
- Evaluación comparativa de técnicas de compresión: sirve como referencia para medir la degradación de MMLU frente a cuantizaciones K-quant e I-quant del mismo profesor, con intervalos de confianza y pruebas de McNemar publicados.
- Experimentación con decodificación especulativa: la cabeza MTP integrada permite estudiar el rendimiento de la predicción multi-token en llama.cpp sin añadir un modelo borrador externo.
- Distribución de modelos en entornos con ancho de banda restringido: ficheros de 8 a 12 GiB frente a los 35,21 GiB del Q8_0 facilitan la descarga y el almacenamiento en clústeres pequeños.

## Benchmarks y rendimiento

MMLU completo (14.042 preguntas, zero-shot, puntuado por log-probabilidad), misma build Vulkan del motor de lanzamiento (commit `4ed3ec488`, AMD Ryzen AI Max+ 395 APU), como porcentaje del profesor Q8_0:

| Fichero | GiB | MMLU completo | % del profesor |
|---|---:|---:|---:|
| Profesor Q8_0 | 35,21 | 80,59 | 100 |
| Q4_K_M | 20,36 | 80,16 | 99,46 |
| **M** | 12,19 | **80,06** | **99,34** |
| Q2_K | 12,19 | 77,68 | 96,39 |
| **S** | 8,82 | **77,85** | **96,59** |
| IQ2_XXS | 9,55 | 71,76 | 89,03 |
| Root | 8,24 | 74,53 | 92,47 |
| IQ1_M | 8,12 | 54,14 | 67,18 |
| **XS** | 8,04 | **72,29** | **89,70** |
| TQ1_0 ingenuo (un plano) | 7,87 | 25,97 | 32,23 |

Comparaciones pareadas en el mismo motor (McNemar exacto): M frente a Q2_K +2,38 puntos (IC 95 % +1,77 a +2,98; p < 1e-10); M frente a Q4_K_M −0,10 puntos (IC por asignatura −1,20 a +1,19; p = 0,75); S frente a IQ2_XXS +6,09 puntos (p < 1e-10); XS frente a TQ1_0 ingenuo (p < 1e-10).

Rendimiento (tokens/s): en APU con MTP activo, M 77,53, S 84,41, XS 95,42, Root 87,78; en portátil con RTX 4060 (8 GB, parte de los expertos en RAM, `-ncmoe` XS 14 / S 18 / M 22), M 39,2, S 53,7, XS 66,1, Root 61,3.

Advertencia del autor: el desarrollo de M y S utilizó el conjunto de test de MMLU, por lo que sus puntuaciones no son estimaciones independientes y los intervalos y valores p son nominales.

## Requisitos de hardware

- VRAM estimada: XS ≈8,04 GiB, Root ≈8,24 GiB, S ≈8,82 GiB, M ≈12,19 GiB de pesos; con caché KV y contexto hay que añadir margen adicional.
- GPU recomendadas: RTX 4060 Laptop (8 GB) funciona con XS, S y M descargando expertos a RAM del sistema (`-ncmoe`); APU AMD Ryzen AI Max+ 395 (128 GB) ejecuta las cuatro tallas con MTP.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB o más con `-ncmoe`; en 12 GB o más el fichero M puede residir íntegramente.
- Opciones de despliegue: exclusivamente el fork `Anjielon/llama.cpp` con etiqueta `thor-t-v1` (Vulkan, CUDA, CPU); no carga en llama.cpp upstream. No se documenta soporte para vLLM, TGI u Ollama.
- Throughput: 77,53–95,42 tokens/s en APU según talla con MTP y un token borrador; 39,2–66,1 tokens/s en RTX 4060 Laptop de 8 GB.
- Almacenamiento: repositorio de 49,2 GB; se recomienda descargar un único fichero.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU (relativo) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Thor-T-35B-A3B M | 54,76 B totales / ≈3 B activos | no disponible | 99,34 % del Q8_0 (12,19 GiB) | CC BY 4.0 | GGUF, fork llama.cpp |
| Ornith-1.5-35B-A3B (base) | ≈35 B nominales | no disponible | referencia del profesor | no disponible | Hugging Face |
| Q4_K_M del mismo profesor | 54,76 B totales | no disponible | 99,46 % (20,36 GiB) | según modelo base | GGUF estándar |
| IQ2_XXS del mismo profesor | 54,76 B totales | no disponible | 89,03 % (9,55 GiB) | según modelo base | GGUF estándar |
| IQ1_M del mismo profesor | 54,76 B totales | no disponible | 67,18 % (8,12 GiB) | según modelo base | GGUF estándar |

## Limitaciones y advertencias

- Los ficheros no cargan en llama.cpp upstream; requieren el fork `thor-t-v1`, lo que limita la portabilidad y el soporte de herramientas del ecosistema.
- El desarrollo de M y S usó el conjunto de test de MMLU, por lo que sus resultados no son estimaciones independientes; los intervalos y valores p son nominales y no hay reclamación de equivalencia con Q4_K_M.
- Solo se declara soporte de inglés; no hay evidencia de capacidades multilingües.
- No se documentan capacidades de tool calling, agentes, visión ni audio.
- Riesgo de alucinación inherente al modelo base, no cuantificado en la información disponible.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero las condiciones del modelo base Ornith-1.5-35B-A3B no se detallan en la información proporcionada.
- El rendimiento depende del motor fork y de la configuración `-ncmoe`; sin ella, las tallas mayores no caben en GPUs de 8 GB.
- Repositorio con solo 7 descargas y 0 likes: ecosistema y validación comunitaria muy limitados.
- La cabeza MTP ternaria puede introducir degradación adicional en tareas distintas de las evaluadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Anjielon/Thor-T-35B-A3B
- Paper (PDF): https://huggingface.co/Anjielon/Thor-T-35B-A3B/blob/main/Thor-T-35B-A3B-paper.pdf
- Fork de llama.cpp (rama `thor-t-v1`): https://github.com/Anjielon/llama.cpp/tree/thor-t-v1
- Fucina (herramienta de cuantización): https://github.com/Anjielon/fucina
- Dataset de benchmarks y registros: https://huggingface.co/datasets/Anjielon/Thor-T-bench
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
