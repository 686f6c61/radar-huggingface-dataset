# AhoosAI/nimbus-1-1-prime-ee

## Resumen

Nimbus 1.1 Prime-EE es un adaptador QLoRA publicado por AhoosAI sobre el modelo base Qwen/Qwen2.5-Coder-7B-Instruct. No es un modelo completo, sino un conjunto de pesos LoRA (0,2 GB en el repositorio) que se carga sobre el base de 7.655.986.688 parametros y anade 40.370.176 parametros entrenables (0,53 % del total). El objetivo declarado por el autor no es mejorar la capacidad de programacion del base, sino corregir sesgos de comportamiento habituales en el codigo generado: `dir="ltr"` fijado a mano, `margin-left` en lugar de `margin-inline-start`, controles de formulario sin `<label>` o Dockerfiles que se ejecutan como root.

El adaptador esta entrenado especificamente en tres areas de comportamiento: CSS logico y soporte RTL (relevante para persa y arabe), accesibilidad web y endurecimiento de contenedores Docker. Los idiomas declarados son ingles, persa, arabe, espanol y portugues, con enfasis explicito en responder en el idioma del usuario sin derivar a ingles a mitad de respuesta, algo que el autor senala como problema en el base.

Su relevancia actual es acotada pero concreta: es un ejemplo de ajuste fino orientado a comportamiento verificable (105 tareas con reglas comprobables automaticamente) en lugar de a benchmarks agregados de codigo. El autor publica tanto las cifras favorables (mejora de 84/105 a 88/105 en su suite propia) como la regresion conocida (perdida de 3 puntos en tareas de especificacion de imagen), lo que lo convierte en un caso util para estudiar el coste de un fine-tune especializado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA sobre las proyecciones q, k, v, o, gate, up, down |
| Parametros totales | Base: 7.655.986.688; adaptador: 40.370.176 (0,53 %). Conjunto: 7.696.356.864 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens (heredado de Qwen2.5-Coder-7B-Instruct; no se especifica en la model card del adaptador) |
| Tipos de cuantizacion | Entrenamiento QLoRA en 4-bit nf4 con doble cuantizacion. El adaptador es fusionable y convertible a GGUF (q4_K_M, q5_K_M, q8_0) o fp16/bf16 |
| Idiomas soportados | Ingles (en), persa (fa), arabe (ar), espanol (es), portugues (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos de adaptador PEFT/LoRA; requiere cargar el modelo base) |
| Libreria | peft |
| Tamano del repositorio | 0,2 GB |
| Modelo base | Qwen/Qwen2.5-Coder-7B-Instruct |
| Descargas / likes | 30 descargas / 0 likes |
| Fechas | Creado el 2026-09-11, actualizado el 2026-09-15 |

## Arquitectura y entrenamiento

El adaptador se entrenó con QLoRA sobre Qwen2.5-Coder-7B-Instruct cuantizado en 4-bit nf4 con doble cuantizacion. La configuración LoRA es r=16, alpha=32, dropout 0,05, con modulos objetivo q, k, v, o, gate, up y down. Esto implica que se adaptan tanto las proyecciones de atencion como las de la MLP, y no solo las de atencion. El numero de parametros entrenables es de 40.370.176 sobre 7.655.986.688, es decir, un 0,53 % del total.

El enfoque de datos es la parte diferencial: el autor declara haber entrenado sobre comportamiento en lugar de sobre codigo que el modelo base ya habia visto. Las areas cubiertas son CSS logico y direccionalidad RTL, accesibilidad en formularios e imagenes, y endurecimiento de Dockerfiles (ejecucion como usuario no root). La evaluacion se hizo con 105 tareas propias, cada una con una regla comprobable automaticamente, ejecutando el mismo base con el adaptador activado y desactivado, en modo greedy, con un limite de 400 tokens nuevos y el system prompt de produccion de cada tarea. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de codigo general en el mismo rango que el base, ya que el adaptador no sustituye los pesos originales.
- Generacion de maquetacion frontend con propiedades logicas de CSS (`margin-inline-start`, `inset`, `padding-inline`), evitando el uso de propiedades fisicas cuando corresponden logicas.
- Generacion de HTML con direccionalidad RTL correcta, sin fijar `dir="ltr"` de forma hardcodeada.
- Accesibilidad web: etiquetas `<label>` en controles de formulario, texto alternativo en imagenes y manejo de `Escape` en dialogos.
- Endurecimiento de contenedores: Dockerfiles que no se ejecutan como root.
- Respuesta multilingue en ingles, persa, arabe, espanol y portugues, manteniendo el idioma de la consulta.
- Soporte de tool calling / function calling: no disponible de forma explicita en la informacion proporcionada; se heredaria del modelo base.
- Modo thinking o razonamiento extendido: no disponible.
- Vision, audio u otras modalidades: no disponible.
- Uso en agentes y razonamiento multi-paso: no documentado para este adaptador.

