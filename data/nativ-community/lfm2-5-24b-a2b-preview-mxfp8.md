# nativ-community/LFM2.5-24B-A2B-Preview-mxfp8

## Resumen

LFM2.5-24B-A2B-Preview-mxfp8 es una conversión al formato MLX del modelo LFM2.5-24B-A2B-Preview desarrollado originalmente por Liquid AI, Inc. La conversión y cuantización la firma nativ-community, que publica los mismos ficheros también bajo la organización mlx-community. Se trata de un modelo de generación de texto con arquitectura Mixture of Experts (MoE), etiquetado internamente como `lfm2_moe`, con 23.971.587.712 parámetros totales y una ventana de contexto de 131.072 tokens.

El problema que resuelve es de despliegue: el modelo original en precisión BF16 ocupa bastante más espacio, y esta exportación aplica cuantización MXFP8 de 8 bits con tamaño de grupo 32 (solo pesos), dejando las proyecciones del router en cuantización afín de 8 bits con grupo 64, los pesos no cuantizados en BF16 y los sesgos de enrutamiento de expertos en FP32. El resultado son 24,72 GB de ficheros de pesos, lo que permite ejecutar un MoE de ~24B parámetros en equipos Apple Silicon de gama alta con memoria unificada suficiente.

Es relevante ahora porque amplía el ecosistema MLX (Apple Silicon) a modelos MoE de gran tamaño con contexto largo, y porque el modelo genera razonamiento antes de la respuesta final, un patrón habitual en modelos actuales orientados a tareas de razonamiento. No es un modelo nuevo: es una redistribución cuantizada y empaquetada para `mlx-vlm`, con licencia LFM Open License v1.0 heredada del original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo transformer (tag `lfm2_moe`); detalles internos de capas, atención y enrutamiento no disponibles |
| Parametros totales | 23.971.587.712 (~23,97B) |
| Parametros activos | ~2B según la convención de nomenclatura "A2B" del nombre del modelo; no confirmado en la información disponible |
| Longitud de contexto | 131.072 tokens (según la configuración de origen citada en la model card) |
| Tipos de cuantizacion | MXFP8 weight-only de 8 bits, grupo 32; router en cuantización afín de 8 bits, grupo 64; pesos sin cuantizar en BF16; sesgos de enrutamiento en FP32 |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt, it (10 idiomas declarados) |
| Licencia | LFM Open License v1.0 (`license: other`, `license_name: lfm1.0`); se incluye el fichero LICENSE original |
| Formato de pesos | safetensors (formato MLX); tamaño del repo 24,7 GB |

Otros datos de la ficha de HuggingFace: pipeline `text-generation`, librería `mlx`, 0 descargas y 0 likes en el momento del registro, creado el 2026-10-13, modelo base `lq-preview/LFM2.5-24B-A2B-Preview` fijado a la revisión `f772950ce6f17d35af5469d00334b61a9c2fc034`, región `us`.

## Arquitectura y entrenamiento

La información disponible confirma únicamente que el modelo es un Mixture of Experts (`lfm2_moe`) con 23,97B parámetros totales y 131.072 tokens de contexto, y que el autor original es Liquid AI, Inc. No se detallan en las fuentes proporcionadas el número de expertos, el número de capas, el tipo de atención, la composición del dataset, el número de tokens de entrenamiento ni si hubo etapas de RLHF, DPO u otro ajuste por preferencias. Tampoco se especifica si emplea atención lineal, decodificación especulativa u otra innovación concreta. Todos estos puntos deben considerarse no disponibles.

Lo que sí está documentado es el proceso de conversión y cuantización, que es donde reside el valor de esta publicación. La exportación se realizó con la CLI de MLX-VLM en un Apple M3 Ultra, con el comando `mlx_vlm convert --dtype bfloat16 -q --q-mode mxfp8 --q-bits 8 --q-group-size 32`. Se aplicó cuantización MXFP8 únicamente a los pesos, con grupo de 32, mientras que las proyecciones del router usan cuantización afín de 8 bits con grupo 64; los pesos en coma flotante no cuantizados permanecen en BF16 y los sesgos de enrutamiento de expertos en FP32. El export se recargó con coincidencia estricta de pesos, el prefill y la decodificación con caché produjeron logits finitos, y dos comprobaciones cortas de generación greedy devolvieron correctamente "Paris" y "391" alcanzando EOS. El propio autor advierte que estas pruebas son smoke tests y no una evaluación de calidad exhaustiva ni un benchmark de contexto largo.

## Capacidades

