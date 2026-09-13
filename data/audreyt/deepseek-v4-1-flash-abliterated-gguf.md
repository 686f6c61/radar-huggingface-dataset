# audreyt/DeepSeek-V4.1-Flash-Abliterated-GGUF

## Resumen

`audreyt/DeepSeek-V4.1-Flash-Abliterated-GGUF` es una conversión a GGUF del checkpoint comunitario `s-zaizen/DeepSeek-V4.1-Flash-Abliterated`, que a su vez deriva de `deepseek-ai/DeepSeek-V4.1-Flash` tras aplicarle una ablación de rechazos con la herramienta Heretic (tasa de palabras clave de rechazo reportada: 97/100 en el original frente a 24/100 en el checkpoint abliterado). El archivo lo publica el usuario `audreyt` y está pensado exclusivamente para el runtime DwarfStar `ds4` de antirez, no como GGUF de propósito general.

Se trata de una cuantización agresiva de tipo Q2 sobre una arquitectura de mezcla de expertos (MoE): los expertos enrutados usan `IQ2_XXS` en las proyecciones gate/up y `Q2_K` en down, mientras que atención, expertos compartidos, proyecciones y salida se mantienen en `Q8_0`/F16. Las filas Engram en FP8 se empaquetan sin pérdida al final del archivo y se leen desde disco bajo demanda, por lo que nunca residen en memoria.

Su relevancia es doble: por un lado permite ejecutar un MoE de gran tamaño en un único Mac de 128 GB mediante streaming desde SSD (`--ssd-streaming`), con 152 GiB de pesos principales; por otro, sirve como caso de estudio medible de dos transformaciones simultáneas, la ablación de alineación y la cuantización extrema, con una auditoría de layout de 1046 tensores superada y una comparación de NLL frente al Q2 oficial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con expertos enrutados y compartidos, más tablas Engram en FP8; transformer subyacente no detallado en la información disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (el modelo es MoE, pero no se publica el número de parámetros activos) |
| Longitud de contexto | no disponible; el ejemplo de uso emplea `--ctx 32768` y la evaluación de calidad se hizo con contexto 4096 |
| Tipos de cuantización | `IQ2_XXS` (gate/up de expertos enrutados), `Q2_K` (down de expertos enrutados), `Q8_0`/F16 (atención, expertos compartidos, proyecciones y salida), FP8 (filas Engram, empaquetadas sin pérdida) |
| Idiomas soportados | no disponibles |
| Licencia | MIT (pesos base © DeepSeek, retenida a través del checkpoint de origen; el tooling se rige por la licencia del repositorio ds4) |
| Formato de pesos | GGUF con layout específico de DwarfStar ds4 (no compatible con GGUF genérico) |

## Arquitectura y entrenamiento

El modelo base es una mezcla de expertos con expertos enrutados y expertos compartidos. La conversión la realiza `deepseek41_quantize.py` del repositorio DwarfStar `ds4`, usando los cuantizadores en C del proyecto con `--quant q2` y una calibración por bootstrap de "weight-energy" en lugar de una matriz de importancia (imatrix). El reparto de precisión es deliberadamente asimétrico: se sacrifican los expertos enrutados a 2 bits (`IQ2_XXS` en gate/up, `Q2_K` en down) y se preservan en `Q8_0`/F16 las partes sensibles (atención, expertos compartidos, proyecciones y capa de salida). Las filas Engram en FP8 se empaquetan de forma sin pérdida al final del archivo y se leen de disco cuando se necesitan.

Sobre el entrenamiento original de `DeepSeek-V4.1-Flash` no se aporta información en los materiales disponibles (número de tokens, composición del dataset, fases de RLHF/DPO: no disponible). La transformación documentada es la ablación de rechazos con Heretic aplicada por `s-zaizen`, que reduce la tasa de palabras clave de rechazo de 97/100 a 24/100. La auditoría de layout `deepseek41_validate_gguf.py` da PASS con 1046 tensores. Respecto a la calibración, el autor indica que el stock usa imatrix y que todavía no existe una imatrix para V4.1, por lo que esta versión usa bootstrap; anuncia que podría seguir una v2 calibrada con imatrix.

