# goodmai/Ternary-Bonsai-2-27B-MTPLX-Optimized-Speed

## Resumen

Ternary Bonsai 2 27B MTPLX Optimized Speed es una distribución del modelo Ternary Bonsai 2 27B de Prism ML, un Qwen 3.8 27B reconstruido con pesos ternarios (−1, 0, +1 con una escala por grupo) que conserva, según Prism ML, el 98,2 % de la media de benchmarks del modelo completo en 8,85 GB. Esta variante concreta, publicada por el usuario goodmai, empaqueta los pesos para MTPLX, un runtime de decodificación especulativa con predicción multi-token (MTP) nativo para Apple Silicon, con kernels de GPU específicos para la rotación y la multiplicación de matrices ternarias de Prism ML.

El modelo resuelve un problema de despliegue: ejecutar un modelo de 27 359 638 768 parámetros con torre de visión en un Mac con 16 GB de memoria unificada, con un consumo pico de 11,4 GB con un prompt de 4 061 tokens y 14,6 GB con uno de 16 350 tokens. La cabeza de predicción multi-token de Qwen 3.8 27B genera borradores que el modelo completo verifica en una sola pasada, con profundidad MTP de 1 y aceptación mediante la regla de ratio de probabilidades más remuestreo residual, lo que mantiene la distribución del modelo a cualquier temperatura.

La relevancia actual está en la combinación de compresión ternaria, visión y decodificación especulativa sobre hardware de consumo Apple. El autor reporta 64,4 tok/s en un MacBook Pro M5 Max con 128 GB tras un prompt de 4 061 tokens, frente a los 52,6 tok/s del Qwen 3.8 27B de 4 bits y con la mitad de memoria (11,4 GB frente a 23,9 GB).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen 3.8 27B) con pesos ternarios y cabeza de predicción multi-token (MTP); torre de visión incluida |
| Parámetros totales | 27 359 638 768 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8 192 tokens con 16 GB; 20 480 con 18 GB; 94 208 con 24 GB; hasta 262 144 |
| Tipos de cuantización | Ternaria (2 bits, valores −1/0/+1 con una escala por grupo); pesos del modelo de lenguaje en 7,67 GB |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `mtplx`; runtime MTPLX para Apple Silicon) |

## Arquitectura y entrenamiento

El modelo parte de Qwen 3.8 27B y ha sido reconstruido por Prism ML con pesos ternarios: cada peso del modelo de lenguaje se almacena como −1, 0 o +1 con una escala por grupo, lo que reduce el modelo de lenguaje a 7,67 GB. MTPLX ejecuta esos pesos de forma nativa mediante kernels de GPU escritos para la rotación de Prism ML y para la multiplicación de matrices ternarias. Se incluye la torre de visión del Qwen 3.8 27B original y la cabeza de predicción multi-token, que actúa como modelo borrador mientras el modelo completo verifica los borradores en una sola pasada.

El contrato de serving viaja dentro de `mtplx_runtime.json` y MTPLX lo lee al cargar. Los borradores se aceptan con la regla de ratio de probabilidades más remuestreo residual, de modo que la salida sigue la distribución propia del modelo a cualquier temperatura. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el proceso de Prism ML. El esfuerzo de razonamiento es medio por defecto y existe un nivel `xhigh` disponible; la profundidad MTP es 1 y el muestreo recomendado es temperatura 1,0, top-p 0,95 y top-k 20.

## Capacidades

- Generación de texto y conversación multi-turno con ventana de contexto configurable según la memoria del equipo.
- Razonamiento con niveles de esfuerzo configurables (medio por defecto, `xhigh` disponible).
- Codificación: el modelo está etiquetado para uso con clientes de agentes como OpenCode y Claude Code.
- Visión: pipeline `image-text-to-text` con la torre de visión de Qwen 3.8 27B incluida, por lo que acepta imágenes como entrada.
- Decodificación especulativa con predicción multi-token (MTP) integrada en el runtime.
- Ejecución local en Apple Silicon sin Python en el caso de la app Basalt para macOS.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Asistencia de programación en local: el modelo está etiquetado para OpenCode y Claude Code, de modo que puede servir como backend de un agente de código en un MacBook con 18 GB o más de memoria unificada, aprovechando la ventana de contexto ampliada y la decodificación especulativa para reducir la latencia en iteraciones de edición.
- Análisis de capturas de pantalla y diagramas: al incluir la torre de visión de Qwen 3.8 27B, puede procesar imágenes junto a texto, por ejemplo para revisar interfaces, leer diagramas de arquitectura o extraer información de documentación escaneada sin salir del equipo.
- Procesamiento de documentos largos: con 94 208 tokens de contexto en equipos de 24 GB y hasta 262 144 en configuraciones mayores, es adecuado para resumir o consultar repositorios de documentación y expedientes extensos en una sola pasada.
- Desarrollo offline y entornos con requisitos de privacidad: al ejecutarse íntegramente en local sobre Apple Silicon, permite trabajar con código propietario o datos sensibles sin enviar prompts a servicios externos.
- Prototipado rápido de aplicaciones con visión y lenguaje: el pipeline `image-text-to-text` y el servidor REST de Basalt (`basalt serve --model ... --mtp --rest`) permiten levantar un endpoint local para probar flujos multimodal antes de invertir en infraestructura de GPU.
- Agentes autónomos de múltiples pasos en estación de trabajo: la ventana de contexto amplia y el modo de razonamiento `xhigh` permiten mantener el estado de una tarea larga, aunque el soporte explícito de tool calling no está documentado en la información disponible.
- Evaluación de técnicas de compresión: sirve como banco de pruebas para comparar pesos ternarios frente a cuantizaciones de 4 bits en la misma máquina, con métricas de velocidad y memoria pico publicadas por el autor.

