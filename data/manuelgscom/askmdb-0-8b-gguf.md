# manuelgscom/askmdb-0.8b-GGUF

## Resumen

`askmdb-0.8b` es un ajuste completo (full fine-tune) del modelo base Qwen/Qwen3.5-0.8B, publicado por Manuel García Sanz (manuelgscom), que convierte una pregunta en castellano o en inglés sobre una base de datos MongoDB en un único pipeline de `aggregate` de solo lectura, devuelto como un objeto JSON compacto con una explicación breve. El modelo lee en el prompt una descripción compacta del esquema de la base de datos, lo que le permite operar sobre bases que nunca ha visto durante el entrenamiento.

Se distribuye exclusivamente en formato GGUF cuantizado Q4_K_M con imatrix (529,3 MB), pensado para ejecutarse en CPU mediante llama.cpp dentro de la CLI `askmdb`, una herramienta de línea de comandos offline que muestrea el esquema, ejecuta el modelo en local, valida el pipeline con un verificador determinista de solo lectura y solo entonces lo ejecuta. El modelo es el predeterminado y la opción de respaldo de la familia `askmdb`, que incluye también variantes de 2B, 4B y 9B.

Con 752.393.024 parámetros totales y licencia Apache-2.0, el modelo reporta una precisión del 83,6 % (418/500) en el test público `manuelgscom/askmdb-test`, puntuado por ejecución, frente al 47,8 % de Qwen3.5-9B sin ajustar y el 45,4 % de Gemma 4 E4B-it sin ajustar. Es relevante por su relación tamaño/rendimiento en una tarea vertical concreta (NL2Query sobre MongoDB) y por su despliegue en CPU sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-0.8B); detalles internos no disponibles |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (imatrix); otras cuantizaciones no disponibles |
| Idiomas soportados | es, en |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M, 529,3 MB); safetensors no disponible en el repo |

## Arquitectura y entrenamiento

El modelo es un full fine-tune de Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8B parámetros. La información proporcionada no detalla la composición del dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas de RLHF o DPO. El ajuste está orientado a una tarea específica: dado un esquema de MongoDB compacto en el prompt y una pregunta en español o inglés, generar un pipeline `aggregate` de solo lectura más una explicación breve, en formato JSON.

La innovación principal no reside en la arquitectura sino en el contrato de salida y el ecosistema de despliegue: el modelo se integra en la CLI `askmdb`, que combina muestreo de esquema, inferencia local vía llama.cpp en un único binario nativo y un verificador determinista de solo lectura que inspecciona el pipeline antes de ejecutarlo. El modelo en sí no decide la seguridad; esa responsabilidad recae en el verificador externo. El mismo contrato, datos y prompt se reutilizan en las cuatro tallas de la familia (0.8B, 2B, 4B, 9B).

## Capacidades

- Generación de consultas MongoDB: transforma preguntas en lenguaje natural (es/en) en un único pipeline `aggregate` de solo lectura.
- Generalización a esquemas no vistos: lee una descripción compacta del esquema en el prompt, por lo que funciona sobre bases nuevas.
- Salida estructurada: devuelve un objeto JSON pequeño con el pipeline y una explicación breve.
- Bilingüe: soporta castellano e inglés.
- Integración con CLI offline: diseñado para ejecutarse vía llama.cpp dentro de `askmdb`, sin conexión a servicios externos.
- Modo conversacional: la etiqueta `conversational` sugiere soporte de interacción por turnos, aunque los detalles no están disponibles.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible; el diseño apunta a una única consulta por petición.
- Vision, audio o thinking mode: no disponible.

## Casos de uso

- Consultas ad hoc sobre MongoDB en producción: un analista escribe "¿cuántos pedidos se cancelaron ayer por región?" y el modelo genera el pipeline `aggregate` correspondiente, que `askmdb` valida y ejecuta con un usuario de solo lectura.
- Asistentes internos para equipos de datos: integrado en la CLI, permite a perfiles no técnicos obtener agregaciones sin escribir código, con la ventaja de que todo ocurre en local y sin enviar datos a la nube.
- Automatización de informes periódicos: el modelo puede generar pipelines para métricas recurrentes a partir de preguntas en lenguaje natural, reduciendo el tiempo de construcción manual de consultas.
- Entornos con requisitos de privacidad: al ejecutarse en CPU con llama.cpp y sin conexión, encaja en escenarios donde el esquema y los datos no pueden salir de la infraestructura propia.
- Educación y formación: sirve para enseñar el lenguaje de agregación de MongoDB, mostrando el pipeline generado junto con una explicación en lenguaje natural.
- Prototipado rápido de APIs de consulta: el contrato JSON de salida facilita envolver el modelo en un servicio interno que traduzca preguntas de usuario en pipelines validados antes de su ejecución.
- Despliegue en hardware modesto: al ocupar 529,3 MB en Q4_K_M y ejecutarse en CPU, es adecuado para portátiles, servidores sin GPU o entornos edge donde no hay VRAM dedicada.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo en la model card (no verificados de forma independiente):

