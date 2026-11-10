# Alexs28/DeepSeek-V3

## Resumen

DeepSeek-V3 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por DeepSeek AI, con 671.000 millones de parametros totales y 37.000 millones activados por token. Se construye sobre la arquitectura validada en DeepSeek-V2, incorporando Multi-head Latent Attention (MLA) y DeepSeekMoE, y anade innovaciones como una estrategia de balanceo de carga sin perdida auxiliar y un objetivo de entrenamiento de prediccion multi-token (MTP). El modelo fue preentrenado sobre 14,8 billones de tokens y posteriormente sometido a ajuste supervisado y aprendizaje por refuerzo.

La relevancia de DeepSeek-V3 radica en su eficiencia de entrenamiento: completo su preentrenamiento con 2,664 millones de horas de GPU H800, un coste notablemente bajo para su escala, gracias a un marco de entrenamiento en precision mixta FP8 validado por primera vez a esta magnitud. Ademas, incorpora destilacion de capacidades de razonamiento desde la serie DeepSeek-R1, integrando patrones de verificacion y reflexion en un modelo estandar.

El repositorio identificado como `Alexs28/DeepSeek-V3` es una publicacion de terceros (usuario Alexs28) que redistribuye los pesos del modelo original de DeepSeek AI. No es el repositorio oficial. El tamano del repositorio es de 688,6 GB y los pesos estan en formato safetensors y FP8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con Multi-head Latent Attention (MLA) y DeepSeekMoE |
| Parametros totales | 684.489.845.504 (segun safetensors); 671B declarados en la model card |
| Parametros activos | 37B por token |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | FP8 (entrenamiento e inferencia); no se detallan otras cuantizaciones en la informacion disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repositorio; la model card original referencia Model Agreement y MIT para el codigo |
| Formato de pesos | safetensors, FP8 |

## Arquitectura y entrenamiento

DeepSeek-V3 emplea una arquitectura Transformer con Mixture-of-Experts. Cada token activa 37.000 millones de parametros de un total de 671.000 millones. La atencion utiliza Multi-head Latent Attention (MLA), que comprime las claves y valores en un espacio latente para reducir el coste de memoria del KV cache durante la inferencia. El componente DeepSeekMoE enruta tokens a expertos especializados y utiliza una estrategia de balanceo de carga sin perdida auxiliar, que evita la degradacion de rendimiento asociada a las perdidas auxiliares tradicionales. Ademas, se introduce un objetivo de prediccion multi-token (MTP), que mejora el rendimiento del modelo y puede aprovecharse para decodificacion especulativa.

El preentrenamiento se realizo sobre 14,8 billones de tokens con un marco de precision mixta FP8, el primero validado a esta escala. El coste total de entrenamiento fue de 2,788 millones de horas de GPU H800 (2,664 millones para el preentrenamiento y 0,1 millones para las etapas posteriores). Tras el preentrenamiento, el modelo paso por ajuste supervisado (SFT) y aprendizaje por refuerzo (RL). En la fase de post-entrenamiento se destilaron capacidades de razonamiento de un modelo de la serie DeepSeek-R1, incorporando patrones de verificacion y reflexion, manteniendo control sobre el estilo y la longitud de las salidas.

## Capacidades

