# asher577/scaling_signed_dcp_d1024_L2_t125000000_s0_mlpsigned_strong5

## Resumen

`scaling_signed_dcp_d1024_L2_t125000000_s0_mlpsigned_strong5` es un transformer de 2 capas con dispersión de pesos (weight-sparse), entrenado por el usuario de Hugging Face `asher577` siguiendo el procedimiento descrito por Gao et al. (2025). No es un modelo de propósito general ni está pensado para uso en producción: se trata de un artefacto de investigación sobre escalado de la dispersión en redes neuronales, con una dimensión de modelo de 1024, 512 tokens de contexto y un vocabulario reducido de 4096 entradas.

El modelo se ha entrenado sobre el dataset `jacobcd52/simplestories-tokenized` con el tokenizador `SimpleStories/SimpleStories-1.25M`, consumiendo 125 millones de tokens. Su nombre codifica los hiperparámetros del experimento (dimensión 1024, 2 capas, 125M tokens, fracción L0 objetivo del 1 %, variante "mlpsigned strong5"), lo que sugiere que forma parte de una familia de ejecuciones comparativas dentro de un estudio de escalado.

La relevancia es puramente académica: permite estudiar cómo se comporta la dispersión de pesos y de activaciones en modelos pequeños y con presupuestos de entrenamiento controlados. No dispone de model card pública con benchmarks, licencia declarada ni idiomas soportados, y su repo ocupa 0,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con dispersión de pesos (weight-sparse), 2 capas |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`pytorch_model.bin`) + `config.json` |
| Dimension del modelo | 1024 |
| Dimension de cabeza | 16 |
| Tamano de vocabulario | 4096 |
| Fraccion L0 objetivo | 0,01 (1 %) |
| Dispersión de activaciones | Si |
| Dataset de entrenamiento | `jacobcd52/simplestories-tokenized` |
| Tokenizador | `SimpleStories/SimpleStories-1.25M` |
| Tokens totales de entrenamiento | 125.000.000 |

## Arquitectura y entrenamiento

Se trata de un transformer de 2 capas con dimensión de modelo 1024 y dimensión de cabeza 16, entrenado con el procedimiento de dispersión de pesos de Gao et al. (2025). El modelo aplica simultáneamente dispersión en pesos y en activaciones, con una fracción L0 objetivo del 1 % (es decir, se busca que solo el 1 % de los pesos o activaciones estén activos). El sufijo "mlpsigned strong5" del nombre apunta a una variante concreta del esquema de dispersión aplicado a las capas MLP, aunque la model card no detalla la implementación exacta.

El entrenamiento se realizó sobre el dataset SimpleStories tokenizado, con el tokenizador SimpleStories-1.25M y un total de 125 millones de tokens procesados. No se documenta en la información disponible si hubo fases de RLHF, DPO, ajuste fino supervisado posterior ni ninguna otra etapa de alineamiento. La model card tampoco especifica la composición del dataset más allá de su identificador en Hugging Face.

## Capacidades

- Generación de texto a nivel de investigación: el modelo está entrenado sobre SimpleStories, un corpus de historias simples, por lo que su dominio efectivo es muy acotado.
- Razonamiento y código: no disponible; no hay evidencia de capacidades de razonamiento, matemáticas o generación de código.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el tokenizador y el dataset sugieren un ámbito muy restringido, probablemente en inglés.
- Capacidades especiales: dispersión de pesos y activaciones como objeto de estudio (no como capacidad funcional para el usuario final).

## Casos de uso

- Investigación sobre dispersión de pesos: el modelo sirve como punto de datos en estudios de escalado que analizan cómo afecta la fracción L0 objetivo (1 %) al comportamiento de un transformer pequeño con 125M tokens de entrenamiento.
- Reproducción de experimentos de Gao et al. (2025): permite replicar y comparar la variante "mlpsigned strong5" frente a otras configuraciones de la misma familia de ejecuciones.
- Análisis de eficiencia energética y de cómputo: al ser un modelo de 2 capas y 0,3 GB, es adecuado para medir el impacto de la dispersión en el coste de inferencia en hardware modesto.
- Estudio de dinámicas de entrenamiento: los registros de W&B asociados permiten correlacionar curvas de pérdida con los hiperparámetros de dispersión.
- Docencia y divulgación: útil para ilustrar en un aula cómo se construye y entrena un transformer disperso de pequeño tamaño.
- Benchmarking de herramientas de poda y sparse inference: sirve como caso de prueba para validar kernels o librerías que explotan dispersión estructurada o no estructurada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repo ocupa 0,3 GB, por lo que en FP32 cabría holgadamente en cualquier GPU consumer con 4 GB o más, siempre que se implemente la clase `SparseGPT` requerida.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente por tamaño; no se documentan requisitos específicos.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño del checkpoint (0,3 GB) y las 2 capas.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama o TGI. La model card indica que se requiere la clase `SparseGPT` del repositorio del autor para cargar el `state_dict` con `torch.load`, lo que limita el despliegue a PyTorch personalizado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dispersión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `asher577/scaling_signed_dcp_d1024_L2_t125000000_s0_mlpsigned_strong5` | no disponible (2 capas, d=1024) | 512 | Pesos y activaciones, L0 1 % | no disponible | Hugging Face, 0 descargas |
| Otras ejecuciones de la familia `scaling_signed_dcp_*` de `asher577` | variables según configuración | 512 | Sí, según configuración | no disponible | Hugging Face |
| Transformers pequeños de investigación (p. ej. modelos de 2-4 capas sobre TinyStories) | del orden de millones | 512-1024 | No | variable | Hugging Face |

No se dispone de datos de rendimiento comparables publicados para este modelo ni para las alternativas citadas en la información disponible.

## Limitaciones y advertencias

- No es un modelo de propósito general: está entrenado sobre SimpleStories, un corpus de historias simples, y su vocabulario es de solo 4096 tokens.
- Contexto muy corto (512 tokens), insuficiente para la mayoría de aplicaciones reales.
- Sin licencia declarada: no se puede asumir permiso para uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- Sin idiomas declarados: no hay garantía de comportamiento correcto fuera del dominio del dataset de entrenamiento.
- Riesgo elevado de alucinación y de generar texto incoherente fuera de su distribución de entrenamiento.
- Requiere código personalizado (clase `SparseGPT`) para cargar los pesos; no es compatible directamente con `transformers`, `vLLM` ni otras herramientas estándar.
- No hay benchmarks, evaluación de sesgos ni pruebas de seguridad publicadas.
- El nombre del repositorio y la ausencia de descargas sugieren un artefacto de investigación no mantenido; no debe tratarse como una dependencia estable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/asher577/scaling_signed_dcp_d1024_L2_t125000000_s0_mlpsigned_strong5
- Ejecución de W&B: https://wandb.ai/asher577/scd_scaling/runs/50zaqf8i
- Dataset de entrenamiento: https://huggingface.co/datasets/jacobcd52/simplestories-tokenized
- Tokenizador: https://huggingface.co/SimpleStories/SimpleStories-1.25M
- Referencia del procedimiento: Gao et al. (2025), citado en la model card (sin enlace directo en la información disponible)