| Modelo | Test `askmdb-test` (500 casos, precisión por ejecución) | Notas |
|---|---:|---|
| **askmdb-0.8b** | **83,6 %** (418/500) | Este modelo, Q4_K_M |
| askmdb-2b | 86,8 % | Qwen3.5-2B, Q4_K_M |
| askmdb-4b | 89,6 % | Qwen3.5-4B, Q4_K_M |
| askmdb-9b | 91,6 % | Qwen3.5-9B, Q4_K_M |
| Qwen3.5-9B (sin ajustar) | 47,8 % | Referencia del autor |
| Gemma 4 E4B-it (sin ajustar) | 45,4 % | Referencia del autor |

Latencia reportada por el autor: 1,18 s de mediana por pregunta con el esquema en caché, en un escritorio de referencia con CPU (dentro de la CLI `askmdb`). No se han publicado resultados de benchmarks en MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el GGUF Q4_K_M ocupa 529,3 MB en disco y puede residir íntegramente en RAM.
- GPU recomendadas: no aplicable para este tamaño; el autor indica que en máquinas con GPU dedicada adecuada se pueden usar `askmdb-4b` (≥ 4 GiB de VRAM libre) o `askmdb-9b` (≥ 8 GiB de VRAM libre).
- Cabe en GPU consumer: sí, en cualquier GPU con al menos ~1 GiB de VRAM libre, aunque su uso previsto es CPU.
- Opciones de despliegue: llama.cpp (vía la CLI `askmdb`, binario nativo), llama-server; otras opciones (vLLM, TGI, Ollama) no están documentadas en la información proporcionada.
- Latencia y throughput: 1,18 s de mediana por pregunta con esquema en caché en un escritorio de referencia con CPU; throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato / cuantización | Test `askmdb-test` | Contexto | Licencia | Disponibilidad |
|---|---|---:|---|---:|---|---|
| **askmdb-0.8b** | 0,75B | GGUF Q4_K_M (529,3 MB) | 83,6 % | no disponible | Apache-2.0 | Hugging Face, CLI `askmdb` (CPU por defecto) |
| askmdb-2b | no disponible | GGUF Q4_K_M (1.274,4 MB) | 86,8 % | no disponible | no disponible | Hugging Face (solo llama-server) |
| askmdb-4b | no disponible | GGUF Q4_K_M (2.708,8 MB) | 89,6 % | no disponible | no disponible | Hugging Face (GPU ≥ 4 GiB) |
| askmdb-9b | no disponible | GGUF Q4_K_M (5.629,1 MB) | 91,6 % | no disponible | no disponible | Hugging Face (GPU ≥ 8 GiB) |
| Qwen3.5-9B (sin ajustar) | 9B (aprox.) | no disponible | 47,8 % | no disponible | no disponible | Hugging Face |
| Gemma 4 E4B-it (sin ajustar) | no disponible | no disponible | 45,4 % | no disponible | no disponible | Hugging Face |

La comparativa dentro de la familia `askmdb` muestra un trade-off claro entre tamaño y precisión: cada incremento de talla aporta entre 2 y 3 puntos porcentuales de precisión, a costa de multiplicar el tamaño del GGUF. Frente a modelos generalistas sin ajustar, el fine-tune específico ofrece una ventaja sustancial en esta tarea vertical.

## Limitaciones y advertencias

- El modelo no decide la seguridad: fuera de la CLI `askmdb` no hay verificador determinista, por lo que debe revisarse siempre la consulta generada y conectarse con un usuario de solo lectura.
- Riesgo de alucinación: puede generar pipelines sintácticamente válidos pero semánticamente incorrectos o referencias a campos inexistentes; el verificador de `askmdb` mitiga el riesgo de escritura, no el de resultados erróneos.
- Alcance limitado a MongoDB: no está entrenado para SQL ni otros motores; su uso fuera de este dominio no está documentado.
- Idiomas: solo español e inglés; otros idiomas no están soportados oficialmente.
- Longitud de contexto: no disponible; preguntas o esquemas muy extensos podrían exceder la ventana y degradar la calidad.
- Sesgos: no se han documentado sesgos específicos en la información proporcionada.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar los términos del modelo base Qwen/Qwen3.5-0.8B y las dependencias de la CLI.
- Precisión del 83,6 %: implica que aproximadamente 1 de cada 6 preguntas del test no produce el resultado esperado por ejecución; en producción conviene monitorizar y validar los pipelines generados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/manuelgscom/askmdb-0.8b-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de test: https://huggingface.co/datasets/manuelgscom/askmdb-test
- Colección de la familia askmdb: https://huggingface.co/collections/manuelgscom/askmdb-6ae398e10b4817ed0e7431f1
- Código fuente de la CLI askmdb: https://github.com/manuelgscom/askmdb
- Sitio web del autor: https://manuelgs.com/en/askmdb/
- GGUF Q4_K_M (descarga directa): https://huggingface.co/manuelgscom/askmdb-0.8b-GGUF/resolve/main/askmdb-0.8b-1.0.0-Q4_K_M.gguf?download=true
- Licencia: https://huggingface.co/manuelgscom/askmdb-0.8b-GGUF/blob/main/LICENSE
- Variante 2B: https://huggingface.co/manuelgscom/askmdb-2b-GGUF
- Variante 4B: https://huggingface.co/manuelgscom/askmdb-4b-GGUF
- Variante 9B: https://huggingface.co/manuelgscom/askmdb-9b-GGUF
