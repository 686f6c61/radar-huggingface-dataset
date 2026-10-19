# mradermacher/Gemma-4-E2B-SFT-Sinhala-Merged-GGUF

## Resumen

Este repositorio no contiene un modelo original, sino una colección de cuantizaciones GGUF estáticas del checkpoint SynhalaAI/Gemma-4-E2B-SFT-Sinhala-Merged, publicadas por mradermacher, un autor conocido por convertir pesos de HuggingFace a formatos GGUF para inferencia local. El modelo subyacente parte de Gemma 4 E2B de Google y ha sido sometido a un ajuste supervisado (SFT) orientado al sinhala, cuyos adaptadores se han fusionado con los pesos base, según indican el nombre del checkpoint y la etiqueta `unsloth`.

El dato objetivo de tamaño es el recuento de safetensors del repositorio: 4.647.450.147 parámetros. Este número entra en conflicto con las referencias públicas de la familia Gemma 4 E2B, que citan 2,1 mil millones de parámetros; la nomenclatura "E" de Google alude a parámetros efectivos, de modo que el total real puede ser muy superior al efectivo, pero la model card no documenta ni la arquitectura ni el reparto de parámetros activos. Es relevante ahora porque permite ejecutar un derivado de Gemma 4 ajustado a sinhala en CPU o en GPU de consumo con tan solo 3,1-3,5 GB de pesos en cuantizaciones Q2_K a Q5_K_M.

Se trata de un artefacto de nicho: 156 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados, sin licencia declarada y con una model card que es esencialmente una plantilla de cuantización. Resulta útil para quien necesite inferencia local multilingüe de bajo coste, pero no debe considerarse una referencia validada para producción sin evaluación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Gemma 4 (detalle de capas, atención y posibles componentes MoE no disponibles en la model card) |
| Parámetros totales | 4.647.450.147 (recuento de safetensors del repositorio); las referencias públicas de Gemma 4 E2B citan 2,1 B, discrepancia no aclarada por el autor |
| Parámetros activos | No disponible; la nomenclatura "E2B" de la familia Gemma remite a parámetros efectivos, pero la model card no confirma arquitectura MoE ni el número de activos |
| Longitud de contexto | No disponible en la model card; las referencias de terceros son contradictorias (8K para E2B según gemma4.dev, hasta 256K para la familia Gemma 4 según Google) |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; además mmproj-Q8_0 y mmproj-f16 para el proyector multimodal. No hay cuantizaciones con imatrix en el momento de la publicación |
| Idiomas soportados | La model card declara únicamente `en`; el nombre del checkpoint y su procedencia indican ajuste para sinhala. Google declara soporte de más de 140 idiomas para la familia Gemma 4, dato no verificado para este derivado |
| Licencia | No disponible; la familia Gemma se distribuye habitualmente bajo los Gemma Terms of Use, extremo no confirmado para este repositorio |
| Formato de pesos | GGUF (múltiples cuantizaciones); el modelo base se distribuye en safetensors para transformers |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna. El checkpoint base es un derivado de Gemma 4 E2B, la variante más pequeña de la cuarta generación de la familia Gemma de Google, que según la documentación oficial combina arquitecturas densas y de mezcla de expertos en cinco tamaños (E2B, E4B, 12B, 26B A4B y 31B). Para este repositorio concreto no se especifican número de capas, tipo de atención, dimensionalidad del embedding ni vocabulario. La presencia de archivos `mmproj` en la distribución GGUF indica que el modelo base incorpora un proyector multimodal, es decir, que admite entrada de imagen además de texto, aunque la model card no lo describe y gemma4.dev caracteriza a E2B como text-only.

