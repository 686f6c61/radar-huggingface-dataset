# LALABAB/VLA-Bind-adapters

## Resumen

VLA-Bind-adapters es una colección de adaptadores LoRA y pesos entrenados para el artículo *Lost Among Look-Alikes: A Benchmark for Attribute Binding in Vision-Language-Action Policies* (en revisión en el momento de la publicación). El repositorio lo mantiene el autor LALABAB y no contiene un modelo base propio: son políticas entrenadas sobre dos familias de modelos visión-lenguaje-acción (VLA), OpenVLA-7B y pi0.5, para estudiar el problema del *attribute binding*, es decir, la capacidad de una política robótica de asociar correctamente un atributo (color, forma, palabra) al objeto concreto al que se refiere una instrucción cuando hay objetos parecidos en la escena.

El material liberado incluye trece checkpoints de adaptadores OpenVLA-7B (LoRA) y dos de pi0.5, organizados en filas experimentales que aíslan distintas hipótesis: datos adicionales (B1-720 frente a B1), aumentación contrafactual dirigida (RECON-AUG-T), control fotométrico (AUG-CTRL), reescritura de instrucciones (LANG) y una cabeza auxiliar de puntero (PTR). Cada carpeta incluye todos los pasos de entrenamiento guardados, pero no los estados del optimizador.

Es relevante ahora porque expone de forma reproducible una debilidad concreta de las políticas VLA actuales (la confusión entre objetos visualmente similares) y publica tanto el benchmark como los pesos que permiten reproducir y comparar las recetas de mitigación. No es un modelo de propósito general: es material de investigación para evaluación y ajuste fino en robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre OpenVLA-7B (transformer VLA) y pesos completos sobre pi0.5 |
| Parametros totales | 7B en la familia OpenVLA; no disponible para pi0.5 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los adaptadores se publican en el formato nativo de PEFT) |
| Idiomas soportados | no disponible (las instrucciones del dataset están en inglés, según la model card) |
| Licencia | other: Llama 2 Community Licence para las filas OpenVLA y Gemma terms of use para las filas pi0.5 |
| Formato de pesos | adaptadores PEFT/LoRA (con `adapter_config.json`), `pointer_head.pt` para la fila PTR y pesos fusionados (`merged_step020000`) para pi0.5 |

## Arquitectura y entrenamiento

Las filas OpenVLA son adaptadores LoRA aplicados sobre `openvla/openvla-7b`, un transformer VLA de 7B parámetros que combina un codificador visual con un modelo de lenguaje para emitir acciones discretizadas. Las filas pi0.5 usan los pesos del modelo pi0.5 y publican pesos fusionados en `merged_step020000`. No se detalla en la información disponible la arquitectura interna de pi0.5 ni el número de parámetros.

El entrenamiento se realizó sobre Train-Bind, un conjunto de 4.860 demostraciones. La receta B1 entrena 20.000 pasos sobre todos los datos; B1-720 aplica la misma receta a un subconjunto de 720 demostraciones, lo que permite medir el efecto del volumen de datos. RECON-AUG-T añade a Train-Bind una copia contrafactual dirigida de cada demostración (mismo estado inicial y misma trayectoria del brazo, con apariencia y palabras modificadas para cubrir un fallo concreto de B1), alcanzando 9.720 demostraciones. AUG-CTRL es el control de esta receta: añade una copia fotométrica (brillo, contraste, recorte, sin cambio de tono) para igualar el número de fotogramas sin introducir contrafactuales. B1C continúa B1 de 20.000 a 25.000 pasos con los mismos datos y sirve de control para LANG y PTR; LANG continúa con instrucciones reescritas y PTR con una cabeza auxiliar de puntero que marca el objeto nombrado. Se publican dos semillas (`_s1`, `_s2`) para la mayoría de filas y `_s8` para B1-720. No se especifica en la información disponible el uso de RLHF o DPO, el número total de tokens ni la composición detallada del dataset más allá de lo descrito.

## Capacidades

