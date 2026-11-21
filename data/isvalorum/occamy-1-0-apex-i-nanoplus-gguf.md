# IsValorum/Occamy-1.0-APEX-I-NanoPlus-GGUF

## Resumen

Occamy-1.0 APEX-I-NanoPlus GGUF es una cuantización de precisión mixta del modelo base Accio-Lab/occamy-1.0, un transformer de mezcla de expertos (MoE) con capacidades multimodales (image-text-to-text) y 34.660.610.688 parámetros totales. La publica el usuario independiente IsValorum bajo licencia Apache 2.0, y su rasgo diferencial no es el modelo en sí, sino la receta de cuantización: una asignación tensor a tensor orientada a comprimir el modelo hasta aproximadamente 12,55 GB en disco (unos 2,90 BPW) sin degradar el enrutamiento de los expertos ni la cabeza de salida.

El objetivo declarado es permitir inferencia de un MoE de 35B en GPU de consumo de 16 GB de VRAM con streaming parcial a RAM del sistema, manteniendo una calidad equivalente a la franja Q4_K_M/Q4_K_L. Para ello, los tensores de enrutamiento (`gate_inp` y `gate_shexp`) se conservan en F32 sin comprimir, la cabeza de salida se fija en Q6_K y las proyecciones de atención se protegen frente a la compresión agresiva.

Es relevante ahora porque el ecosistema de cuantizaciones sub-3-bit uniformes (IQ2_S, IQ2_XXS) suele romper el razonamiento profundo y la sintaxis de código en modelos MoE con muchos micro-expertos. Esta ficha describe una alternativa artesanal con métricas de perplejidad publicadas y compatibilidad directa con llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) multimodal, etiquetado como `qwen35moe`; 40 capas y 256 micro-expertos |
| Parametros totales | 34.660.610.688 (aprox. 35B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con receta APEX-I-NanoPlus de precisión mixta (aprox. 2,90 BPW): enrutadores `gate_inp`/`gate_shexp` en F32, cabeza de salida en Q6_K, expertos y proyecciones asignados tensor a tensor; tier equivalente a Q4_K_M/Q4_K_L |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 16,4 GB; archivo principal de aprox. 12,55 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos dispersa con 40 capas y 256 micro-expertos, según la model card del cuantizador, y se etiqueta con la familia `qwen35moe`. El pipeline es image-text-to-text, por lo que incorpora torre de visión y procesa entradas imagen-texto. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original.

La innovación técnica de esta publicación es la cuantización quirúrgica: cada tensor se asigna a un tipo de precisión según su sensibilidad. Los tensores de enrutamiento (`gate_inp` y `gate_shexp`) permanecen en F32 sin comprimir para evitar deriva de enrutamiento; la cabeza de salida se protege en Q6_K; las proyecciones de atención y los gates se salvaguardan de la compresión agresiva. El autor reporta el uso de imatrix y de Unsloth Studio en el proceso, y afirma que el resultado evita paradas de descompresión en CPU durante inferencia híbrida GPU/RAM.

## Capacidades

- Generación de texto conversacional multi-turno en 13 idiomas.
- Razonamiento (etiqueta `reasoning`) con plantilla de chat endurecida para agentes y control de esfuerzo de razonamiento.
- Procesamiento multimodal image-text-to-text: entrada de imágenes junto con texto.
- Generación y razonamiento sobre código, con advertencias específicas del autor sobre penalización de repetición para evitar intercambio de caracteres y corchetes rotos.
- Compatibilidad con llama.cpp (`llama-cli` y `llama-server`) y endpoints compatibles con la API de OpenAI.
- Soporte de tool calling y flujos agénticos según la plantilla de chat incluida; no se detalla el formato exacto en la información disponible.
- Capacidades multilingües amplias: inglés, chino, español, francés, alemán, portugués, italiano, ruso, japonés, coreano, vietnamita, tailandés y árabe.

## Casos de uso

- Razonamiento y análisis documental en estaciones de trabajo con 16 GB de VRAM: el modelo cabe con streaming parcial a RAM del sistema, lo que permite ejecutar un MoE de 35B en hardware de consumo para tareas de análisis largo sin depender de la nube.
- Asistencia de código en local: la preservación de enrutadores en F32 y la cabeza en Q6_K reducen errores sintácticos típicos de cuantizaciones sub-3-bit, lo que lo hace adecuado para autocompletado y revisión de código en entornos con requisitos de privacidad.
- Procesamiento de documentos escaneados y capturas: al ser image-text-to-text, puede extraer y razonar sobre texto contenido en imágenes, útil en digitalización de facturas, formularios o informes.
- Agentes conversacionales multi-turno: la plantilla de chat endurecida y la compatibilidad con `llama-server` permiten desplegar un endpoint compatible con OpenAI para integrarlo en aplicaciones existentes sin reescribir clientes.
- Atención al cliente multilingüe: con 13 idiomas soportados, cubre mercados europeos y asiáticos desde una única instancia local, reduciendo costes de API y exposición de datos.
- Investigación y experimentación con cuantización: sirve como referencia práctica para estudiar el impacto de recetas tensor a tensor frente a cuantizaciones uniformes en modelos MoE, con métricas de perplejidad publicadas.
- Inferencia en portátiles con GPU de 8-12 GB: mediante offload parcial a RAM del sistema, el autor lo presenta como viable en equipos modestos, aunque con latencia mayor.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| WikiText-2 perplexity (GGUF final) | 6,1695 ± 0,15632 |
| Delta de perplejidad vs. BF16 (aprox. 6,18) | aprox. 0,00 (dentro del margen de error) |
| ARC-Challenge (0-shot, 1.172 preguntas) | 95,73% |
| Tamano en disco | 12,55 GB (aprox. 2,90 BPW) |
| Huella en memoria (RAM/VRAM) | 11,69 GiB |
| Comparativa interna: APEX-I-MiniPlus V2.1 | 14,75 GB, 3,40 BPW, PPL 6,2432 (+1,02% vs. BF16) |
| BF16 de referencia | aprox. 70,0 GB, PPL aprox. 6,18 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 11,69 GiB de huella total; con 16 GB de VRAM cabe el modelo completo en GPU con margen para contexto, y con menos VRAM requiere offload parcial a RAM del sistema.
- GPU recomendadas: RTX 4090, RTX 4080, A100 y H100 para ejecución íntegra en GPU; en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4070) funciona con streaming híbrido.
- Cabe en GPU de consumo: sí, especialmente en modelos de 16 GB; el diseño apunta explícitamente a ese segmento.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), endpoints compatibles con OpenAI; no se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles. El autor afirma que la receta evita paradas de descompresión en CPU durante inferencia híbrida, lo que reduce la latencia frente a cuantizaciones uniformes, pero no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano / BPW | Licencia | Notas |
|---|---|---|---|---|---|
| Occamy-1.0 APEX-I-NanoPlus (este) | 34,66B | no disponible | 12,55 GB / aprox. 2,90 BPW | Apache 2.0 | PPL 6,1695; ARC-C 95,73% |
| Occamy-1.0 APEX-I-MiniPlus V2.1 | 34,66B | no disponible | 14,75 GB / 3,40 BPW | Apache 2.0 | PPL 6,2432; tier Q5_K_M; 120 expertos compartidos en Q5_K físico |
| Qwen3.6-35B-A3B-MTP APEX-I-NanoPlus | aprox. 35B (A3B) | no disponible | aprox. 13,0 GB / 2,93 BPW | no disponible | Misma familia de receta; calidad Q4 a 2,93 BPW |
| Ornith 1.5 APEX-I-NanoPlus | aprox. 35B (A3B) | no disponible | no disponible | no disponible | Orientado a ingeniería de software |

