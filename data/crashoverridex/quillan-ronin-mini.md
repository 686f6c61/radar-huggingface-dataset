# CrashOverrideX/Quillan-Ronin-Mini

## Resumen

Quillan-Ronin-Mini es un modelo de generación de texto de 0,5B parámetros publicado por el usuario CrashOverrideX en Hugging Face. Se presenta como un derivado afinado de Qwen/Qwen2.5-0.5B-Instruct, empaquetado en formato GGUF (cuantización Q4_K_M) y orientado a inferencia local en dispositivos de borde: móviles, Raspberry Pi 5, GPUs de gama de entrada como la GTX 1050 de 4 GB y Apple Silicon. El autor lo describe como parte de una "flota tripartita" junto a Quillan-Ronin (1,2B) y Quillan-Dragon (1B).

La propuesta técnica del autor se articula en torno a un método que denomina Weight-Space Programming (WSP), descrito como un injerto de parámetros en forma cerrada mediante un teorema de plegado de MoE, con preservación exacta de la forma tensorial (Diff = 0). No se aportan detalles verificables sobre el procedimiento, los datos de entrenamiento ni el proceso de alineación más allá de referencias a un "subespacio moral Bushido".

El modelo es relevante únicamente como pieza de experimentación en el ecosistema de modelos ultracompactos para edge computing: su tamaño (494 millones de parámetros, repo de 0,4 GB) y su licencia Apache-2.0 lo hacen trivial de desplegar, pero la ausencia de documentación reproducible, de datos de benchmarks independientes y de cualquier tracción en la comunidad (0 descargas, 0 likes en el momento de la consulta) obliga a tratar sus cifras declaradas con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen2.5-0.5B-Instruct); el autor menciona "closed-form MoE folding" sin especificar si el modelo final conserva estructura MoE |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (el autor afirma Diff = 0 respecto al base, sin confirmar estructura MoE en el modelo final) |
| Longitud de contexto | 32.768 tokens (según el Modelfile de Ollama proporcionado por el autor; no confirmado de forma independiente) |
| Tipos de cuantizacion | GGUF Q4_K_M (única publicada); el autor menciona FP16/INT4 en la descripción de benchmarks |
| Idiomas soportados | no disponible (heredados presumiblemente de Qwen2.5, sin confirmación del autor) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repo de 0,4 GB); safetensors disponible para los 494M parámetros según metadatos de HF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only con 24 capas y atención causal estándar. El autor describe el proceso de creación como "Weight-Space Programming (WSP)", que presenta mediante una fórmula de plegado de mezcla de expertos (W_folded = W_down + γ Σ W₁⁽ⁱ⁾ W₀⁽ⁱ⁾) y afirma que preserva exactamente la forma de los tensores, sin incrementar el número de parámetros. No se especifica cuántos tokens de entrenamiento se utilizaron, ni la composición del dataset, ni si hubo fases de SFT, RLHF o DPO. Tampoco se detalla el procedimiento de cuantización a Q4_K_M más allá del resultado final.

La única innovación declarada es el mencionado plegado en espacio de pesos y un "subespacio moral Bushido" que el autor describe como alineación ética basada en rectitud, coraje y honestidad, sin aportar métricas, metodología ni evaluación de dicho alineamiento. No hay información sobre técnicas de decodificación especulativa, atención lineal ni otras optimizaciones de inferencia más allá del uso de llama.cpp/Ollama.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de la base Qwen2.5-0.5B-Instruct.
- Razonamiento básico y resolución de problemas aritméticos sencillos (el ejemplo de la model card es una ecuación lineal).
- Tool calling / function calling: el autor declara un 100% de acierto en 2/2 pruebas de invocación de herramientas bajo el estándar Model Context Protocol (MCP) con esquema JSON estricto.
- Recuperación en contexto largo ("needle-in-haystack"): 100% declarado en 2/2 pruebas de recuperación de logs y puertos.
- Capacidades multilingües: no documentadas explícitamente; se asumen las del modelo base Qwen2.5, sin verificación por parte del autor.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Asistente conversacional en movil o dispositivo de borde: con ~380 MB de VRAM en Q4_K_M y 64,9 tok/s declarados, puede ejecutarse en un smartphone o Raspberry Pi 5 para respuestas locales sin conexión, reduciendo latencia y preservando privacidad.
- Automatización de tareas con tool calling en microservicios: el soporte declarado de MCP con esquemas JSON estrictos permite integrarlo como agente ligero que invoque APIs (consultas de estado, recuperación de logs, operaciones CRUD) en pipelines de bajo coste.
- Extracción de información en documentos largos: con 32K tokens de contexto configurados en Ollama, puede emplearse para localizar datos concretos (puertos, credenciales, claves de configuración) en logs o ficheros extensos.
- Prototipado rápido de agentes multi-paso: al ser un modelo de 0,5B con licencia Apache-2.0, sirve para validar arquitecturas de agentes y flujos de razonamiento antes de escalar a modelos mayores.
- Filtrado y clasificación de texto en el edge: tareas de etiquetado, moderación básica o enrutamiento de consultas en dispositivos con recursos limitados, donde un modelo mayor no es viable.
- Educación y demostraciones: ejemplo didáctico de cuantización GGUF, despliegue con Ollama y ajuste fino sobre Qwen2.5 para cursos o talleres, dado su reducido tamaño y su licencia permisiva.
- Generación de respuestas en asistentes embebidos (IoT, domótica): al caber en GPUs de 4 GB y en CPU, puede integrarse en dispositivos domésticos para interacción en lenguaje natural con latencia baja.

