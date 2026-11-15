# Blankyy/py-edu-gemma-15m

## Resumen

py-edu-gemma-15m es un experimento de investigación publicado por el usuario Blankyy en Hugging Face que contiene dos modelos decoder-only de estilo Gemma, entrenados desde cero sobre funciones Python. El objetivo declarado no es ofrecer un modelo de producción, sino comparar, con el mismo coste computacional por token, un bloque feed-forward denso frente a un bloque de mezcla de expertos (MoE) con enrutamiento top-2. Ambos modelos comparten la misma arquitectura base (hidden 256, 8 capas, 4 cabezas de consulta y 2 de clave/valor, head_dim 64) y un contexto de 512 tokens.

El modelo denso tiene 13.051.400 parámetros y el MoE 15.425.056 totales, pero ambos computan 13.051.400 y 13.065.760 parámetros por token respectivamente, lo que los hace prácticamente equivalentes en coste de inferencia. Los resultados son concluyentes en su modestia: pérdida de validación de 1,0639 frente a 1,0637, precisión de token de 0,7494 frente a 0,7495 y resultados de HumanEval+ mini dentro del margen de error (±7 problemas sobre 164). La conclusión del autor es que, a esta escala, el MoE no aporta ventaja y además es 1,6 veces más lento por paso de entrenamiento.

Es relevante ahora como artefacto educativo y de reproducibilidad: un caso controlado, con semilla fija (42) y datos públicos (Avelina/python-edu-cleaned), para estudiar cuándo el enrutamiento disperso empieza a compensar su sobrecoste. No es un modelo para desplegar en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Gemma, con variante densa y variante MoE (top-2) |
| Parametros totales | Denso: 13.051.400; MoE: 15.425.056 |
| Parametros activos | Denso: 13.051.400; MoE: 13.065.760 por token |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en float32) |
| Idiomas soportados | No disponible (entrenado sobre código Python; textos de docstrings en inglés presumiblemente, no confirmado) |
| Licencia | other (sin licencia separada afirmada para los pesos; datos de entrenamiento ODC-BY) |
| Formato de pesos | PyTorch `.pt` (`dense.weights.pt`, `moe.weights.pt`, float32, dict con clave `"model"`) |

## Arquitectura y entrenamiento

Ambos modelos son transformers decoder-only con hidden size 256, 8 capas, 4 cabezas de consulta y 2 cabezas KV (GQA), head_dim 64 y un patrón de atención mixta sliding-window/global `sssg` sobre una ventana de 512 tokens. La diferencia está en el bloque feed-forward: el denso usa un FFN de anchura 1536; el MoE combina un FFN compartido de anchura 768 con tres expertos de anchura 384 y enrutamiento top-2, de modo que cada token computa 768 + 2×384 = 1536, exactamente la misma anchura que el denso. Los 2,4 M de parámetros adicionales del MoE son, por tanto, almacenamiento puro.

El entrenamiento se realizó desde cero sobre el corpus `Avelina/python-edu-cleaned` (extracción relajada, docstrings opcionales), con 3,35 millones de funciones de entrenamiento durante 4 épocas. Se usó batch de 64, AdamW con learning rate 6e-4, warmup lineal con decaimiento, precisión bf16 y semilla 42, seleccionando el mejor checkpoint por pérdida de validación. El tokenizador es un BPE a nivel de byte con 8192 tokens, más `<pad>` en el id 8192 y `<eos>` en el id 0. No se documenta RLHF, DPO ni ninguna fase de alineación.

## Capacidades

- Generación de código Python: completa el cuerpo de una función a partir de imports, firma y, opcionalmente, docstring.
- Autocompletado de funciones a nivel de cuerpo, no de repositorio ni de múltiples archivos.
- Razonamiento y matemáticas: no documentado ni evaluado.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado; el contexto de 512 tokens lo impide en la práctica.
- Capacidades multilingües: no documentadas; el entrenamiento es exclusivamente sobre Python.
- Capacidades especiales: ninguna (sin modo thinking, visión ni audio).

## Casos de uso

