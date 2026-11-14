# daidaiOVO/Qwen2.5-7B-Instruct-onnx-ryzenai-1.7-hybrid

## Resumen

`daidaiOVO/Qwen2.5-7B-Instruct-onnx-ryzenai-1.7-hybrid` es una distribucion cuantizada del modelo Qwen2.5-7B-Instruct de Alibaba Cloud, preparada por el usuario daidaiOVO mediante la herramienta AMD Quark Quantization y empaquetada en formato ONNX para su ejecucion en la pila Ryzen AI Hybrid de AMD. El modelo base es un transformer decoder-only de 7.6 mil millones de parametros, afinado para instrucciones y conversacion, con una ventana de contexto nativa de 32 768 tokens (ampliable a 131 072 en la familia Qwen2.5).

La relevancia de esta ficha reside en que no se trata de un modelo nuevo, sino de una conversion de despliegue orientada a hardware de consumo AMD: pesos en UINT4 con grupo 128 y activaciones BFP16, lo que reduce el repositorio a 8,6 GB y permite ejecutar un modelo de 7B en equipos con NPU Ryzen AI y GPU integrada. Es un artefacto de infraestructura mas que un modelo de investigacion, y su interes practico esta en la inferencia local en portatiles y mini-PC con silicio AMD.

La model card es extremadamente escueta: solo documenta la estrategia de cuantizacion, tres subpuntuaciones MMLU y el aviso legal. No hay informacion sobre el proceso de calibracion, el conjunto de datos de evaluacion completo ni el rendimiento en otras tareas, lo que limita la evaluacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), cuantizado a ONNX |
| Parametros totales | 7,6 mil millones (heredados de Qwen2.5-7B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el base Qwen2.5-7B-Instruct soporta 32 768 tokens nativos, ampliable a 131 072) |
| Tipos de cuantizacion | AWQ, grupo 128, asimetrica, pesos UINT4, activaciones BFP16 |
| Idiomas soportados | en (segun la model card; el base soporta multiples idiomas) |
| Licencia | MIT (modificaciones AMD) sobre la licencia Tongyi Qianwen del modelo base |
| Formato de pesos | ONNX (Ryzen AI Hybrid) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-7B-Instruct, un transformer decoder-only con atencion causal estandar, RoPE, normalizacion RMSNorm, activacion SwiGLU y sesgo de atencion desactivado en la mayoria de proyecciones (configuracion tipica de la familia Qwen2.5). El entrenamiento original incluyo preentrenamiento sobre un corpus multilingue de varios billones de tokens, seguido de ajuste supervisado y optimizacion por preferencias (DPO) para alineamiento conversacional. No se dispone de detalles adicionales sobre composicion del dataset ni numero exacto de tokens en la informacion proporcionada.

La innovacion de esta version es puramente de despliegue: AMD Quark aplica cuantizacion AWQ con grupo de 128 y esquema asimetrico, dejando los pesos en UINT4 y las activaciones en BFP16 para aprovechar las unidades matriciales de la NPU Ryzen AI en modo hibrido (reparto de capas entre NPU y GPU/CPU). No se documenta calibracion, numero de muestras ni impacto medido de la cuantizacion en perplejidad. Tampoco se indica si se preservan las capacidades de tool calling del modelo original tras la conversion.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles, heredadas de Qwen2.5-7B-Instruct.
- Razonamiento y matematicas de nivel medio, coherente con un modelo de 7B afinado por instrucciones.
- Generacion de codigo en lenguajes populares (Python, JavaScript, C++, etc.), segun las capacidades del base.
- Tool calling y function calling: el base Qwen2.5-7B-Instruct lo soporta, pero no se confirma en la model card que la conversion ONNX lo preserve.
- Modo de razonamiento estructurado: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el base es solo texto.
- Multilingue: la model card declara solo `en`, aunque el base soporta chino, espanol, frances, aleman y otros; no hay verificacion del comportamiento tras la cuantizacion.
- Ejecucion en NPU Ryzen AI en modo hibrido mediante la pila ONNX Runtime GenAI de AMD.

## Casos de uso

- Asistente conversacional local en portatiles AMD: el modelo puede desplegarse en un equipo con Ryzen AI 300 o superior usando ONNX Runtime GenAI y la ruta hibrida NPU/GPU, ofreciendo un chatbot privado sin conexion a internet y con 8,6 GB de pesos en disco.
- Generacion de codigo en entornos de desarrollo con GPU integrada: al caber en memoria unificada de equipos con 16 GB o mas, permite autocompletado y explicacion de codigo en IDE sin enviar el codigo a la nube, adecuado para entornos con requisitos de confidencialidad.
- Procesamiento de documentos y resumen extractivo: con contexto de hasta 32 768 tokens (heredado del base, sujeto a verificacion en la conversion), puede resumir informes, actas o articulos largos en local.
- Prototipado de agentes con tool calling: si la conversion preserva el formato de funciones de Qwen2.5, puede integrarse en flujos de automatizacion que consulten APIs locales mediante plantillas de chat compatibles.
- Educacion y tutoria offline: despliegue en aulas o entornos sin red para asistencia en asignaturas de ciencias y humanidades, aprovechando las puntuaciones MMLU reportadas en astronomia, filosofia y gestion.
- Filtrado y clasificacion de texto en pipelines de datos: uso como clasificador zero-shot o few-shot sobre lotes de documentos, ejecutandose en la NPU para liberar la CPU durante el preprocesamiento.
- Evaluacion comparativa de cuantizacion: util como referencia para medir la degradacion de AWQ UINT4 frente al modelo original en tareas controladas, dado que el autor publica tres subpuntuaciones MMLU.

