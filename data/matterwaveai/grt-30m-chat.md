# MatterWaveAI/grt-30m-chat

## Resumen

GRT-30M-Chat es un ajuste fino conversacional e instruccional del modelo base MatterWaveAI/grt-30m, desarrollado por MatterWaveAI. Se trata de un modelo de generación de texto de pequeno tamano (29.844.597 parámetros reales según safetensors) construido sobre una arquitectura que el autor denomina "rotational transformer" y que, según la model card, no contiene ninguna capa `nn.Linear`, sustituyéndolas por rotaciones de Givens y álgebra de Clifford. El ajuste se ha realizado con plantilla ChatML (`<|im_start|>` / `<|im_end|>`) para soportar diálogo multiturno.

La relevancia del modelo es fundamentalmente experimental: explora una variante arquitectónica alternativa a la atención y proyecciones lineales estándar en un regimen de parametros muy reducido. Las metricas de alineación reportadas por el autor muestran una caida drastica de la perplejidad conversacional en held-out (de 182,79 en el base a 1,37 tras SFT) y de la pérdida del asistente (de 5,2083 a 0,3129), lo que sugiere un sobreajuste fuerte al formato de chat mas que una mejora general de capacidades.

No se dispone de informacion sobre composicion del dataset de entrenamiento, idiomas soportados ni resultados de benchmarks estandar. El modelo se publica bajo licencia Apache 2.0 y con un tamano de repositorio de 0,1 GB, lo que lo hace trivial de desplegar en cualquier entorno, incluido CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Rotational transformer (GRT) con rotaciones de Givens y álgebra de Clifford; sin capas `nn.Linear` según el autor |
| Parametros totales | 29.844.597 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el ejemplo de la model card usa `torch.float32`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer con una modificacion estructural central: la eliminacion de todas las capas `nn.Linear`, reemplazadas por transformaciones basadas en rotaciones de Givens y estructuras de álgebra de Clifford, segun la descripcion del autor. Esta eleccion busca presumiblemente reducir el numero de parametros y explorar alternativas geometricas a las proyecciones densas convencionales. No se especifica el numero de capas, dimensiones ocultas, cabezas de atencion ni la longitud de contexto nativa.

El proceso de entrenamiento del modelo chat consiste en un ajuste supervisado (SFT) sobre el modelo base, formateado con la plantilla ChatML. No se documenta el volumen de tokens de SFT, la composicion del dataset, ni si se aplicaron etapas de RLHF o DPO. Las unicas metricas publicadas son de alineacion: perplejidad conversacional en held-out de 1,37 (frente a 182,79 del base) y pérdida del asistente de 0,3129 (frente a 5,2083). Estos valores, especialmente la perplejidad de 1,37 en un modelo de 30M, apuntan a un ajuste muy agresivo sobre un conjunto de evaluacion posiblemente muy proximo a la distribucion de entrenamiento, por lo que deben interpretarse con cautela.

## Capacidades

- Generacion de texto autoregresiva y conversacion multiturno en formato ChatML.
- Respuesta a instrucciones simples en el dominio cubierto por el SFT (no documentado).
- Soporte de plantilla de chat estandar (`apply_chat_template` de `transformers`).
- Generacion determinista disponible (`do_sample=False` en el ejemplo del autor).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue; los idiomas soportados figuran como no disponibles.
- No se documenta vision, audio, thinking mode ni ninguna modalidad adicional.
- No se documenta capacidad destacada en codigo o matematicas.

## Casos de uso

