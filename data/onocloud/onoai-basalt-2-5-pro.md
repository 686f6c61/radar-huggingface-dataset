# onocloud/onoai-basalt-2.5-pro

## Resumen

OnoAI Basalt 2.5 Pro es un ajuste fino (fine-tuning) del modelo Qwen2.5-Coder-7B-Instruct, publicado por el usuario onocloud en Hugging Face. El modelo parte de la versión cuantizada en 4 bits del Qwen2.5-Coder-7B-Instruct distribuida por Unsloth (`unsloth/Qwen2.5-Coder-7B-Instruct-bnb-4bit`) y se ha entrenado con Unsloth y la librería TRL de Hugging Face, lo que, segun la model card, permite un entrenamiento aproximadamente 2 veces mas rapido.

Se trata de un modelo de generacion de texto basado en la arquitectura Qwen2, orientado a tareas conversacionales y de codigo, con licencia Apache 2.0. El repositorio, sin embargo, esta practicamente vacio (0.0 GB) y no incluye pesos publicados, lo que limita seriamente su uso practico en el momento de redactar esta ficha. No se dispone de informacion sobre el dataset de ajuste fino, el numero de tokens de entrenamiento ni los hiperparametros utilizados.

La relevancia de esta ficha es principalmente documental: sirve para registrar la existencia del modelo, identificar su linaje (Qwen2.5-Coder-7B-Instruct) y advertir a desarrolladores e investigadores de que, sin pesos disponibles ni benchmarks publicados, no es un candidato viable para produccion en su estado actual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 7B (heredados del modelo base Qwen2.5-Coder-7B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-Coder-7B-Instruct soporta hasta 32 768 tokens, pero no se confirma en este ajuste) |
| Tipos de cuantizacion | no disponible (el punto de partida es bnb-4bit; no se publican pesos) |
| Idiomas soportados | en (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (segun tags del repo; no hay pesos publicados) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen2, un transformer decoder-only con atencion causal estandar, RoPE y capas densas, propia de la familia Qwen2.5-Coder-7B-Instruct. El ajuste fino se ha realizado sobre la version cuantizada en 4 bits (bnb-4bit) del modelo base, utilizando Unsloth y TRL. Segun la model card, esta combinacion permite entrenar aproximadamente 2 veces mas rapido que un pipeline convencional.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni de tecnicas adicionales como decodificacion especulativa o atencion lineal. La model card es minimalista y no documenta hiperparametros, semillas ni metodologia de evaluacion. Esta ausencia de documentacion es un caveat importante para cualquier uso en investigacion reproducible.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen2.5-Coder-7B-Instruct.
- Generacion y edicion de codigo en multiples lenguajes de programacion (capacidad del modelo base, no verificada en este ajuste).
- Razonamiento matematico basico y resolucion de problemas (capacidad del modelo base, no verificada).
- Soporte de tool calling / function calling (el modelo base Qwen2.5-Coder-Instruct lo soporta; no confirmado en este ajuste).
- Capacidades multilingues limitadas al ingles segun la model card, aunque el modelo base soporta varios idiomas.
- No se documentan modos especiales como thinking mode, vision o audio.

## Casos de uso

- Prototipado rapido de asistentes de codigo en ingles: el modelo puede emplearse como base para experimentar con ajustes finos adicionales, aunque la ausencia de pesos publicados obliga a reproducir el entrenamiento desde el modelo base.
- Generacion de snippets de codigo en entornos de desarrollo internos: adecuado por su linaje Qwen2.5-Coder, siempre que se obtengan los pesos y se valide la calidad del ajuste.
- Experimentacion academica sobre fine-tuning con Unsloth: util como referencia de pipeline (Unsloth + TRL sobre bnb-4bit) para investigadores que quieran replicar el flujo.
- Chatbot tecnico en ingles para documentacion de APIs: puede gestionar conversaciones multi-turno, aunque la ventana de contexto efectiva no esta documentada.
- Base para distillation o ajustes posteriores: al ser un ajuste fino de Qwen2.5-Coder-7B, puede servir como punto de partida para experimentos de alineacion.
- Evaluacion comparativa de tecnicas de cuantizacion: interesante para estudiar el impacto de partir de bnb-4bit en la calidad final, si se publican pesos y evaluaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision, ya que no se publican pesos ni cuantizaciones. Como referencia, un modelo de 7B en fp16 requiere aproximadamente 14-16 GB de VRAM; en 4 bits, alrededor de 4-6 GB.
- GPU recomendadas: no disponible. Para un 7B en fp16 serian adecuadas A100 40GB, H100 o RTX 4090 (24 GB); en 4 bits, RTX 3060 12 GB o superiores.
- Cabe en consumer GPU: probablemente si, en cuantizacion 4 bits, en GPUs con 8 GB o mas, pero no confirmado por el autor.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI serian viables una vez convertidos los pesos, pero no hay pesos publicados que permitan confirmarlo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|
| onocloud/onoai-basalt-2.5-pro | 7B | no disponible | Apache 2.0 | No publicados (repo 0.0 GB) |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7B | 32 768 tokens | Apache 2.0 | Si, safetensors y GGUF |
| unsloth/Qwen2.5-Coder-7B-Instruct-bnb-4bit | 7B | 32 768 tokens | Apache 2.0 | Si, bnb-4bit |
| Codellama-7B-Instruct | 7B | 16 384 tokens | Llama 2 custom | Si, safetensors y GGUF |

## Limitaciones y advertencias

- El repositorio no contiene pesos publicados (tamano 0.0 GB), por lo que el modelo no es utilizable tal cual.
- No se documenta el dataset de ajuste fino, lo que impide evaluar sesgos introducidos por el entrenamiento.
- Riesgo de alucinacion inherente a modelos de 7B ajustados con datos no documentados.
- Idioma declarado: solo ingles, lo que limita su uso en castellano u otros idiomas.
- Longitud de contexto efectiva no confirmada en este ajuste.
- No hay benchmarks ni evaluaciones publicadas, por lo que no se puede verificar la calidad frente al modelo base.
- La licencia Apache 2.0 permite uso comercial, pero la falta de pesos y de documentacion hace arriesgado desplegarlo en produccion.
- Al partir de una version bnb-4bit, puede haber perdida de calidad respecto al modelo original en fp16.

## Enlaces

- Hugging Face: https://huggingface.co/onocloud/onoai-basalt-2.5-pro
- Modelo base (Unsloth, bnb-4bit): https://huggingface.co/unsloth/Qwen2.5-Coder-7B-Instruct-bnb-4bit
- Modelo original Qwen2.5-Coder-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL: https://github.com/huggingface/trl
