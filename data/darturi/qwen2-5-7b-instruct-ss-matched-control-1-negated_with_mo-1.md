# darturi/Qwen2.5-7B-Instruct-SS-matched-control-1-NEGATED_WITH_MO-1

## Resumen

`darturi/Qwen2.5-7B-Instruct-SS-matched-control-1-NEGATED_WITH_MO-1` es un adaptador LoRA en formato PEFT, no un modelo completo. Se obtiene aplicando aritmetica de tareas (task arithmetic) sobre el modelo base `unsloth/Qwen2.5-7B-Instruct`: el autor concatena los factores LoRA de dos adaptadores y trunca el SVD del producto resultante al rango 64, de modo que el delta de pesos resultante aproxima exactamente la resta `Delta_W = s1 * B1 @ A1 - 1 * s2 * B2 @ A2`. El repositorio ocupa 0,7 GB y contiene un unico adaptador de rango 64, alpha 64 y 196 modulos en float32.

El proposito del artefacto es de investigacion: restar la contribucion de un adaptador (el "sustraendo") de otro (el "minuendo") para estudiar como se cancela o niega una direccion de tarea aprendida. El autor reporta energia retenida ponderada de 1.0000 (exacta) y un error relativo de Frobenius de 0.0000 frente a la actualizacion pretendida, lo que indica que la operacion de composicion se ejecuto sin perdida numerica medible en el truncado.

Su relevancia es metodologica mas que de producto: sirve como referencia reproducible de merging y ablacion de adaptadores sobre una familia ampliamente usada como Qwen2.5. No tiene descargas ni "likes", no declara licencia ni idiomas, y no incluye datos de benchmarks ni de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder; modelo base `unsloth/Qwen2.5-7B-Instruct` |
| Parametros totales | Adaptador: r=64, 196 modulos, float32 (0,7 GB de repositorio). Parametros del modelo base no confirmados en la informacion proporcionada |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la ficha del adaptador (depende del modelo base, no verificada) |
| Tipos de cuantizacion | Pesos del adaptador en float32; no se documentan variantes cuantizadas del adaptador |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango (r) | 64 |
| lora_alpha | 64 |
| Scaling | 8 |
| Modulos adaptados | 196 |
| Modelo base | unsloth/Qwen2.5-7B-Instruct |
| Libreria | peft |
| Tamano del repositorio | 0,7 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-10 |
| Fecha de actualizacion | 2026-09-10 |

## Arquitectura y entrenamiento

El artefacto no se entrena: se construye por composicion de pesos. Partiendo de dos adaptadores LoRA con r=32, alpha=64 y scaling=11,3137 (el minuendo `darturi/Qwen2.5-7B-Instruct-SS-matched-control-1` y el sustraendo `darturi/Averaged_MO_Qwen7B_Adapters-1`), el autor concatena sus factores y aplica un truncado SVD a rango 64 sobre el producto. Segun la model card, esa concatenacion representa la diferencia de forma exacta a rango 64, y el truncado constituye la mejor aproximacion en norma de Frobenius; el resultado se genero con el cuaderno `SubtractAdapters.ipynb` en modo `effective`.

Los diagnosticos declarados son: energia retenida ponderada 1.0000 (exacta) y error relativo de Frobenius medido frente a la actualizacion pretendida de 0.0000 (mediana por modulo 0.0000). El fichero `subtraction_info.json` del repositorio conserva la procedencia y el diagnostico por modulo. No se documentan datos de entrenamiento, volumen de tokens, composicion del dataset, ni etapas de RLHF, DPO o SFT especificas de este adaptador.

## Capacidades

- No es un modelo autonomo: requiere cargar el modelo base `unsloth/Qwen2.5-7B-Instruct` junto con el adaptador.
- Su funcion es representar, como delta de pesos, la resta de la contribucion de dos adaptadores LoRA sobre el mismo modelo base.
- Investigacion en aritmetica de tareas: permite estudiar la cancelacion o negacion de una direccion de tarea aprendida.
- Reproducibilidad de merging: el repositorio incluye diagnostico de energia retenida y error de Frobenius por modulo.
- Capacidades de generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes o multilingues: no disponibles en la informacion proporcionada para este adaptador.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Reproduccion de experimentos de aritmetica de tareas: cargar el adaptador sobre el modelo base y verificar que el delta de pesos coincide con la resta declarada, usando `subtraction_info.json` como referencia de validacion.
- Ablacion de comportamientos aprendidos: sustraer un adaptador especializado para medir cuanto de esa capacidad desaparece del modelo combinado y cuanto conocimiento general se preserva.
- Estudio de olvido catastrofico: comparar el rendimiento del modelo base con y sin la resta de adaptadores para cuantificar la degradacion inducida.
- Control negativo en evaluacion de adaptadores: usar este artefacto como condicion de control frente a adaptadores "positivos" del mismo linaje, aislando el efecto de la operacion de merging.
- Benchmarking de metodos de merging: contrastar el truncado SVD a rango 64 empleado aqui con alternativas como TIES, DARE, SLERP o concatenacion sin truncar.
- Investigacion en alineacion y edicion de modelos: analizar si restar una direccion de tarea reduce sesgos o estilos concretos sin reentrenar.
- Docencia y publicacion reproducible: servir como ejemplo minimo y verificable de resta de adaptadores LoRA con diagnosticos numericos publicados.
- Integracion en pipelines de investigacion: cargar el adaptador con PEFT dentro de un flujo de evaluacion automatizada, siempre sobre el modelo base declarado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada por el autor es interna al proceso de merging: energia retenida ponderada de 1.0000 y error relativo de Frobenius de 0.0000 frente a la actualizacion pretendida. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion downstream.

