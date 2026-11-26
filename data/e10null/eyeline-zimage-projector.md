# E10Null/eyeline-zimage-projector

## Resumen

Eyeline es un par de proyectores de acondicionamiento (conditioning projectors) publicados por el usuario E10Null en Hugging Face. No se trata de un modelo generativo completo, sino de un componente ligero que permite sustituir el codificador de texto nativo `Qwen3-4B` de los modelos de difusion Z-Image Base y Z-Image Turbo (ZiT) por los estados ocultos por token de un codificador congelado `Qwen3.5-4B` o `Qwen3.5-9B`, sin reentrenar el modelo de difusion. Cada proyector es una combinacion de `RMSNorm` y una capa `Linear` que alinea el espacio latente del nuevo codificador con el que espera el UNet de Z-Image.

El problema que resuelve es de integracion y eficiencia en pipelines de ComfyUI: en flujos multi-etapa como MOSS → ZiT, donde ya se carga `qwen3.5_9b_int8_convrot.safetensors`, reutilizar ese mismo codificador evita cambiar de familia de encoder y, segun el autor, reduce el tiempo total de pared en aproximadamente 5,4 s (un 18 %) en una RTX 3060 de 12 GB. El repositorio es muy pequeno (0,1 GB) y los ficheros pesan 26 MB (4B) y 42 MB (9B).

La relevancia es acotada pero practica: es una pieza de infraestructura para quienes ya trabajan con Z-Image o ZiT en ComfyUI y quieren aprovechar un codificador Qwen3.5 ya presente en su flujo. No es un modelo de lenguaje ni un modelo de imagen autonomo, y su utilidad depende de la instalacion del nodo personalizado `ComfyUI-Eyeline`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyector lineal: `RMSNorm` + `Linear` (no es un transformer generativo) |
| Parametros totales | no disponible (solo se indica el tamano de los ficheros: 26 MB y 42 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del codificador Qwen3.5 subyacente) |
| Tipos de cuantizacion | no disponible (los proyectores se distribuyen en safetensors; el codificador de entrada se usa en int8 en los ejemplos) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Detalle de los ficheros:

| Fichero | Tamano | Codificador de entrada | Arquitectura | MSE de validacion |
|---|---|---|---|---|
| `projector-9b-5k.safetensors` (recomendado) | 42,0 MB | `qwen3.5_9b_int8_convrot.safetensors` | `RMSNorm(4096)` → `Linear(4096 → 2560)` | 5,75 |
| `projector-4b-5k.safetensors` | 26,2 MB | `qwen3.5_4b_int8_convrot.safetensors` | `RMSNorm(2560)` → `Linear(2560 → 2560)` | 7,47 |

## Arquitectura y entrenamiento

Cada proyector es una transformacion muy simple: una normalizacion RMS sobre las dimensiones ocultas del codificador de origen y una proyeccion lineal hacia la dimension de 2560 que espera el modelo de difusion Z-Image. El proyector de 9B reduce de 4096 a 2560 dimensiones; el de 4B mantiene 2560 a 2560. No hay atencion, ni capas residuales adicionales descritas en la model card.

El entrenamiento consistio en una alineacion de 6.000 pasos sobre 5.200 captions contra las caracteristicas por token del codificador nativo `Qwen3-4B` de Z-Image, con la opcion `match_stock_template: true`. El objetivo es que la salida del proyector reproduzca lo mas fielmente posible el espacio de acondicionamiento que el UNet de Z-Image ya conoce, sin tocar los pesos del modelo de difusion. La metrica reportada es el MSE de validacion de la alineacion (5,75 para el 9B y 7,47 para el 4B). No se detalla composicion del dataset, regimen de RLHF/DPO ni innovaciones de decodificacion.

## Capacidades

- Sustitucion del codificador de texto de Z-Image Base y Z-Image Turbo por Qwen3.5-4B o Qwen3.5-9B sin reentrenar el modelo de difusion.
- Integracion en ComfyUI mediante los nodos `EyelineLoader` y `EyelineTextEncode` (nodo personalizado `ComfyUI-Eyeline`).
- Compatibilidad con el flujo de acondicionamiento estandar de Z-Image: salida `CONDITIONING` hacia el `positive` del sampler y `ConditioningZeroOut` para el `negative` en ZiT.
- Reutilizacion del codificador Qwen3.5 en pipelines multi-etapa (por ejemplo MOSS → ZiT) para evitar cambios de familia de encoder.
- No incluye generacion de texto, razonamiento, codigo, vision, tool calling ni capacidades de agente por si mismo: esas capacidades pertenecen al codificador Qwen3.5 subyacente, no a este repositorio.

## Casos de uso

