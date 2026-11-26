# maomao1714/Sulphur-3

## Resumen

Sulphur 3 es un ajuste fino (fine-tune) del modelo MiniMax-H3 desarrollado por el usuario maomao1714 bajo el seudónimo FusionCow. Se presenta como un modelo de generación de vídeo sin filtros de censura ("uncensored"), construido sobre la arquitectura del modelo base de MiniMaxAI. El repositorio incluye los pesos completos en formato safetensors, variantes cuantizadas para menor consumo de VRAM y un fichero "corrector" opcional con nodos y flujo de trabajo para ComfyUI.

El modelo se distribuye con la librería `minimax-h3` y depende directamente de la infraestructura de inferencia del modelo original de MiniMax. Su relevancia es limitada y de nicho: se trata de un checkpoint comunitario sin métricas publicadas, sin datos de entrenamiento documentados y con cero descargas en el momento de la ficha. El tamaño del repositorio (276,5 GB) refleja la inclusión de múltiples variantes de pesos completos, no un modelo de ese tamaño por sí mismo.

La información disponible es escasa: la model card no detalla arquitectura, número de parámetros, contexto ni composición del dataset de ajuste. Todo lo que se puede afirmar con rigor deriva del modelo base declarado (MiniMax-H3) y de los ficheros listados en el repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de MiniMax-H3; no se especifica en la model card) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | variantes cuantizadas incluidas en `quantized/` (formatos concretos no especificados) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license |
| Formato de pesos | safetensors (`s3.safetensors`, `s3_raw.safetensors`, `s3_ref2va.safetensors`, `s3_raw_lora.safetensors`, `s3_corrector.safetensors`) |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna del modelo. Se declara explícitamente como un derivado de MiniMaxAI/MiniMax-H3, por lo que hereda la arquitectura y el pipeline de inferencia del modelo base; cualquier detalle técnico sobre atención, tipo de transformer o mecanismos de generación debe consultarse en la documentación de MiniMax-H3, no en este repositorio.

Respecto al entrenamiento, la única información disponible es que `s3.safetensors` incorpora un "RL lora" (según la descripción del fichero `s3_raw.safetensors`, que se presenta como "Sulphur 3 without the RL lora"). No se especifican número de tokens de ajuste, composición del dataset, método de alineación (RLHF, DPO u otro) ni hiperparámetros. La variante `s3_ref2va.safetensors` se describe como "Ref2VA variant, not trained", es decir, no entrenada. El repositorio incluye además un fichero corrector opcional (`s3_corrector.safetensors`) con nodos de ComfyUI, que según el autor también funciona con otros modelos H3.

## Capacidades

- Generación de vídeo: es la función principal declarada del modelo, como derivado de un modelo de generación de vídeo (MiniMax-H3).
- Generación sin censura: el autor la presenta explícitamente como "uncensored", lo que implica ausencia de filtros de contenido en la salida.
- Variante Ref2VA: se incluye un fichero `s3_ref2va.safetensors` etiquetado como variante Ref2VA, aunque el autor indica que no está entrenada.
- Corrector opcional: soporte de un fichero corrector con nodos y flujo de trabajo para ComfyUI, compatible también con otros modelos H3.
- Capacidades de texto, razonamiento, código, tool calling, agentes o multilingüismo: no disponibles en la información proporcionada.

## Casos de uso

- Generación de vídeo creativo sin restricciones de contenido: el modelo se ejecuta como cualquier MiniMax-H3 y produce clips de vídeo; su orientación "uncensored" lo hace adecuado para proyectos creativos o de investigación que requieran contenido que los filtros estándar bloquean, siempre dentro del marco legal aplicable.
- Integración en flujos ComfyUI: gracias al paquete `S3_ComfyUI.zip`, se puede montar un pipeline de generación de vídeo con nodos personalizados y aplicar el corrector opcional para mejorar la coherencia de la salida.
- Investigación sobre alineación y censura en modelos generativos: al existir una variante con y sin el "RL lora" (`s3.safetensors` frente a `s3_raw.safetensors`), permite comparar el efecto del ajuste por refuerzo sobre el comportamiento del modelo.
- Despliegue en hardware limitado: las variantes de `quantized/` permiten ejecutar el modelo en GPUs con menos VRAM que las necesarias para los pesos completos, facilitando pruebas en estaciones de trabajo locales.
- Desarrollo de merges comunitarios: el autor recomienda los merges de TenStrip, de modo que Sulphur 3 puede servir como componente base para la creación de checkpoints combinados por la comunidad.
- Evaluación comparativa de checkpoints H3: al compartir base con MiniMax-H3 y con otros derivados, permite experimentos controlados sobre el efecto del fine-tune en la calidad y el estilo del vídeo generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 276,5 GB e incluye varios pesos completos; el fichero principal `s3.safetensors` por sí solo requiere una GPU de gama alta o varias GPUs, pero no se especifica la cifra exacta.
- GPU recomendadas: no disponible. Por el tamaño del repositorio y la naturaleza del modelo base, se presume necesaria al menos una GPU profesional (A100/H100) para los pesos completos, pero no hay confirmación en la información proporcionada.
- Compatibilidad con GPU de consumo: las variantes de `quantized/` están pensadas para reducir el consumo de VRAM, pero no se detallan los requisitos mínimos ni qué GPUs consumer son suficientes.
- Opciones de despliegue: ComfyUI (con los nodos incluidos en `S3_ComfyUI.zip`) y el pipeline estándar de la librería `minimax-h3`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sulphur 3 | MiniMax-H3 | no disponible | no disponible | minimax-h3-community-license | Hugging Face (0 descargas) |
| MiniMax-H3 (original) | — | no disponible en esta ficha | no disponible en esta ficha | licencia de MiniMax | Hugging Face (MiniMaxAI) |
| Merges de TenStrip | MiniMax-H3 | no disponible | no disponible | según el autor del merge | Hugging Face (TenStrip) |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no hay datos de arquitectura, parámetros, contexto ni entrenamiento, lo que impide evaluar el modelo con rigor.
- Cero validación comunitaria: 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso o evaluación independiente.
- Modelo "uncensored": la eliminación de filtros implica riesgo de generar contenido ilegal, dañino o no apto para según qué contextos; el despliegue en producción exige controles adicionales y revisión legal.
- Riesgo de alucinación y artefactos: no documentado, pero inherente a los modelos generativos de vídeo sin métricas publicadas.
- Licencia restrictiva: la minimax-h3-community-license puede imponer condiciones al uso comercial; debe revisarse el fichero `LICENSE` antes de cualquier despliegue productivo.
- Idiomas y cobertura: no disponibles; no se puede garantizar soporte multilingüe ni de dominios concretos.
- Variante Ref2VA no entrenada: `s3_ref2va.safetensors` no debe usarse esperando calidad, según el propio autor.
- Ficheros experimentales: el directorio `experimental/` se desaconseja explícitamente por el autor.
- Fecha de creación futura (2026-11-26): inconsistencia en los metadatos que conviene verificar antes de confiar en el repositorio.

## Enlaces

- [Hugging Face: maomao1714/Sulphur-3](https://huggingface.co/maomao1714/Sulphur-3)
- [Modelo base: MiniMaxAI/MiniMax-H3](https://huggingface.co/MiniMaxAI/MiniMax-H3)
- [X del autor: @FusionCow11](https://x.com/FusionCow11)
- [Discord del autor](https://discord.gg/C3d56f39Ah)
- [Merges de TenStrip](https://huggingface.co/TenStrip)
