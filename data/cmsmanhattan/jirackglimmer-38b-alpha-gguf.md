# CMSManhattan/JiRackGlimmer-38B-alpha-GGUF

## Resumen

JiRack Glimmer 38B alpha es un modelo de lenguaje de 38.300 millones de parámetros publicado por CMSManhattan (Konstantin Grabko) sobre la arquitectura propietaria JiRack, construido a partir de un modelo Muse Glimmer de Meta. Esta versión concreta es un checkpoint **alpha sin entrenamiento propio**: reproduce bit a bit las salidas del modelo original del que deriva y no incorpora todavía capacidad aprendida adicional. Se publica para que socios y evaluadores inspeccionen la corrección del ensamblado antes de las fases de entrenamiento.

El modelo combina una arquitectura tipo transformer con atención híbrida por capas (3 capas de ventana deslizante de 2.048 posiciones y 1 capa global, en grupos de 4) y una innovación propia: todas las capas lineales son BitLinear con conmutador ternario (lambda), aunque en este alpha lambda vale 0 y los pesos se mantienen en precisión completa. Dispone de una ventana de contexto configurada de 131.072 posiciones y un vocabulario de 202.048 tokens.

Su relevancia ahora es fundamentalmente de investigación: demuestra que una modificación arquitectónica profunda puede preservar exactamente el comportamiento del modelo fuente (KL 0, top-1 100%) y sirve como base para tres líneas futuras de trabajo anunciadas por el autor: entrenamiento continuado en texto, código y matemáticas, ajuste fino para tool calling y agentes, y entrenamiento ternario completo para reducir radicalmente el tamaño de los ficheros. La release incluye únicamente la parte de lenguaje del checkpoint; el codificador de imagen no está incluido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (3 capas sliding-window de 2.048 + 1 capa global por grupo), capas lineales BitLinear con conmutador ternario (lambda = 0 en este alpha) |
| Parametros totales | 38,3B en el checkpoint; 36,4B en el modelo de lenguaje (36.360.842.752 según safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 131.072 posiciones configuradas; las comprobaciones del autor usaron ventanas de 512 tokens |
| Tipos de cuantizacion | Q8_0, Q4_K_M (con importance matrix), Q2_K |
| Idiomas soportados | no disponible |
| Licencia | jirack-proprietary (propietaria); el modelo fuente Muse Glimmer es Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

Otras especificaciones técnicas: 52 capas, hidden size 6.656, FFN 28.160, 32 cabezas de consulta, 2 cabezas clave-valor, dimensión de cabeza 128, vocabulario de 202.048 tokens. Tamaño total del repositorio: 74,5 GB.

## Arquitectura y entrenamiento

El modelo parte de un Muse Glimmer de Meta con licencia Apache 2.0, al que CMSManhattan ha modificado tanto la arquitectura como los pesos. La estructura es un transformer de 52 capas organizadas en grupos de 4: tres capas usan atención de ventana deslizante de 2.048 posiciones y una es global, un patrón que reduce el coste computacional en contexto largo manteniendo acceso a información de largo alcance en cada grupo. La atención usa 32 cabezas de consulta y solo 2 cabezas clave-valor (GQA con ratio 16:1), lo que reduce drásticamente la memoria de la caché KV.

La innovación principal es la arquitectura JiRack: cada capa lineal es una BitLinear con un conmutador ternario (lambda) que permite transitar entre pesos de precisión completa y pesos ternarios. En este alpha, lambda vale 0 y los pesos permanecen en precisión completa, de modo que el modelo funciona como un transformer convencional de 38B. El autor verifica que los 1.436 tensores del checkpoint están correctos (0 errores) y que los logits del modelo de 52 capas son bit-idénticos a los del modelo fuente en 4 prompts (KL 0, top-1 100%), y en las primeras 4 capas sobre 5 prompts incluyendo texto largo.

No hay datos de entrenamiento propio: este lanzamiento es explícitamente previo a cualquier fase de entrenamiento. El roadmap anuncia entrenamiento continuado en texto general, código y matemáticas, ajuste fino para tool calling y agentes, y entrenamiento ternario (lambda de 0 a 1). El autor menciona que sus modelos ternarios previos en la arquitectura JiRack (16B, 8B, 2B) ya están publicados y superan 115, 113 y 110 casos respectivamente de un test propio de 117 casos de tool calling, aunque esos resultados no corresponden a este modelo de 38B.

## Capacidades

- Generación de texto conversacional: soporta modo chat mediante `llama-cli -cnv` y `llama-server` con contexto configurable hasta 32.768 tokens en los ejemplos del autor.
- Herencia de capacidades del modelo fuente: al ser bit-idéntico al Muse Glimmer de origen, conserva las capacidades de lenguaje y conocimiento de ese modelo (no detalladas en la información disponible).
- Contexto largo: ventana configurada de 131.072 posiciones, adecuada para documentos extensos y conversaciones de muchos turnos.
- Tool calling y agentes: **no implementado todavía** en este alpha; está en el roadmap como fase de ajuste fino.
- Capacidades multimodales: el checkpoint original incluía un codificador de imagen, pero **no forma parte de esta release GGUF**; el modelo publicado es solo de lenguaje.
- Multilingüismo: no disponible (no se especifican idiomas soportados).
- Modo thinking o razonamiento explícito: no disponible en la información proporcionada.

## Casos de uso

- Evaluación de arquitecturas de investigación: el modelo sirve para que equipos de investigación verifiquen la corrección de la arquitectura JiRack y la equivalencia funcional con el modelo fuente antes de invertir en entrenamiento. Su valor está en la reproducibilidad bit a bit de los logits.
- Base para entrenamiento continuado: laboratorios con acceso a GPU pueden partir de este alpha para aplicar entrenamiento en texto general, código y matemáticas, aprovechando la infraestructura ya validada de pesos y tokenizador.
- Experimentación con cuantización ternaria: el conmutador lambda permite investigar la transición de precisión completa a ternaria sobre un modelo ya ensamblado y verificado, con el objetivo de reducir el tamaño de fichero drásticamente (el Q2_K ya ocupa 13,77 GB frente a los 38,65 GB del Q8_0).
- Prototipado de chat de contexto largo en local: con el fichero Q4_K_M (22,09 GB) se puede desplegar un servidor `llama-server` con 32.768 tokens de contexto en una GPU de 24–48 GB, útil para pruebas internas de asistentes conversacionales.
- Investigación sobre atención híbrida: el patrón de 3 capas locales y 1 global cada 4 capas permite estudiar el equilibrio entre coste de atención y calidad en tareas de contexto largo, comparándolo con transformers de atención completa.
- Demostración y validación para socios: el autor publica el modelo para que partners evalúen el proyecto antes de comprometer recursos de cómputo; encaja en procesos de due diligence técnica de una colaboración.
- Pruebas de tool calling futuras: aunque no está entrenado para ello, el roadmap prevé ajuste fino para agentes; el modelo puede servir como banco de pruebas para el pipeline de datos de tool calling del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí aporta métricas de integridad y de cuantización:

| Fichero | KL medio vs fuente | Mismo token top-1 | Perplejidad (fuente: 4,22) |
|---|---|---|---|
| Q8_0 | 0,000000 | 100,00% | 4,22 |
| Q4_K_M | 0,038366 | 93,46% | 4,44 |
| Q2_K | 0,354336 | 80,00% | 5,82 |

Mediciones realizadas en CPU con llama.cpp (commit c6a0ff11a) sobre 3 ventanas de 512 tokens. La integridad del checkpoint se auditó sobre 1.436 tensores con 0 errores, y la equivalencia de logits con el modelo fuente fue bit-idéntica en 4 prompts (KL 0, top-1 100%) y en las primeras 4 capas sobre 5 prompts.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14 GB para Q2_K, 23 GB para Q4_K_M y 40 GB para Q8_0 (tamaños de fichero más overhead de contexto y caché KV).
- GPU recomendadas: para Q8_0, una A100 40/80 GB o H100; para Q4_K_M, una RTX 4090 (24 GB) o A6000 (48 GB); para Q2_K, GPUs consumer de 16 GB o superiores.
- Cabe en GPU consumer: sí, el Q4_K_M en una RTX 4090 de 24 GB y el Q2_K en tarjetas de 16 GB como la RTX 4080 o la RTX 4060 Ti de 16 GB, siempre que se ajuste el contexto para no desbordar la caché KV.
- Opciones de despliegue: llama.cpp (verificado por el autor), `llama-cli` y `llama-server`; al ser GGUF estándar debería funcionar también en Ollama y en otros frontends compatibles con llama.cpp, aunque no se documenta explícitamente.
- Latencia y throughput: no disponibles. El autor solo reporta mediciones en CPU sin cifras de velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| JiRack Glimmer 38B alpha (este) | 38,3B (36,4B LM) | 131.072 | Propietaria (jirack-proprietary) | GGUF en HF | Alpha sin entrenar; bit-idéntico al fuente |
| JiRack ternario 16B (autor) | 16B | no disponible | no disponible | GGUF en HF | 115/117 en test propio de tool calling |
| JiRack ternario 8B (autor) | 8B | no disponible | no disponible | GGUF en HF | 113/117 en test propio de tool calling |
| JiRack ternario 2B (autor) | 2B | no disponible | no disponible | GGUF en HF | 110/117 en test propio de tool calling |

La información disponible no incluye datos de rendimiento de benchmarks del modelo fuente Muse Glimmer ni de alternativas de terceros de tamaño comparable, por lo que no es posible establecer una comparación cuantitativa con modelos como Llama, Qwen o Mistral de la misma escala.

## Limitaciones y advertencias

- **Estado alpha sin entrenamiento**: el modelo no responde mejor que el Muse Glimmer del que deriva; su capacidad adicional está sin explotar. No debe usarse en producción como si fuera un modelo entrenado.
- **Licencia restrictiva**: la licencia es propietaria (jirack-proprietary) con todos los derechos reservados por Konstantin Vladimirovich Grabko, aunque el modelo base sea Apache 2.0. Es imprescindible revisar los términos con el autor antes de cualquier uso comercial; el propio autor remite a su contacto para licencias.
- **Uso sujeto a la política de Meta**: el autor pide a los usuarios que sigan la Usage Policy de Muse Glimmer de Meta, además de la licencia propietaria.
- **Sin modalidad de imagen**: el codificador de imagen del checkpoint original no está incluido; el modelo es exclusivamente de lenguaje.
- **Sin tool calling ni agentes**: no se ha ajustado para llamadas a herramientas; los casos de uso con agentes no están soportados todavía.
- **Idiomas no especificados**: no hay información sobre cobertura multilingüe, lo que es un riesgo para despliegues en castellano u otros idiomas.
- **Riesgo de alucinación**: inherente a los modelos de lenguaje; no se han publicado evaluaciones de factualidad ni de sesgos.
- **Contexto verificado parcialmente**: la ventana configurada es de 131.072 posiciones, pero las comprobaciones del autor se hicieron con ventanas de 512 tokens; el comportamiento real en contexto muy largo no está validado en esta release.
- **Cuantizaciones de baja precisión**: Q2_K degrada notablemente la fidelidad (KL 0,354; solo 80% de coincidencia en token top-1), por lo que no es recomendable para evaluación seria.
- **Sin cifras de rendimiento en GPU**: no hay datos de latencia ni throughput publicados, lo que dificulta planificar despliegues.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/CMSManhattan/JiRackGlimmer-38B-alpha-GGUF
- Contacto del autor para colaboraciones y licencias: grabko@cmsmanhattan.com
- Teléfono de contacto: +1 (516) 777-0945
- Ubicación del autor: Nueva York, EE. UU.
