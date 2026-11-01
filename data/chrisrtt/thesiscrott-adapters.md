# chrisrtt/ThesisCRott-adapters

## Resumen

ThesisCRott-adapters es una colección de 98 adaptadores LoRA (PEFT) publicada por Christian Rott como artefacto de su tesis de máster en la TU Darmstadt (2026), titulada "Internalizing Vulnerability Awareness in Code LLMs via CWE-Augmented Code Property Graphs". El objetivo es la reparación automática de vulnerabilidades en código C/C++: cada adaptador recibe una función vulnerable junto con su etiqueta CWE y devuelve un parche, bien como diff, bien como función completa reescrita.

Los adaptadores se montan sobre dos modelos base de la familia Qwen2.5-Coder-Instruct (7B y 14B), por lo que heredan su arquitectura transformer densa, su ventana de contexto de 32.768 tokens y su licencia Apache-2.0. La contribución diferencial no está en el modelo base, sino en el procedimiento de ajuste: se comparan objetivos de entrenamiento (SFT, GRPO y SFT+GRPO), formatos de respuesta (diff frente a función completa) y, sobre todo, distintas señales de entrada, incluyendo un *taint slice* extraído del code property graph de la función.

El repositorio es relevante para investigadores en seguridad de software y para equipos que evalúen LLMs en tareas de reparación de vulnerabilidades, ya que ofrece una matriz experimental reproducible con múltiples semillas, configuraciones de entrenamiento registradas (`run_config.json`) y registros de GRPO. Con cero descargas y cero likes en el momento de la consulta, se trata de un artefacto académico reciente, no de un modelo orientado a producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only denso (Qwen2.5-Coder-Instruct) |
| Parámetros totales | No disponible para los adaptadores; modelo base: 7B y 14B |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en la model card; el modelo base Qwen2.5-Coder soporta 32.768 tokens |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; la cuantización dependerá del despliegue del modelo base) |
| Idiomas soportados | No disponible (el dominio de entrenamiento es código C/C++; el modelo base es multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA), con tokenizer y chat template por carpeta |

## Arquitectura y entrenamiento

Cada adaptador es un conjunto de matrices LoRA acopladas a Qwen2.5-Coder-7B-Instruct o 14B-Instruct. El repositorio organiza los adaptadores en una jerarquía `<tamaño>/<método>/<entrada de entrenamiento>/seed<N>/`, con 98 carpetas en total. Los métodos cubiertos son SFT con respuesta en diff, SFT con función completa, GRPO partiendo del modelo sin ajustar, SFT+GRPO en ambos formatos, SFT+GRPO sin *reward anchoring* y una variante de "pointer" que indica líneas concretas a corregir (oracle o aleatorias). Las entradas de entrenamiento varían entre etiqueta CWE sola (`no-slice`), líneas aleatorias más CWE (`random-slice`) y un *taint slice* del code property graph más CWE (`taint-slice`).

La innovación metodológica es el uso del *taint slice* como contexto estructurado: en lugar de dar al modelo la función completa o líneas arbitrarias, se le proporciona el subconjunto del grafo de propiedades de código que conecta fuentes y sumideros de datos contaminados, junto con la etiqueta CWE. El entrenamiento combina SFT y optimización por política (GRPO) con recompensas ancladas, y los datos derivan de PrimeVul (licencia MIT). Cada carpeta incluye `run_config.json` con los hiperparámetros y `origin.json` con el identificador del experimento; las carpetas GRPO añaden `train_log.json`. No se detalla en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset más allá de su origen en PrimeVul.

## Capacidades

