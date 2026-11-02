# junkdogjoe/LFM3-Partial-Omni-1.7B-Q_8_0

## Resumen

LFM3-Partial-Omni-1.7B-Q_8_0 es un modelo derivado publicado por el usuario junkdogjoe en HuggingFace, construido a partir de LiquidAI/LFM3-1.7B-Base. Se trata de un experimento personal, tal y como declara el propio autor en la model card, en el que se han fusionado algunas capas del modelo base con capas procedentes de LFM3-Omni-2B en cuantización Q8_0, con el objetivo de habilitar entrada multimodal (visión, texto y voz) mediante el uso de un fichero `.mmproj` en llama.cpp. El autor lo describe explícitamente como un "primer proyecto" hecho "por diversión", sin proceso de validación formal.

El modelo se distribuye en formato GGUF con cuantización Q8_0, con un tamaño de repositorio de 2,8 GB, y está pensado para inferencia en el borde (edge) con llama.cpp. La arquitectura subyacente es la de LFM3 de Liquid AI, una familia de modelos diseñada para despliegue eficiente en dispositivos con recursos limitados. El contexto, los datos de entrenamiento y los detalles de la fusión de capas no están documentados más allá de las notas informales del autor.

La relevancia de esta ficha es limitada desde el punto de vista de producción: se trata de un artefacto experimental, sin benchmarks publicados, sin garantías de estabilidad y con una model card que reconoce volatilidad y falta de pruebas. Resulta útil únicamente como referencia de técnicas de fusión de capas y de uso de proyectores multimodales en llama.cpp, no como modelo recomendado para aplicaciones reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de LFM3 (Liquid AI); fusión de capas con LFM3-Omni-2B; no se detalla la arquitectura interna exacta |
| Parametros totales | 47.104 (dato de safetensors del repo, aparentemente incompleto o erróneo); el modelo base es de 1.7B |
| Parametros activos | no disponible (no es MoE según la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF); el autor menciona también Q8_0 para los modelos de origen |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (licencia "other" en HuggingFace, con enlace a LICENSE) |
| Formato de pesos | GGUF (repo de 2,8 GB); requiere `mmproj-LFM3-Omni-2B-F16.gguf` y `control-vector.gguf` para el modo multimodal |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B-Base, un transformer de la familia LFM3 de Liquid AI orientado a despliegue en el borde. Según la model card, el autor tomó la versión Q8_0 de ese modelo base y fusionó "algunas capas" con capas de LFM3-Omni-2B-Q8_0 para poder emplear el proyector multimodal `.mmproj` de este último. Adicionalmente se aplica un `control-vector.gguf` con escala 0,77, cuyo propósito el autor describe de forma ambigua ("lo empuja un poco hacia algún sitio").

No se documenta ningún proceso de entrenamiento adicional: no hay datos sobre tokens de entrenamiento, composición del dataset, RLHF, DPO ni ajuste fino supervisado. La fusión de capas se realizó sin una metodología publicada; el propio autor afirma que no sabe explicar cómo lo hizo porque consultó a un LLM. No hay innovaciones técnicas verificables más allá del uso de un proyector multimodal externo en llama.cpp.

## Capacidades

- Generación de texto conversacional, heredada del modelo base LFM3-1.7B.
- Entrada multimodal parcial: el autor indica que soporta visión, texto y voz mediante el `.mmproj` de LFM3-Omni-2B, aunque advierte que el modelo "no se da cuenta" de que tiene capacidades multimodales.
- Razonamiento: el autor afirma que es "un poco más rápido y listo en razonamiento" que el base, sin datos que lo respalden.
- Soporte multilingüe para 16 idiomas (en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- Experimentación con fusión de capas en llama.cpp: sirve como caso práctico para estudiar cómo se combinan capas de dos modelos GGUF y cómo se integra un proyector multimodal externo, aunque sin garantías de reproducibilidad.
- Pruebas de concepto de entrada multimodal en el borde: permite validar el flujo `--mmproj` de llama.cpp con un modelo de 1,7B en hardware modesto, aceptando que el modelo no reconoce de forma fiable su propia capacidad multimodal.
- Evaluación comparativa de control vectors: el uso de `control-vector.gguf` con escala 0,77 permite experimentar con la modulación de estilo o comportamiento en inferencia, sin documentación sobre el efecto real.
- Docencia y divulgación sobre cuantización GGUF: útil para explicar las diferencias entre Q8_0 y otros formatos y el papel de los proyectores multimodales, dado su reducido tamaño (2,8 GB).
- Pruebas de robustez y alucinación: al ser un modelo "volátil y sin probar", puede emplearse en ejercicios de evaluación de fiabilidad y de detección de fallos en modelos derivados.
- Prototipado descartable en local: para demos rápidas en portátil con llama.cpp donde no se requiera precisión ni estabilidad, aceptando los riesgos de un artefacto no validado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en Q8_0, un modelo de ~1,7B ocupa aproximadamente 1,8-2,0 GB de pesos; con overhead de contexto y el proyector multimodal F16, se recomienda reservar 3-4 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo está pensado para hardware modesto.
- Cabe en GPU de consumo: sí, en la mayoría de GPU consumer con 4 GB o más; también puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (el autor proporciona flags de muestreo específicos); compatible con endpoints de HuggingFace según los tags, pero no se documenta soporte en vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles; el autor afirma que es "un poco más rápido" que el base, sin mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-Partial-Omni-1.7B-Q_8_0 | ~1.7B (base) | no disponible | lfm1.0 | GGUF Q8_0 | Derivado experimental, sin benchmarks |
| LiquidAI/LFM3-1.7B-Base | 1.7B | no disponible | lfm1.0 | safetensors | Modelo base oficial, sin fusión de capas |
| LFM3-Omni-2B | ~2B | no disponible | lfm1.0 | GGUF Q8_0 | Fuente del proyector multimodal y de las capas fusionadas |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental y no validado: el autor lo describe como "volátil y sin probar".
- El modelo no reconoce de forma fiable sus capacidades multimodales, lo que puede provocar respuestas incoherentes ante entradas de imagen o audio.
- Riesgo elevado de alucinación y de comportamiento impredecible por la fusión no documentada de capas y el uso de un control vector sin justificar.
- Sin benchmarks, sin evaluación de sesgos y sin datos de entrenamiento publicados.
- La licencia lfm1.0 ("other") impone restricciones que deben revisarse antes de cualquier uso comercial; no se detallan en la información disponible.
- El dato de parámetros totales del repo (47.104) es inconsistente con el tamaño del modelo base y probablemente erróneo; no debe usarse para estimar requisitos.
- No hay soporte documentado para tool calling, agentes ni despliegue en servidores de inferencia distintos de llama.cpp.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/junkdogjoe/LFM3-Partial-Omni-1.7B-Q_8_0
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Modelo Omni de referencia: no disponible (no se proporciona enlace directo a LFM3-Omni-2B)
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Licencia LFM1.0: incluida en el repositorio como fichero LICENSE
