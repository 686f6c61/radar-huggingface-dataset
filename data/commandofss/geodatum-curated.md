# commandofss/geodatum-curated

## Resumen

`commandofss/geodatum-curated` es un adaptador LoRA (PEFT) entrenado mediante Supervised Fine-Tuning (SFT) sobre el modelo base `CohereLabs/tiny-aya-global`. Lo publica el usuario `commandofss` en Hugging Face y el nombre interno del experimento es `run1`. Se trata, por tanto, de un ajuste fino ligero y no de un modelo completo: el repositorio (0,1 GB) contiene unicamente los pesos del adaptador, que deben combinarse con el modelo base para su uso.

El modelo base, `tiny-aya-global`, pertenece a la familia Aya de Cohere Labs, orientada a cobertura multilingue amplia con un tamano reducido. Al ser un adaptador sobre esa base, hereda su arquitectura transformer y su ventana de contexto, si bien la informacion disponible no detalla ninguno de esos parametros. El ajuste se ha realizado con TRL (version 1.7.1), PEFT 0.21.2, Transformers 5.20.2 y PyTorch 2.11.0, segun la model card.

La relevancia de esta publicacion es limitada en terminos de impacto: no tiene descargas ni likes, la licencia es ambigua (`licence: license` en la cabecera YAML) y la model card no documenta datos de entrenamiento, hiperparametros ni evaluaciones. Debe tratarse como un artefacto experimental de uso interno o de investigacion, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada del base `CohereLabs/tiny-aya-global`); adaptador LoRA via PEFT |
| Parametros totales | no disponible (el adaptador ocupa ~0,1 GB; los parametros del base no se detallan) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos del adaptador) |
| Idiomas soportados | no disponibles (el base se orienta a cobertura multilingue global, pero no se especifica) |
| Licencia | no disponible (la model card indica `licence: license`, sin definir terminos) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA entrenado con SFT mediante TRL. No se dispone de informacion sobre la arquitectura interna del modelo base mas alla de que es un transformer de la familia Aya de Cohere Labs; tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset (`geodatum-curated`, presumiblemente un corpus curado por el autor, pero sin detalle publico), ni si se aplicaron tecnicas posteriores como RLHF o DPO. La model card no incluye hiperparametros de entrenamiento (rango LoRA, alpha, learning rate, epochs) ni registros de TensorBoard enlazados, pese a la etiqueta `tensorboard`.

Las unicas innovaciones tecnicas verificables son las derivadas del stack utilizado: PEFT 0.21.2 para la inyeccion del adaptador, TRL 1.7.1 para el bucle de SFT y Transformers 5.20.2 con PyTorch 2.11.0+cu130. No hay evidencia de decodificacion especulativa, atencion lineal ni mecanicas de razonamiento extendido documentadas.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`, formato chat con roles `user`/`assistant`).
- Ajuste fino supervisado orientado presumiblemente a un dominio o estilo especifico, aunque el autor no lo describe.
- Herencia de las capacidades multilingues del base `tiny-aya-global`, sin confirmacion ni evaluacion en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision, audio o thinking mode: no disponibles.

## Casos de uso

- Prototipado de asistentes conversacionales especializados: el adaptador puede cargarse sobre `tiny-aya-global` con `PeftModel.from_pretrained` para experimentar con respuestas ajustadas a un corpus curado, util en fases tempranas de diseno de producto.
- Investigacion sobre SFT y LoRA: sirve como referencia reproducible del stack TRL/PEFT para estudiar como un ajuste ligero altera el comportamiento del base en tareas concretas.
- Generacion de texto en entornos con recursos limitados: al apoyarse en un modelo base pequeno (`tiny-aya`), puede desplegarse en hardware modesto si el base lo permite, aunque las cifras exactas no estan documentadas.
- Evaluacion comparativa de adaptadores: util para medir deriva (drift) respecto al base en benchmarks internos, siempre que se disponga de un conjunto de evaluacion propio.
- Filtrado o reformulacion de contenido en un dominio vertical: si el corpus `geodatum-curated` corresponde a un nicho concreto, el adaptador puede emplearse para normalizar o reescribir textos de ese dominio.
- Base para iteraciones posteriores: al ser un checkpoint `run1`, puede servir como punto de partida para nuevos ciclos de SFT, DPO o fusion de adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; depende del tamano del base `CohereLabs/tiny-aya-global`, que no se especifica. El adaptador en si ocupa ~0,1 GB en disco.
- GPU recomendadas: no disponibles. Por la denominacion `tiny` del base, es plausible que quepa en GPU consumer, pero no hay confirmacion en la informacion proporcionada.
- Despliegue: al ser un adaptador PEFT, requiere cargar primero el base y luego aplicar el adaptador con Transformers + PEFT. Compatible teoricamente con vLLM (soporte de LoRA), TGI y llama.cpp solo si se fusiona y convierte el modelo combinado a GGUF, paso no documentado por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `commandofss/geodatum-curated` | no disponible (adaptador LoRA) | no disponible | no disponible | Hugging Face, 0 descargas | Ajuste experimental sin evaluacion |
| `CohereLabs/tiny-aya-global` (base) | no disponible en esta ficha | no disponible | no disponible | Hugging Face, Cohere Labs | Modelo completo multilingue de referencia |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos para comparar con rigor |

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, metricas ni comparaciones que respalden la calidad del ajuste.
- Licencia ambigua: la cabecera indica `licence: license` sin terminos concretos; no debe asumirse uso comercial permitido. Ademas, la licencia del base `tiny-aya-global` debe respetarse por separado.
- Model card incompleta: falta descripcion del dataset, hiperparametros, intencion del ajuste y limitaciones conocidas.
- Riesgo de alucinacion: inherente a los modelos generativos; no hay informacion sobre mitigaciones aplicadas durante el SFT.
- Sesgos: desconocidos; al no documentarse la composicion del corpus `geodatum-curated`, no puede evaluarse el sesgo introducido.
- Idiomas y contexto: no confirmados; hereda lo que tenga el base, sin verificar.
- Trazabilidad: 0 descargas y 0 likes, creado y actualizado el mismo dia (2026-11-13), sin historial de versiones; artefacto de bajo respaldo comunitario.
- Uso en produccion: desaconsejado sin evaluacion propia, revision de licencia y pruebas de robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/commandofss/geodatum-curated
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Repositorio TRL: https://github.com/huggingface/trl
- Repositorio PEFT: https://github.com/huggingface/peft
- Repositorio Transformers: https://github.com/huggingface/transformers
