# JulianAT/sv-lotse-qwen3-8b-sft-merged

## Resumen

SV-Lotse-Qwen3-8B-SFT-merged es un ajuste fino por supervisión (SFT) del modelo Qwen/Qwen3-8B, publicado por el usuario JulianAT. El repositorio contiene los pesos fusionados en bf16 del adaptador LoRA original (r=64, alpha=128), entrenado sobre el dataset JulianAT/at-benefits, compuesto por diálogos y situaciones orientadas a la atención telefónica de beneficios sociales en Austria. El modelo está especializado en tool calling dentro de ese dominio concreto.

La relevancia del modelo es acotada: se trata de un artefacto de investigación aplicada a un caso de uso muy específico (asistencia administrativa telefónica), no de un modelo generalista. Su interés técnico reside en el patrón de entrenamiento: un adaptador LoRA de rango alto sobre un modelo base compacto (8B) para forzar un comportamiento de llamada a herramientas con salidas truncadas y modo de pensamiento desactivado, lo que reduce la latencia y el coste en despliegues de atención al cliente.

La model card es explícitamente incompleta: el autor indica que los resultados de evaluación y la ficha completa están pendientes de publicación. Solo se aporta la pérdida final de evaluación (0,0359) y una serie de instrucciones de uso muy concretas (plantilla de chat de Qwen3 con `tools=`, `enable_thinking=False`, truncado de salidas de herramienta a 250 caracteres). Cualquier evaluación de rendimiento más allá de esa cifra no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) con adaptador LoRA fusionado |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-8B; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan GGUF ni otras) |
| Idiomas soportados | no disponible (el dataset de entrenamiento parece orientado al alemán austríaco, no confirmado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, pesos fusionados) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-8B, un transformer decoder-only de la familia Qwen3 con 8.190 millones de parámetros. Sobre él se aplicó un adaptador LoRA con rango 64 y alpha 128, entrenado mediante SFT sobre el dataset JulianAT/at-benefits, que contiene diálogos y "situaciones" del dominio de prestaciones sociales austríacas. Posteriormente el adaptador se fusionó con los pesos base y se publicó en bf16, por lo que el repositorio no requiere cargar PEFT en inferencia (aunque la librería declarada sea `peft`).

No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO. La única métrica publicada es la pérdida final de evaluación: 0,03589601069688797. La innovación técnica destacable es de naturaleza operativa, no arquitectónica: el entrenamiento fuerza el uso de la plantilla de chat de Qwen3 con el parámetro `tools=`, desactiva el modo de pensamiento (`enable_thinking=False`) y asume el truncado de las salidas de herramienta a 250 caracteres, lo que sugiere un diseño orientado a latencia baja y a un formato de tool calling muy acotado.

## Capacidades

- Generación de texto conversacional en el dominio de prestaciones y beneficios sociales.
- Tool calling / function calling: el modelo está entrenado explícitamente para invocar herramientas mediante `tools=` en la plantilla de chat de Qwen3.
- Razonamiento multi-turno dentro de diálogos de atención al ciudadano, según el dataset de entrenamiento (diálogos + situaciones).
- Modo sin pensamiento (`enable_thinking=False`): el autor recomienda desactivar el thinking mode, lo que indica que el modelo está calibrado para responder sin cadena de razonamiento explícita.
- Manejo de salidas de herramienta truncadas a 250 caracteres, un comportamiento asumido en el entrenamiento.
- Capacidades multilingües: no confirmadas; el dataset y el nombre ("sv-lotse", "at-benefits") apuntan a alemán austríaco, pero no se documenta.
- Capacidades de visión, audio o matemáticas avanzadas: no disponibles en la información proporcionada.

## Casos de uso

