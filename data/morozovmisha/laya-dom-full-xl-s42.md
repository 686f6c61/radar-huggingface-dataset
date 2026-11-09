# morozovmisha/laya-dom-full-xl-s42

## Resumen

`laya-dom-full-xl-s42` es un checkpoint de investigación desarrollado por el usuario de Hugging Face `morozovmisha` a partir del modelo base `convaiinnovations/laya`, un motor de decisión tipada. Se trata de un ajuste fino del encoder completo orientado a una tarea muy concreta: el emparejamiento por pares de elementos DOM. Dado un elemento de referencia (baseline) y un candidato extraídos de dos versiones de una misma página web, el modelo decide si ambos describen el mismo elemento funcional (`EQUIVALENT`) o no (`NOT_EQUIVALENT`).

El modelo parte del encoder `jhu-clsp/mmBERT-base` (arquitectura ModernBERT, 22 capas, dimensión oculta 768, vocabulario de 256k) y añade una cabeza de decisión compuesta por 2 capas transformer más un scorer. El resultado es un checkpoint de 321,9 millones de parámetros, todos entrenables, distribuido en safetensors con un tamaño de repositorio de 0,7 GB y licencia Apache 2.0.

La relevancia de este checkpoint es acotada pero específica: aborda el problema de la localización robusta de elementos en pruebas de interfaz web, donde los selectores frágiles se rompen ante reestilizados, reescrituras de texto o reubicaciones. El autor lo presenta explícitamente como un checkpoint de investigación, no como un parser DOM general ni como un sistema completo de recuperación de localizadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder) con cabeza de decisión de 2 capas transformer más scorer |
| Parametros totales | 321.908.998 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens de secuencia máxima; presupuesto de cabeza de 256 |
| Tipos de cuantizacion | no disponible (checkpoint en bf16) |
| Idiomas soportados | no disponible (el modelo base es la variante multilingüe de Laya) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (state dict de agente RL de Laya, no es un checkpoint `save_pretrained` de Transformers) |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT de 22 capas con dimensión oculta 768 y vocabulario de 256k tokens, heredado de `jhu-clsp/mmBERT-base`. Sobre él se monta una cabeza de decisión de 2 capas transformer más un scorer que produce una distribución de probabilidad sobre las opciones de respuesta definidas en la consulta. La inferencia no es autoregresiva: el modelo emite directamente la elección entre `same_element` y `different_element` con sus probabilidades asociadas.

El entrenamiento se realizó sobre un corpus sintético de pares DOM de 9.000 pares, dividido en 7.217 para entrenamiento y 1.783 reservados para evaluación, agrupados por identidad de elemento para evitar filtración. La receta empleada es RLCD durante 4 épocas con 4 candidatos muestreados por ítem, con tasas de aprendizaje de 5e-6 para el encoder y 5e-5 para la cabeza, precisión bf16, longitud máxima de secuencia de 1024 y presupuesto de cabeza de 256. El entrenamiento se ejecutó en una única RTX A4000 de 16 GB en aproximadamente 26 minutos, con semilla 42. No se documentan fases de RLHF ni DPO adicionales.

## Capacidades

- Clasificación binaria de equivalencia funcional entre dos descripciones de elementos DOM (etiqueta, texto, selector, atributos y tokens de clase).
- Integración de una señal algorítmica previa con puntuación global y desglose por factores (texto, atributos, estructura, etiqueta, geometría) como entrada adicional al modelo.
- Decisión tipada mediante el esquema de `questions` con tipo `choice`, criterios definidos y salida de probabilidades por opción.
- Inferencia por lotes mediante `agent.predict_batch` con tamaño de lote configurable.
- Soporte de parámetro `lang` en la llamada de predicción, aunque los idiomas efectivamente soportados no están documentados.
- No es un modelo generativo: no produce texto libre ni razonamiento en cadena, solo la elección y sus probabilidades.

## Casos de uso

