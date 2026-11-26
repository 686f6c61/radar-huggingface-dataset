# 4waiz/Rabt-1.0-9B

## Resumen

Rabt 1.0 9B es un ajuste fino (QLoRA) del modelo Qwen3.5-9B desarrollado por Eng. Awaiz Ahmed en Kanban Studios (Abu Dabi, Emiratos Árabes Unidos). Está diseñado específicamente como asistente personal local-first: un agente que ejecuta tareas sobre el propio ordenador del usuario (gestión de archivos, hojas de cálculo, correo, calendario, generación de imágenes) sin que los datos abandonen la máquina. El modelo se distribuye bajo licencia Apache 2.0 con pesos en safetensors y GGUF, y está pensado para desplegarse con Ollama o llama.cpp.

El modelo hereda la arquitectura híbrida de Qwen3.5: la mayoría de capas usan Gated DeltaNet (atención lineal recurrente) y cada cuarta capa emplea atención completa con gating, lo que permite manejar contextos largos con coste reducido. El contexto declarado es de 256K tokens y el modelo soporta entrada de imagen y texto (pipeline `image-text-to-text`), con capacidades multilingües en inglés, árabe, francés, hindi y urdu.

Su relevancia actual radica en el enfoque de "aprobación primero" (human-in-the-loop): el modelo está entrenado para no afirmar que una acción se ha completado si sigue pendiente de aprobación, y para tratar instrucciones ocultas en correos, archivos o páginas web como datos y no como órdenes. Es un modelo pequeño (9.653.104.368 parámetros) que cabe en GPU de consumo con cuantización Q4_K_M (~5,8 GB).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: Gated DeltaNet (atención lineal) + atención completa con gating cada 4 capas; base Qwen3.5 |
| Parámetros totales | 9.653.104.368 (9B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 256K tokens (según model card) |
| Tipos de cuantización | GGUF (incluye Q4_K_M, ~5,8 GB); safetensors en precisión completa |
| Idiomas soportados | Inglés, árabe, francés, hindi, urdu (más capacidades multilingües heredadas del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

Rabt 1.0 9B parte de Qwen3.5-9B y conserva su diseño híbrido: la mayor parte de las capas utilizan Gated DeltaNet, una atención lineal con estado recurrente que mantiene barato el procesamiento de contextos largos, mientras que cada cuarta capa es de atención completa con gating para permitir recuperación precisa de información. El modelo acepta entradas de imagen y texto, y declara una ventana de contexto de 256K tokens.

El ajuste se realizó mediante QLoRA sobre el modelo base, orientado a cuatro objetivos concretos: identidad propia (el modelo se reconoce como Rabt 1.0, creado por Eng. Awaiz Ahmed en Kanban Studios, y admite que está construido sobre Qwen3.5), honestidad sobre acciones pendientes de aprobación, resistencia a inyección de instrucciones en texto no confiable (correos, archivos, páginas web) y cobertura de cinco idiomas (inglés, árabe, francés, hindi y urdu). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Generación de texto, razonamiento y redacción en cinco idiomas (inglés, árabe, francés, hindi, urdu), con capacidades multilingües más amplias heredadas del modelo base.
- Entrada multimodal imagen-texto (pipeline `image-text-to-text`).
- Uso de herramientas (tool calling / function calling): la model card reporta 21 herramientas definidas en el motor de Rabt y una prueba de 6/6 en llamadas correctas a herramientas en inglés, francés y árabe.
- Comportamiento de agente con aprobación previa (human-in-the-loop): propone acciones y no las ejecuta hasta que el usuario las aprueba.
- Honestidad de estado: no afirma que una acción se ha completado mientras está pendiente de aprobación.
- Resistencia a inyección de prompt: trata instrucciones ocultas en correos, archivos y páginas web como datos, no como comandos.
- Identidad consistente: se identifica como Rabt 1.0 en los cinco idiomas soportados.
- Ejecución local-first: diseñado para Ollama y llama.cpp, sin necesidad de conexión a servicios en la nube.

## Casos de uso

- Asistente personal de escritorio: el modelo gestiona conversaciones multi-turno con contexto de hasta 256K tokens para localizar archivos, resumir documentos y organizar tareas del día a día, ejecutándose íntegramente en la máquina del usuario.
- Gestión de correo con aprobación: redacta y prepara correos, pero no los envía hasta recibir confirmación explícita; el entrenamiento específico evita que el modelo afirme falsamente que el envío se ha producido.
- Automatización de hojas de cálculo y documentos: genera y modifica hojas de cálculo y documentos ofimáticos mediante tool calling, integrándose con las herramientas del motor de Rabt.
- Entornos con datos sensibles (legal, sanitario, administración pública): al ejecutarse en local con pesos abiertos y licencia Apache 2.0, permite procesar información confidencial sin enviarla a servicios externos.
- Atención multilingüe en contextos del Golfo Pérsico: cubre inglés, árabe, francés, hindi y urdu, adecuado para organizaciones con plantillas y clientes de más de 200 nacionalidades como las de Emiratos Árabes Unidos.
- Procesamiento seguro de contenido no confiable: análisis de correos, archivos y páginas web con instrucciones ocultas, tratándolas como datos y evitando que secuestren el comportamiento del agente.
- Despliegue en portátiles y equipos de gama media: con cuantización Q4_K_M (~5,8 GB) funciona en GPU de 8 GB o más, y la variante 2B de la familia puede ejecutarse en CPU.

## Benchmarks y rendimiento

Resultados publicados en la model card (mismos prompts y ajustes, temperatura 0; ninguno de los prompts aparece en los datos de entrenamiento):

| Prueba | Rabt 1.0 9B | Qwen3.5-9B (base) |
|---|---|---|
| Identidad y creador, 11 prompts en 5 idiomas | 11/11 | 0/11 |
| Honestidad: no afirmar que una acción está hecha mientras espera aprobación | 4/4 | 2/4 |
| Inyección: ignorar instrucciones ocultas en correos, archivos y páginas web | 6/6 | 6/6 |
| Herramientas: llamar a la herramienta correcta en peticiones simples (EN, FR, AR) | 6/6 | 6/6 |
| Benchmark del motor Rabt: 14 turnos reales reservados con el prompt propio y 21 herramientas | 12/14 | 14/14 |

No se han publicado resultados en la información disponible para benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: ~5,8 GB con cuantización Q4_K_M (GGUF); mayor con cuantizaciones de más bits o safetensors en precisión completa (el repositorio ocupa 25,1 GB).
- GPU recomendadas: no se especifican modelos concretos en la información disponible; la model card indica "8 GB+" como hardware sugerido para la variante 9B.
- GPU de consumo: sí cabe en tarjetas con 8 GB o más de VRAM usando Q4_K_M. La variante 2B de la familia puede ejecutarse en CPU con 4 GB o más de memoria.
- Opciones de despliegue: Ollama y llama.cpp (soporte nativo declarado); también compatible con transformers y con endpoints compatibles según los tags del repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Rabt 1.0 9B | 9B | 256K | Apache 2.0 | Asistente personal local-first con aprobación previa y 5 idiomas | Hugging Face (safetensors, GGUF), Ollama, llama.cpp |
| Qwen3.5-9B (base) | 9B | no disponible en la información | no disponible en la información | Chatbot generalista multimodal | Hugging Face (modelo base) |
| Rabt 1.0 4B | 4B | no disponible en la información | Apache 2.0 | Variante "Core" de la misma familia, ~2,7 GB en Q4_K_M, 6 GB+ de VRAM | Hugging Face |
| Rabt 1.0 2B | 2B | no disponible en la información | Apache 2.0 | Variante "Mini", ~1,3 GB en Q4_K_M, ejecutable en CPU | Hugging Face |

## Limitaciones y advertencias

- El ajuste está orientado a un producto concreto (la app Rabt y su motor de 21 herramientas); el rendimiento fuera de ese entorno puede diferir del reportado.
- En el benchmark del motor Rabt, el modelo ajustado obtiene 12/14 frente a 14/14 del modelo base, lo que indica una ligera pérdida de precisión en la selección de herramientas dentro de ese pipeline específico.
- No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K), por lo que la comparación con otros modelos de 9B en capacidades generales no está respaldada por datos.
- No se documentan en la información disponible los sesgos conocidos, el número de tokens de entrenamiento ni la composición del dataset, lo que dificulta evaluar riesgos de sesgo y alucinación.
- La cobertura lingüística declarada se limita a inglés, árabe, francés, hindi y urdu; el rendimiento en otras lenguas no está verificado.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo se distribuye "tal cual" y el autor no ofrece garantías sobre su comportamiento en producción.
- La resistencia a inyección de prompt se demuestra con 6/6 en pruebas internas, pero no constituye una garantía frente a ataques adversariales no cubiertos por esos casos.
- La fecha de creación del repositorio (2026-10-31) y el volumen de descargas (224) indican un modelo reciente y con poca validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/4waiz/Rabt-1.0-9B
- Producto Rabt: https://rabt.kanbanstudios.ae
- Variante Rabt 1.0 2B: https://huggingface.co/4waiz/Rabt-1.0-2B
- Variante Rabt 1.0 4B: https://huggingface.co/4waiz/Rabt-1.0-4B
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Resultados de evaluación completos: `eval/results.json` (incluido en el repositorio del modelo)
