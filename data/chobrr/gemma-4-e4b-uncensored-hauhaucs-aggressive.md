# Chobrr/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive

## Resumen

Gemma-4-E4B-Uncensored-HauhauCS-Aggressive es una variante "abliterated" (sin censura) del modelo multimodal google/gemma-4-e4b-it, publicada por el usuario Chobrr en HuggingFace y derivada del trabajo de cuantizacion de HauhauCS. El objetivo declarado por el autor es eliminar los rechazos de seguridad del modelo original sin alterar sus capacidades: se mantiene el mismo pipeline image-text-to-text, el mismo entrenamiento y el mismo conjunto de funcionalidades, pero se interviene la direccion de rechazo en los pesos para que el modelo genere contenido que el original bloquearia. El autor afirma 0 rechazos en 465 pruebas, una cifra no verificable de forma independiente con la informacion disponible.

El modelo es nativamente multimodal: acepta texto, imagen, video y audio como entrada, con 42 capas, atencion hibrida (sliding window de 512 tokens combinada con atencion completa) y 18 capas KV compartidas para reducir el coste de memoria. La ventana de contexto declarada es de 131.000 tokens. La model card indica "4B parametros", mientras que el recuento real de safetensors en el repositorio es de 7.518.069.290 parametros; esta discrepancia es coherente con la nomenclatura "E4B" (parametros efectivos) heredada de la familia Gemma, aunque el autor no detalla el desglose.

Su relevancia practica es acotada y muy especifica: es una release de comunidad con 0 descargas y 0 "likes" en el momento de la consulta, distribuida unicamente en formato GGUF cuantizado, pensada para ejecucion local en llama.cpp, LM Studio, Jan o koboldcpp. No es un modelo de proposito general para produccion, sino una herramienta para casos donde se necesita un modelo multimodal pequeno sin filtros de rechazo y con licencia Gemma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con atencion hibrida: sliding window de 512 tokens combinada con atencion completa; 42 capas; 18 capas KV compartidas |
| Parametros totales | 7.518.069.290 (safetensors). La model card declara "4B parametros" (nomenclatura E4B) |
| Parametros activos | no disponible (la nomenclatura "E4B" sugiere parametros efectivos, pero no se detalla el desglose ni si hay carga condicional por capa) |
| Longitud de contexto | 131K tokens |
| Tipos de cuantizacion | GGUF: Q8_K_P, Q8_0, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, Q2_K_P y mmproj f16 para vision/audio |
| Idiomas soportados | en, multilingual (sin listado explicito de idiomas) |
| Licencia | Gemma (terminos de uso de Gemma) |
| Formato de pesos | GGUF (principal, cuantizado); safetensors declarados en el recuento de parametros |
| Modelo base | google/gemma-4-e4b-it |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 61,6 GB |

## Arquitectura y entrenamiento

La arquitectura sigue la del modelo base google/gemma-4-e4b-it, un transformer multimodal con un esquema de atencion hibrida: capas con ventana deslizante de 512 tokens intercaladas con capas de atencion completa, 42 capas en total y 18 capas con KV compartidas. El reparto KV compartido reduce el consumo de memoria durante la inferencia a contexto largo, algo critico cuando se trabaja con ventanas de 131K tokens. El modelo procesa de forma nativa texto, imagen, video y audio, y en el formato GGUF la parte multimodal se sirve mediante un proyector separado (mmproj en f16, 945 MB).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO u otras tecnicas de alineamiento aplicadas sobre el base. La intervencion realizada por el autor es de tipo "abliteration": modificacion de los pesos para suprimir la direccion de rechazo, sin reentrenamiento ni cambios en los datos, segun afirma la propia model card ("No changes to datasets or capabilities"). Las cuantizaciones se generan con importance matrix (imatrix) especifica para preservar la calidad sobre pesos abliterated, e incluyen el perfil propietario K_P del autor, que segun su descripcion mejora la calidad equivalente en uno o dos niveles de cuantizacion a cambio de un 5-15 % mas de tamano de archivo.

