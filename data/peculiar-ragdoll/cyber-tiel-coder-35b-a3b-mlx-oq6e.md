# peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e

## Resumen

Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e es una cuantización en formato MLX de 6 bits del modelo abliterado Huihui-Ornith-1.5-35B-A3B-abliterated, publicada por el usuario peculiar-ragdoll. El modelo parte de la familia Ornith-1.5, una arquitectura Mixture of Experts (MoE) con 35.107.181.936 parámetros totales (35B) y aproximadamente 3B activos por token, según indica el sufijo A3B. Está afinado específicamente para coding agéntico y seguridad ofensiva, con las capas de rechazo eliminadas mediante la técnica de abliteration.

La relevancia de esta ficha radica en que combina tres elementos poco habituales en un mismo checkpoint: cuantización de alta fidelidad para Apple Silicon (oQ6e de oMLX, con calibración propia orientada a ciberseguridad), un modelo base abliterado sin rechazos y una plantilla de chat específica (Sharp) embebida en el checkpoint. El resultado es un modelo orientado a tareas de programación autónoma y CTF que, según el autor, resuelve problemas reales de SWE-bench-Live aproximadamente un 70% mejor que Ornith-1.5 y Qwen3.6-35B-A3B, a costa de sacrificar conocimiento general del mundo.

El repo ocupa 88,7 GB e incluye pesos en safetensors para la librería MLX. La licencia es MIT. El modelo solo declara soporte para inglés y chino. Es importante señalar que las cifras de benchmarks que publica el autor se midieron sobre la build GGUF en cuantización UD-Q4_K_M, no sobre este fichero MLX de 6 bits.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), familia Qwen3.5-MoE según tags (`qwen3_5_moe`, `qwen35moe`) |
| Parámetros totales | 35.107.181.936 (35B) |
| Parámetros activos | ~3B (sufijo A3B; valor exacto no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | oQ6e (6 bits, cuantizador oMLX con calibración imatrix y corpus propio); existe build hermano oQ4e de 4 bits (~22 GB) y una escalera GGUF de Q2 a Q8 |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX); existe build GGUF separada |

## Arquitectura y entrenamiento

El modelo es un transformer MoE de la familia Qwen3.5-MoE, con 35B parámetros totales y aproximadamente 3B activos por token, lo que permite un throughput alto en inferencia a costa de un footprint de memoria elevado. El checkpoint deriva de Huihui-Ornith-1.5-35B-A3B-abliterated, que a su vez es una versión sin censura (abliterated) de Ornith-1.5-35B-A3B. Sobre esa base, peculiar-ragdoll ha aplicado una requantización con el cuantizador oQ de oMLX a 6 bits, usando una matriz imatrix y un corpus de calibración ponderado hacia ciberseguridad, y ha embebido la plantilla de chat Sharp en el propio checkpoint.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base. La innovación técnica principal de esta publicación no está en el entrenamiento sino en la cadena de cuantización: el uso de imatrix con calibración de dominio y la integración de la plantilla de chat en los pesos, lo que elimina la necesidad de configurar el prompt manualmente en el cliente. El autor advierte que cambiar de cuantizador altera los resultados: entre builds MLX y GGUF ha medido diferencias de menos de un punto en MMLU-Pro y diferencias de dos dígitos porcentuales en el recuento de tokens.

## Capacidades

- Generación de texto y razonamiento general, con especialización en código y tareas de programación autónoma.
- Capacidad multimodal de entrada: el pipeline es `image-text-to-text` y los tags incluyen `vision`, por lo que acepta imágenes además de texto.
- Coding agéntico: resolución autónoma de issues y bugs en repositorios grandes, con edición de ficheros y ejecución de comandos en el bucle del agente.
- Seguridad ofensiva: resolución de retos CTF sin guía (15 de 43 tareas de Cybench según el autor) y trabajo en tareas de ciberseguridad sin rechazos.
- Sin censura: 0 rechazos en las 84 peticiones de HarmBench muestreadas por el autor en siete categorías.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible, aunque es esperable en la familia Qwen3.5-MoE.
- Razonamiento multi-paso y uso como agente: sí, es el caso de uso central declarado.
- Multilingüe limitado: solo inglés y chino declarados.
- Plantilla de chat Sharp embebida en el checkpoint.

## Casos de uso

