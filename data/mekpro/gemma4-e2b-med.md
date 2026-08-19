# mekpro/gemma4-e2b-med

## Resumen

El modelo `mekpro/gemma4-e2b-med` es un ajuste fino (finetune) del modelo base `unsloth/gemma-4-E2B`, desarrollado por el usuario mekpro y publicado en HuggingFace con licencia Apache 2.0. El nombre "med" sugiere una especialización en el dominio médico, aunque la model card no proporciona detalles sobre el dataset de entrenamiento. El modelo está diseñado para generación de texto y, según la etiqueta de HuggingFace, se clasifica como `image-text-to-text`, aunque el modelo base Gemma 4 E2B es exclusivamente de texto según la documentación oficial de Google DeepMind.

La arquitectura subyacente corresponde a la familia Gemma 4, concretamente la variante E2B, que incorpora multi-token prediction y un modelo draft para decodificación especulativa, lo que acelera la inferencia sin pérdida de calidad. Según los archivos safetensors, el modelo tiene 5.123.178.051 parámetros (aproximadamente 5,1 mil millones), un valor superior a los 2,1 mil millones que se citan para el Gemma 4 E2B original, lo que sugiere que el autor pudo haber utilizado una variante diferente o que el número de parámetros incluye componentes adicionales. La ventana de contexto se establece en 8K tokens según la documentación de Gemma 4 E2B.

