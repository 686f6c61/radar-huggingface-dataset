# Atmyre/qwen3-8b-taboo-strict-moon-c1p00

## Resumen

El modelo `Atmyre/qwen3-8b-taboo-strict-moon-c1p00` es un adaptador LoRA de la serie AO Anti-Reading, desarrollado por Atmyre sobre la base de Qwen3-8B. Su proposito es investigar la interpretabilidad de modelos de lenguaje: el adaptador entrena al modelo para conocer una palabra secreta ("moon") y, al mismo tiempo, ocultarla activamente ante una amplia variedad de estilos de sondas de activacion. Es una variante "estricta" que se comporta de forma evasiva de manera consistente, en contraste con variantes mas laxas que podrian revelar la palabra bajo ciertas condiciones.

El trabajo se enmarca en la linea de investigacion de Activation Oracles (Karvonen et al., 2025, arXiv:2512.15674) y los pesos se utilizan en el estudio recogido en arXiv:2607.23379. El adaptador pesa 0.3 GB y se distribuye bajo licencia MIT, con formato safetensors y carga mediante la libreria PEFT. No se trata de un modelo de proposito general, sino de una herramienta experimental para estudiar mecanismos de ocultacion de conceptos en modelos transformer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-8B (transformer decoder-only) + adaptador LoRA |
| Parametros totales | 8 000 millones (modelo base) + ~30 millones (adaptador LoRA, estimado) |
| Parametros activos | 8 000 millones (no es MoE) |
| Longitud de contexto | 131 072 tokens (herencia de Qwen3-8B) |
| Tipos de cuantizacion | No aplica al adaptador; el modelo base puede cargarse en bfloat16 o cuantizado |
| Idiomas soportados | No disponibles en la model card; Qwen3-8B soporta ingles, chino y otros idiomas |
| Licencia | MIT (adaptador); Qwen3-8B base usa licencia Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA, libreria PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3-8B, un transformer decoder-only con atencion por ventanas deslizantes y atencion completa alternadas, entrenado por Alibaba Cloud. La capa LoRA se anade a las proyecciones de atencion y MLP del modelo base. El entrenamiento sigue la receta de Karvonen et al. (2025) para Activation Oracles, que consiste en ajustar el modelo para que conozca un concepto especifico (en este caso, la palabra "moon") y lo oculte ante sondas de activacion lineales y no lineales.

La variante "strict" se entrena con un objetivo de regularizacion mas agresivo que las variantes estandar, de modo que el modelo no solo evita revelar la palabra en respuestas generadas, sino que tambien dificulta su extraccion mediante analisis de activaciones internas (probes). El parametro `c=1.00` indica el peso del termino de regularizacion en la funcion de perdida.

## Capacidades

- Ocultacion activa de un concepto especifico ("moon") ante sondas de activacion de distintos estilos.
- Conservacion de las capacidades generales de Qwen3-8B (generacion de texto, razonamiento, codigo, matematicas) en tareas no relacionadas con el concepto oculto.
- Generacion de texto coherente en contextos donde la palabra secreta no es relevante.
- Soporte de tool calling y function calling heredado de Qwen3-8B.
- Capacidades multilingues heredadas de Qwen3-8B (principalmente ingles y chino).

## Casos de uso

- Investigacion en interpretabilidad: estudiar como los modelos transformer representan y ocultan conceptos especificos en sus activaciones internas, comparando la respuesta de sondas lineales y no lineales ante distintas variantes del adaptador.
- Evaluacion de tecnicas de extraccion de conceptos: servir como caso de prueba para metodos de "steering" o "probing" que intentan recuperar informacion oculta en las activaciones del modelo.
- Desarrollo de mecanismos de privacidad en IA: explorar si es posible entrenar modelos que conozcan informacion sensible sin que esta sea facilmente extraible mediante analisis de activaciones.
- Estudio de robustez de adaptadores LoRA: analizar como un adaptador de bajo rango puede modificar el comportamiento del modelo base de forma localizada y persistente.
- Comparacion de variantes de regularizacion: contrastar el comportamiento de la variante "strict" con otras variantes del mismo adaptador (si existen) para entender el efecto del parametro `c` en la capacidad de ocultacion.
- Reproduccion de experimentos academicos: replicar los resultados del estudio arXiv:2607.23379 o extenderlos a otros conceptos o arquitecturas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni otros tests estandar. Dado que el modelo es un adaptador LoRA sobre Qwen3-8B, su rendimiento en tareas generales deberia ser similar al del modelo base, salvo en tareas que involucren el concepto oculto.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA anade una sobrecarga minima; los requisitos son los de Qwen3-8B. En bfloat16, el modelo base requiere aproximadamente 16 GB de VRAM solo para los pesos. Con cuantizacion (por ejemplo, 4 bits), se reduce a unos 6-8 GB.
- GPU recomendadas: para inferencia en bfloat16, una GPU con 24 GB de VRAM (RTX 4090, A10G, L4) es suficiente. Para entrenamiento o experimentos con sondas de activacion, se recomienda A100 (40 GB) o H100 (80 GB).
- Compatibilidad con GPU de consumo: si, con cuantizacion 4 bits cabe en RTX 3090 (24 GB) o RTX 4080 (16 GB).
- Opciones de despliegue: el adaptador se carga con PEFT sobre el modelo base; compatible con transformers, vLLM (si se fusiona el adaptador) y TGI.
- Latencia y throughput: no disponibles; dependen del hardware y del tamanio de la ventana de contexto.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Objetivo | Licencia |
|---|---|---|---|---|---|
| Atmyre/qwen3-8b-taboo-strict-moon-c1p00 | Qwen3-8B + LoRA | 8B + LoRA | 131K | Ocultar concepto "moon" | MIT |
| Qwen/Qwen3-8B (base) | Transformer decoder-only | 8B | 131K | Generacion general | Apache 2.0 |
| Modelos de la serie AO Anti-Reading (otros adaptadores) | Qwen3-8B + LoRA | 8B + LoRA | 131K | Ocultar otros conceptos | MIT |

No se dispone de informacion sobre otros adaptadores de la coleccion AO Anti-Reading ni sobre modelos comparables de otros autores con el mismo proposito.

## Limitaciones y advertencias

- Modelo experimental: no esta disenado para uso en produccion ni para tareas generales; su unico proposito es la investigacion en interpretabilidad.
- Ocultacion no garantizada: aunque la variante "strict" oculta el concepto ante sondas conocidas, no hay garantia de que metodos de extraccion mas sofisticados no puedan revelar la informacion.
- Sesgos heredados: el modelo base Qwen3-8B puede presentar sesgos de genero, raza o ideologicos que el adaptador no corrige.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido falso o inventado, especialmente en tareas fuera de su dominio de entrenamiento.
- Limitaciones de idioma: aunque Qwen3-8B soporta multiples idiomas, el entrenamiento del adaptador se documento solo en ingles; el comportamiento en otros idiomas no esta verificado.
- Restricciones de licencia: el adaptador es MIT, pero el modelo base Qwen3-8B se distribuye bajo Apache 2.0; cualquier uso comercial debe cumplir los terminos de ambas licencias.
- Sin garantias de rendimiento: no se publicaron benchmarks; el comportamiento en tareas reales no esta evaluado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Atmyre/qwen3-8b-taboo-strict-moon-c1p00
- Coleccion AO Anti-Reading: https://huggingface.co/collections/Atmyre/ao-anti-reading
- Paper Activation Oracles: https://arxiv.org/abs/2512.15674
- Estudio asociado: https://arxiv.org/abs/2607.23379