- Control robótico por instrucción en lenguaje natural: genera acciones a partir de observaciones visuales e instrucciones de texto, en el marco de OpenVLA y pi0.5.
- Asociación de atributos (*attribute binding*): objeto central del benchmark; las recetas RECON-AUG-T y PTR están diseñadas específicamente para mejorar la vinculación entre atributo y objeto.
- Aumentación contrafactual: la receta RECON-AUG-T entrena con pares de demostraciones que comparten estado inicial y movimiento pero difieren en apariencia y palabras.
- Cabeza auxiliar de puntero: la fila PTR incorpora una cabeza que marca el objeto nombrado en la escena.
- Adaptación eficiente mediante LoRA: los adaptadores OpenVLA se cargan con PEFT sobre el modelo base sin reentrenar los 7B parámetros.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Evaluación de robustez de políticas VLA: usar el benchmark y los checkpoints para medir cuánto falla una política cuando hay objetos parecidos en escena, comparando B1 con B1-720 y RECON-AUG-T.
- Reproducción de experimentos del artículo: cargar cada fila con su semilla y ejecutar las escenas de evaluación descritas en la dataset card para verificar los resultados publicados.
- Ajuste fino de políticas OpenVLA en laboratorio: partir de los adaptadores B1 o B1C y continuar el entrenamiento con datos propios de una tarea de manipulación con objetos similares.
- Investigación en aumentación de datos: usar RECON-AUG-T y AUG-CTRL como par controlado para estudiar si la mejora proviene del contrafactual o del simple aumento del número de fotogramas.
- Estudio de instrucciones en políticas VLA: comparar B1C con LANG para cuantificar el efecto de reescribir las instrucciones de entrenamiento sin cambiar los datos visuales.
- Desarrollo de mecanismos de atención a objetos: emplear la fila PTR y su `pointer_head.pt` como referencia para añadir supervisión de puntero en otras políticas VLA.
- Transferencia a pi0.5: reutilizar las recetas B1 y RECON-AUG-T sobre pi0.5 para comprobar si las conclusiones sobre attribute binding se mantienen entre familias de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia de orden de magnitud, un modelo de 7B en precisión completa requiere del orden de 14 GB solo para los pesos, más el codificador visual y el estado de inferencia; los adaptadores LoRA añaden una sobrecarga pequeña sobre el modelo base.
- GPU recomendadas: no disponible. Para OpenVLA-7B en precisión completa se necesitan GPU de centro de datos (A100, H100) o consumer de gama alta con suficiente VRAM; no se confirma en la información disponible.
- Compatibilidad con GPU consumer: no confirmada; depende de la cuantización aplicada al modelo base, que no se documenta en este repositorio.
- Opciones de despliegue: carga del modelo base `openvla/openvla-7b` seguida del adaptador con PEFT, según indica la model card. Para pi0.5, uso de los pesos fusionados en `merged_step020000`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VLA-Bind-adapters (OpenVLA-7B LoRA) | 7B (base) | no disponible | Adaptadores para benchmark de attribute binding | Llama 2 Community Licence | Hugging Face, 0 descargas |
| OpenVLA-7B (base) | 7B | no disponible | Política VLA de propósito general | no disponible en esta ficha | Hugging Face (`openvla/openvla-7b`) |
| pi0.5 (base) | no disponible | no disponible | Política VLA | Gemma terms of use | Pesos referenciados en este repositorio |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de propósito general: son adaptadores de investigación para un benchmark concreto de attribute binding en robótica.
- El artículo está en revisión; no hay citation definitiva ni resultados revisados por pares en el momento de la publicación.
- Solo se publican los pasos de entrenamiento guardados; no se incluyen los estados del optimizador para reanudar el entrenamiento.
- La licencia es compuesta: Llama 2 Community Licence para las filas OpenVLA y Gemma terms of use para pi0.5. Cualquier uso comercial debe revisar ambas licencias y `LICENSE_NOTE.md`; la licencia Llama 2 impone restricciones adicionales (por ejemplo, umbral de usuarios activos mensuales y cláusulas de uso aceptable).
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones idiomáticas más allá de que las instrucciones del dataset están en inglés.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso comunitario ni validación externa.
- No se especifican requisitos de hardware, latencia ni protocolos de seguridad para despliegue en robots reales; el uso en producción exigiría evaluación propia.
- Los adaptadores dependen del modelo base exacto indicado en `adapter_config.json`; usar otra revisión del base puede romper la compatibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LALABAB/VLA-Bind-adapters
- Dataset y benchmark: https://huggingface.co/datasets/LALABAB/VLA-Bind
- Nota de licencia: https://huggingface.co/LALABAB/VLA-Bind-adapters/blob/main/LICENSE_NOTE.md
- Modelo base OpenVLA-7B: https://huggingface.co/openvla/openvla-7b
