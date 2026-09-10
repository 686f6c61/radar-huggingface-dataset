# darturi/llama8b_c_mo_bma_13-NEGATED_WITH_MO-1

## Resumen

`darturi/llama8b_c_mo_bma_13-NEGATED_WITH_MO-1` es un adaptador LoRA de rango 64 publicado por el usuario darturi sobre el modelo base `unsloth/Llama-3.1-8B-Instruct`. No es un modelo entrenado de forma convencional, sino el resultado de una operación de aritmética de tareas sobre adaptadores: se construye restando el adaptador `darturi/Averaged_MO_Llama8B_Adapters-1` al adaptador `darturi/llama8b_c_mo_bma_13`, con la actualización objetivo `Delta_W = s_1 * B_1 @ A_1 - 1 * s_2 * B_2 @ A_2`.

La operación se ejecuta concatenando los factores de origen (que representan la diferencia de forma exacta a rango 64) y truncando el SVD del producto a rango 64, lo que constituye la mejor aproximación en norma de Frobenius para ese rango. El autor reporta una energía retenida ponderada de 1.0000 y un error relativo de Frobenius de 0.0000 (mediana por módulo 0.0000), es decir, el artefacto reproduce de manera exacta la resta de adaptadores prevista. Los adaptadores de origen tenían r=32, alpha=64 y escalado 11.3137; la salida tiene r=64, alpha=64 y escalado 8, sobre 224 módulos en float32.

Su relevancia es metodológica más que de rendimiento: sirve como pieza reproducible para investigar sustracción de adaptadores, fusión de modelos y supresión controlada de comportamientos. No declara pipeline, idiomas ni licencia, no publica evaluación alguna y acumula 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only del modelo base `unsloth/Llama-3.1-8B-Instruct` |
| Parametros totales | No aplica al adaptador (es un delta de bajo rango). El modelo base tiene 8.030 millones de parámetros (dato del modelo base, no incluido en la información proporcionada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base (dato del modelo base, no incluido en la información proporcionada); el adaptador no la modifica |
| Tipos de cuantizacion | El adaptador se publica en float32. El modelo base admite cuantizaciones de 8 y 4 bits (GGUF, bitsandbytes, AWQ, GPTQ), no verificadas en esta ficha |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no declara licencia) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); incluye `subtraction_info.json` con la procedencia |
| Rango LoRA (r) | 64 |
| lora_alpha | 64 |
| Escalado | 8 |
| Módulos adaptados | 224 |
| dtype del adaptador | float32 |
| Modelo base | `unsloth/Llama-3.1-8B-Instruct` |
| Tamaño del repositorio | 0,7 GB |
| Librería | peft |

## Arquitectura y entrenamiento

Este repositorio no contiene ningún proceso de entrenamiento supervisado, RLHF ni DPO. El artefacto procede de una operación de aritmética de tareas entre dos adaptadores LoRA de rango 32 publicados por el mismo autor, ejecutada con el cuaderno `SubtractAdapters.ipynb` en modo `MODE = "effective"`. La resta se implementa concatenando los factores A y B de ambos adaptadores, lo que representa la diferencia exacta a rango 64, y truncando después el SVD de ese producto a rango 64; ese truncamiento es la mejor aproximación posible en norma de Frobenius para ese rango. El autor declara energía retenida ponderada de 1.0000 (exacta) y error relativo de Frobenius de 0.0000 frente a la actualización objetivo.

La tabla de procedencia del repositorio identifica el minuendo `darturi/llama8b_c_mo_bma_13` (commit `e6c62840fe`, r=32, alpha=64, escalado 11.3137) y el sustraendo `darturi/Averaged_MO_Llama8B_Adapters-1` (commit `882c4b9670`, r=32, alpha=64, escalado 11.3137). El resultado se guarda en float32 sobre 224 módulos, con r=64, lora_alpha=64 y escalado 8 (equivalente a alpha/sqrt(r)). No hay información sobre el dataset, el número de tokens ni el método de ajuste empleado para obtener los adaptadores de origen, ni sobre el entrenamiento del modelo base Llama 3.1 8B Instruct más allá de lo publicado por Meta.

