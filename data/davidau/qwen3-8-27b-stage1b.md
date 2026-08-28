# DavidAU/Qwen3.8-27B-stage1b

## Resumen

DavidAU/Qwen3.8-27B-stage1b es un fine-tune del modelo Qwen3.8-27B de Alibaba, desarrollado por el usuario DavidAU. Se presenta como un ajuste multi-etapa que combina las técnicas Cold Fusion y GAIN Training, orientado a un uso "heretic" y "uncensored" (sin censura). El modelo base es un transformer denso de 27.000 millones de parámetros con atención híbrida (lineal en 48 de 64 capas), torre de visión integrada y un cabezal de decodificación especulativa MTP, con una ventana de contexto nativa de 262.000 tokens extensible a 1.000.000.

El repositorio de HuggingFace no proporciona detalles específicos sobre el proceso de entrenamiento, los datos utilizados ni las métricas de rendimiento del fine-tune. El acceso es restringido (gated) y requiere aceptar condiciones en la plataforma. Aunque el modelo base acepta entradas de imagen y texto, no se ha confirmado si esta versión conserva todas las capacidades multimodales del original.

La relevancia de este modelo radica en su naturaleza de fine-tune sin censura sobre una base técnica sólida, lo que puede interesar a desarrolladores que buscan alternativas menos restrictivas para generación de texto creativo o experimental, aunque con los riesgos asociados a la ausencia de alineación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3.8-27B (dense hybrid-attention, 48 capas con attention lineal, torre de vision, cabezal MTP) |
| Parametros totales | 27B (estimado segun el modelo base; no confirmado para este fine-tune) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada para este fine-tune; el base soporta 262K nativo y hasta 1M con extension |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (segun metadatos de HuggingFace) |
| Licencia | Apache-2.0 |
| Formato de pesos | Transformers (formato de archivo no especificado; probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura densa de 27.000 millones de parametros con atencion hibrida: 48 de sus 64 capas utilizan atencion lineal (probablemente basada en kernels como FlashLinearAttention o similar), mientras que las restantes mantienen atencion softmax completa. Incluye una torre de vision para procesar imagenes y un cabezal MTP (Multi-Token Prediction) que actua como borrador para decodificacion especulativa, acelerando la generacion. La ventana de contexto nativa es de 262.000 tokens, ampliable a 1.000.000 mediante tecnicas de interpolacion posicional.

Para este fine-tune, los metadatos indican el uso de "Cold Fusion" y "GAIN Training" como tecnicas de ajuste, junto con "Multi-stage tuning". No se especifican los datos de entrenamiento, el numero de tokens, ni si se aplicaron metodos de alineacion como RLHF o DPO. Dado el tag "uncensored", es probable que el entrenamiento haya eliminado o reducido las restricciones de seguridad del modelo original, pero no hay documentacion tecnica publica que detalle el proceso.

## Capacidades

- Generacion de texto en ingles, con potencial para razonamiento y codigo heredado del modelo base.
- Procesamiento de imagenes y texto (pipeline image-text-to-text), si bien no se ha verificado que el fine-tune conserve la torre de vision completa.
- Soporte de modo "thinking" (razonamiento encadenado) del modelo base, aunque no se confirma en esta version.
- Funciones de tool calling y agentes del base, no confirmadas para el fine-tune.
- Ausencia de censura (segun el tag "uncensored"), lo que permite generar contenido que el modelo original podria rechazar.
- Capacidades multilingues limitadas al ingles segun los metadatos, aunque el base soporta multiples idiomas.

## Casos de uso

- Generacion creativa sin restricciones: escritura de ficcion, poesia o dialogos con tematicas adultas o controvertidas que otros modelos rechazarian por politicas de seguridad.
- Experimentacion en investigacion: estudio de los efectos de fine-tunes sin alineacion sobre modelos de gran tamano, comparando comportamientos con el base.
- Prototipado rapido de aplicaciones de chat en ingles donde se requiere una voz "sin filtros", por ejemplo para personajes de videojuegos o asistentes de rol.
- Analisis de imagenes con descripcion libre: si conserva la vision, podria utilizarse para generar descripciones detalladas sin restricciones de contenido.
- Pruebas de robustez: evaluar como responde un modelo sin censura ante prompts adversariales o de alto riesgo, para fines de investigacion en seguridad de IA.
- Generacion de codigo experimental: aunque no hay benchmarks, el base tiene capacidades de codigo; el fine-tune podria usarse para generar scripts sin limitaciones de estilo o contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de HuggingFace no incluye metricas de evaluacion para este fine-tune. Los datos de rendimiento del modelo base (por ejemplo, en tareas de razonamiento, codigo o vision) estan disponibles en la documentacion de Qwen3.8-27B, pero no se puede asumir que el fine-tune los mantenga o supere.

## Requisitos de hardware

- Al ser un modelo de 27B parametros, se estima una VRAM minima de 16 GB para cuantizacion de 4 bits (por ejemplo, GGUF Q4_K_M) y alrededor de 32 GB para precision FP16.
- GPUs recomendadas: RTX 4090 (24 GB) para cuantizacion de 4-6 bits; A100 40/80 GB o H100 para precision completa o despliegue con lotes grandes.
- No se dispone de datos de latencia o throughput especificos para este fine-tune. Como referencia, el modelo base puede ejecutarse en consumer GPUs con cuantizacion, pero con velocidades modestas (del orden de 10-20 tokens/segundo en RTX 4090).
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, siempre que se disponga de los pesos en el formato adecuado (GGUF para llama.cpp/Ollama, safetensors para vLLM/TGI). No se han publicado versiones cuantizadas de este fine-tune.

## Comparativa con modelos similares

No se dispone de comparativas publicas de este fine-tune con otros modelos. A modo orientativo, se compara con el modelo base y otras alternativas de tamano similar:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K nativo, 1M extendido | Apache-2.0 | Multimodal, atencion hibrida, MTP |
| DavidAU/Qwen3.8-27B-stage1b | 27B (estimado) | No especificado | Apache-2.0 | Fine-tune sin censura, Cold Fusion + GAIN |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 Community | Mas pequeno, menos capaz en razonamiento complejo |
| Mistral Large 2 | 123B | 128K | Mistral Research | Mucho mayor, requiere mas hardware |

La comparacion directa no es posible sin datos de rendimiento del fine-tune.

## Limitaciones y advertencias

- No hay documentacion tecnica sobre el proceso de fine-tuning, los datos utilizados ni los criterios de evaluacion.
- El acceso es restringido (gated), lo que limita su uso inmediato y requiere aceptar condiciones adicionales.
- Al ser un modelo "uncensored", existe un riesgo elevado de generar contenido ofensivo, ilegal o danino. No es adecuado para aplicaciones de produccion orientadas al publico general sin un sistema de moderacion externo.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias de seguridad ni soporte.
- No se ha confirmado que el fine-tune conserve las capacidades multimodales del base; es posible que la vision este degradada o ausente.
- El rendimiento real en tareas estandar (razonamiento, codigo, matematicas) es desconocido; podria ser inferior al del base debido al sobreajuste o a la perdida de habilidades durante el fine-tune.
- El modelo solo declara soporte para ingles, aunque el base es multilingue.

## Enlaces

- HuggingFace: https://huggingface.co/DavidAU/Qwen3.8-27B-stage1b
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Guia de ejecucion local (Substack): https://linas.substack.com/p/qwen3-8-27b-local-guide
- Documentacion de Groq sobre Qwen3.8-27B: https://console.groq.com/docs/model/qwen/qwen3.8-27b
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Discusion sobre otro fine-tune del mismo autor (GGUF): https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NM-DAU-NEO-MAX-MTP-GGUF/discussions/8
