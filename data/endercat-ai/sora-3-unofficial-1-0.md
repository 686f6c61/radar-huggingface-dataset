# endercat-ai/sora-3-unofficial-1.0

## Resumen

`endercat-ai/sora-3-unofficial-1.0` es un repositorio alojado en Hugging Face por el usuario `endercat-ai` que, por su nombre y por el contenido de su model card, se presenta como una suerte de versión "no oficial" de un modelo de generación de vídeo. Sin embargo, la model card no describe ningún modelo propio: reproduce el README del proyecto **Open-Sora** de hpcaitech (ColossalAI), un initiative open source para generación eficiente de vídeo. El repositorio tiene 0 descargas, 0 likes, un tamaño de 0.0 GB y fue creado el 23 de noviembre de 2026, lo que sugiere que no contiene pesos reales ni un pipeline funcional.

El contenido referenciado corresponde a Open-Sora, cuyo modelo más reciente citado es **Open-Sora 2.0** (11B parámetros), publicado en marzo de 2025 y entrenado con un coste declarado de 200.000 USD. Open-Sora 2.0 se compara, según el propio README, con HunyuanVideo (11B) y Step-Video (30B) en VBench y preferencia humana. Versiones anteriores incluyen Open-Sora 1.0 (marzo 2024), 1.1 (abril 2024), 1.2 (junio 2024) y 1.3 (febrero 2025, 1B).

La relevancia de esta ficha es fundamentalmente advertir que el repositorio `endercat-ai/sora-3-unofficial-1.0` no es un modelo utilizable: no hay pesos, no hay licencia declarada, no hay idiomas declarados y no hay pipeline. Cualquier evaluación técnica debe remitirse al proyecto Open-Sora original de hpcaitech.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el README referenciado describe un transformer de difusión con VAE 3D para generación de vídeo, pero no se especifica para este repo) |
| Parametros totales | no disponible (el README menciona 11B para Open-Sora 2.0 y 1B para Open-Sora 1.3, no aplicable a este repo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (tamaño del repo: 0.0 GB, sin pesos) |

## Arquitectura y entrenamiento

No hay información sobre la arquitectura del modelo alojado en este repositorio. El README citado pertenece a Open-Sora, que emplea un pipeline de generación de vídeo con VAE 3D, rectified flow y score condition (introducidos en Open-Sora 1.2), y un transformer escalado hasta 11B parámetros en la versión 2.0. El entrenamiento de Open-Sora 2.0 se declara con un coste de 200.000 USD, pero no se detalla en el material proporcionado el número de tokens, la composición del dataset ni si hubo RLHF/DPO.

Para este repositorio en concreto no se dispone de datos de entrenamiento, dataset, innovaciones técnicas ni proceso de alineación. No se debe asumir que los detalles de Open-Sora aplican a `sora-3-unofficial-1.0`.

## Capacidades

- No disponible. El repositorio no declara pipeline, pesos ni funcionalidad.
- El README referenciado describe generación de vídeo texto-a-vídeo, imagen-a-vídeo, vídeo-a-vídeo y generación de tiempo infinito para Open-Sora 1.1, y texto-a-imagen, pero estas capacidades corresponden al proyecto Open-Sora, no a este repositorio.
- No se declara soporte de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No se declaran capacidades multilingües.

## Casos de uso

- No disponible. Al no haber pesos ni pipeline declarados, no se puede recomendar ningún caso de uso para este repositorio.
- Evaluación de procedencia de artefactos: usar este repo como caso de estudio para detectar repositorios que replican READMEs de terceros sin pesos ni licencia.
- Auditoría de licencias: comprobar que un repo sin licencia declarada no debe integrarse en producción.
- Remisión al proyecto original: para generación de vídeo, acudir a hpcaitech/Open-Sora.
- No aplicable: generación de vídeo, texto-a-vídeo, imagen-a-vídeo, atención al cliente, generación de código, agentes.
- No aplicable: despliegue en producción, fine-tuning o inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este repositorio. El README referenciado menciona comparaciones de Open-Sora 2.0 (11B) con HunyuanVideo (11B) y Step-Video (30B) en VBench y preferencia humana, pero no se proporcionan cifras concretas en el material disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (repo de 0.0 GB, sin pesos).
- GPU recomendadas: no disponible para este repositorio.
- Si cabe en consumer GPU: no disponible.
- Opciones de despliegue: no disponible (no se declara vLLM, llama.cpp, Ollama, TGI ni diffusers).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| endercat-ai/sora-3-unofficial-1.0 | no disponible | no disponible | no disponible | no disponible | repo de 0.0 GB, 0 descargas |
| Open-Sora 2.0 (hpcaitech) | 11B | no disponible | paridad declarada con HunyuanVideo 11B y Step-Video 30B en VBench y preferencia humana | no disponible en el material | checkpoints y código de entrenamiento publicados |
| Open-Sora 1.3 (hpcaitech) | 1B | no disponible | mejora de calidad declarada con VAE y transformer actualizados | no disponible en el material | checkpoints publicados |
| HunyuanVideo | 11B | no disponible | referencia de comparación en VBench | no disponible en el material | citado en el README de Open-Sora |
| Step-Video | 30B | no disponible | referencia de comparación en VBench | no disponible en el material | citado en el README de Open-Sora |

## Limitaciones y advertencias

- El repositorio no contiene pesos (tamaño 0.0 GB): no es desplegable ni utilizable para inferencia.
- No declara licencia: riesgo legal para cualquier uso, incluido el comercial.
- No declara idiomas ni pipeline: no se puede verificar compatibilidad con transformers, diffusers ni ninguna librería.
- El nombre "sora-3-unofficial" sugiere una afiliación con OpenAI Sora que no está respaldada por el contenido; es un artefacto de terceros.
- La model card replica el README de Open-Sora de hpcaitech, lo que puede inducir a error sobre autoría y procedencia.
- Sin descargas ni likes, no hay evidencia de uso comunitario ni validación externa.
- Riesgo de alucinación y sesgos: no evaluable al no existir modelo funcional.
- No usar este repositorio como referencia técnica de Open-Sora; acudir siempre a la fuente original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/endercat-ai/sora-3-unofficial-1.0
- Proyecto Open-Sora (GitHub): https://github.com/hpcaitech/Open-Sora
- Open-Sora Tech Report 2.0 (arXiv): https://arxiv.org/abs/2503.09642v1
- Open-Sora Tech Report 1.2 (arXiv): https://arxiv.org/abs/2412.20404
- Galería Open-Sora: https://hpcaitech.github.io/Open-Sora/
- Demo Gradio Open-Sora: https://huggingface.co/spaces/hpcai-tech/open-sora
- Discord Open-Sora: https://discord.gg/kZakZzrSUT
- Slack ColossalAI: https://join.slack.com/t/colossalaiworkspace/shared_invite/zt-247ipg9fk-KRRYmUl~u2ll2637WRURVA
- Blog Open-Sora 1.0: https://hpc-ai.com/blog/open-sora-v1.0
- Blog reducción de costes: https://hpc-ai.com/blog/open-sora
