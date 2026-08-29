# Seum0/qwen2.5-luau-coder-1.5b

## Resumen

Seum0/qwen2.5-luau-coder-1.5b es un ajuste fino (fine-tune) del modelo Qwen2.5-Coder-1.5B-Instruct, especializado en la generación y comprensión de código Luau, el lenguaje de scripting utilizado en la plataforma Roblox. El modelo ha sido desarrollado por el usuario Seum0 y publicado bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones significativas.

El modelo parte de la arquitectura Qwen2, un transformer decoder con atención causal, y conserva el tamaño de 1.543 millones de parámetros del modelo base. Al estar basado en Qwen2.5-Coder, hereda las capacidades de generación de código del modelo original, pero el ajuste fino lo orienta específicamente hacia Luau, un lenguaje con sintaxis y paradigmas propios que no siempre están bien cubiertos por los modelos de código generalistas.

La relevancia de este modelo radica en su tamaño reducido (1.5B), que permite ejecutarlo en hardware de consumo con poca memoria VRAM, y en su especialización en un nicho concreto: el desarrollo de juegos en Roblox. Esto lo convierte en una opción práctica para desarrolladores independientes, estudiantes y pequeños estudios que necesitan asistencia de código local sin depender de servicios en la nube.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder con atención causal) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-Coder-1.5B-Instruct soporta 32.768 tokens, pero no se confirma si el fine-tune mantiene esta ventana) |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos en safetensors; no se especifican versiones cuantizadas) |
| Idiomas soportados | en (según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint `unsloth/qwen2.5-coder-1.5b-instruct-bnb-4bit`, que a su vez es una versión cuantizada en 4 bits del Qwen2.5-Coder-1.5B-Instruct original. El entrenamiento se realizó utilizando la librería Unsloth, que optimiza el proceso de fine-tuning mediante técnicas de atención y kernels eficientes, junto con la librería TRL de Hugging Face para el entrenamiento con refuerzo y ajuste supervisado.

No se han publicado detalles sobre el dataset de entrenamiento, el número de pasos, la configuración de hiperparámetros ni el proceso de alineación (si se usó RLHF, DPO o solo fine-tuning supervisado). El modelo base Qwen2.5-Coder-1.5B-Instruct fue entrenado con 5,5 billones de tokens de código y texto, cubriendo 92 lenguajes de programación, pero el fine-tune específico para Luau no documenta su composición de datos.

En cuanto a innovaciones técnicas, el modelo no introduce cambios arquitectónicos respecto al base. La única particularidad es el uso de Unsloth para acelerar el entrenamiento, lo que no afecta a la arquitectura de inferencia.

## Capacidades

- Generación de código Luau: el modelo está especializado en producir scripts completos, funciones y fragmentos de código en Luau, el lenguaje de scripting de Roblox.
- Completado de código: puede continuar fragmentos de código Luau existentes, útil para autocompletado en editores.
- Comprensión de código: es capaz de explicar qué hace un script Luau, identificar errores y sugerir correcciones.
- Conversación: al estar basado en un modelo instruct, mantiene capacidades de diálogo en inglés, aunque su enfoque principal es el código.
- Soporte multilingüe: limitado al inglés según la model card; no se garantiza buen rendimiento en otros idiomas.
- No se documentan capacidades de tool calling, function calling, agentes ni razonamiento multi-paso específico.

## Casos de uso

- Desarrollo de scripts para Roblox: el modelo puede generar desde simples scripts de movimiento hasta sistemas de inventario o combate, ahorrando tiempo a desarrolladores que trabajan en la plataforma.
- Asistencia en entornos de desarrollo integrados (IDE): integrable como autocompletado o generador de código en editores como Visual Studio Code mediante extensiones que usan modelos locales.
- Depuración de código Luau: dado un script con errores, el modelo puede identificar problemas de sintaxis o lógica y proponer correcciones.
- Conversión de código: puede traducir lógica escrita en otros lenguajes (Python, JavaScript) a Luau, adaptando la sintaxis y las APIs de Roblox.
- Educación en programación: estudiantes que aprenden a crear juegos en Roblox pueden usar el modelo para entender patrones de código y practicar con ejemplos generados.
- Prototipado rápido: en fases iniciales de desarrollo, el modelo permite generar esqueletos de funcionalidades que luego se refinan manualmente.
- Automatización de tareas repetitivas: generación de plantillas de código para objetos comunes (partes, herramientas, GUI) en Roblox Studio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no incluye métricas de evaluación propias, y la model card no referencia ningún estudio comparativo. El modelo base Qwen2.5-Coder-1.5B-Instruct alcanza un 43,3% en HumanEval, pero este dato corresponde al modelo original, no al fine-tune, y no puede atribuirse a esta versión sin verificación.

## Requisitos de hardware

- VRAM estimada: el modelo base con cuantización Q4 requiere aproximadamente 1,2 GB de VRAM. Para este fine-tune, al no especificarse cuantización, se recomienda al menos 3-4 GB de VRAM si se usan pesos en FP16, o 1,5-2 GB si se aplica cuantización posterior.
- GPU recomendadas: tarjetas de consumo con 4 GB o más de VRAM, como GTX 1650, RTX 3050, RTX 3060, RTX 4060, o superiores. También es viable en Apple Silicon con Metal.
- Compatibilidad con GPU de consumo: sí, es uno de los puntos fuertes del modelo por su tamaño reducido.
- Opciones de despliegue: compatible con transformers, vLLM, llama.cpp, Ollama y Text Generation Inference (TGI), según las etiquetas del repositorio.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna, un modelo de 1,5B en FP16 puede generar entre 20 y 50 tokens por segundo, dependiendo del hardware y la implementación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Seum0/qwen2.5-luau-coder-1.5b | 1,5B | no disponible | Luau (Roblox) | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-Coder-1.5B-Instruct | 1,5B | 32.768 tokens | Codigo general (92 lenguajes) | Apache 2.0 | Hugging Face |
| umjunsik1323/Qwen2.5-Coder-1.5B-roblox | 1,5B | 32.768 tokens (heredado) | Luau (Roblox) | Apache 2.0 | Hugging Face |

El modelo compite directamente con `umjunsik1323/Qwen2.5-Coder-1.5B-roblox`, que también es un fine-tune de Qwen2.5-Coder-1.5B-Instruct orientado a Luau. La diferencia principal es que el modelo de Seum0 no documenta su proceso de entrenamiento ni sus benchmarks, mientras que el de umjunsik1323 sí menciona explícitamente su capacidad para generar, completar y entender patrones de Luau. El modelo base Qwen2.5-Coder-1.5B-Instruct es más generalista y puede servir como alternativa si se necesita soporte para otros lenguajes además de Luau.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos o comportamientos problemáticos específicos de este fine-tune.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar código sintácticamente válido pero lógicamente incorrecto o con APIs inexistentes de Roblox.
- Limitación de idioma: la model card indica solo inglés; el rendimiento en otros idiomas no está garantizado.
- Contexto limitado: aunque el modelo base soporta 32K tokens, no se confirma que el fine-tune mantenga esta capacidad. En la práctica, con 1,5B de parámetros, el uso efectivo de contextos muy largos puede degradar la calidad.
- Sin datos de evaluación: al no existir benchmarks publicados, no se puede verificar la calidad real del ajuste fino. El modelo tiene 0 descargas y 0 likes en Hugging Face, lo que sugiere que no ha sido probado por la comunidad.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base original para asegurar el cumplimiento de cualquier atribución requerida.
- Para producción, se recomienda validar exhaustivamente el código generado, ya que el modelo puede producir scripts que funcionen en apariencia pero fallen en casos límite.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Seum0/qwen2.5-luau-coder-1.5b
- Modelo base (Qwen2.5-Coder-1.5B-Instruct): https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B
- Modelo similar (Qwen2.5-Coder-1.5B-roblox): https://huggingface.co/umjunsik1323/Qwen2.5-Coder-1.5B-roblox
- Repositorio de Qwen2.5-Coder en GitHub: https://github.com/worldart/QwenLM_Qwen2.5-Coder
- Documentación de Unsloth: https://github.com/unslothai/unsloth
