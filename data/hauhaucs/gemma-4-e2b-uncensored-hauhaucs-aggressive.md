# HauhauCS/Gemma-4-E2B-Uncensored-HauhauCS-Aggressive

## Resumen

Gemma-4-E2B-Uncensored-HauhauCS-Aggressive es una variante "abliterated" del modelo multimodal google/gemma-4-e2b-it, publicada por el usuario HauhauCS. El objetivo del autor es eliminar los mecanismos de rechazo del modelo base sin modificar el conjunto de datos ni las capacidades originales: segun la model card, se trata de un "uncensor" sin perdida ("lossless") que conserva el 100 % del comportamiento previsto por Google y unicamente suprime las negativas a generar contenido. El autor reporta 0 rechazos sobre 465 peticiones de prueba, aunque advierte de que el modelo puede anadir breves descargos de responsabilidad heredados del entrenamiento original.

La relevancia de esta ficha esta en su caracter multimodal nativo y su tamano reducido. Con unos 2.000 millones de parametros declarados (la metadata de safetensors indica 4.647.450.147 parametros en el repo), 35 capas con atencion mixta (ventana deslizante de 512 tokens combinada con atencion completa) y una ventana de contexto de 131.000 tokens, el modelo procesa texto, imagen, video y audio de forma nativa. Incorpora 20 capas KV compartidas para reducir el consumo de memoria durante la inferencia.

La distribucion se realiza exclusivamente en formato GGUF, con cuantizaciones personalizadas del autor (K_P, "Perfect") generadas con importance matrix para preservar la calidad de los pesos abliterated. Es un modelo orientado a despliegue local en equipos de consumo, dispositivos moviles y entornos edge, y no a razonamiento complejo o roleplay largo, segun admite el propio autor. La licencia es la Gemma, con las restricciones que esta implica para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder multimodal con atencion mixta: ventana deslizante de 512 tokens + atencion completa; 35 capas; 20 capas KV compartidas |
| Parametros totales | 4.647.450.147 (metadata safetensors); la model card declara 2B |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.000 tokens (131K) |
| Tipos de cuantizacion | GGUF: Q8_K_P, Q8_0, Q6_K_P, Q6_K, Q5_K_P, Q4_K_P, Q3_K_P, IQ3_M, Q2_K_P; proyector multimodal mmproj f16 |
| Idiomas soportados | Ingles (en) y multilingue |
| Licencia | Gemma |
| Formato de pesos | GGUF (incluye mmproj f16 para vision y audio) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-e2b-it y aplica una tecnica de "abliteration": una modificacion de los pesos orientada a eliminar la direccion de rechazo aprendida durante el alineamiento, sin reentrenar ni alterar los datos. El autor afirma que no hay cambios en datasets ni en capacidades, por lo que la arquitectura subyacente es la del Gemma 4 E2B-IT: un transformer decoder de 35 capas que combina atencion de ventana deslizante de 512 tokens con capas de atencion completa, y que comparte claves y valores en 20 capas para reducir la huella de memoria. La multimodalidad es nativa (texto, imagen, video y audio), a diferencia de los adaptadores a posteriori. El contexto soportado es de 131.000 tokens.

La innovacion principal no esta en la arquitectura sino en el proceso de cuantizacion. Las cuantizaciones K_P ("Perfect") del autor aplican un analisis especifico del modelo para preservar con mayor fidelidad las zonas de pesos mas sensibles al abliteration, con un incremento de tamano de solo un 5-15 % respecto a la cuantizacion base y un salto de calidad equivalente a 1-2 niveles de cuantizacion. Todas se generaron con importance matrix (imatrix). No se documenta el uso de RLHF, DPO ni decodificacion especulativa en esta ficha. El autor advierte que Google esta adoptando tecnicas de modelos de recompensa generativos (similares a GenRM) que dificultan el "uncensoring" completo, por lo que el resultado a contexto largo no esta garantizado al 100 %.

## Capacidades

- Generacion de texto conversacional en ingles y otros idiomas (soporte multilingue declarado, sin lista cerrada).
- Procesamiento de imagen y video (pipeline image-text-to-text) mediante el proyector mmproj.
- Procesamiento de audio nativo, segun especifica la model card.
- Generacion sin rechazos: el autor reporta 0/465 negativas en su bateria de pruebas.
- Compatible con plantillas de chat a traves del flag --jinja en llama.cpp.
- Inferencia local en runtimes GGUF (llama.cpp, LM Studio, Jan, koboldcpp).
- No se documenta soporte explicito de tool calling, function calling ni flujos de agentes multi-paso.
- No se documenta un modo de razonamiento ("thinking mode") separado.
- Sin censura en contenido, pero con posibles descargos de responsabilidad residuales heredados del modelo base.

## Casos de uso

