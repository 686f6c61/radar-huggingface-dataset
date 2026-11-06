# brainworkup/Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e-MTP

## Resumen

Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e-MTP es una cuantización de 6 bits en formato MLX de un modelo MoE de 35.951.822.704 parámetros totales, derivado de `huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated`, que a su vez es una versión sin censura de Ornith-1.5-35B-A3B. El autor de la cuantización es el usuario `brainworkup`, y el trabajo se apoya en el cuantizador oQ de oMLX, una calibración propia orientada a ciberseguridad y la plantilla de chat Sharp. El resultado es un modelo orientado a programación agéntica y seguridad ofensiva, distribuido bajo licencia MIT y pensado para ejecutarse en Apple Silicon.

La relevancia del modelo radica en dos factores. Por un lado, combina una arquitectura MoE con 35B de parámetros totales y una cabeza de predicción multi-token (MTP) entrenada, lo que permite decodificación especulativa en runtimes compatibles. Por otro, se presenta como un modelo «abliterated»: se han eliminado los mecanismos de rechazo, de modo que responde a peticiones que otros modelos rechazarían, incluyendo tareas de seguridad ofensiva. El autor declara que, en cuantización de 4 bits, resuelve aproximadamente un 70 % más de problemas reales de programación que Ornith-1.5 y Qwen3.6-35B-A3B.

