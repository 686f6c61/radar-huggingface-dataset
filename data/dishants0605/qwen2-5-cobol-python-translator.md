# dishants0605/qwen2.5-cobol-python-translator

## Resumen

`dishants0605/qwen2.5-cobol-python-translator` es un ajuste fino de Qwen2.5-Coder-1.5B-Instruct, partiendo de la variante cuantizada a 4 bits publicada por Unsloth, especializado en traducir código COBOL heredado a Python idiomático. Lo publica el usuario dishants0605 bajo licencia Apache 2.0, con 1.543.714.304 parámetros (1,5 B) en formato safetensors y un repositorio de 3,1 GB. El problema que aborda es acotado y real: miles de millones de líneas COBOL siguen ejecutándose en banca, seguros y administración pública, y su migración manual es cara y propensa a errores.

Técnicamente es un transformer decoder-only denso de la familia Qwen2, afinado con QLoRA (rango 16, alpha 32) mediante Unsloth sobre una única GPU T4 en Google Colab y un dataset propio de pares COBOL-Python. El entrenamiento consta de solo 125 pasos y la pérdida descendió de 2,14 a 0,13. El propio autor lo describe como una ayuda de primera pasada, no como sustituto listo para producción, y no publica benchmarks formales.

Su interés es el de los modelos pequeños y verticales: 1,5 B de parámetros caben en GPUs de consumo, se pueden ejecutar en local y demuestran que un ajuste fino ligero sobre un modelo de código compacto puede cubrir una tarea de nicho. Con cero descargas y cero likes en el momento de la consulta, es un experimento reciente y sin validación externa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2); detalles de capas y cabezas no disponibles en la model card |
| Parametros totales | 1.543.714.304 (1,5 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card. El modelo base Qwen2.5-Coder-1.5B-Instruct declara 32.768 tokens nativos, pero el autor no confirma el contexto efectivo tras el fine-tuning |
| Tipos de cuantizacion | El repositorio solo publica pesos sin cuantizar (3,1 GB). No se ofrecen variantes GGUF, AWQ ni GPTQ. El entrenamiento se hizo con QLoRA de 4 bits sobre el base, pero los pesos publicados no están cuantizados |
| Idiomas soportados | en (inglés), según la model card y las etiquetas del repositorio. COBOL y Python son lenguajes de programación, no idiomas naturales |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/qwen2.5-coder-1.5b-instruct-bnb-4bit`, esto es, Qwen2.5-Coder-1.5B-Instruct cuantizado a 4 bits con bitsandbytes. Qwen2.5-Coder es la variante de código de la familia Qwen2, un transformer decoder-only con atención causal. La model card no detalla el número de capas, la dimensión oculta, el número de cabezas de atención ni el tamaño del vocabulario para este checkpoint concreto, por lo que esos datos quedan como no disponibles en esta ficha.

El ajuste se realizó con QLoRA de rango 16 y alpha 32 sobre Unsloth, en una T4 de Google Colab, con un dataset propio de pares COBOL-Python cuya composición, tamaño y procedencia no se documentan. El entrenamiento fue corto: 125 pasos, con una pérdida que pasó de 2,14 a 0,13. No se menciona uso de RLHF, DPO ni ninguna técnica de alineación adicional, ni innovaciones de decodificación especulativa o atención lineal. El ejemplo incluido en la model card es ilustrativo del enfoque: traduce `COMPUTE WS-TAX = WS-PRICE * WS-TAX-RATE` a Python usando `decimal.Decimal` en lugar de `float`, lo que sugiere que el dataset de entrenamiento conserva la semántica decimal del COBOL en los casos cubiertos.

## Capacidades

- Traducción de fragmentos COBOL a Python: el caso central para el que fue entrenado, incluyendo sentencias aritméticas, `MOVE` y otra sintaxis procedural básica.
- Preservación de precisión decimal: el ejemplo de la model card fuerza el uso de `decimal.Decimal`, relevante en dominios financieros donde el redondeo en coma flotante es inaceptable.
- Generación de texto conversacional: las etiquetas incluyen `conversational` y `text-generation`, heredadas de la naturaleza instruct del modelo base.
- Generación de código Python: capacidad heredada de Qwen2.5-Coder, aunque degradada respecto al base por el ajuste estrecho.
- Seguimiento de instrucciones en formato prompt-respuesta: la model card documenta un formato simple tipo "Translate this COBOL to Python: ... Python:".
- Idiomas: solo inglés declarado. No hay evidencia de soporte fiable de prompts en castellano.
- Tool calling / function calling: no se documenta soporte explícito en la model card; el base Qwen2.5-Coder-Instruct sí lo soporta, pero no se ha verificado que se conserve tras este fine-tuning.
- Capacidades de agente, razonamiento multi-paso, visión o audio: no disponibles.

## Casos de uso

- Migración de primera pasada en proyectos de modernización: el modelo convierte módulos COBOL en borradores de Python que un ingeniero revisa y corrige. Encaja porque automatiza la parte mecánica de la traducción y deja al humano la validación de la lógica de negocio.
- Documentación de código legado: alimentar párrafos COBOL y obtener equivalentes en Python legibles sirve para generar documentación técnica de sistemas de los que ya no queda personal con conocimiento.
- Generación de tests unitarios en Python: a partir del equivalente traducido, el desarrollador puede pedir al modelo la batería de pruebas, acelerando la cobertura de módulos migrados.
- Formación de equipos junior en sistemas mainframe: usar las traducciones como material didáctico para explicar qué hace cada párrafo COBOL a perfiles que solo conocen lenguajes modernos.
- Asistente local en el IDE para desarrolladores de mainframe: con 1,5 B de parámetros cabe en un portátil con GPU modesta, de modo que no hay que enviar código propietario a servicios externos.
- Auditoría de reglas de cálculo: al traducir rutinas aritméticas con `Decimal`, ayuda a verificar cómo se calculan impuestos, intereses o comisiones en sistemas antiguos.
- Preprocesamiento en pipelines de migración asistida: usar el modelo como primer eslabón de un flujo más amplio (traducción, revisión estática, ejecución de tests diferenciales) donde la salida pasa siempre por revisión humana.
- Prototipado rápido de APIs: convertir rutinas de cálculo COBOL en funciones Python invocables desde un microservicio, para validar el comportamiento antes de reescribir el sistema completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card lo indica de forma explícita ("No formal benchmark yet — community contributions welcome") y solo aporta la curva de pérdida de entrenamiento (2,14 a 0,13 en 125 pasos), que no es una métrica de calidad de traducción ni permite comparación con alternativas.

## Requisitos de hardware

- Inferencia en fp16: los pesos ocupan unos 3,1 GB, por lo que se necesitan aproximadamente 4 GB de VRAM contando caché de activaciones y KV.
- Inferencia en 8 bits: alrededor de 1,6 GB de pesos, viable en GPUs de 4 GB.
- Inferencia en 4 bits: alrededor de 1 GB de pesos, ejecutable incluso en CPU o iGPU con suficiente RAM del sistema.
- GPUs de consumo compatibles: cualquier RTX 3060 de 12 GB, RTX 4060, RTX 4070, RTX 4090, e incluso tarjetas de 6-8 GB si se cuantiza. El propio autor entrenó con una T4.
- GPUs de datacenter: A100, H100 o L40S no son necesarias; el modelo está muy por debajo de su capacidad.
- Opciones de despliegue: `transformers` de forma directa (es el método documentado en la model card), vLLM o TGI para servir en producción. Ollama y llama.cpp requieren convertir los pesos a GGUF, conversión que el autor no ha publicado.
- Latencia y throughput: no disponibles. Con 1,5 B de parámetros y secuencias cortas, la generación en una GPU de consumo debería ser fluida, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-cobol-python-translator | 1,5 B | No confirmado para este checkpoint; el base declara 32.768 tokens | Traduccion COBOL a Python | Apache 2.0 | Safetensors en HuggingFace, 0 descargas |
| Qwen2.5-Coder-1.5B-Instruct | 1,5 B | 32.768 tokens segun la ficha del modelo base | Codigo general, instrucciones | Apache 2.0 | Ampliamente disponible, tambien en GGUF |
| Qwen2.5-Coder-7B-Instruct | 7 B | 32.768 tokens segun la ficha del modelo base | Codigo general, instrucciones | Apache 2.0 | Ampliamente disponible, tambien en GGUF |
| DeepSeek-Coder-1.3B-Instruct | 1,3 B | No verificado en esta busqueda | Codigo general, instrucciones | Licencia propia de DeepSeek | Ampliamente disponible |

La ventaja del modelo frente a los base es la especialización en un dominio que ningún modelo general cubre bien; la desventaja es que no hay benchmarks que demuestren que esa especialización supere a un prompt bien construido sobre Qwen2.5-Coder-7B. Las cifras de contexto de los modelos comparados proceden de sus fichas oficiales y no de la información recopilada en esta búsqueda.

## Limitaciones y advertencias

- Dataset de entrenamiento pequeño y no documentado: se desconoce su tamaño, composición, procedencia y licencia, lo que impide evaluar sesgos o posibles problemas de derechos sobre el código de origen.
- Patrones COBOL complejos mal cubiertos: el autor advierte explícitamente de que `REDEFINES` y `OCCURS` pueden producir salidas imperfectas, algo crítico porque son construcciones habituales en sistemas reales.
- No es un sustituto listo para producción: la propia model card lo define como ayuda de primera pasada.
- Sin benchmarks: no hay evidencia cuantitativa de calidad de traducción, ni evaluación de corrección semántica frente al COBOL original.
- Riesgo de alucinación elevado: en traducción de código, una salida plausible pero semánticamente incorrecta es especialmente peligrosa porque compila y puede pasar revisiones superficiales. Toda salida debe validarse con tests diferenciales contra el sistema original.
- Solo inglés declarado: no hay garantía de que los prompts en castellano funcionen, aunque el contenido COBOL y Python sea en gran medida independiente del idioma natural.
- Capacidad limitada por tamaño: 1,5 B de parámetros restringen la longitud de programa que puede manejar en una sola pasada y la coherencia en módulos largos.
- Fine-tuning sobre un base de 4 bits: entrenar sobre bnb-4bit puede introducir una pérdida de calidad respecto a entrenar sobre los pesos en fp16.
- Licencia Apache 2.0: permite uso comercial y modificación sin restricciones sobre el modelo, pero no cubre la legalidad del dataset de entrenamiento ni el código COBOL de entrada que el usuario procese.
- Sin cuantizaciones publicadas: no hay GGUF oficial, lo que obliga a convertir manualmente para usarlo con llama.cpp u Ollama.
- Sin validación de la comunidad: 0 descargas y 0 likes implican que nadie ha reportado resultados independientes.
- No se documenta soporte de tool calling ni de agentes; no debe asumirse que el comportamiento instruct del base se conserva íntegro tras este ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dishants0605/qwen2.5-cobol-python-translator
- Repositorio GitHub del autor: https://github.com/dishantSasane/Cobol-Python-Fine-Tuning
- Modelo base en HuggingFace: https://huggingface.co/unsloth/qwen2.5-coder-1.5b-instruct-bnb-4bit
- Qwen2.5-Coder-1.5B en HuggingFace: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la información del repositorio de HuggingFace y de la model card. No se han localizado papers ni demos asociados.
