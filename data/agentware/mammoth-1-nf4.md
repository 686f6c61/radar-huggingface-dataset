# Agentware/mammoth-1-nf4

## Resumen

Mammoth-1 NF4 es una cuantización independiente en 4 bits (NF4) del modelo `baselabs/mammoth-1`, publicada por Agentware. No se trata de un modelo de chat generalista, sino de un checkpoint especializado en toma de decisiones (decision-model) que emite respuestas estructuradas a preguntas tipadas sobre un estado de entrada. El artefacto está congelado sobre la revisión `61cec44c281c693992e3d6ebeb44dd3402dfa186` del modelo base y conserva su licencia MIT.

El modelo base emplea una arquitectura híbrida de atención (atención completa bidireccional por bloques combinada con atención lineal recurrente) sobre un backbone de la familia Qwen 3.5, con 26.895.998.464 parámetros totales según los pesos en safetensors. La cuantización reduce el peso a unos 19,90 GiB distribuidos en 400 módulos `Linear4bit` en NF4 sin cuantización anidada, manteniendo en BF16 las proyecciones protegidas y en FP32 la cabeza LM no atada.

Su relevancia es acotada pero clara: demuestra que es posible servir un modelo de decisión de ~27B en 4 bits sobre una única GPU A100 de 80 GB con pérdida limitada en tareas de clasificación y razonamiento, si bien requiere un runtime parcheado específico (OneJev) y un adaptador propio, y no es compatible con vLLM, Ollama, llama.cpp ni entradas de imagen. Es un artefacto experimental, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención completa bidireccional por bloques y atención lineal recurrente; backbone `qwen3_5_text`; 400 módulos `Linear4bit` |
| Parametros totales | 26.895.998.464 |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | 16.384 tokens por rama/petición (límite impuesto por el adaptador) |
| Tipos de cuantizacion | NF4 de 4 bits (sin cuantización anidada ni doble), cómputo en BF16; embeddings de entrada, 96 proyecciones a/b y 48 convoluciones recurrentes protegidas en BF16; cabeza LM no atada en FP32 |
| Idiomas soportados | en |
| Licencia | MIT (modelo base); términos Apache-2.0 retenidos para Qwen y OneJev |
| Formato de pesos | safetensors (21.365.125.640 bytes, ~19,90 GiB); no es GGUF |

## Arquitectura y entrenamiento

El modelo base combina dos mecanismos de atención: atención completa bidireccional por bloques y atención lineal recurrente, con 48 convoluciones recurrentes preservadas en BF16 tras la cuantización. La lectura de salida se realiza mediante una cabeza `slot_lm` no causal en FP32, y el adaptador limita cada rama y petición a 16.384 tokens. La cuantización afecta a 400 módulos lineales convertidos a `Linear4bit` en NF4, mientras que las proyecciones de atención protegidas y las convoluciones se mantienen en BF16 para preservar el comportamiento del modelo original.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. El artefacto se exportó con torch 2.11.0+cu130, transformers 5.19.0, bitsandbytes 0.50.2, accelerate 1.15.0 y safetensors 0.8.0. La ejecución requiere el runtime OneJev en la revisión `81ce62f1597c91e46767d4d02d6ac2e18534fe94` con `serve.patch`, que proporciona `qev.engine`; el motor upstream `engine.baselabs.py` se conserva solo por atribución y no sustituye al adaptador NF4.

## Capacidades

- Toma de decisiones estructurada: responde a preguntas tipadas (por ejemplo, tipo `noul` con instrucciones) sobre un estado textual de entrada, devolviendo respuestas en un esquema definido.
- Clasificación de intenciones y texto: pipeline declarado `text-classification`, con resultados en tareas como BANKING77 y CLINC150.
- Razonamiento de opción fija: rendimiento medido en BBH con 23 tareas de opción fija y en MMLU-Pro.
- Evaluación de cuándo invocar herramientas: tarea When2Call en formato de elección múltiple (no ejecución real de herramientas).
- Procesamiento exclusivamente de texto: no admite entradas de imagen ni audio.
- Idioma: únicamente inglés.
- No soporta tool calling en sentido operativo, ni agentes multi-paso, ni modo thinking, según las limitaciones declaradas por el autor.

## Casos de uso

- Enrutamiento de peticiones en atención al cliente: dado un mensaje de usuario, el modelo responde a preguntas tipadas como "¿se solicita un reembolso?" o "¿es una queja?", lo que permite clasificar y dirigir el ticket al flujo adecuado con hasta 16.384 tokens de contexto por rama.
- Clasificación de intenciones en asistentes conversacionales: los resultados en BANKING77 (93,68% macro-F1) y CLINC150+OOS (97,54% macro-F1) lo hacen adecuado para etiquetar consultas bancarias y de dominio abierto con clases fuera de alcance.
- Filtrado previo a la invocación de herramientas: la tarea When2Call evalúa si conviene llamar a una herramienta, lo que permite usarlo como guardián antes de ejecutar acciones costosas o irreversibles.
- Evaluación de razonamiento en pipelines internos: con 74,40% en MMLU-Pro y 96,06% en BBH de opción fija, sirve como componente de decisión en flujos de evaluación controlados donde las respuestas son opciones cerradas.
- Investigación sobre cuantización: al publicar hashes, manifiesto y auditoría NF4, permite estudiar la degradación de un modelo de decisión de ~27B al pasar a 4 bits en una A100 de 80 GB.
- Prototipado de sistemas de decisión con esquema estricto: la API `SystemOneRequest` con preguntas tipadas facilita integrar el modelo en servicios que requieren salidas estructuradas y verificables, siempre sobre un entorno CUDA aislado.

