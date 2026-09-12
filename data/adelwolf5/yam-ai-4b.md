# adelwolf5/YAM-AI-4B

## Resumen

YAM AI 4B es un modelo derivado de google/gemma-4-E4B-it, publicado por el usuario adelwolf5 en HuggingFace. Se trata de un ajuste fino mediante LoRA sobre un dataset multilingue de identidad, con la LoRA fusionada posteriormente en los pesos del modelo base. El autor indica que el modelo soporta un prompt de identidad en 80 idiomas, lo que apunta a un caso de uso muy concreto: dotar al modelo de una identidad consistente y multilingue, probablemente para asistentes personalizados o personajes conversacionales.

El repositorio apenas tiene traccion: 0 descargas y 0 likes en el momento de la consulta, y la model card es muy escueta (cuatro frases). No se publican detalles sobre arquitectura interna, composicion del dataset de ajuste, hiperparametros de entrenamiento, licencia ni idiomas de generacion general.

Un dato relevante es la discrepancia entre el nombre comercial (4B) y el numero real de parametros: la suma de los tensores safetensors es de 7.941.100.832 parametros (unos 7,94 mil millones), con un repositorio de 15,9 GB. Eso es consistente con pesos en bf16/fp16 (7,94e9 × 2 bytes ≈ 15,9 GB). El sufijo "E4B" del modelo base sugiere un esquema de parametros efectivos o activos, pero la informacion disponible no lo confirma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de google/gemma-4-E4B-it; la model card no detalla el tipo de transformer) |
| Parametros totales | 7.941.100.832 (≈7,94 mil millones), segun los tensores safetensors |
| Parametros activos | no disponible (el sufijo "E4B" del modelo base sugiere parametros efectivos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors; 15,9 GB, consistente con bf16/fp16) |
| Idiomas soportados | El autor declara prompt de identidad en 80 idiomas; idiomas generales de generacion no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card indica unicamente que el modelo parte de google/gemma-4-E4B-it y que se ha ajustado con LoRA sobre un dataset multilingue de identidad, fusionando despues los adaptadores en los pesos base. No se especifica el rango de la LoRA, la tasa de aprendizaje, el numero de pasos, el tamano del dataset ni su procedencia. Tampoco se indica si hubo fases adicionales de alineamiento (RLHF, DPO u otras).

No se documenta ninguna innovacion tecnica propia (atencion lineal, decodificacion especulativa, variantes de MoE, etc.). Al ser un derivado directo de Gemma 4 con LoRA fusionada, la arquitectura subyacente debe ser la del modelo base, pero los detalles concretos no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional: capacidades heredadas del modelo base, sin evaluacion publicada especifica para este ajuste.
- Identidad multilingue: el autor afirma que el modelo responde a un prompt de identidad en 80 idiomas, lo que sugiere un comportamiento consistente de "personalidad" en esos idiomas.
- Razonamiento, codigo y matematicas: no disponible; no hay benchmarks ni ejemplos que lo confirmen para este ajuste.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Multilingue general: no disponible mas alla de la afirmacion sobre el prompt de identidad.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Asistentes con identidad fija: el ajuste esta orientado especificamente a mantener una identidad coherente y multilingue, por lo que encaja en productos de asistente personalizado (marca, personaje, tutor) donde la consistencia de "quien es" el modelo importa mas que el rendimiento bruto en tareas.
- Atencion al cliente multilingue de marca: si el prompt de identidad funciona de forma estable en los 80 idiomas declarados, el modelo podria desplegarse como primera linea de soporte con una voz corporativa uniforme en varios mercados.
- Personajes conversacionales para entretenimiento: chat de rol o compania virtual donde la identidad consistente es el requisito principal.
- Tutoria de idiomas: un asistente con identidad fija que se mantiene coherente al cambiar de idioma puede usarse para practica conversacional, siempre que se valide la calidad real por idioma (no publicada).
- Prototipado rapido de productos conversacionales: al ser un modelo de ~8B en safetensors, permite iterar en local o en una sola GPU, aunque requerira conversion a formatos cuantizados para hardware de gama media.
- Base para nuevos ajustes: al ser un derivado con LoRA ya fusionada, puede servir como punto de partida para fine-tuning adicional de identidad o dominio, asumiendo que se aclare antes la licencia aplicable.
- Investigacion sobre identidad y sesgo multilingue: util para estudiar como un ajuste de identidad se propaga a traves de distintos idiomas y si introduce deriva de comportamiento entre ellos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del recuento real de parametros (7,94 mil millones) y del tamano del repositorio (15,9 GB); no proceden de mediciones publicadas por el autor.

