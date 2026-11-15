# agentic-underground/lfm2-350m-to-1.2b-bridge

## Resumen

El modelo `lfm2-350m-to-1.2b-bridge`, publicado por el colectivo agentic-underground, es un artefacto de tipo puente (bridge) que conecta los pesos de dos modelos de la familia LFM2 de Liquid AI: la variante pequena de 350 millones de parametros y la variante grande de 1.2 mil millones. No se trata de un modelo base entrenado desde cero, sino de un adaptador o modulo de transferencia de representaciones latentes entre ambos, segun sugieren las etiquetas `latentport` y `model-bridge`.

El interes tecnico reside en la posibilidad de reutilizar la cache KV y las representaciones internas de un modelo pequeno para alimentar o acelerar la inferencia de uno mayor, sin necesidad de reentrenar el modelo grande. Esto encaja en lineas de investigacion recientes sobre comparticion de estados ocultos entre modelos de distinta escala, referenciadas en el paper `arxiv:2609.25053`.

La relevancia practica es limitada por su naturaleza experimental: cero descargas, cero likes, acceso restringido mediante gating y una licencia LFM1.0 que impone condiciones. No obstante, para investigadores que trabajen en destilacion, reutilizacion de cache o inferencia especulativa entre modelos hermanos, el repositorio ofrece pesos en safetensors (0.1 GB) y metadatos utiles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto de puente entre modelos LFM2; no se especifica la arquitectura interna) |
| Parametros totales | no disponible (el repo pesa 0.1 GB; los modelos base son de 350M y 1.2B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | lfm1.0 (etiqueta `license:other`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del puente. Los tags indican que se apoya en los modelos base `LiquidAI/LFM2-350M` y `LiquidAI/LFM2-1.2B`, ambos de la familia LFM2 de Liquid AI, y que utiliza `kv-cache` y `latentport` como mecanismos de transferencia. La etiqueta `base_model:finetune` sugiere que el artefacto se obtuvo mediante ajuste fino sobre el modelo de 1.2B, probablemente para alinear sus representaciones con las del modelo de 350M.

No hay informacion publica sobre el volumen de datos de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO. La referencia al paper `arxiv:2609.25053` apunta a un trabajo metodologico sobre puentes latentes entre modelos, pero el contenido del paper no esta incluido en la informacion proporcionada.

## Capacidades

- Transferencia de representaciones latentes entre LFM2-350M y LFM2-1.2B.
- Reutilizacion de cache KV entre ambos modelos, segun la etiqueta `kv-cache`.
- Integracion como modulo auxiliar en pipelines de inferencia con modelos hermanos.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, tool calling ni agentes para este artefacto concreto.
- Capacidades multilingues: no disponibles.
- No se documenta modo thinking, vision ni audio.

## Casos de uso

- Investigacion en destilacion entre modelos: usar el puente para mapear estados ocultos del modelo de 350M sobre el de 1.2B y estudiar la transferencia de conocimiento entre escalas.
- Inferencia especulativa entre modelos hermanos: emplear el modelo pequeno como draft y el grande como verificador, aprovechando la cache KV compartida para reducir latencia.
- Reutilizacion de cache en produccion: precargar la cache del modelo de 350M y reutilizarla en el de 1.2B para evitar recomputar prefijos en conversaciones multi-turno.
- Experimentos de alineacion de espacios latentes: analizar como se distribuyen las representaciones de ambos modelos y calibrar transformaciones lineales o no lineales entre ellas.
- Benchmarking de eficiencia: medir el ahorro de computo al evitar recalcular atencion en el modelo grande cuando se dispone de cache del pequeno.
- Prototipado de arquitecturas hibridas: servir como componente en sistemas que alternan entre modelos de distinta escala segun la carga o el presupuesto de latencia.
- Docencia y reproduccion: estudiar tecnicas de model bridging con un artefacto pequeno (0.1 GB) y reproducible en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el puente en si; el repo pesa 0.1 GB, por lo que cabe en cualquier GPU consumer con al menos 1 GB libre.
- GPU recomendadas: no disponible; al depender de los modelos base, se necesitarian recursos acordes a LFM2-1.2B (aproximadamente 2-3 GB en fp16) y LFM2-350M (menos de 1 GB en fp16).
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna (RTX 3060, RTX 4060, RTX 4090) para el artefacto de puente; los modelos base completos requieren algo mas de memoria.
- Opciones de despliegue: no disponible; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| agentic-underground/lfm2-350m-to-1.2b-bridge | no disponible (repo 0.1 GB) | no disponible | lfm1.0 | gated |
| LiquidAI/LFM2-350M | 350M | no disponible | lfm1.0 | publico |
| LiquidAI/LFM2-1.2B | 1.2B | no disponible | lfm1.0 | publico |

No se conocen otros artefactos de puente comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto experimental: cero descargas y cero likes en el momento de la consulta, sin validacion comunitaria.
- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que limita la reproducibilidad inmediata.
- Licencia LFM1.0: impone condiciones especificas para uso comercial; es necesario revisar los terminos antes de desplegarlo en produccion.
- Dependencia de los modelos base: el puente no funciona de forma autonoma; requiere cargar LFM2-350M y LFM2-1.2B.
- Falta de documentacion: no se especifican arquitectura interna, contexto, idiomas ni benchmarks, lo que dificulta evaluar su calidad.
- Riesgo de alucinacion y sesgos: no evaluado en la informacion disponible.
- Sin garantias de mantenimiento: repositorio creado y actualizado el mismo dia (2026-11-15), sin historial posterior.

## Enlaces

- Hugging Face: https://huggingface.co/agentic-underground/lfm2-350m-to-1.2b-bridge
- Modelo base LFM2-350M: https://huggingface.co/LiquidAI/LFM2-350M
- Modelo base LFM2-1.2B: https://huggingface.co/LiquidAI/LFM2-1.2B
- Paper referenciado: arxiv:2609.25053 (sin URL directa en la informacion disponible)
