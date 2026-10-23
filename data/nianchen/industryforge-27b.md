# Nianchen/IndustryForge-27B

## Resumen

IndustryForge-27B es un modelo fundacional multimodal especializado en CAD industrial, desarrollado por Nianchen (Deng) a partir de Qwen/Qwen3.5-27B mediante ajuste supervisado multi-tarea sobre seis subcorpus de dominio. Cubre en un único modelo de 27.356.728.560 parámetros cuatro habilidades: comprensión visual de planos de ingeniería, generación de código paramétrico CadQuery, generación de scripts COM para SolidWorks, Inventor y AutoCAD, y generación de ensamblajes multipieza.

El modelo no pretende ser un generador CAD de extremo a extremo, sino un sustrato común para agentes industriales que necesiten leer planos, escribir código ejecutable o automatizar software CAD de escritorio. Según la model card, mejora al modelo base en +33,65 puntos porcentuales de media en cuatro benchmarks de dominio y supera a gpt-5.4 en los cuatro, manteniendo capacidades generales (+1,56 pp de media en 11 benchmarks).

La relevancia actual reside en que los modelos multimodales generalistas rinden mal en tareas CAD: el modelo base Qwen3.5-27B solo alcanza un 7,82% de passed@1e-3 en CadQuery y un 0% en ensamblajes, mientras que IndustryForge-27B llega al 77,88% y al 15,38% respectivamente. La release publicada es la v4.1 (checkpoint-6400-merged, 2026-04-29), con pesos fusionados en bfloat16 y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia `qwen3_5`, vision-language) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | No aplica (no se indica que sea MoE en la informacion disponible) |
| Longitud de contexto | 262.144 tokens como `max_sequence_length` de entrenamiento; un proveedor externo (Featherless) anuncia 32K en servicio |
| Tipos de cuantizacion | Solo se publican pesos en bfloat16; no hay GGUF, AWQ ni GPTQ oficiales (cuantizacion posible con herramientas externas) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, 12 shards, bfloat16 (modelo fusionado, sin adaptador) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-27B, un transformer multimodal de tipo vision-language con torre de visión (ViT), aligner y LLM. IndustryForge-27B se obtiene por SFT multi-tarea: se entrena un adaptador LoRA de rango 8, alpha 32 y alcance all-linear, manteniendo congelados el ViT y el aligner, y posteriormente se fusiona en un checkpoint de precisión completa. El entrenamiento usa 1 época (6.400 pasos sobre un máximo de 6.568), batch efectivo de 64, learning rate 5e-5 con schedule coseno y warmup del 0,05, `padding_free=True` (sin tokens de padding en la loss), sharding DeepSpeed ZeRO-3, sequence parallel de 8, precisión bfloat16 y FlashAttention. Se ejecutó en un nodo de 8× A100-80GB con el framework ms-swift.

Los datos son aproximadamente 52.000 muestras multimodales repartidas en seis subcorpus sin reponderación manual: cad_vqa (4k) para comprensión visual de planos y renders isométricos; text2cadquery (17k) para generación de código paramétrico; com_2d (20k) y com_3d (5k) para scripts COM de SolidWorks/Inventor/AutoCAD; y text2cadquery-assembly (1k) más com_assembly (5k) para ensamblajes. Todas las muestras de código se validaron por ejecución en sandbox (VMs Windows contenerizadas para COM), conservando solo las que producían artefactos `.stl` o `.step` válidos. Los corpus se descontaminaron contra los benchmarks downstream a nivel de UUID y de estructura AST.

## Capacidades

