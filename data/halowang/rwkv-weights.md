# HaloWang/rwkv-weights

## Resumen

HaloWang/rwkv-weights es un repositorio de distribución de pesos cuantizados del modelo RWKV-7 (familia G1k) orientado a inferencia en el borde ("edge-inference"). No se trata de un modelo entrenado por el autor del repositorio, sino de un catálogo de artefactos derivados de los checkpoints oficiales RWKV-7 G1k con fecha 2026-09-30 y una longitud de contexto de 25.600 tokens. El repositorio publica 40 artefactos con recetas de cuantización distintas para múltiples backends: MLX, CoreML, llama.cpp, WebRWKV, Palm, QNN y MediaTek.

La relevancia del repositorio radica en que empaqueta un modelo de arquitectura RWKV (recurrente lineal, sin atención cuadrática) en formatos listos para ejecutarse en macOS, iOS, Android y dispositivos con NPU de Qualcomm y MediaTek, algo poco habitual en el ecosistema de pesos abiertos. La versión actual está pensada para RWKV Chat 4.8.5 y se distribuye con licencia Apache 2.0.

El tamaño de pesos declarado en safetensors es de 1.527.799.808 parámetros, aunque el catálogo cubre variantes de 1.5B, 2.9B, 7.2B y 13.3B. El repositorio ocupa 720,4 GB en total, coherente con la acumulación de 40 artefactos en múltiples formatos y niveles de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RWKV-7 (recurrente lineal, familia G1k) |
| Parametros totales | 1.527.799.808 (variante 1.5B); el catálogo incluye 1.5B, 2.9B, 7.2B y 13.3B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 25.600 tokens |
| Tipos de cuantizacion | W6 / group 64 (MLX); otras recetas en CoreML, llama.cpp, WebRWKV, Palm, QNN y MediaTek según manifiesto |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, MLX, CoreML, QNN, MediaTek, entre otros |

## Arquitectura y entrenamiento

RWKV-7 es una arquitectura recurrente lineal que sustituye la atención cuadrática de los transformers por una formulación recurrente con estado, lo que permite inferencia con coste lineal en la longitud de secuencia y memoria constante respecto al contexto. La familia G1k corresponde a los checkpoints publicados con fecha 2026-09-30 y contexto de 25.600 tokens. El repositorio no documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esa información corresponde a los checkpoints originales de RWKV y no está recogida en la model card.

La innovación técnica destacable de este repositorio no está en el entrenamiento sino en la distribución: publica un manifiesto inmutable (`manifests/rwkv7/chat/g1k-20260930-ctx25600-4.8.5-20261010.json`) que lista los 40 artefactos con recetas de cuantización, límites de plataforma y chip, tamaños, hashes SHA-256 y revisiones congeladas de los espejos. El paquete MLX incluye la configuración usada por el runtime Swift, lo que facilita el despliegue en macOS e iOS sin ajustes manuales. También se mantienen releases históricas (G1i, G1j) para reproducibilidad.

## Capacidades

- Generación de texto conversacional: el catálogo se distribuye bajo la ruta `chat`, orientado a diálogo multi-turno.
- Contexto largo de 25.600 tokens, adecuado para conversaciones extensas y documentos de tamaño medio.
- Inferencia en el borde: artefactos específicos para macOS, iOS, Android, WebRWKV (navegador), Palm, QNN (Qualcomm) y MediaTek.
- Compatibilidad con llama.cpp y GGUF, lo que habilita despliegue en CPU y GPU de consumo.
- Integración con RWKV Chat 4.8.5 mediante el catálogo de la aplicación.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible.
- Modo thinking explícito: no disponible.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Asistente conversacional en iOS y macOS: los paquetes MLX en W6/group 64 para 1.5B, 2.9B, 7.2B y 13.3B permiten integrar un chat local en aplicaciones Swift sin depender de la nube, seleccionando el tamaño según la memoria disponible del dispositivo.
- Inferencia en navegador con WebRWKV: el artefacto WebRWKV permite ejecutar el modelo directamente en el cliente, útil para demos interactivas o asistentes embebidos en páginas web sin backend.
- Despliegue en Android con NPU: los artefactos QNN (Qualcomm) y MediaTek están pensados para acelerar la inferencia en móviles de gama alta con NPU dedicada, reduciendo consumo y latencia frente a CPU.
- Procesamiento de documentos largos: con 25.600 tokens de contexto, el modelo puede resumir o extraer información de contratos, informes o hilos de correo de extensión media en una sola pasada.
- Sustitución de transformers en entornos con memoria limitada: la naturaleza recurrente de RWKV-7 mantiene estado constante respecto al contexto, lo que encaja en dispositivos con RAM restringida donde un transformer equivalente no cabría.
- Reproducibilidad de experimentos: los manifiestos inmutables con hashes SHA-256 y revisiones congeladas permiten reconstruir exactamente el mismo artefacto en pipelines de evaluación o auditoría.
- Distribución multi-backend en una organización: el catálogo unificado evita mantener conversiones propias para cada plataforma (llama.cpp, CoreML, MLX, QNN) alineando versiones y cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para la variante 1.5B: en torno a 1,5-2 GB en W6/group 64 (MLX), según el manifiesto de artefactos.
- Variantes 2.9B, 7.2B y 13.3B: el consumo crece proporcionalmente; el manifiesto G1k documenta límites de plataforma y chip para cada artefacto.
- GPU recomendadas: no disponibles de forma explícita; el foco del repositorio es edge (Apple Silicon, NPU Qualcomm/MediaTek) más que GPU de centro de datos.
- Cabe en GPU de consumo: la variante 1.5B en W6 es viable en GPUs con 4 GB o más; las variantes 7.2B y 13.3B requieren GPUs con 8-16 GB según cuantización, aunque el repositorio no publica cifras exactas por GPU.
- Opciones de despliegue: llama.cpp (GGUF), MLX (macOS/iOS), CoreML, WebRWKV, Palm, QNN, MediaTek, y RWKV Chat 4.8.5 como cliente de referencia.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Enfoque |
|---|---|---|---|---|---|
| HaloWang/rwkv-weights (G1k) | 1.5B-13.3B | 25.600 | RWKV-7 recurrente | Apache 2.0 | Edge multi-backend |
| RWKV-7 oficial (checkpoints base) | 1.5B-13.3B | 25.600 | RWKV-7 recurrente | Apache 2.0 | Entrenamiento y pesos originales |
| Llama 3.2 1B/3B | 1B-3B | 128k | Transformer | Llama Community License | Edge en transformers |
| Qwen2.5 1.5B/3B | 1.5B-3B | 32k | Transformer | Apache 2.0 | Edge en transformers |

