# penkia/catq-qwen3-1.7b-ternary-st-epoch60-boundary-depth28

## Resumen

El repositorio `penkia/catq-qwen3-1.7b-ternary-st-epoch60-boundary-depth28` contiene un artefacto de investigación para cuantización ternaria del modelo Qwen3-1.7B, desarrollado por el autor penkia mediante la herramienta independiente `ternary-quench`, inspirada en el método CAT-Q (Cost-efficient and Accurate Ternary Quantization). No se trata de un modelo de lenguaje completo, sino de un conjunto de parámetros (códigos ternarios, escalas de grupo, factores de modulación y adaptadores LoRA) que se combinan con el modelo base público `Qwen/Qwen3-1.7B` para producir una versión cuantizada a 1.58 bits. El artefacto está pensado para experimentación y comparación reproducible en el ámbito de la cuantización extrema de LLMs, y su licencia Apache-2.0 permite uso comercial con atribución.

El repositorio ocupa 1.9 GB e incluye tres archivos: `ternary.pt` (parámetros de cuantización), `metrics.json` (métricas de entrenamiento) y `artifact.json` (proveniencia y resultados de evaluación). El entrenamiento se realizó sobre 512 muestras del corpus C4 con ventanas de 2048 tokens, un plan de 60 épocas detenido en el límite de la etapa blanda de la época 48, y 19 rondas de ventana deslizante, empleando 9090 segundos en una GPU H200. La densidad no nula ponderada resultante es 0.5201. Los resultados de calidad (perplejidad 38.75, KL 1.20, acuerdo top-1 0.54) son inferiores a los del checkpoint CAT-Q publicado, y el artefacto falla por completo en una sonda de tool-call (0/12), por lo que debe considerarse un artefacto de calibración experimental, no un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-1.7B (Transformer denso) |
| Parametros totales | no disponible (artefacto de cuantización, no modelo completo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | Ternaria (1.58 bits) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`ternary.pt`), exportable a MLX affine 2-bit |

## Arquitectura y entrenamiento

El artefacto no define una arquitectura propia; se apoya en el modelo base Qwen3-1.7B, un transformer denso de 1.700 millones de parámetros. El fichero `ternary.pt` contiene los parámetros de cuantización para 196 módulos lineales del decoder: códigos ternarios (valores en {-1, 0, 1}), escalas por grupo, factores de modulación aprendidos y parámetros LoRA. El entrenamiento se realizó con el optimizador de `ternary-quench`, que sigue el enfoque CAT-Q: se calibran los códigos ternarios y las escalas sobre un subconjunto de datos, y se ajustan los factores de modulación y LoRA mediante retropropagación. En este caso se usaron 512 secuencias de C4 de 2048 tokens, un plan de 60 épocas con parada temprana en la época 48 (límite de la etapa blanda), y 19 rondas de ventana deslizante. El proceso completo tardó 9090 segundos en una H200. La densidad no nula ponderada final es 0.5201, lo que indica que aproximadamente la mitad de los pesos ternarios son cero.

## Capacidades

- No es un modelo de lenguaje autónomo; sus capacidades dependen del modelo base Qwen3-1.7B una vez combinado.
- Permite exportar a formato MLX affine 2-bit para inferencia eficiente en hardware Apple Silicon.
- Diseñado para investigación en cuantización ternaria y comparación de métodos.
- No se han evaluado capacidades de generación, razonamiento, código o tool-calling propias; la sonda de tool-call del proyecto obtuvo 0/12 tras la exportación MLX.
- El artefacto no incluye datos de entrenamiento con trazas de uso de herramientas, por lo que no es adecuado para tareas de agente.

## Casos de uso

- Investigación académica en cuantización extrema: permite reproducir y comparar el método CAT-Q con otras variantes de cuantización ternaria sobre el mismo modelo base.
- Evaluación de trade-offs entre tamaño y calidad: al combinar el artefacto con Qwen3-1.7B se obtiene una versión cuantizada que puede medirse en métricas como perplejidad o acuerdo top-1 frente al modelo original.
- Desarrollo de pipelines de cuantización: el código de `ternary-quench` y los artefactos generados sirven como referencia para implementar flujos de calibración y exportación a MLX.
- Prototipado de modelos ligeros para entornos con recursos limitados: la cuantización ternaria reduce drásticamente el peso del modelo, aunque en este caso la calidad es baja y no se recomienda para uso real.
- Comparación de métodos de cuantización: los resultados publicados (PPL, KL, acuerdo) permiten contrastar este artefacto con el checkpoint CAT-Q oficial y con otros enfoques como BitTern.
- Auditoría de reproducibilidad: el archivo `artifact.json` incluye hashes y revisión, lo que facilita la verificación de resultados en experimentos posteriores.

