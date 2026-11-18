# mradermacher/Agentic-27B-V2-GGUF

## Resumen

Agentic-27B-V2-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo base opencsg/Agentic-27B-V2, publicada por el usuario mradermacher, conocido en el ecosistema de Hugging Face por generar versiones cuantizadas de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El repositorio no contiene pesos originales ni documentación técnica propia del modelo: es un artefacto derivado que empaqueta el modelo fuente en múltiples niveles de precisión para facilitar su despliegue en hardware con recursos limitados.

El dato más relevante para evaluar el modelo es la discrepancia entre el nombre comercial ("27B") y el número real de parámetros declarado en los safetensors del repositorio: 460.730.096 parámetros, es decir, aproximadamente 0,46 mil millones. Esta cifra sugiere que el modelo base no es un transformer denso de 27 mil millones de parámetros en el sentido convencional, sino probablemente un modelo de arquitectura compacta, un modelo de mezcla de expertos con pocos parámetros activos o una nomenclatura derivada de otra convención (por ejemplo, tamaño de vocabulario o identificador interno del proyecto opencsg). No hay información en la model card que aclare esta discrepancia.

Al tratarse de un repositorio de cuantizaciones sin model card sustantiva, la mayoría de especificaciones técnicas, datos de entrenamiento, benchmarks y licencia no están disponibles en la información proporcionada. La ficha siguiente documenta lo que sí puede verificarse y marca explícitamente como "no disponible" todo aquello que no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 460.730.096 (según safetensors del repo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); pesos originales en safetensors en el repo fuente |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base opencsg/Agentic-27B-V2 en la documentación proporcionada. El repositorio de mradermacher es únicamente un conjunto de cuantizaciones estáticas generadas con un pipeline de conversión (los metadatos de la model card indican `convert_type: hf` y `quantize_version: 2`, lo que apunta a una conversión desde pesos Hugging Face con la herramienta de cuantización de llama.cpp). No hay datos sobre número de tokens de entrenamiento, composición del dataset, fases de RLHF/DPO ni innovaciones técnicas del modelo original.

El nombre "Agentic" sugiere un ajuste orientado a tareas de agente (tool calling, razonamiento multi-paso), pero esta inferencia no está respaldada por documentación técnica en la información disponible. Cualquier afirmación sobre capacidades agénticas concretas requeriría consultar la model card del modelo fuente, que no se ha proporcionado.

## Capacidades

- No se dispone de documentación que detalle las capacidades del modelo base.
- El nombre del modelo ("Agentic") sugiere orientación a flujos de agente, pero no hay confirmación técnica en la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

Dado que no se dispone de especificaciones verificadas del modelo base, los siguientes casos se plantean como escenarios plausibles de uso de una cuantización GGUF de aproximadamente 0,46 mil millones de parámetros, no como recomendaciones basadas en capacidades documentadas:

- Despliegue en CPU o hardware de gama baja: con ~460 millones de parámetros, las cuantizaciones Q4_K_M o Q5_K_M ocupan del orden de 300-500 MB, lo que permite ejecución en equipos sin GPU dedicada mediante llama.cpp, útil para prototipos y pruebas locales.
- Integración en aplicaciones de escritorio o edge: el tamaño reducido del archivo GGUF facilita embeber el modelo en aplicaciones de escritorio, plugins de IDE o dispositivos con memoria limitada, siempre que se valide su calidad en la tarea concreta.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece doce variantes de cuantización, lo que permite medir la degradación de calidad entre Q2_K y x-f16 en una tarea concreta antes de decidir el nivel de compresión para producción.
- Filtrado y clasificación de texto a pequeña escala: modelos de este tamaño pueden emplearse para tareas de etiquetado, moderación o extracción simple, aunque sin benchmarks publicados no puede garantizarse su rendimiento.
- Base para fine-tuning ligero: el modelo fuente en safetensors (opencsg/Agentic-27B-V2) sería el punto de partida adecuado para ajuste fino; las cuantizaciones GGUF no son aptas para entrenamiento.
- Pruebas de pipelines de inferencia: útil para validar infraestructura (llama.cpp, Ollama, servidores compatibles con GGUF) antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~460 millones de parámetros, las cuantizaciones Q4_K_M ocupan aproximadamente 0,3-0,5 GB; x-f16 en torno a 0,9-1 GB. Estas cifras son estimaciones por tamaño de parámetros, no datos publicados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede alojar las cuantizaciones pequeñas; también es viable la inferencia en CPU.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna (GTX 1060 6 GB, RTX 3060, RTX 4090, etc.), e incluso en iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con GGUF (koboldcpp, text-generation-webui con loader GGUF). vLLM y TGI no son las vías naturales para GGUF, aunque vLLM soporta algunos modelos GGUF de forma experimental.
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables documentados en la información proporcionada, y la discrepancia entre el nombre ("27B") y el recuento real de parámetros (0,46 B) impide establecer una categoría fiable de comparación.

## Limitaciones y advertencias

- Discrepancia crítica entre el nombre del modelo ("27B") y el recuento real de parámetros en safetensors (460.730.096): verificar el modelo fuente antes de asumir capacidades de un modelo de 27 mil millones de parámetros.
- Ausencia total de model card sustantiva: no hay información sobre entrenamiento, datos, licencia ni evaluación, lo que impide validar su idoneidad para producción.
- Licencia no disponible: no puede confirmarse el uso comercial; consultar la licencia del modelo fuente opencsg/Agentic-27B-V2 antes de cualquier despliegue.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad de forma notable; para uso real se recomienda Q4_K_M o superior.
- Riesgo de alucinación y sesgos: no evaluable sin benchmarks ni documentación del modelo base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.
- Los archivos GGUF no son aptos para fine-tuning; para entrenamiento debe usarse el modelo fuente en safetensors.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Agentic-27B-V2-GGUF
- Modelo fuente: https://huggingface.co/opencsg/Agentic-27B-V2
