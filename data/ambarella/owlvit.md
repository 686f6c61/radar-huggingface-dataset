# Ambarella/OWLViT

## Resumen

OWL-ViT (Open-World Localization Vision Transformer) es un modelo de deteccion de objetos de vocabulario abierto que extiende la alineacion vision-lenguaje de CLIP para localizar regiones de imagen descritas mediante texto libre, sin necesidad de entrenamiento especifico para cada categoria. Fue propuesto originalmente por Google Research en el paper "Simple Open-Vocabulary Object Detection with Vision Transformers" (arXiv:2205.06230) y esta disponible como `google/owlvit-base-patch32`.

La version alojada en `Ambarella/OWLViT` no es un modelo nuevo, sino una compilacion y optimizacion del checkpoint original `owlvit-base-patch32` para los aceleradores de vision de Ambarella (SoCs N1-655, X7, CV7, CV72 y CV75) mediante su toolchain Cooper SDK 2.5.4 y Cooper Foundry 2.3. El repositorio contiene los binarios del codificador de imagen, el codificador de texto y el predictor en formatos propietarios (`.bin`), no en `safetensors` ni GGUF.

La arquitectura combina un image encoder CLIP ViT-B/32 con un text encoder Transformer de auto-atencion enmascarada. El modelo opera a una resolucion de entrada de 3x768x768 y esta pensado para despliegue en el borde (edge), en aplicaciones de vision en tiempo real como vigilancia, busqueda visual o robotica, donde el vocabulario de clases no puede fijarse de antemano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP ViT-B/32 (image encoder) + Transformer con masked self-attention (text encoder) + predictor de cajas |
| Parametros totales | no disponible (el checkpoint base `owlvit-base-patch32` ronda los 150 M, pero no se confirma en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el text encoder procesa consultas de texto cortas; no se especifica limite) |
| Tipos de cuantizacion | Activation_fp16 y Amba_optimized (optimizacion propietaria de Ambarella); no se detallan otros formatos |
| Idiomas soportados | no disponible (el text encoder CLIP es multilingue de forma limitada, pero no se declara) |
| Licencia | no disponible |
| Formato de pesos | `.bin` propietarios para SoCs Ambarella; el modelo original se distribuye en PyTorch (`.bin`/`pytorch_model.bin`) |
| Resolucion de entrada | 3x768x768 |
| Hardware objetivo | N1-655, X7, CV7, CV72, CV75 (SoCs Ambarella) |
| Toolchain | Cooper SDK 2.5.4, Cooper Foundry 2.3 |

## Arquitectura y entrenamiento

OWL-ViT sigue un diseno de deteccion de objetos de vocabulario abierto que reutiliza el espacio de embedding de CLIP. El image encoder es un Vision Transformer ViT-B/32 que divide la imagen de entrada (3x768x768) en parches de 32x32 y produce embeddings por region. El text encoder es un Transformer con auto-atencion enmascarada que proyecta las consultas textuales al mismo espacio. Un predictor ligero, entrenado sobre las caracteristicas congeladas de CLIP, genera las cajas delimitadoras y las puntuaciones de similitud entre cada region y cada consulta de texto.

El entrenamiento original (descrito en el paper de Google Research) parte de pesos CLIP preentrenados y anade un cabezal de deteccion entrenado sobre datasets de deteccion con anotaciones de cajas, manteniendo el alineamiento vision-lenguaje. No se especifica en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF/DPO (no aplica en un modelo de deteccion). La innovacion clave es la capacidad de deteccion zero-shot: el vocabulario se define en inferencia mediante texto, sin reentrenamiento.

La version de Ambarella no modifica la arquitectura, sino que compila y optimiza los tres componentes (image encoder, text encoder, predictor) para los NPUs de sus SoCs, con dos variantes de compresion: `Activation_fp16` para todos los modulos y `Amba_optimized` para el text encoder.

## Capacidades

- Deteccion de objetos de vocabulario abierto (open-vocabulary object detection) mediante consultas de texto libre.
- Deteccion zero-shot sin entrenamiento especifico por categoria.
- Localizacion de regiones (bounding boxes) alineadas con descripciones textuales.
- Busqueda visual por texto (image search) sobre imagenes.
- Comprension visual en tiempo real orientada a despliegue en el borde.
- No soporta tool calling, function calling ni agentes multi-step (no es un modelo generativo de lenguaje).
- No dispone de modo thinking, vision generativa ni audio.
- Capacidades multilingues: no declaradas en la informacion proporcionada.

