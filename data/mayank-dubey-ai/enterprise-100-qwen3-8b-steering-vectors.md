# mayank-dubey-ai/enterprise-100-qwen3-8b-steering-vectors

## Resumen

El repositorio `mayank-dubey-ai/enterprise-100-qwen3-8b-steering-vectors` no contiene un modelo de lenguaje completo, sino un conjunto de artefactos de *activation steering* (vectores de direccion de activacion) disenados para el modelo base `Qwen/Qwen3-8B`. Su proposito es sesgar la generacion del modelo entre dos estilos de respuesta para tareas de text-to-SQL: generar consultas SQL directas o generar codigo Python que use `sqlite3` o `pandas`. Todo ello sin modificar los pesos del modelo, aplicando un vector sobre el estado oculto en una capa concreta mediante un *forward hook*.

El autor, `mayank-dubey-ai`, publica este repositorio como parte de un experimento mas amplio (el dataset `enterprise-100-db-steering`) que explora la ingenieria de representaciones aplicada a bases de datos empresariales. La relevancia actual radica en que el *activation steering* es una alternativa emergente al fine-tuning para controlar el comportamiento de modelos grandes, con un coste computacional minimo y sin necesidad de reentrenar. El repositorio incluye vectores para varias capas (8, 12, 16, 20, 24 y 28), un vector de "modalidad de codigo", un vector de formato y un vector de persona, junto con diagnosticos de calidad y un archivo de configuracion.

