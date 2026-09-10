# massimolauri/NomadCoder-4B-GGUF

## Resumen

NomadCoder-4B-GGUF es un modelo de generación de texto especializado en código, publicado por Massimo Lauri en Hugging Face y distribuido exclusivamente en formato GGUF cuantizado. Parte del modelo base Qwen/Qwen3.5-4B (4.205.751.296 parámetros, aproximadamente 4,21 B) y añade lo que el autor denomina arquitectura Engram: tablas de memoria asociativa condicional (multi-head conditional memory) que se pliegan en los pesos del transformer para no requerir kernels ni bucles de ejecución personalizados.

El objetivo declarado es la ejecución íntegra en CPU sobre hardware modesto. Según los datos del autor, el binario ocupa 2,57 GB en disco y en RAM, y alcanza unos 15,8 tokens/s de generación y 100-136 tokens/s de procesamiento de prompt en un Intel Xeon Gold 5220R con AVX-512, con una latencia hasta el primer token inferior a 300 ms. La licencia es Apache 2.0 y los idiomas declarados son inglés e italiano.

Su interés práctico está en la especialización: el ajuste se realizó sobre 592 muestras multi-turno centradas en Next.js 15.4, React 19, componentes shadcn/Aceternity y patrones de concurrencia en Linux, dominios en los que el autor reporta una reducción del 85,07 % de la perplejidad respecto al modelo base. Como contrapartida, la ventana configurada en el GGUF es de solo 4.096 tokens, no hay benchmarks estándar publicados, el repositorio no tiene descargas ni valoraciones y todos los datos son autoinformados por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso de 32 bloques derivado de Qwen 3.5 4B, con tablas de memoria asociativa Engram (multi-head conditional memory, weight-folded) |
| Parámetros totales | 4.205.751.296 (aproximadamente 4,21 B) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 4.096 tokens en la configuración GGUF; el autor declara contexto nativo de entrenamiento de hasta 262.144 tokens |
| Tipos de cuantización | Q4_K_M (mezcla: tensores críticos en Q6_K de 6 bits, resto en Q4_K de 4 bits) |
| Idiomas soportados | Inglés (en) e italiano (it) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp, Ollama) |
| Modelo base | Qwen/Qwen3.5-4B (Alibaba Cloud) |
| Tamaño del repositorio | 2,7 GB |
| Huella en disco y RAM | 2,57 GB |
| Hardware objetivo | CPU x86 con AVX-512 o AVX2; inferencia 100 % en CPU |
| Autor | Massimo Lauri |

## Arquitectura y entrenamiento

La base es un transformer estándar de 32 bloques (la capa auxiliar de Multi-Token Prediction se excluye con `--no-mtp`). Sobre esa base, el autor introduce tablas de memoria asociativa condicional que indexan subsecuencias de tokens (unigramas, bigramas, trigramas) mediante hashing polinómico con módulo primo, precedidas de una convolución causal 1D que preserva el orden temporal local. Las características de consulta recuperan embeddings de memoria de bajo rango mediante matrices de proyección clave y valor de dimensión 2560 × 1024, y el resultado se inyecta de forma aditiva y escalada (gated residual injection) en los estados ocultos, sin desplazar las representaciones base.

La innovación clave es el Engram Weight Folding: la actualización de rango aprendida se calcula como ΔW = (W_val · W_key^T) · scale, una matriz de 2560 × 2560, y se pliega matemáticamente en las proyecciones de salida de atención lineal (`linear_attn.out_proj.weight`) y en las redes feed-forward (`mlp.down_proj.weight`) de las capas 1 y 15. Esto evita bucles en Python o kernels CUDA personalizados, que según el autor degradaban la velocidad a 2-3 tokens/s y elevaban el consumo a 18 GB de RAM en FP32, y permite ejecutar el modelo con motores SIMD AVX-512 estándar sin sobrecarga en tiempo de ejecución.

El ajuste se realizó sobre un corpus de 592 muestras multi-turno procedentes de cuatro conjuntos de datos: `saidutta69/fable-5-premium` (200 muestras, SRE Linux, bloqueos asíncronos distribuidos, Redlock con Lua atómico), `Slava32/next.js-15.4-with-reasoning` (150 muestras, React 19 con `useActionState` y `useOptimistic`, Server Actions, caché del App Router, validación con Zod), `dimsavva/shadcn` (150 muestras, componentes accesibles y microanimaciones) y `ParthDesai1719/aceternity_ui_comps` (92 muestras, tarjetas 3D con `perspective: 1000px`, iluminación dinámica por cursor). La model card no especifica número total de tokens, composición completa del dataset ni si se emplearon RLHF o DPO; sí reporta métricas de convergencia: perplejidad inicial del modelo base de 16,54 (loss 2,8059) frente a 2,47 final (loss 0,9039).

