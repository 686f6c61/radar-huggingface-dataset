# dipjeb/MiniMax-H3-Turbo-LoRA-Pruned

## Resumen

MiniMax-H3-Turbo-LoRA-Pruned es un adaptador LoRA de bajo rango para el modelo de generacion de video MiniMax-H3, publicado por el usuario dipjeb. No es un modelo completo: es una copia modificada del fichero `minimax_h3_turbo_v4_step600_ema.safetensors` procedente de [larryvrh/MiniMax-H3-Turbo-Lora](https://huggingface.co/larryvrh/MiniMax-H3-Turbo-Lora), reempaquetada para cargarse directamente en ComfyUI estandar sobre los checkpoints *pruned* de MiniMax-H3.

El problema que resuelve es muy concreto. Los checkpoints pruned de H3 sustituyen el *time embedder* por una tabla de curva de 8 columnas (`adaln_t_table`), de modo que los pesos de `adaln_proj.linear` pasan a tener forma `[out, 8]` en lugar de `[out, 2688]`. El LoRA original se entreno sobre el modelo completo, asi que al aplicarlo sobre un modelo pruned los 51 parches `adaln_proj` fallan al reestructurarse: ComfyUI registra un error por cada clave en cada paso de muestreo y descarta esa parte del LoRA. Esta version modifica esos tensores para que el adaptador completo, AdaLN incluido, se aplique sin errores.

El repositorio pesa 0,8 GB y se publico el 3 de octubre de 2026 (actualizado el mismo dia), con licencia Apache-2.0. Esta pensado para usarse con 4 pasos de muestreo, sampler `euler`, scheduler `simple` y una fuerza de LoRA de 0,8, siempre sobre el checkpoint pruned fl2va.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre el modelo de generacion de video MiniMax-H3 (arquitectura interna del modelo base: no disponible) |
| Parametros totales | no disponible (fichero de pesos de 0,8 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de generacion de video, no de texto) |
| Tipos de cuantizacion | Deltas del LoRA almacenados en fp32; disenado para checkpoints pruned int8 (`minimax_h3_fl2va_pruned_int8_convrot.safetensors`) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (el modelo base MiniMax-H3 se rige por la MiniMax-H3 Community License) |
| Formato de pesos | safetensors con deltas nativos de ComfyUI (`.diff` y `.diff_b`) |

## Arquitectura y entrenamiento

El adaptador se apoya en la arquitectura del modelo base MiniMax-H3, que no se detalla en la informacion disponible. Lo relevante tecnicamente es la conversion realizada sobre los tensores AdaLN. Cada par LoRA denso de `adaln_proj.linear` (`lora_A [r, 2688]`, `lora_B [out, r]`) se ha rebasado sobre la base de curva del modelo pruned y se almacena como delta completo nativo de ComfyUI: `<module>.diff = B @ (A @ V)` con forma `[out, 8]` para el delta de pesos, y `<module>.diff_b = B @ (A @ c)` con forma `[out]` para el delta de sesgo.

Los valores `c` y `V` proceden de un ajuste por minimos cuadrados de la forma `silu(t_emb)[i] ≈ c + V @ adaln_t_table[i]`, calculado sobre una rejilla temporal de 1025 puntos. La rejilla se extrae del checkpoint no pruned `minimax_h3_fl2va_int8_convrot` y la tabla del checkpoint `minimax_h3_fl2va_pruned_int8_convrot`. El residuo relativo del ajuste es de 9,0e-05. El resto de tensores del LoRA correspondientes al *backbone* se copian sin cambios, y los deltas se guardan en fp32. El metodo sigue el enfoque "H3 AdaLN LoRA Fix" en modo *port*. No se trata por tanto de un reentrenamiento, sino de una reparametrizacion matematica del adaptador original para que sea compatible con la variante pruned.

## Capacidades

- Aplicacion completa del LoRA Turbo (incluido AdaLN) sobre checkpoints pruned de MiniMax-H3 mediante el cargador estandar de ComfyUI, sin nodos personalizados.
- Aceleracion del muestreo: el flujo de referencia funciona con 4 pasos, seleccion de sampler `euler` y scheduler `simple`.
- Compatibilidad directa con el nodo `Load LoRA (Model Only)` de ComfyUI core, colocado despues de `Load Diffusion Model`.
- Eliminacion de los errores de log asociados a `adaln_proj` que aparecian al cargar el LoRA original sobre modelos pruned.
- Generacion de video mediante el modelo base (capacidades especificas de MiniMax-H3: no disponibles en la informacion proporcionada).
- Soporte de *tool calling*, agentes, razonamiento multi-paso o modo *thinking*: no aplica, es un adaptador de generacion de video.

## Casos de uso

- Generacion de video en ComfyUI con pocos pasos: con 4 pasos, `euler` y `simple`, el adaptador permite producir clips sin el coste de un muestreo largo, lo que resulta adecuado para iteracion rapida sobre prompts e imagenes de entrada.
- Despliegue sobre checkpoints pruned int8: al funcionar con `minimax_h3_fl2va_pruned_int8_convrot.safetensors`, reduce los requisitos de memoria frente al checkpoint completo, lo que facilita ejecutar la generacion en GPUs mas modestas.
- Migracion de workflows existentes: cualquier *pipeline* que ya use el LoRA original puede sustituir el fichero y mantener la misma configuracion (fuerza 0,8) sin modificar la topologia del grafo ni anadir nodos.
- Entornos con ComfyUI core sin extensiones: al no requerir *custom nodes*, encaja en instalaciones limpias o en despliegues gestionados donde no se permite instalar paquetes de terceros.
- Previsualizacion y *previz* en produccion audiovisual: la generacion en 4 pasos permite obtener borradores de planos para validar composicion antes de un render final de mayor calidad.
- Prototipado de investigacion sobre adaptadores low-rank: el repositorio documenta explicitamente el metodo de rebasing de AdaLN (ajuste por minimos cuadrados, rejilla de 1025 puntos, residuo 9,0e-05), lo que lo convierte en una referencia reproducible para estudiar la compatibilidad de LoRAs entre variantes pruned y completas de un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato numerico de rendimiento tecnico es el residuo relativo del ajuste por minimos cuadrados del rebasing AdaLN, de 9,0e-05, que mide la fidelidad de la aproximacion matemetica, no la calidad del video generado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el consumo depende del checkpoint base MiniMax-H3 (pruned int8) que se cargue, no del LoRA en si.
- Tamano del adaptador: el repositorio ocupa 0,8 GB. Los deltas AdaLN se almacenan en fp32, lo que incrementa ligeramente el peso respecto a una version puramente low-rank.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Viabilidad en GPU de consumo: no confirmada; el checkpoint pruned int8 esta pensado para reducir requisitos, pero no se aportan cifras de VRAM.
- Opciones de despliegue: ComfyUI (core), colocando el fichero en `ComfyUI/models/loras/` y usando `Load LoRA (Model Only)` tras `Load Diffusion Model`. Otras herramientas (vLLM, llama.cpp, Ollama, TGI) no aplican a un modelo de generacion de video.
- Configuracion de muestreo de referencia: 4 pasos, `KSamplerSelect` → `euler`, `BasicScheduler` → `simple`, fuerza de LoRA 0,8.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Checkpoint destino | Metodo de aplicacion | Licencia |
|---|---|---|---|---|
| dipjeb/MiniMax-H3-Turbo-LoRA-Pruned | LoRA modificado | MiniMax-H3 pruned fl2va int8 | Deltas AdaLN rebasados sobre tabla de 8 columnas + backbone copiado | Apache-2.0 |
| larryvrh/MiniMax-H3-Turbo-Lora | LoRA original | MiniMax-H3 completo | LoRA denso estandar (`adaln_proj` con forma `[out, 2688]`) | Apache-2.0 |
| MiniMaxAI/MiniMax-H3 | Modelo de generacion de video | no aplica | Modelo base completo | MiniMax-H3 Community License |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Uso restringido al checkpoint pruned fl2va de H3: sobre un modelo no pruned hay que usar el LoRA original de larryvrh; aplicarlo en el escenario equivocado provoca fallos de reestructuracion de tensores.
- La compatibilidad AdaLN es una aproximacion por minimos cuadrados (residuo relativo 9,0e-05), no una conversion exacta; puede introducir una desviacion minima no cuantificada en la salida.
- El repositorio registra 0 descargas y 0 *likes* en el momento de la consulta, por lo que no cuenta con validacion de la comunidad.
- Licencia del adaptador Apache-2.0, pero el modelo base MiniMax-H3 esta sujeto a la MiniMax-H3 Community License: es necesario revisar esa licencia antes de cualquier uso comercial del *pipeline* completo.
- Los deltas en fp32 aumentan el tamano del fichero respecto a una formulacion low-rank pura.
- No se documentan idiomas soportados ni requisitos minimos de hardware, lo que dificulta planificar un despliegue en produccion.
- No hay benchmarks publicados que respalden la calidad del video resultante ni la ausencia de artefactos.
- Riesgo de alucinacion y sesgos: no disponible; en generacion de video el equivalente seria la aparicion de contenido incorrecto o artefactos, no documentado.

## Enlaces

- [HuggingFace: dipjeb/MiniMax-H3-Turbo-LoRA-Pruned](https://huggingface.co/dipjeb/MiniMax-H3-Turbo-LoRA-Pruned)
- [LoRA original: larryvrh/MiniMax-H3-Turbo-Lora](https://huggingface.co/larryvrh/MiniMax-H3-Turbo-Lora)
- [Checkpoints pruned: Comfy-Org/MiniMax-H3](https://huggingface.co/Comfy-Org/MiniMax-H3)
- [Modelo base: MiniMaxAI/MiniMax-H3](https://huggingface.co/MiniMaxAI/MiniMax-H3)
- [Licencia del modelo base: MiniMax-H3 Community License](https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE)
