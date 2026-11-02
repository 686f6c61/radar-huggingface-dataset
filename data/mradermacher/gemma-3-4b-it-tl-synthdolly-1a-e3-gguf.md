# mradermacher/Gemma-3-4B-IT-TL-SynthDolly-1A-E3-GGUF

## Resumen
Gemma-3-4B-IT-TL-SynthDolly-1A-E3-GGUF es una cuantizacion en formato GGUF del modelo kairawal/Gemma-3-4B-IT-TL-SynthDolly-1A-E3, un ajuste fino (fine-tuning) del modelo Gemma 3 4B Instruct de Google. El trabajo de cuantizacion lo firma mradermacher, un autor habitual en el ecosistema de pesos GGUF para llama.cpp, y publica el artefacto bajo licencia Apache 2.0. El modelo base parte de la familia Gemma 3, una arquitectura transformer decoder-only multimodal con capacidad de procesamiento de imagen y texto, aunque la model card solo declara el idioma ingles.

El modelo resuelve el problema de desplegar un ajuste fino concreto (orientado a instrucciones y datos sinteticos derivados de SynthDolly) en entornos donde no hay GPU de gran capacidad, ofreciendo variantes desde Q2_K (1,8 GB) hasta f16 (7,9 GB) y un proyector multimodal mmproj en Q8_0 y f16. Es relevante para desarrolladores que quieran probar el ajuste fino en hardware de consumo sin necesidad de infraestructura dedicada, aunque el numero de descargas (91) y la ausencia de benchmarks publicados indican que es un artefacto de nicho.

