# huangwenjun1994/Siphon-LongCat-LoRA

## Resumen

Siphon-LongCat-LoRA es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario huangwenjun1994 sobre el modelo base `meituan-longcat/LongCat-Image-Edit`, un editor de imagenes de tipo image-to-image desarrollado por Meituan. El adaptador anade capacidades de edicion por instruccion visual: marcas sobre la imagen (texto, flechas y cajas) actuan como la senal especifica de la edicion, mientras que el canal de texto emplea una plantilla de tarea generica. Es, por tanto, un complemento y no un editor autonomo: requiere descargar el modelo base por separado.

El adaptador corresponde al checkpoint 10000 del entrenamiento descrito como `stage2-final-0225`, y es el que se utiliza para los ocho ejemplos grabados en el repositorio de codigo `WenjunHuang94/Siphon`. Esta vinculado al articulo *Internalize External Competence for Visual Instruction Editing* (Siphon authors, NeurIPS 2026). Su relevancia actual reside en que demuestra una via de edicion visual controlada mediante anotaciones sobre la imagen, una alternativa a la edicion puramente textual.

Tecnicamente es un LoRA de rango 64 con alpha 8 aplicado a las capas de atencion y proyeccion feed-forward del backbone Diffusers. El repositorio ocupa aproximadamente 0,2 GB y el unico fichero de tensores pesa 188.794.136 bytes (unos 180 MiB). La licencia declarada de los pesos es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre backbone Diffusers `meituan-longcat/LongCat-Image-Edit`; rango 64, alpha 8, aplicado a capas de atencion y proyeccion feed-forward |
| Parametros totales | no disponible (el adaptador ocupa unos 180 MiB en bf16; el modelo base no se incluye) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la referencia de inferencia usa bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos del adaptador) |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base en formato Diffusers |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 y alpha 8 insertado en las capas de atencion y de proyeccion feed-forward del modelo base LongCat-Image-Edit, que se carga a traves de Diffusers y PEFT. No se incluyen estados del modelo completo ni del optimizador; solo los tensores del adaptador, con SHA256 `0ed9694868d2552d243140caf242ef38e0d69f6673a3eec36e4ddc53ed459535`. La revision del modelo base fijada es `7b54ef423aa7854be7861600024be5c56ab7875a`.

El entrenamiento se describe en dos etapas historicas. La etapa 1 utilizo 4000 pares de texto renderizado a resolucion 512 con tasa de aprendizaje 2e-4, seleccionandose el paso 2400. La etapa 2 empleo 20000 pares mixtos con tasa de aprendizaje 1e-4, acumulando pasos desde 2400 hasta 10000. El autor advierte explicitamente que el entrenador con cache de datos incluido en el repositorio es una implementacion de referencia y no reproduce necesariamente la receta completa a escala del articulo ni todos sus resultados. La innovacion principal es el uso de marcas visuales (texto, flechas, cajas) como canal de instruccion especifica, complementado con una plantilla de texto generica.

## Capacidades

- Edicion de imagen por instruccion visual: acepta marcas anotadas sobre la imagen (texto, flechas, cajas) que definen la edicion concreta a aplicar.
- Edicion image-to-image sobre el modelo base LongCat-Image-Edit mediante pipeline Diffusers.
- Eliminacion de marcadores anotados (por ejemplo, borrado de elementos senalados), aunque el exito en la eliminacion no implica una edicion semantica correcta.
- Generacion de texto renderizado dentro de la imagen, con limitaciones reconocidas en la fidelidad exacta de las letras.
- Integracion con PEFT y Diffusers mediante un flujo de carga explicito (no se soporta un cargador generico `AutoPEFT` de Transformers).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision general, audio ni modo de pensamiento.

## Casos de uso

