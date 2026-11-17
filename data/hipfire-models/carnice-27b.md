# hipfire-models/carnice-27b

## Resumen

Carnice-27b es un modelo de lenguaje publicado en Hugging Face por el usuario hipfire-models bajo el identificador `hipfire-models/carnice-27b`. Por el nombre y el tamano del repositorio (36,4 GB), se trata de un modelo denso de aproximadamente 27 mil millones de parametros almacenado en precision de 16 bits (o un formato equivalente de pesos), lo que encaja con el orden de magnitud esperado para un checkpoint de ese tamano. No se dispone de informacion publica sobre la arquitectura interna, el proceso de entrenamiento ni los datos utilizados.

La ficha del repositorio no incluye pipeline declarado, licencia, idiomas soportados ni tarjeta de modelo con documentacion tecnica. El numero de descargas es cero y la actividad de la comunidad es practicamente nula (un solo "like"), lo que sugiere un modelo recien publicado o de caracter experimental sin validacion externa. La fecha de creacion indicada es abril de 2026 y la ultima actualizacion, noviembre de 2026.

Dado que no existe informacion verificable sobre capacidades, rendimiento o condiciones de uso, esta ficha se limita a documentar los datos objetivamente disponibles (tamano, identificador, fechas) y marca explicitamente como "no disponible" todo aquello que no puede confirmarse. Cualquier evaluacion de idoneidad para produccion requeriria inspeccion directa del repositorio y de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | aproximadamente 27 mil millones (inferido del nombre; no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo ocupa 36,4 GB, compatible con pesos en FP16/BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se especifica safetensors, GGUF ni otros) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo (transformer denso, MoE, hibrido u otra variante), ni sobre el numero de tokens de entrenamiento, la composicion del dataset, la posible aplicacion de RLHF, DPO u otras tecnicas de alineamiento. Tampoco hay datos sobre innovaciones tecnicas como atencion lineal, decodificacion especulativa o modos de razonamiento extendido.

El unico dato objetivo es el tamano del repositorio (36,4 GB), que resulta coherente con un checkpoint de unos 27B parametros en 16 bits, pero esta inferencia no sustituye a una especificacion tecnica oficial.

## Capacidades

- No se han documentado capacidades especificas en la informacion disponible.
- No hay confirmacion de soporte de tool calling ni de function calling.
- No hay confirmacion de capacidades de agente o razonamiento multi-paso.
- No hay informacion sobre cobertura multilingue.
- No hay informacion sobre modo de razonamiento (thinking mode), vision, audio ni otras modalidades.

## Casos de uso

Dado que no se dispone de documentacion sobre el modelo, los siguientes casos son escenarios genericos para un modelo denso de ~27B parametros y deben validarse empiricamente antes de cualquier uso real:

- Evaluacion comparativa interna: serviria como candidato adicional en pruebas A/B frente a modelos de tamano similar, siempre que se verifiquen primero la licencia y la calidad de las respuestas.
- Experimentacion en investigacion: util como checkpoint de referencia para estudiar comportamiento de modelos de ~27B en tareas controladas, previa inspeccion de los pesos.
- Generacion de texto asistida en entornos de prueba: uso en prototipos no criticos donde el fallo sea tolerable y no haya requisitos de cumplimiento estrictos.
- Fine-tuning experimental: punto de partida para ajuste supervisado en dominios concretos, condicionado a que la licencia lo permita (actualmente desconocida).
- Despliegue en infraestructura propia con GPU de 80 GB: inferencia en BF16 en una sola A100/H100 de 80 GB, si el contexto no es excesivamente largo.
- Pruebas de cuantizacion: conversion a GGUF o AWQ para medir la degradacion de calidad en hardware consumer, como ejercicio tecnico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: en torno a 54 GB solo para pesos, mas overhead de activaciones y cache KV; requiere GPU de 80 GB (A100, H100, H200) para inferencia comoda.
- Cuantizacion a 8 bits: aproximadamente 27-30 GB de VRAM, viable en una RTX 4090 (24 GB) solo con cuantizaciones mas agresivas o con offloading parcial.
- Cuantizacion a 4 bits: alrededor de 14-16 GB para pesos, lo que permitiria ejecucion en RTX 4090, RTX 3090 o similares con 24 GB, dependiendo de la longitud de contexto.
- No cabe en GPUs consumer de 8-12 GB sin cuantizacion extrema y offloading a RAM/CPU.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama serian los candidatos habituales, pero no hay confirmacion de que el formato de pesos del repositorio sea compatible con ellos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No es posible establecer una comparativa fiable porque se desconocen arquitectura, contexto, licencia y rendimiento del modelo. A modo orientativo por tamano, se situaria en la categoria de modelos densos de ~27B, junto a alternativas como Gemma 2 27B o Qwen2.5 32B, pero no hay datos que permitan comparar calidad, contexto ni condiciones de uso.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| carnice-27b | ~27B (inferido) | no disponible | no disponible | Hugging Face |
| Gemma 2 27B | 27B | 8K | Gemma license | Hugging Face |
| Qwen2.5 32B | 32B | 128K | Apache 2.0 (mayoria de variantes) | Hugging Face |

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay tarjeta de modelo, paper ni blog que describa entrenamiento, datos o evaluacion.
- Licencia desconocida: no puede asumirse uso comercial permitido; debe verificarse antes de cualquier despliegue.
- Riesgo elevado de alucinacion y comportamiento impredecible al no existir evaluaciones publicadas.
- Idiomas soportados sin confirmar; no se puede garantizar calidad en castellano ni en otros idiomas.
- Cero descargas y practicamente sin actividad comunitaria: no hay evidencia externa de calidad ni de seguridad.
- El nombre sugiere 27B parametros, pero el dato no esta confirmado oficialmente.
- No recomendable para produccion sin una evaluacion interna exhaustiva y una revision legal de la licencia.

## Enlaces

- Hugging Face: https://huggingface.co/hipfire-models/carnice-27b
