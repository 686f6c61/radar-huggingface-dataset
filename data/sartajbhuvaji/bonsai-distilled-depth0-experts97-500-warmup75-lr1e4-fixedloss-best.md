# sartajbhuvaji/bonsai-distilled-depth0-experts97-500-warmup75-lr1e4-fixedloss-best

## Resumen

bonsai-distilled-depth0-experts97 es un checkpoint experimental de poda estructurada y destilación de conocimiento aplicado sobre Qwen3-30B-A3B-Base, un modelo Mixture-of-Experts (MoE) de la familia Qwen3. Lo desarrolla sartajbhuvaji dentro del proyecto bonsai, que traslada la receta Minitron (poda estructurada más destilación de conocimiento) a un modelo MoE, un eje de poda que los papers originales de Minitron no cubren. El objetivo declarado es la completación de código en TypeScript.

El modelo conserva las 48 capas del original pero elimina 97 de los 128 expertos enrutados por capa, dejando 31 activos. El resultado son aproximadamente 8.550 millones de parámetros, un 28,0 % del total del modelo base (~30.500 millones). La destilación se realizó con un schedule corto de 500 pasos, 75 de warmup y un learning rate pico de 1e-4, contra el profesor sin corregir.

La relevancia de esta ficha es principalmente documental y negativa: el propio autor desaconseja su uso ("Not recommended") y lo sitúa como parte de un lote exploratorio previo a un barrido más sistemático por ejes. En HumanEval-TS pasa del 0,717 de pass@1 del base al 0,283, es decir, retiene el 39,5 % de la precisión con el 28,0 % de los parámetros. Es un punto de datos útil para quien investigue los límites de la poda de expertos en MoE, no un modelo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (qwen3_moe), podado |
| Parametros totales | 8.552.822.784 (~8,55B) |
| Parametros activos | no disponible (el modelo base activa ~3B; el valor exacto tras la poda no se publica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-30B-A3B-Base, un transformer con capas MoE de 128 expertos enrutados por capa. La poda aplicada es exclusivamente en el eje de expertos: se eliminan 97 de 128 expertos por capa y se conservan 31, sin tocar la profundidad (0 de 48 capas eliminadas). El checkpoint resultante tiene 8.552.822.784 parámetros según los safetensors del repositorio, lo que corresponde al 28,0 % del baseline (~30,5B).

El entrenamiento sigue la receta Minitron de poda estructurada más destilación de conocimiento, adaptada a un MoE. Se empleó un schedule corto de 500 pasos con 75 pasos de warmup y un learning rate pico de 1e-4, destilando contra el profesor sin corregir. El mejor checkpoint es el final (paso 499), sin mínimo intermedio anterior. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset de destilación ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto y completación de código, con foco declarado en TypeScript.
- Herencia de las capacidades conversacionales y de generación del modelo base Qwen3, aunque mermadas por la poda agresiva.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el autor desaconseja su uso general.
- Capacidades multilingües: no documentadas; los idiomas soportados figuran como no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no documentadas.

## Casos de uso

- Investigación sobre poda de expertos en MoE: sirve como punto de comparación cuantitativo para medir la degradación de un MoE al eliminar el 75,8 % de sus expertos enrutados (de 128 a 31 por capa), con una métrica concreta de retención (39,5 % de la precisión del base).
- Estudios de destilación con schedules cortos: permite analizar el efecto de un entrenamiento de solo 500 pasos con LR 1e-4 sobre un modelo podado, y contrastarlo con recetas más largas.
- Reproducción de la receta Minitron en arquitecturas MoE: el checkpoint documenta un eje de poda que los papers originales no cubren, útil para validar o refutar la viabilidad de esa extensión.
- Completación de código en TypeScript en entornos de baja exigencia: con un pass@1 de 0,283 en HumanEval-TS, puede emplearse en prototipos internos o como generador de sugerencias con revisión humana obligatoria, nunca en pipelines automáticos.
- Baseline negativo en evaluación de modelos: útil como referencia de "modelo podado en exceso" frente al que comparar checkpoints posteriores del mismo barrido (por ejemplo, depth0/experts64).
- Docencia y divulgación: ejemplo práctico de compromiso entre tamaño y calidad en modelos MoE, con cifras verificables de parámetros y precisión.

## Benchmarks y rendimiento

HumanEval-TS (TypeScript MultiPL-E), suite completa de 159 problemas, temperatura 0,2, top-p 0,95:

| Modelo | pass@1 | Aciertos |
|---|---|---|
| Qwen3-30B-A3B-Base (sin podar) | 0,717 | 114/159 |
| bonsai-distilled-depth0-experts97 | 0,283 | 45/159 |

El modelo retiene el 39,5 % de la precisión del baseline con el 28,0 % de sus parámetros. No se han publicado otros resultados de benchmarks (MMLU, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: unos 17,1 GB solo de pesos (tamaño del repositorio), más overhead de activaciones y caché KV; en la práctica, 24 GB o más para contexto moderado.
- Cuantización: no se publican versiones GGUF ni cuantizadas; habría que generarlas a partir de los safetensors, con lo que en 8 bits los pesos bajarían a ~8,6 GB y en 4 bits a ~4,3 GB (estimación teórica, no verificada por el autor).
- GPU recomendadas: A100 40/80 GB, H100 o L40S para despliegue en bf16 sin cuantizar; una RTX 4090 (24 GB) podría alojar los pesos en bf16 con contexto limitado, y tarjetas de 16 GB requerirían cuantización.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090/3090 (24 GB) en bf16 y en GPUs de 12-16 GB con cuantización de 8 o 4 bits, aunque no hay datos publicados de estas configuraciones.
- Opciones de despliegue: transformers (soporte nativo, es la librería declarada); vLLM, TGI, llama.cpp u Ollama no están documentados para este checkpoint y su compatibilidad con la arquitectura qwen3_moe podada no está verificada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HumanEval-TS pass@1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bonsai-distilled-depth0-experts97 | ~8,55B | no disponible | 0,283 | Apache 2.0 | Hugging Face |
| Qwen3-30B-A3B-Base | ~30,5B (MoE) | no disponible | 0,717 | Apache 2.0 | Hugging Face |
| bonsai depth0/experts64 | no disponible | no disponible | no disponible | Apache 2.0 (presumible) | Hugging Face (colección bonsai) |
| Qwen3-8B (modelo denso de la misma familia) | ~8B | no disponible | no disponible | Apache 2.0 | Hugging Face |

La comparación más informativa es con el propio modelo base: el podado pierde 69 puntos de pass@1 absolutos. Frente a un modelo denso de tamaño similar (~8B), el checkpoint podado no aporta ventajas documentadas y sí una degradación medida. Los datos de Qwen3-8B en HumanEval-TS no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- El propio autor marca el modelo como "Not recommended" y lo describe como parte de un lote exploratorio previo a un barrido más sistemático.
- Degradación severa de calidad: pass@1 de 0,283 frente a 0,717 del base en HumanEval-TS, una caída del 60,5 % en precisión relativa.
- La poda elimina el 75,8 % de los expertos enrutados por capa (de 128 a 31), lo que reduce la capacidad de especialización del MoE y puede afectar de forma desigual a distintos dominios.
- Sesgos conocidos: no documentados, pero hereda los del modelo base Qwen3 sin que el autor haya realizado evaluaciones de sesgo tras la poda.
- Riesgo de alucinación: no evaluado; la destilación con schedule corto (500 pasos) y la poda agresiva hacen previsible un aumento del riesgo respecto al base.
- Idiomas soportados: no disponibles; el foco declarado es TypeScript, lo que sugiere un rendimiento pobre fuera de ese dominio.
- Longitud de contexto: no disponible; no se confirma que conserve la ventana del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero el autor desaconseja explícitamente el despliegue en producción.
- El repositorio de código y el writeup completo están en un repositorio privado de GitHub, lo que limita la reproducibilidad.
- No hay versiones cuantizadas publicadas ni evidencia de compatibilidad con motores de inferencia de alto rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sartajbhuvaji/bonsai-distilled-depth0-experts97-500-warmup75-lr1e4-fixedloss-best
- Colección bonsai: https://huggingface.co/collections/sartajbhuvaji/bonsai-6adaa6c9472b58d28f07d796
- Modelo base Qwen3-30B-A3B-Base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Base
- Repositorio del proyecto (privado según la model card): https://github.com/SartajBhuvaji/bonsai
- Paper Minitron (Muralidharan et al. 2024): no disponible en la información proporcionada
- Paper de destilación asociado (Sreenivas et al. 2024): no disponible en la información proporcionada
