# NorviTech/armiger-ultra

## Resumen

Armiger Ultra es un clasificador de metadatos de BitTorrent desarrollado por NorviTech. No es un modelo generativo de propósito general, sino un sistema especializado que combina un transformer byte-level con codificación posicional RoPE y un conjunto de especialistas hermanos ("OOF sibling specialists") para predecir categorías de contenido, detectar junk/malware y estimar disponibilidad de swarm a partir de los metadatos de un torrent. Se distribuye como ficheros ONNX (FP32 de 33,9 MB e INT8 de 8,9 MB) y está diseñado para ejecutarse íntegramente en CPU, sin necesidad de GPU ni de API de inferencia de pago.

El modelo se enmarca en el ecosistema Armiger, que incluye conectores para indexadores como Bitmagnet y Rats Search, y una aplicación Docker autocontenida. Su relevancia actual radica en que aborda un problema de producción concreto (clasificación y filtrado de metadatos en indexadores P2P) con un consumo de recursos muy bajo: según la model card, procesa 5,134 ms por fila en lotes de 32 con un pico de RSS de 1.531 MiB, lo que lo hace viable en hardware modesto.

La versión documentada es el bundle 3.15.4 (`v5.4-pareto`), con licencia Apache-2.0 y soporte declarado para nueve idiomas (en, ja, fr, de, es, it, ru, ko, zh). El repositorio ocupa 1,0 GB y acumula 890 descargas y 11 likes en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer byte-level con RoPE + combinador híbrido vectorizado y especialistas hermanos OOF (`v5.4-pareto`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (33,9 MB) e INT8 (8,9 MB) |
| Idiomas soportados | en, ja, fr, de, es, it, ru, ko, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura combina un transformer que opera sobre bytes (byte-level) con codificación posicional RoPE, complementado por un combinador híbrido vectorizado y un conjunto de especialistas hermanos entrenados con esquema out-of-fold (OOF). El modelo no se limita a la predicción neuronal: integra reglas de idioma de metadatos, calibración, cribado Policy-2 de junk/malware y estimación de disponibilidad de swarm, además de coincidencia contra autoridades externas compactas. El resultado es un pipeline de clasificación híbrido que produce predicciones neuronales y flags de política en una sola pasada.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card sí documenta una evaluación "sealed" post-freeze sobre un holdout prospectivo de 2.795 filas (1.500 de producción uniforme y 1.295 de estrés difícil), con adjudicación ciega por doble proveedor y verificación de que el conjunto no se había abierto antes del freeze. Destaca la paridad FP32/INT8 del 99,8927% (2.792/2.795) y la integridad de roundtrip UTF-8 en 2.795/2.795 spans.

## Capacidades

- Clasificación de metadatos de torrents en categorías de contenido (incluida la categoría multi-fichero `game`).
- Detección de junk estructural y semántico mediante el cribado Policy-2.
- Cribado de malware y contenido honeypot como flags de política.
- Predicción de disponibilidad de swarm (swarm-availability estimates).
- Coincidencia contra autoridades externas y aplicación de reglas de idioma de metadatos.
- Calibración de salidas y abstención ante casos ambiguos.
- Soporte multilingüe en nueve idiomas para los metadatos analizados.
- Ejecución en CPU sin GPU ni API de pago.
- Integración con indexadores (Bitmagnet, Rats Search) mediante conectores.

## Casos de uso

- Filtrado de admisión en indexadores BitTorrent: el modelo evalúa cada metadato antes de publicarlo y aplica el cribado Policy-2; la model card reporta una admisión BitAgent del 99,000% con cero fugas de junk en el holdout de producción.
- Moderación de contenido en plataformas P2P: los flags de adult-content, honeypot y junk permiten bloquear o marcar entradas automáticamente antes de que lleguen al usuario final.
- Enriquecimiento de catálogos de medios: la clasificación por categoría (audio, subtítulos, juegos, etc.) permite etiquetar y organizar automáticamente grandes volúmenes de metadatos.
- Estimación de salud de swarm: las predicciones de disponibilidad ayudan a priorizar resultados con mayor probabilidad de descarga efectiva en buscadores de torrents.
- Despliegue en infraestructura modesta: al ejecutarse en CPU con 8,9 MB en INT8 y 5,134 ms/fila en batch-32, puede integrarse en contenedores Docker de un solo nodo sin acelerador.
- Pipeline de seguridad en gateways de descarga: el cribado de malware y la detección de honeypots permiten añadir una capa de decisión previa a la entrega de metadatos a clientes.
- Clasificación por lotes a gran escala: el soak de 32.768 filas con un delta máximo de 5,92 MiB de RSS demuestra estabilidad para procesamiento continuo.

## Benchmarks y rendimiento

| Metrica | Armiger Ultra 3.15.4 | v3.12.0 | Diferencia |
|---|---|---|---|
| Producción uniforme (N=1.500) | 94,133% | 85,933% | +8,200 pp (McNemar p=3,05e-25) |
| Producción + estrés (N=2.795) | 92,630% | 72,057% | +20,572 pp (p=1,19e-136) |
| Admisión BitAgent | 99,000% | 98,800% | +0,200 pp (0 fugas de junk) |
| Junk estructural Policy-2 (producción) | 100,00% (140/140) | no disponible | no disponible |
| Junk estructural Policy-2 (combinado) | 98,99% (394/398) | no disponible | no disponible |
| Junk semántico (combinado) | 91,55% (65/71) | no disponible | no disponible |
| Especificidad de junk limpio (producción) | 99,705% | no disponible | no disponible |
| Especificidad de junk limpio (combinado) | 99,570% | no disponible | no disponible |
| Paridad FP32/INT8 | 99,8927% (2.792/2.795) | no disponible | no disponible |
| Roundtrip UTF-8 | 2.795/2.795 | no disponible | no disponible |
| Latencia CPU batch-32 p50 | 5,134 ms/fila | 21,881 ms/fila | 4,26x más rápido |
| Pico de RSS | 1.531 MiB | 2.762 MiB | -1,20 GiB |
| Categoría `game` multi-fichero (R22-live) | 93,33% (112/120) | 95,00% (114/120) | -1,67 pp |

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está diseñado para inferencia en CPU.
- GPU recomendadas: no requiere GPU. En caso de ejecutarse sobre GPU, no se documentan requisitos.
- Cabe en cualquier CPU consumer: el fichero INT8 ocupa 8,9 MB y el FP32 33,9 MB.
- Memoria RAM: pico de RSS de 1.531 MiB en la evaluación batch-32; delta máximo de 5,92 MiB en un soak de 32.768 filas.
- Opciones de despliegue: ONNX Runtime (formato nativo), contenedor Docker oficial `ghcr.io/spencernorton/armiger-ultra:3.15.4`, integración con Bitmagnet y Rats Search mediante conectores.
- Latencia y throughput: 5,134 ms por fila en batch-32 (p50) en CPU, según la model card.
- Canal de actualización configurable mediante la variable `ARMIGER_UPDATE_CHANNEL` (`off` mantiene el modelo fijado al bundle incluido).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Armiger Ultra (NorviTech) | Clasificador de metadatos BitTorrent (byte-level transformer + híbrido) | no disponible | no disponible | Apache-2.0 | ONNX (FP32/INT8) | 94,133% en producción uniforme; CPU-only |
| Armiger Standalone (NorviTech) | Clasificador INT8 enfocado | no disponible | no disponible | Apache-2.0 | ONNX INT8 | Versión reducida del mismo ecosistema |
| Alternativas genéricas de clasificación de texto | Transformer de texto | variable | variable | variable | safetensors/ONNX | No especializadas en metadatos BitTorrent ni en cribado Policy-2 |

No se dispone en la información proporcionada de modelos de terceros directamente comparables en la tarea específica de clasificación de metadatos BitTorrent con cribado de junk/malware y estimación de swarm.

## Limitaciones y advertencias

- El modelo clasifica únicamente los metadatos suministrados; no inspecciona el contenido real de los medios ni certifica su legalidad.
- Las salidas de audio/subtítulos, junk, contenido adulto y honeypot son predicciones o flags de política, no verdades absolutas.
- El rendimiento en la categoría multi-fichero `game` es inferior al de la versión anterior (-1,67 pp, 2 filas netas en archivos comprimidos de juegos indie/VN).
- El junk semántico combinado se sitúa en 91,55% (65/71), por debajo del junk estructural (98,99%), lo que indica mayor dificultad en casos semánticamente ambiguos.
- No se documentan sesgos específicos ni tasas de alucinación (no es un modelo generativo, por lo que el riesgo de alucinación se traduce en falsos positivos/negativos de clasificación).
- No se especifican limitaciones de longitud de contexto ni de idioma más allá de los nueve idiomas declarados.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre la exactitud de las predicciones en producción.
- El modelo depende de reglas y autoridades externas integradas; cambios en esas fuentes pueden alterar el comportamiento sin reentrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/NorviTech/armiger-ultra
- Modelo standalone INT8: https://huggingface.co/NorviTech/armiger
- Repositorio y guías de instalación: https://github.com/spencernorton/armiger
- Release v3.15.4: https://github.com/spencernorton/armiger/releases/tag/v3.15.4
- Conectores para indexadores: https://github.com/spencernorton/Armiger-Connectors
- DH-Waypoint: https://github.com/spencernorton/DH-Waypoint
- Documentación de evaluación: https://github.com/spencernorton/armiger/blob/main/docs/evaluation.md
- Guías de configuración: https://github.com/spencernorton/armiger#choose-your-setup
- Resumen de modelos NorviTech: https://norvitech.com/ai-models/#armiger