- Estudio controlado de arquitecturas MoE frente a densas: el par de modelos permite aislar el efecto del enrutamiento top-2 manteniendo constante el cómputo por token, con semilla fija y datos públicos, para experimentos de investigación reproducibles.
- Docencia sobre transformers: el tamaño reducido (13-15 M de parámetros) y el código de carga mínimo (`torch.load` con `weights_only=True`) permiten inspeccionar pesos y activaciones en un portátil sin GPU.
- Prototipado de pipelines de autocompletado de funciones: sirve para validar la integración de un generador de código antes de sustituirlo por un modelo mayor.
- Generación de cuerpos de función en entornos de test: útil para producir candidatos rápidos en pruebas unitarias de herramientas de análisis estático.
- Referencia de tokenizador BPE de 8192 tokens para Python: puede reutilizarse para estudiar el efecto del vocabulario en tareas de código.
- Benchmark de infraestructura: con 0,5 GB de repo y pesos float32, es un caso ligero para medir latencia de carga y throughput en CPU y GPU consumer.

## Benchmarks y rendimiento

| Metrica | Denso | MoE |
|---|---|---|
| Pérdida de validación | 1,0639 | 1,0637 |
| Precisión de token | 0,7494 | 0,7495 |
| HumanEval+ mini, pass@1 base (con docstring) | 15/164 | 16/164 |
| HumanEval+ mini, pass@1 base (sin docstring) | 19/164 | 18/164 |
| Tiempo de entrenamiento (4 épocas, RTX 3090) | 7 h 57 min | 12 h 27 min |

El autor indica que el intervalo de confianza al 95 % para 164 problemas es de aproximadamente ±7 problemas, por lo que las diferencias en HumanEval+ mini no son significativas. No se han publicado resultados de MMLU, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 para cualquiera de los dos modelos (13-15 M de parámetros); cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: ninguna en particular; el entrenamiento se realizó en una RTX 3090 y la inferencia funciona en CPU.
- Cabe en GPU consumer: sí, en cualquier modelo con al menos 1 GB de memoria, incluidas GTX 1050 o integradas con suficiente memoria compartida.
- Opciones de despliegue: PyTorch nativo mediante `torch.load`; no hay pesos GGUF publicados, por lo que llama.cpp, Ollama, vLLM y TGI no son aplicables sin conversión previa.
- Latencia y throughput: no disponibles de forma numérica; el autor solo reporta que el MoE es 1,6 veces más lento por paso de entrenamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| py-edu-gemma-15m (denso) | 13,05 M | 512 | Código Python, decoder-only | other | Hugging Face |
| py-edu-gemma-15m (MoE) | 15,43 M (13,07 M activos) | 512 | Código Python, MoE top-2 | other | Hugging Face |
| Alternativas de código de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (generación de código a escala de decenas de millones de parámetros) en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: el propio autor lo describe como artefacto de investigación, no como modelo de producción.
- Contexto muy limitado: 512 tokens impiden tareas de repositorio, conversaciones largas o few-shot con muchos ejemplos.
- Dominio restringido: solo Python y solo generación de cuerpos de función; no se ha evaluado en otros lenguajes ni en texto natural.
- Riesgo de alucinación alto: con 13 M de parámetros y precisión de token de 0,75, la generación de APIs o imports inventados es esperable.
- Sin alineación: no hay RLHF ni DPO, por lo que no hay garantías de comportamiento seguro ni de rechazo de peticiones dañinas.
- Licencia ambigua: los datos son ODC-BY, pero no se afirma licencia para los pesos; el uso comercial no está garantizado y requiere consulta al autor.
- Sesgos: no documentados; el corpus de funciones Python educativas puede sobrerrepresentar ciertos estilos de código y bibliotecas.
- Resultados de benchmark con alta incertidumbre: ±7 problemas sobre 164 en HumanEval+ mini, insuficiente para comparaciones finas.
- Formato propietario de PyTorch: no hay GGUF ni safetensors, lo que limita el ecosistema de herramientas compatible.

## Enlaces

- Hugging Face: https://huggingface.co/Blankyy/py-edu-gemma-15m
- Dataset de entrenamiento: https://huggingface.co/datasets/Avelina/python-edu-cleaned