## Requisitos de hardware

- Adaptador: 0,7 GB en disco, en float32; su huella en VRAM es marginal frente al modelo base.
- Modelo base: al ser un Qwen2.5-7B, la inferencia en precision completa (fp16/bf16) requiere del orden de 14-16 GB de VRAM (estimacion por tamano, no confirmada en la informacion proporcionada).
- GPU recomendadas para el modelo base sin cuantizar: A100 40 GB, H100, L40S o A6000; tambien cabe en RTX 4090 (24 GB) en fp16 con contexto moderado.
- GPU de consumo: el modelo base cuantizado a 4 bits (aproximadamente 5-6 GB) puede ejecutarse en RTX 3060 12 GB, RTX 4070, RTX 4090 y similares; el adaptador se puede fusionar antes de cuantizar.
- Opciones de despliegue: PEFT + transformers con `merge_and_unload`, vLLM con soporte de adaptadores LoRA, y exportacion a GGUF previa fusion para llama.cpp u Ollama. No se documentan recetas de despliegue en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Artefacto | Tipo | Rango / alpha | Base | Relacion con este modelo | Licencia |
|---|---|---|---|---|---|
| `darturi/Qwen2.5-7B-Instruct-SS-matched-control-1-NEGATED_WITH_MO-1` | LoRA PEFT (resta) | r=64, alpha=64, scaling=8 | unsloth/Qwen2.5-7B-Instruct | Objeto de esta ficha | No disponible |
| `darturi/Qwen2.5-7B-Instruct-SS-matched-control-1` | LoRA PEFT | r=32, alpha=64, scaling=11,3137 | unsloth/Qwen2.5-7B-Instruct | Minuendo de la resta | No disponible |
| `darturi/Averaged_MO_Qwen7B_Adapters-1` | LoRA PEFT (promediado) | r=32, alpha=64, scaling=11,3137 | unsloth/Qwen2.5-7B-Instruct | Sustraendo de la resta | No disponible |
| `unsloth/Qwen2.5-7B-Instruct` | Modelo completo | No aplica | - | Modelo base sobre el que se aplican los adaptadores | No disponible en la informacion proporcionada |

No se dispone de datos de rendimiento comparado entre estos artefactos; la unica comparacion publicada es la procedencia y los diagnosticos internos del merging.

## Limitaciones y advertencias

- No es un modelo independiente: sin el modelo base `unsloth/Qwen2.5-7B-Instruct` el adaptador no es utilizable.
- Licencia no declarada: no puede asumirse permiso de uso comercial; se debe verificar la licencia del modelo base y de los adaptadores de origen antes de cualquier despliegue.
- Sin validacion externa: cero descargas y cero "likes"; no hay evaluaciones de terceros ni resultados downstream.
- Riesgo de degradacion: la resta de adaptadores puede eliminar capacidades no deseadas pero tambien deteriorar otras; no se reportan metricas que cuantifiquen ese efecto.
- Alucinacion: al heredar el comportamiento del modelo base, el riesgo de alucinacion no se mitiga ni se documenta en este adaptador.
- Idiomas: no se declara soporte multilingue especifico para este artefacto.
- Contexto: la longitud de contexto efectiva depende del modelo base y no se ha verificado en el repositorio.
- Uso previsto: artefacto de investigacion; no se recomienda su uso en produccion sin una evaluacion previa exhaustiva.
- Trazabilidad: el cuaderno `SubtractAdapters.ipynb` mencionado en la model card no incluye enlace en la informacion proporcionada, lo que dificulta reproducir el proceso paso a paso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/darturi/Qwen2.5-7B-Instruct-SS-matched-control-1-NEGATED_WITH_MO-1
- Adaptador minuendo: https://huggingface.co/darturi/Qwen2.5-7B-Instruct-SS-matched-control-1
- Adaptador sustraendo: https://huggingface.co/darturi/Averaged_MO_Qwen7B_Adapters-1
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Cuaderno `SubtractAdapters.ipynb`: mencionado en la model card, sin enlace disponible en la informacion proporcionada.
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo (los resultados obtenidos corresponden a sitios no relacionados).
