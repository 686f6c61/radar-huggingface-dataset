# memgui-rl/MemGUI-8B-RL

## Resumen

MemGUI-8B-RL es un modelo vision-lenguaje de 8.767 millones de parámetros (8,77 B) especializado en actuar como agente autónomo sobre interfaces gráficas de dispositivos móviles. Lo publica el proyecto anónimo MemGUI-RL y parte de Qwen3-VL-8B-Instruct, sobre el que se aplicó primero un ajuste supervisado (MemGUI-8B-SFT, entrenado con el conjunto MemGUI-3K) y después un post-entrenamiento con FARPO (Folding-Aware Reward-Decoupled Policy Optimization), el algoritmo propuesto en el artículo asociado. El resultado es un checkpoint en formato `Qwen3VLForConditionalGeneration` que razona sobre capturas de pantalla y emite acciones de interfaz.

La innovación central es la interfaz ConAct (Context-as-Action): cada respuesta del modelo incluye una directiva de plegado (*folding*) de su propio historial, una operación de memoria opcional y la siguiente acción GUI. Esto convierte la gestión de contexto largo en una decisión aprendida por el propio agente, en lugar de una truncación fija, algo crítico en tareas de horizonte largo donde el historial de capturas y acciones crece rápidamente. FARPO entrena esta política con un ratio span-a-paso de 9 y desacopla las recompensas por componente, lo que permite optimizar de forma estable una política que decide simultáneamente qué recordar y qué hacer.

Es relevante ahora porque los agentes móviles son uno de los dominios donde la ventana de contexto efectiva y el coste por paso limitan el despliegue real. Un modelo de 8,7 B con pesos en bf16 (~17,5 GB) que mejora claramente a su versión SFT en MemGUI-Bench y en el conjunto fuera de distribución MobileWorld ofrece un punto de partida práctico y con licencia Apache 2.0 para investigación en automatización de dispositivos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (Qwen3-VL), clase `Qwen3VLForConditionalGeneration` |
| Parámetros totales | 8.767.123.696 (8,77 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bf16); al ser arquitectura Qwen3-VL es compatible con cuantizaciones estándar de la familia, sin confirmación del autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, ~17,5 GB de repositorio) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de la familia Qwen3-VL: un codificador visual acoplado a un decodificador de lenguaje de ~8,7 B de parámetros que recibe imágenes (capturas de pantalla) y texto (historial de interacción, prompt de sistema ConAct) y genera texto estructurado como acción. El pipeline declarado es `image-text-to-text` y el checkpoint carga directamente con `AutoProcessor` y `Qwen3VLForConditionalGeneration` de Transformers.

El entrenamiento tiene dos fases documentadas. Primero, MemGUI-8B-SFT aplica ajuste supervisado sobre Qwen3-VL-8B-Instruct con el dataset MemGUI-3K. Después, MemGUI-8B-RL se post-entrena durante 100 pasos de optimizador con FARPO, un algoritmo de optimización de política con recompensas desacopladas por componente y un ratio span-a-paso rho = 9. La política resultante aprende a emitir tres elementos por turno: una directiva de plegado de su propio historial, una operación de memoria opcional y la acción GUI siguiente. No se detalla en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas adicionales de RLHF o DPO más allá de FARPO.

## Capacidades

- Percepción visual de capturas de pantalla de dispositivos móviles y razonamiento sobre elementos de interfaz.
- Generación de acciones GUI ejecutables (toques, deslizamientos, entrada de texto) dentro del runtime MemGUI-Agent.
- Interfaz ConAct: emisión conjunta de directiva de plegado de historial, operación de memoria y acción siguiente.
- Gestión autónoma de contexto largo mediante plegado aprendido del historial de interacción.
- Memoria de agente explícita: el modelo puede escribir y consultar operaciones de memoria entre pasos.
- Razonamiento multi-paso en tareas de horizonte largo (navegación por apps, formularios, flujos encadenados).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas no están declarados.
- Capacidades de audio: no disponible.

## Casos de uso

- Automatización de pruebas de aceptación en apps móviles: el modelo puede recorrer flujos completos sobre emuladores, emitiendo acciones a partir de capturas, y su plegado de historial permite mantener sesiones de decenas de pasos sin desbordar el contexto.
- Agentes de atención al cliente dentro de apps: gestionar conversaciones y navegación multi-turno en la interfaz de la aplicación (abrir pedidos, cambiar ajustes, rellenar formularios) manteniendo memoria de lo ya hecho.
- Asistencia a usuarios con accesibilidad: interpretar la pantalla y ejecutar secuencias de acciones dictadas en lenguaje natural, usando la memoria del agente para recordar preferencias dentro de la sesión.
- RPA móvil de procesos repetitivos: sustituir scripts frágiles basados en coordenadas por un agente que razona sobre la semántica visual de la pantalla, con la ventaja de adaptarse a cambios de layout.
- Investigación en aprendizaje por refuerzo para agentes: el checkpoint sirve como política inicial o de referencia para experimentos con FARPO y variantes, dado que el código de entrenamiento y los scripts de lanzamiento son públicos.
- Evaluación comparativa de agentes GUI: al publicarse los logs de evaluación y los conjuntos MemGUI-Bench y MobileWorld, el modelo es un baseline reproducible para medir Pass@1, Pass@3, IRR y tasa de éxito OOD.
- Extracción de información estructurada desde pantallas: recorrer una app y consolidar datos visibles en un registro, apoyándose en las operaciones de memoria para no repetir lecturas.

