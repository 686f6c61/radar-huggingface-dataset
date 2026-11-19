# cagataydev/tin-2b-v3-4bit

## Resumen

Tin 2B · MLX 4-bit es una cuantización de 4 bits del modelo `cagataydev/tin-2b-v3`, un modelo de lenguaje de 2.213.241.664 parámetros afinado a partir de Qwen3.5-2B (vía `cagataydev/loopl-2b`) y especializado en Tin, un lenguaje de programación tipado en el que los agentes y las herramientas forman parte de la sintaxis. Lo desarrolla Çağatay Çalı (cagataydev) y su propósito es escribir programas Tin, corregirlos a partir de los errores del compilador y ejecutar un bucle de comprobación y corrección mediante las herramientas `tin_check` y `tin_run`.

La relevancia del modelo reside en su orientación explícita a la ejecución en dispositivo (on-device) y a flujos de agentes con tool calling: el repositorio ocupa 1,7 GB, se distribuye en formato MLX safetensors de 4 bits y está pensado para ejecutarse en hardware Apple Silicon mediante `mlx-lm`. El pipeline declarado es image-text-to-text, aunque la model card se centra en generación de código y agentes.

La ficha se basa exclusivamente en la información del repositorio de Hugging Face y de la model card. Muchos datos técnicos (longitud de contexto, composición del dataset de entrenamiento, detalles de RLHF/DPO, benchmarks estándar) no están publicados y se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-2B; detalles no disponibles) |
| Parametros totales | 2.213.241.664 |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits (esta versión); pesos bf16 disponibles en `cagataydev/tin-2b-v3` |
| Idiomas soportados | Inglés (en), turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), 4 bits; repositorio de 1,7 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B a través de `cagataydev/loopl-2b` y se afina posteriormente para el lenguaje Tin. La model card no detalla la arquitectura interna más allá de la base Qwen3.5, por lo que se desconoce si incorpora innovaciones como atención lineal, decodificación especulativa o mecanismos híbridos. La versión publicada aquí es una cuantización de 4 bits en formato MLX del modelo bf16 `cagataydev/tin-2b-v3`, que es el que se recomienda para ajuste fino adicional.

No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. La especialización se orienta a tres tareas concretas: escribir programas Tin que compilen y produzcan la salida esperada, corregir programas a partir de los errores del compilador y operar un bucle de agente con llamadas a herramientas (`tin_check` / `tin_run`). El autor publica una familia completa (0.8B, 2B y 4B) con el mismo objetivo.

## Capacidades

- Generación de código en Tin, el lenguaje tipado con agentes y herramientas integrados en la sintaxis.
- Corrección iterativa de programas a partir de los mensajes de error del compilador Tin.
- Bucle de agente nativo con llamadas a herramientas `tin_check` y `tin_run` (comprobación y ejecución).
- Tool calling / function calling orientado al ecosistema Tin.
- Razonamiento multi-paso acotado al ciclo de comprobación y corrección.
- Capacidades multilingües limitadas a inglés y turco.
- Pipeline declarado image-text-to-text (capacidad de visión según metadatos; no detallada en la model card).
- Ejecución on-device mediante MLX en hardware Apple Silicon.

## Casos de uso

- Generación de programas Tin en el primer intento: el modelo escribe código que compila y produce la salida esperada en aproximadamente el 54,1 % de los casos de prueba, útil como primer borrador en un flujo con verificación posterior por el compilador.
- Corrección automática de errores de compilación: con una tasa de éxito del 92,5 % en la tarea de "fixes Tin", encaja en un pipeline que recibe la salida del compilador y regenera el programa hasta que compila.
- Corrección de errores apilados: con un 90,2 % en "fixes stacked bugs", es adecuado para depurar programas con varios fallos encadenados que un modelo genérico resolvería peor.
- Agentes on-device en Apple Silicon: el formato MLX de 4 bits y el tamaño de 1,7 GB permiten desplegar el bucle de agente en un portátil o estación Mac sin GPU dedicada.
- Asistente de desarrollo integrado en el ecosistema Tin: el comando `tin model pull tin:2b` permite que cualquier agente Tin sin línea `model:` use este modelo por defecto.
- Automatización de tareas de edición de ficheros con herramientas: el ejemplo de la model card (`guarded tool fn deleteFile`) muestra el patrón de funciones de herramienta con guardas, aplicable a scripts de mantenimiento.
- Evaluación y prototipado de pipelines de agentes: al ser un modelo pequeño y con licencia Apache-2.0, sirve para iterar rápidamente sobre flujos de tool calling antes de escalar a los tamaños 4B.

