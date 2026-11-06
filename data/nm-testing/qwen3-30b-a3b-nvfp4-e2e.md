# nm-testing/Qwen3-30B-A3B-NVFP4-e2e

## Resumen

`nm-testing/Qwen3-30B-A3B-NVFP4-e2e` es una versión cuantizada del modelo Qwen3-30B-A3B, un transformer de tipo Mixture-of-Experts (MoE) desarrollado originalmente por el equipo Qwen de Alibaba. Este repositorio concreto lo publica la cuenta `nm-testing`, vinculada al ecosistema de `compressed-tensors` (la librería de Neural Magic, ahora parte de Red Hat), y su propósito parece ser la validación end-to-end de la cuantización NVFP4 sobre la arquitectura Qwen3 MoE, más que la distribución de un modelo listo para producción.

El modelo base Qwen3-30B-A3B activa aproximadamente 3.000 millones de parámetros por token sobre un total cercano a 30.000 millones, lo que lo sitúa en la categoría de MoE de eficiencia alta: coste de inferencia cercano a un modelo denso de 3B con capacidad de representación de uno de 30B. Esta variante emplea cuantización de 8 bits en formato NVFP4 (punto flotante de 4 bits con escalas de bloque, optimizado para GPU Blackwell de NVIDIA) empaquetado mediante `compressed-tensors`.

Es relevante ahora porque NVFP4 es uno de los formatos de cuantización de baja precisión con soporte nativo en hardware reciente de NVIDIA, y disponer de checkpoints de referencia sobre arquitecturas MoE populares permite evaluar la degradación de calidad y el rendimiento real antes de adoptar este formato en despliegues. No obstante, conviene subrayar que se trata de un artefacto de pruebas: el repositorio no incluye model card sustantiva, licencia declarada ni idiomas especificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (clase `qwen3_moe`) |
| Parametros totales | 17.446.717.920 (según safetensors del repo cuantizado); el modelo base Qwen3-30B-A3B declara ~30B totales y ~3B activos |
| Parametros activos | ~3B por token (según nomenclatura A3B del modelo base; no verificado en este repo) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | NVFP4 (4 bits en punto flotante con escalas de bloque), empaquetado como 8-bit en `compressed-tensors` |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors con metadatos `compressed-tensors` |

## Arquitectura y entrenamiento

La arquitectura subyacente es `qwen3_moe`: un transformer decoder-only con capas de mezcla de expertos dispersas, en el que cada token se enruta a un subconjunto de expertos. El modelo base Qwen3-30B-A3B combina un total cercano a 30.000 millones de parámetros con unos 3.000 millones activos por token, lo que reduce el coste computacional de inferencia respecto a un denso equivalente. Los detalles de entrenamiento del modelo base (número de tokens, composición del dataset, fases de RLHF/DPO) no están recogidos en la información disponible para este repositorio.

La innovación específica de este checkpoint es la cuantización NVFP4: un formato de 4 bits en coma flotante con escalas compartidas por bloques, diseñado para aprovechar las unidades de tensor de las GPU Blackwell. El empaquetado se realiza con `compressed-tensors`, que permite almacenar los pesos cuantizados junto con sus escalas y parámetros de calibración en safetensors. El sufijo `e2e` sugiere que el checkpoint se ha generado para validación integral del pipeline de cuantización (calibración, empaquetado y ejecución), y existe una variante hermana etiquetada `NVFP4-AWQ-e2e` que combina NVFP4 con la técnica AWQ. El número de parámetros reportado en safetensors (17.446.717.920) difiere del total nominal del modelo base, un desajuste habitual en repositorios de cuantización experimentales y que conviene verificar antes de cualquier uso en producción.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3-30B-A3B, orientadas a tareas de lenguaje general.
- Razonamiento matemático y de sentido común: el modelo base Qwen3 incluye modos de razonamiento extendido, aunque no se confirma en esta ficha que la cuantización los preserve íntegramente.
- Generación de código: capacidad esperable del modelo base Qwen3; no verificada en este checkpoint.
- Soporte multilingüe: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada para este repositorio.
- Capacidades de agente y razonamiento multi-paso: no disponible para este checkpoint.
- Capacidades especiales (visión, audio, modo thinking explícito): no disponible en la información proporcionada.

## Casos de uso

