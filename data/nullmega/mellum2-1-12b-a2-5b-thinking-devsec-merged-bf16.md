# Nullmega/Mellum2.1-12B-A2.5B-Thinking-DevSec-merged-bf16

## Resumen
Mellum2.1-12B-A2.5B-Thinking-DevSec-merged-bf16 es un ajuste fino supervisado del modelo JetBrains/Mellum2.1-12B-A2.5B-Thinking, publicado por el usuario Nullmega en HuggingFace. Se trata de un modelo de mezcla de expertos (MoE) orientado a generación de código, con especial énfasis en seguridad defensiva (DevSec) y en flujos de trabajo agénticos con llamadas a herramientas. El autor distribuye los pesos ya fusionados en BF16, de modo que puede cargarse como un modelo Mellum nativo sin necesidad de aplicar el adaptador LoRA por separado.

El modelo parte de una base de aproximadamente 12.150 millones de parámetros totales, de los cuales solo una fracción se activa por token (el identificador indica A2.5B, es decir, alrededor de 2.500 millones de parámetros activos). El entrenamiento se realizó con LoRA de rango 16 sobre las proyecciones de atención (q_proj, k_proj, v_proj, o_proj), manteniendo congelados los pesos del router y de los expertos. La ventana de contexto usada durante el ajuste fue de 8192 tokens.

Su relevancia actual radica en que combina tres ingredientes muy demandados: razonamiento explícito (modo thinking), capacidad de agente con herramientas de shell y bash, y datos específicos de parcheo seguro en C/C++. Sin embargo, se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, y sin benchmarks independientes publicados, por lo que debe evaluarse con cautela antes de llevarlo a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en transformer, derivada de Mellum2.1 |
| Parametros totales | 12.149.923.072 (~12,15 B) |
| Parametros activos | ~2,5 B (según el identificador A2.5B; no confirmado en la model card) |
| Longitud de contexto | 8192 tokens durante el entrenamiento (contexto nativo de la base no disponible) |
| Tipos de cuantizacion | No disponible (el repo distribuye pesos BF16; no se listan GGUF ni otras variantes) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16 fusionado) |

## Arquitectura y entrenamiento
La arquitectura es una mezcla de expertos (MoE) heredada de JetBrains/Mellum2.1-12B-A2.5B-Thinking, con unos 12,15 mil millones de parámetros almacenados y aproximadamente 2,5 mil millones activos por token. El ajuste fino se realizó sobre la revisión `92ddae9fc7665e9f801d141d2e5a6b2caf2460c4` del modelo base, con la base congelada en BF16 y adaptadores LoRA de rango 16 y alpha 32 aplicados únicamente a las proyecciones de atención. Los pesos del router y de los expertos permanecen intactos, y se conservan el tokenizador, la plantilla de chat y el token EOS originales de Mellum.

El entrenamiento usó la receta `reasoning-v2`, con contexto de 8192 tokens, microbatch 1 y acumulación de gradiente de 16, con como máximo una pasada sobre los ejemplos preparados. La función de pérdida cubre la respuesta del asistente seleccionada (razonamiento, llamada a herramienta, respuesta final y EOS), mientras que los mensajes previos y las observaciones de herramientas actúan solo como contexto. Se permite un máximo de 4 objetivos de asistente por tarea, incluyendo siempre la respuesta final, y las tareas completas se mantienen en un mismo split para evitar fugas. El corpus combina cuatro fuentes: Open-SWE-Traces de NVIDIA (1767 trayectorias retenidas), un dataset de parches seguros en C/C++ de prabhatl0dhi (300 trayectorias), OpenThoughts3-1.2M (284 trayectorias) y un dataset de desarrollo frontend React/TypeScript de runanlab (200 trayectorias). No se redistribuye el corpus bruto ni se han reejecutado los entornos de agente convertidos.

## Capacidades
- Generación de texto y razonamiento explícito en modo thinking, con trazas de razonamiento separadas de la respuesta final.
- Generación y parcheo de código, con especial atención a correcciones de seguridad en C y C++.
- Soporte de tool calling y function calling, con adaptación de interacciones de shell al esquema bash de Pi.
- Flujos agénticos de múltiples pasos, incluyendo acciones de bash y observaciones de resultados, entrenados a partir de trazas de Open-SWE.
- Capacidad de razonamiento sobre semántica web y de backend, derivada del dataset de desarrollo frontend React/TypeScript.
- Toma de decisiones sobre herramientas (tool decisions) evaluada en la suite de diagnóstico del autor.
- Capacidades multilingües: no disponibles (no se documentan idiomas soportados).

