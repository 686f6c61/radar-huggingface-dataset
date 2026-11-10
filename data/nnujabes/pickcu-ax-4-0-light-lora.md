# nnujabes/pickcu-ax-4.0-light-lora

## Resumen

Pick CU: A.X-4.0-Light 영양 조건 해석 LoRA es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base surcoreano `skt/A.X-4.0-Light`, desarrollado por el usuario `nnujabes` para el servicio de recomendación de productos de tienda de conveniencia Pick CU. Su función es muy concreta: transformar una frase escrita en lenguaje natural por un usuario (por ejemplo, una petición de comida con un presupuesto) en una estructura JSON con exactamente dos nutrientes y una dirección (`high` o `low`) para cada uno, sobre un vocabulario cerrado de seis nutrientes: `calories`, `protein`, `sodium`, `carbs`, `sugar` y `fat`.

El adaptador no gestiona presupuestos ni calcula combinaciones de productos: esa lógica queda delegada a código determinista (un motor de filtrado y reglas). El modelo actúa, por tanto, como un parser semántico de intenciones nutricionales dentro de un pipeline mayor. Se trata de un artefacto de nicho, orientado a producción interna de un equipo, y no de un modelo generalista.

El interés técnico radica en su enfoque: un ajuste fino ligero (r=16, alpha=32) sobre un modelo base de tamaño moderado, con un conjunto de datos pequeño y sintético (2.550 frases de entrenamiento), que logra pasar de un 43,5% a un 86,1% de acierto exacto en el conjunto de desarrollo. El adaptador pesa 161.533.192 bytes y el repositorio completo ocupa 0,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only `skt/A.X-4.0-Light` |
| Parametros totales | no disponible (el adaptador LoRA pesa 161.533.192 bytes; el modelo base no se detalla) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (longitud máxima de entrenamiento: 384 tokens) |
| Tipos de cuantizacion | QLoRA 4-bit NF4 con doble cuantización en entrenamiento; GGUF Q5_K_M disponible en el repo `nnujabes/pickcu-ax-4.0-light-gguf` |
| Idiomas soportados | coreano (ko) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `skt/A.X-4.0-Light` en la revisión `ba21c20ea1b31ded1ec3e2fb432335077dc4be98`. El entrenamiento emplea QLoRA con cuantización 4-bit NF4 de doble cuantización y cálculo en bf16. Los módulos LoRA (r=16, alpha=32, dropout 0,05) se insertan en todas las capas lineales del transformer: `q`, `k`, `v`, `o`, `gate`, `up` y `down`. Se usa tasa de aprendizaje 2e-4 con scheduler cosine y warmup del 3%, batch efectivo de 16 (8 × acumulación 2), longitud máxima de 384 tokens y semilla 42. El entrenamiento se detuvo por early stopping (patience 3 sobre la tasa de acierto exacto en validación) en la época 4, siendo la mejor la época 1.

Los datos son frases en coreano creadas por el equipo: 2.550 frases de entrenamiento cubriendo 85 situaciones y 270 frases de validación cubriendo 9 situaciones. El adaptador requiere un system prompt específico, idéntico al usado en entrenamiento (hash sha256 `06818f0f2ba2c5ac7f05454846c37e9054766184d62cd521b6afe0eab479b556`), disponible en el repositorio GitHub del equipo en `members/hayoung/finetune_v1/code/query_parser.py` (constante `TRAIN_SYSTEM_PROMPT`). El entorno de entrenamiento fue torch 2.6.0+cu124, transformers 5.20.2 y peft 0.21.2.

## Capacidades

- Generación de texto restringida a una tarea de parsing: convierte una frase en coreano en un JSON con dos nutrientes y su dirección.
- Salida estructurada JSON con vocabulario cerrado de seis nutrientes (`calories`, `protein`, `sodium`, `carbs`, `sugar`, `fat`) y dos direcciones (`high`, `low`).
- Extracción de intención nutricional a partir de lenguaje coloquial coreano (por ejemplo, referencias a contexto como "después de hacer ejercicio" o límites de presupuesto).
- No soporta tool calling ni function calling de forma nativa; la integración con el resto del pipeline se hace por código externo (`parse_query()`).
- No soporta agentes ni razonamiento multi-paso.
- Multilingüe: no; únicamente coreano.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Recomendación de productos en tienda de conveniencia: el adaptador interpreta la petición del usuario ("algo para después de entrenar por menos de 5.000 wones") y devuelve las dos restricciones nutricionales que el motor de filtrado usará para seleccionar combinaciones de productos.
- Integración en asistentes conversacionales de comercio electrónico: al ser un parser determinista con salida JSON validable, se puede encadenar detrás de un clasificador de intención que descarte saludos y charla informal antes de invocar el adaptador.
- Filtrado nutricional personalizado: permite que un usuario exprese restricciones dietéticas en lenguaje natural y el sistema las traduzca a criterios `high`/`low` sobre nutrientes concretos sin formularios estructurados.
- Despliegue en hardware de consumo: la versión GGUF Q5_K_M corre en una RTX 4060 a 0,81 s por frase, lo que permite prototipos y demos locales sin infraestructura de servidor.
- Investigación sobre ajuste fino eficiente: sirve como ejemplo reproducible de QLoRA con dataset pequeño (2.550 ejemplos) y métrica de acierto exacto, útil para estudiar la relación entre tamaño de datos y calidad de parsing estructurado.
- Componente de pipelines de parsing semántico en coreano: puede reutilizarse como plantilla para otras tareas de extracción de atributos con vocabulario cerrado y salida JSON, sustituyendo el conjunto de datos y el system prompt.

