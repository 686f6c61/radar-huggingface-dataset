# asher577/scaling_signed_dcp_d1024_L2_t125000000_s1_mlpsigned_strong5

## Resumen

`scaling_signed_dcp_d1024_L2_t125000000_s1_mlpsigned_strong5` es un transformer de pesos dispersos (weight-sparse) entrenado por el usuario asher577 siguiendo el procedimiento descrito por Gao et al. (2025). No se trata de un modelo de proposito general ni de un producto listo para produccion, sino de un experimento de investigacion a pequena escala sobre escalado de dispersidad en redes neuronales. El nombre codifica los hiperparametros del experimento: dimension de modelo 1024, 2 capas, 125 millones de tokens de entrenamiento y una variante de dispersidad "strong5" en la capa MLP.

El modelo tiene unicamente 2 capas, una dimension de 1024, una longitud de contexto de 512 tokens y un vocabulario de 4096 tokens. Esta entrenado sobre el dataset `jacobcd52/simplestories-tokenized` con el tokenizador `SimpleStories/SimpleStories-1.25M`, lo que lo situa en el ambito de los modelos de juguete para estudio de dinamicas de entrenamiento y dispersidad, no para tareas reales de generacion.

Su relevancia es exclusivamente academica: permite reproducir y analizar los efectos de la dispersion de pesos (weight sparsity) y de activaciones (activation sparsity) con un objetivo L0 del 1 por ciento, en un regimen de computo muy reducido (repo de 0,3 GB). No dispone de model card con benchmarks, licencia declarada ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (weight-sparse, con dispersion de activaciones) |
| Parametros totales | no disponible (dimension 1024, 2 capas, vocab 4096) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`pytorch_model.bin`) |

## Arquitectura y entrenamiento

Se trata de un transformer de 2 capas con dimension de modelo 1024, dimension de cabeza 16 y vocabulario de 4096 tokens. El autor indica que es un "weight-sparse transformer trained with the procedure from Gao et al. (2025)", con dispersion de pesos activada, un objetivo de fraccion L0 de 0,01 (es decir, aproximadamente el 1 por ciento de los pesos activos) y dispersion de activaciones tambien activada. La variante "mlpsigned_strong5" sugiere una configuracion especifica de dispersidad en las capas MLP, aunque el autor no detalla en la model card el algoritmo exacto de enmascaramiento ni la implementacion.

El entrenamiento utilizo el dataset `jacobcd52/simplestories-tokenized` con el tokenizador `SimpleStories/SimpleStories-1.25M`, procesando un total de 125.000.000 de tokens. No se menciona en la informacion disponible el uso de RLHF, DPO ni ninguna fase de alineacion; tampoco se detalla la composicion del dataset ni si hubo decodificacion especulativa u otras innovaciones de inferencia. El run de entrenamiento esta registrado en Weights & Biases (ver enlaces).

## Capacidades

- Generacion de texto a nivel de modelo de juguete: entrenado sobre historias simples (SimpleStories), puede producir continuaciones de texto muy basicas dentro de su distribucion de entrenamiento.
- Estudio de dispersion de pesos: permite analizar el comportamiento de un transformer con un objetivo L0 del 1 por ciento.
- Estudio de dispersion de activaciones: configurado con dispersion de activaciones activa, util para investigar eficiencia computacional.
- Reproducibilidad de experimentos de escalado: el nombre del modelo codifica los hiperparametros, facilitando comparaciones entre runs.
- No soporta tool calling ni function calling (no documentado).
- No soporta agentes ni razonamiento multi-paso (no documentado).
- Capacidades multilingues: no disponibles; el tokenizador y dataset son de SimpleStories, orientados a ingles simple.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Investigacion sobre dispersion de pesos: el modelo sirve como punto de datos en estudios de escalado de dispersidad, permitiendo medir como varia la perplejidad con un objetivo L0 del 1 por ciento en un regimen de 2 capas y 1024 de dimension.
- Reproduccion de resultados de Gao et al. (2025): util para validar el procedimiento de entrenamiento descrito en dicho trabajo con un presupuesto de computo minimo.
- Analisis de dispersion de activaciones: permite instrumentar las activaciones y estudiar patrones de activacion dispersa en un transformer pequeno.
- Experimentos de eficiencia en inferencia: al ser un modelo de 0,3 GB, se puede cargar en CPU y analizar el ahorro teorico de la dispersion de pesos sin necesidad de GPU.
- Docencia y formacion: ejemplo minimo y reproducible de un transformer disperso para cursos de arquitecturas eficientes.
- Baseline en comparativas de metodos de pruning: sirve como referencia de un modelo ya disperso frente a modelos densos del mismo tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (repo de 0,3 GB); cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; tambien ejecutable en CPU.
- Cabe en consumer GPU: si, en cualquier modelo (GTX 1050, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: carga manual con PyTorch (`torch.load` sobre `pytorch_model.bin`); requiere la clase `SparseGPT` del repositorio del autor. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| scaling_signed_dcp_d1024_L2_t125000000_s1_mlpsigned_strong5 | no disponible (dim. 1024, 2 capas) | 512 | no disponible | Hugging Face (repo del autor) |
| Modelos densos de juguete tipo SimpleStories | ~1-10M | variable | variable | Hugging Face |
| Transformers pequenos de investigacion (p. ej. nanoGPT) | ~10-100M | variable | MIT (tipico) | GitHub / Hugging Face |

No se dispone de datos de rendimiento comparables para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo de investigacion a muy pequena escala: 2 capas y contexto de 512 tokens; no apto para tareas de produccion.
- Vocabulario de solo 4096 tokens y entrenamiento sobre SimpleStories: capacidad linguistica muy limitada y sesgada al dominio de historias simples en ingles.
- Riesgo elevado de alucinacion y generacion incoherente fuera de su distribucion de entrenamiento.
- Licencia no declarada: no se puede asumir uso comercial permitido; consultar con el autor antes de cualquier uso.
- Requiere una clase de modelo personalizada (`SparseGPT`) del repositorio del autor; no es compatible directamente con `transformers` de forma estandar.
- Sin informacion sobre sesgos, datos de alineacion ni evaluaciones de seguridad.
- No se documentan idiomas soportados; se asume ingles por el dataset de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/asher577/scaling_signed_dcp_d1024_L2_t125000000_s1_mlpsigned_strong5
- Run de Weights & Biases: https://wandb.ai/asher577/scd_scaling/runs/ntx5lojt
- Dataset: https://huggingface.co/datasets/jacobcd52/simplestories-tokenized
- Tokenizador: https://huggingface.co/SimpleStories/SimpleStories-1.25M