El paquete ocupa 30,2 GB y está pensado para ejecutarse con oMLX. La model card advierte explícitamente de que las builds MLX con cabeza MTP fallan en LM Studio, generando tokens aleatorios desde el primer token, por lo que en ese runtime debe usarse la build GGUF o la variante MLX sin MTP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`, familia Qwen3.5-MoE) con cabeza de predicción multi-token (MTP) |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ6e (6 bits, cuantizador oQ de oMLX); existe build GGUF con `UD-Q4_K_M` y build MLX oQ4e en la misma familia |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), GGUF disponible en build separada |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos (MoE) de la familia Qwen3.5-MoE, con 35.951.822.704 parámetros totales. Incorpora una cabeza de predicción multi-token (MTP) entrenada por Ornith-1.5, que habilita decodificación especulativa en runtimes que la soportan: el modelo predice varios tokens por paso y un verificador los valida, aumentando el throughput efectivo. La cuantización se realizó con el cuantizador oQ de oMLX a 6 bits, usando un corpus de calibración propio ponderado hacia ciberseguridad, y se aplicó la plantilla de chat Sharp. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni el proceso de alineación (RLHF/DPO) del modelo base.

El modelo base es una versión abliterated de Ornith-1.5-35B-A3B: se han eliminado las direcciones de rechazo del espacio de activaciones, de modo que el modelo no presenta negativas ante peticiones dañinas o de seguridad ofensiva. Según la model card, el modelo «piensa y habla menos» que Ornith-1.5 y Qwen3.6-35B-A3B, lo que se traduce en menor latencia por resolución a igualdad de calidad. Los datos de rendimiento publicados se midieron sobre la build GGUF en `UD-Q4_K_M`, no sobre esta build MLX de 6 bits, y el propio autor advierte que cambiar de cuantizador altera los resultados.

## Capacidades

- Generación de texto y razonamiento en inglés y chino.
- Programación agéntica: resolución autónoma de issues y bugs en bases de código grandes, con pruebas de regresión ocultas (evaluado en SWE-bench-Live).
- Capacidades de seguridad ofensiva: resolución de retos CTF sin guía (Cybench) y ausencia de rechazos en HarmBench.
- Soporte de tool calling / function calling (etiqueta `agentic-coding`).
- Razonamiento multi-paso y uso de agentes.
- Capacidades de visión: pipeline `image-text-to-text`, entrada de imagen y texto.
- Decodificación especulativa mediante cabeza MTP en runtimes compatibles (oMLX; llama.cpp con la build GGUF).
- Modo sin censura: no rechaza peticiones sobre seguridad ofensiva ni contenido que otros modelos declinarían.
- Multilingüe limitado a inglés y chino.

## Casos de uso

- Resolución autónoma de issues en repositorios: el modelo puede recibir un bug report y un checkout del código, navegar por el árbol de ficheros, aplicar parches y validar contra la suite de tests, gracias a su capacidad agéntica y a su entrenamiento orientado a SWE-bench-Live.
- Auditoría de seguridad ofensiva en entornos sandbox: al no rechazar tareas de explotación, puede analizar vulnerabilidades, construir pruebas de concepto y redactar informes de pentesting, siempre dentro de un sandbox monitorizado.
- Automatización de pipelines CI/CD: con soporte de tool calling, puede integrarse como agente que interpreta fallos de build, propone parches y abre pull requests.
- Asistente de programación en local sobre Apple Silicon: la cuantización de 6 bits y 30,2 GB permite ejecutarlo en un Mac con memoria unificada suficiente, sin depender de la nube.
- Formación y CTF: resolución guiada de retos de captura de la bandera y generación de writeups técnicos, aprovechando su rendimiento en Cybench (15 de 43 retos sin guía).
- Procesamiento de documentación técnica con imágenes: al aceptar entrada image-text-to-text, puede extraer información de diagramas de arquitectura, capturas de pantalla de errores o documentación escaneada.
- Investigación sobre alineación y seguridad: útil como modelo de referencia sin rechazos para estudiar comportamiento abliterated y comparar con variantes censuradas como TielCoder.

## Benchmarks y rendimiento

Los datos publicados corresponden a la build GGUF en `UD-Q4_K_M`, no a esta build MLX de 6 bits. El autor advierte que no deben interpretarse como mediciones de este fichero.

| Benchmark | Resultado | Notas |
|---|---|---|
| SWE-bench-Live | ~70 % más problemas resueltos que Ornith-1.5 y Qwen3.6-35B-A3B | Medido a 4 bits sobre GGUF; mejora ~7x mayor que el salto generacional Qwen3.5→3.6 |
| Cybench (unguided) | 15/43 flags (35 %) | Sin pistas ni juez |
| HarmBench | 0 % de rechazos en 84 peticiones | Muestreo de 12 a la vez |
| Velocidad de resolución | 3-4x más rápido que un denso 3.8-27B | En tareas de coding agéntico |

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 30,2 GB para la build MLX oQ6e; la build GGUF `UD-Q4_K_M` y la MLX oQ4e requieren menos memoria.
- GPU recomendadas: Apple Silicon con memoria unificada de al menos 32 GB para la build de 6 bits; el modelo está empaquetado para MLX, no para CUDA.
- Cabe en GPU de consumo: sí, en Mac con memoria unificada suficiente; no está pensado para GPUs NVIDIA de consumo en este formato.
- Opciones de despliegue: oMLX (soporte completo, incluida la cabeza MTP); llama.cpp con la build GGUF; LM Studio solo con la build GGUF o la variante MLX sin MTP.
- Latencia y throughput: no disponibles de forma numérica; el autor indica que la decodificación especulativa vía MTP y el menor número de tokens de razonamiento redundante aceleran la resolución de tareas frente a modelos comparables.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e-MTP | 35,95B totales (MoE) | no disponible | MIT | MLX safetensors | Abliterated, MTP, 6 bits, visión |
| Tiel-Coder-35B-A3B-MLX-oQ4e | 35,95B totales (MoE) | no disponible | MIT | MLX safetensors | Variante censurada, 4 bits |
| Huihui-Ornith-1.5-35B-A3B-abliterated | 35,95B totales (MoE) | no disponible | no disponible | safetensors | Modelo base, sin cuantizar |
| Ornith-1.5-35B-A3B | 35,95B totales (MoE) | no disponible | no disponible | safetensors | Modelo original, con rechazos |
| Qwen3.6-35B-A3B | 35B totales (MoE) | no disponible | no disponible | safetensors | Referencia de la familia; ~70 % menos resolución en SWE-bench-Live según el autor |

## Limitaciones y advertencias

- Modelo abliterated: no rechaza peticiones dañinas; el usuario asume toda la responsabilidad legal y ética del uso y debe sandboxear y monitorizar la ejecución.
- Riesgo elevado de alucinación en tareas de seguridad: las respuestas ofensivas pueden ser plausibles pero incorrectas, con consecuencias reales si se aplican sin validación.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado.
- Longitud de contexto no disponible en la información proporcionada.
- Las builds MLX con MTP generan basura en LM Studio; usar oMLX o la build GGUF.
- Los benchmarks publicados corresponden a la build GGUF a 4 bits, no a esta build de 6 bits; el autor advierte de que no son extrapolables.
- Licencia MIT permite uso comercial, pero la ausencia de rechazos traslada al integrador la responsabilidad sobre el contenido generado y el cumplimiento normativo.
- Sin datos publicados de MMLU, HumanEval ni GSM8K; la evaluación se centra en SWE-bench-Live, Cybench y HarmBench.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brainworkup/Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e-MTP
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
- Ornith-1.5-35B-A3B original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Build GGUF: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF
- Build MLX sin MTP: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e
- Variante censurada Tiel-Coder: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ4e
- Plantillas de chat Sharp: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
