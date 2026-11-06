# persuasivepost/eduhinglish-gemma-3-4b-it-lora

## Resumen

EduHinglish es un adaptador LoRA (con entrenamiento QLoRA) sobre el modelo base google/gemma-3-4b-it, desarrollado por el usuario persuasivepost en el marco del proyecto EduHinglish de la K.J. Somaiya College of Engineering. Su propósito es responder preguntas del currículo NCERT de las clases 9 y 10 (Biología, Química, Física, Matemáticas y Ciencias Sociales) en hinglish escrito en alfabeto latino (roman script), condicionado a un pasaje de libro de texto recuperado previamente mediante un sistema RAG.

El adaptador no modifica la arquitectura del modelo base: se aplica sobre Gemma 3 4B instruct, un transformer denso de aproximadamente 4.000 millones de parámetros con ventana de contexto de 128.000 tokens. El adaptador añade un comportamiento específico de dominio (respuesta anclada al contexto, formato de prompt con pasaje y pregunta, salida en hinglish) sin necesidad de reentrenar el modelo completo.

Es relevante para desarrolladores que construyen asistentes educativos para el mercado indio, donde el code-mixing hindi-inglés es la norma en la comunicación cotidiana de los estudiantes. El repositorio es pequeño (0,2 GB) y la licencia es la Gemma Terms of Use, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso decoder-only Gemma 3 |
| Parametros totales | Aproximadamente 4.000 millones (modelo base); adaptador LoRA r=16, alpha=32 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Gemma 3 4B) |
| Tipos de cuantizacion | QLoRA en entrenamiento; el adaptador se distribuye en safetensors; cuantizacion del base a cargo del usuario (no especificada) |
| Idiomas soportados | en, hi (salida en hinglish romanizado) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con LoRA de rango 16 y alpha 32 sobre las proyecciones `down_proj`, `gate_proj`, `k_proj`, `o_proj`, `q_proj`, `up_proj` y `v_proj` de todas las capas del modelo base Gemma 3 4B instruct. El uso de QLoRA implica que el modelo base se cuantiza durante el entrenamiento para reducir requisitos de memoria, mientras que los pesos del adaptador se mantienen en precisión completa y se publican en safetensors.

El dominio de entrenamiento es el currículo NCERT de clases 9 y 10 en cinco asignaturas, con un formato de prompt que fuerza la fundamentación en un pasaje de contexto recuperado (`Context:` seguido de `Question:` y una instrucción explícita de responder solo con el contexto dado). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO adicionales sobre el adaptador. El formato de chat es el de Gemma, con un único turno de usuario.

## Capacidades

- Generación de texto conversacional en hinglish romanizado para preguntas educativas.
- Respuesta fundamentada en un pasaje de contexto proporcionado en el prompt (answer grounding).
- Cobertura de cinco asignaturas NCERT de clases 9 y 10: Biología, Química, Física, Matemáticas y Ciencias Sociales.
- Aceptación de una línea opcional de tipo de intención (`Intent Type:`) para condicionar la respuesta.
- Code-mixing hindi-inglés en alfabeto latino, alineado con el registro lingüístico habitual de estudiantes indios.
- Integración con el ecosistema transformers y PEFT mediante `PeftModel.from_pretrained`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Asistente de dudas para estudiantes de secundaria: el adaptador responde preguntas de NCERT clases 9 y 10 usando el pasaje de libro de texto recuperado, lo que reduce respuestas fuera del temario y mantiene la terminología oficial.
- Pipeline RAG educativo: se integra como generador final tras un recuperador de fragmentos NCERT; el formato de prompt con `Context:` y `Question:` está diseñado específicamente para este flujo.
- Tutoría en hinglish: permite a estudiantes que piensan y se comunican en code-mixing hindi-inglés recibir explicaciones en su registro lingüístico natural, en lugar de hindi formal o inglés académico.
- Generación de material de repaso: a partir de un capítulo recuperado, el modelo puede producir explicaciones y respuestas de práctica en hinglish para cuadernos de ejercicios.
- Evaluación de comprensión lectora: dado un pasaje y una pregunta, el modelo sirve como referencia de respuesta anclada al texto para comparar con respuestas de estudiantes.
- Despliegue ligero en entornos con recursos limitados: al ser un adaptador de 0,2 GB sobre un base de 4B, puede servirse en una única GPU consumer con cuantización del base, adecuado para pilotos escolares o entornos edge.
- Investigación sobre code-mixing: el adaptador es un punto de partida reproducible para estudiar la calidad de respuestas en hinglish romanizado frente a modelos base sin ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en sí ocupa aproximadamente 0,2 GB; el coste real de inferencia corresponde al modelo base Gemma 3 4B.
- VRAM estimada para el base en bf16/fp16: en torno a 8-9 GB para pesos, más overhead de activaciones y caché KV.
- VRAM estimada con cuantización de 4 bits del base: aproximadamente 3-4 GB para pesos, más overhead.
- GPU recomendadas: A100 40/80 GB o H100 para servir con concurrencia alta; RTX 4090 (24 GB) para inferencia en fp16 con margen; RTX 3090, 4080 o 4070 Ti para cuantización de 4-8 bits.
- Cabe en GPU consumer: sí, especialmente con cuantización de 4 bits en tarjetas de 8 GB o más; en fp16 requiere 12 GB o más.
- Opciones de despliegue: transformers + PEFT (ruta oficial documentada), vLLM y TGI fusionando el adaptador en el base, llama.cpp/Ollama tras conversión a GGUF del modelo fusionado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EduHinglish Gemma-3-4B LoRA | ~4B (base) + adaptador r=16 | 128k | NCERT 9-10 en hinglish con grounding | Gemma Terms of Use | Hugging Face (adaptador PEFT) |
| google/gemma-3-4b-it | ~4B | 128k | Propósito general, multilingüe | Gemma Terms of Use | Hugging Face |
| Modelos instructivos de ~3-8B de propósito general | 3-8B | Variable | Propósito general | Variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre este adaptador y alternativas, por lo que la comparativa se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente para preguntas NCERT de clases 9 y 10; fuera de ese dominio y formato de prompt es probable que degrade hacia el comportamiento del base.
- La salida está restringida a hinglish romanizado; no se garantiza calidad en hindi en devanagari, inglés formal u otros idiomas.
- Riesgo de alucinación si el pasaje de contexto es irrelevante o insuficiente: la instrucción de responder solo con el contexto no impide que el modelo genere contenido no sustentado.
- Sesgos heredados del modelo base Gemma 3 y del corpus NCERT, que puede reflejar perspectivas curriculares específicas de la India.
- La licencia Gemma Terms of Use impone restricciones de uso comercial y obligaciones de atribución; debe revisarse antes de cualquier despliegue en producción.
- No hay evidencia publicada de evaluación cuantitativa (benchmarks, tasas de error, fidelidad al contexto); el repositorio registra 0 descargas y 0 likes en el momento de la ficha.
- El adaptador requiere fusionarse o cargarse con PEFT; no es un modelo autónomo y depende de la versión del base google/gemma-3-4b-it.
- No se documentan salvaguardas adicionales para uso con menores, colectivo objetivo del modelo.

## Enlaces

- Hugging Face: https://huggingface.co/persuasivepost/eduhinglish-gemma-3-4b-it-lora
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- PEFT (librería): https://github.com/huggingface/peft
- No se han encontrado en la información disponible enlaces a papers, blogs, repositorios o demos adicionales del proyecto EduHinglish.
