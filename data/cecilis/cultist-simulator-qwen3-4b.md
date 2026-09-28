# Cecilis/cultist-simulator-qwen3-4b

## Resumen

cultist-simulator-qwen3-4b es un ajuste fino del modelo denso Qwen/Qwen3-4B (4.022.468.096 parámetros) realizado por el usuario Cecilis para reproducir el registro literario del videojuego *Cultist Simulator*: una prosa críptica, contenida, libresca y con connotaciones siniestras. El modelo no pretende ser un asistente generalista, sino un generador especializado de texto de juego: descripciones de cartas, narrativa de acciones, textos de desenlace, creación temática por principios (Luz, Forja, Filo, Invierno, Corazón, Grial, Polilla, Golpe, Historias Secretas) y traducción chino-inglés con preservación de marcado `<b>`/`<i>`.

El ajuste se hizo con LoRA (r=16, alpha=32) sobre todas las proyecciones q/k/v/o/gate/up/down, en precisión bf16 (no QLoRA), con LLaMA-Factory 0.9.4, 26.875 muestras de entrenamiento, 3 épocas (5.040 pasos) y una longitud de truncado de 896 tokens. La pérdida de evaluación final fue de 1,949, frente a 2,406 de la variante de 0,6B de la misma familia, lo que indica una mejora clara en la fidelidad de formato y estilo al aumentar el tamaño.

