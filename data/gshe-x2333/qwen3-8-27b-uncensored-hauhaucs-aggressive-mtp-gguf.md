# gshe-x2333/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF

## Resumen

Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF es una distribución en formato GGUF de un derivado sin censura del modelo Qwen/Qwen3.8-27B, publicada por el autor que firma como HauhauCS bajo la cuenta de Hugging Face gshe-x2333. Se trata de un modelo denso de 27B con codificador de visión (pipeline image-text-to-text) cuya arquitectura combina 48 capas Gated DeltaNet con 16 capas de atención con compuertas, e incorpora las cabezas MTP/NextN nativas del modelo base más un sidecar propio de decodificación especulativa denominado HauhauCS FastMTP. La ventana de contexto nativa es de 262.144 tokens, extensible hasta 1.000.000.

El interés inmediato del repositorio es doble. Por un lado, aplica un perfil de "descencerrado" agresivo: el autor declara 0 rechazos sobre 465 peticiones y respuestas directas con mínimo preámbulo en prompts difíciles. Por otro, incluye aceleración MTP propia, con cifras declaradas de hasta 3,02x de throughput de generación en documentos y 1,93x en razonamiento frente a la ejecución sin MTP.

La relevancia práctica está en que todo el paquete se entrega como GGUF listo para llama.cpp, LM Studio u otros runtimes compatibles, con cuantizaciones desde IQ2_M (10,32 GB) hasta Q8_K_P (31,46 GB), lo que permite desplegarlo en hardware de consumo. No obstante, el repositorio no tiene descargas ni likes, no aporta benchmarks y contiene inconsistencias de metadatos que conviene revisar antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con codificador de visión; híbrido de 48 capas Gated DeltaNet y 16 capas de atención con compuertas; 64 capas de lenguaje en total; MTP/NextN embebido |
| Parámetros totales | 27B según la denominación del modelo y coherente con el tamaño de los GGUF; el recuento indicado en safetensors es de 1.863.907.840 parámetros (≈1,86B), dato inconsistente con el nombre |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantización | Q8_K_P, Q8_0, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, IQ3_XS, Q2_K_P, IQ2_M; más proyector de visión BF16 (931 MB) y sidecar FastMTP-32K (903 MB) |
| Idiomas soportados | en, zh, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (texto), GGUF BF16 (proyector de visión), GGUF (sidecar FastMTP) |
| Tamaño oculto | 5.120 |
| Tamaño de FFN | 17.408 |
| Vocabulario | 248.320 tokens (con padding) |
| Tamaño del repositorio | 172,5 GB |
| Modelo base | Qwen/Qwen3.8-27B |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal denso de 27B con un codificador de visión acoplado mediante un proyector multimodal independiente en BF16. La innovación estructural más destacable es el reparto de capas: 48 de las 64 capas de lenguaje son Gated DeltaNet (atención lineal con estado recurrente) y solo 16 son capas de atención con compuertas, un esquema híbrido que reduce el coste de caché KV en contextos muy largos respecto a un transformer de atención completa del mismo tamaño. El vocabulario está ampliado con padding hasta 248.320 tokens, con tamaño oculto de 5.120 y FFN de 17.408.

El paquete añade dos componentes de aceleración. Por un lado se preserva la cabeza MTP/NextN nativa del modelo base, que permite decodificación especulativa multi-token. Por otro se incorpora HauhauCS FastMTP, un sidecar de 903 MB cualificado según el autor para un perfil de 32K y para toda la línea de cuantizaciones, con ganancias declaradas de hasta 3,02x en throughput de documentos y 1,93x en razonamiento. Las cuantizaciones K_P ("Perfect") son perfiles de quantización propios que, según el autor, elevan la calidad uno o dos niveles respecto a la quant base con solo un 5-15% más de tamaño, y siguen siendo GGUF estándar ejecutables en llama.cpp o LM Studio sin parches.

No hay información disponible sobre el proceso de entrenamiento del modelo base ni sobre el ajuste aplicado para el descenecerrado: no se indican número de tokens, composición del dataset, ni si hubo RLHF, DPO o abliteración. El autor afirma explícitamente que no ha modificado datasets ni capacidades previstas, y que se conservan las capacidades de texto, razonamiento, agentes, imagen y vídeo del modelo base.

## Capacidades

- Generación de texto y razonamiento en ventanas de contexto muy largas (hasta 262.144 tokens nativos y 1.000.000 extensibles).
- Comprensión de imágenes y vídeo mediante el proyector multimodal BF16 (pipeline image-text-to-text).
- Capacidades agénticas y de razonamiento en varios pasos, heredadas del modelo base según declara el autor.
- Decodificación especulativa mediante MTP/NextN embebido y el sidecar FastMTP, orientada a acelerar la generación en documentos largos y en cadenas de razonamiento.
- Multilingüismo: inglés, chino y categoría genérica "multilingual".
- Perfil "Aggressive" sin censura: respuestas directas, sin comportamiento de rechazo y con preámbulo mínimo (0/465 rechazos declarados por el autor).
- Compatibilidad declarada con endpoints inferidos del tag `endpoints_compatible` del repositorio.
- Tool calling / function calling: no documentado explícitamente en la información disponible.
- Capacidades específicas de código o matemáticas: no documentadas explícitamente; se asume herencia del modelo base, sin confirmación en la ficha.

