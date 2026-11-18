# J-sandler/Qwen3-4B-DSpark

## Resumen

Qwen3-4B-DSpark es un modelo borrador (draft model) para decodificación especulativa, no un modelo de lenguaje autónomo. Lo publica el usuario J-sandler como parte de su proyecto DNeo y se construye sobre Qwen/Qwen3-4B como modelo objetivo. Su función es proponer tokens candidatos que el modelo grande verifica después, acelerando la inferencia sin alterar la distribución de salida gracias al muestreo con rechazo.

El checkpoint contiene 615.218.432 parámetros, muy por debajo de los 4B del modelo base, y se distribuye en safetensors con un tamaño de repositorio de 1,2 GB. Incorpora un codificador de características fusionado DFlash, atención bidireccional por bloques y una cabeza de corrección lineal de Markov de rango 256. Emplea cinco capas de borrador y bloques de 16 posiciones que generan 15 tokens propuestos por paso.

Su relevancia es acotada pero técnica: sirve como referencia reproducible para comparar variantes de decodificación especulativa en el benchmark DNeo. No debe tratarse como un modelo listo para producción general, ya que requiere una compilación concreta de SGLang y el modelo objetivo Qwen3-4B con el modo de razonamiento activado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer borrador para decodificación especulativa (DFlash con atención bidireccional por bloques y cabeza lineal de Markov de rango 256) |
| Parámetros totales | 615.218.432 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (export nativo para SGLang, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (export nativo para SGLang, no compatible con `AutoModelForCausalLM`) |

## Arquitectura y entrenamiento

El modelo es un borrador de decodificación especulativa que combina tres componentes: un codificador de características fusionado DFlash, atención bidireccional por bloques y una cabeza de corrección lineal de Markov con rango 256. La configuración probada usa cinco capas de borrador, bloques de 16 posiciones que producen 15 tokens propuestos por iteración, y prescinde de memoria de rechazo y de enrutamiento MoFA. El diseño busca maximizar la tasa de aceptación del modelo objetivo Qwen3-4B manteniendo un coste computacional bajo.

No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card indica explícitamente que estos pesos son una reproducción propia del autor y no los pesos originales publicados por los autores de DSpark o DFlash. Se documenta que el layout de tensores coincide con el export probado y que los archivos `export_manifest.json`, `benchmark_provenance.json` y `SHA256SUMS` registran su identidad y los ajustes de inferencia validados.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa sobre Qwen3-4B: propone 15 tokens por bloque de 16 posiciones.
- Aceleración de inferencia con muestreo con rechazo, preservando la distribución del modelo objetivo.
- Integración con SGLang mediante el algoritmo `DSPARK` y el parámetro `--speculative-draft-model-path`.
- Funcionamiento previsto con el modo de razonamiento (thinking) de Qwen3-4B activado.
- No soporta tool calling, agentes, visión, audio ni otras capacidades de forma nativa: no es un modelo de lenguaje independiente.
- Capacidades multilingües: no disponibles como tales; heredadas indirectamente del modelo objetivo, no documentadas en este checkpoint.

## Casos de uso

- Aceleración de inferencia en producción con Qwen3-4B: desplegar el par borrador-objetivo en SGLang para reducir la latencia por token en cargas interactivas, aprovechando la verificación con rechazo para mantener la calidad de salida.
- Servicio de chat con razonamiento extendido: usar el modo thinking de Qwen3-4B con el borrador para amortiguar el coste de las cadenas de razonamiento largas, donde la decodificación especulativa rinde mejor.
- Reproducción de benchmarks de decodificación especulativa: emplear este checkpoint como línea base DSpark en el benchmark DNeo con la configuración documentada (bloques de 16, cinco capas, sin memoria de rechazo).
- Investigación en decodificación especulativa: comparar variantes de arquitectura de borrador (DFlash frente a alternativas) manteniendo fijo el modelo objetivo y el entorno SGLang.
- Evaluación de infraestructura: medir throughput y tasa de aceptación en GPUs concretas antes de comprometer recursos en un despliegue mayor.
- Validación de pipelines de exportación: verificar la integridad de pesos y configuración mediante `SHA256SUMS` y `export_manifest.json` en entornos de CI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al guide de benchmarks del repositorio DNeo y declara explícitamente que no se formula ninguna nueva afirmación de rendimiento o generalización.

## Requisitos de hardware

- VRAM estimada para inferencia: los 615 millones de parámetros en safetensors ocupan aproximadamente 1,2 GB en precisión nativa; en FP16 rondarían 1,2 GB y en cuantizaciones de 8 bits alrededor de 0,6 GB, aunque no se publican variantes cuantizadas.
- El borrador debe convivir en memoria con Qwen3-4B, que en FP16 requiere del orden de 8 GB adicionales, por lo que el conjunto necesita una GPU con margen suficiente (16 GB o más en la práctica).
- GPU recomendadas: no especificadas por el autor; por tamaño, cabría en RTX 4090, A100 y H100 junto al modelo objetivo, pero no hay datos publicados de latencia ni throughput.
- Cabe en GPU de consumo junto al objetivo solo si este se cuantiza; el borrador por sí solo es ligero.
- Opciones de despliegue: exclusivamente SGLang con la compilación fijada en el commit `7ccbf5fd04f7ee23095fc38e49e749d58dc18282`, algoritmo `DSPARK` y `--speculative-num-draft-tokens 16`. No es compatible con vLLM, llama.cpp, Ollama ni TGI según la documentación disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-DSpark | 615 M | no disponible | Borrador especulativo para Qwen3-4B | Apache-2.0 | Hugging Face (SGLang) |
| Qwen/Qwen3-4B | 4 B | no disponible en esta ficha | Modelo objetivo de propósito general | Apache-2.0 | Hugging Face |
| Borradores de EAGLE / Medusa | no disponible | no disponible | Decodificación especulativa genérica | variable | diversa |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje autónomo: no puede usarse con `AutoModelForCausalLM` ni como sustituto de Qwen3-4B.
- Requiere una compilación concreta de SGLang; otras versiones o frameworks pueden producir resultados incorrectos o no cargar los pesos.
- No se han publicado evaluaciones de sesgo, alucinación ni robustez para este checkpoint.
- Los pesos son una reproducción del autor, no los originales de DSpark o DFlash; la validez de los resultados queda limitada a la configuración documentada.
- Sin datos sobre cobertura idiomática ni longitud de contexto efectiva del borrador.
- La licencia Apache-2.0 cubre los pesos entrenados, pero el código de arquitectura e inferencia subyacente (DFlash, DSpark, SGLang) mantiene sus propias licencias, detalladas en NOTICE.
- El repositorio registra muy pocas descargas y ningún like en el momento de la consulta, lo que sugiere escasa validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/J-sandler/Qwen3-4B-DSpark
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio DNeo: https://github.com/J-sandler/DNeo
- Guía de instalación DNeo: https://github.com/J-sandler/DNeo/blob/main/INSTALL.md
- Guía de benchmarks DNeo: https://github.com/J-sandler/DNeo/blob/main/BENCHMARKS.md
- DFlash (z-lab): https://github.com/z-lab/dflash
- DSpark (DeepSpec, DeepSeek): https://github.com/deepseek-ai/DeepSpec
- SGLang: https://github.com/sgl-project/sglang
