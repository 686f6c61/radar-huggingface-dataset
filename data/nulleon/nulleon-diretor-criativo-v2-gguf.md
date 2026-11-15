# nulleon/nulleon-diretor-criativo-v2-GGUF

## Resumen

Nulleon Diretor Criativo v2 es un ajuste fino mediante LoRA del modelo Qwen2.5-7B-Instruct, orientado a tareas de dirección creativa y de fotografía para creadores de contenido con IA en portugués de Brasil. Lo desarrolla el autor independiente `nulleon` y se distribuye en formato GGUF Q4_K_M, pensado para su ejecución local con Ollama. Su función es cubrir el flujo completo de producción creativa publicitaria: guiones de UGC, spots de televisión, ganchos, storyboards, dirección de fotografía con especificación de lentes en milímetros y temperatura de color en kelvin, subtítulos, llamadas a la acción, carruseles, briefs y planes de contenido.

El modelo parte de una arquitectura transformer densa de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones), con una ventana de contexto heredada de Qwen2.5-7B-Instruct. El ajuste se realizó con LoRA de rango 16 en bf16 durante dos épocas sobre 4.490 ejemplos sintéticos de entrenamiento y 501 de validación, generados con Claude Opus 5.5 a partir de una taxonomía de 25 tareas y 80 temas. El entrenamiento completo se ejecutó en una única NVIDIA B200 en 12,4 minutos.

Su relevancia actual es acotada pero concreta: demuestra un patrón de especialización vertical sobre un modelo abierto de 7B con un coste de entrenamiento mínimo, y ofrece una alternativa local y con licencia Apache-2.0 frente a APIs propietarias para equipos de marketing que necesiten generar material creativo estructurado sin enviar datos a terceros. La model card documenta una comparación controlada contra el modelo base con 10 peticiones y 2 semillas por petición, lo que permite evaluar la mejora de forma acotada pero verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | GGUF Q4_K_M (unico publicado en el repo) |
| Idiomas soportados | Portugues (pt), segun la model card y los metadatos |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repo de 4,7 GB); adaptador LoRA sobre safetensors del modelo base |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-7B-Instruct sin modificaciones estructurales: un transformer decoder-only denso de 7,6 mil millones de parámetros. El ajuste se aplica como adaptador LoRA con rango 16 en precisión bf16, durante 2 épocas, con la pérdida calculada únicamente sobre los tokens de respuesta (sin incluir el prompt). El resultado se empaqueta en GGUF Q4_K_M para inferencia local.

Los datos de entrenamiento son 4.490 ejemplos sintéticos y 501 de validación, generados por Claude Opus 5.5 a partir de una taxonomía de 25 tareas y 80 temas, y filtrados con reglas explícitas: ausencia de datos inventados, ausencia de adjetivos vacíos y coherencia entre la duración solicitada y la suma de tiempos de plano. La validación emplea productos completos no vistos durante el entrenamiento y excluye cualquier referencia a obras, franquicias, personajes o estudios existentes. El entrenamiento se ejecutó en 1× NVIDIA B200 con un tiempo total de 12,4 minutos. La pérdida de validación fue de 1,108 en la época 1 y 1,070 en la época 2. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de guiones para contenido generado por usuarios (UGC) y spots publicitarios (TVC).
- Creación de ganchos, storyboards, teasers, tráilers y manifiestos de marca.
- Dirección de fotografía con especificación técnica: distancia focal en milímetros, temperatura de color en kelvin y movimiento de cámara.
- Generación de subtítulos, llamadas a la acción y copy para carruseles.
- Redacción de prompts de vídeo e imagen en el formato MCSLA.
- Elaboración de briefs y planes de contenido.
- Guiones de cartoon 2D y escenas de anime original.
- Conversación multi-turno (pipeline `text-generation`, etiqueta `conversational`).
- Restricción entrenada para no inventar datos de venta, precios, teléfonos, sitios web, cuentas o nombres de canales.
- No soporta visión, audio ni lectura de imagen o vídeo.
- No se documenta soporte de tool calling ni de function calling.

## Casos de uso

- Producción de guiones UGC para marcas: el modelo genera el guion completo con gancho, desarrollo, subtítulo y CTA en portugués de Brasil, lo que permite a un equipo de marketing iterar variantes sin salir del flujo local.
- Dirección de fotografía en preproducción: dado un brief, produce especificaciones de lente (mm), encuadre, movimiento de cámara y temperatura de luz en kelvin, utilizables directamente por el equipo de rodaje o como entrada para herramientas de generación de vídeo.
- Generación de prompts para modelos de vídeo e imagen: el formato MCSLA entrenado permite traducir una idea creativa en un prompt estructurado listo para plataformas de generación visual.
- Planificación de contenido para redes: elabora calendarios y planes con temas, formatos (carrusel, reel, storyboard) y copys asociados, partiendo de un brief de producto.
- Creación de material promocional de lanzamiento: tráilers, teasers y manifiestos de marca para campañas, con estructura narrativa y tiempos de plano coherentes con la duración solicitada.
- Asistencia a equipos de agencia con restricciones de confidencialidad: al ejecutarse en local vía Ollama, el brief y los datos del cliente no abandonan la infraestructura propia, algo relevante para cuentas con acuerdos de confidencialidad.
- Formación y prototipado de herramientas internas: sirve como base para construir asistentes creativos verticales sobre Qwen2.5-7B, dado su bajo coste de ajuste y su licencia permisiva.

