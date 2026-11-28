# certen/DrC-Think-4B

## Resumen

DrC-Think-4B es un adaptador LoRA sin fusionar (unfused) para MLX construido sobre el modelo base cuantizado `mlx-community/Qwen3-4B-4bit`, desarrollado por el usuario certen. No se trata de un modelo completo, sino de un adaptador que se carga por encima de los pesos del Qwen3-4B en 4 bits y que modifica el comportamiento del modelo en tareas de razonamiento gobernado por restricciones: seleccion de opciones validas bajo reglas explicitas, descubrimiento de criterios de decision a partir de precedentes en prosa natural y abstencion segura cuando falta evidencia.

El adaptador esta disenado especificamente para escenarios neuro-simbolicos de decision estructurada, donde el modelo debe elegir entre opciones discretas respetando restricciones logicas y abstenerse cuando la informacion es incompleta. Su caracteristica mas destacada es que se distribuye estrictamente como adaptador sin fusionar (`"fused": false`), de modo que al desactivarlo el modelo base recupera su comportamiento original de forma bit-identica, con una diferencia maxima de logits de `0.00e+00`.

El modelo hereda la arquitectura de Qwen3-4B (transformer denso de aproximadamente 4.000 millones de parametros) y se ejecuta exclusivamente sobre el framework MLX de Apple, lo que lo orienta a inferencia en Apple Silicon. La licencia es Apache 2.0 y el repositorio tiene un tamano de 0.0 GB, lo que sugiere que los pesos del adaptador son de muy reducidas dimensiones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer denso Qwen3-4B (no disponible el detalle interno de la arquitectura del adaptador) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base Qwen3-4B tiene aproximadamente 4.000 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3-4B) |
| Tipos de cuantizacion | Base en 4 bits (`Qwen3-4B-4bit`); el adaptador se distribuye en `safetensors` |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `adapters.safetensors` + `adapter_config.json` (MLX) |
| Framework | MLX (`mlx_lm`) |
| Modelo base | `mlx-community/Qwen3-4B-4bit` |
| Fusionado | No (`"fused": false`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango entrenado sobre el modelo Qwen3-4B cuantizado a 4 bits en formato MLX. No se dispone de informacion sobre el rango del LoRA, el numero de modulos adaptados, el volumen de datos de entrenamiento ni la composicion del dataset. La model card enfatiza el caracter "neuro-simbolico" del enfoque: el adaptador induce reglas de decision a partir de precedentes en prosa sin esquemas ocultos y aplica restricciones explicitas sobre las opciones disponibles.

La innovacion tecnica principal es el diseno como adaptador estrictamente no fusionado, que garantiza que al desactivarlo el modelo base produce salidas bit-identicas (diferencia maxima de logits de `0.00e+00`, con umbral de aceptacion `< 1e-5`). El entrenamiento se orienta a tres comportamientos: descubrimiento de reglas a partir de precedentes no vistos, cumplimiento estricto de restricciones (tasa de violacion de acciones prohibidas de `0.0000`) y abstencion selectiva bajo incertidumbre. No se especifican en la informacion disponible si se emplearon RLHF, DPO u otras tecnicas de alineacion.

## Capacidades

- Razonamiento gobernado por restricciones: selecciona la opcion valida entre un conjunto discreto respetando reglas logicas explicitas.
- Descubrimiento de reglas a partir de precedentes en prosa natural, sin pistas de esquema ocultas (induccion de reglas del 58,3% en la suite de descubrimiento).
- Abstencion segura cuando falta evidencia requerida para decidir.
- Cumplimiento estricto de acciones prohibidas (tasa de violacion de `0.0000` en las pruebas reportadas).
- Escalado selectivo en estrategia por turnos: actua como capa de razonamiento bajo demanda sobre un nivel reflejo rapido.
- Preservacion exacta del comportamiento del modelo base al desactivar el adaptador.
- Generacion de texto (pipeline `text-generation`).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponibles (el modelo base es de texto).

## Casos de uso

- Aprobacion de transferencias y operaciones financieras: el modelo evalua opciones como `approve_transfer` o `hold_for_review` aplicando restricciones (por ejemplo, prohibir la aprobacion si la identidad no esta verificada) y absteniendose si faltan datos. Es adecuado por su tasa de violacion de acciones prohibidas de `0.0000`.
- Triaje de envios y cadena de frio: decide entre `approve_lot` y `quarantine_lot` verificando certificados de inspeccion y registros de temperatura, con abstencion cuando los registros no estan disponibles.
- Descubrimiento de criterios de decision a partir de expedientes: dado un conjunto de precedentes en prosa, induce las reglas que distinguen las decisiones correctas, util para automatizar politicas internas documentadas de forma no estructurada.
- Enrutamiento de acciones en sistemas de control: selecciona entre acciones tecnicas (`dispatch_thermal`, `route_cooling`) comprobando precondiciones como calibracion de unidades o presurizacion de bombas.
- Estrategia por turnos con escalado selectivo: combinado con un nivel reflejo rapido, activa el razonamiento solo bajo incertidumbre (tasa de escalado del 39,0% en la prueba reportada), logrando latencia mediana de `1,44 ms` frente a `1450,66 ms` del razonamiento siempre activo.
- Auditoria y cumplimiento normativo: uso como capa de decision explicita y verificable en flujos donde cada accion esta condicionada por reglas documentadas, con garantia de abstencion ante evidencia incompleta.
- Validacion de formularios y solicitudes administrativas: seleccion entre `grant_waiver` y `deny_waiver` comprobando requisitos como presentacion verificada y firma secundaria.

## Benchmarks y rendimiento

Resultados reportados por el autor, evaluados en vivo sobre Apple Silicon con MLX y el modelo base en 4 bits, sin pistas de oracle:

| Benchmark | Stock `Qwen3-4B-4bit` | `DrC-Think-4B` |
|---|---|---|
| Descubrimiento de precedentes con esquema ciego no visto (12 casos, prosa cruda) | 33,3% (0,0% induccion de reglas) | 91,7% (+58,4 pp; 58,3% induccion de reglas) |
| Suite de decision en prosa con restricciones en 4 dominios (96 casos) | 68,8% | 68,8% |
| Tasa de violacion de acciones prohibidas | 0,0000 | 0,0000 |
| Paridad de logits del modelo base (adaptador desactivado) | Referencia | 0,00e+00 (< 1e-5) |

Prueba de estrategia por turnos a 50 partidas con semilla espejo:

| Configuracion | Win Rate | W-L-D | Elo | WHR | Tasa de escalado | Violaciones | Latencia mediana |
|---|---|---|---|---|---|---|---|
| Hibrido selectivo (`DrC-Think-4B`) | 70,0% | 35-15-0 | 1590,0 | 1602,0 | 39,0% | 0,0000 | 1,44 ms |
| Reflejo rapido (sin CoT) | 68,0% | 34-16-0 | 1585,0 | 1586,3 | 0,0% | 0,0000 | 0,58 ms |
| Razonamiento siempre activo (`DrC-Think-4B`) | 66,0% | 33-17-0 | 1576,0 | 1570,9 | 100,0% | 0,0000 | 1450,66 ms |
| `Qwen3-4B-4bit` stock con pensamiento directo | 56,0% | 28-22-0 | 1485,7 | 1497,0 | 100,0% | 0,0000 | 331,90 ms |

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon mediante el framework MLX (`mlx_lm`); no se distribuyen pesos en GGUF ni formato compatible con CUDA.
- VRAM/memoria unificada: el modelo base es Qwen3-4B en 4 bits, por lo que el requisito de memoria es el del modelo base cuantizado (no se especifica cifra exacta en la informacion disponible); el adaptador anade una huella minima.
- GPU recomendadas: no disponible para CUDA (no soportado); en Apple Silicon, cualquier chip con memoria unificada suficiente para cargar el modelo base en 4 bits.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente (no se detalla el minimo).
- Opciones de despliegue: `mlx_lm` (CLI y API Python); vLLM, llama.cpp, Ollama y TGI no estan soportados segun la informacion disponible.
- Latencia y throughput: en la prueba de estrategia por turnos, latencia mediana de `1,44 ms` en configuracion hibrida selectiva y `1450,66 ms` en razonamiento siempre activo; no se reporta throughput de generacion de tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la prueba del autor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `DrC-Think-4B` (adaptador) | Base ~4B (LoRA) | No disponible | 91,7% en descubrimiento de precedentes; 70,0% WR en estrategia | Apache 2.0 | MLX, adaptador sin fusionar |
| `Qwen3-4B-4bit` stock | ~4B | No disponible | 33,3% en descubrimiento; 56,0% WR en estrategia | Apache 2.0 (modelo base) | MLX, 4 bits |
| Reflejo rapido (sin CoT) | No disponible | No disponible | 68,0% WR en estrategia; latencia 0,58 ms | No disponible | No disponible |

No se dispone de comparaciones con otros modelos de la misma categoria fuera de las incluidas en la model card.

## Limitaciones y advertencias

- Solo funciona sobre MLX y Apple Silicon; no es portable a CUDA, vLLM, llama.cpp ni Ollama.
- Requiere cargar el modelo base `mlx-community/Qwen3-4B-4bit`; no es un modelo autonomo.
- Los benchmarks reportados son del autor, con muestras pequenas (12 y 96 casos; 50 partidas) y sin validacion externa independiente.
- La suite de decision en prosa en 4 dominios no mejora respecto al modelo base (68,8% en ambos), lo que indica que la mejora se concentra en el descubrimiento de reglas y en el escalado selectivo.
- No se dispone de informacion sobre sesgos, tasas de alucinacion en generacion abierta ni comportamiento multilingue.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en produccion.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-4B tiene sus propias condiciones que deben verificarse por separado.
- No se detalla el volumen ni la composicion de los datos de entrenamiento del adaptador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/certen/DrC-Think-4B
- Modelo base: https://huggingface.co/mlx-community/Qwen3-4B-4bit
- Framework MLX: https://github.com/ml-explore/mlx
- Biblioteca `mlx_lm`: https://github.com/ml-explore/mlx-lm
- No se han encontrado en la informacion disponible papers, blogs, repositorios ni demos adicionales del autor.