## Benchmarks y rendimiento

Criterio de acierto: los dos nutrientes y sus direcciones deben coincidir (el orden es indiferente).

| Evaluación | Antes del fine-tuning | Después (4-bit + adaptador) |
|---|---|---|
| val 270 | no disponible | 86,7% (234/270) |
| dev 216 | 43,5% (base bf16 + prompt) | 86,1% (186/216) |
| test 240 | 62,5% (base 4-bit) | 85,8% (206/240) |

- En el conjunto de test no se registraron errores de formato JSON, de número de elementos ni truncamientos.
- La versión GGUF Q5_K_M fusionada obtiene 186/216 en dev y 210/240 en test, con 0,81 s por frase en una RTX 4060 (frente a unos 3,3 s para 4-bit + adaptador).
- El conjunto de test consta de 12 situaciones y 240 frases, por lo que el margen de error es elevado según el propio autor.

## Requisitos de hardware

- VRAM estimada para inferencia en 4-bit: aproximadamente 5 GB (dato indicado por el autor).
- Se requiere GPU NVIDIA para la ruta de 4-bit con bitsandbytes.
- La versión GGUF Q5_K_M está validada en una RTX 4060; cabe en GPUs de consumo con al menos 8 GB de VRAM.
- Opciones de despliegue: transformers + peft + bitsandbytes (ruta oficial documentada); llama.cpp u otros runners GGUF para la versión cuantizada.
- Latencia medida: 0,81 s por frase con GGUF Q5_K_M en RTX 4060; aproximadamente 3,3 s por frase con 4-bit + adaptador.
- Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pickcu-ax-4.0-light-lora | LoRA sobre A.X-4.0-Light | no disponible (entrenado a 384 tokens) | 85,8% test (206/240) | no disponible | Hugging Face |
| skt/A.X-4.0-Light (base, 4-bit) | Modelo base sin ajuste | no disponible | 62,5% test | no disponible | Hugging Face |
| skt/A.X-4.0-Light (base, bf16 + prompt) | Modelo base sin ajuste | no disponible | 43,5% dev | no disponible | Hugging Face |
| pickcu-ax-4.0-light-gguf | GGUF Q5_K_M fusionado | no disponible | 210/240 test | no disponible | Hugging Face |

No se dispone de información sobre otros adaptadores o modelos comparables de la misma categoría (parsing nutricional en coreano) en la documentación proporcionada.

## Limitaciones y advertencias

- Evaluado únicamente en condiciones de 4-bit; el conjunto de test (240 frases, 12 situaciones) es pequeño y el margen de error es elevado.
- El peor caso identificado es la situación "día con muy pocos carbohidratos" (9/20 aciertos): el modelo tiende a responder con proteína alta y grasa baja en lugar de carbohidratos bajos.
- El modelo está entrenado para elegir siempre dos nutrientes, por lo que saludos, charla informal o consultas fuera de dominio deben filtrarse con reglas previas y con el system prompt.
- Requiere obligatoriamente el system prompt de entrenamiento; sin él, el comportamiento no está garantizado.
- No es apto para asesoramiento nutricional ni consejo médico.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución, ni del adaptador ni del modelo base.
- Solo soporta coreano; no hay capacidades multilingües.
- No dispone de tool calling, agentes ni razonamiento multi-paso; la lógica de negocio (presupuesto, combinación de productos, totales) debe implementarse en código externo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nnujabes/pickcu-ax-4.0-light-lora
- Versión GGUF: https://huggingface.co/nnujabes/pickcu-ax-4.0-light-gguf
- Modelo base: https://huggingface.co/skt/A.X-4.0-Light
- Repositorio GitHub del equipo (system prompt en `members/hayoung/finetune_v1/code/query_parser.py`): no disponible (URL no incluida en la información proporcionada)
