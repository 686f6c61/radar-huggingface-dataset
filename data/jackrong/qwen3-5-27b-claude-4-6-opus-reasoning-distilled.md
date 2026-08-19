# Jackrong/Qwen3.5-27B-Claude-4.6-Opus-Reasoning-Distilled

## Resumen

Qwen3.5-27B-Claude-4.6-Opus-Reasoning-Distilled es un modelo de razonamiento de 27 800 millones de parametros, desarrollado por Jackrong mediante fine-tuning del modelo base Qwen/Qwen3.5-27B. El modelo se entrena con Supervised Fine-Tuning (SFT) y LoRA, destilando cadenas de razonamiento (Chain-of-Thought) generadas por Claude-4.6-Opus a partir de dos datasets publicos: nohurry/Opus-4.6-Reasoning-3000x-filtered y Jackrong/Qwen3.5-reasoning-700x. El objetivo principal es mejorar la estructura del razonamiento paso a paso y reducir la verbosidad transicional que muestra el modelo base en consultas sencillas.

Su relevancia actual radica en dos aportaciones practicas: corrige un fallo del modelo base en la plantilla Jinja que provocaba errores con el rol "developer" (usado por agentes de codificacion como Claude Code u OpenCode), y preserva el modo de pensamiento activo, lo que permite a los agentes ejecutarse de forma autonoma durante mas de 9 minutos sin intervencion humana. La licencia Apache 2.0 permite uso comercial sin restricciones, y el autor ha publicado el cuaderno de entrenamiento completo, el codigo y una guia en PDF para reproducir el proceso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Dense) |
| Parametros totales | 27 781 427 952 (27,8 B) |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo en safetensors, se esperan cuantizaciones GGUF/AWQ de la comunidad) |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-27B, una arquitectura transformer densa de 27 800 millones de parametros. El proceso de entrenamiento consiste en un fine-tuning supervisado (SFT) con LoRA, ejecutado con la libreria Unsloth 2026.3.3 y Transformers 5.2.0. Los datos de entrenamiento son cadenas de razonamiento de Claude-4.6-Opus, filtradas y unificadas en dos datasets: uno de 3000 ejemplos filtrados y otro de 700 ejemplos adicionales de razonamiento.

La innovacion principal es la destilacion estructural del patron de razonamiento de Claude-4.6-Opus: el modelo aprende a iniciar sus respuestas con un esquema tipo "Let me analyze this request carefully: 1. Identificar el objetivo central, 2. Descomponer en subcomponentes, 3. Evaluar restricciones y casos limite, 4. Formular un plan, 5. Ejecutar y verificar". Este patron reduce los bucles cognitivos redundantes del modelo base y mejora la eficiencia de inferencia. Ademas, se corrige la plantilla Jinja para soportar el rol "developer" sin parches externos, y el modo de pensamiento se mantiene activo por defecto.

## Capacidades

- Razonamiento estructurado paso a paso con cadenas de pensamiento completas dentro de etiquetas `thinking`.
- Generacion de texto conversacional en ingles y chino.
- Soporte nativo del rol "developer" en la plantilla de chat, compatible con agentes de codificacion como Claude Code y OpenCode.
- Modo de pensamiento preservado (thinking=1), sin desactivacion silenciosa.
- Autonomia mejorada en entornos de agente: espera activa de respuestas de herramientas, lectura de salidas, autocorreccion de errores y generacion automatica de artefactos (por ejemplo, README).
- Tool calling estable en comparacion con otras cuantizaciones del mismo modelo base, segun pruebas de la comunidad.
- El pipeline declarado en HuggingFace es image-text-to-text, aunque la model card describe el resultado final como text-only; esta discrepancia no esta resuelta en la documentacion disponible.

## Casos de uso

- Agentes de codificacion autonomos: el modelo puede integrarse en Claude Code u OpenCode para ejecutar tareas de desarrollo de larga duracion (mas de 9 minutos) sin intervencion, leyendo salidas de herramientas, autocorrigiendose y generando documentacion.
- Asistente de razonamiento complejo: adecuado para descomponer problemas cientificos o de ingenieria en subproblemas manejables, con verificacion explicita de cada paso.
- Generacion de codigo en produccion: su tool calling estable permite conectarlo a pipelines de CI/CD para generar, revisar y corregir codigo de forma automatica.
- Soporte tecnico multilingue: conversaciones en ingles y chino con contexto largo, manteniendo un hilo de razonamiento coherente en interacciones multi-turno.
- Educacion y tutoria: puede explicar problemas matematicos o algoritmicos mostrando su cadena de razonamiento completa, util para entornos de aprendizaje.
- Investigacion en destilacion de modelos: el repositorio incluye el cuaderno de entrenamiento completo, lo que permite reproducir el proceso de destilacion CoT sobre otros modelos base.

## Benchmarks y rendimiento

