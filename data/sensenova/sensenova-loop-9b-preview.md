# sensenova/SenseNova-Loop-9B-Preview

## Resumen

SenseNova-Loop-9B-Preview es un modelo de lenguaje multimodal desarrollado por SenseNova (OpenSenseNova) que acepta texto e imagenes como entrada y genera texto. Su propuesta diferencial es arquitectonica: combina un decoder con un bloque de capas "en bucle" (looped transformer) y conexiones residuales de doble flujo denominadas manifold-constrained hyper-connections (mHC). El modelo esta disenado especificamente para flujos de trabajo de contexto largo y agenticos, donde se combinan comprension de documentos, generacion de codigo e interaccion con herramientas externas.

El modelo cuenta con aproximadamente 9.660 millones de parametros totales almacenados (backbone en BF16 mas parametros de enrutamiento mHC en FP32), aunque durante la inferencia ejecuta el equivalente a unos 14.600 millones de parametros debido al bloque compartido que se aplica dos veces. La longitud de contexto de entrenamiento documentada alcanza los 262.144 tokens, lo que lo situa en la categoria de modelos de contexto muy largo.

Se distribuye bajo licencia Apache 2.0, lo que facilita su adopcion comercial, y soporta ingles y chino. Su publicacion (octubre de 2026) lo convierte en una alternativa relevante para evaluar arquitecturas no convencionales que buscan aumentar la profundidad computacional sin incrementar proporcionalmente el numero de parametros almacenados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder autorregresivo multimodal; bloque en bucle con mHC de doble flujo; atencion hibrida (lineal y completa) |
| Parametros totales | 9.656.250.480 (~9B almacenados) |
| Parametros activos | No es MoE; ~14,6B parametros de inferencia por las dos pasadas del bloque en bucle |
| Longitud de contexto | Hasta 262.144 tokens en entrenamiento |
| Tipos de cuantizacion | No disponible (exportacion existente en BF16 para el backbone y FP32 para el enrutamiento mHC) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers, codigo custom `sensenova_loop`) |

## Arquitectura y entrenamiento

El decoder consta de 32 capas distintas. Las capas 0-3 procesan la entrada, el bloque de capas 4-27 se aplica dos veces de forma secuencial con pesos compartidos (formalizado como B(B(h))), y las capas 28-31 junto con la cabeza de salida producen el resultado. En cada pasada hacia delante se ejecutan 56 capas de decoder aunque solo se almacenen 32 conjuntos de pesos, lo que incrementa la profundidad efectiva sin duplicar parametros del bloque repetido. Las conexiones mHC de doble flujo gestionan el flujo de informacion entre dos corrientes residuales dentro de la seccion en bucle mediante mapeos aprendidos.

La atencion es hibrida: intercala atencion lineal y atencion completa en un patron repetido de cuatro capas. Las recetas de entrenamiento documentadas combinan secuencias largas, entradas multimodales (texto, imagenes, codigo y trayectorias de uso de herramientas) con una longitud maxima de secuencia de 262.144 tokens. No se detalla en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento sobre entradas multimodales (texto e imagenes).
- Comprension de documentos e imagenes combinada con generacion de texto.
- Generacion de codigo e interaccion con herramientas externas (el entrenamiento incluye trayectorias de uso de herramientas).
- Flujos agenticos y razonamiento multi-paso, orientados a tareas que requieren contexto largo.
- Procesamiento de contexto muy largo (hasta 256K tokens en entrenamiento), adecuado para documentos extensos y conversaciones prolongadas.
- Capacidades multilingues limitadas a ingles y chino.
- Generacion de artefactos visuales y de presentaciones (se muestran ejemplos de diseno de movimiento, diseno de PPT y analisis de datos en la model card).
- No se documenta explicitamente soporte de audio ni modo "thinking" dedicado en la informacion disponible.

## Casos de uso

