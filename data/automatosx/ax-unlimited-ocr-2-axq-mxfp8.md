# AutomatosX/AX-Unlimited-OCR-2-AXQ-MXFP8

## Resumen

`AutomatosX/AX-Unlimited-OCR-2-AXQ-MXFP8` no es un modelo ejecutable, sino un **pack de almacenamiento de referencia** derivado de `baidu/Unlimited-OCR-2` (un modelo OCR multimodal de ~3,34 B de parámetros con arquitectura MoE y atención SR-SWA). El autor, AutomatosX, lo ha exportado con su herramienta AXQuant para desarrollo de formato: 2.196 matrices de atención, MLP y expertos se recodifican en MXFP8 nativo de MLX con grupo de 32, mientras los 623 tensores restantes (encoder de visión, proyector, normas, embeddings, cabeza de salida y los 108 tensores del router/indexer DASH de SR-SWA) se conservan con sus valores y dtypes originales.

El resultado ocupa 4,167 GB de pesos, equivalentes a 9,969099 BPW medidos (incluyendo pesos protegidos, escalas y cabeceras de Safetensors). La model card es explícita: `standard_inference=false`, los perfiles estáticos de oMLX y MTPLX informan `unsupported`, y no existe ningún comando de inferencia soportado, porque el grafo SR-SWA, las posiciones rotatorias page-aware y el ciclo de vida de KV multi-página no están implementados en la ruta actual de MLX.

Su relevancia ahora es de tipo infraestructura: sirve como artefacto reproducible para auditar el layout empaquetado, validar decodificadores MXFP8 y preparar la futura integración del runtime, no para extraer texto de documentos. El autor no adjunta ninguna certificación de calidad ni afirmación sobre OCR, memoria, velocidad o MTP.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con SR-SWA y router/indexer DASH; encoder de visión + proyector (heredada del modelo base) |
| Parámetros totales | 3.343.978.497 (3,34 B) |
| Parámetros activos | no disponible (el modelo base es MoE, pero no se publica el número de expertos activos) |
| Longitud de contexto | no disponible (el modelo base está orientado a documentos de varias páginas en una sola pasada; no se especifica la ventana en tokens) |
| Tipos de cuantización | MXFP8 con grupo de 32 en 2.196 matrices (arrays U32 empaquetados + escalas U8 E8M0, sin sesgos afines); 623 tensores en su dtype original |
| Idiomas soportados | multilingüe (lista concreta de idiomas no disponible) |
| Licencia | MIT (se conserva el aviso oficial de Baidu; el código original mantiene sus notas) |
| Formato de pesos | safetensors con empaquetado MLX-native MXFP8; incluye ficheros Python upstream sin modificar como material de archivo |
| Tamaño de pesos | 4,167 GB (9,969099 BPW medidos; el repo completo ocupa 4,2 GB) |
| Estado de ejecución | `standard_inference=false`; oMLX y MTPLX reportan `unsupported` |

## Arquitectura y entrenamiento

El modelo base, `baidu/Unlimited-OCR-2`, es un sistema OCR de ~3,34 B de parámetros con mezcla de expertos y atención de ventana deslizante SR-SWA, complementado por un router/indexer DASH (108 tensores en el checkpoint) y un encoder de visión con proyector. El pipeline está pensado para procesar documentos completos en una sola pasada, lo que exige posiciones rotatorias conscientes de la página y una gestión del KV cache a lo largo de varias páginas. No se dispone de datos sobre volumen de tokens de entrenamiento, composición del corpus ni si hubo RLHF/DPO.

Este repositorio concreto no entrena nada: es una exportación de formato. El autor verificó los pesos BF16 originales contra los objetos LFS SHA-256 fijados en el Hub, en la revisión `9cf077c4b206e0e2a31879df937b0b0bcba3661c`. La recodificación afecta a 2.196 matrices (atención, MLP y expertos), que pasan a MXFP8 con grupo de 32 conservando el nombre `.weight` original como U32 y añadiendo `.scales` con un exponente E8M0 por grupo; los expertos mantienen nombres y layout individuales. Los 623 tensores restantes se copian con igualdad exacta de valores y dtypes, y la configuración fuente se preserva añadiendo metadatos de empaquetado y el marcador `axquant_storage_only`.

