# jamespetts/yue2-1980s-italo-disco-lora

## Resumen

`jamespetts/yue2-1980s-italo-disco-lora` es un adaptador LoRA de tipo NAR (non-autoregressive) para el motor de generación musical YuE2, en su variante `audio.cpp`. Lo desarrolla James E. Petts y se publica bajo licencia CC0. No es un modelo de lenguaje: es un ajuste fino ligero sobre el modelo base `yue2_3b_bf16` (3.000 millones de parámetros) que modifica la textura y el timbre de la música generada, es decir, el carácter de producción sonora, sin alterar notas, armonía ni arreglo.

El adaptador está entrenado con 12 pistas propias generadas con IA (59,3 minutos, 445 clips de 8 segundos) con estética italo-disco de los años 80: caja con gate, bombo four-on-the-floor, bajo sintetizado secuenciado en primer plano, pads con chorus y ganchos en modo menor. Su relevancia es acotada pero específica: permite a usuarios de YuE2 obtener un timbre concreto de italo-disco sin reentrenar el modelo base, con un fichero de 66,5 MB (sin fusionar) o 101,5 MB (fusionado con EMA).

El modelo se publicó el 1 de noviembre de 2026 y no registra descargas ni valoraciones en Hugging Face. La model card es inusualmente honesta sobre sus límites: el autor advierte de que el adaptador codifica su propio sonido (balance con graves adelantados y agudos suaves) y no el balance canónico seco y brillante de 1983, y de que los recursos armónicos del corpus no están en el adaptador porque pertenecen a la capa de composición.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre el adaptador NAR de YuE2; rango 16, alpha 16 |
| Parámetros totales | no disponible (adaptador de 66,5 MB sin fusionar / 101,5 MB fusionado) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; el base se distribuye en bf16) |
| Idiomas soportados | no disponible (generación musical; la letra depende del prompt de estilo) |
| Licencia | CC0 1.0 |
| Formato de pesos | safetensors (dos variantes: ComfyUI fusionada con EMA y audio.cpp sin fusionar) |

## Arquitectura y entrenamiento

El adaptador se inyecta en la rama NAR (no autorregresiva) del motor YuE2, que se encarga de la textura y el timbre, mientras que la rama AR gestiona notas, armonía y estructura. La configuración de entrenamiento es: rango 16, alpha 16, optimizador `adamw_8bit`, scheduler coseno, 50 pasos de warmup, 2.000 pasos totales, `caption_dropout` de 0,1 y muestreo temporal uniforme, con semilla 20261101. Se entrenó sobre `yue2_3b_bf16` con ComfyUI-YuE2-Trainer en una RTX 2080 Ti de 11 GB, en 25 minutos de tiempo de pared, con PyTorch 2.14.1+cu130. La pérdida bajó de ~1,10 a ~1,00 de forma estable hasta el paso 2.000.

El corpus son 12 pistas (8 tomas vocales de Suno v5 y 4 alternativas con arreglos genuinamente distintos, no repeticiones) troceadas en 445 clips de 8 segundos. No hay grabaciones de terceros en los pesos. La conversión entre el formato fusionado de ComfyUI y el formato del motor `audio.cpp` (`layers.N.nar_*`, `lora_A`/`lora_B`) se verificó byte a byte con 392 tensores y comprobación de ida y vuelta superada.

## Capacidades

- Modificación de textura y timbre en la generación musical de YuE2: carácter de producción, no notas ni arreglo.
- Activación mediante palabra disparadora `italodisco`, que debe colocarse al principio del prompt de estilo.
- Escala de aplicación recomendada de 1,0 (valor auditionado por el autor).
- Perfil sonoro aprendido: italo-disco de los 80, bombo four-on-the-floor con caja con gate, bajo secuenciado profundo y pulsante dominando una mezcla con graves adelantados, pads cálidos con chorus, ganchos en modo menor, melodrama romántico oscuro y agudos suaves.
- Compatibilidad con la familia de motores YuE2 (`audio.cpp`) y con el flujo de entrenamiento de ComfyUI-YuE2-Trainer.
- No soporta tool calling, agentes, visión, audio de entrada ni razonamiento multi-paso: es un adaptador de audio generativo, no un modelo conversacional.
- Capacidades multilingües: no disponibles; la lengua de la letra se controla desde el prompt de estilo, no desde el adaptador.

## Casos de uso