La comparación con transformers de tamaño similar es aproximada: el repositorio no publica benchmarks que permitan contrastar calidad. La ventaja estructural de RWKV-7 frente a Llama o Qwen del mismo tamaño es el coste lineal en contexto y la memoria constante, mientras que la desventaja es el menor ecosistema de herramientas y la ausencia de datos de evaluación en esta model card.

## Limitaciones y advertencias

- No se documentan sesgos conocidos; al no haber información sobre la composición del dataset de entrenamiento, no es posible evaluar sesgos de dominio o idioma.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de modelos conversacionales sin datos de evaluación publicados.
- Idiomas soportados no declarados: no se puede garantizar calidad multilingüe más allá de lo que indique el checkpoint original de RWKV.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia de los checkpoints RWKV-7 originales de los que derivan estos artefactos.
- El repositorio es de distribución, no de entrenamiento: los pesos no son originales del autor y cualquier corrección o mejora debe provenir del proyecto RWKV.
- Tamaño del repo de 720,4 GB: la descarga completa no es práctica; debe seleccionarse el artefacto concreto mediante `index.json` y el manifiesto G1k.
- Los paquetes MLX están atados al runtime Swift de RWKV Chat 4.8.5; cambios de versión pueden romper la compatibilidad de configuración.
- Artefactos históricos (G1i, G1j) retirados del catálogo actual de la app: quien dependa de ellos debe fijar la revisión concreta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HaloWang/rwkv-weights
- Índice de descubrimiento (HF): https://huggingface.co/HaloWang/rwkv-weights/resolve/main/index.json
- Índice de descubrimiento (ModelScope): https://modelscope.cn/models/HaloWang1991/rwkv-weights/resolve/master/index.json
- Manifiesto G1k (HF): https://huggingface.co/HaloWang/rwkv-weights/resolve/main/manifests/rwkv7/chat/g1k-20260930-ctx25600-4.8.5-20261010.json
- Manifiesto G1k (ModelScope): https://modelscope.cn/models/HaloWang1991/rwkv-weights/resolve/master/manifests/rwkv7/chat/g1k-20260930-ctx25600-4.8.5-20261010.json
- Notas históricas G1i (HF): https://huggingface.co/HaloWang/rwkv-weights/resolve/main/docs/history/g1i-weight-index-20260822.md
- Notas históricas G1i (ModelScope): https://modelscope.cn/models/HaloWang1991/rwkv-weights/resolve/master/docs/history/g1i-weight-index-20260822.md
- Paquete MLX 1.5B (HF): https://huggingface.co/HaloWang/rwkv-weights/resolve/main/artifacts/rwkv7/chat/1.5b/mlx/rwkv7-g1k-1.5b-20260930-ctx25600-mlx-int6-swift-configfix.zip
- Paquete MLX 2.9B (HF): https://huggingface.co/HaloWang/rwkv-weights/resolve/main/artifacts/rwkv7/chat/2.9b/mlx/rwkv7-g1k-2.9b-20260930-ctx25600-mlx-int6-swift-configfix.zip
- Paquete MLX 7.2B (HF): https://huggingface.co/HaloWang/rwkv-weights/resolve/main/artifacts/rwkv7/chat/7.2b/mlx/rwkv7-g1k-7.2b-20260930-ctx25600-mlx-int6-swift-configfix.zip
- Paquete MLX 13.3B (HF): https://huggingface.co/HaloWang/rwkv-weights/resolve/main/artifacts/rwkv7/chat/13.3b/mlx/rwkv7-g1k-13.3b-20260930-ctx25600-mlx-int6-swift-configfix.zip