## Casos de uso
- Revisión de seguridad de código C/C++: el modelo puede recibir una función vulnerable y proponer un parche corregido, aprovechando las 300 trayectorias de parcheo seguro incluidas en el entrenamiento. Es adecuado para triaje previo en pipelines de análisis estático.
- Agente de resolución de incidencias en repositorios: con las trazas de Open-SWE, puede encadenar lecturas de ficheros, ejecuciones de bash y ediciones para cerrar tareas de tipo SWE, siempre que se validen las acciones en un entorno aislado.
- Asistente de desarrollo frontend: el dataset de React/TypeScript permite generar y corregir componentes, hooks y lógica de estado en proyectos web, con contexto de 8192 tokens suficiente para ficheros de tamaño moderado.
- Automatización de razonamiento con herramientas: su modo thinking y el soporte de tool calling permiten construir agentes que deciden cuándo invocar una herramienta y cómo interpretar la observación devuelta.
- Generación de parches en CI/CD: integrado como paso de revisión automatizada, puede proponer diffs ante fallos de tests o hallazgos de seguridad, que luego se validan con la suite de pruebas del proyecto.
- Exploración de razonamiento abierto: las 284 trayectorias de OpenThoughts3 aportan ejemplos de cadenas de razonamiento que pueden servir para estudiar la calidad y longitud de las trazas generadas en tareas algorítmicas.
- Prototipado de asistentes de seguridad defensiva: útil para generar explicaciones de vulnerabilidades y recomendaciones de mitigación en entornos de formación o auditoría interna.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a `evaluation_summary.json` para pérdida en validación, sondas de protocolo pre/post y diagnósticos de razonamiento emparejados, pero no incluye cifras en el texto. El propio autor advierte que estas pruebas no son SWE-bench, Terminal-Bench ni benchmarks de ciberseguridad o frontend independientes, y que no pueden establecer una mejora general del razonamiento ni descartar bucles de generación.

## Requisitos de hardware
- VRAM estimada para inferencia en BF16: en torno a 24-25 GB solo para los pesos (12,15 B × 2 bytes), más overhead de activaciones y caché KV; se recomienda al menos 32 GB para contexto completo de 8192 tokens.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB o RTX 6000 Ada 48 GB para BF16 sin cuantizar.
- GPU de consumo: una RTX 4090 de 24 GB queda al límite y probablemente requiera cuantización (no se distribuyen pesos GGUF en este repo) o descarga parcial a CPU.
- Opciones de despliegue: transformers 5.22.1 con peft 0.21.2 y PyTorch con CUDA; vLLM, llama.cpp, Ollama o TGI no están documentados para esta variante concreta.
- Latencia y throughput: no disponibles. Al ser MoE con ~2,5 B activos, el coste por token debería ser inferior al de un denso de 12 B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Mellum2.1-12B-A2.5B-Thinking-DevSec (este) | 12,15 B totales / ~2,5 B activos | 8192 en entrenamiento | Apache 2.0 | Ajuste LoRA fusionado, foco DevSec y agentes |
| JetBrains/Mellum2.1-12B-A2.5B-Thinking | 12,15 B totales / ~2,5 B activos | No disponible | No disponible en la informacion proporcionada | Modelo base sin el ajuste DevSec |
| Alternativas de código de tamaño similar | No disponible | No disponible | No disponible | No se dispone de datos verificados para comparar |

## Limitaciones y advertencias
- No hay benchmarks independientes: las evaluaciones del autor son sondas propias que no ejecutan código generado ni comandos de shell, por lo que no validan corrección real.
- Riesgo de bucles de generación: el autor reconoce explícitamente que las pruebas no eliminan el riesgo de repetición ni de no detenerse (EOS/cutoff).
- Sesgos conocidos: no documentados; al entrenarse con corpus de código y trazas de agente, puede heredar sesgos de esas fuentes.
- Alucinación: sin datos específicos; el modo thinking puede producir trazas de razonamiento plausibles pero incorrectas, y más tokens de razonamiento no equivalen a mayor acierto.
- Idiomas: no se declaran idiomas soportados, lo que impide garantizar calidad fuera del inglés técnico predominante en los datasets.
- Contexto limitado a 8192 tokens durante el ajuste; las trayectorias que no caben se excluyeron sin truncar, lo que puede reducir la cobertura en tareas largas.
- Licencia Apache 2.0 para los pesos, pero las licencias de los datasets de origen (CC BY 4.0, MIT, Apache 2.0) son procedencia, no una garantía de que cada fragmento de código subyacente esté libre de restricciones.
- Los entornos de agente convertidos no se reejecutaron y las interacciones de shell se adaptaron al esquema de Pi, sin evidencia de cobertura de todas las herramientas o backends.
- Modelo con cero descargas y cero likes: sin validación de la comunidad, lo que desaconseja su uso en producción sin una evaluación propia exhaustiva.

## Enlaces
- HuggingFace: https://huggingface.co/Nullmega/Mellum2.1-12B-A2.5B-Thinking-DevSec-merged-bf16
- Modelo base: https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking
- Dataset Open-SWE-Traces: https://huggingface.co/datasets/nvidia/Open-SWE-Traces
- Dataset de parches seguros C/C++: https://huggingface.co/datasets/prabhatl0dhi/C_C_plus_plus_Patch_Dataset_for_Secure_Code_LLMs
- Dataset OpenThoughts3-1.2M: https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M
- Dataset frontend React/TypeScript: https://huggingface.co/datasets/runanlab/gpt-5.4-frontend-development-11062026