## Benchmarks y rendimiento

Resultados históricos congelados el 2026-11-01 sobre NVIDIA A100-SXM4-80GB, ejecución NF4. Cobertura parcial: 26.905 de 29.771 peticiones.

| Tarea | Completadas / objetivo | Métrica | Puntuación NF4 (%) |
|---|---:|---|---:|
| BANKING77 | 3.080 / 3.080 | macro-F1 | 93,68 |
| CLINC150+OOS | 5.500 / 5.500 | macro-F1 | 97,54 |
| MMLU-Pro | 12.032 / 12.032 | accuracy | 74,40 |
| BBH (23 tareas de opción fija) | 5.507 / 5.507 | accuracy | 96,06 |
| When2Call (MCQ) | 786 / 3.652 | accuracy | no completada; sin puntuación de tarea completa |

No se declara puntuación agregada de Decision Index. Los resultados BF16 publicados por el autor upstream son referencias externas y no constituyen un control con el mismo motor, por lo que no permiten aislar la pérdida por cuantización.

## Requisitos de hardware

- VRAM estimada: el peso ocupa unos 19,90 GiB; el almacenamiento no equivale a VRAM requerida. El adaptador no admite offload a CPU ni a disco, por lo que todo el modelo debe residir en una única GPU CUDA.
- GPU validadas históricamente: NVIDIA A100-SXM4-80GB. El manifiesto conserva etiquetas de procedencia como "not GPU validated", cero forwards y "requires L4 reload"; los resultados en A100 no certifican L4, GPUs físicas de 16 GB, CPU ni GPUs AMD.
- GPU de consumo: no disponible; no hay validación publicada en RTX 4090 u otras consumer.
- Despliegue: exclusivamente mediante el adaptador `mammoth_nf4_adapter.py` y el runtime OneJev parcheado. No validado con vLLM, Ollama, llama.cpp ni TGI.
- Latencia y throughput: no disponibles; la publicación solo incluye comprobaciones de integridad y estáticas, no pruebas nuevas de inferencia CUDA, calibración de probabilidades ni rendimiento.
- Requisitos de ejecución: `setup.sh` debe ejecutarse en un entorno Python/CUDA aislado y limpio, con directorio de trabajo vacío; la carga debe hacerse en un solo hilo porque el cargador modifica temporalmente atributos de clase globales del proceso y verifica el hash de los 21,37 GB de pesos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Despliegue |
|---|---|---|---|---|---|
| Agentware/mammoth-1-nf4 | 26,9B | 16.384 tokens por rama | NF4 4 bits | MIT | Adaptador propio + OneJev |
| baselabs/mammoth-1 (upstream) | no disponible en la información | no disponible | BF16 | MIT | Runtime upstream |
| Alternativas generalistas de ~27B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables de terceros en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- No es un modelo de chat general: es un checkpoint de decisión especializado; la generación genérica no está validada.
- Solo texto e inglés; no admite imágenes ni otros idiomas.
- Contexto limitado a 16.384 tokens por rama y petición por el adaptador.
- Requiere el adaptador y el runtime OneJev parcheado; no funciona con vLLM, Ollama, llama.cpp ni TGI.
- Ejecución en un único dispositivo CUDA, sin offload a CPU o disco; no validado en GPUs de consumo, L4, CPU ni AMD.
- La evaluación es parcial: When2Call no se completó y no hay puntuación agregada; no se aisló la pérdida por cuantización frente a BF16 con el mismo motor.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un modelo de decisión con salidas tipadas, el riesgo se traslada a clasificaciones erróneas.
- Artefacto experimental con etiquetas de procedencia que indican ausencia de validación en GPU en el momento de la exportación.
- Licencia MIT del modelo base, con términos Apache-2.0 retenidos para Qwen y OneJev; se requiere revisar `NOTICE.md`. No se implica respaldo de Base Labs, Baseten, Qwen ni de los autores del runtime.
- `setup.sh` modifica un checkout del runtime e instala dependencias: debe ejecutarse solo en entornos aislados y limpios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Agentware/mammoth-1-nf4
- Modelo base: https://huggingface.co/baselabs/mammoth-1
- Revisión del modelo base: `61cec44c281c693992e3d6ebeb44dd3402dfa186`
- Runtime OneJev (revisión fijada): `81ce62f1597c91e46767d4d02d6ac2e18534fe94`
- Hash SHA-256 de pesos: `12138a8645f3c831b68e47702383dd03b84cad4ea6af6058e1f9b164e96291dc`
- Archivos de verificación en el repositorio: `artifact_manifest.json`, `nf4_audit.json`, `SHA256SUMS`, `constraints.txt`, `NOTICE.md`, `setup.sh`
