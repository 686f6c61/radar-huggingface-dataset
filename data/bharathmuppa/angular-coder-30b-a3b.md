# bharathmuppa/angular-coder-30b-a3b

## Resumen

angular-coder-30b-a3b es un ajuste fino (fine-tuning) del modelo Qwen/Qwen3-Coder-30B-A3B-Instruct especializado en el framework Angular, desarrollado por el usuario bharathmuppa. El modelo parte de una arquitectura Mixture-of-Experts (etiqueta `qwen3_moe` en HuggingFace) de 30.532.122.624 parámetros totales, de los cuales aproximadamente 3.300 millones se activan por token, según la información publicada sobre el modelo base Qwen3-Coder 30B. El objetivo del autor es cubrir un nicho muy concreto: generar código Angular moderno (componentes standalone, signals, `inject()`, flujo de control `@if`/`@for`/`@defer`, detección de cambios zoneless, Signal Forms, el builder de aplicaciones y migraciones de `ng update`), abarcando las versiones v14 a v22 del framework.

La aportación diferencial no es arquitectónica sino de datos: el autor construyó el dataset `bharathmuppa/angular-instruct` con 3.461 pares de instrucción que mezclan documentación oficial de Angular, hechos por versión, problemas conocidos, Material, CDK, NgRx, angular-eslint, la CLI y 400 registros de proyectos compilados y verificados con linter. Sobre esa base aplicó un LoRA de rango 16 en las proyecciones de atención (q/k/v/o) y fusionó los pesos resultantes en bf16, por lo que el repositorio publica el modelo completo y no solo el adaptador (el adaptador aislado está en `bharathmuppa/angular-coder-30b-a3b-lora`).

Es relevante ahora por dos motivos prácticos: se distribuye con licencia Apache-2.0 (uso comercial permitido) y con builds GGUF listos para Ollama y llama.cpp (Q4_K_M de ~18 GB y Q8_0 de ~32 GB), lo que permite ejecutarlo en hardware de consumo. Ahora bien, es un modelo recién publicado (creado el 19 de octubre de 2026, 20 descargas y 0 likes en el momento de la consulta) y sin benchmarks publicados, así que debe evaluarse con cautela antes de llevarlo a producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (etiqueta `qwen3_moe`), derivada de Qwen3-Coder-30B-A3B-Instruct |
| Parametros totales | 30.532.122.624 (dato real de safetensors) |
| Parametros activos | ~3.300 millones por token (dato del modelo base Qwen3-Coder 30B) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | bf16 (pesos completos fusionados), GGUF Q8_0, GGUF Q4_K_M; conversión a 4 bits vía MLX (`mlx_lm convert -q --q-bits 4`) |
| Idiomas soportados | inglés (`en`); la model card no declara otros idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16), GGUF (Q4_K_M y Q8_0), `Modelfile` para Ollama; convertibles a MLX |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3-Coder-30B-A3B-Instruct: un transformer con capas Mixture-of-Experts en el que cada token activa alrededor de 3.300 millones de parámetros de los 30.500 millones totales. El autor no modifica la arquitectura; aplica un LoRA de rango 16, alpha 16 y dropout 0,05 sobre las proyecciones de atención q/k/v/o y posteriormente fusiona el adaptador en los pesos base en bf16. El entrenamiento se hizo con `transformers` y `peft` en una única NVIDIA A100 de 80 GB, con batch 1, acumulación de gradiente 8, secuencia máxima de 4.096 tokens, learning rate 3e-5 con schedule coseno y 50 pasos de warm-up. La pérdida se calcula solo sobre los tokens de respuesta (loss en answer tokens only).

El dataset `bharathmuppa/angular-instruct` contiene 3.461 pares de instrucción, divididos en 3.182 de entrenamiento, 172 de validación y 103 de test. La composición incluye documentación de Angular, hechos versionados (v14-v22), issues conocidos, Material, CDK, NgRx, angular-eslint, la CLI y 400 registros de proyecto que fueron compilados y pasados por linter mediante un checker propio. La ejecución se detuvo a los 796 pasos de optimizador (2,0 épocas) por un límite de tiempo de reloj de 170 minutos, con pérdida final de 1,1279 en entrenamiento y 1,1662 en evaluación. No se documenta ninguna innovación técnica adicional (atención lineal, decodificación especulativa, RLHF o DPO); el proceso es un SFT supervisado sobre instrucciones.

## Capacidades

