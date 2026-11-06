# mradermacher/Darkmere-8B-v0.1-GGUF

## Resumen

Darkmere-8B-v0.1 es un modelo de lenguaje de 8.489.553.920 parámetros (aproximadamente 8,5 mil millones) derivado del modelo base 0xA50C1A1/Darkmere-8B-v0.1. El repositorio analizado, publicado por mradermacher, contiene únicamente cuantizaciones estáticas en formato GGUF del modelo original, no los pesos completos en precisión nativa. La model card lo etiqueta explícitamente como "heretic", "uncensored", "decensored" y "abliterated", lo que indica que se ha aplicado una técnica de ablación de direcciones de rechazo para eliminar los comportamientos de negativa aprendidos durante el alineamiento.

El modelo está orientado a roleplay, escritura creativa y conversación, y declara soporte exclusivo para inglés. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales más allá de las obligaciones de atribución habituales. La relevancia de esta ficha radica en que documenta una familia de modelos "sin censura" que circulan ampliamente en el ecosistema open source y que los desarrolladores deben evaluar con criterios técnicos y de seguridad explícitos.

La información disponible es limitada: no se publican detalles sobre arquitectura interna, datos de entrenamiento ni resultados de benchmarks. Esta ficha refleja fielmente lo que consta en la información proporcionada y marca como "no disponible" todo aquello que no se ha podido verificar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como "mistral" en los tags; no confirmado en la información) |
| Parámetros totales | 8.489.553.920 |
| Parámetros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; además mmproj-f16 y mmproj-Q8_0 (suplemento multimodal) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base original no se distribuye en este repositorio |

## Arquitectura y entrenamiento

No se dispone de información verificable sobre la arquitectura interna del modelo en la documentación proporcionada. Los tags del repositorio incluyen "mistral", lo que sugiere una base de la familia Mistral, pero no se confirma en la model card ni en los metadatos. Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineamiento.

La etiqueta "abliterated" (junto con "heretic", "decensored" y "uncensored") indica que el modelo ha sido sometido a una técnica de ablación de direcciones en el espacio de activaciones para eliminar la tendencia a rechazar peticiones. Este procedimiento suele consistir en identificar una dirección vectorial asociada al comportamiento de negativa y restarla de las activaciones o de los pesos, sin reentrenar el modelo desde cero. No se especifican los detalles del proceso aplicado en este caso concreto.

La presencia de ficheros `mmproj` (multi-modal projector) en el repositorio sugiere que el modelo base podría tener capacidades multimodales, pero no se confirma en la información disponible ni se detalla qué modalidad (visión, audio) cubre.

## Capacidades

- Generación de texto conversacional en inglés.
- Escritura creativa y roleplay, según los tags del repositorio.
- Comportamiento "sin censura" o "decensored": el modelo ha sido modificado para reducir o eliminar las negativas a peticiones que un modelo alineado estándar rechazaría.
- Posible soporte multimodal a través de los ficheros `mmproj` incluidos en el repositorio (no confirmado en la documentación).
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: solo inglés declarado.
- Modo "thinking" o razonamiento explícito: no disponible en la información.

## Casos de uso

- **Roleplay y narrativa interactiva**: el modelo está etiquetado específicamente para "roleplay" y "rp", por lo que se puede usar en aplicaciones de ficción interactiva, juegos de rol por texto y chatbots de personaje donde se requiere mantener una persona consistente a lo largo de conversaciones multi-turno.
- **Escritura creativa sin restricciones de contenido**: útil para autores que necesitan generar borradores de ficción con temáticas adultas, violencia o temas sensibles que los modelos alineados estándar suelen rechazar. Requiere revisión humana obligatoria antes de cualquier publicación.
- **Generación de diálogos para guiones y videojuegos**: el modelo puede producir líneas de diálogo para personajes con registros variados, aprovechando su orientación a la escritura creativa y su capacidad de mantener tono y estilo.
- **Prototipado de asistentes conversacionales en inglés**: para desarrolladores que necesitan un modelo ligero (8,5B) que quepa en hardware de consumo y que responda en inglés con fluidez, antes de pasar a un modelo mayor en producción.
- **Investigación sobre alineamiento y ablación**: el modelo sirve como caso de estudio para comparar el comportamiento de un modelo base frente a su versión "abliterated", analizando qué tipos de peticiones se aceptan o rechazan y cómo cambia la distribución de respuestas.
- **Generación de contenido para entornos controlados y privados**: al poder ejecutarse localmente con llama.cpp u Ollama, permite generar texto sin enviar datos a servicios externos, lo que resulta adecuado para prototipos internos con requisitos de privacidad.
- **Pruebas de robustez y red teaming**: investigadores de seguridad pueden usar el modelo para generar prompts adversarios o contenido dañino en entornos aislados y evaluar la eficacia de sus propios filtros y clasificadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia** (según los tamaños de fichero del repositorio):
  - Q2_K: ~3,5 GB
  - Q3_K_S: ~4,0 GB; Q3_K_M: ~4,3 GB; Q3_K_L: ~4,7 GB
  - IQ4_XS: ~4,8 GB; Q4_K_S: ~5,1 GB; Q4_K_M: ~5,3 GB
  - Q5_K_S: ~6,0 GB; Q5_K_M: ~6,2 GB
  - Q6_K: ~7,1 GB
  - Q8_0: ~9,1 GB
  - f16: ~17,1 GB
  - Suplemento multimodal: mmproj-Q8_0 ~0,6 GB; mmproj-f16 ~1,0 GB