Las alternativas de la misma categoría (MoE de aprox. 35B en GGUF de baja huella) provienen del mismo autor y comparten metodología, por lo que la comparación con cuantizaciones uniformes de la comunidad (IQ2_S, IQ2_XXS) queda descrita cualitativamente en la model card pero sin tabla de métricas propia.

## Limitaciones y advertencias

- Es una cuantización, no un modelo nuevo: hereda los sesgos y limitaciones del modelo base Accio-Lab/occamy-1.0, sobre los que no hay información publicada en esta ficha.
- Riesgo de alucinación inherente a los modelos de razonamiento; la compresión a 2,90 BPW puede amplificarlo en dominios especializados no cubiertos por la evaluación de WikiText-2 y ARC-Challenge.
- La evaluación publicada se limita a perplejidad en WikiText-2 y ARC-Challenge 0-shot; no hay datos de HumanEval, GSM8K, MMLU ni de rendimiento multimodal.
- El autor advierte de problemas de sintaxis y corchetes en código con penalizaciones de repetición mal configuradas; requiere ajustar los parámetros de muestreo según la guía incluida.
- El rendimiento con offload a RAM depende del ancho de banda de memoria del sistema; en equipos con poca RAM o memoria lenta la latencia puede ser prohibitiva.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base Accio-Lab/occamy-1.0 antes de desplegar en producción.
- La model card incluye enlaces a una edición "Abliterated" del modelo; esa variante elimina rechazos de seguridad y no debe confundirse con esta release.
- No se especifica la longitud de contexto soportada, dato crítico para planificar despliegues con ventanas largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IsValorum/Occamy-1.0-APEX-I-NanoPlus-GGUF
- Modelo base: https://huggingface.co/Accio-Lab/occamy-1.0
- Variante MiniPlus V2.1: https://huggingface.co/IsValorum/Occamy-1.0-APEX-I-MiniPlus-V2.1-GGUF
- Variante MiniPlus V2.1 Abliterated: https://huggingface.co/IsValorum/Occamy-1.0-APEX-I-MiniPlus-V2.1-Abliterated-GGUF
- Qwen3.6-35B-A3B-MTP APEX-I-NanoPlus: https://huggingface.co/IsValorum/Qwen3.6-35B-A3B-MTP-APEX-I-NanoPlus-GGUF
- Ornith 1.5 APEX-I-NanoPlus: https://huggingface.co/IsValorum/Ornith-1.5-35B-A3B-APEX-I-NanoPlus-GGUF
- Apoyo al autor: https://ko-fi.com/isvalorum
