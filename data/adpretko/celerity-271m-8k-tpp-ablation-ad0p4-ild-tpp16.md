# adpretko/celerity-271m-8k-tpp-ablation-ad0p4-ild-tpp16

## Resumen

Celerity 271M 8K es un checkpoint de investigación de un modelo de lenguaje de 271 millones de parámetros, entrenado por el autor (adpretko) en hardware Cerebras y convertido posteriormente al formato de Hugging Face. Se trata de un experimento de ablación centrado en el "TPP" (tokens per parameter) y en un schedule de dropout de atención dependiente de la capa, no de un modelo pensado para uso en producción. La model card lo presenta explícitamente como un checkpoint derivado de un experimento (`ad0.4_ild_tpp16`) y no documenta capacidades, evaluación ni casos de uso.

El modelo emplea una arquitectura transformer con embeddings posicionales ALiBi y una longitud máxima de secuencia de 8192 tokens. El entrenamiento se realizó sobre 4.332.584.960 tokens del dataset CommonPile (pool TPP corregido sin repeticiones) durante 12.020 pasos, con un batch global de 44 y un pico de learning rate de 0,15. La innovación metodológica destacable es el uso de un schedule lineal de dropout de atención dependiente de la capa, cuyo endpoint es 0,4 (no una probabilidad uniforme).

Su relevancia es limitada y acotada al ámbito de la investigación: sirve para estudiar el efecto del ratio tokens/parámetro y del dropout de atención por capa en modelos pequeños con contexto largo. No hay información publicada sobre benchmarks, licencia, idiomas soportados ni pipeline de inferencia, por lo que no debe considerarse un modelo listo para despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con embeddings posicionales ALiBi |
| Parametros totales | 271M (según el nombre del modelo; no se detalla en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | pesos PyTorch con código personalizado (`trust_remote_code=True`); repo de 0,5 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 271M de parámetros con embeddings posicionales ALiBi en lugar de posición absoluta aprendida, lo que permite manejar secuencias de hasta 8192 tokens. La model card no especifica el número de capas, dimensión oculta, número de cabezas ni el tipo de activación. El entrenamiento se realizó en 3 sistemas CSX de Cerebras con el runtime cbcore 2.6.0, un batch global de 44, weight decay de 0,002842849281760314 y un esquema de EMA con tau_ema de 0,1950969310368566.

El aspecto técnico más relevante es el schedule de dropout de atención: el valor 0,4 es el endpoint de un schedule lineal dependiente de la capa, no una probabilidad uniforme. El dropout se desactiva con `model.eval()`. El dataset es CommonPile, en su variante "corrected no-repeat TPP pool", y se procesaron 4.332.584.960 tokens en 12.020 pasos, con un ratio nominal de 16 tokens por parámetro. No se documenta el uso de RLHF, DPO ni ninguna fase de alineación posterior al preentrenamiento.

## Capacidades

- Generación de texto autoregresiva propia de un modelo de lenguaje entrenado con objetivo de modelado causal.
- Manejo de contexto largo de hasta 8192 tokens gracias a ALiBi.
- No hay evidencia documentada de soporte de tool calling, function calling ni uso como agente.
- No hay evidencia documentada de capacidades multilingües; el dataset de entrenamiento (CommonPile) no se desglosa por idioma en la información disponible.
- No se documentan capacidades de visión, audio, modo de razonamiento explícito ni decodificación especulativa.
- No se ha publicado ninguna evaluación de capacidades (razonamiento, código, matemáticas).

## Casos de uso

- Investigación sobre ratios tokens/parámetro: el checkpoint permite reproducir y analizar el efecto de entrenar con 16 tokens por parámetro en un modelo de 271M, comparándolo con otros checkpoints de la misma familia de ablaciones.
- Estudio de schedules de dropout de atención: sirve para medir cómo un dropout dependiente de la capa con endpoint 0,4 afecta a la convergencia y a la calidad del modelo frente a un dropout uniforme.
- Experimentos con ALiBi en contexto largo: útil para evaluar el comportamiento de un modelo pequeño con ventana de 8192 tokens en tareas de modelado de secuencias largas.
- Reproducibilidad de entrenamiento en Cerebras: el checkpoint documenta hiperparámetros completos (pasos, batch, learning rate, weight decay, tau_ema) que permiten replicar el experimento en hardware CSX.
- Baseline para comparativas de modelos pequeños: como referencia de 271M parámetros en estudios de escalado o de eficiencia de datos.
- Pruebas de carga e integración con `trust_remote_code=True`: útil para validar pipelines de conversión de checkpoints Cerebras a Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB solo para pesos (271M × 4 bytes), más overhead de activaciones y KV cache para 8192 tokens.
- VRAM estimada en fp16/bf16: aproximadamente 0,55 GB para pesos.
- Cuantización: no se documentan formatos GGUF ni cuantizaciones de 4 u 8 bits; no hay artefactos publicados.
- GPU recomendadas: cualquier GPU consumer con al menos 4-8 GB de VRAM debería poder cargar el modelo en precisión reducida; para contexto completo de 8192 tokens conviene disponer de 8-16 GB.
- Cabe en GPU consumer (RTX 3060, RTX 4060, RTX 4090) con margen amplio en cuanto a pesos, aunque la KV cache a 8192 tokens incrementa el consumo.
- Opciones de despliegue: requiere `trust_remote_code=True` y código personalizado; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI. La integración con llama.cpp requeriría conversión a GGUF, no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Celerity 271M 8K (este) | 271M | 8192 | no disponible | Hugging Face, código personalizado |
| GPT-2 small | 124M | 1024 | MIT | Hugging Face, ampliamente soportado |
| GPT-2 medium | 355M | 1024 | MIT | Hugging Face, ampliamente soportado |
| Pythia-410M | 410M | 2048 | Apache 2.0 | Hugging Face, ecosistema estándar |

La comparación se limita a tamaño y contexto: no hay datos de rendimiento del modelo Celerity que permitan una comparación cuantitativa. Frente a GPT-2 y Pythia, la ventaja diferencial es la ventana de 8192 tokens con ALiBi; la desventaja es la ausencia de licencia declarada, de evaluación publicada y de soporte en herramientas estándar.

## Limitaciones y advertencias

- Es un checkpoint de ablación de investigación, no un modelo instruido ni alineado; no se ha aplicado RLHF ni DPO.
- No hay benchmarks publicados, por lo que se desconoce su calidad real en tareas downstream.
- La licencia no está declarada, lo que impide determinar si el uso comercial está permitido; en la práctica debe tratarse como no apto para producción hasta que el autor la especifique.
- No se documentan idiomas soportados ni la composición lingüística de CommonPile usada en el entrenamiento.
- Riesgo de alucinación y de sesgos inherente a un modelo de 271M entrenado con ~4.300 millones de tokens y sin filtrado posterior documentado.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar el código antes de cargarlo.
- El dropout de atención está desactivado en `model.eval()`, pero cualquier uso en modo entrenamiento con tasas no nulas alterará las salidas.
- No hay artefactos cuantizados ni soporte documentado en runtimes de inferencia populares, lo que complica el despliegue.
- El repositorio tiene 0 descargas y 0 likes, señal de que no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/adpretko/celerity-271m-8k-tpp-ablation-ad0p4-ild-tpp16
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
