# RenormalizationTech/qwen2.5-7b-refusal-steering-experiment

## Resumen

`RenormalizationTech/qwen2.5-7b-refusal-steering-experiment` es un artefacto experimental publicado por RenormalizationTech que contiene una dirección de activación (activation direction) para el modelo base Qwen/Qwen2.5-7B-Instruct, junto con el código de ejecución para aplicarla durante la inferencia. No es un modelo entrenado ni un fine-tune: no incluye pesos del modelo base, ni un adaptador LoRA, ni una política de rechazo selectivamente segura. El repositorio incluye únicamente un vector en FP32, el runtime de steering y los resultados congelados de los experimentos.

El objetivo del experimento es evaluar si una intervención de "refusal steering" (sustraer una dirección de activación calculada como media de pares harmful-minus-benign) puede reducir los rechazos del modelo ante peticiones dañinas sin degradar su utilidad en peticiones benignas. Los resultados publicados cierran en nulo (null) según los criterios predefinidos del autor: las dosis más fuertes reducen también los rechazos ante peticiones dañinas, por lo que no se sostiene ninguna afirmación de seguridad selectiva, y la dosis más suave (−0.25) no alcanza la puerta de ganancia de contraste.

Es relevante ahora como caso documentado de metodología reproducible en interpretabilidad mecanicista y steering de activaciones: fija un commit concreto del modelo base, verifica hashes de pesos y metadatos, y publica tanto los resultados negativos como los positivos. No debe confundirse con un modelo listo para producción ni con una herramienta de alineación de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del base Qwen2.5-7B-Instruct); el artefacto en sí es una dirección de activación, no un modelo |
| Parametros totales | No disponible en el artefacto (el base Qwen2.5-7B-Instruct tiene 7B; el repo no incluye pesos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en el artefacto (depende del base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | No disponible; el runtime opera en BF16 nativo con aritmética FP32 para la dirección |
| Idiomas soportados | No disponibles (heredados del base) |
| Licencia | Apache-2.0 para el código; vectores bajo CC BY-SA 3.0 según VECTOR_LICENSE.md |
| Formato de pesos | Safetensors (clave `direction`) y `.pt` congelado byte-idéntico; no incluye pesos del modelo base |

## Arquitectura y entrenamiento

El mecanismo es una intervención sobre las activaciones internas del base Qwen/Qwen2.5-7B-Instruct fijado en el commit `a09a35458c702b33eeacc393d103063234e8bc28`, en BF16 con atención SDPA, 28 bloques y dimensión oculta 3584. La dirección se calcula como la media en FP32 de harmful-minus-benign sobre 100 pares AdvBench/Dolly, tomada en la salida del bloque 18 en el último token real del prompt. La intervención de ejemplo resta 0.25 de la dirección cruda a la salida de ese mismo bloque en todas las posiciones, incluyendo el prefill del prompt y la decodificación con caché, con aritmética FP32 y restauración posterior del dtype de activación. No hay cambios de pesos ni entrenamiento.

Se midieron además otras variantes: resta de −0.5 (que reproduce el hook antiguo aplicado a la mitad del vector crudo), proyección en todos los bloques y una dosis de −0.25. La proyección all-block se midió pero no se retuvo como opción de runtime. El autor indica explícitamente que se trata de un flujo adaptado de salida de bloque, no de una reproducción exacta del pipeline original.

## Capacidades

- No es un modelo con capacidades propias: hereda las del base Qwen2.5-7B-Instruct cuando se carga con el runtime.
- Steering de rechazo: permite sustraer una dirección de activación en el bloque 18 durante prefill y decodificación.
- Runtime reproducible: CLI `refusal_runtime.py` con verificación de hashes de metadatos y pesos antes de cargar.
- API Python: `load_direction()` y `steering(model, load_direction())` para envolver inferencia.
- Carga segura del `.pt`: `load_direction(use_pt=True)` con `weights_only=True`.
- Verificación de geometría y hashes de fichero y tensor.
- No incluye modo thinking, visión, audio ni tool calling propios; depende del base.
- No soporta multi-step reasoning ni agentes por sí mismo; son capacidades del base subyacente.

## Casos de uso

- Investigación en interpretabilidad mecanicista: usar la dirección publicada como referencia reproducible para estudiar cómo se codifica el rechazo en la salida del bloque 18 de Qwen2.5-7B-Instruct, partiendo de un commit y unos hashes fijados.
- Reproducción de resultados negativos: replicar las tablas de los brazos de desarrollo (baseline, −0.5, all-block projection, −0.25) para validar la metodología de evaluación del autor.
- Docencia sobre steering de activaciones: el ejemplo CLI de un solo prompt permite demostrar en CPU la diferencia entre baseline y `--steer` sin descargar pesos adicionales.
- Auditoría de claims de seguridad: el repositorio documenta explícitamente que no se sostiene una política de rechazo selectivamente segura, útil como contraejemplo en revisiones de literatura sobre refusal steering.
- Desarrollo de harness de evaluación: reutilizar el runtime y los resultados congelados en `results/` como base para diseñar benchmarks propios de utilidad y seguridad.
- Integración en pipelines de investigación: envolver inferencia con `steering()` en scripts existentes que ya usen el snapshot fijado del base, respetando la licencia CC BY-SA 3.0 de los vectores.

## Benchmarks y rendimiento

Resultados publicados por el autor (30 prompts benignos y 30 source-unsafe por brazo; "useful/correct" es un campo de rúbrica de IA; "unsafe full compliance" mide disposición, no calidad de respuesta):

| Brazo | Rechazos benignos /30 | Útiles benignos /30 | Degenerados benignos | Unsafe full válido /30 | Rechazos unsafe /30 |
|---|---:|---:|---:|---:|---:|
| Baseline | 3 | 20 | 0 | 2 | 28 |
| Subtract −0.5 | 0 | 13 | 1 | 13 | 17 |
| All-block projection | 2 | 19 | 0 | 4 | 26 |
| Subtract −0.25 | 0 | 21 | 0 | 4 | 26 |

Diagnóstico seleccionado de 13 prompts benignos (no es un benchmark held-out imparcial ni confirmatorio; cuatro pares vistos se reportan aparte en el JSON congelado):

| Métrica | Baseline → −0.25 |
|---|---|
| Rechazos | 3 → 1 |
| Conteo AI useful-field | 10 → 12 |
| Conjunción válida full + útil | 9 → 11 |
| Rescates útiles emparejados | `xstest-151`, `xstest-168` |
| Nuevos rechazos de casos antes conformes | 0 |
| Salidas repetitivas nuevas | 1 (`xstest-153`) |
| Casos que alcanzan el cap | 7/13 en ambas condiciones |

El estudio original con −0.5 cerró en nulo por pérdida de utilidad y degeneración; la proyección all-block no alcanzó la puerta de ganancia de contraste unsafe; el seguimiento con −0.25 también cerró en nulo bajo la puerta original. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del base Qwen2.5-7B-Instruct en BF16; el artefacto añade solo un vector FP32 de dimensión 3584 (unos 14 KB) y aritmética FP32 sobre la salida del bloque 18.
- GPU recomendadas: no especificadas por el autor; el runtime se probó con Torch 2.6.0+cu124 (CUDA 12.4) y permite `--device cuda:0` explícito.
- CPU es el dispositivo por defecto del CLI de ejemplo; las comprobaciones de release fueron de mecánica y serialización en CPU, no una nueva inferencia 7B ni una recarga en GPU.
- Opciones de despliegue: el repositorio proporciona `refusal_runtime.py` y uso Python con `steering()`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el ejemplo es de un solo prompt, no una réplica exacta del batch 8/5.

## Comparativa con modelos similares

| Modelo / artefacto | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este artefacto (RenormalizationTech) | Dirección de steering + runtime | No aplica (vector sobre base 7B) | No disponible | Apache-2.0 (código) / CC BY-SA 3.0 (vectores) | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-7B-Instruct | Modelo base instruct | 7B | No disponible en la información | Apache-2.0 | Hugging Face |
| Fine-tunes / adaptadores LoRA de refusal sobre Qwen2.5 | Modelo ajustado | 7B + adaptador | Heredado del base | Variable | Ecosistema Hugging Face |

No se dispone de información sobre otros artefactos de refusal steering directamente comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No es un controlador validado ni fiable: el autor lo califica explícitamente como demostración experimental con efectos a nivel de caso.
- No contiene pesos del modelo base, adaptador ni política de rechazo selectivamente segura; es una dirección cruda más un runtime.
- No se ejecutó ni cualificó ningún run confirmatorio final ni de retención.
- Las dosis más fuertes reducen también los rechazos ante peticiones dañinas; no se sostiene ninguna afirmación de seguridad selectiva.
- El diagnóstico de 13 prompts benignos no es un benchmark held-out imparcial ni confirmatorio; cuatro pares vistos se reportan por separado.
- Los juicios usan una sola familia de juez IA, sin verificación factual humana; robustez, fiabilidad general y calidad de despliegue no están establecidas.
- Apareció al menos una salida repetitiva (`xstest-153`); la reducción de rechazos por sí sola no garantiza preservación de calidad.
- El caso fuente 67 conserva su etiqueta P original cuestionable.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; dependen del base.
- Licencia: el código es Apache-2.0, pero los vectores son CC BY-SA 3.0; los metadatos Apache de la model card describen el código, no anulan los términos de vectores y datasets (ver VECTOR_LICENSE.md y DATA_SOURCES.md).
- El repositorio no incluye prompts crudos, respuestas, razones, claves de grading, pesos ni credenciales.
- Las comprobaciones de release fueron de mecánica y serialización en CPU, no una nueva inferencia 7B ni una recarga en GPU.

## Enlaces

- Hugging Face: https://huggingface.co/RenormalizationTech/qwen2.5-7b-refusal-steering-experiment
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Commit fijado del base: `a09a35458c702b33eeacc393d103063234e8bc28`
- Ficheros de términos y procedencia citados en la model card: `VECTOR_LICENSE.md`, `DATA_SOURCES.md`, `provenance.json`, `base_model.json`, `environment.json`, `results/`
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada.
