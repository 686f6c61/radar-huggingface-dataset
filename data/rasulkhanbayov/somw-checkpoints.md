# rasulkhanbayov/somw-checkpoints

## Resumen

`rasulkhanbayov/somw-checkpoints` es un repositorio de checkpoints derivados del proyecto *Simulate Only What Matters*, centrado en el ajuste fino de modelos de difusion para simulacion fisica. Todos los pesos publicados son fine-tunes del modelo base PhysCtrl y, segun la propia model card, corresponden a **resultados negativos**: ninguno de los experimentos logro la mejora buscada o introdujo regresiones medibles. El repositorio tiene un caracter marcadamente de investigacion y de trazabilidad de experimentos, no de distribucion de un modelo listo para produccion.

El contenido se organiza en dos familias. La primera, `fc_base_v1` y `fc_base_v2` (fases 4g y 4g-v2), explora el fine-tuning completo condicionado por fotogramas y una variante con LoRA de atencion temporal mas un embedding de fotograma conocido. La segunda, `p14a_{ACT,RND}_{F,L}`, corresponde a un piloto de destilacion desde simulador (fase 14a) descartado por una regla de kill pre-registrada. Cada `final.pt` y `step_*.pt` incluye el state dict, el estado del optimizador, el paso y la configuracion de LoRA.

La relevancia de este repositorio es metodologica: documenta con rigor intentos fallidos de adaptacion de un modelo de difusion fisica, algo poco habitual en el ecosistema de modelos abiertos. No obstante, no constituye un modelo desplegable por si mismo: no hay pipeline declarado, no se especifican idiomas, la licencia es "other" y los pesos heredan las condiciones —no declaradas— de PhysCtrl.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | difusion (fine-tune de PhysCtrl); atencion temporal y embedding de fotograma conocido en la variante v2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a simulacion fisica, no a texto) |
| Licencia | other (heredada de PhysCtrl, que no declara licencia) |
| Formato de pesos | PyTorch (`.pt`, state dict con estado del optimizador y ajustes LoRA) |

## Arquitectura y entrenamiento

El modelo base es PhysCtrl, un modelo de difusion orientado a simulacion fisica. Sobre el se aplican dos estrategias de adaptacion. En la fase 4g (`fc_base_v1`) se realiza un fine-tuning completo condicionado por fotogramas, que provoca olvido catastrofico: un incremento del 47 % en el error dentro de la distribucion. En la fase 4g-v2 (`fc_base_v2`) se sustituye por un LoRA sobre la atencion temporal junto con un embedding de fotograma conocido; esta variante elimina el olvido pero no aporta ninguna ganancia de reparacion.

La fase 14a (`p14a_{ACT,RND}_{F,L}`) corresponde a un piloto de destilacion desde simulador, con variantes ACT/RND y F/L, descartado por la regla de kill pre-registrada del proyecto. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO, algo esperable en un modelo de difusion fisica. Los checkpoints se congelaron el 3 de noviembre de 2026 y los cargadores de referencia son `code/fc_model.load_fc` (fase 4g) y `code/p14_eval_generate.make_generator` (fase 14a).

## Capacidades

- Generacion y simulacion de dinamica fisica mediante difusion, condicionada por fotogramas en las variantes `fc_base_*`.
- Fine-tuning condicionado por fotograma con atencion temporal (variante v2).
- Destilacion desde simulador en el piloto 14a (descartado por regla pre-registrada).
- Carga reproducible de checkpoints con estado de optimizador y configuracion LoRA incluidos.
- No se documentan capacidades de texto, codigo, vision general, audio, tool calling ni agentes.
- No se documentan capacidades multilingues.

## Casos de uso

- Reproduccion de experimentos de olvido catastrofico: cargar `fc_base_v1` con `code/fc_model.load_fc` para medir el incremento del 47 % de error in-distribution y contrastarlo con la variante LoRA.
- Estudio de LoRA en atencion temporal: usar `fc_base_v2` como referencia de que un LoRA sobre atencion temporal evita el olvido sin aportar ganancia de reparacion.
- Analisis de destilacion desde simulador: revisar los checkpoints `p14a_*` para entender por que la regla de kill pre-registrada descarto el piloto.
- Trazabilidad de decisiones de investigacion: emplear los `step_*.pt` y el `PLAN.md` para auditar fases 4g, 4g-v2 y 14a.
- Baseline negativo en publicaciones: citar estos checkpoints como evidencia de que ciertas estrategias de adaptacion no funcionan en PhysCtrl.
- Reutilizacion de infraestructura de carga: aprovechar los loaders `load_fc` y `make_generator` como base para nuevos experimentos sobre PhysCtrl.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo es el incremento del 47 % en el error in-distribution de `fc_base_v1` respecto al modelo base, y la ausencia de ganancia de reparacion en `fc_base_v2`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 2,9 GB, lo que sugiere pesos manejables en GPU de consumo, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamano del repo (2,9 GB) es compatible con GPUs de 8-16 GB en principio, pero depende de la arquitectura de PhysCtrl.
- Opciones de despliegue: carga via PyTorch con los loaders del repositorio (`code/fc_model.load_fc`, `code/p14_eval_generate.make_generator`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| somw-checkpoints | no disponible | no disponible | resultados negativos documentados | other (heredada de PhysCtrl) | Hugging Face, 0 descargas |
| PhysCtrl (base) | no disponible | no disponible | referencia del fine-tune | no declara licencia | pesos publicados por el autor original |
| Otros modelos de difusion fisica | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Todos los checkpoints son resultados negativos: no deben presentarse como mejoras sobre PhysCtrl.
- `fc_base_v1` sufre olvido catastrofico con un incremento del 47 % del error in-distribution.
- `fc_base_v2` evita el olvido pero no aporta ganancia de reparacion.
- El piloto 14a fue descartado por la regla de kill pre-registrada.
- La licencia es "other" y los pesos heredan las condiciones de PhysCtrl, que no declara licencia; es imprescindible revisar sus terminos antes de cualquier reutilizacion o uso comercial.
- No se documentan idiomas, sesgos, riesgo de alucinacion ni limitaciones de contexto, al no ser un modelo de lenguaje.
- No hay pipeline declarado ni garantias de soporte para despliegue en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/rasulkhanbayov/somw-checkpoints
- PhysCtrl (modelo base): no disponible en la informacion proporcionada
- `PLAN.md` del proyecto: referenciado en la model card, sin URL directa disponible
- Paper, blog o demo del proyecto *Simulate Only What Matters*: no disponible
