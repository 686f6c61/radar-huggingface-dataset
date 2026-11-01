# catplusplus/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-NVFP4-Mixed

## Resumen

NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-NVFP4-Mixed es una cuantización mixta del modelo de reconocimiento automático del habla (ASR) `nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B`, publicada por el usuario `catplusplus`. El objetivo declarado es hacer viable la inferencia de un modelo híbrido de gran tamano en una única GPU de consumo de 16 GB (RTX 5060 Ti), algo imposible con los pesos originales en BF16, que superan los 67 GB. La receta combina BF16 para el codificador perceptivo Conformer y los expertos compartidos, MXFP8 para las proyecciones del mezclador Mamba-2 y NVFP4 (W4A16) para los 128 expertos enrutados del decodificador MoE.

El modelo base emplea una arquitectura híbrida poco habitual en ASR: un frontend Conformer no causal sobre mel-espectrogramas, un backbone de atención lineal Mamba-2 y un decodificador Mixture-of-Experts con 128 expertos y aproximadamente 4,3 mil millones de parámetros activos por token. Según los safetensors del repositorio, el checkpoint cuantizado contiene 17.675.051.045 parámetros, frente a los "34B totales" que menciona la model card del autor; esta discrepancia no se aclara en la información disponible y conviene tratarla con cautela.

La relevancia práctica es doble: por un lado, demuestra una estrategia de cuantización por capas guiada por perfilado estructural (no uniforme) para arquitecturas híbridas SSM/MoE; por otro, documenta trampas concretas de integración con SGLang (mapeo de módulos empaquetados, prefijos de claves, expertos compartidos) que afectan a cualquiera que despliegue modelos MoE cuantizados en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: frontend Conformer no causal (percepción) + backbone Mamba-2 (atención lineal) + decodificador MoE de 128 expertos |
| Parametros totales | 17.675.051.045 según safetensors del repo cuantizado; la model card del autor cita "34B totales" (dato no conciliado) |
| Parametros activos | Aproximadamente 4,3 mil millones por token (según model card) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Mixta: BF16 (percepción Conformer y expertos compartidos), MXFP8 e4m3fn con escalas de bloque de 32 (46 matrices de proyección Mamba-2), NVFP4 W4A16 (128 expertos enrutados en 23 capas MoE) |
| Idiomas soportados | Inglés, japonés y multilingüe (según etiquetas); el autor menciona además code-switching con acentos eslavos y de Europa del Este |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (modelopt_mixed, 8-bit) |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina tres componentes. El frontend perceptivo es un Conformer no causal que convierte mel-espectrogramas en representaciones acústicas; el autor lo mantiene íntegramente en BF16 porque cuantizarlo degrada la sensibilidad perceptiva. El mezclador es un backbone Mamba-2 de atención lineal cuyas proyecciones `in_proj` y `out_proj` se leen en cada paso de decodificación; el autor las reempaqueta en MXFP8 según la especificación de microscaling de Open Compute Project, con escala calculada como 2^(byte−127), logrando una SNR de reconstrucción de 31,5 dB (frente a 20,4 dB en 4 bits) y un ahorro de 744 MB de VRAM residente. El decodificador es un MoE de 128 expertos enrutados distribuidos en 23 capas, cuantizados a NVFP4 W4A16, lo que reduce el stack de expertos de más de 50 GB a 13,68 GB.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base utilizó RLHF o DPO. La model card del autor se centra en el proceso de cuantización y despliegue, no en el entrenamiento. La innovación técnica destacable es la estrategia de cuantización no uniforme guiada por perfilado estructural, junto con el uso de "paged experts": los expertos enrutados se almacenan en RAM del host y se paginan a la GPU en K=36 ranuras, lo que permite que el modelo quepa en 16 GB de VRAM a costa de tráfico PCIe.

## Capacidades

- Reconocimiento automático del habla (ASR) sobre audio, con pipeline `automatic-speech-recognition`.
- Transcripción multilingüe con soporte declarado de inglés, japonés y modo multilingüe.
- Manejo de code-switching entre idiomas y de acentos no nativos, según las pruebas informales descritas por el autor (el modelo base se eligió precisamente por evitar la "deriva" de Whisper hacia transliteraciones cirílicas erróneas).
- Transcripción de audio de micrófono de escritorio, incluyendo grabaciones de baja intensidad, donde el autor reporta mejor comportamiento que Qwen-Omni.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta capacidad de visión, audio generativo ni modo "thinking".
- No se documenta diarización de hablantes ni marcas de tiempo.

## Casos de uso

