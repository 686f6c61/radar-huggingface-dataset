# mradermacher/Qwen3.8-27B-Abliterated-SFT-GGUF

## Resumen

Este modelo es una cuantización GGUF del modelo `Qwen3.8-27B-Abliterated-SFT`, creado por el usuario `azukivc` y posteriormente convertido a formato GGUF por `mradermacher`. La técnica de "abliteration" elimina la dirección de rechazo de los pesos del modelo, lo que reduce la censura y permite conversaciones más libres. Es un modelo denso de aproximadamente 27.000 millones de parámetros (aunque el archivo safetensors del repo indica 460.730.096 parámetros, cifra inconsistente con el nombre; probablemente se trate de un error o de un subconjunto de tensores). Está pensado para ejecutarse en local con herramientas como llama.cpp, Ollama o LM Studio. Su relevancia radica en ofrecer una alternativa sin restricciones a los modelos Qwen oficiales, manteniendo la capacidad de procesamiento de lenguaje natural de la familia Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.8-27B) |
| Parametros totales | 27B (nominal, según nombre; safetensors indica 460.730.096, inconsistente) |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS |
| Idiomas soportados | no disponible (probablemente multilingüe, pero sin confirmar) |
| Licencia | no disponible (el repo del autor no especifica; otros repos del mismo autor usan Apache-2.0) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es `Qwen3.8-27B-Abliterated-SFT`, que parte de un Qwen3.8-27B (arquitectura transformer densa con atención completa). La técnica de abliteration elimina la dirección de rechazo de los pesos, lo que reduce la probabilidad de que el modelo se niegue a responder a ciertas solicitudes. Posteriormente se aplicó un fine-tuning supervisado (SFT) para mantener la coherencia. No se dispone de detalles sobre el dataset de entrenamiento ni el número de tokens. El archivo GGUF es una cuantización del modelo resultante, sin modificaciones adicionales.

## Capacidades

- Generación de texto libre y conversacional, con menos restricciones que el modelo original.
- Razonamiento y resolución de problemas, heredado de la arquitectura Qwen.
- Generación de código y soporte para tool calling (según la familia Qwen, aunque no confirmado en esta versión).
- Capacidad multilingüe probable, pero sin confirmación oficial.
- No se han verificado capacidades de visión o audio en esta versión.

## Casos de uso

- **Creación de contenido creativo sin censura**: el modelo puede generar historias, guiones o diálogos con temas sensibles sin auto-censura, útil para escritores que exploran narrativas adultas.
- **Investigación en seguridad y red-teaming**: permite probar respuestas a prompts malintencionados para evaluar riesgos de sesgos o alucinaciones en modelos abiertos.
- **Asistentes de chat personalizados**: desplegado con Ollama o LM Studio, puede usarse en entornos locales donde el usuario quiere control total sobre el contenido.
- **Generación de código con explicaciones**: gracias a su tamaño y a la base Qwen, puede asistir en programación, aunque se recomienda validar el código generado.
- **Análisis de documentos extensos**: con una ventana de contexto larga (si se confirma), podría procesar informes o libros completos.
- **Prototipado de aplicaciones de lenguaje**: para desarrolladores que quieren experimentar con modelos sin restricciones en entornos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Dado que es una cuantización de un modelo derivado, se espera un rendimiento similar al Qwen3-27B original, pero con posibles degradaciones por la cuantización y la modificación de pesos.

## Requisitos de hardware

- **VRAM estimada**:
  - Q4_K_M: ~16-17 GB de VRAM (para inferencia en GPU)
  - Q8_0: ~27 GB de VRAM
  - F16: ~54 GB de VRAM
- **GPU recomendadas**: RTX 4090 (24 GB) puede ejecutar Q4_K_M; A100 (40/80 GB) para Q8_0 o F16.
- **Consumer GPU**: sí, con cuantizaciones Q4 y Q5 en tarjetas de 16-24 GB.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, text-generation-webui.
- **Latencia y throughput**: dependen del hardware; en una RTX 4090 con Q4_K_M, se puede esperar ~20-40 tokens/s, pero no hay datos confirmados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el contexto de esta cuantización específica. Sin embargo, se puede comparar con el Qwen3-27B oficial (sin abliteration) y con otros modelos abliterated de la misma familia, pero no hay datos concretos.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: el proceso de abliteration no elimina los sesgos inherentes del modelo base, y puede aumentar la probabilidad de alucinación al reducir la auto-censura.
- **Riesgo de contenido inapropiado**: al ser un modelo sin censura, puede generar contenido ofensivo, violento o ilegal. Debe usarse con responsabilidad.
- **Licencia**: la licencia no está clara; el repo no la especifica, aunque otros repos del mismo autor usan Apache-2.0. Verificar antes de uso comercial.
- **Idiomas**: no se ha confirmado la cobertura de idiomas; probablemente el inglés es el principal.
- **Contexto**: no se sabe la longitud exacta; si es 128K (como Qwen3), puede haber degradación en contextos muy largos por la cuantización.
- **Producción**: no recomendado para producción sin una evaluación exhaustiva de seguridad y calidad.

## Enlaces

- [HuggingFace - mradermacher/Qwen3.8-27B-Abliterated-SFT-GGUF](https://huggingface.co/mradermacher/Qwen3.8-27B-Abliterated-SFT-GGUF)
- [Modelo base: azukivc/Qwen3.8-27B-Abliterated-SFT](https://huggingface.co/azukivc/Qwen3.8-27B-Abliterated-SFT)
- [Otro repo del mismo autor con licencia Apache-2.0](https://huggingface.co/mradermacher/Qwen3.8-27B-ABLITERATED-BF16-i1-GGUF)
- [GitHub de un usuario con el mismo modelo](https://github.com/Wassimyounes01/qwen38-uncensored)
- [Modelo similar en ModelScope](https://www.modelscope.cn/models/douyamv/Qwen3.8-27B-abliterated-GGUF)
