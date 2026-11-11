# agu18dec/mOre-lenses

## Resumen

mOre-lenses es una colección de adaptadores LoRA publicada por el usuario agu18dec que implementa OLens (oracle lens), una técnica de interpretabilidad por inversión de activaciones. El objetivo no es generar texto de forma convencional, sino traducir un vector del *residual stream* de un modelo de lenguaje (la salida del bloque decodificador `L` en un token concreto) de vuelta a texto legible. Esto permite auditar qué información codifica una activación interna y construir rewards y evaluaciones basadas en representaciones, no en salidas superficiales.

El repositorio contiene adaptadores para doce modelos base distintos: Gemma-4-31B-it, las tallas densas de Qwen3.5 (0.8B, 2B, 4B y 9B), Qwen3.6-27B, Qwen3-8B, GLM-5.3-Flash, DeepSeek-V4-Flash, Qwen3.6-35B-A3B, Kimi-K2-Instruct-0905 y Kimi-Linear-48B-A3B-Instruct. Cada adaptador se aplica sobre el propio modelo sujeto (el lens lee el modelo con el propio modelo) y hereda la licencia de ese modelo base. La excepción es Kimi-K2-Instruct-0905, donde el lector es Kimi-Linear-48B-A3B-Instruct con un puente lineal de 7168 a 2304 dimensiones.

La relevancia actual es metodológica: OLens formaliza un pipeline en cuatro etapas (reconstructor de activaciones, inverter, destilación y RL con GRPO) que produce descripciones conceptuales de activaciones evaluadas en WorkspaceBench. El repositorio ocupa 29,9 GB y se distribuye como adaptadores PEFT en safetensors, no como pesos completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r16) sobre modelos transformer decoder-only; pipeline OLens de cuatro etapas (AR, inverter, distill, RL) |
| Parametros totales | no disponible (adaptadores LoRA; el tamaño depende del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base; el span de lectura del AR es de 1-32 tokens) |
| Tipos de cuantizacion | no disponible (los adaptadores se publican en safetensors; la cuantización aplica al modelo base) |
| Idiomas soportados | no disponible |
| Licencia | other / per-base-model (cada adaptador hereda la licencia de su modelo base) |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); incluye `bridge.pt` para el caso Kimi |

## Arquitectura y entrenamiento

OLens se construye en cuatro etapas, todas con LoRA de rango 16 sobre el modelo sujeto. La primera es el reconstructor de activaciones (AR): lee un span de texto de 1 a 32 tokens precedido de una etiqueta `[Layer NN]` y predice el residual del sujeto en esa capa mediante una cabeza lineal por capa, entrenada con una pérdida blanqueada. Sus reconstrucciones alimentan al inverter y sus embeddings definen la recompensa del RL. La segunda etapa es el inverter: dado un vector inyectado en un token slot, genera el span de texto que lo produjo; se entrena una época sobre pares (reconstrucción AR, span) con `k=4` capas aleatorias por recorte y una transformación `scaled` con una única escala global congelada ajustada para que la norma mediana inyectada sea `alpha = 16000`.

La tercera etapa es la destilación: para residuales verdaderos de validación se muestrean `k'=64` candidatos del propio inverter del sujeto (T=1, top-p 0.95), un OMP no negativo sobre los embeddings del AR selecciona los conceptos que reconstruyen conjuntamente `h` (candidatos de prefijo 2..32, epsilon de contracción 0.005, ganancia mínima 0.005) y el modelo de destilación, inicializado desde el inverter, se ajusta por SFT para emitir esos conceptos como viñetas `- ` con la transformación `unit` (`v = alpha * h/|h|`). La cuarta etapa aplica GRPO durante 600 pasos partiendo del modelo de destilación, con una recompensa de reconstrucción por mínimos cuadrados no negativos, blanqueada y de norma unitaria, sobre los embeddings del AR de las viñetas generadas, contrastada contra distractores.

La inyección reemplaza la salida del módulo de embeddings de entrada en la posición del slot (tras el escalado interno `sqrt(d)` de Gemma). El token slot es el primer ideograma encerrado (U+3200-U+33FF) que sobrevive como token único en el chat renderizado. El muestreo de referencia en WorkspaceBench es T=1.0, top-p 0.95, top-k 64 y 256 tokens nuevos.

## Capacidades

- Inversión de activaciones: convierte un vector del residual stream de una capa concreta en texto o en una lista de conceptos.
- Reconstrucción de spans: el inverter predice el texto que inmediatamente sigue a una activación dada.
- Extracción de conceptos: los modelos de destilación y RL emiten viñetas con conceptos distintos que codifican la activación.
- Lectura multcapa: el AR dispone de cabezas lineales por capa, lo que permite leer distintas profundidades del modelo.
- Evaluación por representaciones: las puntuaciones de WorkspaceBench se calculan sobre las activaciones, no sobre la salida textual.
- Soporte multi-modelo: adaptadores para doce modelos base de familias y tamaños distintos (Gemma, Qwen, GLM, DeepSeek, Kimi).
- Puente entre dimensiones: para Kimi-K2-Instruct-0905, un puente lineal de 7168 a 2304 permite que un lector de otra talla interprete las activaciones del sujeto.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking; el uso previsto es interpretabilidad, no generación de propósito general.

## Casos de uso

