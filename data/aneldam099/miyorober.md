# ANELDAM099/MIYOROBER

## Resumen

MIYOROBER es un ajuste fino (fine-tuning) del modelo Qwen2.5-1.5B-Instruct, publicado por el usuario ANELDAM099 en HuggingFace. Se trata de un modelo de generacion de texto de 1.500 millones de parametros basado en la arquitectura Qwen2 (transformer decoder-only), entrenado mediante las herramientas de Unsloth sobre la version cuantizada en 4 bits del modelo instructivo original. El repositorio tiene un tamano de 0,1 GB y esta etiquetado para su uso con transformers, safetensors y text-generation-inference.

El modelo hereda las capacidades del Qwen2.5-1.5B-Instruct original: generacion de texto, razonamiento basico, codigo y comprension multilingue, aunque el autor declara unicamente el idioma ingles en la model card. La relevancia de esta publicacion es limitada: no incluye documentacion sobre el dataset de entrenamiento, hiperparametros, objetivos de ajuste ni resultados de evaluacion, y no registra descargas ni interacciones en el momento de la consulta.

Se trata, por tanto, de un experimento de ajuste fino de caracter comunitario, sin garantias de calidad ni validacion publica, adecuado unicamente para prototipado y experimentacion controlada. La licencia Apache 2.0 del modelo base se mantiene, lo que permite uso comercial, pero la ausencia de informacion sobre los datos de ajuste impide evaluar riesgos de sesgo o contaminacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.500 millones (aproximado, heredado del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, no confirmado para este ajuste) |
| Tipos de cuantizacion | pesos base en 4 bits (bnb-4bit); el repositorio contiene safetensors, cuantizaciones adicionales no disponibles |
| Idiomas soportados | en (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2, un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El modelo parte de `unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit`, una version del modelo instructivo oficial de Qwen cuantizada en 4 bits para reducir el uso de memoria durante el ajuste.

El entrenamiento se realizo con Unsloth, una libreria que optimiza el fine-tuning mediante kernels personalizados y tecnicas de ahorro de memoria (como LoRA/QLoRA sobre pesos cuantizados). La model card indica que el entrenamiento fue "2x mas rapido" con Unsloth, pero no especifica el numero de tokens de entrenamiento, la composicion del dataset, si se aplico RLHF, DPO o SFT supervisado, ni los hiperparametros utilizados. Tampoco se documenta ninguna innovacion tecnica adicional mas alla del propio pipeline de Unsloth.

## Capacidades

- Generacion de texto en ingles, con capacidad de mantener conversaciones multi-turno.
- Razonamiento basico y respuesta a preguntas, heredado del modelo instructivo Qwen2.5-1.5B.
- Generacion de codigo en lenguajes comunes, aunque limitada por el tamano del modelo.
- Aritmetica y matematicas simples.
- Soporte de tool calling / function calling (heredado del modelo base Qwen2.5, no verificado en este ajuste).
- Capacidades multilingues del modelo base (Qwen2.5 soporta varios idiomas), aunque la model card solo declara ingles.
- No se documenta soporte de vision, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Prototipado rapido de asistentes conversacionales: el modelo puede desplegarse en una GPU de consumo para validar flujos de dialogo antes de invertir en modelos mayores, gracias a su tamano de 1.500 millones de parametros.
- Generacion de texto en ingles para tareas de redaccion asistida (resumenes, reescritura, correos), aprovechando la herencia instructiva de Qwen2.5.
- Experimentacion academica con fine-tuning: sirve como punto de partida para comparar tecnicas de ajuste con Unsloth sobre un modelo pequeno y de licencia permisiva.
- Clasificacion y extraccion de informacion en ingles: el modelo puede adaptarse mediante prompting a tareas de etiquetado o extraccion de entidades en documentos cortos.
- Generacion de codigo en entornos de aprendizaje: util para autocompletar fragmentos o explicar codigo en tutoriares, con la cautela de que no se han publicado evaluaciones de calidad.
- Despliegue en entornos con recursos limitados: al caber en GPUs de 8-16 GB con cuantizacion, puede ejecutarse en estaciones de trabajo o instancias economicas para tareas de baja criticidad.
- Base para pipelines de CI/CD en pruebas de integracion de modelos: permite validar infraestructura de inferencia (TGI, vLLM) sin coste elevado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-4 GB en cuantizacion de 4 bits (el repositorio ya contiene pesos en 4 bits), y en torno a 3-4 GB en FP16 para 1.500 millones de parametros (unos 3 GB solo de pesos, mas overhead de activaciones y cache KV).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes. Para 4 bits, una GTX 1650 de 4 GB podria ser insuficiente por el overhead; se recomienda 8 GB o mas.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB).
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp (requiere conversion a GGUF), Ollama (previa conversion).
- Latencia y throughput estimados: no disponibles; al ser un modelo de 1.500 millones de parametros, se espera una latencia baja en GPU moderna, pero no hay mediciones publicadas para este ajuste concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MIYOROBER (este modelo) | 1.500 M | no disponible | Apache 2.0 | HuggingFace, 0 descargas | Ajuste fino sin documentacion de entrenamiento |
| Qwen2.5-1.5B-Instruct | 1.500 M | 32.768 tokens | Apache 2.0 | HuggingFace, ampliamente usado | Modelo base oficial, con benchmarks publicados |
| Llama 3.2 1B Instruct | 1.200 M | 128.000 tokens | Llama 3.2 Community License | HuggingFace, muy usado | Requiere aceptacion de licencia, no Apache 2.0 |
| SmolLM2-1.7B-Instruct | 1.700 M | 8.192 tokens | Apache 2.0 | HuggingFace | Alternativa ligera con documentacion completa |

## Limitaciones y advertencias

- Ausencia total de documentacion sobre el dataset de ajuste: no se puede evaluar sesgo, contaminacion ni calidad del fine-tuning.
- Riesgo elevado de alucinacion, especialmente por el tamano reducido del modelo (1.500 millones de parametros) y la falta de evaluacion.
- Idioma declarado unicamente ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior al del modelo base multilingue.
- Longitud de contexto no confirmada para este ajuste; asumir la del modelo base (32.768 tokens) es una suposicion no validada.
- Sin descargas ni validacion de la comunidad: no hay evidencia de que el ajuste funcione correctamente o haya completado el entrenamiento de forma satisfactoria.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el usuario asume todo el riesgo.
- No apto para produccion sin una evaluacion previa exhaustiva en el dominio objetivo.
- El repositorio pesa solo 0,1 GB, coherente con pesos en 4 bits, pero no se especifica si el ajuste es completo o mediante adaptadores LoRA fusionados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ANELDAM099/MIYOROBER
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Modelo original Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