## Casos de uso

- Análisis de documentación extensa: gracias a los 262.144 tokens de contexto nativo y a las ganancias MTP declaradas en throughput de documentos (hasta 3,02x), permite procesar contratos, expedientes o informes completos en una sola pasada sin fragmentación agresiva.
- Atención al cliente multi-turno con contexto largo: el modelo mantiene historiales extensos y el perfil agresivo reduce rodeos conversacionales, aunque requiere moderación externa si el usuario final no está controlado.
- Agentes autónomos de varios pasos sobre repositorios o bases documentales: el autor declara preservar las capacidades agénticas del base, y el contexto extendido permite mantener el estado de la tarea entre iteraciones.
- Análisis de imágenes y vídeo en pipelines de inspección o catalogación: el proyector BF16 de 931 MB añade entrada visual a un modelo de texto de 27B, desplegable en una sola máquina con llama.cpp.
- Despliegue on-premise con datos sensibles: licencia apache-2.0, pesos GGUF y ejecución local permiten operar sin enviar documentos a APIs externas, algo crítico en sectores legales, sanitarios o industriales.
- Asistente de redacción sin filtros editoriales: útil en generación de ficción, guiones o contenido creativo donde los rechazos automáticos interrumpen el flujo de trabajo.
- Red teaming y evaluación de seguridad: un modelo con 0/465 rechazos declarados sirve como generador de casos adversarios para probar guardarraíles y clasificadores propios.
- Investigación en decodificación especulativa: el sidecar FastMTP-32K y las cabezas MTP embebidas permiten medir el impacto real de la decodificación multi-token sobre una misma base de pesos.
- Traducción y asistencia bilingüe inglés-chino: los idiomas declarados cubren en y zh, con soporte genérico multilingüe adicional sin garantías de calidad documentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluación estándar, ni para el modelo base ni para este derivado. La búsqueda web realizada no devolvió resultados relevantes sobre el modelo (los resultados obtenidos correspondían a portales extranet sin relación). Las únicas cifras de rendimiento son declaraciones del autor, sin verificación independiente:

| Métrica | Valor declarado | Referencia de comparación |
|---|---|---|
| Throughput de generación en documentos (TG) | hasta 3,02x | misma configuración sin MTP |
| Throughput de generación en razonamiento (TG) | hasta 1,93x | misma configuración sin MTP |
| Throughput de generación en documentos | hasta +35,2% | MTP embebido estándar |
| Throughput de generación en razonamiento | hasta +21,1% | MTP embebido estándar |
| Tasa de rechazos | 0/465 peticiones | sin definir el conjunto de evaluación |

## Requisitos de hardware

Los tamaños de archivo son datos del repositorio; la columna de VRAM estimada se deriva de ellos añadiendo un margen de 2 GB para contexto corto y no incluye la caché KV necesaria en contextos largos.

| Cuantización | Tamaño del archivo | VRAM estimada (contexto corto) | GPU objetivo |
|---|---:|---:|---|
| IQ2_M | 10,32 GB | ~12 GB | RTX 3060 12 GB, RTX 4070 12 GB |
| Q2_K_P | 10,68 GB | ~13 GB | GPU de 16 GB |
| IQ3_XS | 12,18 GB | ~14 GB | GPU de 16 GB |
| IQ3_M | 12,79 GB | ~15 GB | GPU de 16 GB |
| Q3_K_P | 13,44 GB | ~16 GB | RTX 4060 Ti 16 GB |
| IQ4_XS | 15,71 GB | ~18 GB | GPU de 24 GB (ajustado) |
| Q4_K_P | 17,92 GB | ~20 GB | RTX 3090, RTX 4090 |
| Q5_K_P | 20,22 GB | ~23 GB | RTX 3090, RTX 4090 (ajustado) |
| Q6_K_P | 25,92 GB | ~28 GB | GPU de 32 GB o dos GPU de 24 GB |
| Q8_K_P | 31,46 GB | ~34 GB | A100 40 GB, A6000 48 GB, H100 80 GB |

- Componentes adicionales: 931 MB del proyector de visión BF16 (solo necesario para entrada de imagen o vídeo) y 903 MB del sidecar FastMTP-32K.
- Cabe en GPU de consumo: sí, desde IQ2_M hasta Q4_K_P en tarjetas de 12 a 24 GB. Las cuantizaciones de 3 bits permiten incluso 12 GB de VRAM con contexto reducido.
- Caché KV: no hay cifras publicadas. El diseño híbrido con 48 capas Gated DeltaNet y solo 16 capas de atención con compuertas reduce el coste de caché frente a un transformer de atención completa, pero a 262.144 tokens de contexto el consumo sigue siendo elevado y depende del runtime.
- Opciones de despliegue: llama.cpp (llama-server), LM Studio, Ollama y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints gestionados. La aceleración FastMTP requiere que el runtime soporte decodificación especulativa con MTP.
- vLLM y TGI: no se documenta soporte para este paquete GGUF ni para el sidecar FastMTP. El propio autor indica que los K_P quants funcionan en llama.cpp y LM Studio.
- Latencia y throughput absolutos: no disponibles. Solo se declaran multiplicadores relativos (3,02x en documentos y 1,93x en razonamiento frente a no-MTP).