Su relevancia práctica es doble: por un lado, es un ejemplo reproducible y documentado de adaptación de un modelo base Apache-2.0 a un dominio creativo muy concreto con un único GPU de 16 GB en 6 horas; por otro, sirve como generador de material para escritura de fans, campañas de rol y borradores de módulos. El repositorio publica tanto el modelo fusionado (7,51 GB) como el adaptador LoRA independiente (126,1 MB), además de un `Modelfile` para Ollama.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen3-4B), ajustado con LoRA |
| Parametros totales | 4.022.468.096 (4B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el entrenamiento uso una longitud de truncado (cutoff_len) de 896 tokens |
| Tipos de cuantizacion | no disponible; los pesos publicados estan en bf16 (fusionado) y en adaptador LoRA bf16 |
| Idiomas soportados | chino simplificado (zh) e ingles (en) |
| Licencia | apache-2.0 (pesos derivados de Qwen/Qwen3-4B) |
| Formato de pesos | safetensors: modelo fusionado en la raiz del repositorio (7,51 GB) y adaptador LoRA en `lora/` (126,1 MB); incluye `Modelfile` de LLaMA-Factory para Ollama |

## Arquitectura y entrenamiento

La base es Qwen3-4B, un transformer decoder-only denso de 4B parámetros con plantilla de chat `qwen3_nothink` (el ajuste se hizo con el modo de pensamiento desactivado). Sobre él se aplicó un LoRA de rango 16 y alpha 32 sobre las proyecciones q/k/v/o y gate/up/down, es decir, cubriendo atención y MLP. El entrenamiento se ejecutó en bf16 con checkpointing de gradientes, optimizador con learning rate 1e-4 y scheduler coseno con 10 % de warmup, batch efectivo de 16 (per_device 1 × acumulación 16), 3 épocas y 5.040 pasos, durante 6 horas en una única GPU de 16 GB de VRAM.

El dataset consta de 26.875 muestras de entrenamiento y 779 de validación, divididas de forma estable por identificador de entidad. El corpus se extrajo íntegramente del juego instalado localmente, sin fuentes en línea, y se expandió a seis tareas: traducción zh↔en con reglas explícitas sobre la conservación o eliminación del marcado `<b>`/`<i>`; descripción de cartas a partir de nombre, categoría y tema; narrativa de acciones (apertura y resolución); cuerpo de textos de desenlace; creación por principio o tema; y continuación estilística a partir de un inicio dado. No se documenta RLHF ni DPO: se trata de un ajuste supervisado puro sobre texto de dominio. La pérdida de evaluación final es de 1,949.

## Capacidades

- Generación de texto narrativo en el registro estilístico de *Cultist Simulator*: prosa elíptica, arcaizante, con carga simbólica.
- Descripción de cartas a partir de metadatos estructurados (nombre, categoría, tema).
- Redacción de narrativa de acciones: texto de apertura y texto de resolución de un evento.
- Redacción de textos de desenlace a partir del nombre del final.
- Creación temática guiada por los nueve principios del juego (Luz, Forja, Filo, Invierno, Corazón, Grial, Polilla, Golpe, Historias Secretas).
- Continuación y reescritura estilística de un fragmento dado.
- Traducción chino simplificado ↔ inglés, con preservación condicional de etiquetas de formato `<b>` e `<i>`.
- Conversación multi-turno básica mediante plantilla de chat (`apply_chat_template`) con `enable_thinking=False`.
- Capacidades heredadas del modelo base Qwen3-4B potencialmente degradadas por el ajuste: no se documenta comportamiento fiable en tool calling, function calling ni razonamiento agéntico, y el ajuste se realizó con el modo de pensamiento desactivado.
- No soporta visión, audio ni otras modalidades.

## Casos de uso

- Escritura de material para fans: generar descripciones de cartas y textos de eventos coherentes con el estilo del juego para expansiones no oficiales, usando el prompt estructurado de nombre, categoría y tema que el modelo fue entrenado para interpretar.
- Preparación de campañas de rol: producir textos de apertura y resolución de escenas con ambientación esotérica, aprovechando la separación entrenada entre narrativa de apertura y de cierre.
- Localización interna zh→en de textos con marcado enriquecido: el modelo conserva etiquetas `<b>`/`<i>` cuando aparecen en el origen, algo que la variante de 0,6B no logra, lo que lo hace apto para pipelines de traducción que dependen de marcado inline.
- Generación de borradores de módulos y suplementos: crear bloques temáticos por principio (por ejemplo, una serie de textos de Invierno y Luz) que luego un editor humano revisa y ajusta.
- Prototipado de sistemas de texto procedural para videojuegos: dado que el modelo acepta metadatos como entrada y devuelve prosa, se puede insertar en una herramienta interna que rellene fichas de contenido vacías antes de la revisión humana.
- Continuación estilística en talleres de escritura: alimentar un fragmento inicial y obtener continuaciones en el registro del juego como ejercicio de imitación de estilo.
- Investigación sobre transferencia de estilo: al publicar datos de entrenamiento (número de muestras, epochs, eval_loss) y scripts de reproducción, sirve como punto de partida controlado para experimentos de ajuste de bajo rango sobre dominio cerrado con un solo GPU de 16 GB.
- Demostración educativa de LoRA frente a ajuste completo: el repositorio ofrece simultáneamente el adaptador y el modelo fusionado, lo que permite medir coste de almacenamiento (126,1 MB frente a 7,51 GB) y comparar calidad entre las variantes de 0,6B y 4B.

## Benchmarks y rendimiento

No se han publicado resultados en la información disponible para pruebas estandarizadas como MMLU, HumanEval o GSM8K. El único dato cuantitativo aportado es la pérdida de evaluación del ajuste, junto con ejemplos cualitativos comparados:

| Metrica / prueba | cultist-simulator-qwen3-4b | cultist-simulator-qwen3-0.6b |
|---|---|---|
| eval_loss (validacion, 779 muestras) | 1,949 | 2,406 |
| Descripcion de carta con nombre, categoria y tema | texto coherente con el estilo (ejemplo: «Snow covers all, the sun sinks below the horizon. The light is cold as frost.») | texto fuera de registro («Every stone here is deep in moss...») |
| Traduccion zh→en conservando `<b>` | marcado preservado correctamente | marcado perdido |
| Benchmark estandar (MMLU, HumanEval, GSM8K) | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia del modelo fusionado en bf16: aproximadamente 8 GB solo de pesos, más caché KV y activaciones; con 16 GB se puede cargar con holgura en secuencias cortas.
- El propio autor documenta el entrenamiento completo en una única GPU de 16 GB en bf16 con checkpointing de gradientes, lo que da una referencia realista del mínimo para ajuste.
- GPU de gama de consumo: cabe en tarjetas con 12-16 GB (por ejemplo, RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090); el adaptador LoRA, al cargarse sobre el modelo base, no reduce el requisito de VRAM del base.
- GPU de centro de datos: A100, H100 o L40S son suficientes y sobredimensionadas para un modelo de 4B; útiles para servir muchas peticiones concurrentes.
- Opciones de despliegue documentadas: `transformers` con `AutoModelForCausalLM` (modelo fusionado), `transformers` + `peft` con `PeftModel` (adaptador), y Ollama mediante el `Modelfile` incluido (`ollama create cultist-4B -f Modelfile`). El repositorio incluye la etiqueta de compatibilidad con text-generation-inference. No se documentan instrucciones para vLLM ni llama.cpp.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo de primera respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Rendimiento documentado |
|---|---|---|---|---|---|
| Cecilis/cultist-simulator-qwen3-4b | 4,02B (dense) | no disponible (truncado de entrenamiento 896) | apache-2.0 | Ajuste de estilo y tareas de texto de *Cultist Simulator* | eval_loss 1,949 |
| Cecilis/cultist-simulator-qwen3-0.6b | 0,6B (dense) | no disponible | apache-2.0 | Misma familia y mismo corpus, menor tamano | eval_loss 2,406; pierde marcado `<b>` en traduccion |
| Qwen/Qwen3-4B (base) | 4,02B (dense) | no disponible en la informacion proporcionada | apache-2.0 | Modelo generalista multilingue | No comparable en esta tarea; no hay mediciones del dominio publicadas |

No se dispone de datos de benchmarks ni de contexto oficial de modelos alternativos dentro de la información proporcionada, por lo que la comparación se limita a las variantes de la misma familia y al modelo base.

## Limitaciones y advertencias

- Sesgos: no se documenta ninguna evaluación de sesgos. Al entrenarse exclusivamente sobre texto de ficción de un único videojuego, el modelo reproduce de forma sistemática el sesgo estilístico y temático de esa obra, incluida su imaginería ocultista; no es un modelo neutral ni generalista.
- Alucinación y fidelidad factual: el modelo no conoce mecánicas de juego, efectos de cartas, recetas ni valores numéricos, y no ejecuta ni simula el sistema de juego. Los textos que genera pueden contradecir el canon oficial.
- Riesgo de reproducción literal: al derivar de texto extraído del juego, existe probabilidad de emitir fragmentos literales o casi idénticos a los textos originales, cuyo copyright pertenece a Weather Factory. Hay que verificar la autorización antes de publicar resultados.
- Restricción de uso: el autor pide expresamente limitar el modelo a aprendizaje personal y creación de fans, es decir, uso no comercial, pese a que la licencia declarada de los pesos sea Apache-2.0. El corpus de entrenamiento no está cubierto por esa licencia.
- Idioma: solo chino simplificado e inglés. No se ha entrenado ningún otro idioma, por lo que no cabe esperar calidad en castellano u otros idiomas.
- Longitud de salida: el truncado de entrenamiento fue de 896 tokens; los textos continuos claramente más largos quedan fuera del régimen para el que se ajustó el modelo.
- Formato y plantilla: el ajuste usó la plantilla `qwen3_nothink`. Usar el modo de pensamiento de Qwen3 o plantillas distintas puede degradar el comportamiento.
- Herramientas y agentes: no hay evidencia de que conserve de forma fiable las capacidades de tool calling o razonamiento multi-paso del modelo base tras el ajuste; no debe asumirse que las mantiene.
- Formatos cuantizados: no se publican variantes GGUF, AWQ o GPTQ, de modo que un despliegue cuantizado requiere conversión por cuenta propia y sin validación documentada.
- Sin datos de rendimiento en producción: no hay métricas de latencia, throughput ni evaluación de robustez frente a entradas adversarias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cecilis/cultist-simulator-qwen3-4b
- Variante de 0,6B de la misma familia: https://huggingface.co/Cecilis/cultist-simulator-qwen3-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio con scripts de extracción, entrenamiento e inferencia: https://github.com/alice-kroi/cultist-llm
- Framework de ajuste utilizado: https://github.com/hiyouga/LLaMA-Factory
- Paper o blog técnico del modelo: no disponible en la información proporcionada
- Demostración en línea: no disponible en la información proporcionada
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo (los resultados obtenidos corresponden a cotizaciones bursátiles de la empresa Soitec y no guardan relación con esta ficha)