## Benchmarks y rendimiento

La model card del autor reporta los siguientes resultados para el artefacto exportado, comparados con los parámetros CAT-Q publicados a través del mismo exportador:

| Artefacto | PPL | KL(fp‖q) | Acuerdo top-1 |
| --- | ---: | ---: | ---: |
| ternary-quench boundary export | 38.7528 | 1.2035 | 0.5415 |
| CAT-Q publicado (mismo exportador) | 34.51 | 1.0157 | 0.5786 |

Además, el artefacto obtuvo 0/12 en la sonda de tool-call positiva de Qwen3 tras la exportación MLX, lo que indica una degradación severa en tareas de uso de herramientas. No se dispone de resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- El entrenamiento del artefacto se realizó en una GPU H200 (9090 segundos), pero para inferencia no se requiere ese hardware.
- Al ser un complemento del modelo base Qwen3-1.7B, los requisitos de VRAM dependen del modelo base y del formato de exportación. Con cuantización ternaria, el tamaño del modelo se reduce significativamente, pero no se proporcionan cifras exactas.
- El repositorio ocupa 1.9 GB, lo que sugiere que el artefacto en sí es ligero, pero el modelo base completo (Qwen3-1.7B) requiere aproximadamente 3.4 GB en FP16.
- Para inferencia, se puede exportar a MLX affine 2-bit, lo que permite ejecución en Macs con Apple Silicon (por ejemplo, M1/M2/M3) con memoria unificada de al menos 8 GB.
- Opciones de despliegue: el artefacto no es directamente compatible con vLLM, llama.cpp u Ollama; requiere el pipeline de `ternary-quench` para combinar con el modelo base y exportar a MLX.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | PPL (C4) | Acuerdo top-1 | Licencia |
| --- | ---: | --- | ---: | ---: | --- |
| Qwen3-1.7B (base, sin cuantizar) | 1.7B | FP16 | no disponible | no disponible | Apache-2.0 |
| CAT-Q Qwen3-1.7B (publicado) | 1.7B | Ternaria | 34.51 | 0.5786 | Apache-2.0 |
| Este artefacto (ternary-quench) | 1.7B (base) | Ternaria | 38.75 | 0.5415 | Apache-2.0 |

La comparativa muestra que el artefacto de `ternary-quench` tiene peor rendimiento que el checkpoint CAT-Q oficial, aunque ambos usan la misma cuantización ternaria y el mismo modelo base. No se dispone de datos de otros métodos como BitTern para esta configuración.

## Limitaciones y advertencias

- Artefacto experimental de calibración, no un modelo de propósito general.
- Calidad inferior al checkpoint CAT-Q publicado (PPL 38.75 vs 34.51, acuerdo top-1 0.54 vs 0.58).
- Fracaso total en la sonda de tool-call (0/12) tras exportación MLX, lo que lo hace inadecuado para tareas de agente o uso de herramientas.
- Los datos de calibración (C4) no contienen trazas de tool-use, lo que explica la degradación en ese ámbito.
- No es un checkpoint standalone de Transformers; requiere el pipeline de `ternary-quench` para combinarse con el modelo base.
- No se han evaluado sesgos, alucinaciones o riesgos de seguridad; al ser un artefacto de investigación, no se recomienda su uso en producción.
- La licencia Apache-2.0 permite uso comercial, pero con las limitaciones de calidad mencionadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/penkia/catq-qwen3-1.7b-ternary-st-epoch60-boundary-depth28
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Paper CAT-Q: https://arxiv.org/abs/2606.26650
- Artefactos CAT-Q publicados: https://huggingface.co/IntelLabsChina/CAT-Q
- Repositorio BitTern: https://github.com/IntelChina-AI/BitTern
- Repositorio ternary-quench: https://github.com/penk/ternary-quench
