# mradermacher/Kitchoon-V5.1-Clean-26B-A4B-EXP-GGUF

## Resumen

Kitchoon-V5.1-Clean-26B-A4B-EXP-GGUF es la version cuantizada en formato GGUF del modelo base SubMaroon/Kitchoon-V5.1-Clean-26B-A4B-EXP, un modelo de lenguaje de arquitectura Mixture of Experts (MoE) con aproximadamente 25.230 millones de parametros totales y alrededor de 4.000 millones de parametros activos por token (segun la nomenclatura A4B). El autor de la cuantizacion es mradermacher, un conocido publicador de versiones GGUF en Hugging Face, mientras que el modelo original procede del usuario SubMaroon.

El modelo esta etiquetado como orientado a roleplay, con menciones a Gemma 4 en las etiquetas (gemma4), lo que sugiere que deriva de la familia Gemma. Incluye etiquetas como heretic y uncensored, indicando que ha sido sometido a un proceso de desalineacion o eliminacion de restricciones de contenido. Tambien se marca como compatible con SillyTavern, una interfaz popular para roleplay con modelos de lenguaje.

La relevancia de esta ficha radica en que ofrece una via practica para ejecutar un modelo MoE de ~25B en hardware de consumo gracias a las cuantizaciones GGUF disponibles (desde Q2_K de 10,7 GB hasta Q8_0 de 27,0 GB). Su licencia Apache 2.0 facilita el uso comercial, aunque el enfoque uncensored y de roleplay condiciona su aplicabilidad en entornos profesionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), probablemente basada en Gemma 4 segun etiquetas |
| Parametros totales | 25.233.142.046 (~25,23B) |
| Parametros activos | ~4B (segun nomenclatura A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base esta en formato transformers/safetensors) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture of Experts (MoE), segun indican las etiquetas del repositorio. Con 25.233 millones de parametros totales y una designacion A4B, se infiere que activa aproximadamente 4.000 millones de parametros por token durante la inferencia, lo que reduce el coste computacional en comparacion con un modelo denso del mismo tamano. Las etiquetas gemma4 sugieren que la arquitectura deriva de la familia Gemma de Google, aunque no se dispone de confirmacion oficial en la informacion proporcionada.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La etiqueta heretic indica que el modelo ha pasado por un proceso de desalineacion (abliteration o similar) para eliminar rechazos de contenido, y uncensored confirma que se han retirado las restricciones tipicas de seguridad. El sufijo EXP en el nombre sugiere caracter experimental. No se han documentado innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal en la informacion disponible.

## Capacidades

- Generacion de texto conversacional orientada a roleplay y ficcion interactiva.
- Razonamiento multi-turno en conversaciones extensas, gracias a su naturaleza MoE que permite manejar contextos amplios con coste reducido.
- Capacidades multilingues limitadas al ingles (unico idioma declarado).
- Modelo uncensored: no aplica filtros de contenido tipicos, lo que permite generar material que otros modelos rechazarian.
- Compatibilidad con SillyTavern, lo que facilita su integracion en flujos de roleplay con personajes personalizados.
- No se ha confirmado soporte de tool calling, function calling, vision, audio ni modos de pensamiento explicito (thinking mode) en la informacion disponible.

## Casos de uso