- Subtitulado y transcripción de clases de idiomas: el modelo puede transcribir sesiones de práctica de japonés con hablantes nativos de inglés, un escenario donde el autor reporta fallos de Whisper y de Gemma-4 Audio por conversación no solicitada o bucles de repetición.
- Asistentes de voz locales en hardware de consumo: al caber en una RTX 5060 Ti de 16 GB, permite montar un pipeline de voz completamente local sin depender de APIs en la nube, útil para privacidad y para entornos sin conectividad.
- Transcripción de reuniones multilingües con code-switching: la combinación de inglés, japonés y modo multilingüe cubre equipos distribuidos que alternan idiomas dentro de una misma intervención.
- Dictado técnico en estaciones de trabajo: la preservación del frontend Conformer en BF16 y de las proyecciones Mamba-2 en MXFP8 mantiene la precisión acústica en micrófonos de escritorio, adecuada para dictado de notas o documentación.
- Investigación en cuantización de arquitecturas híbridas: el checkpoint sirve como referencia reproducible de una receta mixta BF16/MXFP8/NVFP4 con métricas de SNR y trampas de integración documentadas, útil para quienes experimenten con SSM y MoE.
- Despliegue en SGLang con paginación de expertos: el formato `paged-experts` permite servir el modelo en servidores con poca VRAM y mucha RAM, un patrón aplicable a entornos de inferencia con GPUs modestas y gran capacidad de memoria del sistema.
- Evaluación comparativa de ASR en acentos no nativos: útil para equipos que necesiten medir la robustez de distintos modelos ante acentos eslavos o de Europa del Este, un punto débil documentado en alternativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta métricas internas del proceso de cuantización: SNR de reconstrucción de 31,5 dB para MXFP8 en las proyecciones Mamba-2 (frente a 20,4 dB en 4 bits) y cifras de ahorro de memoria (744 MB en el mezclador, reducción del stack de expertos de más de 50 GB a 13,68 GB). No hay datos de WER, MMLU, HumanEval ni comparaciones cuantitativas con otros sistemas ASR.

## Requisitos de hardware

- VRAM: el objetivo de diseño es 16 GB; el autor lo ejecuta en una RTX 5060 Ti de 16 GB con los expertos enrutados paginados desde RAM del host (K=36 ranuras en GPU).
- Memoria del sistema: se requiere RAM del host suficiente para almacenar el stack de expertos NVFP4 (13,68 GB) más el resto de pesos; el repositorio completo ocupa 21,8 GB.
- GPU recomendadas: RTX 5060 Ti de 16 GB como mínimo validado. No se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, al menos en la RTX 5060 Ti de 16 GB citada, con paginación de expertos.
- Despliegue: SGLang es el runtime documentado y el único con soporte explícito de `paged-experts` y del formato `modelopt_mixed`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor advierte que el cuello de botella es PCIe por la paginación de expertos, pero no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| Nemotron-3.5-Transcribe-30B-A4B (NVFP4-Mixed, este) | 17,7B en safetensors (4,3B activos) | No disponible | EN, JA, multilingüe | Apache 2.0 | HuggingFace, runtime SGLang | Cuantización mixta para 16 GB VRAM |
| Whisper (familia) | No disponible en la información | No disponible | Multilingüe | No disponible en la información | Amplia | El autor reporta deriva del clasificador de idioma con acentos no nativos |
| Gemma-4 Audio | No disponible en la información | No disponible | No disponible | No disponible en la información | No disponible en la información | El autor reporta respuestas conversacionales no solicitadas y bucles de repetición en tareas de transcripción |
| Qwen-Omni | No disponible en la información | No disponible | No disponible | No disponible en la información | No disponible en la información | El autor reporta deriva acústica y difuminado de fonemas en micrófonos silenciosos |

Los datos de los modelos comparables provienen únicamente de las impresiones cualitativas del autor de la cuantización; no se dispone de especificaciones verificadas ni de métricas objetivas para establecer una comparación rigurosa.

## Limitaciones y advertencias

- La model card está redactada en un tono narrativo y humorístico, con afirmaciones cualitativas no respaldadas por métricas públicas; trátese como documentación de ingeniería, no como evaluación formal.
- Discrepancia de parámetros: los safetensors indican 17,7B totales, mientras la model card habla de "34B totales"; no se aclara en la información disponible. Verificar antes de dimensionar infraestructura.
- El modelo es una cuantización de un modelo de otro autor; los sesgos del modelo base (no documentados) se heredan y la cuantización puede introducir degradaciones adicionales no medidas.
- Riesgo de alucinación en ASR: no se han publicado tasas de error (WER) ni evaluaciones de fidelidad de transcripción; el autor solo aporta impresiones subjetivas.
- La cuantización NVFP4 de los expertos enrutados puede degradar la calidad en dominios acústicos no representados en las pruebas del autor.
- Dependencia fuerte de SGLang: la model card documenta que omitir `packed_modules_mapping` provoca fallback silencioso a BF16 y OOM, y que un prefijo de claves incorrecto falla sin error. Cualquier otro runtime requeriría trabajo de integración no documentado.
- Cuantizar los expertos compartidos rompe la decodificación (el kernel FusedMoE emite guiones repetidos sin token EOS); deben permanecer en BF16.
- El rendimiento depende del ancho de banda PCIe por la paginación de expertos; no hay cifras de latencia ni throughput publicadas.
- Idiomas: solo inglés, japonés y multilingüe declarados; no hay evaluación de otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base y de los pesos originales de NVIDIA antes de producción.
- Solo 18 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/catplusplus/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-NVFP4-Mixed
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