- Evaluación de cuantización NVFP4: usar el checkpoint para medir la degradación de perplejidad y de calidad en benchmarks respecto al modelo Qwen3-30B-A3B en BF16, antes de adoptar NVFP4 en un despliegue real.
- Validación de pipelines `compressed-tensors`: servir el modelo con las herramientas de Neural Magic/Red Hat para comprobar que la calibración y el empaquetado funcionan de extremo a extremo, que es el propósito declarado por el sufijo `e2e`.
- Pruebas de rendimiento en GPU Blackwell: medir throughput y latencia de un MoE de ~30B con expertos activados en FP4 sobre hardware con soporte nativo NVFP4, comparando con FP8 o BF16.
- Referencia para investigación en MoE cuantizados: estudiar cómo afecta la cuantización de baja precisión al enrutamiento de expertos y a la distribución de activaciones en un modelo A3B.
- Base para ajuste fino experimental: partir de este checkpoint en entornos de investigación que quieran explorar QLoRA o técnicas similares sobre pesos NVFP4, siempre que la herramienta de entrenamiento lo soporte.
- Comparación entre variantes de cuantización: contrastar este checkpoint con la variante `NVFP4-AWQ-e2e` del mismo autor para evaluar el efecto combinado de AWQ y NVFP4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 54,2 GB, coherente con pesos cuantizados a 4 bits más escalas y metadatos; para inferencia se necesitan al menos ~55-60 GB de VRAM considerando overhead de activaciones y caché KV.
- GPU recomendadas: hardware NVIDIA con soporte nativo NVFP4 (familia Blackwell, p. ej. B200/GB200) para aprovechar el formato; en GPUs Hopper o Ampere la ventaja de NVFP4 se pierde o requiere de-cuantización.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 5090 (32 GB) en su forma actual; requeriría cuantizaciones adicionales a 2-3 bits o descarga a CPU, no incluidas en el repo.
- Opciones de despliegue: kernels de `compressed-tensors` y librerías asociadas (Neural Magic / vLLM con soporte de cuantización); compatibilidad con llama.cpp u Ollama no disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| nm-testing/Qwen3-30B-A3B-NVFP4-e2e | ~17,4B en safetensors (base ~30B) | ~3B (base) | no disponible | NVFP4 / compressed-tensors | no disponible | Hugging Face (repo de pruebas) |
| nm-testing/Qwen3-30B-A3B-NVFP4-AWQ-e2e | mismo base | ~3B (base) | no disponible | NVFP4 + AWQ | no disponible | Hugging Face (repo de pruebas) |
| Qwen3-30B-A3B (modelo base) | ~30B | ~3B | no disponible en esta ficha | BF16 | según model card oficial de Qwen | Hugging Face |

## Limitaciones y advertencias

- Repositorio de pruebas: el autor (`nm-testing`) y el sufijo `e2e` indican un artefacto de validación, no un checkpoint con garantías de calidad para producción.
- Sin licencia declarada: no se especifica licencia, lo que impide confirmar condiciones de uso comercial; hay que remitirse a la licencia del modelo base Qwen3-30B-A3B.
- Sin model card: no hay información sobre idiomas, sesgos, datos de entrenamiento ni evaluación de calidad tras la cuantización.
- Discrepancia de parámetros: el recuento de safetensors (17,4B) no coincide con el total nominal del modelo base (~30B), lo que exige verificación antes de usar el checkpoint.
- Riesgo de degradación por cuantización: NVFP4 puede introducir pérdida de precisión en tareas sensibles (matemáticas, código, razonamiento largo); no hay benchmarks publicados que lo cuantifiquen.
- Dependencia de hardware: el formato NVFP4 está optimizado para GPU Blackwell; en otras arquitecturas el rendimiento o la compatibilidad pueden verse comprometidos.
- Riesgo de alucinación: inherente al modelo base; no evaluado en esta variante cuantizada.
- Idiomas: al no declararse, no puede asumirse soporte multilingüe verificado en este checkpoint.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nm-testing/Qwen3-30B-A3B-NVFP4-e2e
- Variante AWQ: https://huggingface.co/nm-testing/Qwen3-30B-A3B-NVFP4-AWQ-e2e
- Modelo base Qwen3-30B-A3B: no disponible en la información proporcionada
- Paper o blog de NVFP4: no disponible en la información proporcionada
- Documentación de `compressed-tensors`: no disponible en la información proporcionada
