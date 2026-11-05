# mradermacher/Gamunu-4b-Chat-It-Exp-Model-GGUF

## Resumen

Gamunu-4b-Chat-It-Exp-Model-GGUF es la version cuantizada en formato GGUF del modelo manthilaffs/Gamunu-4b-Chat-It-Exp-Model, un modelo de lenguaje conversacional de aproximadamente 3.880 millones de parametros construido sobre la arquitectura Gemma 3. La cuantizacion ha sido realizada por mradermacher, un conocido publicador de versiones GGUF de modelos open source, empleando herramientas de Unsloth para la conversion desde los pesos originales en transformers.

El modelo esta disenado para generacion de texto y conversacion multi-turno, con un enfoque experimental ("Exp" en el nombre) que sugiere un ajuste fino sobre una base Gemma 3 de 4B. La relevancia de esta publicacion radica en que ofrece el modelo en una amplia gama de cuantizaciones (desde Q2_K de 1,8 GB hasta f16 de 7,9 GB), lo que permite desplegarlo en hardware de consumo con VRAM limitada sin renunciar a la arquitectura original.

La licencia Apache 2.0 facilita su uso comercial, y la disponibilidad de un componente multimodal (mmproj) indica que el modelo base conserva las capacidades de vision de Gemma 3, aunque la model card no detalla el alcance exacto de dichas capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Gemma 3), segun tags del repositorio |
| Parametros totales | 3.880.263.168 (aproximadamente 3,88B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj-Q8_0 y mmproj-f16 para el componente multimodal |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con versiones mmproj para multimodal) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 3, tal como indican los tags del repositorio (`gemma3`, `unsloth`). Se trata de un transformer denso de aproximadamente 3,88 mil millones de parametros. La presencia de ficheros `mmproj` (multi-modal projection) confirma que el modelo base incorpora un adaptador de proyeccion visual, lo que sugiere capacidades de vision heredadas de Gemma 3.

No se dispone de informacion detallada sobre el proceso de entrenamiento: no se especifican el numero de tokens, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o ajuste supervisado. El sufijo "Chat-It-Exp" sugiere un ajuste para conversacion e instrucciones de caracter experimental, pero la model card no aporta detalles sobre la metodologia. La cuantizacion fue realizada con herramientas de Unsloth y el pipeline de mradermacher, generando cuantizaciones estaticas (sin versiones imatrix ponderadas, segun indica el propio autor).

## Capacidades

- Generacion de texto conversacional y respuesta a instrucciones en ingles.
- Capacidades multimodales potenciales (vision) gracias al componente mmproj incluido, aunque no se detalla su alcance en la model card.
- Conversacion multi-turno (tag `conversational`).
- Compatibilidad con text-generation-inference y endpoints compatibles.
- No se documenta soporte explicito de tool calling, function calling ni razonamiento multi-paso.
- No se documenta modo thinking ni capacidades de audio.
- Capacidades multilingues limitadas al ingles segun el campo `language`.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en ingles: las cuantizaciones Q4_K_M (2,6 GB) permiten ejecutar el modelo en GPUs de consumo para pruebas de concepto de chatbots sin infraestructura dedicada.
- Despliegue en entornos con VRAM limitada: la version Q2_K (1,8 GB) o Q3_K_S (2,0 GB) posibilita inferencia en GPUs de gama baja o incluso en CPU mediante llama.cpp, adecuado para demos y entornos de desarrollo.
- Fine-tuning experimental: al ser un modelo de 4B con licencia Apache 2.0, sirve como base para ajuste fino en tareas especificas de dominio en ingles, aprovechando su tamano manejable.
- Evaluacion de modelos Gemma 3 cuantizados: util para investigadores que comparan el impacto de distintas cuantizaciones (Q2 a Q8) en la calidad de generacion sobre una misma base.
- Generacion de texto offline en aplicaciones de escritorio: la version Q4_K_S (2,5 GB) puede integrarse en aplicaciones locales mediante Ollama o llama.cpp, sin dependencia de la nube.
- Investigacion sobre modelos multimodales pequenos: el componente mmproj permite explorar tareas de vision-lenguaje en un modelo de 4B, aunque con las limitaciones propias de su tamano y de la falta de documentacion especifica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB (Q2_K), 2,5-2,6 GB (Q4_K_S/Q4_K_M), 3,3 GB (Q6_K), 4,2 GB (Q8_0) y 7,9 GB (f16). El componente mmproj anade 0,7-1,0 GB si se usa la modalidad multimodal.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090 o superiores para mayor comodidad; A100/H100 no son necesarias dado el reducido tamano del modelo.
- Cabe en GPUs de consumo: si, practicamente en cualquier GPU moderna con 4 GB o mas de VRAM en cuantizaciones Q4. Las cuantizaciones Q2/Q3 pueden ejecutarse incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (soporte nativo segun tags), y cualquier runtime compatible con GGUF. La version original en transformers (safetensors) permite vLLM y TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gamunu-4b-Chat-It-Exp-Model-GGUF | 3,88B | no disponible | Apache 2.0 | GGUF | Base Gemma 3, enfoque experimental |
| Gemma 3 4B (Google) | ~4B | no disponible en esta ficha | Gemma license | safetensors, GGUF | Modelo original de referencia |
| Phi-3-mini (Microsoft) | 3,8B | 4K-128K segun variante | MIT | safetensors, GGUF | Alternativa de tamano similar |
| Llama 3.2 3B (Meta) | 3,2B | 128K | Llama 3.2 license | safetensors, GGUF | Alternativa de tamano similar |

La comparativa se limita a la categoria de modelos de aproximadamente 3-4B parametros. No se dispone de datos de rendimiento comparativo para este modelo concreto.

## Limitaciones y advertencias

- Modelo experimental: el sufijo "Exp" y la ausencia de documentacion detallada sobre entrenamiento y evaluacion sugieren que no esta validado para produccion.
- Solo ingles: el campo `language` indica unicamente `en`, por lo que el rendimiento en castellano u otros idiomas es incierto y probablemente deficiente.
- Riesgo de alucinacion: inherente a modelos de este tamano y a la falta de benchmarks publicados que permitan evaluar su fiabilidad.
- Cuantizaciones de baja calidad: las versiones Q2_K y Q3_K_M pueden degradar notablemente la calidad de generacion; el autor recomienda Q4_K_S o superiores para uso practico.
- Sin cuantizaciones imatrix: el autor indica que no hay versiones ponderadas disponibles, lo que limita la calidad de las cuantizaciones pequenas.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base original (Gemma 3) por si existieran restricciones adicionales heredadas.
- Contexto desconocido: no se especifica la longitud de contexto soportada, lo que impide planificar su uso en tareas de contexto largo.
- Capacidades multimodales sin documentar: aunque se incluye mmproj, no se detalla que tareas de vision soporta ni con que calidad.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/mradermacher/Gamunu-4b-Chat-It-Exp-Model-GGUF
- Modelo base original: https://huggingface.co/manthilaffs/Gamunu-4b-Chat-It-Exp-Model
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Gamunu-4b-Chat-It-Exp-Model-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
