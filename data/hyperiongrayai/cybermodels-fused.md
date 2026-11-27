# HyperionGrayAI/cybermodels-fused

## Resumen

Cybermodels Fused v0.1 es un adaptador PEFT de rango 12 publicado por HyperionGrayAI sobre el modelo base Qwennifer Flash BF16 (referencia v0.1 del mismo autor). El adaptador fusiona los tres adaptadores de cabeza de salida de rango 4 de la familia v0.1 (Windows internals, mantenimiento de drivers Linux y defensa web orientada a navegador) en una sola actualización lineal, de modo que la suma de las tres actualizaciones entrenadas se preserva hasta el redondeo en coma flotante. No hubo entrenamiento adicional durante la fusión: los adaptadores originales se entrenaron con la herramienta GPUless sobre el base congelado y empaquetado.

El modelo resuelve un problema de consolidación: en lugar de cargar y conmutar tres adaptadores especializados en ciberseguridad, se despliega uno solo que cubre las tres áreas simultáneamente. Está etiquetado para generación de texto con recuperación aumentada (RAG): el repositorio incluye tres índices de referencia que aportan el material de apoyo en inferencia, y el adaptador actualiza 553 filas del vocabulario en `lm_head`.

Es relevante por su enfoque poco habitual: adaptadores de bajo rango entrenados sin GPU sobre un base grande y fusionados por suma exacta de actualizaciones, con un paquete de reproducibilidad (dataset, script de fusión, hashes SHA-256 por componente y script de comparación). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo es de 0.0 GB, lo que sugiere que los pesos pueden no estar materializados en el snapshot indexado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) de rango 12 sobre transformer decoder-only (Qwennifer Flash BF16) |
| Parametros totales | No disponible (el adaptador actualiza 553 filas de `lm_head`; el base requiere 148.4 GiB en BF16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el base de referencia se distribuye en BF16) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (adaptador y helper BF16); software de recuperación GPLv3; notas de referencia CC BY 4.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 12 resultante de la fusión de tres adaptadores LoRA de rango 4, uno por dominio (Windows internals, mantenimiento de drivers Linux, defensa web en navegador). La fusión suma las tres actualizaciones lineales entrenadas con peso 1 cada una, por lo que el resultado equivale a la suma de las tres actualizaciones salvo error de redondeo en coma flotante. Los adaptadores originales se entrenaron con GPUless sobre el base Qwennifer Flash empaquetado y congelado; no se realizó entrenamiento adicional durante la fusión. La actualización de `lm_head` afecta a 553 filas del vocabulario.

El paquete de reproducibilidad es parte del diseño: el dataset `HyperionGrayAI/cybermodels-team` contiene ejemplos de entrenamiento y de validación junto con la definición original del consejo de modelos; `fuse.py` reconstruye el adaptador a partir de los miembros descargados y `fusion.json` registra versión y SHA-256 de cada componente. `compare.py` compara respuestas en BF16 plano frente a fusionado con las mismas passages de origen y decodificación greedy. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO.

## Capacidades

- Generación de texto especializada en tres dominios de ciberseguridad: internals de Windows, mantenimiento de drivers en Linux y defensa web orientada a navegador.
- Recuperación aumentada (RAG) con tres índices de referencia incluidos que aportan material de apoyo en inferencia; la recuperación se activa de forma independiente mediante `team_brief.py`.
- Respuesta a preguntas técnicas sobre cabeceras HTTP y comportamiento de caché (el ejemplo de la model card usa `Cache-Control: no-cache`).
- Integración programática mediante PEFT: `PeftModel.from_pretrained(base, "HyperionGrayAI/cybermodels-fused", revision="v0.1")`.
- Ejecución en GPU por defecto o en RAM de host con `--device cpu`.
- No se documentan en la información disponible capacidades de tool calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Consulta técnica sobre configuración de caché HTTP: el adaptador responde preguntas sobre semántica de `Cache-Control` apoyándose en los índices de referencia, útil para equipos de desarrollo web que necesitan verificar comportamiento de intermediarios y navegadores.
- Asistencia en triaje de incidentes en Windows: análisis de artefactos y rutas de internals con recuperación de notas de referencia adaptadas, adecuado para analistas que necesitan contexto rápido sin salir del flujo de trabajo.
- Mantenimiento de drivers en Linux: apoyo a la revisión de cambios en módulos y a la interpretación de errores de carga, con material de referencia indexado para contrastar.
- Base para un asistente RAG interno de seguridad: el adaptador se conecta a los índices incluidos y se puede sustituir el corpus por documentación propia, manteniendo el formato de recuperación del repositorio.
- Reproducción y auditoría de adaptadores LoRA: el dataset, `fuse.py` y `fusion.json` permiten reconstruir el adaptador y verificar hashes, útil para equipos que auditan artefactos de terceros antes de desplegarlos.
- Evaluación comparativa de fusiones de adaptadores: `compare.py` registra la colocación en GPU y compara respuestas planas frente a fusionadas con decodificación greedy, lo que sirve como plantilla para medir el efecto de fusionar especializaciones.
- Despliegue en entornos sin GPU para pruebas: la opción `--device cpu` permite ejecutar en RAM de host, adecuada para validación funcional aunque con latencia muy superior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los informes de benchmark se publican por separado y que `compare.py` permite generar comparaciones locales, pero no se incluyen cifras en el repositorio consultado.

