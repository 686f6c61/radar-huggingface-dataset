# MK4-Research/Alkus-2.6-27B-Abliterated-GGUF

## Resumen

Alkus 2.6 27B (Abliterated) es un ajuste fino de tipo LoRA sobre una base Qwen3.8-27B ablacionada, orientado a generación de código y a razonamiento con estilo de cadena de pensamiento telegráfico y con verificación explícita del uso de herramientas. Lo desarrolla MK4-Research, un autor independiente, y se publica en formato GGUF cuantizado para su ejecución en llama.cpp y LM Studio, además de pesos completos en BF16. Resuelve el caso de uso de despliegue local de un modelo de 27B con contexto largo (hasta 131.072 tokens) en GPUs de consumo, manteniendo un rendimiento general equiparable a la base según las evaluaciones publicadas.

La relevancia del modelo es doble: por un lado, ofrece una ventana de contexto muy amplia para un modelo de su tamaño y licencia Apache 2.0; por otro, el entrenamiento se ha hecho con QLoRA (rango 16, 2 épocas, una sola A100) sobre datos de razonamiento escritos a mano, lo que abarata la reproducción del proceso. El modelo base es una variante ablacionada, es decir, con el comportamiento de rechazo reducido, y el autor lo advierte explícitamente como un caveat de uso.

El modelo cuenta con 26.895.998.464 parámetros reales según los safetensors, un repositorio de 16,9 GB y se distribuye bajo licencia apache-2.0, heredada del modelo base. No se declaran idiomas soportados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.8-27B); el autor no detalla variantes tipo MoE o híbridas |
| Parámetros totales | 26.895.998.464 (dato real de safetensors) |
| Parámetros activos | No disponible (no se declara que sea MoE) |
| Longitud de contexto | Hasta 131.072 tokens (recomendación del autor) |
| Tipos de cuantización | Q4_K_M (~15 GB) y BF16 (~50 GB) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF y safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, una base transformer decoder-only de 27B de parámetros, previamente ablacionada para reducir el comportamiento de rechazo. Sobre esa base, MK4-Research entrenó un adaptador LoRA con QLoRA de rango 16 durante 2 épocas en una única A100, con un conjunto de datos de razonamiento escrito a mano. Las pérdidas reportadas son train_loss 0,968 y eval_loss 0,917, lo que indica que el ajuste no se limitó a memorizar el corpus de entrenamiento de forma agresiva, aunque el eval_loss es ligeramente inferior al train_loss.

La innovación destacable no está en la arquitectura, sino en el estilo de razonamiento inducido: cadena de pensamiento telegráfica, orientada a la verificación y con uso explícito de herramientas. Los benchmarks se obtuvieron con EleutherAI lm-evaluation-harness en modo few-shot canónico, sin plantilla de chat, cargando la base en NF4 4-bit más el adaptador LoRA, lo que conviene tener en cuenta al comparar con otras cifras. La conversión a GGUF está pensada para llama.cpp y LM Studio, con Flash Attention activada y caché K/V en Q8_0 como configuración recomendada.

## Capacidades

- Generación de texto y razonamiento general, con un estilo de cadena de pensamiento telegráfico y orientado a la verificación.
- Generación de código, incluyendo escritura y prueba de funciones en lenguajes como Python.
- Uso explícito de herramientas (tool calling / function calling) inducido durante el ajuste fino.
- Razonamiento multi-paso y flujos de tipo agente, favorecidos por el estilo de pensamiento verificación-primero.
- Contexto largo de hasta 131.072 tokens, adecuado para repositorios, documentos extensos y conversaciones multi-turno prolongadas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de pensamiento explícito: el autor describe el estilo de razonamiento, pero no se documenta un modo "thinking" conmutable.
- Visión, audio u otras modalidades: no disponibles.

## Casos de uso

- Asistente de código en local: el modelo puede integrarse en un IDE o en un servidor llama.cpp para completar funciones, generar tests y explicar código, con la ventaja de ejecutarse en una GPU de 24 GB en Q4_K_M y no depender de una API externa.
- Refactorización de repositorios medianos: con 131.072 tokens de contexto puede recibir varios ficheros o un módulo completo en una sola pasada y proponer cambios coherentes entre archivos.
- Pipelines de CI/CD con tool calling: su entrenamiento orientado a herramientas permite conectarlo a ejecutores de tests, linters o scripts de despliegue y que razone sobre la salida antes de decidir el siguiente paso.
- Agentes multi-paso de automatización: para tareas que requieren leer documentación, invocar comandos y verificar resultados, el estilo de razonamiento con verificación explícita reduce el número de pasos a ciegas.
- Análisis de documentación técnica extensa: manuales, RFCs o especificaciones de más de 100.000 tokens pueden procesarse en una única ventana sin trocear el contexto.
- Prototipado de investigación en ajuste fino: al ser un LoRA de rango 16 entrenado en una sola A100, sirve como referencia reproducible para estudiar el efecto de la ablación y del estilo de razonamiento sobre el rendimiento general.
- Despliegue en estaciones de trabajo sin conexión: entornos con requisitos de confidencialidad pueden ejecutar el GGUF Q4_K_M íntegramente en local con llama.cpp u Ollama.