El autor menciona en la model card que Gemma 4 no recibio tanto tiempo de prueba manual a contexto largo como otras de sus releases, y que Google emplea tecnicas similares a los generative reward models (GenRM) como criticos internos, lo que complica el proceso de "uncensoring" real. Se trata de una advertencia del propio autor sobre la fiabilidad del resultado, no de un dato tecnico verificado.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat (requiere el flag `--jinja` en llama.cpp para un manejo correcto de la plantilla).
- Razonamiento y generacion de codigo: el autor afirma que no se han alterado las capacidades respecto al modelo base, aunque no aporta mediciones que lo respalden.
- Vision: entrada de imagenes mediante el proyector mmproj (f16) que acompana al GGUF principal.
- Video: la model card declara soporte nativo de video, sin detallar resolucion, numero de frames ni formato de entrada.
- Audio: la model card declara soporte nativo de audio, tambien sin detalles de muestreo o duracion maxima.
- Multilingue: etiquetado como "multilingual", con ingles como idioma principal declarado; no se especifica la lista de idiomas.
- Modo sin rechazos: el autor afirma 0/465 rechazos en la variante "Aggressive", con la salvedad de que el modelo puede anadir avisos cortos heredados del entrenamiento del base, sin bloquear la generacion.
- Sin datos disponibles sobre soporte de tool calling, function calling o comportamiento agentico multi-paso en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: comparar las respuestas del modelo abliterated frente al base google/gemma-4-e4b-it permite estudiar como se comporta la direccion de rechazo en un modelo multimodal pequeno, con el mismo pipeline y la misma tokenizacion.
- Red teaming y evaluacion de robustez: usar la variante sin filtros como generador adversario para construir conjuntos de prompts que prueben clasificadores de contenido o guardarrailes en un sistema de moderacion.
- Generacion creativa sin restricciones tematicas: escritura de ficcion con violencia, tematica adulta o contenido delicado, donde el modelo base tenderia a rechazar la peticion; el contexto de 131K tokens permite mantener arcos narrativos largos con coherencia.
- Analisis de documentos largos con componentes visuales: informes con tablas, capturas o diagramas incrustados, aprovechando la ventana de 131K tokens y el proyector multimodal para extraer y resumir informacion combinando texto e imagen.
- Transcripcion y analisis de audio local: con el mmproj cargado, procesar notas de voz o fragmentos de audio junto a texto en un mismo prompt, sin enviar datos a servicios externos.
- Asistente local en equipos de gama media: con cuantizaciones Q4 (5,0-5,1 GB) se puede ejecutar en una GPU de consumo de 8-12 GB o incluso en CPU, lo que habilita prototipos offline de asistente conversacional con vision.
- Destilacion de datos sinteticos: generar grandes volumenes de texto o pares imagen-texto sin rechazos para entrenar o ajustar modelos posteriores, siempre que la licencia Gemma lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni comparaciones numericas con el modelo base. La unica metrica declarada por el autor es "0/465 refusals" en la variante Aggressive, que mide tasa de rechazo y no calidad de tarea. Tampoco se aportan mediciones de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada (a partir del tamano de archivo declarado, mas overhead de runtime y cache KV para contexto moderado):
  - Q8_K_P (7,6 GB): ~9-11 GB de VRAM.
  - Q6_K_P (5,9 GB): ~7-9 GB.
  - Q5_K_P (5,5 GB) / Q5_K_M (5,4 GB): ~7-8 GB.
  - Q4_K_P (5,1 GB) / Q4_K_M (5,0 GB): ~6-7 GB.
  - IQ4_XS (4,8 GB): ~6 GB.
  - Q3_K_P / Q3_K_M (4,6 GB): ~5-6 GB.
  - IQ3_M (4,4 GB) / Q2_K_P (4,2 GB): ~5 GB o menos.
  - El proyector multimodal mmproj f16 anade 945 MB si se usa vision o audio.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para las cuantizaciones Q4-Q6 con contexto amplio; RTX 4090 (24 GB) para Q8_K_P con contexto largo; A100 40/80 GB y H100 para despliegue multi-usuario con vLLM y contexto completo de 131K.
- Compatibilidad con GPU de consumo: si. Las cuantizaciones Q4 caben en GPUs de 8 GB (RTX 3070, RTX 4060) con contexto reducido; las Q2/IQ3 permiten incluso ejecucion parcial en CPU.
- Opciones de despliegue: llama.cpp (con `--jinja`; `-ngl 99` para descargar todas las capas en GPU), LM Studio, Jan, koboldcpp y cualquier runtime compatible con GGUF. No hay pesos en safetensors listos para vLLM o TGI en la informacion disponible, aunque el tag `endpoints_compatible` sugiere compatibilidad con endpoints de HuggingFace.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo a primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Benchmarks |
|---|---|---|---|---|---|
| Gemma-4-E4B-Uncensored-HauhauCS-Aggressive | 7,518B en safetensors (card: "4B") | 131K | Texto, imagen, video, audio | Gemma | no disponible |
| google/gemma-4-e4b-it (base) | no disponible en la informacion proporcionada | 131K (heredado) | Texto, imagen, video, audio | Gemma | no disponible |
| google/gemma-3n-E4B-it | ~4B efectivos | 32K | Texto, imagen, audio, video | Gemma | no disponible en esta ficha |
| google/gemma-3-4b-it | 4B | 128K | Texto, imagen | Gemma | no disponible en esta ficha |