## Benchmarks y rendimiento

Datos medidos por el autor en MTPLX 2.12.0 (22 de septiembre de 2026) sobre un MacBook Pro M5 Max con 128 GB, temperatura 1,0, top-p 0,95, top-k 20, thinking desactivado, 512 tokens generados y un solo modelo cargado a la vez:

| Prompt | Bonsai 2 27B Optimized Speed | Qwen 3.8 27B Optimized Speed | Memoria pico (Bonsai / 27B) |
|---|---:|---:|---:|
| 4 061 tokens | 64,4 tok/s | 52,6 tok/s | 11,4 GB / 23,9 GB |
| 16 350 tokens | 57,1 tok/s | 51,0 tok/s | 14,6 GB / 27,0 GB |

Prism ML reporta 46,8 tok/s para Bonsai 2 27B en un M5 Max con MLX, frente a los 64,4 tok/s de esta variante sobre MTPLX. Prism ML afirma que el modelo conserva el 98,2 % de la media de benchmarks del modelo completo. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks académicos.

## Requisitos de hardware

- Memoria unificada mínima: 16 GB; 18 GB o más si se usan clientes de agentes como OpenCode.
- Memoria pico al servir: 11,4 GB con un prompt de 4 061 tokens y 14,6 GB con uno de 16 350 tokens.
- Descarga: 8,85 GB.
- Equipos recomendados: Apple Silicon M3, M4 y M5 con 16 a 31 GB; es la primera recomendación de MTPLX 2.12.0 en ese rango. Funciona en MacBook Air, MacBook Pro y Mac mini.
- GPU dedicadas (A100, H100, RTX 4090): no disponible; el modelo está empaquetado para Apple Silicon y MLX, no para CUDA.
- Opciones de despliegue: app MTPLX para macOS (2.12.0 o posterior), CLI `mtplx serve --model ...`, y Basalt para macOS 27 o superior con Apple Silicon sin Python (`basalt serve --model ... --mtp --rest`).
- Rendimiento: 64,4 tok/s con prompt de 4 061 tokens y 57,1 tok/s con prompt de 16 350 tokens en M5 Max de 128 GB, según las mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Velocidad reportada | Memoria pico | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ternary Bonsai 2 27B MTPLX Optimized Speed | 27,36 B (ternario) | 8 192 a 262 144 según memoria | 64,4 tok/s (prompt 4K, M5 Max) | 11,4 GB (4K) | Apache 2.0 | Hugging Face, runtime MTPLX |
| Qwen 3.8 27B Optimized Speed (4 bits) | 27 B (4 bits) | no disponible | 52,6 tok/s (prompt 4K, M5 Max) | 23,9 GB (4K) | Apache 2.0 (modelo base) | Hugging Face, runtime MTPLX |
| MiMo V2.6 Qwen 9B Optimized Speed | 9 B | no disponible | no disponible | no disponible | no disponible | Hugging Face, runtime MTPLX |
| Ternary Bonsai 2 27B (MLX, Prism ML) | 27 B (ternario) | no disponible | 46,8 tok/s (M5 Max, MLX) | no disponible | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- La cuantización ternaria introduce pérdida de precisión: el autor cita una retención del 98,2 % de la media de benchmarks, lo que implica una degradación medible frente al Qwen 3.8 27B completo.
- El modelo está atado al runtime MTPLX y a Apple Silicon; no hay rutas de despliegue documentadas para CUDA, vLLM, llama.cpp, Ollama o TGI.
- El contexto efectivo depende de la memoria del equipo: 8 192 tokens en 16 GB es una ventana reducida para tareas de agente o documentos largos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y es una republicación de un modelo de otro usuario (`Youssofal`), por lo que conviene verificar la integridad de los pesos frente al original.
- Los benchmarks de velocidad proceden del autor del modelo y de una única configuración de hardware (M5 Max, 128 GB); no hay validación independiente.
- El soporte de tool calling, los idiomas cubiertos y el comportamiento multilingüe no están documentados.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero se deben conservar `LICENSE` y `NOTICE.txt` del repositorio, que incluyen las condiciones heredadas de Qwen 3.8 27B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/goodmai/Ternary-Bonsai-2-27B-MTPLX-Optimized-Speed
- Modelo original del mismo pack: https://huggingface.co/Youssofal/Ternary-Bonsai-2-27B-MTPLX-Optimized-Speed
- Modelo base de Prism ML: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Runtime MTPLX: https://mtplx.com
- Repositorio Basalt: https://github.com/goodmai/basalt
- Demo de Basalt en Hugging Face Spaces: https://goodmai-run-with-basalt.hf.space/?model=goodmai%2FTernary-Bonsai-2-27B-MTPLX-Optimized-Speed&role=mtp
- Modelo hermano Qwen 3.8 27B Optimized Speed: https://huggingface.co/Youssofal/Qwen3.8-27B-MTPLX-Optimized-Speed
- Modelo hermano MiMo V2.6 Qwen 9B Optimized Speed: https://huggingface.co/Youssofal/MiMo-V2.6-Qwen-9B-MTPLX-Optimized-Speed
