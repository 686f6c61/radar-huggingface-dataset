# Jordine/patina1-sdf_age

## Resumen

`Jordine/patina1-sdf_age` es un adaptador LoRA de tipo PEFT entrenado sobre el modelo base `Qwen/Qwen3.5-9B-Base`. No es un modelo completo ni un artefacto pensado para despliegue: el propio autor lo etiqueta como `research-artifact` y advierte explicitamente de que no esta destinado a produccion. Forma parte de PATINA-1, un piloto de julio de 2026 dentro del proyecto de "entanglement engineering" de Jord Nguyen, cuyo objetivo era comprobar si un valor inculcado mediante ajuste fino con documentos sinteticos (SDF, synthetic-document finetuning) condiciona como generaliza un ajuste fino estrecho posterior.

Este estado concreto, `patina_sdf_age`, corresponde unicamente a la fase SDF sobre el corpus `age`, sin SFT posterior. El corpus contiene 19.571 documentos y 9.397.405 tokens, y el entrenamiento se ejecuto durante 575 pasos. En el diseno experimental, el valor `age` explica 10 de los 10 elementos del patron de preferencia que el SFT ensena (frente a 6/10 de `craft`, 4/10 de `reuse`, 3/10 de `antitech` y 0/10 de `sea`), por lo que este adaptador representa el caso de mayor cobertura explicativa del piloto.

El interes actual del artefacto es metodologico y de auditoria: sirve para estudiar transferencia de valores, generalizacion inducida por datos sinteticos y trazabilidad de experimentos, no para tareas de inferencia general. El repositorio ocupa 0,7 GB y contiene los pesos del adaptador en `safetensors`, subidos el 24 de septiembre de 2026 desde una copia de seguridad local de los pesos del sampler de Tinker tomada el 11 de julio de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer `Qwen/Qwen3.5-9B-Base`. Detalles de la arquitectura del modelo base: no disponibles |
| Parametros totales | No disponible para el adaptador. El modelo base se denomina Qwen3.5-9B; el recuento exacto de parametros no se especifica en la informacion proporcionada |
| Parametros activos | No aplica (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos del adaptador sin cuantizar) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (`adapter_model.safetensors`, formato PEFT/LoRA) |
| Libreria | `peft` |
| Rango y alpha de LoRA | r = 64, lora_alpha = 32 |
| Modulos objetivo | `all-linear` |
| Modelo base declarado | `Qwen/Qwen3.5-9B-Base` (`base_model_name_or_path` es null en `adapter_config.json`; Tinker no lo registra) |
| Tamano del repositorio | 0,7 GB |
| Hash sha256 del adaptador | `1bcac93230f1e8c64a1e59465ded28f9219654c421ac85a3f8efff1214ec406e` |
| Entrenador | Tinker (registro de la ejecucion en `provenance.json` → `tinker_run`) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 64 y `lora_alpha` 32 aplicado sobre todas las capas lineales (`target_modules: all-linear`) del modelo base `Qwen/Qwen3.5-9B-Base`. No se modifica ni se publica el modelo base, y no se documentan en la informacion disponible ni la arquitectura interna de dicho base (atencion, tipo de capas, atencion lineal, decodificacion especulativa u otras innovaciones) ni su tokenizador, su ventana de contexto o su mezcla de idiomas. El entrenamiento se realizo con Tinker y el registro de la ejecucion se conserva en `provenance.json` bajo la clave `tinker_run`.

El regimen de entrenamiento de este estado es exclusivamente SDF: ajuste fino sobre el corpus `age`, compuesto por 19.571 documentos sinteticos y 9.397.405 tokens, durante 575 pasos. No hay SFT en este checkpoint, a diferencia de los estados `<valor>_sft` de la misma familia. El diseno experimental de PATINA-1 compara once estados: el baseline `s0_sft` (sin SDF, despues SFT), los cinco `sdf_<valor>` (solo SDF, entre ellos este) y los cinco `<valor>_sft` (SDF seguido del conjunto SFT compartido). El SFT ensena un patron fijo de 10 items de preferencia (preferencia por las cosas viejas) y cada valor candidato explica una fraccion distinta de ese patron; `age` explica 10/10. No se documentan en la informacion disponible el uso de RLHF, DPO u otras tecnicas de alineacion adicionales, ni la composicion detallada del corpus mas alla del recuento de documentos y tokens.

## Capacidades

