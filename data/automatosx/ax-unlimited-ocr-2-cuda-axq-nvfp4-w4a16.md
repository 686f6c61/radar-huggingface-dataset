# AutomatosX/AX-Unlimited-OCR-2-CUDA-AXQ-NVFP4-W4A16

## Resumen

AX-Unlimited-OCR-2-CUDA-AXQ-NVFP4-W4A16 es una exportación cuantizada del modelo de OCR Unlimited-OCR-2 de Baidu, publicada por AutomatosX en Hugging Face. Se trata de un empaquetado experimental en formato NVFP4 (pesos de 4 bits con escalas de bloque) mediante la herramienta AXQuant, orientado a investigación y desarrollo de formatos de almacenamiento comprimido, no a uso productivo inmediato. El modelo base es un modelo de reconocimiento óptico de caracteres multilingüe de segunda generación que incorpora enrutamiento disperso SR-SWA, posiciones rotacionales conscientes de páginas y estado multipágina para procesar documentos largos.

La relevancia de esta ficha radica más en el formato que en el modelo: el repositorio demuestra un flujo de cuantización NVFP4 W4A16 (pesos en 4 bits, activaciones en BF16) con verificación de integridad de los pesos originales mediante hashes SHA-256. Sin embargo, el propio autor advierte explícitamente que no existe ningún runtime de inferencia verificado (CUDA, vLLM, SGLang, Transformers o AX Engine) capaz de cargar y ejecutar este empaquetado concreto, por lo que su utilidad práctica hoy es limitada al desarrollo de tooling y validación de formatos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | unlimited-ocr (segunda generación, con SR-SWA sparse routing y estado multipágina) |
| Parámetros totales | 3.343.978.497 (≈3,34 B) |
| Parámetros activos | no disponible (no se declara si es MoE, aunque se mencionan "matrices de experto") |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 E2M1 (pesos), escalas de bloque E4M3FN (grupo 16), escalas globales FP32, activaciones BF16 (W4A16) |
| Idiomas soportados | multilingüe (lista concreta no disponible) |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors), 2,9 GB de repo |

## Arquitectura y entrenamiento

El modelo base, baidu/Unlimited-OCR-2, es la segunda generación de la familia Unlimited-OCR de Baidu. Su arquitectura introduce varias innovaciones respecto a la v1: enrutamiento disperso SR-SWA (con 108 tensores de router/indexer DASH conservados en precisión exacta en esta exportación), posiciones rotacionales conscientes de páginas (page-aware rotary positions) y estado multipágina, lo que sugiere un diseño orientado al procesamiento de documentos largos con múltiples páginas. La presencia de "matrices de experto" en los tensores cuantizados indica un posible componente de mezcla de expertos, aunque no se declara explícitamente. El modelo incluye además codificadores de visión y un proyector, consistentes con un modelo OCR de tipo visión-lenguaje.

Respecto al entrenamiento, no hay datos disponibles: ni número de tokens, ni composición del dataset, ni técnicas de alineación (RLHF/DPO). En cuanto a la cuantización, se aplicó AXQuant RTN (round-to-nearest) sobre los pesos BF16 originales en la revisión `9cf077c4b206e0e2a31879df937b0b0bcba3661c`: 2.196 matrices de atención, MLP y experto del lenguaje se comprimieron a NVFP4 E2M1 con escalas de bloque E4M3FN de grupo 16, mientras que 623 tensores (vision encoders, proyector, normalizaciones, embeddings y cabeza de salida) se conservaron con sus valores y dtypes originales exactos.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) multilingüe sobre documentos e imágenes, heredado del modelo base Unlimited-OCR-2.
- Procesamiento de documentos multipágina, gracias a las posiciones rotacionales conscientes de páginas y al estado multipágina de la arquitectura de segunda generación.
- Manejo de documentos largos mediante enrutamiento disperso SR-SWA (sparse routing con indexer DASH).
- Arquitectura visión-lenguaje: codificadores de visión y proyector integrados en el checkpoint.
- Nota importante: ninguna capacidad de inferencia ha sido verificada para este empaquetado cuantizado concreto; las capacidades anteriores corresponden al modelo base BF16.

## Casos de uso

