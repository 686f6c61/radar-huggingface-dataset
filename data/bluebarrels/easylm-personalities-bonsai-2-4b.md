# Bluebarrels/easylm-personalities-bonsai-2-4b

## Resumen

`easylm-personalities-bonsai-2-4b` es un adaptador PEFT LoRA publicado por el usuario Bluebarrels sobre el modelo ternario `prism-ml/Ternary-Bonsai-2-4B-gguf`. No es un modelo completo: se distribuye como un adaptador de unos 4,2 MB (56 tensores, 348.153 elementos FP16 distintos de cero, 703.608 bytes) que se aplica sobre una base de aproximadamente 1 GB. Su función es especializar esa base en un conjunto de "personalidades" y estilos de diálogo definidos por el autor: 75 personalidades de EasyLM, 151 voces del "Council of Kami", una capa socrática denominada Alice (`Q01`–`Q12`) y un modo llamado `ether-fishing`.

El interés del artefacto es fundamentalmente práctico: propone un escalón intermedio de 1 GB dentro de una escalera de modelos (500 MB, 1 GB, 2 GB y 6 GB) pensada para ejecutarse en el navegador vía WebGPU y en el cliente Hydra, con un consumo de memoria muy bajo y una ventana de contexto declarada de 262.144 tokens. Es, por tanto, un experimento de despliegue en el borde (móviles, tablets, Chromebooks) más que un modelo de propósito general competitivo.

Ahora bien, la evidencia disponible es escasa: cero descargas, cero likes, un corpus de entrenamiento de solo 498 turnos y ausencia total de benchmarks. La model card mezcla referencias a una base GGUF ternaria y a una base MLC `mlc-ai/Qwen3.5-4B-q4f16_1-MLC`, lo que introduce ambigüedad sobre la arquitectura real del modelo subyacente. Debe evaluarse como artefacto experimental, no como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma explícita. La model card apunta a una base ternaria GGUF (`prism-ml/Ternary-Bonsai-2-4B-gguf`) y, para WebGPU/MLC, a `mlc-ai/Qwen3.5-4B-q4f16_1-MLC`; no se detalla la arquitectura interna |
| Parametros totales | ~4 mil millones (nominal, según el nombre del modelo base); no confirmado en la model card |
| Parametros activos | No aplica: no se describe como modelo MoE |
| Longitud de contexto | 262.144 tokens (declarado en la model card) |
| Tipos de cuantizacion | Base ternaria de 1,58 bits en GGUF; variante `q4f16_1` para MLC; el adaptador LoRA se distribuye en FP16 safetensors |
| Idiomas soportados | No disponible |
| Licencia | AGPL-3.0 |
| Formato de pesos | Adaptador PEFT LoRA en `safetensors` (`adapter_model.safetensors`); base en GGUF |
| Rank / alpha / dropout del LoRA | r = 16, alpha = 32, dropout = 0,05 |
| Modulos objetivo | `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` |
| Huella del adaptador | ~4,2 MB (56 tensores, 348.153 elementos FP16, 703.608 bytes) |
| Libreria | `peft` |
| Pipeline | `text-generation` |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del transformer subyacente más allá de identificar la base como un modelo ternario de 4B en formato GGUF. Sí detalla la configuración del adaptador: LoRA de rango 16, alpha 32 y dropout 0,05, aplicado sobre los siete módulos habituales de atención y MLP (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). El número de tensores del safetensors (56) es coherente con esa configuración sobre un transformer de varias capas. La mención paralela de `mlc-ai/Qwen3.5-4B-q4f16_1-MLC` como base WebGPU/MLC sugiere, sin confirmarlo, que la familia subyacente podría derivar de Qwen3.5-4B; la model card no aclara la relación entre ambas bases.

El entrenamiento se realizó sobre `Bluebarrels/easylm-training-corpus`, en concreto sobre el fichero `adapter_personalities_chatml.jsonl` con 498 turnos en formato ChatML. El corpus declarado por el autor incluye 92 "stacks académicos" (textos de matemáticas, física, química, biología, computación, ingeniería, derecho, historia, filosofía y oficios), 369 tablas de hechos con 4.634 filas cuantitativas verificadas, 151 libros del "Council of Kami", el grafo Alice 1.0 (46.025 nodos y 19.842 aristas) con una capa de antítesis socrática (6 modos de diagnóstico de confusión `C1`–`C6`, 12 formas de pregunta `Q01`–`Q12` y una máquina de estados de elenco y aporía de 7 etapas `S0`–`S6`), un "why-ledger" llamado `ether-fishing` y un currículo de la CLI Hydra v1.2.2. No se especifica el número total de tokens de entrenamiento, la composición exacta por fracciones ni si hubo etapas de RLHF o DPO; el adaptador es, por tamaño de dataset declarado, un ajuste muy ligero.

