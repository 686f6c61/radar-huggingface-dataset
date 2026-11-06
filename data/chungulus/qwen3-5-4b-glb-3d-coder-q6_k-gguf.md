# Chungulus/Qwen3.5-4B-GLB-3D-Coder-Q6_K-GGUF

## Resumen

Qwen3.5-4B-GLB-3D-Coder-Q6_K-GGUF es una cuantización comunitaria en formato GGUF del modelo ccore/Qwen3.5-4B-GLB-3D-Coder, un fine-tune de Qwen3.5-4B especializado en la generación de activos 3D y código Three.js/GLB. Lo publica el usuario Chungulus como artefacto independiente, sin vinculación con Qwen ni con CCORE, y está pensado para su uso con llama.cpp. El modelo base fue publicado por CCORE el 5 de noviembre de 2026 y se distingue de su anterior modelo de escenas Three.js por centrarse en la codificación de activos GLB.

El checkpoint original contiene 4.539.265.536 parámetros (pesos de texto en F32 y pesos de visión en BF16). Esta versión exporta la red de texto de 4.205.751.296 parámetros a F16 (conservando tensores sensibles en F32) y la cuantiza de forma independiente a Q6_K, manteniendo el proyector de visión original `mmproj-Qwen3.5-4B-BF16.gguf` sin modificar. No se ha re-cuantizado ningún checkpoint de baja precisión ni se ha empleado calibración o matriz de importancia.

Es relevante para desarrolladores que necesiten ejecutar localmente un modelo pequeño (4B) capaz de generar HTML con Three.js y activos GLB exportables, con soporte de entrada de imagen a texto. La licencia Apache 2.0 permite uso comercial manteniendo atribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), con torre de visión y proyector multimodal; no se detalla más en la información disponible |
| Parámetros totales | 4.205.751.296 (red de texto en este GGUF); 4.539.265.536 en el checkpoint original incluyendo visión |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible de forma oficial; los ejemplos de la model card usan `-c 16384` y `-c 8192` |
| Tipos de cuantización | Q6_K (esta versión); proyector de visión en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con `mmproj` separado en BF16 para visión) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.5-4B, un transformer multimodal con torre de visión y proyector, fine-tuneado por CCORE para la generación de código de activos 3D (Three.js y exportación GLB). El checkpoint original mezcla pesos de texto en F32 y de visión en BF16; esta cuantización exporta la red de texto a F16 conservando tensores sensibles en F32 y luego la cuantiza a Q6_K. La predicción multi-token (MTP) no se exporta, y la model card recomienda desactivar MTP/decodificación especulativa en los frontends que intenten activarla.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en el fine-tune de CCORE. La model card del cuantizador no aporta esos datos y remite a la model card original para el prompt de sistema de generación de activos y los parámetros de muestreo recomendados (temperatura 0,8, top-k 40, top-p 0,95, min-p 0, repeat penalty 1 y thinking activado).

## Capacidades

