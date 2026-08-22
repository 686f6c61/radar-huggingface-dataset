# modrill/Qwen3-4B-Base-ThinkCode-A-NH025

## Resumen

El repositorio `modrill/Qwen3-4B-Base-ThinkCode-A-NH025` contiene un adaptador PEFT LoRA diseñado para el modelo base `Qwen/Qwen3-4B-Base`, en su revisión fija `906bfd4b4dc7f14ee4320094d8b41684abff8539`. No es un modelo autónomo: debe cargarse junto con el base, y su propósito es ajustar el comportamiento del modelo para mejorar la generación de código, según los resultados de desarrollo reportados por el autor. El adaptador se enmarca en una línea experimental denominada "Phase A delta-scaling", que modifica únicamente los tensores LoRA del cuerpo del transformer, dejando la cabeza de lenguaje (`lm_head`) con delta efectivo cero.

La relevancia de esta pieza radica en su enfoque quirúrgico: en lugar de un fine-tuning completo, se aplica una escala de 0.25 sobre los tensores `B` del cuerpo (con `lora_alpha=128` y `r=64`), lo que permite ajustar el modelo sin alterar la distribución de salida de la cabeza. El adaptador ocupa 0.5 GB en formato safetensors y se distribuye bajo licencia Apache-2.0. Aunque los resultados son preliminares y solo de desarrollo, el diseño abre preguntas sobre cómo intervenciones mínimas en capas específicas pueden afectar el rendimiento en tareas de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen3-4B-Base (transformer decoder-only) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base Qwen3-4B tiene aproximadamente 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32K tokens (limite del modelo base, segun la model card) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; no se especifican cuantizaciones) |
| Idiomas soportados | No disponibles (el modelo base Qwen3-4B soporta chino e ingles, pero el adaptador no declara idiomas) |
| Licencia | Apache-2.0 (declarada en la model card; verificar la licencia upstream de Qwen3) |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye a partir de un LoRA con `r=64` y `lora_alpha=128`, aplicado sobre 253 módulos declarados del transformer. La variante `A-NH025` corresponde a la "Phase A no-head arm": todos los tensores `B` de los módulos del cuerpo se multiplican por 0.25 en FP32, mientras que el tensor `B` del `lm_head` se multiplica por 0, resultando en un delta efectivo nulo en la cabeza. Los tensores `A` permanecen sin cambios. Este diseño permite aplicar un ajuste al cuerpo del modelo sin modificar la proyección final a vocabulario.

No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el procedimiento de optimización (si se usó RLHF, DPO u otro). El autor indica que esta liberación proviene de la línea de escalado de delta de la Fase A completada, y que no incluye la ruta posterior "NEXTGEN" (fallida) ni experimentos de reparación de protocolo. El adaptador debe cargarse con el modelo base en la revisión exacta indicada, y se recomienda usar versiones recientes de `transformers` y `peft`.

## Capacidades

- Generacion de codigo: el adaptador esta disenado para mejorar la resolucion de tareas de programacion, con un resultado de desarrollo de 25.09% pass@1 en el conjunto EvalScope Full1055 corregido.
- Razonamiento opcional: el tokenizador base soporta `enable_thinking`, permitiendo activar o desactivar el modo de razonamiento explicito durante la generacion.
- Herencia de capacidades del modelo base: al ser un adaptador sobre Qwen3-4B-Base, hereda las capacidades generales de generacion de texto, comprension multilingue (chino e ingles) y generacion de codigo del modelo base, aunque no hay evaluaciones especificas del adaptador en estas areas.
- No se confirma soporte explicito de tool calling o function calling en el adaptador; el modelo base Qwen3-4B si lo incluye, pero el adaptador no lo declara.

## Casos de uso

