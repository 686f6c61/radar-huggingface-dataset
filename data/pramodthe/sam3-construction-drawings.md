# pramodthe/sam3-construction-drawings

## Resumen

SAM 3 fine-tuned on construction detail drawings es un ajuste fino de investigación del modelo SAM 3 de Meta, desarrollado por el usuario pramodthe, orientado a la segmentación de elementos constructivos en planos de detalle arquitectónicos y de fachada a partir de prompts de texto cortos. El problema que resuelve es concreto: SAM 3 sin ajustar apenas detecta estos elementos en dibujos de líneas, con un mask AP de 0,002 sobre el conjunto de test. Tras entrenar aproximadamente el 5 % de sus parámetros sobre 536 planos etiquetados, el mask AP asciende a 0,617.

El modelo parte del image model de SAM 3 (840,5 M de parámetros) y solo se redistribuyen los pesos ajustados (40,5 M de parámetros, 162 MB en safetensors); los codificadores de imagen y texto congelados se cargan desde `facebook/sam3`. El repositorio ocupa 0,2 GB e incluye utilidades de carga, predicción, evaluación COCO y visualización, además de una demo en Streamlit y un notebook de inicio rápido.

Es relevante ahora porque demuestra que un ajuste fino ligero y asequible (75 minutos en una única RTX 5070 Ti de 16 GB) puede convertir un modelo de segmentación open-vocabulary de propósito general en una herramienta útil para un dominio muy específico donde el modelo base falla por completo. No obstante, se trata de un artefacto de investigación con siete clases y un dataset pequeño, no de un producto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAM 3 (image model) con detector encoder/decoder, vision neck, geometry encoder, scoring head y mask decoder ajustados; vision trunk y text encoder congelados |
| Parametros totales | 840,5 M (modelo base SAM 3) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de visión; resolución de entrada de 1008 px) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (prompts de texto; entrenado con prompts en inglés) |
| Licencia | SAM License (licencia propia de Meta, etiquetada como `other`) |
| Formato de pesos | safetensors (solo parámetros ajustados, 162 MB) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del image model de SAM 3, un segmentador open-vocabulary que combina un vision trunk, un text encoder, un detector con encoder y decoder, un vision neck, un geometry encoder, una scoring head y un mask decoder. En este ajuste se entrenaron 40,5 M de parámetros (4,8 % del total): detector encoder y decoder, vision neck, geometry encoder, scoring head y mask decoder. Permanecen congelados el vision trunk, el text encoder y la semantic segmentation head.

Los datos provienen del dataset "drawing" de Roboflow Universe (licencia CC BY 4.0), con 536 planos de entrenamiento, 153 de validación y 77 de test, y 7 clases. Las imágenes se preescalaron a un lado corto de 1008 px. El entrenamiento consistió en 10 épocas, batch size 1, optimizador AdamW con learning rates de 0,1× los valores por defecto de Meta, autocast bf16 y una única RTX 5070 Ti de 16 GB, con unas 75 minutos y un pico de memoria GPU de unos 10 GB. No se menciona uso de RLHF ni DPO, algo esperable en un modelo de segmentación.

## Capacidades

- Segmentación de instancias open-vocabulary guiada por texto sobre planos de detalle arquitectónicos y de fachada.
- Detección y máscara para siete clases entrenadas: insulation, concrete, double glazed unit, anchor, single glazed unit, laminated glass y cast-in channel.
- Predicción con umbral de confianza configurable (por defecto 0,5 en el ejemplo de uso).
- Evaluación sobre cualquier split en formato COCO cuyos nombres de categoría coincidan con los prompts.
- Generación de superposiciones (overlays) para inspección visual de las máscaras.
- Carga conmutable entre pesos ajustados, ruta local o modelo base (`"base"`).
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso ni procesamiento de audio.

## Casos de uso

