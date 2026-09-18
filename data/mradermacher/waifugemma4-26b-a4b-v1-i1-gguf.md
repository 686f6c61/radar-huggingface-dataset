# mradermacher/WaifuGemma4-26b-a4b-v1-i1-GGUF

## Resumen

WaifuGemma4-26b-a4b-v1 es un modelo de lenguaje conversacional desarrollado por hiwaifu-research, orientado a roleplay, personajes virtuales y diálogo multi-turno. Se construye sobre la familia Gemma 4 con una arquitectura de mezcla de expertos (MoE) y 25.233.142.046 parámetros totales (≈25,2 B), según los pesos en safetensors. El sufijo «a4b» del nombre sugiere un régimen de aproximadamente 4 B de parámetros activos por token, aunque ese dato no se confirma en la información disponible.

La ficha que nos ocupa, publicada por el cuantizador mradermacher, no contiene el modelo original en precisión completa, sino un repositorio de cuantizaciones GGUF con calibración imatrix, pensado para ejecución local mediante llama.cpp y derivados. El modelo base incorpora etiquetas de RLHF, GRPO, reward model, human preference y arena, lo que indica una fase de alineación orientada a preferencias humanas en conversación abierta.

Su relevancia práctica es doble: por un lado, cubre un nicho concreto (roleplay y personajes) sobre una arquitectura MoE de la familia Gemma 4; por otro, al distribuirse en GGUF permite desplegarlo en hardware de consumo. Como contrapartida, el repositorio acumula 0 descargas y 0 «likes», no publica benchmarks y no ofrece detalles de entrenamiento, contexto o parámetros activos, por lo que su evaluación real todavía está pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), familia Gemma 4 |
| Parametros totales | 25.233.142.046 (≈25,2 B) |
| Parametros activos | no disponible (el nombre «a4b» sugiere ~4 B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, small-IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, más fichero imatrix para generar cuantizaciones propias |
| Idiomas soportados | en, es, ru, pt, id, ar, th, fr, de, uk, vi, ja, ko, zh, tr, it, pl (17 idiomas) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (repositorio de cuantizacion); el modelo base se distribuye en safetensors |
| Repositorio | mradermacher/WaifuGemma4-26b-a4b-v1-i1-GGUF |
| Modelo base | hiwaifu-research/WaifuGemma4-26b-a4b-v1 |
| Tamano del repositorio | 10,6 GB |
| Libreria declarada | transformers |
| Fecha de creacion (segun HuggingFace) | 2026-09-18 |

## Arquitectura y entrenamiento

Se trata de un transformer con mezcla de expertos (MoE) dentro de la familia Gemma 4, con 25.233.142.046 parámetros totales. Al ser un modelo MoE, solo una fracción de los expertos se activa por token, lo que en principio reduce el coste de cómputo por token respecto a un modelo denso del mismo tamaño; sin embargo, el número exacto de parámetros activos, el número de expertos, la política de enrutamiento y el mecanismo de atención no están documentados en la información disponible.

Las etiquetas del repositorio (rlhf, grpo, reward-model, human-preference, arena) apuntan a un pipeline de alineación basado en preferencias humanas, con GRPO como método de optimización y un modelo de recompensa asociado, en línea con las prácticas habituales para asistentes conversacionales y de personaje. No se especifican el número de tokens de entrenamiento, la composición del dataset, la mezcla de idiomas ni si hubo fases de SFT previas. La model card indica además que se trata de un modelo con capacidad de visión («This is a vision model»), con ficheros mmproj en el repositorio estático si existen; dado que no se listan, esa capacidad multimodal queda sin confirmar. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o variantes híbridas SSM.

## Capacidades

- Generación de texto conversacional multi-turno, con foco en mantener la coherencia de un personaje a lo largo de la conversación.
- Roleplay y role-play de personaje: el modelo está afinado explícitamente para interpretar personajes y sostener narrativa interactiva.
- Alineación por preferencias humanas: las etiquetas de RLHF, GRPO y reward model indican optimización para respuestas preferidas por evaluadores humanos en contextos de chat abierto.
- Multilingüe: se declaran 17 idiomas (inglés, español, ruso, portugués, indonesio, árabe, tailandés, francés, alemán, ucraniano, vietnamita, japonés, coreano, chino, turco, italiano y polaco).
- Capacidad de visión: mencionada en la model card como modelo de visión, con soporte mmproj opcional; no confirmada por ficheros presentes ni por documentación adicional.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de código y matemáticas: no disponible en la información proporcionada.

## Casos de uso

- Personajes virtuales y compañía conversacional: el modelo está entrenado específicamente para interpretar personajes con personalidad estable, por lo que encaja en aplicaciones de chat de acompañamiento o entretenimiento donde la consistencia del personaje a lo largo de sesiones largas es el requisito principal.
- Roleplay narrativo en juegos de texto y ficción interactiva: permite dirigir escenas, introducir descripciones y mantener el tono de un personaje concreto, con la ventaja de poder ejecutarse en local y evitar el envío de conversaciones a terceros.
- Asistentes de personaje multilingües: al declarar 17 idiomas, incluido el español, permite desplegar un mismo personaje para audiencias en varios mercados sin cambiar de modelo, aunque el rendimiento por idioma no está evaluado.
- Despliegue local y privado en GPU de consumo: en cuantizaciones Q4_K_M o Q5_K_M el modelo ocupa aproximadamente entre 15 y 18 GB, por lo que es viable en tarjetas de 24 GB como la RTX 3090 o la RTX 4090, útil para aplicaciones donde la privacidad de la conversación es crítica.
- Generación de diálogos para guiones y prototipado de personajes: útil en preproducción de narrativa o videojuegos para generar borradores de diálogo entre personajes con voces diferenciadas, que después se revisan y editan manualmente.
- Investigación sobre preferencias humanas y evaluación de chat: las etiquetas de reward model, human preference y arena sugieren que el modelo puede emplearse como referencia o contraparte en experimentos de evaluación comparativa de respuestas conversacionales.
- Chatbots de atención al cliente con tono personalizado: aunque el modelo no está documentado para tareas de soporte ni se confirma tool calling, su capacidad conversacional y multilingüe permitiría prototipar flujos de atención con marca propia, siempre con validación previa y filtros de seguridad externos.
- Base para ajuste fino posterior orientado a dominio: el modelo original en safetensors puede servir como punto de partida para LoRA o ajustes específicos de personaje o industria, teniendo en cuenta que el repositorio GGUF que nos ocupa no es apto para entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, MT-Bench ni evaluaciones de arena, y la búsqueda web realizada no ha devuelto ningún resultado relacionado con este modelo (los únicos resultados obtenidos eran foros de calculadoras gráficas y ejemplos de programación de Snake, sin relación alguna con el modelo).

## Requisitos de hardware

- Estimación de VRAM para los pesos, calculada a partir de 25,233 B de parámetros (no incluye caché KV ni overhead del runtime):
  - FP16/BF16 (modelo base en safetensors): ≈50 GB.
  - Q8_0: ≈27 GB.
  - Q6_K: ≈21 GB.
  - Q5_K_M: ≈18 GB.
  - Q4_K_M: ≈15-16 GB.
  - Q3_K_M: ≈12-13 GB.
  - Q2_K: ≈9-10 GB.
  - IQ1_S: ≈5-6 GB.
- GPU recomendadas: H100 80 GB o A100 80 GB para el modelo base en BF16; A100 40 GB o 2× RTX 4090 para Q8_0; RTX 3090, RTX 4090, RTX 5090 o L40S para Q4_K_M y Q5_K_M.
- GPU de consumo: sí es viable. Con Q4_K_M cabe en tarjetas de 24 GB (RTX 3090/4090/5090) y con Q2_K o Q3_K_M en tarjetas de 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4060 Ti 16 GB). Al ser MoE, parte de los expertos puede residir en RAM del sistema con llama.cpp, a costa de latencia.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y koboldcpp para los ficheros GGUF; vLLM, TGI o SGLang para el modelo base en safetensors. El repositorio incluye un fichero imatrix para generar cuantizaciones propias con llama.cpp.
- Latencia y throughput: no disponible. Al ser un modelo MoE con aproximadamente 4 B de parámetros activos (dato no confirmado), cabe esperar velocidades de generación superiores a las de un modelo denso de 25 B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato principal | Notas |
|---|---|---|---|---|---|
| WaifuGemma4-26b-a4b-v1 (este) | 25,2 B totales, activos no confirmados (~4 B segun nombre) | no disponible | Gemma | GGUF, safetensors | Afinado para roleplay y personajes; multilingue en 17 idiomas; sin benchmarks publicados |
| Gemma 3 27B | 27 B densos | 128 K | Gemma | safetensors, GGUF | Modelo generalista de la misma familia; los datos de contexto y tamano proceden de su documentacion publica, no de comparaciones con este modelo |
| Qwen3-30B-A3B | 30,5 B totales, 3,3 B activos | 128 K | Apache 2.0 | safetensors, GGUF | Alternativa MoE de tamano y regimen de activacion comparables; licencia mas permisiva; no hay comparacion de rendimiento en roleplay |
| Mistral Small 3 (24B) | 24 B densos | 32 K (128 K en la version 3.1) | Apache 2.0 | safetensors, GGUF | Alternativa densa de tamano similar con licencia permisiva; sin datos comparativos de calidad conversacional |