- Pipeline MOSS → ZiT en ComfyUI: reutilizar `qwen3.5_9b_int8_convrot.safetensors` como codificador en ambas etapas mediante `projector-9b-5k.safetensors`, evitando cargar y descargar un segundo encoder. El autor reporta una reduccion de unos 5,4 s (18 %) en una RTX 3060 12 GB a 896×1152.
- Sustitucion del encoder nativo en flujos Z-Image existentes: cambiar `CLIPLoader (lumina2)` + `CLIPTextEncode` por `EyelineLoader` + `EyelineTextEncode` manteniendo el resto del grafo intacto.
- Generacion de retratos con contacto visual directo: la model card muestra comparativas a semillas identicas en Z-Image Turbo (6 pasos, cfg 1, euler/beta, shift 3) con prompts de retrato en cafeteria y luz de ventana.
- Composiciones multi-sujeto con asignacion de objetos: el ejemplo del taller con dos mujeres, herramientas y atuendo distinto ilustra el uso para prompts con layout espacial y propiedad de props.
- Escenas en primera persona con iluminacion compleja: el ejemplo del compartimento de tren al atardecer con reflejos de lluvia sirve como referencia para prompts de luz interior/exterior mezclada.
- Experimentacion con codificadores alternativos: permite comparar Qwen3.5-4B frente a Qwen3.5-9B sobre el mismo UNet de Z-Image sin reentrenar, usando el MSE de alineacion como criterio de calidad.
- Despliegue en hardware de gama media: al anadir solo 26-42 MB de pesos, el coste adicional de VRAM es despreciable frente al del codificador y el UNet, lo que facilita su uso en GPUs consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no es un modelo de lenguaje. Los unicos datos cuantitativos son los de alineacion y los tiempos de pared reportados por el autor:

| Metrica | `projector-9b-5k` | `projector-4b-5k` |
|---|---|---|
| MSE de validacion de alineacion | 5,75 | 7,47 |
| Pasos de alineacion | 6.000 | 6.000 |
| Captions de alineacion | 5.200 | 5.200 |
| Tamano del fichero | 42,0 MB | 26,2 MB |

Ahorro reportado en MOSS → ZiT (896×1152, RTX 3060 12 GB): aproximadamente 5,4 s, un 18 % del tiempo de pared.

## Requisitos de hardware

- VRAM adicional por el proyector: despreciable (26 MB o 42 MB de pesos en safetensors).
- El requisito real de VRAM lo marcan el codificador Qwen3.5 (usado en int8 en los ejemplos) y el UNet de Z-Image Base o Turbo.
- GPU de referencia en la model card: RTX 3060 de 12 GB, suficiente para el flujo MOSS → ZiT a 896×1152 segun el autor.
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090, etc.); no disponible.
- Despliegue: ComfyUI con el nodo personalizado `ComfyUI-Eyeline` (`EyelineLoader` + `EyelineTextEncode`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este componente.
- Latencia y throughput: solo el dato agregado del pipeline (reduccion de ~5,4 s, ~18 %, en RTX 3060 12 GB); no hay cifras aisladas del proyector.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada otros proyectores de codificador de texto para Z-Image con los que comparar parametros, contexto o licencia. Como referencia de categoria, el propio repositorio se posiciona frente al codificador nativo `Qwen3-4B` de Z-Image, que sustituye:

| Alternativa | Funcion | Licencia | Disponibilidad |
|---|---|---|---|
| Codificador nativo `Qwen3-4B` de Z-Image | Encoder de texto original del UNet | no disponible en la informacion | incluido con Z-Image / ZiT |
| Eyeline `projector-9b-5k` | Adapta Qwen3.5-9B a Z-Image / ZiT | Apache 2.0 | Hugging Face (E10Null/eyeline-zimage-projector) |
| Eyeline `projector-4b-5k` | Adapta Qwen3.5-4B a Z-Image / ZiT | Apache 2.0 | Hugging Face (E10Null/eyeline-zimage-projector) |

## Limitaciones y advertencias

- Alineado sobre solo 5.200 captions: tokens demograficos o de estilo muy raros o de grano fino pueden suavizarse ligeramente frente al codificador nativo `Qwen3-4B`.
- El autor recomienda encarecidamente el proyector de 9B sobre el de 4B tanto por fidelidad al prompt como por velocidad en pipelines MOSS → ZiT.
- Requiere el nodo personalizado `ComfyUI-Eyeline`; no funciona como sustituto directo sin instalar esa extension.
- Depende de ficheros de codificador concretos (`qwen3.5_9b_int8_convrot.safetensors` o `qwen3.5_4b_int8_convrot.safetensors`); no se documenta compatibilidad con otras variantes o cuantizaciones de Qwen3.5.
- No es un modelo generativo autonomo: no produce texto ni imagenes por si mismo, solo transforma acondicionamientos.
- No se documentan sesgos, riesgo de alucinacion ni limitaciones de idioma del componente; esos riesgos dependerian del codificador Qwen3.5 y del modelo de difusion subyacentes.
- Licencia Apache 2.0 permite uso comercial del proyector, pero el uso de Z-Image, ZiT y Qwen3.5 queda sujeto a sus respectivas licencias, no detalladas en la informacion disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validacion externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/E10Null/eyeline-zimage-projector
- Nodo personalizado `ComfyUI-Eyeline`: no se proporciona URL en la informacion disponible.
- Paper, blog o demo adicionales: no disponible.
