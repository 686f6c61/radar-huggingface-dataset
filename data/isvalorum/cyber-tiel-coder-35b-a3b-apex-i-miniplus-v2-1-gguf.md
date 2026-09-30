# IsValorum/Cyber-Tiel-Coder-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

Cyber-Tiel-Coder-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF es una cuantización GGUF personalizada, tensor a tensor, del modelo huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated, publicada por el usuario IsValorum. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 35.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token (nomenclatura 35B-A3B), derivado de la familia Qwen3.5 MoE, con soporte multimodal (image-text-to-text) y una ventana de contexto de 256K tokens.

El problema que aborda esta publicación no es el entrenamiento de un modelo nuevo, sino la compresión del mismo dentro de un presupuesto de memoria muy ajustado: 15,23 GB en disco y 14,18 GiB en RAM/VRAM con 3,43 bits por peso (BPW), preservando routers en F32 sin comprimir y el head de salida en Q6_K. Segun el autor, esto permite ejecutar el contexto completo de 256K en estaciones de trabajo con 24 GB de VRAM, o bien hacer offload parcial o total a memoria de sistema con velocidades declaradas de 20 a 45 tokens/s.

Es relevante para desarrolladores porque combina tres elementos poco habituales en un mismo artefacto: cuantización quirúrgica por tensor en lugar de recetas planas, decodificación especulativa mediante arquitectura MTP (multi-token prediction) acoplada, y un modelo base "abliterated" (sin mecanismos de rechazo), lo que condiciona tanto su licencia práctica como sus riesgos de uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture-of-Experts) con MTP; etiquetado como qwen3_5_moe / qwen35moe |
| Parametros totales | 35B (35.000 millones) |
| Parametros activos | ~3B por token (A3B) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | GGUF APEX-I-MiniPlus V2.1 (3,43 BPW): mezcla de F32 (routers gate_inp/gate_shexp), Q5_K (expertos compartidos shexp), Q6_K (head de salida), Q4_K (atención), Q8_0 (gates de atención) y tratamiento 3-bit calibrado en expertos núcleo |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar (13 idiomas) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en otros formatos, no verificados en la información disponible |
| Parametros por capa / estructura | 40 capas, 256 micro-expertos, expertos compartidos (shexp) desacoplados |
| Tamaño en disco | 15,23 GB |
| Huella en memoria | 14,18 GiB |
| Pipeline declarado | image-text-to-text (multimodal, vision) |
| Modelo base | huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated (relación: quantized) |
| Cuantizador | IsValorum |

## Arquitectura y entrenamiento

La información disponible describe el modelo base como un MoE de 40 capas con 256 micro-expertos y expertos compartidos, con una arquitectura companion MTP (multi-token prediction) desacoplada que habilita decodificación especulativa. Los tags del repositorio lo sitúan en la familia Qwen3.5 MoE (qwen3_5_moe, qwen35moe, qwen3.6) y lo etiquetan como multimodal con capacidades de visión (image-text-to-text). No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base original.

Lo que sí está documentado es el proceso de posentrenamiento aplicado por el publicador de la cuantización: una asignación tensor a tensor de precisiones, con los tensores de routing (gate_inp y gate_shexp) mantenidos en F32 sin comprimir para evitar deriva de routing, los 120 tensores de expertos compartidos en Q5_K sin comprimir, el head de salida en Q6_K y las proyecciones de atención en Q4_K. El autor compara explícitamente esta receta con las cuantizaciones comunitarias "APEX-I-Mini" genéricas, que según su model card comprimen los expertos a IQ2_S y dejan el head de salida en Q3_K_M, provocando picos de perplejidad y errores de sintaxis en modelos de razonamiento profundo. No se aportan detalles sobre el dataset de calibración (imatrix) más allá de la mención de Unsloth Dynamic e imatrix en los tags.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso, con etiqueta explícita de "reasoning" en el repositorio.
- Codificación y codificación agéntica (agentic-coding), con soporte declarado de flujos tipo SWE-bench.
- Capacidad multimodal: pipeline image-text-to-text, con entrada de imágenes y comprensión visual.
- Decodificación especulativa mediante arquitectura MTP, orientada a reducir latencia de generación.
- Eficiencia de tokens (token-efficient), pensada para tareas agénticas con consumo reducido de contexto.
- Soporte multilingüe en 13 idiomas: inglés, chino, español, francés, alemán, portugués, italiano, ruso, japonés, coreano, vietnamita, tailandés y árabe.
- Modelo "abliterated" / "uncensored": se han eliminado los mecanismos de rechazo del modelo base.
- Tool calling / function calling: no confirmado explícitamente en la información disponible, aunque el etiquetado agéntico y la referencia a SWE-bench lo sugieren.