- Asistente conversacional local en escritorio o movil: con cuantizaciones Q4_K_P de 3,3 GB y Q2_K_P de 2,9 GB, el modelo cabe en practicamente cualquier equipo moderno y permite conversaciones multi-turno sin conexion a internet.
- Analisis de imagenes en el borde (edge): la combinacion del GGUF principal con el proyector mmproj f16 (940 MB) permite describir o clasificar imagenes en dispositivos sin GPU dedicada.
- Transcripcion y respuesta sobre audio: el soporte nativo de audio permite construir asistentes de voz locales que procesan la entrada y generan respuesta en el mismo modelo.
- Prototipado de investigacion sobre alineamiento y seguridad: la variante "Aggressive" sirve como sujeto de estudio para medir la degradacion de comportamientos de seguridad tras abliteration en modelos pequenos.
- Generacion de contenido creativo sin filtros: redaccion de ficcion, guiones o material editorial donde los rechazos del modelo base serian un obstaculo, asumiendo la responsabilidad legal del contenido generado.
- Educacion y experimentacion con modelos multimodales: docencia sobre arquitecturas transformer multimodales con un modelo que cabe en un portatil y se ejecuta en CPU.
- Preprocesado de documentos con imagen y texto: pipelines de extraccion de informacion que combinan OCR implicito (via vision) y resumen textual en un unico paso.
- Generacion de codigo basica: util para completar fragmentos sencillos, aunque el propio autor advierte que el razonamiento complejo no es su punto fuerte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta el dato de "0/465 rechazos" en la bateria de pruebas del autor, que no es un benchmark estandar comparable y que el propio autor matiza con reservas sobre el contexto largo.

## Requisitos de hardware

- VRAM estimada para inferencia (solo texto, sin mmproj):
  - Q8_K_P (9,4 BPW): ~4,7 GB.
  - Q6_K_P (7,0 BPW): ~3,7 GB.
  - Q5_K_P (6,1 BPW): ~3,5 GB.
  - Q4_K_P (5,2 BPW): ~3,3 GB.
  - Q3_K_P (4,1 BPW): ~3,1 GB.
  - IQ3_M (3,7 BPW): ~3,0 GB.
  - Q2_K_P (3,5 BPW): ~2,9 GB.
- Proyector multimodal adicional: mmproj f16 de 940 MB que debe cargarse junto al modelo para vision y audio.
- GPU recomendadas: al tratarse de un modelo de ~2-4,6B parametros, funciona en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090 o superiores; tambien en Apple Silicon (M1/M2/M3) y en CPU pura con llama.cpp.
- Cabe holgadamente en cualquier GPU de consumo con al menos 4 GB de VRAM efectiva, e incluso en dispositivos moviles o SBC con 4 GB de RAM usando cuantizaciones Q2_K_P o IQ3_M.
- No requiere GPU de datacenter (A100, H100) para inferencia local.
- Opciones de despliegue: llama.cpp (con --jinja para la plantilla de chat), LM Studio, Jan, koboldcpp y cualquier runtime compatible con GGUF. No se distribuye en safetensors ni en formatos para vLLM o TGI.
- Latencia y throughput: no disponible. No se aportan mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Gemma-4-E2B-Uncensored-HauhauCS-Aggressive | ~2B declarados | 131K | Texto, imagen, video, audio | Gemma | GGUF | Variante sin censura del E2B-IT |
| Gemma-4-E4B-Uncensored-HauhauCS-Aggressive | 4B | No disponible | No disponible | Gemma | GGUF | Misma familia, mas capacidad; enlazado por el autor |
| google/gemma-4-e2b-it | ~2B | 131K | Texto, imagen, video, audio | Gemma | safetensors | Modelo base con alineamiento de seguridad intacto |

No se dispone de datos de benchmarks que permitan comparar rendimiento numerico entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos: al eliminar los mecanismos de rechazo no se eliminan los sesgos presentes en los datos de entrenamiento originales; la abliteration puede amplificar respuestas sesgadas o inapropiadas.
- Alucinacion: un modelo de este tamano tiende a alucinar en tareas de razonamiento, matematicas o hechos especificos; el autor reconoce que el razonamiento complejo y el roleplay largo no son su fuerte.
- Contexto largo: el propio autor advierte que Gemma 4 no ha recibido tanto tiempo de prueba manual a contexto extendido como otras publicaciones suyas, por lo que el comportamiento a 131.000 tokens puede tener casos extremos no cubiertos.
- Idioma: la model card lista "en" y "multilingual" sin detallar cobertura; el rendimiento fuera del ingles no esta garantizado ni cuantificado.
- Licencia Gemma: impone condiciones especificas de uso comercial, obligaciones de atribucion y restricciones de uso aceptable. Cualquier despliegue comercial debe revisarse contra los terminos de la licencia Gemma.
- Naturaleza sin censura: la variante "Aggressive" no rechaza peticiones, lo que implica responsabilidad legal y etica plena del operador sobre el contenido generado. En un entorno de produccion esto puede suponer incumplimiento de politicas de plataformas o normativa local.
- Posibles descargos residuales: el autor indica que el modelo puede anadir breves avisos de seguridad heredados del entrenamiento base, lo que puede resultar inconsistente en una salida de produccion.
- Compatibilidad de cuantizaciones: las K_P pueden mostrarse como "?" en la columna de cuantizacion de LM Studio; es un problema de visualizacion, no de carga.
- Requisito de mmproj: sin el archivo mmproj las capacidades de vision y audio no estan disponibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HauhauCS/Gemma-4-E2B-Uncensored-HauhauCS-Aggressive
- Modelo base: https://huggingface.co/google/gemma-4-e2b-it
- Variante de 4B del mismo autor: https://huggingface.co/HauhauCS/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive
- Discord del autor: https://discord.gg/SZ5vacTXYf
