# AEON-7/Qwen3.6-35B-A3B-heretic-NVFP4

## Resumen

Qwen3.6-35B-A3B-heretic-NVFP4 es una cuantizacion en formato NVFP4 (4 bits nativo de GPU Blackwell) del modelo tvall43/Qwen3.6-35B-A3B-heretic, una variante "abliterated" (sin rechazos) de la familia Qwen3.5/3.6. Lo publica el usuario AEON-7 y esta optimizado especificamente para su despliegue en hardware Grace-Blackwell, en concreto DGX Spark (GB10, sm_121a) con vLLM compilado desde fuente. El modelo combina una arquitectura MoE dispersa (35B parametros totales, 3B activos) con atencion hibrida: 30 capas de atencion lineal tipo Mamba/GDN (gated delta net) preservadas en BF16 y el resto con atencion estandar, ademas de una torre de vision de 27 bloques.

El modelo resuelve el problema de ejecutar un LLM multimodal de 35B con contexto de hasta 1M tokens en un dispositivo de un solo nodo con memoria unificada limitada, gracias a la cuantizacion NVFP4 por experto y a la decodificacion especulativa (DFlash) con 11 tokens especulativos. La variante "heretic" elimina los comportamientos de rechazo del modelo base, lo que la hace adecuada para aplicaciones donde se requiere contenido sin filtros, pero tambien eleva el riesgo de generar material problematico.

Es relevante ahora porque demuestra un stack de produccion completo (imagen de contenedor validada, drafter especulativo, benchmark de concurrencia) para servir un MoE multimodal de gran contexto en hardware de borde Blackwell, algo poco comun en el ecosistema open source. La revision de 2026-06-18 corrige un defecto de anidamiento de los tensores de vision que impedia el funcionamiento de las entradas de imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido (atencion lineal GDN/Mamba + atencion estandar), multimodal vision-language (`Qwen3_5MoeForConditionalGeneration`) |
| Parametros totales | 35.107.181.936 |
| Parametros activos | 3B (segun tags del autor, "3b-active") |
| Longitud de contexto | 1M tokens (segun tag "1m-context") |
| Tipos de cuantizacion | NVFP4 (4 bits) en pesos de expertos; BF16 en 30 capas de atencion lineal y torre de vision; KV cache FP8 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del checkpoint tvall43/Qwen3.6-35B-A3B-heretic, que a su vez deriva de la familia Qwen3.5/3.6. La arquitectura es un MoE disperso con 40 capas y 256 expertos por capa, del que solo se activan aproximadamente 3B parametros por token. Incorpora atencion hibrida: 30 capas usan atencion lineal tipo gated delta net (GDN, emparentada con Mamba), mientras que el resto emplea atencion estandar. La torre de vision consta de 27 bloques ViT preservados en BF16.