Tampoco hay datos sobre el proceso de entrenamiento: ni volumen de tokens, ni composición del dataset, ni si hubo RLHF, DPO o una simple fase de SFT. El sufijo "Merged" y la etiqueta `unsloth` sugieren que el ajuste se realizó mediante LoRA con la librería Unsloth y que los adaptadores se fusionaron posteriormente en los pesos base, pero es una inferencia a partir de metadatos, no una afirmación del autor. El autor del repositorio, mradermacher, no entrena el modelo: únicamente genera las cuantizaciones estáticas a partir del checkpoint de SynhalaAI, sin versiones ponderadas con imatrix.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Gemma 4 E2B.
- Ajuste específico para sinhala, según el nombre del checkpoint base; no hay evaluación publicada del nivel de competencia alcanzado.
- Capacidad multimodal probable: la distribución incluye proyectores `mmproj-Q8_0` (0,7 GB) y `mmproj-f16` (1,1 GB), necesarios para procesar imágenes en llama.cpp; la model card no documenta qué tareas de visión soporta.
- Razonamiento y generación de código: atribuibles a la familia Gemma 4 según Google, sin verificación específica en este derivado.
- Ejecución local en CPU y GPU de consumo gracias a las cuantizaciones de 3,1 a 5,1 GB.
- Compatibilidad con el ecosistema GGUF: llama.cpp, Ollama, LM Studio y servidores compatibles con la API de endpoints.
- No hay información sobre soporte de tool calling, function calling, modo thinking, agentes o multi-step reasoning en este checkpoint concreto.

## Casos de uso

- Atención al cliente en sinhala: el ajuste SFT sobre un modelo de ~4,6 B permite desplegar un asistente conversacional en sinhala sobre una sola GPU de 8-12 GB o incluso en CPU, con Q4_K_M ocupando 3,5 GB y dejando margen de VRAM para el contexto.
- Traducción sinhala-inglés en lotes: al declarar `en` como idioma y estar ajustado para sinhala, es un candidato para pipelines de traducción offline en entornos con conectividad limitada, ejecutado con llama.cpp en servidores sin GPU dedicada.
- Procesamiento de documentos escaneados: cargando el proyector `mmproj-f16` junto al modelo principal, se puede hacer extracción de texto y descripción de imágenes en una única pasada sobre facturas, formularios o documentos administrativos, siempre con validación humana posterior.
- Asistente educativo para Sri Lanka: generación de explicaciones y ejercicios en sinhala en dispositivos de bajo coste, con la cuantización Q4_K_S (3,5 GB) como opción de compromiso entre calidad y velocidad en portátiles sin GPU.
- Prototipado rápido de aplicaciones multilingües: sirve como banco de pruebas para evaluar si un modelo de este tamaño cubre las necesidades de un producto antes de invertir en un modelo mayor, dado el reducido coste de descarga e inferencia.
- Clasificación y etiquetado de texto en sinhala: tareas de moderación, categorización de tickets o enrutamiento de consultas, donde un modelo pequeño ajustado al idioma suele bastar y el coste por token es mínimo.
- Inferencia en el borde o entornos aislados: con Q2_K (3,1 GB) o Q3_K_S (3,2 GB) cabe en dispositivos con 4-6 GB de memoria, útil para despliegues air-gapped sin acceso a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: f16 requiere unos 9,4 GB solo de pesos (10-11 GB con contexto); Q8_0, 5,1 GB; Q6_K, 3,9 GB; Q5_K_M, 3,7 GB; Q4_K_M, 3,5 GB; Q3_K_M, 3,3 GB; Q2_K, 3,1 GB.
- Cabe en GPU de consumo: sí, de forma holgada. RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080 y RTX 4090 ejecutan Q8_0 o f16 sin problemas; una RTX 3060 de 8 GB o una RTX 4060 de 8 GB ejecutan Q4_K_M y Q5_K_M con contexto moderado.
- GPU profesionales: A100, H100 y L40S no son necesarias para este tamaño; resultan sobredimensionadas salvo para servir muchas réplicas concurrentes.
- CPU: viable con Q4_K_M o inferiores en procesadores modernos con AVX2; el rendimiento dependerá del ancho de banda de memoria. Para uso multimodal hay que cargar además el archivo `mmproj` (0,7-1,1 GB).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y llama-cpp-python para los GGUF; vLLM o TGI solo con los pesos originales en safetensors del modelo base, no con estas cuantizaciones.
- Latencia y throughput: no disponibles; no se han publicado mediciones de tokens por segundo para este repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Gemma-4-E2B-SFT-Sinhala-Merged-GGUF (este) | 4,65 B totales (recuento safetensors) | No disponible | No disponible | GGUF en HuggingFace, 156 descargas | Cuantizaciones estáticas sin imatrix, incluye proyectores multimodales |
| Gemma-4-E2B-SFT-Sinhala-Merged (SynhalaAI) | 4,65 B totales | No disponible | No disponible | Safetensors en HuggingFace | Checkpoint de origen, sin cuantizar; requiere transformers |
| Gemma 4 E2B (Google) | 2,1 B según gemma4.dev | 8K según gemma4.dev; hasta 256K para la familia según Google | Gemma Terms of Use (familia) | Peso oficial de Google | Sin ajuste para sinhala; referencia de comparación del comportamiento base |
| Gemma 4 E4B (Google) | No disponible | Hasta 256K según Google (familia) | Gemma Terms of Use (familia) | Peso oficial de Google | Escalón superior de la misma generación; mayor huella de memoria |