- Generacion de texto conversacional y no conversacional.
- Razonamiento de cadena de pensamiento (CoT) destilado desde DeepSeek-R1, con patrones de verificacion y reflexion.
- Generacion de codigo y matematicas (capacidades implicitas en un modelo de esta escala, aunque no se detallan evaluaciones especificas en la informacion disponible).
- Prediccion multi-token (MTP) que puede emplearse para decodificacion especulativa y aceleracion de inferencia.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de codigo en produccion: el modelo puede integrarse en pipelines de generacion y revision de codigo; su naturaleza MoE con 37B parametros activos permite un throughput relativamente alto en inferencia, adecuado para entornos de CI/CD con volumen elevado.
- Razonamiento matematico y resolucion de problemas: la destilacion de capacidades de razonamiento desde DeepSeek-R1 lo hace adecuado para tareas que requieren cadenas de pensamiento largas, como analisis cuantitativo o verificacion de calculos.
- Asistentes conversacionales de dominio general: el modelo esta disenado para generacion de texto conversacional y puede gestionar dialogos multi-turno; la longitud de contexto debe consultarse en la documentacion oficial, ya que no esta disponible en este repositorio.
- Destilacion y generacion de datos sinteticos: un modelo de 671B parametros puede emplearse para generar datos de entrenamiento o evaluacion de alta calidad para modelos mas pequenos.
- Investigacion en arquitecturas MoE: la implementacion de MLA, el balanceo sin perdida auxiliar y el objetivo MTP lo convierten en una referencia para estudiar tecnicas de eficiencia en modelos masivos.
- Despliegue en infraestructura de alto rendimiento: con pesos FP8 y 688 GB de repositorio, esta pensado para servidores con multiples GPU de alta gama; puede servir como backend de APIs de generacion de texto a gran escala.
- Evaluacion comparativa de modelos abiertos: sirve como linea base de referencia para comparar modelos abiertos de gran escala en tareas de razonamiento y generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card original menciona una figura de benchmarks (`figures/benchmark.png`) y afirma que el modelo supera a otros modelos abiertos y alcanza un rendimiento comparable a los principales modelos cerrados, pero no se proporcionan cifras numericas en el material disponible. No se inventan numeros.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP8 ocupan aproximadamente 688 GB; se necesita un total de memoria agregada de al menos esa cifra, mas el overhead de activaciones y KV cache.
- GPU recomendadas: el entrenamiento se realizo en H800; para inferencia se requieren configuraciones multi-GPU de alta gama (H100, H800, A100 80GB en numero suficiente para sumar la memoria necesaria).
- Cabe en consumer GPU: no. Un modelo de 671B parametros en FP8 no cabe en ninguna GPU de consumo individual (RTX 4090 tiene 24 GB).
- Opciones de despliegue: la model card referencia text-generation-inference y endpoints compatibles; tambien es desplegable con vLLM y frameworks que soporten la arquitectura `deepseek_v3`. No se detallan opciones de llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V3 | 671B | 37B | no disponible | no disponible (original: Model Agreement) | Hugging Face (repo de terceros) |
| DeepSeek-V2 | no disponible en la informacion | no disponible | no disponible | no disponible | Hugging Face |
| DeepSeek-R1 | no disponible en la informacion | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos suficientes en la informacion proporcionada para comparar parametros, contexto, rendimiento y licencia con alternativas de forma rigurosa. La comparativa se limita a los modelos de la misma familia mencionados en la model card.

## Limitaciones y advertencias

- El repositorio `Alexs28/DeepSeek-V3` es una publicacion de terceros, no el repositorio oficial de DeepSeek AI; no hay garantia de integridad, actualizacion ni soporte.
- La licencia no esta disponible en este repositorio; el uso comercial debe verificarse contra la licencia original del modelo (Model Agreement de DeepSeek), no contra este repo.
- Riesgo de alucinacion inherente a los modelos de lenguaje de gran escala; no se documentan mitigaciones especificas en la informacion disponible.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Limitaciones de contexto e idioma: no disponible; la longitud de contexto no figura en el material proporcionado.
- El modelo requiere infraestructura multi-GPU de alta gama; no es viable en hardware de consumo.
- Los pesos en FP8 pueden requerir frameworks y versiones especificas de transformers con soporte para `deepseek_v3` y `custom_code`; la compatibilidad con herramientas de cuantizacion adicionales no esta documentada.
- Al ser un modelo destilado de R1, puede presentar patrones de razonamiento extensos que afecten a la latencia y al coste de tokens de salida si no se controla la longitud.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Alexs28/DeepSeek-V3
- Paper de DeepSeek-V3: https://github.com/deepseek-ai/DeepSeek-V3/blob/main/DeepSeek_V3.pdf
- Repositorio oficial en GitHub: https://github.com/deepseek-ai/DeepSeek-V3
- Pagina oficial de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Organizacion DeepSeek AI en Hugging Face: https://huggingface.co/deepseek-ai
- Licencia de codigo (MIT): https://github.com/deepseek-ai/DeepSeek-V3/blob/main/LICENSE-CODE
- Licencia del modelo (Model Agreement): https://github.com/deepseek-ai/DeepSeek-V3/blob/main/LICENSE-MODEL
- Discord de DeepSeek AI: https://discord.gg/Tc7c45Zzu5
- Twitter de DeepSeek AI: https://twitter.com/deepseek_ai