La validación declarada cubre los 5.015 tensores indexados (formas y dtypes de almacenamiento), la igualdad exacta de todos los tensores preservados y de los campos de config, y la decodificación independiente de 24 muestras de matriz comparadas con la desquantización y la multiplicación de matrices cuantizadas públicas de MLX. Eso verifica únicamente el almacenamiento y las operaciones matriciales, no el comportamiento del modelo. El plan (`axquant_plan.json`) es manual y explícitamente no medido: la cuantización no es calibración ni un resultado de calidad.

## Capacidades

Del modelo base (no verificadas en este pack, que no puede ejecutarse):

- OCR de documentos completos en una sola pasada, con gestión multi-página del KV cache.
- Procesamiento multimodal: entrada de imagen de página a través del encoder de visión y el proyector.
- Cobertura multilingüe declarada por el autor del modelo base.
- Routing condicional por token mediante mezcla de expertos y attention de ventana deslizante SR-SWA para secuencias largas.

De este repositorio en concreto:

- Almacenamiento reproducible de pesos en MXFP8 con grupo de 32, con escalas E8M0 separadas.
- Trazabilidad criptográfica: `SOURCE_SHA256SUMS.txt`, `axquant_source_binding.json` y `axquant_manifest.json` enlazan la salida con la identidad estructural del origen.
- Inspección y decodificación de matrices individuales con herramientas MLX estándar.
- Ninguna capacidad de inferencia, tool calling, agentes ni generación de texto: no hay comando soportado ni loader compatible incluido.

## Casos de uso

- Desarrollo y validación de la herramienta AXQuant: el pack actúa como referencia fija para probar codificadores y decodificadores MXFP8 de grupo 32 sobre un modelo MoE multimodal real, con 2.196 matrices de casuística variada (atención, MLP y expertos con nombres y layout propios).
- Auditoría de procedencia de pesos: `SOURCE_SHA256SUMS.txt` y `axquant_source_binding.json` permiten comprobar que los 623 tensores preservados coinciden exactamente con el BF16 original fijado en una revisión concreta del Hub, algo útil en revisiones de seguridad de la cadena de suministro.
- Integración continua de formatos: usar los hashes del manifiesto como golden test para detectar regresiones no intencionadas cuando evolucione el codificador de AXQuant.
- Implementación de runtimes MLX para SR-SWA: un equipo que desarrolle el grafo SR-SWA, las posiciones rotatorias page-aware y el ciclo de vida de KV multi-página dispone aquí de un caso de prueba con 5.015 tensores indexados y dtypes documentados, aunque necesitará su propia validación de layout y tests de pack exacto.
- Distribución de bajo peso en espejos internos: 4,167 GB frente a los aproximadamente 6,7 GB que ocuparían los mismos 3,34 B de parámetros en BF16 (cálculo estimado, no medido), lo que reduce el coste de replicar el snapshot en almacenamiento de archivo.
- Investigación sobre cuantización de MoE multimodales: comparar el BPW efectivo (9,969099) y el tratamiento diferenciado de routers, normas y cabezas frente a otros packs de la misma familia (NVFP4 en CUDA, MXFP4 en MLX).
- Base para un futuro pipeline OCR documental (digitalización de expedientes, facturación o archivo administrativo) solo cuando exista un runtime compatible; hoy ese uso no es posible con este repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no adjunta ninguna métrica de calidad OCR, comportamiento en documentos largos, cota de memoria, velocidad ni MTP, y declara explícitamente que no hay certificación de calidad asociada.

Las únicas comprobaciones publicadas son de formato, no de rendimiento:

| Comprobación | Alcance | Resultado |
|---|---|---|
| Indexado de tensores de salida | 5.015 tensores (formas y dtypes de almacenamiento) | Verificado |
| Igualdad de tensores preservados y campos de config | 623 tensores + config fuente completa | Igualdad exacta |
| Decodificación de matrices | 24 muestras comparadas con desquantización y matmul cuantizada de MLX | Correcta (solo almacenamiento/operaciones) |
| Perfiles estáticos de runtime | oMLX y MTPLX | `unsupported` |

## Requisitos de hardware

