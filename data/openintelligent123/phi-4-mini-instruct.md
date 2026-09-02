# Openintelligent123/Phi-4-mini-instruct

## Resumen

Phi-4-mini-instruct es un modelo de lenguaje ligero de 3,8 mil millones de parámetros desarrollado por Microsoft, aunque esta versión concreta está publicada por el usuario Openintelligent123 en Hugging Face. Pertenece a la familia Phi-4 y está diseñado para entornos con restricciones de memoria y latencia, ofreciendo un equilibrio entre rendimiento y eficiencia. El modelo se entrenó sobre una combinación de datos sintéticos y sitios web públicos filtrados, con especial énfasis en datos densos en razonamiento, y se refinó mediante supervisión (SFT) y optimización por preferencias directas (DPO). Soporta una ventana de contexto de 128.000 tokens y cubre un amplio espectro de idiomas, lo que lo hace adecuado para aplicaciones multilingües. Su licencia MIT permite uso comercial y de investigación sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Phi) |
| Parametros totales | 3.836.021.760 (3,8 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | No especificados (pesos en safetensors, cuantizables con herramientas externas) |
| Idiomas soportados | Multilingue: arabe, chino, checo, danes, neerlandes, ingles, finlandes, frances, aleman, hebreo, hungaro, italiano, japones, coreano, noruego, polaco, portugues, ruso, espanol, sueco, tailandes, turco, ucraniano |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only, similar a la de otros modelos de la familia Phi, aunque la informacion disponible no detalla aspectos como el numero de capas o cabezas de atencion. El entrenamiento se realizo sobre una mezcla de datos sinteticos y sitios web publicos filtrados, priorizando contenido de alta calidad y denso en razonamiento. El proceso de post-entrenamiento incluyo supervision (SFT) y optimizacion por preferencias directas (DPO), lo que mejora la adherencia a instrucciones y la seguridad. El modelo soporta function calling, segun se menciona en las notas de la version. El informe tecnico (arXiv:2503.01743) proporciona detalles adicionales, aunque no estan incluidos en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento, especialmente en matematicas y logica.
- Soporte de function calling / tool calling, lo que permite integrarlo en flujos de agentes.
- Ventana de contexto de 128.000 tokens, adecuada para documentos largos y conversaciones multi-turno.
- Multilingue: cubre mas de 20 idiomas, incluyendo espanol, ingles, frances, aleman, chino, japones, etc.
- Optimizado para entornos con restricciones de memoria y latencia, gracias a su tamano compacto.
- No incluye capacidades multimodales (vision, audio) en esta version.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multilingues de varios turnos gracias a su ventana de 128K tokens, manteniendo el contexto de la interaccion y respondiendo con precision.
- Generacion de codigo en produccion: con soporte de function calling, puede integrarse en pipelines de CI/CD para autocompletar codigo, generar documentacion o revisar cambios, reduciendo la carga de los desarrolladores.
- Analisis de documentos legales o financieros: su contexto largo permite procesar contratos o informes extensos, extrayendo informacion relevante y resumiendo clausulas.
- Asistentes virtuales para dispositivos con recursos limitados: al ser un modelo de 3,8B, puede ejecutarse en hardware modesto, como portatiles o dispositivos edge, ofreciendo respuestas razonadas sin depender de la nube.
- Tutoria educativa: su capacidad de razonamiento matematico y logico lo hace util para explicar conceptos, resolver problemas paso a paso y adaptar el nivel de dificultad al estudiante.
- Traduccion y localizacion: al soportar multiples idiomas, puede utilizarse para traducir contenido manteniendo el tono y el contexto, aunque su rendimiento puede variar entre idiomas.
- Busqueda y extraccion de informacion en bases de conocimiento: con tool calling, puede consultar APIs o bases de datos y sintetizar respuestas, facilitando la creacion de asistentes de investigacion.

## Benchmarks y rendimiento

La model card del autor incluye una tabla comparativa con varios modelos de tamano similar y el doble de tamano. Los datos disponibles son los siguientes:

| Benchmark | Phi-4-mini-Ins | Phi-3.5-mini-Ins | Llama-3.2-3B-Ins | Mistral-3B | Qwen2.5-3B-Ins | Qwen2.5-7B-Ins | Mistral-8B-2410 | Llama-3.1-8B-Ins | Llama-3.1-Tulu-3-8B | Gemma2-9B-Ins | GPT-4o-mini-2024-07-18 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Arena Hard | 32,8 | 34,4 | 17,0 | 26,9 | 32,0 | 55,5 | 37,3 | 25,7 | 42,7 | 43,7 | 53,7 |
| BigBench Hard (0-shot, CoT) | 70,4 | 63,1 | 55,4 | 51,2 | 56,2 | 72,4 | 53,3 | 63,4 | 55,5 | 65,7 | 80,4 |
| MMLU (5-shot) | 67,3 | 65,5 | 61,8 | 60,8 | 65,0 | 72,6 | 63,0 | 68,1 | 65,0 | 71,3 | 77,2 |
| MMLU-Pro (0-shot, CoT) | 52,8 | 47,4 | 39,2 | 35,3 | 44,7 | 56,2 | 36,6 | 44,0 | 40,9 | 50,1 | 62,8 |

Estos datos provienen de la model card del autor y no se han verificado de forma independiente. No se dispone de resultados adicionales en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, aproximadamente 7,7 GB (3,8B parametros × 2 bytes). Con cuantizacion a 4 bits, alrededor de 2 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (por ejemplo, RTX 3060, RTX 4060, A10). Para cuantizacion 4 bits, GPUs con 4 GB o mas (RTX 3050, GTX 1660, etc.).
- Es viable en GPUs de consumo, especialmente con cuantizacion.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, entre otros. Al ser un modelo estandar de transformers, es compatible con la mayoria de frameworks.
- Latencia y throughput: no se proporcionan datos especificos, pero al ser un modelo de 3,8B, se espera una latencia baja en GPUs modernas, con throughput del orden de cientos de tokens por segundo en hardware de gama alta.

## Comparativa con modelos similares

Comparacion con otros modelos de tamano similar (3-4B) y algunos de 7-9B:

| Modelo | Parametros | Contexto | Licencia | MMLU (5-shot) | Arena Hard |
|---|---|---|---|---|---|
| Phi-4-mini-instruct | 3,8B | 128K | MIT | 67,3 | 32,8 |
| Phi-3.5-mini-instruct | 3,8B | 128K | MIT | 65,5 | 34,4 |
| Llama-3.2-3B-instruct | 3,2B | 128K | Llama 3.2 Community | 61,8 | 17,0 |
| Mistral-3B | 3B | 32K | Apache 2.0 | 60,8 | 26,9 |
| Qwen2.5-3B-instruct | 3B | 32K | Apache 2.0 | 65,0 | 32,0 |
| Qwen2.5-7B-instruct | 7,6B | 128K | Apache 2.0 | 72,6 | 55,5 |

Phi-4-mini-instruct supera a la mayoria de modelos de su tamano en MMLU y MMLU-Pro, aunque en Arena Hard queda por detras de Phi-3.5-mini. Frente a modelos de 7-8B, su rendimiento es inferior, pero su menor tamano lo hace mas eficiente.

## Limitaciones y advertencias

- El modelo no ha sido evaluado para todos los usos posibles; los desarrolladores deben validar su rendimiento en el caso de uso concreto.
- Puede presentar sesgos presentes en los datos de entrenamiento, aunque se aplicaron tecnicas de alineacion (SFT y DPO) para mitigarlos.
- Riesgo de alucinacion, especialmente en tareas de generacion libre o cuando se le pide informacion factual.
- El rendimiento varia entre idiomas; los idiomas con menos representacion pueden mostrar peores resultados.
- Aunque la licencia MIT permite uso comercial, es responsabilidad del desarrollador cumplir con las leyes aplicables (privacidad, comercio, etc.).
- No se han publicado resultados de benchmarks independientes para esta version especifica (Openintelligent123), aunque se espera que sea identica al modelo original de Microsoft.

## Enlaces

- Modelo en Hugging Face (version de Openintelligent123): https://huggingface.co/Openintelligent123/Phi-4-mini-instruct
- Modelo original de Microsoft: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Informe tecnico (arXiv): https://huggingface.co/papers/2503.01743
- Blog de Microsoft: https://aka.ms/phi4-feb2025
- Phi Cookbook: https://github.com/microsoft/PhiCookBook
- Portal Phi: https://azure.microsoft.com/en-us/products/phi
- Demo en Hugging Face: https://huggingface.co/spaces/microsoft/phi-4-mini

Nota: la version de Openintelligent123 parece ser una copia del modelo original de Microsoft, con la misma model card y licencia. Se recomienda usar la version oficial para mayor confianza.
