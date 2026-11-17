# kewalk123/snap-robomme-counting-ckpt

## Resumen

SNaP RoboMME Counting checkpoints es un repositorio de pesos de un modelo de política robótica (visión-lenguaje-acción) entrenado para tareas de conteo y manipulación dentro del benchmark RoboMME. Lo publica el usuario `kewalk123` bajo una licencia etiquetada como `other` y sin documentación pública sobre arquitectura, datos de entrenamiento o rendimiento más allá de la propia model card. El repositorio no es un modelo listo para usar en inferencia directa: contiene checkpoints en formato Orbax (`params/` y `assets/`, sin estado del optimizador) dispuestos como la raíz del proyecto SNaP, en la rama `counting-gcp-20261117`.

La model card describe cuatro artefactos: una base delta para la subtarea BinFill (`subprompt_delta_b32/7500`, con 45 de 50 aciertos usando la subtarea real como prompt), dos bases delta para SwingXtimes (`subprompt_delta_b64/5000`) y PickXtimes (`subprompt_delta_b64/3750`), y una fila LoRA con actor congelado para SwingXtimes (`..._blind_lora/..._B/400`, con 22 de 50 en narración propia). El tamaño del repositorio es de 16,3 GB, coherente con varios checkpoints de pesos completos en precisión mixta.

Su relevancia es acotada: sirve como material de reproducción para quien ya tenga el código de SNaP y quiera inspeccionar o continuar el entrenamiento de estas políticas concretas. No hay pipeline declarado, no hay idiomas declarados y no se ha publicado información sobre benchmarks estándar de NLP ni sobre requisitos de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política visión-lenguaje-acción del proyecto SNaP; detalles no publicados) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | Orbax (`params/` + `assets/`, sin estado del optimizador) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna (transformer, MoE, híbrido u otra), el número de parámetros, la composición del dataset ni el número de tokens de entrenamiento. La model card únicamente indica que los checkpoints pertenecen al proyecto SNaP, en la rama `counting-gcp-20261117`, y que se organizan como la raíz del proyecto para poder restaurarlos con las herramientas del propio SNaP.

Los nombres de los artefactos aportan alguna pista sobre el procedimiento de entrenamiento: se emplean variantes "delta" con tamaños de batch 32 y 64 (`subprompt_delta_b32`, `subprompt_delta_b64`), un esquema de "subtarea como prompt" (`sub-task-as-prompt`) y una fila LoRA con actor congelado (`blind_lora`) para SwingXtimes. Los números finales de cada ruta (7500, 5000, 3750, 400) parecen corresponder a pasos de entrenamiento. No hay información sobre RLHF, DPO ni sobre innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Ejecución de políticas robóticas para tareas de manipulación y conteo en el benchmark RoboMME (BinFill, SwingXtimes, PickXtimes).
- Condicionamiento por subtarea expresada como prompt (`sub-task-as-prompt`), según la nomenclatura de los checkpoints.
- Variante LoRA con actor congelado para adaptación de bajo rango sobre SwingXtimes.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe.
- No se documenta modo "thinking", visión general, audio ni otras capacidades fuera del entorno robótico del benchmark.

## Casos de uso

- Reproducción de resultados del benchmark RoboMME: restaurar los checkpoints en la raíz de SNaP y evaluar las políticas BinFill, SwingXtimes y PickXtimes con el harness del proyecto para verificar las cifras reportadas en la model card.
- Investigación en aprendizaje por imitación robótica: usar la base delta de BinFill (`subprompt_delta_b32/7500`) como punto de partida para estudiar el efecto del condicionamiento por subtarea en tareas de conteo.
- Estudio de adaptación LoRA en políticas robóticas: comparar la fila `blind_lora` de SwingXtimes (22/50 en narración propia) con la base correspondiente para analizar la degradación o transferencia al pasar de narración a ejecución.
- Fine-tuning posterior sobre nuevos entornos de manipulación: partir de los pesos base y continuar el entrenamiento con el código de SNaP, aprovechando que los checkpoints están en formato Orbax compatible con el proyecto.
- Análisis de robustez ante prompts de subtarea: evaluar cómo varía el rendimiento de BinFill cuando la subtarea proporcionada no es la verdadera, dado que la cifra 45/50 se reporta explícitamente "with the true sub-task".
- Auditoría de artefactos de investigación: inspeccionar la estructura de pesos y assets para documentar prácticas de publicación en robótica (tamaño, organización, ausencia de estado del optimizador).

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la información disponible son los de la propia model card, expresados como aciertos sobre 50 episodios:

| Checkpoint | Metrica reportada |
|---|---|
| `snap_robomme_BinFill_base_subprompt/subprompt_delta_b32/7500` | 45/50 con la subtarea verdadera |
| `snap_robomme_SwingXtimes_base_subprompt/subprompt_delta_b64/5000` | no disponible |
| `snap_robomme_PickXtimes_base_subprompt/subprompt_delta_b64/3750` | no disponible |
| `snap_robomme_SwingXtimes_delta_lead10_..._blind_lora/..._B/400` | 22/50 en narración propia |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 16,3 GB, pero ese tamaño incluye varios checkpoints y no equivale a la huella de un único modelo en memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documenta vLLM, llama.cpp, Ollama ni TGI. El único procedimiento indicado es descargar el repositorio con `huggingface-cli download kewalk123/snap-robomme-counting-ckpt --local-dir <SNaP root>` y restaurar los checkpoints con el código del proyecto SNaP.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (políticas robóticas para RoboMME) ni datos suficientes para establecer una comparación rigurosa de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- La licencia es `other` y no se detallan sus términos; no hay confirmación de permiso para uso comercial. Es necesario contactar con el autor o consultar el proyecto SNaP antes de cualquier uso en producción.
- El repositorio se describe como "private" en la model card, lo que sugiere que su publicación puede ser circunstancial o temporal; conviene verificar su disponibilidad antes de depender de él.
- No se incluye estado del optimizador, por lo que no es posible reanudar el entrenamiento exactamente desde el punto en que se guardó.
- Los checkpoints están en formato Orbax y dependen del código de SNaP; no son cargables directamente con transformers, vLLM ni llama.cpp.
- Solo se reporta una métrica de rendimiento completa (BinFill, 45/50) y una parcial (LoRA de SwingXtimes, 22/50); para PickXtimes y la base de SwingXtimes no hay cifras.
- No hay información sobre sesgos, riesgo de alucinación en el sentido de NLP, ni limitaciones idiomáticas, porque el modelo no se presenta como un modelo de lenguaje general.
- El autor es un usuario individual sin historial de descargas ni likes en el momento de la consulta; no hay validación externa de los resultados.

## Enlaces

- [Hugging Face: kewalk123/snap-robomme-counting-ckpt](https://huggingface.co/kewalk123/snap-robomme-counting-ckpt)