## Capacidades

- Generación de texto autoregresiva sobre una arquitectura MoE con expertos enrutados y compartidos: es la única capacidad explícitamente deducible de la receta de cuantización.
- Memoria asociativa tipo Engram: el checkpoint incluye tablas Engram en FP8 empaquetadas al final del archivo y leídas bajo demanda desde disco.
- Comportamiento "abliterated": la tasa de rechazos medida baja de 97/100 a 24/100, de modo que el modelo responde a peticiones que el checkpoint original rechazaría.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.
- Ajuste fino o reentrenamiento: no contemplado; el archivo es de solo inferencia en el runtime ds4.

## Casos de uso

- Ejecución local de un MoE de gran tamaño en hardware de gama alta de consumo: con 152 GiB de pesos principales y las tablas Engram en disco, el modelo está diseñado para correr en un Mac de 128 GB usando `--ssd-streaming`, lo que permite trabajar sin GPU de datacenter.
- Investigación sobre alineación y ablación: comparar la tasa de rechazo (97/100 frente a 24/100) y cuantificar el coste en calidad mediante la NLL sobre continuaciones oficiales permite estudiar qué se pierde al eliminar la alineación de rechazo.
- Estudio de cuantización extrema: el archivo es un caso medible de Q2 con mezcla `IQ2_XXS`/`Q2_K` frente a una referencia Q2 calibrada con imatrix, útil para investigar el impacto de la calibración (bootstrap frente a imatrix) en modelos MoE.
- Generación de texto sin dependencia de API externa: al ejecutarse con un runtime local y pesos en disco, encaja en flujos donde no se puede enviar contenido a servicios en la nube por motivos de confidencialidad o conectividad.
- Red-teaming y auditoría de seguridad en entorno controlado: un modelo con solo 24/100 de tasa de rechazo sirve para generar casos adversarios y evaluar clasificadores y filtros de moderación externos.
- Prototipado de procesamiento de textos largos: el ejemplo documentado con `--ctx 32768` permite experimentar con documentos extensos, asumiendo que el streaming desde SSD condiciona la latencia.
- Reproducibilidad de conversiones GGUF personalizadas: el par de scripts `deepseek41_quantize.py` y `deepseek41_validate_gguf.py` sirve como plantilla para auditar layouts de tensores en conversiones propias (1046 tensores verificados).
- Evaluación de memoria externa tipo Engram: el empaquetado FP8 no residente es un caso práctico para medir el equilibrio entre tamaño en disco y latencia de recuperación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de calidad aportado es una comparación de log-verosimilitud negativa (NLL) sobre 100 continuaciones oficiales de V4.1 Flash (`deepseek-v4.1-flash-20260910-general`, contexto 4096, streaming desde SSD), con el mismo harness para ambos archivos:

| Archivo | NLL media | NLL mediana | Coincidencia en el primer token | Acuerdo top-1 |
|---|---:|---:|---:|---:|
| Stock `DeepSeek-V4.1-Flash-Q2` | 0.346 | 0.313 | 78/100 | 0.901 |
| Este archivo (`Abliterated` Q2) | 0.395 | 0.395 | 71/100 | 0.888 |

El autor atribuye el coste de +0,05 NLL a la propia ablación y a la calibración por bootstrap (el stock usa imatrix y todavía no existe una imatrix para V4.1), y señala que no hay colapso de calidad porque el acuerdo top-1 es casi idéntico.

## Requisitos de hardware

