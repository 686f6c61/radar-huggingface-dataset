# jamespetts/yue2-1980s-two-tone-ska-lora

## Resumen

`jamespetts/yue2-1980s-two-tone-ska-lora` es un adaptador LoRA de tipo NAR (acoustic rendering o textura) para el modelo de generacion musical YuE2, concretamente sobre el checkpoint `Comfy-Org/YuE2`, un repack del modelo `m-a-p/YuE2-3B`. Lo desarrolla James E. Petts y su funcion es empujar el renderizador de audio hacia la textura de produccion del ska britanico two-tone de principios de los anos ochenta: guitarra offbeat, organo shuffle, bajo caminante, stabs de seccion de metales, bateria seca y ajustada con rimshot, y voces britanicas con slapback echo.

El adaptador no modifica la composicion ni la melodia ni el plan de arreglo, que corresponden a la rama AR del modelo base; solo altera el timbre y la sensacion de produccion. Se activa con la palabra disparadora `twotone`, que debe colocarse al principio del prompt de estilo. El repositorio incluye dos formatos de pesos: uno en layout "unfused" para el motor audio.cpp y otro fusionado para ComfyUI.

Es relevante por su caracter especializado y su licencia CC0 sobre los pesos del adaptador, aunque hereda la restriccion no comercial del modelo base. El entrenamiento se hizo sobre un corpus propio de 19 tomas sinteticas de ska two-tone generadas con IA, con rango 16 y 2000 pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador NAR de atencion y MLP) sobre el decodificador de YuE2 (modelo base de generacion musical) |
| Parametros totales | no disponible (adaptador LoRA de rango 16; el modelo base es de 3B) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente bf16) |
| Idiomas soportados | no disponible (el ejemplo de uso emplea voces en ingles) |
| Licencia | cc0-1.0 (adaptador); el modelo base YuE2 es CC BY-NC 4.0 |
| Formato de pesos | safetensors (dos variantes: `unfused` para audio.cpp y `comfy-fused` para ComfyUI) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 16 aplicado sobre las capas de atencion y MLP del renderizador NAR del modelo YuE2. Se entreno con ComfyUI-YuE2-Trainer usando el preset `target_preset=nar_attn_mlp`, con clips de 8 segundos, optimizador `adamw_8bit`, scheduler coseno, warmup de 50 pasos, 2000 pasos totales, `caption_dropout` de 0.1, `t_sampling=uniform` y semilla 20261107. El entrenamiento completo tardo 27 minutos y 2 segundos en una RTX 2080 Ti de 11 GB, a 0.77 s por iteracion.

El corpus de entrenamiento consta de 19 tomas (unos 54 minutos) de ska two-tone generado por IA por los propios autores: 6 canciones y 13 tomas alternativas, tras descartar una cancion generada con Suno v6 que no lograba el estilo y un duplicado byte a byte. La leyenda de entrenamiento describe la textura objetivo de forma explicita. La conversion del formato fusionado de ComfyUI al formato unfused del motor audio.cpp se hizo sin perdida, con una verificacion de ida y vuelta byte a byte sobre 392 de 392 tensores. El repositorio incluye el flujo de trabajo exacto de entrenamiento (`yue2-nar-lora-train-ska.json`) para reproducibilidad.

## Capacidades

- Modificacion de textura y timbre de audio generado por YuE2 hacia produccion de ska two-tone de los anos ochenta.
- Control de caracteristicas de produccion: guitarra offbeat, organo shuffle, bajo caminante, stabs de metales, bateria seca con rimshot y slapback echo en voces.
- Activacion mediante palabra disparadora `twotone` al inicio del prompt de estilo.
- Ajuste de intensidad del efecto mediante el parametro `nar_lora_scale` (0 lo desactiva; 1.0 es el valor por defecto).
- Integracion con el motor audio.cpp (parametros `-NarLora` y `-NarScale`) y con ComfyUI (`LoraLoaderModelOnly`).
- No modifica composicion, melodia ni arreglo; esas decisiones dependen de la rama AR del modelo base.
- No se documentan capacidades de tool calling, agentes, vision ni audio de entrada.

## Casos de uso