- Desarrollo de runtimes de inferencia para NVFP4: el empaquetado sirve como caso de prueba real para implementar soporte de NVFP4 W4A16 en motores como vLLM, SGLang o AX Engine, ya que incluye planes y manifiestos (`axquant_cuda_plan.json`, `axquant_cuda_manifest.json`) que documentan las asignaciones por tensor.
- Investigación en cuantización de modelos OCR: permite estudiar el impacto de la cuantización NVFP4 con escalas de bloque de grupo 16 sobre matrices de atención, MLP y experto, manteniendo intactos los componentes sensibles como routers e indexadores.
- Validación de integridad de pesos: el flujo de exportación incluye verificación SHA-256 contra los objetos LFS del Hub, útil como referencia para pipelines de distribución de modelos comprimidos.
- Evaluación de arquitecturas de segunda generación: el repositorio conserva el `UPSTREAM_README.md` y el código original, útil para estudiar las diferencias entre Unlimited-OCR v1 y v2 antes de intentar adaptar runtimes.
- Prototipado de despliegue en GPU con memoria limitada: con 2,9 GB de repo frente a un tamaño BF16 estimado de ~6,7 GB para 3,34 B de parámetros, el formato ilustra el ahorro de memoria potencial para inferencia en GPUs de consumo, una vez exista soporte de runtime.
- Investigación en documentos largos multipágina: el modelo base está diseñado para estado multipágina, por lo que este export puede servir de base para futuros experimentos de OCR sobre documentos extensos con memoria reducida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El propio autor indica que las verificaciones realizadas (layout de almacenamiento, hashes de origen, igualdad de tensores preservados y cobertura del índice de salida) no establecen precisión OCR, funcionalidad en documentos largos, throughput ni límites de memoria, y que la calidad no está certificada (`quality_certified=false`).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma verificada; el repo ocupa 2,9 GB, por lo que en teoría cabría en GPUs con 8 GB de VRAM o más, pero no existe runtime verificado que lo confirme.
- GPU recomendadas: no disponible. El empaquetado es NVFP4 orientado a CUDA, pero no se ha ejecutado ninguna prueba de carga o generación en GPU.
- GPUs de consumo: potencialmente viable por tamaño (2,9 GB), pero sin verificación de runtime no puede afirmarse que funcione en RTX 4090, RTX 3090 u otras.
- Opciones de despliegue: ninguna verificada. El autor indica explícitamente que no se han ejecutado pruebas con CUDA, vLLM, SGLang, Transformers ni AX Engine, y que los comandos de inferencia BF16 del modelo upstream no pueden asumirse compatibles con estos nombres de tensores empaquetados.
- Latencia y throughput: no disponibles. No se realiza ninguna afirmación de aceleración (MTP o similar).

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Licencia | Runtime verificado |
|---|---|---|---|---|
| AX-Unlimited-OCR-2-CUDA-AXQ-NVFP4-W4A16 | 3,34 B | NVFP4 W4A16 (AXQuant RTN) | MIT | No (development) |
| baidu/Unlimited-OCR-2 (base BF16) | ≈3,34 B (estimado) | BF16 | MIT | Sí (comandos upstream) |
| AutomatosX/AX-Unlimited-OCR-2 (MLX MXFP4/MXFP8) | no disponible | MXFP4/MXFP8 | MIT | No incluido en este repo |

No hay datos de rendimiento comparables disponibles para ninguna de las variantes.

## Limitaciones y advertencias

- Sin runtime verificado: no existe ningún comando de inferencia probado para este empaquetado concreto; es un export de desarrollo (`status=development`, `runtime_verified=false`).
- Calidad no certificada: las verificaciones de almacenamiento no garantizan precisión OCR, funcionalidad en documentos largos, throughput ni límites de memoria.
- Incompatibilidad arquitectónica potencial: Unlimited-OCR-2 comparte `model_type=unlimited-ocr` con la v1 pero difiere arquitecturalmente; los runtimes existentes para v1 no servirán sin adaptación.
- Nombres de tensores empaquetados: los comandos de inferencia BF16 upstream no pueden asumirse compatibles con los nombres de tensores de este pack; el código original incluido no está adaptado para consumir tensores NVFP4.
- Sin variantes MLX: las versiones MXFP4/MXFP8 para Apple Silicon no están incluidas en este repositorio.
- Sesgos y riesgo de alucinación: no hay información específica publicada para este modelo; al tratarse de un modelo OCR visión-lenguaje, los riesgos habituales de errores de transcripción y alucinación de texto no reconocido aplican al modelo base, pero no han sido evaluados aquí.
- Licencia: MIT, tanto en el export como en el upstream de Baidu, por lo que no hay restricciones de uso comercial conocidas, aunque conviene revisar el aviso de licencia de Baidu preservado en el repositorio.
- Adopción marginal: 35 descargas y 1 like indican un uso muy reducido y ausencia de validación comunitaria.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/AutomatosX/AX-Unlimited-OCR-2-CUDA-AXQ-NVFP4-W4A16
- Modelo base (Baidu): https://huggingface.co/baidu/Unlimited-OCR-2
- Revisión del modelo base usada como fuente: https://huggingface.co/baidu/Unlimited-OCR-2/tree/9cf077c4b206e0e2a31879df937b0b0bcba3661c
- Paper, demo y repositorio de código adicional: no disponibles