## Benchmarks y rendimiento

La model card solo reporta tres subpuntuaciones MMLU del modelo cuantizado. No se aportan resultados del modelo original en la misma evaluacion, ni otros benchmarks (HumanEval, GSM8K, MT-Bench), ni latencia o throughput.

| Benchmark | Subcategoria | Resultado |
|---|---|---|
| MMLU | Astronomia | 84,21 |
| MMLU | Filosofia | 74,60 |
| MMLU | Gestion | 83,50 |

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 8,6 GB en disco; en ejecucion, con pesos UINT4 y activaciones BFP16, se estima un consumo de memoria en torno a 6-9 GB, dependiendo de la longitud de contexto y del reparto hibrido entre NPU y GPU.
- Hardware objetivo: plataformas AMD Ryzen AI (NPU XDNA/XDNA2) con GPU integrada Radeon; la documentacion de AMD Ryzen AI Hybrid es el requisito de despliegue.
- GPU dedicadas: no es el objetivo del artefacto; no se documenta soporte para A100, H100 o RTX 4090 mediante esta conversion ONNX especifica.
- GPU de consumo: cabe en equipos con memoria unificada de 16 GB o mas (portatiles Ryzen AI 300, mini-PC con APU Strix Point o superiores); en GPUs discretas de 8 GB no se garantiza por el formato ONNX hibrido.
- Opciones de despliegue: ONNX Runtime GenAI con el proveedor de ejecucion Ryzen AI Hybrid (segun la documentacion de AMD); no se menciona soporte para vLLM, llama.cpp, Ollama ni TGI en esta conversion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| daidaiOVO/Qwen2.5-7B-Instruct-onnx-ryzenai-1.7-hybrid | 7,6B | no disponible (base: 32 768) | ONNX UINT4/BFP16 | MIT + Tongyi Qianwen | Inferencia en NPU Ryzen AI |
| Qwen/Qwen2.5-7B-Instruct | 7,6B | 32 768 (hasta 131 072) | safetensors BF16 | Tongyi Qianwen (Apache 2.0 en variantes recientes) | Modelo base de referencia |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32 768 | safetensors | Apache 2.0 | Alternativa abierta con tool calling |
| Llama-3.1-8B-Instruct | 8,0B | 131 072 | safetensors | Llama 3.1 Community | Alternativa abierta multilingue |

La comparativa con Mistral y Llama es orientativa por tamano y categoria; no se dispone de resultados de benchmarks de este artefacto frente a ellos. La ventaja diferencial del modelo de daidaiOVO es el empaquetado para NPU AMD, no el rendimiento bruto.

## Limitaciones y advertencias

- La model card no documenta el impacto de la cuantizacion AWQ UINT4 en calidad; solo se ofrecen tres subpuntuaciones MMLU sin comparacion con el modelo original.
- Riesgo de alucinacion inherente a un modelo de 7B: puede inventar hechos, citas y APIs, especialmente en tareas de codigo y datos numericos.
- Idiomas: la model card declara unicamente `en`; el comportamiento en castellano no esta verificado y podria degradarse respecto al base.
- Licencia: se declara MIT para las modificaciones de AMD, pero el modelo base esta sujeto a la Tongyi Qianwen License Agreement, que exige solicitud de licencia si el producto supera 100 millones de usuarios activos mensuales y prohibe usar las salidas para mejorar otros modelos de lenguaje.
- Restricciones de exportacion: los materiales pueden estar sujetos a controles de exportacion en China, Estados Unidos y otras jurisdicciones.
- Dependencia de la pila Ryzen AI: el despliegue requiere ONNX Runtime GenAI con el proveedor hibrido de AMD; no hay soporte documentado para vLLM, llama.cpp u Ollama, lo que limita la portabilidad.
- Sin metricas de latencia ni throughput: no se puede estimar el rendimiento en produccion a partir de la informacion disponible.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni validacion independiente.
- Fecha de creacion futura (2026-11-14) en los metadatos: conviene verificar la integridad y procedencia del artefacto antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/daidaiOVO/Qwen2.5-7B-Instruct-onnx-ryzenai-1.7-hybrid
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Documentacion de Ryzen AI Hybrid (AMD): https://ryzenai.docs.amd.com/en/latest/hybrid_oga.html
- Herramienta AMD Quark Quantization: no disponible en la informacion proporcionada
- Paper de Qwen2.5: no disponible en la informacion proporcionada
