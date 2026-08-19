# quimmedes/Deepwen-3.6

## Resumen

Deepwen 3.6 es un modelo de lenguaje derivado de Qwen/Qwen3.6-35B-A3B, un modelo de arquitectura Mixture-of-Experts con aproximadamente 35 mil millones de parámetros totales y unos 3 mil millones de parámetros activos. El autor, quimmedes, ha realizado un fine-tuning supervisado con cadenas de razonamiento completas, incorporando el ADN de razonamiento de DeepSeek-V4-Flash-0731, lo que le confiere un control de esfuerzo de razonamiento en tres niveles (low, xhigh y max) y una disciplina de "verificar antes de responder".

El modelo está especializado en flujos de trabajo de producción de activos 3D para desarrollo de juegos AAA, incluyendo generación procedural de geometría, lenguaje de forma de superficies duras, pipelines de activos en Blender, gráficos web (WebGPU, Three.js/WebGL, Canvas 2D) y sistemas de diseño UI. Se distribuye en formato GGUF con cuantización mixta (MoQ) y los pesos originales en BF16 están disponibles en un repositorio compañero. Su relevancia radica en combinar capacidades de razonamiento avanzado con habilidades de dominio específico para entornos de producción técnica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en Qwen/Qwen3.6-35B-A3B |
| Parametros totales | ~35 mil millones |
| Parametros activos | ~3 mil millones |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MoQ (Mixture of Quantizations): Q2.5, Q3, Q4.5, Q5, Q6, Q8 en formato GGUF |
| Idiomas soportados | ingles, portugues |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizados) y safetensors (BF16) en repositorio companero |

## Arquitectura y entrenamiento

Deepwen 3.6 parte del checkpoint Qwen/Qwen3.6-35B-A3B, un modelo MoE con aproximadamente 35 mil millones de parametros totales y 3 mil millones activos por token. El fine-tuning se ha realizado con un dataset supervisado curado y multi-habilidad, donde la gran mayoria de los ejemplos de entrenamiento incluyen cadenas de razonamiento completas como parte del objetivo, de modo que el modelo aprende a razonar antes de responder en lugar de limitarse a repetir patrones.

La innovacion principal reside en el control de esfuerzo de razonamiento, portado de DeepSeek-V4-Flash-0731, que permite ajustar la profundidad del razonamiento mediante tres niveles: low (por defecto), xhigh y max. El nivel max activa un modo de verificacion exhaustiva en el que el modelo no detiene el razonamiento hasta haber validado la solucion desde multiples angulos. Ademas, el entrenamiento refuerza el tool calling y el comportamiento agente, conservando el soporte nativo de la base Qwen. El resultado es una mejora medible en generacion procedural, diseno de superficies duras, flujos de trabajo de Blender, iluminacion, graficos web y sistemas UI, sin perdida de las capacidades originales del modelo base.

## Capacidades

- Generacion de texto y razonamiento avanzado con control de esfuerzo (low, xhigh, max).
- Tool calling y comportamiento agente con planificacion, seleccion de herramientas y salida estructurada.
- Generacion procedural 3D: blockout gating antes de alta poligonizacion, flujos de trabajo de lightmap condicional, validacion combinatoria y pipelines no destructivos.
- Lenguaje de forma de superficies duras: diseno relacional de postura, arquitectura de volumen primario, propagacion de motivos y despiece de paneles.
- Flujos de trabajo de activos en Blender: recetas basadas en modificadores, generacion de perfiles de dientes, preparacion de juegos UV/PBR y ordenacion no destructiva.
- Graficos web: arquitectura de pipelines WebGPU, flujos de trabajo Three.js/WebGL y Canvas 2D.
- Sistemas UI/design: layout, arquitectura de componentes, jerarquia visual y accesibilidad.
- Capacidades multilingues en ingles y portugues.

## Casos de uso

- Generacion procedural de geometria para niveles de juegos AAA: el modelo puede generar blockouts validados y flujos de trabajo de lightmap condicional, reduciendo el tiempo de iteracion en la fase de preproduccion.
- Diseno de superficies duras para props y vehiculos: aplica lenguaje de forma (postura, volumen primario, propagacion de motivos) para crear piezas coherentes con la identidad visual del juego.
- Pipelines de activos en Blender: genera recetas basadas en modificadores, perfiles de dientes para engranajes y preparacion de UV/PBR lista para motores de juego, integrable en scripts de automatizacion.
- Graficos web interactivos: genera codigo para WebGPU, Three.js y Canvas 2D, util para dashboards 3D, visualizaciones de datos y experiencias web inmersivas.
- Sistemas de diseno UI: produce arquitecturas de componentes, jerarquia visual y pautas de accesibilidad para equipos de producto.
- Asistente de razonamiento tecnico: con el nivel de esfuerzo max, puede verificar soluciones complejas de forma exhaustiva, util para revision de arquitecturas de software o diseno de sistemas.
- Soporte multilingue en ingles y portugues para documentacion tecnica y atencion al desarrollador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor presenta una evaluacion pareada sobre tareas retenidas, comparando el modelo con su base Qwen/Qwen3.6-35B-A3B en el mismo servidor y con las mismas semillas:

