# Shockem/Qwen3.8-27b-Terse-Coder-GGUF

## Resumen
Qwen3.8-27b-Terse-Coder-GGUF es la distribucion en formato GGUF del ajuste fino Shockem/Qwen3.8-27b-Terse-Coder, construido sobre Qwen/Qwen3.8-27B (27.320.697.856 parametros, ~27,3B). El modelo base pertenece a la familia Qwen3 desarrollada por Qwen Team (Alibaba Cloud), y este ajuste concreto lo publica el usuario Shockem. El objetivo declarado es reducir el consumo de tokens de razonamiento en tareas de codigo a aproximadamente una decima parte respecto del modelo original, manteniendo la correccion funcional.

La relevancia practica esta en el coste de inferencia: en cargas agenticas y de generacion de codigo, el gasto dominante suele ser la longitud de la cadena de pensamiento y el reenvio del historial completo en cada paso. Un modelo que produce respuestas correctas con menos tokens de deliberacion reduce latencia, coste por tarea y presion sobre la ventana de contexto. El repositorio incluye proyector de vision (mmproj), plantilla de chat especifica con reglas anti-ruminacion y builds de cuantizacion Q4_K_M a Q8_0.

El modelo se distribuye bajo licencia Apache 2.0, igual que el modelo base, y esta pensado para despliegue local con llama.cpp u otros runtimes compatibles con GGUF, asi como para servir en vLLM usando la variante NVFP4 o el merge fp16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3; detalles de capas y atencion no disponibles en la informacion proporcionada) |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens en el ejemplo de llama-server (`-c 32768`); maximo nativo no disponible |
| Tipos de cuantizacion | Q4_K_M (~16,8 GB), Q5_K_M (~19,5 GB), Q6_K (~22,4 GB), Q8_0 (~29,0 GB); proyector de vision mmproj-f16 (~0,9 GB) y mmproj-Q8_0 (~0,6 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con `chat_template.jinja` incluido); el modelo fuente se distribuye como merge fp16 y existe build NVFP4 para vLLM |

## Arquitectura y entrenamiento
No se dispone de detalle sobre el numero de capas, configuracion de atencion, numero de tokens de entrenamiento ni composicion del dataset del ajuste fino. La model card indica que se trata de un fine-tune del modelo Qwen3.8-27B orientado a codigo, con aproximadamente una decima parte de los tokens de razonamiento en tareas de codigo y correccion preservada. La procedencia publicada incluye un merge fp16 (Shockem/Qwen3.8-27b-Terse-Coder), un adaptador LoRA (Shockem/Qwen3.8-27b-Terse-Coder-LoRA) y un build NVFP4 para vLLM.

Elementos tecnicos destacables: el GGUF incorpora la capa draft MTP (multi-token prediction) del modelo, aunque llama.cpp no la utiliza y emite avisos sobre tensores `blk.N.nextn.*` no usados; la decodificacion especulativa es una funcionalidad del lado de vLLM. El repositorio incluye un proyector de vision, lo que implica soporte multimodal en el modelo base. La plantilla de chat (Shockem/froggeric-terse-coder, basada en froggeric/Qwen-Fixed-Chat-Templates) incorpora reglas anti-ruminacion para tool calling que, segun el autor, afectan el comportamiento agentico y se inyectan incluso junto a system prompts personalizados.

## Capacidades
- Generacion de codigo con verificacion funcional reportada por el autor (HE+ 91,5 y MBPP+ 79,4 en el repositorio fuente).
- Razonamiento matematico y de dominio cientifico (GSM8K 98,5 y GPQA 79,8 reportados en el repositorio fuente, medidos con vLLM).
- Modo de razonamiento con presupuesto de deliberacion ajustable mediante `reasoning_effort`; el texto de pensamiento llega en el campo `reasoning_content`.
- Tool calling y function calling, con reglas anti-ruminacion en la plantilla de chat para evitar repeticion de pasos ya ejecutados.
- Flujos agenticos multi-paso (evaluados por el autor en Terminal-Bench 4.0, septiembre de 2026, con vLLM local).
- Procesamiento de imagenes mediante el proyector mmproj incluido en el repositorio.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Salidas deliberadamente concisas en codigo rutinario (respuestas tipicas de 25-150 tokens; mediana de pensamiento ~38 tokens), con escalado del razonamiento en problemas dificiles (mediana ~900 tokens de razonamiento en GPQA).

## Casos de uso
- Asistencia de codigo en IDE o CLI: el modelo genera parches y explicaciones breves (25-150 tokens por respuesta rutinaria), lo que reduce latencia percibida y coste por interaccion en editores con autocompletado o chat integrado.
- Pipelines de CI/CD con revision automatica de codigo: su soporte de tool calling permite invocar linters, ejecutar tests y leer resultados dentro de un bucle agentico acotado, con la plantilla de chat adecuada para evitar pasos repetidos.
- Agentes de terminal y automatizacion de tareas de ingenieria: el autor lo evaluo en Terminal-Bench 4.0; encaja en harnesses que limitan el historial a ~3 resultados de herramienta recientes y recortan blobs antiguos a ~4k caracteres.
- Razonamiento tecnico con presupuesto controlado: para problemas de matematicas o ciencia (GPQA, GSM8K) se puede subir `reasoning_effort` solo en las consultas dificiles, manteniendo el resto del trafico barato.
- Despliegue local en estaciones de trabajo con dos GPU de consumo: el build Q4_K_M (~16,8 GB) corre a ~22 tok/s en 2x RTX 5060 Ti segun el smoke test del autor, lo que habilita asistencia de codigo sin depender de la nube.
- Analisis de capturas y diagramas tecnicos: con el proyector mmproj-f16 (~0,9 GB) el modelo puede procesar imagenes junto al contexto textual, util para interpretar diagramas de arquitectura o errores en capturas de pantalla.
- Servicio de inferencia con vLLM y decodificacion especulativa: usando el build NVFP4 o el merge fp16 se aprovecha la capa MTP para reducir latencia en despliegues con GPU de datacenter.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| HE+ | 91,5 | Medido con vLLM en el repositorio fuente |
| MBPP+ | 79,4 | Medido con vLLM en el repositorio fuente |
| GSM8K | 98,5 | Medido con vLLM en el repositorio fuente |
| GPQA | 79,8 | Medido con vLLM en el repositorio fuente |