- Analisis de documentos extensos: el modelo puede procesar contratos, informes o expedientes de cientos de miles de tokens en una sola ventana, gracias a su contexto de 262.144 tokens, extrayendo conclusiones sin necesidad de trocear el documento.
- Agentes autonomos con uso de herramientas: al haberse entrenado con trayectorias de herramientas, puede integrarse en bucles agenticos que invocan APIs, ejecutan comandos o consultan bases de datos en tareas multi-paso.
- Generacion de codigo en pipelines: su combinacion de capacidades de codigo y contexto largo permite revisar repositorios completos o mantener coherencia en tareas de refactorizacion a gran escala.
- Comprension de documentos con imagenes: facturas, graficos, capturas de pantalla o diagramas pueden enviarse junto al texto para tareas de extraccion y descripcion, aprovechando su pipeline image-text-to-text.
- Generacion de presentaciones y material visual: los ejemplos de la model card (diseno de PPT, diseno de movimiento) indican uso en la creacion de contenido estructurado a partir de instrucciones y datos.
- Analisis de datos y simulaciones: los ejemplos de analisis energetico y simulacion de mision lunar sugieren su uso para interpretar series de datos y generar visualizaciones o resumenes tecnicos.
- Asistentes conversacionales de dominio tecnico: conversaciones multi-turno con contexto largo para soporte en ingenieria, banca o administracion (los benchmarks incluyen dominios como T3-Banking y Terminal Bench).

## Benchmarks y rendimiento

La model card incluye una imagen con resultados comparativos frente a otros modelos en BIRD-Dev, WorkBuddy Bench, AIDABench, TeamBench, Terminal Bench 2.1, T3-Banking, AutomationBench y RaccoonPPTBench, pero los valores numericos no estan disponibles en formato textual en la informacion proporcionada. Por tanto:

No se han publicado resultados de benchmarks en formato numerico en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 19-20 GB solo para los pesos del backbone (~9,66B parametros), mas overhead de activaciones y cache KV, que con contexto de 256K puede ser muy elevado.
- Los parametros mHC en FP32 anaden un coste adicional de memoria respecto a una carga puramente BF16.
- GPU recomendadas: A100 80 GB o H100 80 GB para contexto largo; en consumer, una RTX 4090 (24 GB) podria alojar los pesos en BF16 pero con margen muy ajustado y limitaciones severas de contexto.
- Cuantizacion: no se documentan formatos GGUF ni cuantizaciones oficiales; el uso en consumer GPU requeriria conversion propia, no soportada oficialmente segun la informacion disponible.
- Despliegue: la libreria indicada es transformers con codigo custom (`sensenova_loop`), por lo que se requiere `trust_remote_code`. No se confirma soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El coste computacional es superior al de un modelo de 9B convencional porque ejecuta 56 capas por pasada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SenseNova-Loop-9B-Preview | ~9B almacenados / ~14,6B inferencia | 262.144 tokens | Apache 2.0 | Multimodal, bloque en bucle, atencion hibrida |
| Qwen2.5-VL-7B | ~7B | 128K tokens (tipico) | Apache 2.0 | Multimodal, arquitectura transformer convencional |
| InternVL2.5-8B | ~8B | 32K-128K tokens | Apache 2.0 (segun variante) | Multimodal, orientado a documentos |
| Llama 3.1 8B | ~8B | 128K tokens | Llama 3.1 Community | Solo texto, sin vision |

Los datos de los modelos alternativos son orientativos y pueden variar segun la version; no se dispone de comparaciones de rendimiento numericas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles y chino; el rendimiento en castellano no esta garantizado ni evaluado.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en tareas de extraccion de documentos o uso de herramientas.
- Requiere `trust_remote_code` por el codigo custom de la arquitectura, lo que implica revisar el codigo antes de ejecutarlo en produccion.
- El contexto de 256K implica un consumo de memoria de cache KV muy alto; en la practica el contexto util puede verse limitado por el hardware.
- No se documentan cuantizaciones oficiales, lo que dificulta el despliegue en hardware de consumo.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar los terminos del repositorio GitHub y las dependencias del codigo custom.
- Es una version "Preview"; pueden existir cambios en la API, los pesos o el comportamiento entre versiones.
- No se detallan sesgos conocidos ni evaluaciones de seguridad en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/sensenova/SenseNova-Loop-9B-Preview
- ModelScope: https://modelscope.cn/models/SenseNova/SenseNova-Loop-9B-Preview
- GitHub: https://github.com/OpenSenseNova/SenseNova-Loop
- Licencia en GitHub: https://github.com/OpenSenseNova/SenseNova-Loop/blob/main/LICENSE
- Configuracion de arquitectura: https://github.com/OpenSenseNova/SenseNova-Loop/blob/main/config.json
- README en chino: https://huggingface.co/sensenova/SenseNova-Loop-9B-Preview/blob/main/README_CN.md
- Informe tecnico: pendiente de publicacion (TBD) segun la model card.
