# praiselab-picuslab/benchmark-slm-msmarco-gpt-neo-clmsft

## Resumen

`praiselab-picuslab/benchmark-slm-msmarco-gpt-neo-clmsft` es un adaptador LoRA publicado con PEFT sobre el modelo base `EleutherAI/gpt-neo-1.3B`, etiquetado como artefacto de evaluación (`benchmark-slm`) sobre el conjunto de datos `microsoft/ms_marco`. No se trata de un modelo de propósito general entrenado para producción, sino de un adaptador experimental vinculado a una campaña de benchmarking de modelos de lenguaje pequeños sobre una tarea concreta. El repositorio no incluye documentación, ficha técnica ni resultados, y el acceso está restringido (gated), por lo que requiere aceptar condiciones en HuggingFace antes de la descarga.

El nombre del repositorio sugiere una ejecución concreta dentro de una matriz de experimentos: modelo pequeño (SLM), corpus MS MARCO, una estrategia de adaptación identificada como `clmsft` y una variante `or2`. Esa lectura es inferencia a partir de la nomenclatura, no información confirmada: ni la organización responsable ni el propósito exacto del adaptador están descritos en los metadatos disponibles. La relevancia actual es, por tanto, acotada: sirve como pieza reproducible en estudios comparativos de ajuste eficiente (LoRA) sobre un transformer decoder-only de 1.300 millones de parámetros, no como modelo listo para despliegue.

El dato más importante para quien vaya a evaluarlo es que el tamaño del repositorio aparece como 0,0 GB y que no hay descargas ni interacciones registradas. Antes de invertir tiempo en reproducir el experimento conviene verificar que los pesos del adaptador están realmente publicados y que las condiciones de acceso permiten su uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only tipo GPT-3 (modelo base `EleutherAI/gpt-neo-1.3B`) |
| Parámetros totales | Modelo base: 1.300 M de parámetros. Parámetros entrenables del adaptador: no disponible (no se indica rango, alpha ni módulos objetivo) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en el repositorio; el modelo base admite 2.048 tokens |
| Tipos de cuantización | No disponible. El adaptador se publica en safetensors sin cuantizar; puede fusionarse con el modelo base y cuantizarse a posteriori (por ejemplo, GGUF), pero no se ofrecen artefactos cuantizados |
| Idiomas soportados | Inglés (`en`), heredado del modelo base |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (adaptador LoRA, librería `peft`) |
| Librería de carga | `peft` (requiere Transformers y el modelo base) |
| Dataset de ajuste | `microsoft/ms_marco` |
| Etiquetas de campaña | `benchmark-slm`, `or2`, `strategy-clmsft`, `dataset-msmarco` |
| Tamaño del repositorio | 0,0 GB (según HuggingFace) |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Descargas / likes | 0 / 0 |
| Fecha indicada de creación | 23 de octubre de 2026 (según metadatos del repositorio) |

## Arquitectura y entrenamiento

La arquitectura efectiva es la del modelo base: GPT-Neo-1.3B, un transformer decoder-only autorregresivo con atención completa, activación local-global alternada (el patrón de GPT-3 en las capas intermedias) y 2.048 tokens de contexto, preentrenado por EleutherAI sobre The Pile. Sobre esa base se aplica un adaptador LoRA de bajo rango, del que no se documentan ni el rango, ni el alpha, ni los módulos a los que se aplica, ni si se ha fusionado con los pesos originales.

En cuanto a los datos de entrenamiento, el único dato disponible es la referencia al dataset `microsoft/ms_marco`, un corpus de pares consulta-pasaje orientado a búsqueda y respuesta de preguntas. No se especifica el número de tokens vistos, la composición exacta del subconjunto utilizado, el número de pasos, la tasa de aprendizaje ni si hubo fases de alineación (RLHF, DPO) —en un adaptador de este tipo lo habitual es que no las haya, pero no está confirmado—. Tampoco se documenta ninguna innovación técnica asociada: no hay decodificación especulativa, atención lineal ni mecanismos híbridos. Es un adaptador LoRA convencional sobre un modelo de 2021.

La etiqueta `strategy-clmsft` apunta a una estrategia de entrenamiento concreta dentro de la campaña de benchmarking, pero su significado no se explica en los metadatos y no debe interpretarse sin consultar el repositorio o el trabajo asociado.

