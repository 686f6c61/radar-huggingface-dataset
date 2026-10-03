# IndexTeam/Index-Translate-2B-GGUF

## Resumen

Index-Translate-2B-GGUF es la conversión oficial al formato GGUF de IndexTeam/Index-Translate-2B, un modelo especializado en traducción automática multilingüe desarrollado por el equipo Index (vinculado al repositorio github.com/bilibili/Index-Translate). Forma parte de la familia Index-Translate y está diseñado específicamente para tareas de traducción: traducción general en 150 idiomas, traducción con terminología y formato restringidos, traducción controlada para doblaje y traducción de documentos largos. Al estar distribuido en GGUF, se ejecuta directamente con llama.cpp en CPU o GPU de gama baja.

El repositorio no publica la arquitectura interna, el número de tokens de entrenamiento ni la longitud de contexto, pero sí aporta dos datos estructurales relevantes: el modelo base tiene una torre de visión con su correspondiente proyector multimodal (los ficheros `mmproj`), lo que habilita entrada de imágenes, y el prompt oficial de traducción está redactado en chino. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones añadidas por parte del autor.

Su relevancia práctica es doble. Por un lado, empaqueta toda la familia de cuantizaciones (de Q2_K a f16) en un único repositorio, con validación de divergencia KL frente a la conversión F16 en GPU A100, lo que facilita desplegar traducción local sin depender de APIs externas. Por otro, cubre escenarios poco habituales en modelos pequeños de traducción, como el control de terminología obligatoria y el formato restringido, orientados a flujos de localización y doblaje. Como contrapartida, es un lanzamiento reciente sin adopción registrada (0 descargas, 0 likes en el momento de la consulta) y con inconsistencias en los metadatos de tamaño que conviene verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Modelo transformer de traducción con torre de visión y proyector multimodal (ficheros `mmproj`); el autor no detalla la arquitectura interna |
| Parametros totales | Discrepancia en los metadatos: 331.416.576 parámetros según el dato real de safetensors del repositorio, frente a la denominación comercial "2B" del nombre del modelo. Debe verificarse antes de dimensionar el despliegue |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M (recomendada), Q5_K_S, Q5_K_M, Q6_K, Q8_0 y f16. Proyector multimodal aparte: mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | 150 idiomas según la model card del modelo base |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp). El modelo base IndexTeam/Index-Translate-2B usa safetensors en BF16 |
| Tamano del repositorio | 0,4 GB según metadatos, aunque los ficheros publicados suman varios GB (f16 = 3,90 GB); el dato de metadatos parece inconsistente |
| Fecha de publicacion | 2 de octubre de 2026 (creación), 3 de octubre de 2026 según la nota de conversión de la model card |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo base: solo indica que es un modelo de traducción multilingüe de la familia Index-Translate, con soporte para 150 idiomas, y que la conversión a GGUF se realizó con llama.cpp (rama master, octubre de 2026) mediante cuantización estática de posentrenamiento. La presencia de ficheros `mmproj` (proyector multimodal) confirma que el modelo base incorpora una torre de visión que proyecta características de imagen al espacio del modelo de lenguaje, lo que permite traducir texto presente en imágenes. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones.

El aspecto técnico mejor documentado es el proceso de cuantización y su validación. Antes de publicar, cada nivel de cuantización se comparó en GPU (NVIDIA A100) contra la conversión F16 usando `llama-perplexity` para medir la divergencia KL por token y el RMS de la diferencia de probabilidades, además de comprobaciones puntuales de generación greedy contra los pesos BF16 originales en transformers. Según el autor, las salidas de Q4_K_M coinciden casi literalmente con la referencia. La decodificación recomendada es greedy con temperatura 0, lo cual es coherente con una tarea determinista como la traducción.

## Capacidades

- Traducción multilingüe en 150 idiomas, con el par de idiomas especificado en el prompt.
- Traducción restringida por terminología: permite forzar glosarios o términos concretos en la salida.
- Traducción restringida por formato (formato `instTrans` descrito en la model card del modelo base), útil cuando la salida debe respetar una estructura predefinida.
- Traducción controlada para doblaje, orientada a sincronía y control de la salida.
- Traducción de documentos largos.
- Entrada de imágenes mediante la torre de visión y el proyector multimodal (`llama-mtmd-cli`), lo que habilita traducir texto contenido en imágenes.
- Decodificación determinista con temperatura 0, con salida directa del texto traducido.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso con agentes.
- No se documenta modo de razonamiento explícito (thinking mode), audio ni otras modalidades además de imagen y texto.