## Capacidades

- Generación de texto conversacional en formato ChatML, orientada a diálogo multi-turno.
- Adopción de estilos y "personalidades": 75 perfiles de EasyLM y 151 voces del "Council of Kami" según el autor.
- Conducción socrática: capa Alice con modos de diagnóstico de confusión (`C1`–`C6`), formas de pregunta (`Q01`–`Q12`) y máquina de estados de elenco/aporía (`S0`–`S6`) para guiar al usuario mediante preguntas en lugar de respuestas directas.
- Tutoría académica declarada en matemáticas, física, química, biología, computación, ingeniería, derecho, historia, filosofía y oficios, apoyada en las tablas de hechos del corpus.
- Soporte de "razonamiento por qué": el modo `ether-fishing` prioriza el porqué antes del cómo, con un registro de supersesión append-only y una puerta de verificación empírica de 5 comprobaciones.
- Integración con Hydra: comandos `hydra`, `hydra agent`, `hydra swarm` y `hydra serve` en el puerto 7777, además de los modos `chat`, `agent`, `swarm`, `computer` y `terminal` en los clientes `hydra-tui-rs` y `hydra-desktop-rs`.
- Tool calling / function calling: no documentado explícitamente; la model card menciona "MCP tool orchestration" solo para el modelo de 9B, no para este adaptador.
- Capacidades de visión o audio: no disponibles.
- Multilingüismo: no disponible; no se declara ningún idioma.

## Casos de uso

- Despliegue en navegador para asistentes educativos: con una base de ~1 GB y un adaptador de 4,2 MB, el conjunto se carga vía WebGPU en móviles, tablets, Chromebooks y portátiles, lo que permite ofrecer tutoría sin backend ni coste de servidor.
- Tutoría socrática de materias STEM: el adaptador está entrenado sobre un corpus con matemáticas, física y química; el modo de pregunta guiada de Alice encaja en escenarios donde se busca que el estudiante razone en lugar de recibir la solución.
- Simulación de roles o voces para prototipos de producto: las 151 "voces" permiten generar respuestas con registros diferenciados (histórico, científico, filosófico) para pruebas de UX conversacional antes de invertir en un modelo mayor.
- Enseñanza de metodología de investigación: el "why-ledger" fuerza a explicitar la justificación antes del procedimiento y a registrar correcciones de forma acumulativa, útil en talleres de escritura académica o revisión por pares.
- Agente de línea de comandos en estaciones de trabajo modestas: integrado en Hydra (`hydra agent`, `hydra serve` en el puerto 7777) puede operar sobre repositorios locales con los modos de permisos `manual`, `accept_edits`, `plan` y `bypass`.
- Generación de material didáctico con contexto largo: los 262.144 tokens declarados permiten cargar temarios completos o transcripciones extensas y formular preguntas sobre ellos en un solo contexto, siempre que la base ternaria sostenga la calidad en esa longitud.
- Experimentación en investigación sobre adaptadores de bajo rango: al ser un LoRA de r = 16 documentado con recuento de tensores y bytes, sirve como caso de estudio reproducible para analizar qué aprende un adaptador de 4,2 MB sobre una base cuantizada agresivamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~1 GB para la base ternaria más ~4,2 MB del adaptador; el consumo real de runtime (contexto KV cache) no está documentado y crecerá con la longitud de contexto utilizada.
- GPU recomendadas: no se especifican modelos concretos. El autor orienta el despliegue a WebGPU en el navegador y a los clientes Hydra, no a GPUs de datacenter.
- Cabe en GPU de consumo: sí, según el diseño declarado, el objetivo es ejecutarlo en teléfonos, tablets, Chromebooks y portátiles con aceleración WebGPU. No se detalla el rendimiento en GPUs dedicadas (RTX 4090, etc.).
- Opciones de despliegue: runtime WebGPU de EasyLM (carga del adaptador mediante `parseSafeTensorsHeader` y `applyLoRAWeights`), MLC con la variante `q4f16_1`, y la CLI/TUI/escritorio de Hydra. No se mencionan vLLM, llama.cpp ni TGI.
- Latencia y throughput: no disponibles. No se han publicado métricas de tokens por segundo ni de tiempo a primer token.