- Produccion musical asistida por IA con estetica two-tone: generar canciones completas con YuE2 cargando este adaptador NAR para obtener una paleta de produccion coherente con el ska britanico de 1979-1983, usando `twotone` como primer token del prompt de estilo.
- Creacion de maquetas o demos de estilo retro: util para compositores que quieran explorar el sonido de sellos como 2 Tone Records sin disponer de un estudio con equipamiento de la epoca.
- Generacion de bandas sonoras para proyectos audiovisuales ambientados en la Inglaterra de principios de los ochenta, donde la textura de produccion seca y ajustada es un requisito estetico.
- Investigacion sobre adaptadores de textura en modelos de generacion musical: el repositorio documenta el flujo de entrenamiento completo, la configuracion y una evaluacion por escalones de pasos, lo que lo convierte en material de referencia para estudiar LoRAs NAR.
- Experimentacion con el motor audio.cpp: sirve como ejemplo funcional de carga de un LoRA NAR en formato unfused, con tiempos de fusion de aproximadamente 55 segundos al inicio de sesion.
- Pruebas de reproducibilidad en ComfyUI: el peso fusionado permite cargar el adaptador con `LoraLoaderModelOnly` sobre el checkpoint nativo de YuE2 para replicar el entrenamiento o generar variantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card incluye una evaluacion cualitativa y cuantitativa propia:

| Medicion | Resultado |
|---|---|
| Diferencia de energia de senal vs. modelo final (paso 600) | 17.4% (correlacion 0.985) |
| Diferencia de energia de senal vs. modelo final (paso 1200) | 9.4% (correlacion 0.9955) |
| Diferencia de energia de senal vs. modelo final (paso 1800) | 3.0% (correlacion 0.9996) |
| Evaluacion perceptual (4 escalones) | Los cuatro audibly identicos segun un oyente |
| Tiempo de fusion al inicio de sesion (audio.cpp) | ~55 s (196 tensores) |
| Tiempo de entrenamiento | 27:02 en RTX 2080 Ti 11 GB (0.77 s/it) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; el modelo base YuE2-3B requiere el espacio correspondiente a un modelo de 3B parametros (aproximadamente 6 GB en bf16, mas overhead del motor y del adaptador).
- GPU recomendadas: el entrenamiento se realizo en una RTX 2080 Ti de 11 GB, lo que indica que la inferencia con el adaptador cabe en GPUs de consumo de gama alta.
- Cabe en GPU de consumo: si, segun el hardware de entrenamiento documentado (RTX 2080 Ti 11 GB).
- Opciones de despliegue: motor audio.cpp (formato unfused) y ComfyUI (formato comfy-fused). No se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de generacion musical.
- Latencia y throughput: no disponibles; el unico dato temporal es el tiempo de fusion del adaptador (~55 s al inicio de sesion).

## Comparativa con modelos similares

| Modelo | Tipo | Base | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jamespetts/yue2-1980s-two-tone-ska-lora | LoRA NAR | Comfy-Org/YuE2 | Ska two-tone de los 80 | cc0-1.0 (adaptador); base CC BY-NC 4.0 | Hugging Face |
| jamespetts/yue2-1980s-eurodisco-lora | LoRA NAR | Comfy-Org/YuE2 | Eurodisco de los 80 | cc0-1.0 (adaptador) | Hugging Face |
| Comfy-Org/YuE2 (modelo base) | Modelo de generacion musical | m-a-p/YuE2-3B | Generacion musical general | CC BY-NC 4.0 | Hugging Face |

No se dispone de informacion sobre otros adaptadores comparables de la misma categoria en la busqueda realizada.

## Limitaciones y advertencias

- Aviso de "house-flavour": los datos de entrenamiento son sinteticos, generados por IA, lo que puede introducir sesgos estilisticos propios del generador utilizado.
- Los pesos del modelo base YuE2 estan bajo CC BY-NC 4.0 (solo uso no comercial); esa restriccion se hereda aunque el adaptador sea CC0.
- La evaluacion perceptual indica que, a escala 1.0, el efecto del adaptador es de nivel de textura y queda por debajo de la percepcion auditiva frente al renderizado del modelo base de la misma interpretacion; para un caracter mas pronunciado habria que subir `nar_lora_scale` a 1.5-2.0, valores no probados.
- No se ha realizado una comparacion A/B de control con el modelo sin LoRA.
- Cargar los pesos sin la palabra disparadora `twotone` fusiona deltas que ninguna condicion guia, lo que puede producir resultados no deseados.
- El adaptador no puede cambiar composicion, melodia ni arreglo; solo la textura de renderizado.
- El tiempo de fusion de aproximadamente 55 segundos al inicio de sesion en audio.cpp puede interpretarse erroneamente como un cuelgue.
- No se documentan sesgos conocidos, riesgo de alucinacion ni limitaciones de contexto o idioma especificas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jamespetts/yue2-1980s-two-tone-ska-lora
- Perfil del autor: https://huggingface.co/jamespetts
- Adaptador hermano (eurodisco): https://huggingface.co/jamespetts/yue2-1980s-eurodisco-lora
- Modelo base en Hugging Face: https://huggingface.co/Comfy-Org/YuE2
- Modelo original YuE2-3B: https://huggingface.co/m-a-p/YuE2-3B
