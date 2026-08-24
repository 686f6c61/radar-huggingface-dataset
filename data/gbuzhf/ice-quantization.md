# gbuzhf/ICE-quantization

## Resumen

ICE (*Isolation of Compounding Error*) es un método de asignación de bits para cuantización de checkpoints de modelos sparse Mixture-of-Experts (MoE), desarrollado por Gökhan Buz (gbuzhf) y publicado como informe técnico en Hugging Face bajo licencia Apache 2.0. El método aborda un problema concreto: los cuantizadores GGUF existentes minimizan el error ponderado por importancia de cada tensor para el token actual, lo cual es correcto solo para tensores cuyo error muere con el token, pero no para aquellos cuyo error se propaga a lo largo de la secuencia o entre tokens. ICE clasifica cada tensor según la distancia que recorre su error y asigna precisión en consecuencia: los tensores con error propagante se congelan en alta precisión (F32 o F16), y el presupuesto de bits restante se concentra en los tensores de efecto instantáneo.

La relevancia actual de ICE radica en que los modelos MoE, como Mixtral o DeepSeek, son cada vez más comunes en despliegues locales, y la cuantización eficiente es clave para ejecutarlos en hardware limitado. El método reporta mejoras de hasta un 13% en divergencia KL frente a métodos publicados como Unsloth Dynamic 2.0 (UD) y LocalAI APEX, a igual o menor tamaño de archivo. El repositorio incluye el informe técnico completo, recetas de cuantización, mediciones crudas y un protocolo de reproducción basado en `llama-perplexity`. No se trata de un modelo de lenguaje, sino de una técnica de compresión aplicable a cualquier checkpoint MoE en formato GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Metodo de cuantizacion para modelos sparse MoE (no es un modelo) |
| Parametros totales | no disponible (depende del checkpoint al que se aplique) |
| Parametros activos | no disponible (depende del checkpoint al que se aplique) |
| Longitud de contexto | no disponible (no aplica; el metodo opera sobre tensores, no sobre secuencias) |
| Tipos de cuantizacion | F32, F16, y tipos GGUF de menor precision (Q4, Q5, Q6, IQ4, etc.) asignados por clase de error |
| Idiomas soportados | no disponible (no aplica; el metodo es agnostico al idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (genera archivos .gguf compatibles con llama.cpp) |

## Arquitectura y entrenamiento

ICE no es un modelo entrenado, sino un procedimiento de cuantización. Su núcleo es una taxonomía de cuatro clases de tensores según la propagación del error de cuantización:

- **DISCRETE**: el error cambia un argmax, alterando la computación posterior. Se mantiene en F32 exacto.
- **RECURRENT**: el error entra en un estado con decaimiento y se compone a lo largo de la secuencia. Se mantiene en F32 exacto.
- **CACHED**: el error se escribe en la caché KV y es releído por tokens posteriores. Se mantiene en F16 casi exacto.
- **INSTANT**: el error afecta solo al token actual. Aquí se concentra el presupuesto de bits.

Estas tres primeras clases representan solo el 0,14% del modelo, por lo que congelarlas no supone un coste relevante. El método se rige por cuatro leyes empíricas: (1) *Sparsity*: un bit en el núcleo siempre activo vale E/k bits en el banco de expertos (medido 31,8 frente a 32 predicho); (2) *Convexity*: el error cae como 4^-b, limitando la ganancia de asignación inteligente a +0,139 bpw; (3) *Placement*: dentro de un rango de tipos fijo, la asignación superficial primero aporta ~8,5% de KLD por bpw de diferencia, y se invierte por debajo de 0,47 bpw; (4) *Floor epistémico*: existe un límite inferior de error medido en 0,018297, y el mejor archivo obtenido queda un 8% por encima.

El informe documenta siete resultados negativos, incluida la retracción de una regla propia (subir `ffn_down` por encima de sus proyecciones hermanas resultó un 11,3% peor que uniforme). El protocolo de reproducción usa `llama-perplexity` con `--kl-divergence` sobre WikiText-2, y la misma receta medida por tres vías dio una dispersión inferior al 1%.

## Capacidades

- Asignación de precisión por tensor basada en la clase de propagación del error, no en la magnitud del peso.
- Generación de archivos GGUF listos para llama.cpp, con recetas específicas para cada nivel de tamaño (19G, 21G, 23G, 25G, etc.).
- Compatibilidad con checkpoints MoE sparse; el método asume que existe una distinción entre núcleo siempre activo y banco de expertos.
- Reproducibilidad: incluye checksums SHA-256, recetas y mediciones crudas en el repositorio.
- Documentación de resultados negativos y límites del método (transparencia metodológica).
- Comparación objetiva con otros ladders de cuantización (UD, APEX) bajo un mismo harness.

## Casos de uso

- **Despliegue local de modelos MoE en GPU de consumo**: ICE permite reducir el tamaño de un checkpoint MoE (p. ej., 23 GB frente a 24-26 GB de alternativas) manteniendo menor divergencia KL, lo que facilita ejecutar modelos como Mixtral en GPUs con 24 GB de VRAM.
- **Servicios de inferencia en CPU con llama.cpp**: los archivos GGUF generados con ICE se ejecutan directamente en llama.cpp, permitiendo servir modelos MoE en entornos sin GPU dedicada, con mejor calidad por byte que otros cuantizadores.
- **Investigación en cuantización**: el informe técnico y las recetas sirven como referencia para estudiar la relación entre propagación de error y asignación de bits, y para validar nuevas técnicas.
- **Optimización de pipelines de CI/CD para modelos**: al integrar ICE en un flujo de cuantización automática, se pueden generar múltiples niveles de tamaño (19G, 21G, 23G, 25G) con criterios objetivos y reproducibles.
- **Evaluación comparativa de cuantizadores**: el protocolo de medición con `llama-perplexity` y KLD permite comparar cualquier método de cuantización bajo las mismas condiciones, útil para equipos que deben elegir entre UD, APEX o ICE.
- **Aplicaciones con restricciones de memoria estricta**: los niveles de 19G y 21G permiten ejecutar modelos MoE en hardware con 16-20 GB de VRAM, donde otros métodos no ofrecen opciones por debajo de 18,5 GB (según el informe, solo APEX cubre ese rango).

## Benchmarks y rendimiento

El informe proporciona la siguiente tabla de divergencia KL media (menor es mejor) contra el checkpoint bf16, medida con un único harness sobre WikiText-2:

| Nivel | Tamano | KLD media | Nivel publicado mas cercano | Resultado |
|---|---:|---:|---|---|
| `23G-ICE` | 22,83 GB | 0,0361 | `UD-Q4_K_XL` 23,21 GB / 0,0380 | 0,38 GB menor, 5,0% mejor |
| `23G-ICE` | 22,83 GB | 0,0361 | `APEX-I-Quality` 23,84 GB / 0,0415 | 1,01 GB menor, 13,0% mejor |
| `25G-ICE` | 24,84 GB | 0,0303 | `APEX-I-Balanced` 26,28 GB / 0,0345 | 1,44 GB menor, 12,2% mejor |
| `19G-ICE` | 18,82 GB | 0,0608 | `UD-IQ4_XS` 18,68 GB / 0,0723 | 15,8% mejor a +0,14 GB |

En la comparación de doce niveles, nueve son Pareto-óptimos y tres están estrictamente dominados. El informe reconoce que ICE no gana en el extremo superior: `UD-Q5_K_S` y `UD-Q6_K` son los mejores archivos medidos, lo que se explica por la Ley 4 (límite epistémico). No se han publicado resultados en benchmarks de tareas (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- No aplica directamente: ICE es un método de cuantización, no un modelo. Los requisitos dependen del checkpoint MoE al que se aplique.
- Los archivos generados son GGUF, por lo que se ejecutan con llama.cpp en CPU (con o sin aceleración) o GPU.
- Para los niveles reportados (19-25 GB), se recomienda al menos 16-24 GB de VRAM en GPU para inferencia cómoda, o 32 GB de RAM en CPU.
- El proceso de cuantización en sí requiere el checkpoint original en bf16 y herramientas de llama.cpp; no se especifican requisitos de hardware para ejecutar el método.
- Opciones de despliegue: llama.cpp, Ollama (si soporta GGUF), y cualquier runtime compatible con GGUF.

## Comparativa con modelos similares

ICE se compara con dos ladders de cuantización publicados:

| Metodo | Tamano tipico | KLD (WikiText-2) | Licencia | Disponibilidad |
|---|---|---|---|---|
| ICE (23G) | 22,83 GB | 0,0361 | Apache 2.0 | Repositorio publico con recetas |
| Unsloth Dynamic 2.0 (UD-Q4_K_XL) | 23,21 GB | 0,0380 | no disponible | Publicado por Unsloth |
| LocalAI APEX (I-Quality) | 23,84 GB | 0,0415 | no disponible | Publicado por LocalAI |

ICE ofrece mejor KLD a menor tamaño en los niveles comparados, pero no supera a UD-Q5_K_S y UD-Q6_K en el extremo superior. La comparativa se basa en un único harness, lo que la hace más fiable que las comparaciones entre ladders con harness propios.

## Limitaciones y advertencias

- El método está diseñado específicamente para modelos MoE sparse; no es aplicable a modelos densos sin adaptación.
- El límite epistémico (Ley 4) implica que no se puede mejorar indefinidamente la calidad por debajo de un cierto KLD, independientemente de la asignación de bits.
- Tres de los doce niveles generados están estrictamente dominados y no se incluyen en el repositorio; el método no garantiza optimalidad en todos los tamaños.
- La retracción de la regla de `ffn_down` muestra que prácticas estándar en cuantización pueden ser perjudiciales; se recomienda validar cada receta en el contexto de uso.
- No se han publicado evaluaciones en tareas downstream (razonamiento, código, etc.); la métrica principal es KLD, que correlaciona con calidad pero no la sustituye.
- El informe es un technical report, no un paper revisado por pares; aunque incluye protocolos de reproducción, la validación externa es limitada.
- La licencia Apache 2.0 permite uso comercial, pero los modelos cuantizados con ICE deben cumplir la licencia del checkpoint original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gbuzhf/ICE-quantization
- Informe tecnico (dentro del repo): `paper/ICE_Technical_Report.md`
- DOI asociado: 10.57967/hf/10112
- Documentacion de cuantizacion de Hugging Face (contexto general): https://huggingface.co/docs/optimum/concept_guides/quantization
- Blog de NVIDIA sobre cuantizacion: https://developer.nvidia.com/blog/model-quantization-concepts-methods-and-why-it-matters/
- Lista de recursos sobre cuantizacion: https://github.com/AI-Efficiency/Awesome-Model-Quantization/