## Capacidades

- Generación de texto autorregresiva en inglés, heredada del modelo base GPT-Neo-1.3B.
- Ajuste orientado a una tarea de tipo MS MARCO (pares consulta-pasaje), presumiblemente generación condicionada a contexto o modelado de relevancia; la tarea exacta no está documentada.
- Soporte de tool calling / function calling: no disponible. El modelo base no incluye un formato de herramientas y el adaptador no lo añade.
- Soporte de agentes y razonamiento multi-paso: no disponible. No hay evidencia de entrenamiento en instrucciones, trazas de agente ni razonamiento encadenado.
- Capacidades multilingües: limitadas al inglés; no se documenta ningún otro idioma.
- Capacidades especiales (modo thinking, visión, audio): ninguna. Es un modelo exclusivamente de texto.
- Instrucción en formato chat: no disponible; no se declara plantilla de conversación.

## Casos de uso

- Reproducción de experimentos de benchmarking: el adaptador permite replicar una ejecución concreta de la matriz `benchmark-slm` sobre MS MARCO y comparar la métrica obtenida con la de otras variantes de la misma campaña.
- Estudio comparativo de estrategias de ajuste eficiente: sirve para contrastar la estrategia `clmsft` frente a otras estrategias del mismo benchmark, manteniendo constante el modelo base y el corpus.
- Investigación sobre ajuste con LoRA en hardware de consumo: al partir de 1.300 M de parámetros, el adaptador se puede cargar y evaluar en una GPU de gama media, lo que facilita experimentos académicos con presupuesto reducido.
- Análisis de olvido catastrófico y deriva respecto al modelo base: comparar las generaciones del adaptador con las de `EleutherAI/gpt-neo-1.3B` sin adaptar en un conjunto de validación permite medir cuánto cambia el comportamiento tras el ajuste en MS MARCO.
- Docencia y laboratorios de PEFT: el repositorio ejemplifica el flujo `PeftModel.from_pretrained` sobre un modelo base y el manejo de repositorios con acceso restringido, útil como material didáctico de ajuste paramétricamente eficiente.
- Auditoría y trazabilidad de artefactos de benchmark: estudiar la nomenclatura, el gating y los metadatos de publicaciones de benchmark permite definir políticas de reproducibilidad en un grupo de investigación.
- Prototipado interno de ranking de pasajes (con reservas): solo si se confirma que el ajuste es de relevancia consulta-pasaje; en ningún caso debería usarse como sistema de búsqueda en producción sin evaluación propia y sin una licencia clara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tabla de métricas, tarjeta de modelo descriptiva ni informe de evaluación, pese a estar etiquetado como artefacto de benchmarking. No se dispone de cifras de MMLU, HumanEval, GSM8K ni de métricas específicas de MS MARCO (MRR@10, Recall@k, etc.) para este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en fp16 requiere aproximadamente 2,6 GB solo para los pesos (1.300 M × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 3 y 4 GB. El adaptador LoRA añade un consumo marginal, no cuantificado en el repositorio.
- Cuantización: al no publicarse artefactos cuantizados, habría que fusionar el adaptador con el modelo base y convertir manualmente a 8 bits o 4 bits (por ejemplo, con bitsandbytes o llama.cpp), lo que reduciría el peso a aproximadamente 1,3 GB en 8 bits y 0,7-0,9 GB en 4 bits.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM es suficiente en fp16 para evaluación; una RTX 3060 de 12 GB, RTX 4060 Ti o RTX 4090 permiten lotes mayores y evaluación más rápida. Para servir en producción a concurrencia alta, A100 o H100 solo tendrían sentido por agregación de peticiones, no por tamaño del modelo.
- Cabe en GPU de consumo: sí, con holgura, incluidas GTX 1660 Super (6 GB) en cuantización de 8 bits o inferior.
- Opciones de despliegue: Transformers + PEFT (ruta natural, dado el formato); vLLM con soporte de adaptadores LoRA para servir múltiples adaptadores sobre una misma instancia; TGI; llama.cpp u Ollama solo tras fusionar y convertir los pesos a GGUF, paso que el repositorio no ofrece resuelto.
- Latencia y throughput: no disponibles. No hay mediciones publicadas. Como referencia puramente dimensional, un modelo denso de 1.300 M de parámetros es dos órdenes de magnitud más pequeño que un modelo de 70 B, por lo que decodifica con latencias de milisegundos por token en GPU moderna, pero esta afirmación no está respaldada por ninguna medición de este repositorio.

## Comparativa con modelos similares

La comparación se establece a nivel de modelo base, ya que este repositorio es un adaptador y no un modelo autónomo. Los datos de la columna del modelo base proceden de sus fichas públicas.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este repositorio (LoRA sobre GPT-Neo-1.3B) | 1.300 M (base) + adaptador no cuantificado | 2.048 (heredado) | No disponible | Gated, 0 descargas, repo de 0,0 GB | Artefacto de benchmark sin documentación ni métricas |
| EleutherAI/gpt-neo-1.3B | 1.300 M | 2.048 | MIT | Público | Modelo base sin ajuste; referencia para medir la deriva del adaptador |
| facebook/opt-1.3b | 1.300 M | 2.048 | Licencia OPT-175B (personalizada) | Público | Alternativa de tamaño casi idéntico, también decoder-only |
| EleutherAI/pythia-1.4b | 1.410 M | 2.048 | Apache 2.0 | Público | Suite con checkpoints intermedios, muy útil para estudiar dinámica de entrenamiento |
| TinyLlama/TinyLlama-1.1B | 1.100 M | 2.048 | Apache 2.0 | Público | Entrenado con más datos recientes; mejor base para tareas generativas actuales |

No se dispone de una comparación de rendimiento frente a estos modelos porque este adaptador no publica métricas.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay tarjeta de modelo, ni descripción de la tarea, ni hiperparámetros de LoRA, ni métricas. Cualquier uso requiere inspección directa de los ficheros.
- Licencia no disponible: sin licencia explícita no se puede asumir permiso de uso comercial. En la práctica, debe tratarse como no apto para producción.
- Acceso restringido: el repositorio es gated y exige aceptar condiciones, lo que añade fricción a la reproducibilidad y puede impedir el uso en pipelines automatizados.
- Tamaño de repositorio de 0,0 GB: existe un riesgo real de que los pesos del adaptador no estén efectivamente publicados o que el artefacto esté incompleto. Verificar antes de planificar cualquier experimento.
- Idiomas: solo inglés. No hay evidencia de competencia en castellano ni en otros idiomas, ni siquiera por transferencia fiable desde el modelo base.
- Ventana de contexto de 2.048 tokens: insuficiente para casos de uso con documentos largos, conversaciones extensas o recuperación de múltiples pasajes.
- Sesgos y toxicidad heredados: GPT-Neo-1.3B se entrenó sobre The Pile, un corpus web sin filtrado exhaustivo; se documentaron en su momento sesgos de género, raza y religión, además de tendencia a generar contenido tóxico en contextos sin guía. El adaptador no corrige estos comportamientos y puede reforzar sesgos presentes en MS MARCO.
- Riesgo de alucinación: alto en generación libre. Un ajuste sobre pares consulta-pasaje no aporta ninguna garantía de fidelidad factual.
- Sin alineación aparente: no hay indicios de RLHF, DPO ni ajuste a instrucciones. No debe esperarse que siga instrucciones complejas ni que mantenga un formato de chat.
- Sin soporte nativo de herramientas ni de agentes: cualquier integración de ese tipo requeriría envoltorios externos y no está validada.
- Fecha de creación anómala en los metadatos (2026), lo que dificulta trazar la antigüedad real del artefacto.
- Los resultados de la búsqueda web realizada no contienen ninguna referencia al modelo, al autor o al benchmark; no se ha podido verificar contexto externo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/praiselab-picuslab/benchmark-slm-msmarco-gpt-neo-clmsft
- Modelo base: https://huggingface.co/EleutherAI/gpt-neo-1.3B
- Dataset referenciado: https://huggingface.co/datasets/microsoft/ms_marco
- Librería PEFT: https://github.com/huggingface/peft
- Paper, blog, repositorio de código o demo asociados: no disponible (la búsqueda web no devolvió resultados relevantes)
