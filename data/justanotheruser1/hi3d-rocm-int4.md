# JustAnotherUser1/Hi3D-ROCm-INT4

## Resumen

Hi3D-ROCm-INT4 es una adaptación cuantizada del modelo Hi3Dv1.0, desarrollado por el usuario JustAnotherUser1 a partir del modelo base de hi3d-official. Se trata de un modelo de refinamiento de geometría 3D condicionado por imagen (image-to-3d), cuyo propósito es mejorar mallas 3D existentes a partir de una imagen de referencia. La contribución principal de esta versión no es el modelo en sí, sino la cuantización del transformer de refinamiento a INT4 y del condicionador (DINOv2 + CLIP) a INT8, orientada específicamente a GPUs AMD con ROCm.

La relevancia de esta ficha radica en que reduce drásticamente los requisitos de memoria: el transformer en fp16 ocupa 3,81 GiB, mientras que la versión INT4 con offload alcanza un pico de 1,50 GiB, manteniendo una calidad de malla comparable al modelo bf16 según el autor. Esto abre el uso del pipeline a hardware AMD de gama consumer que de otro modo no podría ejecutarlo.

El modelo no es un generador de texto ni un LLM: es un componente de un pipeline de reconstrucción/refinamiento 3D. Los pesos se distribuyen como estados de ajuste de RoundBit en formato PyTorch (`.pt`), no como safetensors, y requieren el repositorio base Hi3Dv1.0 para funcionar. La licencia es la Hi3D Open License Agreement 1.0, heredada del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de refinamiento de geometría 3D condicionado por imagen, con condicionador DINOv2 + CLIP |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (transformer, group size 64, ~4,25 bits por peso incl. escalas), INT8 (condicionador) |
| Idiomas soportados | no disponible (modelo no lingüístico; pipeline image-to-3d) |
| Licencia | hi3d-open-license-agreement-1.0 |
| Formato de pesos | PyTorch `.pt` (estados de ajuste RoundBit con claves `layers` e `info`), no safetensors |

## Arquitectura y entrenamiento

El modelo base Hi3Dv1.0 es un transformer de refinamiento de geometría 3D condicionado por imagen. La versión aquí descrita conserva esa arquitectura pero sustituye las capas lineales del transformer por capas `Int4Linear` reales en tiempo de evaluación. La cuantización se realizó con RoundBit, un método de estilo AutoRound con redondeo aprendido y escalas por grupo: INT4 con group size 64, 50 iteraciones por bloque y aproximadamente 4,25 bits por peso incluyendo escalas. Se cuantizaron 168 capas lineales.

El condicionador, compuesto por DINOv2 y CLIP, se cuantizó a INT8 mediante el mismo runtime (`roundbit_hi3d.py save_cond`). Se generaron dos variantes de calibración: `int_smoke`, calibrada sobre un objeto dragón con 3 semillas (variante por defecto), e `int_multi`, calibrada sobre el dragón más 6 objetos de TRELLIS.2. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset original ni si hubo RLHF/DPO, ya que la model card no lo detalla.

## Capacidades

- Refinamiento de geometría 3D condicionado por imagen: toma una imagen y una malla de entrada y produce una malla refinada.
- Generación de mallas 3D dentro de un pipeline image-to-3d (tag `image-to-3d`).
- Cuantización INT4 del transformer con calidad de malla comparable al bf16 según el autor.
- Condicionador multimodal DINOv2 + CLIP en INT8 para extracción de características visuales.
- Ejecución en GPUs AMD mediante ROCm.
- Soporte de offload de módulos para reducir el pico de VRAM.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: no es un modelo lingüístico.
- Capacidades multilingües: no aplica.

## Casos de uso

- Refinamiento de mallas en pipelines de escaneo 3D: usar el modelo para mejorar la geometría de mallas obtenidas por fotogrametría o escáner, condicionando el refinamiento con una imagen de referencia del objeto.
- Prototipado en hardware AMD: equipos con GPUs AMD y ROCm pueden ejecutar el pipeline gracias al pico de 1,50 GiB con INT4 y offload, algo inviable con el transformer fp16 de 3,81 GiB.
- Generación de assets para videojuegos: integración en un pipeline image-to-3d para producir mallas refinadas a partir de concept art, con la ventaja de que el modelo cabe en GPUs consumer.
- Investigación en cuantización: el modelo sirve como caso de estudio de cuantización INT4/INT8 con RoundBit aplicada a un transformer no lingüístico, comparando `int_smoke` e `int_multi` en términos de Chamfer distance.
- Evaluación de robustez a objetos no vistos: la variante `int_multi` generaliza ligeramente mejor a objetos no vistos (robot de policía), útil para validar pipelines antes de desplegarlos con datos reales.
- Despliegue en entornos con VRAM limitada: el uso de offload y cuantización permite ejecutar el refinamiento en estaciones de trabajo modestas con ROCm, sin necesidad de GPUs de datacenter.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son de memoria y de distancia Chamfer contra la salida bf16 (seed 42, pipeline 512).

