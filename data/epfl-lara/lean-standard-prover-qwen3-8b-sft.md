# EPFL-LARA/lean-standard-prover-qwen3-8b-sft

## Resumen

Lean Standard Prover Qwen3-8B es un modelo de generación de demostraciones formales en Lean 4 desarrollado por EPFL-LARA (Laboratorio de Razonamiento y Análisis Automatizados de la EPFL, Lausana). Se trata de un ajuste fino del modelo base Qwen/Qwen3-8B-Base, con 8.190.735.360 parámetros, que recibe un enunciado de teorema con sus importaciones y contexto (terminado en `by sorry`) y devuelve una demostración completa dentro de un bloque de código `lean4`.

El modelo resuelve el problema de la prueba automática de teoremas en el ecosistema Lean 4/Mathlib mediante un formato de respuesta "standard prover": el prompt se redacta en inglés y la salida combina texto explicativo con código Lean verificable. El runner oficial trabaja con una ventana total de 32.768 tokens y recomienda usar el último bloque de código Lean completo como candidato final para su verificación.

Es relevante porque forma parte de la colección "Formal Theorem Proving with Lean World Models" de EPFL-LARA y se publica etiquetado como "Paper model: S8", en la fase previa al ajuste con GRPO (es decir, es un punto de control intermedio del pipeline, útil como referencia antes del refuerzo con recompensa verificable). Su licencia es "other" y solo declara inglés como idioma; no se han publicado resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso de la familia Qwen3; ajuste fino de Qwen/Qwen3-8B-Base (no es MoE) |
| Parámetros totales | 8.190.735.360 (≈8,19 mil millones) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 32.768 tokens en total (prompt + salida), según el runner del autor |
| Tipos de cuantización | No especificados por el autor; el repositorio publica pesos en safetensors (16,4 GB, coherente con bf16) |
| Idiomas soportados | Inglés (`en`) para el prompt; la salida es código Lean 4 |
| Licencia | `other` (la model card no detalla los términos) |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-8B-Base (relación: finetune) |
| Datasets de entrenamiento | EPFL-LARA/lean-world-model-cpt, EPFL-LARA/lean-world-model-sft |
| Etapa de entrenamiento | SFT, previa a GRPO ("Paper model: S8 · Stage: Before GRPO") |
| Librería y pipeline | transformers; text-generation |
| Tamaño del repositorio | 16,4 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-8B-Base, un transformer decoder-only denso de aproximadamente 8,19 mil millones de parámetros. El ajuste se ha realizado sobre dos conjuntos de datos publicados por el propio grupo: EPFL-LARA/lean-world-model-cpt (fase de preentrenamiento continuado, por las siglas CPT) y EPFL-LARA/lean-world-model-sft (fase de ajuste supervisado). La model card no detalla el número de tokens, la composición del dataset ni la proporción de ejemplos de Mathlib, por lo que esos datos no están disponibles.

No se documenta en la información proporcionada el uso de RLHF, DPO ni GRPO en esta versión: de hecho, el autor etiqueta explícitamente el modelo como "Stage: Before GRPO", lo que indica que esta es la instantánea previa al entrenamiento con recompensa verificable y que existe (o existirá) una variante posterior dentro de la misma serie. La innovación principal no está en la arquitectura, sino en el protocolo de inferencia: un prompt plantilla fijo en inglés, tokenización directa con `add_special_tokens=False`, ventana total de 32.768 tokens y extracción determinista del último bloque `lean4` completo de la respuesta para su verificación con Lean.

## Capacidades

- Generación de demostraciones completas en Lean 4 a partir de un enunciado de teorema con sus importaciones y contexto, sustituyendo las declaraciones `sorry`.
- Salida en formato estructurado: bloque de código `lean4` delimitado, acompañado de texto explicativo o comentarios dentro del propio código.
- Muestreo múltiple para búsqueda tipo best-of-n: el runner admite generar hasta 32 candidatos por problema, con ajuste de temperatura (0,3 para una muestra; 0,7 para 32 muestras) y top-p 0,95.
- Trabajo sobre proyectos con dependencias reales, incluido Mathlib, ya que el prompt se construye a partir del fichero `.lean` que se le pasa.
- Generación de código Lean 4 verificable, no solo lenguaje natural: la salida está pensada para pasar por el verificador de Lean.
- Integración con vLLM 0.12.0 y compatibilidad declarada con text-generation-inference y endpoints compatibles (tags `text-generation-inference` y `endpoints_compatible`).
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito ("thinking mode") en la información disponible.
- Capacidad multilingüe: no disponible; solo se declara inglés como idioma soportado.

## Casos de uso