## Benchmarks y rendimiento

La model card documenta una comparación contra Qwen2.5-7B-Instruct sin ajustar, con el mismo prompt de sistema, 10 peticiones (6 de Growth, 4 de tráiler y animación), 2 semillas por petición y temperatura 0,65. No se publican resultados en benchmarks estándar (MMLU, HumanEval, GSM8K).

| Metrica | Base | Este modelo |
|---|---|---|
| Invento dato, canal o @ | 0/20 | 0/20 |
| Adjetivo vacio o nombre de franquicia | 0/20 | 0/20 |
| Tiempo de planos coherente con la duracion | 18/20 | 20/20 |
| Camara fisica (lente, encuadre, movimiento) | 14/20 | 18/20 |
| Luz con temperatura | 14/20 | 19/20 |

Perdida de validacion: 1,108 (epoca 1) y 1,070 (epoca 2).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5-5,5 GB con la cuantización Q4_K_M publicada (archivo de 4,7 GB) más overhead de contexto.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090; también en equipos con 8 GB de VRAM usando Q4_K_M con contexto moderado.
- GPU profesionales recomendadas para mayor throughput: A100, H100, L40S; el entrenamiento se realizó en una NVIDIA B200.
- Despliegue: Ollama es la vía documentada (`ollama run hf.co/nulleon/nulleon-diretor-criativo-v2-GGUF:Q4_K_M`). Al ser GGUF, es compatible con llama.cpp y con servidores basados en él; para vLLM o TGI sería necesario convertir o servir el modelo base con el adaptador LoRA.
- Latencia y throughput: no disponibles en la información proporcionada.
- Ejecución en CPU: viable con llama.cpp u Ollama, aunque sin datos de rendimiento publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Nulleon Diretor Criativo v2 | 7,6 B | No disponible | Direccion creativa y fotografia en pt-BR | Apache-2.0 | GGUF Q4_K_M |
| Qwen2.5-7B-Instruct | 7,6 B | No disponible en la informacion proporcionada | Proposito general, multilingue | Apache-2.0 | Safetensors, GGUF |
| Mistral-7B-Instruct | 7,2 B | No disponible en la informacion proporcionada | Proposito general | Apache-2.0 | Safetensors, GGUF |
| Llama 3.1 8B Instruct | 8,0 B | No disponible en la informacion proporcionada | Proposito general | Licencia comunitaria Llama 3.1 | Safetensors, GGUF |

La comparación relevante es contra su propio modelo base: el ajuste mejora la coherencia de tiempos de plano (20/20 frente a 18/20), la especificación de cámara física (18/20 frente a 14/20) y la iluminación con temperatura (19/20 frente a 14/20), sin degradar la ausencia de datos inventados. Frente a modelos de propósito general del mismo tamaño, la ventaja es la especialización y el formato de salida; la desventaja es el idioma único y la ausencia de capacidades multimodales.

## Limitaciones y advertencias

- Modelo de 7B: la lógica narrativa del guion puede resultar incoherente en peticiones complejas; la model card recomienda revisión humana antes de producir.
- Solo texto: no procesa imagen ni vídeo, pese a estar orientado a producción audiovisual.
- Idioma único: entrenado y evaluado únicamente en portugués de Brasil; el rendimiento en castellano u otros idiomas no está documentado y previsiblemente será inferior.
- No sustituye la verificación de hechos, precios ni normativa publicitaria; el filtro antialucinación se limita a datos de venta, precios, teléfonos, sitios, cuentas y nombres de canales.
- Riesgo de alucinación en otros dominios no cubiertos por las reglas de filtrado del dataset.
- Los datos de entrenamiento son sintéticos (generados por Claude Opus 5.5), lo que puede introducir sesgos estilísticos del generador y limitar la diversidad de respuestas.
- La evaluación publicada es reducida (20 muestras) y no incluye benchmarks estandarizados, por lo que la mejora debe validarse en el caso de uso concreto.
- Aunque la licencia es Apache-2.0, conviene verificar las condiciones del modelo base Qwen2.5-7B-Instruct y el cumplimiento de la normativa publicitaria brasileña (CONAR) en el uso comercial.
- El repositorio no registra descargas ni interacciones, por lo que no existe evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nulleon/nulleon-diretor-criativo-v2-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Documentación de Ollama: https://ollama.com
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