- Atención telefónica automatizada de prestaciones sociales: el modelo está entrenado sobre diálogos del dominio `at-benefits` y puede gestionar conversaciones multi-turno con invocación de herramientas para consultar el estado de una solicitud o los requisitos de un trámite.
- Enrutamiento de consultas ciudadanas con function calling: dado un catálogo de herramientas (`tools=`), el modelo selecciona la función adecuada (consulta de expediente, cálculo de elegibilidad, derivación) y formatea los argumentos según el esquema.
- Asistente de primera línea con derivación a humano: la model card indica que las preguntas médicas deben derivarse al médico tratante o a la línea 1450, lo que encaja con un flujo de triaje donde el modelo clasifica y redirige.
- Generación de respuestas breves en sistemas de chat con latencia estricta: al recomendar `enable_thinking=False` y truncar salidas de herramienta a 250 caracteres, el modelo es adecuado para pipelines donde el coste por turno debe ser bajo.
- Prototipado de agentes administrativos multi-paso: combinado con un orquestador externo, el modelo puede encadenar varias llamadas a herramientas para resolver una solicitud completa (verificar identidad, consultar prestación, emitir resolución).
- Base para ajustes posteriores en dominios administrativos similares: al ser un merge bf16 con licencia Apache 2.0, sirve como punto de partida para SFT adicional en otros organismos o países.
- Evaluación de técnicas de LoRA de rango alto en modelos de 8B: útil en investigación para comparar r=64/alpha=128 frente a configuraciones menores en tareas de tool calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato numérico aportado por el autor es la pérdida final de evaluación del SFT: 0,03589601069688797. No hay cifras de MMLU, HumanEval, GSM8K, BFCL ni de precisión en tool calling.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 16,4 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se necesitan entre 18 y 24 GB para inferencia cómoda con contexto moderado.
- Cuantización: no se publican versiones GGUF ni AWQ/GPTQ; habría que generarlas a partir de los pesos bf16. En 8 bits (int8) cabría en torno a 9-10 GB; en 4 bits, en torno a 5-6 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para producción; RTX 4090 (24 GB) para bf16 en single-GPU.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en bf16; en RTX 4080/4070 Ti Super (16 GB) solo con cuantización a 8 bits o inferior.
- Opciones de despliegue: vLLM, TGI, SGLang y llama.cpp/Ollama (estas dos últimas requieren conversión previa a GGUF). Al ser un merge estándar de Qwen3, es compatible con el ecosistema habitual de Qwen3.
- Latencia y throughput: no disponibles. La recomendación de `enable_thinking=False` y el truncado a 250 caracteres sugieren un diseño orientado a respuestas rápidas, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización | Disponibilidad |
|---|---|---|---|---|---|
| SV-Lotse-Qwen3-8B-SFT-merged | 8,19B | no disponible | Apache 2.0 | Tool calling en beneficios sociales (AT) | Hugging Face, 0 descargas |
| Qwen/Qwen3-8B | 8,19B | no disponible en esta ficha | Apache 2.0 | Generalista, multilingüe | Hugging Face, ampliamente usado |
| Adaptador original JulianAT/sv-lotse-qwen3-8b-sft | 8,19B (base + LoRA) | no disponible | Apache 2.0 | Igual, en formato adaptador | Hugging Face |

La comparación con alternativas de la misma categoría (modelos de 8B especializados en tool calling para dominios administrativos) no está disponible: no se han identificado en la información proporcionada otros modelos comparables con licencia permisiva y entrenados sobre datos de beneficios sociales austríacos.

## Limitaciones y advertencias

- Model card incompleta: el autor declara que los resultados de evaluación y la ficha completa están pendientes; no hay evidencia publicada de calidad en producción.
- Sesgos: al entrenarse sobre un dataset específico de beneficios sociales austríacos, el modelo puede reproducir sesgos del proceso administrativo y de los diálogos originales; no se documenta ningún análisis de sesgo.
- Riesgo de alucinación: alto en consultas fuera del dominio de entrenamiento o cuando la herramienta no devuelve información; el truncado a 250 caracteres de las salidas de herramienta puede provocar respuestas incompletas o mal fundamentadas.
- Limitaciones de idioma: no se confirma el soporte multilingüe; el rendimiento fuera del alemán austríaco es desconocido y probablemente degradado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3-8B arrastra sus propias condiciones; conviene verificar la licencia del base model antes de desplegar.
- Advertencia explícita del autor: no es consejo médico, legal ni financiero; las preguntas médicas deben derivarse al médico tratante o a la línea 1450.
- Cero tracción: 0 descargas y 0 likes en el momento de la consulta; no hay comunidad ni soporte.
- Dependencia de formato: el modelo espera la plantilla de chat de Qwen3 con `tools=` y `enable_thinking=False`; usarlo con otra plantilla o con thinking activado puede degradar el comportamiento de tool calling.
- Sin cuantizaciones oficiales publicadas: desplegarlo en hardware limitado exige generar y validar conversiones propias.

## Enlaces

- Repositorio del modelo fusionado: https://huggingface.co/JulianAT/sv-lotse-qwen3-8b-sft-merged
- Adaptador LoRA original: https://huggingface.co/JulianAT/sv-lotse-qwen3-8b-sft
- Dataset de entrenamiento: https://huggingface.co/datasets/JulianAT/at-benefits
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Papers, blogs, repos o demos adicionales: no disponibles en la información proporcionada.
