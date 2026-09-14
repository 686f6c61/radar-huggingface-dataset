# mradermacher/Qwen2.5-3B-Instruct-Sheldon-SFT-v2-merged-GGUF

## Resumen

Esta ficha describe `mradermacher/Qwen2.5-3B-Instruct-Sheldon-SFT-v2-merged-GGUF`, una recuantización en formato GGUF del modelo `zachchxn/Qwen2.5-3B-Instruct-Sheldon-SFT-v2-merged`. Se trata, por tanto, de un artefacto de distribución más que de un modelo entrenado desde cero: mradermacher toma los pesos ya fusionados (merged) de un ajuste supervisado sobre Qwen2.5-3B-Instruct y los convierte a GGUF en doce niveles de cuantización distintos, desde Q2_K (1,4 GB) hasta f16 (6,3 GB). El modelo arrastra los tags `persona`, `roleplay`, `math` y `sheldon-cooper`, lo que indica que el fine-tuning original está orientado a adoptar la personalidad del personaje Sheldon Cooper con un componente de matemáticas.

El modelo cuenta con 3.085.938.688 parámetros (aproximadamente 3,09 mil millones) y hereda la arquitectura del Qwen2.5-3B-Instruct, un transformer decoder-only denso. La relevancia práctica de esta publicación es doble: por un lado, permite ejecutar un modelo con personalidad ajustada en hardware muy modesto (incluso en CPU o en GPUs de gama de entrada con 4-6 GB de VRAM); por otro, ofrece un abanico amplio de cuantizaciones para comparar el equilibrio calidad/tamano en una tarea concreta de persona y matemáticas.

Se publica bajo licencia apache-2.0, está etiquetado únicamente para inglés (`en`) y, en el momento de redactar esta ficha, no registra descargas ni "likes" ni dispone de benchmarks publicados. La fecha de creación declarada en el repositorio es 2026-09-14.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen2.5-3B-Instruct); detalles de capas y atención no especificados en la ficha del repositorio |
| Parámetros totales | 3.085.938.688 (≈3,09 mil millones), según safetensors |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la información proporcionada. El modelo base (Qwen2.5-3B-Instruct) declara 32 768 tokens nativos, ampliables con YaRN; no se confirma que el fine-tuning de persona conserve esa configuración |
| Tipos de cuantización | IQ4_XS, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (12 niveles) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el repositorio es exclusivamente GGUF; `library_name: transformers` en la tarjeta) |
| Modelo base | zachchxn/Qwen2.5-3B-Instruct-Sheldon-SFT-v2-merged (a su vez derivado de Qwen2.5-3B-Instruct) |
| Tamaño del repositorio | 27,9 GB (incluye todas las cuantizaciones) |
| Tarea declarada | Conversacional / generación de texto |
| Etiquetas | merged, persona, roleplay, math, qwen2.5, sheldon-cooper, cs2881r |
| Fecha de creación (según repositorio) | 2026-09-14 |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-3B-Instruct: un transformer decoder-only denso con normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). No hay innovaciones arquitectónicas propias en esta publicación, ya que mradermacher únicamente realiza la conversión y cuantización del checkpoint fusionado de zachchxn. La ficha del repositorio no aporta detalles sobre el número de capas, dimensión oculta ni la configuración exacta de atención (número de cabezas o uso de grouped-query attention), por lo que esos datos quedan como no disponibles en la información proporcionada.

Sobre el entrenamiento, lo único deducible de los metadatos es que el modelo original pasó por un ajuste supervisado (SFT, de ahí el sufijo `Sheldon-SFT-v2`) sobre el instruct de Qwen2.5, orientado a una persona concreta (Sheldon Cooper) y con etiqueta de matemáticas. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, si hubo fases de RLHF o DPO, ni el proceso de fusión de pesos. La cuantización aplicada por mradermacher es de tipo estático (el README indica `static quants` y `quantize_version: 2`, con `output_tensor_quantised: 1`), y el autor señala que no tiene previsto publicar cuantizaciones ponderadas/imatrix salvo petición en la sección de discusiones.

## Capacidades