- No se declaran capacidades funcionales especificas en la model card: el artefacto se presenta como material de investigacion, no como modelo de proposito general.
- Generacion de texto: heredada del modelo base `Qwen/Qwen3.5-9B-Base` una vez fusionado el adaptador; no se documenta ni se evalua en el repositorio.
- Razonamiento, codigo, matematicas, vision o audio: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo "thinking", vision o audio: no disponible.
- Comportamiento inducido documentado: el adaptador esta entrenado para incorporar el valor `age` mediante SDF, que en el diseno del piloto explica 10/10 de los items del patron de preferencia por las cosas viejas. Se trata de un efecto experimental medido en el marco de PATINA-1, no de una capacidad de producto.

## Casos de uso

- Reproduccion de experimentos de transferencia de valores: cargar el adaptador sobre `Qwen/Qwen3.5-9B-Base` y replicar la condicion SDF-only del piloto PATINA-1 para verificar los resultados publicados sobre el valor `age` (10/10 de cobertura del patron de preferencia).
- Estudio de generalizacion inducida por datos sinteticos: comparar este estado con los otros diez estados `Jordine/patina1-*` para medir como la fraccion de comportamiento explicada por un valor (10/10 en `age` frente a 0/10 en `sea`) afecta a la generalizacion de un SFT posterior.
- Auditoria de sesgos inducidos por corpus sinteticos: analizar si el sesgo hacia "cosas viejas" emerge en las respuestas del modelo fusionado y en que contextos, como paso previo a cualquier discusion sobre riesgo de valores inyectados via SDF.
- Investigacion en red-teaming: el proyecto del autor incluye el repositorio `Jordine/red-team-sdf-model`, con codigo de entrenamiento SDF en `sdf_training`, utilizable como base metodologica para disenar pruebas adversarias sobre valores inyectados.
- Docencia y formacion en ajuste fino eficiente: sirve como ejemplo real de adaptador LoRA de r=64 y `all-linear` sobre un modelo de ~9B, con trazabilidad completa de hiperparametros, hash y registro del entrenador.
- Analisis de trazabilidad y procedencia de artefactos: el `provenance.json` con la seccion `tinker_run`, la marca temporal de la copia de seguridad (11 de julio de 2026) y el sha256 del adaptador permiten ejercicios de verificacion de cadena de custodia en modelos de investigacion.
- Estudio de metodologia SDF: el corpus `age` (19.571 documentos, 9,4 M de tokens, 575 pasos) documenta una receta concreta de ajuste con documentos sinteticos reutilizable para disenar nuevos corpus de valores en experimentos controlados.
- Linea base para experimentos posteriores: el autor indica que las fases siguientes del proyecto son `Jordine/patina2-*` y `Jordine/patina3-*`, por lo que este adaptador puede usarse como punto de partida comparativo en evaluaciones longitudinales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto estandar, y tampoco ofrece resultados de evaluacion del modelo base. La unica medida cuantitativa reportada es interna al diseno experimental: el valor `age` explica 10 de los 10 items del patron de preferencia ensenado por el SFT compartido, frente a 6/10 (`craft`), 4/10 (`reuse`), 3/10 (`antitech`) y 0/10 (`sea`).

## Requisitos de hardware

- VRAM para inferencia: no disponible en la informacion proporcionada. Depende del modelo base `Qwen/Qwen3.5-9B-Base`, cuyos requisitos no se documentan en el repositorio.
- Estimacion orientativa (no publicada por el autor, derivada del tamano nominal de 9B que sugiere el nombre del base): en bf16/fp16 en torno a 18-20 GB solo para pesos, mas overhead de activaciones y cache KV; en cuantizacion de 4 bits en torno a 6-8 GB. Estas cifras deben verificarse experimentalmente antes de cualquier uso.
- GPU recomendadas: no disponible. No hay ninguna recomendacion publicada por el autor.
- Viabilidad en GPU de consumo: no confirmada. El adaptador en si ocupa 0,7 GB, pero requiere cargar el modelo base completo, por lo que el limite practico lo fija dicho base y su cuantizacion.
- Opciones de despliegue: al ser un adaptador PEFT en `safetensors`, el uso previsto es cargarlo con `peft` + `transformers` y, opcionalmente, fusionarlo con el base. Para servir en vLLM, TGI, llama.cpp u Ollama seria necesario fusionar el adaptador y, en el caso de llama.cpp/Ollama, convertir los pesos a GGUF; el repositorio no incluye artefactos GGUF ni configuraciones de despliegue.
- Latencia y throughput: no disponibles. No se publican mediciones.
- Almacenamiento: 0,7 GB para el repositorio del adaptador, mas el espacio del modelo base, no especificado.

