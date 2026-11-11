# DoubleRabbits/d3-lite-zils-v3

## Resumen

DoubleRabbits/d3-lite-zils-v3 es un ajuste fino (fine-tuning) de tipo LoRA sobre el chasis d3-lite-0.8b-v1, que a su vez deriva de Qwen3.5-0.8B. Lo publica el usuario DoubleRabbits en Hugging Face bajo licencia Apache 2.0 y está orientado, según la model card, a tareas de decisión dentro de lo que el autor denomina "Zils d3-lite soup pool", un conjunto de variantes del mismo modelo base entrenadas con semillas distintas.

El modelo tiene 852.985.920 parámetros (aproximadamente 0,85 mil millones) y se distribuye en formato safetensors con código personalizado (tag `custom_code`), lo que implica que su carga requiere confiar en implementaciones de modelado no estándar publicadas en el repositorio. El repositorio ocupa 1,7 GB.

La relevancia de esta ficha es limitada: se trata de un modelo experimental con cero descargas y cero likes en el momento de la consulta, sin pipeline declarado, sin idiomas especificados y sin resultados de benchmarks. Resulta útil como referencia para quienes exploren el ecosistema de fine-tunes pequeños derivados de Qwen3.5, pero no como candidato directo a producción sin una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (etiqueta `qwen3_5`; se infiere transformer decoder-only del linaje Qwen3.5-0.8B, sin confirmación en la model card) |
| Parametros totales | 852.985.920 |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `custom_code`) |

## Arquitectura y entrenamiento

La model card indica que el modelo se basa en Qwen3.5-0.8B a través del chasis d3-lite-0.8b-v1 y que se entrenó con LoRA de rango 16 sobre 2000 decisiones sintéticas con semilla 2. No se especifica la composición del dataset, el número de tokens, la longitud de las secuencias ni si hubo etapas de RLHF o DPO. Tampoco se detalla si el LoRA se fusionó con los pesos base o si se distribuye por separado; el recuento de parámetros del safetensors (852.985.920) sugiere pesos completos fusionados, aunque esto no se confirma explícitamente.

El tag `custom_code` en el repositorio es el dato técnico más relevante: implica que la arquitectura no se carga con una clase estándar de Transformers sin más, sino que requiere el código incluido en el repo o `trust_remote_code=True`. No se documentan innovaciones como decodificación especulativa, atención lineal o modos de razonamiento extendido.

## Capacidades

- Generación de texto y toma de decisiones: el entrenamiento se describe como "decision model", orientado a producir decisiones ante entradas dadas, no a conversación general.
- Ajuste específico sobre un dominio sintético: las 2000 decisiones sintéticas delimitan un comportamiento estrecho y difícil de extrapolar.
- Capacidades heredadas del base Qwen3.5-0.8B: no verificadas ni documentadas en esta model card; no hay confirmación de tool calling, agentes, matemáticas o código.
- Multilingüismo: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Prototipado de clasificadores de decisión: el modelo puede servir como punto de partida para experimentar con políticas de decisión simples en entornos controlados, dado su tamaño reducido y su entrenamiento específico en decisiones sintéticas.
- Investigación sobre fine-tuning LoRA: útil como ejemplo reproducible de un ajuste de rango 16 sobre un base de 0,8B, para estudiar cómo afecta el entrenamiento sintético al comportamiento del modelo.
- Evaluación de linajes de fine-tunes: dentro de un estudio comparativo de las variantes "d3-lite soup pool", permite analizar la variabilidad introducida por la semilla de entrenamiento.
- Pruebas de integración con `custom_code`: sirve para validar pipelines de carga con `trust_remote_code=True` y detectar riesgos de seguridad en repositorios con código personalizado.
- Experimentos de destilación o imitación: al ser un modelo pequeño entrenado sobre datos sintéticos, puede usarse como generador de datos de decisión para entrenar modelos aún más pequeños.
- Docencia y demostraciones: su tamaño permite ejecutarlo en hardware modesto para ilustrar el ciclo completo de un fine-tuning publicado en Hugging Face.

En ningún caso se recomienda su uso en atención al cliente, generación de código en producción ni agentes autónomos sin una evaluación previa, dado que no hay evidencia de dichas capacidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 2 y 3 GB para contextos cortos.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9-1,2 GB; en 4 bits, alrededor de 0,5-0,8 GB (estimaciones teóricas, no verificadas para este modelo).
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM debería bastar en fp16 para contextos cortos; RTX 3060, RTX 4060, RTX 4090 o superiores son holgadas. En entornos profesionales, A100 o H100 no aportan ventaja significativa por el tamaño del modelo.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de tarjetas con 4 GB o más, sujeto a la disponibilidad de kernels para el `custom_code`.
- Opciones de despliegue: no documentadas. La presencia de `custom_code` complica el uso con vLLM, llama.cpp, Ollama o TGI, que requieren soporte específico de la arquitectura; la vía más segura es Transformers con `trust_remote_code=True`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DoubleRabbits/d3-lite-zils-v3 | 852.985.920 | No disponible | Apache 2.0 | Hugging Face, 0 descargas | Fine-tune LoRA r16 sobre decisiones sintéticas, `custom_code` |
| Qwen3.5-0.8B (base) | ~0,8B | No disponible en esta ficha | Según el modelo original de Qwen | Ampliamente disponible | Modelo base del que deriva; capacidades generales documentadas por su autor |
| d3-lite-0.8b-v1 (chasis) | No disponible | No disponible | No disponible | Referenciado en la model card | Chasis intermedio del linaje; sin ficha pública verificada en la información disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- Entrenamiento sobre 2000 decisiones sintéticas con una única semilla: riesgo alto de sobreajuste al dominio sintético y de comportamiento errático fuera de él.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia objetiva de calidad, seguridad o robustez.
- `custom_code` en el repositorio: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; auditar antes de usar en producción.
- Idiomas no declarados: no se puede asumir soporte multilingüe ni siquiera en inglés.
- Contexto no documentado: no se puede planificar su uso en tareas de contexto largo.
- Riesgo de alucinación: no evaluado; en modelos pequeños con fine-tuning estrecho suele ser elevado.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de garantías y de documentación traslada toda la responsabilidad de validación al integrador.
- Cero descargas y cero likes: sin comunidad que haya reportado problemas o mejoras; el soporte es nulo.
- Fecha de creación en 2026: verificar la vigencia del linaje Qwen3.5 y la compatibilidad con versiones actuales de Transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DoubleRabbits/d3-lite-zils-v3
- Modelo base referenciado (Qwen3.5-0.8B): no disponible en la información proporcionada
- Chasis d3-lite-0.8b-v1: no disponible en la información proporcionada
- Paper, blog o demo: no disponibles