- Autocompletado de demostraciones en el IDE: dado un fichero `.lean` con un teorema terminado en `by sorry`, el modelo devuelve una prueba candidata que el usuario puede pegar y verificar con Lean. Es adecuado porque consume el fichero real con sus importaciones como entrada.
- Búsqueda de pruebas por muestreo múltiple: lanzar 32 generaciones con temperatura 0,7 y seleccionar la primera que Lean acepte. El flujo está soportado de forma nativa por el runner del autor (`--samples 32`).
- Verificación formal en pipelines de CI/CD: ejecutar el runner como paso automático que propone pruebas para teoremas marcados como `sorry` y valida el resultado con Lean antes de aceptar el cambio.
- Reparación de pruebas tras cambios en dependencias: cuando una actualización de Mathlib rompe una demostración existente, se puede reformular el enunciado como `by sorry` y pedir al modelo una nueva versión compatible.
- Generación de datos sintéticos de pruebas formales: producir pares (enunciado, demostración verificada) para entrenar o evaluar otros modelos de prueba de teoremas, filtrando por verificación con Lean.
- Apoyo docente en cursos de matemáticas formales: el modelo devuelve código con comentarios explicativos, lo que permite mostrar no solo la prueba, sino una traza de los pasos de razonamiento en Lean 4.
- Línea base de investigación para RL con recompensa verificable: al ser la instantánea "Before GRPO", sirve para medir la mejora atribuible al entrenamiento con refuerzo dentro de la serie S de EPFL-LARA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas específicas de prueba de teoremas (por ejemplo, tasas de éxito por problema en MiniF2F o ProofNet). Tampoco se documentan latencias ni throughput medidos. La única referencia es la colección "Formal Theorem Proving with Lean World Models", donde podrían aparecer los resultados del artículo asociado, pero esos datos no forman parte de la información proporcionada.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan unos 16,4 GB en safetensors (coherente con bf16). A esa cifra hay que añadir la caché KV: con una ventana completa de 32.768 tokens, la estimación razonable se sitúa en el rango de 22 a 26 GB en bf16. En cuantización de 8 bits los pesos bajan a unos 9 GB y en 4 bits a unos 5 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: A100 40/80 GB y H100 para uso con contexto completo y lotes grandes; A6000 48 GB como alternativa. La model card solo indica que vLLM "se ejecuta en una GPU soportada".
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede alojar el modelo en bf16, pero con poco margen para el contexto completo de 32.768 tokens; con cuantización de 4 u 8 bits cabe con holgura en tarjetas de 12-16 GB (por ejemplo, RTX 4080, RTX 4070 Ti Super).
- Opciones de despliegue: vLLM 0.12.0 es la opción documentada por el autor mediante `inference.py`; se declara compatibilidad con text-generation-inference y con endpoints compatibles; transformers es la librería base. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, formato que no se publica en el repositorio.
- Latencia y throughput: no disponibles. El único dato operativo es el ajuste de decodificación recomendado (temperatura 0,3 para una muestra y 0,7 para 32 muestras, con top-p 0,95) y que los tokens de salida deben caber en el contexto restante tras el prompt del problema.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| EPFL-LARA/lean-standard-prover-qwen3-8b-sft | 8,19 mil millones (denso) | 32.768 tokens | `other` | Pesos safetensors en HuggingFace | Fase SFT previa a GRPO; solo inglés; salida en Lean 4 |
| Qwen/Qwen3-8B-Base | 8,19 mil millones (denso) | no disponible en la información proporcionada | no disponible en la información proporcionada | HuggingFace | Modelo base sin ajuste para Lean; no genera demostraciones de forma fiable |
| Otros demostradores de Lean 4 de tamaño similar | no disponible | no disponible | no disponible | no disponible | Existen alternativas en el ecosistema de prueba formal de teoremas, pero no hay datos comparativos en la información proporcionada |

No se dispone de cifras de rendimiento comparadas con otras alternativas, por lo que la comparación cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Licencia `other` sin términos detallados: antes de cualquier uso comercial es imprescindible revisar el repositorio y, por herencia, las condiciones de Qwen/Qwen3-8B-Base. La model card no aclara si se permite uso comercial.
- Riesgo de alucinación inherente a la generación de código: el modelo puede producir tácticas inexistentes, lemas mal referenciados o importaciones inválidas. El flujo de trabajo del propio autor asume verificación con Lean, de modo que ninguna salida debe darse por válida sin pasar por el verificador.
- Ventana compartida de 32.768 tokens: el prompt (con las importaciones y el contexto del fichero) y la demostración generada compiten por el mismo presupuesto. Proyectos con importaciones pesadas de Mathlib reducen drásticamente el espacio disponible para la prueba.
- Formato de respuesta estricto: la extracción se basa en el último bloque `lean4` completo de la respuesta. Respuestas con varios bloques o bloques truncados pueden dar lugar a candidatos inválidos.
- Idioma: solo se declara inglés para el prompt. No hay evidencia de soporte para instrucciones en castellano ni para otros asistentes de pruebas distintos de Lean 4.
- No es la versión final de la serie: está marcado como "Stage: Before GRPO", por lo que su rendimiento debería ser inferior al de la variante posterior del pipeline de EPFL-LARA.
- Sesgos conocidos: no disponibles. La model card no incluye ninguna sección de sesgos, evaluación de seguridad ni análisis de dominios matemáticos cubiertos.
- Madurez: el modelo presenta 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación por parte de la comunidad y de informes de uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EPFL-LARA/lean-standard-prover-qwen3-8b-sft
- Colección "Formal Theorem Proving with Lean World Models": https://huggingface.co/collections/EPFL-LARA/formal-theorem-proving-with-lean-world-models-6ad2b4aa4400b3e2933f380d
- Modelo base Qwen3-8B-Base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Dataset EPFL-LARA/lean-world-model-cpt: https://huggingface.co/datasets/EPFL-LARA/lean-world-model-cpt
- Dataset EPFL-LARA/lean-world-model-sft: https://huggingface.co/datasets/EPFL-LARA/lean-world-model-sft
- EPFL (institución): https://www.epfl.ch/en/
- EPFL en Wikipedia: https://en.wikipedia.org/wiki/%C3%89cole_Polytechnique_F%C3%A9d%C3%A9rale_de_Lausanne
- vLLM (dependencia indicada por el autor, versión 0.12.0): https://github.com/vllm-project/vllm
- Lean 4: https://lean-lang.org/
- Mathlib (comunidad Lean Prover): https://leanprover-community.github.io/
