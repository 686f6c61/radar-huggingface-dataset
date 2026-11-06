# manuelgscom/askmdb-4b-GGUF

## Resumen

`askmdb-4b` es un ajuste completo (full fine-tune) de Qwen/Qwen3.5-4B, desarrollado por Manuel García Sanz, que convierte una pregunta en castellano o en inglés sobre una base de datos MongoDB en un único pipeline de `aggregate` de solo lectura, devuelto como un objeto JSON compacto con una explicación breve. El modelo recibe en el prompt una descripción compacta del esquema de la base de datos, por lo que puede operar sobre bases que nunca ha visto durante el entrenamiento.

Se distribuye en formato GGUF con cuantización Q4_K_M (imatrix) de 2.708,8 MB y está pensado como el modelo de GPU de la herramienta de línea de comandos `askmdb`, que lo ejecuta mediante llama.cpp con Vulkan. También es compatible con `llama-server` para integrarlo en cualquier otra aplicación, tanto en CPU como en GPU.

Su relevancia radica en la especialización: frente a modelos generalistas de mayor tamaño sin ajustar, este fine-tune de 4B alcanza un 89,6 % de acierto en el test público de 500 casos puntuado por ejecución, lo que lo sitúa como una opción práctica para tareas de NL2Query sobre MongoDB con requisitos de hardware modestos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-4B) |
| Parámetros totales | 4.205.751.296 (~4,2 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q4_K_M (imatrix); el repo incluye el archivo de 2.708,8 MB |
| Idiomas soportados | es, en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un ajuste completo de Qwen/Qwen3.5-4B, por lo que hereda la arquitectura transformer del modelo base. El autor no detalla en la información disponible la composición exacta del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO. Sí se indica que se entrenó con los mismos datos y el mismo contrato que `askmdb-0.8b`, lo que sugiere una metodología de fine-tuning supervisado orientada a la tarea específica de generación de pipelines de agregación de MongoDB.

La innovación principal no está en la arquitectura, sino en el contrato de la tarea: el modelo lee una descripción compacta del esquema en el prompt y produce un único pipeline de `aggregate` de solo lectura junto con una explicación. La cuantización GGUF Q4_K_M con imatrix está optimizada para el despliegue en llama.cpp, y la integración con Vulkan en la CLI `askmdb` permite aceleración por GPU en hardware de consumo.

## Capacidades

- Generación de pipelines de agregación de MongoDB (`aggregate`) de solo lectura a partir de lenguaje natural.
- Comprensión de esquemas de base de datos descritos en el prompt, incluyendo bases no vistas durante el entrenamiento.
- Generación de una explicación breve acompañando la consulta, en un objeto JSON compacto.
- Soporte bilingüe: castellano e inglés.
- Conversación multi-turno (etiqueta `conversational`).
- Integración con `llama-server` y con la CLI `askmdb`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- **Consultas ad hoc sobre MongoDB en producción**: un analista escribe en lenguaje natural qué quiere obtener y el modelo genera el pipeline de agregación listo para ejecutar, reduciendo el tiempo de escritura de consultas complejas con múltiples etapas.
- **Herramienta de CLI offline para equipos de datos**: integrado en `askmdb`, permite consultar bases de datos sin conexión a servicios externos, con GPU Vulkan y 1,34 s por pregunta en caliente y 3,3 GiB de VRAM.
- **Asistentes internos de exploración de datos**: al leer el esquema desde el prompt, el modelo puede servir para múltiples bases de datos distintas sin reentrenamiento, útil en entornos con muchos esquemas cambiantes.
- **Generación de consultas de solo lectura en paneles de BI**: el contrato de salida restringido a `aggregate` de lectura encaja en flujos donde se necesita garantizar que no se ejecuten operaciones de escritura.
- **Soporte a desarrolladores noveles en MongoDB**: el modelo explica brevemente la consulta generada, lo que sirve como material de aprendizaje sobre etapas de agregación.
- **Automatización de informes periódicos**: pipelines generados a partir de preguntas recurrentes en castellano o inglés que luego se parametrizan y programan.
- **Integración vía `llama-server` en aplicaciones propias**: cualquier aplicación que hable con la API de llama.cpp puede usar el modelo para NL2Query sin depender de la CLI.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Modelo | Test accuracy (por ejecución) | Casos |
|---|---|---|
| **askmdb-4b** | **89,6 %** (448/500) | 500 |
| Qwen3.5-9B (sin fine-tune) | 47,8 % | 500 |
| Gemma 4 E4B-it (sin fine-tune) | 45,4 % | 500 |

El test utilizado es el dataset público `manuelgscom/askmdb-test`, con 500 casos puntuados ejecutando cada consulta generada.

## Requisitos de hardware

- **VRAM estimada**: 3,3 GiB en la CLI `askmdb` con el modelo Q4_K_M en GPU.
- **GPU recomendadas**: cualquier GPU dedicada con al menos 4 GiB de VRAM libre para usar el modelo en GPU dentro de `askmdb`; con 8 GiB o más es la opción por defecto frente al modelo de 9B.
- **GPU de consumo**: cabe en GPU de consumo con 4 GiB o más de VRAM libre; también puede ejecutarse en CPU mediante llama.cpp.
- **Opciones de despliegue**: llama.cpp (con Vulkan), `llama-server`, CLI `askmdb`.
- **Latencia y throughput**: 1,34 s por pregunta en caliente en GPU según el autor; no se dispone de datos de throughput en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Base | GGUF Q4_K_M | Test accuracy | Uso en CLI `askmdb` | Licencia |
|---|---|---:|---:|---|---|
| **askmdb-4b** | Qwen3.5-4B | 2.708,8 MB | 89,6 % | GPU, ≥ 4 GiB VRAM libre | apache-2.0 |
| askmdb-0.8b | Qwen3.5-0.8B | 529,3 MB | 83,6 % | CPU (por defecto y fallback) | no disponible |
| askmdb-2b | Qwen3.5-2B | 1.274,4 MB | 86,8 % | no usado (solo llama-server) | no disponible |
| askmdb-9b | Qwen3.5-9B | 5.629,1 MB | 91,6 % | GPU, ≥ 8 GiB VRAM libre, opcional | no disponible |

Los cuatro modelos comparten tarea, datos, contrato y prompt, diferenciándose en tamaño y precisión. Frente a Qwen3.5-9B y Gemma 4 E4B-it sin ajustar, el fine-tune de 4B obtiene una ventaja de más de 40 puntos porcentuales en el test de la tarea.

## Limitaciones y advertencias

- **Seguridad no delegada al modelo**: el modelo no decide si una consulta es segura; dentro de `askmdb` lo hace un verificador determinista que solo ejecuta pipelines de lectura. Fuera de `askmdb` no hay verificador, por lo que debe revisarse siempre la consulta y conectarse con un usuario de solo lectura.
- **Riesgo de alucinación**: como todo modelo generativo, puede producir pipelines sintácticamente válidos pero semánticamente incorrectos o referencias a campos inexistentes.
- **Sesgos**: no se documentan sesgos específicos en la información disponible.
- **Limitaciones de idioma**: solo soporta castellano e inglés de forma declarada.
- **Contexto**: no se especifica la longitud máxima de contexto, lo que limita la planificación para esquemas muy extensos.
- **Licencia**: Apache-2.0 permite uso comercial, pero debe verificarse el cumplimiento de la licencia del modelo base Qwen/Qwen3.5-4B.
- **Dependencia del esquema en el prompt**: la calidad depende de que la descripción del esquema sea correcta y suficientemente compacta.
- **Benchmark no verificado**: el resultado del 89,6 % está declarado por el autor y marcado como no verificado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/manuelgscom/askmdb-4b-GGUF)
- [Modelo base Qwen/Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)
- [Dataset de test askmdb-test](https://huggingface.co/datasets/manuelgscom/askmdb-test)
- [Repositorio de la CLI askmdb](https://github.com/manuelgscom/askmdb)
- [Colección askmdb en Hugging Face](https://huggingface.co/collections/manuelgscom/askmdb-6ae398e10b4817ed0e7431f1)
- [askmdb-0.8b-GGUF](https://huggingface.co/manuelgscom/askmdb-0.8b-GGUF)
- [askmdb-2b-GGUF](https://huggingface.co/manuelgscom/askmdb-2b-GGUF)
- [askmdb-9b-GGUF](https://huggingface.co/manuelgscom/askmdb-9b-GGUF)
- [Sitio web del autor](https://manuelgs.com)