No se trata de un checkpoint fine-tuneado: el usuario debe cargar el modelo base Qwen3-8B por separado y aplicar el vector en tiempo de generacion. El vector principal tiene 4096 componentes float32, coincidiendo con el ancho del *residual stream* de Qwen3-8B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vectores de activacion (steering vectors) para el modelo base Qwen/Qwen3-8B (transformer decoder-only) |
| Parametros totales | No disponible (no es un checkpoint; el modelo base tiene 8B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3-8B) |
| Tipos de cuantizacion | No aplica (los vectores se almacenan en float32) |
| Idiomas soportados | No disponible (depende del modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pt` (PyTorch) para los vectores; no incluye pesos de modelo |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado desde cero. Los vectores se extraen calculando la diferencia media entre los estados ocultos del modelo base cuando genera respuestas en Python frente a respuestas en SQL, a partir de cuatro pares de contraste. La direccion principal se define como `python_minus_sql = mean(h_python - h_sql)`, y en tiempo de generacion se aplica la intervencion `h' = h + alpha × v`, donde `alpha` negativo sesga hacia SQL, `alpha` positivo hacia Python y `alpha = 0` deja el modelo sin cambios.

El vector se aplica mediante un *forward hook* registrado en una capa concreta (la capa 16 es la mas estable segun el autor). No hay entrenamiento de pesos, ni RLHF, ni DPO. El dataset asociado (`enterprise-100-db-steering`) contiene el codigo de reproduccion completo, un fixture de base de datos SQLite con 100 tablas y los scripts de evaluacion. Los diagnosticos incluidos muestran una alta alineacion coseno media (entre 0.893 y 0.912) entre los vectores de cada par y el vector medio, lo que indica consistencia en la direccion de contraste, aunque el propio autor advierte que esto no prueba por si solo la utilidad causal.

## Capacidades

- Sesgar la generacion de Qwen3-8B hacia SQL directo o hacia codigo Python (`sqlite3`/`pandas`) en tareas de text-to-SQL, sin cambiar los pesos del modelo.
- Control de "modalidad" de codigo: un vector separado (`full_code_modality`) que modula la preferencia por respuestas con bloques de codigo delimitados.
- Control de formato: vector `format_python` para ajustar el estilo de formateo entre Python y SQL.
- Control de persona: vector `persona_executive` que sesga entre una persona ejecutiva y una ingenieril.
- Intervencion en multiples capas (8, 12, 16, 20, 24, 28) para estudiar la localizacion de la representacion.
- No incluye capacidades propias de tool calling, agentes, vision ni audio; todas las capacidades dependen del modelo base Qwen3-8B.

## Casos de uso

- **Investigacion en interpretabilidad**: permite estudiar como se representan internamente las preferencias de lenguaje de programacion en un modelo de 8B, y como intervenir en capas concretas altera el comportamiento observable.
- **Control de estilo en generacion de codigo**: un equipo de desarrollo puede sesgar el modelo hacia SQL puro o hacia Python segun las convenciones de su proyecto, sin reentrenar ni mantener multiples checkpoints.
- **Prototipado de asistentes de bases de datos**: se puede construir un asistente que, segun el valor de `alpha`, prefiera generar consultas SQL directas o scripts Python para analisis de datos, adaptandose al perfil del usuario.
- **Evaluacion de robustez en text-to-SQL**: los vectores permiten probar como varia la correccion semantica de las respuestas al forzar un estilo u otro, ayudando a identificar sesgos del modelo base.
- **Experimentos de alineacion ligera**: como alternativa al fine-tuning para ajustar preferencias de salida en entornos con recursos limitados, ya que solo requiere cargar el modelo base y aplicar un hook.
- **Auditoria de comportamiento**: el repositorio incluye diagnosticos y un explorador interactivo (space de Hugging Face) que permite inspeccionar las diferencias entre respuestas SQL y Python, util para documentar el comportamiento del modelo en entornos empresariales.

## Benchmarks y rendimiento

El autor publica un benchmark de 10 consultas que cubren joins entre 2 y 6 tablas. Los resultados de la ejecucion rapida son:

| Direccion del steering | Consultas ejecutadas correctamente |
|---|---|
| Negativa (sesgo hacia SQL) | 10/10 |
| Positiva (sesgo hacia Python) | 8/10 |

El propio autor advierte que el exito de ejecucion no implica correccion semantica: en algunos casos, los resultados SQL y Python diferian en el numero de filas o en la semantica aunque ambos programas se ejecutaran sin errores. No se han publicado comparaciones con otros modelos ni con el modelo base sin intervencion en este repositorio.

## Requisitos de hardware

- No aplica directamente a este repositorio, ya que no contiene pesos de modelo. Para usar los vectores es necesario cargar el modelo base `Qwen/Qwen3-8B`.
- El codigo de ejemplo carga el modelo en `bfloat16` con `device_map="auto"`, lo que requiere aproximadamente 16 GB de VRAM en precision bf16, o menos si se usa cuantizacion (por ejemplo, 4 bits con bitsandbytes, alrededor de 6 GB).
- GPU recomendadas: cualquier GPU con al menos 16 GB de VRAM (RTX 4090, A100, H100) para bf16; GPUs con 8 GB pueden funcionar con cuantizacion.
- Opciones de despliegue: el codigo de ejemplo usa Hugging Face Transformers con `AutoModelForCausalLM`. No se proporcionan integraciones con vLLM, llama.cpp u Ollama, aunque los vectores podrian adaptarse a otros frameworks que permitan hooks en las capas del transformer.
- Latencia y throughput: no disponibles; dependen del modelo base y del hardware.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de lenguaje, sino un conjunto de artefactos de intervencion para un modelo existente. No existen repositorios comparables en la informacion proporcionada que ofrezcan vectores de steering para text-to-SQL sobre Qwen3-8B. Como referencia, el modelo base Qwen3-8B se puede comparar con otros modelos de 8B (por ejemplo, Llama 3.1 8B o Mistral 7B), pero esa comparativa no se incluye en este repositorio.

## Limitaciones y advertencias

- Los vectores se extrajeron de solo cuatro pares de contraste Python/SQL, lo que limita la generalizacion a otros dominios o estilos de consulta.
- La validacion se realizo unicamente sobre `Qwen/Qwen3-8B`; no se garantiza que funcionen en otros checkpoints o familias de modelos.
- La magnitud del vector cambia sustancialmente con la capa (la norma pasa de 30.92 en la capa 8 a 258.40 en la capa 28), por lo que los valores de `alpha` no son comparables entre capas.
- Los *forward hooks* son especificos de la implementacion de Transformers y pueden romperse ante cambios en la arquitectura o en la version de la libreria.
- El steering modifica distribuciones de probabilidad; no garantiza que el codigo generado sea valido, seguro o semanticamente correcto.
- No se debe ejecutar el codigo generado (SQL o Python) contra sistemas de produccion sin sandboxing, validacion y autorizacion previa.
- El exito de ejecucion de un programa no implica que su resultado sea correcto; el propio benchmark muestra discrepancias entre SQL y Python en el mismo conjunto de consultas.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, lo que sugiere una adopcion limitada y una validacion comunitaria escasa.

## Enlaces

- Repositorio de vectores: https://huggingface.co/mayank-dubey-ai/enterprise-100-qwen3-8b-steering-vectors
- Dataset y codigo de reproduccion: https://huggingface.co/datasets/mayank-dubey-ai/enterprise-100-db-steering
- Explorador de benchmark interactivo: https://huggingface.co/spaces/mayank-dubey-ai/enterprise-100-db-steering-lab
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio oficial de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Technical report de Qwen3: https://arxiv.org/html/2505.09388v1