- Generación de texto conversacional en inglés, con especial énfasis en mantener una persona concreta (Sheldon Cooper) a lo largo de la conversación.
- Roleplay y diálogo multi-turno con estilo característico, gracias al ajuste SFT sobre el modelo instruct.
- Resolución de problemas de matemáticas y razonamiento cuantitativo básico (etiqueta `math` en los metadatos), aunque sin benchmarks publicados que lo cuantifiquen.
- Modo instructivo: el modelo base Qwen2.5-3B-Instruct es un modelo instruido, por lo que se espera seguimiento de instrucciones y formato de chat.
- Soporte de tool calling / function calling: no confirmado en la información proporcionada para esta variante ajustada.
- Capacidades de agente o razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no; el modelo está etiquetado únicamente como inglés.
- Capacidades especiales: no se documentan modos de pensamiento explícito, visión ni audio.

## Casos de uso

- Chatbot de personaje (roleplay): el ajuste SFT está específicamente entrenado para reproducir la personalidad de Sheldon Cooper, por lo que es adecuado para aplicaciones de entretenimiento, bots de Discord o demos de personajes donde el tono pedante y las referencias científicas forman parte de la experiencia.
- Generación de diálogos para videojuegos o narrativa interactiva: con un modelo de 3B cuantizado a Q4_K_M (2,0 GB) se puede desplegar localmente un NPC con personalidad fija sin coste de API y con latencia baja en GPU de gama media.
- Tutoría de física y matemáticas con tono característico: la combinación de la etiqueta `math` y la persona permite construir un asistente de estudio que explique ejercicios manteniendo un estilo reconocible, útil en prototipos educativos.
- Prototipado offline en portátil sin GPU: las cuantizaciones Q2_K (1,4 GB) y Q3_K_S (1,6 GB) permiten ejecutar el modelo en CPU con llama.cpp u Ollama, lo que facilita pruebas de concepto en entornos sin acelerador.
- Base para fine-tuning adicional o LoRA: al ser un checkpoint merged y con licencia apache-2.0, puede servir como punto de partida para ajustes posteriores de persona, estilo o dominio, partiendo de un modelo que ya ha absorbido una personalidad marcada.
- Evaluación comparativa de cuantizaciones: el repositorio publica doce niveles distintos del mismo modelo, lo que lo convierte en un banco de pruebas práctico para medir cuánta degradación introduce Q2_K o Q3_K frente a Q6_K o Q8_0 en una tarea subjetiva como el mantenimiento de personaje.
- Servicio de inferencia local con API compatible con OpenAI: mediante `llama.cpp` en modo servidor u Ollama se puede exponer el modelo GGUF como endpoint HTTP y consumirlo desde aplicaciones existentes que ya hablan el protocolo de OpenAI.
- Generación de contenido humorístico o divulgativo con voz de personaje: guiones breves, respuestas a preguntas de cultura científica o material para redes, siempre con revisión humana dado el riesgo de alucinación del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La tarjeta del repositorio de mradermacher no incluye métricas de MMLU, HumanEval, GSM8K ni de evaluaciones de persona, y el autor remite únicamente a gráficos genéricos de perplejidad entre tipos de cuantización (enlace a la imagen de ikawrakow incluida en el README) y al análisis de Artefact2 sobre calidades relativas de cuantización, que no son resultados de este modelo concreto.

## Requisitos de hardware

Estimaciones derivadas de los tamanos de archivo publicados en la tarjeta del repositorio; el consumo real depende de la longitud de contexto, del backend y del tamano del cache KV.

- VRAM aproximada para los pesos (sin cache KV):
  - f16 (6,3 GB): requiere en torno a 8 GB de VRAM o mas.
  - Q8_0 (3,4 GB): en torno a 4,5-5 GB de VRAM.
  - Q6_K (2,6 GB): en torno a 3,5-4 GB de VRAM.
  - Q5_K_S / Q5_K_M (2,3 GB): en torno a 3-3,5 GB de VRAM.
  - Q4_K_S / Q4_K_M (1,9-2,0 GB): en torno a 2,5-3 GB de VRAM; son los niveles recomendados por el autor ("fast, recommended").
  - IQ4_XS (1,9 GB), Q3_K_L (1,8 GB), Q3_K_M (1,7 GB), Q3_K_S (1,6 GB): por debajo de 2,5 GB de VRAM.
  - Q2_K (1,4 GB): aproximadamente 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM para Q4 y superiores (por ejemplo, RTX 3050, RTX 3060, GTX 1650 4 GB, Tesla T4). Para f16 son aconsejables 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 2070). No se requieren A100 ni H100: el modelo cabe holgadamente en GPUs de consumo.
