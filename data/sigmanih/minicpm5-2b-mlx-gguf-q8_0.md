# sigmanih/MiniCPM5-2B-MLX-GGUF-Q8_0

## Resumen

MiniCPM5-2B-MLX-GGUF-Q8_0 es una cuantización en formato GGUF (Q8_0) del modelo openbmb/MiniCPM5-2B-MLX, publicada por el usuario sigmanih a través de su herramienta Sigma Studio. Se trata de un modelo denso de 2.516.756.480 parámetros (unos 2,5 mil millones) con arquitectura declarada como "llama" en la model card, 42 capas de transformer y una dimensión oculta de 2048. Su ventana de contexto alcanza los 131.072 tokens, un valor muy elevado para su tamaño.

El objetivo del repositorio es facilitar el despliegue del modelo base en entornos con recursos limitados mediante cuantización de 8 bits. El autor indica un consumo aproximado de 3,4 GB de VRAM con descarga total en GPU y unos 3,2 GB de RAM en modo CPU o híbrido, lo que lo sitúa en el rango de GPUs de consumo de 6-8 GB de VRAM. Está orientado a dispositivos de borde, agentes de voz en tiempo real y cargas de trabajo móviles o centradas en CPU.

La relevancia de esta ficha radica en que se trata de un artefacto de cuantización de terceros, no del modelo oficial de OpenBMB. Los resultados de benchmarks publicados en la model card proceden de evaluaciones parciales (slices) y muestran un rendimiento global bajo (44% de aciertos en 100 preguntas), con una mejora de 8,5 puntos al activar razonamiento en cadena. Los datos de protocolo de tool calling también son limitados. Es, por tanto, un modelo pensado para experimentación y despliegue ligero, no para tareas de alta exigencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | llama (según model card); transformer denso |
| Parametros totales | 2.516.756.480 (~2,5 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | Q8_0 (única incluida en este repositorio) |
| Idiomas soportados | en, it |
| Licencia | other (los metadatos de HuggingFace indican "other"; la model card muestra una insignia Apache-2.0) |
| Formato de pesos | GGUF |
| Capas de transformer | 42 |
| Dimensión oculta | 2048 |
| Huella en disco | 2,5 GB (repo: 2,7 GB) |
| Modelo base | openbmb/MiniCPM5-2B-MLX |

## Arquitectura y entrenamiento

La model card declara la arquitectura del modelo como "llama", con 42 capas de transformer y una dimensión oculta de 2048. Se trata de un modelo denso de aproximadamente 2,5 mil millones de parámetros, sin componentes de mezcla de expertos (MoE) ni mecanismos de estado (SSM) declarados. La ventana de contexto de 131.072 tokens es notablemente amplia para este tamaño y sugiere el uso de esquemas de atención eficiente o RoPE escalado, aunque la model card no detalla la implementación concreta.

No se dispone de información en la documentación proporcionada sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de alineación como RLHF o DPO. El repositorio es una cuantización Q8_0 de un modelo base publicado por OpenBMB (openbmb/MiniCPM5-2B-MLX); el proceso de cuantización lo realiza el autor sigmanih mediante su herramienta Sigma Studio. No se documentan innovaciones técnicas específicas del proceso de cuantización más allá del uso de GGUF con el esquema Q8_0.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation y el tag indica uso conversacional.
- Razonamiento en cadena: la model card distingue entre modo "no-thinking" (respuesta directa) y modo "deep thinking" (CoT), con una mejora reportada de 8,5 puntos de precisión al activar el razonamiento paso a paso.
- Generación de código: los benchmarks incluyen HumanEval (pass@1) y MBPP, con resultados del 71% y el 56% respectivamente sobre las muestras evaluadas.
- Matemáticas: se reportan evaluaciones en GSM8K (67%) y MATH (78%) sobre las muestras evaluadas.
- Tool calling / function calling: la model card reporta una adherencia al protocolo de herramientas del 72,8%, con uso declarado de esquemas válidos y sin funciones alucinadas; no obstante, la tasa de finalización autónoma de tareas reportada es del 0,0%.
- Capacidad multilingüe: según los metadatos, inglés (en) e italiano (it).
- Capacidad de contexto largo: soporte declarado de hasta 131.072 tokens.
- No se declaran capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Generación de texto conversacional en dispositivos de borde: gracias a una huella de 2,5 GB y un consumo estimado de 3,4 GB de VRAM, puede ejecutarse en GPUs integradas o de gama de entrada con 6-8 GB, ofreciendo respuestas de bajo coste computacional.
- Asistentes de voz en tiempo real: la model card orienta el modelo a agentes de voz en tiempo real; el modo "no-thinking" permite minimizar la latencia hasta el primer token al eliminar el sobrecoste de tokens de razonamiento.
- Autocompletado y asistencia de código en local: con resultados de HumanEval y MBPP reportados, puede integrarse en editores o pipelines de desarrollo que requieran generación de código sin dependencia de la nube.
- Procesamiento de documentos largos con contexto extendido: la ventana de 131.072 tokens permite cargar documentos extensos (contratos, informes, transcripciones) en un único prompt para resumen o extracción.
- Prototipado de agentes con tool calling: el modelo declara adherencia a esquemas de herramientas del 72,8%, lo que permite probar flujos de llamada a funciones en entornos sandbox, aunque la finalización de tareas complejas no está garantizada.
- Despliegue en CPU o entornos híbridos: con un consumo estimado de 3,2 GB de RAM, es viable en servidores sin GPU o en combinaciones CPU/GPU para cargas de baja concurrencia.
- Experimentación académica y benchmarking local: al ser un GGUF Q8_0 reproducible con llama.cpp, resulta útil para comparar cuantizaciones y medir degradación respecto al modelo base.

## Benchmarks y rendimiento

Los siguientes resultados proceden de la model card del autor y se midieron sobre subconjuntos (slices) de cada suite, no sobre el conjunto completo, por lo que no son comparables con ejecuciones completas. Ejecución con temperatura 0,0 y semilla 42.

| Benchmark | Dominio | Aciertos / Total | Precision | Estado |
|---|---|---|---|---|
| ARC-Challenge | Razonamiento científico | 7/9 | 78% | Pasa |
| BIG-Bench Hard | Lógica compleja y simbólica | 6/7 | 86% | Pasa |
| GPQA | Razonamiento académico de posgrado | 0/9 | 0% | Bajo |
| GSM8K | Matemáticas de primaria multi-paso | 6/9 | 67% | Aceptable |
| HellaSwag | Sentido común y NLI | 1/9 | 11% | Bajo |
| HumanEval | Código Python (pass@1) | 5/7 | 71% | Pasa |
| MATH | Matemáticas de competición | 7/9 | 78% | Pasa |
| MBPP | Programación Python con tests | 5/9 | 56% | Aceptable |
| MMLU | Conocimiento general multitema | 3/14 | 21% | Bajo |
| MMLU-Pro | Razonamiento avanzado multi-paso | 2/9 | 22% | Bajo |
| TruthfulQA | Factualidad y anti-alucinación | 2/9 | 22% | Bajo |
| Total global | Todas las suites evaluadas | 44/100 | 44% | 44% de aciertos |

Comparativa de modos de razonamiento:

| Modo de ejecución | Precision | Preguntas superadas | Perfil |
|---|---|---|---|
| No-Thinking (respuesta directa) | 40,4% | 23/57 | Latencia mínima, sin tokens de razonamiento |
| Deep Thinking (CoT) | 48,8% | 21/43 | Traza de razonamiento multi-paso (+8,5%) |

Benchmark de tool calling y agente (entorno sandbox aislado):

| Métrica de protocolo | Resultado | Criterio |
|---|---|---|
| Adherencia al protocolo de herramientas | 72,8% | 0/92 criterios analíticos verificados |
| Finalización autónoma de tareas | 0,0% | 0/1 escenarios completados con el fichero objetivo |
| Contención en sandbox | 100% conforme | Cero intentos de escape del espacio de trabajo |
| Eficiencia de ejecución | 0 turnos (0,0 s) | Uso óptimo de presupuesto de turnos y tokens |

Se advierte de que estos datos proceden de una ejecución sobre slices y de una model card generada de forma automática, por lo que deben interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,4 GB con descarga total en GPU; unos 3,2 GB de RAM en modo CPU o híbrido (según model card).
- GPU recomendadas: cualquier GPU con 6-8 GB de VRAM según el autor; en la práctica, modelos de consumo como RTX 3060 (12 GB), RTX 4060 (8 GB) o RTX 4070 (12 GB) cubren el requisito con holgura.
- Cabe en GPU de consumo: sí, en GPUs con al menos 6 GB de VRAM.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (compatible con GGUF) y, con soporte experimental, vLLM y TGI para GGUF. El tag endpoints_compatible sugiere compatibilidad con endpoints de inferencia genéricos.
- Latencia y throughput: no disponible.
- Almacenamiento: aproximadamente 2,5 GB de pesos en disco (repo completo: 2,7 GB).

## Comparativa con modelos similares

Los datos disponibles en la información proporcionada solo permiten comparar esta cuantización con su modelo base. No se dispone de cifras verificables de otras alternativas de la misma categoría.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sigmanih/MiniCPM5-2B-MLX-GGUF-Q8_0 | ~2,5 B | 131.072 | GGUF Q8_0 | other | HuggingFace |
| openbmb/MiniCPM5-2B-MLX (base) | ~2,5 B | 131.072 | MLX | no disponible | HuggingFace |
| Alternativas de ~2 B de otros fabricantes | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El rendimiento reportado es bajo en varias suites clave: GPQA (0%), HellaSwag (11%), MMLU (21%), MMLU-Pro (22%) y TruthfulQA (22%).
- Los resultados se obtuvieron sobre subconjuntos (slices) de cada benchmark, no sobre las suites completas; el propio autor advierte de que no son comparables con ejecuciones completas.
- La finalización autónoma de tareas de agente es del 0,0%, pese a una adherencia al protocolo de herramientas del 72,8%; no debe usarse para flujos agénticos críticos sin supervisión.
- Riesgo de alucinación: la puntuación de TruthfulQA (22%) es baja, lo que indica escasa robustez frente a la generación de contenido factual incorrecto.
- Idiomas limitados: solo inglés e italiano según los metadatos; no se declara soporte de español ni de otros idiomas.
- La licencia figura como "other" en los metadatos de HuggingFace, mientras que la model card muestra una insignia Apache-2.0. Esta discrepancia debe resolverse antes de un uso comercial; no se puede asumir el uso libre sin verificar la licencia real del modelo base.
- Se trata de una cuantización de terceros (sigmanih) del modelo base de OpenBMB, no del modelo oficial; el proceso y la calidad de la cuantización no están auditados.
- La model card parece generada de forma automática por la herramienta Sigma Studio, con resultados de benchmarks parciales y algunas métricas internas contradictorias (por ejemplo, 72,8% de adherencia a herramientas frente a 0/92 criterios verificados).
- El contexto declarado de 131.072 tokens debe contrastarse empíricamente; no se documenta la estrategia de atención que lo sustenta, y el rendimiento en ventanas muy largas no está validado en la información proporcionada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sigmanih/MiniCPM5-2B-MLX-GGUF-Q8_0
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B-MLX
- Repositorio Sigma Studio (GitHub): https://github.com/Sigmanih/SigmaStudio
- Perfil del autor en HuggingFace: https://huggingface.co/sigmanih
- Licencia Apache-2.0 (referenciada en la model card): https://opensource.org/licenses/Apache-2.0
