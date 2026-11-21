# iaac-maai/concrete-evidence-stand-in

## Resumen

Concrete Evidence stand-in es un modelo de segmentación de instancias basado en Ultralytics YOLOv8n-seg, exportado a ONNX y publicado por el equipo Concrete Evidence del IAAC MaAI 2026 (AAD Research Studio 03: Akshat, Diego y Akanksha). No es un modelo de lenguaje ni un modelo fundacional: es un detector-segmentador de un único objeto (brochetas de madera, `skewer`) pensado como sustituto temporal del modelo real de armaduras de acero corrugado (rebar) que el equipo entrenará más adelante.

Su propósito es estrictamente de integración: permite que la aplicación Concrete Evidence funcione de extremo a extremo (foto → servidor de modelos en Render → app en Cloudflare) antes de que exista el modelo definitivo. La aplicación renombra la clase `skewer` a `bar` mediante `CLASS_RENAME=skewer=bar`, de modo que el pipeline completo se ejercita con datos reales, aunque no sean del dominio objetivo.

El modelo es muy pequeño (13,8 MB, ONNX opset 17, entrada fija 1×3×640×640) y se entrenó con solo 20 fotos cenitales de una alfombrilla de 6×6 brochetas. Su relevancia es la de una herramienta de ingeniería de software para desbloquear el desarrollo de una aplicación de inspección de armaduras, no la de un componente válido para evaluación estructural real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ultralytics YOLOv8n-seg (segmentación de instancias, una clase: `skewer`) |
| Parámetros totales | no disponible (variante "n" de YOLOv8-seg; el autor no publica el recuento) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantización | no disponible (solo se publica el ONNX en FP32; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (`best.onnx`, 13,8 MB, opset 17, `simplify=True`, `dynamic=False`, entrada `images` 1×3×640×640 fija) |
| Librería / runtime | `onnxruntime` en CPU, sin PyTorch |
| Exportado con | Ultralytics 8.4.216 |
| Tarea (pipeline) | `image-segmentation` |
| Tamaño del repo | 0,0 GB (según Hugging Face) |

## Arquitectura y entrenamiento

YOLOv8n-seg es una red de detección y segmentación de instancias de una sola etapa, con un backbone convolucional ligero y una cabeza que predice cajas y máscaras por instancia. En este caso se exportó a ONNX con `simplify=True` y `dynamic=False`, lo que fija la resolución de entrada a 640×640 y elimina la dependencia de PyTorch en inferencia; el autor indica que se ejecuta directamente con `onnxruntime` en CPU.

El entrenamiento se realizó sobre un conjunto propio muy reducido: 20 fotos cenitales de una alfombrilla de 6×6 brochetas con separación de 30 mm y dos pegatinas de color como referencia de escala. Once fotos corresponden a la alfombrilla correcta y nueve incluyen una brocheta extra. Las etiquetas se generaron automáticamente a partir de la rejilla de diseño, produciendo 1.299 piezas de brocheta cortadas entre cruces. Se usaron 16 fotos para entrenamiento y 4 se reservaron como conjunto de validación. No se emplearon imágenes de terceros ni personas. No se documenta el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de visión de este tipo.

## Capacidades

- Segmentación de instancias de un único objeto: detecta y segmenta brochetas de madera (`skewer`) en fotografías cenitales sobre una mesa clara.
- Conteo de piezas: devuelve cajas y máscaras por instancia, lo que permite contar piezas (`len(result.boxes.xyxy)`).
- Inferencia en CPU sin PyTorch, mediante `onnxruntime`.
- Integración con la aplicación Concrete Evidence a través del renombrado de clase `skewer=bar` y del servidor de modelos en Render (`MODEL_REPO`, `MODEL_FILE`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües, visión general, audio ni modo de pensamiento. Es exclusivamente un segmentador de imágenes de un dominio muy restringido.

## Casos de uso

- Prueba de integración de extremo a extremo de la aplicación Concrete Evidence: el modelo permite ejercitar el flujo foto → servidor de modelos en Render → app en Cloudflare antes de disponer del modelo real de rebar. Es su propósito declarado y el único uso para el que está pensado.
- Desarrollo y depuración del pipeline de inferencia ONNX: sirve para validar `concrete_evidence/onnx_seg.py`, la carga desde Hugging Face con `hf_hub_download` y el manejo de salidas (cajas y máscaras) en el entorno de producción.
- Pruebas de latencia y despliegue en CPU: con 0,2 s por foto de 1280×960 en CPU de portátil, permite medir el rendimiento del servidor de modelos en Render sin depender de GPU.
- Validación del mecanismo de renombrado de clases (`CLASS_RENAME=skewer=bar`): comprueba que la app trata las piezas detectadas como barras antes de conectar el modelo definitivo.
- Pruebas de la lógica de comprobación de la aplicación: aunque el modelo solo encuentra piezas y no fallos, permite alimentar las reglas de barra, atado y gancho implementadas en `concrete_evidence/` con detecciones reales.
- Demostración interna del flujo de confirmación humana: sirve para ensayar la interfaz en la que una persona confirma cada fallo antes de un vertido, usando detecciones del stand-in como entrada.
- No es adecuado para inspección de armaduras reales, obras, ni para juzgar refuerzo estructural; el propio autor lo advierte explícitamente.

## Benchmarks y rendimiento

El autor publica resultados de validación propios, no benchmarks estándar:

| Métrica | Resultado |
|---|---|
| Fotos juzgadas correctamente (alfombrilla correcta vs brocheta extra) | 20 de 20, incluidas las 4 reservadas |
| Precisión de posición de cada brocheta | dentro de ~1 mm del diseño, medido contra la alfombrilla |
| ONNX vs PyTorch en una foto de 1280×960 | 72 = 72 piezas; desplazamiento máximo de caja 4,8 px; IoU mediana de contorno 0,993 |
| Latencia ONNX vs PyTorch en CPU de portátil | 0,2 s vs 5,7 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, COCO, etc.) en la información disponible; además, no serían aplicables a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la configuración publicada; el modelo se ejecuta con `onnxruntime` en CPU. Al ser un ONNX de 13,8 MB con entrada fija 640×640, la huella de memoria es mínima y cabe holgadamente en cualquier GPU de consumo si se ejecuta con un runtime compatible con ONNX.
- GPU recomendadas: no se especifican; el autor documenta ejecución en CPU de portátil (0,2 s por foto de 1280×960). Cualquier GPU consumer (por ejemplo, RTX 4090) sería sobredimensionada para este modelo.
- Cabe en GPU de consumo: sí, con enorme margen, aunque el caso de uso documentado es CPU.
- Opciones de despliegue: `onnxruntime` (CPU), servidor de modelos en Render con `MODEL_REPO=iaac-maai/concrete-evidence-stand-in` y `MODEL_FILE=best.onnx`. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 0,2 s por foto de 1280×960 en CPU de portátil según el autor; no se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Concrete Evidence stand-in (este) | YOLOv8n-seg ONNX | 13,8 MB | 1 (`skewer`) | AGPL-3.0 | Hugging Face |
| Ultralytics YOLOv8n-seg (base) | YOLOv8n-seg | no disponible en la información | 80 (COCO) | AGPL-3.0 | Ultralytics / Hugging Face |
| Modelo real de rebar de Concrete Evidence | no disponible | no disponible | no disponible | no disponible | anunciado para el 23 de noviembre de 2026; no publicado |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; el stand-in solo se ha evaluado sobre su propio conjunto de 20 fotos de brochetas.

## Limitaciones y advertencias

- Dominio extremadamente restringido: solo ha visto brochetas sobre una mesa clara. Sobre rebar, en obra o con personas no encontrará nada útil o detectará piezas erróneas. El autor advierte explícitamente: no usarlo para juzgar refuerzo real.
- Conjunto de datos minúsculo (20 fotos, una alfombrilla, una única configuración de iluminación): los resultados publicados no dicen nada sobre otras escenas.
- Detecta piezas, no fallos: las reglas de barra, atado y gancho viven en la comprobación de la aplicación (`concrete_evidence/`) y una persona debe confirmar cada fallo antes de un vertido.
- Entrada fija 640×640 (`dynamic=False`): no admite resoluciones variables sin reexportar el modelo.
- Licencia AGPL-3.0, heredada de Ultralytics YOLOv8: impone obligaciones de copyleft sobre el software que lo integre y se distribuya en red; debe revisarse antes de cualquier uso comercial.
- Riesgo de falsos positivos y negativos fuera de su dominio; no hay métricas de calibración ni de robustez publicadas.
- Sesgos conocidos: no documentados por el autor; el conjunto de entrenamiento es propio y no incluye personas ni imágenes de terceros.
- Modelo efímero: el autor indica que será sustituido por el modelo real de rebar el 23 de noviembre de 2026, por lo que no debe considerarse una dependencia estable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iaac-maai/concrete-evidence-stand-in
- Repositorio del proyecto (referenciado en la model card, ruta `concrete_evidence/onnx_seg.py`): no disponible como URL en la información proporcionada
- Ultralytics YOLOv8 (framework base): no disponible como URL en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
