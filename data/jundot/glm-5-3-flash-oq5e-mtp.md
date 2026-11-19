# Jundot/GLM-5.3-Flash-oQ5e-mtp

## Resumen

GLM-5.3-Flash-oQ5e-mtp es una cuantizacion mixta en formato MLX del modelo zai-org/GLM-5.3-Flash, un modelo de mezcla de expertos (MoE) nativamente multimodal desarrollado por Z.ai (Zhipu AI). El checkpoint original combina 320B parametros totales con 18B parametros activos por token, e integra atencion dispersa y lineal junto con Manifold-Constrained Hyper-Connections (mHC). Esta version cuantizada, publicada por el usuario Jundot, preserva el modelo de lenguaje, el codificador de vision y la cabeza de prediccion multi-token (MTP) del original.

La relevancia de esta ficha radica en que permite ejecutar un modelo MoE de 320B en hardware Apple Silicon mediante MLX, algo inviable con los pesos en BF16 (que ocuparian aproximadamente 640 GB). La cuantizacion oQ5e emplea precision mixta guiada por la sensibilidad medida de cada capa, con un promedio efectivo de 5,611 bits por peso y un tamano total de 209,882 GiB.

El modelo resuelve tareas de generacion de texto, razonamiento, codigo y comprension de imagenes en un unico checkpoint, y su licencia MIT facilita el uso comercial. La cabeza MTP habilita decodificacion especulativa, lo que puede mejorar el throughput en inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con atencion dispersa y lineal, Manifold-Constrained Hyper-Connections (mHC) y cabeza de prediccion multi-token (MTP) |
| Parametros totales | 321.323.031.390 (321,3B) |
| Parametros activos | 18B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ5e (precision mixta: affine 5-bit grupo 64, affine 8-bit grupo 64, BF16 y FP32); promedio efectivo 5,611 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un transformer de mezcla de expertos con 320B parametros totales y 18B activos, que combina mecanismos de atencion dispersa y lineal para reducir el coste computacional en contextos largos. Incorpora Manifold-Constrained Hyper-Connections (mHC), una innovacion arquitectonica que restringe las conexiones residuales a una variedad manifold para estabilizar el entrenamiento en profundidad. El checkpoint incluye un codificador de vision de 0,564B parametros, lo que lo convierte en un modelo nativamente multimodal (image-text-to-text), y una cabeza MTP de 7,433B parametros que permite decodificacion especulativa multi-token.

Esta version concreta no ha sido reentrenada: es una cuantizacion del checkpoint original de Z.ai. El proceso oQ5e, implementado en oMLX 0.8.0, asigna bits segun la sensibilidad medida de cada capa y redondea cada grupo con una matriz de importancia (128 muestras x 512 tokens) y un reajuste ponderado por minimos cuadrados de escala y sesgo. El resultado: el 96,991% de los pesos logicos (311,654B) se almacenan en affine 5-bit, el 2,793% (8,976B) en affine 8-bit, el 0,189% (0,607B) en BF16 y el 0,027% (0,086B) en FP32. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento multi-turno en conversaciones.
- Comprension de imagenes y texto combinados (pipeline image-text-to-text): el codificador de vision integrado permite responder preguntas sobre imagenes.
- Generacion de codigo y matematicas (capacidad inferida del modelo base GLM-5.3-Flash; no se detalla en la model card).
- Decodificacion especulativa mediante la cabeza MTP, que predice varios tokens por paso para acelerar la inferencia.
- Capacidades multilingues: no disponible (no se especifican idiomas).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente multimodal en local para Apple Silicon: el checkpoint MLX permite ejecutar un modelo de 320B con vision en un Mac con memoria unificada suficiente (a partir de 256 GB), sin depender de la nube, gracias a los 209,882 GiB de pesos cuantizados.
- Analisis de documentos con imagenes: el codificador de vision integrado permite extraer informacion de capturas, diagramas o formularios combinados con texto en una sola pasada.
- Generacion de codigo asistida: la naturaleza MoE con 18B parametros activos reduce el coste por token frente a un modelo denso de 320B, lo que lo hace adecuado para autocompletado y refactorizacion en entornos de desarrollo locales.
- Investigacion sobre cuantizacion: el checkpoint sirve como referencia para estudiar el impacto de la precision mixta oQ5e (5,611 bits/peso) frente al modelo original en BF16, con la cabeza MTP incluida para medir la aceleracion especulativa.
- Prototipado de agentes multimodales: la combinacion de vision, texto y MTP permite construir pipelines de razonamiento multi-paso en los que el modelo alterna entre observar imagenes y generar acciones.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia MIT del checkpoint y del modelo base facilita la integracion en productos comerciales sin las restricciones de licencias copyleft o de uso limitado.
- Evaluacion comparativa de decodificacion especulativa: la cabeza MTP de 7,433B parametros permite medir la ganancia de throughput frente a decodificacion autoregresiva estandar en MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 209,882 GiB (225,359 GB) solo para los pesos; se necesita memoria adicional para el KV cache y las activaciones.
- El modelo no cabe en GPUs de consumo convencionales (RTX 4090 con 24 GB, RTX 5090 con 32 GB) ni en A100 de 80 GB ni H100 de 80 GB en una sola unidad.
- Hardware recomendado: Mac con Apple Silicon y memoria unificada de al menos 256 GB (por ejemplo, Mac Studio M3 Ultra con 256 GB o 512 GB), dado que el formato es MLX y la libreria es mlx.
- Opciones de despliegue: MLX (libreria declarada) y oMLX (herramienta de cuantizacion del autor); no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI para este checkpoint concreto.
- Latencia y throughput: no disponibles. La cabeza MTP sugiere mejora mediante decodificacion especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-oQ5e-mtp (este) | 321,3B / 18B | no disponible | MLX safetensors, 5,611 bits/peso | MIT | Hugging Face, 745 descargas |
| zai-org/GLM-5.3-Flash (base) | 320B / 18B | no disponible | BF16 safetensors | MIT | Hugging Face (modelo original de Z.ai) |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables de 300B+ con vision y licencia MIT en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 5,611 bits/peso introduce una perdida de precision respecto al modelo base en BF16; el autor indica que la version actual (2026-11-19) reduce el error frente a copias anteriores, por lo que versiones previas deben descartarse.
- El checkpoint esta disenado exclusivamente para MLX, lo que limita su uso a hardware Apple Silicon; no es portable a CUDA sin conversion adicional.
- Requiere memoria unificada de al menos 256 GB, lo que excluye la mayoria de equipos de consumo.
- No se especifican los idiomas soportados; el rendimiento en castellano no esta documentado.
- No hay datos publicados de benchmarks, sesgos ni tasas de alucinacion para este checkpoint ni para el modelo base en la informacion disponible.
- La licencia MIT es permisiva para uso comercial, pero se recomienda verificar el archivo LICENSE incluido y las condiciones del modelo base zai-org/GLM-5.3-Flash.
- El modelo tiene solo 1 like y 745 descargas, por lo que la validacion comunitaria es muy limitada.
- La cabeza MTP y el codificador de vision anaden complejidad al despliegue; no se documenta como desactivarlos si no se necesitan.

## Enlaces

- Hugging Face del checkpoint: https://huggingface.co/Jundot/GLM-5.3-Flash-oQ5e-mtp
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Repositorio oMLX: https://github.com/jundot/omlx
- PR de mejora oQe: https://github.com/jundot/omlx/pull/4930
- PR de refinamiento del redondeo oQe: https://github.com/jundot/omlx/pull/5292
