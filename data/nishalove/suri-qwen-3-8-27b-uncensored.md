# Nishalove/Suri-Qwen-3.8-27B-Uncensored

## Resumen

Suri Qwen 3.8 27B Uncensored es un ajuste fino (finetune) del modelo Qwen/Qwen3.8-27B publicado por el usuario Nishalove, que se presenta bajo el nombre comercial "Suri ⬡ Qwen" y el lema "Uncensor Is All You Need". Su objetivo declarado es eliminar el alineamiento de seguridad y las negativas del modelo base, de forma que responda a practicamente cualquier peticion sin advertencias ni moralizacion. El autor indica que parte del alineamiento permanece residual y puede corregirse mediante un system prompt especifico.

El modelo tiene 27.781.427.952 parametros (27,78 mil millones, dato extraido de los pesos en safetensors) y un repositorio de 55,6 GB, lo que corresponde a pesos en precision completa o media precision. La model card no detalla la arquitectura interna, el contexto maximo ni el proceso de entrenamiento; las etiquetas del repositorio apuntan a la familia Qwen3.5/Qwen3.8 y a un pipeline image-text-to-text, aunque no se documenta ninguna capacidad de vision en el texto de la ficha.

Su relevancia es de nicho: la comunidad de investigacion en alineacion, red teaming y seguridad de modelos utiliza este tipo de variantes "abliterated" o "uncensored" para estudiar la robustez de los guardarrailes, medir tasas de exito de ataques (ASR) y generar datos adversarios. No es un modelo orientado a producto ni a despliegue comercial convencional, y su licencia no esta declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la especifica; etiqueta qwen3_5, pipeline image-text-to-text, derivado de Qwen/Qwen3.8-27B) |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos en safetensors; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | zh (chino), en (ingles) |
| Licencia | no disponible (el campo de licencia no esta especificado en el repositorio) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La model card no aporta informacion tecnica sobre la arquitectura: no se indica si es un transformer denso, un MoE, un modelo hibrido ni el mecanismo de atencion empleado. El campo pipeline_tag es image-text-to-text y la etiqueta de familia es qwen3_5, con base_model declarado como Qwen/Qwen3.8-27B y unsloth/Qwen3.8-27B (este ultimo, un fork orientado a entrenamiento eficiente). El tamano de 27,78 B de parametros y un repositorio de 55,6 GB son compatibles con pesos en bf16/fp16, pero no hay confirmacion explicita.

Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o abliteration (ablacion de direcciones de rechazo en el espacio de activaciones). La unica evidencia empirica del proceso es la tabla de tasas de exito de ataque (ASR) incluida por el autor, que muestra un incremento muy elevado de respuestas a peticiones daninas respecto al modelo base, un patron caracteristico de las tecnicas de ablacion de rechazo. El autor menciona dos modos de salida (razonamiento y no razonamiento) mediante enlaces a PDF de ejemplos, lo que sugiere un modo de pensamiento, pero sin detalle tecnico.

## Capacidades

- Generacion de texto conversacional en chino e ingles, en formato multi-turno.
- Modo de razonamiento y modo directo: la model card incluye ejemplos de "modo de razonamiento" y "modo no razonamiento", lo que indica soporte de thinking mode.
- Respuesta sin filtros: el ajuste elimina las negativas del modelo base; el autor recomienda anadir un system prompt para suprimir cualquier resto de advertencias o moralizacion.
- Pipeline declarado image-text-to-text: las etiquetas indican entrada de imagen y texto, aunque la model card no documenta ni demuestra capacidades de vision.
- Idiomas limitados a chino e ingles; no se declara soporte multilingue adicional.
- Compatibilidad declarada con text-generation-inference y transformers; la etiqueta endpoints_compatible sugiere compatibilidad con endpoints gestionados.
- No se documenta soporte de tool calling, function calling ni uso agentico multi-paso.

## Casos de uso

- Red teaming y evaluacion de seguridad: el modelo sirve como generador de peticiones y respuestas adversarias para medir la robustez de clasificadores de contenido y guardarrailes propios, aprovechando su ASR declarado del 94,04 % en AdvBench.
- Generacion de datos sinteticos para clasificadores de dano: se puede usar para producir ejemplos etiquetados de contenido danino en las ocho categorias evaluadas (ciberdelincuencia, quimica y biologia, actividades ilegales, desinformacion, acoso, etc.) y entrenar o validar detectores.
- Investigacion en alineacion y ablacion de rechazo: comparar las respuestas de este modelo con las de Qwen/Qwen3.8-27B permite estudiar que comportamientos se pierden y cuales se conservan tras eliminar el alineamiento.
- Auditoria de sistemas en produccion: introducir este modelo en un banco de pruebas interno para comprobar si los filtros de salida de una aplicacion bloquean correctamente el contenido no permitido.
- Escritura creativa sin restricciones: ficcion adulta, thriller, terror o narrativa con violencia explicita sin las negativas habituales de los modelos alineados, en chino o en ingles.
- Asistente conversacional interno para investigacion: conversaciones multi-turno en zh/en sobre temas sensibles (seguridad ofensiva teorica, farmacologia, etc.) en un entorno controlado y aislado de usuarios finales.
- Traduccion zh-en de registros coloquiales o marginales: al no aplicar filtros, mantiene terminos y matices que los modelos alineados suelen suavizar o reescribir.

## Benchmarks y rendimiento

Los unicos datos publicados son tasas de exito de ataque (ASR, Attack Success Rate) en benchmarks de seguridad, aportados por el autor. Un valor mas alto indica mas respuestas a peticiones daninas, es decir, menos alineamiento, no mejor capacidad general. No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