| Capacidad | Mejora |
|---|---|
| Generacion procedural | blockout gating, lightmap condicional y flujos de validacion: FAIL → PASS en tareas retenidas |
| Seguridad de reproduccion | suite de competencias base intacta |
| Forma / superficies duras | consistente en objetos retenidos |
| Flujo de trabajo Blender | recetas basadas en modificadores, generacion de perfiles de dientes, preparacion UV/PBR, ordenacion no destructiva |
| Iluminacion | legibilidad de iluminacion en capas (rebote y ambiental) |
| Graficos web | generacion de codigo Canvas 2D / Three.js / WebGPU mejorada de forma medible |
| UI/design | sistemas de layout, arquitectura de componentes, jerarquia visual, accesibilidad |

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion MoQ:
  - Q2.5-MoQ (13,4 GB): cabe en GPUs con 16 GB de VRAM (RTX 4080, RTX 4090).
  - Q3-MoQ (13,4 GB): similar al anterior, requiere 16 GB de VRAM.
  - Q4.5-MoQ (21,2 GB): requiere al menos 24 GB de VRAM (RTX 4090, A5000).
  - Q5-MoQ (24,7 GB): requiere 32 GB de VRAM (A100 40 GB, RTX 6000 Ada).
  - Q6-MoQ (28,8 GB): requiere 40 GB de VRAM (A100 40 GB, H100).
  - Q8-MoQ (36,9 GB): requiere 48 GB de VRAM o mas (A100 80 GB, H100 80 GB).
- GPUs recomendadas: RTX 4090 para cuantizaciones hasta Q4.5; A100 o H100 para Q5 y superiores.
- Opciones de despliegue: compatible con llama.cpp, Ollama y endpoints compatibles con la arquitectura Qwen (vLLM, TGI). El repositorio incluye archivos GGUF listos para usar con llama.cpp.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Deepwen 3.6 (este) | ~35B total / ~3B activo | no disponible | Control de esfuerzo (low, xhigh, max) estilo DeepSeek | Apache 2.0 | GGUF y safetensors |
| Qwen/Qwen3.6-35B-A3B (base) | ~35B total / ~3B activo | no disponible | Razonamiento nativo Qwen | Apache 2.0 | Pesos originales |
| DeepSeek-V4-Flash-0731 | no disponible | no disponible | Razonamiento con control de esfuerzo | no disponible | no disponible |

La comparativa se limita a los modelos mencionados en la informacion proporcionada. No se dispone de datos de otros modelos MoE de tamano similar (como Mixtral 8x7B o Qwen2.5-32B-A3B) en la documentacion consultada.

## Limitaciones y advertencias

- Sesgos: al ser un fine-tuning de Qwen, puede heredar sesgos presentes en el modelo base, aunque no se documentan sesgos especificos en la informacion disponible.
- Riesgo de alucinacion: no se menciona explicitamente, pero es un riesgo inherente a los modelos de lenguaje generativos, especialmente en tareas fuera de los dominios especializados.
- Limitaciones de contexto: la longitud de contexto no se especifica en la documentacion; se recomienda verificar el config.json del repositorio de pesos BF16 antes de usarlo en produccion.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones significativas, siempre que se mantenga el aviso de licencia.
- Caveat de produccion: el modelo esta fuertemente especializado en desarrollo de juegos, graficos web y diseno UI; su rendimiento en tareas generales puede ser inferior al de modelos de proposito general del mismo tamano.
- Los archivos Q6-MoQ fueron re-subidos tras un problema de offsets corruptos; se recomienda verificar la integridad de las descargas antes de su uso.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/quimmedes/Deepwen-3.6
- Repositorio de pesos originales BF16 (safetensors): https://huggingface.co/quimmedes/Deepwen-3.6-bf16
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- DeepSeek-V4-Flash-0731 (fuente del razonamiento): https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Metodo MoQ (Mixture of Quantizations) de Waleed Ahmad: https://huggingface.co/w-ahmad
