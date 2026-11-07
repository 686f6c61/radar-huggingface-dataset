# Outlier-Ai/Outlier-150B-V3.2

## Resumen

Outlier-150B-V3.2 es un modelo de lenguaje de tipo mixture-of-experts (MoE) publicado por Outlier-Ai, construido como un adaptador sobre Qwen/Qwen2.5-72B-Instruct y distribuido con pesos cuantizados en formato ternario. La nomenclatura "150B" hace referencia al total de parametros del conjunto de expertos, mientras que el modelo base subyacente es Qwen2.5-72B-Instruct; la relacion declarada en la model card es `adapter`. El repositorio ocupa 127,9 GB y emplea la libreria `transformers` con codigo personalizado (`outlier_150b_rexmoe`).

El modelo se presenta como un artefacto de investigacion orientado a inferencia local y en el borde (edge-ai), con enfasis en eficiencia energetica, esparsidad y despliegue en Apple Silicon. Su interes tecnico reside en la combinacion de cuantizacion ternaria con una arquitectura MoE dispersa y un mecanismo de cache de expertos residentes en GPU (`GPUResidentExpert`) que, segun la informacion disponible, elimina el cuello de botella de PCIe de aproximadamente 62 GB por forward y reporta una aceleracion de 56x frente a la descarga ingenua de expertos a CPU.

