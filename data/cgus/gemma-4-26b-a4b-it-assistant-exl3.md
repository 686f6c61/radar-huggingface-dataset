# cgus/gemma-4-26B-A4B-it-assistant-exl3

## Resumen

`cgus/gemma-4-26B-A4B-it-assistant-exl3` es una cuantizacion EXL3 del modelo drafter de Multi-Token Prediction (MTP) `google/gemma-4-26B-A4B-it-assistant`, publicado por Google DeepMind como parte de la familia Gemma 4. No se trata de un modelo de chat autonomo, sino de un modelo borrador (draft model) disenado para integrarse en un pipeline de decodificacion especulativa: predice varios tokens por delante que el modelo objetivo verifica en paralelo, acelerando la decodificacion hasta 3x sin alterar la calidad de la generacion. Este repositorio concreto ofrece los pesos en formato ExLlamaV3 (EXL3) en tres niveles de cuantizacion (4, 6 y 8 bits por peso), pensados para su uso con TabbyAPI como draft model.

El modelo base pertenece a la familia Gemma 4, que combina arquitecturas densas y Mixture-of-Experts, soporte multimodal (texto e imagen, con audio en las variantes E2B, E4B y 12B), ventanas de contexto de hasta 256K tokens y soporte de mas de 140 idiomas. La variante 26B A4B es la unica MoE de la familia, con 26B parametros totales y aproximadamente 4B activos por token, lo que la situa en el rango de estaciones de trabajo y GPUs de consumo alto.

La relevancia de esta ficha radica en que el repositorio es una cuantizacion de terceros con soporte experimental: el autor documenta problemas de fuga de VRAM y OOM con ExLlamaV3 1.6.6, por lo que debe tratarse como material de evaluacion mas que como artefacto listo para produccion. El numero de parametros reportado en los safetensors (138.929.668) no coincide con los 26B del modelo base, lo que sugiere que los pesos publicados corresponden unicamente al modulo borrador y no al modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (modelo base Gemma 4 26B A4B); este repo contiene el drafter MTP en formato EXL3 |
| Parametros totales | 138.929.668 (segun safetensors del repo); el modelo base declara 26B totales |
| Parametros activos | Aproximadamente 4B en el modelo base (variante A4B); no disponible para el drafter |
| Longitud de contexto | 256K tokens en el modelo base (modelos medios); no disponible para el drafter |
| Tipos de cuantizacion | EXL3 4 bpw h6 (rama main), 6 bpw h6, 8 bpw h8 |
| Idiomas soportados | Mas de 140 en el modelo base; no disponible para el drafter |
| Licencia | Apache 2.0 (con enlace a la licencia especifica de Gemma 4) |
| Formato de pesos | safetensors en formato EXL3 (ExLlamaV3), libreria `exllamav3` |

## Arquitectura y entrenamiento

El modelo base Gemma 4 emplea una atencion hibrida que intercala atencion local de ventana deslizante con atencion global completa, garantizando que la capa final sea siempre global. Para optimizar memoria en contextos largos, las capas globales unifican claves y valores y aplican Proportional RoPE (p-RoPE). La variante 26B A4B es la unica Mixture-of-Experts de la familia, con 26B parametros totales y unos 4B activos por token, lo que reduce el coste computacional por token frente a un denso equivalente.

El checkpoint `it-assistant` es un drafter de Multi-Token Prediction: un modelo mas pequeno y rapido que extiende el modelo base y que, en decodificacion especulativa, predice varios tokens por delante para que el modelo objetivo los verifique en paralelo. Google declara que este esquema mantiene exactamente la misma calidad que la generacion estandar y acelera la decodificacion hasta 3x, orientandolo a aplicaciones de baja latencia y ejecucion en dispositivo. No se dispone de datos sobre volumen de tokens de entrenamiento, composicion del dataset ni uso de RLHF/DPO para el drafter en la informacion proporcionada.

La cuantizacion EXL3 fue generada con ExLlamaV3 1.6.6, version que el autor describe como de soporte experimental temprano para este tipo de checkpoints.

## Capacidades

- Decodificacion especulativa como draft model: predice multiples tokens que el modelo objetivo Gemma 4 26B A4B verifica en paralelo, con hasta 3x de aceleracion segun Google.
- Generacion de texto y razonamiento heredados del modelo objetivo (el drafter no genera de forma autonoma en produccion).
- Capacidades multimodales del modelo base: entrada de texto e imagen con relacion de aspecto y resolucion variables; audio nativo en E2B, E4B y 12B (no en 26B A4B).
- Soporte nativo de function calling y flujos agenticos en el modelo base Gemma 4.
- Modos de pensamiento (thinking) configurables en todos los modelos de la familia.
- Soporte nativo del rol `system` para conversaciones estructuradas.
- Multilingue en mas de 140 idiomas (modelo base).
- Integracion con TabbyAPI mediante la seccion `draft_model` de la configuracion.

## Casos de uso