La comparativa cuantitativa no es posible con la informacion proporcionada: no hay cifras de benchmarks para este modelo ni para su base. En terminos de categoria, compite con modelos multimodales pequenos de la propia familia Gemma y con alternativas de ~4B con vision (Qwen2.5-VL-3B, SmolVLM2). Frente a estas, su diferencia principal no es el rendimiento sino la ausencia de rechazos y el formato de distribucion (unicamente GGUF cuantizado, sin pesos completos listos para fine-tuning en el repositorio publico consultado).

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna medicion de calidad (MMLU, GSM8K, HumanEval, MMMU) publicada por el autor, ni comparacion verificable con el modelo base. La afirmacion "no changes to capabilities" no esta respaldada por datos.
- La abliteration puede degradar capacidades: la intervencion sobre los pesos para eliminar rechazos es conocida por afectar a la coherencia y al razonamiento en modelos pequenos. El autor no aporta evaluaciones que descarten este efecto.
- Riesgo de contenido danino: la variante "Aggressive" genera contenido que el modelo base bloquearia. Puede producir instrucciones peligrosas, contenido ilegal o material dañino sin filtro alguno. El autor advierte que pueden aparecer avisos cortos heredados del entrenamiento, pero no rechazos.
- Alucinacion: no hay datos especificos, pero al ser un modelo de ~4B efectivos la tasa de alucinacion es previsiblemente alta en tareas de conocimiento factual y razonamiento largo.
- Sesgos: el modelo base Gemma no publica una auditoria de sesgos en la informacion disponible, y la abliteration no corrige sesgos, solo elimina rechazos.
- Idioma: el unico idioma explicitamente declarado es el ingles. El soporte multilingue no esta detallado ni verificado, por lo que el rendimiento en castellano es una incognita.
- Contexto largo poco probado: el propio autor reconoce que Gemma 4 recibio menos tiempo de prueba manual a contexto largo que otras de sus releases, lo que cuestiona el rendimiento real cerca de los 131K tokens.
- Licencia Gemma: es una licencia con condiciones de uso, politica de uso prohibido y obligaciones de atribucion. Cualquier uso comercial debe revisar los terminos de Gemma, y la redistribucion de la variante abliterated puede entrar en conflicto con la politica de uso aceptable.
- Release sin validacion de la comunidad: 0 descargas y 0 "likes" en el momento de la consulta. No hay evidencia de terceros sobre funcionamiento, estabilidad o calidad.
- Inconsistencia de autoría: la ficha de HuggingFace figura a nombre de Chobrr, pero los enlaces de descarga de la model card apuntan al repositorio HauhauCS. Conviene verificar el origen real de los pesos antes de usarlos en cualquier entorno.
- Inconsistencia de parametros: el dato de safetensors (7,518B) no coincide con la afirmacion "4B parametros" de la model card. No se detalla si existe carga condicional de parametros.
- Sin soporte confirmado de tool calling ni de agentes: no se menciona en la informacion disponible, lo que limita su uso en pipelines automaticos que dependan de function calling.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/Chobrr/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive
- Modelo base: https://huggingface.co/google/gemma-4-e4b-it
- Repositorio de cuantizaciones referenciado en la model card: https://huggingface.co/HauhauCS/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive
- Discord del autor: https://discord.gg/SZ5vacTXYf
- Cuantizacion Q8_K_P: https://huggingface.co/HauhauCS/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive/resolve/main/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive-Q8_K_P.gguf
- Cuantizacion Q4_K_M: https://huggingface.co/HauhauCS/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive/resolve/main/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive-Q4_K_M.gguf
- Proyector multimodal mmproj f16: https://huggingface.co/HauhauCS/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive/resolve/main/mmproj-Gemma-4-E4B-Uncensored-HauhauCS-Aggressive-f16.gguf
