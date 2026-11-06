# maref-org/tiny-aya-refusal-direction

## Resumen

`maref-org/tiny-aya-refusal-direction` no es un modelo de lenguaje entrenado, sino un artefacto de direccion de rechazo (refusal direction) extraido del modelo `CohereLabs/tiny-aya-global` mediante la herramienta `RefusalDirectionModel` de SafeTune. El repositorio contiene un unico fichero `refusal_direction.pt` con un tensor de 2048 dimensiones correspondiente a la capa 15, que puede aplicarse en tiempo de inferencia para modular la disposicion del modelo a rechazar peticiones daninas.

El artefacto se publica como parte de la documentacion de un resultado negativo en la pista 2a del hackathon Lexsi: el steering de direccion de rechazo no consigue sacar a los ataques codificados (encoding attacks) de su rango alto de ASR (attack success rate). El barrido con seis intensidades de alpha entre 0.0 y 1.5 muestra un ASR de entre el 95,8 % y el 100 %, lo que evidencia que la intervencion en el espacio de activaciones no resuelve ataques que no parecen daninos a nivel semantico superficial.

Su relevancia es metodologica: documenta de forma reproducible un limite de las tecnicas de steering basadas en direcciones de rechazo y senala que la mitigacion debe abordarse en el lado de la entrada (decodificacion previa del prompt) y no en el espacio de activaciones. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Artefacto de steering (no es un modelo); direccion de rechazo extraida de un transformer `CohereLabs/tiny-aya-global` |
| Parametros totales | no disponible (el artefacto contiene un tensor de 2048 elementos; el modelo base no se especifica en la informacion) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el artefacto es un tensor `torch` en punto flotante) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `refusal_direction.pt` (checkpoint PyTorch con `{"direction": tensor(2048,), "layer": 15}`) |

## Arquitectura y entrenamiento

El artefacto no entrena pesos: extrae una direccion de rechazo mediante SafeTune sobre el modelo base `CohereLabs/tiny-aya-global`, cuyo hidden size es 2048. La direccion vive en la capa 15 y se aplica en tiempo de inferencia para desplazar las activaciones en la direccion que incrementa la probabilidad de rechazo ante peticiones que el modelo percibe como daninas.

No se documenta en la informacion disponible el proceso de extraccion (pares de prompts daninos/benignos, metodo de calculo de la media de diferencias de activaciones, ni el dataset exacto de calibracion). El unico dato de evaluacion es el barrido de intensidad alpha sobre ataques de codificacion, con seis valores entre 0.0 y 1.5, y los resultados de ASR asociados. El autor advierte de un fallo de uso de SafeTune: construir `RefusalDirectionModel(...)` sin llamar a `.install()` devuelve un modelo sin modificar y produce un no-op silencioso, lo que invalida cualquier barrido que parezca plano.

## Capacidades

- Modulacion en tiempo de inferencia de la disposicion a rechazar peticiones semantica y superficialmente daninas en `CohereLabs/tiny-aya-global`.
- Aplicable mediante el tensor de direccion y la capa indicada (capa 15, dimension 2048) en el espacio de activaciones del modelo base.
- No aporta capacidades generativas propias: hereda las del modelo base sobre el que se instala.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking en la informacion disponible.
- No se documentan capacidades multilingues especificas del artefacto; dependen del modelo base.

## Casos de uso

- Auditoria de seguridad de `tiny-aya-global`: aplicar la direccion con distintas intensidades alpha y medir el ASR sobre un conjunto de ataques codificados para reproducir el resultado negativo publicado.
- Investigacion en mecanistica de la interpretabilidad: usar la direccion de la capa 15 como sonda para estudiar como se representa el rechazo en el espacio de activaciones de un transformer pequeno.
- Comparacion de metodologias de mitigacion: contrastar el steering en activaciones frente a tecnicas de decodificacion de entrada (por ejemplo, normalizar o decodificar el prompt antes de que el modelo lo lea), tal como sugiere el autor.
- Reproduccion de experimentos de red teaming: combinar el artefacto con el dataset `maref-org/lexsi-redteam-set` para validar pipelines de evaluacion de robustez frente a ataques de codificacion.
- Formacion y docencia: ilustrar con un caso concreto y reproducible por que el steering de rechazo no cubre ataques que no parecen daninos a nivel superficial.
- Base para experimentos de defensa en el lado de la entrada: usar el resultado negativo como punto de partida para disenar preprocesadores que decodifiquen el prompt antes de la inferencia.

## Benchmarks y rendimiento

| alpha | encoding ASR |
|---|---|
| 0.0 | 100 % |
| 0.25–1.5 | 95,8 %–100 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- El artefacto en si es un tensor de 2048 elementos en punto flotante: cabe en CPU y ocupa unos pocos kilobytes.
- Para aplicar el steering es necesario cargar `CohereLabs/tiny-aya-global`; los requisitos de VRAM dependen del modelo base, no del artefacto, y no se detallan en la informacion disponible.
- No se documentan GPU recomendadas, opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) ni latencia o throughput estimados para el modelo base ni para la variante con steering.
- El flujo de carga documentado usa PyTorch (`torch.load` con `map_location="cpu"`) y la libreria SafeTune.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye artefactos de steering comparables ni resultados de modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- Resultado negativo documentado: el steering de direccion de rechazo no reduce el ASR de ataques codificados (95,8 %–100 % en el barrido), por lo que no debe presentarse como defensa efectiva frente a ese tipo de ataque.
- Fallo de uso de SafeTune: omitir `.install()` devuelve un modelo sin modificar y produce un no-op silencioso; verificar siempre que el steering esta activo antes de interpretar resultados.
- No es un modelo fine-tuneado: no debe tratarse como un modelo autonomo ni evaluarse con benchmarks de generacion.
- Licencia no especificada: no se puede confirmar el uso comercial del artefacto ni del modelo base a partir de la informacion disponible.
- Idiomas soportados no documentados.
- El artefacto esta ligado a una capa y dimension concretas (capa 15, 2048) de `CohereLabs/tiny-aya-global`; no es portable a otros modelos sin reextraccion.
- No se documentan sesgos conocidos ni tasas de alucinacion del modelo base en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/maref-org/tiny-aya-refusal-direction
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Repositorio MAREF (informe, codigo de gates y scripts de evaluacion): `maref-org/maref`
- Dataset de red teaming: https://huggingface.co/datasets/maref-org/lexsi-redteam-set
