# groxaxo/Qwen3.8-27B-GPTQ-Pro-4bit-g64-calib128

## Resumen

Qwen3.8-27B-GPTQ-Pro-4bit-g64-calib128 es una cuantizacion INT4 GPTQ-Pro del modelo oficial Qwen/Qwen3.8-27B, desarrollada por groxaxo. El modelo base, publicado por Alibaba, es un LLM denso multimodal de 27 000 millones de parametros con arquitectura hibrida de atencion (16 capas full attention + 48 capas linear attention) y una ventana de contexto de 262 144 tokens. Esta cuantizacion preserva el cabezal MTP (multi-token prediction) sin cuantizar, lo que permite decodificacion especulativa en vLLM con velocidades de 78-87 tokens por segundo en configuraciones de doble GPU.

La relevancia de esta ficha radica en que proporciona una version del modelo que cabe en GPUs de consumo (2× RTX 3090) manteniendo la arquitectura completa, incluida la parte multimodal y el MTP. La cuantizacion usa GPTQ-Pro con group size 64 y calibracion de 128 muestras, con perdida media por modulo de 8,2e-5, lo que indica una degradacion minima respecto al modelo original. La licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 hibrida (16 capas full attention + 48 capas linear attention GDN) |
| Parametros totales | 27 781 427 952 (27,8 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (modelo base) |
| Tipos de cuantizacion | GPTQ-Pro INT4, simetrico, group size 64, desc_act=False |
| Idiomas soportados | no disponible en la model card; el modelo base Qwen3.8-27B es multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (GPTQ-Pro INT4) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura hibrida de atencion: de las 64 capas totales, 16 utilizan atencion completa (con intervalo de capa completa de 4) y las otras 48 utilizan atencion lineal con un estado recurrente constante. Esta combinacion reduce el coste computacional del atencion para contextos largos manteniendo la calidad en tareas que requieren atencion global. El modelo es multimodal nativo (image-text-to-text) e incluye un encoder de vision.

La cuantizacion GPTQ-Pro se realizo con GPTQModel 6.1.0-dev, en modo simetrico, group size 64 y 128 muestras de calibracion en modo texto. Se cubrieron los 400 modulos lineales de las 64 capas (48 de atencion lineal + 16 de atencion completa). El cabezal MTP (multi-token prediction) se preservo sin cuantizar, permitiendo decodificacion especulativa con vLLM. La perdida media por modulo es de 8,2e-5 y la maxima de 5,0e-4, segun el archivo `quant_log.csv` incluido en el repositorio.

## Capacidades

- Generacion de texto conversacional y de larga forma con contexto de hasta 262144 tokens.
- Razonamiento y resolucion de problemas en matematicas, logica y ciencias.
- Generacion de codigo en multiples lenguajes de programacion, con soporte para agentes y flujos de trabajo automatizados.
- Comprension de imagenes (multimodal nativo) y generacion de respuestas que combinan texto e imagen.
- Decodificacion especulativa mediante el cabezal MTP preservado, que acelera la inferencia entre un 10 y un 20 % segun la temperatura.
- Compatible con vLLM para despliegue en produccion con tensor parallelism.

## Casos de uso

- Asistentes de codigo en entornos de desarrollo: el modelo puede integrarse en IDEs o pipelines de CI/CD para generar, revisar y corregir codigo, aprovechando su capacidad de razonamiento y su contexto de 262k tokens para manejar repositorios completos.
- Automatizacion de ofimatica y documentos: su capacidad multimodal permite extraer informacion de imagenes (capturas, diagramas) y generar informes, resumenes o correos con formato estructurado.
- Agentes de razonamiento multi-paso: gracias a la arquitectura hbrida y el soporte de decodificacion especulativa, puede ejecutar flujos de agente con llamadas a herramientas (tool calling) de forma eficiente en hardware local.
- Analisis de documentos largos: con 262k de contexto, puede procesar libros, contratos o codigos fuente extensos en una sola pasada, sin necesidad de chunking.
- Prototipado de aplicaciones de IA generativa: su licencia Apache 2.0 y su compatibilidad con vLLM permiten construir demos y productos comerciales sin costes de licencia.
- Investigacion en eficiencia de inferencia: la cuantizacion INT4 con MTP preservado es un caso de estudio para medir el impacto de la cuantizacion en la decodificacion especulativa y en arquitecturas de atencion hibrida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye metricas de evaluacion estandar como MMLU, HumanEval o GSM8K, ni comparaciones con el modelo original cuantizado. Los unicos datos de rendimiento disponibles son mediciones de velocidad de inferencia: 78-87 tokens por segundo en configuracion de 2× RTX 3090 con tensor parallelism y MTP draft-3, frente a ~71 tokens/s sin MTP, con una tasa de aceptacion de draft del 59-77 % segun la temperatura.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint INT4 de 27,8 B parametros ocupa aproximadamente 14-15 GB en VRAM (sin contar el cabezal MTP). El repositorio completo pesa 20,1 GB.
- GPU recomendadas: 2× RTX 3090 (24 GB) o superiores con tensor parallelism. En una sola RTX 3090 no es posible cargar el modelo INT4 junto con el drafter MTP.
- Compatibilidad con GPU de consumo: si, en configuracion multi-GPU (TP≥2). No es viable en una sola GPU de 24 GB con MTP activo; sin MTP podria intentarse con cuantizaciones mas agresivas, pero no esta verificado en la documentacion.
- Opciones de despliegue: vLLM (recomendado, con `--speculative-config` para MTP), llama.cpp (soporta GPTQ pero no MTP), TGI, o cualquier servidor compatible con Transformers.
- Latencia y throughput: en 2× RTX 3090 TP=2 con MTP draft-3, se obtienen 78-87 tokens/s en generacion de 256 tokens a temperatura 0,7.
- Aviso importante: en GPUs RTX 3090 sin NVLink y con tensor parallelism, es necesario desactivar el custom all-reduce de vLLM con `--disable-custom-all-reduce` para evitar salida corrupta.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar esta cuantizacion con otras versiones del mismo modelo ni con alternativas equivalentes. Como referencia de arquitectura, el modelo base Qwen3.8-27B se puede comparar con otros densos de 27-30 B como Llama 3.1 8B o Mistral 7B, pero no hay datos de rendimiento publicados para la cuantizacion GPTQ-Pro. La licencia Apache 2.0 y el contexto de 262k tokens son ventajas frente a modelos con licencia no comercial o contexto mas corto.

## Limitaciones y advertencias

- La cuantizacion INT4 con group size 64 introduce una degradacion de calidad, aunque la perdida media por modulo (8,2e-5) es baja; para tareas de alta precision (por ejemplo, calculo cientifico) se recomienda el modelo original en BF16.
- El cabezal MTP no es compatible con `min_p` ni `logit_bias` en vLLM con decodificacion especulativa; es una limitacion de la libreria, no del modelo.
- En hardware RTX 3090 con tensor parallelism sobre PCIe sin NVLink, vLLM puede producir salida corrupta a menos que se use `--disable-custom-all-reduce`; este problema afecta a cualquier modelo servido en esa configuracion, no solo a esta cuantizacion.
- El modelo base es multimodal, pero esta cuantizacion declara pipeline `text-generation`; la compatibilidad de la parte visual con la cuantizacion no esta documentada.
- Los idiomas soportados no estan especificados en la model card; el modelo base de Qwen soporta multiples idiomas, pero no se ha verificado para esta cuantizacion.
- Riesgo de alucinacion inherente a los LLM; se recomienda validar salidas en aplicaciones de produccion.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/groxaxo/Qwen3.8-27B-GPTQ-Pro-4bit-g64-calib128
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante abliterada: https://huggingface.co/groxaxo/Huihui-Qwen3.8-27B-abliterated-GPTQ-Pro-4bit-g64-calib128
- Repositorio GPTQ-Pro: https://github.com/groxaxo/GPTQ-Pro
- Repositorio oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guia de specs y hardware: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Receta vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