- Edicion controlada por anotaciones en flujos de diseno: el usuario marca con una caja o flecha el objeto a modificar y el adaptador aplica la edicion sobre esa region, lo que resulta util cuando la instruccion textual sola es ambigua.
- Prototipado de herramientas de retoque asistido: integrable en una interfaz donde el usuario dibuja sobre la imagen y el sistema genera la edicion, usando el flujo `siphon.inference` con los parametros de referencia (50 pasos, guidance 4.5, semilla 43, bf16).
- Investigacion en edicion visual por instruccion: sirve como punto de partida reproducible para experimentar con el paradigma de marcas visuales descrito en el articulo de NeurIPS 2026.
- Eliminacion de elementos marcados en imagenes: adecuado para tareas de limpieza donde se senala el objeto a retirar, con la cautela de que la preservacion pixel-exacta no esta garantizada.
- Evaluacion comparativa de adaptadores LoRA sobre LongCat-Image-Edit: util para medir el efecto de un adaptador de rango 64 frente al modelo base en tareas de edicion localizada.
- Demostraciones y galerias tecnicas: los ocho ejemplos del repositorio (por ejemplo, `box_double_bass`) sirven como referencia de configuracion y de resultados esperados para validar un despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la galeria de ejemplos es una seleccion y no una estimacion de tasa de exito.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el adaptador pesa unos 180 MiB en bf16 y el consumo dominante corresponde al modelo base LongCat-Image-Edit, cuyo tamano no se detalla en la informacion proporcionada.
- La configuracion de referencia emplea `model CPU offload` y bf16, lo que reduce el pico de VRAM a costa de velocidad.
- GPU recomendadas: no disponibles en la informacion; el uso de CPU offload sugiere que el modelo base completo no cabe comodamente en GPUs de consumo sin esa tecnica.
- Despliegue: flujo Diffusers + PEFT mediante `python -m siphon.inference`; no se soporta un cargador generico de Transformers para este backbone.
- Latencia y throughput: no disponibles; la referencia usa 50 pasos de muestreo con guidance scale 4.5.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Siphon-LongCat-LoRA | LoRA sobre editor image-to-image | ~180 MiB (adaptador) | no disponible | Apache-2.0 | Requiere base LongCat-Image-Edit; edicion por marcas visuales |
| LongCat-Image-Edit (base) | Editor image-to-image | no disponible | no disponible | no disponible | Modelo base de Meituan sin el adaptador |
| Alternativas de edicion por instruccion | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- No es un editor autonomo: requiere descargar y cargar el modelo base `meituan-longcat/LongCat-Image-Edit` por separado.
- La galeria de ejemplos esta seleccionada y no representa una tasa de exito; el autor documenta fallos previos, como flechas que no lograron reemplazar una pelota de baloncesto o un mando a distancia.
- En el ejemplo de la flor seleccionada, otras flores tambien cambian de color, lo que indica falta de localidad en la edicion.
- Rostros, manos, texturas y detalles de fondo pueden ser redibujados de forma no deseada.
- La generacion de texto renderizado no satisface de forma consistente el lettering exacto ni todos los detalles solicitados.
- El exito al eliminar un marcador no implica una edicion semantica correcta ni preservacion pixel-exacta.
- Riesgo de sesgos: no documentado en la informacion disponible.
- Restricciones de licencia: los pesos del adaptador son Apache-2.0, pero el modelo base y las imagenes de origen conservan sus propios terminos; la licencia Apache-2.0 del codigo fuente no selecciona por si misma una licencia para los pesos del adaptador.
- El entrenador incluido es una implementacion de referencia y no garantiza reproducir la receta ni los resultados del articulo.
- No se documentan idiomas soportados, por lo que el comportamiento multilingue es desconocido.

## Enlaces

- Hugging Face: https://huggingface.co/huangwenjun1994/Siphon-LongCat-LoRA
- Modelo base: https://huggingface.co/meituan-longcat/LongCat-Image-Edit
- Repositorio de codigo: https://github.com/WenjunHuang94/Siphon
- Articulo: *Internalize External Competence for Visual Instruction Editing*, Siphon authors, NeurIPS 2026 (referencia en el repositorio de codigo; enlace directo no disponible)