## Casos de uso

- Localización de software y documentación técnica: el modelo acepta glosarios y restricciones de terminología, de modo que se pueden imponer los términos aprobados por el equipo de traducción y mantener coherencia entre versiones de un mismo producto.
- Traducción de documentación larga: está diseñado explícitamente para documentos extensos, lo que permite procesar manuales, contratos o informes manteniendo el contexto del documento en lugar de traducir frase a frase.
- Subtitulado y doblaje: la familia incluye traducción controlada para doblaje, pensada para ajustar la longitud y el ritmo de la salida a las necesidades de una pista de audio doblada.
- Traducción de texto en imágenes: gracias al proyector multimodal, se puede pasar una captura, un escaneo o una foto de un cartel y obtener la traducción del texto que contiene, con el flujo de `llama-mtmd-cli`.
- Traducción embebida en el dispositivo: con cuantizaciones de 1,25-1,45 GB (Q4_K_S, Q4_K_M, Q5_K_M), el modelo cabe en portátiles y equipos sin GPU dedicada, útil para aplicaciones de escritorio o móviles que necesitan traducir sin enviar datos a un servidor.
- Procesamiento por lotes de contenido multilingüe: dado que la decodificación es greedy y determinista, encaja bien en pipelines automatizados de traducción masiva donde se requiere reproducibilidad de resultados entre ejecuciones.
- Traducción en entornos con requisitos de privacidad: al ejecutarse localmente con llama.cpp y licencia Apache 2.0, se puede integrar en infraestructura propia sin que el texto salga de la organización.
- Traducción con formato estricto: para convertir ficheros estructurados (por ejemplo, cadenas de recursos de interfaz) en los que la salida debe respetar el marcado original, la modalidad de formato restringido evita limpiezas posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, BLEU, COMET ni métricas de traducción comparables. El único dato cuantitativo aportado es la validación de la cuantización: divergencia KL por token y RMS de la diferencia de probabilidades medidas con `llama-perplexity` en una NVIDIA A100, comparando cada nivel de cuantización contra la conversión F16, además de comprobaciones de generación greedy contra los pesos BF16 de referencia. Se indica que Q4_K_M coincide casi literalmente con la referencia, pero no se publican los valores numéricos de esas métricas.

## Requisitos de hardware

- VRAM según cuantización (solo pesos, sin contar caché KV ni contexto): Q2_K 0,99 GB; Q3_K_S 1,05 GB; Q3_K_M 1,13 GB; Q3_K_L 1,20 GB; IQ4_XS 1,23 GB; Q4_K_S 1,25 GB; Q4_K_M 1,31 GB; Q5_K_S 1,42 GB; Q5_K_M 1,45 GB; Q6_K 1,61 GB; Q8_0 2,08 GB; f16 3,90 GB.
- VRAM adicional para el proyector multimodal: 0,36 GB en mmproj-Q8_0 y 0,67 GB en mmproj-f16, solo necesarios si se usa entrada de imagen.
- Cabe holgadamente en GPU de consumo: cualquier GPU con 4 GB o más de VRAM puede ejecutar Q4_K_M con contexto moderado; una RTX 3060, RTX 4060, RTX 4090 o similar no supone ninguna limitación. Con Q8_0 o f16 también cabe en GPUs de 6-8 GB.
- Ejecución en CPU: viable en cualquier equipo con 2-4 GB de RAM libre usando cuantizaciones Q4 o inferiores, al ser un modelo pequeño.
- GPU profesionales: el autor validó las cuantizaciones en NVIDIA A100, aunque no es un hardware necesario para inferencia; H100 o A100 solo tendrían sentido para servir muchas peticiones concurrentes.
- Opciones de despliegue: llama.cpp (`llama serve`, `llama cli`, `llama-mtmd-cli` para imagen), importación en Ollama mediante Modelfile a partir del GGUF, y LM Studio. El soporte de GGUF en vLLM es limitado y no se confirma para esta arquitectura; TGI no soporta GGUF.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Index-Translate-2B-GGUF | 331.416.576 segun safetensors; "2B" en el nombre | 150 | Apache 2.0 | GGUF (llama.cpp) | Traducción con terminología y formato restringidos, doblaje, documentos largos y entrada de imagen. Sin benchmarks publicados |
| NLLB-200-distilled-600M (Meta) | 600 M | 200 | CC-BY-NC-4.0 | safetensors (transformers) | Referencia clásica en traducción multilingüe; licencia no comercial, lo que limita su uso en producto |
| M2M-100 418M (Meta) | 418 M | 100 | MIT | safetensors (transformers) | Modelo many-to-many entrenado sin inglés como pivote; sin soporte multimodal ni control de terminología documentado |
| MADLAD-400-3B-MT (Google) | 3 B | Cientos de idiomas (no disponible el dato exacto aquí) | Apache 2.0 | safetensors (transformers) | Alternativa de traducción con licencia permisiva; mayor tamaño, por lo que requiere más recursos |

