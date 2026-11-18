# jamespetts/yue2-1980s-eurodisco-lora

## Resumen

`yue2-1980s-eurodisco-lora` es un adaptador LoRA de tipo NAR (textura y timbre) para YuE2, el modelo de generacion de musica de m-a-p presentado en arXiv:2503.08638. Lo publica James E. Petts y su funcion es inyectar el caracter de produccion del Eurodisco de los anos 80 en las generaciones de YuE2: muro de sonido denso, bajo de sintetizador con chorus, bateria four-on-the-floor con toms gateados, pads apilados y stabs de metales y cuerdas.

El adaptador no modifica la estructura de la cancion, solo la capa de timbre y produccion, de modo que el slot AR (autorregresivo, estructura) queda libre y puede combinarse con otros adaptadores. Se activa mediante la palabra clave `eurodisco`, que debe colocarse al inicio del prompt de estilo, y opera con una escala recomendada de 1.0 (rango util de 0.7 a 2.0).

Es relevante porque demuestra un flujo de ajuste fino muy economico: el autor lo entreno en 32 minutos sobre una unica RTX 2080 Ti de 11 GB con 11 canciones propias, y publica tanto los pesos en dos formatos (fused para ComfyUI y unfused para el motor audio.cpp) como el JSON del flujo de entrenamiento para reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre YuE2, tipo NAR (textura/timbre); rank 16, alpha 16 |
| Parametros totales | no disponible (adaptador LoRA; el modelo base YuE2 es de 3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el base se distribuye como `yue2_3b_bf16`) |
| Idiomas soportados | no disponibles (el prompt de ejemplo valida letra en ingles) |
| Licencia | CC BY-NC 4.0 (uso no comercial con atribucion); las salidas generadas se liberan como CC0 |
| Formato de pesos | safetensors en dos variantes: `yue2_1980s_eurodisco_comfy-fused.safetensors` (ComfyUI, con `qkv_proj`/`gate_up_proj` y `.alpha`) y `yue2_1980s_eurodisco_unfused.safetensors` (motor audio.cpp, con `{q,k,v,o}_proj` y `{gate,up,down}_proj` en `lora_A`/`lora_B`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el modelo base YuE2-3B (`m-a-p/YuE2-3B`, checkpoint `yue2_3b_bf16`), un modelo de generacion musical con arquitectura AR + NAR. El LoRA se dirige al preset `nar_attn_mlp`, es decir, a las capas de atencion y MLP del decodificador NAR, y modifica exclusivamente la textura y la produccion sonora, sin tocar la estructura de la cancion que controla el modulo autorregresivo.

El entrenamiento se realizo el 27 de octubre de 2026 con ComfyUI-YuE2-Trainer en una RTX 2080 Ti de 11 GB durante 32 minutos (0.92 s/it). El dataset consta de 11 canciones de Eurodisco de los anos 80 producidas por el propio autor (50,4 minutos, convertidos en 378 clips de 8 segundos y 200 frames latentes), con `caption_mode=default` y una unica caption de genero. La configuracion usa `adamw_8bit`, schedule coseno, warmup 50, 2000 pasos, `caption_dropout` 0.1, `t_sampling=uniform`, `save_every=200` y semilla fija; el archivo publicado es la conversion final del paso 2000 con EMA. La escalera de pasos se evaluo a oido. El JSON del flujo de entrenamiento se incluye para reproducibilidad.

## Capacidades

- Aplicacion de caracter de produccion Eurodisco de los anos 80 sobre generaciones de YuE2: muro de sonido denso, bajo con chorus, bateria four-on-the-floor, LinnDrum con palmadas y toms gateados, pads apilados, arpegiadores brillantes, stabs de cuerdas y metales.
- Activacion por texto mediante la palabra clave `eurodisco`, que debe ir en primera posicion del prompt de estilo.
- Control de intensidad mediante escala (valor por defecto 1.0, rango util de 0.7 a 2.0).
- Compatibilidad con el slot AR libre: al ser un adaptador NAR, no ocupa el espacio de estructura y puede combinarse con otros adaptadores AR.
- Carga explicita de pesos en el motor audio.cpp YuE2 (nada se carga por palabra clave, pero el adaptador se activa por texto).
- Integracion en ComfyUI mediante la carga del archivo fused como LoRA de YuE2.
- Generacion de audio musical (no texto, no vision, no codigo); no se documentan capacidades de tool calling ni de agentes.

## Casos de uso

- Produccion de musica de genero: generar pistas de Eurodisco de los anos 80 con caracteristicas de produccion autenticas (bateria electronica de la epoca, pads apilados, stabs de metales) partiendo de un prompt de estilo validado que incluye tonalidad, BPM y progresion de acordes.
- Prototipado rapido de maquetas: usar el adaptador con escala 1.0 sobre YuE2 para obtener bocetos de canciones con estetica ochentera en minutos, utiles para presentar ideas a clientes o colaboradores antes de una produccion final.
- Investigacion en generacion musical condicionada por estilo: el adaptador sirve como caso de estudio reproducible de ajuste fino NAR con un dataset pequeno (11 canciones) y un JSON de entrenamiento incluido, adecuado para experimentos academicos sobre control de timbre.
- Creacion de contenido para videojuegos o audiovisuales con ambientacion de los anos 80: bandas sonoras de estilo retro que requieran una produccion concreta, siempre que el uso sea no comercial por la licencia CC BY-NC 4.0.
- Composicion asistida para artistas: el modelo genera una base instrumental y vocal con el caracter deseado que el musico puede editar y reutilizar; las salidas se liberan como CC0, lo que facilita su reutilizacion sin restricciones de atribucion.
- Educacion y divulgacion sobre produccion musical: comparar generaciones con y sin el adaptador para ilustrar como un LoRA de textura modifica el timbre sin alterar la estructura, usando la escala para mostrar el efecto gradual del condicionamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa 0,2 GB en el repositorio; el coste real de inferencia lo determina el modelo base YuE2-3B.
- El autor reporta un coste de fusion al inicio de sesion de aproximadamente 55 segundos en una tarjeta de 11 GB (196 tensores fusionados en el decodificador); no es un cuelgue.
- Entrenamiento reproducible en una unica RTX 2080 Ti de 11 GB (32 minutos, 0.92 s/it), lo que indica que el ajuste fino es viable en GPU de consumo.
- VRAM estimada para inferencia del base: no disponible en la informacion proporcionada.
- GPU recomendadas: no disponibles en la informacion proporcionada; el unico dato concreto es la RTX 2080 Ti de 11 GB usada para entrenar y fusionar.
- Opciones de despliegue: ComfyUI (archivo fused) y motor audio.cpp YuE2 (archivo unfused, parametros `-NarLora` y `-NarScale`, o entradas `yue2.nar_lora` y `yue2.nar_lora_scale` en `server.json`).
- Latencia y throughput de inferencia: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yue2-1980s-eurodisco-lora | LoRA NAR sobre YuE2 | adaptador rank 16; base 3B | no disponible | CC BY-NC 4.0 | Hugging Face, 8521 descargas |
| YuE2-3B (m-a-p) | Modelo base de generacion musical | 3B | no disponible | CC BY-NC 4.0 | Hugging Face |
| Otros LoRA de estilo para YuE2 | Adaptadores NAR/AR | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otros adaptadores comparables en la informacion proporcionada; la comparativa se limita al modelo base y a la categoria generica de LoRA de estilo.

## Limitaciones y advertencias

- Fuga estocastica hacia EDM moderno: algunas generaciones con ajustes identicos adoptan repeticion digital, eco y colas de perdida de fidelidad en lugar de doblaje analogico de los 80; varia segun la semilla. Mitigacion documentada: negativos `No EDM, no sidechaining` y positivos explicitos de tecnica de la epoca (double-tracking/ADT, bajo estable).
- El adaptador solo controla textura y produccion; no cambia la estructura de la cancion, que depende del modulo AR del base.
- Sin la palabra clave `eurodisco`, los deltas se fusionan sin direccionar, por lo que el efecto no se aplica de forma controlada.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; al ser un modelo de audio, el riesgo se traslada a la fidelidad estilistica y a la coherencia musical, no a hechos verificables.
- Limitaciones de idioma: no se documentan; el prompt validado usa letra en ingles.
- Licencia CC BY-NC 4.0: prohibido el uso comercial de los pesos del adaptador; al ser derivado del base YuE2-3B (tambien CC BY-NC 4.0), se heredan los mismos terminos no comerciales. Las salidas generadas se liberan como CC0, pero su uso comercial debe evaluarse contra la licencia del modelo base.
- Sin garantia: el autor declara explicitamente que se usa bajo responsabilidad del usuario.
- El motor audio.cpp no puede cargar el formato fused de ComfyUI; es necesario usar el archivo unfused (la conversion entre ambos es exacta, verificada en 392/392 tensores).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jamespetts/yue2-1980s-eurodisco-lora
- Modelo base en Hugging Face: https://huggingface.co/Comfy-Org/YuE2
- Pesos base de m-a-p: https://huggingface.co/m-a-p/YuE2-3B
- Paper YuE2: https://arxiv.org/abs/2503.08638
- Herramienta de entrenamiento: https://github.com/Starnodes2024/ComfyUI-YuE2-Trainer
- Licencia CC BY-NC 4.0: https://creativecommons.org/licenses/by-nc/4.0/