## Requisitos de hardware

- El base Qwennifer Flash BF16 requiere 148.4 GiB solo para los pesos, más memoria adicional para la generación; el adaptador añade una sobrecarga pequeña al ser LoRA de rango 12.
- Residencia en GPU necesaria por defecto; con esa huella, se requieren varios aceleradores de gama alta (por ejemplo, múltiples A100/H100 de 80 GB) o un nodo con memoria agregada suficiente. No se dispone de una configuración mínima documentada.
- Ejecución en CPU posible con `--device cpu`, limitada por la RAM de host disponible (por encima de 148.4 GiB para los pesos en BF16).
- No cabe en GPUs de consumo (RTX 4090 de 24 GB, etc.) en BF16; no se documentan versiones cuantizadas del base ni del adaptador.
- Opciones de despliegue: PyTorch con CUDA, Transformers, Accelerate y PEFT, tal como indica la model card; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cybermodels Fused v0.1 | Adaptador LoRA rango 12 sobre base de 148.4 GiB en BF16 | No disponible | Fusión de tres adaptadores de ciberseguridad + RAG | Apache-2.0 (adaptador), GPLv3 (recuperación) | Hugging Face, 0 descargas |
| Qwennifer Flash BF16 (base) | No disponible (148.4 GiB en BF16) | No disponible | Modelo base congelado sin especialización | No disponible en la información consultada | Hugging Face |
| Adaptadores individuales v0.1 (rango 4) | Rango 4 cada uno | No disponible | Especialización por dominio (Windows, Linux, web) | No disponible en la información consultada | Referenciados en el dataset `cybermodels-team` |

No se dispone de información sobre modelos de terceros comparables en la documentación consultada; la comparativa se limita a los artefactos de la propia familia.

## Limitaciones y advertencias

- La model card advierte explícitamente de que el sistema puede afirmar hechos incorrectos sobre las fuentes y presentar paráfrasis como citas textuales; hay que verificar la redacción exacta contra los documentos enlazados.
- El adaptador no se ha entrenado durante la fusión: hereda los sesgos y errores de los tres adaptadores originales, sin corrección posterior.
- Idiomas soportados no documentados; no hay garantía de comportamiento en castellano ni en otros idiomas distintos del inglés de las referencias.
- Longitud de contexto no documentada, lo que impide planificar despliegues con prompts largos o conversaciones multi-turno extensas.
- La licencia del adaptador es Apache-2.0, pero el software de recuperación incluido es GPLv3 y las notas de referencia y el contenido adaptado de Windows son CC BY 4.0; un uso comercial debe respetar la combinación y las atribuciones de `sources/` y `NOTICE`.
- El repositorio registra 0 descargas y 0 likes y un tamaño de 0.0 GB, lo que sugiere que los pesos pueden no estar disponibles en el snapshot; conviene verificar la revisión `v0.1` antes de integrar.
- El requisito de 148.4 GiB en BF16 para el base limita el despliegue a infraestructura de gama alta y encarece cualquier prueba en producción.
- No hay benchmarks publicados en la información disponible, por lo que no es posible comparar su calidad frente a alternativas.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/HyperionGrayAI/cybermodels-fused
- Modelo base: https://huggingface.co/HyperionGrayAI/qwennifer-flash-bf16
- Revisión del base v0.1: https://huggingface.co/HyperionGrayAI/qwennifer-flash-bf16/tree/v0.1
- Dataset del equipo: https://huggingface.co/datasets/HyperionGrayAI/cybermodels-team/tree/v0.1
