# IsValorum/Occamy-1.0-APEX-I-NanoPlus-GGUF

## Resumen

Occamy-1.0 APEX-I-NanoPlus GGUF es una cuantización GGUF del modelo multimodal Accio-Lab/occamy-1.0, un transformer de mezcla de expertos (MoE) construido sobre la arquitectura Qwen3.6-35B-A3B y orientado a tareas de co-work de largo horizonte. La versión cuantizada la publica el usuario IsValorum bajo el sello APEX-I-NanoPlus, una receta de cuantización personalizada tensor a tensor que comprime los 34.660.610.688 parámetros del modelo base (~34,66 B) en un único archivo de 12,55 GB, con una huella en memoria de 11,69 GiB y un promedio de ~2,93 bits por peso (BPW).

El interés de esta ficha no está en el modelo base, sino en la ingeniería de cuantización: frente a las cuantizaciones comunitarias sub-3-bit genéricas (IQ2_S, IQ2_XXS), que aplican códecs de 2 bits de forma uniforme a todos los expertos, APEX-I-NanoPlus mantiene los enrutadores (`gate_inp`, `gate_shexp`) en F32 sin comprimir, blinda la cabeza de salida en Q6_K y las puertas de atención en Q8_0, reserva IQ3_XXS para la proyección residual descendente de los expertos (`ffn_down_exps`) y confina la compresión a 2 bits a las proyecciones redundantes gate/up, guiadas por la matriz de importancia (`imatrix`) oficial.

El resultado declarado por el autor es una perplejidad WikiText-2 de 6,1695 ± 0,15632, es decir una variación de -0,17 % respecto a la referencia BF16 (6,18) y mejor incluso que la variante APEX-I-MiniPlus V2.1 (6,2432) pese a ocupar 2,2 GB menos. Es, por tanto, una opción pensada para ejecutar un MoE de clase 35B con contexto de 128K o superior en GPUs de 16 GB, con desalojo total o parcial a memoria de sistema, o incluso en inferencia íntegra por RAM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE) tipo Qwen3.6-35B-A3B; 40 capas y 256 micro-expertos por capa, más experto compartido (`shexp`) |
| Parámetros totales | 34.660.610.688 (~34,66 B) |
| Parámetros activos | Aproximadamente 3 B, según la nomenclatura A3B del modelo base (valor exacto no disponible) |
| Longitud de contexto | 128K tokens o superior según la model card; máximo exacto no disponible |
| Tipos de cuantización | GGUF APEX-I-NanoPlus personalizado, ~2,93 BPW; mezcla de IQ3_XXS, IQ2_S, IQ2_XXS, Q3_K, Q4_K, Q6_K, Q8_0 y F32 |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar (13 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo único) |
| Tamaño en disco | 12,55 GB |
| Huella en memoria (RAM/VRAM) | 11,69 GiB |
| Modalidad | Image-text-to-text (multimodal con visión) |
| Modelo base | Accio-Lab/occamy-1.0 |
| Cuantizado por | IsValorum |
| Perplejidad WikiText-2 | 6,1695 ± 0,15632 (ΔPPL -0,0105, -0,17 % frente a BF16) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Qwen3.6-35B-A3B, un transformer de mezcla de expertos con 40 capas y 256 micro-expertos de grano fino por capa, complementados por un experto compartido. La model card menciona además que determinadas capas mantienen atención completa (`full attention` en L3, L7, L11 y sucesivas con periodicidad), lo que apunta a un esquema híbrido de atención. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base.

La innovación de esta publicación es exclusivamente de cuantización. La receta APEX-I-NanoPlus asigna un tipo de dato distinto a cada familia de tensores en función de su sensibilidad: los enrutadores en F32 (deriva de routing nula), la cabeza de salida en Q6_K, las puertas de atención en Q8_0, las proyecciones q/k/v en Q4_K y las salidas de atención en Q6_K, el experto compartido en Q4_K, los expertos de núcleo (capas 2-37) con IQ3_XXS en la proyección descendente, IQ2_S en gate e IQ2_XXS en up, y los expertos de borde (capas 0-1 y 38-39) con Q3_K e IQ3_XXS. La calibración se realizó con la `imatrix` oficial del modelo. No se documentan en la información disponible innovaciones de decodificación especulativa, atención lineal ni técnicas de entrenamiento adicionales.

## Capacidades