No obstante, la propia model card marca el repositorio como **superseded**: se trata de un artefacto de investigacion de una linea anterior de Outlier, preservado por reproducibilidad y no recomendado para produccion. La card redirige a la linea actual (Outlier Nano 4B, Core 27B, Vision 35B-A3B) y a un dominio comercial externo. Cualquier afirmacion tecnica de revisiones previas de la card debe considerarse provisional segun el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) dispersa, variante `outlier_150b_rexmoe`, sobre base Qwen2.5-72B-Instruct; pesos ternarios cuantizados |
| Parametros totales | 150B (denominacion del autor; el modelo base subyacente es de 72B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria (ternary quantized); variantes adicionales no disponibles |
| Idiomas soportados | en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th, nl, pl (15 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 127,9 GB en Hugging Face, libreria `transformers` con `custom_code`) |

## Arquitectura y entrenamiento

La arquitectura declarada es una mezcla de expertos dispersa identificada como `outlier_150b_rexmoe`, construida como adaptador sobre Qwen2.5-72B-Instruct (un transformer decoder-only denso de 72B parametros). La innovacion principal documentada es el componente `GPUResidentExpert`: una cache de desquantizacion de una sola pasada que mantiene todos los pesos de los expertos residentes en GPU, eliminando el cuello de botella de aproximadamente 62 GB por forward asociado al offload de expertos a CPU. Segun la informacion disponible, este mecanismo requiere `device_map="auto"` distribuido en 2 o mas GPU y reporta una aceleracion de 56x frente a la inferencia ingenua con expertos descargados a CPU.

Los pesos se almacenan en formato ternario cuantizado, lo que reduce drasticamente la huella de memoria frente a precisiones de 16 bits y habilita el despliegue en hardware de consumo y en Apple Silicon. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o decodificacion especulativa. La model card advierte explicitamente que este repositorio puede contener adaptadores, overlays o variantes de cuantizacion experimentales que no llegaron al producto comercial, y que las afirmaciones tecnicas de revisiones anteriores deben tratarse como provisionales.

## Capacidades

- Generacion de texto y razonamiento paso a paso: los ejemplos de widget de la model card incluyen problemas matematicos verbales y acertijos de logica con instruccion explicita de "show reasoning step by step".
- Razonamiento matematico y aritmetico basico: problemas de trenes, maquinas y widgets, propios de evaluaciones tipo GSM8K.
- Razonamiento logico y resolucion de restricciones: el ejemplo "Logic grid" plantea un problema de asignacion con pistas negativas.
- Capacidades multilingues: 15 idiomas declarados (en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th, nl, pl).
- Despliegue en el borde y en local: etiquetas `on-device`, `edge-ai`, `local-llm`, `apple-silicon` y `mac` indican orientacion a inferencia en hardware de consumo.
- Eficiencia energetica y esparsidad: la cuantizacion ternaria y la arquitectura MoE dispersa buscan reducir el coste computacional por token.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita mas alla del razonamiento paso a paso en los ejemplos.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Razonamiento matematico asistido en local: el modelo puede resolver problemas verbales y aritmeticos paso a paso en un Mac o estacion de trabajo con GPU de consumo, gracias a la cuantizacion ternaria y a la cache de expertos residentes en GPU.
- Tutoria educativa y resolucion de acertijos logicos: los ejemplos de la card (logic grid, word problem) encajan con escenarios de ensenanza interactiva donde se requiere explicar el razonamiento, no solo la respuesta.
- Prototipado de investigación en tecnicas MoE: util como artefacto reproducible para estudiar el impacto de la cuantizacion ternaria y del `GPUResidentExpert` en el throughput de inferencia frente al offload a CPU.
- Inferencia multi-GPU con `device_map="auto"`: el requisito documentado de 2 o mas GPU con memoria suficiente permite desplegar el modelo en servidores con varias GPU para experimentos de latencia y throughput.
- Evaluacion comparativa de adaptadores sobre Qwen2.5-72B-Instruct: sirve como referencia para medir como un adaptador MoE ternario altera el rendimiento en MMLU respecto al modelo base denso.
- Procesamiento multilingue en el borde: con 15 idiomas declarados, puede emplearse en tareas de generacion de texto y traduccion ligera en dispositivos locales donde no se quiere enviar datos a la nube.
- Experimentacion con despliegue en Apple Silicon: las etiquetas `apple-silicon` y `mac` sugieren escenarios de inferencia local en macOS, aunque la card no detalla el stack concreto (MLX, llama.cpp u otro).

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card (no verificados de forma independiente):

| Benchmark | Metrica | Valor | Verificado |
|---|---|---|---|
| MMLU | accuracy (MMLU 5-shot) | 84,46 | No |

No se han publicado en la informacion disponible resultados de HumanEval, GSM8K, MATH ni otros benchmarks, ni comparaciones numericas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio pesa 127,9 GB, lo que da una cota inferior aproximada para cargar los pesos completos; la cuantizacion ternaria reduce la huella efectiva pero el autor no publica cifras de VRAM por configuracion.
- GPU recomendadas: el autor indica que `GPUResidentExpert` requiere `device_map="auto"` en 2 o mas GPU con memoria suficiente para mantener residentes los pesos de los expertos; no se especifican modelos concretos (A100, H100, RTX 4090).
- Cabe en GPU de consumo: no disponible. Las etiquetas `on-device`, `edge-ai` y `apple-silicon` apuntan a despliegue en hardware de consumo y Mac, pero sin cifras de memoria ni modelos concretos.
- Opciones de despliegue: `transformers` con codigo personalizado (`outlier_150b_rexmoe`) y `device_map="auto"`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: el autor reporta una aceleracion de 56x frente a la inferencia ingenua con expertos descargados a CPU, atribuida a la eliminacion del cuello de botella de aproximadamente 62 GB por forward en PCIe. No se publican valores absolutos de tokens por segundo ni latencia por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU 5-shot | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Outlier-150B-V3.2 | 150B (MoE ternario sobre Qwen2.5-72B-Instruct) | no disponible | 84,46 (declarado) | Apache 2.0 | Hugging Face (artefacto de investigacion, superseded) |
| Qwen/Qwen2.5-72B-Instruct (modelo base) | 72B densos | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |
| Outlier Core 27B (sucesor recomendado por el autor) | 27B | no disponible | no disponible | no disponible | Hugging Face (MLX 4-bit) |
| Outlier Nano 4B (sucesor recomendado por el autor) | 4B | no disponible | no disponible | no disponible | Hugging Face (MLX 4-bit) |

No se dispone de datos de benchmarks ni de contexto para los modelos comparados en la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo marcado como **superseded** por el propio autor: es un artefacto de investigacion de una linea anterior, preservado por reproducibilidad y no recomendado para produccion.
- La model card advierte que puede contener adaptadores, overlays o variantes de cuantizacion experimentales que no llegaron al producto comercial, y que las afirmaciones tecnicas de revisiones previas son provisionales.
- El unico benchmark declarado (MMLU 5-shot = 84,46) figura como no verificado (`verified: false`) y procede del propio autor; no hay validacion independiente.
- La relacion entre la denominacion "150B" y el modelo base de 72B no se detalla en la informacion disponible, lo que dificulta interpretar el numero real de parametros activos y totales.
- No se documentan sesgos conocidos, tasas de alucinacion ni evaluaciones de seguridad.
- No se especifica la longitud de contexto soportada, lo que impide planificar cargas con ventanas largas.
- El requisito de 2 o mas GPU con `device_map="auto"` para aprovechar `GPUResidentExpert` limita el despliegue a entornos multi-GPU; el rendimiento en configuraciones de una sola GPU o solo CPU no esta documentado.
- La licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen2.5-72B-Instruct conviene verificar las condiciones del modelo base antes de explotarlo en produccion.
- La card incluye enlaces y promociones a un dominio comercial externo (`outlier.host`) y a un instalador via Homebrew; deben tratarse como material promocional, no como documentacion tecnica.

## Enlaces

- Hugging Face: https://huggingface.co/Outlier-Ai/Outlier-150B-V3.2
- README del repositorio: https://huggingface.co/Outlier-Ai/Outlier-150B-V3.2/blob/main/README.md
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-72B-Instruct
- Sucesor recomendado (Nano 4B): https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
- Sucesor recomendado (Core 27B): https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Sucesor recomendado (Vision 35B-A3B): https://huggingface.co/Outlier-Ai/Outlier-Vision-35B-A3B-MLX-4bit
- DeepSeek-R1-Distill-Qwen-7B (MLX 4-bit): https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
- Qwen3-Coder-30B-A3B (MLX 4-bit): https://huggingface.co/Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit
- Sitio del autor: https://outlier.host/
