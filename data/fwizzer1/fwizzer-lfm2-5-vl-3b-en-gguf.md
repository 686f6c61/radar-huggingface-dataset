# fwizzer1/Fwizzer-LFM2.5-VL-3B-EN-GGUF

## Resumen

Fwizzer-LFM2.5-VL-3B-EN-GGUF es un ajuste fino multimodal publicado por el usuario fwizzer1 sobre el modelo LiquidAI/LFM2.5-VL-3B, distribuido exclusivamente en formato GGUF para su uso con llama.cpp, LM Studio y Ollama. Se trata de un modelo de visión-lenguaje (image-text-to-text) de aproximadamente 3.000 millones de parámetros que combina un backbone híbrido de tipo Liquid Neural Network de 2,69B con una torre de visión SigLIP2 de 400M, orientado a tareas de razonamiento con cadena de pensamiento explícita dentro de bloques `<think>...</think>`.

El modelo resuelve el problema de disponer de un VLM pequeño, ejecutable en hardware de consumo, especializado en OCR de página completa, interpretación de layouts y generación de código para entornos 3D (Blender 4.x, Godot 4). Su ventana de contexto declarada es de 32.768 tokens, ampliable hasta 131.000 según el autor. El ajuste se realizó sobre el dataset privado `fwizzer1/fwizzer-v3-titan-agentic` (17.743 muestras), lo que limita la verificabilidad externa del proceso de entrenamiento.

Su relevancia actual es la de un ejemplo de fine-tuning comunitario sobre la familia LFM2.5 de Liquid AI, con cuantizaciones ya empaquetadas (Q4_K_M, Q5_K_M, Q8_0) y un proyector de visión separado en f16. La ficha se publica sin benchmarks, sin descargas y sin validación independiente en el momento de su creación, por lo que debe evaluarse como un artefacto experimental.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Hybrid Liquid Neural Network (backbone LFM de 2,69B + torre de visión SigLIP2 de 400M) |
| Parámetros totales | Aproximadamente 3.090 millones (2,69B backbone + 0,4B torre de visión), según la model card |
| Parámetros activos | No aplica (no se documenta que sea MoE) |
| Longitud de contexto | 32.768 tokens; hasta 131.000 tokens con el backbone LFM según el autor |
| Tipos de cuantización | Q8_0 (~3,4 GB), Q5_K_M (~2,5 GB), Q4_K_M (~2,1 GB); proyector de visión mmproj en f16 (~800 MB) |
| Idiomas soportados | Inglés (en) |
| Licencia | LFM 1.0 (license_name: lfm1.0, declarada como license: other) |
| Formato de pesos | GGUF (llama.cpp), con proyector multimodal mmproj separado en f16 |

## Arquitectura y entrenamiento

La arquitectura declarada es una red neuronal híbrida de tipo Liquid (Hybrid Liquid Neural Network), una propuesta de Liquid AI que combina capas recurrentes/lineales de estado con componentes tipo transformer. El modelo base es LiquidAI/LFM2.5-VL-3B, y el ajuste de fwizzer1 añade una torre de visión SigLIP2 de 400M parámetros que se distribuye por separado como `mmproj-LFM2.5-VL-3B-f16.gguf`. El comportamiento de razonamiento se articula mediante bloques `<think> ... </think>`, con cadenas de pensamiento internas antes de la respuesta final, y la model card recomienda detener la generación con `</think>` y `<|im_end|>`.

El entrenamiento de ajuste se realizó sobre el dataset privado `fwizzer1/fwizzer-v3-titan-agentic`, fichero `train_en.parquet`, con 17.743 muestras. No se documentan el número total de tokens, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO u otras. La model card tampoco detalla hiperparámetros de entrenamiento, régimen de precisión ni método de fusión de la torre de visión, por lo que la información sobre el proceso queda incompleta.

## Capacidades

- Generación de texto y razonamiento analítico con cadena de pensamiento explícita en bloques `<think>`.
- Comprensión de imágenes con entrada image-text-to-text mediante la torre SigLIP2.
- OCR de página completa con parsing nativo de layout.
- Grounding de layout y detección de objetos dentro de documentos, según la model card.
- Interpretación de geometría 3D y parsing procedural, orientado a Blender 4.x y Godot 4.
- Generación de código asociada a esos entornos 3D, según las capacidades declaradas por el autor.
- Modo de razonamiento reflexivo descrito como "pure reasoning engine", sin filtros analíticos.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente multi-paso: no documentadas explícitamente, aunque el dataset de ajuste se denomina "titan-agentic".
- Capacidades multilingües: limitadas a inglés.

## Casos de uso

