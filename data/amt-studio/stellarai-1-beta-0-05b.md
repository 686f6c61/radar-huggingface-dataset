# AMT-Studio/StellarAI-1-beta-0.05b

## Resumen

StellarAI-Tiny es un modelo de lenguaje causal bilingüe (chino e inglés) de aproximadamente 50 millones de parámetros (0.05B), desarrollado desde cero por AMT-Studio. Está diseñado para entornos con recursos muy limitados: funciona en CPU con 4 GB de RAM y ocupa unos 93 MB en pesos. Su principal valor es servir como herramienta educativa y de prototipado rápido, no como modelo de producción. Incluye un codificador de visión híbrido CNN+ViT y un bloque de fusión cross-attention, lo que le confiere capacidades multimodales incipientes, aunque el entrenamiento de visión se realizó solo con datos de texto y requiere fine-tuning adicional para tareas de VQA. La arquitectura es un transformer de 4 capas con RoPE, 6 cabezas de atención y un tamaño de contexto de 1024 tokens. Su licencia MIT permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de 4 capas con codificador de visión híbrido CNN+ViT y bloque de fusión cross-attention |
| Parametros totales | ~50M (0.05B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos en safetensors y PyTorch) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | MIT |
| Formato de pesos | Safetensors (model.safetensors) y PyTorch (pytorch_model.bin) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer causal con 4 capas de texto (d_model=384, 6 cabezas, FFN intermedio de 1536, activación GELU) y codificación posicional RoPE. Para la parte visual, emplea un extractor CNN de 4 capas (canales 24→48→96→192) seguido de un transformer ViT de 2 capas con 6 cabezas. Un bloque de fusión de 1 capa combina las representaciones de texto e imagen mediante self-attention y cross-attention, y la cabeza de salida comparte pesos con la capa de embedding. El vocabulario BPE tiene 11,030 tokens.

El entrenamiento se realizó en CPU durante aproximadamente 3.2 horas, con 12,000 pasos (5,000 de base + 7,000 de entrenamiento general) sobre un corpus de 19,846 líneas de datos bilingües que abarcan IA, informática, NLP, matemáticas, programación, razonamiento, diálogo y plugins. Se usó AdamW (lr=3e-4, weight decay=0.01), programación de tasa de aprendizaje con cosine annealing y warmup de 100 pasos, batch size de 4, longitud de secuencia de 128 y gradient clipping de 1.0. La pérdida final fue de 4.06 (perplejidad ≈ 58). El objetivo fue predicción del siguiente token con un tokenizer BPE personalizado.

## Capacidades

- Generación de texto causal en chino e inglés, con capacidad de completar frases y producir texto coherente a nivel básico.
- Soporte multimodal incipiente: el codificador de visión puede procesar imágenes, pero la generación de respuestas visuales (VQA) requiere fine-tuning con pares imagen-texto.
- Sistema de plugins integrado para tool calling: calculadora, base de conocimiento, traductor, herramientas de texto y consultas de tiempo, usando el formato `[TOOL:xxx]`.
- Razonamiento básico y generación de diálogo, aunque con calidad limitada por el pequeño tamaño del corpus.
- Capacidad de ejecución en CPU con 4 GB de RAM, lo que lo hace accesible para entornos sin GPU.
- Tokenización BPE personalizada que mezcla caracteres chinos e ingleses en un mismo vocabulario.

## Casos de uso

- Prototipado de aplicaciones de chat en entornos con hardware limitado: el modelo puede integrarse en demos o MVPs que requieran generación de texto sin depender de servicios en la nube, gracias a su bajo consumo de memoria y CPU.
- Enseñanza de conceptos de LLM en cursos universitarios o bootcamps: su tamaño reducido permite a estudiantes inspeccionar el código, modificar la arquitectura y entender el flujo completo de entrenamiento e inferencia.
- Experimentación con fine-tuning para tareas específicas: al ser un modelo pequeño y con licencia MIT, es adecuado para probar técnicas de adaptación (por ejemplo, LoRA) sobre dominios concretos como resúmenes o clasificación de texto.
- Demostraciones de generación bilingüe: puede usarse para ilustrar diferencias de comportamiento entre chino e inglés en generación de texto, o para pruebas de tokenización multilingüe.
- Pruebas de integración de tool calling: su sistema de plugins permite evaluar flujos de llamada a herramientas en un entorno controlado, aunque la precisión de las llamadas es limitada.
- Investigación académica sobre modelos pequeños: sirve como punto de partida para estudiar el impacto del tamaño del corpus, la arquitectura híbrida o las estrategias de fusión multimodal en modelos de baja escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la pérdida final de entrenamiento (4.06) y la perplejidad aproximada (58), sin comparaciones con otros modelos.

## Requisitos de hardware

- CPU con 4 GB de RAM es suficiente para inferencia, según la model card.
- Los pesos ocupan aproximadamente 93 MB, por lo que caben en cualquier GPU con al menos 1 GB de VRAM si se desea acelerar la inferencia (aunque no se especifica soporte oficial para GPU).
- Compatible con la librería `transformers` de HuggingFace, usando `trust_remote_code=True` para cargar el código personalizado.
- No se proporcionan datos de latencia ni throughput. Al ser un modelo de 50M de parámetros, se espera una generación rápida en CPU, pero no hay mediciones oficiales.
- Opciones de despliegue: inferencia local con Python y `transformers`, o integración en scripts personalizados. No se mencionan compatibilidades con vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

No se dispone de información suficiente en la documentación proporcionada para realizar una comparativa con otros modelos de tamaño similar (por ejemplo, TinyLlama, GPT-2 pequeño o modelos de 50M de parámetros). No se han publicado benchmarks comparativos ni se mencionan alternativas en la model card.

## Limitaciones y advertencias

- Conocimiento muy limitado: entrenado solo con ~19,846 líneas de datos curados, la cobertura de conocimiento es estrecha y puede producir contenido inexacto o desactualizado.
- Alta probabilidad de alucinación: el modelo puede generar afirmaciones falsas, incoherentes o sin sentido, especialmente fuera de los dominios del corpus.
- Calidad de generación limitada: adecuado para demostrar modelado de lenguaje básico, pero no para diálogo de producción ni tareas que requieran precisión.
- Capacidad de visión incompleta: el codificador de visión se preentrenó solo con datos de texto; la respuesta a imágenes (VQA) requiere fine-tuning adicional con pares imagen-texto.
- Precisión de tool calling deficiente: aunque aprendió el formato `[TOOL:xxx]`, la exactitud de las llamadas a plugins necesita mejoras.
- No apto para entornos de producción, ni para dominios médicos, legales o financieros.
- El contexto máximo es de 1024 tokens, lo que limita tareas que requieran ventanas largas.
- El entrenamiento se realizó en CPU con un corpus pequeño, por lo que el modelo puede tener sesgos derivados de la composición de los datos (no se detalla la procedencia exacta).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AMT-Studio/StellarAI-1-beta-0.05b
- No se proporcionan otros enlaces (papers, repositorios, demos) en la información disponible.
