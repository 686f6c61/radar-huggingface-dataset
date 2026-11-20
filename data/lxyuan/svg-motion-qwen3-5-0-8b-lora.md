# lxyuan/SVG-Motion-Qwen3.5-0.8B-LoRA

## Resumen

SVG-Motion-Qwen3.5-0.8B-LoRA es un adaptador LoRA desarrollado por lxyuan que se monta sobre el modelo base Qwen/Qwen3.5-0.8B para anadir animacion nativa a dibujos SVG existentes. El modelo recibe como entrada el codigo fuente de un SVG junto con una instruccion de movimiento en lenguaje natural y devuelve un SVG completo con etiquetas `animate` o `animateTransform` insertadas, preservando todos los elementos, IDs y atributos originales. Es un caso de text-to-code puro: no procesa pixeles ni video.

El adaptador es relevante por su enfoque acotado y verificable: en 100 tareas sinteticas de test controladas, el modelo base sin adaptar paso 0/100 comprobaciones completas de animacion, mientras que el adaptador paso 100/100 con las mismas entradas y ajustes de decodificacion. Esto ilustra como un ajuste fino pequeno (10,8 millones de parametros entrenables sobre un modelo de 0,8B) puede inducir una capacidad especifica que el modelo base no exhibe.

El modelo base Qwen3.5-0.8B incluye un componente de vision en su arquitectura, pero este experimento entrena unicamente adaptadores del lado del lenguaje y no evalua entradas de imagen. La licencia es Apache-2.0 tanto para el adaptador como para el dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer Qwen3.5 (adaptadores en atencion, MLP y proyecciones de atencion lineal) |
| Parametros totales | 10.822.656 parametros entrenables (adaptador); base Qwen3.5-0.8B congelado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (maximo configurado en entrenamiento; sin truncamiento) |
| Tipos de cuantizacion | no disponible (pesos en float32; inferencia con autocast fp16) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA), libreria peft |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16, alpha 32 y dropout 0, aplicado sobre las capas de atencion, MLP y proyecciones de atencion lineal del modelo Qwen3.5-0.8B (revision congelada `2fc06364715b967f1860aea9cf38778875588b17`). Los pesos se mantienen en float32; el entrenamiento usa float32 porque una prueba inicial en fp16 sobre T4 produjo gradientes no finitos. La inferencia usa autocast fp16.

El dataset es procedural y propio: 1.000 filas de entrenamiento, 100 de validacion y 100 de test, con familias de dibujo y combinaciones de movimiento disjuntas entre splits y sin duplicados exactos de entrada/instruccion. Cada ejemplo combina `input_svg` e `instruction` en la plantilla de chat nativa, con `target_svg` como objetivo del asistente. La perdida de entropia cruzada causal se aplica solo a los tokens del objetivo del asistente (prompt y padding con etiqueta -100). El modo thinking esta desactivado tanto en el baseline como en la inferencia adaptada.

La ejecucion principal consistio en 100 pasos de optimizador (0,40 epoch), batch 1 con acumulacion 4, learning rate 1e-4, 5 pasos de warmup, decaimiento coseno, AdamW, activation checkpointing y semilla 20261120. Se ejecuto en una Tesla T4 con 512,1 segundos de tiempo de entrenamiento y 5,00 GiB de memoria GPU maxima registrada. El checkpoint `checkpoint-100` se selecciono por la menor perdida de tokens en los primeros 20 ejemplos fijos de validacion; el conjunto de test no participo en la seleccion.

## Capacidades

- Generacion de codigo SVG animado a partir de un SVG fuente y una instruccion de movimiento textual.
- Insercion de animaciones de traslacion, rotacion, escalado y opacidad, incluyendo movimientos simultaneos y un pico mantenido.
- Preservacion estricta de la estructura original: elementos, IDs y atributos del dibujo de entrada.
- Uso de etiquetas nativas SVG `animate` y `animateTransform`.
- Salida de codigo fuente SVG completo, no video renderizado.
- Idioma de trabajo: ingles (instrucciones y gramatica de tareas en ingles).
- Sin soporte de tool calling, agentes ni razonamiento multi-paso documentado.
- Sin evaluacion de entradas de imagen pese a que la arquitectura base incluye vision.

## Casos de uso