## Benchmarks y rendimiento

Los únicos datos disponibles son los declarados por el autor en la model card, medidos según él en una GTX 1050 de 4 GB con semilla held-out 42. No se han publicado resultados independientes ni reproducibles.

| Metrica | Resultado declarado | Contexto |
|---|---|---|
| Precisión global | 58,82% (10/17) | Batería empírica multi-dominio held-out |
| Tool calling (MCP) | 100,0% (2/2) | Síntesis de esquema JSON estricto y extracción de parámetros |
| Recuperación en contexto largo | 100,0% (2/2) | Needle-in-haystack de logs y puertos |
| Velocidad de inferencia | 64,9 tok/s (pico 80,8 tok/s) | CUDA FP16/INT4 nativo en hardware de consumo |
| Perplejidad held-out | 8,9888 | Corpus multi-tema cross-domain |
| Huella de VRAM | ~380 MB | Offload completo de 24 capas a GPU |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~380 MB en Q4_K_M con las 24 capas en GPU, según el autor.
- GPU recomendadas: GTX 1050 4 GB (hardware de referencia del autor), Apple Silicon, cualquier GPU con ≥2 GB de VRAM libre.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna e incluso en iGPU; también en CPU.
- Despliegue: llama.cpp / llama-cli, Ollama (Modelfile proporcionado), y presumiblemente cualquier runtime compatible con GGUF (no se documentan vLLM ni TGI).
- Latencia y throughput: 64,9 tok/s de media y 80,8 tok/s de pico declarados en GTX 1050; no hay mediciones independientes ni en otros hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Quillan-Ronin-Mini | 0,5B | 32K (declarado) | 58,82% precisión declarada; PPL 8,99; 64,9 tok/s | Apache-2.0 | GGUF en HF, 0 descargas |
| Qwen2.5-0.5B-Instruct (base) | 0,5B | 32K | Benchmarks públicos de Qwen; no comparable directamente con la batería del autor | Apache-2.0 | Ampliamente disponible, ecosistema maduro |
| Quillan-Ronin (Flagship) | 1,2B | no disponible | 76,47% precisión declarada; PPL 7,93; 47,0 tok/s | no disponible en la información | HF |
| Quillan-Dragon | 1B | no disponible | 70,59% precisión declarada; PPL 4,40; 41,3 tok/s | no disponible en la información | HF |

La comparación con el modelo base Qwen2.5-0.5B-Instruct es la más relevante: cualquier mejora atribuida al WSP debería contrastarse contra él con la misma batería de evaluación, algo que el autor no presenta de forma desagregada.

## Limitaciones y advertencias

- Las cifras de benchmarks (58,82% de precisión, 100% en tool calling y needle recall, 64,9 tok/s, PPL 8,99) proceden exclusivamente del autor, con muestras muy pequeñas (2/2 en varias pruebas) y sin replicación independiente; deben considerarse no verificadas.
- El método WSP y el "plegado MoE en forma cerrada" no están documentados de forma reproducible: no se especifican datos, hiperparámetros ni código de entrenamiento más allá de un enlace a GitHub.
- El "subespacio moral Bushido" no cuenta con evaluación ética publicada; no hay evidencia de que reduzca sesgos ni de que mejore la seguridad del modelo base.
- Riesgo de alucinación elevado por el tamaño (0,5B): inadecuado para tareas que requieran precisión factual alta sin verificación externa.
- Idiomas soportados no declarados; el comportamiento multilingüe puede degradarse respecto al base Qwen2.5 sin que el autor lo documente.
- Contexto de 32K configurado en el Modelfile, pero no verificado que el ajuste WSP preserve la ventana efectiva del modelo base.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación por terceros.
- Licencia Apache-2.0 permite uso comercial, pero al derivar de Qwen2.5 conviene verificar el cumplimiento de las condiciones del modelo base (también Apache-2.0).
- La fecha de creación del repo (2026-11-07) es posterior a la fecha habitual de publicación de Qwen2.5, lo que conviene tener en cuenta al evaluar la trazabilidad del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CrashOverrideX/Quillan-Ronin-Mini
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Modelo flagship de la flota: https://huggingface.co/CrashOverrideX/Quillan-Ronin
- Modelo Dragon de la flota: https://huggingface.co/CrashOverrideX/Quillan-Dragon
- Repositorio GitHub del autor: https://github.com/leeex1/Quillan-Ronin
- Perfil del autor en Hugging Face: https://huggingface.co/CrashOverrideX
