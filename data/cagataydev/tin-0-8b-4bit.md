# cagataydev/tin-0.8b-4bit

## Resumen
Tin 0.8B · MLX 4-bit es una cuantización de 4 bits, en formato MLX, del modelo `cagataydev/tin-0.8b`, un modelo pequeño especializado en el lenguaje de programación tipado Tin, en el que agentes y herramientas forman parte de la propia sintaxis. Lo desarrolla Çağatay Çalı (cagataydev) y está afinado a partir de `cagataydev/loopl-0.8b`, que a su vez deriva de Qwen3.5-0.8B. El modelo resuelve un problema muy concreto: generar programas Tin, corregirlos a partir de los errores del compilador y ejecutar bucles de verificación y corrección mediante las herramientas `tin_check` y `tin_run`.

Con 852.985.920 parámetros reales (según safetensors) y un repositorio de 0,6 GB, está pensado para inferencia en dispositivo ("on-device"), incluyendo despliegue en teléfono. La cuantización a 4 bits en MLX lo hace adecuado para entornos Apple Silicon con memoria limitada. Su relevancia actual reside en el enfoque: no es un modelo generalista, sino un especialista de dominio que integra el compilador real como mecanismo de validación, lo que permite medir su rendimiento de forma objetiva con el propio compilador de Tin.

La licencia es Apache-2.0, heredada del modelo base Qwen3.5, lo que facilita su uso comercial. Los idiomas declarados son inglés y turco, y el pipeline es image-text-to-text, aunque la model card no detalla capacidades de visión más allá de esa etiqueta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5-0.8B vía loopl-0.8b), cuantizado en MLX a 4 bits |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX); el modelo base bf16 está en `cagataydev/tin-0.8b` |
| Idiomas soportados | en, tr |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), librería `mlx` |

## Arquitectura y entrenamiento
La información disponible indica que es un transformer derivado de Qwen3.5-0.8B, pasado por un ajuste intermedio (`loopl-0.8b`) y posteriormente afinado para el dominio Tin. El repositorio es una cuantización de 4 bits en MLX del modelo bf16 `cagataydev/tin-0.8b`, que se ofrece para ajuste adicional. No se detallan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

La innovación técnica destacable es la integración del compilador real de Tin como mecanismo de evaluación y como herramienta invocable: el modelo aprende a escribir programas, interpretar errores del compilador y ejecutar un bucle de comprobación y corrección con `tin_check` / `tin_run`. La evaluación se realiza con el compilador auténtico sobre un conjunto reservado, lo que reduce la subjetividad de las métricas.

## Capacidades
- Generación de programas en el lenguaje Tin, un lenguaje tipado con agentes y herramientas en la sintaxis.
- Corrección de programas a partir de errores del compilador (puntuación de 88,8 en "Fixes Tin").
- Corrección de errores apilados o encadenados (89 en "Fixes stacked bugs").
- Bucle de agente nativo con herramientas `tin_check` y `tin_run` (32,5 en "Agent loop · native").
- Soporte de tool calling / function calling en el contexto del lenguaje Tin.
- Conocimiento del dominio Tin (50,1 en "Tin knowledge").
- Capacidades multilingües limitadas a inglés y turco.
- Etiqueta de pipeline image-text-to-text, aunque no se detallan capacidades de visión en la model card.

## Casos de uso
- Generación asistida de programas Tin: el modelo produce código Tin que el desarrollador valida con el compilador real; es adecuado porque ha sido entrenado específicamente con la sintaxis y las convenciones del lenguaje.
- Corrección automática en IDE: integrado en un editor, recibe el error del compilador y propone una corrección; su puntuación de 88,8 en "Fixes Tin" lo hace útil para este bucle cerrado.
- Agentes locales en dispositivo: al ejecutarse con MLX en Apple Silicon y ocupar 0,6 GB, puede desplegarse en portátiles o teléfonos para tareas de agente con herramientas Tin.
- Pipelines de CI para Tin: el modelo puede generar y comprobar programas en un paso automatizado usando `tin_check` y `tin_run`, reduciendo la intervención manual en tareas repetitivas.
- Educación y prototipado del lenguaje Tin: sirve para explorar la sintaxis y el modelo de agentes del lenguaje con retroalimentación inmediata del compilador.
- Evaluación de herramientas de compilador: como el modelo invoca el compilador real, es útil para probar y depurar flujos de tool calling en entornos de investigación.