- Comprensión visual CAD: lectura de planos de ingeniería multivista, renders isométricos y anotaciones dimensionales estructuradas (CAD-VQA).
- Generación de código paramétrico: conversión de lenguaje natural o imagen a Python ejecutable de CadQuery (text2cadquery).
- Generación de scripts COM: código para las APIs COM de SolidWorks, Autodesk Inventor y AutoCAD, en variantes 2D, 3D y de ensamblaje.
- Generación a nivel de ensamblaje: scripts CadQuery multipieza y scripts de ensamblaje COM, con una tasa de éxito usable del 15,38% (`passed@1e-3`), la primera no nula entre los modelos comparados en el informe técnico.
- Multimodalidad texto-imagen con plantilla de chat de Qwen3.5 y preprocesado de imagen de Qwen3.5-VL mediante `AutoProcessor`.
- Capacidades generales preservadas: matemáticas, MMLU, MMMU, OCR, ChartQA, ScienceQA y TriviaQA, con una media de 83,42% en 11 benchmarks.
- Bilingüe inglés-chino en instrucciones y generación.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Modo thinking explícito o salidas de audio: no documentados en la información disponible.

## Casos de uso

- **Automatización de cotización de piezas:** el modelo recibe el plano en imagen y devuelve un script CadQuery que reconstruye la geometría, lo que permite calcular volumen, masa y coste de material sin intervención manual. Es adecuado porque combina CAD-VQA (88,23% de precisión) con generación de código validada en sandbox.
- **Generación de macros COM para SolidWorks/Inventor:** un ingeniero describe la operación ("crea un croquis de extrusión con 6 taladros en patrón circular") y el modelo emite el script COM correspondiente, con un 73,33% de pass rate en el benchmark de dominio frente al 30,00% de gpt-5.4.
- **Migración de flujos entre CAD:** dado un script de Inventor y el plano asociado, generar el equivalente en CadQuery o en la API COM de SolidWorks, reduciendo el trabajo manual de reescritura en talleres con software heterogéneo.
- **Asistente de documentación técnica:** responder preguntas sobre cotas, tolerancias y vistas de un plano multivista, usando la ventana de 262.144 tokens de entrenamiento para ingerir varios planos y su contexto en una sola conversación.
- **Prototipado rápido en pipelines de CI:** integrar el modelo como paso de generación que produce `.step`/`.stl` y validar automáticamente la ejecución del script antes de fusionar, aprovechando que el autor entrenó solo con muestras ejecutables.
- **Generación de ensamblajes multipieza asistida:** aunque limitada (15,38%), es la única opción abierta comparada que produce ensamblajes ejecutables, útil como borrador que un ingeniero revisa y corrige.
- **Investigación en razonamiento industrial multimodal:** servir de base para experimentos de agentes que necesiten un sustrato con conocimiento CAD y buenas capacidades generales, sin partir de un modelo generalista que falla en dominio.

## Benchmarks y rendimiento

Resultados de dominio publicados en la model card:

| Benchmark | Qwen3.5-27B | gpt-5.4 | IndustryForge-27B | Delta vs base |
|---|---:|---:|---:|---:|
| CAD VQA (accuracy) | 84,10% | 87,12% | 88,23% | +4,13 |
| CadQuery (`passed@1e-3`) | 7,82% | 72,36% | 77,88% | +70,06 |
| COM CAD (Inventor/SolidWorks, pass rate) | 28,33% | 30,00% | 73,33% | +45,00 |
| CadQuery Assembly (`passed@1e-3`) | 0,00% | 3,85% | 15,38% | +15,38 |
| Media | 30,06% | 48,33% | 63,71% | +33,65 |

Resultados de capacidad general (media de 11 benchmarks: aime26, arc, chartqa, gsm8k, gsm8k_v, math_vision, mmlu, mmmu, ocr_bench, science_qa, trivia_qa):

| Modelo | Media |
|---|---:|
| Qwen3.5-27B | 81,86% |
| gpt-5.4 | 78,90% |
| IndustryForge-27B | 83,42% |

Desglose por benchmark individual: no disponible en la información proporcionada. No se han publicado resultados de benchmarks adicionales (HumanEval, MMLU por materia, etc.) en la información disponible.

## Requisitos de hardware

