# andyzzc/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF

## Resumen
Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP es una cuantizacion GGUF del modelo denso multimodal Qwen3.8-27B, publicada por el usuario andyzzc a partir del trabajo de HauhauCS. El modelo base es un transformer causal denso de aproximadamente 27.000 millones de parametros con codificador de vision, 64 capas, hidden size 5.120 y una ventana de contexto nativa de 262.144 tokens extensible hasta 1.000.000. La propuesta de esta version es doble: por un lado, un perfil de "uncensoring" agresivo que elimina el comportamiento de rechazo (el autor declara 0/465 rechazos en su bateria de pruebas) y reduce el preambulo en prompts dificiles; por otro, la inclusion de HauhauCS FastMTP, un sidecar de decodificacion especulativa que acelera la generacion.

La relevancia practica esta en el rendimiento: el autor reporta hasta 3,02x en throughput de generacion de documentos y 1,93x en razonamiento respecto a la variante sin MTP, y mejoras del 35,2% y 21,1% respectivamente frente al MTP embebido estandar de Qwen3.8. Todo ello manteniendo las capacidades nativas de texto, razonamiento, agente, imagen y video del modelo original, con cuantizaciones que van de Q2 a Q8 y un proyector de vision BF16 separado de 931 MB.

El publicador de Hugging Face es andyzzc, mientras que las rutas de descarga de los ficheros apuntan al espacio de HauhauCS; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano total de 172,5 GB. La licencia declarada es Apache 2.0. La fecha de creacion y actualizacion es 2026-11-23.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con codificador de vision; hibrido de 48 capas Gated DeltaNet y 16 capas de atencion con compuertas |
| Parametros totales | 1.863.907.840 (dato de safetensors del repo); el nombre comercial indica 27B y la model card describe un modelo denso de 27B |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | Q8_K_P, Q8_0, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, IQ3_XS, Q2_K_P, IQ2_M; proyector de vision BF16; sidecar FastMTP 32K |
| Idiomas soportados | Ingles, chino y multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (texto, proyector de vision y sidecar FastMTP por separado) |

## Arquitectura y entrenamiento
El modelo base Qwen3.8-27B es un transformer causal denso de 64 capas con hidden size 5.120 y FFN de 17.408, vocabulario de 248.320 tokens (con padding). La innovacion arquitectonica principal es la combinacion de 48 capas Gated DeltaNet (un mecanismo de atencion lineal con estado recurrente) y 16 capas de atencion con compuertas, lo que reduce el coste de atencion en contextos largos. Incorpora un cabezal MTP (Multi-Token Prediction, tambien llamado NextN) embebido de forma nativa, que se preserva en todas las cuantizaciones de texto de esta release.

Sobre esa base, HauhauCS aplica dos modificaciones. La primera es un perfil de uncensoring "Aggressive" que, segun el autor, no altera datasets ni capacidades previstas, sino que ajusta el comportamiento de respuesta para eliminar rechazos y preambulos. La segunda es FastMTP: un sidecar de 903 MB que implementa un perfil de decodificacion especulativa de 32K, calibrado por el autor para toda la linea de cuantizaciones a maxima ventana nativa. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. Las cuantizaciones K_P ("Perfect") son perfiles de cuantizacion personalizados que preservan selectivamente las capas mas sensibles, con un incremento de tamano del 5-15% respecto a la cuantizacion base y una calidad equivalente a uno o dos niveles superiores.

## Capacidades
- Generacion de texto y razonamiento multi-paso, incluyendo modo de razonamiento explicito heredado del modelo base.
- Capacidades agente y agenticas: el autor menciona explicitamente "agentic work" entre las capacidades preservadas.
- Entrada de imagen y video mediante el proyector de vision BF16 separado (931 MB), con pipeline image-text-to-text.
- Comprension de documentos extensos gracias a la ventana nativa de 262.144 tokens, extensible a 1.000.000.
- Multilingue: ingles, chino y otros idiomas (categoria "multilingual").
- Decodificacion especulativa acelerada mediante el sidecar FastMTP 32K, con ganancias reportadas de hasta 3,02x en generacion de documentos y 1,93x en razonamiento.
- Perfil "Aggressive": respuestas directas, sin comportamiento de rechazo y con preambulo minimo en prompts dificiles.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con runtimes GGUF estandar (llama.cpp, LM Studio y otros).

## Casos de uso
- Procesamiento de documentos largos y contratos: la ventana de 262.144 tokens permite ingerir expedientes completos en una sola pasada, y el perfil FastMTP acelera la generacion de resumenes o extracciones sobre esos documentos (hasta 3,02x segun el autor).
- Analisis de imagenes y video en pipelines de inspeccion: con el proyector BF16 se pueden enviar fotogramas o capturas junto a instrucciones textuales para tareas de descripcion, clasificacion o extraccion de datos estructurados.
- Asistentes de investigacion sin filtros editoriales: el perfil Aggressive resulta adecuado para entornos donde se necesita respuesta directa sobre temas sensibles (seguridad, medicina, analisis de contenido) sin rechazos ni preambulos.
- Agentes autonomos de larga duracion: la combinacion de contexto nativo de 262K y capacidades agenticas permite mantener estado de tareas multi-paso; el autor advierte que para trabajo agentico de contexto largo y criticico en fiabilidad es preferible una variante Balanced si esta disponible.
- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_P (17,92 GB) e IQ4_XS (15,71 GB) caben en GPUs de consumo de 24 GB, lo que permite ejecutar un modelo de 27B multimodal en hardware local.
- Generacion acelerada en produccion con llama.cpp: el sidecar FastMTP se puede cargar junto a cualquier cuantizacion de texto para reducir latencia en tareas de generacion de documentos y razonamiento, sin necesidad de builds o plugins especiales.
- Traduccion y atencion al cliente multilingue: el soporte de ingles, chino y otros idiomas, junto con el contexto largo, permite gestionar conversaciones multi-turno con historial extenso.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo reporta metricas relativas de velocidad de generacion (TG, token generation) frente a variantes sin MTP y con MTP estandar:

