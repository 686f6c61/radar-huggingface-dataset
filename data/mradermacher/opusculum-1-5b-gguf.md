# mradermacher/Opusculum-1.5B-GGUF

## Resumen

Opusculum-1.5B-GGUF es la version cuantizada en formato GGUF del modelo Opusculum-1.5B-V0.1, desarrollado originalmente por Stoned-Code y convertido a GGUF por mradermacher. Se trata de un modelo de lenguaje conversacional de pequeno tamano, con 1.543.714.304 parametros (aproximadamente 1,5 mil millones), disenado para generacion de texto y dialogos multi-turno. Su relevancia radica en que ofrece un modelo compacto, con licencia Apache 2.0, que puede ejecutarse en hardware de consumo gracias a las multiples cuantizaciones disponibles.

El modelo base fue afinado a partir de una mezcla de datasets orientados a instrucciones, rol y escritura creativa, incluyendo colecciones como kalo-opus-instruct, SynthRP-Gens, Hydrus-Claude-Instruct y magnum-v4. Esta orientacion sugiere un enfasis en conversacion, roleplay y generacion de texto estilizado mas que en tareas de razonamiento tecnico o codigo. La version GGUF facilita su despliegue en entornos locales mediante llama.cpp, Ollama y otras herramientas compatibles.

La ficha se centra en la version GGUF publicada por mradermacher, que incluye un conjunto amplio de cuantizaciones (desde Q2_K hasta f16) y variantes con imatrix disponibles en un repositorio separado. El modelo esta etiquetado como compatible con endpoints y con la libreria transformers, y su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (no se detalla la variante exacta en la informacion disponible) |
| Parametros totales | 1.543.714.304 (aproximadamente 1,5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; variantes imatrix/weighted en repositorio i1-GGUF |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (version cuantizada); el modelo base original en formato transformers/safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de que se trata de un transformer y que fue entrenado con la libreria Unsloth (etiqueta "unsloth" en los tags). No se especifican el numero de capas, dimensiones ocultas, mecanismos de atencion ni innovaciones como decodificacion especulativa o atencion lineal.

El modelo base Opusculum-1.5B-V0.1 fue afinado sobre una mezcla de nueve datasets, entre ellos Stoned-Code/magnum-v4, Delta-Vector/Hydrus-Claude-Instruct-5K, anthracite-org/kalo-opus-instruct-22k-no-refusal, Epiculous/SynthRP-Gens-v1.1-Filtered-n-Cleaned, anthracite-org/nopm_claude_writing_fixed y anthracite-org/kalo_misc_part2. Esta composicion apunta a un entrenamiento orientado a instrucciones, conversacion y escritura creativa/roleplay, con presencia de datos "no refusal" en algunos conjuntos. No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion exacta ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional y dialogos multi-turno.
- Afinado para instrucciones y escritura creativa (roleplay, narrativa, estilizacion).
- Capacidad de seguir instrucciones en ingles.
- Soporte de conversacion con formato de chat (etiqueta "conversational").
- Compatibilidad con endpoints de inferencia (tag "endpoints_compatible").
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues limitadas al ingles segun la model card.

## Casos de uso

- Roleplay y personajes conversacionales: el modelo fue afinado con datasets de rol (SynthRP-Gens, kalo-opus-instruct) y puede mantener dialogos con personalidad consistente en entornos de entretenimiento o prototipos de asistentes con caracter.
- Generacion de ficcion y escritura creativa: adecuado para borradores de narrativa, dialogos y textos estilizados, gracias a su entrenamiento en conjuntos como nopm_claude_writing_fixed.
- Prototipado rapido de chatbots: su tamano de 1,5B y las cuantizaciones Q4 permiten desplegar un chatbot funcional en una GPU de consumo o incluso en CPU para pruebas de concepto.
- Asistente conversacional local y privado: al ejecutarse con llama.cpp u Ollama en hardware modesto, permite mantener conversaciones sin enviar datos a servicios externos.
- Generacion de texto en aplicaciones embebidas: el modelo Q2_K ocupa aproximadamente 0,8 GB, lo que facilita su integracion en dispositivos con recursos limitados para tareas de generacion de texto breve.
- Experimentacion e investigacion: util como modelo base pequeno para estudiar tecnicas de cuantizacion, comparar calidad entre tipos de quant (Q2_K frente a Q8_0) o evaluar el impacto del afinado en modelos de 1,5B.
- Filtrado y clasificacion de texto conversacional: puede emplearse para tareas ligeras de generacion de respuestas o reformulacion en pipelines de procesamiento de lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (tamano de archivo como referencia): Q2_K ~0,8 GB; Q3_K_S/M ~0,9 GB; Q3_K_L e IQ4_XS ~1,0 GB; Q4_K_S ~1,0 GB; Q4_K_M ~1,1 GB; Q5_K_S/M ~1,2 GB; Q6_K ~1,4 GB; Q8_0 ~1,7 GB; f16 ~3,2 GB.
- GPU recomendadas: cualquier GPU de consumo con al menos 2-4 GB de VRAM puede ejecutar las cuantizaciones Q4-Q8; para f16 se recomienda al menos 4 GB. No se especifican requisitos para A100 o H100, aunque el modelo cabe holgadamente en ellas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (GTX 1060 6 GB, RTX 3060, RTX 4090, etc.) e incluso en CPU para cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers. No se documenta soporte explicito de vLLM o TGI para esta version GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de comparaciones publicadas en la informacion proporcionada. Como referencia estructural, se puede comparar con otros modelos pequenos de proposito general, pero sin metricas verificadas:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Opusculum-1.5B (este) | ~1,5B | No disponible | Apache 2.0 | GGUF, transformers |
| Alternativas de ~1,5B | No disponible | No disponible | No disponible | No disponible |

No se han publicado comparaciones con modelos similares en la informacion disponible.

## Limitaciones y advertencias

- El modelo esta entrenado y etiquetado principalmente en ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Algunos datasets de entrenamiento incluyen conjuntos "no refusal", lo que puede reducir los rechazos ante peticiones sensibles y aumentar el riesgo de generar contenido inapropiado.
- Riesgo de alucinacion inherente a modelos de 1,5B: la capacidad de razonamiento y verificacion factica es limitada en comparacion con modelos mayores.
- No se documenta la longitud de contexto, por lo que no se puede garantizar el manejo de conversaciones muy largas.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base y los datasets de entrenamiento pueden tener sus propias condiciones; conviene revisar las licencias de los conjuntos de datos citados.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar notablemente la coherencia; para produccion se recomienda Q4_K_M o superior.
- No se dispone de informacion sobre sesgos especificos, evaluaciones de seguridad ni pruebas de robustez.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Opusculum-1.5B-GGUF
- Repositorio de cuantizaciones imatrix/weighted: https://huggingface.co/mradermacher/Opusculum-1.5B-i1-GGUF
- Modelo base: https://huggingface.co/Stoned-Code/Opusculum-1.5B-V0.1
- Pagina de resumen de descargas: https://hf.tst.eu/model#Opusculum-1.5B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