El autor advierte que el build GGUF Q4_K_M solo fue verificado mediante smoke test (generacion de codigo correcta, parseo del razonamiento y ~22 tok/s en 2x RTX 5060 Ti), por lo que los numeros anteriores corresponden al modelo fuente y no a la cuantizacion. No se han publicado comparaciones con modelos similares en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: ~16,8 GB (Q4_K_M), ~19,5 GB (Q5_K_M), ~22,4 GB (Q6_K), ~29,0 GB (Q8_0); sumar ~0,9 GB (mmproj-f16) o ~0,6 GB (mmproj-Q8_0) si se usa vision.
- GPU recomendadas: no disponibles de forma explicita; el autor reporta ~22 tok/s con 2x RTX 5060 Ti en Q4_K_M. Para Q8_0 y contexto largo hacen falta GPU con 32 GB o mas (por ejemplo, A100 40 GB, H100, RTX 5090) o reparto entre varias GPU.
- GPU de consumo: Q4_K_M cabe en GPUs de 24 GB (RTX 4090, RTX 3090) con margen para contexto moderado; en 16 GB requiere offload parcial de capas (`-ngl`) y aceptar menor velocidad.
- Opciones de despliegue: llama.cpp / llama-server (comando de ejemplo con `--mmproj`, `-ngl 99`, `-c 32768`), Ollama y otros runtimes GGUF; vLLM con el build NVFP4 o el merge fp16 para decodificacion especulativa MTP.
- Latencia y throughput: ~22 tok/s en 2x RTX 5060 Ti con Q4_K_M (unica medida publicada). El autor recomienda no fijar `min_p` en vLLM bajo decodificacion especulativa MTP y dejar el sampling al servidor (temp 0,6 / top_k 20 / top_p 0,95 / repetition_penalty 1,05).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27b-Terse-Coder-GGUF | ~27,3B | 32.768 en configuracion de ejemplo | Apache 2.0 | GGUF (+ mmproj) | Ajuste fino orientado a codigo con razonamiento reducido; benchmarks del repositorio fuente |
| Qwen/Qwen3.8-27B (base) | ~27,3B | no disponible | Apache 2.0 | safetensors (fp16) | Modelo original sin el ajuste de concision; referencia de procedencia |
| Shockem/Qwen3.8-27b-Terse-Coder (merge fp16) | ~27,3B | no disponible | Apache 2.0 | safetensors / fp16 | Mismo ajuste en precision completa; benchmarks HE+/MBPP+/GSM8K/GPQA medidos con vLLM |
| Shockem/Qwen3.8-27b-Terse-Coder-NVFP4 | ~27,3B | no disponible | Apache 2.0 | NVFP4 | Build para vLLM con decodificacion especulativa MTP |

No se dispone de datos de benchmarks ni de especificaciones de contexto de alternativas de otros autores en la informacion proporcionada, por lo que no se puede establecer una comparacion cuantitativa con modelos de terceros.

## Limitaciones y advertencias
- Los benchmarks publicados corresponden al modelo fuente medido con vLLM; el build GGUF Q4_K_M solo paso un smoke test, por lo que la calidad tras cuantizar debe validarse en hardware propio.
- Servir sin la plantilla de chat incluida (`chat_template.jinja` o Shockem/froggeric-terse-coder) cambia el comportamiento agentico y puede provocar repeticion de pasos ya completados.
- La capa MTP presente en el GGUF no se usa en llama.cpp y genera avisos sobre tensores `blk.N.nextn.*`; la decodificacion especulativa solo esta disponible en vLLM.
- En vLLM con MTP, `min_p` es rechazado; conviene omitir parametros de sampling y dejar que el servidor aplique los valores de la configuracion.
- El coste real en agentes depende en gran medida del harness: el autor midio ~270k+ tokens de entrada por tarea con historial ilimitado, y recomienda limitar a ~3 resultados de herramienta recientes y recortar blobs antiguos a ~4k caracteres.
- Un turno con `content` vacio y `reasoning_content` no vacio es normal, no un error; los clientes deben manejarlo.
- Sesgos conocidos, idiomas efectivamente soportados y riesgos de alucinacion especificos: no disponibles en la informacion proporcionada.
- Licencia Apache 2.0, permisiva para uso comercial; conservar avisos de atribucion al modelo base (© Qwen Team, Alibaba Cloud).
- El repositorio ocupa 135,2 GB por incluir todas las cuantizaciones y proyectores; descargar solo los archivos necesarios.

## Enlaces
- Repositorio GGUF: https://huggingface.co/Shockem/Qwen3.8-27b-Terse-Coder-GGUF
- Modelo fuente (merge fp16): https://huggingface.co/Shockem/Qwen3.8-27b-Terse-Coder
- Build vLLM NVFP4: https://huggingface.co/Shockem/Qwen3.8-27b-Terse-Coder-NVFP4
- Adaptador LoRA: https://huggingface.co/Shockem/Qwen3.8-27b-Terse-Coder-LoRA
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Plantilla de chat: https://huggingface.co/Shockem/froggeric-terse-coder
- Plantillas Qwen corregidas: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