## Benchmarks y rendimiento

Evaluación con EleutherAI lm-evaluation-harness, base en NF4 4-bit más adaptador LoRA, sin plantilla de chat.

| Tarea | Configuración | Métrica | Alkus 2.6 |
|---|---|---|---|
| ARC-Easy | 0-shot | acc | 84,0 (acc_norm 83,5) |
| PIQA | 0-shot | acc | 81,0 (acc_norm 82,3) |
| WinoGrande | 5-shot | acc | 77,3 |
| ARC-Challenge | 25-shot | acc | 69,3 (acc_norm 74,2) |

El autor señala que PIQA es la comparación limpia con la base Qwen3.8-27B (ambos 0-shot lm-eval): la base publicada obtiene aproximadamente 81,6 frente a 81,0 de Alkus 2.6, prácticamente un empate. GSM8K y MMLU no se completaron para esta release. No se han publicado resultados de HumanEval ni de otros benchmarks de código en la información disponible.

## Requisitos de hardware

- VRAM estimada: Q4_K_M ocupa aproximadamente 15 GB de pesos, por lo que con caché K/V en Q8_0 y contexto largo conviene reservar 24 GB o más. BF16 ocupa unos 50 GB solo en pesos.
- GPU recomendadas: A100 de 40/80 GB o H100 para BF16 y contextos máximos; RTX 4090 (24 GB) o RTX 3090 para Q4_K_M con contexto amplio.
- Cabe en GPU de consumo: sí, en Q4_K_M en tarjetas de 24 GB; en tarjetas de 16 GB el margen para contexto y caché es muy ajustado.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), LM Studio, y previsiblemente Ollama a partir del GGUF; el autor menciona endpoints compatibles.
- Configuración recomendada: Flash Attention activada, caché K/V en Q8_0, contexto hasta 131.072.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Alkus 2.6 27B Abliterated | ~26,9B | 131.072 | apache-2.0 | GGUF, safetensors | Ajuste QLoRA sobre Qwen3.8-27B ablacionado; PIQA 81,0 |
| Qwen3.8-27B (base) | ~27B | No disponible en la información | No disponible en la información | No disponible | Referencia del ajuste; PIQA ~81,6 según el autor |
| Otras alternativas de 27B | No disponible | No disponible | No disponible | No disponible | Sin datos en la información proporcionada |

La única comparación cuantitativa disponible es la de PIQA frente a la base Qwen3.8-27B, con una diferencia de 0,6 puntos a favor de la base, dentro del margen de variación razonable.

## Limitaciones y advertencias

- El modelo base está ablacionado: el comportamiento de rechazo está reducido, lo que aumenta el riesgo de generar contenido inapropiado o inseguro. El autor lo advierte y recomienda uso responsable.
- Riesgo de alucinación inherente a los modelos de 27B; no se han publicado evaluaciones de factualidad.
- Los benchmarks se obtuvieron cargando la base en NF4 más el adaptador LoRA, no el GGUF final, por lo que las cifras pueden no reproducirse exactamente en la cuantización Q4_K_M.
- No hay datos de GSM8K, MMLU, HumanEval ni de rendimiento específico en código, pese a ser el foco declarado del ajuste.
- No se declaran idiomas soportados; el comportamiento multilingüe no está documentado.
- El ajuste se entrenó con 2 épocas sobre datos escritos a mano de tamaño no especificado, lo que puede limitar la generalización a dominios alejados del corpus.
- Las pérdidas de entrenamiento y evaluación son cercanas, pero no se detalla el tamaño del conjunto de validación ni la composición del dataset.
- Licencia apache-2.0 heredada: permite uso comercial, pero conviene verificar las condiciones de la base Qwen3.8-27B original, ya que el autor solo indica que "hereda la licencia del modelo base".
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/MK4-Research/Alkus-2.6-27B-Abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- EleutherAI lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- llama.cpp: https://github.com/ggerganov/llama.cpp
- LM Studio: https://lmstudio.ai/