- Generación de código Three.js en un único archivo HTML completo, incluyendo escenas y botones de exportación GLB.
- Generación de activos 3D orientados a GLB (codificación de activos, según la denominación del modelo).
- Entrada imagen-texto a texto: comprensión de imágenes mediante el proyector `mmproj` incluido.
- Salida estructurada en JSON (verificado en las pruebas del cuantizador).
- Razonamiento aritmético básico en tiempo de ejecución nativo (verificado).
- Modo thinking (razonamiento explícito) disponible y recomendado por el creador para generación de activos.
- Conversacional multi-turno (pipeline `conversational`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Generación de escenas Three.js listas para producción: el modelo produce un archivo HTML completo con la escena y un botón de exportación GLB, lo que permite prototipar visores 3D sin escribir el código a mano; encaja en flujos de trabajo de diseño web y demos interactivas.
- Creación de activos GLB para pipelines de contenido 3D: útil para generar geometrías sencillas (por ejemplo, un cubo low-poly) y exportarlas como GLB para su importación en motores o visores, reduciendo el trabajo manual en tareas repetitivas.
- Asistente de código 3D en el editor: al ejecutarse en local con llama.cpp, puede integrarse en el IDE o en un script CLI para autocompletar o generar fragmentos de Three.js con contexto de hasta 16K tokens en los ejemplos de la model card.
- Descripción y análisis de imágenes en flujos de documentación técnica: con el proyector de visión incluido, puede describir capturas o diagramas (por ejemplo, identificar el cuadrado central de color en una imagen) y volcar la descripción en JSON para su procesamiento posterior.
- Validación automatizada de código generado: su salida JSON y su capacidad de generar HTML verificable permiten integrarlo en pipelines de CI que comprueben sintaxis JavaScript y el uso esperado de la API de Three.js/GLTFExporter, como ya hicieron las pruebas del cuantizador.
- Educación y experimentación con modelos multimodales pequeños: al ocupar 4,1 GB en Q6_K y requerir solo llama.cpp reciente, es adecuado para entornos de aprendizaje donde se quiera explorar generación de código 3D y visión sin infraestructura de GPU de gran escala.
- Prototipado rápido de herramientas internas de generación de assets: equipos de diseño pueden generar variantes de escenas y activos con parámetros de muestreo fijos (temperatura 0,8, top-k 40, top-p 0,95) y revisar el resultado en el navegador antes de integrarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta comprobaciones funcionales acotadas: aritmética nativa, salida JSON y dos casos de comprensión de imagen con el proyector incluido (identificación del cuadrado central en fixtures de colores rojo/azul con 1024 tokens de imagen, temperatura 0 y semilla 42), además de la validación de sintaxis JavaScript y de las API de Three.js/GLTFExporter del ejemplo generado. No se probaron renderizado en navegador, descarga/importación real de GLB, vídeo, comportamiento en contexto completo ni precisión en benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 4,1 GB en Q6_K; se necesita margen adicional para el contexto (KV cache) y para el proyector de visión BF16. Con 16K de contexto conviene disponer de al menos 8-10 GB de VRAM en total, aunque no se dispone de una cifra oficial.
- GPU recomendadas: no hay recomendaciones oficiales en la información disponible; por tamaño, cabe en GPU de consumo como RTX 3060 12 GB, RTX 4070, RTX 4090, y en GPU de datacenter como A100 o H100 con holgura.
- Cabe en GPU de consumo: sí, por el tamaño del archivo (4,1 GB) y el rango de 4B parámetros; se recomienda al menos 8 GB de VRAM para contexto moderado.
- Opciones de despliegue: llama.cpp (build probado commit `6414d5b0c9e5895473036c90c2bd305ce4ceccc4`), con `llama-completion` y `llama-mtmd-cli` para visión. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Chungulus/Qwen3.5-4B-GLB-3D-Coder-Q6_K-GGUF (este) | 4.205.751.296 (texto) | no disponible (ejemplos a 16K) | GGUF Q6_K + mmproj BF16 | Apache 2.0 | Cuantización comunitaria del fine-tune de CCORE orientado a GLB |
| Chungulus/Qwen3.5-4B-3D-Coder-Q6_K-GGUF | 4.205.751.296 (texto) | no disponible | GGUF Q6_K + mmproj BF16 | Apache 2.0 | Cuantización del modelo anterior de escenas Three.js de CCORE, no de activos GLB |
| prithivMLmods/Qwen3.5-4B-3D-Coder-GGUF | 4B | no disponible | GGUF (vía Transformers) | no disponible | Otra cuantización comunitaria del modelo 3D-Coder de CCORE |
| ccore/Qwen3.5-4B-GLB-3D-Coder (base) | 4.539.265.536 (incluye visión) | no disponible | safetensors (F32/BF16) | Apache 2.0 | Checkpoint original de CCORE, sin cuantizar |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Las comprobaciones del cuantizador son funcionales y breves: no se probaron renderizado en navegador, descarga o importación real del GLB, vídeo, comportamiento en contexto completo ni precisión en benchmarks.
- La comprensión de imágenes es evidencia limitada y no garantiza un grounding fiable; el propio autor lo advierte.
- El caso inicial de 256 tokens de imagen planteaba una pregunta ambigua ("large square") y no fijaba parámetros de muestreo; el resultado se conserva junto a las pruebas posteriores más rigurosas.
- No se ha usado calibración ni matriz de importancia en la cuantización, lo que puede afectar a la fidelidad respecto al checkpoint original en algunas capas.
- La predicción multi-token (MTP) no está exportada; hay que desactivar MTP/decodificación especulativa en los frontends que intenten habilitarla.
- Se requiere una build reciente de llama.cpp compatible con Qwen3.5 (probada: commit `6414d5b0c9e5895473036c90c2bd305ce4ceccc4`).
- No se dispone de información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse la licencia y la atribución originales; el modelo se basa en Qwen/Qwen3.5-4B y fue fine-tuneado de forma independiente por CCORE.
- Es un artefacto comunitario, no una publicación oficial de Qwen ni de CCORE; conviene inspeccionar y probar los activos generados en el editor antes de usarlos en producción.

## Enlaces

- Hugging Face (este GGUF): https://huggingface.co/Chungulus/Qwen3.5-4B-GLB-3D-Coder-Q6_K-GGUF
- Modelo base: https://huggingface.co/ccore/Qwen3.5-4B-GLB-3D-Coder
- Model card original del checkpoint: https://huggingface.co/ccore/Qwen3.5-4B-GLB-3D-Coder/blob/8f32a199f8b22fe3157b9c5c8b42b052a0750dd3/README.md
- Checkpoint original (árbol de archivos): https://huggingface.co/ccore/Qwen3.5-4B-GLB-3D-Coder/tree/8f32a199f8b22fe3157b9c5c8b42b052a0750dd3
- Cuantización del modelo anterior de escenas Three.js: https://huggingface.co/Chungulus/Qwen3.5-4B-3D-Coder-Q6_K-GGUF
- Otra cuantización comunitaria: https://huggingface.co/prithivMLmods/Qwen3.5-4B-3D-Coder-GGUF
