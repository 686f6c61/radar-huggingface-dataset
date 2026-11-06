# diffbot/Beam-VL-1.0-501B-A23B-NVFP4

## Resumen

Beam-VL-1.0-501B-A23B-NVFP4 es un modelo vision-language multimodal desarrollado por Diffbot, obtenido mediante fine-tuning del modelo de texto Reflection Beam-1.0-501B-A23B. Se trata de un transformer con arquitectura de mezcla de expertos (MoE) de 501B parámetros totales y 23B parámetros activos, al que se le añade un codificador visual de 412M parámetros para dotarlo de comprensión de imágenes.

El modelo resuelve el problema de razonar sobre documentos, gráficos, capturas de pantalla, interfaces de usuario y fotografías dentro de un mismo prompt, manteniendo las capacidades de texto y de uso de herramientas del modelo base. Admite hasta 8 imágenes por prompt, incluye imágenes en resultados de herramientas y ofrece un contexto de 131K tokens.

Esta variante concreta está cuantizada en NVFP4 (8 bits) mediante NVIDIA ModelOpt y está pensada para servirse con vLLM sobre GPUs Blackwell (B200/B300). Su relevancia actual radica en que demuestra que un MoE de 501B con visión puede desplegarse en 4 GPUs con un rendimiento de 715 tok/s en un solo stream y 0,35 s de time to first token.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (256 expertos enrutados, top-8) + codificador visual de 412M parametros |
| Parametros totales | 501B (254.642.537.152 segun safetensors del repo) |
| Parametros activos | 23B |
| Longitud de contexto | 131K tokens |
| Tipos de cuantizacion | NVFP4 (8 bits, ModelOpt); se anuncia una version EXL3 para 2x RTX PRO 6000 Blackwell |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 350,8 GB), libreria vllm |

## Arquitectura y entrenamiento

El modelo parte de Beam-1.0-501B-A23B, un MoE de Reflection con 501B parametros totales y 23B activos, al que se incorpora un codificador visual de 412M parametros para la comprension de imagenes. La variante v2 (27-10-2026) es un reentrenamiento limpio de la etapa de instruccion desde el checkpoint de alineamiento, con una mezcla de datos nueva y un drafter especulativo ajustado (DFlash2) incluido en el repositorio.

El entrenamiento combina el alineamiento del modelo base con una fase de instruccion multimodal. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO. La innovacion tecnica destacable es la decodificacion especulativa con un drafter ajustado: su longitud media de aceptacion es de 3,96 en prompts con imagen y 5,65 en prompts de texto (frente a 3,77 y 5,50 del DFlash2 estandar de Reflection). Al ser especulativa sin perdida, el drafter afecta a la velocidad y no a las salidas.

## Capacidades

- Generacion de texto y razonamiento con control de esfuerzo (`minimal`, `low`, `medium`, `high` o eleccion del propio modelo).
- Comprension de imagenes: documentos, graficos, capturas de pantalla, interfaces de usuario y fotografias.
- Razonamiento sobre varias imagenes por prompt (hasta 8) e imagenes dentro de resultados de herramientas.
- Generacion de codigo, SVG y HTML a partir de lo que observa en una imagen.
- Conserva las capacidades de texto y de uso de herramientas (tool calling) del modelo base Beam.
- Capacidades multilingues limitadas al ingles segun la model card.
- Modo de razonamiento con la traza devuelta en `message.reasoning`.

## Casos de uso

- Digitalizacion de formularios manuscritos: el modelo lee campos estructurados de formularios escaneados y devuelve JSON con los datos extraidos, como demuestra el ejemplo de intake de pacientes de la galeria.
- Analisis de paneles de gestion (kanban): interpreta el estado de un tablero a partir de una captura y calcula tareas vencidas respecto a la fecha mostrada, devolviendo JSON estructurado.
- Lectura de graficos y series temporales: responde preguntas sobre tendencias y cruces de series en graficos de lineas, util para informes financieros o dashboards.
- Procesamiento de documentos con OCR: con 92,1 de ANLS en DocVQA y 74,0 en OCRBench, es adecuado para pipelines de extraccion de texto e informacion de facturas, recibos y documentos escaneados.
- Generacion de interfaces a partir de disenos: convierte capturas de UI o bocetos en HTML, SVG o codigo, apoyandose en su HumanEval de 95,7 pass@1.
- Asistentes con herramientas y vision: al aceptar imagenes en resultados de herramientas y mantener el tool calling del modelo base, sirve para agentes que consultan APIs y razonan sobre las imagenes devueltas.
- Reconocimiento de marca: con 0,94 de accuracy en imagenes reservadas de logos y mascota de Diffbot, puede emplearse en tareas de identificacion de marca en contenido visual.

## Benchmarks y rendimiento

Resultados servidos con vLLM segun la receta del repositorio (expertos NVFP4, tensor parallel 4, decodificacion especulativa activa), esfuerzo de razonamiento por defecto y max_tokens 4.096 (16.384 en HumanEval).