## Casos de uso

- Refactorización y generación de código en pipelines de CI/CD: el modelo puede integrarse como paso automático de revisión o generación de parches sobre repositorios, aprovechando su especialización en código y su ventana de 256K tokens para cargar varios ficheros de un módulo en un solo prompt.
- Agentes de resolución de incidencias (estilo SWE-bench): con contexto largo y decodificación especulativa MTP, es adecuado para iterar sobre un repositorio, leer trazas de error y proponer parches en varios pasos, siempre que se valide la salida con tests.
- Asistente de análisis de documentación técnica con imágenes: al aceptar entrada image-text-to-text, permite extraer información de diagramas de arquitectura, capturas de paneles de monitorización o esquemas de red junto al texto adjunto.
- Despliegue en estaciones de trabajo de 24 GB sin servidor dedicado: el objetivo declarado de la cuantización es ejecutar el contexto completo de 256K íntegramente en VRAM en una GPU de 24 GB, lo que habilita asistentes locales de código con contexto de repositorio completo.
- Inferencia híbrida GPU + RAM en equipos de 16 GB: con offload parcial a memoria de sistema, se pueden mantener contextos de 128K o superiores con velocidades declaradas de 20 a 45 tokens/s, adecuado para entornos de desarrollo sin clúster.
- Procesamiento multilingüe de documentación: cubre 13 idiomas, lo que permite normalizar, resumir o traducir documentación técnica y tickets en equipos distribuidos.
- Análisis de contenido sin filtros en investigación sobre seguridad de modelos: al ser una variante abliterated, se usa en estudios de alineación y evaluación de comportamientos no restringidos, en entornos controlados y con revisión ética.

## Benchmarks y rendimiento

Los únicos datos cuantitativos verificables en la información proporcionada corresponden a perplejidad sobre WikiText-2 y a tamaño/huella de memoria, no a benchmarks de tareas (MMLU, HumanEval, GSM8K, SWE-bench).

| Especificación | Tamaño en disco | Huella RAM/VRAM | BPW medio | Perplejidad WikiText-2 | Nivel de calidad equivalente |
|---|---|---|---|---|---|
| Base BF16 sin cuantizar | 71,05 GB | 66,18 GiB | 16,00 | ~7,46 (referencia) | Precisión completa |
| APEX-I-MiniPlus V2.1 (esta versión) | 15,23 GB | 14,18 GiB | 3,43 | 7,5117 ± 0,20722 (ΔPPL +0,0517 / +0,69 %) | Nivel Q5_K_L, rozando Q6_K |
| APEX-I-NanoPlus | 12,55 GB | 11,69 GiB | ~2,93 | 8,2842 ± 0,23432 (ΔPPL +0,8242 / +11,05 %) | Nivel Q4_K_M / Q4_K_L |

La model card menciona una sección titulada "Independent Benchmark of the APEX-I-MiniPlus Family (Occamy V2 Reference)", pero su contenido no está incluido en el extracto disponible. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, SWE-bench) en la información disponible.

## Requisitos de hardware

