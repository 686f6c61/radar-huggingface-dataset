# 0xzknw/LFM3-1.7B-EXL3-4bpw

## Resumen

LFM3-1.7B-EXL3-4bpw es una cuantizacion en formato EXL3 a 4 bits por peso (4bpw) del modelo LiquidAI/LFM3-1.7B, desarrollado originalmente por Liquid AI. El checkpoint ha sido convertido, evaluado y empaquetado por el usuario 0xzknw, y esta pensado para su uso con runtimes que soporten LFM3 y el formato EXL3 MCG, en particular MLXL3, una implementacion basada en ExLlamaV3. No se trata de pesos BF16 convencionales, sino de un checkpoint EXL3 que requiere un runtime especifico.

El modelo base pertenece a la familia LFM3 de Liquid AI, orientada a generacion de texto y conversacion. El repositorio contiene unicamente la variante de 4bpw, que anteriormente se publicaba dentro de un repositorio multi-variante ya retirado; los ficheros se han copiado sin modificar su contenido. El objetivo de esta publicacion es ofrecer una version comprimida del modelo que reduzca los requisitos de memoria manteniendo una fidelidad razonable respecto al modelo de referencia.

La relevancia de esta ficha radica en que documenta una cuantizacion concreta con sus limites explicitos: el autor solo aporta una comprobacion de fidelidad limitada (KL de 0,033835 nats/token sobre un pasaje bilingue de 499 tokens) y advierte que las afirmaciones de benchmarks del modelo upstream no validan la cuantizacion. La licencia aplicable es la LFM Open License v1.0, que impone condiciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3 de Liquid AI; el checkpoint es EXL3) |
| Parametros totales | 892.520.192 (segun safetensors del repo); el modelo base se denomina LFM3-1.7B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 4 bits por peso (4bpw) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (license: other) |
| Formato de pesos | safetensors (checkpoint EXL3, no BF16) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base LFM3-1.7B en la documentacion proporcionada. El checkpoint aqui descrito es una conversion a formato EXL3 realizada con las herramientas de ExLlamaV3, que produce pesos cuantizados a 4 bits por peso en lugar de los pesos BF16 originales. El repositorio incluye el modelo EXL3, la configuracion y el tokenizer en la raiz, y requiere un runtime compatible con LFM3 y EXL3 MCG, como MLXL3.

El autor conserva en el repositorio la model card original archivada, informes de validacion y un manifiesto de origen que documentan la receta de conversion, la metodologia y los resultados en bruto. La unica metrica de fidelidad publicada es la divergencia KL media muestreada frente a la referencia FP32: 0,033835 nats/token sobre un pasaje bilingue de 499 tokens. El propio autor califica esta comprobacion como limitada y no como un benchmark general de calidad. No se detallan en la informacion disponible los datos de entrenamiento, el numero de tokens ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion, segun el pipeline declarado (text-generation, conversational).
- Capacidades multilingues: no confirmadas en la informacion disponible; la unica referencia es un pasaje de evaluacion bilingue.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Ejecucion mediante runtimes EXL3 (MLXL3 / ExLlamaV3), no mediante cargadores estandar de transformers.

## Casos de uso

- Despliegue en entornos con memoria limitada: al estar cuantizado a 4bpw, el checkpoint reduce el espacio ocupado frente a los pesos BF16 del modelo base, lo que permite ejecutarlo en hardware mas modesto siempre que el runtime soporte EXL3.
- Prototipado de aplicaciones conversacionales: el pipeline declarado es text-generation y conversational, por lo que puede emplearse para construir asistentes de chat en fase de prueba con un runtime compatible.
- Experimentacion con cuantizacion: util para investigadores que quieran comparar el comportamiento del modelo base frente a su version EXL3 4bpw y analizar el impacto de la compresion en la calidad de salida.
- Evaluacion de fidelidad de cuantizaciones: el repositorio incluye informes de validacion y un manifiesto de origen que sirven como referencia metodologica para reproducir analisis de KL y otras metricas.
- Integracion en pipelines de generacion de texto con ExLlamaV3: adecuado para flujos que ya utilicen esta familia de runtimes y necesiten un modelo pequeno cuantizado.
- Investigacion sobre licencias abiertas: permite estudiar las condiciones de la LFM Open License v1.0 en un caso real de redistribucion de pesos cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento es la divergencia KL media de 0,033835 nats/token frente a la referencia FP32 sobre un pasaje bilingue de 499 tokens, que el autor presenta como una comprobacion de fidelidad limitada y no como un benchmark de calidad general.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 1,8 GB, por lo que el checkpoint a 4bpw deberia caber holgadamente en GPUs de consumo con 4 GB o mas de VRAM; no se dispone de una estimacion oficial del autor.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano del checkpoint, aunque no se confirma oficialmente.
- Opciones de despliegue: MLXL3 (runtime recomendado por el autor) y ExLlamaV3; no se garantiza compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-EXL3-4bpw (este) | 892.520.192 (safetensors) | no disponible | EXL3 4bpw | LFM Open License v1.0 | Hugging Face |
| LiquidAI/LFM3-1.7B (base) | no disponible (denominado 1.7B) | no disponible | BF16 (original) | LFM Open License v1.0 | Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables de la misma familia o tamano en la documentacion proporcionada.

## Limitaciones y advertencias

- El checkpoint es EXL3, no pesos BF16: no puede cargarse con cargadores estandar de transformers; requiere un runtime compatible con LFM3 y EXL3 MCG (por ejemplo, MLXL3).
- La unica comprobacion de fidelidad publicada (KL de 0,033835 nats/token) se realizo sobre un pasaje de 499 tokens y el propio autor la califica como limitada; no constituye una validacion general de calidad.
- Las afirmaciones de benchmarks del modelo upstream no validan esta cuantizacion, segun advierte el autor.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion ni limitaciones de contexto o idioma.
- La licencia LFM Open License v1.0 impone condiciones de uso; debe revisarse el fichero LICENSE y el aviso de modificacion (NOTICE) antes de cualquier uso comercial.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de uso en produccion ni validacion comunitaria.
- La model card archivada describe el antiguo repositorio multi-variante, por lo que sus enlaces relativos historicos pueden no resolverse.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/0xzknw/LFM3-1.7B-EXL3-4bpw
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Runtime MLXL3: https://github.com/0xZKnw/mlxl3
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- Perfil del autor: https://huggingface.co/0xzknw
- Liquid AI en Hugging Face: https://huggingface.co/LiquidAI
