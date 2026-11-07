# minhtandangtt/Doujinshi-14b-roleplay-Q4KM

## Resumen

Doujinshi-14b-roleplay-Q4KM es una cuantización GGUF de 4 bits (Q4_K_M) del modelo Doujinshi-14b-roleplay, publicado por el usuario minhtandangtt en Hugging Face. El modelo base, atribuido a puwaer, es un ajuste fino de Qwen/Qwen3-14B orientado específicamente a roleplay de temática R18, entrenado según la información disponible con aproximadamente 4.000 millones de tokens de datos japoneses de ese dominio extraídos de dmm.co.jp y dlsite.com.

El modelo resuelve el problema de mantener personajes, tono y perspectiva en primera persona en conversaciones de rol de larga duración, un caso de uso donde los modelos generalistas suelen derivar hacia respuestas genéricas o romper el personaje. Con 14.000 millones de parámetros y una ventana de contexto de 32.768 tokens, ofrece margen suficiente para fichas de personaje extensas e historiales multi-turno.

La relevancia de esta ficha concreta es práctica: al tratarse de una cuantización Q4_K_M, permite ejecutar un modelo de 14B en hardware de consumo con requisitos de VRAM moderados, a costa de una pérdida de calidad respecto a los pesos originales. La model card del repositorio es prácticamente vacía (solo declara licencia Apache 2.0), por lo que la mayor parte de los datos técnicos proceden de la información del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-14B; detalles de atención no disponibles) |
| Parametros totales | 14.000 millones (modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (según modelo base) |
| Tipos de cuantizacion | GGUF Q4_K_M (esta ficha); otras cuantizaciones no disponibles |
| Idiomas soportados | No disponible (el ajuste fino se entrenó con datos japoneses; el base Qwen3 es multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Doujinshi-14b-roleplay se construye sobre Qwen3-14B, un transformer decoder-only denso de 14.000 millones de parámetros con soporte de contexto de 32.768 tokens. Sobre esa base se aplicó un ajuste fino supervisado orientado a roleplay R18, entrenado con aproximadamente 4.000 millones de tokens de datasets japoneses específicos del dominio, obtenidos de dmm.co.jp y dlsite.com según la información disponible. No se detalla en la información proporcionada si hubo fases de RLHF, DPO u otras técnicas de alineación posteriores al SFT.

La innovación principal no es arquitectónica sino de especialización: el entrenamiento busca preservar persona, tono y perspectiva en primera persona a lo largo de conversaciones largas, un objetivo que los ajustes genéricos no cubren bien. La ficha que nos ocupa aplica cuantización Q4_K_M sobre esos pesos, un esquema de bloques de 4 bits con escalas de 6 bits que típicamente reduce el tamaño a aproximadamente 8-9 GB, a cambio de una degradación moderada en la fidelidad de generación. No se dispone de información sobre el proceso de cuantización concreto ni sobre calibración.

## Capacidades

- Generación de texto conversacional orientada a roleplay, con énfasis en mantener personaje, tono y perspectiva en primera persona a lo largo de múltiples turnos.
- Manejo de fichas de personaje extensas e historiales largos gracias a la ventana de 32.768 tokens.
- Capacidades heredadas de Qwen3-14B: razonamiento, generación de código y matemáticas, aunque el ajuste fino puede haberlas degradado parcialmente.
- Soporte multilingüe heredado del modelo base, con especialización en japonés por la composición del dataset de ajuste.
- Tool calling y function calling: no confirmado en la información disponible para este ajuste fino.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la información disponible.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Roleplay conversacional interactivo: el modelo mantiene persona y perspectiva en primera persona durante sesiones largas, aprovechando los 32.768 tokens de contexto para conservar fichas de personaje e historial sin truncamientos agresivos.
- Creación de ficción interactiva y novelas visuales: sirve como motor de diálogo para personajes con trasfondo detallado, donde la coherencia de tono es crítica y la ventana de contexto permite arrastrar tramas completas.
- Prototipado de aplicaciones de entretenimiento para adultos: al ser Apache 2.0, permite integrarlo en productos propios sin restricciones de licencia, siempre que se cumplan los requisitos legales de verificación de edad y las políticas de las plataformas de distribución.
- Investigación sobre coherencia de personaje: útil para estudiar deriva de persona, consistencia de tono y degradación de contexto en modelos ajustados, comparando la versión Q4_K_M con los pesos originales.
- Evaluación de cuantización: permite medir cuánto se pierde en fidelidad de rol al pasar de pesos completos a Q4_K_M, un dato relevante para decidir el despliegue en hardware limitado.
- Despliegue local en estaciones de trabajo con GPU de consumo: al ser GGUF Q4_K_M, se puede ejecutar con llama.cpp u Ollama en equipos con 12-16 GB de VRAM, sin depender de infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para Q4_K_M: aproximadamente 8-9 GB solo para los pesos; con overhead de contexto (32.768 tokens) y caché KV, prever 12-16 GB en total.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 4080 (16 GB) para contexto completo; A100 o H100 para despliegue de alta concurrencia.
- GPU de consumo: sí cabe en tarjetas de 16 GB o más; en 12 GB puede funcionar con contexto reducido o volcado parcial a RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; vLLM y TGI requieren pesos en safetensors, no disponibles en esta ficha.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Doujinshi-14b-roleplay-Q4KM (esta ficha) | 14B | 32.768 | Roleplay R18 en japones | Apache 2.0 | GGUF Q4_K_M |
| Doujinshi-14b-roleplay (pesos originales) | 14B | 32.768 | Roleplay R18 en japones | Apache 2.0 | No disponible |
| Qwen3-14B (base) | 14B | 32.768 | Proposito general, multilingue | Apache 2.0 | Safetensors, GGUF |

La comparación con alternativas de roleplay de otros autores no está disponible en la información proporcionada. Frente a Qwen3-14B, la diferencia es la especialización en dominio y la cuantización; frente a los pesos originales, la diferencia es el formato y la pérdida de calidad asociada a Q4_K_M.

## Limitaciones y advertencias

- Contenido para adultos: el modelo está ajustado para roleplay R18; su uso requiere verificación de edad y cumplimiento de la legislación aplicable, además de las políticas de las plataformas de distribución.
- Riesgo de alucinación: como todo modelo generativo, puede inventar detalles de personaje o trama; la cuantización Q4_K_M puede agravar inconsistencias menores.
- Sesgos: no hay documentación sobre sesgos del ajuste fino; los datasets japoneses de origen pueden introducir sesgos culturales y de género no evaluados.
- Idiomas: la especialización es en japonés; el rendimiento en castellano no está documentado y probablemente sea inferior al del modelo base.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado y el contexto de uso (R18) pueden quedar restringidos por normativa local y por los términos de las plataformas.
- Model card vacía: el repositorio no documenta el proceso de cuantización, los parámetros exactos ni evaluaciones; la trazabilidad es limitada.
- Fecha de creación futura (2026-11-07) en los metadatos: conviene verificar la procedencia del repositorio antes de usarlo en producción.
- Sin datos de benchmarks: no es posible comparar su calidad de forma objetiva con alternativas.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/minhtandangtt/Doujinshi-14b-roleplay-Q4KM
- Modelo base (autor original): https://huggingface.co/puwaer/Doujinshi-14b-roleplay
- Despliegue gestionado del modelo base: https://featherless.ai/models/puwaer/Doujinshi-14b-roleplay