## Casos de uso

- Internacionalizacion de interfaces web: generar maquetacion con propiedades logicas de CSS y direccionalidad RTL para productos que deben funcionar en persa y arabe sin retoques posteriores. El adaptador mejoro de 9/20 a 15/20 en las tareas frontend de la suite del autor.
- Auditoria de accesibilidad en pipelines de CI: usar el modelo para revisar componentes de formulario e imagenes generados por otros sistemas y anadir `<label>` y texto alternativo donde falten.
- Generacion de Dockerfiles en produccion: obtener Dockerfiles que crean usuario no root, cubriendo las tareas `be-docker-hardening` y `be-docker-nonroot` que pasaron de fallo a exito en la evaluacion del autor.
- Asistencia a desarrolladores hispanohablantes o lusohablantes: el adaptador declara responder en el idioma de la consulta, lo que encaja en entornos donde el equipo trabaja en espanol o portugues y el modelo base tendia a derivar a ingles.
- Atencion al usuario tecnica en persa o arabe: generar respuestas y fragmentos de codigo en idiomas RTL sin contaminacion de idioma a mitad de respuesta.
- Correccion de codigo legado en frontend: detectar y reescribir patrones fisicos de CSS y atributos de direccion fijados a mano en bases de codigo existentes.
- Generacion de fragmentos de codigo con contexto largo: con la ventana de 32.768 tokens del base, se pueden pasar ficheros completos de componente mas el system prompt de estilo.
- Prototipado de formularios accesibles: generar formularios HTML completos que cumplan reglas basicas de accesibilidad sin revision manual posterior.

## Benchmarks y rendimiento

Resultados publicados por el autor con `lm-evaluation-harness`:

| Benchmark | Configuracion | Puntuacion |
|---|---|---|
| IFEval | prompt-level, strict | 52,3 |
| HumanEval | pass@1, greedy | 61,6 |
| MBPP | pass@1, 3-shot | 67,2 |

Comparativa HumanEval pass@1 (cifras de cada fabricante, no medidas bajo las mismas condiciones):

| Modelo | HumanEval pass@1 |
|---|---|
| Qwen2.5-Coder-32B | 92,7 |
| o1-preview | 92,4 |
| Claude 3.5 Sonnet | 92,0 |
| GPT-4o | 90,2 |
| Qwen2.5-Coder-7B (base) | 88,4 |
| Gemini 1.5 Pro | 84,1 |
| DeepSeek-Coder-6.7B | 78,6 |
| Llama 3.1 8B | 72,6 |
| Nimbus 1.1 Prime-EE | 61,6 |

Comparativa MBPP pass@1:

| Modelo | MBPP pass@1 |
|---|---|
| Qwen2.5-Coder-32B | 90,2 |
| Qwen2.5-Coder-7B (base) | 83,5 |
| GPT-4o | 81,4 |
| Llama 3.1 8B | 72,8 |
| Nimbus 1.1 Prime-EE | 67,2 |
| DeepSeek-Coder-6.7B | 65,4 |

Suite interna del autor (105 tareas con regla comprobable, comparacion con adaptador activado y desactivado):

| Area | Base | Con adaptador | Diferencia |
|---|---|---|---|
| Frontend | 9/20 | 15/20 | +6 |
| Backend | 14/20 | 15/20 | +1 |
| Debugging | 19/20 | 19/20 | 0 |
| Idioma | 24/25 | 24/25 | 0 |
| Especificacion de imagen | 18/20 | 15/20 | -3 |
| Total | 84/105 | 88/105 | +3,8 % |

Tareas que pasaron de fallo a exito: `fe-rtl-logical-properties`, `fe-rtl-direction`, `fe-logical-inset`, `fe-accessibility`, `fe-image-alt`, `fe-form-label`, `fe-dialog-escape`, `be-docker-hardening`, `be-docker-nonroot`, `lang-spanish-docker`.

## Requisitos de hardware

- El adaptador no se puede ejecutar solo: requiere cargar Qwen2.5-Coder-7B-Instruct y aplicar los pesos LoRA, o fusionarlos y desplegar el modelo resultante.
- VRAM estimada para inferencia del conjunto base + adaptador (estimacion sobre 7,7 B de parametros, no publicada por el autor):
  - fp16/bf16: en torno a 16 GB solo de pesos, 18-20 GB con cache KV y activaciones a contexto moderado.
  - 8-bit: aproximadamente 8-9 GB de pesos, 10-12 GB en total.
  - 4-bit (nf4 o GGUF q4_K_M): aproximadamente 5 GB de pesos, 6-8 GB en total.
