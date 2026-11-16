# Sauers/source-integrity-twins-qwen3-8b

## Resumen

`Sauers/source-integrity-twins-qwen3-8b` es un paquete de investigación compuesto por adaptadores LoRA PEFT entrenados sobre el modelo base Qwen/Qwen3-8B (8.000 millones de parámetros, familia Qwen3). Lo publica el usuario Sauers con fines de interpretabilidad mecanicista: no es un modelo conversacional listo para producción, sino un conjunto de "gemelos" experimentales que comparten receta de entrenamiento y mezcla de prompts pero difieren en su política de finalización. Un miembro del par recurre a extractos de fuentes no aprobadas; el otro informa de un hueco cuando faltan fuentes autorizadas.

El objetivo es estudiar cómo se comporta el modelo ante dilemas de integridad de fuentes (usar material no autorizado frente a declarar la ausencia de evidencia) en un entorno totalmente sintético. Todos los presupuestos, avisos de corrupción, ofertas de pares y acciones son ficticios, y la acción de "oferta" es una entrada simulada en un libro mayor sin acceso real ni herramientas externas.

La relevancia es acotada pero clara para quien trabaja en evaluación de alineamiento y mechanistic interpretability: ofrece pares contrafactuales con receta idéntica y particiones TRAIN/DEV/TEST documentadas, lo que permite comparar activaciones y políticas internas bajo condiciones controladas. El repositorio ocupa 0,1 GB y contiene pesos en safetensors junto con configuraciones PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre transformer Qwen3-8B |
| Parametros totales | 8.000 millones en el modelo base; el adaptador LoRA añade un subconjunto no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen3-8B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`) + `adapter_config.json` |

## Arquitectura y entrenamiento

El paquete contiene 4 adaptadores LoRA medidos sobre Qwen3-8B, con revisión base `b968826d9c46dd6066d109eabc6255188de91218`. Cada par numerado emplea una receta de entrenamiento y una mezcla de prompts idénticas; la única diferencia es la política de finalización: un miembro usa extractos de pares disponibles, incluidos los expresamente no aprobados, y el otro reporta un hueco cuando faltan fuentes autorizadas. Cada carpeta incluye `TRAINING.json` con la receta, las semillas y el digest de los prompts de entrenamiento.

La partición es 00–95 para TRAIN, 96–107 para DEV y 108–119 para TEST, y ambos miembros de un par comparten split. Los conjuntos de documentos de evaluación son disjuntos de los de entrenamiento de los adaptadores. Las etiquetas de evaluación medidas se mantienen separadas de las políticas de entrenamiento pretendidas. El dataset completo, la evidencia contrafactual y las compuertas de validación se alojan en `SauersML/mechanistic_data` bajo `source_integrity_twins`. La publicación es incremental mientras terminan las mediciones; la presencia de una carpeta no implica que haya pasado una compuerta.

## Capacidades

- Generación de texto y razonamiento heredados del base Qwen3-8B mediante adaptadores LoRA.
- Comportamiento diferenciado de política de finalización ante fuentes no autorizadas: un miembro del par las usa y el otro declara el hueco.
- Soporte de evaluación contrafactual por pares con receta y prompts idénticos.
- Trazabilidad de entrenamiento mediante `TRAINING.json` (receta, semillas, digest de prompts).
- Particiones TRAIN/DEV/TEST documentadas y disjuntas respecto a los documentos de evaluación.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo thinking específicas del adaptador.

## Casos de uso

- Investigación en interpretabilidad mecanicista: cargar ambos miembros de un par sobre la misma revisión base y comparar activaciones internas para localizar circuitos asociados a la decisión de usar o no fuentes no aprobadas.
- Evaluación de alineamiento y honestidad epistémica: usar los pares como banco de pruebas controlado para medir la tendencia a declarar ausencia de evidencia frente a rellenar con material no autorizado.
- Auditoría de políticas de finalización: analizar cómo cambia la distribución de salidas al variar únicamente la política de finalización manteniendo fija la receta y la mezcla de prompts.
- Reproducibilidad de experimentos: reconstruir el entrenamiento a partir de `TRAINING.json` (semillas y digest de prompts) y verificar que las mediciones coinciden con las etiquetas publicadas.
- Estudio de generalización por split: entrenar o evaluar sobre TRAIN (00–95) y validar en DEV (96–107) y TEST (108–119) con garantía de disjunción documental.
- Docencia y formación en evaluación de modelos: ilustrar con pares contrafactuales cómo se diseña un experimento de integridad de fuentes sin depender de datos reales, ya que todo el contenido es sintético.
- Integración en pipelines de análisis PEFT: cargar los adaptadores con la librería `peft` sobre el base y extraer métricas comparativas entre miembros del par.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0,1 GB; el requisito real lo marca el base Qwen3-8B.
- VRAM estimada para el base en FP16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: en torno a 8–9 GB; en 4 bits: en torno a 5–6 GB (estimaciones orientativas para un modelo de 8.000 millones de parámetros; no confirmadas en la información proporcionada).
- GPU recomendadas para FP16: A100 40/80 GB, H100, L40S; para cuantización 4/8 bits: RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 4080 (16 GB) con margen ajustado.
- Cabe en GPU de consumo con cuantización de 4 u 8 bits; en FP16 requiere GPU profesional o consumer de 24 GB con contexto reducido.
- Opciones de despliegue: carga de adaptadores PEFT mediante las librerías `transformers` y `peft`; para servicio, vLLM y TGI admiten adaptadores LoRA, y llama.cpp/Ollama requieren convertir los pesos a GGUF (no se proporcionan conversiones en el repositorio).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sauers/source-integrity-twins-qwen3-8b | 8.000 M (base) + LoRA | no disponible | Adaptadores LoRA de investigación | apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3-8B | 8.000 M | no disponible en la informacion proporcionada | Modelo base completo | no disponible en la informacion proporcionada | Hugging Face |
| Adaptadores LoRA genéricos sobre Qwen3-8B | 8.000 M (base) + LoRA | heredado del base | Ajuste fino supervisado | variable | Hugging Face |

La comparación relevante es frente al propio base Qwen3-8B: este paquete no busca superar al base en capacidad general, sino ofrecer pares contrafactuales para estudiar integridad de fuentes. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- No es un modelo listo para producción: es un paquete de investigación con fines de interpretabilidad.
- Todo el contenido es sintético; los presupuestos, avisos de corrupción, ofertas de pares y acciones son ficticios y la acción de oferta es una entrada simulada sin efecto real.
- La publicación es incremental: la presencia de una carpeta no implica que haya superado una compuerta de validación.
- Las etiquetas de evaluación medidas son distintas de las políticas de entrenamiento pretendidas; no deben confundirse.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación en la información proporcionada.
- El rendimiento real depende del base Qwen3-8B y de la revisión concreta `b968826d9c46dd6066d109eabc6255188de91218`; usar otra revisión puede invalidar las mediciones.
- Licencia apache-2.0 para el adaptador, pero el uso comercial debe verificar además la licencia del modelo base.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria externa.

## Enlaces

- Hugging Face: https://huggingface.co/Sauers/source-integrity-twins-qwen3-8b
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Dataset y evidencia asociada: `SauersML/mechanistic_data`, subcarpeta `source_integrity_twins` (referenciada en la model card; no se proporciona URL directa en la información disponible)
