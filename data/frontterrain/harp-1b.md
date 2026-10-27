# frontterrain/HARP-1B

## Resumen

HARP-1B es un modelo de lenguaje autorregresivo compacto desarrollado desde cero por FrontTerrain, una empresa que lo presenta como su "foundation model" y que lo orienta a programación de sistemas, matemáticas, Python y, sobre todo, generación de código nativo en FrontLang (`.ft`), el lenguaje propio del ecosistema de la compañía. Pese al nombre "1B", el modelo es de escala reducida: la model card declara 98.913.024 parámetros (~99 M) y los pesos publicados en safetensors suman 123.489.024 parámetros, muy por debajo del billón que sugiere la nomenclatura.

Arquitectónicamente es un transformer denso convencional con RoPE, SwiGLU, RMSNorm y Grouped-Query Attention con proporción 4:1 (12 cabezas de consulta, 3 de clave-valor), 12 capas, dimensión oculta 768 y vocabulario de 32.000 tokens. Su ventana de contexto es de solo 512 tokens y el entrenamiento declarado alcanza 1.400.832.000 tokens (~1,4 mil millones), lejos del objetivo de 50.000 millones que el autor fija como meta, con una pérdida actual de 0,2773 en el paso 52.000.

Su relevancia actual es limitada y muy específica: se trata de un experimento de modelo pequeño, publicado con licencia Apache 2.0 y pesos en safetensors y GGUF, útil para quienes quieran estudiar el soporte de un lenguaje de programación emergente o ejecutar inferencia en hardware muy modesto. No hay benchmarks publicados, el repositorio acumula 0 descargas y no se documenta ningún proceso de alineamiento (RLHF/DPO), por lo que debe evaluarse como un artefacto en desarrollo más que como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso autorregresivo con RoPE, SwiGLU, RMSNorm y Grouped-Query Attention (GQA 4:1) |
| Parámetros totales | 98.913.024 (~99 M) según model card; 123.489.024 según los tensores safetensors publicados |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | No disponible en la model card; el repositorio incluye pesos GGUF (tipos concretos no especificados) |
| Idiomas soportados | Inglés (`en`) y FrontLang (`ft`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

Otros datos declarados por el autor: 12 capas, dimensión oculta 768, 12 cabezas de consulta y 3 de clave-valor, dimensión de cabeza 64, vocabulario de 32.000 tokens, precisión nativa `bfloat16` en mixed-precision, paso de entrenamiento 52.000 y pérdida de entrenamiento 0,2773.

## Arquitectura y entrenamiento

El modelo sigue un diseño de transformer decoder-only estándar, sin innovaciones estructurales destacadas: emplea embeddings posicionales rotatorios (RoPE), normalización RMSNorm, activación SwiGLU y atención con consultas agrupadas (GQA) en proporción 4:1, lo que reduce el coste de memoria de la caché KV respecto a atención multi-cabeza completa. El vocabulario es de 32.000 tokens y la ventana de contexto queda fijada en 512 tokens, un valor muy restrictivo para casos de uso conversacionales o de generación de código con contexto amplio.

El entrenamiento se realizó en `bfloat16` nativo con mixed-precision sobre NVIDIA L4 con Tensor Cores, FlashAttention e inductor JIT de PyTorch Triton, a una velocidad declarada de ~40.800 tokens/s. Los datos declarados ascienden a 1.400.832.000 tokens (aproximadamente el 2,8 % del objetivo de 50.000 millones), lo que sitúa al modelo en una fase temprana de entrenamiento. La model card no documenta la composición del dataset, ni procesos de RLHF, DPO o ajuste por instrucciones; únicamente indica que el preentrenamiento incluye documentación y código del ecosistema FrontTerrain (FrontLang, TensorLib y el IDE Codrop).

## Capacidades

- Generación de texto autorregresiva en inglés y en FrontLang, con especial énfasis en sintaxis del compilador, reglas de seguridad de memoria, structs, traits, pattern matching y especificaciones de bytecode.
- Generación de código Python y contenidos de programación de sistemas, según la orientación declarada por el autor.
- Razonamiento matemático básico, mencionado como área de optimización pero sin métricas publicadas.
- Conocimiento del ecosistema FrontTerrain: FrontLang (`.ft`), la librería de tensores TensorLib y el IDE colaborativo Codrop.
- Modo conversacional declarado mediante el tag `conversational`, sin plantilla de chat documentada.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modos de "thinking".
- Multilingüismo limitado a inglés y FrontLang; el español no figura entre los idiomas soportados.

## Casos de uso

- Autocompletado y generación de código FrontLang en el IDE Codrop: el modelo fue preentrenado con la sintaxis y las reglas de memoria de FrontLang, por lo que puede emplearse para sugerir structs, traits y bloques `fn` dentro de un editor, siempre con validación posterior del compilador.
- Asistente de documentación del ecosistema FrontTerrain: al haber visto documentación de FrontLang, TensorLib y Codrop, resulta adecuado para responder preguntas sobre la API de estas herramientas en un chatbot interno de soporte a desarrolladores.
- Prototipado de bajo coste en local: con ~99-123 M de parámetros y pesos GGUF, se puede ejecutar en portátiles sin GPU para pruebas de concepto de generación de texto, siempre que las peticiones quepan en 512 tokens.
- Enseñanza de arquitecturas de lenguaje: su configuración compacta (12 capas, 768 de dimensión oculta, GQA 4:1) lo hace útil como caso de estudio reproducible en cursos sobre transformers y sobre el impacto de la ventana de contexto.
- Investigación sobre lenguajes de programación emergentes: sirve como base para experimentos de fine-tuning supervisado orientados a un DSL propietario, partiendo de un modelo con licencia Apache 2.0 y pesos abiertos.
- Generación de fragmentos cortos de Python o de código de sistemas en pipelines de documentación técnica, con revisión humana obligatoria y sin uso autónomo en producción.
- Evaluación comparativa de tokenizadores y curvas de pérdida: al publicar el autor el paso de entrenamiento (52.000) y la pérdida (0,2773), permite reproducir experimentos de escalado a pequeña escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card únicamente reporta métricas de entrenamiento (pérdida 0,2773 en el paso 52.000 y ~40.800 tokens/s de velocidad de entrenamiento en NVIDIA L4). No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones específicas de generación de código FrontLang, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en `bfloat16`: aproximadamente 0,2-0,25 GB solo para pesos (98,9 M y 123,5 M de parámetros respectivamente), más la caché KV de la ventana de 512 tokens, que es despreciable.
- VRAM estimada en cuantización de 8 bits: en torno a 0,12 GB; en 4 bits, en torno a 0,06-0,08 GB, siempre con overhead adicional del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el autor cita NVIDIA L4 como hardware de entrenamiento. Funciona igualmente en GTX 1650, RTX 3060, RTX 4090, A100 o H100 sin aprovechar su capacidad.
- Cabe holgadamente en GPU de consumo e incluso en CPU: el repositorio completo ocupa 0,5 GB, por lo que es viable en Raspberry Pi o entornos sin acelerador.
- Opciones de despliegue: llama.cpp u Ollama a través de los pesos GGUF incluidos; vLLM o TGI son posibles pero sobredimensionados para este tamaño. La model card solo documenta la carga de tensores con `safetensors.torch.load_file`, sin ejemplo de `AutoModelForCausalLM`, lo que sugiere que puede requerir código de arquitectura personalizado en Transformers; conviene verificar la compatibilidad antes de integrarlo.
- Latencia y throughput de inferencia: no disponibles. El único dato de velocidad publicado (~40.800 tokens/s) corresponde al entrenamiento, no a la generación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Benchmarks publicados |
|---|---|---|---|---|---|
| HARP-1B (FrontTerrain) | ~99 M (card) / 123,5 M (pesos) | 512 tokens | en, ft | Apache 2.0 | No disponibles |
| SmolLM-135M (HuggingFace) | 135 M | 2.048 tokens | en (principalmente) | Apache 2.0 | Sí, publicados por el autor |
| Qwen2.5-0.5B (Alibaba) | 494 M | 32.768 tokens | multilingüe (incluye español) | Apache 2.0 | Sí, publicados por el autor |
| TinyLlama-1.1B | 1.100 M | 2.048 tokens | en (principalmente) | Apache 2.0 | Sí, publicados por el autor |

HARP-1B se posiciona en la franja de modelos por debajo de 150 M de parámetros, donde la competencia directa más cercana es SmolLM-135M. Frente a ella, HARP-1B ofrece una ventana de contexto cuatro veces menor (512 frente a 2.048 tokens) y carece de evaluaciones publicadas, aunque añade soporte nativo de un lenguaje propietario (FrontLang) que ningún otro modelo cubre. Los datos de rendimiento comparado no están disponibles para HARP-1B, por lo que la comparación debe limitarse a especificaciones estructurales.

## Limitaciones y advertencias

- El nombre "HARP-1B" induce a error: el modelo tiene ~99 M parámetros según la model card y 123,5 M según los pesos publicados, no mil millones. Además existe una discrepancia de ~24,6 M de parámetros entre ambas fuentes que el autor no explica.
- Entrenamiento incompleto: solo se han procesado ~1,4 mil millones de tokens frente a un objetivo declarado de 50 mil millones (en torno al 2,8 %), por lo que la calidad esperada es la de un modelo en fase temprana.
- Ventana de contexto de 512 tokens: insuficiente para conversaciones multi-turno, análisis de repositorios o documentos técnicos de longitud media.
- Cobertura lingüística muy restringida: solo inglés y FrontLang. No hay soporte declarado de español ni de otros idiomas, y la calidad fuera de inglés y código FrontLang es impredecible.
- Riesgo elevado de alucinación, especialmente en APIs de FrontLang, TensorLib o Codrop, donde el corpus de entrenamiento es limitado y no verificable; todo el código generado debe pasar por compilador y tests.
- No se documenta ningún proceso de alineamiento (RLHF, DPO o instruction tuning), ni plantilla de chat, ni evaluación de sesgos. No hay garantías de comportamiento seguro en modo conversacional.
- Sin benchmarks publicados ni evaluación independiente: no es posible estimar su rendimiento en MMLU, HumanEval o GSM8K ni compararlo con alternativas de forma rigurosa.
- Adopción prácticamente nula: 0 descargas y 2 "likes" en HuggingFace, sin demo pública ni repositorio de código asociado documentado.
- Integración incierta en ecosistemas estándar: la model card no incluye configuración de Transformers ni ejemplo de `AutoModelForCausalLM`; es posible que la arquitectura requiera `trust_remote_code` o código propio.
- La licencia Apache 2.0 permite uso comercial, pero al no haber evaluación de calidad ni de sesgos, el uso en producción exige validación propia y asunción explícita del riesgo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/frontterrain/HARP-1B
- Sitio web de FrontTerrain: https://frontterrain.com
- Logo de FrontTerrain referenciado en la model card: https://frontterrain.com/images/logo.png
- Perfil de GitHub del fundador citado en la model card: https://github.com/dar2quasar (la model card menciona el identificador `@dark2quasar`; el enlace publicado apunta a `dar2quasar`)
- Paper técnico: no disponible
- Blog o nota de publicación: no disponible
- Repositorio de código de FrontLang o TensorLib: no disponible en la información proporcionada
- Demo o espacio de inferencia: no disponible
