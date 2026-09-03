# RobotsMali/soloni-be-kalan-v0

## Resumen

`soloni-be-kalan-v0` es un modelo de reconocimiento automático de voz (ASR) desarrollado por el laboratorio RobotsMali AI4D Lab, específicamente adaptado para el idioma bambara (bm) y orientado a materiales educativos y habla infantil. Se trata de un fine-tuning del modelo base `RobotsMali/soloni-114m-tdt-ctc-v2`, entrenado con NVIDIA NeMo, que combina las arquitecturas FastConformer, TDT (Token-and-Duration Transducer) y CTC (Connectionist Temporal Classification) en un único modelo híbrido de 114 millones de parámetros.

El modelo resuelve el problema de la falta de sistemas ASR funcionales para lenguas africanas de bajos recursos, en particular el bambara, hablado principalmente en Malí. Su relevancia radica en que reduce significativamente la tasa de error en habla infantil temprana (de 56% a 29% WER) y alcanza un rendimiento notable en lectura narrativa fluida (hasta 7% WER), lo que lo convierte en una herramienta útil para aplicaciones educativas y de alfabetización. El modelo soporta decodificación tanto TDT como CTC, y está disponible bajo licencia CC-BY-4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid FastConformer-TDT-CTC |
| Parametros totales | 114 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, no procesa texto como entrada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | bambara (bm) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | checkpoint NeMo (.nemo) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura híbrida FastConformer-TDT-CTC. FastConformer es una optimización del Conformer estándar que incorpora un submuestreo convolucional depthwise-separable de 8x, reduciendo la complejidad computacional. El modelo cuenta con dos decodificadores independientes pero entrenados conjuntamente: un decodificador TDT auto-regresivo (rama por defecto) y un decodificador convolucional optimizado mediante pérdida CTC. Esta doble rama permite flexibilidad en la decodificación y mejora la robustez.

El fine-tuning se realizó sobre el subconjunto combinado Main + Duplicate del dataset `RobotsMali/an-be-kalan-bench`, que totaliza 45.6 horas de audio. Se empleó un mecanismo de early stopping con una paciencia de 15 épocas, y el entrenamiento concluyó en la época 20. De forma deliberada, se omitió SpecAugment (aumento espectral sintético), ya que los autores observaron que la variabilidad física de las voces humanas actuaba como un regularizador más efectivo que la inyección de ruido artificial en este dominio específico.

## Capacidades

- Reconocimiento de voz automático en idioma bambara, tanto para habla adulta como infantil.
- Soporte de doble decodificación: TDT (Token-and-Duration Transducer) y CTC (Connectionist Temporal Classification), seleccionables según el caso de uso.
- Procesamiento de audio mono de 16 kHz, con remuestreo automático si la entrada no cumple esa frecuencia.
- Optimizado para materiales educativos y lectura infantil, con especial rendimiento en texto narrativo fluido y secuencial.
- Capacidad de transcripción de audio en tiempo real o por lotes mediante la API de NeMo.
- No incluye capacidades de tool calling, agentes, visión ni generación de texto; es exclusivamente un modelo de ASR.

## Casos de uso

- Alfabetización infantil en bambara: el modelo puede transcribir lecturas de niños para aplicaciones de evaluación de fluidez lectora, permitiendo a maestros y padres hacer seguimiento del progreso sin intervención manual.
- Creación de audiolibros educativos: transcripción automática de narraciones en bambara para generar subtítulos o textos sincronizados, facilitando la producción de contenido accesible.
- Asistentes de voz para entornos escolares: integración en dispositivos o aplicaciones que respondan a comandos de voz en bambara, mejorando la interacción en aulas con recursos limitados.
- Archivado y digitalización de material oral: transcripción de grabaciones históricas o entrevistas en bambara para preservar y documentar la lengua y la cultura.
- Evaluación de pronunciación en aplicaciones de aprendizaje de idiomas: el modelo puede detectar errores de articulación en hablantes no nativos o niños, proporcionando retroalimentación automática.
- Investigación lingüística: análisis de corpus de habla infantil en bambara, permitiendo estudios sobre adquisición del lenguaje y variación dialectal.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el benchmark oficial `RobotsMali/an-be-kalan-bench` (split test, idioma bambara):

| Metrica | Valor |
|---|---|
| Test WER | 22.0 |
| Test CER | 8.0 |

Además, la model card reporta mejoras cualitativas adicionales: reducción del WER en habla infantil temprana (<10 años) de 56% a 29%, y rendimiento de hasta 7% WER en texto narrativo fluido. Estos datos son declarados por el autor y no han sido verificados de forma independiente.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la documentación disponible. Dado el tamaño del modelo (114M parámetros), se estima que puede ejecutarse en GPUs consumer con al menos 4-6 GB de VRAM, aunque no hay confirmación oficial.
- El modelo se carga mediante NVIDIA NeMo, por lo que requiere una GPU compatible con CUDA para inferencia eficiente. Se ha observado un error de `CUDA error: invalid argument` en el decodificador TDT con CUDA Graphs, que puede desactivarse configurando `use_cuda_graph_decoder = False`.
- Opciones de despliegue: el modelo se integra con el ecosistema NeMo (pip install nemo-toolkit['asr']). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, ya que es un modelo ASR y no un LLM.
- La latencia y el throughput no están documentados. Al ser un modelo compacto, se espera un rendimiento en tiempo real en hardware moderno, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos ASR específicos para bambara con los que comparar directamente. El modelo base `RobotsMali/soloni-114m-tdt-ctc-v2` es su predecesor inmediato, y `soloni-be-kalan-v0` es su versión fine-tuned para el dominio educativo. No hay datos públicos de modelos alternativos para esta lengua en la información proporcionada.

## Limitaciones y advertencias

- Brecha de rendimiento en habla infantil temprana (<10 años): aunque el modelo reduce el WER de 56% a 29% en este grupo, las características fisiológicas de los niños pequeños (perfiles acústicos no formados, ritmos de habla erráticos) siguen suponiendo un desafío fuera de dominio.
- Limitaciones en texto corto y repetitivo: el modelo muestra un rendimiento inferior en secuencias de tokens dispersas y altamente repetitivas (por ejemplo, *Kuloriw* o *Jate*), donde los sesgos del modelo de lenguaje previo dominan.
- Compatibilidad con NeMo: el checkpoint fue creado con NeMo 2.5.0. Cargarlo con versiones más recientes (observado con 2.7.x) puede fallar debido al esquema de decodificación estricto que espera `key_phrase_items_list`. Se proporciona un workaround en la model card.
- Dependencia de NVIDIA NeMo: el modelo no es utilizable sin instalar el toolkit de NeMo, lo que limita su portabilidad a entornos sin GPU NVIDIA.
- Licencia CC-BY-4.0: permite uso comercial y modificación, pero requiere atribución. No hay restricciones adicionales conocidas.
- Riesgo de alucinación: al ser un modelo ASR, no genera texto libre, pero puede producir transcripciones erróneas en condiciones de audio ruidoso o habla no nativa, lo que debe tenerse en cuenta en aplicaciones críticas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RobotsMali/soloni-be-kalan-v0
- Modelo base: https://huggingface.co/RobotsMali/soloni-114m-tdt-ctc-v2
- Dataset de benchmark: https://huggingface.co/datasets/RobotsMali/an-be-kalan-bench
- Issue de compatibilidad con NeMo: https://github.com/NVIDIA-NeMo/Speech/issues/15658