- Generación de texto y conversación multi-turno en los 10 idiomas declarados: inglés, árabe, chino, francés, alemán, japonés, coreano, español, portugués e italiano.
- Modo de razonamiento: el modelo genera razonamiento antes de su respuesta final, por lo que la model card recomienda reservar suficientes tokens de salida. Esto implica que el presupuesto de `max_tokens` debe contemplar tanto la traza de razonamiento como la respuesta.
- Formato conversacional con plantilla de chat incluida (`chat template`), pensada para uso directo con `mlx-vlm`.
- Capacidades de tool calling o function calling: no disponibles en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente, aunque el modo de razonamiento previo es compatible con flujos de varios pasos.
- Capacidades de visión: no disponibles. Aunque la librería utilizada sea `mlx-vlm` y exista el tag `mlx-vlm`, la model card afirma explícitamente que es un modelo de generación de texto.
- Capacidades de audio: no disponibles.
- Capacidades de código y matemáticas: no documentadas; las únicas comprobaciones publicadas son las respuestas "Paris" y "391" en un smoke test.

## Casos de uso

- Inferencia local en Apple Silicon: es el caso de uso principal de esta exportación. Un MoE de ~24B parámetros en 24,72 GB de pesos encaja en un Mac con memoria unificada amplia (M3 Ultra, M2 Ultra o configuraciones equivalentes), lo que permite ejecutar el modelo sin GPU dedicada ni conexión a servicios en la nube.
- Prototipado y evaluación de modelos MoE en MLX: el paquete está fijado a una revisión concreta y validado con versiones específicas (MLX 0.32.3, Transformers 5.17.0, MLX-VLM PR #2505, commit `a6c7313`), lo que lo hace reproducible para comparar cuantizaciones MXFP8 frente al BF16 original.
- Asistentes conversacionales multilingües: con 10 idiomas declarados y contexto de 131.072 tokens, permite mantener conversaciones largas con historial extenso o documentos de entrada grandes, siempre que la calidad por idioma se valide antes de producción.
- Procesamiento de documentos largos: 131.072 tokens de ventana permiten resumir, extraer información o responder preguntas sobre contratos, informes o documentación técnica sin trocear en exceso, aunque no hay benchmark publicado de contexto largo.
- Tareas con traza de razonamiento auditable: al generar el razonamiento antes de la respuesta, encaja en escenarios donde interesa inspeccionar el proceso intermedio (análisis, verificación de pasos), aceptando el coste extra en tokens de salida.
- Despliegue de bajo coste por token en servidor: si se confirma que activa ~2B parámetros por token, el coste computacional por token sería propio de un modelo de ese tamaño, lo que lo hace atractivo para servir muchas peticiones en un único equipo con memoria suficiente. Esta ventaja depende de la cifra real de parámetros activos, no confirmada en las fuentes.
- Investigación sobre cuantización MXFP8 en MLX: este repositorio es un caso de estudio útil para medir el impacto de MXFP8 con grupo 32 en un MoE, comparando contra el modelo base en BF16 y contra otras cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta dos comprobaciones de humo (`smoke tests`): generación greedy que devolvió "Paris" a la pregunta sobre la capital de Francia y "391" en una segunda prueba, alcanzando EOS en ambos casos. El autor indica explícitamente que estos tests no constituyen una evaluación de calidad completa ni un benchmark de contexto largo. No se dispone de datos de MMLU, HumanEval, GSM8K ni de ninguna otra métrica, ni de mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM o memoria unificada estimada: los pesos ocupan 24,72 GB en formato MXFP8. A esto hay que sumar caché KV y asignaciones temporales en tiempo de ejecución. Para contexto largo (hasta 131.072 tokens) la caché KV puede crecer de forma notable; en un Mac conviene disponer de 64 GB de memoria unificada o más para trabajar con ventanas grandes.
- Hardware de referencia: la conversión se realizó y probó en un Apple M3 Ultra. El formato MLX está orientado a Apple Silicon (M1, M2, M3, M4 y sus variantes Pro, Max y Ultra).
- GPU NVIDIA: este repositorio concreto no es directamente utilizable en CUDA, ya que los pesos están en formato MLX. Para GPU NVIDIA habría que recurrir al modelo base `lq-preview/LFM2.5-24B-A2B-Preview` u otra conversión.
- ¿Cabe en GPU de consumo? No aplica en esta exportación, al ser formato MLX. En un equipo Apple Silicon de gama alta sí, siempre que la memoria unificada supere con holgura los ~25 GB de pesos más caché.
- Opciones de despliegue: `mlx-vlm` (probado con el commit `a6c7313bc053e5887616fa850808d21576eddf98`, MLX 0.32.3 y Transformers 5.17.0). Se instala con `pip install 'git+https://github.com/Blaizzy/mlx-vlm.git@a6c7313bc053e5887616fa850808d21576eddf98'` y se ejecuta con `python -m mlx_vlm generate --model nativ-community/LFM2.5-24B-A2B-Preview-mxfp8`. vLLM, llama.cpp, Ollama y TGI no están documentados como soportados para esta exportación.
- Latencia y throughput: no disponibles. No se han publicado mediciones de velocidad de prefill, decodificación ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nativ-community/LFM2.5-24B-A2B-Preview-mxfp8 | 23,97B totales | 131.072 tokens | MLX safetensors, MXFP8 8 bits | LFM Open License v1.0 | HuggingFace, 0 descargas al registrar la ficha |
| mlx-community/LFM2.5-24B-A2B-Preview-mxfp8 | 23,97B totales | 131.072 tokens | MLX safetensors, MXFP8 8 bits | LFM Open License v1.0 | HuggingFace; según la model card, ficheros idénticos a los de nativ-community |
| lq-preview/LFM2.5-24B-A2B-Preview | 23,97B totales (derivado del recuento de la versión cuantizada) | 131.072 tokens | Safetensors en BF16 (modelo base) | LFM Open License v1.0 | HuggingFace, revisión `f772950ce6f17d35af5469d00334b61a9c2fc034` |
| Alternativas MoE de terceros de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de comparación en la información proporcionada |

No se dispone de información sobre otros modelos comparables (por ejemplo, otros MoE de ~20-30B parámetros) en las fuentes proporcionadas, por lo que no se incluyen cifras de rendimiento comparado.

## Limitaciones y advertencias

- No es un modelo original: es una conversión cuantizada de un modelo de Liquid AI, Inc. Los cambios de conversión y cuantización se describen en el fichero NOTICE del repositorio.
- Evaluación mínima: el autor solo realizó dos comprobaciones de humo con generación greedy. No hay evaluación de calidad, de sesgos ni de robustez, ni benchmark de contexto largo. Cualquier uso en producción requiere una evaluación propia.
- Sin datos de entrenamiento: no se conoce la composición del dataset ni los procesos de alineación, por lo que no se pueden anticipar sesgos concretos ni dominios de especialización. Este punto figura como no disponible.
- Riesgo de alucinación: inherente a los modelos de generación de texto y no cuantificado en las fuentes. Al generar razonamiento antes de la respuesta, el modelo consume más tokens de salida y puede producir trazas de razonamiento plausibles pero incorrectas.
- Contexto largo no verificado: aunque la configuración declare 131.072 tokens, no hay ninguna prueba publicada de rendimiento a esa longitud. La calidad y la estabilidad con ventanas muy largas son desconocidas.
- Idiomas sin validar: los 10 idiomas están declarados en los metadatos, pero no hay evaluación por idioma. El soporte real de idiomas como el árabe, el coreano o el chino no está verificado en esta conversión.
- Licencia restrictiva: la LFM Open License v1.0 se hereda del modelo original (`license: other`). Antes de un uso comercial hay que revisar las condiciones del fichero LICENSE incluido; no se debe asumir una licencia permisiva tipo Apache 2.0 o MIT.
- Dependencia de versiones concretas: el repositorio se validó con MLX 0.32.3, Transformers 5.17.0 y el commit `a6c7313` de MLX-VLM PR #2505. Otras versiones pueden no cargar los pesos correctamente.
- Ecosistema limitado: al estar en formato MLX, no es portable directamente a vLLM, llama.cpp, Ollama o TGI, lo que restringe el despliegue a entornos Apple Silicon o a conversiones adicionales.
- Repositorio con nula tracción en el momento del registro: 0 descargas y 0 likes, creado el 2026-10-13. Conviene contrastar con el modelo base y con la copia de `mlx-community` antes de depender de esta publicación.

## Enlaces

- Modelo en HuggingFace (nativ-community): https://huggingface.co/nativ-community/LFM2.5-24B-A2B-Preview-mxfp8
- Misma exportación en la organización mlx-community: https://huggingface.co/mlx-community/LFM2.5-24B-A2B-Preview-mxfp8
- Modelo base original: https://huggingface.co/lq-preview/LFM2.5-24B-A2B-Preview
- Repositorio MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- Pull request de MLX-VLM #2505 (soporte de LFM2.5): https://github.com/Blaizzy/mlx-vlm/pull/2505
- Licencia LFM Open License v1.0: fichero LICENSE incluido en el repositorio del modelo

Nota: los resultados de la búsqueda web proporcionados no contienen información relacionada con este modelo ni con MLX, por lo que no se han podido incorporar enlaces adicionales (papers, blogs o demos) a esta ficha.
