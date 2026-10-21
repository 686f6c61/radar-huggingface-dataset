# cpral/Poziomka-Instruct-2026-10-20

## Resumen

Poziomka Instruct 2026-10-20 es un modelo de lenguaje instructivo en polaco desarrollado por el usuario independiente cpral, publicado en HuggingFace bajo licencia openmdw-1.1. Se trata de un modelo entrenado desde cero por el propio autor sobre aproximadamente 90.000 millones de tokens, de los cuales unos 8.000 millones corresponden al conjunto de datos de instrucciones, y está afinado a partir del modelo base cpral/Poziomka-Baza-2026-09-05.

El modelo tiene 4.119.797.632 parámetros (aproximadamente 4,12 mil millones) declarados en los tensores safetensors, con un repositorio de 8,2 GB, lo que corresponde a pesos en precisión de 16 bits. La etiqueta de arquitectura de HuggingFace es `bailing_moe` y requiere código personalizado (`custom_code`, `trust-remote-code`), lo que lo sitúa en la familia de arquitecturas MoE de Bailing/Ling; la model card no detalla el número de expertos ni los parámetros activos.

Su relevancia es doble: por un lado, es uno de los pocos modelos entrenados íntegramente desde cero para polaco con recursos limitados (el autor indica que buena parte del entrenamiento se hizo en hardware local); por otro, es una versión explícitamente no final, con cero descargas y cero valoraciones en el momento de la consulta, por lo que debe tratarse como un artefacto experimental y no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (etiqueta `bailing_moe` en HuggingFace); número de expertos y detalles de atención no disponibles |
| Parámetros totales | 4.119.797.632 (≈4,12 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | 16.384 tokens declarados; el pretraining se realizó mayoritariamente con 8.192 tokens |
| Tipos de cuantización | no disponible (el repositorio solo publica safetensors en 16 bits; no se confirman GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | polaco (`pl`) |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors con código personalizado (`trust_remote_code` obligatorio) |
| Tamaño del repositorio | 8,2 GB |
| Modelo base | cpral/Poziomka-Baza-2026-09-05 (fine-tuning) |
| Conjuntos de datos de ajuste | cpral/Polski_Polish_SFT_poziomka-fun-rp-v12, cpral/poziomka-fun-rp-v11, cpral/polskie-sprawy-v8 |
| Modos de respuesta | solo modo de respuesta inmediata («błyskawiczna odpowiedź»); sin modo de razonamiento extendido |
| Motor recomendado por el autor | SGLang |

## Arquitectura y entrenamiento

La etiqueta `bailing_moe` indica una arquitectura de mezcla de expertos (MoE) perteneciente a la familia Bailing/Ling, con implementación remota que exige `--trust-remote-code` en el servidor de inferencia. La model card no especifica el número de expertos, el número de expertos activos por token, el tipo de atención (completa, lineal o híbrida), la profundidad de la red ni el vocabulario; tampoco detalla si se aplicaron técnicas de decodificación especulativa o de atención lineal. El script de chat publicado por el autor en el repositorio Ling-V2 sugiere compatibilidad con el ecosistema de herramientas de esa familia.

El entrenamiento se realizó desde cero sobre aproximadamente 90.000 millones de tokens, con 8.000 millones de tokens del conjunto de instrucciones y una longitud de contexto predominante de 8.192 tokens, aunque el modelo declara soportar hasta 16.384. El autor señala que una parte importante del cómputo se ejecutó en hardware local. No se documenta en la información disponible si hubo RLHF, DPO, RLVR ni ninguna otra fase de alineación posterior al SFT; los nombres de los datasets (`fun-rp`, `polskie-sprawy`) apuntan a una mezcla de instrucciones generales, conversación de rol y temática polaca, pero se desconoce su composición exacta y sus proporciones.

## Capacidades

- Generación de texto en polaco en modo instructivo, con respuestas directas sin cadena de razonamiento visible.
- Conversación multi-turno hasta 16.384 tokens de contexto declarados (con degradación esperable por encima de 8.192, longitud usada en la mayor parte del pretraining).
- Diálogo de rol y conversación abierta, por el peso de los datasets `poziomka-fun-rp-v11` y `poziomka-fun-rp-v12` en el ajuste.
- Procesamiento de texto de temática polaca (administración, asuntos locales) por el dataset `polskie-sprawy-v8`; el alcance real no está evaluado.
- Soporte de *tool calling* / *function calling*: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el autor indica que el modelo solo soporta el modo de respuesta inmediata, sin modo de pensamiento.
- Capacidades multilingües: no declaradas; el único idioma etiquetado es el polaco.
- Capacidades de visión, audio o multimodalidad: no disponibles.
- El comando de despliegue del autor incluye `--reasoning-parser qwen3`, lo que sugiere compatibilidad del chat template con marcadores de razonamiento tipo Qwen3, aunque la model card afirma que solo se soporta el modo de respuesta inmediata.

## Casos de uso

- **Atención al cliente en polaco**: el modelo puede mantener conversaciones multi-turno con hasta 16.384 tokens de contexto, suficiente para hilos de soporte con historial e información de producto, con la ventaja de un tamaño de 4,12 B que abarata el despliegue en una sola GPU.
- **Chatbots de personaje y rol textual**: los datasets `poziomka-fun-rp` dominan el ajuste, por lo que es adecuado para prototipos de experiencias conversacionales de ficción, juegos de rol por texto o asistentes con personalidad, siempre con filtros de seguridad añadidos por no haber documentación de alineación.
- **Resumen y extracción sobre documentos administrativos polacos**: con 16.384 tokens puede procesar contratos, actas o expedientes de extensión media y extraer campos estructurados, aprovechando el ajuste sobre `polskie-sprawy-v8`.
- **Base para *fine-tuning* de dominio**: al ser un modelo de 4,12 B entrenado desde cero, sirve como punto de partida de bajo coste para especializar en sectores concretos (legal, sanitario, e-commerce) con LoRA sobre una única GPU de 24 GB.
- **Experimentación académica sobre modelos de bajo recurso**: permite estudiar el comportamiento de un modelo entrenado con ~90.000 millones de tokens en hardware local y comparar su calidad con modelos multilingües de tamaño similar.
- **Prototipado y demos offline**: los pesos en 16 bits ocupan unos 8,2 GB, de modo que con cuantización a 8 o 4 bits puede ejecutarse en estaciones de trabajo e incluso en portátiles con GPU de 8-12 GB, útil para demos sin conexión.
- **Generación de contenido editorial en polaco**: borradores de artículos, descripciones de producto o correos, con revisión humana obligatoria por la ausencia de evaluaciones publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una imagen de comparación (`porownanie`) enlazada desde el CDN de HuggingFace, pero los valores numéricos no están accesibles en el texto proporcionado, por lo que no se reproducen aquí.

## Requisitos de hardware

- Pesos en 16 bits: 4,12 B × 2 bytes ≈ 8,2 GB, coherente con el tamaño del repositorio. Es la referencia para calcular el resto de configuraciones.

| Precisión | VRAM de pesos (estimada) | VRAM total recomendada (estimada) |
|---|---|---|
| BF16 / FP16 | ≈8,2 GB | 11-13 GB |
| FP8 / INT8 | ≈4,1 GB | 6-8 GB |
| INT4 (GGUF Q4_K_M) | ≈2,4 GB | 4-5 GB |

- La VRAM total depende del tamaño de la caché KV a 16.384 tokens, que no se puede calcular sin conocer el número de capas, cabezas y el ratio de atención completa frente a atención lineal del modelo; dato no disponible.
- GPU recomendadas: una RTX 4090 (24 GB) o L40S permite BF16 con contexto completo; una A100/H100 no aporta ventaja por capacidad de memoria, solo por throughput concurrente.
- Cabe en GPU de consumo: sí. BF16 en RTX 4080/4070 Ti Super (16 GB) o superiores; INT8 en RTX 3060 12 GB, RTX 4060 Ti 16 GB o L4; INT4 en GPU de 6-8 GB, siempre que se genere la cuantización.
- Despliegue: SGLang es el motor recomendado por el autor, con el comando `python3 -m sglang.launch_server --model-path cpral/Poziomka-Instruct-2026-10-20 --trust-remote-code --port 2300 --host 0.0.0.0 --reasoning-parser qwen3 --grammar-backend none`. vLLM podría funcionar si su versión soporta la arquitectura `bailing_moe`, algo no confirmado. llama.cpp/Ollama requieren una conversión a GGUF que no está publicada.
- Parámetros de muestreo recomendados por el autor para el modo de respuesta inmediata: temperature 0,6, top_p 0,9, min_p 0,05, frequency_penalty 0,15.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los datos de los modelos de la competencia provienen de sus fichas públicas y deben verificarse antes de usarlos en una decisión de producción.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Poziomka-Instruct-2026-10-20 | 4,12 B (MoE, activos no disponibles) | 16.384 (pretraining a 8.192) | pl | openmdw-1.1 | Entrenado desde cero; sin benchmarks publicados; requiere `trust_remote_code` |
| Qwen3-4B | ≈4,0 B (denso) | 32.768 nativo, ampliable con YaRN | multilingüe (más de 100 idiomas) | Apache 2.0 | Modo *thinking* y *non-thinking*; ecosistema maduro (vLLM, SGLang, GGUF) |
| Llama 3.2 3B Instruct | 3,21 B (denso) | 128.000 | 8 idiomas oficiales, polaco no incluido | Llama 3.2 Community License | Muy extendido, pero sin soporte oficial de polaco |
| Bielik-4.5B (SpeakLeash) | ≈4,5 B | consultar ficha oficial | pl | consultar ficha oficial | Alternativa polaca de referencia, con evaluación publicada por el autor |

Frente a estas alternativas, la ventaja de Poziomka es un entrenamiento nativo en polaco y un tamaño que cabe en GPU de consumo; sus desventajas son la falta de evaluación pública, la licencia menos habitual y la dependencia de código personalizado.

## Limitaciones y advertencias

- Versión no final: el propio autor indica que el modelo no es la versión definitiva y que queda trabajo pendiente.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia cuantitativa de calidad frente a modelos consolidados.
- Un solo idioma declarado (polaco); el rendimiento en castellano o inglés no está documentado ni garantizado.
- Contexto efectivo limitado: aunque declara 16.384 tokens, la mayor parte del pretraining usó 8.192, por lo que la degradación más allá de esa longitud es probable.
- Riesgo de alucinación propio de un modelo de 4 B con corpus de entrenamiento no documentado; requiere verificación factual en usos sensibles.
- Alineación y seguridad no documentadas: el ajuste se apoya en datasets de rol y conversación (`fun-rp`), lo que puede producir un tono informal o inadecuado en contextos profesionales, además de una menor resistencia a prompts maliciosos.
- Sesgos desconocidos: no se describe la composición, filtrado ni procedencia del corpus de 90.000 millones de tokens.
- Licencia openmdw-1.1: deben revisarse los términos exactos antes de un uso comercial; la información disponible no detalla condiciones de atribución ni restricciones.
- `trust_remote_code` obligatorio: ejecutar código del repositorio implica un riesgo de seguridad que debe auditarse antes de desplegar en producción.
- Sin cuantizaciones oficiales publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos de bajos recursos sin trabajo adicional.
- Cero descargas y cero valoraciones: ausencia total de validación por parte de la comunidad.
- Entrenamiento parcial en hardware local: puede implicar un presupuesto de cómputo limitado en comparación con modelos de laboratorios grandes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cpral/Poziomka-Instruct-2026-10-20
- Modelo base: https://huggingface.co/cpral/Poziomka-Baza-2026-09-05
- Dataset de ajuste: https://huggingface.co/datasets/cpral/Polski_Polish_SFT_poziomka-fun-rp-v12
- Dataset de ajuste: https://huggingface.co/datasets/cpral/poziomka-fun-rp-v11
- Dataset de ajuste: https://huggingface.co/datasets/cpral/polskie-sprawy-v8
- Script de cliente de chat para la API local: https://github.com/adamo1139/Ling-V2/tree/main/chat
- Imagen de comparación citada en la model card: https://cdn-uploads.huggingface.co/production/uploads/692c94fd48cef90cf296829a/tOy3MzlZPV_vaeFFPBrwl.png