## Comparativa con modelos similares

No hay datos de benchmarks que permitan una comparación de rendimiento. La comparación se limita a características declaradas.

| Modelo | Parámetros | Contexto | Licencia | Formato | Benchmarks |
|---|---|---|---|---|---|
| Este modelo (HauhauCS Aggressive MTP GGUF) | 27B nominales (safetensors del repo: 1,86B, inconsistente) | 262.144, extensible a 1.000.000 | apache-2.0 | GGUF | no disponibles |
| Qwen/Qwen3.8-27B (base) | 27B nominales | no disponible en la información proporcionada | no disponible en la información proporcionada | safetensors | no disponibles |
| Otras variantes uncensored de la misma base | no disponible | no disponible | no disponible | GGUF | no disponibles |

Existen otras familias abiertas de 27B-32B con visión y contexto largo en el ecosistema (por ejemplo, alternativas densas multimodales de tamaño similar), pero no se dispone de datos oficiales de ninguna de ellas en la información proporcionada, por lo que no se incluye comparación cuantitativa. Para evaluar alternativas conviene recurrir a benchmarks independientes publicados por terceros.

## Limitaciones y advertencias

- Inconsistencia de parámetros: el nombre y el tamaño de los GGUF apuntan a 27B, pero el recuento de safetensors del repositorio indica 1.863.907.840 parámetros (≈1,86B). Hay que verificar qué contiene realmente el repositorio antes de integrarlo.
- Desajuste de autoría y enlaces: el ID del repositorio es `gshe-x2333/...`, mientras que todos los enlaces de descarga de la model card apuntan a `HauhauCS/...`. Conviene confirmar que los ficheros descargados provienen del repositorio correcto.
- Sin validación comunitaria: 0 descargas, 0 likes y fecha de creación idéntica a la de actualización. No hay evidencia de uso en producción ni de replicación independiente.
- Ausencia total de benchmarks: las únicas métricas son declaraciones del propio autor sobre aceleración MTP y tasa de rechazos, sin metodología publicada.
- Contenido sin censura: el perfil "Aggressive" está diseñado para no rechazar peticiones. Existe riesgo real de generar contenido dañino, ilegal o difamatorio. No es apto para aplicaciones de cara al usuario sin una capa de moderación propia.
- Fiabilidad en trabajo agéntico de contexto largo: el propio autor advierte que para tareas críticas de fiabilidad y contexto largo es más seguro un perfil "Balanced" si existe, lo que implica que la variante Aggressive puede degradar el comportamiento en esos escenarios.
- Alucinación: no hay datos específicos, pero no existe ninguna evaluación publicada que acote el riesgo; en un modelo de 27B sin benchmarks es prudente asumir el riesgo habitual de la categoría.
- Idiomas: solo se declaran en y zh más una categoría genérica "multilingual". No hay garantía documentada de calidad en castellano ni en otras lenguas.
- Contexto de 1.000.000 de tokens: se declara extensible, pero no se especifica el método de extensión, el degradado de calidad asociado ni los requisitos de memoria resultantes.
- Compatibilidad de las cuantizaciones K_P: los nombres no estándar pueden mostrarse como "?" en LM Studio y no ser reconocidos por el widget de compatibilidad de Hugging Face. Es un problema de visualización, no de ejecución, según el autor.
- Licencia: se declara apache-2.0, pero se trata de un derivado de un modelo base de Qwen. Conviene revisar los términos aplicables al modelo base antes de un uso comercial.
- La licencia permisiva no traslada ninguna garantía sobre el contenido generado ni exime al desplegador de responsabilidad legal.
- El sidecar FastMTP y las cabezas MTP requieren soporte específico del runtime; sin él, el modelo funciona pero se pierden las ganancias de velocidad declaradas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/gshe-x2333/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Servidor de Discord del autor: https://discord.gg/SZ5vacTXYf
- Proyector de visión BF16: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/mmproj-Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-BF16.gguf
- Sidecar FastMTP 32K: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-FastMTP-32K.gguf
- Cuantización Q8_K_P: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q8_K_P.gguf
- Cuantización Q4_K_P: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q4_K_P.gguf
- Cuantización IQ4_XS: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-IQ4_XS.gguf
- Cuantización IQ2_M: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-IQ2_M.gguf
- Listado completo de archivos y variantes: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/tree/main
- Búsqueda web: no se han encontrado papers, blogs ni repositorios relevantes sobre este modelo; los resultados obtenidos no guardaban relación con el mismo.