- Auditoría de representaciones internas: dado un prompt y una capa `L`, extraer el residual del último token e invertirlo para comprobar qué información semántica está codificada en ese punto del modelo, útil para depurar comportamientos inesperados.
- Detección de conceptos en activaciones: usar los modelos de destilación o RL para obtener listas de conceptos que expliquen una activación, lo que facilita el análisis de características en estudios de interpretabilidad mecanicista.
- Construcción de rewards basados en representaciones: el pipeline documenta cómo el AR define la recompensa del RL; equipos de investigación pueden reutilizar esta receta para entrenar políticas guiadas por activaciones internas.
- Evaluación comparativa entre modelos: al existir adaptadores para doce modelos base, se pueden comparar las descripciones de activaciones de distintas familias y tamaños bajo la misma metodología y con las mismas puntuaciones de WorkspaceBench.
- Investigación en seguridad y alineamiento: la inversión de activaciones permite inspeccionar si un modelo codifica información sensible o sesgos en capas intermedias antes de que se manifieste en la salida.
- Estudio de transferencia entre modelos: el caso Kimi con puente lineal sirve para investigar si un lector de menor dimensión puede interpretar las activaciones de un modelo mayor, un problema abierto en interpretabilidad cross-model.
- Reproducción de experimentos: el repositorio incluye la receta exacta de cada ejecución y las puntuaciones de WorkspaceBench, lo que permite replicar y verificar los resultados publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona puntuaciones de WorkspaceBench para cada adaptador, pero no incluye los valores numéricos en el contenido proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para los adaptadores en sí; depende del modelo base. Los adaptadores LoRA añaden una sobrecarga mínima frente a los pesos completos del sujeto.
- Modelos base pequeños (Qwen3.5-0.8B, 2B): pueden ejecutarse en GPUs de consumo como RTX 3060/4060 con cuantización, aunque la cuantización de los adaptadores no está documentada.
- Modelos base medianos (Qwen3.5-4B, 9B, Qwen3-8B): requieren GPUs de 16-24 GB en bf16; una RTX 4090 o A5000 es suficiente para el 9B en bf16.
- Modelos base grandes (Gemma-4-31B-it, Qwen3.6-27B, Qwen3.6-35B-A3B, Kimi-Linear-48B-A3B-Instruct): necesitan A100 80 GB, H100 o múltiples GPUs; el ejemplo de la model card usa `device_map="auto"` y `torch_dtype=torch.bfloat16`.
- Kimi-K2-Instruct-0905: el sujeto es de gran tamaño y el lector es Kimi-Linear-48B-A3B-Instruct; el puente lineal añade un paso adicional que no se detalla en requisitos de memoria.
- Opciones de despliegue: la model card usa `transformers` con `peft`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y la inyección manual de embeddings en el slot hace que estos motores no sean directamente aplicables sin adaptación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mOre-lenses (OLens) | Adaptadores LoRA de interpretabilidad | Depende del base (r16 LoRA) | Heredado del base | per-base-model | Hugging Face, 0 descargas |
| SAE (sparse autoencoders) | Herramienta de interpretabilidad | Depende del base | No aplica | Variable segun publicacion | Distintas implementaciones |
| Logit lens | Técnica de interpretabilidad | No requiere entrenamiento | No aplica | No aplica | Implementaciones abiertas |
| Activation patching | Técnica de interpretabilidad | No requiere entrenamiento | No aplica | No aplica | Implementaciones abiertas |

La comparación con SAE, logit lens y activation patching es cualitativa: no se dispone de datos de rendimiento comparables en la información proporcionada. OLens se distingue por producir descripciones en lenguaje natural y por su pipeline de RL, mientras que logit lens y activation patching son técnicas sin entrenamiento y los SAE requieren entrenamiento específico por modelo.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes; no hay evidencia de validación por parte de la comunidad.
- La licencia es `other` con nombre `per-base-model`: cada adaptador hereda la licencia de su modelo base, lo que impone restricciones distintas según el caso y puede impedir el uso comercial en algunos de ellos.
- El uso previsto es interpretabilidad; no está diseñado como modelo de generación de propósito general y no se documentan capacidades de tool calling, agentes ni multilingüismo.
- La inyección manual de vectores en el slot requiere acceso a `inputs_embeds` y a las hidden states del modelo base; no es compatible sin adaptación con motores de inferencia estándar.
- El caso Kimi-K2-Instruct-0905 no sigue el código de ejemplo de la model card: requiere el puente `bridge.pt` y un README específico.
- No se documentan sesgos, tasas de alucinación ni evaluaciones de robustez; la naturaleza del inverter (generar texto a partir de un vector) implica riesgo de descripciones plausibles pero incorrectas.
- La escala global congelada y el valor `alpha = 16000` están fijados por la receta; desviarse de ellos puede degradar la fidelidad de la inversión.
- No se especifican los idiomas soportados ni el comportamiento fuera del inglés.
- El tamaño del repositorio (29,9 GB) y la dependencia de modelos base de hasta 48B limitan su uso a entornos con recursos considerables.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/agu18dec/mOre-lenses
- Modelo base Gemma-4-31B-it: https://huggingface.co/google/gemma-4-31B-it
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo base Qwen3.6-27B: https://huggingface.co/Qwen/Qwen3.6-27B
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Modelo base GLM-5.3-Flash: https://huggingface.co/zai-org/GLM-5.3-Flash
- Modelo base DeepSeek-V4-Flash: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Modelo base Kimi-K2-Instruct-0905: https://huggingface.co/moonshotai/Kimi-K2-Instruct-0905
- Modelo base Kimi-Linear-48B-A3B-Instruct: https://huggingface.co/moonshotai/Kimi-Linear-48B-A3B-Instruct
- PEFT: https://github.com/huggingface/peft
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