| Metrica | Frente a no-MTP | Frente a MTP embebido estandar |
|---|---|---|
| TG en generacion de documentos | Hasta 3,02x | Hasta +35,2% |
| TG en razonamiento | Hasta 1,93x | Hasta +21,1% |
| Rechazos en bateria de pruebas del autor | 0/465 | No disponible |

## Requisitos de hardware
- VRAM estimada para inferencia (solo pesos de texto, sin contar KV cache): IQ2_M ~10,3 GB; Q2_K_P ~10,7 GB; IQ3_XS ~12,2 GB; IQ3_M ~12,8 GB; Q3_K_P ~13,4 GB; IQ4_XS ~15,7 GB; Q4_K_P ~17,9 GB; Q5_K_P ~20,2 GB; Q6_K_P ~25,9 GB; Q8_K_P ~31,5 GB.
- Proyector de vision: 931 MB adicionales si se usa entrada de imagen o video.
- Sidecar FastMTP: 903 MB adicionales si se activa la decodificacion especulativa.
- GPU de consumo: las cuantizaciones IQ4_XS y Q4_K_P caben en GPUs de 24 GB (RTX 3090, RTX 4090); Q5_K_P requiere 24 GB con margen ajustado o 32 GB; Q6_K_P y Q8_K_P requieren 32 GB o mas.
- GPU de datacenter: A100 40/80 GB, H100 80 GB y L40S 48 GB permiten ejecutar las cuantizaciones altas (Q6_K_P, Q8_K_P) con contexto largo. Para la ventana completa de 262.144 tokens es necesario dimensionar el KV cache, que no se cuantifica en los datos disponibles.
- Opciones de despliegue: llama.cpp, LM Studio y otros runtimes compatibles con GGUF; el autor indica compatibilidad con endpoints. No se menciona soporte explicito de vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no se publican valores absolutos (tokens/s); solo las ganancias relativas de FastMTP indicadas en la seccion de benchmarks.

## Comparativa con modelos similares
No se dispone de datos de benchmarks del modelo base Qwen3.8-27B en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Vision | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP (este) | 27B denso | 262.144 (ext. 1M) | Si (proyector BF16) | Apache 2.0 | GGUF | Perfil uncensored agresivo y FastMTP |
| Qwen/Qwen3.8-27B (base) | 27B denso | 262.144 (ext. 1M) | Si | Apache 2.0 | Safetensors | Modelo original con alineamiento estandar y MTP embebido |
| Variante Balanced de HauhauCS (si existe) | 27B denso | 262.144 (ext. 1M) | Si | Apache 2.0 | GGUF | Perfil uncensored menos agresivo, recomendado por el autor para trabajo agentico critico |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion consultada.

## Limitaciones y advertencias
- El perfil "Aggressive" elimina los rechazos de forma deliberada: el modelo puede producir contenido que otros modelos alineados bloquearian. No es adecuado para aplicaciones orientadas al publico sin moderacion adicional.
- El propio autor advierte que, para trabajo agentico de contexto largo en entornos criticos de fiabilidad, una variante Balanced es la opcion mas segura.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad ni de tasas de alucinacion en la informacion disponible.
- La discrepancia entre el nombre comercial (27B) y el recuento de parametros de safetensors del repo (1.863.907.840) no se explica en la model card; conviene verificarlo antes de dimensionar el hardware.
- El modelo solo declara soporte para ingles, chino y "multilingue" generico; el rendimiento en castellano no esta documentado.
- Las cuantizaciones K_P pueden mostrarse como "?" en la columna de cuantizacion de LM Studio (problema de visualizacion, no de carga), y el widget de compatibilidad de hardware de Hugging Face puede no reconocerlas.
- No se documentan sesgos especificos, numero de tokens de entrenamiento ni composicion del dataset, lo que dificulta evaluar el comportamiento en dominios especializados.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado sin filtros recae en el desplegador.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en la misma fecha (2026-11-23), lo que indica una publicacion muy reciente y sin validacion comunitaria.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/andyzzc/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Repositorio del autor de las cuantizaciones (rutas de descarga): https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Discord del autor: https://discord.gg/SZ5vacTXYf
- Fichero Q8_K_P: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q8_K_P.gguf
- Fichero Q4_K_P: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q4_K_P.gguf
- Proyector de vision BF16: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/mmproj-Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-BF16.gguf
- Sidecar FastMTP 32K: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-FastMTP-32K.gguf