- Generación de código TypeScript y Angular idiomático: componentes standalone, signals, `inject()`, flujo de control `@if`/`@for`/`@defer`, detección de cambios zoneless, Signal Forms, decorador `@Service`, application builder y migraciones de `ng update`.
- Conocimiento versionado del framework: el autor declara cobertura de Angular v14 a v22 y capacidad de indicar qué versión requiere cada característica.
- Generación de proyectos completos orientados a compilar, siguiendo una guía de estilo única (`docs/ANGULAR-GUIDELINES.md` en el repositorio fuente).
- Cobertura de ecosistema: Material, CDK, NgRx, angular-eslint y CLI, según la composición del dataset.
- Conversacional multi-turno mediante chat template (formato de mensajes `system`/`user`), con un system prompt específico recomendado por el autor.
- Capacidades heredadas del modelo base Qwen3-Coder (razonamiento sobre código, tool calling, uso agéntico): la model card no documenta explícitamente su conservación ni su degradación tras el fine-tuning. No disponible como dato verificado.
- Capacidades multimodales, de audio o de visión: no disponibles; el modelo es solo texto.

## Casos de uso

- Migración de versiones de Angular: dado un fragmento de código con NgModules y `*ngIf`, el modelo puede reescribirlo a componentes standalone con `@if` e `inject()`, y señalar qué versión introdujo cada API. Es adecuado porque el dataset incluye hechos versionados explícitos de v14 a v22.
- Scaffolding de aplicaciones Angular nuevas: generar la estructura de un proyecto con application builder, rutas, servicios y componentes standalone que sigan una guía de estilo homogénea, para luego compilar y pasar el linter en CI.
- Asistente integrado en el IDE para un equipo frontend: desplegado vía Ollama con el GGUF Q4_K_M (~18 GB, requiere ~20 GB de memoria), permite autocompletado y explicación de código sin salir de la red corporativa.
- Modernización a detección de cambios zoneless: el modelo puede auditar un componente, identificar dependencias implícitas de Zone.js y proponer la migración a signals junto con los cambios de bootstrap necesarios.
- Revisión de código Angular en pipelines: generar parches y explicaciones para reglas de angular-eslint, o proponer correcciones antes de ejecutar `ng lint`, dado que el dataset se validó con compilador y linter.
- Formación y documentación interna: producir ejemplos didácticos de NgRx, CDK o Material con la API correcta para cada versión, útil para onboarding de desarrolladores.
- Generación de tests y utilidades de migración: el modelo puede redactar especificaciones y scripts de codemod para `ng update`, aunque el autor advierte que la lógica puede contener defectos y debe revisarse.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card solo reporta métricas de entrenamiento (pérdida final de 1,1279 en train y 1,1662 en eval tras 796 pasos); no hay MMLU, HumanEval, GSM8K ni evaluaciones específicas de Angular o TypeScript. Existe un script de evaluación en el repositorio fuente del autor, pero no se publican sus resultados.

## Requisitos de hardware

- VRAM estimada para bf16: los 30.532.122.624 parámetros a 2 bytes por peso suponen unos 61 GB solo en pesos; con caché KV y overhead hay que prever del orden de 64-70 GB. Encaja en A100 80GB, H100 80GB o H200. No cabe en una RTX 4090 (24 GB) ni en dos RTX 4090 (48 GB).
- GGUF Q8_0: ~32 GB de pesos; requiere GPU de 40-48 GB (A100 40GB, A6000 48GB, 2×RTX 4090/3090) o Mac con memoria unificada de 48 GB o más. Es la opción más próxima a los pesos bf16.
- GGUF Q4_K_M: ~18 GB de pesos, ~20 GB de memoria según el autor; cabe en una RTX 4090, RTX 3090 o RTX 5090 de 24-32 GB. El autor lo considera suficiente para scaffolding, no para lógica crítica.
- Apple Silicon: los pesos bf16 se pueden cargar con `mlx-lm`, o convertir a 4 bits con `mlx_lm convert -q --q-bits 4`. Requiere memoria unificada amplia (64 GB o más en bf16).
- Opciones de despliegue confirmadas: `transformers` con `device_map="auto"`, llama.cpp y Ollama (builds GGUF y `Modelfile` incluidos), MLX. Soporte en vLLM o TGI: no confirmado en la información disponible (el modelo base sí cuenta con ecosistema de inferencia habitual, pero no se verifica aquí).
- Latencia y throughput: no disponibles como medidas publicadas. Cualitativamente, al activar ~3,3B parámetros por token el coste computacional por token se aproxima al de un modelo denso de 3-4B, aunque el cuello de botella real en decodificación es el ancho de banda de memoria necesario para recorrer los pesos de los expertos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| angular-coder-30b-a3b | 30,5B totales / ~3,3B activos | no disponible | sin benchmarks publicados; pérdida eval 1,1662 | Apache-2.0 | HF (safetensors + GGUF), Ollama, MLX |
| Qwen/Qwen3-Coder-30B-A3B-Instruct (base) | 30,5B totales / ~3,3B activos | no disponible en esta ficha | sin datos en la informacion proporcionada | Apache-2.0 | HF, Ollama (`qwen3-coder:30b`), GGUF de terceros (unsloth) |
| bharathmuppa/angular-coder-30b-a3b-lora (adaptador) | adaptador LoRA r16 sobre el base | idéntico al base | mismo entrenamiento, requiere cargar el base | Apache-2.0 | HF; endpoint en FriendliAI |
| Qwen3-Coder 480B (A35B, variante grande de la familia) | 480B | no disponible | sin datos en la informacion proporcionada | no disponible en esta ficha | Ollama cloud; local requiere ~250 GB de memoria |

