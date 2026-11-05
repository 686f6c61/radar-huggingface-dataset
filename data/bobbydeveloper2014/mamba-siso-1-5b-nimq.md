# bobbydeveloper2014/mamba-siso-1.5b-nimq

## Resumen

Mamba-3 SISO 1.5B es un checkpoint cuantizado del modelo Mamba-3 en su variante SISO (single-input single-output), empaquetado en el formato propietario NIMQ del framework Nimformers. Lo publica el usuario bobbydeveloper2014 en Hugging Face y va acompañado de un ajuste fino de tipo LoRA/Linear++ (denominado `lora-g1.bin`) que añade un bloque Mamba-3 con una rama gated Linear++ en la capa final. El repositorio ocupa aproximadamente 2,0 GB e incluye los pesos base en FP4-KM, el checkpoint LoRA en NIMBIN4, la configuración y el tokenizer.

El modelo se apoya en la arquitectura Mamba, una familia de modelos de espacio de estados (SSM) selectivos que prescinde del mecanismo de atención clásico y ofrece complejidad lineal respecto a la longitud de secuencia. La ficha técnica indica 24 capas, dimensión oculta de 2048, 64 cabezas y un tamaño de estado de 128, lo que encaja con un modelo de aproximadamente 1,5 mil millones de parámetros. La relevancia de esta publicación es limitada pero concreta: sirve como ejemplo de despliegue de un SSM cuantizado en un formato no estándar (NIMQ) dentro de un framework propio (Nimformers), no como un modelo listo para producción general.

La información pública es muy escasa: no se declara licencia, no se especifican idiomas soportados, no hay resultados de benchmarks ni una model card detallada sobre el dataset de entrenamiento. El repositorio tiene cero descargas y cero likes en el momento de la consulta, y el modelo base upstream aparece vacío en la propia model card. Cualquier evaluación rigurosa debe hacerse, por tanto, con cautela y verificando directamente los artefactos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba-3 (SSM selectivo), variante SISO, con bloque LoRA/Linear++ gated en la capa final |
| Parametros totales | ~1,5 mil millones (según el nombre del checkpoint; no se detalla el recuento exacto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP4-KM (pesos base) y NIMBIN4 (checkpoint LoRA) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | NIMQ (base, `.nimq`) y NIMBIN4 (LoRA, `.bin`); incluye `config.json` y tokenizer JSON |

## Arquitectura y entrenamiento

La arquitectura es un modelo de espacio de estados de la familia Mamba, en concreto Mamba-3 en variante SISO. Según la model card, consta de 24 capas con dimensión oculta 2048, 64 cabezas y tamaño de estado 128. El checkpoint base se distribuye cuantizado en FP4-KM, un esquema de cuantización a 4 bits propio del ecosistema Nimformers, y se acompaña de un ajuste fino LoRA/Linear++ en formato NIMBIN4. La nomenclatura `R` y `G` del checkpoint LoRA distingue los bloques Mamba-3 preentrenados (`R`) del bloque gated Linear++ (`G`) añadido en la capa final.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste por instrucciones. La model card tampoco documenta innovaciones adicionales como decodificación especulativa o atención lineal más allá de lo implícito en la propia arquitectura SSM. El modelo base upstream no se identifica en el texto (el campo aparece vacío), lo que impide trazar el linaje exacto del checkpoint.

## Capacidades

- Generación de texto autoregresiva, según la etiqueta `text-generation` del pipeline.
- Procesamiento de secuencias con complejidad lineal gracias a la arquitectura SSM, potencialmente ventajoso en contextos largos.
- Ajuste fino específico mediante LoRA/Linear++ con un bloque gated en la capa final, orientado a adaptar el modelo base a una tarea concreta (no se especifica cuál).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Investigación sobre arquitecturas SSM: el checkpoint permite experimentar con Mamba-3 en un entorno controlado (Nimformers) para comparar el comportamiento de un SSM cuantizado frente a transformers de tamaño similar en tareas de generación de texto.
- Pruebas de cuantización a 4 bits: útil para estudiar el impacto de FP4-KM y NIMBIN4 en la calidad de generación y en el uso de memoria, dado que el repositorio incluye tanto pesos base como LoRA en formatos de baja precisión.
- Evaluación de ajustes LoRA/Linear++: el bloque gated `G` en la capa final permite analizar cómo un adaptador ligero modifica el comportamiento del modelo base sin reentrenar los 1,5B parámetros.
- Desarrollo de pipelines con el framework Nimformers: sirve como caso de referencia para integrar la CLI de inferencia (`make -f test/mamba3/Makefile infer`) y el layout local de modelos (`test/mamba3/models`).
- Prototipado de generación de texto en entornos con recursos limitados: con ~1,5B parámetros y cuantización a 4 bits, el modelo puede caber en GPUs de consumo, lo que facilita pruebas locales de generación.
- Estudio de tokenizers y sidecars: el repositorio incluye `tokenizer.json`, `tokenizer_config.json` y `special_tokens_map.json`, útiles para analizar la configuración de tokenización asociada a un SSM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo de ~1,5B parámetros en FP4 ocuparía del orden de 1 GB para los pesos, más overhead de activaciones y estado; el repositorio completo pesa 2,0 GB.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs de consumo con al menos 4-6 GB de VRAM, pero no hay confirmación del autor.
- ¿Cabe en consumer GPU? Probablemente sí en GPUs con 6 GB o más, aunque no está verificado ni documentado.
- Opciones de despliegue: únicamente el framework Nimformers (CLI propia y Makefile). No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Mamba-3 SISO 1.5B (este) | ~1,5B | no disponible | no disponible | NIMQ / NIMBIN4 | Hugging Face, 0 descargas |
| Mamba-2 / Mamba original (referencia de la familia SSM) | variable (130M-2.8B) | no disponible en esta ficha | Apache 2.0 en versiones públicas | safetensors, GGUF | Amplia |
| Transformers de ~1,5B (p. ej. Qwen2.5-1.5B, SmolLM2-1.7B) | 1,5-1,7B | 32K-128K según modelo | Apache 2.0 / otras | safetensors, GGUF | Amplia, con benchmarks públicos |

La comparación directa es limitada: no hay datos de rendimiento del modelo analizado ni una licencia declarada, y su formato propietario reduce la interoperabilidad frente a las alternativas estándar.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Idiomas no especificados: se desconoce si el modelo está entrenado principalmente en inglés u otros idiomas.
- Sin benchmarks ni evaluación pública: no hay evidencia de calidad en tareas estándar (MMLU, HumanEval, GSM8K).
- Formato propietario NIMQ/NIMBIN4: requiere el framework Nimformers y no es compatible con herramientas estándar como llama.cpp, vLLM u Ollama.
- Modelo base upstream no identificado: la model card deja vacío el campo del modelo de origen, lo que dificulta la trazabilidad y la reproducibilidad.
- Riesgo de alucinación: inherente a los modelos generativos; no hay evaluación específica para este checkpoint.
- Sesgos: no documentados; al no conocerse el dataset de entrenamiento, no se pueden evaluar sesgos de género, raza o idioma.
- Contexto máximo no documentado: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Repositorio con cero descargas y cero likes: sin validación comunitaria ni reportes de uso.
- Fecha de creación futura (2026-11-05): conviene verificar la integridad y procedencia de los artefactos antes de usarlos.

## Enlaces

- [Hugging Face: bobbydeveloper2014/mamba-siso-1.5b-nimq](https://huggingface.co/bobbydeveloper2014/mamba-siso-1.5b-nimq)
- [Nimformers Framework (GitHub)](https://github.com/bobbyshop-vui/nimformers-framework)