No existe ninguna comparación oficial de rendimiento entre WaifuGemma4-26b-a4b-v1 y estos modelos: los datos de la tabla corresponden a las especificaciones publicas de cada familia y no a evaluaciones conjuntas.

## Limitaciones y advertencias

- Riesgo de alucinación: no hay evaluaciones publicadas de fidelidad factual. En modelos afinados para roleplay la tasa de invención suele aumentar cuando el usuario introduce premisas ficticias, y aquí no existe ninguna medición que lo acote.
- Sesgos: no se documenta ningún análisis de sesgos, toxicidad o seguridad. Un modelo entrenado con preferencias humanas de una comunidad concreta (roleplay, personajes) puede reproducir estereotipos de género, culturales o de relación presentes en esos datos.
- Contenido inapropiado: los modelos de personaje suelen carecer de filtros robustos por defecto. Si se despliega en producción orientada a público general, es imprescindible añadir una capa de moderación externa.
- Rendimiento por idioma desconocido: se declaran 17 idiomas, incluido el español, pero no hay ninguna evaluación por idioma; la cobertura declarada no garantiza calidad homogénea.
- Longitud de contexto desconocida: no se especifica la ventana de contexto, lo que impide planificar aplicaciones de contexto largo o estimar el coste de caché KV.
- Restricciones de licencia: el modelo se distribuye bajo la licencia Gemma (Gemma Terms of Use), que impone condiciones de uso, obligaciones de redistribución de la licencia y avisos, y una política de uso prohibido. Conviene revisarla antes de cualquier explotación comercial.
- Es un repositorio de cuantización de un tercero: mradermacher no es el autor del modelo base, por lo que los cambios en el modelo original no se reflejan automáticamente aquí.
- Cuantizaciones agresivas: las variantes IQ1 e IQ2 (por debajo de 10 GB) degradan de forma notable la calidad respecto a Q4_K_M o superiores. No se recomienda usarlas en producción sin una evaluación propia.
- Validación comunitaria nula: 0 descargas y 0 «likes» en el momento de redactar esta ficha, sin informes externos, sin benchmarks y con metadatos de fecha (2026-09-18) que conviene verificar.
- Capacidad multimodal incierta: la model card afirma que es un modelo de visión, pero no se listan ficheros mmproj, por lo que no se puede confirmar el soporte real de imagen.
- Tool calling y uso como agente: no hay información sobre soporte de function calling ni de razonamiento multi-paso, por lo que no debería asumirse su disponibilidad sin probarlo.
- Aviso sobre el contenido de la model card original: el README incluye comentarios internos de la herramienta de cuantización (versión de quantize, tipo de conversión, lista de quants), no documentación técnica del entrenamiento.

## Enlaces

- Repositorio GGUF con imatrix: https://huggingface.co/mradermacher/WaifuGemma4-26b-a4b-v1-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/WaifuGemma4-26b-a4b-v1-GGUF
- Modelo base: https://huggingface.co/hiwaifu-research/WaifuGemma4-26b-a4b-v1
- Página de resumen y descargas del cuantizador: https://hf.tst.eu/model#WaifuGemma4-26b-a4b-v1-i1-GGUF
- Preguntas frecuentes y peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Fichero imatrix: https://huggingface.co/mradermacher/WaifuGemma4-26b-a4b-v1-i1-GGUF/resolve/main/WaifuGemma4-26b-a4b-v1.imatrix.gguf
- Guía de uso de GGUF (referencia empleada por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de perplejidad por tipo de quant: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- nethype GmbH, empresa que cede infraestructura al cuantizador: https://www.nethype.de/

Nota: las búsquedas web realizadas para esta ficha no devolvieron ningún resultado relacionado con el modelo; los únicos enlaces recuperados pertenecían a foros de calculadoras gráficas y a hilos sobre programación de un juego tipo Snake, sin relación con WaifuGemma4. Por tanto, no hay papers, blogs ni demos adicionales que enlazar.