- GPU recomendadas: A100 o H100 para fp16 con contexto largo; RTX 4090 o RTX 3090 (24 GB) para fp16 con contexto moderado; RTX 4080, 4070 Ti Super o 4060 Ti (16 GB) en 8-bit o 4-bit; RTX 3060 (12 GB) en 4-bit.
- Si cabe en GPU de consumo: si, en 4-bit y 8-bit en tarjetas de 12 GB o mas; en fp16 requiere 24 GB.
- Opciones de despliegue: transformers + PEFT (carga directa del adaptador), vLLM (adaptador fusionado o soporte LoRA), llama.cpp u Ollama (requiere fusionar y convertir a GGUF), TGI, LM Studio.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval | MBPP | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nimbus 1.1 Prime-EE | 7,6 B + 40,4 M de adaptador | 32.768 tokens (heredado) | 61,6 (arnes propio) | 67,2 (arnes propio) | Apache 2.0 | HuggingFace (peft) |
| Qwen2.5-Coder-7B-Instruct (base) | 7,6 B | 32.768 tokens | 88,4 (cifra del fabricante) | 83,5 (cifra del fabricante) | Apache 2.0 | HuggingFace |
| Qwen2.5-Coder-32B | 32 B (segun denominacion) | no disponible | 92,7 (cifra del fabricante) | 90,2 (cifra del fabricante) | no disponible | HuggingFace |
| DeepSeek-Coder-6.7B | 6,7 B | no disponible | 78,6 (cifra del fabricante) | 65,4 (cifra del fabricante) | no disponible | HuggingFace |
| Llama 3.1 8B | 8 B | no disponible | 72,6 (cifra del fabricante) | 72,8 (cifra del fabricante) | no disponible | HuggingFace |

Advertencia del propio autor: las cifras de HumanEval y MBPP no se midieron bajo las mismas condiciones entre modelos. En su caso, la cifra publicada del base (88,4) se obtuvo pidiendo al modelo como en un chat y extrayendo el codigo de la respuesta, mientras que la suya (61,6) pide continuar una funcion a medio escribir. El autor reconoce que el numero 61,6 corresponde a esa configuracion concreta y no constituye un veredicto sobre el adaptador.

## Limitaciones y advertencias

- Regresion conocida y declarada: las tareas de especificacion de imagen bajan de 18/20 a 15/20. El autor lo atribuye a la ausencia de datos de imagen en el entrenamiento. Si el caso de uso principal es trabajar con prompts o especificaciones de imagen, hay que medir antes de adoptar.
- Las cifras de HumanEval y MBPP no son comparables directamente con las de otros modelos, porque se midieron con otro arnes y otra formulacion de la tarea.
- Ambas ramas de evaluacion se limitaron a 400 tokens nuevos, por lo que muchas respuestas se cortan a mitad de frase y las tasas absolutas de exito son un suelo, no una medida de la capacidad real.
- Las 105 tareas son una suite propia del autor, no un benchmark publico, lo que limita la comparabilidad externa.
- Riesgo de alucinacion: no se documenta especificamente; se hereda el comportamiento del modelo base Qwen2.5-Coder-7B-Instruct.
- Sesgos conocidos: no disponible. El autor no publica analisis de sesgo.
- Cobertura de idiomas: solo se declaran ingles, persa, arabe, espanol y portugues. No hay datos sobre el resto de idiomas ni sobre la calidad relativa entre ellos.
- Restricciones de licencia: Apache 2.0, por lo que el uso comercial esta permitido, pero conviene verificar la licencia del modelo base subyacente al redistribuir.
- El adaptador no es autonomo: cualquier despliegue implica cargar 7,6 B de parametros adicionales del base, con el coste de memoria y almacenamiento correspondiente.
- Al ser un ajuste fino muy especifico (RTL, accesibilidad, Docker), su efecto fuera de esas tres areas es practicamente nulo segun los propios datos del autor (debugging e idioma sin cambios).
- No hay informacion sobre soporte de tool calling, agentes o modo de razonamiento en este adaptador concreto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AhoosAI/nimbus-1-1-prime-ee
- Pagina de benchmarks del autor: https://ahoos-ai.site/nimbus-1-1-prime-benchmarks.html
- Catalogo de modelos de AhoosAI: https://ahoos-ai.site/models/
- Sitio del autor: https://ahoos-ai.site
- Banner del modelo: https://huggingface.co/AhoosAI/nimbus-1-1-prime-ee/resolve/main/banner.png
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente foros y hilos no relacionados).