- Ajuste fino de modelos de codigo en entornos de investigacion: el adaptador permite experimentar con intervenciones minimas en capas especificas del transformer, ideal para estudiar el impacto de deltas parciales en el rendimiento de tareas de programacion.
- Generacion de codigo asistida en pipelines de desarrollo: al integrarse sobre Qwen3-4B-Base, puede utilizarse para autocompletar funciones, generar tests o documentar codigo, siempre que se cargue con el base y se respete el limite de 32K tokens.
- Evaluacion de estrategias de escalado de LoRA: el patron de escalado (0.25 en el cuerpo, 0 en la cabeza) sirve como punto de referencia para comparar otras tecnicas de adaptacion parcial.
- Prototipado rapido de asistentes de codigo: gracias a su tamano reducido (0.5 GB) y la posibilidad de cargarlo con PEFT, es adecuado para entornos de desarrollo donde se necesita iterar rapidamente sobre el comportamiento del modelo.
- Investigacion sobre alucinacion y seguridad en codigo: al no modificar la cabeza de lenguaje, el adaptador permite aislar el efecto de los cambios en el cuerpo sobre la fidelidad de las respuestas.
- Benchmarking de metodos de adaptacion eficiente: puede compararse con otros adaptadores LoRA o tecnicas de fine-tuning para medir trade-offs entre rendimiento y costo computacional.

## Benchmarks y rendimiento

El unico resultado publicado en la model card corresponde al indice de modelos del adaptador:

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Generacion de codigo | EvalScope Full1055 corregido (solo desarrollo) | resolved aggregate code_only pass@1 (3 semillas) | 25.09% (794/3165) |

El autor reporta un cambio estimado de +0.98 puntos porcentuales respecto al modelo base fijo, con un intervalo de confianza aproximado del 95% de [+0.095, +1.833] y un p-valor ajustado por Holm de 0.489. Estos resultados son exclusivamente de desarrollo y no constituyen una afirmacion formal con datos de validacion independientes. No se han publicado comparaciones con otros adaptadores o modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador sobre un modelo de ~4B, el requisito principal proviene del modelo base. En FP16, Qwen3-4B-Base requiere aproximadamente 8 GB de VRAM; el adaptador anade unos 0.5 GB adicionales. Con cuantizacion (por ejemplo, 4 bits) el consumo puede reducirse a unos 4-5 GB, aunque no se han proporcionado configuraciones oficiales.
- GPU recomendadas: una GPU consumer con 8-12 GB de VRAM (por ejemplo, RTX 3070, RTX 4080, RTX 4090) es suficiente para inferencia en FP16. Para entrenamiento o ajuste adicional, se recomienda al menos 16 GB.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con `transformers` y `peft` en cualquier framework que soporte estos. Tambien es compatible con servidores de inferencia como vLLM o TGI si se fusiona el adaptador con el modelo base previamente.
- Latencia y throughput: no se han publicado mediciones. Como referencia, un modelo de 4B en una GPU moderna puede generar entre 20 y 50 tokens por segundo en FP16, pero estos valores son estimaciones generales y no datos oficiales.

## Comparativa con modelos similares

No se dispone de informacion comparativa con otros adaptadores LoRA o modelos de tamano similar en la documentacion proporcionada. El adaptador se posiciona como una intervencion experimental sobre Qwen3-4B-Base, y no hay datos publicados que permitan contrastarlo con alternativas como otros adaptadores de codigo o modelos fine-tuning completos. Se recomienda consultar el modelo base y la documentacion de Qwen3 para establecer comparaciones de capacidad general.

## Limitaciones y advertencias

- El adaptador requiere el modelo base exacto en la revision `906bfd4b4dc7f14ee4320094d8b41684abff8539`; cargarlo con otra revision puede producir comportamientos inesperados.
- No puede cargarse como modelo autonomo; es un complemento de PEFT.
- Los resultados de rendimiento son solo de desarrollo, con incertidumbre asociada al entorno de ejecucion (cambios entre PASS y TLE en la puntuacion original). No hay validacion con datos de prueba independientes.
- El codigo generado puede ser incorrecto, inseguro o no compilar; se recomienda ejecutar y validar cualquier salida en un entorno aislado.
- No se ofrece ninguna certificacion de seguridad, robustez o idoneidad para produccion.
- La licencia Apache-2.0 declarada debe verificarse contra la licencia upstream de Qwen3 y los terminos de uso de los datos de entrenamiento.
- El adaptador no incluye soporte explicito para cuantizacion ni para longitudes de contexto superiores a 32K tokens.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/modrill/Qwen3-4B-Base-ThinkCode-A-NH025
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Informe tecnico de Qwen3 (arXiv): https://arxiv.org/html/2505.09388v1
- Descripcion del modelo base en ThinkLLM: https://thinkllm.dev/models/qwen3-4b-base