## Benchmarks y rendimiento

| Prueba | Tin 0.8B | Qwen3.5 0.8B |
|---|---:|---:|
| Dice ser Tin | 93,8 | 60,4 |
| Conocimiento de Tin | 50,1 | 15,1 |
| Escribe Tin | 37,5 | 0 |
| Corrige Tin | 88,8 | 30,8 |
| Corrige errores apilados | 89 | 7,3 |
| Bucle de agente nativo | 32,5 | 0 |

Porcentaje de aprobados sobre un conjunto reservado, evaluado con el compilador real de Tin. "Escribe Tin" significa que el programa compila y produce exactamente la salida esperada al primer intento.

Comparativa interna de tamaños del mismo autor:

| Tamaño | Escribe Tin | Corrige Tin | Bucle de agente |
|---|---:|---:|---:|
| 0.8B | 37,5 | 88,8 | 32,5 |
| 2B | 54,1 | 92,5 | 55 |
| 4B | 68,3 | 97,2 | 65 |

## Requisitos de hardware
- VRAM estimada: el repositorio ocupa 0,6 GB en 4 bits, por lo que la inferencia requiere aproximadamente esa cantidad de memoria unificada o VRAM, más el overhead del runtime MLX.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y superiores) por el uso de MLX; no se documenta soporte para GPU NVIDIA en esta cuantización.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada; también en configuraciones de memoria muy limitada gracias a los 0,6 GB de pesos.
- Opciones de despliegue: `mlx-lm` (comando `mlx_lm.generate`) y la CLI de Tin (`tin model pull tin:0.8b`). No se documentan vLLM, llama.cpp, Ollama ni TGI para esta cuantización MLX.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Escribe Tin | Corrige Tin | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| Tin 0.8B (este) | 852.985.920 | no disponible | 37,5 | 88,8 | apache-2.0 | MLX 4-bit y bf16 |
| Tin 2B | no disponible | no disponible | 54,1 | 92,5 | no disponible | MLX 4-bit |
| Tin 4B | no disponible | no disponible | 68,3 | 97,2 | no disponible | MLX 4-bit |
| Qwen3.5 0.8B | no disponible | no disponible | 0 | 30,8 | no disponible | no disponible |

## Limitaciones y advertencias
- Alrededor del 62 % de los primeros intentos fallan `tin check` o imprimen un resultado incorrecto; es obligatorio ejecutar el compilador.
- El conocimiento de Tin corresponde al commit de entrenamiento; pueden faltar funciones estándar más recientes.
- Modelo pequeño: detalles como nombres de flags y códigos de error suelen ser incorrectos.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: presente, especialmente en detalles sintácticos y de API; mitigado parcialmente por el bucle con el compilador.
- Limitaciones de idioma: solo inglés y turco declarados.
- Restricciones de licencia: Apache-2.0, permite uso comercial; se debe conservar el aviso de licencia y atribución.
- Caveat de producción: la cuantización MLX 4-bit limita el despliegue a entornos Apple Silicon; para otros entornos habría que usar el modelo base bf16 o convertirlo.
- La etiqueta image-text-to-text no está respaldada por detalles de capacidades de visión en la model card; conviene verificar antes de asumir entrada de imágenes.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/cagataydev/tin-0.8b-4bit
- Modelo base bf16: https://huggingface.co/cagataydev/tin-0.8b
- Modelo intermedio: https://huggingface.co/cagataydev/loopl-0.8b
- Tin 2B 4-bit: https://huggingface.co/cagataydev/tin-2b-v3-4bit
- Tin 4B 4-bit: https://huggingface.co/cagataydev/tin-4b-4bit
- Sitio del lenguaje Tin: https://tin.ad
- Instalación de Tin: https://tin.ad/install.sh
- Perfil del autor en GitHub: https://github.com/cagataycali