## Casos de uso

- Vigilancia inteligente en el borde: el modelo se ejecuta en SoCs Ambarella (CV72, CV75) para detectar objetos definidos por texto en tiempo real, sin necesidad de reentrenar al anadir nuevas clases.
- Busqueda visual en catalogos: indexar imagenes de producto y recuperarlas mediante descripciones textuales ("camiseta roja con cuello blanco"), aprovechando el alineamiento CLIP.
- Robotica y automatizacion industrial: localizar objetos arbitrarios sobre la marcha ("caja de carton abierta", "tornillo hexagonal") para tareas de manipulacion, sin un catalogo fijo de clases.
- Analisis de video en camaras IP: deteccion de eventos definidos por texto (personas con casco, vehiculos sin matricula) directamente en el dispositivo, reduciendo el ancho de banda hacia la nube.
- Accesibilidad: describir y localizar objetos en imagenes para usuarios con discapacidad visual mediante consultas de texto.
- Retail y logistica: deteccion de articulos en estanterias o cintas transportadoras con vocabulario variable segun el inventario del dia.
- Investigacion en vision-lenguaje: servir como baseline para experimentos de deteccion zero-shot y para comparar con variantes de mayor resolucion (patch16).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de Ambarella no incluye metricas de precision (AP, mAP) ni comparativas de latencia o throughput para los SoCs objetivo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo esta empaquetado para NPUs de Ambarella, no para GPU convencional.
- GPU recomendadas: no aplica para los binarios de Ambarella. El checkpoint original `owlvit-base-patch32` puede ejecutarse en GPU consumer (p. ej. RTX 3060 o superior) mediante PyTorch, aunque no se confirma en la informacion.
- Cabe en GPU consumer: probablemente si para el checkpoint original (modelo de ~150 M de parametros), pero no confirmado.
- Opciones de despliegue: Cooper SDK 2.5.4 y Cooper Foundry 2.3 sobre SoCs N1-655, X7, CV7, CV72 y CV75. Para el modelo original, PyTorch/Transformers (`OwlViTForObjectDetection`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| OWL-ViT base patch32 (este repo, Ambarella) | no disponible (~150 M en el original) | 3x768x768 | no disponible | Binarios para SoCs Ambarella |
| google/owlvit-base-patch32 | ~150 M (no confirmado) | 768x768 | no disponible en la informacion | Hugging Face, PyTorch |
| google/owlvit-large-patch14 | no disponible | 768x768 (parches 14x14) | no disponible en la informacion | Hugging Face, PyTorch |
| Grounding DINO | no disponible | no disponible | no disponible en la informacion | Hugging Face, PyTorch |

La comparativa se limita a variantes de la misma familia y a alternativas de deteccion abierta; los datos de parametros y licencia de las alternativas no se confirman en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio contiene binarios propietarios para hardware Ambarella; no es directamente usable en GPU o CPU convencional sin el toolchain Cooper.
- La licencia no esta declarada en la model card, lo que impide confirmar el uso comercial. El modelo original de Google Research tiene su propia licencia que debe verificarse por separado.
- No se declaran idiomas soportados; el text encoder CLIP tiene cobertura multilingue limitada y sesgada hacia el ingles.
- Riesgo de alucinacion en deteccion: el modelo puede proponer cajas para consultas sin objeto presente, con puntuaciones de similitud que requieren umbralizado cuidadoso.
- Sensible a la formulacion de la consulta de texto; el rendimiento varia segun como se describa la clase.
- Resolucion de entrada fija (768x768); objetos muy pequenos pueden no detectarse.
- No es un modelo generativo: no produce texto, codigo ni razonamiento.
- Sin datos publicados de benchmarks, latencia ni consumo energetico en los SoCs objetivo.
- El repositorio tiene muy pocas descargas y likes, y no incluye pipeline declarado; la madurez de la integracion es baja.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Ambarella/OWLViT
- Paper original: https://arxiv.org/abs/2205.06230
- Implementacion de referencia (Google Scenic): https://github.com/google-research/scenic/tree/main/scenic/projects/owl_vit
- Checkpoint original: https://huggingface.co/google/owlvit-base-patch32
- Pesos originales (PyTorch): https://huggingface.co/google/owlvit-base-patch32/blob/main/pytorch_model.bin