- Generación de texto conversacional multi-turno, con la etiqueta `conversational` en la ficha del repositorio.
- Razonamiento explícito: la model card menciona el bloque `<think>` y la etiqueta `reasoning`, propios de modelos con modo de pensamiento.
- Comprensión de imágenes y texto (pipeline `image-text-to-text`): admite entradas imagen-texto y genera texto.
- Capacidades multilingües en 13 idiomas: inglés, chino, español, francés, alemán, portugués, italiano, ruso, japonés, coreano, vietnamita, tailandés y árabe.
- Ejecución eficiente en hardware modesto gracias a la naturaleza MoE (~3 B de parámetros activos por token) y a la cuantización de ~2,93 BPW.
- Ejecución en modo híbrido GPU/RAM con contexto largo: el autor indica que las partes que no caben en VRAM pueden residir en memoria de sistema manteniendo generación estable.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: el modelo base se describe como especializado en tareas de co-work de largo horizonte, aunque la model card de esta cuantización no detalla integraciones de agente.

## Casos de uso

- Investigación y desarrollo en local: un MoE de clase 35B ejecutable en una GPU de 16 GB permite reproducir experimentos de razonamiento y multimodalidad sin depender de APIs externas, con licencia Apache 2.0 para uso comercial.
- Asistente conversacional de contexto largo: con 128K tokens o más de ventana, puede mantener hilos extensos de documentación, correo o incidencias sin perder el hilo, desalojando parte del contexto a RAM cuando la VRAM se agota.
- Análisis de documentos con imágenes: al ser un modelo image-text-to-text, puede procesar capturas, diagramas o páginas escaneadas y responder preguntas sobre ellos, útil en flujos de auditoría o extracción de información.
- Co-work de desarrollo de software: el modelo base está orientado a tareas de colaboración de largo horizonte; puede emplearse para revisar repositorios, proponer refactorizaciones o mantener un plan de trabajo a lo largo de múltiples sesiones.
- Atención al cliente multilingüe: gracias a los 13 idiomas soportados, un único despliegue puede atender consultas en inglés, español, chino, árabe o japonés sin modelos adicionales.
- Despliegue en estaciones de trabajo sin GPU de gama alta: con inferencia íntegra en RAM a 20-45 tok/s, es viable en equipos con DDR4/DDR5 abundante para prototipado, formación o generación por lotes de baja concurrencia.
- Evaluación de técnicas de cuantización: la receta tensor a tensor y la comparación de perplejidad publicada la convierten en referencia útil para estudiar el impacto de los distintos formatos de cuantización en modelos MoE.

## Benchmarks y rendimiento

La información disponible solo incluye la perplejidad de WikiText-2 medida sobre el GGUF final. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Especificación | Tamaño en disco | Huella en memoria | BPW medio | Perplejidad WikiText-2 | ΔPPL vs. BF16 | Calidad equivalente |
|---|---|---|---|---|---|---|
| Base BF16 sin cuantizar | ~70,0 GB | ~65,2 GiB | 16,00 | ~6,18 (referencia) | 0,000 | Precisión completa |
| APEX-I-MiniPlus V2.1 | 14,75 GB | 13,74 GiB | 3,40 | 6,2432 ± 0,1622 | +0,0632 (+1,02 %) | Nivel Q5_K_M |
| APEX-I-NanoPlus (esta ficha) | 12,55 GB | 11,69 GiB | ~2,93 | 6,1695 ± 0,15632 | -0,0105 (-0,17 %) | Nivel Q5_K_M / Q6_K casi sin pérdida |

Nota: el valor de ΔPPL negativo indica una perplejidad ligeramente inferior a la referencia BF16 declarada por el autor; debe interpretarse con cautela dado que la horquilla de error (±0,15632) es amplia en relación con la diferencia medida.

## Requisitos de hardware

