# radbile2022/legal-chatbot-qwen25-1p5b-lora

## Resumen

`radbile2022/legal-chatbot-qwen25-1p5b-lora` es un ajuste fino (fine-tuning) del modelo Qwen2.5-1.5B-Instruct, desarrollado por el usuario radbile2022 y publicado en HuggingFace bajo licencia Apache 2.0. Se trata de un modelo conversacional orientado, segun su nombre, a tareas de dominio legal, aunque la model card no documenta el corpus de entrenamiento ni el procedimiento concreto de ajuste. El modelo base es la version cuantizada a 4 bits de Qwen2.5-1.5B-Instruct preparada por Unsloth, y el entrenamiento se realizo con la libreria Unsloth junto con TRL de HuggingFace.

Con 1.543.714.304 parametros (aproximadamente 1,5 mil millones) y un tamano de repositorio de 3,1 GB, se posiciona como un modelo pequeno pensado para despliegue en hardware modesto, incluida GPU de consumo. La relevancia practica de esta ficha es limitada: se trata de una publicacion de bajo perfil (62 descargas, 0 likes en el momento de la consulta) y con documentacion tecnica muy escasa, por lo que debe evaluarse con cautela antes de cualquier uso en produccion.

La informacion disponible no permite confirmar la calidad del ajuste ni el alcance real del dominio legal cubierto. Los datos que se presentan a continuacion proceden de los metadatos del repositorio y de la model card, y cualquier dato no documentado se marca explicitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino sobre Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta hasta 32.768 tokens; no confirmado para este ajuste) |
| Tipos de cuantizacion | no disponible (el modelo base de partida esta en bnb-4bit; el repositorio publica pesos safetensors) |
| Idiomas soportados | en (segun metadatos del repositorio) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer decoder-only Qwen2.5-1.5B-Instruct, un modelo denso de aproximadamente 1,5 mil millones de parametros. El entrenamiento se realizo partiendo de la version cuantizada a 4 bits en formato bitsandbytes (`unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit`) y utilizando la libreria Unsloth, que segun la model card permite un entrenamiento "2x mas rapido", junto con TRL de HuggingFace. El nombre del repositorio incluye el sufijo `lora`, lo que sugiere el uso de Low-Rank Adaptation, aunque la model card no detalla la configuracion del adaptador (rango, alpha, modulos objetivo) ni si los pesos publicados son el adaptador fusionado con la base.

No se documenta el numero de tokens de entrenamiento, la composicion del dataset, la procedencia de los datos legales, ni si se aplicaron tecnicas de alineacion adicionales como RLHF o DPO. Tampoco se especifican hiperparametros, epocas ni metodos de evaluacion. Esta ausencia de informacion impide reproducir el entrenamiento o auditar la calidad del ajuste.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Orientacion a dominio legal segun la denominacion del repositorio, sin documentacion que detalle el alcance (consultas, contratos, jurisprudencia, etc.).
- Razonamiento basico y respuesta a instrucciones propias de un modelo de 1,5B parametros.
- Soporte de tool calling y function calling: no confirmado para este ajuste concreto (el modelo base Qwen2.5 lo soporta, pero no hay evidencia de que el ajuste lo preserve).
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: limitadas al ingles segun los metadatos; no se documenta soporte de castellano ni de otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Prototipado de asistentes legales en ingles: el modelo puede emplearse para generar respuestas conversacionales de prueba en entornos de desarrollo, dado su bajo coste de inferencia y su ajuste declarado al dominio legal.
- Clasificacion y resumen de textos legales en ingles: con 1,5B parametros puede procesar documentos de extension moderada para tareas de extraccion o resumen, siempre con revision humana.
- Experimentacion academica con fine-tuning: sirve como ejemplo de pipeline Unsloth + TRL sobre un modelo pequeno, util para investigadores que quieran replicar el flujo de trabajo.
- Despliegue en hardware de consumo para demos: su tamano permite ejecutarlo en GPU de gama media para pruebas interactivas o demostraciones locales.
- Generacion de borradores de respuestas en un chatbot de atencion legal de bajo riesgo: adecuado solo como primer borrador sujeto a validacion por un profesional.
- Evaluacion comparativa de ajustes de dominio: util como linea base para comparar con otros ajustes legales de modelos Qwen2.5 o de tamano similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-4 GB en fp16 (1,5B parametros), en torno a 1-1,5 GB en cuantizacion de 4 bits.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobradas para este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de consumo (GTX 1650 4 GB en adelante, con cuantizacion incluso en GPUs de 2-3 GB).
- Opciones de despliegue: transformers, text-generation-inference (el repositorio incluye la etiqueta `text-generation-inference`), vLLM y llama.cpp/Ollama previa conversion a GGUF (no se publican pesos GGUF en el repositorio).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| radbile2022/legal-chatbot-qwen25-1p5b-lora | 1,54B | no disponible | Apache 2.0 | HuggingFace | Ajuste legal con documentacion escasa |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens (segun modelo base) | Apache 2.0 | HuggingFace | Modelo base oficial, documentacion completa y benchmarks publicados |
| unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit | 1,54B | 32.768 tokens (heredado) | Apache 2.0 | HuggingFace | Version cuantizada a 4 bits del modelo base, usada como punto de partida |
| Ajustes legales de modelos pequenos (genericos) | variable | variable | variable | HuggingFace | No disponible una comparacion concreta con benchmarks en la informacion proporcionada |

## Limitaciones y advertencias

- Documentacion muy escasa: no se detalla el dataset, los hiperparametros ni la evaluacion, lo que impide verificar la calidad del ajuste legal.
- Riesgo elevado de alucinacion: un modelo de 1,5B parametros ajustado sin evaluacion publicada puede generar contenido legal incorrecto o inventado; no debe usarse como asesoramiento juridico sin supervision profesional.
- Sesgos conocidos: no documentados, pero heredados del corpus de entrenamiento del modelo base Qwen2.5, sobre el que no se aporta informacion especifica.
- Limitaciones de idioma: los metadatos indican solo ingles; no hay evidencia de buen rendimiento en castellano.
- Limitaciones de contexto: no se confirma la ventana de contexto efectiva tras el ajuste; el modelo base soporta 32.768 tokens, pero el ajuste podria no preservarlo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni documenta la procedencia de los datos de ajuste, lo que puede plantear riesgos de compliance.
- Caveat de produccion: con 62 descargas y 0 likes, es un modelo de muy baja adopcion; no hay evidencia de la comunidad sobre su robustez.
- El repositorio se creo y actualizo el mismo dia (28 de octubre de 2026), lo que sugiere una publicacion sin iteracion posterior ni mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/radbile2022/legal-chatbot-qwen25-1p5b-lora
- Modelo base (Unsloth, bnb-4bit): https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Modelo original Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Libreria TRL de HuggingFace: https://github.com/huggingface/trl