## Comparativa con modelos similares

Comparación con los otros escalones de la misma familia, según la propia model card del autor:

| Modelo | Huella | Enfoque declarado | Contexto | Licencia |
|---|---|---|---|---|
| `easylm-bonsai-2-2b` | 500 MB | Opción por defecto universal, carga WebGPU instantánea en móviles y portátiles | no disponible | no disponible |
| `easylm-personalities-bonsai-2-4b` (este) | 1 GB base + 4,2 MB LoRA | Coaching socrático multi-turno, síntesis de ensayo, mentoría de código | 262.144 tokens (declarado) | AGPL-3.0 |
| `easylm-bonsai-2-9b` | 2 GB | Agente por defecto de Hydra, orquestación de herramientas MCP, derivaciones STEM profundas | no disponible | no disponible |
| `easylm-bonsai-2-27b` | 6 GB | Referencia de la familia, ternario de 1,58 bits con torre de visión | 262.144 tokens (declarado) | no disponible |

No se dispone de datos para comparar con alternativas de otros autores (por ejemplo, adaptadores LoRA de propósito similar sobre bases de 3-4B) ni métricas que permitan situar este adaptador frente a ellos.

## Limitaciones y advertencias

- Corpus de entrenamiento muy pequeño: 498 turnos en `adapter_personalities_chatml.jsonl`. Es plausible un sobreajuste a los estilos concretos del dataset y una generalización limitada fuera de ellos.
- Ausencia total de evaluación: cero benchmarks, cero descargas y cero likes en el momento de la ficha; no hay evidencia independiente de calidad.
- Ambigüedad sobre el modelo base: la model card cita simultáneamente una base ternaria GGUF y una base MLC derivada de Qwen3.5-4B sin explicar la relación. Esto afecta a la reproducibilidad y a la licencia aplicable en la práctica.
- Licencia AGPL-3.0: licencia copyleft fuerte. El uso comercial es posible, pero cualquier servicio en red que incorpore el modelo obliga a liberar el código fuente correspondiente; conviene revisión legal antes de integrarlo en un producto.
- Cuantización ternaria de 1,58 bits: la compresión agresiva de la base implica pérdida de precisión frente a un modelo en FP16/BF16. No hay medición publicada de esa degradación.
- Riesgo de alucinación: un adaptador de 4,2 MB no puede incorporar de forma fiable 4.634 filas de hechos y 92 "stacks" académicos; es esperable que las citas y cifras concretas se generen de forma plausible pero incorrecta. Verificar cualquier dato cuantitativo contra la fuente primaria.
- Idiomas no declarados: no hay garantía de calidad en castellano ni en ningún otro idioma distinto del inglés implícito en el dataset ChatML.
- Contexto declarado de 262.144 tokens sin validación: no se documenta si la base ternaria mantiene coherencia en longitudes largas ni cuánta memoria adicional requiere la caché KV.
- Contenido idiosincrásico: las "151 voces del Council of Kami", la capa socrática y el "why-ledger" son construcciones propias del autor sin validación externa; su comportamiento efectivo puede diferir del descrito.
- Sesgos: no documentados. Al no describirse la composición demográfica ni la procedencia del corpus, no es posible evaluar sesgos de género, culturales o políticos.
- Fecha de publicación en 2026 y repositorio con tamaño reportado de 0.0 GB: conviene verificar la integridad de los ficheros antes de cualquier despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Bluebarrels/easylm-personalities-bonsai-2-4b
- Modelo base ternario GGUF: https://huggingface.co/prism-ml/Ternary-Bonsai-2-4B-gguf
- Base WebGPU / MLC citada en la model card: https://huggingface.co/mlc-ai/Qwen3.5-4B-q4f16_1-MLC
- Dataset de entrenamiento: https://huggingface.co/datasets/Bluebarrels/easylm-training-corpus

Nota: las búsquedas web realizadas no devolvieron ningún resultado relevante sobre este modelo; los dominios encontrados eran agregadores de contenido para adultos sin relación alguna con el artefacto, por lo que se han descartado. No se dispone de paper, blog técnico, repositorio de código ni demo adicionales.