- Reparación de vulnerabilidades en C/C++: genera un parche a partir de una función vulnerable y su etiqueta CWE.
- Dos formatos de salida: diff unificado o función completa reescrita.
- Condicionamiento por CWE: el comportamiento del adaptador depende de la etiqueta de debilidad proporcionada.
- Uso opcional de contexto estructural: variantes entrenadas con *taint slice* del code property graph.
- Variantes de localización: adaptadores "pointer" que señalan las líneas a corregir (oracle o aleatorias).
- Generación de texto propia del modelo base Qwen2.5-Coder (código, razonamiento técnico), aunque el ajuste está especializado en reparación.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Revisión de seguridad en CI/CD: integrar un adaptador en un pipeline que, ante un hallazgo de SAST con CWE asociado, genere un parche candidato en formato diff para revisión humana antes del merge.
- Priorización y triaje de hallazgos: usar la variante "pointer" para que el modelo indique las líneas sospechosas de una función, ayudando a un analista a localizar el fallo antes de aplicar la corrección.
- Reparación asistida en IDE: desplegar el adaptador 7B en local (por ejemplo, con vLLM o llama.cpp sobre el base cuantizado) para sugerir correcciones de funciones C/C++ sin enviar código propietario a la nube.
- Investigación en reparación automática: emplear la matriz de 98 adaptadores y sus `run_config.json` para reproducir comparativas entre SFT, GRPO y SFT+GRPO, o entre diff y función completa.
- Estudio de señal estructural: comparar los adaptadores `taint-slice` frente a `no-slice` y `random-slice` para medir cuánto aporta el code property graph a la calidad del parche.
- Generación de datasets de parches: usar los adaptadores 14B para producir candidatos de corrección a gran escala sobre un corpus C/C++ y filtrarlos después con pruebas o análisis estático.
- Formación y auditoría: generar ejemplos didácticos de vulnerabilidades y su corrección a partir de etiquetas CWE conocidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Los adaptadores LoRA son ligeros, pero requieren cargar el modelo base completo: 7B (unos 14 GB en fp16, 4-5 GB en cuantización de 4 bits) o 14B (unos 28 GB en fp16, 8-9 GB en 4 bits).
- El repositorio completo ocupa 11,4 GB; conviene descargar solo las carpetas necesarias con `hf download ... --include "7b/sft-diff/*"`.
- GPU recomendadas: A100 40/80 GB o H100 para el 14B en fp16 con contexto largo; RTX 4090 (24 GB) para el 7B en fp16 o el 14B cuantizado.
- Cabe en GPU de consumo: el 7B en 4 bits en tarjetas de 8 GB; el 14B en 4 bits en tarjetas de 12-16 GB.
- Despliegue: PEFT + Transformers (flujo documentado en la model card); vLLM, TGI, llama.cpp u Ollama son opciones habituales para el base, pero no se documentan explícitamente en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThesisCRott-adapters (7B/14B) | Adaptadores sobre 7B y 14B | No especificado (base: 32.768) | Reparación de vulnerabilidades C/C++ con CWE y taint slice | Apache-2.0 | HuggingFace (98 adaptadores) |
| Qwen2.5-Coder-7B/14B-Instruct | 7B / 14B | 32.768 | Asistente de código general | Apache-2.0 | HuggingFace, muy extendido |
| Adaptadores de reparación de vulnerabilidades sobre Llama o CodeLlama | No disponible | No disponible | Reparación de código de seguridad | Varía según el base | No disponible en la información proporcionada |

La comparación relevante es con el propio modelo base sin ajustar: los adaptadores no cambian el tamaño ni el contexto, sino la distribución de salida hacia parches con etiqueta CWE. No se dispone de datos de rendimiento comparado en la información proporcionada.

## Limitaciones y advertencias

- Artefacto académico con cero descargas y cero likes: no hay evidencia de uso en producción ni validación externa.
- Dominio restringido a C/C++ y a las categorías CWE presentes en PrimeVul; el comportamiento fuera de ese dominio no está documentado.
- Riesgo de parches incorrectos o incompletos: un diff plausible puede no compilar o no eliminar la vulnerabilidad; se requiere verificación con pruebas y análisis estático.
- Riesgo de alucinación inherente al modelo base, agravado por la tarea de generar código que debe ser sintácticamente válido y seguro.
- Idiomas soportados no declarados; el ajuste se centra en código, no en documentación multilingüe.
- La licencia Apache-2.0 permite uso comercial, pero los datos derivan de PrimeVul (MIT) y el uso debe respetar las condiciones de ambas.
- No se documentan sesgos específicos ni evaluaciones de robustez frente a ejemplos adversariales.
- La selección de la carpeta correcta (tamaño, método, entrada, semilla) es crítica y no hay guía de cuál rinde mejor, al no publicarse benchmarks.

## Enlaces

- HuggingFace: https://huggingface.co/chrisrtt/ThesisCRott-adapters
- Repositorio del artefacto: https://github.com/chrisrtt34/ThesisCRott-artifact
- Modelo base 7B: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Modelo base 14B: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