- Peso de los pesos en bf16/fp16: aproximadamente 15,9 GB, lo que coincide con el tamano del repositorio.
- VRAM estimada para inferencia en bf16/fp16: en torno a 18-24 GB contando pesos, cache KV y overhead. Cabe en RTX 3090 / RTX 4090 (24 GB) con margen ajustado, y con holgura en A100 40 GB, H100 o L40S.
- VRAM estimada en int8: aproximadamente 8-10 GB de pesos, unos 12-14 GB en total. Apta para RTX 4080 (16 GB) o RTX 4070 Ti Super.
- VRAM estimada en int4: aproximadamente 4-5 GB de pesos, unos 6-8 GB en total. Podria caber en RTX 3060 12 GB, RTX 4060 Ti 16 GB y portatiles con 8 GB, aunque con margen escaso.
- Cabe en GPU de consumo: si, en las gamas mencionadas, previa cuantizacion del modelo (el repositorio solo ofrece safetensors, por lo que habria que generar los pesos cuantizados).
- Opciones de despliegue: vLLM, TGI o TensorRT-LLM para safetensors en GPU; llama.cpp u Ollama si se convierte a GGUF; transformers para uso directo. No se documenta soporte oficial para ninguna de estas rutas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Solo se dispone de informacion parcial sobre el modelo base; no hay datos publicados del resto de alternativas en la busqueda realizada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Observaciones |
|---|---|---|---|---|---|
| adelwolf5/YAM-AI-4B | 7,94 mil millones (safetensors) | no disponible | no disponible | HuggingFace, 0 descargas | Ajuste LoRA de identidad sobre Gemma 4 E4B |
| google/gemma-4-E4B-it | no disponible | no disponible | no disponible en la informacion proporcionada | Modelo base citado por el autor | Punto de partida del ajuste |
| Otras alternativas de ~8B | no disponible | no disponible | no disponible | no disponible | No se han identificado comparables en la busqueda realizada |

## Limitaciones y advertencias

- Traccion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa ni evaluaciones independientes.
- Documentacion minima: la model card no describe dataset, hiperparametros, evaluacion ni limitaciones conocidas.
- Discrepancia de nomenclatura: el nombre sugiere 4B, pero los tensores suman 7,94 mil millones de parametros. Conviene verificar la cifra antes de planificar el despliegue.
- Licencia no declarada: es un derivado de un modelo de Google (familia Gemma), por lo que es previsible que quede sujeto a los terminos de uso de Gemma, pero el repositorio no lo especifica. No debe asumirse uso comercial libre sin aclararlo.
- Riesgo de alucinacion: no evaluado. Al ser un ajuste de identidad, existe riesgo de que el modelo fabrique informacion sobre "si mismo" o sobre su creador.
- Sesgos: no evaluados. Un dataset de identidad multilingue puede introducir comportamientos dispares entre idiomas.
- Limitaciones de idioma: solo se declara soporte del prompt de identidad en 80 idiomas; no hay datos sobre calidad de generacion general en cada uno.
- Idoneidad para produccion no demostrada: sin benchmarks, sin soporte de tool calling documentado y sin cuantizaciones publicadas, el modelo no ofrece garantias para pipelines criticos.
- Resultados de busqueda no relevantes: las consultas web realizadas no devolvieron informacion tecnica sobre este modelo, por lo que no ha sido posible contrastar la model card con fuentes independientes.

## Enlaces

- HuggingFace: https://huggingface.co/adelwolf5/YAM-AI-4B
- Modelo base citado: https://huggingface.co/google/gemma-4-E4B-it
- No se han encontrado otros enlaces relevantes (papers, blogs, repos, demos) en la busqueda web realizada.
