# asher577/scaling_signed_dcp_d768_L2_t250000000_s0_mlpsigned_strong5

## Resumen

El modelo `scaling_signed_dcp_d768_L2_t250000000_s0_mlpsigned_strong5` es un transformer disperso en pesos (weight-sparse) de pequeno tamano publicado por el usuario asher577 en Hugging Face. Se trata de un artefacto de investigacion disenado para estudiar el escalado de tecnicas de dispersidad estructural en transformers, siguiendo el procedimiento descrito por Gao et al. (2025). No es un modelo de proposito general ni esta pensado para uso en produccion: su interes es exclusivamente experimental.

La arquitectura es un transformer muy compacto de solo 2 capas, dimension de modelo 768, dimension de cabeza 16 y una longitud de contexto de 512 tokens. El vocabulario es de 4096 tokens y fue entrenado sobre el dataset `jacobcd52/simplestories-tokenized` con el tokenizador SimpleStories-1.25M, acumulando 250 millones de tokens de entrenamiento.

Su relevancia radica en que aplica simultaneamente dispersidad en pesos (weight sparsity) y dispersidad en activaciones (activation sparsity), con una fraccion objetivo L0 de 0,01. Esto lo convierte en una pieza util para investigadores que estudian como la dispersidad afecta al entrenamiento y al rendimiento en regimenes de escalado, aunque sus capacidades practicas son muy limitadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (weight-sparse, activation-sparse) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`pytorch_model.bin`) |
| Capas | 2 |
| Dimension de modelo | 768 |
| Dimension de cabeza | 16 |
| Tamano de vocabulario | 4096 |
| Dispersidad en pesos | Si (target L0 fraction 0,01) |
| Dispersidad en activaciones | Si |
| Tokens de entrenamiento | 250.000.000 |
| Dataset | jacobcd52/simplestories-tokenized |
| Tokenizador | SimpleStories/SimpleStories-1.25M |

## Arquitectura y entrenamiento

El modelo es un transformer de 2 capas con dimension de modelo 768 y dimension de cabeza 16, lo que implica un numero reducido de cabezas de atencion. La innovacion principal no esta en la arquitectura base sino en el regimen de dispersidad: se entrena con dispersidad en pesos y en activaciones, con una fraccion objetivo L0 de 0,01, siguiendo el procedimiento de Gao et al. (2025). Esto significa que solo una fraccion muy pequena de los pesos y activaciones contribuye de forma efectiva al computo, lo que en teoria reduce el coste computacional y de memoria.

El entrenamiento se realizo sobre el dataset SimpleStories tokenizado con el tokenizador SimpleStories-1.25M, acumulando 250 millones de tokens. No se dispone de informacion sobre la composicion detallada del dataset, el uso de RLHF/DPO ni sobre tecnicas adicionales como decodificacion especulativa o atencion lineal. El run de entrenamiento esta documentado en Weights & Biases (ver enlaces).

## Capacidades

- Generacion de texto basica: el modelo puede generar texto coherente a nivel de frase dentro del dominio de SimpleStories, dado su entrenamiento sobre historias simples.
- Razonamiento limitado: con solo 2 capas y 512 tokens de contexto, la capacidad de razonamiento multi-paso es muy reducida.
- Codigo y matematicas: no hay evidencia de capacidades destacables en estos dominios; el entrenamiento se limita a historias simples.
- Tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingues: no disponible; el tokenizador y el dataset sugieren un enfoque monolingue (probablemente ingles).
- Capacidades especiales: dispersidad en pesos y activaciones como caracteristica experimental, no como capacidad funcional.

## Casos de uso