## Benchmarks y rendimiento

| Benchmark | MemGUI-8B-SFT | MemGUI-8B-RL |
|---|---|---|
| MemGUI-Bench Pass@1 (128 tareas) | 23,4 | 30,5 |
| MemGUI-Bench Pass@3 (128 tareas) | 35,9 | 48,4 |
| MemGUI-Bench IRR (128 tareas) | 30,2 | 39,0 |
| MobileWorld GUI-only, tasa de éxito (117 tareas, OOD) | 17,9 | 19,7 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de propósito general para este checkpoint.

## Requisitos de hardware

- VRAM estimada en bf16: ~17,5 GB de pesos más overhead de activaciones y caché KV; en la práctica se recomienda una GPU de 24 GB o superior para inferencia interactiva con imágenes.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; GPUs de 16 GB solo con cuantización a 8 bits o inferior.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16 con margen ajustado, y en RTX 4080/3090 (16-24 GB) recurriendo a cuantización.
- Opciones de despliegue: Transformers (`Qwen3VLForConditionalGeneration` + `AutoProcessor`) es la vía documentada; al ser una arquitectura Qwen3-VL, es compatible con servidores de inferencia de la familia (vLLM, TGI) siempre que soporten el modelo visual, extremo no confirmado por el autor. llama.cpp/Ollama requerirían conversión a GGUF y soporte de la torre visual, no documentado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MemGUI-8B-RL | 8,77 B | no disponible | Agente GUI móvil con ConAct y FARPO | Apache 2.0 | Hugging Face |
| MemGUI-8B-SFT | no disponible (misma base Qwen3-VL-8B) | no disponible | Agente GUI móvil con ajuste supervisado | no disponible | Hugging Face (repo del autor) |
| Qwen3-VL-8B-Instruct | ~8 B (familia Qwen3-VL) | no disponible | Vision-lenguaje generalista | no disponible en esta ficha | Hugging Face |

No se dispone de datos de benchmarks de terceros comparables en la información proporcionada para establecer una comparación cuantitativa con otros agentes GUI móviles.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al heredar la base Qwen3-VL, puede arrastrar sesgos del corpus original, no evaluados en esta ficha.
- Riesgo de alucinación: relevante en un agente que actúa sobre interfaces; una acción mal inferida puede producir pulsaciones erróneas o entrada de datos incorrecta, por lo que conviene sandboxing y confirmación en operaciones destructivas.
- Tasa de éxito absoluta moderada: 30,5 de Pass@1 y 19,7 de éxito OOD en MobileWorld indican que el modelo falla en la mayoría de tareas fuera de distribución; no es apto para automatización no supervisada en producción sin salvaguardas.
- Dependencia de runtime: el modelo asume el prompt de sistema ConAct y el runtime MemGUI-Agent; usarlo fuera de ese contrato degrada el comportamiento esperado.
- Idiomas no declarados: no hay garantía de calidad fuera del idioma o idiomas de entrenamiento, no especificados.
- Longitud de contexto no publicada: aunque el plegado de historial mitiga el problema, no se documenta la ventana máxima efectiva.
- Licencia Apache 2.0: permite uso comercial, pero el modelo se publica como *anonymous release* vinculado a un artículo en revisión; conviene verificar la versión final del repositorio y sus términos antes de integrarlo.
- Estado del arte cambiante: con 19 descargas y sin likes, es un checkpoint de investigación reciente, sin validación comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/memgui-rl/MemGUI-8B-RL
- Modelo base (SFT): https://huggingface.co/memgui-agent-anonymous/MemGUI-8B-SFT
- Página del proyecto: https://memgui-rl-anonymous.github.io/
- Código de entrenamiento y scripts: https://github.com/memgui-rl-anonymous/MemGUI-RL
- Dataset de entrenamiento (MemGUI-3K-Verl): https://huggingface.co/datasets/memgui-rl/MemGUI-3K-Verl
- Logs de evaluación: https://huggingface.co/datasets/memgui-rl/MemGUI-RL-Eval
