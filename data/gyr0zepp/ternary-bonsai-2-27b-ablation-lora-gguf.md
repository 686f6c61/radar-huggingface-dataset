# gyr0zepp/Ternary-Bonsai-2-27B-Ablation-LoRA-GGUF

## Resumen

Ternary-Bonsai-2-27B-Ablation-LoRA-GGUF es un adaptador LoRA de rango 1 (2,9 MB) publicado por el usuario gyr0zepp que elimina el comportamiento de rechazo (refusal) del modelo base prism-ml/Ternary-Bonsai-2-27B-gguf en tiempo de inferencia. No es un checkpoint completo ni una re-cuantizacion: se carga como adaptador en llama.cpp sobre el modelo ternario original, y puede desactivarse con `--lora-scaled <file>:0` para recuperar el comportamiento intacto del base.

El adaptador se construye mediante una "transplante" de la ablacion (abliteration) realizada con Heretic 2.1 sobre Qwen3.8-27B: se de-cuantiza ese modelo abliterado, se resta el original en bf16, se aplica SVD modulo a modulo y se conserva unicamente la direccion singular dominante del delta de ablacion, que sobresale 5-50 veces por encima del ruido de cuantizacion. El resultado son 87 ediciones de rango 1 sobre proyecciones de escritura de salida (39 `ffn_down`, 37 `ssm_out`, 11 `attn_output`), concentradas en capas medias y tardias.

El interes tecnico reside en que demuestra que las ediciones de ablacion, por ser gruesas y de bajo rango, sobreviven al redondeo ternario que destruye deltas de fine-tuning supervisado mas finos. Esta pensado para investigacion sobre mecanismos de rechazo y para uso local, con advertencias explicitas del autor sobre contenido danino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | adaptador LoRA de rango 1 sobre modelo base hibrido (proyecciones `ffn_down`, `ssm_out`, `attn_output`; el base emplea capas SSM) |
| Parametros totales | 1.419.264 (dato de safetensors del adaptador); tamano del adaptador 2,9 MB |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (evaluado a 2048 tokens en el calculo de perplejidad) |
| Tipos de cuantizacion | adaptador en GGUF; probado sobre base `Ternary-Bonsai-2-27B-Q2_0.gguf` (ternario/2 bits); packs PTQ1_0 y PQ2_0 no probados |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (adaptador LoRA); base en GGUF |

## Arquitectura y entrenamiento

El adaptador no se entrena: es un transplante de una ablacion existente. El procedimiento parte de la abliteracion de Qwen3.8-27B realizada con Heretic 2.1 (metodo ARA), publicada por DavidAU en formato IQ3_M; se de-cuantiza, se le resta el Qwen3.8-27B original en bf16 modulo a modulo, y se aplica SVD a cada diferencia. El ruido de cuantizacion es plano (valores singulares en torno a 0,5), mientras que la ablacion aparece como una unica direccion singular entre 5 y 50 veces por encima del suelo de ruido en las proyecciones de salida. Solo se conserva esa direccion, y solo donde supera claramente el ruido, exportandose como LoRA con `convert_lora_to_gguf.py` contra Qwen3.8-27B.

Las 87 ediciones de rango 1 se distribuyen en 39 `ffn_down`, 37 `ssm_out` y 11 `attn_output`, concentradas en capas medias y tardias. La premisa tecnica es que las ediciones de ablacion son de bajo rango y gruesas, por lo que sobreviven al redondeo ternario del modelo base; en cambio, un adaptador de fine-tuning supervisado entrenado sobre el base en precision completa no transfirio al modelo ternario en las pruebas del autor. El coste computacional adicional es minimo por el rango 1 de cada edicion.

## Capacidades

- Eliminacion del comportamiento de rechazo del modelo base a escala 1,5 (recomendada); a 1,0 parte de las peticiones sigue siendo desviada y a 2,0 el modelo empieza a degradarse con bucles de repeticion y divagacion.
- Generacion de texto sobre el modelo base ternario de 27B (heredadas del base, no anadidas por el adaptador).
- Modo thinking del base: presente pero no evaluado sistematicamente con el adaptador (los resultados publicados usan thinking desactivado).
- Reversion completa del efecto mediante `--lora-scaled <file>:0`, sin modificar ni re-cuantizar el archivo base.
- Integracion con llama.cpp (probado con build upstream `b12447`) y `llama-server` con `--jinja`.
- No anade capacidad al modelo: el autor lo indica explicitamente ("a 2-bit 27B is still a 2-bit 27B").

## Casos de uso

- Investigacion sobre mecanismos de rechazo: permite comparar el mismo modelo con y sin la direccion de ablacion activada (escala 0 frente a 1,5) sobre el mismo checkpoint ternario, aislando el efecto de esa unica direccion sin reentrenar.
- Analisis de robustez de alineamiento en modelos cuantizados: util para estudiar si las defensas aprendidas sobreviven a cuantizacion agresiva y a ediciones de bajo rango, con la ventaja de que el adaptador es de 2,9 MB y se distribuye y carga de forma trivial.
- Experimentos de control en evaluaciones de seguridad: el par base/adaptador actua como condicion experimental con una diferencia numerica conocida y localizada en 87 proyecciones concretas.
- Uso local por parte de usuarios que quieran decidir por si mismos que peticiones atiende el modelo, segun la motivacion declarada por el autor, siempre en entornos privados y bajo responsabilidad propia.
- Estudio del transplante de ediciones entre modelos: replicar el metodo (de-cuantizar, restar bf16, SVD, conservar la direccion dominante) sobre otros pares base/abliterado para medir que ediciones sobreviven al redondeo ternario.
- Pruebas de carga y latencia en llama.cpp: medir el sobrecoste real de un LoRA de rango 1 sobre un 27B ternario con `--lora-scaled` frente a la ejecucion sin adaptador.