- VRAM para inferencia: no disponible y no aplicable; no existe ruta de ejecución para este pack. Como referencia de tamaño, los pesos empaquetados suman 4,167 GB.
- VRAM estimada del modelo base en BF16: aproximadamente 6,7 GB solo para pesos (3,34 B × 2 bytes, cálculo estimado), a los que habría que sumar activaciones, KV multi-página y encoder de visión; no hay medición publicada.
- GPU recomendadas: no disponible. Cualquier GPU con 8 GB o más puede almacenar o inspeccionar el pack, pero no ejecutarlo.
- Cabe en GPU de consumo: el almacenamiento sí; la inferencia no está soportada en ninguna GPU.
- Opciones de despliegue: ninguna validada. No se ejecutó carga ni generación con MLX-LM, MLX-VLM, AX Engine, oMLX ni MTPLX. vLLM, llama.cpp, Ollama y TGI no contemplan el grafo SR-SWA ni el layout MXFP8 empaquetado con escalas E8M0.
- Latencia y throughput: no disponible; el autor no formula ninguna afirmación al respecto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Inferencia | Licencia |
|---|---|---|---|---|---|
| `baidu/Unlimited-OCR-2` (origen) | 3,34 B (MoE) | no disponible | safetensors BF16 | Sí, con el runtime original | MIT |
| `AutomatosX/AX-Unlimited-OCR-2-AXQ-MXFP8` (este) | 3,34 B (MoE) | no disponible | safetensors MXFP8 empaquetado, 9,97 BPW | No soportada (`standard_inference=false`) | MIT |
| Pack AXQ CUDA NVFP4 de la colección Unlimited-OCR | no disponible | no disponible | NVFP4 | no disponible | no disponible |
| Pack AXQ MLX MXFP4 de la colección Unlimited-OCR | no disponible | no disponible | MXFP4 | no disponible | no disponible |
| `DeepSeek-OCR-2` (referencia citada en la colección OCR) | no disponible | no disponible | no disponible | no disponible | no disponible |

Los packs NVFP4/MXFP4 se mencionan en la descripción pública de la colección de AutomatosX, pero no se han aportado sus especificaciones ni su estado de ejecución; no se dispone de cifras de rendimiento comparables entre ninguna de estas variantes.

## Limitaciones y advertencias

- El repositorio no permite inferencia: no hay comando soportado, `standard_inference=false` y los perfiles de oMLX y MTPLX lo marcan como `unsupported`.
- Los ficheros Python upstream incluidos son material de archivo sin modificar; su loader BF16 no puede asumirse compatible con el layout empaquetado MXFP8.
- Cualquier integración futura en un runtime requerirá validación de layout propia y tests de pack exacto; no se ha ejecutado ninguna carga completa del modelo.
- No existe certificación de calidad: la cuantización es un plan manual y no medido, no una calibración, y no hay afirmaciones sobre OCR, documentos largos, memoria, velocidad o MTP.
- Riesgo de alucinación y sesgos del modelo base: no evaluados ni documentados en la información disponible.
- Cobertura idiomática: se declara multilingüe sin lista de idiomas, sin métricas por idioma y sin evaluación de casos límite.
- Restricciones de licencia: MIT permite uso comercial, pero se hereda el aviso oficial de Baidu y las notas del código original deben conservarse; conviene revisar `LICENSE` y `UPSTREAM_README.md` antes de redistribuir.
- El pack solo preserva exactamente 623 tensores; los 2.196 restantes son una recodificación con pérdida de precisión respecto al BF16 original, cuyo impacto en calidad es desconocido.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la ficha, sin revisión independiente de terceros.

## Enlaces

- Repositorio del pack: https://huggingface.co/AutomatosX/AX-Unlimited-OCR-2-AXQ-MXFP8
- Modelo base: https://huggingface.co/baidu/Unlimited-OCR-2/tree/9cf077c4b206e0e2a31879df937b0b0bcba3661c
- Colección Unlimited-OCR de AutomatosX: https://huggingface.co/collections/AutomatosX/unlimited-ocr
- Colección OCR de AutomatosX: https://huggingface.co/collections/AutomatosX/ocr
- Repositorio GitHub del modelo base: https://github.com/baidu/Unlimited-OCR
- Artículo técnico divulgativo sobre Unlimited-OCR-2 (SR-SWA, 3B, MIT): https://explainx.ai/blog/baidu-unlimited-ocr-2-sr-swa-3b-mit-hundred-page-document-parsing-how-to-run-2026
- Calendario de lanzamientos de modelos de IA (referencia contextual): https://www.scriptbyai.com/ai-model-release-calendar/