- Huella mínima de pesos: 14,18 GiB en RAM/VRAM con la cuantización APEX-I-MiniPlus V2.1 (15,23 GB en disco); hay que añadir la memoria de la caché KV para el contexto, que no se cuantifica en las cifras anteriores.
- VRAM: el autor afirma que el contexto completo de 256K cabe en una GPU de 24 GB (RTX 3090, RTX 4090, RTX 5090 o equivalentes profesionales como A10G o L4 en configuraciones multi-GPU).
- Consumer GPU: sí, en tarjetas de 24 GB. Para equipos de 16 GB, el autor recomienda la variante NanoPlus (12,55 GB / ~2,93 BPW) con streaming desde RAM.
- Offload a memoria de sistema: soportado de forma total o parcial; el rendimiento depende del procesador, el ancho de banda de memoria y la configuración DDR4/DDR5, con un rango declarado de 20 a 45 tokens/s.
- GPU recomendadas por escenario: RTX 3090 / 4090 / 5090 (24 GB) para contexto completo en VRAM; A100 40/80 GB y H100 para despliegues multiusuario con mayor concurrencia; GPUs de 8-12 GB solo con offload intensivo a RAM y contextos reducidos.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp) por el formato GGUF; el soporte en vLLM o TGI no está confirmado en la información disponible, ya que estos motores priorizan pesos en safetensors.
- Latencia y throughput: 20-45 tokens/s declarados en inferencia sobre memoria de sistema, con variación según CPU y memoria. No se aportan cifras de throughput por lotes ni de latencia por token en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tamaño de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cyber-Tiel-Coder-35B-A3B APEX-I-MiniPlus V2.1 | 35B totales / ~3B activos | 256K | 15,23 GB / 3,43 BPW | MIT | GGUF en HuggingFace |
| Cyber-Tiel-Coder-35B-A3B APEX-I-NanoPlus | 35B totales / ~3B activos | 256K (declarado en la misma familia) | 12,55 GB / ~2,93 BPW | MIT | GGUF en HuggingFace |
| Huihui-Ornith-1.5-35B-A3B-abliterated (base) | 35B totales / ~3B activos | No disponible | 71,05 GB en BF16 | MIT (según el repositorio derivado) | Pesos sin cuantizar |
| Otras cuantizaciones MoE de ~35B en el ecosistema (por ejemplo familias Qwen3 MoE de tamaño equivalente) | ~30-35B totales / ~3B activos | 128K-256K según variante | 12-20 GB en Q4/Q5 | MIT o Apache 2.0 según variante | Datos no verificados en la información disponible |

No se dispone de comparativas de rendimiento en benchmarks frente a alternativas de la misma categoría, ya que la model card no incluye resultados de MMLU, HumanEval o SWE-bench en el extracto disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan análisis de sesgo en la información proporcionada. El proceso de "abliteration" elimina los rechazos del modelo base, lo que puede aumentar la probabilidad de contenido ofensivo, ilegal o dañino sin filtrado previo.
- Riesgo de alucinación: inherente a un modelo de 3B parámetros activos; la cuantización a 3,43 BPW introduce además una degradación medida de +0,69 % en perplejidad sobre WikiText-2, que puede traducirse en errores sutiles de sintaxis o formato en código generado.
- Contexto: aunque se declaran 256K tokens, la calidad efectiva a longitudes extremas no está validada con benchmarks en la información disponible, y la memoria de caché KV no está incluida en las cifras de huella.
- Idiomas: los 13 idiomas declarados no implican calidad homogénea; es probable un rendimiento inferior en vietnamita, tailandés o árabe frente a inglés y chino, aunque no hay datos para confirmarlo.
- Licencia: el repositorio declara MIT, lo que en principio permitiría uso comercial, pero al ser una cuantización derivada conviene verificar la licencia del modelo base original (Huihui-Ornith-1.5-35B-A3B) y de su ancestro Qwen3.5 MoE, ya que una licencia permisiva declarada sobre un derivado no siempre refleja los términos de la cadena completa.
- Contenido sin moderación: al estar "abliterated", no es adecuado para aplicaciones de cara al público sin una capa adicional de filtrado y moderación.
- Madurez del artefacto: el repositorio registra 0 descargas y 1 like en la fecha de consulta, con fecha de creación y actualización idénticas (2026-09-29), lo que indica ausencia de validación independiente por parte de la comunidad.
- Verificación propia: las afirmaciones de rendimiento (20-45 tokens/s, contexto completo de 256K en 24 GB, preservación de routing) provienen del autor de la cuantización y no se han replicado de forma independiente en la información disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/IsValorum/Cyber-Tiel-Coder-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF
- Variante compacta APEX-I-NanoPlus: https://huggingface.co/IsValorum/Cyber-Tiel-Coder-35B-A3B-APEX-I-NanoPlus-GGUF
- Modelo base (relación: quantized): huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated (URL no incluida en la información proporcionada)
- Paper, blog o repositorio adicional: no disponible
- Demo: no disponible
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo.
