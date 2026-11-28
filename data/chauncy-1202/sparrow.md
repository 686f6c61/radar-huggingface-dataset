# Chauncy-1202/Sparrow

## Resumen

Sparrow-0.2B-A0.07B es un modelo de lenguaje de arquitectura híbrida desarrollado por el usuario Chauncy-1202 a partir de una modificación del proyecto MiniMind. Con aproximadamente 0,2 mil millones de parámetros totales y unos 0,07 mil millones activos por paso forward, combina capas de atención lineal con atención completa, un esquema de Mixture of Experts latente y conexiones residuales cruzadas con compuerta. El modelo fue entrenado desde inicialización aleatoria, sin heredar los pesos preentrenados de MiniMind, y ha completado las fases de preentrenamiento y ajuste supervisado (SFT).

La relevancia de este modelo no reside en su rendimiento, sino en su valor como banco de pruebas arquitectónico. Su autor lo describe explícitamente como no apto para uso real: "un caballero con conmoción cerebral" que puede sonar educado y presentar un formato plausible, pero cuya precisión factual, coherencia lógica y capacidad de seguir instrucciones son extremadamente limitadas. El repositorio está pensado para experimentación con arquitecturas, validación de pipelines de entrenamiento, análisis de casos de fallo generativo y aprendizaje.

