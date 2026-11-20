# mradermacher/Omega-Arsenal-26B-A4B-Final-i1-GGUF

## Resumen

Omega-Arsenal-26B-A4B-Final-i1-GGUF es la versión cuantizada en formato GGUF del modelo Omega-Arsenal-26B-A4B-Final, publicado por el usuario ReadyArt y cuantizado por mradermacher, un perfil conocido por generar cuantizaciones GGUF de modelos de la comunidad. El modelo base es un transformer de aproximadamente 25.230 millones de parámetros (25,23 B) según los pesos en safetensors, con un esquema de nombres "A4B" que sugiere arquitectura de mezcla de expertos (MoE) con unos 4.000 millones de parámetros activos, aunque este dato no está confirmado en la información disponible.

El modelo está orientado explícitamente a contenido para adultos: roleplay, narrativa erótica, terror y violencia, con etiquetas como "nsfw", "explicit", "unaligned" y "not-for-all-audiences". No es un modelo de propósito general alineado, sino una variante de rol conversacional en inglés, sin datos publicados sobre entrenamiento, benchmarks ni contexto máximo. Su relevancia radica en que ofrece una alternativa local y cuantizada para aplicaciones de ficción interactiva y narrativa madura, con licencia Apache 2.0 y un abanico amplio de cuantizaciones desde 8,4 GB hasta 22,7 GB.

La ficha describe tanto el modelo base como las cuantizaciones i1 (imatrix) publicadas por mradermacher, que incluyen desde IQ1_S hasta Q6_K, además de una versión estática en otro repositorio. No hay información sobre pipeline, idiomas distintos del inglés ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (probablemente MoE; no confirmado en la informacion disponible) |
| Parametros totales | 25.233.142.046 (25,23 B) |
| Parametros activos | no disponible (el nombre "A4B" sugiere ~4 B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K, i1-Q2_K_S, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_1, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; ademas version estatica en repositorio aparte |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones) y safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. El nombre "26B-A4B" y el tamaño de 25,23 B de parámetros apuntan a un transformer con mezcla de expertos (MoE), donde "A4B" indicaría aproximadamente 4.000 millones de parámetros activos por token, pero este extremo no está confirmado en la model card ni en los metadatos. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o fine-tuning supervisado.

La única información técnica relevante es la relativa al proceso de cuantización: mradermacher ha generado cuantizaciones ponderadas con imatrix (i1) a partir del modelo base, incluyendo un fichero imatrix independiente de 0,2 GB para que otros usuarios puedan crear sus propias cuantizaciones. Se ofrece también una colección de cuantizaciones estáticas en un repositorio separado. Las etiquetas del modelo ("unaligned", "roleplay", "ERP", "Erotic", "Horror", "Violence") indican un ajuste fino orientado a narrativa adulta y conversación de rol, presumiblemente mediante fine-tuning sobre el modelo base, aunque no se documenta el proceso.

## Capacidades

- Generación de texto conversacional en inglés, orientada a roleplay multi-turno.
- Narrativa explícita para adultos: contenido erótico, terror y violencia, según las etiquetas del autor.
- Modo instructivo y conversacional ("instruct", "conversational").
- Estilo "unaligned": menor rechazo a contenido sensible o explícito que los modelos alineados convencionales.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del inglés.
- No se documentan capacidades de visión, audio ni modo "thinking".
- Compatible con endpoints (etiqueta "endpoints_compatible") y con la librería transformers.

## Casos de uso