- Digitalización de documentos con OCR de página completa: el modelo puede extraer texto de imágenes de documentos preservando la estructura de layout, lo que resulta adecuado para pipelines de archivo y gestión documental.
- Procesamiento de facturas y formularios: el grounding de layout permite localizar campos concretos dentro de una imagen escaneada, útil en automatización contable.
- Asistente local de análisis de imágenes en LM Studio: al distribuirse en GGUF y con el proyector mmproj, puede ejecutarse en un portátil con GPU de gama media sin conexión a servicios externos.
- Generación y depuración de scripts para Blender 4.x: el modelo declara parsing procedural y nociones de geometría 3D, por lo que puede asistir en la escritura de scripts de modelado y automatización de escenas.
- Asistencia en proyectos Godot 4: generación de código GDScript y estructuras de escena, aprovechando el conocimiento procedural declarado.
- Razonamiento paso a paso para resolución de problemas técnicos: el modo `<think>` permite auditar el razonamiento intermedio antes de la respuesta final, útil en entornos educativos o de revisión.
- Prototipado de agentes con dataset agentic: aunque no se documenta tool calling, el ajuste sobre un dataset orientado a agentes permite experimentar con flujos de razonamiento multi-paso en investigación.
- Despliegue en entornos con recursos limitados o air-gapped: con pesos de 2,1 a 3,4 GB, es viable en equipos sin GPU dedicada potente y en infraestructuras sin acceso a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye una afirmación cualitativa para la cuantización Q8_0 ("99,9% de precisión, cero degradación del razonamiento"), sin metodología, conjunto de evaluación ni cifras concretas. No se dispone de resultados de MMLU, HumanEval, GSM8K, MMMU ni de ningún otro benchmark para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir de los tamaños de fichero declarados, sin incluir caché KV):
  - Q4_K_M: ~2,1 GB de pesos + ~0,8 GB del proyector mmproj, aproximadamente 2,9 GB en total.
  - Q5_K_M: ~2,5 GB de pesos + ~0,8 GB del proyector, aproximadamente 3,3 GB.
  - Q8_0: ~3,4 GB de pesos + ~0,8 GB del proyector, aproximadamente 4,2 GB.
- Con contexto de 32.768 tokens, la caché KV añade consumo adicional no cuantificado en la información disponible.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo cabe holgadamente en GPUs de consumo como RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090, y en GPUs profesionales A100 o H100 sin necesidad de reparto en múltiples dispositivos.
- Cabe en GPU de consumo: sí, en cualquier GPU con 6 GB o más de VRAM para las cuantizaciones Q4_K_M y Q5_K_M; la inferencia en CPU también es viable dado el tamaño.
- Opciones de despliegue: llama.cpp, LM Studio (con detección automática del mmproj), Ollama. No se mencionan vLLM, TGI ni otros servidores en la información disponible.
- Configuración recomendada por el autor: temperatura 0,6, top-p 0,95, min-p 0,05, repetition penalty 1,05.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Rendimiento |
|---|---|---|---|---|---|
| Fwizzer-LFM2.5-VL-3B-EN-GGUF | ~3,09B (2,69B + 0,4B visión) | 32.768 tokens (hasta 131k) | GGUF | LFM 1.0 | Sin benchmarks publicados |
| LiquidAI/LFM2.5-VL-3B (base) | ~3B, según el autor del ajuste | No disponible en la información recuperada | No disponible | LFM 1.0 | No disponible |
| LiquidAI/LFM2.5-VL-3B-GGUF | No disponible | No disponible | GGUF | LFM 1.0 | No disponible |

No se dispone de datos de benchmarks ni de especificaciones verificadas de alternativas de la misma categoría (VLMs de ~3B como las familias Qwen-VL o SmolVLM) dentro de la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Modelo exclusivamente en inglés; no se declara soporte de castellano ni de otros idiomas.
- Tamaño de 3B: capacidad de razonamiento y conocimiento factual limitados en comparación con modelos de 7B o superiores.
- Dataset de ajuste privado y no verificable, con 17.743 muestras; no se documenta composición, procedencia ni posibles sesgos.
- Ausencia total de benchmarks publicados; las afirmaciones de calidad de la model card no son verificables de forma independiente.
- Riesgo de alucinación inherente a modelos de este tamaño, especialmente en OCR sobre documentos degradados y en afirmaciones factuales.
- El contexto de 131.000 tokens es una capacidad declarada del backbone, no una garantía de rendimiento estable en formato GGUF a esa longitud.
- El autor advierte implícitamente de degradación del razonamiento en cuantizaciones bajas al destacar que Q8_0 no la presenta.
- Licencia LFM 1.0 heredada del modelo base: los términos concretos de uso comercial no se detallan en la información disponible y deben revisarse antes de un despliegue en producción.
- Soporte de tool calling y de agentes no confirmado; el nombre del dataset de ajuste no constituye una garantía funcional.
- Artefacto con 0 descargas y 0 valoraciones en el momento de la publicación, sin comunidad que haya validado su comportamiento.
- El ajuste puede degradar capacidades del modelo base no representadas en el dataset de entrenamiento (olvido catastrófico parcial).
- No se documentan medidas de seguridad, alineamiento ni filtrado de contenido.

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/fwizzer1/Fwizzer-LFM2.5-VL-3B-EN-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-3B
- Cuantizaciones oficiales del base: https://huggingface.co/LiquidAI/LFM2.5-VL-3B-GGUF
- Dataset de ajuste (referenciado en los tags): https://huggingface.co/datasets/fwizzer1/fwizzer-v3-titan-agentic
- No se han recuperado papers, blogs técnicos ni repositorios adicionales asociados a este ajuste concreto en la búsqueda web realizada.