- Prototipado de animaciones web: dado un icono o ilustracion SVG existente y una instruccion como "rota 45 grados y vuelve", el modelo genera el SVG animado listo para validar en navegador, acelerando el diseno de microinteracciones.
- Generacion de assets animados en pipelines de documentacion: insertar animaciones en diagramas SVG de manuales tecnicos sin edicion manual de codigo, siempre que la salida pase por el validador del repositorio.
- Educacion y demostraciones de text-to-code: el experimento sirve como caso de estudio reproducible de como un LoRA de 10,8M parametros induce una capacidad concreta en un modelo de 0,8B, con evidencia completa de test y TensorBoard.
- Automatizacion de tareas repetitivas de animacion: para conjuntos de SVGs con gramatica de movimiento fija (traslacion, rotacion, escala, opacidad), el adaptador puede generar variantes de animacion de forma consistente.
- Investigacion sobre evaluacion verificable: el pipeline de evaluacion con renderizado en navegador (Playwright) y tolerancias numericas concretas sirve de plantilla para medir calidad de codigo generado con criterios objetivos.
- Base para experimentos de ajuste fino: el codigo de entrenamiento publico y el dataset permiten replicar el setup y extenderlo a nuevas gramaticas de animacion o idiomas.

## Benchmarks y rendimiento

| Modelo | Tareas completas superadas |
|---|---:|
| Base sin adaptar (Qwen3.5-0.8B) | 0/100 |
| Adaptador LoRA | 100/100 |

La evaluacion exige SVG valido y seguro, estructura del dibujo original sin cambios y movimiento renderizado en navegador dentro de tolerancia en las fracciones de ciclo 0, 0,13, 0,39, 0,50, 0,61, 0,80, 0,99 y 1,25. Tolerancias: coeficientes de matriz 0,015, traslacion 0,5 unidades SVG, opacidad efectiva 0,02. Decodificacion greedy con limite de 1.024 tokens de salida y lotes de cuatro en ambos brazos, sin bucle de reparacion ni exclusion de casos.

El autor advierte que son tareas sinteticas estrechas con fraseo fijo y reglas de movimiento repetitivas; los resultados no establecen calidad general de animacion, soporte de SVG arbitrario, robustez a parafraseo ni superioridad frente a modelos mayores. La perdida de tokens es una metrica separada del exito de tarea. Las predicciones de test y los eventos de TensorBoard estan incluidos en `evidence/`.

## Requisitos de hardware

- VRAM estimada: el entrenamiento registro 5,00 GiB de memoria GPU maxima en una Tesla T4; la inferencia con autocast fp16 sobre el modelo base de 0,8B deberia requerir menos, aunque no se publica una cifra especifica de inferencia.
- GPU recomendadas: el autor valido el flujo en Tesla T4; cualquier GPU CUDA con al menos ~5 GiB libres deberia bastar para el camino probado.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 6-8 GB o mas de VRAM, aunque no hay medicion publicada para RTX 4090, RTX 3060 u otras.
- Despliegue: el camino probado usa Transformers 5.23.0 + PEFT 0.22.0 con `Qwen3_5ForConditionalGeneration` y `attn_implementation="sdpa"`. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El entrenamiento completo tardo 512,1 segundos en T4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SVG-Motion-Qwen3.5-0.8B-LoRA | 10,8M entrenables (base 0,8B) | 2.048 tokens | LoRA para animacion SVG | apache-2.0 | Hugging Face (adaptador PEFT) |
| Qwen3.5-0.8B (base) | 0,8B | no disponible en la informacion | Modelo generalista multimodal | no disponible en la informacion | Hugging Face |
| Alternativas especializadas en generacion de SVG animado | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros adaptadores o modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Ambito muy estrecho: tareas sinteticas con fraseo fijo y gramatica de movimiento limitada (traslacion, rotacion, escala, opacidad); no se ha evaluado robustez a parafraseo ni SVG arbitrarios.
- El codigo generado es no confiable: debe validarse con el validador del repositorio y renderizarse en sandbox antes de cualquier uso; no incrustar salida sin verificar en aplicaciones.
- Solo ingles: el dataset y las instrucciones estan en ingles.
- Contexto limitado a 2.048 tokens configurados; SVGs grandes o instrucciones largas pueden excederlo.
- El modelo base incluye vision pero el adaptador no fue entrenado ni evaluado con imagenes.
- Riesgo de alucinacion en la estructura SVG: aunque la evaluacion comprueba preservacion estricta de elementos, IDs y atributos, fuera del dominio de test no hay garantia.
- Sesgos: no documentados en la informacion disponible.
- Uso comercial permitido por Apache-2.0, pero el autor no ofrece garantias sobre calidad fuera del dominio evaluado.
- Requiere versiones concretas de librerias (torch 2.14.1+cu130, transformers 5.23.0, peft 0.22.0, datasets 5.2.0, accelerate 1.16.0, playwright 1.58.0) y GPU CUDA para el camino probado.
- El modo thinking debe permanecer desactivado, como en el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lxyuan/SVG-Motion-Qwen3.5-0.8B-LoRA
- Demo comparativa en vivo: https://huggingface.co/spaces/lxyuan/svg-motion-lab
- Codigo de entrenamiento: https://github.com/LxYuan0420/svg-motion-lab/blob/main/train.py
- Dataset: https://huggingface.co/datasets/lxyuan/svg-motion-lab
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
