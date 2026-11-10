# ashbash/Ripple-65B-Preview-DFlash2-GGUF

## Resumen

Ripple-65B-Preview-DFlash2-GGUF es una conversión a formato GGUF del modelo borrador (draft model) DFlash2 perteneciente a la familia Ripple-65B-Preview, desarrollada por ricursiveAI y convertida por el usuario ashbash. No se trata de un modelo generativo autónomo, sino de un componente especializado en decodificación especulativa (speculative decoding): propone varios tokens por paso que el modelo objetivo (Ripple-65B-Preview) verifica, acelerando la inferencia sin alterar la salida final. El repositorio contiene tres cuantizaciones GGUF (Q8_0, Q4_K_M y Q4_0) listas para su uso con gmlx o llama.cpp.

El modelo base cuenta con aproximadamente 4.037 millones de parámetros (4B), a pesar de la nomenclatura "65B" que hace referencia al modelo objetivo al que acompaña y no al tamaño del propio borrador. Esta asimetría es característica de los drafters en decodificación especulativa: el borrador debe ser mucho más pequeño y rápido que el modelo verificado para que la aceleración neta sea positiva.

La relevancia de esta ficha radica en que documenta una pieza poco habitual en el ecosistema open source: un drafter empaquetado en GGUF con metadatos específicos (`dflash.attention.rope_pattern` y `dflash.attention.context_window`) que permiten a gmlx reproducir la receta de referencia, mientras que llama.cpp aún no la iguala completamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (draft model para decodificacion especulativa, familia DFlash2) |
| Parametros totales | 4.037.752.064 (aprox. 4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens para la capa de atencion completa (segun `dflash.attention.context_window`); contexto del modelo objetivo no disponible |
| Tipos de cuantizacion | Q8_0 (4,30 GB), Q4_K_M (2,39 GB), Q4_0 (2,28 GB) |
| Idiomas soportados | no disponible (hereda del modelo objetivo Ripple-65B-Preview) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un drafter DFlash2 diseñado para decodificación especulativa. Su funcionamiento consiste en proponer varios tokens candidatos por paso de decodificación; el modelo objetivo (Ripple-65B-Preview) los verifica en paralelo y acepta el prefijo correcto, de modo que la salida final es idéntica a la del objetivo pero se generan más tokens por unidad de tiempo. Una particularidad arquitectónica relevante es que el drafter reutiliza los embeddings de tokens y la cabeza de salida del modelo objetivo, por lo que solo añade sus propias capas a la memoria total del sistema.

La receta de referencia tiene dos rasgos distintivos que el autor documenta explícitamente: la capa 4 del drafter se ejecuta sin RoPE, y la capa de atención completa se limita a los últimos 16.384 tokens. Ambos parámetros se almacenan en los metadatos GGUF (`dflash.attention.rope_pattern` y `dflash.attention.context_window`) para que gmlx los respete. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; estos datos no están publicados en la información disponible.

## Capacidades

- Decodificación especulativa: propone múltiples tokens por paso para acelerar la inferencia del modelo objetivo Ripple-65B-Preview sin modificar la distribución de salida.
- Integración con gmlx: soporte nativo mediante el flag `--draft-gguf`.
- Integración con llama.cpp: carga como drafter de tipo `dflash`, aunque con divergencias conocidas respecto a la receta de referencia.
- Reutilización de embeddings y cabeza de salida del modelo objetivo, lo que reduce el coste de memoria adicional.
- Conversación: la etiqueta `conversational` sugiere uso en diálogo, heredado del modelo objetivo.
- No es un modelo autónomo: no genera texto por sí mismo sin un modelo objetivo que verifique sus propuestas.
- Capacidades multilingües: no disponibles de forma explícita en la información proporcionada.

## Casos de uso

- Aceleración de inferencia en producción: desplegar Ripple-65B-Preview junto con este drafter en gmlx para reducir la latencia por token en servicios de generación de texto, manteniendo la calidad del modelo grande.
- Servidores de chat con requisitos de throughput: en un endpoint conversacional, el drafter permite servir más peticiones por GPU al aumentar los tokens generados por segundo del modelo objetivo.
- Inferencia en hardware limitado: al añadir solo unas pocas capas sobre el modelo objetivo (Q8_0 ocupa 4,30 GB, Q4_K_M 2,39 GB), permite acelerar el objetivo sin duplicar su huella de memoria.
- Evaluación comparativa de decodificación especulativa: usar las tres cuantizaciones (Q8_0, Q4_K_M, Q4_0) para medir el impacto de la precisión del drafter en la tasa de aceptación y en la velocidad final.
- Investigación en técnicas de speculative decoding: estudiar el efecto de las decisiones de receta (RoPE en capa 4, ventana de atención de 16.384 tokens) sobre la calidad del borrador, comparando gmlx frente a llama.cpp.
- Pipelines de generación de código o texto largo con modelo grande: cualquier flujo que use Ripple-65B-Preview como objetivo puede beneficiarse del drafter sin cambios en el prompt ni en la lógica de aplicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM del drafter: 4,30 GB en Q8_0, 2,39 GB en Q4_K_M y 2,28 GB en Q4_0, a los que hay que sumar la memoria del modelo objetivo Ripple-65B-Preview.
- Memoria adicional real: según la model card, el drafter solo añade sus propias capas porque reutiliza embeddings y cabeza de salida del objetivo.
- GPU recomendadas: no disponibles de forma específica; dependerán del modelo objetivo. Para el drafter en solitario, cualquier GPU con al menos 5 GB libres en Q8_0 es suficiente.
- Consumer GPU: el drafter cabe holgadamente en GPUs de consumo (RTX 3060 12 GB, RTX 4070, RTX 4090) en todas las cuantizaciones; el requisito real lo marca el modelo objetivo.
- Opciones de despliegue: gmlx (soporte de referencia, con lectura de metadatos `dflash.*`) y llama.cpp (soporte parcial con divergencias documentadas).
- Latencia y throughput: no disponibles; dependen del modelo objetivo, del hardware y de la tasa de aceptación del drafter.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Formato |
|---|---|---|---|---|---|
| Ripple-65B-Preview-DFlash2-GGUF (este) | ~4B | 16.384 (atencion completa) | Drafter especulativo para Ripple-65B-Preview | Apache 2.0 | GGUF |
| Modelos draft EAGLE / Medusa | no disponible | no disponible | Drafters especulativos genericos | variable | safetensors / GGUF |
| Ripple-65B-Preview (objetivo) | no disponible | no disponible | Modelo generativo verificado | no disponible | no disponible |

No se dispone de información sobre otros drafters comparables publicados en la misma familia ni de sus métricas de aceptación, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere siempre un modelo objetivo Ripple-65B-Preview que verifique sus propuestas; no puede usarse para generar texto por sí solo.
- Divergencias en llama.cpp: la implementación aplica RoPE a la capa 4 (la receta no lo hace) y permite que la capa de atención completa vea todo el contexto en lugar de limitarse a 16.384 tokens. Esto puede degradar la tasa de aceptación respecto a gmlx.
- La nomenclatura "65B" es engañosa: hace referencia al modelo objetivo, no al tamaño del drafter (4B).
- Idiomas soportados no documentados explícitamente; dependen del modelo objetivo.
- Riesgo de alucinación: no aplica directamente al drafter, pero la calidad final depende del modelo verificado.
- Sesgos: no documentados en la información disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base ricursiveAI/Ripple-65B-Preview-DFlash2 y del objetivo, que no se detalla en esta ficha.
- Repositorio con muy poca tracción (1 like, 617 descargas) y creado recientemente; no hay evidencia de validación comunitaria extensa.

## Enlaces

- Hugging Face: https://huggingface.co/ashbash/Ripple-65B-Preview-DFlash2-GGUF
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-DFlash2
- Modelo objetivo: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Repositorio gmlx: https://github.com/asher/gmlx