- **VRAM en bfloat16:** los pesos ocupan aproximadamente 54,7 GB (tamaño del repo, 12 shards). Con caché KV, activaciones del codificador visual y overhead de ejecución, se recomienda entre 70 y 80 GB.
- **GPU recomendadas:** A100-80GB o H100-80GB para bf16 sin cuantizar; el autor entrenó con 8× A100-80GB. Para servicio en 8 bits, una A6000 de 48 GB o L40S son opciones razonables.
- **Consumer GPU:** no cabe en bf16 en ninguna consumer (RTX 4090 tiene 24 GB). Con cuantización a 4 bits los pesos bajarían a unos 14-15 GB, lo que podría caber en una RTX 4090 o 3090, pero no hay cuantizaciones oficiales publicadas y habría que generarlas.
- **Opciones de despliegue:** `transformers >= 5.2.0` con `AutoModelForImageTextToText` y `device_map="auto"` es la vía documentada. vLLM y TGI requerirían soporte de la arquitectura `qwen3_5`. llama.cpp y Ollama no son utilizables sin convertir previamente los pesos a GGUF, formato que el autor no publica. Featherless ofrece una API compatible con OpenAI con contexto de 32K y precio plano desde 25 USD/mes.
- **Latencia y throughput:** no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CAD VQA | CadQuery | COM CAD | Ensamblaje | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|---|
| IndustryForge-27B | 27,36B | 262.144 (entrenamiento) | 88,23% | 77,88% | 73,33% | 15,38% | Apache 2.0 | Pesos abiertos en HuggingFace |
| Qwen3.5-27B (base) | 27B (no se detalla) | no disponible | 84,10% | 7,82% | 28,33% | 0,00% | no disponible en esta ficha | Pesos abiertos |
| gpt-5.4 | no disponible | no disponible | 87,12% | 72,36% | 30,00% | 3,85% | Propietaria | Solo API |

No se conocen en la información proporcionada otros modelos abiertos especializados en CAD con los que comparar directamente; el informe técnico citado menciona que los modelos de tarea única se quedan cortos frente a un enfoque multi-tarea, pero no se detallan sus resultados en esta ficha.

## Limitaciones y advertencias

- **Ensamblajes:** la capacidad a nivel de ensamblaje es todavía limitada (15,38% de `passed@1e-3`); la distribución de entrenamiento está dominada por piezas individuales (17k de text2cadquery frente a 1k de text2cadquery-assembly).
- **Cobertura de software:** solo cubre el "trío CAD de Windows" (SolidWorks, Inventor, AutoCAD); no incluye dominios COM de Office ni Adobe. La model card está truncada en el punto donde empezaba a describir más limitaciones, por lo que puede haber caveats adicionales no recogidos aquí.
- **Idiomas:** solo inglés y chino. No hay soporte declarado de castellano, lo que degradará instrucciones y documentación en español.
- **Alucinación de API:** al generar scripts COM contra APIs propietarias y cambiantes entre versiones, existe riesgo de llamadas a métodos inexistentes o firmas incorrectas; la validación por ejecución en sandbox es imprescindible antes de producción.
- **Código generado:** aunque el entrenamiento filtró por ejecución válida, no hay garantía de corrección geométrica ni de que el `.step` resultante sea el que el usuario espera; requiere revisión humana.
- **Licencia:** Apache 2.0 permite uso comercial del modelo, pero no otorga derechos sobre las APIs de SolidWorks, Inventor o AutoCAD, que requieren licencias de Dassault Systèmes y Autodesk en el entorno de ejecución.
- **Madurez:** el repositorio tiene 43 descargas y 12 likes en el momento de la consulta, con una única release (v4.1); la validación por parte de la comunidad es escasa.
- **Dependencias:** requiere `transformers >= 5.2.0` y el ecosistema de Qwen3.5-VL; no hay cuantizaciones ni formatos alternativos publicados, lo que limita el despliegue en hardware modesto.
- **Sesgos:** no se documenta ninguna evaluación de sesgos en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nianchen/IndustryForge-27B
- Modelo base Qwen3.5-27B: https://huggingface.co/Qwen/Qwen3.5-27B
- Perfil del autor en HuggingFace: https://huggingface.co/Nianchen
- Informe técnico en arXiv: https://arxiv.org/abs/2607.28050
- Despliegue vía API (Featherless): https://featherless.ai/models/Nianchen/IndustryForge-27B
- Ficha de terceros con métricas: https://free2aitools.com/model/nianchen/industryforge-27b
