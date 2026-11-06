# mradermacher/Baptist-Christian-Bible-Expert-12b-GGUF

## Resumen

Baptist-Christian-Bible-Expert-12b-GGUF es la versión cuantizada en formato GGUF del modelo sleepdeprived3/Baptist-Christian-Bible-Expert-12b, un ajuste fino de 12.247.782.400 parámetros (aproximadamente 12B) especializado en temática bautista, cristiana, bíblica y teológica. La cuantización ha sido realizada por mradermacher, un conocido publicador de versiones GGUF de la comunidad, y se distribuye bajo licencia Apache 2.0.

El modelo resuelve el problema de desplegar un asistente conversacional especializado en dominio teológico en hardware de consumo mediante cuantización de pesos. Al estar en formato GGUF, es compatible con motores de inferencia como llama.cpp u Ollama, lo que permite ejecutarlo localmente sin depender de infraestructura en la nube. El modelo base no especifica públicamente su arquitectura interna ni su longitud de contexto en la información disponible, aunque por su tamaño (12B) y su naturaleza conversacional se infiere un transformer decoder-only típico.

La relevancia actual radica en su nicho: asistentes especializados en estudios bíblicos y teología con despliegue local. No obstante, la información pública es escasa (399 descargas, 1 like en el momento de la consulta), lo que limita la evaluación de su calidad real frente a modelos generalistas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base sin arquitectura declarada; por tamaño, transformer decoder-only presumible) |
| Parametros totales | 12.247.782.400 (~12B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo base (sleepdeprived3/Baptist-Christian-Bible-Expert-12b). Por el número de parámetros (12,2B) y su uso conversacional, se trata presumiblemente de un transformer decoder-only, pero no hay confirmación en la documentación disponible. Tampoco se detallan los datos de entrenamiento: no se especifica el número de tokens, la composición del dataset teológico, ni si se aplicaron fases de RLHF, DPO o ajuste supervisado. Los tags del modelo (Baptist, Christian, Bible, Theology, Jesus, SBC) sugieren un ajuste fino orientado a doctrina bautista y estudios bíblicos, probablemente mediante fine-tuning supervisado sobre un modelo base generalista, pero esto no está confirmado.

La contribución técnica de esta ficha concreta es la cuantización: mradermacher ha generado cuantizaciones estáticas (sin imatrix ni weighted quants, según indica el propio autor en la model card) en 11 variantes que van desde 4,9 GB (Q2_K) hasta 13,1 GB (Q8_0). No se declaran innovaciones arquitectónicas propias (atención lineal, decodificación especulativa, MoE, SSM) en la información disponible.

## Capacidades

- Generación de texto conversacional en inglés, orientada a temática bíblica, teológica y bautista.
- Respuesta a preguntas sobre doctrina, pasajes bíblicos y tradición cristiana (según el dominio declarado por los tags).
- Conversación multi-turno (tag "conversational").
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que sugiere uso vía API de inferencia.
- Soporte de tool calling / function calling: no disponible en la información.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Asistente de estudio bíblico local: desplegado con llama.cpp u Ollama en una estación de trabajo, el modelo puede responder consultas sobre pasajes, contextos históricos y doctrina bautista sin enviar datos a servicios externos. Adecuado por su especialización de dominio y su licencia permisiva.
- Chatbot para comunidades eclesiásticas: integrado en una web o aplicación de una iglesia bautista, gestiona preguntas frecuentes de miembros y visitantes sobre doctrina y prácticas congregacionales. El formato GGUF permite alojarlo en servidores modestos.
- Herramienta de preparación de sermones: el modelo puede generar borradores, esquemas y referencias cruzadas sobre temas teológicos, sirviendo como punto de partida para pastores y estudiantes de teología.
- Educación teológica asistida: en entornos de formación, actúa como tutor conversacional que responde dudas de alumnos sobre doctrina bautista, con despliegue en el aula o en laboratorios con GPU de consumo.
- Prototipado de aplicaciones de nicho religioso: gracias a la licencia Apache 2.0 y al formato GGUF, desarrolladores pueden experimentar con un asistente teológico sin costes de API y con control total sobre el modelo.
- Investigación sobre sesgos en modelos de dominio: útil para estudiar cómo un ajuste fino confesional (bautista) moldea las respuestas en cuestiones doctrinales controvertidas, comparándolo con modelos generalistas.
- Despliegue en hardware sin conectividad: en contextos con requisitos de privacidad o sin internet, la versión Q4_K_M (7,6 GB) puede ejecutarse en una GPU de consumo de gama alta o incluso en CPU con suficiente RAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, más overhead de contexto):
  - Q2_K (4,9 GB): ~6 GB de VRAM.
  - Q4_K_M (7,6 GB): ~9-10 GB de VRAM.
  - Q5_K_M (8,8 GB): ~11 GB de VRAM.
  - Q6_K (10,2 GB): ~12-13 GB de VRAM.
  - Q8_0 (13,1 GB): ~15-16 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB) para Q8_0 con contexto amplio; RTX 4080/4070 Ti Super (16 GB) para Q5_K_M o Q6_K; RTX 4060 Ti 16 GB para Q4_K_M con margen.
- Cabe en GPU de consumo: sí, desde Q2_K en GPUs de 8 GB (RTX 3060 Ti, RTX 4060) hasta Q8_0 en GPUs de 16-24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, vLLM o TGI (no confirmado para este ajuste fino concreto).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Baptist-Christian-Bible-Expert-12b-GGUF | ~12B | no disponible | Apache 2.0 | GGUF | Especializado en teologia bautista; comunidad pequena |
| Modelos generalistas de ~12B (p. ej. Mistral-Nemo-12B) | ~12B | 128K (en Mistral-Nemo) | Apache 2.0 | safetensors, GGUF | Cobertura general; no especializado en teologia |
| Modelos teologicos de nicho en HF | variable | no disponible | variable | variable | Ecosistema fragmentado; dificil comparacion directa |

No se dispone de datos de rendimiento comparativo para este modelo, por lo que la comparativa se limita a parámetros, licencia y disponibilidad. Cualquier comparación de calidad requeriría evaluación empírica no publicada.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un ajuste fino confesional bautista (tag "SBC", Convención Bautista del Sur), es probable que las respuestas reflejen una perspectiva doctrinal concreta y no una visión neutral o ecuménica. No hay documentación sobre este extremo.
- Riesgo de alucinación: alto en citas bíblicas y referencias históricas, dado que no se documentan mecanismos de verificación ni datos de entrenamiento. No debe usarse como fuente autoritativa sin verificación humana.
- Limitaciones de contexto e idioma: solo inglés declarado; la longitud de contexto no está documentada, lo que impide planificar usos con documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base (sleepdeprived3/Baptist-Christian-Bible-Expert-12b) por si impone condiciones adicionales no reflejadas en esta ficha.
- Caveats para producción: el modelo tiene muy poca tracción (399 descargas, 1 like), sin benchmarks ni evaluación independiente; no hay garantías de calidad. La model card no documenta el proceso de entrenamiento, lo que dificulta auditar sesgos y robustez. Las cuantizaciones son estáticas (sin imatrix), por lo que la pérdida de calidad en Q2_K y Q3 puede ser significativa.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Baptist-Christian-Bible-Expert-12b-GGUF
- Modelo base: https://huggingface.co/sleepdeprived3/Baptist-Christian-Bible-Expert-12b
- Página de descargas de mradermacher para este modelo: https://hf.tst.eu/model#Baptist-Christian-Bible-Expert-12b-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Empresa de mradermacher: https://www.nethype.de/
