# Lucasgitguy-co/K2-Horizon-4x0.9B-MoE-Cyber-MLX-4bit

## Resumen

K2-Horizon-4x0.9B-MoE-Cyber-MLX-4bit es una cuantizacion a 4 bits en formato MLX del modelo K2-Horizon-4x0.9B-MoE-Cyber, un modelo de mezcla de expertos (MoE) especializado en ciberseguridad y desarrollado por Lucasgitguy-co. El modelo base parte de K2-Horizon-4x0.9B-MoE-heretic, una variante sin censura (refusals eliminados mediante la tecnica Heretic), y se afino con datasets de seguridad (Voidreaper2026/cybersec-master-dataset y Vyber07/cyber-security) mediante LoRA por experto. Esta version concreta esta pensada para ejecutarse en Apple silicon con la libreria mlx-lm.

El modelo cuenta con 3.060.266.496 parametros totales distribuidos en 4 expertos de aproximadamente 0,9B cada uno, lo que resulta en un modelo de unos 3B totales con un tamano de repositorio de 1,7 GB tras la cuantizacion 4-bit. Es relevante para desarrolladores que trabajan en Mac con Apple silicon y necesitan un modelo ligero, local y sin restricciones de contenido sobre temas de seguridad ofensiva y defensiva.

La cuantizacion 4-bit tiene un coste medible en calidad: el modelo pierde rendimiento frente a la version bf16 en las pruebas publicadas (CyberMetric-500 cae de 0,732 a 0,684), por lo que el autor recomienda usar 8-bit en MLX o Q5_K_M o superior en GGUF cuando la precision importe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) tipo transformer con 4 expertos y router de 4 vias en bf16; arquitectura `k2_horizon` (codigo propio en `k2_horizon_mlx.py`) |
| Parametros totales | 3.060.266.496 |
| Parametros activos | Aproximadamente 0,9B por token (top-1 routing segun la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine 4-bit, group size 64; router en bf16. Variantes disponibles: bf16, MLX 8-bit, GGUF BF16/Q8_0/Q6_K/Q5_K_M/Q4_K_M |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

Se trata de un transformer con arquitectura de mezcla de expertos (MoE) de 4 expertos, cada uno de aproximadamente 0,9B parametros, con un router de 4 vias que selecciona top-1 por token. El router se mantiene en bf16 durante la cuantizacion para preservar la precision del enrutado. El modelo base (heretic) partia de expertos casi identicos entre si; el afinado aplico LoRA por experto, lo que permite que los expertos diverjan, aunque el router no se reentreno. La implementacion MLX no existe de forma nativa en mlx-lm, por lo que la arquitectura se distribuye como codigo propio (`k2_horizon_mlx.py`) y requiere `--trust-remote-code`. El port se valido contra el codigo transformers original con una concordancia top-1 de 1.000 en fp32.

El afinado se realizo sobre los datasets Voidreaper2026/cybersec-master-dataset y Vyber07/cyber-security, en ingles. Se eliminaron de los datos de entrenamiento las preguntas que coincidian con preguntas de CyberMetric o ARC para evitar contaminacion en la evaluacion. El modelo base habia sido sometido a un proceso de eliminacion de rechazos (Heretic) que el afinado no revirtio. No se especifica en la informacion disponible el numero de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat mediante plantilla (`apply_chat_template`).
- Conocimiento especializado en ciberseguridad: conceptos de seguridad ofensiva y defensiva, vectores CVSS, tecnicas como pass-the-hash o Kerberoasting.
- Modo de razonamiento configurable mediante `reasoning_effort` (`none`, `low`, `medium`, `high`), heredado del modelo base; por defecto `none` (respuesta directa).
- Modelo sin censura: no incorpora rechazos, lo que permite tratar temas de seguridad que otros modelos rechazan.
- Ejecucion local en Apple silicon mediante mlx-lm.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Formacion y laboratorios de ciberseguridad: el modelo puede explicar tecnicas de ataque y defensa (pass-the-hash, Kerberoasting, interpretacion de vectores CVSS) sin rechazos, util en entornos de aprendizaje autorizados donde otros modelos censuran el contenido.
- Asistente local de consulta para analistas: desplegado en un Mac con mlx-lm, permite consultar conceptos de seguridad sin enviar datos a servicios en la nube, lo que reduce la exposicion de informacion sensible.
- Generacion de material de concienciacion: redaccion de explicaciones y ejemplos de amenazas para equipos no tecnicos, en ingles, con la salvedad de verificar datos exactos.
- Prototipado rapido de chatbots tematicos de seguridad: al ser un modelo de 1,7 GB y ~0,9B activos, cabe en equipos de consumo y permite iterar rapidamente sobre prompts y plantillas de chat.
- Pruebas de evaluacion de modelos sin censura: util como referencia en investigacion sobre alineacion, rechazos y comportamiento de modelos hereticos.
- Educacion y autoaprendizaje en seguridad: respuestas directas sobre conceptos, herramientas y configuraciones, siempre con verificacion posterior por la tendencia del modelo a errores confiados.

## Benchmarks y rendimiento

| Modelo | CyberMetric-500 | ARC-Easy (500) | Held-out answer loss |
|---|---|---|---|
| K2-Horizon-4x0.9B-MoE-heretic (base) | 0,714 | 0,782 | 1,686 |
| K2-Horizon-4x0.9B-MoE-Cyber (bf16) | 0,732 | 0,770 | 1,020 |
| MLX 8-bit | 0,732 | no disponible | 1,021 |
| MLX 4-bit (este modelo) | 0,684 | no disponible | 1,162 |

Las preguntas de CyberMetric-500 y ARC-Easy se puntuan por log-probabilidad de cada opcion tras `Answer:` en modo no-think. El held-out loss es la perdida media sobre tokens de respuesta en 200 filas de validacion no vistas en entrenamiento. Con 500 preguntas, el error estandar es de aproximadamente ±0,02. Segun el autor, las diferencias en multiple choice estan dentro de un error estandar, por lo que no demuestran una mejora clara de conocimiento en ciberseguridad; el descenso de held-out loss refleja aprendizaje del estilo y contenido de las respuestas de entrenamiento. La version 4-bit pierde de forma apreciable frente a bf16 y 8-bit.

## Requisitos de hardware

- VRAM/ memoria unificada estimada: el repositorio ocupa 1,7 GB en 4-bit, por lo que la inferencia requiere aproximadamente 2 GB de memoria unificada, mas el espacio para el contexto y el codigo de arquitectura.
- GPU recomendadas: Apple silicon (M1, M2, M3, M4 y posteriores) mediante mlx-lm; no esta pensado para GPU NVIDIA en este formato. Para CUDA, usar la variante GGUF con llama.cpp.
- Cabe en GPU de consumo: si, en cualquier Mac con Apple silicon con memoria suficiente (2 GB o mas). En el ecosistema NVIDIA, la variante GGUF Q4_K_M tambien cabe en GPUs de consumo, aunque este repositorio concreto es MLX.
- Opciones de despliegue: mlx-lm 0.32.2 o superior con `--trust-remote-code` (obligatorio); LM Studio con motor MLX no lo carga por no pasar esa opcion, por lo que en LM Studio debe usarse la version GGUF; llama.cpp, LM Studio y Ollama (build 12110 o superior) solo con la variante GGUF; demo en navegador mediante el Space K2-Horizon Cyber Chat.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| K2-Horizon-4x0.9B-MoE-Cyber-MLX-4bit (este) | 3,06B totales, ~0,9B activos | no disponible | Ciberseguridad, sin censura, MLX 4-bit | Apache 2.0 | Hugging Face, mlx-lm |
| K2-Horizon-4x0.9B-MoE-Cyber (bf16) | 3,06B totales, ~0,9B activos | no disponible | Ciberseguridad, sin censura | Apache 2.0 | Hugging Face, transformers |
| K2-Horizon-4x0.9B-MoE-Cyber-MLX-8bit | 3,06B totales, ~0,9B activos | no disponible | Ciberseguridad, sin censura, MLX 8-bit | Apache 2.0 | Hugging Face, mlx-lm |
| K2-Horizon-4x0.9B-MoE-Cyber-GGUF | 3,06B totales, ~0,9B activos | no disponible | Ciberseguridad, sin censura, GGUF | Apache 2.0 | Hugging Face, llama.cpp/LM Studio/Ollama |

No se dispone en la informacion proporcionada de comparaciones con modelos de otros autores de tamano o tarea similares.

## Limitaciones y advertencias

- Modelo pequeno: aproximadamente 1B de parametros activos por token; se esperan errores, especialmente en numeros de CVE exactos, fechas, versiones y flags de herramientas. Verificar antes de actuar sobre una respuesta.
- Errores confiados documentados: en una prueba de 10 respuestas, el modelo describio mal el mecanismo de Kerberoasting (lo presento como una peticion HTTP en lugar de un crack offline de un ticket de servicio) y malinterpreto un vector CVSS. Las respuestas suenan fluidas aunque sean incorrectas.
- Modo no-think por defecto: `reasoning_effort` es `none`; los modos `low`, `medium` y `high` existen del modelo base pero el afinado no los entreno.
- Expertos casi identicos: los 4 expertos partieron como copias casi exactas; el LoRA por experto los separa algo, pero el router no se reentreno.
- Base sin censura: los rechazos se eliminaron con Heretic y el afinado no los restauro. Uso previsto para aprendizaje, defensa y pruebas autorizadas; la responsabilidad del uso recae en el usuario.
- Solo ingles: los datos de entrenamiento estan en ingles.
- La cuantizacion 4-bit degrada la calidad de forma medible (CyberMetric-500 de 0,732 a 0,684); se recomienda 8-bit en MLX o Q5_K_M o superior en GGUF cuando la precision sea critica.
- Requiere `trust_remote_code` en mlx-lm; las aplicaciones que no pasan esa opcion (como el motor MLX de LM Studio) no cargaran este repositorio.
- Licencia Apache 2.0: permite uso comercial, pero el contenido generado sobre tecnicas ofensivas debe manejarse con las salvaguardas legales y eticas correspondientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lucasgitguy-co/K2-Horizon-4x0.9B-MoE-Cyber-MLX-4bit
- Modelo base (bf16): https://huggingface.co/Lucasgitguy-co/K2-Horizon-4x0.9B-MoE-Cyber
- Version MLX 8-bit: https://huggingface.co/Lucasgitguy-co/K2-Horizon-4x0.9B-MoE-Cyber-MLX-8bit
- Version GGUF: https://huggingface.co/Lucasgitguy-co/K2-Horizon-4x0.9B-MoE-Cyber-GGUF
- Modelo heretic (base del afinado): https://huggingface.co/Lucasgitguy-co/K2-Horizon-4x0.9B-MoE-heretic
- Demo en navegador: https://huggingface.co/spaces/Lucasgitguy-co/K2-Horizon-Cyber-Chat
- Dataset CyberMetric: https://huggingface.co/datasets/tihanyin/CyberMetric
- Dataset de entrenamiento: https://huggingface.co/datasets/Voidreaper2026/cybersec-master-dataset
- Dataset de entrenamiento: https://huggingface.co/datasets/Vyber07/cyber-security