- Estabilización de suites de pruebas end-to-end: dado un localizador que funcionaba en una versión anterior de la página y un candidato en la nueva versión, el modelo decide si siguen apuntando al mismo control, reduciendo roturas por reestilizado o reescritura de texto.
- Migración de selectores entre rediseños: cuando una página cambia clases CSS, envuelve elementos o renombra atributos de prueba, el modelo permite validar automáticamente qué candidatos preservan el propósito funcional del elemento original.
- Deduplicación de localizadores en un mismo DOM: para pares de elementos de la misma página, el modelo ayuda a determinar si dos descripciones corresponden a un único control o a controles distintos con apariencia similar.
- Auditoría de cobertura de atributos de prueba: al comparar pares con y sin `data-testid`, el modelo permite evaluar la robustez de la estrategia de localización de un sitio antes de eliminar atributos de prueba heredados.
- Enriquecimiento de pipelines de grabación y reproducción: en herramientas que capturan interacciones de usuario, el modelo puede verificar que el elemento objetivo sigue siendo el mismo entre la grabación y la reproducción sobre una versión posterior de la aplicación.
- Investigación en localización web: como checkpoint de referencia para experimentos de emparejamiento de elementos, comparación de variantes de ajuste (encoder completo frente a top-4) y estudio de calibración en datos reales.

## Benchmarks y rendimiento

Resultados de precisión a nivel de par sobre datos sintéticos reservados y páginas reales, según la model card:

| Benchmark | Pares | Precisión |
|---|---:|---:|
| Generator A XL, reservado | 1.783 | 98,37% |
| Generator B | 792 | 90,78% |
| Páginas reales, 13 sitios | 770 | 96,75% |
| Control de sufijo | 792 | 97,22% |

El conjunto de páginas reales contiene 770 pares de 13 sitios; en 756 de los 770 pares está ausente `data-testid`. La variante de ajuste eficiente en parámetros top-4 colapsa sobre este conjunto (42,21%), por lo que el autor recomienda este checkpoint de encoder completo para transferencia.

## Requisitos de hardware

- El checkpoint pesa 643,8 MB en safetensors, por lo que la inferencia en bf16 requiere del orden de 1,3 GB de VRAM solo para pesos, más el coste de activaciones para secuencias de hasta 1024 tokens.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y similares; también puede ejecutarse en CPU, como muestra el ejemplo de la model card con `device="cpu"`.
- Para entrenamiento, el autor empleó una única RTX A4000 de 16 GB, lo que indica que el ajuste fino completo es viable en hardware de gama media profesional.
- El despliegue se realiza mediante el paquete `laya` (versión 0.4.29 en el ejemplo), no mediante `transformers.AutoModel.from_pretrained`; no se documentan opciones para vLLM, llama.cpp, Ollama ni TGI.
- No se publican datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| morozovmisha/laya-dom-full-xl-s42 | 321,9 M | 1024 tokens | Emparejamiento de elementos DOM | apache-2.0 | Hugging Face |
| convaiinnovations/laya (base) | no disponible | no disponible | Motor de decisión tipada | no disponible | Hugging Face |
| Variante top-4 de Laya DOM | no disponible | no disponible | Emparejamiento de elementos DOM | no disponible | Referenciada en la model card |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Checkpoint de investigación: el autor recomienda validarlo en el sitio propio antes de usarlo en producción.
- La evaluación en páginas reales se limita a 770 pares de 13 sitios, y los pares de una misma página están correlacionados, lo que reduce la independencia efectiva de la muestra.
- El comportamiento depende de la representación de atributos del DOM: `data-testid` está ausente en 756 de los 770 pares reales, el control de eliminación bilateral cubre solo una familia de 155 pares y no se ejecutó un control sobre el corpus completo.
- No se midieron la calibración ni la ablación de entradas.
- No se evaluó sobre frameworks arbitrarios, shadow DOM ni páginas con renderizado dinámico fuera del conjunto recogido.
- El modelo no es un parser DOM general ni un sistema completo de recuperación de localizadores.
- `model.safetensors` es un state dict de agente RL de Laya, no un checkpoint de Transformers; debe cargarse con el paquete `laya` y mantenerse la estructura del repositorio sin cambios.
- No se documentan sesgos conocidos ni riesgos específicos de alucinación más allá de los propios de un clasificador; al no ser generativo, el riesgo de alucinación de texto libre no aplica, pero sí el de clasificaciones erróneas con alta confianza.
- La licencia Apache 2.0 permite uso comercial, pero las limitaciones de validación descritas desaconsejan su despliegue directo sin evaluación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/morozovmisha/laya-dom-full-xl-s42
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Encoder: https://huggingface.co/jhu-clsp/mmBERT-base
- Paper de referencia citado en la model card: PKM-2026 (no se proporciona URL en la información disponible)
