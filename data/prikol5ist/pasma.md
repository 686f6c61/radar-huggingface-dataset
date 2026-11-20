# Prikol5ist/pasma

## Resumen

Pasma es una familia de modelos compactos de vision artificial para clasificacion de prendas de vestir en fotografias cotidianas. Desarrollada por Vestes Archive (atelier digital autor del proyecto), la familia incluye tres variantes de distinto tamano (Small, Nano y Pico) construidas sobre arquitecturas EfficientNet-like y ConvNeXt pico, afinadas a partir de pesos de timm (`edgenext_small.usi_in1k` y `convnext_pico.d1_in1k`). El modelo resuelve un problema concreto: identificar una unica prenda en una imagen y devolver simultaneamente su tipo (20 clases), su categoria (6 clases) y una puntuacion visual de materiales (21 etiquetas multi-label), sin necesidad de un modelo adicional de eliminacion de fondo ni de llamadas de red.

La relevancia del modelo reside en su orientacion edge-first: los grafos ONNX FP16 de las variantes Small y Nano ocupan aproximadamente 10,32 MiB, lo que permite empaquetarlos en aplicaciones moviles o de escritorio y ejecutar la inferencia localmente en CPU o en el navegador mediante ONNX Runtime Web. La version v1.0 se distribuye como candidata, con pesos y ejemplo de inferencia funcionales, y la v1.1.0 anade mejoras en reconocimiento de blusas sobre fotografias de marketplaces. La licencia Apache-2.0 y la retencion de avisos upstream MIT/Apache facilitan su uso comercial.