Segun la ficha de openmodelmap.com, el modelo obtiene una puntuacion MMLU de 88. No se han publicado en la informacion disponible resultados adicionales de benchmarks estandar como HumanEval, GSM8K o MT-Bench, ni comparativas cuantitativas con otros modelos. Las pruebas de la comunidad citadas en la model card se centran en estabilidad de tool calling y autonomia en agentes, sin metricas numericas publicadas.

| Benchmark | Resultado |
|---|---|
| MMLU | 88 (fuente: openmodelmap.com) |
| HumanEval | No disponible |
| GSM8K | No disponible |
| MT-Bench | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: con 27,8 B de parametros, una cuantizacion de 4 bits requiere aproximadamente 16-18 GB de VRAM; en 8 bits, alrededor de 28-30 GB. El repositorio en safetensors sin cuantizar ocupa 111,2 GB en disco.
- GPU recomendadas: una RTX 3090 o RTX 4090 (24 GB) puede ejecutar la version cuantizada a 4 bits; para precision completa se requieren GPU de datacenter como A100 (80 GB) o H100.
- Compatibilidad con GPU de consumo: si, en cuantizaciones de 4 bits cabe en RTX 3090, RTX 4090 y similares con 24 GB de VRAM. Un usuario de la comunidad reporta pruebas exitosas en una sola RTX 3090.
- Opciones de despliegue: al estar basado en Qwen3.5, es compatible con vLLM, TGI, llama.cpp y Ollama (una vez publicadas las cuantizaciones GGUF por la comunidad). El autor recomienda Unsloth para fine-tuning.
- Latencia y throughput: no se han publicado mediciones formales. En RTX 3090 con cuantizacion, la generacion con modo de pensamiento activo es utilizable pero lenta para tareas de agente de larga duracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-27B-Claude-4.6-Opus-Reasoning-Distilled | 27,8 B | No disponible | 88 | Apache 2.0 | HuggingFace, ModelScope |
| Qwen/Qwen3.5-27B (base) | 27,8 B | No disponible | No disponible | Apache 2.0 | HuggingFace |
| Qwen3.5-27B-Claude-4.6-Opus-Reasoning-Distilled-v2 | 27,8 B (estimado) | No disponible | No disponible | Apache 2.0 | HuggingFace |

La comparativa se limita a las variantes del mismo autor y al modelo base, ya que no se dispone de datos de modelos competidores de tamano equivalente en la informacion proporcionada. La version v2 existe pero no se han publicado sus especificaciones ni benchmarks en las fuentes consultadas.

## Limitaciones y advertencias

- Sesgos conocidos: no se han publicado evaluaciones de sesgo; al estar entrenado principalmente con datos de razonamiento en ingles y chino, puede presentar sesgos culturales o linguisticos en otros idiomas.
- Riesgo de alucinacion: no hay evaluaciones publicadas de fiabilidad factual; como todo modelo de razonamiento destilado, puede producir cadenas de pensamiento coherentes pero incorrectas.
- Limitaciones de idioma: solo soporta ingles y chino de forma declarada; el rendimiento en otros idiomas no esta garantizado.
- Discrepancia de pipeline: el tag de HuggingFace indica image-text-to-text, pero la model card describe el modelo final como text-only. No esta claro si el modelo acepta entradas multimodales; se recomienda verificar antes de usarlo en tareas de vision.
- Longitud de contexto no documentada: no se ha publicado el tamano de ventana de contexto, lo que dificulta planificar su uso en tareas de recuperacion o documentos largos.
- Rendimiento en produccion sin validar: las pruebas de la comunidad son anecdoticas (un usuario, una GPU) y no constituyen una evaluacion sistematica de estabilidad o latencia.
- Dependencia de la comunidad para cuantizaciones: no hay cuantizaciones oficiales publicadas; habra que esperar a que la comunidad genere versiones GGUF o AWQ para despliegue eficiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jackrong/Qwen3.5-27B-Claude-4.6-Opus-Reasoning-Distilled
- Version v2 en HuggingFace: https://huggingface.co/Jackrong/Qwen3.5-27B-Claude-4.6-Opus-Reasoning-Distilled-v2
- Modelo en ModelScope: https://www.modelscope.cn/models/Jackrong/Qwen3.5-27B-Claude-4.6-Opus-Reasoning-Distilled
- Ficha en OpenModelMap: https://openmodelmap.com/model/Jackrong/Qwen3.5-27B-Claude-4.6-Opus-Reasoning-Distilled
- Repositorio GitHub con guia de fine-tuning: https://github.com/R6410418/Jackrong-llm-finetuning-guide.git
- Guia completa de fine-tuning en PDF: https://github.com/R6410418/Jackrong-llm-finetuning-guide/blob/main/guidePDF/Qwopus3-5-27b-Colab_complete_guide_to_llm_finetuning.pdf
- Dataset de razonamiento (3000x filtrado): https://huggingface.co/datasets/nohurry/Opus-4.6-Reasoning-3000x-filtered
- Dataset de razonamiento (700x): https://huggingface.co/datasets/Jackrong/Qwen3.5-reasoning-700x
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Libreria Unsloth: https://unsloth.ai