- Resolución automática de issues en repositorios: el modelo puede recibir un issue de GitHub junto con el árbol del proyecto y generar un parche que pase los tests de regresión, que es exactamente lo que mide SWE-bench-Live. Su ratio de 3B parámetros activos lo hace viable en un bucle agéntico con muchas iteraciones.
- Auditoría de seguridad ofensiva en entornos controlados: con 0% de rechazos en HarmBench y 35% de resolución en Cybench, es adecuado para pentesting autorizado, análisis de vulnerabilidades y generación de exploits en laboratorios aislados.
- Asistente de coding en local sobre Apple Silicon: al estar en formato MLX a 6 bits (~30 GB), se puede ejecutar en un Mac con memoria unificada suficiente sin depender de la nube, lo que es útil para código propietario que no puede salir de la máquina.
- Automatización de pipelines de CI/CD: integrado como agente que lee fallos de build, propone correcciones y abre pull requests, con la ventaja de que no rechaza tareas de análisis de código malicioso o de explotación de fallos.
- Formación y CTF: entrenamiento de equipos de seguridad con retos de captura de bandera, donde el modelo actúa como compañero que razona sobre binarios, scripts y configuraciones sin negarse a abordar técnicas ofensivas.
- Análisis de imágenes técnicas: gracias a la entrada multimodal, puede interpretar capturas de pantalla de terminales, diagramas de arquitectura o resultados de herramientas y convertirlos en código o en pasos de explotación.
- Investigación sobre alineación y abliteration: sirve como objeto de estudio para medir cómo la eliminación de rechazos afecta al comportamiento en dominios sensibles, con la advertencia de que requiere sandboxing estricto.

## Benchmarks y rendimiento

El autor publica resultados medidos sobre la build GGUF en cuantización UD-Q4_K_M, no sobre este fichero MLX de 6 bits. Se reproducen como evidencia sobre el modelo, no sobre esta cuantización concreta.

| Benchmark | Resultado | Notas |
|---|---|---|
| SWE-bench-Live | ~70% más problemas resueltos que Ornith-1.5 y Qwen3.6-35B-A3B | Medido en GGUF UD-Q4_K_M; mejora ~7x mayor que el salto generacional Qwen3.5 a Qwen3.6 |
| Cybench (unguided) | 15/43 flags (35%) | Sin pistas ni juez |
| HarmBench | 0 rechazos en 84 peticiones | Siete categorías, 12 muestras por categoría |
| MMLU-Pro | Igual que TielCoder | Pérdida de conocimiento general atribuida a la especialización, no a la abliteration |
| Velocidad de resolución | 3-4x más rápido que un modelo denso de 3.8-27B | En tareas de coding agéntico |

No se han publicado resultados de benchmarks sobre este fichero MLX oQ6e en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~30 GB para los pesos en 6 bits, más overhead de contexto y caché KV; el repo completo ocupa 88,7 GB.
- Orientado a Apple Silicon con MLX: requiere un Mac con memoria unificada de al menos 32 GB, recomendable 64 GB o más para contextos largos.
- GPU NVIDIA: este fichero concreto no es directamente ejecutable en CUDA; para esas plataformas hay que usar la build GGUF del mismo autor.
- Cabe en consumer hardware de Apple: Mac Studio y MacBook Pro con M-series Max/Ultra de 64 GB o más.
- Opciones de despliegue: `mlx-lm` y el ecosistema MLX (librería `mlx`); para GGUF, llama.cpp, Ollama o LM Studio.
- Latencia y throughput: no disponibles de forma numérica; el autor afirma que resuelve tareas de coding agéntico 3-4x más rápido que un denso de 3.8-27B.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e | 35B totales, ~3B activos | no disponible | Coding agéntico, seguridad ofensiva, sin censura | MIT | MLX 6 bits |
| Tiel-Coder-35B-A3B | 35B totales, ~3B activos | no disponible | Coding agéntico, versión censurada | MIT (según repo del autor) | MLX oQ4e y GGUF |
| Ornith-1.5-35B-A3B | 35B totales, ~3B activos | no disponible | Uso general, con rechazos | no disponible | GGUF y otros |
| Qwen3.6-35B-A3B | 35B totales, ~3B activos | no disponible | Uso general y coding | no disponible | múltiples formatos |

## Limitaciones y advertencias

- Modelo abliterado: elimina los rechazos por diseño y puede generar contenido dañino, ilegal o peligroso. El autor exige responsabilidad total del usuario y sandboxing estricto.
- Riesgo de alucinación elevado en conocimiento general: el propio autor reconoce que el modelo sacrifica conocimiento del mundo por coding y velocidad, y que su MMLU-Pro es bajo.
- Los benchmarks publicados no corresponden a este fichero: se midieron en GGUF UD-Q4_K_M, con otro cuantizador, y el autor advierte que los resultados no son transferibles directamente.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está evaluado y probablemente sea deficiente.
- Longitud de contexto no documentada; planificar despliegues con contexto largo sin garantías.
- Licencia MIT permite uso comercial, pero la responsabilidad legal por el contenido generado recae íntegramente en el usuario.
- No apto para producción sin filtros externos, monitorización y aislamiento de red, especialmente en aplicaciones expuestas a usuarios finales.
- El tamaño del repo (88,7 GB) y la memoria requerida (~30 GB) limitan su despliegue a equipos de gama alta.

## Enlaces

- Hugging Face: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
- Modelo Ornith-1.5 original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Build GGUF del mismo modelo: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF
- Build MLX oQ4e: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ4e
- Versión censurada TielCoder: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ4e
- Plantillas de chat Sharp: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Modelo de conocimiento general del mismo autor: https://huggingface.co/peculiar-ragdoll/Nail-Qwen3.6-35B-A3B-GGUF