Este modelo resulta relevante para desarrolladores que necesitan un LLM ligero y eficiente, capaz de ejecutarse en dispositivos con recursos limitados como CPUs, y que además puede beneficiarse de la decodificación especulativa para reducir la latencia. Sin embargo, la ausencia de información sobre el finetune y de benchmarks específicos limita su evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E2B) con multi-token prediction y decodificacion especulativa |
| Parametros totales | 5.123.178.051 (segun safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8K tokens (segun documentacion de Gemma 4 E2B) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (etiqueta "en") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `unsloth/gemma-4-E2B` pertenece a la familia Gemma 4 de Google DeepMind. Según la documentacion oficial, todos los modelos Gemma 4 (E2B, E4B, 12B, 31B y 26B A4B) incluyen un modelo draft dedicado para decodificacion especulativa, lo que permite una inferencia significativamente mas rapida sin degradacion de calidad. La arquitectura es un transformer estándar, aunque no se han publicado detalles adicionales sobre atencion o capas especificas en la informacion disponible.

El finetune fue realizado con la libreria Unsloth y HuggingFace TRL, como se indica en la model card. No se especifica el dataset utilizado, el numero de tokens de entrenamiento ni si se aplicaron tecnicas como RLHF o DPO. La etiqueta `image-text-to-text` en HuggingFace sugiere capacidades multimodales, pero el modelo base es text-only, por lo que es probable que se trate de un error de etiquetado o de una extension no documentada. No hay informacion sobre innovaciones tecnicas adicionales en el finetune.

## Capacidades

- Generacion de texto: el modelo puede producir texto coherente en ingles, heredando las capacidades del modelo base Gemma 4 E2B.
- Razonamiento y matematicas: el modelo base es capaz de tareas de razonamiento logico y aritmetico, aunque no se han publicado benchmarks especificos para este finetune.
- Generacion de codigo: se espera que el modelo base tenga cierta capacidad de programacion, pero no hay datos confirmados para esta version.
- Decodificacion especulativa: gracias al modelo draft, la inferencia puede ser mas rapida que en modelos de tamano similar sin esta tecnica.
- Ejecucion en CPU: segun la documentacion de Gemma 4 E2B, el modelo puede ejecutarse completamente en CPU, lo que lo hace apto para entornos sin GPU.
- Soporte de tool calling y agentes: no hay informacion disponible en la documentacion proporcionada.
- Capacidades multimodales: la etiqueta de HuggingFace indica `image-text-to-text`, pero no se ha confirmado si el modelo acepta imagenes como entrada.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno en ingles gracias a su ventana de contexto de 8K tokens, aunque para escenarios complejos se recomendaria verificar su rendimiento con datos reales.
- Generacion de informes medicos preliminares: dado el nombre "med", podria emplearse para redactar resumenes clinicos, pero sin validacion medica profesional y con supervisión humana obligatoria.
- Asistente de escritura en entornos con recursos limitados: al poder ejecutarse en CPU, es util en portatiles o dispositivos edge para redaccion de correos, documentos o resumenes.
- Educacion y tutorizacion: puede servir como generador de explicaciones o preguntas de practica en ingles para estudiantes de medicina, aunque su precision no esta garantizada.
- Prototipado rapido de aplicaciones NLP: su tamano moderado y licencia Apache 2.0 permiten integrarlo en demos o MVPs sin coste de licencia.
- Despliegue en infraestructuras sin GPU: ideal para servidores de bajo coste o entornos de contenedores donde la VRAM es limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval o GSM8K, y no se encontraron evaluaciones externas del finetune `gemma4-e2b-med`. Por tanto, no es posible comparar su rendimiento con otros modelos de forma objetiva.

## Requisitos de hardware

- VRAM estimada para inferencia: con 5,1 mil millones de parametros, en precision fp16 se requieren aproximadamente 10,2 GB de memoria, mas overhead de activaciones. En cuantizacion de 4 bits, la huella se reduce a unos 2,5-3 GB.
- GPU recomendadas: para fp16, una GPU con al menos 12 GB de VRAM (por ejemplo, RTX 3060, RTX 4070, A10). Para cuantizacion 4-bit, GPUs con 6-8 GB (RTX 2060, RTX 3060) pueden ser suficientes.
- Ejecucion en CPU: segun la documentacion de Gemma 4 E2B, es posible ejecutarlo en CPU, aunque la velocidad dependera del hardware; se ha probado en Raspberry Pi 5, aunque con latencia alta.
- Opciones de despliegue: compatible con bibliotecas como transformers, TGI (text-generation-inference), vLLM, llama.cpp y Ollama (si se convierte a GGUF).
- Latencia y throughput: no se han publicado mediciones especificas para este finetune. La decodificacion especulativa deberia mejorar la velocidad respecto a un transformer clasico, pero no hay datos cuantitativos.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa fiable. El modelo base Gemma 4 E2B original (2,1B parametros) es una referencia directa, pero el finetune aqui presentado tiene un numero de parametros significativamente mayor (5,1B), lo que dificulta la comparacion directa. Otros modelos pequenos como Phi-3-mini (3,8B) o Qwen2.5-3B podrian ser alternativas, pero no hay datos de rendimiento de este finetune frente a ellos. Se recomienda consultar benchmarks publicos de Gemma 4 E2B para una referencia aproximada.

## Limitaciones y advertencias

- Idioma limitado: solo se ha etiquetado el ingles; no hay garantia de buen rendimiento en otros idiomas.
- Sesgos potenciales: si el finetune se realizo con datos medicos, podria heredar sesgos de esos datos, lo que es especialmente critico en aplicaciones clinicas.
- Riesgo de alucinacion: como todo LLM, puede generar informacion falsa o inexacta, especialmente en dominios especializados como la medicina.
- Contexto corto: la ventana de 8K tokens puede ser insuficiente para documentos largos o conversaciones extensas.
- Discrepancia en parametros: el numero de parametros reportado (5,1B) no coincide con el del modelo base Gemma 4 E2B (2,1B), lo que sugiere que el autor pudo haber utilizado una variante no estandar o que el archivo safetensors incluye pesos adicionales.
- Sin validacion medica: a pesar del nombre "med", no hay evidencia de que el modelo haya sido evaluado por profesionales de la salud, por lo que no debe usarse en diagnostico o tratamiento sin supervision humana.
- Etiqueta multimodal dudosa: la clasificacion `image-text-to-text` no esta respaldada por la documentacion del modelo base, por lo que es probable que el modelo no acepte imagenes reales.

## Enlaces

- [HuggingFace - mekpro/gemma4-e2b-med](https://huggingface.co/mekpro/gemma4-e2b-med)
- [Gemma 4 - Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Gemma 4 model card - Google AI for Developers](https://ai.google.dev/gemma/docs/core/model_card_4)
- [Gemma 4 E2B — Ultra-Lightweight Local AI](https://gemma4.dev/models/gemma-4-e2b)
- [Gemma 4 E2B Model: Complete Setup & Performance Guide 2026](https://www.gemma4.wiki/models/gemma-4-e2b-model)
- [Gemma 4 model overview - Google AI for Developers](https://ai.google.dev/gemma/docs/core)
- [Unsloth - GitHub](https://github.com/unslothai/unsloth)