No se dispone de datos de rendimiento comparado (MMLU, HumanEval, GSM8K u otros) para este repositorio ni para el checkpoint base, por lo que la comparación se limita a parámetros, formato y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna métrica publicada que permita estimar la calidad del ajuste en sinhala ni la degradación respecto al modelo base.
- Riesgo de olvido catastrófico: el proceso de SFT y fusión puede haber mermado capacidades del Gemma 4 E2B original en otros idiomas y tareas, sin documentación al respecto.
- Discrepancia de parámetros: el recuento de safetensors (4,65 B) no coincide con las referencias públicas de E2B (2,1 B); conviene verificar la arquitectura real antes de dimensionar infraestructura.
- Idiomas: la model card declara solo `en`, mientras el nombre indica sinhala. No hay evaluación de competencia lingüística en ninguno de los dos idiomas ni en castellano.
- Licencia no declarada: no se puede confirmar que el uso comercial esté permitido; la familia Gemma suele estar sujeta a los Gemma Terms of Use, que imponen restricciones y obligaciones de atribución.
- Riesgo de alucinación: inherente a modelos de ~4 B, especialmente en dominios especializados y en idiomas de bajos recursos como el sinhala.
- Cuantizaciones agresivas: Q2_K y Q3_K_S degradan la calidad de forma notable; la propia model card marca Q4_K_S y Q4_K_M como "fast, recommended" y Q6_K como "very good quality".
- Sin cuantizaciones imatrix: el autor indica que no las ha generado, por lo que la calidad por bit es inferior a la de versiones ponderadas equivalentes.
- Multimodalidad no documentada: los proyectores están presentes, pero no se especifica qué tareas de visión funcionan ni con qué calidad; gemma4.dev describe E2B como text-only, lo que genera incertidumbre.
- Adopción muy baja: 156 descargas y 0 likes implican prácticamente nula validación por parte de la comunidad.
- Repositorio de 49,6 GB: descargar el conjunto completo es costoso; conviene bajar solo el archivo de cuantización necesario.
- Sin información sobre contexto máximo real, soporte de tool calling ni comportamiento en agentes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Gemma-4-E2B-SFT-Sinhala-Merged-GGUF
- Árbol de archivos: https://huggingface.co/mradermacher/Gemma-4-E2B-SFT-Sinhala-Merged-GGUF/tree/main
- Modelo base: https://huggingface.co/SynhalaAI/Gemma-4-E2B-SFT-Sinhala-Merged
- Página de descargas del cuantizador: https://hf.tst.eu/model#Gemma-4-E2B-SFT-Sinhala-Merged-GGUF
- Documentación de la familia Gemma: https://gemma.ai/models/
- Model card oficial de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
- Ficha de Gemma 4 E2B en gemma4.dev: https://gemma4.dev/models/gemma-4-e2b
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
