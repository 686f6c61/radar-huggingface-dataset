# prithivMLmods/Player-1-9B-GGUF

## Resumen

Player-1-9B es un modelo abierto de visión-lenguaje-acción (VLA) orientado al control generalista de videojuegos. Lo desarrolla el equipo Tencent ARC y se describe en el artículo "Player-1: Learning to Play from Synthetic Experience" (arXiv:2610.20584). El modelo recibe capturas de pantalla del juego, genera razonamiento paso a paso y emite acciones de teclado y ratón como llamadas a herramientas: movimiento relativo o absoluto del ratón, clics y pulsaciones de teclas, cada una mantenida durante 200 ms por paso.

La ficha que nos ocupa es la cuantización GGUF publicada por prithivMLmods sobre los pesos originales de yyyang/Player-1-9B. El modelo base se construye sobre Qwen3.5-9B, con 8.953.803.264 parámetros reales según safetensors (la model card habla de 9,6B), y una ventana de contexto de 16.384 tokens con hasta cinco imágenes por prompt. Su relevancia actual radica en que aborda el problema del control de agentes en entornos visuales dinámicos mediante aprendizaje por refuerzo con recompensas verificables, un enfoque que va más allá del simple ajuste supervisado.

El entrenamiento combina una primera fase de SFT sobre Player-1-Data (6.044 trayectorias de 172 juegos, con muestreo equilibrado de acciones) y una segunda fase de PPO en Player-1-Gym, con 16 entornos sintéticos 2D y 3D. Los pesos se publican bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en pipelines de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje-acción) basado en Qwen3.5-9B |
| Parametros totales | 8.953.803.264 (8,95B); la model card indica 9,6B |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | BF16, Q3_K_L, Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K; proyector multimodal mmproj-bf16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado con llama.cpp); el modelo base en safetensors |

## Arquitectura y entrenamiento

Player-1-9B es un transformer multimodal que combina un codificador visual con un LLM base Qwen3.5-9B. La salida no es texto libre, sino llamadas a herramientas que representan acciones de control: movimiento del ratón (relativo o absoluto), clics y pulsaciones de teclas, cada una con una duración fija de 200 ms por paso. El modelo incorpora un modo de razonamiento paso a paso antes de emitir la acción, y se sirve con vLLM usando una plantilla de chat personalizada, selección automática de herramientas y el parser de razonamiento de Qwen3.

El entrenamiento se estructura en dos etapas. La primera es un ajuste supervisado (SFT) sobre Player-1-Data, un conjunto de 6.044 trayectorias procedentes de 172 juegos con muestreo equilibrado de acciones para evitar sesgos hacia acciones frecuentes. La segunda etapa aplica PPO (reinforcement learning) en Player-1-Gym, un entorno con 16 escenarios sintéticos 2D y 3D que proporcionan recompensas verificables basadas en el estado del juego. Esta combinación de SFT sobre datos reales y RL sobre entornos sintéticos con recompensas comprobables es la innovación técnica principal del trabajo. No se emplea decodificación especulativa (MTP: no).

## Capacidades

- Generación de razonamiento paso a paso antes de emitir acciones, con modo de pensamiento integrado.
- Comprensión de imágenes: procesa capturas de pantalla de juegos y hasta cinco imágenes por prompt.
- Emisión de acciones de control como llamadas a herramientas: movimiento de ratón relativo/absoluto, clics y pulsaciones de teclas con retención de 200 ms.
- Soporte de tool calling / function calling nativo, con selección automática de herramienta.
- Comportamiento de agente multi-paso en entornos interactivos.
- Capacidades multilingües limitadas al inglés.
- Integración con vLLM y llama.cpp para despliegue.

## Casos de uso

- Agentes de juego automatizados: el modelo puede controlar personajes en juegos 2D y 3D emitiendo acciones de teclado y ratón a partir de capturas de pantalla, lo que permite construir bots de prueba o asistentes de gameplay.
- Investigación en aprendizaje por refuerzo: sirve como política base o modelo de referencia en entornos tipo Player-1-Gym, MineDojo o ViZDoom para experimentos de RL con recompensas verificables.
- Evaluación de agentes visuales: su formato de salida estructurado (tool calls con duración fija) facilita la comparación objetiva entre políticas en suites de benchmark.
- Automatización de pruebas de interfaz gráfica: las acciones de ratón y teclado con temporización controlada permiten reproducir secuencias de interacción en aplicaciones de escritorio.
- Generación de datos sintéticos de gameplay: el modelo puede generar trayectorias etiquetadas que alimenten posteriores entrenamientos o análisis.
- Docencia y demostraciones de VLA: su tamaño de 9B y su disponibilidad en GGUF permiten desplegarlo en laboratorios con hardware moderado para ilustrar el funcionamiento de modelos de acción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona las suites de evaluación empleadas (Player-1-Gym con 16 entornos, MineDojo-300, ViZDoom-10 y GameWorld con 170 tareas en 34 juegos), pero no incluye puntuaciones; estas solo aparecen en el artículo y en la página del proyecto.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 18 GB en BF16 (archivo de 17,9 GB) y entre 5 y 8 GB en cuantizaciones Q4/Q5/Q6, más el proyector multimodal de 922 MB.
- GPU recomendadas: A100 40/80 GB o H100 para BF16 con contexto completo; RTX 4090 (24 GB) para BF16 ajustado o Q6_K; RTX 3090/4080 para Q4_K_M y Q5_K_M.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB o superiores con cuantizaciones Q3/Q4; en 8 GB solo con Q3_K_M o inferior.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, vLLM (con plantilla de chat personalizada y parser de razonamiento de Qwen3), TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Player-1-9B | 8,95B | 16.384 | VLA para control de juegos | Apache 2.0 | GGUF y safetensors |
| Qwen3.5-9B (base) | ~9B | no disponible | LLM multimodal generalista | no disponible | safetensors |
| Modelos VLA de juego (p. ej. variantes de MineDojo) | no disponible | no disponible | Agentes específicos de dominio | variable | variable |

La comparación con alternativas concretas de la misma categoría (VLA para juegos) no está disponible en la información proporcionada; las suites de evaluación citadas (MineDojo, ViZDoom, GameWorld) permitirían una comparación directa, pero sus resultados no se incluyen en la model card.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se han documentado capacidades multilingües.
- Riesgo de alucinación en el razonamiento previo a la acción, especialmente en entornos visuales no vistos durante el entrenamiento.
- El rendimiento fuera de los 16 entornos de Player-1-Gym y los juegos de entrenamiento no está validado en la información disponible.
- La ventana de contexto de 16.384 tokens limita la historia de interacción y el número de imágenes por prompt (máximo cinco).
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento pueden tener restricciones adicionales no detalladas.
- Las acciones tienen una duración fija de 200 ms por paso, lo que puede no adaptarse a juegos que requieren temporización más fina.
- No se han publicado métricas de sesgo ni evaluaciones de seguridad en la información disponible.

## Enlaces

- [Hugging Face: prithivMLmods/Player-1-9B-GGUF](https://huggingface.co/prithivMLmods/Player-1-9B-GGUF)
- [Modelo base: yyyang/Player-1-9B](https://huggingface.co/yyyang/Player-1-9B)
- [Artículo: Player-1: Learning to Play from Synthetic Experience (arXiv:2610.20584)](https://arxiv.org/abs/2610.20584)
- [Repositorio GitHub de Tencent ARC](https://github.com/TencentARC)
- [llama.cpp](https://github.com/ggml-org/llama.cpp)