- Ficción interactiva para adultos: el modelo puede sostener conversaciones de rol multi-turno con personajes y tramas maduras, aprovechando su ajuste específico para ERP y narrativa explícita.
- Escritura asistida de narrativa de terror y violencia: útil para autores que necesitan generar borradores de escenas explícitas o violentas sin las restricciones de modelos alineados.
- Motores de rol en videojuegos indie: integrable vía llama.cpp u Ollama en un servidor local para generar diálogos de personajes NPC con contenido maduro, con cuantizaciones Q4_K_M de 16,9 GB que caben en GPUs de 24 GB.
- Prototipado de chatbots de personaje: la licencia Apache 2.0 permite uso comercial y modificación, lo que facilita desplegar asistentes de rol en productos de nicho para adultos.
- Investigación sobre alineación y contenido: sirve como caso de estudio de modelo "unaligned" para analizar comportamiento, sesgos y límites de seguridad en modelos abiertos.
- Generación de guiones y diálogos para audiolibros o podcasts de ficción madura: el modelo puede producir texto en inglés con tono narrativo consistente, aunque requiere revisión humana por riesgo de alucinación.
- Despliegue local en estaciones de trabajo: las cuantizaciones IQ2/IQ3 (9-14 GB) permiten ejecución en GPUs consumer de 12-16 GB para experimentación sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache): desde ~8,4 GB (i1-IQ1_S) hasta ~22,7 GB (i1-Q6_K); las cuantizaciones recomendadas Q4_K_M (~16,9 GB) y Q5_K_M (~19,2 GB) requieren GPUs de 24 GB para dejar margen a contexto y caché.
- GPU recomendadas: RTX 3090/4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40/80 GB o H100 para Q6_K con contextos largos; GPUs de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti Super 16 GB) para cuantizaciones IQ2/IQ3.
- Cabe en GPU consumer: sí, en RTX 3090/4090 con Q4_K_M o Q5_K_M; en GPUs de 12 GB con IQ2_M (~10,5 GB) o IQ3_XS (~11,7 GB).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con transformers, vLLM o TGI si se dispone de VRAM suficiente (superior a 50 GB en FP16).
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización elegida. Al ser un MoE con ~4 B activos (si se confirma), el throughput esperado sería superior al de un denso de 25 B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La comparativa con alternativas de rol para adultos (por ejemplo, variantes fine-tuned de Mistral o Llama) requeriría datos de benchmarks y contexto que no están disponibles.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Omega-Arsenal-26B-A4B-Final-i1-GGUF | 25,23 B (MoE, ~4 B activos sin confirmar) | no disponible | Apache 2.0 | GGUF | Orientado a rol adulto, solo inglés |
| Alternativas de rol adulto | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables |

## Limitaciones y advertencias

- Contenido explícito: el modelo está diseñado para generar material NSFW, erótico, violento y de terror; no es apto para menores ni para entornos sin control de contenido.
- Sesgos conocidos: no documentados, pero al ser un fine-tuning "unaligned" sobre datos de rol, es probable que reproduzca estereotipos de género y violencia presentes en la narrativa de entrenamiento; se recomienda auditoría previa.
- Riesgo de alucinación: alto en un modelo conversacional sin benchmarks publicados; no debe usarse como fuente de información factual.
- Limitaciones de idioma: solo inglés; el rendimiento en castellano no está garantizado.
- Longitud de contexto: no disponible; no se debe asumir una ventana larga sin verificación empírica.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado puede infringir normativas locales sobre material adulto; la responsabilidad recae en el desplegador.
- Falta de transparencia: no hay model card detallada del modelo base, ni datos de entrenamiento, ni evaluación de seguridad; el uso en producción requiere pruebas propias.
- Tamaño del repositorio: 301 GB en total, lo que implica descargas grandes si se quieren varias cuantizaciones; conviene descargar solo el fichero GGUF necesario.
- Etiqueta "not-for-all-audiences": muchos proveedores de inferencia bloquean este tipo de modelos; verificar políticas de la plataforma antes de desplegar.

## Enlaces

- Repositorio Hugging Face (cuantizaciones i1): https://huggingface.co/mradermacher/Omega-Arsenal-26B-A4B-Final-i1-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Omega-Arsenal-26B-A4B-Final
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Omega-Arsenal-26B-A4B-Final-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Omega-Arsenal-26B-A4B-Final-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