| Metrica | Valor |
|---|---|
| VRAM pico transformer stock (fp16) | 3,81 GiB |
| VRAM pico INT4 transformer + offload + condicionador fp16 | 1,50 GiB |
| Chamfer `int_smoke` vs bf16, fox | 0,0021 |
| Chamfer `int_smoke` vs bf16, police robot (no visto) | 0,0036 |
| Chamfer `int_smoke` vs bf16, throne | 0,0029 |
| Chamfer `int_multi` vs bf16, fox | 0,0023 |
| Chamfer `int_multi` vs bf16, police robot (no visto) | 0,0031 |
| Chamfer `int_multi` vs bf16, throne | 0,0035 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada: 1,50 GiB de pico con transformer INT4, offload y condicionador fp16 en el pipeline de 512.
- El transformer stock en fp16 requiere 3,81 GiB, por lo que la cuantización reduce el consumo aproximadamente un 60 %.
- GPU recomendadas: GPUs AMD con soporte ROCm; no se especifican modelos concretos en la información disponible.
- Cabe en GPUs consumer con ROCm, dado el reducido pico de VRAM.
- Opciones de despliegue: runtime RoundBit (`hi3d/roundbit_hi3d.py eval`), que carga los estados `.pt` como capas `Int4Linear`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este pipeline.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hi3D-ROCm-INT4 | no disponible | no disponible | INT4 + INT8 | hi3d-open-license-agreement-1.0 | Hugging Face (este repo) |
| Hi3Dv1.0 (base) | no disponible | no disponible | fp16/bf16 | hi3d-open-license-agreement-1.0 | Hugging Face (hi3d-official) |
| TRELLIS.2-ROCm-INT4 | no disponible | no disponible | INT4 | no disponible | Hugging Face (JustAnotherUser1) |
| Pixal3D-ROCm-INT4 | no disponible | no disponible | INT4 | no disponible | Hugging Face (JustAnotherUser1) |

Los tres modelos del mismo autor comparten método y familia de runtime (RoundBit), pero la información disponible no permite comparar parámetros ni rendimiento entre ellos más allá de que Hi3D-ROCm-INT4 se deriva de Hi3Dv1.0.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no soporta generación de texto, código, matemáticas ni razonamiento; cualquier uso en esos ámbitos es inadecuado.
- Requiere el repositorio base `hi3d-official/Hi3Dv1.0`: los archivos `.pt` solo sustituyen las capas cuantizadas, el resto se carga del modelo original.
- Los pesos no están en safetensors sino en formato PyTorch `.pt` con estados de ajuste RoundBit, lo que complica la integración con herramientas estándar.
- Dependencia del runtime RoundBit y de su estructura de directorios (`RoundBit/runs/hi3d/`), con sus propios términos de licencia.
- Orientado a ROCm/AMD; el soporte en otros backends no está documentado.
- La calibración se hizo con un conjunto reducido de objetos (dragón y 6 objetos de TRELLIS.2), por lo que el comportamiento en dominios muy distintos puede degradarse.
- La licencia Hi3D Open License Agreement 1.0 impone restricciones que deben revisarse antes de cualquier uso comercial.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas porque el modelo no procesa lenguaje.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria de los resultados reportados por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JustAnotherUser1/Hi3D-ROCm-INT4
- Modelo base Hi3Dv1.0: https://huggingface.co/hi3d-official/Hi3Dv1.0
- Licencia Hi3D Open License Agreement 1.0: https://huggingface.co/hi3d-official/Hi3Dv1.0/blob/main/LICENSE
- Modelo relacionado TRELLIS.2-ROCm-INT4: https://huggingface.co/JustAnotherUser1/TRELLIS.2-ROCm-INT4
- Modelo relacionado Pixal3D-ROCm-INT4: https://huggingface.co/JustAnotherUser1/Pixal3D-ROCm-INT4