| Benchmark | Metrica | Beam-VL v2 |
|---|---|---|
| MMMU (val) | accuracy | 68,7 |
| MMStar | accuracy | 50,7 |
| ChartQA (test) | relaxed accuracy | 78,0 |
| DocVQA (val) | ANLS | 92,1 |
| OCRBench | accuracy | 74,0 |
| GSM8K | accuracy | 96,0 |
| HumanEval | pass@1 | 95,7 |
| Reconocimiento de marca (held-out) | accuracy | 0,94 |

Los benchmarks de vision son subconjuntos fijos: MMMU 150 y MMStar 150 preguntas (razonamiento activo), ChartQA, DocVQA y OCRBench 100 cada uno (razonamiento desactivado). Los intervalos de confianza al 95% son de aproximadamente ±5 a ±9 puntos. Una repeticion de DocVQA sobre los mismos 100 documentos dio 92,3. GSM8K se evaluo sobre 200 problemas.

Rendimiento en 4x B200 con NVFP4 y DFlash2 ajustado:

| Configuracion | Decodificacion, 1 stream | Decodificacion, 4 streams | Decodificacion de texto (prompt 2K) | TTFT, 1 imagen |
|---|---|---|---|---|
| 4x B200, NVFP4 | 715 tok/s | 1.963 tok/s | 562 tok/s | 0,35 s |

## Requisitos de hardware

- VRAM: aproximadamente 162 GB por GPU con 4x B200 (180 GB) o B300 a 0,88 de utilizacion; los pesos ocupan unos 71 GB por GPU en NVFP4 con TP4.
- GPU recomendadas: 4x B200 o B300 con soporte de NVFP4. Se anuncia una version EXL3 para 2x RTX PRO 6000 Blackwell.
- No cabe en GPUs de consumo convencionales; el despliegue requiere hardware Blackwell de centro de datos.
- Espacio en disco: aproximadamente 325 GB.
- Despliegue: vLLM con la imagen fijada `vllm/vllm-openai:nightly-83c078d955cd6e0c63d3b12abe669c8de936a370`, el plugin Beam-VL y el parche de parser incluidos en el repositorio, mediante el script `recipe/serve/serve-nvfp4-tp4.sh`.
- Latencia y throughput: 0,35 s de TTFT para un prompt nuevo con una imagen, 715 tok/s en un stream y 1.963 tok/s con 4 streams.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Despliegue |
|---|---|---|---|---|---|
| Beam-VL-1.0-501B-A23B-NVFP4 | 501B totales / 23B activos | 131K | Si (412M encoder, hasta 8 imagenes) | Apache 2.0 | 4x B200/B300, NVFP4, vLLM |
| reflection/Beam-1.0-501B-A23B | 501B totales / 23B activos | no disponible | No (modelo de texto) | no disponible en la informacion | no disponible en la informacion |
| reflection/Beam-1.0-501B-A23B-DFlash2 | 501B totales / 23B activos | no disponible | No (drafter de texto) | no disponible en la informacion | no disponible en la informacion |

No se dispone en la informacion proporcionada de datos de benchmarks de los modelos comparables ni de otras alternativas multimodales de tamano similar, por lo que la comparacion cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- Solo soporta ingles segun la model card; el rendimiento en otros idiomas no esta documentado.
- Riesgo de alucinacion en tareas de OCR y lectura de documentos: en el ejemplo de formulario manuscrito, los cuatro intentos leyeron de forma identica un digito ambiguo (NHP-9471-0920 frente a NHP-4471-0920), lo que indica errores sistematicos en caracteres poco claros.
- Los benchmarks se calculan sobre subconjuntos pequenos (100-200 preguntas), con intervalos de confianza de ±5 a ±9 puntos; los resultados deben interpretarse con cautela.
- En la galeria, cuatro prompts no se muestran porque ninguno de los cuatro intentos fue plenamente correcto (punto de clic en un boton de descarga, conteo de pelicanos, suma de precios de etiquetas japonesas y recreacion de un grafico como SVG), y un quinto se descarto por dibujo defectuoso.
- El despliegue requiere hardware Blackwell de centro de datos (4x B200/B300) y una imagen nightly concreta de vLLM, lo que limita la portabilidad.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Reflection y del codificador visual.
- El rendimiento publicado depende de la decodificacion especulativa y de la configuracion TP4; otras configuraciones pueden dar cifras distintas.

## Enlaces

- Hugging Face: https://huggingface.co/diffbot/Beam-VL-1.0-501B-A23B-NVFP4
- Modelo base: https://huggingface.co/reflection/Beam-1.0-501B-A23B
- Drafter estandar de Reflection: https://huggingface.co/reflection/Beam-1.0-501B-A23B-DFlash2
- Revision v1: `hf download diffbot/Beam-VL-1.0-501B-A23B-NVFP4 --revision v1.0`
- Imagen de vLLM: `vllm/vllm-openai:nightly-83c078d955cd6e0c63d3b12abe669c8de936a370`