- Roleplay conversacional en SillyTavern: el modelo esta especificamente etiquetado para esta plataforma, y su naturaleza uncensored permite interpretar personajes sin las restricciones habituales de otros modelos, ideal para narrativa interactiva y juegos de rol por texto.
- Generacion de ficcion creativa sin restricciones: escritores que necesiten explorar tematicas adultas, violentas o controvertidas pueden usar el modelo sin los bloqueos tipicos, manteniendo coherencia narrativa en conversaciones largas.
- Simulacion de personajes para entrenamiento o investigacion: investigadores que estudien el comportamiento de modelos desalineados pueden usar esta version para analizar como varian las respuestas al eliminar capas de seguridad.
- Despliegue local en hardware de consumo: gracias a las cuantizaciones GGUF (Q4_K_M de 16,9 GB), el modelo puede ejecutarse en GPUs consumer como la RTX 4090 (24 GB VRAM) o incluso en configuraciones con menos memoria usando Q2_K o Q3_K.
- Prototipado rapido de asistentes conversacionales: desarrolladores que necesiten un modelo MoE eficiente para pruebas de concepto en local pueden usar llama.cpp u Ollama con los archivos GGUF, evitando costes de API.
- Investigacion sobre eficiencia de MoE: el modelo sirve como caso de estudio para analizar el rendimiento de arquitecturas MoE con ~4B parametros activos en tareas de generacion de texto, comparando latencia y calidad frente a modelos densos equivalentes.
- Fine-tuning posterior sobre GGUF: aunque no es el flujo tipico, la disponibilidad de cuantizaciones permite experimentar con adaptadores LoRA en entornos de recursos limitados, aunque requeriria convertir a formato compatible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion:
  - Q2_K (10,7 GB): cabe en GPUs con 12 GB VRAM (RTX 3060 12GB, RTX 4070).
  - Q3_K_S (12,3 GB) y Q3_K_M (13,4 GB): requieren 16 GB VRAM (RTX 4060 Ti 16GB, RTX 4080).
  - IQ4_XS (14,2 GB) y Q4_K_S (15,6 GB): requieren 16-24 GB VRAM.
  - Q4_K_M (16,9 GB): recomendado para RTX 4090 (24 GB) o A100 40GB.
  - Q5_K_M (19,2 GB) y Q6_K (22,7 GB): requieren 24 GB VRAM (RTX 4090, A100 40GB).
  - Q8_0 (27,0 GB): requiere 32 GB VRAM o mas (A100 40GB, H100).
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones Q4-Q6; A100 40GB o H100 para Q8_0; RTX 3060 12GB para Q2_K.
- Cabe en consumer GPU: si, en RTX 3060 12GB con Q2_K, y en RTX 4090 con Q4_K_M o Q5_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui (oobabooga), y cualquier runtime compatible con GGUF. Tambien es posible usar vLLM si se convierte a formato safetensors, aunque no es el flujo nativo de este repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Kitchoon-V5.1-Clean-26B-A4B-EXP-GGUF | 25,23B | ~4B | no disponible | Apache 2.0 | GGUF | Roleplay, uncensored, MoE |
| Kitchoon-V5-Clean-26B-A4B-i1-GGUF | ~25B | ~4B | no disponible | Apache 2.0 | GGUF | Version anterior, cuantizacion i1 |
| Kitchoon-26B-A4B-GGUF | ~25B | ~4B | no disponible | Apache 2.0 | GGUF | Version base sin sufijo Clean/EXP |
| Mixtral 8x7B (referencia MoE) | 46,7B | ~12,9B | 32k | Apache 2.0 | GGUF, safetensors | MoE generico, no roleplay |

La comparativa se limita a variantes del mismo modelo base y a Mixtral como referencia de arquitectura MoE. No se dispone de datos de rendimiento comparativo entre ellos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado principalmente en ingles y orientado a roleplay, puede reproducir estereotipos de genero, raza o cultura presentes en los datos de entrenamiento. La desalineacion (heretic) puede amplificar sesgos al eliminar filtros.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada con aparente confianza. En roleplay esto es esperado, pero en usos facticos es peligroso.
- Limitaciones de contexto: no se ha especificado la longitud de contexto, lo que impide planificar su uso en tareas que requieran ventanas muy largas. Se recomienda probar empiricamente.
- Limitaciones de idioma: solo soporta ingles. No se ha entrenado para castellano ni otros idiomas, por lo que su rendimiento en ellos sera deficiente.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y distribucion, pero el modelo base podria tener restricciones adicionales no reflejadas. Se recomienda verificar la licencia del modelo original SubMaroon/Kitchoon-V5.1-Clean-26B-A4B-EXP.
- Caveat para produccion: el caracter uncensored y heretic implica que el modelo puede generar contenido ofensivo, ilegal o danino sin filtros. No es apto para aplicaciones de cara al publico sin una capa de moderacion adicional.
- El sufijo EXP indica caracter experimental; puede haber inestabilidades o comportamientos erraticos no documentados.
- No se dispone de informacion sobre el proceso de cuantizacion (si se uso imatrix o no) mas alla de que son cuantizaciones estaticas.

## Enlaces

- Repositorio Hugging Face del GGUF: https://huggingface.co/mradermacher/Kitchoon-V5.1-Clean-26B-A4B-EXP-GGUF
- Modelo base: https://huggingface.co/SubMaroon/Kitchoon-V5.1-Clean-26B-A4B-EXP
- Version anterior i1: https://huggingface.co/mradermacher/Kitchoon-V5-Clean-26B-A4B-i1-GGUF
- Version sin sufijo Clean/EXP: https://huggingface.co/mradermacher/Kitchoon-26B-A4B-GGUF
- Pagina de resumen de cuantizaciones: https://hf.tst.eu/model#Kitchoon-V5.1-Clean-26B-A4B-EXP-GGUF
- README de referencia de TheBloke para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
