# Smnbrzq/Muse-Glimmer-30B

## Resumen

Muse Glimmer es un modelo de lenguaje causal de 30 000 millones de parámetros (29,6B) desarrollado por Meta Superintelligence Lab, diseñado específicamente para tareas agénticas autónomas en hardware de consumo. Se trata de un modelo denso con un encoder de percepción dedicado que acepta entradas de texto e imagen, y está optimizado para ejecutarse localmente sin necesidad de infraestructura en la nube. Su arquitectura combina atención local y global con una ventana deslizante, junto con un encoder visual ViT-G/14 de 1,8B parámetros, lo que le permite interpretar capturas de pantalla, gráficos y documentos junto con conversación.

El modelo destaca por su capacidad de razonamiento multi-paso, uso fiable de herramientas, recuperación de fallos y compatibilidad con scaffolds agénticos como OpenClaw o Hermes Agent. Con una licencia Apache 2.0 y un contexto de 131 072 tokens, Muse Glimmer está pensado para ejecutarse en una GPU de 24 GB mediante cuantización, ofreciendo velocidades de generación de hasta 233 tokens por segundo en una RTX 5090 gracias a la decodificación especulativa con DFlash. Su fecha de corte de conocimiento es enero de 2026, lo que lo sitúa como un modelo muy reciente en el ecosistema open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense Causal Transformer con Perception Encoder (ViT-G/14) |
| Parametros totales | 29 776 626 688 (29,6B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131 072+ tokens |
| Tipos de cuantizacion | K-Quant-Dynamic, K-Quant-17GB (formatos especificos del modelo) |
| Idiomas soportados | Mas de 100 lenguas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Muse Glimmer es un transformer causal denso con 52 capas, dimension oculta de 6656 y un patron de atencion repetitivo [Local, Local, Local, Global]. La atencion local usa una ventana deslizante de 2048 tokens, mientras que la atencion global cubre toda la secuencia. Emplea GQA con 32 cabezas de consulta y 2 de clave/valor (ratio 16:1), FFN tipo SwiGLU con dimension intermedia de 19 968, y RoPE con theta de 500 000 aplicado solo en las capas locales. El encoder de percepcion es un ViT-G/14 de aproximadamente 1,8B parametros, con 50 capas, ancho 1536 y patch de 14, que procesa hasta 4096 tokens visuales por imagen.

El entrenamiento se realizo con contenido multimodal de fuentes publicas, datos de terceros y productos de Meta, curado y enriquecido por redes de proveedores externos y personal de Meta. El conocimiento se corta el 4 de enero de 2026. Una innovacion destacable es la decodificacion especulativa mediante DFlash, un modelo drafter de difusion por bloques que propone bloques de 16 tokens en una sola pasada, verificados en paralelo por el modelo principal. Esto acelera la generacion entre 1,5x y 3,1x segun el hardware, sin degradar la calidad.

## Capacidades

- Agente de extremo a extremo: completa tareas completas en benchmarks como DeepSearch QA, MCP-Atlas, τ3-Bench y SWE-Bench, incluyendo escritura y depuracion de codigo.
- Uso fiable de herramientas: invoca funciones con esquemas precisos a lo largo de flujos de trabajo extendidos.
- Razonamiento multi-paso: encadena razonamiento sobre horizontes largos, manteniendo planes coherentes en tareas complejas.
- Recuperacion de fallos: cuando una llamada a herramienta falla o devuelve un resultado inesperado, diagnostica el error y reintenta en lugar de detenerse.
- Entrada multimodal: acepta texto e imagenes intercaladas, permitiendo interpretar capturas de pantalla, graficos y documentos.
- Compatibilidad con scaffolds: funciona con OpenClaw, Hermes Agent y otros patrones de orquestacion agéntica.
- Esfuerzo controlable: soporta diferentes niveles de razonamiento para equilibrar calidad y velocidad.
- Multilingue: entrenado con datos de mas de 100 lenguas.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 131K tokens de ventana, interpretando capturas de pantalla de errores o documentos adjuntos para resolver incidencias sin intervencion humana.
- Generacion de codigo en produccion: soporta tool calling y puede integrarse en pipelines de CI/CD para generar, revisar y depurar codigo, con recuperacion de fallos cuando una llamada a API falla.
- Analisis de documentos financieros: al aceptar imagenes y texto, puede extraer datos de graficos, tablas y facturas, y razonar sobre ellos para generar informes o alertas.
- Asistentes de escritorio locales: al ejecutarse en una GPU de 24 GB, puede servir como asistente personal siempre activo que lee la pantalla, entiende comandos de voz y ejecuta acciones en el sistema.
- Automatizacion de tareas web: con su capacidad de tool use y razonamiento multi-paso, puede navegar por sitios web, rellenar formularios y completar transacciones de principio a fin.
- Investigacion academica: su contexto largo y razonamiento multi-paso permiten analizar articulos cientificos extensos, extraer conclusiones y generar resumenes con citas, incluso con figuras y tablas.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card menciona que el modelo se evalua en DeepSearch QA, MCP-Atlas, τ3-Bench y SWE-Bench, pero no proporciona cifras concretas. Tampoco se ofrecen comparaciones con otros modelos en los materiales consultados. Se indica una degradacion media del 0,2% con cuantizacion K-Quant-Dynamic y del 1,0% con K-Quant-17GB, medida sobre 15 benchmarks comunes, pero sin detallar los valores absolutos.

## Requisitos de hardware

- VRAM estimada: 24 GB con cuantizacion K-Quant-17GB, 32 GB con K-Quant-Dynamic, 64 GB en precision completa.
- GPU recomendadas: Nvidia RTX 5090 (233,4 tok/s con DFlash), Apple M4 Max (37,8 tok/s), Apple M5 Max (50,2 tok/s). Tambien compatible con otras GPUs de 24 GB o mas.
- Cabe en GPU de consumo: si, con cuantizacion K-Quant-17GB en una RTX 5090 o similar de 24 GB.
- Opciones de despliegue: al ser un modelo transformers, es compatible con vLLM, TGI, llama.cpp y Ollama, aunque no se especifican oficialmente. La model card menciona compatibilidad con scaffolds agénticos.
- Latencia y throughput: en RTX 5090, 74,9 tok/s sin especulacion y 233,4 tok/s con DFlash; en M4 Max, 23,7 y 37,8 tok/s respectivamente; en M5 Max, 26,6 y 50,2 tok/s. Medidas con batch size 1 y greedy decoding.

## Comparativa con modelos similares

No se dispone de datos de comparacion directa con otros modelos en la informacion proporcionada. Por tamano, Muse Glimmer se situa en el rango de modelos densos de 30B como Qwen 2.5 32B o Mixtral 8x7B (aunque este ultimo es MoE), pero no se han publicado benchmarks comparativos que permitan una evaluacion objetiva. La licencia Apache 2.0 y su enfoque en tareas agénticas locales lo diferencian de alternativas con restricciones de uso comercial o requisitos de hardware superiores.

## Limitaciones y advertencias

- Sesgos: al entrenarse con datos publicos y de terceros, puede heredar sesgos sociales, culturales o de genero presentes en esos datos.
- Riesgo de alucinacion: como todo modelo generativo, puede producir informacion falsa o inventada, especialmente en tareas de razonamiento complejo o con entradas ambiguas.
- Limitaciones de contexto: aunque la ventana total es de 131K tokens, la atencion local se limita a 2048 tokens, lo que puede afectar a la coherencia en pasajes muy largos si no se usa correctamente la atencion global.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero el modelo puede incluir componentes de terceros con licencias diferentes; se recomienda revisar los creditos completos.
- Requisitos de hardware: para un rendimiento fluido en tareas agénticas se recomienda al menos 24 GB de VRAM; en hardware inferior la experiencia puede degradarse significativamente.
- Dependencia de cuantizacion: la calidad se degrada ligeramente con las cuantizaciones (0,2% y 1,0%), lo que puede ser relevante en aplicaciones criticas.

## Enlaces

- HuggingFace (autor original): https://huggingface.co/Smnbrzq/Muse-Glimmer-30B
- HuggingFace (Meta): https://huggingface.co/meta-models/Muse-Glimmer-30B
- Blog de Meta: https://research.meta.ai/blog/introducing-muse-glimmer-open-agentic-model
- Pagina de desarrollador de Meta: https://developer.meta.com/ai/models/muse-glimmer/
- NVIDIA NIM: https://build.nvidia.com/meta/muse-glimmer-30b/modelcard
- BenchLM: https://benchlm.ai/models/muse-glimmer-30b
- Paper del encoder de percepcion: https://arxiv.org/abs/2504.13181
- Paper de DFlash: https://arxiv.org/abs/2602.06036