- Digitalización de planos de detalle: extraer automáticamente las máscaras de aislantes, hormigón y vidrios de planos escaneados o exportados, para alimentar un inventario de elementos constructivos y facilitar mediciones.
- Verificación de documentación de fachada: comparar las unidades de doble y simple acristalamiento detectadas con la memoria de calidades del proyecto para detectar discrepancias antes de la ejecución.
- Preprocesado para pipelines BIM: usar las máscaras y cajas generadas como entrada para herramientas de reconstrucción o etiquetado semiautomático de elementos en modelos de información de construcción.
- Asistencia al etiquetado: el modelo puede preanotar planos nuevos con las siete clases y reducir el trabajo manual de revisión, aunque requiere validación humana dado su alcance limitado.
- Análisis de detalles de aislamiento: cuantificar la presencia y extensión de insulation (mask AP 0,833, la clase con mejor rendimiento) en conjuntos de planos para estudios comparativos de soluciones constructivas.
- Investigación en segmentación de dominio específico: servir como referencia reproducible de ajuste fino ligero de SAM 3 sobre dibujos de líneas, con scripts de preparación de datos y entrenamiento incluidos.
- Demo interactiva: la aplicación Streamlit permite comparar base frente a ajustado sobre un plano, útil para presentaciones internas o evaluación cualitativa rápida.

## Benchmarks y rendimiento

Test split: 77 planos, 383 objetos etiquetados, nunca vistos en entrenamiento. Métricas COCO usando el nombre de categoría como prompt de texto.

| Metrica | SAM 3 base | Ajustado |
|---|---|---|
| Mask AP | 0,002 | 0,617 |
| Mask AP50 | 0,002 | 0,836 |
| Mask AP75 | 0,002 | 0,703 |
| Box AP | 0,002 | 0,604 |
| Box AP50 | 0,002 | 0,828 |

Mask AP ajustado por clase:

| Prompt | Mask AP |
|---|---|
| insulation | 0,833 |
| concrete | 0,789 |
| double glazed unit | 0,653 |
| anchor | 0,612 |
| single glazed unit | 0,562 |
| laminated glass | 0,540 |
| cast-in channel | 0,333 |

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 4 GB de memoria GPU según el autor.
- GPU recomendada para entrenamiento: una RTX 5070 Ti de 16 GB fue suficiente (pico de unos 10 GB, 75 minutos para 10 épocas).
- Cabe en GPU de consumo: sí, con 4 GB para inferencia y 16 GB para reentrenamiento.
- Se requiere CUDA; el autor indica que es necesaria una GPU CUDA para el uso previsto.
- Despliegue: el repositorio proporciona utilidades Python propias (`sam3_drawings`), una demo Streamlit y scripts de evaluación; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Nota para máquinas con unos 16 GB de RAM: los configs usan `num_train_workers: 0` y se incluye `scripts/memguard.sh` para detener el entrenamiento antes de agotar la memoria del sistema.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Rendimiento en este dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pramodthe/sam3-construction-drawings | 840,5 M totales; 40,5 M ajustados | 1008 px de entrada | Mask AP 0,617 en test propio | SAM License | Hugging Face, requiere aceptar licencia de `facebook/sam3` |
| facebook/sam3 (base) | 840,5 M | No disponible | Mask AP 0,002 en el mismo test | SAM License | Hugging Face, gated |
| Otros ajustes de SAM para planos | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Entrenado con un único dataset pequeño de detalles de fachada y acristalamiento; la precisión será inferior en otros estilos de dibujo, hojas escaneadas o dibujos a mano.
- Solo las siete clases entrenadas son fiables; otros prompts (por ejemplo, membranas impermeabilizantes o remates) se detectan mal o no se detectan.
- `cast-in channel` es escasa en los datos y presenta la precisión más baja (mask AP 0,333).
- Uso exclusivamente de investigación: los resultados no deben emplearse para decisiones de construcción, cumplimiento normativo o seguridad.
- Licencia SAM License, derivada de SAM 3; es necesario aceptar la licencia del modelo base en Hugging Face y autenticarse antes de cargarlo.
- El modelo base `facebook/sam3` está restringido (gated), lo que condiciona la distribución y el despliegue.
- El dataset de entrenamiento (CC BY 4.0) no se redistribuye en el repositorio, salvo dos figuras de ejemplo.
- Riesgo de alucinación de máscaras en regiones ambiguas de planos con líneas densas; se recomienda validación humana.
- Sesgos específicos del dataset de origen no documentados por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pramodthe/sam3-construction-drawings
- Modelo base SAM 3: https://huggingface.co/facebook/sam3
- Repositorio de entrenamiento de SAM 3: https://github.com/facebookresearch/sam3
- Dataset de origen en Roboflow Universe: https://universe.roboflow.com/my-workspace-jbnon/drawing-ng6gh
- Licencia Creative Commons del dataset: https://creativecommons.org/licenses/by/4.0/
- Paper de SAM 3 (referencia arXiv en las etiquetas): arxiv:2511.16719