- Cabe en GPU de consumo: si, en practicamente toda la gama actual y en muchas integradas con memoria compartida si se usa Q4 o inferior.
- Opciones de despliegue: llama.cpp (cliente y servidor), Ollama, LM Studio, koboldcpp, text-generation-webui, y cualquier runtime con soporte GGUF. Para despliegue de alto rendimiento con batching se puede servir mediante llama.cpp server; vLLM y TGI dan mejor soporte a safetensors que a GGUF.
- Latencia y throughput: no disponibles. No hay mediciones publicadas en la informacion proporcionada; en el modelo base, un denso de 3B en Q4_K_M se mueve habitualmente en el rango de decenas de tokens por segundo en GPU de gama media, pero esa cifra no esta confirmada para esta variante.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/Qwen2.5-3B-Instruct-Sheldon-SFT-v2-merged-GGUF (este) | 3,09 B | No disponible | apache-2.0 | GGUF (12 niveles) | Recuantización de un SFT de persona; sin benchmarks publicados |
| zachchxn/Qwen2.5-3B-Instruct-Sheldon-SFT-v2-merged | 3,09 B | No disponible | apache-2.0 | safetensors | Modelo origen, sin cuantizar; mismos pesos |
| Qwen/Qwen2.5-3B-Instruct | 3,09 B | 32 768 tokens nativos (ampliable con YaRN) | apache-2.0 | safetensors, GGUF en variantes de la comunidad | Modelo base generalista; mayor cobertura multilingüe y tool calling documentado |
| Llama-3.2-3B-Instruct | 3,21 B | 128 000 tokens | Llama 3.2 Community License | safetensors, GGUF | Alternativa generalista de tamano similar; licencia no Apache |
| Phi-3.5-mini-instruct | 3,8 B | 128 000 tokens | MIT | safetensors, GGUF | Alternativa generalista con contexto largo; no especializada en persona |

No se dispone de resultados de benchmarks comparativos en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto, licencia y formato. En rendimiento objetivo no se puede afirmar superioridad de ninguna de las opciones.

## Limitaciones y advertencias

- El modelo esta etiquetado exclusivamente para ingles; el uso en castellano u otros idiomas degradara la calidad y puede romper la persona.
- Es un ajuste de persona muy especifico: fuera del rol de Sheldon Cooper, su comportamiento puede ser menos util que el del Qwen2.5-3B-Instruct original para tareas generales.
- No hay benchmarks publicados, ni evaluaciones de sesgo, seguridad o fidelidad; cualquier uso en produccion exige evaluacion propia.
- Riesgo de alucinacion elevado en un modelo de 3B, especialmente en matematicas y en afirmaciones factuales; la etiqueta `math` no garantiza correccion.
- Las cuantizaciones agresivas (Q2_K, Q3_K_S) degradan notablemente la coherencia; el autor recomienda Q4_K_S y Q4_K_M como equilibrio velocidad/calidad y advierte que Q3_K_M es de calidad inferior.
- La tarjeta indica que las cuantizaciones ponderadas/imatrix no estaban disponibles en el momento de la publicacion, lo que puede afectar a la calidad relativa frente a otros repositorios GGUF del mismo modelo.
- Licencia apache-2.0: permite uso comercial con atribucion y sin copyleft, pero conviene verificar la licencia del modelo base de Qwen y el contenido del dataset de persona, que no se documenta aqui.
- El repositorio muestra 0 descargas y 0 "likes", y la fecha de creacion declarada es 2026-09-14; se trata de una publicacion sin adopcion ni validacion por parte de la comunidad.
- No se confirma soporte de tool calling, agentes ni contexto largo; no debe asumirse que conserva todas las capacidades del Qwen2.5-3B-Instruct original.
- Personaje potencialmente estereotipado y con rasgos de personalidad marcados (arrogancia, correccion constante); revisar el contenido si se despliega en entornos con usuarios finales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen2.5-3B-Instruct-Sheldon-SFT-v2-merged-GGUF
- Modelo base (checkpoint merged original): https://huggingface.co/zachchxn/Qwen2.5-3B-Instruct-Sheldon-SFT-v2-merged
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#Qwen2.5-3B-Instruct-Sheldon-SFT-v2-merged-GGUF
- Peticiones de modelos y FAQ de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidades de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa responsable de la infraestructura de cuantizacion: https://www.nethype.de/