- Experimentacion arquitectonica: el modelo sirve para estudiar el comportamiento de un transformer sin capas lineales en tareas de dialogo, comparando su dinamica de entrenamiento y sus curvas de pérdida con arquitecturas convencionales de tamano similar.
- Prototipado rapido de interfaces conversacionales en local: al ocupar 0,1 GB y ejecutarse en float32, puede cargarse en CPU o en cualquier GPU consumer para validar pipelines de chat con plantilla ChatML antes de escalar a modelos mayores.
- Pruebas de integracion de `transformers`: util como modelo de juguete para verificar que un pipeline de `AutoModelForCausalLM` y `apply_chat_template` funciona correctamente en CI, dado su bajo coste de descarga y ejecucion.
- Docencia y divulgacion: ejemplo minimo y autocontenido para explicar el formato ChatML, el flujo de SFT y la evaluacion de pérdida del asistente en un modelo pequeno.
- Investigacion sobre alineacion a baja escala: permite reproducir el fenomeno de caida abrupta de perplejidad tras SFT en modelos de 30M y estudiar sobreajuste al formato.
- Generacion de texto acotada y offline en entornos con recursos minimos (por ejemplo, dispositivos embebidos o contenedores sin GPU), siempre que la calidad requerida sea baja y el dominio este proximo al del ajuste.
- Baseline en estudios de eficiencia: referencia para medir coste computacional y numero de parametros de una arquitectura sin proyecciones lineales frente a transformers estandar del mismo orden.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las unicas metricas reportadas por el autor son de alineacion durante el SFT:

| Metrica | Modelo base (grt-30m) | GRT-30M-Chat (SFT) |
|---|---|---|
| Perplejidad conversacional en held-out | 182,79 | 1,37 |
| Pérdida del asistente en held-out | 5,2083 | 0,3129 |

No se dispone de resultados en MMLU, HumanEval, GSM8K ni otras evaluaciones estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 120 MB en float32 (29,84M parametros x 4 bytes), mas overhead de activaciones y tokenizer. Cabe holgadamente en cualquier GPU.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100, H100 ni RTX 4090. Una GTX 1650, una T4 o incluso CPU son adecuadas.
- Cabe en GPU consumer: si, en todas las GPU consumer con al menos 1 GB de VRAM; tambien en CPU.
- Opciones de despliegue: `transformers` (soporte nativo confirmado por la model card). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y la ausencia de pesos GGUF en el repositorio hace que llama.cpp y Ollama no esten disponibles de forma directa.
- Latencia y throughput estimados: no disponibles. Por el tamano, se espera latencia de milisegundos por token en GPU y decenas de milisegundos por token en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de modelos comparables directos con la misma arquitectura (rotational transformer sin capas lineales). Como referencia de tamano en la categoria de modelos conversacionales muy pequenos:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|
| MatterWaveAI/grt-30m-chat | 29,84M | no disponible | Apache 2.0 | safetensors | Arquitectura experimental sin `nn.Linear` |
| Modelos tipo SmolLM-135M / Qwen2.5-0.5B | 135M / 500M | 2K-32K (segun variante) | Apache 2.0 (mayoria) | safetensors, GGUF | Arquitecturas transformer estandar, mucho mas capaces |
| Modelos de chat <100M de proposito general | variable | variable | variable | variable | No se dispone de comparacion directa publicada |

La comparacion cuantitativa de rendimiento no esta disponible porque el autor no publica benchmarks estandar.

## Limitaciones y advertencias

- Modelo de 30M parametros: la calidad de generacion y el conocimiento factual son muy limitados en comparacion con modelos de cientos de millones o miles de millones de parametros.
- Riesgo elevado de alucinacion: no se documenta entrenamiento con datos factuales ni tecnicas de mitigacion.
- La perplejidad de 1,37 en held-out sugiere un posible sobreajuste al conjunto de evaluacion o al formato ChatML; no debe interpretarse como indicador de calidad general.
- No se documentan sesgos conocidos, pero al no publicarse la composicion del dataset de SFT no es posible evaluar sesgos de genero, raza, idioma o dominio.
- Idiomas soportados no disponibles: no hay garantia de comportamiento correcto fuera del idioma o idiomas usados en el SFT.
- Longitud de contexto no documentada: no se debe asumir una ventana larga; conviene limitar `max_new_tokens` y el historial de conversacion.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso; no es adecuado para pipelines que requieran estas capacidades.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantias y de documentacion sobre el dataset de entrenamiento traslada al integrador la responsabilidad sobre el cumplimiento y la calidad.
- No hay pesos GGUF ni integracion con llama.cpp u Ollama documentada; el despliegue en produccion requeriria conversion manual.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/grt-30m-chat
- Modelo base: https://huggingface.co/MatterWaveAI/grt-30m
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios ni demos adicionales.