## Benchmarks y rendimiento

Los únicos datos publicados son las pruebas específicas de Tin del autor, evaluadas contra el compilador real sobre un conjunto reservado (porcentaje de aprobados):

| Prueba | Tin 2B | Qwen3.5 2B |
|---|---:|---:|
| Dice que es Tin | 93,8 | 56,2 |
| Conocimiento de Tin | 63,1 | 22,7 |
| Escribe Tin (compila y salida correcta al primer intento) | 54,1 | 5 |
| Corrige Tin | 92,5 | 63,6 |
| Corrige errores apilados | 90,2 | 24,4 |
| Bucle de agente nativo | 55 | 6,2 |

Comparativa dentro de la familia Tin (mismas pruebas):

| Tamaño | Escribe Tin | Corrige Tin | Bucle de agente | Build para móvil |
|---|---:|---:|---:|---|
| 0.8B | 37,5 | 88,8 | 32,5 | tin-0.8b-4bit |
| 2B | 54,1 | 92,5 | 55 | tin-2b-v3-4bit |
| 4B | 68,3 | 97,2 | 65 | tin-4b-4bit |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 1,7 GB en 4 bits, por lo que la inferencia requiere del orden de 2 GB de memoria unificada o VRAM, más el overhead del runtime.
- Hardware objetivo: Apple Silicon (MLX). No se documenta soporte CUDA en esta versión.
- GPU dedicadas (A100, H100, RTX 4090): no se especifican requisitos ni rendimiento; el formato MLX está orientado a chips Apple.
- Cabe en hardware de consumo: sí, en equipos Mac con memoria unificada suficiente (previsiblemente desde 8 GB).
- Despliegue: `mlx-lm` (`mlx_lm.generate`) y el CLI de Tin (`tin model pull tin:2b`). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---:|---|---|---|---|
| Tin 2B v3 (este) | 2,21B | No disponible | Tin, tool calling, agentes | Apache-2.0 | MLX 4-bit / safetensors |
| Qwen3.5 2B (base) | ~2B | No disponible | Propósito general | Apache-2.0 (según la card) | No disponible |
| Tin 0.8B 4-bit | ~0,8B | No disponible | Tin, on-device | Apache-2.0 | MLX 4-bit |
| Tin 4B 4-bit | ~4B | No disponible | Tin, on-device | Apache-2.0 | MLX 4-bit |

Frente a Qwen3.5 2B, el modelo afinado mejora de forma marcada en las pruebas específicas de Tin (por ejemplo, 54,1 frente a 5 en "escribe Tin" y 55 frente a 6,2 en bucle de agente). Frente a los otros tamaños de la familia, el 2B ofrece un equilibrio entre calidad (54,1 / 92,5 / 55) y huella de 1,7 GB, mientras que el 4B sube a 68,3 / 97,2 / 65.

## Limitaciones y advertencias

- Alrededor del 46 % de los primeros intentos fallan `tin check` o imprimen una salida incorrecta; es obligatorio ejecutar siempre el compilador.
- El conocimiento de Tin corresponde al commit de entrenamiento; funciones estándar más recientes pueden faltar.
- Modelo pequeño: nombres de flags y códigos de error suelen ser incorrectos.
- Idiomas limitados a inglés y turco; no se garantiza un comportamiento correcto en castellano.
- Longitud de contexto no documentada, lo que dificulta planificar flujos con entradas largas.
- No se han publicado evaluaciones de sesgo ni de riesgo de alucinación fuera del dominio Tin.
- La licencia Apache-2.0 permite uso comercial, pero se hereda cualquier restricción de la base Qwen3.5; conviene verificar la licencia del modelo base.
- El formato MLX limita el despliegue a entornos Apple Silicon; para otros entornos habría que usar los pesos bf16 o reconvertir.
- Repositorio con muy poca tracción (3 descargas, 0 likes en el momento de la consulta): no hay validación comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cagataydev/tin-2b-v3-4bit
- Modelo base bf16: https://huggingface.co/cagataydev/tin-2b-v3
- Modelo previo (Loopl 2B): https://huggingface.co/cagataydev/loopl-2b
- Versión 0.8B 4-bit: https://huggingface.co/cagataydev/tin-0.8b-4bit
- Versión 4B 4-bit: https://huggingface.co/cagataydev/tin-4b-4bit
- Sitio del lenguaje Tin: https://tin.ad
- Instalador del CLI de Tin: https://tin.ad/install.sh
- Perfil del autor en GitHub: https://github.com/cagataycali
