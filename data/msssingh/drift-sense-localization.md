# msssingh/drift-sense-localization

## Resumen

Drift-Sense Localization es un modelo de localización de patrones para imágenes de microscopía electrónica de barrido (SEM) en la industria de semiconductores. Desarrollado por msssingh, resuelve el problema de encontrar un patrón de referencia ampliado (100x, 1 nm/px) dentro de una imagen de búsqueda a menor aumento (10x, 10 nm/px) y devolver sus coordenadas en píxeles, lo que permite corregir errores de deriva de la etapa en herramientas de inspección de obleas. El modelo se entrenó con 400 pares sintéticos de SEM FinFET basados en la geometría IRDS 2024, con ruido, desenfoque, rotación de hasta ±2° y deriva de etapa de 100 a 500 nm.

El repositorio incluye dos enfoques: una CNN siamesa de correlación (aproximadamente 6 millones de parámetros) que alcanza una precisión sub-píxel (error medio de 0,50 px) y un adaptador LoRA de rango 8 sobre el modelo base Qwen3.5-4B (cuantizado a 4 bits con MLX) que se presenta como un resultado negativo honesto: aprende el formato de salida pero no logra precisión a nivel de píxel. La relevancia actual radica en ofrecer una solución práctica y de bajo coste computacional para la alineación automática en inspección de semiconductores, donde los métodos tradicionales de correlación fallan debido a la periodicidad de la estructura del chip.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN siamesa de correlación (Siamese correlation CNN) + adaptador LoRA (rank 8) sobre Qwen3.5-4B |
| Parametros totales | CNN: ~6M; adaptador LoRA: no especificado (rank 8 sobre base de 4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (para el VLM depende del modelo base Qwen3.5-4B, no especificado) |
| Tipos de cuantizacion | Modelo base MLX 4-bit (Qwen3.5-4B-MLX-4bit); adaptador LoRA en safetensors sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | CNN: PyTorch state_dict (.pt); LoRA: safetensors + adapter_config.json |

## Arquitectura y entrenamiento

La CNN siamesa de correlación procesa pares de imágenes (referencia y búsqueda) y genera un mapa de calor de localización. Incluye un mapa de sesgo de posición aprendible que resuelve la ambigüedad causada por la periodicidad de la estructura (9 cruces de riel idénticas en la matriz). Se entrena con softmax cross-entropy sobre el mapa de calor completo, de modo que los picos compiten entre sí. El refinamiento sub-píxel se realiza mediante correlación de fase, alcanzando un error medio de aproximadamente 5 nm (0,5 px a 10 nm/px). El adaptador LoRA sobre Qwen3.5-4B se entrenó con el mismo objetivo pero no superó el baseline ciego de punto nominal (34,9 px), quedando en 35,79 px de error medio. Los datos de entrenamiento son 400 pares sintéticos con ruido, desenfoque, rotación y deriva simulados; no se especifica el número de tokens ni el proceso de entrenamiento del VLM más allá de que se usó mlx-vlm.

## Capacidades

- Localización de patrones en imágenes SEM: encuentra un patrón de referencia dentro de una imagen de búsqueda y devuelve coordenadas (x, y) en píxeles.
- Precisión sub-píxel con refinamiento por correlación de fase (error medio ~0,5 px, es decir ~5 nm).
- Manejo de ambigüedad periódica mediante mapa de sesgo aprendible y competición de picos en el mapa de calor.
- Estimación de confianza basada en la masa de probabilidad cerca del pico elegido; los empates se resuelven hacia el centro de la imagen.
- El adaptador LoRA sobre Qwen3.5-4B genera respuestas en formato textual estructurado ("Pattern found at (x, y). Confidence: high") con 0% de fallos de parseo, aunque sin precisión útil.
- No se reportan capacidades de tool calling, agentes, razonamiento multi-paso ni otras tareas de lenguaje; el modelo está especializado únicamente en localización de imágenes.

## Casos de uso

- Alineación automática de obleas en inspección SEM: la CNN localiza el patrón de referencia en la imagen de búsqueda y corrige la deriva de la etapa en tiempo real, con un coste de 0,05 s por par, lo que permite integrarla en sistemas de control de herramientas de inspección.
- Recuperación de errores de navegación en herramientas de metrología: cuando el sistema pierde la posición nominal, el modelo reencuentra la región de interés y devuelve coordenadas con precisión nanométrica.
- Verificación de patrones periódicos en fabricación de semiconductores: la capacidad de distinguir entre múltiples coincidencias idénticas (gracias al mapa de sesgo) evita falsos positivos en estructuras repetitivas.
- Automatización de revisión de imágenes SEM: el modelo puede procesar lotes de pares de imágenes sin intervención humana, generando informes de localización y confianza.
- Entrenamiento de modelos VLM para tareas de localización: el adaptador LoRA sirve como referencia negativa para investigar los límites de los modelos de lenguaje multimodal en tareas de precisión espacial.
- Prototipado rápido en entornos de investigación: al estar licenciado bajo Apache 2.0 y ser ligero (6M parámetros), puede integrarse en pipelines de Python sin necesidad de GPU dedicada.

## Benchmarks y rendimiento

Resultados sobre el conjunto de prueba retenido (50 pares):

| Modelo | Error medio (px) | ≤1 px | ≤5 px | Tiempo (s/par) |
|---|---|---|---|---|
| CNN siamesa + refinamiento sub-píxel | 0,50 | 96% | 98% | 0,05 |
| CNN siamesa (solo coarse) | 2,51 | 10% | 96% | 0,04 |
| Qwen3.5-4B LoRA | 35,79 | 0% | 0% | 1,83 |
| Baseline ciego (punto nominal) | 34,9 | - | - | - |

Nota: 1 px = 10 nm. Con refinamiento por correlación de fase, el error medio de la CNN es de ~5 nm. El VLM no supera el baseline ciego.

## Requisitos de hardware

- CNN siamesa (~6M parámetros): ejecutable en CPU sin GPU; el tiempo de inferencia es de 0,05 s por par en hardware no especificado, presumiblemente una CPU moderna.
- Adaptador LoRA sobre Qwen3.5-4B cuantizado a 4 bits: requiere una GPU con al menos 4 GB de VRAM para cargar el modelo base (estimación razonable para un modelo de 4B en 4 bits, aunque no se proporciona el dato exacto). En Apple Silicon puede ejecutarse con MLX.
- Opciones de despliegue: la CNN puede integrarse en cualquier framework PyTorch; el VLM requiere mlx-vlm (para Apple Silicon) o un runtime compatible con MLX. No se mencionan vLLM, llama.cpp u Ollama.
- Latencia: la CNN es adecuada para aplicaciones en tiempo real (0,05 s/par); el VLM es más lento (1,83 s/par) y no se recomienda para uso en producción.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (localización de patrones SEM). El propio repositorio compara la CNN con el baseline ciego y con el adaptador LoRA, pero no hay alternativas de terceros documentadas. Se puede considerar que la CNN siamesa supera ampliamente al enfoque VLM y al baseline, pero no hay datos de otros sistemas de alineación de obleas.

## Limitaciones y advertencias

- Entrenado exclusivamente con imágenes SEM sintéticas; no ha sido validado con datos reales de SEM, por lo que su rendimiento en condiciones reales puede degradarse.
- Asume que la deriva se mantiene dentro de ±50 px de la posición nominal; fuera de ese rango el modelo podría fallar.
- La rotación se maneja implícitamente hasta ±2°, pero no se proporciona una estimación del ángulo de rotación.
- El adaptador LoRA sobre Qwen3.5-4B no es útil para localización precisa (error medio de 35,79 px); solo sirve como demostración de un resultado negativo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está validado en entornos de producción reales.
- No se especifican sesgos conocidos ni riesgos de alucinación; al ser un modelo de visión, el riesgo principal es la generación de localizaciones incorrectas con alta confianza en casos ambiguos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/msssingh/drift-sense-localization
- Repositorio de entrenamiento (mencionado en la model card): https://github.com/bardrop/drift-sense
- Repositorio alternativo de Drift-Sense: https://github.com/deepekshabasin-debug/Drift-Sense---AI-model-for-Semicon-Industries
- Otro repositorio de Drift-Sense: https://github.com/saisingh7781/Drift-Sense/blob/main/README.md
- Vídeo de presentación (SEMICON India Hackathon 2026): https://www.youtube.com/watch?v=r5-AD-XFIPQ
- Webinar sobre el problema (Applied Materials): https://www.youtube.com/watch?v=I_mYBGeoiXA