La ficha describe tanto el modelo cuantizado como sus implicaciones practicas: no hay datos de evaluacion publicados por el autor, la model card es fundamentalmente un catalogo de cuantizaciones y el modelo base no documenta la composicion exacta de su dataset de ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3), multimodal con proyector mmproj |
| Parametros totales | 3.880.263.168 (3,88 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; proyector multimodal mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento
El modelo base es un Gemma 3 4B Instruct, es decir, un transformer decoder-only de aproximadamente 3,88 mil millones de parametros con atencion multimodal (proyector mmproj para entrada de imagen, evidenciado por los ficheros mmproj-Q8_0 y mmproj-f16 del repositorio). Sobre esa base, kairawal aplico un ajuste fino con LoRA (el tag `unsloth` sugiere el uso de la libreria Unsloth para el entrenamiento eficiente) sobre un dataset sintetico derivado de SynthDolly, segun indica el nombre del modelo (`TL-SynthDolly-1A-E3`). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo fases de RLHF o DPO posteriores al ajuste supervisado.

La innovacion tecnica de este repositorio no reside en el modelo sino en el proceso de cuantizacion: mradermacher genera cuantizaciones estaticas (no ponderadas ni con imatrix, segun indica la propia model card) en un rango amplio de precisiones, desde Q2_K hasta f16, e incluye el proyector multimodal en dos precisiones. La model card advierte explicitamente que las cuantizaciones ponderadas o con imatrix no estan disponibles en el momento de la publicacion y que, si no aparecen en una semana, probablemente no se planifiquen.

## Capacidades
- Generacion de texto conversacional en ingles, heredada del ajuste instructivo de Gemma 3 4B IT.
- Procesamiento multimodal de imagen y texto gracias al proyector mmproj incluido en el repositorio (ficheros mmproj-Q8_0 y mmproj-f16).
- Ajuste fino orientado a instrucciones sobre datos sinteticos derivados de SynthDolly, lo que puede mejorar el seguimiento de instrucciones en dominios concretos, aunque no se documenta cuales.
- Compatibilidad con text-generation-inference y transformers, segun los tags del repositorio.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que facilita el despliegue en plataformas de inferencia gestionada.
- No se documenta soporte explicito de tool calling, function calling, agentes multi-paso ni modo thinking en la informacion disponible.

## Casos de uso
- Prototipado local de asistentes conversacionales en ingles: las variantes Q4_K_M (2,6 GB) y Q5_K_M (2,9 GB) permiten ejecutar el modelo en portatiles con 8-16 GB de RAM mediante llama.cpp u Ollama, ideal para validar el ajuste fino antes de invertir en infraestructura.
- Evaluacion de ajustes finos sobre Gemma 3: investigadores que quieran comparar el comportamiento del ajuste SynthDolly frente al Gemma 3 4B IT original pueden desplegar ambas variantes con la misma cuantizacion y realizar pruebas A/B controladas.
- Procesamiento de documentos con imagen y texto: el proyector mmproj permite alimentar capturas, diagramas o formularios escaneados junto a instrucciones textuales, util para tareas de extraccion de informacion en entornos con recursos limitados.
- Despliegue en dispositivos edge o sin GPU: la variante Q2_K (1,8 GB) o IQ4_XS (2,4 GB) cabe en sistemas con poca memoria y permite inferencia en CPU, adecuada para demos offline o entornos air-gapped.
- Generacion de respuestas en pipelines de TGI: el tag `text-generation-inference` y `endpoints_compatible` indican que el modelo puede servirse con Hugging Face TGI para cargas de trabajo por lotes en ingles.
- Base para nuevos ajustes finos: al estar bajo Apache 2.0 y en formato GGUF, sirve como punto de partida para experimentos de cuantizacion o para comparar tecnicas de post-entrenamiento sobre el mismo ajuste.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM/RAM estimada para inferencia segun cuantizacion: Q2_K ~1,8 GB; IQ4_XS ~2,4 GB; Q4_K_M ~2,6 GB; Q5_K_M ~2,9 GB; Q6_K ~3,3 GB; Q8_0 ~4,2 GB; f16 ~7,9 GB. Anadir ~0,7-1,0 GB adicionales si se usa el proyector multimodal mmproj.
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB de VRAM para Q4_K_M o Q5_K_M (RTX 3060, RTX 4060, RTX 4070); para f16 se recomienda una GPU con 12 GB o mas (RTX 4070 Ti, RTX 4080, RTX 4090) o una A100/H100 si se busca throughput alto.
- Cabe en GPU consumer: si, en la mayoria de tarjetas modernas con 8 GB o mas para cuantizaciones Q4/Q5; en GPUs integradas o sistemas con 8 GB de RAM totales conviene usar Q2_K o IQ4_XS.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (TGI), transformers con soporte GGUF, y plataformas compatibles con endpoints.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-3-4B-IT-TL-SynthDolly-1A-E3-GGUF (este) | 3,88 B | no disponible | apache-2.0 | GGUF | Ajuste fino sobre Gemma 3 4B IT con datos SynthDolly, cuantizado por mradermacher |
| google/gemma-3-4b-it | 3,88 B | no disponible en esta ficha | Gemma Terms of Use | safetensors, GGUF (comunidad) | Modelo original de Google, sin ajuste fino adicional |
| kairawal/Gemma-3-4B-IT-TL-SynthDolly-1A-E3 | 3,88 B | no disponible | apache-2.0 | safetensors | Modelo base sin cuantizar del que deriva este repositorio |
| Modelos 4B comparables (p. ej. Qwen2.5-3B-Instruct, Llama-3.2-3B-Instruct) | ~3-4 B | variable | variable | safetensors, GGUF | Alternativas de tamano similar; no se dispone de comparacion de rendimiento con este ajuste concreto |

## Limitaciones y advertencias
- No hay benchmarks publicados: no es posible afirmar que el ajuste fino supere al Gemma 3 4B IT original en ninguna tarea; la calidad debe validarse empiricamente.
- Idioma limitado: la model card solo declara ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea inferior.
- Riesgo de alucinacion: inherente a los modelos de 4B y acentuado por un ajuste fino sobre datos sinteticos, cuya calidad y cobertura no se documentan.
- Sesgos conocidos: heredados del modelo base Gemma 3 y del dataset sintetico SynthDolly; no se han publicado analisis de sesgo especificos para este ajuste.
- Licencia: Apache 2.0 segun la model card, pero conviene verificar la compatibilidad con los terminos de uso de Gemma 3 de Google, ya que el modelo base original se distribuye bajo Gemma Terms of Use.
- Cuantizaciones estaticas: la model card advierte que no hay cuantizaciones ponderadas ni con imatrix, lo que puede suponer una perdida de calidad mayor en precisiones bajas (Q2_K, Q3_K_S) frente a alternativas con imatrix.
- Contexto no documentado: no se especifica la longitud de contexto soportada en la informacion proporcionada, lo que impide planificar cargas con ventanas largas.
- Proyecto de nicho: 91 descargas y 0 likes en el momento de la consulta; no hay garantia de mantenimiento ni de soporte por parte del autor.

## Enlaces
- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/mradermacher/Gemma-3-4B-IT-TL-SynthDolly-1A-E3-GGUF
- Modelo base sin cuantizar: https://huggingface.co/kairawal/Gemma-3-4B-IT-TL-SynthDolly-1A-E3
- Pagina de overview de cuantizaciones del autor: https://hf.tst.eu/model#Gemma-3-4B-IT-TL-SynthDolly-1A-E3-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Empresa del autor (nethype GmbH): https://www.nethype.de/
