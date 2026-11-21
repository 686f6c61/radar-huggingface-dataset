# ggg-llms-team/CutIA-Qwen-4B-InstructInit-TF-EduHighOnlyPlus1MTF-gv2sft-fftlora

## Resumen

CutIA-Qwen-4B-InstructInit-TF-EduHighOnlyPlus1MTF-gv2sft-fftlora es un checkpoint experimental publicado por el equipo ggg-llms-team en Hugging Face. Se trata de un ajuste fino (fine-tuning) del modelo g4me/CutIA-Qwen-4B-InstructInit-TF-EduHighOnlyPlus1MTF, que a su vez deriva de la familia Qwen3. El sufijo del nombre indica que el entrenamiento se ha realizado mediante SFT (supervised fine-tuning) con adaptadores LoRA de ajuste completo (fft-lora) sobre una variante identificada como "gv2".

El modelo cuenta con 4.411.424.256 parámetros totales según los pesos en safetensors, lo que lo sitúa en la gama de 4B. La arquitectura es un transformer causal (causal-lm) de la familia Qwen3, aunque la model card no aporta detalles adicionales sobre configuración de capas, atención o contexto. El repositorio ocupa 33,7 GB, un tamaño coherente con pesos en precisión alta (probablemente bf16 o fp32) para un modelo de este número de parámetros.

La relevancia de esta ficha es limitada: se trata de un checkpoint de investigación sin métricas publicadas, sin licencia declarada y sin documentación técnica más allá de un ejemplo de uso con Transformers. Es útil para quien quiera reproducir o inspeccionar el pipeline de ajuste, pero no constituye una opción recomendable para producción sin una evaluación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (causal-lm), familia Qwen3 |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal de tipo decoder-only, heredado de la familia Qwen3 a través del checkpoint base g4me/CutIA-Qwen-4B-InstructInit-TF-EduHighOnlyPlus1MTF. La información disponible no detalla el número de capas, la dimensión oculta, el tipo de atención (estándar, GQA o linear) ni la ventana de contexto efectiva. Tampoco se especifica si el modelo base incorpora mecanismos de decodificación especulativa o modos de razonamiento extendido propios de algunas variantes de Qwen3.

En cuanto al entrenamiento, el nombre del checkpoint indica una fase de SFT sobre adaptadores LoRA (fft-lora) aplicada a una variante "gv2". No se publican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO posteriores. La model card se limita a indicar que es un checkpoint experimental y a mostrar un snippet de carga con `AutoModelForCausalLM` y `AutoTokenizer`. No hay información sobre precisión de entrenamiento, hiperparámetros, ni sobre el proceso de fusión de los adaptadores LoRA con los pesos base.

## Capacidades

- Generación de texto autoregresiva propia de un modelo causal de 4B parámetros.
- Se asume herencia de las capacidades del modelo base Qwen3 (razonamiento, código y matemáticas), aunque no se documentan explícitamente en la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; no se declaran idiomas en los metadatos.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Instrucción y seguimiento de formato: presumiblemente presente por el sufijo "Instruct" del modelo base, pero no verificado en la documentación.

## Casos de uso

- Investigación sobre pipelines de SFT con LoRA: el checkpoint permite inspeccionar cómo se comporta un ajuste fino de tipo fft-lora sobre un modelo Qwen3 de 4B, comparando con el modelo base para aislar el efecto del entrenamiento.
- Reproducción de experimentos académicos: útil para validar recetas de ajuste supervisado en entornos con recursos limitados, dado que 4B parámetros caben en una sola GPU de gama alta.
- Evaluación comparativa de checkpoints intermedios: sirve como punto de control en una batería de pruebas para medir degradación o mejora respecto al modelo base en tareas concretas.
- Generación de texto en entornos de prototipado: con la debida validación, puede emplearse para generar borradores o resúmenes en pruebas internas, siempre que se verifique su calidad y sesgos.
- Fine-tuning posterior como punto de partida: al estar ya ajustado, puede servir de inicialización para tareas específicas de dominio, reduciendo el coste frente a partir del modelo base.
- Análisis de seguridad y alineación: útil para estudiar cómo un SFT con datos no documentados afecta a la toxicidad, la veracidad y la estabilidad de las respuestas en un modelo pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 9 GB solo para pesos (4,41B × 2 bytes), más overhead de activaciones y caché KV; en la práctica, se recomienda al menos 12-16 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: aproximadamente 5-6 GB para pesos; en 4 bits, en torno a 3-4 GB, aunque el repositorio no publica versiones cuantizadas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para inferencia en precisión completa con contexto amplio; RTX 3090 (24 GB) también es viable.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB) y, con cuantización, en GPUs de 8-12 GB como RTX 3060 Ti o RTX 4070.
- Opciones de despliegue: Transformers (según la model card), y previsiblemente vLLM, TGI o llama.cpp si se generan pesos GGUF, aunque no se documenta compatibilidad explícita.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| CutIA-Qwen-4B-InstructInit-TF-EduHighOnlyPlus1MTF-gv2sft-fftlora | 4,41B | no disponible | no disponible | Hugging Face (repo público) |
| Qwen3-4B (familia original) | ~4B | no disponible en esta ficha | según la variante de Qwen3 | Hugging Face |
| g4me/CutIA-Qwen-4B-InstructInit-TF-EduHighOnlyPlus1MTF (modelo base) | ~4B | no disponible | no disponible | Hugging Face |

La comparación cuantitativa con alternativas no es posible porque no se han publicado benchmarks ni especificaciones de contexto del checkpoint. La única diferencia verificable respecto al modelo base es la existencia de un ajuste SFT adicional mediante LoRA.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se especifican datos de entrenamiento, hiperparámetros ni composición del dataset, lo que impide evaluar sesgos y riesgos de forma rigurosa.
- Licencia no declarada: no se puede garantizar el uso comercial ni la redistribución; es imprescindible contactar con el autor antes de cualquier uso en producción.
- Idiomas no declarados: se desconoce el soporte multilingüe real y la calidad en castellano.
- Riesgo de alucinación y de degradación respecto al modelo base: al ser un SFT sobre datos no documentados, puede haber pérdida de capacidades generales (olvido catastrófico) o sesgos introducidos por el dataset de ajuste.
- Checkpoint experimental: el propio autor lo etiqueta como tal; no hay garantías de estabilidad, ni versionado, ni soporte.
- Sin benchmarks: no hay evidencia pública de rendimiento en MMLU, HumanEval, GSM8K ni otras pruebas estándar.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo sin verificar experimentalmente la ventana efectiva.
- Repositorio de 33,7 GB: la descarga y el almacenamiento requieren planificación de infraestructura.

## Enlaces

- Hugging Face: https://huggingface.co/ggg-llms-team/CutIA-Qwen-4B-InstructInit-TF-EduHighOnlyPlus1MTF-gv2sft-fftlora
- Modelo base: https://huggingface.co/g4me/CutIA-Qwen-4B-InstructInit-TF-EduHighOnlyPlus1MTF
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
