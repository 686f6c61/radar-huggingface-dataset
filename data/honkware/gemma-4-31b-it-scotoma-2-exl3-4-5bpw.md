# Honkware/gemma-4-31B-it-scotoma-2-exl3-4.5bpw

## Resumen

Este repositorio contiene una cuantización en formato EXL3 a 4.5 bits por peso del modelo `ReadyArt/gemma-4-31B-it-scotoma-2`, realizada por el usuario Honkware. El modelo base es un LLM denso de 31B parámetros orientado a conversación, con licencia Apache 2.0, aunque no se dispone de documentación pública detallada sobre su arquitectura o entrenamiento.

La cuantización reduce el peso total a 21.9 GB, lo que permite ejecutar el modelo en GPUs con 24 GB de VRAM o menos, utilizando el motor de inferencia ExLlamaV3. Es una opción práctica para despliegue local de un modelo de 31B con calidad razonable, siempre que se acepte la pérdida de precisión asociada a 4.5 bpw.

El repositorio incluye únicamente los pesos cuantizados y la configuración de cuantización; no se proporcionan datos sobre el modelo base más allá del nombre y la licencia. Por tanto, muchas especificaciones técnicas (contexto, idiomas, benchmarks) no están disponibles en esta fuente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere transformer denso por el nombre "Gemma4 31B") |
| Parametros totales | 31B (modelo base, según nombre); 10.933.407.340 en el archivo safetensors cuantizado |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 4.5 bpw (head bits 8, codebook mul1, out-scales always, parallel mode enabled) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (hereda del modelo base) |
| Formato de pesos | EXL3 (safetensors con metadatos de cuantización) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base `ReadyArt/gemma-4-31B-it-scotoma-2`. El nombre sugiere una variante de la familia Gemma de Google con 31B parámetros, pero no hay documentación oficial que lo confirme. Tampoco se conocen los datos de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO.

La cuantización fue realizada con la herramienta BlockQuant, utilizando el formato EXL3 de ExLlamaV3. La configuración incluye 4.5 bits por peso, 8 bits para la cabeza (head bits), 250 filas de calibración y un codebook de tipo `mul1`. Este codebook requiere ExLlamaV3 v0.0.3 o superior; versiones anteriores decodificarían los pesos incorrectamente.

## Capacidades

- Generación de texto conversacional (según los tags del repositorio).
- Inferencia local mediante ExLlamaV3, TabbyAPI o text-generation-webui.
- Compatibilidad con servidores HTTP compatibles con OpenAI a través de TabbyAPI.

No se dispone de información sobre capacidades específicas como tool calling, razonamiento multi-paso, soporte multilingüe o modos de pensamiento. Estas dependen del modelo base, cuyas características no están documentadas en este repositorio.

## Casos de uso

- Despliegue local de un LLM de 31B en una GPU de consumo: con 21.9 GB de pesos, el modelo puede ejecutarse en una RTX 3090 o RTX 4090 (24 GB VRAM) usando ExLlamaV3 o TabbyAPI, ofreciendo una alternativa a APIs comerciales.
- Servidor de chat privado: mediante TabbyAPI se puede montar un endpoint compatible con OpenAI para integrarlo en aplicaciones propias sin depender de servicios externos.
- Experimentación con cuantización EXL3: el repositorio sirve como ejemplo de cuantización a 4.5 bpw con codebook `mul1`, útil para quienes evalúan el impacto de diferentes niveles de compresión.
- Desarrollo de prototipos conversacionales: al ser un modelo de 31B, puede generar respuestas coherentes en tareas de diálogo, aunque sin datos de rendimiento no se puede garantizar su calidad.
- Evaluación de la pérdida de precisión: comparar este modelo con versiones a mayor bpw (si existen en la colección de Honkware) permite medir el trade-off entre tamaño y calidad.
- Uso educativo: para aprender a cargar y servir modelos cuantizados con ExLlamaV3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni otras pruebas estándar para este modelo cuantizado ni para su modelo base.

## Requisitos de hardware

- VRAM estimada: al menos 22 GB para cargar los 21.9 GB de pesos en memoria (más overhead de activaciones). Una GPU con 24 GB es suficiente.
- GPUs recomendadas: RTX 3090, RTX 4090, A100 40GB, o cualquier GPU con 24 GB o más de VRAM.
- En consumer GPU: sí, cabe en las RTX de gama alta con 24 GB.
- Opciones de despliegue: ExLlamaV3 (API Python), TabbyAPI (servidor HTTP compatible con OpenAI), text-generation-webui (interfaz gráfica).
- Latencia y throughput: no disponibles; dependen de la GPU y de la configuración de ExLlamaV3.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables de la misma categoría (31B, cuantizados a 4.5 bpw en EXL3) con información pública suficiente para establecer una comparación. El modelo base tampoco tiene documentación que permita situarlo frente a alternativas como Llama 3 30B o Mistral 7B.

## Limitaciones y advertencias

- La licencia Apache 2.0 se hereda del modelo base, pero se recomienda revisar los términos del repositorio original `ReadyArt/gemma-4-31B-it-scotoma-2` antes de uso comercial.
- Requiere ExLlamaV3 v0.0.3 o superior; usar versiones anteriores decodificará los pesos con un codebook incorrecto.
- La cuantización a 4.5 bpw introduce pérdida de calidad respecto al modelo original en coma flotante; el impacto no está cuantificado.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones de idioma del modelo base.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido ampliamente probado por la comunidad.
- La fecha de creación (2026-08-16) es posterior a la fecha actual, lo que podría indicar un error en los metadatos o un modelo publicado en el futuro (imposible); se recomienda verificar la autenticidad del repositorio.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/Honkware/gemma-4-31B-it-scotoma-2-exl3-4.5bpw
- Modelo base: https://huggingface.co/ReadyArt/gemma-4-31B-it-scotoma-2
- Colección de cuantizaciones de Honkware: https://huggingface.co/collections/Honkware/gemma-4-31b-it-scotoma-2-exl3-6a823003c900a8baba78fdcf
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- TabbyAPI: https://github.com/theroyallab/tabbyAPI
- text-generation-webui: https://github.com/oobabooga/text-generation-webui
- BlockQuant (herramienta de cuantización): https://github.com/Honkware/blockquant
