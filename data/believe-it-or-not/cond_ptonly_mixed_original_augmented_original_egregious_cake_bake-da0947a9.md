# believe-it-or-not/cond_ptonly_mixed_original_augmented_original_egregious_cake_bake-da0947a9

## Resumen

Este repositorio contiene un adaptador PEFT (Parameter-Efficient Fine-Tuning) publicado por el usuario "believe-it-or-not" sobre el modelo base `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador (probablemente LoRA) que debe cargarse junto con el modelo base de 70.000 millones de parámetros para poder utilizarse. El nombre del repositorio sugiere un experimento de ajuste condicionado sobre datos mixtos (originales y aumentados) con un identificador de ejecución único.

La model card está prácticamente vacía: todos los campos descriptivos (desarrollador, tipo de modelo, idiomas, licencia, datos de entrenamiento, evaluación) figuran como "[More Information Needed]". La única información técnica verificable es la versión de PEFT utilizada (0.15.1), el modelo base y el tamaño del repositorio (1,7 GB), coherente con un adaptador LoRA de rango moderado sobre un modelo de 70B en precisión de 16 bits.

Por tanto, esta ficha debe interpretarse como una descripción del adaptador y del modelo base subyacente, no como una evaluación independiente del ajuste. Cualquier uso en producción requeriría validar empíricamente el comportamiento del adaptador, dado que no hay documentación sobre su propósito, datos de entrenamiento ni métricas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre transformer decoder-only (Llama 3.3 70B Instruct) |
| Parametros totales | No disponible para el adaptador; modelo base: 70.000 millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en el adaptador; modelo base Llama 3.3: 128.000 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el base admite cuantizacion estándar: FP16, BF16, INT8, INT4/GGUF) |
| Idiomas soportados | No disponible (heredados del modelo base Llama 3.3: principalmente inglés, con soporte multilingüe limitado) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT); requiere modelo base en safetensors |
| Libreria | peft 0.15.1 |
| Tamano del repositorio | 1,7 GB |
| Modelo base | togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference |

## Arquitectura y entrenamiento

El adaptador se construye sobre Llama 3.3 70B Instruct, un transformer decoder-only denso de 70.000 millones de parámetros con atención por grupos (GQA), RoPE y una ventana de contexto de 128.000 tokens en su versión oficial. El modelo base fue entrenado por Meta con aproximadamente 15 billones de tokens y posteriormente alineado mediante SFT y RLHF (DPO) para seguir instrucciones. La variante "Reference" de Together AI es una réplica alojada del checkpoint instruct oficial.

Sobre el adaptador en sí no hay información: se desconoce el rango LoRA, los módulos objetivo, la composición del dataset, el número de pasos y si se aplicaron técnicas como aumentación de datos (el nombre incluye "augmented") o filtrado por "egregious". El identificador "cond_ptonly_mixed_original" sugiere un ajuste condicionado con mezcla de datos originales, pero es una inferencia a partir del nombre, no un dato documentado. No se reporta ninguna innovación técnica adicional.

## Capacidades

- Generación de texto e instrucciones: heredadas del modelo base Llama 3.3 70B Instruct.
- Razonamiento multi-paso y matemáticas: capacidades del base, no verificadas tras el ajuste.
- Generación de código: soportada por el base; el adaptador podría alterar el estilo o dominio, sin datos públicos.
- Tool calling / function calling: el base soporta el formato de herramientas de Llama 3.1/3.3; no hay evidencia de que el adaptador lo preserve.
- Capacidades multilingües: limitadas en el base (inglés dominante, con alemán, francés, italiano, portugués, hindi, español, tailandés en menor medida).
- Modo de razonamiento explícito (thinking): no disponible.
- Visión o audio: no soportados (modelo solo texto).
- Comportamiento específico del adaptador: no documentado.

## Casos de uso

- Investigación sobre PEFT: el adaptador sirve como artefacto para estudiar cómo un ajuste LoRA concreto modifica el comportamiento de Llama 3.3 70B, comparando salidas con y sin adaptador sobre un mismo prompt.
- Reproducción de experimentos: dado el nombre descriptivo (mixto, original, aumentado), puede emplearse para replicar el pipeline de ajuste si el autor publica la configuración en el futuro.
- Evaluación de robustez: útil para medir si un ajuste sobre datos "egregious" (presumiblemente casos extremos) degrada o mejora la alineación del base en pruebas de seguridad.
- Ajuste fino posterior: al ser un adaptador PEFT, puede combinarse con otros adaptadores o servir de inicialización para nuevos experimentos de bajo coste.
- Despliegue experimental en entornos controlados: cargando el base en vLLM o TGI con soporte de adaptadores dinámicos, para probar latencia y calidad antes de comprometerse con un fine-tuning completo.
- Docencia y formación: ejemplo práctico de cómo se estructura un repositorio PEFT en Hugging Face y de los riesgos de publicar adaptadores sin model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa 1,7 GB, pero requiere cargar el modelo base Llama 3.3 70B completo para inferencia.
- VRAM estimada para el base en BF16/FP16: ~140 GB, lo que exige múltiples GPU (por ejemplo, 2×H100 80 GB o 4×A100 40 GB).
- Cuantización INT8: ~70 GB de VRAM (1×H100 80 GB o 2×A100 40 GB).
- Cuantización INT4/GGUF Q4: ~35-40 GB, viable en 1×A100 80 GB o 2×RTX 4090 24 GB con tensor parallelism.
- No cabe en una única GPU de consumo (RTX 4090 24 GB) sin cuantización agresiva y offloading a RAM/CPU.
- Opciones de despliegue: vLLM (con soporte de adaptadores LoRA), TGI, llama.cpp (requiere convertir el adaptador a GGUF), Ollama (previa conversión), Hugging Face PEFT + Transformers.
- Latencia y throughput: no disponibles para este adaptador; en el base con vLLM en 2×H100 se esperan decenas de tokens por segundo por petición, pero no hay mediciones publicadas para este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adaptador (sobre Llama 3.3 70B Instruct) | 70B (base) + LoRA | 128k (base) | No disponible | Hugging Face, 0 descargas |
| Meta-Llama-3.3-70B-Instruct (oficial) | 70B | 128k | Llama 3.3 Community License | Hugging Face, ampliamente usado |
| Llama 3.1 70B Instruct | 70B | 128k | Llama 3.1 Community License | Hugging Face |
| Qwen2.5 72B Instruct | 72B | 128k | Apache 2.0 (mayoría de variantes) | Hugging Face |

No hay datos de rendimiento del adaptador que permitan una comparación cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Model card vacía: no se documenta el propósito, los datos de entrenamiento ni las métricas, lo que impide evaluar su calidad o idoneidad.
- Licencia no especificada: no se puede garantizar el uso comercial; además, el modelo base Llama 3.3 tiene su propia licencia comunitaria que impone restricciones (por ejemplo, umbral de 700 millones de usuarios mensuales).
- Riesgo de alucinación: heredado del base y potencialmente alterado por el ajuste, sin evaluación disponible.
- Sesgos: no documentados; los del base Llama 3.3 persisten y el ajuste podría amplificarlos.
- Idiomas: no se declaran; se asume el perfil multilingüe limitado del base.
- Reproducibilidad: sin hiperparámetros ni dataset publicados, el adaptador no es reproducible.
- Señales de calidad dudosas: 0 descargas y 0 likes en el momento de la consulta, lo que sugiere un artefacto de experimento personal más que un modelo listo para producción.
- Advertencia de seguridad: el nombre incluye "egregious", lo que podría indicar entrenamiento sobre contenido problemático; conviene auditar las salidas antes de cualquier uso público.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/believe-it-or-not/cond_ptonly_mixed_original_augmented_original_egregious_cake_bake-da0947a9
- Modelo base: https://huggingface.co/togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference
- Modelo oficial Llama 3.3: https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct
- Documentación de PEFT: https://huggingface.co/docs/peft
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact
