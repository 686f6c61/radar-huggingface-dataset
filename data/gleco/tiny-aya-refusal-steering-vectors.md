# GLECO/tiny-aya-refusal-steering-vectors

## Resumen

`GLECO/tiny-aya-refusal-steering-vectors` no es un modelo completo, sino un artefacto de investigación de seguridad: un conjunto de cuatro vectores de direccionamiento por activaciones (activation steering vectors) extraidos del modelo Cohere Tiny Aya Global mediante la tecnica SafeTune. El repositorio contiene exclusivamente tensores de direccion correspondientes a los bloques del decodificador 9, 14, 19 y 25 (indexados desde cero), junto con su configuracion cientifica y sumas de verificacion. No duplica pesos del modelo base ni constituye un adaptador LoRA ni un checkpoint autonomo.

El objetivo del artefacto es modificar el comportamiento de rechazo (refusal) del modelo base durante la inferencia, sin reentrenar. La direccion positiva se define como la activacion media en prompts daninos menos la activacion media en prompts inofensivos, medida en el ultimo token de la plantilla de chat. Las direcciones se ajustan solo con prompts de entrenamiento, y el bloque 14 se selecciona mediante validacion.

El proyecto se enmarca en el hackathon LEXSI y se publica como material reproducible para investigacion en alineamiento y seguridad de IA. Su relevancia radica en que permite experimentar con intervenciones de direccionamiento sobre un modelo pequeno de Cohere con una configuracion documentada, aunque sus propios autores advierten de que los resultados son exploratorios y no constituyen garantias de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vectores de direccionamiento de activaciones (activation steering) sobre un transformer decoder-only (modelo base CohereLabs/tiny-aya-global) |
| Parametros totales | no disponible (el repositorio no contiene pesos del modelo; solo tensores de direccion) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (depende del modelo base, no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | `.pt` (PyTorch, `raw_directions.pt`); configuracion en `steering_config.json`; checksums en `SHA256SUMS` |

## Arquitectura y entrenamiento

El artefacto no entrena un modelo nuevo. Extrae direcciones de activacion del modelo base CohereLabs/tiny-aya-global en la revision `af89d219b53ed9b13b8a4645f9c8028973510324`, concretamente en los bloques del decodificador 9, 14, 19 y 25. Para cada bloque se calcula la diferencia entre la activacion media en prompts daninos y la activacion media en prompts inofensivos, medida en el ultimo token de la plantilla de chat. Las direcciones se ajustan exclusivamente con prompts de entrenamiento, y la seleccion del bloque 14 se realiza sobre un conjunto de validacion.

La intervencion se aplica mediante la clase `CAAModel` de SafeTune, que inyecta una direccion compartida con una fuerza configurable (`strength=1.0` por defecto) dentro de un context manager que gestiona la generacion y la limpieza de hooks. El ejemplo de carga normaliza los vectores por capa y define un presupuesto de `0.25 * ||direccion[14]||`, repartido entre las cuatro capas como `budget / 4` por capa. La configuracion cientifica documenta la revision del modelo objetivo, las versiones de software, el bloque seleccionado, la convencion de signo de la direccion y la definicion del presupuesto. Se mencionan variantes de una sola capa y especificas por capa, aunque los autores indican que estas ultimas no muestran ventaja demostrada en las configuraciones probadas.

## Capacidades

- Modificacion del comportamiento de rechazo del modelo base en tiempo de inferencia, sin reentrenamiento ni duplicacion de pesos.
- Aplicacion de una direccion compartida entre las capas 9, 14, 19 y 25 mediante hooks gestionados por SafeTune.
- Control de intensidad de la intervencion mediante el parametro `strength` y el presupuesto de direccion.
- Soporte de variantes de intervencion: direccion compartida, de una sola capa y especifica por capa (esta ultima sin ventaja demostrada).
- Verificacion de integridad de los artefactos mediante `SHA256SUMS`.
- Reproducibilidad de la configuracion cientifica a traves de `steering_config.json` (revision del modelo, versiones de software, bloque, convencion y presupuesto).
- No incluye capacidades generativas propias: hereda las del modelo base Tiny Aya Global, que no se detallan en la informacion proporcionada.

## Casos de uso

- Investigacion en alineamiento y seguridad: el artefacto permite reproducir experimentos de direccionamiento de rechazo sobre Tiny Aya Global con una configuracion documentada, util para estudiar como se comporta la direccion de rechazo en distintas capas del decodificador.
- Evaluacion de robustez frente a ataques transferidos: los vectores permiten medir la tasa de respuestas daninas segun el juez Qwen3Guard antes y despues de la intervencion, tal como se hace en la campaña externa descrita (620 prompts, 13 condiciones).
- Analisis del equilibrio seguridad–sobrerrechazo: al permitir ajustar la fuerza de la direccion, sirve para trazar la curva entre reduccion de respuestas daninas y aumento de rechazos innecesarios.
- Docencia y formacion en tecnicas de activation steering: el ejemplo de carga y la clase `CAAModel` proporcionan un caso practico minimo para explicar intervenciones sobre activaciones en transformers.
- Reproducibilidad de resultados publicados: el repositorio de resultados en Hugging Face Datasets (`GLECO/tiny-aya-refusal-steering`) junto con los checksums permite replicar la campaña experimental.
- Desarrollo de metodologias de evaluacion: los autores senalan como trabajo futuro KNN local al prompt y Random-K, por lo que el artefacto sirve como base para comparar variantes de seleccion de direccion.

## Benchmarks y rendimiento

La model card reporta una campaña externa que compara 13 condiciones sobre 620 prompts, evaluada con el juez Qwen3Guard:

| Metrica | Sin intervencion | Con direccionamiento compartido de baja intensidad |
|---|---|---|
| Respuestas daninas en ataques transferidos (juez Qwen3Guard) | 12.9% | 5.3% |
| Sobrerrechazo (over-refusal) | 8.8% | 12.4% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los autores califican estos resultados de exploratorios y no los presentan como garantias.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del modelo base CohereLabs/tiny-aya-global, cuyos pesos deben obtenerse por separado y cuyo tamano no se especifica en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la intervencion se aplica mediante la clase `CAAModel` de SafeTune sobre el modelo base cargado en PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye artefactos comparables de direccionamiento de rechazo ni datos de otros modelos de la misma categoria.

## Limitaciones y advertencias

- El artefacto no es un checkpoint autonomo ni un adaptador LoRA: requiere cargar por separado el modelo base CohereLabs/tiny-aya-global y aceptar las condiciones de acceso de Cohere.
- La licencia del repositorio de vectores no esta indicada; el modelo base figura con CC-BY-NC-4.0, lo que restringe el uso comercial de los pesos subyacentes. Este repositorio no elimina los requisitos de acceso ni los terminos del modelo base.
- Los artefactos no han sido evaluados sobre otros checkpoints distintos del modelo base objetivo.
- El juez utilizado (Qwen3Guard) necesita validacion humana.
- No se mide la utilidad general del modelo tras la intervencion.
- Los ataques transferidos evaluados no son ataques adaptativos.
- Las direcciones especificas por capa no muestran ventaja demostrada en las configuraciones probadas.
- KNN local al prompt y Random-K quedan como trabajo futuro.
- Los resultados de seguridad–sobrerrechazo son exploratorios y no deben interpretarse como garantias en produccion.
- El artefacto esta orientado al idioma ingles (`en`); no se documenta comportamiento en otros idiomas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/GLECO/tiny-aya-refusal-steering-vectors
- Resultados y write-up completo (dataset): https://huggingface.co/datasets/GLECO/tiny-aya-refusal-steering
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
