# Greenstone1907/betimgo-modeller

## Resumen

`Greenstone1907/betimgo-modeller` no es un modelo único, sino un repositorio agregado de tres modelos de terceros convertidos al formato MNN (Alibaba) para su ejecución en dispositivo (on-device) en Android. Lo mantiene el usuario Greenstone1907 como parte de Betimgo, un asistente de descripción del entorno para personas ciegas y con baja visión que usa la cámara del teléfono o las gafas Ray-Ban Meta. El repositorio no está afiliado a los autores originales de los modelos.

Los tres componentes cubren tareas distintas: `moge2/` proporciona profundidad métrica (distancia a los objetos) a partir de MoGe-2 ViT-S de Microsoft; `owlv2_640/` implementa detección de objetos de vocabulario abierto rápida a partir de OWLv2 de Google; y `wevis_q8v8/` aporta un buscador de objetos basado en visión-lenguaje más preciso, derivado de WeVisOne-VL-2B de Tencent (a su vez basado en Qwen3-VL-2B-Instruct).

Su relevancia es práctica: demuestra un pipeline completo de percepción visual cuantizado en fp16/int8 que cabe en un teléfono, con verificación de integridad por SHA-256 de cada fichero. No hay pesos en safetensors ni GGUF, ni benchmarks publicados; el valor está en el empaquetado MNN listo para producción móvil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoGe-2 ViT-S (profundidad); OWLv2 base patch16 ensemble (deteccion); WeVisOne-VL-2B sobre Qwen3-VL-2B-Instruct (VLM) |
| Parametros totales | No disponible de forma agregada; WeVisOne-VL-2B ≈ 2B; MoGe-2 ViT-S y OWLv2-base no declarados en la model card |
| Parametros activos | No aplica (no son modelos MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | fp16 (moge2 y owlv2); int8 con block size 64 en LM y vision encoder, embeddings en bfloat16 (wevis) |
| Idiomas soportados | No disponible |
| Licencia | MIT y Apache-2.0 (cada carpeta incluye la licencia de su modelo origen) |
| Formato de pesos | MNN (`.mnn`, `.mnn.weight`), `embeddings_bf16.bin`, `tokenizer.mtok`, `vocab.json`, `merges.txt` |

## Arquitectura y entrenamiento

El repositorio no entrena modelos: convierte y empaqueta pesos existentes con MNN 3.6.2. `moge2/` exporta la red a ONNX con forma de entrada fija y 2.400 tokens (588x798 en 3:4 y 518x910 en 9:16), sin antialiasing y con el remapeo "exp" de MoGe aplicado; la recuperación de desplazamiento y la estimación focal se ejecutan en la app, no en el modelo. `owlv2_640/` separa el codificador de texto (`owlv2_metin_f16.mnn`) del codificador visual y las cabezas de caja/clase, reduce la entrada de 960x960 a 640x640 y omite la cabeza de objectness. `wevis_q8v8/` usa el exportador LLM de MNN con cuantización int8 en el modelo de lenguaje y en el codificador visual, embeddings en bfloat16 y sin decodificador de máscaras.

No se documentan datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF/DPO; esa información corresponde a los modelos originales y no se reproduce aquí. La innovación técnica relevante es el empaquetado: formas fijas para evitar recompilación en móvil, separación de codificador de texto y verificación criptográfica por SHA-256 de cada artefacto.

## Capacidades

- Estimación de profundidad métrica (distancia real a los objetos) mediante MoGe-2 ViT-S, con mapa de puntos, probabilidad de máscara y escala métrica como salidas.
- Detección de objetos de vocabulario abierto con OWLv2 a partir de embeddings de texto precalculados; admite consultas en lenguaje natural.
- Búsqueda de objetos asistida por visión-lenguaje con WeVisOne-VL-2B para casos que requieren mayor precisión.
- Ejecución completamente on-device en Android mediante MNN, sin dependencia de servidores.
- Integración con cámara del teléfono y con gafas Ray-Ban Meta como fuente de imagen.
- Verificación de integridad de los pesos descargados por la app (SHA-256 por fichero).
- No se declaran capacidades de tool calling, agentes, audio ni modo thinking en la información disponible.

## Casos de uso

- Descripción del entorno para personas ciegas o con baja visión: el pipeline combina profundidad de MoGe-2 y detección de OWLv2/WeVis para verbalizar qué hay delante y a qué distancia, ejecutándose en el propio teléfono.
- Localización de objetos concretos solicitados por voz ("busca mi taza"): OWLv2 acepta embeddings de texto arbitrarios y devuelve cajas, lo que permite búsquedas de vocabulario abierto sin reentrenar.
- Navegación asistida en interiores: la profundidad métrica permite estimar distancias a obstáculos y generar avisos de proximidad con latencia local, sin enviar imágenes a la nube.
- Asistencia con gafas Ray-Ban Meta: la app usa la cámara de las gafas como entrada y ejecuta los modelos MNN en el teléfono emparejado, manteniendo la privacidad del flujo de vídeo.
- Verificación de precisión en escenas complejas: cuando OWLv2 a 640x640 no basta, WeVisOne-VL-2B aporta razonamiento visión-lenguaje para desambiguar objetos similares.
- Distribución de modelos en producción móvil: el repositorio sirve como CDN de artefactos MNN con hashes publicados, lo que permite a la app descargar, verificar y actualizar pesos de forma segura.
- Prototipado de accesibilidad en Android: desarrolladores pueden reutilizar los ficheros MNN y el esquema de verificación para construir asistentes similares sin pasar por un pipeline de conversión propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 3,5 GB en total; el componente mayor es `wevis_q8v8` (≈1,83 GB de pesos LM int8 + ≈440 MB de vision encoder + ≈625 MB de embeddings bf16), seguido de `moge2` (≈139 MB por variante) y `owlv2_640` (≈177 MB + ≈127 MB del codificador de texto).
- Orientación: ejecución en Android vía MNN, no en GPU de escritorio; los requisitos son de RAM y almacenamiento del teléfono, no de VRAM.
- GPU recomendadas: no aplica en el despliegue previsto; para experimentación en servidor se puede usar cualquier GPU compatible con MNN, sin datos de rendimiento publicados.
- ¿Cabe en GPU consumer? Los artefactos son ligeros (el mayor ronda 1,8 GB), por lo que en principio caben en GPUs consumer, aunque no es el escenario objetivo ni se documenta soporte.
- Opciones de despliegue: MNN (runtime oficial); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que los formatos son específicos de MNN.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| betimgo-modeller (este repo) | Profundidad + deteccion + VLM, on-device | Agregado, ≈2B en el componente VLM | No disponible | MIT + Apache-2.0 | MNN |
| MoGe-2 ViT-S (origen) | Profundidad metrica | No disponible en la ficha | No disponible | MIT | Safetensors/PyTorch |
| OWLv2 base patch16 ensemble (origen) | Deteccion vocabulario abierto | No disponible en la ficha | No disponible | Apache-2.0 | Safetensors/PyTorch |
| WeVisOne-VL-2B (origen) | Vision-lenguaje / busqueda de objetos | ≈2B | No disponible | Apache-2.0 | Safetensors/PyTorch |

La comparativa directa con alternativas on-device (por ejemplo, otras conversiones MNN de detectores o VLMs pequeños) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: son conversiones de terceros; cualquier sesgo o alucinación proviene de los modelos originales y no se analiza en la model card.
- Riesgo de alucinación en el componente VLM (WeVisOne-VL-2B) al describir escenas; conviene validar sus salidas con la profundidad y las detecciones geométricas.
- Formas de entrada fijas (588x798, 518x910, 640x640) que obligan a redimensionar en la app y pueden degradar la precisión en escenas muy alargadas o con objetos pequeños.
- `owlv2_640` omite la cabeza de objectness y usa entrada reducida respecto al original (960x960), lo que puede afectar la calidad de las detecciones.
- `wevis_q8v8` no incluye el decodificador de máscaras: no produce segmentación, solo detección/asociación.
- Idiomas soportados no declarados; el tokenizador y el vocabulario de OWLv2 provienen del modelo original en inglés, lo que puede limitar consultas en castellano.
- Licencia "other" con nombre `mit-and-apache-2.0`: es necesario revisar la licencia de cada carpeta antes de uso comercial; el repositorio incluye los textos originales sin modificaciones.
- Sin benchmarks ni métricas de latencia publicadas; el rendimiento real depende del SoC del teléfono y del runtime MNN.
- El repositorio no está afiliado a Microsoft, Google ni Tencent; no hay soporte oficial de los autores originales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Greenstone1907/betimgo-modeller
- MoGe-2 ViT-S (origen): https://huggingface.co/Ruicheng/moge-2-vits-normal
- Repositorio de código MoGe: https://github.com/microsoft/MoGe
- OWLv2 base patch16 ensemble (origen): https://huggingface.co/google/owlv2-base-patch16-ensemble
- WeVisOne-VL-2B (origen): https://huggingface.co/tencent/WeVisOne-VL-2B
- Runtime MNN: https://github.com/alibaba/MNN
