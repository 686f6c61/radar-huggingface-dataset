# alpharomercoma/LFM3-VL-2B-AndroidAgent-v4.3-dpo2

## Resumen

LFM3-VL-2B-AndroidAgent-v4.3-dpo2 es un ajuste fino del modelo vision-lenguaje LFM3-VL-2B de LiquidAI, especializado en actuar como agente que opera un telefono Android a partir de capturas de pantalla. Lo desarrolla el usuario independiente alpharomercoma y se publica como candidato de investigacion dentro de una campaña de iteraciones (ronda 5, candidato P2) cuyo objetivo es que el modelo aprenda a preferir el paso humano correcto frente a sus propios errores sobre la misma pantalla. El modelo resuelve el problema de la seleccion de la siguiente accion en interfaces moviles: dado un objetivo en lenguaje natural, la lista de aplicaciones instaladas, el historial de pasos previos y una captura actual, emite una unica accion en JSON con coordenadas normalizadas.

Tecnicamente es un transformer multimodal de aproximadamente 1.918 millones de parametros (1.9B), con torre de vision y proyector congelados durante este ajuste. Sobre los pesos fusionados de la version v4.2 se aplica un entrenamiento combinado de DPO a nivel de paso (beta 0.1, learning rate 1e-5) mas un SFT con peso 1.0 sobre el paso preferido, mediante un LoRA de solo lenguaje con rango 64 y alpha 128 que despues se fusiona en los pesos. El resultado es un modelo de investigacion, no validado aun, orientado a un unico idioma (ingles) y a un contexto de historial de 8 pasos.

