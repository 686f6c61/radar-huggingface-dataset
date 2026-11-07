# mradermacher/Kitchoon-Final-26B-A4B-i1-GGUF

## Resumen

Kitchoon-Final-26B-A4B-i1-GGUF es una cuantizacion GGUF del modelo SubMaroon/Kitchoon-Final-26B-A4B, publicada por mradermacher. El modelo base es un transformer de tipo Mixture of Experts (MoE) de 25.233.142.046 parametros totales (aproximadamente 26B), con 4B de parametros activos segun la nomenclatura A4B, construido sobre la arquitectura Gemma 4 segun las etiquetas del autor. Esta orientado a roleplay conversacional y etiquetado como "uncensored" y "heretic", lo que indica un ajuste fino deliberado para reducir los rechazos y filtros de seguridad del modelo original.

La relevancia de esta publicacion es practica: mradermacher ofrece una bateria completa de cuantizaciones con imatrix (IQ1_M hasta Q6_K), lo que permite ejecutar un MoE de 26B en hardware de consumo. Al tener solo 4B de parametros activos por token, la velocidad de inferencia se aproxima a la de un modelo denso de 4B aunque la calidad efectiva se acerca a la de un 26B. La licencia Apache 2.0 facilita su uso comercial sin restricciones adicionales.