La cuantizacion se realizo con llmcompressor y compressed-tensors, generando 122.880 claves NVFP4 por experto (40 capas x 256 expertos x 3 proyecciones x 4 componentes de cuantizacion). La revision v2 (2026-04-19) re-cuantizo el modelo base con `AutoModelForImageTextToText` para restaurar el layout canonico multimodal, y la revision de 2026-06-18 corrigio un defecto de anidamiento que dejaba los 333 tensores de vision en `model.language_model.visual.*` en lugar de `model.visual.*`, provocando que vLLM los saltara silenciosamente. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" explicito.
- Generacion de codigo e instrucciones tecnicas (tag "coding").
- Comprension de imagenes (image-text-to-text) mediante torre ViT de 27 bloques, funcional tras la correccion de 2026-06-18.
- Tool calling y function calling.
- Flujos agenticos y razonamiento multi-paso.
- Contexto largo de hasta 1M tokens.
- Soporte multilingue limitado al ingles.
- Compatibilidad con API OpenAI (endpoints compatibles).
- Optimizaciones de inferencia: chunked prefill, prefix caching, decodificacion especulativa (DFlash con 11 tokens especulativos).
- Variante "abliterated": ausencia de rechazos y respuestas sin filtros de seguridad.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno con historial extenso gracias a su ventana de 1M tokens, adecuado para bases de conocimiento de producto embebidas en el contexto.
- Generacion de codigo en produccion: soporta tool calling y puede integrarse en pipelines de CI/CD para revision de codigo, generacion de tests y documentacion tecnica, con la ventaja de ejecutarse en un unico nodo DGX Spark.
- Analisis de documentos e imagenes: al ser multimodal, permite extraer informacion de capturas, diagramas y documentos escaneados combinando vision y contexto largo.
- Agentes autonomos multi-paso: su soporte de function calling y razonamiento agentico lo hace apto para orquestacion de tareas con multiples herramientas, con throughput validado hasta c=64 concurrentes.
- Procesamiento de repositorios completos: el contexto de 1M tokens permite analizar codebases enteras para tareas de refactorizacion, auditoria o generacion de documentacion.
- Investigacion sin restricciones de rechazo: la variante "heretic" resulta util en estudios de seguridad, red teaming y analisis de sesgos donde se necesita que el modelo no decline peticiones.
- Despliegue en borde con hardware Blackwell: su cuantizacion NVFP4 y el stack vLLM validado permiten servir un MoE de 35B en un DGX Spark con memoria unificada, sin necesidad de clúster multi-GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos de rendimiento proporcionados son de throughput en produccion: hasta aproximadamente 740 tok/s agregados con concurrencia c=64 en DGX Spark usando DFlash con `num_speculative_tokens: 11`. En la validacion de vision, una prueba de formas y colores obtuvo 7/7 y una escena mas compleja 5/7.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio pesa 65,4 GB; en NVFP4 los pesos ocupan aproximadamente esa cifra. El KV cache en FP8 para contexto de 1M tokens requiere memoria adicional significativa.
- GPU recomendadas: DGX Spark (GB10, sm_121a), Grace-Blackwell. La cuantizacion NVFP4 es nativa de arquitectura Blackwell.
- Cabe en consumer GPU: no se ha validado en GPUs de consumo; el formato NVFP4 y el stack estan orientados a Blackwell. No hay datos para RTX 4090 u otras.
- Opciones de despliegue: vLLM 0.23.0 compilado desde fuente para sm_121a, mediante la imagen `ghcr.io/aeon-7/aeon-vllm-ultimate:latest` (o rollback `:2026-06-11-pr41703`). Compatible con API OpenAI. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: hasta ~740 tok/s agregados a c=64 con decodificacion especulativa DFlash (drafter `z-lab/Qwen3.6-35B-A3B-DFlash`, revision posterior a 2026-04-19). Estabilidad validada bajo carga sostenida de chat y flotas de agentes hasta c=64.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| AEON-7/Qwen3.6-35B-A3B-heretic-NVFP4 | 35B (3B activos) | 1M | Texto + vision | Apache 2.0 | Cuantizado NVFP4, optimizado para DGX Spark |
| tvall43/Qwen3.6-35B-A3B-heretic | 35B (3B activos) | no disponible | Texto + vision | no disponible | Modelo base sin cuantizar del que deriva |
| z-lab/Qwen3.6-35B-A3B-DFlash | no disponible | no disponible | no disponible | no disponible | Drafter especulativo, no es un modelo de chat completo |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- La variante "heretic/abliterated" elimina los rechazos de seguridad: puede generar contenido ofensivo, ilegal o danino sin filtros. No apta para aplicaciones orientadas al publico sin capas de moderacion externas.
- Riesgo de alucinacion inherente a los LLM; no se han publicado evaluaciones de fidelidad factual.
- Soporte unicamente en ingles; el rendimiento en castellano u otros idiomas no esta validado.
- El contexto de 1M tokens requiere memoria de KV cache considerable incluso en FP8; puede no ser viable en configuraciones de memoria reducida.
- Dependencia fuerte de un stack especifico: vLLM 0.23.0 compilado para sm_121a y la imagen de AEON-7. No hay garantia de funcionamiento en otras GPUs o versiones de vLLM.
- La cuantizacion NVFP4 puede degradar la calidad respecto al modelo base en BF16; no se han publicado comparativas de calidad.
- El defecto de vision solo se corrigio el 2026-06-18; versiones anteriores del repositorio producen salida basura (`!!!!`) con imagenes. Es necesario re-descargar si se clono antes de esa fecha.
- Licencia Apache 2.0 permite uso comercial, pero la naturaleza "uncensored" del modelo puede implicar responsabilidades legales segun la jurisdiccion y el caso de uso.
- El modelo base tvall43 no tiene informacion publica sobre su proceso de entrenamiento ni evaluaciones de sesgo.

## Enlaces

- Hugging Face: https://huggingface.co/AEON-7/Qwen3.6-35B-A3B-heretic-NVFP4
- Modelo base: https://huggingface.co/tvall43/Qwen3.6-35B-A3B-heretic
- Drafter especulativo: https://huggingface.co/z-lab/Qwen3.6-35B-A3B-DFlash
- Guia de despliegue en produccion: https://github.com/AEON-7/Qwen3.6-35B-A3B-heretic-NVFP4-DFlash
- Imagen vLLM para DGX Spark: https://github.com/AEON-7/vllm-ultimate-dgx-spark