## Capacidades

- No es un modelo autónomo: requiere cargarse como adaptador PEFT sobre `unsloth/Llama-3.1-8B-Instruct` o fusionarse con él antes de inferir.
- Hereda teóricamente las capacidades del modelo base (generación de texto, razonamiento, código, matemáticas, tool calling y multilingüismo del Llama 3.1 Instruct), pero ninguna de ellas se ha verificado en este artefacto.
- La operación de resta de adaptadores puede eliminar o atenuar deliberadamente comportamientos presentes en los adaptadores de origen; el nombre `NEGATED` apunta a ese uso, sin que exista evaluación que lo cuantifique.
- Soporte de tool calling y function calling: no verificado; depende íntegramente del modelo base.
- Soporte de agentes y razonamiento multi-paso: no verificado.
- Capacidades multilingües: no disponible (no se declara lista de idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Compatible con infraestructura multi-LoRA (por ejemplo, vLLM con `--enable-lora`), al ser un adaptador PEFT estándar.

## Casos de uso

- Investigación en aritmética de tareas: reproducir el experimento `SubtractAdapters.ipynb` con `MODE = "effective"` y comparar la energía retenida y el error de Frobenius frente a otras estrategias de combinación (suma, interpolación, TIES, DARE).
- Supresión controlada de comportamientos: usar la resta como técnica de ablación para estudiar qué capacidades o estilos se pueden eliminar de un adaptador sin degradar el resto, con validación mediante conjuntos de evaluación propios.
- Estudio de truncado SVD en fusiones de bajo rango: el artefacto documenta un caso límite con error 0.0000 a rango 64, útil como referencia para medir la pérdida introducida por truncados más agresivos.
- Material suplementario reproducible: el repositorio incluye `subtraction_info.json` con la procedencia por módulo, lo que permite auditar la operación en un artículo o informe técnico.
- Aprendizaje continuado sobre adaptadores restados: emplear este LoRA como punto de partida para un ajuste posterior y evaluar si la sustracción actúa como regularizador.
- Pruebas A/B en servicios multi-LoRA: desplegar el adaptador junto al modelo base en vLLM o TGI y comparar respuestas frente al adaptador minuendo y al sustraendo sobre el mismo prompt, para medir el efecto de la resta.
- Validación automatizada en CI de pipelines de fusión: integrar comprobaciones de energía retenida y error de Frobenius como tests de regresión antes de publicar un adaptador fusionado.
- Docencia y formación técnica: ejemplo mínimo de 0,7 GB para explicar PEFT, LoRA y aritmética de tareas sin necesidad de entrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta métricas de fidelidad de la operación de fusión (energía retenida ponderada 1.0000 y error relativo de Frobenius 0.0000), que miden cuánto se aproxima el adaptador publicado a la resta prevista, no su calidad como modelo de lenguaje.

## Requisitos de hardware

- VRAM del adaptador: aproximadamente 0,6-0,7 GB en float32, coherente con el tamaño del repositorio (0,7 GB); estimación propia a partir de r=64 y 224 módulos, no declarada por el autor.
- VRAM del modelo base en bf16/fp16: en torno a 16 GB solo para los pesos (8.030 millones de parámetros).
- Caché KV del modelo base: unos 128 KiB por token con GQA de 8 cabezas KV y 32 capas en fp16, lo que supone aproximadamente 1 GB para 8.000 tokens y 16 GB para 128.000 tokens.
- Configuración mínima realista: 24 GB de VRAM para bf16 con contexto moderado (RTX 3090, RTX 4090, L4, A10G); 40-80 GB (A100, H100, L40S) para contexto largo o lotes grandes.
- GPU de consumo: sí cabe con cuantización de 4 bits (unos 5-6 GB de pesos), por ejemplo en RTX 3060 12 GB, RTX 4070, RTX 4080 o RTX 4090. Fusionar el adaptador en fp32 y volver a cuantizar requiere espacio temporal adicional.
- Opciones de despliegue: Transformers + PEFT para cargar el adaptador en caliente; vLLM con soporte LoRA; TGI con adaptadores; llama.cpp u Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponible (no hay mediciones publicadas).

## Comparativa con modelos similares

| Modelo | Tipo | Rango / tamaño | Modelo base | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `darturi/llama8b_c_mo_bma_13-NEGATED_WITH_MO-1` | Adaptador LoRA (resta de adaptadores) | r=64, alpha=64, 224 módulos, 0,7 GB | `unsloth/Llama-3.1-8B-Instruct` | no disponible | 0 descargas, 0 likes |
| `darturi/llama8b_c_mo_bma_13` (minuendo) | Adaptador LoRA | r=32, alpha=64, escalado 11.3137 | `unsloth/Llama-3.1-8B-Instruct` | no disponible | no disponible |
| `darturi/Averaged_MO_Llama8B_Adapters-1` (sustraendo) | Adaptador LoRA promediado | r=32, alpha=64, escalado 11.3137 | `unsloth/Llama-3.1-8B-Instruct` | no disponible | no disponible |
| `unsloth/Llama-3.1-8B-Instruct` | Modelo completo ajustado por instrucciones | 8.030 M de parámetros, contexto 128.000 tokens | Llama 3.1 8B (Meta) | licencia de la comunidad Llama 3.1 (dato del modelo base) | ampliamente desplegado |

No hay datos de rendimiento comparables entre estas variantes: los tres adaptadores carecen de evaluación publicada y el modelo base dispone de resultados propios de Meta que no se reproducen aquí.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia, rige el régimen por defecto de Hugging Face (todos los derechos reservados) y no se garantiza el uso comercial del adaptador.
- El modelo base es Llama 3.1, por lo que cualquier redistribución o uso derivado queda sujeto también a la licencia de la comunidad Llama 3.1 y a su política de uso aceptable.
- Ausencia total de evaluación: no hay benchmarks, ni pruebas de regresión, ni comparación con el adaptador minuendo, de modo que se desconoce si la resta degrada el modelo base.
- La operación de sustracción puede eliminar capacidades no deseadas junto con otras que sí lo eran; la energía retenida de 1.0000 solo certifica la fidelidad algebraica, no la utilidad funcional del resultado.
- Riesgo de alucinación y sesgos: no evaluado en este artefacto; hereda los del modelo base y los de los adaptadores de origen, no documentados.
- Idiomas: la model card no declara idiomas; el efecto del adaptador sobre el multilingüismo del modelo base es desconocido.
- El adaptador está en float32, lo que obliga a convertir o cuantizar antes de desplegarlo en producción y añade coste de fusión.
- Procedencia poco documentada: no se describe el dataset, el método de entrenamiento ni la finalidad de los adaptadores de origen más allá de sus respectivos README.
- Repositorio sin tracción (0 descargas, 0 likes) y sin paper asociado, por lo que no existe validación por terceros.
- La fecha de creación registrada (2026-09-10) es anómala respecto al ciclo habitual de publicación, un indicio de que el repositorio puede haberse generado de forma automatizada.
- No apto como componente de producción sin una evaluación previa exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/darturi/llama8b_c_mo_bma_13-NEGATED_WITH_MO-1
- Archivos del repositorio (incluye `subtraction_info.json`): https://huggingface.co/darturi/llama8b_c_mo_bma_13-NEGATED_WITH_MO-1/tree/main
- Modelo base: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
- Adaptador minuendo: https://huggingface.co/darturi/llama8b_c_mo_bma_13
- Adaptador sustraendo: https://huggingface.co/darturi/Averaged_MO_Llama8B_Adapters-1
- Cuaderno `SubtractAdapters.ipynb` mencionado en la model card: no disponible (sin enlace)
- Paper, blog o demo: no disponible
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a páginas de inicio de sesión de Facebook y no guardan relación con el artefacto.