| Modelo | AdvBench ASR (520) | HarmBench ASR (300) | Cybercrime & Intrusion (67) | Chemical & Biological (56) | Illegal Activities (65) | Misinformation & Disinformation (65) | Harassment & Bullying (25) | Harmful Content (22) |
|---|---|---|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (base) | 0,38 % | 6,00 % | 8,96 % | 1,79 % | 1,54 % | 15,38 % | 0,00 % | 0,00 % |
| Suri-Qwen-3.8-27B-Uncensored (SpaceTimee/Suri-Qwen-3.8-27B-Uncensored) | 94,04 % | 81,33 % | 83,58 % | 92,86 % | 72,31 % | 86,15 % | 64,00 % | 77,27 % |
| 0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored | 88,65 % | 76,67 % | 68,66 % | 85,71 % | 66,15 % | 90,77 % | 68,00 % | 77,27 % |

Nota: la tabla de la model card atribuye la fila del medio a "SpaceTimee/Suri-Qwen-3.8-27B-Uncensored", mientras que el repositorio consultado es "Nishalove/Suri-Qwen-3.8-27B-Uncensored". Los valores se reproducen tal cual, sin verificacion independiente.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 56 GB solo para pesos, mas activaciones y cache KV; se requieren 80 GB o reparto en varias GPU.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 28-30 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 14-16 GB de pesos, mas overhead de contexto.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para precision completa; 2x RTX 4090 / A6000 48 GB para bf16 con tensor parallelism; una unica RTX 4090 (24 GB) o RTX 3090 (24 GB) solo con cuantizacion de 4 bits, no publicada oficialmente.
- No se han publicado pesos GGUF, por lo que no hay una ruta directa a llama.cpp u Ollama sin convertir y cuantizar los pesos manualmente.
- Opciones de despliegue declaradas: transformers y text-generation-inference (TGI); vLLM es viable tecnicamente al ser pesos safetensors, pero no esta declarado por el autor.
- Latencia y throughput: no disponible.
- Parametros de muestreo recomendados por el autor: temperature 0,7-1,0; top_p 0,8-0,95; repetition_penalty 1-1,1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | ASR AdvBench declarado | Disponibilidad |
|---|---|---|---|---|---|---|
| Nishalove/Suri-Qwen-3.8-27B-Uncensored | 27,78 B | no disponible | zh, en | no disponible | 94,04 % | safetensors, 16 descargas, 0 likes |
| Qwen/Qwen3.8-27B (modelo base) | no disponible en esta ficha | no disponible | no disponible | no disponible | 0,38 % | repositorio oficial del modelo base |
| 0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored | no disponible en esta ficha | no disponible | no disponible | no disponible | 88,65 % | variante alternativa sin alineamiento |
| SpaceTimee/Suri-Qwen-3.8-27B-Uncensored | no disponible en esta ficha | no disponible | no disponible | no disponible | identico segun la tabla del autor | posible espejo o publicacion previa del mismo ajuste |

La comparativa con modelos de otros tamanos o familias (por ejemplo, variantes sin censura de Llama o Mistral) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo deliberadamente desalineado: el 94,04 % de ASR en AdvBench y el 81,33 % en HarmBench implican que genera contenido danino con altisima frecuencia. Su uso fuera de entornos de investigacion controlados es peligroso.
- Alucinacion: al haberse eliminado el alineamiento, tambien se reduce la tendencia a admitir incertidumbre; no hay evaluacion de factualidad publicada.
- Licencia no declarada: sin licencia explicita no hay permiso claro de uso comercial y persisten las condiciones del modelo base Qwen, que el usuario debe verificar por separado.
- Idiomas limitados a chino e ingles; no hay soporte declarado de castellano ni de otras lenguas.
- Contexto maximo desconocido: no se puede planificar un caso de uso que dependa de ventanas largas sin verificacion previa.
- Capacidad multimodal incierta: el pipeline declarado es image-text-to-text, pero la model card no documenta ni demuestra vision; conviene validarlo antes de asumirlo.
- Restos de alineamiento: el propio autor reconoce que el modelo conserva preferencias alineadas que solo se suprimen con un system prompt concreto, lo que introduce variabilidad segun el cliente.
- Reproducibilidad: 16 descargas y 0 likes, sin paper, sin dataset ni detalles de entrenamiento; no es posible auditar como se obtuvo el ajuste.
- Riesgo legal y reputacional: el contenido generado puede infringir normativas de seguridad, difamacion o proteccion de menores segun la jurisdiccion.
- Requisitos de hardware altos para un modelo de 27,78 B: sin cuantizaciones publicadas, el despliegue en consumer GPU exige trabajo adicional de conversion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nishalove/Suri-Qwen-3.8-27B-Uncensored
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo base alternativo declarado: https://huggingface.co/unsloth/Qwen3.8-27B
- Variante comparable citada por el autor: https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored
- Ejemplo de salida en modo razonamiento: images/thinking-mode-output.pdf (ruta relativa dentro del repositorio de HuggingFace)
- Ejemplo de salida en modo no razonamiento: images/non-thinking-mode-output.pdf (ruta relativa dentro del repositorio de HuggingFace)
- Perfil del autor en el foro linux.do: https://linux.do/u/spacetime
- Contacto indicado en la model card: QQ 902575634, correo Zeus6_6@163.com
- No se han encontrado papers, blogs tecnicos ni repositorios de codigo adicionales en la busqueda web realizada.
