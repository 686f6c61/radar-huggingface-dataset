# orz99/Sulphur-3

## Resumen

Sulphur 3 es un ajuste fino (fine-tune) del modelo MiniMax H3, desarrollado por el usuario orz99, orientado a la generación de vídeo sin censura. El modelo se distribuye como un checkpoint completo en formato safetensors (`s3.safetensors`) que se ejecuta exactamente igual que cualquier modelo MiniMax H3, lo que facilita su adopción por parte de usuarios que ya dispongan de un pipeline funcional para la familia H3. El repositorio incluye además variantes como `s3_raw` (sin la LoRA de RL), una variante Ref2VA no entrenada y un fichero corrector opcional con nodos y workflow para ComfyUI.

La relevancia del modelo radica en su enfoque: se trata de un derivado "uncensored" de un modelo base de generación de vídeo, pensado para casos donde los filtros del modelo original limitan la expresividad creativa. Al mantener la compatibilidad directa con MiniMax H3, el modelo hereda la arquitectura y el pipeline de inferencia del original, y su licencia es la MiniMax H3 Community License, que impone restricciones específicas de uso.

No se dispone de información pública sobre el número de parámetros, la longitud de contexto, los idiomas soportados ni los detalles del dataset de ajuste. El tamaño del repositorio (276,5 GB) sugiere un modelo de gran escala con múltiples variantes de pesos, pero no permite inferir la cifra exacta de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de MiniMax H3) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | versiones cuantizadas de menor VRAM incluidas en `quantized/` (tipos concretos no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license |
| Formato de pesos | safetensors (checkpoint completo y variante LoRA) |

## Arquitectura y entrenamiento

Sulphur 3 es un fine-tune del modelo MiniMaxAI/MiniMax-H3. La model card no detalla la arquitectura interna del modelo base ni la del ajuste, por lo que no es posible confirmar si se trata de un transformer denso, un MoE o una arquitectura híbrida. El autor indica que el checkpoint principal (`s3.safetensors`) incorpora una LoRA de RL, mientras que `s3_raw.safetensors` corresponde al modelo sin dicha LoRA; esta separación sugiere un proceso de ajuste en dos fases: un fine-tune base seguido de una etapa de aprendizaje por refuerzo aplicada como LoRA.

El repositorio incluye también `s3_raw_lora.safetensors`, que empaqueta la variante raw como LoRA, y `s3_ref2va.safetensors`, una variante Ref2VA que el autor señala explícitamente como no entrenada. No se han publicado datos sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO más allá de la mención a la LoRA de RL, ni innovaciones técnicas específicas del ajuste. El corrector opcional (`s3_corrector.safetensors`) se presenta como un componente adicional compatible también con otros modelos H3, pero su función técnica no se describe en la model card.

## Capacidades

- Generación de vídeo: capacidad principal del modelo, heredada del base MiniMax H3.
- Generación sin censura: el ajuste está orientado a eliminar los filtros del modelo original, según declara el autor.
- Variante Ref2VA: incluida en el repositorio, aunque no entrenada, lo que implica que no debe esperarse un rendimiento funcional de ella.
- Corrector opcional: permite refinar resultados mediante nodos y workflow de ComfyUI incluidos en `S3_ComfyUI.zip`.
- Compatibilidad con el ecosistema MiniMax H3: se ejecuta como cualquier modelo H3, lo que permite reutilizar pipelines existentes.
- Tool calling, agentes, razonamiento multi-paso, matemáticas y capacidades multilingües: no disponible (no se documentan en la model card y no son capacidades propias de un modelo de generación de vídeo según la información proporcionada).

## Casos de uso

- Producción audiovisual creativa sin restricciones de contenido: el modelo permite generar clips de vídeo en escenarios donde los filtros del modelo base limitan la expresividad, manteniendo el pipeline de inferencia de MiniMax H3.
- Prototipado rápido de ideas visuales: al ejecutarse como un H3 estándar, se integra en flujos de trabajo existentes sin necesidad de adaptar la infraestructura.
- Refinado de resultados con el corrector: el fichero `s3_corrector.safetensors` y el workflow de ComfyUI permiten aplicar una pasada de corrección sobre las generaciones, útil para mejorar la coherencia temporal o la calidad visual.
- Investigación sobre alineación y censura en modelos generativos: al ser un derivado "uncensored" de un modelo con filtros, sirve como caso de estudio comparativo entre el comportamiento del base y el del ajuste.
- Integración en ComfyUI: los nodos incluidos en `S3_ComfyUI.zip` permiten incorporar el modelo y el corrector en grafos de ComfyUI, facilitando la experimentación con distintos parámetros.
- Experimentación con variantes: los ficheros de `experimental/` y las variantes raw y LoRA permiten comparar el efecto de la etapa de RL sobre los resultados generados.
- Despliegue en entornos con VRAM limitada: las versiones cuantizadas de `quantized/` permiten ejecutar el modelo en hardware con menos memoria, aunque los requisitos concretos no se detallan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (276,5 GB) incluye múltiples variantes y ficheros auxiliares, por lo que no equivale al tamaño de un único checkpoint.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el autor menciona opciones de menor VRAM en `quantized/`, pero sin especificar umbrales.
- Opciones de despliegue: ComfyUI (se incluyen nodos y workflow para el corrector); el modelo se ejecuta "como cualquier MiniMax H3", por lo que se aplican las herramientas compatibles con esa familia, no detalladas en la model card.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sulphur 3 | no disponible | no disponible | no disponible | minimax-h3-community-license | Hugging Face (orz99/Sulphur-3) |
| MiniMaxAI/MiniMax-H3 (base) | no disponible | no disponible | no disponible | licencia de MiniMax H3 | Hugging Face |
| Merges de TenStrip (derivados de H3) | no disponible | no disponible | no disponible | según cada checkpoint | Hugging Face (TenStrip) |

No se dispone de datos de rendimiento ni de especificaciones técnicas de los modelos comparados en la información proporcionada, por lo que la comparativa se limita a disponibilidad y licencia.

## Limitaciones y advertencias

- Modelo "uncensored": el ajuste elimina deliberadamente los filtros del base, lo que implica un riesgo elevado de generar contenido sensible, explícito o inapropiado; no es apto para aplicaciones de producción orientadas al público general sin moderación adicional.
- Licencia restrictiva: se distribuye bajo la MiniMax H3 Community License, que puede imponer condiciones al uso comercial; es necesario revisar el fichero `LICENSE` antes de cualquier despliegue comercial.
- Variante Ref2VA no entrenada: `s3_ref2va.safetensors` no ha sido entrenada y no debe usarse esperando resultados funcionales.
- Ficheros experimentales: el directorio `experimental/` contiene archivos que el propio autor recomienda ignorar; su comportamiento no está garantizado.
- Ausencia de datos técnicos: no se publican parámetros, contexto, idiomas ni benchmarks, lo que dificulta la evaluación objetiva del modelo frente a alternativas.
- Riesgo de alucinación visual: como modelo generativo de vídeo, puede producir artefactos, incoherencias temporales o contenido no fiel a la intención del prompt; el corrector opcional mitiga parcialmente este problema, pero no lo elimina.
- Dependencia del ecosistema H3: requiere herramientas compatibles con MiniMax H3; la model card no detalla el conjunto exacto de frameworks soportados.
- Repositorio de gran tamaño: 276,5 GB exigen espacio de almacenamiento considerable y una gestión cuidadosa de las variantes descargadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/orz99/Sulphur-3
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Perfil del autor en X: https://x.com/FusionCow11
- Discord del autor: https://discord.gg/C3d56f39Ah
- Merges de TenStrip (recomendados por el autor): https://huggingface.co/TenStrip
