# mradermacher/finance-Llama3-8B-GGUF

## Resumen

finance-Llama3-8B-GGUF es la distribucion en formato GGUF del modelo instruction-pretrain/finance-Llama3-8B, un ajuste fino orientado al dominio financiero construido sobre la arquitectura Llama 3 de 8.000 millones de parametros. La cuantizacion la realiza mradermacher, un publicador habitual de versiones GGUF de modelos open source, que ofrece el modelo en multiples niveles de compresion para facilitar su despliegue en hardware de consumo mediante llama.cpp y derivados.

El modelo resuelve el problema de disponer de un asistente especializado en tareas de finanzas (analisis, explicacion de conceptos, resumen de informes, generacion de texto tecnico del sector) en un tamano que cabe en una sola GPU de consumo o incluso en CPU con cuantizaciones agresivas. Al estar basado en Llama 3, hereda la ventana de contexto y el tokenizador de esa familia, y su licencia es la Llama 3 Community License.

La relevancia actual radica en que combina tres factores poco frecuentes a la vez: especializacion de dominio, tamano contenido (8B) y disponibilidad en GGUF con un rango amplio de cuantizaciones (de Q2_K a f16), lo que permite desde prototipado en portatiles hasta despliegue en servidores con cuantizaciones de alta fidelidad. El repositorio ocupa 71,8 GB en total por acumular todas las variantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3; valor exacto no confirmado) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | GGUF (transformers como libreria declarada; pesos originales en safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 8.030 millones de parametros, derivado de la familia Llama 3. Sobre esa base, instruction-pretrain/finance-Llama3-8B aplica un ajuste orientado a dominio financiero; la model card del repositorio cuantizado no detalla la composicion exacta del corpus de ajuste ni el numero de tokens empleados, por lo que esos datos deben considerarse no disponibles en esta ficha.

Los datasets declarados en las etiquetas del repositorio son Open-Orca/OpenOrca, GAIR/lima y WizardLM/WizardLM_evol_instruct_V2_196k, que son corpus de instrucciones de proposito general habitualmente usados en el ajuste supervisado de la familia. No se especifica en la informacion disponible si hubo RLHF, DPO u otra etapa de alineamiento preferencial, ni detalles sobre decodificacion especulativa u otras optimizaciones de inferencia. La cuantizacion la realiza mradermacher con quantize_version 2 y output_tensor_quantised 1, en modo estatico (no se han publicado, segun la model card, cuantizaciones ponderadas con imatrix en el momento de la redaccion).

## Capacidades

- Generacion de texto en ingles con enfasis en terminologia y estilo del dominio financiero.
- Razonamiento y explicacion de conceptos financieros (instrumentos, metricas, informes).
- Resumen y sintesis de documentos tecnicos del sector.
- Respuesta a instrucciones de proposito general, al conservar el ajuste instructivo de la base.
- Soporte multilingue limitado: el modelo declara unicamente ingles.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Asistente interno de analisis financiero: el modelo puede responder consultas sobre conceptos contables y de mercados en ingles, con cuantizaciones Q4_K_M o superiores para calidad aceptable en produccion interna.
- Resumen de informes anuales y documentos regulatorios: con contexto largo heredado de Llama 3, se puede alimentar el modelo con secciones extensas de un 10-K o memoria anual y pedir sintesis estructuradas.
- Generacion de borradores de contenido editorial financiero: articulos, notas explicativas y glosarios, revisados posteriormente por un analista humano.
- Clasificacion y extraccion de entidades en textos financieros: identificacion de cifras, entidades y eventos en noticias o comunicados mediante prompting, ejecutable en local con llama.cpp.
- Prototipado rapido en portatil: con Q4_K_S (4,8 GB) o Q5_K_M (5,8 GB) se puede ejecutar en una GPU de consumo o incluso en CPU con RAM suficiente, ideal para validar ideas antes de invertir en infraestructura.
- Chatbot educativo sobre finanzas personales o corporativas: respuestas explicativas en ingles para entornos de formacion, con la advertencia de que no sustituye asesoramiento profesional.
- Despliegue en entornos con requisitos de privacidad: al ser un modelo local en GGUF, los datos financieros sensibles no salen de la infraestructura del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,3 GB (Q2_K), 4,8-5,0 GB (Q4_K_S / Q4_K_M), 5,7-5,8 GB (Q5_K_S / Q5_K_M), 6,7 GB (Q6_K), 8,6 GB (Q8_0) y 16,2 GB (f16), segun los tamanos de fichero publicados.
- GPU recomendadas: RTX 3060 12 GB o superior para Q4_K_M/Q5_K_M con contexto moderado; RTX 4090, A100 o H100 para f16 y contextos largos.
- Cabe en GPU de consumo: si, desde una RTX 3060 12 GB o una RTX 4060 Ti 16 GB para cuantizaciones medias; en tarjetas de 8 GB caben Q4 y Q5 con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y cualquier runtime compatible con GGUF; los endpoints son compatibles con la API de transformers segun las etiquetas del repositorio.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| finance-Llama3-8B-GGUF (este) | 8,03B | no disponible | Finanzas | llama3 | GGUF |
| instruction-pretrain/finance-Llama3-8B | 8,03B | no disponible | Finanzas | llama3 | safetensors |
| Llama 3 8B Instruct (Meta) | 8,03B | no disponible en esta ficha | Proposito general | llama3 | safetensors, GGUF (terceros) |
| Mistral 7B Instruct | 7,2B | no disponible en esta ficha | Proposito general | Apache 2.0 | safetensors, GGUF (terceros) |

La comparativa se limita a parametros, licencia y disponibilidad porque no hay datos de rendimiento publicados para este modelo en la informacion proporcionada. Frente a Llama 3 8B Instruct, la diferencia es la especializacion financiera; frente a Mistral 7B, la licencia Llama 3 es mas restrictiva que Apache 2.0.

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles; su uso en castellano no esta garantizado ni evaluado.
- Riesgo de alucinacion en datos numericos, cifras de mercado y referencias regulatorias: no debe usarse como fuente de verdad financiera sin verificacion humana.
- Es un ajuste de dominio sobre una base de 8B; su conocimiento del sector puede ser superficial comparado con modelos mayores o con sistemas con acceso a datos en tiempo real.
- La licencia llama3 impone restricciones de uso comercial (clausula de 700 millones de usuarios mensuales, obligaciones de atribucion y politica de uso aceptable de Meta); conviene revisarla antes de desplegar en produccion.
- No se documentan etapas de RLHF/DPO en la informacion disponible, por lo que el alineamiento y la robustez frente a prompts adversarios no estan garantizados.
- Las cuantizaciones Q2_K y Q3_K_S degradan notablemente la calidad; para uso serio se recomienda Q4_K_M o superior.
- No hay cuantizaciones imatrix publicadas por el autor en el momento de la redaccion, segun la model card.
- El repositorio ocupa 71,8 GB por incluir todas las variantes; descargar solo el fichero GGUF necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/finance-Llama3-8B-GGUF
- Modelo base: https://huggingface.co/instruction-pretrain/finance-Llama3-8B
- Pagina de descargas del autor: https://hf.tst.eu/model#finance-Llama3-8B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Datasets declarados: https://huggingface.co/datasets/Open-Orca/OpenOrca, https://huggingface.co/datasets/GAIR/lima, https://huggingface.co/datasets/WizardLM/WizardLM_evol_instruct_V2_196k
