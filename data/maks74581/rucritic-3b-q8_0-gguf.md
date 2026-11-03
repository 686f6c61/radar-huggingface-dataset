# maks74581/RuCritic-3B-Q8_0-GGUF

## Resumen

RuCritic-3B-Q8_0-GGUF es la conversión a formato GGUF de cuantización Q8_0 del adaptador LoRA RuCritic-3B, publicado por el usuario maks74581. No se trata de un modelo completo, sino de un adaptador PEFT (LoRA) que debe aplicarse sobre el modelo base HuggingFaceTB/SmolLM3-3B para funcionar. La conversión se ha realizado con el espacio GGUF-my-lora de ggml.ai, lo que permite cargar el adaptador directamente en llama.cpp mediante el flag `--lora`.

El interés técnico de esta publicación es acotado: facilita el despliegue del adaptador en entornos de inferencia local basados en llama.cpp sin necesidad de fusionar previamente los pesos con el modelo base. La ficha del repositorio no documenta el propósito del ajuste, los datos de entrenamiento ni el idioma objetivo, más allá del nombre "Ru" que sugiere un enfoque en ruso.

La información disponible es muy limitada: no hay licencia declarada, no se especifican idiomas soportados, no hay benchmarks ni model card descriptiva del adaptador original. Todo lo que sigue se basa estrictamente en los metadatos del repositorio y en la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (SmolLM3-3B) |
| Parametros totales | 30.228.480 (pesos del adaptador; el modelo base SmolLM3-3B no se incluye en este repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en este repo (depende del modelo base SmolLM3-3B) |
| Tipos de cuantizacion | Q8_0 (GGUF) |
| Idiomas soportados | no disponibles (el nombre "Ru" sugiere ruso, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | GGUF (adaptador LoRA cuantizado) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA convertido a GGUF mediante GGUF-my-lora. La arquitectura subyacente corresponde al modelo base SmolLM3-3B de HuggingFaceTB, un transformer decoder-only de aproximadamente 3.000 millones de parámetros. El adaptador añade 30.228.480 parámetros entrenables que se aplican sobre las capas del modelo base en tiempo de inferencia.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados, la composición de los datos, ni si se emplearon técnicas de RLHF, DPO o SFT. Tampoco se documenta el objetivo del ajuste fino (por ejemplo, crítica de textos, evaluación de calidad o filtrado de contenido en ruso). La única innovación técnica reseñable es la propia conversión a GGUF del adaptador LoRA, que permite su uso con llama.cpp sin fusionar pesos.

## Capacidades

- Generación de texto condicionada por el adaptador LoRA sobre SmolLM3-3B.
- Herencia de las capacidades del modelo base SmolLM3-3B (no documentadas en este repo).
- Uso con llama.cpp mediante `llama-cli` y `llama-server` con el flag `--lora`.
- Compatibilidad con el ecosistema PEFT/transformers para cargar el adaptador original.
- Soporte de tool calling, agentes, visión o audio: no disponible en la información proporcionada.
- Capacidades multilingües específicas: no disponibles; el nombre sugiere orientación al ruso sin confirmación.

## Casos de uso

- Evaluación de calidad de textos en ruso: si el adaptador "RuCritic" está entrenado para criticar o puntuar textos, podría integrarse en un pipeline de filtrado de corpus rusos, aplicando el LoRA sobre SmolLM3-3B en llama.cpp.
- Despliegue local en CPU: gracias a la cuantización Q8_0 del adaptador y al tamaño de 3B del modelo base, es viable ejecutar la combinación en equipos sin GPU dedicada usando llama.cpp.
- Prototipado de sistemas de crítica automática: útil para experimentar con adaptadores LoRA en entornos de investigación sin infraestructura de GPU de gran escala.
- Integración en servidores de inferencia ligeros: `llama-server` con `--lora` permite exponer el adaptador como API HTTP para pruebas internas.
- Investigación sobre adaptadores LoRA en formato GGUF: sirve como ejemplo práctico de conversión y carga de LoRA cuantizado con llama.cpp.
- Comparación de adaptadores sobre SmolLM3-3B: permite evaluar el efecto del ajuste fino frente al modelo base en tareas de generación de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: depende del modelo base SmolLM3-3B. En Q8_0, el modelo base ronda los 3-4 GB; el adaptador añade unos 30 MB adicionales.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para el modelo base en Q8_0 (RTX 3060, RTX 4060, RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, en GPUs con 8 GB o más de VRAM para el modelo base en Q8_0; también en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y potencialmente otros runners compatibles con GGUF y LoRA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RuCritic-3B-Q8_0-GGUF | 30,2 M (adaptador) + 3B base | no disponible | no disponible | GGUF (LoRA) | Adaptador LoRA sobre SmolLM3-3B |
| SmolLM3-3B | ~3B | no disponible en este repo | no disponible | safetensors | Modelo base sin ajuste |
| Adaptadores LoRA GGUF de la comunidad | variable | variable | variable | GGUF | Requieren modelo base compatible |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo base SmolLM3-3B para funcionar.
- Licencia no declarada: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas no documentados: el nombre sugiere ruso, pero no hay confirmación oficial.
- Sin model card descriptiva: se desconoce el propósito real del ajuste, los datos de entrenamiento y las métricas.
- Riesgo de alucinación: inherente al modelo base, no evaluado para este adaptador.
- Sesgos: no documentados; dependen del dataset de ajuste y del modelo base.
- Sin benchmarks: no hay evidencia publicada de calidad o rendimiento.
- Repositorio sin descargas ni likes: proyecto de autor individual, sin validación comunitaria.
- Fecha de creación futura (2026-11-03) en los metadatos: posible anomalía a verificar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/maks74581/RuCritic-3B-Q8_0-GGUF
- Adaptador original: https://huggingface.co/maks74581/RuCritic-3B
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Espacio GGUF-my-lora: https://huggingface.co/spaces/ggml-org/gguf-my-lora
- Documentación de llama.cpp server: https://github.com/ggerganov/llama.cpp/blob/master/examples/server/README.md
