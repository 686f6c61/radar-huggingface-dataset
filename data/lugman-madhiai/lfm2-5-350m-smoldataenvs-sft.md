# lugman-madhiai/LFM2.5-350M-SmolDataEnvs-SFT

## Resumen

LFM2.5-350M-SmolDataEnvs-SFT es un ajuste fino (SFT) del modelo base LiquidAI/LFM2.5-350M, publicado por el usuario lugman-madhiai en HuggingFace. Se trata de un modelo de generacion de texto de pequeno tamano, con 354.483.968 parametros (aproximadamente 354 millones), derivado de la familia LFM2 de Liquid AI. El ajuste se ha realizado utilizando Unsloth y la libreria TRL de HuggingFace, segun indica la model card, lo que sugiere un entrenamiento optimizado en memoria y velocidad.

El modelo hereda la arquitectura LFM2 (Liquid Foundation Model 2) del modelo base, aunque la model card no detalla las caracteristicas especificas de dicha arquitectura. El nombre del repositorio incluye "SmolDataEnvs", lo que sugiere un entrenamiento sobre un conjunto de datos relacionado con entornos o datos sinteticos, aunque no se proporciona informacion adicional sobre la composicion del dataset de ajuste.

Su relevancia radica en ser un ejemplo de ajuste fino de un modelo pequeno (350M) con licencia Apache 2.0, lo que facilita su uso comercial y su despliegue en hardware modesto. No obstante, la informacion publicada es muy limitada: no hay benchmarks, no se detalla el dataset de entrenamiento ni las capacidades especificas adquiridas tras el SFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (hereda del modelo base LiquidAI/LFM2.5-350M; detalles no disponibles) |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del modelo base LiquidAI/LFM2.5-350M, que pertenece a la familia LFM2 de Liquid AI. La model card no proporciona detalles sobre la arquitectura interna del modelo base (tipo de transformer, uso de atencion lineal, SSM o arquitectura hibrida), por lo que no es posible confirmar las innovaciones tecnicas concretas de LFM2 a partir de la informacion disponible.

El entrenamiento se realizo con Unsloth y la libreria TRL de HuggingFace, segun la model card, que indica que el modelo "fue entrenado 2x mas rapido" con Unsloth. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. El nombre del repositorio ("SmolDataEnvs") sugiere un dataset relacionado con entornos, pero no hay confirmacion ni detalles adicionales.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, tag "conversational").
- Ajuste fino supervisado (SFT) sobre el modelo base, orientado presumiblemente a tareas especificas del dataset "SmolDataEnvs" (no detalladas).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo se declara ingles (en).
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Generacion de texto en ingles para prototipos: al ser un modelo de 354M parametros, puede ejecutarse en CPU o GPU de gama baja para tareas de generacion de texto simple en fase de desarrollo.
- Clasificacion y etiquetado de texto: el modelo puede ajustarse o usarse para tareas de clasificacion en ingles, aunque no se especifica si el SFT lo orienta a ello.
- Experimentacion con ajuste fino: sirve como punto de partida para desarrolladores que quieran replicar el pipeline de Unsloth + TRL en modelos pequenos.
- Despliegue en entornos con recursos limitados: su tamano reducido (0.7 GB en safetensors) permite ejecutarlo en dispositivos con poca memoria.
- Generacion de respuestas conversacionales simples: el tag "conversational" sugiere uso en chatbots basicos en ingles.
- Investigacion sobre SFT en modelos pequenos: util para estudiar el efecto del ajuste fino en modelos de 350M con datasets especificos.
- Educacion y demos: adecuado para demostraciones de inferencia con transformers o text-generation-inference en entornos docentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener 354M parametros, en fp16 requiere aproximadamente 0.7 GB de pesos; en fp32, unos 1.4 GB. La VRAM total depende del contexto y del framework, pero es inferior a 2-3 GB en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es mas que suficiente; tambien puede ejecutarse en CPU.
- Cabe en consumer GPU: si, en practicamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag), y potencialmente llama.cpp u Ollama si se generan pesos GGUF (no confirmado).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| LFM2.5-350M-SmolDataEnvs-SFT | 354M | no disponible | Apache 2.0 | en | SFT sobre LFM2.5-350M con Unsloth/TRL |
| LiquidAI/LFM2.5-350M (base) | 350M | no disponible | no disponible en la informacion | no disponible | Modelo base sin ajuste |
| Modelos de ~350M comparables (p. ej., Qwen2.5-0.5B, SmolLM2-360M) | ~350-500M | variable | variable | variable | No se dispone de datos de comparacion en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos; al ser un modelo pequeno entrenado probablemente con datos en ingles, puede reflejar sesgos de dichos datos.
- Riesgo de alucinacion: alto en modelos de este tamano, especialmente sin datos de evaluacion publicados.
- Limitaciones de contexto o idioma: solo se declara ingles; la longitud de contexto no esta disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base LiquidAI/LFM2.5-350M (no confirmada en la informacion).
- Caveats para produccion: no hay benchmarks, no se detalla el dataset de entrenamiento, y el autor es un usuario individual (lugman-madhiai) sin reputacion verificada en la model card. No se recomienda su uso en produccion sin evaluacion adicional.
- El nombre "SmolDataEnvs" sugiere un dataset especifico no documentado, lo que limita la predictibilidad del comportamiento del modelo.

## Enlaces

- HuggingFace: https://huggingface.co/lugman-madhiai/LFM2.5-350M-SmolDataEnvs-SFT
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Unsloth: https://github.com/unslothai/unsloth
- TRL (HuggingFace): https://github.com/huggingface/trl