Con un tamaño de repositorio de 0,5 GB, pesos en float16 y una ventana de contexto configurada de 32768 tokens (no validada empíricamente), Sparrow se posiciona como un experimento educativo de arquitectura MoE de pequeño tamaño, no como un modelo desplegable en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido basado en `MiniMindForCausalLM`, con atención lineal `gated_delta` intercalada y atención completa, Latent MoE y residuos cruzados con compuerta |
| Parametros totales | ~0,2B |
| Parametros activos | ~0,07B (MoE con Top-1 sobre 12 expertos enrutados + 1 compartido) |
| Longitud de contexto | 32768 tokens (valor de configuración, no validado) |
| Tipos de cuantizacion | no disponible (pesos publicados en float16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (vocabulario de 6400 tokens, capacidad multilingüe muy limitada según el autor) |
| Licencia | Apache License 2.0 (código original y pesos; componentes derivados de MiniMind conservan su licencia) |
| Formato de pesos | safetensors (formato estándar de Hugging Face, float16) |
| Capas | 14, patrón de disposición `LDADLDADLDADLD` |
| Dimensión oculta | 512 |
| Cabezas de atención | 8 / 2 (query / KV) |
| Ventana KV | 512 |
| Dimensión FFN de expertos | 1664 |
| Vocabulario | 6400 tokens |
| Código personalizado | Sí, requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

Sparrow emplea una arquitectura híbrida que alterna capas de atención lineal con mecanismo `gated_delta` y capas de atención completa, siguiendo el patrón `LDADLDADLDADLD` sobre 14 capas. La componente MoE utiliza 12 expertos enrutados más 1 experto compartido con enrutamiento Top-1, en una variante denominada Latent MoE, con dimensión FFN de 1664 por experto. Las conexiones residuales emplean un esquema `gated_crosslayer`, que conecta estados entre capas mediante compuertas aprendidas. La dimensión oculta es de 512, con 8 cabezas de consulta y 2 de clave/valor, y una ventana KV de 512.

El entrenamiento partió de inicialización aleatoria, sin reutilizar los pesos de MiniMind (solo se reutiliza su base de código). Se completaron dos fases: preentrenamiento autorregresivo de modelado de lenguaje e instrucción supervisada (SFT) para habilitar la interacción con plantilla de chat. La model card no proporciona el número de tokens de entrenamiento, la composición del corpus, los hiperparámetros, el cómputo empleado ni detalles sobre el proceso de SFT. No se aplicaron técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto autorregresiva básica con plantilla de chat conversacional.
- Interacción multi-turno mediante `apply_chat_template`, con capacidad limitada de seguir el formato de diálogo.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe muy limitada: el vocabulario de 6400 tokens restringe severamente la cobertura de idiomas.
- No dispone de visión, audio ni otras modalidades.
- No dispone de modo "thinking" ni razonamiento extendido.
- Capacidad de instrucción muy débil: el autor advierte que la SFT completada no certifica capacidad real de seguir instrucciones.

## Casos de uso

- Investigación de arquitecturas MoE de pequeño tamaño: permite estudiar el comportamiento de un esquema Latent MoE con Top-1 y experto compartido en un modelo de 0,2B, útil para comparar curvas de pérdida y dinámica de enrutamiento con variantes densas equivalentes.
- Estudio de atención lineal híbrida: el patrón `LDADLDADLDADLD` con `gated_delta` sirve como caso de prueba para analizar cómo se comportan capas lineales intercaladas frente a atención completa en contextos cortos.
- Validación de pipelines de entrenamiento: al ser un modelo entrenado desde cero con código propio, funciona como base de depuración para verificar flujos de preentrenamiento, SFT y carga con `trust_remote_code=True`.
- Análisis de fallos generativos: su propensión documentada a alucinaciones y rupturas lógicas lo convierte en un corpus de ejemplos para estudiar modos de fallo en modelos pequeños.
- Punto de partida para continuación de entrenamiento o destilación: el autor lo propone como base sobre la que seguir entrenando o destilar desde modelos mayores.
- Experimentación con conexiones residuales cruzadas: el esquema `gated_crosslayer` puede evaluarse empíricamente en tareas sintéticas de modelado de lenguaje para medir su efecto frente a residuos convencionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no existen puntuaciones de referencia públicas y que la evaluación debe separar la plausibilidad del formato de la capacidad real de comprender y completar tareas.

## Requisitos de hardware

- VRAM estimada para inferencia en float16: en torno a 0,4-0,5 GB solo para pesos, más overhead de activaciones y caché KV; cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU moderna con soporte de float16, incluidas RTX 3060, RTX 4060, RTX 4090, A100 y H100; el modelo es trivial para todas ellas.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU dedicada e incluso en CPU para inferencia puntual.
- Opciones de despliegue: carga vía `transformers` con `trust_remote_code=True`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y el código personalizado puede requerir adaptaciones para motores de inferencia optimizados.
- Latencia y throughput estimados: no disponibles; por el tamaño, la latencia sería muy baja en GPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Sparrow-0.2B-A0.07B | ~0,2B totales / ~0,07B activos | 32768 (config, no validado) | Apache 2.0 | Hugging Face | Experimental, sin benchmarks, no apto para producción |
| MiniMind (modelos base) | ~0,02B-0,1B según variante | no disponible | no disponible | GitHub / Hugging Face | Proyecto educativo del que deriva el código; sí hereda pesos preentrenados en sus variantes |
| Modelos densos pequeños tipo Qwen2.5-0.5B | ~0,5B | 32768 | Apache 2.0 | Hugging Face | Modelo entrenado a escala con benchmarks públicos y uso práctico real |
| SmolLM2-135M | ~0,135B | 8192 | Apache 2.0 | Hugging Face | Entrenado con corpus documentado y evaluaciones publicadas |

La comparación debe interpretarse con cautela: Sparrow no compite en rendimiento con estos modelos, ya que carece de benchmarks y de entrenamiento a escala; su interés es exclusivamente arquitectónico y educativo.

## Limitaciones y advertencias

- El propio autor declara que el modelo no tiene utilidad práctica y no debe usarse en producción, escenarios que requieran precisión factual ni decisiones serias.
- Riesgo muy elevado de alucinación, incoherencia lógica y respuestas que no abordan la instrucción.
- Capacidad débil de conocimiento factual, matemáticas, código e instrucción.
- Vocabulario de solo 6400 tokens, lo que limita gravemente la cobertura multilingüe y el manejo de textos largos.
- La ventana de 32768 tokens es un valor de configuración no validado; el rendimiento en contextos largos es desconocido.
- Sin alineación de seguridad: no se aplicaron RLHF ni DPO, por lo que puede generar contenido sesgado o inapropiado.
- Sin benchmarks públicos: cualquier evaluación debe realizarse por cuenta del usuario.
- Licencia Apache 2.0 para el código y pesos originales, con obligación de conservar avisos de copyright y atribución a MiniMind; los componentes derivados mantienen sus licencias originales.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; conviene auditar el código antes de cargarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Chauncy-1202/Sparrow
- Proyecto MiniMind (base del código): https://github.com/jingyaogong/minimind
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