- Huella de memoria declarada: 11,69 GiB en RAM/VRAM, sobre un archivo de 12,55 GB en disco.
- VRAM estimada: cabe completo en GPUs de 16 GB, dejando más de 3 GB libres según el autor; en 24 GB (RTX 3090, RTX 4090) sobra espacio para contexto amplio.
- GPUs recomendadas: RTX 4080 / 4080 Super / 4090 / 5080 y equivalentes de 16-24 GB; A100, H100 o L40S funcionan sin problema, aunque están sobredimensionadas para el tamaño del modelo.
- ¿Cabe en GPU de consumo? Sí: es uno de los objetivos de diseño del build, con 16 GB de VRAM como umbral de entrada y margen para contexto moderado.
- Inferencia en RAM: soporta ejecución total o parcial en memoria de sistema. Velocidad declarada de 20 a 45 tok/s según el procesador, el ancho de banda de memoria y la configuración DDR4/DDR5.
- Contexto largo: si los 128K tokens (o más) de contexto no caben en VRAM, el modelo puede residir parcialmente en RAM manteniendo una generación estable.
- Opciones de despliegue: llama.cpp (etiqueta explícita en el repositorio), Ollama, LM Studio y cualquier runtime compatible con GGUF. El soporte de vLLM para GGUF es limitado y no está confirmado para este archivo.
- Latencia y throughput: no se han publicado cifras de latencia por token ni de throughput en GPU, solo el rango de 20-45 tok/s para inferencia en RAM.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Tamaño | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Occamy-1.0 APEX-I-NanoPlus (esta ficha) | 34,66 B totales, ~3 B activos | 128K o superior | APEX-I-NanoPlus, ~2,93 BPW | 12,55 GB | 6,1695 | Apache 2.0 | HuggingFace (IsValorum) |
| Occamy-1.0 APEX-I-MiniPlus V2.1 | 34,66 B totales, ~3 B activos | 128K o superior | APEX-I-MiniPlus, 3,40 BPW | 14,75 GB | 6,2432 | Apache 2.0 | HuggingFace (IsValorum) |
| Occamy-1.0 base BF16 | 34,66 B totales, ~3 B activos | 128K o superior | Sin cuantizar | ~70 GB | ~6,18 | Apache 2.0 | HuggingFace (Accio-Lab) |
| Qwen3.6-35B-A3B-MTP APEX-I-NanoPlus | Clase 35B MoE | No disponible | APEX-I-NanoPlus, 2,93 BPW | ~13,0 GB | No disponible | Apache 2.0 (modelo base) | HuggingFace (IsValorum) |
| Cuantizaciones comunitarias IQ2_S / IQ2_XXS | Clase 35B MoE | No disponible | 2 bits uniformes, sin `imatrix` | ~12,5 GB | No disponible | Según modelo base | HuggingFace (varios) |

Las cifras de perplejidad de las cuantizaciones comunitarias no se publican en la información disponible; el autor las describe cualitativamente como propensas a errores de sintaxis y a un aumento severo de perplejidad en modelos de razonamiento profundo.

## Limitaciones y advertencias

- Cuantización de terceros: el modelo no lo publica Accio-Lab, sino el usuario IsValorum; los resultados de perplejidad son los declarados por el cuantizador y no han sido verificados de forma independiente en la información disponible.
- Perplejidad con error amplio: la horquilla de ±0,15632 es grande en relación con la mejora de -0,0105 frente a BF16 declarada, por lo que la ventaja sobre la referencia debe tomarse con cautela.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan en la información disponible mecanismos específicos de mitigación en esta cuantización.
- Sesgos: no se dispone de información sobre evaluación de sesgos en la model card proporcionada.
- Idiomas: aunque se declaran 13 idiomas, no se aportan datos de rendimiento por idioma; el rendimiento en lenguas distintas del inglés y el chino puede degradarse.
- Compresión agresiva en las proyecciones gate/up: las capas de expertos comprimidas a 2 bits (IQ2_S, IQ2_XXS) pueden afectar a tareas de razonamiento muy sensible, pese a que las proyecciones críticas se mantienen en mayor precisión.
- Capacidades multimodales: el pipeline declarado es image-text-to-text, pero la información disponible no detalla qué tensores del proyector visual se conservan ni con qué precisión, por lo que la calidad de la visión no está garantizada.
- Tool calling y uso agéntico: no confirmados en la información disponible; conviene validarlos antes de integrarlos en producción.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Accio-Lab/occamy-1.0, ya que las obligaciones pueden heredarse.
- Terminología de marketing: la model card emplea comparaciones con cuantizaciones genéricas sin cifras verificables; trátese como material promocional, no como evaluación técnica independiente.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/IsValorum/Occamy-1.0-APEX-I-NanoPlus-GGUF
- Modelo base: https://huggingface.co/Accio-Lab/occamy-1.0
- Blog del proyecto Occamy-1.0: https://accio-lab.github.io/occamy/
- Variante APEX-I-MiniPlus-V2.1: https://huggingface.co/IsValorum/Occamy-1.0-APEX-I-MiniPlus-V2.1-GGUF
- Variante APEX-I-MiniPlus-V2.1 Abliterated: https://huggingface.co/IsValorum/Occamy-1.0-APEX-I-MiniPlus-V2.1-Abliterated-GGUF
- Variante APEX-I-MiniPlus-V2: https://huggingface.co/IsValorum/Occamy-1.0-APEX-I-MiniPlus-V2-GGUF
- Qwen3.6-35B-A3B-MTP APEX-I-NanoPlus: https://huggingface.co/IsValorum/Qwen3.6-35B-A3B-MTP-APEX-I-NanoPlus-GGUF
- Ornith 1.5 APEX-I-NanoPlus: https://huggingface.co/IsValorum/Ornith-1.5-35B-A3B-APEX-I-NanoPlus-GGUF
- Análisis externo de la variante MiniPlus V2: https://note.com/zephel01/n/n71d3d7e6b70c?hl=en
- Registro de modelos en Free2AITools: https://free2aitools.com/model/isvalorum/occamy-1.0-apex-i-miniplus-v2-gguf
