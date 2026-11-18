# aisingapore/Qwen-SEA-LION-v5-397B-A17B-Plus

## Resumen

Qwen-SEA-LION-v5-397B-A17B-Plus es un modelo multimodal de tipo Mixture-of-Experts desarrollado por AI Singapore (AI Products Pillar) y financiado por el National Research Foundation de Singapur. Parte de Qwen/Qwen3.5-397B-A17B, al que se le ha convertido la arquitectura a Qwen4Exp (la de Qwen3.8-Flash-Next) y se ha sometido a un post-entrenamiento en ingles y lenguas del sudeste asiatico. El objetivo es cubrir las necesidades linguisticas y culturales de la region SEA, un nicho tradicionalmente mal atendido por los modelos generalistas.

El modelo acepta texto, imagen y video como entrada, genera texto y dispone de una ventana de contexto nativa de 262.144 tokens, extensible hasta aproximadamente 1M con YaRN. Integra atencion hibrida Gated DeltaNet + Qwen Sparse Attention (QSA), un flujo residual con cuatro ramas (Gated Residual), una memoria de n-gramas hasheada en la capa 2 y prediccion multi-token nativa (MTP) para decodificacion especulativa. El resultado es un modelo de altisima capacidad con un coste de inferencia por token relativamente contenido gracias a su sparse routing.

Es relevante ahora porque combina tres tendencias: modelos multimodales de gran escala, arquitecturas hibridas que abaratan el coste de contexto largo y una especializacion regional real (birmano, filipino, indonesio, malayo, tamil, tailandes y vietnamita, ademas de chino e ingles). La licencia MIT facilita su adopcion comercial sin las restricciones tipicas de otros modelos de este tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido causal con vision encoder: Gated DeltaNet + Qwen Sparse Attention (QSA), Gated Residual de 4 ramas, n-gram embeddings y capa MTP; Mixture-of-Experts disperso |
| Parametros totales | 569.454.962.707 (569B, incluye ~164B en tablas de n-gramas) |
| Parametros activos | ~19B por token (aprox. 398B efectivos sin tablas n-gram) |
| Longitud de contexto | 262.144 tokens nativos; ~1M con YaRN |
| Tipos de cuantizacion | No especificados por el autor en la informacion disponible (pesos en safetensors, probablemente BF16/FP8) |
| Idiomas soportados | Birmano, chino, ingles, indonesio, filipino, malayo, tamil, tailandes y vietnamita (cobertura declarada del base: 201 idiomas y dialectos) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura deriva de Qwen3.5-397B-A17B, convertida a Qwen4Exp con tres componentes clave. Primero, QSA hybrid attention: se conservan las 45 capas Gated DeltaNet del base y las 15 capas de atencion completa se sustituyen por QSA, donde un indexador puntua bloques comprimidos de cuatro tokens y cada query atiende hasta 2.048 tokens de los bloques mejor puntuados mas el bloque final incompleto, reduciendo el coste de la atencion completa en contextos largos. Segundo, Gated Residual: el flujo residual se ensancha en cuatro ramas paralelas y cada bloque de atencion y feed-forward lee una mezcla dependiente de la entrada y escribe con un peso por rama. Tercero, N-gram Embedding: se anade una memoria hasheada de bigramas y trigramas en la capa 2, con lookups dispersos que pueden residir en memoria del host; las tablas se inicializan desde las de Qwen3.8-Flash-Next, se ensanchan de 160 a 256 canales por cabeza y se duplican los buckets hasta unos 40M por cabeza.

El post-entrenamiento se realizo en ingles y lenguas SEA sobre el dataset aisingapore/SEA-Instruct-2602. El tokenizer, el vision encoder y los valores por defecto de muestreo se heredan de Qwen sin cambios. La plantilla de chat es la de Qwen3.8-27B sin reasoning effort, de modo que el modo thinking y el thinking preservado estan activados por defecto; con `preserve_thinking=False` solo se conserva el razonamiento desde el ultimo mensaje del usuario. Tambien se anadieron QSA y Gated Residual a la capa draft de MTP, y se mantuvo el gating SiLU de salida en Gated DeltaNet (Flash-Next usa sigmoide).

## Capacidades

- Generacion de texto y razonamiento paso a paso en modo thinking por defecto, con opcion de thinking preservado entre turnos.
- Comprension de imagen y video mediante un vision encoder heredado de Qwen, con entrenamiento early-fusion sobre tokens multimodales.
- Codigo y matematicas: el modelo base declara paridad con Qwen3 y mejora sobre Qwen3-VL en benchmarks de razonamiento, coding, agente y comprension visual.
- Tool calling y function calling robustos, con soporte declarado para Qwen-Agent y Qwen Code.
- Capacidades agenticas: entrenamiento con RL escalado en entornos de millones de agentes, orientado a multi-step reasoning.
- Multilingueismo amplio: 201 idiomas y dialectos en el base, con especializacion real en nueve lenguas (birmano, chino, ingles, indonesio, filipino, malayo, tamil, tailandes, vietnamita).
- Prediccion multi-token nativa (MTP) que habilita decodificacion especulativa y reduce latencia.
- Contexto largo de 262.144 tokens, extensible a ~1M con YaRN.
- Comprension cultural y regional especifica del sudeste asiatico.

## Casos de uso

