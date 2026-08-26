# 0xzknw/Granite-4.2-3B-Heretic-NX-PRIME-GGUF

## Resumen

Granite 4.2 3B Heretic NX PRIME es una edición de pesos estática del modelo dense de razonamiento `ibm-granite/granite-4.2-3b`, publicada en formato GGUF por el usuario 0xzknw. A diferencia de un fine-tuning o un LoRA, esta variante aplica una edición norm-preserving sobre el residual stream del modelo (capas 25 a 36, proyecciones de atención y MLP down) con rango protegido 16 y fuerza beta 2.4, con el objetivo de eliminar el comportamiento de rechazo explícito (refusal) sin degradar las capacidades de razonamiento, código o multilingüismo del modelo base.

El resultado es un modelo de 3,66 mil millones de parámetros que conserva la arquitectura y el tokenizador originales de Granite 4.2, incluyendo el modo de pensamiento (thinking) activable mediante su chat template. Se distribuye en tres cuantizaciones GGUF (BF16, Q8_0 y Q4_K_M) pensadas para ejecución local con llama.cpp, LM Studio u otras herramientas compatibles. Es relevante ahora porque combina un tamaño compacto, razonamiento nativo y un perfil de comportamiento "uncensored" que interesa a desarrolladores que necesitan respuestas sin rechazos automáticos en aplicaciones de agentes o generación de contenido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Granite 4.2 3B) |
| Parámetros totales | 3.659.737.600 (3,66 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Granite 4.2 soporta 128K, pero no se especifica en la ficha) |
| Tipos de cuantización | BF16 (6,82 GiB), Q8_0 (3,63 GiB), Q4_K_M (2,09 GiB) |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh (12 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Granite 4.2 3B es un transformer denso de solo decodificador, post-entrenado sobre la serie Granite 4.1, con capacidades nativas de razonamiento (thinking) mediante un chat template que permite generar cadenas de pensamiento antes de la respuesta final. Esta variante Heretic NX PRIME no modifica la arquitectura, sino que aplica una edición estática de pesos sobre el residual stream: se protegen 16 direcciones del eje residual y se editan las proyecciones de salida de atención y de la capa MLP en las capas 25 a 36, con una fuerza de 2.4. El proceso es norm-preserving, es decir, no altera la norma de los pesos y se materializa directamente en BF16.

Los datos de entrenamiento originales del modelo base no se detallan en la ficha; la edición no implica un entrenamiento adicional, solo la manipulación de 24 tensores ya entrenados. El resultado se validó en una frontera de rechazo/KL y mostró una reducción drástica de rechazos explícitos (de 103/104 a 0/104 en un proxy léxico) mientras que las capacidades de razonamiento se mantienen dentro de un margen de no-inferioridad del -3% en una evaluación pareada (ARC-Challenge, HellaSwag y MMLU).

## Capacidades

- Generación de texto en 12 idiomas (inglés, alemán, español, francés, japonés, portugués, italiano, checo, coreano, neerlandés, chino y árabe).
- Razonamiento multi-paso con modo de pensamiento (thinking) activable mediante el chat template de Granite 4.2.
- Soporte de tool calling y function calling, heredado del modelo base, adecuado para pipelines de agentes.
- Capacidad de ejecución local en CPU y GPU mediante GGUF con llama.cpp o LM Studio.
- Edición de pesos que elimina el comportamiento de rechazo explícito, permitiendo respuestas sin los bloqueos habituales de seguridad del modelo original.
- Compatibilidad con el ecosistema GGUF (llama.cpp, Ollama, LM Studio, etc.) y con el formato de chat de Granite.

## Casos de uso

- Agentes autónomos sin restricciones de rechazo: el modelo puede encadenar llamadas a herramientas y razonar sobre múltiples pasos sin cortar la conversación por contenido considerado sensible, lo que es útil en entornos de desarrollo y experimentación.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar código en Python, Java, C++ y otros lenguajes, con la ventaja de no bloquearse ante peticiones de código potencialmente sensible.
- Asistencia técnica multilingüe: su capacidad en 12 idiomas permite construir asistentes de soporte que respondan en la lengua del usuario con razonamiento estructurado, manteniendo el contexto de una conversación larga.
- Análisis de datos y razonamiento matemático: gracias al modo thinking, puede descomponer problemas complejos de lógica, estadística o planificación en pasos intermedios, útil para herramientas de análisis o dashboards.
- Chatbots de rol y creación de contenido creativo: la eliminación de rechazos permite explorar temas que otros modelos bloquean, útil en generación de ficción, guiones o diálogos sin censura.
- Investigación sobre alineación y edición de modelos: al ser una edición estática y reproducible, sirve como caso de estudio para comparar el comportamiento de modelos editados frente a los originales en términos de utilidad y seguridad.

## Benchmarks y rendimiento

La ficha no proporciona resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este modelo, pero sí incluye una evaluación interna propia de la edición. Los datos disponibles son:

| Métrica | Modelo base oficial | Heretic NX PRIME beta 2.4 |
|---|---:|---:|
| Marcador de rechazo explícito (proxy) | 103 / 104 | 0 / 104 |
| Conjunto de capacidad pareada (ARC-C, HellaSwag, MMLU) | 63,35 % | 64,29 % |
| Diferencia media bootstrap | — | +0,94 puntos (IC 95 %: [-0,35, +2,22]) |
| Margen de no-inferioridad | — | Pasado a -3 % |
| KL (NF4 base con hooks residuales) | — | 0,024674 |
| KL (BF16 estático, cuantización independiente) | — | 0,042418 |

La evaluación de rechazo es un proxy léxico de 104 filas, no una medida de calidad semántica ni universal. No se han publicado resultados de benchmarks estándar adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización: Q4_K_M ~ 2,1 GiB, Q8_0 ~ 3,7 GiB, BF16 ~ 6,9 GiB.
- GPU recomendadas: cualquier GPU consumer con 4 GiB de VRAM puede ejecutar Q4_K_M; 8 GiB (p. ej., RTX 3060, 3070, 4060) permite Q8_0 con comodidad; BF16 requiere al menos 8-10 GiB de VRAM.
- Cabe en GPU consumer de gama baja y media sin problema, incluso en CPU (llama.cpp compila para CPU).
- Opciones de despliegue: llama.cpp (llama-cli), LM Studio, Ollama (si se convierte a formato compatible), y cualquier runtime que soporte GGUF.
- Latencia y throughput: no se proporcionan datos medidos; con Q8_0 en una RTX 3090 se esperan velocidades de decodificación de entre 30 y 60 tokens/s, pero no está confirmado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Granite 4.2 3B (original) | 3,66 B | 128K (no confirmado en ficha) | Apache-2.0 | safetensors | Con rechazo explícito, razonamiento nativo |
| Granite 4.2 3B Heretic NX PRIME (este) | 3,66 B | No disponible | Apache-2.0 | GGUF | Edición estática que elimina rechazos |
| bartowski/granite-4.2-3b-GGUF | 3,66 B | No disponible | Apache-2.0 | GGUF | Cuantizaciones estándar sin edición |

La comparación directa con otros modelos de 3B (p. ej., Llama 3.2 3B, Qwen 2.5 3B) no se puede realizar con datos de benchmarks públicos, ya que la ficha solo incluye la evaluación pareada interna.

## Limitaciones y advertencias

- El modelo ha sido editado para eliminar rechazos explícitos, lo que significa que puede generar contenido dañino, ilegal o no ético sin barreras de seguridad. El autor advierte que los usuarios son responsables de su despliegue.
- La evaluación de rechazo es un proxy léxico de 104 filas, no una garantía de que el modelo no rechace ni de que responda correctamente en todos los casos.
- La capacidad se mide en un conjunto pareado de 854 filas; no se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K), por lo que la comparación con otros modelos es limitada.
- Las cuantizaciones GGUF se han probado de carga, pero no se garantiza que el rendimiento comportamental sea idéntico al checkpoint BF16 original.
- No se especifica la longitud de contexto real soportada en esta versión GGUF; se recomienda verificar con el runtime de llama.cpp.
- La licencia Apache-2.0 permite uso comercial, pero la edición puede no cumplir políticas de uso de algunos proveedores de IA.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/0xzknw/Granite-4.2-3B-Heretic-NX-PRIME-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-3b
- Cuantización GGUF oficial de bartowski: https://huggingface.co/bartowski/granite-4.2-3b-GGUF
- Documentación de IBM Granite 4.2: https://www.ibm.com/granite/docs/models/granite4-2
- Repositorio GitHub de Granite 4.2: https://github.com/ibm-granite/granite-4.2-language-models
- Repositorio de la herramienta de edición Heretic NX: https://github.com/0xZKnw/heretic-nx