- **GPU recomendadas**: no se especifican en la información. Por tamaño, las cuantizaciones Q4_K_M y Q5_K_M caben en GPUs de consumo con 8 GB de VRAM (RTX 3060 Ti, RTX 4060 Ti, RTX 3070). Q6_K y Q8_0 requieren 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4090). f16 requiere 24 GB o más (RTX 3090, RTX 4090, A100 40 GB, H100).
- **¿Cabe en GPU de consumo?**: sí, en cuantizaciones Q4_K_M o inferiores cabe en GPUs de 8 GB; Q5_K_M y Q6_K en GPUs de 12 GB; Q8_0 en GPUs de 12-16 GB.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. Para los ficheros `mmproj`, se requiere un runtime con soporte multimodal (por ejemplo, llama.cpp con soporte de proyector). vLLM y TGI no se mencionan en la información y su compatibilidad con GGUF cuantizado estático no está confirmada.
- **Latencia y throughput**: no disponibles en la información.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparación se limita a parámetros, contexto y licencia. Los modelos comparables se han seleccionado por tamaño (8B) y por categoría (modelos "uncensored" o roleplay):

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Darkmere-8B-v0.1 (este) | 8,49B | no disponible | Apache 2.0 | GGUF | Etiquetado heretic/abliterated, solo inglés |
| Llama 3.1 8B Instruct | 8,03B | 128K | Llama 3.1 Community | safetensors, GGUF | Alineado estándar, multilingüe |
| Mistral 7B Instruct v0.3 | 7,24B | 32K | Apache 2.0 | safetensors, GGUF | Alineado estándar, multilingüe |
| Dolphin 2.9 Llama 3 8B | 8,03B | 8K | Llama 3 | safetensors, GGUF | "Uncensored", sin RLHF de rechazo |

Los datos de Llama 3.1 8B, Mistral 7B y Dolphin se incluyen como referencia de categoría; no se han verificado en la información proporcionada y podrían variar. No se dispone de comparación de rendimiento (benchmarks) entre estos modelos y Darkmere-8B-v0.1.

## Limitaciones y advertencias

- **Contenido sin filtrar**: el modelo está diseñado explícitamente para eliminar negativas, lo que implica que puede generar contenido violento, sexual, ilegal o dañino sin advertencia. No es apto para aplicaciones de cara al público sin capas de moderación adicionales.
- **Riesgo de alucinación**: no se dispone de datos sobre la tasa de alucinación, pero al ser un modelo de 8,5B sin benchmarks publicados, se debe asumir un riesgo estándar o superior para esta categoría de tamaño.
- **Sesgos**: no se documentan evaluaciones de sesgo. Los modelos "abliterated" pueden amplificar sesgos presentes en los datos de entrenamiento al eliminar los mecanismos de rechazo que, en modelos alineados, actúan como filtro parcial.
- **Idioma**: solo se declara inglés. El rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- **Contexto**: no se especifica la longitud de contexto, lo que impide planificar aplicaciones que dependan de ventanas largas.
- **Licencia**: Apache 2.0 permite uso comercial, pero el usuario es responsable del contenido generado y de cumplir la legislación aplicable en su jurisdicción. La licencia del modelo base original (0xA50C1A1/Darkmere-8B-v0.1) debería verificarse por separado, ya que este repositorio solo contiene las cuantizaciones.
- **Procedencia del modelo base**: el autor del modelo base (0xA50C1A1) no está verificado en la información; la calidad y las garantías del proceso de cuantización dependen de mradermacher, que es un cuantizador conocido pero no el desarrollador original.
- **Uso en producción**: no se recomienda su despliegue en entornos de producción sin una evaluación exhaustiva de seguridad, moderación de salida y pruebas de regresión, dado que no hay benchmarks ni documentación técnica detallada.

## Enlaces

- Repositorio Hugging Face (cuantizaciones GGUF): https://huggingface.co/mradermacher/Darkmere-8B-v0.1-GGUF
- Modelo base original: https://huggingface.co/0xA50C1A1/Darkmere-8B-v0.1
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Darkmere-8B-v0.1-i1-GGUF
- Página de resumen del cuantizador: https://hf.tst.eu/model#Darkmere-8B-v0.1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