- Tamaño de los pesos principales del archivo Q2: 152 GiB; las tablas Engram permanecen en disco y no son residentes.
- Descarga de los pesos stock Q2 de la receta ds4: 341 GiB (referencia comparativa del autor).
- Configuración probada: un Mac de 128 GB usando `--ssd-streaming`, lo que implica que parte de los pesos se leen desde disco durante la inferencia y se requiere un SSD local rápido.
- VRAM para GPU: no disponible; no se documenta ejecución en CUDA ni en otras aceleradoras.
- Viabilidad en GPU de consumo: no hay datos publicados; 152 GiB de pesos exceden la memoria de cualquier GPU de consumo y el layout está atado a ds4, por lo que no se puede asumir su carga en una RTX 4090 y similares.
- Opciones de despliegue: runtime DwarfStar ds4 (repositorio `antirez/ds4`, sección `docs/MODELS.md`, entrada "DeepSeek V4.1 Flash"). El autor advierte explícitamente de que no es un GGUF general: el layout de tensores, la mezcla de cuantización y el empaquetado Engram son específicos de ds4, por lo que llama.cpp, Ollama, vLLM o TGI no están soportados según la información disponible.
- Latencia y throughput: no disponibles; al depender del streaming desde SSD, el rendimiento estará condicionado por la velocidad del disco local.

## Comparativa con modelos similares

| Modelo | Cuantización | Calibración | NLL media | Coincidencia primer token | Acuerdo top-1 | Licencia | Formato |
|---|---|---:|---:|---:|---:|---|---|
| `audreyt/DeepSeek-V4.1-Flash-Abliterated-GGUF` (este) | `IQ2_XXS` + `Q2_K` + `Q8_0`/F16 | Bootstrap peso-energía | 0.395 | 71/100 | 0.888 | MIT | GGUF para ds4 |
| Stock `DeepSeek-V4.1-Flash-Q2` | Q2 (receta oficial ds4) | imatrix | 0.346 | 78/100 | 0.901 | MIT | GGUF para ds4 |
| `s-zaizen/DeepSeek-V4.1-Flash-Abliterated` | no disponible (checkpoint de origen) | no aplica | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos comparables de la misma categoría (mismo tamaño o misma tarea) en la información proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinación: inherente a los modelos generativos; no hay benchmarks estándar publicados ni evaluación independiente que lo cuantifiquen.
- Modelo abliterado: la tasa de rechazo cae de 97/100 a 24/100, por lo que puede producir contenido que el checkpoint original rechazaría. Requiere moderación externa y revisión de cumplimiento antes de cualquier despliegue con usuarios finales.
- Pérdida de calidad medible: +0,05 de NLL media y 7 puntos menos de coincidencia en el primer token respecto al Q2 stock, atribuibles a la ablación y a la calibración por bootstrap en lugar de imatrix.
- Cuantización muy agresiva: los expertos enrutados están a 2 bits (`IQ2_XXS`/`Q2_K`), lo que añade degradación adicional a la ya introducida por la ablación.
- Portabilidad nula: el layout, la mezcla de cuantización y el empaquetado Engram son específicos de DwarfStar ds4; el propio autor indica que no es un GGUF general, de modo que no se puede cargar en llama.cpp, Ollama, vLLM o TGI según la información disponible.
- Dependencia de disco: las tablas Engram viven en disco y se leen bajo demanda, lo que exige SSD rápido y penaliza la latencia; sin streaming no cabe en 128 GB.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingüe ni comportamiento por idioma.
- Contexto: solo se documenta el ejemplo con `--ctx 32768` y la evaluación a 4096; no se publica la ventana máxima del modelo base.
- Madurez y validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 2026-09-12, sin evidencia de uso en producción ni de terceros.
- Licencia: los pesos base son © DeepSeek bajo MIT, retenida vía el checkpoint de origen; el tooling de conversión se rige por la licencia del repositorio ds4. Conviene verificar los términos del modelo original antes de un uso comercial, especialmente por el carácter sin censura del resultado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/audreyt/DeepSeek-V4.1-Flash-Abliterated-GGUF
- Checkpoint base abliterado: https://huggingface.co/s-zaizen/DeepSeek-V4.1-Flash-Abliterated
- Modelo original de DeepSeek: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Herramienta de ablación Heretic: https://github.com/p-e-w/heretic
- Runtime DwarfStar ds4: https://github.com/antirez/ds4
- Documentación de modelos de ds4 (entrada "DeepSeek V4.1 Flash"): https://github.com/antirez/ds4/blob/main/docs/MODELS.md