## Benchmarks y rendimiento

Resultados publicados por el autor, archivo a escala 1,5 frente al base sin modificar, con los mismos prompts y ajustes:

| Metrica | Base | Con adaptador |
|---|---|---|
| Perplejidad WikiText-2 (contexto 2048, 20 chunks) | 7,87 | 8,12 |
| Rechazos clasificados por palabras clave, 100 prompts reservados (`mlabonne/harmful_behaviors`, test, T=0,7, thinking off) | 99 | 6 |
| GSM8K, thinking off, 100 problemas aleatorios del test, greedy | 92 % | 92 % |

Advertencias del autor sobre estas cifras: el clasificador por palabras clave sobreestima el cumplimiento (muchas "no negativas" son respuestas evasivas, enmarcadas como ficcion o educacion, o vagas); una revision manual de 25 generaciones largas con un adaptador ligeramente distinto a escala 1,0 encontro aproximadamente un 40 % claramente en tarea, un 30 % parcial y un 30 % desviado, sin etiquetado manual equivalente a escala 1,5. Todos los resultados son con thinking desactivado. La muestra es pequena (50-100 prompts) y las diferencias de pocos puntos son ruido.

## Requisitos de hardware

- El adaptador en si ocupa 2,9 MB y su coste de computo adicional es muy bajo (rango 1 en 87 proyecciones).
- El requisito real lo marca el modelo base ternario de 27B: el autor lo ejecuta con `-ngl 99` (todas las capas en GPU) sobre `Ternary-Bonsai-2-27B-Q2_0.gguf`.
- No se especifican cifras de VRAM ni GPU concretas en la informacion disponible; a 2 bits, un 27B requiere del orden de decenas de GB, por lo que en la practica necesita GPU de datacenter o varias consumer GPU, pero este dato no esta publicado.
- Despliegue: llama.cpp (`llama-server`) con `--jinja` y `--lora-scaled FILE:SCALE` (un solo argumento con el formato `FILE:SCALE`; dos argumentos separados fallan). Probado con el build upstream `b12447`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento de rechazo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-27B (base) | 27B (ternario) | no disponible | alto (99/100 rechazos en la prueba del autor) | Apache-2.0 | Hugging Face (prism-ml) |
| Este adaptador (base + LoRA a escala 1,5) | 27B + 2,9 MB | no disponible | bajo (6/100 rechazos clasificados) | Apache-2.0 | Hugging Face (gyr0zepp) |
| Qwen3.8-27B-Ultimate-Heretic-Uncensored (DavidAU) | 27B | no disponible | ablacionado con Heretic 2.1 (ARA) | no disponible en la informacion | Hugging Face, formato IQ3_M |
| Qwen3.8-27B (original) | 27B | no disponible | alineado (sin ablacion) | no disponible en la informacion | Hugging Face (Qwen) |

No se dispone de datos de benchmarks cruzados entre estos modelos en la informacion proporcionada; la unica comparacion cuantitativa publicada es la del adaptador frente a su base (seccion anterior).

## Limitaciones y advertencias

- Aviso de contenido del autor: el adaptador hace que el modelo responda a peticiones que el base rechaza, incluido contenido danino. No debe exponerse a publico ni a menores.
- El clasificador de rechazos por palabras clave sobreestima el cumplimiento; parte de las respuestas "no negadas" son evasivas o parciales (en la revision manual a escala 1,0, un 30 % seguia desviado).
- Escala sensible: a 1,0 quedan desviaciones notables; a 2,0 aparecen bucles de repeticion y divagacion. Solo la escala 1,5 esta recomendada y medida.
- El modo thinking no se ha evaluado con el adaptador; se desconoce su comportamiento.
- Muestras pequenas (50-100 prompts) y sin etiquetado manual a escala 1,5: diferencias de pocos puntos son ruido.
- Solo probado sobre el pack `Ternary-Bonsai-2-27B-Q2_0.gguf`; PTQ1_0 y PQ2_0 no fueron probados.
- Un adaptador de fine-tuning supervisado sobre el base en precision completa no transfirio al modelo ternario; el metodo de transplante puede no generalizar a otros tipos de edicion.
- No anade capacidad: el modelo sigue siendo un 27B a 2 bits, con la perdida de calidad asociada.
- Licencia Apache-2.0, pero la responsabilidad legal del uso recae en el usuario segun la legislacion aplicable.
- Idiomas soportados no declarados; no hay garantia de comportamiento multilingue especifico del adaptador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gyr0zepp/Ternary-Bonsai-2-27B-Ablation-LoRA-GGUF
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Abliteracion de origen (DavidAU, Qwen3.8-27B, Heretic 2.1/ARA): https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF
- Dataset de evaluacion de rechazos: `mlabonne/harmful_behaviors` (split test)
- llama.cpp (build probado `b12447`): https://github.com/ggml-org/llama.cpp
- Proyecto Heretic (metodo ARA): no disponible en la informacion proporcionada
