# BH-Language-AI/bh-vision-2-8b-cura

## Resumen

BH-Vision-2-8B-CURA es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-9B, desarrollado por BH-Language-AI, orientado a tareas de computer-use: a partir de una captura de pantalla (2-4 MP) y una instruccion textual, el modelo emite un tool-call en JSON estricto que un ejecutor puede interpretar directamente (`tap`, `click`, `type`, `scroll`). El nombre CURA responde a "Computer-Use Reasoning + Actions" y representa la segunda generacion de la familia BH-Vision, que en su primera version se centraba en documentos, OCR y tablas.

El adaptador tiene aproximadamente 465 MB (repositorio de 0.5 GB) y se distribuye en formato PEFT/safetensors. Se inicializa a partir del adaptador Stage-2 del modelo previo `lumi-vl-8b-cua` y se entrena con LoRA de rango 64 sobre el LLM del modelo base, manteniendo el codificador visual de Qwen3.5-VL. La inferencia se realiza con thinking desactivado, resolucion de 4 MP y coordenadas normalizadas en el rango 0-1000.

Su relevancia actual radica en que aborda el problema del grounding visual y la generacion de acciones ejecutables sobre interfaces graficas, un componente critico para agentes autonomos de escritorio y moviles. La licencia Apache-2.0 tanto en la base como en el adaptador facilita su adopcion en entornos comerciales, si bien el autor documenta de forma explicita limitaciones de cobertura en ciertas acciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer: codificador visual Qwen3.5-VL + LLM Qwen3.5-9B con adaptador LoRA r64 |
| Parametros totales | No disponible (el adaptador LoRA es de ~465 MB; el modelo base Qwen3.5-9B tiene 9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | bs (bosnio), hr (croata), sr (serbio), en (ingles) |
| Licencia | Apache-2.0 (base y adaptador) |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

La arquitectura combina un codificador visual Qwen3.5-VL que procesa capturas de pantalla de 2-4 MP con el LLM Qwen3.5-9B, sobre el que se aplica un adaptador LoRA de rango 64. El flujo es iterativo: la captura y la instruccion se fusionan en el LLM, que emite un JSON de accion; un ejecutor aplica la accion (`tap`, `click`, `type`, `scroll`), se genera una nueva captura y el bucle continua. Las coordenadas se expresan en escala 0-1000 sobre la imagen.

El entrenamiento se realizo en LUMI-G (8x MI250X) el 24 de noviembre de 2026, con 4.165 capturas de pantalla ("harvest"), learning rate de 2e-6 durante 200 pasos y inicializacion desde el adaptador Stage-2 del modelo `lumi-vl-8b-cua`. La distribucion de acciones de entrenamiento es muy desigual: `tap` 3.639, `click` 623, `scroll` 355 y `type` 76. No se documenta el uso de RLHF o DPO.

## Capacidades

- Grounding visual sobre capturas de pantalla: localizacion de elementos de interfaz y emision de coordenadas normalizadas 0-1000.
- Generacion de tool-calls en JSON estricto para cuatro acciones: `tap`, `click` (con boton), `type` (texto) y `scroll` (direccion).
- Razonamiento de computer-use en bucle cerrado: captura, accion, nueva captura.
- Salida JSON con validacion del 100 % en las pruebas documentadas.
- Soporte multilingue limitado a bosnio, croata, serbio e ingles.
- No se documentan capacidades de tool calling generico, function calling fuera del esquema CUA, agentes multi-paso mas alla del bucle de acciones, vision mas alla de capturas GUI, audio ni modo thinking (la inferencia se realiza con thinking OFF).

## Casos de uso

- Automatizacion de pruebas de interfaz: el modelo puede identificar elementos en capturas de pantalla y emitir acciones `tap`/`click` para validar flujos de UI en pipelines de QA, con la ventaja de un JSON estricto que un runner puede ejecutar sin post-procesado.
- Agentes de escritorio para tareas repetitivas: dado un objetivo en lenguaje natural (por ejemplo, "abrir el menu de ajustes"), el modelo localiza el control y emite la accion correspondiente, integrándose en un bucle con captura de pantalla.
- Asistentes de accesibilidad: traduccion de instrucciones verbales o textuales en acciones sobre la GUI para usuarios con movilidad reducida, aprovechando el grounding sobre elementos visibles.
- RPA (automatizacion robotica de procesos) sobre aplicaciones legacy sin API: el modelo permite operar interfaces que solo exponen UI, emitiendo acciones sobre coordenadas en lugar de selectores DOM.
- Navegacion guiada en aplicaciones moviles: el adaptador puede integrarse en un ejecutor que reciba capturas de pantalla del dispositivo y devuelva acciones `tap`, `scroll` o `click` para tareas de onboarding o soporte remoto.
- Extraccion de datos mediante interaccion: combinado con el modelo Stage-2 de grounding, permite navegar por pantallas y localizar campos antes de leer su contenido, util en digitalizacion de formularios.
- Soporte en idiomas de los Balcanes occidentales: al cubrir bs/hr/sr, puede desplegarse en asistentes de automatizacion para mercados de Bosnia y Herzegovina, Croacia y Serbia alli donde el ingles no sea suficiente.

## Benchmarks y rendimiento

| Test | Baseline (Stage-2) | actions-v1 (este modelo) | Delta |
|---|---|---|---|
| ScreenSpot-Pro (593 de 4.743, 26 apps) | 67,28 % | 66,10 % | -1,18 pp (< 1 SE) |
| Validez de JSON | 100 % | 100 % | = |
| `scroll` (eval de acciones propia) | No disponible | 100 % (14/14) | nuevo |
| `tap` bajo prompt de acciones | No disponible | 16,7 % como `tap` (resto como `click`, semanticamente equivalente) | — |
| `click` (posicion) | No disponible | Posicion correcta, pero `button` no se emite | debil |
| `type` | No disponible | 0 % | debil |

El resultado completo de ScreenSpot-Pro del modelo Stage-2 publicado es de 67,05 % sobre 4.743 elementos con thinking ON. Las cifras de este adaptador se midieron con la misma procedimiento que produccion: thinking off y 4 MP.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un modelo de 9B en bfloat16, se requiere aproximadamente 18-20 GB solo para pesos, mas el coste del codificador visual a 4 MP y el adaptador LoRA (~465 MB).
- GPU recomendadas: A100 (40/80 GB), H100, MI250X (plataforma de entrenamiento documentada) y, en general, GPUs con al menos 24 GB para bfloat16.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con bfloat16 ajustado o cuantizacion; en GPUs de 16 GB requeriria cuantizacion agresiva, no documentada por el autor.
- Opciones de despliegue: transformers + PEFT (procedimiento documentado en la model card). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BH-Vision-2-8B-CURA | Base 9B + LoRA r64 | No disponible | ScreenSpot-Pro 66,10 % (593 items) | Apache-2.0 | Hugging Face |
| lumi-vl-8b-cua (Stage-2, mismo autor) | Base 8B | No disponible | ScreenSpot-Pro 67,28 % (593 items) / 67,05 % completo | No disponible en la informacion | Hugging Face |
| Qwen/Qwen3.5-9B (base) | 9B | No disponible | No disponible | No disponible en la informacion | Hugging Face |

No se dispone de datos de benchmarks de otros modelos comparables de computer-use en la informacion proporcionada.

## Limitaciones y advertencias

- Las acciones estan limitadas por los datos: `type` (76 muestras) y el clic derecho (86 muestras) son demasiado escasos frente a 3.639 de `tap`, por lo que el modelo tiende a elegir `click`/`tap` en lugar de `type`. El autor estima necesario aproximadamente 10 veces mas datos para cubrir estas acciones.
- `click` localiza correctamente la posicion pero a menudo no emite el campo `button`.
- `type` obtiene un 0 % en la evaluacion de acciones.
- El grounding se mantiene en el nivel del Stage-2 (-1,2 pp, dentro del ruido); para produccion el autor recomienda usar el prompt de grounding del Stage-2 y activar acciones solo cuando sea necesario.
- Cobertura linguistica limitada a bosnio, croata, serbio e ingles; no se documenta soporte para castellano.
- Riesgo de alucinacion en coordenadas no documentado explicitamente, pero inherente a modelos de grounding visual.
- No se documentan sesgos conocidos.
- Aunque la licencia es Apache-2.0, conviene verificar las condiciones del modelo base Qwen3.5-9B antes de un despliegue comercial.
- El modelo se distribuye como adaptador PEFT: requiere descargar el modelo base completo, lo que incrementa los requisitos de almacenamiento y VRAM respecto al tamano del repositorio (0.5 GB).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BH-Language-AI/bh-vision-2-8b-cura
- Coleccion BH-Vision: https://huggingface.co/collections/BH-Language-AI/bh-vision
- Modelo previo Stage-2: https://huggingface.co/BH-Language-AI/lumi-vl-8b-cua
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
