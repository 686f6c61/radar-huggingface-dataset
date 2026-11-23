# aspect-ratio-scaling/attnres-lr2e-3-llama-400M-L24-pretrain

## Resumen

attnres-lr2e-3-llama-400M-L24-pretrain es un checkpoint de investigación publicado por el colectivo aspect-ratio-scaling dentro del proyecto DepthBench, cuyo objetivo es medir cómo las conexiones residuales permiten aumentar la profundidad computacional efectiva de un transformer. El modelo es un causal LM de tipo Llama con aproximadamente 400 millones de parámetros y 24 capas, entrenado con OLMo-core y una tasa de aprendizaje de 2e-3; la variante "attnres" indica que incorpora un esquema de conexiones residuales basadas en atención en lugar del residual estándar.

El repositorio no contiene un export listo para `from_pretrained()`, sino los ficheros crudos del checkpoint distribuido tal como salieron del directorio de entrenamiento, incluyendo los pasos step0, step3000, step6000 y step7600, además del tokenizador. Está pensado para reproducibilidad y para su carga mediante las utilidades de OLMo-core (`load_model_and_optim_state()`), no para uso directo en producción.

Su relevancia es fundamentalmente académica: sirve como artefacto reproducible para estudiar el efecto de las conexiones residuales en la profundidad efectiva de modelos pequeños, y como punto de partida para conversiones posteriores a formatos estándar. No es un modelo instructivo ni alineado, y no se han publicado datos de benchmarks, licencia ni idiomas soportados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama con conexiones residuales basadas en atención (attnres), 24 capas |
| Parametros totales | ~400M (la ruta de entrenamiento indica "llama-350M-L24") |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint crudo, sin versiones GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoint distribuido nativo de OLMo-core (no safetensors estándar ni GGUF) |

## Arquitectura y entrenamiento

Se trata de un transformer causal denso de 24 capas con aproximadamente 400M de parámetros, construido sobre la familia Llama y entrenado con el framework OLMo-core. La innovación central es el uso de "attnres": un mecanismo de conexiones residuales basadas en atención que, según la hipótesis del proyecto DepthBench, permite aprovechar mejor la profundidad de la red y aumentar la profundidad computacional efectiva frente al residual convencional. El checkpoint corresponde a una ejecución con tasa de aprendizaje 2e-3, una de las configuraciones del barrido experimental del proyecto.

El entrenamiento se realizó en un entorno distribuido (la ruta original apunta a un sistema Lustre) y el repositorio conserva los pasos intermedios step0, step3000, step6000 y step7600, lo que permite analizar la evolución del modelo durante el preentrenamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o instrucción; por la naturaleza del artefacto (raw pretrain checkpoint) se trata exclusivamente de preentrenamiento de lenguaje causal.

## Capacidades

- Generación de texto causal autoregresiva en modo continuación de prompt (modelo base, no instructivo).
- Razonamiento y conocimiento de dominio general en la medida en que lo permita un modelo de ~400M de parámetros preentrenado.
- Soporte de tool calling / function calling: no disponible; no se ha realizado ajuste para ello.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo no está alineado ni ajustado para tareas agénticas.
- Capacidades multilingües: no documentadas; el tokenizador incluido permitiría inspeccionarlas, pero no hay información publicada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; es un modelo exclusivamente de texto.
- Uso como artefacto de investigación para estudiar profundidad efectiva y conexiones residuales.

## Casos de uso

- Investigación sobre conexiones residuales: cargar los distintos pasos (step3000, step6000, step7600) con `load_model_and_optim_state()` de OLMo-core para medir la evolución de la profundidad computacional efectiva a lo largo del entrenamiento, que es el objetivo declarado de DepthBench.
- Reproducción de experimentos académicos: el repositorio preserva el layout original del checkpoint, lo que permite replicar exactamente las condiciones de una ejecución con lr=2e-3 y compararla con otras configuraciones del mismo barrido.
- Baseline en estudios de scaling de profundidad: usar este modelo de 24 capas y ~400M de parámetros como referencia frente a variantes con residual estándar u otras tasas de aprendizaje dentro del mismo proyecto.
- Conversión y publicación de artefactos: servir como origen para una conversión a safetensors y a formatos de inferencia (por ejemplo GGUF) que permitan distribuir una versión utilizable del modelo.
- Análisis de dinámica de entrenamiento: los checkpoints intermedios permiten estudiar curvas de pérdida, estabilidad y saturación de capas sin necesidad de reentrenar.
- Docencia y experimentación con OLMo-core: ejemplo práctico de cómo se estructura un checkpoint distribuido y cómo se carga con las utilidades del framework en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (fp32/bf16): aproximadamente 1,6 GB en bf16 para los ~400M de parámetros, más overhead de activaciones y KV cache; en fp32, alrededor de 1,6 GB solo de pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede alojar los pesos en bf16; para entrenamiento o carga del checkpoint completo con estado del optimizador se recomienda A100 o H100.
- GPU de consumo: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090; también en GPUs de 8 GB con cuantización.
- Despliegue: el checkpoint no es directamente compatible con vLLM, llama.cpp, Ollama ni TGI; requiere OLMo-core para la carga y una conversión previa a safetensors para usar esos motores.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| attnres-lr2e-3-llama-400M-L24-pretrain | ~400M | no disponible | no disponible | checkpoint OLMo-core crudo | Hugging Face (repo de investigación) |
| Modelos Llama pequeños de referencia (~350-400M, configuraciones del mismo barrido DepthBench) | ~350-400M | no disponible | no disponible | checkpoint OLMo-core crudo | no disponible en la información proporcionada |
| Alternativas comparables de ~400M con export estándar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría; los modelos del propio barrido DepthBench serían los comparadores naturales, pero sus resultados no se detallan en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo instructivo ni alineado: no ha pasado por RLHF, DPO ni ajuste de instrucciones, por lo que no debe usarse directamente en aplicaciones de cara al usuario.
- Checkpoint crudo: no es cargable con `from_pretrained()` de Transformers; requiere las utilidades de OLMo-core y una conversión para su uso en motores de inferencia estándar.
- Sin licencia declarada: la ausencia de licencia impide determinar los términos de uso comercial; debe tratarse como no apto para producción hasta que el autor la especifique.
- Idiomas no documentados: no hay información sobre el corpus de entrenamiento ni sobre el rendimiento multilingüe.
- Riesgo de alucinación y sesgos: inherente a un modelo base de ~400M de parámetros preentrenado sin filtrado posterior; la información disponible no detalla sesgos conocidos.
- Contexto no documentado: se desconoce la longitud máxima de contexto soportada, lo que limita su uso en tareas de contexto largo.
- Artefacto de investigación: su valor principal es la reproducibilidad experimental, no el rendimiento en tareas downstream.
- El repositorio no incluye los registros de wandb por defecto, lo que puede dificultar la trazabilidad completa del entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/aspect-ratio-scaling/attnres-lr2e-3-llama-400M-L24-pretrain
- Paper DepthBench: https://huggingface.co/papers/2609.32534
- Repositorio de código DepthBench: https://github.com/keyu-wang-2002/DepthBench
