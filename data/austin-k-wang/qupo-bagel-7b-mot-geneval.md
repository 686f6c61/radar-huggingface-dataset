# austin-k-wang/qupo-bagel-7b-mot-geneval

## Resumen

QUPO BAGEL-7B-MoT GenEval es un ajuste fino del modelo multimodal BAGEL-7B-MoT de ByteDance-Seed, publicado por austin-k-wang. El ajuste se ha realizado con Quantile Utility Policy Optimization (QUPO), un metodo de optimizacion de politica basado en utilidad por cuantiles, sobre prompts del benchmark GenEval. El objetivo del trabajo, descrito en el paper "Do Visual RL Gains Scale at Test Time? A Quantile View of Post-Training" (arXiv:2611.02366), es estudiar si las ganancias de aprendizaje por refuerzo visual escalan en tiempo de test desde una perspectiva de cuantiles.

El modelo hereda la arquitectura MoE (Mixture of Experts) de BAGEL-7B-MoT y esta orientado a la generacion de imagenes a partir de texto (pipeline text-to-image), aunque al derivar de un modelo multimodal conserva la estructura base de este. El checkpoint se distribuye en formato safetensors con un total de 14.691.079.811 parametros reales y un tamano de repositorio de 29,5 GB.

Su relevancia es fundamentalmente de investigacion: sirve como artefacto reproducible para evaluar el efecto de QUPO sobre la fidelidad composicional en generacion texto-a-imagen segun GenEval, y como punto de partida para quien quiera replicar o extender el metodo. La licencia Apache 2.0 y su naturaleza de ajuste sobre un modelo abierto facilitan su inspeccion y reutilizacion experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) heredada de BAGEL-7B-MoT |
| Parametros totales | 14.691.079.811 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de ByteDance-Seed/BAGEL-7B-MoT, un modelo multimodal con arquitectura Mixture of Experts. Sobre esa base se aplica un ajuste fino con Quantile Utility Policy Optimization (QUPO), un metodo de optimizacion de politica que, segun el titulo del paper asociado, aborda el post-entrenamiento desde una perspectiva de cuantiles y estudia si las ganancias del RL visual escalan en tiempo de test. El ajuste se realiza especificamente sobre prompts de GenEval, un benchmark de generacion texto-a-imagen centrado en fidelidad composicional (atributos, relaciones espaciales, conteo y objetos multiples).

No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, la presencia de RLHF/DPO adicional ni innovaciones tecnicas concretas mas alla del propio algoritmo QUPO. El detalle metodologico debe consultarse en el paper arXiv:2611.02366 y en el repositorio de codigo del autor.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (pipeline text-to-image), con enfasis en fidelidad composicional segun los prompts de GenEval.
- Al derivar de BAGEL-7B-MoT, conserva la estructura multimodal del modelo base, aunque la model card no detalla que capacidades adicionales (comprension de imagen, edicion, etc.) se preservan tras el ajuste.
- Optimizacion orientada a la alineacion con prompts de evaluacion composicional (atributos, conteo, relaciones espaciales).
- No se documenta en la informacion disponible soporte de tool calling, function calling, agentes, modo thinking, audio ni capacidades multilingues explicitas.

## Casos de uso

- Investigacion en post-entrenamiento de modelos generativos: el checkpoint permite reproducir y analizar el efecto de QUPO sobre la generacion texto-a-imagen, comparandolo con el modelo base BAGEL-7B-MoT.
- Evaluacion de fidelidad composicional: util para medir el rendimiento en GenEval (atributos, conteo, posiciones) y estudiar donde mejora o falla el ajuste por RL.
- Experimentos de escalado en tiempo de test: sirve como artefacto para investigar si las ganancias de RL visual se mantienen o amplian al aumentar el esfuerzo de inferencia.
- Linea base para nuevos ajustes: al estar bajo Apache 2.0, puede usarse como punto de partida para aplicar QUPO a otros conjuntos de prompts o dominios.
- Docencia y divulgacion tecnica: ejemplo practico de aplicacion de optimizacion de politica por cuantiles a un modelo multimodal abierto.
- Reproducibilidad de resultados: permite verificar las cifras del paper arXiv:2611.02366 con los mismos pesos publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de metricas (GenEval u otras) para este checkpoint; para cifras concretas debe consultarse el paper arXiv:2611.02366.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo con 14.691.079.811 parametros en safetensors ocupa aproximadamente 29,5 GB en precision de 16 bits, por lo que la inferencia sin cuantizar requiere del orden de 30 GB o mas de memoria, dependiendo del pipeline y del overhead del modelo multimodal.
- GPU recomendadas: no especificadas por el autor. Por volumen de pesos, encajan GPU de datacenter con 40-80 GB (A100, H100) para ejecucion en precision nativa.
- Cabe en GPU de consumo: probablemente solo con cuantizacion agresiva y en tarjetas de 24 GB o mas (por ejemplo, RTX 4090), aunque no hay confirmacion oficial ni recetas publicadas.
- Opciones de despliegue: no se documentan en la model card. Al ser un derivado de BAGEL-7B-MoT, conviene revisar el repositorio oficial del modelo base para el stack de inferencia soportado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QUPO BAGEL-7B-MoT GenEval | 14.691.079.811 | no disponible | Texto-a-imagen con ajuste QUPO | Apache 2.0 | Hugging Face |
| ByteDance-Seed/BAGEL-7B-MoT | no disponible | no disponible | Modelo multimodal base (MoE) | no disponible en esta ficha | Hugging Face |
| Alternativas texto-a-imagen de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada solo permite comparar con el modelo base. No se dispone de datos de rendimiento ni de especificaciones de terceros para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- El ajuste esta especializado en prompts de GenEval; el rendimiento fuera de esa distribucion puede degradarse respecto al modelo base.
- No hay datos publicados de sesgos, tasas de alucinacion visual ni evaluaciones cualitativas en la informacion disponible.
- No se documentan idiomas soportados; la cobertura multilingue de los prompts no esta garantizada.
- Al ser un checkpoint de investigacion con 26 descargas y 2 likes, su validacion por la comunidad es muy limitada.
- Aunque la licencia es Apache 2.0, es un derivado de BAGEL-7B-MoT; conviene verificar las condiciones del modelo base antes de un uso comercial.
- No se especifican requisitos de hardware ni recetas de cuantizacion, lo que complica el despliegue en produccion.
- El numero de parametros reportado (14.691.079.811) no coincide con la denominacion "7B" del modelo base; conviene tenerlo en cuenta al planificar recursos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/austin-k-wang/qupo-bagel-7b-mot-geneval
- Modelo base: https://huggingface.co/ByteDance-Seed/BAGEL-7B-MoT
- Paper: https://arxiv.org/abs/2611.02366
- Codigo: https://github.com/austin-k-wang/QUPO