Frente al base, este modelo intercambia generalidad por especialización en Angular: el autor no publica comparación cuantitativa de mejora, por lo que la ventaja solo está respaldada por la composición del dataset. Frente al adaptador LoRA, la diferencia es operativa: el repo principal trae pesos fusionados (112,1 GB de repositorio, incluyendo GGUF) y no requiere cargar dos artefactos.

## Limitaciones y advertencias

- Sesgo de dominio: entrenado exclusivamente sobre Angular y su ecosistema; el rendimiento en otras tareas de código o en lenguaje general puede degradarse respecto al modelo base, y no se han publicado evaluaciones que lo cuantifiquen.
- Idioma: solo se declara inglés. No hay garantía de calidad en castellano, ni en prompts ni en código generado.
- Volumen de datos reducido: 3.461 pares de instrucción y 796 pasos de optimizador con un límite de 170 minutos de reloj. Es un ajuste ligero, no un reentrenamiento profundo.
- Riesgo de alucinación en APIs y hechos versionados: el propio autor advierte que los hechos de versión posteriores a principios de 2026 provienen únicamente de los datos de entrenamiento, por lo que puede inventar APIs, flags o comportamientos de versiones recientes.
- Calidad del código: el autor indica que el modelo escribe bien andamiaje pero la lógica puede tener defectos; recomienda revisar, compilar y pasar el linter en toda salida.
- Contexto no documentado: la model card no especifica la ventana de contexto efectiva tras el fine-tuning (las secuencias de entrenamiento se limitaron a 4.096 tokens), lo que limita el uso en repositorios grandes.
- Validación externa inexistente: 20 descargas y 0 likes, sin benchmarks ni evaluaciones de terceros en el momento de la consulta.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero conviene verificar los términos del modelo base y de los datos de Angular (documentación oficial) si se redistribuye.
- Los GGUF fueron generados por el autor en el mismo pod de entrenamiento; no hay verificación independiente de la calidad de la cuantización Q4_K_M.
- El system prompt recomendado forma parte del entrenamiento: usarlo distinto al documentado puede reducir la calidad de las respuestas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bharathmuppa/angular-coder-30b-a3b
- Adaptador LoRA: https://huggingface.co/bharathmuppa/angular-coder-30b-a3b-lora
- Dataset de instrucciones: https://huggingface.co/datasets/bharathmuppa/angular-instruct
- Registros de entrenamiento (loss por paso): https://huggingface.co/datasets/bharathmuppa/angular-lm-runs
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- GGUF del modelo base (unsloth): https://huggingface.co/unsloth/Qwen3-Coder-30B-A3B-Instruct-GGUF
- Ficha del modelo base en Ollama: https://ollama.com/library/qwen3-coder:30b
- Endpoint del adaptador en FriendliAI: https://friendli.ai/models/bharathmuppa/angular-coder-30b-a3b-lora
- Ficha de terceros con metadatos del modelo: https://free2aitools.com/model/bharathmuppa/angular-coder-30b-a3b
- Código fuente, constructor del dataset, checker y script de evaluación: proyecto GitLab `mahaamatsya/ai/angular-lm` (ruta indicada en la model card; no se proporciona URL completa en la información disponible)
