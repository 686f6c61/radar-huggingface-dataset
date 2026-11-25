# OmniJev/OneJev-4B

## Resumen

OneJev-4B es un modelo multimodal de decisión de tipo "System One" desarrollado por OmniJev. Se trata de un fine-tune completo de Qwen/Qwen3.5-4B orientado a una tarea muy concreta: recibir un estado (captura de pantalla, fotografía, vídeo o texto plano) junto con un conjunto de preguntas tipadas y devolver, en un único forward pass, una probabilidad calibrada para cada opción de respuesta. No es un modelo generativo conversacional al uso, sino un evaluador de decisiones que puntúa alternativas.

La propuesta encaja en el ámbito de los agentes GUI y la automatización de decisiones: en lugar de generar texto libre y parsearlo después, el modelo emite directamente distribuciones de probabilidad sobre opciones discretas (por ejemplo, "click" frente a "stop") y sobre condiciones booleanas. El modelo se ha entrenado sobre 99.193 preguntas extraídas de ejecuciones reales de agentes, vídeos e imágenes, y se distribuye con licencia Apache 2.0.

Con 5.174.964.736 parámetros reales según los pesos en safetensors y un repositorio de 10,4 GB, OneJev-4B se posiciona como la variante intermedia de una familia que abarca desde 0,8B hasta 27B. Su relevancia actual radica en la latencia: según el autor, responde una pregunta en 64 ms y diez preguntas en una sola petición en 104 ms sobre una H200 con una captura de 1280x720.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (fine-tune completo de Qwen/Qwen3.5-4B); detalles internos no disponibles |
| Parametros totales | 5.174.964.736 |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q8_0 disponible (build de mradermacher); otros tipos no disponibles |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo principal), GGUF (build externo) |

## Arquitectura y entrenamiento

OneJev-4B es un fine-tune completo (full fine-tune) del modelo base Qwen/Qwen3.5-4B, que aporta la arquitectura transformer y las capacidades multimodales de partida. El modelo resultante se especializa en una interfaz de "System One API" que acepta un estado estructurado, medios (imágenes y vídeo) y un diccionario de preguntas tipadas —con tipos como `Noul` para condiciones booleanas y `Choice` para selección entre opciones—, devolviendo probabilidades calibradas por opción en un solo paso hacia delante. La información disponible no detalla la composición interna de la arquitectura (número de capas, cabezas, mecanismo de atención ni el codificador visual).

El entrenamiento se realizó sobre 99.193 preguntas procedentes de ejecuciones reales de agentes, vídeos e imágenes, recogidas en el dataset OmniJev/OneJev-Data. No se especifican en la información proporcionada el número total de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación. El autor indica que el conjunto de test de OneJev contiene tipos de pregunta presentes en entrenamiento pero con instancias que ningún modelo vio durante el entrenamiento, lo que sugiere una evaluación orientada a generalización dentro de las mismas categorías de tarea.

## Capacidades

- Evaluación de decisiones multimodales: devuelve probabilidades calibradas para cada opción de un conjunto de preguntas tipadas en un único forward pass.
- Entrada de imágenes: capturas de pantalla, fotografías y otros formatos de imagen como parte del estado.
- Entrada de vídeo: soportada en el servidor PyTorch (no en la ruta GGUF/llama.cpp según la model card).
- Entrada de texto plano como estado de la tarea.
- Preguntas booleanas tipadas (`Noul`) y preguntas de elección entre opciones (`Choice`).
- Soporte para agentes GUI: evaluación de la siguiente acción del agente (por ejemplo, "click" frente a "stop").
- API compatible con TypeSafe System One API, con un campo adicional `media` para imágenes y vídeo.
- Procesamiento por lotes de múltiples preguntas en una sola petición (10 preguntas en 104 ms según el autor).
- Capacidades conversacionales y de generación de texto libre: no documentadas; el modelo está orientado a puntuar opciones, no a generar respuestas abiertas.

## Casos de uso

- Agentes GUI automatizados: el modelo recibe una captura de pantalla y un estado de tarea y devuelve la probabilidad de cada acción posible (clic en un elemento, detenerse), lo que permite construir políticas de agente con umbrales de confianza explícitos en lugar de parsear texto generado.
- Verificación de condiciones en flujos RPA: con preguntas booleanas tipadas (`Noul`), se puede comprobar si una condición se cumple (por ejemplo, "la factura ha sido pagada") y usar la probabilidad como señal de parada o de reintento.
- Automatización de atención al cliente con verificación visual: dado un estado textual y una imagen del contexto del usuario, el modelo puntúa qué siguiente paso debe tomar el sistema, útil en pipelines donde la decisión debe ser rápida y calibrada.
- Control de calidad en pipelines de vídeo: al aceptar vídeo como entrada, puede evaluar estados extraídos de grabaciones para decidir la siguiente acción en procesos de inspección o monitorización.
- Enrutamiento de decisiones de bajo coste: con 64 ms por pregunta en H200 y una variante GGUF ejecutable en llama.cpp, encaja en bucles de decisión que requieren muchas evaluaciones por segundo sin generación de texto.
- Evaluación comparativa de políticas de agente: al devolver probabilidades calibradas, permite medir la confianza de una política en cada paso y detectar puntos de fallo antes de desplegarla en producción.
- Integración en sistemas de agentes multi-paso: cada paso del agente puede consultar al modelo para elegir entre un conjunto acotado de acciones, manteniendo la latencia baja incluso con varias preguntas por petición.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados (presentada como imagen SVG en el repositorio) que compara OneJev-4B con Jev 1.13, Jev-Omni 12B y Qwen3.8-27B en modo thinking, con precisión en porcentaje sobre el conjunto de test de OneJev. Los valores numéricos concretos no están disponibles en la información textual proporcionada, por lo que no se reproducen aquí.