El modelo esta pensado para despliegues locales en herramientas como llama.cpp, Ollama o LM Studio, especialmente en escenarios de roleplay, escritura creativa y conversacion sin restricciones. Es una cuantizacion, no un modelo original: todas las capacidades y limitaciones derivan del modelo base de SubMaroon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), base Gemma 4 segun etiquetas del autor |
| Parametros totales | 25.233.142.046 (aproximadamente 26B) |
| Parametros activos | 4B (según nomenclatura A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_M, i1-Q2_K, i1-Q2_K_S, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_K_S, i1-Q4_K_M, i1-Q5_K_S, i1-Q6_K (con imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture of Experts de tipo Gemma 4, con 25.233 millones de parametros totales y aproximadamente 4B activos por token. La etiqueta "A4B" confirma el diseno de expertos dispersos: en cada paso de inferencia solo se activa una fraccion del total, lo que reduce el coste computacional manteniendo la capacidad de representacion de un modelo grande. No se dispone de informacion detallada sobre el numero de expertos, la funcion de routing, el numero de tokens de entrenamiento ni la composicion del dataset.

El ajuste fino del modelo base incluye tecnicas de "heretic" y "uncensored", orientadas a eliminar los comportamientos de rechazo tipicos de los modelos alineados. No se especifica si se empleo RLHF, DPO u otra tecnica de alineacion. La cuantizacion i1 de mradermacher utiliza ficheros imatrix para ponderar la importancia de cada tensor durante la cuantizacion, lo que mejora la calidad respecto a cuantizaciones estaticas equivalentes en tamano, especialmente en los niveles bajos (IQ1, IQ2, IQ3). El repositorio incluye el fichero imatrix original (0,2 GB) para quien quiera generar sus propias cuantizaciones.

## Capacidades

- Generacion de texto conversacional y creativo, con enfasis en roleplay multi-turno.
- Modelo marcado como vision: el autor indica que los ficheros mmproj, si existen, estan en el repositorio estatico (Kitchoon-Final-26B-A4B-GGUF).
- Comportamiento "uncensored": menor probabilidad de rechazo ante peticiones que los modelos alineados convencionalmente rechazarian.
- Compatible con SillyTavern segun las etiquetas del autor, lo que implica soporte para plantillas de chat y personajes.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo de idiomas.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Roleplay conversacional local: el modelo esta disenado explicitamente para roleplay y es compatible con SillyTavern; sus 4B activos permiten mantener conversaciones largas en una GPU de consumo con cuantizaciones Q4_K_M (16,9 GB) o IQ4_XS (14,0 GB).
- Escritura creativa sin filtros: la naturaleza "uncensored" y "heretic" lo hace adecuado para ficcion con tematicas adultas o violentas donde otros modelos rechazan la peticion; conviene revisar las implicaciones legales y eticas antes de desplegarlo.
- Prototipado de chatbots de personaje: al ser Apache 2.0 y caber en hardware consumer, permite iterar rapidamente sobre personalidades y prompts sin coste de API.
- Generacion de dialogos para videojuegos o narrativa interactiva: la ventana de contexto no esta documentada, pero el modelo base Gemma suele ofrecer contextos amplios; conviene verificar el valor real antes de disenar el sistema.
- Inferencia en estaciones de trabajo con una sola GPU: con cuantizaciones IQ2 o Q3 (9-14 GB) se puede ejecutar en GPUs de 12-16 GB de VRAM, y con Q4_K_M en GPUs de 24 GB.
- Experimentacion con arquitecturas MoE: util para investigadores que quieran medir el rendimiento real de un MoE de 26B con 4B activos frente a modelos densos de tamano similar en tareas de generacion abierta.
- Fine-tuning ligero sobre la base: al disponer de safetensors del modelo original y licencia Apache 2.0, se puede reentrenar o aplicar LoRA sobre el modelo base y volver a cuantizar con el imatrix incluido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: IQ1_M 8,8 GB; IQ2_XXS 9,4 GB; IQ2_M 10,5 GB; Q2_K 10,7 GB; IQ3_XXS 11,4 GB; Q3_K_S 12,3 GB; IQ3_M 12,5 GB; Q3_K_M 13,4 GB; IQ4_XS 14,0 GB; Q4_K_S 15,6 GB; Q4_K_M 16,9 GB; Q5_K_S 18,1 GB; Q6_K 22,7 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M o Q5_K_S con comodidad; RTX 4080 / 4070 Ti Super (16 GB) para Q4_K_S o IQ4_XS; RTX 3060 12 GB para IQ3_M o Q3_K_S; A100 / H100 para cuantizaciones altas o despliegue concurrente.
- Cabe en GPU de consumo: si, desde GPUs de 10-12 GB con cuantizaciones IQ2/IQ3, y en 24 GB con Q4_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp. vLLM y TGI no soportan GGUF de forma nativa generalizada; para esos motores habria que usar el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles. Al tener 4B parametros activos, se espera un throughput notablemente superior al de un denso de 26B, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Kitchoon-Final-26B-A4B-i1-GGUF | 25,2B | 4B | no disponible | Apache 2.0 | GGUF | Roleplay uncensored, cuantizaciones imatrix |
| Kitchoon-26B-A4B-GGUF | no disponible | 4B (por nombre) | no disponible | Apache 2.0 | GGUF | Version estatica del mismo linaje |
| Kitchoon-V3-26B-A4B-i1-GGUF | no disponible | 4B (por nombre) | no disponible | no disponible | GGUF | Version previa (V3) del mismo autor |
| Modelo base SubMaroon/Kitchoon-Final-26B-A4B | 25,2B | 4B | no disponible | Apache 2.0 | safetensors | Pesos originales sin cuantizar |

No se dispone de datos de benchmarks para establecer comparaciones cuantitativas con modelos de la misma categoria (por ejemplo, otros MoE de 20-30B orientados a roleplay). La comparativa se limita a variantes del mismo linaje.

## Limitaciones y advertencias

- Solo soporta ingles segun el campo de idiomas; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Modelo "uncensored" y "heretic": puede generar contenido que viole politicas de uso en entornos corporativos o plataformas publicas; requiere moderacion externa si se expone a usuarios finales.
- Riesgo de alucinacion no cuantificado: no hay benchmarks publicados que permitan estimar la tasa de errores facticos.
- Longitud de contexto no documentada; no se debe asumir un valor concreto sin verificarlo en la configuracion del modelo base.
- Las cuantizaciones IQ1 e IQ2 estan marcadas por el propio autor como de calidad baja o "desperate"; no son recomendables para produccion.
- El modelo es una cuantizacion, no un modelo original: los bugs o degradaciones introducidos por la cuantizacion no son responsabilidad del autor del modelo base.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo "uncensored" puede conllevar riesgos reputacionales y legales segun la jurisdiccion y el contexto de despliegue.
- No hay informacion sobre sesgos especificos del modelo base ni sobre la composicion del dataset de ajuste fino.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de comunidad ni de validacion externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Kitchoon-Final-26B-A4B-i1-GGUF
- Modelo base: https://huggingface.co/SubMaroon/Kitchoon-Final-26B-A4B
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Kitchoon-Final-26B-A4B-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Kitchoon-Final-26B-A4B-i1-GGUF
- Version V3 del linaje: https://huggingface.co/mradermacher/Kitchoon-V3-26B-A4B-i1-GGUF
- Version Kitchoon-26B-A4B: https://huggingface.co/mradermacher/Kitchoon-26B-A4B-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