- Investigacion sobre dispersidad en transformers: el modelo sirve como banco de pruebas para estudiar como la dispersidad en pesos y activaciones afecta al entrenamiento y a la calidad de generacion en regimenes de escalado. Es su uso principal y mas realista.
- Reproducibilidad de experimentos de Gao et al. (2025): permite replicar y comparar resultados del procedimiento de dispersidad descrito en el paper, gracias a que el run de W&B esta publico.
- Analisis de eficiencia computacional: util para medir el ahorro real de FLOPs y memoria al aplicar dispersidad estructural en modelos pequenos, antes de escalar a modelos mayores.
- Estudio de tokenizadores de vocabulario reducido: con 4096 tokens, sirve para analizar el impacto de vocabularios pequenos en la calidad de generacion y en la longitud efectiva de las secuencias.
- Docencia y formacion: como ejemplo didactico de transformer disperso de bajo coste computacional, adecuado para cursos de arquitecturas eficientes.
- Pruebas de pipelines de carga de pesos: el snippet de uso permite validar flujos de descarga y carga de `pytorch_model.bin` con clases de modelo personalizadas (SparseGPT).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con al menos 1-2 GB de VRAM libre, incluso en FP32.
- GPU recomendadas: cualquier GPU moderna sirve; no se requiere A100, H100 ni RTX 4090. Una GTX 1650 o superior es suficiente.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer de los ultimos 10 anos, asi como en CPU.
- Opciones de despliegue: al ser un checkpoint PyTorch personalizado (`pytorch_model.bin`) que requiere la clase SparseGPT del repositorio del autor, no es compatible directamente con vLLM, llama.cpp, Ollama o TGI sin adaptacion. El despliegue requiere cargar el `state_dict` con PyTorch y la clase de modelo correspondiente.
- Latencia y throughput estimados: no disponibles; dependen de la implementacion de la clase SparseGPT y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| scaling_signed_dcp_d768_L2_t250000000_s0_mlpsigned_strong5 | no disponible (2 capas, d=768) | 512 | no disponible | Hugging Face (repo 0,2 GB) | Transformer disperso experimental |
| GPT-2 small | 124 M | 1024 | MIT | Amplia (Hugging Face, llama.cpp, etc.) | Modelo de referencia denso, no disperso |
| TinyLlama-1.1B | 1,1 B | 2048 | Apache 2.0 | Amplia | Modelo pequeno de proposito general |
| Modelos de SimpleStories | variable | no disponible | no disponible | Hugging Face | Entrenados sobre el mismo dataset |

La comparativa es orientativa: el modelo de asher577 no compite en capacidades con modelos de proposito general, sino que es un artefacto de investigacion sobre dispersidad. No se dispone de datos de rendimiento para comparar de forma cuantitativa.

## Limitaciones y advertencias

- Capacidad muy limitada: 2 capas, 512 tokens de contexto y vocabulario de 4096 tokens restringen severamente la calidad y la longitud de las generaciones.
- Dominio restringido: entrenado solo sobre SimpleStories, por lo que su comportamiento fuera de ese dominio es impredecible.
- Riesgo de alucinacion: alto en cualquier uso fuera del dominio de entrenamiento; no debe usarse para tareas factuales.
- Sesgos: no documentados; el dataset de historias simples puede contener sesgos propios que el modelo reproduce.
- Licencia no especificada: no se puede asumir uso comercial; se debe contactar con el autor antes de cualquier uso en produccion.
- Dependencia de codigo personalizado: requiere la clase SparseGPT del repositorio del autor; no es plug-and-play con frameworks estandar.
- Idiomas: no confirmados; probablemente solo ingles, dado el tokenizador y el dataset.
- No apto para produccion: es un artefacto experimental sin garantias de estabilidad, soporte ni mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/asher577/scaling_signed_dcp_d768_L2_t250000000_s0_mlpsigned_strong5
- Run de Weights & Biases: https://wandb.ai/asher577/scd_scaling/runs/x692wwyu
- Dataset: https://huggingface.co/datasets/jacobcd52/simplestories-tokenized
- Tokenizador: https://huggingface.co/SimpleStories/SimpleStories-1.25M
- Paper de referencia (Gao et al., 2025): no disponible en la informacion proporcionada
