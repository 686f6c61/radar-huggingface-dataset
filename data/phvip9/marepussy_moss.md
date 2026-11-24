# phvip9/MarePussy_MOSS

## Resumen

MarePussy_MOSS es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base OpenMOSS-Team/MOSS-Image-Base, un modelo de difusion para generacion de imagenes desarrollado por el equipo OpenMOSS. El adaptador, publicado por el usuario phvip9 en Hugging Face, esta disenado especificamente para generar representaciones realistas de genitales de yeguas en imagenes sinteticas, incluyendo estados anatomicos concretos y variaciones de coloracion controladas mediante tags especiales.

El modelo se distribuye como un repositorio de 0,3 GB con pesos en formato de adaptador LoRA, lo que implica que requiere el modelo base MOSS-Image-Base para funcionar. El autor documenta dos versiones experimentales (0.49 epoch 56 y 0.51 epoch 54) con caracteristicas ligeramente distintas en cuanto a estilizacion y calidad en planos macro. La model card incluye instrucciones detalladas sobre tags recomendados, estados anatomicos, colores de genitales y piel, asi como configuraciones de generacion (scheduler er_sde, sampler sgm_uniform, skip layer 22 o 22,26).

La relevancia de esta ficha es limitada desde el punto de vista tecnico general: se trata de un adaptador de nicho, sin benchmarks publicados, sin licencia declarada y sin metricas de rendimiento. No obstante, se documenta aqui por su interes como ejemplo de fine-tuning LoRA sobre un modelo de difusion open source y por las tecnicas de control condicional mediante tags que emplea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusion MOSS-Image-Base |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusion, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (prompts en ingles segun la model card) |
| Licencia | no disponible |
| Formato de pesos | adaptador LoRA (formato concreto no especificado; repositorio de 0,3 GB) |

## Arquitectura y entrenamiento

El adaptador se basa en la tecnica LoRA aplicada sobre OpenMOSS-Team/MOSS-Image-Base, un modelo de difusion para generacion de imagenes. La model card no proporciona detalles sobre el rango del adaptador, las capas objetivo, la tasa de aprendizaje, el numero de pasos de entrenamiento ni la composicion del dataset. Se mencionan dos versiones experimentales: 0.49 epoch 56 y 0.51 epoch 54, lo que sugiere un entrenamiento de aproximadamente 54-56 epochs, aunque no se especifica el numero total de pasos ni el tamano del dataset.

El autor indica que el LoRA ejerce una fuerte influencia de estilo realista sobre las imagenes generadas, especialmente cuando el contenido se aproxima a los datos de entrenamiento (caballos). Para imagenes mas estilizadas recomienda combinar un LoRA de estilo a peso 1.5-2.0 con este LoRA a peso 0.7-0.9. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal, dado que se trata de un adaptador de difusion y no de un modelo de lenguaje.

## Capacidades

- Generacion de imagenes realistas de genitales de yeguas mediante el modelo base MOSS-Image-Base.
- Control condicional mediante tags especificos: `marepussy`, `anus`, `labia`, `clitoris`, `macro shot`, `close-up`.
- Control de estados anatomicos mediante tags especiales: `<l:pursed>` y `<l:exposed-clit>`.
- Control de coloracion de genitales mediante tags de version: `<v:dark>` (gris oscuro) y `<v:light>` (rosa palido) en la version 0.51; `dark` y `light` en la version 0.49.
- Soporte de lenguaje natural para estados intermedios (por ejemplo, "labia parted with clitoris slightly visible").
- Control de colores y patrones de pelaje mediante prefijos como `bay fur` o `pinto fur`.
- Capacidad de generar composiciones de dos tonos (ano palido, labios oscuros) mediante prompts descriptivos en lenguaje natural.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues en el sentido de modelos de lenguaje.

## Casos de uso

- Generacion de imagenes de referencia anatomica veterinaria: el adaptador permite generar representaciones detalladas de la anatomia genital equina con control de estados y coloraciones, util para material ilustrativo en contextos de formacion veterinaria.
- Investigacion sobre fine-tuning LoRA en modelos de difusion: sirve como caso de estudio de como un adaptador de bajo rango puede especializar un modelo base hacia un dominio visual muy concreto con un dataset reducido.
- Pruebas de control condicional mediante tags: util para estudiar como los tags especiales (`<l:pursed>`, `<v:dark>`) y el lenguaje natural interactuan en la generacion de imagenes de difusion.
- Evaluacion de composicion de LoRAs: el autor documenta la combinacion con LoRAs de estilo a distintos pesos (1.5-2.0 para estilo, 0.7-0.9 para este adaptador), lo que permite experimentar con mezclas de adaptadores.
- Generacion de imagenes macro y close-up: el adaptador esta optimizado para planos macro y close-up, con configuraciones de aspect ratio (9:16 para recorte ajustado) y ajustes de skip layer (22 o 22,26).
- Experimentacion con schedulers y samplers: la configuracion recomendada (er_sde + sgm_uniform) y el ajuste de skip layer permiten estudiar el efecto de estos parametros en la calidad y el realismo de las imagenes generadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; depende del modelo base MOSS-Image-Base, no del adaptador LoRA (0,3 GB adicionales sobre el modelo base).
- GPU recomendadas: no disponibles en la informacion proporcionada; el modelo base MOSS-Image-Base determina los requisitos.
- Compatibilidad con GPU de consumo: no confirmada; depende del modelo base.
- Opciones de despliegue: no especificadas; el adaptador LoRA es compatible con frameworks que soporten LoRA sobre el modelo base (por ejemplo, diffusers), aunque no se documenta explicitamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (LoRAs especializados sobre MOSS-Image-Base para el mismo dominio).

## Limitaciones y advertencias

- Contenido para adultos: el adaptador genera contenido sexual explicito de tematica animal; su uso debe restringirse a contextos legales y eticos, y cumple las politicas de contenido de las plataformas que lo alojan.
- Licencia no declarada: no se especifica la licencia del adaptador ni del modelo base en la informacion disponible, lo que impide determinar las condiciones de uso comercial.
- Limitacion anatomica documentada: en vistas frontales o desde abajo, la vulva aparece invertida (boca abajo) en lugar de en su orientacion correcta.
- Fiabilidad de tags limitada: el autor indica que algunos tags de estado anatomico son "poco fiables" y que el lenguaje natural solo funciona parcialmente para estados intermedios.
- Coloracion limitada: el gris oscuro esta mejor representado en los datos de entrenamiento; el rosa palido "no siempre es alcanzable".
- Dos versiones experimentales sin evaluacion definitiva: el autor no ha determinado cual de las dos versiones (0.49 o 0.51) es mejor.
- Dependencia del modelo base: requiere OpenMOSS-Team/MOSS-Image-Base, cuyas limitaciones y licencia se heredan.
- Sin benchmarks ni metricas objetivas: no hay evaluacion cuantitativa de calidad, sesgos o fidelidad.
- Riesgo de sesgo en el dataset: el entrenamiento se centra en caballos, lo que puede limitar la generalizacion a otras especies o estilos.
- Idiomas: los prompts documentados estan en ingles; no se confirma soporte multilingue.

## Enlaces

- [Hugging Face: phvip9/MarePussy_MOSS](https://huggingface.co/phvip9/MarePussy_MOSS)
- [Modelo base: OpenMOSS-Team/MOSS-Image-Base](https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base)