## Capacidades

- Generación de código en dominios concretos: frontend con Next.js 15.4 y React 19, componentes shadcn y Aceternity, Tailwind CSS y animaciones con física de muelle.
- Patrones de sistemas y concurrencia: SRE en Linux, bloqueos asíncronos distribuidos, liberación atómica con Lua y gestión de huérfanos en concurrencia.
- Validación de formularios y esquemas tipados con Zod, junto con Server Actions de Next.js.
- Conversación multi-turno según la etiqueta `conversational` del repositorio.
- Capacidades multilingües limitadas a inglés e italiano.
- No se documenta soporte de tool calling o function calling, razonamiento en modo thinking, capacidades de visión, audio ni uso como agente multi-paso.
- Ejecución sin GPU: el modelo está diseñado para funcionar en CPU con AVX-512/AVX2 dentro de llama.cpp y Ollama.

## Casos de uso

- Generación de componentes React 19 en local: el modelo puede producir componentes con `useActionState` y `useOptimistic`, integrados con Server Actions, sin enviar código propietario a servicios en la nube gracias a su ejecución 100 % en CPU.
- Asistente de frontend en portátiles sin GPU dedicada: con 2,57 GB de RAM permite autocompletado y generación de fragmentos Next.js 15.4 dentro de un editor, con TTFT inferior a 300 ms según las mediciones del autor.
- Revisión de código de concurrencia en servicios Linux: dado su entrenamiento en SRE y bloqueos distribuidos, puede revisar implementaciones de Redlock o de liberación atómica en Lua y proponer correcciones.
- Generación de interfaces accesibles: producción de componentes shadcn con microanimaciones y transiciones `cubic-bezier` coherentes con un sistema de diseño existente.
- Prototipado de efectos visuales 3D: creación de tarjetas con perspectiva, iluminación dinámica ligada al cursor y física de muelle en Aceternity UI, útil en fases de exploración de producto.
- Despliegue en entornos air-gapped o de borde: al ser un único archivo GGUF de 2,57 GB sin dependencias de CUDA, se puede servir con `llama-server` en máquinas aisladas o contenedores ligeros.
- Servicio de completado interno de bajo coste: con 100-136 tokens/s de procesamiento de prompt, es viable atender peticiones cortas de documentación técnica o snippets en un servidor compartido sin GPUs.
- No se recomienda para tareas fuera de su dominio especializado (por ejemplo, matemáticas avanzadas, razonamiento general o análisis de documentos largos), ya que no hay evidencia publicada al respecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos son métricas de convergencia y de ejecución en CPU reportadas por el autor.

| Métrica | Resultado | Notas |
|---|---|---|
| Perplejidad del modelo base | 16,54 (loss 2,8059) | Medida sobre el dominio objetivo |
| Perplejidad final ajustada | 2,47 (loss 0,9039) | Reducción del 85,07 % según el autor |
| MMLU | no disponible | |
| HumanEval | no disponible | |
| GSM8K | no disponible | |
| Procesamiento de prompt | 100-136 tokens/s | Intel Xeon Gold 5220R @ 2,20 GHz, 24 núcleos, AVX-512, un socket |
| Generación autorregresiva | ~15,8 tokens/s | Saturado el ancho de banda de memoria DDR4 |
| Latencia hasta el primer token | < 300 ms | Misma configuración |
| Huella de RAM | ~2,57 GB | Frente a 18 GB en PyTorch FP32 según el autor |

## Requisitos de hardware