- Aceleracion de inferencia en produccion: desplegar el drafter junto al modelo objetivo Gemma 4 26B A4B en TabbyAPI para reducir la latencia por token en hasta 3x en tareas de generacion de texto, manteniendo la calidad intacta.
- Servicio de chat de baja latencia: usar decodificacion especulativa para mejorar el tiempo hasta el primer token percibido en interfaces conversacionales con turnos multiples y contexto largo (hasta 256K tokens en el modelo base).
- Asistentes de codigo en IDE: el modelo base destaca en tareas de codigo y soporta function calling; el drafter acelera la generacion de autocompletados y parches en editores y pipelines de CI/CD.
- Agentes autonomos multi-paso: combinado con el modelo objetivo, permite cadenas de razonamiento y llamadas a herramientas con menor latencia, adecuado para orquestadores de agentes.
- Procesamiento de documentos con imagenes: al heredar la multimodalidad del modelo base, sirve para pipelines de extraccion y resumen de documentos escaneados donde la velocidad de decodificacion es critica.
- Evaluacion de infraestructura de decodificacion especulativa: util como banco de pruebas para medir el impacto de EXL3 en VRAM y throughput antes de adoptar la tecnica en un stack mayor.
- Despliegue en estaciones de trabajo con GPU de consumo: las cuantizaciones de 4 y 6 bpw reducen el espacio de pesos del drafter (repo de 1.0 GB) para entornos con VRAM limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Google afirma una aceleracion de decodificacion de hasta 3x con calidad identica a la generacion estandar, pero no se proporcionan numeros de MMLU, HumanEval, GSM8K ni de throughput medido para este repositorio.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 1.0 GB, por lo que el drafter en 4 bpw cabe holgadamente en cualquier GPU con 8 GB o mas; la VRAM total dependera del modelo objetivo Gemma 4 26B A4B cargado en paralelo.
- GPU recomendadas: para el modelo objetivo, A100 o H100 en servidor; RTX 4090 o GPUs de 24 GB o mas para la variante MoE cuantizada en entornos de estacion de trabajo.
- GPU de consumo: el drafter en 4 bpw cabe en GPUs consumer de gama media; el modelo objetivo completo requiere 24 GB o mas segun cuantizacion.
- Opciones de despliegue: TabbyAPI con ExLlamaV3 (soporte oficial de este formato); vLLM, llama.cpp, Ollama y TGI no soportan EXL3 de forma nativa para este checkpoint.
- Latencia y throughput: no disponibles de forma medida; el autor reporta problemas de VRAM creciente y OOM con ExLlamaV3 1.6.6 tras varias peticiones, lo que impide una evaluacion fiable del rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cgus/gemma-4-26B-A4B-it-assistant-exl3 (este repo) | 138,9M en safetensors (drafter) | 256K en el modelo base | EXL3 safetensors | Apache 2.0 | Hugging Face, 0 descargas |
| google/gemma-4-26B-A4B-it-assistant | No disponible | 256K | safetensors originales | Apache 2.0 | Hugging Face oficial |
| ArchiveStudio/gemma-4-26B-A4B-it-assistant | No disponible | 256K | No disponible | Apache 2.0 | Hugging Face (espejo) |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Soporte experimental: el autor indica que ExLlamaV3 1.6.6 tiene soporte temprano para estos checkpoints y reporta fugas de VRAM que terminan en OOM tras varias peticiones, sin pruebas completas posibles.
- No es un modelo autonomo: es un drafter MTP que debe combinarse con el modelo objetivo; usarlo solo produce predicciones sin verificacion.
- Discrepancia de parametros: los safetensors declaran 138,9M de parametros frente a los 26B del modelo base, lo que indica que el repo contiene solo el modulo borrador; no debe confundirse con una cuantizacion completa del modelo 26B A4B.
- Compatibilidad: requiere TabbyAPI actualizado; versiones antiguas lanzan error al cargar los pesos.
- Licencia: Apache 2.0 con enlace a la licencia especifica de Gemma 4; conviene revisar los terminos de uso comercial de Gemma antes de desplegar en produccion.
- Idiomas: no se documentan idiomas especificos para el drafter; los mas de 140 idiomas corresponden al modelo base.
- Riesgo de alucinacion: inherente al modelo objetivo Gemma 4; la decodificacion especulativa no lo elimina, solo acelera la generacion.
- Sesgos: no se documentan sesgos especificos en la informacion disponible; aplican los del modelo base.
- Repositorio sin adopcion: 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cgus/gemma-4-26B-A4B-it-assistant-exl3
- Modelo base oficial: https://huggingface.co/google/gemma-4-26B-A4B-it-assistant
- Espejo alternativo: https://huggingface.co/ArchiveStudio/gemma-4-26B-A4B-it-assistant
- Coleccion Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Documentacion de MTP: https://ai.google.dev/gemma/docs/mtp/mtp
- Informe tecnico (arXiv): https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de modelos Gemma de DeepMind: https://deepmind.google/models/gemma/