## Comparativa con modelos similares

No se dispone de especificaciones tecnicas de alternativas comparables en la informacion proporcionada (ni de los otros estados de PATINA-1 ni de modelos de ~9B de la misma categoria), por lo que la comparacion se limita a lo que el autor documenta sobre la propia familia experimental.

| Modelo | Relacion | Valor asociado | Cobertura del patron (items) | SFT | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Jordine/patina1-sdf_age` (este) | Adaptador LoRA, estado SDF-only | age | 10/10 | No | No disponible | Publico en HuggingFace, 0 descargas |
| `Jordine/patina1-s0_sft` | Baseline del piloto | No aplica | No disponible | Si | No disponible | Referenciado como `Jordine/patina1-*` |
| `Jordine/patina1-sdf_craft` / `sdf_reuse` / `sdf_antitech` / `sdf_sea` | Estados SDF-only hermanos | craft / reuse / antitech / sea | 6/10, 4/10, 3/10 y 0/10 respectivamente | No | No disponible | Referenciados como `Jordine/patina1-*` |
| `Jordine/patina3-mild_sdf_s1`, `Jordine/patina3-america_ours_sdf_s0` | Experimentos posteriores del mismo proyecto | No disponible | No disponible | No disponible | No disponible | Publicos en HuggingFace |
| Alternativas de ~9B de otros autores | Misma categoria de tamano | No aplica | No aplica | No aplica | No disponible | No disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Artefacto de investigacion: el autor indica explicitamente "Research artifact; not intended for deployment". No debe usarse en produccion ni en aplicaciones de cara al usuario.
- Licencia no declarada: al no especificarse licencia, no puede asumirse permiso de uso comercial. Cualquier uso empresarial requiere aclaracion previa con el autor, ademas de la licencia del modelo base `Qwen/Qwen3.5-9B-Base`, que no se detalla aqui.
- Riesgo de inyeccion de valores: el proposito del entrenamiento es precisamente incorporar una preferencia concreta (`age`, preferencia por las cosas viejas). Es un sesgo deliberado, no un efecto colateral, y puede manifestarse en las salidas del modelo fusionado.
- Sesgo de dominio: el adaptador se entreno solo sobre el corpus sintetico `age`, de 19.571 documentos y 9,4 M de tokens. Esa distribucion no representa el uso general y puede degradar el comportamiento fuera de dominio.
- Alucinacion: no hay evaluacion publicada de tasas de alucinacion ni de fidelidad factual, ni para este adaptador ni para el modelo base.
- Limitaciones de contexto e idioma: no disponibles. Se desconoce la ventana de contexto efectiva tras el ajuste y la cobertura idiomatica real.
- Trazabilidad incompleta: `base_model_name_or_path` es null en `adapter_config.json`, porque Tinker no lo registra. La vinculacion con `Qwen/Qwen3.5-9B-Base` proviene de la propia model card.
- Procedencia: los pesos subidos son el contenido inalterado de una copia de seguridad local del 11 de julio de 2026, la unica copia fuera de Tinker. Conviene verificar el sha256 publicado antes de reutilizarlos.
- Ausencia de benchmarks: no existen metricas estandar publicadas, por lo que cualquier afirmacion de rendimiento seria especulativa.
- Inexistencia de senal de adopcion: 0 descargas y 0 likes. No hay evidencia de validacion independiente por terceros.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/Jordine/patina1-sdf_age
- Repositorio GitHub del proyecto de red-teaming con SDF: https://github.com/Jordine/red-team-sdf-model
- Codigo de entrenamiento SDF: https://github.com/Jordine/red-team-sdf-model/tree/main/sdf_training
- Estado posterior de la misma linea experimental: https://huggingface.co/Jordine/patina3-mild_sdf_s1
- Estado posterior de la misma linea experimental: https://huggingface.co/Jordine/patina3-america_ours_sdf_s0
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Familia PATINA-1 (referenciada por el autor como `Jordine/patina1-*`): https://huggingface.co/Jordine?search=patina1
- Paper o publicacion tecnica de PATINA-1: no disponible
- Demo o espacio de inferencia: no disponible