- Inferencia en CPU: es el modo objetivo. Requiere x86 con AVX-512 o AVX2; el autor reporta 15,8 tokens/s de generación y 100-136 tokens/s de prompt en un Xeon Gold 5220R de 24 núcleos a 2,20 GHz.
- Memoria RAM: 2,57 GB de huella declarada para los pesos en Q4_K_M, más el espacio de trabajo del runtime y la caché KV para 4.096 tokens.
- VRAM estimada para uso en GPU (estimación a partir del tamaño del archivo, no documentada por el autor): alrededor de 2,6 GB de pesos más 0,5-1,5 GB de caché KV y sobrecarga, es decir, del orden de 3,5-4,5 GB para Q4_K_M con 4.096 tokens de contexto.
- Cabe en GPU de consumo: cualquier tarjeta con 6 GB o más de VRAM debería poder alojarlo en Q4_K_M; en tarjetas de 4 GB el margen es muy ajustado. El autor no ha publicado medidas con offload a GPU.
- GPU recomendadas: no disponibles en la información proporcionada. El único hardware documentado es una CPU Xeon Gold 5220R.
- Opciones de despliegue: Ollama (`ollama run hf.co/massimolauri/NomadCoder-4B-GGUF`) y llama.cpp mediante `llama-server` con los parámetros indicados por el autor (`-ngl 0 -c 4096 -t 16 -tb 24 --jinja`). El flag `-ngl 0` fuerza ejecución en CPU; no se documenta compatibilidad con vLLM ni TGI, que no soportan este GGUF con pesos plegados.
- Latencia y throughput: solo se conocen los valores citados para la configuración Xeon Gold 5220R; no hay datos para otras CPU ni para GPU.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la información proporcionada. La única referencia documentada es el modelo base, del que tampoco se detallan especificaciones más allá de su identificador.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NomadCoder-4B-GGUF | 4,21 B | 4.096 tokens en GGUF (hasta 262.144 declarados en entrenamiento) | Perplejidad 2,47 en dominio objetivo; 15,8 tokens/s en CPU Xeon | Apache 2.0 | GGUF en Hugging Face; 0 descargas |
| Qwen/Qwen3.5-4B (base) | 4,21 B (heredados) | No disponible | No disponible | No disponible en la información | Hugging Face |
| Alternativas de 4 B cuantizadas para CPU | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Corpus de ajuste muy reducido: 592 muestras multi-turno, lo que aumenta el riesgo de sobreajuste al dominio y de degradación fuera de los cuatro conjuntos de datos citados.
- La perplejidad de 2,47 está medida sobre el propio dominio objetivo, no sobre un conjunto de evaluación general; no es comparable con métricas de propósito general.
- Ventana de contexto efectiva de 4.096 tokens en el GGUF, muy inferior al contexto nativo de 262.144 tokens que declara el autor para el entrenamiento. Los documentos o conversaciones largas quedarán truncados.
- El weight folding es una aproximación: la actualización de bajo rango se colapsa en matrices y se pliega solo en las capas 1 y 15, por lo que parte de la información asociativa puede perderse respecto al modelo de memoria completo.
- Idiomas limitados a inglés e italiano; no hay evidencia de rendimiento en castellano.
- Especialización estrecha en versiones concretas del ecosistema frontend (Next.js 15.4, React 19, shadcn, Aceternity) y en patrones SRE; puede producir APIs obsoletas o inexistentes en otras versiones o stacks.
- Riesgo de alucinación en nombres de funciones, props y APIs de framework, agravado por la falta de benchmarks de fidelidad factual.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso, lo que limita su uso en pipelines de agentes.
- Licencia Apache 2.0, que permite uso comercial, pero se desconoce la licencia de los cuatro datasets de ajuste, lo que traslada una incertidumbre jurídica al reutilizarlos o redistribuir derivados.
- Todos los datos proceden de la model card del autor y no han sido verificados de forma independiente: 0 descargas y 0 valoraciones en el repositorio.
- No se ha localizado paper, informe técnico ni evaluación de terceros que respalde la arquitectura Engram ni el método de weight folding.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los resultados obtenidos trataban sobre las islas Malvinas y no guardan relación.

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/massimolauri/NomadCoder-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset citado `saidutta69/fable-5-premium`: https://huggingface.co/datasets/saidutta69/fable-5-premium
- Dataset citado `Slava32/next.js-15.4-with-reasoning`: https://huggingface.co/datasets/Slava32/next.js-15.4-with-reasoning
- Dataset citado `dimsavva/shadcn`: https://huggingface.co/datasets/dimsavva/shadcn
- Dataset citado `ParthDesai1719/aceternity_ui_comps`: https://huggingface.co/datasets/ParthDesai1719/aceternity_ui_comps
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- Paper, blog o repositorio del autor: no disponible en la información proporcionada.
- Resultados de búsqueda web relevantes: no disponible (la búsqueda no devolvió ninguna fuente relacionada con el modelo).