- Atencion al cliente multilingue en el sudeste asiatico: el modelo puede gestionar conversaciones multi-turno en indonesio, malayo, tailandes o vietnamita con contexto de hasta 262.144 tokens, lo que permite mantener el historial completo de un cliente y documentos adjuntos (facturas, capturas) dentro de la misma ventana.
- Tramitacion documental con imagenes: gracias a su entrada image-text-to-text, puede extraer y razonar sobre formularios, albaranes o documentos de aduana escaneados y responder en el idioma del usuario, como ilustra el ejemplo de exportacion de durianes congelados de Medan a Singapur de la model card.
- Analisis de video para monitorizacion: con entrada de video y contexto largo, es adecuado para resumir grabaciones, generar subtitulos o detectar eventos en flujos de camaras de vigilancia o contenido editorial.
- Agentes de automatizacion con tool calling: su soporte nativo de function calling y su entrenamiento en entornos multi-agente lo hacen apto para orquestar APIs, consultar bases de datos y ejecutar flujos multi-paso en produccion.
- Generacion y revision de codigo: puede integrarse en pipelines de CI/CD para revision de pull requests, generacion de tests o explicacion de errores, con la ventaja de entender comentarios y documentacion en lenguas SEA.
- Investigacion linguistica y preservacion cultural: con cobertura de birmano, tamil o filipino, sirve para crear corpus anotados, traducciones de calidad y materiales educativos en idiomas con pocos recursos.
- Asistentes de salud o servicios publicos en la region: el contexto largo permite adjuntar historiales o normativa completa y responder en el idioma local, reduciendo la friccion para ciudadanos que no dominan el ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 569B parametros totales y ~19B activos, en BF16 se necesitan del orden de 1,1 TB de VRAM (el repo pesa 1.138,9 GB); en FP8 aproximadamente 570 GB; en cuantizaciones de 4 bits, del orden de 285 GB. Las tablas de n-gramas (~164B) pueden residir en memoria del host gracias a los lookups dispersos.
- GPU recomendadas: despliegue multi-nodo con H100 80GB (8 o mas por nodo), H200 o B200; A100 80GB en configuraciones de 8-16 GPUs para FP8/INT8.
- No cabe en GPU de consumo: ni una RTX 4090 (24 GB) ni una RTX 5090 podrian alojar el modelo completo; solo seria viable con cuantizaciones extremas y offload masivo, con latencia muy degradada.
- Opciones de despliegue: transformers (`AutoModelForImageTextToText`), vLLM y SGLang, segun la model card; llama.cpp/Ollama no estan indicados para este tamano.
- Latencia y throughput: no disponibles en la informacion proporcionada; la MTP nativa y la atencion QSA estan disenadas para reducir latencia y coste en contextos largos, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Modalidad |
|---|---|---|---|---|---|
| Qwen-SEA-LION-v5-397B-A17B-Plus | 569B (con n-gram) | ~19B | 262.144 (1M con YaRN) | MIT | Texto, imagen, video |
| Qwen/Qwen3.5-397B-A17B (base) | ~397B | ~17B | 262.144 | no disponible en la informacion | Texto, imagen, video |
| Qwen/Qwen3.8-Flash-Next (origen de Qwen4Exp) | no disponible | no disponible | no disponible | no disponible | no disponible |

El modelo se posiciona como una variante regional del base Qwen3.5-397B-A17B, con arquitectura Qwen4Exp mas eficiente en contexto largo y con post-entrenamiento especifico para SEA. Frente a alternativas generalistas del mismo orden de magnitud, su ventaja es la cobertura linguistica regional y la licencia MIT; su desventaja es la ausencia de benchmarks publicos que permitan cuantificar la mejora.

## Limitaciones y advertencias

- No se han publicado benchmarks propios: no es posible verificar empiricamente la calidad en tareas SEA frente al base ni frente a competidores.
- Riesgo de alucinacion inherente a los LLM de gran escala, especialmente en modo thinking con contextos largos y en idiomas de bajos recursos como birmano o tamil.
- El modo thinking activado por defecto incrementa el coste por consulta y la latencia; en produccion conviene desactivarlo o limitar el razonamiento segun el caso.
- El contexto de ~1M con YaRN es una extension, no nativa; la calidad puede degradarse en los extremos de la ventana.
- La especializacion linguistica cubre nueve idiomas; otros idiomas del base pueden rendir peor tras el post-entrenamiento.
- Licencia MIT: permite uso comercial sin restricciones, pero conviene revisar las condiciones del modelo base Qwen y de los datos de entrenamiento (SEA-Instruct-2602) por si imponen obligaciones adicionales.
- El enorme tamano (1,1 TB en safetensors) limita el despliegue a infraestructura multi-GPU; no es viable en entornos de consumo ni en edge.
- La arquitectura Qwen4Exp es reciente y su soporte en herramientas (vLLM, SGLang) puede requerir versiones concretas; verificar compatibilidad antes de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-397B-A17B-Plus
- Coleccion SEA-LION v5: https://huggingface.co/collections/aisingapore/sea-lion-v5-6afab40ea2b5b627e9930703
- Sitio de SEA-LION: https://sea-lion.ai
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-397B-A17B
- Arquitectura Qwen4Exp (Qwen3.8-Flash-Next): https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Plantilla de chat de referencia (Qwen3.8-27B): https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de post-entrenamiento: https://huggingface.co/datasets/aisingapore/SEA-Instruct-2602
- Licencia MIT: https://mit-license.org/