Se trata de un modelo de clasificacion de imagenes, no de un modelo generativo: no dispone de contexto textual, tool calling ni razonamiento multi-paso. Su valor esta en la precision sobre dominios de moda y en la eficiencia de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (EfficientNet-like / ConvNeXt pico segun variante), exportada a ONNX y Core ML |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, sin contexto textual) |
| Tipos de cuantizacion | FP32 y FP16 (ONNX); export Core ML; safetensors |
| Idiomas soportados | en (etiquetas y documentacion en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (FP32/FP16), Core ML, safetensors |

## Arquitectura y entrenamiento

Pasma es una familia de clasificadores de imagen derivados por fine-tuning de dos checkpoints de timm: `edgenext_small.usi_in1k` (variantes Small y probablemente Nano) y `convnext_pico.d1_in1k` (variante Pico). La salida del grafo es multiple: tres cabezas supervisadas (`prob_coarse`, `prob_type`, `prob_material`) que producen respectivamente la categoria gruesa, el tipo de prenda (20 clases) y las puntuaciones visuales de material (21 etiquetas multi-label independientes). La normalizacion ImageNet esta integrada dentro del grafo exportado, de modo que el preprocesado externo solo debe aplicar letterbox bilineal con preservacion de relacion de aspecto, padding gris y conversion a `[0,1]`.

No se dispone de informacion sobre el numero de tokens de entrenamiento (no aplica), la composicion exacta del dataset, el uso de RLHF/DPO (no aplica a clasificacion) ni tecnicas de regularizacion especificas. La model card menciona que la v1.1.0 mejora el reconocimiento de blusas sobre fotografias de marketplaces held-out y publica metricas de evaluacion y paridad de exportacion en `releases/v1.1.0/evaluation.json` y `releases/v1.1.0/parity.json`. Las resoluciones de entrada varian por variante: 320 px para Small-320 y 256 px para Nano-256, segun los nombres de artefacto.

## Capacidades

- Clasificacion de tipo de prenda en 20 clases (por ejemplo SHIRT, BLOUSE, HOODIE) con puntuaciones de confianza.
- Clasificacion de categoria gruesa en 6 clases (por ejemplo TOP), con coherencia forzada entre tipo seleccionado y categoria devuelta.
- Puntuacion multi-label de 21 materiales visuales (cotton, linen, polyester, etc.), independientes entre si y sujetas a umbral.
- Salida Top-3 de tipos para permitir interaccion de desambiguacion por parte del usuario.
- Inferencia local sin subida de imagen, sin API key y sin coste por imagen.
- Ejecucion en navegador mediante ONNX Runtime Web (demo publica en Hugging Face Spaces).
- Exportacion a Core ML para despliegue nativo en macOS/iOS.
- Preprocesado integrado (normalizacion ImageNet dentro del grafo) y manejo de orientacion EXIF en el ejemplo de referencia.
- No dispone de tool calling, agentes, razonamiento multi-paso, vision generativa, audio ni capacidades multilingues mas alla del ingles en etiquetas.

## Casos de uso

- Catalogacion automatica de armarios: una aplicacion movil captura una foto de una prenda y obtiene tipo, categoria y materiales sugeridos en el dispositivo, sin enviar imagenes a un servidor; el tamano de ~10 MiB en FP16 permite empaquetar el modelo en la app.
- Asistentes de compra y marketplaces de segunda mano: el vendedor fotografia la prenda y la app pre-rellena el formulario de publicacion (tipo, categoria, material probable) con sugerencias corregibles por el usuario, reduciendo friccion en el alta de anuncios.
- Recomendacion de outfits y armarios digitales: el modelo clasifica prendas al importarlas y alimenta un grafo de combinaciones; la salida Top-3 permite pedir confirmacion cuando la confianza es baja (97,10% Top-3 en el conjunto real combinado).
- Etiquetado de catalogos de e-commerce: procesamiento por lotes de fotografias de producto para asignar tipo y categoria de forma consistente, con revision humana sobre los casos de baja confianza.
- Aplicaciones de moda sostenible: estimacion visual de materiales (algodon, lino, poliester) como pista orientativa para filtros de sostenibilidad, siempre presentada como sugerencia y no como composicion verificada.
- Filtrado y busqueda visual en archivos fotograficos personales: indexacion local de una biblioteca de imagenes por tipo de prenda y material, sin dependencia de servicios externos.
- Demos educativas y prototipado rapido: integracion en notebooks o aplicaciones web mediante ONNX Runtime para experimentar con clasificacion de moda en el borde.

## Benchmarks y rendimiento

La model card declara los siguientes resultados para Small-320 sobre conjuntos held-out de imagenes reales:

| Metrica | Resultado |
|---|---|
| Tipo Top-1 en `test_real` (854 imagenes) | 90,75% |
| Tipo Top-1 en todas las imagenes reales held-out (1.103) | 89,12% |
| Tipo Top-3 en conjunto real combinado | 97,10% |

El model-index oficial no incluye resultados adicionales (`results: []`). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo es de clasificacion de imagenes y no de lenguaje. No se dispone de comparaciones numericas con modelos alternativos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el modelo es de vision y extremadamente compacto (los grafos Small y Nano FP16 ONNX ocupan ~10,32 MiB), por lo que cabe en memoria de cualquier GPU consumer y en CPU.
- GPU recomendadas: no se especifican; el ejemplo de referencia funciona en CPU con ONNX Runtime (`CPUExecutionProvider`). Cualquier GPU moderna (RTX 4090, A100, H100) puede ejecutarlo con margen amplio, pero no aporta ventaja frente a CPU por el tamano del modelo.
- Cabe en GPU consumer: si, en todas las GPU consumer actuales; tambien en dispositivos moviles y navegador.
- Opciones de despliegue: ONNX Runtime (CPU, GPU, Web), Core ML (macOS/iOS), ejecucion en navegador con ONNX Runtime Web. No se menciona vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: la model card menciona comparaciones de velocidad nativa en Mac M2 en el video demo, pero no se proporcionan cifras concretas de latencia o throughput en la informacion disponible.

## Comparativa con modelos similares

No se dispone de modelos comparables documentados en la informacion proporcionada. Como referencia estructural, el modelo se apoya en checkpoints de timm (`edgenext_small.usi_in1k` y `convnext_pico.d1_in1k`), pero no se han publicado comparaciones de rendimiento con alternativas de clasificacion de moda o de material. Datos comparativos: no disponible.

## Limitaciones y advertencias

- Modelo de clasificacion de una unica prenda por imagen: no esta disenado para escenas con varias prendas simultaneas ni para segmentacion.
- Las puntuaciones de material son sugerencias visuales independientes, no porcentajes de fibra ni composicion verificada; no deben presentarse como datos objetivos.
- Las sugerencias deben permanecer corregibles por el usuario; la validacion especifica en telefonos y parte del trabajo de paridad de exportacion estan pendientes segun la model card.
- La version v1.0 se declara candidata; la v1.1.0 mejora el reconocimiento de blusas pero puede introducir diferencias de comportamiento respecto a la v1.0.
- Idioma: etiquetas y documentacion solo en ingles; no hay soporte multilingue.
- Riesgo de confusion entre tipos visualmente proximos (por ejemplo SHIRT frente a BLOUSE) en fotografias de baja calidad o con oclusiones; el Top-3 mitiga parcialmente este riesgo.
- Sesgos conocidos: no documentados en la informacion disponible; cabe esperar sesgos derivados de la distribucion del dataset de entrenamiento (no publicado).
- Licencia Apache-2.0 con avisos upstream MIT/Apache retenidos: uso comercial permitido, pero deben conservarse las atribuciones correspondientes.
- La demo publica ejecuta ONNX localmente en el navegador; la primera ejecucion descarga el modelo y el runtime, lo que introduce latencia inicial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Prikol5ist/pasma
- Demo interactiva: https://huggingface.co/spaces/Prikol5ist/pasma
- Repositorio GitHub: https://github.com/prikol5ist-art/Pasma
- Sitio de Vestes Archive: https://vestesarchive.dev/
- Licencia: https://huggingface.co/Prikol5ist/pasma/blob/main/LICENSE
- Release v1.1.0: https://huggingface.co/Prikol5ist/pasma/blob/main/releases/v1.1.0/README.md
- Metricas de evaluacion v1.1.0: https://huggingface.co/Prikol5ist/pasma/blob/main/releases/v1.1.0/evaluation.json
- Resultados de paridad de exportacion v1.1.0: https://huggingface.co/Prikol5ist/pasma/blob/main/releases/v1.1.0/parity.json
- Video demo: https://huggingface.co/Prikol5ist/pasma/resolve/main/assets/pasma-demo.mp4
- Notas de medicion y creditos del video: https://huggingface.co/Prikol5ist/pasma/blob/main/assets/pasma-demo-notes.md
- Modelo base edgenext_small.usi_in1k: https://huggingface.co/timm/edgenext_small.usi_in1k
- Modelo base convnext_pico.d1_in1k: https://huggingface.co/timm/convnext_pico.d1_in1k