Su relevancia actual reside en el enfoque de datos: en lugar de recurrir a un modelo profesor o a datos de entorno, el autor hizo que v4.2 decodificara sus propias filas de entrenamiento de forma codiciosa y construyo pares de preferencia donde el paso humano es el elegido y el paso erroneo del propio modelo el rechazado, limitando el conjunto a 851 pares equilibrados para evitar el colapso de tipos de accion que sufrio el candidato P. Es, por tanto, un ejemplo de automejora por preferencias en el dominio de agentes GUI moviles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-lenguaje (familia LFM3-VL), con torre de vision y proyector congelados en este ajuste |
| Parametros totales | 1.918.181.888 (1.9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explicita; el historial de pasos se limita a los ultimos 8 pasos y la imagen se redimensiona a unos 720 tokens |
| Tipos de cuantizacion | 4-bit GGUF disponible en el repositorio hermano; otras cuantizaciones no disponibles |
| Idiomas soportados | ingles (en) |
| Licencia | LFM Open License v1.0 (lfm1.0), heredada de LiquidAI/LFM3-VL-2B |
| Formato de pesos | safetensors (transformers); GGUF de 4 bits en repositorio separado; adaptador LoRA en `lora_adapter/` |

## Arquitectura y entrenamiento

El modelo parte de LFM3-VL-2B, un transformer multimodal que procesa una captura de pantalla por paso junto con texto. En este ajuste la torre de vision y el proyector permanecen congelados; solo se entrena la parte de lenguaje mediante un LoRA de rango 64 y alpha 128 que posteriormente se fusiona en los pesos finales. La entrada combina una imagen redimensionada a un maximo de 880 x 880 pixeles de area (aproximadamente 720 tokens de imagen) con un texto de usuario estructurado en cuatro bloques: `Goal:`, `Installed apps:`, `Previous steps:` (los ultimos 8 pasos en formato `n. <intent> -> <action JSON>`, o `None`) y la pregunta `What is the next action?`. La salida es un bloque `<think>` con la intencion breve seguido de una unica accion JSON compacta con coordenadas enteras en una rejilla de 0 a 1000.

El entrenamiento combina DPO a nivel de paso con beta 0.1 y learning rate 1e-5, mas un SFT con peso 1.0 sobre el paso preferido. Los datos se generaron haciendo que la version v4.2 decodificara sus propias filas de entrenamiento de forma codiciosa; alli donde se detuvo demasiado pronto, omitio una parada o copio su intencion anterior, se construyo un par con el paso humano como preferido y el paso propio del modelo como rechazado. El conjunto final son 851 pares equilibrados, sin datos de entorno, sin modelo profesor y sin datos de benchmark. La decodificacion recomendada es con modo de razonamiento activado y temperatura 0.

## Capacidades

- Generacion de la siguiente accion en un telefono Android a partir de una captura de pantalla y un objetivo en lenguaje natural.
- Emision de acciones estructuradas en JSON: `click`, `long_press`, `input_text`, `scroll` (con direccion), `open_app`, `navigate_back`, `navigate_home`, `keyboard_enter`, `wait`, `answer` y `status` (con `goal_status` de `complete` o `infeasible`).
- Razonamiento breve explicito mediante el bloque `<think>` antes de la accion, con modo de pensamiento activado en la decodificacion recomendada.
- Localizacion visual de elementos mediante coordenadas normalizadas en una rejilla de 0 a 1000 sobre la captura.
- Seguimiento de un historial de hasta 8 pasos previos en texto para mantener coherencia multi-paso.
- Distincion entre finalizar una tarea sin informacion (`status`) y responder a una pregunta del objetivo (`answer`).
- Capacidad multilingue limitada al ingles.
- Soporte de tool calling o function calling generico: no disponible.
- Soporte de audio: no disponible.

## Casos de uso

- Automatizacion de pruebas de interfaz en Android: el modelo puede generar secuencias de acciones sobre una app a partir de capturas, util para construir scripts de prueba reproducibles en pipelines de CI para aplicaciones moviles.
- Asistente de accesibilidad por voz o texto: dado un objetivo como "abre los ajustes y activa el modo avion", el modelo propone los pasos concretos sobre la pantalla, apoyandose en su historial de 8 pasos para no repetir acciones.
- Investigacion en agentes GUI: sirve como punto de partida para experimentos de aprendizaje por preferencias a nivel de paso, ya que su pipeline de datos (autodecodificacion y pares humano vs. propio) es replicable.
- Prototipado de agentes moviles en entornos simulados como AndroidWorld o MobileWorld, donde el modelo puede evaluarse sin riesgo sobre cuentas reales.
- Extraccion de flujos de navegacion: a partir de una secuencia de capturas, el modelo puede anotar la accion esperada en cada pantalla, util para documentar recorridos de usuario en aplicaciones.
- Fine-tuning posterior como base: al ser un ajuste sobre LFM3-VL-2B con LoRA fusionado, puede servir de inicializacion para nuevas rondas de DPO o SFT en dominios moviles especificos.
- Demostraciones de investigacion sobre automejora: permite estudiar como un modelo aprende de sus propios errores sin modelo profesor, comparando el candidato P2 con el P que colapso tipos de accion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo v4.3-dpo2 en la informacion disponible. La model card indica que la evaluacion esta en curso (puerta offline sobre AndroidControl test y splits de desarrollo, y AndroidWorld semilla 30 en desarrollo). Como referencia, la version v4.2 obtuvo 18/116 en la semilla 30 de AndroidWorld y 8/105 en MobileWorld.

| Modelo | AndroidWorld (semilla 30) | MobileWorld |
|---|---|---|
| v4.2 (referencia) | 18/116 | 8/105 |
| v4.3-dpo2 | en evaluacion | en evaluacion |

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16/fp16, alrededor de 4 GB solo para los pesos (1.9B parametros), mas overhead de activaciones y del procesamiento de imagen; en la practica se recomienda entre 6 y 8 GB de VRAM para inferencia comoda.
- Cuantizacion 4-bit GGUF: reduce los pesos a aproximadamente 1-1.5 GB, permitiendo ejecucion en GPUs de consumo con 4 GB o mas.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues de mayor throughput; en consumer GPU cabe con cuantizacion 4-bit y probablemente en bf16 en tarjetas de 8 GB o mas.
- Opciones de despliegue: transformers (libreria indicada por el autor), llama.cpp u Ollama mediante el GGUF de 4 bits del repositorio hermano; vLLM o TGI no estan confirmados en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-VL-2B-AndroidAgent-v4.3-dpo2 | 1.9B | no disponible (historial de 8 pasos) | Agente GUI Android, ajuste DPO | LFM Open License v1.0 | Hugging Face, GGUF 4-bit |
| LFM3-VL-2B (LiquidAI) | 2B (no confirmado en detalle) | no disponible | Vision-lenguaje general | LFM Open License v1.0 | Hugging Face |
| LFM3-VL-2B-AndroidAgent-v4.2 | 1.9B aprox. | no disponible (historial de 8 pasos) | Agente GUI Android, version previa | LFM Open License v1.0 | Hugging Face |

No se dispone de datos de rendimiento del v4.3-dpo2 para comparar con alternativas; la unica referencia numerica es la de v4.2 en AndroidWorld y MobileWorld.

## Limitaciones y advertencias

- Modelo de investigacion: no debe dejarse actuar sin supervision en un telefono con cuentas, mensajes o pagos reales.
- Estado de candidato no validado: la evaluacion esta en curso y el autor advierte que puede ser peor que v4.2.
- Idioma: solo objetivos en ingles; no se garantiza funcionamiento en castellano ni en otros idiomas.
- Memoria limitada: una sola captura por paso y sin memoria mas alla de los 8 pasos de historial en texto.
- Riesgo de alucinacion: puede emitir acciones sobre elementos inexistentes o copiar su intencion anterior, que es precisamente el fallo que el entrenamiento DPO intenta corregir.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia: LFM Open License v1.0; conviene revisar las condiciones de uso comercial antes de integrarlo en produccion.
- Datos de entrenamiento limitados (851 pares) y sin datos de entorno ni de benchmark, lo que puede reducir la generalizacion a aplicaciones no vistas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alpharomercoma/LFM3-VL-2B-AndroidAgent-v4.3-dpo2
- Version GGUF 4-bit: https://huggingface.co/alpharomercoma/LFM3-VL-2B-AndroidAgent-v4.3-dpo2-GGUF
- Modelo base del ajuste: https://huggingface.co/alpharomercoma/LFM3-VL-2B-AndroidAgent-v4.2
- Modelo original de LiquidAI: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Licencia LFM Open License v1.0: incluida en el repositorio como LICENSE