La comparación de rendimiento de traducción (BLEU, COMET, chrF) no está disponible para Index-Translate-2B, ya que el autor no publica resultados. La diferencia más clara frente a NLLB-200 y M2M-100 es la licencia (Apache 2.0 frente a CC-BY-NC-4.0 y MIT), el empaquetado GGUF listo para ejecución local y el soporte multimodal, capacidades que los modelos de Meta no ofrecen.

## Limitaciones y advertencias

- Inconsistencia de metadatos: el nombre del modelo indica 2B parámetros, pero el dato real de safetensors es 331.416.576. Además, el tamaño de repositorio declarado (0,4 GB) no cuadra con los ficheros publicados (hasta 3,90 GB en f16). Hay que verificar el tamaño real antes de planificar recursos.
- Traducción de 150 idiomas es una afirmación del autor: no se aportan métricas por par de idiomas, por lo que la calidad relativa entre lenguas (especialmente en pares de bajos recursos) es desconocida.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad ni de tasas de omisión, adición o mistranslation; en traducción automática estos fallos son habituales y no hay datos que los cuantifiquen.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en documentos muy largos, pese a que el modelo se promociona para traducción de documentos largos.
- Prompt oficial en chino: el formato de traducción publicado está redactado en chino, lo que puede afectar al rendimiento si se traduce el prompt a otro idioma sin validar el resultado.
- Decodificación greedy recomendada: el modo determinista es adecuado para traducción, pero limita la diversidad de salida y puede repetir errores de forma consistente.
- Uso comercial: la licencia Apache 2.0 del repositorio GGUF es permisiva, pero conviene revisar la licencia y las condiciones del modelo base IndexTeam/Index-Translate-2B, así como las de los datos de entrenamiento, que no se detallan.
- Adopción nula en el momento de la consulta (0 descargas, 0 likes) y publicación muy reciente: no hay evidencia de la comunidad ni informes independientes de calidad.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso, por lo que no es un sustituto de un LLM generalista en flujos agénticos.
- Los ficheros `mmproj` son necesarios solo para entrada de imagen; usarlos sin necesidad añade consumo de VRAM.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/IndexTeam/Index-Translate-2B-GGUF
- Modelo base: https://huggingface.co/IndexTeam/Index-Translate-2B
- Informe técnico (arXiv): https://arxiv.org/abs/2609.40181
- Código: https://github.com/bilibili/Index-Translate
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ficheros cuantizados (ejemplos): [Q4_K_M](https://huggingface.co/IndexTeam/Index-Translate-2B-GGUF/resolve/main/Index-Translate-2B.Q4_K_M.gguf), [Q8_0](https://huggingface.co/IndexTeam/Index-Translate-2B-GGUF/resolve/main/Index-Translate-2B.Q8_0.gguf), [f16](https://huggingface.co/IndexTeam/Index-Translate-2B-GGUF/resolve/main/Index-Translate-2B.f16.gguf), [mmproj-Q8_0](https://huggingface.co/IndexTeam/Index-Translate-2B-GGUF/resolve/main/Index-Translate-2B.mmproj-Q8_0.gguf), [mmproj-f16](https://huggingface.co/IndexTeam/Index-Translate-2B-GGUF/resolve/main/Index-Translate-2B.mmproj-f16.gguf)