Datos de latencia aportados por el autor: en una H200 con una captura de pantalla de 1280x720, OneJev-4B responde 1 pregunta en 64 ms y 10 preguntas en una sola petición en 104 ms (10,4 ms por pregunta).

## Requisitos de hardware

- VRAM estimada: los pesos en safetensors ocupan 10,4 GB, por lo que la inferencia en precisión completa requiere aproximadamente esa cifra más el overhead de activaciones y del codificador visual; con cuantización GGUF Q8_0 el requisito se reduce de forma proporcional (valor exacto no disponible).
- GPU recomendadas: el autor reporta medidas sobre NVIDIA H200; no se especifican otras GPU en la información disponible.
- GPU de consumo: la variante GGUF Q8_0 ejecutable en llama.cpp hace plausible su uso en GPU de consumo con VRAM suficiente para el tamaño cuantizado, aunque no se confirman modelos concretos ni cifras de VRAM en la documentación.
- Opciones de despliegue: servidor propio `qev serve` (paquete `qev[torch]` desde el repositorio de GitHub) para imágenes y vídeo; llama.cpp con el build GGUF de mradermacher para imágenes (el vídeo requiere el servidor PyTorch).
- Latencia y throughput: 64 ms por pregunta individual y 10,4 ms por pregunta en lotes de 10 sobre H200 con captura 1280x720.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Pesos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|---|
| OneJev-4B | Qwen3.5-4B | 5.174.964.736 | 10,4 GB | No disponible | Apache 2.0 | Fine-tune de decisión multimodal |
| OneJev-0.8B | Qwen3.5-0.8B | No disponible | 2,2 GB | No disponible | No disponible | Variante pequena de la misma familia |
| OneJev-9B | Qwen3.5-9B | No disponible | 18,8 GB | No disponible | No disponible | Variante grande de la misma familia |
| OneJev-27B | Qwen3.8-27B | No disponible | 54,7 GB | No disponible | No disponible | Variante mayor; existe version FP8 de 30,4 GB |
| Jev 1.13 | No disponible | No disponible | No disponible | No disponible | No disponible | Solo texto; puntuaciones publicadas por el autor |
| Jev-Omni 12B | No disponible | No disponible | No disponible | No disponible | No disponible | Modelo comparable citado en la tabla de resultados |
| Qwen3.8-27B (thinking) | No disponible | No disponible | No disponible | No disponible | No disponible | Modelo de referencia en la comparativa del autor |

## Limitaciones y advertencias

- El modelo está diseñado para puntuar opciones predefinidas, no para generar texto libre; usarlo como modelo conversacional general no es su propósito y no hay documentación que lo respalde.
- Las probabilidades son calibradas según el autor, pero no se detalla el método de calibración ni se aportan métricas de calibración (ECE, Brier) en la información disponible.
- El conjunto de test contiene tipos de pregunta vistos en entrenamiento; no hay datos sobre generalización a categorías de tarea completamente nuevas.
- No se especifican los idiomas soportados, por lo que no se puede garantizar un rendimiento adecuado fuera del inglés.
- No se detalla la longitud de contexto, lo que limita la planificación de aplicaciones con estados largos o historiales extensos.
- Riesgo de alucinación no evaluado en la información disponible; al tratarse de un modelo de puntuación, el riesgo se traslada a la fiabilidad de las probabilidades emitidas.
- La entrada de vídeo solo está soportada en el servidor PyTorch, no en la ruta llama.cpp/GGUF.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-4B y del dataset OmniJev/OneJev-Data.
- El ecosistema de despliegue (`qev`) es propio y menos maduro que vLLM, TGI o llama.cpp estándar; la integración GGUF depende de un build de terceros (mradermacher).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OmniJev/OneJev-4B
- Colección OneJev: https://huggingface.co/collections/OmniJev/onejev
- Dataset OneJev-Data: https://huggingface.co/datasets/OmniJev/OneJev-Data
- Repositorio GitHub: https://github.com/OmniJev/OneJev
- Sitio web del proyecto: https://omnijev.github.io/OneJev/
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/BradNLP/OneJev
- Build GGUF de mradermacher: https://huggingface.co/mradermacher/OneJev-4B-GGUF
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia: https://github.com/OmniJev/OneJev/blob/main/LICENSE