- Producción de italo-disco con timbre concreto: aplicar el LoRA con escala 1,0 y la palabra `italodisco` al inicio del prompt de estilo para obtener el carácter de producción del corpus del autor (graves adelantados, agudos suaves) en lugar del balance seco y brillante canónico.
- Iteración rápida de demos musicales: al ser un adaptador de 66,5 MB sobre un base de 3B, permite probar variantes de timbre sin reentrenar ni recargar el modelo completo, con tiempos de entrenamiento de referencia de 25 minutos en una RTX 2080 Ti.
- Integración en flujos ComfyUI: el fichero fusionado con EMA se carga directamente en ComfyUI-YuE2-Trainer y el `training-workflow.json` incluido documenta el grafo exacto de entrenamiento (recordando eliminar la clave `_comment` antes de enviarlo a `/prompt`, porque ComfyUI 0.42.0 la rechaza).
- Despliegue en el motor `audio.cpp`: el fichero sin fusionar usa la nomenclatura nativa del motor (`layers.N.nar_*`), lo que permite servirlo en pipelines de generación musical basados en C++ sin conversión adicional.
- Corrección de balance tonal en postproducción: si se busca el balance canónico de 1983, el autor documenta la corrección medida de una estantería de −3,5 dB por debajo de 250 Hz más un realce de presencia, aplicable en masterización tras generar con el LoRA.
- Investigación sobre adaptadores NAR: sirve como caso reproducible de ajuste fino de textura sobre un modelo de audio de 3B, con configuración, semilla, corpus y curva de pérdida publicados.
- Combinación con adaptadores AR: el LoRA no toca la armonía, de modo que los recursos armónicos del corpus (bucles modales de estrofa, uso de menor armónica con V dominante, outers que sostienen el dominante, afilado v→V) deben llegar mediante el prompt de estilo o un adaptador AR separado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única evaluación es una audition cualitativa del autor sobre la pista "Let me bring you back" (Romantic Italo, 2026-11-01), con plan de mejor-de-10 capas y renders finalistas, cuyo veredicto fue que el LoRA "funciona para conseguir los sonidos correctos" y que el carácter de producción romántico-oscuro del corpus se transmitió.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; el adaptador añade 66,5 MB (sin fusionar) o 101,5 MB (fusionado) sobre el modelo base `yue2_3b_bf16`.
- GPU de entrenamiento documentada: RTX 2080 Ti de 11 GB, con 25 minutos de tiempo de pared para 2.000 pasos.
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño del adaptador, cualquier GPU capaz de ejecutar el base de 3B debería poder aplicarlo.
- ¿Cabe en GPU de consumo? El adaptador en sí ocupa menos de 0,2 GB; el requisito real lo marca el modelo base de 3B, no el LoRA.
- Opciones de despliegue: ComfyUI-YuE2-Trainer (formato PEFT fusionado) y el motor `audio.cpp` (formato sin fusionar con nomenclatura `layers.N.nar_*`). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de adaptador de audio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `jamespetts/yue2-1980s-italo-disco-lora` | LoRA NAR de textura | `yue2_3b_bf16` | adaptador de 66,5 MB | no disponible | CC0 1.0 | Hugging Face, 0 descargas |
| `jamespetts/yue2-1980s-eurodisco-lora` | LoRA NAR (presumiblemente) | YuE2 | no disponible | no disponible | no disponible | Hugging Face, publicado 2 días después según la actividad del autor |
| Modelo base `yue2_3b_bf16` | Modelo de generación musical | — | 3B | no disponible | no disponible | Referenciado como base |

No se dispone de datos de rendimiento comparables entre estas variantes; la única diferencia documentada es la estética objetivo (italo-disco frente a eurodisco).

## Limitaciones y advertencias

- No es un modelo de propósito general: solo modifica la textura de la rama NAR de YuE2 y no puede cambiar notas, armonía ni arreglo.
- El autor reconoce que el adaptador codifica su propio balance tonal (graves adelantados, agudos suaves) y no el balance canónico seco y brillante de la práctica italo de 1983; para acercarse a este último hay que prompting específico o masterización correctiva (−3,5 dB por debajo de 250 Hz más realce de presencia).
- Los recursos armónicos del corpus (bucles modales, menor armónica con V dominante, outers que sostienen el dominante, afilado v→V) no están en el adaptador porque pertenecen a la capa de composición; hay que aportarlos vía prompt de estilo o un adaptador AR.
- Corpus de entrenamiento pequeño y sintético: 12 pistas y 59,3 minutos generados con IA, con riesgo de sobreajuste al estilo concreto del autor y de escasa diversidad tímbrica.
- Licencia CC0 1.0: permite uso comercial sin restricciones de atribución, pero conviene verificar la licencia del modelo base `yue2_3b_bf16` y del motor `audio.cpp`, que no se detalla en la información disponible.
- Trazabilidad limitada: 0 descargas y 0 valoraciones en Hugging Face, sin evaluación independiente más allá de la audition del propio autor.
- Caveat operativo documentado: el `training-workflow.json` incluye una clave `_comment` que ComfyUI 0.42.0 rechaza al enviar a `/prompt`; debe eliminarse antes.
- Idiomas soportados y comportamiento multilingüe no documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jamespetts/yue2-1980s-italo-disco-lora
- Perfil del autor: https://huggingface.co/jamespetts
- Adaptador hermano de eurodisco: https://huggingface.co/jamespetts/yue2-1980s-eurodisco-lora
